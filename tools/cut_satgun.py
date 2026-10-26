#!/usr/bin/env python3
"""Découpe la planche « satellite qui tire » (concept ChatGPT, fond peint + légendes) en une bande d'images 200x200 à fond transparent :
assets/sprites/satgun_sheet.webp (26 images : idle 0-4 · charge 5-6 · recul 7-8 · dégâts 9-17 · explosion 18-25 ; la 3e image de charge porte le rayon, on tire par code).
  python tools/cut_satgun.py        (Pillow + scipy + numpy ; adapter SRC)
Les boîtes (x, y, largeur, hauteur) de chaque image ont été relevées à la main sur la planche d'origine."""
import numpy as np, json, os
from PIL import Image
from scipy import ndimage as ndi
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = r'D:/IA chat/space shooter x/sprites/nouveausprite/sattelite tir.png'      # planche d'origine (hors dépôt)
im = Image.open(SRC).convert('RGBA'); a = np.array(im); rgb = a[..., :3].astype(float)
bg = np.stack([ndi.gaussian_filter(rgb[..., c], 40) for c in range(3)], -1)
diff = np.abs(rgb - bg).sum(-1)
H, W = diff.shape

MASK = ndi.binary_opening(diff > 62, iterations=1)
LAB, NL = ndi.label(MASK)
CEN = ndi.center_of_mass(MASK, LAB, range(1, NL + 1)); AREA = ndi.sum(MASK, LAB, range(1, NL + 1))

def solid(box):
    """image d'un satellite : on garde les morceaux dont le centre tombe dans la boîte (x,y,w,h) ; trous remplis, bords adoucis"""
    x, y, w, h = box
    ids = [i + 1 for i, (cy, cx) in enumerate(CEN) if x <= cx <= x + w and y <= cy <= y + h and AREA[i] > 25]
    if not ids: return None
    m = np.isin(LAB, ids)
    m = ndi.binary_fill_holes(ndi.binary_closing(m, iterations=2))
    ys, xs = np.where(m)
    y0, y1, x0, x1 = max(0, ys.min() - 4), min(H, ys.max() + 5), max(0, xs.min() - 4), min(W, xs.max() + 5)
    soft = ndi.gaussian_filter(m[y0:y1, x0:x1].astype(float), 0.9)
    alpha = np.clip((soft - 0.35) / 0.4, 0, 1)
    out = np.dstack([a[y0:y1, x0:x1, :3], (alpha * 255).astype(np.uint8)])
    yy, xx = np.where(alpha > 0.05)
    return Image.fromarray(out[yy.min():yy.max() + 1, xx.min():xx.max() + 1])

F = {}
F['idle'] = [solid(b) for b in [(14, 51, 166, 176), (161, 81, 163, 149), (294, 91, 161, 137), (428, 86, 155, 146), (558, 77, 171, 153)]]
F['charge'] = [solid(b) for b in [(777, 85, 162, 150), (911, 84, 159, 150)]]              # la 3e image porte le rayon : on tire par code
F['recoil'] = [solid(b) for b in [(1232, 84, 154, 128), (1356, 71, 167, 164)]]
F['dmgA'] = [solid(b) for b in [(798, 311, 185, 168), (954, 334, 170, 150), (1108, 339, 160, 145), (1267, 344, 177, 138)]]
F['torn'] = [solid(b) for b in [(16, 540, 135, 174), (147, 546, 162, 169), (289, 547, 117, 169)]]
F['crack'] = [solid(b) for b in [(533, 550, 136, 174), (669, 544, 131, 176), (804, 545, 125, 175)]]
F['boom'] = [solid(b) for b in [(980, 555, 135, 168), (1105, 587, 126, 120), (1242, 563, 135, 155), (1389, 598, 130, 118), (16, 801, 113, 154), (162, 807, 97, 146), (282, 804, 91, 138), (400, 852, 72, 71)]]
for k, v in F.items(): print(k, [None if i is None else i.size for i in v])

# ---- planche : cellules 200x200, image centrée ; ordre : idle5 · charge2 · recoil2 · dégâts9 · explosion8
CELL = 200
dmg = [F['idle'][0]] + F['dmgA'][:4] + F['torn'] + [F['crack'][0]]                    # 9 états, du neuf à l'agonie
frames = F['idle'] + F['charge'] + F['recoil'] + dmg + F['boom']
sheet = Image.new('RGBA', (CELL * len(frames), CELL), (0, 0, 0, 0))
# échelle commune pour que le satellite garde la même taille d'une image à l'autre (hors explosion, qui s'étale)
ref = max(i.size[0] for i in F['idle'][:1] + dmg[:1])
for k, fr in enumerate(frames):
    s = 1.0 if fr.size[0] <= CELL and fr.size[1] <= CELL else min(CELL / fr.size[0], CELL / fr.size[1])
    f2 = fr.resize((max(1, int(fr.size[0] * s)), max(1, int(fr.size[1] * s))), Image.LANCZOS) if s != 1.0 else fr
    sheet.alpha_composite(f2, (k * CELL + (CELL - f2.size[0]) // 2, (CELL - f2.size[1]) // 2))
os.makedirs('assets/sprites', exist_ok=True)
sheet.save('assets/sprites/satgun_sheet.webp', lossless=True, quality=100, method=6)
meta = { 'cell': CELL, 'n': len(frames), 'idle': [0, 4], 'charge': [5, 6], 'recoil': [7, 8], 'dmg': [9, 17], 'boom': [18, 25] }
print(meta, os.path.getsize('assets/sprites/satgun_sheet.webp') // 1024, 'Ko')
