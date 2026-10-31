"use strict";
// Méthodes de GameScene — niveaux des mondes : objectif, événements du niveau, victoire.
// `this.lvDef` = définition du niveau en cours (data/worlds), null pour l'ancienne partie infinie (bouton DEMARRER, bac à sable).
// Note : `this.level` est le niveau d'XP du joueur, rien à voir avec le niveau du monde.
mixin(GameScene, {
  // appelé à la fin de create() : remet à zéro l'état du niveau
  levelInit(){
    this.lvT = 0; this.lvBossAt = 0; this.lvGems = 0; this.lvEnding = false; this.lvBossOut = false; this.lvResult = null; this.ar = null; this.mt = null; this.rx = null; this.an = null; this.pd = null; if (this.w2) this.w2Cleanup(); this.w2 = null; this._ecRet = null;
    const d = this.lvDef || (this.tuto ? levelById('w1-tuto') : null);
    this.lvWaves = [];
    ((d && d.waves) || []).forEach(w=>{ for (let i=0;i<w.count;i++) this.lvWaves.push({ ...w, at:w.at + i*w.spacing, unitIndex:i }); });
    this.lvWaves.sort((a,b)=> a.at-b.at);
    this.lvEvents = d ? (d.events || []).slice().sort((a, b)=> a.at - b.at) : [];
    this.lvBossAt = (d && !this.tuto) ? levelBossAt(d) : 0;
    if (d){ this.nextBossAt = 1e9; this._double1 = true; }       // ni boss périodique ni double boss : le boss du monde arrive à la fin de son niveau
  },

  levelUpdate(delta){
    const d = this.lvDef || (this.tuto ? levelById('w1-tuto') : null);
    if (!d || this.lvEnding || this.introActive || (this.tuto && this.tutoDone)) return;
    this.lvT += delta/1000;
    // Une entrée n'est consommée que si le spawn réussit (plafond physique existant).
    // Une vague en attente d'alerte ne bloque pas les suivantes. En saturation, on réessaie à l'image suivante.
    for (let i=0;i<this.lvWaves.length;){
      const wave=this.lvWaves[i]; if (wave.at>this.lvT) break;
      if (wave.minAlert && this.alertLevel<wave.minAlert){ i++; continue; }
      if (!this.levelSpawnWave(wave)) break;
      this.lvWaves.splice(i,1);
    }
    const ev = this.lvEvents[0];
    if (ev && this.lvT >= ev.at){
      const slot = EVENT_DEFS[ev.kind].small ? 'curSmall' : 'curEvent';
      if (!this[slot] && !this.realBossAlive()){ this.lvEvents.shift(); this.startEvent(ev.kind, ev.duration == null ? undefined : ev.duration * 1000, ev.params, ev.norma); }
    }
    if (this.tuto) return;
    // le but de tout ordre : vaincre son boss. Il arrive après les autres mobs de la timeline (levelBossAt, data/boss-arrival.js), la victoire vient de sa destruction
    if (!this.lvBossOut && this.lvT >= this.lvBossAt && !this.curEvent){
      this.lvBossOut = true; this.normaAnchor('bossStart');
      if (d.finalBoss === 'pdg') this.pdStart();            // le boss du monde 1 est « Le PDG » (bosses/pdg.js), pas le Dreadnought
      else if (d.finalBoss === 'meteo') this.mtStart();
      else if (d.finalBoss === 'reacteur') this.rxStart();
      else if (d.finalBoss === 'anneau') this.anStart();
      else if (BOSS_W2[d.finalBoss]) this.w2Start(d.finalBoss);
      else if (d.finalBoss) this.arStart();
      else this.spawnBoss(d.boss);
    }
  },

  // Placement initial uniquement : les créatures reprennent ensuite leur IA habituelle.
  levelSpawnWave(wave){
    const alert=this.alertLevel, weapon=this.weaponTier;
    try {
      if (wave.alert){ this.alertLevel=wave.alert; this.weaponTier=weaponTierFor(wave.alert); }
      if (!wave.formation && !wave.alert && !wave.hpMul && !wave.dmgMul && !wave.speedMul && !wave.tier && !(this.tuto && wave.type==='sat')) return !!this.spawnOneEnemy(wave.type);
      const placed=wave.formation && wave.formation!=='random';
      const vx=placed?this.visibleXRange(45):null, vy=placed?this.visibleYRange(0):null;
      const p=placed?WavePatterns.point(wave,wave.unitIndex):null;
      const x=placed?Math.max(vx.min,Math.min(vx.max,vx.min+(vx.max-vx.min)*(wave.x===undefined?50:wave.x)/100+p.dx)):undefined;
      let e;
      // Le satellite pédagogique conserve son compteur et ses débris.
      if (this.tuto && wave.type==='sat'){
        this.tutoSpawnSat(false); const sat=this.tutoSats.at(-1);
        if(!sat)return false;
        if(placed){sat.sp.x=x;sat.sp.y=vy.min+(vy.max-vy.min)*(wave.y||0)/100+p.dy;sat.x0=x;}
        sat.hp*=wave.hpMul||1;sat.max*=wave.hpMul||1;sat.vy*=wave.speedMul||1;sat.vx*=wave.speedMul||1;sat.waveDmgMul=wave.dmgMul||1;
        return true;
      } else e=this.spawnOneEnemy(wave.type,x,wave);
      if (!e) return false;
      if (placed){
        e.x=x; e.y=vy.min+(vy.max-vy.min)*(wave.y||0)/100+p.dy;
        if (e.body && e.body.reset){const vx=e.body.velocity.x,vy=e.body.velocity.y;e.body.reset(e.x,e.y);e.body.velocity.x=vx;e.body.velocity.y=vy;}
        if (e.baseX!==undefined) e.baseX=x;
        if (e.stopY!==undefined) e.stopY=Math.max(e.stopY,e.y);
      }
      if (wave.alert) e.waveAlert=wave.alert;
      if (wave.tier) e.tier=wave.tier;
      const hp=wave.hpMul||1;
      if (e.hp!==undefined){ e.hp*=hp; e.maxHp*=hp; }
      if (e.shieldHp!==undefined) e.shieldHp*=hp;
      if (e.shieldMaxHp!==undefined) e.shieldMaxHp*=hp;
      e.waveDmgMul=wave.dmgMul||1;
      e.contactDamage*=e.waveDmgMul;
      if (e.body && wave.speedMul){ e.body.velocity.x*=wave.speedMul; e.body.velocity.y*=wave.speedMul; }
      return true;
    } finally { this.alertLevel=alert; this.weaponTier=weapon; }
  },

  // DÉZOOM PROGRESSIF d'un niveau : on démarre serré sur le vaisseau, puis la caméra recule au fil du niveau (le plus lent des deux : avancée vers le boss ou temps écoulé).
  // Plus on avance dans le monde, plus le niveau se termine large (davantage d'espace pour davantage d'ennemis) ; le monde suivant va encore plus loin.
  // Réglable par niveau : `zoom:{ start, end, seconds }` dans data/worlds/*.js.
  levelZoom(){
    const d = this.lvDef, zc = d.zoom || {}, w = worldById(d.world);
    const start = zc.start != null ? zc.start : ZOOM_START - 0.02 * d.index;
    const end = Math.max(0.6, zc.end != null ? zc.end : ZOOM_END - 0.045 * d.index - 0.035 * ((w ? w.order : 1) - 1));
    const dur = zc.seconds != null ? zc.seconds : (d.type === 'boss' ? 70 : this.lvBossAt * 0.9);
    const t = Math.min(1, Math.max(this.levelProgress().frac, this.lvT / dur));
    return start + (end - start) * (t * t * (3 - 2 * t));      // départ et arrivée en douceur
  },

  // { frac 0..1, label } — avancement vers le but de l'ordre : l'arrivée de son boss, puis la vie du boss
  levelProgress(){
    const d = this.lvDef; if (!d) return { frac:0, label:'' };
    if (this.lvBossOut){
      const B = this.ar || this.mt || this.rx || this.an || this.pd || this.w2; if (B) return { frac: Math.max(0, 1 - B.hp / B.max), label:'BOSS' };
      const b = this.currentBoss;
      return { frac: (b && b.maxHp) ? Math.max(0, 1 - b.hp / b.maxHp) : 0, label:'BOSS' };
    }
    const at = Math.max(1, this.lvBossAt || 1);
    return { frac: Math.min(1, this.lvT / at), label:'BOSS · ' + Math.max(0, Math.ceil(at - this.lvT)) + ' s' };
  },

  // valeurs 0..1 des objectifs de FINITION de cette partie (voir data/completion.js) ; appelé par endRun, victoire ou défaite
  levelComp(victory){
    const d = this.lvDef; if (!d) return null;
    const mod = this.ar || this.mt || this.rx || this.an || this.pd || this.w2, gb = this.currentBoss, bossOut = !!mod || this.lvBossOut;
    const clean = Math.max(0, 1 - (this.runHits || 0) * 0.12);
    const hit = mod ? Math.max(0, 1 - mod.hp / mod.max) : ((bossOut && gb && gb.maxHp) ? Math.max(0, 1 - gb.hp / gb.maxHp) : null);
    if (d.type === 'boss') return { boss: hit === null ? 0 : hit, win: victory ? 1 : 0, clean };
    return { goal: bossOut ? 1 : this.levelProgress().frac, boss: hit === null ? (victory ? 1 : 0) : hit, win: victory ? 1 : 0, clean };
  },

  // boss vaincu : plus d'apparitions, vaisseau protégé, le décor se vide, puis écran de fin
  levelWin(){
    if (this.lvEnding || !this.running) return;
    this.lvEnding = true; this._compVacuum = true;          // les composants encore à l'écran filent vers la camionnette
    this.hitCooldown = Math.max(this.hitCooldown, 6000);
    this.notice('INTERVENTION VALIDEE', this.lvDef.name);
    sfx.relicOpen();
    this.time.delayedCall(1100, ()=>{
      if (!this.running) return;
      this.enemies.clear(true, true); this.enemyBullets.clear(true, true);
      this.bossActive = false; this.bosses = []; this.currentBoss = null;
      document.querySelectorAll('#boss-hp-wrap, #boss-hp-wrap2, #boss-hp-wrap3').forEach(x=> x.classList.remove('show'));
    });
    this.time.delayedCall(2300, ()=>{ if (this.running) this.endRun(true); });
  },
});
