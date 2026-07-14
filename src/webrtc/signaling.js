import { getIceServersConfig } from "./ice.js";
import { session } from "../rendering/session.js";
import { getScreenContainer } from "../helpers.js";
import { MAX_RETRIES, RETRY_INTERVAL } from "../constants.js";

// Player-side WebRTC signaling variables
let _playerPeerConnection = null;
let _playerGMId = null;
let _playerReconnectTimeout = null;
let _playerRetryCount = 0;
let _playerIceCandidatesQueue = [];

/**
 * Broadcasts a request to all active GMs to initiate sharing.
 */
export function requestOfferFromGMs() {
  const gms = game.users.filter(u => u.isGM && u.active);
  for (const gm of gms) {
    game.socket.emit("module.screen-share", {
      action: "request-offer",
      senderId: game.user.id,
      receiverId: gm.id,
      data: null
    });
  }
}

/**
 * Routes player-specific signaling actions.
 * @param {string} senderId
 * @param {string} action
 * @param {any} data
 */
export async function handlePlayerSignaling(senderId, action, data) {
  switch (action) {
    case "offer":
      await playerReceiveOffer(senderId, data);
      break;
    case "candidate":
      playerReceiveCandidate(senderId, data);
      break;
    case "disconnect":
      await playerDisconnect();
      break;
    case "livekit-stream-started":
      playerReceiveLiveKitStreamStarted(senderId, data);
      break;
    case "livekit-token":
      await playerReceiveLiveKitToken(senderId, data);
      break;
  }
}

/**
 * Handles livekit-stream-started message from the GM.
 * @param {string} senderId The GM's user ID.
 * @param {object} data Connection info.
 */
export function playerReceiveLiveKitStreamStarted(senderId, data) {
  console.log(`Screen Share | [PLAYER] LiveKit stream started by GM ${senderId}. Requesting subscriber token...`);
  game.socket.emit("module.screen-share", {
    action: "request-livekit-token",
    senderId: game.user.id,
    receiverId: senderId,
    data: null
  });
}

/**
 * Handles receiving the signed LiveKit subscriber token.
 * @param {string} senderId The GM's user ID.
 * @param {object} data Token and server credentials.
 */
export async function playerReceiveLiveKitToken(senderId, { token, serverUrl, roomName }) {
  console.log(`Screen Share | [PLAYER] Received LiveKit subscriber token from GM ${senderId}.`);
  const { LiveKitStreamProvider } = globalThis.ScreenShare || {};
  if (!LiveKitStreamProvider) {
    console.error("Screen Share | [PLAYER] LiveKitStreamProvider not found in global registry.");
    return;
  }

  if (!(session.activeProvider instanceof LiveKitStreamProvider)) {
    if (session.activeProvider) {
      await session.stopShare();
    }
    session.activeProvider = new LiveKitStreamProvider(() => {
      playerDisconnect().catch(err => console.error(err));
    });
  }

  try {
    await session.activeProvider.connectSubscriber(token, serverUrl, roomName);
  } catch (err) {
    console.error("Screen Share | [PLAYER] Failed to connect LiveKit subscriber:", err);
  }
}


/**
 * Sets up the player RTCPeerConnection and responds with an SDP answer.
 * @param {string} senderId
 * @param {object} offerSdp
 */
export async function playerReceiveOffer(senderId, offerSdp) {
  console.log(`Screen Share | [PLAYER] received offer from GM ${senderId}`, offerSdp);
  if (_playerPeerConnection) {
    console.log("Screen Share | [PLAYER] closing existing peer connection");
    _playerPeerConnection.close();
    _playerPeerConnection = null;
  }
  if (_playerReconnectTimeout) {
    clearTimeout(_playerReconnectTimeout);
    _playerReconnectTimeout = null;
  }
  _playerGMId = senderId;
  _playerIceCandidatesQueue = [];

  const iceServers = getIceServersConfig();
  console.log("Screen Share | [PLAYER] Creating RTCPeerConnection with ICE Servers:", iceServers);
  const pc = new RTCPeerConnection({ iceServers });
  _playerPeerConnection = pc;

  // Register event listeners immediately before any asynchronous calls
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Screen Share | [PLAYER] Generated ICE candidate:", event.candidate.candidate);
      game.socket.emit("module.screen-share", {
        action: "candidate",
        senderId: game.user.id,
        receiverId: senderId,
        data: event.candidate
      });
    } else {
      console.log("Screen Share | [PLAYER] ICE candidate gathering complete");
    }
  };

  pc.onconnectionstatechange = () => {
    console.log(`Screen Share | [PLAYER] Connection state changed: ${pc.connectionState}`);
    console.log(`Screen Share | [PLAYER] Signaling state: ${pc.signalingState}, ICE gathering state: ${pc.iceGatheringState}`);
    if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
      handlePlayerConnectionDrop();
    } else if (pc.connectionState === "connected") {
      _playerRetryCount = 0;
    }
  };

  pc.ontrack = (event) => {
    console.log("Screen Share | [PLAYER] Received remote media track:", event.track.kind, event.track.label);
    const stream = event.streams[0];
    if (stream) {
      console.log("Screen Share | [PLAYER] Remote stream exists, track ID:", event.track.id, "Stream ID:", stream.id);
      const activeScene = game.scenes.active;
      const containerDoc = getScreenContainer(activeScene);
      if (containerDoc) {
        console.log(`Screen Share | [PLAYER] Found container document in active scene:`, containerDoc.name || containerDoc.id);
        session.renderStream(containerDoc, stream).then(() => {
          console.log("Screen Share | [PLAYER] Successfully rendered remote stream on canvas.");
        }).catch(err => {
          console.error("Screen Share | [PLAYER] Failed to render player stream:", err);
        });
      } else {
        console.warn("Screen Share | [PLAYER] Received stream track but no active container found on this scene.");
      }
      const track = event.track;
      track.onended = () => {
        console.log("Screen Share | [PLAYER] Remote track ended, stopping stream rendering.");
        playerDisconnect();
      };
    } else {
      console.error("Screen Share | [PLAYER] Remote media track was received but no stream was associated with it!");
    }
  };

  pc.onicegatheringstatechange = () => {
    console.log(`Screen Share | [PLAYER] ICE gathering state changed to: ${pc.iceGatheringState}`);
  };

  try {
    console.log("Screen Share | [PLAYER] Setting remote description...");
    await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
    console.log("Screen Share | [PLAYER] Remote description set successfully.");
  } catch (err) {
    console.error("Screen Share | [PLAYER] Failed to set remote description:", err);
    ui.notifications.error("Screen Share | Failed to establish connection.");
    return;
  }

  // Apply any early ICE candidates received while remote description was not set
  if (_playerIceCandidatesQueue.length > 0) {
    console.log(`Screen Share | [PLAYER] Processing ${_playerIceCandidatesQueue.length} queued early ICE candidates`);
    for (const candidate of _playerIceCandidatesQueue) {
      try {
        console.log("Screen Share | [PLAYER] Applying queued ICE candidate:", candidate.candidate);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Screen Share | [PLAYER] Failed to add queued ICE candidate:", err);
      }
    }
    _playerIceCandidatesQueue = [];
  }

  let answer;
  try {
    console.log("Screen Share | [PLAYER] Creating SDP answer...");
    answer = await pc.createAnswer();
    console.log("Screen Share | [PLAYER] Setting local description (answer)...");
    await pc.setLocalDescription(answer);
    console.log("Screen Share | [PLAYER] SDP Answer local description set successfully.");
  } catch (err) {
    console.error("Screen Share | [PLAYER] Failed to create/set local answer:", err);
    return;
  }

  console.log("Screen Share | [PLAYER] Sending answer via socket...");
  game.socket.emit("module.screen-share", {
    action: "answer",
    senderId: game.user.id,
    receiverId: senderId,
    data: answer
  });
}

/**
 * Handles incoming ICE candidate from the GM.
 * @param {string} senderId
 * @param {object} candidateData
 */
export function playerReceiveCandidate(senderId, candidateData) {
  console.log(`Screen Share | [PLAYER] Received candidate from GM ${senderId}`, candidateData);
  if (!_playerPeerConnection) {
    console.warn("Screen Share | [PLAYER] Received ICE candidate but no active peer connection exists.");
    return;
  }

  if (!_playerPeerConnection.remoteDescription) {
    console.log("Screen Share | [PLAYER] Queuing ICE candidate until remote description is set.");
    _playerIceCandidatesQueue.push(candidateData);
    return;
  }

  try {
    console.log("Screen Share | [PLAYER] Adding ICE candidate:", candidateData.candidate);
    _playerPeerConnection.addIceCandidate(new RTCIceCandidate(candidateData));
  } catch (err) {
    console.error("Screen Share | [PLAYER] Failed to add ICE candidate:", err);
  }
}

/**
 * Handles dropped connection and attempts reconnection.
 */
export function handlePlayerConnectionDrop() {
  if (!_playerGMId) return;
  if (_playerReconnectTimeout) return;

  if (_playerRetryCount < MAX_RETRIES) {
    _playerRetryCount++;
    console.warn(`Screen Share | Connection dropped. Retrying reconnection (${_playerRetryCount}/${MAX_RETRIES}) in ${RETRY_INTERVAL / 1000}s...`);
    _playerReconnectTimeout = setTimeout(() => {
      _playerReconnectTimeout = null;
      game.socket.emit("module.screen-share", {
        action: "request-offer",
        senderId: game.user.id,
        receiverId: _playerGMId,
        data: null
      });
    }, RETRY_INTERVAL);
  } else {
    console.error("Screen Share | Connection failed permanently after maximum retries.");
    ui.notifications.error("Screen Share | Connection to stream lost permanently.");
    playerDisconnect();
  }
}

/**
 * Disconnects the player, closes connections, and cleans up rendered elements.
 */
export async function playerDisconnect() {
  console.log("Screen Share | Player disconnecting and cleaning up WebRTC and DOM assets.");
  if (_playerReconnectTimeout) {
    clearTimeout(_playerReconnectTimeout);
    _playerReconnectTimeout = null;
  }
  _playerRetryCount = 0;
  _playerGMId = null;
  _playerIceCandidatesQueue = [];

  if (_playerPeerConnection) {
    _playerPeerConnection.close();
    _playerPeerConnection = null;
  }

  await session.stopShare();
}

/**
 * Central signaling message receiver for all roles.
 * @param {object} payload
 */
export function handleSignalingMessage(payload) {
  if (!payload || typeof payload !== "object") return;

  const { action, senderId, receiverId, data } = payload;
  console.log(`Screen Share | Received socket message: action=${action}, sender=${senderId}, receiver=${receiverId}`);

  if (receiverId && receiverId !== game.user.id) {
    return;
  }

  if (game.user.isGM) {
    if (session.activeProvider && typeof session.activeProvider.handleSignaling === "function" && session.activeProvider.isActive) {
      session.activeProvider.handleSignaling(senderId, action, data);
    } else {
      console.log(`Screen Share | GM ignoring signaling message action=${action} (activeProvider is active? ${session.activeProvider?.isActive})`);
    }
  } else {
    handlePlayerSignaling(senderId, action, data);
  }
}

/**
 * Checks if the player client has an active peer connection.
 * @returns {boolean}
 */
export function isPlayerConnected() {
  const isLiveKitConnected = session.activeProvider && session.activeProvider.isActive;
  return _playerPeerConnection !== null || !!isLiveKitConnected;
}
