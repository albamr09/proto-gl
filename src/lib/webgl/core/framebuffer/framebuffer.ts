class Framebuffer {
  private gl: WebGL2RenderingContext;
  private renderBuffer?: WebGLRenderbuffer | null;
  private texture?: WebGLTexture | null;
  private frameBuffer?: WebGLFramebuffer | null;

  constructor({
    gl,
    canvas,
    asFilter = false,
  }: {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    asFilter?: boolean;
  }) {
    this.gl = gl;
    this.createRenderBuffer(canvas);
    this.createTexture(canvas, asFilter);
    this.createFrameBuffer();
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

  private createTexture(canvas: HTMLCanvasElement, asFilter: boolean) {
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
    if (asFilter) {
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.NEAREST
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.NEAREST
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      );
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

  public bind() {
    if (!this.frameBuffer) {
      console.warn("Buffer does not exist");
      return;
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
  }

  public unBind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  public getTexture() {
    return this.texture;
  }

  public resize({ width, height }: { width: number; height: number }) {
    if (!this.texture || !this.renderBuffer) {
      throw Error("No texture or render buffer was created");
    }

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
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);
    this.gl.renderbufferStorage(
      this.gl.RENDERBUFFER,
      this.gl.DEPTH_COMPONENT16,
      width,
      height
    );

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
  }
}

export default Framebuffer;
