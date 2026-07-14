# Implementation Plan: LiveKit Stream Provider

**Branch**: `007-livekit-provider` | **Date**: 2026-07-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-livekit-provider/spec.md`

## Summary

This feature implements a `LiveKitStreamProvider` that integrates LiveKit as a high-performance alternative streaming backend for the Screen Share module. The GM captures their screen locally, signs a Publisher JWT token using the native browser Web Crypto API (HMAC-SHA256), and publishes the stream to a LiveKit Room. Players request subscriber tokens from the GM via `game.socket`. The GM client generates these Subscriber JWT tokens on demand and returns them via `game.socket`, ensuring that the LiveKit API Secret never leaves the GM's client. Players then connect to the LiveKit room using their subscriber token and render the stream on their canvas.

---

## Technical Context

**Language/Version**: ES6 JavaScript (Foundry VTT v14 compatible)

**Primary Dependencies**: LiveKit Client SDK (vendored/loaded dynamically), Web Crypto API (for JWT signing), Foundry VTT v14 Socket API (`game.socket`)

**Storage**: World-scoped settings (`game.settings` with `scope: "world"` and `restricted: true`) for LiveKit Server URL, API Key, API Secret, and Room Name.

**Testing**: Manual validation with GM and Player client connections in a local Foundry VTT environment pointing to a LiveKit server instance.

**Target Platform**: Modern Web Browsers supporting WebRTC and Web Crypto API.

**Project Type**: Foundry VTT Module extension.

**Performance Goals**: LiveKit room connection and stream rendering established in under 4 seconds; complete teardown and resources released within 500ms of stopping the stream.

**Constraints**: LiveKit API Secret MUST NOT be sent to or accessible by player clients. Secure context (HTTPS or localhost) required.

**Scale/Scope**: 1 new stream provider class (`LiveKitStreamProvider`), 4 new module settings, custom socket messaging protocol for token requests and distribution, and Web Crypto JWT signing utility.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Decoupled Transmission Strategy**: **PASS**. The new LiveKit provider is registered dynamically under `ScreenShare.PROVIDERS.livekit` and implements the abstract `StreamProvider` interface, keeping it decoupled from UI and rendering.
- **Principle II: Explicit WebGL & Network Lifecycle Management**: **PASS**. Upon stream teardown, LiveKit Room connections are closed, participants are disconnected, and all video/rendering resources are destroyed within 500ms.
- **Principle III: Foundry VTT v14 API Standard Compliance**: **PASS**. All configuration and socket communications use standard Foundry VTT v14 settings and `game.socket` relay pathways.
- **Principle IV: Dual-Role Signaling & Connection Architecture**: **PASS**. Token generation and media publishing are gated behind GM checks; players act strictly as subscribers requesting tokens.
- **Principle V: Masked PixiJS Canvas Rendering**: **PASS**. Leverages the existing container masking pipeline.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-livekit-provider/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Specification Quality Checklist
└── contracts/
    └── api.md           # Interface and method contracts
```

### Source Code (repository root)

```text
src/
├── providers/
│   ├── base.js          # Abstract StreamProvider
│   ├── local.js         # Local implementation
│   ├── webrtc.js        # WebRTC implementation
│   └── livekit.js       # [NEW] LiveKit implementation
├── webrtc/
│   └── signaling.js     # WebRTC signaling
├── crypto/
│   └── jwt.js           # [NEW] HMAC-SHA256 JWT utility
├── settings.js          # Module settings registration
└── screen-share.js      # Main orchestrator
```

**Structure Decision**: Single-project structure. We will implement `src/providers/livekit.js` and `src/crypto/jwt.js` to structure the LiveKit features cleanly, keeping them isolated.

---

## Complexity Tracking

*No constitution violations present. No exceptions registered.*
