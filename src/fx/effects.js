"use strict";
// Méthodes de GameScene — effets : explosion kamikaze, toiles, explosions de mort.
mixin(GameScene, {
  // explosion du kamikaze: dégâts de zone au joueur (rayon et dégâts montent avec le niveau d'alerte)
  kamikazeBlast(e, fromKill){
    if (!e.active || e._blasted) return;
    e._blasted = true;
    const a = this.alertLevel;
    const R = Math.min(130, 70 + 6*(a-1));
    const dmg = Math.min(45, 20 + 2*(a-1));
    this.explodeFx(e.x, e.y, R);
    this.spawnHitParticles(e.x, e.y, 10);
    sfx.kamikazeBoom({ pan:this.panOf(e.x) });
    this.cameras.main.shake(120, 0.006);
    if (this.player.active && Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y) <= R) this.damagePlayer(dmg);
    if (!fromKill){ e.hp = 0; this.killEnemy(e); }
  },

  // toiles: les araignées en position relient leurs plus proches alliées par des lasers (annonce fine, puis faisceau qui blesse)
  updateWebs(delta){
    const g = this.webGfx;
    if (!g) return;
    g.clear();
    const sp = [];
    this.enemies.children.iterate(e=>{ if (e && e.active && e.enemyType === 'spider' && e.body.velocity.y === 0) sp.push(e); });
    const W = this.web, a = this.alertLevel;
    if (sp.length < 2){ W.state = 'idle'; W.t = Math.max(W.t, 1500); return; }
    W.t -= delta;
    if (W.t <= 0){
      if (W.state === 'idle'){ W.state = 'telegraph'; W.t = 1000; }
      else if (W.state === 'telegraph'){ W.state = 'fire'; sfx.webShoot(); W.t = 1250 + 30*Math.min(a,10); }
      else { W.state = 'idle'; W.t = Math.max(1100, 2800 - 160*(a-1)); }
    }
    if (W.state === 'idle') return;
    const maxLinks = a >= 4 ? 2 : 1, seen = {}, links = [];
    sp.forEach((s, i)=>{
      sp.map((o, j)=>({ o, j, d:Phaser.Math.Distance.Between(s.x, s.y, o.x, o.y) }))
        .filter(m=> m.o !== s && m.d <= 340).sort((m,n)=> m.d - n.d).slice(0, maxLinks)
        .forEach(m=>{ const key = i < m.j ? i+'-'+m.j : m.j+'-'+i; if (!seen[key]){ seen[key] = 1; links.push([s, m.o]); } });
    });
    links.forEach(([s, o])=>{
      if (W.state === 'telegraph'){
        g.lineStyle(2, 0xb890ff, 0.30); g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(o.x, o.y); g.strokePath();
      } else {
        g.lineStyle(10, 0x9d5cff, 0.50); g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(o.x, o.y); g.strokePath();
        g.lineStyle(3, 0xffffff, 0.95);  g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(o.x, o.y); g.strokePath();
        const dx = o.x - s.x, dy = o.y - s.y, L2 = dx*dx + dy*dy || 1;
        const tt = Phaser.Math.Clamp(((this.player.x - s.x)*dx + (this.player.y - s.y)*dy)/L2, 0, 1);
        const dist = Math.hypot(this.player.x - (s.x + tt*dx), this.player.y - (s.y + tt*dy));
        if (dist < 11 && this.player.active) this.damagePlayer(8 + Math.min(a, 12));
      }
    });
  },

  explodeFx(x, y, r){
    // plafond d'effets visuels par 100 ms: pendant un wipe massif, seuls les premiers anneaux sont dessinés
    const now = this.time.now;
    if (!this._fxT || now - this._fxT > 100){ this._fxT = now; this._fxN = 0; }
    if (this._fxN++ >= 10) return;
    const ring = this.add.image(x, y, 'shockRing');
    ring.setDepth(6); ring.setBlendMode(Phaser.BlendModes.ADD); ring.setTint(0xffa040);
    ring.setScale(0.1); ring.setAlpha(0.9);
    this.tweens.add({ targets:ring, scaleX:r*2.3/256, scaleY:r*2.3/256, duration:240, ease:'Quad.easeOut' });
    this.tweens.add({ targets:ring, alpha:0, duration:260, onComplete:()=>ring.destroy() });
    this.spawnHitParticles(x, y, 6);
  },
});
