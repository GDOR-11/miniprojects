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

function resize() {
    const dpr = window.devicePixelRatio;
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
}
resize();
window.addEventListener("resize", resize);

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
        "u_viewMatrix": gl.getUniformLocation(program, "u_viewMatrix"),
        "u_screenSize": gl.getUniformLocation(program, "u_screenSize"),
        "u_time": gl.getUniformLocation(program, "u_time")
    }
};
gl.uniform2f(locations.uniforms["u_screenSize"], 0.5, 0.5 * canvas.height / canvas.width);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

bind_buffer_to_attribute(gl, locations.attributes["a_position"], {
    data: new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1]),
    size: 2,
    type: gl.FLOAT
});

let start_time = performance.now();
function render() {
    const t = (performance.now() - start_time) / 1000;

    gl.uniform1f(locations.uniforms["u_time"], t);
    gl.uniformMatrix4fv(locations.uniforms["u_viewMatrix"], false, mat4.identity(mat4.create()));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
