# Brief de référence — univers AGP, ton, interface (à lire avant de toucher à l'interface ou aux textes)

> Ce document est le **brief d'origine** donné pour la refonte créative de l'interface. Tout agent (ou humain) qui travaille sur l'interface, les menus, le HUD, les textes ou le ton du jeu doit le lire en entier. Il décrit l'**intention** ; ce qui a été réalisé est dans `docs/direction-artistique-agp.md`.
> Rappel du cadre technique : Phaser, mobile, orientation verticale ; ne pas modifier les mécaniques, l'équilibrage, les sauvegardes ni la logique des compétences ; si une idée change le gameplay, la présenter à part.

---

# Space Shooter X — Refonte créative de l'interface, du HUD et des menus

Repenser l'identité visuelle et l'expérience utilisateur de Space Shooter X pour que l'ensemble soit parfaitement cohérent avec le nouvel univers narratif du jeu.

**Prendre des initiatives créatives et proposer une vraie direction artistique, pas simplement quelques changements de couleurs ou de typographies.**

L'objectif est une première proposition concrète, fonctionnelle et testable.

## 1. Comprendre le projet existant
Avant toute modification, lire : `CLAUDE.md`, `PASSATION.md`, `README.md`, `docs/menu-accueil.md`, et les fichiers concernés par l'accueil, les menus et le HUD. Analyser les interfaces actuelles, leur fonctionnement, leurs animations et leurs contraintes techniques.

Le jeu utilise Phaser et fonctionne principalement sur mobile, en orientation verticale. Conserver les fonctionnalités et les systèmes de gameplay existants.

## 2. Le nouvel univers narratif
Space Shooter X est un space shooter roguelite avec énormément d'ennemis, des projectiles partout et une montée en puissance spectaculaire. Mais son univers est particulier.

**Année 2247.**

Le joueur est un simple employé de l'**AGP (Agence Galactique de Propreté)**, une entreprise de nettoyage spatial. Il pilote une vieille camionnette transformée en vaisseau et doit nettoyer les déchets de la galaxie.

Il déteste son boulot, son équipement est ridicule et son employeur le traite comme un numéro.

Progressivement, il découvre que l'agence a intérêt à maintenir la galaxie dans un état de pollution permanent.

### Le ton recherché
Un mélange de :
- Science-fiction rétro et industrielle.
- Humour noir et absurdité administrative.
- Satire du monde du travail.
- Entreprise dystopique obsédée par la productivité.
- Action arcade démesurée.

Imaginer une entreprise extrêmement bureaucratique qui dispose de technologies spatiales extraordinaires, mais fournit à ses employés du matériel obsolète.

L'humour doit être subtil, parfois absurde, sans transformer l'interface en caricature illisible.

## 3. Direction artistique à explorer
L'interface doit ressembler à un **véritable logiciel de bord et de gestion interne de l'AGP**. Pas un simple menu futuriste générique avec des cadres bleus et des hologrammes partout.

Imaginer plutôt :
- Des interfaces de terminaux industriels rétrofuturistes.
- Des éléments de logiciels professionnels vieillissants.
- Des indicateurs de sécurité, de rendement et de maintenance.
- Une identité graphique d'entreprise cohérente.
- Des animations de démarrage, de chargement ou de validation.
- Des écrans qui semblent provenir d'une entreprise gigantesque et impersonnelle.

On peut mélanger cette esthétique avec des éléments modernes pour conserver une excellente UX.

**L'interface doit rester séduisante, vivante, immédiatement compréhensible et agréable à utiliser.** Ne pas faire quelque chose de trop austère sous prétexte qu'il s'agit d'un logiciel administratif.

L'esthétique du jeu reste pixel art / arcade spatial : chercher une cohérence entre ces univers. Proposer une palette de couleurs, une hiérarchie typographique, des traitements graphiques et des animations.

## 4. Repenser le menu principal
Le menu comporte trois sections.

**À gauche : HANGAR** — l'atelier personnel de l'employé. Le joueur y prépare sa camionnette, modifie son apparence et gère ses modules. Cet espace doit avoir une véritable personnalité : un atelier industriel bricolé, avec le vaisseau comme élément central.

**Au centre : CARTE DES MONDES** — l'interface de sélection des missions. Au lieu d'une simple carte de jeu, un système d'**affectations professionnelles** envoyé par l'AGP. Les mondes deviennent des **secteurs d'intervention**, les niveaux deviennent des **ordres de mission**, et les boss peuvent être présentés comme des **incidents majeurs**. Conserver la carte stellaire et la navigation entre les mondes, mais leur donner un contexte narratif.

**À droite : ARBRE DE COMPÉTENCES** — le système de recherche et d'amélioration technologique de la camionnette. Il peut ressembler à un logiciel de maintenance, de recherche industrielle ou à un catalogue technique de l'entreprise. Conserver la logique existante, mais proposer une nouvelle manière de présenter les compétences, leurs rangs et leurs effets. **Les fragments sont des composants technologiques récupérés pendant les interventions.**

### Une interface vivante
L'accueil doit donner l'impression que l'univers continue d'exister autour du joueur : transmissions, notifications d'entreprise, indicateurs de maintenance, animations de fond, messages administratifs absurdes. **Rester subtil : ne pas surcharger l'écran.**

## 5. Repenser le HUD pendant les combats
Partie extrêmement importante. Le jeu est un shooter vertical où le joueur doit esquiver énormément de projectiles tout en détruisant des hordes d'ennemis.

**La lisibilité et la fluidité du gameplay sont absolument prioritaires.**

Le HUD doit paraître intégré aux systèmes de bord de la camionnette. Réfléchir à : l'affichage des PV et du bouclier, la jauge d'Overdrive, la progression d'expérience, les informations de mission et de combat, les alertes de danger, les interactions avec les cartes d'amélioration, les transitions entre les phases de combat.

On peut renommer certaines informations visuelles avec un vocabulaire lié à l'AGP, sans modifier leur fonctionnement interne.

Éviter les cadres massifs, les panneaux opaques et les éléments qui masquent les ennemis. Les informations essentielles doivent être identifiables instantanément, même au milieu de centaines de projectiles. Prévoir une interface adaptée au tactile et aux différentes tailles d'écran.

## 6. N.O.R.M.A.
**N.O.R.M.A.** est l'assistante administrative embarquée de l'AGP. Elle guide le joueur, annonce les missions et commente certaines situations avec un ton **froid, poli et sarcastique**.

Un système de transmission cohérent avec l'interface. Exemples de répliques :
- « Votre équipement est assuré. Vous ne l'êtes pas. »
- « Une légère résistance a été détectée. Merci d'éviter toute escalade. »
- « Félicitations. Votre productivité a augmenté de 4 700 %. Votre salaire reste inchangé. »

Elle peut apparaître dans les menus, au début des missions, pendant certaines transitions et après les niveaux. **Éviter qu'elle interrompe constamment les combats.** Proposer une présentation visuelle originale pour ses interventions (terminal, notification, transmission radio, interface embarquée ou autre).

## 7. Écran de fin de mission
Un **rapport d'intervention de l'AGP** : les performances habituelles sous forme de compte rendu professionnel — ennemis neutralisés, déchets éliminés, fragments récupérés, durée de l'intervention, évaluation de la performance, commentaire de N.O.R.M.A. Une victoire = une intervention validée ; une défaite = un accident du travail. **L'humour apparaît dans les détails, sans nuire à la clarté des récompenses.**

## 8. Périmètre du MVP
Seulement deux niveaux du premier monde :
- **Niveau 1** : tutoriel de nettoyage des satellites en orbite terrestre.
- **Niveau 2** : première véritable attaque massive de drones et de systèmes de défense orbitaux.

Un boss final est prévu plus tard (parodie d'une personnalité réelle : à traiter avec prudence, ne pas le développer maintenant). Concentrer la cohérence visuelle et narrative sur ce début d'aventure. Inutile de développer des interfaces spécifiques pour tous les futurs mondes.

## 9. Méthode attendue
Interpréter comme un directeur artistique et un game UX designer :
1. Définir une direction graphique précise.
2. Revoir la présentation du menu principal, du HUD, des transmissions et de l'écran de résultat.
3. Implémenter un prototype directement dans le projet, en conservant les interactions fonctionnelles.
4. Ajouter des animations légères lorsque cela améliore réellement l'expérience.
5. Prendre des captures au format mobile pour évaluer la proposition.

Travailler dans une branche Git dédiée afin de conserver facilement l'interface actuelle.

**Ne pas modifier les mécaniques, l'équilibrage, les sauvegardes ou la logique des compétences.** Si une idée nécessite une modification de gameplay, la présenter séparément.

Réutiliser autant que possible les assets existants. Pour les nouveaux éléments graphiques, utiliser des solutions temporaires ou identifier les assets à produire. Vérifier que l'interface reste fonctionnelle et performante sur mobile.

## 10. L'objectif final
Quand un joueur ouvre Space Shooter X, il doit comprendre immédiatement qu'il n'est pas dans un space shooter générique :
- Il est un employé de l'AGP.
- Il possède une camionnette pourrie.
- Son entreprise lui donne des missions absurdes.
- Et il va progressivement transformer son outil de travail en l'une des armes les plus destructrices de la galaxie.

**Préférer une identité originale et assumée à une interface futuriste classique.**
