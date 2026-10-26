# CLAUDE.md

Guide pour Claude Code (claude.ai/code) dans ce dépôt. État du projet et tâches en cours : `PASSATION.md`. Où se trouve chaque élément du code : `docs/carte-du-code.md`.

# Space Shooter X

> **CONTEXTE NARRATIF À LIRE EN PREMIER (tout agent, toute tâche touchant à l'interface, aux textes ou au ton)** : `docs/brief-univers-agp.md`. En résumé : an 2247, le joueur est un employé de l'**AGP (Agence Galactique de Propreté)** qui nettoie la galaxie avec une camionnette pourrie ; il découvre que l'agence a intérêt à garder la galaxie polluée. Ton : SF rétro-industrielle, humour noir et absurdité administrative, satire du travail, **subtil et lisible** (jamais une caricature). L'interface = logiciel de bord de l'AGP (AGP-OS) ; assistante embarquée **N.O.R.M.A.** (froide, polie, sarcastique, jamais bloquante en combat). Vocabulaire : mondes = secteurs, niveaux = ordres de mission, boss = incidents majeurs, fragments = composants, arbre = catalogue R&D, écran de fin = rapport d'intervention. **Lisibilité du combat prioritaire.** **Ne jamais modifier mécaniques, équilibrage, sauvegardes ni logique des compétences** pour de l'habillage ; toute idée de gameplay se présente à part. Réalisation visuelle : `docs/direction-artistique-agp.md`.

Jeu de tir spatial mobile (portrait) type Raiden / Archero / Vampire Survivors, Phaser 3, scripts classiques sans bundler, destiné à Android / Google Play (wrapper Capacitor ou TWA à faire). Dépôt GitHub `guetgr/SpaceShooterX`, partagé à deux.

## Équipe et préférences
- **Guet** (Gaëtan, Mac) et **Bio** (Bioleboss, Windows) : aucun des deux ne code, Claude fait tout. Français.
- Guet : vouvoiement, l'appeler « Guet », réponses courtes et sans remplissage, collaboration d'égal à égal, poser les questions qui manquent avant de se lancer.
- Bio : ton casual et direct, réponses courtes ; juge les sons à l'oreille (« trop fort / pas assez fort »).
- Les deux : fichiers complets et fonctionnels ; **pas de rustines** (aucun plafond artificiel d'ennemis, balles, régén, crits ; ne pas « accélérer le jeu » pour équilibrer : le joueur peut casser le jeu, mais par le temps et la réflexion ; l'optimisation vient à la fin) ; ressources gratuites uniquement ; dire ce qu'on va faire avant de coder quand c'est demandé.
- Assets : images générées par eux (ChatGPT, ComfyUI) à partir de briefs que Claude écrit ; musique Suno ; sons enregistrés/générés par Bio.

## Au début de chaque session
**Démarrer le serveur de dev tout de suite**, en arrière-plan, s'il ne tourne pas déjà :
- Mac (Guet) : `python3 tools/serve.py 8080`
- Windows (Bio) : `py tools/serve.py 8080` (ou `C:\Users\louel\AppData\Local\Programs\Python\Python311\python.exe tools\serve.py 8080` si `py` échoue — le `python` du PATH est le faux raccourci Microsoft Store).

Puis donner http://localhost:8080/?dev. `file://` ne marche pas. Faire `git pull` (ou `git fetch` + `git merge origin/main`) avant de commencer : l'autre pousse souvent.

## Carte du code (où est quoi)
Point d'entrée : **`docs/carte-du-code.md`** (flux vérifiés, table « où trouver quoi », conventions, pièges, tests). Index générés dans `docs/carte/` : **`symboles.md`** (nom → fichier, à consulter en premier), `fichiers.md`, `donnees.md`, `interface.md`, `audit.md`. Générés par `python3 tools/gen_codemap.py` ; `--check` échoue si la carte est périmée. **Règle : après tout ajout/suppression de fichier ou de fonction, et avant de pousser, relancer le script** (en cas de conflit sur `docs/carte/`, le relancer).

## Règles du code
- **Structure** : `index.html` (coque + HTML des menus/HUD) → `src/boot.js` (écran de chargement, charge `assets/manifest.json` en data-URI accessibles par `asset('sprites/x.png')`) → scripts de `src/scripts.json` **dans l'ordre** (portée globale partagée : un fichier n'utilise au démarrage que ce qui est défini plus haut ; tout nouveau fichier va dans `scripts.json`) → `src/main.js`.
- **Scènes** : `BootScene` (textures) → `GameScene` (le jeu, ~40 fichiers de méthodes en `mixin(GameScene, {…})`) ↔ `HomeScene` (accueil, méthodes dans `src/home/`). `mixin` plante au démarrage si une méthode est définie deux fois : Grep avant d'ajouter.
- **Boucle de jeu** : accueil → carte des secteurs → ordre de mission (`GameScene` avec `lvDef`, mondes dans `src/data/worlds/*.js`) → rapport d'intervention. Le tuto est le niveau `w1-tuto`. La partie infinie n'existe plus qu'en `?dev`. Détails : `docs/menu-accueil.md`.
- **Deux familles d'atouts, toujours distinctes** : GLOBAUX (modules R&D, permanents, appliqués à chaque mission et au tuto) et DE MISSION (cartes, fusions, reliques de la partie). Ne jamais les mélanger dans une liste. Test : `tools/perks_test.py`.
- **Zone de jeu 400x700 logiques** mise à l'échelle d'un bloc par `fitUi()` : jamais de `vw/vh` ni de mesures de fenêtre dans l'interface (`docs/responsive.md`).
- **CSS en trois couches** : `css/style.css` → `css/agp.css` (habillage AGP) → `css/hud.css` (HUD en niveau) ; la dernière gagne. Le build les embarque toutes.
- **Interface** : titres en majuscules sans accents ; animations JS via `Motion` (`src/ui/motion.js`, GSAP ; la classe `.mo` coupe la transition CSS sur `transform`) ; **pas d'émojis ni de glyphes pour les symboles de l'interface** : sprites pixel `uiIco('nom', 12|24)` (`src/ui/ui-icons.js`, dessinés par `tools/gen_ui_icons.py`, aussi en CSS : `var(--ico-nom)`). Les icônes de compétences, cartes, reliques et pactes sont encore des émojis réduits en pixel (`pxImg`).
- **Textes N.O.R.M.A.** : `src/data/agp-lore.js` ; moteur `src/ui/norma.js` (une transmission à la fois, 14 s d'écart, jamais pendant intro, cartes, pause ou écran de fin).
- **Sauvegardes** : `SAVE_KEYS` (`src/core/cloud-save.js`, clés `ssx_*`) ; ne pas en changer le format.
- **Modes d'URL** : `?dev` (tout débloqué, `window.__game`, `window.__T`, boutons DEV) · `?sandbox` (sauvegarde en mémoire) · `?edit=play|bot` (pont de l'éditeur `editor.html`).
- **Tests de l'interface** : `home_test.py` et `level_test.py` vérifient des libellés AGP (« INTERVENTION VALIDEE », « ACCIDENT DU TRAVAIL », « ORDRE ANNULE », « NOUVEAU SECTEUR ») : les mettre à jour si on change ces textes.

## Outils et tests (dossier `tools/`, pas de lanceur unique)
- Prérequis : Python 3 + `pip install playwright numpy scipy pillow`, Chrome, Node (vérif syntaxe du build). Sur Mac `python3`, sur Windows `py`.
- **Avant chaque push** : `python3 tools/smoke_test.py` (une partie se lance sans erreur JS), `home_test.py`, `level_test.py`, `perks_test.py`, `node tools/check_worlds.js`, `python3 tools/gen_codemap.py --check`.
- `build.py` : fichier unique `dist/space-shooter-x.html` (+ `-dev`), vérif `node --check` ; `--inline-phaser` pour embarquer Phaser. `smoke_test.py --dist` le teste.
- `sim_balance.py grid|campaign|tune` : joueur automatique en avance rapide (équilibrage des niveaux).
- Assets : `gen_manifest.py` (après tout ajout/suppression dans `assets/`), `gen_ui_icons.py` (icônes d'interface), `import_sprites_niveaux.py <dossier>` (icônes de niveaux PNG), `import_decors_carte.py --w2 --w3 --nuages --orbite` (planètes, nuages, satellite de la carte), `cut_satgun.py` (planche du satellite armé).
- `editor.html` (racine) : éditeur de niveaux, export dans `src/data/tuning.js` (`docs/editeur-niveaux.md`).
- Machine de test lente (WebGL logiciel) : FPS non représentatifs ; en headless, `dt` clampé fausse les vitesses. Dans un `page.evaluate`, ne jamais renvoyer un objet Phaser (sérialisation infinie) : terminer par `return 0`.

## Git
- Une branche par sujet, commits petits, PR vers `main`. Avant de pousser : `git fetch` + `git merge origin/main`, résoudre les conflits en gardant les deux côtés (fréquents sur `CLAUDE.md`, `PASSATION.md`, `css/agp.css`), retester, relancer `gen_codemap.py`.
- Commiter et pousser seulement quand Guet ou Bio le demande.
- macOS : `sed -i` exige `-i ''` ; préférer un petit script Python pour éditer.

## Contrainte de taille
Build « fichier unique » ~22 Mo (la limite de 16 Mo des artifacts claude.ai ne permet plus de le publier là). Le jeu final doit rester raisonnable pour le Play Store : sons en mp3 mono 24–32 kbps, images en WebP.
