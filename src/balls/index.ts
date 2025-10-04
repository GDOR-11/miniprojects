import "./index.css";
import { vec2 } from "gl-matrix";
import RenderSpace from "movable-render-space";
import Ball from "./ball";
import Wall from "./wall";
import { ball_ball_collision, ball_wall_collision, resolve_ball_ball_collision, resolve_ball_wall_collision } from "./collision_detection";

export const G = vec2.fromValues(0, 20);
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

for (let x = -10; x <= 10; x += 4) {
    for (let y = -20; y <= 20; y += 4) {
        balls.push(new Ball(1, vec2.fromValues(x, y), vec2.fromValues(0, 0), 1, `rgb(${255 * Math.random()},${255 * Math.random()},${255 * Math.random()})`));
    }
}
balls[0].pos[0] += 1e-6;

const walls: Wall[] = [
    new Wall(vec2.fromValues(0, 1), 0.5 * window.innerHeight / space.transform.zoom),
    new Wall(vec2.fromValues(0, 1), -0.5 * window.innerHeight / space.transform.zoom),
    new Wall(vec2.fromValues(1, 0), 0.5 * window.innerWidth / space.transform.zoom),
    new Wall(vec2.fromValues(1, 0), -0.5 * window.innerWidth / space.transform.zoom),
];

function step(dt: number) {
    let collision_time = Infinity;
    let collision_bodies: [Ball, Ball | Wall] | null = null;

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let coll = ball_ball_collision(balls[i], balls[j]);
            if (coll < collision_time) {
                collision_bodies = [balls[i], balls[j]];
                collision_time = coll;
            }
        }
    }
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < walls.length; j++) {
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
