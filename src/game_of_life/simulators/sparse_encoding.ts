let grid = new Map<number, Set<number>>();

export function getCellState(x: number, y: number): boolean {
    return grid.get(x)?.has?.(y) ?? false;
}
export function setCellState(x: number, y: number, alive: boolean) {
    let col = grid.get(x);
    if (col === undefined) {
        col = new Set<number>();
        grid.set(x, col);
    }
    if (alive) col.add(y); else col.delete(y);
}
export function clearGrid() {
    grid.clear();
}

export function forEachAliveCell(f: (x: number, y: number) => any) {
    for (let [x, set] of grid) {
        for (let y of set) {
            f(x, y);
        }
    }
}

export function step(generations: number) {
    for (let i = 0; i < generations; i++) {
        single_step();
    }
}

function single_step() {
    let next_grid = new Map<number, Set<number>>();

    // all cells that will potentially be alive next iteration
    for (let [x, set] of grid) {
        for (let y of set) {
            for (let i = -1; i <= 1; i++) {
                let col = next_grid.get(x + i);
                if (col === undefined) {
                    col = new Set<number>();
                    next_grid.set(x + i, col);
                }
                col.add(y - 1);
                col.add(y);
                col.add(y + 1);
            }
        }
    }

    // prune down all of the ones that aren't actually alive
    for (let [x, set] of next_grid) {
        for (let y of set) {
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
                let col = grid.get(x + i);
                if (col === undefined) continue;
                neighbors += col.has(y - 1) ? 1 : 0;
                neighbors += col.has(y) ? 1 : 0;
                neighbors += col.has(y + 1) ? 1 : 0;
            }
            if (neighbors < 3 || neighbors > 4) next_grid.get(x).delete(y);
            if (neighbors === 4 && !grid.get(x)?.has?.(y)) next_grid.get(x).delete(y);
        }
    }

    grid = next_grid;
}
