const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform sampler2D uTextureSampler;
uniform sampler2D uLightTextureSampler;
uniform bool uUseMultiply;

in vec4 vColor;
in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  vec4 firstTextureSample = texture(uTextureSampler, vTextureCoords);
  vec4 secondTextureSample = texture(uLightTextureSampler, vTextureCoords);
  if (uUseMultiply) {
    fragColor = firstTextureSample * secondTextureSample * vec4(vColor);
  } else {
    fragColor = vec4(secondTextureSample.rgb - firstTextureSample.rgb, 1.0) * vec4(vColor);
  }
}
`;

export default fragmentShaderSource;
