import Framebuffer from "../../core/framebuffer/framebuffer.js";
import Texture2D from "../../core/texture/texture-2d.js";
import FilterFactory from "./factory.js";
import Filter from "./filters/index.js";
import { FilterTypes } from "./types.js";

class PostProcess {
  private frameBuffer: Framebuffer;
  private filter?: Filter;
  private texture: Texture2D;

  constructor({
    gl,
    canvas,
    filter,
    type,
  }: {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    filter?: Filter;
    type?: FilterTypes;
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

    this.createFilter(gl, canvas, type, filter);

    canvas.addEventListener("resize", () => {
      const { width, height } = canvas;
      this.frameBuffer.resize({ width, height });
    });
  }

  private createFilter(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    type?: FilterTypes,
    filter?: Filter
  ) {
    if (filter) {
      this.filter = filter.build(gl, this.texture);
    } else if (type) {
      this.filter = FilterFactory.create({
        gl,
        texture: this.texture,
        type,
        canvas,
      });
    } else {
      throw Error("Cannot create post process for undefined type and filter");
    }
  }

  public render() {
    this.filter?.render();
  }

  public bind() {
    this.frameBuffer.bind();
  }

  public unBind() {
    this.frameBuffer.unBind();
  }

  public hasFilter(filter: Filter | FilterTypes) {
    if (!this.filter) return false;

    if (filter instanceof Filter) {
      return this.filter.getId() == filter.getId();
    }

    return this.filter.getType() == filter;
  }
}

export default PostProcess;
