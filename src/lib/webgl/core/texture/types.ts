export interface TextureDefinition {
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
