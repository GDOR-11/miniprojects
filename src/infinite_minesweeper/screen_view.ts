import { Vector } from "vecti";

export let view_center = new Vector(0, 0);
export let view_zoom = 50;

export function setViewCenter(new_center: Vector) {
    view_center = new_center;
}
export function setViewZoom(new_zoom: number) {
    view_zoom = new_zoom;
}

const screen_center = new Vector(window.innerWidth, window.innerHeight).divide(2);

export function world2screen(world: number): number;
export function world2screen(world: Vector): Vector;
export function world2screen(world: number | Vector): number | Vector {
    return typeof world === "number" ? world * view_zoom : world.subtract(view_center).multiply(view_zoom).add(screen_center);
}

export function screen2world(screen: number): number;
export function screen2world(screen: Vector): Vector;
export function screen2world(screen: number | Vector): number | Vector {
    return typeof screen === "number" ? screen / view_zoom : screen.subtract(screen_center).divide(view_zoom).add(view_center);
}

export function screen2world_round(screen: Vector) {
    let world = screen2world(screen);
    return new Vector(Math.round(world.x), Math.round(world.y));
}
