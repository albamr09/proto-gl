const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uMaterialDiffuse;

out vec4 fragColor;

void main(void) {
  fragColor = uMaterialDiffuse;
}
`;

export default fragmentShaderSource;
