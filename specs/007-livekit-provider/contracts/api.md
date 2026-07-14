# API Contracts: LiveKit Stream Provider

## 1. Class: `LiveKitStreamProvider`
Extends the abstract `StreamProvider` class. Handles connecting to LiveKit room, publishing local stream (for GMs), subscribing to the active stream (for players), and handling signaling events.

### Public Methods

#### `constructor(onEndedCallback)`
- **Parameters**: 
  - `onEndedCallback` (Function): Callback function executed when the local media capture stops (e.g. user clicks "Stop sharing" on the browser overlay).

#### `async startStream()`
- **Purpose**: Initiates screen capture, connects the GM client to the configured LiveKit room as a publisher, publishes the captured media track, and broadcasts the `livekit-stream-started` message to all players.
- **Returns**: `Promise<MediaStream>` - The captured browser media stream.
- **Exceptions**: Throws an error if screen sharing is not supported in the current context, if user rejects the capture, or if LiveKit room connection fails.

#### `async stopStream()`
- **Purpose**: Stops the screen capture, stops all local media tracks, disconnects the GM client from the LiveKit room, and emits the `disconnect` action to all player clients.
- **Returns**: `Promise<void>`

#### `get isActive()`
- **Purpose**: Returns whether the provider is currently actively streaming.
- **Returns**: `boolean`

#### `handleSignaling(senderId, action, data)`
- **Purpose**: Processes socket messages received from players on the GM's client.
- **Parameters**:
  - `senderId` (string): The user ID of the player client sending the request.
  - `action` (string): The socket action name. Supports `request-livekit-token` and `request-offer`.
  - `data` (any): Additional payload data.
- **Returns**: `Promise<void>`

---

## 2. Module: `src/crypto/jwt.js`
Cryptographic utility module providing JWT creation capabilities.

#### `async generateLiveKitToken(apiKey, apiSecret, options)`
- **Purpose**: Generates and signs a LiveKit-compatible JWT token client-side using HS256 algorithm via the native browser Web Crypto API.
- **Parameters**:
  - `apiKey` (string): LiveKit API Key.
  - `apiSecret` (string): LiveKit API Secret.
  - `options` (object): Token generation properties:
    - `room` (string): The LiveKit Room ID.
    - `identity` (string): Unique identifier for the participant (e.g. user ID).
    - `name` (string): Human-readable name (e.g. user name).
    - `metadata` (string): Custom metadata string.
    - `canPublish` (boolean): Whether participant can publish tracks (true for GM, false for players).
    - `canSubscribe` (boolean): Whether participant can subscribe to tracks (always true).
- **Returns**: `Promise<string>` - The signed JWT token string.
