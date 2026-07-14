import { getOtherActiveContainer, getContainerName, isV14OrLater } from "../helpers.js";

// Initialize global debug registry
globalThis.ScreenShareDebug = globalThis.ScreenShareDebug || [];

function logDebug(message, data) {
  console.log(`Screen Share Debug | ${message}`, data);
  try {
    globalThis.ScreenShareDebug.push({
      timestamp: Date.now(),
      message,
      data: data ? JSON.parse(JSON.stringify(data, (key, value) => {
        if (value instanceof HTMLElement) return value.tagName + (value.className ? "." + value.className : "");
        if (value && typeof value === "object" && value.constructor) return value.constructor.name;
        return value;
      })) : null
    });
  } catch (err) {
    globalThis.ScreenShareDebug.push({ timestamp: Date.now(), message, error: err.message });
  }
}

/**
 * Update open RegionConfig, TileConfig, and DrawingConfig sheets to reflect container changes immediately
 */
export function updateOpenConfigs() {
  for (const app of Object.values(ui.windows)) {
    if (
      app.constructor.name === "RegionConfig" ||
      app.constructor.name === "TileConfig" ||
      app.constructor.name === "DrawingConfig"
    ) {
      app.render();
    }
  }
}

/**
 * Shared helper to inject the Screen Share configuration tab and fields into a sheet.
 * @param {Application} app The config sheet application instance.
 * @param {jQuery|HTMLElement} html The sheet's rendered HTML.
 * @param {Document} doc The container document.
 */
function injectScreenShareTab(app, html, doc) {
  logDebug("injectScreenShareTab called", { app: app?.constructor?.name, html, doc: doc?.id || doc?.name });

  // Only GMs can configure
  if (!game.user?.isGM) {
    logDebug("User is not GM, exiting");
    return;
  }

  const scene = doc?.parent;
  if (!scene) {
    logDebug("Scene not resolved, exiting", { doc });
    return;
  }

  // Resolve HTML element from jQuery or native Element
  const htmlElement = (html instanceof HTMLElement) ? html : (html[0] || html);
  if (!htmlElement) {
    logDebug("htmlElement not resolved, exiting", { html });
    return;
  }

  // For TileConfig, if the texture src is our transparent PNG workaround, clear it in the input field
  // so the user sees it as empty/blank.
  if (doc?.documentName === "Tile") {
    const textureInput = htmlElement.querySelector('input[name="texture.src"]');
    if (textureInput && textureInput.value === "modules/screen-share/src/rendering/renderers/transparent.png") {
      logDebug("Clearing transparent.png workaround value from input field");
      textureInput.value = "";
    }
  }

  // Find the tab navigation container
  const nav = htmlElement.querySelector('nav.sheet-tabs, nav.tabs, .tabs[data-group="main"]');
  if (!nav) {
    logDebug("nav container not found, exiting", { htmlElement });
    return;
  }

  // Check if our tab already exists to avoid duplicate injection
  if (nav.querySelector('[data-tab="screen-share"]')) {
    logDebug("tab already exists, exiting");
    return;
  }

  // Find any tab content panel to locate where the tab sections container is
  const anyTab = htmlElement.querySelector('.tab[data-tab], [data-tab]:not(nav [data-tab]):not(.item)');
  if (!anyTab) {
    logDebug("anyTab content panel not found, exiting", { htmlElement });
    return;
  }
  const tabContainer = anyTab.parentElement;
  if (!tabContainer) {
    logDebug("tabContainer parent not found, exiting", { anyTab });
    return;
  }

  logDebug("Pre-injection checks passed", { nav, anyTab, tabContainer });

  // Check states
  const isChecked = doc.getFlag("screen-share", "isScreenContainer") === true;
  const otherContainer = getOtherActiveContainer(scene, doc);

  let isCheckboxDisabled = false;
  let notesHtml = "";

  if (otherContainer) {
    if (!isChecked) {
      isCheckboxDisabled = true;
    }
    const otherName = getContainerName(otherContainer);
    notesHtml = `<p class="notes hint">Another container ("${otherName}") is already marked as the screen container in this scene.</p>`;
  }

  // Resolve global settings for dynamic labels
  const globalFitMode = game.settings.get("screen-share", "defaultFitMode") || "contain";
  const globalFramerate = game.settings.get("screen-share", "maxFramerate") ?? 0;
  const globalResolution = game.settings.get("screen-share", "maxResolution") || "auto";

  const fitModeLabel = globalFitMode.charAt(0).toUpperCase() + globalFitMode.slice(1);
  const framerateLabel = globalFramerate === 0 ? "Auto" : `${globalFramerate} FPS`;
  const resolutionLabel = globalResolution === "auto" ? "Auto" : globalResolution;

  // Get current flag overrides or default
  const fitMode = doc.getFlag("screen-share", "fitMode") || "default";
  const maxFramerate = doc.getFlag("screen-share", "maxFramerate") ?? "default";
  const maxResolution = doc.getFlag("screen-share", "maxResolution") || "default";

  // Determine data-group
  const dataGroup = anyTab.getAttribute("data-group") || "main";

  // Determine if our tab should be active
  let isTabActive = false;
  if (app._activeTab === "screen-share") {
    isTabActive = true;
  }
  if (app.tabGroups && app.tabGroups[dataGroup] === "screen-share") {
    isTabActive = true;
  }
  if (Array.isArray(app._tabs)) {
    for (const tab of app._tabs) {
      if (tab.active === "screen-share") {
        isTabActive = true;
      }
    }
  }

  // Create the new tab navigation item
  const tabItem = document.createElement("a");
  tabItem.classList.add("item");
  if (isTabActive) {
    tabItem.classList.add("active");
  }
  tabItem.setAttribute("data-tab", "screen-share");
  tabItem.setAttribute("data-action", "tab");
  if (dataGroup) {
    tabItem.setAttribute("data-group", dataGroup);
  }
  tabItem.innerHTML = `<i class="fas fa-desktop"></i> Screen Share`;
  nav.appendChild(tabItem);

  // Create the new tab section
  const section = document.createElement("section");
  section.classList.add("tab");
  if (isTabActive) {
    section.classList.add("active");
  }
  section.setAttribute("data-tab", "screen-share");
  if (dataGroup) {
    section.setAttribute("data-group", dataGroup);
  }

  // The dropdowns are disabled if the screen share container is not checked or if the checkbox itself is disabled
  const selectDisabled = !isChecked || isCheckboxDisabled;

  section.innerHTML = `
    <div class="form-group">
      <label>Screen Share Container</label>
      <div class="form-fields">
        <input type="checkbox" name="flags.screen-share.isScreenContainer" ${isChecked ? "checked" : ""} ${isCheckboxDisabled ? "disabled" : ""}>
      </div>
      ${notesHtml}
    </div>

    <div class="form-group">
      <label>Video Fit Mode</label>
      <div class="form-fields">
        <select name="flags.screen-share.fitMode" ${selectDisabled ? "disabled" : ""}>
          <option value="default" ${fitMode === "default" ? "selected" : ""}>Default (${fitModeLabel})</option>
          <option value="contain" ${fitMode === "contain" ? "selected" : ""}>Contain</option>
          <option value="cover" ${fitMode === "cover" ? "selected" : ""}>Cover</option>
          <option value="fill" ${fitMode === "fill" ? "selected" : ""}>Fill</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Max Frame Rate</label>
      <div class="form-fields">
        <select name="flags.screen-share.maxFramerate" ${selectDisabled ? "disabled" : ""}>
          <option value="default" ${maxFramerate === "default" ? "selected" : ""}>Default (${framerateLabel})</option>
          <option value="0" ${String(maxFramerate) === "0" ? "selected" : ""}>Auto</option>
          <option value="15" ${String(maxFramerate) === "15" ? "selected" : ""}>15 FPS</option>
          <option value="30" ${String(maxFramerate) === "30" ? "selected" : ""}>30 FPS</option>
          <option value="60" ${String(maxFramerate) === "60" ? "selected" : ""}>60 FPS</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Max Resolution</label>
      <div class="form-fields">
        <select name="flags.screen-share.maxResolution" ${selectDisabled ? "disabled" : ""}>
          <option value="default" ${maxResolution === "default" ? "selected" : ""}>Default (${resolutionLabel})</option>
          <option value="auto" ${maxResolution === "auto" ? "selected" : ""}>Auto</option>
          <option value="720p" ${maxResolution === "720p" ? "selected" : ""}>720p (1280x720)</option>
          <option value="1080p" ${maxResolution === "1080p" ? "selected" : ""}>1080p (1920x1080)</option>
        </select>
      </div>
    </div>
  `;

  // Insert section before footer if the footer is inside the same container, otherwise append
  const footer = htmlElement.querySelector('.sheet-footer, footer, button[type="submit"]');
  if (footer && footer.parentElement === tabContainer) {
    tabContainer.insertBefore(section, footer);
  } else {
    tabContainer.appendChild(section);
  }

  // Real-time checkbox state event listener
  const checkbox = section.querySelector('input[name="flags.screen-share.isScreenContainer"]');
  if (checkbox) {
    checkbox.addEventListener("change", (event) => {
      const checked = event.target.checked;
      const selects = section.querySelectorAll('select[name^="flags.screen-share"]');
      for (const select of selects) {
        select.disabled = !checked;
      }
    });
  }

  // Auto-resize application height to account for added elements if needed
  if (typeof app.setPosition === "function") {
    app.setPosition({ height: "auto" });
  }

  // Re-bind tabs to ensure the new tab is recognized by Foundry's Tab controller
  if (Array.isArray(app._tabs)) {
    for (const tab of app._tabs) {
      tab.bind(htmlElement);
    }
  }

  // Bind click listener to all tab items to trigger auto-resize when tabs switch
  nav.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', () => {
      setTimeout(() => {
        if (typeof app.setPosition === "function") {
          app.setPosition({ height: "auto" });
        }
      }, 50);
    });
  });

  logDebug("injectScreenShareTab completed successfully");
}

/**
 * Register renderRegionConfig hook to inject the Screen Share Container tab
 */
Hooks.on("renderRegionConfig", (app, html, data) => {
  injectScreenShareTab(app, html, app.document || app.object);
});

/**
 * Register renderTileConfig hook to inject the Screen Share Container tab
 */
Hooks.on("renderTileConfig", (app, html, data) => {
  injectScreenShareTab(app, html, app.document || app.object);
});

/**
 * Register renderDrawingConfig hook to inject the Screen Share Container tab
 */
Hooks.on("renderDrawingConfig", (app, html, data) => {
  injectScreenShareTab(app, html, app.document || app.object);
});

// Hook into Region updates to re-render open sheets when screen container state changes
Hooks.on("updateRegion", (document, change, options, userId) => {
  if (change.flags?.["screen-share"] !== undefined) {
    updateOpenConfigs();
  }
});

// Hook into Region deletion to re-render open sheets if the container was deleted
Hooks.on("deleteRegion", (document, options, userId) => {
  if (document.getFlag("screen-share", "isScreenContainer") === true) {
    updateOpenConfigs();
  }
});

// Hook into preUpdateTile to automatically set a 1x1 transparent PNG on empty tiles when marked as screen container
Hooks.on("preUpdateTile", (document, change, options, userId) => {
  const isScreenContainer = change.flags?.["screen-share"]?.isScreenContainer !== undefined
    ? change.flags["screen-share"].isScreenContainer
    : document.getFlag("screen-share", "isScreenContainer");

  if (isScreenContainer === true) {
    // If the tile is or is becoming a screen container, ensure it has a valid image.
    // If the proposed change clears the image, or it is currently empty/our workaround, set it to the workaround image.
    let newSrc = document.texture?.src;
    if (change.texture && "src" in change.texture) {
      newSrc = change.texture.src;
    }

    if (!newSrc || newSrc === "modules/screen-share/src/rendering/renderers/transparent.png") {
      change.texture = change.texture || {};
      change.texture.src = "modules/screen-share/src/rendering/renderers/transparent.png";
    }
  } else if (isScreenContainer === false) {
    // If it is being unmarked as a screen container, and it has our transparent image, restore it to empty
    const isOurImage = document.texture?.src === "modules/screen-share/src/rendering/renderers/transparent.png";
    if (isOurImage) {
      change.texture = change.texture || {};
      change.texture.src = "";
    }
  }
});

// Hook into Tile updates to re-render open sheets when screen container state changes
Hooks.on("updateTile", (document, change, options, userId) => {
  if (change.flags?.["screen-share"] !== undefined) {
    updateOpenConfigs();
  }
});

// Hook into Tile deletion to re-render open sheets if the container was deleted
Hooks.on("deleteTile", (document, options, userId) => {
  if (document.getFlag("screen-share", "isScreenContainer") === true) {
    updateOpenConfigs();
  }
});

// Hook into Drawing updates to re-render open sheets when screen container state changes
Hooks.on("updateDrawing", (document, change, options, userId) => {
  if (change.flags?.["screen-share"] !== undefined) {
    updateOpenConfigs();
  }
});

// Hook into Drawing deletion to re-render open sheets if the container was deleted
Hooks.on("deleteDrawing", (document, options, userId) => {
  if (document.getFlag("screen-share", "isScreenContainer") === true) {
    updateOpenConfigs();
  }
});
