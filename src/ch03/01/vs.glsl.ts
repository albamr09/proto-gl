const vertexShaderSource = `#version 300 es

// Uniforms
uniform vec3 uLightColor;
uniform vec3 uMaterialColor;
uniform vec3 uLightDirection;

// Attributes
in vec3 aPosition; 
in vec3 aNormal;

// Varying
out vec4 vertexColor;

void main(void) {
  vec3 L = normalize(uLightDirection);
  vertexColor = vec4(uLightColor * uMaterialColor * dot(aNormal, -L), 1.0);
  gl_Position =  vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
