// Round 6 — built only from the motion Andrea picked in the motion menu:
//   #1 kinetic word-by-word type that scales · #2 mask-reveal headline wipe · #3 push with motion-blur streak
//   #6 2.5D parallax depth layers · #8 rack focus (only as a line lands) · #9 cuboid carousel
//   #10 hand-drawn circle on the detail the line is about.
// Bright photos only (grade ≥ 1), every shot ≤ 1.5 s, end card holds ≤ 2.5 s. Times in seconds.
import { page, esc } from "../lib/page.mjs";
import { f3, callout, calloutDraw } from "../lib/fx.mjs";
import { realCss, endBlock, endIn } from "../lib/real.mjs";

const PUSH = 0.45;      // push transition length
const MARGIN = 64;      // text stays inside these side margins

export function build(reel, brand) {
  const duration = 15;
  const assets = {};
  const add = (p) => { const k = `p/${p.split("/").pop()}`; assets[k] = p; return k; };
  let body = "", s = "", css = "";
  const tw = (sel, at, dur, from, to, ease = "none") =>
    `tl.fromTo(${JSON.stringify(sel)},${JSON.stringify(from)},{...${JSON.stringify(to)},duration:${f3(dur)},ease:"${ease}",immediateRender:${at <= 0}},${f3(at)});\n`;
  const vis = (id, a, z) => (a <= 0 ? `gsap.set("#${id}",{visibility:"visible"});` : `tl.set("#${id}",{visibility:"visible"},${f3(a)});`) + (z != null && z < duration ? `tl.set("#${id}",{visibility:"hidden"},${f3(z)});` : "") + "\n";
  const PANEL = reel.panel?.top ?? 0;
  const imgTag = (id, c, extraStyle = "", boxH = 1920 - PANEL) => {
    const W = c.w ?? 1080, H = c.h ?? 1920, z = c.z ?? 1;
    return `<img id="${id}" class="pic" src="${esc(add(c.photo))}" style="left:${-c.sx * z}px;top:${-c.sy * z}px;width:${W * z}px;height:${H * z}px;transform-origin:${c.ox ?? c.sx * z + 540}px ${c.oy ?? c.sy * z + boxH / 2}px;${c.grade && c.grade !== 1 ? `filter:brightness(${c.grade});` : ""}${extraStyle}" />`;
  };
  const mask = (m) => `-webkit-mask-image:${m};mask-image:${m};`;

  const shots = reel.shots;
  const overlay = shots.map(() => "");
  // text: #1 kinetic (words scale in one by one) or #2 mask wipe (lines revealed behind a clean edge)
  const leg = [];
  (reel.texts ?? []).forEach((L, i) => {
    const id = `t${i}`;
    const x = Math.max(MARGIN, L.x ?? MARGIN), w = Math.min(L.w ?? 1080 - 2 * MARGIN, 1080 - MARGIN - x);
    const lineHtml = L.lines.map((ln, j) => L.mode === "kinetic"
      ? `<div class="kl">${ln.split(" ").map((wd, k) => `<span class="kw txt" id="${id}-${j}-${k}">${esc(wd)}</span>`).join(" ")}</div>`
      : `<div class="ml6"><span class="txt mkw" id="${id}-${j}">${esc(ln)}</span></div>`).join("");
    const html = `<div class="tx6" id="${id}" style="left:${x}px;top:${L.y}px;width:${w}px;font-size:${L.size}px;color:${L.color ?? "var(--ink)"};text-align:${L.align ?? "left"};z-index:${100 + i}">${lineHtml}</div>\n`;
    if (L.in != null) overlay[L.in] += html; else body += html;
    if (L.mode === "static") {
      // nothing to animate: it slides in with its picture
    } else if (L.mode === "kinetic") {
      let k = 0;
      L.lines.forEach((ln, j) => ln.split(" ").forEach((_, q) => {
        s += tw(`#${id}-${j}-${q}`, L.start + 0.02 + k * (L.stagger ?? 0.11), 0.38, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1 }, "power3.out");
        k++;
      }));
    } else {
      L.lines.forEach((_, j) => {
        // wipe from left; the clip box is padded so no glyph edge is ever cut
        s += tw(`#${id}-${j}`, L.start + 0.02 + j * 0.14, 0.5, { clipPath: "inset(-25% 100% -25% -8%)" }, { clipPath: "inset(-25% -8% -25% -8%)" }, "power3.out");
      });
    }
    if (L.in != null) { /* lives and leaves with its picture */ }
    else s += (L.start <= 0 ? `gsap.set("#${id}",{opacity:1});` : `gsap.set("#${id}",{opacity:0});tl.set("#${id}",{opacity:1},${f3(L.start)});`) + `tl.to("#${id}",{opacity:0,duration:0.12},${f3(L.end - 0.13)});\n`;
    leg.push(+(Math.min(L.end - 0.2, L.start + 0.75)).toFixed(2));
  });

  // #10 hand-drawn circle on the detail the line is about
  (reel.circles ?? []).forEach((C, i) => {
    const id = `ci${i}`;
    const ch = `<div class="cw6" style="z-index:${90 + i}">${callout(id, { ...C.circle, color: C.color === "cream" ? brand.colors.cream : brand.colors.ink, width: 11 })}</div>\n`;
    if (C.in != null) overlay[C.in] += ch; else body += ch;
    s += `gsap.set("#${id}",{opacity:0});`;
    s += `tl.set("#${id}",{opacity:1},${f3(C.start)});` + calloutDraw(id, C.start, 0.55) + (C.in != null ? "\n" : `tl.to("#${id}",{opacity:0,duration:0.12},${f3(C.end - 0.13)});\n`);
  });

  shots.forEach((c, i) => {
    const id = `s${i}`;
    const len = c.end - c.start;
    if (len > 1.5 + 1e-6 && c.kind !== "cube") throw new Error(`r6: shot ${i} is ${len.toFixed(2)} s (max 1.5)`);
    if ((c.grade ?? 1) < 1) throw new Error(`r6: shot ${i} is dimmed (grade ${c.grade}); bright photos only`);
    const next = shots[i + 1];
    const outEnd = next?.push ? next.start + PUSH : c.end;   // stays on screen while the next shot pushes it out
    let inner = "";
    if (c.kind === "cube") {
      // #9 cuboid carousel on cream: each face is one picture, the cube turns on the beat
      const Wc = c.faceW ?? 720, Hc = c.faceH ?? 1040;
      inner = `<div class="cube-wrap" style="left:${(1080 - Wc) / 2}px;top:${c.cubeTop ?? 640}px;width:${Wc}px;height:${Hc}px"><div class="cube" id="${id}-cube">${c.faces.map((f, j) =>
        `<div class="face" style="width:${Wc}px;height:${Hc}px;transform:rotateY(${j * 90}deg) translateZ(${Wc / 2}px)"><img src="${esc(add(f.photo))}" style="object-position:${f.pos ?? "50% 50%"}" /></div>`).join("")}</div></div>`;
      s += tw(`#${id}-cube`, c.start, 0.01, { rotationY: 0, rotationX: -5, z: -Wc / 2 }, { rotationY: 0, rotationX: -5, z: -Wc / 2 });
      c.turns.forEach((t, j) => { s += tw(`#${id}-cube`, t, 0.65, { rotationY: -90 * j }, { rotationY: -90 * (j + 1) }, "power3.inOut"); });
      // each face is held from the end of the previous turn to the start of the next one
      const holds = [[c.start, c.turns[0]], ...c.turns.map((t, k) => [t + 0.65, c.turns[k + 1] ?? c.end])];
      for (let k = 0; k < holds.length; k++) if (holds[k][1] - holds[k][0] > 1.5 + 1e-6) throw new Error(`r6: cube face ${k} held ${(holds[k][1] - holds[k][0]).toFixed(2)} s (max 1.5)`);
    } else if (c.parallax) {
      // #6 2.5D parallax: the same photo in soft-masked depth layers, each moving at its own speed
      c.parallax.forEach((L, j) => {
        inner += imgTag(`${id}-l${j}`, c, L.mask ? mask(L.mask) : "");
        s += tw(`#${id}-l${j}`, c.start, outEnd - c.start, L.from, L.to);
      });
    } else if (c.rack) {
      // #8 rack focus: foreground layer (soft mask) and room layer swap focus exactly as the line lands
      inner = imgTag(`${id}-bg`, c) + imgTag(`${id}-fg`, c, mask(c.rack.mask));
      s += tw(`#${id}-bg,#${id}-fg`, c.start, outEnd - c.start, { scale: 1.0 }, { scale: 1.05 });
      const g = c.grade ?? 1;
      s += tw(`#${id}-bg`, c.start, 0.01, { filter: `brightness(${g}) blur(${c.rack.blur}px)` }, { filter: `brightness(${g}) blur(${c.rack.blur}px)` });
      s += tw(`#${id}-fg`, c.start, 0.01, { filter: `brightness(${g}) blur(0px)` }, { filter: `brightness(${g}) blur(0px)` });
      s += tw(`#${id}-bg`, c.rack.at, c.rack.dur ?? 0.55, { filter: `brightness(${g}) blur(${c.rack.blur}px)` }, { filter: `brightness(${g}) blur(0px)` }, "power2.inOut");
      s += tw(`#${id}-fg`, c.rack.at, c.rack.dur ?? 0.55, { filter: `brightness(${g}) blur(0px)` }, { filter: `brightness(${g}) blur(${c.rack.blur + 2}px)` }, "power2.inOut");
    } else {
      inner = imgTag(`${id}-i`, c);
      const mv = c.move ?? { scale: [1.0, 1.04] };   // the gentle push-in every real shot has
      s += tw(`#${id}-i`, c.start, outEnd - c.start, { scale: mv.scale[0] }, { scale: mv.scale[1] });
    }
    body += `<div class="shot6${c.kind === "cube" ? " cream" : ""}" id="${id}" style="z-index:${i + 1};${PANEL ? `top:${PANEL}px;height:${1920 - PANEL}px;` : ""}"><svg width="0" height="0" style="position:absolute"><filter id="hb${i}" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur id="hb${i}-g" stdDeviation="0 0"/></filter></svg><div class="mv" id="${id}-mv">${inner}${overlay[i]}</div></div>\n`;
    s += vis(id, c.start, outEnd);
    if (c.push && i > 0) {
      // #3 push: incoming and outgoing pictures travel together; a horizontal motion-blur streak rides the move
      const a = c.start;
      s += tw(`#s${i - 1}-mv`, a, PUSH, { x: 0 }, { x: -1080 }, "power3.inOut") + tw(`#${id}-mv`, a, PUSH, { x: 1080 }, { x: 0 }, "power3.inOut");
      for (const k of [i - 1, i]) {
        s += `tl.set("#s${k}-mv",{filter:"url(#hb${i})"},${f3(a)});tl.set("#s${k}-mv",{filter:"none"},${f3(a + PUSH + 0.01)});`;
      }
      s += `tl.fromTo("#hb${i}-g",{attr:{stdDeviation:"0 0"}},{attr:{stdDeviation:"60 0"},duration:${f3(PUSH / 2)},ease:"power2.in",immediateRender:false},${f3(a)});tl.to("#hb${i}-g",{attr:{stdDeviation:"0 0"},duration:${f3(PUSH / 2)},ease:"power2.out"},${f3(a + PUSH / 2)});\n`;
    }
  });

  // end card: full-bleed, unused picture, logo on a calm plain area; animates in, then holds ≤ 2.5 s
  const E = reel.end;
  body += `<div class="shot6" id="endf" style="z-index:${shots.length + 1}"><div class="mv" id="endf-mv">${imgTag("end-i", E.crop, "", 1920)}</div></div>`;
  s += vis("endf", E.start) + tw("#end-i", E.start, duration - E.start, { scale: 1.0 }, { scale: 1.03 });
  if (E.push) {
    const last = shots.length - 1;
    s += tw(`#s${last}-mv`, E.start, PUSH, { x: 0 }, { x: -1080 }, "power3.inOut") + tw("#endf-mv", E.start, PUSH, { x: 1080 }, { x: 0 }, "power3.inOut");
    s += `tl.set("#s${last}",{visibility:"hidden"},${f3(E.start + PUSH)});`;
  }
  body += endBlock("eb", { line: E.line, url: E.url, urlColor: E.urlColor, ...E.block });
  const endAt = E.start + (E.push ? PUSH : 0.1);
  s += endIn("eb", endAt);
  const holdFrom = endAt + 0.6 + 0.24;
  if (duration - holdFrom > 2.5 + 1e-6) throw new Error(`r6: end card holds ${(duration - holdFrom).toFixed(2)} s (max 2.5)`);
  leg.push(14.5);

  css += `${realCss}
.shot6{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;visibility:hidden}
.shot6.cream{background:var(--cream)}
.mv{position:absolute;inset:0}
.pic{position:absolute;max-width:none}
.cube-wrap{position:absolute;perspective:2400px}
.cube{position:absolute;inset:0;transform-style:preserve-3d}
.face{position:absolute;left:0;top:0;backface-visibility:hidden;overflow:hidden;border-radius:8px}
.face img{width:100%;height:100%;object-fit:cover}
.tx6{position:absolute;font-family:var(--head);font-weight:700;line-height:1.02;letter-spacing:-.02em}
.kl .kw{display:inline-block;transform-origin:50% 70%}
.ml6{display:block}
.mkw{display:inline-block}
#eb{z-index:200}
.cw6{position:absolute;inset:0;pointer-events:none}
`;
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  return { duration, html: page({ id: reel.id ?? "r6", duration, brand, css, body, script: s }), assets, beats: leg.slice(0, 8), contact, legibility: leg };
}
