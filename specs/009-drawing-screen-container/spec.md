# Feature Specification: Drawing Screen Container

**Feature Branch**: `009-drawing-screen-container`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "a new container type: drawing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawing Screen Share Container (Priority: P1)

As a Gamemaster, I want to designate a Drawing on the scene canvas as a screen share container so that I can stream screens onto custom drawn shapes (such as a whiteboard, projector sheet, or custom-drawn area on the canvas).

**Why this priority**: This is the core MVP capability for the drawing container type, extending the module to support drawings alongside regions and tiles.

**Independent Test**: Draw a rectangle drawing on the scene canvas, open the Drawing's configuration dialog, toggle the "Screen Share Container" checkbox, start the screen share, and verify the video stream renders inside the drawing's bounds.

**Acceptance Scenarios**:

1. **Given** a GM on an active scene, **When** they open a Drawing configuration dialog, **Then** a "Screen Share Container" checkbox is visible under the Appearance tab.
2. **Given** a Drawing is marked as the container, **When** the GM clicks "Start Screen Share", **Then** the stream starts and renders correctly inside the drawing's canvas bounds.
3. **Given** a Drawing is marked as the container, **When** the GM stops the screen share, **Then** the stream terminates and the drawing's original visual appearance is fully restored.

---

### User Story 2 - Exclusive Scene Container Rule (Priority: P2)

As a Gamemaster, I want the system to ensure only one screen container is active on a scene at any time, so that multiple video streams do not conflict or cause confusion.

**Why this priority**: Maintains consistency across all screen share container types (Regions, Tiles, and Drawings) and prevents conflicting active streams.

**Independent Test**: Mark a Tile as the screen container, open a Drawing's configuration dialog, and verify that the "Screen Share Container" checkbox is disabled and a conflict warning message is shown.

**Acceptance Scenarios**:

1. **Given** a Tile is already marked as the screen container in the scene, **When** the GM opens a Drawing configuration dialog, **Then** the "Screen Share Container" checkbox is disabled, and an informative note displays that another container is already marked.
2. **Given** a Drawing is marked as the screen container, **When** the GM opens a Tile or Region configuration dialog, **Then** the container checkbox on those documents is disabled with a similar conflict message.

---

### User Story 3 - Visual Boundary Fitting for Drawings (Priority: P2)

As a Gamemaster, I want the screen share stream to render within the shape boundaries of my Drawing, so that the video fits cleanly without overlapping the rest of the canvas.

**Why this priority**: Essential for a clean visual experience when GMs use different drawing shapes.

**Independent Test**: Mark a Drawing as the screen container, start the stream, and verify the video fits inside the drawing bounds.

**Acceptance Scenarios**:

1. **Given** a Drawing is marked as the screen container, **When** screen sharing starts, **Then** the video sprite is aligned to the Drawing's position, width, height, and rotation.

---

### Edge Cases

- **Deleting the active Drawing**: If the GM deletes a Drawing that is marked as the screen container (especially while screen sharing is active), the active stream must terminate immediately and cleanly release all WebGL/network resources, and the scene container mark must be reset.
- **Hidden Drawings**: If a Drawing is configured as hidden (invisible to players), the screen share stream rendered on it should follow standard Foundry visibility (visible to GMs, hidden/invisible to players).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: GMs MUST be able to toggle the screen container mark on any Drawing document in the active scene.
- **FR-002**: The screen container mark state MUST be persisted using namespaced flags on the Drawing document (`flags.screen-share.isScreenContainer`).
- **FR-003**: The system MUST enforce a single screen share container per scene, scanning across Regions, Tiles, and Drawings, and disabling the container checkbox in config sheets if another container is already marked.
- **FR-004**: In the Drawing configuration sheet, the Screen Share Container controls MUST be injected under the Appearance tab.
- **FR-005**: The system MUST render the video stream on the drawing [NEEDS CLARIFICATION: Should the video stream be masked to the exact geometry/shape of the drawing (e.g. ellipse/polygon), or is rendering within the rectangular bounding box sufficient?]
- **FR-006**: The system MUST hook into Drawing updates (`updateDrawing`) and deletions (`deleteDrawing`) to update open configuration sheets and clean up active screen share sessions.
- **FR-007**: When screen sharing is stopped, the system MUST restore the drawing's original visual state.

### Key Entities

- **Drawing**: Represents a shape or text drawn on the canvas, acting as the visual container for the screen share.
- **Screen Share Container Mark**: The namespaced flag `flags.screen-share.isScreenContainer` indicating a document is the active container.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: GMs can toggle and save the "Screen Share Container" state on a Drawing config, and the flag persists on the document.
- **SC-002**: On both Foundry v13 and v14, the video stream renders on the marked drawing within 1 second of the GM starting the screen share.
- **SC-003**: Deleting the marked Drawing or unmarking it immediately terminates the active screen share stream and releases all WebGL/DOM resources in under 500ms.

## Assumptions

- GMs can configure Drawings using the same permission gates as Tiles and Regions.
- Drawing documents in both Foundry v13 and v14 support standard flag getters and setters.
- Drawings on the canvas can have their visual representation retrieved or overlaid using standard PixiJS containers.
