"use strict";
// Constantes d'équilibrage : dégâts, niveau d'alerte, évolution dans le temps.

const COLLISION_DMG_MUL = 3;        // les collisions avec le vaisseau font 3x leurs dégâts de base (réduits par BLINDAGE+, FORTERESSE, RESISTANCE+, AURA DE FER)

const ENEMY_DMG_PER_ALERT = 0.10;   // +10% de dégâts ennemis par niveau d'alerte au-dessus de 1

/* LE NIVEAU D'ALERTE MONTE PENDANT LA PARTIE: il démarre au niveau de l'arbre de compétences puis gagne +1 toutes les ALERT_RISE_SECONDS
   (le chrono du HUD rougit jusqu'au palier). Gelé pendant un combat de boss. Plafond: ALERT_CAP. */
const ALERT_RISE_SECONDS = 120;

const BOSS_RUN_ALERT_HP = 1.4;      // chaque niveau gagné PENDANT la partie gonfle les PV des boss de 40% (en plus de leur table de départ)

const LATE_HP_GROWTH = 1.035;       // passé la 10e minute, les PV des ennemis gagnent en plus 3,5% par palier de 20 s (exponentiel)

const ENEMY_DMG_LATE = 0.03;        // passé la 10e minute, les dégâts ennemis gagnent en plus 3% par minute (cumulé)

const ENEMY_DMG_TIME_MAX = 0.40;    // +40% max avec le temps de partie (atteint à 10 min)

const EXPLO_HURTS_PLAYER_ALERT = 8;                        // à partir de ce niveau, les explosions blessent aussi le joueur

const EXPLO_BOSS_FACTOR = 0.25;                            // les boss n'encaissent que 25% des dégâts d'explosion
