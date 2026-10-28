"use strict";
// Registre des stats de base des ennemis, extrait de spawnOneEnemy (src/enemies/spawning.js).
// COUVRE : hp (avant hpScale), dmg (dégâts de contact), score, vitesse verticale de départ
//   vy (+ vyRand : étendue aléatoire flottante ; vyBetween : tirage entier [min,max] ; noScale : non multipliée par la difficulté),
//   shield (bouclier de base du shieldedGrunt, avant hpScale). Valeurs IDENTIQUES au code d'origine.
// NE COUVRE PAS (restent dans spawnOneEnemy) : stopY, fireCd et autres minuteurs/tirages, drapeaux de comportement,
//   boucliers d'alerte, dérive et ondulation.
// Surcharge par niveau : lvDef.mobs[type] = { hpMul, dmgMul, speedMul, scoreMul } (multiplicateurs, absent = 1).
// Les PV des bras / pilleur / eclaireur sont lus à l'appel dans BRAS / PIL / EC (définis plus loin).
const ENEMY_STATS = {
  grunt:         { hp:12, dmg:8, score:8, vy:55, vyRand:30 },
  shooter:       { hp:20, dmg:10, score:16, vy:46 },
  drone:         { hp:9, dmg:8, score:12, vy:34 },
  tank:          { hp:60, dmg:16, score:30, vy:24 },
  swarmer:       { hp:5, dmg:6, score:6, vy:110, vyRand:30 },
  diver:         { hp:8, dmg:10, score:10, vy:130 },
  turret:        { hp:25, dmg:4, score:20, vy:20, noScale:true },
  splitter:      { hp:18, dmg:8, score:14, vy:50 },
  splitterMini:  { hp:6, dmg:5, score:4, vy:70 },
  shieldedGrunt: { hp:10, dmg:9, score:18, vy:60, shield:15 },
  mine:          { hp:20, dmg:22, score:10, vy:18, noScale:true },
  sat:           { hp:22, dmg:9, score:12, vyBetween:[55,90] },
  satgun:        { hp:32, dmg:8, score:26, vy:42 },
  bras:          { get hp(){ return BRAS.hp; }, dmg:10, score:40, vy:40 },
  pilleur:       { get hp(){ return PIL.hp; }, dmg:9, score:45, vy:36 },
  eclaireur:     { get hp(){ return EC.hp; }, dmg:9, score:40, vy:40 },
  bomber:        { hp:16, dmg:8, score:20, vy:40 },
  sniper:        { hp:14, dmg:6, score:22, vy:30, noScale:true },
  healer:        { hp:12, dmg:6, score:24, vy:45 },
  ghost:         { hp:16, dmg:10, score:18, vy:70 },
  elite:         { hp:120, dmg:20, score:60, vy:30 },
  mothership:    { hp:45, dmg:10, score:35, vy:25 },
  vortex:        { hp:30, dmg:5, score:26, vy:16, noScale:true },
  golden:        { hp:10, dmg:1, score:60, vy:0, noScale:true },
  kamikaze:      { hp:14, dmg:1, score:14, vy:55 },
  spider:        { hp:18, dmg:9, score:18, vy:44 },
  charo:         { hp:24, dmg:11, score:20, vy:50 },
};

// stats d'un type fusionnées avec la surcharge du niveau (multiplicateurs ; absent = valeur d'origine)
function enemyStat(type, lvDef){
  const base = ENEMY_STATS[type];
  const st = Object.assign({}, base);                        // copie : exécute aussi les accesseurs (PV de BRAS/PIL/EC)
  const m = lvDef && lvDef.mobs && lvDef.mobs[type];
  st.speedMul = 1;
  if (m){
    if (m.hpMul !== undefined){ st.hp *= m.hpMul; if (st.shield !== undefined) st.shield *= m.hpMul; }
    if (m.dmgMul !== undefined) st.dmg *= m.dmgMul;
    if (m.scoreMul !== undefined) st.score *= m.scoreMul;
    if (m.speedMul !== undefined) st.speedMul = m.speedMul;
  }
  return st;
}

// vitesse verticale de départ (même arithmétique et même ordre de tirages aléatoires que l'ancien code)
function enemyVy(st, speedScale){
  const v = st.vyBetween ? Phaser.Math.Between(st.vyBetween[0], st.vyBetween[1]) : st.vy + (st.vyRand ? Math.random()*st.vyRand : 0);
  return v*(st.noScale ? 1 : speedScale)*st.speedMul;
}
