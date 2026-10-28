# Éditeur des missions — timeline et JSON

Lancer `python3 tools/serve.py 8080`, puis ouvrir `http://localhost:8080/editor.html`.

## Un fichier par mission

Les **16 missions, tutoriel compris**, ont leur source dans `src/data/levels/<id>.json`. `index.json` fixe leur ordre. Le jeu en développement charge ces JSON au démarrage. Les fichiers des secteurs ne contiennent plus les paramètres des missions.

Chaque document contient l’identité, l’objectif, les récompenses, le décor, l’introduction, le zoom, la menace, les multiplicateurs, les pools de mobs, les vagues, les événements programmés, les événements aléatoires activés et les références de boss. `w1-tuto.json` contient aussi tous les paramètres pédagogiques auparavant dans `TUTO_DEFAULTS` : déplacement, satellites, débris, boss, finition et récompenses.

Les comportements communs (IA, attaques des boss, effets des événements, musique et textes N.O.R.M.A.) restent dans leurs modules partagés. Les JSON définissent leurs paramètres de mission et leurs références ; ils ne recopient pas le moteur de combat. Les constantes globales du tutoriel dans `tuning-defaults.js` servent encore de secours aux anciens outils, mais les valeurs utilisées par le jeu et l’éditeur viennent du JSON.

`src/data/worlds/level-data.js` est un **cache généré**, jamais une source à éditer. `python3 tools/level_files.py` le régénère. Le serveur au démarrage, l’export et le build le régénèrent automatiquement. Ce cache permet aux outils Node et au build HTML autonome de conserver leur chargement synchrone.

## Lire la timeline

- **Vagues** : apparitions garanties à une heure définie, avec quantité et intervalle.
- **Pools** : bandes indiquant quels mobs sont éligibles au tirage aléatoire, satellites compris. Leur poids représente une fréquence relative, pas une quantité garantie.
- **Événements** : heure minimale de déclenchement ; un emplacement occupé ou un boss peut les retarder. La durée peut être forcée ou laissée au défaut de l’événement.
- **Objectif et boss** : marqueur horaire pour la survie ; condition explicite pour la collecte ou les éliminations.
- **Tutoriel** : étapes conditionnelles, premier satellite lent, cadence progressive, débris à la destruction, alerte, Antenne-Mère et phases de ses attaques.
- **Ambiance** : introduction, caméra, aléas, transmissions et musique.

Les déclenchements dépendant du joueur n’ont volontairement pas de fausse heure précise. Le **journal de la partie** affiche les apparitions et transitions réellement observées pendant TESTER (500 entrées récentes, réinitialisées à chaque lancement). Ce journal n’est pas un enregistrement exhaustif de chaque projectile ou son.

## Modifier et tester

1. Choisir une mission à gauche, y compris le tutoriel.
2. Choisir une miniature dans le bestiaire, régler arrivée/quantité/intervalle, cliquer **AJOUTER** ou cliquer dans sa piste.
3. Glisser le bloc pour déplacer la vague. Les champs permettent un réglage précis, une duplication ou une suppression.
4. Modifier les pools et les événements dans les réglages sous la timeline. **Remplacer les apparitions aléatoires** coupe le pool de mobs ; dans le tutoriel, cette option coupe les satellites pédagogiques automatiques. Les événements et renforts des boss restent indépendants.
5. **TESTER** redémarre la mission avec le document en mémoire. Le bot reçoit les mêmes modifications.
6. **EXPORTER** valide et enregistre les 16 documents JSON. Aucun export ne se fait implicitement pendant un test.

Une vague SATELLITE dans le tutoriel utilise le vrai satellite pédagogique (`tutoSpawnSat`) : ses PV, ses débris et sa destruction comptent pour l’objectif du tutoriel. Les autres mobs ajoutés sont des ennemis standards ; ils ne remplacent pas le compteur de satellites.

Les secondes des vagues et événements sont mesurées après l’introduction. Les anciens pools des secteurs 2 et 3 conservent leur horloge historique `difficulty` (temps de partie + 12 × (menace − 1)), indiquée dans l’éditeur. Changer `spawnClock` en `mission` permet de travailler uniquement en temps de mission.

## Édition JSON

Le panneau **FICHIER JSON COMPLET** permet de lire, copier, modifier et télécharger le document de la mission. **ACTUALISER DEPUIS LA TIMELINE** recharge les dernières modifications visuelles dans le champ. **VALIDER ET APPLIQUER** vérifie le document auprès du serveur puis l’applique en mémoire. **EXPORTER** écrit les fichiers.

Les identifiants, le secteur et le type de mission restent fixes dans cette version. Le serveur rejette les types d’ennemis ou d’événements inconnus, les horaires invalides et les structures incohérentes avant toute écriture. Les boss et météorites utilisent leurs moteurs spécifiques et sont visibles comme événements ou références, pas comme mobs standards.

Une vague après la victoire ne prolonge pas la mission. Pour une mission de collecte ou d’élimination, la date du boss dépend de la progression réelle. Un événement peut attendre la libération de son emplacement.

## PV et stats des mobs

Les valeurs de base des mobs (PV, dégâts de contact, vitesse verticale de départ, score) sont dans `src/data/enemy-stats.js` (`ENEMY_STATS`). Une mission peut les multiplier avec la clé optionnelle `mobs` de son JSON :

```json
"mobs": { "grunt": { "hpMul": 1.5, "speedMul": 0.8 } }
```

Champs permis : `hpMul` (PV et bouclier de départ), `dmgMul` (dégâts de contact), `speedMul` (vitesse verticale de départ), `scoreMul` (score). Chaque multiplicateur est un nombre de 0,1 à 10 ; un champ absent vaut 1, et une mission sans `mobs` se comporte exactement comme avant. Un type de mob inconnu ou une valeur hors bornes est refusé par la validation. Le multiplicateur s'ajoute à l'échelle de difficulté, il ne la remplace pas. Les minuteurs, positions d'arrêt et cadences de tir ne sont pas concernés.

## Vérifications

- `node tools/check_worlds.js` : structure et progression des secteurs.
- `node tools/timeline_test.js` : horaires, quantité, réinitialisation et saturation des vagues.
- `python3 tools/level_files_test.py` : validation et export JSON dans un dossier temporaire.
- `python3 tools/enemy_stats_test.py` : stats des 27 types identiques à `tools/enemy_stats_snapshot.json` (`--write` pour le régénérer, seulement si un changement de valeurs est voulu) et surcharge `mobs`.
- `python3 tools/level_files.py` : génération du cache depuis les JSON.
- `python3 tools/build.py --inline-phaser` : build autonome incluant les niveaux.

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
