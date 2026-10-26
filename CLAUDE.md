# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Space Shooter X

> **CONTEXTE NARRATIF À LIRE EN PREMIER (tout agent, toute tâche touchant à l'interface, aux textes ou au ton)** : `docs/brief-univers-agp.md` (brief d'origine). En résumé : an 2247, le joueur est un employé de l'**AGP (Agence Galactique de Propreté)** qui nettoie la galaxie avec une camionnette pourrie ; il découvre que l'agence a intérêt à garder la galaxie polluée. Ton : SF rétro-industrielle, humour noir et absurdité administrative, satire du travail, **subtil et lisible** (jamais une caricature). L'interface = logiciel de bord de l'AGP (AGP-OS) ; assistante embarquée **N.O.R.M.A.** (froide, polie, sarcastique, jamais bloquante en combat). Vocabulaire : mondes = secteurs, niveaux = ordres de mission, boss = incidents majeurs, fragments = composants, écran de fin = rapport d'intervention. **Lisibilité du combat prioritaire** (HUD léger, rien d'opaque). **Ne jamais modifier mécaniques, équilibrage, sauvegardes ni logique des compétences** pour de l'habillage ; toute idée de gameplay se présente à part. Réalisation : `docs/direction-artistique-agp.md`.


Jeu de tir spatial type Raiden / Archero / Vampire Survivors (endless + boss), Phaser 3, destiné à Android / Google Play (wrapper Android à faire).
**Le code est découpé en modules** (`src/`, scripts classiques, pas de bundler) — voir `README.md` pour l'organisation, le lancement, l'ajout de fichiers/assets et le travail Git à deux. Lire aussi `PASSATION.md` (état complet) et `docs/space-shooter-x-gameplay.md` (boucle de gameplay détaillée).
L'ancien monolithe (un seul `index.html` de 16 Mo) est conservé dans `backups/index_monolithe_avant_split.html` (non versionné).

## Structure du jeu (depuis l'accueil à mondes)
Plus de partie infinie comme mode principal : **accueil (HomeScene) → carte des mondes → niveau (GameScene avec `lvDef`) → écran de résultat**. Détails, fichiers et tests : `docs/menu-accueil.md`.
En niveau, `alertLevel` = menace fixée par le niveau (`threat`), plus par l'arbre ; la partie infinie reste accessible en `?dev` (bouton DEV). Mondes/niveaux : `src/data/worlds/*.js` (brouillons). Le tuto est le niveau 1 du monde 1 (`w1-tuto`, type `tuto`, `src/game/tuto.js`) : sans `lvDef`, lancé par `tuto:true`. Le revenu de combat en niveau est réduit par `LEVEL_FRAG_MUL` (`data/balance.js`).
Sur Mac : `python3` à la place de `py` pour les commandes ci-dessous. Pas de npm/bundler/lint : Python 3 (+ `pip install playwright numpy`), Node (vérif syntaxe du build) et Chrome suffisent. `file://` ne marche pas : toujours passer par le serveur.

**Habillage AGP (branche `direction-agp`)** : l'interface est le logiciel de bord de l'Agence Galactique de Propreté (AGP-OS). Palette, composants et écrans : `docs/direction-artistique-agp.md` ; couche CSS : `css/agp.css` (chargée après `style.css`) ; textes et voix de N.O.R.M.A. : `src/data/agp-lore.js` + `src/ui/norma.js`. Les libellés de l'interface suivent ce vocabulaire (secteurs, ordres de mission, composants, rapport d'intervention).

## Interface : où est quoi (accueil, arbre, animations, chargement, icône)
- **Animations de menus** : GSAP (`vendor/gsap.min.js`, gratuit) via `src/ui/motion.js` (objet `Motion` : retour tactile des boutons, CTA qui respire, pages/cartes en cascade, compteurs, rapport de fin, HUD). Sans effet si GSAP absent ou `prefers-reduced-motion`. Le build l'embarque (`--inline-phaser`) ou le charge depuis cdnjs.
- **Arbre de compétences** (page R&D) : une page par branche, une carte par compétence, rangs en pastilles, fiche + achat en bas (`src/ui/tree-ui.js`). Données/coûts/déblocages inchangés (`data/skill-tree.js`). Fonctionnement et pistes d'amélioration : `docs/arbre-competences.md`.
- **Écran de chargement** : `src/boot.js` (image `loading/bg.webp`, hors `assets/` volontairement : elle doit s'afficher avant le manifeste ; barre lissée ; lignes de boot AGP).
- **Icône d'écran d'accueil** (PWA) : `manifest.webmanifest` + `icons/` (iPhone 180 px, Android 192/512 + maskable). Pas de service worker : le jeu s'installe mais exige le réseau. HTTPS requis.
- **Typographie** : définie dans `css/style.css` (`SSX Display` = Jersey 15, `SSX Label`/`SSX Text` = Chakra Petch), tailles calées sur l'ancien jeu (`size-adjust`).
- **Responsive (téléphone, tablette, PC)** : la zone de jeu fait toujours **400x700 logiques** (`#game-container`, Phaser en mode `NONE`) et est mise à l'échelle d'un bloc par `fitUi()` (`src/main.js`, variable CSS `--ui-s`) : canevas et HTML partagent le même repère, donc même mise en page et même lisibilité partout (bandes sombres autour). Ne pas utiliser d'unités `vw/vh` ni de mesures de fenêtre dans l'interface : tout se règle en px logiques sur 400x700. Détails : `docs/responsive.md`.
- **Tests de l'interface** : `home_test.py` et `level_test.py` vérifient des libellés AGP (« INTERVENTION VALIDEE », « ACCIDENT DU TRAVAIL », « ORDRE ANNULE », « NOUVEAU SECTEUR ») : les mettre à jour si on change ces textes.

## Au début de chaque session / message
**Démarrer le serveur de dev tout de suite** (sans attendre qu'on le demande), en arrière-plan : `py tools/serve.py 8080` (ou `C:\Users\louel\AppData\Local\Programs\Python\Python311\python.exe tools\serve.py 8080` si `py` échoue — le `python` du PATH est le faux raccourci Microsoft Store). Ne pas relancer s'il tourne déjà. Donner ensuite http://localhost:8080/?dev.

## Préférences de Bio (utilisateur)
- Français, ton casual, direct, peu de patience. Réponses courtes. Bio ne code pas : Claude fait tout.
- Toujours livrer des fichiers complets et fonctionnels, pas des bouts d'édition.
- Pas de rustines paresseuses : aucun plafond/limite artificiel (ennemis, balles, régén, crits), ne pas « accélérer le jeu » pour équilibrer. Le joueur peut casser le jeu, mais par le temps et la réflexion. L'optimisation vient à la fin.
- Dire ce qu'on va faire avant de coder s'il le demande. Ressources gratuites uniquement.
- Sons : il les enregistre/génère lui-même et les envoie par lots ; il juge « trop fort / pas assez fort » à l'oreille.

## Structure du code (tout est en portée globale partagée, ordre = `src/scripts.json`)
- `index.html` (coque + HTML du menu/HUD) → `src/boot.js` charge `assets/manifest.json` (tous les assets en mémoire, accessibles par `asset('sprites/x.png')` = data-URI) puis les scripts dans l'ordre de `src/scripts.json`.
- **Ordre de chargement** : un fichier ne peut utiliser au démarrage (hors fonctions appelées plus tard) que ce qui est défini plus haut dans `scripts.json`. Toujours ajouter un nouveau fichier à `scripts.json`.
- `GameScene` : `src/scenes/GameScene.js` (constructor + create) + ~35 fichiers de méthodes en `mixin(GameScene, { … })` rangés par sujet (`game/`, `player/`, `enemies/`, `bosses/`, `combat/`, `events/`, `systems/`, `world/`, `fx/`, `ui/`, `dev/`, `audio/scene-audio.js`). Pour trouver une méthode : Grep sur son nom.
- Sons : classe `Sfx` (`audio/sfx-engine.js`), `SFX_LIB` (`audio/sfx-lib.js`, 110 sons synthétiques, `play(name,p)`). **`SFX_FILES`** (`audio/sfx-files.js`) : sons enregistrés (mp3 dans `assets/audio/sfx/`) qui remplacent la version synthétique du même nom ; décodés par `loadFiles()`, joués par `playFile()` (pk = niveau de crête, rv = envoi réverb, tier = pitch selon niveau d'arme, `d` = prises tirées au hasard). L'anti-spam `lim` de SFX_LIB s'applique toujours. 47 sons enregistrés à ce jour.
- Musique : `audio/music-data.js` (`MUSIC_FILES`) + `audio/music.js` (`MusicLoop`, `FileMusic`, `MUSIC_SLOTS`, `MUSIC_BOSS`).
- Événements : `data/events.js` (`EVENT_DEFS`), `events/` (`startEvent(kind,dur)`). Alertes / équilibrage : `data/balance.js`, `data/meta.js` (`ALERT_THRESHOLDS`, `ASCEND_MIN`), `data/bosses.js` (`BOSS_HP_BY_ALERT`), `game/difficulty.js` (`hpScaleNow`, `enemyDmgMul`).
- Boucliers ennemis / IA : `enemies/squads-shields.js` (`updateEnemyShields`, `auraTexFor`, `shieldShatter`, `updateDodge`, `updateSquads`).
- Overdrive : `systems/overdrive.js` (`odPower()`), `player/damage.js` (`damagePlayer` sort tôt si `odActive>0`).
- Arbre : `data/skill-tree.js` (`ALL_TREE_NODES`). Cartes : `data/upgrades.js` (`UPGRADE_POOL`). Reliques : `data/relics.js`. Fusions : `data/fusions.js`.
- Joueur : camionnette (van) 270×300 WebP, 4 paliers T1–T4 (`PLAYER_BASE/T2/T3/T4_B64` dans `data/image-assets.js`), pods/lueurs dessinés en code. Dérapage : bloc « drift » dans `update` (`game/loop.js`), réduit avec `stats.moveResponsiveness`.
- Intro : décollage depuis la Terre (`game/intro.js`, constantes `INTRO_E_A/B/C` dans `core/constants.js`, texture `earth`) ; le bac à sable (`dev/sandbox.js`) garde l'ancienne intro courte.
- Sauvegarde : `SAVE_KEYS` (`core/cloud-save.js`, localStorage `ssx_*`).
- Mode DEV : `?dev` dans l'URL (ou build `-dev`) → `DEV_SEE_ALL = true`, expose `window.__game` et `window.__T` (`ALL_TREE_NODES, UPGRADE_POOL, RELICS, FUSIONS, sfx`). Les `const` de haut niveau sont aussi utilisables directement dans `page.evaluate`.

- Mixins : `mixin(GameScene, {…})` plante au démarrage si une méthode est définie deux fois (voulu) — ne pas redéfinir, chercher d'abord avec Grep. L'accueil suit le même principe : `HomeScene` + méthodes dans `src/home/` (voir `docs/menu-accueil.md`).
- Hooks de test (`?dev`) : scène de jeu = `window.__game.scene.scenes.find(s=>s.startRun)` ; lancer une run = clic `#btnStart` ; bac à sable = `#btnSandbox` ; finir l'intro = `sc.introT=99999`. Tests headless : dt clampé, FPS bas faussent la vitesse.

## Outils (dossier tools/)
- `serve.py` / `serve.bat` : serveur local sans cache (`http://localhost:8080/?dev`).
- `editor.html` (racine) : éditeur de niveaux (réglages en direct, TESTER, bot, EXPORTER → `src/data/tuning.js`) : `http://localhost:8080/editor.html`, voir `docs/editeur-niveaux.md`. Les réglages du tuto vivent dans `TUTO_TUNE` (`data/tuning-*.js`), pas en dur dans `tuto.js`.
- `build.py` : génère `dist/space-shooter-x.html` (prod) et `dist/space-shooter-x-dev.html` (DEV) en un seul fichier + vérif de syntaxe (Node). Option `--inline-phaser`.
- `smoke_test.py` : test headless (playwright + Chrome) — lance une partie, échoue si erreur JS. À lancer avant tout push. `--dist` pour tester le fichier unique.
- Autres tests : `node tools/check_worlds.js` (format/déblocages des mondes), `python3 tools/level_test.py` (victoire/défaite par objectif), `python3 tools/home_test.py` (accueil, carte, arbre, hangar), `python3 tools/sim_balance.py grid|campaign|tune` (joueur auto en avance rapide, équilibrage). Pas de lanceur de test unique : lancer le script voulu directement.
- `gen_manifest.py` : régénère `assets/manifest.json` après ajout/suppression d'un asset.
- `cut.py … cut4.py` : pipeline de découpe des sons (ffmpeg + numpy) ; les sources mp3 sont dans `sources/sons-sources/` (chemins des scripts à adapter). `skills3.py`, `drift2.py`, `intro2.py`, `prof.py`, `sfxtest.py` : exemples de tests ponctuels écrits pour l'ancien monolithe (chemins `/tmp/...` à adapter).
- Machine de test à 1 cœur / WebGL logiciel : les FPS ne sont pas représentatifs d'un téléphone.

## Contrainte de taille
Le build « un seul fichier » fait ~16 Mo (limite des artifacts claude.ai : 16 Mo, donc pas d'artifact avec l'inline Phaser). En local la limite n'existe plus, mais le jeu final doit rester raisonnable pour le Play Store. Sons recompressés mp3 mono 24–32 kbps.

## Flux de travail
1. Modifier les fichiers de `src/` (petits Edit ciblés), `F5` sur `http://localhost:8080/?dev`.
2. `python tools/smoke_test.py` (et `python tools/build.py` + `smoke_test.py --dist` avant une livraison).
3. Git : commits petits, `git pull` avant de commencer (le projet est partagé avec un collègue).

## Points ouverts
Voir PASSATION.md §À faire.
