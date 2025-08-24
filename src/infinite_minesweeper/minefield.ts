import { Vector } from "vecti";
import Tile, { TileState } from "./tile";
import { screen2world_round, view_zoom, world2screen } from "./screen_view";
import { neighborhood } from "./utils";

export default class Minefield {
    /** top left */ a: Vector;
    /** bottom right */ b: Vector;

    field: { [x: number]: { [y: number]: Tile } };

    constructor() {
        this.a = new Vector(-1, -1);
        this.b = new Vector(1, 1);
        this.field = { [-1]: {}, 0: {}, 1: {} };
        for (let pos of neighborhood(new Vector(0, 0))) {
            this.field[pos.x][pos.y] = new Tile(TileState.Unknown, false);
        }
        this.field[0][0] = new Tile(TileState.Revealed, false);
    }

    getTile(coordinate: Vector): Tile | undefined {
        return this.field?.[coordinate.x]?.[coordinate.y];
    }

    getTileState(coordinate: Vector): TileState {
        return this.getTile(coordinate)?.state || TileState.Unknown;
    }

    getNeighborMineCount(coordinate: Vector): number {
        let count = 0;
        for (let neighbor of neighborhood(coordinate)) {
            count += this.getTile(neighbor)?.mine ? 1 : 0;
        }
        return count;
    }

    getOuterBorderTiles(): Vector[] {
        let queue = (() => {
            let pos = new Vector(0, this.a.y);
            while (this.getTile(pos).state !== TileState.Revealed) pos = new Vector(0, pos.y + 1);
            return [pos];
        })();
        let tiles = queue.slice();
        let is_border_tile = (pos: Vector) => neighborhood(pos).find(neighbor => this.getTileState(neighbor) === TileState.Unknown) !== undefined;
        while (queue.length > 0) {
            
        }
    }

    expandField(left: number, right: number, top: number, bottom: number) {
        this.a = this.a.subtract(new Vector(left, top));
        this.b = this.b.add(new Vector(right, bottom));
        for (let x = this.a.x; x <= this.b.x; x++) {
            this.field[x] ??= {};
            for (let y = this.a.y; y <= this.b.y; y++) {
                this.field[x][y] ??= new Tile();
            }
        }
    }

    expandToTile(coordinate: Vector) {
        if (coordinate.x - 1 < this.a.x) this.expandField(1 + this.a.x - coordinate.x, 0, 0, 0);
        if (coordinate.x + 1 > this.b.x) this.expandField(0, 1 + coordinate.x - this.b.x, 0, 0);
        if (coordinate.y - 1 < this.a.y) this.expandField(0, 0, 1 + this.a.y - coordinate.y, 0);
        if (coordinate.y + 1 > this.b.y) this.expandField(0, 0, 0, 1 + coordinate.y - this.b.y);
    }

    setTileState(coordinate: Vector, state: TileState): Tile {
        this.expandToTile(coordinate);
        let tile = this.getTile(coordinate);
        if (tile === null) throw "what the fuck";
        tile.state = state;
        return tile;
    }

    detailed_render(ctx: CanvasRenderingContext2D) {
        let A = screen2world_round(new Vector(0, 0));
        let B = screen2world_round(new Vector(window.innerWidth, window.innerHeight));

        ctx.strokeStyle = "grey";
        for (let x = A.x - 0.5; x <= B.x + 0.5; x++) {
            let screen_x = world2screen(new Vector(x, 0)).x;
            ctx.beginPath();
            ctx.moveTo(screen_x, 0);
            ctx.lineTo(screen_x, window.innerHeight);
            ctx.stroke();
        }
        for (let y = A.y - 0.5; y <= B.y + 0.5; y++) {
            let screen_y = world2screen(new Vector(0, y)).y;
            ctx.beginPath();
            ctx.moveTo(0, screen_y);
            ctx.lineTo(window.innerWidth, screen_y);
            ctx.stroke();
        }

        const text_size = 0.75;

        for (let x = A.x; x <= B.x; x++) {
            for (let y = A.y; y <= B.y; y++) {
                let pos = new Vector(x, y);
                let pixel = world2screen(pos);

                let text = "";
                switch (this.getTileState(pos)) {
                    case TileState.Flagged:
                        ctx.fillStyle = "blue";
                        text = "F";
                        break;
                    case TileState.Revealed:
                        let mine = this.getTile(pos).mine;
                        ctx.fillStyle = mine ? "red" : "white";
                        text = mine ? "M" : this.getNeighborMineCount(pos).toString();
                        break;
                }
                if (text === "") continue;

                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.font = world2screen(text_size) + "px monospace";
                ctx.fillText(text, pixel.x, pixel.y - world2screen(7 * text_size / 16));
            }
        }
    }

    simple_render(ctx: CanvasRenderingContext2D) {
        let tile_sidelength = world2screen(1);
        for (let i in this.field) {
            let x = Number(i);
            let row = this.field[x];
            for (let j in row) {
                let y = Number(j);
                let tile = row[y];
                if (tile.state === TileState.Unknown) continue;

                let screen = world2screen(new Vector(x, y));
                if (screen.x < -10) break;
                if (screen.x > window.innerWidth + 10) break;
                if (screen.y < -10) continue;
                if (screen.y > window.innerHeight + 10) continue;

                if (tile.state === TileState.Flagged) ctx.fillStyle = "blue";
                if (tile.state === TileState.Revealed) ctx.fillStyle = tile.mine ? "red" : "white";

                ctx.fillRect(screen.x - tile_sidelength / 2, screen.y - tile_sidelength / 2, tile_sidelength, tile_sidelength);
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        if (view_zoom > 10) {
            this.detailed_render(ctx);
        } else {
            this.simple_render(ctx);
        }
    }
}
