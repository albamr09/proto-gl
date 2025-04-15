const vertexShaderSource = `#version 300 es

uniform mat4 uRotation;

in vec4 aPos;

void main() {
    gl_Position = uRotation * aPos;
}
`;

export default vertexShaderSource;
