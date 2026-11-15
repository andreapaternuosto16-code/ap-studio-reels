// Round 4 — a data-driven sequence of real shots (same rules as round 3–3.2: real camera motion only,
// cuts on the music's beat, big type placed by measurement, full-bleed end card).
// Everything a reel needs is in its JSON; times are in beats of `bpm`.
//
// shots[]: { id, photo, start, end, kind: "photo"|"strip", from, to, ease, grade, origin,
//            reveal: { photo, at, dur, angle },   // soft wipe of a second photo across the frame (s)
//            snow: true, focusPull: px }          // natural snow during this shot; rack focus at its start
// texts[]: { id, text, wrap, start, end, x, y, w, size, color, align, instant }
// end:     { shot, start, line, url, block, urlColor }
import { page } from "../lib/page.mjs";
import { beats, f3 } from "../lib/fx.mjs";
import { realCss, shot, cutIn, camera, lines, linesIn, linesOut, wrap, snow, endBlock, endIn } from "../lib/real.mjs";
import { esc } from "../lib/page.mjs";

export function build(reel, brand) {
  const b = beats(reel.bpm);
  const duration = reel.duration ?? 15;
  const t = (x) => Math.min(duration, b(x));
  const assets = {};
  const add = (photo) => { const k = `p/${photo.split("/").pop()}`; assets[k] = photo; return k; };

  const css = `${realCss}
.strip-cam{position:absolute;left:0;top:0;height:1920px}
.strip-cam>.pic{position:absolute;left:0;top:0;height:1920px;width:auto}
.rv{-webkit-mask-image:linear-gradient(var(--a),#000 0%,#000 calc(var(--w) - 16%),transparent var(--w));mask-image:linear-gradient(var(--a),#000 0%,#000 calc(var(--w) - 16%),transparent var(--w))}
.flake{visibility:hidden}
`;
  let body = "", s = "";

  for (const sh of reel.shots) {
    const src = add(sh.photo);
    const start = t(sh.start), end = t(sh.end);
    if (sh.kind === "strip") {
      body += `<div class="shot" id="${sh.id}"><div class="strip-cam" id="${sh.id}-cam" style="width:${sh.width ?? 4320}px;${sh.grade && sh.grade !== 1 ? `filter:brightness(${sh.grade})` : ""}"><img class="pic" src="${esc(src)}" /></div></div>\n`;
    } else {
      let extra = "";
      if (sh.reveal) {
        const r = add(sh.reveal.photo);
        extra = `<img class="pic rv" id="${sh.id}-rv" src="${esc(r)}" style="--a:${sh.reveal.angle ?? "100deg"};--w:-20%" />`;
      }
      body += shot(sh.id, src, { origin: sh.origin ?? "540px 960px", grade: sh.grade ?? 1, extra }) + "\n";
    }
    s += cutIn(sh.id, start, sh.last ? null : end);
    s += camera(sh.id, start, end - start, sh.from, sh.to, sh.ease ?? "sine.inOut");
    if (sh.reveal) {
      // the clear mirror is revealed behind the cloth's path: a soft edge travelling across the frame
      s += `tl.fromTo("#${sh.id}-rv",{"--w":"-20%"},{"--w":"125%",duration:${f3(sh.reveal.dur)},ease:"power1.inOut",immediateRender:${sh.reveal.at <= 0}},${f3(sh.reveal.at)});\n`;
    }
    if (sh.light) {
      // natural light change on the shot (e.g. evening light coming up): exposure eases from one value to another
      s += `tl.fromTo("#${sh.id}-cam",{filter:"brightness(${sh.grade ?? 1})"},{filter:"brightness(${sh.light.to})",duration:${f3(sh.light.dur)},ease:"sine.inOut",immediateRender:false},${f3(start + (sh.light.delay ?? 0))});\n`;
    }
    if (sh.focusPull) {
      s += `tl.fromTo("#${sh.id}-cam .pic",{filter:"blur(0px)"},{filter:"blur(${sh.focusPull}px)",duration:0.7,ease:"power2.inOut",immediateRender:false},${f3(t(sh.focusAt ?? sh.start) + 0.05)});\n`;
    }
    if (sh.snow) {
      const sn = snow("sn", { start: start, end: end, seed: 31, count: sh.snowCount ?? [8, 5, 3] });
      body += sn.html.replace(/class="flake"/g, 'class="flake fl-' + sh.id + '"');
      s += sn.script;
      s += `${start <= 0 ? `gsap.set(".fl-${sh.id}",{visibility:"visible"});` : `tl.set(".fl-${sh.id}",{visibility:"visible"},${f3(start)});`}tl.set(".fl-${sh.id}",{visibility:"hidden"},${f3(end)});\n`;
    }
  }

  const legibility = [];
  for (const tx of reel.texts) {
    const ls = Array.isArray(tx.text) ? tx.text : wrap(tx.text, tx.wrap ?? 16);
    body += lines(tx.id, ls, { x: tx.x, y: tx.y, w: tx.w, size: tx.size, color: tx.color ?? "var(--ink)", align: tx.align ?? "left", lh: tx.lh ?? 1.04 }) + "\n";
    const a = tx.instant ? 0 : t(tx.start), z = t(tx.end);
    s += tx.instant ? `gsap.set("#${tx.id}",{opacity:1});` : linesIn(tx.id, a + (tx.delay ?? 0.1));
    s += linesOut(tx.id, z);
    legibility.push(+(Math.min(z - 0.3, a + 1.0)).toFixed(2));
  }

  const E = reel.end;
  body += endBlock("eb", { line: E.line, url: E.url, urlColor: E.urlColor, ...E.block }) + "\n";
  if (E.color) body += `<style>#eb .eh,#eb .eu{color:${E.color}!important}</style>\n`;
  s += endIn("eb", t(E.start) + 0.15);
  legibility.push(+(duration - 0.6).toFixed(2));

  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  return { duration, html: page({ id: reel.id ?? "r4", duration, brand, css, body, script: s }), assets, beats: legibility, contact, legibility };
}
