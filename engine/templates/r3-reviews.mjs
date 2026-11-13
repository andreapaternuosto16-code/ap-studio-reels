// Round 3 · C — "Reviews we love" (≤ 15 s). Title on the calm wall (C01) → three reviews, one at a
// time, on a big full-width card that slides in cleanly while the previous one slides out (they move
// together, so they never overlap), ~2.7 s each, over the phone-on-sofa shot with the real site on
// its screen → "Care in the little details." on a real detail → end card on C01. No count-up.
import { esc, page } from "../lib/page.mjs";
import { beats, f3 } from "../lib/fx.mjs";
import { realCss, shot, cutIn, camera, lines, linesIn, linesOut, wrap, phone, safariScreen, endBlock, endIn } from "../lib/real.mjs";

const starSvg = (fill, stroke) =>
  `<svg viewBox="0 0 24 24" width="68" height="68"><path fill="${fill}" stroke="${stroke}" stroke-width="1.6" d="M12 2.6l2.8 6 6.6.7-5 4.5 1.4 6.5L12 17l-5.8 3.3 1.4-6.5-5-4.5 6.6-.7z"/></svg>`;

export function build(reel, brand) {
  const b = beats(reel.bpm ?? 100);
  const R = reel.reviews;
  if (R.length !== 3) throw new Error("reviews: give exactly 3 reviews");
  for (const r of R) {
    const n = r.excerpt.trim().split(/\s+/).length;
    if (n > 12) throw new Error(`reviews: excerpt has ${n} words, max 12`);
    if (![1, 2, 3, 4, 5].includes(r.rating)) throw new Error("reviews: rating must be that review's own 1–5");
  }
  const T = { cards: [b(3.5), b(8), b(12.5)], care: b(17), end: b(20.5) };
  const duration = 15;
  const A = reel.assets, E = reel.end, C = reel.care;
  const css = `${realCss}
.rc{position:absolute;left:40px;top:${reel.cardTop ?? 300}px;width:1000px;border-radius:52px;background:#fff;padding:44px 52px 52px;
  box-shadow:0 18px 44px rgba(31,79,91,.18);visibility:hidden}
.rc .smp{font-size:36px;font-weight:700;letter-spacing:.06em;color:#B3261E;margin-bottom:16px}
.rc .hd{display:flex;align-items:center;gap:18px;font-size:50px;font-weight:600;color:var(--teal)}
.rc .ic{width:72px;height:72px;border-radius:16px;background:var(--teal);display:flex;align-items:center;justify-content:center}
.rc .stars{display:flex;gap:8px;margin:24px 0 18px}
.rc .q{font-family:var(--head);font-weight:700;font-size:84px;line-height:1.06;color:var(--ink)}
.rc .nm{margin-top:28px;font-size:54px;font-weight:600;color:var(--teal)}
`;
  const ic = `<svg viewBox="0 0 24 24" width="38" height="38"><path fill="${brand.colors.cream}" d="M12 2.6l2.8 6 6.6.7-5 4.5 1.4 6.5L12 17l-5.8 3.3 1.4-6.5-5-4.5 6.6-.7z"/></svg>`;
  const card = (r, i) => `<div class="rc" id="rc${i}">
  ${reel.sample ? `<div class="smp ui">${esc(reel.sampleText)}</div>` : ""}
  <div class="hd"><div class="ic">${ic}</div><span class="txt">${esc(reel.label)}</span></div>
  <div class="stars" aria-label="${r.rating} out of 5">${[0, 1, 2, 3, 4].map((k) => starSvg(k < r.rating ? brand.colors.teal : "none", brand.colors.teal)).join("")}</div>
  <div class="q txt">“${esc(r.excerpt)}”</div>
  <div class="nm txt">${esc(r.name)}</div></div>`;
  const body = `
${shot("s1", "c/room.jpg", { origin: "50% 35%" })}
${shot("s2", "c/phone.jpg", { origin: "50% 60%", extra: phone("cs", reel.screen, safariScreen(["c/page.png"], { url: "xtrafreshhh.com" }).replace('id="pg0"', 'id="cp0" style="visibility:inherit"'), { radius: 46 }) })}
${shot("s3", "c/detail.jpg", { origin: C.origin ?? "30% 45%" })}
${shot("s4", "c/room.jpg", { origin: E.origin ?? "100% 40%" })}
${lines("tt", wrap(reel.title, 8), { ...reel.titlePos, size: 156, align: "center" })}
${R.map(card).join("\n")}
${lines("cl", wrap(reel.careLine, C.wrap ?? 11), { ...C.pos, size: C.size ?? 88 })}
${endBlock("eb", { line: E.line, url: E.url, ...E.block })}`;

  let s = "";
  s += cutIn("s1", 0, T.cards[0]) + camera("s1", 0, T.cards[0], { scale: 1.0 }, { scale: 1.05 }, "sine.out");
  s += linesIn("tt", 0.06) + linesOut("tt", T.cards[0]);
  s += cutIn("s2", T.cards[0], T.care) + camera("s2", T.cards[0], T.care - T.cards[0], { scale: 1.0 }, { scale: 1.08 }, "sine.inOut");
  T.cards.forEach((t, i) => {
    // incoming and outgoing cards travel together, 1100 px apart: a clean slide, never overlapping
    s += `tl.set("#rc${i}",{visibility:"visible"},${f3(t)});tl.fromTo("#rc${i}",{x:1100},{x:0,duration:0.55,ease:"power3.inOut"},${f3(t)});`;
    if (i > 0) s += `tl.to("#rc${i - 1}",{x:-1100,duration:0.55,ease:"power3.inOut"},${f3(t)});tl.set("#rc${i - 1}",{visibility:"hidden"},${f3(t + 0.56)});`;
    s += `tl.fromTo("#rc${i} .stars svg",{opacity:0},{opacity:1,duration:0.2,stagger:0.05},${f3(t + 0.35)});\n`;
  });
  s += `tl.set("#rc2",{visibility:"hidden"},${f3(T.care)});\n`;
  s += cutIn("s3", T.care, T.end) + camera("s3", T.care, T.end - T.care, C.from ?? { scale: 1.0 }, C.to ?? { scale: 1.07 }, "sine.inOut");
  s += linesIn("cl", T.care + 0.1) + linesOut("cl", T.end);
  s += cutIn("s4", T.end) + camera("s4", T.end, duration - T.end, { scale: E.scale[0] }, { scale: E.scale[1] }, "sine.out");
  s += `gsap.set("#eb",{opacity:1});` + endIn("eb", T.end + 0.12);
  const assets = { "c/room.jpg": A.room, "c/phone.jpg": A.phone, "c/detail.jpg": C.photo, "c/page.png": reel.page };
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  const legibility = [1.5, T.cards[0] + 1.5, T.cards[1] + 1.5, T.cards[2] + 1.5, T.care + 1.2, 14.3];
  return { duration, html: page({ id: "r3-reviews", duration, brand, css, body, script: s }), assets, beats: legibility, contact, legibility };
}
