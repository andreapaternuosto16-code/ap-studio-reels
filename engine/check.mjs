// Safe-zone + phone-size check. Loads the built page in Chromium, steps through the timeline
// every 0.1 s and checks every visible text element (.txt) and UI block (.zone):
//  - inside the safe area (out of the top 220 px and bottom 380 px Instagram UI, 60 px side margin)
//  - not overflowing its box (nothing cut off)
//  - text at least 40 px on the 1080 canvas (≈ 14 px on a 390 px-wide phone)
// Also saves a strip of the key beats scaled to phone width (390 px) for a by-eye check.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // pre-installed Playwright; add it as a dependency elsewhere
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SAFE } from "./lib/page.mjs";

export async function checkReel(htmlPath, out, phoneStripPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const problems = [];
  const dir0 = mkdtempSync(join(tmpdir(), "reelcheck-"));
  let minFont = Infinity;
  const tl = async (t) => page.evaluate((t) => { Object.values(window.__timelines)[0].seek(t, false); }, t);
  // Read every visible text element at time t (rect, overflow, effective font size after transforms).
  const probe = async (t) => { await tl(t); return page.evaluate(() => {
    const vis = (el) => { let o = 1; for (let e = el; e && e !== document.body; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
    return [...document.querySelectorAll(".txt,.zone")].map((el, i) => {
      const r = el.getBoundingClientRect();
      const hidden = getComputedStyle(el).visibility === "hidden";
      const scale = el.offsetWidth ? Math.sqrt((r.width * r.height) / (el.offsetWidth * el.offsetHeight || 1)) : 1;
      return { k: i, id: el.id || el.className, text: el.textContent.trim().slice(0, 40), op: hidden ? 0 : vis(el),
               r: [r.left, r.top, r.right, r.bottom], over: el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible" ? true : el.scrollWidth > el.clientWidth + 2,
               font: el.classList.contains("txt") && !el.classList.contains("ui") ? parseFloat(getComputedStyle(el).fontSize) * scale : null };
    });
  }); };
  for (let t = 0; t <= out.duration + 1e-6; t += 0.1) {
    const now = await probe(t);
    const later = await probe(Math.min(t + 0.08, out.duration));
    for (const f of now) {
      if (f.op <= 0.5) continue;
      if (f.r[2] <= 0 || f.r[0] >= 1080 || f.r[3] <= 0 || f.r[1] >= 1920) continue; // wholly off-screen
      const g = later[f.k];
      // only judge settled text: anything still sliding/whipping/landing is checked once it stops
      const moving = Math.max(...f.r.map((v, j) => Math.abs(v - g.r[j]))) > 3 || Math.abs(f.op - g.op) > 0.05;
      if (moving) continue;
      const issues = [];
      if (f.r[1] < SAFE.top - 0.5 || f.r[3] > SAFE.bottom + 0.5) issues.push(`vertical ${Math.round(f.r[1])}–${Math.round(f.r[3])}`);
      if (f.r[0] < SAFE.left - 0.5 || f.r[2] > SAFE.right + 0.5) issues.push(`horizontal ${Math.round(f.r[0])}–${Math.round(f.r[2])}`);
      if (f.over) issues.push("text wider than its box");
      if (f.font) minFont = Math.min(minFont, f.font);
      for (const i of issues) problems.push({ t: +t.toFixed(1), id: f.id, text: f.text, issue: i });
    }
  }
  // Legibility on the real pixels: at each key moment hide the text, screenshot what is behind it and
  // measure contrast (WCAG) of each visible line against the worst 8% of its background.
  const legib = [];
  const lumOf = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  for (const t of out.legibility ?? out.beats) {
    await tl(t);
    const items = await page.evaluate(() => {
      const vis = (el) => { let o = 1; for (let e = el; e && e !== document.body; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
      return [...document.querySelectorAll(".txt")].filter((el) => vis(el) > 0.8 && getComputedStyle(el).visibility !== "hidden").map((el) => {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        const scale = el.offsetWidth ? Math.sqrt((r.width * r.height) / (el.offsetWidth * el.offsetHeight || 1)) : 1;
        return { id: el.id || el.className, text: el.textContent.trim().slice(0, 40), r: [r.left, r.top, r.right, r.bottom], color: cs.color, px: parseFloat(cs.fontSize) * scale, bold: +cs.fontWeight >= 600 };
      }).filter((i) => i.r[2] > 0 && i.r[0] < 1080 && i.r[3] > 0 && i.r[1] < 1920);
    });
    const hideTag = await page.addStyleTag({ content: ".txt{visibility:hidden!important}" });
    const png = join(dir0, "bg.png");
    await page.screenshot({ path: png });
    await hideTag.evaluate((e) => e.remove());
    const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 26 });
    for (const it of items) {
      const [x0, y0, x1, y1] = it.r.map((v, i) => Math.max(0, Math.min(i % 2 ? 1919 : 1079, Math.round(v))));
      const m = it.color.match(/\d+(\.\d+)?/g).map(Number); const lt = lumOf(m[0], m[1], m[2]);
      const ls = [];
      for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) { const o = (y * 1080 + x) * 3; ls.push(lumOf(raw[o], raw[o + 1], raw[o + 2])); }
      if (!ls.length) continue;
      ls.sort((a, b) => a - b);
      const bg = lt > 0.5 ? ls[Math.floor(ls.length * 0.92)] : ls[Math.floor(ls.length * 0.08)];
      const c = (Math.max(lt, bg) + 0.05) / (Math.min(lt, bg) + 0.05);
      const large = it.px >= 48 || (it.bold && it.px >= 40);
      legib.push({ t: +t.toFixed(2), id: it.id, text: it.text, contrast: +c.toFixed(2), need: large ? 3 : 4.5, ok: c >= (large ? 3 : 4.5) });
    }
  }
  // phone-size strip of the key beats
  const dir = dir0;
  const shots = [];
  for (const [k, t] of out.beats.entries()) {
    await tl(t);
    const p = join(dir, `b${k}.png`);
    await page.screenshot({ path: p });
    shots.push(p);
  }
  await browser.close();
  const inputs = shots.flatMap((p) => ["-i", p]);
  const scale = shots.map((_, i) => `[${i}:v]scale=390:693[s${i}]`).join(";");
  const stack = shots.map((_, i) => `[s${i}]`).join("") + `hstack=inputs=${shots.length}`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${scale};${stack}`, "-q:v", "3", phoneStripPath]);
  rmSync(dir, { recursive: true, force: true });
  // dedupe: one line per element+issue
  const seen = new Map();
  for (const p of problems) { const k = p.id + p.issue.split(" ")[0]; if (!seen.has(k)) seen.set(k, p); }
  const small = minFont < 40;
  const bad = legib.filter((l) => !l.ok);
  const worst = legib.length ? Math.min(...legib.map((l) => l.contrast)) : null;
  return {
    ok: seen.size === 0 && !small && bad.length === 0,
    legibility: { checked: legib.length, failing: bad, worst, all: legib },
    summary: `${seen.size} safe-zone/overflow issue(s); smallest caption ${minFont.toFixed(0)}px on 1080 canvas ≈ ${(minFont * 390 / 1080).toFixed(1)}px on a 390px phone${small ? " (TOO SMALL)" : ""}; duration ${out.duration}s; legibility ${legib.length - bad.length}/${legib.length} lines pass (worst ${worst?.toFixed?.(1)}:1)`,
    duration: out.duration,
    minFontPx: minFont,
    problems: [...seen.values()],
  };
}
