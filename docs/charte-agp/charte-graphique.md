# Space Shooter X — Charte graphique AGP

Version 1 · 27 octobre 2026 · Synthèse des dernières créations locales.

**Direction : « Le service technique du bout de la galaxie ».** Un utilitaire de nettoyage spatial, du matériel industriel récupéré et une administration imperturbable. Le garage donne envie de prendre soin de sa camionnette ; le HUD permet de survivre avec elle.

Cette charte formalise une direction à partir des références récentes. Les valeurs extraites du code sont identifiées comme telles ; les règles de prolongement sont des recommandations de DA, pas des fonctionnalités déjà intégrées. Elle ne modifie pas le jeu. Sa planche visuelle est dans [index.html](index.html).

## 1. Où en est le design

| Référence | Statut et rôle |
|---|---|
| [HUD en jeu du 27 octobre](../concepts-hud-2026-10-27/07-hud-in-game.png) + `css/hud.css` | Référence prioritaire de composition et de sobriété. Capture de contrôle, avec ligne de debug à ignorer. Le code actuel a depuis ajouté le compteur de composants sous le rendement. |
| [HUD minimal généré](../concepts-hud-2026-10-27/06-hud-minimal.png) | Étape de recherche ; couleurs plus vives que l'intégration finale. Ne pas recopier son glow ni ses valeurs fictives. |
| [Garage v2 généré](../concepts-atelier-2026-10-26/03-maquette-atelier-v2.png) | Référence d'ambiance, de matières et de silhouette. La maquette contient des éléments illustratifs non implémentés, dont l'aperçu « en mission ». |
| `assets/atelier/` + `src/home/garage.js` + `css/atelier.css` | Référence de production : décor calibré, véhicule et modules séparés. Aimant/canon : aperçu esthétique seulement. Peinture/carrosserie : illustrations de catalogue. |
| [Reprise garage](../REPRISE-GARAGE.md) | Contraintes validées de montage, projection et périmètre. |
| [Première DA AGP-OS](../direction-artistique-agp.md) | Héritage narratif et administratif ; ses couleurs très lumineuses et son ancien HUD ne sont plus la référence prioritaire. |
| [Plan atelier v3](../superpowers/plans/2026-10-27-atelier-v3.md) | Travail prévu, pas preuve d'une intégration. Ne pas présenter les six postes comme l'interface actuelle. |

Les anciennes captures du 26 octobre montrent encore un véhicule vu du dessus sur un fond spatial : elles ne représentent pas le nouveau garage. Pour arbitrer une divergence : comportement actuel dans le code, placements validés, capture récente, puis concept d'ambiance. Le code décrit l'existant ; la présente charte décrit comment le prolonger.

## 2. L'identité de l'univers

**Métier avant héroïsme.** L'AGP est une entreprise de propreté spatiale en 2247. Le joueur travaille avec un outil professionnel devenu absurdement puissant. La camionnette garde sa cabine, sa caisse utilitaire et ses marques de service, même quand les armes grossissent.

**Industriel habité.** Acier peint, soudures, boulons, tuyaux, câbles, coins frottés, poussière localisée, marquages de maintenance. L'usure raconte un usage ; elle ne couvre pas uniformément chaque surface.

**Technologie bricolée.** Des bras articulés, bobines de cuivre, batteries et buses expliquent visuellement le fonctionnement des modules. Le cyan signale l'énergie. L'ambre éclaire le lieu de travail.

**Administration sèche.** AGP-OS, dossiers, postes, ordres, habilitations et rapports fournissent le vocabulaire. L'humour est dans une annotation courte, jamais dans une disposition confuse.

**Deux intensités d'une même DA.** Au garage : objets riches, cadrage valorisant, lumière chaude/froide. En mission : instruments plats, contrastes contrôlés, espace libre. Ne pas transformer la barre de vie en morceau de carrosserie détaillé.

## 3. Palette et rôles

Couleurs ci-dessous relevées dans les CSS actuels, sauf indication. Elles constituent des tokens de référence proposés ; aucun fichier de thème du jeu n'est modifié.

| Token proposé | Hex | Fonction |
|---|---|---|
| `agp.background` | `#070A09` | Fond général graphite |
| `agp.surface` | `#111C1C` | Panneau de garage |
| `agp.surface-raised` | `#1A2925` | Carte de module |
| `agp.border` | `#405248` | Limite structurelle du garage |
| `agp.text` | `#EEF1E7` | Titres du garage |
| `agp.text-muted` | `#A9BDB0` | Description secondaire |
| `agp.action` | `#FFCE27` | Sélection et action au garage ; texte sombre `#152019` |
| `agp.brand-legacy` | `#FFC21A` | Jaune AGP des écrans historiques ; ne pas multiplier les jaunes sur un même composant |
| `hud.surface` | `#101A17` | Fond d'instrument |
| `hud.border` | `#34433B` | Trait discret des instruments |
| `hud.text` | `#E7E5D5` | Rendement, blanc cassé |
| `hud.health` | `#43A86B` | Coque saine |
| `hud.critical` | `#C35F50` | Coque critique, seuil actuel sous 30 % |
| `hud.damage-trail` | `#B8BDA3` | Retard de dégâts |
| `hud.xp` | `#548BA4` | Progression du niveau de mission |
| `hud.shield` | `#88BED0` | Bouclier, plus clair que l'XP |
| `hud.annotation` | `#C7B477` | Niveau, objectif ; ocre désaturé |

**Répartition recommandée :** grandes masses sombres, métal et textes clairs en second, accents jaunes limités aux choix et aux signes AGP. Le cyan lumineux appartient surtout aux propulseurs et aux équipements ; il ne devient pas le contour par défaut des panneaux. Le vert désigne un état, pas toute l'identité de marque. Le rouge est réservé au danger ou à l'échec.

Une couleur seule ne suffit pas : accompagner une sélection d'un cadre et d'un état explicite ; une alerte d'un libellé ou d'une valeur. Mesurer le contraste à la taille finale, notamment après transparence, vignette et scanlines. Cible recommandée : 4,5:1 pour le texte courant et 3:1 pour les limites de contrôles nécessaires à leur identification.

## 4. Typographie

Conserver les fontes locales de `assets/fonts/` : **Jersey 15** pour le registre arcade et les grands chiffres ; **Chakra Petch 600** pour les titres fonctionnels, labels et boutons ; **Chakra Petch 400** pour les descriptions et transmissions.

Dans le jeu, utiliser les alias existants `SSX Display`, `SSX Label`, `SSX Text`. Ils ont respectivement un `size-adjust` de 185 %, 132 % et 78 %. Une taille CSS copiée dans une maquette sans ces alias n'a donc pas le même rendu. Les petits labels de 5–7 px logiques sont un héritage à vérifier sur téléphone, pas une taille universelle à reproduire.

Ordre de lecture : valeur ou nom de l'objet → action/état → description → annotation. Majuscules sans accents pour les titres d'interface, casse naturelle et accents pour les phrases. Chiffres tabulaires pour les compteurs. Éviter les longues phrases en capitales ou les descriptions en fonte pixel décorative.

Pour une planche documentaire hors jeu, utiliser les fontes brutes à des tailles de lecture confortables ; ne pas transposer ces tailles directement au repère 400 × 700.

## 5. Formes, matières, icônes

- Panneaux rectangulaires, coins francs ; petits décrochements possibles sur un grand élément. Pas de pilules ni d'arrondis généreux.
- Dans le HUD : bordures de 1 px logique, rayons de 0 à 2 px, aplats et transparence légère. Pas de boulons décoratifs autour de chaque jauge.
- Au garage : cadres simples, sélection jaune, fond légèrement réchauffé. La richesse doit rester dans les sprites.
- Rayures de chantier à un endroit structurel : bord de quai, signalétique, titre de section. Éviter d'en ajouter à chaque bouton.
- Icônes de silhouette nette, même famille pixel, même épaisseur apparente. Réutiliser `uiIco` et les assets existants. Pas d'emoji système dans le produit.
- Textes, prix, jauges et états en HTML/CSS ou composants dynamiques. Ne jamais les figer dans une image d'interface générée.
- Aucun flou appliqué aux sprites. Garder des pixels cohérents à l'échelle d'affichage ; préférer une mise à l'échelle entière quand elle est possible, vérifier les paliers intermédiaires sur mobile.

## 6. Composition du HUD

Le repère existant est **400 × 700 pixels logiques**, mis à l'échelle d'un bloc avec le jeu. Ces mesures documentent le HUD actuel, elles ne sont pas des pixels physiques de téléphone.

| Zone | Règle actuelle à préserver |
|---|---|
| Haut | Marges : 12 px latéraux, 10 px en haut. Coque à gauche ; rendement et pause à droite. |
| Coque | 18 px de haut, valeur restante, dix segments ; pas de gros cartouche COQUE supplémentaire. |
| Progression | Niveau de mission et barre XP de 4 px. Bouclier fin de 4 px, seulement s'il existe. |
| Ressource | Composants sous le rendement dans le code actuel ; conserver leur distinction avec le score. |
| Objectif | Une ligne compacte et une progression discrète sous les instruments. |
| N.O.R.M.A. | Zone stable à y = 78, 12 px de marge ; texte pouvant revenir à la ligne, sans portrait. |
| Incidents | Première jauge à y = 151, suivantes à 187 et 223. Vérifier leur cumul avec les longs messages. |
| Terrain | Conserver le centre et le bas dégagés pour lire trajectoires, tirs et ramassages. |

La pause actuelle fait 36 × 36 px logiques : tester sa taille physique après réduction. Pour les futurs contrôles, viser une cible tactile de 44 × 44 px CSS à l'écran quand l'espace le permet ; agrandir la zone de clic sans grossir tout le décor.

Le HUD ne suit pas le véhicule. Les états urgents doivent être compréhensibles par la valeur et la forme, même sans animation. Ne pas réintroduire les grands cadres lumineux des premières explorations.

## 7. Composition du garage et assets

Le véhicule est le sujet principal : cabine identifiable, masse claire sur fond sombre, point d'ancrage du module visible. Garder une marge au-dessus des grands équipements et éviter que le recadrage portrait coupe l'aimant. Les commandes restent sous la scène, avec catégorie → choix → état/description.

**Projection validée :** oblique affine, pas isométrique à 30°. Axes relevés sur le toit : −5,599° longitudinal, +10,389° transversal ; verticales vers le haut. Le décor final a été recalibré pour cette projection. Ne pas utiliser les perspectives des premiers concepts comme gabarit géométrique.

**Assemblage actuel :** repère commun 768 × 820, origine du PNG complet, marges transparentes incluses. Véhicule x=0, y=330, largeur=768 ; aimant x=349, y=273, largeur=310 ; canon x=413, y=342, largeur=215. Préserver les proportions X/Y et les points de fixation. Voir `placements-valides.json` et `calibration-perspective.json` dans les sources du garage.

**Livraison d'un asset :** PNG transparent pour véhicule/module/icône ; décor séparé ; nom du rôle, dimensions, origine et point d'ancrage documentés. Contrôler contours et halos sur fond sombre et clair. Les ombres de contact et lumières supplémentaires sont des pistes de finition, pas des calques actuellement garantis disponibles.

**Éclairage à prolonger :** ambre de maintenance depuis le haut, cyan local des réacteurs et témoins, reflets métalliques limités. L'usure suit les arêtes et les zones de manipulation. Garder les grands volumes lisibles avant d'ajouter rivets et câbles.

Un bouton « ÉQUIPER » ne doit pas promettre un effet de combat si seul l'aperçu du garage change. Employer « APERÇU » ou un état équivalent tant que l'intégration gameplay n'existe pas.

## 8. Grammaire des composants

| Composant | Normal | Actif / sélectionné | Indisponible / erreur |
|---|---|---|---|
| Action principale | Aplat jaune, texte sombre, verbe clair | Pression courte, déplacement de 1 px maximum recommandé | Fond sombre, motif du blocage écrit |
| Onglet | Fond acier sombre, label clair | Fond jaune, texte sombre et état sémantique | Désactivé seulement si nécessaire, raison accessible |
| Carte de module | Sprite isolé + nom ; cadre discret | Bord jaune et mention « APERÇU ACTIF » si c'est sa fonction | Objet identifiable, mention précise de l'indisponibilité |
| Transmission | Fond sombre translucide, liseré, nom N.O.R.M.A. | Une transmission à la fois | Priorité à l'information de danger |
| Jauge | Rail sombre + remplissage mat + valeur | Changement court, lisible | Rouge terre cuite + état explicite pour la coque critique |
| Rapport | Papier listing, encre sombre, hiérarchie de formulaire | Tampon de résultat | Motif d'accident explicite ; pas de panneau rouge plein écran |

États de survol facultatifs sur mobile ; focus clavier toujours perceptible. Pour tout contrôle à bascule, synchroniser son apparence et `aria-pressed` ou l'attribut adapté. Éviter les actions dépendant uniquement du survol.

## 9. Mouvement et voix

**Observé :** flottement commun véhicule/module sur 4 s avec amplitude de 2 px logiques ; parallaxe légère ; réduction des animations déjà prise en charge. L'attache ne doit jamais se désolidariser de la carrosserie.

**Recommandé :** retours de boutons de 100–160 ms, transitions de panneaux de 160–220 ms, aucune oscillation des zones tactiles. Garder un seul mouvement d'ambiance dominant. Respecter `prefers-reduced-motion` et le contrôle de mouvement du garage. Pas de flash continu pour rendre une alerte lisible.

N.O.R.M.A. est polie, précise, froide et sarcastique. La première partie d'un message transmet une information ; l'ironie vient ensuite si l'espace le permet. Exemple proposé : « Coque critique. La franchise reste à votre charge. » Ne pas inventer un montant, un gain ou une conséquence de gameplay pour une plaisanterie.

Lexique : mission → ordre de mission ; boss → incident majeur ; amélioration choisie → réquisition ; victoire → intervention validée ; défaite → accident du travail. Rendement et composants restent deux informations distinctes.

## 10. À faire / à éviter

| À faire | À éviter |
|---|---|
| Conserver la silhouette de camionnette et des outils détournés | Transformer l'AGP-77 en chasseur spatial générique |
| Concentrer la texture dans les objets | Ajouter bruit, rayures et scanlines sur chaque texte |
| Utiliser le jaune pour guider une décision | Faire briller tous les cadres simultanément |
| Garder le HUD mat et compact | Copier toute la richesse du garage dans le HUD |
| Isoler illustration et texte dynamique | Générer un écran aplati avec labels et prix incrustés |
| Réutiliser la projection calibrée | Étirer un module ou improviser une caméra isométrique |
| Distinguer aperçu esthétique et équipement réel | Déduire une mécanique de la présence d'un sprite |

## 11. Brief prêt à réutiliser pour un futur skill

> Créer ou faire évoluer [écran/composant/asset] de Space Shooter X selon la charte AGP. L'univers est un service de nettoyage spatial industriel : camionnette usée, métal gris, signalétique jaune, énergie cyan et humour administratif sec. Lire d'abord les sections de cette charte utiles au livrable, puis ouvrir les références visuelles correspondantes. Pour un HUD, privilégier le HUD intégré du 27 octobre et les valeurs actuelles de `css/hud.css` ; pour le garage, utiliser les assets séparés et les placements calibrés. Décrire ce qui est existant et ce qui est proposé. Conserver la mécanique, la sauvegarde et la navigation sauf demande explicite. Texte et états restent dynamiques. Fournir un aperçu à la taille réelle, les états nécessaires et les contraintes d'intégration. Vérifier lisibilité mobile, contraste, transparence, recadrage et mouvement réduit. Documenter tout nouvel asset manquant sans supposer son existence.

Entrées utiles : écran ciblé, objectif joueur, informations indispensables, interactions, plateforme, références, livrable attendu (code, maquette, sprite). Sorties : proposition cohérente, ressources réutilisées/créées, états représentés, vérification visuelle et limites restantes.

Cette section est une base de consignes ; aucun skill n'est installé par cette livraison.

## 12. Contrôle avant une prochaine livraison UI

- À 320, 400 et 768 px de viewport : texte complet, cadrage correct, contrôles accessibles, comportement du bloc 400 × 700 vérifié.
- HUD : pleine coque, coque sous 30 %, bouclier présent/absent, grand score, compteur de composants, message long et plusieurs incidents.
- Garage : sans module, aimant, canon, catégories de catalogue, réduction de mouvement et sélection visible.
- Vérifier dans le navigateur l'absence d'erreurs, le retour carte et le lancement de mission si l'interface réelle a été modifiée.
- Identifier explicitement les captures de référence, les propositions et les fonctions réellement implémentées.
