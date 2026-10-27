"use strict";
// Scène de chargement : crée toutes les textures et animations.

class BootScene extends Phaser.Scene{
  constructor(){ super('boot'); }
  create(){
    // custom art assets are added directly to the texture manager (not the file loader) —
    // this avoids a Phaser limitation where base64 data can't go through load.spritesheet()
    // when the page itself is opened from disk (file://) instead of a real server.
    const CUSTOM_TEXTURES = [
      { key:'gruntSheet',   src:GRUNT_SHEET_B64,   fw:220, fh:270, n:4 },
      { key:'explosionSheet', src:EXPLOSION_SHEET_B64, fw:180, fh:180, n:6 },
      { key:'turretSheet',  src:TURRET_SHEET_B64,  fw:260, fh:300, n:4 },
      { key:'turretExpl',   src:TURRET_EXPL_B64,   fw:180, fh:180, n:5 },
      { key:'turretBullet', src:TURRET_BULLET_B64, fw:0,   fh:0,   n:0 },
      { key:'diverSheet',   src:DIVER2_SHEET_B64,  fw:260, fh:320, n:4 },
      { key:'diverExpl',    src:DIVER2_EXPL_B64,   fw:170, fh:170, n:5 },
      { key:'shooterSheet', src:SHOOTER_SHEET_B64, fw:230, fh:310, n:4 },
      { key:'shooterExpl',  src:SHOOTER_EXPL_B64,  fw:200, fh:200, n:6 },
      { key:'shooterBullet',src:SHOOTER_BULLET_B64,fw:0,   fh:0,   n:0 },
      { key:'droneSheet',   src:DRONE2_SHEET_B64,  fw:220, fh:200, n:4 },
      { key:'droneExpl',    src:DRONE2_EXPL_B64,   fw:170, fh:170, n:5 },
      { key:'tankSheet',    src:TANK2_SHEET_B64,   fw:240, fh:260, n:4 },
      { key:'tankExpl',     src:TANK2_EXPL_B64,    fw:170, fh:170, n:5 },
      { key:'tankBullet2',  src:TANK2_BULLET_B64,  fw:0,   fh:0,   n:0 },
      { key:'eliteSheet',   src:ELITE2_SHEET_B64,  fw:240, fh:290, n:4 },
      { key:'eliteExpl',    src:ELITE2_EXPL_B64,   fw:170, fh:170, n:5 },
      { key:'eliteBullet',  src:ELITE2_BULLET_B64, fw:0,   fh:0,   n:0 },
      { key:'charoSheet',   src:CHARO_SHEET_B64,   fw:230, fh:280, n:4 },
      { key:'charoExpl',    src:CHARO_EXPL_B64,    fw:170, fh:170, n:5 },
      { key:'charoBullet',  src:CHARO_BULLET_B64,  fw:0,   fh:0,   n:0 },
      { key:'bomberSheet',  src:BOMBER2_SHEET_B64, fw:250, fh:300, n:4 },
      { key:'bomberExpl',   src:BOMBER2_EXPL_B64,  fw:170, fh:170, n:5 },
      { key:'bomberBullet2',src:BOMBER2_BULLET_B64,fw:0,   fh:0,   n:0 },
      { key:'swarmerSheet', src:SWARMER2_SHEET_B64,fw:220, fh:260, n:4 },
      { key:'swarmerExpl',  src:SWARMER2_EXPL_B64, fw:180, fh:180, n:4 },
      { key:'homeEarth',    src:asset('home/earth-orbital.png'), fw:0, fh:0, n:0 },
      { key:'earth',        src:EARTH_B64,         fw:0,   fh:0,   n:0 },
      { key:'planetSrcW2',  src:PLANET_W2_B64,     fw:0,   fh:0,   n:0 },
      { key:'planetSrcW3',  src:PLANET_W3_B64,     fw:0,   fh:0,   n:0 },
      { key:'cloudsEarth',  src:CLOUDS_EARTH_B64,  fw:0,   fh:0,   n:0 },
      { key:'uiFrag',       src:UI_ICONS.frag,    fw:0,   fh:0,   n:0 },
      { key:'uiStar',       src:UI_ICONS.star,    fw:0,   fh:0,   n:0 },
      { key:'orbitW1',      src:ORBIT_W1_B64,      fw:0,   fh:0,   n:0 },
      { key:'playerBase',   src:PLAYER_BASE_B64,   fw:0,   fh:0,   n:0 },
      { key:'playerT2',     src:PLAYER_T2_B64,     fw:0,   fh:0,   n:0 },
      { key:'playerT3',     src:PLAYER_T3_B64,     fw:0,   fh:0,   n:0 },
      { key:'playerT4',     src:PLAYER_T4_B64,     fw:0,   fh:0,   n:0 },
      { key:'bulletP2',     src:PLAYER_BULLET_B64, fw:0,   fh:0,   n:0 },
      { key:'missile2',     src:PLAYER_MISSILE_B64,fw:0,   fh:0,   n:0 },
      { key:'bossSheet',    src:BOSS2_SHEET_B64,   fw:200, fh:220, n:8 },
      { key:'bossExpl',     src:BOSS2_EXPL_B64,    fw:200, fh:200, n:5 },
      { key:'tutoSat',      src:TUTO_SAT_B64,      fw:165, fh:145, n:15 },
      { key:'acBoss0', src:AC_BOSS_B64[0], fw:0, fh:0, n:0 }, { key:'acBoss1', src:AC_BOSS_B64[1], fw:0, fh:0, n:0 }, { key:'acBoss2', src:AC_BOSS_B64[2], fw:0, fh:0, n:0 }, { key:'acBoss3', src:AC_BOSS_B64[3], fw:0, fh:0, n:0 },
      { key:'acFxFlame', src:AC_FX_B64.flame, fw:64, fh:96, n:12 }, { key:'acFxSmoke', src:AC_FX_B64.smoke, fw:96, fh:96, n:10 }, { key:'acFxSpark', src:AC_FX_B64.spark, fw:64, fh:64, n:8 },
      { key:'acFxImpact', src:AC_FX_B64.impact, fw:96, fh:96, n:8 }, { key:'acFxOrb', src:AC_FX_B64.orb, fw:64, fh:128, n:8 }, { key:'acFxCharge', src:AC_FX_B64.charge, fw:128, fh:128, n:12 },
      { key:'acFxMuzzle', src:AC_FX_B64.muzzle, fw:128, fh:128, n:6 }, { key:'acFxBoom', src:AC_FX_B64.boom, fw:256, fh:256, n:14 }, { key:'acFxShock', src:AC_FX_B64.shock, fw:192, fh:192, n:10 },
      { key:'tutoDebris',   src:TUTO_DEBRIS_B64,   fw:48,  fh:48,  n:TUTO_NDEB },
      { key:'satgunSheet',  src:SATGUN_SHEET_B64,  fw:200, fh:200, n:26 },
      { key:'brasSheet',    src:BRAS_SHEET_B64,    fw:512, fh:512, n:4 },
      { key:'brFxOrb', src:BR_FX_B64.orb, fw:64, fh:128, n:8 }, { key:'brFxCharge', src:BR_FX_B64.charge, fw:128, fh:128, n:12 }, { key:'brFxMuzzle', src:BR_FX_B64.muzzle, fw:128, fh:128, n:6 },
      { key:'arSheet', src:AR_SHEET_B64, fw:512, fh:512, n:4 }, { key:'arFxMissile', src:AR_FX_B64.missile, fw:64, fh:192, n:8 }, { key:'arFxBoomL', src:AR_FX_B64.boomL, fw:256, fh:256, n:14 }, { key:'arFxShock', src:AR_FX_B64.shock, fw:192, fh:192, n:10 },
      { key:'mtSheet', src:MT_SHEET_B64, fw:512, fh:512, n:4 }, { key:'mtFxHail', src:MT_FX_B64.hail, fw:48, fh:96, n:8 }, { key:'mtFxIceb', src:MT_FX_B64.iceb, fw:96, fh:96, n:8 }, { key:'mtFxFcharge', src:MT_FX_B64.fcharge, fw:128, fh:128, n:12 },
      { key:'mtFxFmuzzle', src:MT_FX_B64.fmuzzle, fw:128, fh:128, n:6 }, { key:'mtFxBolt', src:MT_FX_B64.bolt, fw:64, fh:300, n:8 }, { key:'mtFxArc', src:MT_FX_B64.arc, fw:128, fh:48, n:8 }, { key:'mtFxGlow', src:MT_FX_B64.glow, fw:96, fh:96, n:8 },
      { key:'mtFxCharge', src:MT_FX_B64.charge, fw:128, fh:128, n:12 }, { key:'mtFxMuzzle', src:MT_FX_B64.muzzle, fw:128, fh:128, n:6 }, { key:'mtFxImpact', src:MT_FX_B64.impact, fw:96, fh:96, n:8 }, { key:'mtFxSpark', src:MT_FX_B64.spark, fw:64, fh:64, n:8 },
      { key:'mtFxBoomM', src:MT_FX_B64.boomM, fw:160, fh:160, n:14 }, { key:'mtFxBoomL', src:MT_FX_B64.boomL, fw:256, fh:256, n:14 }, { key:'mtFxShock', src:MT_FX_B64.shock, fw:192, fh:192, n:10 },
      { key:'ltRadar', src:LT_B64.radar, fw:0, fh:0, n:0 }, { key:'ltBeacon', src:LT_B64.beacon, fw:0, fh:0, n:0 }, { key:'ltRotorToxic', src:LT_B64.rotor_toxic, fw:0, fh:0, n:0 }, { key:'ltRotorAmber', src:LT_B64.rotor_amber, fw:0, fh:0, n:0 },
      { key:'ltRotorFire', src:LT_B64.rotor_fire, fw:0, fh:0, n:0 }, { key:'ltRotorHot', src:LT_B64.rotor_hot, fw:0, fh:0, n:0 },
      { key:'rxSheet', src:RX_SHEET_B64, fw:512, fh:512, n:4 }, { key:'rxFxOrb', src:RX_FX_B64.orb, fw:64, fh:128, n:8 }, { key:'rxFxArc', src:RX_FX_B64.arc, fw:128, fh:48, n:8 }, { key:'rxFxFlame', src:RX_FX_B64.flame, fw:64, fh:96, n:12 },
      { key:'rxFxCharge', src:RX_FX_B64.charge, fw:128, fh:128, n:12 }, { key:'rxFxMuzzle', src:RX_FX_B64.muzzle, fw:128, fh:128, n:6 }, { key:'rxFxImpact', src:RX_FX_B64.impact, fw:96, fh:96, n:8 }, { key:'rxFxSpark', src:RX_FX_B64.spark, fw:64, fh:64, n:8 },
      { key:'rxFxGlow', src:RX_FX_B64.glow, fw:96, fh:96, n:8 }, { key:'rxFxBoomM', src:RX_FX_B64.boomM, fw:160, fh:160, n:14 }, { key:'rxFxBoomL', src:RX_FX_B64.boomL, fw:256, fh:256, n:14 }, { key:'rxFxShock', src:RX_FX_B64.shock, fw:192, fh:192, n:10 },
      { key:'plSheet', src:PL_SHEET_B64, fw:512, fh:512, n:4 }, { key:'plFxBeam', src:PL_FX_B64.beam, fw:64, fh:128, n:8 }, { key:'plFxSuction', src:PL_FX_B64.suction, fw:192, fh:192, n:8 }, { key:'plFxCharge', src:PL_FX_B64.charge, fw:128, fh:128, n:12 },
      { key:'plFxMuzzle', src:PL_FX_B64.muzzle, fw:128, fh:128, n:6 }, { key:'plFxGlow', src:PL_FX_B64.glow, fw:96, fh:96, n:8 }, { key:'plFxSpark', src:PL_FX_B64.spark, fw:64, fh:64, n:8 }, { key:'plFxImpact', src:PL_FX_B64.impact, fw:96, fh:96, n:8 },
      { key:'anSheet', src:AN_SHEET_B64, fw:512, fh:512, n:4 }, { key:'anFxBeam', src:AN_FX_B64.beam, fw:64, fh:128, n:8 }, { key:'anFxRotor', src:AN_FX_B64.rotor, fw:0, fh:0, n:0 }, { key:'anFxOrb', src:AN_FX_B64.orb, fw:64, fh:128, n:8 }, { key:'anFxOrbHot', src:AN_FX_B64.orbHot, fw:64, fh:128, n:8 },
      { key:'anFxMuzzle', src:AN_FX_B64.muzzle, fw:128, fh:128, n:6 }, { key:'anFxCharge', src:AN_FX_B64.charge, fw:128, fh:128, n:12 }, { key:'anFxImpact', src:AN_FX_B64.impact, fw:96, fh:96, n:8 }, { key:'anFxSpark', src:AN_FX_B64.spark, fw:64, fh:64, n:8 },
      { key:'anFxGlow', src:AN_FX_B64.glow, fw:96, fh:96, n:8 }, { key:'anFxGlowHot', src:AN_FX_B64.glowHot, fw:96, fh:96, n:8 }, { key:'anFxBoomM', src:AN_FX_B64.boomM, fw:160, fh:160, n:14 }, { key:'anFxBoomL', src:AN_FX_B64.boomL, fw:256, fh:256, n:14 }, { key:'anFxShock', src:AN_FX_B64.shock, fw:192, fh:192, n:10 },
      { key:'ecSheet', src:EC_SHEET_B64, fw:512, fh:512, n:4 }, { key:'ecFxCone', src:EC_FX_B64.cone, fw:160, fh:256, n:8 }, { key:'ecFxConeHot', src:EC_FX_B64.coneHot, fw:160, fh:256, n:8 }, { key:'ecFxReticle', src:EC_FX_B64.reticle, fw:128, fh:128, n:12 },
      { key:'pdSheet', src:PD_SHEET_B64, fw:512, fh:512, n:4 }, { key:'pgSheet', src:PG_SHEET_B64, fw:512, fh:512, n:4 }, { key:'gdSheet', src:GD_SHEET_B64, fw:512, fh:512, n:4 },
      { key:'pdFxBeam', src:PD_FX_B64.beam, fw:64, fh:128, n:8 }, { key:'pdFxOrb', src:PD_FX_B64.orb, fw:64, fh:128, n:8 }, { key:'pdFxMuzzle', src:PD_FX_B64.muzzle, fw:128, fh:128, n:6 }, { key:'pdFxCharge', src:PD_FX_B64.charge, fw:128, fh:128, n:12 },
      { key:'pdFxImpact', src:PD_FX_B64.impact, fw:96, fh:96, n:8 }, { key:'pdFxGlow', src:PD_FX_B64.glow, fw:96, fh:96, n:8 }, { key:'pdFxSpark', src:PD_FX_B64.spark, fw:64, fh:64, n:8 }, { key:'pdFxBoomM', src:PD_FX_B64.boomM, fw:160, fh:160, n:14 },
      { key:'pdFxBoomL', src:PD_FX_B64.boomL, fw:256, fh:256, n:14 }, { key:'pdFxShock', src:PD_FX_B64.shock, fw:192, fh:192, n:10 }, { key:'pdFxFlame', src:PD_FX_B64.flame, fw:64, fh:96, n:12 }, { key:'pdFxIce', src:PD_FX_B64.ice, fw:96, fh:96, n:8 }, { key:'pdFxFrost', src:PD_FX_B64.frost, fw:128, fh:128, n:6 },
      { key:'brFxBoom', src:BR_FX_B64.boom, fw:160, fh:160, n:14 }, { key:'brFxImpact', src:BR_FX_B64.impact, fw:96, fh:96, n:8 },
      { key:'bossBullet2',  src:BOSS2_BULLET_B64,  fw:0,   fh:0,   n:0 },
      { key:'shieldedGrunt2', src:SHIELDEDGRUNT2_B64, fw:0, fh:0,  n:0 },
      { key:'shieldedGruntExpl', src:SHIELDEDGRUNT2_EXPL_B64, fw:180, fh:180, n:3 },
      { key:'mine2',        src:MINE2_B64,         fw:0,   fh:0,   n:0 },
      { key:'mineExpl',     src:MINE2_EXPL_B64,    fw:180, fh:180, n:5 },
      { key:'splitterIdle', src:SPLITTER_IDLE_B64, fw:100, fh:100, n:4 },
      { key:'splitterExpl', src:SPLITTER_EXPL_B64, fw:130, fh:130, n:5 },
      { key:'splitterMiniIdle', src:SPLITTER_MINI_IDLE_B64, fw:84, fh:84, n:4 },
      { key:'splitterMiniExpl', src:SPLITTER_MINI_EXPL_B64, fw:110, fh:110, n:5 },
      { key:'sniperIdle',   src:SNIPER_IDLE_B64,   fw:110, fh:130, n:4 },
      { key:'sniperBullet', src:SNIPER_BULLET_B64, fw:0,   fh:0,   n:0 },
      { key:'sniperExpl',   src:SNIPER_EXPL_B64,   fw:180, fh:180, n:5 },
      { key:'healerIdle',   src:HEALER_IDLE_B64,   fw:68,  fh:90,  n:8 },
      { key:'healerCast',   src:HEALER_CAST_B64,   fw:68,  fh:90,  n:9 },
      { key:'motherIdle',   src:MOTHER_IDLE_B64,   fw:104, fh:126, n:7 },
      { key:'motherCharge', src:MOTHER_CHARGE_B64, fw:104, fh:126, n:7 },
      { key:'motherDeath',  src:MOTHER_DEATH_B64,  fw:118, fh:204, n:4 },
      { key:'kamiIdle', src:KAMI_IDLE_B64, fw:82, fh:104, n:9 },
      { key:'kamiCharge', src:KAMI_CHARGE_B64, fw:65, fh:102, n:9 },
      { key:'kamiBoom', src:KAMI_BOOM_B64, fw:106, fh:119, n:4 },
      { key:'vortexIdle', src:VORTEX_IDLE_B64, fw:87, fh:96, n:7 },
      { key:'vortexArrive', src:VORTEX_ARRIVE_B64, fw:94, fh:113, n:7 },
      { key:'vortexDeath', src:VORTEX_DEATH_B64, fw:122, fh:166, n:4 },
      { key:'ghostIdle', src:GHOST_IDLE_B64, fw:87, fh:113, n:7 },
      { key:'ghostFade', src:GHOST_FADE_B64, fw:87, fh:113, n:7 },
      { key:'spIdle', src:SP_IDLE_B64, fw:72, fh:82, n:8 },
      { key:'spWalk', src:SP_WALK_B64, fw:87, fh:79, n:8 },
      { key:'spCrouch', src:SP_CROUCH_B64, fw:90, fh:74, n:6 },
      { key:'spArrive', src:SP_ARRIVE_B64, fw:88, fh:107, n:7 },
      { key:'spDeath', src:SP_DEATH_B64, fw:118, fh:173, n:4 },
      { key:'goIdle', src:GO_IDLE_B64, fw:93, fh:110, n:6 },
      { key:'goArrive', src:GO_ARRIVE_B64, fw:96, fh:111, n:6 },
      { key:'goDeath', src:GO_DEATH_B64, fw:118, fh:167, n:4 },
      { key:'fauP1', src:FAU_P1_B64, fw:104, fh:138, n:4 },
      { key:'fauP2', src:FAU_P2_B64, fw:108, fh:149, n:4 },
      { key:'fauP3', src:FAU_P3_B64, fw:112, fh:153, n:4 },
      { key:'fauSecond', src:FAU_SECOND_B64, fw:112, fh:150, n:4 },
      { key:'fauTrans', src:FAU_TRANS_B64, fw:130, fh:154, n:4 },
      { key:'fauStun', src:FAU_STUN_B64, fw:99, fh:125, n:4 },
      { key:'fauDive', src:FAU_DIVE_B64, fw:45, fh:110, n:4 },
      { key:'fauDeath', src:FAU_DEATH_B64, fw:148, fh:134, n:8 },
      { key:'fauCr', src:FAU_CR_B64, fw:54, fh:39, n:3 },
      { key:'ruP1', src:RU_P1_B64, fw:155, fh:160, n:4 },
      { key:'ruP2', src:RU_P2_B64, fw:168, fh:160, n:4 },
      { key:'ruP3', src:RU_P3_B64, fw:173, fh:177, n:4 },
      { key:'ruTrans', src:RU_TRANS_B64, fw:187, fh:151, n:4 },
      { key:'ruDeath', src:RU_DEATH_B64, fw:120, fh:127, n:8 },
      { key:'ruPod', src:RU_POD_B64, fw:104, fh:94, n:2 },
      { key:'ruSpore', src:RU_SPORE_B64, fw:73, fh:55, n:3 },
      { key:'prP1', src:B64_PRP1, fw:129, fh:160, n:4 },
      { key:'prP2', src:B64_PRP2, fw:128, fh:155, n:4 },
      { key:'prP3', src:B64_PRP3, fw:129, fh:159, n:4 },
      { key:'prSecond', src:B64_PRSECOND, fw:133, fh:158, n:4 },
      { key:'prDeath', src:B64_PRDEATH, fw:132, fh:106, n:9 },
      { key:'prMirror', src:B64_PRMIRROR, fw:38, fh:68, n:2 },
      { key:'prSpiral', src:B64_PRSPIRAL, fw:97, fh:71, n:3 },
      { key:'krP1', src:B64_KRP1, fw:96, fh:68, n:5 },
      { key:'krP2', src:B64_KRP2, fw:83, fh:67, n:8 },
      { key:'krP3', src:B64_KRP3, fw:99, fh:75, n:6 },
      { key:'krTrans', src:B64_KRTRANS, fw:105, fh:88, n:4 },
      { key:'krSecond', src:B64_KRSECOND, fw:199, fh:195, n:1 },
      { key:'krDeath', src:B64_KRDEATH, fw:115, fh:127, n:7 },
      { key:'krBall', src:B64_KRBALL, fw:94, fh:92, n:1 },
      { key:'krBase', src:B64_KRBASE, fw:86, fh:92, n:2 },
      { key:'ecP1', src:B64_ECP1, fw:136, fh:159, n:4 },
      { key:'ecP2', src:B64_ECP2, fw:136, fh:166, n:4 },
      { key:'ecP3', src:B64_ECP3, fw:148, fh:176, n:4 },
      { key:'ecSecond', src:B64_ECSECOND, fw:144, fh:158, n:4 },
      { key:'ecTrans', src:B64_ECTRANS, fw:121, fh:130, n:4 },
      { key:'ecMirage', src:B64_ECMIRAGE, fw:84, fh:142, n:4 },
      { key:'ecDecoy', src:B64_ECDECOY, fw:107, fh:121, n:4 },
      { key:'ecHalo', src:B64_ECHALO, fw:94, fh:101, n:4 },
      { key:'ecOrb', src:B64_ECORB, fw:94, fh:68, n:3 },
      { key:'ecDeath', src:B64_ECDEATH, fw:151, fh:129, n:7 },
      { key:'hyP1', src:B64_HYP1, fw:166, fh:85, n:4 },
      { key:'hyP2', src:B64_HYP2, fw:184, fh:83, n:4 },
      { key:'hyP3', src:B64_HYP3, fw:208, fh:86, n:4 },
      { key:'hyHead', src:B64_HYHEAD, fw:98, fh:116, n:5 },
      { key:'hyVenom', src:B64_HYVENOM, fw:76, fh:60, n:3 },
      { key:'hyDeath', src:B64_HYDEATH, fw:163, fh:187, n:6 },
      { key:'hyFull', src:B64_HYFULL, fw:191, fh:159, n:1 },
      { key:'drP1', src:B64_DRP1, fw:140, fh:129, n:4 },
      { key:'drP2', src:B64_DRP2, fw:145, fh:124, n:4 },
      { key:'drP3', src:B64_DRP3, fw:144, fh:141, n:4 },
      { key:'drSecond', src:B64_DRSECOND, fw:151, fh:141, n:4 },
      { key:'drTrans', src:B64_DRTRANS, fw:112, fh:116, n:4 },
      { key:'drDeath', src:B64_DRDEATH, fw:164, fh:104, n:10 },
      { key:'mtRed', src:B64_MTRED, fw:132, fh:127, n:4 },
      { key:'mtBlue', src:B64_MTBLUE, fw:127, fh:116, n:4 },
      { key:'mtViolet', src:B64_MTVIOLET, fw:114, fh:127, n:4 },
      { key:'mtBig', src:B64_MTBIG, fw:78, fh:84, n:5 },
      { key:'mtSmall', src:B64_MTSMALL, fw:46, fh:47, n:6 },
      { key:'mtDeath', src:B64_MTDEATH, fw:76, fh:86, n:7 },
      { key:'ruBee', src:B64_RUBEE, fw:96, fh:95, n:4 },
      { key:'hyStump', src:B64_HYSTUMP, fw:65, fh:107, n:4 },
      { key:'hyRegrow', src:B64_HYREGROW, fw:67, fh:123, n:7 },
      { key:'ghostExpl', src:GHOST_EXPL_B64, fw:153, fh:172, n:2 },
    ];
    this.pendingCustomTextures = CUSTOM_TEXTURES.length;
    const byKey = {};
    CUSTOM_TEXTURES.forEach(t=> byKey[t.key] = t);
    const onTextureAdded = (key)=>{
      const t = byKey[key];
      if (!t) return;
      if (t.n > 0) this.sliceIntoFrames(key, t.fw, t.fh, t.n);
      this.pendingCustomTextures -= 1;
      if (this.pendingCustomTextures <= 0){
        this.textures.off('addtexture', onTextureAdded);
        this.finishBoot();
      }
    };
    this.textures.on('addtexture', onTextureAdded);
    CUSTOM_TEXTURES.forEach(t=> this.textures.addBase64(t.key, t.src));
  }

  sliceIntoFrames(key, frameWidth, frameHeight, count){
    const tex = this.textures.get(key);
    for (let i=0;i<count;i++){
      tex.add(i, 0, i*frameWidth, 0, frameWidth, frameHeight);
    }
  }

  finishBoot(){
    this.anims.create({ key:'gruntFly', frames:this.anims.generateFrameNumbers('gruntSheet', {start:0,end:3}), frameRate:10, repeat:-1 });
    this.anims.create({ key:'explodeGrunt', frames:this.anims.generateFrameNumbers('explosionSheet', {start:0,end:5}), frameRate:18, repeat:0 });
    this.anims.create({ key:'turretIdle', frames:this.anims.generateFrameNumbers('turretSheet', {start:0,end:3}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'explodeTurret', frames:this.anims.generateFrameNumbers('turretExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'diverFly', frames:this.anims.generateFrameNumbers('diverSheet', {start:0,end:3}), frameRate:12, repeat:-1 });
    this.anims.create({ key:'explodeDiver', frames:this.anims.generateFrameNumbers('diverExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'shooterFly', frames:this.anims.generateFrameNumbers('shooterSheet', {start:0,end:3}), frameRate:10, repeat:-1 });
    this.anims.create({ key:'explodeShooter', frames:this.anims.generateFrameNumbers('shooterExpl', {start:0,end:5}), frameRate:18, repeat:0 });
    this.anims.create({ key:'droneFly', frames:this.anims.generateFrameNumbers('droneSheet', {start:0,end:3}), frameRate:9, repeat:-1 });
    this.anims.create({ key:'explodeDrone', frames:this.anims.generateFrameNumbers('droneExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'tankIdle', frames:this.anims.generateFrameNumbers('tankSheet', {start:0,end:3}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'explodeTank', frames:this.anims.generateFrameNumbers('tankExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'eliteIdle', frames:this.anims.generateFrameNumbers('eliteSheet', {start:0,end:3}), frameRate:9, repeat:-1 });
    this.anims.create({ key:'explodeElite', frames:this.anims.generateFrameNumbers('eliteExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'charoFly', frames:this.anims.generateFrameNumbers('charoSheet', {start:0,end:3}), frameRate:11, repeat:-1 });
    this.anims.create({ key:'explodeCharo', frames:this.anims.generateFrameNumbers('charoExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'bomberFly', frames:this.anims.generateFrameNumbers('bomberSheet', {start:0,end:3}), frameRate:9, repeat:-1 });
    this.anims.create({ key:'satgunIdle', frames:this.anims.generateFrameNumbers('satgunSheet', {start:0,end:4}), frameRate:6, repeat:-1 });
    this.anims.create({ key:'satgunCharge', frames:this.anims.generateFrameNumbers('satgunSheet', {start:5,end:6}), frameRate:9, repeat:-1 });
    this.anims.create({ key:'satgunRecoil', frames:this.anims.generateFrameNumbers('satgunSheet', {start:7,end:8}), frameRate:10, repeat:0 });
    [['brOrb', 'brFxOrb', 7, 16, -1], ['brCharge', 'brFxCharge', 11, 26, 0], ['brMuzzle', 'brFxMuzzle', 5, 30, 0], ['explodeBras', 'brFxBoom', 13, 24, 0], ['brImpact', 'brFxImpact', 7, 28, 0]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // mob « Bras écartés » (enemies/bras.js)
    [['arMissile', 'arFxMissile', 7, 16, -1], ['arBoomL', 'arFxBoomL', 13, 24, 0], ['arShock', 'arFxShock', 9, 22, 0]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // boss « Araignée de tri » (bosses/araignee.js)
    [['mtHail', 'mtFxHail', 7, 16, -1], ['mtIceb', 'mtFxIceb', 7, 24, 0], ['mtFcharge', 'mtFxFcharge', 11, 16, 0], ['mtFmuzzle', 'mtFxFmuzzle', 5, 24, 0], ['mtBolt', 'mtFxBolt', 7, 20, -1], ['mtArc', 'mtFxArc', 7, 20, -1], ['mtArc1', 'mtFxArc', 7, 20, 0],
     ['mtGlow', 'mtFxGlow', 7, 12, -1], ['mtCharge', 'mtFxCharge', 11, 16, 0], ['mtMuzzle', 'mtFxMuzzle', 5, 24, 0], ['mtImpact', 'mtFxImpact', 7, 24, 0], ['mtSpark', 'mtFxSpark', 7, 24, 0], ['mtBoomM', 'mtFxBoomM', 13, 24, 0], ['mtBoomL', 'mtFxBoomL', 13, 24, 0], ['mtShock', 'mtFxShock', 9, 22, 0]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // boss « La Météo » (bosses/meteo.js)
    [['rxOrb', 'rxFxOrb', 7, 16, -1], ['rxArc', 'rxFxArc', 7, 20, -1], ['rxArc1', 'rxFxArc', 7, 20, 0], ['rxFlame', 'rxFxFlame', 11, 16, -1], ['rxCharge', 'rxFxCharge', 11, 16, 0], ['rxMuzzle', 'rxFxMuzzle', 5, 24, 0], ['rxImpact', 'rxFxImpact', 7, 24, 0],
     ['rxSpark', 'rxFxSpark', 7, 24, 0], ['rxGlow', 'rxFxGlow', 7, 12, -1], ['rxBoomM', 'rxFxBoomM', 13, 24, 0], ['rxBoomL', 'rxFxBoomL', 13, 24, 0], ['rxShock', 'rxFxShock', 9, 22, 0],
     ['plBeam', 'plFxBeam', 7, 20, -1], ['plSuction', 'plFxSuction', 7, 16, -1], ['plCharge', 'plFxCharge', 11, 16, 0], ['plMuzzle', 'plFxMuzzle', 5, 24, 0], ['plGlow', 'plFxGlow', 7, 12, -1], ['plSpark', 'plFxSpark', 7, 24, 0], ['plImpact', 'plFxImpact', 7, 24, 0]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // boss « Le Réacteur » (bosses/reacteur.js) et mob « Le Pilleur » (enemies/pilleur.js)
    [['anBeam', 'anFxBeam', 7, 20, -1], ['anOrb', 'anFxOrb', 7, 16, -1], ['anOrbHot', 'anFxOrbHot', 7, 16, -1], ['anMuzzle', 'anFxMuzzle', 5, 24, 0], ['anCharge', 'anFxCharge', 11, 16, 0], ['anImpact', 'anFxImpact', 7, 24, 0], ['anSpark', 'anFxSpark', 7, 24, 0],
     ['anGlow', 'anFxGlow', 7, 12, -1], ['anGlowHot', 'anFxGlowHot', 7, 12, -1], ['anBoomM', 'anFxBoomM', 13, 24, 0], ['anBoomL', 'anFxBoomL', 13, 24, 0], ['anShock', 'anFxShock', 9, 22, 0],
     ['ecCone', 'ecFxCone', 7, 14, -1], ['ecConeHot', 'ecFxConeHot', 7, 14, -1]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // boss « L'Anneau » (bosses/anneau.js) et mob « L'Éclaireur » (enemies/eclaireur.js)
    this.anims.create({ key:'ecRetIn', frames:this.anims.generateFrameNumbers('ecFxReticle', { start:0, end:8 }), frameRate:24, repeat:0 }); this.anims.create({ key:'ecRetLoop', frames:this.anims.generateFrameNumbers('ecFxReticle', { start:8, end:11 }), frameRate:12, repeat:-1 });
    [['pdBeam', 'pdFxBeam', 7, 20, -1], ['pdOrb', 'pdFxOrb', 7, 16, -1], ['pdMuzzle', 'pdFxMuzzle', 5, 24, 0], ['pdCharge', 'pdFxCharge', 11, 16, 0], ['pdImpact', 'pdFxImpact', 7, 24, 0], ['pdGlow', 'pdFxGlow', 7, 12, -1], ['pdSpark', 'pdFxSpark', 7, 24, 0],
     ['pdBoomM', 'pdFxBoomM', 13, 24, 0], ['pdBoomL', 'pdFxBoomL', 13, 24, 0], ['pdShock', 'pdFxShock', 9, 22, 0], ['pdFlame', 'pdFxFlame', 11, 16, -1], ['pdIce', 'pdFxIce', 7, 24, 0], ['pdFrost', 'pdFxFrost', 5, 20, 0]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // boss final « Le PDG » (bosses/pdg.js)
    this.anims.create({ key:'explodeSatgun', frames:this.anims.generateFrameNumbers('satgunSheet', {start:18,end:25}), frameRate:14, repeat:0 });
    [['acFlame', 'acFxFlame', 11, 18, -1], ['acSmoke', 'acFxSmoke', 9, 9, 0], ['acSpark', 'acFxSpark', 7, 30, 0], ['acImpact', 'acFxImpact', 7, 28, 0], ['acOrb', 'acFxOrb', 7, 16, -1], ['acCharge', 'acFxCharge', 11, 26, 0], ['acMuzzle', 'acFxMuzzle', 5, 30, 0], ['acBoom', 'acFxBoom', 13, 24, 0], ['acShock', 'acFxShock', 9, 22, 0]]
      .forEach(a=> this.anims.create({ key:a[0], frames:this.anims.generateFrameNumbers(a[1], { start:0, end:a[2] }), frameRate:a[3], repeat:a[4] }));      // effets du boss du tuto (feuilles de la bibliothèque d'effets)
    this.anims.create({ key:'explodeSat', frames:this.anims.generateFrameNumbers('tutoSat', {start:6,end:14}), frameRate:12, repeat:0 });
    this.anims.create({ key:'explodeBomber', frames:this.anims.generateFrameNumbers('bomberExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'swarmerFly', frames:this.anims.generateFrameNumbers('swarmerSheet', {start:0,end:3}), frameRate:13, repeat:-1 });
    this.anims.create({ key:'explodeSwarmer', frames:this.anims.generateFrameNumbers('swarmerExpl', {start:0,end:3}), frameRate:16, repeat:0 });
    this.anims.create({ key:'bossIdle', frames:this.anims.generateFrameNumbers('bossSheet', {start:0,end:7}), frameRate:10, repeat:-1 });
    this.anims.create({ key:'explodeBoss2', frames:this.anims.generateFrameNumbers('bossExpl', {start:0,end:4}), frameRate:14, repeat:0 });
    this.anims.create({ key:'explodeShieldedGrunt', frames:this.anims.generateFrameNumbers('shieldedGruntExpl', {start:0,end:2}), frameRate:14, repeat:0 });
    this.anims.create({ key:'explodeMine2', frames:this.anims.generateFrameNumbers('mineExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'splitterFly', frames:this.anims.generateFrameNumbers('splitterIdle', {start:0,end:3}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'explodeSplitter', frames:this.anims.generateFrameNumbers('splitterExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'splitterMiniFly', frames:this.anims.generateFrameNumbers('splitterMiniIdle', {start:0,end:3}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'explodeSplitterMini', frames:this.anims.generateFrameNumbers('splitterMiniExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    this.anims.create({ key:'sniperFly', frames:this.anims.generateFrameNumbers('sniperIdle', {start:0,end:3}), frameRate:7, repeat:-1 });
    this.anims.create({ key:'healerFly', frames:this.anims.generateFrameNumbers('healerIdle', {start:0,end:7}), frameRate:9, repeat:-1 });
    this.anims.create({ key:'healerCastAnim', frames:this.anims.generateFrameNumbers('healerCast', {start:0,end:8}), frameRate:14, repeat:0 });
    this.anims.create({ key:'kamiFly', frames:this.anims.generateFrameNumbers('kamiIdle', {start:0,end:8}), frameRate:12, repeat:-1 });
    this.anims.create({ key:'kamiChargeAnim', frames:this.anims.generateFrameNumbers('kamiCharge', {start:0,end:8}), frameRate:16, repeat:-1 });
    this.anims.create({ key:'explodeKami', frames:this.anims.generateFrameNumbers('kamiBoom', {start:0,end:3}), frameRate:14, repeat:0 });
    this.anims.create({ key:'vortexSpin', frames:this.anims.generateFrameNumbers('vortexIdle', {start:0,end:6}), frameRate:10, repeat:-1 });
    this.anims.create({ key:'vortexArriveAnim', frames:this.anims.generateFrameNumbers('vortexArrive', {start:0,end:6}), frameRate:10, repeat:0 });
    this.anims.create({ key:'explodeVortex', frames:this.anims.generateFrameNumbers('vortexDeath', {start:0,end:3}), frameRate:9, repeat:0 });
    this.anims.create({ key:'ghostFly', frames:this.anims.generateFrameNumbers('ghostIdle', {start:0,end:6}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'ghostFadeOut', frames:this.anims.generateFrameNumbers('ghostFade', {start:0,end:6}), frameRate:12, repeat:0 });
    this.anims.create({ key:'ghostFadeIn', frames:this.anims.generateFrameNumbers('ghostFade', {start:0,end:6}).reverse(), frameRate:12, repeat:0 });
    this.anims.create({ key:'ghostPhaseLoop', frames:this.anims.generateFrameNumbers('ghostFade', {frames:[4,5,6,5]}), frameRate:6, repeat:-1 });
    this.anims.create({ key:'explodeGhost', frames:this.anims.generateFrameNumbers('ghostExpl', {start:0,end:1}), frameRate:6, repeat:0 });
    this.anims.create({ key:'spiderIdleA', frames:this.anims.generateFrameNumbers('spIdle', {start:0,end:7}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'spiderWalkA', frames:this.anims.generateFrameNumbers('spWalk', {start:0,end:7}), frameRate:12, repeat:-1 });
    this.anims.create({ key:'spiderCrouchA', frames:this.anims.generateFrameNumbers('spCrouch', {start:0,end:5}), frameRate:10, repeat:-1 });
    this.anims.create({ key:'spiderArriveA', frames:this.anims.generateFrameNumbers('spArrive', {start:0,end:6}).reverse(), frameRate:14, repeat:0 });
    this.anims.create({ key:'explodeSpider', frames:this.anims.generateFrameNumbers('spDeath', {start:0,end:3}), frameRate:9, repeat:0 });
    this.anims.create({ key:'goldenSpin', frames:this.anims.generateFrameNumbers('goIdle', {start:0,end:5}), frameRate:9, repeat:-1 });
    this.anims.create({ key:'goldenArriveA', frames:this.anims.generateFrameNumbers('goArrive', {start:0,end:5}).reverse(), frameRate:12, repeat:0 });
    this.anims.create({ key:'explodeGolden', frames:this.anims.generateFrameNumbers('goDeath', {start:0,end:3}), frameRate:9, repeat:0 });
    const fa=(key,tex,n,fr,rep)=> this.anims.create({ key, frames:this.anims.generateFrameNumbers(tex,{start:0,end:n-1}), frameRate:fr, repeat:rep });
    fa('mtRedA','mtRed',4,6,-1); fa('mtBlueA','mtBlue',4,6,-1); fa('mtVioletA','mtViolet',4,6,-1); fa('explodeMeteor','mtDeath',7,16,0);
    fa('ruBeeA','ruBee',4,14,-1); fa('hyStumpA','hyStump',4,8,-1); fa('hyRegrowA','hyRegrow',7,12,0);
    fa('drP1A','drP1',4,6,-1); fa('drP2A','drP2',4,7,-1); fa('drP3A','drP3',4,9,-1); fa('drSecondA','drSecond',4,8,-1); fa('drTransA','drTrans',4,8,0); fa('drDeathA','drDeath',10,10,0);
    fa('ecP1A','ecP1',4,6,-1); fa('ecP2A','ecP2',4,7,-1); fa('ecP3A','ecP3',4,9,-1); fa('ecSecondA','ecSecond',4,8,-1); fa('ecTransA','ecTrans',4,8,0);
    fa('ecMirageA','ecMirage',4,6,-1); fa('ecDecoyA','ecDecoy',4,6,-1); fa('ecHaloA','ecHalo',4,6,-1); fa('ecDeathA','ecDeath',7,9,0);
    fa('hyP1A','hyP1',4,5,-1); fa('hyP2A','hyP2',4,6,-1); fa('hyP3A','hyP3',4,8,-1); fa('hyDeathA','hyDeath',6,8,0);
    fa('prP1A','prP1',4,6,-1); fa('prP2A','prP2',4,7,-1); fa('prP3A','prP3',4,9,-1); fa('prSecondA','prSecond',4,8,-1); fa('prDeathA','prDeath',9,9,0);
    fa('krP1A','krP1',5,6,-1); fa('krP2A','krP2',8,9,-1); fa('krP3A','krP3',6,9,-1); fa('krTransA','krTrans',4,8,0); fa('krSecondA','krSecond',1,1,-1); fa('krDeathA','krDeath',7,9,0);
    fa('ruP1A','ruP1',4,6,-1); fa('ruP2A','ruP2',4,7,-1); fa('ruP3A','ruP3',4,9,-1); fa('ruTransA','ruTrans',4,8,0); fa('ruDeathA','ruDeath',8,9,0);
    fa('fauP1A','fauP1',4,7,-1); fa('fauP2A','fauP2',4,8,-1); fa('fauP3A','fauP3',4,10,-1); fa('fauSecondA','fauSecond',4,10,-1);
    fa('fauTransA','fauTrans',4,8,0); fa('fauStunA','fauStun',4,6,-1); fa('fauDiveA','fauDive',4,12,-1); fa('fauDeathA','fauDeath',8,9,0);
    this.anims.create({ key:'motherFly', frames:this.anims.generateFrameNumbers('motherIdle', {start:0,end:6}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'motherChargeAnim', frames:this.anims.generateFrameNumbers('motherCharge', {start:0,end:6}), frameRate:14, repeat:0 });
    this.anims.create({ key:'explodeMother', frames:this.anims.generateFrameNumbers('motherDeath', {start:0,end:3}), frameRate:9, repeat:0 });
    this.anims.create({ key:'explodeSniper', frames:this.anims.generateFrameNumbers('sniperExpl', {start:0,end:4}), frameRate:16, repeat:0 });
    buildPixelTexture(this, 'player', PLAYER_ROWS, PLAYER_PAL, 3);
    buildPixelTexture(this, 'player_t2', PLAYER_T2_ROWS, PLAYER_T2_PAL, 3);
    buildPixelTexture(this, 'player_t3', PLAYER_T3_ROWS, PLAYER_T3_PAL, 3);
    buildPixelTexture(this, 'grunt', GRUNT_ROWS, GRUNT_PAL, 3);
    buildPixelTexture(this, 'shooter', SHOOTER_ROWS, SHOOTER_PAL, 3);
    buildPixelTexture(this, 'drone', DRONE_ROWS, DRONE_PAL, 3);
    buildPixelTexture(this, 'tank', TANK_ROWS, TANK_PAL, 3);
    buildPixelTexture(this, 'swarmer', SWARMER_ROWS, SWARMER_PAL, 3);
    buildPixelTexture(this, 'diver', DIVER_ROWS, DIVER_PAL, 3);
    buildPixelTexture(this, 'turret', TURRET_ROWS, TURRET_PAL, 3);
    buildPixelTexture(this, 'splitter', SPLITTER_ROWS, SPLITTER_PAL, 3);
    buildPixelTexture(this, 'splitterMini', SPLITTER_ROWS, SPLITTER_PAL, 2);
    buildPixelTexture(this, 'shieldedGrunt', SHIELDED_GRUNT_ROWS, SHIELDED_GRUNT_PAL, 3);
    buildPixelTexture(this, 'bomber', BOMBER_ROWS, BOMBER_PAL, 3);
    buildPixelTexture(this, 'sniper', SNIPER_ROWS, SNIPER_PAL, 3);
    buildPixelTexture(this, 'healer', HEALER_ROWS, HEALER_PAL, 3);
    buildPixelTexture(this, 'mine', MINE_ROWS, MINE_PAL, 3);
    buildPixelTexture(this, 'ghost', GHOST_ROWS, GHOST_PAL, 3);
    buildPixelTexture(this, 'elite', ELITE_ROWS, ELITE_PAL, 3);
    buildPixelTexture(this, 'mothership', MOTHERSHIP_ROWS, MOTHERSHIP_PAL, 3);
    buildPixelTexture(this, 'vortex', VORTEX_ROWS, VORTEX_PAL, 3);
    buildPixelTexture(this, 'bomb', BOMB_ROWS, BOMB_PAL, 3);
    buildPixelTexture(this, 'boss', BOSS_ROWS, BOSS_PAL, 4);
    buildPixelTexture(this, 'bulletP', BULLET_P_ROWS, BULLET_P_PAL, 3);
    buildPixelTexture(this, 'laser', LASER_ROWS, LASER_PAL, 3);
    buildPixelTexture(this, 'missile', MISSILE_ROWS, MISSILE_PAL, 3);
    buildPixelTexture(this, 'bulletE', BULLET_E_ROWS, BULLET_E_PAL, 3);
    buildPixelTexture(this, 'bulletHeavy', BULLET_HEAVY_ROWS, BULLET_HEAVY_PAL, 3);
    // cristaux XP : 3 couleurs, 4 frames de scintillement chacune
    Object.keys(GEM_KINDS).forEach(k=>{
      if (this.textures.exists(k)) return;
      const tex = this.textures.addCanvas(k, buildGemStripCanvas(k));
      const cell = gemCell(k);
      GEM_SPARK.forEach((_, i)=> tex.add(i, 0, i*cell, 0, cell, cell));
      tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    });
    buildPixelTexture(this, 'heal', HEAL_ROWS, HEAL_PAL, 3);
    { const cv = document.createElement('canvas'); cv.width = cv.height = 40; const g = cv.getContext('2d');
      const gr = g.createRadialGradient(20,20,2,20,20,19); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.35,'rgba(110,235,255,0.95)'); gr.addColorStop(1,'rgba(30,120,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(20,20,19,0,6.2832); g.fill();
      g.fillStyle = '#0a3a6a'; g.beginPath(); g.moveTo(23,7); g.lineTo(13,22); g.lineTo(19,22); g.lineTo(16,33); g.lineTo(27,17); g.lineTo(21,17); g.closePath(); g.fill();
      this.textures.addCanvas('cell', cv); }
    buildPixelTexture(this, 'droneSat', DRONE_SAT_ROWS, DRONE_SAT_PAL, 3);
    for (let i=0;i<PARTICLE_PAL_LIST.length;i++){
      buildPixelTexture(this, 'particle'+i, PARTICLE_ROWS, {A:PARTICLE_PAL_LIST[i]}, 4);
    }
    // starfield textures (single pixel dots of varying brightness)
    buildPixelTexture(this, 'star0', ["A"], {A:0x555a8a}, 2);
    buildPixelTexture(this, 'star1', ["A"], {A:0x9aa4e0}, 2);
    buildPixelTexture(this, 'star2', ["A"], {A:0x7f8ad6}, 3);
    buildBackgroundTextures(this);
    buildBossPlaceholders(this);
    buildMobArt(this);

    // aura de bouclier : une par palier de vaisseau, calculée depuis le sprite
    ['playerBase','playerT2','playerT3','playerT4'].forEach(k=>{
      const ak = 'aura_' + k;
      if (this.textures.exists(ak)) return;
      const img = this.textures.get(k).getSourceImage();
      this.textures.addCanvas(ak, buildShieldAuraCanvas(img));
      this.textures.get(ak).setFilter(Phaser.Textures.FilterMode.LINEAR);
    });

    this.scene.start('game');
  }
}
