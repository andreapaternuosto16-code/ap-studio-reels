// Round 2 · B — Christmas countdown. Split-flap board flips to "<N> DAYS TO / CHRISTMAS" over a calm
// wall with light snow → "3 jobs to do now" → three numbered jobs (genuinely step-by-step) on inset
// photo cards, each with its own camera move (dolly in / rack focus / pull back) → the last card opens
// into a slow pan across the house and "You've got this." is written on by hand → end card.
// The day number is a JSON slot ("days").
import { esc, endCard, page } from "../lib/page.mjs";
import { beats, f3, fxCss, snow, maskLines, maskIn, maskOut, flapBoard, handwrite, handwriteIn, glints, glintPop } from "../lib/fx.mjs";

const wrap = (text, max) => {
  const out = [];
  for (const w of text.split(" ")) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= max) out[out.length - 1] = last + " " + w; else out.push(w);
  }
  return out;
};

export function build(reel, brand) {
  const b = beats(reel.bpm ?? 96);
  const T = { board: 0, intro: b(5), jobs: [b(8), b(11), b(14)], pan: b(17), hand: b(19), end: b(24), out: b(28.5) };
  const duration = T.out;
  const days = Number(reel.days);
  if (!Number.isInteger(days) || days < 1 || days > 99) throw new Error("countdown: days must be 1–99");
  const rows = [days === 1 ? "1 DAY TO" : `${days} DAYS TO`, "CHRISTMAS"];
  const board = flapBoard("fb", rows);
  const jobs = reel.jobs.map((j) => j.replace(/^\d+\.\s*/, ""));
  if (jobs.length !== 3) throw new Error("countdown: give exactly 3 jobs");
  const sn = snow("sn", 70, { start: 0, end: duration });
  const sn2 = snow("sb", 40, { seed: 23, color: brand.colors.blush, start: T.end, end: duration });
  const A = reel.assets, D = reel.kitD;
  const intro = wrap(reel.intro, 11);

  const css = `${fxCss}${board.css}
.full{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
#p1w{position:absolute;inset:0;overflow:hidden}
#p1{transform-origin:50% 30%}
#fb{left:0;right:0;top:330px}
#in{left:90px;width:900px;top:330px;font-family:var(--head);font-weight:700;font-size:150px;line-height:.98;opacity:0}
#jobs{position:absolute;inset:0;background:var(--cream);opacity:0}
.num{position:absolute;left:0;top:0;font-family:var(--head);font-weight:700;font-size:290px;line-height:.86;color:var(--ink)}
.numw{position:absolute;left:70px;top:236px;width:220px;height:260px;overflow:hidden}
.jt{left:300px;width:710px;top:262px;font-family:var(--head);font-weight:700;font-size:78px;line-height:1.04;opacity:0}
.card{position:absolute;left:70px;top:610px;width:940px;height:900px;border-radius:40px;overflow:hidden;box-shadow:0 20px 40px rgba(31,79,91,.22)}
.card img{width:100%;height:100%;object-fit:cover}
#pan{position:absolute;inset:0;overflow:hidden;opacity:0}
#strip{position:absolute;left:0;top:0;height:1920px;width:auto}
#yg{left:80px;right:80px;top:250px;text-align:center}
#endw{position:absolute;inset:0;background:var(--cream);opacity:0}
.endcard .end-line{font-size:86px;margin-bottom:46px}
.endcard .logo{width:480px}
#pol{position:absolute;left:560px;top:960px;width:440px;height:560px;background:#fff;padding:22px 22px 80px;box-shadow:0 18px 36px rgba(31,79,91,.22);transform:rotate(5deg)}
#pol img{width:100%;height:100%;object-fit:cover}
.flake{z-index:20}
`;
  const body = `
<div id="p1w"><img class="full" id="p1" src="b/room.jpg" /></div>
${board.html}
${maskLines("in", intro)}
<div id="jobs">
  ${jobs.map((j, i) => `<div class="numw" id="nw${i}"><div class="num txt" id="nu${i}">${i + 1}</div></div>`).join("")}
  ${jobs.map((j, i) => maskLines(`jt${i}`, wrap(j, 15), "jt")).join("")}
  ${jobs.map((j, i) => `<div class="card" id="cd${i}"><img id="ci${i}" src="b/job${i}.jpg" /></div>`).join("")}
</div>
<div id="pan"><img id="strip" src="b/strip.jpg" />${handwrite("yg", reel.handwritten, { size: 150 })}</div>
<div id="endw">
  ${sn2.html}
  <div id="pol"><img src="b/door.jpg" /></div>
  ${glints("eg", [{ x: 640, y: 1000, w: 100 }, { x: 960, y: 1260, w: 80, v: 2 }])}
  ${endCard(reel.endCard)}
</div>
${sn.html}`;

  let s = `gsap.set("#in,${jobs.map((_, i) => `#jt${i}`).join(",")}",{opacity:1});gsap.set("#in .ml>span,.jt .ml>span",{yPercent:110});\n`;
  s += `gsap.set("${jobs.map((_, i) => `#cd${i}`).join(",")}",{opacity:0});gsap.set("${jobs.map((_, i) => `#nu${i}`).join(",")}",{yPercent:110});\n`;
  s += sn.script + sn2.script;
  // 1 · board pops on, flips to the count (first second has motion), camera eases in
  s += `tl.fromTo("#p1",{scale:1.0},{scale:1.1,duration:${f3(T.intro)},ease:"sine.out"},0);\n`;
  s += `tl.fromTo("#fb",{opacity:0,scale:0.9},{opacity:1,scale:1,duration:0.3,ease:"back.out(2)"},0.02);\n`;
  s += board.script(0.12);
  // 2 · board tips away, "3 jobs to do now" rises; camera punch on the cut
  s += `tl.to("#fb",{opacity:0,rotationX:80,y:-40,transformPerspective:900,duration:0.35,ease:"power2.in"},${f3(T.intro - 0.3)});\n`;
  s += `tl.to("#p1",{scale:1.17,duration:0.35,ease:"power3.out"},${f3(T.intro)});\n`;
  s += maskIn("in", intro.length, T.intro + 0.05);
  // 3 · jobs on cards: cream sheet covers up from the bottom
  s += `tl.set("#jobs",{opacity:1},${f3(T.jobs[0] - 0.05)});tl.fromTo("#jobs",{yPercent:100},{yPercent:0,duration:0.45,ease:"power3.inOut"},${f3(T.jobs[0] - 0.3)});\n`;
  const moves = [
    (i, t, d) => `tl.fromTo("#ci${i}",{scale:1.04},{scale:1.24,duration:${f3(d)},ease:"power1.out"},${f3(t)});`, // dolly in
    (i, t, d) => `tl.fromTo("#ci${i}",{scale:1.16,filter:"blur(18px)"},{scale:1.08,filter:"blur(0px)",duration:0.8,ease:"power2.out"},${f3(t + 0.15)});tl.to("#ci${i}",{scale:1.02,duration:${f3(d - 0.95)},ease:"none"},${f3(t + 0.95)});`, // rack focus
    (i, t, d) => `tl.fromTo("#ci${i}",{scale:1.3,yPercent:-4},{scale:1.04,yPercent:0,duration:${f3(d)},ease:"power2.out"},${f3(t)});`, // pull back
  ];
  T.jobs.forEach((t, i) => {
    const next = i < 2 ? T.jobs[i + 1] : T.pan;
    s += `tl.fromTo("#nu${i}",{yPercent:110},{yPercent:0,duration:0.5,ease:"power3.out"},${f3(t)});`;
    s += maskIn(`jt${i}`, 3, t + 0.12);
    s += `tl.set("#cd${i}",{opacity:1},${f3(t - 0.02)});`;
    if (i > 0) s += `tl.fromTo("#cd${i}",{x:1100,rotation:4},{x:0,rotation:0,duration:0.5,ease:"power3.inOut"},${f3(t - 0.12)});tl.to("#cd${i - 1}",{x:-1100,rotation:-5,duration:0.5,ease:"power3.inOut"},${f3(t - 0.12)});`;
    s += moves[i](i, t, next - t + 0.6) + "\n";
    if (i < 2) s += `tl.to("#nu${i}",{yPercent:-110,duration:0.3,ease:"power2.in"},${f3(next - 0.3)});tl.set("#nu${i}",{opacity:0},${f3(next + 0.01)});` + maskOut(`jt${i}`, next - 0.32);
  });
  s += `tl.to("#nu2",{yPercent:-110,duration:0.3,ease:"power2.in"},${f3(T.pan - 0.1)});tl.set("#nu2",{opacity:0},${f3(T.pan + 0.21)});` + maskOut("jt2", T.pan - 0.1);
  // 4 · the card opens into the panorama, slow pan, handwritten encouragement
  s += `tl.set("#pan",{opacity:1},${f3(T.pan)});tl.fromTo("#pan",{clipPath:"inset(610px 70px 410px 70px round 40px)"},{clipPath:"inset(0px 0px 0px 0px round 0px)",duration:0.65,ease:"power3.inOut"},${f3(T.pan)});\n`;
  s += `tl.fromTo("#strip",{x:-80},{x:-3240,duration:${f3(T.end - T.pan)},ease:"sine.inOut"},${f3(T.pan)});\n`;
  s += handwriteIn("yg", [...reel.handwritten].length, T.hand);
  // 5 · end card: cream page, blush snow, front-door polaroid drops in
  s += `tl.set("#endw",{opacity:1},${f3(T.end)});tl.fromTo("#endw",{yPercent:-100},{yPercent:0,duration:0.5,ease:"power3.out"},${f3(T.end)});\n`;
  s += `tl.fromTo("#pol",{y:-700,rotation:-10},{y:0,rotation:5,duration:0.7,ease:"back.out(1.3)"},${f3(T.end + 0.3)});\n`;
  s += `tl.fromTo("#end",{opacity:0,y:24},{opacity:1,y:0,duration:0.6,ease:"power2.out"},${f3(T.end + 0.35)});\n`;
  s += glintPop("eg", 2, T.end + 1.1, 0.25);

  const assets = {
    "b/room.jpg": A.board, "b/strip.jpg": A.strip, "b/door.jpg": A.end,
    ...Object.fromEntries(A.jobs.map((p, i) => [`b/job${i}.jpg`, p])),
    ...Object.fromEntries([1, 2].map((n) => [`d/glints-0${n}.png`, `${D}/effect-parts/glints-0${n}.png`])),
  };
  const contact = [1.2, T.intro + 1.0, T.jobs[0] + 1.3, T.jobs[1] + 1.3, T.hand + 1.8, T.end + 2.0];
  return { duration, html: page({ id: "countdown", duration, brand, css, body, script: s }), assets, beats: contact, contact };
}
