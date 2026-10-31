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
Point d'entrée : **`docs/carte-du-code.md`** (flux vérifiés, table « où trouver quoi », conventions, pièges, tests). Index générés dans `docs/carte/` : **`symboles.md`** (nom → fichier, à consulter en premier), `fichiers.md`, `donnees.md`, `interface.md`, `audit.md`. Générés par `python3 tools/gen_codemap.py` ; `--check` échoue si la carte est périmée. Le script tourne en ~1 s. **Règle : après tout ajout/suppression de fichier ou de fonction, et avant de pousser, relancer le script** (en cas de conflit sur `docs/carte/`, le relancer). **Automatique** (à activer une fois par copie du dépôt, Mac et Windows : `git config core.hooksPath tools/hooks`) : le hook `tools/hooks/pre-commit` régénère et ajoute `docs/carte/` à chaque commit. `.gitattributes` fait fusionner `docs/carte/*.md` ligne à ligne (`merge=union`) : les ajouts de Guet et de Bio s'additionnent sans conflit, puis le script les remet d'équerre.

## Règles du code
- **Structure** : `index.html` (coque + HTML des menus/HUD) → `src/boot.js` (écran de chargement, charge `assets/manifest.json` en data-URI accessibles par `asset('sprites/x.png')`) → scripts de `src/scripts.json` **dans l'ordre** (portée globale partagée : un fichier n'utilise au démarrage que ce qui est défini plus haut ; tout nouveau fichier va dans `scripts.json`) → `src/main.js`.
- **Scènes** : `BootScene` (textures) → `GameScene` (le jeu, ~40 fichiers de méthodes en `mixin(GameScene, {…})`) ↔ `HomeScene` (accueil, méthodes dans `src/home/`). `mixin` plante au démarrage si une méthode est définie deux fois : Grep avant d'ajouter.
- **Boucle de jeu** : accueil → carte des secteurs → ordre de mission (`GameScene` avec `lvDef`, mondes dans `src/data/worlds/*.js`) → rapport d'intervention. Le tuto est le niveau `w1-tuto`. **Vocabulaire (décidé le 27 oct. 2026) : le tuto n'est pas un « niveau »/« ordre » ; « niveau 1 » (ou « ordre 1 ») désigne le premier ordre de mission *après* le tuto**, c'est-à-dire `w1-l1`. La partie infinie n'existe plus qu'en `?dev`. Détails : `docs/menu-accueil.md`.
- **Deux familles d'atouts, toujours distinctes** : GLOBAUX (l'atelier : postes Mk I à V, permanents, appliqués à chaque mission et au tuto ; les technologies emportées se règlent au garage et s'assemblent en mission) et DE MISSION (cartes, fusions, reliques de la partie). Ne jamais les mélanger dans une liste. Test : `tools/perks_test.py`.
- **Le vortex** (partie sans fin, 29 oct. 2026) : nœud sur la carte des secteurs (à droite de la Terre, sous Mars ; `VORTEX_POS` et fiche dans `src/home/galaxy.js`), lance `GameScene` avec `{ vortex:true }` (sans `lvDef`, alerte 1 qui monte de 1 toutes les 2 minutes, `docs/niveaux-alerte.md`). Records locaux durée / dégâts : `src/data/vortex.js` (clé `ssx_vortex_v1`) ; dégâts comptés dans `applyDamageToEnemy` (`this.runDamage`) ; composants comme une défaite (franchise 30 %, pas de prime). Disponible dès le début (déblocage à décider).
- **Zone de jeu 400x700 logiques** mise à l'échelle d'un bloc par `fitUi()` : jamais de `vw/vh` ni de mesures de fenêtre dans l'interface (`docs/responsive.md`).
- **CSS en trois couches** : `css/style.css` → `css/agp.css` (habillage AGP) → `css/hud.css` (HUD en niveau) ; la dernière gagne. Le build les embarque toutes.
- **Interface** : titres en majuscules sans accents ; animations JS via `Motion` (`src/ui/motion.js`, GSAP ; la classe `.mo` coupe la transition CSS sur `transform`) ; **pas d'émojis ni de glyphes pour les symboles de l'interface** : sprites pixel `uiIco('nom', 12|24)` (`src/ui/ui-icons.js`, dessinés par `tools/gen_ui_icons.py`, aussi en CSS : `var(--ico-nom)`). Les icônes de compétences, cartes, reliques et pactes sont encore des émojis réduits en pixel (`pxImg`).
- **Fonds de niveau** : `bg` dans `data/worlds/*.js` (monde 1 : `horizon`, `debris`, `station`, `cristaux`, `patrouille`, `direction`), construits par `world/bg-monde.js` (`wbgBuild_<nom>`, deux conteneurs derrière / devant les étoiles mis à l'échelle 1/zoom, la planète du monde est dans `wbg.planet` et se dévoile après le décollage). Sans `bg`, le décor de planètes tiré au hasard (`pickBgZone`) reste. Image de la Terre : `assets/sprites/bg_terre.webp`.
- **Musiques** (`audio/music.js`, `music-data.js`) : 2 morceaux par ordre (`MUSIC_LEVEL`, clés `w1_*`) et par boss de fin d'ordre (`MUSIC_BOSS.fb_*`, clés `w1b_*`), 4 morceaux de menu par monde affiché (`MUSIC_MENU_WORLD`, clé = rang du monde, même musique sur Atelier / Missions / R&D, annoncée par `homeMusic()` dans `home/ui.js`) et des morceaux pour la carte des secteurs (`MUSIC_SLOTS.dezoom`). Boucles de durée propre au morceau : table `MUSIC_LEN` (nombre entier de mesures de 2 s). Fabriquées par l'usine à musique (dossier `usine musik`, scripts `export_*_jeu.py`), choisies par Bio parmi des propositions.
- **Textes N.O.R.M.A.** : `src/data/agp-lore.js` ; moteur `src/ui/norma.js` (une transmission à la fois, 14 s d'écart, jamais pendant intro, cartes, pause ou écran de fin).
- **Sauvegardes** : `SAVE_KEYS` (`src/core/cloud-save.js`, clés `ssx_*`) ; ne pas en changer le format. Progression permanente : `ssx_meta_v3` (`src/data/meta.js` : `composants`, `pieces`, `atelier`, `rd`, `chargement`) ; les sauvegardes d'avant la R&D (v2, ou v3 sans clé `rd`) sont converties une fois par `migrateMeta()` (ancien arbre remboursé en entier, plans des ordres gagnés). **Atelier** (six postes, Mk I à V) : `src/data/atelier.js`, garage `src/home/garage.js` ; stats de départ = `applyGlobalGear(stats, meta)`. **R&D** : catalogue de 18 technologies et règles dans `src/data/techs.js` (plan à la 1re victoire d'un ordre → prototype → rangs → spécialisation), page `src/ui/rd-ui.js`, baies d'équipement dans le garage (1 + un par boss de secteur) ; en mission le chargement s'assemble par cartes (`techAssemble`, `techCards` dans `src/player/progression.js`). Tests : `node tools/atelier_test.js`, `node tools/rd_test.js`, `python3 tools/techs_test.py`.
- **But des ordres (29 oct. 2026, décidé par Guet)** : il n'y a PLUS d'objectif de temps, d'éliminations ou de cristaux ; **tout ordre se gagne en battant son boss** (`finalBoss` = module `src/bosses/*.js`, sinon `boss:'dread'` = Dreadnought générique PROVISOIRE). `type` vaut `mission` (ordre ordinaire), `boss` (dernier ordre du secteur : boss dès le départ), `tuto` ou `endless` ; la clé `goal` n'existe plus. Le boss arrive **après les autres mobs de la timeline** (dernière vague + 5 s, fin du dernier événement) sauf si `bossAt` (s) fixe la date : `levelBossAt(d)` dans `src/data/boss-arrival.js`, partagé par le jeu (`game/level.js`) et l'éditeur. Jauge de l'ordre : approche du boss, puis vie du boss. Finition : lignes `goal` (« Approche du boss »), `boss`, `win`, `clean`.
- **Éditeur de niveaux** (`editor.html`, `docs/editeur-niveaux.md`) : une mission = un JSON `src/data/levels/<id>.json` (16, tuto compris, `schemaVersion` 2) ; `src/data/worlds/level-data.js` est un cache généré (`tools/level_files.py`), jamais édité. Registres bornés : `src/data/enemy-stats.js` (`mobs`), `tunables.js` (`bossTune`), `event-params.js` (`eventTune`, `events[i].params`), `level-norma.js` (`norma`) ; validation `tools/level_files.py` + `tools/editor/validator.js`, interface `tools/editor/steps-model.js` / `steps-ui.js`. **Règle : nouvelle clé de niveau = registre + validateur + éditeur.** Valeurs uniquement via le JSON (pas de refonte des modules).
- **Modes d'URL** : `?dev` (tout débloqué, `window.__game`, `window.__T`, boutons DEV) · `?sandbox` (sauvegarde en mémoire) · `?edit=play|bot` (pont de l'éditeur `editor.html`).
- **Tests de l'interface** : `home_test.py` et `level_test.py` vérifient des libellés AGP (« INTERVENTION VALIDEE », « ACCIDENT DU TRAVAIL », « ORDRE ANNULE », « NOUVEAU SECTEUR ») : les mettre à jour si on change ces textes.

## Boss et mobs du monde 1 (où est quoi)
Chaque boss/mob a son module, ses assets (`sprite-factory/tools/make_*_assets.py`) et ses sons `SFX_FILES`. Méthode : 3 variantes → Bio choisit → états d'usure + page de combat validée → intégration.
- Satellites : `sat` (satellite hors service, dérive et se disloque en débris) et `satgun` (satellite armé : se met en position, charge, tire des orbes bleus) — art `satgun_sheet.webp` (26 images 200×200, découpées de `sources`/la planche d'origine), enregistrés dans `ENEMY_ART`, `spawning.js`, `enemies/ai.js` (`enemySatShot`, `satDebris`). Utilisés par le niveau `w1-l1` via `spawns`.
- Mob « Bras écartés » (`bras`) : `enemies/bras.js` (comportement, tirs par tier, 4 états d'usure, pièces découpées dans le sprite, constantes `BRAS`), art `bras_sheet.webp` (4 images 512x512) + `br_fx_*.webp` (effets bleus), sons `bras*` dans `SFX_FILES`. Le tier d'intelligence (1 à 4) vient de l'entrée `{ type:'bras', tier }` de `spawns` du niveau (utilisé par `w1-l2`, affiché « Ordre 03 »). Assets produits par `sprite-factory/tools/make_bras_assets.py`.
- Boss « Araignée de tri » (fin de `w1-l2`, affiché « Ordre 03 ») : `bosses/araignee.js` (état dans `this.ar`, constantes `AR`), art `ar_sheet.webp` + `ar_fx_*.webp`, sons `ar*`. Un ordre avec `finalBoss:'araignee'` (ou `'meteo'`) lance le boss à son arrivée (`levelBossAt`, voir « But des ordres ») ; la victoire vient de sa mort (`levelWin`). Autonome comme le boss du tuto (pas dans le système `BOSS_DEFS`). Assets : `sprite-factory/tools/make_araignee_assets.py`. Bouton ARAIGNEE DE TRI dans le bac à sable DEV.
- Boss « La Météo » (fin de `w1-l1`, affiché « Ordre 02 ») : `bosses/meteo.js` (état dans `this.mt`, constantes `MT`), art `mt_sheet.webp` + `mt_fx_*.webp` (feuilles de la bibliothèque `fx-factory` : givre, éclair, arcs, plasma), sons `mt*`. Même mécanique que l'Araignée (`finalBoss:'meteo'`) ; trois attaques (éclairs, grêle, front orageux), chaque arme disparaît avec sa pièce. Assets : `sprite-factory/tools/make_meteo_assets.py` (sources de la page de combat : `tools/meteo/`). Bouton LA METEO dans le bac à sable DEV.
- **Jeu de lumières des boss** : `data/boss-lights.js` (voyants qui pulsent/clignotent, balayage radar, gyrophare : positions en pixels du sprite 512, `m` = `pulse`/`blink`/`strobe`/`spin`) + `fx/boss-lights.js` (`blInit` / `blUpdate` / `blDestroy`, une tache de lumière `lightDot` teintée, les images tournantes viennent de `fx-factory/lights.py`). Chaque boss l'appelle dans sa mise à jour ; une lumière disparaît avec la pièce qui la porte (masque du sprite). Boss équipés : Antenne-Mère (`tuto-boss-fx.js`), Araignée, Météo. Assets : `sprite-factory/tools/make_lights_assets.py` (`lt_*.webp`).
- Satellite armé (`satgun`) : charge de plasma animée à l'embouchure de la parabole, éclat de départ et orbe animée (`brFxOrb`) dans `enemies/ai.js` (`enemySatShot`).
- Boss « Le Réacteur » (fin de `w1-l3`, affiché « Ordre 04 ») : `bosses/reacteur.js` (état dans `this.rx`, constantes `RX`), art `rx_sheet.webp` + `rx_fx_*.webp`, rotor de lumière `lt_rotor_*.webp`, sons `rx*`. `finalBoss:'reacteur'`. Trois attaques (rayonnement en anneaux avec passage, barres qui laissent des flaques de feu vert, arroseur), surchauffe quand il perd ses radiateurs. Assets : `sprite-factory/tools/make_reacteur_assets.py`. Bouton LE REACTEUR dans le bac à sable DEV.
- Mob « Le Pilleur de cristaux » (`pilleur`, `w1-l3`) : `enemies/pilleur.js` (constantes `PIL`), art `pl_sheet.webp` + `pl_fx_*.webp`, sons `pl*`. Sa trappe dorsale aspire les cristaux (`this.gems`), le réservoir alimente un laser continu ; il recrache son stock en mourant. Tier d'intelligence (1 à 4) dans `spawns`. Les sons CONTINUS (laser, aspiration, réservoir) sont des boucles jouées par `Sfx.loopSet` (`audio/sfx-engine.js`), réglées à chaque image par `plLoopsApply` (`game/loop.js`). Assets : `sprite-factory/tools/make_pilleur_assets.py`.
- Boss « L'Anneau » (fin de `w1-l4`, affiché « Ordre 05 », les mobs de la timeline puis le boss) : `bosses/anneau.js` (état dans `this.an`, constantes `AN`), art `an_sheet.webp` + `an_fx_*.webp` (effets violets), sons `an*`. `finalBoss:'anneau'`. L'anneau central TOURNE vraiment : à chaque état d'usure, deux textures canvas (`anRing<st>` = couronne sans le nez, `anBase<st>` = le reste) ; il ralentit puis se grippe. Trois attaques en boucle : RAYONS (4 faisceaux violets tournants après une charge au moyeu), TOURELLES (4 d'angle + 2 pointes, salves visées, chacune meurt avec sa pièce de coque), BAIES (volets blindés qui coulissent, deux Éclaireurs sortent). Jeu de lumières : rotor au moyeu, chenille sur l'anneau, comète sur la roue, tourelles qui clignotent. Assets : `sprite-factory/tools/make_anneau_assets.py` (sources de la page de combat : `tools/anneau/`). Impact = « verre lourd étouffé » (choisi par Bio). Bouton L ANNEAU dans le bac à sable DEV.
- Mob « L'Éclaireur de patrouille » (`eclaireur`, `w1-l4` et baies de L'Anneau) : `enemies/eclaireur.js` (constantes `EC`), art `ec_sheet.webp` + `ec_fx_*.webp` (cône de balayage dont le bout s'estompe, viseur), sons `ec*`. Patrouille en balayant un projecteur ; si tu restes dans le faisceau, le viseur se referme et il te VERROUILLE : TANT QUE LE VERROUILLAGE DURE, les tirs de tous les autres ennemis visent le joueur (`ecLockUpdate`, appelé à chaque image par `game/loop.js` : un tir ennemi qui apparaît près d'un ennemi non-boss est réorienté vers le joueur, marqué `_lk` et teinté en rouge ; les tirs de l'éclaireur et du boss portent `_ec` / `_aim` et ne sont pas touchés). Tier 1 à 4 dans `spawns` (renfort au tier 2, faisceau large au tier 3, tandem au tier 4). Assets : même script que le boss.
- Boss final « Le PDG dans sa tour » (fin de `w1-l5`, affiché « Ordre 06 », type `boss` (le boss arrive dès le départ) avec `finalBoss:'pdg'` ; `boss:'dread'` reste dans les données pour la validation du monde, le Dreadnought n'est plus lancé) : `bosses/pdg.js` (état dans `this.pd`, constantes `PD`), art `pd_sheet.webp` (tour, 4 états), `pg_sheet.webp` (vaisseau de protection « Le PDG », 4 états), `gd_sheet.webp` (agent de sécurité : vivant, givre, gelé, fissuré), effets dorés/glace `pd_fx_*.webp`, sons `pd*` / `pg*` / `gd*`. Quatre attaques en boucle : LICENCIEMENTS (canons, salves de pièces d'or visées), RESTRUCTURATION (anneau de pièces avec un passage), RAYONS SOLAIRES (les ailes balaient en croix), VIGILES (jusqu'à 3 vaisseaux « Le PDG » se placent devant la tour ; détruits, ils explosent en débris (pièces, contrats, coque) et lâchent chacun un agent de sécurité qui s'interpose bras écartés et GÈLE ; vaisseaux et agents arrêtent les tirs du joueur, testés par masque de pixels avant la tour). Nombre de vaisseaux = 1 + état d'usure du boss. Assets : `sprite-factory/tools/make_pdg_assets.py` (sources `tools/pdg/`, sons `tools/pdg/pdg_final_snd.py`). Sons : enregistrements réels (Kenney sci-fi/impact/RPG audio + pack CC0 « 100 CC0 SFX ») adoucis, choisis par Bio à l'écoute. Bouton LE PDG dans le bac à sable DEV.

## Boss du monde 2 (La Casse lunaire, déco rouge/noir « Mars »)
Cinq boss autonomes, un par ordre (`w2-l1` à `w2-l5`, `finalBoss` = `crabe` / `incinerateur` / `benne` / `broyeur` / `reparateur`), qui partagent UN moteur : `bosses/w2.js` (état dans `this.w2`, démarrage `w2Start(id)`, mise à jour `w2Update` appelée par `game/loop.js`) et UNE donnée : `data/boss-w2.js` (`BOSS_W2` : PV, dégâts par genre de projectile `dmg`, pièces mobiles, jeu de lumières `over`, attaques scriptées `attacks[i].go(s)`). Chaque boss a ses propres attaques, tirs et sons (préfixes `cb` / `ic` / `bn` / `by` / `rp` dans `SFX_FILES`).
- Le boss et tous ses effets sont dessinés sur une toile unique (texture `w2cv…`, échelle de la page : largeur 520 unités, `U` = pixels du jeu par unité) ; les scripts d'attaque sont ceux de la page de combat validée (`sprite-factory/assets/boss_w2/mars/boss.js`). Les collisions sont faites dans `w2Hits` (tirs du joueur : masque du sprite, point faible = coup critique) et `w2Collide` (projectiles = distance, faisceaux `hurt` = segment, piston, flaques, contact).
- Usure en 3 états fabriquée à l'exécution (plaques arrachées, fissures) ; mort en cascade d'explosions (`w2DyingStep`) puis éclatement de la coque (`w2Dead`), victoire du niveau 2,6 s après.
- Escortes (Réparateur : soigne ; Benne : compacte) = de VRAIS mobs du niveau (`spawns` du JSON, `callEscort`).
- Assets : `assets/sprites/w2_*.webp` (sprites), sons `sprite-factory/tools/make_w2boss_assets.py`, musiques `usine musik/scripts/export_monde2_boss_jeu.py` (`MUSIC_BOSS.fb_*`, fichiers `w2b_*`). Valeurs d'équilibrage PROVISOIRES (PV 1000 à 1400, dégâts de `dmg`).
- Piège : un objet Phaser mis en cache sur la scène est détruit au redémarrage du niveau : `this.w2` est remis à null (et sa texture retirée par `w2Cleanup`) dans `levelStart`.

## Outils et tests (dossier `tools/`, pas de lanceur unique)
- Prérequis : Python 3 + `pip install playwright numpy scipy pillow`, Chrome, Node (vérif syntaxe du build). Sur Mac `python3`, sur Windows `py`.
- **Avant chaque push** : `python3 tools/smoke_test.py` (une partie se lance sans erreur JS), `home_test.py`, `level_test.py`, `perks_test.py`, `node tools/check_worlds.js`, `node tools/composants_test.js`, `python3 tools/gen_codemap.py --check`.
- **Éditeur de niveaux, sans navigateur** : `node tools/editor_steps_test.js`, `editor_steps_ui_test.js`, `editor_validator_test.js`, `norma_level_test.js`, `event_params_node_test.js`, `level_look_test.js`, `python3 tools/level_files_test.py`. Avec navigateur : `enemy_stats_test.py`, `tunables_test.py`, `event_params_test.py`.
- `build.py` : fichier unique `dist/space-shooter-x.html` (+ `-dev`), vérif `node --check` ; `--inline-phaser` pour embarquer Phaser. `smoke_test.py --dist` le teste.
- `sim_balance.py grid|campaign|tune` : joueur automatique en avance rapide (équilibrage des niveaux).
- Assets : `gen_manifest.py` (après tout ajout/suppression dans `assets/`), `gen_ui_icons.py` (icônes d'interface), `import_sprites_niveaux.py <dossier>` (icônes de niveaux PNG), `import_decors_carte.py --w2 --w3 --nuages --orbite` (planètes, nuages, satellite de la carte), `cut_satgun.py` (planche du satellite armé).
- `editor.html` (racine) : éditeur de niveaux, export vers les JSON `src/data/levels/` (`docs/editeur-niveaux.md`).
- Machine de test lente (WebGL logiciel) : FPS non représentatifs ; en headless, `dt` clampé fausse les vitesses. Dans un `page.evaluate`, ne jamais renvoyer un objet Phaser (sérialisation infinie) : terminer par `return 0`.

## Git
- Une branche par sujet, commits petits, PR vers `main`. Avant de pousser : `git fetch` + `git merge origin/main`, résoudre les conflits en gardant les deux côtés (fréquents sur `CLAUDE.md`, `PASSATION.md`, `css/agp.css`), retester, relancer `gen_codemap.py`.
- Commiter et pousser seulement quand Guet ou Bio le demande.
- macOS : `sed -i` exige `-i ''` ; préférer un petit script Python pour éditer.

## Contrainte de taille
Build « fichier unique » ~22 Mo (la limite de 16 Mo des artifacts claude.ai ne permet plus de le publier là). Le jeu final doit rester raisonnable pour le Play Store : sons en mp3 mono 24–32 kbps, images en WebP.

# Principes de conduite (réduire les erreurs courantes en code)

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
