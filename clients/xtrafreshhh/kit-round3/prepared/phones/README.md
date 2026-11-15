Phone screens traced from the photos with `engine/tools/trace_screen.py` (rays from the screen centre to the black
bezel, a line fitted to each edge: fit error ≤ 0.32 px; device screen shape projected through that quad, 42 pt corners
matched to these phones at 200%).

| Phone | Photo | Corner-pin quad (TL, TR, BR, BL) |
|---|---|---|
| a01 | A/01-phone | (240.3,479.6) (652.1,448.7) (742.6,1366.1) (327.2,1411.9) |
| b02 | B/02-phone-table | (149.2,899.2) (460.3,812.9) (795.1,1380.2) (417.3,1502.5) |
| c02 | C/02-phone-sofa | (342.1,1138.9) (559.3,1082.8) (808.9,1409.9) (547.3,1490.7) |

`-mask` = clip mask, `-shadow` = soft inner shadow at the glass/bezel edge, `-glass` = the photo's own glass (faint reflections).
