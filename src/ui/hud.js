"use strict";
// Méthodes de GameScene — HUD : secousse, rang de style, barres.
mixin(GameScene, {
  // fait trembler une barre du HUD (bouclier ou vie) quand elle encaisse
  shakeHud(id, strong){
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hud-shake','hud-shake-strong');
    void el.offsetWidth; // relance l'animation même si elle venait d'être jouée
    el.classList.add(strong ? 'hud-shake-strong' : 'hud-shake');
    clearTimeout(el._shakeT);
    el._shakeT = setTimeout(()=> el.classList.remove('hud-shake','hud-shake-strong'), strong ? 520 : 320);
  },

  updateStyleHud(delta){
    const c = this.combo;
    if (c.n > 0){ c.t -= delta; if (c.t <= 0) this.bankCombo(false); }
    this._styleT -= delta;
    if (!this._styleDirty && this._styleT > 0) return;
    this._styleT = 90; this._styleDirty = false;               // le HUD est mis à jour au plus toutes les 90 ms (même pendant un wipe)
    const el = document.getElementById('styleHud');
    if (!el) return;
    if (c.n <= 0){ el.classList.remove('show'); return; }
    const r = STYLE_RANKS[this.comboRank];
    el.classList.add('show');
    const rk = document.getElementById('styleRank');
    rk.textContent = r.l; rk.style.color = r.col; el.style.borderColor = r.col;
    rk.style.fontSize = (r.l.length === 1 ? 26 : (r.l.length === 2 ? 19 : 14)) + 'px';   // SS et SSS restent dans leur cadre
    if (this._rankBump){ this._rankBump = false; rk.classList.remove('bump'); void rk.offsetWidth; rk.classList.add('bump'); }
    document.getElementById('styleName').textContent = r.name;
    document.getElementById('styleCount').textContent = 'x' + c.n + '  ' + Math.round(c.pts) + ' pts';
    const xm = STYLE_XP[this.comboRank];
    const xe = document.getElementById('styleXp');
    xe.textContent = 'XP x' + (xm % 1 ? xm.toFixed(1) : xm);
    xe.style.color = xm >= 6 ? '#ff4de0' : (xm >= 3 ? '#ffd76a' : '#7fe8ff');
    const win = 2000 + 150*this.comboRank;
    document.getElementById('styleFill').style.width = Math.max(0, Math.min(100, c.t/win*100)) + '%';
  },

  /* ---------- HUD ---------- */
  updateHud(force){
    const hpPct = Math.max(0, this.hp/this.stats.maxHp*100);
    document.getElementById('hpFill').style.width = hpPct + '%';
    Motion.hudHp(hpPct);
    document.querySelector('.hp-wrap').classList.toggle('hp-low', hpPct > 0 && hpPct < 30);
    const shieldTrack = document.getElementById('shieldTrack');
    if (this.stats.shieldMax > 0){
      shieldTrack.style.display = '';
      document.getElementById('shieldFill').style.width = Math.max(0,(this.shield/this.stats.shieldMax*100)) + '%';
    } else {
      shieldTrack.style.display = 'none';
    }
    const sv = document.getElementById('scoreVal'), sc = Math.floor(this.score);
    if (this._scShown !== sc){ this._scShown = sc; sv.textContent = sc; Motion.tick(sv); }
    const lb = document.getElementById('lvlBadge');
    if (this._lvShown !== this.level){ if (this._lvShown !== undefined) Motion.pop(lb, 1.6); this._lvShown = this.level; lb.textContent = 'LV.'+this.level; }
    document.getElementById('xpFill').style.width = Math.min(100,(this.xp/this.xpToNext*100)) + '%';
    const m = Math.floor(this.elapsed/60), s = Math.floor(this.elapsed%60);
    document.getElementById('waveNote').textContent = this.lvDef ? ('NIV.' + this.lvDef.num + ' · ' + this.levelProgress().label) : ('T+' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + ' · ALERTE ' + this.alertLevel);
    { const wn = document.getElementById('waveNote'), cap = this.alertLevel >= ALERT_CAP;
      const f = cap ? 1 : Math.min(1, (this.alertTimer||0) / ALERT_RISE_SECONDS), k = f*f;                       // le rouge s'installe lentement puis s'accélère
      const blink = (!cap && f > 0.93) ? (0.55 + 0.45*Math.sin(this.time.now/110)) : 1;
      const mix = (a,b)=> Math.round(a + (b-a)*k*blink);
      wn.style.color = 'rgb('+mix(154,255)+','+mix(163,52)+','+mix(208,52)+')';
      wn.style.borderColor = 'rgb('+mix(44,255)+','+mix(39,52)+','+mix(80,52)+')';
      wn.style.boxShadow = k > 0.05 ? '0 0 '+Math.round(3+9*k)+'px rgba(255,52,52,'+(0.15+0.65*k).toFixed(2)+')' : 'none'; }
  },
});
