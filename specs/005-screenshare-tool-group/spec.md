# Feature Specification: Dedicated Screen Share Controls

**Feature Branch**: `005-screenshare-tool-group`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "move the screen share start/stop button to its own tool group. also in this group create: A removal button to remove the flag from currently marked objects. a selection button, which will open up a dialog with all currently implemented streaming backends (currently only the local testing one)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dedicated Tool Group with Start/Stop Button (Priority: P1)

As a Gamemaster, I want to access screen share controls from a dedicated tool group in the left Scene Controls toolbar, so that the screen share controls are clearly separated from generic scene region tools.

**Why this priority**: Core navigation and organization improvement. Moving screen-share-specific controls into their own tool group reduces clutter on the Regions layer and makes screen share tools highly discoverable.

**Independent Test**: Can be tested by opening Foundry VTT as a GM, verifying that there is a new "Screen Share" control group on the left sidebar (desktop icon) and that the "Start/Stop Screen Share" button is inside it, while verifying it is no longer present in the "Regions" tool group.

**Acceptance Scenarios**:

1. **Given** the module is active, **When** a GM views the left Scene Controls toolbar, **Then** a dedicated "Screen Share Controls" tool group icon (`fas fa-desktop`) is visible.
2. **Given** the GM clicks the "Screen Share Controls" tool group icon, **Then** the "Start/Stop Screen Share" toggle button is visible.
3. **Given** a non-GM player views the left toolbar, **Then** the "Screen Share Controls" tool group is not visible.
4. **Given** the GM opens the "Regions" tool group, **When** they inspect the sub-tools, **Then** the "Start/Stop Screen Share" toggle button is no longer present.

---

### User Story 2 - Remove Screen Share Container Flag (Priority: P1)

As a Gamemaster, I want to quickly remove the screen share container designation from any marked object in the active scene using a toolbar button, so that I do not need to open individual region or tile configuration sheets to clear the flag.

**Why this priority**: Essential UX efficiency. It allows the GM to reset the container state with a single click, which is crucial for dynamic, real-time gaming sessions.

**Independent Test**: Can be tested by marking a Tile or Region as the screen container, clicking the "Remove Screen Container Mark" button in the screen share tool group, and verifying that the container document is unflagged and any active stream is immediately stopped.

**Acceptance Scenarios**:

1. **Given** an active screen container (Region or Tile) is marked in the scene, **When** the GM clicks the "Remove Screen Container Mark" button, **Then** the flag `isScreenContainer` is removed from that document, and a confirmation message is displayed.
2. **Given** screen sharing is active on a container, **When** the GM clicks the "Remove Screen Container Mark" button, **Then** the stream is automatically stopped, rendering assets are cleaned up, the container flag is removed, and the toolbar state updates.
3. **Given** no active screen container is marked in the scene, **When** the GM views the "Remove Screen Container Mark" button, **Then** the button is disabled.

---

### User Story 3 - Streaming Backend Selection Dialog (Priority: P2)

As a Gamemaster, I want to open a dialog to select which streaming backend/provider to use, so that I can choose the appropriate technology for my streaming session.

**Why this priority**: Extensibility foundation. Lays the groundwork for future streaming backend implementations (such as WebRTC or LiveKit) as required by Decoupled Transmission principles.

**Independent Test**: Can be tested by clicking the "Select Streaming Backend" button, verifying a Dialog opens displaying "Local Screen Share" as the selected/default backend, choosing it, clicking save/confirm, and verifying it updates the active provider configuration.

**Acceptance Scenarios**:

1. **Given** the screen share tool group is open, **When** the GM clicks the "Select Streaming Backend" button, **Then** a dialog titled "Select Streaming Backend" opens.
2. **Given** the backend selection dialog is open, **When** the GM views the options, **Then** the only currently available option is "Local Screen Share" (which uses the `LocalStreamProvider`), which is selected by default.
3. **Given** the GM clicks "Confirm" or "Save" in the dialog, **When** the selection is saved, **Then** the active provider is configured to use the selected backend, a confirmation notification is shown, and the dialog closes.

### Edge Cases

- **Removing flag during active stream**: If the GM clicks the "Remove Screen Container Mark" button while screen sharing is active, the system must stop the stream first to prevent WebGL memory leaks, clean up rendering artifacts, and then delete the flag from the document.
- **Multiple GMs**: Only the GM who started the stream can control the backend and start/stop of their own screen share. The tool group is hidden from players.
- **No container marked**: The "Remove Screen Container Mark" button must be disabled to prevent unnecessary database updates when there is nothing to clear.
- **Scene transition**: If the GM switches scenes, the "Remove Screen Container Mark" button status must update to reflect the state of the new active scene.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST register a new, custom Scene Control group in the left toolbar (e.g. name `screen-share`, icon `fas fa-desktop`, title `Screen Share Controls`).
- **FR-002**: The new control group MUST be visible only to Gamemasters (`game.user.isGM` is true).
- **FR-003**: The "Start/Stop Screen Share" button MUST be moved from the `regions` tool group to the new `screen-share` tool group.
- **FR-004**: The system MUST add a "Remove Screen Container Mark" button (name `remove-container-flag`, icon `fas fa-trash-alt`, title `Remove Screen Container Mark`) to the new tool group.
- **FR-005**: Clicking the "Remove Screen Container Mark" button MUST search the active scene for any Region or Tile flagged as the screen container and remove the `isScreenContainer` flag.
- **FR-006**: If a screen share stream is active when the flag is removed, the system MUST automatically call `stopShare()` to stop the stream and release all WebGL/DOM resources before clearing the flag.
- **FR-007**: The "Remove Screen Container Mark" button MUST be dynamically disabled if no screen container is marked in the active scene.
- **FR-008**: The system MUST add a "Select Streaming Backend" button (name `backend-selection`, icon `fas fa-cogs`, title `Select Streaming Backend`) to the new tool group.
- **FR-009**: Clicking the "Select Streaming Backend" button MUST open a standard Foundry VTT Dialog.
- **FR-010**: The dialog MUST present a list of all registered streaming backends (currently: "Local Screen Share" using `LocalStreamProvider`).
- **FR-011**: The dialog MUST allow the GM to select a backend (e.g. via radio buttons or a dropdown menu) and save the choice.
- **FR-012**: The selected backend choice MUST be saved as a client-side setting (persisted in `game.settings` or local storage) and be used as the active stream provider when starting a screen share.

### Key Entities

- **Screen Share Controls (Tool Group)**: A custom control group in the Foundry VTT Scene Controls sidebar containing screen share management buttons.
- **Backend Selection Dialog**: An interactive UI dialog allowing the GM to select and configure the active streaming provider.
- **Stream Provider Configuration**: Persistent client-side settings indicating which concrete `StreamProvider` implementation is active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The new "Screen Share Controls" tool group and its three buttons render on the left toolbar within 1 second of canvas load.
- **SC-002**: Clicking the "Remove Screen Container Mark" button removes the flag from the database and stops any active stream in under 500ms.
- **SC-003**: The backend selection dialog renders correctly with the active backend pre-selected within 200ms of clicking the selection button.
- **SC-004**: Selecting a different backend and saving stores the preference in client settings instantly, directing all subsequent screen shares to use the newly selected provider.

## Assumptions

- **A-001**: The GM's selection is client-side only (each GM client can have their own preferred streaming backend, if multiple GMs exist).
- **A-002**: The default backend is `LocalStreamProvider`.
- **A-003**: Removing the flag is a synchronous database update that propagates to all connected players to clear their local renderers.
- **A-004**: Non-GMs do not have permission to view or interact with the screen share control group or backend selection.
