import "./index.css";
import * as patterns from "./patterns";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

patterns.disk(ctx);
await new Promise(r => setTimeout(r, 1000));
const pattern = ctx.getImageData(0, 0, canvas.width, canvas.height);
const distance = 100;
const lambda = 5;
const scale = 1e5;

const E = new Float32Array(canvas.width * canvas.height);
const B = new Float32Array(canvas.width * canvas.height);

let I0 = 1;
const adaptable_I0 = true;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
let imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);

let total = 0;
for (let i = 0; i < pattern.data.length / 4; i++) {
    let transparency = pattern.data[4 * i + 3];
    if (transparency !== 0) total++;
}

let count = 0;
for (let i = 0; i < pattern.data.length / 4; i++) {
    let transparency = pattern.data[4 * i + 3];
    if (transparency === 0) continue;
    count++;
    let a = i % pattern.width;
    let b = Math.floor(i / pattern.width);
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            let dist = Math.hypot(distance, x - canvas.width / 2 + a / scale, y - canvas.height / 2 + b / scale);
            E[x + y * canvas.width] += transparency * Math.cos(2 * Math.PI * scale * dist / lambda);
            B[x + y * canvas.width] += transparency * Math.sin(2 * Math.PI * scale * dist / lambda);
        }
    }
    if (i % 10 === 0) {
        let max = 0;
        for (let j = 0; j < E.length; j++) {
            let I = (E[j] * E[j] + B[j] * B[j]) / 255;
            let rgb = I <= 0.003108 ? 12.92 * I : Math.pow(I, 1 / 2.4) * 1.055 - 0.055;
            imagedata.data[4 * j + 3] = I0 * rgb;
            if (rgb > max) max = rgb;
        }
        if (adaptable_I0) I0 = 255 / max;
        ctx.putImageData(imagedata, 0, 0);
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, canvas.width * (1 - count / total), 10);
        await new Promise(r => setTimeout(r, 0));
    }
}
for (let j = 0; j < E.length; j++) {
    let I = (E[j] * E[j] + B[j] * B[j]) / 255;
    let rgb = I <= 0.003108 ? 12.92 * I : Math.pow(I, 1 / 2.4) * 1.055 - 0.055;
    imagedata.data[4 * j + 3] = I0 * rgb;
}
ctx.putImageData(imagedata, 0, 0);
alert("done");
