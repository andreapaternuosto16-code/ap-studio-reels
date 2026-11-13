// Round 3 · A — "POV: the clean is booked" (≤ 15 s). Real hand-held phone (A01) showing the real
// xtrafreshhh.com pages in an iOS Safari frame, corner-pinned to the screen → slow camera zoom
// towards the screen as three iOS notifications arrive one under the other (no overlap) with a
// small "Example booking" label → push-through match cut into the agreed rooms (full-bleed, one ✓
// each) → feet up → end card on the bathroom mirror. Cuts on the music's beats. No effects.
import { esc, page } from "../lib/page.mjs";
import { beats, f3 } from "../lib/fx.mjs";
import { realCss, shot, cutIn, camera, lines, linesIn, linesOut, wrap, phone, safariScreen, iosNote, endBlock, endIn } from "../lib/real.mjs";

export function build(reel, brand) {
  const b = beats(reel.bpm ?? 104);
  const T = { pages: [0, b(3), b(5)], hookOut: b(3), push: b(3), notes: [b(6), b(7.5), b(9)], through: b(11), rooms: [b(11.5), b(13.5), b(15.5), b(17.5)], feet: b(19.5), end: b(22.5) };
  const duration = 15;
  const A = reel.assets, R = reel.rooms;
  const icon = `<svg viewBox="0 0 24 24" width="26" height="26"><path fill="#fff" d="M12 3.2 3 10.4V21h6.2v-6h5.6v6H21V10.4z"/></svg>`;
  const noteTop = reel.noteTop ?? [66, 163, 260];
  const PH = { corners: reel.phone.corners, mask: "a/ph-mask.png", maskData: globalThis.__dataUri?.(`${reel.phone.dir}-mask.png`), shadow: "a/ph-shadow.png", glass: "a/ph-glass.png" };
  const screenInner = safariScreen(["a/page0.png", "a/page1.png", "a/page2.png"], { url: "xtrafreshhh.com" }) +
    reel.notes.map((n, i) => iosNote(`n${i}`, { app: reel.sender, body: n, top: noteTop[i], icon })).join("") +
    `<div class="chip txt" id="chip">${esc(reel.exampleLabel)}</div>`;
  const hook = wrap(reel.hook, reel.hookWrap ?? 9);
  const roomsLine = wrap(reel.roomsLine, reel.roomLineWrap ?? 60);
  const feet = wrap(reel.feetLine, 13);
  const css = `${realCss}
.chip{position:absolute;left:50%;top:${reel.chipTop ?? 388}px;transform:translateX(-50%);white-space:nowrap;font-family:-apple-system,'Figtree',sans-serif;font-size:27px;font-weight:700;color:#111;
  background:rgba(246,244,243,.86);backdrop-filter:blur(22px);border-radius:999px;padding:8px 20px;opacity:0}
`;
  const end = reel.end;
  const body = `
${shot("s1", "a/phone.jpg", { origin: "508px 1000px", extra: phone("scr", PH, screenInner, { glass: reel.phone.glass ?? 0.12 }) })}
${R.map((r, i) => shot(`r${i}`, `a/room${i}.jpg`, { grade: r.grade ?? 0.85, origin: "540px 960px" })).join("\n")}
${shot("s3", "a/feet.jpg", { origin: "55% 60%" })}
${shot("s4", "a/end.jpg", { origin: end.origin })}
${lines("hook", hook, { ...reel.hookPos, size: reel.hookSize ?? 110 })}
${R.map((r, i) => lines(`lb${i}`, [`${r.label} ✓`], { x: r.block.x, y: r.block.y, w: 1020 - r.block.x, size: reel.roomNameSize ?? 140, color: r.color ?? "var(--cream)" })).join("\n")}
${R.map((r, i) => lines(`rs${i}`, roomsLine, { x: r.block.x + 6, y: r.block.y + 158, w: 1014 - r.block.x, size: reel.roomLineSize ?? 54, color: r.color ?? "var(--cream)" })).join("\n")}
${lines("fl", feet, { ...reel.feetLinePos, size: 84, color: "var(--cream)" })}
${endBlock("eb", { line: end.line, url: end.url, urlColor: end.urlColor, ...end.block })}`;

  let s = `gsap.set("#scr .ios-page",{visibility:"hidden"});\n`;
  // 1 · phone in hand, real pages, hook on the worktop
  s += cutIn("s1", 0, T.rooms[0]);
  T.pages.forEach((t, i) => { s += (t <= 0 ? `gsap.set("#pg${i}",{visibility:"inherit"});` : `tl.set("#pg${i}",{visibility:"inherit"},${f3(t)});`) + (i < 2 ? `tl.set("#pg${i}",{visibility:"hidden"},${f3(T.pages[i + 1])});` : "") + "\n"; });
  s += `gsap.set("#hook",{opacity:1});` + linesOut("hook", T.hookOut); // on screen from the very first frame
  const C0 = reel.cam.start, C1 = reel.cam.screen;
  s += camera("s1", 0, T.hookOut, C0, { ...C0, scale: C0.scale + 0.02 }, "sine.out");
  s += camera("s1", T.hookOut, T.notes[0] - T.hookOut, { ...C0, scale: C0.scale + 0.02 }, C1, "power2.inOut");
  s += camera("s1", T.notes[0], T.through - T.notes[0], C1, { ...C1, scale: C1.scale + 0.05 }, "none");
  s += `tl.fromTo("#chip",{opacity:0},{opacity:1,duration:0.3},${f3(b(5.5))});\n`;
  T.notes.forEach((t, i) => { s += `tl.fromTo("#n${i}",{opacity:0,y:28},{opacity:1,y:0,duration:0.42,ease:"power3.out"},${f3(t)});\n`; });
  // 2 · push-through into the rooms (match cut on the beat)
  s += camera("s1", T.through, T.rooms[0] - T.through, { ...C1, scale: C1.scale + 0.05 }, { ...C1, scale: 2.4 }, "power2.in");
  R.forEach((r, i) => {
    const t = T.rooms[i], next = i < 3 ? T.rooms[i + 1] : T.feet;
    s += cutIn(`r${i}`, t, next);
    s += camera(`r${i}`, t, next - t, { ...r.cam, scale: r.cam.scale + (i === 0 ? 0.1 : 0.05) }, r.cam, i === 0 ? "power2.out" : "sine.out");
    s += linesIn(`lb${i}`, t + 0.08) + linesOut(`lb${i}`, next);
    s += linesIn(`rs${i}`, t + 0.2) + linesOut(`rs${i}`, next);
  });
  // 3 · feet up: slow push, the afternoon light softens
  s += cutIn("s3", T.feet, T.end);
  s += camera("s3", T.feet, T.end - T.feet, { scale: 1.0, filter: `brightness(${reel.feetGrade?.[0] ?? 0.86})` }, { scale: 1.08, filter: `brightness(${reel.feetGrade?.[1] ?? 0.76})` }, "sine.inOut");
  s += linesIn("fl", T.feet + 0.15) + linesOut("fl", T.end);
  // 4 · end card: clean bathroom mirror, slow push
  s += cutIn("s4", T.end);
  s += camera("s4", T.end, duration - T.end, { scale: end.scale[0], x: end.x ?? 0, y: end.y ?? 0 }, { scale: end.scale[1], x: end.x ?? 0, y: end.y ?? 0 }, "sine.out");
  // rack focus: the lens pulls focus off the room so the title sits on a soft background (a real camera move)
  if (end.focusPull) s += `tl.fromTo("#s4-cam .pic",{filter:"blur(0px)"},{filter:"blur(${end.focusPull}px)",duration:0.7,ease:"power2.inOut",immediateRender:false},${f3(T.end + 0.05)});\n`;
  s += endIn("eb", T.end + 0.12);

  const assets = {
    "a/phone.jpg": A.phone, "a/feet.jpg": A.feet, "a/end.jpg": end.photo,
    ...Object.fromEntries(R.map((r, i) => [`a/room${i}.jpg`, r.photo])),
    ...Object.fromEntries(reel.pages.map((p, i) => [`a/page${i}.png`, p])),
    "a/ph-mask.png": `${reel.phone.dir}-mask.png`, "a/ph-shadow.png": `${reel.phone.dir}-shadow.png`, "a/ph-glass.png": `${reel.phone.dir}-glass.png`,
  };
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  const legibility = [0.0, 1.2, T.notes[2] + 0.8, T.rooms[0] + 0.9, T.rooms[1] + 0.8, T.rooms[2] + 0.8, T.rooms[3] + 0.8, T.feet + 1.0, 14.2];
  return { duration, html: page({ id: "r3-pov-booked", duration, brand, css, body, script: s }), assets, beats: [1.5, 3.0, T.notes[2] + 0.8, T.rooms[0] + 0.8, T.rooms[3] + 0.8, T.feet + 1.0, 14.2], contact, legibility };
}
