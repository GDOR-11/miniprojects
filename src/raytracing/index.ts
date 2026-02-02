import "./index.css";
import fragment_shader_source from "./fragment.glsl";
import vertex_shader_source from "./vertex.glsl";
import { mat4, vec3 } from "gl-matrix";

function throw_error(message: string) {
    alert(message);
    throw new Error(message);
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");
if (!gl) throw_error("webgl2 is not supported");
if (!gl.getExtension("EXT_color_buffer_float")) throw_error("EXT_color_buffer_float is not supported");

const dpr = window.devicePixelRatio;
const width = Math.round(canvas.clientWidth * dpr);
const height = Math.round(canvas.clientHeight * dpr);
canvas.width = width;
canvas.height = height;
gl.viewport(0, 0, width, height);

function compile_shader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw_error(`failed to compile shader:\n${log}`);
}

function create_program(gl: WebGL2RenderingContext, vertex_shader: WebGLShader, fragment_shader: WebGLShader): WebGLProgram {
    const program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;

    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw_error(`failed to link program:\n${log}`);
}

function bind_buffer_to_attribute(
    gl: WebGL2RenderingContext,
    attribute_location: GLint,
    buffer_data: {
        data: AllowSharedBufferSource,
        size: GLint,
        type: GLenum,
        normalized?: GLboolean,
        stride?: GLsizei,
        offset?: GLintptr
    },
    vao?: WebGLVertexArrayObject
) {
    if (vao !== undefined) gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, buffer_data.data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_location);
    gl.vertexAttribPointer(attribute_location, buffer_data.size, buffer_data.type, buffer_data.normalized ?? false, buffer_data.stride ?? 0, buffer_data.offset ?? 0);
    gl.enableVertexAttribArray(attribute_location);
}

const vertex_shader = compile_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
const fragment_shader = compile_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
const program = create_program(gl, vertex_shader, fragment_shader);

gl.useProgram(program);


const locations: { attributes: { [attribute: string]: GLint }, uniforms: { [uniform: string]: WebGLUniformLocation } } = {
    attributes: {
        "a_position": gl.getAttribLocation(program, "a_position"),
    },
    uniforms: {
        "u_invViewMatrix": gl.getUniformLocation(program, "u_invViewMatrix"),
        "u_screenSize": gl.getUniformLocation(program, "u_screenSize"),
        "u_frame": gl.getUniformLocation(program, "u_frame"),
        "u_lastFrame": gl.getUniformLocation(program, "u_lastFrame"),
        "u_render": gl.getUniformLocation(program, "u_render"),
        "u_resolution": gl.getUniformLocation(program, "u_resolution")
    }
};
gl.uniform2f(locations.uniforms["u_screenSize"], 0.5 * width / height, 0.5);
gl.uniform2f(locations.uniforms["u_resolution"], width, height);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

bind_buffer_to_attribute(gl, locations.attributes["a_position"], {
    data: new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1]),
    size: 2,
    type: gl.FLOAT
});

const tmp = gl.createTexture();
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, tmp);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const last_frame = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, last_frame);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);

const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, last_frame, 0);

let camera = {
    pos: vec3.fromValues(0, 0, 0),
    rot: vec3.fromValues(0, 0, 0)
};
let pressed_keys = new Set<string>();
let frame = 0;
function render() {
    console.log(pressed_keys);
    for (let key of pressed_keys) {
        let movement_dir = vec3.fromValues(Math.sin(camera.rot[1]), 0, Math.cos(camera.rot[1]));
        let side_dir = vec3.cross(vec3.create(), vec3.fromValues(0, 1, 0), movement_dir);
        let moved = true;
        if (key === "w") {
            vec3.scaleAndAdd(camera.pos, camera.pos, movement_dir, 0.05);
        } else if (key === "s") {
            vec3.scaleAndAdd(camera.pos, camera.pos, movement_dir, -0.05);
        } else if (key === "a") {
            vec3.scaleAndAdd(camera.pos, camera.pos, side_dir, -0.05);
        } else if (key === "d") {
            vec3.scaleAndAdd(camera.pos, camera.pos, side_dir, 0.05);
        } else if (key === " ") {
            camera.pos[1] += 0.05;
        } else if (key === "Shift") {
            camera.pos[1] -= 0.05;
        } else if (key === "q") {
            camera.rot[2] += 0.02;
        } else if (key === "e") {
            camera.rot[2] -= 0.02;
        } else {
            moved = false;
        }
        if (moved) frame = 0;
    }

    gl.uniform1i(locations.uniforms["u_frame"], frame++);
    let inv_view_matrix = mat4.create();
    mat4.translate(inv_view_matrix, inv_view_matrix, camera.pos);
    mat4.rotateZ(inv_view_matrix, inv_view_matrix, camera.rot[2]);
    mat4.rotateY(inv_view_matrix, inv_view_matrix, camera.rot[1]);
    mat4.rotateX(inv_view_matrix, inv_view_matrix, camera.rot[0]);
    gl.uniformMatrix4fv(locations.uniforms["u_invViewMatrix"], false, inv_view_matrix);

    gl.uniform1i(locations.uniforms["u_lastFrame"], 1);
    gl.uniform1i(locations.uniforms["u_render"], 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, tmp);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 0, 0, width, height, 0);

    gl.uniform1i(locations.uniforms["u_lastFrame"], 0);
    gl.uniform1i(locations.uniforms["u_render"], 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

window.addEventListener("keydown", event => pressed_keys.add(event.key));
window.addEventListener("keyup", event => pressed_keys.delete(event.key));
canvas.addEventListener("click", () => canvas.requestPointerLock());
window.addEventListener("mousemove", event => {
    if (document.pointerLockElement !== canvas) return;
    camera.rot[1] += event.movementX * 0.002;
    camera.rot[0] += event.movementY * 0.002;
    frame = 0;
});
