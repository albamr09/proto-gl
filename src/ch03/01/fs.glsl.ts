const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec3 uMaterialDiffuse;

out vec4 fragColor;

void main () {
  fragColor = vec4(uMaterialDiffuse, 1.0);
}
`;

export default fragmentShaderSource;
