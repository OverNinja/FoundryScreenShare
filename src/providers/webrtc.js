import { StreamProvider } from "./base.js";
import { getIceServersConfig } from "../webrtc/ice.js";
import { MAX_RETRIES, RETRY_INTERVAL } from "../constants.js";
import { getScreenContainer, resolveContainerSettings } from "../helpers.js";

/**
 * Concrete Stream Provider using WebRTC peer connections to broadcast
 * captured display streams to all players.
 * @extends {StreamProvider}
 */
export class WebRTCStreamProvider extends StreamProvider {
  /** @type {MediaStream|null} */
  #stream = null;
  /** @type {Function|null} */
  #onEndedCallback = null;
  /** @type {Map<string, {peerConnection: RTCPeerConnection, connectionState: string, retryCount: number, lastActive: number}>} */
  #peers = new Map();

  constructor(onEndedCallback) {
    super();
    this.#onEndedCallback = onEndedCallback;
  }

  /** @override */
  async startStream() {
    if (this.#stream) return this.#stream;

    if (!navigator.mediaDevices) {
      const errorMsg = "Screen sharing is not supported in this browser context. It requires a secure context (HTTPS or localhost).";
      ui.notifications.error(errorMsg);
      throw new Error(errorMsg);
    }

    const activeScene = game.scenes.active;
    const containerDoc = activeScene ? getScreenContainer(activeScene) : null;
    const resolved = resolveContainerSettings(containerDoc);
    const maxFramerate = resolved.maxFramerate;
    const maxResolution = resolved.maxResolution;

    const videoConstraints = {};
    if (maxFramerate > 0) {
      videoConstraints.frameRate = { max: maxFramerate };
    }
    if (maxResolution === "720p") {
      videoConstraints.height = { max: 720 };
    } else if (maxResolution === "1080p") {
      videoConstraints.height = { max: 1080 };
    }

    const constraints = {
      video: Object.keys(videoConstraints).length > 0 ? videoConstraints : true,
      audio: false
    };

    console.log("Screen Share | Starting WebRTC stream with constraints:", constraints);

    try {
      this.#stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    } catch (err) {
      throw err;
    }

    const videoTrack = this.#stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.addEventListener("ended", () => {
        if (this.#onEndedCallback) this.#onEndedCallback();
      });
    }

    // Connect to all active players
    const activePlayers = game.users.filter(u => !u.isGM && u.active);
    for (const player of activePlayers) {
      this.initiateConnection(player.id).catch(err => {
        console.error(`Screen Share | Failed to initiate connection for player ${player.name}:`, err);
      });
    }

    return this.#stream;
  }

  /** @override */
  async stopStream() {
    console.log("Screen Share | GM stopping stream and disconnecting all peers.");
    this.#onEndedCallback = null;

    // 1. Send "disconnect" action over the socket to all connected players
    game.socket.emit("module.screen-share", {
      action: "disconnect",
      senderId: game.user.id,
      receiverId: null,
      data: null
    });

    // 2. Close peer connections
    for (const [playerId, peerInfo] of this.#peers.entries()) {
      try {
        peerInfo.peerConnection.close();
      } catch (err) {
        console.error(`Screen Share | Error closing connection for peer ${playerId}:`, err);
      }
    }
    this.#peers.clear();

    // 3. Stop local media tracks
    if (this.#stream) {
      for (const track of this.#stream.getTracks()) {
        track.stop();
      }
      this.#stream = null;
    }
  }

  /** @override */
  get isActive() {
    return this.#stream !== null && this.#stream.getVideoTracks().some(t => t.readyState === "live");
  }

  async initiateConnection(playerId) {
    if (!this.#stream) {
      console.warn("Screen Share | [GM] Cannot initiate connection: stream is not active.");
      return;
    }

    console.log(`Screen Share | [GM] Initiating peer connection to player ${playerId}`);

    if (this.#peers.has(playerId)) {
      console.log(`Screen Share | [GM] Peer connection already exists for ${playerId}, closing and recreating.`);
      const existing = this.#peers.get(playerId);
      if (existing.peerConnection) {
        existing.peerConnection.close();
      }
      this.#peers.delete(playerId);
    }

    const iceServers = getIceServersConfig();
    console.log(`Screen Share | [GM] Creating RTCPeerConnection for player ${playerId} with ICE:`, iceServers);
    const pc = new RTCPeerConnection({ iceServers });

    const peerInfo = {
      peerConnection: pc,
      connectionState: "new",
      retryCount: 0,
      lastActive: Date.now(),
      iceCandidateQueue: []
    };
    this.#peers.set(playerId, peerInfo);

    console.log(`Screen Share | [GM] Adding ${this.#stream.getTracks().length} tracks to player ${playerId}'s connection`);
    for (const track of this.#stream.getTracks()) {
      console.log(`Screen Share | [GM] Adding track to PC: kind=${track.kind}, id=${track.id}`);
      pc.addTrack(track, this.#stream);
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`Screen Share | [GM] Generated ICE candidate for player ${playerId}:`, event.candidate.candidate);
        game.socket.emit("module.screen-share", {
          action: "candidate",
          senderId: game.user.id,
          receiverId: playerId,
          data: event.candidate
        });
      } else {
        console.log(`Screen Share | [GM] ICE candidate gathering complete for player ${playerId}`);
      }
    };

    pc.onconnectionstatechange = () => {
      peerInfo.connectionState = pc.connectionState;
      peerInfo.lastActive = Date.now();
      console.log(`Screen Share | [GM] Connection state changed for player ${playerId}: ${pc.connectionState}`);
      console.log(`Screen Share | [GM] Signaling state: ${pc.signalingState}, ICE gathering state: ${pc.iceGatheringState}`);

      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.handlePeerConnectionDrop(playerId);
      } else if (pc.connectionState === "connected") {
        peerInfo.retryCount = 0;
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log(`Screen Share | [GM] ICE gathering state changed for player ${playerId}: ${pc.iceGatheringState}`);
    };

    let offer;
    try {
      console.log(`Screen Share | [GM] Creating SDP offer for player ${playerId}...`);
      offer = await pc.createOffer();
      console.log(`Screen Share | [GM] Setting local description (offer) for player ${playerId}...`);
      await pc.setLocalDescription(offer);
      console.log(`Screen Share | [GM] Local description (offer) set successfully for player ${playerId}.`);
    } catch (err) {
      console.error(`Screen Share | [GM] Failed to create/set local offer for ${playerId}:`, err);
      return;
    }

    console.log(`Screen Share | [GM] Sending SDP offer to player ${playerId} via socket...`);
    game.socket.emit("module.screen-share", {
      action: "offer",
      senderId: game.user.id,
      receiverId: playerId,
      data: offer
    });
  }

  handlePeerConnectionDrop(playerId) {
    const peerInfo = this.#peers.get(playerId);
    if (!peerInfo) return;

    if (peerInfo.retryCount < MAX_RETRIES) {
      peerInfo.retryCount++;
      console.warn(`Screen Share | GM connection to player ${playerId} dropped. Retrying (${peerInfo.retryCount}/${MAX_RETRIES}) in ${RETRY_INTERVAL / 1000}s...`);
      setTimeout(() => {
        if (this.#stream && this.#peers.has(playerId)) {
          const currentPeerInfo = this.#peers.get(playerId);
          if (currentPeerInfo.connectionState === "disconnected" || currentPeerInfo.connectionState === "failed") {
            this.initiateConnection(playerId).catch(err => {
              console.error(`Screen Share | GM reconnection attempt failed for ${playerId}:`, err);
            });
          }
        }
      }, RETRY_INTERVAL);
    } else {
      console.error(`Screen Share | GM connection to player ${playerId} failed permanently.`);
    }
  }

  async handleSignaling(senderId, action, data) {
    const peerInfo = this.#peers.get(senderId);
    console.log(`Screen Share | [GM] Handling signaling action=${action} from player=${senderId}`);

    switch (action) {
      case "request-offer":
        console.log(`Screen Share | [GM] Received request-offer from late-joining/reconnecting player ${senderId}`);
        await this.initiateConnection(senderId);
        break;
      case "answer":
        if (peerInfo) {
          try {
            console.log(`Screen Share | [GM] Setting remote description (answer) from player ${senderId}...`);
            await peerInfo.peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            console.log(`Screen Share | [GM] Remote description (answer) set successfully for player ${senderId}.`);
            
            // Process any queued ICE candidates received while remote description was not set
            if (peerInfo.iceCandidateQueue && peerInfo.iceCandidateQueue.length > 0) {
              console.log(`Screen Share | [GM] Processing ${peerInfo.iceCandidateQueue.length} queued early ICE candidates for player ${senderId}`);
              for (const candidate of peerInfo.iceCandidateQueue) {
                console.log(`Screen Share | [GM] Applying queued candidate to player ${senderId}:`, candidate.candidate);
                await peerInfo.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
                  console.error(`Screen Share | [GM] Failed to add queued ICE candidate for player ${senderId}:`, err);
                });
              }
              peerInfo.iceCandidateQueue = [];
            }
          } catch (err) {
            console.error(`Screen Share | [GM] Failed to set remote description (answer) for player ${senderId}:`, err);
          }
        } else {
          console.warn(`Screen Share | [GM] Received SDP answer from unknown peer ${senderId}`);
        }
        break;
      case "candidate":
        if (peerInfo) {
          if (!peerInfo.peerConnection.remoteDescription) {
            console.log(`Screen Share | [GM] Queuing ICE candidate for player ${senderId} because remote description is not set.`);
            if (!peerInfo.iceCandidateQueue) {
              peerInfo.iceCandidateQueue = [];
            }
            peerInfo.iceCandidateQueue.push(data);
          } else {
            try {
              console.log(`Screen Share | [GM] Adding ICE candidate from player ${senderId}:`, data.candidate);
              await peerInfo.peerConnection.addIceCandidate(new RTCIceCandidate(data));
            } catch (err) {
              console.error(`Screen Share | [GM] Failed to add ICE candidate for player ${senderId}:`, err);
            }
          }
        } else {
          console.warn(`Screen Share | [GM] Received ICE candidate from unknown peer ${senderId}`);
        }
        break;
    }
  }
}
