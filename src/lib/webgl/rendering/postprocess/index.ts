import Framebuffer from "../../core/framebuffer/framebuffer.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import Instance from "../instance.js";
import { UniformKind } from "../../core/uniform/types.js";
import Texture2D from "../../core/texture/texture-2d.js";

const attributes = ["aPosition", "aTextureCoords"] as const;
const uniforms = ["uSampler"] as const;

class PostProcess {
  private frameBuffer: Framebuffer;
  private filterInstance?: Instance<typeof attributes, typeof uniforms>;
  private texture: Texture2D;

  constructor({
    gl,
    canvas,
  }: {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
  }) {
    this.texture = new Texture2D({
      gl,
      index: 0,
      configuration: {
        magFilter: gl.NEAREST,
        minFilter: gl.NEAREST,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        width: canvas.width,
        height: canvas.height,
      },
    });
    this.frameBuffer = new Framebuffer({
      gl,
      canvas,
      texture: this.texture.getTexture(),
    });

    this.configureGeometry(gl);

    canvas.addEventListener("resize", () => {
      const { width, height } = canvas;
      this.frameBuffer.resize({ width, height });
    });
  }

  private configureGeometry(gl: WebGL2RenderingContext) {
    const vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    const textureCoords = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];

    // TODO: add id
    this.filterInstance = new Instance({
      id: "filter",
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributes: {
        aPosition: {
          data: vertices,
          size: 2,
          type: gl.FLOAT,
        },
        aTextureCoords: {
          data: textureCoords,
          size: 2,
          type: gl.FLOAT,
        },
      },
      uniforms: {
        uSampler: {
          data: 0,
          type: UniformKind.SCALAR_INT,
        },
      },
      textures: [
        {
          target: gl.TEXTURE_2D,
          index: 0,
          texture: this.texture.getTexture()!,
          configuration: this.texture.getConfiguration(),
        },
      ],
      size: 6,
    });
  }

  draw() {
    this.filterInstance?.render({});
  }

  bindFramebuffer() {
    this.frameBuffer.bind();
  }

  unbindFramebuffer() {
    this.frameBuffer.unBind();
  }
}

export default PostProcess;
