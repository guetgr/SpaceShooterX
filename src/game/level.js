"use strict";
// Méthodes de GameScene — niveaux des mondes : objectif, événements du niveau, victoire.
// `this.lvDef` = définition du niveau en cours (data/worlds), null pour l'ancienne partie infinie (bouton DEMARRER, bac à sable).
// Note : `this.level` est le niveau d'XP du joueur, rien à voir avec le niveau du monde.
mixin(GameScene, {
  // appelé à la fin de create() : remet à zéro l'état du niveau
  levelInit(){
    this.lvT = 0; this.lvGems = 0; this.lvEnding = false; this.lvBossOut = false; this.lvResult = null;
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
      if (!this.lvBossOut && this.lvT >= 1.5 && !this.curEvent){ this.lvBossOut = true; this.spawnBoss(d.boss); }
    } else if (this.levelProgress().frac >= 1) this.levelWin();
  },

  // { frac 0..1, label } — avancement vers l'objectif
  levelProgress(){
    const d = this.lvDef; if (!d) return { frac:0, label:'' };
    const g = d.goal || {};
    if (d.type === 'survive') return { frac: Math.min(1, this.lvT / g.seconds), label: Math.max(0, Math.ceil(g.seconds - this.lvT)) + ' s' };
    if (d.type === 'kill')    return { frac: Math.min(1, this.runKills / g.count), label: Math.min(this.runKills, g.count) + '/' + g.count };
    if (d.type === 'collect') return { frac: Math.min(1, this.lvGems / g.gems), label: Math.min(this.lvGems, g.gems) + '/' + g.gems };
    const b = this.currentBoss;                                                         // boss
    return { frac: (this.lvBossOut && b && b.maxHp) ? Math.max(0, 1 - b.hp / b.maxHp) : 0, label: 'BOSS' };
  },

  // objectif atteint : plus d'apparitions, vaisseau protégé, le décor se vide, puis écran de fin
  levelWin(){
    if (this.lvEnding || !this.running) return;
    this.lvEnding = true;
    this.hitCooldown = Math.max(this.hitCooldown, 6000);
    this.notice('NIVEAU TERMINE', this.lvDef.name);
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
