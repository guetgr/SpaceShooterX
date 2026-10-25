"use strict";
// Sprites pixel dessinés en code (vaisseau, ennemis de base, projectiles).

/* =========================================================
   SPRITE DEFINITIONS (pixel matrices)
========================================================= */
const PLAYER_ROWS = [
  "......AA......",
  ".....AAAA.....",
  ".....ABBA.....",
  "....AABBAA....",
  "....AABBAA....",
  "...AAAAAAAA...",
  "...ACCCCCCA...",
  "..AACCCCCCAA..",
  "..A.CCCCCC.A..",
  ".AA.AAAAAA.AA.",
  "AA...AAAA...AA",
  "A.....AA.....A",
  "......DD......",
  ".....DEED.....",
  "....D.EE.D....",
];

const PLAYER_PAL = { A:0x2fb6c9, B:0xffe14f, C:0x123f66, D:0xff8a3d, E:0xffe98a };

// Tier 2: side wing-blades appear (visible sign of upgrades)
const PLAYER_T2_ROWS = [
  "......AA......",
  ".F...AAAA...F.",
  ".FF..ABBA..FF.",
  "..F.AABBAA.F..",
  "..F.AABBAA.F..",
  "...AAAAAAAA...",
  "...ACCCCCCA...",
  "..AACCCCCCAA..",
  "..A.CCCCCC.A..",
  ".AA.AAAAAA.AA.",
  "AA...AAAA...AA",
  "A.....AA.....A",
  "......DD......",
  ".....DEED.....",
  "....D.EE.D....",
];

// Tier 3: wing-blades + twin engine flare, brighter hull
const PLAYER_T3_ROWS = [
  "......AA......",
  ".F...AAAA...F.",
  ".FF..ABBA..FF.",
  ".FF.AABBAA.FF.",
  "..F.AABBAA.F..",
  "...AAAAAAAA...",
  "...AGGGGGGA...",
  "..AAGGGGGGAA..",
  "..A.GGGGGG.A..",
  ".AA.AAAAAA.AA.",
  "AA...AAAA...AA",
  "A..D..AA..D..A",
  "...DD.DD.DD...",
  "....DEEEED....",
  "....D.EE.D....",
];

const PLAYER_T2_PAL = { A:0x2fb6c9, B:0xffe14f, C:0x123f66, D:0xff8a3d, E:0xffe98a, F:0xff5fd2 };

const PLAYER_T3_PAL = { A:0x5fe0ff, B:0xffe14f, D:0xff8a3d, E:0xffe98a, F:0xff5fd2, G:0x0a2740 };

const GRUNT_ROWS = [
  "...AA...",
  "..AAAA..",
  ".AABBAA.",
  "AACCCCAA",
  "AACCCCAA",
  ".AABBAA.",
  "..AAAA..",
  "...AA...",
];

const GRUNT_PAL = { A:0x8a3dff, B:0x1c0f3a, C:0xff5fd2 };

const SHOOTER_ROWS = [
  "..A....A..",
  ".AAA..AAA.",
  ".ABAAAABA.",
  "AABBBBBBAA",
  "AABCCCCBAA",
  "AABBBBBBAA",
  ".A.AAAA.A.",
  "...A..A...",
];

const SHOOTER_PAL = { A:0x24d18a, B:0x0c3d2c, C:0xff4f4f };

const DRONE_ROWS = [
  "..AAAA..",
  ".AABBAA.",
  "AACCCCAA",
  "AACCCCAA",
  ".AABBAA.",
  "..AAAA..",
];

const DRONE_PAL = { A:0xffb23d, B:0x4a2600, C:0xfff0c2 };

// Heavy armored enemy — unlocks later, slow but tough
const TANK_ROWS = [
  ".AAAAAAAA.",
  "AABBBBBBAA",
  "AABCCCCBAA",
  "AABCDDCBAA",
  "AABCDDCBAA",
  "AABCCCCBAA",
  "AABBBBBBAA",
  ".AA.AA.AA.",
];

const TANK_PAL = { A:0x3a3a4a, B:0x6a6a80, C:0x232330, D:0xff6a4f };

// Small fast swarmer — unlocks later, comes in numbers
const SWARMER_ROWS = [
  ".A.",
  "ABA",
  ".A.",
];

const SWARMER_PAL = { A:0xff4fd6, B:0xfff0ff };

// --- 12 new enemy types ---
const DIVER_ROWS = [ "..A..", ".AAA.", "AABAA", ".ABA.", "..C.." ];

const DIVER_PAL = { A:0xff3b30, B:0xffe14f, C:0xff8a3d };

const TURRET_ROWS = [
  "..AAAA..",
  ".A.BB.A.",
  "AABBBBAA",
  "AABCCBAA",
  ".AABBAA.",
  "...DD...",
];

const TURRET_PAL = { A:0x4a4a5a, B:0x7a8a9a, C:0xff3b6b, D:0x2a2a35 };

const SPLITTER_ROWS = [
  ".AAAA.",
  "AABBAA",
  "ABBBBA",
  "ABBBBA",
  "AABBAA",
  ".AAAA.",
];

const SPLITTER_PAL = { A:0x1a6b3a, B:0x6bffb0 };

const SHIELDED_GRUNT_ROWS = [
  "....RR....",
  "..R.AA.R..",
  ".R.AAAA.R.",
  "R.AABBAA.R",
  "R.ACCCCA.R",
  "R.ACCCCA.R",
  "R.AABBAA.R",
  ".R.AAAA.R.",
  "..R.AA.R..",
  "....RR....",
];

const SHIELDED_GRUNT_PAL = { A:0x8a3dff, B:0x1c0f3a, C:0xff5fd2, R:0x4ff2ff };

const BOMBER_ROWS = [
  ".AAAAAA.",
  "AABBBBAA",
  "AABCCBAA",
  "AABBBBAA",
  ".AAAAAA.",
  "...DD...",
  "..DEED..",
  "...DD...",
];

const BOMBER_PAL = { A:0x5a5a6a, B:0x3a3a4a, C:0xffcf3d, D:0x8a1a1a, E:0xff3b3b };

const SNIPER_ROWS = [
  "...A...",
  "..AAA..",
  ".AABAA.",
  "AABBBAA",
  ".AABAA.",
  "..AAA..",
  "...C...",
];

const SNIPER_PAL = { A:0x2a2a3a, B:0x6a8ac9, C:0xff2020 };

const HEALER_ROWS = [
  ".......",
  "..AAA..",
  ".AABAA.",
  "AABBBAA",
  ".AABAA.",
  "..AAA..",
  ".......",
];

const HEALER_PAL = { A:0x0c6b5a, B:0x4ff7d0 };

const MINE_ROWS = [
  "...A.A...",
  "..AAAAA..",
  ".AABBBAA.",
  "AABBCBBAA",
  ".AABBBAA.",
  "..AAAAA..",
  "...A.A...",
];

const MINE_PAL = { A:0x5a1a1a, B:0x8a2a2a, C:0xffcf3d };

const GHOST_ROWS = [
  "..AAAA..",
  ".AABBAA.",
  "AABBBBAA",
  "AABBBBAA",
  "AABBBBAA",
  ".A.AA.A.",
  "A.A..A.A",
  ".A....A.",
];

const GHOST_PAL = { A:0x6a4fff, B:0xcfc0ff };

const ELITE_ROWS = [
  "..AAAAAA..",
  ".AABBBBAA.",
  "AABBCCBBAA",
  "AABCCCCBAA",
  "AABCDDCBAA",
  "AABCDDCBAA",
  "AABCCCCBAA",
  "AABBCCBBAA",
  ".AABBBBAA.",
  "..AA..AA..",
];

const ELITE_PAL = { A:0x2a1a3a, B:0x6a3dff, C:0xffcf3d, D:0xff3b6b };

const MOTHERSHIP_ROWS = [
  "D..AAAAA..D",
  "..AABBBAA..",
  ".AABBBBBAA.",
  "AABBBCBBBAA",
  ".AABBBBBAA.",
  "..AABBBAA..",
  "D....A....D",
];

const MOTHERSHIP_PAL = { A:0xff8a3d, B:0xffcf7a, C:0xff3b3b, D:0xff4fd6 };

const VORTEX_ROWS = [
  "..AAAAA..",
  ".AA...AA.",
  "A..BBB..A",
  "A.BB.BB.A",
  "A.B.C.B.A",
  "A.BB.BB.A",
  "A..BBB..A",
  ".AA...AA.",
  "..AAAAA..",
];

const VORTEX_PAL = { A:0x2a0a4a, B:0x6a3dff, C:0xffe14f };

const BOMB_ROWS = [ ".AA.", "AEEA", "AEEA", ".AA." ];

const BOMB_PAL = { A:0x8a1a1a, E:0xff3b3b };

const BOSS_ROWS = [
  "......AAAAAA......",
  "....AABBBBBBAA....",
  "...AABBCCCCBBAA...",
  "..AABBCCDDCCBBAA..",
  ".AAABBCCCDDCCCBBAAA".slice(0,19),
  "AAABBBCCCCCCCCBBBAA",
  "AAABBB.CCCCCC.BBBAA",
  ".AABBB..EEEE..BBAA.",
  "..AABB......BBAA...",
  "...AAB.EEEE.BAA....",
  "....AA.EEEE.AA.....",
  ".....A.E..E.A......",
];

const BOSS_PAL = { A:0x3a0f14, B:0xff2f4f, C:0xff9a3d, D:0xffe14f, E:0x2b0a0d };

const BULLET_P_ROWS = [ ".A.", "AAA", ".A." ];

const BULLET_P_PAL = { A:0x9ff7ff };

const LASER_ROWS = [ ".A.", ".B.", ".B.", ".B.", ".B.", ".B.", ".A." ];

const LASER_PAL = { A:0xffffff, B:0x5fe0ff };

const MISSILE_ROWS = [ ".A.", "ABA", "ABA", ".C." ];

const MISSILE_PAL = { A:0xff9a3d, B:0xffe14f, C:0xff5f4f };

const BULLET_E_ROWS = [ "AA", "AA" ];

const BULLET_E_PAL = { A:0xff5f5f };

const BULLET_HEAVY_ROWS = [
  ".AAA.",
  "ABBBA",
  "ABBBA",
  "ABBBA",
  ".AAA.",
];

const BULLET_HEAVY_PAL = { A:0x8a2020, B:0xff6a3d };
