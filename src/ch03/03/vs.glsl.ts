const vertexShaderSource = `#version 300 es

// Uniforms
uniform vec3 uMaterialColor;
uniform vec3 uLightDiffuseColor;
uniform vec3 uLightDirection;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

// Attributes
in vec3 aPosition;
in vec3 aNormal;

out vec4 vVertexColor;

void main(void) {
  vVertexColor = vec4(uMaterialColor, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`

export default vertexShaderSource;
