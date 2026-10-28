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
