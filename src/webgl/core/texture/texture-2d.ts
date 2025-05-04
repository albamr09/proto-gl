import TextureImage from "./image";
import Texture from "./texture";
import { TextureConfiguration } from "./types";

class Texture2D extends Texture {
  private image?: TextureImage;

  constructor({
    gl,
    index,
    source,
    texture,
    data,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    index: number;
    source?: string;
    texture?: WebGLTexture;
    data?: HTMLImageElement;
    configuration?: TextureConfiguration;
  }) {
    super(gl, index, gl.TEXTURE_2D, configuration);

    if (source) {
      this.image = new TextureImage({ source });
    } else if (data) {
      this.image = new TextureImage({ data });
    } else if (texture) {
      this.setTexture(texture);
    }
    if (this.image || this.isTextureSizeConfigured()) {
      this.addImageDataToTexture(this.image!, this.target);
    }
  }

  public override updateImage({
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
    this.addImageDataToTexture(this.image, this.target);
  }

  public override activate() {
    if (!this.glTexture) {
      console.error("Cannot activate texture as it has not been created");
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
    this.gl.bindTexture(this.target, this.glTexture);
  }

  public getTexture() {
    return this.glTexture;
  }
}

export default Texture2D;
