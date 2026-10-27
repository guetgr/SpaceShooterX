<!-- Généré par tools/gen_codemap.py : ne pas modifier à la main (relancer le script). -->

# Carte des fichiers (ordre de chargement)

L'ordre est celui de `src/scripts.json` : un fichier ne peut utiliser au démarrage que ce qui est défini **plus haut**. `boot.js` (chargeur) et `main.js` (Phaser) encadrent la liste.

| # | Fichier | Rôle |
|---|---|---|
| 1 | `src/core/config.js` | Réglages globaux (mode DEV). |
| 2 | `src/core/cloud-save.js` | Clés de sauvegarde et copie de secours dans la base privée de la plateforme (CloudSave). |
| 3 | `src/core/constants.js` | Constantes du jeu : taille du terrain, zoom, plafonds, zones HUD. |
| 4 | `src/core/mixin.js` | Ajoute des méthodes à une classe (comme si elles étaient écrites dans le corps de la classe). Sert à répartir GameScene sur plusieurs fichiers. |
| 5 | `src/data/leaderboard.js` | Classement local, nom du joueur, meilleur score. |
| 6 | `src/data/player-stats.js` | Statistiques de départ du joueur (makeDefaultStats). |
| 7 | `src/data/bestiary.js` | Bestiaire : liste des ennemis et sauvegarde. |
| 8 | `src/data/achievements.js` | Succès : paliers, poids, progression et bonus. |
| 9 | `src/data/balance.js` | Constantes d'équilibrage : dégâts, niveau d'alerte, évolution dans le temps. |
| 10 | `src/data/composants.js` | Composants ◆ : ce que les machines détruites lâchent en mission (ramassés à l'aimant), et ce que le rapport d'intervention en retient. Victoire : tout le ramassé + la prime AGP (moitié des primes du niveau). Défaite ou abandon : l |
| 11 | `src/data/atelier.js` | Atelier : les six postes de la camionnette, en cinq niveaux Mk I à V. Stats de base permanentes, toujours actives, hors emplacement. Achat : composants ◆ (Mk I à V) + pièces de secteur (Mk III à V). Design : docs/superpowers/specs |
| 12 | `src/data/events.js` | Événements aléatoires (EVENT_DEFS). |
| 13 | `src/ui/pixel-icons.js` | Icônes pixel : réduit les émojis en 16x16 avec contour. |
| 14 | `src/ui/ui-icons.js` | Icônes d'interface en pixel art (12x12, dessinées par tools/gen_ui_icons.py) : elles remplacent les glyphes / émojis de l'interface. uiIco('lock', 12)  -> HTML <img> prêt à insérer dans un innerHTML (12 px dans le texte, 24 px pou |
| 15 | `src/data/meta.js` | Méta-progression (sauvegarde permanente v3) : composants, pièces de secteur, atelier, arbre restant ; niveau d'alerte de la partie infinie. La v2 (`ssx_meta_v2`) n'est plus écrite : elle est lue une fois, convertie par metaFromV2  |
| 16 | `src/data/worlds.js` | Mondes et niveaux : registre + validation. Un monde = un fichier dans data/worlds/, qui s'enregistre avec registerWorld(). Ajouter un monde = ajouter un fichier + une ligne dans scripts.json. |
| 17 | `src/data/agp-lore.js` | Univers narratif : AGP (Agence Galactique de Propreté), an 2247. Textes de l'interface, des ordres de mission et des transmissions de N.O.R.M.A. Aucun effet sur le jeu : ce fichier ne contient que des textes d'habillage. Les nivea |
| 18 | `src/data/worlds/monde-1.js` | Monde 1 — BROUILLON : valeurs provisoires pour tester le moteur (étape 8 du plan : contenu et équilibrage). |
| 19 | `src/data/worlds/monde-2.js` | Monde 2 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage). |
| 20 | `src/data/worlds/monde-3.js` | Monde 3 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage). |
| 21 | `src/data/world-progress.js` | Progression dans les mondes (sauvegarde permanente, clé ssx_worlds_v1 — incluse dans SAVE_KEYS pour la sauvegarde cloud). On ne stocke que les victoires ; les déverrouillages se déduisent : |
| 22 | `src/data/tuning-defaults.js` | Réglages par défaut du TUTO (niveau w1-tuto). Ce fichier est écrit à la main ; les modifications faites dans l'éditeur (editor.html) sont enregistrées à part dans data/tuning.js (généré) et se superposent à ces valeurs. Rien à cha |
| 23 | `src/data/tuning.js` | GÉNÉRÉ par l'éditeur de niveaux (editor.html, bouton EXPORTER) — ne contient que les valeurs qui diffèrent des défauts. Peut aussi être modifié à la main. tuto   : surcharges de TUTO_DEFAULTS (data/tuning-defaults.js) |
| 24 | `src/data/tuning-apply.js` | Applique les réglages (défauts + surcharges de tuning.js) : TUTO_TUNE = réglages vivants du tuto, les niveaux de WORLDS sont modifiés en place. L'éditeur (editor.html) rappelle applyTuning() à chaque essai ; LEVEL_BASE garde les v |
| 25 | `src/data/completion.js` | FINITION d'un niveau (en %) : plusieurs objectifs pondérés (somme = 100). On garde le MEILLEUR de chaque objectif sur toutes les parties, donc chaque partie (même perdue) peut faire monter le %. Des paliers (25/50/75/100 %) rappor |
| 26 | `src/data/ship-skins.js` | Apparences de la camionnette (teintes appliquées par le moteur : aucun fichier image). Choisie dans le HANGAR, sauvegardée sous ssx_skin_v1. Ajouter une apparence = ajouter une ligne ici. `tint` = couleur multipliée sur le sprite  |
| 27 | `src/data/skill-tree.js` | Arbre de compétences : branches, nœuds, positions à l'écran, déblocage. |
| 28 | `src/data/upgrades.js` | Cartes d'amélioration en cours de partie (UPGRADE_POOL). |
| 29 | `src/data/relics.js` | Reliques. |
| 30 | `src/data/pacts-style.js` | Pactes, rangs de style, collection (codex). |
| 31 | `src/data/fusions.js` | Fusions de cartes. |
| 32 | `src/gfx/pixel-textures.js` | Génération d'une texture à partir de lignes de pixels. |
| 33 | `src/gfx/sprite-rows.js` | Sprites pixel dessinés en code (vaisseau, ennemis de base, projectiles). |
| 34 | `src/gfx/procedural.js` | Textures procédurales : auras de bouclier, cristaux, planètes, nébuleuses, galaxies. |
| 35 | `src/gfx/boss-art.js` | Sprites 8 bits des boss (BOSS_ART). |
| 36 | `src/gfx/mob-art.js` | Sprites 8 bits des mobs (MOB_ART, MOB_ART2) et planches de pixels. |
| 37 | `src/data/bosses.js` | Boss : ordre, PV par niveau d'alerte, phases, définitions (BOSS_DEFS). |
| 38 | `src/gfx/builders.js` | Construction des textures de boss, mobs et fonds au démarrage. |
| 39 | `src/gfx/planets.js` | Planètes en pixel art générées en code (aucun fichier image) : sphère éclairée par le haut-gauche, relief ou bandes, palette propre à chaque monde. makePlanetTexture(scene, key, { size, seed, palette:[0xRRGGBB… du plus sombre au p |
| 40 | `src/audio/music-data.js` | Liste des fichiers de musique (MUSIC_FILES). |
| 41 | `src/audio/volume.js` | Volumes (VOL). |
| 42 | `src/audio/sfx-engine.js` | Moteur de sons : classe Sfx (synthèse, lecture des sons enregistrés) et outils de matière. |
| 43 | `src/audio/sfx-files.js` | Sons enregistrés (SFX_FILES) qui remplacent la version synthétique du même nom. |
| 44 | `src/audio/sfx-lib.js` | Bibliothèque de sons synthétiques (SFX_LIB) et instance globale sfx. |
| 45 | `src/core/input-guards.js` | Bloque le zoom de la page, le menu contextuel, et réveille l'audio au premier toucher. |
| 46 | `src/audio/music.js` | Lecture de la musique : MusicLoop, FileMusic, instance globale music. |
| 47 | `src/data/image-assets.js` | Planches de sprites chargées depuis assets/sprites (constantes *_B64). |
| 48 | `src/data/boss-antenne.js` | Boss du tuto (« Antenne-Mère ») : réglages VISUELS seulement (états d'usure, accroches du feu et de la fumée, effets). Les valeurs de jeu (PV, tirs, dégâts) restent dans TUTO_TUNE.boss. |
| 49 | `src/data/boss-lights.js` | Jeu de lumières des boss : voyants qui pulsent ou clignotent, balayage radar, gyrophare. Positions en pixels du sprite 512 ; elles suivent le boss et disparaissent avec la pièce qui les porte (masque du sprite). m : 'pulse' (respi |
| 50 | `src/scenes/BootScene.js` | Scène de chargement : crée toutes les textures et animations. |
| 51 | `src/data/enemy-art.js` | Table ENEMY_ART : quelle planche/animation pour quel ennemi. |
| 52 | `src/scenes/GameScene.js` | Scène principale. Les méthodes sont réparties dans les fichiers suivants (mixin). |
| 53 | `src/scenes/HomeScene.js` | Accueil : décor animé (canvas) + panneaux HTML (#home). Les méthodes sont dans src/home/ (mixin), comme GameScene. Trois pages côte à côte : HANGAR (-1) · CARTE (0, par défaut) · ARBRE (+1). La partie jouable reste GameScene (scèn |
| 54 | `src/home/background.js` | — |
| 55 | `src/home/galaxy.js` | Méthodes de HomeScene — carte stellaire : tous les mondes sur une route sinueuse, défilement au doigt avec inertie, voyage en hyperespace, zoom vers un monde, animation de déblocage d'un nouveau monde. |
| 56 | `src/home/garage.js` | Garage : décor et assemblage des sprites ; les six postes de l'atelier (data/atelier.js) s'achètent ici en composants ◆. |
| 57 | `src/home/ui.js` | Méthodes de HomeScene — panneaux HTML de l'accueil : pages, carte des niveaux, hangar, arbre, lancement. |
| 58 | `src/world/background.js` | Méthodes de GameScene — fond étoilé, zones de décor, zoom et limites visibles. |
| 59 | `src/ui/dom.js` | Méthodes de GameScene — interface HTML : menus, boutons, écran de départ. |
| 60 | `src/ui/motion.js` | Animations des menus (GSAP, vendor/gsap.min.js) : retour tactile des boutons, respiration du CTA, entrée des pages, cartes en cascade, compteurs. Tout est sans effet si GSAP est absent ou si le joueur demande moins d'animations (p |
| 61 | `src/ui/norma.js` | N.O.R.M.A. — assistante administrative embarquée de l'AGP. Elle parle par transmissions courtes (bandeau en haut de l'écran, jamais bloquant), dans l'accueil (bandeau d'information), au début d'une mission, face à un boss, quand l |
| 62 | `src/ui/pages.js` | Méthodes de GameScene — pages du menu : classement, stats, bestiaire, collection, pactes, succès, pause. |
| 63 | `src/systems/achievements.js` | Méthodes de GameScene — succès en cours de partie : kills, paliers, notifications. |
| 64 | `src/fx/effects.js` | Méthodes de GameScene — effets : explosion kamikaze, toiles, explosions de mort. |
| 65 | `src/ui/tree-ui.js` | Méthodes de GameScene — arbre de compétences : une page par branche, une carte par compétence (les rangs sont des pastilles), fiche en bas pour le détail et l'achat. Les données (rangs sauvegardés, coûts, déblocages) viennent de d |
| 66 | `src/game/run.js` | Méthodes de GameScene — cycle d'une partie : démarrage, reprise, fin, mort du joueur. |
| 67 | `src/game/level.js` | Méthodes de GameScene — niveaux des mondes : objectif, événements du niveau, victoire. `this.lvDef` = définition du niveau en cours (data/worlds), null pour l'ancienne partie infinie (bouton DEMARRER, bac à sable). |
| 68 | `src/game/tuto.js` | Méthodes de GameScene — TUTO (niveau 1 du monde 1, `w1-tuto`, / bouton DEV) : 3 étapes pédagogiques (bouger, tirer, boss), satellites + débris, boss satellite. Une seule boîte de consigne : N.O.R.M.A. (ui/norma.js). La FINITION (% |
| 69 | `src/game/tuto-boss-fx.js` | Méthodes de GameScene — HABILLAGE VISUEL du boss du tuto (Antenne-Mère) : sprite « vivant », 4 états d'usure, feu et fumée accrochés aux trous, éclats découpés dans le sprite, tirs en boules d'énergie animées, charge du canon, exp |
| 70 | `src/fx/boss-lights.js` | Méthodes de GameScene — JEU DE LUMIÈRES des boss (voyants, radar, gyrophare). Les définitions sont dans data/boss-lights.js. Usage : `const L = this.blInit('meteo')` à la création du boss, `this.blUpdate(L, delta, { toWorld, solid |
| 71 | `src/dev/sandbox.js` | Méthodes de GameScene — bac à sable DEV et HUD des événements. |
| 72 | `src/dev/editor-hook.js` | Pont entre le jeu et l'éditeur de niveaux (editor.html). Inactif sans ?edit dans l'URL. ?edit=play : aperçu jouable dans l'éditeur   ·   ?edit=bot : jeu caché où tourne le joueur automatique (tools/sim/bot.js) |
| 73 | `src/game/loop.js` | Méthodes de GameScene — boucle principale update(). |
| 74 | `src/game/difficulty.js` | Méthodes de GameScene — difficulté : cadence d'apparition, niveau d'alerte, multiplicateurs de PV et de dégâts. |
| 75 | `src/player/weapons.js` | Méthodes de GameScene — armes du joueur : tirs, missiles, drone, nuke, ciblage. |
| 76 | `src/enemies/spawning.js` | Méthodes de GameScene — apparition des ennemis et des vagues. |
| 77 | `src/enemies/ai.js` | Méthodes de GameScene — comportement des ennemis : déplacement, tirs, esquive, mines, bombes, soigneur. |
| 78 | `src/enemies/bras.js` | Méthodes de GameScene — mob « Bras écartés » (type 'bras') : coque à quatre perches qui chargent en bleu et tirent des orbes bleues. 4 états d'usure dessinés (planche brasSheet) selon la vie ; une perche arrachée ne tire plus ; à  |
| 79 | `src/enemies/pilleur.js` | Méthodes de GameScene — mob « Le Pilleur de cristaux » (type 'pilleur', niveau `w1-l3`). Drone-collecteur : sa trappe dorsale s'ouvre, il ASPIRE les cristaux qui passent à portée (ceux que tu voulais ramasser), chaque cristal aval |
| 80 | `src/enemies/eclaireur.js` | Méthodes de GameScene — mob « L'Éclaireur de patrouille » (type 'eclaireur', niveau `w1-l4`, et lancé par les baies du boss L'Anneau). Drone-œil : il patrouille en balayant le sol d'un projecteur violet (dont le bout s'estompe en  |
| 81 | `src/game/intro.js` | Méthodes de GameScene — cinématique d'intro : décollage depuis la Terre. |
| 82 | `src/audio/scene-audio.js` | Méthodes de GameScene — sons de mort et ambiance musicale selon la situation. |
| 83 | `src/bosses/core.js` | Méthodes de GameScene — boss : apparition, phases, tirs, barre de vie, victoire. |
| 84 | `src/bosses/parts.js` | Méthodes de GameScene — pièces de boss : tentacules, têtes, dégâts par pièce, repousse. |
| 85 | `src/bosses/ai.js` | Méthodes de GameScene — IA spécifique de chaque boss (dread, faucheuse, ruche, prisme, kraken, éclipse, hydre). |
| 86 | `src/bosses/araignee.js` | Méthodes de GameScene — boss « Araignée de tri » (boss du niveau `w1-l2`, `finalBoss:'araignee'` dans data/worlds/monde-1.js). Autonome comme le boss du tuto : son état est dans `this.ar`. Elle TRIE : BENNES (les trappes des bras  |
| 87 | `src/bosses/meteo.js` | Méthodes de GameScene — boss « La Météo » (boss de fin du niveau `w1-l1`, `finalBoss:'meteo'` dans data/worlds/monde-1.js). Autonome comme l'Araignée de tri (bosses/araignee.js) : son état est dans `this.mt`. Elle FAIT L'ORAGE : É |
| 88 | `src/bosses/reacteur.js` | Méthodes de GameScene — boss « Le Réacteur » (boss de fin du niveau `w1-l3`, `finalBoss:'reacteur'` dans data/worlds/monde-1.js). Autonome comme l'Araignée et la Météo : son état est dans `this.rx`. Il IRRADIE : RAYONNEMENT (le cœ |
| 89 | `src/bosses/anneau.js` | Méthodes de GameScene — boss « L'Anneau » (boss de fin du niveau `w1-l4`, `finalBoss:'anneau'` dans data/worlds/monde-1.js). Autonome comme l'Araignée, la Météo et le Réacteur : son état est dans `this.an`. Une station orbitale do |
| 90 | `src/bosses/pdg.js` | Méthodes de GameScene — boss final « Le PDG dans sa tour » (boss de fin du niveau `w1-l5`, `finalBoss:'pdg'` dans data/worlds/monde-1.js). Autonome comme les autres boss de fin : son état est dans `this.pd`. Il a quatre attaques e |
| 91 | `src/combat/damage.js` | Méthodes de GameScene — collisions et dégâts sur les ennemis, mort des ennemis. |
| 92 | `src/ui/hud.js` | Méthodes de GameScene — HUD : secousse, rang de style, barres. |
| 93 | `src/systems/combo.js` | Méthodes de GameScene — combo et rang de style (multiplicateur d'XP). |
| 94 | `src/systems/overdrive.js` | Méthodes de GameScene — Overdrive. |
| 95 | `src/systems/relics-fusions.js` | Méthodes de GameScene — choix de reliques et fusions. |
| 96 | `src/world/pickups.js` | Méthodes de GameScene — cristaux d'XP, soins, mob doré. |
| 97 | `src/world/composants.js` | Méthodes de GameScene — composants ◆ : lâchés par les machines détruites, ramassés à l'aimant, comptés dans le HUD (règles : data/composants.js). |
| 98 | `src/world/meteors.js` | Méthodes de GameScene — météorites. |
| 99 | `src/events/core.js` | Méthodes de GameScene — planification et déroulement des événements, nébuleuse. |
| 100 | `src/events/types.js` | Méthodes de GameScene — les différents événements : frappes, couloir, éclipse, EMP, glace, plasma, vortex magnétique. |
| 101 | `src/events/forces.js` | Méthodes de GameScene — puits de gravité et forces. |
| 102 | `src/enemies/squads-shields.js` | Méthodes de GameScene — escouades, boucliers ennemis, esquive coordonnée. |
| 103 | `src/systems/skills.js` | Méthodes de GameScene — compétences actives : ralenti, dernier souffle, foudre en chaîne, updateSkills. |
| 104 | `src/player/damage.js` | Méthodes de GameScene — dégâts subis par le joueur : armure, bouclier, esquive, réflexion. |
| 105 | `src/player/skin.js` | Méthodes de GameScene — apparence (teinte) de la camionnette. Les effets qui teintent le vaisseau (dégâts, glace) passent par ici pour ne pas effacer l'apparence choisie. |
| 106 | `src/player/progression.js` | Méthodes de GameScene — montée de niveau, cartes d'amélioration, palier du vaisseau. |
| 107 | `src/fx/particles.js` | Méthodes de GameScene — particules : bris de bouclier, traînée de réacteur, impacts. |
| 108 | `src/fx/juice.js` | JUICE — retour de sensation (« game feel ») centralisé. Trois outils, tous réglés ICI : juiceStop(kind)         arrêt sur image très court (hit-stop) : le temps de jeu se fige ~50-110 ms sur les impacts qui comptent |
| 109 | `src/main.js` | Point d'entrée : configuration Phaser et démarrage. |

**109 fichiers listés** (+ `src/boot.js`, chargeur). Les tailles et numéros de ligne ne sont volontairement pas affichés : ils changeraient à chaque modification et provoqueraient des conflits entre collaborateurs (retrouver un nom avec Grep).

## Détail par fichier

### `src/core/`

**`config.js`** — Réglages globaux (mode DEV).

- Définit : `DEV_SEE_ALL`

**`cloud-save.js`** — Clés de sauvegarde et copie de secours dans la base privée de la plateforme (CloudSave).

- Définit : `SAVE_KEYS`, `_lsSet`, `rawSet`, `rawGet`, `CloudSave`

**`constants.js`** — Constantes du jeu : taille du terrain, zoom, plafonds, zones HUD.

- Définit : `GAME_W`, `PLAYER_SHIP_SCALE`, `INTRO_E_A`, `ZOOM_START`, `ZOOM_END`, `ZOOM_DURATION`, `GEM_CAP`, `ASHIELD_EXCL`, `NO_SHIELD_TYPES`, `FLANK_TYPES`, `ENEMY_CAP`, `ENEMY_HARD_CAP`, `BULLET_CAP`, `STAR_PAD_X`, `HUD_SAFE_Y`, `STORAGE_KEY`

**`mixin.js`** — Ajoute des méthodes à une classe (comme si elles étaient écrites dans le corps de la classe). Sert à répartir GameScene sur plusieurs fichiers.

- Définit : `mixin`

**`input-guards.js`** — Bloque le zoom de la page, le menu contextuel, et réveille l'audio au premier toucher.


### `src/data/`

**`leaderboard.js`** — Classement local, nom du joueur, meilleur score.

- Définit : `LB_KEY`, `sanitizeName`, `getPlayerName`, `setPlayerName`, `getLeaderboard`, `setLeaderboard`, `addLeaderboardEntry`, `getHighScore`, `setHighScore`

**`player-stats.js`** — Statistiques de départ du joueur (makeDefaultStats).

- Définit : `makeDefaultStats`, `applyGlobalGear`, `computeStartingStatsPreview`

**`bestiary.js`** — Bestiaire : liste des ennemis et sauvegarde.

- Définit : `BESTIARY_KEY`, `getBestiary`, `setBestiary`, `BESTIARY_LIST`

**`achievements.js`** — Succès : paliers, poids, progression et bonus.

- Définit : `ACHV_KEY`, `ACHV_W`, `newKillArr`, `ACHV_TIERS`, `ACHV_RARE`, `ACHV_EXPLO`, `ACHV_TYPES`, `ACHV_GLOBALS`, `achvRaw`, `achvWeighted`, `achvThreshold`, `achvTierFor`, `achvGlobalProgress`, `getAchvBuffs`, `applyAchvBuffs`, `setAchv`, `getAchv`, `bestiaryKeyFor`

**`balance.js`** — Constantes d'équilibrage : dégâts, niveau d'alerte, évolution dans le temps.

- Définit : `COLLISION_DMG_MUL`, `ENEMY_DMG_PER_ALERT`, `ALERT_RISE_SECONDS`, `SPAWN_TABLE`, `BOSS_RUN_ALERT_HP`, `LATE_HP_GROWTH`, `ENEMY_DMG_LATE`, `ENEMY_DMG_TIME_MAX`, `EXPLO_HURTS_PLAYER_ALERT`, `EXPLO_BOSS_FACTOR`

**`composants.js`** — Composants ◆ : ce que les machines détruites lâchent en mission (ramassés à l'aimant), et ce que le rapport d'intervention en retient. Victoire : tout le ramassé + la prime AGP (moitié des primes du niveau). Défaite ou abandon : l

- Définit : `COMP`, `composantsPrime`, `composantsBank`

**`atelier.js`** — Atelier : les six postes de la camionnette, en cinq niveaux Mk I à V. Stats de base permanentes, toujours actives, hors emplacement. Achat : composants ◆ (Mk I à V) + pièces de secteur (Mk III à V). Design : docs/superpowers/specs

- Définit : `ATELIER_MAX`, `ATELIER_COSTS`, `ATELIER_PIECES`, `ATELIER_OPS`, `atelierRows`, `ATELIER_POSTS`, `ATELIER_POST_BY_ID`, `ATELIER_REPLACED`, `atelierMk`, `atelierApplyRow`, `atelierApply`, `atelierShows`, `atelierNextCost`, `atelierCanBuy`, `atelierBuy`

**`events.js`** — Événements aléatoires (EVENT_DEFS).

- Définit : `evRndX`, `EVENT_DEFS`

**`meta.js`** — Méta-progression (sauvegarde permanente v3) : composants, pièces de secteur, atelier, arbre restant ; niveau d'alerte de la partie infinie. La v2 (`ssx_meta_v2`) n'est plus écrite : elle est lue une fois, convertie par metaFromV2 

- Définit : `META_KEY`, `META_KEY_V2`, `defaultMeta`, `metaNum`, `normalizeMeta`, `metaFromV2`, `metaRead`, `getMeta`, `setMeta`, `migrateMeta`, `ALERT_THRESHOLDS`, `ALERT_CAP`, `treeTotalPoints`, `metaPoints`, `computeAlertLevel`, `effectiveAlert`, `weaponTierFor`

**`worlds.js`** — Mondes et niveaux : registre + validation. Un monde = un fichier dans data/worlds/, qui s'enregistre avec registerWorld(). Ajouter un monde = ajouter un fichier + une ligne dans scripts.json.

- Définit : `WORLDS`, `LEVEL_TYPES`, `_levelIdx`, `registerWorld`, `worldById`, `levelById`, `nextLevelOf`, `validateWorlds`

**`agp-lore.js`** — Univers narratif : AGP (Agence Galactique de Propreté), an 2247. Textes de l'interface, des ordres de mission et des transmissions de N.O.R.M.A. Aucun effet sur le jeu : ce fichier ne contient que des textes d'habillage. Les nivea

- Définit : `AGP_LORE`, `AGP_LINES`, `agpDossier`, `agpBrief`, `agpType`

**`world-progress.js`** — Progression dans les mondes (sauvegarde permanente, clé ssx_worlds_v1 — incluse dans SAVE_KEYS pour la sauvegarde cloud). On ne stocke que les victoires ; les déverrouillages se déduisent :

- Définit : `WORLDS_KEY`, `getWorldProgress`, `setWorldProgress`, `_seeAll`, `isLevelDone`, `isWorldUnlocked`, `isLevelUnlocked`, `worldSummary`, `firstOpenLevel`, `recordLevelClear`, `markWorldSeen`, `wasWorldSeen`

**`tuning-defaults.js`** — Réglages par défaut du TUTO (niveau w1-tuto). Ce fichier est écrit à la main ; les modifications faites dans l'éditeur (editor.html) sont enregistrées à part dans data/tuning.js (généré) et se superposent à ces valeurs. Rien à cha

- Définit : `TUTO_DEFAULTS`

**`tuning.js`** — GÉNÉRÉ par l'éditeur de niveaux (editor.html, bouton EXPORTER) — ne contient que les valeurs qui diffèrent des défauts. Peut aussi être modifié à la main. tuto   : surcharges de TUTO_DEFAULTS (data/tuning-defaults.js)

- Définit : `TUNING_OVERRIDES`

**`tuning-apply.js`** — Applique les réglages (défauts + surcharges de tuning.js) : TUTO_TUNE = réglages vivants du tuto, les niveaux de WORLDS sont modifiés en place. L'éditeur (editor.html) rappelle applyTuning() à chaque essai ; LEVEL_BASE garde les v

- Définit : `TUNE_LEVEL_FIELDS`, `TUTO_TUNE`, `LEVEL_BASE`, `tuneMerge`, `applyTuning`

**`completion.js`** — FINITION d'un niveau (en %) : plusieurs objectifs pondérés (somme = 100). On garde le MEILLEUR de chaque objectif sur toutes les parties, donc chaque partie (même perdue) peut faire monter le %. Des paliers (25/50/75/100 %) rappor

- Définit : `LEVEL_COMPLETION`, `COMPLETION_STEPS`, `completionReward`, `_cl01`, `completionDefs`, `completionPct`, `completionNext`, `recordCompletion`

**`ship-skins.js`** — Apparences de la camionnette (teintes appliquées par le moteur : aucun fichier image). Choisie dans le HANGAR, sauvegardée sous ssx_skin_v1. Ajouter une apparence = ajouter une ligne ici. `tint` = couleur multipliée sur le sprite 

- Définit : `SHIP_SKINS`, `SKIN_KEY`, `getShipSkin`, `setShipSkin`, `shipSkinTint`, `SHIP_PARTS`, `SHIP_PARTS_KEY`, `getShipParts`, `setShipPart`, `shipPartsTexture`

**`skill-tree.js`** — Arbre de compétences : branches, nœuds, positions à l'écran, déblocage.

- Définit : `mkCost`, `TREE_BRANCHES`, `TREE_HUB`, `TREE_MOVED`, `ALL_TREE_NODES`, `TREE_NODE_BY_ID`, `treeRefundFor`, `ROMAN`, `TREE_VIS`, `visId`, `treeVisStatus`, `TREE_TOTAL`, `treeBranchStemSum`, `treeParentOk`, `treeNodeUnlocked`

**`upgrades.js`** — Cartes d'amélioration en cours de partie (UPGRADE_POOL).

- Définit : `UPGRADE_POOL`

**`relics.js`** — Reliques.

- Définit : `RELICS`

**`pacts-style.js`** — Pactes, rangs de style, collection (codex).

- Définit : `STYLE_RANKS`, `STYLE_XP`, `PACTS`, `getCodex`, `setCodex`, `getPacts`, `setPacts`, `pactBonus`

**`fusions.js`** — Fusions de cartes.

- Définit : `FUSIONS`

**`bosses.js`** — Boss : ordre, PV par niveau d'alerte, phases, définitions (BOSS_DEFS).

- Définit : `BOSS_ORDER`, `BOSS_HP_BY_ALERT`, `BOSS_PHASE2_FROM`, `bossPhaseThresholds`, `BOSS_SPRITES`, `DOUBLE_BOSS_HP_MUL`, `BOSS_TIER_HP`, `BOSS_TIER_DMG`, `BOSS_ALERT_DMG`, `BOSS_DMG_CAP`, `BOSS_DEFS`

**`image-assets.js`** — Planches de sprites chargées depuis assets/sprites (constantes *_B64).

- Définit : `GRUNT_SHEET_B64`, `EXPLOSION_SHEET_B64`, `TURRET_SHEET_B64`, `TURRET_EXPL_B64`, `TURRET_BULLET_B64`, `SHOOTER_SHEET_B64`, `SHOOTER_EXPL_B64`, `SHOOTER_BULLET_B64`, `DRONE2_SHEET_B64`, `DRONE2_EXPL_B64`, `DIVER2_SHEET_B64`, `DIVER2_EXPL_B64`, `TANK2_SHEET_B64`, `TANK2_EXPL_B64`, `TANK2_BULLET_B64`, `ELITE2_SHEET_B64`, `ELITE2_EXPL_B64`, `ELITE2_BULLET_B64`, `CHARO_SHEET_B64`, `CHARO_EXPL_B64`, `CHARO_BULLET_B64`, `BOMBER2_SHEET_B64`, `BOMBER2_EXPL_B64`, `BOMBER2_BULLET_B64`, `SWARMER2_SHEET_B64`, `SWARMER2_EXPL_B64`, `PLAYER_BASE_B64`, `PLAYER_T2_B64`, `PLAYER_T3_B64`, `PLAYER_T4_B64`, `EARTH_B64`, `PLANET_W2_B64`, `PLANET_W3_B64`, `CLOUDS_EARTH_B64`, `ORBIT_W1_B64`, `LEVEL_ICONS`, `PLAYER_BULLET_B64`, `PLAYER_MISSILE_B64`, `BOSS2_SHEET_B64`, `BOSS2_EXPL_B64`, `BOSS2_BULLET_B64`, `SHIELDEDGRUNT2_B64`, `SHIELDEDGRUNT2_EXPL_B64`, `MINE2_B64`, `MINE2_EXPL_B64`, `SPLITTER_IDLE_B64`, `SPLITTE …

**`boss-antenne.js`** — Boss du tuto (« Antenne-Mère ») : réglages VISUELS seulement (états d'usure, accroches du feu et de la fumée, effets). Les valeurs de jeu (PV, tirs, dégâts) restent dans TUTO_TUNE.boss.

- Définit : `AC`, `FX_ANCHOR`

**`boss-lights.js`** — Jeu de lumières des boss : voyants qui pulsent ou clignotent, balayage radar, gyrophare. Positions en pixels du sprite 512 ; elles suivent le boss et disparaissent avec la pièce qui les porte (masque du sprite). m : 'pulse' (respi

- Définit : `BOSS_LIGHTS`

**`enemy-art.js`** — Table ENEMY_ART : quelle planche/animation pour quel ennemi.

- Définit : `ENEMY_ART`

### `src/ui/`

**`pixel-icons.js`** — Icônes pixel : réduit les émojis en 16x16 avec contour.

- Définit : `PX_CACHE`, `pxEmoji`, `pxImg`

**`ui-icons.js`** — Icônes d'interface en pixel art (12x12, dessinées par tools/gen_ui_icons.py) : elles remplacent les glyphes / émojis de l'interface. uiIco('lock', 12)  -> HTML <img> prêt à insérer dans un innerHTML (12 px dans le texte, 24 px pou

- Définit : `UI_ICONS`, `uiIco`, `uiIconsInit`

**`dom.js`** — Méthodes de GameScene — interface HTML : menus, boutons, écran de départ.

- Méthodes ajoutées à `GameScene` (mixin) : `setupDom`, `openPauseMenu`, `fillPauseSub`, `resetQuitConfirm`, `updateSettingsLabels`, `showStartScreen`

**`motion.js`** — Animations des menus (GSAP, vendor/gsap.min.js) : retour tactile des boutons, respiration du CTA, entrée des pages, cartes en cascade, compteurs. Tout est sans effet si GSAP est absent ou si le joueur demande moins d'animations (p

- Définit : `MOTION_PRESS`, `Motion`

**`norma.js`** — N.O.R.M.A. — assistante administrative embarquée de l'AGP. Elle parle par transmissions courtes (bandeau en haut de l'écran, jamais bloquant), dans l'accueil (bandeau d'information), au début d'une mission, face à un boss, quand l

- Définit : `Norma`
- Méthodes ajoutées à `GameScene` (mixin) : `normaStart`, `normaBoss`, `normaLow`

**`pages.js`** — Méthodes de GameScene — pages du menu : classement, stats, bestiaire, collection, pactes, succès, pause.

- Méthodes ajoutées à `GameScene` (mixin) : `getTextureFrameDataURL`, `renderLeaderboardPage`, `pauseGearItems`, `globalGearItems`, `globalGearSummary`, `renderPauseGear`, `renderStatsPage`, `renderBestiaryPage`, `renderCodexPage`, `renderPactsPage`, `renderAchievementsPage`

**`tree-ui.js`** — Méthodes de GameScene — arbre de compétences : une page par branche, une carte par compétence (les rangs sont des pastilles), fiche en bas pour le détail et l'achat. Les données (rangs sauvegardés, coûts, déblocages) viennent de d

- Définit : `TREE_BRANCH_ICONS`, `_treeLayout`, `treeLayout`
- Méthodes ajoutées à `GameScene` (mixin) : `treeCardInfo`, `treeBranchPoints`, `treeCardHtml`, `renderTree`, `setupTreeUi`, `selectTreeNode`, `refreshTreeSheet`, `codexMark`, `investTreeNode`

**`hud.js`** — Méthodes de GameScene — HUD : secousse, rang de style, barres.

- Méthodes ajoutées à `GameScene` (mixin) : `shakeHud`, `updateStyleHud`, `hudFlash`, `updateHud`

### `src/data/worlds/`

**`monde-1.js`** — Monde 1 — BROUILLON : valeurs provisoires pour tester le moteur (étape 8 du plan : contenu et équilibrage).


**`monde-2.js`** — Monde 2 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage).


**`monde-3.js`** — Monde 3 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage).


### `src/gfx/`

**`pixel-textures.js`** — Génération d'une texture à partir de lignes de pixels.

- Définit : `buildPixelTexture`

**`sprite-rows.js`** — Sprites pixel dessinés en code (vaisseau, ennemis de base, projectiles).

- Définit : `PLAYER_ROWS`, `PLAYER_PAL`, `PLAYER_T2_ROWS`, `PLAYER_T3_ROWS`, `PLAYER_T2_PAL`, `PLAYER_T3_PAL`, `GRUNT_ROWS`, `GRUNT_PAL`, `SHOOTER_ROWS`, `SHOOTER_PAL`, `DRONE_ROWS`, `DRONE_PAL`, `TANK_ROWS`, `TANK_PAL`, `SWARMER_ROWS`, `SWARMER_PAL`, `DIVER_ROWS`, `DIVER_PAL`, `TURRET_ROWS`, `TURRET_PAL`, `SPLITTER_ROWS`, `SPLITTER_PAL`, `SHIELDED_GRUNT_ROWS`, `SHIELDED_GRUNT_PAL`, `BOMBER_ROWS`, `BOMBER_PAL`, `SNIPER_ROWS`, `SNIPER_PAL`, `HEALER_ROWS`, `HEALER_PAL`, `MINE_ROWS`, `MINE_PAL`, `GHOST_ROWS`, `GHOST_PAL`, `ELITE_ROWS`, `ELITE_PAL`, `MOTHERSHIP_ROWS`, `MOTHERSHIP_PAL`, `VORTEX_ROWS`, `VORTEX_PAL`, `BOMB_ROWS`, `BOMB_PAL`, `BOSS_ROWS`, `BOSS_PAL`, `BULLET_P_ROWS`, `BULLET_P_PAL`, `LASER_ROWS`, `LASER_PAL`, `MISSILE_ROWS`, `MISSILE_PAL`, `BULLET_E_ROWS`, `BULLET_E_PAL`, `BULLET_HEAVY_ROWS`, `BULLET_HEAVY_PAL`

**`procedural.js`** — Textures procédurales : auras de bouclier, cristaux, planètes, nébuleuses, galaxies.

- Définit : `AURA_PAD`, `mkCanvas`, `silhouetteOf`, `dilateSil`, `buildShieldAuraCanvas`, `GEM_SS`, `GEM_KINDS`, `GEM_SPARK`, `gemCell`, `drawGemFacets`, `buildGemStripCanvas`, `HEAL_ROWS`, `HEAL_PAL`, `DRONE_SAT_ROWS`, `DRONE_SAT_PAL`, `BG_ZONES`, `hexShade`, `buildPlanetCanvas`, `buildNebulaCanvas`, `buildGalaxyCanvas`, `buildShockRingCanvas`

**`boss-art.js`** — Sprites 8 bits des boss (BOSS_ART).

- Définit : `BOSS_ART`

**`mob-art.js`** — Sprites 8 bits des mobs (MOB_ART, MOB_ART2) et planches de pixels.

- Définit : `MOB_ART`, `MOB_ART2`, `buildPixelSheet`

**`builders.js`** — Construction des textures de boss, mobs et fonds au démarrage.

- Définit : `buildBossPlaceholders`, `buildMobArt`, `buildBackgroundTextures`, `PARTICLE_ROWS`, `PARTICLE_PAL_LIST`

**`planets.js`** — Planètes en pixel art générées en code (aucun fichier image) : sphère éclairée par le haut-gauche, relief ou bandes, palette propre à chaque monde. makePlanetTexture(scene, key, { size, seed, palette:[0xRRGGBB… du plus sombre au p

- Définit : `_hash3`, `_vnoise`, `_fbm`, `worldPlanetTexture`, `makePlanetTexture`

### `src/audio/`

**`music-data.js`** — Liste des fichiers de musique (MUSIC_FILES).

- Définit : `MUSIC_FILES`

**`volume.js`** — Volumes (VOL).

- Définit : `VOL`

**`sfx-engine.js`** — Moteur de sons : classe Sfx (synthèse, lecture des sons enregistrés) et outils de matière.

- Définit : `Sfx`, `rnd`, `STRIKE`, `strike`, `scatter`, `swell`, `chord`
- Méthodes de la classe `Sfx` : `constructor`, `ensureCtx`, `loadFiles`, `playFile`, `loopSet`, `setNebula`, `setHole`, `resume`, `setMuted`, `applyVol`, `ok`, `v`, `n`, `V`, `N`, `noise`, `play`

**`sfx-files.js`** — Sons enregistrés (SFX_FILES) qui remplacent la version synthétique du même nom.

- Définit : `SFX_FILES`

**`sfx-lib.js`** — Bibliothèque de sons synthétiques (SFX_LIB) et instance globale sfx.

- Définit : `SFX_LIB`, `sfx`

**`music.js`** — Lecture de la musique : MusicLoop, FileMusic, instance globale music.

- Définit : `MusicLoop`, `MUSIC_SLOTS`, `MUSIC_BOSS`, `MUSIC_BOSS_KEYS`, `musicLen`, `MUSIC_BAR_S`, `FileMusic`, `music`
- Méthodes de la classe `MusicLoop` : `constructor`, `setIntensity`, `ensure`, `setMuted`, `applyVol`, `setScene`, `start`, `startProc`, `pump`, `stepSec`, `setMood`, `note`, `drum`, `playStep`, `stop`
- Méthodes de la classe `FileMusic` : `constructor`, `supported`, `ensure`, `slotNow`, `keysOf`, `pickKey`, `load`, `keepSet`, `housekeeping`, `start`, `stop`, `tick`, `switchTo`

**`scene-audio.js`** — Méthodes de GameScene — sons de mort et ambiance musicale selon la situation.

- Méthodes ajoutées à `GameScene` (mixin) : `killSound`, `updateMusicMood`

### `src/scenes/`

**`BootScene.js`** — Scène de chargement : crée toutes les textures et animations.

- Définit : `BootScene`
- Méthodes de la classe `BootScene` : `constructor`, `create`, `sliceIntoFrames`, `finishBoot`

**`GameScene.js`** — Scène principale. Les méthodes sont réparties dans les fichiers suivants (mixin).

- Définit : `GameScene`
- Méthodes de la classe `GameScene` : `constructor`, `create`

**`HomeScene.js`** — Accueil : décor animé (canvas) + panneaux HTML (#home). Les méthodes sont dans src/home/ (mixin), comme GameScene. Trois pages côte à côte : HANGAR (-1) · CARTE (0, par défaut) · ARBRE (+1). La partie jouable reste GameScene (scèn

- Définit : `HomeScene`
- Méthodes de la classe `HomeScene` : `constructor`, `create`, `update`

### `src/home/`

**`background.js`** — —

- Définit : `PLANET_BIG`, `HOME_ORBIT`
- Méthodes ajoutées à `HomeScene` (mixin) : `buildHomeBackground`, `updateHomeBackground`, `buildHomePlanet`, `drawHomeOrbit`, `setHomePlanet`, `setHomeBackPlanet`, `updateHomeBackPlanet`, `buildHomeVan`, `moveHomeVan`, `applyHomeSkin`, `applyHomeParts`, `setHomeVanTier`, `updateHomeVan`

**`galaxy.js`** — Méthodes de HomeScene — carte stellaire : tous les mondes sur une route sinueuse, défilement au doigt avec inertie, voyage en hyperespace, zoom vers un monde, animation de déblocage d'un nouveau monde.

- Définit : `GAL_STEP`, `GAL_FONT`
- Méthodes ajoutées à `HomeScene` (mixin) : `galaxyPos`, `galaxyCurve`, `buildGalaxy`, `refreshGalaxy`, `updateGalaxy`, `warpPulse`, `setMapDom`, `homeToast`, `enterGalaxy`, `enterWorldView`, `tapGalaxy`, `resetMapView`, `playWorldUnlock`

**`garage.js`** — Garage : décor et assemblage des sprites ; les six postes de l'atelier (data/atelier.js) s'achètent ici en composants ◆.

- Définit : `AtelierGarage`

**`ui.js`** — Méthodes de HomeScene — panneaux HTML de l'accueil : pages, carte des niveaux, hangar, arbre, lancement.

- Définit : `HOME_STAT_LINES`, `levelGoalText`
- Méthodes ajoutées à `HomeScene` (mixin) : `setupHomeUi`, `enterHome`, `leaveHome`, `refreshHome`, `goHomePage`, `selectHomeLevel`, `renderHomeMap`, `finitionLine`, `renderHomeHangar`, `renderHomeTree`, `refreshHomeStats`, `showHomeTree`, `launchLevel`

### `src/world/`

**`background.js`** — Méthodes de GameScene — fond étoilé, zones de décor, zoom et limites visibles.

- Méthodes ajoutées à `GameScene` (mixin) : `buildStarfield`, `pickBgZone`, `galaxyBlast`, `fitBgToView`, `updateBgDecor`, `computeZoom`, `visibleXRange`, `visibleYRange`, `setTarget`

**`pickups.js`** — Méthodes de GameScene — cristaux d'XP, soins, mob doré.

- Méthodes ajoutées à `GameScene` (mixin) : `spawnGemAt`, `spawnGolden`, `goldJackpot`, `onCollectGem`, `onCollectHeal`, `spawnGemBurst`

**`composants.js`** — Méthodes de GameScene — composants ◆ : lâchés par les machines détruites, ramassés à l'aimant, comptés dans le HUD (règles : data/composants.js).

- Méthodes ajoutées à `GameScene` (mixin) : `spawnComposantAt`, `composantDrop`, `composantShower`, `onCollectComposant`, `updateComposants`, `composantsOnScreenValue`

**`meteors.js`** — Méthodes de GameScene — météorites.

- Méthodes ajoutées à `GameScene` (mixin) : `spawnBgMeteor`, `spawnMeteor`, `splitMeteor`

### `src/systems/`

**`achievements.js`** — Méthodes de GameScene — succès en cours de partie : kills, paliers, notifications.

- Méthodes ajoutées à `GameScene` (mixin) : `achvOnKill`, `achvCheck`, `applyAchvBuffLive`, `notice`, `achvToast`, `achvPump`

**`combo.js`** — Méthodes de GameScene — combo et rang de style (multiplicateur d'XP).

- Méthodes ajoutées à `GameScene` (mixin) : `styleRank`, `xpMul`, `comboKill`, `bankCombo`, `showCombo`

**`overdrive.js`** — Méthodes de GameScene — Overdrive.

- Méthodes ajoutées à `GameScene` (mixin) : `addOverdrive`, `odPower`, `activateOverdrive`, `updateOverdrive`

**`relics-fusions.js`** — Méthodes de GameScene — choix de reliques et fusions.

- Méthodes ajoutées à `GameScene` (mixin) : `showRelicChoice`, `pickFusions`, `eligibleFusions`

**`skills.js`** — Méthodes de GameScene — compétences actives : ralenti, dernier souffle, foudre en chaîne, updateSkills.

- Méthodes ajoutées à `GameScene` (mixin) : `startSlowmo`, `endSlowmo`, `lastStand`, `chainLightning`, `updateSkills`

### `src/fx/`

**`effects.js`** — Méthodes de GameScene — effets : explosion kamikaze, toiles, explosions de mort.

- Méthodes ajoutées à `GameScene` (mixin) : `kamikazeBlast`, `updateWebs`, `deathExplosion`, `explodeFx`

**`boss-lights.js`** — Méthodes de GameScene — JEU DE LUMIÈRES des boss (voyants, radar, gyrophare). Les définitions sont dans data/boss-lights.js. Usage : `const L = this.blInit('meteo')` à la création du boss, `this.blUpdate(L, delta, { toWorld, solid

- Méthodes ajoutées à `GameScene` (mixin) : `blInit`, `blUpdate`, `blDestroy`

**`particles.js`** — Méthodes de GameScene — particules : bris de bouclier, traînée de réacteur, impacts.

- Méthodes ajoutées à `GameScene` (mixin) : `spawnShieldBreak`, `spawnEngineTrail`, `spawnHitParticles`

**`juice.js`** — JUICE — retour de sensation (« game feel ») centralisé. Trois outils, tous réglés ICI : juiceStop(kind)         arrêt sur image très court (hit-stop) : le temps de jeu se fige ~50-110 ms sur les impacts qui comptent

- Définit : `JUICE`
- Méthodes ajoutées à `GameScene` (mixin) : `juiceStop`, `juiceShake`, `juicePunch`, `juiceHit`, `juiceKill`, `juiceHurt`, `juiceTex`, `_juiceKz`, `juiceFire`, `juiceSpark`, `juiceImpact`, `juiceNumber`, `juiceMagnet`, `juiceGemRate`

### `src/game/`

**`run.js`** — Méthodes de GameScene — cycle d'une partie : démarrage, reprise, fin, mort du joueur.

- Méthodes ajoutées à `GameScene` (mixin) : `resumeRun`, `startRun`, `endRun`, `playerDeathFx`

**`level.js`** — Méthodes de GameScene — niveaux des mondes : objectif, événements du niveau, victoire. `this.lvDef` = définition du niveau en cours (data/worlds), null pour l'ancienne partie infinie (bouton DEMARRER, bac à sable).

- Méthodes ajoutées à `GameScene` (mixin) : `levelInit`, `levelUpdate`, `levelZoom`, `levelProgress`, `levelWin`

**`tuto.js`** — Méthodes de GameScene — TUTO (niveau 1 du monde 1, `w1-tuto`, / bouton DEV) : 3 étapes pédagogiques (bouger, tirer, boss), satellites + débris, boss satellite. Une seule boîte de consigne : N.O.R.M.A. (ui/norma.js). La FINITION (%

- Définit : `TUTO_ID`, `TUTO_STEPS`
- Méthodes ajoutées à `GameScene` (mixin) : `tutoInit`, `tutoSay`, `tutoSfx`, `tutoUiInit`, `tutoUiClear`, `tutoStepEnter`, `tutoStepProgress`, `tutoStepCheck`, `tutoComp`, `tutoUiUpdate`, `tutoSpawnSat`, `tutoHitSat`, `tutoKillSat`, `tutoHitBox`, `tutoSpawnLogic`, `tutoUpdate`, `tutoSpawnBoss`, `tutoBossShot`, `tutoBossUpdate`, `tutoBossDie`, `tutoReward`, `tutoBank`, `tutoShowEnd`, `tutoCleanup`, `tutoFinish`, `tutoPlayerDied`

**`tuto-boss-fx.js`** — Méthodes de GameScene — HABILLAGE VISUEL du boss du tuto (Antenne-Mère) : sprite « vivant », 4 états d'usure, feu et fumée accrochés aux trous, éclats découpés dans le sprite, tirs en boules d'énergie animées, charge du canon, exp

- Méthodes ajoutées à `GameScene` (mixin) : `acBossBuild`, `acDrawLive`, `acPix`, `acW`, `acFx`, `acBossUpdate`, `acFollow`, `acSetState`, `acRandomHull`, `acRebuildFlames`, `acBreak`, `acShard`, `acBossHit`, `acHitFlash`, `acShot`, `acChargeStart`, `acChargeStop`, `acDeathBoom`, `acDeathFinal`, `acBossClear`

**`loop.js`** — Méthodes de GameScene — boucle principale update().

- Méthodes ajoutées à `GameScene` (mixin) : `update`, `cleanupGroup`

**`difficulty.js`** — Méthodes de GameScene — difficulté : cadence d'apparition, niveau d'alerte, multiplicateurs de PV et de dégâts.

- Méthodes ajoutées à `GameScene` (mixin) : `getSpawnInterval`, `updateDifficulty`, `raiseAlert`, `lateDmgMul`, `hpScaleNow`, `enemyDmgMul`

**`intro.js`** — Méthodes de GameScene — cinématique d'intro : décollage depuis la Terre.

- Méthodes ajoutées à `GameScene` (mixin) : `introPlanet`, `introEarthInit`, `introEarthUpdate`, `introTrail`, `introApex`, `introLanding`, `panOf`

### `src/dev/`

**`sandbox.js`** — Méthodes de GameScene — bac à sable DEV et HUD des événements.

- Méthodes ajoutées à `GameScene` (mixin) : `updateDevEventHud`, `destroySandboxUI`, `buildSandboxUI`

**`editor-hook.js`** — Pont entre le jeu et l'éditeur de niveaux (editor.html). Inactif sans ?edit dans l'URL. ?edit=play : aperçu jouable dans l'éditeur   ·   ?edit=bot : jeu caché où tourne le joueur automatique (tools/sim/bot.js)


### `src/player/`

**`weapons.js`** — Méthodes de GameScene — armes du joueur : tirs, missiles, drone, nuke, ciblage.

- Méthodes ajoutées à `GameScene` (mixin) : `firePlayerBullets`, `getLaserDamage`, `getLaserSpeed`, `getEffectiveFireRate`, `rollDamage`, `findNearestEnemies`, `fireNuke`, `fireSwarmMissile`, `updateDrone`, `fireMissiles`, `updateMissiles`, `findNearestEnemy`

**`damage.js`** — Méthodes de GameScene — dégâts subis par le joueur : armure, bouclier, esquive, réflexion.

- Méthodes ajoutées à `GameScene` (mixin) : `updateShipDamage`, `damagePlayer`, `reflectShieldDamage`, `tryDodge`

**`skin.js`** — Méthodes de GameScene — apparence (teinte) de la camionnette. Les effets qui teintent le vaisseau (dégâts, glace) passent par ici pour ne pas effacer l'apparence choisie.

- Méthodes ajoutées à `GameScene` (mixin) : `applyShipSkin`, `mulSkin`

**`progression.js`** — Méthodes de GameScene — montée de niveau, cartes d'amélioration, palier du vaisseau.

- Méthodes ajoutées à `GameScene` (mixin) : `levelUp`, `showUpgradeCards`, `cardCount`, `renderCardChoices`, `rerollCards`, `updateShipTier`

### `src/enemies/`

**`spawning.js`** — Méthodes de GameScene — apparition des ennemis et des vagues.

- Méthodes ajoutées à `GameScene` (mixin) : `spawnEnemy`, `spawnOneEnemy`

**`ai.js`** — Méthodes de GameScene — comportement des ennemis : déplacement, tirs, esquive, mines, bombes, soigneur.

- Méthodes ajoutées à `GameScene` (mixin) : `eSpd`, `rollFireCd`, `inFiringPosition`, `spreadOffsets`, `enemyShootSpread`, `spawnDodgeGhost`, `tryDodgePlayerBullets`, `updateEnemyAI`, `enemyShoot`, `enemyShootHeavy`, `deployMine`, `dropBomb`, `enemySatShot`, `satDebris`, `enemySnipeShot`, `healerPulse`

**`bras.js`** — Méthodes de GameScene — mob « Bras écartés » (type 'bras') : coque à quatre perches qui chargent en bleu et tirent des orbes bleues. 4 états d'usure dessinés (planche brasSheet) selon la vie ; une perche arrachée ne tire plus ; à 

- Définit : `BRAS`
- Méthodes ajoutées à `GameScene` (mixin) : `brasInit`, `brasUpdate`, `brasPlan`, `brasShooter`, `brasOrb`, `brasPort`, `brasPix`, `brasPortAlive`, `brasHullPoint`, `brasPiece`, `brasLaunch`, `brasShards`, `brasWound`, `brasDeath`

**`pilleur.js`** — Méthodes de GameScene — mob « Le Pilleur de cristaux » (type 'pilleur', niveau `w1-l3`). Drone-collecteur : sa trappe dorsale s'ouvre, il ASPIRE les cristaux qui passent à portée (ceux que tu voulais ramasser), chaque cristal aval

- Définit : `PIL`
- Méthodes ajoutées à `GameScene` (mixin) : `pilInit`, `pilP`, `pilPix`, `pilSolid`, `pilDoor`, `pilUpdate`, `plLoopsApply`, `pilGulp`, `pilFx`, `pilDraw`, `pilPiece`, `pilLaunch`, `pilShards`, `pilWound`, `pilDeath`

**`eclaireur.js`** — Méthodes de GameScene — mob « L'Éclaireur de patrouille » (type 'eclaireur', niveau `w1-l4`, et lancé par les baies du boss L'Anneau). Drone-œil : il patrouille en balayant le sol d'un projecteur violet (dont le bout s'estompe en 

- Définit : `EC`
- Méthodes ajoutées à `GameScene` (mixin) : `ecInit`, `ecP`, `ecPix`, `ecSolid`, `ecWAlive`, `ecFx`, `ecUpdate`, `ecStep`, `ecSfx`, `ecVolley`, `ecSummon`, `ecDraw`, `ecLockUpdate`, `ecPiece`, `ecLaunch`, `ecShards`, `ecWound`, `ecDeath`

**`squads-shields.js`** — Méthodes de GameScene — escouades, boucliers ennemis, esquive coordonnée.

- Méthodes ajoutées à `GameScene` (mixin) : `coordRole`, `coordResist`, `leadAngle`, `squadShift`, `shieldShatter`, `auraTexFor`, `enemyOnScreenLoose`, `updateEnemyShields`, `updateDodge`, `updateSquads`

### `src/bosses/`

**`core.js`** — Méthodes de GameScene — boss : apparition, phases, tirs, barre de vie, victoire.

- Méthodes ajoutées à `GameScene` (mixin) : `bossEls`, `spawnDoubleBoss`, `spawnBoss`, `nextBossId`, `deferSpawn`, `bossPhase`, `bossPhaseChange`, `bossShot`, `updateHomingBullets`, `muzzleY`, `aimFrom`, `countEnemies`, `blinkHit`, `partBoom`, `updateBossAI`, `onBossDefeated`, `spawnBonusBoss`, `bossSecondForm`

**`parts.js`** — Méthodes de GameScene — pièces de boss : tentacules, têtes, dégâts par pièce, repousse.

- Méthodes ajoutées à `GameScene` (mixin) : `makeBossPart`, `initBossParts`, `spawnTentacleSegs`, `cutTentacle`, `spawnHead`, `ruBee`, `headRegrowFx`, `updateHydraLabel`, `damageBossPart`, `onBossPartKilled`, `cleanupBossParts`, `damageBossAll`, `refreshBossBar`, `setupBossTicks`, `syncBossArt`

**`ai.js`** — Méthodes de GameScene — IA spécifique de chaque boss (dread, faucheuse, ruche, prisme, kraken, éclipse, hydre).

- Méthodes ajoutées à `GameScene` (mixin) : `bossAI_dread`, `bossAI_faucheuse`, `bossAI_ruche`, `bossAI_prisme`, `bossAI_kraken`, `bossAI_eclipse`, `startMirage`, `endMirage`, `bossAI_hydre`, `layoutBossParts`

**`araignee.js`** — Méthodes de GameScene — boss « Araignée de tri » (boss du niveau `w1-l2`, `finalBoss:'araignee'` dans data/worlds/monde-1.js). Autonome comme le boss du tuto : son état est dans `this.ar`. Elle TRIE : BENNES (les trappes des bras 

- Définit : `AR`
- Méthodes ajoutées à `GameScene` (mixin) : `arStart`, `arSfx`, `arPix`, `arSolid`, `arPlace`, `arW`, `arS`, `arBayDir`, `arBayAlive`, `arHullPoint`, `arDoors`, `arDrawBays`, `arPieceCanvas`, `arThrow`, `arShard`, `arShards`, `arBreakLimbs`, `arDeathPieces`, `arBoom`, `arSmoke`, `arSpark`, `arFlames`, `arStageOf`, `arDamage`, `arWound`, `arHits`, `arCloseBays`, `arStartAttack`, `arUpdateAttack`, `arLaunch`, `arUpdateShots`, `arDrawBeam`, `arUpdate`, `arStep`, `arDie`, `arDead`

**`meteo.js`** — Méthodes de GameScene — boss « La Météo » (boss de fin du niveau `w1-l1`, `finalBoss:'meteo'` dans data/worlds/monde-1.js). Autonome comme l'Araignée de tri (bosses/araignee.js) : son état est dans `this.mt`. Elle FAIT L'ORAGE : É

- Définit : `MT`
- Méthodes ajoutées à `GameScene` (mixin) : `mtStart`, `mtSfx`, `mtPix`, `mtSolid`, `mtPlace`, `mtW`, `mtS`, `mtRodAlive`, `mtTubeAlive`, `mtWingAlive`, `mtHullPoint`, `mtPieceCanvas`, `mtThrow`, `mtShard`, `mtShards`, `mtBreakLimbs`, `mtDeathPieces`, `mtFx`, `mtBoom`, `mtSmoke`, `mtSpark`, `mtArcFx`, `mtBolt`, `mtFlames`, `mtStageOf`, `mtDamage`, `mtWound`, `mtHits`, `mtAvailable`, `mtStartAttack`, `mtEndAttack`, `mtUpdateAttack`, `mtHailStone`, `mtCurtain`, `mtDrawStrikes`, `mtUpdateStrikes`, `mtUpdateCurtains`, `mtClearAttacks`, `mtUpdate`, `mtStep`, `mtAtkType`, `mtHailStonesClear`, `mtDie`, `mtDead`

**`reacteur.js`** — Méthodes de GameScene — boss « Le Réacteur » (boss de fin du niveau `w1-l3`, `finalBoss:'reacteur'` dans data/worlds/monde-1.js). Autonome comme l'Araignée et la Météo : son état est dans `this.rx`. Il IRRADIE : RAYONNEMENT (le cœ

- Définit : `RX`
- Méthodes ajoutées à `GameScene` (mixin) : `rxStart`, `rxSfx`, `rxPix`, `rxSolid`, `rxPlace`, `rxW`, `rxS`, `rxCapAlive`, `rxHeat`, `rxHullPoint`, `rxPieceCanvas`, `rxThrow`, `rxShard`, `rxShards`, `rxBreakLimbs`, `rxDeathPieces`, `rxFx`, `rxBoom`, `rxSmoke`, `rxSpark`, `rxFlames`, `rxStageOf`, `rxDamage`, `rxWound`, `rxHits`, `rxAvailable`, `rxStartAttack`, `rxEndAttack`, `rxUpdateAttack`, `rxOrb`, `rxGlob`, `rxStream`, `rxLand`, `rxUpdateWaves`, `rxAngDiff`, `rxUpdateShots`, `rxUpdate`, `rxStep`, `rxClearAttacks`, `rxDie`, `rxDead`

**`anneau.js`** — Méthodes de GameScene — boss « L'Anneau » (boss de fin du niveau `w1-l4`, `finalBoss:'anneau'` dans data/worlds/monde-1.js). Autonome comme l'Araignée, la Météo et le Réacteur : son état est dans `this.an`. Une station orbitale do

- Définit : `AN`
- Méthodes ajoutées à `GameScene` (mixin) : `anStart`, `anSfx`, `anSrc`, `anPix`, `anTex`, `anSolid`, `anTurAlive`, `anPlace`, `anW`, `anS`, `anHullPoint`, `anPieceCanvas`, `anThrow`, `anShard`, `anShards`, `anBreakLimbs`, `anDeathPieces`, `anFx`, `anBoom`, `anSmoke`, `anSpark`, `anFlames`, `anStageOf`, `anDamage`, `anWound`, `anHits`, `anStartAtk`, `anOrb`, `anUpdateAttack`, `anLaunch`, `anUpdate`, `anStep`, `anLights`, `anDoors`, `anClearAttacks`, `anDie`, `anDead`

**`pdg.js`** — Méthodes de GameScene — boss final « Le PDG dans sa tour » (boss de fin du niveau `w1-l5`, `finalBoss:'pdg'` dans data/worlds/monde-1.js). Autonome comme les autres boss de fin : son état est dans `this.pd`. Il a quatre attaques e

- Définit : `PD`, `PD_SHEET`
- Méthodes ajoutées à `GameScene` (mixin) : `pdStart`, `pdSfx`, `pdSrc`, `pdPix`, `pdSolidK`, `pdBsol`, `pdPlace`, `pdW`, `pdS`, `pdSlotX`, `pdSlotY`, `pdTaken`, `pdHullPoint`, `pdWingOn`, `pdPiece`, `pdThrow`, `pdShard`, `pdShards`, `pdBreakLimbs`, `pdDeathPieces`, `pdLitter`, `pdFx`, `pdBoom`, `pdSmoke`, `pdSpark`, `pdFlames`, `pdStageOf`, `pdDamage`, `pdWound`, `pdHits`, `pdSummonShips`, `pdHurtShip`, `pdShipDie`, `pdKillShipObj`, `pdHurtGuard`, `pdGuardShatter`, `pdKillGuardObj`, `pdUpdateEntities`, `pdDrawEntities`, `pdStartAtk`, `pdOrb`, `pdUpdateAttack`, `pdUpdate`, `pdStep`, `pdLights`, `pdDie`, `pdDead`

### `src/combat/`

**`damage.js`** — Méthodes de GameScene — collisions et dégâts sur les ennemis, mort des ennemis.

- Méthodes ajoutées à `GameScene` (mixin) : `enemyShielded`, `onBulletHitsEnemy`, `onMissileHitsEnemy`, `enemyOnScreen`, `applyDamageToEnemy`, `killEnemy`, `onEnemyHitsPlayer`, `onEnemyBulletHitsPlayer`

### `src/events/`

**`core.js`** — Méthodes de GameScene — planification et déroulement des événements, nébuleuse.

- Méthodes ajoutées à `GameScene` (mixin) : `planEvents`, `updateEventPlan`, `flipVortex`, `updateFrenzyHalos`, `ensureNebulaTextures`, `startNebula`, `endNebula`, `updateNebula`, `finishNebula`, `startEvent`, `updateEvent`, `endAllEvents`, `realBossAlive`, `updateSmallEvents`

**`types.js`** — Méthodes de GameScene — les différents événements : frappes, couloir, éclipse, EMP, glace, plasma, vortex magnétique.

- Méthodes ajoutées à `GameScene` (mixin) : `strikeAt`, `corrParams`, `corrCenter`, `corrClampX`, `startCorridor`, `tickCorridor`, `endCorridor`, `ensureFxTex`, `startEclipse`, `endEclipse`, `throwEmp`, `empBlast`, `staticStrike`, `distToSeg`, `startIce`, `tickIce`, `endIce`, `spawnShieldWall`, `spawnPlasma`, `killPlasma`, `startMagVortex`, `endMagVortex`, `updateSpecials`

**`forces.js`** — Méthodes de GameScene — puits de gravité et forces.

- Méthodes ajoutées à `GameScene` (mixin) : `addWell`, `removeWell`, `clearWells`, `updateForces`

### `src/`

**`main.js`** — Point d'entrée : configuration Phaser et démarrage.

- Définit : `config`, `_uiScale`, `fitUi`, `startGame`

