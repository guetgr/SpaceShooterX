"use strict";
// Constantes du jeu : taille du terrain, zoom, plafonds, zones HUD.

const GAME_W = 400, GAME_H = 700;

const PLAYER_SHIP_SCALE = 0.175;

const INTRO_E_A = 1100, INTRO_E_B = 2600, INTRO_E_C = 1400, INTRO_E_TOTAL = INTRO_E_A + INTRO_E_B + INTRO_E_C;   // décollage depuis la Terre: allumage, recul de caméra, départ

const ZOOM_START = 1.35;   // game begins zoomed in — mobs/ship look bigger

const ZOOM_END = 1.0;      // fully dezoomed — full play field visible, room for more mobs

const ZOOM_DURATION = 90;  // seconds to fully dezoom

const GEM_CAP = 1000000;           // au-delà, les cristaux ne sont plus dessinés: leur XP est ajoutée directement

const ASHIELD_EXCL = ['kamikaze','swarmer','mine','golden','meteor','shieldedGrunt','splitterMini','boss'];

const NO_SHIELD_TYPES = ['kamikaze','swarmer','mine','golden','meteor','shieldedGrunt','splitterMini','boss','mothership'];   // pas de bouclier générique pour eux

const FLANK_TYPES = ['grunt','shooter','charo','tank','elite','turret','sniper'];   // mobs qui peuvent entrer par les côtés

const ENEMY_CAP = 100000;        // nombre d'ennemis actifs au-delà duquel on n'envoie plus de vagues

const ENEMY_HARD_CAP = 100000;   // plafond absolu (packs, mothership, etc. compris)

const BULLET_CAP = 1000000;       // plafond absolu de tirs ennemis à l'écran

const STAR_PAD_X = 340, STAR_PAD_Y = 440; // les étoiles couvrent bien plus que le terrain pour le dézoom

const HUD_SAFE_Y = 110;    // en dessous de ça = recouvert par le HUD (barre de vie, bannière boss, etc.)

const STORAGE_KEY = 'ssx_highscore_v1';
