// Round 3 — "real, clean, short". Only things a filmed video could contain: real camera moves
// (slow push, gentle pan, push-through match cut), cuts on the beat, natural light changes,
// real phone UI on real screens, and soft natural snow. No sparkles, bubbles, flying objects or shake.
import { esc } from "./page.mjs";
import { rng, f3, quadMatrix } from "./fx.mjs";
export { quadMatrix };

/** A full-bleed shot: the photo sits in a frame; the camera moves the photo inside it. */
export const shot = (id, src, { pos = "50% 50%", origin = "50% 50%", grade = 1, extra = "" } = {}) =>
  `<div class="shot" id="${id}"><div class="cam" id="${id}-cam" style="transform-origin:${origin};${grade !== 1 ? `filter:brightness(${grade})` : ""}"><img class="pic" src="${esc(src)}" style="object-position:${pos}" />${extra}</div></div>`;
/** Hard cut in at `at` (and out at `out`), the way an edit works — no dissolves. */
export const cutIn = (id, at, out) =>
  `tl.set("#${id}",{visibility:"visible"},${f3(at)});` + (out != null ? `tl.set("#${id}",{visibility:"hidden"},${f3(out)});` : "") + "\n";
/** Camera move on a shot: scale/x/y from → to over the shot, smooth (sine) like a slider or gimbal. */
export const camera = (id, at, dur, from, to, ease = "sine.inOut") =>
  `tl.fromTo("#${id}-cam",${JSON.stringify(from)},{...${JSON.stringify(to)},duration:${f3(dur)},ease:"${ease}"},${f3(at)});\n`;

/** Lines of text revealed by a clean mask (rise from behind a line), out by a quick fade. */
export function lines(id, ls, { x, y, w, size, color = "var(--ink)", align = "left", weight = 700, lh = 1.04, cls = "" }) {
  return `<div class="abs tb ${cls}" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;color:${color};text-align:${align};line-height:${lh};font-weight:${weight}">${ls
    .map((l, i) => `<div class="ml"><span class="txt" id="${id}-l${i}">${esc(l)}</span></div>`)
    .join("")}</div>`;
}
export const linesIn = (id, at, stagger = 0.09) =>
  `tl.set("#${id}",{opacity:1},${f3(at - 0.001)});tl.fromTo("#${id} .ml>span",{yPercent:105},{yPercent:0,duration:0.55,ease:"power3.out",stagger:${stagger}},${f3(at)});\n`;
export const linesOut = (id, at) => `tl.to("#${id}",{opacity:0,duration:0.2,ease:"power1.in"},${f3(at)});\n`;
export const wrap = (text, max) => {
  const out = [];
  for (const w of text.split(" ")) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= max) out[out.length - 1] = last + " " + w; else out.push(w);
  }
  return out;
};

// ---------- iPhone screen (393×852 pt, drawn at 420×910 units = 1.0687 units/pt) ----------
const U = 420 / 393;
const SVGI = {
  signal: `<svg viewBox="0 0 18 12" width="19" height="12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>`,
  wifi: `<svg viewBox="0 0 16 12" width="17" height="12"><path d="M8 11.5l2.3-2.6a3.3 3.3 0 0 0-4.6 0z"/><path d="M3.9 7.2a5.9 5.9 0 0 1 8.2 0l1.4-1.6a8 8 0 0 0-11 0z" /><path d="M1.2 4.3a9.9 9.9 0 0 1 13.6 0L16 2.8a12 12 0 0 0-16 0z"/></svg>`,
  battery: `<svg viewBox="0 0 27 13" width="27" height="13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2.5" y="2.5" width="19" height="8" rx="2"/><path d="M25 4.5v4a2 2 0 0 0 0-4z" opacity=".45"/></svg>`,
};
/** Real web page (screenshot, 390×664 pt viewport) inside iOS Safari chrome. */
export function safariScreen(pages, { url, statusBg = "#FDF2EF" }) {
  return `<div class="ios-status" style="background:${statusBg}"><span class="ios-time">9:41</span><span class="ios-icons">${SVGI.signal}${SVGI.wifi}${SVGI.battery}</span></div>
<div class="ios-view">${pages.map((p, i) => `<img class="ios-page" id="pg${i}" src="${esc(p)}" />`).join("")}</div>
<div class="ios-safari"><div class="ios-addr"><span class="aa">aA</span><span class="host">🔒 ${esc(url)}</span><span class="rl">↻</span></div>
<div class="ios-tools"><i>‹</i><i class="dim">›</i><i>⇪</i><i>▢</i><i>⧉</i></div><div class="ios-home"></div></div>`;
}
/** An iOS notification (Notification Centre style). */
export const iosNote = (id, { app, title, body, top, icon }) =>
  `<div class="ios-note" id="${id}" style="top:${top}px"><div class="ic">${icon}</div><div class="nb"><div class="nh"><b class="ui">${esc(app)}</b><span class="ui">now</span></div>${title ? `<div class="nt txt">${esc(title)}</div>` : ""}<div class="nbd txt">${esc(body)}</div></div></div>`;

/** The screen, corner-pinned into the phone in the photo: rounded mask, scene light, glass. */
export function phone(id, corners, inner, { radius = 52, light = "brightness(0.96) saturate(0.94) sepia(0.05)" } = {}) {
  return `<div class="ph-screen" id="${id}" style="transform:${quadMatrix(420, 910, corners)};border-radius:${radius}px">
  <div class="ph-content" style="filter:${light}">${inner}</div>
  <div class="ph-glass"></div>
</div>`;
}

/** Natural snow: few, soft flakes in three depths (far small/sharp, near large/blurred), slow drift. */
export function snow(prefix, { start = 0, end = 15, seed = 21, count = [10, 7, 4] } = {}) {
  const r = rng(seed);
  const layers = [
    { n: count[0], size: [3, 5], blur: 0, op: [0.55, 0.8], fall: [13, 17] },
    { n: count[1], size: [6, 9], blur: 1, op: [0.6, 0.85], fall: [9, 12] },
    { n: count[2], size: [14, 20], blur: 3.5, op: [0.35, 0.55], fall: [6, 8] },
  ];
  let html = "", s = "", k = 0;
  for (const L of layers) for (let i = 0; i < L.n; i++, k++) {
    const w = L.size[0] + r() * (L.size[1] - L.size[0]);
    const fall = L.fall[0] + r() * (L.fall[1] - L.fall[0]);
    const x = Math.round(r() * 1080), drift = (r() - 0.5) * 140, phase = r() * fall;
    html += `<i class="flake" id="${prefix}${k}" style="left:${x}px;width:${w.toFixed(1)}px;height:${w.toFixed(1)}px;opacity:${(L.op[0] + r() * (L.op[1] - L.op[0])).toFixed(2)};filter:blur(${L.blur}px)"></i>`;
    for (let t0 = start - phase; t0 < end; t0 += fall) {
      const a = Math.max(start, t0), p0 = (a - t0) / fall;
      s += `tl.fromTo("#${prefix}${k}",{y:${Math.round(-40 + p0 * 2000)},x:${Math.round(p0 * drift)}},{y:1960,x:${Math.round(drift)},duration:${f3(fall * (1 - p0))},ease:"none",immediateRender:false},${f3(a)});`;
    }
    s += "\n";
  }
  return { html, script: s };
}

/** End card on a full-bleed photo: big headline, the real logo PNG as-is, the site address. */
export const endBlock = (id, { line, url, x, y, w, align = "left", size = 96, logoW = 470, urlColor = null, gap = 46, order = "line-logo-url", urlSize = 60 }) => {
  const parts = {
    line: line ? `<div class="eh txt" style="font-size:${size}px">${esc(line)}</div>` : "",
    logo: `<img class="elogo" src="logo.png" alt="logo" style="width:${logoW}px;margin-top:${gap}px;${align === "center" ? "margin-left:auto;margin-right:auto" : ""}" />`,
    url: `<div class="eu txt" style="font-size:${urlSize}px;${urlColor ? `color:${urlColor}` : ""}">${esc(url)}</div>`,
  };
  return `<div class="abs endb" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;text-align:${align}">${order.split("-").map((k) => parts[k]).join("")}</div>`;
};
export const endIn = (id, at) =>
  `tl.fromTo("#${id} > *",{opacity:0,y:18},{opacity:1,y:0,duration:0.6,ease:"power2.out",stagger:0.12},${f3(at)});\n`;

export const realCss = `
.shot{position:absolute;inset:0;overflow:hidden;visibility:hidden}
.cam{position:absolute;left:0;top:0;width:1080px;height:1920px}
.cam>.pic{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
.tb{opacity:0;font-family:var(--head);letter-spacing:-.015em}
.ml{overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em}
.ml>span{display:inline-block}
.ph-screen{position:absolute;left:0;top:0;width:420px;height:910px;transform-origin:0 0;overflow:hidden;background:#fff}
.ph-content{position:absolute;inset:0}
.ph-glass{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(118deg,rgba(255,255,255,.20) 0%,rgba(255,255,255,.07) 26%,rgba(255,255,255,0) 44%,rgba(255,255,255,0) 78%,rgba(255,255,255,.06) 100%)}
.ios-status{position:absolute;left:0;top:0;width:420px;height:${Math.round(54 * U)}px;display:flex;align-items:center;justify-content:space-between;padding:${Math.round(8 * U)}px ${Math.round(30 * U)}px 0 ${Math.round(46 * U)}px;font-family:-apple-system,'Figtree',sans-serif;color:#111}
.ios-time{font-weight:700;font-size:${Math.round(17 * U)}px;letter-spacing:-.01em}
.ios-icons{display:flex;gap:${Math.round(5 * U)}px;align-items:center;fill:#111;color:#111}
.ios-view{position:absolute;left:0;top:${Math.round(54 * U)}px;width:420px;height:${Math.round(664 * U)}px;overflow:hidden}
.ios-page{position:absolute;left:0;top:0;width:420px;height:${Math.round(664 * U)}px;visibility:hidden}
.ios-safari{position:absolute;left:0;bottom:0;width:420px;height:${910 - Math.round(54 * U) - Math.round(664 * U)}px;background:rgba(248,246,245,.97);border-top:1px solid rgba(0,0,0,.08)}
.ios-addr{margin:${Math.round(8 * U)}px ${Math.round(14 * U)}px 0;height:${Math.round(44 * U)}px;border-radius:${Math.round(12 * U)}px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:space-between;padding:0 ${Math.round(14 * U)}px;font-family:-apple-system,'Figtree',sans-serif;color:#111}
.ios-addr .aa{font-size:${Math.round(15 * U)}px;font-weight:600}.ios-addr .host{font-size:${Math.round(16 * U)}px}.ios-addr .rl{font-size:${Math.round(17 * U)}px}
.ios-tools{display:flex;justify-content:space-around;margin-top:${Math.round(10 * U)}px;font-size:${Math.round(22 * U)}px;color:#0a7aff;font-family:-apple-system,sans-serif}
.ios-tools .dim{opacity:.35}
.ios-home{position:absolute;left:50%;bottom:${Math.round(8 * U)}px;width:${Math.round(134 * U)}px;height:${Math.round(5 * U)}px;margin-left:-${Math.round(67 * U)}px;border-radius:3px;background:#111}
.ios-note{position:absolute;left:${Math.round(10 * U)}px;width:${Math.round(373 * U)}px;border-radius:${Math.round(22 * U)}px;padding:${Math.round(12 * U)}px ${Math.round(14 * U)}px;display:flex;gap:${Math.round(10 * U)}px;align-items:flex-start;
  background:rgba(246,244,243,.86);backdrop-filter:blur(22px) saturate(1.6);-webkit-backdrop-filter:blur(22px) saturate(1.6);box-shadow:0 6px 18px rgba(0,0,0,.10);font-family:-apple-system,'Figtree',sans-serif;color:#111;opacity:0}
.ios-note .ic{flex:0 0 auto;width:${Math.round(38 * U)}px;height:${Math.round(38 * U)}px;border-radius:${Math.round(9 * U)}px;background:var(--teal);display:flex;align-items:center;justify-content:center}
.ios-note .nb{flex:1}
.ios-note .nh{display:flex;justify-content:space-between;font-size:22px;color:#555}
.ios-note .nh b{color:#111;font-weight:700}
.ios-note .nt{font-size:27px;font-weight:700;line-height:1.15}
.ios-note .nbd{font-size:27px;font-weight:500;line-height:1.15}
.flake{position:absolute;top:0;border-radius:50%;background:#fff;display:block;z-index:15}
.endb .eh{font-family:var(--head);font-weight:700;line-height:1.02;letter-spacing:-.02em;color:var(--ink)}
.endb .elogo{display:block;height:auto;margin-top:46px}
.endb .eu{font-family:var(--head);font-weight:600;color:var(--teal);margin-top:14px}
`;
