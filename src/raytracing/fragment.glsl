#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

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
    bool inverted;
    Material material;
};

void sphereIntersection(inout Collision current, Ray ray, Sphere sphere) {
    vec3 oc = ray.origin - sphere.center;
    float b = dot(oc, ray.direction);
    if (b > 0.0 && !sphere.inverted) return;
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    if (c < 0.0 != sphere.inverted) return;
    float a = dot(ray.direction, ray.direction);
    float d = b * b - a * c;
    if (d < 0.0) return;

    float t = (-b + (sphere.inverted ? 1.0 : -1.0) * sqrt(d)) / a;
    if (t >= current.distance && current.distance >= 0.0) return;
    current.distance = t;
    vec3 hitPoint = ray.origin + t * ray.direction;
    current.normal = (sphere.inverted ? -1.0 : 1.0) * (hitPoint - sphere.center) / sphere.radius;
    current.material = sphere.material;
}
Collision sceneIntersection(Ray ray) {
    Sphere sphere1 = Sphere(vec3(0.0, -1.0, 10.0), 1.0, false, Material(vec3(0.0, 1.0, 1.0), vec3(0.0)));
    Sphere sphere2 = Sphere(vec3(0.0, 1.0, 10.0), 1.0, false, Material(vec3(1.0, 1.0, 0.0), vec3(0.0)));
    Sphere sphere3 = Sphere(vec3(2.0, 3.0, 8.0), 1.0, false, Material(vec3(0.0, 0.0, 0.0), vec3(4.0)));
    Sphere sphere4 = Sphere(vec3(0.0, 0.0, 5.0), 5.1, true, Material(vec3(1.0, 1.0, 1.0), vec3(0.0)));

    Collision collision;
    collision.distance = -1.0;
    sphereIntersection(collision, ray, sphere1);
    sphereIntersection(collision, ray, sphere2);
    sphereIntersection(collision, ray, sphere3);
    sphereIntersection(collision, ray, sphere4);

    return collision;
}

vec3 hash(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.xxy + p.yzz) * p.zyx);
}
vec3 int_hash(uvec3 x) {
    x = ((x >> 8U) ^ x.yzx) * 1103515245U;
    x = ((x >> 8U) ^ x.yzx) * 1103515245U;
    x = ((x >> 8U) ^ x.yzx) * 1103515245U;
    
    return vec3(x) * (1.0 / float(0xffffffffU));
}
vec3 randomUnitVector(vec3 seed) {
    vec3 v = vec3(1.0);
    for (int i = 0; length(v) > 1.0 || length(v) == 0.0; i++) {
        vec3 h = seed = hash(seed - vec3(1.0));
        v = h * 2.0 - vec3(1.0);
    }
    return normalize(v);
}

float colorCorrection(float intensity) {
    return intensity <= 0.0031308 ? 12.92 * intensity : 1.055 * pow(intensity, 1.0 / 2.4) - 0.055;
}

uniform mat4 u_viewMatrix;
uniform int u_frame;
uniform sampler2D u_lastFrame;
uniform bool u_render;

in vec3 v_pixelLocation;

out vec4 outColor;
void main() {
    vec2 uv = gl_FragCoord.xy / vec2(textureSize(u_lastFrame, 0));
    if (u_render) {
        outColor = texture(u_lastFrame, uv) / float(u_frame + 1);
        outColor = vec4(colorCorrection(outColor.r), colorCorrection(outColor.g), colorCorrection(outColor.b), 1.0);
        // outColor.rg = uv;
        return;
    }
    vec4 origin = u_viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 direction = u_viewMatrix * vec4(normalize(v_pixelLocation), 0.0);

    vec3 seed = int_hash(uvec3(gl_FragCoord.xy, u_frame));
    // outColor.rgb = seed;
    // outColor.a = 1.0;
    // return;

    vec3 color = vec3(0.0);
    vec3 contribution = vec3(1.0);

    Ray ray = Ray(origin.xyz, direction.xyz);
    for (int i = 0; i < 5; i++) {
        Collision collision = sceneIntersection(ray);
        vec3 hitPoint = ray.origin + ray.direction * collision.distance + collision.normal * 0.001;
        if (collision.distance < 0.0) break;

        color += contribution * collision.material.emissivity;
        contribution *= collision.material.albedo;
        if (contribution == vec3(0.0)) break;

        ray.origin = hitPoint;
        ray.direction = randomUnitVector(seed = hash(seed));
        if (dot(ray.direction, collision.normal) < 0.0) {
            ray.direction = -ray.direction;
        }
        contribution *= dot(ray.direction, collision.normal);
    }

    if (u_frame == 0) {
        outColor = vec4(color, 1.0);
        return;
    }
    outColor.rgb = texture(u_lastFrame, uv).rgb + color;
    outColor.a = 1.0;
}
