"use strict";
// Jeu de lumières des boss : voyants qui pulsent ou clignotent, balayage radar, gyrophare. Positions en pixels du sprite 512 ; elles suivent le boss et disparaissent avec la pièce qui les porte (masque du sprite).
// m : 'pulse' (respire), 'blink' (clignote, plus longtemps allumé qu'éteint), 'strobe' (éclair bref), 'spin' (image de lumière qui tourne, `tex`, `size` = diamètre en pixels du sprite, `speed` = rad/image).
// p = période en images de 1/60 s, ph = décalage, r = rayon en pixels du sprite, col = couleur, a = intensité maximale.
const BOSS_LIGHTS = {
  antenne: [                                                                                    // Antenne-Mère : un radar balaie la parabole, voyants de navigation aux bouts d'ailes
    { m:'spin', tex:'ltRadar', x:256, y:178, size:215, speed:0.05, a:0.85 },
    { m:'pulse', x:256, y:132, r:18, col:[130, 215, 255], p:90, ph:0, a:1 },
    { m:'pulse', x:256, y:236, r:20, col:[120, 205, 255], p:140, ph:30, a:0.8 },
    { m:'blink', x:196, y:254, r:12, col:[255, 170, 60], p:60, ph:0, a:1 }, { m:'blink', x:312, y:254, r:12, col:[255, 170, 60], p:60, ph:30, a:1 },
    { m:'blink', x:10, y:214, r:11, col:[255, 60, 50], p:100, ph:0, a:1 }, { m:'blink', x:502, y:214, r:11, col:[70, 255, 110], p:100, ph:50, a:1 },
    { m:'strobe', x:256, y:468, r:13, col:[170, 225, 255], p:75, ph:0, a:1 },
  ],
  araignee: [                                                                                   // Araignée de tri : panneaux jaunes des bennes qui respirent, gyrophare orange sur l'écrou central
    { m:'spin', tex:'ltBeacon', x:256, y:225, size:150, speed:0.09, a:0.9 },
    { m:'pulse', x:101, y:140, r:28, col:[255, 205, 50], p:110, ph:0, a:0.9 }, { m:'pulse', x:413, y:139, r:28, col:[255, 205, 50], p:110, ph:30, a:0.9 },
    { m:'pulse', x:96, y:301, r:26, col:[255, 205, 50], p:110, ph:60, a:0.9 }, { m:'pulse', x:418, y:299, r:26, col:[255, 205, 50], p:110, ph:90, a:0.9 },
    { m:'strobe', x:256, y:420, r:22, col:[255, 225, 70], p:90, ph:0, a:1 },
    { m:'blink', x:212, y:78, r:11, col:[255, 120, 30], p:70, ph:0, a:1 }, { m:'blink', x:302, y:78, r:11, col:[255, 120, 30], p:70, ph:35, a:1 },
  ],
  reacteur: [                                                                                   // Le Réacteur : voyants verts qui virent avec l'état (la couleur est imposée par le boss) ; le rotor central est géré par bosses/reacteur.js
    { m:'blink', x:108, y:143, r:14, p:70, ph:0, a:1 }, { m:'blink', x:122, y:142, r:14, p:70, ph:35, a:1 }, { m:'blink', x:386, y:142, r:14, p:70, ph:20, a:1 }, { m:'blink', x:402, y:157, r:14, p:70, ph:55, a:1 },
    { m:'pulse', x:40, y:256, r:16, p:80, ph:0, a:1 }, { m:'pulse', x:472, y:256, r:16, p:80, ph:40, a:1 }, { m:'pulse', x:140, y:357, r:16, p:100, ph:10, a:1 }, { m:'pulse', x:371, y:357, r:16, p:100, ph:60, a:1 },
    { m:'blink', x:235, y:443, r:11, p:50, ph:0, a:1 }, { m:'blink', x:277, y:443, r:11, p:50, ph:25, a:1 },
    { m:'pulse', x:230, y:412, r:24, p:120, ph:0, a:1 }, { m:'pulse', x:256, y:422, r:24, p:120, ph:40, a:1 }, { m:'pulse', x:282, y:408, r:24, p:120, ph:80, a:1 },
  ],
  meteo: [                                                                                      // La Météo : un radar balaie la parabole, paratonnerres bleus, hublots ambrés
    { m:'spin', tex:'ltRadar', x:256, y:190, size:200, speed:0.06, a:0.85 },
    { m:'pulse', x:216, y:94, r:13, col:[130, 215, 255], p:70, ph:0, a:1 }, { m:'pulse', x:297, y:94, r:13, col:[130, 215, 255], p:70, ph:35, a:1 },
    { m:'blink', x:160, y:203, r:12, col:[255, 175, 70], p:90, ph:0, a:1 }, { m:'blink', x:352, y:203, r:12, col:[255, 175, 70], p:90, ph:22, a:1 },
    { m:'blink', x:160, y:275, r:12, col:[255, 175, 70], p:90, ph:45, a:1 }, { m:'blink', x:352, y:275, r:12, col:[255, 175, 70], p:90, ph:68, a:1 },
    { m:'pulse', x:182, y:356, r:15, col:[150, 225, 255], p:100, ph:10, a:0.9 }, { m:'pulse', x:329, y:356, r:15, col:[150, 225, 255], p:100, ph:60, a:0.9 },
    { m:'strobe', x:256, y:84, r:11, col:[255, 80, 70], p:70, ph:0, a:1 },
  ],
};
