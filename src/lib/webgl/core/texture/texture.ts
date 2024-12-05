import { TextureConfiguration } from "./types";

class Texture {
  private gl: WebGL2RenderingContext;
  private source: string | null = null;
  private imageData?: HTMLImageElement;
  private glTexture?: WebGLTexture | null;
  private configuration?: TextureConfiguration;

  constructor({
    gl,
    source,
    data,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    source?: string;
    data?: HTMLImageElement;
    configuration?: TextureConfiguration;
  }) {
    this.gl = gl;
    this.configuration = configuration;
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

  public setSource(source: string) {
    this.source = source;
  }

  public getImage() {
    return this.imageData;
  }

  public setImage(data: HTMLImageElement) {
    this.imageData = data;
  }

  public loadData() {
    if (!this.source) {
      throw new Error("There is no source on this texture");
    }
    return this.loadHTMLImage(this.source);
  }

  private loadHTMLImage(source: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = source;

      img.onload = () => {
        this.imageData = img;
        this.populateGLTexture();
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load imageData from source: ${source}`));
      };
    });
  }

  public createTexture() {
    this.glTexture = this.gl.createTexture();
  }

  public hasData() {
    return !!this.imageData;
  }

  public populateGLTexture() {
    if (!this.glTexture) {
      console.error("Cannot load texture as it has not been created");
      return;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
    this.populateWithImageData();
    this.setGLParameters();
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  private populateWithImageData() {
    if (!this.imageData) {
      throw Error("Cannot bind texture without data");
    }
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.imageData
    );
  }

  public updateConfiguration(configuration: TextureConfiguration) {
    if (!this.glTexture) {
      console.error("Cannot load texture as it has not been created");
      return;
    }
    this.configuration = { ...this.configuration, ...configuration };
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
    this.setGLParameters();
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  private setGLParameters() {
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.configuration?.magFilter ?? this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.configuration?.minFilter ?? this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.configuration?.wrapS ?? this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_R,
      this.configuration?.wrapT ?? this.gl.CLAMP_TO_EDGE
    );
    if (this.configuration?.generateMipmap) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
  }

  public activate() {
    if (!this.glTexture) {
      console.error("Cannot activate texture as it has not been created");
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
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
