import { denormalizeColor } from "../../../colors.js";
import Instance from "../instance";
import Scene from "../scene";

// TODO: create events for object clicked, object dragged
class PickingController {
  private gl: WebGL2RenderingContext;
  private scene: Scene;
  private renderBuffer?: WebGLRenderbuffer | null;
  private texture?: WebGLTexture | null;
  private frameBuffer?: WebGLFramebuffer | null;
  private getHitValue: (o: Instance<any, any>) => number[];

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    getHitValue: (o: Instance<any, any>) => number[]
  ) {
    this.gl = scene.getContext();
    this.scene = scene;
    this.getHitValue = getHitValue;
    this.createRenderBuffer(canvas);
    this.createTexture(canvas);
    this.createFrameBuffer();

    this.scene.addEventListener("render", () => {
      this.render();
    });
  }

  private createRenderBuffer(canvas: HTMLCanvasElement) {
    const { height, width } = canvas;

    this.renderBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);
    this.gl.renderbufferStorage(
      this.gl.RENDERBUFFER,
      this.gl.DEPTH_COMPONENT16,
      width,
      height
    );
  }

  private createTexture(canvas: HTMLCanvasElement) {
    const { height, width } = canvas;

    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );
  }

  private createFrameBuffer() {
    if (!this.texture || !this.renderBuffer) {
      console.warn("Could not create frame buffer");
      return;
    }

    this.frameBuffer = this.gl.createFramebuffer();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);

    // Texture
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.texture,
      0
    );
    // Render buffer
    this.gl.framebufferRenderbuffer(
      this.gl.FRAMEBUFFER,
      this.gl.DEPTH_ATTACHMENT,
      this.gl.RENDERBUFFER,
      this.renderBuffer
    );

    // Clean up
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private render() {
    if (!this.frameBuffer) {
      console.warn("Could not draw offscreen framebuffer");
      return;
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.scene.render(() => {}, true, true);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  onClick(x: number, y: number) {
    if (!this.frameBuffer) {
      console.warn("Could not pick object, framebuffer not initialized");
      return;
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    const pixelColor = this.scene.getPixelColor(x, y);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    const clickedObject = this.getClickedObject(
      Array.prototype.map.call(pixelColor, (x) => x) as number[]
    );
  }

  private getClickedObject(pixelColor: number[]) {
    return this.scene.find((object) => {
      const objectColor = this.getHitValue(object);
      const denormalizedColor = denormalizeColor(objectColor);
      if (this.compare(denormalizedColor, pixelColor)) {
        return object;
      }
    });
  }

  private compare(objectColor: number[], pixelColor: number[]) {
    return objectColor.every((_, i) => {
      return objectColor[i] - pixelColor[i] <= 1;
    });
  }
}

export default PickingController;
