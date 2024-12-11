import TextureImage from "./image.js";
import { TextureConfiguration, TextureTargets } from "./types";

class Texture {
  private gl: WebGL2RenderingContext;
  private index: number;
  private target: TextureTargets;
  private image?: TextureImage;
  private glTexture?: WebGLTexture | null;
  private configuration?: TextureConfiguration;

  constructor({
    gl,
    index,
    source,
    data,
    target,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    index: number;
    target?: TextureTargets;
    source?: string;
    data?: HTMLImageElement;
    configuration?: TextureConfiguration;
  }) {
    this.gl = gl;
    this.index = index;
    this.configuration = configuration;
    this.target = target ?? this.gl.TEXTURE_2D;
    if (source) {
      this.image = new TextureImage({ source });
    } else if (data) {
      this.image = new TextureImage({ data });
    }
    this.createTexture();
    this.addImageDataToTexture();
  }

  private addImageDataToTexture() {
    if (!this.image) {
      console.warn("Texture image was not created");
      return;
    }
    if (this.image.hasData()) {
      this.populateGLTexture();
      return;
    }
    this.image
      .loadImage()
      .then(() => {
        this.populateGLTexture();
      })
      .catch((e) => {
        console.error(
          `Could not add image to texture ${this.image!.getSource()}: ${e}`
        );
      });
  }

  public updateImage({
    source,
    data,
  }: {
    source?: string;
    data?: HTMLImageElement;
  }) {
    if (!this.image) {
      console.warn("Cannot update a non existent image");
      return;
    }
    if (source) {
      this.image.setSource(source);
    } else if (data) {
      this.image.setImage(data);
    }
    this.addImageDataToTexture();
  }

  private createTexture() {
    this.glTexture = this.gl.createTexture();
  }

  private populateGLTexture() {
    if (!this.glTexture) {
      console.error("Cannot load texture as it has not been created");
      return;
    }
    this.gl.bindTexture(this.target, this.glTexture);
    this.populateWithImageData();
    this.setGLParameters();
    this.gl.bindTexture(this.target, null);
  }

  private populateWithImageData() {
    if (!this.image?.hasData()) {
      throw Error("Cannot bind texture without data");
    }
    this.gl.texImage2D(
      this.target,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.image?.getImage()!
    );
  }

  public updateConfiguration(configuration: TextureConfiguration) {
    if (!this.glTexture) {
      console.error("Cannot load texture as it has not been created");
      return;
    }
    this.configuration = { ...this.configuration, ...configuration };
    this.gl.bindTexture(this.target, this.glTexture);
    this.setGLParameters();
    this.gl.bindTexture(this.target, null);
  }

  private setGLParameters() {
    this.gl.texParameteri(
      this.target,
      this.gl.TEXTURE_MAG_FILTER,
      this.configuration?.magFilter ?? this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.target,
      this.gl.TEXTURE_MIN_FILTER,
      this.configuration?.minFilter ?? this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.target,
      this.gl.TEXTURE_WRAP_S,
      this.configuration?.wrapS ?? this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.target,
      this.gl.TEXTURE_WRAP_T,
      this.configuration?.wrapT ?? this.gl.CLAMP_TO_EDGE
    );
    if (this.configuration?.generateMipmap) {
      this.gl.generateMipmap(this.target);
    }
  }

  public activate() {
    if (!this.glTexture) {
      console.error("Cannot activate texture as it has not been created");
      return;
    }
    if (!this.image?.hasData()) {
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
    this.gl.bindTexture(this.target, this.glTexture);
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
