import Texture2D from "../../core/texture/texture-2d.js";
import BlurFilter from "./filters/blur/index.js";
import FilmgrainFilter from "./filters/filmgrain/index.js";
import GrayScaleFilter from "./filters/grayscale/index.js";
import Filter from "./filters/index.js";
import InvertFilter from "./filters/invert/index.js";
import StretchFilter from "./filters/stretch/index.js";
import WavyFilter from "./filters/wavy/index.js";
import { FilterTypes } from "./types.js";

class FilterFactory {
  static create({
    gl,
    texture,
    type,
    canvas,
  }: {
    gl: WebGL2RenderingContext;
    texture: Texture2D;
    type: FilterTypes;
    canvas: HTMLCanvasElement;
  }): Filter {
    switch (type) {
      case "grayscale":
        return new GrayScaleFilter().build(gl, texture);
      case "invert":
        return new InvertFilter().build(gl, texture);
      case "wavy":
        return new WavyFilter().build(gl, texture) as Filter;
      case "blur":
        return new BlurFilter(canvas).build(gl, texture) as Filter;
      case "filmgrain":
        return new FilmgrainFilter(canvas).build(gl, texture) as Filter;
      case "stretch":
        return new StretchFilter().build(gl, texture) as Filter;
      default:
        throw new Error(`Unsupported filter: ${type}`);
    }
  }
}

export default FilterFactory;
