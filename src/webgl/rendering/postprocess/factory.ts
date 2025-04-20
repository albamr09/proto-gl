import Texture2D from "../../core/texture/texture-2d";
import BlurFilter from "./filters/blur/index";
import FilmgrainFilter from "./filters/filmgrain/index";
import GrayScaleFilter from "./filters/grayscale/index";
import Filter from "./filters/index";
import InvertFilter from "./filters/invert/index";
import StretchFilter from "./filters/stretch/index";
import WavyFilter from "./filters/wavy/index";
import { FilterTypes } from "./types";

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
