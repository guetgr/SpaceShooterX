# PASSATION — Space Shooter X (état au 25 oct. 2026)

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
- Git : le dépôt n'est pas encore initialisé (Git n'était pas installé sur la machine) — étapes dans `README.md`.

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
