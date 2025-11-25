import { vec2, vec4 } from 'gl-matrix';
import RenderSpace from 'movable-render-space';
import { GM, gravity } from '.';

export default class Mass {
    constructor(public pos: vec2, public vel: vec2, public mass: number = 1, public color: string = "black") { }

    render(space: RenderSpace) {
        space.ctx.fillStyle = this.color;
        space.ctx.beginPath();
        space.ctx.arc(this.pos[0], this.pos[1], 0.01 * Math.cbrt(this.mass), 0, 2 * Math.PI);
        space.ctx.fill();
    }

    // RK4 integration
    step(dt: number) {
        const f = (y: vec4) => {
            const g = gravity(vec2.fromValues(y[0], y[1]));
            return vec4.fromValues(y[2], y[3], g[0], g[1]);
        };
        let y = vec4.fromValues(this.pos[0], this.pos[1], this.vel[0], this.vel[1]);
        let k1 = f(y);
        let k2 = f(vec4.add(vec4.create(), y, vec4.scale(vec4.create(), k1, dt / 2)));
        let k3 = f(vec4.add(vec4.create(), y, vec4.scale(vec4.create(), k2, dt / 2)));
        let k4 = f(vec4.add(vec4.create(), y, vec4.scale(vec4.create(), k3, dt)));
        vec4.scale(k1, k1, dt / 6);
        vec4.scale(k2, k2, dt / 3);
        vec4.scale(k3, k3, dt / 3);
        vec4.scale(k4, k4, dt / 6);
        vec4.add(y, y, vec4.add(
            vec4.create(),
            vec4.add(vec4.create(), k1, k2),
            vec4.add(vec4.create(), k3, k4)
        ));
        this.pos = vec2.fromValues(y[0], y[1]);
        this.vel = vec2.fromValues(y[2], y[3]);
    }

    getTrajectory(da: number = 0.001): vec2[] {
        const h = this.pos[0] * this.vel[1] - this.pos[1] * this.vel[0]; // specific angular momentum
        const e = vec2.subtract(vec2.create(),
            vec2.fromValues(h * this.vel[1] / GM, -h * this.vel[0] / GM),
            vec2.normalize(vec2.create(), this.pos)
        ); // eccentricity vector
        const l = h * h / GM; // semi-latus rectum

        let points: vec2[] = [];
        for (let a = -Math.PI; a < Math.PI; a += da) {
            const r = l / (1 + vec2.len(e) * Math.cos(a - Math.atan2(e[1], e[0])));
            if (r < 0) continue;
            points.push(vec2.fromValues(r * Math.cos(a), r * Math.sin(a)));
        }
        return points;
    }

    renderTrajectory(space: RenderSpace) {
        const points = this.getTrajectory();

        space.ctx.strokeStyle = this.color;
        space.ctx.lineWidth = 1 / space.transform.zoom;
        space.ctx.beginPath();
        space.ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            space.ctx.lineTo(points[i][0], points[i][1]);
        }
        space.ctx.stroke();
    }
}
