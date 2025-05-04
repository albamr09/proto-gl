import Texture2D from "../../../../core/texture/texture-2d";
import { UniformKind } from "../../../../core/uniform/types";
import Filter from "../index";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

const attributes = [] as const;
const uniforms = ["uInverseTextureSize"] as const;

class BlurFilter extends Filter<typeof attributes, typeof uniforms> {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super({
      id: "blur-filter",
      type: "blur",
      vertexShaderSource,
      fragmentShaderSource,
    });

    this.canvas = canvas;
  }

  public override build(gl: WebGL2RenderingContext, texture: Texture2D) {
    this.createInstance({
      id: super.getId(),
      gl,
      vertexShaderSource: this.vertexShaderSource,
      fragmentShaderSource: this.fragmentShaderSource,
      attributes: this.getCommonAttributes(gl),
      uniforms: {
        uInverseTextureSize: {
          data: this.getInverseTextureSize(),
          type: UniformKind.VECTOR_FLOAT,
        },
      },
      textures: this.getCommonTextures(gl, texture),
      ...this.getCommonProperties(),
    });
    return this;
  }

  private getInverseTextureSize() {
    const { width, height } = this.canvas;
    return [1 / width, 1 / height];
  }

  protected override updateUniforms() {
    this.instance?.updateUniform(
      "uInverseTextureSize",
      this.getInverseTextureSize()
    );
  }
}

export default BlurFilter;
