# Refonte de la progression — composants, atelier, R&D, emplacements, cartes, livrées

Date : 27 octobre 2026. Auteurs : Guet + Claude. Statut : **design à valider**, rien n'est codé.
Références : `docs/bible-univers.md` (§6 surtout), `docs/arbre-competences.md` (état actuel de l'arbre), `docs/REPRISE-GARAGE.md` (garage).

Légende : **[Guet]** = décidé par Guet dans la conversation · **[Claude]** = choix de Claude, à relire · rien = conséquence directe.

---

## 1. Intention

Aujourd'hui la progression ne raconte pas ce que dit la bible :
- les fragments ◆ sont calculés en cachette au rapport de fin, on ne les voit jamais tomber ;
- l'arbre R&D (335 rangs, 8 branches) mélange stats brutes, mécaniques et économie, avec beaucoup de doublons et de pourcentages invisibles ; tout finit par s'acheter ;
- l'atelier est décoratif : peinture gratuite, aimant et canon sans effet ;
- aucune limite de chargement : tout ce qui est débloqué peut sortir en carte.

Cible (bible §6) : **on récupère des composants sur les machines qu'on détruit, on améliore sa camionnette, on recherche des technologies, on n'en emporte qu'un nombre limité, et on les assemble pendant la mission.** Chaque système a un rôle unique et lisible ; la camionnette passe visiblement de « ridicule » à « démesurée ».

**Succès** : un joueur qui n'a lu aucun texte comprend, après le secteur 1, d'où viennent ses ◆, à quoi servent l'atelier et la R&D, pourquoi il n'a qu'un emplacement, et a envie de débloquer le suivant.

## 2. Les quatre couches (règle d'or : jamais deux couches pour le même effet) [Guet]

| Couche | Ce que c'est (lore) | Ce que ça donne | Durée | Monnaie |
|---|---|---|---|---|
| **ATELIER** | La camionnette elle-même : postes du véhicule | Stats de base permanentes, **toujours actives, hors emplacement** | Permanent | ◆ + pièces de secteur |
| **R&D** | Plans et prototypes de technologies | Le droit d'**emporter** une technologie + ses améliorations | Permanent | ◆ + pièces de secteur |
| **EMPLACEMENTS** | Baies d'équipement, « autorisations d'équipement » AGP | 1 à 5 technologies emportées par mission | Choix avant mission | — |
| **CARTES** | Assemblage sur le terrain avec les cristaux | Activation et montée en puissance des technologies emportées + réglages du canon | Une mission | Cristaux (XP) |
| **LIVRÉES** | Distinctions RH et trophées | Peintures et accessoires, **aucun effet en jeu** | Permanent | Aucune (exploits) [Claude] |

Atouts **GLOBAUX** = atelier + R&D. Atouts **DE MISSION** = cartes, fusions, reliques. La séparation de `CLAUDE.md` est conservée.

## 3. Ressources

### 3.1 Cristaux (inchangés)
Tombent des ennemis, remplissent l'XP, déclenchent les cartes, perdus en fin de mission.

### 3.2 Composants ◆ (= les fragments actuels, rendus visibles) [Guet]
- **Tombent physiquement** des machines détruites, se ramassent à l'aimant comme les cristaux. Sprite distinct des cristaux et des tirs ennemis (boulon / engrenage pixel, teinte métal + reflet jaune AGP). Brief d'image à écrire.
- Petits ennemis : chance faible ; lourds / élites : plusieurs ; boss : pluie de composants à sa mort (comme les cristaux aujourd'hui, `src/bosses/core.js:259`).
- Compteur discret dans le HUD pendant la mission : ce qu'on voit est ce qu'on rapporte.
- **Victoire** : 100 % des composants ramassés + **prime AGP** (l'actuelle `reward.clear/first`, réduite : elle devient un bonus, pas le revenu principal). [Claude]
- **Défaite (accident du travail)** : on garde les composants ramassés **moins une franchise de 30 %**, pas de prime. [Claude, non contredit]
- Les pactes multiplient toujours le total ; ils deviennent des « avenants au contrat ».
- Disparaît : le calcul `score/15 × LEVEL_FRAG_MUL` (`src/game/run.js:72`). Le score reste pour le classement.

### 3.3 Pièces de secteur (rares, une par secteur) [Claude, non contredit]
| Secteur | Pièce | Famille de techno (bible) |
|---|---|---|
| 1 Orbite terrestre | LENTILLE DE VISEE | lasers, ciblage, boucliers, guidage |
| 2 Casse lunaire | BOBINE MAGNETIQUE | drones, armure, démolition, aimants, réparation |
| 3 Mars | CELLULE INSTABLE | champs, Overdrive, armes expérimentales, zone |
| 4 Corridor | NOYAU GRAVITATIONNEL | missiles avancés, gravité, chaînes d'explosions |
| 5 Siège AGP | BADGE D'ACCES | prototypes AGP |

- Lâchées rarement par les élites / unités lourdes du secteur, **garanties** (quelques-unes) à la mort du boss du secteur.
- Servent aux paliers hauts : spécialisations des technologies du secteur (§5) et Mk III à V de l'atelier (§4).
- Effet voulu : rejouer un ancien secteur avec une meilleure camionnette a un but.

### 3.4 Plans de technologie
- **Chaque ordre de mission hors boss rapporte un plan à sa première victoire** ; le tutoriel remet le premier plan. [Claude]
- Le plan apparaît dans l'ordre de mission avant le départ (« PLAN A RECUPERER : LASER CONTINU ») : c'est l'identité et la récompense propre à chaque niveau.
- Le plan est lâché par le **boss de fin d'ordre** quand le niveau en a un (secteur 1 depuis la mise à jour de Bio du 27 oct. : Météo, Araignée de tri, Réacteur, Anneau, PDG), sinon par un ennemi marqué qui apparaît pendant la mission. On le voit tomber et on le ramasse. Acquis dès qu'il est ramassé, même en cas de défaite. S'il est raté, il reviendra à la tentative suivante. [Claude]
- Un plan rend la technologie **recherchable** dans la R&D (il ne l'active pas).

### 3.5 Emplacements [Guet]
- **1 emplacement au secteur 1, +1 par boss de secteur vaincu, 5 au maximum.** Dérivé de la progression des mondes (`ssx_worlds_v1`), pas de nouvelle sauvegarde.
- Présenté comme une « autorisation d'équipement n° N » délivrée par l'AGP.

## 4. Atelier — les postes de la camionnette

Six postes, chacun en **5 niveaux Mk I à Mk V**. Un achat = un vrai saut, chiffré dans la fiche (« Coque : 100 → 140 PV »). Chaque poste se voit sur la camionnette à certains Mk (au minimum Mk I, III, V). [Claude]

| Poste | Effet | Visuel au garage | Remplace dans l'arbre actuel |
|---|---|---|---|
| **COQUE** | PV max, réduction des dégâts subis, réduction des collisions, grâce après un coup | Plaques boulonnées, renforts | VITALITE, BLINDAGE+, ARMURE, RESILIENCE |
| **CANON DE SERIE** | Dégâts et cadence du tir de base ; critique aux Mk hauts | Le canon (asset existant) | PUISSANCE, DEGATS+, CELERITE, CADENCE+, CRITIQUE |
| **GENERATEUR DE BOUCLIER** | Mk I donne le premier bouclier, puis capacité et recharge | Émetteur / antenne | BOUCLIER+, BOUCLIER, RECHARGE BOUCLIER |
| **PROPULSEURS** | Réactivité ; Mk II donne l'esquive (1 charge), Mk IV +1 charge et le second souffle | Réacteurs plus gros, flamme cyan | REACTEURS, VITESSE, ECLAIR, REACTIVITE+, VITESSE LUMIERE, ESQUIVE, SECOND SOUFFLE (défense) |
| **AIMANT** | Portée d'attraction (cristaux, composants, pièces) | L'aimant géant (asset existant) | AIMANT+, AIMANT, SILLAGE MAGNETIQUE |
| **ORDINATEUR DE BORD** (mises à jour N.O.R.M.A.) | +1 choix de carte (Mk I, III, V), relances (Mk II, IV), radar de nébuleuse | Écran / antenne de cabine | INTUITION, RELANCE, ECLAIR DE GENIE, BUTIN DE BOSS, RADAR |

Coûts [Claude] : Mk I et II en ◆ seuls ; Mk III demande aussi des pièces du secteur 1, Mk IV du secteur 2, Mk V du secteur 3. Prix en ◆ croissants nettement d'un Mk à l'autre (ordre de grandeur ×1,7). Tout est atteignable avec les 3 secteurs actuels.

Garage : le sélecteur « module de prévisualisation » (`ssx_atelier_preview_module`) disparaît ; l'aimant et le canon s'affichent selon le Mk réellement acheté. Les autres postes s'affichent quand leurs sprites existent (liste au §10).

## 5. R&D — catalogue des technologies

### 5.1 Cycle de vie d'une technologie
1. **Plan manquant** : grisée, indique l'ordre de mission où le récupérer.
2. **PROTOTYPE** (◆, peu cher) : la technologie peut être équipée dans un emplacement.
3. **AMELIORATIONS** (◆, 3 à 5 rangs) : bonus permanents **propres à cette technologie**, actifs seulement quand elle est équipée (les anciennes « voies »).
4. **SPECIALISATION** (◆ + pièces de son secteur) : rend disponible en mission la carte de spécialisation (les anciens « caps »).

N.O.R.M.A. à chaque recherche : « Cette modification annule immédiatement la garantie constructeur. »

### 5.2 Familles par secteur (ordre de la bible) [Claude]

> **Décision [Guet] : on suit la bible.**
> - Les secteurs 2 et 3 sont réalignés sur la bible : **LA CASSE LUNAIRE** (Automates de traitement, boss LE BROYEUR) et **MARS, PLANETE POUBELLE** (Sécurité martienne, boss LE DIRECTEUR DE TRAITEMENT). Voir le §15, étape 6.
> - Les technologies des secteurs 4 et 5 (trou noir, éclats, rapatriement / Phénix) restent dans ces secteurs et sont **indisponibles tant qu'ils n'existent pas**. La fusion VORTEX attend aussi le secteur 4.

| Secteur | Technologie | Contenu repris de l'arbre (améliorations → spécialisation) | Tag |
|---|---|---|---|
| 1 | LASER CONTINU | portée, dégâts → LASER DESTRUCTEUR | ARME |
| 1 | LASER AUTO-CIBLEUR | verrouillage, ciblage prioritaire → RETICULE OMNISCIENT | ARME |
| 1 | MISSILES A GUIDAGE | charge, cadence, verrouillage multiple → ESSAIM D'AUTOMISSILES | RAMPE |
| 1 | BOUCLIER REACTIF | onde de renvoi, renaissance bouclier → spécialisation à concevoir | — |
| 1 | TIRS RICOCHETS (ex-REBOND) | rebonds → spécialisation à concevoir | — |
| 2 | DRONE SATELLITE | cadence, dégâts → ESSAIM (2 drones de plus) | — |
| 2 | MISSILES DE DEMOLITION | rayon, napalm, perforation, charge lourde → MISSILE NUCLEAIRE | RAMPE |
| 2 | BLINDAGE LOURD (ex-FORTERESSE) | résistance, régén blindée → AURA DE FER | — |
| 2 | NANO-REPARATION (ex-SANGSUE + régén + vol de vie) | vol de vie, rayon → FESTIN | — |
| 2 | BENNE DE RECUPERATION (ex-économie) | XP, chance de cristal, butin double, collecte auto, +composants → JACKPOT | — |
| 3 | OVERDRIVE | frôlement, surchauffe, recharge sur boss, cellules d'énergie → spécialisation à concevoir | — |
| 3 | CANON EXPERIMENTAL (ex-SHOTGUN) | plombs, recul → CANON A FRAGMENTATION | ARME |
| 3 | ARC ELECTRIQUE (ex-FOUDRE) | arcs → TONNERRE | — |
| 3 | CHAMP LENT | zone, ralentissement → spécialisation à concevoir | — |
| 3 | PULSAR | fréquence, portée → spécialisation à concevoir | — |
| 4 | TROU NOIR | fréquence → GRAVITE | — |
| 4 | ECLATS (chaînes d'explosions) | éclats → à concevoir | — |
| 5 | CONTRAT DE RAPATRIEMENT (ex-PHENIX) | esquive+, bouclier → IMMORTEL | — |

Règles de compatibilité : **une seule technologie ARME** (elle remplace le canon de série) et **une seule RAMPE** de missiles par chargement. Le reste se combine librement.

Ce qui disparaît de la R&D : toutes les stats brutes (parties à l'atelier) ; TIR MULTIPLE, PERFORANT, VELOCITE et TRANSPERCE-BOUCLIER ne restent qu'en cartes de mission (réglages du canon). LANCE-MISSILES n'existe plus en soi : chaque rampe l'inclut.

### 5.3 Interface R&D
Onglets **par secteur** à la place des 8 branches (« ACCES NON AUTORISE » pour un secteur pas encore atteint). Une fiche par technologie : état du plan, prototype, rangs, spécialisation, coûts en ◆ et en pièces, bouton d'achat. Les valeurs sont chiffrées.

## 6. Chargement (avant mission)

- Dans l'onglet ATELIER, panneau **BAIES D'EQUIPEMENT** : N emplacements ouverts, les autres verrouillés avec « AUTORISATION REQUISE — incident majeur du secteur N ».
- L'ordre de mission affiche le chargement en cours avec un raccourci « MODIFIER ».
- Le tutoriel se joue avec la camionnette de base, sans chargement.

## 7. Cartes en mission

À chaque montée de niveau, le tirage propose :
1. **ASSEMBLAGE : <techno>** pour une technologie emportée pas encore assemblée. Intention : **tout le chargement est assemblé dans la première minute environ** (les premières montées de niveau garantissent au moins une carte d'assemblage tant qu'il en reste). Le joueur sent sa build tôt et la fait grandir ensuite.
2. **Cartes de la technologie** une fois assemblée : 2 ou 3 améliorations propres, cumulables (versions de mission des améliorations R&D).
3. **Carte de SPECIALISATION** : seulement si elle est recherchée en R&D et après quelques cartes de cette technologie dans la mission.
4. **Réglages du canon** (cartes actuelles : cadence, dégâts, tir multiple, perforant, vélocité, coque, bouclier, réacteurs, aimant) : toujours disponibles. Ils comptent pour le canon de série et pour l'arme équipée.

Boss vaincu en mission : reliques (inchangées) + fusions. **Les fusions entre technologies ne sortent que si les deux sont emportées et assemblées** (ORAGE = ARC ELECTRIQUE + TIRS RICOCHETS, VORTEX = PULSAR + TROU NOIR, d'autres à concevoir). L'arme légendaire offerte au boss disparaît : l'arme s'assemble désormais par carte.

## 8. Livrées et accessoires [Claude]

- Les **succès** deviennent des **DISTINCTIONS RH** et ne donnent plus de bonus de stats (aujourd'hui +2 à +10 % dégâts, PV, XP… : `src/data/achievements.js`). Chaque distinction débloque une livrée (peinture) ou un accessoire (toit, marquage, flancs : `SHIP_PARTS`).
- **Chaque boss vaincu** débloque une livrée trophée (« LIVREE DREADNOUGHT »).
- Gratuit : les livrées ne coûtent aucun composant et ne concurrencent jamais la puissance.
- Satire : « EMPLOYE DU MOIS » pour la livrée la plus dure, attribuée avec un formulaire de félicitations sans prime.
- Les livrées montées demandent des masques de carrosserie ou des versions dédiées (REPRISE-GARAGE §4).

## 9. Sauvegarde et migration

- Nouvelle clé **`ssx_meta_v3`** (ajoutée à `SAVE_KEYS`) : `{ v:3, composants, pieces:{s1..s5}, atelier:{poste:mk}, rd:{techId:{plan, proto, rang, spe}}, chargement:[techIds] }`. `ssx_meta_v2` n'est plus écrite mais reste lisible pour la migration.
- **Migration à la première ouverture** [Claude] : remboursement total. Composants = fragments non dépensés + coût de tous les rangs achetés dans l'ancien arbre. Plans accordés pour chaque niveau déjà gagné. Emplacements dérivés des boss déjà vaincus. Un message N.O.R.M.A. annonce la « restructuration du catalogue ».
- Livrées : débloquées d'après les succès et la progression déjà enregistrés (rien à migrer). Le choix actuel (`ssx_skin_v1`, `ssx_ship_parts_v1`) est conservé.
- L'ascension (code mort, `src/data/meta.js`) est supprimée.

## 10. Assets à produire (briefs à écrire par Claude)

- Sprites en mission : composant ◆ (2 ou 3 tailles), 5 pièces de secteur, plan (document / disquette), marqueur de l'ennemi porteur de plan.
- Icônes d'interface (`uiIco`, `tools/gen_ui_icons.py`) : pièces de secteur, plan, emplacement verrouillé ou ouvert.
- Garage, vue trois-quarts calée sur la calibration validée : coque Mk III et Mk V, générateur de bouclier, propulseurs Mk III et Mk V, antenne de l'ordinateur de bord ; masques de peinture.
- Icônes des technologies (aujourd'hui des émojis pixellisés) : à produire plus tard, déjà listées dans la PASSATION.

## 11. Textes N.O.R.M.A. (à ajouter dans `src/data/agp-lore.js`)

- Plan ramassé : « Document technique récupéré. Il ne vous appartient pas. Moi non plus. »
- Emplacement débloqué : « Autorisation d'équipement n° {n} délivrée. L'AGP décline toute responsabilité quant à son usage. »
- Franchise après défaite : « Franchise accident retenue : 30 %. Merci de votre compréhension. »
- Prime de victoire : « Prime de rendement versée. Elle ne sera pas renouvelée. »
- Achat à l'atelier : « Modification non homologuée enregistrée. Votre véhicule n'est plus couvert. »
- Chargement plein : « Capacité de la baie atteinte. Veuillez renoncer à quelque chose. »
- Pièce de secteur : « Matériau sensible détecté. Je n'ai rien vu. »
- Migration : « Le catalogue R&D a été restructuré. Vos dépenses vous ont été recréditées. Exceptionnellement. »

## 12. Courbe visée (à régler avec `tools/sim_balance.py`, pas de chiffres figés ici)

- **Fin du secteur 1** (environ 6 victoires et quelques défaites) : 2 prototypes, 2 ou 3 améliorations sur la technologie favorite, Mk I sur 3 ou 4 postes. Un seul emplacement : le choix compte.
- **Fin du secteur 3** (premier passage) : environ la moitié du contenu des secteurs 1 à 3 acheté. Le reste demande des rejouages (pièces de secteur, pactes) : le joueur peut « casser le jeu » par le temps et la réflexion, jamais par un raccourci.
- Moins d'achats que l'arbre actuel (environ 30 Mk + 15 technologies × 6 paliers, contre 335 rangs), chacun nettement plus fort et visible.
- La difficulté reste fixée par la menace du niveau (`GameScene.js:25`) et ne dépend pas des achats.

## 13. Non-objectifs et anti-objectifs

**Non-objectifs** : créer les secteurs 4 et 5, de nouveaux ennemis ou boss ; produire les images ; fixer l'équilibrage définitif ; le wrapper Android.
**Anti-objectifs** (échec même si ça marche) :
- revenir à des rangs de +3 % invisibles ;
- un même effet vendu à deux endroits (atelier et R&D) ;
- des livrées achetables qui concurrencent la puissance ;
- une défaite qui efface tout ;
- une fenêtre qui interrompt le combat au ramassage d'un plan ou d'une pièce (notification HUD seulement) ;
- des drops qui gênent la lecture des tirs ennemis.

## 14. Contraintes techniques (rappel `CLAUDE.md`)

`mixin` interdit les méthodes en double (Grep avant d'ajouter) · nouveaux fichiers dans `src/scripts.json` dans l'ordre · pas d'émojis pour les nouvelles icônes d'interface (`uiIco`) · zone 400×700, pas de `vw/vh` · tests à mettre à jour : `perks_test.py` (globaux / mission), `home_test.py` (atelier et R&D), `level_test.py` (rapport : composants, franchise), plus un test de migration · `gen_codemap.py` après tout ajout de fichier ou de fonction · dépôt partagé avec Bio : prévenir avant de fusionner.

## 15. Découpage proposé (pour le plan)

1. **Composants visibles** : drop, ramassage, compteur HUD, rapport (prime, franchise). L'ancien arbre continue de fonctionner avec ces ◆.
2. **Modèle v3 + migration + atelier** (postes, Mk, visuels canon / aimant).
3. **R&D par technologie + emplacements + chargement + cartes d'assemblage** ; suppression de l'arbre.
4. **Plans et pièces de secteur** (drops, ennemi porteur, coûts hauts).
5. **Distinctions RH → livrées**, textes N.O.R.M.A., finitions.
6. **Réalignement des secteurs 2 et 3 sur la bible** [Guet], indépendant des étapes 1 à 5 :
   - **6a, tout de suite (textes)** : noms et sous-titres des mondes (« LA CASSE LUNAIRE — Recyclage obligatoire », « MARS, PLANETE POUBELLE — Gestion des déchets dangereux »), noms des ordres de mission, noms des boss affichés, transmissions N.O.R.M.A. et révélations de fin de secteur (bible §4).
   - **6b, ensuite (gameplay et images)** : compositions de vagues selon la bible §5 en réutilisant les comportements existants. Lune : kamikazes, réparateurs, blindés, unités mères. Mars : tirs croisés, zones de ralentissement, ennemis à bouclier. Boss Broyeur et Directeur, nouvelles planètes et décors : briefs d'images à écrire. Les événements hors thème (nébuleuse, araignées, ruches) sont déplacés ou retirés. Si la nébuleuse disparaît, le radar de l'ordinateur de bord disparaît avec elle.
   - Hors périmètre : le boss satirique du secteur 1 (bible : à traiter plus tard, avec prudence).

## 16. Laissé au constructeur

Valeurs exactes des Mk, rangs et prix ; taux de drop ; détail des cartes de mission par technologie ; spécialisations « à concevoir » (proposer à Guet avant de coder) ; mise en page des écrans dans le style AGP-OS existant.

Points mineurs tranchés par Claude :
- Le tutoriel ignore atelier et R&D (camionnette de base), comme aujourd'hui.
- La partie infinie (`?dev`) calcule son niveau d'alerte de départ sur le nombre d'achats atelier + R&D, à la place des points d'arbre.
- Le codex et la collection (`ssx_codex_v1`, `src/ui/pages.js`) listent les technologies à la place des compétences de l'arbre.
- Les conditions des succès ne changent pas ; seule leur récompense change.
