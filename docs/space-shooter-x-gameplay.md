# SPACE SHOOTER X — Boucle de gameplay détaillée

Document de référence tiré directement du code (`index.html`, build jeu v144). Toutes les valeurs ci-dessous sont celles du code au moment de l'écriture. Les formules sont données telles quelles pour que tu puisses équilibrer à la main.

---

## 1. Vue d'ensemble : la boucle en une page

1. **Menu / méta-progression** : tu dépenses des **fragments ◆** dans l'**arbre de compétences permanent** (336 points au total). Chaque point investi renforce le vaisseau de départ ET fait monter ton **niveau d'alerte de départ**.
2. **Run** : tu pilotes au doigt un vaisseau qui tire tout seul. Les ennemis arrivent en vagues, tu ramasses des **cristaux** (XP), tu montes de niveau et tu choisis une **carte** (amélioration de la run).
3. **Boss** : toutes les ~45 à 90 s un boss arrive. Le vaincre donne une **relique de boss** (choix 1 parmi plusieurs), augmente la difficulté d'un palier et déclenche des **événements** avant le boss suivant.
4. **Escalade** : le niveau d'alerte monte tout seul pendant la partie (+1 toutes les 120 s, gelé pendant un combat de boss). Plus il monte, plus les ennemis sont nombreux, vicieux, blindés et rapides.
5. **Mort** : tu gagnes des **fragments** selon ton score, qui financent l'arbre. Tu recommences plus fort et à un niveau d'alerte plus haut.
6. **Ascension** : arbre plein (≥ 291 points investis) → tu peux t'élever : +1 niveau d'alerte permanent (jusqu'à 20) et bonus permanents.

La difficulté suit donc **trois horloges** :
- **Niveau d'alerte** (arbre + temps de run + ascensions), cap 20.
- **Palier de difficulté** (`difficultyTier`) : +1 toutes les 20 s (`floor(elapsed/20)`) **et** +1 par boss vaincu.
- **Temps de partie** (bonus de dégâts ennemis jusqu'à 10 min, puis croissance exponentielle des PV).

---

## 2. Le vaisseau du joueur

### 2.1 Stats de départ (avant arbre)

| Stat | Valeur de base |
|---|---|
| PV max | 100 |
| Bouclier max | 0 |
| Dégâts par tir | 10 |
| Cadence | 1 tir toutes les 340 ms |
| Vitesse des tirs | 520 |
| Projectiles par salve | 1 |
| Réactivité du vaisseau | 11 |
| Rayon d'aimant (cristaux) | 60 |
| Perforation | 0 |
| Critique | 0 % (un critique fait ×2) |
| Choix de cartes par niveau | 2 (max 5) |
| Relances de cartes | 0 |
| Overdrive | verrouillé (durée 6000 ms, dégâts ×2 une fois débloqué) |
| Armure / vol de vie / régénération | 0 |

Sur ces valeurs s'ajoutent, dans l'ordre : les nœuds de l'arbre, les buffs de succès (permanents), l'ascension (+10 % dégâts, +10 % PV, +10 % XP, +10 % fragments **par ascension**), puis les pactes éventuels.

### 2.2 Évolution du vaisseau (apparence et tir secondaire)

- **Palier de vaisseau 1 à 4** : `max(palier lié aux améliorations d'arme, niveau d'alerte)` plafonné à 4. Améliorations d'arme : 3 → palier 2, 6 → palier 3, 10 → palier 4.
- **Palier d'arme des ennemis** (`weaponTier`) : alerte 1-2 → 1, alerte 3-4 → 2 (« tir secondaire »), alerte 5+ → 3 (« 3e tir »). Il règle le nombre de tirs que les ennemis envoient.

### 2.3 Armes du joueur

| Mode | Fonctionnement | Dégâts |
|---|---|---|
| **Balles** (par défaut) | Éventail de `spreadCount` projectiles (écart max 14° entre tirs, jamais plus de 150° au total) | `dégâts` |
| **Laser continu** (légendaire) | Perforation infinie, vitesse ×1,4 | `dégâts × 1,3 × (1 + bonus laser)` ; ×2 après 2 s de tir continu avec LASER DESTRUCTEUR |
| **Laser auto-cibleur** (légendaire) | Tire vers les cibles verrouillées (1, ou 3 avec RETICULE OMNISCIENT) | idem laser |
| **Shotgun** (légendaire) | Cône de plombs (min 3, écart 10°), vitesse ×0,9, cadence ralentie ×(1,6 − recul maîtrisé), plancher ×1 | `dégâts × 0,7` par plomb |
| **Missiles** | Salves de missiles chercheurs ou droits (selon l'arbre) | voir arbre MISSILE |
| **Drone(s) satellite** | Orbite et tire toutes les 900 ms × `droneFireRateMul` | `dégâts × 0,5 × droneDamageMul` |
| **Foudre** | Arc vers N ennemis par tir qui touche | 30 % des dégâts |
| **Éclats** | À chaque kill, jusqu'à 8 éclats | 35 % des dégâts |
| **Tonnerre** | Toutes les 8 s sur l'ennemi le plus solide | ×6 |

**Perforation et boucliers ennemis** : un tir perforant traverse les ennemis, mais **s'arrête sur un bouclier ennemi encore debout**, sauf si tu as TRANSPERCE-BOUCLIER (arbre, branche ARME).

### 2.4 Survie du joueur

- **Ordre d'absorption d'un coup** : invincibilité (overdrive / esquive / cooldown) → **bouclier** → **PV**.
- **Dégâts reçus** = `dégât de base × enemyDmgMul()` ; sur les PV : `× (1 − armorPct)`.
- **Invincibilité après un coup** : 350 ms (+50 ms par niveau de RESILIENCE) ; 550 ms quand le bouclier casse.
- **Bouclier** : se régénère après 2,6 s sans coup (× `shieldRegenDelayMul`, réduit par RECHARGE BOUCLIER), remplissage complet en ~2,5 s. Doublé pendant l'overdrive.
- **Régénération PV** : `PV max × hpRegenPct` par seconde (arbre REGENERATION 0,5 %/niv., REGEN BLINDEE, reliques NANITES / REGENERATION).
- **Dernier souffle** : une fois par run, quand il reste ≤ 12 % de PV et plus de bouclier : ralenti, +12 % PV, 1,4 s d'invincibilité, +60 de jauge d'overdrive.
- **Phénix** : revient à 50 % de PV (1 charge, 2 avec IMMORTEL ; relique BRAISE donne +1).
- **Esquive** (double tap) : dash avec immunité de `400 ms + 300 ms × SECOND SOUFFLE`. Nombre de charges fixé au début de la run.
- **Collisions** : les dégâts de contact sont multipliés par 3 (`COLLISION_DMG_MUL`) puis réduits par `collisionMul` (BLINDAGE+, FORTERESSE, RESISTANCE+, AURA DE FER).
- **Explosions** : à partir de l'alerte 8, les explosions d'ennemis blessent aussi le joueur. Les boss n'encaissent que 25 % des dégâts d'explosion.

### 2.5 Niveaux de run et cartes

- Premier niveau à **8 XP** ; ensuite `xpToNext = round(xpToNext × 1,32 × xpToNextMul + 4)`.
- Chaque montée de niveau donne un bonus gratuit : **+1,2 % dégâts, −0,6 % délai de tir, +2 PV max**.
- À chaque niveau : choix parmi **2 à 5 cartes** (selon INTUITION). Relances possibles (arbre RELANCE, boss, relique COURONNE DE REINE). ECLAIR DE GENIE : une carte peut compter double.
- **XP d'un cristal** = `valeur × (1 + xpBonus) × (1 + 0,12 × (alerte − 1)) × xpMul()`. `xpMul()` = multiplicateur de **rang de style** × 2 pendant FRENESIE × 1,5 en nébuleuse.

**Pool de cartes (toutes illimitées, `max: Infinity`)** :

| Carte | Effet par prise |
|---|---|
| CADENCE+ | cadence ×1,18 (délai × 0,85) |
| DEGATS+ | dégâts × 1,20 |
| TIR MULTIPLE | +1 projectile |
| REACTEURS | +2,6 de réactivité |
| AIMANT | +30 de portée |
| BLINDAGE+ | +20 PV max |
| BOUCLIER | +30 de bouclier max |
| PERFORANT | +1 perforation |
| VELOCITE | vitesse des tirs × 1,18 |
| LANCE-MISSILES | +1 missile (si débloqué dans l'arbre, dès le niveau 5) |

**Armes légendaires** (LASER, LASER AUTO, SHOTGUN) : **jamais** dans les cartes normales. Proposées uniquement dans la **récompense d'un boss**, si le nœud d'arbre correspondant est débloqué et si tu n'en as pas déjà une.

### 2.6 Fusions (récompense de boss uniquement)

Deux cartes montées assez haut (ou deux compétences d'arbre) débloquent une fusion unique :

| Fusion | Condition | Effet |
|---|---|---|
| OBUS PERCEUR | PERFORANT ×2 + DEGATS+ ×3 | +2 perforation, +25 % dégâts |
| TEMPETE DE PLOMB | CADENCE+ ×3 + TIR MULTIPLE ×2 | +1 projectile, cadence +25 % |
| FORTERESSE | BLINDAGE+ ×3 + BOUCLIER ×2 | +40 PV max, +40 bouclier |
| NITRO | REACTEURS ×3 + VELOCITE ×2 | réactivité +4 (max 24), tirs ×1,25 |
| ORAGE | FOUDRE + REBOND (arbre) | +2 arcs de foudre, +1 rebond |
| VORTEX | PULSAR + TROU NOIR (arbre) | pulsar plus fréquent, trou noir plus long |

### 2.7 Reliques de boss (1 par boss vaincu, parmi les 3 du boss tombé)

Une relique est unique par run. À chaque boss on propose : ses reliques non possédées + jusqu'à 2 fusions éligibles + 1 arme légendaire éligible.

| Boss | Relique 1 | Relique 2 | Relique 3 |
|---|---|---|---|
| Dreadnought | BLINDAGE LOURD : +30 % PV max | CANON LOURD : +35 % dégâts | BRAISE : +1 résurrection (50 % PV) |
| Faucheuse | FAUX SPECTRALE : +2 perforation | FRENESIE : +30 % cadence | LAME DU VENT : +2 charges d'esquive |
| Ruche | NANITES : +0,8 % PV/s | MIEL : +40 % XP | COURONNE DE REINE : +2 relances, +1 carte/niveau |
| Prisme | REFRACTEUR : +1 projectile | CRISTAL ACERE : +20 % critique | LENTILLE : tirs +30 % vitesse, +15 % dégâts |
| Kraken | ENCRE : champ qui ralentit les tirs ennemis | VENTOUSES : +140 aimant | TENTACULE : +0,4 % vol de vie |
| Éclipse | VOILE : +40 bouclier | PHASE : −10 % dégâts subis | ECLIPSE TOTALE : +20 % dégâts, +15 % cadence |
| Hydre | REGENERATION : +40 % PV et +0,5 %/s | TETES MULTIPLES : +1 projectile, +1 perforation | VENIN : +1 arc de foudre |

### 2.8 Overdrive

- **Débloqué** par l'arbre (branche FURIE). Se charge : en **frôlant** les tirs ennemis (+1,6 par tir frôlé, max 5 à la fois, × `odGraze`), en **tuant** (+0,35 par kill, plafonné à 14 kills de charge), en ramassant des **cellules d'énergie**, au boss vaincu (SECOND SOUFFLE), au dernier souffle (+60). Bloqué pendant une impulsion EMP.
- **Usure** : chaque utilisation dans la run multiplie la charge gagnée par `0,68^utilisations` (le commentaire du code annonce un plancher ×0,15, mais il n'est pas appliqué : pas de plancher réel).
- **Activation** (bouton OD ou espace) : **invincible** (bouclier jaune qui absorbe tout), cadence +60 %, dégâts `× (1 + (odDmgMul − 1) × odPower)`, bouclier normal régénéré ×2. Durée `odDur` (6 s de base dans les stats ; la description de l'arbre dit 5 s : à harmoniser).
- **Érosion** : `odPower = (0,4 + 0,6 × temps restant/durée) × 0,92^(utilisations − 1)`. Le bonus fond jusqu'à 40 % à la fin et chaque activation démarre 8 % plus faible.
- **Cellules d'énergie** : pendant l'overdrive elles prolongent la durée (`valeur × 160 ms × 0,68^(utilisations−1)`), sinon elles chargent la jauge, et **sans overdrive débloqué** elles donnent un peu d'XP.

### 2.9 Combo et rang de style

Le combo compte les kills consécutifs. Fenêtre pour enchaîner : `2000 + 150 × rang` ms. Un coup reçu casse le combo (moitié des points seulement).

| Rang | Kills de combo | Nom | Multiplicateur d'XP |
|---|---|---|---|
| D | 0 | DISMAL | ×1 |
| C | 8 | CRAZY | ×1,5 |
| B | 20 | BADASS | ×2 |
| A | 45 | APOCALYPTIC | ×3 |
| S | 90 | SAVAGE | ×4 |
| SS | 180 | SICK SKILLS | ×6 |
| SSS | 360 | SMOKIN' STYLE | ×10 |

Chaque kill rapporte `valeur × (1 + 0,5 × rang)` points de combo, ajoutés au score quand le combo se termine. Un boss compte pour **25 kills** et prolonge le combo.

---

## 3. Le bestiaire (ennemis normaux)

### 3.1 Règles générales

- **PV réels** = PV de base × `hpScaleNow()` avec  
  `hpScale = (1 + 0,2 × palier) × 1,035^max(0, palier − 30) × (1 + 0,15 × max(0, alerte − 4))`.
- **Vitesse** = base × `(1 + 0,08 × palier)`.
- **Dégâts ennemis** = base × `enemyDmgMul = (1 + 0,10 × (alerte − 1)) × (1 + 0,40 × min(1, temps/600 s)) × 1,03^((temps − 600)/60)` (le dernier terme n'agit qu'après 10 min).
- **Cadence de tir ennemie** : délai × `1 − 0,09 × (alerte − 1)`. Au-delà d'un facteur 0,25 (alerte ~10), la cadence continue de monter **sans plancher** : `0,25 × 0,93^(alerte − 10,1)`. Plancher absolu 60 ms. Si plus de 500 tirs sont à l'écran, les ennemis ralentissent leur cadence pour la fluidité.
- **Vitesse des tirs ennemis** : +3,5 % par niveau d'alerte au-dessus de 6.
- **Cadence de spawn** : `(1300 − 4 × secondes − 30 × palier) × max(0,3 ; 1 − 0,06 × (alerte − 1))`, borné entre `max(120 ; 320 × (1 − 0,05 × (alerte − 1)))` et 1300 ms (×0,55 pendant FRENESIE).
- **Renforts** : `min(4, floor((alerte − 2)/2))` tentatives d'ennemis supplémentaires par vague (60 % de chance chacune), +2 avec le pacte LA FOULE, et à partir de l'alerte 5, si moins de 80 ennemis sont vivants, jusqu'à +8 selon le vide de l'écran.
- **Aucun plafond artificiel** d'ennemis ou de tirs (les constantes sont à 100 000 / 1 000 000).
- **Entrées par les côtés** (alerte 4+) : GRUNT, SHOOTER, CHARO, TANK, ELITE, TURRET, SNIPER ont `min(50 %, 6 % × (alerte − 3))` de chance d'entrer par un côté.
- **Premier tir immédiat** : dès l'alerte 2, les ennemis tireurs tirent presque tout de suite (sauf SNIPER, tir télégraphié).
- **Pool qui s'agrandit avec le temps** : temps effectif `t = secondes + 12 × (alerte − 1)`. Un niveau d'alerte élevé fait donc arriver les types vicieux plus tôt.

### 3.2 Boucliers ennemis

| Alerte | Bouclier |
|---|---|
| 1-4 | aucun |
| 5-7 | petit bouclier teinté bleu : `PV × min(0,7 ; 0,12 × (alerte − 4))`, pas de régénération visible |
| 8+ | **vrai bouclier visible** (aura fine autour du sprite) : `PV × (0,3 + 0,12 × (alerte − 8)) × (1 + 0,04 × (niveau joueur − 1))`. Se régénère après un délai. Casse avec animation puis **2 s d'invincibilité clignotante** (sauf boss). |
| 10+ | les **boss** ont aussi un bouclier (barre dédiée) |

Sans bouclier : KAMIKAZE, SWARMER, MINE, TRESORIN, METEORITE, GRUNT BLINDE (a le sien), SPLITTER MINI, BOSS (alerte < 10), MOTHERSHIP (alerte 5-7).

### 3.3 Fiche des ennemis

PV et vitesse sont les valeurs de base avant `hpScale` / `speedScale`. « Score » = points de score ; « Contact » = dégât de base au contact (×3 de collision).

| Ennemi | Apparaît à `t` > | Poids | PV | Vitesse | Score | Contact | Comportement |
|---|---|---|---|---|---|---|---|
| **GRUNT** | 0 | 38 | 12 | 55-85 | 8 | 8 | Descend droit. Chair à canon. |
| **DIVER** | 8 | 16 | 8 | 130 | 10 | 10 | Plonge vers le joueur, corrige sa trajectoire en continu (virage limité). |
| **SHOOTER** | 12 | 22 | 20 | 46 | 16 | 10 | S'arrête à `stopY` (140-260), tire un éventail dont la taille grandit avec le palier d'arme, esquive les tirs du joueur. |
| **TURRET** | 20 | 12 | 25 | 20 | 20 | 4 | Se gare haut (100-180), tire en rafales de 3/5/7 tirs (140 ms entre tirs). |
| **KAMIKAZE** | 22 | 14 | 14 | 55 | 14 | 1 | Dérive, clignote rouge (télégraphe), fonce sur la position du joueur (vitesse `min(430 ; 250 + 22 × (alerte − 1))`), explose. À l'alerte 6+ sème des mini-bombes sur son passage. Vient par 2 (alerte 4+) ou 3 (alerte 7+). |
| **DRONE** | 28 | 16 | 9 | 34 | 12 | 8 | Ondule latéralement (±46). Tire à partir du palier d'arme 2. |
| **SPIDER** (araignée) | 30 | 11 | 18 | 44 | 18 | 9 | Arrive en groupe serré (2/3/4 selon l'alerte), se gare, tisse des toiles entre elles, tire. |
| **SPLITTER** | 35 | 14 | 18 | 50 | 14 | 8 | À sa mort se divise en 2 SPLITTER MINI. |
| **SPLITTER MINI** | — | — | 6 | 70 | 4 | 5 | Issu d'un splitter. |
| **GRUNT BLINDE** | 45 | 12 | 10 + 15 de bouclier | 60 | 18 | 9 | Bouclier propre qui se régénère après un délai (plus fort à l'alerte 5+). |
| **MINE** (poseur) | 50 | 10 | 20 | 18 | 10 | 22 | Pose des mines (toutes les 2,2-3,2 s), plusieurs d'un coup avec les paliers d'arme. |
| **TANK** | 55 | 12 | 60 | 24 | 30 | 16 | Se gare (180-320), tir lourd + éventail léger si palier ≥ 2. |
| **BOMBER** | 65 | 12 | 16 | 40 | 20 | 8 | Ondule, largue des bombes (1/2/3 d'affilée selon le palier). |
| **SNIPER** | 75 | 10 | 14 | 30 | 22 | 6 | Se gare, devient blanc 0,7 s avant un tir précis télégraphié. |
| **SWARMER** | 80 | 18 | 5 | 110-140 | 6 | 6 | Arrive en paquet de 2 à 7 (grandit avec le temps), oscille fort (±70). Ne laisse un cristal que 22 % du temps. |
| **HEALER** | 95 | 9 | 12 | 45 | 24 | 6 | Impulsion de soin toutes les 3 s (se charge 0,65 s avant, lien visuel vers l'allié soigné). |
| **CHARO** | 100 | 11 | 24 | 50 | 20 | 11 | Se gare, tire des éventails rapprochés (cadence 0,9-1,6 s). |
| **GHOST** (fantôme) | 110 | 12 | 16 | 70 | 18 | 10 | Alterne toutes les 1,5 s entre état normal et **phasé** (intangible, non ciblable). |
| **ELITE** | 130 | 8 | 120 | 30 | 60 | 20 | Tire un éventail de `2 × palier + 1` voies visées sur le joueur. |
| **MOTHERSHIP** | 140 | 8 | 45 | 25 | 35 | 10 | Se gare et lâche un SWARMER toutes les 3 s (animation de charge 0,5 s avant). |
| **VORTEX** | 150 | 7 | 30 | 16 | 26 | 5 | Courbe les tirs du joueur dans un rayon de 130 px vers lui. |
| **TRESORIN** (doré) | spawn programmé | — | 10 | traverse l'écran à 190-240 | 60 | 1 | Ne tire jamais, ondule. **Jackpot** : `3 + alerte` fragments, 10 cristaux, +25 % d'un niveau d'XP. Apparaît toutes les 45-80 s. |
| **METEORITE** | événements | — | — | — | — | — | 3 tailles, se divise en 3 plus petites à l'impact. Rouge, bleu ou violet (une couleur par pluie). |

### 3.4 IA des ennemis (alerte 6 → 11)

- **Esquive** : les ennemis prédisent la trajectoire des tirs et missiles du joueur (point de plus grande approche) et se décalent ; ils fuient aussi les pièges (trous noirs…). Ça monte de l'alerte 6 à 11.
- **Formations / coordination** (`updateSquads`) : `f = clamp((alerte − 7)/3, 0, 1)`. À f > 0 : formations en V par voie ; à f ≥ 0,6 : manœuvre en **tenaille** ; salves coordonnées avec un intervalle de `4200 / (0,6 + c + 0,7 × f)`.

### 3.5 Drops

- **Cristal** : probabilité `min(0,98 ; 0,75 + gemChanceBonus)`. Valeur d'XP 2-4 (petit/moyen), 6 pour un gros ; cristal bonus avec BUTIN DOUBLE. SWARMER : 22 % seulement, valeur 1-2. METEORITE : 40 %.
- **Cellule d'énergie** : `healDropChance` (3 % par niveau de CELLULES D'ENERGIE) la place **à la place** du cristal. Valeur `5 + 3 × bigHeal`.
- **Boss** : 24 gros cristaux.
- Au-delà de `GEM_CAP` (1 000 000) l'XP est créditée sans sprite.

---

## 4. Les boss

### 4.1 Rythme et ordre

- **Premier boss à 35 s**. Ensuite : prochain boss `45 + 5 × boss vaincus` secondes après la mort du précédent, **plafonné à 90 s**.
- **Un boss ne démarre jamais pendant un événement** (il attend la fin).
- **Double boss à 10:00** (une seule fois) : deux boss différents en même temps, chacun à 70 % de ses PV.
- Ordre : **sac mélangé** de 7 boss (Dreadnought, Faucheuse, Ruche, Prisme, Kraken, Éclipse, Hydre) ; tous passent avant qu'un boss se répète. Le sac est conservé entre les parties.
- Tant que l'alerte est < 3, le terrain est nettoyé à l'arrivée du boss ; à partir de 3, les mobs restent.
- Pendant un combat de boss, le **niveau d'alerte est gelé**.
- Le boss est **agrandi** avec le dézoom (`min(1,8 ; 1/zoom)`), pour garder une présence à l'écran.

### 4.2 Calcul des PV et dégâts d'un boss

```
PV = PV_de_base × ts
ts = (double ? 0,7 : 1)
   × 1,4^(alerte_actuelle − alerte_de_départ)         [montée d'alerte PENDANT la run]
   × 1,035^max(0, palier − 30)
   × (1 + (boss_vaincus + 1) × tierStep)              [tierStep = min(0,65 ; 0,25 + 0,05 × (alerte − 1))]
   × BOSS_HP_BY_ALERT[alerte_de_départ − 1]
```

Table `BOSS_HP_BY_ALERT` (alerte 1 → 20) :  
1,3 · 2,1 · 2,8 · 4,2 · 11 · 22 · 40 · 103 · 162 · 231 · 311 · 407 · 527 · 672 · 858 · 1030 · 1236 · 1483 · 1780 · 2136

**Dégâts d'un boss** = base × `min(3,5 ; (1 + 0,25 × palier) × (1 + 0,08 × (alerte − 1))) × lateDmgMul`.

### 4.3 Phases, seconde forme, bouclier

- **Phase 2** : à partir de l'alerte 3, quand les PV passent sous `min(85 % ; 50 % + 3 % × (alerte − 3))`.
- **Phase 3 (fureur)** : à partir de l'alerte 6, sous `min(50 % ; 30 % + 2,5 % × (alerte − 6))`.
- Chaque changement de phase : flash, bandeau, onde de choc, ralenti, **bouclier du boss entièrement rechargé** (alerte 10+).
- **Seconde forme** (alerte 8+, Dreadnought / Faucheuse / Prisme / Kraken / Éclipse) : au lieu de mourir, le boss se relève une fois à **30 % de ses PV**, enragé, avec un bandeau « SECONDE FORME ! ».
- **Bouclier de boss** (alerte 10+) : même formule que les ennemis, barre dédiée sous la barre de PV.
- **Barres de PV** : jusqu'à 3 barres affichées sans chevauchement (double boss + boss bonus).
- Boss vaincu : +25 combo, +1 palier, +1 relique, nouveau décor, ralenti, événements replanifiés.

### 4.4 Les 7 boss

| Boss | PV de base | Mécanique | Attaques par phase |
|---|---|---|---|
| **DREADNOUGHT** | 630 | Boss de base, cuirassé qui oscille horizontalement (amplitude 95, plus rapide et large en phase 2). Seconde forme. | P1 : éventail de 3 tirs + anneau complet. P2 : éventail de 5 plus rapide, pluie de 3 tirs lents. P3 : l'anneau **tourne en spirale** d'un tir à l'autre. |
| **LA FAUCHEUSE** | 700 | Cycle balayage → verrouillage du joueur → **piqué** → sonnée (groggy 2 s, 1,4 s en P3, vulnérable) → retour. Seconde forme. | Éventail de croissants de 5 (7 en P3). Couleurs argent → magenta → rouge. Délai entre piqués 7 s (4,5 s en P3). |
| **LA RUCHE** | 0 (pods) | **4 pods** orbitaux (110 PV × ts chacun) protègent un cœur (200 × ts) **invulnérable tant qu'il reste des pods**. Pas de seconde forme. | Spores **à tête chercheuse** (1 puis 2 en P2) + salves circulaires. Pods abîmés sous 50 % de PV. |
| **LE PRISME** | 680 | **3 miroirs** invulnérables orbitent et réfléchissent un faisceau laser. Seconde forme. | P1 : laser télégraphié (cycle 3,2 s ; 2,2 s en P2). P2 : **spirale** de tirs cyan/doré. P3 : les miroirs tirent aussi vers le joueur. |
| **LE KRAKEN** | 600 | **4 tentacules** = chaînes de 5-6 boules (5 PV × ts chacune). La boule de **base dorée** (12 × ts) est le point faible : la détruire fait disparaître tout le bras. Les bras **repoussent**. Seconde forme. | Éventail d'encre de 5 (7 en P2) violet puis rouge. |
| **L'ECLIPSE** | 720 | Alterne phase normale et **mirage** (plusieurs copies, seul un halo trahit le vrai). Seconde forme. | Éventail de 3 orbes, copies qui tirent vers le joueur en mirage, cadence ×0,65 du délai en P2+. |
| **L'HYDRE** | 0 (têtes) | **3 têtes** (42 PV × ts chacune), corps **invulnérable**. Une tête abattue **repousse** (compteur affiché). | P1 : crachats simples. P2 : les têtes paires tirent par deux. P3 : salve circulaire de venin toutes les 3 salves. |

**Boss bonus** (événement, alerte 4+) : un boss surgit de nulle part ; il ne donne ni relique, ni palier, ni nouveau décor, seulement une pluie de cristaux.

---

## 5. Événements aléatoires

- **Gros événements** : planifiés **après chaque boss**, un seul à la fois, au moins 1 entre deux boss (davantage s'il y a le temps). **Aucun avant le premier boss.** Tirage pondéré, `min` = alerte minimale.
- **Petits événements** : minuteur à part (premier après 20-35 s, ensuite 30-60 s, ×0,8 à partir de l'alerte 8), peuvent se superposer à un gros.
- Quand un événement est en cours, les petits événements se superposent mais jamais pendant un vrai boss pour les gros.

### Gros événements

| Événement | Alerte min | Poids | Durée | Effet |
|---|---|---|---|---|
| PLUIE DE CRISTAUX | 1 | 7 | 20-35 s | Cristaux qui tombent (`1 + alerte/3` par tick de 360 ms) |
| TEMPETE DE METEORITES | 1 | 7 | 35-50 s | Rochers + décor, une couleur par pluie |
| FRENESIE | 1 | 7 | 30-60 s | **XP ×2**, apparitions bien plus rapprochées |
| CHAMP DE MINES | 3 | 7 | 20-40 s | Mines posées (`1 + alerte/3` par seconde) |
| ECRAN RETOURNE | 3 | 7 | 20-60 s | La caméra pivote de 180° |
| NEBULEUSE | 3 | 7 | 35-65 s | On n'y voit presque rien (cône de vision, RADAR l'allonge), XP ×1,5 en zone |
| MINI TROUS NOIRS | 3 | 7 | 30-50 s | Petits gouffres qui aspirent tout, toi compris |
| FORET D'ARAIGNEES | 4 | 7 | 25-55 s | **Seules** des araignées apparaissent, sur les 4 côtés |
| COULOIR D'ASTEROIDES | 4 | 7 | 35-55 s | Murs de météorites ; les tirs rebondissent, toucher un mur fait mal, s'accélère avec l'overdrive |
| ECLIPSE SOLAIRE | 4 | 6 | 17-28 s | Presque plus rien de visible |
| TROU NOIR | 5 | 6 | 30-50 s | Gouffre central, il faut lutter pour rester libre |

### Petits événements (se superposent)

| Événement | Alerte min | Poids | Durée | Effet |
|---|---|---|---|---|
| MAREE D'ESSAIMS | 2 | 8 | 14 s | Rangées de `10 + 3 × alerte` swarmers |
| CIEL DE TRESORINS | 2 | 5 | 5 s | `3 + alerte/3` trésorins d'un coup |
| TEMPETE DE GLACE | 2 | 6 | 14 s | Tout glisse (inertie) |
| ESCADRON KAMIKAZE | 3 | 7 | 4 s | `6 + alerte` kamikazes (de partout à l'alerte 5+) |
| IMPULSION EMP | 3 | 5 | 7,5 s | Coupe temporairement le vaisseau (overdrive bloqué, boucliers coupés) |
| FOUDRE STATIQUE | 3 | 6 | 12 s | Éclairs au sol |
| BOSS BONUS | 4 | 3 | 1,5 s | Voir plus haut |
| BOMBARDEMENT | 4 | 6 + alerte/2 | 11 s | Cercles rouges à fuir (`8 + alerte` dégâts) |
| INVADERS | 4 | 6 | 3 s | Mur d'ennemis avec une brèche |
| ESCORTE D'ELITES | 6 | 5 | 4 s | `3 + alerte/2` élites + `1 + alerte/4` healers |
| BOULE DE PLASMA | 5 | 5 | 11 s | Invulnérable : il faut la laisser passer |

---

## 6. Progression permanente (méta)

### 6.1 Fragments ◆

`fragments = round( (max(1, round(floor(score/15) × (1 + fragmentBonus))) + fragments_de_jackpots) × bonus_pactes )`

`fragmentBonus` vient de CRISTAUX+ (+10 %/niv.), COFFRE-FORT (+25 %), JACKPOT (+50 %), ascensions (+10 % chacune), succès (+8 %).

### 6.2 Niveau d'alerte de départ

Nombre de points investis dans l'arbre → niveau d'alerte. Seuils (après mise à l'échelle sur 336 points) : **5, 12, 21, 32, 44, 79, 123, 150, 176, 203, 229, 256, 302, 336** (alertes 2 à 15). Les niveaux 16 à 20 s'obtiennent par **ascension** (+1 par ascension, cap `ALERT_CAP` = 20).

### 6.3 Arbre de compétences (336 points au total)

Coût d'un nœud = `base + niveau × pas` (le tableau donne le coût des 3 premiers niveaux). Les nœuds « cap » en fin de chaîne coûtent 38 à 42 chacun et sont les gros paliers de build.

### Branche ARME (tir, laser, shotgun) — 73 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| PUISSANCE | 6 | 6 / 11 / 16 | CŒUR DU VAISSEAU | +10% dégâts de départ / niveau. |
| CELERITE | 6 | 6 / 11 / 16 | CŒUR DU VAISSEAU | +6% cadence de départ / niveau. |
| DEGATS+ | 8 | 7 / 12 / 17 | PUISSANCE | +5% dégâts permanents / niveau. |
| CADENCE+ | 6 | 7 / 12 / 17 | CELERITE | +3% cadence permanente / niveau. |
| TIR MULTIPLE | 4 | 10 / 18 / 26 | DEGATS+ | +1 projectile de départ tous les 2 niveaux. |
| PERFORANT | 3 | 10 / 18 / 26 | CADENCE+ | +1 perforation de départ tous les 2 niveaux. |
| TRANSPERCE-BOUCLIER | 1 | 12 | DEGATS+ | Tes tirs perforants traversent aussi les boucliers ennemis (sinon ils s'arrêtent dessus tant qu'il est debout). |
| VELOCITE | 4 | 8 / 14 / 20 | TIR MULTIPLE | +5% vitesse des tirs / niveau. |
| CRITIQUE | 5 | 9 / 16 / 23 | PERFORANT | +3% chance de coup critique (x2 dégâts) / niveau. |
| LASER CONTINU | 1 | 30 | VELOCITE, CRITIQUE | Débloque un laser perforant comme arme (proposé en jeu). |
| PORTEE LASER | 4 | 10 / 18 / 26 | LASER CONTINU | +10% vitesse du laser / niveau. |
| DEGATS LASER+ | 5 | 10 / 18 / 26 | PORTEE LASER | +15% dégâts du laser / niveau. |
| LASER DESTRUCTEUR | 1 | 40 | DEGATS LASER+ | Après 2s de tir continu, le laser double ses dégâts. |
| LASER AUTO-CIBLEUR | 1 | 30 | VELOCITE, CRITIQUE | Débloque un laser qui verrouille l'ennemi le plus proche (proposé en jeu). |
| VERROUILLAGE+ | 4 | 9 / 16 / 23 | LASER AUTO-CIBLEUR | Verrouille la cible plus vite. |
| CIBLAGE PRIORITAIRE | 3 | 10 / 18 / 26 | VERROUILLAGE+ | Vise en priorité les ennemis à faibles PV. |
| RETICULE OMNISCIENT | 1 | 40 | CIBLAGE PRIORITAIRE | Verrouille 3 cibles à la fois au lieu d'une. |
| SHOTGUN | 1 | 30 | VELOCITE, CRITIQUE | Débloque une salve en cône (proposée en jeu), plus lente mais plus lourde. |
| PLUS DE PLOMBS | 4 | 10 / 18 / 26 | SHOTGUN | +1 plomb / niveau. |
| RECUL MAITRISE | 4 | 9 / 16 / 23 | PLUS DE PLOMBS | Réduit la perte de cadence du shotgun. |
| CANON A FRAGMENTATION | 1 | 40 | RECUL MAITRISE | Chaque plomb touché se fragmente en 2 éclats. |

### Branche MISSILE — 44 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| LANCE-MISSILES | 1 | 14 | CŒUR DU VAISSEAU | Débloque l'emplacement de missiles (proposé en jeu dès le niveau 5). |
| CHARGE | 4 | 9 / 16 / 23 | CŒUR DU VAISSEAU | +1 missile de départ par salve tous les 2 niveaux. |
| CADENCE MISSILES | 4 | 9 / 16 / 23 | LANCE-MISSILES | Tire les missiles plus souvent / niveau. |
| RAYON EXPLOSION | 3 | 10 / 18 / 26 | CHARGE | +20% rayon d'explosion / niveau. |
| PERFORANTS | 3 | 11 / 20 / 29 | CADENCE MISSILES | Les missiles traversent 1 ennemi de plus / niveau. |
| TETE INCENDIAIRE | 3 | 12 / 21 / 30 | RAYON EXPLOSION | Laisse une zone de dégâts au sol après l'impact. |
| STABILISATEURS | 3 | 8 / 14 / 20 | PERFORANTS | Missiles mieux calibrés : +10% de dégâts de missile / niveau. |
| RECHARGE RAPIDE | 3 | 9 / 16 / 23 | TETE INCENDIAIRE | Réduit le délai entre deux salves de missiles. |
| MISSILES DROITS | 1 | 26 | STABILISATEURS, RECHARGE RAPIDE | Les missiles partent tout droit et explosent en zone à l'impact. |
| VITESSE MISSILE | 4 | 9 / 16 / 23 | MISSILES DROITS | +10% vitesse / niveau. |
| CHARGE LOURDE | 4 | 10 / 18 / 26 | VITESSE MISSILE | +15% dégâts d'explosion / niveau. |
| MISSILE NUCLEAIRE | 1 | 38 | CHARGE LOURDE | Un missile dévastateur part tout droit périodiquement et rase une immense zone. |
| MISSILES CHERCHEURS | 1 | 26 | STABILISATEURS, RECHARGE RAPIDE | Les missiles sont auto-guidés vers l'ennemi le plus proche. |
| VERROU. MULTIPLE | 4 | 9 / 16 / 23 | MISSILES CHERCHEURS | Les missiles chercheurs se répartissent sur plusieurs cibles (+1 cible / niveau). |
| CADENCE+ | 4 | 9 / 16 / 23 | VERROU. MULTIPLE | Tire les missiles chercheurs plus souvent. |
| ESSAIM D'AUTOMISSILES | 1 | 38 | CADENCE+ | Une nuée de petits missiles auto-guidés est tirée en continu autour du vaisseau. |

### Branche DEFENSE — 81 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| VITALITE | 6 | 6 / 11 / 16 | CŒUR DU VAISSEAU | +15 PV de départ / niveau. |
| BOUCLIER+ | 3 | 10 / 18 / 26 | CŒUR DU VAISSEAU | +20 PV de bouclier de départ / niveau. |
| BLINDAGE+ | 6 | 7 / 12 / 17 | VITALITE | +20 PV max permanents / niveau. -10% de dégâts de collision / niveau. |
| BOUCLIER | 4 | 9 / 16 / 23 | BOUCLIER+ | +30 PV de bouclier permanents / niveau. |
| REGENERATION | 5 | 9 / 16 / 23 | BLINDAGE+ | Régénère 0.5% des PV max chaque seconde / niveau. |
| RECHARGE BOUCLIER | 4 | 8 / 14 / 20 | BOUCLIER | -15% délai avant régén. du bouclier / niveau. |
| ESQUIVE | 3 | 16 / 26 / 36 | REGENERATION | Double-tap : dash bref avec immunité (charges par run). |
| ARMURE | 5 | 10 / 18 / 26 | RECHARGE BOUCLIER | -4% dégâts subis / niveau. |
| VOL DE VIE | 5 | 11 / 20 / 29 | ESQUIVE | +0,1% des dégâts infligés restitués en PV / niveau. |
| BOUCLIER REACTIF | 3 | 12 / 21 / 30 | ARMURE | Le bouclier renvoie une onde de dégâts autour de lui quand il encaisse un coup. |
| RESILIENCE | 4 | 9 / 16 / 23 | VOL DE VIE | +50 ms d'invincibilité après un coup / niveau (350 ms de base). |
| SECOND SOUFFLE | 3 | 12 / 21 / 30 | BOUCLIER REACTIF | Après une esquive, gagnez un petit bouclier temporaire. |
| FORTERESSE | 1 | 28 | RESILIENCE, SECOND SOUFFLE | +50% PV max, -15% de dégâts de collision, mais -20% de réactivité du vaisseau. |
| RESISTANCE+ | 5 | 10 / 18 / 26 | FORTERESSE | -3% dégâts subis supplémentaires et -7% de dégâts de collision / niveau. |
| REGEN BLINDEE | 4 | 10 / 18 / 26 | RESISTANCE+ | +0.3% PV max régénérés par seconde / niveau. |
| AURA DE FER | 1 | 40 | REGEN BLINDEE | +25% PV max, -15% dégâts subis supplémentaires et -20% de dégâts de collision. |
| PHENIX | 1 | 28 | RESILIENCE, SECOND SOUFFLE | Revient une fois à la vie avec 50% des PV. |
| ESQUIVE+ | 3 | 12 / 21 / 30 | PHENIX | +1 charge d'esquive supplémentaire / niveau. |
| RENAISSANCE BOUCLIER | 4 | 9 / 16 / 23 | ESQUIVE+ | +15 PV de bouclier permanents / niveau. |
| IMMORTEL | 1 | 40 | RENAISSANCE BOUCLIER | Peut revenir à la vie une seconde fois pendant la run. |
| SANGSUE | 1 | 28 | RESILIENCE, SECOND SOUFFLE | Chaque ennemi tué à proximité soigne une petite zone autour du vaisseau. |
| VOL+ | 5 | 10 / 18 / 26 | SANGSUE | +0,1% des dégâts infligés restitués en PV / niveau. |
| RAYON+ | 3 | 9 / 16 / 23 | VOL+ | Agrandit la zone de soin du Sangsue / niveau. |
| FESTIN | 1 | 40 | RAYON+ | Le soin de zone du Sangsue est doublé. |

### Branche UTILITAIRE — 88 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| AIMANT+ | 5 | 6 / 11 / 16 | CŒUR DU VAISSEAU | +15 portée d'aimant de départ / niveau. |
| REACTEURS | 5 | 6 / 11 / 16 | CŒUR DU VAISSEAU | Vaisseau plus réactif dès le départ / niveau. |
| AIMANT | 5 | 7 / 12 / 17 | AIMANT+ | +20 portée d'aimant permanente / niveau. |
| VITESSE | 5 | 7 / 12 / 17 | REACTEURS | Vaisseau encore plus réactif / niveau. |
| XP+ | 6 | 8 / 14 / 20 | AIMANT | +8% XP gagnée par cristal / niveau. |
| CHANCE | 4 | 9 / 16 / 23 | VITESSE | Augmente le taux de drop de cristaux / niveau. |
| COLLECTE AUTO | 3 | 12 / 21 / 30 | XP+ | Aspire tous les cristaux proches toutes les 8s. |
| REDUC. COOLDOWN | 3 | 10 / 18 / 26 | CHANCE | -4% XP requise pour le niveau suivant / niveau. |
| CELLULES D'ENERGIE | 5 | 9 / 16 / 23 | COLLECTE AUTO | Chance qu'un ennemi lâche une cellule (charge l'overdrive) au lieu d'un cristal / niveau. |
| BUTIN DOUBLE | 4 | 9 / 16 / 23 | REDUC. COOLDOWN | Chance d'un cristal supplémentaire à la mort d'un ennemi / niveau. |
| CRISTAUX+ | 5 | 10 / 18 / 26 | CELLULES D'ENERGIE | +10% de fragments gagnés en fin de run / niveau. |
| CELLULES+ | 3 | 10 / 18 / 26 | BUTIN DOUBLE | Les cellules d'énergie chargent bien plus l'overdrive. |
| COFFRE-FORT | 1 | 28 | CRISTAUX+, CELLULES+ | +25% de fragments gagnés en fin de run. |
| XP++ | 5 | 9 / 16 / 23 | COFFRE-FORT | +5% XP gagnée par cristal supplémentaire / niveau. |
| CHANCE+ | 4 | 9 / 16 / 23 | XP++ | +4% de chance de cristal bonus supplémentaire / niveau. |
| JACKPOT | 1 | 40 | CHANCE+ | +50% de fragments gagnés en fin de run supplémentaires. |
| ECLAIR | 1 | 28 | CRISTAUX+, CELLULES+ | Vaisseau nettement plus réactif aux commandes. |
| REACTIVITE+ | 4 | 9 / 16 / 23 | ECLAIR | Vaisseau encore plus réactif / niveau. |
| SILLAGE MAGNETIQUE | 4 | 8 / 14 / 20 | REACTIVITE+ | +25 portée d'aimant / niveau. |
| VITESSE LUMIERE | 1 | 40 | SILLAGE MAGNETIQUE | Le vaisseau suit le doigt quasi instantanément. |
| DRONE SATELLITE | 1 | 28 | CRISTAUX+, CELLULES+ | Un drone orbite le vaisseau et tire automatiquement sur les ennemis. |
| CADENCE DRONE | 4 | 9 / 16 / 23 | DRONE SATELLITE | Le(s) drone(s) tirent plus souvent / niveau. |
| DEGATS DRONE | 4 | 9 / 16 / 23 | CADENCE DRONE | +15% dégâts des tirs du/des drone(s) / niveau. |
| ESSAIM | 1 | 42 | DEGATS DRONE | 2 drones supplémentaires orbitent désormais le vaisseau. |
| RADAR | 4 | 26 / 48 / 70 | ESSAIM | Dans une nébuleuse, le cône de vision porte plus loin et s'élargit / niveau. |

### Branche SAVOIR (cartes) — 14 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| INTUITION | 3 | 8 / 22 / 36 | CŒUR DU VAISSEAU | +1 choix de carte à chaque montée de niveau / niveau (2 de base, 5 au maximum). |
| RELANCE | 4 | 10 / 20 / 30 | INTUITION | +1 relance de cartes par partie / niveau (aucune de base). |
| ECLAIR DE GENIE | 5 | 12 / 22 / 32 | RELANCE | +6% de chance / niveau qu'une carte choisie compte double. |
| BUTIN DE BOSS | 2 | 20 / 36 | ECLAIR DE GENIE | +1 relance à chaque boss vaincu / niveau. |

### Branche TEMPETE (foudre, éclats) — 10 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| FOUDRE | 3 | 14 / 26 / 38 | CŒUR DU VAISSEAU | Chaque tir qui touche libère un arc de foudre vers 1 ennemi proche de plus / niveau (30% des dégâts). |
| REBOND | 3 | 12 / 22 / 32 | FOUDRE | Tes tirs rebondissent sur les côtés de l'écran (plus pâles, ~1 s) : +1 rebond / niveau. |
| ECLATS | 3 | 16 / 28 / 40 | REBOND | Un ennemi tué projette 2 éclats de plus / niveau (35% des dégâts). |
| TONNERRE | 1 | 42 | ECLATS | Toutes les 8 s la foudre frappe l'ennemi le plus solide (dégâts x6). |

### Branche GRAVITE (champ lent, pulsar, trou noir) — 12 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| CHAMP LENT | 4 | 12 / 22 / 32 | CŒUR DU VAISSEAU | Les tirs ennemis ralentissent près du vaisseau (zone et ralentissement qui augmentent / niveau). |
| PULSAR | 4 | 14 / 26 / 38 | CHAMP LENT | Une onde efface les tirs ennemis proches, de plus en plus souvent et loin / niveau. |
| TROU NOIR | 3 | 18 / 32 / 46 | PULSAR | Périodiquement, un trou noir attire et écrase le plus gros groupe d'ennemis (plus souvent / niveau). |
| GRAVITE | 1 | 32 | TROU NOIR | +150 de portée d'aimant, et le trou noir dure plus longtemps et attire plus loin. |

### Branche FURIE (overdrive) — 13 points max

| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |
|---|---|---|---|---|
| OVERDRIVE | 4 | 10 / 22 / 34 | CŒUR DU VAISSEAU | Débloque l'overdrive : une jauge qui se charge en frôlant les tirs ennemis et en tuant. Pleine, touche OD : dégâts x2, cadence +60% et bouclier jaune invincible (aucun dégât subi) pendant 5 s, ton bouclier normal se régénère 2x plus vite. Le bonus s'érode pendant l'effet (jusqu'à -60%) et chaque activation est 8% plus faible que la précédente; les cellules d'énergie le ravivent (+1 s / niveau). |
| FROLEMENT | 3 | 10 / 19 / 28 | OVERDRIVE | +40% de charge de l'overdrive par tir frôlé / niveau. |
| SURCHAUFFE | 3 | 14 / 26 / 38 | FROLEMENT | +25% de dégâts pendant l'overdrive / niveau (x2 de base). |
| SECOND SOUFFLE | 3 | 16 / 30 / 44 | SURCHAUFFE | Chaque boss vaincu recharge 30% de l'overdrive / niveau. |

### 6.4 Pactes (difficulté volontaire pour plus de fragments)

| Pacte | Effet | Bonus fragments |
|---|---|---|
| MOBS EXPLOSIFS | Chaque ennemi tué explose et blesse s'il est proche (5 + alerte) | +25 % |
| TIRS RAPIDES | Ennemis tirent plus souvent (délai ×0,7) et plus vite (×1,25) | +20 % |
| PEAU FRAGILE | Démarre avec 40 % de PV en moins | +25 % |
| LA FOULE | Beaucoup plus d'ennemis par vague (+2 renforts) | +20 % |
| SANS BOUCLIER | Aucun bouclier | +15 % |

### 6.5 Succès (buffs permanents)

- **Détonateur** par ennemi (21 types) : 3 paliers (100 / 500 / 2000 points pondérés × rareté). Les kills à haute alerte comptent plus (poids de 1 à 74). Chaque palier débloque une **explosion en chaîne** permanente à la mort de ce type (rayon 70 / 95 / 125, 45 % / 90 % / 160 % des PV).
- **Succès globaux** (32) : kills totaux, kills en alerte 6+, boss, boss distincts, bestiaire complet, chaînes d'explosions, durée de run (5/10/20 min), niveau de run (20/40), alerte atteinte (8/10/12/15), combos (100/500/2000), un succès par boss. Ils donnent de petits bonus permanents : +2 à +10 % dégâts, cadence, XP, PV max ou fragments.

### 6.6 Ascension

Possible à partir de 291 points investis. Chaque ascension : **+1 niveau d'alerte de départ** (cap 20), +10 % dégâts, +10 % PV max, +10 % XP, +10 % fragments. Les boss aux alertes 16-20 réutilisent les comportements du niveau 15 pour l'instant.

---

## 7. Le déroulé type d'une run (de 0 à 20 minutes)

| Moment | Ce qui se passe |
|---|---|
| 0-35 s | Grunts, divers, shooters. Montée de niveaux rapide (8 XP au départ). |
| ~35 s | **Premier boss** (aucun événement avant). |
| Après le boss | Relique + 1er gros événement + premiers petits événements ; boss suivant 50 s plus tard. |
| 2 min | Alerte +1 (puis toutes les 2 min) : plus d'ennemis, tirs plus rapides, dégâts +10 %/alerte. |
| 5-10 min | Alerte 8+ en jeu : boucliers visibles sur les ennemis, IA qui esquive et se coordonne, boss en seconde forme, explosions qui blessent. |
| **10:00** | **Double boss**. Les dégâts ennemis ont atteint leur +40 % de temps ; ensuite +3 %/min. |
| 10 min + | PV ennemis ×1,035 par palier de 20 s (exponentiel), dégâts +3 %/min. C'est le mur de fin de partie : ni l'écran ni les tirs ne sont plafonnés. |
| Alerte 10+ | Boss avec bouclier, cadence ennemie sans plancher (−7 % de délai par niveau). |

---

## 8. Points d'attention et décisions à prendre

- **Cap d'alerte à 20 vs boss final à 26** : `ALERT_CAP = 20`, donc un boss final prévu à l'alerte 26 est inatteignable tel quel.
- **Plafonds restants dans le code** malgré ta règle « pas de limites artificielles » : armure de l'arbre (0,6 / 0,75 / 0,8 selon le nœud), relique PHASE (`min(0,8, …)`), multiplicateur de dégâts de boss (`BOSS_DMG_CAP = 3,5`), réactivité du vaisseau (24 avec NITRO), cartes à 5 max, `tierStep` des PV de boss (0,65). À décider un par un.
- **LAME DU VENT** ajoute ses charges directement à la scène, pas aux stats : elles marchent mais n'apparaissent pas dans les stats affichées.
- **Alertes 16-20** : les boss y réutilisent le comportement du niveau 15, et la table de PV des boss pour ces niveaux est provisoire.
- **Valeurs non encore équilibrées** : `BOSS_HP_BY_ALERT` a été calibrée à 15 niveaux au bot de test ; au-dessus, c'est une extrapolation.
- **Sons et dernières musiques** : à refaire/enregistrer (voir la liste des options en attente).
