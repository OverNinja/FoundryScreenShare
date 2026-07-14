# Research: Region Screen Container Marking

This document outlines the technical research, API choices, and alternatives evaluated for implementing the Region Screen Container marking capability in Foundry VTT v14.

## API & Hook Choices

### 1. Intercepting Region Configuration rendering
* **Decision**: Use the core Foundry VTT v14 application render hook `renderRegionConfig`.
* **Rationale**: `RegionConfig` is the class responsible for the region configuration sheet. In Foundry VTT, when any application renders, it calls a hook matching `render[ClassName]`. In v14, this hook receives the native `HTMLElement` or `jQuery` object depending on the sheet's wrapper. We will wrap the HTML to handle both native elements and jQuery safely.
* **Alternatives Considered**: 
  - Extending `RegionConfig` and registering a custom class: Rejected because it is less compatible with other modules and more complex than a simple hook.

### 2. Tab Targeting
* **Decision**: Inject the checkbox at the end of the "Appearance" tab (`.tab[data-tab="appearance"]`).
* **Rationale**: The user explicitly requested to place the option at the end of the Appearance tab. In v14, tab content sections use the `.tab` class with `data-tab` attributes.
* **Alternatives Considered**: None, as this is a strict requirement.

### 3. Data Storage (Flag)
* **Decision**: Store the container mark as a boolean flag on the Region document under `flags.screen-share.isScreenContainer`.
* **Rationale**: Region documents are standard Foundry VTT documents and support the standard flags API. Storing the configuration state as a flag ensures persistence and automatic synchronization across all clients (GM and players).
* **Alternatives Considered**: 
  - Creating a custom Region Behavior: Rejected because behaviors are intended for dynamic canvas interactions (e.g. token movement triggers), whereas the container flag is a structural configuration property. Storing it as a flag is simpler, lighter, and more appropriate for designating a rendering target.

### 4. Detecting Existing Containers
* **Decision**: Scan regions of the parent Scene:
  ```javascript
  const scene = app.document.scene || app.document.parent;
  const anotherContainer = scene.regions.find(r => 
    r.id !== app.document.id && r.getFlag("screen-share", "isScreenContainer")
  );
  ```
* **Rationale**: A Region document exists as an embedded document within a Scene. The parent Scene contains the `regions` collection. Checking other regions' flags in this collection allows us to identify conflicts.
* **Alternatives Considered**: 
  - Using global canvas references: Rejected because canvas might not be initialized or active (e.g., when editing regions on a non-active scene). Accessing the document hierarchy (`app.document.parent`) works independently of the active canvas view.

## Visual Design of the Control
* **Decision**: Inject a form group at the end of the Appearance tab:
  ```html
  <div class="form-group screen-share-container-option">
    <label>Screen Share Container</label>
    <div class="form-fields">
      <input type="checkbox" name="flags.screen-share.isScreenContainer" ${checked} ${disabled}>
    </div>
    ${notesHtml}
  </div>
  ```
  - If another region is already marked as a container, `disabled` is added, and `notesHtml` displays: `<p class="notes hint">Disabled: Another region ("${anotherContainer.name}") is already marked as the screen container in this scene.</p>`.
  - If no other region is marked, `notesHtml` is empty or shows a standard hint.
