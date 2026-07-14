# Feature Specification: Region Screen Container Marking

**Feature Branch**: `002-region-screen-container`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "the ability to mark a region as te recipient for a shared screen. On the Appearance tab of a Region context menu dialog, include at the end, an option to mark this region as such a screen container. on toggling it, add a flag to this region to effectivelly create a mark. the option must show, close to its label an observation if another such screen container already exists in the scene, and the control will be disabled in this case."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark a Region as the Screen Container (Priority: P1)

As a Gamemaster, I want to mark a specific Region on the scene canvas as the recipient for a shared screen, so that the screen share stream is displayed within that region.

**Why this priority**: This is the core capability required to direct screen sharing streams onto the Foundry canvas. Without this, there is no way to target specific visual areas for screen sharing.

**Independent Test**: Can be fully tested by creating a new Region, opening its configuration dialog, toggling the "Screen Share Container" option on the Appearance tab, saving, and verifying that the flag is persisted on the Region document.

**Acceptance Scenarios**:

1. **Given** a scene with a Region, **When** the GM opens the Region's configuration dialog and navigates to the Appearance tab, **Then** a "Screen Share Container" toggle is visible at the end of the tab and is enabled.
2. **Given** the "Screen Share Container" toggle is enabled, **When** the GM toggles it on and saves the Region configuration, **Then** the Region document is successfully saved with the screen container flag.
3. **Given** a Region marked as a screen container, **When** the GM opens its configuration dialog and navigates to the Appearance tab, **Then** the "Screen Share Container" toggle is shown as active (on) and is enabled for editing/toggling off.

---

### User Story 2 - Prevent Multiple Screen Containers per Scene (Priority: P2)

As a Gamemaster, I want to see which regions cannot be marked as screen containers because one already exists in the scene, so that I don't accidentally mark multiple regions.

**Why this priority**: Restricting to a single screen share container per scene prevents visual conflicts and rendering errors. Providing clear visual feedback helps the GM understand scene configuration rules.

**Independent Test**: Can be tested by marking Region A as a screen container, then opening the configuration dialog for Region B and checking if the option is disabled with a helpful observation message.

**Acceptance Scenarios**:

1. **Given** Region A is marked as a screen container in the scene, **When** the GM opens the configuration dialog for Region B and navigates to the Appearance tab, **Then** the "Screen Share Container" option is disabled (cannot be checked/toggled on).
2. **Given** Region A is marked as a screen container in the scene, **When** the GM views the disabled "Screen Share Container" option on Region B's configuration, **Then** a status message is displayed next to the label indicating that another screen container already exists in the scene.
3. **Given** Region A was marked as a screen container but is subsequently deleted or unmarked, **When** the GM opens Region B's configuration, **Then** the "Screen Share Container" option on Region B is enabled.

---

### Edge Cases

- **No screen container set**: If no region in the current scene is marked as a screen container, the option remains enabled on all regions, allowing any of them to be marked.
- **Multiple flags found (Conflict Resolution)**: If multiple regions in a scene somehow end up with the screen container flag (e.g., through copy-paste or external API creation), the system must treat the first region (by alphabetical document ID or creation order) as the active container. The toggle control on other flagged regions will remain checked but show a warning or allow unflagging them.
- **Scene changes**: Screen container status is bound to the scene. A GM can have one screen container per scene, and changing scenes swaps the target screen container to the one on the new active scene.
- **Dialog closure without saving**: Toggling the option but closing the Region configuration dialog without saving must not persist the flag or affect the status of other regions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a GM to configure a Region document's properties.
- **FR-002**: The system MUST append a toggle control labeled "Screen Share Container" (or equivalent) to the end of the Appearance tab of the Region configuration dialog.
- **FR-003**: The "Screen Share Container" toggle MUST save a persistent flag/mark on the Region document when checked and saved.
- **FR-004**: The system MUST scan all Region documents in the current active scene to determine if a region is already marked as a screen container.
- **FR-005**: If another Region in the active scene is already marked as a screen container, the system MUST disable the "Screen Share Container" toggle control on all other Region configuration dialogs.
- **FR-006**: When the control is disabled due to an existing container, the system MUST render a status/observation message adjacent to the toggle label (e.g., "Another region is already marked as the screen container").
- **FR-007**: The status of being a screen container MUST be synchronized and accessible to all connected clients (players and GMs) to facilitate target identification for rendering.

### Key Entities

- **Region**: Represents a designated spatial area on the scene canvas (Foundry VTT Region). It holds spatial geometry, configuration properties, and flags.
- **Screen Share Container Mark**: A property (flag) stored on the Region document indicating whether it is the recipient container for the GM's shared screen stream.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: GMs can mark a region as a screen container and save the configuration in under 5 seconds.
- **SC-002**: When a region is marked as a screen container, the configuration option is disabled on all other regions in the scene immediately upon opening their configuration sheets.
- **SC-003**: The presence of the screen container flag on a region is synchronized to player clients within 1 second of being saved.
- **SC-004**: The screen container option is automatically re-enabled for all regions in the scene within 1 second if the marked region is deleted or has its flag removed.

## Assumptions

- Only GMs have permissions to create, edit, or configure Scene Regions.
- The Foundry VTT v14 Region configuration sheet (RegionConfig) structure is utilized to inject the custom option.
- Storing a custom flag on the RegionDocument (via standard Foundry flags API) is a persistent and synchronized operation.
- UI changes only affect the GM interface, as players cannot access the Region configuration dialog.
