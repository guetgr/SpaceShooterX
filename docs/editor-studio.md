# AGP Studio — éditeur de missions

Ouvrir http://localhost:8080/editor.html avec `python3 tools/serve.py 8080`.

## Organisation

Bibliothèque à gauche, aperçu et timeline au centre, inspecteur à droite. La composition reste séparée des réglages avancés et du JSON pour garder une lecture claire. Palette graphite (#14191f), panneaux ardoise (#1b222a), texte clair (#e8edf0), sélection vert doux (#95d7bf), avertissements ambre (#e0b578). Police système pour les petits contrôles ; Chakra pour la marque AGP.

1. Sélectionner une mission dans la liste.
2. Glisser une créature sur une piste de la timeline, ou la sélectionner puis cliquer « Ajouter une vague ». Un double clic sur la piste ajoute à cet instant.
3. Sélectionner la vague pour modifier sa quantité, ses horaires, son intervalle, sa formation, son étendue et sa position.
4. Choisir une alerte propre à la créature (sinon celle de la mission), son seuil d’apparition, ses PV, dégâts et vitesse initiale. L’intelligence 1 à 4 est disponible pour Bras, Pilleur et Éclaireur.
5. Tester la mission, puis revenir à la formation. « Enregistrer » valide et écrit les JSON via le serveur local.

Le bouton « Vagues uniquement » désactive les réserves aléatoires. Les événements, les renforts et les règles du tutoriel continuent à fonctionner. Les réserves et événements se sélectionnent aussi sur la timeline. Les réglages avancés restent dans « Réglages de mission ».

## Sens des formations et des réglages

Les formations Libre, Ligne, Colonne et Étoile définissent le placement initial ; les créatures reprennent ensuite leur IA. X et Y sont des pourcentages de la zone visible. Une formation près d’un bord peut être partiellement hors champ ou resserrée par les marges de sécurité du jeu. L’aperçu indique la composition ; il ne simule ni l’IA, ni la caméra, ni les collisions.

L’alerte propre change les comportements, le palier d’armes et les défenses à l’apparition, sans changer l’alerte globale de la mission. Le multiplicateur de dégâts de vague s’applique au contact, aux projectiles et aux attaques directes des créatures. Le multiplicateur global de dégâts de la mission reste actif. La vitesse est celle de départ ; l’IA peut la modifier ensuite. Le seuil d’alerte attend l’alerte de la mission, et ne bloque jamais les autres vagues. Les missions à alerte fixe ne franchissent pas un seuil supérieur : un avertissement l’indique.

Les multiplicateurs de vague se cumulent avec ceux du type de créature et de la mission. Les PV affichés sont une estimation au moment de l’arrivée, sans simulation de combat. Les satellites du tutoriel conservent leurs règles pédagogiques, leurs compteurs et leurs débris.

## Sauvegarde et raccourcis

Le brouillon est stocké localement (`ssx_editor_draft_v1`), séparément de la progression du joueur. Il est restauré uniquement si les documents de départ correspondent aux fichiers chargés. L’écriture définitive nécessite le serveur local ; le JSON peut aussi être téléchargé. Le jeu et le bot tournent dans des sauvegardes de test en mémoire.

- Ctrl/Cmd Z : annuler, Ctrl/Cmd Maj Z : rétablir (100 opérations).
- Ctrl/Cmd D : dupliquer la sélection ; Suppr : supprimer ; Échap : désélectionner.
- Flèches sur un bloc : décaler selon le magnétisme. Entrée : ouvrir sa sélection.
- Ctrl/Cmd S : enregistrer les missions.

Un enregistrement réussi devient la nouvelle référence et remet l’historique à zéro. Les changements saisis pendant la requête restent dans le brouillon.

## Historique des versions

Le bouton **Historique des versions**, dans la barre des vues de la mission, ouvre les versions de cette mission uniquement.

- Un **point nommé** capture le brouillon actuel sans modifier les fichiers du jeu.
- Chaque **enregistrement modifié** garde automatiquement l’état précédent et la nouvelle version. Réenregistrer le même contenu ne crée pas de doublon.
- Une version se compare au brouillon : paramètres modifiés, vagues, créatures, événements, textes et réglages complets de la mission. Les 80 premières différences sont affichées ; le JSON complet est téléchargeable.
- **Restaurer dans le brouillon** conserve d’abord une copie du brouillon actuel dans l’historique, puis applique la version sélectionnée. Annuler/rétablir fonctionne aussi pour une restauration. Cliquer sur **Enregistrer** applique ensuite le résultat aux fichiers du jeu.

Les versions persistent sur cet ordinateur dans `.editor-history/versions.sqlite3`, séparément du stockage du navigateur et de la progression du joueur. Ce dossier est ignoré par Git ; pour transférer l’historique complet vers un autre ordinateur, copier ce dossier lorsque le serveur est arrêté. Un JSON individuel se télécharge depuis le panneau.

L’historique commence avec les prochains points nommés et enregistrements : il ne reconstitue pas les modifications anciennes. Les versions ne sont pas supprimées automatiquement. La liste charge 40 versions à la fois, et ne lit le document complet qu’à la sélection. Le panneau ne fait aucune requête pendant la composition lorsqu’il est fermé.

Après une mise à jour du serveur, le relancer avec `python3 tools/serve.py 8081`, puis actualiser `http://localhost:8081/editor.html`.

`python3 tools/editor_versions_test.py` teste les versions nommées et automatiques, la persistance, la comparaison, la restauration protégée, les fichiers inchangés avant enregistrement, l’annulation, les erreurs de disque, la pagination, les accès refusés et les écritures simultanées. Les tests utilisent des copies temporaires des niveaux.

## Performance et fichiers

Aucun framework ni dépendance de production ajoutée. L’aperçu utilise Canvas 2D et ne dessine qu’au changement. Le moteur Phaser de l’aperçu est mis en sommeil pendant l’édition. Le bot est chargé à la demande. Les champs avancés ne sont construits qu’à l’ouverture de leur onglet. Les blocs de timeline hors du champ horizontal ne sont pas créés ; les glissements déplacent le bloc sans reconstruire l’interface et ne sauvegardent qu’au relâchement.

- `tools/editor/versions.js`, `tools/editor_versions.py` : panneau et stockage des versions de missions.
- `tools/editor/app.js` : état, historique, brouillon, pont et enregistrement.
- `tools/editor/timeline.js` : bibliothèque, composition et inspecteur.
- `tools/editor/studio.css` : habillage et disposition adaptative.
- `src/data/wave-patterns.js` : registre et géométrie partagés, chargé par le jeu et l’éditeur.
- `tools/level_files.py`, `tools/editor/validator.js` : validation serveur et navigateur ; cas communs dans `tools/fixtures/invalid_levels.json`.
- `src/game/level.js` : exécution des vagues ; `src/enemies/ai.js` : alerte propre et dégâts.

Les anciens JSON restent valides. Les nouveaux champs de vague sont facultatifs : `formation`, `spread` (24–300 px), `x` (0–100), `y` (0–80), `alert` et `minAlert` (entiers 1–20), `tier` (entier 1–4), `hpMul`, `dmgMul`, `speedMul` (0,1–10).

## Vérifications

`python3 tools/editor_studio_test.py` teste le glisser-déposer natif, l’annulation d’un glissement, le déplacement sur le canevas, les propriétés, annuler/rétablir, le JSON, la restauration du brouillon, la validation réelle du serveur, le rebasage après enregistrement, l’exécution de dix créatures avec leur alerte propre et la mise en sommeil. L’enregistrement est intercepté pendant ce test : aucun niveau du projet n’est modifié.

Contrôle visuel à 1440 × 1000 et contrôle de débordement à 1024, 768 et 390 px. Lors du premier essai sur cette machine, la reconstruction d’une timeline de 1 000 vagues a pris 13,8 ms, avec 36 blocs visibles et 639 éléments DOM. Ce chiffre mesure la composition, pas les FPS du combat, qui dépendent des ennemis, des effets et du matériel.

Les tests des vagues, du modèle et de l’interface des réglages, des validateurs JavaScript/Python, des statistiques ennemies (27 types × 4 alertes), des événements, des décors, des mondes et le smoke test du jeu passent.
