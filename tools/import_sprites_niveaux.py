#!/usr/bin/env python3
"""Importe les icônes de niveaux livrées en PNG (256x256, fond transparent) : PNG RGBA -> assets/sprites/*.webp, puis relance gen_manifest.py. (Planètes, nuages et satellite : tools/import_decors_carte.py.)

  python3 tools/import_sprites_niveaux.py <dossier_ou_zip_extrait>      (Pillow + numpy)
Noms reconnus (dans le dossier, sous-dossiers compris) :
  lvl_w1_tuto, lvl_w1_l1 … lvl_<monde>_<niveau>  -> assets/sprites/<même nom>.webp          (pensez à les ajouter à LEVEL_ICONS, src/data/image-assets.js)
"""
import os, re, subprocess, sys
import numpy as np
from PIL import Image

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1]
CIRCLE = {'lvl_w1_l1'}      # la Terre y est coupée net par le bas de l'image : on la cadre dans un disque doux pour que le médaillon soit propre


def circle_mask(im, cx, cy, r, feather=3):
    a = np.array(im); h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    k = np.clip((r - np.hypot(xx - cx, yy - cy)) / feather, 0, 1)
    a[..., 3] = (a[..., 3] * k).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')


n = 0
for root, _, files in os.walk(SRC):
    for f in sorted(files):
        name, ext = os.path.splitext(f)
        if ext.lower() != '.png' or not re.fullmatch(r'lvl_w\d+_(tuto|l\d+)', name): continue
        im = Image.open(os.path.join(root, f)).convert('RGBA')
        if name in CIRCLE: im = circle_mask(im, im.width/2, im.height*0.48, im.width*0.43)
        out = 'assets/sprites/' + name + '.webp'
        im.save(out, quality=95, method=6); print(out, im.size); n += 1
print(n, 'fichier(s) importé(s)')
if n: subprocess.run([sys.executable, 'tools/gen_manifest.py'], check=True)
