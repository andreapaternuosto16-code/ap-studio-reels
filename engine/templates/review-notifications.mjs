// Round 2 · C — "Reviews we love". Title with rising bubbles → each review arrives as a phone
// notification (lively drop + buzz, then held long enough to read: label "Google review", that
// review's own star rating, exact excerpt, public name) → optional count-up of the verified total
// with its check date (omitted when count is empty) → "Care in the little details." uncovered by a
// cloth wiping a fogged mirror, with glints → three detail shots with hand-drawn circles → end card.
// No numbers on screen except the verified total.
import { esc, endCard, page, stamp } from "../lib/page.mjs";
import { beats, f3, fxCss, bubbles, popWords, popIn, maskLines, maskIn, maskOut, glints, glintPop, callout, calloutDraw } from "../lib/fx.mjs";

const wrap = (text, max) => {
  const out = [];
  for (const w of text.split(" ")) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= max) out[out.length - 1] = last + " " + w; else out.push(w);
  }
  return out;
};
const starSvg = (fill, stroke) =>
  `<svg viewBox="0 0 24 24" width="58" height="58"><path fill="${fill}" stroke="${stroke}" stroke-width="1.6" d="M12 2.6l2.8 6 6.6.7-5 4.5 1.4 6.5L12 17l-5.8 3.3 1.4-6.5-5-4.5 6.6-.7z"/></svg>`;

export function build(reel, brand) {
  const bpm = reel.bpm ?? 100, B = 60 / bpm, b = beats(bpm);
  const revs = reel.reviews;
  if (revs.length < 1 || revs.length > 6) throw new Error("reviews: give 1–6 reviews");
  for (const r of revs) {
    const n = r.excerpt.trim().split(/\s+/).length;
    if (n > 15) throw new Error(`reviews: excerpt "${r.excerpt.slice(0, 30)}…" has ${n} words, max 15`);
    if (![1, 2, 3, 4, 5].includes(r.rating)) throw new Error("reviews: rating must be the review's own 1–5");
  }
  // hold each card long enough to read: ~2 s + 0.2 s per word, 3–4.8 s, snapped to whole beats
  const hold = revs.map((r) => Math.max(5, Math.min(8, Math.round((2.0 + 0.2 * r.excerpt.split(/\s+/).length) / B))));
  let k = 4;
  const at = revs.map((_, i) => { const t = b(k); k += hold[i]; return t; });
  const hasCount = reel.count && reel.count.value !== "" && reel.count.value != null;
  const tCount = b(k); if (hasCount) k += 4;
  const tCare = b(k); k += 5;
  const tRooms = [b(k), b(k + 2), b(k + 4)]; k += 6;
  const tEnd = b(k); k += 5;
  const duration = b(k);
  if (duration > 30.5) console.warn(`reviews: ${duration.toFixed(1)} s — the reviewer prefers 25–30 s; use fewer or shorter excerpts`);
  const A = reel.assets, D = reel.kitD;
  const sample = !!reel.sample;
  const bub1 = bubbles("ba", 12, { seed: 4 });
  const bub2 = bubbles("bb", 8, { seed: 9, from: 1600, to: 300 });
  const bub3 = bubbles("bc", 14, { seed: 12, from: 1750, to: 200 });
  const care = wrap(reel.careLine, 14);

  const css = `${fxCss}
.full{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
#t1w,#bgw,#cw{position:absolute;inset:0;overflow:hidden}
#t1{transform-origin:50% 35%}
#title{left:170px;width:760px;top:330px;text-align:center;font-family:var(--head);font-weight:700;font-size:164px;line-height:.98}
#bg{filter:blur(7px);transform:scale(1.08)}
#bgw{opacity:0}
.card{position:absolute;left:70px;top:470px;width:940px;border-radius:48px;background:rgba(255,255,255,.97);
  box-shadow:0 26px 60px rgba(31,79,91,.28);padding:34px 44px 44px;opacity:0}
.ghost{position:absolute;left:70px;width:940px;height:520px;border-radius:48px;background:rgba(255,255,255,.75);opacity:0}
.smp{font-size:34px;font-weight:700;letter-spacing:.06em;color:#B3261E;margin-bottom:18px}
.hd{display:flex;align-items:center;gap:18px}
.hd .ic{width:68px;height:68px;border-radius:18px;background:var(--teal);display:flex;align-items:center;justify-content:center}
.hd .lb{font-size:44px;font-weight:600;color:var(--teal)}
.hd .ago{margin-left:auto;font-size:30px;color:#6b8790;font-weight:600}
.stars{display:flex;gap:6px;margin:22px 0 14px}
.q{font-family:var(--head);font-weight:700;font-size:66px;line-height:1.06;color:var(--ink)}
.nm{margin-top:24px;font-size:46px;font-weight:600;color:var(--teal)}
#cw{opacity:0}
#cimg{transform-origin:80% 35%}
#cnt{left:90px;width:900px;top:300px;opacity:0}
#cnum{font-family:var(--head);font-weight:700;font-size:300px;line-height:.85;color:var(--ink)}
#clab{font-family:var(--head);font-weight:700;font-size:96px;line-height:1;margin-top:10px}
#cdate{font-size:42px;font-weight:600;color:var(--teal);margin-top:22px}
#mir{position:absolute;inset:0;opacity:0}
#mir img{position:absolute;inset:0;width:1080px;height:1920px;opacity:0}
#care{left:150px;width:780px;top:470px;text-align:center;font-family:var(--head);font-weight:700;font-size:104px;line-height:1.02;opacity:0}
#rooms{position:absolute;inset:0;background:var(--cream);opacity:0}
.rp{position:absolute;left:0;top:620px;width:1080px;height:1300px;overflow:hidden;opacity:0}
.rp img{position:absolute;left:0;width:1080px;height:1920px}
.rw{left:90px;width:900px;top:300px;font-family:var(--head);font-weight:700;font-size:124px;line-height:1;opacity:0}
#endw{position:absolute;inset:0;background:var(--blush);opacity:0}
.stamp{z-index:30}
`;
  const ic = `<svg viewBox="0 0 24 24" width="40" height="40"><path fill="${brand.colors.cream}" d="M12 2.6l2.8 6 6.6.7-5 4.5 1.4 6.5L12 17l-5.8 3.3 1.4-6.5-5-4.5 6.6-.7z"/></svg>`;
  const card = (r, i) => `<div class="card" id="rv${i}">
  ${sample ? `<div class="smp ui">${esc(reel.sampleText)}</div>` : ""}
  <div class="hd"><div class="ic">${ic}</div><div class="lb txt">${esc(reel.label)}</div><div class="ago ui">now</div></div>
  <div class="stars" aria-label="${r.rating} out of 5">${[0, 1, 2, 3, 4].map((s) => starSvg(s < r.rating ? brand.colors.teal : "none", brand.colors.teal)).join("")}</div>
  <div class="q txt">“${esc(r.excerpt)}”</div>
  <div class="nm txt">${esc(r.name)}</div>
</div>`;
  const rooms = reel.rooms;
  const body = `
<div id="t1w"><img class="full" id="t1" src="c/title.jpg" /></div>
${popWords("title", reel.title, "txt")}
${bub1.html}
<div id="bgw"><img class="full" id="bg" src="c/phone.jpg" /></div>
<div class="ghost" id="g1" style="top:500px"></div><div class="ghost" id="g2" style="top:528px"></div>
${revs.map(card).join("\n")}
${hasCount ? `<div id="cw"><img class="full" id="cimg" src="c/title.jpg" /></div>
<div class="abs" id="cnt"><div id="cnum" class="txt">0</div><div id="clab" class="txt">${esc(reel.count.label)}</div><div id="cdate" class="txt">${esc(reel.count.checked)}</div></div>
${bub2.html}${sample ? `<div id="cst">${stamp(reel.sampleText, 1160)}</div>` : ""}` : ""}
<div id="mir">${[1, 2, 3, 4, 5, 6].map((n) => `<img id="m${n}" src="c/mirror-0${n}.jpg" />`).join("")}
  ${maskLines("care", care, "txt-wrap")}
  ${glints("mg", [{ x: 300, y: 380, w: 130 }, { x: 760, y: 520, w: 100, v: 2 }, { x: 520, y: 980, w: 90, v: 3 }, { x: 860, y: 900, w: 70, v: 4 }])}
</div>
<div id="rooms">
  ${rooms.map((r, i) => `<div class="rp" id="rp${i}"><img src="c/room${i}.jpg" style="top:${-r.offset}px" /></div>`).join("")}
  ${rooms.map((r, i) => callout(`co${i}`, { ...r.circle, color: brand.colors.teal })).join("")}
  ${rooms.map((r, i) => maskLines(`rw${i}`, wrap(r.word, 13), "rw")).join("")}
</div>
<div id="endw">${bub3.html}${endCard(reel.endCard)}</div>`;

  let s = `gsap.set(".rw,#care",{opacity:1});gsap.set(".rw .ml>span,#care .ml>span",{yPercent:110});gsap.set(".callout",{opacity:0});\n`;
  // 1 · title pops word by word, bubbles rise, camera eases in
  s += `tl.fromTo("#t1",{scale:1.0},{scale:1.1,duration:${f3(at[0])},ease:"sine.out"},0);\n` + popIn("title", 0.06, 0.14) + bub1.anim(0.1);
  s += `tl.to("#title",{opacity:0,y:-40,duration:0.3,ease:"power2.in"},${f3(at[0] - 0.3)});\n`;
  // 2 · review notifications
  s += `tl.set("#bgw",{opacity:1},${f3(at[0] - 0.02)});tl.fromTo("#bgw",{clipPath:"circle(0% at 50% 20%)"},{clipPath:"circle(130% at 50% 20%)",duration:0.45,ease:"power2.inOut"},${f3(at[0] - 0.25)});\n`;
  s += `tl.fromTo("#bg",{xPercent:0},{xPercent:-3,duration:${f3(tCount - at[0])},ease:"none"},${f3(at[0])});\n`;
  revs.forEach((r, i) => {
    const t = at[i];
    s += `tl.fromTo("#bg",{x:0},{x:8,duration:0.04,yoyo:true,repeat:5,ease:"none"},${f3(t - 0.05)});`;
    s += `tl.fromTo("#rv${i}",{opacity:0,y:-520,scale:0.9,rotation:-2},{opacity:1,y:0,scale:1,rotation:0,duration:0.55,ease:"back.out(1.5)"},${f3(t)});`;
    s += `tl.fromTo("#rv${i} .stars svg",{scale:0},{scale:1,duration:0.25,ease:"back.out(3)",stagger:0.06},${f3(t + 0.35)});`;
    if (i === 1) s += `tl.to("#g1",{opacity:1,duration:0.3},${f3(t + 0.2)});`;
    if (i === 2) s += `tl.to("#g2",{opacity:0.6,duration:0.3},${f3(t + 0.2)});`;
    const end = i < revs.length - 1 ? at[i + 1] : tCount;
    s += `tl.to("#rv${i}",{y:${i < revs.length - 1 ? 260 : -200},scale:0.9,opacity:0,duration:0.4,ease:"power2.in"},${f3(end - 0.15)});\n`;
  });
  s += `tl.to("#g1,#g2",{opacity:0,duration:0.25},${f3(tCount - 0.2)});tl.set("#bgw",{opacity:0},${f3(tCount + 0.3)});\n`;
  // 3 · verified total, counted up (only if supplied)
  if (hasCount) {
    const v = Number(reel.count.value);
    s += `tl.set("#cw",{opacity:1},${f3(tCount)});tl.fromTo("#cw",{yPercent:100},{yPercent:0,duration:0.4,ease:"power3.out"},${f3(tCount - 0.1)});tl.fromTo("#cimg",{scale:1.25},{scale:1.32,duration:2.4},${f3(tCount)});\n`;
    s += `tl.fromTo("#cnt",{opacity:0,y:30},{opacity:1,y:0,duration:0.4},${f3(tCount + 0.2)});\n`;
    s += `(function(){var o={v:0};tl.to(o,{v:${v},duration:1.2,ease:"power2.out",onUpdate:function(){document.getElementById("cnum").textContent=Math.round(o.v);}},${f3(tCount + 0.25)});})();\n`;
    s += bub2.anim(tCount + 0.3);
    if (sample) s += `tl.fromTo("#cst",{opacity:0},{opacity:1,duration:0.2},${f3(tCount + 0.3)});tl.set("#cst",{opacity:0},${f3(tCare)});`;
    s += `tl.to("#cnt",{opacity:0,duration:0.25},${f3(tCare - 0.25)});\n`;
  }
  // 4 · fogged mirror: the cloth wipes it clear and uncovers the line, then glints
  s += `tl.set("#mir",{opacity:1},${f3(tCare - 0.02)});tl.fromTo("#mir",{xPercent:100},{xPercent:0,duration:0.35,ease:"power3.out"},${f3(tCare - 0.2)});tl.set("#m1",{opacity:1},${f3(tCare - 0.2)});\n`;
  const wipe0 = tCare + 0.3, step = 0.3;
  for (let n = 2; n <= 6; n++) s += `tl.to("#m${n}",{opacity:1,duration:${step},ease:"none"},${f3(wipe0 + (n - 2) * step)});`;
  s += `\ntl.set("#care",{opacity:1},${f3(wipe0)});gsap.set("#care .ml>span",{yPercent:0});tl.fromTo("#care",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:${f3(5 * step)},ease:"none"},${f3(wipe0)});\n`;
  s += glintPop("mg", 4, wipe0 + 5 * step + 0.05, 0.12);
  s += `tl.to("#care",{opacity:0,duration:0.25},${f3(tRooms[0] - 0.25)});\n`;
  // 5 · details, each with a hand-drawn circle
  s += `tl.set("#rooms",{opacity:1},${f3(tRooms[0] - 0.02)});tl.fromTo("#rooms",{yPercent:100},{yPercent:0,duration:0.4,ease:"power3.out"},${f3(tRooms[0] - 0.25)});\n`;
  tRooms.forEach((t, i) => {
    s += `tl.set("#rp${i}",{opacity:1},${f3(t - 0.2)});` + (i ? `tl.fromTo("#rp${i}",{yPercent:100},{yPercent:0,duration:0.35,ease:"power3.out"},${f3(t - 0.2)});` : "");
    s += `tl.fromTo("#rp${i} img",{scale:1.08},{scale:1.0,duration:1.4,ease:"power2.out"},${f3(t - 0.2)});`;
    s += maskIn(`rw${i}`, 2, t);
    s += `tl.set("#co${i}",{opacity:1},${f3(t + 0.2)});` + calloutDraw(`co${i}`, t + 0.2, 0.5);
    if (i < 2) s += maskOut(`rw${i}`, tRooms[i + 1] - 0.3) + `tl.to("#co${i}",{opacity:0,duration:0.2},${f3(tRooms[i + 1] - 0.25)});\n`;
  });
  // 6 · end card on blush with bubbles
  s += `tl.set("#endw",{opacity:1},${f3(tEnd)});tl.fromTo("#endw",{clipPath:"circle(0% at 50% 50%)"},{clipPath:"circle(120% at 50% 50%)",duration:0.5,ease:"power2.inOut"},${f3(tEnd - 0.1)});\n`;
  s += `tl.fromTo("#end",{opacity:0,y:24},{opacity:1,y:0,duration:0.6,ease:"power2.out"},${f3(tEnd + 0.3)});\n` + bub3.anim(tEnd + 0.2);

  const assets = {
    "c/title.jpg": A.title, "c/phone.jpg": A.phone,
    ...Object.fromEntries(rooms.map((r, i) => [`c/room${i}.jpg`, r.photo])),
    ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`c/mirror-0${n}.jpg`, `${D}/mirror-wipe/frame-0${n}.jpg`])),
    ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`d/glints-0${n}.png`, `${D}/effect-parts/glints-0${n}.png`])),
    ...Object.fromEntries([1, 2, 3, 4].map((n) => [`d/bubbles-0${n}.png`, `${D}/effect-parts/bubbles-0${n}.png`])),
  };
  const contact = [1.4, at[0] + 1.6, at[Math.min(3, revs.length - 1)] + 1.6, hasCount ? tCount + 1.8 : tCare + 1.0, tCare + 2.6, tRooms[2] + 0.9, tEnd + 2.0].slice(0, 7);
  const six = hasCount ? [contact[0], contact[1], contact[3], contact[4], contact[5], contact[6]] : [contact[0], contact[1], contact[2], contact[4], contact[5], contact[6]];
  return { duration, html: page({ id: "review-notifications", duration, brand, css, body, script: s }), assets, beats: six, contact: six };
}
