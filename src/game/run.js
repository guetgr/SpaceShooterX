"use strict";
// Méthodes de GameScene — cycle d'une partie : démarrage, reprise, fin, mort du joueur.
mixin(GameScene, {
  // reprise d'une partie en cours (bouton CONTINUER): on ne touche ni au zoom ni à la position du vaisseau,
  // mais le niveau d'alerte est recalculé — si des compétences ont été achetées entre-temps, il suit l'arbre
  resumeRun(){
    const lvl = effectiveAlert(this.meta);
    if (!this.lvDef && lvl !== this.baseAlert){
      this.baseAlert = lvl;
      this.alertLevel = Math.min(ALERT_CAP, lvl + (this.alertRises||0));
      this.weaponTier = weaponTierFor(this.alertLevel);
    }
    music.setIntensity(this.alertLevel);
    document.getElementById('start').classList.add('hidden');
    this.physics.world.resume();
    this.running = true;
    music.start();
    this.updateHud(true);
  },

  startRun(){
    document.getElementById('start').classList.add('hidden');
    this.endNebula(true); sfx.setNebula(false); sfx._nebOn = false; sfx.setHole(0); this._bgBoost = 1;
    this.curSmall = null; this.smallCd = Phaser.Math.Between(20000, 35000);
    this.evPlan = [];                 // aucun GROS événement avant le 1er boss (en DEV, le menu TEST permet de tous les lancer à la main)
    this._onlySpiders = false; this.cameras.main.setRotation(0); if (this._vortex){ this._vortex.destroy(); this._vortex = null; } this._frenzyUntil = 0;
    this.physics.world.resume();
    this.running = true;
    this.cameras.main.setZoom(ZOOM_START);
    this.cameras.main.centerOn(GAME_W/2, GAME_H/2);
    this.fitBgToView();
    // collection: les compétences de l'arbre possédées passent en "utilisées" dès qu'on lance une partie avec
    { let ch = false; Object.keys(this.treeState||{}).forEach(k=>{ if (this.treeState[k] > 0 && !this.codex.usedSkills[k]){ this.codex.usedSkills[k] = 1; ch = true; } }); if (ch) setCodex(this.codex); }
    const vy0 = this.visibleYRange(0);
    this.player.y = vy0.max - 90/ZOOM_START;
    this.playerTarget.y = this.player.y;
    // DECOLLAGE: le vaisseau monte depuis le bas de l'écran (1,5 s), commandes verrouillées et vaisseau protégé, le temps que la musique s'adapte
    this.introEndY = this.player.y; this.introStartY = vy0.max + 70/ZOOM_START; this.introMidY = (vy0.min + vy0.max)/2; this.player.y = this.introStartY;
    this.introActive = true; this.introT = 0; this._introFx = 0; this._introApex = false;
    this.hitCooldown = Math.max(this.hitCooldown, 3200); this.spawnTimer = Math.max(this.spawnTimer, 3200);
    this._introEarth = !this.sandbox && this.textures.exists('earth') && (!this.lvDef || this.lvDef.intro === 'earth');          // DECOLLAGE DEPUIS LA TERRE (jeu normal); le bac à sable garde le décollage court
    if (this._introEarth){
      this.player.y = this.introEndY; this.introEarthInit();
      this.hitCooldown = Math.max(this.hitCooldown, INTRO_E_TOTAL + 400); this.spawnTimer = Math.max(this.spawnTimer, INTRO_E_A + INTRO_E_B);
    }
    sfx.launch(); Motion.hudIn(); this._lvShown = undefined; this._scShown = undefined; this.normaStart();
    Motion.uncover();                      // le rideau de transition (accueil → niveau) se rouvre
    music.setIntensity(this.alertLevel); music.setMood(1, 0); music.rate = 1; music.dimNow = 0;
    music.setScene({ mode:'game', alert:this.alertLevel, boss:false, tutoLevel:!!this.tuto, fast:true });
    music.start();
    this._lowMood = false;
    if (this.sandbox){ this._double1 = true; this.nextBossAt = 1e9; this.evPlan = []; this.goldCd = 1e9; this.sbFire = false; this.sbAI = true; this.sbGod = true; this.buildSandboxUI(); }
    else this.destroySandboxUI();
    if (this.tuto){ this.nextBossAt = 1e9; this.evPlan = []; this.goldCd = 1e9; this.smallCd = 1e9; this.eventCd = 1e9; this._double1 = true; this.tutoInit(); }
  },

  // victory = objectif du niveau atteint (levelWin) ; sinon le vaisseau est détruit
  endRun(victory, abandon){
    if (this.tuto){ this.tutoPlayerDied(); return; }
    this.bankCombo(false);
    this.running = false;
    this.hasActiveRun = false;
    this.physics.world.pause();
    music.stop();
    if (!victory && !abandon) this.playerDeathFx();  // le vaisseau explose; le jingle et l'écran de fin viennent après
    if (this.achv) setAchv(this.achv);   // on enregistre les compteurs de succès en fin de partie
    if (this.bestiaryDirty){ setBestiary(this.bestiary); this.bestiaryDirty = false; }
    const hs = getHighScore();
    const isNew = this.score > hs;
    if (isNew) setHighScore(Math.floor(this.score));

    let fragmentsEarned = Math.round((Math.max(1, Math.round(Math.floor(this.score/15) * (1+this.stats.fragmentBonus))) + Math.floor(this.runFragBonus)) * (this.pactBonusMul || 1));
    if (this.lvDef) fragmentsEarned = Math.max(1, Math.round(fragmentsEarned * LEVEL_FRAG_MUL));      // niveaux courts et rejouables : revenu de combat réduit
    // niveau d'un monde : une victoire est enregistrée (déblocages) et ajoute sa récompense ; une défaite garde tous les fragments gagnés
    let clearBonus = 0, rec = null;
    if (this.lvDef && victory){
      rec = recordLevelClear(this.lvDef.id, this.score);
      clearBonus = this.lvDef.reward.clear + (rec && rec.first ? (this.lvDef.reward.first || 0) : 0);
      fragmentsEarned += clearBonus;
    }
    const nxt = (this.lvDef && victory) ? nextLevelOf(this.lvDef.id) : null;
    this.lvResult = { victory: !!victory, rec, clearBonus, progress: this.lvDef ? (victory ? 1 : this.levelProgress().frac) : 0, next: nxt && isLevelUnlocked(nxt.id) ? nxt.id : null };
    this.meta.fragments += fragmentsEarned;
    setMeta(this.meta);

    // classement local : la partie est enregistrée avec le dernier pseudo utilisé (modifiable juste après)
    this.lastEntryId = Date.now() + '-' + Math.floor(Math.random()*1e6);
    if (!this.lvDef) addLeaderboardEntry({
      id:this.lastEntryId, name: sanitizeName(getPlayerName()) || 'ANONYME',
      score: Math.floor(this.score), level:this.level, time:Math.floor(this.elapsed),
      alert:this.alertLevel, date:Date.now()
    });

    // ce qui t'a échappé de peu: PV restants du boss, prochain boss, succès presque débloqués
    const ex = document.getElementById('goExtra');
    ex.innerHTML = '';
    const addLine = (txt, cls)=>{ const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = txt; ex.appendChild(d); };
    if (this.pacts && this.pacts.length) addLine('CLAUSES SPECIALES (' + this.pacts.length + ') · composants x' + this.pactBonusMul.toFixed(2), 'go-near');
    addLine('SERIE MAXIMALE x' + this.runBestCombo + ' · RANG ' + STYLE_RANKS[this.runBestRank].l);
    addLine('CHAINE MAXIMALE x' + this.runMaxChain + (this.runGold ? ' · TRESORINS ' + this.runGold : ''));
    if (this.bossActive && this.currentBoss && this.currentBoss.active){
      const pc = Math.max(1, Math.round(this.currentBoss.hp / this.currentBoss.maxHp * 100));
      addLine('L\'incident majeur était encore actif à ' + pc + ' %...', 'go-boss');
    } else if (this.nextBossAt - this.elapsed > 0 && this.nextBossAt - this.elapsed <= 25){
      addLine('Le prochain incident majeur arrivait dans ' + Math.ceil(this.nextBossAt - this.elapsed) + ' s...', 'go-boss');
    }
    const near = [];
    const achvA = this.achv;
    ACHV_GLOBALS.forEach(g=>{ if (!achvA.glob[g.id]){ const pr = achvGlobalProgress(achvA, g); if (pr/g.need >= 0.5 && pr < g.need) near.push({ name:g.name, pr:Math.floor(pr), need:g.need, ratio:pr/g.need, time:g.kind==='maxTime' }); } });
    ACHV_TYPES.forEach(t=>{ const tier = achvA.tier[t]||0; if (tier < 3){ const w = achvWeighted(achvA, t), thr = achvThreshold(t, tier); if (w/thr >= 0.6) near.push({ name:'DETONATEUR ' + ((BESTIARY_LIST.find(e=>e.type===t)||{label:t}).label) + ' ' + ['I','II','III'][tier], pr:Math.floor(w), need:thr, ratio:w/thr }); } });
    near.sort((a,b)=> b.ratio - a.ratio).slice(0,3).forEach(n=>{
      const f = v => n.time ? Math.floor(v/60) + ':' + String(v%60).padStart(2,'0') : v;
      addLine('PRESQUE : ' + n.name + ' ' + f(n.pr) + ' / ' + f(n.need), 'go-near');
    });
    document.querySelector('#gameover .go-title').textContent = victory ? 'INTERVENTION VALIDEE' : (abandon ? 'ORDRE ANNULE' : 'ACCIDENT DU TRAVAIL');
    Norma.reset();
    document.getElementById('finalScore').textContent = Math.floor(this.score);
    document.getElementById('finalLvl').textContent = this.level;
    const m = Math.floor(this.elapsed/60), s = Math.floor(this.elapsed%60);
    document.getElementById('finalTime').textContent = m+':'+String(s).padStart(2,'0');
    // en-tête du niveau, barre d'objectif, détail des récompenses, déblocages, boutons
    { const goEl = document.getElementById('gameover'), L = this.lvDef, res = this.lvResult;
      goEl.classList.toggle('win', !!victory);
      document.getElementById('finalKills').textContent = this.runKills;
      document.getElementById('goLevel').textContent = L ? ('SECTEUR ' + worldById(L.world).name + ' · ORDRE ' + String(L.num).padStart(2, '0') + ' — ' + L.name) : '';
      document.getElementById('rpNo').textContent = 'N° ' + (L ? agpDossier(L) : 'AGP-' + String(Math.floor(this.score) % 100000).padStart(5, '0'));
      { const g = STYLE_RANKS[this.runBestRank].l, gr = document.getElementById('rpGrade'); gr.textContent = g; gr.style.setProperty('--gc', STYLE_RANKS[this.runBestRank].col); document.getElementById('rpMention').textContent = AGP_LORE.grades[g] || '';
        document.getElementById('rpNorma').textContent = Norma.report(victory ? 'win' : (abandon ? 'abort' : 'lose'), g); }
      const pr = document.getElementById('goProg'); pr.classList.toggle('hidden', !L);
      if (L){ document.getElementById('goProgFill').style.width = Math.round(res.progress*100) + '%'; document.getElementById('goProgTxt').textContent = Math.round(res.progress*100) + '%'; }
      const rw = document.getElementById('goRewards'); rw.innerHTML = '';
      const addRw = (label, val, cls)=>{ const d = document.createElement('div'); d.className = 'go-rw' + (cls ? ' ' + cls : ''); d.innerHTML = '<span></span><b></b>'; d.firstChild.textContent = label; d.lastChild.textContent = val; rw.appendChild(d); };
      if (clearBonus){
        addRw('Collecte en combat', '+' + (fragmentsEarned - clearBonus) + ' ◆');
        addRw('Prime d\'intervention', '+' + this.lvDef.reward.clear + ' ◆');
        if (rec.first && this.lvDef.reward.first) addRw('Prime de 1re validation', '+' + this.lvDef.reward.first + ' ◆');
        addRw('TOTAL', '+' + fragmentsEarned + ' ◆', 'total');
      } else addRw('Collecte en combat', '+' + fragmentsEarned + ' ◆', 'total');
      const unl = (txt)=>{ const d = document.createElement('div'); d.className = 'go-unlock'; d.textContent = txt; rw.appendChild(d); };
      if (rec && rec.unlockedLevel) unl('▶ ORDRE SUIVANT ATTRIBUE');
      if (rec && rec.unlockedWorld) unl('★ NOUVEAU SECTEUR : ' + worldById(rec.unlockedWorld).name);
      if (victory && L && !nxt) unl('FIN DES ORDRES (pour l\'instant)');
      const bn = document.getElementById('btnNext'), br = document.getElementById('btnRetry');
      bn.classList.toggle('hidden', !res.next);
      br.classList.toggle('secondary', !!res.next);      // victoire avec une suite: SUIVANT est le bouton principal
    }
    document.getElementById('newBest').classList.toggle('hidden', !isNew);
    // l'écran de fin n'apparaît (en fondu) qu'une fois l'explosion du vaisseau passée
    clearTimeout(this.deathTimer);
    this.deathTimer = setTimeout(()=>{
      const go = document.getElementById('gameover');
      go.classList.remove('hidden'); go.classList.remove('fadein'); void go.offsetWidth; go.classList.add('fadein');
      Motion.result(go, { victory:!!victory });
    }, victory ? 700 : (abandon ? 150 : 1800));
  },

  // MORT DU VAISSEAU: grosse explosion, petites explosions décalées, ondes de choc, débris, ralenti et vignette rouge
  playerDeathFx(){
    const px = this.player.x, py = this.player.y;
    const kz = Phaser.Math.Clamp(1/this.cameras.main.zoom, 1, 2.2);       // les effets grossissent quand on dézoome
    this.player.setVisible(false);
    if (this.shieldAura) this.shieldAura.setVisible(false);
    if (this.shipDmgGfx) this.shipDmgGfx.clear();
    this.startSlowmo(1200, 0.35);
    this.cameras.main.flash(260, 255, 255, 255, false);
    this.cameras.main.shake(700, 0.022);
    const v = document.getElementById('redVig');
    if (v){ v.classList.remove('show'); void v.offsetWidth; v.classList.add('show'); }
    // explosion principale
    const bart = ENEMY_ART.boss;
    const big = this.add.sprite(px, py, bart.boomTex).setDepth(15).setScale(bart.boomScale*1.5*kz);
    big.play(bart.boom); big.once('animationcomplete', ()=> big.destroy());
    // petites explosions qui éclatent autour, l'une après l'autre
    const gart = ENEMY_ART.grunt;
    for (let i=0;i<7;i++){
      this.time.delayedCall(70 + i*110, ()=>{
        const b = this.add.sprite(px + Phaser.Math.Between(-26,26)*kz, py + Phaser.Math.Between(-26,26)*kz, gart.boomTex).setDepth(14).setScale(gart.boomScale*Phaser.Math.FloatBetween(1.3,2.1)*kz);
        b.play(gart.boom); b.once('animationcomplete', ()=> b.destroy());
        this.spawnHitParticles(b.x, b.y, 4);
      });
    }
    // ondes de choc
    [[0xffffff, 300, 520],[0xffa040, 480, 820]].forEach(([tint, size, dur], i)=>{
      const ring = this.add.image(px, py, 'shockRing').setDepth(14).setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setScale(0.1).setAlpha(0.95);
      this.tweens.add({ targets:ring, scaleX:size*kz/256, scaleY:size*kz/256, duration:dur, delay:i*140, ease:'Quad.easeOut' });
      this.tweens.add({ targets:ring, alpha:0, duration:dur*0.7, delay:i*140 + dur*0.3, onComplete:()=> ring.destroy() });
    });
    // débris de la coque (aux couleurs du vaisseau) qui partent dans tous les sens en tournoyant
    const cols = [0xff4d5a, 0xe8f0ff, 0x38c6ff, 0xffa040];
    for (let i=0;i<22;i++){
      const sz = Phaser.Math.Between(3,6)*kz;
      const d = this.add.rectangle(px, py, sz, sz*Phaser.Math.FloatBetween(0.6,1.6), cols[i % cols.length]).setDepth(15);
      const a = Math.random()*6.2832, dist = Phaser.Math.Between(70, 230)*kz;
      this.tweens.add({ targets:d, x:px + Math.cos(a)*dist, y:py + Math.sin(a)*dist + 30*kz, angle:Phaser.Math.Between(-540, 540), alpha:0,
        duration:Phaser.Math.Between(900, 1500), ease:'Cubic.easeOut', onComplete:()=> d.destroy() });
    }
    sfx.playerDeath();
    setTimeout(()=> sfx.boomBig(), 220);
    setTimeout(()=> sfx.gameover(), 1000);
  },
});
