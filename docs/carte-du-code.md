# Carte du code — point d'entrée

But : savoir **tout de suite** où se trouve chaque élément du jeu. Ce document est écrit à la main (flux, conventions, pièges). Les listes exhaustives sont **générées** dans `docs/carte/` par `tools/gen_codemap.py`.

## 1. Comment l'utiliser

1. Chercher le nom (fonction, constante, id de données, id HTML) dans **`docs/carte/symboles.md`** (Grep ou Ctrl+F) : il donne le fichier.
2. Sinon, parcourir la table « Où trouver quoi » (§4) ou `docs/carte/fichiers.md` (ordre de chargement, rôle de chaque fichier, ce qu'il définit).
3. Autres fichiers générés :
   - `docs/carte/donnees.md` : ids de données (compétences, cartes, reliques, fusions, ennemis, boss, sons…) → fichier ;
   - `docs/carte/interface.md` : ids HTML → qui les utilise, doublons CSS, classes CSS jamais utilisées, assets ;
   - `docs/carte/audit.md` : doublons, références cassées, candidats au code mort, outils, documents.
4. **Après tout ajout/suppression de fichier ou de fonction** : `python3 tools/gen_codemap.py` (écrit la carte). `python3 tools/gen_codemap.py --check` renvoie le code 1 si la carte est périmée. À lancer **avant de pousser**.
5. La carte ne contient **aucun numéro de ligne ni taille de fichier** (source de conflits de merge entre les deux développeurs). En cas de conflit sur `docs/carte/` : prendre n'importe quel côté, puis relancer le script.

## 2. Flux (vérifiés dans le code)

### Démarrage
`index.html` → **`src/boot.js`** (seul script référencé) :
1. affiche l'écran de chargement (`loading/bg.webp`, barre lissée, lignes de boot AGP) ;
2. lit `assets/manifest.json`, charge chaque asset en mémoire en **data-URI** ; `asset('sprites/x.png')` les rend accessibles (lève une erreur si le chemin n'est pas dans le manifeste) ;
3. charge les scripts de `src/scripts.json` **dans l'ordre** (`async=false`), puis retire l'écran de chargement.

Dernier script, **`src/main.js`** : `config` Phaser (400x700, `Scale.NONE`, scènes `[BootScene, GameScene, HomeScene]`), `fitUi()` (échelle `--ui-s`), puis `startGame()` : `CloudSave.boot(...)` → `new Phaser.Game(config)` (en `?dev` : expose `window.__game` et `window.__T`).
`BootScene.create` fabrique textures et animations puis `scene.start('game')` ; `GameScene.create` sans `autoStart` appelle `showStartScreen()`, qui **lance** la scène `home`.

### Accueil ↔ niveau
- Accueil : `HomeScene` (`scenes/HomeScene.js`) + méthodes dans `home/` (`ui.js` panneaux HTML `#home`, `galaxy.js` carte stellaire, `background.js` décor). Trois pages : HANGAR · CARTE · ARBRE (R&D = `ui/tree-ui.js`, méthodes de GameScene).
- `HomeScene.launchLevel` (`home/ui.js`) → `Motion.cover` (rideau GSAP ; repli : fondu caméra) → `gs.scene.restart({autoStart:true, levelId})` ou `{autoStart:true, tuto:true}` pour le tuto (niveau `w1-tuto`).
- `GameScene.create` : stats, atouts globaux, pactes, DOM ; avec `autoStart` il **endort** l'accueil (`scene.sleep('home')`) puis `startRun()` (`game/run.js`).
- Déroulé : intro de décollage (`game/intro.js`, état `introActive`/`introT`) → boucle (`game/loop.js`, `update`) → objectif et victoire (`game/level.js` : `levelInit/levelUpdate/levelProgress/levelWin`, qui appelle `endRun(true)` après 2,3 s) ou mort du vaisseau (`player/damage.js` → `endRun`).
- `endRun` (`game/run.js`) : fragments, `recordLevelClear`, `setMeta`, remplit le rapport `#gameover`. Boutons (`ui/dom.js`) : **ORDRE SUIVANT** `#btnNext` (restart sur le niveau suivant), **REFAIRE** `#btnRetry` (restart sur le même), **RETOUR** `#btnGoMenu` → `showStartScreen()` qui **réveille** `home` (`scene.wake`) ou la relance.
- Le tuto ramène à l'accueil par `scene.restart({toMenu:true})` (`game/tuto.js`, avec rideau `Motion.cover`).
- Partie infinie et bac à sable : `?dev` seulement (boutons DEV de `ui/dom.js`, `dev/sandbox.js`).

### Chaîne des stats (de la base au combat)
`makeDefaultStats` (`data/player-stats.js`) → modules R&D : `applyTree` dans `GameScene.create` (`node.apply(stats, rang)` pour chaque nœud de `ALL_TREE_NODES`, `data/skill-tree.js`) → succès `applyAchvBuffs` (`data/achievements.js`) → ascension `applyAscension` (`data/meta.js`) → pactes → en partie : cartes `UPGRADE_POOL` (`data/upgrades.js`, tirées par `levelUp` dans `player/progression.js`) → reliques et fusions (`data/relics.js`, `data/fusions.js`, `systems/relics-fusions.js`).
Tuto : stats repartent de `makeDefaultStats` (dégâts 14) + `applyTree` **seulement** (ni succès, ni ascension).

### Les deux familles d'atouts (ne jamais les mélanger dans une liste)
- **GLOBAUX** = modules du catalogue R&D, permanents, appliqués à chaque mission (`treeState`, `treeBonus`).
- **DE MISSION** = cartes, fusions, reliques choisies en partie, perdus en fin de mission.
Affichage : pause (onglets ATOUTS GLOBAUX / DE MISSION, `ui/pages.js`), transmission de début de mission (`normaStart`), rapport de fin (`endRun`), atelier. Test : `perks_test.py`. Les armes débloquées par l'arbre ne sont que **proposées** en cartes (flags `…Owned` dans `GameScene.create`).

### Sauvegardes
`SAVE_KEYS` (`core/cloud-save.js`) : liste des clés `localStorage` `ssx_*` (méta, succès, bestiaire, réglages…). `CloudSave` en fait un miroir cloud (`gather/sync/push`) ; elle n'envoie jamais une sauvegarde vide. `GameScene` enregistre à `pagehide`/`visibilitychange`. Accesseurs `getMeta/setMeta`… : voir `symboles.md`. **`?sandbox`** (`boot.js`) remplace `localStorage` par une mémoire jetable (utilisé par l'éditeur). Ne pas toucher aux formats de sauvegarde pour de l'habillage.

### HUD
HTML dans `index.html` (`#hud`), logique dans `ui/hud.js` (secousse, barres, rang de style) ; animation de la vie : `Motion.hudHp` (appelé depuis `hud.js`).

### N.O.R.M.A.
Textes : `data/agp-lore.js` (`AGP_LINES`). Moteur : `Norma` dans `ui/norma.js` + déclencheurs `normaStart/normaBoss/normaLow` (mixin GameScene dans le même fichier). Règles : **une transmission à la fois** (file `_q`, `_showing`), **14 s d'écart** par défaut (`o.gap`), `prio` passe devant, jamais pendant l'intro, les cartes, la pause ou l'écran de fin, jamais bloquante. Accueil : bandeau d'information `startTicker`.

### Audio
`audio/sfx-engine.js` (classe `Sfx`), `sfx-lib.js` (`SFX_LIB`, sons synthétiques), `sfx-files.js` (`SFX_FILES`, mp3 enregistrés qui remplacent le synthétique du même nom), `music.js` + `music-data.js` (musiques), `volume.js` (`VOL`), `scene-audio.js` (sons de mort, ambiance). Catalogue : `docs/catalogue-sons.md`.

### Éditeur de niveaux
`editor.html` (racine, `http://localhost:8080/editor.html`) pilote deux iframes du jeu (`?dev&edit=play|bot&sandbox=1`) via `dev/editor-hook.js` (inactif sans `?edit`). Réglages : défauts `data/tuning-defaults.js`, application `data/tuning-apply.js` (`applyTuning`), export **généré** `data/tuning.js`. Bot : `tools/sim/bot.js`. Doc : `docs/editeur-niveaux.md`.

## 3. Où trouver quoi

| Question | Où |
|---|---|
| Ordre de chargement / rôle d'un fichier | `docs/carte/fichiers.md`, `src/scripts.json` |
| Où est la fonction/constante X | `docs/carte/symboles.md` |
| Mondes et niveaux (ordres de mission) | `src/data/worlds/*.js`, `data/worlds.js`, déblocages `data/world-progress.js` |
| Compétences R&D | `data/skill-tree.js` ; UI `ui/tree-ui.js` ; doc `docs/arbre-competences.md` |
| Cartes de montée de niveau | `data/upgrades.js` ; tirage `player/progression.js` |
| Reliques / fusions | `data/relics.js`, `data/fusions.js`, `systems/relics-fusions.js` |
| Ennemis, escouades, boucliers, IA | `enemies/` (ex. `squads-shields.js`), art `data/enemy-art.js` |
| Boss (incidents majeurs) | `bosses/`, PV `data/bosses.js` |
| Événements en partie | `data/events.js`, `events/` |
| Équilibrage, menace, difficulté | `data/balance.js`, `data/meta.js`, `game/difficulty.js` |
| Dégâts reçus, mort | `player/damage.js` |
| Overdrive | `systems/overdrive.js` |
| Tuto | `game/tuto.js`, `data/tuning-*.js`, `data/completion.js` |
| Textes AGP / N.O.R.M.A. | `data/agp-lore.js`, `ui/norma.js` |
| Animations de menus | `ui/motion.js` (`Motion`, GSAP) |
| Menus HTML, boutons, pause, réglages | `ui/dom.js`, `ui/pages.js`, `index.html` |
| Accueil, carte stellaire, hangar | `home/`, `scenes/HomeScene.js`, `docs/menu-accueil.md` |
| Sauvegardes | `core/cloud-save.js` (+ accesseurs, voir `symboles.md`) |
| Constantes, config, mode DEV | `core/constants.js`, `core/config.js` (`DEV_SEE_ALL`) |
| Taille/échelle de l'écran | `main.js` (`fitUi`), `docs/responsive.md` |
| Style de l'interface | `css/style.css` puis `css/agp.css`, `docs/direction-artistique-agp.md` |
| Sons / musiques | `audio/`, `assets/audio/` |
| Assets (images, polices) | `assets/` + `assets/manifest.json` (régénérer : `tools/gen_manifest.py`) |
| Écran de chargement | `src/boot.js`, `loading/bg.webp` |
| Icône PWA | `manifest.webmanifest`, `icons/` |
| Build fichier unique | `tools/build.py` |

## 4. Conventions

- **`src/scripts.json`** : scripts classiques en portée globale partagée ; un fichier ne peut utiliser au démarrage que ce qui est défini plus haut. Tout nouveau fichier y est ajouté (sinon il n'est jamais chargé), puis relancer `gen_codemap.py`.
- **`"use strict";`** en tête de chaque fichier.
- **`mixin(GameScene, {…})`** (idem `HomeScene`) **plante au démarrage si une méthode est définie deux fois** (voulu) : Grep avant d'ajouter.
- **Vocabulaire AGP** : mondes = secteurs, niveaux = ordres de mission, boss = incidents majeurs, fragments = composants, écran de fin = rapport d'intervention. Ton subtil, jamais caricatural (`docs/brief-univers-agp.md`).
- **Zone de jeu 400x700 logiques**, mise à l'échelle d'un bloc par `fitUi()` : pas d'unités `vw/vh` ni de mesure de fenêtre dans l'interface, tout en px logiques.
- **CSS en deux couches** : `css/style.css` puis `css/agp.css` (chargée après, **agp gagne**).
- **Titres en majuscules sans accents** dans l'interface AGP (« INTERVENTION VALIDEE »). Les tests vérifient ces libellés.
- **Animations de menus** via `Motion` (GSAP), jamais en CSS concurrent sur `transform`. Sans effet si GSAP absent ou `prefers-reduced-motion`.
- **Image de chargement** `loading/bg.webp` **hors manifeste** : elle doit s'afficher avant le chargement des assets.
- Pas de plafond artificiel en gameplay ; ne jamais modifier mécaniques, équilibrage, sauvegardes ou compétences pour de l'habillage.

## 5. Pièges connus

- `home_test.py` : test fragile, double clic sur l'onglet CARTE avec 500 ms puis 1500 ms d'attente (`tabMap`). Un échec isolé là peut être du timing.
- macOS : `sed -i` exige `-i ''` ; préférer un petit script Python pour éditer. `python3` à la place de `py`.
- Zsh : un motif comme `--include=*.js` non entre guillemets échoue (« no matches found »).
- Le collègue pousse vite : **`git fetch` + `git merge origin/main` avant chaque push**, puis retester. Conflits fréquents sur `CLAUDE.md` et `css/agp.css` : garder les deux côtés. Sur `docs/carte/` : relancer le script.
- **GSAP et classe `.mo`** : `Motion.bindPress` ajoute `.mo` aux boutons ; `css/style.css` y désactive la transition CSS sur `transform` (GSAP l'anime). Ne pas ajouter de `transition: transform` sur ces éléments.
- Modes d'URL : **`?dev`** (tout débloqué, `window.__game`, `window.__T`, boutons DEV) · **`?sandbox`** (sauvegarde en mémoire) · **`?edit=play|bot`** (pont éditeur, dans une iframe uniquement).
- `file://` ne marche pas : toujours passer par `python3 tools/serve.py 8080`.
- Tests headless : dt clampé et FPS bas faussent les vitesses ; machine de test à 1 cœur, FPS non représentatifs.

## 6. Tests

Prérequis : Python 3 + `pip install playwright numpy`, Chrome, Node. Pas de lanceur unique : lancer le script voulu depuis la racine.

| Commande | Vérifie |
|---|---|
| `python3 tools/smoke_test.py` (`--dist` pour le fichier unique) | une partie se lance, aucune erreur JS (avant tout push) |
| `python3 tools/home_test.py` | accueil, carte, arbre, hangar |
| `python3 tools/level_test.py` | victoire/défaite par objectif, déblocages, sauvegarde |
| `python3 tools/perks_test.py` | atouts globaux vs atouts de mission |
| `node tools/check_worlds.js` | format et déblocages des mondes |
| `python3 tools/sim_balance.py grid\|campaign\|tune` | équilibrage par joueur automatique |
| `python3 tools/gen_codemap.py --check` | la carte du code est à jour |

Autres : `python3 tools/build.py` (build + `node --check`), `python3 tools/gen_manifest.py` (après ajout/suppression d'asset).
