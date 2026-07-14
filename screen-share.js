import { registerSettings } from "./src/settings.js";
import { getScreenContainer, isRegionActiveContainer, isV14OrLater } from "./src/helpers.js";
import { StreamProvider } from "./src/providers/base.js";
import { LocalStreamProvider } from "./src/providers/local.js";
import { WebRTCStreamProvider } from "./src/providers/webrtc.js";
import { LiveKitStreamProvider } from "./src/providers/livekit.js";
import { session } from "./src/rendering/session.js";
import { handleSignalingMessage, playerDisconnect, requestOfferFromGMs, isPlayerConnected } from "./src/webrtc/signaling.js";
import { openBackendSelectionDialog } from "./src/ui/dialog.js";

// Import UI components to initialize their hook registrations
import "./src/ui/controls.js";
import "./src/ui/config.js";

console.log("Screen Share | Module loaded.");

// Re-expose public API for backward compatibility and macro usage
globalThis.ScreenShare = {
  getScreenContainer,
  isRegionActiveContainer,
  isV14OrLater,
  StreamProvider,
  LocalStreamProvider,
  WebRTCStreamProvider,
  LiveKitStreamProvider,
  PROVIDERS: {
    local: {
      name: "Local Screen Share (Testing)",
      class: LocalStreamProvider
    },
    webrtc: {
      name: "WebRTC Screen Share",
      class: WebRTCStreamProvider
    },
    livekit: {
      name: "LiveKit Stream Share",
      class: LiveKitStreamProvider
    }
  },
  startShare: () => session.startShare(),
  stopShare: () => session.stopShare(),
  removeContainerMark: () => session.removeContainerMark(),
  openBackendSelectionDialog,
  get streamProvider() { return session.activeProvider; },
  get isSharing() { return session.isSharing; }
};

// Lifecycle Hooks Orchestration
Hooks.once("init", () => {
  registerSettings();
});

Hooks.once("ready", () => {
  game.socket.on("module.screen-share", (payload) => {
    handleSignalingMessage(payload);
  });

  if (!game.user?.isGM) {
    requestOfferFromGMs();
  }
});

// Automatically clean up on active scene changes/renders
Hooks.on("canvasReady", () => {
  const currentSceneId = game.scenes.active?.id || null;

  if (game.user?.isGM) {
    // Only stop sharing if we are currently sharing AND the scene has actually changed
    if (session.isSharing && session.sharingSceneId && session.sharingSceneId !== currentSceneId) {
      console.log(`Screen Share | Active scene changed from ${session.sharingSceneId} to ${currentSceneId}. Stopping share.`);
      session.stopShare().catch(err => {
        console.error("Screen Share | Automatic teardown on scene change failed:", err);
      });
    }
  } else {
    // Players only disconnect if they were rendering a stream and the scene changed
    if (session.sharingSceneId && session.sharingSceneId !== currentSceneId) {
      console.log(`Screen Share | Active scene changed from ${session.sharingSceneId} to ${currentSceneId}. Disconnecting stream.`);
      playerDisconnect().catch(err => {
        console.error("Screen Share | Player automatic teardown on scene change failed:", err);
      });
    }

    // Only request offer from GMs if we are not already connected to a stream
    if (!isPlayerConnected()) {
      requestOfferFromGMs();
    }
  }
});

/**
 * Clean up active screen share session on GM or Player client when container is updated or deleted.
 * @param {string} documentId The ID of the container document.
 * @param {boolean} isDelete True if the container was deleted.
 */
function handleContainerTeardown(documentId, isDelete = false) {
  if (game.user?.isGM) {
    if (session.isSharing) {
      console.log(`Screen Share | Active container ${documentId} was ${isDelete ? "deleted" : "unmarked"}. Stopping share.`);
      session.stopShare().catch(err => {
        console.error("Screen Share | Failed to stop screen share on container update:", err);
      });
    }
  } else {
    console.log(`Screen Share | Active container ${documentId} was ${isDelete ? "deleted" : "unmarked"}. Disconnecting player connection.`);
    playerDisconnect().catch(err => {
      console.error("Screen Share | Failed to disconnect player on container update:", err);
    });
  }
}

// Hooks for document updates to check if container is unmarked
Hooks.on("updateRegion", (document, change, options, userId) => {
  if (session.renderer?.containerDoc?.id === document.id) {
    const isStillContainer = document.getFlag("screen-share", "isScreenContainer") === true;
    if (!isStillContainer) {
      handleContainerTeardown(document.id, false);
    }
  }
});

Hooks.on("updateTile", (document, change, options, userId) => {
  if (session.renderer?.containerDoc?.id === document.id) {
    const isStillContainer = document.getFlag("screen-share", "isScreenContainer") === true;
    if (!isStillContainer) {
      handleContainerTeardown(document.id, false);
    }
  }
});

Hooks.on("updateDrawing", (document, change, options, userId) => {
  if (session.renderer?.containerDoc?.id === document.id) {
    const isStillContainer = document.getFlag("screen-share", "isScreenContainer") === true;
    if (!isStillContainer) {
      handleContainerTeardown(document.id, false);
    }
  }
});

// Hooks for document deletions
Hooks.on("deleteRegion", (document, options, userId) => {
  if (session.renderer?.containerDoc?.id === document.id) {
    handleContainerTeardown(document.id, true);
  }
});

Hooks.on("deleteTile", (document, options, userId) => {
  if (session.renderer?.containerDoc?.id === document.id) {
    handleContainerTeardown(document.id, true);
  }
});

Hooks.on("deleteDrawing", (document, options, userId) => {
  if (session.renderer?.containerDoc?.id === document.id) {
    handleContainerTeardown(document.id, true);
  }
});
