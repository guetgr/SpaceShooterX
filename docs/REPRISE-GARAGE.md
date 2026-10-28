# Garage AGP — point de reprise

Date : 27 octobre 2026. Travail mis en pause à la demande de Gaëtan.
Branche d'origine : `codex/atelier-personnalisation` (fusionnée dans `main`, supprimée). Ne pas reprendre la production graphique sans nouvelle demande.

## Direction validée

Camionnette utilitaire AGP qui pourra progressivement devenir une machine de guerre. Pixel art industriel gris, jaune, cyan, métal usé. Vue trois-quarts au garage, vue du dessus en mission. Personnalisation principalement esthétique ; aimant géant et canon comme exemples.

Une seule version du garage dans le jeu : **aucun switch**, aucun retour à l’ancien atelier. Se concentrer sur le garage. Si un sprite manque, le signaler à l’utilisateur pour le générer ensemble.

## Ce qui fonctionne

- Garage intégré dans l’onglet ATELIER du jeu : `src/home/garage.js`, `css/atelier.css`.
- Décor détaillé séparé, camionnette nue, aimant et canon transparents dans `assets/atelier/`.
- Choix sans module / aimant / canon, retrait sans changer le véhicule.
- Placement validé manuellement par l’utilisateur. Repère commun 768 × 820, origine au coin supérieur gauche du PNG complet (marges transparentes incluses).
- Camionnette : x 0, y 330, largeur 768 ; PNG original 1536 × 1024.
- Aimant : x 349, y 273, largeur 310. Canon : x 413, y 342, largeur 215.
- Flottement commun du véhicule et du module, légère parallaxe, réduction des animations respectée, bouton de mouvement.
- Onglets peinture / carrosserie : illustrations de catalogue uniquement.
- Navigation missions / R&D et lancement de mission conservés. Le sprite Phaser de navigation disparaît uniquement dans le garage.

Les modules sont **visuels dans le garage**, pas des équipements de combat implémentés. La sélection utilise `ssx_atelier_preview_module`, local au navigateur, pas synchronisé au cloud. Les sauvegardes historiques de livrée/accessoires restent intactes mais leur ancien écran de sélection a été retiré.

## Calibration de projection validée

Fichier : `docs/concepts-atelier-2026-10-26/sprites/calibration-perspective.json`.
Sur le PNG 1536 × 1024 :
- Arête longitudinale (820,350) → (1330,300), pente −0,0980392157, angle −5,599339°.
- Arête transversale (510,265) → (810,320), pente +0,1833333333, angle +10,388858°.
- Verticale vers le haut de l’écran.

Projection affine oblique ajustée aux arêtes du toit, pas une isométrie 30° ni une caméra 3D récupérée. Les sprites générés ne sont pas parfaitement géométriques. Ne jamais étirer différemment X et Y pour les faire rentrer : cela change les angles.

## Pour que le garage ait vraiment de l’allure

1. **Composition mobile** : examiner la taille du véhicule, l’espace autour de l’aimant, le cadrage du décor et la transition vers les panneaux. Le fond paysage est recadré en portrait ; des détails latéraux disparaissent. Vérifier petits écrans et zones tactiles.
2. **Cohérence pixel art** : harmoniser densité des pixels, contours et éclairage entre décor, véhicule et modules ; nettoyer les halos des PNG. Contrôler à la taille réelle du jeu.
3. **Ancrage dans le garage** : ombre au sol et lumière cyan des réacteurs en calques séparés, ombre de contact des modules. Ne pas laisser un module bouger indépendamment de son point de fixation.
4. **Peinture** : produire les versions montées Origine / Braise / Vide ou un masque de carrosserie fiable. Les icônes existantes ne suffisent pas ; ne pas teinter phares, vitres et accessoires globalement.
5. **Carrosserie** : produire des renforts montables correspondant à la caméra validée et les placer avec l’outil. Le kit illustré est une vignette, pas un overlay prêt à monter.
6. **Réactions** : apparition/retrait des pièces, retour visuel de sélection, animations discrètes de lampes/terminal, éventuelle démonstration de pièces attirées. Éviter d’accumuler les mouvements ou de déplacer les contrôles tactiles.
7. **Finition UI** : hiérarchie titre/catégories/choix, états sélectionnés, contraste et lisibilité. Garder les textes et boutons en HTML, pas imprimés dans une image.
8. **Avant une intégration gameplay** : décider explicitement les liens avec R&D, progression et sauvegarde. Produire les variantes vues du dessus ; ne pas présenter aujourd’hui l’aimant/canon comme fonctionnels en mission.

## Outils et références à garder

Sous `docs/concepts-atelier-2026-10-26/sprites/` :
- `placement.html` : placement au pixel, export JSON.
- `placements-valides.json` : valeurs utilisateur finales.
- `validation-perspective.html` : relevé des arêtes et garage géométrique.
- `build-atelier.html` : maquette indépendante ; le jeu réel utilise désormais `src/home/garage.js`.
- `comparaison-modules.html` : véhicule sans / avec modules.
- `prompt-*.md`, `prompts*.md` : prompts des générations et limites.

Captures de référence du jeu dans `docs/captures-prompt-2026-10-26/`. Le ZIP voisin est un export duplicatif, inutile pour exécuter le jeu.

## Validation / livraison

Vérification ciblée déjà passée : garage mobile, modules, catégories, retour carte et lancement de mission sans erreur JS. Le test historique `home_test.py` a été adapté au garage actuel (anciens contrôles retirés).
Avant push : smoke, home, level, perks, check_worlds, gen_codemap --check ; inspecter aussi les lignes ECHEC des anciens tests qui ne remontent pas toutes par le code de sortie.
Aucun changement d’équilibrage demandé. Les modifications de personnalisation antérieures à cette pause restent incluses dans la branche.

### Bilan de préparation Git

- `smoke_test.py`, `perks_test.py`, `check_worlds.js`, vérifications de syntaxe et `gen_codemap.py --check` : passent.
- `home_test.py` : garage, navigation, tutoriel et secteurs passent lors de la seconde exécution ; aucune erreur JS. Un contrôle « achat : fragments débités et affichage mis à jour » signale encore ECHEC. Le script retourne pourtant 0 : ne pas considérer cette suite entièrement verte. À diagnostiquer avant publication (comparaison du texte du compteur / temporisation / achat).
- Première passe de `level_test.py` : échec « victoire par survie → écran de fin », autres assertions réussies ; seconde passe en cours lors de la préparation, bilan final à compléter ci-dessous.
- `git fetch origin` effectué : aucun commit de `origin/main` absent de la branche au moment de la préparation.
- Le ZIP de captures est laissé local, hors commit ; les PNG et leur index sont versionnés.
- Push non effectué : demande limitée à sa préparation. Ne pas fusionner dans main avec des contrôles non résolus.
- Seconde passe de `level_test.py` terminée : **OK : niveaux**, aucune ligne ECHEC. L’assertion de compteur dans `home_test.py` reste le seul contrôle signalé en échec après relance.
