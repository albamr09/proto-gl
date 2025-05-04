import Texture2D from "../../../../core/texture/texture-2d";
import { UniformKind } from "../../../../core/uniform/types";
import Filter from "../index";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

const attributes = [] as const;
const uniforms = ["uTime"] as const;

class WavyFilter extends Filter<typeof attributes, typeof uniforms> {
  private startTime: number;

  constructor() {
    super({
      id: "wavy-filter",
      type: "wavy",
      vertexShaderSource,
      fragmentShaderSource,
    });

    this.startTime = Date.now();
  }

  public override build(gl: WebGL2RenderingContext, texture: Texture2D) {
    this.createInstance({
      id: super.getId(),
      gl,
      vertexShaderSource: this.vertexShaderSource,
      fragmentShaderSource: this.fragmentShaderSource,
      attributes: this.getCommonAttributes(gl),
      uniforms: {
        uTime: {
          data: this.getCurrentTime(),
          type: UniformKind.SCALAR_FLOAT,
        },
      },
      textures: this.getCommonTextures(gl, texture),
      ...this.getCommonProperties(),
    });
    return this;
  }

  protected override updateUniforms() {
    this.instance?.updateUniform("uTime", this.getCurrentTime());
  }

  private getCurrentTime() {
    return (Date.now() - this.startTime) / 1000;
  }
}

export default WavyFilter;
