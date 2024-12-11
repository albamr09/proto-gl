export interface TextureDefinition {
  index: number;
  target?: TextureTargets;
  source?: string;
  data?: HTMLImageElement;
  configuration?: TextureConfiguration;
}

export interface TextureConfiguration {
  generateMipmap?: boolean;
  magFilter?: GLint;
  minFilter?: GLint;
  wrapS?: GLint;
  wrapT?: GLint;
}

export type TextureTargets =
  | typeof WebGL2RenderingContext.TEXTURE_2D
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP;
