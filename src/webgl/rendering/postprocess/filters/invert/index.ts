import Filter from "../index";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

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
