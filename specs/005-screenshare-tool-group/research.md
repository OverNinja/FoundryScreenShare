# Research: Dedicated Tool Group and Controls

This document details the architectural decisions and platform APIs involved in moving the screen share trigger button to its own tool group, adding a container flag removal tool, and implementing a streaming backend selection UI.

## 1. Custom Scene Control Group Registration

In Foundry VTT, the left toolbar is populated using the `getSceneControlButtons` hook.

### Decision
Register a completely new `SceneControl` object inside the `getSceneControlButtons` hook callback.
- **Name**: `screen-share`
- **Title**: `Screen Share Controls`
- **Icon**: `fas fa-desktop`
- **Layer**: `regions` (this ensures the controls map logically to the active canvas interaction layer where regions and tiles reside)
- **Visible**: Restricted to GM clients (`game.user.isGM` is true)

The control group will contain three tools:
1. `screen-share-toggle` (Stateful toggle button for starting/stopping the stream)
2. `remove-container-flag` (Action button to clear marked container objects in the active scene)
3. `backend-selection` (Action button to open the backend selection dialog)

### Rationale
Creating a custom group separates module-specific features from the native Regions/Drawing/Tiles tools, elevating the visibility and usability of the module for the GM. Restricting it to `game.user.isGM` ensures players do not see or interact with the stream control center.

### Alternatives Considered
- **Keep under the Regions layer**: Rejected because it clutters the native region layout and doesn't scale well as new screen sharing actions (like backend selection and flag clearing) are introduced.

---

## 2. Dynamic Container Flag Removal

Removing the `isScreenContainer` flag from marked regions or tiles currently requires GMs to locate the object, open its configuration dialog, go to the Appearance tab, uncheck the box, and save.

### Decision
Provide a button (`remove-container-flag`) that dynamically scans the active scene for any marked document (Region or Tile) and clears the `isScreenContainer` flag using the standard Foundry VTT document update API.
If screen sharing is currently active:
1. Automatically stop the media stream first by invoking `globalThis.ScreenShare.stopShare()`.
2. Clear the flag on the document using `container.update({ "flags.screen-share.isScreenContainer": false })` (or removing the flag key using `-=isScreenContainer` syntax).
3. Display a success notification to the GM.

### Rationale
Ensures the canvas state remains consistent. Stopping the share before removing the flag is essential to comply with **Principle II (Explicit WebGL & Network Lifecycle Management)** and prevents rendering artifacts from lingering when the target container is unflagged.

### Alternatives Considered
- **Keep only config dialog toggles**: Rejected because finding a specific region/tile in a complex scene to clear its mark is tedious and harms the GM's workflow.

---

## 3. Streaming Backend Selection

### Decision
Implement a client-side setting using `game.settings.register` to persist the selected backend ID (default: `"local"`).
Provide a toolbar button (`backend-selection`) that opens a Foundry VTT `Dialog` displaying the list of available backends. Selecting a backend and clicking "Save" updates the client setting.
In `startShare()`, the system reads this setting and instantiates the corresponding `StreamProvider` implementation.

### Rationale
This aligns with **Principle I (Decoupled Transmission Strategy)**. By abstracting provider instantiation behind the selection state, future backends (e.g. WebRTC, LiveKit) can be registered as additional options in the dialog without modifying the core toolbar registration or canvas rendering logic.

### Alternatives Considered
- **Global Game Setting**: Rejected because streaming providers could vary based on the GM's individual network setup, browser capabilities, or local environment. A client-scope setting provides maximum flexibility.
