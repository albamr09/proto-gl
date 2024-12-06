const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform sampler2D uTextureSampler;
uniform sampler2D uLightTextureSampler;

in vec4 vColor;
in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  fragColor = texture(uTextureSampler, vTextureCoords) * texture(uLightTextureSampler, vTextureCoords) * vec4(vColor);
}
`;

export default fragmentShaderSource;
