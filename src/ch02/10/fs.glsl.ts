export const fragmentShaderSource = `#version 300 es
        precision mediump float;

        // Color that is the result of this shader
        out vec4 fragColor;

        void main(void) {
            fragColor =  vec4(0.5, 0.9, 0.2, 1.0);
        }
    `;
