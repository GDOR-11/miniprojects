import { view_center } from ".";
import { setCellState } from "./simulators/sparse_encoding";

export function load(data: string, format: string): boolean {
    switch (format) {
        case "rle":
            load_rle(data);
            return true;
        case "mc":
            load_mc(data);
            return true;
        default:
            return false;
    }
}

function load_rle(rle: string) {
    const lines = rle.split("\n");
    while (lines[0][0] === "#") lines.shift();
    const [_, a, b] = lines.shift().match(/x ?= ?(\d+) ?, ?y ?= ?(\d+)/);
    const [width, height] = [Number(a), Number(b)];

    const pattern = [];
    for (let i = 0; i < height; i++) {
        pattern.push([]);
    }

    let counter = "";
    let row = 0;
    let data = lines.join();
    for (let i = 0; i < data.length; i++) {
        if (data[i] === "!") break;
        if (!isNaN(parseInt(data[i]))) {
            counter += data[i];
            continue;
        }
        for (let j = 0; j < parseInt(counter || "1"); j++) {
            switch (data[i]) {
                case "$":
                    row++;
                    break;
                case "b":
                    pattern[row].push(false);
                    break;
                case "o":
                case "x":
                case "y":
                case "z":
                    pattern[row].push(true);
                    break;
            }
        }
        counter = "";
    }

    const center = view_center();
    const offset_x = Math.round(center[0] - width / 2);
    const offset_y = Math.round(center[1] - height / 2);

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            setCellState(x + offset_x, y + offset_y, pattern[y][x]);
        }
    }
}

function load_mc(data: string) {
    let lines = data.trim().split("\n");
    do {
        lines.shift();
    } while (lines[0][0] === "#");

    function load_node(x: number, y: number, node_num: number) {
        if (node_num === 0) return;
        let node = lines[node_num - 1];
        if (".*$".includes(node[0])) {
            let curr_x = x;
            let curr_y = y;
            for (let char of node) {
                switch (char) {
                    case "*":
                    case ".":
                        setCellState(curr_x, curr_y, char === "*");
                        curr_x++;
                        break;
                    case "$":
                        curr_x = x;
                        curr_y++;
                        break;
                }
            }
        } else {
            let [s, a, b, c, d] = node.split(" ").map(str => Number(str));
            let off = 2 ** (s - 1);
            load_node(x      , y      , a);
            load_node(x + off, y      , b);
            load_node(x      , y + off, c);
            load_node(x + off, y + off, d);
        }
    }

    const size = 2 ** Number(lines[lines.length - 1].split(" ")[0]);
    const center = view_center();
    load_node(center[0] - size / 2, center[1] - size / 2, lines.length);
}
