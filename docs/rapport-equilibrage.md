# Space Shooter X — rapport d'équilibrage (bot de test)

## Comment j'ai testé
- J'ai fait jouer le jeu par un **bot** (il esquive, vise, choisit les cartes, déclenche l'overdrive), en **avance rapide** et sans affichage : ~12 à 16 fois plus vite que le temps réel. Plus de **1 500 parties** au total.
- Un premier essai était **faussé** : les succès débloqués s'accumulaient d'une partie à l'autre (la même partie de référence devenait 40 % plus forte) et le moteur de sons décalait le hasard. J'ai corrigé les deux, et jeté ces résultats.
- Mesurer des parties entières est trop **bruité** pour juger une compétence (±15 % d'une partie à l'autre). J'ai donc ajouté un **banc d'essai déterministe** : le vaisseau reste immobile et invulnérable, face à des cibles fixes. Il est parfaitement reproductible (deux mesures identiques à la décimale) et mesure : dégâts/s sur une cible, dégâts/s sur un groupe de 9, éliminations dans une « ferme » d'ennemis, et toutes les statistiques modifiées.
- Chaque compétence est mesurée **ajoutée à sa chaîne de parents** (par exemple « Verrou. multiple » avec lance-missiles + stabilisateurs + missiles chercheurs), pour mesurer sa vraie valeur ajoutée.

**Limites** : le bot n'est pas un humain. Il juge bien les dégâts et les statistiques, mal les compétences de confort (aimant, XP, soins) et les effets qui se déclenchent à la mort (Phénix, Immortel, Sangsue), que je n'ai pas pu mesurer. Les résultats sur les reliques, fusions et cartes viennent de parties entières : seuls les écarts très marqués sont fiables.

## 1. Le bug le plus important : les balles perforantes touchent plusieurs fois le même ennemi
Le jeu ne retient pas quels ennemis une balle perforante a déjà touchés. Tant qu'elle chevauche un ennemi, elle le re-touche **à chaque image**.
- **PERFORANT** : dégâts sur une cible unique ×2,00 (×4 avec la perforation de la fusion). Le « +1 perforation » est en réalité un multiplicateur de dégâts sur les gros ennemis et les boss.
- **PORTÉE LASER** : fait **baisser** les dégâts du laser (×0,67). Une balle plus rapide chevauche moins longtemps.
- **VÉLOCITÉ** : même effet inverse sur toutes les balles perforantes.
- Le **laser** (108 dégâts/s contre 28 pour le tir normal) doit une grande part de sa puissance à ce défaut.

**Je n'y ai pas touché** : le corriger réduirait nettement les dégâts sur les boss de toutes les builds perforantes (que tu as réglés à la main). Si tu veux : une balle ne touche chaque ennemi qu'une fois, et je remonte les dégâts du laser pour garder son efficacité actuelle.

## 2. Compétences sans aucun effet, corrigées
| Compétence | Problème | Correction |
|---|---|---|
| STABILISATEURS | « Réduit la dispersion des missiles » : les missiles n'ont aucune dispersion | +10 % de dégâts de missile / niveau |
| VERROU. MULTIPLE | « Vise mieux plusieurs cibles » : aucun code | Les missiles chercheurs se répartissent sur 1 + niveau cibles (4 missiles → 4 cibles différentes au lieu d'une seule) |
| RÉSILIENCE | « (à venir) », pas d'effet négatif à réduire dans le jeu | +50 ms d'invincibilité après un coup / niveau (350 ms de base) |

Remarque : **MISSILES CHERCHEURS** ne change rien en soi (les missiles sont chercheurs par défaut). Il ne sert que de porte d'entrée vers sa branche. **MISSILES DROITS**, lui, baisse les éliminations (22 → 8) et n'est rentable qu'avec le MISSILE NUCLÉAIRE au bout.

## 3. Les armes (sans compétence d'arbre)
| Arme | Dégâts/s (1 cible) | Dégâts/s (groupe) | Éliminations (ferme) |
|---|---|---|---|
| Tir normal | 28 | 28 | 8 |
| Laser continu | 108 | 356 | 7 |
| **Laser auto-cibleur** | 108 | 356 | **51** |
| Shotgun | 13 | 13 | 20 |
| Missiles | 39 | 39 | 10 |

Le **laser auto-cibleur écrase tout** (6 fois plus d'éliminations). Le laser continu, qui coûte pareil (30), est bien moins utile en pratique (il vise tout droit). À surveiller si tu veux que les choix d'arme restent intéressants.

## 4. Compétences les plus rentables / les moins rentables (coût en fragments pour 3 niveaux)
**Très rentables** : TROU NOIR (éliminations ×5, coût 96), PERFORANTS missiles (×4,8, coût 60), MISSILE NUCLÉAIRE (×4, coût 38), PLUS DE PLOMBS shotgun (groupe ×2,9, coût 54), TIR MULTIPLE (×2,3, coût 54), CHARGE missiles (×2,2, coût 48), PUISSANCE (×1,30, coût 33), CÉLÉRITÉ (×1,24, coût 33).
**Peu rentables** : CRITIQUE (+3 à 8 %, coût 48), DÉGÂTS DRONE (+8 %, coût 48), CADENCE DRONE (+7 %, coût 48), VITESSE MISSILE (+2 %, coût 48), CADENCE MISSILES (+6 %, coût 48), RECHARGE RAPIDE (+9 %, coût 48), VÉLOCITÉ (aucun gain de dégâts, coût 42).
**Doublons** : BLINDAGE+ (+60 PV pour 36) est meilleur que VITALITÉ (+45 PV pour 33) ; BOUCLIER (+90 pour 48) est meilleur que BOUCLIER+ (+60 pour 54).
**Branche Furie** (overdrive) : OVERDRIVE 66 + FRÔLEMENT 57 + SURCHAUFFE 78 + SECOND SOUFFLE 90 = 291 fragments pour des bonus ponctuels : sans doute chère comparée aux dégâts permanents de l'arme (PUISSANCE donne +30 % en permanence pour 33).

## 5. Reliques, fusions, cartes (parties entières, 6 graines)
- Reliques : **TÊTES MULTIPLES** domine (puissance +60 %, survie +29 s). FAUX SPECTRALE (+37 %) suit. La plupart des autres ne se distinguent pas du bruit.
- Fusions : **PLOMB, ORAGE, OBUS PERCEUR** (+33 à +39 % de puissance) ; NITRO (+10 %) et VORTEX (+12 %) sont nettement plus faibles.
- Cartes de niveau : les cartes d'arme (missiles, lasers, perforation) dominent ; VITESSE, AIMANT, PV n'apportent pas de puissance (normal).
- **Stratégie de cartes** (8 parties chacune) : tout défensif survit le plus longtemps (78 s) mais score moins ; tout offensif marque plus (1 899 contre 1 469) mais meurt plus tôt (49 s). Équilibré : 62 s. Aucune ne domine : bon signe.

## À décider
1. Corriger le **bug de touches multiples** (impact fort sur les boss) ? (voir section 1)
2. Rendre les **armes plus équilibrées** (laser auto-cibleur très au-dessus des autres) ?
3. **Revaloriser les compétences peu rentables** (CRITIQUE, drones, cadences de missiles) ou baisser leur coût ?
