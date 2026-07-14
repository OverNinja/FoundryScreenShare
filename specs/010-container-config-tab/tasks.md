# Tasks: Container Configuration Tab

**Input**: Design documents from `/specs/010-container-config-tab/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests are requested. Feature validation will be performed manually per the quickstart guide.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register new global module configurations.

- [x] T001 Register `defaultFitMode` global setting with choices "contain", "cover", "fill" in `src/settings.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core resolution helpers needed before UI or streaming/rendering layers can leverage container settings.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement `resolveContainerSettings(doc)` helper to merge document flags with global defaults in `src/helpers.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in priority order

---

## Phase 3: User Story 1 - Dedicated Screen Share Configuration Tab (Priority: P1) 🎯 MVP

**Goal**: Relocate the screen share toggle to a new, dedicated configuration tab.

**Independent Test**: Open a Region, Tile, or Drawing config sheet, click the "Screen Share" tab, and verify that the toggle is present here and removed from the "Appearance" tab.

### Implementation for User Story 1

- [x] T003 [US1] Implement dynamic "Screen Share" tab navigation header injection for `RegionConfig` (v14 only), `TileConfig` (v13+), and `DrawingConfig` (v13+) in `src/ui/config.js`
- [x] T004 [US1] Relocate the "Screen Share Container" checkbox field rendering into the injected "Screen Share" tab section content in `src/ui/config.js`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Container-Level Video Settings Overrides (Priority: P1)

**Goal**: Support per-container fit mode, framerate, and resolution overrides.

**Independent Test**: Configure specific overrides on a container, save, and verify that stream constraints and rendering use those values.

### Implementation for User Story 2

- [x] T005 [US2] Inject the dropdown selector fields for Fit Mode, Max Frame Rate, and Max Resolution into the "Screen Share" tab HTML in `src/ui/config.js`
- [x] T006 [US2] Add flag persistence handling to save container settings on form submission in `src/ui/config.js`
- [x] T007 [P] [US2] Update stream capture constraints resolution to utilize resolved container-specific overrides in `src/providers/webrtc.js`
- [x] T008 [P] [US2] Update stream capture constraints resolution to utilize resolved container-specific overrides in `src/providers/livekit.js`
- [x] T009 [US2] Refactor `ScreenShareSession.renderStream` in `src/rendering/session.js` to calculate video bounds and offsets matching "Contain", "Cover", and "Fill" fit modes
- [x] T010 [US2] Implement rectangular PIXI graphics mask clipping for Tile and Drawing video sprites in Cover mode to prevent canvas boundary overflow in `src/rendering/session.js`

**Checkpoint**: User Stories 1 and 2 are fully functional and integrated.

---

## Phase 5: User Story 3 - Global Default Fallbacks with Dynamic Labels (Priority: P2)

**Goal**: Dynamically populate dropdown default options with the active global settings labels.

**Independent Test**: Change global settings, verify default option labels in container tabs update dynamically.

### Implementation for User Story 3

- [x] T011 [US3] Implement dynamic text replacement for the "Default" options in the dropdown HTML during sheet render in `src/ui/config.js`

**Checkpoint**: Default fallbacks show active values.

---

## Phase 6: User Story 4 - Conditional Fields Gating (Priority: P2)

**Goal**: Dynamically enable/disable configuration dropdowns based on container toggle state.

**Independent Test**: Toggle the checkbox on the Screen Share tab and verify that the dropdowns grey out or activate immediately.

### Implementation for User Story 4

- [x] T012 [US4] Bind change event listeners to the container checkbox to toggle disabled attribute of the dropdowns in real-time in `src/ui/config.js`

**Checkpoint**: Fields gating behaves dynamically.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and validation.

- [x] T013 Run manual validation scenarios specified in `specs/010-container-config-tab/quickstart.md`
- [x] T014 Review rendering cleanup on configuration changes and ensure no WebGL memory leaks occur in `src/rendering/session.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on User Story 1.
- **User Story 3 & 4 (Phases 5 & 6)**: Depend on User Story 2.
- **Polish (Phase 7)**: Depends on all user story phases.

### Parallel Opportunities

- Once Phase 2 is complete, User Story 1 (P1) is the primary MVP block.
- In Phase 4, the stream provider updates (`T007` and `T008`) can be implemented in parallel as they touch separate files.

---

## Parallel Example: User Story 2

```bash
# Implement stream provider constraint resolutions concurrently
Task: "Update stream capture constraints resolution to utilize resolved container-specific overrides in src/providers/webrtc.js"
Task: "Update stream capture constraints resolution to utilize resolved container-specific overrides in src/providers/livekit.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (US1).
3. Complete Phase 4 (US2).
4. Run validation checks to verify MVP functionality.
5. Add Phase 5 & 6 UX polish items.
