import { DELTA, G } from ".";
import Ball from "./ball";
import { vec2 } from "gl-matrix";
import Wall from "./wall";

export function ball_ball_collision(A: Ball, B: Ball): number {
    let dx = vec2.sub(vec2.create(), A.pos, B.pos);
    let dv = vec2.sub(vec2.create(), A.vel, B.vel);
    let a = vec2.dot(dv, dv);
    let b = vec2.dot(dv, dx);
    let c = vec2.dot(dx, dx) - (A.radius + B.radius) ** 2;
    let d = b * b - a * c;
    if (d < 0) return Infinity;
    let coll = -(b + Math.sqrt(d)) / a;
    if (coll < -DELTA) return Infinity;
    let dx_coll = vec2.scaleAndAdd(vec2.create(), dx, dv, coll);
    if (vec2.dot(dx_coll, dv) > 0) return Infinity;
    return coll;
}

export function ball_wall_collision(ball: Ball, wall: Wall): number {
    let gamma = vec2.dot(wall.A, ball.pos) - wall.B;
    let a = vec2.dot(wall.A, G);
    let b = vec2.dot(wall.A, ball.vel);
    let c = gamma - Math.sign(gamma) * ball.radius * vec2.len(wall.A);
    let d = b * b - 2 * a * c;
    if (d < 0) return Infinity;
    let coll = Math.abs(a) < DELTA ? -c / b : (-b - Math.sign(a * gamma) * Math.sqrt(d)) / a;
    if (coll < -DELTA) return Infinity;
    if ((b + a * coll) * (gamma + b * coll + a * coll * coll / 2) > 0) return Infinity;
    return coll;
}

export function resolve_ball_ball_collision(A: Ball, B: Ball) {
    let dx = vec2.sub(vec2.create(), A.pos, B.pos);
    let dv = vec2.sub(vec2.create(), A.vel, B.vel);

    vec2.scaleAndAdd(A.vel, A.vel, dx,
        -2 * (B.mass / (A.mass + B.mass)) * vec2.dot(dv, dx) / vec2.dot(dx, dx)
    );
    vec2.scaleAndAdd(B.vel, B.vel, dx,
        2 * (A.mass / (A.mass + B.mass)) * vec2.dot(dv, dx) / vec2.dot(dx, dx)
    );
}

export function resolve_ball_wall_collision(ball: Ball, wall: Wall) {
    vec2.scaleAndAdd(ball.vel, ball.vel, wall.A,
        -2 * vec2.dot(ball.vel, wall.A) / vec2.dot(wall.A, wall.A)
    );
}
