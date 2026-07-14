# Tasks: Foundry v13 Tile Compatibility

**Input**: Design documents from `/specs/008-v13-tile-compatibility/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - no automated test suite changes are requested for this feature. All verification is manual.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume single project: `src/` and root level files (e.g., `module.json`, `screen-share.js`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure updates

- [X] T001 Update compatibility minimum version to "13" in module.json
- [X] T002 [P] Implement version detection helper function `isV14OrLater` in src/helpers.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Export version checking helper and integrate in main entry point screen-share.js

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Tile Screen Share on Foundry v13 (Priority: P1) 🎯 MVP

**Goal**: Enable GMs running Foundry VTT v13 to share screens using Tiles as containers.

**Independent Test**: Mark a Tile as the screen container in a v13 world, start screen sharing, and verify that the video stream renders correctly within the Tile's boundaries and adjusts to transforms (movement/rotation).

### Implementation for User Story 1

- [X] T004 [US1] Verify and ensure PIXI rendering fallback for Tile container in src/rendering/session.js is fully compatible with v13

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently in a v13 environment.

---

## Phase 4: User Story 2 - UI Control Layer Association (Priority: P2)

**Goal**: Register the dedicated screen-share control group without layer association, preserving the currently selected layer.

**Independent Test**: Select a canvas layer (like Tokens), click the screen-share controls group icon, and verify that the active canvas layer does not change.

### Implementation for User Story 2

- [X] T005 [US2] Modify dedicated control group registration in src/ui/controls.js to omit the `layer` property (set to null)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Graceful Feature Degradation (Priority: P2)

**Goal**: Ensure region-specific hooks, sheets, and features do not load or execute on v13, preventing runtime ReferenceErrors.

**Independent Test**: Run the module on v13 and verify that no Hooks for regions are registered and no console errors occur during initialization.

### Implementation for User Story 3

- [X] T006 [US3] Gate renderRegionConfig, updateRegion, and deleteRegion hooks in src/ui/config.js behind version check helper

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and validation

- [X] T007 Run all manual validation scenarios in specs/008-v13-tile-compatibility/quickstart.md
- [X] T008 [P] Perform codebase cleanup and verify there are no console warnings or errors on v13/v14 load

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel or sequentially (P1 → P2 → P3).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2).
- **User Story 3 (P3)**: Can start after Foundational (Phase 2).

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel.
- Once Foundational phase completes, all user stories (P1, P2, P3) can be implemented in parallel.

---

## Parallel Example: User Story 2 & 3

```bash
# Developers can work on UI Controls and Config Hook gating in parallel:
Task: "Modify dedicated control group registration in src/ui/controls.js to omit the layer property"
Task: "Gate renderRegionConfig, updateRegion, and deleteRegion hooks in src/ui/config.js behind version check helper"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (T003).
3. Complete Phase 3: User Story 1 (T004).
4. **STOP and VALIDATE**: Verify Tile screen sharing works on v13.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!).
3. Add User Story 2 → Test independently → Deploy/Demo.
4. Add User Story 3 → Test independently → Deploy/Demo.
