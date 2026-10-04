# Measure where something lands on screen: temporarily draw a 6×6 pure-red marker (#FF0000) at the
# point you need (e.g. the star's anchor in a line of text), render that frame with
# `node scripts/stills.mjs <Id> <frame> --png`, then: python3 scripts/findred.py out/stills/f<frame>.png
# Prints the marker centre in composition pixels. Remove the marker afterwards. Needs Pillow.
import sys
from PIL import Image

im = Image.open(sys.argv[1]).convert('RGB')
w, h = im.size
px = im.load()
pts = [(x, y) for y in range(h) for x in range(w) if px[x, y][0] > 200 and px[x, y][1] < 70 and px[x, y][2] < 70]
if not pts:
    sys.exit('no red marker found')
print(f'{len(pts)} px, centre x={sum(p[0] for p in pts) / len(pts) + 0.5:.1f} y={sum(p[1] for p in pts) / len(pts) + 0.5:.1f}')
