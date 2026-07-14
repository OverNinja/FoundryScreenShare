# API & Hook Contracts: Foundry v13 Tile Compatibility

This document specifies the programmatic contracts, version check helpers, and conditional hook registrations modified to support both Foundry VTT v13 and v14.

## 1. Version Detection Contract

We expose a simple version state on the global `ScreenShare` object or local config to determine feature support dynamically:

```javascript
/**
 * Check if the active Foundry VTT version is v14 or newer.
 * @returns {boolean}
 */
export function isV14OrLater() {
  const generation = game.release?.generation ?? parseInt(game.version);
  return generation >= 14;
}
```

## 2. Scene Controls Registration Contract

The toolbar control group registration changes dynamically depending on the detected version generation.

```javascript
Hooks.on("getSceneControlButtons", (controls) => {
  const groupData = {
    name: "screen-share",
    title: "Screen Share Controls",
    icon: "fas fa-desktop",
    // Omit layer (or set to null) in both versions so the currently selected layer remains active
    layer: null,
    visible: game.user?.isGM ?? false,
    tools: [ /* ... tools ... */ ]
  };

  controls.push(groupData);
});
```

## 3. UI Hook Gates

Hook registration for v14-specific features (Scene Regions) must be gated and not run under v13.

```javascript
// In src/ui/config.js:
if (isV14OrLater()) {
  // Register Region-specific configuration sheet injection
  Hooks.on("renderRegionConfig", (app, html, data) => {
    // Inject "Screen Share Container" into Region appearance tab
  });

  // Register Region-specific lifecycle hooks
  Hooks.on("updateRegion", (document, change, options, userId) => {
    updateOpenConfigs();
  });
  Hooks.on("deleteRegion", (document, options, userId) => {
    updateOpenConfigs();
  });
}
```
