# SPACE SHOOTER X — Analyse équilibrage, cohérence et pouvoir addictif

Basée sur le build v144 et sur le document `space-shooter-x-gameplay.md`.

## 0. Ce que cette analyse est, et ce qu'elle n'est pas

- C'est une **analyse du code et des formules**, avec quelques calculs que j'ai faits sur les courbes. Je n'ai **pas** de données de joueurs réels, ni de durées de run mesurées sur téléphone. Mes tests automatiques utilisent un bot, qui ne joue pas comme un humain.
- Je peux donc juger la **structure** (courbes qui explosent, murs, incohérences, boucles de récompense). Je ne peux **pas** dire « la run dure 11 minutes en moyenne » ni « 40 % des joueurs reviennent le lendemain ».
- Chaque point ci-dessous est classé : **[Fait]** (lu ou calculé dans le code), **[Inférence]** (déduction raisonnable) ou **[À mesurer]** (je ne peux pas trancher sans jouer).

---

## 1. Verdict en 30 secondes

| Axe | Note | Pourquoi |
|---|---|---|
| **Fondations de la boucle** | Solide | Boucle courte (boss toutes les 45-90 s), choix à chaque niveau, méta-progression claire, événements variés. Elle ressemble aux jeux « une partie de plus ». |
| **Équilibrage** | Fragile | Plusieurs courbes sont exponentielles sans contrepartie claire, et un mur très net apparaît vers l'alerte 8. Des plafonds restent dans le code malgré ta règle. |
| **Cohérence** | Bonne, avec quelques trous | Quelques textes qui se contredisent, des récompenses de boss qui s'épuisent, un boss final inatteignable. Rien de bloquant. |
| **Pouvoir addictif** | Bon potentiel, sous-exploité | Les ingrédients sont là (combo, jackpots, quasi-réussites, succès). Il manque de la variété entre les runs et des objectifs à court terme. |

La chose la plus importante : **le jeu est riche, mais sa difficulté repose sur des chiffres qui grimpent plus vite que la puissance du joueur dès l'alerte 8**. Je détaille en section 2.

---

## 2. Équilibrage

### 2.1 Les courbes qui explosent

**[Fait]** Voici ce qui grandit, et à quelle vitesse :

| Élément | Formule | Ordre de grandeur |
|---|---|---|
| PV des ennemis (mobs) | `(1 + 0,2 × palier) × 1,035^max(0, palier − 30) × (1 + 0,15 × (alerte − 4))` | ×11 à 10 min / alerte 8, ×32 à 15 min / alerte 10, ×80 à 20 min / alerte 12, ×370 à 30 min / alerte 14 |
| Dégâts ennemis | `(1 + 0,10 × (alerte − 1)) × (1 + 0,4 × min(1, t/600)) × 1,03^((t − 600)/60)` | ×2,4 à 10 min, ×4 à 20 min, ×5,8 à 30 min |
| XP pour monter de niveau | `×1,32 + 4` à chaque niveau | niveau 10 : 247 XP, niveau 20 : 4 158, niveau 30 : 67 000, niveau 40 : 1,1 million, niveau 50 : 17 millions |
| Cadence de tir ennemie | `0,25 × 0,93^(alerte − 10,1)` au-delà de l'alerte 10, **sans plancher** (sauf 60 ms par ennemi) | −7 % de délai par niveau |
| Vitesse des tirs ennemis | `+3,5 %` par alerte au-dessus de 6 | ×1,3 à l'alerte 15 |

(Le palier est `floor(secondes/20) + boss vaincus` ; j'ai calculé avec le temps seul, donc les valeurs réelles sont un peu plus hautes.)

**Ce que je lis :**
- **[Inférence]** Les PV ennemis suivent une exponentielle (1,035 par palier de 20 s, soit +11 % par minute après 10 min). Le niveau du joueur, lui, devient **exponentiellement plus long** à gagner (×1,32 par niveau). Tant que le XP gagné par minute ne grimpe pas aussi vite, le joueur reçoit de moins en moins de cartes alors que les ennemis deviennent de plus en plus solides. C'est un **mur voulu** (« mur de fin de partie »), mais il faut savoir **où** il tombe et que ça reste lisible pour le joueur.
- **[Fait]** Les gains de puissance gratuits par niveau sont petits : +1,2 % de dégâts, +0,6 % de cadence, +2 PV. Au niveau 40, ça fait ×1,6 de dégâts, ce qui est faible face aux ×80 de PV à 20 min. Toute la puissance doit donc venir des **cartes** (+20 % dégâts, +18 % cadence, +1 projectile…), ce qui est possible puisqu'elles sont illimitées.
- **[À mesurer]** Je ne sais pas à quel moment le joueur type se fait rattraper. C'est la donnée numéro un à obtenir.

### 2.2 Les falaises dans la difficulté

**[Fait]** La table `BOSS_HP_BY_ALERT` ne progresse pas régulièrement :

| Alerte | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Multiplicateur | 1,3 | 2,1 | 2,8 | 4,2 | **11** | 22 | 40 | **103** | 162 | 231 |
| Saut par rapport au niveau précédent | — | ×1,6 | ×1,3 | ×1,5 | **×2,6** | ×2 | ×1,8 | **×2,6** | ×1,6 | ×1,4 |

Premier Dreadnought : environ 1 000 PV à l'alerte 1, 10 000 à l'alerte 5, **104 000 à l'alerte 8**, 240 000 à l'alerte 10, 890 000 à l'alerte 15.

**[Fait]** Et l'alerte 8 cumule **beaucoup de nouveautés en même temps** :
- boucliers visibles sur tous les mobs (avec régénération) ;
- seconde forme des boss ;
- les explosions blessent le joueur ;
- formations coordonnées de l'IA, qui commence à esquiver ;
- boss avec PV ×2,6 par rapport à l'alerte 7.

**[Inférence]** C'est le **point de rupture le plus probable** de l'expérience. Ce n'est pas forcément un défaut (c'est un « palier de contenu »), mais en l'état tout arrive d'un coup, ce qui donne une difficulté en marche d'escalier plutôt qu'en pente. L'alerte 5 a le même profil en plus petit (boucliers légers, palier d'arme 3, PV de boss ×2,6).

### 2.3 Deux chemins vers le même niveau d'alerte, deux difficultés très différentes

**[Fait]** Le niveau d'alerte peut monter de deux façons :
1. **Par l'arbre** (démarrer directement à l'alerte N) : les PV de boss suivent `BOSS_HP_BY_ALERT[N]`.
2. **Par le temps** (+1 toutes les 2 min en run) : les PV de boss reçoivent ×1,4 par niveau gagné pendant la run, sur la base de l'alerte de départ.

Exemple : un joueur qui démarre à l'alerte 1 et atteint l'alerte 8 après 14 min affronte un boss à `1,3 × 1,4^7 ≈ 13,7` de multiplicateur. Un joueur qui **démarre** à l'alerte 8 affronte `103`. **Écart d'un facteur 7,5** pour un même niveau affiché.

**[Inférence]** C'est cohérent seulement si l'arbre apporte vraiment ~7× plus de puissance entre ces deux situations. Or l'arbre complet donne beaucoup de petits bonus (+10 % dégâts, +6 % cadence…) mais peu de gros multiplicateurs. **Le joueur qui a investi 79 points pour démarrer à l'alerte 8 est sans doute puni plutôt que récompensé.** C'est la partie que je ferais valider en premier par une simulation.

### 2.4 Ce qui coûte, et ce que ça rapporte

**[Fait]** L'arbre complet coûte **7 656 fragments** (moyenne ~23 par point). Par branche : Défense 1 841, Utilitaire 1 977, Arme 1 598, Missile 887, Savoir 382, Furie 337, Gravité 364, Tempête 270. Fragments gagnés par run : `floor(score/15) × bonus`.

**[À mesurer]** Je ne connais pas le score moyen d'une run. Il faut estimer le nombre de runs nécessaires pour finir l'arbre : si c'est moins de 30, la méta se finit trop vite ; si c'est plus de 300, elle décourage.

**[Fait]** Le **niveau d'alerte de départ monte avec le nombre de points investis, peu importe lesquels**. Acheter des nœuds d'économie (XP+, aimant, fragments) rend donc le jeu plus dur sans rendre le vaisseau plus fort. **[Inférence]** C'est un piège pour les joueurs qui ne le savent pas, et ça pousse à prendre en priorité les nœuds de puissance. À assumer ou à signaler dans l'interface.

### 2.5 Puissance du joueur : ce qui domine

**[Fait]** Pool de cartes : 10 cartes, toutes illimitées, sans malus. Deux cartes sont proposées par niveau au départ (jusqu'à 5 avec INTUITION).

**[Inférence]** Sans conflit ni coût, **la stratégie optimale est probablement « empiler DEGATS+ et CADENCE+ et TIR MULTIPLE »**, parce qu'elles se multiplient entre elles. Les autres cartes (aimant, réacteurs, vitesse des tirs) sont peu attirantes face à elles. Le choix à chaque niveau est donc plus un réflexe qu'une décision, sauf pour les joueurs qui ont de l'INTUITION (plus de cartes).

### 2.6 Overdrive

**[Fait]** C'est une capacité très forte : invincibilité complète pendant 6 s, cadence +60 %, dégâts jusqu'à ×2 (+25 % par niveau de SURCHAUFFE), bouclier régénéré ×2.

**[Fait]** Les freins prévus : l'érosion pendant l'effet (jusqu'à −60 %), −8 % à chaque activation, charge ×0,68 par utilisation. Ils sont bien pensés. **Mais** :
- le commentaire du code annonce un plancher de ×0,15 sur la charge, qui **n'est pas appliqué** : la charge tend vers 0 sans jamais être bloquée, ce qui est plutôt bon, mais le texte et le code divergent ;
- la durée de base est **6 s** dans les stats et **5 s** dans la description de l'arbre ;
- l'extension par cellules est limitée à la durée maximale : pas d'invincibilité infinie. Bien.

### 2.7 Plafonds restants (contraires à ta règle)

**[Fait]** Voici ce qui borne encore le jeu, par ordre d'impact :

| Plafond | Valeur | Remarque |
|---|---|---|
| `BOSS_DMG_CAP` | ×3,5 sur les dégâts de boss | Les dégâts de boss cessent de monter alors que leurs PV explosent. |
| Armure de l'arbre | 60 % / 75 % / 80 % | Le cumul arbre + relique PHASE est borné à 80 %. |
| Cartes proposées | 5 maximum | Raisonnable pour l'écran. |
| Réactivité | 24 (fusion NITRO) | Prévu pour garder le contrôle. |
| `tierStep` PV de boss | 0,65 par boss | Plafonne la montée par palier de boss. |
| `ALERT_CAP` | 20 | Bloque le boss final prévu à l'alerte 26. |
| Hard caps ennemis / tirs / cristaux | 100 000 / 1 000 000 / 1 000 000 | Effectivement illimités. |

**[Inférence]** Le plafond de dégâts de boss est le plus discutable : passé l'alerte 10, un boss a 240 000 PV mais frappe au plus ×3,5. Le combat devient un duel d'endurance plutôt qu'un duel de danger.

### 2.8 Densité de tirs sans plancher

**[Fait]** Au-delà de l'alerte 10, la cadence de tir ennemie diminue de 7 % par niveau sans plancher, la vitesse des tirs augmente, et tu as demandé aucun plafond de tirs. À l'écran, ça peut devenir **mathématiquement non esquivable** pour un humain.

**[Inférence]** Le seul garde-fou est le ralentissement automatique quand plus de 500 tirs sont à l'écran. Il doit être pensé comme **une règle de design** (« le jeu devient un bullet hell »), pas seulement comme une protection de performance, sinon le mur de difficulté et le mur technique se confondent.

---

## 3. Cohérence

### 3.1 Incohérences repérées

| # | Constat | Gravité |
|---|---|---|
| 1 | **Boss final à l'alerte 26** alors que `ALERT_CAP = 20` : inatteignable. | Haute |
| 2 | **Récompenses de boss qui s'épuisent** : chaque boss n'a que 3 reliques, uniques par run. Au 2e passage d'un boss, il n'en reste que 2 ; au 4e, plus rien (il reste seulement les fusions et l'arme légendaire éligibles). Avec un boss toutes les 90 s, ça arrive vers la 30e minute, mais le joueur voit les choix se réduire bien avant. | Moyenne |
| 3 | **Durée d'overdrive** : 6 s dans les stats, 5 s dans la description de l'arbre. | Basse |
| 4 | **Plancher de charge d'overdrive** annoncé (×0,15) mais absent du code. | Basse |
| 5 | **LAME DU VENT** ajoute ses charges d'esquive à la scène, pas aux stats : elles fonctionnent mais n'apparaissent pas dans l'écran de stats. | Basse |
| 6 | **Alertes 16 à 20** : les boss reprennent le comportement du niveau 15 et leur table de PV est provisoire. | Moyenne |
| 7 | **Armes légendaires** verrouillées à deux endroits : il faut avoir payé 30 points dans l'arbre **et** gagner un boss. Un joueur sans ces 30 points ne voit jamais ces armes. | Moyenne |
| 8 | **Seconde forme** : le commentaire du code dit « alerte 4+ » mais la constante est à 8. Le comportement réel est 8. | Basse |
| 9 | **Succès** : l'explosion de chaîne est « permanente » et dépend de la mort de chaque type d'ennemi, mais certains types (golden, meteor, bosses) sont exclus ou particuliers. À documenter pour éviter les surprises. | Basse |

### 3.2 Choses qui sont cohérentes et qu'il faut garder

- **[Fait]** Le niveau d'alerte pilote presque tout (PV, dégâts, cadence, apparition des types, boucliers, IA, vitesse, XP des cristaux +12 %/alerte). C'est un **levier unique clair**.
- **[Fait]** La progression des ennemis est lisible : `t_effectif = secondes + 12 × (alerte − 1)` pour introduire les types, donc un joueur qui monte vite en alerte voit les ennemis vicieux plus tôt.
- **[Fait]** Les boss ont chacun une **identité** (pods, miroirs, tentacules, têtes, mirage, piqué) avec une règle différente pour les tuer. C'est un point fort.
- **[Fait]** Les événements empêchent la répétition entre deux boss et ne se déclenchent pas avant le premier boss (bonne introduction).

---

## 4. Pouvoir addictif

### 4.1 Ce qui joue déjà en ta faveur

| Mécanisme | Comment le jeu l'applique | Effet attendu |
|---|---|---|
| **Boucle courte** | Premier boss à 35 s, puis un toutes les 45-90 s | Un objectif toujours proche, sensation de progrès. |
| **Choix fréquents** | Une carte à chaque niveau, relique à chaque boss | Micro-décisions, sentiment de construire sa run. |
| **Récompense variable** | Trésorins, jackpots, cristaux bonus, critiques, armes légendaires | Le plaisir de « peut-être cette fois ». |
| **Combo et rang de style** | Rangs D à SSS, XP jusqu'à ×10 | Pousse à jouer risqué pour garder le combo. |
| **Quasi-réussites** | L'écran de fin affiche « le boss avait encore 12 % de PV », « presque : succès X 87 % » | Très efficace pour relancer une partie. |
| **Méta toujours utile** | Les fragments sont donnés même en cas d'échec | La mort n'est jamais une perte sèche, ce qui réduit la frustration. |
| **Collection** | Bestiaire, codex (reliques, cartes, fusions, compétences), succès en 3 paliers | Objectifs de long terme. |
| **Prestige** | Ascension : alerte +1, bonus permanents | Raison de rejouer après avoir fini l'arbre. |
| **Jus (feedback)** | Ralentis, flashs, secousses, sons, explosions en chaîne, bandeaux de phase | Chaque action est sentie. |
| **Variété situationnelle** | 23 événements aléatoires, 7 boss, 21 types d'ennemis | Moins de lassitude visuelle. |

### 4.2 Ce qui limite l'effet addictif

1. **[Inférence] Peu de variété entre deux runs.** Un seul vaisseau, une seule arène, peu de cartes (10), pas de synergies fortes entre cartes. Les runs se ressemblent vite. Les jeux de ce genre qui retiennent proposent des **builds très différents** (chaque arme change la façon de jouer).
2. **[Inférence] Arme légendaire trop tard et trop cher.** Les 3 armes (laser, laser auto, shotgun) sont les plus gros changements de jeu, mais elles demandent 30 points d'arbre puis un boss. Un nouveau joueur n'en voit aucune pendant ses premières heures.
3. **[Inférence] Pas d'objectif à court terme visible en dehors des runs.** Pas de missions du jour, pas de défi de la semaine, pas de série de connexions. Les succès sont à long terme.
4. **[Inférence] Pas de dimension sociale ou compétitive réelle.** Le classement est local. Un classement en ligne (ou au moins des comparaisons avec des amis, des « fantômes ») donne souvent une raison de rejouer.
5. **[Inférence] Mur de difficulté brutal à l'alerte 8** (voir 2.2) : si le joueur perd vite après des heures de progression, il risque de partir au lieu d'essayer à nouveau. Un mur **lisible** (le jeu dit pourquoi on a perdu) retient ; un mur **opaque** décourage.
6. **[Inférence] Récompenses de boss qui s'épuisent** (voir 3.1 point 2) : plus la run avance, moins le choix est excitant, au moment où la tension devrait être maximale.
7. **[À mesurer] Durée des runs.** Si une run « normale » dure plus de 15 min, c'est long pour un mobile ; si elle dure moins de 3 min, la méta ne se sent pas.
8. **[À mesurer] Premières minutes.** Le premier boss arrive à 35 s avec ~1 000 PV (alerte 1) : excellent pour accrocher. Mais le premier achat de l'arbre coûte 6 fragments, et je ne sais pas combien de fragments rapporte une première run de 2 min.

### 4.3 Risques propres au jeu mobile

- **[Inférence]** Le jeu est conçu pour être joué au doigt avec une interface chargée (HUD, boutons OD, pause, esquive double tap). Sur petit écran, le doigt cache le vaisseau. Je ne l'ai pas testé sur appareil.
- **[Inférence]** Beaucoup d'événements visuellement lourds (nébuleuse, éclipse, écran retourné, trous noirs) peuvent donner de la fatigue ou de la gêne. Vérifier un mode « réduire les effets ».
- **[Fait]** La machine de test est à un cœur avec WebGL logiciel : je n'ai **aucune mesure de fluidité sur téléphone réel**, et pourtant il n'y a plus de plafond de tirs ni d'ennemis. C'est un risque de performance majeur sur les appareils moyens.

---

## 5. Recommandations, par priorité

### À faire d'abord (impact fort, effort faible à moyen)

1. **Trancher la question du plafond d'alerte et du boss final** (alerte 20 vs 26). Tout le reste de la fin de jeu en dépend.
2. **Lisser l'alerte 8** : répartir ses nouveautés sur les alertes 6, 7, 8 et 9 (par exemple boucliers à 7, seconde forme à 8, IA esquive à 9) plutôt que tout d'un coup. Refaire la table `BOSS_HP_BY_ALERT` en pente régulière autour de ×1,5 par niveau au lieu des sauts ×2,6.
3. **Faire un vrai jeu de données** : un simulateur de run (bot ou formules) qui sort, pour 6 profils de joueur (arbre vide, 80 points, 200 points, plein…), le temps de survie et le palier atteint. C'est ce qui manque pour trancher tout le reste de ce document.
4. **Corriger les petites incohérences** : durée d'overdrive, plancher annoncé, LAME DU VENT dans les stats, texte « alerte 4+ » de la seconde forme.

### À faire ensuite (impact fort sur la rétention)

5. **Rendre les reliques inépuisables ou plus nombreuses** : par exemple des reliques génériques (valables pour tous les boss) en complément, pour que le choix reste riche à chaque boss.
6. **Ajouter des cartes avec des vrais choix** : synergies (ex. « les tirs perforants explosent »), compromis (ex. « +50 % dégâts, −30 % PV »), évolutions déclenchées par la combinaison de deux cartes. C'est ce qui rend les builds différents.
7. **Donner accès aux armes légendaires plus tôt** ou offrir une arme légendaire gratuite dans la première heure de jeu, pour montrer ce que le jeu peut devenir.
8. **Objectifs à court terme** : trois missions par jour (« tue 100 kamikazes », « bats un boss sans être touché ») qui paient des fragments. Peu coûteux, très efficace.

### À considérer (selon ta vision)

9. **Reprendre les plafonds** un par un, en commençant par `BOSS_DMG_CAP` : si tu veux que le joueur puisse « casser le jeu par le temps et la réflexion », il faut que les ennemis puissent aussi le casser par le temps.
10. **Classement en ligne ou fantômes** de runs d'amis.
11. **Un deuxième vaisseau** (ou classe) avec une façon de jouer différente, pour multiplier les builds.
12. **Mode réduit des effets** pour l'accessibilité et les appareils faibles.

---

## 6. Ce que je ferais pour répondre aux [À mesurer]

| Question | Comment l'obtenir |
|---|---|
| Où le joueur type meurt-il ? | Journal de fin de run (alerte, palier, temps, cause de mort) envoyé ou affiché en mode DEV. |
| Combien de runs pour finir l'arbre ? | Simulateur de fragments avec une distribution de scores réaliste. |
| La puissance suit-elle la difficulté ? | Bot qui joue chaque alerte avec une build « typique » à 0, 80, 200 et 336 points, et mesure la durée de survie. |
| Les cartes sont-elles équilibrées ? | Même bot, mais forcé à prendre une seule carte à chaque niveau pour comparer. |
| Est-ce fluide sur téléphone ? | Test sur un vrai appareil milieu de gamme avec compteur FPS en alerte 12+. |

Je peux construire le **simulateur** et le **journal de fin de run** : c'est la meilleure suite pour transformer ce document d'inférences en chiffres.
