const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uMaterialAmbientColor;
uniform vec4 uMaterialDiffuseColor;
uniform vec4 uMaterialSpecularColor;

uniform vec4 uLightAmbientColor;
uniform vec4 uLightDiffuseColor;
uniform vec4 uLightSpecularColor;
uniform float uShininess;

in vec3 vNormal;
in vec3 vLighDirection;
in vec3 vEyeVector;

out vec4 fragColor;

void main (void) {
    // Ambient color
    vec4 Ia = uMaterialAmbientColor * uLightAmbientColor;
    // Initialize diffuse color
    vec4 Id = vec4(0.0);
    // Initialize specular color
    vec4 Is = vec4(0.0);

    float lambTerm = dot(vNormal, -vLighDirection);
    if (lambTerm > 0.0) {
        Id = uMaterialDiffuseColor * uLightDiffuseColor * lambTerm;
        // Reflected light
        vec3 R = reflect(vLighDirection, vNormal);
        Is = uMaterialSpecularColor * uLightSpecularColor * pow(max(dot(R, vEyeVector), 0.0), uShininess);
    }

    vec4 finalColor = Ia + Id + Is;
    fragColor = vec4(finalColor.xyz, 1.0);
}
`;

export default fragmentShaderSource;
