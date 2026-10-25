# Space Shooter X — prompts ChatGPT pour les 7 BOSS (avec leurs phases)

Un boss n'est pas un monstre normal : il change de comportement en cours de combat. Chaque prompt explique donc **comment le boss fonctionne dans le jeu**, pour que les images montrent bien ces changements.

## Comment utiliser
1. Une conversation ChatGPT neuve par boss, avec ta planche DIVER ou HEALER en pièce jointe (pour le style).
2. Colle le **BLOC COMMUN** puis le **bloc du boss**.
3. Si ChatGPT oublie une section, réponds : « Ajoute la section manquante, même taille que les autres. »
4. **Fond uni très sombre** (#05050a), sans dégradé coloré et **sans damier** : les planches avec damier ou fond clair sont beaucoup plus dures à découper.

---

## BLOC COMMUN (à coller à chaque fois)

```
Crée une planche de sprites de BOSS en pixel art détaillé et brillant (même style que la planche jointe), image paysage 1536x1024, fond UNI très sombre (#05050a), sans dégradé, sans damier, sans décor. Étiquettes en petits cadres sombres avec texte blanc en majuscules.

IMPORTANT, CE BOSS A PLUSIEURS PHASES. Dans le jeu, le boss change quand ses points de vie baissent :
- PHASE 1 (début du combat) : le boss est « intact », sa palette est froide/neutre.
- PHASE 2 : il devient plus agressif. Il doit avoir l'air ABÎMÉ ET PLUS DANGEREUX (armure fissurée, nouveaux pics ou lames, lueurs orange), pas seulement une autre couleur.
- PHASE 3 : fureur. Armure arrachée, cœur à nu, lueurs rouge et blanc incandescent, silhouette plus agressive.
- SECONDE FORME (certains boss) : quand on le « tue », il se relève avec 30 % de vie : transformation complète et spectaculaire.
Le dessin doit donc MONTRER ces étapes : la forme change réellement d'une phase à l'autre (ajouts, dégâts, lueurs), tout en restant reconnaissable comme le même boss.

DISPOSITION (étiquettes exactes) :
- Haut gauche : « NOM · PHASE 1 (4 FRAMES) » : 4 images au repos.
- Dessous : « PHASE 2 (4 FRAMES) » puis « PHASE 3 (4 FRAMES) ».
- « SECONDE FORME (4 FRAMES) » si le boss en a une (indiqué dans son bloc).
- « TRANSITION DE PHASE (4 FRAMES) » : le boss qui s'ouvre, se fissure, s'embrase (sert de transition entre phases).
- « TOUCHE » : 1 image par phase avec flash blanc (impact).
- « PARTIES SEPAREES » : les éléments indiqués dans le bloc du boss, chacun en 4 images et en 2 états (intact / détruit) quand c'est demandé.
- « ATTAQUES » : les projectiles et les lasers propres à chaque phase (couleurs différentes par phase), plus les annonces de tir (lignes fines pâles).
- « DESTRUCTION » : 8 images (le boss se disloque puis une très grande explosion).

RÈGLES : vue de dessus, le boss regarde vers le HAUT de l'image (comme sur la référence). Même taille et mêmes proportions pour toutes les images du boss. Pas d'ombre portée. Aucun texte hors étiquettes.
```

---

## 1. DREADNOUGHT (le boss d'origine)

**Comment il fonctionne** (à coller sous le bloc commun) :
```
BOSS : DREADNOUGHT. Un énorme cuirassé de guerre rouge et noir, qui se balance de gauche à droite en haut de l'écran. Sa seconde forme existe.
- PHASE 1 : il tire une salve de 3 tirs visés, puis un anneau complet de tirs (10), en alternance. Il se balance lentement.
- PHASE 2 : il se balance plus vite et plus large. Il alterne trois attaques : éventail de 5 tirs rapides, anneau complet, et pluie de 3 tirs lents qui tombent droit depuis ses ailes. Montre des canons latéraux qui s'ouvrent.
- PHASE 3 : fureur. L'anneau devient une SPIRALE qui tourne (plus de tirs). Montre le blindage central arraché et le réacteur à nu.
- SECONDE FORME : il se relève après sa destruction, ailes déployées, canons supplémentaires, noyau rouge très lumineux.
PARTIES SEPAREES à dessiner : « CANON LATERAL » (4 images, ouvert/fermé), « NOYAU » (4 images, pulsation).
ATTAQUES : tir visé rouge, anneau orange, pluie lente, spirale rouge-blanc (une couleur par phase).
```

## 2. FAUCHEUSE

```
BOSS : LA FAUCHEUSE. Un boss en forme de faux : corps étroit violet sombre avec des os pâles, deux grandes lames en croissant argenté qui s'écartent. Seconde forme : oui.
- PHASE 1 : BALAYAGE en éventail (5 lames en croissant lancées d'un côté à l'autre), puis PLONGEON : elle se met en position, VERROUILLE la position du joueur, puis fonce droit vers le bas, et reste ensuite SONNÉE 2 secondes (elle prend 50 % de dégâts en plus).
- PHASE 2 : le plongeon est plus fréquent, le balayage est plus dense.
- PHASE 3 : fureur : 7 lames par balayage, plongeons rapprochés, sonnée seulement 1,4 s.
- SECONDE FORME : ailes de lames déployées, silhouette plus grande, lueur magenta.
PARTIES SEPAREES : « LAME EN CROISSANT » (projectile, 4 tailles), « ETAT SONNE » (4 images : étourdie, lames tombantes, étincelles).
ATTAQUES : croissants d'argent (phase 1), croissants magenta (phase 2), croissants rouges (phase 3) ; ligne fine d'annonce du plongeon (pâle) ; traînée du plongeon.
IMPORTANT : dessine bien une image « PLONGEON » (corps allongé, lames serrées vers l'arrière) et une image « SONNEE ».
```

## 3. RUCHE

```
BOSS : LA RUCHE. Une ruche organique géante ambre et orange, en alvéoles hexagonales, noyau vert acide. Pas de seconde forme.
- La RUCHE a QUATRE POCHES (pods) autour du corps. Chaque poche lâche des petits essaims. Détruire les poches affaiblit le boss.
- PHASE 1 : chaque poche lâche 1 essaim à la fois ; le corps tire des SPORES à tête chercheuse (sphères vertes qui tournent doucement vers le joueur).
- PHASE 2 : les poches lâchent 2 essaims à la fois ; plus de spores.
- PHASE 3 : fureur : anneau de 12 spores autour du corps, poches gonflées et rougeâtres, alvéoles éclatées.
PARTIES SEPAREES (très important) : « POCHE (4 images) » en 3 états : intacte, abîmée, détruite (qui explose et dégoutte) ; « ESSAIM » (petite créature ailée, 4 images de vol).
ATTAQUES : spores vertes (phase 1), spores jaune-vert (phase 2), spores rouge-orange (phase 3).
```

## 4. PRISME

```
BOSS : LE PRISME. Un grand cristal en diamant bleu glace et blanc avec un noyau lumineux ; trois MIROIRS en losange tournent autour. Seconde forme : oui.
- Les 3 MIROIRS orbitent autour du cristal ; ils RENVOIENT les lasers. Le laser du boss est ANNONCÉ par une ligne fine pâle (2 secondes), puis un faisceau puissant qui rebondit sur les miroirs.
- PHASE 1 : miroirs lents ; un laser toutes les ~3 secondes ; tirs en spirale simples.
- PHASE 2 : miroirs plus rapides ; lasers plus fréquents ; spirale plus dense. Cristal fissuré, lueur dorée.
- PHASE 3 : fureur : encore plus de tirs, double spirale. Cristal éclaté en fragments flottants autour du noyau, lueur rose et blanche.
- SECONDE FORME : le cristal se reforme en étoile à pointes.
PARTIES SEPAREES : « MIROIR » (4 images de rotation) en 3 états (intact, fissuré, détruit) ; « FAISCEAU » : début, milieu, fin (répétable) + version annonce.
ATTAQUES : spirales cyan (P1), dorées (P2), roses (P3).
```

## 5. KRAKEN

```
BOSS : LE KRAKEN. Une tête de poulpe géant bioluminescent bleu profond et turquoise, grand œil central. Seconde forme : oui.
- Ses BRAS sont des CHAÎNES DE BOULES (6 boules par bras). La première boule (la BASE, plus grosse, DORÉE avec un anneau pulsant) est le POINT FAIBLE : la détruire fait disparaître tout le bras. Couper une boule fait tomber la fin du bras. Les bras REPOUSSENT.
- PHASE 1 : 5 bras ; il tire des projectiles d'ENCRE sombre.
- PHASE 2 : 7 bras et plus d'encre.
- PHASE 3 : fureur : œil rouge, ventouses lumineuses, tentacules hérissés.
- SECONDE FORME : il émerge entièrement, manteau ouvert, plusieurs yeux.
PARTIES SEPAREES : « BOULE DE TENTACULE » en 4 tailles décroissantes ; « BOULE DE BASE DOREE » en 3 états (normale, touchée, détruite) ; « REPOUSSE » : 4 images d'une boule qui pousse.
ATTAQUES : encre noire-bleue (P1), violette (P2), rouge sombre (P3).
```

## 6. ECLIPSE

```
BOSS : L'ECLIPSE. Une sphère noire entourée d'une couronne solaire dorée, halo violet. Seconde forme : oui.
- Il alterne deux états : VISIBLE (3,2 s) puis MIRAGE (4,3 s). Pendant le mirage, TROIS LEURRES identiques apparaissent et le vrai boss se cache parmi eux ; SEUL INDICE : un léger halo autour du vrai.
- PHASE 2 : les changements d'état vont ~35 % plus vite.
- PHASE 3 : fureur : couronne en flammes blanches, sphère fissurée laissant passer une lumière blanche.
- SECONDE FORME : l'éclipse totale : la couronne devient un anneau énorme.
PARTIES SEPAREES : « LEURRE » (même forme que le boss mais pâle, translucide, bords violets, 4 images) ; « HALO DU VRAI » (4 images) ; « MIRAGE » : 6 images d'apparition/disparition en particules violettes.
ATTAQUES : orbes dorés (P1), violets (P2), blancs (P3).
```

## 7. HYDRE

```
BOSS : L'HYDRE. Un corps massif de serpent vert toxique à écailles sombres, d'où partent des TÊTES. Pas de seconde forme.
- Le CORPS est INVULNÉRABLE : on doit détruire les TÊTES. Chaque tête détruite REPOUSSE après un moment (compteur visible).
- PHASE 1 : les têtes tirent des tirs de venin visés ; les têtes impaires tirent 3 tirs en éventail.
- PHASE 2 : tout va plus vite ; les têtes paires tirent par deux.
- PHASE 3 : fureur : toutes les 3 salves, chaque tête crache aussi un ANNEAU circulaire de venin.
PARTIES SEPAREES (très important) : « TETE » (bouche fermée / ouverte / crache, 4 images chacune) ; « TETE DETRUITE » (cou coupé) ; « REPOUSSE » (6 images : une tête qui repousse) ; « COU » (segment répétable).
ATTAQUES : venin vert (P1), jaune (P2), rouge (P3) ; annonce de l'anneau (cercle fin pâle).
```

---

## Ce que je fais ensuite avec ces planches
Dès que tu m'envoies une planche de boss, je découpe chaque phase et chaque partie, et je les branche : le sprite change **à chaque changement de phase** (j'ai déjà ajouté dans le jeu l'annonce, la barre de vie colorée et les repères de phase) et la seconde forme utilise ses propres images.
