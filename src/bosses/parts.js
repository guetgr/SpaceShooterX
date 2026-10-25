"use strict";
// Méthodes de GameScene — pièces de boss : tentacules, têtes, dégâts par pièce, repousse.
mixin(GameScene, {
  makeBossPart(boss, tex, scale, role, o){
    o = o || {};
    const p = this.enemies.create(boss.x, boss.y, tex);
    p.setDepth(o.depth || 5);
    p.setScale(scale);
    p.enemyType = 'bossPart';
    p.isBossPart = true;
    p.partRole = role;
    p.bossRef = boss;
    p.hp = (o.hp !== undefined) ? o.hp : 1;
    p.maxHp = p.hp;
    p.contactDamage = Math.round((o.contact || 8) * (this.bossDmgMul || 1));
    p.scoreValue = o.score || 10;
    if (o.invuln) p.invuln = true;
    if (o.body) p.body.setSize(o.body[0], o.body[1]);
    if (o.anim) p.play(o.anim);
    if (o.tint) p.setTint(o.tint);
    if (o.flipY) p.setFlipY(true);
    boss.parts.push(p);
    return p;
  },

  initBossParts(boss, def, ts){
    switch (boss.bossId){
      case 'ruche': {
        const podHp = 110*ts, coreHp = 200*ts;
        for (let k=0;k<4;k++){
          const p = this.makeBossPart(boss, def.pod.tex, def.pod.scale*boss.gp, 'pod', { hp:podHp, contact:10, score:25, body:def.pod.body || [40,40] });
          p.orbit = k;
        }
        boss.hp = coreHp + 4*podHp; boss.maxHp = boss.hp;
        boss.invuln = true; // le coeur est protégé tant qu'il reste des pods
        break;
      }
      case 'prisme': {
        for (let k=0;k<3;k++){
          const p = this.makeBossPart(boss, def.mirror.tex, def.mirror.scale*boss.gp, 'mirror', { hp:99999, invuln:true, contact:12, body:def.mirror.body || [46,46] });
          p.orbit = k;
        }
        boss.gfx = this.add.graphics(); boss.gfx.setDepth(4.6); boss.gfx.setBlendMode(Phaser.BlendModes.ADD);
        boss.mirrorAngle = 0;
        break;
      }
      case 'kraken': {
        boss.tentacles = [];
        boss.gfx = this.add.graphics(); boss.gfx.setDepth(4.7);       // dessine chaque bras d'un seul trait continu
        for (let k=0;k<4;k++){
          // un bras = une chaîne de boules ; la boule de BASE (dorée, près du corps) est le point faible :
          // la détruire fait disparaître tout le bras. Une boule coupée emporte aussi tout ce qui est après elle.
          const tn = { k, boss, N: boss.geo > 1.25 ? 5 : 6, ballHp:5*ts, baseHp:12*ts, segs:[], dead:false, regrow:0, spawning:false };
          boss.tentacles.push(tn);
          this.spawnTentacleSegs(boss, tn, 0);
        }
        break;
      }
      case 'eclipse': {
        if (BOSS_SPRITES.eclipse){                                                   // halo dessiné du vrai (visible seulement pendant le mirage)
          boss.halo = this.add.sprite(boss.x, boss.y, 'ecHalo'); boss.halo.play('ecHaloA');
          boss.halo.setDepth(4.9); boss.halo.setScale(boss.scaleX); boss.halo.setAlpha(0.95); boss.halo.setVisible(false);
        } else {
        boss.halo = this.add.image(boss.x, boss.y, 'shockRing');
        boss.halo.setDepth(4.9); boss.halo.setBlendMode(Phaser.BlendModes.ADD);
        boss.halo.setTint(0xcfa0ff); boss.halo.setScale(boss.displayWidth*1.5/256); boss.halo.setAlpha(0.45); boss.halo.setVisible(false);
        }
        break;
      }
      case 'hydre': {
        boss.headHp = 42*ts; boss.exhausted = false; boss.pendingHeads = 0;
        boss.gfx = this.add.graphics(); boss.gfx.setDepth(4.7);
        for (let i=0;i<3;i++) this.spawnHead(boss);
        boss.hp = 3*boss.headHp; boss.maxHp = boss.hp;
        boss.invuln = true; // le corps est intouchable: ce sont les têtes qu'il faut abattre
        break;
      }
    }
  },

  spawnTentacleSegs(boss, tn, from){
    const def = BOSS_DEFS.kraken;
    for (let i=(from||0); i<tn.N; i++){
      const isBase = i === 0;
      const sc = def.seg.scale * Math.min(boss.gp, 1.15) * (isBase ? 1.35 : (1 - i*0.05));
      const p = this.makeBossPart(boss, isBase ? 'krBase' : def.seg.tex, sc, 'seg', { hp: isBase ? tn.baseHp : tn.ballHp, contact:9, depth: isBase ? 4.9 : 4.8, body:[62,62] });
      p.tent = tn; p.idx = i;
      tn.segs.push(p);
    }
    tn.spawning = false;
  },

  // coupe un bras à partir de la boule `idx` : cette boule et tout ce qui la suit disparaissent (idx 0 = bras entier)
  cutTentacle(tn, idx){
    const boss = tn.boss;
    tn.segs = tn.segs.filter(sg=>{
      if (sg.idx >= idx){ if (sg.active){ this.partBoom(sg.x, sg.y); sg.destroy(); } return false; }
      return true;
    });
    if (boss) boss.parts = boss.parts.filter(q=>q.active);
    tn.dead = tn.segs.length === 0;
    tn.regrow = idx === 0 ? 8000 : 6000;                               // le bras repousse (plus vite s'il n'est coupé qu'en bout)
    if (idx === 0){ this.score += 30; sfx.tentacleCut(); this.cameras.main.shake(90, 0.005); }
  },

  spawnHead(boss){
    const def = BOSS_DEFS.hydre;
    const p = this.makeBossPart(boss, def.head.tex, def.head.scale*Math.min(boss.gp,1.3), 'head', { hp:boss.headHp, contact:10, score:20, body:def.head.body || [46,46] });
    p.x = boss.x; p.y = boss.y;
    return p;
  },

  // une abeille: l'essaim d'une poche de la Ruche
  ruBee(e){ if (!e) return e; e.setTexture('ruBee'); e.play('ruBeeA'); e.setScale(0.4); e.setFlipY(false); e.body.setSize(e.frame.realWidth*0.6, e.frame.realHeight*0.6); return e; },

  // une tête qui repousse: elle apparaît pendant l'animation de repousse (le moignon se transforme en cou)
  headRegrowFx(h){
    if (h) sfx.regrow();
    if (!h) return;
    h.setAlpha(0);
    const fx = this.add.sprite(h.x, h.y, 'hyRegrow').setDepth(5.6).setScale(0.8); fx.play('hyRegrowA'); h._fx = fx;
    fx.once('animationcomplete', ()=>{ if (h.active) h.setAlpha(1); fx.destroy(); h._fx = null; });
  },

  updateHydraLabel(boss){
    const n = boss.parts.filter(p=>p.active && p.partRole==='head').length + boss.pendingHeads;
    this.bossEls(boss).label.textContent = BOSS_DEFS.hydre.name + ' NIV.' + (this.difficultyTier+1) + ' · ' + n + (n>1?' TETES':' TETE') + (boss.phase >= 2 ? ' · PHASE ' + boss.phase : '') + (boss.exhausted ? ' · EPUISEE' : '');
  },

  // dégâts sur une partie de boss (pod, tête, miroir, tentacule, leurre)
  damageBossPart(p, amount){
    if (p.invuln){ this.blinkHit(p); return; }
    const boss = p.bossRef;
    if (p.partRole === 'seg'){
      const dealtSeg = Math.min(amount, Math.max(0, p.hp));       // seulement ce que la boule encaisse vraiment (pas l'excédent)
      p.hp -= amount;
      // 20% de ces dégâts "fuient" vers le corps: la barre de vie avance même quand on coupe les tentacules
      if (boss && boss.active && !boss.invuln) boss.hp = Math.max(1, boss.hp - dealtSeg*0.2);
      this.blinkHit(p);
      if (p.hp <= 0){ p.hp = 99999; this.cutTentacle(p.tent, p.idx); }
      return;
    }
    if (p.partRole === 'decoy'){ p.hp = 0; sfx.decoyPop({ pan:this.panOf(p.x) }); return; }
    const dealt = Math.min(amount, Math.max(0, p.hp));
    p.hp -= amount; sfx.hitHeavy({ pan:this.panOf(p.x) });
    if (boss && boss.active && (p.partRole === 'pod' || p.partRole === 'head')) boss.hp -= dealt;
    this.blinkHit(p);
  },

  onBossPartKilled(p){
    if (p.partRole === 'seg'){ this.cutTentacle(p.tent, p.idx); return; }   // (sécurité) une boule tuée par un autre chemin coupe aussi le bras
    const boss = p.bossRef;
    this.score += p.scoreValue || 10;
    this.partBoom(p.x, p.y);
    this.spawnHitParticles(p.x, p.y, 8);
    sfx.partBreak();
    this.cameras.main.shake(70, 0.004);
    const role = p.partRole, px = p.x, py = p.y;
    if (role === 'head'){                                                       // le moignon reste un instant, puis s'efface
      const st = this.add.sprite(px, py, 'hyStump').setDepth(5.5).setScale(0.8); st.play('hyStumpA');
      this.tweens.add({ targets: st, alpha: 0, delay: 600, duration: 700, onComplete: ()=> st.destroy() });
    }
    if (boss && boss.parts) boss.parts = boss.parts.filter(q=>q !== p && q.active);
    p.destroy();

    if (role === 'pod' || role === 'head'){
      for (let i=0;i<2;i++){
        const g = this.gems.create(px+Phaser.Math.Between(-12,12), py+Phaser.Math.Between(-12,12), 'gemM', 0);
        g.setDepth(3); g.setScale(1/GEM_SS); g.xpValue = 3; g.gemKind = 'gemM'; g.ph = Math.random()*6.2832; g.sparkF = 0;
        const bs = GEM_KINDS.gemM.s*GEM_SS*1.8; g.body.setSize(bs, bs, true); g.body.velocity.y = 30;
      }
    }
    if (!boss || !boss.active) return;

    if (role === 'decoy'){
      // un leurre touché éclate en tirs: il faut viser le vrai
      for (let i=0;i<10;i++) this.bossShot(px, py, (Math.PI*2/10)*i, 140);
    } else if (role === 'head'){
      const alive = boss.parts.filter(q=>q.active && q.partRole==='head').length;
      if (!boss.exhausted){
        // chaque tête abattue en fait repousser 2, jusqu'à 9 têtes: ensuite l'hydre est épuisée
        const spawnCount = Math.max(0, Math.min(2, 9 - (alive + boss.pendingHeads)));
        if (alive + boss.pendingHeads + spawnCount >= 9) boss.exhausted = true;
        boss.pendingHeads += spawnCount;
        for (let j=0;j<spawnCount;j++){
          this.time.delayedCall(650 + j*180, ()=>{
            if (!boss.active || !this.bossActive) return;
            boss.pendingHeads = Math.max(0, boss.pendingHeads - 1);
            this.headRegrowFx(this.spawnHead(boss));
            boss.hp += boss.headHp;
            boss.maxHp = Math.max(boss.maxHp, boss.hp);
            this.updateHydraLabel(boss);
          });
        }
      }
      this.updateHydraLabel(boss);
      if (alive === 0 && boss.exhausted && boss.pendingHeads === 0){ boss.hp = 0; this.killEnemy(boss); }
    }
  },

  cleanupBossParts(boss){
    (boss.parts || []).slice().forEach(p=>{ if (p && p.active){ this.partBoom(p.x, p.y); p.destroy(); } });
    boss.parts = [];
    if (boss.gfx){ boss.gfx.destroy(); boss.gfx = null; }
    if (boss.halo){ boss.halo.destroy(); boss.halo = null; }
  },

  // dégâts "globaux" sur un boss (bombe nucléaire): respecte les protections de chaque partie
  damageBossAll(boss, amount){
    this.applyDamageToEnemy(boss, amount);
    (boss.parts || []).slice().forEach(p=>{
      if (!p.active || p.partRole === 'seg' || p.partRole === 'mirror') return;
      this.applyDamageToEnemy(p, amount*0.5);
      if (p.hp <= 0) this.killEnemy(p);
    });
    if (boss.active && boss.hp <= 0) this.killEnemy(boss);
  },

  refreshBossBar(boss){
    const f = this.bossEls(boss).fill;
    f.style.width = Math.max(0, Math.min(100, boss.hp/boss.maxHp*100)) + '%';
    const ph = boss.phase || 1;
    f.className = 'boss-hp-fill' + (ph >= 3 ? ' p3' : (ph === 2 ? ' p2' : ''));     // la barre vire à l'orange puis au rouge qui palpite
  },

  // deux petits repères sur la barre: là où commencent la phase 2 et la phase 3
  setupBossTicks(boss){
    const tr = this.bossEls(boss).track; if (!tr) return;
    tr.querySelectorAll('.boss-tick').forEach(x=> x.remove());
    bossPhaseThresholds(this.alertLevel).forEach(t=>{ if (t === null) return; const i = document.createElement('i'); i.className = 'boss-tick'; i.style.left = (t*100) + '%'; tr.appendChild(i); });
  },

  // choisit le dessin du boss selon sa phase et son état (transition, plongeon, sonnée, seconde forme)
  syncBossArt(boss){
    const a = BOSS_SPRITES[boss.bossId]; if (!a) return;
    let want = (boss._second && a.second) ? a.second : a.phase[boss.phase || 1];
    if (boss.eState === 'mirage' && a.mirage) want = a.mirage;                  // l'Éclipse en mirage: image translucide
    if (boss._transUntil > this.time.now && a.trans) want = a.trans;
    else if (boss.fState === 'dive') want = a.dive;
    else if (boss.fState === 'groggy') want = a.stun;
    if (boss._artKey !== want){ boss._artKey = want; boss.play(want); if (a.secondScale && boss._baseScale) boss.setScale(boss._baseScale * (want === a.second ? a.secondScale : 1)); }
  },
});
