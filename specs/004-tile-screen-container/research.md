# Research: Tile and Region Screen Share Container

This document outlines the technical research, API choices, and implementation strategy for adding screen share container functionality to Tiles in Foundry VTT v14, while enforcing a single screen container constraint across both Regions and Tiles.

## Core Architecture Decisions

### 1. Unified Container Discovery & Cross-Type Single-Container Restriction
* **Decision**: Update `ScreenShare.getScreenContainer(scene)` to scan both `scene.regions` and `scene.tiles` for the `screen-share.isScreenContainer` flag.
* **Rationale**: Enforces a scene-wide strict limitation of at most one screen container, regardless of whether it is a Region or a Tile.
* **Conflict Resolution**: If multiple marked documents exist in the scene (e.g. through external updates or API operations), the resolution priority is:
  1. Region Documents (sorted alphabetically by document ID)
  2. Tile Documents (sorted alphabetically by document ID)
  This ensures a deterministic single container at all times.

---

### 2. UI Hooking for Tile Configuration (`TileConfig`)
* **Decision**: Register a hook for `renderTileConfig` similar to `renderRegionConfig` to inject the Screen Share checkbox.
* **Rationale**: Satisfies the requirement to allow GMs to configure Tiles as screen containers using native config dialogs.
* **Technical Flow**:
  - In the `renderTileConfig` hook, check if the active user is a GM.
  - Check if the Tile document has the `screen-share.isScreenContainer` flag set.
  - Scan the active scene for any existing container (Region or Tile).
  - If another container is already marked, disable the checkbox and display a descriptive note (e.g. `Another container (Region "Screen Area") is already marked as the screen container in this scene.`).
  - Append the form control to the bottom of the Tile configuration sheet.
  - Auto-resize the sheet's height to prevent layout truncation.

---

### 3. Rendering Video Stream on a Tile in PixiJS
* **Decision**: Add the video-backed `PIXI.Sprite` directly as a child of the `Tile` placeable object on the canvas.
* **Rationale**: 
  - A `Tile` placeable object (`tileDoc.object`) is a `PIXI.Container` (inherits from `PlaceableObject`).
  - By adding our custom video container as a child of `tileObject`, PixiJS automatically applies the Tile's existing canvas translation, scale, rotation, and visibility.
  - This guarantees that panning, zooming, moving, scaling, or rotating the Tile instantly transforms the screen share video rendering, achieving perfect parity with region rendering without manual coordinate recalculations.
* **Technical Flow**:
  - Retrieve the target placeable object: `tileDoc.object`.
  - Create the hidden video element and generate a `PIXI.Texture` from it.
  - Create a `PIXI.Sprite(_pixiTexture)`.
  - Set the sprite's dimensions locally: `width = tileDoc.width` and `height = tileDoc.height` (relative to the Tile's local frame).
  - Create a `PIXI.Container`, add the sprite to it, and append this container as a child of `tileObject`.
  - On stream teardown, remove the child container from `tileObject` and destroy the WebGL textures cleanly to prevent memory leaks.

---

### 4. Hook Listeners and Synchronization
* **Decision**: Register hooks for `updateTile` and `deleteTile` to trigger re-renders of open `TileConfig` and `RegionConfig` sheets when screen container states change.
* **Rationale**: Maintains a real-time reactive UI. When a GM flags a Tile as the container, other open configuration sheets must immediately disable their checkboxes.

---

## Alternatives Considered

### 1. Modifying the Tile's Primary Mesh/Sprite Texture Directly
* **Decision**: Rejected.
* **Rationale**: Replacing the Tile's underlying texture (e.g., `tileObject.mesh.texture = videoTexture`) is simple, but makes restoring the tile's original image texture more complex and error-prone (requiring us to cache the original texture path, handle tile image updates during sharing, etc.). Appending our video sprite as a child overlay is cleaner because we can simply remove the child on stop, and the original tile texture is automatically visible again.
