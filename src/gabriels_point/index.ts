import "./index.css";
import Decimal from "decimal.js";
import Point from "./point";

Decimal.config({ precision: 32 });

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

let A: Point = new Point(100, window.innerHeight / 2);
let B: Point = new Point(window.innerWidth / 2, window.innerHeight / 2).minus(new Point(0, window.innerWidth - 200).times(new Decimal(3).sqrt().div(2)));
let C: Point = new Point(window.innerWidth - 100, window.innerHeight / 2);

function project(P: Point, A: Point, B: Point): Point {
    let p = P.minus(A);
    let b = B.minus(A);
    let mult = p.dot(b).div(b.lenSq());
    return A.plus(b.times(mult));
}
function orthic_triangle(A: Point, B: Point, C: Point): [Point, Point, Point] {
    return [
        project(A, B, C),
        project(B, A, C),
        project(C, A, B)
    ];
}
function draw_points(points: Point[], color: string = "white", radius: number = 5) {
    ctx.fillStyle = color;
    for (let point of points) {
        ctx.beginPath();
        ctx.arc(point.x.toNumber(), point.y.toNumber(), radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}
function draw_polygon(points: Point[], fill_color: string = "white", border_color: string = "white", border_width: number = 5) {
    if (points.filter(point => point.lenSq().lt(1e10)).length == 0) return;

    ctx.fillStyle = fill_color;
    ctx.strokeStyle = border_color;
    ctx.lineWidth = border_width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x.toNumber(), points[0].y.toNumber());
    for (let point of points) {
        ctx.lineTo(point.x.toNumber(), point.y.toNumber());
    }
    ctx.lineTo(points[0].x.toNumber(), points[0].y.toNumber());
    ctx.fill();
    ctx.stroke();
}

function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let [a, b, c] = [A, B, C];
    for (let i = 0; i < 100; i++) {
        [a, b, c] = orthic_triangle(a, b, c);
        draw_polygon([a, b, c], "#ffffff11", "#666666ff", 2);
    }
    draw_polygon([A, B, C], "#ffffff11", "#ffffffff", 5);
    draw_points([a, b, c], "#ccccccff", 4);
}

let selected_point: Point | null = null;
let pointers: { [id: number]: Point } = {};
window.onpointerdown = e => {
    let pointer = new Point(e.x, e.y);
    pointers[e.pointerId] = pointer;
    if (Object.keys(pointers).length > 1) {
        selected_point = null;
        return;
    }

    let is_selected = (p: Point) => p.minus(pointer).len().lt(20);

    selected_point = null;
    if (is_selected(A)) selected_point = A;
    if (is_selected(B)) selected_point = B;
    if (is_selected(C)) selected_point = C;
};
window.onpointerup = e => {
    delete pointers[e.pointerId];
    selected_point = null;
}
window.onpointermove = e => {
    let pointer = new Point(e.x, e.y);
    switch (Object.keys(pointers).length) {
        case 1:
            pointers[e.pointerId] = pointer;
            if (selected_point === null) return;
            selected_point.set(pointer);
            break;
        case 2:
            let moved_pointer = pointers[e.pointerId];
            let anchor_pointer = Object.values(pointers)[1 - Object.keys(pointers).indexOf(e.pointerId + "")];
            let initial_displacement = moved_pointer.minus(anchor_pointer);
            let new_displacement = pointer.minus(anchor_pointer);
            let center = moved_pointer.plus(anchor_pointer).times(0.5);
            let scale = new_displacement.len().div(initial_displacement.len());
            let shift = new_displacement.minus(initial_displacement).times(0.5);
            let transform = (p: Point) => {
                p.set(p.minus(center).times(scale).plus(center).plus(shift));
            };
            transform(A);
            transform(B);
            transform(C);
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
