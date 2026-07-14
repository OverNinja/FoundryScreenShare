# Research: Foundry v13 Tile Compatibility

This document summarizes the technical choices, research, and decisions for adding compatibility for Foundry VTT v13 (tile-only mode) to the Screen Share module.

## Decisions

### 1. Foundry VTT Version Detection

- **Decision**: Use `game.release?.generation ?? parseInt(game.version)` to identify the active generation.
- **Rationale**: 
  - Foundry VTT v12 and v14 use `game.release.generation` (e.g. `12` or `14`). It is highly probable v13 does the same.
  - Older versions of Foundry VTT used `game.version` as a string (e.g., `"11.315"`), so using `parseInt(game.version)` acts as a safe fallback.
  - Comparing the returned generation integer allows simple version gates: `generation >= 14` for v14 features (regions) and `generation === 13` (or `< 14`) for tile-only compatibility.
- **Alternatives Considered**: 
  - *Feature Detection* (e.g., checking if `ui.windows.RegionConfig` or `canvas.regions` exists): While robust, explicit version/generation checks are cleaner for configuring control button layers where a specific layer string (`"regions"` vs `"tiles"`) must be supplied.

### 2. Scene Control UI Placement

- **Decision**: Place the Screen Share control buttons on the `"tiles"` layer group when running on Foundry v13, and on the `"regions"` layer group on v14.
- **Rationale**:
  - In Foundry v14, controls reside on the `"regions"` layer.
  - Since the regions layer does not exist in v13, placing the controls on the `"tiles"` layer is the most logical fallback as Tiles are the only supported screen container on v13.
- **Alternatives Considered**:
  - *Drawings Layer* (`layer: "drawings"`): Dropped because drawings are not used as screen containers in this module.
  - *Token Layer* (`layer: "tokens"`): Dropped because tokens are too busy and unrelated to static display containers.

### 3. Graceful Feature Degradation (Region-Specific Code)

- **Decision**: Guard the registration of Region-specific hooks and updates behind a version generation check (`generation >= 14`).
- **Rationale**:
  - Gating region hooks ensures the module does not try to listen for events that never fire on v13, nor interact with non-existent data models (like `RegionDocument`).
  - Keeps the execution environment clean and avoids potential runtime errors when referencing classes or properties that only exist in v14.
- **Alternatives Considered**:
  - *Unconditional Hook Registration*: Registering `renderRegionConfig` unconditionally is safe in terms of syntax (since it's just a string registration), but it is cleaner to completely omit it in older versions.
