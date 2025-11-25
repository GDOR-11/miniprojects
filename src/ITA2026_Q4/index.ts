// sorry for the spaghetti, and good luck understanding it (you'll absolutely need it)

import "./index.css";
import { vec2 } from "gl-matrix";
import RenderSpace from "movable-render-space";
import Mass from "./mass";
import { AfterSeparationState, BeforeSeparationState, type SimulationState } from "./simulation_logic";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const trajectory_canvas = document.getElementById("trajectory-canvas") as HTMLCanvasElement;
const space = new RenderSpace(canvas);
space.config.panning = false;
space.config.zooming = false;
space.config.rotating = false;
space.zoomInto(vec2.create(), window.innerWidth / 2);
space.translate(vec2.fromValues(window.innerWidth / 2, window.innerHeight / 2));
space.updateTransform();

function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    trajectory_canvas.width = window.innerWidth;
    trajectory_canvas.height = window.innerHeight;
    space.updateTransform();
}
window.addEventListener("resize", onResize);
onResize();

export const GM = 0.01;
export function gravity(pos: vec2): vec2 {
    return vec2.scale(vec2.create(), pos, -GM / Math.pow(vec2.len(pos), 3));
}

export const dt = 0.0001;

let state: SimulationState = new BeforeSeparationState();

const initial_trajectory = state.m.getTrajectory();
let separation_point = initial_trajectory[4075]; // (2pi - arccos(-|e|)) / da
let separation_impulse = vec2.fromValues(0, -0.15);

// input handling
(() => {
    let dragging_separation_impulse = false;
    let dragging_separation_point = false;
    canvas.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        const p = space.screenToRenderSpace(vec2.fromValues(event.clientX, event.clientY));
        if (vec2.distance(p, vec2.add(vec2.create(), separation_point, separation_impulse)) < 0.1) {
            dragging_separation_impulse = true;
        } else if (vec2.distance(p, separation_point) < 0.1) {
            dragging_separation_point = true;
        }
    });
    canvas.addEventListener("pointermove", event => {
        const p = space.screenToRenderSpace(vec2.fromValues(event.clientX, event.clientY));
        if (dragging_separation_impulse) {
            vec2.subtract(separation_impulse, p, separation_point);
        } else if (dragging_separation_point) {
            let closest_point = 0;
            let best = vec2.distance(p, initial_trajectory[0]);
            for (let i = 1; i < initial_trajectory.length; i++) {
                let curr = vec2.distance(p, initial_trajectory[i]);
                if (curr < best) {
                    closest_point = i;
                    best = curr;
                }
            }
            separation_point = initial_trajectory[closest_point];
        }
    });
    canvas.addEventListener("pointerup", () => {
        dragging_separation_impulse = false;
        dragging_separation_point = false;
    });
})();

let last_frame = 0;
function tick(timestamp: number) {
    state.tick(space, (timestamp - last_frame) / 1000);

    if (state instanceof BeforeSeparationState
        && vec2.distance(state.m.pos, separation_point) < 0.01
        && vec2.dot(state.m.vel, vec2.subtract(vec2.create(), state.m.pos, separation_point)) < 0
    ) {
        const m1 = new Mass(
            vec2.clone(state.m.pos),
            vec2.add(vec2.create(), state.m.vel, vec2.scale(vec2.create(), separation_impulse, 0.1 / (state.m.mass * 0.8))),
            state.m.mass * 0.8,
            "rgba(0, 255, 0, 0.4)"
        );
        const m2 = new Mass(
            vec2.clone(state.m.pos),
            vec2.add(vec2.create(), state.m.vel, vec2.scale(vec2.create(), separation_impulse, -0.1 / (state.m.mass * 0.2))),
            state.m.mass * 0.2,
            "rgba(0, 0, 255, 0.4)"
        );
        state = new AfterSeparationState(m1, m2);
    }

    if (state instanceof AfterSeparationState) {
        space.ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        space.ctx.lineWidth = 1 / space.transform.zoom;
        space.ctx.beginPath();
        space.ctx.moveTo(initial_trajectory[0][0], initial_trajectory[0][1]);
        for (let point of initial_trajectory) {
            space.ctx.lineTo(point[0], point[1]);
        }
        space.ctx.stroke();
    }

    if (state instanceof BeforeSeparationState) {
        space.ctx.fillStyle = "grey";
        space.ctx.beginPath();
        space.ctx.arc(separation_point[0], separation_point[1], 0.01, 0, 2 * Math.PI);
        space.ctx.fill();

        space.ctx.strokeStyle = "grey";
        space.ctx.lineCap = "round";
        space.ctx.lineJoin = "round";
        space.ctx.lineWidth = 3 / space.transform.zoom;
        space.ctx.beginPath();
        space.ctx.moveTo(separation_point[0], separation_point[1]);
        space.ctx.lineTo(separation_point[0] + separation_impulse[0], separation_point[1] + separation_impulse[1]);
        const p1 = vec2.scale(vec2.create(), vec2.rotate(vec2.create(), separation_impulse, vec2.create(), Math.PI / 24), 0.87);
        const p2 = vec2.scale(vec2.create(), vec2.rotate(vec2.create(), separation_impulse, vec2.create(), -Math.PI / 24), 0.87);
        space.ctx.lineTo(separation_point[0] + p1[0], separation_point[1] + p1[1]);
        space.ctx.moveTo(separation_point[0] + separation_impulse[0], separation_point[1] + separation_impulse[1]);
        space.ctx.lineTo(separation_point[0] + p2[0], separation_point[1] + p2[1]);
        space.ctx.stroke();
    }

    last_frame = timestamp;
    requestAnimationFrame(tick);
}
requestAnimationFrame(timestamp => {
    last_frame = timestamp;
    requestAnimationFrame(tick)
});
