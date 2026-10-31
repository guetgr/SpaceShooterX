# Améliorations R&D et atelier — tableau d'équilibrage

> Généré par `node tools/rd_table.js` depuis `src/data/rd.js`. **Valeurs PROVISOIRES** (à régler avec `tools/sim_balance.py`).
> Plafond = 4 × (secteur atteint − secteur de déblocage + 1), secteur 9 au plus ; `max` borne les valeurs entières. Prix du niveau n : linéaire `c0 × (1 + 0,15 (n−1))`, géométrique pour les valeurs entières.

## CANON

| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |
|---|---|---|---|---|---|---|---|---|
| PUISSANCE DE TIR | 1 | Dégâts de chaque tir. | +2 % | +8 % | +72 % (niv. 36) | 8 ◆ | 12 ◆ | 1044 ◆ |
| CADENCE DE TIR | 1 | Le canon tire plus vite. | +3 % | +12 % | +108 % (niv. 36) | 8 ◆ | 12 ◆ | 1044 ◆ |
| DOUBLE TIR | 1 | Chaque niveau ajoute un projectile à chaque tir, en éventail. | 2 projectiles | 5 projectiles | 9 projectiles (niv. 8) | 14 ◆ | 31 ◆ | 335 ◆ |
| VITESSE DES PROJECTILES | 2 | Les projectiles volent plus vite. | +1,5 % | +6 % | +48 % (niv. 32) | 10 ◆ | 15 ◆ | 1069 ◆ |
| PERFORATION | 3 | Chaque tir traverse un ennemi de plus par niveau. | 1 ennemi traversé | 4 ennemis traversés | 10 ennemis traversés (niv. 10) | 16 ◆ | 35 ◆ | 682 ◆ |

## CARCASSE

| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |
|---|---|---|---|---|---|---|---|---|
| COQUE RENFORCEE | 1 | Points de vie maximum. | +2 % (102 PV) | +8 % (108 PV) | +72 % (172 PV) (niv. 36) | 8 ◆ | 12 ◆ | 1044 ◆ |
| PROTECTION ANTICOLLISION | 1 | Dégâts de collision reçus. | -1,5 % | -6 % | -54 % (niv. 36) | 6 ◆ | 9 ◆ | 786 ◆ |
| BLINDAGE | 2 | Réduit tous les dégâts subis (50 % au plus). | -1 % | -4 % | -32 % (niv. 32) | 10 ◆ | 15 ◆ | 1069 ◆ |
| AUTOREPARATION | 2 | La coque se répare toute seule, en continu. | +0,1 % PV/s | +0,4 % PV/s | +3,2 % PV/s (niv. 32) | 10 ◆ | 15 ◆ | 1069 ◆ |
| NANO-REPARATION | 4 | Une part des dégâts infligés revient en PV. | 0,1 % des dégâts | 0,4 % des dégâts | 2,4 % des dégâts (niv. 24) | 14 ◆ | 20 ◆ | 916 ◆ |

## BOUCLIER

| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |
|---|---|---|---|---|---|---|---|---|
| CAPACITE | 1 | Points de bouclier. Sans capacité, les autres réglages sont inutiles. | +4 PV | +16 PV | +144 PV (niv. 36) | 8 ◆ | 12 ◆ | 1044 ◆ |
| REPRISE DE RECHARGE | 2 | Délai avant que la recharge commence, après un coup. | 2,5 s (2,6 s de base) | 2,4 s (2,6 s de base) | 0,9 s (2,6 s de base) (niv. 32) | 8 ◆ | 12 ◆ | 851 ◆ |
| VITESSE DE RECHARGE | 2 | Vitesse à laquelle le bouclier se remplit une fois la recharge commencée. | +3 % | +12 % | +96 % (niv. 32) | 8 ◆ | 12 ◆ | 851 ◆ |
| PUISSANCE DE RIPOSTE | 3 | Quand le bouclier encaisse, il renvoie une onde qui blesse les ennemis proches. | puissance 0,2 | puissance 0,6 | puissance 4,2 (niv. 28) | 12 ◆ | 17 ◆ | 1017 ◆ |
| PORTEE DE RIPOSTE | 3 | Rayon de l'onde de riposte. | +5 px | +20 px | +140 px (niv. 28) | 10 ◆ | 15 ◆ | 852 ◆ |
| RESERVE DE SECOURS | 4 | Une fois par mission, quand les PV passent sous 30 %, la réserve se libère en bouclier. | +4 PV de bouclier | +16 PV de bouclier | +96 PV de bouclier (niv. 24) | 14 ◆ | 20 ◆ | 916 ◆ |

## PROPULSEURS

| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |
|---|---|---|---|---|---|---|---|---|
| REACTIVITE | 1 | La camionnette suit le doigt plus vite. | +1,5 % | +6 % | +54 % (niv. 36) | 6 ◆ | 9 ◆ | 786 ◆ |
| CHARGES D'ESQUIVE | 2 | Chaque charge offre une protection (double-tap) : invulnérable, sans déplacement. | 1 charge | 4 charges | 6 charges (niv. 6) | 12 ◆ | 30 ◆ | 174 ◆ |
| DUREE DE PROTECTION | 2 | Temps d'invulnérabilité d'une esquive. | 0,4 s (0,4 s de base) | 0,5 s (0,4 s de base) | 1 s (0,4 s de base) (niv. 32) | 8 ◆ | 12 ◆ | 851 ◆ |
| RECUPERATION DES CHARGES | 3 | Une charge dépensée revient au bout d'un délai (aucune sinon). | 1 charge / 29,4 s | 1 charge / 27,6 s | 1 charge / 13,2 s (niv. 28) | 10 ◆ | 15 ◆ | 852 ◆ |
| PROPULSION D'URGENCE | 4 | Pendant une esquive, la camionnette est bien plus vive. | vivacité +10 % | vivacité +40 % | vivacité +240 % (niv. 24) | 14 ◆ | 20 ◆ | 916 ◆ |

## ATELIER · AIMANT

| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |
|---|---|---|---|---|---|---|---|---|
| PORTEE DE L'AIMANT | 1 | Distance d'attraction des cristaux et des composants. | +3 px (60 de base) | +12 px (60 de base) | +108 px (60 de base) (niv. 36) | 5 ◆ | 7 ◆ | 657 ◆ |
| COLLECTE AUTOMATIQUE | 6 | Aspire tout ce qui est à l'écran à intervalles réguliers. Chaque niveau raccourcit l'intervalle de 5 %. | toutes les 19 s | toutes les 16,3 s | toutes les 8,8 s (niv. 16) | 25 ◆ | 36 ◆ | 852 ◆ |

## ATELIER · ORDINATEUR DE BORD

| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |
|---|---|---|---|---|---|---|---|---|
| CHOIX D'ATOUTS | 2 | Un atout de plus proposé à chaque montée de niveau (5 au plus, 2 de base). | 3 atouts proposés | 5 atouts proposés | 5 atouts proposés (niv. 3) | 20 ◆ | 65 ◆ | 121 ◆ |
| RELANCES | 4 | Une relance de plus par mission. | 1 relance | 4 relances | 8 relances (niv. 8) | 20 ◆ | 44 ◆ | 477 ◆ |
| ATOUT DOUBLE | 7 | Chance qu'un atout choisi compte double (50 % au plus). | 1,5 % | 6 % | 18 % (niv. 12) | 30 ◆ | 44 ◆ | 658 ◆ |
| VISION EN NEBULEUSE | 8 | Allonge le cône de vision dans la nébuleuse. | +21 px | +84 px | +168 px (niv. 8) | 30 ◆ | 44 ◆ | 367 ◆ |

**Coût cumulé de toutes les améliorations au plafond du secteur 9 : 21300 ◆.**

## Économie

- Gain par partie estimé (à vérifier) : prime AGP 10 à 30 ◆ + composants ramassés (petit ennemi 15 % × 1 ◆, lourd 3 ◆, boss de fin d'ordre 12 gros × 5 ◆) ≈ 50 à 150 ◆.
- Les niveaux 1 des améliorations du secteur 1 coûtent 5 à 8 ◆ : une partie perdue paie déjà plusieurs achats.
- Les valeurs entières (perforation, charges d'esquive, choix d'atouts, relances) montent plus vite en prix et s'arrêtent à leur `max` : pas d'achat sans effet.
