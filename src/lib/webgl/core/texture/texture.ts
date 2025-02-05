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

  private createTexture(): void {
    this.glTexture = this.gl.createTexture();
  }

  protected addImageDataToTexture(
    image: TextureImage,
    target: TextureTargets | CubeMapTargets
  ) {
    if (!image) {
      console.warn("Texture image was not created");
      return;
    }
    if (image.hasData()) {
      this.populateGLTexture(image, target);
      return;
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
    this.gl.bindTexture(this.target, this.glTexture);
    this.populateWithImageData(image, target);
    this.setGLParameters();
    this.gl.bindTexture(this.target, null);
  }

  private populateWithImageData(
    image: TextureImage,
    target: TextureTargets | CubeMapTargets
  ) {
    if (!image?.hasData()) {
      throw Error("Cannot bind texture without data");
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
}

export default Texture;
