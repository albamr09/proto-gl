import { objectEntries } from "../../../utils/types.js";
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

  public activate() {}
  public updateImage({}: {
    source?: string;
    data?: HTMLImageElement;
    faces?: { [Key in CubeMapTargets]: string };
  }) {}

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

  protected createTexture(): void {
    this.glTexture = this.gl.createTexture();
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

  public deleteTexture(gl: WebGL2RenderingContext) {
    if (!this.glTexture) {
      console.error("Cannot delete texture as it has not been created");
      return;
    }
    gl.deleteTexture(this.glTexture);
  }
}

export class Texture2D extends Texture {
  private image?: TextureImage;

  constructor({
    gl,
    index,
    source,
    data,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    index: number;
    source?: string;
    data?: HTMLImageElement;
    configuration?: TextureConfiguration;
  }) {
    super(gl, index, gl.TEXTURE_2D, configuration);
    this.createTexture();

    if (source) {
      this.image = new TextureImage({ source });
    } else if (data) {
      this.image = new TextureImage({ data });
    }
    if (this.image) {
      this.addImageDataToTexture(this.image, this.target);
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
    if (!this.image?.hasData()) {
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
    this.gl.bindTexture(this.target, this.glTexture);
  }
}

export class CubeMapTexture extends Texture {
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

export default Texture;
