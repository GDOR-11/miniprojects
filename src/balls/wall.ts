import { vec2 } from "gl-matrix";
import RenderSpace from "movable-render-space";

/** a wall described by the equation A·(x,y) = B */
export default class Wall {
    A: vec2;
    B: number;

    constructor(A: vec2, B: number) {
        this.A = A;
        this.B = B;
    }

    render(space: RenderSpace) {
        let aabb = space.getScreenAABB();

        let p, q;
        if (Number.isFinite(this.A[0] / this.A[1])) {
            p = vec2.fromValues(
                aabb[0][0],
                (this.B - this.A[0] * aabb[0][0]) / this.A[1]
            );
            q = vec2.fromValues(
                aabb[1][0],
                (this.B - this.A[0] * aabb[1][0]) / this.A[1]
            );
        } else {
            p = vec2.fromValues(
                (this.B - this.A[1] * aabb[0][1]) / this.A[0],
                aabb[0][1]
            );
            q = vec2.fromValues(
                (this.B - this.A[1] * aabb[1][1]) / this.A[0],
                aabb[1][1]
            );
        }

        space.ctx.strokeStyle = "white"
        space.ctx.lineWidth = 1 / space.transform.zoom;
        space.ctx.beginPath();
        space.ctx.moveTo(p[0], p[1]);
        space.ctx.lineTo(q[0], q[1]);
        space.ctx.stroke();
    }
}
