# Implementation Plan: Foundry v13 Tile Compatibility

**Branch**: `008-v13-tile-compatibility` | **Date**: 2026-07-13 | **Spec**: [spec.md](file:///C:/Users/Lucas/projects/screen-share/specs/008-v13-tile-compatibility/spec.md)

**Input**: Feature specification from `/specs/008-v13-tile-compatibility/spec.md`

## Summary

This feature adds compatibility for Foundry VTT v13 (tile-only mode) to the Screen Share module. We will dynamically inspect the Foundry VTT version at startup. If running in a v13 world, the module will bypass all region-related config rendering, hooks, and stream targeting. In both v13 and v14, the dedicated `"screen-share"` control group will not specify a canvas `layer` property, thereby keeping the GM's active canvas layer selection active when clicked.

## Technical Context

**Language/Version**: JavaScript (ES6 Modules)

**Primary Dependencies**: None (Foundry VTT and PixiJS core APIs)

**Storage**: Persistent flags on Foundry VTT `Tile` document (`flags["screen-share"].isScreenContainer`)

**Testing**: Manual validation scenarios documented in `quickstart.md`

**Target Platform**: Foundry VTT v13 and v14

**Project Type**: Foundry VTT Module

**Performance Goals**: Stream starts rendering in <1s, clean teardown <500ms

**Constraints**: Bypassing v14-only classes/APIs on v13 to prevent ReferenceErrors or hook registration failures.

**Scale/Scope**: Small adaptation changes in version checking, controls layer specification, and UI hook gating.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Decoupled Transmission Strategy**: Passed. Communication providers (Local, WebRTC, LiveKit) remain completely separated from the rendering/lifecycle logic.
- **Principle II: Explicit WebGL & Network Lifecycle Management**: Passed. Sprite and offscreen video cleanup functions identically.
- **Principle III: Foundry VTT v14 API Standard Compliance**: Adapted. The module remains fully compliant with the RegionDocument API and Scene Regions when running in a v14 environment. For v13, the code gracefully degrades to support Tiles only without loading v14-specific hooks.
- **Principle IV: Dual-Role Signaling & Connection Architecture**: Passed. Role gating (`game.user.isGM`) is preserved across both version environments.
- **Principle V: Masked PixiJS Canvas Rendering**: Passed. Masked PixiJS canvas rendering is utilized for Regions on v14. On v13, tile boundaries are mapped directly using the Tile's width/height without polygon masking.

## Project Structure

### Documentation (this feature)

```text
specs/008-v13-tile-compatibility/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Runtime states and lifecycles
├── quickstart.md        # Verification scenario guide
└── contracts/
    └── api.md           # API/Hooks interface specifications
```

### Source Code (repository root)

```text
src/
├── constants.js         # Shared version detection constants
├── helpers.js           # Container resolution helpers
├── settings.js          # Module settings registration
├── providers/           # Streaming backend classes
│   ├── base.js
│   ├── local.js
│   ├── webrtc.js
│   └── livekit.js
├── rendering/
│   └── session.js       # PIXI / Video rendering session
└── ui/
    ├── config.js        # Config sheet hook injections
    ├── controls.js      # Scene control buttons
    └── dialog.js        # Backend selection dialog
```

**Structure Decision**: Single project module structure is maintained.

## Complexity Tracking

*No violations.*
