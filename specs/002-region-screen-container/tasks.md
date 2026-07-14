# Tasks: Region Screen Container Marking

**Input**: Design documents from `specs/002-region-screen-container/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required for user stories), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Tests**: No automated test tasks are generated as testing is performed manually in the Foundry VTT environment.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume single project layout: `screen-share.js`, `module.json` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify repository status and readiness for feature additions.

- [x] T001 Verify project structure and configuration files at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and utility functions for flag operations.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Implement flag utility functions for region screen container checking in `screen-share.js`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Mark a Region as the Screen Container (Priority: P1) 🎯 MVP

**Goal**: Allow a GM to mark a specific Region on the scene canvas as the recipient for a shared screen by toggling an option on the Appearance tab.

**Independent Test**: Follow Scenario 1 in [quickstart.md](quickstart.md) to create a region, configure it, and check the saved flag.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create the HTML template or string representing the Screen Share Container checkbox field in `screen-share.js`
- [x] T004 [US1] Register `renderRegionConfig` hook to inject the Screen Share Container checkbox at the end of the Appearance tab in `screen-share.js`
- [x] T005 [US1] Ensure the injected checkbox correctly reflects the current state of the region flag and supports standard document sheet saving via the `name` attribute in `screen-share.js`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Prevent Multiple Screen Containers per Scene (Priority: P2)

**Goal**: Prevent multiple regions in a single scene from being marked as the screen container by disabling the control and displaying a conflict warning note if another container is already defined.

**Independent Test**: Follow Scenario 2 & 3 in [quickstart.md](quickstart.md) to check conflict warnings and automatic enablement upon deletion.

### Implementation for User Story 2

- [x] T006 [US2] Implement scene-wide scan logic in `screen-share.js` to find any other region in the current scene with the container flag active
- [x] T007 [US2] Update the `renderRegionConfig` hook callback to disable the checkbox and append the warning note if another container region is detected in the scene in `screen-share.js`

**Checkpoint**: User Stories 1 and 2 work seamlessly together.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quality checks, code formatting, and quickstart validation.

- [x] T008 Run the validation scenarios in `specs/002-region-screen-container/quickstart.md` in local Foundry VTT v14 environment
- [x] T009 Refactor and clean up the `renderRegionConfig` hook implementation and flag logic in `screen-share.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phases 3 and 4)**: Depend on Foundational phase completion.
  - Phase 3 (US1) is implemented first to establish the container marking.
  - Phase 4 (US2) is implemented second to add validation rules.
- **Polish (Phase 5)**: Depends on all user stories being complete.

### Parallel Opportunities

- T003 can be prepared in parallel with foundational setup since it only defines HTML templates/helper markup.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently following Scenario 1 of `quickstart.md`.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (MVP!)
3. Add User Story 2 → Test conflict states and deletion cleanup
4. Final polish and verification.
