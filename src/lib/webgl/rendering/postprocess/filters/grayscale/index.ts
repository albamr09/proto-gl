import Texture2D from "../../../../core/texture/texture-2d.js";
import Instance from "../../../instance.js";
import Filter from "../index.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

class GrayScaleFilter extends Filter {
  constructor(gl: WebGL2RenderingContext, texture: Texture2D) {
    super();
    this.instance = new Instance({
      id: "filter",
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      ...this.getCommonInstanceProperties(gl, texture),
    });
  }
}

export default GrayScaleFilter;
