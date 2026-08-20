import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "video");
mkdirSync(outDir, { recursive: true });

const out = resolve(outDir, "test-grid-1920x1080-30s.mp4");

const FONT = "C\\:/Windows/Fonts/arial.ttf";
const esc = (s) => s.replace(/:/g, "\\:");
const ft = (text, { x = "20", y = "14", size = 24, color = "white", box = false } = {}) =>
  `drawtext=fontfile='${FONT}':text='${esc(text)}':x=${x}:y=${y}:fontsize=${size}:fontcolor=${color}${
    box ? ":box=1:boxcolor=black@0.55:boxborderw=8" : ""
  }`;

const vf = [
  "drawgrid=w=160:h=160:t=1:c=0x2a2a2a",
  "drawgrid=w=320:h=320:t=2:c=0x4a4a4a",
  "drawgrid=w=960:h=540:t=3:c=0x6a6a6a",
  // central crosshair (red)
  "drawbox=x=0:y=538:w=1920:h=4:t=fill:color=0xcc1111@0.9",
  "drawbox=x=958:y=0:w=4:h=1080:t=fill:color=0xcc1111@0.9",
  // four corner markers (yellow 40x40)
  "drawbox=x=20:y=20:w=40:h=40:t=fill:color=0xcccc00@0.9",
  "drawbox=x=1860:y=20:w=40:h=40:t=fill:color=0xcccc00@0.9",
  "drawbox=x=20:y=1020:w=40:h=40:t=fill:color=0xcccc00@0.9",
  "drawbox=x=1860:y=1020:w=40:h=40:t=fill:color=0xcccc00@0.9",
  // timestamp (tests that frames advance deterministically)
  ft("%{pts} s", { y: "14", size: 42, color: "0xffd700", box: true }),
  ft("frame %{n}", { y: "66", size: 30, color: "0xffd700" }),
  // axis labels
  ft("x:0", { x: "12", y: "1048", size: 24 }),
  ft("x:960", { x: "948", y: "1048", size: 24 }),
  ft("x:1920", { x: "1852", y: "1048", size: 24 }),
  ft("y:0", { x: "1878", y: "22", size: 24 }),
  ft("y:540", { x: "1866", y: "532", size: 24 }),
  ft("y:1080", { x: "1860", y: "1048", size: 24 }),
].join(",");

const args = [
  "-y",
  "-hide_banner",
  "-loglevel", "error",
  "-f", "lavfi",
  "-i", "color=c=0x141414:s=1920x1080:r=30:d=30",
  "-vf", vf,
  "-c:v", "libx264",
  "-preset", "medium",
  "-crf", "18",
  "-pix_fmt", "yuv420p",
  "-profile:v", "main",
  "-r", "30",
  "-t", "30",
  "-movflags", "+faststart",
  out,
];

console.log("[generate-video] ffmpeg", args.join(" "));
execFileSync("ffmpeg", args, { stdio: ["ignore", "inherit", "inherit"] });

console.log("[generate-video] wrote", out);