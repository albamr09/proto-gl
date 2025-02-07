import Texture2D from "../../core/texture/texture-2d.js";
import GrayScaleFilter from "./filters/grayscale/index.js";
import Filter from "./filters/index.js";
import InvertFilter from "./filters/invert/index.js";
import { FilterTypes } from "./types.js";

class FilterFactory {
  static create({
    gl,
    texture,
    type,
  }: {
    gl: WebGL2RenderingContext;
    texture: Texture2D;
    type: FilterTypes;
  }): Filter {
    switch (type) {
      case "grayscale":
        return new GrayScaleFilter().build(gl, texture);
      case "invert":
        return new InvertFilter().build(gl, texture);
      default:
        throw new Error(`Unsupported filter: ${type}`);
    }
  }
}

export default FilterFactory;
