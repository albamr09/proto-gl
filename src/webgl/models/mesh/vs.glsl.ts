const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uTranslation;

uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;
uniform vec3 uLightPosition;
uniform float uShininess;

in vec3 aPosition;
in vec3 aNormal;

out vec4 vColor;

void main(void) {
  vec4 finalPosition = vec4(aPosition, 1.0);
  if (uTranslation != vec3(0.0)) {
    mat4 translationMatrix = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      uTranslation.x, uTranslation.y, uTranslation.z, 1.0
    );
    finalPosition = translationMatrix * finalPosition;
  } 
  gl_Position = uProjectionMatrix * uModelViewMatrix * finalPosition;

  vec3 L = normalize(-uLightPosition);
  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vec3 R = reflect(L, N);
  vec3 E = normalize(-vec3(uModelViewMatrix * vec4(aPosition, 1.0)));

  vec4 Ia = uLightAmbient * uMaterialAmbient;

  float lambertTerm = dot(-L, N);
  if (lambertTerm == 0.0) {
    lambertTerm = 0.1;
  }

  vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  float specularTerm = max(dot(R, E), 0.0);
  vec4 Is = uLightSpecular * pow(specularTerm, uShininess);

  vColor = vec4(vec3(Ia + Id + Is), 1.0);
}
`;

export default vertexShaderSource;
