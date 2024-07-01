const fragmentShaderSource = `#version 300 es
precision mediump float;

// Varying
in vec4 vertexColor;

out vec4 fragColor;

void main () {
  fragColor = vertexColor;
}
`;

export default fragmentShaderSource;
