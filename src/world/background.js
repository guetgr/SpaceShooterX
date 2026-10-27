"use strict";
// Méthodes de GameScene — fond étoilé, zones de décor, zoom et limites visibles.
mixin(GameScene, {
  buildStarfield(){
    this.stars = [];
    const layers = [
      { key:'star0', count:170, speed:22 },
      { key:'star1', count:110, speed:46 },
      { key:'star2', count:60,  speed:78 },
    ];
    layers.forEach(layer=>{
      for (let i=0;i<layer.count;i++){
        const s = this.add.image(Phaser.Math.Between(-STAR_PAD_X,GAME_W+STAR_PAD_X), Phaser.Math.Between(-STAR_PAD_Y,GAME_H+STAR_PAD_Y), layer.key);
        s.speed = layer.speed;
        s.setDepth(0);
        this.stars.push(s);
      }
    });
  },

  // tire un nouveau thème de fond (planètes + nébuleuse), différent du précédent.
  // instant=true au début de run ; sinon l'ancien décor "explose" en s'agrandissant /
  // s'éteignant pendant que le nouveau apparaît en fondu — plus de fond qui disparaît d'un coup
  pickBgZone(instant){
    if (this.worldBgKind()) return;                 // niveau avec son propre fond (world/bg-monde.js) : pas de planètes au hasard
    const old = this.bgDecor || [];
    this.bgDecor = [];
    old.forEach(d=>{
      if (instant){ d.destroy(); return; }
      this.tweens.add({
        targets:d, alpha:0, scaleX:d.scaleX*1.8, scaleY:d.scaleY*1.8, angle:d.angle+14,
        duration:1100, ease:'Cubic.easeOut', onComplete:()=> d.destroy()
      });
    });
    let idx;
    do {
      const totalW = BG_ZONES.reduce((a,z)=> a + (z.w||1), 0);
      let roll = Math.random()*totalW; idx = 0;
      for (let i=0;i<BG_ZONES.length;i++){ roll -= (BG_ZONES[i].w||1); if (roll <= 0){ idx = i; break; } }
    } while (idx === this.bgZoneIndex && BG_ZONES.length>1);
    this.bgZoneIndex = idx;

    const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    const place = (img, alpha)=>{
      img.setAlpha(instant ? alpha : 0);
      if (!instant) this.tweens.add({ targets:img, alpha:alpha, duration:1800, delay:500, ease:'Sine.easeInOut' });
      this.bgDecor.push(img);
    };

    const neb = this.add.image(Phaser.Math.Between(vx.min+60, vx.max-60), vy.min + (vy.max-vy.min)*0.35, 'nebula'+idx);
    neb.setDepth(-2); neb.speed = 5;
    place(neb, 0.8);

    const planetCount = Phaser.Math.Between(1,2);
    const placed = [];
    for (let i=0;i<planetCount;i++){
      const big = Math.random() < 0.5;
      const rad = big ? 78 : 36;
      // on garde les chevauchements PARTIELS (ça donne de belles superpositions), on évite
      // seulement qu'une planète tombe quasi pile sur une autre : on tire plusieurs positions
      // et on garde la première assez écartée (centres à au moins 50% de la somme des rayons)
      let bx = 0, by = 0, tries = 0, ok = false;
      while (!ok && tries < 14){
        bx = Phaser.Math.Between(vx.min+rad+10, vx.max-rad-10);
        by = vy.min + (vy.max-vy.min)*(0.15 + 0.45*Math.random());
        ok = placed.every(q=> Phaser.Math.Distance.Between(bx,by,q.x,q.y) >= 0.5*(rad+q.rad));
        tries++;
      }
      const p = this.add.image(bx, by, big?'planetBig'+idx:'planetSmall'+idx);
      // la petite (plus rapide donc "plus proche") passe toujours DEVANT la grande : on ne perd jamais
      // une planète derrière l'autre, et deux planètes à égalité d'ordre ne se mélangent plus au hasard
      p.setDepth(big ? -1.2 : -0.9); p.speed = big ? 7 : 11; p.bodyR = rad;
      placed.push({x:bx, y:by, rad});
      place(p, 0.95);
    }
  },

  // "explosion galaxie" quand un boss meurt : onde de choc + spirale qui s'ouvre sur le fond
  galaxyBlast(x, y){
    sfx.galaxyBlast();
    const zone = BG_ZONES[Math.max(0,this.bgZoneIndex)] || BG_ZONES[0];
    const tint = Phaser.Display.Color.GetColor(...zone.neb.split(',').map(n=>Math.min(255, parseInt(n)+60)));
    const swirl = this.add.image(x, y, 'galaxySwirl');
    swirl.setDepth(1); swirl.setBlendMode(Phaser.BlendModes.ADD); swirl.setTint(tint);
    swirl.setScale(0.15); swirl.setAlpha(0.7);
    // l'agrandissement et le fondu ont des courbes séparées : la spirale reste bien visible avant de s'éteindre
    this.tweens.add({ targets:swirl, scaleX:5.5, scaleY:5.5, angle:220, duration:1900, ease:'Cubic.easeOut' });
    this.tweens.add({ targets:swirl, alpha:0, duration:1500, delay:400, ease:'Sine.easeIn', onComplete:()=>swirl.destroy() });
    for (let i=0;i<3;i++){
      const ring = this.add.image(x, y, 'shockRing');
      ring.setDepth(1); ring.setBlendMode(Phaser.BlendModes.ADD); ring.setTint(i===0?0xffffff:tint);
      ring.setScale(0.1); ring.setAlpha(1);
      this.tweens.add({ targets:ring, scaleX:7+i, scaleY:7+i, duration:1300+i*250, delay:i*160, ease:'Quad.easeOut' });
      this.tweens.add({ targets:ring, alpha:0, duration:900+i*250, delay:300+i*160, ease:'Sine.easeIn', onComplete:()=>ring.destroy() });
    }
    this.cameras.main.flash(260, 255, 255, 255, false);
    this.cameras.main.shake(420, 0.012);
    this.spawnHitParticles(x, y, 40);
  },

  // recale les planètes dans la zone réellement visible (appelé quand le zoom change d'un coup)
  fitBgToView(){
    const vx = this.visibleXRange(0);
    this.bgDecor.forEach(d=>{
      if (!d.bodyR) return;
      const m = d.bodyR + 10;
      d.x = Phaser.Math.Clamp(d.x, vx.min+m, vx.max-m);
    });
  },

  updateBgDecor(delta){
    this.bgDecor.forEach(d=>{
      d.y += d.speed * (1 + ((this._bgBoost||1) - 1) * 0.8) * (delta/1000);
      const vyD = this.visibleYRange(0), vxD = this.visibleXRange(0);
      if (d.y - d.height/2 > vyD.max + 50){
        d.y = vyD.min - d.height/2 - Phaser.Math.Between(0,200);
        const m = (d.bodyR || 0) + 10;
        d.x = Phaser.Math.Between(vxD.min+Math.max(30,m), vxD.max-Math.max(30,m));
      }
    });
  },

  // plus le niveau d'alerte est haut, plus on dézoome vite et loin (et ça continue
  // doucement avec le temps) — ça laisse la place à plus d'ennemis à l'écran
  computeZoom(){
    if (this.lvDef) return this.levelZoom();               // niveau d'un monde : dézoom lié à l'avancement du niveau (voir game/level.js)
    const a = this.alertLevel;
    const dur = ZOOM_DURATION / (1 + 0.25*(a-1));
    const endZ = ZOOM_END - 0.05*(a-1);
    const t = Math.min(1, this.elapsed / dur);
    const z = Phaser.Math.Linear(ZOOM_START, endZ, t);
    const creep = Math.min(0.15*(a-1)/5, Math.max(0, this.elapsed - dur)/600*0.15);
    const floorZ = a <= 8 ? 0.6 : Math.max(0.42, 0.6 - 0.02*(a-8));   // niveaux 9+: le dézoom va un peu plus loin
    return Math.max(floorZ, z - creep);
  },

  // largeur réellement visible à l'écran selon le zoom caméra en cours
  visibleXRange(margin){
    const z = this.cameras.main.zoom;
    const halfW = (GAME_W/z)/2;
    const cx = GAME_W/2;
    return { min: cx - halfW + margin, max: cx + halfW - margin };
  },

  // hauteur réellement visible à l'écran selon le zoom caméra en cours
  visibleYRange(margin){
    const z = this.cameras.main.zoom;
    const halfH = (GAME_H/z)/2;
    const cy = GAME_H/2;
    return { min: cy - halfH + margin, max: cy + halfH - margin };
  },

  setTarget(x,y){
    if (this.introActive) return;                                    // commandes verrouillées pendant le décollage
    const vis = this.visibleXRange(22);
    this.playerTarget.x = Phaser.Math.Clamp(x, vis.min, vis.max);
    const vyT = this.visibleYRange(0), zT = this.cameras.main.zoom;
    this.playerTarget.y = Phaser.Math.Clamp(y, vyT.min + 60/zT, vyT.max - 30/zT);
  },
});
