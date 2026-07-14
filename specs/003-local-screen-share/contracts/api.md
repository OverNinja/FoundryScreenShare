# Public API Contract: ScreenShare

This contract defines the public Javascript interface exposed by the Screen Share module on `globalThis.ScreenShare`.

## Methods & Properties

### 1. `ScreenShare.startShare()`
Initiates the local screen capture and rendering process.

- **Signature**: `async startShare() -> Promise<void>`
- **Prerequisites**:
  - The current user must be a Gamemaster (`game.user.isGM === true`).
  - There must be a designated "Screen Share Container" region in the active scene.
- **Behavior**:
  - Locates the active screen container region.
  - Prompts the GM for screen capture.
  - Sets up the PixiJS canvas rendering and begins playing the local preview.
- **Errors**:
  - Throws an error (and shows a notification) if the user is not a GM.
  - Throws an error if no active screen container region is configured in the current scene.
  - Throws an error if screen selection is cancelled or fails.

---

### 2. `ScreenShare.stopShare()`
Stops the active screen capture and removes all rendering artifacts.

- **Signature**: `async stopShare() -> Promise<void>`
- **Behavior**:
  - Terminates all capture tracks.
  - Releases WebGL texture bindings and cleans up DOM/PIXI resources.
  - Resets the scene control toggle button to the inactive state.

---

### 3. `ScreenShare.getScreenContainer(scene)`
Finds the active screen share container region in a scene.

- **Signature**: `getScreenContainer(scene: Scene) -> RegionDocument | null`
- **Parameters**:
  - `scene`: The Foundry VTT `Scene` document.
- **Returns**:
  - The marked `RegionDocument`, or `null` if none exists.
  - If multiple exist, resolves conflicts alphabetically by Document ID.

---

### 4. `ScreenShare.isRegionActiveContainer(region)`
Checks if a given region is the active screen container in its scene.

- **Signature**: `isRegionActiveContainer(region: RegionDocument) -> boolean`
- **Parameters**:
  - `region`: The Foundry VTT `RegionDocument` to check.
- **Returns**:
  - `true` if the region is the active screen container, `false` otherwise.

---

## Abstract Interface: `StreamProvider`
Any alternative streaming implementation must conform to this interface.

- **`async startStream() -> Promise<MediaStream>`**: Begins the media capture and returns the stream.
- **`async stopStream() -> Promise<void>`**: Terminates all active media tracks and frees resources.
- **`get isActive() -> boolean`**: Returns `true` if the stream is active, `false` otherwise.
