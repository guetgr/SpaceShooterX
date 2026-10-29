# Deux premiers niveaux — bible de l’univers v2

Les fichiers joués et éditables sont `src/data/levels/w1-l1.json` et `src/data/levels/w1-l2.json`. Le tutoriel reste séparé. Référence : `docs/bible-univers-v2.md`, campagne du monde 1.

| Mission | Contenu | Approche avant le boss | Vagues / unités | Incident final |
|---|---|---:|---:|---|
| 1 — Perturbations locales | La défense du réseau météo répond à l’intrusion et protège les installations du même propriétaire. | 60 s | 12 / 34 | La Météo |
| 2 — Récupération prioritaire | Les machines récupèrent la ferraille et réparent les unités actives malgré leur mise hors service déclarée. | 75 s | 16 / 35 | Araignée de tri |

Les 60 et 75 secondes déclenchent le boss : la mission se termine à sa destruction. Les récompenses, la menace globale, les multiplicateurs globaux de PV et de dégâts, les paramètres des boss et la progression du joueur restent ceux des missions existantes.

## 1 — Perturbations locales

- 2–15 s : satellites résiduels, premier satellite armé, patrouille de trois tireurs.
- 18–24 s : sondes en formation, deux satellites de défense, transmission sur le partage du ciblage.
- 28–32 s : débris et quelques cristaux, respiration pour collecter les ressources.
- 34–50 s : balise d’interception, patrouille en colonne, formation de sondes, derniers renforts de défense. La seconde transmission précise que le propriétaire est commun.
- 54–60 s : derniers satellites inertes, puis arrivée de La Météo.
- Rapport : le réseau météo est neutralisé ; les machines de récupération voisines continuent leur activité.

Le drone n’a pas de tir à l’alerte 1 dans le moteur actuel. Les sondes utilisent donc **l’alerte propre 3**, qui leur donne un projectile simple, sans changer l’alerte globale de la mission. La dernière patrouille de tireurs passe à l’alerte propre 2.

## 2 — Récupération prioritaire

- 2–18 s : débris, un Bras écartés de tier 1, patrouille, premier compacteur lourd.
- 22–27 s : deux Bras écartés, puis premier réparateur ; N.O.R.M.A. suggère de le traiter en priorité.
- 31–35 s : récupération de débris et de cristaux.
- 37–48 s : compacteur, trois Bras écartés de tier 2, réparateur et patrouille. Le message de contexte rappelle que les machines poursuivent leur travail.
- 55–67,5 s : dernier groupe de récupération escorté, puis débris à collecter.
- 75 s : Araignée de tri. Le rapport reprend la constatation de la bible : le propriétaire a signé la mise hors service, mais son matériel reste actif.

Les trois réparateurs apparaissent seuls, à 24, 43 et 59 s, près des groupes qu’ils peuvent soigner. Les Bras écartés commencent au tier 1, puis passent au tier 2. Les premiers types ne sont pas remplacés par des versions artificiellement plus résistantes.

## Correspondance avec les ennemis existants

| Rôle narratif | Type du moteur | Fonction réellement disponible |
|---|---|---|
| Satellite hors service / ferraille résiduelle | `sat` | Dérive, ne tire pas, projette des débris à sa destruction. |
| Satellite de défense | `satgun` | Charge visible, puis projectile de plasma. |
| Patrouille | `shooter` | Se met en position, puis tire vers le joueur. |
| Sonde du réseau météo | `drone` | Déplacement ondulant ; tir simple à l’alerte propre 3. |
| Balise d’interception | `turret` | S’installe et annonce ses rafales. |
| Robot Bras écartés | `bras` | Salves diagonales, intelligence progressive par tier. |
| Réparateur | `healer` | Impulsion qui soigne les alliés dans un rayon de 100 px. |
| Compacteur | `tank` | Unité lourde lente, tir puissant préparé. |

Ces rôles réutilisent les sprites et comportements disponibles : aucun nouvel ennemi, aucune nouvelle apparence et aucune IA de presse ou de convoyeur n’ont été inventés dans les JSON. Le partage du ciblage est un élément narratif du réseau ; il n’ajoute pas le verrouillage de l’Éclaireur, réservé à la suite de la progression.

## Lisibilité et récit

Les arrivées sont programmées avec `timelineOnly:1`. Les réserves et petits événements aléatoires sont désactivés pour conserver la composition ; les formations reprennent leur IA normale après leur placement initial. Les derniers ennemis armés arrivent au moins 9 secondes avant le boss. Les petits passages de cristaux sont terminés depuis longtemps à son apparition.

Les transmissions horaires sont espacées de plus de 14 secondes et laissent une place à l’annonce du boss. Les lignes de victoire sont attachées au rapport avec une ancre `win`. Le propriétaire reste distinct de l’AGP ; aucune révélation martienne ni ancienne intrigue lunaire n’est réintroduite.

Le JSON actuel rejoue les lignes de contexte à chaque tentative. Une mémorisation narrative « une seule fois par campagne » nécessiterait une fonction supplémentaire du moteur ; ces deux ordres ne contiennent pas de révélation majeure nécessitant cet état.

Les notes de mission dans `src/data/agp-lore.js` sont alignées avec les nouveaux scénarios.

## Vérification

- Les deux documents passent les validateurs Python et JavaScript.
- Trois graines par mission avec le profil moyen du bot : 6 victoires, aucun dépassement de temps et aucune erreur JavaScript. C’est un contrôle de jouabilité, pas une mesure statistique d’équilibrage.
- Niveau 1 : équipement de base, 93,3 à 127,2 s au total, 5 à 6 ennemis actifs au maximum.
- Niveau 2 : budget d’atelier de 55 composants, 96,9 à 113,1 s au total, 7 à 8 ennemis actifs au maximum.
- Les anciens JSON et les nouveaux états sont conservés dans l’historique de l’éditeur. Les points nommés « Bible v2 — Perturbations locales » et « Bible v2 — Récupération prioritaire » identifient cette proposition.
- `node tools/orbit_scenarios_test.js` vérifie le contrat narratif et les horaires ; les tests d’édition utilisent désormais des fixtures explicites pour rester indépendants du contenu de campagne.
