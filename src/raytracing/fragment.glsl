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
    uint BRDFid;
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
    if (c < 0.0 && !sphere.inverted) return;
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
    Sphere[] spheres = Sphere[](
        Sphere(vec3(0.0, -1.0, 10.0), 1.0, false, Material(vec3(0.0, 1.0, 1.0), vec3(0.0), 0u)),
        Sphere(vec3(0.0, 1.0, 10.0), 1.0, false, Material(vec3(1.0, 1.0, 0.0), vec3(0.0), 0u)),
        Sphere(vec3(2.0, 3.0, 8.0), 1.0, false, Material(vec3(0.0, 0.0, 0.0), vec3(0.1), 0u)),
        Sphere(vec3(0.0, 0.0, 5.0), 5.1, true, Material(vec3(1.0, 1.0, 1.0), vec3(0.0), 0u))
    );

    Collision collision;
    collision.distance = -1.0;
    for (int i = 0; i < spheres.length(); i++) {
        sphereIntersection(collision, ray, spheres[i]);
    }

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

vec3 BRDF_randomDirection(uint id, vec3 incoming_dir, vec3 normal, inout vec3 seed) {
    if (id == 0u) {
        // lambertian diffuse
        vec3 v = vec3(1.0);
        for (int i = 0; length(v) > 1.0 || length(v) == 0.0; i++) {
            vec3 h = seed = hash(seed - vec3(i + 1));
            v = h * 2.0 - vec3(1.0);
        }
        if (dot(v, normal) < 0.0) {
            v = -v;
        }
        return v;
    } else if (id == 1u) {
        return reflect(incoming_dir, normal);
    }
}

float colorCorrection(float intensity) {
    return intensity <= 0.0031308 ? 12.92 * intensity : 1.055 * pow(intensity, 1.0 / 2.4) - 0.055;
}

uniform mat4 u_invViewMatrix;
uniform int u_frame;
uniform sampler2D u_lastFrame;
uniform bool u_render;
uniform vec2 u_screenSize;
uniform vec2 u_resolution;

out vec4 outColor;
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    if (u_render) {
        float[] kernel = float[](
            0.0625, 0.125 , 0.0625,
            0.125 , 0.25  , 0.125 ,
            0.0625, 0.125 , 0.0625
        );
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec2 offset = vec2(float(x), float(y)) / u_resolution;
                vec3 pixel = texture(u_lastFrame, uv + offset).rgb;
                outColor.rgb += pixel * kernel[(y + 1) * 3 + (x + 1)];
            }
        }
        outColor /= float(u_frame + 1);
        // outColor = texture(u_lastFrame, uv) / float(u_frame + 1);
        outColor = vec4(colorCorrection(outColor.r), colorCorrection(outColor.g), colorCorrection(outColor.b), 1.0);
        return;
    }

    vec3 seed = int_hash(uvec3(gl_FragCoord.xy, u_frame));
    // outColor.rgb = seed;
    // outColor.a = 1.0;
    // return;

    vec3 pixelLocation = vec3(u_screenSize * (uv - vec2(0.5)), 1.0);
    pixelLocation.xy += ((seed = hash(seed)).xy - vec2(0.5)) * u_screenSize / u_resolution;
    vec4 origin = u_invViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 direction = u_invViewMatrix * vec4(normalize(pixelLocation), 0.0);
    Ray ray = Ray(origin.xyz, direction.xyz);

    vec3 color = vec3(0.0);
    vec3 contribution = vec3(1.0);
    for (int i = 0; i < 5; i++) {
        Collision collision = sceneIntersection(ray);
        vec3 hitPoint = ray.origin + ray.direction * collision.distance + collision.normal * 1e-5;
        if (collision.distance < 0.0) break;

        color += contribution * collision.material.emissivity;
        contribution *= collision.material.albedo;
        if (contribution == vec3(0.0)) break;

        vec3 original_direction = ray.direction;

        ray.origin = hitPoint;
        ray.direction = BRDF_randomDirection(collision.material.BRDFid, ray.direction, collision.normal, seed);
        seed = hash(seed);
        if (dot(ray.direction, collision.normal) < 0.0) {
            ray.direction = -ray.direction;
        }
        contribution *= dot(ray.direction, collision.normal) / dot(-original_direction, collision.normal);
    }

    if (u_frame == 0) {
        outColor = vec4(color, 1.0);
        return;
    }
    outColor.rgb = texture(u_lastFrame, uv).rgb + color;
    outColor.a = 1.0;
}
