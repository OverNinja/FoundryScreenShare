# Implementation Plan: Dedicated Screen Share Controls

**Branch**: `005-screenshare-tool-group` | **Date**: 2026-07-09 | **Spec**: [spec.md](file:///C:/Users/Lucas/projects/screen-share/specs/005-screenshare-tool-group/spec.md)

**Input**: Feature specification from `specs/005-screenshare-tool-group/spec.md`

## Summary

This feature relocates the screen share trigger control to its own dedicated toolbar group on the left canvas controls. It introduces two new tools into this group: a flag removal tool to unflag any active screen container in the scene, and a backend selection tool that opens a dialog to manage and choose streaming providers (complying with Decoupled Transmission).

---

## Technical Context

**Language/Version**: ES6 JavaScript (compatible with Foundry VTT v14)

**Primary Dependencies**: Foundry VTT v14 APIs, PixiJS (provided by Foundry VTT)

**Storage**: Client-scoped settings (`game.settings` for active backend), Document flags (`flags.screen-share.isScreenContainer` on Tile/Region)

**Testing**: Manual verification using browser developer tools and UI verification scripts in Foundry VTT

**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari) running Foundry VTT v14

**Project Type**: Foundry VTT Module

**Performance Goals**: Controls render on toolbar setup instantly (<1s of canvas load); flag removal database writes and UI dialog rendering execute in under 200ms

**Constraints**: GM-only visibility and authorization gates (`game.user.isGM`)

**Scale/Scope**: 1 custom SceneControl group with 3 sub-tools (toggle, button, dialog button), 1 client setting, 1 dialog class instance

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Decoupled Transmission Strategy**: **PASS**. Active provider instantiation is decoupled behind the `screen-share.activeBackend` client setting. Future streaming providers will register themselves in `ScreenShare.PROVIDERS` and integrate with the backend selection dialog without modifying the toolbar or canvas render logic.
- **Principle II: Explicit WebGL & Network Lifecycle Management**: **PASS**. Clicking the "Remove Screen Container Mark" button automatically calls `stopShare()` if a stream is active, executing full PixiJS, DOM, and WebRTC channel cleanup before deleting the flag from the database.
- **Principle III: Foundry VTT v14 API Standard Compliance**: **PASS**. Integrates with Foundry's custom control layout via the `getSceneControlButtons` hook and native Document updates, supporting both v13 and v14 tool list structure formats.
- **Principle IV: Dual-Role Signaling & Connection Architecture**: **PASS**. Visible gates restrict control groups, backend settings, and dialog access strictly to authorized Gamemasters (`game.user.isGM`).
- **Principle V: Masked PixiJS Canvas Rendering**: **PASS**. Not modified directly, but conserved and cleaned up properly.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-screenshare-tool-group/
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
screen-share.js          # Main module script containing hooks and logic
module.json              # Module manifest
```

**Structure Decision**: Single-file project layout. All changes will be encapsulated within `screen-share.js` and registered dynamically via standard Foundry VTT hooks.

---

## Complexity Tracking

*No constitution violations present. No exceptions registered.*
