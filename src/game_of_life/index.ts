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
    // yes, this is a sextuple loop
    for (let [x, set] of grid) {
        for (let y of set) {
            for (let i = -1; i <= 1; i++) {
                let col1 = next_grid.get(x + i);
                if (col1 === undefined) {
                    col1 = new Set<number>();
                    next_grid.set(x + i, col1);
                }
                for (let j = -1; j <= 1; j++) {
                    let neighbors = 0;
                    for (let ii = -1; ii <= 1; ii++) {
                        let col2 = grid.get(x + i + ii);
                        if (col2 === undefined) continue;
                        for (let jj = -1; jj <= 1; jj++) {
                            if (ii === jj && jj === 0) continue;
                            neighbors += col2.has(y + j + jj) ? 1 : 0;
                        }
                    }
                    if (neighbors === 3) col1.add(y + j);
                    if (grid.get(x + i)?.has?.(y + j) && neighbors === 2) col1.add(y + j);
                }
            }
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

space.addListener(render);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    space.updateTransform();
    render();
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("click", event => {
    if (event.x < 100 && event.y < 100) {
        setInterval(() => {
            step();
            render();
        }, 10);
        return;
    }

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
