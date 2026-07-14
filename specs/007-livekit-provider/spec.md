# Feature Specification: LiveKit Stream Provider

**Feature Branch**: `007-livekit-provider`

**Created**: 2026-07-10

**Status**: Ready

**Input**: User description: "/speckit-specify a LiveKitProvider"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GM Activates and Broadcasts screen via LiveKit (Priority: P1)

The GM selects LiveKit as the active stream provider, configures connection details, and starts sharing their screen. The stream is successfully published to the LiveKit room using a dynamically generated Publisher JWT token.

**Why this priority**: Core functionality that enables the GM to publish their screen capture to the external LiveKit server.

**Independent Test**: GM selects LiveKit in provider settings, clicks the "Start Screen Share" tool on the canvas, chooses a window/screen, and verifies that the stream starts without error and is published to the configured LiveKit room.

**Acceptance Scenarios**:

1. **Given** GM has set LiveKit as the active stream provider, **When** they click "Start Screen Share", **Then** the browser media capture dialog opens, the GM's client generates a Publisher JWT token, and the captured track is published to the LiveKit server.
2. **Given** GM is actively streaming via LiveKit, **When** they click "Stop Screen Share", **Then** the LiveKit connection is terminated, tracks are stopped, and the room session is closed.

---

### User Story 2 - Player Connects and Receives LiveKit Stream (Priority: P2)

Connected players automatically request subscriber credentials, receive a signed subscriber JWT token from the GM client via the Foundry socket, join the same LiveKit room as subscribers, subscribe to the video track, and render the stream inside the designated screen share container.

**Why this priority**: Required for player clients to view the shared screen.

**Independent Test**: GM starts sharing screen via LiveKit. Player client (running in another browser) receives signaling information, requests a token, connects to LiveKit using the signed token, and displays the video stream in the designated region.

**Acceptance Scenarios**:

1. **Given** GM is streaming via LiveKit, **When** a Player is active or joins late, **Then** they request a subscriber token from the GM client via `game.socket`, receive the signed token, and join the LiveKit room to render the video stream.
2. **Given** Player is viewing a LiveKit stream, **When** the GM stops streaming or the active scene is changed, **Then** the player client disconnects from the LiveKit room and cleans up WebGL/DOM resources.

---

### User Story 3 - GM Configures LiveKit Settings (Priority: P3)

The GM configures LiveKit credentials (API Key, API Secret), Server URL, and optional streaming quality constraints within the module settings.

**Why this priority**: Allows adapting the connection to self-hosted or cloud LiveKit instances.

**Independent Test**: GM opens the module settings panel, enters LiveKit configurations, and saves them. The module uses these settings for subsequent sessions.

**Acceptance Scenarios**:

1. **Given** GM is configuring settings, **When** they enter LiveKit credentials and click save, **Then** the settings are stored persistently in world-scoped, restricted settings.

### Edge Cases

- **LiveKit Server Unreachable**: If the LiveKit server is offline or the URL is invalid, the module must fail gracefully, notify the GM, and reset the active sharing state.
- **Subscriber Connection Timeout**: If a player fails to connect to the LiveKit room within 10 seconds, the client should log a warning, show a subtle UI notification, and allow manual retry.
- **Late Joins**: A player logging in while a LiveKit stream is already active must automatically request a token from the GM and connect to the stream.
- **Dirty Disconnects**: If the GM closes the browser tab or loses network connectivity, players must detect the track/room closure and clean up their canvas and video elements.
- **GM Offline / Token Request Timeout**: If a player requests a token but the GM does not respond within a timeout period, the player client should log a warning and fallback gracefully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the GM to select "LiveKit" as the active stream provider.
- **FR-002**: System MUST capture the GM's screen using browser media capture APIs when sharing is initiated.
- **FR-003**: System MUST publish the captured screen video track to the configured LiveKit room.
- **FR-004**: System MUST distribute connection parameters (Server URL, Room Name) to player clients dynamically via `game.socket`.
- **FR-005**: System MUST authenticate GM and Players using a secure client-side token generation architecture where:
  - LiveKit API Key and API Secret are stored in world-scoped, GM-restricted settings (`game.settings` with `scope: "world"` and `restricted: true`) so that player clients cannot access them.
  - Token signing/generation happens strictly on the GM client using a browser-compatible cryptographic library.
  - GM client signs a Publisher JWT token for itself upon initiating screen sharing.
  - Player clients send a request for a subscriber token to the GM client via `game.socket`.
  - GM client listens for the token request, generates a Subscriber JWT token for that player, and returns only the generated token via `game.socket`.
  - The API Secret MUST NEVER leave the GM's client or be exposed to player clients.
- **FR-006**: Player clients MUST join the LiveKit Room and subscribe to the broadcasted video stream track using the provided subscriber JWT token.
- **FR-007**: System MUST explicitly disconnect from the LiveKit room and clean up all media tracks and connection resources (including room connections, HTML5 video elements, and WebGL textures) on stream stop, player disconnection, or active scene changes.

### Key Entities

- **LiveKitStreamProvider**: Concrete subclass of `StreamProvider` that wraps LiveKit SDK publishing/subscribing operations.
- **LiveKit Connection Profile**: Entity containing the Server URL, Room Name, and Token/Authentication credentials.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: GM and player clients establish connection and start rendering the video stream via LiveKit in under 4 seconds from clicking start.
- **SC-002**: 100% of WebGL textures, HTML5 video elements, and LiveKit room connection objects are destroyed/released within 500ms of stopping the stream.
- **SC-003**: Late-joining players start rendering the active LiveKit stream within 4 seconds of entering the scene.
- **SC-004**: The system recovers or gracefully terminates and notifies the user during 100% of simulated network dropouts or token expirations.

## Assumptions

- A LiveKit server instance (cloud or self-hosted) is available and accessible from both GM and player network locations.
- Audio streaming is out of scope (video-only capture).
- Standard browser WebRTC support is available on all client devices.
