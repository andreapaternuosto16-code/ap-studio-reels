// MOTION MENU — 12 numbered demos (≈3.5 s each) on XtraFreshhh's bright photos, for Andrea to pick from.
// Herk's motion principles (one idea per beat, type that scales, holds, camera never static) in a bright,
// calm look: no black canvas, no chrome, glow or grain. Each demo lives in its own layer and time window.
import { page, esc } from "../lib/page.mjs";
import { f3, flapBoard, handwrite, handwriteIn, hwCss, callout, calloutDraw } from "../lib/fx.mjs";
import { realCss } from "../lib/real.mjs";

const D = 3.5;

export function build(reel, brand) {
  const P = reel.photos;
  const assets = {};
  const src = (k) => { const p = P[k]; const n = `p/${k}.jpg`; assets[n] = p; return n; };
  const demos = reel.demos;
  const lastLen = 4.6;
  const duration = +(D * (demos.length - 1) + lastLen).toFixed(2);
  const T = (i) => i * D;
  let body = "", s = "", css = "";
  const full = (id, k, extra = "", style = "") => `<img class="full" id="${id}" src="${esc(src(k))}" ${extra} style="${style}" />`;
  const win = (i) => { const a = T(i), z = i === demos.length - 1 ? duration : a + D; return (a <= 0 ? `gsap.set("#d${i}",{visibility:"visible"});` : `tl.set("#d${i}",{visibility:"visible"},${f3(a)});`) + (z < duration ? `tl.set("#d${i}",{visibility:"hidden"},${f3(z)});` : "") + "\n"; };
  const tw = (sel, at, dur, from, to, ease = "none") =>
    `tl.fromTo(${JSON.stringify(sel)},${JSON.stringify(from)},{...${JSON.stringify(to)},duration:${f3(dur)},ease:"${ease}",immediateRender:${at <= 0}},${f3(at)});\n`;
  const hblur = (id) => `<svg width="0" height="0" style="position:absolute"><filter id="${id}" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur id="${id}-g" stdDeviation="0 0"/></filter></svg>`;
  const streak = (fid, at, up, down, max) =>
    `tl.fromTo("#${fid}-g",{attr:{stdDeviation:"0 0"}},{attr:{stdDeviation:"${max} 0"},duration:${f3(up)},ease:"power2.in",immediateRender:false},${f3(at)});` +
    `tl.to("#${fid}-g",{attr:{stdDeviation:"0 0"},duration:${f3(down)},ease:"power2.out"},${f3(at + up)});\n`;

  demos.forEach((dm, i) => {
    const t0 = T(i);
    let h = "";
    switch (dm.kind) {
      case "kinetic": { // 1 · word-by-word, each word scales in big; then the camera dollies through the type
        h += full(`k1`, dm.photo, "", `filter:brightness(${dm.grade ?? 1.08})`);
        h += `<div class="kin" id="kin">${dm.words.map((w, j) => `<div class="kw" id="kw${j}">${esc(w)}</div>`).join("")}</div>`;
        s += tw("#k1", t0, D, { scale: 1 }, { scale: 1.06 });
        dm.words.forEach((_, j) => { s += tw(`#kw${j}`, t0 + 0.25 + j * 0.62, 0.42, { scale: 2.6, opacity: 0 }, { scale: 1, opacity: 1 }, "power3.out"); });
        s += tw("#kin", t0 + 2.75, 0.6, { scale: 1, opacity: 1 }, { scale: 7, opacity: 0 }, "power2.in");
        break;
      }
      case "mask": { // 2 · lines wipe on behind a clean edge, accent rule draws under each
        h += full(`m2`, dm.photo, "", `filter:brightness(${dm.grade ?? 1.05})`);
        h += `<div class="mk" style="top:${dm.y}px">${dm.lines.map((l, j) => `<div class="mkl" id="ml${j}">${esc(l)}</div><div class="mkr" id="mr${j}"></div>`).join("")}</div>`;
        s += tw("#m2", t0, D, { scale: 1.04, x: 20 }, { scale: 1.04, x: -20 });
        dm.lines.forEach((_, j) => {
          s += tw(`#ml${j}`, t0 + 0.3 + j * 0.45, 0.6, { clipPath: "inset(0 100% 0 0)", x: -30 }, { clipPath: "inset(0 0% 0 0)", x: 0 }, "power3.out");
          s += tw(`#mr${j}`, t0 + 0.75 + j * 0.45, 0.45, { scaleX: 0 }, { scaleX: 1 }, "power2.inOut");
        });
        s += tw(".mk", t0 + 3.0, 0.4, { clipPath: "inset(0 0% 0 0)" }, { clipPath: "inset(0 0% 0 100%)" }, "power2.in");
        break;
      }
      case "push": { // 3 · push transition: both rooms travel together, a horizontal motion-blur streak rides the move
        h += hblur("hb3") + full("p3a", dm.from, "", "filter:url(#hb3)") + full("p3b", dm.to, "", "filter:url(#hb3)");
        const at = t0 + 1.55;
        s += tw("#p3a", t0, 1.55, { scale: 1.0 }, { scale: 1.06 }) + tw("#p3a", at, 0.5, { x: 0 }, { x: -1080 }, "power3.inOut");
        s += tw("#p3b", at, 0.5, { x: 1080, scale: 1.06 }, { x: 0, scale: 1.06 }, "power3.inOut") + tw("#p3b", at + 0.5, 1.45, { scale: 1.06 }, { scale: 1.0 }, "sine.out");
        s += streak("hb3", at, 0.25, 0.25, 70);
        break;
      }
      case "zoom": { // 4 · zoom-through: push into a doorway until it becomes the next room
        h += full("z4a", dm.from, "", `transform-origin:${dm.origin}`) + full("z4b", dm.to, "", "opacity:0");
        s += tw("#z4a", t0, 1.7, { scale: 1 }, { scale: dm.depth ?? 4.2 }, "power2.in");
        s += tw("#z4b", t0 + 1.45, 0.3, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1.45 }, "none") + tw("#z4b", t0 + 1.75, 1.75, { scale: 1.45 }, { scale: 1.0 }, "power2.out");
        break;
      }
      case "whip": { // 5 · whip pan: fast move with heavy horizontal blur, velocity matched across the cut
        h += hblur("hb5") + full("w5a", dm.from, "", "filter:url(#hb5)") + full("w5b", dm.to, "", "filter:url(#hb5)");
        const at = t0 + 1.5;
        s += tw("#w5a", t0, 1.5, { x: 40 }, { x: -40 }) + tw("#w5a", at, 0.28, { x: -40 }, { x: -1100 }, "power3.in");
        s += tw("#w5b", at, 0.28, { x: 1100 }, { x: 40 }, "power3.in") + tw("#w5b", at + 0.28, 1.72, { x: 40 }, { x: -40 }, "power3.out");
        s += streak("hb5", at, 0.2, 0.3, 110);
        break;
      }
      case "parallax": { // 6 · 2.5D: the photo split into 3 depth bands (soft masks), each moving at its own speed
        h += full("x6a", dm.photo, "", "transform:scale(1.14)");
        h += full("x6b", dm.photo, "", `transform:scale(1.14);-webkit-mask-image:linear-gradient(180deg,transparent ${dm.mid[0]}%,#000 ${dm.mid[1]}%);mask-image:linear-gradient(180deg,transparent ${dm.mid[0]}%,#000 ${dm.mid[1]}%)`);
        h += full("x6c", dm.photo, "", `transform:scale(1.14);-webkit-mask-image:linear-gradient(180deg,transparent ${dm.front[0]}%,#000 ${dm.front[1]}%);mask-image:linear-gradient(180deg,transparent ${dm.front[0]}%,#000 ${dm.front[1]}%)`);
        s += tw("#x6a", t0, D, { x: -12, scale: 1.14 }, { x: 12, scale: 1.14 }) + tw("#x6b", t0, D, { x: 18, scale: 1.14 }, { x: -18, scale: 1.15 }) + tw("#x6c", t0, D, { x: 45, scale: 1.15 }, { x: -45, scale: 1.18 });
        break;
      }
      case "dolly": { // 7 · dolly zoom: the near walls shrink as the far end grows (perspective "vertigo")
        h += full("y7a", dm.photo, "", `transform-origin:${dm.origin}`);
        h += full("y7b", dm.photo, "", `transform-origin:${dm.origin};-webkit-mask-image:radial-gradient(ellipse ${dm.r} at ${dm.origin},#000 55%,transparent 100%);mask-image:radial-gradient(ellipse ${dm.r} at ${dm.origin},#000 55%,transparent 100%)`);
        s += tw("#y7a", t0, D, { scale: 1.4 }, { scale: 1.02 }, "sine.inOut") + tw("#y7b", t0, D, { scale: 1.0 }, { scale: 1.42 }, "sine.inOut");
        break;
      }
      case "rack": { // 8 · rack focus: sharp foreground object, soft room → soft foreground, sharp room
        h += full("r8a", dm.photo, "", "");
        h += full("r8b", dm.photo, "", `-webkit-mask-image:linear-gradient(180deg,transparent ${dm.front[0]}%,#000 ${dm.front[1]}%);mask-image:linear-gradient(180deg,transparent ${dm.front[0]}%,#000 ${dm.front[1]}%)`);
        s += tw("#r8a,#r8b", t0, D, { scale: 1.02 }, { scale: 1.06 });
        s += tw("#r8a", t0, 0.01, { filter: "blur(9px)" }, { filter: "blur(9px)" }) + tw("#r8b", t0, 0.01, { filter: "blur(0px)" }, { filter: "blur(0px)" });
        s += tw("#r8a", t0 + 1.4, 0.8, { filter: "blur(9px)" }, { filter: "blur(0px)" }, "power2.inOut") + tw("#r8b", t0 + 1.4, 0.8, { filter: "blur(0px)" }, { filter: "blur(12px)" }, "power2.inOut");
        break;
      }
      case "cube": { // 9 · cuboid carousel: four rooms on the faces of a turning cube, on cream
        const W = 760, Hh = 1350;
        h += `<div class="cube-wrap"><div class="cube" id="cube">${dm.faces.map((k, j) => `<img class="face" src="${esc(src(k))}" style="transform:rotateY(${j * 90}deg) translateZ(${W / 2}px)" />`).join("")}</div></div>`;
        css += `.cube-wrap{position:absolute;left:${(1080 - W) / 2}px;top:${(1920 - Hh) / 2 + 40}px;width:${W}px;height:${Hh}px;perspective:2400px}
.cube{position:absolute;inset:0;transform-style:preserve-3d}
.face{position:absolute;inset:0;width:${W}px;height:${Hh}px;object-fit:cover;backface-visibility:hidden;border-radius:6px}`;
        s += tw("#cube", t0, 0.01, { rotationY: 0, rotationX: -6, z: -380 }, { rotationY: 0, rotationX: -6, z: -380 });
        [0, 1, 2].forEach((j) => { s += tw("#cube", t0 + 0.55 + j * 0.95, 0.6, { rotationY: -90 * j }, { rotationY: -90 * (j + 1) }, "power3.inOut"); });
        break;
      }
      case "callout": { // 10 · hand-drawn circle + label on a detail
        h += full("c10", dm.photo, "", "");
        const cc = dm.color === "cream" ? brand.colors.cream : brand.colors.ink;
        h += callout("co10", { ...dm.circle, color: cc, width: 11 });
        h += `<div class="cl" id="cl10" style="left:${dm.label.x}px;top:${dm.label.y}px;color:${cc}">${esc(dm.label.text)}</div>`;
        h += `<svg class="arrow" id="ar10" width="300" height="200" style="left:${dm.arrow.x}px;top:${dm.arrow.y}px"><path d="${dm.arrow.d}" fill="none" stroke="${cc}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        s += tw("#c10", t0, D, { scale: 1.0 }, { scale: 1.05 });
        s += `tl.set("#co10",{opacity:1},${f3(t0)});` + calloutDraw("co10", t0 + 0.6, 0.6);
        s += `(function(){var p=document.querySelector("#ar10 path");var L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});tl.to(p,{strokeDashoffset:0,duration:0.35,ease:"power2.out"},${f3(t0 + 1.2)});})();\n`;
        s += tw("#cl10", t0 + 1.35, 0.45, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "power3.out");
        break;
      }
      case "freeze": { // 11 · beat freeze-cut: move, freeze on the beat (still frame punches in), snap to the next
        const seg = D / dm.shots.length;
        dm.shots.forEach((k, j) => {
          h += `<div class="fz" id="fz${j}"><img src="${esc(src(k))}" /></div>`;
          const a = t0 + j * seg;
          s += `tl.set("#fz${j}",{visibility:"visible"},${f3(a)});` + (j < dm.shots.length - 1 ? `tl.set("#fz${j}",{visibility:"hidden"},${f3(a + seg)});` : "");
          s += tw(`#fz${j} img`, a, seg * 0.65, { scale: 1.0, x: j % 2 ? 30 : -30 }, { scale: 1.12, x: 0 }, "power1.in");
          s += tw(`#fz${j}`, a + seg * 0.65, 0.12, { scale: 1, borderWidth: 0 }, { scale: 0.9, borderWidth: 26 }, "power4.out");
          s += tw(`#fz${j}`, a + seg * 0.65, 0.01, { rotation: 0 }, { rotation: j % 2 ? 2 : -2 });
        });
        break;
      }
      case "flap": { // 12 · split-flap board + handwritten write-on
        const fb = flapBoard("fb12", dm.rows);
        css += fb.css + `#fb12{left:0;right:0;top:${dm.boardTop}px}`;
        h += full("f12", dm.photo, "", `filter:brightness(${dm.grade ?? 1.0})`) + fb.html + handwrite("hw12", dm.hand, { size: 130 });
        css += `#hw12{left:110px;right:110px;top:${dm.handTop}px;text-align:center}`;
        s += tw("#f12", t0, lastLen, { scale: 1.0 }, { scale: 1.05 });
        s += fb.script(t0 + 0.15, { flip: 0.035, stagger: 0.025 });
        s += `gsap.set("#hw12",{opacity:0});tl.set("#hw12",{opacity:1},${f3(t0 + 2.0)});` + handwriteIn("hw12", [...dm.hand].length, t0 + 2.0, 0.065);
        break;
      }
    }
    body += `<div class="demo" id="d${i}">${h}<div class="lab"><b>${i + 1}</b><span>${esc(dm.name)}</span></div></div>\n`;
    s += win(i);
  });

  const allCss = `${realCss}${hwCss}
.demo{position:absolute;inset:0;overflow:hidden;visibility:hidden;background:var(--cream)}
.full{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover}
.lab{position:absolute;left:56px;top:236px;z-index:20;display:flex;align-items:center;gap:20px;background:rgba(255,247,244,.96);border-radius:26px;padding:12px 30px 12px 14px;box-shadow:0 8px 22px rgba(31,79,91,.16)}
.lab b{width:96px;height:96px;border-radius:20px;background:var(--ink);color:var(--cream);font-family:var(--head);font-weight:700;font-size:64px;display:flex;align-items:center;justify-content:center}
.lab span{font-family:var(--text);font-weight:600;font-size:40px;color:var(--ink);max-width:690px;line-height:1.15}
.kin{position:absolute;left:60px;right:60px;top:${demos[0].y ?? 640}px;text-align:center;transform-origin:50% 40%}
.kw{font-family:var(--head);font-weight:700;font-size:${demos[0].size ?? 190}px;line-height:1.0;letter-spacing:-.03em;color:var(--ink);opacity:0}
.mk{position:absolute;left:90px;right:60px}
.mkl{font-family:var(--head);font-weight:700;font-size:118px;line-height:1.05;letter-spacing:-.02em;color:var(--ink)}
.mkr{height:10px;width:420px;background:var(--teal);border-radius:5px;margin:10px 0 26px;transform-origin:0 50%}
.cl{position:absolute;font-family:var(--head);font-weight:700;font-size:96px;line-height:1;color:var(--ink);opacity:0}
.arrow{position:absolute;overflow:visible}
.callout{opacity:0}
.fz{position:absolute;inset:0;overflow:hidden;visibility:hidden;border:0 solid var(--cream);box-sizing:border-box;box-shadow:0 30px 60px rgba(31,79,91,.25)}
.fz img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
${css}`;
  return {
    duration,
    html: page({ id: "motion-menu", duration, brand, css: allCss, body, script: s }),
    assets,
    beats: demos.map((_, i) => +(T(i) + 2.0).toFixed(2)),
    contact: demos.flatMap((_, i) => [+(T(i) + 0.9).toFixed(2), +(T(i) + 1.75).toFixed(2), +(T(i) + 2.9).toFixed(2)]),
    legibility: [],
  };
}
