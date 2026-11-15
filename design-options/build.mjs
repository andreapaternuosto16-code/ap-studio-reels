// Builds the 3 style options for the "3 tips" template as HyperFrames projects.
// Usage: node design-options/build.mjs   (then snapshot each with `hyperframes snapshot`)
// Brand values come from clients/xtrafreshhh/brand.json; wording from the reel JSON.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const brand = JSON.parse(readFileSync(join(root, "clients/xtrafreshhh/brand.json"), "utf8"));
const reel = JSON.parse(readFileSync(join(root, "clients/xtrafreshhh/reels/2026-11-26-3-tips.json"), "utf8"));
const kit = join(root, "clients/xtrafreshhh/kit");

// Timing (seconds) shared by all options: 12 s reel.
const T = { total: 12, tips: [3.0, 5.0, 7.0], end: 9.4 };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tipText = (t) => t.replace(/^\d+\.\s*/, "");

function page({ id, css, body, script }) {
  const c = brand.colors;
  return `<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${brand.fonts.googleCss}" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
:root{--ink:${c.ink};--teal:${c.teal};--cream:${c.cream};--blush:${c.blush};
--head:'${brand.fonts.headline}',sans-serif;--text:'${brand.fonts.text}',sans-serif;}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:var(--cream)}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;color:var(--ink);font-family:var(--text)}
.photo{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover;transform-origin:0% 30%}
.abs{position:absolute}
.label{font-family:var(--text);font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:38px}
.head{font-family:var(--head);font-weight:700;letter-spacing:-.02em;line-height:1.02}
.logo{display:block;height:auto}
${css}
</style>
</head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-duration="${T.total}" data-width="1080" data-height="1920">
${body}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${script}
tl.to({}, { duration: ${T.total} }, 0); // fill the slot (Herk law 11)
window.__timelines["${id}"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
}

const calmIn = (sel, at, y = 28, d = 0.7) =>
  `tl.fromTo(${JSON.stringify(sel)},{opacity:0,y:${y}},{opacity:1,y:0,duration:${d},ease:"power2.out"},${at});`;
const calmOut = (sel, at, d = 0.35) =>
  `tl.to(${JSON.stringify(sel)},{opacity:0,duration:${d},ease:"power1.in"},${at});`;

const photo = "photo.jpg";
const [t1, t2, t3] = reel.tips.map(tipText);
const endLine = esc(reel.endCard.line);
const url = esc(reel.endCard.url);

// ---------- Option A: "Wall list" — closest to the carousel. Left column on the wall,
// tips build into a list, photo keeps panning, end card on the same photo.
const A = page({
  id: "option-a",
  css: `
.col{left:96px;width:820px}
#lab{top:300px;color:var(--ink)}
#hd{top:360px;font-size:100px;color:var(--ink)}
.tip{left:96px;width:640px;font-size:48px;font-weight:500;line-height:1.18;color:var(--ink);display:flex;gap:26px}
.tip b{font-family:var(--head);font-weight:700;color:var(--teal);min-width:44px}
#e{left:96px;top:300px;width:820px}
#e .head{font-size:104px}
#e .logo{width:520px;margin-top:70px}
#e .url{font-family:var(--head);font-weight:600;font-size:60px;margin-top:22px;color:var(--teal)}
`,
  body: `
<img class="photo" id="ph" src="${photo}" style="object-position:0% 50%" />
<div class="abs col label" id="lab">${esc(reel.label)}</div>
<div class="abs col head" id="hd">${esc(reel.headline)}</div>
<div class="abs tip" id="t1" style="top:610px"><b>1</b><span>${esc(t1)}</span></div>
<div class="abs tip" id="t2" style="top:750px"><b>2</b><span>${esc(t2)}</span></div>
<div class="abs tip" id="t3" style="top:890px"><b>3</b><span>${esc(t3)}</span></div>
<div class="abs" id="e">
  <div class="head">${endLine}</div>
  <img class="logo" src="logo.png" alt="XtraFreshhh" />
  <div class="url">${url}</div>
</div>`,
  script: `
gsap.set("#e",{opacity:0});
tl.fromTo("#ph",{scale:1.10,xPercent:0},{scale:1.0,xPercent:-1.5,duration:${T.total},ease:"none"},0);
${calmIn("#lab", 0.2)}${calmIn("#hd", 0.35)}
${calmIn("#t1", T.tips[0])}${calmIn("#t2", T.tips[1])}${calmIn("#t3", T.tips[2])}
${calmOut("#lab,#hd,#t1,#t2,#t3", T.end - 0.4)}
${calmIn("#e", T.end, 24, 0.8)}`,
});

// ---------- Option B: "Big number" — echoes the carousel's giant "3". One tip at a time
// with a large Bricolage numeral; slow push-in; end card is a full cream page.
const B = page({
  id: "option-b",
  css: `
.wrap{left:96px;width:880px}
#lab{top:300px}
#hd{top:360px;font-size:128px}
.num{top:300px;font-family:var(--head);font-weight:700;font-size:400px;line-height:.8;color:var(--ink)}
.tx{top:690px;font-family:var(--head);font-weight:700;font-size:88px;width:660px;line-height:1.04;letter-spacing:-.015em}
#count{top:1460px;left:96px;font-size:36px;font-weight:600;letter-spacing:.08em;color:var(--teal)}
#end{inset:0;background:var(--cream)}
#end .in{position:absolute;left:96px;right:96px;top:560px;text-align:center}
#end .head{font-size:112px}
#end .logo{width:640px;margin:90px auto 0}
#end .url{font-family:var(--head);font-weight:600;font-size:64px;margin-top:28px;color:var(--teal)}
`,
  body: `
<img class="photo" id="ph" src="${photo}" style="object-position:0% 50%" />
<div class="abs wrap label" id="lab">${esc(reel.label)}</div>
<div class="abs wrap head" id="hd">${esc(reel.headline)}</div>
${[t1, t2, t3]
  .map(
    (t, i) => `<div class="abs wrap num" id="n${i + 1}">${i + 1}</div>
<div class="abs wrap tx" id="x${i + 1}">${esc(t)}</div>`,
  )
  .join("\n")}
<div class="abs" id="end"><div class="in">
  <div class="head">${endLine}</div>
  <img class="logo" src="logo.png" alt="XtraFreshhh" />
  <div class="url">${url}</div>
</div></div>`,
  script: `
gsap.set("#n1,#n2,#n3,#x1,#x2,#x3,#end",{opacity:0});
tl.fromTo("#ph",{scale:1.0},{scale:1.12,duration:${T.end},ease:"none"},0);
${calmIn("#lab", 0.2)}${calmIn("#hd", 0.35)}
${calmOut("#lab,#hd", T.tips[0] - 0.4)}
${[1, 2, 3]
  .map(
    (n) =>
      calmIn(`#n${n}`, T.tips[n - 1], 40) +
      calmIn(`#x${n}`, T.tips[n - 1] + 0.15) +
      (n < 3 ? calmOut(`#n${n},#x${n}`, T.tips[n] - 0.4) : calmOut(`#n${n},#x${n}`, T.end - 0.4)),
  )
  .join("\n")}
tl.set("#end",{opacity:1},${T.end});
${calmIn("#end .in", T.end, 30, 0.8)}`,
});

// ---------- Option C: "Centred & quiet" — centred type on the wall, one tip at a time,
// three small blush/teal progress dots, end card on a full blush page.
const C = page({
  id: "option-c",
  css: `
.ctr{left:90px;right:90px;text-align:center}
#lab{top:330px}
#hd{top:400px;font-size:116px}
.tip{top:420px;font-family:var(--head);font-weight:700;font-size:96px;line-height:1.05}
.tip small{display:block;font-family:var(--text);font-weight:600;font-size:40px;letter-spacing:.08em;color:var(--teal);margin-bottom:30px}
#dots{top:300px;display:flex;justify-content:center;gap:22px}
#dots i{width:18px;height:18px;border-radius:50%;background:var(--blush);display:block}
#end{inset:0;background:var(--blush)}
#end .in{position:absolute;left:90px;right:90px;top:560px;text-align:center}
#end .head{font-size:108px}
#end .logo{width:620px;margin:90px auto 0}
#end .url{font-family:var(--head);font-weight:600;font-size:64px;margin-top:26px;color:var(--ink)}
`,
  body: `
<img class="photo" id="ph" src="${photo}" style="object-position:0% 50%" />
<div class="abs ctr label" id="lab">${esc(reel.label)}</div>
<div class="abs ctr head" id="hd">${esc(reel.headline)}</div>
<div class="abs ctr" id="dots"><i id="d1"></i><i id="d2"></i><i id="d3"></i></div>
${[t1, t2, t3]
  .map((t, i) => `<div class="abs ctr tip" id="x${i + 1}"><small>Tip ${i + 1} of 3</small>${esc(t)}</div>`)
  .join("\n")}
<div class="abs" id="end"><div class="in">
  <div class="head">${endLine}</div>
  <img class="logo" src="logo.png" alt="XtraFreshhh" />
  <div class="url">${url}</div>
</div></div>`,
  script: `
gsap.set("#x1,#x2,#x3,#end,#dots",{opacity:0});
tl.fromTo("#ph",{xPercent:0,scale:1.06},{xPercent:-3,scale:1.06,duration:${T.end},ease:"none"},0);
${calmIn("#lab", 0.2)}${calmIn("#hd", 0.35)}
${calmOut("#lab,#hd", T.tips[0] - 0.4)}
tl.to("#dots",{opacity:1,duration:0.4},${T.tips[0]});
${[1, 2, 3]
  .map(
    (n) =>
      `tl.to("#d${n}",{backgroundColor:"${brand.colors.teal}",duration:0.3},${T.tips[n - 1]});` +
      calmIn(`#x${n}`, T.tips[n - 1] + 0.1) +
      (n < 3 ? calmOut(`#x${n}`, T.tips[n] - 0.4) : calmOut(`#x${n},#dots`, T.end - 0.4)),
  )
  .join("\n")}
tl.set("#end",{opacity:1},${T.end});
${calmIn("#end .in", T.end, 30, 0.8)}`,
});

for (const [name, html] of [["option-a", A], ["option-b", B], ["option-c", C]]) {
  const dir = join(here, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  copyFileSync(join(kit, "photos", reel.photo), join(dir, "photo.jpg"));
  copyFileSync(join(kit, brand.logo), join(dir, "logo.png"));
  writeFileSync(
    join(dir, "hyperframes.json"),
    readFileSync(join(here, "hyperframes.template.json"), "utf8"),
  );
}
console.log("built option-a, option-b, option-c");
