const fragmentShaderSource = `#version 300 es
precision mediump float;

const float strength = -5.0;

uniform sampler2D uSampler;
uniform vec2 uInverseTextureSize;

in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {
  // Convert texture coordinates from [0,1] to [-1,1] for distortion
  vec2 uv = (vTextureCoords * 2.0) - 1.0;
  
  // Compute radial distortion
  float dist = length(uv);
  float factor = 1.0 + strength * (dist * dist);

  // Apply distortion
  vec2 distortedUV = uv * factor;
  
  // Convert back to [0,1] range
  distortedUV = (distortedUV + 1.0) / 2.0;

  // Sample the texture
  fragColor = texture(uSampler, distortedUV);
}
`;

export default fragmentShaderSource;
