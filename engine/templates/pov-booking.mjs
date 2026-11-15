// Round 2 · A — "POV: the clean is booked". Phone in hand → three separate notification stages on
// the real phone screen (persistent "Example booking" label) → whip-pan across the home → room
// photos land like dealt prints, each with spray mist, glints and a ✓ stamp → cinematic push on the
// feet-up shot → end card with the cleaning kit cut-outs. No numbers. Cuts sit on the music's beats.
import { esc, endCard, page } from "../lib/page.mjs";
import { beats, f3, fxCss, glints, glintPop, mist, mistPuff, stampBadge, stampIn, maskLines, maskIn, maskOut, popWords, popIn, cutout, quadMatrix } from "../lib/fx.mjs";

const wrap = (text, max) => {
  const out = [];
  for (const w of text.split(" ")) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= max) out[out.length - 1] = last + " " + w; else out.push(w);
  }
  return out;
};

export function build(reel, brand) {
  const b = beats(reel.bpm ?? 104);
  const T = {
    notes: [b(2), b(5), b(8)], whip: b(12), board: b(14),
    cards: [b(14), b(15.5), b(17), b(18.5)], feet: b(21), end: b(25), out: b(30),
  };
  const duration = T.out;
  const A = reel.assets; // photo paths, relative to the client folder
  const D = reel.kitD;   // cleaning-kit folder (assets/D)
  const scr = reel.screen; // measured inner corners of the blank phone screen in the photo
  const SW = 420, SH = 920;
  const M = quadMatrix(SW, SH, scr.corners);
  const cx = scr.focus[0], cy = scr.focus[1];

  const css = `${fxCss}
.full{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
#cam{position:absolute;inset:0;transform-origin:${cx}px ${cy}px}
#screen{position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;transform-origin:0 0;transform:${M};border-radius:38px;overflow:hidden;
  background:linear-gradient(170deg,#FFF7F4 0%,#FDEDE7 55%,#FADBD2 100%)}
#lab{position:absolute;left:0;right:0;top:26px;text-align:center;font-weight:600;font-size:36px;letter-spacing:.02em;color:var(--teal)}
#hook{position:absolute;left:22px;right:22px;top:92px;text-align:center;font-family:var(--head);font-weight:700;font-size:66px;line-height:1.02;color:var(--ink)}
.nt{position:absolute;left:14px;width:392px;border-radius:28px;background:rgba(255,255,255,.95);box-shadow:0 8px 22px rgba(31,79,91,.16);padding:16px 18px 18px;opacity:0}
.nt .row{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.nt .ic{width:46px;height:46px;border-radius:12px;background:var(--teal);display:flex;align-items:center;justify-content:center}
.nt .meta{font-size:24px;font-weight:600;color:#6b8790}
.nt .msg{font-size:40px;font-weight:600;line-height:1.1;color:var(--ink)}
#strip{position:absolute;left:0;top:0;height:1920px;width:auto;opacity:0}
#board{position:absolute;inset:0;background:var(--cream);opacity:0}
#rl{left:80px;width:920px;top:250px;font-family:var(--head);font-weight:700;font-size:86px;line-height:1.04;opacity:0}
.rc{position:absolute;left:210px;top:560px;width:660px;height:880px;border:16px solid #fff;border-radius:26px;overflow:hidden;
  box-shadow:0 22px 44px rgba(31,79,91,.25);opacity:0;background:#fff}
.rc img{width:100%;height:100%;object-fit:cover}
#feet{position:absolute;inset:0;overflow:hidden;opacity:0}
#fimg{transform-origin:60% 65%}
#fband{position:absolute;left:0;right:0;top:0;height:640px;background:var(--cream)}
#fl{left:80px;width:920px;top:270px;font-family:var(--head);font-weight:700;font-size:100px;line-height:1.02}
#endbg{position:absolute;inset:0;background:var(--cream);opacity:0}
.endcard{top:260px}
`;
  const icon = `<svg viewBox="0 0 24 24" width="30" height="30"><path fill="${brand.colors.cream}" d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/></svg>`;
  const noteTop = [330, 494, 658];
  const rl = wrap(reel.roomsLine, 20);
  const fl = wrap(reel.feetLine, 18);
  const rot = [-5, 4, -3, 5];
  const body = `
<div id="cam">
  <img class="full" src="a/phone.jpg" />
  <div id="screen">
    <div id="lab" class="txt">${esc(reel.exampleLabel)}</div>
    ${popWords("hook", reel.hook, "txt")}
    ${reel.notes.map((n, i) => `<div class="nt" id="n${i}" style="top:${noteTop[i]}px"><div class="row"><div class="ic">${icon}</div><div class="meta ui">${esc(reel.sender)} · now</div></div><div class="msg txt">${esc(n)}</div></div>`).join("")}
    ${glints("sg", [{ x: 360, y: 350, w: 90 }, { x: 60, y: 520, w: 70, v: 2 }, { x: 370, y: 690, w: 80, v: 3 }])}
  </div>
</div>
<img id="strip" src="a/strip.jpg" />
<div id="board">
  ${maskLines("rl", rl)}
  ${reel.rooms.map((r, i) => `<div class="rc" id="c${i}" style="transform:rotate(${rot[i]}deg)"><img src="a/room${i}.jpg" /></div>`).join("")}
  ${reel.rooms.map((r, i) => stampBadge(`st${i}`, r, { x: 150 + (i % 2) * 340, y: 1300, rot: rot[i] * -1.2 })).join("")}
  ${reel.rooms.map((r, i) => mist(`mi${i}`, { x: i % 2 ? 560 : -40, y: 380, w: 560, flip: i % 2 === 1 })).join("")}
  ${reel.rooms.map((r, i) => glints(`rg${i}_`, [{ x: 300 + (i * 97) % 380, y: 640, w: 110, v: i }, { x: 780, y: 820 + (i % 2) * 120, w: 80, v: i + 1 }, { x: 260, y: 1100, w: 70, v: i + 2 }])).join("")}
</div>
<div id="feet"><img class="full" id="fimg" src="a/feet.jpg" /><div id="fband">${maskLines("fl", fl)}</div></div>
<div id="endbg">
  ${cutout("k1", "d/01-spray-bottle.png", { x: -40, y: 960, w: 560, rot: -6, shadow: "d/01-spray-bottle-shadow.png" })}
  ${cutout("k2", "d/06-bucket-supplies.png", { x: 470, y: 930, w: 620, shadow: "d/06-bucket-supplies-shadow.png" })}
  ${cutout("k3", "d/02-folded-cloth.png", { x: 250, y: 1190, w: 440, rot: 4, shadow: "d/02-folded-cloth-shadow.png" })}
  ${glints("eg", [{ x: 760, y: 1010, w: 110 }, { x: 180, y: 1000, w: 80, v: 3 }, { x: 940, y: 1180, w: 70, v: 1 }])}
  ${endCard(reel.endCard)}
</div>`;

  let s = `gsap.set("#rl,#fl",{opacity:1});gsap.set("#rl .ml>span,#fl .ml>span",{yPercent:110});\n`;
  // 1 · phone: hook pops on in the first second, camera pushes towards the screen
  s += `tl.fromTo("#cam",{scale:1.16},{scale:1.42,duration:${f3(T.whip)},ease:"sine.inOut"},0);\n`;
  s += popIn("hook", 0.08);
  s += `tl.fromTo("#lab",{opacity:0,y:-10},{opacity:1,y:0,duration:0.4},0.35);\n`;
  T.notes.forEach((t, i) => {
    s += `tl.fromTo("#cam",{x:0},{x:6,duration:0.04,yoyo:true,repeat:5,ease:"none"},${f3(t - 0.12)});`; // buzz
    s += `tl.fromTo("#n${i}",{opacity:0,y:-46,scale:0.94},{opacity:1,y:0,scale:1,duration:0.5,ease:"back.out(1.7)"},${f3(t)});`;
    s += `tl.fromTo("#sg${i}",{opacity:0,scale:0.2,rotation:-30},{opacity:1,scale:1,rotation:0,duration:0.22,ease:"back.out(2.5)"},${f3(t + 0.35)});tl.to("#sg${i}",{opacity:0,scale:0.5,duration:0.3},${f3(t + 0.8)});\n`;
  });
  // 2 · whip-pan across the house (HF whip-pan idea: blur rides the move, velocity matched at the cut)
  s += `tl.to("#cam",{x:-1150,filter:"blur(18px)",duration:0.3,ease:"power2.in"},${f3(T.whip)});tl.set("#cam",{opacity:0},${f3(T.whip + 0.32)});\n`;
  s += `tl.set("#strip",{opacity:1},${f3(T.whip)});tl.fromTo("#strip",{x:1080,filter:"blur(18px)"},{x:-1650,filter:"blur(6px)",duration:0.62,ease:"power2.in"},${f3(T.whip)});\n`;
  s += `tl.to("#strip",{x:-3240,filter:"blur(0px)",duration:${f3(T.board - T.whip - 0.62 - 0.22)},ease:"power2.out"},${f3(T.whip + 0.62)});\n`;
  s += `tl.to("#strip",{x:-4320,filter:"blur(16px)",duration:0.22,ease:"power2.in"},${f3(T.board - 0.22)});\n`;
  // 3 · rooms land like dealt prints
  s += `tl.set("#board",{opacity:1},${f3(T.board - 0.05)});tl.fromTo("#board",{x:1080},{x:0,duration:0.25,ease:"power2.out"},${f3(T.board - 0.05)});\n`;
  s += maskIn("rl", rl.length, T.board + 0.15);
  T.cards.forEach((t, i) => {
    const side = i % 2 ? 1 : -1;
    s += `tl.fromTo("#c${i}",{opacity:1,x:${side * 950},y:-260,rotation:${side * 28},scale:1.12},{x:0,y:0,rotation:${rot[i]},scale:1,duration:0.42,ease:"power3.out"},${f3(t)});`;
    if (i > 0) s += `tl.to("#st${i - 1}",{opacity:0,duration:0.15},${f3(t + 0.3)});`;
    s += mistPuff(`mi${i}`, t + 0.36, i % 2 === 1) + glintPop(`rg${i}_`, 3, t + 0.42) + stampIn(`st${i}`, t + 0.38);
  });
  // 4 · feet up: card stack falls away, cream band settles with the line, slow cinematic zoom
  s += `tl.set("#feet",{opacity:1},${f3(T.feet)});tl.fromTo("#feet",{yPercent:100},{yPercent:0,duration:0.45,ease:"power3.out"},${f3(T.feet)});\n`;
  s += `tl.fromTo("#fimg",{scale:1.0},{scale:1.16,duration:${f3(T.end - T.feet)},ease:"sine.out"},${f3(T.feet)});\n`;
  s += maskIn("fl", fl.length, T.feet + 0.35);
  // 5 · end card: the kit drops in, logo + site
  s += `tl.set("#endbg",{opacity:1},${f3(T.end)});tl.fromTo("#endbg",{clipPath:"circle(0% at 50% 60%)"},{clipPath:"circle(120% at 50% 60%)",duration:0.5,ease:"power2.inOut"},${f3(T.end)});\n`;
  s += `tl.fromTo("#k1,#k2,#k3",{y:520,opacity:0},{y:0,opacity:1,duration:0.55,ease:"back.out(1.5)",stagger:0.12},${f3(T.end + 0.25)});\n`;
  s += `tl.fromTo("#end",{opacity:0,y:24},{opacity:1,y:0,duration:0.6,ease:"power2.out"},${f3(T.end + 0.35)});\n`;
  s += glintPop("eg", 3, T.end + 0.9, 0.18) + glintPop("eg", 3, T.end + 2.0, 0.2);

  const assets = {
    "a/phone.jpg": A.phone, "a/strip.jpg": A.strip, "a/feet.jpg": A.feet,
    ...Object.fromEntries(A.rooms.map((p, i) => [`a/room${i}.jpg`, p])),
    ...Object.fromEntries(["01-spray-bottle", "06-bucket-supplies", "02-folded-cloth", "09-spray-mist"].map((n) => [`d/${n}.png`, `${D}/cutouts/${n}.png`])),
    ...Object.fromEntries(["01-spray-bottle", "06-bucket-supplies", "02-folded-cloth"].map((n) => [`d/${n}-shadow.png`, `${D}/shadows/${n}-shadow.png`])),
    ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`d/glints-0${n}.png`, `${D}/effect-parts/glints-0${n}.png`])),
  };
  const contact = [0.7, T.notes[2] + 1.0, T.whip + 0.7, T.cards[3] + 0.9, T.feet + 1.4, T.end + 1.8];
  return {
    duration,
    html: page({ id: "pov-booking", duration, brand, css, body, script: s }),
    assets,
    beats: contact,
    contact,
  };
}
