// Round 5 · G — WALK-THROUGH. One continuous walk through the home: each shot ≤ 1.5 s carries its own
// camera moves (push forward through a doorway, arrive, whip pan with motion blur, pan along the wide
// strip), so the cut lands inside the movement. Soft natural snow only on the outside shots.
// Full-screen end card on a crop of the strip never shown before. Times are in seconds.
import { page, esc } from "../lib/page.mjs";
import { f3 } from "../lib/fx.mjs";
import { realCss, lines, linesIn, snow, endBlock, endIn } from "../lib/real.mjs";

export function build(reel, brand) {
  const duration = 15;
  const assets = {};
  const add = (p) => { const k = `p/${p.split("/").pop()}`; assets[k] = p; return k; };
  const css = `${realCss}
.fs{position:absolute;inset:0;overflow:hidden;visibility:hidden}
.fs img{position:absolute;max-width:none}
.tb,.endb{z-index:6}
.flake{visibility:hidden}
`;
  const img = (id, c) => {
    const W = c.w ?? 1080, H = c.h ?? 1920, z = c.z ?? 1;
    return `<img id="${id}" src="${esc(add(c.photo))}" style="left:${-c.sx * z}px;top:${-c.sy * z}px;width:${W * z}px;height:${H * z}px;transform-origin:${c.ox ?? c.sx * z + 540}px ${c.oy ?? c.sy * z + 960}px;filter:brightness(${c.grade ?? 1}) blur(0px)" />`;
  };
  let body = "", s = "";
  reel.shots.forEach((c, i) => {
    if (!c.end || c.end - c.start > 1.5 + 1e-6) throw new Error(`walk: shot ${i} is ${(c.end - c.start).toFixed(2)} s (max 1.5)`);
    const id = `g${i}`;
    body += `<div class="fs" id="${id}">${img(id + "-i", c)}</div>\n`;
    s += (c.start <= 0 ? `gsap.set("#${id}",{visibility:"visible"});` : `tl.set("#${id}",{visibility:"visible"},${f3(c.start)});`) + `tl.set("#${id}",{visibility:"hidden"},${f3(c.end)});\n`;
    // camera moves: each { at, dur (s, relative to the shot), from, to, ease }; blur rides fast moves (whip)
    for (const m of c.moves) {
      const a = c.start + m.at;
      const fmt = (o) => JSON.stringify({ ...o, ...(o.blur != null ? { filter: `brightness(${c.grade ?? 1}) blur(${o.blur}px)` } : {}), blur: undefined });
      s += `tl.fromTo("#${id}-i",${fmt(m.from)},{...${fmt(m.to)},duration:${f3(m.dur)},ease:"${m.ease ?? "none"}"${a > 0 ? ",immediateRender:false" : ""}},${f3(a)});\n`;
    }
    if (c.snow) {
      const sn = snow("sn" + i, { start: c.start, end: c.end, seed: 40 + i, count: c.snow });
      body += sn.html.replace(/class="flake"/g, `class="flake fl${i}"`);
      s += sn.script + (c.start <= 0 ? `gsap.set(".fl${i}",{visibility:"visible"});` : `tl.set(".fl${i}",{visibility:"visible"},${f3(c.start)});`) + `tl.set(".fl${i}",{visibility:"hidden"},${f3(c.end)});\n`;
    }
  });
  const leg = [];
  reel.texts.forEach((L, i) => {
    const id = L.id ?? `t${i}`;
    body += lines(id, L.lines, { x: L.x, y: L.y, w: L.w ?? 1020 - L.x, size: L.size, color: L.color ?? "var(--ink)", align: L.align ?? "left", lh: 1.02 }) + "\n";
    s += (L.instant ? `gsap.set("#${id}",{opacity:1});` : linesIn(id, L.start + 0.05, 0.07)) + `tl.to("#${id}",{opacity:0,duration:0.12},${f3(L.end - 0.13)});\n`;
    leg.push(+(Math.min(L.end - 0.25, L.start + 0.7)).toFixed(2));
  });
  const E = reel.end;
  body += `<div class="fs" id="endf">${img("end-i", E.crop)}</div>`;
  s += `tl.set("#endf",{visibility:"visible"},${f3(E.start)});tl.fromTo("#end-i",{scale:1},{scale:1.04,duration:${f3(duration - E.start)},ease:"none",immediateRender:false},${f3(E.start)});`;
  s += `tl.fromTo("#end-i",{filter:"brightness(${E.crop.grade ?? 1}) blur(0px)"},{filter:"brightness(${E.crop.grade ?? 1}) blur(7px)",duration:0.6,ease:"power2.inOut",immediateRender:false},${f3(E.start + 0.05)});\n`;
  body += endBlock("eb", { line: E.line, url: E.url, urlColor: E.urlColor, ...E.block });
  s += endIn("eb", E.start + 0.1);
  leg.push(14.4);
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  return { duration, html: page({ id: "r5-walk", duration, brand, css, body, script: s }), assets, beats: leg.slice(0, 8), contact, legibility: leg };
}
