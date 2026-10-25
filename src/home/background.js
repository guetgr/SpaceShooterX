"use strict";
const HOME_ORBIT = { cx:GAME_W/2, cy:252, rx:150, ry:58 };      // orbite des niveaux autour de la planète du monde
// Méthodes de HomeScene — décor : étoiles en parallaxe, nébuleuses, étoiles filantes, planète du monde, camionnette qui flotte.
mixin(HomeScene, {
  buildHomeBackground(){
    const W = GAME_W, H = GAME_H;
    // deux nébuleuses lentes (même texture que les zones de jeu), teintes différentes
    this.homeNeb = [[0x3a2a8a, 0.34, 330, 160, 2.6], [0x0f5a7a, 0.26, 60, 520, 2.2]].map(([tint, a, x, y, sc])=>{
      const n = this.add.image(x, y, 'galaxySwirl').setDepth(-3).setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setAlpha(a).setScale(sc);
      this.tweens.add({ targets:n, angle:360, duration:Phaser.Math.Between(140000, 200000), repeat:-1 });
      n._x = x; return n;
    });
    // 3 couches d'étoiles : plus c'est près, plus ça glisse vite (vers le bas) et plus la page les décale
    this.homeStars = [];
    [['star0', 120, 6, 0.10], ['star1', 80, 14, 0.22], ['star2', 40, 28, 0.40]].forEach(([key, count, speed, par])=>{
      for (let i = 0; i < count; i++){
        const s = this.add.image(Phaser.Math.Between(-60, W + 60), Phaser.Math.Between(-20, H + 20), key).setDepth(-2);
        s.vy = speed; s.par = par; s.bx = s.x;
        if (i % 4 === 0) this.tweens.add({ targets:s, alpha:0.25, duration:Phaser.Math.Between(900, 2600), yoyo:true, repeat:-1, delay:Phaser.Math.Between(0, 2000) });
        this.homeStars.push(s);
      }
    });
    this._shootCd = 2500; this.warp = 0;
  },

  updateHomeBackground(time, delta){
    const W = GAME_W, H = GAME_H, dt = delta/1000;
    this.homeStars.forEach(s=>{
      s.y += s.vy*dt*(1 + this.warp*26);                                          // hyperespace : les étoiles filent et s'étirent
      if (s.y > H + 20){ s.y = -20; s.bx = Phaser.Math.Between(-60, W + 60); }
      s.x = s.bx - this.pageX*W*s.par;
      s.scaleY = 1 + this.warp*7;
    });
    this.homeNeb.forEach(n=> n.x = n._x - this.pageX*W*0.06);
    this._shootCd -= delta;
    if (this._shootCd <= 0){                                  // étoile filante
      this._shootCd = Phaser.Math.Between(4500, 9000);
      const x = Phaser.Math.Between(40, W + 100), y = Phaser.Math.Between(-10, 220), ang = Phaser.Math.DegToRad(Phaser.Math.Between(115, 140));
      const t = this.add.rectangle(x, y, 46, 2, 0xcfe8ff).setDepth(-1).setRotation(ang).setAlpha(0);
      this.tweens.add({ targets:t, x:x + Math.cos(ang)*260, y:y + Math.sin(ang)*260, duration:620, ease:'Quad.easeIn' });
      this.tweens.add({ targets:t, alpha:{ from:0.9, to:0 }, duration:620, onComplete:()=> t.destroy() });
    }
  },

  // planète du monde affiché (texture procédurale, une par monde) + halo
  buildHomePlanet(){
    this.planetPos = { x:GAME_W/2, y:250, s:1.95 };            // position/taille de la planète du monde affiché (animées par les transitions)
    this.orbitA = 1;
    this.planetGlow = this.add.image(GAME_W/2, 250, 'shockRing').setDepth(-0.6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5);
    this.planet = this.add.image(GAME_W/2, 250, 'star0').setDepth(-0.5).setVisible(false);
    this.orbitBack = this.add.graphics().setDepth(-0.7); this.orbitFront = this.add.graphics().setDepth(0.5);
    this.drawHomeOrbit();
  },

  // orbite des niveaux : une ellipse autour de la planète, moitié arrière derrière elle, moitié avant devant
  drawHomeOrbit(){
    const O = HOME_ORBIT;
    [[this.orbitBack, Math.PI, Math.PI*2], [this.orbitFront, 0, Math.PI]].forEach(([g, a0, a1])=>{
      g.clear(); g.fillStyle(0x7fe8ff, 0.55);
      for (let a = a0; a < a1; a += 0.055) g.fillRect(Math.round(O.cx + O.rx*Math.cos(a)) - 1, Math.round(O.cy + O.ry*Math.sin(a)) - 1, 2, 2);
    });
  },

  setHomePlanet(world, locked){
    const th = world.theme || {};
    const key = makePlanetTexture(this, 'planet_' + world.id, { size:96, seed:th.seed || 1, freq:th.freq || 1.6, bands:th.bands || 0, rim:th.rim, palette:th.palette || [0x222244, 0x44448a, 0x8888cc] });
    this.planet.setTexture(key).setVisible(true).setTint(locked ? 0x2c3050 : 0xffffff);
    this.planetGlow.setVisible(true).setTint(locked ? 0x30345a : (th.glow || 0x4fa8ff));
  },

  buildHomeVan(){
    this.van = this.add.image(GAME_W/2, 620, 'playerBase').setDepth(2).setScale(0.22);
    this.vanBase = { x:GAME_W/2, y:620, s:0.22, a:1 };
    this.vanSway = 0;
    this.exhaust = this.add.particles(0, 0, 'star2', {
      lifespan:{ min:350, max:650 }, speedY:{ min:50, max:120 }, speedX:{ min:-14, max:14 }, scale:{ start:1.8, end:0 }, alpha:{ start:0.9, end:0 },
      tint:[0x7fe8ff, 0x4ff2ff, 0xffffff], blendMode:'ADD', frequency:35, quantity:1
    }).setDepth(1.9);
  },

  // fait voyager la camionnette entre les pages (position, taille, transparence)
  moveHomeVan(page){
    const to = page === -1 ? { x:GAME_W/2, y:184, s:0.45, a:1 } : (page === 1 ? { x:GAME_W/2, y:628, s:0.2, a:0 } : { x:GAME_W/2, y:432, s:0.22, a:1 });
    this.tweens.add({ targets:this.vanBase, x:to.x, y:to.y, s:to.s, a:to.a, duration:450, ease:'Cubic.easeInOut' });
  },

  // applique l'apparence choisie à la camionnette de l'accueil ; flash = petit éclat quand on change
  applyHomeSkin(flash){
    const t = shipSkinTint(getShipSkin());
    if (t) this.van.setTint(t); else this.van.clearTint();
    if (flash){
      this.van.setTintFill(0xffffff);
      this.time.delayedCall(90, ()=>{ if (t) this.van.setTint(t); else this.van.clearTint(); });
      const k = this.vanBase.s; this.tweens.add({ targets:this.vanBase, s:k*1.12, duration:110, yoyo:true, ease:'Quad.easeOut' });
    }
  },

  setHomeVanTier(threat){
    const key = ['playerBase', 'playerBase', 'playerT2', 'playerT3', 'playerT4'][Math.min(4, Math.max(1, threat || 1))];
    if (this.van.texture.key !== key) this.van.setTexture(key);
  },

  updateHomeVan(time){
    const b = this.vanBase, bob = Math.sin(time/700)*5*Math.max(0.4, b.s*2);
    this.van.setPosition(b.x + Math.sin(time/1900)*3, b.y + bob).setScale(b.s).setAlpha(b.a).setAngle(Math.sin(time/1500)*2);
    this.exhaust.setPosition(this.van.x, this.van.y + 118*b.s).setAlpha(b.a);
    // la planète et ses éléments suivent la page (glissement horizontal)
    const pp = this.planetPos, px = pp.x - this.pageX*GAME_W, pa = Math.max(0, 1 - Math.abs(this.pageX)*1.6), pulse = 1 + 0.012*Math.sin(time/1600);
    this.planet.setPosition(px, pp.y).setScale(pp.s*pulse).setAlpha(pa);
    this.planetGlow.setPosition(px, pp.y).setScale(pp.s*0.66*pulse).setAlpha(pa*(this.planetLocked ? 0.25 : 0.5));
    [this.orbitBack, this.orbitFront].forEach(g=> g.setPosition(-this.pageX*GAME_W, 0).setAlpha(pa*this.orbitA));
  },
});
