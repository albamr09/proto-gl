const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec4 uMaterialDiffuse;

uniform vec3 uTranslate;

in vec3 aPos;

out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4((aPos + uTranslate), 1.0);
  vColor = uMaterialDiffuse;
}
`;

export default vertexShaderSource;
