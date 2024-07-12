const vertexShaderSource = `#version 300 es

uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;

in vec3 aPosition;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
