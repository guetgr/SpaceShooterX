"use strict";
// Méthodes de GameScene — succès en cours de partie : kills, paliers, notifications.
mixin(GameScene, {
  /* ---------- SUCCES ---------- */
  achvOnKill(enemy, bKey){
    const a = this.achv;
    const isBoss = enemy.enemyType === 'boss';
    const lvl = Math.min(ACHV_W.length, Math.max(1, this.alertLevel));
    if (isBoss){ a.bossKills[bKey] = (a.bossKills[bKey]||0) + 1; a.bossTotal++; }
    else {
      a.rawTotal++;
      if (ACHV_TYPES.indexOf(enemy.enemyType) >= 0){
        const arr = a.killsAlert[enemy.enemyType] || (a.killsAlert[enemy.enemyType] = newKillArr());
        arr[lvl-1]++;
      }
    }
    if (lvl >= 6) a.alertKills++;
    this.achvDirty = true;
    this.achvCheck(isBoss ? null : enemy.enemyType);
  },

  achvCheck(type){
    const a = this.achv;
    ACHV_GLOBALS.forEach(g=>{
      if (!a.glob[g.id] && achvGlobalProgress(a, g) >= g.need){
        a.glob[g.id] = true;
        this.applyAchvBuffLive(g.buff);
        this.achvToast(g.name, g.txt);
        setAchv(a);
      }
    });
  },

  // un succès global débloqué en pleine run: le buff s'applique tout de suite
  applyAchvBuffLive(b){
    const st = this.stats;
    if (b.dmg) st.damage *= 1 + b.dmg;
    if (b.fire) st.fireRate /= 1 + b.fire;   // fireRate = délai en ms
    if (b.xp) st.xpBonus += b.xp;
    if (b.frag) st.fragmentBonus += b.frag;
    if (b.hp){ const add = st.maxHp*b.hp; st.maxHp += add; this.hp += add; }
  },

  notice(name, desc, lv){            // message de jeu (alerte, événement...): texte seul sous le HUD, sans boîte
    const el = document.getElementById('gameNotice'); if (!el) return;
    document.getElementById('gnName').textContent = name; document.getElementById('gnDesc').textContent = desc || '';
    el.classList.remove('show'); void el.offsetWidth; el.classList.toggle('alert', lv !== undefined); el.classList.add('show');
    clearTimeout(this._gnT); this._gnT = setTimeout(()=> el.classList.remove('show'), 2600);
    if (lv !== undefined) sfx.alertAlarm({ lv });
  },

  achvToast(name, desc){
    this.achvQueue.push({ name, desc });
    if (!this.achvShowing) this.achvPump();
  },

  achvPump(){
    const el = document.getElementById('achvToast');
    const item = this.achvQueue.shift();
    if (!el || !item){ this.achvShowing = false; return; }
    this.achvShowing = true;
    document.getElementById('atName').textContent = item.name;
    document.getElementById('atDesc').textContent = item.desc;
    el.classList.add('show');
    sfx.achievement();
    setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=> this.achvPump(), 350); }, 2800);
  },
});
