import Filter from "../index";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

class GrayScaleFilter extends Filter {
  constructor() {
    super({
      id: "grayscale-filter",
      type: "grayscale",
      vertexShaderSource,
      fragmentShaderSource,
    });
  }
}

export default GrayScaleFilter;
