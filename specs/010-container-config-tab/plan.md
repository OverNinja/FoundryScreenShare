# Implementation Plan: Container Configuration Tab

**Branch**: `010-container-config-tab` | **Date**: 2026-07-13 | **Spec**: [spec.md](file:///C:/Users/Lucas/projects/screen-share/specs/010-container-config-tab/spec.md)

**Input**: Feature specification from `/specs/010-container-config-tab/spec.md`

## Summary

This feature adds a dedicated "Screen Share" tab to the configuration sheets of all valid containers (Regions, Tiles, and Drawings). The tab relocates the existing "Screen Share Container" checkbox toggle and introduces settings for fit mode, maximum capture frame rate, and maximum capture resolution. These settings default to the global module settings (using dynamic labels to display active defaults) but are changeable on a per-container basis. The rendering session and media stream capture logic will read and apply these overridden settings.

## Technical Context

**Language/Version**: JavaScript (ES6 Modules)

**Primary Dependencies**: None (Foundry VTT and PixiJS core APIs)

**Storage**: Persistent namespaced document flags on `Region`, `Tile`, and `Drawing` documents (`flags["screen-share"].*`) and world/client settings.

**Testing**: Manual validation scenarios documented in `quickstart.md`

**Target Platform**: Foundry VTT v13 and v14

**Project Type**: Foundry VTT Module

**Performance Goals**: Render with resolved fit mode in <200ms on start or configuration updates.

**Constraints**: Maintain full v13/v14 compatibility, ensuring region-specific configuration logic is executed only on v14+.

**Scale/Scope**: Small-to-medium changes to config UI hooks, stream capture constraint building, and PIXI sprite rendering scale/offset calculations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Decoupled Transmission Strategy**: Passed. Media streaming mechanisms (WebRTC, LiveKit) remain decoupled. Configuration resolution builds standard media constraints passed directly to the active stream provider.
- **Principle II: Explicit WebGL & Network Lifecycle Management**: Passed. Re-rendering configurations and toggling flags clean up and rebuild PIXI sprites and textures explicitly.
- **Principle III: Foundry VTT v14 API Standard Compliance**: Passed. Gating `RegionConfig` injection to v14, while supporting `TileConfig` and `DrawingConfig` natively across both v13 and v14.
- **Principle IV: Dual-Role Signaling & Connection Architecture**: Passed. Role gating (`game.user.isGM`) is strictly preserved across all configuration tab injections and settings adjustments.
- **Principle V: Masked PixiJS Canvas Rendering**: Passed. Video fit modes (Contain, Cover, Fill) are calculated based on canvas boundaries. A rectangular mask is applied to Tile and Drawing sprites to clip cover overflows, matching the polygon masking of Regions.

## Project Structure

### Documentation (this feature)

```text
specs/010-container-config-tab/
├── plan.md              # This file
├── research.md          # Research findings (aspect ratio math and tab injection)
├── data-model.md        # Settings schemas and flag keys
├── quickstart.md        # Manual verification scenarios
└── contracts/
    └── settings-and-rendering.md # Custom media constraints and scaling contract
```

### Source Code (repository root)

```text
src/
├── constants.js         # Shared constants
├── helpers.js           # Container resolution helpers
├── settings.js          # Module settings registration
├── providers/           # Streaming backend classes
│   ├── base.js
│   ├── local.js
│   ├── webrtc.js
│   └── livekit.js
├── rendering/
│   ├── session.js       # PIXI / Video rendering session coordinator
│   ├── renderers.js     # Unified RENDERERS registry aggregator
│   └── renderers/       # Subfolder for modular canvas renderer classes
│       ├── base-renderer.js
│       ├── tile-renderer.js
│       ├── drawing-renderer.js
│       └── region-renderer.js
└── ui/
    ├── config.js        # Config sheet hook injections
    ├── controls.js      # Scene control buttons
    └── dialog.js        # Backend selection dialog
```

**Structure Decision**: Single project module structure is maintained.

## Complexity Tracking

*No violations.*
