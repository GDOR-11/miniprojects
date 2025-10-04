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
    let coll = -(b + Math.sqrt(b * b - a * c)) / a;
    if (coll < -DELTA || isNaN(coll)) return Infinity;
    let dx_coll = vec2.sub(vec2.create(),
        A.getPosition(vec2.create(), coll),
        B.getPosition(vec2.create(), coll)
    );
    let dv_coll = vec2.sub(vec2.create(),
        vec2.scaleAndAdd(vec2.create(), A.vel, G, coll),
        vec2.scaleAndAdd(vec2.create(), B.vel, G, coll)
    );
    if (vec2.dot(dx_coll, dv_coll) > 0) return Infinity;
    return coll;
}

export function ball_wall_collision(ball: Ball, wall: Wall): number {
    let collision = Infinity;
    for (let signs of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        let a = vec2.dot(wall.A, G);
        let b = vec2.dot(wall.A, ball.vel);
        let c = vec2.dot(wall.A, ball.pos) - wall.B + signs[0] * ball.radius * vec2.len(wall.A);
        let coll = Math.abs(a) < DELTA ? -c / b : (-b + signs[1] * Math.sqrt(b * b - 2 * a * c)) / a;
        if (coll < -DELTA || isNaN(coll)) continue;
        if (collision <= coll) continue;
        let p = ball.getPosition(vec2.create(), coll);
        let v = vec2.scaleAndAdd(vec2.create(), ball.vel, G, coll);
        if (vec2.dot(v, wall.A) * (vec2.dot(p, wall.A) - wall.B) > 0) continue;
        collision = coll;
    }
    return collision;
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
