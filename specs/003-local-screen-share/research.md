# Research: Local Screen Share Capture and Local Rendering

This document outlines the technical research, API choices, and alternatives evaluated for capturing the screen locally via the browser's MediaDevices API and rendering it inside a Scene Region using PixiJS in Foundry VTT v14.

## Core Architecture Decisions

### 1. Abstract Stream Provider (`StreamProvider` & `LocalStreamProvider`)
* **Decision**: Implement a decoupled `StreamProvider` interface and a concrete `LocalStreamProvider` class to handle the video capture lifecycle.
* **Rationale**: This strictly satisfies **Principle I (Decoupled Transmission Strategy)**. The UI button and canvas rendering systems will interact exclusively with the `StreamProvider` abstraction. In future phases, we can introduce a `WebRTCStreamProvider` or `LiveKitStreamProvider` without changing the core rendering or UI code.
* **API Details**:
  - `StreamProvider` defines asynchronous `startStream()` and `stopStream()` methods, and an `isActive` getter.
  - `LocalStreamProvider` invokes `navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })` on `startStream()`.
  - It listens for the `ended` event on the video track to trigger automatic teardown.

---

### 2. Rendering Pipeline & PixiJS Masking
* **Decision**: Dynamically create a hidden `<video>` element, bind it to a `PIXI.Texture`, wrap it in a `PIXI.Sprite` placed inside a `PIXI.Container`, and apply a polygon-shaped mask corresponding to the region's boundaries.
* **Rationale**:
  - This satisfies **Principle III (Foundry VTT v14 API Standard Compliance)** by using native Scene Region boundaries instead of drawing overlay hacks.
  - This satisfies **Principle V (Masked PixiJS Canvas Rendering)** by cropping the video stream exactly to the polygon shape of the region.
* **Technical Flow**:
  - Retrieve the active region using `ScreenShare.getScreenContainer()`.
  - Get the PlaceableObject representation via `regionDocument.object`.
  - Extract the geometry polygons from `regionObject.polygons` (or fallback to `regionDocument.polygons`).
  - Create a `PIXI.Graphics` object, draw the union of all polygons, and assign it as the `.mask` of the PIXI Container holding the video sprite.
  - Calculate the bounding box of the region's polygons to size and position the video sprite at `(minX, minY)` with size `(maxX - minX, maxY - minY)`.
  - Append the PIXI Container as a child of the `regionObject`.

---

### 3. WebGL and DOM Resource Lifecycle Management
* **Decision**: Explicitly release all media tracks, delete WebGL textures, and remove DOM nodes immediately on teardown.
* **Rationale**: This satisfies **Principle II (Explicit WebGL & Network Lifecycle Management)**. Unreleased textures and open streams degrade canvas performance and leak memory.
* **Technical Flow on Teardown**:
  - Stop all tracks on the active `MediaStream`.
  - Call `sprite.destroy()` to remove the sprite from the PIXI container.
  - Call `texture.destroy(true)` (with `true` to also destroy the base texture) to free WebGL memory.
  - Pause the `<video>` element, set `srcObject = null`, and call `.remove()` to purge it from the DOM.
  - Remove the custom container and mask from the `regionObject`.
  - Repaint the region back to its default appearance.

---

### 4. Gating Control Visibility & Access
* **Decision**: Restrict the custom toolbar button and media capture invocation strictly to the GM role (`game.user.isGM`).
* **Rationale**: This satisfies **Principle IV (Dual-Role Signaling & Connection Architecture)**. Players do not need screen-sharing controls. Gating the capture process prevents unauthorized media streaming triggers.

---

## Alternatives Considered

### 1. Rendering on the Canvas HUD or Overlay Layer
* **Decision**: Rejected.
* **Rationale**: Placing a floating video overlay on top of the canvas is simple but breaks canvas panning/zooming and does not clip to custom region shapes. Rendering directly inside the `RegionObject` using PixiJS makes the video look like a native part of the gaming canvas.

### 2. Using standard PIXI.VideoResource directly
* **Decision**: Approved with manual DOM attachment fallback.
* **Rationale**: While PIXI allows creating a texture directly from a URL or stream, creating a hidden `<video>` element manually in the DOM gives us explicit lifecycle control (such as listening to browser-level events and cleanly detaching `srcObject` on stop).
