# PASSATION — Space Shooter X (état au 26 oct. 2026)

> **Contexte narratif et ton (AGP, N.O.R.M.A.) : lire `docs/brief-univers-agp.md`** avant de toucher à l'interface ou aux textes.

## 1. Où on en est
Jeu fonctionnel et très avancé : boucle complète (runs infinies par niveaux d'alerte, boss, événements, arbre de compétences, cartes, reliques, fusions, bestiaire, succès, pactes, classement local, bac à sable DEV). Dernières versions publiées sur claude.ai : jeu v150, DEV v71 (artifacts, déjà obsolètes dès que tu travailles en local — le code de `src/` est la référence).

### Refonte de structure (25 oct. 2026)
Le monolithe `index.html` (16 Mo, un seul script de ~9 400 lignes, tout en base64) a été découpé en ~70 fichiers dans `src/` (+ `css/`, `assets/` = vrais fichiers png/webp/mp3/woff2). Aucune logique modifiée : mêmes instructions, même ordre, `GameScene` répartie en mixins. Vérifié : 239/239 méthodes de GameScene présentes, partie qui tourne sans erreur JS en mode dev et en build fichier unique. Voir `README.md`. L'ancien fichier est dans `backups/index_monolithe_avant_split.html`.
Seuls changements de comportement : `DEV_SEE_ALL` vient de `?dev` dans l'URL (au lieu d'être réécrit par le build), et `window.__game` / `window.__T` sont exposés quand il vaut `true`.

### Fait dans la session précédente
- Audit des compétences de l'arbre (tout est branché ; armure/esquive/overdrive vérifiés).
- Documents : `docs/space-shooter-x-gameplay.md` (boucle détaillée), `docs/space-shooter-x-analyse.md` (équilibrage / cohérence / addictivité), `docs/catalogue-sons.md` (110 sons + sons enregistrés).
- Nouveau sprite joueur (camionnette) 4 paliers + décollage depuis la Terre (cinématique d'intro).
- Dérapage du vaisseau aux virages, de moins en moins marqué quand on améliore les réacteurs (vue de dessus uniquement ; les autres vues de la planche sont des vues iso de face, inutilisables sans vues 3/4 arrière).
- **Sons enregistrés** (47) intégrés en 4 lots : voir §4.

### Refonte accueil / mondes (25 oct. 2026, branche `menu-accueil`)
Accueil animé à 3 pages (Hangar · Carte · Arbre), carte stellaire, mondes → niveaux → boss, écran de résultat, arbre intégré à l'accueil, 3 apparences de la camionnette. **Voir `docs/menu-accueil.md`** (captures, fichiers, tests). Mondes 1-3 = brouillons à équilibrer (simulateur : `tools/sim_balance.py`). La partie infinie n'est plus qu'en `?dev` (bouton DEV). L'ascension et les anneaux d'alerte de l'arbre sont retirés de l'interface.

### Refonte interface (26 oct. 2026, branches `competences`, `animations-jeu`, `ecran-chargement`, `icone-pwa`, `direction-agp`)
- **Arbre en cartes** (onglets par branche, rangs en pastilles) à la place de l'arbre radial de 330 nœuds : `src/ui/tree-ui.js`. Mêmes données, mêmes sauvegardes. Analyse et pistes : `docs/arbre-competences.md`.
- **Animations GSAP** (`src/ui/motion.js`) : boutons, CTA, pages, cartes, compteurs de fragments, rapport de fin, HUD (traînée de vie, vie basse, tic du score).
- **Écran de chargement** avec image de fond (`loading/bg.webp`) et barre lissée ; **icône d'écran d'accueil** (`manifest.webmanifest`, `icons/`).
- **Direction artistique AGP-OS** (`docs/direction-artistique-agp.md`, captures dans `docs/img/agp/`) : l'interface est le logiciel de bord de l'Agence Galactique de Propreté (an 2247). Palette/composants dans `css/agp.css` (chargé après `style.css` ; le retirer redonne l'ancienne apparence), textes dans `src/data/agp-lore.js`, voix de **N.O.R.M.A.** (assistante embarquée, transmissions courtes) dans `src/ui/norma.js`. Vocabulaire : mondes = secteurs, niveaux = ordres de mission, boss = incidents majeurs, fragments = composants, arbre = catalogue R&D, écran de fin = rapport d'intervention. **Aucune mécanique, aucun équilibrage ni sauvegarde modifié.**
- Assets encore provisoires (CSS/texte) : logo AGP, visage de N.O.R.M.A., tampons, sons de transmission/impression/tampon (liste au §9 du doc AGP). Idées touchant au gameplay (primes/retenues, notation RH, syndicat…) : §10 du doc, non faites.
- Points d'attention : le build « fichier unique » n'a pas l'écran de chargement (il reste noir pendant l'analyse du fichier, ~21 Mo) ; pas de service worker (pas de mode hors ligne).

## 2. Contexte utilisateur
Bio, francophone, ne code pas. Veut un jeu agréable pour un petit revenu passif (Google Play), éventuellement d'autres jeux ensuite. Style pixel art rétro, contrôles au glissement du doigt. Assets graphiques via ChatGPT (prompts dans `docs/prompts-chatgpt-*.md`), musique via Suno (`docs/suno-prompts.md`, `docs/musique-suno.md`), sons enregistrés/générés par lui (gratuits uniquement). Philosophie d'équilibrage : voir CLAUDE.md (pas de plafonds artificiels).
Idée à rediscuter plus tard : mode overlay façon « Deskrawl » (plein écran transparent par-dessus les autres applis, bouton pause).

## 3. Mise en route sur le bureau
1. Ouvrir un terminal dans le dossier, lancer `claude` (il lira CLAUDE.md automatiquement). Dire : « lis PASSATION.md et CLAUDE.md ».
2. Prérequis outils : Python 3 + `pip install playwright numpy` ; Chrome ; ffmpeg (sons) ; Node.js (vérif syntaxe du build).
3. `serve.bat` (ou `python tools/serve.py`) puis http://localhost:8080/?dev pour jouer (tout débloqué). F5 après chaque modification.
4. `python tools/build.py` → `dist/…` (fichier unique, pour publier). Phaser est local (`vendor/phaser.min.js`) ; le build le référence via CDN sauf `--inline-phaser`.

## 4. Sons enregistrés (SFX_FILES) — 47
- Lot 1 : laser, lightning (pk .13 — trop fort avant), missile, pulsar, swarmMissile, thunder, blackHole, droneShot, bounce.
- Lot 2 : bombBoom, nukeBoom, nuke, galaxyBlast, reflect, dodge, odCharge, overdrive, hitEnemy (fichier « hitEnnemy »), hitHeavy, shieldHit, shieldBreak, decoyPop, rock, tentacleCut, partBreak, bombDrop, **odEnd = odCharge à l'envers avec volume décroissant**.
- Lot 3 : boomMed, boomBig, kamikazeBoom, mineBoom, strikeWarn, strikeBoom, heavyShot, enemyShot, spreadShot, snipeShot (« sniperShot »), snipeCharge (« sniperCharge »), healerPulse, webShoot, boomSmall.
- Lot 4 : kamiCharge, motherCharge, goldenSpawn (pk .10 volontairement bas ; fichier « goldenSpwan » de 47 s → 2,5 s), gemBig, gem, mineDrop.
- Toujours synthétiques : slowField (Bio dit « c'est le son des tirs ennemis qui te ralentissent » — aucun fichier reçu, à clarifier) et le reste des 110.
- Les niveaux (`pk`) ont été réglés **à l'aveugle** : Bio dira « trop fort / pas assez ». Ajuster `pk` dans `SFX_FILES`.
- Pipeline : `tools/cut*.py` (découpe start/end/fade, normalise, mp3 mono → base64 → json). Les json `tools/sfx_files*.json` contiennent les data-URI d'origine (historique). **Depuis le découpage, les sons sont des fichiers `assets/audio/sfx/<nom>[_n].mp3`** : pour modifier un son, remplacer le fichier mp3 (plus besoin de base64 ni de toucher au code) ; le niveau `pk` etc. se règle dans `src/audio/sfx-files.js`.
- Chemins des scripts : écrits pour le conteneur (`/mnt/user-data/attachments/...`, `/tmp/snd`) → **adapter `A=` et les dossiers `out/`** ; sources mp3 dans `sources/sons-sources/` (nommées `<hash>-<nom>.mp3`).
- Idée possible : mode `jit` (variation par prise) non implémenté dans `playFile`.

## 5. Tests
- Mode DEV (`?dev` ou build `-dev`) : expose `window.__T = {ALL_TREE_NODES, UPGRADE_POOL, RELICS, FUSIONS, sfx}` et `window.__game`.
- Scène : `window.__game.scene.scenes.find(s=>s.startRun)`. Lancer une run : clic `#btnStart`. Bac à sable : `#btnSandbox` (DEV seulement ; `sc.introActive=false`, `sc.sbAI=true`). Finir l'intro : `sc.introT=99999`.
- Test de fumée : `python tools/smoke_test.py` (ou `--dist`). Il sert de modèle pour d'autres tests. Autres exemples ponctuels dans `tools/` (skills3.py = audit compétences, drift2.py = dérapage, intro2.py = intro Terre, prof.py = profilage, sfxtest.py) : écrits pour l'ancien monolithe, chemins à adapter.
- Vérif syntaxe : faite automatiquement par `tools/build.py` (`node --check`).

## 6. À faire / questions ouvertes
- Interface AGP : produire les assets listés (doc AGP §9), valider le ton de N.O.R.M.A., tester sur de vrais téléphones (rythme des animations, lisibilité du HUD).
- Écran de chargement statique pour le build fichier unique ; éventuel service worker (hors ligne).
- Réécouter tous les sons, ajuster niveaux ; clarifier slowField.
- Page d'audition des sons dans le build DEV (proposée, pas faite).
- Équilibrage : simulateur + journal de fin de run (proposés, voir analyse) ; plafonds d'armure de l'arbre (0.6/0.75/0.8, relique `r_phase` min 0.8) = décision de Bio en attente ; boss final à l'alerte 26 (cap actuel 20) ; listes d'ennemis par alerte.
- Musiques : dernières pistes à recevoir de Bio (Suno).
- Vues 3/4 arrière du van pour de vrais virages visuels : prompt ChatGPT à écrire (proposé, pas demandé formellement).
- `r_vent` ajoute les charges d'esquive sur la scène, pas dans les stats (bizarrerie connue).
- Optimisation / profilage en boucle à la fin (aucun plafond d'entités pour l'instant, volontairement).
- Wrapper Android (Capacitor ou TWA), leaderboard en ligne, publication Play Store, éventuel mode overlay.
- Deux artifacts doublons sur claude.ai (Uq3ke5XSPyaaHafGWrUmw7, 5kSZAsLoNthzAzStBFxLrr) à supprimer si Bio confirme.
- Taille du build fichier unique : ~16 Mo (limite 16 Mo des artifacts claude.ai). Gérer en local selon besoin.
- Git : le dépôt est sur GitHub (`guetgr/SpaceShooterX`) ; travail par branches (voir `README.md`).
- Équilibrage des niveaux (courbe de difficulté, économie, `hpMul`/`dmgMul`) : voir `docs/menu-accueil.md` § État.

## 7. Contenu du dossier
- `index.html` + `css/` + `src/` — **le jeu** (source de vérité, voir README.md).
- `assets/` — fichiers utilisés par le jeu (sprites, sons, polices) + `manifest.json`.
- `sources/` — fichiers d'origine non utilisés directement : mp3 sources des sons, van/Terre, planches de sprites, images envoyées par Bio, maquettes UI (`ui-*.html`).
- `vendor/` — Phaser 3.70.0.
- `CLAUDE.md`, `PASSATION.md`, `README.md` — contexte et mode d'emploi.
- `docs/` — gameplay détaillé, analyse d'équilibrage, catalogue des sons, niveaux d'alerte, déroulé de partie, rapport d'équilibrage, prompts ChatGPT (sprites, boss), prompts Suno.
- `tools/` — serveur, build, tests, découpe des sons.
- `backups/` — monolithe d'avant le découpage + version d'avant le lot 4 de sons (16 Mo chacun, non versionnés).

## 8. Pièges connus
- Plus de fichier géant : les assets sont de vrais fichiers. Le chargeur (`src/boot.js`) nécessite un serveur HTTP (pas de file://).
- Ordre de `src/scripts.json` : un fichier mal placé = `ReferenceError` au démarrage (const utilisée avant d'être définie).
- Texture Terre : filtre LINEAR forcé dans `introEarthInit` (le jeu est en NEAREST par défaut).
- Test headless : dt clampé → la vitesse peut être faussée en FPS bas ; utiliser le vrai delta.
