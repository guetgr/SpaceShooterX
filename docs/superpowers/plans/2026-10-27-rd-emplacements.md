# Étape 3 — R&D par technologie, emplacements, chargement et assemblage en mission : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** l'arbre de compétences laisse la place à un catalogue de 18 technologies (15 jouables, 3 réservées aux secteurs 4 et 5) : on récupère leur plan en gagnant un ordre, on les prototype puis on les améliore en R&D, on en emporte 1 à 4 selon les boss vaincus (baies d'équipement), et on les **assemble en mission** par des cartes. Fin de l'ancien arbre : tout est remboursé.

**Architecture :** le catalogue et ses règles sont des données pures dans `src/data/techs.js` (testées sous Node avec le chargeur `vm` de `tools/atelier_test.js`). La sauvegarde `ssx_meta_v3` gagne `rd` et `chargement` ; l'ancien `tree` disparaît à la dernière tâche, par une migration qui rembourse tout. En mission, `GameScene` lit le chargement (`this.techState`) à la place de `this.treeState` : les indicateurs `*Owned` ne sont plus posés au départ, mais par les cartes d'assemblage et de spécialisation. L'interface R&D remplace `src/ui/tree-ui.js` dans la page de droite de l'accueil ; les baies d'équipement s'ajoutent au garage.

**Tech Stack :** Phaser 3.70 en scripts classiques (`mixin(GameScene, {…})`), tests Node (`tools/*_test.js`) et Playwright Python (`tools/home_test.py`, `perks_test.py`, `level_test.py`, nouveau `tools/techs_test.py`).

**Spec :** `docs/superpowers/specs/2026-10-27-progression-design.md` (§3.4 plans, §3.5 emplacements, §5 R&D, §6 chargement, §7 cartes, §9 migration, §11 textes). Étapes précédentes : `docs/superpowers/plans/2026-10-27-atelier-v3.md` (atelier, sauvegarde v3), `docs/superpowers/plans/2026-10-27-progression-agp.md` (composants).

## Décisions de ce plan (à relire par Guet)

1. **Un plan par ordre, en attendant l'étape 4.** Le spec veut des plans lâchés en mission (étape 4). Ici, **la 1re victoire d'un ordre accorde son plan** (`TECH_PLAN_LEVEL`). L'étape 4 ne change que la livraison (drop en mission), pas la correspondance. Correspondance proposée (provisoire) : S1 = tuto → LASER CONTINU, l1 → LASER AUTO-CIBLEUR, l2 → MISSILES A GUIDAGE, l3 → BOUCLIER REACTIF, l4 → TIRS RICOCHETS (l5 = PDG, aucun plan : il ouvre une baie) ; S2 et S3 = l1 à l5 dans l'ordre du tableau ci-dessous.
2. **Mécanique d'une technologie.** Les améliorations R&D sont des **incréments** : la technologie achetée au rang *r* applique `inc` *r* fois **au moment de l'assemblage en mission**, jamais au départ. La carte d'assemblage donne l'effet de base ; les cartes d'amélioration de mission rejouent `inc` une fois. Un test vérifie que `inc` appelé *l* fois égale l'ancien `apply(stats, l)` de l'arbre.
3. **Prix provisoires** (réglés à la tâche 8 avec `sim_balance.py`) : prototype 30 / 60 / 100 ◆ (secteurs 1 / 2 / 3) ; amélioration rang *r* (1 à *max*) = (25 + 15·(*r*−1)) × (1 / 1,5 / 2) ; spécialisation 150 / 250 / 400 ◆ + pièces du secteur (2 / 3 / 4). Les pièces ne sont obtenables qu'à l'étape 4 : les spécialisations sont donc verrouillées en jeu normal (bouton DEV de la tâche 5 de l'étape 2).
4. **Spécialisations « à concevoir »** (BOUCLIER REACTIF, TIRS RICOCHETS, OVERDRIVE, CHAMP LENT, PULSAR) : `spe:null`, affichées « EN CONCEPTION ». Je les propose à Guet avant de coder (spec §16), hors de ce plan.
5. **Nœuds de l'ancien arbre non repris** (`t_multi`, `t_perforant`, `t_percebouclier`, `t_velocite` : restent en cartes de mission ; `t_stabilisateurs`, `t_rechargerapide`, `t_cooldown`, `t_chancedevie`, `t_soinmajeur` : disparaissent) : remboursés, sans équivalent.
6. **Tutoriel** : camionnette de base + atelier, aucune technologie (chargement ignoré).
7. **`?dev`** : tous les secteurs et les 4 baies ouverts, plans accordés, prototypes gratuits non requis (les achats restent possibles).

## Global Constraints

- Branche `progression-agp`. **Pas de push sans demande de Guet ou de Bio.** Commits locaux par tâche autorisés une fois l'exécution validée par Guet.
- `mixin` plante si une méthode existe déjà : Grep chaque nouveau nom avant de l'ajouter. Tout nouveau fichier JS va dans `src/scripts.json`, dans l'ordre (`data/techs.js` juste après `data/atelier.js`).
- Pas d'émoji ni de glyphe pour une icône d'interface : `uiIco('frag', 12)`. Les icônes de technologies restent des émojis réduits en pixel (`pxImg`), comme aujourd'hui. Titres en majuscules sans accents. Zone de jeu 400×700 : jamais de `vw`/`vh`.
- **Une seule technologie ARME** et **une seule RAMPE** de missiles par chargement (spec §5.2). Les atouts GLOBAUX (atelier) et DE MISSION (cartes, fusions, reliques) restent distincts.
- Les valeurs de combat (PV, dégâts, cadences, `lvDef`) ne changent pas : on ne touche qu'à la façon dont les technologies s'obtiennent et s'activent.
- Dans un `page.evaluate` Playwright, ne jamais renvoyer d'objet Phaser : terminer par `return 0`.
- Avant de livrer : `python3 tools/smoke_test.py`, `home_test.py`, `level_test.py`, `perks_test.py`, `techs_test.py`, `node tools/check_worlds.js`, `node tools/composants_test.js`, `node tools/atelier_test.js`, `node tools/rd_test.js`, `python3 tools/gen_codemap.py` puis `--check`. Lire aussi les lignes ÉCHEC : certains tests renvoient 0 malgré un échec.

## Catalogue (source de vérité des tâches 1, 5, 6)

Colonnes « ancien nœud » = id dans `src/data/skill-tree.js`, dont l'`apply` est porté en `inc`. Tout nœud non listé disparaît (décision 5). Secteurs 4 et 5 : définies mais `available` faux (« ACCES NON AUTORISE »).

| `id` | NOM | Sect. | Tag | Plan (`TECH_PLAN_LEVEL`) | Effet d'assemblage (ancien nœud) | Améliorations (anciens nœuds) | Spécialisation |
|---|---|---|---|---|---|---|---|
| `laser_continu` | LASER CONTINU | 1 | ARME | `w1-tuto` | `weaponMode='laser'` (`t_laser_c`) | `t_laser_c_portee`, `t_laser_c_degats` | `t_laser_c_cap` LASER DESTRUCTEUR |
| `laser_auto` | LASER AUTO-CIBLEUR | 1 | ARME | `w1-l1` | `weaponMode='laserAuto'` (`t_laser_a`) | `t_laser_a_verrou`, `t_laser_a_priorite` (max 1) | `t_laser_a_cap` RETICULE OMNISCIENT |
| `missiles_guidage` | MISSILES A GUIDAGE | 1 | RAMPE | `w1-l2` | `missileCount+=1`, `missileType='chercheur'` (`t_lancemissiles`, `t_missile_chercheur`) | `t_chargemissiles`, `t_cadmissiles`, `t_missile_chercheur_multi`, `t_missile_chercheur_cad` | `t_missile_chercheur_cap` ESSAIM D'AUTOMISSILES |
| `bouclier_reactif` | BOUCLIER REACTIF | 1 | — | `w1-l3` | `t_reactif` | `t_phenix_bouclier` (renaissance bouclier) | à concevoir |
| `ricochets` | TIRS RICOCHETS | 1 | — | `w1-l4` | `t_rebond` (rang 1) | rangs suivants de `t_rebond` | à concevoir |
| `drone` | DRONE SATELLITE | 2 | — | `w2-l1` | `t_drone` | `t_drone_cadence`, `t_drone_degats` | `t_drone_cap` ESSAIM |
| `missiles_demolition` | MISSILES DE DEMOLITION | 2 | RAMPE | `w2-l2` | `missileCount+=1`, `missileType='droit'` (`t_lancemissiles`, `t_missile_droit`) | `t_explosion`, `t_napalm`, `t_perforantmissile`, `t_missile_droit_charge`, `t_missile_droit_vitesse` | `t_missile_droit_cap` MISSILE NUCLEAIRE |
| `blindage_lourd` | BLINDAGE LOURD | 2 | — | `w2-l3` | `t_forteresse` | `t_forteresse_resist`, `t_forteresse_regen` | `t_forteresse_cap` AURA DE FER |
| `nano_reparation` | NANO-REPARATION | 2 | — | `w2-l4` | `t_sangsue` | `t_sangsue_vol`, `t_sangsue_rayon`, `t_regen`, `t_voldevie` | `t_sangsue_cap` FESTIN |
| `benne` | BENNE DE RECUPERATION | 2 | — | `w2-l5` | collecte de base (aucun effet propre) | `t_xp`, `t_chance`, `t_butindouble`, `t_collecte`, `t_cristauxvaleur`, `t_coffre`, `t_coffre_xp`, `t_coffre_chance` | `t_coffre_cap` JACKPOT |
| `overdrive` | OVERDRIVE | 3 | — | `w3-l1` | `t_overdrive` | `t_frolement`, `t_surchauffe`, `t_souffle` | à concevoir |
| `canon_experimental` | CANON EXPERIMENTAL | 3 | ARME | `w3-l2` | `weaponMode='shotgun'` (`t_shotgun`) | `t_shotgun_plombs`, `t_shotgun_recul` | `t_shotgun_cap` CANON A FRAGMENTATION |
| `arc_electrique` | ARC ELECTRIQUE | 3 | — | `w3-l3` | `t_foudre` | rangs suivants de `t_foudre` | `t_tonnerre` TONNERRE |
| `champ_lent` | CHAMP LENT | 3 | — | `w3-l4` | `t_champlent` | rangs suivants | à concevoir |
| `pulsar` | PULSAR | 3 | — | `w3-l5` | `t_pulsar` | rangs suivants | à concevoir |
| `trou_noir` | TROU NOIR | 4 | — | — | `t_trounoir` | — | `t_gravite` GRAVITE |
| `eclats` | ECLATS | 4 | — | — | `t_eclats` | — | à concevoir |
| `rapatriement` | CONTRAT DE RAPATRIEMENT | 5 | — | — | `t_phenix` | `t_phenix_esquive` | `t_phenix_cap` IMMORTEL |

Spécialisation en mission : la carte « SPECIALISATION » pose l'indicateur correspondant (`laserDestructeurOwned`, `reticuleOmniscientOwned`, `swarmMissilesOwned`, `nukeOwned`, `droneSwarmOwned`, `fragmentationOwned`, plus les effets de stats des autres). Fusions : ORAGE = `arc_electrique` + `ricochets` assemblées ; VORTEX attend `trou_noir`.

## Review Focus

Chaque ligne a son test dans la tâche indiquée.

- **Migration finale** : tous les rangs de l'ancien arbre remboursés (y compris les nœuds non repris), plans accordés pour chaque ordre déjà gagné, rejouée deux fois = un seul remboursement, `tree` absent ensuite (tâche 7).
- **Chargement invalide ou périmé** : deux ARME, deux RAMPE, plus de technologies que de baies (un boss « dévalidé » ou une sauvegarde modifiée), technologie sans prototype, technologie d'un secteur non disponible → nettoyé au démarrage de la mission, jamais d'exception (tâches 2 et 5).
- **Garantie de la première minute** : tant qu'une technologie emportée n'est pas assemblée, chaque montée de niveau propose une carte d'assemblage, **sans jamais bloquer ni vider le tirage** (2 choix, 3 technologies non assemblées, pool réduit) (tâche 5).
- **Aucune technologie active au départ** : sans carte d'assemblage, ni arme, ni drone, ni missiles, ni indicateur `*Owned` ; le tutoriel ignore le chargement (tâche 5).
- **Effets des spécialisations et fusions** : une spécialisation non recherchée ne sort jamais en carte ; ORAGE et VORTEX ne sortent que si leurs technologies sont emportées **et** assemblées (tâche 6).

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `src/data/techs.js` (nouveau) | catalogue, règles de recherche, emplacements, chargement |
| `src/data/meta.js` | `rd`, `chargement` ; migration finale ; fin de `tree` |
| `src/data/world-progress.js` | plan accordé à la 1re victoire (`recordLevelClear`) |
| `src/ui/rd-ui.js` (nouveau), `css/rd.css` (nouveau) | page R&D (remplace `src/ui/tree-ui.js`) |
| `src/home/garage.js`, `src/home/ui.js`, `index.html` | baies d'équipement, ligne de chargement de la fiche d'ordre |
| `src/data/upgrades.js`, `src/data/fusions.js`, `src/systems/relics-fusions.js`, `src/player/progression.js` | cartes d'assemblage, d'amélioration, de spécialisation ; fin de `requiresTree` et des armes légendaires de boss |
| `src/scenes/GameScene.js`, `src/data/player-stats.js`, `src/ui/pages.js`, `src/game/run.js`, `src/ui/dom.js` | `techState`, atouts globaux, collection, remise à zéro |
| `src/data/skill-tree.js`, `src/ui/tree-ui.js` (supprimés) | fin de l'ancien arbre |
| `tools/rd_test.js` (nouveau), `tools/techs_test.py` (nouveau), `tools/home_test.py`, `tools/perks_test.py`, `tools/level_test.py`, `tools/sim/bot.js`, `tools/sim_balance.py` | tests et simulateur |

---

### Task 1: Catalogue des technologies et règles de recherche

**Files:**
- Create: `src/data/techs.js`, `tools/rd_test.js`
- Modify: `src/scripts.json` (insérer `"data/techs.js"` après `"data/atelier.js"`)

**Interfaces:**
- Produces (globales, `"use strict"`) :
  - `TECHS: Array<Tech>` avec `Tech = { id, name, sector:number, tag:'ARME'|'RAMPE'|null, icon, desc, plan:string|null (id d'ordre), assemble:(stats)=>void, upgrades:Array<{ id, name, desc, max:number, inc:(stats)=>void }>, spe:null|{ id, name, desc, flag:string|null, apply:(stats)=>void } }`. `inc` appelé *l* fois reproduit l'ancien `apply(stats, l)`.
  - `TECH_BY_ID`, `TECH_PLAN_LEVEL: Object<levelId, techId>` (dérivé de `Tech.plan`).
  - `techAvailable(t): boolean` — `t.sector <= WORLDS.length` ou `DEV_SEE_ALL` ; faux pour les secteurs 4 et 5 tant que ces mondes n'existent pas.
  - `rdEntry(meta, techId): { plan:boolean, proto:boolean, rang:number, spe:boolean }` — valeurs bornées (`rang` ≤ somme des `max`).
  - `rdNextCost(techId, what, rang): { composants:number, pieces:Object|null } | null` avec `what ∈ 'proto'|'rang'|'spe'` (`rang` = rang actuel pour `'rang'`) ; barème de la décision 3 ; `null` si au maximum ou sans spécialisation.
  - `rdCanBuy(meta, techId, what): { ok:boolean, reason:null|'secteur'|'plan'|'proto'|'max'|'composants'|'pieces'|'conception' }` ; `rdBuy(meta, techId, what): boolean` (débite `composants`/`pieces`, incrémente `rd`, `false` sans rien modifier sinon) ; `rdGrantPlan(meta, techId): boolean`.
  - `rdUpgradeAt(tech, rang): upgrade|null` — l'amélioration achetée au rang *rang* (les rangs se consomment dans l'ordre du tableau `upgrades`, chacune sur ses `max`).
- Consumes : `makeDefaultStats()`, `WORLDS`, `DEV_SEE_ALL`, `ATELIER_*` (modèle de test), `skill-tree.js` (test d'équivalence).

- [ ] **Step 1: Écrire `tools/rd_test.js` (échoue).** Chargeur `vm` comme `tools/atelier_test.js` (charger `player-stats`, `atelier`, `meta`, `skill-tree`, `worlds`, `techs`, avec `localStorage` simulé). Assertions :
  - `TECHS.length === 18`, ids du catalogue, `TECH_BY_ID.laser_continu.tag === 'ARME'`, exactement 3 techs `ARME` (laser_continu, laser_auto, canon_experimental) et 2 `RAMPE`.
  - `TECH_PLAN_LEVEL['w1-tuto'] === 'laser_continu'` et 15 niveaux mappés ; les 3 techs des secteurs 4 et 5 n'ont pas de plan et `techAvailable` faux.
  - **Équivalence avec l'arbre** : pour chaque amélioration et chaque spécialisation portée depuis un ancien nœud (colonne « ancien nœud ») et pour *l* = 1..`max`, appliquer `inc` *l* fois à `makeDefaultStats()` donne les mêmes champs que `TREE_NODE_BY_ID[ancien].apply(stats, l)` (comparaison champ à champ, tolérance 1e-9). Les entrées sans équivalent chiffré (assemblage) sont vérifiées une à une (`weaponMode`, `missileType`, `missileCount`).
  - Règles : `rdCanBuy(meta,'laser_continu','proto')` → `reason 'plan'` sans plan ; avec plan et 30 ◆ → ok ; `rdBuy` débite 30 et pose `proto:true` ; `'rang'` sans prototype → `'proto'` ; `'spe'` sans pièces → `'pieces'` ; `spe:null` → `'conception'` ; amélioration au maximum → `'max'` ; secteur 4 → `'secteur'`. `rdBuy` impossible = `false`, `meta` identique (comparer `JSON.stringify`).
  - Prix : `rdNextCost('laser_continu','proto')` = `{composants:30,pieces:null}` ; `rdNextCost('drone','rang',0)` = `{composants:38,pieces:null}` (25 × 1,5 arrondi) ; `rdNextCost('drone','spe')` = `{composants:250,pieces:{s2:3}}`.
- [ ] **Step 2: Lancer** `node tools/rd_test.js`. Attendu : échec (`TECHS` non défini).
- [ ] **Step 3: Implémenter `src/data/techs.js`** selon les signatures et le catalogue. Porter chaque `inc` depuis l'`apply` de l'ancien nœud (lire `src/data/skill-tree.js`) ; pour les nœuds dont l'`apply` affecte une valeur proportionnelle au rang (`x = 0.10*l`), `inc` fait `x += 0.10`. Descriptions courtes, ton AGP. `techAvailable` : voir interface.
- [ ] **Step 4: Lancer** `node tools/rd_test.js`. Attendu : `OK : rd`.
- [ ] **Step 5: Commit** — `feat(rd): catalogue de 18 technologies, règles de recherche et prix`.

---

### Task 2: Sauvegarde (`rd`, `chargement`), plans, emplacements et règles de chargement

**Files:**
- Modify: `src/data/meta.js`, `src/data/world-progress.js` (`recordLevelClear`), `src/data/techs.js`, `src/data/agp-lore.js`, `tools/rd_test.js`

**Interfaces:**
- Consumes : tâche 1 ; `worldSummary`, `WORLDS`, `getWorldProgress`.
- Produces :
  - `defaultMeta()` gagne `rd:{}` (clé = id de technologie, valeur `{plan,proto,rang,spe}`) et `chargement:[]` ; `normalizeMeta` borne tout (`rd` : ids connus seulement, `rang` entier ≥ 0, booléens ; `chargement` : tableau d'ids connus sans doublon). `tree` est **conservé** jusqu'à la tâche 7.
  - `slotsOpen(progress?): number` (dans `techs.js`) — `1 + nombre de mondes dont le boss est vaincu (worldSummary(w).bossDown)`, plafonné à 5 ; 5 en `DEV_SEE_ALL`.
  - `loadoutCheck(meta, ids, slots): { ok:boolean, reason:null|'baies'|'arme'|'rampe'|'proto'|'secteur'|'inconnu' }` ; `loadoutSanitize(meta, slots): string[]` — filtre dans l'ordre : inconnues, secteur indisponible, sans prototype, doublons, 2e ARME, 2e RAMPE, au-delà des baies ; `loadoutToggle(meta, techId, slots): boolean` — équipe ou retire, `false` si `loadoutCheck` refuse (rien n'est modifié).
  - `recordLevelClear` (world-progress.js) accorde le plan de `TECH_PLAN_LEVEL[levelId]` à la 1re victoire : `rec.plan = techId|null` (le rapport l'affichera à la tâche 7 de l'étape 4 ; ici seule la sauvegarde change, via `getMeta`/`setMeta`).
  - `AGP_LORE.rd = { plan, research, loadoutFull }` : « Document technique récupéré. Il ne vous appartient pas. Moi non plus. » · « Cette modification annule immédiatement la garantie constructeur. » · « Capacité de la baie atteinte. Veuillez renoncer à quelque chose. »
- [ ] **Step 1: Ajouter à `tools/rd_test.js`** : forme de `defaultMeta()` avec `rd`/`chargement` ; `normalizeMeta({rd:{laser_continu:{rang:-3,proto:'x'}, zzz:{}}, chargement:['laser_continu','laser_continu','zzz']})` → `rd` sans `zzz`, `rang 0`, `proto false`, `chargement ['laser_continu']` ; `slotsOpen` avec une progression sans boss vaincu = 1, avec `w1-l5` gagné = 2, tous les mondes = 4 (3 mondes existent aujourd'hui) ; **Review Focus** : `loadoutSanitize` avec deux ARME prototypées → garde la première ; avec 3 technologies et 1 baie → garde la première ; une technologie sans prototype ou du secteur 4 → retirée ; `loadoutToggle` refuse une 2e RAMPE (`false`, `meta` intact) et accepte le retrait ; `recordLevelClear('w1-l1', 5)` (avec `localStorage` simulé) accorde `laser_auto` une seule fois (2e victoire : `rec.plan === null`, plan non redonné).
- [ ] **Step 2: Lancer** `node tools/rd_test.js`. Attendu : échec.
- [ ] **Step 3: Implémenter** les signatures. Le plan est écrit dans `rd[techId].plan` par `rdGrantPlan` appelé depuis `recordLevelClear` (qui relit/écrit `getMeta`/`setMeta`) ; le tuto accorde `laser_continu`.
- [ ] **Step 4: Lancer** `node tools/rd_test.js` et `node tools/atelier_test.js`. Attendu : `OK` des deux.
- [ ] **Step 5: Commit** — `feat(rd): rd et chargement dans la sauvegarde, plans à la 1re victoire, emplacements`.

---

### Task 3: Page R&D (remplace l'arbre)

**Files:**
- Create: `src/ui/rd-ui.js`, `css/rd.css`
- Modify: `index.html` (page `#pageTree` : en-têtes), `src/scripts.json` (`ui/rd-ui.js` ; **le build embarque aussi `css/rd.css`** : l'ajouter dans `tools/build.py` et dans l'ordre des feuilles du `index.html`, après `css/hud.css`), `src/home/ui.js` (`showHomeTree`, `renderHomeTree`), `tools/home_test.py`

**Interfaces:**
- Consumes : tâches 1 et 2 ; `getMeta`, `setMeta`, `techAvailable`, `rdCanBuy`, `rdBuy`, `rdNextCost`, `rdUpgradeAt`, `ROMAN`.
- Produces : méthodes de `GameScene` (même emplacement que `renderTree`) `renderRd()`, `rdSelect(techId)`, `rdBuyAction(techId, what)` ; `HomeScene.renderHomeTree(meta)` : point doré de l'onglet si un achat est possible (`rdCanBuy` ok pour une technologie disponible). Onglets **par secteur** (`#treeTabs`, 1 onglet par monde existant ; « ACCES NON AUTORISE » pour un secteur non atteint, secteurs 4 et 5 absents). Une fiche par technologie dans `#treeScroll` (classe `.rdcard`) : état du plan (« PLAN A RECUPERER : <nom de l'ordre> » quand il manque), prototype, pastilles de rangs, spécialisation, coûts en ◆ et en pièces, bouton d'achat unique `.rd-buy` pour la prochaine étape.
- [ ] **Step 1: Mettre à jour `tools/home_test.py`** (section arbre, lignes ~37-47) : avec `ssx_meta_v3` `{v:3,composants:500,rd:{laser_continu:{plan:true}}}`, l'onglet R&D (`#tabTree`) affiche 3 onglets de secteur (`#treeTabs > *`) ; `.rdcard` du LASER CONTINU présent avec bouton `.rd-buy` actif (« PROTOTYPE · 30 ») ; clic → `getMeta().rd.laser_continu.proto === true`, `composants === 470`, compteur `#homeFrag` à jour ; une technologie sans plan (`laser_auto`) a son bouton inactif et le texte `PLAN A RECUPERER` ; la spécialisation sans pièces affiche `PIECES DE SECTEUR REQUISES` ; point doré présent quand un achat est possible. Supprimer les assertions sur `.tcard`, `#treeInvestBtn`, `ALL_TREE_NODES`.
- [ ] **Step 2: Lancer** `python3 tools/home_test.py`. Attendu : échec sur la page R&D.
- [ ] **Step 3: Implémenter** `rd-ui.js` (même idiome que `tree-ui.js` : `mixin(GameScene, {…})`, `Motion` pour les entrées, `uiIco` pour les coûts, N.O.R.M.A. `AGP_LORE.rd.research` à chaque achat) et `css/rd.css` (cible tactile ≥ 44 px, thème AGP-OS). `showHomeTree` appelle `renderRd()` à la place de `renderTree()`. Ne pas encore supprimer `tree-ui.js` (tâche 7).
- [ ] **Step 4: Vérifier visuellement** (`?dev`, 420×760) : un onglet par secteur, fiches lisibles, aucune carte vide ; joindre une capture du secteur 1 au compte rendu.
- [ ] **Step 5: Lancer** `python3 tools/home_test.py`, `python3 tools/smoke_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 6: Commit** — `feat(rd): page R&D par secteur, achat des prototypes, rangs et spécialisations`.

---

### Task 4: Baies d'équipement et ligne de chargement

**Files:**
- Modify: `src/home/garage.js`, `css/atelier.css`, `src/home/ui.js` (fiche d'ordre : `renderLevelCard` ou équivalent), `index.html`, `tools/home_test.py`

**Interfaces:**
- Consumes : tâche 2 (`slotsOpen`, `loadoutToggle`, `loadoutSanitize`, `AGP_LORE.rd.loadoutFull`).
- Produces : dans l'onglet ATELIER, section **BAIES D'EQUIPEMENT** (nouvel onglet `data-section="baies"` de `AtelierGarage`) : `slotsOpen()` baies ouvertes, les autres verrouillées « AUTORISATION REQUISE — incident majeur du secteur N » ; liste des technologies prototypées (`.bay-tech[data-tech]`, bouton basculant équipé/retiré, refus avec `AGP_LORE.rd.loadoutFull` ou la raison `arme`/`rampe`) ; `AtelierGarage.refresh()` redessine aussi cette section. La fiche d'ordre (`#levelCard`) affiche « CHARGEMENT : <noms ou AUCUN> » avec un bouton `MODIFIER` qui ouvre le garage sur les baies ; ligne masquée pour le tuto.
- [ ] **Step 1: Ajouter à `tools/home_test.py`** : avec `rd:{laser_continu:{plan:true,proto:true}, laser_auto:{plan:true,proto:true}, missiles_guidage:{plan:true,proto:true}}`, 1 baie (aucun boss), section `baies` : 1 baie ouverte + 3 verrouillées (`.bay-lock` portant « AUTORISATION REQUISE ») ; équiper `laser_continu` → `getMeta().chargement` vaut `['laser_continu']` ; équiper `laser_auto` → refusé (baie pleine), `chargement` inchangé ; avec `w1-l5` gagné (2 baies), `laser_auto` refusé pour cause d'ARME (`reason 'arme'`), `missiles_guidage` accepté ; la fiche d'ordre de `w1-l1` affiche `CHARGEMENT` avec les noms et le bouton `MODIFIER` ouvre le garage ; la fiche du tuto n'affiche pas la ligne.
- [ ] **Step 2: Lancer** `python3 tools/home_test.py`. Attendu : échec.
- [ ] **Step 3: Implémenter** ; textes en majuscules sans accents pour les titres. Le chargement est assaini (`loadoutSanitize`) à chaque ouverture de la section.
- [ ] **Step 4: Vérifier visuellement** (capture 420×760 des baies, 1 puis 2 baies ouvertes). Si la scène sticky laisse trop peu de place, le signaler à Guet.
- [ ] **Step 5: Lancer** `python3 tools/home_test.py`, `python3 tools/smoke_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 6: Commit** — `feat(garage): baies d'équipement et ligne de chargement sur la fiche d'ordre`.

---

### Task 5: Mission — le chargement remplace l'arbre, assemblage en cartes

**Files:**
- Modify: `src/scenes/GameScene.js:44-78`, `src/data/player-stats.js` (`applyGlobalGear`), `src/data/upgrades.js`, `src/player/progression.js`, `src/systems/relics-fusions.js:11`, `src/data/techs.js`, `src/ui/pages.js` (`globalGearItems`), `src/game/tuto.js` ; Create: `tools/techs_test.py`

**Interfaces:**
- Consumes : tâches 1 et 2.
- Produces :
  - `GameScene.techState: Object<techId, { rang:number, assembled:boolean, spe:boolean, picks:number }>` — construit au départ de **chaque niveau** (jamais au tuto) depuis `loadoutSanitize(meta, slotsOpen())` et `rdEntry` ; remplace `this.treeState` pour tout ce qui concerne les technologies.
  - `GameScene.techAssemble(techId): void` — applique `tech.assemble(stats)`, puis `rdUpgradeAt(...).inc` autant de fois que de rangs achetés ; pose `assembled`. Les indicateurs `*Owned`, `phoenixCharges`, `missileType`… sont posés **ici** et plus au départ (le bloc `GameScene.js:64-78` ne garde que `this.laserBeamTimer`, `nukeTimer`… sans `*Owned` initialisés à `false`).
  - `GameScene.assemblyCards(): Array<Card>` — une carte `ASSEMBLAGE : <NOM>` par technologie emportée non assemblée (`{ id:'asm_'+techId, icon, name, desc, max:1, category:'weapon', apply:()=>this.techAssemble(techId) }`).
  - `showUpgradeCards` : tirage = cartes de réglage du canon (`firerate`, `damage`, `spread`, `speed`, `magnet`, `life`, `shield`, `pierce`, `bulletspeed`) + cartes d'assemblage ; **tant qu'il reste une technologie non assemblée, le tirage contient au moins une carte d'assemblage** (si `cardCount()` = 1, elle prend la place) ; jamais de tirage vide.
  - `applyGlobalGear(stats, meta)` n'applique plus l'arbre (seulement `atelierApply`). Suppression dans `upgrades.js` des entrées `laser`, `laserAuto`, `shotgun`, `missiles` (`requiresTree`) et de la ligne d'arme légendaire de `showRelicChoice`.
- [ ] **Step 1: Écrire `tools/techs_test.py`** (Playwright, même squelette que `perks_test.py`, `ssx_meta_v3` injecté, `ssx_worlds_v1` avec `w1-l1` gagné). Cas : (a) chargement `['laser_continu']`, rang 0 : au démarrage `stats.weaponMode === 'bullet'` et `laserContinuOwned` faux (**Review Focus : rien d'actif au départ**) ; après `techAssemble('laser_continu')` → `weaponMode === 'laser'` ; (b) rang 2 dans `laser_continu` : après assemblage, `stats.laserSpeedBonus` ≈ 0,20 ; (c) `missiles_guidage` assemblé : `missileCount === 1`, `missileType === 'chercheur'` ; (d) tuto (compte neuf) avec un chargement valide dans la sauvegarde : `techState` vide, `weaponMode === 'bullet'` ; (e) chargement invalide injecté (`['laser_continu','laser_auto']`, 1 baie) : le jeu démarre sans erreur JS et `Object.keys(techState)` vaut `['laser_continu']` ; (f) **garantie** : 3 technologies emportées (4 baies via `?dev`) non assemblées, `cardChoices` = 2 : à chaque `showUpgradeCards` (3 montées de niveau successives, `s.xp = s.xpToNext` puis `levelUp()`), au moins une des cartes affichées (`#cardsWrap .card-name`) commence par `ASSEMBLAGE` ; après assemblage de tout, plus aucune ; (g) pas d'erreur JS.
- [ ] **Step 2: Lancer** `python3 tools/techs_test.py`. Attendu : échec.
- [ ] **Step 3: Implémenter** selon les signatures. Pas de nouvelle mécanique de combat : les effets d'assemblage reprennent exactement ce que faisaient les anciennes cartes d'armes et les indicateurs `*Owned`. `globalGearItems` liste l'atelier **et** les technologies du chargement (« NOM · ASSEMBLEE / NON ASSEMBLEE »).
- [ ] **Step 4: Mettre à jour `tools/perks_test.py`** : la liste des atouts globaux contient l'atelier seul (plus de `VELOCITE`), et un cas avec chargement `['laser_continu']` liste aussi la technologie ; retirer l'arbre des injections.
- [ ] **Step 5: Lancer** `python3 tools/techs_test.py`, `python3 tools/perks_test.py`, `python3 tools/smoke_test.py`, `python3 tools/level_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 6: Commit** — `feat(mission): le chargement remplace l'arbre, assemblage des technologies par cartes`.

---

### Task 6: Cartes d'amélioration, spécialisations et fusions

**Files:**
- Modify: `src/player/progression.js`, `src/data/techs.js`, `src/data/fusions.js`, `src/systems/relics-fusions.js:61`, `src/ui/pages.js` (collection), `tools/techs_test.py`

**Interfaces:**
- Consumes : tâche 5.
- Produces :
  - `GameScene.techCards(): Array<Card>` — pour chaque technologie assemblée : une carte par amélioration non au maximum de mission (`{ id:'up_'+techId+'_'+upgradeId, name:upgrade.name, desc, max:3, apply:()=>upgrade.inc(stats) }`) et, si la spécialisation est recherchée (`rd[tech].spe`), `spe` non nulle et `picks ≥ 2`, la carte `SPECIALISATION : <NOM>` (`max:1`, pose `tech.spe.flag` et applique `tech.spe.apply`). `picks` = nombre de cartes de cette technologie prises dans la mission. Intégrées au tirage de `showUpgradeCards` (le pool = réglages du canon + assemblages + `techCards()`).
  - `FUSIONS` : le champ `tree:[…]` devient `techs:[…]` (`fus_orage` : `['arc_electrique','ricochets']`, `fus_vortex` : `['pulsar','trou_noir']`) ; `eligibleFusions` exige que ces technologies soient **assemblées** (`techState[id].assembled`).
  - Collection (`pages.js`) : la section « ARBRE » est remplacée par « TECHNOLOGIES » (une ligne par technologie, grisée tant qu'elle n'a pas été utilisée en mission) ; `codex.skills` / `codex.usedSkills` sont clés par id de technologie (une assemblée marque `usedSkills`).
- [ ] **Step 1: Ajouter à `tools/techs_test.py`** : (a) technologie assemblée → `techCards()` contient ses améliorations, pas la spécialisation ; (b) spécialisation recherchée mais `picks < 2` → pas de carte ; après 2 cartes prises → carte `SPECIALISATION` présente ; non recherchée → **jamais** présente ; (c) prendre la carte `SPECIALISATION` de `laser_continu` pose `laserDestructeurOwned` ; (d) `eligibleFusions()` ne contient pas `fus_orage` si `ricochets` est emportée mais non assemblée, la contient quand les deux sont assemblées, ne contient jamais `fus_vortex` (secteur 4) ; (e) une carte d'amélioration prise applique l'incrément exactement une fois (`laserSpeedBonus` +0,10) ; (f) pas d'erreur JS.
- [ ] **Step 2: Lancer** `python3 tools/techs_test.py`. Attendu : échec sur les nouveaux cas.
- [ ] **Step 3: Implémenter** selon les signatures ; adapter la page Collection et ses compteurs (`codexSummary`).
- [ ] **Step 4: Lancer** `python3 tools/techs_test.py`, `python3 tools/home_test.py`, `python3 tools/smoke_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 5: Commit** — `feat(mission): cartes d'amélioration et de spécialisation par technologie, fusions conditionnées`.

---

### Task 7: Migration finale et suppression de l'ancien arbre

**Files:**
- Delete: `src/data/skill-tree.js`, `src/ui/tree-ui.js`
- Modify: `src/data/meta.js`, `src/scripts.json`, `src/scenes/GameScene.js` (`treeState`, codex), `src/ui/dom.js`, `src/game/run.js:33`, `src/main.js` (`window.__T`), `src/home/ui.js`, `tools/rd_test.js`, `tools/perks_test.py`, `tools/smoke_test.py`, `tools/sim/bot.js`, `tools/sim_balance.py`

**Interfaces:**
- Consumes : tâches 1 à 6. **Avant la suppression**, geler dans `tools/rd_test.js` le résultat chiffré de l'équivalence de la tâche 1 (valeurs attendues en dur : la comparaison à `skill-tree.js` disparaît avec lui).
- Produces :
  - `metaFromV3Tree(meta): meta` (dans `meta.js`) — rembourse **tous** les rangs restants de `meta.tree` (coût de chaque rang selon l'ancienne formule `mkCost`, gelée dans `meta.js` sous la forme `TREE_LEGACY_COSTS: Object<nodeId, {base,step,max}>` pour les ~75 nœuds), accorde le plan de chaque ordre déjà gagné (`ssx_worlds_v1`, via `TECH_PLAN_LEVEL`), met `tree` à `undefined`, `notice:'restructuration'` si un remboursement a eu lieu.
  - `migrateMeta()` appelle cette conversion pour toute v3 qui possède encore un `tree` non vide, **une seule fois** (idempotent : après écriture, `tree` absent) ; `normalizeMeta` ne produit plus `tree`. `metaPoints` = somme des rangs `rd` + 4 × Mk d'atelier. `GameScene` n'a plus de `treeState`, `window.__T` n'expose plus `ALL_TREE_NODES`.
- [ ] **Step 1: Réécrire les tests** dans `tools/rd_test.js` : v3 avec `tree:{t_laser_c:1,t_laser_c_portee:2,t_multi:3}` et `fragments`/`composants` 10 → après `migrateMeta()` : `composants === 10 + coût(t_laser_c rang 1) + coût(t_laser_c_portee rangs 1-2) + coût(t_multi rangs 1-3)`, `tree` absent, `notice 'restructuration'` ; rejouée = même résultat (pas de double remboursement) ; une v3 sans `tree` n'est pas touchée ; **plans** : `ssx_worlds_v1` avec `w1-tuto` et `w1-l1` gagnés → `rd.laser_continu.plan` et `rd.laser_auto.plan` vrais, `rd.missiles_guidage.plan` faux ; nœud inconnu dans `tree` : ignoré sans exception ; v2 directe (jamais migrée en v3) → mêmes résultats via `metaFromV2` puis conversion.
- [ ] **Step 2: Lancer** `node tools/rd_test.js`. Attendu : échec.
- [ ] **Step 3: Implémenter** puis supprimer `skill-tree.js` et `tree-ui.js` et retirer leurs lignes de `scripts.json` ; Grep `ALL_TREE_NODES`, `TREE_BRANCHES`, `TREE_VIS`, `treeState`, `treeBonus`, `treeRefundFor`, `TREE_MOVED`, `ROMAN` (déplacer `ROMAN` dans `techs.js`, il sert au garage) jusqu'à zéro occurrence hors docs. `computeStartingStatsPreview` et `applyGlobalGear` n'ont plus que l'atelier.
- [ ] **Step 4: Mettre à jour** `tools/smoke_test.py` (la sortie `arbre:` devient `technologies: TECHS.length`), `tools/perks_test.py` (cas v2 : remboursement + plans), `tools/sim/bot.js` (`buy` : atelier, puis prototypes et rangs des technologies de la politique `attaque`/`defense`, équipement du meilleur chargement valide) et `tools/sim_balance.py` (`ssx_meta_v3` sans `tree`).
- [ ] **Step 5: Lancer** `node tools/rd_test.js`, `node tools/atelier_test.js`, puis `python3 tools/smoke_test.py`, `home_test.py`, `perks_test.py`, `techs_test.py`, `level_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 6: Commit** — `refactor(rd): migration finale de l'ancien arbre, suppression de skill-tree.js et tree-ui.js`.

---

### Task 8: Équilibrage, documentation, vérification finale

**Files:**
- Modify: `PASSATION.md`, `CLAUDE.md`, `docs/arbre-competences.md` (marqué historique), `docs/carte/*` (générés)

- [ ] **Step 1: Mesurer** `python3 tools/sim_balance.py campaign --reps 1 --jobs 2` (une mesure sans autre charge CPU). Noter dans `PASSATION.md` : prototypes et rangs achetés par secteur, composants cumulés, victoires au 1er essai. Cible du spec §12 : fin du secteur 1 = 2 prototypes, 2 ou 3 améliorations sur la technologie favorite. **Ne pas changer seul** les prix de la décision 3 : proposer des valeurs à Guet.
- [ ] **Step 2: Documentation.** `PASSATION.md` : entrée « R&D par technologie, emplacements et assemblage », étapes 4 et 5 restantes, décisions 1 à 7, valeurs provisoires. `CLAUDE.md` : section Règles du code (R&D : `data/techs.js`, `ui/rd-ui.js`, `ssx_meta_v3.rd` et `chargement`, tests `rd_test.js` et `techs_test.py`), retirer toute mention de `skill-tree.js` / `tree-ui.js` / « modules R&D » de l'arbre, et corriger la ligne « Deux familles d'atouts » (globaux = atelier ; les technologies emportées se règlent au garage).
- [ ] **Step 3: Carte du code.** `python3 tools/gen_codemap.py` puis `python3 tools/gen_codemap.py --check`.
- [ ] **Step 4: Batterie complète** (liste des Global Constraints) ; lire les lignes ÉCHEC.
- [ ] **Step 5: Commit** — `chore(rd): équilibrage mesuré, passation et carte du code`.

---

## Auto-revue

- **Couverture du spec** : §3.4 plans (1re victoire en attendant l'étape 4, décision 1) → tâche 2 ; §3.5 emplacements → tâches 2 et 4 ; §5.1 cycle de vie (plan, prototype, améliorations, spécialisation) et §5.2 familles → tâches 1 et 3 ; §5.3 interface R&D par secteur → tâche 3 ; §6 chargement et ligne de l'ordre → tâche 4 ; §7 cartes (assemblage garanti, cartes de technologie, spécialisation, réglages du canon, fusions, fin de l'arme légendaire de boss) → tâches 5 et 6 ; §9 migration (remboursement total, plans pour les ordres gagnés, emplacements dérivés des boss) → tâches 2 et 7 ; §11 textes → tâche 2. **Hors périmètre** : plans lâchés en mission, pièces de secteur obtenables, marqueur de l'ennemi porteur (étape 4) ; livrées et distinctions RH (étape 5) ; spécialisations « à concevoir » (à proposer à Guet) ; technologies des secteurs 4 et 5 jouables ; icônes dédiées des technologies.
- **Cohérence des noms** : `TECHS`, `TECH_BY_ID`, `TECH_PLAN_LEVEL`, `techAvailable`, `rdEntry`, `rdNextCost`, `rdCanBuy`, `rdBuy`, `rdGrantPlan`, `rdUpgradeAt`, `slotsOpen`, `loadoutCheck`, `loadoutSanitize`, `loadoutToggle`, `techState`, `techAssemble`, `assemblyCards`, `techCards`, `metaFromV3Tree` sont utilisés avec les mêmes signatures dans toutes les tâches.
- **Risques connus** : (1) l'équivalence `inc` ↔ `apply` est la pièce la plus fragile (tâche 1) : si un ancien `apply` n'est pas décomposable en incréments, le signaler et trancher dans le ledger ; (2) entre les tâches 5 et 7, l'ancien `tree` reste dans la sauvegarde sans effet (aucun double effet) ; (3) la tâche 5 touche au tirage des cartes à chaque montée de niveau : la batterie `level_test.py` est le filet ; (4) `GameScene.js` et `home/ui.js` sont aussi modifiés par l'accueil orbital de l'autre IA : refaire `git fetch` avant chaque tâche.
