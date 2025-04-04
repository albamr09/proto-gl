const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform float uTime;
uniform vec2 uInverseTextureSize;

out vec4 fragColor;

float computeIntersectionDistance(vec3 rayOrigin, vec3 rayDirection, vec4 sphere) {
  // Center sphere at origin (0, 0), this makes the equation for the sphere simpler
  vec3 objectRayOrigin = rayOrigin - sphere.xyz;

  // Note that the equation of a centered sphere x^2 + y^2 + z^2 = r^2
  // Note that any point on the direction the camera is looking at can be obtained as
  //    point = rayOrigin + distance * rayDirection
  // When we combine these equations, we get a quadratic equation
  //    a * distance^2 + b * distance + c = 0
  //  Where the coefficients are obtained as follows:

  float a = dot(rayDirection, rayDirection);
  float b = 2.0 * dot(objectRayOrigin, rayDirection);
  // w is the sphere radius
  float c = dot(objectRayOrigin, objectRayOrigin) - sphere.w * sphere.w;

  // Now we obtain the discriminant for the quadratic equation
  // - If d < 0 then there is not intersection (there is no real solution for sqrt(d))
  // - If d = 0 then there is a single solution (because sqrt(d) = 0), and therefore one intersection
  // - If d > 0 then there are two possible solutions, as the ray intersects 
  //   the sphere twice (because +-sqrt(d))
  float d = b * b - 4.0 * a * c;

  // No intersection
  if (d < 0.0) return d;

  // We obtain the least possible distance (by not using the + value for the sqrt)
  return (-b - sqrt(d)) / 2.0;
}

vec3 computeSphereNormal(vec3 intersectionPoint, vec4 sphere) {
  // Returns a normalized vectors that goes from the center of the sphere to 
  // the point of intersection on the sphere
  return (intersectionPoint - sphere.xyz) / sphere.w;
}

vec3 lightDirection = normalize(vec3(0.5));
vec3 eyePos = vec3(0.0, 1.0, 4.0);
vec3 backgroundColor = vec3(0.2);
vec3 ambient = vec3(0.05, 0.1, 0.1);

vec4 sphere = vec4(1.0);
vec3 sphereColor = vec3(0.9, 0.8, 0.6);
float maxDistance = 1024.0;

float checkIntersection(vec3 rayOrigin, vec3 rayDirection, out vec3 norm, out vec3 color) {
  float distance = maxDistance;

  // If we wanted multiple objects in the scene you would loop through them here
  // and return the normal and color with the closest intersection point (lowest distance).
  float intersectionDistance = computeIntersectionDistance(rayOrigin, rayDirection, sphere);

  // If there is indeed an intersection
  if (intersectionDistance > 0.0 && intersectionDistance < distance) {
    distance = intersectionDistance;
    // We compute the intersection point by traveling along the ray from 
    // the camera position (rayOrigin) in the direction of rayDirection for 
    // exactly 'distance' units
    vec3 intersectionPoint = rayOrigin + distance * rayDirection;
    // Get normal for that point
    norm = computeSphereNormal(intersectionPoint, sphere);
    // Get color for the sphere
    color = sphereColor;
  }

  return distance;
}


void main(void) {
  // Update sphere position
  sphere.x = 1.5 * sin(uTime);
  sphere.z = 0.5 * cos(uTime * 3.0);

  // Obtain pixel coordinates in normalized space ([0, 1] range)
  vec2 uv = gl_FragCoord.xy * uInverseTextureSize;
  float aspectRatio = uInverseTextureSize.y / uInverseTextureSize.x;

  // Cast a ray out from the eye position into the scene
  vec3 rayOrigin = eyePos;

  // The ray we cast is tilted slightly downward to give a better view of the scene
  vec3 rayDirection = normalize(
    vec3(
      // Maps uv coordinates to view frustrum (visible space not clipped from the camera)
      // and centers then by offsetting by -0.5
      -0.5 + uv * vec2(aspectRatio, 1.0), 
      // Tilts the view
      -1.0
    )
  );

  // Default color if we don't intersect with anything
  vec3 rayColor = backgroundColor;

  // See if the ray intersects with any objects.
  // Provides the normal of the nearest intersection point and color
  vec3 objectNormal, objectColor;
  float t = checkIntersection(rayOrigin, rayDirection, objectNormal, objectColor);

  // If there is an intersection change the color of the pixel 
  // such that is different from the background
  if (t < maxDistance) {
    // Use dot product, which for normalized vectors equals the cosine between the 
    // vectors, the cosines values is biggest when two vectors point on the same direction, 
    // and therefore the diffuse value should be maximized as that means the light is
    // pointing straigth at the normal of the surface
    float diffuse = clamp(dot(objectNormal, lightDirection), 0.0, 1.0);
    rayColor = objectColor * diffuse + ambient;
  }

  fragColor = vec4(rayColor, 1.0);
}`;

export default fragmentShaderSource;
