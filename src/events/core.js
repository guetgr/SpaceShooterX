"use strict";
// Méthodes de GameScene — planification et déroulement des événements, nébuleuse.
mixin(GameScene, {
  // programme les 1 ou 2 événements de l'intervalle avant le prochain boss (appelé à la mort d'un boss)
  planEvents(){
    const t0 = this.elapsed, end = this.nextBossAt, al = this.alertLevel, low = this.hp < this.stats.maxHp*0.5, used = new Set();
    this.evPlan = []; let lastEnd = t0;
    for (let tries=0; tries<10; tries++){
      const list = Object.keys(EVENT_DEFS).filter(k=> al >= EVENT_DEFS[k].min && !EVENT_DEFS[k].small && !used.has(k)).map(k=>({ k, w: EVENT_DEFS[k].w(al, low) }));
      if (!list.length) break;
      let roll = Math.random() * list.reduce((t,e)=> t + e.w, 0), kind = list[0].k;
      for (const e of list){ if (roll < e.w){ kind = e.k; break; } roll -= e.w; }
      used.add(kind);
      const dur = EVENT_DEFS[kind].dur(al, this), first = this.evPlan.length === 0;
      const earliest = lastEnd + (first ? 4 : Phaser.Math.Between(4, 9)), latest = end - dur/1000 - 2;
      if (!first && latest < earliest) continue;                          // pas la place: on essaie un événement plus court
      const at = (latest <= earliest) ? earliest : Phaser.Math.FloatBetween(earliest, Math.min(latest, earliest + (first ? 14 : 8)));   // au moins 1 par intervalle (le boss attend la fin s'il le faut)
      this.evPlan.push({ at, kind, dur }); lastEnd = at + dur/1000;
    }
  },

  updateEventPlan(){
    if (this.realBossAlive()){ this.evPlan = []; return; }          // le boss bonus ne bloque rien
    const pl = this.evPlan;
    if (pl && pl.length && !this.curEvent && this.elapsed >= pl[0].at){ { const pe = pl.shift(); this.startEvent(pe.kind, pe.dur); } }
  },

  // vortex d'annonce de l'événement "écran retourné"
  flipVortex(on){
    if (on){
      if (this._vortex) this._vortex.destroy();
      const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
      const v = this.add.image((vx.min+vx.max)/2, vy.min + (vy.max-vy.min)*0.3, 'galaxySwirl').setDepth(-1.3).setBlendMode(Phaser.BlendModes.ADD).setTint(0xb070ff).setAlpha(0).setScale(0.25);
      this.tweens.add({ targets:v, alpha:0.9, scaleX:1.1, scaleY:1.1, duration:2200, ease:'Sine.easeOut' });
      this.tweens.add({ targets:v, angle:360, duration:5000, repeat:-1 });
      this._vortex = v;
    } else if (this._vortex){
      const v = this._vortex; this._vortex = null;
      this.tweens.add({ targets:v, alpha:0, scaleX:1.7, scaleY:1.7, duration:1200, ease:'Cubic.easeIn', onComplete:()=>v.destroy() });
    }
  },

  // frénésie: chaque ennemi est entouré d'un halo rouge
  updateFrenzyHalos(){
    const on = (this._frenzyUntil||0) > this.elapsed && this.running, pool = this._halos || (this._halos = []);
    if (!on && !this._haloOn) return;
    let i = 0;
    if (on){
      if (!this.textures.exists('redHalo')){
        const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64,64,10,64,64,64);
        gr.addColorStop(0,'rgba(255,40,30,0.0)'); gr.addColorStop(0.45,'rgba(255,50,40,0.55)'); gr.addColorStop(0.75,'rgba(255,30,30,0.25)'); gr.addColorStop(1,'rgba(255,0,0,0)');
        g.fillStyle = gr; g.fillRect(0,0,128,128); this.textures.addCanvas('redHalo', c);
      }
      const pulse = 0.78 + 0.2*Math.sin(this.time.now/130);
      this.enemies.children.iterate(e=>{
        if (!e || !e.active) return;
        let h = pool[i]; if (!h){ h = this.add.image(0,0,'redHalo').setDepth(3).setBlendMode(Phaser.BlendModes.ADD); pool[i] = h; }
        h.setVisible(true).setPosition(e.x, e.y).setScale(Math.max(e.displayWidth, e.displayHeight)*2.1/128).setAlpha(pulse); i++;
      });
    }
    for (; i<pool.length; i++) pool[i].setVisible(false);
    this._haloOn = on;
  },

  // ---------- NEBULEUSE: un nuage de gaz traverse le décor comme une planète; une fois dedans, seul un cône devant le vaisseau reste éclairé
  ensureNebulaTextures(){
    if (this.textures.exists('nebCloud')) return;
    const mk = (key, w, h, fn)=>{ const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); this.textures.addCanvas(key, c); };
    mk('nebCloud', 512, 512, (g,w,h)=>{
      const cols = ['150,80,230','70,190,210','200,90,200','90,120,240'];
      for (let i=0;i<46;i++){
        const a = Math.random()*Math.PI*2, d = Math.pow(Math.random(),0.7)*w*0.3, x = w/2 + Math.cos(a)*d, y = h/2 + Math.sin(a)*d, r = 50 + Math.random()*90;
        const gr = g.createRadialGradient(x,y,0,x,y,r); const c = cols[i%cols.length];
        gr.addColorStop(0,'rgba('+c+',0.34)'); gr.addColorStop(0.55,'rgba('+c+',0.14)'); gr.addColorStop(1,'rgba('+c+',0)');
        g.fillStyle = gr; g.fillRect(0,0,w,h);
      }
      g.globalCompositeOperation = 'destination-in';
      const m = g.createRadialGradient(w/2,h/2,w*0.1,w/2,h/2,w/2); m.addColorStop(0,'#fff'); m.addColorStop(0.7,'rgba(255,255,255,0.8)'); m.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle = m; g.fillRect(0,0,w,h);
    });
    mk('nebCone', 256, 256, (g,w,h)=>{
      for (let i=0;i<9;i++){                                    // couches de plus en plus étroites: bord doux
        const k = 1 - i*0.07; g.fillStyle = 'rgba(255,255,255,0.14)';
        g.beginPath(); g.moveTo(w/2, h-6); g.lineTo(w/2 - w/2*k, 0); g.lineTo(w/2 + w/2*k, 0); g.closePath(); g.fill();
      }
      g.globalCompositeOperation = 'destination-in';
      const f = g.createLinearGradient(0,h,0,0); f.addColorStop(0,'#fff'); f.addColorStop(0.65,'rgba(255,255,255,0.85)'); f.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle = f; g.fillRect(0,0,w,h);
    });
    mk('nebHalo', 128, 128, (g,w,h)=>{
      const gr = g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,'rgba(255,255,255,0.95)'); gr.addColorStop(0.55,'rgba(255,255,255,0.55)'); gr.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0,0,w,h);
    });
  },

  startNebula(){
    this.endNebula(true);
    this.ensureNebulaTextures();
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0), vw = vx.max - vx.min;
    const cloud = this.add.image((vx.min + vx.max)/2 + Phaser.Math.Between(-40,40), 0, 'nebCloud').setDepth(-1.5).setAlpha(0);
    cloud.setScale(vw*2.6/512); cloud.y = vy.min - cloud.displayHeight*0.42;
    this.tweens.add({ targets:cloud, alpha:0.85, duration:2500 });
    const rw = 150, rh = Math.round(rw*(vy.max - vy.min)/vw);
    const rt = this.add.renderTexture(vx.min, vy.min, rw, rh).setOrigin(0,0).setDepth(7).setAlpha(0);
    const cone = this.make.image({ key:'nebCone', add:false }).setOrigin(0.5, 0.98), halo = this.make.image({ key:'nebHalo', add:false });
    this.neb = { phase:'arr', cloud, rt, cone, halo, rw, rh, fogA:0, endReq:false };
    sfx.nebulaWarn();
  },

  endNebula(now){
    const n = this.neb; if (!n) return;
    if (!now){ n.endReq = true; return; }
    [n.cloud, n.rt, n.cone, n.halo].forEach(o=>{ if (o && o.destroy) o.destroy(); });
    this.neb = null;
  },

  updateNebula(delta){
    const n = this.neb, dt = delta/1000;
    if (this.realBossAlive()) n.endReq = true;                      // seul un vrai boss chasse la nébuleuse
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0), vw = vx.max - vx.min, vh = vy.max - vy.min;
    if (n.phase === 'arr'){
      n.cloud.y += 55*dt;
      if (n.endReq) this.finishNebula(n, false);
      else if (n.cloud.y + n.cloud.displayHeight*0.2 >= this.player.y){ n.phase = 'stay'; sfx.nebulaEnter(); sfx.setNebula(true); sfx._nebOn = true; }
    } else if (n.phase === 'stay'){
      n.cloud.y += 4*dt;
      n.fogA = Math.min(1, n.fogA + delta/2000);
      if (n.endReq) this.finishNebula(n, true);
    } else {                                                      // leave
      n.cloud.y += 60*dt;
      n.fogA = Math.max(0, n.fogA - delta/2500);
      n.cloud.setAlpha(Math.max(0, n.cloud.alpha - dt*0.12));
      if (n.fogA <= 0 && n.cloud.y - n.cloud.displayHeight/2 > vy.max){ this.endNebula(true); return; }
    }
    // voile sombre (basse définition), troué par le cône devant le vaisseau et un halo autour de lui
    const rt = n.rt; rt.setAlpha(n.fogA);
    if (n.fogA <= 0.001){ rt.setVisible(false); return; }
    rt.setVisible(true); rt.setPosition(vx.min, vy.min); rt.setScale(vw/n.rw, vh/n.rh);
    const lvl = this.stats.nebulaVision || 0, L = 230 + 85*lvl, k = n.rw/vw;
    const px = (this.player.x - vx.min)*k, py = (this.player.y - vy.min)*k;
    rt.clear(); rt.fill(0x070522, 0.93);
    n.cone.setScale(L*k/256 * (1 + 0.08*lvl), L*k/256);
    n.halo.setScale((78 + 14*lvl)*2*k/128);
    rt.erase(n.cone, px, py + 10*k); rt.erase(n.halo, px, py);
  },

  finishNebula(n, inside){ n.phase = 'leave'; if (inside){ sfx.nebulaExit(); sfx.setNebula(false); sfx._nebOn = false; } },

  // EVENEMENTS ALEATOIRES (toutes les 80-140 s): pluie de cristaux, tempête de météorites, boss surprise
  startEvent(kind, dur, params, norma){
    const al = this.alertLevel, low = this.hp < this.stats.maxHp*0.5;
    if (!kind){
      const list = Object.keys(EVENT_DEFS).filter(k=> al >= EVENT_DEFS[k].min && !EVENT_DEFS[k].small && !(k === 'nebula' && this.neb)).map(k=>({ k, w: EVENT_DEFS[k].w(al, low) }));
      let roll = Math.random() * list.reduce((t,e)=> t + e.w, 0); kind = list[0].k;
      for (const e of list){ if (roll < e.w){ kind = e.k; break; } roll -= e.w; }
    }
    const d = EVENT_DEFS[kind], ev = { kind, t: 0, tick: 0, params: params || null, norma: norma || null };
    this[d.small ? 'curSmall' : 'curEvent'] = ev;              // posé avant le calcul de la durée : evParam y lit les paramètres de l'événement programmé
    ev.t = dur || d.dur(al, this);
    this.notice(d.name, d.sub);
    sfx.eventStart(kind);
    if (d.start) d.start(this);
    this.normaAnchor('eventStart', kind, ev.norma && ev.norma.start);
  },

  updateEvent(delta){
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    ['curEvent','curSmall'].forEach(slot=>{
      const ev = this[slot]; if (!ev) return;
      const d = EVENT_DEFS[ev.kind];
      ev.t -= delta; ev.tick -= delta;
      if (ev.tick <= 0 && d){
        ev.tick = d.tickMs ? d.tickMs(this.alertLevel, this) : 1e9;
        if (d.tick) d.tick(this, vx, vy, ev);
      }
      if (ev.t <= 0){ if (d && d.end) d.end(this); if (this[slot] === ev) this[slot] = null; this.normaAnchor('eventEnd', ev.kind, ev.norma && ev.norma.end); }
    });
  },

  endAllEvents(){ this.clearWells(); this.killPlasma(); this._magnetUntil = 0; ['curEvent','curSmall'].forEach(slot=>{ const ev = this[slot]; if (!ev) return; const d = EVENT_DEFS[ev.kind]; if (d && d.end) d.end(this); this[slot] = null; }); },

  realBossAlive(){ return !!(this.ar && !this.ar.dead) || !!(this.mt && !this.mt.dead) || !!(this.rx && !this.rx.dead) || !!(this.an && !this.an.dead) || !!(this.pd && !this.pd.dead) || !!(this.w2 && !this.w2.dead) || (this.bosses || []).some(b=> b && b.active && !b.isBonus); },

  // petits événements: minuteur à part (30-60 s), n'importe quand, y compris avant le 1er boss et par-dessus un gros événement; jamais pendant un combat de vrai boss (sauf un boss bonus, rare)
  updateSmallEvents(delta){
    if (this.sandbox || this.introActive || (this.lvDef && this.lvDef.ambient && !this.lvDef.ambient.smallEvents)) return;
    this.smallCd -= delta;
    if (this.smallCd > 0 || this.curSmall) return;
    const al = this.alertLevel, rearm = ()=>{ this.smallCd = Phaser.Math.Between(30000, 60000) * (al >= 8 ? 0.8 : 1); };
    if (this.bossActive){
      this.smallCd = 12000;
      const solo = this.bosses.length === 1 && !this.bosses[0].isBonus;
      if (solo && al >= EVENT_DEFS.bossbonus.min && Math.random() < 0.06){ rearm(); this.startEvent('bossbonus'); }
      return;
    }
    const low = this.hp < this.stats.maxHp*0.5;
    const list = Object.keys(EVENT_DEFS).filter(k=> EVENT_DEFS[k].small && al >= EVENT_DEFS[k].min).map(k=>({ k, w: EVENT_DEFS[k].w(al, low) }));
    if (!list.length){ rearm(); return; }
    let roll = Math.random() * list.reduce((t,e)=> t + e.w, 0), kind = list[0].k;
    for (const e of list){ if (roll < e.w){ kind = e.k; break; } roll -= e.w; }
    rearm(); this.startEvent(kind);
  },
});
