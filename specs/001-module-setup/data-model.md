# Data Model: Module Setup and Initialization

This document describes the schema structure of the Foundry VTT Module Manifest and the configuration for the Scene Control Button UI elements.

## 1. Module Manifest (`module.json`)

The manifest defines metadata used by Foundry VTT to load and run the module.

### Fields and Types
- **id** (`string`, mandatory): Unique identifier of the module (must be `"screen-share"`).
- **title** (`string`, mandatory): User-facing display name of the module.
- **description** (`string`, mandatory): Brief description of the module's purpose.
- **version** (`string`, mandatory): Semantic version of the module.
- **compatibility** (`object`, mandatory):
  - **minimum** (`string`): Minimum supported Foundry VTT version (e.g. `"14"`).
  - **verified** (`string`): Verified compatible Foundry VTT version (e.g. `"14"`).
- **esmodules** (`array` of `string` paths): Javascript entrypoint file paths to load as ES modules.

### Validation Rules
- `id` must match the parent folder name when symlinked to prevent load errors.
- `compatibility.minimum` must be set to at least `"14"`.

---

## 2. Environment Configuration (`.env`)

Used by the installation/link scripts to determine the local environment destination.

### Fields
- **FOUNDRY_DATA_PATH** (`string`, mandatory): The absolute file path to the local Foundry VTT user data folder (must contain a `Data` subfolder).

---

## 3. Scene Control Button Configuration

Properties passed to Foundry VTT's `SceneControlTool` registration interface.

### Properties
- **name** (`string`): Unique internal identifier for the tool (`"screen-share-toggle"`).
- **title** (`string`): Hover tooltip text.
- **icon** (`string`): FontAwesome class path for the button icon (e.g. `"fas fa-desktop"`).
- **toggle** (`boolean`): If `true`, the button acts as an on/off state toggle.
- **visible** (`boolean`): Determines if the tool is rendered. Must evaluate to `game.user.isGM`.
- **onClick** (`function`): Callback executed when the button is clicked.
