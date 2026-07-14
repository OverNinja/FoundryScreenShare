# Data Model: LiveKit Stream Provider

## Module Configuration Settings
All configurations are managed through Foundry VTT's standard `game.settings` API. LiveKit credentials are saved as world-scoped settings and strictly restricted so that only Game Masters can access the API Secret.

| Setting ID | Scope | Restricted | Type | Description / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `livekitServerUrl` | `world` | `true` | `String` | LiveKit Server address (e.g. `wss://project-xxx.livekit.cloud` or `ws://localhost:7880`). |
| `livekitApiKey` | `world` | `true` | `String` | The LiveKit project API Key. |
| `livekitApiSecret` | `world` | `true` | `String` | The LiveKit project API Secret (must be hidden from non-GM users). |
| `livekitRoomName` | `world` | `true` | `String` | The designated LiveKit Room ID/Name (e.g. `foundry-screen-share`). |

---

## Signaling Message Payloads
Foundry VTT socket messages are relayed through `game.socket.emit("module.screen-share", payload)`. The following socket payloads are introduced for the LiveKit provider:

### 1. Request LiveKit Token (`request-livekit-token`)
Sent by player clients to the GM to request a signed LiveKit connection token.

```json
{
  "action": "request-livekit-token",
  "senderId": "player-user-id",
  "receiverId": "gm-user-id",
  "data": null
}
```

### 2. LiveKit Token Response (`livekit-token`)
Sent by the GM to a requesting player client with the signed subscriber token.

```json
{
  "action": "livekit-token",
  "senderId": "gm-user-id",
  "receiverId": "player-user-id",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "serverUrl": "wss://my-livekit-server.com",
    "roomName": "screen-share-room"
  }
}
```

### 3. LiveKit Stream Started (`livekit-stream-started`)
Broadcasted by the GM to all active clients when the GM successfully establishes a publisher connection to the LiveKit server.

```json
{
  "action": "livekit-stream-started",
  "senderId": "gm-user-id",
  "receiverId": null,
  "data": {
    "serverUrl": "wss://my-livekit-server.com",
    "roomName": "screen-share-room"
  }
}
```

---

## Session State
The module session state (`session`) tracks the connection status for the current client:

- `activeProvider`: References the active `LiveKitStreamProvider` instance when `livekit` backend is selected.
- `sharingSceneId`: Tracks the active scene where the screen share is rendered.
- `isSharing`: Boolean flag indicating if a stream is active.
- `livekitRoom`: References the connected LiveKit `Room` instance on both the GM (publisher) and player (subscriber) clients. Used for teardown/cleanup.
