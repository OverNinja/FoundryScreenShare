# Implementation Plan: Tile and Region Screen Share Container

**Branch**: `master` | **Date**: 2026-07-09 | **Spec**: [spec.md](file:///C:/Users/Lucas/projects/screen-share/specs/004-tile-screen-container/spec.md)

**Input**: Feature specification from `/specs/004-tile-screen-container/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Expand the screen sharing container recipient option to Tiles, ensuring that at most one screen container (either a Region or a Tile) can be active in the scene at any time. When a Tile is marked, the video stream will render within the Tile's bounds in the same synchronized, high-performance manner as Region rendering.

## Technical Context

**Language/Version**: ES6 JavaScript (compatible with Foundry VTT v14)

**Primary Dependencies**: Foundry VTT v14 API, PixiJS (v8, provided by Foundry VTT)

**Storage**: Foundry Document Flags (`screen-share.isScreenContainer` stored via Document flags API on Region and Tile documents)

**Testing**: Manual verification checks (simulating GM/Player client roles)

**Target Platform**: Modern Web Browsers (Chrome, Firefox, Safari, Edge) supporting WebRTC & getDisplayMedia

**Project Type**: Foundry VTT v14 Module

**Performance Goals**: Start/Stop streaming transitions under 500ms, WebGL memory/texture cleanup under 500ms, maintaining 60 fps canvas rendering during streaming

**Constraints**: Secure browser context (HTTPS or localhost) required for getDisplayMedia API, strict limit of single screen container per scene

**Scale/Scope**: 1 active scene at a time, up to hundreds of Tiles/Regions in a scene, single active GM stream sender

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Decoupled Transmission Strategy**: The core display logic and rendering target system remain decoupled from the stream source/WebRTC layer. Checked: Pass.
- **Principle II: Explicit WebGL & Network Lifecycle Management**: All textures, sprites, video nodes, and event listeners must be explicitly destroyed and released on stream termination. For Tiles, this includes removing the video container from the `Tile` placeable object and freeing associated sprites/textures. Checked: Pass.
- **Principle III: Foundry VTT v14 API Standard Compliance**: The module uses native Foundry VTT v14 APIs. For tiles, it uses `renderTileConfig` hook and `updateTile` / `deleteTile` document events. Legacy drawing tools or hacks are prohibited. Checked: Pass.
- **Principle IV: Dual-Role Signaling & Connection Architecture**: Restricts screen sharing controls and media capture to GM role (`game.user.isGM`). Non-GM users do not have access to start screen sharing or TileConfig toggle interaction. Checked: Pass.
- **Principle V: Masked PixiJS Canvas Rendering**: The rendering utilizes PixiJS to draw the stream exactly within the container boundaries. For Tiles, it aligns with its coordinate space and dimensions. Checked: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-tile-screen-container/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
.specify/
AGENTS.md
module.json
screen-share.js
specs/
```

**Structure Decision**: Single-file javascript module (`screen-share.js`) and `module.json` manifest. No subdirectories for source code are needed, conforming to the current codebase layout.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No constitution violations identified)*
