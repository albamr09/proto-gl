const vertexShaderSource = `#version 300 es

// Uniforms
uniform vec3 uLightColor;
uniform vec3 uMaterialColor;
uniform vec3 uLightDirection;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

// Attributes
in vec3 aPosition; 
in vec3 aNormal;

// Varying
out vec4 vertexColor;

void main(void) {
  // Calculate the normal vector after transformation
  vec3 N = normalize(vec3(uNormalMatrix * vec4(aNormal, 1.0)));
  // Apply model transformation to light
  vec3 light = vec3(uModelViewMatrix * vec4(uLightDirection, 0.0));
  vec3 L = normalize(light);
  vertexColor = vec4(uLightColor * uMaterialColor * dot(N, -L), 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
