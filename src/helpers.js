/**
 * Find the active screen share container (Region or Tile) in a scene.
 * If multiple exist, resolves to the Region first, then the Tile, sorting alphabetically by ID.
 * @param {Scene} scene The scene document.
 * @returns {RegionDocument|TileDocument|null} The marked container document, or null.
 */
export function getScreenContainer(scene) {
  if (!scene) return null;
  const regions = scene.regions ? scene.regions.filter(r => r.getFlag("screen-share", "isScreenContainer") === true) : [];
  if (regions.length > 0) {
    if (regions.length > 1) {
      regions.sort((a, b) => a.id.localeCompare(b.id));
    }
    return regions[0];
  }
  const tiles = scene.tiles ? scene.tiles.filter(t => t.getFlag("screen-share", "isScreenContainer") === true) : [];
  if (tiles.length > 0) {
    if (tiles.length > 1) {
      tiles.sort((a, b) => a.id.localeCompare(b.id));
    }
    return tiles[0];
  }
  const drawings = scene.drawings ? scene.drawings.filter(d => d.getFlag("screen-share", "isScreenContainer") === true) : [];
  if (drawings.length > 0) {
    if (drawings.length > 1) {
      drawings.sort((a, b) => a.id.localeCompare(b.id));
    }
    return drawings[0];
  }
  return null;
}

/**
 * Check if there is an active screen container in the scene other than the current document.
 * @param {Scene} scene The scene document.
 * @param {Document} currentDoc The document being checked (Region, Tile, or Drawing).
 * @returns {Document|null} The other active container document if one exists, otherwise null.
 */
export function getOtherActiveContainer(scene, currentDoc) {
  const activeContainer = getScreenContainer(scene);
  if (activeContainer && activeContainer.id !== currentDoc?.id) {
    return activeContainer;
  }
  return null;
}

/**
 * Get a user-friendly name for a container document (Region, Tile, or Drawing).
 * @param {Document} doc The container document.
 * @returns {string}
 */
export function getContainerName(doc) {
  if (!doc) return "";
  if (doc.documentName === "Tile") {
    return `Tile ${doc.id}`;
  }
  if (doc.documentName === "Drawing") {
    return `Drawing ${doc.id}`;
  }
  return doc.name || `Region ${doc.id}`;
}

/**
 * Check if a region is the active screen share container in its scene.
 * @param {RegionDocument} region
 * @returns {boolean}
 */
export function isRegionActiveContainer(region) {
  if (!region || !region.getFlag("screen-share", "isScreenContainer")) return false;
  const activeContainer = getScreenContainer(region.parent);
  return activeContainer?.id === region.id;
}

/**
 * Check if the active Foundry VTT version is v14 or newer.
 * @returns {boolean}
 */
export function isV14OrLater() {
  const generation = game.release?.generation ?? parseInt(game.version);
  return generation >= 14;
}

/**
 * Resolves container settings by merging document flags with global module defaults.
 * @param {Document} doc The container document (Region, Tile, or Drawing).
 * @returns {{fitMode: string, maxFramerate: number, maxResolution: string}} Resolved settings.
 */
export function resolveContainerSettings(doc) {
  const globalFitMode = game.settings.get("screen-share", "defaultFitMode") || "contain";
  const globalFramerate = game.settings.get("screen-share", "maxFramerate") ?? 0;
  const globalResolution = game.settings.get("screen-share", "maxResolution") || "auto";

  if (!doc) {
    return {
      fitMode: globalFitMode,
      maxFramerate: Number(globalFramerate),
      maxResolution: globalResolution
    };
  }

  let fitMode = doc.getFlag("screen-share", "fitMode");
  let maxFramerate = doc.getFlag("screen-share", "maxFramerate");
  let maxResolution = doc.getFlag("screen-share", "maxResolution");

  if (!fitMode || fitMode === "default") {
    fitMode = globalFitMode;
  }
  if (maxFramerate === undefined || maxFramerate === null || maxFramerate === "default") {
    maxFramerate = globalFramerate;
  } else {
    maxFramerate = Number(maxFramerate);
  }
  if (!maxResolution || maxResolution === "default") {
    maxResolution = globalResolution;
  }

  return {
    fitMode,
    maxFramerate,
    maxResolution
  };
}

