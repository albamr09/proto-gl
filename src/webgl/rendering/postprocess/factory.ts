import Texture2D from "@proto-gl/webgl/core/texture/texture-2d";
import BlurFilter from "@proto-gl/webgl/rendering/postprocess/filters/blur/index";
import FilmgrainFilter from "@proto-gl/webgl/rendering/postprocess/filters/filmgrain/index";
import GrayScaleFilter from "@proto-gl/webgl/rendering/postprocess/filters/grayscale/index";
import Filter from "@proto-gl/webgl/rendering/postprocess/filters/index";
import InvertFilter from "@proto-gl/webgl/rendering/postprocess/filters/invert/index";
import StretchFilter from "@proto-gl/webgl/rendering/postprocess/filters/stretch/index";
import WavyFilter from "@proto-gl/webgl/rendering/postprocess/filters/wavy/index";
import { FilterTypes } from "@proto-gl/webgl/rendering/postprocess/types";

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
