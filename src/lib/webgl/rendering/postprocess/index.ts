import Framebuffer from "../../core/framebuffer/framebuffer.js";
import Texture2D from "../../core/texture/texture-2d.js";
import GrayScaleFilter from "./filters/grayscale/index.js";
import Filter from "./filters/index.js";

class PostProcess {
  private frameBuffer: Framebuffer;
  private filter: Filter;
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

    this.filter = new GrayScaleFilter(gl, this.texture);

    canvas.addEventListener("resize", () => {
      const { width, height } = canvas;
      this.frameBuffer.resize({ width, height });
    });
  }

  draw() {
    this.filter?.render();
  }

  bindFramebuffer() {
    this.frameBuffer.bind();
  }

  unbindFramebuffer() {
    this.frameBuffer.unBind();
  }
}

export default PostProcess;
