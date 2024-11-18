const fragmentShaderSource = `#version 300 es

precision mediump float;
uniform sampler2D uSampler;

in vec2 vTextureCoords;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  // Multiply the color with the value color for the texture (uSample)
  // given by the texture coordinates
  fragColor = vColor * texture(uSampler, vTextureCoords);
}
`;

export default fragmentShaderSource;
