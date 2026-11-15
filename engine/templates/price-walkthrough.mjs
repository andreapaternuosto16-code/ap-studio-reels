// Template 1 — "Price in 10 s": a phone-style walk-through of getting an estimate on the
// client's site (service → details → estimate → send request). A clean mock in the brand's
// look. No prices unless the reel JSON gives `estimate.price`.
// Reel JSON: { photo, photoPosition?, hook, steps[4], note?, site, services[], selected,
//              details:[{label,value}], estimate:{summary[], price?}, endCard }
import { esc, calmIn, calmOut, hide, photoLayer, pushIn, endCard, page } from "../lib/page.mjs";

export function build(reel, brand) {
  if (reel.steps.length !== 4) throw new Error("price-walkthrough: give exactly 4 step captions");
  const T = { hook: 0.2, step0: 2.0, step: 2.0, note: 1.9, end: 3.0 };
  const stepAt = (i) => T.step0 + i * T.step;
  const noteAt = stepAt(4);
  const endAt = noteAt + (reel.note ? T.note : 0);
  const duration = +(endAt + T.end).toFixed(2);
  const price = reel.estimate?.price;

  const css = `
#hook{left:96px;width:820px;top:300px;font-size:116px}
.cap{left:96px;width:888px;top:270px;font-size:76px;display:flex;align-items:flex-start;gap:34px}
.cap .n{font-family:var(--head);font-weight:700;font-size:200px;line-height:.78}
.cap .c{font-family:var(--head);font-weight:700;font-size:76px;line-height:1.05;letter-spacing:-.015em;padding-top:6px}
#note{left:96px;width:888px;top:290px;font-size:76px;line-height:1.06}
#phone{left:305px;top:556px;width:470px;height:940px;border-radius:64px;background:var(--ink);padding:16px;
  box-shadow:0 30px 60px rgba(31,79,91,.18)}
#screen{position:relative;width:100%;height:100%;border-radius:50px;background:var(--cream);overflow:hidden}
.bar{position:absolute;top:0;left:0;right:0;height:96px;display:flex;align-items:flex-end;justify-content:center;
  padding-bottom:16px;font-size:24px;color:var(--teal);font-weight:600;border-bottom:2px solid var(--blush)}
.scr{position:absolute;top:96px;left:0;right:0;bottom:0;padding:40px 34px}
.scr h3{font-family:var(--head);font-weight:700;font-size:44px;line-height:1.05;margin-bottom:30px;color:var(--ink)}
.opt{border:3px solid var(--blush);border-radius:22px;padding:22px 24px;font-size:30px;font-weight:600;margin-bottom:16px;color:var(--ink);background:#fff}
.opt.sel{background:var(--teal);border-color:var(--teal);color:var(--cream)}
.row{display:flex;justify-content:space-between;align-items:center;padding:22px 0;border-bottom:2px solid var(--blush);font-size:30px;font-weight:500}
.row b{font-family:var(--head);font-size:34px;color:var(--teal)}
.est{margin-top:28px;border-radius:26px;background:var(--blush);padding:34px 28px;text-align:center}
.est .k{font-size:26px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--teal)}
.est .v{font-family:var(--head);font-weight:700;font-size:${price ? 76 : 36}px;margin-top:12px;color:var(--ink);line-height:1.1}
.sum{font-size:28px;line-height:1.5;color:var(--ink)}
.field{border:3px solid var(--blush);border-radius:18px;padding:20px 22px;font-size:28px;color:#6b8790;margin-bottom:16px;background:#fff}
.btn{margin-top:22px;border-radius:999px;background:var(--teal);color:var(--cream);text-align:center;padding:24px;font-size:32px;font-weight:700}
.done{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:var(--cream)}
.tick{width:120px;height:120px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center}
.done p{font-family:var(--head);font-weight:700;font-size:46px;color:var(--ink)}
`;
  const sel = reel.services.indexOf(reel.selected);
  const screens = [
    `<div class="scr" id="sc0"><h3>${esc(reel.screens?.service ?? "What do you need?")}</h3>${reel.services
      .map((x, i) => `<div class="opt${i === sel ? " pick" : ""}" id="${i === sel ? "pick" : `o${i}`}">${esc(x)}</div>`)
      .join("")}</div>`,
    `<div class="scr" id="sc1"><h3>${esc(reel.screens?.details ?? "About your home")}</h3>${reel.details
      .map((d) => `<div class="row"><span>${esc(d.label)}</span><b>${esc(d.value)}</b></div>`)
      .join("")}</div>`,
    `<div class="scr" id="sc2"><h3>${esc(reel.screens?.estimate ?? "Your estimate")}</h3><div class="sum">${reel.estimate.summary
      .map(esc)
      .join("<br>")}</div><div class="est"><div class="k">Estimate</div><div class="v">${esc(price ?? reel.estimate.placeholder ?? "Shown here on the site")}</div></div></div>`,
    `<div class="scr" id="sc3"><h3>${esc(reel.screens?.request ?? "Send your request")}</h3><div class="field">Your name</div><div class="field">Your email</div><div class="field">Preferred dates</div><div class="btn" id="btn">${esc(reel.screens?.button ?? "Send request")}</div>
     <div class="done" id="done"><div class="tick"><svg viewBox="0 0 24 24" width="70" height="70"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${brand.colors.cream}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><p>${esc(reel.screens?.sent ?? "Request sent")}</p></div></div>`,
  ];
  const body = `
${photoLayer("ph", "photo.jpg", reel.photoPosition)}
<div class="abs head txt" id="hook">${esc(reel.hook)}</div>
${reel.steps.map((c, i) => `<div class="abs cap txt" id="c${i}"><span class="n">${i + 1}</span><span class="c">${esc(c)}</span></div>`).join("\n")}
${reel.note ? `<div class="abs head txt" id="note">${esc(reel.note)}</div>` : ""}
<div class="abs zone" id="phone"><div id="screen"><div class="bar">${esc(reel.site)}</div>${screens.join("")}</div></div>
${endCard(reel.endCard)}`;

  let s = hide("#phone,#end,#sc1,#sc2,#sc3,#done") + reel.steps.map((_, i) => hide(`#c${i}`)).join("") + (reel.note ? hide("#note") : "");
  s += pushIn("#ph", 0, endAt, 0.06);
  s += calmIn("#hook", T.hook) + calmOut("#hook", T.step0 - 0.4);
  s += `tl.fromTo("#phone",{opacity:0,y:30},{opacity:1,y:0,duration:0.9,ease:"power2.out"},0.5);\n`;
  reel.steps.forEach((_, i) => {
    const at = stepAt(i);
    const next = i < 3 ? stepAt(i + 1) : reel.note ? noteAt : endAt;
    s += calmIn(`#c${i}`, at) + calmOut(`#c${i}`, next - 0.4);
  });
  // Screen 1: tap the service. Screens slide in from the right, calmly.
  s += `tl.to("#pick",{backgroundColor:"${brand.colors.teal}",borderColor:"${brand.colors.teal}",color:"${brand.colors.cream}",duration:0.3},${stepAt(0) + 0.9});\n`;
  for (let i = 1; i < 4; i++) {
    s += `tl.fromTo("#sc${i}",{opacity:1,xPercent:100},{xPercent:0,duration:0.55,ease:"power2.inOut"},${stepAt(i) - 0.1});\n`;
    s += `tl.to("#sc${i - 1}",{xPercent:-100,duration:0.55,ease:"power2.inOut"},${stepAt(i) - 0.1});\n`;
  }
  s += `tl.to("#btn",{scale:0.96,duration:0.12,yoyo:true,repeat:1},${stepAt(3) + 0.7});\n`;
  s += `tl.fromTo("#done",{opacity:0},{opacity:1,duration:0.3},${stepAt(3) + 1.0});\n`;
  if (reel.note) s += calmIn("#note", noteAt) + calmOut("#note", endAt - 0.4);
  s += `tl.to("#phone",{opacity:0,y:40,duration:0.4,ease:"power1.in"},${endAt - 0.4});\n`;
  s += calmIn("#end", endAt, { y: 24, d: 0.8 });
  return {
    duration,
    html: page({ id: "price-walkthrough", duration, brand, css, body, script: s }),
    assets: { "photo.jpg": reel.photo },
    beats: [1.2, ...reel.steps.map((_, i) => stepAt(i) + 1.5), ...(reel.note ? [noteAt + 1.2] : []), duration - 0.5],
  };
}
