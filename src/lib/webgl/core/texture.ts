class Texture {
  private source: string | null = null;
  private type: "image" | "bytes";
  private imageData!: HTMLImageElement | Uint8Array;
  private glTexture?: WebGLTexture | null;

  constructor({
    source,
    data,
    type,
  }: {
    source?: string;
    data?: Uint8Array | HTMLImageElement;
    type?: "image" | "bytes";
  }) {
    this.type = type ?? "bytes";
    if (source) {
      this.source = source;
    }
    if (data) {
      this.imageData = data;
    }
  }

  public getSource() {
    return this.source;
  }

  public getImage() {
    return this.imageData;
  }

  public loadImageData() {
    if (!this.source) {
      throw new Error("There is no source on this texture");
    }
    if (this.type === "image") {
      return this.loadImage(this.source);
    } else if (this.type === "bytes") {
      return this.loadPixelArray(this.source);
    } else {
      throw new Error(`Unsupported texture type: ${this.type}`);
    }
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = source;

      img.onload = () => {
        this.imageData = img;
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load imageData from source: ${source}`));
      };
    });
  }

  private async loadPixelArray(source: string): Promise<Uint8Array> {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pixel data from source: ${source} (status: ${response.status})`
      );
    }

    const buffer = await response.arrayBuffer();
    const pixelArray = new Uint8Array(buffer);

    this.imageData = pixelArray;
    return pixelArray;
  }

  private loadTexture(gl: WebGL2RenderingContext) {
    if (!this.glTexture) {
      console.error("Cannot load texture as it has not been created");
      return;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    // Populates texture on index 0 with given data
    if (this.imageData instanceof Uint8Array) {
      // Use Uint8Array for raw pixel data
      const width = 256; // Specify the width
      const height = 256; // Specify the height
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.imageData
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.imageData
      );
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public createTexture(gl: WebGL2RenderingContext) {
    this.glTexture = gl.createTexture();
    this.loadTexture(gl);
  }

  public deleteTexture(gl: WebGL2RenderingContext) {
    if (!this.glTexture) {
      console.error("Cannot delete texture as it has not been created");
      return;
    }
    gl.deleteTexture(this.glTexture);
  }
}

export default Texture;
