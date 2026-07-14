# Implementation Plan: WebRTC Stream Provider

**Branch**: `006-webrtc-provider` | **Date**: 2026-07-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-webrtc-provider/spec.md`

## Summary

This feature implements a dedicated, encapsulated `WebRTCStreamProvider` using WebRTC peer-to-peer connections to broadcast the GM's captured screen media stream directly to all connected players. P2P signaling is handled via Foundry's native socket mechanism (`game.socket`). Configuration parameters (such as ICE/STUN/TURN server URLs, usernames, credentials, and resolution/framerate constraints) are fully configurable via GM module settings.

---

## Technical Context

**Language/Version**: ES6 JavaScript (Foundry VTT v14 compatible)

**Primary Dependencies**: WebRTC API (`RTCPeerConnection`), Foundry VTT v14 Socket API (`game.socket`), PixiJS (via Foundry)

**Storage**: Client-scoped settings (`game.settings` for active backend, quality constraints) and world-scoped settings (`game.settings` for ICE servers, TURN credentials)

**Testing**: Manual verification using Browser A (GM) and Browser B (Player) in local Foundry VTT setup.

**Target Platform**: Modern Web Browsers supporting WebRTC (Chrome, Firefox, Safari, Edge)

**Project Type**: Foundry VTT Module

**Performance Goals**: Connection establishment under 5 seconds; WebRTC and DOM resources cleaned up completely within 500ms of stopping the stream.

**Constraints**: Secure browser context (HTTPS or localhost) required for media capture and WebRTC APIs. GM role check mandatory for sender role.

**Scale/Scope**: 1 new stream provider class (`WebRTCStreamProvider`), 5 new module settings, 1 custom socket event handler, and late-joining connection logic.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Decoupled Transmission Strategy**: **PASS**. The new WebRTC provider class implements the abstract `StreamProvider` interface and is registered under `ScreenShare.PROVIDERS.webrtc`, fully decoupled from core rendering/UI.
- **Principle II: Explicit WebGL & Network Lifecycle Management**: **PASS**. Peer connections are explicitly closed, and remote track receivers clean up their canvas and off-screen videos completely on disconnect.
- **Principle III: Foundry VTT v14 API Standard Compliance**: **PASS**. Custom socket event signaling and module settings use standard Foundry VTT API pathways.
- **Principle IV: Dual-Role Signaling & Connection Architecture**: **PASS**. Programmatic checks gate media capture on the GM client; players act strictly as receivers.
- **Principle V: Masked PixiJS Canvas Rendering**: **PASS**. Leverages the existing container masking pipeline.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-webrtc-provider/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md  # Specification Quality Checklist
└── contracts/
    └── api.md           # Interface and method contracts
```

### Source Code (repository root)

```text
screen-share.js          # Main module script containing hooks and logic
module.json              # Module manifest
```

**Structure Decision**: Single-project structure. As per the existing codebase layout, the implementation is completely encapsulated in `screen-share.js` and registered dynamically.

---

## Complexity Tracking

*No constitution violations present. No exceptions registered.*
