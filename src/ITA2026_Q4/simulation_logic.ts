import RenderSpace from "movable-render-space";
import Mass from "./mass";
import { dt } from "./index";
import { vec2 } from "gl-matrix";

abstract class State {
    abstract tick(space: RenderSpace, tick_time: number): void;
}

export class BeforeSeparationState extends State {
    constructor(
        public m: Mass = new Mass(vec2.fromValues(0.5, 0), vec2.fromValues(0, -0.09), 1, "red")
    ) { super(); }

    tick(space: RenderSpace, tick_time: number): void {
        tick_time = Math.min(tick_time, 0.01);

        space.clearScreen();

        space.ctx.fillStyle = "rgb(224, 224, 0)";
        space.ctx.beginPath();
        space.ctx.arc(0, 0, 0.04, 0, 2 * Math.PI);
        space.ctx.fill();

        let start = performance.now();
        for (let i = 0; i < tick_time / dt && performance.now() - start < 100; i++) {
            if (tick_time / dt - i < 1) {
                this.m.step(tick_time - i * dt);
            } else {
                this.m.step(dt);
            }
        }

        this.m.render(space);
        this.m.renderTrajectory(space);
    }
}

export class AfterSeparationState extends State {
    last_CM: vec2 | null = null;
    CM_trajectory_ctx: CanvasRenderingContext2D = (document.getElementById("trajectory-canvas") as HTMLCanvasElement).getContext("2d");

    constructor(public m1: Mass, public m2: Mass) { super(); }

    tick(space: RenderSpace, tick_time: number): void {
        tick_time = Math.min(tick_time, 0.1);

        space.clearScreen();

        space.ctx.fillStyle = "rgb(224, 224, 0)";
        space.ctx.beginPath();
        space.ctx.arc(0, 0, 0.04, 0, 2 * Math.PI);
        space.ctx.fill();

        for (let i = 0; i < tick_time / dt; i++) {
            if (tick_time / dt - i < 1) {
                this.m1.step(tick_time - i * dt);
                this.m2.step(tick_time - i * dt);
            } else {
                this.m1.step(dt);
                this.m2.step(dt);
            }
        }

        this.m1.render(space);
        this.m1.renderTrajectory(space);
        this.m2.render(space);
        this.m2.renderTrajectory(space);

        const M = this.m1.mass + this.m2.mass;
        const CM = vec2.add(vec2.create(),
            vec2.scale(vec2.create(), this.m1.pos, this.m1.mass / M),
            vec2.scale(vec2.create(), this.m2.pos, this.m2.mass / M)
        );

        space.ctx.fillStyle = "black";
        space.ctx.beginPath();
        space.ctx.arc(CM[0], CM[1], 0.005, 0, 2 * Math.PI);
        space.ctx.fill();

        this.CM_trajectory_ctx.strokeStyle = "black";
        this.CM_trajectory_ctx.lineWidth = 1;
        let p1 = space.renderSpaceToScreen(this.last_CM ? vec2.clone(this.last_CM) : vec2.clone(CM));
        let p2 = space.renderSpaceToScreen(vec2.clone(CM));
        this.CM_trajectory_ctx.beginPath();
        this.CM_trajectory_ctx.moveTo(p1[0], p1[1]);
        this.CM_trajectory_ctx.lineTo(p2[0], p2[1]);
        this.CM_trajectory_ctx.stroke();

        this.last_CM = CM;
    }
}

export type SimulationState = BeforeSeparationState | AfterSeparationState;
