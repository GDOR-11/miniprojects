import "./index.css";
import RenderSpace from "movable-render-space";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const space = new RenderSpace(canvas);
const ctx = space.ctx;

space.config.rotating = false;
space.zoomInto([0, 0], 100);
space.translate([window.innerWidth / 2, window.innerHeight / 2]);

let grid = [[true, true], [true, false]];

function render() {
    const aabb = space.getScreenAABB();
    space.clearScreen();

    ctx.fillStyle = "#404040";
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j]) {
                ctx.fillRect(i - 0.5, -j - 0.5, 1, 1);
            }
        }
    }

    const w = 0.05; // grid width
    ctx.strokeStyle = "black";
    ctx.lineCap = "square";
    ctx.lineWidth = w;
    for (let x = -0.5; x <= aabb[1][0] + w / 2; x++) {
        ctx.beginPath();
        ctx.moveTo(x, aabb[0][1]);
        ctx.lineTo(x, Math.min(0.5, aabb[1][1]));
        ctx.stroke();
    }
    for (let y = 0.5; y >= aabb[0][1] - w / 2; y--) {
        ctx.beginPath();
        ctx.moveTo(Math.max(-0.5, aabb[0][0]), y);
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
    let [i, j] = space.screenToRenderSpace([event.x, event.y]);
    [i, j] = [Math.round(i), Math.round(-j)];

    if (grid[i]?.[j] !== true) return;
    if (grid[i + 1]?.[j] === true) return;
    if (grid[i]?.[j + 1] === true) return;

    if (i === grid.length - 1) {
        grid.push(new Array(grid[i].length).fill(false));
    }
    if (j === grid[i].length - 1) {
        grid.forEach(col => col.push(false));
    }

    grid[i][j] = false;
    grid[i + 1][j] = true;
    grid[i][j + 1] = true;

    render();
});
