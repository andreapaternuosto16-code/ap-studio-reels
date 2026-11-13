// Round 3 · B — Christmas countdown (≤ 15 s). The flip board flips in on the calm wall (kept from
// round 2) → clean cut to a closer framing: "3 jobs to do now" → the three jobs full-bleed, each
// with one real camera move (push / pan / pull) and a real phone screen where a phone is visible →
// slow pan across the house with soft natural snow while "You've got this." is written in full and
// held → end card on the same wall. Cuts on the beat. "days" is a JSON slot.
import { page } from "../lib/page.mjs";
import { beats, f3, flapBoard, handwrite, handwriteIn, hwCss } from "../lib/fx.mjs";
import { realCss, shot, cutIn, camera, lines, linesIn, linesOut, wrap, phone, safariScreen, snow, endBlock, endIn } from "../lib/real.mjs";

export function build(reel, brand) {
  const b = beats(reel.bpm ?? 96);
  const T = { intro: b(4), jobs: [b(6.5), b(9), b(11.5)], pan: b(14), hand: b(14.5), end: b(19.5) };
  const duration = 15;
  const days = Number(reel.days);
  if (!Number.isInteger(days) || days < 1 || days > 99) throw new Error("countdown: days must be 1–99");
  const board = flapBoard("fb", [days === 1 ? "1 DAY TO" : `${days} DAYS TO`, "CHRISTMAS"]);
  const A = reel.assets, J = reel.jobs, E = reel.end;
  const sn = snow("sn", { start: 0, end: duration, count: [9, 6, 3] });
  const hw = [...reel.handwritten].length;
  const css = `${realCss}${board.css}${hwCss}
#fb{left:0;right:0;top:${reel.boardTop ?? 330}px;z-index:5}
#strip{position:absolute;left:0;top:0;height:1920px;width:auto}
#pan{position:absolute;inset:0;overflow:hidden;visibility:hidden}
#yg{left:150px;right:150px;top:${reel.handTop ?? 250}px;text-align:center;z-index:6}
.flake{visibility:hidden}
`;
  const body = `
${shot("s1", "b/room.jpg", { origin: "50% 30%" })}
${shot("s2", "b/room.jpg", { origin: reel.introOrigin ?? "540px 0px" })}
${J.map((j, i) => shot(`j${i}`, `b/job${i}.jpg`, { grade: j.grade ?? 0.85, origin: j.origin ?? "50% 50%", extra: j.screen ? phone(`ps${i}`, j.screen, safariScreen([`b/page${i}.png`], { url: "xtrafreshhh.com" }).replace(`id="pg0"`, `id="pp${i}" style="visibility:inherit"`), { radius: 46 }) : "" })).join("\n")}
<div id="pan"><img id="strip" src="b/strip.jpg" /></div>
${shot("s4", "b/room.jpg", { origin: E.origin ?? "50% 40%" })}
${board.html}
${lines("in", wrap(reel.intro, 9), { ...reel.introPos, size: 140 })}
${J.map((j, i) => lines(`jt${i}`, wrap(j.text, j.wrap ?? 14), { ...j.pos, size: j.size ?? 74, color: "var(--cream)" })).join("\n")}
${handwrite("yg", reel.handwritten, { size: reel.handSize ?? 128 })}
${endBlock("eb", { line: E.line, url: E.url, ...E.block })}
${sn.html}`;

  let s = sn.script;
  // flakes only on the wide shots of the room and the house, never on the close-ups
  for (const [a, z] of [[0, T.jobs[0]], [T.pan, duration]]) s += `tl.set(".flake",{visibility:"visible"},${f3(a)});tl.set(".flake",{visibility:"hidden"},${f3(z)});\n`;
  // 1 · flip board in (kept), slow push
  s += cutIn("s1", 0, T.intro) + camera("s1", 0, T.intro, { scale: 1.0 }, { scale: 1.04 }, "sine.out");
  s += `tl.fromTo("#fb",{opacity:0},{opacity:1,duration:0.15},0.02);` + board.script(0.06, { flip: 0.035, stagger: 0.025 });
  s += `tl.set("#fb",{visibility:"hidden"},${f3(T.intro)});\n`; // clean cut out
  // 2 · clean cut to a closer framing
  s += cutIn("s2", T.intro, T.jobs[0]) + camera("s2", T.intro, T.jobs[0] - T.intro, { scale: 1.28 }, { scale: 1.34 }, "sine.out");
  s += linesIn("in", T.intro + 0.08) + linesOut("in", T.jobs[0]);
  // 3 · the three jobs, full-bleed, one camera move each
  J.forEach((j, i) => {
    const t = T.jobs[i], next = i < 2 ? T.jobs[i + 1] : T.pan;
    s += cutIn(`j${i}`, t, next) + camera(`j${i}`, t, next - t, j.from, j.to, "sine.inOut");
    s += linesIn(`jt${i}`, t + 0.1) + linesOut(`jt${i}`, next);
  });
  // 4 · slow pan across the house; handwriting completes, then holds
  s += `tl.set("#pan",{visibility:"visible"},${f3(T.pan)});tl.set("#pan",{visibility:"hidden"},${f3(T.end)});`;
  s += `tl.fromTo("#strip",{x:${-reel.pan[0]}},{x:${-reel.pan[1]},duration:${f3(T.end - T.pan)},ease:"sine.inOut"},${f3(T.pan)});\n`;
  s += `gsap.set("#yg",{opacity:0});tl.set("#yg",{opacity:1},${f3(T.hand - 0.01)});` + handwriteIn("yg", hw, T.hand, 0.07) + linesOut("yg", T.end);
  // 5 · end card on the wall
  s += cutIn("s4", T.end) + camera("s4", T.end, duration - T.end, { scale: E.scale[0] }, { scale: E.scale[1] }, "sine.out");
  s += `gsap.set("#eb",{opacity:1});` + endIn("eb", T.end + 0.12);

  const assets = {
    "b/room.jpg": A.room, "b/strip.jpg": A.strip,
    ...Object.fromEntries(J.map((j, i) => [`b/job${i}.jpg`, j.photo])),
    ...Object.fromEntries(J.filter((j) => j.page).map((j) => [`b/page${J.indexOf(j)}.png`, j.page])),
  };
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  const legibility = [T.intro - 0.4, T.intro + 0.9, T.jobs[0] + 0.9, T.jobs[1] + 0.9, T.jobs[2] + 0.9, T.end - 0.4, 14.3];
  return { duration, html: page({ id: "r3-countdown", duration, brand, css, body, script: s }), assets, beats: legibility, contact, legibility };
}
