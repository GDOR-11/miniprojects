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
        "u_viewMatrix": gl.getUniformLocation(program, "u_viewMatrix"),
        "u_screenSize": gl.getUniformLocation(program, "u_screenSize"),
        "u_frame": gl.getUniformLocation(program, "u_frame"),
        "u_lastFrame": gl.getUniformLocation(program, "u_lastFrame"),
        "u_render": gl.getUniformLocation(program, "u_render")
    }
};
gl.uniform2f(locations.uniforms["u_screenSize"], 0.5 * width / height, 0.5);

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

const last_frame = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, last_frame);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);

const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, last_frame, 0);

let frame = 0;
function render() {
    gl.uniform1i(locations.uniforms["u_frame"], frame++);
    gl.uniformMatrix4fv(locations.uniforms["u_viewMatrix"], false, mat4.identity(mat4.create()));

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
