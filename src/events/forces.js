"use strict";
// Méthodes de GameScene — puits de gravité et forces.
mixin(GameScene, {
  // ---- TROUS NOIRS + TEMPETE MAGNETIQUE: forces qui déplacent directement les objets (le vaisseau lutte contre l'attraction pour suivre le doigt)
  addWell(o){
    const img = this.add.image(o.x, o.y, 'galaxySwirl').setDepth(-0.5).setTint(0x000000).setAlpha(0).setScale(0.1);
    const disc = this.add.circle(o.x, o.y, o.core, 0x000000).setDepth(-0.4).setAlpha(0);
    const ring = this.add.image(o.x, o.y, 'shockRing').setDepth(-0.45).setBlendMode(Phaser.BlendModes.ADD).setTint(0x5a2a9a).setAlpha(0).setScale(o.r*2/256);
    const sc2 = o.r*1.7/256;
    this.tweens.add({ targets:img, alpha:0.95, scaleX:sc2, scaleY:sc2, duration:1800, ease:'Sine.easeOut' });
    this.tweens.add({ targets:disc, alpha:1, duration:1800 });
    this.tweens.add({ targets:ring, alpha:0.35, scaleX:o.r*0.5/256, scaleY:o.r*0.5/256, duration:1400, repeat:-1, ease:'Sine.easeIn' });
    this.tweens.add({ targets:img, angle:360, duration:o.big ? 7000 : 4000, repeat:-1 });
    const w = Object.assign({ img, disc, ring, age:0, dmgCd:0, vx:Phaser.Math.FloatBetween(-12,12), vy:Phaser.Math.FloatBetween(4,16) }, o);
    this._wells.push(w); sfx.eventStart('flip'); return w;
  },

  removeWell(w){
    this._wells = this._wells.filter(x=> x !== w);
    [w.img, w.disc, w.ring].forEach(g=>{ if (!g) return; this.tweens.killTweensOf(g); this.tweens.add({ targets:g, alpha:0, duration:600, onComplete:()=>g.destroy() }); });
  },

  clearWells(){ (this._wells||[]).slice().forEach(w=> this.removeWell(w)); this._wells = []; },

  updateForces(delta){
    const dt = delta/1000, mag = this.elapsed < (this._magnetUntil||0);
    const move = (o, tx, ty, spd, eat)=>{
      const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy) || 1, st = Math.min(spd*dt, d);
      const mx = dx/d*st, my = dy/d*st; o.x += mx; o.y += my; if (o.baseX !== undefined) o.baseX += mx; if (o.body && o.body.reset === undefined) {}
      return d - st;
    };
    const pullable = e=> e && e.active && e.enemyType !== 'boss' && !e.isBossPart && !e.isBonus && e.enemyType !== 'golden';
    if (mag && this.player.active){
      this.enemies.children.iterate(e=>{ if (pullable(e) && !e._arriving) move(e, this.player.x, this.player.y, 200*this.coordResist(e)); });
      this.enemyBullets.children.iterate(b=>{ if (b && b.active) move(b, this.player.x, this.player.y, 300); });
    }
    this.updateSpecials(delta);
    const ws = this._wells;
    let kT = 0; if (ws && ws.length && this.player.active) ws.forEach(w=>{ const d = Math.hypot(w.x-this.player.x, w.y-this.player.y); kT = Math.max(kT, Math.min(1, 0.35 + 0.65*(1 - d/(w.r*1.6))) * Math.min(1, w.age/1500)); });
    this._holeK = (this._holeK||0) + (kT - (this._holeK||0)) * Math.min(1, dt*3);
    this._eclK = (this._eclK||0) + ((this._ecl ? 1 : 0) - (this._eclK||0)) * Math.min(1, dt*1.2);
    this._iceK = (this._iceK||0) + ((this._ice ? 1 : 0) - (this._iceK||0)) * Math.min(1, dt*1.2);
    { const cands = [ { k:this._holeK, cut:700, echo:0.55, rate:0.38, dim:0.75 }, { k:this._eclK, cut:1300, echo:0.35, rate:0.10, dim:0.5 }, { k:this._iceK, cut:3200, echo:0.3, rate:0.08, dim:0.25 } ];
      let c = cands[0]; cands.forEach(x=>{ if (x.k > c.k) c = x; });
      this._audRate = c.rate*c.k; this._audDim = c.dim*c.k; sfx.setHole(c.k, c.cut, c.echo); }
    if (!ws || !ws.length) return;
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    ws.slice().forEach(w=>{
      w.age += delta;
      if (!w.big){
        w.x += w.vx*dt; w.y += w.vy*dt;
        if (w.age > w.life - 1200 && !w._dying){ w._dying = true; this.tweens.add({ targets:[w.img, w.disc, w.ring], alpha:0, duration:1200 }); }
        if (w.age >= w.life){ this.removeWell(w); return; }
      }
      w.img.setPosition(w.x, w.y); w.disc.setPosition(w.x, w.y); w.ring.setPosition(w.x, w.y);
      const ramp = Math.min(1, w.age/1800);
      const force = d=> w.str * ramp * (0.15 + 0.85*Math.pow(1 - d/w.r, 1.4));
      const eat = (o, mul)=>{
        const d = Math.hypot(w.x-o.x, w.y-o.y); if (d > w.r) return;
        if (d < w.core*0.8){ this.spawnHitParticles(o.x, o.y, 3); o.destroy(); return; }
        move(o, w.x, w.y, force(d) * (mul || 1) * (o.enemyType ? this.coordResist(o) : 1));
      };
      this.enemies.children.iterate(e=>{ if (pullable(e)) eat(e); });
      this.enemyBullets.children.iterate(b=>{ if (b && b.active) eat(b); });
      this.gems.children.iterate(g=>{ if (g && g.active) eat(g, 1.8); });
      this.heals.children.iterate(h=>{ if (h && h.active) eat(h, 1.8); });
      this.playerBullets.children.iterate(b=>{ if (b && b.active) eat(b, 1.2); });
      this.missiles.children.iterate(m=>{ if (m && m.active) eat(m, 1.2); });
      if (this.player.active && !this.introActive){
        const d = Math.hypot(w.x-this.player.x, w.y-this.player.y);
        if (d < w.r){
          move(this.player, w.x, w.y, force(d)*1.5 * Math.max(0.7, this.stats.moveResponsiveness/11));   // le vaisseau lutte: plus il est réactif, plus il résiste (donc on tire plus fort pour que ça se sente)
          this.player.x = Phaser.Math.Clamp(this.player.x, vx.min+10, vx.max-10); this.player.y = Phaser.Math.Clamp(this.player.y, vy.min+30, vy.max-10);
          w.dmgCd -= delta;
          if (d < w.core + 14 && w.dmgCd <= 0){ w.dmgCd = 450; this.damagePlayer(w.dmg + this.alertLevel); }
        }
      }
    });
  },
});
