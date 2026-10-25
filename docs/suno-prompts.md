# Space Shooter X — les prompts Suno (version finale : 22 prompts = 44 morceaux pour 42 pistes)

**Remplace `musique-suno.md`.** Suno sort **2 morceaux par génération** : chaque prompt ci-dessous est conçu pour que ses 2 morceaux deviennent **2 pistes voisines** (le plus calme = la première, le plus intense = la seconde).

## Réglages Suno (pour TOUS les prompts)
- Mode **Custom**, **Instrumental** coché (ou `[Instrumental]` dans les paroles). Si ta version a un champ Exclude, mets-y `vocals, singing, lyrics, fade out`.
- Champ **Style of Music** : colle le prompt tel quel (il contient déjà le bloc commun).
- Champ **Exclude styles** (si ta version l'a) : `vocals, singing, lyrics, fade out`.
- **Même tempo et même tonalité partout (120 BPM, La mineur)** : c'est ça qui rendra les transitions fluides. Je corrige les petits écarts de tempo, mais pas un morceau qui change de rythme en cours de route : regénère-le.
- Si tes 2 morceaux sont trop semblables, regénère en ajoutant `, second half much more intense` à la fin du prompt.
- Si ton offre le permet, pour garder le même thème d'un prompt à l'autre, repars du morceau précédent (Extend / Cover).
- Télécharge en **WAV si possible, sinon MP3**, et renomme comme dans les tableaux.

Bloc commun (déjà inclus dans chaque prompt ; chaque prompt fait moins de 200 caractères, la limite du champ Style de certaines versions de Suno). « no vocals » et « no fade-out » ne sont plus dans le prompt (place) : mets-les dans le champ Exclude (`vocals, singing, lyrics, fade out`) :
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave
```

## A. Musique de fond : 13 prompts → 26 pistes (un niveau d'alerte par piste)

Chaque prompt donne 2 morceaux : le **plus calme** = niveau de gauche, le **plus intense** = niveau de droite.

### Prompt 1 → `alerte_01` (plus calme) et `alerte_02` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, calm patrol, floating pads, soft pulse, sparse; 2 takes: calm, then slightly busier with a gentle arpeggio
```

### Prompt 2 → `alerte_03` (plus calme) et `alerte_04` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, calm but alert, gentle arpeggio, soft kick and hi-hats; 2 takes: calm, then with a groove bass
```

### Prompt 3 → `alerte_05` (plus calme) et `alerte_06` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, rising tension, pulsing bass, steady drums; 2 takes: calm, then more urgent with a lead synth
```

### Prompt 4 → `alerte_07` (plus calme) et `alerte_08` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, driving synthwave, punchy drums, urgent lead; 2 takes: calm, then faster feel and denser
```

### Prompt 5 → `alerte_09` (plus calme) et `alerte_10` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, intense chase, tight drums, aggressive lead; 2 takes: calm, then extra layers and risers
```

### Prompt 6 → `alerte_11` (plus calme) et `alerte_12` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, danger, distorted bass, heavy drums; 2 takes: calm, then bigger and darker
```

### Prompt 7 → `alerte_13` (plus calme) et `alerte_14` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, aggressive, dramatic orchestral hits, heavy beat; 2 takes: calm, then more chaotic
```

### Prompt 8 → `alerte_15` (plus calme) et `alerte_16` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, dark epic, cinematic strings and brass, pounding drums; 2 takes: calm, then with wordless choir pads
```

### Prompt 9 → `alerte_17` (plus calme) et `alerte_18` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, heavy epic, wordless choir, orchestral percussion; 2 takes: calm, then more relentless
```

### Prompt 10 → `alerte_19` (plus calme) et `alerte_20` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, dark, relentless, double-time drums, huge synth bass; 2 takes: calm, then even bigger
```

### Prompt 11 → `alerte_21` (plus calme) et `alerte_22` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, apocalyptic, double-time drums, screaming leads; 2 takes: calm, then denser
```

### Prompt 12 → `alerte_23` (plus calme) et `alerte_24` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, end of the world, brass blasts, relentless; 2 takes: calm, then extreme
```

### Prompt 13 → `alerte_25` (plus calme) et `alerte_26` (plus intense)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, final countdown, maximum intensity, ominous build; 2 takes: calm, then more desperate
```

*Le niveau 26 est la musique juste avant le boss final.*

## B. Boss : 7 prompts → 14 pistes (un prompt par boss : les 2 morceaux = A et B)

Le morceau **plus calme** = `_a` (début du combat). Le **plus intense** = `_b` (il prend le relais quand le boss passe à mi-vie).

### Prompt 14 — Dreadnought (cuirassé) → `boss_dreadnought_a` et `boss_dreadnought_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, warship boss battle, industrial march, war drums, brass synth; 2 takes: menacing, then same theme far more intense
```

### Prompt 15 — Faucheuse → `boss_faucheuse_a` et `boss_faucheuse_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, grim reaper boss battle, haunting staccato strings, eerie dark synths; 2 takes: menacing, then same theme far more intense
```

### Prompt 16 — Ruche → `boss_ruche_a` et `boss_ruche_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, insect hive boss battle, buzzing swarm synths, tribal rhythms, tension; 2 takes: menacing, then same theme far more intense
```

### Prompt 17 — Prisme → `boss_prisme_a` et `boss_prisme_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, crystal boss battle, glassy shimmering bells, ethereal arpeggios, cold; 2 takes: menacing, then same theme far more intense
```

### Prompt 18 — Kraken → `boss_kraken_a` et `boss_kraken_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, deep sea kraken boss battle, sub bass, oceanic pads, ominous slow power; 2 takes: menacing, then same theme far more intense
```

### Prompt 19 — Éclipse → `boss_eclipse_a` et `boss_eclipse_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, cosmic eclipse boss battle, shadowy synths, solar flare risers, mystery; 2 takes: menacing, then same theme far more intense
```

### Prompt 20 — Hydre → `boss_hydre_a` et `boss_hydre_b`
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, venomous hydra boss battle, hissing percussion, serpentine melodies; 2 takes: menacing, then same theme far more intense
```

## C. Événement et boss final : 2 prompts → 4 morceaux (2 pistes + 2 de rechange)

### Prompt 21 — météorites → `ev_meteores` (choisis ton préféré, garde l'autre en rechange)
Servira pour : tempête de météorites, boss surprise, pluie de cristaux, vague de 8:30.
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, asteroid field danger, rumbling percussion, urgent pulse, risers; 2 takes, different energy
```

### Prompt 22 — boss final → `boss_final_a` / `boss_final_b` (le second sert de rechange ou de passage à mi-vie)
```
instrumental, 120 BPM, A minor, loopable, space shooter synthwave, final boss battle, epic orchestra and synth, wordless choir, max drama; 2 takes: epic, then frantic
```

## D. Facultatif (hors des 42) : menu et jingles

- `menu` :
  ```
  instrumental, 120 BPM, A minor, loopable, space shooter synthwave, calm mysterious space intro, warm pads, slow arpeggios, subtle chiptune bleeps, hopeful but tense
  ```
- `jingle_victoire` :
  ```
  instrumental, no vocals, retro space shooter, short triumphant victory fanfare, heroic synth brass, 6 seconds
  ```
- `jingle_defaite` :
  ```
  instrumental, no vocals, retro space shooter, short sad defeat, descending synth, fading, 6 seconds
  ```
- `jingle_niveau` :
  ```
  instrumental, no vocals, retro space shooter, very short bright rising chime, 3 seconds
  ```

## Ordre conseillé (pour tester vite)
1. Prompts 1 et 2 (alertes 1 à 4) · 2. Prompt de ton boss préféré · 3. Prompt météorites · 4. le reste dans l'ordre. Dès que tu m'envoies ce premier lot, je branche le système et tu entends déjà le résultat dans le jeu.

## Ce que je ferai avec chaque piste
- **Fond** : fondu enchaîné d'environ 2 s calé sur la mesure à chaque montée d'alerte (toutes les 2 min).
- **Boss** : à l'arrivée du boss, fondu vers `boss_<nom>_a` ; quand il passe à **mi-vie (≤ 50 % de PV)**, fondu vers `boss_<nom>_b` ; à sa mort, retour au morceau du niveau. Double boss : il utilise la paire du premier boss.
- **Événements** : `ev_meteores` pour météorites, boss surprise, pluie de cristaux et vague de 8:30 ; les autres événements restent sur le morceau de fond.
- **Vitesse et hauteur en direct** (déjà dans le jeu) : s'applique à toutes les pistes à la fois, donc le rythme reste synchronisé : plus d'ennemis, de tirs, frénésie ou overdrive = jusqu'à +11 % ; PV bas = jusqu'à −18 %, plus grave et étouffé.

## Limites
- **Taille** : 42 pistes ne tiennent PAS dans le lien web (≈ 8 min de musique maximum). Elles iront dans la **version Android**. Pour le lien web, on gardera un petit lot de test.
- **Licence Suno** : vérifie que ton abonnement autorise l'usage commercial (jeu sur le Play Store).
- Je ne peux pas écouter : c'est toi qui valides à l'oreille.
