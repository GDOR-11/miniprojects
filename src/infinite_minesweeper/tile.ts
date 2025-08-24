import { difficulty } from ".";

export enum TileState {
    Unknown,
    Flagged,
    Revealed
}

export default class Tile {
    state: TileState;
    mine: boolean;

    constructor(state: TileState = TileState.Unknown, mine: boolean = Math.random() < difficulty) {
        this.state = state;
        this.mine = mine;
    }
}
