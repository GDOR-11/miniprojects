#version 300 es

uniform vec2 u_screenSize;

out vec3 v_pixelLocation;

in vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_pixelLocation = vec3(0.5 * a_position * u_screenSize, 1);
}
