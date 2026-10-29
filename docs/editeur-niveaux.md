# Éditeur des missions — timeline et JSON

L’interface **AGP Studio** utilise désormais une bibliothèque, une timeline et un inspecteur. Voir le [guide du studio](editor-studio.md) pour le glisser-déposer, les formations, l’alerte par vague, les raccourcis et les sauvegardes de brouillon.

Lancer `python3 tools/serve.py 8080`, puis ouvrir `http://localhost:8080/editor.html`.

## Guide rapide (de haut en bas)

1. **Ouvrir** : `python3 tools/serve.py 8080` (Windows : `py tools/serve.py 8080`), puis `http://localhost:8080/editor.html`. Choisir une mission à gauche.
2. **Timeline** : vagues, pools, événements programmés (section « Lire la timeline »).
3. **ETAPES DU NIVEAU** : tous les réglages de la mission, une saisie par valeur, valeur orange = modifiée, ↺ = retour à l'origine (section « Étapes du niveau »).
4. **FICHIER JSON COMPLET** : lecture / édition du document entier (section « Édition JSON »).
5. **TESTER** (aperçu avec le document en mémoire) puis **EXPORTER** : valide les 16 documents, n'écrit que les fichiers dont le contenu change (UTF-8, indent 2, `\n`, saut de ligne final : un export sans modification ne produit aucun diff) et régénère `src/data/worlds/level-data.js`. `index.json` n'est jamais touché.

**Règle : nouvelle clé de niveau = registre + validateur + éditeur.** Une clé de mission n'existe que si son registre (borné) la décrit, si `tools/level_files.py` la valide (et `tools/editor/validator.js`, mêmes messages) et si l'éditeur sait l'afficher (`tools/editor/steps-model.js`).

### Clés du JSON d'une mission

| Clé | Rôle | Bornes (source) | Branchement dans le jeu |
|---|---|---|---|
| `schemaVersion` | version du format (1 ou 2, voir « Version du format ») | `level_files.SCHEMA_VERSIONS` | non lue par le jeu |
| `threat`, `hpMul`, `dmgMul`, `reward` | difficulté, récompenses | `level_files.py` (menace 1 à 20, multiplicateurs > 0) | `level.js`, `lvDef` |
| `bossAt` | date d'arrivée du boss (s), facultative : sans elle le boss arrive après les autres mobs de la timeline | `level_files.py` (1 à 3600) | `levelBossAt` (`src/data/boss-arrival.js`), `level.js` |
| `spawns`, `waves`, `events`, `spawnClock`, `timelineOnly` | pools, vagues garanties, événements programmés | `level_files.py` (`ENEMY`/`EVENT_DEFS` lus dans `bestiary.js`, `events.js`) | `level.js` |
| `mobs.<type>` | multiplicateurs `hpMul`/`dmgMul`/`speedMul`/`scoreMul` | 0,1 à 10 ; types lus dans `src/data/enemy-stats.js` | `ENEMY_STATS` + `spawnOneEnemy` |
| `bossTune.<id>.<chemin>` | nombres internes des boss et mobs spéciaux | `src/data/tunables.js` | `tunablesApply(lvDef)` |
| `eventTune.<nature>`, `events[i].params` | paramètres d'événement (niveau entier / une occurrence) | `src/data/event-params.js` | `evParam(sc, kind, key)` |
| `norma` (`start`, `boss`, `progress`, `banter`, `lowhp`, `win`, `lose`, `tickEvery`, `tuto`, `messages`), `events[i].norma` | transmissions N.O.R.M.A. de la mission | 1 à 20 textes de 1 à 140 caractères, 50 boîtes ; `level_files.py` | `src/data/level-norma.js`, `src/ui/norma.js` |
| `bg`, `intro`, `zoom` | décor, décollage, caméra | `WORLD_BG_KINDS` (`bg-monde.js`) ; zoom 0,3 à 3, durée 5 à 600 s | `wbgBuild_<nom>`, `GameScene.create` |
| `audio.level`, `audio.boss` | musiques de l'ordre / du boss final | clés de `MUSIC_LEVEL` / `MUSIC_BOSS` (`src/audio/music.js`) | `musicLevelKeys` / `musicBossKeys` |
| `ambient`, `finalBoss`, `boss`, `bossName` | aléas activés, boss | `level_files.py` | `level.js`, `bosses/*.js` |
| `tutorial.*` (tuto seulement) | réglages pédagogiques | `TUTO_SCHEMA` (`steps-model.js`) | `src/tuto/*` |

Pour chaque clé facultative, un document qui ne l'utilise pas n'en porte aucune trace (rien n'est ajouté par défaut).

## Un fichier par mission

Les **16 missions, tutoriel compris**, ont leur source dans `src/data/levels/<id>.json`. `index.json` fixe leur ordre. Le jeu en développement charge ces JSON au démarrage. Les fichiers des secteurs ne contiennent plus les paramètres des missions.

Chaque document contient l’identité, le boss (le but de tout ordre est de le vaincre), les récompenses, le décor, l’introduction, le zoom, la menace, les multiplicateurs, les pools de mobs, les vagues, les événements programmés, les événements aléatoires activés et les références de boss. `w1-tuto.json` contient aussi tous les paramètres pédagogiques auparavant dans `TUTO_DEFAULTS` : déplacement, satellites, débris, boss, finition et récompenses.

Les comportements communs (IA, attaques des boss, effets des événements, musique et textes N.O.R.M.A.) restent dans leurs modules partagés. Les JSON définissent leurs paramètres de mission et leurs références ; ils ne recopient pas le moteur de combat. Les constantes globales du tutoriel dans `tuning-defaults.js` servent encore de secours aux anciens outils, mais les valeurs utilisées par le jeu et l’éditeur viennent du JSON.

`src/data/worlds/level-data.js` est un **cache généré**, jamais une source à éditer. `python3 tools/level_files.py` le régénère. Le serveur au démarrage, l’export et le build le régénèrent automatiquement. Ce cache permet aux outils Node et au build HTML autonome de conserver leur chargement synchrone.

## Lire la timeline

- **Vagues** : apparitions garanties à une heure définie, avec quantité et intervalle.
- **Pools** : bandes indiquant quels mobs sont éligibles au tirage aléatoire, satellites compris. Leur poids représente une fréquence relative, pas une quantité garantie.
- **Événements** : heure minimale de déclenchement ; un emplacement occupé ou un boss peut les retarder. La durée peut être forcée ou laissée au défaut de l’événement.
- **Boss** : bloc à sa date d’arrivée (après les autres mobs de la timeline, ou `bossAt` fixé en le glissant). Il n’y a plus d’objectif de temps, d’éliminations ou de cristaux : tout ordre se gagne en battant son boss.

Les étapes conditionnelles (tutoriel, boss, aléas, N.O.R.M.A.) ne sont plus des lignes de la timeline : elles sont dans le panneau **ETAPES DU NIVEAU** (ci-dessous).

Les déclenchements dépendant du joueur n’ont volontairement pas de fausse heure précise. Le **journal de la partie** affiche les apparitions et transitions réellement observées pendant TESTER (500 entrées récentes, réinitialisées à chaque lancement). Ce journal n’est pas un enregistrement exhaustif de chaque projectile ou son.

## Modifier et tester

1. Choisir une mission à gauche, y compris le tutoriel.
2. Choisir une miniature dans le bestiaire, régler arrivée/quantité/intervalle, cliquer **AJOUTER** ou cliquer dans sa piste.
3. Glisser le bloc pour déplacer la vague. Les champs permettent un réglage précis, une duplication ou une suppression.
4. Modifier les pools (activation, poids, tier), ajouter ou supprimer un événement programmé sous la timeline ; tous les autres réglages sont dans les étapes. **Remplacer les apparitions aléatoires** coupe le pool de mobs ; dans le tutoriel, cette option coupe les satellites pédagogiques automatiques. Les événements et renforts des boss restent indépendants.
5. **TESTER** redémarre la mission avec le document en mémoire. Le bot reçoit les mêmes modifications.
6. **EXPORTER** valide et enregistre les 16 documents JSON. Aucun export ne se fait implicitement pendant un test.

Une vague SATELLITE dans le tutoriel utilise le vrai satellite pédagogique (`tutoSpawnSat`) : ses PV, ses débris et sa destruction comptent pour l’objectif du tutoriel. Les autres mobs ajoutés sont des ennemis standards ; ils ne remplacent pas le compteur de satellites.

Les secondes des vagues et événements sont mesurées après l’introduction. Les anciens pools des secteurs 2 et 3 conservent leur horloge historique `difficulty` (temps de partie + 12 × (menace − 1)), indiquée dans l’éditeur. Changer `spawnClock` en `mission` permet de travailler uniquement en temps de mission.

## Étapes du niveau

Sous la timeline, le panneau **ETAPES DU NIVEAU** décrit chaque mission étape par étape et porte **tous** ses réglages (une seule saisie par valeur). Chaque étape montre une description recalculée à chaque modification ; la déplier affiche ses champs. Une valeur orange est modifiée ; cliquer sur ↺ revient à l'origine (le document JSON d'origine). Une valeur invalide est refusée avec un message en rouge sous le champ et n'est jamais écrite.

- Missions : `INTRO / CAMERA` (introduction, zoom, décor, musique `audio`) · `MISSION` (boss et date d’arrivée, menace, multiplicateurs) · `MOBS` (`mobs.<type>` pour chaque type des pools et vagues) · `EVENEMENT · <nom>` (une par événement programmé : `events[i].at`, `duration`, `params.*`, `norma.start/end`) · `EVENEMENTS ALEATOIRES` (`ambient`, `eventTune.<nature>`) · `COMBAT DU BOSS` (`bossTune.<id>`) · `N.O.R.M.A.` (réserves, `tickEvery`, boîtes) · `RAPPORT` (`reward`).
- Tutoriel : `INTRO / CAMERA`, `ETAPE 1 · BOUGER`, `ETAPE 2 · SATELLITE`, `DESTRUCTION SATELLITE`, `ALERTE / ANTENNE-MERE`, `BOSS · PHASE 1/2/3` (réglages `tutorial.*`, visibles en direct dans l'aperçu), événements, aléas, `N.O.R.M.A.` (consignes `norma.tuto.*` seulement : le tutoriel ne lit ni les réserves, ni les boîtes, ni `audio`, ni `eventTune`), `RAPPORT` (finition, paliers, récompenses ; avertissement si les poids ne font pas 100).
- **Boîtes N.O.R.M.A.** : **AJOUTER UNE TRANSMISSION** crée une boîte `m1`, `m2`… ; choisir *Quand* (début de mission, à une date, début/fin d'un événement, arrivée du boss, victoire, défaite), la date (à une date) ou l'événement (début/fin), puis le texte. Rien n'est enregistré tant qu'une boîte est incomplète (texte vide, identifiant en double).
- **Chemins → JSON** : chaque champ a un chemin dans le document (`['bossTune','ar','dmg.missile']` = `"bossTune": { "ar": { "dmg.missile": … } }`, clé pointée non découpée). Un champ facultatif remis à sa valeur d'origine disparaît du JSON, avec les objets devenus vides. En mémoire, la clé de premier niveau modifiée est recopiée en entier dans les surcharges de l'éditeur ; `mobs`, `bossTune`, `eventTune`, `norma` et `audio` sont remplacés en entier (une sous-clé effacée disparaît vraiment), et le tutoriel garde ses réglages `tutorial.*` dans la surcharge `tuto`. TESTER et le bot reçoivent ces surcharges (`applyTuning`, `src/data/tuning-apply.js`) ; EXPORTER écrit le document complet. Détail du trajet en tête de `tools/editor/steps-ui.js`.
- Code : modèle sans DOM `tools/editor/steps-model.js` (`EditorSteps.buildSteps`, `applyFieldValue`, `TUTO_SCHEMA`), rendu `tools/editor/steps-ui.js` (`renderSteps`). Tests sans navigateur : `node tools/editor_steps_test.js`, `node tools/editor_steps_ui_test.js` (faux DOM).

## Édition JSON

Le panneau **FICHIER JSON COMPLET** permet de lire, copier, modifier et télécharger le document de la mission. **ACTUALISER DEPUIS LA TIMELINE** recharge les dernières modifications visuelles dans le champ. **VALIDER ET APPLIQUER** vérifie le document auprès du serveur puis l’applique en mémoire. **EXPORTER** écrit les fichiers.

Les identifiants, le secteur et le type de mission restent fixes dans cette version. Le serveur rejette les types d’ennemis ou d’événements inconnus, les horaires invalides et les structures incohérentes avant toute écriture. Les boss et météorites utilisent leurs moteurs spécifiques et sont visibles comme événements ou références, pas comme mobs standards.

Une vague après la victoire ne prolonge pas la mission. Le boss arrive à sa date (`bossAt` ou, par défaut, après la dernière vague et le dernier événement). Un événement peut attendre la libération de son emplacement.

## PV et stats des mobs

Les valeurs de base des mobs (PV, dégâts de contact, vitesse verticale de départ, score) sont dans `src/data/enemy-stats.js` (`ENEMY_STATS`). Une mission peut les multiplier avec la clé optionnelle `mobs` de son JSON :

```json
"mobs": { "grunt": { "hpMul": 1.5, "speedMul": 0.8 } }
```

Champs permis : `hpMul` (PV et bouclier de départ), `dmgMul` (dégâts de contact), `speedMul` (vitesse verticale de départ), `scoreMul` (score). Chaque multiplicateur est un nombre de 0,1 à 10 ; un champ absent vaut 1, et une mission sans `mobs` se comporte exactement comme avant. Un type de mob inconnu ou une valeur hors bornes est refusé par la validation. Le multiplicateur s'ajoute à l'échelle de difficulté, il ne la remplace pas. Les minuteurs, positions d'arrêt et cadences de tir ne sont pas concernés.

## Validation

Un bandeau en haut du niveau liste les **erreurs** (rouge) et les **avertissements** (ambre), recalculés à chaque modification (`tools/editor/validator.js`, `validateLevel(doc, catalogs)`). Une erreur = le serveur refuserait le fichier (`tools/level_files.py`, mêmes messages) : **EXPORTER est refusé** tant qu'un niveau en a (le toast cite la première erreur de chaque niveau fautif, 3 au plus). Un avertissement ne bloque jamais ; « Info : » = simple remarque. Le validateur juge la cohérence, pas la difficulté.

Erreurs : identité/difficulté (menace 1 à 20, multiplicateurs > 0) ; `bossAt` entre 1 et 3600 s ; boss manquant (ni `finalBoss` ni `boss`) ; mobs inconnus ou hors 0,1–10 ; `bossTune` (boss/réglage inconnu, bornes, longueur, **ordre** des paliers : `ordered:'desc'|'asc'` dans `src/data/tunables.js`, posé sur `thresh` / `states` / `mob.states`) ; paramètres d'événement (inconnus, hors bornes, entiers, **mini ≤ maxi** pour chaque paire `xxxMin`/`xxxMax` donnée ensemble, dans `events[i].params` et `eventTune`) ; **`duration` avec `params.dur/durMin/durMax`** (ambigu) ; événements, pools, vagues invalides ; boîtes N.O.R.M.A. (clés inconnues, id en double, `hold`, texte, `ref`) ; décor, musique, boss inconnus ; zoom ; **objectif impossible** (`kill`/`collect` sans réserve ni vague ; les réserves comptent pour rien si `timelineOnly` vaut 1).

Avertissements : événement dont `min` dépasse la menace du niveau (en ordre, l'alerte vaut la menace et ne monte pas ; un événement programmé démarre quand même) ; deux GRANDS événements à moins de 5 s, ou le second programmé avant la fin du premier (`duration` connue) : un seul grand à la fois, les petits ont leur propre emplacement (`level.js`, `curEvent` / `curSmall`) ; événement ou boîte `time` après la fin d'un objectif `survive` ; boss sans texte N.O.R.M.A. de début de boss ; `hpMul`/`dmgMul` ≥ 5 ou ≤ 0,2 (niveau ou mob) et PV effectifs d'un mob > 10 fois la base ; `eventTune` d'un petit événement ni programmé ni tirable au hasard ; `audio.boss` sans `finalBoss` (ignoré).

Les cas invalides communs au client et au serveur sont écrits une fois dans `tools/fixtures/invalid_levels.json` (`set` = clés de premier niveau remplacées, `expect` = extrait du message) ; ils servent à `node tools/editor_validator_test.js` et `python3 tools/level_files_test.py`. `bras.cooldown` n'est pas ordonné (valeurs d'origine croissantes 0, 1500, 1900, 2100 selon le tier, sans règle de jeu).

## Vérifications

- `node tools/check_worlds.js` : structure et progression des secteurs.
- `node tools/timeline_test.js` : horaires, quantité, réinitialisation et saturation des vagues.
- `python3 tools/level_files_test.py` : validation et export JSON dans un dossier temporaire.
- `node tools/editor_validator_test.js` : 16 niveaux sans erreur, une règle d'erreur et d'avertissement par cas (`--warnings` les affiche).
- `node tools/editor_steps_test.js` et `node tools/editor_steps_ui_test.js` : étapes de l'éditeur (modèle, rendu sur faux DOM, surcharges, `applyTuning`).
- `python3 tools/enemy_stats_test.py` : stats des 27 types identiques à `tools/enemy_stats_snapshot.json` (`--write` pour le régénérer, seulement si un changement de valeurs est voulu) et surcharge `mobs`.
- `python3 tools/level_files.py` : génération du cache depuis les JSON ; `--migrate` : documents en v2.
- `node tools/norma_level_test.js`, `node tools/event_params_node_test.js`, `node tools/level_look_test.js` : N.O.R.M.A., paramètres d'événement, décor/musique (sans navigateur).
- `python3 tools/build.py --inline-phaser` : build autonome incluant les niveaux.

**Protections du serveur** : les POST sous `/__editor/` exigent `Content-Type: application/json` (415), un en-tête `Host` local `localhost` / `127.0.0.1` avec le port d'écoute (421, contre le DNS rebinding) et, si `Origin` est présent, la même origine locale (403) ; une page tierce ne peut donc pas écrire les niveaux. L'ancien point d'entrée `/__editor/save` (écriture de `tuning.js`) a été supprimé. Un nom de niveau fait 1 à 40 caractères, sans `<` ni `>`.

Après une modification de `tools/serve.py`, redémarrer le serveur. Les sauvegardes de progression des joueurs sont isolées dans l’aperçu et le bot.

## Réglages des boss
Clé optionnelle `bossTune` dans le JSON d'une mission : `"bossTune": { "ar": { "hp": 2000, "dmg.missile": 20, "gap": [300, 250, 200, 100] } }`.
- Ids : `ar` (Araignée), `mt` (Météo), `rx` (Réacteur), `an` (Anneau), `pd` (PDG), `bras`, `pil` (Pilleur), `ec` (Éclaireur). Chemins pointés dans la constante du module (`hp`, `count.beam`, `dmg.contact`…) ; un tableau se donne en entier, de la même longueur.
- Registre : `src/data/tunables.js` (`TUNABLES`, libellé, bornes, pas, unité, aide). `tools/level_files.py` refuse id ou chemin inconnu, valeur hors bornes, tableau de mauvaise longueur.
- Seuls les nombres sont réglables. Coordonnées, régions, géométrie de sprite et séquences d'attaques restent dans le code.
- `tunablesApply(lvDef)` (début de `GameScene.create`) remet d'abord les valeurs d'origine puis applique `bossTune` : rien ne fuit d'une partie à l'autre.
- Antenne-Mère (tuto) : `TUNABLES.antenne` n'est qu'un schéma ; ses valeurs restent dans `tutorial.boss` (refus de `bossTune.antenne`).
- Ajouter un réglage : une ligne dans `tunables.js` (format décrit en tête de fichier, valeur d'origine dans les bornes), puis `python3 tools/tunables_test.py`.

## Paramètres des événements
Registre : `src/data/event-params.js` (`EVENT_PARAMS[kind]` = `{ key, label, min, max, step, unit, [int], def }` ; `def` = valeur d'origine, nombre ou `(alerte)=>…` pour reproduire la dépendance au niveau d'alerte). Couvre durée (`dur`, ou `durMin`/`durMax` en secondes), cadence (`tickMs`), nombres par vague ou par tic, vitesses, dégâts, rayons. Ne couvre pas coordonnées, tweens, décor, poids de tirage, seuil d'alerte.
- Événement programmé : `{ "kind":"meteors", "at":30, "duration":40, "params":{ "tickMs":500 } }`. Niveau entier (tirages aléatoires compris) : `"eventTune": { "meteors": { "tickMs":500 } }`.
- Priorité (`evParam(sc, kind, key)`) : `params` de l'événement programmé en cours > `eventTune` > valeur d'origine (calculée avec l'alerte courante). `duration` reste prioritaire sur `dur` / `durMin` / `durMax`. Un événement lancé sans `params` après un autre n'hérite de rien.
- `tools/level_files.py` refuse événement ou clé inconnus, valeur hors bornes ou non entière quand `int:true`. L'éditeur reçoit le schéma dans `eventCatalog[i].params` (valeur par défaut à l'alerte 1, `defByAlert` si elle varie).
- Ajouter un paramètre : une ligne dans `event-params.js`, remplacer le littéral par `evParam(sc, 'kind', 'key')` (lire la valeur au démarrage si elle sert à du code différé), ajouter la formule d'origine dans `EXPECTED` de `tools/event_params_node_test.js`.
- Tests sans navigateur : `node tools/event_params_node_test.js` (durées/cadences et défauts == code d'origine, usage, priorité). `tools/event_params_test.py` (navigateur, instantané des effets observés) existe mais n'est plus lancé systématiquement.

## Réactions de N.O.R.M.A.
Bloc `norma` optionnel dans le JSON d'une mission (code : `src/data/level-norma.js`, `src/ui/norma.js`). Rien n'est codé par niveau. N.O.R.M.A. ne réagit que là où un texte existe ; sans bloc `norma`, rien ne change (réserves de `agp-lore.js`).

```json
"norma": {
  "start": ["…"], "boss": ["…"], "progress": ["25 %", "50 %", "75 %"], "banter": ["…"], "lowhp": ["…"], "win": ["…"], "lose": ["…"],
  "tickEvery": [40, 55],
  "tuto": { "move": "…", "shoot": "…" },
  "messages": [{ "id": "m1", "when": "time", "at": 12, "text": "…" }]
}
```
- **Réserves** (`start`, `boss`, `progress`, `banter`, `lowhp`, `win`, `lose`) : 1 à 20 textes ; remplacent celles d'origine pour cette mission. `progress` : une ligne par palier (25, 50, 75 %). `tickEvery` : intervalle en secondes `[min, max]` (5 à 300, défaut 40 à 55) entre avancement et vannes.
- **`tuto`** : uniquement dans `w1-tuto`, clés `move, shoot, boss, aim, ring, p2, p3, win, lose` ; une clé absente garde le texte de `AGP_LINES.tuto`. Les boîtes `messages` ne sont pas jouées dans le tutoriel.
- **`messages`** : boîtes ajoutées à la main (50 au plus). `id` unique ; `when` : `levelStart` (2,2 s après le décollage), `time` (`at` = secondes de mission après l'intro, 0 à 3600), `eventStart` / `eventEnd` (`ref` = nature de l'événement, ex. `meteors`), `bossStart` (arrivée du boss de fin), `win` / `lose` (remplace le commentaire du rapport de fin ; pas en cas d'abandon). `hold` n'est pas supporté sur les boîtes (refusé) : elles s'effacent seules, utilisez un texte court. Chaque boîte part une seule fois par partie. Une boîte `eventStart` / `eventEnd` vaut pour n'importe quelle occurrence de cette nature (programmée ou aléatoire) : elle part à la première rencontrée, et une boîte `eventEnd` est indépendante d'une boîte `eventStart` (elle part à la première fin de cette nature, même sans boîte de début). Pour une réaction liée à une occurrence précise d'un événement programmé, utiliser `events[i].norma`. Les boîtes horaires passent devant les vannes mais attendent la fin de la précédente. Pas de phase de boss pour l'instant.
- **Par événement programmé** : `events[i].norma = { "start": "…", "end": "…" }`, propre à cette occurrence (prioritaire sur les boîtes `eventStart` / `eventEnd` de même nature).
- **Limites** : chaque texte 1 à 140 caractères, sans `<` ni `>`, non vide. Jamais pendant l'intro, les cartes d'amélioration, la pause ou l'écran de fin (garde de `normaTick`) ; une transmission à la fois.
- **Ton** : froide, polie, sarcastique, jamais bloquante ; courte, lisible d'un coup d'œil en plein combat (voir `docs/brief-univers-agp.md`).
- Test sans navigateur : `node tools/norma_level_test.js`.

## Décor, caméra et musique
Réglés par le JSON de la mission, sans code par niveau. Sans ces clés (ou avec `bg: null`), le jeu se comporte comme avant.
- **`bg`** : `null` (planètes tirées au hasard, `pickBgZone`) ou un décor de la liste `WORLD_BG_KINDS` (`src/world/bg-monde.js`) : `horizon`, `debris`, `station`, `cristaux`, `patrouille`, `direction`. La validation (`tools/level_files.py`) lit cette ligne `const WORLD_BG_KINDS = [...]` ; `node tools/level_look_test.js` vérifie qu'elle égale les méthodes `wbgBuild_*` : ajouter un décor = écrire la méthode ET l'ajouter à la liste.
- **`intro`** : `null` ou `"earth"` (décollage depuis la Terre, planète du fond dévoilée après).
- **`zoom`** : `{ start, end, seconds }` ; `start` et `end` entre 0,3 et 3, `seconds` entre 5 et 600.
- **`audio`** (optionnel) : `{ "level": ["w1_l1_a", "w1_l1_b"], "boss": "w1b_pdg_a" }`. `level` : 1 ou 2 clés parmi celles de `MUSIC_LEVEL` (`src/audio/music.js`), remplace les morceaux de l'ordre ; `boss` : une clé parmi celles de `MUSIC_BOSS`, remplace le morceau du boss de fin d'ordre (`finalBoss`). Chaque champ est facultatif ; un autre boss ou un boss de passage garde sa musique. Les tables sont lues par le validateur dans `music.js` (`const MUSIC_LEVEL = {…};` et `const MUSIC_BOSS = {…};`). Code : `musicLevelKeys` / `musicBossKeys` (`music.js`), `lvAudio` posé par `scene-audio.js` ; sans `audio`, elles rendent l'entrée d'origine de la table.
- **Éditeur** : le message `ready` du jeu apporte `decorCatalog` (`[{ kind, label }]`) et `musicCatalog` (`{ level: [clés], boss: [clés] }`) (`src/dev/editor-hook.js`).
- Test : `node tools/level_look_test.js` ; cas refusés dans `tools/level_files_test.py`.

## Version du format
Chaque document porte `schemaVersion`. Le validateur accepte **1 et 2** et refuse toute autre valeur (le type compte : `true` ou `"2"` sont refusés) ; la version doit rester celle du document d'origine, l'éditeur ne la change pas. La v2 a la même forme que la v1 : elle autorise en plus les blocs facultatifs `mobs`, `bossTune`, `eventTune`, `norma`, `audio` et `events[i].params` / `events[i].norma`. Le jeu ne lit pas `schemaVersion`. Les 16 documents sont en v2. `python3 tools/level_files.py --migrate` réécrit en v2 ce qui serait encore en v1 (idempotent : un second passage ne change rien) et régénère le cache.

## Recettes
Les lecteurs Python (`tools/level_files.py`) parlent aux fichiers JS par des expressions régulières : respecter exactement les formats ci-dessous, sinon la validation s'arrête avec un message qui nomme le fichier et le format attendu.

### Ajouter un mob
1. `src/data/enemy-stats.js` : une entrée par ligne, **deux espaces puis `nom: {`** : `  monnom:        { hp:12, dmg:8, score:8, vy:55 },`.
2. `src/data/bestiary.js` : une entrée `{ type:'monnom', label:'…', tex:'…', frame:0 }` (le type est lu par `type:'…'` ; les types commençant par `boss` et `meteor` sont exclus des pools).
3. Le comportement et l'apparition restent dans `src/enemies/spawning.js` / `ai.js` (hors de l'éditeur). Ensuite le mob se place en `spawns` / `waves` et se règle par `mobs.monnom`.
4. `python3 tools/enemy_stats_test.py --write` seulement si l'instantané doit changer (navigateur : à lancer par Guet), `node tools/editor_steps_test.js`.

### Ajouter un événement
1. `src/data/events.js` : une entrée dans `EVENT_DEFS`, **deux espaces puis `nom:`** en début de ligne (lues par `^  (\w+):`).
2. `src/data/event-params.js` : un bloc `  nom: [` puis une ligne par paramètre, quatre espaces : `    { key:'tickMs', label:'Cadence', min:50, max:5000, step:10, unit:'ms', [int:true,] def:500 },` (le validateur lit `key`, `min`, `max` et ` int:true,`). Remplacer le littéral du code par `evParam(sc, 'nom', 'tickMs')`.
3. Ajouter la formule d'origine dans `EXPECTED` de `tools/event_params_node_test.js` ; lancer `node tools/event_params_node_test.js`. Un texte N.O.R.M.A. se rattache par `events[i].norma` ou une boîte `eventStart`/`eventEnd` avec `ref`.

### Ajouter un réglage de boss
`src/data/tunables.js` : dans le bloc `  id: [` du boss, une ligne à **quatre espaces** : `    { path:'dmg.missile', [len:4,] [ordered:'desc',] label:'…', min:0, max:60, step:1, unit:'…', help:'…' },`. `path` pointe un nombre existant de la constante du module (`AR`, `MT`…), la valeur d'origine doit être dans les bornes ; `len` pour un tableau, `ordered` pour des paliers. Un nouveau boss : nouveau bloc `  id: [` et module branché sur `tunablesApply`. Test : `python3 tools/tunables_test.py` (navigateur).

### Ajouter un décor
`src/world/bg-monde.js` : écrire la méthode `wbgBuild_<nom>`, puis ajouter `'nom'` à la ligne `const WORLD_BG_KINDS = ['horizon', …];` (une seule ligne, apostrophes). `node tools/level_look_test.js` vérifie que la liste égale les méthodes. Le décor apparaît dans l'éditeur via `decorCatalog`.

### Ajouter une musique
`src/audio/music.js` : ajouter les clés dans `const MUSIC_LEVEL = { 'w1-l1':['w1_l1_a','w1_l1_b'], … };` (1 ou 2 clés par ordre) ou `const MUSIC_BOSS = { … };` (clé ou paire par boss), clés entre apostrophes, fin de table `};` ; ajouter la durée dans `MUSIC_LEN` et le fichier dans les assets (`gen_manifest.py`). Le validateur ne vérifie que les tables, pas l'existence du fichier audio.

## À vérifier à la main
Navigateur, `http://localhost:8080/editor.html` (rien de cela n'est couvert par les tests automatiques sans navigateur) :
1. Ouvrir w1-tuto : la page s'affiche (timeline, ETAPES DU NIVEAU, JSON), aucune ligne rouge « affichage impossible ».
2. Déplier ETAPE 2 · SATELLITE, changer « Points de vie » : le chiffre passe en orange, la description change, l'aperçu tuto suit en direct ; cliquer ↺ : retour à l'origine.
3. RAPPORT du tuto : modifier un poids de finition → l'avertissement « Total des poids » apparaît ; remettre → il disparaît.
4. w1-l2 : COMBAT DU BOSS → changer les PV de l'Araignée, TESTER : le boss a les nouveaux PV ; lancer le bot : pas d'erreur.
5. w1-l2 : EVENEMENT · … → durée 20, un paramètre ; la ligne de la timeline et la description suivent.
6. N.O.R.M.A. (w1-l1) : AJOUTER UNE TRANSMISSION, message rouge tant que le texte est vide ; écrire un texte, choisir « À une date » puis 5 s, TESTER : la boîte part vers 5 s.
7. Saisir une valeur hors bornes (Menace 50) : message rouge, rien d'orange, EXPORTER n'est pas marqué modifié pour ça.
8. Plier/déplier des étapes puis modifier un champ : les étapes restent dans le même état, le curseur reste dans le champ.
9. Ajouter une vague d'un nouveau type dans la timeline : l'étape MOBS gagne ce type (reconstruction), étapes dépliées conservées.
10. EXPORTER puis recharger : les valeurs sont dans `src/data/levels/*.json` (vérifier `git diff` : seuls les fichiers modifiés changent), puis annuler si c'était un essai.
11. Aspect : lisibilité des descriptions dans les en-têtes, largeur des listes (musique, boîtes) sur un écran < 1000 px.

## Laboratoire de test (parties jouées avec équipement choisi)

Design : `docs/superpowers/specs/2026-10-29-laboratoire-de-test-design.md`. Avec le serveur local, l'accueil du jeu affiche un bouton **LABORATOIRE** (en haut à gauche) qui ouvre `/?lab` (sauvegarde en mémoire, jamais la vraie). On y choisit l'ordre, la version du niveau (publiée ou de l'historique de l'éditeur), l'atelier (Mk) et les technologies ; l'écran affiche le budget de composants (calculé à partir des données, ou moyenne des parties test réelles, abandons exclus) et le coût de l'équipement. Chaque partie est enregistrée dans `.editor-history/lab-runs.jsonl` (`/__lab/runs`) et lisible dans l'éditeur : bouton **Parties de test** (tableau triable, moyennes). Code : `src/dev/lab.js` (jeu), `tools/editor/lab-runs.js` (éditeur), routes dans `tools/serve.py`.

**Vision de l'outil (29 oct. 2026, Guet)** : le laboratoire est l'établi pour affiner les niveaux au fur et à mesure que la donnée arrive. Toute la micro-gestion de l'équipement s'y fait comme dans le jeu, une étape à la fois, avec le coût CUMULÉ affiché : chaque poste de l'atelier (Mk I, II, III…, pièces de secteur comprises) et chaque technologie (prototype, rang 1, 2, 3…, spécialisation). Le budget de composants d'un ordre vient d'abord du calcul à partir des données du niveau, puis de la moyenne des parties test réelles dès qu'elles existent ; chaque partie garde son équipement, son coût et son budget, de sorte que le tableau de l'éditeur montre quel équipement, à quel coût, passe ou échoue sur un niveau donné.

**Laboratoire intégré à l'éditeur (zone de test principale)** : à droite de la zone de travail (Composition, Réglages, JSON), un cadre charge le laboratoire du jeu (`index.html?lab&embed`). Boucle voulue : **je modifie, je teste, je modifie, je teste**. « ▶ Tester le brouillon » (ou « Tester la mission » en haut) lance la mission avec le **brouillon** courant (non enregistré) et le dernier équipement ; « REFAIRE L'INTERVENTION » relit d'abord le brouillon, donc chaque essai voit la dernière modification. Le niveau suit la mission choisie ; la liste des versions est celle de l'historique de l'éditeur (publiée, versions, brouillon par défaut) et se relit après un enregistrement. Sous le cadre, le tableau des parties de la mission se recharge à chaque fin de partie (plus récent en haut, colonne Version avec l'empreinte du brouillon joué, moyennes en pied, survol = équipement) ; **CSV mission / CSV tout** exportent les parties (Excel, séparateur « ; »). « Masquer le labo » libère la largeur. Code : `tools/editor/lab-tab.js` (messages `lab-select`, `lab-draft`, `lab-launch`, `lab-ready`, `lab-need-draft`, `lab-run`), `tools/editor/lab-runs.js` (tableaux, CSV) et `src/dev/lab.js` (`EMBED`).

**Écran du laboratoire : mobile d'abord** (`src/dev/lab.js`, CSS en une colonne, élargi à partir de 640 px) : sections repliables MISSION / BUDGET / ATELIER / TECHNOLOGIES avec un résumé (coût, nombre de postes ou de technologies) visible replié, boutons et listes d'au moins 44 px, un seul gros bouton jaune par fiche, barre fixe en bas (coût, jauge, LANCER). Même écran dans le cadre étroit de l'éditeur et sur téléphone (`?lab`).

**Disposition de l'éditeur et boss (29 oct. 2026)** : plus de colonnes latérales. `tools/editor/layout.js` (chargé avant `app.js`) déplace les nœuds existants : le choix de mission est dans l'en-tête de la zone de travail ; une **bande compacte** (créatures en liste, inspecteur, simulation du robot) remplace l'ancien aperçu de formation (masqué mais gardé dans la page : la timeline y écrit encore) ; sous la bande, la **timeline fait 80 % de la largeur** et le **laboratoire 20 %** (cadre pleine hauteur, tableau des parties dessous, CSV). « Masquer le labo » rend toute la largeur ; sous 1 250 px tout passe en colonne. La timeline a une **piste « Boss » toujours visible** : un bloc à la date de fin de mission (fin du temps en survie) ; un clic l'ouvre dans l'inspecteur, où l'on choisit le **boss final** (Météo, Araignée, Réacteur, Anneau, PDG ou aucun) et où l'on règle son combat (l'étape « COMBAT DU BOSS » des réglages, `renderStepOnly` dans `steps-ui.js`).

**Timeline : affichage et défilement** (`tools/editor/timeline.js`) : la piste remplit toute la largeur visible (zoom d'ajustement au premier affichage, puis zoom manuel) ; un `ResizeObserver` redessine quand la zone change de taille (retour sur l'onglet Composition, labo masqué ou affiché, fenêtre redimensionnée), sinon les blocs hors de la largeur mesurée restaient absents ; la piste « Boss » est en première ligne ; la zone défile à l'horizontale et à la verticale dans une hauteur bornée à l'écran (`calc(100dvh - 330px)`), la page défile pour l'amener en vue. **Piège corrigé (défilement bloqué)** : `drawTracks` vidait la zone puis mesurait sa largeur, ce qui faisait retomber `scrollTop` / `scrollLeft` à 0 à chaque événement de défilement ; la piste est maintenant construite dans un `DocumentFragment` (`sink`) puis échangée d'un coup, et les mesures (`viewW`) sont prises avant. Ne jamais vider `tracks` avant de tout avoir reconstruit.

**Son et laboratoire intégré** : dans l'éditeur, les aperçus (`?edit=play|bot`) sont muets (`editor-hook.js` coupe `music` et `sfx`) ; seul le laboratoire (`?lab&embed`) joue la musique et les sons du jeu. Le laboratoire intégré ne rappelle ni l'ordre ni la version ni les statistiques des parties : le niveau suit la mission de l'éditeur, la **version** se choisit dans l'en-tête du cadre (Brouillon, Publiée ou une version de l'historique ; message `lab-version`) et les parties sont dans le tableau de l'éditeur. L'écran `?lab` autonome garde la section MISSION (ordre, version, dernières parties).
