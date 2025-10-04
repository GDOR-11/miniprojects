import { vec2 } from "gl-matrix";
import { G } from ".";
import RenderSpace from "movable-render-space";

export default class Ball {
    radius: number;
    pos: vec2;
    vel: vec2;
    mass: number;
    color: string;

    constructor(
        radius: number,
        pos: vec2 = vec2.fromValues(0, 0),
        vel: vec2 = vec2.fromValues(0, 0),
        mass: number = 1,
        color: string = "white"
    ) {
        this.radius = radius;
        this.pos = pos;
        this.vel = vel;
        this.mass = mass;
        this.color = color;
    }

    getPosition(out: vec2, dt: number): vec2 {
        vec2.scaleAndAdd(out, this.pos, this.vel, dt);
        vec2.scaleAndAdd(out, out, G, dt * dt / 2);
        return out;
    }
    step(dt: number) {
        this.getPosition(this.pos, dt);
        vec2.scaleAndAdd(this.vel, this.vel, G, dt);
    }

    getAABB(dt: number): [vec2, vec2] {
        let p0 = this.pos;
        let p1 = this.getPosition(vec2.create(), dt);

        let aabb: [vec2, vec2] = [
            vec2.fromValues(
                Math.min(p0[0], p1[0]),
                Math.min(p0[1], p1[1])
            ),
            vec2.fromValues(
                Math.max(p0[0], p1[0]),
                Math.max(p0[1], p1[1])
            ),
        ];

        let v = vec2.fromValues(
            -this.vel[0] / G[0],
            -this.vel[1] / G[1]
        );

        if (0 <= v[0] && v[0] <= dt) {
            let p = this.pos[0] - this.vel[0] ** 2 / (2 * G[0]);
            if (G[0] > 0) aabb[0][0] = p;
            else if (G[0] < 0) aabb[1][0] = p;
        }
        if (0 <= v[1] && v[1] <= dt) {
            let p = this.pos[1] - this.vel[1] ** 2 / (2 * G[1]);
            if (G[1] > 0) aabb[0][1] = p;
            else if (G[1] < 0) aabb[1][1] = p;
        }

        aabb[0][0] -= this.radius;
        aabb[0][1] -= this.radius;
        aabb[1][0] += this.radius;
        aabb[1][1] += this.radius;

        return aabb;
    }

    render({ ctx }: RenderSpace) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}
