import Filter from "../index.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const attributes = [] as const;
const uniforms = [] as const;

class StretchFilter extends Filter<typeof attributes, typeof uniforms> {
  constructor() {
    super({
      id: "stretch-filter",
      type: "stretch",
      vertexShaderSource,
      fragmentShaderSource,
    });
  }
}

export default StretchFilter;
