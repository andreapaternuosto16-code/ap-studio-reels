#!/usr/bin/env node
// Render one reel from its JSON:  node engine/render.mjs clients/<client>/reels/<date>-<name>.json [--no-video]
// Writes clients/<client>/renders/<name>.mp4 (with music) and <name>-nomusic.mp4,
// plus a safe-zone/phone-size check (<name>-check.json, <name>-phone.jpg).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { checkReel } from "./check.mjs";

process.env.HYPERFRAMES_NO_TELEMETRY = "1"; // telemetry stays off
const engine = dirname(fileURLToPath(import.meta.url));
const reelPath = resolve(process.argv[2] ?? "");
if (!existsSync(reelPath)) { console.error("usage: node engine/render.mjs <reel.json> [--no-video]"); process.exit(1); }
const noVideo = process.argv.includes("--no-video");

const reel = JSON.parse(readFileSync(reelPath, "utf8"));
const clientDir = resolve(dirname(reelPath), "..");
const brand = JSON.parse(readFileSync(join(clientDir, "brand.json"), "utf8"));
const name = basename(reelPath, ".json");
const { build } = await import(`./templates/${reel.template}.mjs`);
const out = build(reel, brand);

const buildDir = join(clientDir, "renders", ".build", name);
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });
writeFileSync(join(buildDir, "index.html"), out.html);
writeFileSync(join(buildDir, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" } }, null, 2));
const photoDir = join(clientDir, brand.photoDir ?? "kit/photos");
// a bare filename comes from the client's photo folder; a path ("kit-round2/assets/A/01.jpg") from the client folder
for (const [dest, src] of Object.entries(out.assets)) {
  mkdirSync(dirname(join(buildDir, dest)), { recursive: true });
  copyFileSync(src.includes("/") ? join(clientDir, src) : join(photoDir, src), join(buildDir, dest));
}
mkdirSync(join(buildDir, "fonts"));
for (const f of readdirSync(join(engine, "vendor", "fonts"))) copyFileSync(join(engine, "vendor", "fonts", f), join(buildDir, "fonts", f));
copyFileSync(join(engine, "vendor", "gsap.min.js"), join(buildDir, "gsap.min.js"));
copyFileSync(join(clientDir, brand.logoPath ?? join("kit", brand.logo)), join(buildDir, "logo.png"));
console.log(`built ${name} (${reel.template}, ${out.duration}s) → ${buildDir}`);

const renders = join(clientDir, "renders");
const report = await checkReel(join(buildDir, "index.html"), out, join(renders, `${name}-phone.jpg`));
writeFileSync(join(renders, `${name}-check.json`), JSON.stringify(report, null, 2));
console.log(`check: ${report.ok ? "PASS" : "FAIL"} — ${report.summary}`);
if (!report.ok) { console.error(JSON.stringify(report.problems.slice(0, 10), null, 2)); process.exit(2); }
if (noVideo) process.exit(0);

const hf = join(engine, "node_modules", ".bin", "hyperframes");
const raw = join(buildDir, "raw.mp4");
execFileSync(hf, ["render", buildDir, "--output", raw, "--fps", "30", "--quality", "high", "--quiet"], { stdio: "inherit", cwd: buildDir });
const x264 = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart"];
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const nomusic = join(renders, `${name}-nomusic.mp4`);
ff(["-i", raw, ...x264, "-an", nomusic]);
if (reel.music) {
  const track = join(engine, "music", reel.music);
  const fadeAt = Math.max(0, out.duration - 1.5);
  ff(["-i", raw, "-i", track, "-map", "0:v", "-map", "1:a", ...x264,
      "-af", `volume=0.8,afade=t=in:d=0.4,afade=t=out:st=${fadeAt}:d=1.5`, "-c:a", "aac", "-b:a", "160k", "-t", String(out.duration),
      join(renders, `${name}.mp4`)]);
}
rmSync(raw, { force: true });
// 6-frame contact sheet, taken from the finished (no-music) MP4, labelled with each frame's time
if (out.contact) {
  const tmp = join(buildDir, "contact"); mkdirSync(tmp, { recursive: true });
  const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
  const frames = out.contact.slice(0, 6).map((t, i) => {
    const f = join(tmp, `c${i}.png`);
    ff(["-ss", String(t), "-i", nomusic, "-frames:v", "1", "-vf",
        `scale=360:640,drawtext=fontfile=${font}:text='${t.toFixed(1)} s':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=0x1F4F5B@0.85:boxborderw=6`, f]);
    return f;
  });
  ff([...frames.flatMap((f) => ["-i", f]), "-filter_complex",
      "[0][1][2]hstack=3[t];[3][4][5]hstack=3[b];[t][b]vstack=2", "-q:v", "3", join(renders, `${name}-contact.jpg`)]);
}
console.log(`rendered → ${renders}/${name}.mp4 and ${name}-nomusic.mp4`);
