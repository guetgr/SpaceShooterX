"use strict";
// Méthodes de GameScene — difficulté : cadence d'apparition, niveau d'alerte, multiplicateurs de PV et de dégâts.
mixin(GameScene, {
  getSpawnInterval(){
    const base = 1300;
    const a = this.alertLevel;
    const min = Math.max(120, 320 * (1 - 0.05*(a-1)));
    const val = (base - this.elapsed*4 - this.difficultyTier*30) * Math.max(0.3, 1 - 0.06*(a-1)) * ((this._frenzyUntil||0) > this.elapsed ? 0.55 : 1);   // FRENESIE: apparitions bien plus rapprochées
    return Phaser.Math.Clamp(val, min * ((this._frenzyUntil||0) > this.elapsed ? 0.6 : 1), base);
  },

  updateDifficulty(){
    const tier = Math.floor(this.elapsed/20);
    if (tier !== this.difficultyTier){
      this.difficultyTier = tier;
    }
  },

  // le niveau d'alerte monte d'un cran en pleine partie: flash rouge, annonce, armes ennemies et vaisseau suivent
  raiseAlert(){
    this.alertLevel = Math.min(ALERT_CAP, this.alertLevel + 1); this.alertRises = (this.alertRises||0) + 1; this.alertTimer = 0;
    this.weaponTier = weaponTierFor(this.alertLevel);
    this.cameras.main.flash(300, 255, 40, 40, false); this.cameras.main.shake(260, 0.006);
    sfx.alertUp(); music.setIntensity(this.alertLevel);
    this.notice('ALERTE ' + this.alertLevel, 'La menace augmente !', this.alertLevel);
    if (this.updateShipTier) this.updateShipTier();
  },

  // multiplicateur de dégâts de tous les ennemis (tirs, contacts, explosions, lasers, boss)
  lateDmgMul(){ return Math.pow(1 + ENEMY_DMG_LATE, Math.max(0, (this.elapsed - 600)/60)); },

  hpScaleNow(){
    const t = this.difficultyTier;
    return (1 + t*0.2) * Math.pow(LATE_HP_GROWTH, Math.max(0, t - 30)) * (1 + Math.max(0, this.alertLevel-4)*0.15) * ((this.lvDef && this.lvDef.hpMul) || 1);
  },

  enemyDmgMul(){
    return (1 + ENEMY_DMG_PER_ALERT*(this.alertLevel-1)) * (1 + ENEMY_DMG_TIME_MAX*Math.min(1, this.elapsed/600)) * this.lateDmgMul() * ((this.lvDef && this.lvDef.dmgMul) || 1);
  },
});
