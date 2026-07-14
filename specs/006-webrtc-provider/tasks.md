# Tasks: WebRTC Stream Provider

**Input**: Design documents from `specs/006-webrtc-provider/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `screen-share.js` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Register new socket listener under "module.screen-share" in `screen-share.js`
- [x] T002 Define the `WebRTCStreamProvider` class skeleton extending `StreamProvider` in `screen-share.js`
- [x] T003 Register `WebRTCStreamProvider` in the `ScreenShare.PROVIDERS` object in `screen-share.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core socket and settings registry that MUST be complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement the socket signaling dispatcher distinguishing GM (transmitter) and player (receiver) roles in `screen-share.js`
- [x] T005 Register settings for `iceServers`, `turnUsername`, `turnCredential`, `maxFramerate`, and `maxResolution` in `screen-share.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - WebRTC Screen Share Streaming (Priority: P1) 🎯 MVP

**Goal**: Establish a real-time WebRTC stream between the GM and players using native sockets for signaling, rendering the stream in the canvas container.

**Independent Test**: Start sharing as GM, verify player connects automatically and displays stream on canvas. Verify stopping screen share cleans up DOM and connections.

### Implementation for User Story 1

- [x] T006 [US1] Implement GM-side stream start logic in `WebRTCStreamProvider.startStream()` to capture display media and instantiate peer connections for connected player users in `screen-share.js`
- [x] T007 [US1] Implement player-side socket listener for SDP "offer" to instantiate local `RTCPeerConnection` and return an SDP "answer" in `screen-share.js`
- [x] T008 [US1] Implement GM-side socket listener for SDP "answer" to set the remote description for the respective peer in `screen-share.js`
- [x] T009 [US1] Implement ICE candidate exchange handling (`onicecandidate` callback and `candidate` action socket payloads) on both GM and player in `screen-share.js`
- [x] T010 [US1] Implement player-side track handler (`ontrack` callback) to append incoming video streams to an off-screen video element and run canvas rendering in `screen-share.js`
- [x] T011 [US1] Implement GM-side stop logic in `WebRTCStreamProvider.stopStream()` to stop media tracks, emit "disconnect" socket command, and close all peer connections in `screen-share.js`
- [x] T012 [US1] Implement player-side "disconnect" socket handler to trigger local stream stop and clean up WebGL canvas textures and video elements in `screen-share.js`
- [x] T013 [US1] Implement late-joiner negotiation: players emit a "request-offer" when their canvas is ready, and GM replies by initiating negotiation in `screen-share.js`
- [x] T014 [US1] Implement auto-reconnection logic: listen to peer connection state changes and retry up to 3 times (5s intervals) on drop/failure in `screen-share.js`

**Checkpoint**: User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Configure ICE / STUN / TURN Servers (Priority: P2)

**Goal**: Allow GMs to configure STUN/TURN server URLs and credentials in settings, injecting them into peer connection configurations.

**Independent Test**: Modify module settings with a custom STUN server, start sharing, and verify that peer connections use the updated server URL.

### Implementation for User Story 2

- [x] T015 [US2] Update GM and player peer connection initialization to load the custom `iceServers` settings JSON in `screen-share.js`
- [x] T016 [US2] Implement dynamic injection of `turnUsername` and `turnCredential` settings into the ICE server configuration payload in `screen-share.js`

**Checkpoint**: ICE and STUN/TURN configurations are fully functional.

---

## Phase 5: User Story 3 - Select Stream Quality Settings (Priority: P3)

**Goal**: Expose and apply video quality limits (resolution and framerate) in settings.

**Independent Test**: Set GM framerate limit to 15 FPS, start sharing, and verify the video stream does not exceed 15 FPS.

### Implementation for User Story 3

- [x] T017 [US3] Update GM `startStream()` display media constraints to dynamically inject maximum resolution and framerate limits based on module settings in `screen-share.js`

**Checkpoint**: Bandwidth and quality limits are fully functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, cleanup validation, and manual testing

- [x] T018 Implement global error handlers for stream and peer connection setup failure in `screen-share.js`
- [x] T019 Conduct a memory audit to ensure that 100% of WebGL textures and off-screen videos are destroyed upon stream termination in `screen-share.js`
- [x] T020 Run the manual validation test cases defined in `specs/006-webrtc-provider/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Stories (Phase 3+)**: All depend on Foundational completion. They must run sequentially (US1 → US2 → US3) since they all modify the same file `screen-share.js`.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities

- Because this is a single-file project (`screen-share.js`), actual implementation tasks cannot be parallelized without git conflicts and are designed to be completed sequentially.
- Setup tasks (T001-T003) and Foundational tasks (T004-T005) must be completed in order.
