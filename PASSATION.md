# PASSATION — Space Shooter X (contexte narratif mis à jour le 29 oct. 2026)

> Lire d'abord `CLAUDE.md` (règles), `docs/bible-univers-v2.md` (référence narrative actuelle), `docs/brief-univers-agp.md` (interface ; la bible v2 prévaut en cas de contradiction), puis `docs/carte-du-code.md` (où est quoi).

## Mise à jour narrative — 29 octobre 2026 (à lire avant reprise)

**Référence narrative actuelle : [docs/bible-univers-v2.md](docs/bible-univers-v2.md).** Cette version prévaut sur `docs/bible-univers.md` et `docs/brief-univers-agp.md` pour toute contradiction de campagne, personnages ou révélations. Les anciennes versions sont conservées pour historique. La direction artistique reste décrite dans `docs/direction-artistique-agp.md`.

### Contexte commun à tous les développeurs et agents

- Le joueur est un employé de l'AGP, chargé de nettoyer la galaxie avec sa camionnette. Le nettoyage ordinaire n'est normalement pas hostile : les premiers tirs de satellites pendant le tuto constituent une anomalie explicite.
- N.O.R.M.A. intervient dès le départ dans les menus et en mission : conseils de jeu, astuces, piques et progression de l'intrigue. Messages courts, lisibles, non bloquants. Les révélations passent une seule fois, les tentatives suivantes utilisent des variantes.
- **Monde 1 : orbite basse terrestre**, un tuto et cinq niveaux (le dernier est le niveau boss). Une entreprise a déclaré ses installations abandonnées mais en protège encore le matériel. Le joueur termine sa tournée malgré cette résistance.
- **Le PDG du monde 1 dirige une autre entreprise, pas l'AGP.** Son affaire est autonome : aucun lien secret, document-passerelle ou trafic partagé avec l'AGP. Sa défaite clôt le monde 1.
- **Monde 2 : Mars directement**, cinq niveaux sans nouveau tuto. La Casse lunaire ne précède plus Mars. Les mondes suivants restent à définir : ne pas simplement décaler les anciens mondes ni reprendre leurs révélations comme validées.
- Mars est une planète poubelle avec des mécas industriels lourds, câbles, outils et pièces récupérées. Inspiration visuelle Mechanicus, identité originale au jeu. Pas de religion des machines ni de ferveur industrielle. Humour modéré, surtout par N.O.R.M.A. ; environnement et ennemis pris au sérieux.

### Monde 2 validé — trame de développement

| Niveau | Mission / incident | Découverte |
|---|---|---|
| 1 — Zone de déchargement | Dégager les arrivées ; **Le Déchargeur**. | La zone saturée continue de recevoir des cargaisons. |
| 2 — Matière première | Dégager le tri ; **Le Désosseur**. | Les machines utilisent les cargaisons pour leur propre maintenance ; le reste retourne en décharge. |
| 3 — Stockage définitif | Neutraliser les déchets dangereux ; **Le Gardien de confinement**. | Des conteneurs intacts sont enregistrés comme détruits ou recyclés. |
| 4 — Maintien en activité | Atteindre la supervision ; **Le Contremaître**. | L'AGP a reçu les alertes de saturation, mais a maintenu les transferts. |
| 5 — Traitement en cours | Courte approche puis boss **Le Directeur de traitement**. | « Traité » signifie trié puis stocké ; les rapports AGP annoncent « recyclé ». |

Mobs, rôles, attaques et interventions de N.O.R.M.A. sont détaillés dans la bible v2 § 4. La destination suivante, la réaction de l'AGP, les responsables et l'ampleur du système restent ouverts.

### Conséquences pour le code — à traiter séparément

Cette mise à jour est **documentaire** : elle ne signifie pas que la nouvelle campagne est implémentée. L'état technique du 28 octobre conservé ci-dessous est historique ; le dépôt peut avoir évolué depuis et doit être vérifié avant reprise.

1. Comparer la bible v2 aux données des mondes, JSON de niveaux, textes `agp-lore.js` et transmissions `norma` ; relever les écarts avant de les corriger.
2. Préparer la migration narrative Lune/Mars : intitulés, planètes et décors, ordres de mission, mobs, boss et dialogues. Ne pas changer silencieusement les IDs, sauvegardes, déblocages, plans R&D ou pièces de secteur.
3. Les comportements de mobs et boss décrivent la cible de conception : réutiliser les mécaniques existantes quand elles conviennent ; proposer séparément toute modification de gameplay ou d'équilibrage.
4. Ne pas confondre validation de concept et asset final : les concepts récents du drone relais et de l'Antenne-Mère sont validés visuellement, leurs animations ne sont pas finalisées. Les essais récents de découpage/visée du satellite de défense ont été refusés pour production. Ne pas remplacer les assets fonctionnels du dépôt par ces prototypes.
5. Revue visuelle privée : https://space-shooter-x-sprites-20261028.guetguetr.chatgpt.site (concepts et étapes ; ne fait pas autorité sur l'état du code).

**Ordre de reprise :** lire les règles de `CLAUDE.md`, cette mise à jour, la bible v2 et `docs/carte-du-code.md`, puis contrôler l'état réel des fichiers concernés. Ne considérer aucun nouveau mob, dialogue ou asset comme intégré sans vérification.

---

> **Refonte de la progression (branche `progression-agp`, fusionnée dans `main` le 28 oct. 2026)** : design `docs/superpowers/specs/2026-10-27-progression-design.md`, plan `docs/superpowers/plans/2026-10-27-progression-agp.md`. Étapes 1 (composants visibles), 2 (sauvegarde v3 + atelier, plan `docs/superpowers/plans/2026-10-27-atelier-v3.md`), 3 (R&D par technologie, baies d'équipement, assemblage en mission, plan `docs/superpowers/plans/2026-10-27-rd-emplacements.md`) et 6a (textes des secteurs 2 et 3) faites ; étapes 4 (plans et pièces de secteur lâchés en mission) et 5 (distinctions RH, livrées) à planifier une par une.

> **Garage en pause (27 octobre 2026)** : lire [docs/REPRISE-GARAGE.md](docs/REPRISE-GARAGE.md) pour l’état du garage (ancienne branche `codex/atelier-personnalisation`, fusionnée dans `main` et supprimée), les assets validés et la suite prévue.

## 1. Où on en est
Jeu complet et jouable sur navigateur (mobile portrait), habillé dans l'univers AGP. Boucle : **accueil → carte des secteurs → ordre de mission → rapport d'intervention**, avec catalogue R&D (arbre), cartes de montée de niveau, reliques, fusions, boss, événements, succès, pactes, bestiaire. **3 secteurs, 16 niveaux** (tuto + 5 par secteur), encore à équilibrer. La partie infinie n'existe plus qu'en `?dev`.

### Branches
- `main` contient tout (HUD en niveau, refonte de la progression, éditeur de niveaux complet).
- Une seule branche : `main`. Toutes les branches de sujet précédentes sont fusionnées et supprimées (GitHub et local).

## 2. Ce qui a été fait (du plus récent au plus ancien)
- **Éditeur de niveaux complet (28 oct. 2026)** : les 16 missions sont des JSON (`src/data/levels/`, `schemaVersion` 2, cache généré `level-data.js`) ; clés réglables par registres bornés (`mobs`, `bossTune`, `eventTune` / `events[i].params`, `norma` et boîtes N.O.R.M.A., `audio`, `bg` / `intro` / `zoom`), panneau ETAPES DU NIVEAU, validateur client + serveur (mêmes cas : `tools/fixtures/invalid_levels.json`), export UTF-8 qui ne réécrit que les fichiers modifiés, `python3 tools/level_files.py --migrate`. Guide, clés et recettes : `docs/editeur-niveaux.md`. **Pas fait** : tâche 8 (laboratoire de comparaison brouillon / publié) reportée, pas d'équilibrage ; **la suite en jeu (smoke, level, home, perks, enemy_stats, tunables, event_params) n'a pas été relancée depuis la tâche 2 : à lancer avant de pousser** ; la checklist manuelle de l'éditeur est dans `docs/editeur-niveaux.md` (« À vérifier à la main »). **Mineurs reportés** : `SPAWN_TABLE` dupliquée dans 11 JSON ; `/__editor/save` (ancien export vers `tuning.js`) retiré ; `bras.cooldown` non ordonné ; clés de musique vérifiées contre les tables de `music.js`, pas contre les fichiers audio.
- **R&D par technologie, baies d'équipement, assemblage en mission** (étape 3) : l'arbre de compétences est supprimé (`skill-tree.js`, `tree-ui.js`). 18 technologies (`src/data/techs.js` : 15 jouables dans les secteurs 1 à 3, 3 réservées aux secteurs 4 et 5) ; la **1re victoire d'un ordre accorde son plan** (`TECH_PLAN_LEVEL` : tuto → laser continu, `w1-l1` → laser auto-cibleur, etc. ; le dernier ordre du secteur 1 n'en donne pas), puis prototype → rangs → spécialisation en R&D (page `src/ui/rd-ui.js`, un onglet par secteur). **Baies d'équipement** dans le garage (1 + un boss de secteur vaincu, 5 au plus ; une seule ARME et une seule RAMPE) et ligne CHARGEMENT sur la fiche d'ordre. **En mission** rien n'est actif au départ : chaque technologie emportée s'assemble par une carte « ASSEMBLAGE » (garantie à chaque montée de niveau tant qu'il en reste, `drawCards`), puis ses rangs R&D s'appliquent, ses cartes d'amélioration (3 par mission) et sa spécialisation (si recherchée, après 2 cartes) entrent en jeu ; fusions ORAGE/VORTEX conditionnées à l'assemblage ; plus d'arme légendaire de boss. Le tuto se joue sans chargement. **Migration** : `migrateMeta()` rembourse tout l'ancien arbre (coûts figés `TREE_LEGACY_COSTS`) et accorde les plans des ordres gagnés (marqueur : clé `rd` absente). Tests : `node tools/rd_test.js` (équivalence `inc` ↔ ancien `apply` figée dans `tools/rd_equiv_snapshot.json`), `python3 tools/techs_test.py`. **Prix provisoires** (prototype 30/60/100 ◆ selon le secteur, rangs 25+15·n × 1/1,5/2, spécialisation 150/250/400 ◆ + pièces de secteur, **pas encore obtenables : étape 4**). Spécialisations « à concevoir » : BOUCLIER REACTIF, TIRS RICOCHETS, OVERDRIVE, CHAMP LENT, PULSAR, ECLATS (`spe:null`, à proposer à Guet). **Mesure** (`sim_balance.py campaign --reps 1`, bot naïf : atelier puis prototypes et rangs, assemble en premier) : fin du secteur 1 = 848 ◆ cumulés ; le bot gagne tout le secteur 1 et la plupart des ordres du 2 au 1er essai mais **échoue sur le boss du secteur 2 (`w2-l5`) et sur 3 ordres du secteur 3** — sans l'ancien arbre (stats brutes à plat) la puissance arrive plus tard : courbe `TARGET_BUDGET` et difficultés du secteur 2-3 **à recalibrer** (décision de Guet). `metaPoints` (alerte de la partie infinie `?dev`) = 4 par Mk + rangs R&D, seuils `ALERT_THRESHOLDS` non remis à l'échelle.
- **Atelier et sauvegarde v3** (branche `atelier-v3`, issue de `progression-agp`) : six postes de camionnette en cinq niveaux Mk I à V (COQUE, CANON DE SERIE, GENERATEUR DE BOUCLIER, PROPULSEURS, AIMANT, ORDINATEUR DE BORD), achetés au garage (onglet POSTES de l'ATELIER) en composants ◆ ; Mk III à V exigent aussi des pièces de secteur (2 du S1, 3 du S2, 4 du S3), **pas encore obtenables** avant l'étape 4 (bouton DEV `+5 PIECES` en `?dev`). Règles : `src/data/atelier.js` (test `node tools/atelier_test.js`) ; sauvegarde `ssx_meta_v3` (`src/data/meta.js` : `composants`, `pieces`, `atelier`, `tree`) ; stats de départ = `applyGlobalGear(stats, meta)` (atelier puis arbre restant, tuto compris). **Migration v2 → v3** : seuls les 27 nœuds de l'arbre repris par l'atelier sont remboursés (`TREE_MOVED`, `treeRefundFor`) ; le reste de l'arbre (lasers, missiles, drones…) est conservé jusqu'à l'étape 3, qui remboursera le reste. Branche Savoir supprimée, seuils de bifurcation réduits au prorata, ascension supprimée, `meta.fragments` devient `meta.composants`. Aimant et canon s'affichent sur la camionnette dès le Mk I (leurs placements ont été validés séparément : **à vérifier à l'œil qu'ils ne se gênent pas**). Valeurs des Mk et prix (40/70/120/200/340 ◆, identiques pour les six postes) **provisoires**. Simulateur (`sim_balance.py campaign --reps 1`, le bot achète l'atelier d'abord) : fin du secteur 1 = 731 ◆ cumulés, soit **Mk II sur les six postes**, au-dessus de la cible du design (Mk I sur 3 à 4 postes) : prix à relever (×2 environ) ; le bot gagne presque tous les ordres au 1er essai, la courbe `TARGET_BUDGET` est à recalibrer.
- **Composants visibles** (branche `progression-agp`) : les machines détruites lâchent des composants ◆ (icône : écrou AGP), ramassés à l'aimant, comptés dans le HUD sous le RENDEMENT ; pluies de composants à la mort des boss et du Trésorin, aspirées à la victoire. Rapport : composants récupérés + prime AGP (moitié des primes du niveau) en victoire, franchise d'accident de 30 % en défaite ou abandon ; le score ne rapporte plus de composants. Règles : `src/data/composants.js` (test `node tools/composants_test.js`), jeu : `src/world/composants.js`. Secteurs 2 et 3 renommés d'après la bible (LA CASSE LUNAIRE / LE BROYEUR, MARS, PLANETE POUBELLE / LE DIRECTEUR DE TRAITEMENT), employé n° 0042, transmissions N.O.R.M.A. de fin de secteur.
- **Secteur 1 : tous les boss et mobs sont dans le jeu** (branche `boss-antenne-mere`, fusionnée avec `main` le 27 oct.) : boss du tuto Antenne-Mère, La Météo (`w1-l1`), Araignée de tri (`w1-l2`), Le Réacteur (`w1-l3`), L'Anneau (`w1-l4`, 40 kills puis boss), Le PDG dans sa tour (`w1-l5`, avec jusqu'à 3 vaisseaux de protection « Le PDG » qui lâchent chacun un agent de sécurité gelé) ; mobs Bras écartés, Pilleur de cristaux (aspiration + laser alimenté), Éclaireur de patrouille (verrouillage : tant qu'il te tient, les tirs des autres ennemis visent le joueur). Chaque boss est autonome (`src/bosses/*.js`, état `this.ar/mt/rx/an/pd`), avec jeu de lumières, états d'usure, pièces découpées dans le sprite et sons réels adoucis. Détails et fichiers : section « Boss et mobs du monde 1 » de `CLAUDE.md`. Assets produits par `sprite-factory/tools/make_*_assets.py` (hors dépôt). **Valeurs d'équilibrage PROVISOIRES** (PV, dégâts, cadences) : à régler en jouant.
- **HUD en niveau** (`css/hud.css`, `src/ui/hud.js`) : portrait de la camionnette + grade, barres de coque / bouclier / expérience épaisses et brillantes (coque chiffrée), rendement en gros chiffres, pause en relief, ordre de mission en jauge avec icône du type d'objectif, jauge de boss assortie, voile sombre en haut. Effets : flash + secousse à l'impact, éclat vert au soin, alerte coque, reflet, montée de grade, parallaxe légère (`updateHudSway`). `smoke_test.py` attend que le jeu soit vraiment démarré.
- **Icônes d'interface en sprites** : cadenas, coche, composants (◆), étoile, crâne, pause, engrenage, flèches, pastilles, trophée, main, chrono, réticule → `assets/sprites/ui_*.png` (12x12, `tools/gen_ui_icons.py`), utilisées par `uiIco()`.
- **Carte du monde vivante** : niveaux en médaillons avec icône (secteur 1 : `LEVEL_ICONS`), badges d'état, trace de la route ; planètes des secteurs 2 et 3 en images ; nuages qui défilent sur la Terre ; satellite en orbite (`theme.photo`, `theme.clouds`, `theme.orbiter` dans `src/data/worlds/*.js`).
- **Carte du code** : `docs/carte-du-code.md` + `docs/carte/` générés par `tools/gen_codemap.py` ; code mort et restes de l'ancien arbre radial supprimés, anciens scripts ponctuels de `tools/` retirés (historique Git).
- **Bio** : niveau 2 avec satellites (normal + armé, `cut_satgun.py`), dézoom progressif des niveaux (`levelZoom`), planète du secteur au menu et au décollage ; tuto à une seule boîte N.O.R.M.A. ; éditeur de niveaux (`editor.html`) ; « juice » du combat (arrêt sur image, secousses, impacts) ; typographie (Jersey 15 + Chakra Petch) ; nouvelles musiques et sons.
- **Avant** : atouts globaux / de mission séparés ; responsive (zone 400x700 mise à l'échelle d'un bloc) ; direction artistique AGP-OS et N.O.R.M.A. ; pause et paramètres en feuille modale ; écran de chargement ; icône PWA ; animations GSAP ; arbre en cartes par branche ; accueil à 3 pages et mondes ; découpage du monolithe en modules (25 oct.).

## 3. À faire / questions ouvertes
**Testing humain du 27 oct. 2026 — répartition Mac (Guet) / Windows (Bio)**
> Rappel de vocabulaire décidé ce jour-là : le **tuto n'est pas un niveau** — « niveau 1 » (ou « ordre 1 ») désigne le premier ordre de mission *après* le tuto.

- **Bio (sprites/sons, usine à sprite)** : refaire le sprite des satellites endommagés en fond de `w1-l2` (rendu gris/noir raté) ; refaire la lune + le fond de `w1-l1` ; jeu de lumières du hangar/menu principal + petits SFX de lumière ; logo/icône pour le dézoom de la carte ; sprite des composants (collectible ◆) ; sons « différents » demandés en test.
- **Guet (ici, Mac) — fait et testé** (`smoke_test.py`, `home_test.py`, `level_test.py`, `perks_test.py`, `gen_codemap.py --check` verts) :
  - Menu missions : fiche d'ordre compacte sans scroll, format stable quel que soit le texte ; barre « ORDRE X/6 » + flèches retirée, sélection par clic direct ou **swipe sur la planète** (`stepOrbitLevel`, `src/home/orbital.js`) — le swipe ailleurs continue de changer de page.
  - **FINITION sur tous les niveaux** : `LEVEL_COMPLETION` (`data/completion.js`) génère désormais des objectifs génériques par type de niveau (survie/kill/collecte + boss), « sans te faire toucher » = 20 % (`GameScene.levelComp`, `runHits`) ; enregistrée à chaque `endRun`, victoire ou défaite.
  - Header EMPLOYE N° 0042 unifié entre Atelier / Missions / R&D (`css/home-orbital.css`).
  - Boss (les 5 autonomes + tuto) : dégâts visuels sans perte de PV réelle pendant la mise en position ; jauge de vie masquée jusqu'à la position de combat.
  - Tuto : écran de fin au format calepin (`.rp-doc`) ; zoom cinématique du décollage retiré (doublon avec la Terre du fond) ; le chargement R&D en cours s'assemble désormais au tuto (niveau 0 la 1re fois, reflète la progression ensuite).
  - N.O.R.M.A. en mission : le visage carré (`.nm-av`, CSS déjà là, balisage manquant) est de retour ; zone text fixée sous la jauge d'ordre (ne chevauche plus `#waveNote` ni la jauge de boss) ; transmissions régulières ajoutées (`normaTick`, pools `progress`/`banter` dans `agp-lore.js`) en plus de début/boss/PV bas.
  - % de finition retiré de l'affichage pendant le niveau (gardé accueil + fin).
  - Rapport d'intervention : scroll réduit (boutons et marges resserrés, ligne CHAINE MAXIMALE retirée), label « Composants récupérés » retiré (redondant avec l'en-tête).
  - Mécanique DETONATEUR (explosion à la mort liée aux paliers de succès par ennemi) supprimée à la demande de Guet : effet, succès, toasts et section de la page succès retirés ; conséquence : le succès « RÉACTION EN CHAÎNE » est désormais inatteignable (laissé tel quel, inoffensif).
  - Éclaireur (`w1-l4`) : portée du faisceau doublée (`EC.reach`), ne peut plus être esquivé en restant en bas de l'écran.
  - Musique : les 5 boss autonomes du monde 1 ne faisaient jamais basculer la musique sur le thème boss (`bossActive`/`currentBoss` jamais posés pour eux) — corrigé dans `audio/scene-audio.js`. Fenêtre de chevauchement entre un `music.stop()` et un nouveau `start()` (ex. ORDRE SUIVANT) resserrée de 500 ms à 150 ms (`audio/music.js`).
  - Terminologie tuto ≠ niveau ajoutée à `CLAUDE.md`.
- **Guet — diagnostiqué, pas encore corrigé** :
  - Réacteur (`w1-l3`) : le son du tir de feu sur place est un seul coup (`rxSfx('rxPatchBurn', ...)`) alors que la flaque dure plus longtemps — semble la cause du « sfx coupé » signalé, mais corriger proprement (boucle `Sfx.loopSet`) demande l'oreille de Bio pour juger le rendu. L'accélération du fond/dézoom pendant le combat vient probablement de `levelZoom()` qui réutilise `levelProgress().frac` (progression de l'objectif) même une fois le boss sorti, où `frac` reflète alors ses PV : à trancher si c'est voulu (toutes les fins de boss du monde 1 sont concernées, pas que le Réacteur) ou pas.
  - Rebonds des ennemis (Bio) : aucun mécanisme de rebond trouvé dans `enemies/*.js` (pas de `setBounce`, pas de code de rebond manuel) — à clarifier avec Bio ce qu'il a vu.
- **À part, pas dans ce sprint** : outil de game design (bestiaire, niveaux d'alerte, test live + import) à spécifier séparément, probablement en extension de `editor.html`.

**Prochaines étapes proposées**
- **Refonte de la progression** : étapes 4 et 5 du design (plans et pièces de secteur lâchés en mission, distinctions RH → livrées), chacune avec son propre plan. Étape 6b : feuille de route narrative à revoir selon la bible v2 : Mars devient le monde 2 et les mondes suivants restent à définir. Auditer données, décors, mobs et boss avant migration.
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
