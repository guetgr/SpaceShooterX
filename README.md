# Space Shooter X

Jeu de tir spatial (type Raiden / Vampire Survivors : runs infinies, boss, arbre de compétences), en **Phaser 3**, pensé pour Android / Google Play.

Le code est découpé en petits fichiers JavaScript « classiques » (pas de bundler, pas de npm) : on modifie un fichier, on rafraîchit la page.

## Lancer le jeu

Prérequis : **Python 3** (et Chrome).

```
serve.bat                      (Windows : double-clic)
python tools/serve.py          (partout ailleurs)
```

Puis ouvrir <http://localhost:8080/> (jeu normal) ou <http://localhost:8080/?dev> (**mode DEV** : tout débloqué, bac à sable, outils de test).
Le serveur désactive le cache : après une modification, un simple F5 suffit.

> Ouvrir `index.html` en double-clic (file://) ne marche pas : le navigateur interdit de charger les fichiers. Il faut passer par `serve.bat`.

## Organisation

```
index.html          page coque (HTML du menu/HUD) — charge src/boot.js
css/style.css       styles
vendor/             Phaser (copie locale, pas besoin d'internet)
assets/             images, sons, polices utilisés par le jeu  (+ manifest.json = liste des fichiers)
sources/            fichiers d'origine non utilisés par le jeu : mp3 sources des sons, planches ChatGPT, maquettes UI
docs/               documentation de conception (gameplay, équilibrage, sons, prompts…)
tools/              serveur, build, tests, scripts de découpe des sons
src/
  boot.js           chargeur : charge les assets puis les scripts listés dans scripts.json
  scripts.json      ORDRE DE CHARGEMENT des fichiers (important : voir plus bas)
  main.js           point d'entrée (config Phaser, démarrage)
  core/             config, constantes, sauvegarde cloud, garde-fous d'entrée, mixin
  data/             données pures : stats, arbre de compétences, cartes, reliques, fusions, boss, succès, événements, équilibrage
  gfx/              sprites dessinés en code, textures procédurales, constructeurs de textures
  audio/            moteur de sons, sons enregistrés, bibliothèque synthétique, musique
  ui/               icônes pixel, interface HTML, pages de menu, arbre, HUD
  scenes/           BootScene (chargement), GameScene (la scène de jeu) et HomeScene (l'accueil)
  home/             méthodes de HomeScene : décor, carte stellaire, panneaux (voir docs/menu-accueil.md)
  game/ player/ enemies/ bosses/ combat/ events/ systems/ world/ fx/ dev/
                    les méthodes de GameScene, rangées par sujet
```

### GameScene en plusieurs fichiers
`GameScene` est une grosse classe (~240 méthodes). `src/scenes/GameScene.js` ne contient que `constructor` et `create`.
Les autres méthodes sont dans les dossiers `game/`, `player/`, `enemies/`, `bosses/`… sous la forme :

```js
mixin(GameScene, {
  maMethode(){ ... },
  uneAutre(x){ ... },     // virgule entre les méthodes !
});
```

Pour une nouvelle méthode : l'ajouter dans le fichier du bon sujet, ou créer un nouveau fichier et l'ajouter à `src/scripts.json` (après `scenes/GameScene.js`). Une méthode définie deux fois fait planter au démarrage (volontaire, pour éviter les écrasements silencieux).

### Ajouter un fichier JS
1. Créer `src/<dossier>/mon-fichier.js`, première ligne `"use strict";`.
2. L'ajouter dans `src/scripts.json` **au bon endroit** : les fichiers sont exécutés dans l'ordre ; un fichier ne peut utiliser au démarrage que ce qui est défini plus haut dans la liste (les fonctions appelées plus tard, pendant le jeu, n'ont pas cette contrainte).
3. Tout est partagé (comme avant, c'est une seule portée globale) : pas d'`import`/`export`.

### Ajouter une image ou un son
1. Déposer le fichier dans `assets/sprites/` ou `assets/audio/…`.
2. `python tools/gen_manifest.py` (met à jour `assets/manifest.json`).
3. Dans le code : `asset('sprites/mon_sprite.png')` renvoie le fichier sous forme de data-URI, utilisable comme avant (`textures.addBase64`, sons…).

Les sons enregistrés sont réglés dans `src/audio/sfx-files.js` (niveau `pk`, réverb `rv`…).

## Version « un seul fichier » (publication)

```
python tools/build.py                  # dist/space-shooter-x.html + dist/space-shooter-x-dev.html
python tools/build.py --inline-phaser  # embarque aussi Phaser (hors-ligne)
```
Tout (code, CSS, images, sons, polices) est embarqué dans un seul `.html` (~16 Mo). `dist/` n'est pas versionné.

## Tester

```
pip install playwright
python tools/smoke_test.py          # lance le jeu en dev, démarre une partie, échoue s'il y a une erreur JS
python tools/smoke_test.py --dist   # pareil sur le fichier unique de dist/
```
À lancer avant chaque push. Autres tests : `node tools/check_worlds.js`, `python tools/level_test.py`, `python tools/home_test.py`.
Équilibrage : `python tools/sim_balance.py grid|campaign|tune` (joueur automatique en avance rapide, voir l'en-tête du fichier).

## Travailler à deux avec Git

Installer Git (<https://git-scm.com/download/win>), puis, une seule fois, dans ce dossier :

```
git init -b main
git add .
git commit -m "Découpage du monolithe en modules"
git remote add origin <URL du dépôt GitHub/GitLab>
git push -u origin main
```

Au quotidien :
```
git pull                       # récupérer le travail de l'autre
git switch -c ma-fonctionnalite
... modifier, tester (smoke_test) ...
git add -A && git commit -m "Ce que j'ai fait"
git push -u origin ma-fonctionnalite    # puis pull request / merge
```

Conseils pour éviter les conflits : se répartir les dossiers (ex. l'un `bosses/` + `events/`, l'autre `ui/` + `player/`), commits petits et fréquents, `git pull` avant de commencer. `src/scripts.json` et `assets/manifest.json` sont les deux fichiers « partagés » : une ligne par fichier, les conflits y sont faciles à résoudre.
Les fichiers lourds (`sources/`, ~50 Mo d'images et mp3) sont versionnés ; `dist/` et `backups/` ne le sont pas.

## Documentation
- `CLAUDE.md` / `PASSATION.md` : contexte du projet pour Claude Code et état d'avancement.
- `docs/menu-accueil.md` : l'accueil, les mondes, la progression (avec captures d'écran).
- `docs/` : conception (boucle de gameplay, niveaux d'alerte, équilibrage, sons, prompts d'assets).
