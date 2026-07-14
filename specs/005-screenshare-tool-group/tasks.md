# Tasks: Dedicated Screen Share Controls

**Input**: Design documents from `specs/005-screenshare-tool-group/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL. In this feature, we rely on manual verification scenarios documented in `quickstart.md` using Foundry's developer tools. No automated unit/integration tests are requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project settings and registry initialization

- [X] T001 Configure client-side settings registration for the active streaming backend in screen-share.js
- [X] T002 Initialize the streaming provider registry ScreenShare.PROVIDERS in screen-share.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Refactor startShare() in screen-share.js to dynamically resolve the active provider based on the settings

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Dedicated Tool Group with Start/Stop Button (Priority: P1) 🎯 MVP

**Goal**: Relocate the screen share trigger button to its own sidebar tool group.

**Independent Test**: Open Foundry VTT as the GM, check the left vertical sidebar for "Screen Share Controls" icon (`fas fa-desktop`), verify clicking it displays the "Start/Stop Screen Share" tool, and verify that the button is no longer under the "Regions" tool group.

### Implementation for User Story 1

- [X] T004 [US1] Register the new Scene Control group in the getSceneControlButtons hook in screen-share.js
- [X] T005 [US1] Move the screen-share-toggle tool registration to the new screen-share group in screen-share.js
- [X] T006 [US1] Update the updateToggleState() function to target the new screen-share group in screen-share.js

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently (MVP complete).

---

## Phase 4: User Story 2 - Remove Screen Share Container Flag (Priority: P1)

**Goal**: Implement a toolbar button to quickly clear the screen container flag from any Region or Tile.

**Independent Test**: Mark a Tile or Region as the screen container, click the trash-alt icon in the screen share tool group, verify the container is unflagged and any active stream is stopped.

### Implementation for User Story 2

- [X] T007 [US2] Add the remove-container-flag tool definition to the screen-share control group in screen-share.js
- [X] T008 [US2] Implement the click handler for remove-container-flag to stop sharing and clear the flag in screen-share.js

**Checkpoint**: User Story 2 is fully functional and integrates with User Story 1.

---

## Phase 5: User Story 3 - Streaming Backend Selection Dialog (Priority: P2)

**Goal**: Implement a backend selection button that opens a dialog to select the active streaming backend.

**Independent Test**: Click the cogs icon in the screen share tool group, select "Local Screen Share" in the dialog, click save, and verify that the client setting is updated.

### Implementation for User Story 3

- [X] T009 [US3] Add the backend-selection tool definition to the screen-share control group in screen-share.js
- [X] T010 [US3] Implement openBackendSelectionDialog() to render the select dialog in screen-share.js
- [X] T011 [US3] Add the save callback to the Dialog to write the setting in screen-share.js

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the entire system and clean up.

- [X] T012 Run the verification steps in specs/005-screenshare-tool-group/quickstart.md to confirm the entire feature works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) -> User Story 2 (P1) -> User Story 3 (P2)
- **Polish (Final Phase)**: Depends on all user stories being complete

---

## Parallel Opportunities

- Since all implementation is confined to a single file (`screen-share.js`), tasks cannot be executed in parallel (no `[P]` markers) to avoid code merge conflicts. Implementation should be completed sequentially task-by-task.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocking prerequisites)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify the new tool group and button show up for GMs and start/stop screen sharing.

### Incremental Delivery

1. Setup + Foundational
2. Add User Story 1 -> Validate (MVP!)
3. Add User Story 2 -> Validate
4. Add User Story 3 -> Validate
5. Each story builds on top of the last without regressions.
