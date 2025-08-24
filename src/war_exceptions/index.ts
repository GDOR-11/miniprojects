import "./index.css";
import { Vector } from "vecti";
import data from "./data1000x10";

let points = data.map(arr => new Vector(...arr));
let r = 1;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

function draw_points(points: Vector[], color: string = "white", radius: number = 5) {
    ctx.fillStyle = color;
    for (let point of points) {
        ctx.fillRect(point.x, point.y, 2 * radius, 2 * radius);
    }
}

function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    draw_points(points, "#ffffffff", r / 2);
}

let pointers: { [id: number]: Vector } = {};
window.onpointerdown = e => {
    let pointer = new Vector(e.x, e.y);
    pointers[e.pointerId] = pointer;
};
window.onpointerup = e => {
    delete pointers[e.pointerId];
}
window.onpointermove = e => {
    let pointer = new Vector(e.x, e.y);
    switch (Object.keys(pointers).length) {
        case 1:
            pointers[e.pointerId] = pointer;
            for (let i = 0; i < points.length; i++) {
                points[i] = points[i].add(new Vector(e.movementX, e.movementY));
            }
            break;
        case 2:
            let moved_pointer = pointers[e.pointerId];
            let anchor_pointer = Object.values(pointers)[1 - Object.keys(pointers).indexOf(e.pointerId + "")];
            let initial_displacement = moved_pointer.subtract(anchor_pointer);
            let new_displacement = pointer.subtract(anchor_pointer);
            let center = moved_pointer.add(anchor_pointer).multiply(0.5);
            let scale = new_displacement.length() / initial_displacement.length();
            let shift = new_displacement.subtract(initial_displacement).multiply(0.5);
            for (let i = 0; i < points.length; i++) {
                points[i] = points[i].subtract(center).multiply(scale).add(center).add(shift);
            }
            r *= scale;
            pointers[e.pointerId] = pointer;
            break;
    }
    render();
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
};
window.onresize = resize;
resize();
