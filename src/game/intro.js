"use strict";
// Méthodes de GameScene — cinématique d'intro : décollage depuis la Terre.
mixin(GameScene, {
  /* ---------- BOSS ---------- */
  // traînée du décollage: flammes cyan et orange + traits de vitesse (s'estompent vers le bas)
  // ---------- DECOLLAGE DEPUIS LA TERRE ----------
  introEarthInit(){
    try { this.textures.get('earth').setFilter(Phaser.Textures.FilterMode.LINEAR); } catch(err){ /* ignore */ }      // la Terre est une image lisse (pas du pixel art): très zoomée, elle ne doit pas se pixelliser
    const e = this.add.image(0, 0, 'earth').setDepth(1.4);
    const glow = this.add.image(0, 0, 'shockRing').setDepth(1.45).setBlendMode(Phaser.BlendModes.ADD).setTint(0x4fa8ff).setAlpha(0);
    const veil = this.add.rectangle(GAME_W/2, GAME_H/2, GAME_W*3, GAME_H*3, 0xffffff, 0).setDepth(30);
    this._ie = { e, glow, veil, ring: 0, sndGo: false };
    this.player.setScale(PLAYER_SHIP_SCALE * 0.92);
    this.introEarthUpdate(0);
  },

  introEarthUpdate(delta){
    const ie = this._ie, T = this.introT, A = INTRO_E_A, B = INTRO_E_B, C = INTRO_E_C;
    if (!ie) return;
    const sx = this.player.x, sy = this.introEndY;
    const S0 = 9, S1 = 0.32, S2 = 0.18, TW = 768, AX = 480, AY = 300, CX = 384, CY = 384;      // AX/AY: le point de la Terre (côte africaine) sous le camion
    const eio = k => k < 0.5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3)/2;
    let S, ax = AX, ay = AY, offY = 0, rot = 0, shipK = 1, power = 1;
    if (T < A){
      const k = T / A; S = S0 * (1 - 0.08*k*k); rot = 0.02*k; shipK = 0.92 + 0.3*k*k; power = 0.4 + 0.6*k;
      if (ie.ring === 0 && T > 250){ ie.ring = 1; this.introApex(); }
      if (ie.ring === 1 && T > 750){ ie.ring = 2; this.introApex(); }
      this.cameras.main.shake(60, 0.0015 + 0.004*k);
    } else if (T < A + B){
      const k = (T - A) / B, e = eio(k);
      S = Math.exp(Phaser.Math.Linear(Math.log(S0*0.92), Math.log(S1), e));
      ax = Phaser.Math.Linear(AX, CX, e); ay = Phaser.Math.Linear(AY, CY, e); rot = 0.02 + 0.08*e;
      shipK = Phaser.Math.Linear(1.22, 1, Math.min(1, k*2.2)); power = 1;
      ie.veil.setAlpha(Math.max(0, 0.5*(1 - k*5)));                                    // flash blanc quand la caméra s'arrache
      if (!ie.sndGo){ ie.sndGo = true; if (sfx.apex) sfx.apex(); }
    } else {
      const k = Math.min(1, (T - A - B) / C);
      S = Phaser.Math.Linear(S1, S2, k); ax = CX; ay = CY; rot = 0.1;
      offY = Math.pow(k, 2.2) * (GAME_H*0.75 + S*CY + 220); power = 0.8;
      if (!this._introApex){ this._introApex = true; this.cameras.main.flash(140, 150, 225, 255, false); }
    }
    ie.e.setScale(S).setRotation(rot).setPosition(sx + (CX - ax)*S, sy + (CY - ay)*S + offY);
    const gs = S*TW/256*1.07, show = Phaser.Math.Clamp((2.2 - S)/1.6, 0, 1);
    ie.glow.setPosition(ie.e.x, ie.e.y).setScale(gs).setAlpha(0.7*show);
    this.player.setScale(PLAYER_SHIP_SCALE * shipK);
    this.hitCooldown = Math.max(this.hitCooldown, 300);
    this._introFx -= delta; if (this._introFx <= 0 && T < A + B + C*0.9){ this._introFx = 45; this.introTrail(power, 1); }
    if (T >= INTRO_E_TOTAL){
      this.player.setScale(PLAYER_SHIP_SCALE); this.player.y = this.introEndY;
      ie.e.destroy(); ie.glow.destroy(); ie.veil.destroy(); this._ie = null;
      this.introActive = false; this.playerTarget.y = this.introEndY; this.hitCooldown = Math.max(this.hitCooldown, 700); this.introLanding();
    }
  },

  introTrail(power, dir){
    dir = dir || 1;
    const px = this.player.x, py = this.player.y + 20*dir, run = 70*dir;                       // à la montée la traînée tombe derrière; à la descente, les rétro-fusées soufflent vers le haut
    [[0x7fe8ff, 0.07], [0xffb040, 0.045]].forEach(([col, sc])=>{
      const f = this.add.image(px + Phaser.Math.Between(-3, 3), py, 'shockRing').setDepth(4.5).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(sc * (0.6 + power)).setAlpha(0.8);
      this.tweens.add({ targets: f, y: py + run, alpha: 0, scaleX: sc*0.25, scaleY: sc*0.25, duration: 380, onComplete: ()=> f.destroy() });
    });
    [-22, 22].forEach(dx=>{
      const l = this.add.rectangle(px + dx, py - 10*dir, 2, 26 + 30*power, 0xcfeeff, 0.55).setDepth(4.4).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: l, y: py + 90*dir, alpha: 0, duration: 320, onComplete: ()=> l.destroy() });
    });
  },

  // sommet du décollage (milieu de l'écran): double onde de choc et flash léger
  introApex(){
    [[0x7fe8ff, 0.5], [0xffd27a, 0.32]].forEach(([col, sc], i)=>{
      const r = this.add.image(this.player.x, this.player.y, 'shockRing').setDepth(4.6).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(0.05).setAlpha(0.9);
      this.tweens.add({ targets: r, scaleX: sc, scaleY: sc, alpha: 0, duration: 520, delay: i*90, ease: 'Quad.easeOut', onComplete: ()=> r.destroy() });
    });
    this.cameras.main.flash(140, 150, 225, 255, false); this.cameras.main.shake(120, 0.003);
    if (sfx.apex) sfx.apex();
  },

  // atterrissage: petite onde de choc autour du vaisseau
  introLanding(){
    const r = this.add.image(this.player.x, this.player.y, 'shockRing').setDepth(4.6).setBlendMode(Phaser.BlendModes.ADD).setTint(0x7fe8ff).setScale(0.06).setAlpha(0.85);
    this.tweens.add({ targets: r, scaleX: 0.4, scaleY: 0.4, alpha: 0, duration: 450, ease: 'Quad.easeOut', onComplete: ()=> r.destroy() });
    if (sfx.landing) sfx.landing();
  },

  // position à l'écran -> gauche/droite (-0.8 à 0.8)
  panOf(x){ return Phaser.Math.Clamp(((x||GAME_W/2) - GAME_W/2) / (GAME_W/2) * 0.7, -0.8, 0.8); },
});
