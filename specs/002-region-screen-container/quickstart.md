# Quickstart & Verification Guide: Region Screen Container Marking

This guide describes the manual validation scenarios to verify that the Region Screen Container marking feature works correctly in a local Foundry VTT v14 environment.

## Prerequisites

1. Foundry VTT v14 instance running.
2. Screen Share module installed and active in the World.
3. An active Scene loaded on the canvas.
4. Logged in as a Gamemaster (GM) user.

## Validation Scenarios

### Scenario 1: Initial Marking of a Region

1. **Setup**: Create a new Region document on the canvas (e.g., name it `Screen Region`).
2. **Action**:
   - Double-click the region boundary or open its configuration sheet from the Regions directory.
   - Navigate to the **Appearance** tab.
   - Scroll to the bottom of the tab.
3. **Expected Outcome**:
   - A toggle/checkbox option labeled **Screen Share Container** is visible.
   - The checkbox is **unchecked** and **enabled**.
4. **Action**:
   - Check the **Screen Share Container** checkbox.
   - Click the **Save Changes** button at the bottom of the sheet.
5. **Expected Outcome**:
   - The sheet closes.
   - Re-opening the configuration sheet and navigating to the **Appearance** tab shows the checkbox is still **checked** and **enabled** (allowing the GM to untoggle it).

### Scenario 2: Prevention of Multiple Screen Containers (Conflict State)

1. **Setup**: Ensure `Screen Region` is marked as the Screen Share Container (Scenario 1 completed).
2. **Action**:
   - Create a second Region document on the canvas (e.g., name it `Secondary Region`).
   - Open the configuration sheet for `Secondary Region`.
   - Navigate to the **Appearance** tab.
3. **Expected Outcome**:
   - The **Screen Share Container** checkbox is visible at the bottom of the tab.
   - The checkbox is **unchecked** and **disabled** (cannot be clicked).
   - A descriptive note/observation is displayed adjacent to the checkbox label, stating: `Another region ("Screen Region") is already marked as the screen container in this scene.`

### Scenario 3: Container Cleanup on Deletion

1. **Setup**: Ensure `Screen Region` is marked as the Screen Share Container (Scenario 1 completed).
2. **Action**:
   - Delete the `Screen Region` document from the scene.
   - Open the configuration sheet for `Secondary Region`.
   - Navigate to the **Appearance** tab.
3. **Expected Outcome**:
   - The **Screen Share Container** checkbox is now **enabled** and can be toggled.
   - The disabled conflict message is no longer displayed.
