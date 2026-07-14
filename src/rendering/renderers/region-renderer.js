import { BaseRenderer, applyFitMode } from "./base-renderer.js";

export class RegionRenderer extends BaseRenderer {
  async render(containerDoc, video, fitMode) {
    await super.render(containerDoc, video, fitMode);

    console.log("Screen Share | RegionRenderer: rendering on RegionObject", this.containerObject);
    const polygons = this.containerObject.polygons || containerDoc.polygons || [];
    if (polygons.length === 0) {
      throw new Error("Screen Share | Region has no polygon geometry.");
    }

    // Calculate bounds from polygons
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const polygon of polygons) {
      const points = polygon.points;
      if (!points) continue;
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (minX === Infinity) {
      minX = containerDoc.x || 0;
      minY = containerDoc.y || 0;
      maxX = minX + (containerDoc.width || 100);
      maxY = minY + (containerDoc.height || 100);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const bounds = { x: minX, y: minY, width, height };

    this.pixiSprite.anchor.set(0, 0);
    applyFitMode(this.pixiSprite, bounds, video, fitMode);

    // Draw polygon masking geometry
    this.pixiMask = new PIXI.Graphics();
    for (const polygon of polygons) {
      const points = polygon.points;
      if (!points || points.length < 6) continue;
      this.pixiMask.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        this.pixiMask.lineTo(points[i], points[i + 1]);
      }
      this.pixiMask.closePath();
    }

    if (typeof this.pixiMask.fill === "function") {
      this.pixiMask.fill({ color: 0xffffff });
    } else {
      // @ts-ignore
      this.pixiMask.beginFill(0xffffff);
      for (const polygon of polygons) {
        // @ts-ignore
        this.pixiMask.drawPolygon(polygon.points);
      }
      // @ts-ignore
      this.pixiMask.endFill();
    }

    this.pixiContainer.addChild(this.pixiSprite);
    this.pixiContainer.addChild(this.pixiMask);
    this.pixiSprite.mask = this.pixiMask;

    this.containerObject.addChild(this.pixiContainer);
    this.activeContainerObject = this.containerObject;
  }
}
