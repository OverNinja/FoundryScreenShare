import { StreamProvider } from "./base.js";
import { generateLiveKitToken } from "../crypto/jwt.js";
import { session } from "../rendering/session.js";
import { getScreenContainer, resolveContainerSettings } from "../helpers.js";

let livekitSDK = null;

/**
 * Loads the LiveKit Client SDK dynamically from CDN.
 * @returns {Promise<any>} The LiveKit SDK module namespace.
 */
async function loadLiveKitSDK() {
  if (livekitSDK) return livekitSDK;
  try {
    console.log("Screen Share | Loading LiveKit Client SDK from CDN...");
    livekitSDK = await import("https://esm.sh/livekit-client");
    console.log("Screen Share | LiveKit Client SDK loaded successfully.");
    return livekitSDK;
  } catch (err) {
    console.error("Screen Share | Failed to load LiveKit Client SDK:", err);
    ui.notifications.error("Failed to load LiveKit Client SDK. Please verify your internet connection.");
    throw err;
  }
}

/**
 * Concrete Stream Provider using LiveKit server for screen sharing.
 * @extends {StreamProvider}
 */
export class LiveKitStreamProvider extends StreamProvider {
  /** @type {MediaStream|null} */
  #stream = null;
  /** @type {any|null} */
  #room = null;
  /** @type {Function|null} */
  #onEndedCallback = null;

  /**
   * @param {Function} onEndedCallback Callback fired when a local media track is stopped externally.
   */
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

    const serverUrl = game.settings.get("screen-share", "livekitServerUrl")?.trim();
    const apiKey = game.settings.get("screen-share", "livekitApiKey")?.trim();
    const apiSecret = game.settings.get("screen-share", "livekitApiSecret")?.trim();
    const roomName = game.settings.get("screen-share", "livekitRoomName")?.trim();

    if (!serverUrl || !apiKey || !apiSecret || !roomName) {
      const errorMsg = "LiveKit configurations are incomplete. Please check your Screen Share Module Settings.";
      ui.notifications.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Load LiveKit SDK
    await loadLiveKitSDK();

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

    console.log("Screen Share | Starting LiveKit local stream with constraints:", constraints);

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

    // Generate Publisher JWT
    console.log("Screen Share | Generating Publisher JWT...");
    const token = await generateLiveKitToken(apiKey, apiSecret, {
      room: roomName,
      identity: game.user.id,
      name: game.user.name,
      canPublish: true,
      canSubscribe: true
    });

    // Create Room and Connect
    const { Room } = livekitSDK;
    console.log(`Screen Share | Connecting GM to LiveKit Room: ${roomName}`);
    this.#room = new Room();
    await this.#room.connect(serverUrl, token);
    console.log("Screen Share | Connected to LiveKit room.");

    // Publish video track
    console.log("Screen Share | Publishing screen track to LiveKit...");
    await this.#room.localParticipant.publishTrack(videoTrack, {
      name: "screen-share-video"
    });
    console.log("Screen Share | Screen track published.");

    // Broadcast stream started to players
    game.socket.emit("module.screen-share", {
      action: "livekit-stream-started",
      senderId: game.user.id,
      receiverId: null,
      data: {
        serverUrl: serverUrl,
        roomName: roomName
      }
    });

    return this.#stream;
  }

  /** @override */
  async stopStream() {
    console.log("Screen Share | GM/Player stopping LiveKit stream provider.");
    this.#onEndedCallback = null;
 
    if (this.#room) {
      try {
        await this.#room.disconnect();
      } catch (err) {
        console.error("Screen Share | Failed to disconnect LiveKit room:", err);
      }
      this.#room = null;
    }

    if (this.#stream) {
      for (const track of this.#stream.getTracks()) {
        track.stop();
      }
      this.#stream = null;
    }

    if (game.user.isGM) {
      game.socket.emit("module.screen-share", {
        action: "disconnect",
        senderId: game.user.id,
        receiverId: null,
        data: null
      });
    }
  }

  /** @override */
  get isActive() {
    if (game.user.isGM) {
      return this.#stream !== null && this.#stream.getVideoTracks().some(t => t.readyState === "live");
    }
    return this.#room !== null && this.#room.state === "connected";
  }

  /**
   * Connects player to the room as a subscriber using the received token.
   * @param {string} token Signed subscriber token.
   * @param {string} serverUrl LiveKit server address.
   * @param {string} roomName Room ID.
   */
  async connectSubscriber(token, serverUrl, roomName) {
    console.log(`Screen Share | [PLAYER] Connecting subscriber to room: ${roomName}`);
    
    await loadLiveKitSDK();
    const { Room, RoomEvent } = livekitSDK;

    if (this.#room) {
      await this.stopStream();
    }

    this.#room = new Room();

    this.#room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log(`Screen Share | [PLAYER] Subscribed to track kind=${track.kind}, sid=${track.sid}`);
      if (track.kind === "video") {
        const remoteStream = new MediaStream([track.mediaStreamTrack]);
        const activeScene = game.scenes.active;
        const containerDoc = getScreenContainer(activeScene);
        if (containerDoc) {
          session.renderStream(containerDoc, remoteStream).then(() => {
            console.log("Screen Share | [PLAYER] Successfully rendered remote LiveKit stream on canvas.");
          }).catch(err => {
            console.error("Screen Share | [PLAYER] Failed to render LiveKit stream:", err);
          });
        }

        track.mediaStreamTrack.onended = () => {
          console.log("Screen Share | [PLAYER] Remote LiveKit track ended.");
          this.stopStream();
        };
      }
    });

    this.#room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      if (track.kind === "video") {
        console.log("Screen Share | [PLAYER] Video track unsubscribed.");
        session.stopShare().catch(err => console.error(err));
      }
    });

    this.#room.on(RoomEvent.Disconnected, () => {
      console.log("Screen Share | [PLAYER] LiveKit Room disconnected.");
      session.stopShare().catch(err => console.error(err));
    });

    await this.#room.connect(serverUrl, token);
    console.log("Screen Share | [PLAYER] Subscriber connected successfully.");
  }

  /**
   * Processes socket messages received from players on the GM's client.
   * @param {string} senderId The player user ID.
   * @param {string} action Signaling action.
   * @param {any} data Optional details.
   */
  async handleSignaling(senderId, action, data) {
    if (action === "request-livekit-token" || action === "request-offer") {
      if (!this.isActive) {
        console.warn("Screen Share | [GM] LiveKit stream is not active. Ignoring token request.");
        return;
      }

      const serverUrl = game.settings.get("screen-share", "livekitServerUrl")?.trim();
      const apiKey = game.settings.get("screen-share", "livekitApiKey")?.trim();
      const apiSecret = game.settings.get("screen-share", "livekitApiSecret")?.trim();
      const roomName = game.settings.get("screen-share", "livekitRoomName")?.trim();

      if (!serverUrl || !apiKey || !apiSecret || !roomName) {
        console.error("Screen Share | [GM] Configuration settings incomplete. Cannot generate token.");
        return;
      }

      console.log(`Screen Share | [GM] Generating subscriber token for player ${senderId}`);
      const playerUser = game.users.get(senderId);
      const playerName = playerUser?.name || senderId;

      try {
        const token = await generateLiveKitToken(apiKey, apiSecret, {
          room: roomName,
          identity: senderId,
          name: playerName,
          canPublish: false,
          canSubscribe: true
        });

        console.log(`Screen Share | [GM] Sending signed token to player ${senderId}`);
        game.socket.emit("module.screen-share", {
          action: "livekit-token",
          senderId: game.user.id,
          receiverId: senderId,
          data: {
            token,
            serverUrl,
            roomName
          }
        });
      } catch (err) {
        console.error(`Screen Share | [GM] Token generation failed for ${senderId}:`, err);
      }
    }
  }
}
