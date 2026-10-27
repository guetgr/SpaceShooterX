# Refonte de la progression AGP — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** rendre visibles les composants ◆ (ils tombent, se ramassent et se comptent en mission), refaire le rapport d'intervention (prime, franchise) et réaligner les textes des secteurs 2 et 3 sur la bible. Les étapes suivantes de la refonte sont listées dans la feuille de route.

**Architecture :** les règles de calcul pures vont dans `src/data/composants.js`, testées sous Node avec le même chargeur `vm` que `tools/check_worlds.js`. La partie en jeu est une nouvelle mixin `src/world/composants.js`, construite sur le modèle de `src/world/pickups.js` (groupe Phaser, aimant, ramassage). Le reste branche ces méthodes là où le jeu crée déjà ses cristaux (mort d'un ennemi, mort d'un boss, Trésorin), là où il gère la victoire (`levelWin`) et là où il fait les comptes (`endRun`).

**Tech Stack :** Phaser 3.70 en scripts classiques (portée globale, `mixin(GameScene, {…})`), tests Playwright en Python (`tools/level_test.py`, `tools/home_test.py`), tests Node (`tools/*_test.js`).

**Spec :** `docs/superpowers/specs/2026-10-27-progression-design.md` (bible : `docs/bible-univers.md`).

## Feuille de route

Le design couvre 6 étapes. Chacune a son propre plan, écrit au moment de l'attaquer, parce que les étapes 2 à 5 réécrivent du code que l'étape 1 aura modifié.

| Étape | Contenu | Plan |
|---|---|---|
| **1** | Composants visibles, rapport (prime, franchise) | **ce document, tâches 1 à 6** |
| 2 | Sauvegarde `ssx_meta_v3` + migration, atelier (6 postes Mk I-V, canon et aimant visibles) | à écrire après la fusion de l'étape 1 |
| 3 | R&D par technologie, emplacements (1 + boss de secteur), chargement, cartes d'assemblage ; suppression de l'arbre | après l'étape 2 |
| 4 | Plans (lâchés par les boss de fin d'ordre) et pièces de secteur | après l'étape 3 |
| 5 | Distinctions RH → livrées, textes N.O.R.M.A., finitions | après l'étape 4 |
| **6a** | Textes des secteurs 2 et 3 alignés sur la bible | **ce document, tâches 7 et 8** (indépendantes des tâches 1 à 6) |
| 6b | Vagues, boss Broyeur / Directeur, décors des secteurs 2 et 3 | quand les images existent |

## Global Constraints

- Branche `progression-agp` (créée depuis `origin/main` du 27 oct., avec la mise à jour de Bio : boss du secteur 1). **Pas de push sans demande de Guet ou de Bio.** Les commits locaux par tâche ne se font que si Guet a validé l'exécution du plan.
- `mixin` plante si une méthode existe déjà : chercher chaque nouveau nom avec Grep avant de l'ajouter.
- Tout nouveau fichier JS va dans `src/scripts.json`, dans l'ordre : un fichier n'utilise au démarrage que ce qui est défini plus haut.
- Pas d'émoji ni de glyphe pour une icône d'interface : utiliser `uiIco('frag', 12)` ou `<i data-ico="frag">`.
- Titres en majuscules, sans accents.
- Zone de jeu 400×700 : jamais de `vw`/`vh`.
- Ne pas toucher au format des clés `ssx_*` à l'étape 1 : les composants restent `getMeta().fragments`.
- Valeurs fixées par le design : franchise **30 %** sur les composants en cas de défaite ou d'abandon ; prime AGP = **la moitié** de `reward.clear` / `reward.first` du niveau, en victoire seulement ; tout ce qui est ramassé est conservé (moins la franchise).
- Dans un `page.evaluate` Playwright, ne jamais renvoyer d'objet Phaser : terminer par `return 0` ou renvoyer un nombre ou une chaîne.
- Avant de livrer : `python3 tools/smoke_test.py`, `home_test.py`, `level_test.py`, `perks_test.py`, `node tools/check_worlds.js`, `node tools/composants_test.js`, `python3 tools/gen_codemap.py` puis `--check`. Lire aussi les lignes ÉCHEC : certains tests renvoient 0 malgré un échec.

## Review Focus

1. **Lecture du combat** : une pluie de composants de boss ne doit jamais passer devant les tirs ennemis. Composants en profondeur 3, comme les cristaux (test en tâche 3).
2. **Abandon (QUITTER)** : il compte comme une défaite, avec franchise et sans prime (test en tâche 4).
3. **Tutoriel** : il ne lâche aucun composant et ses récompenses restent inchangées (test en tâche 3).
4. **Rejouer** : le compteur repart de 0 à chaque nouvelle mission (test en tâche 3).
5. **Victoire avec des composants encore à l'écran** : ils sont aspirés et crédités, même hors de portée de l'aimant (test en tâche 5).

---

### Task 1 : Règles de calcul des composants

**Files :**
- Create : `src/data/composants.js`
- Create : `tools/composants_test.js`
- Modify : `src/scripts.json` (ajouter `data/composants.js` juste après `data/balance.js`)
- Modify : `CLAUDE.md` (ajouter `node tools/composants_test.js` à la liste « Avant chaque push »)

**Interfaces :**
- Produces :
  - `COMP` (objet de constantes) : `{ smallValue:1, bigValue:5, dropChance:0.15, heavyTypes:['tank','elite','mothership','bomber','bras','pilleur','eclaireur'], heavySmall:3, goldenBig:3, miniBossBig:4, bossBig:12, bonusBossBig:3, primeMul:0.5, franchise:0.30 }`. Les valeurs de drop sont provisoires et seront réglées en tâche 6.
  - `composantsPrime(reward:{clear:number, first?:number}, first:boolean) -> number` = `Math.round(clear*primeMul) + (first ? Math.round((first||0)*primeMul) : 0)`.
  - `composantsBank({ picked:number, victory:boolean, fragmentBonus:number, pactMul:number, prime:number }) -> { gross, franchise, prime, total }` :
    - `gross = Math.round(picked*(1+fragmentBonus)*pactMul)` ;
    - `franchise = victory ? 0 : Math.round(gross*COMP.franchise)` ;
    - `prime` vaut l'entrée en victoire, 0 sinon ;
    - `total = gross - franchise + prime`.

- [ ] **Step 1 : écrire le test qui échoue** `tools/composants_test.js`, sur le modèle de `tools/check_worlds.js` (contexte `vm`, `load('data/composants.js')`, compteur d'échecs, `process.exit(fail ? 1 : 0)`, affiche `OK : composants` si tout passe) :

```js
ok(run("COMP.franchise") === 0.30 && run("COMP.primeMul") === 0.5, 'constantes du design');
ok(run("composantsPrime({clear:20, first:40}, true)") === 30, 'prime 1re victoire = moitié de clear + first');
ok(run("composantsPrime({clear:20, first:40}, false)") === 10, 'prime de rejeu = moitié de clear');
const B = s=> JSON.stringify(run('composantsBank(' + s + ')'));
ok(B("{picked:100, victory:false, fragmentBonus:0, pactMul:1, prime:30}") === '{"gross":100,"franchise":30,"prime":0,"total":70}', 'défaite : franchise 30 %, pas de prime');
ok(B("{picked:100, victory:true, fragmentBonus:0.5, pactMul:1.2, prime:30}") === '{"gross":180,"franchise":0,"prime":30,"total":210}', 'victoire : bonus et clauses sur le ramassé, prime en plus');
ok(B("{picked:0, victory:true, fragmentBonus:0, pactMul:1, prime:30}") === '{"gross":0,"franchise":0,"prime":30,"total":30}', 'victoire sans ramassage : la prime seule');
ok(B("{picked:7, victory:false, fragmentBonus:0, pactMul:1, prime:0}") === '{"gross":7,"franchise":2,"prime":0,"total":5}', 'arrondi de la franchise');
```

- [ ] **Step 2 :** `node tools/composants_test.js` → attendu : erreur `ENOENT` ou `COMP is not defined`.
- [ ] **Step 3 :** créer `src/data/composants.js` (`"use strict";`, commentaire d'en-tête en français comme les autres fichiers de `src/data/`) avec `COMP`, `composantsPrime` et `composantsBank` ; l'ajouter à `src/scripts.json` ; ajouter la ligne de test dans `CLAUDE.md`.
- [ ] **Step 4 :** `node tools/composants_test.js` → attendu : `OK : composants`, code de sortie 0. Puis `python3 tools/smoke_test.py` → aucune erreur JS.
- [ ] **Step 5 : commit** `feat(composants): règles de prime et de franchise`.

### Task 2 : Icône du composant (écrou AGP)

Le ◆ actuel est une gemme jaune. Elle se confond avec le gros cristal de boss (`gemL`, doré) et contredit la bible : un composant est une pièce de machine.

**Files :**
- Modify : `tools/gen_ui_icons.py` (grille `'frag'`, et son commentaire « ◆ composants : écrou AGP »)
- Regenerate : `assets/sprites/ui_frag.png`, `docs/img/ui-icons.png`, `assets/manifest.json` (le script relance `gen_manifest.py`)

**Interfaces :**
- Produces : la texture `uiFrag` (déjà chargée par `src/scenes/BootScene.js:41`) devient l'écrou. C'est le sprite des composants en mission (tâche 3) et l'icône `uiIco('frag')` partout dans l'interface.

- [ ] **Step 1 :** redessiner la grille 12×12 de `'frag'` : un **écrou hexagonal** vu de face, corps gris métal (deux tons, sur le modèle de `S`/`L` de l'icône `lock`), trou central sombre, liseré ou reflet **jaune AGP** `#ffc21a` sur l'arête haute, contour `K`. Il doit se distinguer au premier coup d'œil de l'engrenage `gear` (paramètres) et de la gemme dorée `gemL`.
- [ ] **Step 2 :** `python3 tools/gen_ui_icons.py` → les PNG sont réécrits ; ouvrir `docs/img/ui-icons.png` et vérifier la lisibilité à 12 et 24 px.
- [ ] **Step 3 :** `python3 tools/home_test.py` → aucune régression (le compteur de l'accueil `#homeFrag` affiche l'écrou).
- [ ] **Step 4 :** montrer l'icône à Guet (capture agrandie ×8) avant de continuer ; la redessiner s'il la refuse.
- [ ] **Step 5 : commit** `feat(icones): le composant devient un écrou AGP`.

### Task 3 : Composants en mission (lâchés, ramassés, comptés)

**Files :**
- Create : `src/world/composants.js` (mixin `GameScene`)
- Modify : `src/scripts.json` (`world/composants.js` juste après `world/pickups.js`)
- Modify : `src/scenes/GameScene.js` (création du groupe vers la ligne 118 ; remise à zéro vers la ligne 133 ; overlap vers la ligne 196)
- Modify : `src/combat/damage.js:126` (`killEnemy`, pour les ennemis qui ne sont pas des boss)
- Modify : `src/game/loop.js` (appel de la mise à jour à côté de l'aimant des cristaux, vers la ligne 238 ; `cleanupGroup(this.comps, 80)` à côté de celui des gemmes)
- Modify : `index.html` (compteur sous RENDEMENT dans `.score-wrap`), `css/hud.css`, `src/ui/hud.js` (`updateHud`)
- Test : `tools/level_test.py` (nouvelle section `print('composants en mission')` juste après la section « survie (w1-l1) »)

**Interfaces :**
- Consumes : `COMP` (tâche 1), la texture `uiFrag` (tâche 2), `this.juiceMagnet(obj, delta, storm)` (`src/fx/juice.js`).
- Produces (méthodes de `GameScene`) :
  - `this.comps` : groupe physique. `this.runComposants` : valeur brute ramassée pendant la mission (number).
  - `spawnComposantAt(x:number, y:number, kind:'compS'|'compL', vy?:number) -> void` : sprite `uiFrag`, échelle ×1,5 (`compS`) ou ×2,5 (`compL`), profondeur 3, `c.compValue = COMP.smallValue | COMP.bigValue`, vitesse verticale `vy || 30`.
  - `composantDrop(enemy) -> void` : ne fait rien si `this.tuto`. Un type de `COMP.heavyTypes` lâche `COMP.heavySmall` petits composants ; les autres types en lâchent un avec la probabilité `COMP.dropChance`.
  - `onCollectComposant(player, c) -> void` : ajoute `c.compValue` à `runComposants`, petit éclat, son `sfx.gem()` en attendant un son dédié.
  - `updateComposants(time:number, delta:number) -> void` : même règle d'aimant que les cristaux (`magnetRadius`, `_magnetUntil`, `autoCollect`). Si `this._compVacuum` est vrai, tous les composants sont attirés vers le joueur.
  - `composantsOnScreenValue() -> number` : somme des `compValue` des composants encore actifs.
- Hors périmètre : le Pilleur n'aspire que `this.gems`, donc pas les composants. C'est voulu.

- [ ] **Step 1 : écrire les tests qui échouent** dans `tools/level_test.py` (après `start('w1-l1', …)`) :

```python
check(p.evaluate("%s.runComposants" % SC) == 0 and p.evaluate("%s.comps.getLength()" % SC) == 0, 'composants : compteur à 0 au départ')
n = p.evaluate("(()=>{ const sc = %s; const e = sc.spawnOneEnemy('tank', 200); sc.killEnemy(e); return sc.comps.getLength(); })()" % SC)
check(n >= 3, 'un ennemi lourd lâche 3 composants (%s)' % n)
check(p.evaluate("%s.comps.getChildren().every(c=> c.depth === 3)" % SC), 'composants sous les tirs ennemis (profondeur 3)')
p.evaluate("(()=>{ const sc = %s; sc.spawnComposantAt(sc.player.x, sc.player.y, 'compL', 0); return 0; })()" % SC); p.wait_for_timeout(400)
check(p.evaluate("%s.runComposants" % SC) >= 5, 'ramassage : +5 pour un gros composant')
check(p.evaluate("document.getElementById('compVal').textContent") == str(p.evaluate("%s.runComposants" % SC)), 'compteur du HUD = composants ramassés')
check(p.evaluate("(()=>{ const sc = %s; const k = sc.comps.getLength(); sc.tuto = 1; sc.composantDrop({ enemyType:'tank', x:200, y:200 }); sc.tuto = 0; return sc.comps.getLength() - k; })()" % SC) == 0, 'tutoriel : aucun composant')
```

  Puis, dans la section « rejeu » : `check(p.evaluate("%s.runComposants" % SC) == 0, 'rejeu : le compteur repart de 0')`, juste après le `start`.

- [ ] **Step 2 :** `python3 tools/level_test.py` → attendu : `ÉCHEC` sur `composants : compteur à 0` (`runComposants` est indéfini).
- [ ] **Step 3 :** implémenter `src/world/composants.js`, puis le branchement dans `GameScene.js`, `killEnemy` (`if (!isBoss) this.composantDrop(enemy);` à côté du drop des cristaux), `loop.js` et le compteur du HUD : `<div class="comp-val"><i data-ico="frag"></i> <span id="compVal">0</span></div>`, mis à jour dans `updateHud` avec un cache `this._cpShown` comme pour le score.
- [ ] **Step 4 :** `python3 tools/level_test.py` → la nouvelle section passe. `python3 tools/smoke_test.py` → aucune erreur JS. Capture du HUD à 400×700 : le compteur ne déborde pas avec `runComposants = 1234`.
- [ ] **Step 5 : commit** `feat(composants): lâchés par les ennemis, ramassés à l'aimant, comptés dans le HUD`.

### Task 4 : Rapport d'intervention (prime et franchise)

**Files :**
- Modify : `src/game/run.js:71-83` (le calcul) et `:132-141` (les lignes du rapport)
- Modify : `src/data/balance.js` (supprimer `LEVEL_FRAG_MUL` et son commentaire)
- Modify : `src/data/agp-lore.js` (pools `win`, `lose`, `abort`)
- Test : `tools/level_test.py`

**Interfaces :**
- Consumes : `composantsPrime`, `composantsBank` (tâche 1) ; `this.runComposants`, `composantsOnScreenValue()` (tâche 3).
- Produces : `this.lvResult.bank = { gross, franchise, prime, total }`, à chaque fin de mission en niveau. `getMeta().fragments` augmente de `bank.total`.

Règles :
- `picked = runComposants + (victory ? composantsOnScreenValue() : 0)`.
- La prime ne vaut qu'en victoire en niveau : `composantsPrime(lvDef.reward, rec.first)`.
- L'abandon (`endRun(false, true)`) suit la règle de la défaite.
- Le score ne rapporte plus de composants ; il reste pour le classement.
- `endRun` ne lit plus `runFragBonus`. Le Trésorin est converti en tâche 5.

Lignes du rapport (`addRw`), dans l'ordre :
- Toujours : `'Composants récupérés'` (`+gross`).
- En défaite ou abandon : `'Franchise accident du travail (30 %)'` (`-franchise`).
- En victoire : `'Prime d\'intervention'` (`+round(clear×0,5)`), puis `'Prime de 1re validation'` (`+round(first×0,5)`) si c'est la première victoire.
- Toujours : `'TOTAL'` (`+total`, classe `total`).

Textes N.O.R.M.A. à ajouter, mot pour mot :
- dans `lose` et dans `abort` : « Franchise accident retenue : 30 %. Merci de votre compréhension. »
- dans `win` : « Prime de rendement versée. Elle ne sera pas renouvelée. »

- [ ] **Step 1 : réécrire les tests** de `tools/level_test.py` :
  - Section survie : remplacer `f1 >= 60` par une mesure de `f0 = getMeta().fragments` avant le `start`, puis `check(f1 - f0 == bank.total and bank.prime == 30, …)`, avec `bank = json.loads(p.evaluate("JSON.stringify(%s.lvResult.bank)" % SC))`.
  - Section rejeu : `0 < f2 - f1 < 60` devient `bank.prime == 10 and f2 - f1 == bank.total`.
  - Section défaite (`w1-l2`) : remplacer `sc.score = 300` par `sc.runComposants = 100; sc.stats.fragmentBonus = 0; sc.pactBonusMul = 1`, puis vérifier `bank.franchise == 30 and bank.total == 70 and fragments - fa == 70` et `'Franchise' in document.getElementById('goRewards').textContent`.
  - Section QUITTER (`ORDRE ANNULE`) : avant le clic, `sc.runComposants = 10` ; ensuite `bank.franchise == 3 and bank.prime == 0`.
  - `check(p.evaluate("typeof LEVEL_FRAG_MUL") == 'undefined', 'ancien calcul retiré')`.
- [ ] **Step 2 :** `python3 tools/level_test.py` → attendu : `ÉCHEC` sur `lvResult.bank` (indéfini).
- [ ] **Step 3 :** implémenter le calcul et les lignes du rapport dans `endRun`, supprimer `LEVEL_FRAG_MUL` (Grep : plus aucune occurrence dans `src/`), ajouter les trois répliques dans `agp-lore.js`.
- [ ] **Step 4 :** `python3 tools/level_test.py` → les sections survie, rejeu, défaite et QUITTER passent. `python3 tools/perks_test.py` et `python3 tools/smoke_test.py` → OK.
- [ ] **Step 5 : commit** `feat(rapport): composants récupérés, prime AGP, franchise d'accident`.

### Task 5 : Pluies de composants (boss, Trésorin) et aspiration à la victoire

**Files :**
- Modify : `src/world/composants.js` (ajouter `composantShower`)
- Modify : `src/bosses/core.js:252` (`onBossDefeated` : boss de `BOSS_DEFS`, y compris le boss bonus)
- Modify : morts des boss autonomes, juste avant leur `delayedCall(…, levelWin)` : `src/bosses/meteo.js:336`, `src/bosses/araignee.js:325`, `src/bosses/reacteur.js:319`, `src/bosses/anneau.js:300`, `src/bosses/pdg.js:346`. Le boss du tutoriel n'en reçoit pas.
- Modify : `src/game/level.js:56` (`levelWin` : `this._compVacuum = true`) ; `src/scenes/GameScene.js` (`_compVacuum = false` au démarrage, suppression de `runFragBonus` à la ligne 133)
- Modify : `src/world/pickups.js` (`goldJackpot` : `composantShower(enemy.x, enemy.y, COMP.goldenBig)` au lieu de `runFragBonus`, notice `'+' + COMP.goldenBig*COMP.bigValue + ' composants'`)
- Test : `tools/level_test.py`

**Interfaces :**
- Consumes : `spawnComposantAt` (tâche 3), `COMP` (tâche 1).
- Produces : `composantShower(x:number, y:number, nBig:number) -> void` : `nBig` composants `compL` dispersés en éventail vers le haut (sur le modèle de la pluie de cristaux de `src/bosses/core.js:259`, vitesse 60 à 120).

Quantités :
- `COMP.miniBossBig` (4) pour la Météo, l'Araignée de tri, le Réacteur et l'Anneau.
- `COMP.bossBig` (12) pour le PDG et pour un boss de `BOSS_DEFS` qui n'est pas un bonus.
- `COMP.bonusBossBig` (3) pour un boss bonus.
- `COMP.goldenBig` (3) pour le Trésorin.

Coordonnées : le centre du boss, les mêmes que ses éclats `*Shards`.

- [ ] **Step 1 : écrire les tests qui échouent** :
  - Section survie (avant la victoire, juste après `start`) : poser 10 `compS` à `(20, visibleYRange(0).min + 20)`, hors de portée de l'aimant, puis `check(bank.gross >= 10, 'victoire : les composants restés à l\'écran sont aspirés et crédités')`.
  - Section Anneau : juste après `anDamage(200, 200, 1e9, true)` et 300 ms d'attente, `check(%s.comps.getLength() >= 4, 'mini-boss : pluie de composants')`.
  - Section PDG : après `pdDamage(…1e9…)` et 500 ms, `check(%s.comps.getLength() >= 12, 'boss de secteur : grosse pluie')`.
- [ ] **Step 2 :** `python3 tools/level_test.py` → attendu : `ÉCHEC` sur les trois nouveaux tests.
- [ ] **Step 3 :** implémenter `composantShower`, les six appels de boss, celui du Trésorin et l'aspiration (`_compVacuum`) ; supprimer `runFragBonus` (Grep : plus aucune occurrence dans `src/`).
- [ ] **Step 4 :** `python3 tools/level_test.py` → tout passe, aucune erreur JS. Faire une capture pendant la pluie du PDG : les tirs ennemis restent lisibles.
- [ ] **Step 5 : commit** `feat(composants): pluies de boss et du Trésorin, aspiration à la victoire`.

### Task 6 : Réglage de l'économie et livraison de l'étape 1

**Files :**
- Modify (si besoin) : `src/data/composants.js` (valeurs de drop seulement)
- Modify : `PASSATION.md` (§2 : une ligne « Composants visibles » ; §3 : prochaines étapes 2 à 5 et 6b)
- Regenerate : `docs/carte/*` (`python3 tools/gen_codemap.py`)

Objectif : l'étape 1 ne doit pas casser le rythme de l'arbre actuel, qui reste en place jusqu'à l'étape 3. **Le revenu cumulé niveau par niveau doit rester à ±25 % de celui d'aujourd'hui.**

- [ ] **Step 1 :** sur `origin/main` (avant la refonte, par exemple dans un `git worktree` temporaire), lancer `python3 tools/sim_balance.py campaign --reps 3`. Relever la colonne `fragments(cumul)` pour `w1-l1` à `w3-l5`.
- [ ] **Step 2 :** sur `progression-agp`, même commande, même colonne.
- [ ] **Step 3 :** si l'écart dépasse ±25 % sur un niveau, ajuster d'abord `COMP.dropChance`, puis `heavySmall`, `miniBossBig` et `bossBig`. Ne jamais toucher `primeMul` ni `franchise`, fixés par le design. Relancer jusqu'à rester dans la fourchette. Noter les deux tableaux dans le compte rendu à Guet.
- [ ] **Step 4 :** suite complète : `smoke_test.py`, `home_test.py`, `level_test.py`, `perks_test.py`, `node tools/check_worlds.js`, `node tools/composants_test.js`, `gen_codemap.py` puis `gen_codemap.py --check`. Lire les lignes ÉCHEC.
- [ ] **Step 5 : commit** `chore(composants): réglage des drops, carte du code, passation`.

### Task 7 : Secteurs 2 et 3 renommés selon la bible (étape 6a)

**Files :**
- Modify : `src/data/worlds/monde-2.js`, `src/data/worlds/monde-3.js` (noms seulement : ni menaces, ni objectifs, ni vagues)
- Modify : `src/bosses/core.js:90` (libellé de la jauge de boss)
- Modify : `src/data/agp-lore.js:8` et `index.html:68` (`EMPLOYE N° 0042`, bible §3)
- Test : `tools/home_test.py:89`, `tools/level_test.py`

**Valeurs (mot pour mot) :**

| Monde | `name` | `sub` | Niveaux 1 → 5 (`name`) | `bossName` du niveau 5 |
|---|---|---|---|---|
| w2 | `LA CASSE LUNAIRE` | `Recyclage obligatoire` | `QUAI DE DECHARGEMENT`, `CHAINE DE TRI`, `ZONE DE COMPACTAGE`, `BENNE A CRISTAUX`, `LE BROYEUR` | `LE BROYEUR` |
| w3 | `MARS, PLANETE POUBELLE` | `Gestion des déchets dangereux` | `DESERT ROUGE`, `CONFINEMENT`, `FUITE DE CRISTAUX`, `CONVOI SECURISE`, `LE DIRECTEUR` | `LE DIRECTEUR DE TRAITEMENT` |

**Interfaces :**
- Produces : en niveau, la jauge d'un boss de `BOSS_DEFS` affiche `this.lvDef.bossName` à la place de `def.name` quand le niveau en définit un et que ce boss est celui du niveau (`def` correspond à `this.lvDef.boss`). Le suffixe `' NIV.' + …` est conservé. La fiche d'ordre de mission le fait déjà (`levelGoalText`, `src/home/ui.js:14`).

- [ ] **Step 1 : tests.** Dans `home_test.py:89`, `'NEBULEUSE ROUGE'` devient `'LA CASSE LUNAIRE'`. Dans `level_test.py`, nouvelle section `print('secteur 2 : nom du boss')` : `start('w2-l5')`, attendre que le boss apparaisse (`sc.bossActive`), puis `check('LE BROYEUR' in document.getElementById('bossLabel').textContent, …)`. Ajouter `check(p.evaluate("AGP_LORE.employee") == 'EMPLOYE N° 0042', …)`.
- [ ] **Step 2 :** lancer les deux tests → attendu : `ÉCHEC` sur ces vérifications.
- [ ] **Step 3 :** appliquer les valeurs du tableau, le libellé de la jauge et le numéro d'employé (Grep `4 471 902` : plus aucune occurrence).
- [ ] **Step 4 :** `home_test.py`, `level_test.py` et `node tools/check_worlds.js` → OK. Capture de la carte des secteurs à 400 px de large : `MARS, PLANETE POUBELLE` tient sans déborder (sinon le signaler à Guet, sans abréger de soi-même).
- [ ] **Step 5 : commit** `feat(secteurs): Casse lunaire et Mars, noms de la bible`.

### Task 8 : Transmission N.O.R.M.A. de fin de secteur (étape 6a)

**Files :**
- Modify : `src/data/agp-lore.js` (nouvelle entrée `sectors`)
- Modify : `src/game/run.js` (texte de `#rpNorma`)
- Test : `tools/level_test.py` (section PDG)

**Interfaces :**
- Produces : `AGP_LORE.sectors = { w1:{ end }, w2:{ end }, w3:{ end } }`. Quand une victoire porte sur le dernier niveau d'un monde (`L.type === 'boss'`), `#rpNorma` affiche `AGP_LORE.sectors[L.world].end` à la place de la réplique tirée au hasard.

Textes (bible §4, mot pour mot) :
- w1 : « Votre première mission est terminée. Nous avons enregistré 847 infractions à la sécurité. Toutes vous sont attribuées. »
- w2 : « Vous venez de détruire notre principal centre de recyclage. Le service environnement vous remercie. »
- w3 : « Une anomalie a été détectée dans les documents comptables. Je suis légalement tenue de ne pas vous en informer. »

Les autres révélations de la bible (logos AGP sur les satellites, convois vers Mars…) passent par ces transmissions pour l'instant ; leur mise en scène appartient à l'étape 5.

- [ ] **Step 1 : test** (section PDG, après la victoire) : `check('847 infractions' in document.getElementById('rpNorma').textContent, 'fin du secteur 1 : transmission de la bible')`.
- [ ] **Step 2 :** `python3 tools/level_test.py` → attendu : `ÉCHEC` sur cette vérification.
- [ ] **Step 3 :** ajouter `sectors` et le choix du texte dans `endRun` (victoire + niveau de type `boss`).
- [ ] **Step 4 :** `level_test.py` → OK ; `gen_codemap.py` puis `--check`.
- [ ] **Step 5 : commit** `feat(norma): transmission de fin de secteur`.
