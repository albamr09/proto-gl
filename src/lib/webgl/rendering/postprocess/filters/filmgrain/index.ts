import Texture2D from "../../../../core/texture/texture-2d.js";
import { UniformKind } from "../../../../core/uniform/types.js";
import Instance from "../../../instance.js";
import Filter from "../index.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const attributes = [] as const;
const uniforms = ["uInverseTextureSize", "uTimer"] as const;

// TODO: fix attribute and uniform types

class FilmgrainFilter extends Filter<typeof attributes, typeof uniforms> {
  private canvas: HTMLCanvasElement;
  private startTime: number;

  constructor(canvas: HTMLCanvasElement) {
    super({
      id: "filmgrain-filter",
      type: "filmgrain",
      vertexShaderSource,
      fragmentShaderSource,
    });

    this.canvas = canvas;
    this.startTime = Date.now();
  }

  public override build(gl: WebGL2RenderingContext, texture: Texture2D) {
    this.instance = new Instance({
      id: super.getId(),
      gl,
      vertexShaderSource: this.vertexShaderSource,
      fragmentShaderSource: this.fragmentShaderSource,
      attributes: this.getCommonAttributes(gl),
      uniforms: {
        ...this.getCommonUniforms(),
        uInverseTextureSize: {
          data: this.getInverseTextureSize(),
          type: UniformKind.VECTOR_FLOAT,
        },
        uTime: {
          data: this.getCurrentTime(),
          type: UniformKind.SCALAR_FLOAT,
        },
        uNoiseSampler: {
          data: 1,
          type: UniformKind.SCALAR_INT,
        },
      },
      textures: [
        ...this.getCommonTextures(gl, texture),
        {
          index: 1,
          source: "/data/images/noise.png",
          target: gl.TEXTURE_2D,
          configuration: {
            magFilter: gl.LINEAR,
            minFilter: gl.LINEAR_MIPMAP_NEAREST,
            generateMipmap: true,
          },
        },
      ],
      ...this.getCommonProperties(),
    });
    return this;
  }

  private getInverseTextureSize() {
    const { width, height } = this.canvas;
    return [1 / width, 1 / height];
  }

  private getCurrentTime() {
    return (Date.now() - this.startTime) / 1000;
  }

  protected override updateUniforms() {
    this.instance?.updateUniform(
      "uInverseTextureSize",
      this.getInverseTextureSize()
    );
    this.instance?.updateUniform("uTime", this.getCurrentTime());
  }
}

export default FilmgrainFilter;
