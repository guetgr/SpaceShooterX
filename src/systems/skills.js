"use strict";
// Méthodes de GameScene — compétences actives : ralenti, dernier souffle, foudre en chaîne, updateSkills.
mixin(GameScene, {
  // ralenti (ex: à la mort d'un boss ou au dernier souffle): tout le jeu ralentit d'un coup
  startSlowmo(ms, scale, force){
    if (!force) return;                         // plus aucun ralenti, sauf le DERNIER SOUFFLE (12% de vie)
    this.slowmo = { until: performance.now() + ms, scale };
    this.physics.world.timeScale = 1/scale; this.tweens.timeScale = scale; this.time.timeScale = scale; this.anims.globalTimeScale = scale;
  },

  endSlowmo(){
    this.slowmo = null;
    this.physics.world.timeScale = 1; this.tweens.timeScale = 1; this.time.timeScale = 1; this.anims.globalTimeScale = 1;
  },

  // DERNIER SOUFFLE: une fois par partie, quand il ne reste que 12% de PV (et plus de bouclier) — ralenti, vignette rouge, un peu de répit pour rebondir
  lastStand(){
    this.lastStandUsed = true;
    this.startSlowmo(900, 0.3, true);
    this.hitCooldown = Math.max(this.hitCooldown, 1400);
    this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.maxHp*0.12);
    const v = document.getElementById('redVig');
    if (v){ v.classList.remove('show'); void v.offsetWidth; v.classList.add('show'); }
    this.cameras.main.shake(300, 0.01);
    sfx.lastStand();
    this.addOverdrive(60);
    this.notice('DERNIER SOUFFLE !', 'Tiens bon... +12% de PV, un instant de répit et l\'overdrive se charge');
  },

  /* ---------- COMPETENCES ACTIVES ---------- */
  // FOUDRE: un arc part du point d'impact vers les ennemis les plus proches
  chainLightning(from, dmg){
    sfx.lightning();
    const n = Math.round(this.stats.chainLightning), R = 170, cands = [];
    this.enemies.children.iterate(v=>{
      if (!v || !v.active || v === from || v.phased || v.invuln || v._doomed) return;
      const d = Phaser.Math.Distance.Between(from.x, from.y, v.x, v.y);
      if (d <= R) cands.push({ v, d });
    });
    cands.sort((a,b)=> a.d - b.d);
    for (let i=0;i<Math.min(n, cands.length);i++){
      const v = cands[i].v;
      this.applyDamageToEnemy(v, dmg*0.3);
      if (this._arcs.length < 60) this._arcs.push({ x1:from.x, y1:from.y, x2:v.x, y2:v.y, t:140 });
      if (v.hp <= 0){ v._doomed = true; this.time.delayedCall(30, ()=>{ if (v.active) this.killEnemy(v); }); }
    }
  },

  updateSkills(delta){
    const st = this.stats, g = this.skillGfx;
    g.clear();
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    const px = this.player.x, py = this.player.y;

    // REBOND: les tirs repartent en sens inverse sur les CÔTES de l'écran (pas en haut: ils ne reviennent plus sur toi).
    // Pour rester lisible: un tir rebondi est plus pâle et plus petit, il disparaît après ~1 s, et il y en a au plus 30 à la fois.
    if (st.bounce > 0){
      let bounced = 0;
      this.playerBullets.children.iterate(b=>{
        if (!b || !b.active || !b.body) return;
        if (b._bn === undefined) b._bn = st.bounce;
        if (b._bounced){
          b._bt -= delta;
          if (b._bt <= 0){ b.destroy(); return; }
          bounced++;
        }
        if (b._bn <= 0) return;
        const v = b.body.velocity; let hit = false;
        if (b.x < vx.min && v.x < 0){ v.x = -v.x; b.x = vx.min; hit = true; }
        else if (b.x > vx.max && v.x > 0){ v.x = -v.x; b.x = vx.max; hit = true; }
        if (hit){
          if (Math.max(this._bouncedCount || 0, bounced) >= 30){ b.destroy(); return; }       // trop de rebonds à l'écran: celui-ci s'arrête
          b._bn--; b._bounced = true; sfx.bounce(); b._bt = 1100;
          b.setAlpha(0.5); b.setTint(0x9fe8ff); b.setScale(b.scaleX*0.8, b.scaleY*0.8);
          bounced++;
        }
      });
      this._bouncedCount = bounced;
    }

    // TONNERRE: toutes les 8 s la foudre frappe l'ennemi visible qui a le plus de PV
    if (st.thunder > 0){
      this.thunderCd -= delta;
      if (this.thunderCd <= 0){
        this.thunderCd = 8000;
        let best = null, bestHp = -1;
        this.enemies.children.iterate(v=>{
          if (!v || !v.active || v.phased || v.invuln || v._doomed) return;
          if (v.x < vx.min || v.x > vx.max || v.y < vy.min || v.y > vy.max) return;
          if ((v.hp||0) > bestHp){ bestHp = v.hp||0; best = v; }
        });
        if (best){
          this.applyDamageToEnemy(best, st.damage*6);
          this._arcs.push({ bolt:true, x1:best.x, y1:vy.min - 20, x2:best.x, y2:best.y, t:260 });
          this.cameras.main.shake(90, 0.004); sfx.thunder(); this.spawnHitParticles(best.x, best.y, 8);
          if (best.hp <= 0){ best._doomed = true; this.time.delayedCall(60, ()=>{ if (best.active) this.killEnemy(best); }); }
        }
      }
    }

    // CHAMP LENT: les tirs ennemis qui entrent dans la zone sont ralentis (une seule fois)
    if (st.slowField > 0){
      const R = 70 + 25*st.slowField, mul = Math.max(0.35, 0.8 - 0.1*st.slowField);
      this.enemyBullets.children.iterate(b=>{
        if (!b || !b.active || b._slow || !b.body) return;
        if (Math.abs(b.x-px) > R || Math.abs(b.y-py) > R) return;
        if (Math.hypot(b.x-px, b.y-py) <= R){ b.body.velocity.x *= mul; b.body.velocity.y *= mul; if (b.speed) b.speed *= mul; b._slow = true; sfx.slowField(); }
      });
      // lueur douce qui pulse légèrement autour du vaisseau (pas de contour)
      const pul = 0.75 + 0.25*Math.sin(this.time.now/320);
      g.fillStyle(0x66b8ff, 0.030*pul); g.fillCircle(px, py, R);
      g.fillStyle(0x66b8ff, 0.040*pul); g.fillCircle(px, py, R*0.66);
      g.fillStyle(0x9fe0ff, 0.050*pul); g.fillCircle(px, py, R*0.34);
    }

    // PULSAR: une onde efface les tirs ennemis proches
    if (st.pulsar > 0){
      this.pulsarCd -= delta;
      if (this.pulsarCd <= 0){
        this.pulsarCd = Math.max(5000, 16000 - 2000*st.pulsar); sfx.pulsar();
        const R = 150 + 20*st.pulsar;
        // deux temps: on repère puis on supprime (supprimer pendant le parcours ferait sauter des tirs voisins)
        const doomed = [];
        this.enemyBullets.children.iterate(b=>{
          if (b && b.active && Phaser.Math.Distance.Between(b.x, b.y, px, py) <= R) doomed.push(b);
        });
        doomed.forEach(b=> b.destroy());
        const ring = this.add.image(px, py, 'shockRing').setDepth(12).setBlendMode(Phaser.BlendModes.ADD).setTint(0xb48cff).setScale(0.1).setAlpha(0.95);
        const kz = Phaser.Math.Clamp(1/this.cameras.main.zoom, 1, 2.2);
        this.tweens.add({ targets: ring, scaleX: R*2.3*kz/256, scaleY: R*2.3*kz/256, duration: 360, ease:'Quad.easeOut' });
        this.tweens.add({ targets: ring, alpha: 0, duration: 360, delay: 60, onComplete: ()=> ring.destroy() });
      }
    }

    // TROU NOIR: au centre du plus gros groupe d'ennemis, il les attire et les écrase pendant quelques secondes
    if (st.blackHole > 0){
      this.holeCd -= delta;
      if (!this.hole && this.holeCd <= 0){
        const all = [];
        this.enemies.children.iterate(v=>{
          if (v && v.active && v.enemyType !== 'boss' && !v.isBossPart && !v.phased && v.x > vx.min && v.x < vx.max && v.y > vy.min && v.y < vy.max) all.push(v);
        });
        if (all.length >= 4){
          const sample = all.length > 40 ? Phaser.Utils.Array.Shuffle(all.slice()).slice(0,40) : all;
          let best = null, bn = -1;
          sample.forEach(c=>{ let n = 0; all.forEach(o=>{ if (Math.abs(o.x-c.x) < 130 && Math.abs(o.y-c.y) < 130) n++; }); if (n > bn){ bn = n; best = c; } });
          const boost = st.blackHoleBoost ? 1 : 0;
          sfx.blackHole(); this.hole = { x:best.x, y:best.y, t:2500 + 800*boost, tick:0, R:220 + 60*boost };
          this.holeCd = Math.max(8000, 22000 - 3000*st.blackHole);
        } else this.holeCd = 1500;
      }
      if (this.hole){
        const h = this.hole;
        h.t -= delta; h.tick -= delta;
        const now = this.time.now;
        g.fillStyle(0x000000, 0.9); g.fillCircle(h.x, h.y, 16 + 4*Math.sin(now/90));
        g.lineStyle(3, 0x3a1a66, 0.85); g.strokeCircle(h.x, h.y, 28 + 6*Math.sin(now/130));
        g.lineStyle(1.5, 0x2a1048, 0.35); g.strokeCircle(h.x, h.y, h.R*0.5);
        const tickNow = h.tick <= 0; if (tickNow) h.tick = 250;
        this.enemies.children.iterate(v=>{
          if (!v || !v.active || v.enemyType === 'boss' || v.isBossPart || v.phased) return;
          const dx = h.x - v.x, dy = h.y - v.y, d = Math.hypot(dx, dy);
          if (d > h.R) return;
          v.x += dx*0.06; v.y += dy*0.06;
          if (v.baseX !== undefined) v.baseX += dx*0.06;
          if (tickNow && d < 70 && !v._doomed){
            this.applyDamageToEnemy(v, st.damage*0.5);
            if (v.hp <= 0){ v._doomed = true; this.time.delayedCall(40, ()=>{ if (v.active) this.killEnemy(v); }); }
          }
        });
        if (h.t <= 0) this.hole = null;
      }
    }

    // arcs de foudre et éclairs (ligne en zigzag qui scintille)
    for (let i=this._arcs.length-1;i>=0;i--){
      const a = this._arcs[i];
      a.t -= delta;
      if (a.t <= 0){ this._arcs.splice(i,1); continue; }
      const segs = a.bolt ? 8 : 3, amp = a.amp !== undefined ? a.amp : (a.bolt ? 14 : 6);
      const dx = a.x2 - a.x1, dy = a.y2 - a.y1, L = Math.hypot(dx,dy) || 1, nx = -dy/L, ny = dx/L;
      const alpha = Math.min(1, a.t/120);
      for (const pass of [[a.bolt?9:5, a.c1 || 0xffd84a, 0.4*alpha],[a.bolt?3:2, a.c2 || 0xffffff, alpha]]){
        g.lineStyle(pass[0], pass[1], pass[2]);
        g.beginPath(); g.moveTo(a.x1, a.y1);
        for (let k=1;k<segs;k++){ const f = k/segs, o = (Math.random()-0.5)*2*amp; g.lineTo(a.x1 + dx*f + nx*o, a.y1 + dy*f + ny*o); }
        g.lineTo(a.x2, a.y2); g.strokePath();
      }
    }
  },
});
