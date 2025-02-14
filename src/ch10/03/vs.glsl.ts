const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uParticleSize;

in vec4 aPosition;

out float vLifespan;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition.xyz, 1.0);
  vLifespan = aPosition.w;
  gl_PointSize = uParticleSize * vLifespan;
}
`;

export default vertexShaderSource;
