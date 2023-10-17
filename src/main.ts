import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Julian's game";

const zero = 0;
const one = 1;
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
ctx!.fillRect(zero, zero, maxCanvasWidth, maxCanvasHeight);

app.append(document.createElement("br"));

interface Pair {
  x: number;
  y: number;
}
const cursor = { active: false, x: zero, y: zero };

const strokes: Pair[][] = [];
let currStroke: Pair[] = [];
const redoStrokes: Pair[][] = [];

const drawing = new EventTarget();

function notify(name: string) {
  drawing.dispatchEvent(new Event(name));
}

canvas.addEventListener("mousedown", (e) => {
  setOffset(e);
  cursor.active = true;
  currStroke = [];
  strokes.push(currStroke);
  redoStrokes.splice(zero, redoStrokes.length);
  currStroke.push({ x: cursor.x, y: cursor.y });
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    setOffset(e);
    currStroke.push({ x: cursor.x, y: cursor.y });
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
  strokes.splice(zero, strokes.length);
  notify("drawing-changed");
});

const undoBtn = document.createElement("button");
undoBtn.innerHTML = "Undo";
app.append(undoBtn);

undoBtn.addEventListener("click", (e) => {
  console.log(e);
  if (strokes.length > zero) {
    redoStrokes.push(strokes.pop()!);
    notify("drawing-changed");
  }
});

const redoBtn = document.createElement("button");
redoBtn.innerHTML = "Redo";
app.append(redoBtn);

redoBtn.addEventListener("click", (e) => {
  console.log(e);
  if (redoStrokes.length > zero) {
    strokes.push(redoStrokes.pop()!);
    notify("drawing-changed");
  }
});

function setOffset(e: MouseEvent): void {
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
}

function redraw() {
  ctx?.clearRect(zero, zero, canvas.width, canvas.height);
  for (const stroke of strokes) {
    if (stroke.length > one) {
      ctx?.beginPath();
      const { x, y } = stroke[0];
      ctx?.moveTo(x, y);
      for (const { x, y } of stroke) {
        ctx?.lineTo(x, y);
      }
      ctx?.stroke();
    }
  }
}
