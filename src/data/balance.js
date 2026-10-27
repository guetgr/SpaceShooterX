"use strict";
// Constantes d'équilibrage : dégâts, niveau d'alerte, évolution dans le temps.

const COLLISION_DMG_MUL = 3;        // les collisions avec le vaisseau font 3x leurs dégâts de base (réduits par BLINDAGE+, FORTERESSE, RESISTANCE+, AURA DE FER)

const ENEMY_DMG_PER_ALERT = 0.10;   // +10% de dégâts ennemis par niveau d'alerte au-dessus de 1

/* LE NIVEAU D'ALERTE MONTE PENDANT LA PARTIE: il démarre au niveau de l'arbre de compétences puis gagne +1 toutes les ALERT_RISE_SECONDS
   (le chrono du HUD rougit jusqu'au palier). Gelé pendant un combat de boss. Plafond: ALERT_CAP. */
const ALERT_RISE_SECONDS = 120;

// Quels ennemis peuvent apparaître et à partir de quand (t = secondes de partie + 12 s × (menace-1)) ; w = poids dans le tirage.
// Un niveau peut la remplacer par `spawns:[{ type, from, w? }]` (from en secondes depuis la fin du décollage ; w par défaut = celui de cette table).
const SPAWN_TABLE = [
  { type:'grunt', at:-1, w:38 }, { type:'diver', at:8, w:16 }, { type:'shooter', at:12, w:22 }, { type:'turret', at:20, w:12 }, { type:'drone', at:28, w:16 },
  { type:'splitter', at:35, w:14 }, { type:'shieldedGrunt', at:45, w:12 }, { type:'mine', at:50, w:10 }, { type:'tank', at:55, w:12 }, { type:'bomber', at:65, w:12 },
  { type:'sniper', at:75, w:10 }, { type:'swarmer', at:80, w:18 }, { type:'healer', at:95, w:9 }, { type:'ghost', at:110, w:12 }, { type:'elite', at:130, w:8 },
  { type:'mothership', at:140, w:8 }, { type:'vortex', at:150, w:7 }, { type:'charo', at:100, w:11 }, { type:'kamikaze', at:22, w:14 }, { type:'spider', at:30, w:11 },
];

const BOSS_RUN_ALERT_HP = 1.4;      // chaque niveau gagné PENDANT la partie gonfle les PV des boss de 40% (en plus de leur table de départ)

const LATE_HP_GROWTH = 1.035;       // passé la 10e minute, les PV des ennemis gagnent en plus 3,5% par palier de 20 s (exponentiel)

const ENEMY_DMG_LATE = 0.03;        // passé la 10e minute, les dégâts ennemis gagnent en plus 3% par minute (cumulé)

const ENEMY_DMG_TIME_MAX = 0.40;    // +40% max avec le temps de partie (atteint à 10 min)
