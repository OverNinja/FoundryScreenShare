# Tasks: LiveKit Stream Provider

**Input**: Design documents from `/specs/007-livekit-provider/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - none are explicitly requested, so validation is handled via quickstart manual tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths shown below assume single project

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Register LiveKit server configuration settings in `src/settings.js`
- [X] T002 Expose and register LiveKitStreamProvider under PROVIDERS in `screen-share.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Implement HMAC-SHA256 JWT dynamic generator in `src/crypto/jwt.js` using browser Web Crypto API
- [X] T004 Create class skeleton for `LiveKitStreamProvider` in `src/providers/livekit.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - GM Activates and Broadcasts screen via LiveKit (Priority: P1) 🎯 MVP

**Goal**: Enable GM client to capture screen, sign publisher JWT, and connect/publish to LiveKit server.

**Independent Test**: GM selects LiveKit backend, starts screen share, and publishes media tracks to the LiveKit server.

### Implementation for User Story 1

- [X] T005 [US1] Load the LiveKit Client SDK dynamically inside `src/providers/livekit.js`
- [X] T006 [US1] Implement GM start stream publishing in `LiveKitStreamProvider.startStream()` in `src/providers/livekit.js`
- [X] T007 [US1] Implement GM stream stop and session teardown in `LiveKitStreamProvider.stopStream()` in `src/providers/livekit.js`
- [X] T008 [US1] Broadcast stream start signaling message to active player clients upon successful publish in `src/providers/livekit.js`

**Checkpoint**: At this point, GM publishing via LiveKit should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Player Connects and Receives LiveKit Stream (Priority: P2)

**Goal**: Enable player clients to request subscriber tokens, connect to LiveKit rooms, and subscribe/render the GM's stream.

**Independent Test**: Player client connects, requests token, receives signed JWT from GM client, connects to room, and renders the media stream on the canvas.

### Implementation for User Story 2

- [X] T009 [US2] Implement player-side token request socket triggers and listeners in `src/webrtc/signaling.js`
- [X] T010 [US2] Implement GM-side token generation and socket response in `LiveKitStreamProvider.handleSignaling()` in `src/providers/livekit.js`
- [X] T011 [US2] Implement subscriber room connection method in `LiveKitStreamProvider.connectSubscriber()` in `src/providers/livekit.js`
- [X] T012 [US2] Implement track subscription handling and canvas rendering in `src/providers/livekit.js`
- [X] T013 [US2] Integrate subscriber room disconnect and track cleanup into player teardown pipeline in `src/providers/livekit.js` and `src/webrtc/signaling.js`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - GM Configures LiveKit Settings (Priority: P3)

**Goal**: Ensure LiveKit credentials and configuration items are fully manageable through the standard settings UI.

**Independent Test**: GM configures LiveKit credentials in the Module Settings tab, saves, and verifies they are stored correctly.

### Implementation for User Story 3

- [X] T014 [P] [US3] Ensure all LiveKit settings are registered as visible config items in the Settings panel in `src/settings.js`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T015 Run validation scenarios defined in `specs/007-livekit-provider/quickstart.md`
- [X] T016 [P] Add JSDoc type annotations and code documentation in `src/providers/livekit.js` and `src/crypto/jwt.js`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) must be implemented first to enable publishing
  - User Story 2 (P2) depends on User Story 1 to test subscription
  - User Story 3 (P3) is UI configuration and can be done in parallel or at any time after Setup
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Requires User Story 1 to be functional for full integration testing
- **User Story 3 (P3)**: Can be done in parallel with other tasks since it only affects `src/settings.js`

### Within Each User Story

- Models/utilities before services
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks can be done in parallel
- Foundational tasks can be done in parallel
- User Story 3 configuration UI task (`T014`) can run in parallel with User Story 1 and 2 tasks

---

## Parallel Example: User Story 1

```bash
# Register settings and register provider in parallel:
Task: "Register LiveKit server configuration settings in src/settings.js"
Task: "Expose and register LiveKitStreamProvider under PROVIDERS in screen-share.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (GM Publish)
4. **STOP and VALIDATE**: Verify GM can capture and stream to LiveKit dashboard

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> GM publishes stream
3. Add User Story 2 -> Test subscriber connection -> Full peer streaming (MVP!)
4. Add User Story 3 -> Test configurations UI -> Completed feature
5. Run quickstart validation scenarios to confirm completeness

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Stop at any checkpoint to validate story independently
