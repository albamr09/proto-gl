const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform sampler2D uSampler;
uniform vec4 uMaterialDiffuse;

in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  fragColor = texture(uSampler, vTextureCoords) * uMaterialDiffuse;
}
`;

export default fragmentShaderSource;
