// sorry for the absolute spaghetti

import RenderSpace from "movable-render-space";
import { vec2 } from "gl-matrix";
import * as dat from "dat.gui";
//@ts-ignore
import numeric from "./numeric.min.js";

const canvas = document.getElementById("pendulum-canvas") as HTMLCanvasElement;
const trace_canvas = document.getElementById("trace-canvas") as HTMLCanvasElement;
const trace_ctx = trace_canvas.getContext("2d");
const space = new RenderSpace(canvas);
space.config.rotating = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    trace_canvas.width = window.innerWidth;
    trace_canvas.height = window.innerHeight;
    space.updateTransform();
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("dblclick", () => document.body.style.cursor = document.body.style.cursor == "none" ? "default" : "none");

const N = Number(window.localStorage.getItem("N") ?? 2);
const dt = Number(window.localStorage.getItem("dt"));
const substeps = Number(window.localStorage.getItem("substeps") ?? 1);
const g = Number(window.localStorage.getItem("g") ?? 5);

let y: number[] = new Array(2 * N).fill(0).map((_, i) => i < N ? Math.PI / 2 : 0);
const L: number[] = new Array(N).fill(1);
const m: number[] = new Array(N).fill(1);

const M: number[] = [];
M[N - 1] = m[N - 1];
for (let i = N - 2; i >= 0; i--) {
    M[i] = M[i + 1] + m[i];
}

let tmp = new Array(2 * N);
let tmp2 = new Array(N).fill(0).map(_ => new Array().fill(0));

space.zoomInto(vec2.fromValues(0, 0), Math.min(window.innerWidth, window.innerHeight) / (2.5 * N));
space.translate(vec2.fromValues(window.innerWidth / 2, window.innerHeight / 2));
space.updateTransform();

let appearance = {
    colors: {
        weights: "#ffff00",
        rods: "#808080",
        trace: "#0000ff",
        background: "#000000"
    },
    width: {
        weights: 0.16,
        rods: 0.04,
        trace: 0.01
    }
};
const gui = new dat.GUI({ name: "customize appearance" });
const colors_gui_folder = gui.addFolder("colors");
colors_gui_folder.addColor(appearance.colors, "weights");
colors_gui_folder.addColor(appearance.colors, "rods");
colors_gui_folder.addColor(appearance.colors, "trace").onChange(redraw_trace);
colors_gui_folder.addColor(appearance.colors, "background").onChange(bg => document.body.style.background = bg);
const width_gui_folder = gui.addFolder("width");
width_gui_folder.add(appearance.width, "weights");
width_gui_folder.add(appearance.width, "rods");
width_gui_folder.add(appearance.width, "trace").onChange(redraw_trace);

let trace: vec2[] = [];

function redraw_trace() {
    trace_ctx.clearRect(0, 0, trace_canvas.width, trace_canvas.height);
    if (trace.length == 0) return;
    trace_ctx.strokeStyle = appearance.colors.trace;
    trace_ctx.lineCap = "round";
    trace_ctx.lineJoin = "round";
    trace_ctx.lineWidth = appearance.width.trace;
    let m = space.transform.matrix();
    trace_ctx.save();
    trace_ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    trace_ctx.beginPath();
    trace_ctx.moveTo(trace[0][0], trace[0][1]);
    for (let i = 1; i < trace.length; i++) {
        trace_ctx.lineTo(trace[i][0], trace[i][1]);
    }
    trace_ctx.stroke();
    trace_ctx.restore();
}

space.addListener(redraw_trace);

function render() {
    document.body.style.backgroundColor = appearance.colors.background;
    space.clearScreen();

    let current = vec2.create();
    space.ctx.strokeStyle = appearance.colors.rods;
    space.ctx.lineJoin = "round";
    space.ctx.lineWidth = appearance.width.rods;
    space.ctx.beginPath();
    space.ctx.moveTo(current[0], current[1]);
    for (let i = 0; i < N; i++) {
        current[0] += L[i] * Math.sin(y[i]);
        current[1] += L[i] * Math.cos(y[i]);
        space.ctx.lineTo(current[0], current[1]);
    }
    space.ctx.stroke();

    vec2.set(current, 0, 0);
    space.ctx.fillStyle = appearance.colors.weights;
    space.ctx.beginPath();
    space.ctx.arc(current[0], current[1], appearance.width.weights / 2, 0, Math.PI * 2);
    space.ctx.fill();
    for (let i = 0; i < N; i++) {
        current[0] += L[i] * Math.sin(y[i]);
        current[1] += L[i] * Math.cos(y[i]);
        space.ctx.beginPath();
        space.ctx.arc(current[0], current[1], appearance.width.weights / 2, 0, Math.PI * 2);
        space.ctx.fill();
    }

    trace.push(current);
    if (trace.length < 2) return;
    trace_ctx.strokeStyle = appearance.colors.trace;
    trace_ctx.lineCap = "round";
    trace_ctx.lineWidth = appearance.width.trace;
    let m = space.transform.matrix();
    trace_ctx.save();
    trace_ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    trace_ctx.beginPath();
    trace_ctx.moveTo(trace[trace.length - 2][0], trace[trace.length - 2][1]);
    trace_ctx.lineTo(trace[trace.length - 1][0], trace[trace.length - 1][1]);
    trace_ctx.stroke();
    trace_ctx.restore();
}

function f(y: number[]): number[] {
    for (let i = 0; i < N; i++) {
        let bi = -M[i] * L[i] * g * Math.sin(y[i]);
        for (let j = 0; j < N; j++) {
            let k = M[Math.max(i, j)] * L[i] * L[j];
            bi += k * y[j + N] * y[j + N] * Math.sin(y[j] - y[i]);
            if (i > j) {
                tmp2[i][j] = tmp2[j][i];
            } else {
                tmp2[i][j] = k * Math.cos(y[j] - y[i]);
            }
        }
        tmp[i] = bi;
    }

    let gamma = numeric.solve(tmp2, tmp);

    for (let i = 0; i < N; i++) {
        tmp[i] = y[i + N];
    }
    for (let i = 0; i < N; i++) {
        tmp[i + N] = gamma[i];
    }

    return tmp.slice();
}

function step(dt: number) {
    function muladd(a: number[], b: number[], s: number) {
        for (let i = 0; i < 2 * N; i++) {
            tmp[i] = a[i] + s * b[i];
        }
        return tmp.slice();
    }
    let k1 = f(y);
    let k2 = f(muladd(y, k1, dt / 2));
    let k3 = f(muladd(y, k2, dt / 2));
    let k4 = f(muladd(y, k3, dt));

    for (let i = 0; i < 2 * N; i++) {
        y[i] += (k1[i] + 2 * (k2[i] + k3[i]) + k4[i]) * dt / 6;
    }
}

let last_frame = 0;
function tick(timestamp: number) {
    let delta_t = isNaN(dt) ? Math.min((timestamp - last_frame) / 1000, 0.1) : dt;
    for (let i = 0; i < substeps; i++) {
        step(delta_t / substeps);
    }
    render();

    last_frame = timestamp;
    requestAnimationFrame(tick);
}
requestAnimationFrame(timestamp => {
    last_frame = timestamp;
    requestAnimationFrame(tick);
});
