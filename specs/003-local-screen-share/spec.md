# Feature Specification: Local Screen Share Capture and Local Rendering

**Feature Branch**: `003-local-screen-share`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "first stage of the streaming feature. when I click on the start share button, the browser must permit me to select a screen to share. when selected, right now, the screen is only shown on my own local scene, not transmited anywhere."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Screen Capture (Priority: P1)

As a Gamemaster, I want to click the screen share button and select a screen, window, or tab via the browser's screen picker, so that I can choose the video source for my screen share.

**Why this priority**: This is the fundamental entry point. Without initiating screen capture, no stream can be acquired.

**Independent Test**: Can be tested by clicking the "Start/Stop Screen Share" tool button in the scene controls under the "regions" group and verifying that the browser's native screen selection prompt opens.

**Acceptance Scenarios**:

1. **Given** the GM is on an active scene with a designated screen container region, **When** the GM clicks the "Start/Stop Screen Share" control button, **Then** the browser displays the native screen selection dialog.
2. **Given** the browser screen selection dialog is active, **When** the GM selects a source (screen, window, or tab) and confirms, **Then** the local screen sharing stream is successfully captured.
3. **Given** the browser screen selection dialog is active, **When** the GM cancels the dialog, **Then** the "Start/Stop Screen Share" control button toggles back to the inactive state, and a notification informs the GM that the capture was cancelled.

---

### User Story 2 - Local Rendering within Screen Container Region (Priority: P1)

As a Gamemaster, I want the captured screen stream to render locally within the scene's designated screen container region, cropped exactly to the region's polygon boundaries, so that I can see how it fits on the canvas.

**Why this priority**: This provides the visual confirmation and feedback that the screen capture is working and is positioned correctly on the scene canvas.

**Independent Test**: Can be tested by initiating screen sharing and verifying that the captured video plays on the canvas in the designated region and does not overflow the region's boundaries.

**Acceptance Scenarios**:

1. **Given** a screen capture stream is active, **When** the GM views the active screen container region on the canvas, **Then** the video stream is rendered inside the region's boundaries.
2. **Given** the video stream is rendering, **When** the region has a non-rectangular polygon boundary, **Then** the video stream is cropped exactly to the region's boundary with zero visual overflow.
3. **Given** the video stream is rendering, **When** the GM pans, zooms, or navigates the canvas, **Then** the rendering stays synchronized, scales, and moves in alignment with the region's coordinates.

---

### User Story 3 - Stop Screen Share and Clean Up (Priority: P1)

As a Gamemaster, I want to stop the screen share (either via the toggle control or the browser's native bar) and have the system cleanly remove the video and free up all memory, so that performance is not degraded.

**Why this priority**: Cleaning up resources is critical to maintaining canvas performance and preventing rendering degradation during long gaming sessions.

**Independent Test**: Can be tested by stopping the screen share and verifying that all visual elements are removed, the region returns to its default appearance, and no media assets remain active.

**Acceptance Scenarios**:

1. **Given** the screen share is active, **When** the GM clicks the "Start/Stop Screen Share" control button to toggle it off, **Then** the stream stops, the region returns to its default styling, and all temporary rendering resources are destroyed.
2. **Given** the screen share is active, **When** the GM stops the share via the browser's native screen sharing controls, **Then** the control button toggles back to the inactive state, the canvas stops rendering the stream, and all associated media resources are destroyed.

---

### Edge Cases

- **No Screen Container Designated**: If the GM attempts to start screen sharing on a scene that has no region marked as a "Screen Share Container", the system must show a warning notification and toggle the control back to the inactive state without launching the browser prompt.
- **Active Scene Switch**: If the GM switches to a different scene while screen sharing is active, the active stream must be stopped and cleaned up on the old scene. Since this phase is local-only, the stream does not auto-start on the new scene.
- **Multiple Screen Containers**: If multiple regions in the scene are flagged as screen containers, the system must render the local screen share to the first region resolved alphabetically by document ID, matching the module's conflict-resolution logic.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST restrict the screen sharing controls and media capture capability strictly to the Gamemaster (GM).
- **FR-002**: The "Start/Stop Screen Share" toggle button MUST only be visible and functional for GMs.
- **FR-003**: When the GM toggles the control to the active state, the system MUST locate the active screen share container region on the current scene.
- **FR-004**: If no active screen container is found, the system MUST abort the process, show a warning notification to the GM, and reset the control button to the inactive state.
- **FR-005**: If an active screen container is found, the system MUST prompt the GM to select a screen, window, or tab via the browser's native screen sharing prompt.
- **FR-006**: Upon successful selection of the video source, the system MUST capture the video stream and render it locally on the GM's canvas.
- **FR-007**: The local rendering of the captured stream MUST be positioned within the coordinate space of the active screen container region.
- **FR-008**: The system MUST apply a clipping mask corresponding to the active region's boundaries to the video rendering, ensuring zero visual overflow outside the region.
- **FR-009**: The system MUST monitor the captured screen stream for termination events (such as when the user clicks the browser's native "Stop sharing" button).
- **FR-010**: When the screen share is stopped (either by the control toggle or external termination), the system MUST:
  - Terminate the capture stream.
  - Remove all video rendering elements and masks from the canvas.
  - Repaint the region back to its default appearance.
  - Release all allocated memory and rendering assets.
- **FR-011**: The system MUST NOT transmit the media stream to other clients or initiate signaling or network connections.

### Key Entities

- **Local Screen Share Stream**: The captured video stream from the browser's display media capture.
- **Render Target**: The designated screen container region on the canvas where the video is drawn.
- **Clipping Mask**: The boundary definition used to crop the video to the region's polygon shape.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clicking the "Start/Stop Screen Share" button opens the browser screen picker dialog in under 200ms.
- **SC-002**: Local video rendering begins on the canvas within 1 second of the GM completing screen selection.
- **SC-003**: The rendering is masked with 100% boundary accuracy, resulting in zero pixels rendering outside the region's defined polygon.
- **SC-004**: Stopping the screen share releases all associated WebGL textures and DOM resources within 500ms, returning memory usage to pre-share baselines.

## Assumptions

- GMs are using modern browsers that support native screen sharing APIs.
- Audio sharing is out of scope and explicitly disabled to simplify stream capture.
- Screen sharing is restricted to a single local stream on the GM's client. Transmission to player clients is out of scope for this stage.
- The module relies on the native Region API for region lookup and boundaries.
