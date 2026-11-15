// Round 5 · F — KINETIC TYPE. Very large words fill the screen, one line per beat, at the reviewer's exact
// timings, over fast cuts (each ≤ 1 s) of different photos/crops with slow push-ins. Words rise into place;
// lines cut out on the beat. Full-screen end card on a crop never shown before. Times are in seconds.
import { page, esc } from "../lib/page.mjs";
import { f3 } from "../lib/fx.mjs";
import { realCss, lines, linesIn, endBlock, endIn } from "../lib/real.mjs";

export function build(reel, brand) {
  const duration = 15;
  const assets = {};
  const add = (p) => { const k = `p/${p.split("/").pop()}`; assets[k] = p; return k; };
  const css = `${realCss}
.fs{position:absolute;inset:0;overflow:hidden;visibility:hidden}
.fs img{position:absolute;max-width:none}
.tb,.endb{z-index:6}
.tb .ml>span{letter-spacing:-.03em}
`;
  const img = (id, c) => {
    const W = c.w ?? 1080, H = c.h ?? 1920, z = c.z ?? 1;
    return `<img id="${id}" src="${esc(add(c.photo))}" style="left:${-c.sx * z}px;top:${-c.sy * z}px;width:${W * z}px;height:${H * z}px;transform-origin:${c.sx * z + 540}px ${c.sy * z + 960}px;filter:brightness(${c.grade ?? 1})" />`;
  };
  let body = "", s = "";
  reel.shots.forEach((c, i) => {
    if (c.end - c.start > 1.0 + 1e-6) throw new Error(`kinetic: shot ${i} is ${(c.end - c.start).toFixed(2)} s (max 1 s)`);
    body += `<div class="fs" id="k${i}">${img(`k${i}-i`, c)}</div>\n`;
    s += (c.start <= 0 ? `gsap.set("#k${i}",{visibility:"visible"});` : `tl.set("#k${i}",{visibility:"visible"},${f3(c.start)});`) + `tl.set("#k${i}",{visibility:"hidden"},${f3(c.end)});`;
    s += `tl.fromTo("#k${i}-i",{scale:1},{scale:${c.push ?? 1.06},duration:${f3(c.end - c.start)},ease:"none"${c.start > 0 ? ",immediateRender:false" : ""}},${f3(c.start)});\n`;
  });
  const leg = [];
  reel.lines.forEach((L, i) => {
    const id = `w${i}`;
    body += lines(id, L.lines, { x: L.x ?? 70, y: L.y, w: L.w ?? 940, size: L.size, color: L.color ?? "var(--cream)", align: L.align ?? "left", lh: 0.98 }) + "\n";
    s += linesIn(id, L.start + 0.02, 0.07) + `tl.set("#${id}",{opacity:0},${f3(L.end)});\n`;
    leg.push(+(L.start + 0.45).toFixed(2));
  });
  const E = reel.end;
  body += `<div class="fs" id="endf">${img("end-i", E.crop)}</div>`;
  s += `tl.set("#endf",{visibility:"visible"},${f3(E.start)});tl.fromTo("#end-i",{scale:1},{scale:1.04,duration:${f3(duration - E.start)},ease:"none",immediateRender:false},${f3(E.start)});`;
  s += `tl.fromTo("#end-i",{filter:"blur(0px) brightness(${E.crop.grade ?? 1})"},{filter:"blur(7px) brightness(${E.crop.grade ?? 1})",duration:0.6,ease:"power2.inOut",immediateRender:false},${f3(E.start + 0.05)});\n`;
  body += endBlock("eb", { line: E.line, url: E.url, urlColor: E.urlColor, ...E.block });
  s += endIn("eb", E.start + 0.1);
  leg.push(14.4);
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  return { duration, html: page({ id: "r5-kinetic", duration, brand, css, body, script: s }), assets, beats: leg.slice(0, 8), contact, legibility: leg };
}
