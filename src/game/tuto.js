"use strict";
// Méthodes de GameScene — TUTO (niveau 1 du monde 1, `w1-tuto`, / bouton DEV) : 5 étapes pédagogiques (bouger, tirer, esquiver, enchaîner, boss), satellites + débris, boss satellite.
// La FINITION (%) du niveau (objectifs pondérés, meilleur de chaque objectif gardé) est définie dans data/completion.js ; ici on la mesure, on l'affiche en direct et on montre le bilan.
const TUTO_ID = 'w1-tuto';
const TUTO_STEPS = [
  { id:'move',  title:'DÉPLACE-TOI',           text:()=> 'GLISSE LE DOIGT POUR BOUGER (OU LES FLÈCHES) · LE TIR EST AUTOMATIQUE', max:()=> TUTO_TUNE.steps.maxMove },
  { id:'shoot', title:'DÉTRUIS UN SATELLITE',  text:()=> 'PLACE-TOI SOUS LE SATELLITE : TU TIRES TOUT SEUL', max:()=> TUTO_TUNE.steps.maxShoot },
  { id:'dodge', title:'ESQUIVE LES DÉBRIS',    text:()=> 'DÉTRUIS-EN ' + TUTO_TUNE.steps.dodgeKills + ' DE PLUS · LEURS DÉBRIS TE VISENT : BOUGE !', max:()=> TUTO_TUNE.steps.maxDodge },
  { id:'wave',  title:'ENCHAÎNE LES VAGUES',   text:()=> 'ILS ARRIVENT DE PLUS EN PLUS VITE', max:()=> TUTO_TUNE.steps.maxWave },
  { id:'boss',  title:'VAINCS LE BOSS',        text:()=> 'LE SATELLITE SPACEX ARRIVE', max:()=> 1e9 },
];
mixin(GameScene, {
  /* ================= TUTO (bouton dans les PARAMETRES DEV et le menu DEV) =================
     Étapes: bouger → détruire un satellite → esquiver ses débris → vagues → boss satellite (3 phases), puis bilan de finition.
     Tout est géré ici: pas de spawn normal, pas d'XP, pas de classement, pas d'événements. Vaisseau de base (stats par défaut). */
  tutoInit(){
    if (!this.textures.exists('tutoOrb')){ const c = this.textures.createCanvas('tutoOrb', 26, 26), g = c.context, gr = g.createRadialGradient(13,13,1,13,13,12); gr.addColorStop(0,'#ffffff'); gr.addColorStop(0.4,'#ffe0c0'); gr.addColorStop(0.75,'rgba(255,150,90,0.8)'); gr.addColorStop(1,'rgba(255,80,40,0)'); g.fillStyle = gr; g.fillRect(0,0,26,26); c.refresh(); }
    this.tutoSats = []; this.tutoStepLog = []; this.tutoT = 0; this.tutoSpawnCd = 600; this.tutoBoss = null; this.tutoDone = false; this.tutoPhase = 'sats'; this.tutoWarned = false; this._tutoH = {}; this._tutoFin = false;
    this.tutoStep = 0; this.tutoStepT = 0; this.tutoKills = 0; this.tutoHits = 0; this.tutoMoved = 0; this.tutoLast = null; this.tutoBossWait = 0;
    this.tutoBest = completionPct(TUTO_ID); this.tutoPctShown = -1; this.tutoRecordBeaten = false; this._tutoRec = null;
    this.tutoUiInit(); this.tutoStepEnter(true);
  },
  tutoHint(text, ms){
    let el = document.getElementById('tutoHint');
    if (!el){ el = document.createElement('div'); el.id = 'tutoHint'; el.style.cssText = 'position:fixed;top:19%;left:50%;transform:translateX(-50%);z-index:60;font:bold 13px monospace;color:#9ff;background:rgba(0,10,30,.75);padding:7px 13px;border:1px solid #4af;border-radius:6px;pointer-events:none;text-align:center;max-width:86vw;transition:opacity .4s;opacity:0;'; document.body.appendChild(el); }
    el.textContent = text; el.style.opacity = '1'; clearTimeout(el._t); el._t = setTimeout(()=>{ el.style.opacity = '0'; }, ms || 3500);
  },
  tutoSfx(name, x){ try { sfx.play(name, { pan: this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- ÉTAPES PÉDAGOGIQUES ---------- */
  tutoUiInit(){
    this.tutoUiClear();
    const host = document.getElementById('boss-hp-wrap').parentNode;
    const g = document.createElement('div'); g.id = 'tutoGuide';
    g.innerHTML = '<div class="tg-top"><b class="tg-n"></b><span class="tg-t"></span></div><div class="tg-bar"><i></i></div>';
    host.appendChild(g);
    const p = document.createElement('div'); p.id = 'tutoPct';
    p.innerHTML = '<div class="tp-row"><span class="tp-lab">FINITION</span><b class="tp-n">0%</b><span class="tp-rec"></span></div><div class="tp-bar"><i class="tp-fill"></i><u class="tp-best"></u><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>';
    host.appendChild(p);
  },
  tutoUiClear(){ ['tutoGuide', 'tutoPct', 'tutoEnd'].forEach(id=>{ const e = document.getElementById(id); if (e) e.remove(); }); },
  tutoStepEnter(first){
    const S = TUTO_STEPS[this.tutoStep], g = document.getElementById('tutoGuide'); this.tutoStepT = 0;
    if (g){
      g.querySelector('.tg-n').textContent = 'ÉTAPE ' + (this.tutoStep + 1) + '/' + TUTO_STEPS.length; g.querySelector('.tg-t').textContent = S.title;
      g.classList.remove('done'); g.classList.remove('pop'); void g.offsetWidth; g.classList.add('pop');
    }
    this.tutoStepLog.push({ id:S.id, at:Math.round(this.tutoT*10)/10 });
    this.tutoHint(S.text(), S.id === 'move' ? 5500 : 4200);
    if (!first) this.tutoSfx('tutoDone', GAME_W/2);
    if (S.id === 'wave') this.tutoSpawnCd = 400;
    if (S.id === 'boss'){ this.tutoPhase = 'bosswarn'; this.tutoBossWait = TUTO_TUNE.steps.bossWait * 1000; this.tutoWarned = true; this.tutoSfx('tutoBossWarn', GAME_W/2); const bn = document.getElementById('boss-banner'); if (bn){ bn.classList.add('show'); setTimeout(()=> bn.classList.remove('show'), 2400); } }
  },
  tutoStepProgress(){            // 0..1 de l'étape en cours
    const id = TUTO_STEPS[this.tutoStep].id, k = this.tutoKills, T = TUTO_TUNE.steps, dk = Math.max(1, T.dodgeKills);
    if (id === 'move') return Math.min(1, this.tutoMoved / Math.max(1, T.moveNeed));
    if (id === 'shoot') return Math.min(1, k / 1);
    if (id === 'dodge') return Math.min(1, Math.max(0, (k - 1) / dk));
    if (id === 'wave') return Math.min(1, Math.max(0, (k - 1 - dk) / Math.max(1, T.satTarget - 1 - dk)));
    const B = this.tutoBoss; return B ? Math.max(0, Math.min(1, 1 - B.hp / B.max)) : 0;
  },
  tutoStepCheck(){
    const S = TUTO_STEPS[this.tutoStep]; if (S.id === 'boss') return;
    if (this.tutoStepProgress() >= 1 || this.tutoStepT > S.max()){       // plafond de temps: on n'enferme jamais le joueur dans une étape
      const g = document.getElementById('tutoGuide'); if (g) g.classList.add('done');
      this.tutoStep++; this.tutoStepEnter(false);
    }
  },
  tutoComp(){        // valeurs 0..1 de chaque objectif de finition pour la partie en cours (voir LEVEL_COMPLETION)
    const B = this.tutoBoss, won = !!(B && B.dead);
    return { sats: Math.min(1, this.tutoKills / Math.max(1, TUTO_TUNE.steps.satTarget)), boss: B ? Math.max(0, Math.min(1, 1 - B.hp / B.max)) : 0, win: won ? 1 : 0, clean: won ? Math.max(0, 1 - this.tutoHits * TUTO_TUNE.comp.hitPenalty) : 0 };
  },
  tutoUiUpdate(){
    const g = document.getElementById('tutoGuide'), p = document.getElementById('tutoPct'); if (!g || !p) return;
    g.querySelector('.tg-bar > i').style.width = Math.round(this.tutoStepProgress() * 100) + '%';
    const pct = completionPct(TUTO_ID, this.tutoComp());
    if (pct === this.tutoPctShown) return;
    const prev = this.tutoPctShown; this.tutoPctShown = pct;
    p.querySelector('.tp-n').textContent = pct + '%'; p.querySelector('.tp-fill').style.width = pct + '%';
    p.querySelector('.tp-best').style.left = this.tutoBest + '%'; p.querySelector('.tp-best').style.display = this.tutoBest > 0 ? 'block' : 'none';
    if (prev < 0) { p.querySelector('.tp-rec').textContent = this.tutoBest > 0 ? 'RECORD ' + this.tutoBest + '%' : ''; return; }
    p.classList.remove('tick'); void p.offsetWidth; p.classList.add('tick');
    if (!this.tutoRecordBeaten && this.tutoBest > 0 && pct > this.tutoBest){ this.tutoRecordBeaten = true; p.classList.add('rec'); p.querySelector('.tp-rec').textContent = 'NOUVEAU RECORD !'; this.tutoSfx('tutoBossPhase', GAME_W/2); }
    const st = COMPLETION_STEPS.find(s=> prev < s && pct >= s);
    if (st){ p.classList.remove('mile'); void p.offsetWidth; p.classList.add('mile'); this.tutoHint(st === 100 ? '★ FINITION 100% ★' : 'PALIER ' + st + '% !', 1800); this.tutoSfx('tutoDone', GAME_W/2); }
  },

  /* ---------- SATELLITES ---------- */
  tutoSpawnSat(slow){
    const vx = this.visibleXRange(40), vy = this.visibleYRange(0);
    const sp = this.add.image(Phaser.Math.Between(vx.min, vx.max), vy.min - 70, 'tutoSat', 0).setDepth(4).setScale(0.7);
    const T = TUTO_TUNE.sats, s = { sp, hp:T.hp, max:T.hp, vy: slow ? T.slowSpeed : Phaser.Math.Between(T.speedMin, T.speedMax), vx: slow ? 0 : Phaser.Math.Between(-T.drift, T.drift), ph:Math.random()*6.28, x0:sp.x, t:0, dead:false };
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
    if (byPlayer){ this.score += TUTO_TUNE.sats.score; this.tutoKills++; }
    // débris: à esquiver (un en direction du joueur pour que ça s'apprenne)
    const D = TUTO_TUNE.debris, n = Phaser.Math.Between(D.min, D.max), pa = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y);
    for (let i=0;i<n;i++){
      const b = this.enemyBullets.create(x, y, 'tutoDebris', Phaser.Math.Between(0, TUTO_NDEB-1));
      b.setDepth(4).setScale(0.7); b.damage = D.dmg;
      const r = Math.max(6, b.width*0.28); b.body.setCircle(r, b.width/2 - r, b.height/2 - r);
      const ang = (i === 0 && Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 320) ? pa + Phaser.Math.FloatBetween(-0.25, 0.25) : Math.random()*Math.PI*2;
      this.physics.velocityFromRotation(ang, Phaser.Math.Between(D.speedMin, D.speedMax), b.body.velocity);
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
  tutoSpawnLogic(delta){          // le rythme des satellites dépend de l'étape (aucun à l'étape 1, un seul et lent à l'étape 2, etc.)
    const id = TUTO_STEPS[this.tutoStep].id, alive = this.tutoSats.length;
    if (id !== 'shoot' && id !== 'dodge' && id !== 'wave') return;
    this.tutoSpawnCd -= delta; if (this.tutoSpawnCd > 0) return;
    if (id === 'shoot'){ if (alive < 1){ this.tutoSpawnCd = 900; this.tutoSpawnSat(true); } return; }
    if (id === 'dodge'){ if (alive < 2){ this.tutoSpawnCd = 1300; this.tutoSpawnSat(false); } return; }
    const T = TUTO_TUNE.sats;
    if (alive < T.capBase + Math.min(T.capExtra, Math.floor(this.tutoStepT / Math.max(1, T.capEvery)))){ this.tutoSpawnCd = Phaser.Math.Linear(T.spawnCdStart, T.spawnCdEnd, Math.min(1, this.tutoStepT / Math.max(1, T.rampTime))) * Phaser.Math.FloatBetween(0.8, 1.2); this.tutoSpawnSat(false); }
  },
  tutoUpdate(delta){
    if (this.tutoDone || !this.running) return;
    if (this.introActive){ return; }
    const dt = delta/1000; this.tutoT += dt; this.tutoStepT += dt;
    const vy = this.visibleYRange(0), px = this.player.x, py = this.player.y;
    if (this.tutoLast) this.tutoMoved += Math.hypot(px - this.tutoLast.x, py - this.tutoLast.y);
    this.tutoLast = { x:px, y:py };
    this.tutoStepCheck();
    if (this.tutoPhase === 'sats') this.tutoSpawnLogic(delta);
    else if (this.tutoPhase === 'bosswarn'){ this.tutoBossWait -= delta; if (this.tutoBossWait <= 0) this.tutoSpawnBoss(); }
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
      if (!s.dead && Math.abs(sp.x - px) < 34 && Math.abs(sp.y - py) < 30){ this.damagePlayer(TUTO_TUNE.sats.contactDmg); this.tutoKillSat(s, false); }
    });
    this.tutoSats = this.tutoSats.filter(s=> !s.dead);
    if (this.tutoBoss) this.tutoBossUpdate(delta, dt);
    this.tutoUiUpdate();
  },

  /* ---------- BOSS ---------- */
  tutoSpawnBoss(){
    this.tutoPhase = 'boss';
    const vy = this.visibleYRange(0), vx = this.visibleXRange(0);
    const sp = this.add.image(GAME_W/2, vy.min - 200, 'tutoBoss').setDepth(5);
    this.tutoBoss = { sp, hp:TUTO_TUNE.boss.hp, max:TUTO_TUNE.boss.hp, state:'enter', t:0, ty:vy.min + 175, cx:GAME_W/2, amp:Math.max(20, Math.min(80, (vx.max - vx.min)/2 - 150)), phase:1, aimCd:1800, ringCd:TUTO_TUNE.boss.ringCd, rainCd:2600, spCd:0, spA:0, dead:false, hitT:0 };
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
      const BT = TUTO_TUNE.boss, f = B.hp / B.max, ph = f > BT.p2 ? 1 : f > BT.p3 ? 2 : 3;
      if (ph !== B.phase){ B.phase = ph; this.cameras.main.flash(90, 255, 140, 60, false); this.cameras.main.shake(300, 0.01); this.tutoSfx('tutoBossPhase', sp.x);
        const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + ph;
        sp.setTint(ph === 2 ? 0xffd2b4 : 0xff9a9a); this.tutoHint(ph === 2 ? 'IL EST ENDOMMAGÉ !' : 'FUREUR !', 2200); }
      const bx = sp.x, by = sp.y + 40;
      B.aimCd -= delta; if (B.aimCd <= 0){ B.aimCd = ph === 3 ? BT.aimCd3 : BT.aimCd; const a = Phaser.Math.Angle.Between(bx, by, px, py); [-0.2, 0, 0.2].forEach(o=> this.tutoBossShot(bx, by, a + o, BT.aimSpeed, 0xff5050, BT.aimDmg)); this.tutoSfx('tutoBossAim', bx);
        if (!this._tutoH.aim){ this._tutoH.aim = 1; this.tutoHint('TIRS VISÉS : NE RESTE PAS EN PLACE !', 2800); } }
      B.ringCd -= delta; if (B.ringCd <= 0){ B.ringCd = BT.ringCd; const n = Math.max(3, Math.round(BT.ringCount)), gap = Phaser.Math.Between(0, n-1), gw = Math.round(BT.ringGap); for (let i=0;i<n;i++){ if (((i - gap + n) % n) < gw) continue; this.tutoBossShot(bx, by, i/n*6.2832, BT.ringSpeed, 0xffa040, BT.ringDmg); } this.tutoSfx('tutoBossRing', bx);
        if (!this._tutoH.ring){ this._tutoH.ring = 1; this.tutoHint('FAUFILE-TOI DANS LA BRÈCHE DE L\'ANNEAU !', 3000); } }
      if (ph >= 2){ B.rainCd -= delta; if (B.rainCd <= 0){ B.rainCd = BT.rainCd; [-115, 0, 115].forEach(o=> this.tutoBossShot(bx + o + Phaser.Math.Between(-20, 20), by - 10, Math.PI/2, BT.rainSpeed, 0xff8040, BT.rainDmg)); this.tutoSfx('tutoBossRain', bx); } }
      if (ph >= 3){ B.spCd -= delta; if (B.spCd <= 0){ B.spCd = BT.spiralCd; B.spA += 0.36; this.tutoBossShot(bx, by, B.spA, BT.spiralSpeed, 0xff3060, BT.spiralDmg); this.tutoBossShot(bx, by, B.spA + Math.PI, BT.spiralSpeed, 0xff3060, BT.spiralDmg); this.tutoSfx('tutoBossSpiral', bx); } }
      // dégâts reçus
      const hit = (b, d)=>{ B.hp -= d; this.spawnHitParticles(b.x, b.y, 3); this.tutoSfx('tutoBossHit', b.x); if (B.hitT <= 0){ B.hitT = 60; sp.setTintFill(0xffffff); this.time.delayedCall(45, ()=>{ if (sp.active) sp.setTint(B.phase === 1 ? 0xffffff : B.phase === 2 ? 0xffd2b4 : 0xff9a9a); if (B.phase === 1) sp.clearTint(); }); } };
      B.hitT -= delta;
      this.tutoHitBox(this.playerBullets, { x:sp.x, y:sp.y }, 130, 118, b=> hit(b, b.damage || 10), B);
      this.tutoHitBox(this.missiles, { x:sp.x, y:sp.y }, 135, 122, b=>{ this.explodeFx(b.x, b.y, 50); hit(b, b.damage || 20); }, B);
      const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, B.hp / B.max * 100) + '%';
      if (Math.abs(px - sp.x) < 110 && Math.abs(py - sp.y) < 105) this.damagePlayer(BT.contactDmg);
      if (B.hp <= 0) this.tutoBossDie();
    }
  },
  tutoBossDie(){
    const B = this.tutoBoss; if (B.dead) return; B.dead = true; this.tutoPhase = 'end'; this.tutoDone = true;
    this.tutoUiUpdate();
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
      B.sp.destroy(); this.score += TUTO_TUNE.boss.killScore;
    });
    this.time.delayedCall(3400, ()=>{ this.tutoSfx('tutoDone', GAME_W/2); try { localStorage.setItem('ssx_tuto_v1', '1'); } catch(e){ /* ignore */ } this.tutoReward(); this.tutoShowEnd(true); });
  },

  /* ---------- BILAN / FINITION ---------- */
  tutoReward(){        // le tuto est un niveau du monde 1 : victoire enregistrée (ouvre le niveau suivant) + récompense de la 1re victoire
    const d = levelById(TUTO_ID), rec = recordLevelClear(TUTO_ID, this.score);
    if (rec && rec.first){ const m = getMeta(); m.fragments += d.reward.clear + (d.reward.first || 0); setMeta(m); }
  },
  tutoBank(){          // enregistre la finition de CETTE partie (victoire, défaite ou abandon) — une seule fois
    if (!this._tutoRec) this._tutoRec = recordCompletion(TUTO_ID, this.tutoComp());
    return this._tutoRec;
  },
  tutoShowEnd(victory){
    const rec = this.tutoBank(); if (!rec) return;
    const host = document.getElementById('gameover').parentNode, d = rec.after - rec.before, full = rec.after >= 100;
    const el = document.createElement('div'); el.id = 'tutoEnd'; el.className = 'overlay fadein' + (victory ? ' win' : '');
    const nx = completionNext(TUTO_ID);
    const rows = rec.rows.map((r, i)=>{
      const pc = Math.round(r.best * r.w), gain = Math.round((r.best - r.prev) * r.w), ok = r.best >= 0.999;
      return '<div class="te-row' + (ok ? ' ok' : '') + '" style="animation-delay:' + (0.5 + i*0.18) + 's"><span class="te-l">' + (ok ? '✔ ' : '') + r.label + '</span><span class="te-v">' + pc + '/' + r.w + (gain > 0 ? ' <em>+' + gain + '</em>' : '') + '</span><div class="te-b"><i style="width:' + Math.round(r.best*100) + '%"></i></div></div>';
    }).join('');
    el.innerHTML = '<div class="go-title">' + (victory ? 'TUTO TERMINÉ' : 'VAISSEAU DÉTRUIT') + '</div>' +
      '<div class="te-big"><b id="teN">' + rec.before + '</b>%</div><div class="te-sub">FINITION DU NIVEAU' + (d > 0 ? ' <em>+' + d + '%</em>' : '') + '</div>' +
      '<div class="te-bar"><i class="te-old" style="width:' + rec.before + '%"></i><i class="te-new" id="teFill" style="width:' + rec.before + '%"></i><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>' +
      '<div class="te-rows">' + rows + '</div>' +
      (rec.milestones.length ? '<div class="go-unlock">★ PALIER ' + rec.milestones.join(' + ') + '% · +' + rec.fragments + ' ◆</div>' : '') +
      (full ? '<div class="go-unlock">★ FINITION 100% — PARFAIT ★</div>' : (nx ? '<div class="te-next">IL TE MANQUE <b>' + (100 - rec.after) + '%</b> · ' + nx.tip.toUpperCase() + ' <em>+' + nx.missing + '%</em></div>' : '')) +
      (d <= 0 ? '<div class="te-next">Cette partie : ' + rec.runPct + '% · record ' + rec.after + '%</div>' : '') +
      '<button class="btn" id="teRetry">' + (full ? 'REJOUER' : 'REJOUER · VISER ' + (COMPLETION_STEPS.find(s=> s > rec.after) || 100) + '%') + '</button><button class="btn secondary" id="teHome">ACCUEIL</button>';
    host.appendChild(el);
    el.querySelector('#teRetry').onclick = ()=>{ sfx.resume(); this.tutoCleanup(); this.scene.restart({ autoStart:true, tuto:true }); };
    el.querySelector('#teHome').onclick = ()=>{ this.tutoFinish(); };
    // le % monte à l'écran (compteur + barre)
    const t0 = performance.now(), n = el.querySelector('#teN'), f = el.querySelector('#teFill');
    requestAnimationFrame(()=>{ f.style.transition = 'width 1.1s cubic-bezier(.2,.8,.2,1) .25s'; f.style.width = rec.after + '%'; });
    const tick = now=>{ const k = Math.min(1, Math.max(0, (now - t0 - 250) / 1100)), e = 1 - Math.pow(1 - k, 3); n.textContent = Math.round(rec.before + (rec.after - rec.before) * e); if (k < 1 && n.isConnected) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  },
  tutoCleanup(){
    (this.tutoSats || []).forEach(s=>{ if (s.sp && s.sp.active) s.sp.destroy(); }); this.tutoSats = [];
    const h = document.getElementById('tutoHint'); if (h) h.remove();
    this.tutoUiClear();
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    const bn = document.getElementById('boss-banner'); if (bn) bn.classList.remove('show');
  },
  tutoFinish(){
    if (this._tutoFin) return; this._tutoFin = true; this.tutoDone = true; this.running = false; this.hasActiveRun = false;
    if (this.tutoKills || this.tutoBoss) this.tutoBank();      // quitter en cours de route garde la progression de finition
    this.tutoCleanup(); music.stop();
    this.scene.restart({ toMenu:true });
  },
  tutoPlayerDied(){
    if (this.tutoDone) return; this.tutoDone = true; this.running = false; this.hasActiveRun = false;
    music.stop(); this.playerDeathFx(); this.tutoBank();
    this.time.delayedCall(1800, ()=> this.tutoShowEnd(false));
  },
});
