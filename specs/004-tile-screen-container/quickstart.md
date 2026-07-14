# Quickstart & Verification Guide: Tile Screen Share Container

This guide describes the manual validation scenarios to verify that the Tile Screen Share Container feature and the single-container restriction work correctly in a local Foundry VTT v14 environment.

## Prerequisites

1. Foundry VTT v14 instance running.
2. Screen Share module active in the World.
3. Logged in as a Gamemaster (GM).
4. A browser supporting screen sharing media capture.

---

## Validation Scenarios

### Scenario 1: Mark a Tile as the Screen Container

1. **Setup**: Ensure the active Scene has no marked regions or tiles.
2. **Action**:
   - Create a Tile on the canvas.
   - Double-click the Tile to open the Tile configuration sheet (`TileConfig`).
3. **Expected Outcome**:
   - The "Screen Share Container" checkbox is visible (enabled and unchecked) at the bottom of the config sheet.
4. **Action**:
   - Check the checkbox and save the sheet.
5. **Expected Outcome**:
   - The sheet closes without errors.
   - Open the sheet again and verify that the checkbox is still checked.

---

### Scenario 2: Enforce Single Container Constraint (Region -> Tile)

1. **Setup**: Ensure Region A is marked as a screen container.
2. **Action**:
   - Create Tile B on the canvas and open its configuration sheet.
3. **Expected Outcome**:
   - The "Screen Share Container" checkbox on Tile B is **disabled** (cannot be clicked).
   - A hint message is visible below the checkbox stating: `Another container ("Region A") is already marked as the screen container in this scene.`

---

### Scenario 3: Enforce Single Container Constraint (Tile -> Region)

1. **Setup**: Ensure Tile A is marked as a screen container.
2. **Action**:
   - Create Region B on the canvas and open its configuration sheet (Appearance tab).
3. **Expected Outcome**:
   - The "Screen Share Container" checkbox on Region B's Appearance tab is **disabled**.
   - A hint message is visible below the checkbox stating: `Another container ("Tile A") is already marked as the screen container in this scene.`

---

### Scenario 4: Successful Screen Share Capture and Local Preview on a Tile

1. **Setup**: Mark Tile A as the screen container.
2. **Action**:
   - Click the **Start/Stop Screen Share** icon in the scene controls.
   - Select a screen/window source in the browser selection dialog and click **Share**.
3. **Expected Outcome**:
   - The stream starts rendering within Tile A's boundaries.
   - Zooming, panning, moving, or rotating Tile A dynamically transforms and rotates the rendering video feed.
   - The video is scaled to fill Tile A's width and height.

---

### Scenario 5: Stop Screen Share on Tile and Cleanup

1. **Setup**: Start screen sharing successfully on Tile A (Scenario 4 completed).
2. **Action**:
   - Click the **Start/Stop Screen Share** icon in the scene controls to toggle it off.
3. **Expected Outcome**:
   - The video overlay vanishes immediately from Tile A.
   - Tile A's original texture is visible and unaffected.
   - No hidden `<video>` nodes or unreleased WebGL textures remain in browser memory.
