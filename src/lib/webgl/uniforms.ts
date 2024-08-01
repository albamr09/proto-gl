export const transformUniforms = [
  "uModelViewMatrix",
  "uNormalMatrix",
  "uProjectionMatrix",
] as const;

export type TransformUniforms = typeof transformUniforms;
