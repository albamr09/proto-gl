const vertexShaderSource = `#version 300 es
vec3 aPosition;
vec3 aNormal;

out vec4 vVertexColor;

void main () {
  gl_Position = vec4(aPosition, 0.0);
}
`

export default vertexShaderSource;
