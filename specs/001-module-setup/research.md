# Research: Module Setup and Initialization

This document details the architectural decisions, platform specifics, and implementation strategies for initializing the Foundry VTT Screen Share module.

## 1. Foundry VTT v14 Module Manifest
Foundry VTT requires a `module.json` file in the root of the module folder to register it.

### Minimum Manifest Requirements
```json
{
  "id": "screen-share",
  "title": "Screen Share",
  "description": "Allows GMs to share their screen directly onto canvas regions.",
  "version": "1.0.0",
  "compatibility": {
    "minimum": "14",
    "verified": "14"
  },
  "esmodules": [
    "screen-share.js"
  ],
  "relationships": {
    "requires": []
  }
}
```

## 2. Cross-Platform Symbolic Link Strategy
The module needs to be linked into the Foundry VTT user data path (e.g. `C:\Users\<User>\AppData\Local\FoundryVTT\Data\modules\screen-share`).

### Link Creation on Windows (PowerShell)
To create a symbolic link in Windows PowerShell:
```powershell
New-Item -ItemType SymbolicLink -Path "$FoundryPath\Data\modules\screen-share" -Value "$PSScriptRoot"
```
Or using CMD:
```cmd
mklink /d "$FoundryPath\Data\modules\screen-share" "$PSScriptRoot"
```

### Configuration Method
A configuration file named `.env` will define `FOUNDRY_DATA_PATH`.
Example:
```env
FOUNDRY_DATA_PATH=C:\Users\Lucas\AppData\Local\FoundryVTT
```

### Script Design
We will provide:
1. `link-module.ps1` (PowerShell script for Windows users)
2. `link-module.sh` (Shell script for macOS/Linux users)
These scripts will:
- Read `.env` for `FOUNDRY_DATA_PATH`.
- Verify the path exists and contains a `Data/modules` directory.
- Verify that no conflicting directory or link exists, or offer to overwrite safely.
- Create the symlink.

## 3. Foundry VTT Hook for Controls
Foundry VTT provides the `getSceneControlButtons` hook to modify the left toolbar controls.

### Button Registration Pattern
```javascript
Hooks.on("getSceneControlButtons", (controls) => {
  const regionsControl = controls.find(c => c.name === "regions");
  if (regionsControl) {
    regionsControl.tools.push({
      name: "screen-share-toggle",
      title: "Start/Stop Screen Share",
      icon: "fas fa-desktop",
      toggle: true,
      visible: game.user?.isGM ?? false,
      onClick: (toggled) => {
        ui.notifications.info(`Screen Share Toggled: ${toggled}`);
      }
    });
  }
});
```
This cleanly inserts the button under the "Regions" layer toolbar and restricts it to GM users.
