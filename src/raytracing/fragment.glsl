#version 300 es
precision highp float;

struct Ray {
    vec3 origin;
    vec3 direction;
};
struct Material {
    vec3 albedo;
    vec3 emissivity;
};
struct Collision {
    float distance;
    vec3 normal;
    Material material;
};
struct Sphere {
    vec3 center;
    float radius;
    Material material;
};

void sphereIntersection(inout Collision current, Ray ray, Sphere sphere) {
    vec3 oc = ray.origin - sphere.center;
    float b = dot(oc, ray.direction);
    if (b > 0.0) return;
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    if (c < 0.0) return;
    float a = dot(ray.direction, ray.direction);
    float d = b * b - a * c;
    if (d < 0.0) return;

    float t = (-b - sqrt(d)) / a;
    if (t >= current.distance && current.distance >= 0.0) return;
    current.distance = t;
    vec3 hitPoint = ray.origin + t * ray.direction;
    current.normal = (hitPoint - sphere.center) / sphere.radius;
    current.material = sphere.material;
}
Collision sceneIntersection(Ray ray) {
    Sphere sphere1 = Sphere(vec3(0.0, -1.0, 5.0), 1.0, Material(vec3(1.0, 0.0, 0.0), vec3(0.0)));
    Sphere sphere2 = Sphere(vec3(0.0, 1.0, 5.0), 1.0, Material(vec3(1.0, 1.0, 0.0), vec3(0.0)));
    Sphere sphere3 = Sphere(vec3(5.0, 5.0, 0.0), 1.0, Material(vec3(0.0, 0.0, 0.0), vec3(1.0)));

    Collision collision;
    collision.distance = -1.0;
    sphereIntersection(collision, ray, sphere1);
    sphereIntersection(collision, ray, sphere2);
    sphereIntersection(collision, ray, sphere3);

    return collision;
}

vec3 hash(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.xxy + p.yzz) * p.zyx);
}
vec3 randomUnitVector(vec3 seed) {
    vec3 v = vec3(1.0);
    for (int i = 0; length(v) > 1.0 || length(v) == 0.0; i++) {
        vec3 h = hash(seed + vec3(i));
        v = h * 2.0 - vec3(1.0);
    }
    return normalize(v);
}

float colorCorrection(float intensity) {
    return intensity <= 0.0031308 ? 12.92 * intensity : 1.055 * pow(intensity, 1.0 / 2.4) - 0.055;
}

uniform mat4 u_viewMatrix;
uniform float u_time;
uniform sampler2D u_lastFrame;

in vec3 v_pixelLocation;

out vec4 outColor;
void main() {
    vec4 origin = u_viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 direction = u_viewMatrix * vec4(normalize(v_pixelLocation), 0.0);
    Ray ray = Ray(origin.xyz, direction.xyz);

    vec3 seed = 100.0 * v_pixelLocation + vec3(5184.0 * u_time);

    vec3 color = vec3(0.0);
    for (int i = 0; i < 1; i++) {
        vec3 contribution = vec3(1.0);
        for (int j = 0; j < 3; j++) {
            Collision collision = sceneIntersection(ray);
            vec3 hitPoint = ray.origin + ray.direction * collision.distance + collision.normal * 0.001;
            if (collision.distance < 0.0) break;

            color += contribution * collision.material.emissivity * dot(collision.normal, -ray.direction);
            contribution *= collision.material.albedo;
            if (contribution == vec3(0.0)) break;

            ray.origin = hitPoint;
            ray.direction = randomUnitVector(seed += vec3(1423.7));
            if (dot(ray.direction, collision.normal) < 0.0) {
                ray.direction = -ray.direction;
            }
        }
    }
    outColor = vec4(colorCorrection(color.r), colorCorrection(color.g), colorCorrection(color.b), 1.0);
}
