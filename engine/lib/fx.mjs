// Round-2 effects: all written for this engine in the brand's colours (techniques inspired by the
// HyperFrames registry blocks named in each comment; no block code copied).
import { esc } from "./page.mjs";

const J = JSON.stringify;
export const f3 = (n) => (+n).toFixed(3);

/** Beat grid: reels are cut on the music's beats. */
export const beats = (bpm) => (n) => +(n * 60 / bpm).toFixed(4);

/** Seeded random so every render is identical (determinism). */
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Transparent cut-out (assets/D) with its separate soft shadow underneath. */
export function cutout(id, file, { x, y, w, rot = 0, shadow = null, shadowOpacity = 0.55, z = 5 }) {
  return `<div class="cut" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${w}px;z-index:${z};transform:rotate(${rot}deg)">
  ${shadow ? `<img class="cut-shadow" src="${esc(shadow)}" style="opacity:${shadowOpacity}" />` : ""}
  <img class="cut-img" src="${esc(file)}" /></div>`;
}

/** Glints that pop and twinkle (assets/D/effect-parts/glints-*). */
export function glints(prefix, spots) {
  return spots
    .map((s, i) => `<img class="fx" id="${prefix}${i}" src="d/glints-0${(s.v ?? i) % 5 + 1}.png" style="left:${s.x - s.w / 2}px;top:${s.y - s.w / 2}px;width:${s.w}px" />`)
    .join("");
}
export const glintPop = (prefix, n, at, gap = 0.08) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const t = at + i * gap;
    s += `tl.fromTo("#${prefix}${i}",{opacity:0,scale:0.2,rotation:-30},{opacity:1,scale:1,rotation:0,duration:0.22,ease:"back.out(2.5)"},${f3(t)});`;
    s += `tl.to("#${prefix}${i}",{opacity:0,scale:0.6,rotation:20,duration:0.35,ease:"power1.in"},${f3(t + 0.45)});\n`;
  }
  return s;
};

/** Spray-mist puff (assets/D/cutouts/09-spray-mist). */
export const mist = (id, { x, y, w, flip = false }) =>
  `<img class="fx" id="${id}" src="d/09-spray-mist.png" style="left:${x}px;top:${y}px;width:${w}px;${flip ? "transform:scaleX(-1)" : ""}" />`;
export const mistPuff = (id, at, flip = false) =>
  `tl.fromTo("#${id}",{opacity:0,scaleX:${flip ? -0.5 : 0.5},scaleY:0.5,transformOrigin:"${flip ? "100%" : "0%"} 100%"},{opacity:0.95,scaleX:${flip ? -1.05 : 1.05},scaleY:1.05,duration:0.28,ease:"power2.out"},${f3(at)});` +
  `tl.to("#${id}",{opacity:0,duration:0.45,ease:"power1.in"},${f3(at + 0.3)});\n`;

/** Bubbles rising and drifting (assets/D/effect-parts/bubbles-*). */
export function bubbles(prefix, n, { seed = 3, area = [60, 1020], from = 1700, to = 260, size = [60, 170] } = {}) {
  const r = rng(seed);
  const items = [];
  for (let i = 0; i < n; i++) {
    const w = Math.round(size[0] + r() * (size[1] - size[0]));
    items.push({ id: `${prefix}${i}`, w, x: Math.round(area[0] + r() * (area[1] - area[0] - w)), v: 1 + Math.floor(r() * 4), d: 2.2 + r() * 1.8, delay: r() * 1.2, sway: 20 + r() * 40 });
  }
  const html = items.map((b) => `<img class="fx bub" id="${b.id}" src="d/bubbles-0${b.v}.png" style="left:${b.x}px;top:${from}px;width:${b.w}px" />`).join("");
  const anim = (at) =>
    items
      .map((b) => `tl.fromTo("#${b.id}",{opacity:0,y:0,x:0,scale:0.6},{opacity:0.95,scale:1,duration:0.3},${f3(at + b.delay)});` +
        `tl.to("#${b.id}",{y:${to - from},x:${b.sway},duration:${f3(b.d)},ease:"sine.inOut"},${f3(at + b.delay)});` +
        `tl.to("#${b.id}",{opacity:0,scale:1.15,duration:0.18},${f3(at + b.delay + b.d - 0.18)});`)
      .join("\n");
  return { html, anim };
}

/** Light snow (HF `snow` idea): deterministic flakes, colour from the caller. */
export function snow(prefix, n, { seed = 11, color = "#ffffff", start = 0, end = 18 } = {}) {
  const r = rng(seed);
  let html = "", s = "";
  for (let i = 0; i < n; i++) {
    const w = 6 + Math.round(r() * 10), x = Math.round(r() * 1080), fall = 5 + r() * 5, phase = r() * fall;
    html += `<i class="flake" id="${prefix}${i}" style="left:${x}px;width:${w}px;height:${w}px;background:${color};opacity:${(0.55 + r() * 0.4).toFixed(2)}"></i>`;
    // each flake falls on its own loop, written out as finite tweens so the timeline stays seekable
    for (let t0 = start - phase; t0 < end; t0 += fall) {
      const a = Math.max(start, t0);
      const p0 = (a - t0) / fall;
      s += `tl.fromTo("#${prefix}${i}",{y:${Math.round(-30 + p0 * 1990)},x:0},{y:1960,x:${Math.round((r() - 0.5) * 120)},duration:${f3(fall * (1 - p0))},ease:"none",immediateRender:false},${f3(a)});`;
    }
    s += "\n";
  }
  return { html, script: s };
}

/** Text lines that rise from behind a clip edge (HF `lt-mask-reveal` idea). */
export function maskLines(id, lines, cls = "") {
  return `<div class="abs ${cls}" id="${id}">${lines
    .map((l, i) => `<div class="ml"><span class="txt" id="${id}-l${i}">${esc(l)}</span></div>`)
    .join("")}</div>`;
}
export const maskIn = (id, n, at, stagger = 0.12) =>
  `tl.fromTo("#${id} .ml > span",{yPercent:110,opacity:1},{yPercent:0,opacity:1,duration:0.55,ease:"power3.out",stagger:${stagger}},${f3(at)});` +
  `tl.set("#${id}",{opacity:1},${f3(at - 0.001)});\n`;
export const maskOut = (id, at) => `tl.to("#${id} .ml > span",{yPercent:-110,opacity:0,duration:0.35,ease:"power2.in",stagger:0.05},${f3(at)});tl.set("#${id}",{opacity:0},${f3(at + 0.5)});\n`;

/** Words that pop in one by one (for hooks: motion in the first second). */
export function popWords(id, text, cls = "") {
  return `<div class="abs ${cls}" id="${id}">${text
    .split(" ")
    .map((w, i) => `<span class="pw" id="${id}-w${i}">${esc(w)}</span>`)
    .join(" ")}</div>`;
}
export const popIn = (id, at, stagger = 0.11) =>
  `tl.fromTo("#${id} .pw",{opacity:0,y:40,scale:0.7},{opacity:1,y:0,scale:1,duration:0.4,ease:"back.out(2)",stagger:${stagger}},${f3(at)});\n`;

/** Rubber-stamp style check label ("Kitchen ✓"). A graphic object, not a box behind running text. */
export const stampBadge = (id, label, { x, y, rot = -6 }) =>
  `<div class="stampb txt" id="${id}" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg)">${esc(label)} <b>✓</b></div>`;
export const stampIn = (id, at) =>
  `tl.fromTo("#${id}",{opacity:0,scale:1.8},{opacity:1,scale:1,duration:0.26,ease:"power4.in"},${f3(at)});` +
  `tl.fromTo("#${id}",{x:0},{x:4,duration:0.05,yoyo:true,repeat:3},${f3(at + 0.26)});\n`;

/** Hand-drawn callout circle (HF `mk-callout-highlight` idea). */
export function callout(id, { cx, cy, rx, ry, rot = -8, color, width = 9 }) {
  const w = rx * 2 + 60, h = ry * 2 + 60;
  // a slightly open, overlapping loop reads as drawn by hand
  const d = `M ${w / 2 + rx * 0.2} ${h / 2 - ry} C ${w / 2 + rx * 1.15} ${h / 2 - ry * 0.95}, ${w / 2 + rx * 1.05} ${h / 2 + ry * 1.05}, ${w / 2} ${h / 2 + ry} C ${w / 2 - rx * 1.1} ${h / 2 + ry * 0.95}, ${w / 2 - rx * 1.05} ${h / 2 - ry * 1.05}, ${w / 2 + rx * 0.35} ${h / 2 - ry * 1.08}`;
  return `<svg class="abs callout" id="${id}" width="${w}" height="${h}" style="left:${cx - w / 2}px;top:${cy - h / 2}px;transform:rotate(${rot}deg);overflow:visible"><path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/></svg>`;
}
export const calloutDraw = (id, at, d = 0.55) =>
  `(function(){var p=document.querySelector("#${id} path");var L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});tl.to(p,{strokeDashoffset:0,duration:${d},ease:"power2.inOut"},${f3(at)});})();\n`;

/** Split-flap board in brand colours (HF `split-flap-board` idea: each cell walks the drum
 *  forward letter by letter; the top leaf falls with constant acceleration). */
export function flapBoard(id, rows, { cell = 84, h = 124, gap = 8, rowGap = 14, font = 90 } = {}) {
  const ALPHA = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'!";
  const width = Math.max(...rows.map((r) => r.length));
  const cells = [];
  const html = rows
    .map((row, ri) => {
      const txt = row.toUpperCase(); // rows are centred, so no blank padding cells
      return `<div class="fl-row" style="gap:${gap}px;margin-top:${ri ? rowGap : 0}px">${[...txt]
        .map((ch, ci) => {
          const k = Math.max(0, ALPHA.indexOf(ch));
          const cid = `${id}-${ri}-${ci}`;
          cells.push({ cid, k, order: ri * width + ci });
          return `<div class="fl-cell" id="${cid}" style="width:${cell}px;height:${h}px;font-size:${font}px">
<div class="fl-half fl-top"><span style="height:${h}px;line-height:${h}px"></span></div><div class="fl-half fl-bot"><span style="height:${h}px;line-height:${h}px;top:-${h / 2}px"></span></div>
<div class="fl-half fl-top fl-leaf"><span style="height:${h}px;line-height:${h}px"></span></div><i class="fl-seam"></i></div>`;
        })
        .join("")}</div>`;
    })
    .join("");
  const css = `
#${id}{display:flex;flex-direction:column;align-items:center}
.fl-row{display:flex}
.fl-cell{position:relative;perspective:700px;border-radius:12px;background:var(--cream);box-shadow:0 10px 22px rgba(31,79,91,.22),0 0 0 2px rgba(31,79,91,.10)}
.fl-half{position:absolute;left:0;width:100%;height:50%;overflow:hidden;background:var(--cream)}
.fl-top{top:0;border-radius:12px 12px 0 0}
.fl-bot{top:50%;border-radius:0 0 12px 12px;background:#F6ECE7}
.fl-leaf{transform-origin:50% 100%;z-index:3;backface-visibility:hidden}
.fl-half span{position:absolute;left:0;width:100%;text-align:center;font-family:var(--head);font-weight:700;color:var(--ink)}
.fl-seam{position:absolute;left:0;right:0;top:50%;height:3px;margin-top:-1.5px;background:rgba(31,79,91,.25);z-index:4}`;
  // paint(t) draws every cell at board-local time t; driven from the main timeline's onUpdate
  const script = (at, { flip = 0.045, stagger = 0.035 } = {}) => `
(function(){
  var A=${J(ALPHA)}, cells=${J(cells)}, F=${flip}, S=${stagger}, T0=${at};
  var els=cells.map(function(c){var e=document.getElementById(c.cid);return {c:c,top:e.children[0].firstChild,bot:e.children[1].firstChild,leaf:e.children[2],lg:e.children[2].firstChild};});
  function paint(t){
    for(var i=0;i<els.length;i++){var o=els[i],c=o.c;var lt=t-T0-c.order*S;var raw=lt<=0?0:lt/F;var n=Math.floor(raw),p=raw-n;
      if(n>=c.k){n=c.k;p=0;}
      var cur=A.charAt(n),nxt=A.charAt(Math.min(n+1,A.length-1));
      if(p>0){o.top.textContent=nxt;o.bot.textContent=cur;o.lg.textContent=cur;o.leaf.style.opacity=1;o.leaf.style.transform="rotateX("+(-180*p*p).toFixed(1)+"deg)";}
      else{o.top.textContent=cur;o.bot.textContent=cur;o.leaf.style.opacity=0;}
    }
  }
  window.__paints=(window.__paints||[]);window.__paints.push(paint);
})();\n`;
  return { html: `<div class="abs" id="${id}">${html}</div>`, css, script, settle: (at, o = {}) => at + (o.flip ?? 0.045) * 40 + cells.length * (o.stagger ?? 0.035) };
}

/** Handwritten write-on (HF `hw-write-title` idea): Caveat letters revealed left→right by a pen
 *  mask that slows into each letter, then a drawn underline. */
export function handwrite(id, text, { size = 150 } = {}) {
  const chars = [...text];
  return `<div class="abs hw txt" id="${id}" style="font-size:${size}px">${chars
    .map((c, i) => `<span class="hwc" id="${id}-c${i}">${c === " " ? "&nbsp;" : esc(c)}</span>`)
    .join("")}<svg class="hw-u" id="${id}-u" viewBox="0 0 600 40" preserveAspectRatio="none"><path d="M4 26 Q 80 10 160 24 T 320 22 T 470 20 T 596 16" fill="none" stroke="var(--teal)" stroke-width="7" stroke-linecap="round"/></svg></div>`;
}
export const handwriteIn = (id, n, at, per = 0.075) =>
  `(function(){for(var i=0;i<${n};i++){var c=document.getElementById("${id}-c"+i);gsap.set(c,{clipPath:"inset(-20% 100% -20% 0)"});tl.to(c,{clipPath:"inset(-20% 0% -20% 0)",duration:${per * 1.6},ease:"sine.inOut"},${at}+i*${per});}
var p=document.querySelector("#${id}-u path");var L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});tl.to(p,{strokeDashoffset:0,duration:0.5,ease:"power2.inOut"},${at}+${n}*${per}+0.1);})();\n`;

/** Perspective transform mapping a w×h box onto a quad (tl, tr, br, bl) — to put UI on a phone screen. */
export function quadMatrix(w, h, [p0, p1, p2, p3]) {
  // solve the 8-parameter homography from the unit box corners
  const src = [[0, 0], [w, 0], [w, h], [0, h]], dst = [p0, p1, p2, p3];
  const A = [], B = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
  }
  for (let c = 0; c < 8; c++) {
    let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; }
  }
  const [a, b, c, d, e, f, g, hh] = B.map((v, i) => v / A[i][i]);
  return `matrix3d(${[a, d, 0, g, b, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1].map((n) => +n.toFixed(8)).join(",")})`;
}

/** CSS shared by the round-2 effects. */
export const fxCss = `
.cut{position:absolute;transform-origin:50% 60%}
.cut img{position:absolute;inset:0;width:100%;height:100%}
.fx{position:absolute;pointer-events:none;opacity:0}
.flake{position:absolute;top:0;border-radius:50%;display:block}
.ml{overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em}
.ml>span{display:inline-block}
.pw{display:inline-block}
.stampb{position:absolute;font-family:var(--head);font-weight:700;font-size:58px;color:var(--teal);background:rgba(255,247,244,.94);
  border:6px solid var(--teal);border-radius:18px;padding:10px 26px 12px;white-space:nowrap;opacity:0}
.stampb b{font-weight:800}
.hw{font-family:'Caveat',cursive;font-weight:700;color:var(--ink);line-height:1;white-space:nowrap}
.hwc{display:inline-block}
.hw-u{display:block;width:100%;height:34px;margin-top:-6px}
`;
