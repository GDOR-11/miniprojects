import "./index.css";
import RenderSpace from "movable-render-space";
import { clearGrid, forEachAliveCell, getCellState, setCellState, step } from "./simulators/sparse_encoding";
import { load } from "./pattern_loader";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const space = new RenderSpace(canvas);
const ctx = space.ctx;

space.config.rotating = false;
space.zoomInto([0, 0], 100);
space.translate([window.innerWidth / 2, window.innerHeight / 2]);

export function view_center(): [number, number] {
    let center = space.screenToRenderSpace([window.innerWidth / 2, window.innerHeight / 2]);
    return [Math.round(center[0]), Math.round(center[1])];
}

function render() {
    const aabb = space.getScreenAABB();
    space.clearScreen();

    ctx.fillStyle = "#404040";

    forEachAliveCell((x, y) => {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    });

    const w = 0.05; // grid width
    ctx.strokeStyle = "black";
    ctx.lineCap = "square";
    ctx.lineWidth = w;
    for (let x = Math.round(aabb[0][0] - w / 2) + 0.5; x <= aabb[1][0] + w / 2; x++) {
        ctx.beginPath();
        ctx.moveTo(x, aabb[0][1]);
        ctx.lineTo(x, aabb[1][1]);
        ctx.stroke();
    }
    for (let y = Math.round(aabb[0][1] - w / 2) + 0.5; y <= aabb[1][1] + w / 2; y++) {
        ctx.beginPath();
        ctx.moveTo(aabb[0][0], y);
        ctx.lineTo(aabb[1][0], y);
        ctx.stroke();
    }
}

let running = false;
let speed = 1; // in Hz

let last_step = performance.now();
let last_frame = performance.now();
function frame() {
    if (running) {
        let now = performance.now();
        if (speed > 1000 / (now - last_frame)) {
            for (let i = 0; performance.now() - now < 17 && i < speed * (now - last_frame) / 1000; i++) step(1);
            last_step = now;
        } else if (speed > 1000 / (now - last_step)) {
            step(1);
            last_step = now;
        }
    }
    render();
    last_frame = performance.now();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    space.updateTransform();
    render();
}
window.addEventListener("resize", resize);
resize();

document.getElementById("start").addEventListener("click", () => running = !running);
document.getElementById("step").addEventListener("click", () => step(1));
document.getElementById("clear").addEventListener("click", () => clearGrid());
document.getElementById("speed").addEventListener("input", () => speed = 2 ** Number((document.getElementById("speed") as HTMLInputElement).value));

canvas.addEventListener("click", event => {
    let [i, j] = space.screenToRenderSpace([event.x, event.y]);
    [i, j] = [Math.round(i), Math.round(j)];
    setCellState(i, j, !getCellState(i, j));
    render();
});

document.getElementById("file").addEventListener("change", async () => {
    const input = document.getElementById("file") as HTMLInputElement;
    const file = input.files[0];
    if (file === undefined) return;
    const data = await file.text();
    const success = load(data, file.name.split(".").at(-1));
    if (!success) alert("unsupported file format");
    input.value = "";
});
