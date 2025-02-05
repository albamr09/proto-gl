import Framebuffer from "../../core/framebuffer/framebuffer.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import Instance from "../instance.js";
import { UniformKind } from "../../core/uniform/types.js";

const attributes = ["aPosition", "aTextureCoords"] as const;
const uniforms = ["uSampler"] as const;

class PostProcess {
  private frameBuffer: Framebuffer;
  private filterInstance?: Instance<typeof attributes, typeof uniforms>;

  constructor({
    gl,
    canvas,
  }: {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
  }) {
    this.frameBuffer = new Framebuffer({ gl, canvas, asFilter: true });
    this.configureGeometry(gl);

    canvas.addEventListener("resize", (e) => {
      // TODO: Fix types
      // @ts-ignore
      const { width, height } = e.target;
      this.frameBuffer.resize({ width, height });
    });
  }

  private configureGeometry(gl: WebGL2RenderingContext) {
    const glTexture = this.frameBuffer.getTexture();
    if (!glTexture) return;

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
          texture: glTexture,
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
