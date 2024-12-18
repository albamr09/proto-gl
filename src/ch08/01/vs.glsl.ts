const vertexShaderSource = `#version 300 es

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

uniform mat4 uTransform;

in vec3 aPosition;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * uTransform * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
