# Space Shooter X — catalogue des effets sonores (nouvelle bibliothèque)

**110 sons** (105 mesurés comme tous distincts + 5 ajoutés ensuite, non mesurés) (mesuré sur chacun d'eux rendu séparément : aucune paire ne dépasse 90 % de ressemblance, selon une mesure qui compare le spectre, la forme du volume et la durée ; au départ, des paires atteignaient 99 %). Chaque son est limité (anti-mitraillage), placé à gauche ou à droite quand il vient d'un ennemi, et ramené à un niveau cohérent selon sa catégorie (les plus gros événements environ 27 dB sous le maximum, les petits sons répétés environ 37 dB, l'interface 38 dB).

Pour me dire « tel son ne va pas », donne-moi son **nom** (colonne de gauche).


## TIRS ET ARMES DU JOUEUR

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `laser` | tir principal (un peu plus aigu avec le niveau d'arme) | 0.06 s | -40 dB |
| `missile` | lancement d'un missile guidé | 0.29 s | -34 dB |
| `swarmMissile` | salve de mini-missiles (trois « pff ») | 0.15 s | -33 dB |
| `droneShot` | le drone tire | 0.09 s | -38 dB |
| `lightning` | éclair en chaîne qui saute d'ennemi en ennemi | 0.17 s | -33 dB |
| `thunder` | TONNERRE : la foudre frappe (craquement puis grondement) | 0.80 s | -27 dB |
| `pulsar` | PULSAR : onde qui efface les tirs ennemis | 0.59 s | -32 dB |
| `blackHole` | TROU NOIR : aspiration grave et tourbillonnante | 0.92 s | -27 dB |
| `bounce` | REBOND : un tir rebondit sur le côté | 0.03 s | -39 dB |
| `slowField` | CHAMP LENT : un tir ennemi est ralenti | 0.34 s | -37 dB |
| `bombDrop` | un bombardier lâche une bombe (sifflement qui tombe) | 0.41 s | -37 dB |
| `bombBoom` | la bombe explose | 0.36 s | -27 dB |
| `nuke` | lancement du missile nucléaire (grondement + alarme) | 0.80 s | -27 dB |
| `nukeBoom` | explosion nucléaire | 1.12 s | -26 dB |
| `galaxyBlast` | explosion galactique (grand balayage) | 1.10 s | -27 dB |
| `reflect` | bouclier réfléchissant : ping métallique | 0.21 s | -37 dB |
| `dodge` | esquive du joueur (souffle) | 0.12 s | -40 dB |
| `odCharge` | l'overdrive se charge (scintillement) | 0.10 s | -38 dB |
| `odEnd` | fin de l'overdrive (chute de puissance) | 0.38 s | -32 dB |
| `overdrive` | activation de l'overdrive | 0.43 s | -28 dB |

## IMPACTS

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `hitEnemy` | un tir touche un ennemi | 0.04 s | -41 dB |
| `hitHeavy` | un tir touche une pièce de boss (plus sourd) | 0.11 s | -37 dB |
| `shieldHit` | le bouclier d'un ennemi encaisse (tink métallique) | 0.05 s | -39 dB |
| `shieldBreak` | un bouclier se brise (verre qui éclate) | 0.36 s | -31 dB |
| `decoyPop` | un leurre de l'Éclipse éclate (bulle) | 0.10 s | -38 dB |
| `rock` | une météorite se brise (plus aiguë quand elle est petite) | 0.12 s | -38 dB |
| `tentacleCut` | une boule de bras du Kraken est coupée | 0.13 s | -32 dB |
| `partBreak` | une pièce de boss est détruite | 0.30 s | -28 dB |

## EXPLOSIONS (de la plus petite à la plus grosse)

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `boomSmall` | petit ennemi (essaim, drone, diviseur...) | 0.07 s | -37 dB |
| `boomMed` | ennemi moyen | 0.17 s | -32 dB |
| `boomBig` | gros ennemi (tank, élite, bombardier, vaisseau-mère) | 0.50 s | -27 dB |
| `kamikazeBoom` | explosion du kamikaze (sifflement qui tombe + boum) | 0.30 s | -28 dB |
| `mineBoom` | explosion de mine (sourde et étouffée) | 0.50 s | -27 dB |
| `strikeWarn` | BOMBARDEMENT : sifflement d'annonce | 0.81 s | -33 dB |
| `strikeBoom` | BOMBARDEMENT : l'impact | 0.59 s | -28 dB |

## ACTIONS DES ENNEMIS

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `enemyShot` | tir ordinaire (très discret, placé à gauche ou à droite selon l'ennemi) | 0.07 s | -38 dB |
| `heavyShot` | tir lourd (canon grave) | 0.19 s | -37 dB |
| `spreadShot` | tir en éventail (trois souffles) | 0.13 s | -44 dB |
| `snipeCharge` | le sniper (ou la Faucheuse) vise : montée de tension | 0.64 s | -31 dB |
| `snipeShot` | coup de sniper | 0.14 s | -32 dB |
| `healerPulse` | le healer soigne (accord scintillant) | 0.53 s | -31 dB |
| `webShoot` | l'araignée lance sa toile | 0.13 s | -39 dB |
| `mineDrop` | une mine est posée (deux bips) | 0.14 s | -37 dB |
| `kamiCharge` | le kamikaze se prépare (sirène qui monte) | 0.38 s | -34 dB |
| `motherCharge` | le vaisseau-mère charge (ronronnement grave) | 0.83 s | -31 dB |
| `goldenSpawn` | un Trésorin apparaît (arpège scintillant) | 0.28 s | -32 dB |

## RECOMPENSES ET PROGRESSION

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `gem` | cristal d'XP ramassé | 0.07 s | -39 dB |
| `gemBig` | gros cristal | 0.19 s | -37 dB |
| `heal` | soin ramassé | 0.51 s | -31 dB |
| `jackpot` | Trésorin abattu : cascade de pièces | 1.23 s | -28 dB |
| `levelup` | niveau gagné (fanfare) | 0.49 s | -28 dB |
| `achievement` | succès débloqué (cloches) | 0.70 s | -31 dB |
| `relicOpen` | reliques / ascension / renaissance du phénix (accord mystérieux) | 1.04 s | -27 dB |
| `cardsOpen` | les cartes d'amélioration apparaissent | 0.20 s | -34 dB |
| `cardPick` | carte choisie | 0.15 s | -32 dB |
| `reroll` | cartes relancées (dés) | 0.16 s | -36 dB |
| `skillBuy` | compétence achetée dans l'arbre | 0.25 s | -32 dB |
| `pactSign` | pacte signé | 0.27 s | -32 dB |
| `bank` | combo encaissé (tiroir-caisse) | 0.39 s | -31 dB |
| `comboTick` | combo qui monte | 0.09 s | -39 dB |
| `rankUp` | rang de combo gagné | 0.21 s | -32 dB |

## LE JOUEUR

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `hurt` | dégâts sur la coque | 0.18 s | -32 dB |
| `hurtShield` | dégâts absorbés par le bouclier | 0.17 s | -33 dB |
| `heartbeat` | battement de cœur | 0.39 s | -36 dB |
| `lastStand` | DERNIER SOUFFLE | 0.76 s | -26 dB |
| `dodgeEnemy` | un ennemi esquive | 0.08 s | -40 dB |
| `playerDeath` | destruction du vaisseau | 1.08 s | -27 dB |
| `gameover` | écran de fin (trois notes qui descendent) | 1.37 s | -27 dB |
| `launch` | décollage (souffle qui monte) | 0.77 s | -31 dB |
| `apex` | sommet du décollage (floraison d'énergie) | 0.43 s | -32 dB |
| `landing` | atterrissage du vaisseau | 0.24 s | -32 dB |

## BOSS

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `bossAlert` | arrivée d'un boss (sirène à trois notes) | 0.83 s | -28 dB |
| `doubleBoss` | DOUBLE BOSS (deux cors désaccordés) | 1.07 s | -27 dB |
| `alertUp` | montée du niveau d'alerte | 0.39 s | -31 dB |
| `phaseUp` | changement de phase | 0.41 s | -28 dB |
| `secondForm` | seconde forme (rugissement) | 1.35 s | -27 dB |
| `bossDown` | boss vaincu (explosion + victoire) | 0.92 s | -27 dB |
| `mirageOn` | Éclipse : début du mirage | 0.43 s | -33 dB |
| `mirageOff` | Éclipse : fin du mirage | 0.80 s | -32 dB |
| `regrow` | une tête d'Hydre repousse (gargouillis) | 0.29 s | -32 dB |
| `waveAlarm` | vague de météorites de 8:30 | 1.10 s | -27 dB |
| `beamCharge` | Prisme : le faisceau se charge | — | — |
| `beamFire` | Prisme : le faisceau tire | — | — |

## EVENEMENTS (un signal propre à chacun)

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `evCrystal` | pluie de cristaux | 0.36 s | -32 dB |
| `evMeteors` | tempête de météorites | 0.69 s | -32 dB |
| `evSwarm` | marée d'essaims (bourdonnement) | 0.48 s | -32 dB |
| `evMines` | champ de mines (trois bips + thump) | 0.61 s | -31 dB |
| `evGold` | ciel de Trésorins | 0.67 s | -31 dB |
| `evKamikaze` | escadron kamikaze (sirène) | 0.53 s | -32 dB |
| `evSpiders` | forêt d'araignées (cliquetis) | 0.45 s | -32 dB |
| `evElite` | escorte d'élites (cor + caisse claire) | 0.44 s | -32 dB |
| `evBombard` | bombardement (sirène d'alerte) | 1.00 s | -31 dB |
| `evFrenzy` | frénésie (moteur qui s'emballe) | 0.53 s | -32 dB |
| `evFlip` | écran retourné (souffle à l'envers) | 0.62 s | -32 dB |
| `evMagnet` | tempête magnétique (ronronnement qui monte) | 0.72 s | -31 dB |

## INTERFACE

| Son | Quand | Durée | Niveau |
|---|---|---|---|
| `uiClick` | clic ordinaire | 0.03 s | -40 dB |
| `uiStart` | JOUER / CONTINUER / REJOUER | 0.19 s | -38 dB |
| `uiBack` | RETOUR / quitter | 0.06 s | -39 dB |
| `uiOpen` | ouvrir un menu (arpège montant) | 0.14 s | -38 dB |
| `uiToggle` | interrupteur son / musique | 0.07 s | -38 dB |
| `uiPage` | changer de page (bruit de papier) | 0.06 s | -45 dB |
| `uiSelect` | sélectionner une icône | 0.09 s | -38 dB |
| `uiError` | action refusée | 0.24 s | -38 dB |
| `uiPause` | pause | 0.13 s | -39 dB |
| `uiResume` | reprise | 0.13 s | -39 dB |
## AJOUTS RECENTS (non mesurés)

| Son | Quand |
|---|---|
| `alertAlarm` | le niveau d'alerte monte (alarme, varie avec le niveau `lv`) |
| `nebulaWarn` | une nébuleuse approche |
| `nebulaEnter` | tu entres dans le nuage |
| `nebulaExit` | tu en ressors |
| `evNebula` | signal de l'événement NEBULEUSE (défini dans la bibliothèque, pas encore appelé directement dans le code) |

## SONS ENREGISTRES (fournis par Bio, remplacent la version synthétique)

| Son | Prises | Passage gardé | Niveau de crête |
|---|---|---|---|
| `laser` | 1 | 0,02 à 0,24 s du fichier (hauteur selon le palier d'arme) | 0,16 |
| `lightning` | 1 | 0,10 à 0,62 s | 0,34 |
| `missile` | 2 | les deux lancements du fichier, 0,8 s chacun | 0,30 |
| `swarmMissile` | 1 | 0,05 à 0,78 s | 0,20 |
| `droneShot` | 1 | 0,27 à 0,70 s | 0,14 |
| `pulsar` | 1 | la partie tremblante, 0,25 à 1,15 s | 0,14 |
| `thunder` | 1 | craquement + grondement, 0,55 à 3,45 s | 0,30 |
| `blackHole` | 1 | le balayage montant, 0 à 1,16 s (le reste du fichier était du silence) | 0,25 |
| `bounce` | 3 | trois rebonds isolés de la séquence (1 au hasard à chaque fois) | 0,10 |

Dans le jeu, chaque son varie un peu de hauteur (±5 %). Pour changer un niveau : valeur `pk` dans `SFX_FILES`.


## SONS ENREGISTRES — lot 2 (17 fichiers + odEnd)
Remplacent la version synthétique du même nom. Niveaux (pk) réglés à l'oreille, à ajuster selon tes retours.
| Son | Durée | Remarque |
|---|---|---|
| bombBoom | 2.0 s | queue 0.9 s |
| nukeBoom | 3.3 s | |
| nuke | 3.7 s | |
| galaxyBlast | 2.6 s | |
| reflect | 0.75 s | |
| dodge | 1.0 s | attaque douce |
| odCharge | 1.2 s | |
| overdrive | 1.85 s | |
| hitEnemy | 0.21 s | (fichier « hitEnnemy ») |
| hitHeavy | 0.5 s | |
| shieldHit | 0.41 s | |
| shieldBreak | 1.56 s | |
| decoyPop | 0.47 s | |
| rock | 1.75 s | |
| tentacleCut | 0.46 s | |
| partBreak | 0.97 s | |
| bombDrop | 1.28 s | |
| odEnd | 1.2 s | odCharge à l'envers, volume décroissant |

slowField : pas de fichier reçu, reste synthétique.

## SONS ENREGISTRES — lot 3 (14 fichiers)
boomMed, boomBig, kamikazeBoom, mineBoom, strikeWarn, strikeBoom, heavyShot (fichier « heavyshot »), enemyShot, spreadShot, snipeShot (fichier « sniperShot »), snipeCharge (fichier « sniperCharge »), healerPulse, webShoot, boomSmall.
Éclairs (lightning) : niveau baissé de 0.34 à 0.13.
Lots 2 et 3 compressés en mp3 mono 24–32 kbps pour tenir sous 16 Mo.

## SONS ENREGISTRES — lot 4
kamiCharge, motherCharge, goldenSpawn (niveau bas, 0.10), gemBig, gem, mineDrop. Lot 1 recompressé en 32 kbps pour regagner de la place.
