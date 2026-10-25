"use strict";
// Méthodes de GameScene — particules : bris de bouclier, traînée de réacteur, impacts.
mixin(GameScene, {
  /* ---------- PARTICLES ---------- */
  spawnShieldBreak(gold){
    sfx.shieldBreak();
    const C = gold ? { ring:0xffd24a, spark:0xffe27a, fl:[255,210,74] } : { ring:0x66f0ff, spark:0x9ffaff, fl:[79,242,255] };
    const px = this.player.x, py = this.player.y, ang = this.player.angle;
    const kz = Phaser.Math.Clamp(1/this.cameras.main.zoom, 1, 2.4);   // l'effet grossit quand on dézoome
    // onde de choc cyan bien visible, même très dézoomé
    const ring = this.add.image(px, py, 'shockRing').setDepth(12).setBlendMode(Phaser.BlendModes.ADD).setTint(C.ring).setScale(0.15).setAlpha(0.95);
    this.tweens.add({ targets: ring, scaleX: 190*kz/256, scaleY: 190*kz/256, duration: 420, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: ring, alpha: 0, duration: 420, delay: 80, onComplete: ()=> ring.destroy() });
    const shipKey = ['playerBase','playerBase','playerT2','playerT3','playerT4'][this.shipTier];
    // l'aura éclate vers l'extérieur en gardant la forme du vaisseau
    const aura = this.add.image(px, py, 'aura_' + shipKey).setDepth(12).setAlpha(0.9).setAngle(ang).setScale(PLAYER_SHIP_SCALE);
    if (gold) aura.setTintFill(0xffd24a);
    this.tweens.add({
      targets: aura, scale: PLAYER_SHIP_SCALE*1.9*kz, alpha: 0, duration: 520, ease: 'Linear',
      onComplete: ()=> aura.destroy()
    });
    // flash blanc sur la silhouette
    const flash = this.add.image(px, py, shipKey).setDepth(12).setAngle(ang).setScale(PLAYER_SHIP_SCALE).setTintFill(0xffffff).setAlpha(0.8);
    this.tweens.add({ targets: flash, alpha: 0, duration: 104, onComplete: ()=> flash.destroy() });
    // éclats
    for (let i=0;i<18;i++){
      const a = i/18*6.2832 + Math.random()*0.3;
      const r = (230*PLAYER_SHIP_SCALE + 40*PLAYER_SHIP_SCALE) * kz * 1.15;
      const sq = this.add.rectangle(px, py, 3*kz, 3*kz, C.spark).setDepth(12);
      sq.setPosition(px + Math.cos(a)*7, py + Math.sin(a)*7);
      this.tweens.add({
        targets: sq, x: px + Math.cos(a)*r, y: py + Math.sin(a)*r, scale: 0, alpha: 0, duration: 520, ease: 'Linear',
        onComplete: ()=> sq.destroy()
      });
    }
    this.cameras.main.flash(160, C.fl[0], C.fl[1], C.fl[2], false);
    this.spawnHitParticles(px, py, 14);
  },

  spawnEngineTrail(){
    const tier = this.engineUpgradeCount >= 3 ? 2 : (this.engineUpgradeCount >= 1 ? 1 : 0);
    const key = tier >= 2 ? 'particle3' : (Math.random()<0.5 ? 'particle1' : 'particle3');
    const scale = tier >= 2 ? 1.2 : (tier === 1 ? 1.0 : 0.9);
    const offsets = tier >= 2 ? [-5, 5] : [Phaser.Math.Between(-4,4)];
    offsets.forEach(ox=>{
      const p = this.add.image(this.player.x + ox, this.player.y + 20, key);
      p.setDepth(9);
      p.setScale(scale);
      this.tweens.add({
        targets:p,
        y: p.y + 22,
        scale: 0.2,
        alpha: 0,
        duration: 260,
        onComplete: ()=>p.destroy()
      });
    });
  },

  spawnHitParticles(x,y,count){
    const nowP = this.time.now;
    if (nowP - (this._pT || 0) > 100){ this._pT = nowP; this._pN = 0; }
    if (this._pN > 36) return;           // budget de particules par 100 ms (pendant un wipe massif)
    this._pN += count;
    for (let i=0;i<count;i++){
      const key = 'particle'+Phaser.Math.Between(0,3);
      const p = this.add.image(x,y,key);
      p.setDepth(6);
      const angle = Math.random()*Math.PI*2;
      const speed = 40+Math.random()*120;
      const vx = Math.cos(angle)*speed, vy = Math.sin(angle)*speed;
      this.tweens.add({
        targets:p,
        x: x+vx*0.4, y: y+vy*0.4,
        alpha:0,
        duration: 300+Math.random()*200,
        onComplete: ()=>p.destroy()
      });
    }
  },
});
