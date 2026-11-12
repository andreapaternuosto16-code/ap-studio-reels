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
  let minFont = Infinity;
  const tl = async (t) => page.evaluate((t) => { Object.values(window.__timelines)[0].seek(t, false); }, t);
  for (let t = 0; t <= out.duration + 1e-6; t += 0.1) {
    await tl(t);
    const found = await page.evaluate((SAFE) => {
      const vis = (el) => { let o = 1; for (let e = el; e && e !== document.body; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
      return [...document.querySelectorAll(".txt,.zone")].filter((el) => vis(el) > 0.5).map((el) => {
        const r = el.getBoundingClientRect();
        const out = [];
        if (r.top < SAFE.top - 0.5 || r.bottom > SAFE.bottom + 0.5) out.push(`vertical ${Math.round(r.top)}–${Math.round(r.bottom)}`);
        if (r.left < SAFE.left - 0.5 || r.right > SAFE.right + 0.5) out.push(`horizontal ${Math.round(r.left)}–${Math.round(r.right)}`);
        if (el.scrollWidth > el.clientWidth + 2) out.push("text wider than its box");
        return { id: el.id || el.className, text: el.textContent.trim().slice(0, 40), issues: out,
                 font: el.classList.contains("txt") ? parseFloat(getComputedStyle(el).fontSize) : null };
      });
    }, SAFE);
    for (const f of found) {
      if (f.font) minFont = Math.min(minFont, f.font);
      for (const i of f.issues) problems.push({ t: +t.toFixed(1), id: f.id, text: f.text, issue: i });
    }
  }
  // phone-size strip of the key beats
  const dir = mkdtempSync(join(tmpdir(), "reelcheck-"));
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
  return {
    ok: seen.size === 0 && !small,
    summary: `${seen.size} safe-zone/overflow issue(s); smallest caption ${minFont}px on 1080 canvas ≈ ${(minFont * 390 / 1080).toFixed(1)}px on a 390px phone${small ? " (TOO SMALL)" : ""}; duration ${out.duration}s`,
    duration: out.duration,
    minFontPx: minFont,
    problems: [...seen.values()],
  };
}
