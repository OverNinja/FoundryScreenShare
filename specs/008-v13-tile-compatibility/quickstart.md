# Quickstart & Verification Guide: Foundry v13 Tile Compatibility

This guide describes the manual validation scenarios to verify that the Screen Share module runs correctly in both Foundry VTT v13 (tile-only mode) and v14 (standard mode) environments.

## Prerequisites

1. Access to a Foundry VTT v13 testing instance AND a Foundry VTT v14 instance.
2. The Screen Share module active in both testing worlds.
3. Logged in as a Gamemaster (GM) in both environments.
4. A web browser supporting screen sharing media capture.

---

## Validation Scenarios

### Scenario 1: Module Initialized Without Console Errors (v13 & v14)

1. **Action**:
   - Log into a Foundry VTT v13 world and open the browser console (`F12`).
   - Refresh the page to reload the module.
2. **Expected Outcome**:
   - The message `"Screen Share | Module loaded."` is printed to the console.
   - There are no uncaught JavaScript exceptions or runtime reference errors during initialization.

---

### Scenario 2: UI Control Group Layer Association (v13 & v14)

1. **Action**:
   - Activate any canvas layer (e.g. Tokens layer).
   - Click the Screen Share controls group icon (desktop) on the left sidebar toolbar.
2. **Expected Outcome**:
   - The Screen Share control menu opens.
   - The active canvas layer does not change (e.g., the Tokens layer remains active).
   - Verify that this behavior is identical on both Foundry v13 and v14.

---

### Scenario 3: Tile Configuration Sheet (v13)

1. **Setup**: Under a Foundry v13 instance, ensure the active Scene has no marked tiles.
2. **Action**:
   - Create a new Tile on the canvas.
   - Double-click the Tile to open its configuration dialog (`TileConfig`).
3. **Expected Outcome**:
   - The "Screen Share Container" checkbox is visible in the Appearance tab, enabled, and unchecked.
4. **Action**:
   - Check the checkbox and save the config.
5. **Expected Outcome**:
   - The dialog closes, the flag is saved, and opening the dialog again shows the checkbox as checked.

---

### Scenario 4: Region Features Deactivated (v13)

1. **Action (Foundry v13)**:
   - Check if there are any Scene Regions controls or documents available.
2. **Expected Outcome (Foundry v13)**:
   - No Scene Regions configuration injection is attempted (the module does not search for region containers or register region hooks).

---

### Scenario 5: Stream Capture & Tile Rendering (v13)

1. **Setup**: In a Foundry v13 instance, mark Tile A as the screen container.
2. **Action**:
   - Select the Screen Share controls from the Tiles layer panel and click the **Start/Stop Screen Share** toggle.
   - Accept the browser's sharing prompt and select a screen/tab source.
3. **Expected Outcome**:
   - The stream starts and renders cleanly inside Tile A's boundaries.
   - The rendering updates dynamically if Tile A is moved or rotated.
   - Toggling the tool button off stops the stream and restores Tile A's original texture.
