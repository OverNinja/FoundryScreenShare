# Data Model: Dedicated Screen Share Controls

This document details the configuration schema, settings definitions, and data structures introduced by the Dedicated Screen Share Controls feature.

## 1. Client-Side Settings

The module registers a client-scoped setting to store the active streaming backend selection.

### `screen-share.activeBackend`
- **Scope**: `"client"` (stored per browser client, unique to the GM)
- **Config**: `false` (hidden from the default Foundry package settings UI; managed exclusively via the custom toolbar selection dialog)
- **Type**: `String`
- **Default**: `"local"`
- **Supported Values**:
  - `"local"`: Uses `LocalStreamProvider` (uses browser's local screen capture API)
  - *Future backends (e.g. `"webrtc"`, `"livekit"`) will be appended here*

---

## 2. Foundry VTT Scene Control Schema

The custom control group is registered under the `getSceneControlButtons` hook, complying with Foundry VTT's `SceneControl` interface.

### SceneControl Group (`screen-share`)
- **name**: `"screen-share"`
- **title**: `"Screen Share Controls"`
- **icon**: `"fas fa-desktop"`
- **layer**: `"regions"`
- **visible**: `game.user?.isGM ?? false`
- **tools**: An array (v13) or object (v14) of `SceneControlTool` items.

### SceneControlTool Item Definitions

#### 1. Start/Stop Screen Share (`screen-share-toggle`)
- **name**: `"screen-share-toggle"`
- **title**: `"Start/Stop Screen Share"`
- **icon**: `"fas fa-desktop"`
- **toggle**: `true`
- **active**: `globalThis.ScreenShare?.isSharing ?? false`
- **onClick**: `(toggled) => { ... }`

#### 2. Remove Screen Container Mark (`remove-container-flag`)
- **name**: `"remove-container-flag"`
- **title**: `"Remove Screen Container Mark"`
- **icon**: `"fas fa-trash-alt"`
- **button**: `true`
- **onClick**: `() => { ... }`

#### 3. Select Streaming Backend (`backend-selection`)
- **name**: `"backend-selection"`
- **title**: `"Select Streaming Backend"`
- **icon**: `"fas fa-cogs"`
- **button**: `true`
- **onClick**: `() => { ... }`

---

## 3. Flag Mutations

Removing the screen container mark mutates the flags on the target document:
- **Target**: `RegionDocument` or `TileDocument`
- **Mutation**: Set `flags.screen-share.isScreenContainer` to `false` or delete the key using Foundry's `-=` update format:
  ```javascript
  document.update({ "flags.screen-share.-=isScreenContainer": null });
  ```
- **Sync**: This database update automatically synchronizes to all connected clients, causing them to clear their canvas renders of the stream on the next update hook.
