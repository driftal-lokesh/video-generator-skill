# Contact sheets from half-scale stills: python3 scripts/sheet.py <frame> [<frame>…]
# Six stills per sheet (3 × 2), each labelled with its frame → out/stills/sheet<N>.jpg. Needs Pillow.
import sys
from pathlib import Path
from PIL import Image, ImageDraw

d = Path(__file__).resolve().parent.parent / 'out' / 'stills'
frames = [int(x) for x in sys.argv[1:]]
for k in range(0, len(frames), 6):
    sheet = Image.new('RGB', (2880, 1080), 'white')
    for j, f in enumerate(frames[k:k + 6]):
        x, y = (j % 3) * 960, (j // 3) * 540
        sheet.paste(Image.open(d / f'f{f}.jpg').convert('RGB').resize((960, 540)), (x, y))
        ImageDraw.Draw(sheet).text((x + 8, y + 6), str(f), fill='red')
    sheet.save(d / f'sheet{k // 6}.jpg', quality=85)
    print(d / f'sheet{k // 6}.jpg')
