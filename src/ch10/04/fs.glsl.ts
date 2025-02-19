const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  vec4 textureColor = texture(uSampler, vTextureCoords);
  fragColor = vec4(textureColor.rgb, 1.0);
}
`;

export default fragmentShaderSource;
