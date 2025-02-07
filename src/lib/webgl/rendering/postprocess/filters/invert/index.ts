import Filter from "../index.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

class InvertFilter extends Filter {
  constructor() {
    super({ id: "invet-filter", vertexShaderSource, fragmentShaderSource });
  }
}

export default InvertFilter;
