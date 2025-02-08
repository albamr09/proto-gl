import Filter from "../index.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

class InvertFilter extends Filter {
  constructor() {
    super({
      id: "invert-filter",
      type: "invert",
      vertexShaderSource,
      fragmentShaderSource,
    });
  }
}

export default InvertFilter;
