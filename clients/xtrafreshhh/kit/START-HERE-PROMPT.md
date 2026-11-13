# AP/BUILD — AP Studio Reels — XtraFreshhh reel templates

**Model: Claude Opus 5.5 · Effort: medium**

You are a build chat for AP Studio. Everything you need is in this kit (attached zip), nothing is on a Mac you can reach:
- `REELS-PLAN-2026-11-19-to-12-24.md` — the 6 reels and which template each uses.
- `2026-11-12-xtrafreshhh-reels-wording.md` — on-screen text (under wording review; use it as is for samples).
- `2026-11-12-ai-video-repos.md` — why these tools.
- `xf-logo.png` — the real logo, use as-is (never redraw it).
- `photos/` — approved bright daylight stills to use.
- `style-reference/` — the approved carousel look (Option A) the reels must match; open GRID-MOCK.jpg first.

Tools: clone **HyperFrames** (github.com/heygen-com/hyperframes, Apache-2.0) as the render engine and **Herk Edit Kit** (github.com/nateherkai/herk-edit-kit, MIT) for skills/motion cards/MOTION_PHILOSOPHY. HyperFrames telemetry OFF on first run. Do not use OpenMontage code.

## Goal
Four reusable vertical reel templates for XtraFreshhh's Instagram/Facebook, 1080×1920, 30 fps, 8–15 s, MP4 (H.264, -preset veryfast). Text and photos are slots filled from one JSON file per reel:
1. **Price in 10 s** — a phone-style walk-through of getting an estimate on xtrafreshhh.com (service → rooms → estimate → send request). A clean mock in the site's look; no prices unless the JSON gives them.
2. **3 tips** — label, three short tips appearing one by one over a slow photo pan, end card.
3. **Before→after wipe** — two real photos of the same room with a vertical wipe, "Before"/"After" labels, end card. Only supplied photos (the client's real job photos); for samples use two photos clearly stamped "SAMPLE — her photos go here".
4. **Review card** — five stars, a short quote, name as on Google, over a calm photo, end card.

Look (match style-reference/): bright daylight photos; deep teal #1F4F5B text straight on calm areas of the photo; teal #296675, cream #FFF7F4, blush #FADBD2; Bricolage Grotesque headlines, Figtree text (Google Fonts); NO fades, halos, glows or boxes behind text. Logo only on the END CARD with "xtrafreshhh.com". Captions burned in and readable muted; keep text out of the top 220 px and bottom 380 px (Instagram UI). Calm motion (Herk MOTION_PHILOSOPHY), no flashy transitions. Royalty-free music only, source noted per reel; every reel also exports a no-music version.

## Steps
1. **Design first, then stop.** Make 3 style options as still keyframes (start, middle, end frame of the 3-tips template for each), PNGs + one COMPARE.png, committed in `design-options/` on your branch. Open a draft PR so Andrea can see them, tell him in plain English, and STOP until he picks.
2. After his pick: build the 4 templates and render one sample MP4 of each with the wording file and the photos in this kit.
3. Code goes in this repo, `andreapaternuosto16-code/ap-studio-reels`, which will hold reels for ALL AP Studio clients. Structure: `engine/` (shared HyperFrames setup + the 4 templates, brand values passed in, never hard-coded) and `clients/xtrafreshhh/` (brand.json with colours/fonts/logo, reels/<date>-<name>.json, renders/). Work on a branch, PR into main. No secrets anywhere. Commit this kit's files under clients/xtrafreshhh/kit/.
4. Check each sample at phone size (text size, safe zones, nothing cut), list results in the PR, mark it ready and stop. AP/MANAGER reviews; nothing is posted.

Report in plain English: where the options/samples are, what you checked, the PR link.
