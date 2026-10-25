"use strict";
// Méthodes de GameScene — IA spécifique de chaque boss (dread, faucheuse, ruche, prisme, kraken, éclipse, hydre).
mixin(GameScene, {
  /* ---------- DREADNOUGHT (le boss d'origine) ---------- */
  bossAI_dread(boss, delta){
    const VO = { tint: boss._second ? 0xff3030 : ((boss.phase||1) >= 3 ? 0xff5040 : ((boss.phase||1) === 2 ? 0xffa040 : 0xffd890)) };     // tirs: jaune orangé, orange puis rouge
    const ph = boss.phase || 1;
    // phase 2: il se déplace plus vite et plus large; phase 3: en plus l'anneau tourne en spirale
    boss.x = (boss.cx||GAME_W/2) + Math.sin(boss.phaseTimer/(ph >= 2 ? 680 : 900))*(ph >= 2 ? 105 : 95);   // amplitude réduite: sprite plus large, on garde de la marge sur les côtés
    boss.fireCd = (boss.fireCd||0) - delta;
    if (boss.fireCd <= 0){
      boss.fireCd = (820 - this.difficultyTier*25) * boss.cdMul * (ph >= 2 ? 0.9 : 1);
      boss.attackToggle = ((boss.attackToggle||0)+1) % (ph >= 2 ? 3 : 2);
      if (boss.attackToggle === 0){
        const baseAngle = this.aimFrom(boss.x, boss.y);
        if (ph >= 2) [-0.44,-0.22,0,0.22,0.44].forEach(off=> this.bossShot(boss.x, this.muzzleY(boss), baseAngle+off, 210, VO));   // éventail de 5, plus rapide
        else [-0.28,0,0.28].forEach(off=> this.bossShot(boss.x, this.muzzleY(boss), baseAngle+off, 190, VO));
      } else if (boss.attackToggle === 1){
        // anneau complet — oblige le joueur à vraiment bouger, pas juste esquiver sur le côté
        const count = Math.round(10*boss.dense) + (ph >= 3 ? 4 : 0);
        const rot = ph >= 3 ? (boss.ringRot = (boss.ringRot||0) + 0.31) : 0;                  // phase 3: l'anneau tourne d'un tir à l'autre
        for (let i=0;i<count;i++) this.bossShot(boss.x, this.muzzleY(boss), (Math.PI*2/count)*i + rot, 150, VO);
      } else {
        // phase 2+: pluie de trois tirs lents qui tombent droit devant les ailes
        [-80,0,80].forEach(dx=> this.bossShot(boss.x + dx, this.muzzleY(boss), Math.PI/2, 230, VO));
      }
    }
  },

  /* ---------- LA FAUCHEUSE: balayage en éventail, piqués, puis groggy ---------- */
  bossAI_faucheuse(boss, delta){
    const t = boss.phaseTimer, def = BOSS_DEFS.faucheuse;
    boss.fState = boss.fState || 'sweep';
    const lowY = this.visibleYRange(0).max - 150/this.cameras.main.zoom;
    if (boss.fState === 'sweep'){
      const vx = this.visibleXRange(60);
      boss.x = (boss.cx||GAME_W/2) + Math.sin(t/1000) * Math.min(130, (vx.max-vx.min)/2);
      boss.y = boss.restY;
      boss.body.setVelocity(0,0);
      boss.contactDamage = Math.round(16 * this.bossDmgMul);
      boss.fireCd = (boss.fireCd||0) - delta;
      if (boss.fireCd <= 0){
        boss.fireCd = 900 * boss.cdMul;
        const n = (boss.phase >= 3 ? 7 : 5) + (boss.dense > 1 ? 2 : 0);
        const center = Math.PI/2 + Math.sin(t/600)*0.55;
        const cf = boss._second ? 2 : Math.min(2, (boss.phase || 1) - 1);     // croissants argentés, puis magenta, puis rouges
        for (let i=0;i<n;i++) this.bossShot(boss.x, this.muzzleY(boss), center + (i-(n-1)/2)*0.17, 200, { tex:'fauCr', frame:cf, scale:0.8 });
      }
      if (boss.phase >= 2){
        boss.diveCd = (boss.diveCd === undefined ? 4000 : boss.diveCd) - delta;
        if (boss.diveCd <= 0){ boss.fState = 'telegraph'; boss.fTimer = 1000; boss.diveX = this.player.x; sfx.snipeCharge(); }
      }
    } else if (boss.fState === 'telegraph'){
      boss.fTimer -= delta;
      boss.setTint((Math.floor(boss.fTimer/90) % 2) ? 0xffffff : 0xff2020);
      if (boss.fTimer > 400) boss.diveX = this.player.x;       // elle verrouille le joueur, puis ne bouge plus
      boss.x += (Math.random()-0.5)*3;
      if (boss.fTimer <= 0){
        boss.fState = 'dive'; boss.fTimer = 1300;
        boss.contactDamage = Math.round(24 * this.bossDmgMul);
        if (def.tint) boss.setTint(def.tint); else boss.clearTint();
        this.physics.moveTo(boss, boss.diveX, lowY, 560);
      }
    } else if (boss.fState === 'dive'){
      boss.fTimer -= delta;
      if (boss.y >= lowY - 8 || boss.fTimer <= 0){
        boss.body.setVelocity(0,0);
        boss.fState = 'groggy'; boss.fTimer = boss.phase >= 3 ? 1400 : 2000;
        boss.groggy = true; boss.contactDamage = Math.round(10 * this.bossDmgMul);
        if (!BOSS_SPRITES.faucheuse) boss.setTint(0x8888aa);                 // avec ses propres dessins, la sonnée a déjà son image
        this.cameras.main.shake(200, 0.012);
      }
    } else if (boss.fState === 'groggy'){
      boss.fTimer -= delta;
      if (boss.fTimer <= 0){
        boss.groggy = false;
        if (def.tint) boss.setTint(def.tint); else boss.clearTint();
        boss.fState = 'return';
      }
    } else { // return
      boss.body.setVelocity(0, -230);
      const vx = this.visibleXRange(60);
      const tx = (boss.cx||GAME_W/2) + Math.sin(t/1000) * Math.min(130, (vx.max-vx.min)/2);
      boss.x += (tx - boss.x) * 0.06;
      if (boss.y <= boss.restY){
        boss.y = boss.restY; boss.body.setVelocity(0,0);
        boss.fState = 'sweep'; boss.diveCd = boss.phase >= 3 ? 4500 : 7000;
      }
    }
  },

  /* ---------- LA RUCHE: 4 pods protègent le coeur et crachent des swarmers ---------- */
  bossAI_ruche(boss, delta){
    const t = boss.phaseTimer;
    boss.x = (boss.cx||GAME_W/2) + Math.sin(t/1400)*70;
    boss.y = boss.restY;
    const pods = boss.parts.filter(p=>p.active && p.partRole==='pod');
    boss.invuln = pods.length > 0;
    boss.fireCd = (boss.fireCd||0) - delta;
    if (boss.fireCd <= 0){
      boss.fireCd = (pods.length ? 2300 : 1500) * boss.cdMul;
      const n = (boss.phase >= 2 ? 2 : 1) * (boss.dense > 1 ? 2 : 1);
      for (let i=0;i<n;i++){
        const off = (i-(n-1)/2)*0.4;
        this.bossShot(boss.x, this.muzzleY(boss), Math.PI/2 + off, 120, { tex:'ruSpore', frame:Math.min(2, (boss.phase||1)-1), scale:0.7, noRot:true, homing:1.5, life:6000, damage:8 });
      }
    }
    if (!pods.length){
      boss.ringCd = (boss.ringCd === undefined ? 1200 : boss.ringCd) - delta;
      if (boss.ringCd <= 0){
        boss.ringCd = 2600 * boss.cdMul;
        const count = Math.round(12*boss.dense);
        const a0 = Math.random()*6.28;
        for (let i=0;i<count;i++) this.bossShot(boss.x, this.muzzleY(boss), a0 + (Math.PI*2/count)*i, 130);
      }
    }
    pods.forEach(p=>{
      p.setFrame(p.hp < p.maxHp*0.5 ? 1 : 0);                     // poche abîmée sous 50% de PV
      p.spawnCd = (p.spawnCd === undefined ? 1500 + Math.random()*1500 : p.spawnCd) - delta;
      if (p.spawnCd <= 0){
        p.spawnCd = 4200*boss.cdMul + Math.random()*800;
        if (this.countEnemies('swarmer') < 9){
          const sx = p.x, sy = p.y;
          this.deferSpawn(()=>{
            const e = this.ruBee(this.spawnOneEnemy('swarmer'));
            if (e){ e.x = sx; e.y = sy; e.baseX = sx; }
          });
        }
      }
    });
  },

  /* ---------- LE PRISME: grille de lasers rotative entre 3 miroirs, puis spirales ---------- */
  bossAI_prisme(boss, delta){
    const t = boss.phaseTimer;
    boss.x = (boss.cx||GAME_W/2) + Math.sin(t/1800)*50;
    boss.y = boss.restY;
    boss.mirrorAngle += delta/1000 * (boss.phase >= 2 ? 1.1 : 0.7);
    if (!boss.lState){ boss.lState = 'idle'; boss.lTimer = 2500; }
    boss.lTimer -= delta;
    if (boss.lTimer <= 0){
      if (boss.lState === 'idle'){ boss.lState = 'telegraph'; boss.lTimer = 1200; sfx.beamCharge(); }
      else if (boss.lState === 'telegraph'){ boss.lState = 'fire'; boss.lTimer = 1600; sfx.beamFire(); }
      else { boss.lState = 'idle'; boss.lTimer = (boss.phase >= 2 ? 2200 : 3200) * boss.cdMul; }
    }
    const mirrors = boss.parts.filter(p=>p.active && p.partRole==='mirror');
    const g = boss.gfx;
    if (g){
      g.clear();
      if ((boss.lState === 'telegraph' || boss.lState === 'fire') && mirrors.length === 3){
        for (let k=0;k<3;k++){
          const a = mirrors[k], b = mirrors[(k+1)%3];
          const dx = b.x-a.x, dy = b.y-a.y, len = Math.hypot(dx,dy) || 1, ux = dx/len, uy = dy/len;
          const x1 = a.x - ux*1000, y1 = a.y - uy*1000, x2 = b.x + ux*1000, y2 = b.y + uy*1000;
          if (boss.lState === 'telegraph'){
            g.lineStyle(2, 0xff66ff, 0.28); g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.strokePath();
          } else {
            g.lineStyle(12, (boss.phase >= 3 ? 0xff4fd8 : (boss.phase === 2 ? 0xffc040 : 0x33dfff)), 0.55); g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.strokePath();
            g.lineStyle(4, 0xffffff, 0.95);  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.strokePath();
            const px = this.player.x - x1, py = this.player.y - y1, L2 = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
            const tt = Phaser.Math.Clamp((px*(x2-x1) + py*(y2-y1))/L2, 0, 1);
            const dist = Math.hypot(this.player.x - (x1 + tt*(x2-x1)), this.player.y - (y1 + tt*(y2-y1)));
            if (dist < 13 && this.player.active) this.damagePlayer(Math.round(11 * (this.bossDmgMul || 1)));
          }
        }
      }
    }
    if (boss.phase >= 2){
      boss.spiralCd = (boss.spiralCd||0) - delta;
      if (boss.spiralCd <= 0){
        boss.spiralCd = 170 * boss.cdMul;
        boss.spiralAng = (boss.spiralAng||0) + 0.42;
        const spOpt = { tex:'prSpiral', frame:Math.min(2, (boss.phase||1)-1), scale:0.5, noRot:true };       // spirale cyan, dorée puis rose
    this.bossShot(boss.x, boss.y, boss.spiralAng, 150, spOpt);
        if (boss.dense > 1) this.bossShot(boss.x, boss.y, boss.spiralAng + Math.PI, 150, spOpt);
      }
    }
    if (boss.phase >= 3){
      boss.mirShotCd = (boss.mirShotCd||0) - delta;
      if (boss.mirShotCd <= 0){
        boss.mirShotCd = 1400;
        mirrors.forEach(m=> this.bossShot(m.x, m.y, this.aimFrom(m.x, m.y), 170));
      }
    }
  },

  /* ---------- LE KRAKEN: 4 tentacules (PV propres) qui repoussent, et jets d'encre ---------- */
  bossAI_kraken(boss, delta){
    const t = boss.phaseTimer;
    boss.x = (boss.cx||GAME_W/2) + Math.sin(t/1500)*60;
    boss.y = boss.restY;
    boss.fireCd = (boss.fireCd||0) - delta;
    if (boss.fireCd <= 0){
      boss.fireCd = 1500 * boss.cdMul;
      const n = (boss.phase >= 2 ? 7 : 5) + (boss.dense > 1 ? 2 : 0);
      const base = this.aimFrom(boss.x, boss.y);
      for (let i=0;i<n;i++) this.bossShot(boss.x, this.muzzleY(boss), base + (i-(n-1)/2)*0.2, 150, { tex:'bpInk', scale:1.0, noRot:true, damage:8, tint:(boss.phase >= 3 ? 0xff4060 : (boss.phase === 2 ? 0xb070ff : 0)) });
    }
    boss.tentacles.forEach(tn=>{
      if (tn.segs.length < tn.N && !tn.spawning){
        tn.regrow -= delta;
        if (tn.regrow <= 0){
          tn.spawning = true;
          const from = tn.segs.length;
          this.deferSpawn(()=>{ tn.dead = false; this.spawnTentacleSegs(boss, tn, from); });
        }
      }
    });
  },

  /* ---------- L'ECLIPSE: disparaît, puis 3 exemplaires dont un seul est vrai ---------- */
  bossAI_eclipse(boss, delta){
    const VO = { tex:'ecOrb', frame:Math.min(2,(boss.phase||1)-1), scale:0.55, noRot:true };
    const t = boss.phaseTimer;
    const fast = boss.phase >= 2 ? 0.65 : 1;
    if (!boss.eState){ boss.eState = 'visible'; boss.eTimer = 3200; }
    boss.eTimer -= delta;
    if (boss.eState === 'visible'){
      const vx = this.visibleXRange(60);
      boss.invuln = false; boss.setAlpha(1);
      boss.x = Phaser.Math.Clamp((boss.cx||GAME_W/2) + Math.sin(t/1000)*95, vx.min, vx.max);
      boss.y = boss.restY;
      boss.fireCd = (boss.fireCd||0) - delta;
      if (boss.fireCd <= 0){
        boss.fireCd = 1100 * boss.cdMul;
        const base = this.aimFrom(boss.x, boss.y);
        [-0.25,0,0.25].forEach(o=> this.bossShot(boss.x, this.muzzleY(boss), base+o, 185, VO));
      }
      if (boss.eTimer <= 0){ boss.eState = 'vanish'; boss.eTimer = 600; }
    } else if (boss.eState === 'vanish'){
      boss.invuln = true;
      boss.setAlpha(Math.max(0, boss.eTimer/600));
      if (boss.eTimer <= 0){ boss.eState = 'mirage'; boss.eTimer = 4300*fast; this.startMirage(boss); }
    } else { // mirage
      boss.invuln = false; boss.setAlpha(0.95);
      boss.mirrorFireCd = (boss.mirrorFireCd||0) - delta;
      if (boss.mirrorFireCd <= 0){
        boss.mirrorFireCd = 1500 * boss.cdMul;
        const copies = [boss].concat(boss.parts.filter(p=>p.active && p.partRole==='decoy'));
        copies.forEach(c=> this.bossShot(c.x, this.muzzleY(c), this.aimFrom(c.x, c.y), 175, VO));
      }
      if (boss.eTimer <= 0){ boss.eState = 'visible'; boss.eTimer = 3200*fast; this.endMirage(boss); }
    }
    if (boss.halo){
      boss.halo.x = boss.x; boss.halo.y = boss.y;
      boss.halo.setVisible(boss.eState === 'mirage'); // seul indice: un léger halo autour du vrai
    }
  },

  startMirage(boss){
    sfx.mirageOn();
    const def = BOSS_DEFS.eclipse;
    const n = this.alertLevel >= 5 ? 5 : 3;
    const vx = this.visibleXRange(70);
    const slots = [];
    for (let i=0;i<n;i++) slots.push({ x: vx.min + (vx.max-vx.min)*(i+0.5)/n, y: boss.restY + Phaser.Math.Between(-20,40) });
    Phaser.Utils.Array.Shuffle(slots);
    const real = slots.shift();
    boss.x = real.x; boss.y = real.y;
    this.deferSpawn(()=>{
      if (!boss.active) return;
      slots.forEach(sl=>{
        const art = BOSS_SPRITES.eclipse;
        const d = this.makeBossPart(boss, art ? 'ecDecoy' : def.tex, art ? boss.scaleX*0.78 : boss.scaleX, 'decoy', { hp:1, contact:10, score:5, body: art ? [60,60] : def.body, anim: art ? 'ecDecoyA' : def.anim, tint: art ? null : def.tint, flipY: art ? false : (def.flipY !== false) });
        d.x = sl.x; d.y = sl.y; d.setAlpha(0.95);
      });
    });
  },

  endMirage(boss){
    sfx.mirageOff();
    this.deferSpawn(()=>{
      boss.parts.filter(p=>p.partRole==='decoy').forEach(d=>{ if (d.active){ this.partBoom(d.x, d.y); d.destroy(); } });
      boss.parts = boss.parts.filter(p=>p.active);
    });
  },

  /* ---------- L'HYDRE: chaque tête abattue en fait repousser 2, jusqu'à 9 ---------- */
  bossAI_hydre(boss, delta){
    const VO = { tex:'hyVenom', frame:Math.min(2,(boss.phase||1)-1), scale:0.7, noRot:true };
    const t = boss.phaseTimer;
    boss.x = (boss.cx||GAME_W/2) + Math.sin(t/2000)*50;
    boss.y = boss.restY - 25;
    boss.invuln = true;
    const heads = boss.parts.filter(p=>p.active && p.partRole==='head');
    heads.forEach((h,i)=>{
      h.fireCd = (h.fireCd === undefined ? 600 + i*210 : h.fireCd) - delta;
      h.setFlipX(h.x < boss.x);                                                        // la tête regarde vers l'extérieur
      h.setFrame((h._spitUntil||0) > this.time.now ? 4 : (h.fireCd < 380 ? 2 : ((((t/650 + i) | 0) % 2) ? 1 : 0)));   // bouche fermée, ouverte juste avant de tirer, crachat
      if (h.fireCd <= 0){
        h._spitUntil = this.time.now + 240;
        const ph = boss.phase || 1;
        h.fireCd = (1900 + Math.random()*900) * boss.cdMul * (ph >= 2 ? 0.85 : 1);
        const ang = this.aimFrom(h.x, h.y);
        if (i % 2 === 0){
          if (ph >= 2) [-0.1,0.1].forEach(o=> this.bossShot(h.x, this.muzzleY(h), ang+o, 170, VO));   // phase 2: les têtes paires tirent par deux
          else this.bossShot(h.x, this.muzzleY(h), ang, 170, VO);
        } else [-0.3,0,0.3].forEach(o=> this.bossShot(h.x, this.muzzleY(h), ang+o, 140, VO));
        h.volley = (h.volley||0) + 1;
        if (ph >= 3 && h.volley % 3 === 0){                                                         // phase 3: une salve de venin circulaire toutes les 3 salves
          const n = 8, rot = Math.random()*6.28;
          for (let k=0;k<n;k++) this.bossShot(h.x, this.muzzleY(h), (Math.PI*2/n)*k + rot, 120, VO);
        }
      }
    });
    if (boss.labelN !== heads.length + boss.pendingHeads){ boss.labelN = heads.length + boss.pendingHeads; this.updateHydraLabel(boss); }
  },

  // placement des parties de chaque boss (appelé chaque frame, y compris pendant l'entrée)
  layoutBossParts(boss, delta){
    const t = boss.phaseTimer || 0;
    const vx = this.visibleXRange(24);
    const parts = boss.parts || [];
    const geo = boss.geo || 1;
    switch (boss.bossId){
      case 'ruche': {
        let k = 0;
        parts.forEach(p=>{
          if (!p.active || p.partRole !== 'pod') return;
          const a = t/2200 + (p.orbit||k)*(Math.PI/2);
          p.x = Phaser.Math.Clamp(boss.x + Math.cos(a)*118*geo, vx.min, vx.max);
          p.y = boss.y + Math.sin(a)*86*geo;
          k++;
        });
        break;
      }
      case 'prisme': {
        parts.forEach(p=>{
          if (!p.active || p.partRole !== 'mirror') return;
          const a = (boss.mirrorAngle||0) + p.orbit*(Math.PI*2/3);
          p.x = Phaser.Math.Clamp(boss.x + Math.cos(a)*125*geo, vx.min, vx.max);
          p.y = boss.y + Math.sin(a)*105*geo;
          p.rotation = a; p.setFrame(boss.phase >= 2 ? 1 : 0);              // miroirs fissurés dès la phase 2
        });
        break;
      }
      case 'kraken': {
        parts.forEach(q=>{ if (q.active && q.partRole === 'seg' && q.idx === 0) q.setFrame(q.hp < q.maxHp*0.5 ? 1 : 0); });   // boule de base "touchée" sous 50%
        const sweep = boss.phase >= 3 ? 1.9 : (boss.phase >= 2 ? 1.5 : 1);
        const vyr = this.visibleYRange(0);
        const baseOff = 52*geo;
        // les bras ne dépassent jamais ~55% de la hauteur de l'écran: on garde de la place pour le joueur
        const room = (vyr.min + 0.55*(vyr.max - vyr.min)) - (boss.y + baseOff);
        const g = boss.gfx;
        if (g) g.clear();
        (boss.tentacles||[]).forEach(tn=>{
          const sp = Phaser.Math.Clamp(room / tn.N, 20, 28*geo);
          const ax = boss.x + (tn.k - 1.5)*58*geo;
          const pts = [{ x: boss.x + (tn.k - 1.5)*30*geo, y: boss.y + 28*geo }];      // racine du bras dans le corps
          tn.segs.forEach(sg=>{
            if (!sg.active) return;
            const f = (sg.idx+1)/tn.N;
            const amp = (55 + 55*(boss.phase>=2?1:0)) * f * geo;
            sg.x = Phaser.Math.Clamp(ax + Math.sin(t*sweep/650 + sg.idx*0.6 + tn.k*1.7)*amp + (tn.k-1.5)*f*70*geo, vx.min, vx.max);
            sg.y = boss.y + baseOff + (sg.idx+1)*sp;
            pts.push({ x:sg.x, y:sg.y });
          });
          if (g && pts.length > 1){
            for (const pass of [[16*Math.min(geo,1.4), 0x143a86, 1],[7*Math.min(geo,1.4), 0x4f9bff, 0.9]]){
              g.lineStyle(pass[0], pass[1], pass[2]);
              g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
              for (let j=1;j<pts.length;j++) g.lineTo(pts[j].x, pts[j].y);
              g.strokePath();
            }
          }
          // anneau doré qui pulse autour de la boule de base: c'est le point faible à viser
          const bs = tn.segs[0];
          if (g && bs && bs.active && bs.idx === 0){
            g.lineStyle(3, 0xffd76a, 0.9);
            g.strokeCircle(bs.x, bs.y, bs.displayWidth*0.62 + 2*Math.sin(t/110));
          }
        });
        break;
      }
      case 'hydre': {
        const heads = parts.filter(p=>p.active && p.partRole==='head');
        const n = heads.length;
        const g = boss.gfx;
        if (g) g.clear();
        heads.forEach((h,i)=>{
          const th = n === 1 ? 0 : Phaser.Math.Linear(-1.15, 1.15, i/(n-1));
          // au-delà de 5 têtes, une tête sur deux est plus loin: deux rangées au lieu d'un bloc écrasé
          const row = (n > 5 && i % 2 === 1) ? 1.2 : 1;
          const R = (125 + 14*Math.sin(t/500 + i*1.3) + (n > 5 ? 22 : 0)) * geo * row;
          const tx = Phaser.Math.Clamp(boss.x + Math.sin(th)*R*1.25, vx.min, vx.max);
          const ty = boss.y + 55*geo + Math.cos(th)*R;
          h.x += (tx - h.x)*0.12; h.y += (ty - h.y)*0.12;
          if (h._fx){ h._fx.x = h.x; h._fx.y = h.y; }
          if (g){
            const sx = boss.x, sy = boss.y + 40*geo;
            const cx = (sx + h.x)/2 + Math.sin(t/400 + i)*18, cy = (sy + h.y)/2;
            [[16, 0x0b2f1f, 1], [10, 0x2c9a50, 1], [3, 0xa6ee7a, 0.55]].forEach(ln=>{          // cou en 3 traits: contour sombre, écailles, reflet
              g.lineStyle(ln[0], ln[1], ln[2]);
              g.beginPath(); g.moveTo(sx, sy);
              for (let s=1;s<=10;s++){
                const u = s/10, ix = (1-u)*(1-u)*sx + 2*(1-u)*u*cx + u*u*h.x, iy = (1-u)*(1-u)*sy + 2*(1-u)*u*cy + u*u*h.y;
                g.lineTo(ix, iy);
              }
              g.strokePath();
            });
          }
        });
        break;
      }
      default: break;
    }
  },
});
