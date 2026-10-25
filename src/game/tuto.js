"use strict";
// Méthodes de GameScene — TUTO (1re partie / bouton DEV) : décollage, satellites à détruire, débris à esquiver, boss satellite.
mixin(GameScene, {
  /* ================= TUTO (bouton dans les PARAMETRES DEV et le menu DEV) =================
     Décollage depuis la Terre, petits satellites à exploser (leurs débris sont à ESQUIVER), boss satellite à ~1:15, puis retour au menu.
     Tout est géré ici: pas de spawn normal, pas d'XP, pas de classement, pas d'événements. Vaisseau de base (stats par défaut). */
  tutoPending(){          // le tuto est la 1re partie tant qu'il n'a pas été fini ET que la progression est vide (nouvelle install ou réinitialisation)
    try { if (localStorage.getItem('ssx_tuto_v1') === '1') return false; } catch(e){ return false; }
    const m = this.meta || getMeta(); return !(m.fragments > 0 || (m.asc || 0) > 0 || Object.keys(m.tree || {}).some(k=> m.tree[k] > 0));
  },
  tutoInit(){
    if (!this.textures.exists('tutoOrb')){ const c = this.textures.createCanvas('tutoOrb', 26, 26), g = c.context, gr = g.createRadialGradient(13,13,1,13,13,12); gr.addColorStop(0,'#ffffff'); gr.addColorStop(0.4,'#ffe0c0'); gr.addColorStop(0.75,'rgba(255,150,90,0.8)'); gr.addColorStop(1,'rgba(255,80,40,0)'); g.fillStyle = gr; g.fillRect(0,0,26,26); c.refresh(); }
    this.tutoSats = []; this.tutoT = 0; this.tutoSpawnCd = 700; this.tutoBoss = null; this.tutoDone = false; this.tutoPhase = 'sats'; this.tutoWarned = false; this._tutoH = {};
  },
  tutoHint(text, ms){
    let el = document.getElementById('tutoHint');
    if (!el){ el = document.createElement('div'); el.id = 'tutoHint'; el.style.cssText = 'position:fixed;top:17%;left:50%;transform:translateX(-50%);z-index:60;font:bold 13px monospace;color:#9ff;background:rgba(0,10,30,.75);padding:7px 13px;border:1px solid #4af;border-radius:6px;pointer-events:none;text-align:center;max-width:86vw;transition:opacity .4s;opacity:0;'; document.body.appendChild(el); }
    el.textContent = text; el.style.opacity = '1'; clearTimeout(el._t); el._t = setTimeout(()=>{ el.style.opacity = '0'; }, ms || 3500);
  },
  tutoSfx(name, x){ try { sfx.play(name, { pan: this.panOf(x) }); } catch(e){ /* ignore */ } },
  tutoSpawnSat(){
    const vx = this.visibleXRange(40), vy = this.visibleYRange(0);
    const sp = this.add.image(Phaser.Math.Between(vx.min, vx.max), vy.min - 70, 'tutoSat', 0).setDepth(4).setScale(0.7);
    const s = { sp, hp:30, max:30, vy:Phaser.Math.Between(60, 105), vx:Phaser.Math.Between(-22, 22), ph:Math.random()*6.28, x0:sp.x, t:0, dead:false };
    this.tutoSats.push(s);
  },
  tutoHitSat(s, dmg, x, y){
    if (s.dead) return;
    s.hp -= dmg; this.spawnHitParticles(x, y, 4); this.tutoSfx('tutoSatHit', s.sp.x);
    if (s.hp <= 0){ this.tutoKillSat(s, true); return; }
    const f = s.hp / s.max; s.sp.setFrame(f > 0.8 ? 0 : f > 0.62 ? 1 : f > 0.46 ? 2 : f > 0.32 ? 3 : f > 0.18 ? 4 : 5);
    s.sp.setTintFill(0xffffff); this.time.delayedCall(50, ()=>{ if (s.sp && s.sp.active) s.sp.clearTint(); });
  },
  tutoKillSat(s, byPlayer){
    if (s.dead) return; s.dead = true;
    const x = s.sp.x, y = s.sp.y, sc = s.sp.scaleX, rot = s.sp.rotation;
    s.sp.destroy();
    const fx = this.add.image(x, y, 'tutoSat', 6).setDepth(5).setScale(sc).setRotation(rot);
    let k = 6; this.time.addEvent({ delay:85, repeat:8, callback:()=>{ k++; if (fx.active){ if (k <= 14) fx.setFrame(k); if (k >= 13) fx.setAlpha(0.5); if (k >= 14) fx.destroy(); } } });
    this.explodeFx(x, y, 54); this.cameras.main.shake(100, 0.004); this.tutoSfx('tutoSatBoom', x);
    if (byPlayer){ this.score += 25; this.tutoKills = (this.tutoKills||0) + 1; }
    // débris: à esquiver (un en direction du joueur pour que ça s'apprenne)
    const n = Phaser.Math.Between(5, 8), pa = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
    for (let i=0;i<n;i++){
      const b = this.enemyBullets.create(x, y, 'tutoDebris', Phaser.Math.Between(0, TUTO_NDEB-1));
      b.setDepth(4).setScale(0.7); b.damage = 7;
      const r = Math.max(6, b.width*0.28); b.body.setCircle(r, b.width/2 - r, b.height/2 - r);
      const ang = (i === 0 && Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 320) ? pa + Phaser.Math.FloatBetween(-0.25, 0.25) : Math.random()*Math.PI*2;
      this.physics.velocityFromRotation(ang, Phaser.Math.Between(75, 150), b.body.velocity);
      b.setAngularVelocity(Phaser.Math.Between(-260, 260));
    }
    if (byPlayer && !this._tutoH.debris){ this._tutoH.debris = 1; this.tutoHint('ÉVITE LES DÉBRIS !', 3200); }
  },
  tutoHitBox(list, obj, hw, hh, fn, tag){
    list.children.iterate(b=>{
      if (!b || !b.active) return;
      if (Math.abs(b.x - obj.x) < hw && Math.abs(b.y - obj.y) < hh){
        if (b._tH === tag) return;
        const keep = (b.pierceLeft || 0) > 0;
        fn(b);
        if (keep){ b.pierceLeft--; b._tH = tag; } else if (b.active) b.destroy();
      }
    });
  },
  tutoUpdate(delta){
    if (this.tutoDone || !this.running) return;
    if (this.introActive){ return; }
    const dt = delta/1000; this.tutoT += dt;
    const vy = this.visibleYRange(0), px = this.player.x, py = this.player.y;
    if (!this._tutoH.move){ this._tutoH.move = 1; this.tutoHint('GLISSE LE DOIGT POUR TE DÉPLACER · LE TIR EST AUTOMATIQUE', 5000); }
    else if (!this._tutoH.sat && this.tutoT > 6){ this._tutoH.sat = 1; this.tutoHint('DÉTRUIS LES SATELLITES', 3500); }
    if (this.tutoPhase === 'sats'){
      if (this.tutoT >= TUTO_BOSS_WARN && !this.tutoWarned){
        this.tutoWarned = true; this.tutoSfx('tutoBossWarn', GAME_W/2);
        const bn = document.getElementById('boss-banner'); if (bn){ bn.classList.add('show'); setTimeout(()=> bn.classList.remove('show'), 2400); }
      }
      this.tutoSpawnCd -= delta;
      if (this.tutoSpawnCd <= 0 && this.tutoT < TUTO_SAT_END && this.tutoSats.length < 5 + Math.floor(this.tutoT/15)){
        this.tutoSpawnCd = Phaser.Math.Linear(1700, 700, Math.min(1, this.tutoT/45)) * Phaser.Math.FloatBetween(0.8, 1.2);
        this.tutoSpawnSat();
      }
      if (this.tutoT >= TUTO_BOSS_AT) this.tutoSpawnBoss();
    }
    // satellites
    this.tutoSats.forEach(s=>{
      if (s.dead) return;
      s.t += dt; const sp = s.sp;
      sp.y += s.vy*dt; sp.x = s.x0 + s.vx*s.t + Math.sin(s.t*0.9 + s.ph)*26; sp.rotation = Math.sin(s.t*0.6 + s.ph)*0.22;
      if (sp.y > vy.max + 80){ s.dead = true; sp.destroy(); return; }
      if (sp.y > vy.min + 12){
        this.tutoHitBox(this.playerBullets, sp, 44, 36, b=> this.tutoHitSat(s, b.damage || 10, b.x, b.y), s);
        this.tutoHitBox(this.missiles, sp, 48, 40, b=>{ this.explodeFx(b.x, b.y, 40); this.tutoHitSat(s, (b.damage || 20), b.x, b.y); }, s);
      }
      if (!s.dead && Math.abs(sp.x - px) < 34 && Math.abs(sp.y - py) < 30){ this.damagePlayer(10); this.tutoKillSat(s, false); }
    });
    this.tutoSats = this.tutoSats.filter(s=> !s.dead);
    if (this.tutoBoss) this.tutoBossUpdate(delta, dt);
  },
  tutoSpawnBoss(){
    this.tutoPhase = 'boss';
    const vy = this.visibleYRange(0), vx = this.visibleXRange(0);
    const sp = this.add.image(GAME_W/2, vy.min - 200, 'tutoBoss').setDepth(5);
    this.tutoBoss = { sp, hp:700, max:700, state:'enter', t:0, ty:vy.min + 175, cx:GAME_W/2, amp:Math.max(20, Math.min(80, (vx.max - vx.min)/2 - 150)), phase:1, aimCd:1800, ringCd:4200, rainCd:2600, spCd:0, spA:0, dead:false, hitT:0 };
    const wrap = document.getElementById('boss-hp-wrap'), lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = 'SATELLITE SPACEX'; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; } if (wrap) wrap.classList.add('show');
  },
  tutoBossShot(x, y, ang, spd, tint, dmg){
    const b = this.enemyBullets.create(x, y, 'tutoOrb'); b.setDepth(4); b.damage = dmg || 8; b.setTint(tint); b.setScale(0.75); b.body.setCircle(7, 6, 6); b.setBlendMode(Phaser.BlendModes.ADD);
    this.physics.velocityFromRotation(ang, spd, b.body.velocity); return b;
  },
  tutoBossUpdate(delta, dt){
    const B = this.tutoBoss; if (B.dead) return;
    B.t += dt; const sp = B.sp, px = this.player.x, py = this.player.y;
    if (B.state === 'enter'){ sp.y += 80*dt; if (sp.y >= B.ty){ sp.y = B.ty; B.state = 'fight'; B.t = 0; this.tutoHint('DÉTRUIS LE SATELLITE !', 3000); } }
    else {
      sp.x = B.cx + Math.sin(B.t*0.55)*B.amp; sp.y = B.ty + Math.sin(B.t*0.9)*10;
      const f = B.hp / B.max, ph = f > 0.66 ? 1 : f > 0.33 ? 2 : 3;
      if (ph !== B.phase){ B.phase = ph; this.cameras.main.flash(90, 255, 140, 60, false); this.cameras.main.shake(300, 0.01); this.tutoSfx('tutoBossPhase', sp.x);
        const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + ph;
        sp.setTint(ph === 2 ? 0xffd2b4 : 0xff9a9a); this.tutoHint(ph === 2 ? 'IL EST ENDOMMAGÉ !' : 'FUREUR !', 2200); }
      const bx = sp.x, by = sp.y + 40;
      B.aimCd -= delta; if (B.aimCd <= 0){ B.aimCd = ph === 3 ? 1100 : 1500; const a = Phaser.Math.Angle.Between(bx, by, px, py); [-0.2, 0, 0.2].forEach(o=> this.tutoBossShot(bx, by, a + o, 230, 0xff5050, 9)); this.tutoSfx('tutoBossAim', bx); }
      B.ringCd -= delta; if (B.ringCd <= 0){ B.ringCd = 4200; const n = 16, gap = Phaser.Math.Between(0, n-1); for (let i=0;i<n;i++){ if (i === gap || i === (gap+1)%n) continue; this.tutoBossShot(bx, by, i/n*6.2832, 135, 0xffa040, 8); } this.tutoSfx('tutoBossRing', bx); }
      if (ph >= 2){ B.rainCd -= delta; if (B.rainCd <= 0){ B.rainCd = 1700; [-115, 0, 115].forEach(o=> this.tutoBossShot(bx + o + Phaser.Math.Between(-20, 20), by - 10, Math.PI/2, 265, 0xff8040, 8)); this.tutoSfx('tutoBossRain', bx); } }
      if (ph >= 3){ B.spCd -= delta; if (B.spCd <= 0){ B.spCd = 140; B.spA += 0.36; this.tutoBossShot(bx, by, B.spA, 150, 0xff3060, 7); this.tutoBossShot(bx, by, B.spA + Math.PI, 150, 0xff3060, 7); this.tutoSfx('tutoBossSpiral', bx); } }
      // dégâts reçus
      const hit = (b, d)=>{ B.hp -= d; this.spawnHitParticles(b.x, b.y, 3); this.tutoSfx('tutoBossHit', b.x); if (B.hitT <= 0){ B.hitT = 60; sp.setTintFill(0xffffff); this.time.delayedCall(45, ()=>{ if (sp.active) sp.setTint(B.phase === 1 ? 0xffffff : B.phase === 2 ? 0xffd2b4 : 0xff9a9a); if (B.phase === 1) sp.clearTint(); }); } };
      B.hitT -= delta;
      this.tutoHitBox(this.playerBullets, { x:sp.x, y:sp.y }, 130, 118, b=> hit(b, b.damage || 10), B);
      this.tutoHitBox(this.missiles, { x:sp.x, y:sp.y }, 135, 122, b=>{ this.explodeFx(b.x, b.y, 50); hit(b, b.damage || 20); }, B);
      const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, B.hp / B.max * 100) + '%';
      if (Math.abs(px - sp.x) < 110 && Math.abs(py - sp.y) < 105) this.damagePlayer(15);
      if (B.hp <= 0) this.tutoBossDie();
    }
  },
  tutoBossDie(){
    const B = this.tutoBoss; if (B.dead) return; B.dead = true; this.tutoPhase = 'end';
    this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    const sp = B.sp, x = sp.x, y = sp.y; sp.setVisible(false);
    const ex = this.add.image(x, y, 'tutoBossX', 0).setDepth(6).setScale(2.2);
    this.cameras.main.shake(2100, 0.008); this.startSlowmo(1500, 0.5);
    [0, 1, 2, 3, 4].forEach(i=> this.time.delayedCall(i*430, ()=>{
      if (ex.active) ex.setFrame(i);
      for (let k=0;k<3;k++){ const ox = x + Phaser.Math.Between(-120, 120), oy = y + Phaser.Math.Between(-100, 100); this.explodeFx(ox, oy, 70); }
      this.tutoSfx(i < 3 ? 'tutoBossBoomA' : 'tutoBossBoomFinal', x + Phaser.Math.Between(-80, 80));
    }));
    this.time.delayedCall(2150, ()=>{
      this.cameras.main.flash(600, 255, 255, 255, false); this.tutoSfx('tutoBossBoomFinal', x);
      this.tweens.add({ targets:ex, alpha:0, duration:700, onComplete:()=> ex.destroy() });
      [0, 1].forEach(i=>{
        const p = this.add.image(x + (i ? 60 : -60), y, 'tutoPanel', i).setDepth(7).setScale(2.4);
        this.tweens.add({ targets:p, x:p.x + (i ? 230 : -230), y:p.y + Phaser.Math.Between(-60, 120), angle:(i ? 1 : -1)*Phaser.Math.Between(220, 420), alpha:0, duration:1600, ease:'Quad.easeOut', onComplete:()=> p.destroy() });
      });
      B.sp.destroy(); this.score += 500;
    });
    this.time.delayedCall(3400, ()=>{ this.tutoSfx('tutoDone', GAME_W/2); this.tutoHint('TUTO TERMINÉ — BIEN JOUÉ !', 2600); });
    this.time.delayedCall(6200, ()=>{ try { localStorage.setItem('ssx_tuto_v1', '1'); } catch(e){ /* ignore */ } this.tutoFinish(); });
  },
  tutoCleanup(){
    (this.tutoSats || []).forEach(s=>{ if (s.sp && s.sp.active) s.sp.destroy(); }); this.tutoSats = [];
    const h = document.getElementById('tutoHint'); if (h) h.remove();
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    const bn = document.getElementById('boss-banner'); if (bn) bn.classList.remove('show');
  },
  tutoFinish(){
    if (this._tutoFin) return; this._tutoFin = true; this.tutoDone = true; this.running = false; this.hasActiveRun = false;
    this.tutoCleanup(); music.stop();
    this.scene.restart({ toMenu:true });
  },
  tutoPlayerDied(){
    if (this.tutoDone) return; this.tutoDone = true; this.running = false; this.hasActiveRun = false;
    music.stop(); this.playerDeathFx(); this.tutoHint('RATÉ… ON RECOMMENCE', 2800);
    this.time.delayedCall(2800, ()=>{ this.tutoCleanup(); this.scene.restart({ autoStart:true, tuto:true }); });
  },
});
