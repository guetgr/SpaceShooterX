# Space Shooter X — déroulé d'UNE partie complète (alerte 1 → alerte 26 = boss final)

Simulation de la logique du jeu (400 parties par scénario). Les heures sont des **médianes** (m:ss). Ce n'est pas du vrai combat : les durées de combat de boss sont des hypothèses.

## 1. La surprise : la partie est beaucoup plus longue que 50 minutes

25 niveaux × 2 min = 50 min **de temps hors boss**, car le chrono d'alerte est **gelé pendant les combats de boss**. Et un boss arrive toutes les 50 à 90 s hors boss : environ **38 boss** dans la partie.

| Scénario (durée d'un combat de boss) | Durée totale jusqu'au boss final | Boss rencontrés |
|---|---|---|
| A — joueur fort (40 s, 55 s dès l'alerte 8) | **82 min** | ~38 |
| B — moyen (70 s, 95 s dès l'alerte 8) | **106 min** | ~38 |
| C — combats longs (100 s, 130 s dès l'alerte 8) | **127 min** | ~38 |
| **Variante « sans gel »** (le chrono continue pendant les boss), scénario A | **50 min** | ~24 |
| Variante « sans gel », scénario B | **50 min** | ~19 |

## 2. À quelle minute on passe à chaque niveau d'alerte (règle actuelle : chrono gelé pendant les boss)

| Alerte | A (fort) | B (moyen) | C (long) | Sans gel (A) | Boss déjà vus (B) | Événements déjà vus (B) |
|---|---|---|---|---|---|---|
| 1 | 0:00 | 0:00 | 0:00 | 0:00 | 0 | 0 |
| 2 | 3:20 | 4:20 | 5:20 | 1:60 | 2 | 1 |
| 3 | 6:39 | 8:39 | 12:49 | 3:60 | 4 | 4 |
| 4 | 9:60 | 14:30 | 18:10 | 5:59 | 7 | 5 |
| 5 | 13:32 | 17:41 | 21:49 | 7:59 | 8 | 7 |
| 6 | 16:11 | 20:50 | 25:30 | 9:60 | 9 | 9 |
| 7 | 19:31 | 25:11 | 30:49 | 11:60 | 11 | 10 |
| 8 | 22:11 | 28:20 | 34:30 | 13:60 | 12 | 12 |
| 9 | 25:46 | 33:06 | 40:20 | 15:60 | 14 | 14 |
| 10 | 28:56 | 37:06 | 44:60 | 17:60 | 15 | 16 |
| 11 | 31:52 | 41:51 | 50:50 | 19:60 | 17 | 18 |
| 12 | 35:42 | 45:51 | 55:30 | 21:60 | 18 | 20 |
| 13 | 38:37 | 49:48 | 61:05 | 23:60 | 19 | 22 |
| 14 | 42:12 | 54:36 | 65:59 | 25:60 | 21 | 24 |
| 15 | 45:22 | 58:10 | 70:09 | 27:60 | 22 | 26 |
| 16 | 48:57 | 62:55 | 75:59 | 29:60 | 24 | 28 |
| 17 | 52:07 | 66:55 | 80:39 | 31:60 | 25 | 30 |
| 18 | 55:01 | 71:40 | 86:29 | 33:60 | 27 | 32 |
| 19 | 58:52 | 75:40 | 91:09 | 35:60 | 28 | 34 |
| 20 | 61:46 | 80:01 | 96:59 | 37:60 | 30 | 36 |
| 21 | 65:22 | 84:25 | 101:39 | 39:60 | 31 | 38 |
| 22 | 68:32 | 88:01 | 106:59 | 41:60 | 32 | 40 |
| 23 | 72:07 | 92:46 | 112:09 | 43:60 | 34 | 42 |
| 24 | 75:17 | 96:46 | 116:20 | 45:60 | 35 | 44 |
| 25 | 78:37 | 101:31 | 122:09 | 47:60 | 37 | 46 |
| **26 = BOSS FINAL** | 82:02 | 105:31 | 126:50 | 49:60 | 38 | 48 |

(Événements = aléatoires + vague de 8:30 + boss surprise. Les Trésorins en plus : environ 48 par partie.)

## 3. Événements fixes (indépendants du niveau)
- **Premier boss : 0:35.** Puis un boss 50 s (après le 1er) à 90 s (après le 9e) après la mort du précédent.
- **8:30 → 10:00 : vague de météorites** (si aucun boss en cours).
- **10:00 : premier DOUBLE BOSS** (2 boss différents). En moyenne, 4 à 6 boss simples ont déjà eu lieu avant.
- **Alerte 26 : boss final** (à ajouter ; aujourd'hui le plafond du jeu est le niveau 20).

## 4. Événements aléatoires : combien dans une partie complète (moyenne)

Un événement tombe toutes les 55 à 100 s (×0,8 dès l'alerte 8), jamais pendant un boss ni un autre événement.

| Événement | Fois par partie (B) | Disponible dès l'alerte |
|---|---|---|
| meteors | 15.7 | 1 |
| boss_surprise | 4.7 | 1 |
| crystal | 4.1 | 1 |
| bombard | 3.9 | 4 |
| swarm | 2.8 | 2 |
| magnet | 2.4 | 1 |
| frenzy | 2.4 | 1 |
| mines | 2.3 | 3 |
| kamikaze | 2.2 | 3 |
| spiders | 1.8 | 4 |
| goldrush | 1.7 | 2 |
| flip | 1.6 | 3 |
| elite | 1.4 | 6 |
| vague_meteorites_8h30 | 1.0 | fixe |

## 5. Par tranche de 5 niveaux (scénario B)

| Alertes | Durée de la tranche | Boss | Événements |
|---|---|---|---|
| 1-5 | ~21 min | ~9 | ~9 |
| 6-10 | ~20 min | ~7 | ~9 |
| 11-15 | ~21 min | ~7 | ~10 |
| 16-20 | ~21 min | ~7 | ~10 |
| 21-25 | ~21 min | ~7 | ~10 |

## 6. Ce que ça veut dire pour la musique

- **Musique de fond** : une tranche de 5 niveaux dure **16 à 25 min** : si on ne fait qu'un morceau par tranche, il tourne 20 fois. Prévoir **2 morceaux par tranche** qui alternent, ou des boucles longues.
- **5 tranches** (1-5, 6-10, 11-15, 16-20, 21-25) = 5 à 10 morceaux de fond, plus le menu.
- **Boss** : ~38 combats. Les 3 morceaux de phases (p1, p2, p3) seront entendus des dizaines de fois : l'idéal est **2 jeux de 3 morceaux** (boss de début / boss de fin de partie) + 1 morceau **double boss** + 3 morceaux **boss final**.
- **Changements de musique** : ~38 entrées + ~38 sorties de boss, ~35 événements → plus de **100 transitions** par partie. Pour ne pas fatiguer : seuls les événements marquants changent de morceau (météorites, écran retourné, frénésie, bombardement) ; les autres (cristaux, magnétique, Trésorins, essaims...) peuvent rester sur le morceau de fond avec un petit effet.
