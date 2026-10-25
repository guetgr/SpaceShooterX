# Prompts ChatGPT — planches des nouveaux monstres de Space Shooter X

Comment faire pour **chaque** planche :
1. Ouvre une nouvelle conversation ChatGPT.
2. Joins ta planche **DIVER** comme image de référence (la même à chaque fois, pour garder le même style).
3. Colle le **BLOC COMMUN**, puis juste en dessous le bloc du monstre.
4. Si ChatGPT change la mise en page, réponds : « Garde exactement la mise en page de la référence, mêmes sections, même nombre d'images. »

---

## BLOC COMMUN (à coller à chaque fois)

```
Crée une planche de sprites en reproduisant EXACTEMENT la mise en page de la planche de référence jointe (planche « DIVER »).

Format : image paysage 1536x1024. Style : pixel art détaillé et brillant, contours sombres, éclairage et reflets comme sur la référence. Fond : uni très sombre (#05050a), SANS dégradé et sans halo coloré derrière les sprites. Étiquettes : petits cadres bleu foncé avec texte blanc en majuscules, comme sur la référence.

Disposition :
- Haut gauche : étiquette « NOM (4 FRAMES) » puis 4 images du monstre côte à côte (micro-variations d'une image à l'autre, animation au repos).
- Milieu gauche : étiquette « ANIMATION VOL (4 FRAMES) » puis 4 images avec le mouvement ou la propulsion.
- Bas gauche : étiquette « EXPLOSION » puis 5 images d'explosion de plus en plus grandes, dans les couleurs du monstre.
- Droite : « TIRS PRINCIPAUX » (10 projectiles de taille croissante), « TIRS SECONDAIRES » (9 impacts ou étoiles), « TIRS SPÉCIAUX (NUÉE) » (5 groupes de petits projectiles), « PARTICULES » (éclats et étincelles).

Règles : vue de dessus, le monstre est orienté nez/tête vers le HAUT de l'image (comme sur la référence), flammes ou propulsion en bas. Le monstre a la même taille et les mêmes proportions sur les 8 images. Pas d'ombre portée. Aucun autre texte que les étiquettes.
```

Quand un monstre a des **sections supplémentaires** (parties séparées, projectiles spéciaux), ajoute-les en bas de la planche ou à la place des sections de tirs, comme indiqué dans son bloc.

---

## BOSS

### 1. FAUCHEUSE
```
NOM : FAUCHEUSE (boss, grande taille).
Design : un boss en forme de faux. Corps central étroit en violet sombre avec des plaques d'os pâle, deux grandes ailes-lames en croissant argenté/blanc lunaire qui s'écartent comme une faux, un noyau magenta lumineux au centre. Palette : violet, magenta, argent, un peu de noir.
Animation au repos : les lames bougent très légèrement. Animation vol : les lames s'écartent un peu plus, traînée d'énergie magenta derrière.
Explosion : violette et magenta avec éclats argentés.
Remplace « TIRS PRINCIPAUX » par « LAMES » : 10 projectiles en croissant de taille croissante.
Ajoute une section « TÉLÉGRAPHIE » : 3 flèches ou lignes d'avertissement rouges (annonce de piqué).
```

### 2. RUCHE
```
NOM : RUCHE (boss, grande taille).
Design : une ruche organique volante. Coque ambre/orange en alvéoles hexagonales, brun cire sur les bords, un cœur luminescent vert acide au centre. Quatre petites poches (pods) visibles autour du corps. Palette : jaune ambre, orange, vert acide, brun.
Animation au repos : le cœur pulse. Animation vol : bourdonnement, léger tremblement, petites ailes d'insecte translucides.
Explosion : jaune/orange avec éclaboussures vertes.
Remplace « TIRS PRINCIPAUX » par « SPORES » : 10 sphères vertes avec une petite queue, taille croissante.
Ajoute une section « PODS (4 FRAMES) » : une poche/alvéole qui sert de lanceur, en 2 états (intacte puis abîmée) avec 2 images de pulsation chacun.
```

### 3. PRISME
```
NOM : PRISME (boss, grande taille).
Design : un grand cristal en diamant à facettes, cyan, bleu glace et blanc, avec un noyau très lumineux et des arêtes brillantes. Palette : cyan, bleu, blanc, un peu de rose sur les reflets.
Animation au repos : les facettes scintillent. Animation vol : le cristal tourne légèrement, éclats qui orbitent.
Explosion : en éclats de verre cyan et blanc.
Ajoute une section « MIROIR (4 FRAMES) » : un petit miroir en losange (rotation sur 4 images).
Ajoute une section « FAISCEAU LASER » : un segment horizontal répétable (début, milieu, fin) cyan/blanc, et une version « annonce » fine et pâle.
Remplace « TIRS SPÉCIAUX (NUÉE) » par « SPIRALE » : 5 groupes de petits projectiles cristallins en spirale.
```

### 4. KRAKEN
```
NOM : KRAKEN (boss, grande taille).
Design : tête de poulpe géant bioluminescent. Manteau en dôme bleu profond avec des points lumineux turquoise, un grand œil central, quatre courts bras à la base. Palette : bleu marine, bleu profond, turquoise, un peu de violet.
Animation au repos : l'œil cligne, les bras ondulent. Animation vol : mouvement de nage, bulles.
Explosion : bleue avec éclaboussures d'eau.
Remplace « TIRS PRINCIPAUX » par « ENCRE » : 10 projectiles d'encre sombre à reflets bleus, taille croissante.
Ajoute une section « BOULES DE TENTACULE » : une boule bleue en 4 tailles décroissantes (chaîne d'un tentacule) + une « BOULE DE BASE » plus grosse, DORÉE avec un anneau lumineux (point faible), en 2 états (normal puis touché).
```

### 5. ÉCLIPSE
```
NOM : ECLIPSE (boss, taille moyenne à grande).
Design : une sphère noire entourée d'une couronne solaire dorée (anneau de flammes), halo violet autour. Palette : noir, or, violet.
Animation au repos : la couronne ondule. Animation vol : le halo pulse, des flammes dorées tournent.
Explosion : dorée et violette.
Remplace « TIRS PRINCIPAUX » par « ORBES » : 10 orbes violets et dorés, taille croissante.
Ajoute une section « LEURRES (4 FRAMES) » : même forme mais pâle, translucide, bords violets (faux boss).
Ajoute une section « MIRAGE » : 5 images d'apparition/disparition en particules violettes qui se dissolvent.
```

### 6. HYDRE
```
NOM : HYDRE (boss, grande taille).
Design : un corps massif de serpent vert toxique avec des écailles sombres et des plaques, d'où partent des têtes de serpent. Palette : vert toxique, vert sombre, jaune venin, un peu de noir.
Animation au repos : respiration, écailles brillantes. Animation vol : ondulation.
Explosion : verte et jaune avec éclaboussures de venin.
Remplace « TIRS PRINCIPAUX » par « VENIN » : 10 projectiles de venin vert, taille croissante.
Ajoute une section « TÊTE (4 FRAMES) » : une tête de serpent, bouche fermée puis ouverte (2 images chacune), + « TÊTE ÉPUISÉE » grisâtre.
Ajoute une section « COU » : un segment de cou répétable.
```

---

## MONSTRES (plus petits)

### 7. KAMIKAZE
```
NOM : KAMIKAZE (petit monstre).
Design : une bombe volante rouge sombre avec un noyau orange incandescent, une mèche qui crépite en haut, petits ailerons, museau pointu clair. Palette : rouge, orange, jaune, un peu de blanc.
Animation au repos : la mèche crépite.
À la place de « ANIMATION VOL » : « CHARGE (4 FRAMES) » : le monstre clignote rouge/blanc, propulsion forte.
Explosion : GROSSE, avec une onde de choc (5 images).
Remplace les tirs par « MINI-BOMBES » : 4 petites bombes/mines (animation) et « ÉCLATS ».
```

### 8. ARAIGNÉE
```
NOM : ARAIGNEE (petit à moyen monstre).
Design : une araignée mécano-organique violet sombre, huit pattes articulées en violet clair, abdomen avec un sablier rouge, yeux verts brillants, petits crocs blancs. Palette : violet, rouge, vert acide.
Animation au repos : respiration, pattes qui bougent. À la place de « ANIMATION VOL » : « MARCHE (4 FRAMES) » : pattes en mouvement.
Explosion : violette avec éclats de pattes.
Remplace « TIRS PRINCIPAUX » par « BOULES DE TOILE » : 10 projectiles de toile violette, taille croissante.
Ajoute une section « TOILE » : un segment de fil/laser violet répétable (début, milieu, fin) et une version « annonce » fine et pâle.
```

### 9. TRÉSORIN
```
NOM : TRESORIN (petit monstre rare, sans tirs).
Design : un médaillon/pièce d'or volant avec une étoile claire au centre, de petites ailes, des scintillements blancs. Palette : or, jaune clair, blanc, ambre.
Animation au repos : scintillement. À la place de « ANIMATION VOL » : « ROTATION (4 FRAMES) » : le médaillon pivote sur lui-même.
Explosion : pluie de pièces et de gemmes dorées (5 images).
À la place des sections de tirs : « PIÈCES » (10 pièces qui tournent) et « SCINTILLEMENTS » (étincelles dorées). Garde « PARTICULES ».
```

### Bonus : MÉTÉORITE (événement)
```
NOM : METEORITE.
Design : un rocher brun avec des fissures orange incandescentes.
À la place de « 4 FRAMES » : « ROTATION (8 FRAMES) » en 3 tailles (petit, moyen, gros). À la place de « ANIMATION VOL » : « TRAÎNÉE DE FEU » (4 images). Explosion : impact avec éclats de roche (5 images).
Pas de tirs : remplace ces sections par « DÉBRIS » (éclats de roche) et « ÉTINCELLES ».
```

---

## Ordre conseillé
1. Les 6 boss, dans l'ordre : Faucheuse, Prisme, Kraken, Ruche, Éclipse, Hydre.
2. Puis Kamikaze, Araignée, Trésorin.
3. Puis la Météorite (bonus).

Envoie-moi les planches au fur et à mesure (un fichier PNG par planche). Je les découpe comme pour les précédentes, je les branche à la place de mes sprites provisoires et j'ajuste la taille et la zone de collision de chaque monstre.
