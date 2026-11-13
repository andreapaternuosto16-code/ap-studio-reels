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

## Round 3 templates (current): real, clean, ≤ 15 s
Andrea's round-2 verdict was "really, really bad": fake effects, blank phone screens, shake, overlapping cards, too long.
Round 3 uses only what a filmed video could contain. Library: `lib/real.mjs`.

| Template | What it does |
|---|---|
| `r3-pov-booked` | Hand-held phone (A01) showing **real xtrafreshhh.com pages** in an iOS Safari frame, corner-pinned to the screen (perspective, rounded mask, scene light, glass reflection) → slow real camera zoom as three iOS notifications appear one under the other (no overlap) with an "Example booking" label → push-through match cut into the rooms (one ✓ each) → feet up, light softens → end card. |
| `r3-countdown` | Flip board flips in (kept from round 2) → clean cut → "3 jobs to do now" → three numbered jobs full-bleed, each with one camera move and a real screen where a phone is visible → slow pan with soft, natural three-depth snow while the handwriting completes and holds → end card. `days` slot. |
| `r3-reviews` | Title on the calm wall → three reviews, one at a time, on a full-width card that slides in as the previous slides out (they move together, never overlapping), ~2.7 s each, over the phone shot with the real site on its screen → "Care in the little details." on a real detail → end card. No count-up. |

Rules the round-3 templates follow: cuts on the music's beat; one smooth camera move per shot; text revealed by a clean mask;
no sparkles, bubbles, flying objects, shake, glows, boxes or fades behind text. Text sits on the calmest part of each frame,
found by measurement; where a frame has none, the whole shot gets a gentle exposure pull (a natural light change).
End cards: full-bleed photo, big headline, logo PNG as-is, site address, held ≥ 1.5 s.

**Legibility check (new):** at key moments the checker hides the text, screenshots the frame, and measures each line's
contrast against the worst 8% of the pixels behind it. It fails below 3:1 for large bold text, 4.5:1 for smaller text.

## Round 2 templates (superseded, kept for reference) (engaging, animation-led, each reel a different look)
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
- `<reel>-contact.jpg`: frames taken from the finished MP4, labelled with their times (round 3: one every 0.5 s).

The check only judges text once it has settled (text mid-whip or mid-landing is checked when it stops), skips text that is off-screen or faded out, and measures text size after zoom/perspective.

## Pieces
- `lib/page.mjs`: page shell, calm motion helpers (rise + fade, no blur/glow: Herk MOTION_PHILOSOPHY timing rules, toned down for calm brands), end card, sample stamp, safe-zone numbers.
- `templates/*.mjs`: the four templates.
- `check.mjs`: safe-zone / overflow / text-size check + phone strip.
- `music/`: royalty-free music and `SOURCES.md` (source of every track).
- `vendor/`: GSAP 3.15 (from the HyperFrames package) and the fonts served locally (Bricolage Grotesque, Figtree, plus Caveat for handwritten accents: all SIL OFL), so renders do not depend on CDNs. Add other clients' fonts here and list them in their `brand.json`.
