const vertexShaderSource = `#version 300 es
precision mediump float;

// Uniforms for matrices and lighting properties
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDirection;     // Direction of the light source
uniform vec3 uLightDiffuse;       // Diffuse color of the light
uniform vec3 uMaterialDiffuse;    // Diffuse color of the material

// Vertex attributes
in vec3 aVertexPosition;          // Vertex position in object space
in vec3 aVertexNormal;            // Vertex normal in object space

// Output varying variable that will be passed to the fragment shader
out vec4 vVertexColor;

void main(void) {
  // Calculate the normal vector
  vec3 N = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));

  // Normalized light direction
  vec3 L = normalize(uLightDirection);

  // Dot product of the normal vector and negative light direction vector
  // This represents the cosine of the angle between the light direction and the surface normal
  float lambertTerm = dot(N, -L);

  // Calculating the diffuse color based on the Lambertian reflection model
  // Lambertian reflection models how light is reflected off a matte (non-shiny) surface
  // The result is a diffuse reflection, and it depends on the angle between the light and the surface normal
  vec3 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;

  // Set the varying to be used inside of the fragment shader
  // This color represents the lighting contribution for this vertex
  vVertexColor = vec4(Id, 1.0);

  // Setting the vertex position after applying model-view and projection transformations
  // This is necessary for the vertex to be correctly positioned in screen space
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
}
`;

export default vertexShaderSource;
