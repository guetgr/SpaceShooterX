"use strict";
// Méthodes de GameScene — les différents événements : frappes, couloir, éclipse, EMP, glace, plasma, vortex magnétique.
mixin(GameScene, {
  // un impact annoncé: cercle rouge qui se resserre pendant 1 s, puis explosion (blesse si on est dedans)
  strikeAt(x, y, R, dmg){
    sfx.strikeWarn({ pan:this.panOf(x) });
    const ring = this.add.image(x, y, 'shockRing').setDepth(3).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3030).setAlpha(0.85).setScale(R*2.8/256);
    this.tweens.add({ targets: ring, scaleX: R*2/256, scaleY: R*2/256, alpha: 0.4, duration: 1000 });
    this.time.delayedCall(1000, ()=>{
      ring.destroy();
      this.explodeFx(x, y, R); sfx.strikeBoom({ pan:this.panOf(x) });
      if (this.player.active && Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) <= R) this.damagePlayer(dmg);
    });
  },

  // ---------------- COULOIR D'ASTEROIDES ----------------
  corrParams(){ const vx = this.visibleXRange(0), W = vx.max - vx.min; return { vx, mid:(vx.min+vx.max)/2, amp:W*0.17, w:Math.max(190, W*0.56 - 5*this.alertLevel) }; },

  corrCenter(t){ const c = this._corr; return c.mid + c.amp*(0.7*Math.sin(t*0.55 + c.ph) + 0.3*Math.sin(t*1.15 + c.ph*2)); },

  corrClampX(x, y){
    const c = this._corr; if (!c || !c.on) return x;
    const t = c.clock - (y - c.top)/c.speed, cx = this.corrCenter(t), half = c.w/2 - 22;
    return Phaser.Math.Clamp(x, cx - half, cx + half);
  },

  startCorridor(){
    const p = this.corrParams(), vy = this.visibleYRange(0);
    this._corr = { on:true, rocks:[], ph:Math.random()*6.28, speed:170, top:vy.min - 40, mid:p.mid, amp:p.amp, w:p.w, clock:this.elapsed, acc:0 };
  },

  tickCorridor(){
    const c = this._corr; if (!c || !c.on) return;
    const vx = this.visibleXRange(60), vy = this.visibleYRange(0); c.top = vy.min - 40;
    const cx = this.corrCenter(c.clock), tints = [0x7a6a60, 0x6a5a58, 0x8a7868, 0x5c5048];
    for (const side of [-1, 1]){
      let x = cx + side*(c.w/2 + 6), k = 0;
      while (x > vx.min - 60 && x < vx.max + 60 && k < 6){
        const img = this.add.image(x + Phaser.Math.Between(-8, 8), c.top - Phaser.Math.Between(0, 14), 'mtBig', Phaser.Math.Between(0, 4));
        img.setDepth(3.6).setTint(Phaser.Utils.Array.GetRandom(tints)).setAngle(Phaser.Math.Between(0, 359)).setScale(Phaser.Math.Between(60, 96) / img.frame.realWidth);
        c.rocks.push(img); x += side*Phaser.Math.Between(38, 52); k++;
      }
    }
  },

  endCorridor(){ if (this._corr) this._corr.on = false; },

  // ---------------- ECLIPSE SOLAIRE ----------------
  ensureFxTex(){
    if (this.textures.exists('eclMask')) return;
    let cv = this.textures.createCanvas('eclMask', 640, 640), g = cv.getContext(), gr = g.createRadialGradient(320,320,60,320,320,200);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0.97)');
    g.fillStyle = 'rgba(0,0,0,0.97)'; g.fillRect(0, 0, 640, 640); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath(); g.arc(320,320,320,0,6.29); g.fill();
    g.globalCompositeOperation = 'source-over'; g.fillStyle = gr; g.beginPath(); g.arc(320,320,320,0,6.29); g.fill(); cv.refresh();
    cv = this.textures.createCanvas('eclPx', 4, 4); cv.getContext().fillStyle = '#fff'; cv.getContext().fillRect(0,0,4,4); cv.refresh();
    cv = this.textures.createCanvas('plasmaBall', 128, 128); g = cv.getContext(); gr = g.createRadialGradient(64,64,4,64,64,64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,150,255,0.95)'); gr.addColorStop(0.6, 'rgba(180,60,255,0.55)'); gr.addColorStop(1, 'rgba(120,0,200,0)');
    g.fillStyle = gr; g.fillRect(0,0,128,128); cv.refresh();
  },

  startEclipse(){
    this.ensureFxTex();
    const mk = ()=> this.add.image(0, 0, 'eclPx').setOrigin(0, 0).setTint(0x000000).setAlpha(0.97).setDepth(9);
    const e = { mask:this.add.image(this.player.x, this.player.y, 'eclMask').setDepth(9), rects:[mk(), mk(), mk(), mk()], a:0 };
    e.mask.setAlpha(0); e.rects.forEach(r=> r.setAlpha(0));
    this.tweens.add({ targets:e, a:1, duration:1800 });
    this._ecl = e;
  },

  endEclipse(){
    const e = this._ecl; if (!e) return; this._ecl = null; const objs = [e.mask, ...e.rects];
    this.tweens.add({ targets:objs, alpha:0, duration:1200, onComplete:()=> objs.forEach(o=> o.destroy()) });
  },

  // ---------------- IMPULSION EMP ----------------
  throwEmp(){
    this.ensureFxTex();
    const vy = this.visibleYRange(0), vx = this.visibleXRange(40);
    const tx = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-60, 60), vx.min, vx.max), ty = Phaser.Math.Clamp(this.player.y - 170, vy.min + 120, vy.max - 200);
    const g = this.add.image(tx, vy.min - 20, 'bomb').setDepth(6).setTint(0x7fe6ff).setScale(1.6);
    const warn = this.add.image(tx, ty, 'shockRing').setDepth(5).setBlendMode(Phaser.BlendModes.ADD).setTint(0x7fe6ff).setAlpha(0.8).setScale(0.9);
    this.tweens.add({ targets:warn, scaleX:0.2, scaleY:0.2, duration:1300 });
    this.tweens.add({ targets:g, y:ty, angle:360, duration:1300, ease:'Quad.easeIn', onComplete:()=>{
      g.destroy(); warn.destroy(); this.empBlast(tx, ty);
    } });
    sfx.strikeWarn({ pan:this.panOf(tx) });
  },

  empBlast(x, y){
    if (!this.running) return;
    sfx.strikeBoom({ pan:this.panOf(x) }); this.cameras.main.flash(260, 120, 230, 255, false); this.cameras.main.shake(260, 0.01);
    const ring = this.add.image(x, y, 'shockRing').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0x7fe6ff).setAlpha(0.9).setScale(0.1);
    this.tweens.add({ targets:ring, scaleX:6, scaleY:6, alpha:0, duration:900, ease:'Quad.easeOut', onComplete:()=> ring.destroy() });
    this._empOn = true; this._empUntil = this.elapsed + 5.5; this._empShield = Math.max(this._empShield || 0, this.shield);
    this.shield = 0; if (this.odActive > 0){ this.odActive = 0; if (this.odShield > 0){ this.odShield = 0; this.spawnShieldBreak(true); } }
    if (!this._empVeil){ this._empVeil = this.add.image(0, 0, 'eclPx').setOrigin(0, 0).setTint(0x4fd0ff).setBlendMode(Phaser.BlendModes.ADD).setDepth(13).setAlpha(0.14); }
    this.notice('SYSTEMES COUPES', 'Tirs, boucliers et overdrive hors service');
  },

  // ---------------- FOUDRE STATIQUE ----------------
  staticStrike(){
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0), n = 3 + Math.floor(this.alertLevel/4), pts = [];
    pts.push({ x:Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-80, 80), vx.min+25, vx.max-25), y:Phaser.Math.Clamp(this.player.y + Phaser.Math.Between(-120, 40), vy.min+60, vy.max-40) });
    for (let i=1;i<n;i++) pts.push({ x:Phaser.Math.Between(vx.min+25, vx.max-25), y:Phaser.Math.Between(vy.min+80, vy.max-100) });
    pts.sort((a,b)=> a.x - b.x);
    const marks = pts.map(p=>{
      const ring = this.add.image(p.x, p.y, 'shockRing').setDepth(3).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe14a).setAlpha(0.9).setScale(0.55);
      this.tweens.add({ targets:ring, scaleX:0.22, scaleY:0.22, duration:1000 }); this.tweens.add({ targets:ring, alpha:0.35, duration:140, yoyo:true, repeat:6 });
      return [ring];
    });
    sfx.strikeWarn({ pan:this.panOf(pts[0].x) });
    this.time.delayedCall(1000, ()=>{
      marks.forEach(m=> m.forEach(o=> o.destroy()));
      if (!this.running) return;
      const gfx = this.add.graphics().setDepth(8).setBlendMode(Phaser.BlendModes.ADD);
      const R = 46, dmg = 9 + this.alertLevel; let hit = false;
      for (let i=0;i<pts.length;i++){
        const a = pts[i], b = pts[i+1];
        this.explodeFx(a.x, a.y, 34);
        if (Phaser.Math.Distance.Between(a.x, a.y, this.player.x, this.player.y) <= R) hit = true;
        if (!b) continue;
        const segs = 9; let px = a.x, py = a.y;
        for (let k=1;k<=segs;k++){
          const t = k/segs, nx = a.x + (b.x-a.x)*t + (k<segs ? Phaser.Math.Between(-16, 16) : 0), ny = a.y + (b.y-a.y)*t + (k<segs ? Phaser.Math.Between(-16, 16) : 0);
          gfx.lineStyle(5, 0xffe14a, 0.9).lineBetween(px, py, nx, ny); gfx.lineStyle(2, 0xffffff, 1).lineBetween(px, py, nx, ny);
          if (this.distToSeg(this.player.x, this.player.y, px, py, nx, ny) <= 20) hit = true;
          px = nx; py = ny;
        }
      }
      sfx.strikeBoom({ pan:this.panOf(pts[0].x) }); this.cameras.main.flash(90, 255, 240, 160, false);
      if (hit && this.player.active) this.damagePlayer(dmg);
      this.tweens.add({ targets:gfx, alpha:0, duration:300, onComplete:()=> gfx.destroy() });
    });
  },

  distToSeg(px, py, ax, ay, bx, by){
    const dx = bx-ax, dy = by-ay, l2 = dx*dx + dy*dy || 1, t = Phaser.Math.Clamp(((px-ax)*dx + (py-ay)*dy)/l2, 0, 1);
    return Math.hypot(px - (ax + t*dx), py - (ay + t*dy));
  },

  // ---------------- TEMPETE DE GLACE ----------------
  startIce(){
    this.ensureFxTex(); this._iceVx = 0;
    const veil = this.add.image(0, 0, 'eclPx').setOrigin(0, 0).setTint(0x66ccff).setBlendMode(Phaser.BlendModes.ADD).setDepth(13).setAlpha(0);
    this.tweens.add({ targets:veil, alpha:0.12, duration:900 });
    this._ice = { veil };
    this.player.setTint(0xbfeaff);
  },

  tickIce(){
    if (!this._ice) return;
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    for (let i=0;i<4;i++){
      const f = this.add.image(Phaser.Math.Between(vx.min, vx.max), vy.min - 6, 'eclPx').setTint(0xe6f8ff).setDepth(12.5).setAlpha(Phaser.Math.FloatBetween(0.5, 0.95)).setScale(Phaser.Math.FloatBetween(0.5, 1.1));
      this.tweens.add({ targets:f, y:vy.max + 10, x:f.x + Phaser.Math.Between(-60, 60), duration:Phaser.Math.Between(1400, 2400), onComplete:()=> f.destroy() });
    }
    this.enemies.children.iterate(e=>{ if (e && e.active && e.enemyType !== 'boss' && !e.isBossPart && !e._iceT && e.setTint){ e._iceT = true; e.setTint(0xa8e8ff); } });
  },

  endIce(){
    const ic = this._ice; this._ice = null; this._iceVx = 0;
    if (ic){ this.tweens.add({ targets:ic.veil, alpha:0, duration:700, onComplete:()=> ic.veil.destroy() }); }
    this.player.clearTint();
    this.enemies.children.iterate(e=>{ if (e && e.active && e._iceT){ e._iceT = false; e.clearTint(); } });
  },

  // ---------------- MUR DE BOUCLIERS (tanks façon Space Invaders) ----------------
  spawnShieldWall(){
    const vx = this.visibleXRange(30), vy = this.visibleYRange(0), cols = 7, rows = Math.max(1, Math.min(6, 1 + Math.floor((this.alertLevel - 4)/2)));      // plus l'alerte monte, plus il y a de lignes (alerte 4-5: 1, 6-7: 2, 8-9: 3...)
    const cell = (vx.max - vx.min - 20) / cols, gap = Phaser.Math.Between(1, cols - 2), tanks = [];
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){
      if (c === gap) continue;
      const x = vx.min + 10 + cell*(c + 0.5), e = this.spawnOneEnemy('tank', x);
      if (!e) continue;
      e.stopY = 1e6; e.body.setVelocity(0, 0); e.wallX = x; e.wallY = vy.min - 30 - r*58; e.y = e.wallY; e.fireCd = Phaser.Math.Between(1800, 3200); tanks.push(e);
    }
    let ofs = 0, dir = 1; const sp = 36 + 3*this.alertLevel, lim = cell*0.9;
    const loop = this.time.addEvent({ delay:33, loop:true, callback:()=>{
      const alive = tanks.filter(e=> e && e.active); if (!alive.length){ loop.remove(); return; }
      let drop = 0; ofs += dir*sp*0.033; if (Math.abs(ofs) > lim){ dir = -dir; ofs = Phaser.Math.Clamp(ofs, -lim, lim); drop = 24; }
      alive.forEach(e=>{ e.wallY += 15*0.033 + drop; e.x = e.wallX + ofs; e.y = e.wallY; if (e.body) e.body.setVelocity(0, 0); });
    } });
  },

  // ---------------- BOULE DE PLASMA ----------------
  spawnPlasma(){
    this.ensureFxTex(); this.killPlasma();
    const vx = this.visibleXRange(0), vy = this.visibleYRange(0), fromLeft = Math.random() < 0.5, H = vy.max - vy.min;
    const img = this.add.image(fromLeft ? vx.min - 90 : vx.max + 90, vy.min + H*0.22, 'plasmaBall').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setScale(1.5);
    const core = this.add.image(img.x, img.y, 'plasmaBall').setDepth(7.1).setBlendMode(Phaser.BlendModes.ADD).setScale(0.7);
    const p = { img, core, vx:(fromLeft ? 1 : -1) * ((vx.max - vx.min + 180) / 10.5), vy:(H*0.28)/10.5, shotCd:600, ang:0, age:0 };
    p.timer = this.time.addEvent({ delay:33, loop:true, callback:()=>{
      const dt = 0.033; p.age += dt; img.x += p.vx*dt; img.y += p.vy*dt; core.setPosition(img.x, img.y);
      const pulse = 1.5 + 0.08*Math.sin(p.age*9); img.setScale(pulse); core.setScale(0.7 + 0.06*Math.sin(p.age*13));
      p.shotCd -= 33;
      if (p.shotCd <= 0){
        p.shotCd = 520; p.ang += 0.37; const n = 10 + Math.floor(this.alertLevel/2);
        for (let i=0;i<n;i++){ const bl = this.bossShot(img.x, img.y, p.ang + i*Math.PI*2/n, 130 + this.alertLevel*4, { tex:'bossBullet2', tint:0xff60ff, scale:0.2, damage:5 + Math.floor(this.alertLevel/2) }); if (bl) bl._plasma = true; }
      }
      if (this.player.active && Math.hypot(img.x - this.player.x, img.y - this.player.y) < 54) this.damagePlayer(12 + this.alertLevel);
      // la boule broie aussi les ennemis sur son passage (35% de leurs PV max par seconde, 1,2% pour les boss)
      this.enemies.children.iterate(e=>{
        if (!e || !e.active || Math.hypot(img.x - e.x, img.y - e.y) > 74) return;
        const boss = e.enemyType === 'boss' || e.isBossPart || e.isBonus, mh = e.maxHp || 20;
        this.applyDamageToEnemy(e, mh*(boss ? 0.012 : 0.35)*dt + 0.3);
        if (e.active && e.hp <= 0) this.killEnemy(e);
      });
    } });
    this._plasma = p; sfx.eventStart('flip');
  },

  killPlasma(){ const p = this._plasma; if (!p) return; this._plasma = null; p.timer.remove(); [p.img, p.core].forEach(o=> this.tweens.add({ targets:o, alpha:0, duration:400, onComplete:()=> o.destroy() })); },

  // vortex d'aspiration sous le vaisseau pendant la tempête magnétique
  startMagVortex(){
    this.endMagVortex(); this.ensureFxTex();
    const sw = this.add.image(this.player.x, this.player.y, 'galaxySwirl').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0x4fd0ff).setAlpha(0).setScale(0.25);
    const rg = this.add.image(this.player.x, this.player.y, 'shockRing').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0x9fe8ff).setAlpha(0).setScale(1.3);
    this.tweens.add({ targets:sw, alpha:0.75, scaleX:0.62, scaleY:0.62, duration:700, ease:'Sine.easeOut' });
    this.tweens.add({ targets:sw, angle:-360, duration:2200, repeat:-1 });
    this.tweens.add({ targets:rg, scaleX:0.2, scaleY:0.2, alpha:{ from:0, to:0.8 }, duration:900, repeat:-1, ease:'Quad.easeIn' });
    this._magV = { sw, rg };
  },

  endMagVortex(){
    const v = this._magV; if (!v) return; this._magV = null;
    [v.sw, v.rg].forEach(o=>{ this.tweens.killTweensOf(o); this.tweens.add({ targets:o, alpha:0, duration:500, onComplete:()=> o.destroy() }); });
  },

  // mise à jour par image des effets spéciaux (couloir, éclipse, EMP, glace)
  updateSpecials(delta){
    const dt = delta/1000, vx = this.visibleXRange(0), vy = this.visibleYRange(0);
    const c = this._corr;
    if (c){
      // l'overdrive fait défiler le couloir plus vite (même facteur que le reste du décor): rochers, forme du passage et rangées suivent ensemble
      const ob = Math.max(0, ((this._bgBoost || 1) - 1)/6), m = 1 + ob*240/c.speed;
      c.clock += dt*m;
      for (let i=c.rocks.length-1;i>=0;i--){ const r = c.rocks[i]; r.y += c.speed*m*dt; if (r.y > vy.max + 90){ r.destroy(); c.rocks.splice(i, 1); } }
      if (c.on){ c.acc += c.speed*m*dt; let guard = 0; while (c.acc >= 34 && guard++ < 6){ c.acc -= 34; this.tickCorridor(); } }       // une rangée tous les 34 px parcourus (pas de trous quand ça accélère)
      if (c.on && this.player.active && !this.introActive){
        const px0 = this.player.x; this.player.x = this.corrClampX(px0, this.player.y);
        c.hurtCd = (c.hurtCd || 0) - delta;
        if (Math.abs(px0 - this.player.x) > 1.5 && c.hurtCd <= 0){                    // collé contre la paroi: elle blesse (les compétences de blindage réduisent)
          c.hurtCd = 450; this.damagePlayer(3 * COLLISION_DMG_MUL * (this.stats.collisionMul || 1));
          this.spawnHitParticles(this.player.x + (px0 > this.player.x ? 14 : -14), this.player.y, 3); sfx.hit && sfx.hit();
        }
        // paroi: position du bord par rapport à (x,y), côté, et pente (la paroi est courbe, donc le rebond dépend de son inclinaison)
        const wallAt = (x, y, margin)=>{
          const t = c.clock - (y - c.top)/c.speed, cx = this.corrCenter(t), d = x - cx, half = c.w/2 - margin;
          if (Math.abs(d) <= half) return null;
          const t2 = c.clock - (y + 4 - c.top)/c.speed, t1 = c.clock - (y - 4 - c.top)/c.speed;
          return { sd:Math.sign(d), cx, half, slope:(this.corrCenter(t2) - this.corrCenter(t1))/8 };
        };
        // réflexion physique sur la paroi mobile: normale vers l'intérieur du couloir, vitesse relative à la paroi (qui descend à speed*m)
        const reflect = (vel, w)=>{
          let nx = -w.sd, ny = w.sd*w.slope; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          const wy = c.speed*m, rvx = vel.x, rvy = vel.y - wy, dot = rvx*nx + rvy*ny;
          if (dot >= 0) return false;                                                // déjà en train de s'éloigner de la paroi
          vel.x = rvx - 2*dot*nx; vel.y = rvy - 2*dot*ny + wy; return true;
        };
        const spark = (x, y)=>{ if (!c._sparkT || this.time.now - c._sparkT > 40){ c._sparkT = this.time.now; this.spawnHitParticles(x, y, 1); } };
        this.enemyBullets.children.iterate(b=>{
          if (!b || !b.active || !b.body) return; const w = wallAt(b.x, b.y, 6); if (!w) return;
          b._wb = (b._wb || 0) + 1;
          if (b._wb > 2){ spark(b.x, b.y); b.destroy(); return; }                    // après deux rebonds le tir se brise
          const ok = reflect(b.body.velocity, w);
          b.x = w.cx + w.sd*(w.half - 3);
          if (ok){ b.rotation = Math.atan2(b.body.velocity.y, b.body.velocity.x) + Math.PI/2; spark(b.x, b.y); }
        });
        this.playerBullets.children.iterate(b=>{
          if (!b || !b.active || !b.body) return; const w = wallAt(b.x, b.y, 6); if (!w) return;
          if (b._bn === undefined) b._bn = this.stats.bounce || 0;
          if (b._bn > 0 && (this._bouncedCount||0) < 30){
            const ok = reflect(b.body.velocity, w);
            b.x = w.cx + w.sd*(w.half - 3);
            if (ok){ b._bn--; b._bounced = true; b._bt = 1100; sfx.bounce(); b.setAlpha(0.5).setTint(0x9fe8ff); b.rotation = Math.atan2(b.body.velocity.y, b.body.velocity.x) + Math.PI/2; spark(b.x, b.y); }
          } else { spark(b.x, b.y); b.destroy(); }
        });
        // les ennemis ne traversent plus les parois: ils rebondissent dessus (vitesse latérale inversée, centre d'oscillation ramené dedans)
        this.enemies.children.iterate(e=>{
          if (!e || !e.active || e.bossId || e.isBossPart || e.wallX !== undefined || e._arriving) return;
          const w = wallAt(e.x, e.y, 14 + e.displayWidth*0.35); if (!w) return;
          const nx = w.cx + w.sd*w.half, dx = nx - e.x;
          e.x = nx; if (e.baseX !== undefined) e.baseX += dx;
          if (e.body && e.body.velocity.x*w.sd > 0) e.body.velocity.x = -e.body.velocity.x*0.9;
          if (e._sineDir !== undefined) e._sineDir = -w.sd;
          if (!e._wbT || this.time.now - e._wbT > 350){ e._wbT = this.time.now; spark(e.x + w.sd*e.displayWidth*0.3, e.y); }
        });
      }
      if (!c.on && !c.rocks.length) this._corr = null;
    }
    if (this.stats.laserLockBonus > 0){
      this.playerBullets.children.iterate(b=>{
        if (!b || !b.active || !b.lockTgt) return; const t = b.lockTgt;
        if (!t.active){ b.lockTgt = null; return; }
        const cur = Math.atan2(b.body.velocity.y, b.body.velocity.x), want = Phaser.Math.Angle.Between(b.x, b.y, t.x, t.y);
        const na = cur + Phaser.Math.Clamp(Phaser.Math.Angle.Wrap(want - cur), -b.lockTurn*dt, b.lockTurn*dt);
        this.physics.velocityFromRotation(na, b.lockSpd, b.body.velocity); b.rotation = na + Math.PI/2;
      });
    }
    if (this._magV){ this._magV.sw.setPosition(this.player.x, this.player.y + 4); this._magV.rg.setPosition(this.player.x, this.player.y + 4); }
    const e = this._ecl;
    if (e){
      const px = this.player.x, py = this.player.y, H = 320, L = vx.min - 400, R = vx.max + 400, T = vy.min - 400, B = vy.max + 400, a = 0.97*e.a;
      e.mask.setPosition(px, py).setAlpha(e.a);
      const [t, b, l, r] = e.rects; t.setPosition(L, T).setDisplaySize(R-L, Math.max(1, py-H-T)); b.setPosition(L, py+H).setDisplaySize(R-L, Math.max(1, B-(py+H)));
      l.setPosition(L, py-H).setDisplaySize(Math.max(1, px-H-L), H*2); r.setPosition(px+H, py-H).setDisplaySize(Math.max(1, R-(px+H)), H*2);
      e.rects.forEach(o=> o.setAlpha(a));
      this.enemyBullets.children.iterate(o=>{ if (o && o.active) o.setDepth(12); });
      this.playerBullets.children.iterate(o=>{ if (o && o.active) o.setDepth(12); });
      this.missiles.children.iterate(o=>{ if (o && o.active) o.setDepth(12); });
      this.gems.children.iterate(o=>{ if (o && o.active) o.setDepth(12); });
      this.heals.children.iterate(o=>{ if (o && o.active) o.setDepth(12); });
      this.enemies.children.iterate(o=>{ if (!o || !o.active) return; const boss = o.enemyType === 'boss' || o.isBossPart || o.isBonus; if (o._lit > 0) o._lit -= delta; o.setDepth(boss || o._lit > 0 ? 12 : 4); });
    }
    if (this._empOn){
      this.shield = 0; this.shieldRegenDelay = Math.max(this.shieldRegenDelay, 400);
      if (Math.random() < 0.25) this.spawnHitParticles(this.player.x + Phaser.Math.Between(-14, 14), this.player.y + Phaser.Math.Between(-14, 14), 1);
      if (this._empVeil){ this._empVeil.setPosition(vx.min - 50, vy.min - 50).setDisplaySize(vx.max - vx.min + 100, vy.max - vy.min + 100).setAlpha(0.08 + 0.08*Math.random()); }
      if (this.elapsed >= this._empUntil){
        this._empOn = false; this.shield = Math.min(this.stats.shieldMax, Math.max(this.shield, this._empShield || 0)); this._empShield = 0;
        if (this._empVeil){ this._empVeil.destroy(); this._empVeil = null; }
        this.cameras.main.flash(160, 120, 230, 255, false); this.notice('SYSTEMES RETABLIS', '');
      }
    }
    if (this._ice){
      if (this._ice.veil) this._ice.veil.setPosition(vx.min - 50, vy.min - 50).setDisplaySize(vx.max - vx.min + 100, vy.max - vy.min + 100);
      this.enemies.children.iterate(o=>{
        if (!o || !o.active || o.enemyType === 'boss' || o.isBossPart) return;
        o._ivx = ((o._ivx || 0) + Phaser.Math.FloatBetween(-1, 1)*220*dt*this.coordResist(o)) * (1 - 0.6*dt);
        const nx = Phaser.Math.Clamp(o.x + o._ivx*dt, vx.min + 10, vx.max - 10), d = nx - o.x; o.x = nx; if (o.baseX !== undefined) o.baseX += d;
      });
    }
  },
});
