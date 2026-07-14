# Contracts: Settings and Rendering Integration

This document defines the interface contracts for resolving constraints and applying fit modes.

## 1. Resolved Settings Interface

When the GM starts a stream, the active container configuration is resolved into the standard WebRTC video constraints object format:

```typescript
interface ResolvedScreenShareConstraints {
  // Resolved from container flags or global settings
  maxFramerate: number; // 0 for Auto/Unlimited, otherwise specific FPS
  maxResolution: "auto" | "720p" | "1080p";
  fitMode: "contain" | "cover" | "fill";
}
```

### Constraint Converter
The resolution logic must yield the standard browser MediaStreamConstraints:

```javascript
/**
 * @param {ResolvedScreenShareConstraints} resolved
 * @returns {object} MediaStreamConstraints video sub-object
 */
function toVideoConstraints(resolved) {
  const constraints = {};
  if (resolved.maxFramerate > 0) {
    constraints.frameRate = { max: resolved.maxFramerate };
  }
  if (resolved.maxResolution === "720p") {
    constraints.height = { max: 720 };
  } else if (resolved.maxResolution === "1080p") {
    constraints.height = { max: 1080 };
  }
  return Object.keys(constraints).length > 0 ? constraints : true;
}
```

---

## 2. Rendering Interface (Fit Modes)

The rendering pipeline applies the resolved `fitMode` to scale and position the `PIXI.Sprite` within the container boundaries:

```typescript
interface ContainerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Scaling Logic Contract

```javascript
/**
 * Updates PIXI.Sprite size and offsets based on Fit Mode.
 * @param {PIXI.Sprite} sprite The video sprite
 * @param {ContainerBounds} bounds Bounding box of the container
 * @param {HTMLVideoElement} video The hidden video element providing metadata
 * @param {"contain"|"cover"|"fill"} fitMode The resolved fit mode
 */
function applyFitMode(sprite, bounds, video, fitMode) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (fitMode === "fill" || !vw || !vh) {
    sprite.width = bounds.width;
    sprite.height = bounds.height;
    sprite.x = bounds.x;
    sprite.y = bounds.y;
    return;
  }

  const R_v = vw / vh;
  const R_c = bounds.width / bounds.height;

  let wt, ht;
  if (fitMode === "contain") {
    if (R_v > R_c) {
      wt = bounds.width;
      ht = bounds.width / R_v;
    } else {
      ht = bounds.height;
      wt = bounds.height * R_v;
    }
  } else if (fitMode === "cover") {
    if (R_v > R_c) {
      ht = bounds.height;
      wt = bounds.height * R_v;
    } else {
      wt = bounds.width;
      ht = bounds.width / R_v;
    }
  }

  sprite.width = wt;
  sprite.height = ht;
  
  // Centering offsets
  sprite.x = bounds.x + (bounds.width - wt) / 2;
  sprite.y = bounds.y + (bounds.height - ht) / 2;
}
```
