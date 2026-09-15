"""Extract cover proportions and colors locally; requires Pillow only when refreshing."""
import json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
books = json.loads((ROOT / 'data/books.json').read_text())
result = {}
for book in books:
    cover = ROOT / book['cover'].lstrip('/')
    if not book['cover'] or not cover.is_file():
        continue
    try:
        with Image.open(cover) as image:
            width, height = image.size
            sample = image.convert('RGB').resize((32, 48))
            # Dominant edge color approximates the jacket's spine without displaying stretched cover text.
            edge = sample.crop((0, 0, 10, 48)).quantize(colors=5)
            index = max(edge.getcolors(), key=lambda item: item[0])[1]
            rgb = edge.getpalette()[index * 3:index * 3 + 3]
            luminance = sum(v * w for v, w in zip(rgb, [.2126, .7152, .0722]))
            result[book['id']] = {'cover': book['cover'], 'ratio': round(width / height, 3), 'color': '#%02x%02x%02x' % tuple(rgb), 'ink': '#f8f3e6' if luminance < 145 else '#272820'}
    except (OSError, ValueError):
        pass
(ROOT / 'data/book-appearance.json').write_text(json.dumps(result, separators=(',', ':')) + '\n')
print(f'Extracted shape and jacket colors for {len(result)} covers.')
