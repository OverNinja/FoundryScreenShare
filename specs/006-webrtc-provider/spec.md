# Feature Specification: WebRTC Stream Provider

**Feature Branch**: `006-webrtc-provider`

**Created**: 2026-07-09

**Status**: Approved

**Input**: User description: "the implementation of a webrtc provider. properlly encapsulated and separated from the test provider. relavant parameters must be configurable via module settings. i have no ideia how this works and cannot provide much more instructions at this moment, so interview me for any relavant decisions, providing context for decision making"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - WebRTC Screen Share Streaming (Priority: P1)

As a Gamemaster, I want to share my screen using a secure, real-time WebRTC stream so that all connected players can view my stream on the designated screen container in real-time.

**Why this priority**: Core value of the feature. Enables actual multiplayer screen sharing beyond local testing (which is mock/browser-only for the local GM).

**Independent Test**: Can be tested by starting screen share on the GM client with a player browser connected, validating that the player sees the canvas region/tile render the GM's captured screen track.

**Acceptance Scenarios**:

1. **Given** a GM has marked a tile/region as the Screen Share Container and selected "WebRTC Provider" in the settings, **When** the GM clicks "Start Screen Share" and selects a window, **Then** a WebRTC stream connection is established with all active player clients and the stream is rendered within their container boundaries.
2. **Given** a screen share is active, **When** the GM clicks "Stop Screen Share", **Then** the WebRTC connections and media tracks are immediately closed, and the canvas container is cleaned up for all players.

---

### User Story 2 - Configure ICE / STUN / TURN Servers (Priority: P2)

As a Gamemaster, I want to configure custom STUN/TURN servers in the module settings so that connections can successfully traverse firewalls and NATs.

**Why this priority**: Essential for remote players where simple direct P2P connections fail due to NAT and router firewalls.

**Independent Test**: Can be tested by changing settings in the Foundry VTT module settings window and verifying that the newly configured ICE servers are used during the next connection negotiation.

**Acceptance Scenarios**:

1. **Given** the GM modifies the ICE server URLs and credentials in the screen share module settings, **When** a new screen share session is started, **Then** the RTCPeerConnection instances are initialized with the newly configured ICE server array.

---

### User Story 3 - Select Stream Quality Settings (Priority: P3)

As a Gamemaster, I want to select target video constraints (framerate, resolution) in the module settings so that the stream adapts to the network upload/download capacities of the group.

**Why this priority**: Helps manage bandwidth consumption, especially in mesh setups where the GM uploads to every player concurrently.

**Independent Test**: Configure the frame rate and resolution limit in the module settings, start sharing, and verify that the media tracks generated respect these maximum constraints.

**Acceptance Scenarios**:

1. **Given** the GM sets the maximum framerate to 15 FPS in settings, **When** the screen share starts, **Then** the media stream video tracks are restricted to a maximum of 15 frames per second.

---

### Edge Cases

- **Connection Drop / Network Disconnection**: What happens when a player loses connection and reconnects? The WebRTC connection must tear down and renegotiate upon reconnecting without breaking other players' streams.
- **GM Refreshes Page**: If the GM refreshes their page while sharing, all player clients must recognize the socket connection closed, tear down their local WebRTC peer connections, and restore the default appearance of the container.
- **Invalid settings**: If the GM configures invalid STUN/TURN URLs, the system should catch the initialization error, fallback gracefully, and display a user-friendly notification.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement a concrete `WebRTCStreamProvider` class extending `StreamProvider` that encapsulates WebRTC connection logic.
- **FR-002**: System MUST use Foundry's native socket mechanism (`game.socket`) for signaling connection handshakes, including SDP offer/answer exchanges and ICE candidates.
- **FR-003**: System MUST register module settings in Foundry VTT to allow configuring ICE servers (STUN/TURN URLs, username, and password).
- **FR-004**: System MUST register module settings to allow configuring stream constraints, specifically target maximum resolution and framerate.
- **FR-005**: System MUST ensure that player clients (non-GMs) act strictly as WebRTC receivers, and only the GM client can initiate media capture and act as the WebRTC sender.
- **FR-006**: System MUST configure ICE servers using an extendable list of public STUN servers (with Google's public STUN server `stun:stun.l.google.com:19302` configured by default), while allowing GMs to configure custom STUN/TURN servers in the module settings.
- **FR-007**: System MUST default to automatic browser negotiation for stream resolution and framerate, while providing module settings that allow GMs to optionally enforce custom constraints (e.g., maximum resolution and maximum framerate).
- **FR-008**: System MUST handle peer connection failures by automatically attempting to reconnect and renegotiate up to 3 times at 5-second intervals before tearing down the stream and notifying the user.

### Key Entities *(include if feature involves data)*

- **WebRTCStreamProvider**: Concrete class extending `StreamProvider`. Manages local MediaStream lifecycle and an array of RTCPeerConnections (one per connected player).
- **SignalingChannel**: Wrapper around Foundry VTT socket events (`game.socket`) to route WebRTC signaling payloads between the GM and players.
- **ModuleSettings**: Data store using Foundry's `game.settings` API to store ICE server configurations and video quality constraints.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: GM can establish a WebRTC stream with at least 4 active remote players, rendering the stream in under 5 seconds from trigger.
- **SC-002**: Screen share stop command terminates all media tracks and closes all RTCPeerConnection instances within 500ms, resulting in 0 active media objects.
- **SC-003**: Framerate limits configured in module settings successfully cap the stream framerate to the target value (within +/- 1 FPS).

## Assumptions

- Players and the GM use modern browsers with full WebRTC peer connection and media capture capabilities.
- Both GM and player clients have a stable socket connection to the Foundry VTT host.
- The default Foundry socket (`game.socket`) is available and unrestricted for custom module signaling.
