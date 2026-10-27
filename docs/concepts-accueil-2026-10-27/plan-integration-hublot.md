# Plan de découpage et d'intégration — accueil hublot

## Objectif

Intégrer le concept V2 dans la vraie page Missions, avec parcours linéaire orbital en profondeur, hublot industriel et taux de finition dynamique. Le « FINITION 100 % » de la maquette illustre un niveau complété ; ne pas forcer la sauvegarde à 100 %.

## Découpage retenu

| Calque | Production | Comportement |
|---|---|---|
| Étoiles / espace | Réutiliser le décor Phaser | Fond lointain |
| Trajectoire arrière | Graphics Phaser | Derrière la planète, route ouverte |
| Planète du secteur | Texture existante, résolution augmentée | Éclairage existant, volume et nuages |
| Trajectoire avant | Graphics Phaser | Devant la planète ; projection commune avec les missions |
| Missions | Sprites `LEVEL_ICONS` existants | Échelle selon profondeur, occultation derrière la planète |
| Hangar / hublot / plancher | Nouvelle image transparente, sans planète ni texte | Premier plan fixe, ouverture réellement transparente |
| Console / boutons / finition | HTML/CSS | Texte, récompenses et états issus des données |

On reconstruit le fond masqué derrière les éléments au lieu de découper des rectangles contenant des textes ou des morceaux de planète. Le premier lot conserve le hublot et le plancher dans un seul PNG alpha : ils partagent le même plan fixe. Les lampes indépendantes ne sont pas nécessaires à cette intégration.

## Séquence

1. Ajouter la finition à la maquette ; préserver la V2 originale.
2. Générer le hublot sans contenu dans l'ouverture, vérifier son alpha et l'intégrer dans `assets/home/`.
3. Projeter une trajectoire ouverte dans un espace 3D simple. Utiliser les mêmes coordonnées pour les traits et les boutons ; cacher les éléments occultés par la planète.
4. Donner accès à tous les ordres par précédent/suivant, même si un objet est derrière la planète. Tourner la route vers la sélection ; réduire les mouvements si demandé par le système.
5. Réorganiser la console : titre, objectif, risque, prime, finition. Garder les détails complémentaires accessibles. Conserver le verrouillage et le lancement existants.
6. Vérifier première partie, niveau verrouillé, 0/partiel/100 %, navigation atelier/R&D/carte stellaire, retour de mission, mobile et mouvement réduit.
7. Contrôler les scripts et le build autonome ; documenter les écarts visuels restants.

## Limites du lot

Projection orbitale en perspective dans le moteur 2D existant : pas d'ajout d'un moteur WebGL 3D séparé. La planète conserve son rendu sphérique existant. Pas de changement d'équilibrage, de récompenses ni de format de sauvegarde. Aucun push ou déploiement.

## Réalisation

- Maquette actualisée : `05-accueil-finition-100.png`.
- Deux PNG RGBA réellement séparés : `assets/home/hangar-window.png` (948 × 1659) et `assets/home/earth-orbital.png` (dimensions dans `assets-production.json`). Le hublot a un centre transparent contrôlé.
- Route : `src/home/orbital.js`, projection commune des traits Phaser et des boutons HTML. Les missions arrière occultées sont accessibles par précédent/suivant ; une sélection occultée tourne vers l'avant.
- Habillage : `css/home-orbital.css`, chargé après les styles existants. Console défilable avec détails N.O.R.M.A. repliables, taux toujours visible en position initiale.
- Nouvelle Terre réservée à l'accueil ; les textures des autres secteurs et celles utilisées en combat restent leurs références existantes.
- Finition : calcul existant pour le tutoriel (0, partiel, 100). Les autres ordres n'ont pas de définition de finition dans les données actuelles : afficher « — / Non définie pour cet ordre » sans modifier leur gameplay.
- Build : inclusion de toutes les feuilles de style déclarées dans `index.html` ; ajout du MIME WAV qui manquait pour trois sons déjà présents dans le manifeste.

### Écarts assumés par rapport à la maquette

Le hangar et la Terre sont réutilisés en calques séparés ; la console est recomposée pour de vraies interactions. Les icônes des missions sont les sprites existants, certains contenant encore un petit morceau de décor : une passe artistique dédiée pourra uniformiser leurs silhouettes. La route tourne en perspective mais la sphère est une texture éclairée, pas un globe géographique 3D navigable. Les objectifs et textes complets restent consultables dans Détails ; la maquette ne constituait pas un contrat de suppression de ces informations.
