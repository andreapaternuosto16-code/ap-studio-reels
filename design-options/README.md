# XtraFreshhh reels — style options (step 1, waiting for a pick)

Three looks for the **3-tips** template, shown as start / middle / end stills. Open **COMPARE.png** first.
All three follow the carousel look (Option A carousels): bright daylight photo, deep-teal text straight on the wall,
Bricolage Grotesque + Figtree, no boxes/glows behind text, logo only on the end card with xtrafreshhh.com,
text kept out of the top 220 px and bottom 380 px (grey bands on COMPARE.png).

| | How the tips appear | Photo motion | End card |
|---|---|---|---|
| **A — Wall list** | Headline stays; tips 1-2-3 build up as a list under it | Slow drift out | Same photo, line + logo + site on the wall |
| **B — Big number** | One tip at a time with a large "1 / 2 / 3" (like the carousel's big "3") | Slow push in | Plain cream page |
| **C — Centred & quiet** | One tip at a time, centred, "Tip 2 of 3" + three small dots | Slow sideways pan | Plain blush page |

Photo: `kitchen-v2.jpg` from the kit. Wording: R2 (26 Nov) from the wording file, as is.

Rebuild: `node design-options/build.mjs`, then in an option folder
`HYPERFRAMES_NO_TELEMETRY=1 ../../engine/node_modules/.bin/hyperframes snapshot . --at 1.6,8.2,11.5`.
These are throwaway design projects; the real templates go in `engine/` after the pick.
