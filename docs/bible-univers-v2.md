# SPACE SHOOTER X — BIBLE DE L'UNIVERS — VERSION 2.0

**29 octobre 2026 — campagne Terre → Mars validée avec l'auteur.**

> **Nouvelle référence narrative.** Cette version conserve les fondations de la bible fournie le 28 octobre et intègre les décisions validées ensuite. Elle prévaut sur les anciennes versions pour la campagne et les personnages. Les fichiers anciens sont conservés comme historique ; leur contenu contradictoire ne fait plus autorité.
> À lire avant toute tâche touchant aux textes, à l'interface, aux noms ou au ton. La réalisation visuelle est dans `docs/direction-artistique-agp.md` (couleurs, typographie, écrans) : ce document-ci ne la répète pas.
> **Cadre technique** : le jeu est un shooter mobile portrait (Phaser). Habiller l'univers ne doit **jamais** modifier mécaniques, équilibrage, sauvegardes ni logique des compétences ; toute idée de gameplay se présente à part.

*Genre : space shooter arcade / roguelite / comédie de science-fiction dystopique. Ton : humour noir, satire du travail, action démesurée, mystère progressif.*

---

## 1. Le pitch

**Année 2247. L'humanité a conquis l'espace. Malheureusement, elle y a exporté tous ses problèmes.**

Les orbites sont encombrées de satellites, les planètes couvertes de décharges industrielles, et les grandes entreprises se font la guerre à coups de drones militaires. Dans ce contexte prospère l'**AGP — Agence Galactique de Propreté**, multinationale du nettoyage spatial.

Le joueur est l'un de ses employés. Aucun héroïsme, aucune formation militaire : son vaisseau est une **camionnette de livraison** aux propulseurs d'occasion et au système de défense bricolé. Sa mission officielle : nettoyer les déchets de la galaxie. Mais les déchets sont protégés par des robots, des systèmes militaires et des entreprises qui ne veulent pas payer leur recyclage. Alors il tire : d'abord sur quelques satellites, puis sur des drones, puis sur des flottes entières, jusqu'à posséder de quoi détruire une planète.

**Le problème : il est toujours payé au SMIC galactique.**

Il déteste son boulot, son équipement est ridicule, son employeur le traite comme un numéro. À partir de Mars, il découvre que **les résultats de recyclage annoncés par l'AGP ne correspondent pas au sort réel des déchets**. Le mécanisme général et les responsabilités restent à développer.

**Ce que le joueur doit comprendre en ouvrant le jeu** : il est un employé de l'AGP, il possède une camionnette pourrie, son entreprise lui confie des missions absurdes, et il va transformer son outil de travail en l'une des armes les plus destructrices de la galaxie. Une identité originale et assumée, pas un shooter spatial générique.

---

## 2. Les règles de l'univers

- **La conquête spatiale** a été menée par des entreprises privées ; chaque planète est une zone économique avec ses infrastructures, sa sécurité et ses déchets. L'espace est une immense zone industrielle.
- **La pollution** n'est pas de la ferraille inerte : satellites militaires autonomes, réacteurs instables, robots industriels, armes abandonnées, machines qui tournent encore après la disparition de leurs propriétaires. Certaines décharges sont des écosystèmes mécaniques hostiles.
- **Pourquoi les ennemis attaquent** : la plupart sont des systèmes automatisés qui protègent une propriété ou une installation ; la camionnette n'a aucune autorisation, elle est donc toujours classée « intrusion ». D'autres sont envoyés pour empêcher le joueur de découvrir ce que cache l'AGP. Le joueur est un nettoyeur, mais **le jeu est avant tout un combat spatial** : les ennemis tirent, encerclent, poursuivent, chargent, jouent en groupe.
- **Les technologies démesurées** (gravité, champs d'énergie, réactions en chaîne) sont avancées mais inégalement réparties ; le joueur les récupère et les installe sur une camionnette qui n'aurait jamais dû les supporter. L'absurdité est voulue : l'univers doit **justifier des armes gigantesques**, sans réalisme scientifique.

---

## 3. Les personnages

### Le nettoyeur — Employé n° 0042
Personnage principal. Ordinaire, fatigué, il ne parle presque jamais. Il ne veut pas sauver la galaxie : il voudrait rentrer chez lui et être payé correctement. Il devient accidentellement l'un des pilotes les plus dangereux du système solaire, tout en gardant son statut de **technicien de nettoyage de catégorie C**.

### N.O.R.M.A. — assistante administrative embarquée
*Navigation, Organisation, Réglementation et Maintenance Automatisées (nom provisoire).* Intelligence artificielle fournie par l'AGP, intégrée au tableau de bord. Narratrice, tutrice et interlocutrice du joueur.
- **Ton : froid, poli, sarcastique**, d'une politesse administrative insupportable. Courte, lisible d'un coup d'œil.
- Au départ elle défend l'entreprise ; peu à peu elle détecte des contradictions dans les données officielles. Cette évolution est un fil émotionnel de l'histoire.
- **Présence** : menus, début de mission, transitions, après les niveaux, et en mission à intervalles réguliers. **Jamais bloquante en combat** (moteur `src/ui/norma.js` : une transmission à la fois, 14 s d'écart, jamais pendant intro, cartes, pause ou écran de fin).
- Textes : `src/data/agp-lore.js` et la clé `norma` des JSON de niveau.

### L'AGP — l'employeur
Devise : **« Un univers propre est un univers rentable. »** Des milliers de véhicules de nettoyage, des stations de recyclage, une flotte de sécurité. Elle prétend défendre l'environnement spatial ; sur Mars, les volumes annoncés comme recyclés sont en réalité triés puis stockés. L'AGP a reçu les alertes de saturation et maintenu les transferts. Ses motivations générales et l'ampleur de cette pratique restent à définir.

### Le PDG
Dirigeant d'une entreprise indépendante de l'AGP, boss final du monde 1 (voir § 4). Aucun lien direct entre son affaire et l'intrigue de l'AGP sur Mars. Personnage de fiction : le jeu **ne nomme aucune personne réelle**. (La bible v1.0 prévoyait une parodie d'une personnalité réelle ; elle n'a pas été retenue et ne doit pas être réintroduite sans décision explicite et prudence.)

---

## 4. La campagne — version validée le 29 octobre 2026

La campagne commence en orbite basse terrestre, puis passe directement à Mars. Le monde 1 comporte un tutoriel et cinq niveaux, dont un dernier consacré au boss. Le monde 2 comporte cinq niveaux, dont un dernier consacré au boss, sans nouveau tutoriel. L'histoire reste légère : ennemis, environnements, petites découvertes et interventions courtes de N.O.R.M.A. Les révélations ne se répètent pas à chaque tentative.

### Monde 1 — Orbite terrestre : la tournée qui dégénère

Le nettoyage est habituellement sans danger. Pendant le tutoriel, certains satellites déclarés hors service tirent sur le joueur. Une entreprise a déclaré ses installations abandonnées, mais son propriétaire refuse leur démantèlement et maintient leur sécurité active. Le joueur poursuit simplement son ordre de nettoyage.

Le PDG dirige cette entreprise, **pas l'AGP**. Aucun lien direct, contrat secret, trafic commun ou document reliant son affaire à Mars. Sa défaite clôt une histoire autonome qui présente le métier, N.O.R.M.A. et les mécaniques.

| Niveau | Progression narrative | Adversaires / incident |
|---|---|---|
| Tuto — Prise de service | Déchets inertes, premiers tirs anormaux, alerte au réseau. | Satellites hors service, satellites de défense, drones relais ; Antenne-Mère. |
| 1 — Perturbations locales | Le réseau météo et ses patrouilles répondent à l'intrusion. Leur propriétaire est commun. | Satellites de défense, patrouilles, sondes météo, balises d'interception ; La Météo. |
| 2 — Récupération prioritaire | Les machines reprennent et réparent les débris. Le propriétaire a pourtant signé leur mise hors service. | Robots « Bras écartés », réparateurs, compacteurs, patrouilles ; Araignée de tri. |
| 3 — Mise hors tension | Le réacteur alimente toujours le secteur. Le PDG exige l'arrêt de l'intervention. | Pilleur de cristaux, confinement, réparateurs, tourelles, maintenance instable ; Le Réacteur. |
| 4 — Accès refusé | La sécurité privée verrouille l'accès aux bureaux et concentre ses forces. | Chasseurs, éclaireurs, intercepteurs, unités lourdes, protection, mines ; L'Anneau. |
| 5 — La direction vous reçoit | Courte approche puis affrontement avec le propriétaire. La tournée est clôturée. | PDG dans sa tour armée, escorte et vigiles. |

#### Bestiaire du tutoriel — référence

| Ennemi | But dans l'univers | Comportement | Apprentissage |
|---|---|---|---|
| Satellite hors service | Équipement abandonné destiné au nettoyage. | Immobile, sans tir, fournit des ressources à sa destruction. | Déplacement, destruction et collecte ; montrer une tournée normale. |
| Satellite de défense | Protège encore le matériel de son propriétaire. | Se déploie à l'approche du joueur, vise et tire un projectile lent avec préparation visible et intervalles généreux. | Surprise narrative et esquive simple. |
| Drone relais | Patrouille et transmet l'alerte au réseau. | Déplacement lent, projectiles simples ; apparaît d'abord seul. | Suivre une cible mobile ; comprendre l'organisation de la défense. |
| Antenne-Mère | Coordonne les communications et la défense locale. | Alterne salves simples et activation d'un petit groupe de satellites ; attaques annoncées et espacées. | Vérifie déplacement, esquive, tir et priorité des cibles. Dernier signal d'alerte avant destruction. |

#### N.O.R.M.A. — interventions de référence du monde 1

- Début du tuto : « Bonjour, employé 0042. Votre tournée commence en orbite basse. Comme hier. »
- Premier tir : « Ce satellite vient de vous tirer dessus. Ce n'est pas une étape de la procédure. »
- Antenne-Mère : « Cette antenne commande les autres. Vous avez trouvé le responsable local. »
- Fin du tuto : « Elle vient de transmettre un signal d'intrusion. Votre arrivée est désormais officielle. »
- Niveau 1 : « Ils partagent leurs données de ciblage. Les déchets font preuve d'un bel esprit d'équipe. »
- Niveau 2, réparateur : « Ce robot répare les autres. Vous pouvez continuer ainsi longtemps, ou commencer par lui. »
- Niveau 2, rapport : « Le propriétaire a signé leur mise hors service. Nos ordres sont corrects. Son matériel est moins coopératif. »
- Niveau 3, après la réclamation : « Le propriétaire est joignable. Il a attendu que vous touchiez à son alimentation. »
- Niveau 3, victoire : « Installation désormais hors service. Les documents ont enfin raison. »
- Niveau 4 : « Les patrouilles ont reçu de nouvelles consignes. Vous n'êtes plus un intrus. Vous êtes leur priorité. »
- Fin du niveau 4 : « Il reste une installation à traiter. Elle contient le propriétaire et l'essentiel de son mécontentement. »
- PDG : « Vous avez détruit mes satellites, mes machines et mon réacteur ! » N.O.R.M.A. : « Il suit correctement votre progression. »
- Victoire finale : « Zone nettoyée. Une réclamation client reste ouverte. »
- Affectation suivante : « Nouvelle affectation : Mars. Déchets industriels et machines de traitement. »

### Monde 2 — Mars : planète poubelle

Nouvelle affectation professionnelle, indépendante de l'affaire du PDG. Le joueur doit nettoyer les abords d'un ancien complexe de traitement. L'installation fonctionne toujours, mais ne fait plus ce qu'annoncent les rapports de l'AGP.

**Direction d'univers :** montagnes de carcasses, usines, robots et mécas lourds, câbles apparents, outils de manutention, métal usé et pièces de récupération. L'Adeptus Mechanicus de Warhammer 40,000 est une inspiration visuelle ; les noms, symboles et personnages restent propres au jeu. Pas de ferveur industrielle ni de religion des machines comme principe narratif. Les robots exécutent des programmes de tri, récupération, maintenance et défense.

**Ton :** industriel et menaçant. Les ennemis et les installations sont pris au sérieux. L'humour est ponctuel, principalement porté par N.O.R.M.A.

**Fil rouge :** les déchets déclarés recyclés s'accumulent sur Mars. Les robots les déplacent, les compactent et prélèvent des pièces pour maintenir l'usine en activité. Le joueur découvre ensuite que l'AGP est informée de la saturation. Le mécanisme précis des responsabilités au-delà de Mars reste ouvert.

#### Niveau 1 — Zone de déchargement

**Mission :** dégager une zone d'arrivée encombrée pour permettre la reprise des livraisons.

Montagnes de ferraille, conteneurs éventrés et carcasses de vaisseaux. Certaines machines travaillent sans réagir au joueur ; lorsqu'il commence à détruire le matériel, elles le classent comme une menace pour le déchargement.

| Mob | Comportement | Rôle |
|---|---|---|
| Drone de manutention | Déplacement lent et projectiles simples. | Ennemi de base. |
| Découpeur mobile | Charge annoncée avec ses outils. | Force les déplacements. |
| Unité de surveillance | Tire à distance pendant l'approche des machines. | Maintient une menace à distance. |

**Petit boss : LE DÉCHARGEUR.** Plateforme blindée avec bras mécaniques, projections de débris et balayages annoncés.

**Découverte :** la zone aurait dû être vidée, mais reçoit toujours des cargaisons.

**N.O.R.M.A. :**
- Départ : « Zone annoncée dégagée. Les images indiquent le contraire. »
- Première attaque : « Les machines protègent le déchargement. Nous sommes devenus un obstacle. »
- Après le boss : « Des livraisons sont encore programmées. Il n'y a plus de place depuis plusieurs années. »

#### Niveau 2 — Matière première

**Mission :** dégager les accès de la chaîne de tri.

Convoyeurs, presses et portiques prélèvent les éléments utiles ; le reste retourne en décharge. La camionnette est identifiée comme un véhicule récupérable et les robots cherchent à la démonter.

| Mob | Comportement | Rôle |
|---|---|---|
| Drone de manutention | Tirs en accompagnement des machines de tri. | Maintient la pression. |
| Découpeur mobile | Approche ou charge au contact. | Menace rapprochée connue. |
| Mécano de récupération | Répare les unités voisines. | Cible prioritaire. |
| Presse blindée | Avance lentement, attaque devant elle après préparation. | Occupe l'espace. |

**Petit boss : LE DÉSOSSEUR.** Méca de démantèlement avec pinces et scies ; alterne saisies et attaques d'outils sans accumulation illisible de dangers.

**Découverte :** les cargaisons servent à réparer les machines et à fabriquer leurs pièces de rechange.

**N.O.R.M.A. :**
- Identification : « Votre véhicule vient d'être accepté au recyclage. Je demande une correction. »
- Réparateur : « Cette unité remet les autres en état. Commencez par elle. »
- Rapport : « Les pièces récupérées alimentent la maintenance de l'usine. Le reste repart en décharge. »

#### Niveau 3 — Stockage définitif

**Mission :** neutraliser des déchets dangereux dans une zone de confinement.

Réservoirs, réacteurs déposés, conteneurs militaires et mécas lourdement blindés. N.O.R.M.A. compare les identifiants de cargaisons portant les marquages AGP aux registres.

| Mob | Comportement | Rôle |
|---|---|---|
| Unité de confinement | Salves en éventail. | Réduit les passages. |
| Citerne mobile instable | Approche puis explose après avertissement. | Impose la distance. |
| Mécano de récupération | Répare les unités lourdes. | Priorité de tir. |
| Sentinelle industrielle | Prépare un tir puissant sur un axe indiqué. | Menace à distance. |

**Petit boss : LE GARDIEN DE CONFINEMENT.** Machine blindée d'isolement des cargaisons ; barrières temporaires et décharges annoncées.

**Découverte :** des conteneurs intacts sont enregistrés comme détruits ou recyclés. Premier indice concret concernant l'AGP, sans encore établir qui a falsifié les rapports.

**N.O.R.M.A. :**
- « Ce numéro de cargaison figure dans nos archives. Traitement terminé, il y a neuf ans. »
- « Deuxième correspondance. Ce n'est pas une erreur isolée. »
- Rapport : « Les déchets sont toujours ici. Les certificats, eux, sont validés. »

#### Niveau 4 — Maintien en activité

**Mission :** rétablir l'accès au centre de supervision.

Secteur mieux entretenu, robots moins dégradés, défenses organisées et alimentation stable. Les zones extérieures débordent tandis que leur centre de supervision fonctionne correctement.

| Mob | Comportement | Rôle |
|---|---|---|
| Sentinelle industrielle | Tirs préparés derrière les unités lourdes. | Menace à distance. |
| Méca de sécurité | Avance lentement et tire plusieurs salves. | Menace persistante. |
| Drone de protection | Protège temporairement une unité voisine. | Cible prioritaire. |
| Découpeur mobile | Charge entre les salves. | Exploite les déplacements du joueur. |
| Poseur de balises | Dépose des dangers armés après délai visible. | Limite les trajectoires. |

**Petit boss : LE CONTREMAÎTRE.** Méca de supervision commandant des renforts limités ; leur élimination ouvre des fenêtres d'attaque.

**Découverte :** l'usine a transmis des alertes de saturation à l'AGP. Elles ont été reçues, mais les livraisons ont continué.

**N.O.R.M.A. :**
- « Ce secteur bénéficie toujours de maintenance. Les équipements abandonnés sont ailleurs. »
- « L'usine a signalé sa saturation. L'AGP a accusé réception. »
- Rapport : « Les transferts ont continué après l'alerte. Je conserve une copie de ces échanges. »

#### Niveau 5 — Traitement en cours

**Objectif :** atteindre le centre de supervision et arrêter les machines bloquant l'intervention. Courte approche, puis combat principal.

**Boss : LE DIRECTEUR DE TRAITEMENT.** Système de contrôle installé dans une immense machine industrielle. Il considère la destruction de ses équipements comme une interruption de production et tente d'intégrer la camionnette au traitement.

| Séquence | Attaque | Réponse attendue |
|---|---|---|
| Inspection | Balayage puis tirs ciblés. | Se déplacer après le verrouillage. |
| Démantèlement | Bras et outils sur des zones annoncées. | Lire les ouvertures. |
| Maintenance | Quelques réparateurs restaurent ses systèmes. | Changer temporairement de cible. |
| Surcharge | Combinaison accélérée d'attaques connues. | Réutiliser les apprentissages. |

**Renforts :** manutention, découpeurs et réparateurs ; aucune nouvelle famille pendant le combat final.

**Révélation :** le centre considère une cargaison comme « traitée » dès qu'elle a été triée et transférée en stockage. Les rapports de l'AGP présentent ces mêmes volumes comme recyclés. Cette anomalie est établie ; le complot galactique, ses responsables et son objectif ne sont pas encore révélés ni fixés.

**N.O.R.M.A. :**
- Entrée : « Le centre refuse notre accès. Il commande également toutes les machines encore actives. »
- Réparateurs : « Les unités de maintenance prolongent le combat. Éliminez-les. »
- Victoire : « Ici, “traité” signifie déplacé vers une autre zone. »
- Rapport : « Dans nos bilans, ces mêmes cargaisons sont déclarées recyclées. »

**Fin du monde 2 :** intervention terminée, accès aux données ouvert, preuves conservées par N.O.R.M.A. Destination suivante et réaction de l'AGP à décider.

### Mise en scène et statut technique

N.O.R.M.A. intervient dans les menus et en mission dès le début du jeu : conseils, astuces, piques et intrigue. Une découverte narrative passe une seule fois ; les tentatives suivantes utilisent des variantes de combat. Les messages restent courts et non bloquants.

Les mobs et patterns ci-dessus définissent une intention de conception validée dans la conversation. Ils ne prouvent pas leur implémentation : confronter chaque comportement au code avant toute modification. Les anciens mondes lunaires, la place de Mars en monde 3 et les révélations ultérieures sont remplacés ou remis à définir.

---

## 5. Le bestiaire — principes

Pas de nouvelle famille d'ennemis par secteur : on **réutilise les comportements** avec d'autres apparences, armes, résistances et compositions de vagues. Un secteur se distingue par sa composition, pas par plus de PV et de dégâts.

| Rôle | Comportement | Utilité |
|---|---|---|
| Drone standard | tire régulièrement, en groupe | la masse |
| Kamikaze | fonce et explose | force les déplacements |
| Sniper | prépare un tir puissant | surveiller les trajectoires |
| Unité lourde | résiste, tire des salves | menace persistante |
| Réparateur | soigne ou protège | cible prioritaire |
| Poseur de mines | installe des dangers | restreint les trajectoires |
| Unité mère | produit des ennemis | augmente la pression |

**Règle fondamentale du combat** : plus la partie avance, plus l'écran est spectaculaire (explosions en chaîne, perforations, essaims, électricité, trous noirs) — **mais la lisibilité des projectiles dangereux et des attaques annoncées par les boss est prioritaire.** Le joueur doit sentir sa camionnette passer d'un véhicule ridicule à une machine de destruction démesurée.

---

## 6. Progression et économie dans l'univers

- **Composants ◆** : récupérés sur les machines détruites (aimantés en mission), ils financent les recherches et transformations du véhicule. Valeur technologique du nettoyeur, **pas son salaire**. Un rapport de mission ajoute une **prime AGP** (moitié des primes du niveau) en victoire, et une **franchise d'accident** de 30 % en défaite ou abandon.
- **L'atelier** : six postes de camionnette (coque, canon de série, générateur de bouclier, propulseurs, aimant, ordinateur de bord), de Mk I à V, achetés en composants (Mk III à V exigent aussi des pièces de secteur). Atouts **globaux et permanents**.
- **Le catalogue R&D** (ex-arbre de compétences) : plans, connaissances et technologies découverts. La 1re victoire d'un ordre accorde un **plan** ; ensuite prototype, rangs, spécialisation.
- **Le garage et ses baies** : le joueur choisit les technologies à emporter ; une baie au départ, plus une par incident majeur vaincu (cinq au plus ; une seule ARME et une seule RAMPE de missiles par chargement). La camionnette ne peut pas tout embarquer.
- **Les cartes en mission** (roguelite) : les technologies emportées **ne fonctionnent pas au départ** ; il faut les **assembler** pendant l'ordre grâce aux ressources récupérées (cartes « ASSEMBLAGE », améliorations, fusions, reliques). Les cristaux d'expérience servent à cette progression temporaire ; les composants persistent entre les missions.
- **Défaite** : le système de secours ramène ce qui reste de la camionnette au garage. Les technologies de mission sont à réassembler, mais recherches et plans restent acquis. Pour l'AGP, c'est un **accident du travail sans indemnisation**.
- **Deux familles d'atouts, toujours distinctes** : globaux (atelier) et de mission (cartes, fusions, reliques).

---

## 7. Le ton, l'interface et les dialogues

**Registre** : science-fiction rétro et industrielle ; humour noir et absurdité administrative ; satire du monde du travail ; entreprise dystopique obsédée par la productivité ; action arcade démesurée. Une entreprise ultra-bureaucratique qui dispose de technologies extraordinaires mais fournit du matériel obsolète à ses employés. **L'humour est subtil, parfois absurde, jamais une caricature illisible.** Il vit dans les détails ; la mise en page reste claire et les récompenses lisibles.

**L'interface est le logiciel de bord de l'AGP (AGP-OS)** : terminaux industriels rétrofuturistes, logiciels professionnels vieillissants, indicateurs de sécurité / rendement / maintenance, identité d'entreprise cohérente, écrans d'une entreprise gigantesque et impersonnelle. Pas un menu futuriste générique. Elle reste séduisante, vivante, immédiatement compréhensible, agréable au tactile.
- **Accueil en trois sections** : l'**atelier** (le hangar bricolé de l'employé, la camionnette au centre), la **carte des secteurs** (affectations envoyées par l'AGP, carte stellaire conservée), le **catalogue R&D**.
- **Interface vivante, mais subtile** : transmissions, notifications d'entreprise, indicateurs de maintenance, messages administratifs absurdes. Ne pas surcharger.
- **HUD en combat** : intégré aux systèmes de bord ; **lisibilité et fluidité absolument prioritaires** (pas de cadres massifs ni de panneaux opaques sur les ennemis ; tactile ; toutes tailles d'écran). On peut renommer des informations avec le vocabulaire AGP sans toucher à leur fonctionnement.
- **Rapport d'intervention** : compte rendu professionnel (ennemis neutralisés, composants récupérés, durée, évaluation de la performance, commentaire de N.O.R.M.A.).
- **Textes d'ordres** : `AGP_LORE.files` dans `src/data/agp-lore.js` (numéro et note de service par ordre), types d'ordre (FORMATION OBLIGATOIRE, MAINTIEN EN POSTE, NEUTRALISATION, RECUPERATION, INCIDENT MAJEUR).

**Dialogues** : très courts, pour ne jamais interrompre le plaisir du combat ; le meilleur humour naît du contraste entre l'événement spectaculaire et le langage administratif.

| Moment | Exemple |
|---|---|
| Début de mission | « Rappel : votre équipement est assuré. Vous ne l'êtes pas. » |
| Première résistance | « Une légère résistance a été détectée. Merci d'éviter toute escalade. » |
| Vague massive | « Vous semblez rencontrer une difficulté mineure. Avez-vous essayé de redémarrer votre véhicule ? » |
| Défaite | « Votre décès potentiel n'entre pas dans le cadre de nos garanties. » |
| Victoire sur un boss | « Excellent travail. Votre productivité a augmenté de 4 700 %. Votre salaire reste inchangé. » |
| Recherche débloquée | « Cette modification annule immédiatement la garantie constructeur. » |
| Secret découvert | « Ce document est confidentiel. Je vais faire comme si vous ne l'aviez pas lu. » |

---

## 8. Les piliers à ne jamais perdre

1. **C'est d'abord un shooter** : beaucoup d'ennemis, des tirs, des explosions, une montée en puissance spectaculaire.
2. **Le héros est ordinaire** : sa camionnette et son travail restent ridicules face à l'ampleur des événements.
3. **L'histoire accompagne l'action** : le lore se découvre par petites touches, sans cinématiques envahissantes.
4. **Chaque secteur est différent** : environnement, faction, patterns, boss et technologies forment un ensemble cohérent.
5. **La satire reste présente** : entreprises, procédures et absurdités administratives font l'identité humoristique.
6. **Les armes sont volontairement démesurées** : la cohérence de l'univers sert cette montée en puissance, jamais ne la limite.
7. **Lisibilité du combat d'abord** (projectiles dangereux, attaques de boss annoncées).

---

## 9. Statut de la version 2.0

**Validé narrativement :** départ en orbite basse ; tutoriel et cinq niveaux au monde 1 ; PDG extérieur à l'AGP ; histoire du monde 1 autonome ; Mars directement au monde 2 ; cinq niveaux martiens, mobs, incidents, révélations et interventions décrits au § 4 ; inspiration industrielle des mécas ; humour modéré ; N.O.R.M.A. présente en mission et dans les menus.

**À définir :** monde 3 et suivants, réaction de l'AGP, responsables de la falsification, ampleur du système, évolution de N.O.R.M.A. et conclusion de campagne. Les anciennes propositions sur ces points ne sont pas automatiquement validées.

**À vérifier dans le code :** implémentation des ennemis, attaques, niveaux, dialogues et paramètres économiques. Les sections techniques conservées de la bible fournie décrivent son état déclaré au 28 octobre ; elles n'ont pas fait l'objet d'un nouvel audit. Aucune mécanique n'est modifiée par l'enregistrement de cette version.
