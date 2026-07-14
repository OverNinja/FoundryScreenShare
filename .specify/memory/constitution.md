<!--
Sync Impact Report:
- Version change: none -> 1.0.0
- List of modified principles: Initial ratification of the constitution
  - I. Decoupled Transmission Strategy (new)
  - II. Explicit WebGL & Network Lifecycle Management (new)
  - III. Foundry VTT v14 API Standard Compliance (new)
  - IV. Dual-Role Signaling & Connection Architecture (new)
  - V. Masked PixiJS Canvas Rendering (new)
- Added sections: Core Principles, Technical & Architectural Constraints, Quality & Development Standards, Governance
- Removed sections: None
- Templates requiring updates:
  - C:\Users\Lucas\projects\screen-share\.specify\templates\plan-template.md (✅ updated / no changes needed)
  - C:\Users\Lucas\projects\screen-share\.specify\templates\spec-template.md (✅ updated / no changes needed)
  - C:\Users\Lucas\projects\screen-share\.specify\templates\tasks-template.md (✅ updated / no changes needed)
  - C:\Users\Lucas\projects\screen-share\.specify\templates\checklist-template.md (✅ updated / no changes needed)
- Follow-up TODOs: None
-->

# Screen Share Constitution

This constitution outlines the core design principles, technical guidelines, and governance
rules for the Foundry VTT v14 Screen Share module.

## Core Principles

### I. Decoupled Transmission Strategy
The core module logic (UI controls, Canvas handling, and PixiJS rendering) must remain fully
decoupled from any specific streaming/transmission technology. All video streaming and media
exchanges must be routed through the abstract `StreamProvider` interface, allowing alternative
transmission implementations (e.g., LiveKit, WebSockets) to be introduced in the future without
modifying the core module codebase.

**Rationale**: Promotes future extensibility, vendor/technology independence, and isolates
the core display logic from volatile streaming APIs.

### II. Explicit WebGL & Network Lifecycle Management
To prevent resource and WebGL memory leaks on the Foundry canvas, clients must explicitly
destroy and release all streaming-related assets immediately when a stream stops or transitions.
This includes destroying all active `PIXI.Texture` objects, removing dynamically created hidden
`<video>` elements from the DOM, and closing all open `RTCPeerConnection` channels.

**Rationale**: Unreleased WebGL textures and connection handles rapidly degrade canvas
performance, leading to browser crashes during long gaming sessions.

### III. Foundry VTT v14 API Standard Compliance
The module must align strictly with the modern APIs and structures introduced in Foundry VTT v14.
Specifically, it must use the `RegionDocument` API and Scene Regions to define the rendering target
area, and custom Scene Region Behaviors or flags for stream targets. Legacy drawing tools or canvas
overlay hacks are strictly prohibited.

**Rationale**: Adhering to native APIs ensures forward compatibility, makes use of optimized V14
rendering paths, and prevents future deprecation issues.

### IV. Dual-Role Signaling & Connection Architecture
The signaling architecture must distinguish client roles using native `game.socket` communication:
the Gamemaster (GM) acts as the single stream sender and coordinator, while players (non-GMs) act
strictly as receivers. Media capture API invocation (`navigator.mediaDevices.getDisplayMedia`) must
be gated behind explicit GM role checks, and signaling pathways must handle client connection and
disconnection events dynamically.

**Rationale**: Foundry socket permissions and system security require restricting media capture
commands and broad canvas overrides to authorized GMs.

### V. Masked PixiJS Canvas Rendering
The client-side rendering pipeline must dynamically retrieve the designated "Screen Share Target"
Region on the canvas and apply an exact polygon-shaped mask corresponding to the region's boundaries
to crop the video stream. The canvas must repaint cleanly and restore the region to its default
visual representation when the stream is terminated.

**Rationale**: Video feeds must fit precisely within the custom layouts defined by the GM without
overflowing onto other elements of the gaming canvas.

## Technical & Architectural Constraints

- **Runtime Environment**: Built specifically for Foundry VTT v14 using modern ES6 modules.
- **Media API**: GM capture utilizes native `navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })` to guarantee high-performance, audio-free screen capture.
- **Dependency Limits**: External video players or complex media framework dependencies are prohibited. Modern browser WebRTC APIs and PixiJS (provided by Foundry) must be the primary building blocks.

## Quality & Development Standards

- **Verification Protocols**: Because end-to-end media streams are difficult to test in headless CI environments, a detailed manual verification checklist (modeling host/client connections) must be run for all core changes.
- **Strict Role Gates**: Programmatic verification of the user's role (e.g., `game.user.isGM`) is mandatory before exposing any screen sharing controls or handling stream signals.
- **Memory Auditing**: Pull requests that modify the canvas rendering lifecycle or WebRTC connection management must verify texture deletion and socket cleanup.

## Governance

- **Governance Authority**: This constitution defines the core architectural and implementation constraints. Any changes to these rules require a formal amendment and version bump.
- **Versioning Policy**: The constitution uses Semantic Versioning:
  - **MAJOR**: Changes that remove or redefine existing principles.
  - **MINOR**: Additions of new principles, sections, or guidelines.
  - **PATCH**: Non-semantic corrections, typos, and minor clarifications.
- **Amendment Procedure**: Amendments require drafting the updated rules, documenting changes in the Sync Impact Report at the top of the file, updating the version, and ensuring dependent planning templates remain aligned.

**Version**: 1.0.0 | **Ratified**: 2026-07-09 | **Last Amended**: 2026-07-09
