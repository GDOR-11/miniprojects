import "./index.css";
import fragment_shader_source from "./fragment.glsl";
import vertex_shader_source from "./vertex.glsl";

function throw_error(message: string) {
    alert(message);
    throw new Error(message);
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");
if (!gl) throw_error("webgl2 is not supported");

function resize() {
    const dpr = window.devicePixelRatio;
    const width = Math.round(canvas.clientHeight * dpr);
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

const vertex_shader = compile_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
const fragment_shader = compile_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
const program = create_program(gl, vertex_shader, fragment_shader);

gl.useProgram(program);


const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const position_attribute_location = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(position_attribute_location);

const position_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
const positions = new Float32Array([0, 0, 0, 0.5, 0.7, 0]);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(position_attribute_location,
    2,        // size
    gl.FLOAT, // type
    false,    // normalize
    0,        // stride
    0         // offset
);


gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.bindVertexArray(vao);
gl.drawArrays(
    gl.TRIANGLES, // primitive type
    0,            // offset
    3             // count
);
