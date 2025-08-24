import { Vector } from "vecti";
import Minefield from "./minefield";
import { TileState } from "./tile";
import { neighborhood } from "./utils";

export async function brainlessSolver(minefield: Minefield, on_update: () => Promise<any>) {
    let queue = [new Vector(0, 0)];
    let on_new_information = async (pos: Vector) => {
        for (let neighbor of neighborhood(pos).concat([pos])) {
            if (queue.find(p => p.x === neighbor.x && p.y === neighbor.y) !== undefined) continue;
            queue.push(neighbor);
        }
        await on_update();
    }
    while (queue.length > 0) {
        let pos = queue[0];
        if (minefield.getTileState(pos) !== TileState.Revealed || minefield.getNeighborMineCount(pos) !== 0) {
            queue.shift();
            continue;
        }
        for (let neighbor of neighborhood(pos)) {
            if (minefield.getTileState(neighbor) !== TileState.Unknown) continue;
            minefield.setTileState(neighbor, TileState.Revealed);
            await on_new_information(neighbor);
        }
        queue.shift();
    }
}

export async function trivialSolver(minefield: Minefield, on_update: () => Promise<any>) {
    let queue = [];
    let on_new_information = async (pos: Vector) => {
        for (let neighbor of neighborhood(pos).concat([pos])) {
            if (queue.find(p => p.x === neighbor.x && p.y === neighbor.y) !== undefined) continue;
            queue.push(neighbor);
        }
        await on_update();
    }
    while (queue.length > 0) {
        let pos = queue[0];
        if (minefield.getTileState(pos) !== TileState.Revealed) {
            queue.shift();
            continue;
        }
        let unknown_count = 0;
        let flag_count = 0;
        for (let neighbor of neighborhood(pos)) {
            let state = minefield.getTileState(neighbor);
            if (state === TileState.Unknown) unknown_count++;
            if (state === TileState.Flagged) flag_count++;
        }
        let mine_count = minefield.getNeighborMineCount(pos);
        if (unknown_count === mine_count - flag_count) {
            for (let neighbor of neighborhood(pos)) {
                let state = minefield.getTileState(neighbor);
                if (state === TileState.Unknown) {
                    minefield.setTileState(neighbor, TileState.Flagged);
                    await on_new_information(neighbor);
                }
            }
        }
        if (flag_count === mine_count) {
            for (let neighbor of neighborhood(pos)) {
                let state = minefield.getTileState(neighbor);
                if (state === TileState.Unknown) {
                    minefield.setTileState(neighbor, TileState.Revealed);
                    await on_new_information(neighbor);
                }
            }
        }
        queue.shift();
    }
}

export async function bestStrategy(minefield: Minefield, on_update: () => Promise<any>) {
    let updated = false;
    let update = async () => {
        updated = true;
        await on_update();
    };
    while(updated) {
        updated = false;
        trivialSolver();
    }
}
