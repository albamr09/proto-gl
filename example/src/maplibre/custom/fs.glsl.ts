const fragmentShaderSource = `#version 300 es

out highp vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 0.5);
}`;

export default fragmentShaderSource;
