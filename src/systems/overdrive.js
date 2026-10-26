"use strict";
// Méthodes de GameScene — Overdrive.
mixin(GameScene, {
  /* ---------- OVERDRIVE ---------- */
  addOverdrive(v){
    if (this._empOn) return;
    if (!(this.stats.overdrive > 0) || this.odActive > 0 || this.odReady) return;
    v *= Math.pow(0.68, this.odUses || 0);         // plus on utilise l'overdrive dans la partie, plus il est long à recharger (×0,74 après 1 usage, ×0,49 après 3, ×0,32 après 6, plancher ×0,15)
    this.od = Math.min(100, this.od + v);
    if (this.od >= 100){
      this.odReady = true;
      sfx.odCharge();
      this.notice('SURCADENCE DISPONIBLE', 'Bouton OD ou ESPACE : dégâts x2');
    }
  },

  // puissance de l'overdrive (1 = bonus complet): elle s'érode pendant l'effet (jusqu'à 40% en fin de durée) et chaque activation démarre un peu plus faible (-8%, sans plancher)
  odPower(){ const k = Phaser.Math.Clamp(this.odActive/(this.odMax || 6000), 0, 1); return (0.4 + 0.6*k) * Math.pow(0.92, Math.max(0, (this.odUses||1) - 1)); },

  activateOverdrive(){
    if (!this.running || !this.odReady || this.odActive > 0 || this._empOn) return;
    this.odReady = false; this.od = 0; this.odUses = (this.odUses || 0) + 1; this.odActive = this.stats.odDur; this.odMax = this.stats.odDur;
    this.cameras.main.flash(180, 255, 215, 100, false);
    this.cameras.main.shake(200, 0.006);
    sfx.overdrive();
  },

  updateOverdrive(delta){
    if (this._odQueue){ if (!this.odReady){ this._odQueue = false; } else if (this.running){ this._odQueue = false; this.activateOverdrive(); } const ob0 = document.getElementById('odBtn'); if (ob0 && !this._odQueue) ob0.classList.remove('queued'); }
    if (!(this.stats.overdrive > 0)) return;           // verrouillé tant que la compétence n'est pas achetée
    const px = this.player.x, py = this.player.y;
    if (this.odActive > 0){
      this.odActive -= delta;
      if (this.odActive <= 0){
        this.odActive = 0;
        sfx.odEnd();
      }
    } else if (!this.odReady){
      // "graze": un tir ennemi qui frôle le vaisseau (sans le toucher) charge la jauge
      let gz = 0;
      this.enemyBullets.children.iterate(b=>{
        if (!b || !b.active || b._gz) return;
        const dx = b.x - px, dy = b.y - py;
        if (dx > 26 || dx < -26 || dy > 26 || dy < -26) return;
        const d2 = dx*dx + dy*dy;
        if (d2 <= 676 && d2 >= 100){ b._gz = true; gz++; }
      });
      if (gz > 0){
        this.addOverdrive(Math.min(gz, 5) * 1.6 * this.stats.odGraze);
        this.spawnHitParticles(px, py, 2);
      }
    }
    // le bouton lui-même fait office de jauge: anneau qui se remplit, puis qui se vide pendant l'effet
    const btn = document.getElementById('odBtn');
    if (btn){
      const pct = this.odActive > 0 ? this.odActive/(this.odMax || 6000)*100 : (this.odReady ? 100 : this.od);
      btn.style.setProperty('--deg', (Math.max(0, Math.min(100, pct)) * 3.6).toFixed(1) + 'deg');
      btn.classList.toggle('ready', this.odReady && this.odActive <= 0);
      btn.classList.toggle('active', this.odActive > 0);
    }
  },
});
