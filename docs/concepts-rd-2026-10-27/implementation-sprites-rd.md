# R&D — plan d’intégration et découpage des sprites

## Intention

Transformer l’écran R&D actuel en dossier technique manipulé dans le hangar, tout en gardant les données et les achats existants. Les informations de jeu restent en HTML : nom, description, rang, coût, état du plan, prototype, spécialisation et bouton d’achat. Les images servent uniquement au décor et aux supports papier.

Référence visuelle : `docs/concepts-rd-2026-10-27/01-rd-dossier-cartes.png`.

## Proof of concept interactif

- Démo : `docs/concepts-rd-2026-10-27/poc/index.html`
- Capture validée : `docs/concepts-rd-2026-10-27/02-proof-of-concept-rd.png`

La démo est autonome. Elle présente les trois pochettes réduites, cinq intercalaires physiques, le changement de secteur, la progression du dossier et un achat simulé qui transforme un blueprint en pochette de prototype. Elle ne lit ni ne modifie la sauvegarde du jeu.

Le bouton `ACTIVER LE PLACEMENT` rend le cartouche inférieur, les onglets et les trois pochettes déplaçables. Le coin jaune redimensionne une pochette. `SAUVEGARDER layout-rd.json` exporte les coordonnées sur le repère 400 × 700 ; le fichier de référence est `docs/concepts-rd-2026-10-27/layout-rd.json`.

Disposition V2 : les cinq intercalaires se chevauchent horizontalement sur le bord supérieur de la feuille ; les trois pochettes occupent son centre ; le titre et la progression du secteur forment un cartouche au bas de la page.

Chaque pochette contient une note manuscrite dynamique qui décrit l’essai en cours, le gain du rang suivant ou la condition de récupération du plan. Un tracé SVG à l’encre relie les pochettes ; ses branches sont recalculées pendant les déplacements dans l’éditeur.

## Kit livré

Les sources haute définition sont conservées dans `assets/rd/`. Les fichiers à charger dans le jeu sont dans `assets/rd/runtime/`.

| Fichier runtime | Taille | Alpha | Usage |
| --- | ---: | :---: | --- |
| `assets/rd/runtime/dossier-background.png` | 788 × 1400 | non | Décor fixe : hangar, Terre, lampe, établi et dossier ouvert vide. |
| `assets/rd/runtime/card-paper.png` | 960 × 480 | oui | Technologie prototypée ou validée. Texte et icône ajoutés par le DOM. |
| `assets/rd/runtime/card-blueprint.png` | 960 × 480 | oui | Plan récupéré, prototype encore à fabriquer. |
| `assets/rd/runtime/envelope-locked.png` | 960 × 480 | oui | Plan non récupéré ou accès encore verrouillé. Réserver la partie droite au cadenas. |
| `assets/rd/tabs/runtime/tab-red.png` | 360 × 108 | oui | Intercalaire du secteur 1. |
| `assets/rd/tabs/runtime/tab-ochre.png` | 360 × 108 | oui | Intercalaire du secteur 2. |
| `assets/rd/tabs/runtime/tab-teal.png` | 360 × 108 | oui | Intercalaire du secteur 3. |
| `assets/rd/tabs/runtime/tab-blue.png` | 360 × 108 | oui | Intercalaire du secteur 4. |
| `assets/rd/tabs/runtime/tab-olive.png` | 360 × 108 | oui | Intercalaire du secteur 5. |

Sources :

- `assets/rd/dossier-background.png` — 941 × 1672
- `assets/rd/card-paper.png` — 1774 × 887
- `assets/rd/card-blueprint.png` — 1774 × 887
- `assets/rd/envelope-locked.png` — 1774 × 887
- `assets/rd/tabs/source/tab-atlas.png` — atlas source des cinq intercalaires

## Découpage fonctionnel

Le code possède déjà les trois états nécessaires dans `src/ui/rd-ui.js` :

| État existant | Sprite | Lecture visuelle |
| --- | --- | --- |
| `.rdcard.noplan` | `envelope-locked.png` | Dossier scellé, plan à récupérer. |
| `.rdcard.plan` | `card-blueprint.png` | Étude disponible, prototype à financer. |
| `.rdcard.proto` | `card-paper.png` | Pochette active, rangs et spécialisation accessibles. |
| `.rdcard.proto` avec étape terminée | `card-paper.png` + tampon CSS | Pochette validée. |
| `.rdcard.aff` | sprite courant + halo/coin jaune CSS | Action achetable maintenant. |

Il n’est pas nécessaire de produire une image par technologie. L’icône déjà déclarée dans `TECHS` devient le dessin ou le cachet du dossier. Les titres et statistiques restent lisibles, traduisibles et compatibles avec les changements d’équilibrage.

## Structure recommandée

La structure de `index.html` peut rester en place : `#pageTree`, `#treeTabs`, `.tree-bhead`, `.tree-bbar` et `#treeScroll`. L’intégration tient principalement dans `css/rd.css` et dans le HTML renvoyé par `rdCardHtml()`.

1. Poser le décor sur `#pageTree::before`, avec `background-size: cover` et un voile sombre très léger en haut pour le bandeau AGP.
2. Placer les onglets de secteurs sur le bord extérieur droit. Leur languette interne passe sous la page ; seule leur extrémité colorée reste visible. Les boutons restent de vrais boutons.
3. Afficher les trois pochettes dans les limites de la page, à une largeur initiale de 270 px pour une hauteur de 130 px. Garder une ombre courte afin qu’elles paraissent rangées dans le dossier sans flotter au-dessus de l’interface.
4. Affecter le sprite avec les classes d’état déjà générées par `rdCardHtml()`.
5. Transformer `.rd-buy` en bande de réquisition jaune fixée au bas de la carte. Le clic continue d’appeler `rdBuyAction()`.
6. Conserver `.rd-st` pour les données, mais remplacer les boîtes actuelles par de petites annotations manuscrites et des perforations de rang.

Exemple de base CSS :

```css
#pageTree {
  isolation: isolate;
  padding: 76px 18px 64px 48px;
  background: #070b0c;
}

#pageTree::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url("../assets/rd/runtime/dossier-background.png") center / cover no-repeat;
}

.rdcard {
  min-height: 166px;
  padding: 24px 34px 22px 32px;
  border: 0;
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.rdcard.noplan {
  padding-right: 96px;
  background-image: url("../assets/rd/runtime/envelope-locked.png");
}

.rdcard.plan {
  color: #d5edf2;
  background-image: url("../assets/rd/runtime/card-blueprint.png");
}

.rdcard.proto {
  color: #24231f;
  background-image: url("../assets/rd/runtime/card-paper.png");
}
```

Les espacements devront être ajustés dans le navigateur sur le repère logique 400 × 700. La carte verrouillée demande un retrait droit plus grand afin de ne jamais placer du texte sous le mécanisme jaune.

## Adaptation de `rdCardHtml()`

La logique d’achat ne change pas. Seule la présentation évolue :

- garder `data-tech`, `data-what`, `rdButton()`, `rdNextStep()` et `rdBuyAction()` ;
- garder le bouton `.rd-buy` dans chaque fiche pour éviter d’ajouter un nouvel état de sélection ;
- entourer le titre et l’icône d’un bloc `.rd-card__identity` ;
- afficher `PLAN`, `PROTOTYPE`, rang et `SPE` comme annotations de dossier ;
- ajouter un pseudo-élément CSS `VALIDÉ` quand `rdNextStep()` renvoie `null` ;
- ajouter `aria-label` aux onglets et au bouton d’achat, et conserver une zone tactile d’au moins 44 px.

Ce choix donne le rendu physique demandé sans modifier les sauvegardes, les coûts, les conditions d’accès ou la progression.

## Composition dans le repère 400 × 700

| Zone | Position indicative | Contenu |
| --- | --- | --- |
| Bandeau AGP | `y: 0–76` | Navigation globale existante. |
| Intercalaires | `x: 4–50`, `y: 100–330` | Secteurs S1 à S5. |
| En-tête du dossier | `x: 54–382`, `y: 85–132` | Secteur, sous-titre et progression. |
| Cartes défilantes | `x: 45–388`, `y: 132–632` | Fiches R&D physiques. |
| Navigation basse | `y: 636–700` | Atelier, Missions, R&D. |

## Effets à produire en CSS

Ces éléments n’ont pas besoin de sprites supplémentaires :

- tampon `VALIDÉ` ou `COMPLET` avec bord irrégulier, rotation et faible opacité ;
- ruban jaune de réquisition pour `.rd-buy` ;
- pastilles de rang sous forme de perforations ;
- ombre papier, petit soulèvement au toucher et retour à plat ;
- surbrillance ambre pour `.rdcard.aff` ;
- intercalaires de secteurs avec papier coloré et état verrouillé ;
- trait rouge de liaison éventuel via pseudo-élément, sans information fonctionnelle.

Respecter `prefers-reduced-motion` : désactiver le soulèvement, la rotation animée et les halos pulsés.

## Images optionnelles encore possibles

Le kit couvre l’intégration fonctionnelle. Ces images ne sont pas nécessaires pour la première version :

1. Une planche d’accessoires transparents : trombone, ruban adhésif, fil rouge, tache de café et rivet.
2. Un tampon encreur sans texte, si le rendu CSS du tampon manque de matière.
3. Des schémas propres à chaque technologie. Ils demanderaient une illustration par entrée de `TECHS` et alourdiraient fortement le chargement ; les icônes actuelles sont préférables pour la première passe.

## Ordre d’intégration

1. Charger le fond sur `#pageTree` et contrôler le cadrage en 400 × 700.
2. Refaire `.rdcard` avec les trois images d’état.
3. Ajuster contraste et zones de texte pour le papier clair et le plan bleu.
4. Recomposer les onglets en intercalaires.
5. Donner au bouton d’achat l’apparence d’un bordereau attaché.
6. Vérifier tous les cas : plan absent, plan acquis, prototype, rang achetable, composants insuffisants, spécialisation et fiche complète.
7. Vérifier téléphone étroit, souris, clavier et réduction des animations.

## Critères de validation

- Aucun texte n’est inscrit dans les PNG.
- Une seule copie de chaque texture est chargée puis réutilisée par toutes les technologies.
- Les données de `src/data/techs.js` et les sauvegardes restent inchangées.
- Chaque achat fonctionne encore par `rdBuyAction()`.
- Les cartes gardent une zone tactile minimale de 44 px.
- Le fond ne réduit pas la lisibilité du bandeau supérieur ni de la navigation inférieure.
- La page ressemble à un dossier technique posé dans le hangar, et non à une liste de cartes web.

## Prompts de régénération

Tous les prompts utilisent `01-rd-dossier-cartes.png` comme référence de style.

### Fond

> Production-ready portrait 9:16 background layer for a mobile science-fiction R&D menu. Orbital maintenance hangar, drafting workbench, Earth through a large porthole, warm articulated lamp on the left, metal mug on the right, large open blank worn engineering dossier. Quiet dark top 9% and bottom 10%. Premium handcrafted pixel art, graphite, amber and cool blue. No text, letters, numbers, logos, cards, blueprints, envelopes, wires, paperclips, stamps or icons.

### Carte papier

> Single blank horizontal worn off-white engineering index card isolated on transparent background. Irregular edges, graphite smudges, one tape corner and one paperclip, clean central 80% for dynamic text. Premium handcrafted pixel art. No text, symbols, stamps, blueprint, UI or scene.

### Carte blueprint

> Single blank horizontal dark navy engineering blueprint card isolated on transparent background. Subtle cyan grid, worn edges, tape and paperclip, calm central 78% for dynamic text. Premium handcrafted pixel art. No text, formulas, recognizable drawing, logo, lock, UI or scene.

### Enveloppe verrouillée

> Single closed horizontal kraft technical archive envelope isolated on transparent background. Worn beige paper, flap, stitched and riveted edges, small yellow-and-black mechanical seal with a simple padlock silhouette on the right. Broad calm front area for dynamic text. No text, letters, numbers, logos, buttons or scene.

### Intercalaires

> Production sprite atlas on a transparent background. Exactly five identical physical ring-binder index tabs in five equal horizontal rows: oxidized brick red, aged mustard ochre, petrol teal, muted slate blue and military olive green. Worn cardstock, broad blank label area, reinforced seam, layered paper thickness, tiny fibers and restrained contact shadow. No text, symbols, icons, logo, background, page or rings.
