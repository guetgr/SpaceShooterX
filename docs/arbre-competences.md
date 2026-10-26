# L'arbre de compétences — fonctionnement et état des lieux

Document de travail pour un brainstorm sur l'amélioration des compétences de l'onglet **ARBRE** (page de droite de l'accueil).
Tout ce qui est écrit ici vient du code (`src/data/skill-tree.js`, `src/ui/tree-ui.js`) ; les passages marqués **Observation** sont des constats de l'auteur, pas des règles du jeu.

## 1. En une phrase

Avec les **fragments (◆)** gagnés en jouant, on achète des **rangs de compétences permanents** répartis en **8 branches**. Ils s'appliquent à chaque partie dès le départ et débloquent des armes et mécaniques. L'arbre complet fait **335 rangs pour 7656 ◆**.

## 2. La boucle d'économie

- **Gains** : à la fin d'un niveau (victoire ou défaite) : `score/15 × (1 + bonus fragments)`, **× 0,06** en niveau (`LEVEL_FRAG_MUL`, `data/balance.js`), plus la prime du niveau (`reward.clear` à chaque victoire, `reward.first` en plus à la première). Les pactes multiplient le total.
- **Primes de niveau** (1re victoire = `clear + first`) : monde 1 ≈ 570 ◆ (tuto 30, 60, 75, 90, 105, boss 210) ; monde 2 ≈ 920 ◆ ; monde 3 ≈ 1 230 ◆. Un rejouage ne donne que `clear` (monde 1 : 20 à 60 par niveau).
- **Dépenses** : l'arbre est **le seul usage** des fragments à ce jour.
- **Remboursement** : il n'y a **pas de respec**. Seul « RÉINITIALISER LA PROGRESSION » (paramètres) remet tout à zéro, fragments compris.
- **Bonus de fragments** : `fragmentBonus` (stat) est augmenté par CRISTAUX+, COFFRE-FORT, JACKPOT et par les succès.
- **Observation** : l'arbre coûte ~7 650 ◆ ; les primes de première victoire des 3 mondes actuels font ~2 700 ◆. Le reste doit venir du rejouage. Les mondes sont des brouillons, ces chiffres bougeront.

## 3. La logique de l'arbre

### 3.1 Structure

- Un **cœur** (le vaisseau) et **8 branches** : Arme principale, Missiles, Défense & vitalité, Mobilité & utilitaire, Savoir, Tempête, Gravité, Furie.
- Chaque branche a une **tige** : une suite de **paliers** de 1 à 3 compétences. Une compétence a de 1 à 8 **rangs**.
- Les 4 premières branches ont aussi des **voies spécialisées** (2 ou 3 par branche) : un **keystone** (débloque une mécanique), 1 à 2 compétences de **voie**, puis un **cap** (effet final fort).
- Savoir, Tempête, Gravité et Furie sont des **tiges seules**, courtes (10 à 14 rangs), sans embranchement.

### 3.2 Règles de déblocage

1. Un rang n'est achetable que si le **rang précédent** de la même compétence est acheté.
2. Le **1er rang** d'une compétence demande qu'une compétence **du palier précédent** (son « parent ») soit possédée. Le palier 1 est libre.
3. Un **keystone** demande en plus d'avoir investi **N points dans la tige de sa branche** : 14 (Arme, Défense, Mobilité) ou 10 (Missiles), et d'avoir ouvert le dernier palier.
4. Une **voie** demande son keystone, un **cap** la dernière voie : **au moins un rang** du parent suffit (pas son maximum).
5. Les keystones d'une même branche **ne s'excluent pas** : on peut prendre toutes les voies.

### 3.3 Coûts

- Compétence à rangs : `base + rang × pas` (le rang part de 0). Exemples : PUISSANCE 6 → 31 ; ARMURE 10 → 42 ; ECLAIR DE GENIE 12 → 52.
- Keystones : prix fixe (14 à 30). Caps : prix fixe (38 à 42).
- Les prix ne dépendent **pas** du nombre de compétences déjà possédées.

### 3.4 Effet en jeu

- Au démarrage d'une partie (`GameScene.js`), on parcourt tous les nœuds et on appelle `apply(stats, rang)` de chacun : l'arbre **modifie les stats de départ** du joueur. Aucune compétence n'est « activée » en cours de partie.
- Les **armes et mécaniques** (lasers, shotgun, missiles droits/chercheurs, drone, Phénix, Sangsue…) sont des **drapeaux** (`laserContinuOwned`, `droneOwned`…) : posséder le keystone **autorise** l'objet à être **proposé en carte** de montée de niveau pendant la partie. Il n'est pas équipé d'office.
- D'autres systèmes lisent l'arbre : **fusions** (`data/fusions.js`, champ `tree` : exigent certaines compétences), **cartes d'amélioration** (`requiresTree`), le **Hangar** (liste des « modules » = compétences possédées) et les **succès/bestiaire** (`codex.skills`).
- Pas d'effet de synergie propre à l'arbre : chaque compétence est indépendante des autres (hors les conditions de déblocage ci-dessus).
- Les compétences du **tuto** sont ignorées (vaisseau de base).

### 3.5 Interface (v actuelle)

Onglets de branche (progression + point doré si achat possible) → cartes par paliers (une carte par compétence, rangs en pastilles) → voies spécialisées en colonnes → fiche détail + bouton `+` en bas. États d'une carte : verrouillée (grisée), achetable (halo doré), possédée (lumineuse), au max (MAX).

### 3.6 Fichiers

| Fichier | Rôle |
|---|---|
| `src/data/skill-tree.js` | Branches, compétences, coûts, `apply`, déblocage (`treeVisStatus`, `treeNodeUnlocked`). |
| `src/ui/tree-ui.js` | Affichage de la page ARBRE et achat (`renderTree`, `investTreeNode`). |
| `src/home/ui.js` | Intégration à l'accueil, point doré de l'onglet. |
| `src/data/meta.js` | Sauvegarde (`fragments`, `tree`) ; l'ascension existe encore dans le code mais n'est plus accessible. |
| `src/scenes/GameScene.js` | Application de l'arbre aux stats au démarrage. |

## 4. Catalogue complet des compétences

« Stats touchées » = champs de `stats` modifiés par la fonction `apply` (utile pour repérer les doublons).

### Arme principale (`arme`) — 73 rangs, 1598 ◆ au total, embranchement à 14 pts

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **PUISSANCE** | 6 | 6 → 31 | +10% dégâts de départ / niveau. | `damage` |
| Tige | **CELERITE** | 6 | 6 → 31 | +6% cadence de départ / niveau. | `fireRate` |
| Tige | **DEGATS+** | 8 | 7 → 42 | +5% dégâts permanents / niveau. | `damage` |
| Tige | **CADENCE+** | 6 | 7 → 32 | +3% cadence permanente / niveau. | `fireRate` |
| Tige | **TIR MULTIPLE** | 4 | 10 → 34 | +1 projectile de départ tous les 2 niveaux. | `spreadCount` |
| Tige | **PERFORANT** | 3 | 10 → 26 | +1 perforation de départ tous les 2 niveaux. | `pierce` |
| Tige | **TRANSPERCE-BOUCLIER** | 1 | 12 | Tes tirs perforants traversent aussi les boucliers ennemis (sinon ils s'arrêtent dessus tant qu'il est debout). | `shieldPierce` |
| Tige | **VELOCITE** | 4 | 8 → 26 | +5% vitesse des tirs / niveau. | `bulletSpeed` |
| Tige | **CRITIQUE** | 5 | 9 → 37 | +3% chance de coup critique (x2 dégâts) / niveau. | `critChance` |
| Keystone | **LASER CONTINU** | 1 | 30 | Débloque un laser perforant comme arme (proposé en jeu). | débloque une mécanique |
| Voie | **PORTEE LASER** | 4 | 10 → 34 | +10% vitesse du laser / niveau. | `laserSpeedBonus` |
| Voie | **DEGATS LASER+** | 5 | 10 → 42 | +15% dégâts du laser / niveau. | `laserDamageBonus` |
| Cap | **LASER DESTRUCTEUR** | 1 | 40 | Après 2s de tir continu, le laser double ses dégâts. | débloque une mécanique |
| Keystone | **LASER AUTO-CIBLEUR** | 1 | 30 | Débloque un laser qui verrouille l'ennemi le plus proche (proposé en jeu). | débloque une mécanique |
| Voie | **VERROUILLAGE+** | 4 | 9 → 30 | Verrouille la cible plus vite. | `laserLockBonus` |
| Voie | **CIBLAGE PRIORITAIRE** | 3 | 10 → 26 | Vise en priorité les ennemis à faibles PV. | `laserPriority` |
| Cap | **RETICULE OMNISCIENT** | 1 | 40 | Verrouille 3 cibles à la fois au lieu d'une. | débloque une mécanique |
| Keystone | **SHOTGUN** | 1 | 30 | Débloque une salve en cône (proposée en jeu), plus lente mais plus lourde. | débloque une mécanique |
| Voie | **PLUS DE PLOMBS** | 4 | 10 → 34 | +1 plomb / niveau. | `shotgunExtraPellets` |
| Voie | **RECUL MAITRISE** | 4 | 9 → 30 | Réduit la perte de cadence du shotgun. | `shotgunRecoilReduction` |
| Cap | **CANON A FRAGMENTATION** | 1 | 40 | Chaque plomb touché se fragmente en 2 éclats. | débloque une mécanique |

### Missiles (`missile`) — 44 rangs, 887 ◆ au total, embranchement à 10 pts

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **LANCE-MISSILES** | 1 | 14 | Débloque l'emplacement de missiles (proposé en jeu dès le niveau 5). | — |
| Tige | **CHARGE** | 4 | 9 → 30 | +1 missile de départ par salve tous les 2 niveaux. | `missileCount` |
| Tige | **CADENCE MISSILES** | 4 | 9 → 30 | Tire les missiles plus souvent / niveau. | `missileFireRateMul` |
| Tige | **RAYON EXPLOSION** | 3 | 10 → 26 | +20% rayon d'explosion / niveau. | `missileBlastBonus` |
| Tige | **PERFORANTS** | 3 | 11 → 29 | Les missiles traversent 1 ennemi de plus / niveau. | `missilePierce` |
| Tige | **TETE INCENDIAIRE** | 3 | 12 → 30 | Laisse une zone de dégâts au sol après l'impact. | `missileNapalm` |
| Tige | **STABILISATEURS** | 3 | 8 → 20 | Missiles mieux calibrés : +10% de dégâts de missile / niveau. | `missileDamageBonus` |
| Tige | **RECHARGE RAPIDE** | 3 | 9 → 23 | Réduit le délai entre deux salves de missiles. | `missileFireRateMul` |
| Keystone | **MISSILES DROITS** | 1 | 26 | Les missiles partent tout droit et explosent en zone à l'impact. | débloque une mécanique |
| Voie | **VITESSE MISSILE** | 4 | 9 → 30 | +10% vitesse / niveau. | `missileSpeedBonus` |
| Voie | **CHARGE LOURDE** | 4 | 10 → 34 | +15% dégâts d'explosion / niveau. | `missileDamageBonus` |
| Cap | **MISSILE NUCLEAIRE** | 1 | 38 | Un missile dévastateur part tout droit périodiquement et rase une immense zone. | débloque une mécanique |
| Keystone | **MISSILES CHERCHEURS** | 1 | 26 | Les missiles sont auto-guidés vers l'ennemi le plus proche. | débloque une mécanique |
| Voie | **VERROU. MULTIPLE** | 4 | 9 → 30 | Les missiles chercheurs se répartissent sur plusieurs cibles (+1 cible / niveau). | `missileMultiLock` |
| Voie | **CADENCE+** | 4 | 9 → 30 | Tire les missiles chercheurs plus souvent. | `missileFireRateMul` |
| Cap | **ESSAIM D'AUTOMISSILES** | 1 | 38 | Une nuée de petits missiles auto-guidés est tirée en continu autour du vaisseau. | débloque une mécanique |

### Défense & vitalité (`defense`) — 81 rangs, 1841 ◆ au total, embranchement à 14 pts

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **VITALITE** | 6 | 6 → 31 | +15 PV de départ / niveau. | `maxHp` |
| Tige | **BOUCLIER+** | 3 | 10 → 26 | +20 PV de bouclier de départ / niveau. | `shieldMax` |
| Tige | **BLINDAGE+** | 6 | 7 → 32 | +20 PV max permanents / niveau. -10% de dégâts de collision / niveau. | `maxHp`, `collisionMul` |
| Tige | **BOUCLIER** | 4 | 9 → 30 | +30 PV de bouclier permanents / niveau. | `shieldMax` |
| Tige | **REGENERATION** | 5 | 9 → 37 | Régénère 0.5% des PV max chaque seconde / niveau. | `hpRegenPct` |
| Tige | **RECHARGE BOUCLIER** | 4 | 8 → 26 | -15% délai avant régén. du bouclier / niveau. | `shieldRegenDelayMul` |
| Tige | **ESQUIVE** | 3 | 16 → 36 | Double-tap : dash bref avec immunité (charges par run). | `dodgeCharges` |
| Tige | **ARMURE** | 5 | 10 → 42 | -4% dégâts subis / niveau. | `armorPct` |
| Tige | **VOL DE VIE** | 5 | 11 → 47 | +0,1% des dégâts infligés restitués en PV / niveau. | `lifesteal` |
| Tige | **BOUCLIER REACTIF** | 3 | 12 → 30 | Le bouclier renvoie une onde de dégâts autour de lui quand il encaisse un coup. | `shieldReflect` |
| Tige | **RESILIENCE** | 4 | 9 → 30 | +50 ms d'invincibilité après un coup / niveau (350 ms de base). | `hitGrace` |
| Tige | **SECOND SOUFFLE** | 3 | 12 → 30 | Après une esquive, gagnez un petit bouclier temporaire. | `secondSouffle` |
| Keystone | **FORTERESSE** | 1 | 28 | +50% PV max, -15% de dégâts de collision, mais -20% de réactivité du vaisseau. | `maxHp`, `moveResponsiveness`, `collisionMul` |
| Voie | **RESISTANCE+** | 5 | 10 → 42 | -3% dégâts subis supplémentaires et -7% de dégâts de collision / niveau. | `armorPct`, `collisionMul` |
| Voie | **REGEN BLINDEE** | 4 | 10 → 34 | +0.3% PV max régénérés par seconde / niveau. | `hpRegenPct` |
| Cap | **AURA DE FER** | 1 | 40 | +25% PV max, -15% dégâts subis supplémentaires et -20% de dégâts de collision. | `maxHp`, `armorPct`, `collisionMul` |
| Keystone | **PHENIX** | 1 | 28 | Revient une fois à la vie avec 50% des PV. | débloque une mécanique |
| Voie | **ESQUIVE+** | 3 | 12 → 30 | +1 charge d'esquive supplémentaire / niveau. | `dodgeCharges` |
| Voie | **RENAISSANCE BOUCLIER** | 4 | 9 → 30 | +15 PV de bouclier permanents / niveau. | `shieldMax` |
| Cap | **IMMORTEL** | 1 | 40 | Peut revenir à la vie une seconde fois pendant la run. | débloque une mécanique |
| Keystone | **SANGSUE** | 1 | 28 | Chaque ennemi tué à proximité soigne une petite zone autour du vaisseau. | débloque une mécanique |
| Voie | **VOL+** | 5 | 10 → 42 | +0,1% des dégâts infligés restitués en PV / niveau. | `lifesteal` |
| Voie | **RAYON+** | 3 | 9 → 23 | Agrandit la zone de soin du Sangsue / niveau. | `sangsueRadiusBonus` |
| Cap | **FESTIN** | 1 | 40 | Le soin de zone du Sangsue est doublé. | `sangsueHealMul` |

### Mobilité & utilitaire (`util`) — 88 rangs, 1977 ◆ au total, embranchement à 14 pts

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **AIMANT+** | 5 | 6 → 26 | +15 portée d'aimant de départ / niveau. | `magnetRadius` |
| Tige | **REACTEURS** | 5 | 6 → 26 | Vaisseau plus réactif dès le départ / niveau. | `moveResponsiveness` |
| Tige | **AIMANT** | 5 | 7 → 27 | +20 portée d'aimant permanente / niveau. | `magnetRadius` |
| Tige | **VITESSE** | 5 | 7 → 27 | Vaisseau encore plus réactif / niveau. | `moveResponsiveness` |
| Tige | **XP+** | 6 | 8 → 38 | +8% XP gagnée par cristal / niveau. | `xpBonus` |
| Tige | **CHANCE** | 4 | 9 → 30 | Augmente le taux de drop de cristaux / niveau. | `gemChanceBonus` |
| Tige | **COLLECTE AUTO** | 3 | 12 → 30 | Aspire tous les cristaux proches toutes les 8s. | `autoCollect` |
| Tige | **REDUC. COOLDOWN** | 3 | 10 → 26 | -4% XP requise pour le niveau suivant / niveau. | `xpToNextMul` |
| Tige | **CELLULES D'ENERGIE** | 5 | 9 → 37 | Chance qu'un ennemi lâche une cellule (charge l'overdrive) au lieu d'un cristal / niveau. | `healDropChance` |
| Tige | **BUTIN DOUBLE** | 4 | 9 → 30 | Chance d'un cristal supplémentaire à la mort d'un ennemi / niveau. | `bonusGemChance` |
| Tige | **CRISTAUX+** | 5 | 10 → 42 | +10% de fragments gagnés en fin de run / niveau. | `fragmentBonus` |
| Tige | **CELLULES+** | 3 | 10 → 26 | Les cellules d'énergie chargent bien plus l'overdrive. | `bigHeal` |
| Keystone | **COFFRE-FORT** | 1 | 28 | +25% de fragments gagnés en fin de run. | `fragmentBonus` |
| Voie | **XP++** | 5 | 9 → 37 | +5% XP gagnée par cristal supplémentaire / niveau. | `xpBonus` |
| Voie | **CHANCE+** | 4 | 9 → 30 | +4% de chance de cristal bonus supplémentaire / niveau. | `bonusGemChance` |
| Cap | **JACKPOT** | 1 | 40 | +50% de fragments gagnés en fin de run supplémentaires. | `fragmentBonus` |
| Keystone | **ECLAIR** | 1 | 28 | Vaisseau nettement plus réactif aux commandes. | `moveResponsiveness` |
| Voie | **REACTIVITE+** | 4 | 9 → 30 | Vaisseau encore plus réactif / niveau. | `moveResponsiveness` |
| Voie | **SILLAGE MAGNETIQUE** | 4 | 8 → 26 | +25 portée d'aimant / niveau. | `magnetRadius` |
| Cap | **VITESSE LUMIERE** | 1 | 40 | Le vaisseau suit le doigt quasi instantanément. | `moveResponsiveness` |
| Keystone | **DRONE SATELLITE** | 1 | 28 | Un drone orbite le vaisseau et tire automatiquement sur les ennemis. | débloque une mécanique |
| Voie | **CADENCE DRONE** | 4 | 9 → 30 | Le(s) drone(s) tirent plus souvent / niveau. | `droneFireRateMul` |
| Voie | **DEGATS DRONE** | 4 | 9 → 30 | +15% dégâts des tirs du/des drone(s) / niveau. | `droneDamageMul` |
| Cap | **ESSAIM** | 1 | 42 | 2 drones supplémentaires orbitent désormais le vaisseau. | débloque une mécanique |
| Voie | **RADAR** | 4 | 26 → 92 | Dans une nébuleuse, le cône de vision porte plus loin et s'élargit / niveau. | `nebulaVision` |

### Savoir (`savoir`) — 14 rangs, 382 ◆ au total , pas d'embranchement

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **INTUITION** | 3 | 8 → 36 | +1 choix de carte à chaque montée de niveau / niveau (2 de base, 5 au maximum). | `cardChoices` |
| Tige | **RELANCE** | 4 | 10 → 40 | +1 relance de cartes par partie / niveau (aucune de base). | `rerolls` |
| Tige | **ECLAIR DE GENIE** | 5 | 12 → 52 | +6% de chance / niveau qu'une carte choisie compte double. | `doubleCardChance` |
| Tige | **BUTIN DE BOSS** | 2 | 20 → 36 | +1 relance à chaque boss vaincu / niveau. | `bossReroll` |

### Tempête (`tempete`) — 10 rangs, 270 ◆ au total , pas d'embranchement

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **FOUDRE** | 3 | 14 → 38 | Chaque tir qui touche libère un arc de foudre vers 1 ennemi proche de plus / niveau (30% des dégâts). | `chainLightning` |
| Tige | **REBOND** | 3 | 12 → 32 | Tes tirs rebondissent sur les côtés de l'écran (plus pâles, ~1 s) : +1 rebond / niveau. | `bounce` |
| Tige | **ECLATS** | 3 | 16 → 40 | Un ennemi tué projette 2 éclats de plus / niveau (35% des dégâts). | `shardCount` |
| Tige | **TONNERRE** | 1 | 42 | Toutes les 8 s la foudre frappe l'ennemi le plus solide (dégâts x6). | `thunder` |

### Gravité (`gravite`) — 12 rangs, 364 ◆ au total , pas d'embranchement

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **CHAMP LENT** | 4 | 12 → 42 | Les tirs ennemis ralentissent près du vaisseau (zone et ralentissement qui augmentent / niveau). | `slowField` |
| Tige | **PULSAR** | 4 | 14 → 50 | Une onde efface les tirs ennemis proches, de plus en plus souvent et loin / niveau. | `pulsar` |
| Tige | **TROU NOIR** | 3 | 18 → 46 | Périodiquement, un trou noir attire et écrase le plus gros groupe d'ennemis (plus souvent / niveau). | `blackHole` |
| Tige | **GRAVITE** | 1 | 32 | +150 de portée d'aimant, et le trou noir dure plus longtemps et attire plus loin. | `magnetRadius`, `blackHoleBoost` |

### Furie (`furie`) — 13 rangs, 337 ◆ au total , pas d'embranchement

| Type | Compétence | Rangs | Coût (1er → dernier) | Effet | Stats touchées |
|---|---|---|---|---|---|
| Tige | **OVERDRIVE** | 4 | 10 → 46 | Débloque l'overdrive : une jauge qui se charge en frôlant les tirs ennemis et en tuant. Pleine, touche OD : dégâts x2, cadence +60% et bouclier jaune invincible (aucun dégât subi) pendant 5 s, ton bouclier normal se régénère 2x plus vite. Le bonus s'érode pendant l'effet (jusqu'à -60%) et chaque activation est 8% plus faible que la précédente; les cellules d'énergie le ravivent (+1 s / niveau). | `overdrive`, `odDur` |
| Tige | **FROLEMENT** | 3 | 10 → 28 | +40% de charge de l'overdrive par tir frôlé / niveau. | `odGraze` |
| Tige | **SURCHAUFFE** | 3 | 14 → 38 | +25% de dégâts pendant l'overdrive / niveau (x2 de base). | `odDmgMul` |
| Tige | **SECOND SOUFFLE** | 3 | 16 → 44 | Chaque boss vaincu recharge 30% de l'overdrive / niveau. | `odBossCharge` |

## 5. Observations (pistes pour le brainstorm)

Ce sont des constats tirés des données, à discuter.

**Doublons et recouvrements**
- **Dégâts** : PUISSANCE (+10 %/rang) et DEGATS+ (+5 %/rang) multiplient tous deux `damage` au démarrage ; la nuance « de départ » / « permanent » n'est pas visible pour le joueur.
- **Cadence** : CELERITE et CADENCE+ dans le même cas.
- **Aimant (portée)** : AIMANT+, AIMANT, SILLAGE MAGNETIQUE (Éclair) et GRAVITE : 4 sources d'un même effet.
- **Réactivité du vaisseau** : REACTEURS, VITESSE, ECLAIR, REACTIVITE+, VITESSE LUMIERE : 5 sources.
- **PV max** : VITALITE, BLINDAGE+, FORTERESSE, AURA DE FER.
- **Vol de vie** : VOL DE VIE (tige) et VOL+ (Sangsue) ont la même description.
- **XP** : XP+, XP++, REDUC. COOLDOWN (XP requise).

**Nature des effets**
- La grande majorité des rangs sont des **pourcentages invisibles** (+5 % dégâts, −4 % dégâts subis). Les rangs qui **changent le jeu** sont rares : keystones, caps, Tempête, Gravité, Furie, Phénix, Drone.
- Beaucoup de descriptions sont floues (« vaisseau plus réactif », « verrouille plus vite », « réduit la perte de cadence ») : pas de valeur chiffrée affichée.

**Équilibre entre branches**
- Arme 73 rangs, Missiles 44, Défense 81, Mobilité 88 **contre** Savoir 14, Tempête 10, Gravité 12, Furie 13. Les quatre petites branches n'ont ni voies ni keystone, alors que leurs effets sont parmi les plus originaux.
- Mobilité & utilitaire mélange mouvement, économie (XP, fragments, butin), drone et radar : c'est le « fourre-tout ».
- RADAR (4 rangs, 26 → 92 ◆, 236 au total) est la compétence la plus chère de l'arbre et se trouve après le cap ESSAIM ; son effet n'a de sens que dans les nébuleuses.
- Les coûts sont **linéaires** et ne tiennent pas compte de la puissance de l'effet (un rang de +3 % crit coûte autant qu'un rang plus fort ailleurs).

**Rythme de progression**
- Pas de choix qui s'excluent, pas de respec, pas de coût qui monte avec la taille de la build : à terme **tout s'achète**, l'ordre seul change.
- Les caps (38-42 ◆) sont peu chers pour leur puissance par rapport au total de l'arbre.

## 6. Questions pour le brainstorm

1. Veut-on des **choix qui s'excluent** (spécialisation réelle) ou le « tout s'achète » est-il voulu ?
2. Faut-il un **respec** (gratuit, payant, une fois par monde) ?
3. Comment rendre les rangs **perceptibles** (valeur chiffrée affichée, effet visuel en jeu, paliers de bonus à 3 / 6 rangs) ?
4. Fusionner ou différencier les doublons listés plus haut (aimant, réactivité, PV, dégâts/cadence) ?
5. Donner des **voies et keystones** à Savoir, Tempête, Gravité et Furie ?
6. Des **synergies entre branches** (ex. Furie × Tempête, Missiles × Gravité) ou des compétences qui demandent deux branches ?
7. Des **items** (équipement du vaisseau, modules à équiper en nombre limité) en plus des rangs permanents, pour créer des builds ?
8. D'autres **sources de fragments** ou d'autres **monnaies** (par monde, par boss) pour les branches avancées ?
9. Un **objectif de build** visible (suggestions, builds types, « chemin » conseillé) pour guider le joueur dans 335 rangs ?
10. Comment lier l'arbre à la **progression des mondes** (branches ou paliers verrouillés par un boss vaincu) ?
