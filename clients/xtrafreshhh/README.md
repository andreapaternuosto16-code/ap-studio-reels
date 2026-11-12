# XtraFreshhh reels

- `brand.json`: colours, fonts, logo (`kit/xf-logo.png`, used as-is, end card only), photo folder.
- `reels/`: one JSON per reel, wording = the **reviewed** wording (12 Nov), not the kit's draft file.
- `renders/`: sample MP4s (with and without music), check reports and phone-size strips.
- `kit/`: the original build kit (photos, style reference, plan, draft wording, logo).

| Reel | JSON | Template | Status |
|---|---|---|---|
| R1 19 Nov | `2026-11-19-r1-estimate.json` | price-walkthrough | Sample rendered. Phone screens are a mock in the brand look: check service names against the live site. |
| R2 26 Nov | `2026-11-26-r2-3-tips.json` | three-tips | Sample rendered. |
| R3 3 Dec | `2026-12-03-r3-before-after.json` | before-after | Needs Alexandra's real photos (currently stamped SAMPLE). Fallback: `2026-12-03-r3-fallback-3-tips.json`. |
| R4 10 Dec | `2026-12-10-r4-review.json` | review-card | Sample rendered with a stamped placeholder. Needs the real review + Alexandra's OK. |
| R5 17 Dec | `2026-12-17-r5-before-after.json` | before-after | Sample rendered with stamped stand-in photos. Needs her real oven photos. Fallback: `2026-12-17-r5-fallback-3-tips.json`. |
| R6 24 Dec | `2026-12-24-r6-christmas-3-tips.json` | three-tips (+ Christmas frame) | JSON ready, passes the check. |

## Round 2 (12 Nov): engaging reels, new pictures per reel
Pictures and cleaning kit: `kit-round2/` (assets A, B, C, D, research, reviewed wording). Never the carousel photos.

| Reel | JSON | Template | Status |
|---|---|---|---|
| A Thu 19 Nov | `2026-11-19-r2a-pov-booked.json` | pov-booking | Sample rendered. Before posting: check the live estimate/request flow and email confirmation match the story; confirm "Bedroom ✓" (the review listed "Living room", but picture A/04 is a bedroom). |
| B Thu 3 Dec | `2026-12-03-r2b-christmas-countdown.json` | countdown | Sample rendered. `days` = 22 for 3 Dec 2026; change it if the posting date moves. |
| C Thu 10 Dec | `2026-12-10-r2c-reviews-we-love.json` | review-notifications | **Sample only (placeholders, never post).** Needs the real excerpts, each review's rating, public names, permission/basis + evidence, and a verified total with check date (or set `count.value` to "" to drop that frame). |
