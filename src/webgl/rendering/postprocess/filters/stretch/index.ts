import Filter from "../index";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

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
