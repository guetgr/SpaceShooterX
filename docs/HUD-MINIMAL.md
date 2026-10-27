# HUD de mission — version minimale

Implémentation : `index.html`, `css/hud.css`, `src/ui/hud.js`, `src/ui/norma.js`.

Le kit graphique utilise `assets/hud/segments.svg` pour les dix segments de coque et l'icône pixel pause existante (`uiIco`). Les fonds, remplissages et contours sont dessinés en CSS : aucun chiffre ni texte n'est figé dans une image. Aucun autre sprite n'est nécessaire à ce HUD.

- Coque : PV restants uniquement, à gauche dans la barre ; vert, rouge sous 30 % ; retard de dégâts et retour visuel de soin conservés.
- Niveau de mission + progression XP bleue ; bouclier fin affiché seulement lorsqu'il existe.
- Rendement et pause à droite ; objectif avec progression discrète dessous.
- NORMA : emplacement fixe à 78 px logiques, texte qui se replie sans troncature, progression du tutoriel conservée. Les jauges d'incident commencent à 151 px.
- Pas de portrait ni de déplacement du HUD avec le véhicule. Animations réduites respectées.

Repère de mise en page : 400 × 700, mis à l'échelle avec le reste du jeu. Aucun changement d'équilibrage ni de sauvegarde.

Validation : test de démarrage/combat sans erreur JS, build autonome et syntaxe OK ; contrôle navigateur de 49 PV, XP à 30 %, niveau 6, rendement 884, pause/reprise, largeurs 320 et 768 px. Les textes du catalogue NORMA occupent au maximum 53 px de hauteur dans la zone prévue. Capture de contrôle : `concepts-hud-2026-10-27/07-hud-in-game.png`.
