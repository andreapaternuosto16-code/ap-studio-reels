// Template 3 — "Before → after wipe". ONLY the client's real job photos (same room, same angle).
// Reel JSON: { before, after, photoPosition?, hook, labels:{before,after}, closing, endCard, sample? }
// sample:true stamps both photos "SAMPLE — her photos go here".
import { esc, calmIn, calmOut, hide, photoLayer, pushIn, endCard, page, stamp } from "../lib/page.mjs";

export function build(reel, brand) {
  const T = { hook: 0.3, before: 2.4, wipe: 3.8, wipeDur: 1.8, closing: 7.4, end: 9.6 };
  const duration = +(T.end + 3.4).toFixed(2);
  const pos = reel.photoPosition ?? "0% 50%";
  const sampleText = reel.sample ? reel.sampleText ?? "SAMPLE — her photos go here" : null;
  const css = `
.col{left:96px;width:${reel.textWidth ?? 680}px}
#hook,#closing{top:300px;font-size:120px}
.ba{top:290px;font-size:170px}
#line{position:absolute;top:0;bottom:0;width:8px;margin-left:-4px;background:var(--cream);left:0}
`;
  const body = `
${photoLayer("pb", "before.jpg", pos)}
${photoLayer("pa", "after.jpg", pos, 'style="clip-path:inset(0 100% 0 0)"')}
<div id="line"></div>
${sampleText ? `<div id="sb">${stamp(sampleText.replace("SAMPLE", "SAMPLE BEFORE"))}</div><div id="sa">${stamp(sampleText.replace("SAMPLE", "SAMPLE AFTER"))}</div>` : ""}
<div class="abs col head txt" id="hook">${esc(reel.hook)}</div>
<div class="abs col head ba txt" id="lb">${esc(reel.labels?.before ?? "Before")}</div>
<div class="abs col head ba txt" id="la">${esc(reel.labels?.after ?? "After")}</div>
<div class="abs col head txt" id="closing">${esc(reel.closing)}</div>
${endCard(reel.endCard)}`;
  let s = hide("#lb,#la,#closing,#end,#line") + (sampleText ? hide("#sa") : "");
  s += pushIn("#pb,#pa", 0, T.end, 0.06);
  s += calmIn("#hook", T.hook) + calmOut("#hook", T.before - 0.4);
  s += calmIn("#lb", T.before) + calmOut("#lb", T.wipe);
  // The wipe: the after photo is revealed left→right behind a thin cream line.
  s += `tl.set("#line",{opacity:1},${T.wipe});\n`;
  s += `tl.fromTo("#pa",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:${T.wipeDur},ease:"power1.inOut"},${T.wipe});\n`;
  s += `tl.fromTo("#line",{left:0},{left:1080,duration:${T.wipeDur},ease:"power1.inOut"},${T.wipe});\n`;
  s += `tl.set("#line",{opacity:0},${T.wipe + T.wipeDur});\n`;
  if (sampleText) s += `tl.set("#sb",{opacity:0},${T.wipe + T.wipeDur / 2});tl.set("#sa",{opacity:1},${T.wipe + T.wipeDur / 2});\n`;
  s += calmIn("#la", T.wipe + T.wipeDur - 0.2) + calmOut("#la", T.closing - 0.4);
  s += calmIn("#closing", T.closing) + calmOut("#closing", T.end - 0.4);
  if (sampleText) s += calmOut("#sa", T.end - 0.4);
  s += calmIn("#end", T.end, { y: 24, d: 0.8 });
  return {
    duration,
    html: page({ id: "before-after", duration, brand, css, body, script: s }),
    assets: { "before.jpg": reel.before, "after.jpg": reel.after },
    beats: [1.4, T.before + 0.9, T.wipe + T.wipeDur / 2, T.wipe + T.wipeDur + 0.8, T.closing + 1.2, duration - 0.5],
  };
}
