# Tasks: Tile and Region Screen Share Container

**Input**: Design documents from `/specs/004-tile-screen-container/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume single project module structure with `screen-share.js` and `module.json` at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and manifest validation

- [x] T001 Verify configuration and version compatibility in module.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and utility helper functions required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Refactor getScreenContainer helper in screen-share.js to scan both Region and Tile documents in the scene
- [x] T003 Implement the unified single container validation helper in screen-share.js to check for active containers of any type in the active scene

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Mark a Tile as the Screen Container (Priority: P1) 🎯 MVP

**Goal**: Allow GMs to mark a Tile on the canvas as the recipient for the screen share stream in TileConfig config sheets

**Independent Test**: Create a Tile, open its config sheet, toggle "Screen Share Container", save, and verify that the flag is persisted.

### Implementation for User Story 1

- [x] T004 [US1] Register renderTileConfig hook in screen-share.js to inject the checkbox
- [x] T005 [US1] Implement checkbox toggle state saving and disabling logic in renderTileConfig in screen-share.js
- [x] T006 [US1] Register updateTile and deleteTile hooks in screen-share.js to refresh open configuration windows when flags change

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Cross-Type Single Container Restriction (Priority: P1)

**Goal**: Disable the container checkbox on all Regions if a Tile is marked, and vice-versa, displaying a status message

**Independent Test**: Mark Region A as container; open Tile B config and check that the checkbox is disabled with a status message.

### Implementation for User Story 2

- [x] T007 [US2] Update the renderRegionConfig hook in screen-share.js to scan for active Tile containers and disable the toggle with a hint message
- [x] T008 [US2] Verify and adjust the updateRegion and deleteRegion hooks in screen-share.js to trigger config updates when flags change

**Checkpoint**: At this point, the cross-type single container restriction is fully functional across both Regions and Tiles.

---

## Phase 5: User Story 3 - Stream Rendering parity for Tiles and Regions (Priority: P1)

**Goal**: Render the media stream within the marked Tile's bounds in the same way as Region rendering

**Independent Test**: Start sharing with a Tile marked as container, verify video feed renders inside the Tile's bounds and transforms/rotates with the Tile.

### Implementation for User Story 3

- [x] T009 [US3] Update startShare in screen-share.js to resolve either a RegionDocument or TileDocument as the stream container target
- [x] T010 [US3] Update renderStream in screen-share.js to append the video-backed sprite container as a child of the placeable TileObject on the canvas
- [x] T011 [US3] Update stopShare in screen-share.js to detach the video container from the TileObject and destroy WebGL textures on stream termination

**Checkpoint**: All user stories are now independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, verification, and documentation

- [x] T012 Run manual validation scenarios in specs/004-tile-screen-container/quickstart.md to verify end-to-end functionality
- [x] T013 Update code comments and clean up unused console logs in screen-share.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): MVP milestone, implements Tile configuration flag
  - User Story 2 (P2): Depends on User Story 1 for validation context (disabling Region controls when a Tile is marked)
  - User Story 3 (P3): Depends on User Story 1 & 2 for stream routing and container resolution
- **Polish (Phase 6)**: Depends on all user stories being complete

### Parallel Opportunities

- Since all tasks are within `screen-share.js`, they must be completed sequentially to avoid file system edit collisions. No parallel tasks across different files are designated.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Verify the flag saves correctly on Tile documents

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Tile configuration ready
3. Add User Story 2 → Test cross-type disable constraint → Restrictions active
4. Add User Story 3 → Test Tile canvas video stream rendering → Feature complete
5. Run final validation in Phase 6
