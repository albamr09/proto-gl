const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform sampler2D uSampler;
uniform samplerCube uCubeSampler;
uniform vec4 uMaterialDiffuse;

in vec2 vTextureCoords;
in vec3 vNormal;

out vec4 fragColor;

void main(void) {
  fragColor = texture(uSampler, vTextureCoords) * texture(uCubeSampler, vNormal) * uMaterialDiffuse;
}
`;

export default fragmentShaderSource;
