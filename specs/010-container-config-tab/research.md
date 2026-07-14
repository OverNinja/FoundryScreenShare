# Research: Container Configuration Tab

This document outlines the technical research for implementing a dedicated Screen Share configuration tab on all valid container types (Regions, Tiles, and Drawings) and implementing container-specific video settings (fit mode, frame rate, resolution) with global default fallbacks.

## 1. Dynamic Tab Injection in Foundry VTT Sheets

Foundry VTT configuration sheets (`TileConfig`, `DrawingConfig`, `RegionConfig`) render their HTML using templates. Since modules cannot easily override these templates without risking conflicts with other modules, the standard practice is to inject tabs dynamically using the `render[DocumentName]Config` hooks.

### HTML Structure of Config Sheets
In both Foundry v13 and v14, configuration sheets use a tab navigation element and a corresponding sheet body where tab content sections are stored:

```html
<!-- Navigation bar -->
<nav class="sheet-tabs tabs" data-group="main">
  <a class="item" data-tab="appearance"><i class="fas fa-palette"></i> Appearance</a>
  <!-- We will inject our tab item here -->
</nav>

<!-- Tab content sections -->
<section class="tab" data-tab="appearance">
  <!-- Appearance fields -->
</section>
<!-- We will inject our section here -->
```

### Injection Logic
When the config hook triggers (e.g. `renderTileConfig`):
1. Access the jQuery or native DOM HTML element of the sheet.
2. Locate the navigation bar using a selector: `nav.sheet-tabs` or `nav[data-group="main"]`.
3. Append a new tab header:
   ```html
   <a class="item" data-tab="screen-share"><i class="fas fa-desktop"></i> Screen Share</a>
   ```
4. Find the container of the tab contents (usually the form or `.sheet-body`).
5. Append the tab content section:
   ```html
   <section class="tab" data-group="main" data-tab="screen-share">
     <!-- Config fields go here -->
   </section>
   ```
6. If the application has a `_tabs` array (standard Foundry Tab controller instance), ensure it is aware of the new tab or that click events are correctly handled by Foundry's native tabs manager. (Usually, Foundry's native `Tabs` class automatically binds to any `.tabs .item` and toggles `.tab` elements with matching `data-tab` within the same group).

## 2. Fit Mode Math and PixiJS Implementation

We need to support three video fit modes within the container boundaries:
- **Fill**: Stretch the video to fill the container.
- **Contain**: Scale the video to fit within the container while preserving aspect ratio (letterbox/pillarbox).
- **Cover**: Scale the video to completely cover the container while preserving aspect ratio, cropping any overflow.

### Aspect Ratio Calculations
Let:
- $W_c, H_c$ be the width and height of the container.
- $W_v, H_v$ be the original width and height of the video track (from `video.videoWidth` and `video.videoHeight`).
- $R_c = W_c / H_c$ be the aspect ratio of the container.
- $R_v = W_v / H_v$ be the aspect ratio of the video stream.

#### Fill Mode
- Width: $W_t = W_c$
- Height: $H_t = H_c$
- Offsets: $X_t = 0, Y_t = 0$

#### Contain Mode
- If $R_v > R_c$ (video is wider than container):
  - $W_t = W_c$
  - $H_t = W_c / R_v$
- Else (video is taller than container):
  - $H_t = H_c$
  - $W_t = H_c \times R_v$
- Offsets (centered):
  - $X_t = (W_c - W_t) / 2$
  - $Y_t = (H_c - H_t) / 2$

#### Cover Mode
- If $R_v > R_c$ (video is wider than container):
  - $H_t = H_c$
  - $W_t = H_c \times R_v$
- Else (video is taller than container):
  - $W_t = W_c$
  - $H_t = W_c / R_v$
- Offsets (centered):
  - $X_t = (W_c - W_t) / 2$
  - $Y_t = (H_c - H_t) / 2$

### PixiJS Clipping/Masking for Overflow (Cover Mode)
For **Cover** mode, the video will exceed the boundaries of the container.
- **Regions**: The rendering session already applies a polygon-based mask to the `pixiSprite` using the Region's polygon boundaries. Any overflow is automatically cropped.
- **Tiles & Drawings**: These containers are generally rectangular. To prevent the video from overflowing outside the container boundaries on the canvas:
  1. Create a `PIXI.Graphics` rectangular mask:
     ```javascript
     const mask = new PIXI.Graphics();
     if (typeof mask.rect === "function") {
       mask.rect(0, 0, W_c, H_c);
       mask.fill(0xffffff);
     } else {
       mask.beginFill(0xffffff);
       mask.drawRect(0, 0, W_c, H_c);
       mask.endFill();
     }
     ```
  2. Add the mask as a child of the container and set it as the mask of `pixiSprite`:
     ```javascript
     this.pixiContainer.addChild(mask);
     this.pixiSprite.mask = mask;
     ```

## 3. Gathering Custom Constraints for Video Capture

When the GM starts a stream, the module requests the display stream via `navigator.mediaDevices.getDisplayMedia`.
Currently, the constraints are read from the global settings:
```javascript
const maxFramerate = game.settings.get("screen-share", "maxFramerate") || 0;
const maxResolution = game.settings.get("screen-share", "maxResolution") || "auto";
```

To support container-level overrides:
1. Retrieve the active container document.
2. Read the container's flags:
   - `flags.screen-share.maxFramerate` (defaults to `"default"`)
   - `flags.screen-share.maxResolution` (defaults to `"default"`)
3. Resolve the values:
   - If the value is `"default"` or undefined, use the global module setting value.
   - Otherwise, use the container override value.
4. Pass the resolved constraints to the StreamProvider during `startStream(constraints)`.
