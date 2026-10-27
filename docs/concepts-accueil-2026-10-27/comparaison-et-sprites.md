# Accueil AGP — proposition et sprites

27 octobre 2026. Base : capture fraîche de la version locale, en nouvelle partie, onglet MISSIONS. Proposition visuelle uniquement ; aucune modification du jeu.

## Comparaison

| Version actuelle | Proposition |
|---|---|
| Planète centrale et six ordres en arc | Conserver les six destinations, dans un terminal de répartition industriel |
| Fond spatial générique, grands halos et texte vert lumineux | Acier graphite, éclairage ambre local, bleu de la carte, jaune d'action |
| Fiche avec objectif, risque, prime, finition, condition de finition et long message NORMA | Mettre objectif, risque et prime en lecture immédiate ; proposer les détails secondaires dans un volet accessible |
| Bandeau RH défilant + longue note NORMA | Une note courte dans la composition principale ; les messages complets restent accessibles |
| Grand bouton jaune de départ | Conserver ce repère fort, avec un habillage plus sobre |
| Onglets ATELIER / MISSIONS / R&D | Conserver les trois destinations et renforcer la cohérence des pictogrammes |

Le déplacement des informations secondaires dans « Détails de l’ordre » serait une évolution UX à implémenter : le concept ne prouve pas son existence. Ne pas supprimer les informations de progression/finition de l'application. Les valeurs +5 et bonus +10 correspondent au tutoriel de la capture ; la future UI doit les lire dans les données.

## Sprites proposés, par ordre d'intérêt

Les dimensions ci-dessous sont des cibles de production à tester, pas les dimensions natives d'une planche générée.

| Priorité | Sprite | Apport | Découpe / animation proposée |
|---|---|---|---|
| P1 | Habillage de terminal orbital | Relie immédiatement la carte au garage ; cadre d'acier peint avec un rail et une lampe, centre vide | Quatre bords séparés ou cadre 9-slice ; coins sobres, aucune inscription figée |
| P1 | Satellite de récupération | Donne une identité à l'ordre de formation : panneaux solaires abîmés, coque de maintenance, œil optique | PNG alpha, silhouette cible 48–64 px ; 2 états de témoin facultatifs |
| P1 | Balise d'ordre sélectionné | Rend le choix lisible sans un gros halo blanc | Marqueurs séparés 24–32 px, états disponible / choisi / terminé / verrouillé ; chiffres en code |
| P2 | Petite camionnette AGP de navigation | Renforce le lien entre le joueur et la carte ; garder cabine, caisse et propulseurs | Réutiliser d'abord le sprite existant ; éventuelle variante 48–64 px, propulseurs en calque séparé |
| P2 | Lampe de maintenance ambre | Apporte une présence discrète au terminal | Base 24 × 48 px environ ; éteint / allumé ; halo séparé, mouvement réduit respecté |
| P2 | Cartouche de composants | Rend la ressource plus matérielle et cohérente avec l'atelier | Tester l'icône existante avant remplacement ; éventuel conteneur industriel 24–32 px, compteur dynamique |
| P3 | Tampon ou clip de dossier | Identité administrative dans la fiche d'ordre et les rapports | Petit sprite décoratif ; libellé et état restent dynamiques |

## Ce qu'il vaut mieux conserver en code

Texte, nombres, récompenses, segments de progression, focus, contour de sélection, boutons et fonds simples. Ne pas convertir toute l'interface en grandes images. La planète et les icônes de missions existantes sont réutilisables : comparer leur lisibilité avant de financer de nouveaux assets.

## Livrables et limites

- `01-accueil-actuel.png` : capture réelle du jeu local, profil de test vierge.
- La maquette générée : proposition de composition, pas interface implémentée.
- La planche de sprites : exploration visuelle ; découpe, transparence, grille de pixels, états et animation restent à produire pour une intégration.
- Génération : outil ImageGen intégré. Prompts enregistrés à côté des visuels.
