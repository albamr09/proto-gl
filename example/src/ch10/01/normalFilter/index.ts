import { Filter } from "@proto-gl";
import vertexShaderSource from "./vs.glsl";
import fragmentShaderSource from "./fs.glsl";

class NormalFilter extends Filter {
  constructor() {
    super({ id: "normal-filter", vertexShaderSource, fragmentShaderSource });
  }
}

export default NormalFilter;
