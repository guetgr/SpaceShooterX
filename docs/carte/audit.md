<!-- Généré par tools/gen_codemap.py : ne pas modifier à la main (relancer le script). -->

# Audit automatique : doublons, références cassées, candidats code mort

Résultat brut du script : **à vérifier à la main** (analyse par expressions régulières, voir l'en-tête de `tools/gen_codemap.py`).

## Symboles de premier niveau définis dans plusieurs fichiers (0)

En portée globale, la dernière définition écrase les autres (ou plante pour `const`/`class`).


## Méthodes définies deux fois sur la même classe (0)

(`mixin` plante au démarrage dans ce cas : doit rester à 0.)


## Références cassées

- Ids demandés au DOM mais inexistants : aucun
- `asset(...)` hors manifeste : aucun

## Candidats « code mort » : fonctions / constantes de premier niveau qui n'apparaissent qu'une fois (4)

Un nom présent une seule fois dans tout le dépôt (src, index.html, editor.html, tools) n'est appelé nulle part. Sauf appel par nom construit dynamiquement ou depuis la console.

- `NORMA_POOLS` (const) — `src/data/level-norma.js`
- `setShipPart` (fonction) — `src/data/ship-skins.js`
- `HOME_ORBIT` (const) — `src/home/background.js`
- `HOME_STAT_LINES` (const) — `src/home/ui.js`

## Candidats « code mort » : méthodes jamais référencées par leur nom (3)

- `GameScene.startMagVortex` — `src/events/types.js`
- `HomeScene.applyHomeParts` — `src/home/background.js`
- `GameScene.showCombo` — `src/systems/combo.js`

## Outils (`tools/`)

- `tools/atelier_test.js` — Vérifie les règles de l'atelier (postes, Mk I à V, coûts, achat), sans navigateur : node tools/atelier_test.js
- `tools/build.py` — Fabrique les versions « un seul fichier HTML » du jeu (tout est embarqué : code, CSS, images, sons, polices).
- `tools/check_worlds.js` — Vérifie les mondes/niveaux (format) et la logique de progression, sans navigateur : node tools/check_worlds.js
- `tools/composants_test.js` — Vérifie les règles de calcul des composants (prime AGP, franchise d'accident), sans navigateur : node tools/composants_test.js
- `tools/cut_satgun.py` — Découpe la planche « satellite qui tire » (concept ChatGPT, fond peint + légendes) en une bande d'images 200x200 à fond transparent :
- `tools/editor/level-document.js` — (script ponctuel, sans description)
- `tools/editor/steps-model.js` — (script ponctuel, sans description)
- `tools/editor/steps-ui.js` — (script ponctuel, sans description)
- `tools/editor/timeline.js` — (script ponctuel, sans description)
- `tools/editor_steps_test.js` — (script ponctuel, sans description)
- `tools/editor_steps_ui_test.js` — (script ponctuel, sans description)
- `tools/enemy_stats_test.py` — Équivalence des stats des mobs (registre src/data/enemy-stats.js) + surcharge par niveau.
- `tools/event_params_node_test.js` — (script ponctuel, sans description)
- `tools/event_params_test.py` — Paramètres des événements (EVENT_DEFS) : équivalence avec le comportement d'origine.
- `tools/gen_codemap.py` — Génère la carte du code dans docs/carte/ (rien à installer : Python 3 seul).
- `tools/gen_manifest.py` — Régénère assets/manifest.json à partir du contenu de assets/ (à lancer après avoir ajouté/supprimé un fichier).
- `tools/gen_ui_icons.py` — Dessine les icônes d'interface en pixel art (12x12, contour sombre) et les écrit dans assets/sprites/ui_*.png, puis relance gen_manifest.py.
- `tools/home_test.py` — Test headless de l'accueil : pages (glisser, onglets), paramètres, arbre, retour. python tools/home_test.py
- `tools/import_decors_carte.py` — Importe les décors de la carte du monde livrés en PNG à fond transparent : planètes des mondes 2 et 3, nuages de la Terre, satellite en orbite
- `tools/import_sprites_niveaux.py` — Importe les icônes de niveaux livrées en PNG (256x256, fond transparent) : PNG RGBA -> assets/sprites/*.webp, puis relance gen_manifest.py. (Planètes,
- `tools/level_files.py` — Niveaux JSON : lecture, validation et cache JS pour scripts classiques/builds.
- `tools/level_files_test.py` — Validation et export des missions JSON dans un dossier temporaire.
- `tools/level_look_test.js` — (script ponctuel, sans description)
- `tools/level_test.py` — Test headless des niveaux des mondes : victoire par type d'objectif (survie, kills, cristaux, boss), défaite, déblocages, sauvegarde.
- `tools/norma_level_test.js` — (script ponctuel, sans description)
- `tools/orbital_home_test.py` — Régression du hublot : sélection, occlusion, finition, navigation et mobile.
- `tools/perks_test.py` — Atouts GLOBAUX (R&D, permanents) vs atouts de MISSION (cartes de la partie) : les modules R&D sont appliqués au décollage et listés séparément en paus
- `tools/rd_test.js` — Vérifie le catalogue des technologies et les règles de R&D (plans, prototypes, rangs, spécialisations), sans navigateur : node tools/rd_test.js
- `tools/serve.py` — Serveur local de développement (sans cache : tu modifies un fichier, tu rafraîchis la page, c'est pris en compte).
- `tools/sim/bot.js` — Simulateur d'équilibrage : joueur automatique + avance rapide, injecté dans la page par tools/sim_balance.py
- `tools/sim_balance.py` — Simulateur d'équilibrage des niveaux : un joueur automatique joue les niveaux en avance rapide (~60x le temps réel), sans affichage ni son.
- `tools/smoke_test.py` — Test de fumée headless : charge le jeu, lance une partie, vérifie qu'il n'y a aucune erreur JS.
- `tools/techs_test.py` — Technologies en mission : le chargement remplace l'arbre. Rien n'est actif au départ ; chaque technologie emportée s'ASSEMBLE par une carte
- `tools/timeline_export_test.py` — Vérifie l'export HTTP dans un dossier temporaire, sans toucher aux réglages du jeu.
- `tools/timeline_test.js` — Contrat des vagues : application, remise à zéro, temps, redémarrage et saturation.
- `tools/tunables_test.py` — Réglages internes des boss / mobs spéciaux (src/data/tunables.js, lvDef.bossTune).

## Documents (`docs/`, racine)

- `CLAUDE.md` — CLAUDE.md
- `PASSATION.md` — PASSATION — Space Shooter X (état au 26 oct. 2026)
- `README.md` — Space Shooter X
- `docs/HUD-MINIMAL.md` — HUD de mission — version minimale
- `docs/REPRISE-GARAGE.md` — Garage AGP — point de reprise
- `docs/arbre-competences.md` — L'arbre de compétences — fonctionnement et état des lieux
- `docs/bible-univers.md` — SPACE SHOOTER X
- `docs/brief-univers-agp.md` — Brief de référence — univers AGP, ton, interface (à lire avant de toucher à l'interface ou aux textes)
- `docs/captures-prompt-2026-10-26/README.md` — Space Shooter X — captures de référence
- `docs/carte-du-code.md` — Carte du code — point d'entrée
- `docs/catalogue-sons.md` — Space Shooter X — catalogue des effets sonores (nouvelle bibliothèque)
- `docs/charte-agp/charte-graphique.md` — Space Shooter X — Charte graphique AGP
- `docs/concepts-accueil-2026-10-27/comparaison-et-sprites.md` — Accueil AGP — proposition et sprites
- `docs/concepts-accueil-2026-10-27/plan-integration-hublot.md` — Plan de découpage et d'intégration — accueil hublot
- `docs/concepts-accueil-2026-10-27/prompt-v2-hublot.md` — Accueil V2 — parcours orbital et hublot
- `docs/concepts-accueil-2026-10-27/prompts-production.md` — Prompts de production — ImageGen intégré
- `docs/concepts-accueil-2026-10-27/prompts.md` — Prompts — ImageGen intégré
- `docs/concepts-atelier-2026-10-26/prompt-atelier-v2.md` — Atelier — révision visuelle V2
- `docs/concepts-atelier-2026-10-26/prompts.md` — Concepts atelier AGP
- `docs/concepts-atelier-2026-10-26/sprites/prompt-atelier-detaille.md` — Atelier détaillé
- `docs/concepts-atelier-2026-10-26/sprites/prompt-atelier-perspective-v2.md` — Atelier — perspective alignée sur le véhicule
- `docs/concepts-atelier-2026-10-26/sprites/prompt-atelier-vide.md` — Décor de la build atelier
- `docs/concepts-atelier-2026-10-26/sprites/prompt-decor-calibre-final.md` — Passe géométrique retenue
- `docs/concepts-atelier-2026-10-26/sprites/prompt-decor-calibre.md` — Décor calibré
- `docs/concepts-atelier-2026-10-26/sprites/prompt-fixations-v2.md` — Étude des fixations : aimant et canon
- `docs/concepts-atelier-2026-10-26/sprites/prompts-isolation-v2.md` — Modules isolés V2
- `docs/concepts-atelier-2026-10-26/sprites/prompts-menu-complements.md` — Visuels complémentaires du menu atelier
- `docs/concepts-atelier-2026-10-26/sprites/prompts.md` — Sprites atelier
- `docs/concepts-hud-2026-10-27/prompt-cartoon.md` — HUD — variante cartoon
- `docs/concepts-hud-2026-10-27/prompt-hud-atelier.md` — HUD — direction artistique de l’atelier
- `docs/concepts-hud-2026-10-27/prompt-hud-bureaucratique.md` — HUD — fiche de service AGP
- `docs/concepts-hud-2026-10-27/prompt-hud-minimal.md` — HUD minimal
- `docs/concepts-hud-2026-10-27/prompt-hud-simple.md` — HUD sobre — barres de référence
- `docs/concepts-rd-2026-10-27/direction-rd-cartes.md` — R&D — le dossier de cartes techniques
- `docs/concepts-rd-2026-10-27/implementation-sprites-rd.md` — R&D — plan d’intégration et découpage des sprites
- `docs/deroule-partie-complete.md` — Space Shooter X — déroulé d'UNE partie complète (alerte 1 → alerte 26 = boss final)
- `docs/direction-artistique-agp.md` — Direction artistique « AGP-OS » — première proposition
- `docs/editeur-niveaux.md` — Éditeur des missions — timeline et JSON
- `docs/menu-accueil.md` — Menu d'accueil, mondes et progression
- `docs/musique-suno.md` — Space Shooter X — cahier des charges de la musique (pour Suno)
- `docs/niveaux-alerte.md` — Space Shooter X — ce que fait le jeu à CHAQUE niveau d'alerte (relevé dans le code)
- `docs/prompts-chatgpt-boss.md` — Space Shooter X — prompts ChatGPT pour les 7 BOSS (avec leurs phases)
- `docs/prompts-chatgpt-sprites.md` — Prompts ChatGPT — planches des nouveaux monstres de Space Shooter X
- `docs/rapport-equilibrage.md` — Space Shooter X — rapport d'équilibrage (bot de test)
- `docs/responsive.md` — Responsive : même lisibilité sur téléphone, tablette et PC
- `docs/space-shooter-x-analyse.md` — SPACE SHOOTER X — Analyse équilibrage, cohérence et pouvoir addictif
- `docs/space-shooter-x-gameplay.md` — SPACE SHOOTER X — Boucle de gameplay détaillée
- `docs/suno-prompts.md` — Space Shooter X — les prompts Suno (version finale : 22 prompts = 44 morceaux pour 42 pistes)
- `docs/superpowers/plans/2026-10-27-atelier-v3.md` — Étape 2 — sauvegarde v3 et atelier à six postes : plan d'implémentation
- `docs/superpowers/plans/2026-10-27-plans-pieces.md` — Étape 4 — plans de technologie et pièces de secteur lâchés en mission : plan d'implémentation
- `docs/superpowers/plans/2026-10-27-progression-agp.md` — Refonte de la progression AGP — plan d'implémentation
- `docs/superpowers/plans/2026-10-27-rd-emplacements.md` — Étape 3 — R&D par technologie, emplacements, chargement et assemblage en mission : plan d'implémentation
- `docs/superpowers/plans/2026-10-28-editeur-complet.md` — Éditeur de niveaux complet — plan de travail
- `docs/superpowers/specs/2026-10-27-progression-design.md` — Refonte de la progression — composants, atelier, R&D, emplacements, cartes, livrées
- `docs/superpowers/specs/2026-10-28-level-builder.md` — Space Shooter X — Spécification du Level Builder
