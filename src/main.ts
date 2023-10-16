import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Julian's game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const appName = "Canvas";

const appTitle = document.createElement("h1");
appTitle.innerHTML = appName;
app.append(appTitle);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
app.append(canvas);

ctx!.fillStyle = "white";
ctx!.fillRect(20, 0, 256, 256);

const clearBtn = document.createElement("button");
clearBtn.innerHTML = "Clear";
app.append(clearBtn);

clearBtn.addEventListener("click", (e) => {
  console.log(e);
  ctx?.clearRect(0, 0, 500, 500);
});

let isDrawing = false;
let x = 0;
let y = 0;

canvas.addEventListener("mousedown", (e) => {
  setOffset(e);
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(ctx!, e);
    setOffset(e);
  }
});

canvas.addEventListener("mouseleave", (e) => {
  if (isDrawing) {
    drawLine(ctx!, e);
    setOffset(e);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(ctx!, e);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function setOffset(e: MouseEvent): void {
  x = e.offsetX;
  y = e.offsetY;
}

function drawLine(ctx: CanvasRenderingContext2D, e: MouseEvent): void {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.moveTo(x, y);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.closePath();
}
