# Tasks: Local Screen Share Capture and Local Rendering

**Input**: Design documents from `/specs/003-local-screen-share/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required for user stories), [research.md](research.md), [data-model.md](data-model.md), [contracts/api.md](contracts/api.md)

**Tests**: Tests are manual-only for this phase, as end-to-end browser media capture streams and WebGL canvas elements are verified via the manual verification scenarios in [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/methods, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `screen-share.js` is the main module source file at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize structure and verify module settings

- [X] T001 Implement module initialization checks and state structure under `globalThis.ScreenShare` in `screen-share.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core media capture interfaces and global manager methods

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Implement abstract `StreamProvider` class and concrete `LocalStreamProvider` class in `screen-share.js`
- [X] T003 Implement global methods `ScreenShare.startShare()` and `ScreenShare.stopShare()` with GM checks in `screen-share.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in sequence

---

## Phase 3: User Story 1 - Start Screen Capture (Priority: P1) 🎯 MVP

**Goal**: Click control toggle button to capture screen via browser selection prompt.

**Independent Test**: Clicking the toggle button launches the browser screen selection dialog, and cancelling it resets the state cleanly. Verified by Scenario 1 & 2 in [quickstart.md](quickstart.md).

### Implementation for User Story 1

- [X] T004 [US1] Update the `screen-share-toggle` tool `onClick` callback to invoke `ScreenShare.startShare` or `ScreenShare.stopShare` based on toggle state in `screen-share.js`
- [X] T005 [US1] Implement active container region validation checks in `ScreenShare.startShare` to warn and abort if no container exists in `screen-share.js`
- [X] T006 [US1] Register callback for browser media track `ended` events to update controls toggle and trigger teardown in `screen-share.js`

**Checkpoint**: User Story 1 is functional and testable independently. GMs can trigger screen selection and handle cancellation.

---

## Phase 4: User Story 2 - Local Rendering within Screen Container Region (Priority: P1)

**Goal**: Render the captured stream on the canvas, cropped to the region's polygon boundary.

**Independent Test**: Captured screen feed plays on the canvas, crops exactly to the container's geometry, and responds to zoom/pan. Verified by Scenario 3 in [quickstart.md](quickstart.md).

### Implementation for User Story 2

- [X] T007 [US2] Create off-screen `<video>` element, play the MediaStream, and instantiate a `PIXI.Texture` from the video element in `screen-share.js`
- [X] T008 [US2] Extract polygon points from the region's PlaceableObject and draw a `PIXI.Graphics` masking geometry in `screen-share.js`
- [X] T009 [US2] Calculate the bounding box of the region's polygons to size, scale, and position the video sprite in `screen-share.js`
- [X] T010 [US2] Create a masked PIXI Container holding the video sprite and mask, and append it as a child of the `RegionObject` on the canvas in `screen-share.js`

**Checkpoint**: User Stories 1 and 2 are functional together. The GM can share their screen and view it rendered locally in the designated region.

---

## Phase 5: User Story 3 - Stop Screen Share and Memory Cleanup (Priority: P1)

**Goal**: Stop stream tracks and cleanly release all WebGL textures and DOM resources.

**Independent Test**: Stopping the share cleans all DOM nodes and PIXI textures, freeing memory and restoring the region's default look. Verified by Scenarios 4 & 5 in [quickstart.md](quickstart.md).

### Implementation for User Story 3

- [X] T011 [US3] Implement stream track stop calls and detach/remove the hidden `<video>` element from the DOM in `screen-share.js`
- [X] T012 [US3] Implement texture destruction (`texture.destroy(true)`) and remove custom sprites and containers from the `RegionObject` in `screen-share.js`
- [X] T013 [US3] Ensure the region repaints to its default canvas representation upon stream termination in `screen-share.js`

**Checkpoint**: All core user stories are complete. Both start, local render, and stop/cleanup lifecycles are fully functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, scene transitions, and code documentation

- [X] T014 Implement hook listeners to automatically stop and clean up active screen sharing on scene change in `screen-share.js`
- [X] T015 Run manual verification scenarios defined in `specs/003-local-screen-share/quickstart.md`
- [X] T016 Perform code cleanup, refactor helper methods, and document functions in `screen-share.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - Sequentially in priority order (P1: US1 → P1: US2 → P1: US3).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (US1)**: First priority - can start after Foundational (Phase 2).
- **User Story 2 (US2)**: Depends on having a captured stream (US1) to render on the canvas.
- **User Story 3 (US3)**: Depends on active rendering (US2) to tear down and clean up.

---

## Parallel Example: User Story 2

Since the module logic is concentrated in a single entry point (`screen-share.js`), the tasks are sequential by layer rather than parallel files. However:

```bash
# Once US1 is ready, tasks for canvas rendering prep can run in parallel:
Task: "Create off-screen <video> element and instantiate a PIXI.Texture in screen-share.js"
Task: "Extract polygon points and draw PIXI.Graphics masking geometry in screen-share.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Capturing stream)
4. Complete Phase 4: User Story 2 (Canvas local rendering)
5. **STOP and VALIDATE**: Test local rendering and capture flow using Scenario 3 in [quickstart.md](quickstart.md).

### Incremental Delivery

1. Setup + Foundational → Interface hooks in place.
2. Add User Story 1 → Verify browser popup.
3. Add User Story 2 → Verify canvas video preview.
4. Add User Story 3 → Verify memory cleanup and stop events.
5. Polish → Support scene transitions and final cleanup.
