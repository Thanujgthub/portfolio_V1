from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen, Request
from io import BytesIO
from PIL import Image

out = Path(__file__).parent / "dist" / "assets"
base = "https://portfolio2-seven-orcin.vercel.app"
images = ["sky", "back-four", "back-bazaar", "splitframe-left", "splitframe-right", "bridge", "frame-two", "pin-1", "pin-2", "pin-3"]
fonts = {
    "fraunces.woff2": "fraunces-latin-wght-normal-ukD16Tqj.woff2",
    "inter-tight.woff2": "inter-tight-latin-wght-normal-DX-nOvPD.woff2",
    "syne.woff2": "syne-latin-700-normal-AF3Rs61n.woff2",
    "mono.woff2": "jetbrains-mono-latin-400-normal-V6pRDFza.woff2",
}

def download(item):
    name, url, is_image = item
    data = urlopen(Request(url, headers={"User-Agent": "PortfolioBuilder"}), timeout=60).read()
    if is_image:
        im = Image.open(BytesIO(data))
        im.thumbnail((2400, 1600), Image.Resampling.LANCZOS)
        im.save(out / name, "WEBP", quality=87, method=6)
    else:
        (out / name).write_bytes(data)
    return f"{name}: {(out / name).stat().st_size:,} bytes"

items = [(f"{n}.webp", f"{base}/art/{n}.png", True) for n in images]
items += [(name, f"{base}/assets/{remote}", False) for name, remote in fonts.items()]
with ThreadPoolExecutor(max_workers=6) as pool:
    for result in pool.map(download, items):
        print(result)
