# API Contracts: WebRTC Stream Provider

This document specifies the programmatic contracts and interfaces for the WebRTC integration.

## 1. Class Interface: `WebRTCStreamProvider`

Implements the `StreamProvider` interface to manage the screen capture and peer connections.

```javascript
/**
 * Concrete Stream Provider using WebRTC for multi-peer broadcasting.
 * @extends {StreamProvider}
 */
class WebRTCStreamProvider extends StreamProvider {
  /**
   * @param {Function} onEndedCallback Callback fired when screen sharing is stopped locally or externally.
   */
  constructor(onEndedCallback) {
    super();
  }

  /**
   * Captures the GM's screen media stream and initiates connections to all players.
   * Registers the socket handlers for WebRTC negotiation.
   * @override
   * @returns {Promise<MediaStream>} Resolves to the captured MediaStream.
   */
  async startStream() {
    // 1. Prompt for navigator.mediaDevices.getDisplayMedia using settings constraints
    // 2. Register socket signaling hook: "module.screen-share"
    // 3. For each connected player client, initialize RTCPeerConnection and send offer
    // 4. Return captured MediaStream
  }

  /**
   * Closes all active peer connections, stops all media tracks, and removes socket handlers.
   * @override
   * @returns {Promise<void>}
   */
  async stopStream() {
    // 1. Stop all video/audio tracks in local MediaStream
    // 2. Send "disconnect" action over the socket to all connected players
    // 3. Loop over and close all RTCPeerConnections in the registry, then clear it
    // 4. Remove socket listener
  }

  /**
   * Checks if the provider is currently capturing and actively transmitting a live stream.
   * @override
   * @type {boolean}
   * @readonly
   */
  get isActive() {
    // Returns true if local stream is capturing and at least one video track is active
  }
}
```

---

## 2. Signaling Socket Events Contract

Both GM and player clients listen to the `"module.screen-share"` socket event identifier.

```javascript
// Register socket listener on initialization
game.socket.on("module.screen-share", (payload) => {
  // Logic routing based on game.user.isGM and payload.action
});
```

### GM Signaling Handler Logic
When the GM client receives a message:
- **`request-offer`**:
  - Checks if stream sharing is active.
  - Initializes a new `RTCPeerConnection` for the requesting player (`payload.senderId`).
  - Generates a local SDP offer, sets local description, and sends `offer` action payload to the player.
- **`answer`**:
  - Locates the peer connection associated with the player (`payload.senderId`).
  - Sets the remote description with the player's SDP answer.
- **`candidate`**:
  - Adds the ICE candidate to the player's peer connection.

### Player Signaling Handler Logic
When a player client receives a message:
- **`offer`**:
  - Initializes a new `RTCPeerConnection` instance.
  - Sets the remote description with the GM's SDP offer.
  - Creates a local SDP answer, sets local description, and sends `answer` action payload to the GM.
  - Registers the `ontrack` callback to append the received video stream to the active screen container on the canvas.
- **`candidate`**:
  - Adds the ICE candidate to their local peer connection.
- **`disconnect`**:
  - Calls local stop and cleanup routines to release all WebGL and DOM resources (including textures, sprites, and hidden video players).
