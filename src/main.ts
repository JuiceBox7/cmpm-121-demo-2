import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Julian's game";

// --- Variables to Avoid Magic Numbers ---

const start = 0;
const minDist = 1;
const maxCanvasWidth = 256;
const maxCanvasHeight = 256;
const mouseXThick = 9.5;
const mouseXThin = 7;
const mouseY = 3;

// --- Headers ---

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const appName = "Sketchpad";

const appTitle = document.createElement("h1");
appTitle.innerHTML = appName;
app.append(appTitle);

// --- Canvas ---

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
app.append(canvas);

ctx!.fillStyle = "white";
ctx!.fillRect(start, start, maxCanvasWidth, maxCanvasHeight);

app.append(document.createElement("br"));

// --- Interfaces ---

interface Pair {
  x: number;
  y: number;
}

interface DrawingCmd {
  display(ctx: CanvasRenderingContext2D): void;
}

// --- Arrays and Variables ---

const strokes: DrawingCmd[] = [];
let currStrokeCmd: StrokeCmd;
let currCursorCmd: CursorCmd | null;
const redoStrokes: DrawingCmd[] = [];

const drawing = new EventTarget();

let sticker: StickerCmd | null;
let emoji: string | null;

let style = "thin";

// --- Classes ---

class StrokeCmd {
  coords: Pair[];
  style: string;

  constructor(x: number, y: number, style: string) {
    this.coords = [{ x, y }];
    this.style = style;
  }

  applyStyle(ctx: CanvasRenderingContext2D) {
    if (this.style == "thin") ctx.lineWidth = 1;
    if (this.style == "thick") ctx.lineWidth = 3.5;
  }

  display(ctx: CanvasRenderingContext2D) {
    this.applyStyle(ctx);
    ctx.beginPath();
    const { x, y } = this.coords[start];
    ctx.moveTo(x, y);
    for (const { x, y } of this.coords) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

class CursorCmd {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    let dot = ".";
    if (emoji) {
      dot = emoji;
      ctx.font = "32px monospace";
    } else {
      ctx.fillStyle = "black";
      if (style == "thin") {
        ctx.font = "16px monospace";
      }
      if (style == "thick") {
        ctx.font = "32px monospace";
      }
    }
    ctx.fillText(dot, this.x - mouseXThin, this.y + mouseY);
  }
}

class StickerCmd {
  x: number;
  y: number;
  emoji: string;

  constructor(x: number, y: number, emoji: string) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "32px monospace";
    ctx.fillText(this.emoji, this.x - mouseXThick, this.y + mouseY);
  }
}

// --- Canvas Event Listeners ---

canvas.addEventListener("mousedown", (e) => {
  if (emoji) {
    sticker = new StickerCmd(e.offsetX, e.offsetY, emoji);
    strokes.push(sticker);
  } else {
    currStrokeCmd = new StrokeCmd(e.offsetX, e.offsetY, style);
    strokes.push(currStrokeCmd);
    redoStrokes.splice(start, redoStrokes.length);
  }
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  currCursorCmd = new CursorCmd(e.offsetX, e.offsetY);
  notify("tool-moved");
  if (e.buttons == minDist) {
    currStrokeCmd.coords.push({ x: e.offsetX, y: e.offsetY });
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseout", (e) => {
  console.log(e);
  currCursorCmd = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseup", (e) => {
  console.log(e);
  notify("tool-moved");
  notify("drawing-changed");
});

// --- Drawing Event Listeners ---

drawing.addEventListener("drawing-changed", (e) => {
  console.log(e);
  redraw();
});

drawing.addEventListener("tool-moved", (e) => {
  console.log(e);
  redraw();
});

drawing.addEventListener("tool-changed", (e) => {
  console.log(e);
  redraw();
});

// ----- Buttons -----

// --- Brush Styles ---

const thinStyleBtn = document.createElement("button");
thinStyleBtn.innerHTML = "Thin";
app.append(thinStyleBtn);

thinStyleBtn.addEventListener("click", (e) => {
  console.log(e);
  style = "thin";
  emoji = null;
});

const thickStyleBtn = document.createElement("button");
thickStyleBtn.innerHTML = "Thick";
app.append(thickStyleBtn);

thickStyleBtn.addEventListener("click", (e) => {
  console.log(e);
  style = "thick";
  emoji = null;
});

app.append(document.createElement("br"));

// --- Emojis ---

const laughEmojiBtn = document.createElement("button");
laughEmojiBtn.innerHTML = "😂";
app.append(laughEmojiBtn);

laughEmojiBtn.addEventListener("click", (e) => {
  console.log(e);
  emoji = "😂";
});

const smileEmojiBtn = document.createElement("button");
smileEmojiBtn.innerHTML = "😊";
app.append(smileEmojiBtn);

smileEmojiBtn.addEventListener("click", (e) => {
  console.log(e);
  emoji = "😊";
});

const cryingEmojiBtn = document.createElement("button");
cryingEmojiBtn.innerHTML = "😭";
app.append(cryingEmojiBtn);

cryingEmojiBtn.addEventListener("click", (e) => {
  console.log(e);
  emoji = "😭";
});

const customStickerBtn = document.createElement("button");
customStickerBtn.innerHTML = "Custom";
app.append(customStickerBtn);

customStickerBtn.addEventListener("click", (e) => {
  console.log(e);
  const input = prompt("Enter custom sticker:");
  if (input) emoji = input;
});

app.append(document.createElement("br"));

// --- Clear/Undo/Redo Buttons ---

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

// --- Global Functions ---

function redraw() {
  ctx?.clearRect(start, start, canvas.width, canvas.height);
  strokes.forEach((cmd) => cmd.display(ctx!));

  if (currCursorCmd) currCursorCmd.display(ctx!);
}

function notify(name: string) {
  drawing.dispatchEvent(new Event(name));
}
