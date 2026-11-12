# engine — shared reel templates (HyperFrames)

Four vertical reel templates (1080×1920, 30 fps, H.264 MP4, `-preset veryfast`), in the style Andrea picked:
**big Bricolage number / one idea at a time on a calm photo, end card on the photo** (line + real logo PNG + site address).
Brand values (colours, fonts, logo, photo folder) come from `clients/<client>/brand.json`. Nothing client-specific lives here.

| Template (`"template"`) | What it does |
|---|---|
| `price-walkthrough` | Hook, then 4 numbered steps while a phone mock walks through service → details → estimate → send request, optional note, end card. No price unless the JSON gives `estimate.price`. |
| `three-tips` | Label + headline, then 1–4 tips one at a time with a big number, optional closing frame (`outro`), end card. Slow push-in. |
| `before-after` | Hook on the before photo, "Before", vertical wipe to the after photo, "After", closing line, end card. **Only the client's real job photos.** `sample: true` stamps both photos. |
| `review-card` | "Google review" label, stars **only if `rating` is 5**, exact quote (engine refuses > 15 words), name as on Google, held ~6 s, end card. `sample: true` stamps it as a placeholder. |

## Render a reel
```bash
cd engine && npm install          # once (HyperFrames CLI, pinned)
cd .. && node engine/render.mjs clients/xtrafreshhh/reels/2026-11-26-r2-3-tips.json
# --no-video  = build + check only (fast)
```
Needs Node 22, ffmpeg, Chromium + Playwright. HyperFrames telemetry is always off (`HYPERFRAMES_NO_TELEMETRY=1` is set by the script; also ran `hyperframes telemetry disable`).

Outputs in `clients/<client>/renders/`:
- `<reel>.mp4`: with music (quiet, fades out), `<reel>-nomusic.mp4`: the same without audio.
- `<reel>-check.json`: automatic check, run every 0.1 s over the whole timeline: all visible text and the phone mock stay out of the top 220 px / bottom 380 px (Instagram UI) and 60 px side margins, no text spills out of its box, smallest text ≥ 40 px (≈ 14 px on a 390 px phone). Render stops if it fails.
- `<reel>-phone.jpg`: key moments at real phone width (390 px), for a by-eye check with the sound off.

## Pieces
- `lib/page.mjs`: page shell, calm motion helpers (rise + fade, no blur/glow: Herk MOTION_PHILOSOPHY timing rules, toned down for calm brands), end card, sample stamp, safe-zone numbers.
- `templates/*.mjs`: the four templates.
- `check.mjs`: safe-zone / overflow / text-size check + phone strip.
- `music/`: royalty-free music and `SOURCES.md` (source of every track).
- `vendor/`: GSAP 3.15 (from the HyperFrames package) and the brand fonts served locally (Bricolage Grotesque, Figtree: SIL OFL), so renders do not depend on CDNs. Add other clients' fonts here and list them in their `brand.json`.
