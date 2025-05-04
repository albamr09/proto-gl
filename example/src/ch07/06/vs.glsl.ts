const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

in vec3 aPosition;
in vec2 aTextureCoords;

out vec2 vTextureCoords;
out vec3 vNormal;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vTextureCoords = aTextureCoords;
  vNormal = (uNormalMatrix * vec4(-aPosition, 1.0)).xyz;
}
`;

export default vertexShaderSource;
