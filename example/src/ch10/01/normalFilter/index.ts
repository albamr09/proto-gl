import Filter from "../../../lib/webgl/rendering/postprocess/filters/index.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";

class NormalFilter extends Filter {
  constructor() {
    super({ id: "normal-filter", vertexShaderSource, fragmentShaderSource });
  }
}

export default NormalFilter;
