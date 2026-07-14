# Data Model: WebRTC Stream Provider

This document specifies the configuration structures and signaling schemas used by the WebRTC Stream Provider.

## 1. Module Settings (`game.settings`)

The module registers the following configuration settings in Foundry VTT. All settings are stored in the client-scope database but sync appropriately where needed.

### Setting: `activeBackend`
* **Type**: `String`
* **Scope**: `client` (GM setting)
* **Default**: `"local"`
* **Allowed Values**: `"local"`, `"webrtc"`
* **Description**: Selects the active stream transmission backend.

### Setting: `iceServers`
* **Type**: `String`
* **Scope**: `world` (Synchronized across all clients)
* **Default**: `"stun:stun.l.google.com:19302"`
* **Description**: A single string URL representing the WebRTC ICE/STUN/TURN server configuration.
* **Validation**: Must be a valid WebRTC server URL starting with a scheme (e.g. `stun:`, `turn:`, `turns:`).

### Setting: `turnUsername`
* **Type**: `String`
* **Scope**: `world`
* **Default**: `""`
* **Description**: Username for authenticate-based TURN servers.

### Setting: `turnCredential`
* **Type**: `String`
* **Scope**: `world`
* **Default**: `""`
* **Description**: Credential/Password for TURN authentication.

### Setting: `maxFramerate`
* **Type**: `Number`
* **Scope**: `client`
* **Default**: `0` (meaning auto/unconstrained)
* **Choices**: `0` (Auto), `15` (15 FPS), `30` (30 FPS), `60` (60 FPS)
* **Description**: Maximum capture framerate.

### Setting: `maxResolution`
* **Type**: `String`
* **Scope**: `client`
* **Default**: `"auto"`
* **Choices**: `"auto"` (Auto), `"720p"` (1280x720), `"1080p"` (1920x1080)
* **Description**: Maximum capture resolution height.

---

## 2. Signaling Payload Schema

All WebRTC negotiation messages are transmitted using Foundry VTT's native socket mechanism under a registered socket identifier (`"module.screen-share"`).

### Base Schema
```typescript
interface SignalingPayload {
  // Action type for WebRTC negotiation
  action: "offer" | "answer" | "candidate" | "disconnect" | "request-offer";
  
  // Foundry User ID of the client sending the message
  senderId: string;
  
  // Foundry User ID of the intended recipient (null/empty broadcasts to all)
  receiverId: string | null;
  
  // Payload content
  data?: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
}
```

### Action Types & Transitions

1. **`request-offer`**: Sent by a player client upon joining the scene or refreshing, requesting the GM to initiate a connection.
   - **Sender**: Player
   - **Receiver**: GM
2. **`offer`**: Sent by the GM client containing the WebRTC SDP offer.
   - **Sender**: GM
   - **Receiver**: Target Player
3. **`answer`**: Sent by the player client in response to the GM's offer.
   - **Sender**: Player
   - **Receiver**: GM
4. **`candidate`**: Sent by either GM or player exchanging ICE candidate information.
   - **Sender**: GM / Player
   - **Receiver**: Player / GM
5. **`disconnect`**: Sent by the GM client when sharing stops to instruct players to close their peer connections.
   - **Sender**: GM
   - **Receiver**: All Players

---

## 3. WebRTC Peer Connection Registry (In-Memory State)

The `WebRTCStreamProvider` maintains an in-memory registry of all active peer connections on the GM client.

```typescript
type PeerRegistry = Map<string, {
  peerConnection: RTCPeerConnection;
  connectionState: "new" | "connecting" | "connected" | "disconnected" | "failed";
  retryCount: number;
  lastActive: number; // Unix timestamp
}>;
```
* **Key**: Foundry `userId` of the player.
* **Value**: Object containing the active `RTCPeerConnection`, connection status, retry count for failure recovery, and timestamp of last activity.
