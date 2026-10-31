# Étape 4 — plans de technologie et pièces de secteur lâchés en mission : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** on ne reçoit plus le plan d'une technologie automatiquement à la 1re victoire d'un ordre : il **tombe en mission** (du boss de fin d'ordre, ou d'un ennemi marqué quand l'ordre n'a pas de boss) et il faut le ramasser. Les **pièces de secteur** (une par secteur) tombent rarement des unités lourdes et sont garanties à la mort du boss du secteur ; elles rendent enfin achetables les niveaux III à V de l'atelier et les spécialisations de la R&D.

**Architecture :** les règles de butin (taux, garanties, quel plan pour quel ordre) sont des fonctions pures ajoutées à `src/data/composants.js`, testées sous Node (`tools/loot_rules_test.js`). Un nouveau fichier `src/world/loot.js` (mixin de `GameScene`, sur le modèle de `src/world/composants.js`) crée les objets ramassables (plan, pièce), leur aimant et leurs notifications. Les points d'accroche sont ceux des composants : mort d'un ennemi (`combat/damage.js`), mort d'un boss (`bosses/*.js`, `bosses/core.js`), fin du tuto. Le plan est inscrit dans la sauvegarde **dès le ramassage** (même en cas de défaite) ; les pièces rejoignent le total à la fin de la mission avec les composants.

**Tech Stack :** Phaser 3.70 en scripts classiques (`mixin(GameScene, {…})`), tests Node (`tools/*_test.js`) et Playwright Python (`tools/loot_test.py`, `level_test.py`, `home_test.py`).

**Spec :** `docs/superpowers/specs/2026-10-27-progression-design.md` (§3.3 pièces de secteur, §3.4 plans, §10 assets, §11 textes). Étapes précédentes : `docs/superpowers/plans/2026-10-27-rd-emplacements.md` (R&D, `TECH_PLAN_LEVEL`), `docs/superpowers/plans/2026-10-27-atelier-v3.md` (atelier, `meta.pieces`).

## Décisions de ce plan (à relire par Guet)

1. **Qui lâche quoi.** Ordre avec un boss de fin (secteur 1 : tuto Antenne-Mère, Météo, Araignée, Réacteur, Anneau ; secteurs 2 et 3 : leur dernier ordre) : **le boss lâche le plan** de l'ordre (`TECH_PLAN_LEVEL`). Ordre sans boss (secteurs 2 et 3, ordres 1 à 4) : **un ennemi marqué**, un `tank` (lent, lisible), apparaît une seule fois à **25 s** de jeu, porte un repère doré ; le tuer fait tomber le plan, le laisser s'échapper le fait « revenir à la tentative suivante » (spec §3.4). Aucun plan n'est lâché si la technologie est déjà acquise. Le dernier ordre du secteur 1 (PDG) n'a pas de plan (il ouvre une baie).
2. **Pièces.** Chance de **4 %** par ennemi lourd tué (`COMP.heavyTypes`), pièce du secteur de l'ordre ; **3 pièces garanties** à la mort du boss de secteur (dernier ordre de chaque monde) ; les boss de fin d'ordre intermédiaires n'en garantissent pas. Valeurs provisoires (tâche 6, `sim_balance.py`).
3. **Pièces et défaite.** Le spec ne dit rien : proposition = **les pièces ramassées sont toutes conservées**, en victoire comme en défaite ou abandon (la franchise de 30 % ne s'applique qu'aux composants : des pièces rares qui s'arrondissent mal et une défaite qui efface le travail sont deux anti-objectifs). À la victoire, les pièces encore à l'écran sont aspirées avec les composants.
4. **Plus de plan à la 1re victoire.** On retire l'attribution automatique ajoutée à l'étape 3 (`rec.plan` de `recordLevelClear`, `rdGrantPlan` dans `run.js` et `tuto.js`). Les joueurs déjà migrés gardent leurs plans (la migration de l'étape 3 les a accordés).
5. **`?dev`.** Les plans sont considérés acquis (`rdCanBuy` ne bloque plus sur `plan`) ; le bouton « +5 PIECES » du garage reste.
6. **Assets.** Pas d'image finale : deux icônes pixel de remplacement (`plan`, `piece`) dessinées par `tools/gen_ui_icons.py`, et un brief pour les vrais sprites (tâche 2).

## Global Constraints

- Branche `progression-agp`. **Pas de push sans demande de Guet ou de Bio.** Commits locaux par tâche autorisés une fois l'exécution validée par Guet.
- `mixin` plante si une méthode existe déjà : Grep chaque nouveau nom avant de l'ajouter. Tout nouveau fichier JS va dans `src/scripts.json`, dans l'ordre (`world/loot.js` juste après `world/composants.js`).
- Pas d'émoji ni de glyphe pour une icône d'interface : `uiIco('plan', 12)`, `uiIco('piece', 12)`. Titres en majuscules sans accents. Zone de jeu 400×700 : jamais de `vw`/`vh`.
- **Anti-objectifs du spec** : aucune fenêtre ne s'ouvre au ramassage d'un plan ou d'une pièce (notification HUD seulement, la partie continue) ; les objets ne doivent pas gêner la lecture des tirs ennemis (taille, profondeur et teinte distinctes des projectiles).
- Les valeurs de combat ne changent pas ; `src/data/balance.js` et `lvDef` non plus.
- Dans un `page.evaluate` Playwright, ne jamais renvoyer d'objet Phaser : terminer par `return 0`.
- Avant de livrer : `python3 tools/smoke_test.py`, `home_test.py`, `level_test.py`, `perks_test.py`, `techs_test.py`, `loot_test.py`, `python3 tools/orbital_home_test.py`, `node tools/check_worlds.js`, `node tools/composants_test.js`, `node tools/atelier_test.js`, `node tools/rd_test.js`, `node tools/loot_rules_test.js`, `python3 tools/gen_codemap.py` puis `--check`. Lire aussi les lignes ÉCHEC. `level_test.py` a deux attentes temporelles instables connues (boss PDG et Réacteur) : relancer une fois avant de conclure.

## Review Focus

Chaque ligne a son test dans la tâche indiquée.

- **Plan ramassé puis défaite ou abandon** : la technologie reste recherchable (le plan est écrit dans la sauvegarde au ramassage, la méta périmée de la partie ne l'écrase pas à la fin) (tâche 4).
- **Ennemi marqué** : n'apparaît ni quand le plan est déjà acquis, ni dans un ordre à boss, ni au tuto, ni plus d'une fois par tentative ; échappé non tué = pas de plan, et il revient à la tentative suivante (tâche 4).
- **Lisibilité du combat** : ramasser un plan ou une pièce n'ouvre aucune fenêtre (`running` reste vrai, `#levelup` reste caché) et les objets n'attirent pas les tirs ennemis ni ne bloquent les projectiles du joueur (tâches 3 et 4).
- **Pièces** : créditées en victoire, en défaite et en abandon, intégralement ; les pièces encore à l'écran à la victoire sont comptées ; jamais de pièce d'un secteur inexistant (ordre de l'éditeur, monde inconnu) (tâche 3).
- **Garantie du boss de secteur** : exactement 3 pièces du bon secteur à la mort du boss de secteur, et aucune garantie pour un boss intermédiaire ni un boss bonus (tâche 3).

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `src/data/composants.js` | règles de butin : taux des pièces, garantie du boss de secteur, plan d'un ordre |
| `src/world/loot.js` (nouveau) | objets ramassables plan et pièce, ennemi marqué, `bossLoot` |
| `src/combat/damage.js`, `src/bosses/*.js`, `src/bosses/core.js`, `src/game/tuto.js`, `src/game/level.js` | points d'accroche (mort d'ennemi, mort de boss, fin du tuto, apparition du marqué) |
| `src/game/run.js`, `src/game/tuto.js`, `src/data/world-progress.js` | fin de l'attribution à la 1re victoire ; pièces créditées ; lignes du rapport |
| `src/data/agp-lore.js`, `src/home/ui.js`, `src/data/techs.js` | textes N.O.R.M.A., ligne « PLAN » de la fiche d'ordre, bypass `?dev` |
| `tools/gen_ui_icons.py`, `src/ui/ui-icons.js`, `src/scenes/BootScene.js`, `assets/sprites/ui_*.png`, `assets/manifest.json`, `docs/briefs-assets-etape4.md` | icônes et brief |
| `tools/loot_rules_test.js` (nouveau), `tools/loot_test.py` (nouveau), `tools/level_test.py`, `tools/rd_test.js`, `tools/sim/bot.js`, `tools/sim_balance.py` | tests et simulateur |

---

### Task 1: Règles de butin (données pures)

**Files:**
- Modify: `src/data/composants.js`
- Create: `tools/loot_rules_test.js`

**Interfaces:**
- Produces (dans `COMP` et en fonctions globales) :
  - `COMP.pieceChance = 0.04`, `COMP.sectorBossPieces = 3`, `COMP.planCarrierAt = 25` (secondes de jeu), `COMP.planCarrierType = 'tank'`.
  - `pieceKey(worldOrder: number): string|null` — `'s'+order` pour 1 à 5, `null` sinon.
  - `pieceDropCount(enemyType: string, rnd: number): 0|1` — 1 si `enemyType ∈ COMP.heavyTypes` et `rnd < COMP.pieceChance`, sinon 0 (`rnd` = un tirage dans [0,1[, injecté pour tester).
  - `bossPieceCount(levelId: string): number` — `COMP.sectorBossPieces` si `levelId` est le dernier ordre de son monde (`worldSummary` : `world.levels[length-1].id`), 0 sinon (y compris pour un id inconnu).
  - `planCarrierFor(levelId: string, meta): string|null` — la technologie dont l'ordre porte le plan (`TECH_PLAN_LEVEL[levelId]`) si elle n'est pas encore acquise (`!rdEntry(meta, tech).plan`), sinon `null` ; `null` aussi hors `DEV_SEE_ALL` n'a pas d'effet : en `?dev` le résultat reste calculé normalement (le bypass est dans `rdCanBuy`).
  - `levelHasBoss(l): boolean` — `l.type === 'boss' || !!l.finalBoss || l.tuto === true`.
- Consumes : `WORLDS`, `levelById`, `TECH_PLAN_LEVEL`, `rdEntry`.

- [ ] **Step 1: Écrire `tools/loot_rules_test.js` (échoue)** (chargeur `vm` de `tools/rd_test.js`, charger aussi `data/composants.js`, `data/world-progress.js`, `data/worlds*`). Assertions : constantes ci-dessus ; `pieceKey(1) === 's1'`, `pieceKey(3) === 's3'`, `pieceKey(0) === null`, `pieceKey(9) === null` ; `pieceDropCount('tank', 0.03) === 1`, `('tank', 0.04) === 0`, `('grunt', 0) === 0`, `('elite', 0.5) === 0` ; `bossPieceCount('w1-l5') === 3`, `('w2-l5') === 3`, `('w3-l5') === 3`, `('w1-l4') === 0`, `('w1-tuto') === 0`, `('zzz') === 0` ; `planCarrierFor('w1-l1', defaultMeta()) === 'laser_auto'`, avec `rd.laser_auto.plan` vrai → `null`, `planCarrierFor('w1-l5', …) === null` (pas de plan), `planCarrierFor('zzz', …) === null` ; `levelHasBoss(levelById('w1-l1')) === true` (Météo), `levelHasBoss(levelById('w2-l1')) === false`, `levelHasBoss(levelById('w1-tuto')) === true`, `levelHasBoss(levelById('w2-l5')) === true`.
- [ ] **Step 2: Lancer** `node tools/loot_rules_test.js`. Attendu : échec.
- [ ] **Step 3: Implémenter** dans `src/data/composants.js` (même style de commentaires que le reste du fichier : une ligne par règle, « valeurs provisoires »).
- [ ] **Step 4: Lancer** `node tools/loot_rules_test.js` et `node tools/composants_test.js`. Attendu : `OK` des deux.
- [ ] **Step 5: Commit** — `feat(butin): règles des pièces de secteur et des plans lâchés en mission`.

---

### Task 2: Icônes et brief des assets

**Files:**
- Modify: `tools/gen_ui_icons.py`, `src/ui/ui-icons.js` (généré), `src/scenes/BootScene.js`, `assets/manifest.json` (généré par `tools/gen_manifest.py`)
- Create: `assets/sprites/ui_plan.png`, `assets/sprites/ui_piece.png` (générés), `docs/briefs-assets-etape4.md`

**Interfaces:**
- Produces : `uiIco('plan', n)` (document plié, jaune AGP) et `uiIco('piece', n)` (cristal à facettes, métal clair) ; textures Phaser `uiPlan` et `uiPiece` (chargées comme `uiFrag`, `BootScene.js:43`) ; `var(--ico-plan)`, `var(--ico-piece)` en CSS.
- [ ] **Step 1: Dessiner** les deux icônes 12×12 dans `tools/gen_ui_icons.py` (même table `ICONS`, même palette que `frag` et `star`), puis lancer `python3 tools/gen_ui_icons.py` et `python3 tools/gen_manifest.py`.
- [ ] **Step 2: Enregistrer** les textures dans `BootScene.js` à côté de `uiFrag`.
- [ ] **Step 3: Vérifier** : `python3 tools/smoke_test.py` (aucune erreur JS, le jeu démarre) et une capture de 3 icônes à l'écran via un `page.evaluate` qui insère `uiIco('plan', 24)` et `uiIco('piece', 24)` dans un coin ; la lire.
- [ ] **Step 4: Écrire `docs/briefs-assets-etape4.md`** : brief pour les vrais sprites (spec §10) — plan (document / disquette, 2 tailles), 5 pièces de secteur (LENTILLE DE VISEE, BOBINE MAGNETIQUE, CELLULE INSTABLE, NOYAU GRAVITATIONNEL, BADGE D'ACCES : forme et teinte distinctes, lisibles à 24 px), marqueur de l'ennemi porteur ; contraintes du projet (pixel art, fond transparent, WebP, gratuit, génération ChatGPT/ComfyUI, style `docs/direction-artistique-agp.md`).
- [ ] **Step 5: Commit** — `feat(icones): plan et pièce de secteur, brief des assets`.

---

### Task 3: Pièces de secteur en mission

**Files:**
- Create: `src/world/loot.js`, `tools/loot_test.py`
- Modify: `src/scripts.json`, `src/scenes/GameScene.js` (groupe `pieces`, compteurs, collisions), `src/combat/damage.js:195`, `src/bosses/core.js:268`, `src/game/loop.js` (aimant, nettoyage, défilement), `src/game/run.js` (crédit, rapport), `src/game/level.js` (aspiration à la victoire), `src/data/agp-lore.js`

**Interfaces:**
- Consumes : tâches 1 et 2 ; `spawnGemBurst`, `juiceMagnet`, `this.notice`, `cleanupGroup` (modèle : `src/world/composants.js`).
- Produces (méthodes de `GameScene`) :
  - `spawnPieceAt(x, y, key, vy?)` — objet du groupe `this.pieces`, texture `uiPiece`, `pieceKey` en propriété ; **profondeur 3 et teinte par secteur** (un test vérifie qu'il n'est jamais dans `enemyBullets`).
  - `pieceDrop(enemy)` — appelé à la mort d'un ennemi non boss (`damage.js:195`) : `pieceDropCount(enemy.enemyType, Math.random())` pièces du secteur de `this.lvDef.world` (rien sans `lvDef`, rien au tuto).
  - `pieceShower(x, y, key, n)` — `n` pièces dispersées, comme `composantShower`.
  - `onCollectPiece(player, p)` — `this.runPieces[key] += 1`, `this.notice('PIECE DE SECTEUR', <nom>)`, `AGP_LORE.pieces.take` en N.O.R.M.A. une fois par mission, aucun arrêt du jeu.
  - `piecesOnScreen(): Object<key,number>` — comme `composantsOnScreenValue`.
  - `this.runPieces: { s1:0, … s5:0 }` initialisé avec `runComposants`.
  - À la mort d'un boss de secteur (`onBossDefeated`, non bonus, `bossPieceCount(this.lvDef.id)` > 0) : `pieceShower` de ce nombre.
  - Fin de mission (`endRun`) : `meta.pieces[k] += runPieces[k] + (victoire ? piecesOnScreen()[k] : 0)` pour chaque secteur, **sans franchise** (décision 3) ; lignes du rapport `Pièces : +n <NOM>` (une par secteur gagné, `uiIco('piece')`).
  - `AGP_LORE.pieces = { take: "Matériau sensible détecté. Je n'ai rien vu.", names: { s1:'LENTILLE DE VISEE', … } }` (noms du spec §3.3).
- [ ] **Step 1: Écrire `tools/loot_test.py`** (Playwright, squelette de `techs_test.py`, `ssx_worlds_v1` avec `w1-tuto` et `w1-l1` gagnés, lancer `w1-l2`) : (a) `spawnPieceAt(200, 300, 's1')` puis `onCollectPiece` → `runPieces.s1 === 1`, `running` toujours vrai, `#levelup` caché (**Review Focus : pas de fenêtre**) ; (b) l'objet n'est pas dans `enemyBullets` et sa profondeur ≠ celle des tirs ennemis ; (c) avec `Math.random` forcé à 0, tuer un `tank` (appeler le chemin de mort réel, `killEnemy` ou équivalent : lire `damage.js`) fait apparaître 1 pièce `s1` ; avec `Math.random` forcé à 0,9 : 0 ; un `grunt` : 0 ; (d) **crédit** : 2 pièces ramassées puis `endRun(false)` (défaite) → `getMeta().pieces.s1 === 2` ; abandon idem ; victoire avec 1 pièce encore au sol → comptée ; (e) **garantie** : dans l'ordre `w1-l5` (boss de secteur), appeler `onBossDefeated({ x:200, y:200, id:'pdg' })` → exactement 3 pièces `s1` dans le groupe ; dans `w1-l4` (boss intermédiaire) → 0 ; boss bonus (`ref.isBonus`) → 0 ; (f) un `lvDef` d'un monde inconnu ne plante pas (`pieceKey` → null, aucune pièce) ; (g) pas d'erreur JS.
- [ ] **Step 2: Lancer** `python3 tools/loot_test.py`. Attendu : échec.
- [ ] **Step 3: Implémenter** selon les signatures (Grep les noms avant). Les pièces suivent le défilement et l'aimant comme les composants (`loop.js:268, 287, 332`).
- [ ] **Step 4: Rapport** : dans `run.js`, ajouter les lignes de pièces sous « Composants récupérés » ; mettre à jour `tools/level_test.py` si une attente existante change (ne rien casser).
- [ ] **Step 5: Lancer** `python3 tools/loot_test.py`, `python3 tools/level_test.py`, `python3 tools/smoke_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 6: Commit** — `feat(butin): pièces de secteur lâchées par les unités lourdes et garanties par le boss de secteur`.

---

### Task 4: Plans lâchés en mission (boss ou ennemi marqué)

**Files:**
- Modify: `src/world/loot.js`, `src/bosses/meteo.js:341`, `src/bosses/araignee.js:329`, `src/bosses/reacteur.js:323`, `src/bosses/anneau.js:304`, `src/bosses/core.js:268`, `src/game/tuto.js:196`, `src/game/level.js`, `src/game/run.js`, `src/data/world-progress.js`, `tools/loot_test.py`, `tools/level_test.py`, `tools/rd_test.js`

**Interfaces:**
- Consumes : tâches 1 à 3 ; `spawnOneEnemy(type, xOverride): Enemy|null` (`src/enemies/spawning.js`) ; `planCarrierFor`, `levelHasBoss`.
- Produces :
  - `spawnPlanAt(x, y, techId)` — objet du groupe `this.plans` (texture `uiPlan`, profondeur 3, teinte dorée, `techId` en propriété) qui descend vers la camionnette ; `onCollectPlan(player, p)` : `rdGrantPlan(this.meta, techId)` **puis `setMeta(this.meta)` immédiatement** (le plan survit à une défaite ; la méta de la partie est la seule écrite, donc rien n'est périmé), `this.notice('PLAN RECUPERE', nom de la technologie)`, `AGP_LORE.rd.plan` en N.O.R.M.A., `this.runPlan = techId`, aucun arrêt du jeu.
  - `bossLoot(x, y, nBig, isSectorBoss)` — remplace `composantShower` aux sites de mort des boss de fin d'ordre : pluie de composants (inchangée) **puis** plan de l'ordre si `planCarrierFor(this.lvDef.id, this.meta)` (un seul par boss), les pièces garanties de la tâche 3 restent dans `onBossDefeated`. Le tuto : à la mort du boss (`tuto.js:196`), `spawnPlanAt` de `laser_continu` si non acquis.
  - Ennemi marqué : `levelUpdate` (même endroit que l'apparition du boss, `level.js:25-27`) — si l'ordre n'a pas de boss (`!levelHasBoss(this.lvDef)`), `planCarrierFor(id, meta)` non nul, `this.lvT >= COMP.planCarrierAt` et `!this._carrierSpawned` : `const e = this.spawnOneEnemy(COMP.planCarrierType)` ; si `e` : `e.carriesPlan = techId`, repère doré (sprite `uiPlan` suivant l'ennemi, détruit avec lui), `this._carrierSpawned = true`. À sa mort (même chemin que `pieceDrop`, `damage.js:195`) : `spawnPlanAt(e.x, e.y, e.carriesPlan)`. Sorti de l'écran sans mourir : rien (le repère disparaît, `_carrierSpawned` reste vrai pour cette tentative).
  - `recordLevelClear` ne renvoie plus `plan` ; `run.js` et `tuto.js` n'appellent plus `rdGrantPlan` à la victoire (décision 4) ; `rd_test.js` : retirer les assertions sur `rec.plan` ; `level_test.py` : l'assertion « plan du LASER AUTO-CIBLEUR acquis à la 1re victoire de w1-l1 » devient « acquis quand on ramasse le plan du boss de w1-l1 ».
- [ ] **Step 1: Ajouter à `tools/loot_test.py`** : (a) **Review Focus : plan ramassé puis défaite** : `spawnPlanAt(200,300,'laser_auto')`, `onCollectPlan`, puis `endRun(false)` → `getMeta().rd.laser_auto.plan === true`, et la méta de fin de partie ne l'a pas écrasé (relire après `endRun`) ; abandon idem ; (b) à la mort du boss de `w1-l1` (Météo : appeler `mtDie()` ou le chemin réel, lire `bosses/meteo.js:332`), un objet `plans` avec `techId === 'laser_auto'` apparaît ; si le plan est déjà acquis : aucun ; (c) **ennemi marqué** : dans `w2-l1` (sans boss, secteur 2) avec le plan de `drone` non acquis, après `lvT = 25` aucun marqué avant, un seul `tank` marqué après (`carriesPlan === 'drone'`) ; une deuxième vérification plus tard n'en crée pas d'autre ; le tuer fait apparaître 1 plan ; plan déjà acquis → aucun marqué ; ordre à boss (`w1-l2`) → aucun marqué ; tuto → aucun marqué ; (d) marqué sorti de l'écran sans mourir : aucun plan, `_carrierSpawned` vrai ; après `scene.restart` du même ordre (nouvelle tentative), un marqué reparaît ; (e) ramasser un plan n'ouvre aucune fenêtre (`running` vrai, `#levelup` caché) ; (f) pas d'erreur JS.
- [ ] **Step 2: Lancer** `python3 tools/loot_test.py`. Attendu : échec sur les nouveaux cas.
- [ ] **Step 3: Implémenter.** Remplacer les appels de pluie de composants des boss de fin d'ordre par `bossLoot` (un seul appel par site : `meteo.js`, `araignee.js`, `reacteur.js`, `anneau.js`, `core.js:268`, `pdg.js:350` pour le PDG **sans plan**) ; ne pas toucher au boss bonus ni au Trésorin. Supprimer l'attribution à la 1re victoire.
- [ ] **Step 4: Lancer** `python3 tools/loot_test.py`, `node tools/rd_test.js`, `python3 tools/level_test.py`, `python3 tools/techs_test.py`, `python3 tools/smoke_test.py`. Attendu : sans ÉCHEC.
- [ ] **Step 5: Commit** — `feat(butin): le plan tombe du boss de l'ordre ou d'un ennemi marqué, acquis au ramassage`.

---

### Task 5: Rapport, fiche d'ordre et `?dev`

**Files:**
- Modify: `src/game/run.js`, `src/home/ui.js` (fiche d'ordre), `src/data/techs.js` (`rdCanBuy`), `src/data/agp-lore.js`, `tools/home_test.py`, `tools/level_test.py`, `tools/rd_test.js`

**Interfaces:**
- Consumes : tâches 3 et 4.
- Produces :
  - Rapport d'intervention : ligne `Plan récupéré : <NOM>` (`uiIco('plan')`) quand `runPlan` est posé (victoire **ou** défaite : il est acquis dès le ramassage), commentaire N.O.R.M.A. `AGP_LORE.rd.plan` inchangé.
  - Fiche d'ordre : ligne `PLAN` — `A RECUPERER : <TECHNOLOGIE>` quand `TECH_PLAN_LEVEL[l.id]` existe et n'est pas acquis, `ACQUIS : <TECHNOLOGIE>` sinon, masquée quand l'ordre n'a pas de plan ; masquée pour le tuto (même convention que la ligne CHARGEMENT).
  - `rdCanBuy` : ne refuse plus pour `'plan'` quand `DEV_SEE_ALL` (décision 5) ; `rdNextCost` inchangé.
- [ ] **Step 1: Écrire les tests** : `home_test.py` — la fiche d'ordre de `w1-l1` affiche `PLAN` avec `A RECUPERER` et `LASER AUTO-CIBLEUR` quand non acquis, `ACQUIS` quand `rd.laser_auto.plan` ; pas de ligne pour `w1-l5` ni pour le tuto ; `level_test.py` — après une défaite ayant ramassé un plan, le rapport contient `Plan récupéré` ; `rd_test.js` — `rdCanBuy` accepte le prototype sans plan quand `DEV_SEE_ALL` est vrai (définir `ctx.DEV_SEE_ALL = true` dans le contexte) et le refuse sinon (`reason 'plan'`).
- [ ] **Step 2: Lancer** les trois. Attendu : échec.
- [ ] **Step 3: Implémenter.**
- [ ] **Step 4: Vérifier visuellement** : capture 420×760 de la fiche d'un ordre avec plan et du rapport d'une mission ayant ramassé un plan et une pièce ; les lire.
- [ ] **Step 5: Lancer** `python3 tools/home_test.py`, `python3 tools/level_test.py`, `node tools/rd_test.js`. Attendu : sans ÉCHEC.
- [ ] **Step 6: Commit** — `feat(rapport): plan récupéré et pièces au rapport, ligne PLAN de la fiche d'ordre, plans acquis en ?dev`.

---

### Task 6: Équilibrage, simulateur, documentation, vérification finale

**Files:**
- Modify: `tools/sim/bot.js`, `tools/sim_balance.py`, `PASSATION.md`, `CLAUDE.md`, `docs/carte/*` (générés)

- [ ] **Step 1: Simulateur.** Le bot ne chasse pas les objets : à la victoire d'un ordre, `__sim` accorde le plan de `TECH_PLAN_LEVEL` et crédite les pièces garanties du boss de secteur, pour que `campaign` mesure toujours la progression (documenter ce raccourci en tête de `bot.js`). Ne pas modifier le combat du bot.
- [ ] **Step 2: Mesurer** `python3 tools/sim_balance.py campaign --reps 1 --jobs 2` (sans autre charge CPU). Noter dans `PASSATION.md` : pièces gagnées par secteur sur une campagne complète, Mk d'atelier et spécialisations accessibles à la fin du secteur 1, comparés à la demande (Mk III de six postes = 12 pièces S1 ; spécialisations du secteur 1 = 2 pièces chacune). **Ne pas modifier seul** les taux de la décision 2 : proposer des valeurs à Guet.
- [ ] **Step 3: Documentation.** `PASSATION.md` : entrée « Plans et pièces en mission », étape 5 restante, décisions 1 à 6. `CLAUDE.md` : section Règles du code (butin : `data/composants.js`, `world/loot.js`, tests `loot_rules_test.js` et `loot_test.py`).
- [ ] **Step 4: Carte du code.** `python3 tools/gen_codemap.py` puis `python3 tools/gen_codemap.py --check`.
- [ ] **Step 5: Batterie complète** (liste des Global Constraints) ; lire les lignes ÉCHEC ; relancer seuls les tests instables connus.
- [ ] **Step 6: Commit** — `chore(butin): équilibrage mesuré, passation et carte du code`.

---

## Auto-revue

- **Couverture du spec** : §3.3 pièces (rares sur les lourds, garanties au boss de secteur, une par secteur) → tâches 1 et 3 ; §3.4 plans (boss de fin d'ordre sinon ennemi marqué, acquis au ramassage même en défaite, « reviendra à la tentative suivante », fiche d'ordre « PLAN A RECUPERER ») → tâches 4 et 5 ; §10 assets (sprites de remplacement + brief) → tâche 2 ; §11 textes (plan ramassé, pièce de secteur) → tâches 3 et 4. **Hors périmètre** : les vrais sprites (à générer d'après le brief) ; l'icône du marqueur définitive ; les pièces S4 et S5 (secteurs inexistants : `pieceKey` les prévoit, rien ne les lâche) ; les distinctions RH et livrées (étape 5) ; le HUD de pièces pendant la mission (notification seulement).
- **Cohérence des noms** : `COMP.pieceChance`, `COMP.sectorBossPieces`, `COMP.planCarrierAt`, `COMP.planCarrierType`, `pieceKey`, `pieceDropCount`, `bossPieceCount`, `planCarrierFor`, `levelHasBoss`, `spawnPieceAt`, `pieceDrop`, `pieceShower`, `onCollectPiece`, `piecesOnScreen`, `runPieces`, `spawnPlanAt`, `onCollectPlan`, `runPlan`, `bossLoot`, `carriesPlan`, `_carrierSpawned` sont utilisés avec les mêmes signatures dans toutes les tâches.
- **Risques connus** : (1) la mort des boss passe par six sites différents (`bosses/*.js`) : une régression de composants y est possible, `level_test.py` est le filet ; (2) `GameScene.js` et `home/ui.js` sont aussi touchés par d'autres branches : `git fetch` avant chaque tâche ; (3) l'ennemi marqué réutilise `spawnOneEnemy`, qui refuse au-delà de `ENEMY_HARD_CAP` : le test (c) vérifie la création, pas seulement l'appel ; (4) les taux de pièces sont provisoires et conditionnent la vitesse de progression de l'atelier (Mk III à V) : la tâche 6 les mesure sans les changer.
