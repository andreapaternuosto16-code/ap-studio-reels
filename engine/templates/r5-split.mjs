// Round 5 · E — SPLIT SCREEN. Opening 1.4 s full-screen mirror wipe, then the screen splits 50/50 with a
// thin cream gap. Top and bottom halves each show their own crop and move in opposite directions (top pans
// left, bottom pans right, or opposite push-ins), cutting on the beat. Each line sits large across the split.
// Full-screen end card on a crop never shown before. Times are in beats of `bpm`.
import { page, esc } from "../lib/page.mjs";
import { beats, f3 } from "../lib/fx.mjs";
import { realCss, lines, linesIn, endBlock, endIn } from "../lib/real.mjs";

const PANE_H = 955, GAP = 10;

export function build(reel, brand) {
  const b = beats(reel.bpm);
  const duration = 15;
  const t = (x) => Math.min(duration, b(x));
  const assets = {};
  const add = (p) => { const k = `p/${p.split("/").pop()}`; assets[k] = p; return k; };
  const css = `${realCss}
.pane{position:absolute;left:0;width:1080px;height:${PANE_H}px;overflow:hidden;background:var(--cream)}
#ptop{top:0} #pbot{top:${PANE_H + GAP}px}
.hs{position:absolute;inset:0;overflow:hidden;visibility:hidden}
.hs img,.fs img{position:absolute;max-width:none}
.fs{position:absolute;inset:0;overflow:hidden;visibility:hidden;z-index:3}
.tb,.endb{z-index:6}
.rv{-webkit-mask-image:linear-gradient(100deg,#000 0%,#000 calc(var(--w) - 16%),transparent var(--w));mask-image:linear-gradient(100deg,#000 0%,#000 calc(var(--w) - 16%),transparent var(--w))}
`;
  // crop → <img> placement: (sx, sy) is the source pixel at the box's top-left, z the zoom
  const img = (id, photo, c, boxH, extra = "") => {
    const W = c.w ?? 1080, H = c.h ?? 1920, z = c.z ?? 1;
    return `<img id="${id}" src="${esc(add(photo))}" class="${extra}" style="left:${-c.sx * z}px;top:${-c.sy * z}px;width:${W * z}px;height:${H * z}px;transform-origin:${c.sx * z + 540}px ${c.sy * z + boxH / 2}px;${c.grade && c.grade !== 1 ? `filter:brightness(${c.grade})` : ""}" />`;
  };
  const show = (id, a, z) => (a <= 0 ? `gsap.set("#${id}",{visibility:"visible"});` : `tl.set("#${id}",{visibility:"visible"},${f3(a)});`) + (z != null ? `tl.set("#${id}",{visibility:"hidden"},${f3(z)});` : "");
  const move = (id, a, z, m) => {
    const from = m.x ? { x: m.x[0] } : { scale: m.scale[0] }, to = m.x ? { x: m.x[1] } : { scale: m.scale[1] };
    return `tl.fromTo("#${id}",${JSON.stringify(from)},{...${JSON.stringify(to)},duration:${f3(z - a)},ease:"none"${a > 0 ? ",immediateRender:false" : ""}},${f3(a)});`;
  };
  let body = "", s = "";

  // 1 · opening: full-screen wipe E01 → E02 (the clear mirror appears behind the cloth's path)
  const O = reel.opening;
  body += `<div class="fs" id="open">${img("open-a", O.photo, O.crop, 1920)}${img("open-b", O.reveal, O.crop, 1920, "rv")}</div>`;
  s += show("open", 0, t(O.end)) + move("open-a", 0, t(O.end), { scale: [1.0, 1.05] }) + move("open-b", 0, t(O.end), { scale: [1.0, 1.05] });
  s += `gsap.set("#open-b",{"--w":"-20%"});tl.to("#open-b",{"--w":"125%",duration:${f3(O.wipeDur)},ease:"power1.inOut"},${f3(O.wipeAt)});\n`;

  // 2 · split: half shots
  let top = "", bot = "";
  for (const h of reel.halves) {
    const a = t(h.start), z = t(h.end);
    if (z - a > 1.5 + 1e-6) throw new Error(`split: half shot ${h.id} is ${(z - a).toFixed(2)} s (max 1.5)`);
    const el = `<div class="hs" id="${h.id}">${img(h.id + "-i", h.photo, h, PANE_H)}</div>`;
    if (h.pane === "top") top += el; else bot += el;
    // top pans left, bottom pans right, unless the shot asks for a push-in
    const m = h.move ?? (h.pane === "top" ? { x: [36, -36] } : { x: [-36, 36] });
    s += show(h.id, a, z) + move(h.id + "-i", a, z, m) + "\n";
  }
  body += `<div class="pane" id="ptop">${top}</div><div class="pane" id="pbot">${bot}</div>`;

  // 3 · end card: full-screen crop never shown before, rack focus
  const E = reel.end;
  body += `<div class="fs" id="endf">${img("end-i", E.photo, E.crop, 1920)}</div>`;
  s += show("endf", t(E.start)) + move("end-i", t(E.start), duration, { scale: [1.0, 1.04] });
  s += `tl.fromTo("#end-i",{filter:"blur(0px) brightness(${E.crop.grade ?? 1})"},{filter:"blur(7px) brightness(${E.crop.grade ?? 1})",duration:0.7,ease:"power2.inOut",immediateRender:false},${f3(t(E.start) + 0.05)});\n`;
  body += endBlock("eb", { line: E.line, url: E.url, urlColor: E.urlColor, ...E.block });
  s += endIn("eb", t(E.start) + 0.15);

  // 4 · lines across the split
  const leg = [];
  for (const L of reel.texts) {
    body += lines(L.id, L.lines, { x: L.x ?? 60, y: L.y, w: L.w ?? 960, size: L.size, color: L.color ?? "var(--cream)", align: L.align ?? "center", lh: 1.0 });
    s += linesIn(L.id, b(L.start) + (L.delay ?? 0.08)) + `tl.to("#${L.id}",{opacity:0,duration:0.15},${f3(b(L.end) - 0.17)});\n`;
    leg.push(+(b(L.start) + 0.8).toFixed(2), +(b(L.end) - 0.35).toFixed(2));
  }
  leg.push(14.4);
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  return { duration, html: page({ id: "r5-split", duration, brand, css, body, script: s }), assets, beats: leg.slice(0, 8), contact, legibility: leg };
}
