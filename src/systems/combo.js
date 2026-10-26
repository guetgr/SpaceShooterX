"use strict";
// Méthodes de GameScene — combo et rang de style (multiplicateur d'XP).
mixin(GameScene, {
  /* ---------- STYLE (combo façon Tony Hawk) ---------- */
  styleRank(n){
    const k = 1 + 0.15*(this.alertLevel-1);
    let idx = 0;
    for (let i=0;i<STYLE_RANKS.length;i++) if (n >= STYLE_RANKS[i].n * k) idx = i;
    return idx;
  },

  // multiplicateur d'XP du moment: celui du rang du combo en cours (1 s'il n'y a pas de combo)
  xpMul(){ return ((this.combo && this.combo.n > 0) ? STYLE_XP[this.comboRank] : 1) * ((this._frenzyUntil||0) > this.elapsed ? 2 : 1) * ((this.neb && this.neb.phase === 'stay') ? 1.5 : 1); },

  // chaque kill prolonge le combo, ajoute des points (multipliés par le rang) et relance la fenêtre
  comboKill(base){
    const c = this.combo;
    c.n++;
    const idx = this.styleRank(c.n);
    c.pts += (base || 5) * (1 + 0.5*idx);
    c.t = 2000 + 150*idx;                         // fenêtre pour enchaîner (un peu plus large aux hauts rangs)
    if (idx > this.comboRank){
      this.comboRank = idx; sfx.rankUp({ rank: idx });                    // le son ne retentit que quand on MONTE de rang
      this.runBestRank = Math.max(this.runBestRank, idx);
      this._rankBump = true;                       // la lettre de rang pulse (pas de notification au milieu de l'écran)
    }
    this.runBestCombo = Math.max(this.runBestCombo, c.n);
    if (c.n > (this.achv.maxCombo || 0)){ this.achv.maxCombo = c.n; this.achvDirty = true; if (c.n % 25 === 0) this.achvCheck(null); }
    this._styleDirty = true;
  },

  // le combo se termine: ses points sont ajoutés au score (la moitié seulement si c'est un coup reçu qui l'a cassé)
  bankCombo(hit){
    if (!hit && this.combo && this.combo.n > 0) sfx.bank();
    const c = this.combo;
    if (c.n <= 0) return;
    const pts = Math.round(c.pts * (hit ? 0.5 : 1));
    this.score += pts;
    this.achvCheck(null);
    if (c.n >= 10){
      const t = this.add.text(this.player.x, this.player.y - 60, (hit ? 'COMBO CASSE ' : 'COMBO ') + 'x' + c.n + '  +' + pts, { fontFamily:'SSX Label, monospace', fontSize:'11px', color: hit ? '#ff7088' : '#ffd76a', stroke:'#000', strokeThickness:4 }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets:t, y:t.y - 50, alpha:0, duration:1300, onComplete:()=> t.destroy() });
    }
    c.n = 0; c.pts = 0; c.t = 0; this.comboRank = 0;
    this._styleDirty = true;
    this.updateHud(false);
  },

  // compteur de chaîne géant (apparaît à partir de 8 mobs) + petit son qui monte
  showCombo(n){
    if (n < 8) return;
    const el = document.getElementById('comboTxt');
    if (!el) return;
    el.textContent = 'CHAINE x' + n + '!';
    el.style.color = n >= 100 ? '#ff5a6e' : (n >= 60 ? '#ff9a3c' : (n >= 30 ? '#ffd76a' : '#9fe8ff'));
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    clearTimeout(this._comboT);
    this._comboT = setTimeout(()=> el.classList.remove('pop'), 900);
    if (n % 5 === 0) sfx.comboTick(n);
  },
});
