import Filter from "../index.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

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
