// Template 2 — "3 tips" (style B: big number, one tip at a time; end card on the photo).
// Reel JSON: { photo, photoPosition?, label?, headline, tips[3], outro?, endCard:{line,url} }
import { esc, calmIn, calmOut, hide, photoLayer, pushIn, endCard, page } from "../lib/page.mjs";

export const timing = { hook: 2.6, tip: 2.3, outro: 2.6, end: 3.4 };

export function build(reel, brand) {
  // reels with an extra closing frame (e.g. Christmas) run a little tighter to stay ≤ 15 s
  const t = reel.outro ? { ...timing, tip: 2.2, end: 3.0 } : timing;
  const tips = reel.tips.map((s) => s.replace(/^\d+\.\s*/, ""));
  if (tips.length < 1 || tips.length > 4) throw new Error("3-tips: give 1–4 tips");
  const tipAt = (i) => t.hook + i * t.tip;
  const outroAt = tipAt(tips.length);
  const endAt = outroAt + (reel.outro ? t.outro : 0);
  const duration = +(endAt + t.end).toFixed(2);
  const width = reel.textWidth ?? 680;

  const css = `
.col{left:96px;width:${width}px}
#lab{top:290px}
#hd{top:350px;font-size:120px}
.num{top:290px;font-family:var(--head);font-weight:700;font-size:400px;line-height:.8}
.tx{top:680px;font-family:var(--head);font-weight:700;font-size:88px;line-height:1.04;letter-spacing:-.015em}
#outro{top:330px;font-size:110px}
`;
  const body = `
${photoLayer("ph", "photo.jpg", reel.photoPosition)}
${reel.label ? `<div class="abs col label txt" id="lab">${esc(reel.label)}</div>` : ""}
<div class="abs col head txt" id="hd">${esc(reel.headline)}</div>
${tips
  .map(
    (s, i) => `<div class="abs col num txt" id="n${i}">${i + 1}</div>
<div class="abs col tx txt" id="x${i}">${esc(s)}</div>`,
  )
  .join("\n")}
${reel.outro ? `<div class="abs col head txt" id="outro">${esc(reel.outro)}</div>` : ""}
${endCard(reel.endCard)}`;

  let s = hide("#end") + tips.map((_, i) => hide(`#n${i},#x${i}`)).join("") + (reel.outro ? hide("#outro") : "");
  s += pushIn("#ph", 0, endAt);
  if (reel.label) s += calmIn("#lab", 0.2);
  s += calmIn("#hd", 0.35) + calmOut(reel.label ? "#lab,#hd" : "#hd", t.hook - 0.4);
  tips.forEach((_, i) => {
    const at = tipAt(i);
    const next = i < tips.length - 1 ? tipAt(i + 1) : reel.outro ? outroAt : endAt;
    s += calmIn(`#n${i}`, at, { y: 40 }) + calmIn(`#x${i}`, at + 0.15) + calmOut(`#n${i},#x${i}`, next - 0.4);
  });
  if (reel.outro) s += calmIn("#outro", outroAt) + calmOut("#outro", endAt - 0.4);
  s += calmIn("#end", endAt, { y: 24, d: 0.8 });

  return {
    duration,
    html: page({ id: "three-tips", duration, brand, css, body, script: s }),
    assets: { "photo.jpg": reel.photo },
    beats: [1.2, ...tips.map((_, i) => tipAt(i) + 1.2), ...(reel.outro ? [outroAt + 1.2] : []), duration - 0.5],
  };
}
