"use strict";
// Statistiques de départ du joueur (makeDefaultStats).

function makeDefaultStats(){
  return {
    maxHp: 100,
    shieldMax: 0,
    damage: 10,
    fireRate: 340, // ms between shots
    bulletSpeed: 520,
    spreadCount: 1,
    moveResponsiveness: 11, // per-second smoothing rate, frame-rate independent
    magnetRadius: 60,
    pierce: 0,
    shieldPierce: 0,       // tirs perforants qui traversent les boucliers ennemis
    weaponMode: 'bullet', // 'bullet' | 'laser' | 'laserAuto' | 'shotgun'
    missileCount: 0,
    missileType: 'chercheur', // 'chercheur' | 'droit'
    missileMultiLock: 0,      // VERROU. MULTIPLE: les missiles chercheurs se répartissent sur 1 + N cibles
    hitGrace: 0,              // RESILIENCE: ms d'invincibilité en plus après un coup
    // fields the permanent skill tree can grow — all start neutral
    critChance: 0,
    hpRegenPct: 0,
    armorPct: 0,
    collisionMul: 1,   // multiplicateur des dégâts de collision (réduit par les compétences de blindage)
    lifesteal: 0,
    xpBonus: 0,
    gemChanceBonus: 0,
    autoCollect: 0,
    xpToNextMul: 1,
    healDropChance: 0,
    bonusGemChance: 0,
    fragmentBonus: 0,
    bigHeal: 0,
    dodgeCharges: 0,
    secondSouffle: 0,
    shieldReflect: 0,
    shieldRegenDelayMul: 1,
    missileFireRateMul: 1,
    missileBlastBonus: 0,
    missilePierce: 0,
    missileNapalm: 0,
    missileSpeedBonus: 0,
    missileDamageBonus: 0,
    laserSpeedBonus: 0,
    laserDamageBonus: 0,
    laserLockBonus: 0,
    laserPriority: false,
    shotgunExtraPellets: 0,
    shotgunRecoilReduction: 0,
    overdrive: 0,          // niveau de la compétence OVERDRIVE (0 = verrouillé)
    odDur: 6000,           // durée de l'overdrive (ms)
    odGraze: 1,            // multiplicateur de charge par tir frôlé
    odDmgMul: 2,           // multiplicateur de dégâts pendant l'overdrive
    odBossCharge: 0,       // % de jauge rendus à chaque boss vaincu
    chainLightning: 0,     // arcs de foudre par tir qui touche
    bounce: 0,             // rebonds des tirs sur les bords de l'écran
    shardCount: 0,         // éclats projetés par un ennemi tué
    thunder: 0,            // tonnerre périodique sur l'ennemi le plus solide
    slowField: 0,          // champ qui ralentit les tirs ennemis près du vaisseau
    pulsar: 0,             // onde périodique qui efface les tirs ennemis proches
    blackHole: 0,          // trou noir périodique qui attire les mobs
    blackHoleBoost: 0,
    cardChoices: 2,        // nombre de cartes proposées à chaque montée de niveau (les compétences en ajoutent, max 5)
    rerolls: 0,            // relances de cartes par partie (aucune de base)
    doubleCardChance: 0,   // chance qu'une carte choisie compte double
    bossReroll: 0,         // relances gagnées à chaque boss vaincu
    droneFireRateMul: 1,
    nebulaVision: 0,       // niveau du radar: allonge le cône de vision dans la nébuleuse
    droneDamageMul: 1,
    sangsueRadiusBonus: 0,
    sangsueHealMul: 1,
  };
}

// atouts GLOBAUX permanents : atelier (postes Mk I à V) puis reste de l'arbre ; appliqués à chaque mission et au tutoriel
function applyGlobalGear(stats, meta){
  atelierApply(stats, meta.atelier);
  ALL_TREE_NODES.forEach(node=>{
    const lvl = (meta.tree && meta.tree[node.id]) || 0;
    if (lvl > 0 && node.apply) node.apply(stats, lvl);
  });
}

function computeStartingStatsPreview(){
  const stats = makeDefaultStats();
  applyGlobalGear(stats, getMeta());
  applyAchvBuffs(stats, getAchv());
  return stats;
}
