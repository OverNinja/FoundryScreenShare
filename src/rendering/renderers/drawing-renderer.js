import { BaseRenderer, applyFitMode } from "./base-renderer.js";

export class DrawingRenderer extends BaseRenderer {
  async render(containerDoc, video, fitMode) {
    await super.render(containerDoc, video, fitMode);
    
    const target = this.containerObject.drawing || this.containerObject.shape || this.containerObject;
    console.log("Screen Share | DrawingRenderer: rendering on target", target);

    const width = containerDoc.shape?.width || containerDoc.width || 100;
    const height = containerDoc.shape?.height || containerDoc.height || 100;
    const bounds = { x: 0, y: 0, width, height };

    this.pixiSprite.anchor.set(0, 0);
    applyFitMode(this.pixiSprite, bounds, video, fitMode);
    this.pixiContainer.addChild(this.pixiSprite);

    // Create and apply shape-based mask to clip video to drawing bounds
    const mask = new PIXI.Graphics();
    const hasFillMethod = typeof mask.fill === "function";
    if (!hasFillMethod) {
      // @ts-ignore
      mask.beginFill(0xffffff);
    }

    const shapeType = containerDoc.shape?.type || "r";
    if (shapeType === "e") {
      mask.drawEllipse(width / 2, height / 2, width / 2, height / 2);
    } else if ((shapeType === "p" || shapeType === "f") && containerDoc.shape?.points?.length >= 4) {
      const points = containerDoc.shape.points;
      mask.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        mask.lineTo(points[i], points[i + 1]);
      }
      mask.closePath();
    } else {
      // Default to rectangle (type "r" or fallback)
      mask.drawRect(0, 0, width, height);
    }

    if (hasFillMethod) {
      // @ts-ignore
      mask.fill({ color: 0xffffff });
    } else {
      // @ts-ignore
      mask.endFill();
    }

    this.pixiContainer.addChild(mask);
    this.pixiSprite.mask = mask;
    this.pixiMask = mask;

    target.addChild(this.pixiContainer);
    this.activeContainerObject = target;
  }
}
