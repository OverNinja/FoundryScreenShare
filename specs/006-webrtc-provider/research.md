# Research Notes: WebRTC Stream Provider

This document captures the research and architectural choices made during the planning of the WebRTC Stream Provider.

## 1. Signaling Mechanism
* **Decision**: Use Foundry VTT's native socket communication (`game.socket`) for signaling.
* **Rationale**: Foundry's socket API is already established, authenticated, and available out-of-the-box for all connected clients. It eliminates the need for an external signaling server, simplifying deployment and keeping hosting costs to zero for GMs.
* **Alternatives considered**:
  - *Custom WebSocket Server*: Rejected because it requires GMs to host and configure a separate Node.js or Python server, introducing a massive deployment barrier.
  - *Server-Sent Events (SSE) or Polls*: Rejected because they are either unidirectional or high-latency compared to the immediate push-based WebSockets utilized by `game.socket`.

## 2. P2P Mesh vs. SFU Architecture
* **Decision**: P2P Mesh topology where the GM establishes direct WebRTC connections to each connected player client.
* **Rationale**: Highly cost-effective and fits within the "decoupled module" footprint without requiring complex SFU media routing infrastructure (like LiveKit or Janus). For standard Foundry VTT groups (typically 4–6 players), the GM's upstream bandwidth can support sending 5 copies of a compressed 720p/30fps stream.
* **Alternatives considered**:
  - *SFU (Selective Forwarding Unit)*: Rejected as the default because it requires external hosting infrastructure, though the code's decoupled design allows an SFU provider (e.g., LiveKit) to be added as a separate provider class in the future.

## 3. ICE Server and Connectivity Configuration
* **Decision**: Provide module settings containing an extendable list of public STUN servers (pre-populating Google's public STUN server `stun:stun.l.google.com:19302` by default), and input settings for a custom TURN server (with optional username and credential inputs).
* **Rationale**: Standard STUN suffices for players on open networks, but TURN is required to bypass symmetric NATs. Offering clear, separate settings allows GMs to use free STUN by default and easily upgrade to services like Metered.ca, Xirsys, or self-hosted CoTURN if players experience connection issues.
* **Alternatives considered**:
  - *No default STUN*: Rejected as it leads to a broken out-of-the-box experience for P2P connections on typical residential ISPs.
  - *Hardcoded STUN only*: Rejected because it prevents users from configuring TURN, which is necessary for strict firewall traversal.

## 4. Bandwidth and Quality Control
* **Decision**: Stream starts with automatic browser negotiation by default, but the module registers configurable constraints (Max Framerate, Max Resolution) in settings. If configured, these limits are injected into the media capture constraint block (e.g., `width: { max: X }, frameRate: { max: Y }`) during `getDisplayMedia`.
* **Rationale**: Automatic negotiation provides the smoothest startup. However, because GM upload capacity is the bottleneck in mesh networks, providing settings to cap resolution at 720p or framerate at 15/30 FPS is crucial to prevent upload link congestion.
* **Alternatives considered**:
  - *Strict, hardcoded constraints*: Rejected because some GMs with high upload bandwidth might want 1080p/60fps, while others need 480p/15fps for stability.

## 5. Peer Reconnection Strategy
* **Decision**: Implement an auto-reconnect strategy on connection failure or state transitions to `disconnected`/`failed`, attempting up to 3 retries at 5-second intervals before tearing down the connection and displaying an error toast.
* **Rationale**: WebRTC connections can drop temporarily due to minor network hiccups. Automatic reconnection handles transient interruptions silently, improving player UX.
* **Alternatives considered**:
  - *Immediate fail/teardown*: Rejected because it requires the GM to manually stop and restart screen sharing for every brief network drop.
  - *Infinite retries*: Rejected because it could cause infinite loops and memory leaks if a player permanently leaves.
