"use strict";
// Méthodes de GameScene — sons de mort et ambiance musicale selon la situation.
mixin(GameScene, {
  // chaque ennemi explose à sa façon
  killSound(e){
    const pan = this.panOf(e.x), t = e.enemyType;
    if (t === 'kamikaze' || t === 'golden') return;                                   // sons gérés ailleurs (explosion kamikaze, jackpot)
    if (t === 'mine' || t === 'mineDeployed') return sfx.mineBoom({ pan });
    if (t === 'meteor') return sfx.rock({ pan, tier:e.meteorTier });
    if (['swarmer','drone','splitter','charo','ghost'].includes(t)) return sfx.boomSmall({ pan });
    if (['tank','elite','mothership','bomber','vortex'].includes(t)) return sfx.boomBig({ pan });
    return sfx.boomMed({ pan });
  },

  // ambiance musicale en direct: plus d'ennemis / de tirs / frénésie / overdrive / boss = plus vite et plus aigu;
  // PV bas = la musique ralentit, devient plus grave et s'étouffe
  updateMusicMood(delta){
    this._moodT = (this._moodT || 0) + delta;
    if (this._moodT < 250) return;
    this._moodT = 0;
    const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
    const nE = this.enemies.countActive(true), nB = this.enemyBullets.countActive(true);
    let boost = 0.05 * clamp((nE - 8) / 60, 0, 1) + 0.035 * clamp((nB - 30) / 250, 0, 1);
    if ((this._frenzyUntil || 0) > this.elapsed) boost += 0.05;
    if (this.odActive > 0) boost += 0.06;
    if (this.bossActive) boost += 0.015 + ((this.currentBoss && (this.currentBoss.phase || 1) >= 3) ? 0.015 : 0);
    boost = Math.min(0.11, boost);
    const r = (this.hp + (this.shield || 0)) / Math.max(1, this.stats.maxHp);                     // PV + bouclier
    if (r < 0.35) this._lowMood = true; else if (r >= 0.5) this._lowMood = false;                // le ralenti s'installe sous 35%, et la musique redevient normale dès que ça remonte à 50%
    const low = this._lowMood ? clamp((0.5 - r) / 0.5, 0.25, 1) : 0;                              // 0 = en forme, 1 = presque mort
    music.setMood(clamp((1 + boost) * (1 - 0.18 * low) * (1 - (this._audRate||0)), 0.55, 1.11), Math.min(1, low * 0.85 + (this._audDim||0)));
    music.setScene({ mode:'game', alert:this.alertLevel, boss:this.bossActive, bossId:(this.currentBoss && this.currentBoss.bossId) || null });          // choix du morceau: niveau d'alerte, boss
  },
});
