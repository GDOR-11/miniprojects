import "./index.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

ctx.fillStyle = "rgb(255, 255, 255, 1)";
// ctx.fillRect((canvas.width >> 1) - 10, 0, 1, canvas.height);
// ctx.fillRect((canvas.width >> 1) + 10, 0, 1, canvas.height);
ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
ctx.fill();
// ctx.fillRect(canvas.width >> 1, canvas.height >> 1, 1, 1);
await new Promise(r => setTimeout(r, 1000));
// const pattern = new ImageData(canvas.width, canvas.height);
const pattern = ctx.getImageData(0, 0, canvas.width, canvas.height);
const distance = 1000;
const lambda = 1;
const scale = 1e8;

const E = new Float32Array(canvas.width * canvas.height);
const B = new Float32Array(canvas.width * canvas.height);

let I0 = 0.1;
const adaptable_I0 = false;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
let imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);

for (let i = 0; i < pattern.data.length / 4; i++) {
    let transparency = pattern.data[4 * i + 3];
    if (transparency === 0) continue;
    let a = i % pattern.width;
    let b = Math.floor(i / pattern.width);
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            let dist = Math.hypot(distance, x - canvas.width / 2 + a / scale, y - canvas.height / 2 + b / scale);
            E[x + y * canvas.width] += transparency * Math.cos(2 * Math.PI * scale * dist / lambda);
            B[x + y * canvas.width] += transparency * Math.sin(2 * Math.PI * scale * dist / lambda);
        }
    }
    let max = 0;
    for (let j = 0; j < E.length; j++) {
        let I = (E[j] * E[j] + B[j] * B[j]) / 255;
        imagedata.data[4 * j + 3] = I0 * I;
        if (I > max) max = I;
    }
    if (adaptable_I0) I0 = 255 / max;
    ctx.putImageData(imagedata, 0, 0);
    await new Promise(r => setTimeout(r, 0));
}
alert("done");
