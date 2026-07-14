# Feature Specification: Foundry v13 Tile Compatibility

**Feature Branch**: `008-v13-tile-compatibility`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "explore adding compatibility for foundry v13 (tile only)"

## Clarifications

### Session 2026-07-13

- Q: Control group layer association → A: Omit the `layer` property (set to null/undefined) for the dedicated `screen-share` tool group in both v13 and v14, keeping the currently active canvas layer selected.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tile Screen Share on Foundry v13 (Priority: P1)

As a Gamemaster running Foundry VTT v13, I want to designate a Tile as a screen share container so that I can stream screens onto the scene canvas even without the newer Scene Regions feature.

**Why this priority**: Core MVP requirement for v13 support, enabling screen sharing using the only available container type (Tiles).

**Independent Test**: On a Foundry v13 world, open a Tile configuration, toggle the screen container flag, start screen sharing, and verify that the stream plays within the Tile's boundaries.

**Acceptance Scenarios**:

1. **Given** a GM on a Foundry v13 scene, **When** they open a Tile's configuration dialog, **Then** the "Screen Share Container" toggle is visible and editable.
2. **Given** a Tile is marked as the container, **When** the GM clicks "Start Screen Share", **Then** the stream starts and renders correctly inside the Tile boundaries.
3. **Given** a Tile is marked as the container, **When** the GM stops the screen share, **Then** the stream terminates, and the Tile's original appearance is restored.

---

### User Story 2 - UI Control Layer Association (Priority: P2)

As a Gamemaster, I want the screen share controls group to not alter my active canvas layer when selected, so that my currently active layer (e.g. Tokens, Tiles, or Regions) remains active.

**Why this priority**: Since screen containers can be of multiple document types (Regions or Tiles), forcing a layer change is not guaranteed to be helpful, and leaving the layer selection intact allows the GM to stay in their current context.

**Independent Test**: Click the "Screen Share Controls" button and verify that the currently active canvas layer remains selected and active.

**Acceptance Scenarios**:

1. **Given** the canvas is loaded, **When** the GM selects the "Screen Share Controls" group on the left toolbar, **Then** the currently active canvas layer (e.g., Tokens or Tiles) remains selected and active.

---

### User Story 3 - Graceful Feature Degradation (Priority: P2)

As a Gamemaster on Foundry v13, I want region-specific features (region config injection, region controls, and region stream rendering) to be disabled gracefully without causing runtime errors.

**Why this priority**: Ensures the module runs cleanly on v13 by avoiding references to non-existent classes (like `RegionDocument`, `RegionConfig`, `canvas.regions`, etc.).

**Independent Test**: Run the module in a v13 environment and verify that no console errors occur during initialization or canvas rendering, and that only tiles can be configured.

**Acceptance Scenarios**:

1. **Given** a Foundry v13 environment, **When** the module initializes, **Then** it does not attempt to register Hooks for `renderRegionConfig` or track Region documents.
2. **Given** a Foundry v13 environment, **When** scanning for active screen containers, **Then** it only queries Tile documents.

---

### Edge Cases

- **Unsupported Older Versions**: If loaded on versions older than v13 (e.g. v11 or v12), the module should gracefully log a warning and deactivate itself if core API functions or classes (like modern Tile mesh rendering) are missing.
- **Scene Import from v14**: If a scene is imported from a v14 world that contains a Region marked as a screen container, the v13 environment will ignore the region mark (since it cannot parse regions) and fallback to allowing the GM to mark a Tile.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect the active Foundry VTT version generation at startup.
- **FR-002**: The system MUST support Foundry VTT v13 compatibility down to a minimum defined version, updating `module.json` to allow loading on v13.
- **FR-003**: In both Foundry v13 and v14 environments, the dedicated Screen Share controls group MUST NOT specify an associated canvas layer (meaning the `layer` property is omitted or set to null/undefined), keeping the currently active layer selected.
- **FR-004**: In a Foundry v13 environment, the system MUST NOT register Region-related configuration Hooks or attempt to hook into `renderRegionConfig`, `updateRegion`, or `deleteRegion`.
- **FR-005**: In a Foundry v13 environment, the system MUST only scan Tile documents when querying for the active screen container.
- **FR-006**: In a Foundry v13 environment, the system MUST render the stream in a marked Tile.
- **FR-007**: In a Foundry v14 environment, the system MUST preserve all existing functionality, including Scene Regions, but register the dedicated Screen Share controls group with no associated canvas layer.

### Key Entities

- **Tile**: Represents a placeable object on the canvas in both v13 and v14.
- **Screen Share Container Mark**: The custom flag stored on the Tile.
- **Foundry Version Context**: The detected runtime version (v13 or v14).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The module loads successfully on both Foundry v13 and v14 without throwing any Javascript exceptions during initialization.
- **SC-002**: On Foundry v13, GMs see the screen share tools on the Tiles layer sidebar menu and can toggle the state.
- **SC-003**: On Foundry v13, a video stream is rendered inside a marked Tile's boundaries within 1 second of GM starting the share.

## Assumptions

- We target compatibility for Foundry VTT v13 specifically. Support for older versions (v11 or lower) is out of scope.
- Foundry v13 utilizes the same `game.release` object (or equivalent) for version checking as v14.
- GMs on v13 can configure and update Tile document flags using the same syntax (`tile.getFlag` and `tile.update`) as v14.
- PixiJS rendering on Tiles (using `primary` or `mesh` container) works similarly enough in v13 and v14 to reuse the v14 tile rendering pipeline.
