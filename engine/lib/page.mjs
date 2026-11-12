// Shared building blocks for every reel template. Brand values always come in from
// clients/<client>/brand.json; nothing client-specific is hard-coded here.

export const W = 1080;
export const H = 1920;
// Instagram / Facebook UI covers the top 220 px and bottom 380 px of a reel.
export const SAFE = { top: 220, bottom: H - 380, left: 60, right: W - 60 };

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const J = JSON.stringify;

// Calm motion only (Herk MOTION_PHILOSOPHY, toned down for this brand): short rise + opacity, no blur/glow.
export const calmIn = (sel, at, { y = 28, d = 0.7 } = {}) =>
  `tl.fromTo(${J(sel)},{opacity:0,y:${y}},{opacity:1,y:0,duration:${d},ease:"power2.out"},${at.toFixed(3)});\n`;
export const calmOut = (sel, at, d = 0.35) =>
  `tl.to(${J(sel)},{opacity:0,duration:${d},ease:"power1.in"},${at.toFixed(3)});\n`;
export const hide = (sel) => `gsap.set(${J(sel)},{opacity:0});\n`;

/** A full-bleed photo layer. `pos` is a CSS object-position. */
export const photoLayer = (id, src, pos = "0% 50%", extra = "") =>
  `<div class="photo-wrap" id="${id}" ${extra}><img class="photo" src="${esc(src)}" style="object-position:${pos}" /></div>`;

/** Slow push-in (style B). Stops at `until` and holds. */
export const pushIn = (sel, from, until, amount = 0.12) =>
  `tl.fromTo(${J(sel)},{scale:1},{scale:${1 + amount},duration:${(until - from).toFixed(3)},ease:"none"},${from.toFixed(3)});\n`;

/** Marker shown on sample photos so nobody mistakes them for real job photos / reviews. */
export const stamp = (text, top = 1180) =>
  `<div class="abs stamp txt" style="top:${top}px">${esc(text)}</div>`;

/**
 * End card, Option A style: the line, the real logo PNG (as-is) and the site address,
 * straight on a calm part of the photo. The logo appears nowhere else.
 */
export function endCard({ id = "end", line, url, logo = "logo.png" }) {
  return `<div class="abs endcard" id="${id}">
  ${line ? `<div class="head txt end-line">${esc(line)}</div>` : ""}
  <img class="logo" src="${esc(logo)}" alt="logo" />
  <div class="url txt">${esc(url)}</div>
</div>`;
}

export function page({ id, duration, brand, css = "", body, script, music }) {
  const c = brand.colors;
  return `<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<link href="fonts/fonts.css" rel="stylesheet" />
<script src="gsap.min.js"></script>
<style>
:root{--ink:${c.ink};--teal:${c.teal};--cream:${c.cream};--blush:${c.blush};
--head:'${brand.fonts.headline}',sans-serif;--text:'${brand.fonts.text}',sans-serif;}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--cream)}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;color:var(--ink);font-family:var(--text)}
.photo-wrap{position:absolute;inset:0;overflow:hidden;transform-origin:0% 30%}
.photo{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover}
.abs{position:absolute}
.label{font-family:var(--text);font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:40px;line-height:1.2}
.head{font-family:var(--head);font-weight:700;letter-spacing:-.02em;line-height:1.02}
.endcard{left:96px;top:290px;width:760px}
.endcard .end-line{font-size:104px;margin-bottom:64px}
.endcard .logo{display:block;width:540px;height:auto}
.endcard .url{font-family:var(--head);font-weight:600;font-size:64px;margin-top:24px;color:var(--teal)}
.stamp{left:90px;right:90px;text-align:center;font-family:var(--text);font-weight:700;font-size:46px;letter-spacing:.06em;
  text-transform:uppercase;color:#B3261E;border:6px solid #B3261E;padding:18px 10px;transform:rotate(-6deg);opacity:.9}
${css}
</style>
</head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-duration="${duration}" data-width="${W}" data-height="${H}">
${body}
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
${script}
tl.to({}, { duration: ${duration} }, 0); // fill the slot (Herk law 11)
window.__timelines[${J(id)}] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
}
