import { TileRenderer } from "./renderers/tile-renderer.js";
import { DrawingRenderer } from "./renderers/drawing-renderer.js";
import { RegionRenderer } from "./renderers/region-renderer.js";

export const RENDERERS = {
  Tile: TileRenderer,
  Drawing: DrawingRenderer,
  Region: RegionRenderer
};
