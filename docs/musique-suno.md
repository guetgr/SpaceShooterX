# Space Shooter X — cahier des charges de la musique (pour Suno)

Objectif : tu génères les morceaux, je les intègre avec des **transitions fluides** (fondu enchaîné calé sur la mesure, tous les morceaux restent "en phase").

## La règle qui rend les transitions fluides
**Tous les morceaux doivent avoir le MÊME tempo et la MÊME tonalité.** Si c'est le cas, passer d'un morceau à l'autre se fait sans qu'on entende la couture.

- **Tempo : 120 BPM** · **Tonalité : La mineur (A minor)**
- Mets ça dans CHAQUE prompt Suno : `120 BPM, A minor`
- Suno n'est jamais parfaitement exact : je mesure le vrai tempo de chaque fichier et je l'ajuste à 120 (ajustement de quelques % imperceptible). Si un morceau change de tempo en cours de route ou dérive beaucoup, il faudra le regénérer.

## Ce que tu dois faire dans Suno
- **Instrumental uniquement** (case « Instrumental » cochée, aucune voix).
- Ajoute à chaque prompt : `instrumental, no vocals, steady tempo, no tempo change, loopable, no fade-out`.
- Les morceaux font 2-4 minutes : **pas besoin de les couper**. Choisis la version dont le milieu est régulier (pas de pause ni de break au milieu) : je découpe moi-même une boucle propre de 16 mesures (32 s).
- Télécharge en **WAV si possible, sinon MP3**.
- Nomme chaque fichier avec le nom de la liste ci-dessous (ex. `niv_1.mp3`).

## Les pistes (17)

### Musique de fond selon le niveau d'alerte
| Fichier | Quand | Prompt Suno (à compléter avec `120 BPM, A minor, instrumental…`) |
|---|---|---|
| `menu` | écran d'accueil et menus | calm mysterious space intro, warm pads, slow arpeggios, subtle chiptune bleeps, hopeful but tense |
| `niv_1` | alerte 1 à 4 | light driving retro space shooter, mid energy, bouncy bassline, bright arpeggio, soft drums, synthwave chiptune |
| `niv_2` | alerte 5 à 9 | tense driving synthwave, pulsing bass, punchy drums, urgent lead synth, rising tension |
| `niv_3` | alerte 10 à 15 | aggressive fast space shooter, distorted bass, heavy drums, dramatic orchestral hits mixed with synth |
| `niv_4` | alerte 16 à 20 | apocalyptic maximum intensity, double-time drums, epic wordless choir pads, relentless, cinematic synth |

### Boss (le morceau change à chaque PHASE du boss)
| Fichier | Quand | Prompt |
|---|---|---|
| `boss_p1` | boss, phase 1 | epic boss battle, heavy drums, ominous synth brass, driving, dark |
| `boss_p2` | boss, phase 2 | same boss battle but more intense, faster hi-hats, aggressive lead, more drums |
| `boss_p3` | boss, phase 3 et seconde forme | final fury boss battle, chaotic, maximum energy, dramatic, fast, powerful |

### Événements
| Fichier | Événements concernés | Prompt |
|---|---|---|
| `ev_bright` | pluie de cristaux, tempête magnétique | sparkling bright magical, glittery arpeggios, uplifting, light percussion, rewarding |
| `ev_hazard` | météorites, bombardement, champ de mines | dark ominous percussion, rumbling toms, tension risers, danger, suspense |
| `ev_assault` | essaims, kamikazes, araignées, élites | frantic attack theme, fast staccato synth strings, urgent, aggressive |
| `ev_frenzy` | frénésie | hyper fast energetic chiptune rush, adrenaline, high energy, relentless |
| `ev_flip` | écran retourné | disorienting, reversed sounds, warped, glitchy, upside-down feeling, strange |
| `ev_gold` | ciel de Trésorins | playful jackpot, coins, bright bells, fun, bouncy, cheerful |

### Jingles (courts, 4 à 8 secondes, tempo libre)
| Fichier | Quand | Prompt |
|---|---|---|
| `jingle_victory` | boss vaincu | short triumphant victory fanfare, heroic, synth brass, 6 seconds |
| `jingle_gameover` | partie perdue | short sad defeat, descending synth, fading, 6 seconds |
| `jingle_levelup` | montée de niveau (facultatif) | very short bright rising chime, 3 seconds |

**Pour commencer, un premier lot suffit pour tester le système** : `menu`, `niv_1`, `niv_2`, `boss_p1`, `boss_p2`, `boss_p3`, `ev_bright`, `ev_hazard`. Les pistes que tu ne fournis pas gardent la musique actuelle du jeu (elle sert de secours).

## Ce que je fais avec tes fichiers
1. Mesure du tempo, mise à **120 BPM exactement**, découpe d'une boucle de 16 mesures sans clic à la couture, volume égalisé entre tous les morceaux.
2. Compression pour tenir dans le jeu (voir plus bas).
3. Un « chef d'orchestre » musical dans le jeu :
   - tous les morceaux partagent une **horloge de mesures** : un nouveau morceau démarre à la bonne position, donc le rythme ne saute jamais ;
   - changement **à la prochaine mesure**, avec un fondu enchaîné d'environ 2 s ;
   - priorité : défaite > boss (par phase) > événement > niveau d'alerte > menu ;
   - à la fin d'un événement, retour fluide au morceau du niveau ;
   - la musique baisse et s'étouffe doucement pendant les menus de pause et de choix de cartes, et les jingles passent par-dessus.

## Limites à connaître
- **Taille** : le jeu publié fait 7,8 Mo et le lien plafonne à 16 Mo. Il reste de la place pour ~4 Mo de musique, soit environ **8 minutes** au total. Je compresse donc en mono 64 kbps (loops de 32 s) : correct sur téléphone, moins fin au casque. La **version Android** n'aura pas cette limite : on pourra y mettre les fichiers en pleine qualité.
- **Licence Suno** : à ma connaissance, les morceaux créés avec l'offre gratuite ne peuvent pas être utilisés commercialement ; il faut un abonnement payant au moment de la création. Comme le jeu est sur le Play Store, **vérifie les conditions de Suno** avant de les intégrer pour de bon.
- Je ne peux pas écouter : je vérifie le tempo, le volume et la couture des boucles avec des mesures, mais **c'est toi qui juges à l'oreille** si un morceau colle à la scène.
