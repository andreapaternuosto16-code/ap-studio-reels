// Template 4 — "Review card". Exact quote (max 15 words), name exactly as on Google,
// five stars ONLY when that review is 5-star. Quote holds 5–6 s, then the end card.
// Reel JSON: { photo, photoPosition?, label, rating, quote, name, endCard, sample? }
import { esc, calmIn, calmOut, hide, photoLayer, pushIn, endCard, page, stamp } from "../lib/page.mjs";

const star = (c) =>
  `<svg viewBox="0 0 24 24" width="72" height="72"><path fill="${c}" d="M12 2.2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.1l-6.1 3.5 1.5-6.8L2.2 9.2l6.9-.7z"/></svg>`;

export function build(reel, brand) {
  const words = reel.quote.trim().split(/\s+/).length;
  if (words > 15) throw new Error(`review-card: quote has ${words} words, max 15`);
  const showStars = reel.rating === 5;
  const T = { label: 0.2, stars: 0.5, quote: 0.9, name: 1.5, out: 7.0 };
  const endAt = T.out + 0.4;
  const duration = +(endAt + 3.4).toFixed(2);
  const css = `
.col{left:96px;width:${reel.textWidth ?? 700}px}
#lab{top:290px}
#stars{top:360px;display:flex;gap:10px}
#q{top:${showStars ? 470 : 380}px;font-size:${words > 10 ? 78 : 88}px;line-height:1.08}
#nm{font-size:46px;font-weight:600;color:var(--teal)}
`;
  const body = `
${photoLayer("ph", "photo.jpg", reel.photoPosition)}
${reel.sample ? `<div id="st">${stamp(reel.sampleText ?? "SAMPLE — placeholder, not a real review", 1250)}</div>` : ""}
<div class="abs col label txt" id="lab">${esc(reel.label ?? "Google review")}</div>
${showStars ? `<div class="abs col" id="stars" aria-label="5 stars">${[0, 1, 2, 3, 4].map((i) => `<span class="s" id="s${i}">${star(brand.colors.teal)}</span>`).join("")}</div>` : ""}
<div class="abs col head txt" id="q">“${esc(reel.quote)}”<div class="txt" id="nm" style="margin-top:40px;font-family:var(--text);letter-spacing:0">${esc(reel.name)}</div></div>
${endCard(reel.endCard)}`;
  let s = hide("#end") + pushIn("#ph", 0, endAt, 0.08);
  s += calmIn("#lab", T.label);
  if (showStars) s += `tl.fromTo("#stars .s",{opacity:0,y:16},{opacity:1,y:0,duration:0.5,ease:"power2.out",stagger:0.1},${T.stars});\n`;
  s += calmIn("#q", T.quote) + `tl.fromTo("#nm",{opacity:0},{opacity:1,duration:0.6},${T.name});\n`;
  s += calmOut(`#lab,#q${showStars ? ",#stars" : ""}${reel.sample ? ",#st" : ""}`, T.out);
  s += calmIn("#end", endAt, { y: 24, d: 0.8 });
  return {
    duration,
    html: page({ id: "review-card", duration, brand, css, body, script: s }),
    assets: { "photo.jpg": reel.photo },
    beats: [2.4, 6.0, duration - 0.5],
  };
}
