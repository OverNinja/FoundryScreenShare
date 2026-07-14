# Public API Contract: Dedicated Screen Share Controls

This contract defines the additions and updates to the `globalThis.ScreenShare` public Javascript API.

## Methods & Properties

### 1. `ScreenShare.openBackendSelectionDialog()`
Opens the streaming backend selection dialog for the GM.

- **Signature**: `openBackendSelectionDialog() -> void`
- **Prerequisites**:
  - The current user must be a Gamemaster (`game.user.isGM === true`).
- **Behavior**:
  - Instantiates and renders a new Foundry VTT `Dialog`.
  - Dynamically populates the options using the registered backends list.
  - Retrieves the current selection from `game.settings.get("screen-share", "activeBackend")` to show as the pre-selected option.
  - On confirm, updates the client setting `screen-share.activeBackend`.

---

### 2. `ScreenShare.PROVIDERS`
An object registering the available streaming backend implementations.

- **Type**: `Object`
- **Fields**:
  - `local`: An object containing:
    - `name` (`string`): The user-friendly name (`"Local Screen Share (Testing)"`).
    - `class` (`StreamProvider`): The class constructor (`LocalStreamProvider`).
  - *Future providers will be registered in this object.*

---

## Behavior Modifications to Existing API

### 1. `ScreenShare.startShare()`
- **Modified Behavior**:
  - Reads the active backend setting: `const activeBackend = game.settings.get("screen-share", "activeBackend") || "local"`.
  - Resolves the provider class from `ScreenShare.PROVIDERS[activeBackend].class`.
  - Instantiates the resolved class and saves the instance to `_activeProvider`.
  - Calls `_activeProvider.startStream()` to obtain the media stream.
