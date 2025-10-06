import "./index.css";
import { vec2 } from "gl-matrix";
import RenderSpace from "movable-render-space";
import Ball from "./ball";
import Wall from "./wall";
import { ball_ball_collision, ball_wall_collision, resolve_ball_ball_collision, resolve_ball_wall_collision } from "./collision_handling";
import Color from "colorjs.io";

export const G = vec2.fromValues(0, 10);
export const DELTA = 1e-6;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const space = new RenderSpace(canvas);

space.config.panning = false;
space.config.zooming = false;
space.config.rotating = false;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

space.zoomInto(vec2.fromValues(0, 0), 10);
space.translate(vec2.fromValues(canvas.width / 2, canvas.height / 2));
space.updateTransform();


const balls: Ball[] = [];

for (let x = -16; x <= 16; x += 4) {
    for (let y = -30; y <= 30; y += 4) {
        let color = new Color(`oklch(${0.5 + 0.5 * Math.random()}, ${0.5 * Math.random()}, ${360 * Math.random()})`).toString({ format: "rgb" });
        balls.push(new Ball(1, vec2.fromValues(x, y), vec2.fromValues(0, 0), 1, color));
    }
}
balls[64].pos[0] = 1e-42;

const walls: Wall[] = [
    new Wall(vec2.fromValues(0, 1), 0.5 * window.innerHeight / space.transform.zoom),
    new Wall(vec2.fromValues(0, 1), -0.5 * window.innerHeight / space.transform.zoom),
    new Wall(vec2.fromValues(1, 0), 0.5 * window.innerWidth / space.transform.zoom),
    new Wall(vec2.fromValues(1, 0), -0.5 * window.innerWidth / space.transform.zoom),
];

function step(dt: number) {
    let collision_time = Infinity;
    let collision_bodies: [Ball, Ball | Wall] | null = null;

    let AABBs = balls.map(ball => ball.getAABB(dt));
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (AABBs[i][0][0] > AABBs[j][1][0] || AABBs[i][1][0] < AABBs[j][0][0]) continue;
            if (AABBs[i][0][1] > AABBs[j][1][1] || AABBs[i][1][1] < AABBs[j][0][1]) continue;
            let coll = ball_ball_collision(balls[i], balls[j]);
            if (coll < collision_time) {
                collision_bodies = [balls[i], balls[j]];
                collision_time = coll;
            }
        }
    }
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < walls.length; j++) {
            if (!walls[j].intersectsAABB(AABBs[i])) continue;
            let coll = ball_wall_collision(balls[i], walls[j]);
            if (coll < collision_time) {
                collision_bodies = [balls[i], walls[j]];
                collision_time = coll;
            }
        }
    }

    let safe_dt = Math.min(collision_time, dt);
    balls.forEach(ball => ball.step(safe_dt));
    if (safe_dt === dt) return;

    if (collision_bodies[1] instanceof Ball) {
        resolve_ball_ball_collision(collision_bodies[0], collision_bodies[1]);
    } else {
        resolve_ball_wall_collision(collision_bodies[0], collision_bodies[1]);
    }
    step(dt - safe_dt);
}

let last_frame = 0;
function render(timestamp: number) {
    space.clearScreen();
    balls.forEach(ball => ball.render(space));
    walls.forEach(wall => wall.render(space));

    step(Math.min(1000, timestamp - last_frame) / 1000);

    last_frame = timestamp;
    requestAnimationFrame(render);
}
requestAnimationFrame(timestamp => {
    last_frame = timestamp;
    requestAnimationFrame(render);
});
