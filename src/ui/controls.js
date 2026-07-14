import { session, updateToggleState } from "../rendering/session.js";
import { openBackendSelectionDialog } from "./dialog.js";

/**
 * Register custom control buttons on the left canvas controls.
 */
Hooks.on("getSceneControlButtons", (controls) => {
  const isArray = Array.isArray(controls);

  const toggleTool = {
    name: "screen-share-toggle",
    title: "Start/Stop Screen Share",
    icon: "fas fa-desktop",
    toggle: true,
    visible: game.user?.isGM ?? false,
    active: session.isSharing,
    onChange: () => {
      if (session.isSharing) {
        session.stopShare().catch(err => {
          console.error("Screen Share | stopShare failed:", err);
        });
      } else {
        session.startShare().catch(err => {
          console.error("Screen Share | startShare failed:", err);
          updateToggleState(false);
        });
      }
    }
  };

  const removeFlagTool = {
    name: "remove-container-flag",
    title: "Remove Screen Container Mark",
    icon: "fas fa-trash-alt",
    button: true,
    visible: game.user?.isGM ?? false,
    onChange: () => {
      session.removeContainerMark().catch(err => {
        console.error("Screen Share | removeContainerMark failed:", err);
      });
    }
  };

  const backendTool = {
    name: "backend-selection",
    title: "Select Streaming Backend",
    icon: "fas fa-cogs",
    button: true,
    visible: game.user?.isGM ?? false,
    onChange: () => {
      openBackendSelectionDialog();
    }
  };

  const groupData = {
    name: "screen-share",
    title: "Screen Share Controls",
    icon: "fas fa-desktop",
    layer: null,
    visible: game.user?.isGM ?? false,
    tools: isArray 
      ? [toggleTool, removeFlagTool, backendTool] 
      : { 
          "screen-share-toggle": toggleTool,
          "remove-container-flag": removeFlagTool,
          "backend-selection": backendTool
        }
  };

  if (isArray) {
    controls.push(groupData);
  } else {
    controls["screen-share"] = groupData;
  }
});
