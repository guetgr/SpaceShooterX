"use strict";
// Méthodes de GameScene — dégâts subis par le joueur : armure, bouclier, esquive, réflexion.
mixin(GameScene, {
  // le vaisseau se dégrade avec ses PV: teinte qui s'assombrit, fissures, fumée, puis étincelles et flammes
  updateShipDamage(delta){
    const ratio = Math.max(0, Math.min(1, this.hp / this.stats.maxHp));
    const lvl = ratio < 0.25 ? 3 : (ratio < 0.5 ? 2 : (ratio < 0.75 ? 1 : 0));
    const kz = Phaser.Math.Clamp(1/this.cameras.main.zoom, 1, 2);    // visibles aussi en dézoom
    const step = Math.round((1 - ratio) * 20);
    if (step !== this._shipTintStep){
      this._shipTintStep = step;
      if (step === 0) this.applyShipSkin();
      else { const k = 1 - ratio; this.player.setTint(this.mulSkin(255 - Math.round(70*k), 255 - Math.round(140*k), 255 - Math.round(150*k))); }
    }
    const g = this.shipDmgGfx;
    g.clear();
    if (lvl === 0) return;
    const px = this.player.x, py = this.player.y;
    // fissures (de plus en plus nombreuses) ; au stade critique elles rougeoient
    const cracks = [
      [[-6,-14],[-2,-8],[-5,-2],[-1,4]],
      [[8,-6],[4,-1],[7,5],[3,11]],
      [[-14,2],[-9,5],[-11,10]],
      [[13,2],[9,6],[11,12]],
      [[0,-18],[3,-12],[0,-7]],
      [[-3,10],[-6,15],[-2,19]],
    ];
    const n = [0, 2, 4, 6][lvl];
    for (let i=0;i<n;i++){
      const pts = cracks[i];
      g.lineStyle(1.8*kz, 0x120c18, 0.9);
      g.beginPath(); g.moveTo(px+pts[0][0], py+pts[0][1]);
      for (let j=1;j<pts.length;j++) g.lineTo(px+pts[j][0], py+pts[j][1]);
      g.strokePath();
      if (lvl >= 3){
        g.lineStyle(0.9*kz, 0xff8a3c, 0.6);
        g.beginPath(); g.moveTo(px+pts[0][0]+0.6, py+pts[0][1]); 
        for (let j=1;j<pts.length;j++) g.lineTo(px+pts[j][0]+0.6, py+pts[j][1]);
        g.strokePath();
      }
    }
    // fumée derrière le vaisseau
    this.smokeCd -= delta;
    if (this.smokeCd <= 0){
      this.smokeCd = [999, 240, 130, 70][lvl];
      const puff = this.add.circle(px + Phaser.Math.Between(-7,7), py + 10, (3 + Math.random()*3)*kz, lvl >= 3 ? 0x3a3340 : 0x6a6a7a, 0.6).setDepth(11);
      this.tweens.add({ targets: puff, y: py + 46*kz, x: puff.x + Phaser.Math.Between(-10,10), scale: 2.2, alpha: 0, duration: 650, onComplete: ()=> puff.destroy() });
    }
    // étincelles (stade 2+) et flammes (stade 3)
    if (lvl >= 2){
      this.sparkCd -= delta;
      if (this.sparkCd <= 0){
        this.sparkCd = Phaser.Math.Between(700, 1500);
        const c = cracks[Phaser.Math.Between(0, n-1)][0];
        for (let i=0;i<4;i++){
          const sp = this.add.rectangle(px + c[0], py + c[1], 2*kz, 2*kz, i%2 ? 0xffe27a : 0x9ffaff).setDepth(12);
          const a = Math.random()*6.283, r = (14 + Math.random()*16)*kz;
          this.tweens.add({ targets: sp, x: sp.x + Math.cos(a)*r, y: sp.y + Math.sin(a)*r, alpha: 0, duration: 260, onComplete: ()=> sp.destroy() });
        }
      }
    }
    if (lvl >= 3 && Math.random() < 0.35){
      const fl = this.add.rectangle(px + Phaser.Math.Between(-9,9), py + Phaser.Math.Between(-4,12), 3*kz, 3*kz, Math.random()<0.5 ? 0xff7a2a : 0xffd04a).setDepth(12);
      this.tweens.add({ targets: fl, y: fl.y + 22*kz, alpha: 0, scale: 0.3, duration: 380, onComplete: ()=> fl.destroy() });
    }
  },

  damagePlayer(amount){
    if (this.hitCooldown > 0 || !this.running) return;
    if (this.odActive > 0){                         // OVERDRIVE: bouclier jaune sans limite de dégâts — tout est absorbé pendant toute la durée
      this.hitCooldown = 180; this.cameras.main.flash(70, 255, 210, 74, false); sfx.shieldHit(); return;
    }
    amount *= this.enemyDmgMul();
    if (this.dodgeInvuln > 0) return; // mid-dash immunity from ESQUIVE
    this.hitCooldown = 350 + (this.stats.hitGrace || 0); // short cooldown — damage still feels continuous under sustained contact (RESILIENCE l'allonge)
    this.shieldRegenDelay = 2600 * this.stats.shieldRegenDelayMul; // any hit (shield or hp) resets the regen delay

    if (this.odShield > 0){                         // bouclier invisible de l'overdrive: il encaisse comme un bouclier normal
      this.odShield -= amount;
      this.cameras.main.flash(110, 79, 242, 255, false);
      if (this.odShield <= 0){
        this.odShield = 0;
        this.spawnShieldBreak();
        this.hitCooldown = 550;
        
      } else {
        sfx.shieldHit();
      }
      return;
    }
    if (this.shield > 0){
      this.shield -= amount;
      this.shakeHud('shieldTrack', this.shield <= 0);
      this.cameras.main.flash(110, 79, 242, 255, false);
      if (this.stats.shieldReflect > 0){
        this.reflectShieldDamage(amount * 0.5 * this.stats.shieldReflect);
      }
      if (this.shield <= 0){
        this.shield = 0;
        this.spawnShieldBreak();
        this.hitCooldown = 550; // brief grace right as the shield pops, so the breaking hit doesn't also chunk HP
        
      } else {
        sfx.hurtShield();
      }
      this.updateHud(false);
      return;
    }

    const finalAmount = amount * (1 - this.stats.armorPct);
    this.hp -= finalAmount;
    if (this.combo.n > 0) this.bankCombo(true);
    if (!this.lastStandUsed && this.hp > 0 && this.hp <= this.stats.maxHp*0.12 && this.shield <= 0 && !(this.odShield > 0)) this.lastStand();    // seulement quand il ne reste que 12% de VIE et plus aucun bouclier
    this.shakeHud('hpTrack', this.hp < this.stats.maxHp*0.25);
    this.cameras.main.shake(120, 0.008);
    this.cameras.main.flash(90, 255, 79, 109, false);
    sfx.hurt();
    this.updateHud(false);
    if (this.hp <= 0){
      if (this.phoenixCharges > 0){
        this.phoenixCharges -= 1;
        this.hp = this.stats.maxHp*0.5;
        this.hitCooldown = 1200;
        this.cameras.main.flash(400, 255, 215, 106, false);
        sfx.relicOpen();
        this.updateHud(false);
        return;
      }
      this.hp = 0;
      this.endRun();
    }
  },

  reflectShieldDamage(amount){
    sfx.reflect();
    const lv = Math.max(1, this.stats.shieldReflect || 1), radius = 150 + 40*lv, dmg = 14*lv + amount*(1 + 0.08*(this.alertLevel-1));
    const px = this.player.x, py = this.player.y;
    const ring = this.add.image(px, py, 'shockRing').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0x7fe8ff).setAlpha(0.95).setScale(0.12);
    this.tweens.add({ targets:ring, scaleX:radius*2/256, scaleY:radius*2/256, alpha:0, duration:420, ease:'Quad.easeOut', onComplete:()=> ring.destroy() });
    const ring2 = this.add.image(px, py, 'shockRing').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffffff).setAlpha(0.7).setScale(0.08);
    this.tweens.add({ targets:ring2, scaleX:radius*1.5/256, scaleY:radius*1.5/256, alpha:0, duration:300, ease:'Quad.easeOut', onComplete:()=> ring2.destroy() });
    this.cameras.main.flash(80, 120, 230, 255, false);
    this.enemies.children.iterate(e=>{
      if (!e || !e.active || e.phased) return;
      const d = Phaser.Math.Distance.Between(px, py, e.x, e.y);
      if (d < radius){
        this.applyDamageToEnemy(e, dmg);
        if (e.active && e.enemyType !== 'boss' && !e.isBossPart && d > 1){ const k = (1 - d/radius)*70 + 20; e.x += (e.x - px)/d*k; e.y += (e.y - py)/d*k; }     // l'onde repousse
        if (e.active && e.hp <= 0) this.killEnemy(e);
      }
    });
    this.enemyBullets.children.iterate(b=>{ if (b && b.active && Phaser.Math.Distance.Between(px, py, b.x, b.y) < radius){ this.spawnHitParticles(b.x, b.y, 1); b.destroy(); } });       // elle efface aussi les tirs proches
    this.spawnHitParticles(px, py, 10);
  },

  tryDodge(){
    if (!this.running || this.dodgeCharges <= 0) return;
    this.dodgeCharges -= 1;
    this.dodgeInvuln = 400 + (this.stats.secondSouffle>0 ? 300*this.stats.secondSouffle : 0);
    this.cameras.main.flash(120, 79, 242, 255, false);
    this.spawnHitParticles(this.player.x, this.player.y, 10);
    sfx.dodge();
  },
});
