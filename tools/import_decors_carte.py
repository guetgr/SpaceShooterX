#!/usr/bin/env python3
"""Importe les décors de la carte du monde livrés en PNG à fond transparent : planètes des mondes 2 et 3, nuages de la Terre, satellite en orbite
-> assets/sprites/planet_w2.webp, planet_w3.webp, clouds_earth.webp, orbit_w1.webp, puis relance gen_manifest.py.

  python3 tools/import_decors_carte.py --w2 planete_rouge.png --w3 planete_violette.png --nuages nuages.png --orbite satellite.png     (Pillow + numpy + scipy ; chaque option est facultative)
Nettoyage fait ici : halo et poussières hors des planètes retirés (disque net), franges claires du détourage corrigées (couleur des bords reprise de l'intérieur),
nuages rendus bouclables (fondu enchaîné entre les deux bords : le jeu les fait défiler sans couture)."""
import argparse, os, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = 'assets/sprites/'


def defringe(a, solid=215):
    """a : float32 HxWx4 (0..255). Les pixels semi-transparents prennent la couleur du pixel solide le plus proche (supprime les franges blanches / cyan du détourage)."""
    solid_m = a[..., 3] >= solid
    idx = ndi.distance_transform_edt(~solid_m, return_distances=False, return_indices=True)
    out = a.copy(); out[..., :3] = a[idx[0], idx[1], :3]
    out[..., :3] = np.where(solid_m[..., None], a[..., :3], out[..., :3])
    return out


def to_img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def load(path): return np.array(Image.open(path).convert('RGBA')).astype(np.float32)


def square_crop(a, pad=0.02):
    ys, xs = np.where(a[..., 3] > 30); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    s = max(y1 - y0, x1 - x0); m = int(s * pad); S = s + 2*m
    out = np.zeros((S, S, 4), np.float32); cy, cx = (y0 + y1)//2, (x0 + x1)//2
    oy, ox = cy - S//2, cx - S//2
    for yy in range(S):                                   # collage centré (hors image = transparent)
        sy = oy + yy
        if 0 <= sy < a.shape[0]:
            x_lo, x_hi = max(0, ox), min(a.shape[1], ox + S)
            if x_hi > x_lo: out[yy, x_lo - ox:x_hi - ox] = a[sy, x_lo:x_hi]
    return out


def planet(path, name):
    a = load(path)
    m = ndi.binary_fill_holes(a[..., 3] > 110)
    lab, n = ndi.label(m); m = lab == (1 + int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))))        # le disque, sans poussières
    m = ndi.binary_erosion(m, iterations=3)                                                        # retire le halo de bord
    a = defringe(a, 200); a[..., 3] = ndi.gaussian_filter(m.astype(np.float32), 0.8) * 255
    im = to_img(square_crop(a, 0.01)).resize((512, 512), Image.LANCZOS)
    im.save(OUT + name + '.webp', quality=95, method=6); print(name, im.size)


def orbit(path):
    a = defringe(load(path), 200)
    im = to_img(square_crop(a, 0.04)).resize((256, 256), Image.LANCZOS)
    im.save(OUT + 'orbit_w1.webp', quality=95, method=6); print('orbit_w1', im.size)


def clouds(path):
    a = load(path); ys = np.where((a[..., 3] > 30).any(1))[0]
    a = defringe(a[ys.min():ys.max() + 1], 200); H, W = a.shape[:2]
    pm = a.copy(); pm[..., :3] *= (pm[..., 3:] / 255)                                              # alpha prémultiplié : on mélange sans halo
    shifted = np.roll(pm, W//2, axis=1)
    x = np.arange(W, dtype=np.float32); w = np.clip(1 - np.abs(x - W/2) / (W*0.3), 0, 1); w = w*w*(3 - 2*w)      # 1 au centre, 0 sur les bords : les bords viennent de l'image décalée
    mix = pm*w[None, :, None] + shifted*(1 - w)[None, :, None]
    al = mix[..., 3:]; rgb = np.where(al > 1, mix[..., :3] / np.maximum(al, 1) * 255, 0)
    res = to_img(np.concatenate([rgb, al], 2))
    h = int(round(1024*H/W)); res = res.resize((1024, h), Image.LANCZOS)
    tile = Image.new('RGBA', (1024, 256)); tile.paste(res, (0, (256 - h)//2))
    tile.save(OUT + 'clouds_earth.webp', quality=95, method=6); print('clouds_earth', tile.size)


ap = argparse.ArgumentParser()
for k in ('w2', 'w3', 'nuages', 'orbite'): ap.add_argument('--' + k)
o = ap.parse_args(); n = 0
if o.w2: planet(o.w2, 'planet_w2'); n += 1
if o.w3: planet(o.w3, 'planet_w3'); n += 1
if o.nuages: clouds(o.nuages); n += 1
if o.orbite: orbit(o.orbite); n += 1
if n: subprocess.run([sys.executable, 'tools/gen_manifest.py'], check=True)
else: ap.print_help()
