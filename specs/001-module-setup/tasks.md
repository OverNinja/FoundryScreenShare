# Tasks: Module Setup and Initialization

**Input**: Design documents from `specs/001-module-setup/`

**Prerequisites**: [plan.md](file:///C:/Users/Lucas/projects/screen-share/specs/001-module-setup/plan.md) (required), [spec.md](file:///C:/Users/Lucas/projects/screen-share/specs/001-module-setup/spec.md) (required for user stories), [research.md](file:///C:/Users/Lucas/projects/screen-share/specs/001-module-setup/research.md), [data-model.md](file:///C:/Users/Lucas/projects/screen-share/specs/001-module-setup/data-model.md), [quickstart.md](file:///C:/Users/Lucas/projects/screen-share/specs/001-module-setup/quickstart.md)

**Tests**: Verification is performed manually via browser developer tools and UI verification scripts (no automated testing framework required).

**Organization**: Tasks are grouped by setup, foundation, and user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2)
- Exact file paths are specified in descriptions where relevant.

## Path Conventions

- Paths are project-relative to the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial repository environment and folder layout.

- [X] T001 Create project structure and directory layout per implementation plan
- [X] T002 Initialize Git repository and write .gitignore at repository root
- [X] T003 [P] Create configuration template file .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Module integration scaffolding required before implementing specific user stories.

**⚠️ CRITICAL**: Setup and foundational phases must be completed before starting any user story tasks.

- [X] T004 Create module manifest file module.json
- [X] T005 Create JavaScript module entry script screen-share.js

**Checkpoint**: Foundation ready - the module is structured, but has no installation mechanism or features.

---

## Phase 3: User Story 1 - Project Environment Setup (Priority: P1) 🎯 MVP

**Goal**: Establish symlink installation scripts so developers can link the module to their local Foundry VTT.

**Independent Test**: Verify that the symlink script executes without errors, creates a valid symlink to the repository under the target modules folder, and handles errors gracefully.

### Implementation for User Story 1

- [X] T006 [US1] Create Windows symlinking PowerShell script link-module.ps1
- [X] T007 [P] [US1] Create Unix symlinking bash script link-module.sh
- [X] T008 [US1] Write local configuration to .env and run symlinking scripts to target modules folder

**Checkpoint**: At this point, the module is successfully installed and visible in the Foundry VTT module manager list.

---

## Phase 4: User Story 2 - Basic Scene Control Button (Priority: P2)

**Goal**: Add a custom control button under the canvas Regions layer that is visible only to GMs.

**Independent Test**: Enable the module, log in as GM, navigate to the Regions layer, and verify the button is visible and triggers a notification popup. Log in as a player and verify it is not visible.

### Implementation for User Story 2

- [X] T009 [US2] Hook into getSceneControlButtons in screen-share.js to append button to regions control
- [X] T010 [US2] Add visibility filter based on game.user.isGM inside getSceneControlButtons hook in screen-share.js
- [X] T011 [US2] Implement click callback with ui.notifications popup inside getSceneControlButtons hook in screen-share.js

**Checkpoint**: The Scene Control UI integration is complete and visible only to authorized users.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and clean-up.

- [X] T012 Verify all manual validation steps in specs/001-module-setup/quickstart.md
- [X] T013 Perform clean code review and check for console errors in browser developer tools

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion (can run in parallel with US1).
- **Polish (Phase 5)**: Depends on all user stories (Phase 3 and Phase 4) completion.

### Parallel Opportunities

- Tasks marked with `[P]` can run in parallel with other tasks in the same phase:
  - `T003` can run in parallel with `T002`.
  - `T007` can run in parallel with `T006`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate module detection in Foundry VTT.

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready.
2. Add US1 -> Verify installation works -> Deployable scaffold.
3. Add US2 -> Verify tool button is visible for GM -> UI validated.
4. Run final validation and polish.
