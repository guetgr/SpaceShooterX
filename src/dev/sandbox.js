"use strict";
// Méthodes de GameScene — bac à sable DEV et HUD des événements.
mixin(GameScene, {
  // ---------- BAC A SABLE (version DEV): rien n'apparaît tout seul; un panneau permet de tout faire apparaître et de couper le tir / l'IA
  // DEV: petit témoin des événements (prochain événement programmé, événement en cours, boss suivant)
  updateDevEventHud(delta){
    this._devHudT = (this._devHudT || 0) + delta; if (this._devHudT < 400) return; this._devHudT = 0;
    let el = document.getElementById('devEvHud');
    if (!el){ el = document.createElement('div'); el.id = 'devEvHud'; el.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:59;font:9px monospace;color:#9fe;background:rgba(0,0,0,.6);padding:3px 5px;border-radius:3px;pointer-events:none;max-width:70vw;'; document.body.appendChild(el); }
    const pl = (this.evPlan || []).map(e=> e.kind + ' dans ' + Math.max(0, Math.round(e.at - this.elapsed)) + 's').join(', ') || '-';
    const cur = [this.curEvent, this.curSmall].filter(Boolean).map(e=> e.kind + ' (' + Math.ceil(e.t/1000) + 's)').join(' + ') || '-';
    el.textContent = 'EVT en cours: ' + cur + ' | prévus: ' + pl + ' | boss: ' + (this.bossActive ? 'EN COURS' : (this.nextBossAt > 1e8 ? '-' : 'dans ' + Math.max(0, Math.round(this.nextBossAt - this.elapsed)) + 's')) + ' | vaincus: ' + this.bossesDefeated;
  },

  destroySandboxUI(){ const o = document.getElementById('sbPanel'); if (o) o.remove(); const h = document.getElementById('devEvHud'); if (h && !DEV_SEE_ALL) h.remove(); const b = document.getElementById('sbToggle'); if (b) b.remove(); },

  buildSandboxUI(){
    this.destroySandboxUI();
    const sc = this, css = 'font:9px monospace;color:#fff;background:#13203a;border:1px solid #4a6fa5;border-radius:4px;padding:5px 6px;margin:2px;cursor:pointer;touch-action:manipulation;';
    const tg = document.createElement('button'); tg.id = 'sbToggle'; tg.textContent = 'TEST'; tg.style.cssText = css + 'position:fixed;left:4px;top:100px;z-index:60;background:#6b1a1a;border-color:#ff3a3a;';
    const pn = document.createElement('div'); pn.id = 'sbPanel';
    pn.style.cssText = 'position:fixed;left:4px;top:128px;width:min(250px,64vw);max-height:58vh;overflow:auto;z-index:60;background:rgba(5,10,25,.92);border:1px solid #ff3a3a;border-radius:6px;padding:4px;display:none;-webkit-overflow-scrolling:touch;';
    ['pointerdown','touchstart','mousedown','click'].forEach(ev=>{ pn.addEventListener(ev, e=> e.stopPropagation()); tg.addEventListener(ev, e=> e.stopPropagation()); });
    const sec = t=>{ const d = document.createElement('div'); d.textContent = t; d.style.cssText = 'font:9px monospace;color:#ffe14a;margin:6px 2px 2px;border-bottom:1px solid #444;'; pn.appendChild(d); };
    const btn = (label, fn, extra)=>{ const b = document.createElement('button'); b.textContent = label; b.style.cssText = css + (extra||''); b.onclick = ()=>{ try{ sfx.resume(); fn(b); }catch(e){ console.warn(e); } }; pn.appendChild(b); return b; };
    const flag = (label, key)=>{ const b = btn('', ()=>{ sc[key] = !sc[key]; paint(); }); const paint = ()=>{ b.textContent = label + ' : ' + (sc[key] ? 'ON' : 'OFF'); b.style.background = sc[key] ? '#1d5a2a' : '#5a1d1d'; }; paint(); };
    sec('REGLAGES'); flag('TIR AUTO','sbFire'); flag('IA ENNEMIS','sbAI'); flag('INVINCIBLE','sbGod');
    btn('OVERDRIVE PRET', ()=>{ sc.stats.overdrive = Math.max(1, sc.stats.overdrive||0); sc.odReady = true; sc.od = 100; });
    btn('ALERTE +1', ()=> sc.raiseAlert());
    btn('TOUT EFFACER', ()=>{ sc.enemies.children.iterate(e=>{ if (e && e.active && !e.bossId) e.destroy(); }); sc.enemyBullets.clear(true, true); });
    btn('TUER LES BOSS', ()=>{ const bs = []; sc.enemies.children.iterate(e=>{ if (e && e.active && e.bossId && !e.isBossPart) bs.push(e); }); bs.forEach(b=> sc.killEnemy(b)); });
    sec('MOBS');
    ['grunt','diver','shooter','turret','drone','splitter','shieldedGrunt','mine','tank','bomber','sat','satgun','sniper','swarmer','healer','ghost','elite','mothership','vortex','charo','kamikaze','spider'].forEach(t=>{
      btn(t, ()=>{ const n = { swarmer:4, kamikaze:3, spider:4 }[t] || 1, vx = sc.visibleXRange(150), cx = Phaser.Math.Between(vx.min, vx.max);
                   for (let i=0;i<n;i++) sc.spawnOneEnemy(t, n > 1 ? cx + (i-(n-1)/2)*60 : undefined); });
    });
    sec('BOSS');
    BOSS_ORDER.forEach(id=> btn(id, ()=>{ if (sc.bossActive) sc.spawnBoss(id, { twin:true, dx:85 }); else sc.spawnBoss(id); }));
    sec('EVENEMENTS');
    Object.keys(EVENT_DEFS).forEach(k=> btn(EVENT_DEFS[k].name, ()=>{
      const slot = EVENT_DEFS[k].small ? 'curSmall' : 'curEvent', ev0 = sc[slot];
      if (ev0){ const d0 = EVENT_DEFS[ev0.kind]; if (d0 && d0.end) d0.end(sc); sc[slot] = null; }
      if (k === 'nebula') sc.endNebula(true);
      sc.startEvent(k);
    }));
    btn('STOP EVENEMENTS', ()=>{ sc.endAllEvents(); sc.endNebula(false); }, 'border-color:#ff3a3a;');
    tg.onclick = ()=>{ pn.style.display = pn.style.display === 'none' ? 'block' : 'none'; };
    document.body.appendChild(tg); document.body.appendChild(pn);
  },
});
