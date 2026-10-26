"use strict";
// Méthodes de GameScene — TUTO (niveau 1 du monde 1, `w1-tuto`, / bouton DEV) : 3 étapes pédagogiques (bouger, tirer, boss), satellites + débris, boss satellite. Une seule boîte de consigne : N.O.R.M.A. (ui/norma.js).
// La FINITION (%) du niveau (objectifs pondérés, meilleur de chaque objectif gardé) est définie dans data/completion.js ; ici on la mesure, on l'affiche en direct et on montre le bilan.
const TUTO_ID = 'w1-tuto';
const TUTO_STEPS = [          // 3 étapes : se déplacer, tirer sur les ennemis, le boss. Les consignes sont dans AGP_LINES.tuto (boîte N.O.R.M.A.)
  { id:'move',  line:'move',  max:()=> TUTO_TUNE.steps.maxMove },
  { id:'shoot', line:'shoot', max:()=> TUTO_TUNE.steps.maxShoot },
  { id:'boss',  line:'boss',  max:()=> 1e9 },
];
mixin(GameScene, {
  /* ================= TUTO (bouton dans les PARAMETRES DEV et le menu DEV) =================
     Étapes: bouger → tirer sur les satellites → boss satellite (3 phases), puis bilan de finition.
     Tout est géré ici: pas de spawn normal, pas d'XP, pas de classement, pas d'événements. Le vaisseau garde les compétences achetées dans l'arbre. */
  tutoInit(){
    if (!this.textures.exists('tutoOrb')){ const c = this.textures.createCanvas('tutoOrb', 26, 26), g = c.context, gr = g.createRadialGradient(13,13,1,13,13,12); gr.addColorStop(0,'#ffffff'); gr.addColorStop(0.4,'#ffe0c0'); gr.addColorStop(0.75,'rgba(255,150,90,0.8)'); gr.addColorStop(1,'rgba(255,80,40,0)'); g.fillStyle = gr; g.fillRect(0,0,26,26); c.refresh(); }
    this.tutoSats = []; this.tutoStepLog = []; this.tutoT = 0; this.tutoSpawnCd = 600; this.tutoBoss = null; this.tutoDone = false; this.tutoPhase = 'sats'; this.tutoWarned = false; this._tutoH = {}; this._tutoFin = false; this._tutoWave0 = null; this._tutoSaid = false;
    this.tutoStep = 0; this.tutoStepT = 0; this.tutoKills = 0; this.tutoHits = 0; this.tutoMoved = 0; this.tutoLast = null; this.tutoBossWait = 0;
    this.tutoBest = completionPct(TUTO_ID); this.tutoPctShown = -1; this.tutoRecordBeaten = false; this._tutoRec = null;
    this.tutoUiInit(); this.tutoStepEnter(true);
  },
  // une transmission de N.O.R.M.A. (la seule boîte de texte du tuto). hold : la consigne reste affichée ; sinon elle s'efface après lecture.
  tutoSay(key, hold){ Norma.say(AGP_LINES.tuto[key], { prio:true, hold:!!hold }); },
  tutoSfx(name, x){ try { sfx.play(name, { pan: this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- ÉTAPES PÉDAGOGIQUES ---------- */
  tutoUiInit(){
    this.tutoUiClear();
    const host = document.getElementById('boss-hp-wrap').parentNode;
    const p = document.createElement('div'); p.id = 'tutoPct';
    p.innerHTML = '<div class="tp-row"><span class="tp-lab">FINITION</span><b class="tp-n">0%</b><span class="tp-rec"></span></div><div class="tp-bar"><i class="tp-fill"></i><u class="tp-best"></u><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>';
    host.appendChild(p);
  },
  tutoUiClear(){ ['tutoPct', 'tutoEnd'].forEach(id=>{ const e = document.getElementById(id); if (e) e.remove(); }); },
  tutoStepEnter(first){
    const S = TUTO_STEPS[this.tutoStep]; this.tutoStepT = 0;
    this.tutoStepLog.push({ id:S.id, at:Math.round(this.tutoT*10)/10 });
    if (!first) this.tutoSfx('tutoDone', GAME_W/2);
    if (S.id === 'boss'){ this.tutoPhase = 'bosswarn'; this.tutoBossWait = TUTO_TUNE.steps.bossWait * 1000; this.tutoWarned = true; this.tutoSfx('tutoBossWarn', GAME_W/2); const bn = document.getElementById('boss-banner'); if (bn){ bn.classList.add('show'); setTimeout(()=> bn.classList.remove('show'), 2400); } }
    if (!first || this._tutoSaid) this.tutoSay(S.line, true);        // la 1re consigne part à la fin du décollage (tutoUpdate)
  },
  tutoStepProgress(){            // 0..1 de l'étape en cours
    const id = TUTO_STEPS[this.tutoStep].id, T = TUTO_TUNE.steps;
    if (id === 'move') return Math.min(1, this.tutoMoved / Math.max(1, T.moveNeed));
    if (id === 'shoot') return Math.min(1, this.tutoKills / Math.max(1, T.satTarget));
    const B = this.tutoBoss; return B ? Math.max(0, Math.min(1, 1 - B.hp / B.max)) : 0;
  },
  tutoStepCheck(){
    const S = TUTO_STEPS[this.tutoStep]; if (S.id === 'boss') return;
    if (this.tutoStepProgress() >= 1 || this.tutoStepT > S.max()){       // plafond de temps: on n'enferme jamais le joueur dans une étape
      this.tutoStep++; this.tutoStepEnter(false);
    }
  },
  tutoComp(){        // valeurs 0..1 de chaque objectif de finition pour la partie en cours (voir LEVEL_COMPLETION)
    const B = this.tutoBoss, won = !!(B && B.dead);
    return { sats: Math.min(1, this.tutoKills / Math.max(1, TUTO_TUNE.steps.satTarget)), boss: B ? Math.max(0, Math.min(1, 1 - B.hp / B.max)) : 0, win: won ? 1 : 0, clean: won ? Math.max(0, 1 - this.tutoHits * TUTO_TUNE.comp.hitPenalty) : 0 };
  },
  tutoUiUpdate(){
    const p = document.getElementById('tutoPct'); if (!p) return;
    Norma.progress(this.tutoStepProgress());
    const pct = completionPct(TUTO_ID, this.tutoComp());
    if (pct === this.tutoPctShown) return;
    const prev = this.tutoPctShown; this.tutoPctShown = pct;
    p.querySelector('.tp-n').textContent = pct + '%'; p.querySelector('.tp-fill').style.width = pct + '%';
    p.querySelector('.tp-best').style.left = this.tutoBest + '%'; p.querySelector('.tp-best').style.display = this.tutoBest > 0 ? 'block' : 'none';
    if (prev < 0) { p.querySelector('.tp-rec').textContent = this.tutoBest > 0 ? 'RECORD ' + this.tutoBest + '%' : ''; return; }
    p.classList.remove('tick'); void p.offsetWidth; p.classList.add('tick');
    if (!this.tutoRecordBeaten && this.tutoBest > 0 && pct > this.tutoBest){ this.tutoRecordBeaten = true; p.classList.add('rec'); p.querySelector('.tp-rec').textContent = 'NOUVEAU RECORD !'; this.tutoSfx('tutoBossPhase', GAME_W/2); }
    const st = COMPLETION_STEPS.find(s=> prev < s && pct >= s);
    if (st){ p.classList.remove('mile'); void p.offsetWidth; p.classList.add('mile'); this.tutoSfx('tutoDone', GAME_W/2); }
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
    s.hp -= dmg; this.spawnHitParticles(x, y, 4); this.juicePunch(s.sp, 0.1, 70); this.tutoSfx('tutoSatHit', s.sp.x);
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
    this.explodeFx(x, y, 54); this.juiceShake(0.14); this.tutoSfx('tutoSatBoom', x);
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
  tutoSpawnLogic(delta){          // étape 1 : aucun satellite · étape 2 : un seul, lent, puis des vagues de plus en plus serrées
    if (TUTO_STEPS[this.tutoStep].id !== 'shoot') return;
    const alive = this.tutoSats.length;
    this.tutoSpawnCd -= delta; if (this.tutoSpawnCd > 0) return;
    if (this.tutoKills < 1){ if (alive < 1){ this.tutoSpawnCd = 900; this.tutoSpawnSat(true); } return; }
    if (this._tutoWave0 === null) this._tutoWave0 = this.tutoStepT;
    const T = TUTO_TUNE.sats, w = this.tutoStepT - this._tutoWave0;
    if (alive < T.capBase + Math.min(T.capExtra, Math.floor(w / Math.max(1, T.capEvery)))){ this.tutoSpawnCd = Phaser.Math.Linear(T.spawnCdStart, T.spawnCdEnd, Math.min(1, w / Math.max(1, T.rampTime))) * Phaser.Math.FloatBetween(0.8, 1.2); this.tutoSpawnSat(false); }
  },
  tutoUpdate(delta){
    if (this.tutoDone || !this.running) return;
    if (this.introActive){ return; }
    delta = Math.min(delta, 100);                     // un à-coup (chargement, onglet en arrière-plan) ne doit pas avaler une étape
    const dt = delta/1000; this.tutoT += dt; this.tutoStepT += dt;
    const vy = this.visibleYRange(0), px = this.player.x, py = this.player.y;
    if (this.tutoLast) this.tutoMoved += Math.hypot(px - this.tutoLast.x, py - this.tutoLast.y);
    this.tutoLast = { x:px, y:py };
    if (!this._tutoSaid){ this._tutoSaid = true; this.tutoSay(TUTO_STEPS[this.tutoStep].line, true); }       // 1re consigne : le décollage est fini
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
        this.tutoHitBox(this.playerBullets, sp, 44, 36, b=>{ this.juiceImpact(b, s); this.tutoHitSat(s, b.damage || 10, b.x, b.y); }, s);
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
    const sp = this.acBossBuild(GAME_W/2, vy.min - 200);       // Antenne-Mère : habillage dans game/tuto-boss-fx.js (les valeurs de jeu restent ci-dessous)
    this.tutoBoss = { sp, hp:TUTO_TUNE.boss.hp, max:TUTO_TUNE.boss.hp, state:'enter', t:0, ty:vy.min + 175, cx:GAME_W/2, amp:Math.max(20, Math.min(80, (vx.max - vx.min)/2 - 150)), phase:1, aimCd:1800, ringCd:TUTO_TUNE.boss.ringCd, rainCd:2600, spCd:0, spA:0, dead:false, hitT:0 };
    const wrap = document.getElementById('boss-hp-wrap'), lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = AC.names[0]; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; } if (wrap) wrap.classList.add('show');
  },
  tutoBossShot(x, y, ang, spd, tint, dmg){
    return this.acShot(x, y, ang, spd, tint, dmg);       // boule d'énergie animée (même zone de collision que l'ancienne orbe)
  },
  tutoBossUpdate(delta, dt){
    const B = this.tutoBoss; if (B.dead) return;
    B.t += dt; const sp = B.sp, px = this.player.x, py = this.player.y;
    this.acBossUpdate(delta);
    if (B.state === 'enter'){ sp.y += 80*dt; if (sp.y >= B.ty){ sp.y = B.ty; B.state = 'fight'; B.t = 0; } }
    else {
      sp.x = B.cx + Math.sin(B.t*0.55)*B.amp; sp.y = B.ty + Math.sin(B.t*0.9)*10;
      const BT = TUTO_TUNE.boss, f = B.hp / B.max, ph = f > BT.p2 ? 1 : f > BT.p3 ? 2 : 3;
      if (ph !== B.phase){ B.phase = ph; this.cameras.main.flash(90, 255, 140, 60, false); this.juiceShake(0.5); this.juiceStop('bossPhase'); this.tutoSfx('tutoBossPhase', sp.x);
        const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + ph;
        this.tutoSay(ph === 2 ? 'p2' : 'p3'); }          // l'usure se voit sur le sprite (états d'usure, game/tuto-boss-fx.js), plus par une teinte
      const bx = sp.x, by = sp.y + 40;
      B.aimCd -= delta; if (B.aimCd > 0 && B.aimCd < 470) this.acChargeStart();     // charge visible 0,47 s avant le tir (aucun délai ajouté)
      if (B.aimCd <= 0){ this.acChargeStop(true); B.aimCd = ph === 3 ? BT.aimCd3 : BT.aimCd; const a = Phaser.Math.Angle.Between(bx, by, px, py); [-0.2, 0, 0.2].forEach(o=> this.tutoBossShot(bx, by, a + o, BT.aimSpeed, 0xff5050, BT.aimDmg)); this.tutoSfx('tutoBossAim', bx);
        if (!this._tutoH.aim){ this._tutoH.aim = 1; this.tutoSay('aim'); } }
      B.ringCd -= delta; if (B.ringCd <= 0){ B.ringCd = BT.ringCd; const n = Math.max(3, Math.round(BT.ringCount)), gap = Phaser.Math.Between(0, n-1), gw = Math.round(BT.ringGap); for (let i=0;i<n;i++){ if (((i - gap + n) % n) < gw) continue; this.tutoBossShot(bx, by, i/n*6.2832, BT.ringSpeed, 0xffa040, BT.ringDmg); } this.tutoSfx('tutoBossRing', bx);
        if (!this._tutoH.ring){ this._tutoH.ring = 1; this.tutoSay('ring'); } }
      if (ph >= 2){ B.rainCd -= delta; if (B.rainCd <= 0){ B.rainCd = BT.rainCd; [-115, 0, 115].forEach(o=> this.tutoBossShot(bx + o + Phaser.Math.Between(-20, 20), by - 10, Math.PI/2, BT.rainSpeed, 0xff8040, BT.rainDmg)); this.tutoSfx('tutoBossRain', bx); } }
      if (ph >= 3){ B.spCd -= delta; if (B.spCd <= 0){ B.spCd = BT.spiralCd; B.spA += 0.36; this.tutoBossShot(bx, by, B.spA, BT.spiralSpeed, 0xff3060, BT.spiralDmg); this.tutoBossShot(bx, by, B.spA + Math.PI, BT.spiralSpeed, 0xff3060, BT.spiralDmg); this.tutoSfx('tutoBossSpiral', bx); } }
      // dégâts reçus
      const hit = (b, d)=>{ B.hp -= d; this.juiceImpact(b, B); this.spawnHitParticles(b.x, b.y, 3); this.tutoSfx('tutoBossHit', b.x); this.acBossHit(b.x, b.y); if (B.hitT <= 0){ B.hitT = 60; this.acHitFlash(B); } };
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
    this.tutoUiUpdate(); Norma.progress(null); this.tutoSay('win');
    this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    const sp = B.sp, x = sp.x, y = sp.y; this.acChargeStop(false); if (this._ac.state < 3) this.acSetState(3);
    this._acDeathTick = this.time.addEvent({ delay:16, loop:true, callback:()=> this.acFollow(16) });          // la fumée, les flammes et les éclats continuent pendant la destruction
    this.cameras.main.shake(2100, 0.008); this.startSlowmo(1500, 0.5); this.juiceStop('bossKill');
    [0, 1, 2, 3, 4].forEach(i=> this.time.delayedCall(i*430, ()=>{
      for (let k=0;k<3;k++){ const ox = x + Phaser.Math.Between(-120, 120), oy = y + Phaser.Math.Between(-100, 100); this.explodeFx(ox, oy, 70); this.acDeathBoom(ox, oy, 0.35 + Math.random()*0.25); }
      this.tutoSfx(i < 3 ? 'tutoBossBoomA' : 'tutoBossBoomFinal', x + Phaser.Math.Between(-80, 80));
    }));
    this.time.delayedCall(2150, ()=>{
      this.cameras.main.flash(600, 255, 255, 255, false); this.tutoSfx('tutoBossBoomFinal', x);
      this.acDeathFinal(x, y); B.sp.destroy(); this.score += TUTO_TUNE.boss.killScore;
      this._ac.flames.forEach(f=> f.s.destroy()); this._ac.flames = [];
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
    el.innerHTML = '<div class="go-title">' + (victory ? 'FORMATION VALIDEE' : 'ACCIDENT DU TRAVAIL') + '</div>' +
      '<div class="te-big"><b id="teN">' + rec.before + '</b>%</div><div class="te-sub">TAUX DE FINITION DE LA FORMATION' + (d > 0 ? ' <em>+' + d + '%</em>' : '') + '</div>' +
      '<div class="te-bar"><i class="te-old" style="width:' + rec.before + '%"></i><i class="te-new" id="teFill" style="width:' + rec.before + '%"></i><s style="left:25%"></s><s style="left:50%"></s><s style="left:75%"></s></div>' +
      '<div class="te-rows">' + rows + '</div>' +
      (rec.milestones.length ? '<div class="go-unlock">★ PALIER ' + rec.milestones.join(' + ') + '% · +' + rec.fragments + ' ◆</div>' : '') +
      (full ? '<div class="go-unlock">★ FINITION 100% — PARFAIT ★</div>' : (nx ? '<div class="te-next">IL TE MANQUE <b>' + (100 - rec.after) + '%</b> · ' + nx.tip.toUpperCase() + ' <em>+' + nx.missing + '%</em></div>' : '')) +
      (d <= 0 ? '<div class="te-next">Cette partie : ' + rec.runPct + '% · record ' + rec.after + '%</div>' : '') +
      '<button class="btn" id="teRetry">' + (full ? 'REFAIRE LA FORMATION' : 'REFAIRE · VISER ' + (COMPLETION_STEPS.find(s=> s > rec.after) || 100) + '%') + '</button><button class="btn secondary" id="teHome">RETOUR AU BUREAU</button>';
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
    if (this._acDeathTick){ this._acDeathTick.remove(); this._acDeathTick = null; } this.acBossClear();
    Norma.reset();
    this.tutoUiClear();
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    const bn = document.getElementById('boss-banner'); if (bn) bn.classList.remove('show');
  },
  tutoFinish(){
    if (this._tutoFin) return; this._tutoFin = true; this.tutoDone = true; this.running = false; this.hasActiveRun = false;
    if (this.tutoKills || this.tutoBoss) this.tutoBank();      // quitter en cours de route garde la progression de finition
    this.tutoCleanup(); music.stop();
    Motion.cover(()=> this.scene.restart({ toMenu:true }), .4);      // rideau GSAP avant le retour à l'accueil (rouvert par enterHome)
  },
  tutoPlayerDied(){
    if (this.tutoDone) return; this.tutoDone = true; this.running = false; this.hasActiveRun = false;
    music.stop(); this.playerDeathFx(); this.tutoBank(); Norma.progress(null); this.tutoSay('lose');
    this.time.delayedCall(1800, ()=> this.tutoShowEnd(false));
  },
});
