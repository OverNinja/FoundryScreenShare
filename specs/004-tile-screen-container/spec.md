# Feature Specification: Tile and Region Screen Share Container

**Feature Branch**: `004-tile-screen-container`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "apply the same functionality to tiles too. the same option to mark a region must be available to tiles. the same restriction to only have a single container must be aplyed accross container types. the streming must function in the same way if container is a tile or a region"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark a Tile as the Screen Container (Priority: P1)

As a Gamemaster, I want to mark a Tile on the scene canvas as the recipient for a shared screen, so that the screen share stream is displayed within that tile's boundaries.

**Why this priority**: This is the core capability needed to target Tile placeables for screen sharing, allowing the GM to use rectangular graphic containers or custom board layouts as screen targets.

**Independent Test**: Can be fully tested by creating/selecting a Tile, opening its configuration dialog, toggling the "Screen Share Container" option, saving, and verifying that the flag is persisted on the Tile document.

**Acceptance Scenarios**:

1. **Given** a scene with a Tile, **When** the GM opens the Tile's configuration dialog, **Then** a "Screen Share Container" toggle/checkbox is visible and is enabled.
2. **Given** the "Screen Share Container" option is enabled, **When** the GM toggles it on and saves the Tile configuration, **Then** the Tile document is successfully saved with the screen container flag.
3. **Given** a Tile marked as the screen container, **When** the GM opens its configuration dialog, **Then** the "Screen Share Container" option is shown as active (on) and is enabled for editing/toggling off.

---

### User Story 2 - Cross-Type Single Container Restriction (Priority: P1)

As a Gamemaster, I want the system to enforce that at most one screen container (either a Region or a Tile) can be marked in the active scene, so that multiple screen share streams do not overlap or conflict.

**Why this priority**: Restricting to a single container across both types maintains scene rendering integrity and provides a clear, unified target for the stream.

**Independent Test**: Can be tested by marking Region A as a screen container, then opening the configuration dialogs for Region B and Tile C to verify that the screen container options are disabled on both with appropriate status messages.

**Acceptance Scenarios**:

1. **Given** Region A is marked as a screen container in the scene, **When** the GM opens the configuration dialog for Tile B, **Then** the "Screen Share Container" option on Tile B is disabled and cannot be toggled on.
2. **Given** Region A is marked as a screen container in the scene, **When** the GM views the disabled option on Tile B's configuration, **Then** a status message is displayed next to the label indicating that another screen container (Region A) already exists in the scene.
3. **Given** Tile A is marked as a screen container in the scene, **When** the GM opens the configuration dialog for Region B (Appearance tab) or Tile C, **Then** the option is disabled on both, showing a status message indicating that another screen container (Tile A) exists.
4. **Given** the active screen container (whether Region or Tile) is deleted or has its flag removed, **When** the GM opens the configuration of any other Region or Tile, **Then** the "Screen Share Container" option is enabled.

---

### User Story 3 - Stream Rendering parity for Tiles and Regions (Priority: P1)

As a Gamemaster, I want the screen share stream to render within a marked Tile in the same way it renders in a marked Region, respecting the Tile's dimensions, rotation, and visibility.

**Why this priority**: Ensures the video stream displays identically in quality, control, and cleanup flow regardless of the underlying container type.

**Independent Test**: Can be tested by starting local screen sharing with a Tile marked as the screen container, and verifying that the stream plays within the Tile's boundaries, moves/scales with the Tile, and is cleaned up when the stream stops.

**Acceptance Scenarios**:

1. **Given** a Tile is marked as the screen container and screen sharing is started, **When** the stream is active, **Then** the video stream is rendered within the Tile's boundaries on the canvas.
2. **Given** the video stream is rendering, **When** the GM pans, zooms, or moves/rotates the Tile, **Then** the video rendering updates dynamically to match the Tile's new scale, position, and rotation.
3. **Given** the video stream is rendering, **When** the GM stops the screen share, **Then** the video element is removed from the canvas, the Tile's original texture is restored, and all temporary rendering resources are destroyed.

---

### Edge Cases

- **No container marked**: If no Region or Tile in the active scene is marked as a screen container, the option remains enabled on all Regions and Tiles, allowing any one of them to be marked.
- **Multiple flags found (Conflict Resolution)**: If multiple containers across both types somehow end up flagged (e.g. via copy-paste or external API calls), the system treats the first one (prioritizing Region first, then Tile, and sorting alphabetically by document ID) as the active container. The toggle control on other flagged documents will remain active but show a conflict warning or allow unflagging.
- **Scene changes**: Bound to the active scene. Changing active scene swaps the target container.
- **Dialog closure without saving**: Toggling the option but closing the configuration dialog without saving must not persist the flag or affect the status of other documents.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a GM to configure a Tile document's properties.
- **FR-002**: The system MUST append a toggle control/checkbox labeled "Screen Share Container" (or equivalent) to the Tile configuration dialog.
- **FR-003**: The "Screen Share Container" option MUST save a persistent flag/mark on the Tile document when checked and saved.
- **FR-004**: The system MUST scan both Region documents and Tile documents in the current active scene to determine if a container is already marked as a screen container.
- **FR-005**: If another Region or Tile in the active scene is already marked as a screen container, the system MUST disable the "Screen Share Container" option on all other Region and Tile configuration sheets.
- **FR-006**: When the control is disabled due to an existing container, the system MUST render a status/observation message adjacent to the option label (e.g., "Another container is already marked as the screen container").
- **FR-007**: The system MUST treat a marked Tile as a valid screen share container for the stream target.
- **FR-008**: When screen sharing is active and the active container is a Tile, the system MUST render the video stream within the bounding box of that Tile on the canvas, aligning with its coordinates, size, and rotation.
- **FR-009**: The system MUST apply appropriate clipping/scaling to the video rendering to match the Tile's bounds exactly.
- **FR-010**: When screen sharing is stopped, the system MUST terminate the capture stream, remove all video rendering elements from the canvas, restore the Tile's original texture, and release all allocated memory and rendering assets.
- **FR-011**: The status of being a screen container (whether Region or Tile) MUST be synchronized and accessible to all connected clients (players and GMs).

### Key Entities

- **Tile**: Represents a rectangular placeable object on the scene canvas (Foundry VTT Tile).
- **Region**: Represents a designated spatial area on the canvas (Foundry VTT Region).
- **Screen Share Container Mark**: A property (flag) stored on either a Region or a Tile document indicating it is the designated stream recipient.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: GMs can toggle and save a Tile's screen container configuration in under 5 seconds.
- **SC-002**: Toggling a Region or Tile as a screen container disables the configuration option on all other Regions and Tiles in the active scene immediately upon opening their configuration sheets.
- **SC-003**: The screen share stream starts rendering within the Tile's boundaries within 1 second of GM source selection.
- **SC-004**: Stopping the screen share restores the Tile's original texture and releases all associated WebGL textures and DOM video elements within 500ms, returning memory usage to pre-share baselines.

## Assumptions

- Only GMs have permissions to create, edit, or configure Scene Tiles.
- The Foundry VTT v14 Tile configuration sheet structure is utilized to inject the custom option.
- Video stream rendering on a Tile is achieved by updating the Tile's Sprite/Mesh texture with the video element or overlaying the video on the Tile's coordinates.
- Storing custom flags on Tile and Region documents (via standard Foundry flags API) is a persistent and synchronized operation.
