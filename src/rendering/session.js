import { getScreenContainer, getContainerName, resolveContainerSettings } from "../helpers.js";
import { LocalStreamProvider } from "../providers/local.js";
import { WebRTCStreamProvider } from "../providers/webrtc.js";
import { RENDERERS } from "./renderers.js";

/**
 * Helper to programmatically update the toggle state of the screen-share-toggle tool in the UI.
 * @param {boolean} active The active state to set.
 */
function updateToggleState(active) {
  const controls = ui.controls?.controls;
  if (!controls) return;
  const group = Array.isArray(controls)
    ? controls.find(c => c.name === "screen-share")
    : controls["screen-share"];
  if (group) {
    let tool;
    if (Array.isArray(group.tools)) {
      tool = group.tools.find(t => t.name === "screen-share-toggle");
    } else if (group.tools && typeof group.tools === "object") {
      tool = group.tools["screen-share-toggle"];
    }
    if (tool) {
      tool.active = active;
      ui.controls.render();
    }
  }
}

/**
 * Manages active screen sharing state, WebGL textures, DOM elements, and execution lifecycle.
 */
class ScreenShareSession {
  constructor() {
    /** @type {StreamProvider|null} */
    this.activeProvider = null;
    /** @type {HTMLVideoElement|null} */
    this.hiddenVideo = null;
    /** @type {BaseRenderer|null} */
    this.renderer = null;
    /** @type {string|null} */
    this.sharingSceneId = null;
    this.isStarting = false;
    this.isStopping = false;
  }

  /**
   * Check if screen sharing is currently active.
   * @type {boolean}
   */
  get isSharing() {
    return this.activeProvider !== null && this.activeProvider.isActive;
  }

  /**
   * Initiates the local screen capture and rendering process.
   * @returns {Promise<void>}
   */
  async startShare() {
    if (this.isStarting || this.isStopping) {
      console.warn("Screen Share | startShare ignored: session is transitioning.");
      return;
    }

    if (!game.user?.isGM) {
      const errorMsg = "Only Gamemasters can share their screen.";
      ui.notifications.error(errorMsg);
      throw new Error(errorMsg);
    }

    const activeScene = game.scenes.active;
    if (!activeScene) {
      const errorMsg = "No active scene found.";
      ui.notifications.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.isStarting = true;
    try {
      this.sharingSceneId = activeScene.id;

      const containerDoc = getScreenContainer(activeScene);
      if (!containerDoc) {
        const errorMsg = "No active Screen Share Container found on this scene.";
        ui.notifications.warn(errorMsg);
        updateToggleState(false);
        throw new Error(errorMsg);
      }

      if (this.activeProvider) {
        await this.stopShare();
      }

      const activeBackend = game.settings.get("screen-share", "activeBackend") || "local";
      const providerConfig = globalThis.ScreenShare?.PROVIDERS?.[activeBackend];
      const ProviderClass = providerConfig?.class || (activeBackend === "local" ? LocalStreamProvider : WebRTCStreamProvider);
      
      if (!ProviderClass) {
        const errorMsg = `Streaming provider "${activeBackend}" is not registered.`;
        ui.notifications.error(errorMsg);
        updateToggleState(false);
        throw new Error(errorMsg);
      }

      this.activeProvider = new ProviderClass(() => {
        console.log("Screen Share | Stream ended externally (e.g. stopped via browser UI). Stopping share.");
        this.stopShare();
      });
      
      try {
        const stream = await this.activeProvider.startStream();
        await this.renderStream(containerDoc, stream);
      } catch (err) {
        updateToggleState(false);
        await this.stopShare();
        throw err;
      }

      updateToggleState(true);
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Stops the active screen capture and removes all rendering artifacts.
   * @returns {Promise<void>}
   */
  async stopShare() {
    if (this.isStopping) {
      console.warn("Screen Share | stopShare ignored: session is already stopping.");
      return;
    }
    this.isStopping = true;
    try {
      // Stop and clean provider
      if (this.activeProvider) {
        try {
          await this.activeProvider.stopStream();
        } catch (err) {
          console.error("Screen Share | Failed to stop stream provider:", err);
        }
        this.activeProvider = null;
      }

      // Destroy Renderer
      if (this.renderer) {
        try {
          this.renderer.destroy();
        } catch (err) {
          console.error("Screen Share | Failed to destroy canvas renderer:", err);
        }
        this.renderer = null;
      }

      // Remove and detach hidden video
      if (this.hiddenVideo) {
        this.hiddenVideo.pause();
        this.hiddenVideo.srcObject = null;
        this.hiddenVideo.remove();
        this.hiddenVideo = null;
      }

      this.sharingSceneId = null;
      updateToggleState(false);
    } finally {
      this.isStopping = false;
    }
  }

  /**
   * Renders the MediaStream on the designated container document (Region, Tile, or Drawing).
   * @param {RegionDocument|TileDocument|DrawingDocument} containerDoc The Screen Container document.
   * @param {MediaStream} stream The captured MediaStream.
   * @returns {Promise<void>}
   */
  async renderStream(containerDoc, stream) {
    console.log("Screen Share | renderStream called", { documentName: containerDoc.documentName, docId: containerDoc.id, stream });

    // Create off-screen video element
    const video = document.createElement("video");
    video.style.display = "none";
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;
    document.body.appendChild(video);
    this.hiddenVideo = video;

    // Wait for video metadata to load and play
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(reject);
      };
      video.onerror = (e) => reject(new Error("Screen Share | Failed to load video stream metadata."));
    });

    const resolved = resolveContainerSettings(containerDoc);
    const fitMode = resolved.fitMode;
    console.log("Screen Share | Resolved container settings:", resolved);

    // Get the correct renderer class
    const RendererClass = RENDERERS[containerDoc.documentName];
    if (!RendererClass) {
      throw new Error(`Screen Share | Unsupported container type: ${containerDoc.documentName}`);
    }

    this.renderer = new RendererClass();
    await this.renderer.render(containerDoc, video, fitMode);

    this.sharingSceneId = game.scenes.active?.id || null;
  }

  /**
   * Stops any active screen share and removes the screen container flag from the active scene.
   * @returns {Promise<void>}
   */
  async removeContainerMark() {
    if (!game.user?.isGM) {
      ui.notifications.error("Only Gamemasters can remove screen container marks.");
      return;
    }
    const activeScene = game.scenes.active;
    if (!activeScene) {
      ui.notifications.warn("No active scene found.");
      return;
    }
    const containerDoc = getScreenContainer(activeScene);
    if (!containerDoc) {
      ui.notifications.warn("No screen container marked in this scene.");
      return;
    }

    // Stop sharing if active
    await this.stopShare();

    // Clear the flag
    const name = getContainerName(containerDoc);
    await containerDoc.update({ "flags.screen-share.-=isScreenContainer": null });
    ui.notifications.info(`Removed screen container mark from ${name}.`);
  }
}

export const session = new ScreenShareSession();
export { updateToggleState };
