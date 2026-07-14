# Quickstart Validation Guide: Container Configuration Tab

This guide outlines the manual validation scenarios to verify the correctness of the Container Configuration Tab feature.

## Prerequisites
- A running Foundry VTT v14 instance (with support for Scene Regions, Tiles, and Drawings).
- A running Foundry VTT v13 instance (to verify Tile and Drawing tab rendering, ensuring no Region errors are thrown).

---

## Scenario 1: Tab Navigation and Fields UI Injection

### Setup
1. Log in as a Gamemaster.
2. Open an active Scene.

### Steps
1. Create or open the configuration sheet for:
   - A **Region** (v14 only)
   - A **Tile**
   - A **Drawing**
2. Verify that there is a **Screen Share** tab in the tab bar.
3. Click the **Screen Share** tab.
4. Verify that:
   - The checkbox "Screen Share Container" is present.
   - Three dropdowns exist: "Video Fit Mode", "Max Frame Rate", and "Max Resolution".
   - The Appearance tab no longer contains the "Screen Share Container" checkbox.

---

## Scenario 2: Conditional Field Gating

### Steps
1. Open a container's "Screen Share" tab.
2. With "Screen Share Container" unchecked:
   - Verify that the "Video Fit Mode", "Max Frame Rate", and "Max Resolution" dropdowns are disabled (greyed out).
3. Check the "Screen Share Container" checkbox:
   - Verify that the dropdowns immediately become enabled.
4. Uncheck the checkbox:
   - Verify that they become disabled again.
5. Close and save the sheet.

---

## Scenario 3: Global Defaults Fallback and Dynamic Labels

### Setup
1. Open the global Module Settings.
2. Set "Maximum Capture Resolution" to "720p".
3. Set "Maximum Capture Framerate" to "30 FPS".
4. Set "Default Video Fit Mode" to "Contain".

### Steps
1. Open a Tile's "Screen Share" tab and check "Screen Share Container".
2. Verify the labels of the default choices:
   - Fit Mode: "Default (Contain)" is selected.
   - Frame Rate: "Default (30 FPS)" is selected.
   - Resolution: "Default (720p)" is selected.
3. Save the Tile configuration.
4. Open the global Module Settings and change:
   - "Maximum Capture Resolution" to "1080p".
   - "Maximum Capture Framerate" to "60 FPS".
   - "Default Video Fit Mode" to "Cover".
5. Re-open the Tile configuration sheet's "Screen Share" tab.
6. Verify the labels have dynamically updated to:
   - Fit Mode: "Default (Cover)"
   - Frame Rate: "Default (60 FPS)"
   - Resolution: "Default (1080p)"

---

## Scenario 4: Overrides Validation and Fit Mode Rendering

### Steps
1. Open a Tile's configuration.
2. Under "Screen Share" tab, set:
   - Screen Share Container: Checked
   - Video Fit Mode: "Cover"
   - Max Frame Rate: "15 FPS"
   - Max Resolution: "720p"
3. Click "Save".
4. Open a browser console and run:
   ```javascript
   const tile = canvas.tiles.placeables[0].document;
   console.log(tile.flags["screen-share"]);
   // Expected output:
   // { isScreenContainer: true, fitMode: "cover", maxFramerate: 15, maxResolution: "720p" }
   ```
5. Click the "Start Screen Share" control on the scene controls.
6. Share a browser window or tab.
7. Verify that the video stream rendering:
   - Preserves the aspect ratio but fully covers the tile bounds (cropping overflow).
   - The capture settings applied correspond to 15 FPS and 720p maximum constraints.
