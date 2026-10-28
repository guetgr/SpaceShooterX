# Éditeur de niveaux complet — plan de travail

> **Pour les agents :** sous-compétence requise : `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans`. Étapes à cocher (`- [ ]`).

**But :** que chaque mission (16, tuto compris) soit entièrement éditable depuis `editor.html` : décor, caméra, musique, objectif, mobs et leurs PV, événements et leurs paramètres, boss, réactions de N.O.R.M.A. par événement, avec les mêmes fiches « étape + champs modifiables » que celles du tuto aujourd'hui.

**Architecture :** le JSON par mission (`src/data/levels/<id>.json`, déjà en place) reste la seule source. On y ajoute des blocs de **surcharges** (`mobs`, `bossTune`, `events[].params`, `norma`, `audio`). Chaque constante de jeu aujourd'hui codée en dur (PV des mobs, constantes des boss, paramètres des événements) passe dans un **registre de données** à valeurs par défaut identiques, que le JSON surcharge. L'éditeur est généré à partir de ces registres (schéma avec min/max/pas), sans formulaire écrit à la main par boss.

**Stack :** Phaser 3, scripts classiques (`src/scripts.json`), Python 3 (`tools/serve.py`, `tools/level_files.py`), Node (tests), Playwright.

**Spec :** `docs/superpowers/specs/2026-10-28-level-builder.md` (vision complète, §9 bestiaire, §10 événements, §16–17 découpage) ; état actuel documenté dans `docs/editeur-niveaux.md`.

## Global Constraints

- **Aucune valeur de jeu ne change** : chaque extraction vers un registre est protégée par un test d'équivalence (instantané des valeurs avant/après, comme `tools/rd_equiv_snapshot.json`). CLAUDE.md : ne jamais modifier mécaniques, équilibrage ni logique pour de l'habillage.
- **Pas de plafond artificiel** ajouté (ennemis, balles, régén) ; les bornes de l'éditeur sont des garde-fous de saisie, pas des règles de jeu.
- Un JSON n'est jamais exécuté : donnée validée par `tools/level_files.py` (types d'ennemis, événements, clés de boss connus ; bornes numériques).
- `mixin` plante si une méthode est définie deux fois : Grep avant d'ajouter. Tout nouveau fichier JS va dans `src/scripts.json` à la bonne place.
- Titres d'interface en majuscules sans accents ; pas d'émojis pour les symboles de l'interface.
- Textes N.O.R.M.A. : froids, polis, sarcastiques (`docs/brief-univers-agp.md`). Moteur inchangé : une transmission à la fois, 14 s d'écart, jamais pendant intro, cartes, pause ou fin.
- Les sauvegardes joueur (`SAVE_KEYS`) ne changent pas ; l'aperçu et le bot restent en `?sandbox`.
- Après tout ajout/suppression de fichier ou de fonction : `python3 tools/gen_codemap.py`.
- **Avant chaque commit :** `python3 tools/smoke_test.py`, `home_test.py`, `level_test.py`, `perks_test.py`, `node tools/check_worlds.js`, `node tools/timeline_test.js`, `python3 tools/level_files_test.py`, `python3 tools/gen_codemap.py --check`.

## Review Focus

- Document JSON v1 existant (16 fichiers actuels) : doit se charger sans migration manuelle, valeurs identiques au jeu d'aujourd'hui.
- Surcharge partielle (ex. un seul champ de `bossTune`) : les autres constantes gardent leur défaut ; une clé inconnue est refusée avec un message clair, pas ignorée.
- Valeur hors bornes ou texte N.O.R.M.A. vide / trop long : refusés à la validation, jamais écrits ; l'export reste transactionnel.
- Événement dupliqué ou deux événements au même instant : un seul actif à la fois, l'autre attend (comportement actuel conservé).
- Tableaux de constantes par état d'usure des boss (`[1.3, 1.6, 1.9, 2.1]`) : longueur imposée, pas de trou.
- Éditeur ouvert pendant que le serveur de dev est ancien (`tools/serve.py` non redémarré) : message explicite, pas d'échec silencieux.

---

## Fichiers (carte)

| Fichier | Rôle |
|---|---|
| `src/data/enemy-stats.js` (créer) | `ENEMY_STATS[type]` : PV de base, dégâts de contact, vitesses, score, extraits de `spawnOneEnemy` |
| `src/data/tunables.js` (créer) | `TUNABLES` : registre des constantes réglables des boss et mobs spéciaux (`ar`, `mt`, `rx`, `an`, `pd`, `bras`, `pil`, `ec`), avec min/max/pas/libellé |
| `src/data/event-params.js` (créer) | `EVENT_PARAMS[kind]` : paramètres réglables de chaque événement (défauts = valeurs actuelles de `EVENT_DEFS`) |
| `src/data/level-norma.js` (créer) | résolution des textes N.O.R.M.A. d'un niveau (surcharge JSON sinon `AGP_LINES`) |
| `src/data/levels/*.json` | blocs ajoutés : `mobs`, `bossTune`, `events[].params`, `events[].norma`, `norma`, `audio`, `bg` étendu ; `schemaVersion: 2` |
| `tools/level_files.py` | validation des nouveaux blocs, migration v1 → v2 |
| `tools/editor/steps.js` (créer) | panneau « étapes » unifié (remplace `condition(...)` de `level-document.js`) |
| `tools/editor/schema-form.js` (créer) | rend un formulaire depuis un schéma (`champ, libellé, min, max, pas, unité, aide`) |
| `tools/editor/validator.js` (créer) | erreurs et avertissements côté éditeur |
| `tools/editor/test-lab.js` (créer) | campagne multi-graines, comparaison brouillon / publié |
| `src/game/level.js`, `src/enemies/spawning.js`, `src/events/*.js`, `src/bosses/*.js`, `src/enemies/{bras,pilleur,eclaireur}.js` | lecture des registres + surcharges de `lvDef` |

---

### Task 0 : Figer et valider l'existant (JSON + timeline)

**Files:** tout le lot non commité du builder (voir `git status`), `docs/editeur-niveaux.md`.
**Interfaces:** Produces : base propre `src/data/levels/*.json` (v1) + `level-data.js` généré.

- [ ] Confirmer avec Guet qu'aucune autre session ne modifie le builder en parallèle.
- [ ] Lancer la liste « Avant chaque commit » ; corriger toute régression due au chargement des JSON.
- [ ] Test à la main dans le navigateur : TESTER, bot (3 parties), glisser une vague, EXPORTER, recharger.
- [ ] Commit : `feat(editeur): missions en JSON et timeline des vagues`.

### Task 1 : Registre des mobs (PV, dégâts, vitesses) + surcharge par niveau

**Files:** Create `src/data/enemy-stats.js` ; Modify `src/enemies/spawning.js` (la chaîne `if (type === …)` de `spawnOneEnemy`), `src/scripts.json`, `tools/level_files.py` ; Test `tools/enemy_stats_test.js`.
**Interfaces:**
- Produces : `ENEMY_STATS: Record<type, { hp:number, dmg:number, speed:[min,max], score:number, … }>` ; `enemyStat(type, lvDef): object` (défaut fusionné avec `lvDef.mobs[type]`).
- JSON : `"mobs": { "grunt": { "hpMul": 1.5 } }` (multiplicateurs seulement : `hpMul`, `dmgMul`, `speedMul`, `scoreMul`).

- [ ] Test d'abord : `enemy_stats_test.js` charge `spawnOneEnemy` d'avant (instantané `tools/enemy_stats_snapshot.json` généré depuis la version actuelle) et vérifie que, sans surcharge, `hp/dmg/vitesse/score` de chacun des 25 types sont identiques.
- [ ] Extraire les constantes inline vers `ENEMY_STATS` ; `spawnOneEnemy` les lit via `enemyStat`. Le test passe.
- [ ] Appliquer `lvDef.mobs[type]` (multiplicateurs) ; test : `hpMul:2` double `e.maxHp`.
- [ ] Validation Python : type inconnu refusé, multiplicateur dans `[0.1, 10]`.
- [ ] Commit.

### Task 2 : Réglages internes des boss et mobs spéciaux

**Files:** Create `src/data/tunables.js` ; Modify `src/bosses/{araignee,meteo,reacteur,anneau,pdg}.js`, `src/enemies/{bras,pilleur,eclaireur}.js` (`AR`/`MT`/`RX`/`AN`/`PD`/`BRAS`/`PIL`/`EC` lus via `tune('ar')`), `tools/level_files.py` ; Test `tools/tunables_test.js`.
**Interfaces:**
- Produces : `TUNABLES[id] = { path, label, min, max, step, unit, help }[]` ; `tune(id): object` = constante d'origine fusionnée avec `lvDef.bossTune[id]` (copie, la constante d'origine n'est jamais mutée).
- Seules les valeurs numériques simples et les tableaux par état d'usure sont réglables ; les coordonnées de sprite (`bays`, `anchors`, `regions`) restent dans le code.

- [ ] Test d'équivalence : sans surcharge, `tune(id)` est profondément égal à la constante d'origine pour les 8 ids.
- [ ] Test : `bossTune.ar.hp = 2000` change les PV de l'Araignée sans toucher `AR`.
- [ ] Test : tableau de mauvaise longueur refusé.
- [ ] Migrer les modules un par un (un commit par boss) ; relancer `level_test.py` après chacun.
- [ ] L'Antenne-Mère (tuto) garde son bloc `tutorial.boss` existant ; son schéma `TUTO_SCHEMA` est repris dans `TUNABLES.antenne` pour un seul mécanisme.

### Task 3 : Paramètres des événements

**Files:** Create `src/data/event-params.js` ; Modify `src/data/events.js`, `src/events/types.js`, `src/events/forces.js`, `src/events/core.js` (`startEvent(kind, dur, params)`), `tools/level_files.py` ; Test `tools/event_params_test.js`.
**Interfaces:**
- Produces : `EVENT_PARAMS[kind] = [{ key, label, min, max, step, unit, def }]` (ex. `meteors` : `tickMs`, `speedMin`, `speedMax`, `count` ; `swarm` : `perWave` ; `mines` : `perTick`…) ; `evParam(scene, kind, key)` = surcharge de `events[i].params` sinon défaut (qui reprend la formule actuelle, y compris la dépendance au niveau d'alerte).
- JSON : `{ "kind":"meteors", "at":30, "duration":40, "params":{ "tickMs":500 } }`.

- [ ] Inventaire : lister pour chaque entrée d'`EVENT_DEFS` les littéraux (cadences, nombres, vitesses) ; les consigner dans `EVENT_PARAMS`. Test d'équivalence : défauts == valeurs actuelles pour alerte 1, 5 et 10.
- [ ] Brancher `evParam` dans chaque `tick/start`, un événement par commit.
- [ ] Les événements au-dessus d'un seuil d'alerte (`min`) restent bloqués : afficher l'avertissement dans l'éditeur.

### Task 4 : Réactions de N.O.R.M.A. par niveau et par événement

**Files:** Create `src/data/level-norma.js` ; Modify `src/ui/norma.js`, `src/events/core.js` (début/fin d'événement), `src/game/level.js` (début d'ordre, boss, avancement), `src/game/tuto.js` (lignes `AGP_LINES.tuto`), `tools/level_files.py` ; Test `tools/norma_level_test.js`.
**Interfaces:**
- **Décision de Guet (28 oct.)** : N.O.R.M.A. ne réagit qu'aux événements qui portent un texte ; on peut **ajouter à la main une boîte de dialogue N.O.R.M.A.** (bouton « AJOUTER UNE TRANSMISSION ») ancrée à un instant (`at`), au début ou à la fin d'un événement, à l'arrivée du boss ou à une phase de boss. Tout est donnée JSON, aucun code par niveau.
- JSON : `"norma": { "start":[…], "boss":[…], "progress":[…], "banter":[…], "lowhp":[…], "win":[…], "lose":[…], "tickEvery":[40,55], "messages":[{ "id":"m1", "when":"time|eventStart|eventEnd|bossStart|bossPhase", "at":12, "ref":"meteors", "text":"…" }] }` et `events[i].norma: { "start":"…", "end":"…" }`.
- Produces : `normaLines(lvDef, pool): string[]` (surcharge du niveau sinon `AGP_LINES[pool]`) ; `Norma.say` reste le seul émetteur (14 s, une à la fois).
- Pour le tuto : `norma.tuto.{move, shoot, boss, aim, ring, p2, p3, win, lose}` éditables.

- [ ] Test : sans surcharge, `normaLines` renvoie exactement `AGP_LINES[pool]` ; avec surcharge, la liste du niveau.
- [ ] Test : une transmission d'événement est mise en file derrière celle en cours (pas de chevauchement), et ignorée en intro, cartes, pause, fin.
- [ ] Validation : texte 1 à 140 caractères, pas de balise HTML (échappement côté interface).
- [ ] Éditeur : champs « à l'annonce » / « à la fin » sur chaque événement et sur chaque boss ; aperçu du texte dans la boîte N.O.R.M.A. de l'aperçu.

### Task 5 : Décor, caméra, musique

**Files:** Modify `tools/level_files.py`, `src/game/level.js`, `src/world/bg-monde.js` (liste `WORLD_BG_KINDS` exportée), `src/audio/music.js` (surcharge `lvDef.audio`) ; Test `tools/level_files_test.py`.
**Interfaces:**
- JSON : `"bg"` ∈ `WORLD_BG_KINDS` ∪ `null` (planète aléatoire) ; `"audio": { "level": ["w1_a","w1_b"], "boss": "w1b_x" }` ; `intro` ∈ `null|'earth'` ; `zoom` déjà présent.
- [ ] Exposer au catalogue de l'éditeur les décors (`horizon`, `debris`, `station`, `cristaux`, `patrouille`, `direction`, planètes) et les clés de musique existantes (`MUSIC_LEVEL`, `MUSIC_BOSS`).
- [ ] Test : un `bg` ou une clé de musique inconnus sont refusés ; l'aperçu applique le décor choisi sans redémarrer le jeu.

### Task 6 : Panneau « étapes » unifié pour tous les niveaux

**Files:** Create `tools/editor/steps.js`, `tools/editor/schema-form.js` ; Modify `tools/editor/level-document.js` (supprimer `condition(...)` et le bloc `if(level.tuto){…}`), `editor.html` (`TUTO_SCHEMA` → `TUNABLES`/`EVENT_PARAMS`) ; Test `tools/editor_steps_test.py` (Playwright).
**Interfaces:**
- Consumes : `TUNABLES`, `EVENT_PARAMS`, `ENEMY_STATS`, `normaLines`, le document du niveau.
- Produces : `renderSteps(parent, doc): void` qui génère, pour chaque niveau, la liste ordonnée INTRO / CAMERA · OBJECTIF · MOBS · EVENEMENTS (un par événement programmé) · COMBAT DU BOSS · ALEATOIRE · N.O.R.M.A. · RAPPORT, chaque ligne = description générée (comme le texte collé par Guet) **et** champs éditables dessous.
- [ ] Test Playwright : ouvrir `w1-tuto` et `w1-l2` ; chaque étape visible ; modifier un champ met à jour le JSON et la description ; EXPORTER écrit le champ.
- [ ] Les descriptions du tuto restent identiques mot pour mot aux textes actuels (test d'égalité de chaînes).

### Task 7 : Validateur

**Files:** Create `tools/editor/validator.js` ; Modify `tools/level_files.py` (mêmes règles côté serveur).
**Produces :** `validateLevel(doc): { errors:string[], warnings:string[] }`.
- [ ] Erreurs bloquantes : type/événement/boss inconnu, horaire négatif, valeur hors bornes, objectif impossible (ex. `kill` sans pool d'ennemis), musique ou décor inconnus.
- [ ] Avertissements : événement dont `min` d'alerte est supérieur à la menace du niveau, deux événements très proches, boss sans transmission N.O.R.M.A., PV effectifs d'un mob > 10× la base.
- [ ] Affichage en bandeau ; EXPORTER bloqué s'il y a une erreur.

### Task 8 : Laboratoire de test

**Files:** Create `tools/editor/test-lab.js` ; Modify `tools/sim/bot.js` (télémétrie : dégâts reçus par source, PV mini, durée) ; Test `tools/editor_lab_test.py`.
- [ ] 5 graines fixes avec un profil de joueur enregistré ; taux de victoire et durée.
- [ ] Comparaison brouillon vs publié (même graines) avec écart affiché ; rejeu d'une graine.
- [ ] Rapport « pourquoi le niveau échoue » : source de dégâts dominante.

### Task 9 : Publication, migration, documentation

**Files:** `tools/level_files.py`, `docs/editeur-niveaux.md`, `docs/carte-du-code.md`, `CLAUDE.md`, `PASSATION.md`.
- [ ] Migration v1 → v2 idempotente des 16 JSON ; diff d'export limité aux données du niveau.
- [ ] Documenter : ajouter un mob (une entrée `ENEMY_STATS`), un événement (`EVENT_DEFS` + `EVENT_PARAMS`), un réglage de boss (`TUNABLES`).
- [ ] `python3 tools/gen_codemap.py`, build `python3 tools/build.py --inline-phaser` vert.

---

## Ordre et dépendances

0 → 1 → 2 → 3 → 4 → 5 (indépendants entre eux après 0, mais 6 les consomme tous) → 6 → 7 → 8 → 9. Tasks 1 à 5 peuvent être livrées une par une : chacune est utile seule (le registre est éditable via le panneau JSON complet existant avant même la Task 6).

## Points à trancher par Guet avant de coder

1. ~~Task 0~~ : tranché — Claude finit le builder seul.
2. ~~Task 2~~ : tranché — uniquement des valeurs via le JSON, pas de refonte des modules, pour toute la suite.
3. ~~Task 4~~ : tranché par Guet — seulement les événements qui portent un texte, plus des transmissions ajoutées à la main.
