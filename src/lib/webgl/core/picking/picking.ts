import { denormalizeColor } from "../../../colors.js";
import { Vector } from "../../../math/vector.js";
import Instance from "../../rendering/instance.js";
import Scene from "../../rendering/scene.js";

class PickingController extends EventTarget {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private scene: Scene;
  private renderBuffer?: WebGLRenderbuffer | null;
  private texture?: WebGLTexture | null;
  private frameBuffer?: WebGLFramebuffer | null;
  private getHitValue: (o: Instance<any, any>) => number[];
  // State
  private x: number;
  private y: number;
  private lastX: number;
  private lastY: number;
  private selectedObject?: Instance<any, any>;
  private canDrag: boolean;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    getHitValue: (o: Instance<any, any>) => number[]
  ) {
    super();
    this.canvas = canvas;
    this.gl = scene.getContext();
    this.scene = scene;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.canDrag = false;
    this.getHitValue = getHitValue;
    this.createRenderBuffer(canvas);
    this.createTexture(canvas);
    this.createFrameBuffer();

    this.scene.addEventListener("render", () => this.render());
    window.addEventListener("keydown", this.onKeyPressed.bind(this));
    window.addEventListener("keyup", this.onKeyPressed.bind(this));
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

    const blendingEnabled = this.gl.getParameter(this.gl.BLEND);
    this.gl.disable(this.gl.BLEND);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.scene.render(() => {}, true, true);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    if (blendingEnabled) {
      this.gl.enable(this.gl.BLEND);
    }
  }

  private onKeyPressed(e: KeyboardEvent) {
    this.canDrag = e.ctrlKey;
  }

  public onClick(e: MouseEvent) {
    if (!this.frameBuffer) {
      console.warn("Could not pick object, framebuffer not initialized");
      return;
    }
    const { x, y } = this.get2DCoords(e);
    this.lastX = x;
    this.lastY = y;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    const pixelColor = this.scene.getPixelColor(x, y);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.selectedObject = this.getClickedObject(
      Array.prototype.map.call(pixelColor, (x) => x) as number[]
    );
    if (this.selectedObject && !this.canDrag) {
      this.selectedObject.triggerOnClick();
    }
  }

  // TODO: review this
  private get2DCoords(e: MouseEvent) {
    let top = 0,
      left = 0,
      canvas: HTMLCanvasElement | null = this.canvas;

    while (canvas && canvas.tagName !== "BODY") {
      top += canvas.offsetTop;
      left += canvas.offsetLeft;
      // TODO: type well
      // @ts-ignore
      canvas = canvas.offsetParent;
    }

    left += window.pageXOffset;
    top -= window.pageYOffset;

    return {
      x: e.clientX - left,
      y: this.canvas.height - (e.clientY - top),
    };
  }

  private getClickedObject(pixelColor: number[]) {
    return this.scene.findLast((object) => {
      const objectColor = this.getHitValue(object);
      const denormalizedColor = denormalizeColor(objectColor);
      if (this.compare(denormalizedColor, pixelColor)) {
        return object;
      }
    });
  }

  private compare(objectColor: number[], pixelColor: number[]) {
    return objectColor.every((_, i) => {
      return Math.abs(objectColor[i] - pixelColor[i]) <= 1;
    });
  }

  public onDrag(e: MouseEvent, cameraRotationVector: Vector) {
    if (!this.canDrag) {
      return;
    }

    const { x, y } = this.get2DCoords(e);
    this.x = x;
    this.y = y;

    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    this.selectedObject?.triggerOnDrag(dx, dy, cameraRotationVector);
  }

  public onDragFinish() {
    this.selectedObject?.triggerOnDragFinish();
  }

  public isDragging() {
    return this.canDrag;
  }
}

export default PickingController;
