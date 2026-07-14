import { BaseRenderer, applyFitMode } from "./base-renderer.js";

export class TileRenderer extends BaseRenderer {
  constructor() {
    super();
    this.originalTargetProperties = null;
  }

  async render(containerDoc, video, fitMode) {
    await super.render(containerDoc, video, fitMode);
    
    const mesh = this.containerObject.mesh || this.containerObject.primary;
    if (mesh) {
      console.log("Screen Share | TileRenderer: rendering on mesh", mesh);
      // Cache original properties to restore them on destroy
      this.originalTargetProperties = {
        visible: mesh.visible,
        renderable: mesh.renderable,
        alpha: mesh.alpha
      };

      mesh.visible = true;
      mesh.renderable = true;
      mesh.alpha = 1;

      const tw = mesh.texture.width || 100;
      const th = mesh.texture.height || 100;
      const cw = containerDoc.width || 100;
      const ch = containerDoc.height || 100;

      // Define bounds in canvas pixels (top-left relative to tile container)
      const canvasBounds = {
        x: 0,
        y: 0,
        width: cw,
        height: ch
      };

      // Set anchor and apply fit mode in canvas pixels
      this.pixiSprite.anchor.set(0, 0);
      applyFitMode(this.pixiSprite, canvasBounds, video, fitMode);

      // Convert the sprite's canvas pixel coordinates/sizes to the local coordinate system of the parent mesh
      const factorX = tw / cw;
      const factorY = th / ch;
      const shiftX = -mesh.anchor.x * tw;
      const shiftY = -mesh.anchor.y * th;

      this.pixiSprite.x = this.pixiSprite.x * factorX + shiftX;
      this.pixiSprite.y = this.pixiSprite.y * factorY + shiftY;
      this.pixiSprite.width = this.pixiSprite.width * factorX;
      this.pixiSprite.height = this.pixiSprite.height * factorY;

      this.pixiContainer.addChild(this.pixiSprite);

      // Apply rectangular mask in Cover mode to clip overflow
      if (fitMode === "cover") {
        const mask = new PIXI.Graphics();
        // @ts-ignore
        mask.beginFill(0xffffff);
        // @ts-ignore
        mask.drawRect(shiftX, shiftY, tw, th);
        // @ts-ignore
        mask.endFill();
        mesh.addChild(mask);
        this.pixiContainer.mask = mask;
        this.pixiMask = mask;
      }

      mesh.addChild(this.pixiContainer);
      this.activeContainerObject = mesh;
    } else {
      console.log("Screen Share | TileRenderer: mesh not found, rendering fallback on canvas.primary");
      const width = containerDoc.width || 100;
      const height = containerDoc.height || 100;
      const bounds = { x: 0, y: 0, width, height };

      this.pixiSprite.anchor.set(0, 0);
      applyFitMode(this.pixiSprite, bounds, video, fitMode);
      this.pixiContainer.addChild(this.pixiSprite);

      if (fitMode === "cover") {
        const mask = new PIXI.Graphics();
        // @ts-ignore
        mask.beginFill(0xffffff);
        // @ts-ignore
        mask.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        // @ts-ignore
        mask.endFill();

        mask.pivot.set(width / 2, height / 2);
        mask.position.set(this.containerObject.x + width / 2, this.containerObject.y + height / 2);
        mask.rotation = (containerDoc.rotation || 0) * Math.PI / 180;
        canvas.primary.addChild(mask);
        this.pixiContainer.mask = mask;
        this.pixiMask = mask;
      }

      this.pixiContainer.pivot.set(width / 2, height / 2);
      this.pixiContainer.position.set(this.containerObject.x + width / 2, this.containerObject.y + height / 2);
      this.pixiContainer.rotation = (containerDoc.rotation || 0) * Math.PI / 180;
      this.pixiContainer.sort = 99999;
      canvas.primary.addChild(this.pixiContainer);
      if (typeof canvas.primary.sortChildren === "function") {
        canvas.primary.sortChildren();
      }
      this.activeContainerObject = canvas.primary;
    }
  }

  destroy() {
    // Restore cached properties of the mesh
    if (this.activeContainerObject && this.originalTargetProperties) {
      this.activeContainerObject.visible = this.originalTargetProperties.visible;
      this.activeContainerObject.renderable = this.originalTargetProperties.renderable;
      this.activeContainerObject.alpha = this.originalTargetProperties.alpha;
      this.originalTargetProperties = null;
    }
    super.destroy();
  }
}
