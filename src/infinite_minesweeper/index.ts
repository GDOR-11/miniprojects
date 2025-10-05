import { Vector } from "vecti";
import "./index.css";
import Minefield from "./minefield";
import { screen2world, screen2world_round, setViewCenter, setViewZoom, view_center, view_zoom } from "./screen_view";
import { TileState } from "./tile";
import { brainlessSolver, trivialSolver } from "./solvers";

export const difficulty = Number(prompt("difficulty [0-1]"));

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

let minefield = new Minefield();

function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    minefield.render(ctx);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.onresize = resize;
resize();

function click(coordinate: Vector) {
    switch (minefield.getTileState(coordinate)) {
        case TileState.Unknown:
            minefield.setTileState(coordinate, TileState.Revealed);
            break;
        case TileState.Flagged:
            break;
        case TileState.Revealed:
            break;
    }
}
function long_press(coordinate: Vector) {
    switch (minefield.getTileState(coordinate)) {
        case TileState.Unknown:
            minefield.setTileState(coordinate, TileState.Flagged);
            break;
        case TileState.Flagged:
            minefield.setTileState(coordinate, TileState.Unknown);
            break;
        case TileState.Revealed:
            break;
    }
}

type Pointer = {
    last_pos: Vector,
    total_distance: number,
    /** Date.now() when the pointer was pressed */
    pressed: number
};

let pointers: { [pointerId: number]: Pointer } = {};

window.onpointerdown = event => {
    pointers[event.pointerId] = {
        last_pos: new Vector(event.x, event.y),
        total_distance: 0,
        pressed: Date.now()
    };
    // setTimeout(() => {
    //     if (pointers[event.pointerId]?.total_distance < 10 && Object.keys(pointers).length === 1) {
    //         let pos = pointers[event.pointerId].last_pos;
    //         let coordinates = screen2world_round(pos);
    //         long_press(coordinates);
    //         render();
    //     }
    // }, 125);
}
window.onpointermove = event => {
    let moved_pointer = pointers[event.pointerId];
    let pos = new Vector(event.x, event.y);
    let last_pos = moved_pointer.last_pos;
    moved_pointer.total_distance += pos.subtract(moved_pointer.last_pos).length();
    moved_pointer.last_pos = pos;

    if (moved_pointer.total_distance < 10) return;
    switch (Object.keys(pointers).length) {
        case 1:
            let movement = new Vector(screen2world(event.movementX), screen2world(event.movementY));
            setViewCenter(view_center.subtract(movement));
            break;
        case 2:
            let anchor_id = parseInt(Object.keys(pointers).filter(id => id !== event.pointerId + "")[0]);
            let anchor_pointer = pointers[anchor_id];
            let center_movement = screen2world(pos).subtract(screen2world(last_pos)).divide(2);
            let amplification = pos.subtract(anchor_pointer.last_pos).length() / last_pos.subtract(anchor_pointer.last_pos).length();
            setViewCenter(view_center.subtract(center_movement));
            setViewZoom(view_zoom * amplification);
            break;
    }
    // we could render, but since rendering is so expensive we don't do that in here
    // render();
}
window.onpointerup = event => {
    // let pointer = pointers[event.pointerId];
    // if (pointer.total_distance < 10) {
    //     let coordinates = screen2world_round(pointer.last_pos);
    //     if (Date.now() - pointer.pressed < 125) {
    //         click(coordinates);
    //     }
    //     render();
    // }
    delete pointers[event.pointerId];
};

while (true) {
    minefield = new Minefield();
    let last_update = performance.now();
    await trivialSolver(minefield, async () => {
        if (performance.now() - last_update > 100) {
            render();
            await new Promise(r => setTimeout(r, 1));
            last_update = performance.now();
        }
    });
    render();
    await new Promise(r => setTimeout(r, 1));
}
