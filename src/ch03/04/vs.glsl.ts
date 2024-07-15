const vertexShaderSource = `#version 300 es

uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;

uniform vec3 uLightDirection;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vLighDirection;
out vec3 vEyeVector;

void main(void) {
    // Position on world
    vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
    vNormal = normalize(vec3(uNormalMatrix * vec4(aNormal, 1.0)));
    vLighDirection = normalize(vec3(uModelViewMatrix * vec4(uLightDirection, 1.0)));
    // Camera vector: vector from vertex to camera (origin 0, 0, 0)
    vEyeVector = normalize(-vec3(vertex.xyz));
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
