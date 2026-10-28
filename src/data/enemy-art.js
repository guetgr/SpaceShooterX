"use strict";
// Table ENEMY_ART : quelle planche/animation pour quel ennemi.

const ENEMY_ART = {
  grunt:   { tex:'m_grunt_fly',   scale:0.13,  anim:'m_grunt_flyA', body:[150,150], boomTex:'m_grunt_boom', boom:'m_grunt_boomA', boomScale:0.3714 },
  turret:  { tex:'m_turret_fly',  scale:0.13,  anim:'m_turret_flyA', body:[130,140], boomTex:'m_turret_boom', boom:'m_turret_boomA', boomScale:0.3714, bulletTex:'turretBullet',  bulletScale:0.16 },
  diver:   { tex:'m_diver_fly',   scale:0.10,  anim:'m_diver_flyA', body:[110,150], boomTex:'m_diver_boom', boom:'m_diver_boomA', boomScale:0.2857 },
  shooter: { tex:'shooterSheet', scale:0.115, anim:'shooterFly',  body:[110,140], boomTex:'shooterExpl',    boom:'explodeShooter', boomScale:0.22, bulletTex:'shooterBullet', bulletScale:0.2 },
  drone:   { tex:'droneSheet',   scale:0.11,  anim:'droneFly',    body:[130,120], boomTex:'droneExpl',      boom:'explodeDrone',   boomScale:0.2 },
  tank:    { tex:'m_tank_fly',    scale:0.15,  anim:'m_tank_flyA', body:[180,190], boomTex:'m_tank_boom', boom:'m_tank_boomA', boomScale:0.4286, bulletTex:'tankBullet2',   bulletScale:0.22 },
  elite:   { tex:'eliteSheet',   scale:0.15,  anim:'eliteIdle',   body:[180,210], boomTex:'eliteExpl',      boom:'explodeElite',   boomScale:0.26, bulletTex:'eliteBullet',   bulletScale:0.2 },
  bomber:  { tex:'m_bomber_fly',  scale:0.12,  anim:'m_bomber_flyA', body:[150,170], boomTex:'m_bomber_boom', boom:'m_bomber_boomA', boomScale:0.3429, bulletTex:'bomberBullet2', bulletScale:0.2 },
  charo:   { tex:'charoSheet',   scale:0.115, anim:'charoFly',    body:[130,160], boomTex:'charoExpl',      boom:'explodeCharo',   boomScale:0.22, bulletTex:'charoBullet',   bulletScale:0.2 },
  swarmer: { tex:'swarmerSheet', scale:0.075, anim:'swarmerFly',  body:[90,90],   boomTex:'swarmerExpl',    boom:'explodeSwarmer', boomScale:0.16 },
  shieldedGrunt: { tex:'shieldedGrunt2', scale:0.11, anim:null,   body:[180,230], boomTex:'shieldedGruntExpl', boom:'explodeShieldedGrunt', boomScale:0.22 },
  mine:    { tex:'m_mine_fly',  scale:0.1,   anim:'m_mine_flyA', body:[170,170], boomTex:'m_mine_boom', boom:'m_mine_boomA', boomScale:0.2857 },
  boss:    { tex:'bossSheet',   scale:0.26,  anim:'bossIdle',    body:[190,210], boomTex:'bossExpl',       boom:'explodeBoss2',   boomScale:0.4 },
  meteor:   { tex:'mtRed', scale:1.0, flipY:false, body:[13,13], boomTex:'mtDeath', boom:'explodeMeteor', boomScale:1.0 },
  kamikaze: { tex:'m_kamikaze_fly', scale:0.6, anim:'m_kamikaze_flyA', body:[44,70], boomTex:'m_kamikaze_boom', boom:'m_kamikaze_boomA', boomScale:1.7143 },
  vortex:   { tex:'vortexIdle', scale:0.8, anim:'vortexArriveAnim', then:'vortexSpin', flipY:false, body:[60,60], boomTex:'vortexDeath', boom:'explodeVortex', boomScale:0.8 },
  ghost:    { tex:'ghostIdle', scale:0.62, anim:'ghostFly', flipY:false, body:[46,78], boomTex:'ghostExpl', boom:'explodeGhost', boomScale:0.55 },
  golden:   { tex:'goIdle', scale:0.6, anim:'goldenArriveA', then:'goldenSpin', flipY:false, body:[64,76], boomTex:'goDeath', boom:'explodeGolden', boomScale:0.55 },
  spider:   { tex:'spIdle', scale:0.7, anim:'spiderArriveA', then:'spiderWalkA', body:[52,52], boomTex:'spDeath', boom:'explodeSpider', boomScale:0.55 },
  splitter: { tex:'splitterIdle', scale:0.5, anim:'splitterFly', body:[85,85], boomTex:'splitterExpl', boom:'explodeSplitter', boomScale:0.62 },
  splitterMini: { tex:'splitterMiniIdle', scale:0.55, anim:'splitterMiniFly', body:[70,70], boomTex:'splitterMiniExpl', boom:'explodeSplitterMini', boomScale:0.55 },
  mothership: { tex:'motherIdle', scale:0.72, anim:'motherFly', body:[66,86], boomTex:'motherDeath', boom:'explodeMother', boomScale:0.5 },
  healer:  { tex:'healerIdle',  scale:0.62,  anim:'healerFly',   body:[40,58], boomTex:'explosionSheet', boom:'explodeGrunt', boomScale:0.4 },
  sat:      { tex:'tutoSat', scale:0.5, anim:null, flipY:false, body:[110,110], boomTex:'tutoSat', boom:'explodeSat', boomScale:0.5 },                       // satellite hors service (celui du tuto), dérive en lâchant des débris
  satgun:   { tex:'satgunSheet', scale:0.5, anim:'satgunIdle', flipY:false, body:[120,150], boomTex:'satgunSheet', boom:'explodeSatgun', boomScale:0.5 },     // satellite armé : se met en position, charge (lueur bleue), tire des orbes
  bras:     { tex:'brasSheet', scale:0.24, anim:null, flipY:false, body:[260,340], boomTex:'brFxBoom', boom:'explodeBras', boomScale:1.1 },                       // « Bras écartés » : quatre perches qui chargent et tirent en bleu (enemies/bras.js)
  pilleur:  { tex:'plSheet', scale:0.25, anim:null, flipY:false, body:[280,440], boomTex:'rxFxBoomM', boom:'rxBoomM', boomScale:0.75 },                         // « Le Pilleur de cristaux » : aspire les cristaux, alimente son laser (enemies/pilleur.js)
  eclaireur:{ tex:'ecSheet', scale:0.27, anim:null, flipY:false, body:[330,300], boomTex:'anFxBoomM', boom:'anBoomM', boomScale:0.8 },                          // « L'Éclaireur de patrouille » : drone-œil dont le projecteur te repère et te verrouille (enemies/eclaireur.js)
  sniper:  { tex:'sniperIdle',  scale:0.55,  anim:'sniperFly',   body:[90,110], boomTex:'sniperExpl',     boom:'explodeSniper',  boomScale:0.5, bulletTex:'sniperBullet', bulletScale:0.45 },
};
