import { Vector } from "vecti";

export function neighborhood(center: Vector): Vector[] {
    let neighborhood = [];
    for (let x = center.x - 1; x <= center.x + 1; x++) {
        for (let y = center.y - 1; y <= center.y + 1; y++) {
            if (x === center.x && y === center.y) continue;
            neighborhood.push(new Vector(x, y));
        }
    }
    return neighborhood;
}
