const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uTransform;

uniform vec4 uMaterialDiffuse;

in vec3 aPosition;

out vec4 vColor;

void main(void){
  gl_Position = uProjectionMatrix * uModelViewMatrix * uTransform * vec4(aPosition, 1.0);
  vColor = uMaterialDiffuse;
}`;

export default vertexShaderSource;
