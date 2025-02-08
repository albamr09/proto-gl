import TextureImage from "./image.js";
import { CubeMapTargets, TextureConfiguration, TextureTargets } from "./types";

abstract class Texture {
  protected glTexture?: WebGLTexture | null;

  constructor(
    protected gl: WebGL2RenderingContext,
    protected index: number,
    protected target: TextureTargets,
    protected configuration?: TextureConfiguration
  ) {
    this.createTexture();
  }

  private createTexture() {
    this.glTexture = this.gl.createTexture();
  }

  protected addImageDataToTexture(
    image: TextureImage,
    target: TextureTargets | CubeMapTargets
  ) {
    if (this.canSetImageData(image)) {
      this.populateGLTexture(image, target);
      return;
    }

    if (!image) {
      throw Error("Cannot try to load null image on texture");
    }

    image
      .loadImage()
      .then(() => {
        this.populateGLTexture(image, target);
      })
      .catch((e) => {
        console.error(
          `Could not add image to texture ${image!.getSource()}: ${e}`
        );
      });
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

  protected populateGLTexture(
    image: TextureImage,
    target: TextureTargets | CubeMapTargets
  ) {
    if (!this.glTexture) {
      console.error("Cannot load texture as it has not been created");
      return;
    }
    if (!this.canSetImageData(image)) {
      throw Error("Could not set image data");
    }
    this.gl.bindTexture(this.target, this.glTexture);
    if (image) {
      this.populateWithImageData(image, target);
    } else {
      this.populateEmpty(target);
    }
    this.setGLParameters();
    this.gl.bindTexture(this.target, null);
  }

  private canSetImageData(image?: TextureImage) {
    return image?.hasData() || this.isTextureSizeConfigured();
  }

  protected isTextureSizeConfigured = () => {
    return this.configuration?.width && this.configuration?.height;
  };

  private populateWithImageData(
    image: TextureImage,
    target: TextureTargets | CubeMapTargets
  ) {
    if (!image?.hasData()) {
      throw Error("Cannot populate texture with empty image");
    }
    this.gl.texImage2D(
      Number(target),
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image.getImage()!
    );
  }

  private populateEmpty(target: TextureTargets | CubeMapTargets) {
    if (!this.isTextureSizeConfigured()) {
      throw Error("Cannot create empty texture without size");
    }

    this.gl.texImage2D(
      Number(target),
      0,
      this.gl.RGBA,
      this.configuration!.width!,
      this.configuration!.height!,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );
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

  protected setTexture(texture: WebGLTexture) {
    this.glTexture = texture;
  }

  public activate() {}

  public updateImage({}: {
    source?: string;
    data?: HTMLImageElement;
    faces?: { [Key in CubeMapTargets]: string };
  }) {}

  public deleteTexture(gl: WebGL2RenderingContext) {
    if (!this.glTexture) {
      console.error("Cannot delete texture as it has not been created");
      return;
    }
    gl.deleteTexture(this.glTexture);
  }

  public getConfiguration() {
    return { ...this.configuration };
  }
}

export default Texture;
