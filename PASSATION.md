# PASSATION — Space Shooter X (état au 26 oct. 2026)

> Lire d'abord `CLAUDE.md` (règles), `docs/bible-univers.md` (bible de l'univers, référence du lore), `docs/brief-univers-agp.md` (ton de l'interface), puis `docs/carte-du-code.md` (où est quoi).

> **Refonte de la progression en cours (branche `progression-agp`, 27 oct. 2026)** : design `docs/superpowers/specs/2026-10-27-progression-design.md`, plan `docs/superpowers/plans/2026-10-27-progression-agp.md`. Étape 1 (composants visibles) et 6a (textes des secteurs 2 et 3) faites ; étapes 2 à 5 (atelier, R&D par technologie, emplacements, plans, livrées) à planifier une par une.

> **Garage en pause (27 octobre 2026)** : lire [docs/REPRISE-GARAGE.md](docs/REPRISE-GARAGE.md) pour l’état de la branche `codex/atelier-personnalisation`, les assets validés et la suite prévue.

## 1. Où on en est
Jeu complet et jouable sur navigateur (mobile portrait), habillé dans l'univers AGP. Boucle : **accueil → carte des secteurs → ordre de mission → rapport d'intervention**, avec catalogue R&D (arbre), cartes de montée de niveau, reliques, fusions, boss, événements, succès, pactes, bestiaire. **3 secteurs, 16 niveaux** (tuto + 5 par secteur), encore à équilibrer. La partie infinie n'existe plus qu'en `?dev`.

### Branches
- `main` contient tout, jusqu'au **HUD en niveau** (PR #25).
- `hud-agp` ne porte plus que la réécriture de `CLAUDE.md` / `PASSATION.md` : **PR vers `main` à ouvrir**.
- Les autres branches distantes (`menu-accueil`, `direction-agp`, `responsive`, `carte-du-code`, `carte-monde-vivante`…) sont fusionnées ; elles peuvent être supprimées sur GitHub.

## 2. Ce qui a été fait (du plus récent au plus ancien)
- **Composants visibles** (branche `progression-agp`) : les machines détruites lâchent des composants ◆ (icône : écrou AGP), ramassés à l'aimant, comptés dans le HUD sous le RENDEMENT ; pluies de composants à la mort des boss et du Trésorin, aspirées à la victoire. Rapport : composants récupérés + prime AGP (moitié des primes du niveau) en victoire, franchise d'accident de 30 % en défaite ou abandon ; le score ne rapporte plus de composants. Règles : `src/data/composants.js` (test `node tools/composants_test.js`), jeu : `src/world/composants.js`. Secteurs 2 et 3 renommés d'après la bible (LA CASSE LUNAIRE / LE BROYEUR, MARS, PLANETE POUBELLE / LE DIRECTEUR DE TRAITEMENT), employé n° 0042, transmissions N.O.R.M.A. de fin de secteur.
- **Secteur 1 : tous les boss et mobs sont dans le jeu** (branche `boss-antenne-mere`, fusionnée avec `main` le 27 oct.) : boss du tuto Antenne-Mère, La Météo (`w1-l1`), Araignée de tri (`w1-l2`), Le Réacteur (`w1-l3`), L'Anneau (`w1-l4`, 40 kills puis boss), Le PDG dans sa tour (`w1-l5`, avec jusqu'à 3 vaisseaux de protection « Le PDG » qui lâchent chacun un agent de sécurité gelé) ; mobs Bras écartés, Pilleur de cristaux (aspiration + laser alimenté), Éclaireur de patrouille (verrouillage : tant qu'il te tient, les tirs des autres ennemis visent le joueur). Chaque boss est autonome (`src/bosses/*.js`, état `this.ar/mt/rx/an/pd`), avec jeu de lumières, états d'usure, pièces découpées dans le sprite et sons réels adoucis. Détails et fichiers : section « Boss et mobs du monde 1 » de `CLAUDE.md`. Assets produits par `sprite-factory/tools/make_*_assets.py` (hors dépôt). **Valeurs d'équilibrage PROVISOIRES** (PV, dégâts, cadences) : à régler en jouant.
- **HUD en niveau** (`css/hud.css`, `src/ui/hud.js`) : portrait de la camionnette + grade, barres de coque / bouclier / expérience épaisses et brillantes (coque chiffrée), rendement en gros chiffres, pause en relief, ordre de mission en jauge avec icône du type d'objectif, jauge de boss assortie, voile sombre en haut. Effets : flash + secousse à l'impact, éclat vert au soin, alerte coque, reflet, montée de grade, parallaxe légère (`updateHudSway`). `smoke_test.py` attend que le jeu soit vraiment démarré.
- **Icônes d'interface en sprites** : cadenas, coche, composants (◆), étoile, crâne, pause, engrenage, flèches, pastilles, trophée, main, chrono, réticule → `assets/sprites/ui_*.png` (12x12, `tools/gen_ui_icons.py`), utilisées par `uiIco()`.
- **Carte du monde vivante** : niveaux en médaillons avec icône (secteur 1 : `LEVEL_ICONS`), badges d'état, trace de la route ; planètes des secteurs 2 et 3 en images ; nuages qui défilent sur la Terre ; satellite en orbite (`theme.photo`, `theme.clouds`, `theme.orbiter` dans `src/data/worlds/*.js`).
- **Carte du code** : `docs/carte-du-code.md` + `docs/carte/` générés par `tools/gen_codemap.py` ; code mort et restes de l'ancien arbre radial supprimés, anciens scripts ponctuels de `tools/` retirés (historique Git).
- **Bio** : niveau 2 avec satellites (normal + armé, `cut_satgun.py`), dézoom progressif des niveaux (`levelZoom`), planète du secteur au menu et au décollage ; tuto à une seule boîte N.O.R.M.A. ; éditeur de niveaux (`editor.html`) ; « juice » du combat (arrêt sur image, secousses, impacts) ; typographie (Jersey 15 + Chakra Petch) ; nouvelles musiques et sons.
- **Avant** : atouts globaux / de mission séparés ; responsive (zone 400x700 mise à l'échelle d'un bloc) ; direction artistique AGP-OS et N.O.R.M.A. ; pause et paramètres en feuille modale ; écran de chargement ; icône PWA ; animations GSAP ; arbre en cartes par branche ; accueil à 3 pages et mondes ; découpage du monolithe en modules (25 oct.).

## 3. À faire / questions ouvertes
**Prochaines étapes proposées**
- **Refonte de la progression** : étapes 2 à 5 du design (sauvegarde v3 + atelier à 6 postes Mk I-V, R&D par technologie + emplacements 1→5, plans et pièces de secteur, distinctions RH → livrées), chacune avec son propre plan. Étape 6b : vagues des secteurs 2 et 3 selon la bible, boss Broyeur et Directeur (images à générer), planètes à échanger (la Casse lunaire affiche aujourd'hui une géante rouge, Mars une planète violette).
- **Simulateur** : `sim_balance.py campaign` saute désormais le tutoriel (le bot ne sait pas le jouer depuis le boss Antenne-Mère).
- Tester le HUD et la carte sur de **vrais téléphones** (lisibilité, rythme des animations, parallaxe).
- **Icônes manquantes** à faire générer (brief ComfyUI à écrire) : niveaux des secteurs 2 et 3 (à ajouter dans `LEVEL_ICONS`), objets en orbite des secteurs 2 et 3 (`theme.orbiter`), puis les ~100 icônes de compétences, cartes, reliques et pactes (aujourd'hui des émojis réduits en pixel). Import : `tools/import_sprites_niveaux.py`, `tools/import_decors_carte.py`.
- **Équilibrage des niveaux** (courbe de difficulté, économie, `hpMul`/`dmgMul`) avec `tools/sim_balance.py` ; voir `docs/menu-accueil.md` § État.

**Interface / contenu**
- Assets AGP encore provisoires (CSS/texte) : logo AGP, visage de N.O.R.M.A., tampons, sons de transmission/impression/tampon (doc AGP §9). Idées de gameplay du doc AGP §10 (primes/retenues, notation RH, syndicat…) : non faites, à proposer à part.
- Vues 3/4 arrière de la camionnette pour de vrais virages visuels (prompt à écrire).
- Écran de chargement statique pour le build fichier unique (il reste noir pendant l'analyse du fichier) ; éventuel service worker (hors ligne).

**Sons et musique**
- 63 sons enregistrés (`src/audio/sfx-files.js`, fichiers dans `assets/audio/sfx/`, catalogue `docs/catalogue-sons.md`) ; niveaux `pk` réglés à l'aveugle : Bio dira « trop fort / pas assez ». `slowField` toujours synthétique (à clarifier). Page d'audition des sons en DEV : proposée, pas faite.
- Dernières musiques Suno à recevoir.

**Équilibrage / technique**
- Plafonds d'armure de l'arbre (0.6/0.75/0.8, relique `r_phase` min 0.8) : décision de Bio en attente. `r_vent` ajoute les charges d'esquive sur la scène, pas dans les stats (bizarrerie connue).
- Optimisation / profilage à la fin (aucun plafond d'entités, volontairement).
- Wrapper Android (Capacitor ou TWA), leaderboard en ligne, publication Play Store ; idée de mode overlay façon « Deskrawl » à rediscuter.
- Deux artifacts doublons sur claude.ai (Uq3ke5XSPyaaHafGWrUmw7, 5kSZAsLoNthzAzStBFxLrr) à supprimer si Bio confirme.

## 4. Mise en route sur une nouvelle machine
1. Python 3 + `pip install playwright numpy scipy pillow` ; Chrome ; Node.js ; ffmpeg (sons).
2. `git clone` du dépôt, puis lancer `claude` dans le dossier et dire « lis CLAUDE.md et PASSATION.md ».
3. Serveur : `python3 tools/serve.py 8080` (Mac) ou `py tools/serve.py 8080` / `serve.bat` (Windows), puis http://localhost:8080/?dev (tout débloqué). F5 après chaque modification.
4. Livraison : `python3 tools/build.py` → `dist/` (fichier unique ; Phaser via CDN sauf `--inline-phaser`).

## 5. Contenu du dossier
- `index.html` + `css/` + `src/` : le jeu (source de vérité). `assets/` : sprites, sons, polices + `manifest.json`. `loading/` : image de l'écran de chargement (hors manifeste). `icons/` + `manifest.webmanifest` : icône PWA. `vendor/` : Phaser 3.70, GSAP.
- `docs/` : carte du code, univers AGP, direction artistique, accueil et mondes, arbre, responsive, éditeur, gameplay, équilibrage, sons, prompts (ChatGPT, Suno), captures (`docs/img/`).
- `tools/` : serveur, build, tests, simulateur, imports d'assets, carte du code.
- `sources/` : fichiers d'origine non utilisés directement (mp3 sources, planches, maquettes). `backups/` (non versionné) : ancien monolithe.

## 6. Pièges connus
- Ordre de `src/scripts.json` : un fichier mal placé = `ReferenceError` au démarrage.
- Pas de `file://` : le chargeur exige un serveur HTTP.
- `home_test.py` : test fragile sur le double clic de l'onglet CARTE (attente de 500 ms).
- Texture Terre : filtre LINEAR forcé dans `introEarthInit` (le jeu est en NEAREST par défaut).
- Tests headless : machine lente, `dt` clampé ; dans `page.evaluate`, terminer par `return 0` (renvoyer un objet Phaser bloque Playwright).
