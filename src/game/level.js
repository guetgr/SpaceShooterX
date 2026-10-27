"use strict";
// Méthodes de GameScene — niveaux des mondes : objectif, événements du niveau, victoire.
// `this.lvDef` = définition du niveau en cours (data/worlds), null pour l'ancienne partie infinie (bouton DEMARRER, bac à sable).
// Note : `this.level` est le niveau d'XP du joueur, rien à voir avec le niveau du monde.
mixin(GameScene, {
  // appelé à la fin de create() : remet à zéro l'état du niveau
  levelInit(){
    this.lvT = 0; this.lvGems = 0; this.lvEnding = false; this.lvBossOut = false; this.lvResult = null; this.ar = null; this.mt = null; this.rx = null; this.an = null; this.pd = null; this._ecRet = null;
    const d = this.lvDef;
    this.lvEvents = d ? (d.events || []).slice().sort((a, b)=> a.at - b.at) : [];
    if (d){ this.nextBossAt = 1e9; this._double1 = true; }       // ni boss périodique ni double boss : le boss du monde arrive à la fin de son niveau
  },

  levelUpdate(delta){
    const d = this.lvDef;
    if (!d || this.lvEnding || this.introActive) return;
    this.lvT += delta/1000;
    const ev = this.lvEvents[0];
    if (ev && this.lvT >= ev.at){
      const slot = EVENT_DEFS[ev.kind].small ? 'curSmall' : 'curEvent';
      if (!this[slot] && !this.realBossAlive()){ this.lvEvents.shift(); this.startEvent(ev.kind, EVENT_DEFS[ev.kind].dur(this.alertLevel)); }
    }
    const g = d.goal || {};
    if (d.type === 'boss'){
      if (!this.lvBossOut && this.lvT >= 1.5 && !this.curEvent){ this.lvBossOut = true; if (d.finalBoss === 'pdg') this.pdStart(); else this.spawnBoss(d.boss); }       // le boss du monde 1 est « Le PDG » (bosses/pdg.js), pas le Dreadnought
    } else if (d.finalBoss){                                     // niveau de survie qui finit par un boss : il arrive quand le temps est écoulé, la victoire vient de sa destruction
      if (!this.ar && !this.mt && !this.rx && !this.an && this.levelProgress().frac >= 1 && !this.curEvent){ if (d.finalBoss === 'meteo') this.mtStart(); else if (d.finalBoss === 'reacteur') this.rxStart(); else if (d.finalBoss === 'anneau') this.anStart(); else this.arStart(); }
    } else if (this.levelProgress().frac >= 1) this.levelWin();
  },

  // DÉZOOM PROGRESSIF d'un niveau : on démarre serré sur le vaisseau, puis la caméra recule au fil du niveau (le plus lent des deux : objectif atteint ou temps écoulé).
  // Plus on avance dans le monde, plus le niveau se termine large (davantage d'espace pour davantage d'ennemis) ; le monde suivant va encore plus loin.
  // Réglable par niveau : `zoom:{ start, end, seconds }` dans data/worlds/*.js.
  levelZoom(){
    const d = this.lvDef, zc = d.zoom || {}, w = worldById(d.world), g = d.goal || {};
    const start = zc.start != null ? zc.start : ZOOM_START - 0.02 * d.index;
    const end = Math.max(0.6, zc.end != null ? zc.end : ZOOM_END - 0.045 * d.index - 0.035 * ((w ? w.order : 1) - 1));
    const dur = zc.seconds != null ? zc.seconds : (d.type === 'survive' && g.seconds ? g.seconds * 0.9 : 70);
    const t = Math.min(1, Math.max(this.levelProgress().frac, this.lvT / dur));
    return start + (end - start) * (t * t * (3 - 2 * t));      // départ et arrivée en douceur
  },

  // { frac 0..1, label } — avancement vers l'objectif
  levelProgress(){
    const d = this.lvDef; if (!d) return { frac:0, label:'' };
    const g = d.goal || {};
    if (d.finalBoss && (this.ar || this.mt || this.rx || this.an || this.pd)){ const B = this.ar || this.mt || this.rx || this.an || this.pd; return { frac: Math.max(0, 1 - B.hp / B.max), label:'BOSS' }; }
    if (d.type === 'survive') return { frac: Math.min(1, this.lvT / g.seconds), label: Math.max(0, Math.ceil(g.seconds - this.lvT)) + ' s' };
    if (d.type === 'kill')    return { frac: Math.min(1, this.runKills / g.count), label: Math.min(this.runKills, g.count) + '/' + g.count };
    if (d.type === 'collect') return { frac: Math.min(1, this.lvGems / g.gems), label: Math.min(this.lvGems, g.gems) + '/' + g.gems };
    const b = this.currentBoss;                                                         // boss
    return { frac: (this.lvBossOut && b && b.maxHp) ? Math.max(0, 1 - b.hp / b.maxHp) : 0, label: 'BOSS' };
  },

  // valeurs 0..1 des objectifs de FINITION de cette partie (voir data/completion.js) ; appelé par endRun, victoire ou défaite
  levelComp(victory){
    const d = this.lvDef; if (!d) return null;
    const boss = this.ar || this.mt || this.rx || this.an || this.pd, bossOut = !!boss || this.lvBossOut;
    const clean = Math.max(0, 1 - (this.runHits || 0) * 0.12);
    if (d.type === 'boss'){
      const b = this.currentBoss;
      return { boss: (bossOut && b && b.maxHp) ? Math.max(0, 1 - b.hp / b.maxHp) : 0, win: victory ? 1 : 0, clean };
    }
    const goal = bossOut ? 1 : this.levelProgress().frac;
    if (!d.finalBoss) return { goal, win: victory ? 1 : 0, clean };
    return { goal, boss: boss ? Math.max(0, 1 - boss.hp / boss.max) : (victory ? 1 : 0), win: victory ? 1 : 0, clean };
  },

  // objectif atteint : plus d'apparitions, vaisseau protégé, le décor se vide, puis écran de fin
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
