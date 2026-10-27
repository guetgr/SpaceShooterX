# Space Shooter X — ce que fait le jeu à CHAQUE niveau d'alerte (relevé dans le code)

> **NOUVEAU — le niveau d'alerte monte PENDANT la partie.** Il démarre au niveau de l'arbre de compétences (les niveaux ci-dessous), puis gagne **+1 toutes les 2 minutes** (`ALERT_RISE_SECONDS = 120`), jusqu'au niveau 20. Le chrono du HUD rougit progressivement puis clignote avant le palier ; à chaque montée : flash rouge, annonce « ALERTE n », armes ennemies et dézoom suivent. Le chrono est **gelé pendant un combat de boss**. Les PV des boss partent de la table du niveau de DÉPART, puis ×1,4 par niveau gagné en partie (`BOSS_RUN_ALERT_HP`). Les anciens boosts « au temps » ont été adoucis : PV ennemis +3,5 %/palier de 20 s après 10 min, dégâts +3 %/min après 10 min.


Niveaux **1 à 15** : on les atteint avec les points de l'arbre. Niveaux **16 à 20** : uniquement par ascension (niveau 15 + ascensions). Rien n'est encore dessiné pour 16-20 : ils continuent simplement les formules du niveau 15.

## 1. Puissance des ennemis et du boss

| Niv. | Points d'arbre | Dégâts ennemis (part alerte) | PV ennemis (part alerte) | Vitesse des tirs ennemis | Délai de tir ennemi | PV boss (table) | XP gagnée |
|---|---|---|---|---|---|---|---|
| 1 | 0 | ×1.00 | ×1.00 | ×1.00 | ×1.00 | 1.3 | ×1.00 |
| 2 | 6 pts | ×1.10 | ×1.00 | ×1.00 | ×0.91 | 2.1 | ×1.12 |
| 3 | 14 pts | ×1.20 | ×1.00 | ×1.00 | ×0.82 | 2.8 | ×1.24 |
| 4 | 24 pts | ×1.30 | ×1.00 | ×1.00 | ×0.73 | 4.2 | ×1.36 |
| 5 | 36 pts | ×1.40 | ×1.15 | ×1.00 | ×0.64 | 11 | ×1.48 |
| 6 | 50 pts | ×1.50 | ×1.30 | ×1.00 | ×0.55 | 22 | ×1.60 |
| 7 | 90 pts | ×1.60 | ×1.45 | ×1.03 | ×0.46 | 40 | ×1.72 |
| 8 | 140 pts | ×1.70 | ×1.60 | ×1.07 | ×0.37 | 103 | ×1.84 |
| 9 | 170 pts | ×1.80 | ×1.75 | ×1.10 | ×0.28 | 162 | ×1.96 |
| 10 | 200 pts | ×1.90 | ×1.90 | ×1.14 | ×0.25 | 231 | ×2.08 |
| 11 | 230 pts | ×2.00 | ×2.05 | ×1.18 | ×0.25 | 311 | ×2.20 |
| 12 | 260 pts | ×2.10 | ×2.20 | ×1.21 | ×0.25 | 407 | ×2.32 |
| 13 | 290 pts | ×2.20 | ×2.35 | ×1.25 | ×0.25 | 527 | ×2.44 |
| 14 | 342 pts | ×2.30 | ×2.50 | ×1.28 | ×0.25 | 672 | ×2.56 |
| 15 | 381 pts | ×2.40 | ×2.65 | ×1.31 | ×0.25 | 858 | ×2.68 |
| 16 | ascension (niv.15 + 1) | ×2.50 | ×2.80 | ×1.35 | ×0.25 | 1030 | ×2.80 |
| 17 | ascension (niv.15 + 2) | ×2.60 | ×2.95 | ×1.39 | ×0.25 | 1236 | ×2.92 |
| 18 | ascension (niv.15 + 3) | ×2.70 | ×3.10 | ×1.42 | ×0.25 | 1483 | ×3.04 |
| 19 | ascension (niv.15 + 4) | ×2.80 | ×3.25 | ×1.46 | ×0.25 | 1780 | ×3.16 |
| 20 | ascension (niv.15 + 5) | ×2.90 | ×3.40 | ×1.49 | ×0.25 | 2136 | ×3.28 |

(Tout ça se multiplie ensuite avec le TEMPS de partie : PV ennemis ×(1+0,2 par palier de 20 s) puis exponentiel après 10 min ; dégâts +40 % jusqu'à 10 min puis +6 %/min cumulés.)

## 2. Quels ennemis, et quand

Les types arrivent selon `temps de partie + 12 s × (niveau-1)` : plus le niveau est haut, plus ils sont là tôt. Liste « dès le début » = ce qui peut déjà apparaître à 0:00.

| Niv. | Présents dès 0:00 | Arrivent ensuite (type @ secondes) | Spawns bonus par vague | Kamikazes / groupe | Araignées / groupe |
|---|---|---|---|---|---|
| 1 | Grunt seulement | Grunt @0s, Plongeur @8s, Tireur @12s, Tourelle @20s, Kamikaze @22s, Drone @28s, Araignée @30s, Diviseur @35s, Grunt blindé @45s, Mine @50s, Tank @55s, Bombardier @65s, Sniper @75s, Essaim @80s, Healer @95s, Charognard @100s, Fantôme @110s, Élite @130s, Mothership @140s, Vortex @150s | +0 | 1 | 2 |
| 2 | Grunt, Plongeur | Tireur @0s, Tourelle @8s, Kamikaze @10s, Drone @16s, Araignée @18s, Diviseur @23s, Grunt blindé @33s, Mine @38s, Tank @43s, Bombardier @53s, Sniper @63s, Essaim @68s, Healer @83s, Charognard @88s, Fantôme @98s, Élite @118s, Mothership @128s, Vortex @138s | +0 | 1 | 2 |
| 3 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze | Drone @4s, Araignée @6s, Diviseur @11s, Grunt blindé @21s, Mine @26s, Tank @31s, Bombardier @41s, Sniper @51s, Essaim @56s, Healer @71s, Charognard @76s, Fantôme @86s, Élite @106s, Mothership @116s, Vortex @126s | +0 | 1 | 2 |
| 4 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur | Grunt blindé @9s, Mine @14s, Tank @19s, Bombardier @29s, Sniper @39s, Essaim @44s, Healer @59s, Charognard @64s, Fantôme @74s, Élite @94s, Mothership @104s, Vortex @114s | +1 | 2 | 3 |
| 5 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé | Mine @2s, Tank @7s, Bombardier @17s, Sniper @27s, Essaim @32s, Healer @47s, Charognard @52s, Fantôme @62s, Élite @82s, Mothership @92s, Vortex @102s | +1 (+jusqu'à 8 si l'écran est vide) | 2 | 3 |
| 6 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank | Bombardier @5s, Sniper @15s, Essaim @20s, Healer @35s, Charognard @40s, Fantôme @50s, Élite @70s, Mothership @80s, Vortex @90s | +2 (+jusqu'à 8 si l'écran est vide) | 2 | 3 |
| 7 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier | Sniper @3s, Essaim @8s, Healer @23s, Charognard @28s, Fantôme @38s, Élite @58s, Mothership @68s, Vortex @78s | +2 (+jusqu'à 8 si l'écran est vide) | 3 | 3 |
| 8 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim | Healer @11s, Charognard @16s, Fantôme @26s, Élite @46s, Mothership @56s, Vortex @66s | +3 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 9 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer | Charognard @4s, Fantôme @14s, Élite @34s, Mothership @44s, Vortex @54s | +3 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 10 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard | Fantôme @2s, Élite @22s, Mothership @32s, Vortex @42s | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 11 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme | Élite @10s, Mothership @20s, Vortex @30s | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 12 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite | Mothership @8s, Vortex @18s | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 13 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership | Vortex @6s | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 14 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 15 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 16 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 17 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 18 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 19 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |
| 20 | Grunt, Plongeur, Tireur, Tourelle, Kamikaze, Drone, Araignée, Diviseur, Grunt blindé, Mine, Tank, Bombardier, Sniper, Essaim, Healer, Charognard, Fantôme, Élite, Mothership, Vortex | — | +4 (+jusqu'à 8 si l'écran est vide) | 3 | 4 |

## 3. Comportements et mécaniques

| Niv. | Entrées par les côtés | Bouclier des ennemis | Esquive des tirs joueur | Cadence d'apparition (mini / facteur) | Dézoom final (en 90 s ÷ ...) | Divers |
|---|---|---|---|---|---|---|
| 1 | — | — | — | 320 ms / ×1.00 | ×1.00 en 90 s | les ennemis ne tirent qu'une fois arrêtés; ton vaisseau démarre au tier 1 |
| 2 | — | — | — | 304 ms / ×0.94 | ×0.92 en 72 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés) |
| 3 | — | — | — | 288 ms / ×0.88 | ×0.84 en 60 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée |
| 4 | 6 % des apparitions, jusqu'à 14 % de la hauteur | — | 45 % (vise 170 px) | 272 ms / ×0.82 | ×0.76 en 51 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée |
| 5 | 12 % des apparitions, jusqu'à 17 % de la hauteur | 12 % des PV | 45 % (vise 170 px) | 256 ms / ×0.76 | ×0.68 en 45 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3 |
| 6 | 18 % des apparitions, jusqu'à 21 % de la hauteur | 24 % des PV | 90 % (vise 260 px) | 240 ms / ×0.70 | ×0.60 en 40 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3 |
| 7 | 24 % des apparitions, jusqu'à 24 % de la hauteur | 36 % des PV | 91 % (vise 270 px) | 224 ms / ×0.64 | ×0.60 en 36 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3 |
| 8 | 30 % des apparitions, jusqu'à 28 % de la hauteur | 48 % des PV | 92 % (vise 280 px) | 207 ms / ×0.58 | ×0.60 en 33 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 9 | 36 % des apparitions, jusqu'à 31 % de la hauteur | 60 % des PV | 93 % (vise 290 px) | 192 ms / ×0.52 | ×0.58 en 30 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 10 | 42 % des apparitions, jusqu'à 35 % de la hauteur | 70 % des PV | 94 % (vise 300 px) | 176 ms / ×0.46 | ×0.56 en 28 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 11 | 48 % des apparitions, jusqu'à 38 % de la hauteur | 70 % des PV | 95 % (vise 310 px) | 160 ms / ×0.40 | ×0.54 en 26 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 12 | 50 % des apparitions, jusqu'à 42 % de la hauteur | 70 % des PV | 96 % (vise 320 px) | 144 ms / ×0.34 | ×0.52 en 24 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 13 | 50 % des apparitions, jusqu'à 45 % de la hauteur | 70 % des PV | 97 % (vise 330 px) | 127 ms / ×0.30 | ×0.50 en 22 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 14 | 50 % des apparitions, jusqu'à 49 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.48 en 21 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 15 | 50 % des apparitions, jusqu'à 50 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.46 en 20 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 16 | 50 % des apparitions, jusqu'à 50 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.44 en 19 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 17 | 50 % des apparitions, jusqu'à 50 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.42 en 18 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 18 | 50 % des apparitions, jusqu'à 50 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.42 en 17 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 19 | 50 % des apparitions, jusqu'à 50 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.42 en 16 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |
| 20 | 50 % des apparitions, jusqu'à 50 % de la hauteur | 70 % des PV | 98 % (vise 340 px) | 120 ms / ×0.30 | ×0.42 en 16 s | les ennemis tirent dès qu'ils entrent dans l'écran (niv.1 : seulement une fois arrêtés); les ennemis tirent dès qu'ils apparaissent, par 2 projectiles; boss : le terrain n'est plus nettoyé; boss : phase 2 débloquée; les ennemis tirent par 3; bouclier du Grunt blindé se régénère ×1,6; Éclipse : 5 positions (4 leurres) au lieu de 3; tirs ennemis en éventail de 3; explosions blessent le joueur; événements 20 % plus fréquents |

## 4. Boss

| Niv. | Phase 2 à | Phase 3 à | Seconde forme | Attaques plus denses | Boss qui gonflent par boss vaincu |
|---|---|---|---|---|---|
| 1 | pas de phase 2 | pas de phase 3 | non | ×1.00 | +25 % |
| 2 | pas de phase 2 | pas de phase 3 | non | ×1.00 | +30 % |
| 3 | 50 % des PV | pas de phase 3 | non | ×1.00 | +35 % |
| 4 | 53 % des PV | pas de phase 3 | non | ×1.00 | +40 % |
| 5 | 56 % des PV | pas de phase 3 | non | ×1.00 | +45 % |
| 6 | 59 % des PV | 30 % des PV | non | ×1.40 | +50 % |
| 7 | 62 % des PV | 32 % des PV | non | ×1.46 | +55 % |
| 8 | 65 % des PV | 35 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.52 | +60 % |
| 9 | 68 % des PV | 38 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.58 | +65 % |
| 10 | 71 % des PV | 40 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.64 | +65 % |
| 11 | 74 % des PV | 42 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.70 | +65 % |
| 12 | 77 % des PV | 45 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.76 | +65 % |
| 13 | 80 % des PV | 48 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.82 | +65 % |
| 14 | 83 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.88 | +65 % |
| 15 | 85 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×1.94 | +65 % |
| 16 | 85 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×2.00 | +65 % |
| 17 | 85 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×2.00 | +65 % |
| 18 | 85 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×2.00 | +65 % |
| 19 | 85 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×2.00 | +65 % |
| 20 | 85 % des PV | 50 % des PV | oui (Dreadnought, Faucheuse, Prisme, Kraken, Éclipse) | ×2.00 | +65 % |

## 5. Événements (même à tous les niveaux : vague de météorites à 8:30)

| Niv. | Chance d'un champ de météorites (sinon pluie de cristaux) | Durée d'un champ |
|---|---|---|
| 1 | 25 % | 9.0 s |
| 2 | 28 % | 9.2 s |
| 3 | 32 % | 9.5 s |
| 4 | 35 % | 9.8 s |
| 5 | 39 % | 10.0 s |
| 6 | 43 % | 10.2 s |
| 7 | 46 % | 10.5 s |
| 8 | 50 % | 10.8 s |
| 9 | 53 % | 11.0 s |
| 10 | 57 % | 11.2 s |
| 11 | 61 % | 11.5 s |
| 12 | 64 % | 11.8 s |
| 13 | 68 % | 12.0 s |
| 14 | 71 % | 12.2 s |
| 15 | 75 % | 12.5 s |
| 16 | 75 % | 12.8 s |
| 17 | 75 % | 13.0 s |
| 18 | 75 % | 13.2 s |
| 19 | 75 % | 13.5 s |
| 20 | 75 % | 13.8 s |

## 6. Autres règles qui ne dépendent PAS du niveau (pour mémoire)
- Tous niveaux : vague de météorites de 8:30 à 10:00 ; boss toutes les 45 à 90 s ; après 10 min les PV ennemis doublent environ toutes les 5 min.
- Le vaisseau du joueur démarre au tier = min(4, niveau d'alerte) (dessin).
- Le zoom de départ est 1,35 pour tous les niveaux ; il se rapproche de 1,0 puis descend jusqu'à la valeur « Dézoom final » du tableau 3.
- Pas encore fait : plusieurs boss à la fois (prévu à 10:00).


## 7. Événements aléatoires (table `EVENT_DEFS` dans le code — une entrée = un événement)
Un événement démarre toutes les 55 à 100 s (80 % de ce délai à partir du niveau 8), jamais pendant un boss ni pendant un autre événement. 10 % des tirages = boss surprise ; sinon tirage pondéré parmi les événements disponibles au niveau d'alerte en cours.

| Événement | Dès le niveau | Effet | Durée |
|---|---|---|---|
| Pluie de cristaux | 1 | cristaux d'XP qui tombent | 7 s |
| Tempête de météorites | 1 | rochers qui se divisent en 3 (plus fréquent aux hauts niveaux) | 9 à 14 s |
| Frénésie | 1 | XP ×2, apparitions presque 2× plus rapides | 15 s |
| Marée d'essaims | 2 | paquets d'essaims en continu | 11 s |
| Ciel de Trésorins | 2 | 3 Trésorins à la suite | 5 s |
| Champ de mines | 3 | mines posées dans la moitié haute | 9 s |
| Escadron kamikaze | 3 | 5 kamikazes et plus en ligne | 4 s |
| Forêt d'araignées | 4 | 2 groupes de 4 + des araignées qui se matérialisent seules sur les 4 côtés de l'écran | 6,5 s |
| Écran retourné | 3 | l'écran fait un demi-tour : le joueur est en haut, les ennemis montent du bas (commandes inversées en miroir automatiquement) | 10,5 s |
| Bombardement | 4 | cercles rouges qui se resserrent 1 s puis explosent (blessent si tu es dedans) | 11 s |
| Escorte d'élites | 6 | 3 élites + 1 healer | 4 s |
| Boss surprise | 1 | le boss arrive tout de suite | — |

Événements fixes : vague de météorites 8:30 → 10:00 ; double boss à 10:00 ; montée d'alerte toutes les 2 min ; Trésorin seul toutes les 45 à 80 s.
