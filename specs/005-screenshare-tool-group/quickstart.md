# Quickstart Guide: Dedicated Screen Share Controls Validation

This guide outlines the manual validation procedures to verify the correct behavior of the Dedicated Screen Share Controls.

## Prerequisites

- Foundry VTT v14 running with the Screen Share module enabled.
- A Gamemaster (GM) user account.
- An active scene.
- One Region or Tile document created on the active scene.

---

## Validation Scenarios

### Scenario 1: Toolbar Controls Layout

1. **Setup**: Log into Foundry VTT as the GM.
2. **Action**: Observe the left vertical Scene Controls toolbar.
3. **Verify**:
   - A dedicated button with a desktop icon (`fas fa-desktop`) is present.
   - Hovering over it displays the tooltip `"Screen Share Controls"`.
4. **Action**: Click the icon to expand the sub-tool set.
5. **Verify**:
   - The sub-toolbar displays three buttons:
     - `fas fa-desktop` (Tooltip: `"Start/Stop Screen Share"`)
     - `fas fa-trash-alt` (Tooltip: `"Remove Screen Container Mark"`)
     - `fas fa-cogs` (Tooltip: `"Select Streaming Backend"`)
   - The `"Regions"` tool group no longer contains the screen share toggle.
6. **Action**: Log in as a player in a separate browser window.
7. **Verify**:
   - The players do not see the `"Screen Share Controls"` tool group.

### Scenario 2: Streaming Backend Selection Dialog

1. **Action**: In the GM view, open the screen share controls sub-toolbar.
2. **Action**: Click the cogs icon (`fas fa-cogs` / `"Select Streaming Backend"`).
3. **Verify**:
   - A Dialog window titled `"Select Streaming Backend"` opens.
   - It displays a dropdown selector with `"Local Screen Share (Testing)"` selected.
4. **Action**: Click `"Save Selection"`.
5. **Verify**:
   - The dialog closes.
   - A success notification is shown: `"Active streaming backend updated to: Local Screen Share"`.
   - The setting is saved correctly.

### Scenario 3: Container Flag Removal (No Active Stream)

1. **Action**: Open the configuration sheet of a Region or Tile on the canvas.
2. **Action**: Go to the **Appearance** tab, check the **Screen Share Container** checkbox, and save.
3. **Action**: In the screen share controls toolbar, click the trash-alt icon (`fas fa-trash-alt` / `"Remove Screen Container Mark"`).
4. **Verify**:
   - A notification is shown: `"Removed screen container mark from [Object Name]"`.
5. **Action**: Open the configuration sheet of the object again.
6. **Verify**:
   - The **Screen Share Container** checkbox is unchecked.

### Scenario 4: Container Flag Removal during Active Stream

1. **Action**: Mark a Region or Tile as the screen container.
2. **Action**: Click the desktop icon (`fas fa-desktop` / `"Start/Stop Screen Share"`).
3. **Action**: Confirm browser media sharing permissions and share a window.
4. **Verify**:
   - The stream renders correctly inside the container on the canvas.
   - The screen share toggle button appears in the active (highlighted) state.
5. **Action**: Click the trash-alt icon (`fas fa-trash-alt` / `"Remove Screen Container Mark"`).
6. **Verify**:
   - The video stream immediately terminates and is removed from the canvas.
   - The screen share toggle button returns to the inactive state.
   - A notification confirms the flag was removed.
   - The flag is deleted from the document.
