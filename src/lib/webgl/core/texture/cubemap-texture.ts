import { objectEntries } from "../../../utils/types.js";
import TextureImage from "./image.js";
import Texture from "./texture.js";
import { CubeMapTargets, TextureConfiguration } from "./types.js";

class CubeMapTexture extends Texture {
  private faces?: Map<CubeMapTargets, TextureImage>;

  constructor({
    gl,
    index,
    faces,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    index: number;
    faces?: Record<CubeMapTargets, string>;
    configuration?: TextureConfiguration;
  }) {
    super(gl, index, gl.TEXTURE_CUBE_MAP, configuration);
    if (faces) {
      this.faces = new Map();
      objectEntries(faces).forEach(([target, source]) => {
        const faceImage = new TextureImage({ source });
        this.faces?.set(target, faceImage);
        this.addImageDataToTexture(faceImage, target);
      });
    }
  }

  private allFacesHaveData(): boolean {
    if (!this.faces) {
      console.warn("No faces defined for this cube map texture");
      return false;
    }

    for (const image of this.faces.values()) {
      if (!image.hasData()) {
        return false;
      }
    }

    return true;
  }

  public override updateImage({
    faces,
  }: {
    faces?: { [Key in CubeMapTargets]: string };
  }) {
    objectEntries(faces as object).forEach(([target, source]) => {
      const faceImage = this.faces?.get(target);
      if (faceImage) {
        faceImage.setImage(source);
        this.addImageDataToTexture(faceImage, target);
      }
    });
  }

  public override activate() {
    if (!this.glTexture) {
      console.error("Cannot activate texture as it has not been created");
      return;
    }
    if (!this.allFacesHaveData()) {
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
    this.gl.bindTexture(this.target, this.glTexture);
  }
}

export default CubeMapTexture;
