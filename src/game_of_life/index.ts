import "./index.css";
import RenderSpace from "movable-render-space";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const space = new RenderSpace(canvas);
const ctx = space.ctx;

space.config.rotating = false;
space.zoomInto([0, 0], 100);
space.translate([window.innerWidth / 2, window.innerHeight / 2]);

let grid = new Map<number, Set<number>>();

function step() {
    let next_grid = new Map<number, Set<number>>();

    // all cells that will potentially be alive next iteration
    for (let [x, set] of grid) {
        for (let y of set) {
            for (let i = -1; i <= 1; i++) {
                let col = next_grid.get(x + i);
                if (col === undefined) {
                    col = new Set<number>();
                    next_grid.set(x + i, col);
                }
                col.add(y - 1);
                col.add(y);
                col.add(y + 1);
            }
        }
    }

    // prune down all of the ones that aren't actually alive
    for (let [x, set] of next_grid) {
        for (let y of set) {
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
                let col = grid.get(x + i);
                if (col === undefined) continue;
                neighbors += col.has(y - 1) ? 1 : 0;
                neighbors += col.has(y) ? 1 : 0;
                neighbors += col.has(y + 1) ? 1 : 0;
            }
            if (neighbors < 3 || neighbors > 4) next_grid.get(x).delete(y);
            if (neighbors === 4 && !grid.get(x)?.has?.(y)) next_grid.get(x).delete(y);
        }
    }

    grid = next_grid;
}

function render() {
    const aabb = space.getScreenAABB();
    space.clearScreen();

    ctx.fillStyle = "#404040";

    for (let [x, set] of grid) {
        for (let y of set) {
            ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
    }

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
            for (let i = 0; performance.now() - now < 17 && i < speed * (now - last_frame) / 1000; i++) step();
            last_step = now;
        } else if (speed > 1000 / (now - last_step)) {
            step();
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
document.getElementById("step").addEventListener("click", step);
document.getElementById("speed").addEventListener("input", e => speed = 2 ** Number((document.getElementById("speed") as HTMLInputElement).value));

canvas.addEventListener("click", event => {
    let [i, j] = space.screenToRenderSpace([event.x, event.y]);
    [i, j] = [Math.round(i), Math.round(j)];

    let col = grid.get(i);
    if (col === undefined) {
        col = new Set();
        grid.set(i, col);
    }
    if (col.has(j)) {
        col.delete(j);
    } else {
        col.add(j);
    }

    render();
});
