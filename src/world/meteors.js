"use strict";
// Méthodes de GameScene — météorites.
mixin(GameScene, {
  // METEORITE: un vrai ennemi (3 tailles). Touchée par n'importe quoi, ou en percutant le vaisseau, elle se divise en 3 plus petites.
  // 3 styles de météorites (rouge volcanique, bleu cristallin, violet cosmique): le style se transmet aux morceaux
  // météorite décorative (événement tempête): passe en arrière-plan, sans collision, plus pâle comme si elle était loin
  spawnBgMeteor(){
    if ((this._bgMet || 0) >= 22) return;
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0), style = this._meteorStyle !== undefined ? this._meteorStyle : Phaser.Math.Between(0, 2);
    const tints = [0xaab4c8, 0x8fb8ff, 0xc9a0ff];
    const img = this.add.image(Phaser.Math.Between(vx.min - 40, vx.max + 40), vy.min - 60, 'mtBig', Phaser.Math.Between(0, 4));
    img.setDepth(-1.1).setTint(tints[style]).setAlpha(Phaser.Math.FloatBetween(0.35, 0.6)).setScale(Phaser.Math.Between(34, 96) / img.frame.realWidth).setAngle(Phaser.Math.Between(0, 359));
    this._bgMet = (this._bgMet || 0) + 1;
    const dur = Phaser.Math.Between(4200, 7500), dx = Phaser.Math.Between(-90, 90);
    this.tweens.add({ targets:img, y: vy.max + 80, x: img.x + dx, angle: img.angle + Phaser.Math.Between(-200, 200), duration: dur, ease:'Linear', onComplete:()=>{ img.destroy(); this._bgMet--; } });
  },

  spawnMeteor(x, y, tier, vx, vy, style){
    if (this.enemies.countActive(true) >= ENEMY_HARD_CAP) return null;
    if (style === undefined){ const r = Math.random(); style = r < 0.5 ? 0 : (r < 0.76 ? 1 : 2); }
    const keys = ['mtRed','mtBlue','mtViolet'], tints = [0xffffff, 0x8fb8ff, 0xc9a0ff];
    const e = this.enemies.create(x, y, tier === 2 ? keys[style] : (tier === 1 ? 'mtBig' : 'mtSmall'));
    e.setDepth(4); e.enemyType = 'meteor'; e.meteorTier = tier; e.mStyle = style;
    if (tier === 2) e.play(keys[style] + 'A', false, Phaser.Math.Between(0,3));
    else { e.setFrame(Phaser.Math.Between(0, tier === 1 ? 4 : 5)); if (style) e.setTint(tints[style]); }     // les rochers prennent la teinte du style
    const target = [28, 46, 72][tier];                                                   // taille à l'écran
    e.setScale(target / e.frame.realWidth);
    e.body.setSize(e.frame.realWidth*0.7, e.frame.realHeight*0.7);
    e.boomMul = [0.5, 0.75, 1.1][tier];
    e.hp = e.maxHp = 1;                                     // un seul coup suffit pour la briser
    e.scoreValue = [3, 6, 10][tier]; e.contactDamage = [6, 10, 14][tier];
    e.body.setVelocity(vx, vy); e.spin = Phaser.Math.FloatBetween(-3, 3);
    return e;
  },

  splitMeteor(x, y, tier, vx, vy, style){
    if (tier <= 0) return;
    let total = 0; this.enemies.children.iterate(m=>{ if (m && m.active && m.enemyType === 'meteor') total++; });
    if (total > 70) return;                                  // trop de débris à l'écran: on n'en rajoute pas (fluidité)
    const sp = Math.max(130, Math.hypot(vx, vy)), base = Math.atan2(vy, vx);
    [-0.65, 0, 0.65].forEach(da=>{
      const a = base + da + (Math.random()-0.5)*0.18, s = sp * (0.85 + Math.random()*0.35);
      const c = this.spawnMeteor(x + Math.cos(a)*22, y + Math.sin(a)*22, tier-1, Math.cos(a)*s, Math.sin(a)*s, style);
      if (c) c._safeUntil = this.time.now + 450;             // un court instant sans contact, pour ne pas se briser en chaîne sur le vaisseau
    });
  },
});
