# Quickstart & Verification Guide: Local Screen Share

This guide describes the manual validation scenarios to verify that the Local Screen Share feature works correctly in a local Foundry VTT v14 environment.

## Prerequisites

1. Foundry VTT v14 instance running.
2. Screen Share module installed and active in the World.
3. Logged in as a Gamemaster (GM) user.
4. Access to a browser that supports `navigator.mediaDevices.getDisplayMedia`.

---

## Validation Scenarios

### Scenario 1: Attempt Share with No Container Region

1. **Setup**: Ensure the active Scene has no region marked as a "Screen Share Container".
2. **Action**:
   - Click the **Start/Stop Screen Share** icon (desktop icon) in the scene controls under the "regions" group.
3. **Expected Outcome**:
   - The browser does **not** prompt for screen selection.
   - A warning notification is displayed (e.g. `No active Screen Share Container region found on this scene.`).
   - The control button toggles back to the **off** (inactive) state.

---

### Scenario 2: Initiate Capture and Cancel Browser Dialog

1. **Setup**: Mark a Region (e.g., `Screen Region`) as the "Screen Share Container" on the active Scene.
2. **Action**:
   - Click the **Start/Stop Screen Share** icon in the scene controls.
3. **Expected Outcome**:
   - The browser's native screen selection dialog opens.
4. **Action**:
   - Click the **Cancel** button on the browser's screen selection dialog.
5. **Expected Outcome**:
   - The browser dialog closes.
   - An info notification is displayed indicating that the share was cancelled.
   - The control button toggles back to the **off** state.

---

### Scenario 3: Successful Screen Share Capture and Local Preview

1. **Setup**: Ensure `Screen Region` is marked as the "Screen Share Container".
2. **Action**:
   - Click the **Start/Stop Screen Share** icon in the scene controls.
   - In the browser dialog, select a screen, window, or tab (e.g., a simple test page or image tab).
   - Click **Share**.
3. **Expected Outcome**:
   - The browser dialog closes.
   - The control button stays highlighted (**on** state).
   - The selected screen feed starts playing inside `Screen Region` on the canvas.
   - The video is cropped exactly to the region's boundary (e.g. if the region is a polygon, the video is clipped to that polygon).
   - Panning and zooming the canvas correctly transforms, scales, and pans the video display.

---

### Scenario 4: Stop Screen Share via Controls Toggle

1. **Setup**: Start screen sharing successfully (Scenario 3 completed).
2. **Action**:
   - Click the **Start/Stop Screen Share** icon in the scene controls to toggle it off.
3. **Expected Outcome**:
   - The control button turns off (un-highlighted).
   - The video stream disappears from the canvas.
   - The region returns to its default appearance.
   - Verify in the developer console that no hidden `<video>` elements remain in the document body, and no WebGL memory warnings are logged.

---

### Scenario 5: Stop Screen Share via Browser Overlay

1. **Setup**: Start screen sharing successfully (Scenario 3 completed).
2. **Action**:
   - Click the browser's native overlay button (e.g., **Stop sharing** bar at the bottom of the screen or browser window).
3. **Expected Outcome**:
   - The video stream immediately disappears from the canvas.
   - The region returns to its default appearance.
   - The scene control toggle button automatically updates to the **off** (inactive) state.

---

### Scenario 6: Scene Switching during Active Share

1. **Setup**: Start screen sharing successfully (Scenario 3 completed).
2. **Action**:
   - Switch to a different Scene in the Foundry VTT navigation bar.
3. **Expected Outcome**:
   - The active screen share stream is terminated.
   - All associated canvas rendering resources are destroyed.
   - The control button on the new scene shows as **off**.
