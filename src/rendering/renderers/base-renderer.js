/**
 * Helper to apply the fit mode to the video sprite within bounds.
 */
export function applyFitMode(sprite, bounds, video, fitMode) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (fitMode === "fill" || !vw || !vh) {
    sprite.width = bounds.width;
    sprite.height = bounds.height;
    sprite.x = bounds.x;
    sprite.y = bounds.y;
    return;
  }

  const R_v = vw / vh;
  const R_c = bounds.width / bounds.height;

  if (fitMode === "cover") {
    if (R_v > R_c) {
      sprite.height = bounds.height;
      sprite.width = bounds.height * R_v;
      sprite.x = bounds.x + (bounds.width - sprite.width) / 2;
      sprite.y = bounds.y;
    } else {
      sprite.width = bounds.width;
      sprite.height = bounds.width / R_v;
      sprite.x = bounds.x;
      sprite.y = bounds.y + (bounds.height - sprite.height) / 2;
    }
  } else {
    // default/contain
    if (R_v > R_c) {
      sprite.width = bounds.width;
      sprite.height = bounds.width / R_v;
      sprite.x = bounds.x;
      sprite.y = bounds.y + (bounds.height - sprite.height) / 2;
    } else {
      sprite.height = bounds.height;
      sprite.width = bounds.height * R_v;
      sprite.x = bounds.x + (bounds.width - sprite.width) / 2;
      sprite.y = bounds.y;
    }
  }
}

export class BaseRenderer {
  constructor() {
    this.pixiTexture = null;
    this.pixiSprite = null;
    this.pixiContainer = null;
    this.pixiMask = null;
    this.containerDoc = null;
    this.containerObject = null;
    this.activeContainerObject = null;
  }

  async render(containerDoc, video, fitMode) {
    this.containerDoc = containerDoc;
    this.containerObject = containerDoc.object;
    if (!this.containerObject) {
      throw new Error(`Screen Share | Canvas placeable object not found for ${containerDoc.documentName}.`);
    }

    // Create PixiJS texture and sprite from the video element
    this.pixiTexture = PIXI.Texture.from(video);
    this.pixiSprite = new PIXI.Sprite(this.pixiTexture);
    this.pixiContainer = new PIXI.Container();

    // Resolve doc alpha
    const docAlpha = typeof containerDoc.alpha === "number" ? containerDoc.alpha : 1;
    this.pixiSprite.alpha = docAlpha;
  }

  destroy() {
    // Clean up PixiJS elements
    if (this.pixiContainer) {
      if (this.activeContainerObject) {
        try {
          this.activeContainerObject.removeChild(this.pixiContainer);
        } catch (e) {}
      }
      this.pixiContainer.destroy({ children: true });
      this.pixiContainer = null;
    }
    if (this.pixiMask) {
      if (this.activeContainerObject) {
        try {
          this.activeContainerObject.removeChild(this.pixiMask);
        } catch (e) {}
      }
      if (!this.pixiMask.destroyed) {
        try {
          this.pixiMask.destroy();
        } catch (e) {}
      }
      this.pixiMask = null;
    }

    // Trigger repaint on placeable object
    if (this.containerObject) {
      if (this.containerObject.renderFlags) {
        this.containerObject.renderFlags.set({ refresh: true });
      } else if (typeof this.containerObject.refresh === "function") {
        this.containerObject.refresh();
      }
    }
  }
}
