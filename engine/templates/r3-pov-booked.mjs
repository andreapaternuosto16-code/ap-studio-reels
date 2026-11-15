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
  const A = reel.assets, R = reel.rooms ?? [];
  const icon = `<svg viewBox="0 0 24 24" width="26" height="26"><path fill="#fff" d="M12 3.2 3 10.4V21h6.2v-6h5.6v6H21V10.4z"/></svg>`;
  const noteTop = reel.noteTop ?? [66, 163, 260];
  const PH = { corners: reel.phone.corners, mask: "a/ph-mask.png", maskData: globalThis.__dataUri?.(`${reel.phone.dir}-mask.png`), shadow: "a/ph-shadow.png", glass: "a/ph-glass.png" };
  const NL = reel.notesList; // optional: an iOS Notes checklist instead of the Safari pages + notifications
  // round 8.1: a real iOS Notes screen — status bar, Notes header (back arrow + folder), date, title,
  // ruled "Lines" paper filling the page, bottom toolbar and home indicator; items written on the lines.
  const NY = "#D69E00", ROW = NL?.row ?? 46, R0Y = NL?.firstRow ?? 176, NROWS = Math.floor((826 - R0Y) / ROW);
  const sbIcons = `<svg width="20" height="13" viewBox="0 0 20 13"><rect x="0" y="9" width="3.6" height="4" rx="1" fill="#111"/><rect x="5.4" y="6.5" width="3.6" height="6.5" rx="1" fill="#111"/><rect x="10.8" y="3.5" width="3.6" height="9.5" rx="1" fill="#111"/><rect x="16.2" y="0" width="3.6" height="13" rx="1" fill="#111"/></svg>` +
    `<svg width="18" height="13" viewBox="0 0 18 13"><path d="M9 12.6l2.6-3a3.6 3.6 0 0 0-5.2 0z" fill="#111"/><path d="M3.9 7.3a7.3 7.3 0 0 1 10.2 0l1.6-1.8a9.8 9.8 0 0 0-13.4 0z" fill="#111"/><path d="M1.3 4.4a11 11 0 0 1 15.4 0L18 2.9A13 13 0 0 0 0 2.9z" fill="#111"/></svg>` +
    `<svg width="28" height="13" viewBox="0 0 28 13"><rect x=".6" y=".6" width="23.5" height="11.8" rx="3.6" fill="none" stroke="#111" stroke-opacity=".4" stroke-width="1.2"/><rect x="2.4" y="2.4" width="17" height="8.2" rx="2.2" fill="#111"/><path d="M25.6 4.4v4.2a2.2 2.2 0 0 0 0-4.2z" fill="#111" fill-opacity=".45"/></svg>`;
  const tbIcons = [
    `<svg width="26" height="26" viewBox="0 0 26 26"><circle cx="5" cy="7" r="3.3" fill="none" stroke="${NY}" stroke-width="1.8"/><circle cx="5" cy="18" r="3.3" fill="none" stroke="${NY}" stroke-width="1.8"/><path d="M11 7h13M11 18h13" stroke="${NY}" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg width="28" height="24" viewBox="0 0 28 24"><path d="M3 7h5l2-3h8l2 3h5v14H3z" fill="none" stroke="${NY}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="14" cy="13.5" r="4.4" fill="none" stroke="${NY}" stroke-width="1.8"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M4 22l2-6L18 4l4 4-12 12z" fill="none" stroke="${NY}" stroke-width="1.8" stroke-linejoin="round"/><path d="M15 7l4 4" stroke="${NY}" stroke-width="1.8"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M20 14v8H4V6h8" fill="none" stroke="${NY}" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 15l1-4 9-9 3 3-9 9z" fill="none" stroke="${NY}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  ].join("");
  const navR = `<svg width="24" height="26" viewBox="0 0 24 26"><path d="M6 10H4v14h16V10h-2M12 2v15M7.5 6.5L12 2l4.5 4.5" fill="none" stroke="${NY}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<svg width="27" height="27" viewBox="0 0 27 27"><circle cx="13.5" cy="13.5" r="11.5" fill="none" stroke="${NY}" stroke-width="1.9"/><circle cx="8.3" cy="13.5" r="1.7" fill="${NY}"/><circle cx="13.5" cy="13.5" r="1.7" fill="${NY}"/><circle cx="18.7" cy="13.5" r="1.7" fill="${NY}"/></svg>`;
  const screenInner = NL
    ? `<div class="nts"><div class="nts-sb"><span class="tm ui">9:41</span><span class="sbi">${sbIcons}</span></div>` +
      `<div class="nts-nav"><span class="bk ui"><svg width="13" height="22" viewBox="0 0 13 22"><path d="M11 2L2 11l9 9" fill="none" stroke="${NY}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(NL.folder ?? "Notes")}</span><span class="nr">${navR}</span></div>` +
      `<div class="nts-date ui">${esc(NL.date ?? "")}</div><div class="nts-title txt">${esc(NL.title)}</div>` +
      Array.from({ length: NROWS }, (_, r) => `<div class="nrow" style="top:${R0Y + r * ROW}px">${r < NL.items.length ? `<span class="nli txt" id="n${r}">${esc(NL.items[r])}</span>` : ""}</div>`).join("") +
      `<div class="nts-tb">${tbIcons}</div><div class="nts-home"></div></div>`
    : safariScreen(["a/page0.png", "a/page1.png", "a/page2.png"], { url: "xtrafreshhh.com" }) +
      reel.notes.map((n, i) => iosNote(`n${i}`, { app: reel.sender, body: n, top: noteTop[i], icon })).join("") +
      `<div class="chip txt" id="chip">${esc(reel.exampleLabel)}</div>`;
  const FC = reel.foodCuts ?? []; // optional: a full-screen close-up of each item as it gets its tick
  const hook = reel.hook ? wrap(reel.hook, reel.hookWrap ?? 9) : [];
  const roomsLine = wrap(reel.roomsLine ?? "", reel.roomLineWrap ?? 60);
  const feet = wrap(reel.feetLine ?? "", 13);
  const SC = reel.scenes; // optional: full-frame line scenes instead of the rooms montage + feet
  const R0 = SC ? [] : R;
  const css = `${realCss}
.nts{position:absolute;inset:0;background:#fff;font-family:-apple-system,'Figtree',sans-serif;color:#111}
.nts-sb{position:absolute;left:0;top:0;width:420px;height:57px;display:flex;align-items:center;justify-content:space-between;padding:6px 30px 0 44px;box-sizing:border-box}
.nts-sb .tm{font-size:18px;font-weight:600;letter-spacing:-.01em}.nts-sb .sbi{display:flex;gap:6px;align-items:center}
.nts-nav{position:absolute;left:0;top:62px;width:420px;height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 20px 0 14px;box-sizing:border-box}
.nts-nav .bk{display:flex;align-items:center;gap:7px;color:#D69E00;font-size:19px;font-weight:400}.nts-nav .nr{display:flex;gap:22px;align-items:center}
.nts-date{position:absolute;left:0;width:420px;top:108px;text-align:center;font-size:12px;color:#8E8E93}
.nts-title{position:absolute;left:22px;top:${(reel.notesList?.firstRow ?? 176) - 48}px;font-size:${reel.notesList?.titleSize ?? 32}px;font-weight:700;letter-spacing:-.015em;line-height:44px}
.nrow{position:absolute;left:22px;right:0;height:${reel.notesList?.row ?? 46}px;border-bottom:1px solid rgba(60,60,67,.16)}
.nli{display:inline-block;font-size:${reel.notesList?.size ?? 25}px;font-weight:400;line-height:${reel.notesList?.row ?? 46}px;white-space:nowrap;color:#111}
.nts-tb{position:absolute;left:0;top:838px;width:420px;display:flex;justify-content:space-between;padding:0 30px;box-sizing:border-box}
.nts-home{position:absolute;left:50%;bottom:9px;width:144px;height:5px;margin-left:-72px;border-radius:3px;background:#111}
.chip{position:absolute;left:50%;top:${reel.chipTop ?? 388}px;transform:translateX(-50%);white-space:nowrap;font-family:-apple-system,'Figtree',sans-serif;font-size:27px;font-weight:700;color:#111;
  background:#E4E0DE;border:1px solid rgba(0,0,0,.08);border-radius:999px;padding:6px 22px;opacity:0}
`;
  const end = reel.end;
  const body = `
${shot("s1", "a/phone.jpg", { origin: "508px 1000px", extra: phone("scr", PH, screenInner, { glass: reel.phone.glass ?? 0.12 }) })}
${FC.map((f, i) => shot(`f${i}`, `a/food${i}.jpg`, { origin: "540px 960px", grade: f.grade ?? 1 })).join("\n")}
${R0.map((r, i) => shot(`r${i}`, `a/room${i}.jpg`, { grade: r.grade ?? 0.85, origin: "540px 960px" })).join("\n")}
${SC ? SC.map((c, i) => shot(`c${i}`, `a/scene${i}.jpg`, { grade: c.grade ?? 1, origin: "540px 960px" })).join("\n") : shot("s3", "a/feet.jpg", { origin: "55% 60%" })}
${shot("s4", "a/end.jpg", { origin: end.origin, grade: end.grade ?? 1 })}
${hook.length ? lines("hook", hook, { ...reel.hookPos, size: reel.hookSize ?? 110 }) : ""}
${R0.map((r, i) => lines(`lb${i}`, [`${r.label} ✓`], { x: r.block.x, y: r.block.y, w: 1020 - r.block.x, size: reel.roomNameSize ?? 140, color: r.color ?? "var(--cream)" })).join("\n")}
${R0.map((r, i) => lines(`rs${i}`, roomsLine, { x: r.block.x + 6, y: r.block.y + 158, w: 1014 - r.block.x, size: reel.roomLineSize ?? 54, color: r.color ?? "var(--cream)" })).join("\n")}
${SC ? SC.map((c, i) => lines(`cl${i}`, wrap(c.line, c.wrap ?? 14), { ...c.pos, size: c.size ?? 110, color: c.color ?? "var(--cream)" })).join("\n") : lines("fl", feet, { ...reel.feetLinePos, size: 84, color: "var(--cream)" })}
${FC.map((f, i) => lines(`fw${i}`, [f.line], { ...f.pos, size: f.size ?? 130, color: f.color ?? "var(--ink)" })).join("\n")}
${endBlock("eb", { line: end.line, url: end.url, urlColor: end.urlColor, ...end.block })}`;

  let s = NL ? "" : `gsap.set("#scr .ios-page",{visibility:"hidden"});\n`;
  // 1 · phone in hand, real pages, hook on the worktop
  s += cutIn("s1", 0, SC ? b(SC[0].at) : T.rooms[0]);
  if (!NL) T.pages.forEach((t, i) => { s += (t <= 0 ? `gsap.set("#pg${i}",{visibility:"inherit"});` : `tl.set("#pg${i}",{visibility:"inherit"},${f3(t)});`) + (i < 2 ? `tl.set("#pg${i}",{visibility:"hidden"},${f3(T.pages[i + 1])});` : "") + "\n"; });
  if (hook.length) s += `gsap.set("#hook",{opacity:1});` + linesOut("hook", T.hookOut); // on screen from the very first frame
  const C0 = reel.cam.start, C1 = reel.cam.screen;
  s += camera("s1", 0, T.hookOut, C0, { ...C0, scale: C0.scale + 0.02 }, "sine.out");
  s += camera("s1", T.hookOut, T.notes[0] - T.hookOut, { ...C0, scale: C0.scale + 0.02 }, C1, "power2.inOut");
  s += camera("s1", T.notes[0], T.through - T.notes[0], C1, { ...C1, scale: C1.scale + 0.05 }, "none");
  if (!NL) s += `tl.fromTo("#chip",{opacity:0},{opacity:1,duration:0.3},${f3(b(5.5))});tl.to("#scr .ios-tools",{opacity:0,duration:0.2},${f3(b(5.5))});\n`;
  if (NL) NL.at.forEach((a, i) => { if (a <= 0) s += `gsap.set("#n${i}",{opacity:1});\n`; });
  (NL ? NL.at.map(b) : T.notes).forEach((t, i) => { if (t <= 0) return; s += `tl.fromTo("#n${i}",{opacity:0,y:28},{opacity:1,y:0,duration:0.42,ease:"power3.out"${t > 0 ? ",immediateRender:false" : ""}},${f3(t)});${t > 0 ? `gsap.set("#n${i}",{opacity:0});` : ""}\n`; });
  // food close-ups: a clean cut to each item's picture as it gets its tick, then back to the phone
  FC.forEach((f, i) => {
    const a = b(f.at), z = b(f.end), C = f.cam ?? { scale: 1 };
    s += `tl.set("#s1",{visibility:"hidden"},${f3(a)});tl.set("#s1",{visibility:"visible"},${f3(z)});` + cutIn(`f${i}`, a, z) + camera(`f${i}`, a, z - a, { ...C, scale: C.scale + 0.05 }, C, "sine.out");
    s += linesIn(`fw${i}`, a + 0.06) + linesOut(`fw${i}`, z);
  });
  // 2 · push-through into the rooms (match cut on the beat)
  s += camera("s1", T.through, (SC ? b(SC[0].at) : T.rooms[0]) - T.through, { ...C1, scale: C1.scale + 0.05 }, { ...C1, scale: 2.4 }, "power2.in");
  if (SC) SC.forEach((c, i) => {
    const t = b(c.at), next = i < SC.length - 1 ? b(SC[i + 1].at) : T.end;
    s += cutIn(`c${i}`, t, next) + camera(`c${i}`, t, next - t, { ...c.cam, scale: c.cam.scale + (i === 0 ? 0.1 : 0.05) }, c.cam, i === 0 ? "power2.out" : "sine.out");
    s += linesIn(`cl${i}`, t + 0.08) + linesOut(`cl${i}`, next);
  });
  R0.forEach((r, i) => {
    const t = T.rooms[i], next = i < 3 ? T.rooms[i + 1] : T.feet;
    s += cutIn(`r${i}`, t, next);
    s += camera(`r${i}`, t, next - t, { ...r.cam, scale: r.cam.scale + (i === 0 ? 0.1 : 0.05) }, r.cam, i === 0 ? "power2.out" : "sine.out");
    s += linesIn(`lb${i}`, t + 0.08) + linesOut(`lb${i}`, next);
    s += linesIn(`rs${i}`, t + 0.2) + linesOut(`rs${i}`, next);
  });
  // 3 · feet up: slow push, the afternoon light softens
  if (!SC) {
    s += cutIn("s3", T.feet, T.end);
    s += camera("s3", T.feet, T.end - T.feet, { scale: 1.0, filter: `brightness(${reel.feetGrade?.[0] ?? 0.86})` }, { scale: 1.08, filter: `brightness(${reel.feetGrade?.[1] ?? 0.76})` }, "sine.inOut");
    s += linesIn("fl", T.feet + 0.15) + linesOut("fl", T.end);
  }
  // 4 · end card: clean bathroom mirror, slow push
  s += cutIn("s4", T.end);
  s += camera("s4", T.end, duration - T.end, { scale: end.scale[0], x: end.x ?? 0, y: end.y ?? 0 }, { scale: end.scale[1], x: end.x ?? 0, y: end.y ?? 0 }, "sine.out");
  // rack focus: the lens pulls focus off the room so the title sits on a soft background (a real camera move)
  if (end.focusPull) s += `tl.fromTo("#s4-cam .pic",{filter:"blur(0px)"},{filter:"blur(${end.focusPull}px)",duration:0.7,ease:"power2.inOut",immediateRender:false},${f3(T.end + 0.05)});\n`;
  s += endIn("eb", T.end + 0.12);

  const assets = {
    "a/phone.jpg": A.phone, ...(A.feet ? { "a/feet.jpg": A.feet } : {}), "a/end.jpg": end.photo,
    ...Object.fromEntries(R0.map((r, i) => [`a/room${i}.jpg`, r.photo])),
    ...(SC ? Object.fromEntries(SC.map((c, i) => [`a/scene${i}.jpg`, c.photo])) : {}),
    ...Object.fromEntries(FC.map((f, i) => [`a/food${i}.jpg`, f.photo])),
    ...Object.fromEntries((reel.pages ?? []).map((p, i) => [`a/page${i}.png`, p])),
    "a/ph-mask.png": `${reel.phone.dir}-mask.png`, "a/ph-shadow.png": `${reel.phone.dir}-shadow.png`, "a/ph-glass.png": `${reel.phone.dir}-glass.png`,
  };
  const contact = Array.from({ length: 30 }, (_, i) => +(i * 0.5 + 0.25).toFixed(2));
  const legibility = NL ? [0.3, ...NL.at.slice(1).map((a) => +(b(a) + 0.3).toFixed(2)), ...FC.map((f) => +(b(f.at) + 0.55).toFixed(2)), ...(SC ?? []).map((c) => +(b(c.at) + 0.9).toFixed(2)), 14.2].sort((x, y) => x - y)
    : [0.0, 1.2, T.notes[2] + 0.8, T.rooms[0] + 0.9, T.rooms[1] + 0.8, T.rooms[2] + 0.8, T.rooms[3] + 0.8, T.feet + 1.0, 14.2];
  return { duration, html: page({ id: "r3-pov-booked", duration, brand, css, body, script: s }), assets, beats: NL ? legibility.slice(0, 10) : [1.5, 3.0, T.notes[2] + 0.8, T.rooms[0] + 0.8, T.rooms[3] + 0.8, T.feet + 1.0, 14.2], contact, legibility };
}
