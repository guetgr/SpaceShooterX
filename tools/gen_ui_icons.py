#!/usr/bin/env python3
"""Dessine les icônes d'interface en pixel art (12x12, contour sombre) et les écrit dans assets/sprites/ui_*.png, puis relance gen_manifest.py.
Elles remplacent les glyphes/émojis de l'interface (cadenas, coche, ◆ composants, ★, pause, engrenage…). Dans le jeu : `uiIco('nom', taille)` (src/ui/ui-icons.js).

  python3 tools/gen_ui_icons.py            écrit les PNG (+ une planche d'aperçu 'docs/img/ui-icons.png')
Pour modifier une icône : changer sa grille ci-dessous (une lettre = un pixel, '.' = transparent, chaque ligne fait 12 caractères) et relancer.
Affichage conseillé : 12 px (dans le texte) ou 24 px (boutons) : multiples entiers, sinon les pixels deviennent irréguliers."""
import os, subprocess, sys
from PIL import Image

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
N = 12
BASE = {'K': '#0a0d0b', 'W': '#f4f8f5'}      # K = contour, W = reflet blanc

ICONS = {
 # ◆ composants : gemme jaune AGP
 'frag': ({'Y': '#ffc21a', 'L': '#ffe58a', 'D': '#c98a0a'}, [
  "..KKKKKKKK..",
  ".KWWLYYYYYK.",
  "KWLLYYYYYDDK",
  "KKKKKKKKKKKK",
  ".KYYYYYYYDK.",
  "..KYYYYYDDK.",
  "...KYYYYDK..",
  "....KYYDK...",
  ".....KDK....",
  "......K.....",
 ]),
 # niveau verrouillé : cadenas jaune
 'lock': ({'Y': '#ffc21a', 'D': '#b97d08', 'S': '#a9b8b0', 'L': '#e2ebe6'}, [
  "...KKKKKK...",
  "..KSSLLSSK..",
  "..KS....SK..",
  "..KS....SK..",
  ".KKKKKKKKKK.",
  ".KYYYYYYYDK.",
  ".KYYYKKYYDK.",
  ".KYYYKKYYDK.",
  ".KYYYYKYYDK.",
  ".KYYYYYYYDK.",
  ".KDDDDDDDDK.",
  "..KKKKKKKK..",
 ]),
 # niveau terminé : coche verte
 'check': ({'G': '#5dffa0', 'L': '#b9ffd8'}, [
  "........KKK.",
  ".......KGGLK",
  "KK....KGGLK.",
  "KGK..KGGLK..",
  "KGGKKGGLK...",
  ".KGGGGGK....",
  "..KGGGK.....",
  "...KGK......",
  "....K.......",
 ]),
 # incident majeur : crâne, yeux rouges
 'skull': ({'B': '#e9e2c8', 'R': '#ff4438', 'S': '#a89f84'}, [
  "...KKKKKK...",
  "..KBBBBBBK..",
  ".KBBBBBBBBK.",
  ".KBKKBBKKBK.",
  ".KBKRBBRKBK.",
  ".KBBBKKBBBK.",
  "..KBBBBBSK..",
  "...KBKBKBK..",
  "...KKKKKKK..",
 ]),
 'star': ({'Y': '#ffc21a', 'L': '#ffe58a', 'D': '#c98a0a'}, [
  ".....KK.....",
  "....KLYK....",
  "....KYYK....",
  "KKKKKYYKKKKK",
  "KLYYYYYYYYDK",
  ".KYYYYYYYYK.",
  "..KYYYYYYK..",
  "..KYYKKYYK..",
  ".KYYK..KYYK.",
  ".KYK....KYK.",
  ".KK......KK.",
 ]),
 'pause': ({'T': '#e9f1ec', 'D': '#9db0a4'}, [
  ".KKKK..KKKK.",
  ".KTTK..KTTK.",
  ".KTTK..KTTK.",
  ".KTTK..KTTK.",
  ".KTTK..KTTK.",
  ".KTTK..KTTK.",
  ".KTTK..KTTK.",
  ".KTDK..KTDK.",
  ".KTDK..KTDK.",
  ".KKKK..KKKK.",
 ]),
 'gear': ({'S': '#b9c6bf', 'D': '#7f948a'}, [
  "....KKKK....",
  "..K.KSSK.K..",
  ".KSKKSSKKSK.",
  ".KSSSSSSSSK.",
  "KKSSKKKKSSKK",
  "KSSSK..KSSSK",
  "KSSSK..KSDSK",
  "KKSSKKKKSDKK",
  ".KSSSSSSDDK.",
  ".KSKKSSKKDK.",
  "..K.KSDK.K..",
  "....KKKK....",
 ]),
 # bouton « répartition des secteurs » : étincelle cyan
 'galaxy': ({'C': '#3fe0c5', 'B': '#7fc8ff'}, [
  ".....KK.....",
  "....KCCK....",
  "...KKCCKK...",
  "KKKCCWWCCKKK",
  "KCCCWWWWBBBK",
  "KKKBBWWBBKKK",
  "...KKBBKK...",
  "....KBBK....",
  ".....KK.....",
 ]),
 'arrow_r': ({}, [
  "..KK........",
  "..KWK.......",
  "..KWWK......",
  "..KWWWK.....",
  "..KWWWWK....",
  "..KWWWWWK...",
  "..KWWWWWK...",
  "..KWWWWK....",
  "..KWWWK.....",
  "..KWWK......",
  "..KWK.......",
  "..KK........",
 ]),
 'next': ({'Y': '#ffc21a', 'L': '#ffe58a'}, [
  "..KK........",
  "..KLK.......",
  "..KLYK......",
  "..KLYYK.....",
  "..KLYYYK....",
  "..KLYYYYK...",
  "..KLYYYYK...",
  "..KLYYYK....",
  "..KLYYK.....",
  "..KLYK......",
  "..KLK.......",
  "..KK........",
 ]),
 # pastilles de palier (●○)
 'pip_on': ({'Y': '#ffc21a', 'D': '#c98a0a'}, [
  "....KKKK....",
  "...KYYYYK...",
  "..KYWYYYYK..",
  "..KYYYYYDK..",
  "..KYYYYDDK..",
  "...KDDDDK...",
  "....KKKK....",
 ]),
 'pip_off': ({'G': '#33463c'}, [
  "....KKKK....",
  "...KGGGGK...",
  "..KGGGGGGK..",
  "..KGGGGGGK..",
  "..KGGGGGGK..",
  "...KGGGGK...",
  "....KKKK....",
 ]),
 'trophy': ({'Y': '#ffc21a', 'D': '#c98a0a'}, [
  "..KKKKKKKK..",
  "KKKYWYYYYKKK",
  "KYKYWYYYYKYK",
  "KYKYWYYYDKYK",
  ".KKYYYYYDKK.",
  "...KYYYDK...",
  "....KYDK....",
  "....KYDK....",
  "...KKKKKK...",
  "..KYYYYYDK..",
  "..KKKKKKKK..",
 ]),
 # « touche ici » : main au doigt levé
 'hand': ({'S': '#f2c79b', 'D': '#c9976a'}, [
  ".....KK.....",
  "....KSSK....",
  "....KSSK....",
  "....KSSKK...",
  "....KSSKSK..",
  ".KK.KSSKSKK.",
  "KSKKSSSSSSK.",
  "KSSSSSSSSSK.",
  ".KSSSSSSSDK.",
  ".KSSSSSSSDK.",
  "..KSSSSSDK..",
  "...KKKKKK...",
 ]),
}


def render(pal, rows):
    p = dict(BASE); p.update(pal)
    h = len(rows); w = max(len(r) for r in rows)
    assert all(len(r) == N for r in rows), [r for r in rows if len(r) != N]
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0)); oy = (N - h)//2
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != '.': im.putpixel((x, y + oy), tuple(int(p[ch][i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    # arrow_l : miroir de arrow_r
    return im


os.makedirs('assets/sprites', exist_ok=True)
made = {}
for name, (pal, rows) in ICONS.items():
    made[name] = render(pal, rows)
made['arrow_l'] = made['arrow_r'].transpose(Image.FLIP_LEFT_RIGHT)
for name, im in made.items(): im.save('assets/sprites/ui_%s.png' % name)
print(len(made), 'icônes :', ' '.join(made))

# planche d'aperçu (fond sombre, x6)
S = 6; cols = 8; rows_n = (len(made) + cols - 1)//cols
sheet = Image.new('RGBA', (cols*(N*S + 10) + 10, rows_n*(N*S + 10) + 10), (14, 22, 18, 255))
for i, (name, im) in enumerate(made.items()):
    x, y = 10 + (i % cols)*(N*S + 10), 10 + (i//cols)*(N*S + 10)
    sheet.alpha_composite(im.resize((N*S, N*S), Image.NEAREST), (x, y))
os.makedirs('docs/img', exist_ok=True); sheet.save('docs/img/ui-icons.png')
subprocess.run([sys.executable, 'tools/gen_manifest.py'], check=True)
