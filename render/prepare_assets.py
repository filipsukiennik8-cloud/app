"""Wycina kadry ze zdjęć w photos/ do render/assets/ (oryginały pozostają nietknięte)."""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PH, OUT = ROOT / "photos", Path(__file__).resolve().parent / "assets"
OUT.mkdir(exist_ok=True)

# nazwa -> (plik źródłowy, ramka x0,y0,x1,y1) — dopasowanie według treści zdjęć
CROPS = {
    "field":       ("farm-overview.png", (0, 0, 1672, 941)),     # sc. 2 pole (widok ogólny)
    "drones":      ("collage.png", (702, 2, 1178, 354)),         # sc. 3 drony
    "robot-pole":  ("collage.png", (2, 363, 416, 614)),          # sc. 4 robot na słupie
    "greenhouses": ("farm-overview.png", (1110, 440, 1660, 660)),# sc. 5 szklarnie
    "coop":        ("collage.png", (840, 363, 1250, 614)),       # sc. 6-7 kurnik, taśma, robot
    "solar":       ("farm-overview.png", (520, 400, 1070, 630)), # sc. 9 panele + magazyn energii
    "screen":      ("control-room.png", (548, 184, 1092, 482)),  # sc. 10 ekran z mapą i panelami
    "safety":      ("collage.png", (1082, 623, 1314, 939)),      # sc. 11 strefa bezpieczeństwa
}
for name, (src, box) in CROPS.items():
    im = Image.open(PH / src).convert("RGB").crop(box)
    k = max(1.0, 2200 / max(im.size))  # wstępne powiększenie Lanczosem (źródła są małe)
    if k > 1:
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=3))
    im.save(OUT / f"{name}.jpg", quality=95)
    print(name, im.size)
