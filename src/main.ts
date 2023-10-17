import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Julian's game";

const start = 0;
const maxCanvasWidth = 256;
const maxCanvasHeight = 256;

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
ctx!.fillRect(start, start, maxCanvasWidth, maxCanvasHeight);

app.append(document.createElement("br"));

interface Pair {
  x: number;
  y: number;
}
const cursor = { active: false, x: start, y: start };

const strokes: StrokeCmd[] = [];
let currCmd: StrokeCmd;
const redoStrokes: StrokeCmd[] = [];

const drawing = new EventTarget();

function notify(name: string) {
  drawing.dispatchEvent(new Event(name));
}

class StrokeCmd {
  coords: Pair[];

  constructor(x: number, y: number) {
    this.coords = [{ x, y }];
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    const { x, y } = this.coords[start];
    ctx.moveTo(x, y);
    for (const { x, y } of this.coords) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  currCmd = new StrokeCmd(e.offsetX, e.offsetY);
  strokes.push(currCmd);
  redoStrokes.splice(start, redoStrokes.length);
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    currCmd.coords.push({ x: e.offsetX, y: e.offsetY });
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseleave", (e) => {
  console.log(e);
  cursor.active = false;
  notify("drawing-changed");
});

canvas.addEventListener("mouseup", (e) => {
  console.log(e);
  cursor.active = false;
  notify("drawing-changed");
});

drawing.addEventListener("drawing-changed", (e) => {
  console.log(e);
  redraw();
});

const clearBtn = document.createElement("button");
clearBtn.innerHTML = "Clear";
app.append(clearBtn);

clearBtn.addEventListener("click", (e) => {
  console.log(e);
  strokes.splice(start, strokes.length);
  notify("drawing-changed");
});

const undoBtn = document.createElement("button");
undoBtn.innerHTML = "Undo";
app.append(undoBtn);

undoBtn.addEventListener("click", (e) => {
  console.log(e);
  if (strokes.length > start) {
    redoStrokes.push(strokes.pop()!);
    notify("drawing-changed");
  }
});

const redoBtn = document.createElement("button");
redoBtn.innerHTML = "Redo";
app.append(redoBtn);

redoBtn.addEventListener("click", (e) => {
  console.log(e);
  if (redoStrokes.length > start) {
    strokes.push(redoStrokes.pop()!);
    notify("drawing-changed");
  }
});

function redraw() {
  ctx?.clearRect(start, start, canvas.width, canvas.height);
  strokes.forEach((cmd) => cmd.display(ctx!));
}
