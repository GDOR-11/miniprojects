import heart_url from "./heart.png";

export function double_slit(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white"
    ctx.fillRect((ctx.canvas.width >> 1) - 10, ctx.canvas.height >> 1, 1, 1);
    ctx.fillRect((ctx.canvas.width >> 1) + 10, ctx.canvas.height >> 1, 1, 1);
}

export function wide_double_slit(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect((ctx.canvas.width >> 1) - 60, ctx.canvas.height >> 1, 20, 1);
    ctx.fillRect((ctx.canvas.width >> 1) + 40, ctx.canvas.height >> 1, 20, 1);
}

export function disk(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 10, 0, 2 * Math.PI);
    ctx.fill();
}

export function circumferences(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    ctx.fillRect(ctx.canvas.width >> 1, ctx.canvas.height >> 1, 1, 1);
    for (let r = 10; r <= 50; r += 10) {
        ctx.beginPath();
        ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

export function heart(ctx: CanvasRenderingContext2D) {
    const img = document.createElement("img");
    img.src = heart_url;
    ctx.drawImage(img, ctx.canvas.width / 2 - 10, ctx.canvas.height / 2 - 10, 20, 20);
}

export function square(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.fillRect(ctx.canvas.width / 2 - 10, ctx.canvas.height / 2 - 10, 20, 20);
}
