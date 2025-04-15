const vertexShaderSource = `#version 300 es

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

uniform mat4 uTransform;

uniform vec4 uLabelColor;
uniform vec4 uMaterialDiffuse;
uniform vec4 uLightDiffuse;
uniform vec4 uLightAmbient;
uniform vec3 uLightPosition;
uniform float uAlpha;

uniform bool uOffScreen;

in vec3 aPosition;
in vec3 aNormal;

out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * uTransform * vec4(aPosition, 1.0);

  if (uOffScreen) {
    vColor = uLabelColor;
  } else {
    vec4 Ia = uLightAmbient;

    vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
    vec3 L = normalize(-uLightPosition);
    float lambertTerm = dot(N, -L);
    vec4 Id = uLightDiffuse * uMaterialDiffuse * clamp(lambertTerm, 0.0, 1.0);

    vColor = vec4(vec3(Ia + Id), uAlpha);
  }
}
`;

export default vertexShaderSource;
