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

## Round 2 templates (engaging, animation-led, each reel a different look)
| Template | What it does |
|---|---|
| `pov-booking` | Phone in hand: hook as a lock-screen headline, three notification stages arriving separately (buzz + glint), a persistent "Example booking" label, all mapped onto the real phone screen with a perspective transform → whip-pan across a pan strip → room photos land like dealt prints, each with spray mist, glints and a ✓ stamp → cinematic push on a closing photo under a cream band → end card with the cleaning-kit cut-outs and their shadows. |
| `countdown` | Brand-coloured split-flap board flips to "<days> DAYS TO / CHRISTMAS" (`days` slot) with light snow → intro line → three numbered jobs on inset photo cards, each with its own camera move (dolly in, rack focus, pull back) → the card opens into a slow pan with a handwritten line (Caveat) and drawn underline → Christmas end card (blush snow, polaroid). |
| `review-notifications` | Title with rising bubbles → each review drops in as a phone notification with buzz ("Google review", that review's own stars, exact excerpt ≤ 15 words, public name), held for a time set by its word count → optional count-up of the verified total with its check date (omitted when empty) → a cloth wipes a fogged mirror and uncovers the line, glints → three detail photos with hand-drawn circles → blush end card with bubbles. `sample: true` marks every card and the count "SAMPLE — NOT FOR POSTING". |

Round-2 effects live in `lib/fx.mjs` (cut-outs with separate shadows, glints, spray mist, bubbles, snow, mask-reveal lines,
pop-in words, stamp badges, callout circles, split-flap board, handwriting, phone-screen perspective). They follow the ideas of
the HyperFrames registry blocks named in the brief (whip-pan, cinematic-zoom, camera-dolly, rack-focus, lt-mask-reveal,
split-flap-board, hw-write-title, mk-callout-highlight, notification cascade, snow) but are written for this engine in the
brand's colours; no block code is copied. Cuts are placed on the music's beat grid (`bpm` in the reel JSON).

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
- `<reel>-contact.jpg`: (round 2) 6 frames taken from the finished MP4, labelled with their times.

The check only judges text once it has settled (text mid-whip or mid-landing is checked when it stops), skips text that is off-screen or faded out, and measures text size after zoom/perspective.

## Pieces
- `lib/page.mjs`: page shell, calm motion helpers (rise + fade, no blur/glow: Herk MOTION_PHILOSOPHY timing rules, toned down for calm brands), end card, sample stamp, safe-zone numbers.
- `templates/*.mjs`: the four templates.
- `check.mjs`: safe-zone / overflow / text-size check + phone strip.
- `music/`: royalty-free music and `SOURCES.md` (source of every track).
- `vendor/`: GSAP 3.15 (from the HyperFrames package) and the fonts served locally (Bricolage Grotesque, Figtree, plus Caveat for handwritten accents: all SIL OFL), so renders do not depend on CDNs. Add other clients' fonts here and list them in their `brand.json`.
