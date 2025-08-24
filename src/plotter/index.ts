import "./index.css";
import RenderSpace from "movable-render-space";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const space = new RenderSpace(ctx);
space.translate([window.innerWidth / 2, window.innerHeight / 2]);
space.updateTransform();
space.config.damping_strength = 0.05;
space.config.rotating = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();


const f = (x: number) => Math.sin(Math.tan(x));

function derivative(x: number, f: (x: number) => number) {
    return (f(x + 1e-8) - f(x)) * 1e8;
}

function render_background() {
    let aabb = space.getScreenAABB();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1 / space.transform.zoom;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(aabb[0][0], 0);
    ctx.lineTo(aabb[1][0], 0);
    ctx.moveTo(0, aabb[0][1]);
    ctx.lineTo(0, aabb[1][1]);
    ctx.stroke();
}
function render_function() {
    let aabb = space.getScreenAABB();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 / space.transform.zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let min_dx = (aabb[1][0] - aabb[0][0]) / 16384;
    let max_dx = (aabb[1][0] - aabb[0][0]) / 256;
    // inverse of d²f/dx²
    let dx = (x: number) => {
        let uncampled = 1 / derivative(x, (x: number) => derivative(x, f));
        return Math.max(min_dx, Math.min(max_dx, uncampled));
    }

    ctx.beginPath();
    ctx.moveTo(aabb[0][0], f(aabb[0][0]));
    for (let x = aabb[0][0]; x <= aabb[1][0]; x += dx(x)) {
        ctx.lineTo(x, f(x));
    }
    ctx.stroke();
}

let last_frame = performance.now();
function render() {
    space.clearScreen();
    space.updateDamping((performance.now() - last_frame) / 1000);

    render_function();
    render_background();

    last_frame = performance.now();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
