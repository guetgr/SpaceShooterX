"use strict";
// Construction des textures de boss, mobs et fonds au démarrage.

function buildBossPlaceholders(scene){
  // sprites 8 bits des boss, de leurs pièces et de leurs projectiles
  const map = { bossFaucheuse:'faucheuse', bossRuche:'ruche', bossPrisme:'prisme', bossKraken:'kraken', bossEclipse:'eclipse', bossHydre:'hydre',
                bpPod:'pod', bpMirror:'mirror', bpSeg:'seg', bpHead:'head', bpSpore:'spore', bpInk:'ink' };
  Object.keys(map).forEach(key=> buildPixelSheet(scene, key, BOSS_ART[map[key]]));
  // petite animation à 2 images pour les corps (noyau qui pulse, oeil qui se dilate, couronne qui scintille...)
  ['faucheuse','ruche','prisme','kraken','eclipse','hydre'].forEach(n=>{
    const key = 'boss' + n.charAt(0).toUpperCase() + n.slice(1);
    scene.anims.create({ key:n+'Idle', frames:scene.anims.generateFrameNumbers(key, {start:0,end:1}), frameRate:3, repeat:-1 });
  });
}

function buildMobArt(scene){
  buildPixelSheet(scene, 'mobKamikaze', MOB_ART.kamikaze);
  buildPixelSheet(scene, 'mobSpider', MOB_ART.spider);
  buildPixelSheet(scene, 'mobGolden', MOB_ART2.golden);
  buildPixelSheet(scene, 'mobMeteor', MOB_ART2.meteor);
  scene.anims.create({ key:'goldenIdle', frames:scene.anims.generateFrameNumbers('mobGolden', {start:0,end:1}), frameRate:6, repeat:-1 });
  scene.anims.create({ key:'kamikazeIdle', frames:scene.anims.generateFrameNumbers('mobKamikaze', {start:0,end:1}), frameRate:7, repeat:-1 });
  scene.anims.create({ key:'spiderIdle', frames:scene.anims.generateFrameNumbers('mobSpider', {start:0,end:1}), frameRate:5, repeat:-1 });
}

function buildBackgroundTextures(scene){
  scene.textures.addCanvas('galaxySwirl', buildGalaxyCanvas(256));
  scene.textures.addCanvas('shockRing', buildShockRingCanvas(256));
  BG_ZONES.forEach((zone, i)=>{
    scene.textures.addCanvas('planetBig'+i, buildPlanetCanvas(78, zone.planet, zone.ring));
    scene.textures.addCanvas('planetSmall'+i, buildPlanetCanvas(36, zone.planet, zone.ring));
    const nebCanvas = buildNebulaCanvas(420, 360, zone.neb);
    if (zone.egg){
      // un seul petit point clair, à peine visible, comme perdu dans la nébuleuse
      const ectx = nebCanvas.getContext('2d');
      ectx.fillStyle = 'rgba(255,225,225,0.9)';
      ectx.fillRect(176, 196, 3, 3);
    }
    scene.textures.addCanvas('nebula'+i, nebCanvas);
  });
}

const PARTICLE_ROWS = [ "A" ];

const PARTICLE_PAL_LIST = [0xffce4a, 0xff8a3d, 0xff5f5f, 0x9ff7ff];
