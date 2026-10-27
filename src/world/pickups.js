"use strict";
// Méthodes de GameScene — cristaux d'XP, soins, mob doré.
mixin(GameScene, {
  /* ---------- MOMENTS FORTS ---------- */
  // un cristal posé à la main (respecte le plafond: au-delà, son XP est créditée directement)
  spawnGemAt(x, y, xpVal, kind, vy){
    if (this.gems.getLength() >= GEM_CAP){ this.xp += xpVal * (1 + this.stats.xpBonus) * this.xpMul(); return; }
    const g = this.gems.create(x, y, kind, 0);
    g.setDepth(3); g.setScale(1/GEM_SS);
    g.xpValue = xpVal; g.gemKind = kind; g.ph = Math.random()*6.2832; g.sparkF = 0;
    const bs = GEM_KINDS[kind].s*GEM_SS*1.8; g.body.setSize(bs, bs, true);
    g.body.velocity.y = vy || 30;
  },

  // TRESORIN: un mob doré traverse l'écran, il rapporte un gros jackpot si on l'abat à temps
  spawnGolden(quiet){
    sfx.goldenSpawn();
    const e = this.spawnOneEnemy('golden');
    if (!e) return;
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    const side = Math.random() < 0.5 ? -1 : 1;
    e.x = side < 0 ? vx.min - 26 : vx.max + 26;
    e.gBase = vy.min + Phaser.Math.Between(110, 320); e.y = e.gBase; e.gT = 0;
    e.body.setVelocity(-side * Phaser.Math.Between(190, 240), 0);
    
  },

  goldJackpot(enemy){
    const bonus = 3 + this.alertLevel;
    this.runFragBonus += bonus; this.runGold += 1;
    this.xp += this.xpToNext * 0.25 * this.xpMul();
    for (let i=0;i<10;i++) this.spawnGemAt(enemy.x + Phaser.Math.Between(-30,30), enemy.y + Phaser.Math.Between(-20,20), 4, 'gemM', 50);
    const t = this.add.text(enemy.x - 8, enemy.y, '+' + bonus, { fontFamily:'SSX Label, monospace', fontSize:'16px', color:'#ffd76a', stroke:'#3a2a00', strokeThickness:4 }).setOrigin(0.5).setDepth(20);
    const ic = this.add.image(t.x + t.width/2 + 10, enemy.y, 'uiFrag').setScale(1.5).setDepth(20);      // le ◆ est un sprite : un texte Phaser ne sait pas afficher d'image
    this.tweens.add({ targets:[t, ic], y:'-=60', alpha:0, duration:1100, onComplete:()=>{ t.destroy(); ic.destroy(); } });
    this.cameras.main.flash(120, 255, 215, 100, false);
    sfx.jackpot();
    this.notice('JACKPOT !', '+' + bonus + ' fragments · gros bonus d\'XP');
  },

  onCollectGem(player, gem){
    if (!gem.active) return;
    this.xp += (gem.xpValue || 2) * (1 + this.stats.xpBonus) * (1 + 0.12*(this.alertLevel-1)) * this.xpMul();
    this.spawnGemBurst(gem.x, gem.y, gem.gemKind || 'gemS');
    gem.destroy();
    this.lvGems += 1;
    const rate = this.juiceGemRate();
    if ((gem.xpValue || 2) >= 6) sfx.gemBig({ rate }); else sfx.gem({ rate });
    if (this.xp >= this.xpToNext){
      this.levelUp();
    }
  },

  onCollectHeal(player, heal){
    if (!heal.active) return;
    const amount = heal.healValue || 5;
    if (this.stats.overdrive > 0 && this.odActive > 0){ this.odActive = Math.min(this.odMax || this.odActive, this.odActive + amount*160*Math.pow(0.68, Math.max(0, (this.odUses||1) - 1))); sfx.gem(); }   // overdrive en cours: la cellule rallonge sa durée
    else if (this.stats.overdrive > 0) this.addOverdrive(amount);
    else { this.xp += amount*1.2*(1 + this.stats.xpBonus)*this.xpMul(); if (this.xp >= this.xpToNext) this.levelUp(); }   // sans overdrive: un peu d'XP
    heal.destroy();
    sfx.heal();
    this.updateHud(false);
  },

  spawnGemBurst(x, y, kind){
    const p = GEM_KINDS[kind] || GEM_KINDS.gemS;
    const col = parseInt(p.hi.slice(1), 16);
    for (let i=0;i<10;i++){
      const a = i/10*6.2832 + Math.random()*0.4;
      const r = p.s*2;
      const sq = this.add.rectangle(x + Math.cos(a)*p.s*0.4, y + Math.sin(a)*p.s*0.4, 2.5, 2.5, col).setDepth(8);
      this.tweens.add({
        targets: sq, x: x + Math.cos(a)*r, y: y + Math.sin(a)*r, scale: 0, alpha: 0, duration: 420, ease: 'Linear',
        onComplete: ()=> sq.destroy()
      });
    }
  },
});
