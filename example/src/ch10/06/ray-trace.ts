import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";
import { Texture2D, UniformKind, Filter } from "@proto-gl";

const attributes = [] as const;
const uniforms = ["uTime", "uInverseTextureSize"] as const;

class RayTrace extends Filter<typeof attributes, typeof uniforms> {
  private canvas: HTMLCanvasElement;
  private startTime: number;

  constructor(canvas: HTMLCanvasElement) {
    super({
      id: "ray-trace-filter",
      vertexShaderSource,
      fragmentShaderSource,
    });
    this.canvas = canvas;
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
        uInverseTextureSize: {
          data: this.getInverseTextureSize(),
          type: UniformKind.VECTOR_FLOAT,
        },
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
    this.instance?.updateUniform(
      "uInverseTextureSize",
      this.getInverseTextureSize()
    );
  }

  private getInverseTextureSize() {
    const { width, height } = this.canvas;
    return [1 / width, 1 / height];
  }

  private getCurrentTime() {
    return (Date.now() - this.startTime) / 1000;
  }
}

export default RayTrace;
