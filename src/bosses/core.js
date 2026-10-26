"use strict";
// Méthodes de GameScene — boss : apparition, phases, tirs, barre de vie, victoire.
mixin(GameScene, {
  // éléments de la barre de vie d'un boss (1re barre ou 2e barre pour le double boss)
  bossEls(boss){
    const n = (boss && boss._barIdx === 2) ? '2' : ((boss && boss._barIdx >= 3) ? '3' : '');
    return { wrap:document.getElementById('boss-hp-wrap'+n), label:document.getElementById('bossLabel'+n), fill:document.getElementById('bossHpFill'+n), shTrack:document.getElementById('bossShTrack'+n), shFill:document.getElementById('bossShFill'+n), track:document.querySelector('#boss-hp-wrap'+n+' .boss-hp-track') };
  },

  // 10:00 : le premier DOUBLE BOSS (deux boss différents en même temps, chacun un peu moins costaud)
  spawnDoubleBoss(){
    sfx.doubleBoss();
    this.spawnBoss(undefined, { dx:-85, dbl:true });
    this.spawnBoss(undefined, { dx:85, dbl:true, twin:true });
    const bn = document.getElementById('boss-banner'), old = bn.textContent;
    bn.textContent = '! DOUBLE BOSS !'; bn.classList.add('show');
    this.time.delayedCall(1900, ()=>{ bn.classList.remove('show'); bn.textContent = old; });
  },

  spawnBoss(forceId, opts){
    opts = opts || {};
    this.bossActive = true;
    if (!opts.twin){
      this.bosses = [];
      // niveau de menace 3+: le terrain n'est plus nettoyé à l'arrivée du boss —
      // les mobs déjà présents continuent le combat en même temps que lui
      if (this.alertLevel < 3){
        this.enemies.clear(true, true);
      }
      this.enemyBullets.clear(true,true);
    }

    let id = (forceId && BOSS_DEFS[forceId]) ? forceId : this.nextBossId();
    if (opts.twin && !forceId && this.bosses.length){                 // le deuxième boss est toujours différent du premier
      for (let k=0; k<8 && id === this.bosses[0].bossId; k++) id = this.nextBossId();
      if (id === this.bosses[0].bossId) id = BOSS_ORDER.find(b=> b !== id);
    }
    const def = BOSS_DEFS[id];
    if (!opts.twin) music.setScene({ mode:'game', alert:this.alertLevel, boss:true, bossId:id });      // la musique de ce boss se prépare tout de suite

    // démarre juste sous la zone couverte par le HUD, quel que soit le zoom
    const visEnter = this.visibleYRange(0);
    const zB = this.cameras.main.zoom;
    const startY = visEnter.min + HUD_SAFE_Y/zB;
    const boss = this.enemies.create(GAME_W/2 + (opts.dx||0), startY, def.tex);
    boss.cx = GAME_W/2 + (opts.dx||0); boss._barIdx = (this.bosses||[]).length + 1;
    boss.setDepth(5); // au-dessus de ses propres tirs (depth 4), pour ne jamais se faire recouvrir par sa salve
    // plus on a dézoomé (niveau d'alerte haut), plus le boss est agrandi: il garde une taille à l'écran impressionnante
    const kz = Phaser.Math.Clamp(1/zB, 1, 1.8);
    boss.geo = (def.scale/(def.ref || def.scale)) * kz;   // facteur appliqué à toute la géométrie de ses pièces
    boss.gp = Math.min(boss.geo, 1.5);                    // facteur de taille des pièces (plafonné)
    boss.setScale(def.scale * kz);
    boss.setFlipY(def.flipY !== false);
    if (def.anim) boss.play(def.anim);
    if (def.tint) boss.setTint(def.tint);
    boss.enemyType = 'boss';
    boss.bossId = id;
    boss.parts = [];
    boss.contactDamage = 16;
    boss.body.setSize(def.body[0], def.body[1]);
    const bart = BOSS_SPRITES[id];
    if (bart){                                                   // sprites propres: même hauteur à l'écran que l'ancien dessin
      const of = this.textures.getFrame(def.tex, 0), nf = this.textures.getFrame(bart.tex0, 0);
      boss.setTexture(bart.tex0, 0); boss.setFlipY(!!bart.flipY); if (def.tint) boss.clearTint();
      boss.setScale((of.realHeight*def.scale) / nf.realHeight * bart.size * kz);
      boss.body.setSize(nf.realWidth*bart.body[0], nf.realHeight*bart.body[1]);
      boss.on('animationupdate', (anim, fr)=>{ if (boss.body && fr && fr.frame) boss.body.setOffset((fr.frame.realWidth - boss.body.sourceWidth)/2, (fr.frame.realHeight - boss.body.sourceHeight)/2); });
      boss._baseScale = boss.scaleX; boss._artKey = bart.phase[1]; boss.play(bart.phase[1]);
    }
    this.bossDmgMul = 1; // recalculé juste en dessous (nécessaire avant la création des parties)
    const baseA = Math.min(this.alertLevel, this.baseAlert || this.alertLevel);
    const bossTime = Math.pow(BOSS_RUN_ALERT_HP, Math.max(0, this.alertLevel - baseA)) * Math.pow(LATE_HP_GROWTH, Math.max(0, this.difficultyTier - 30));   // le boss suit la montée du niveau d'alerte en partie
    const tierStep = Math.min(BOSS_TIER_HP, 0.25 + 0.05*(this.alertLevel-1));        // aux bas niveaux les boss suivants gonflent moins vite (+25% par boss au niveau 1, +65% dès le niveau 9)
    const ts = (opts.dbl ? DOUBLE_BOSS_HP_MUL : 1) * bossTime * (1 + (this.bossesDefeated + 1)*tierStep) * BOSS_HP_BY_ALERT[Math.min(BOSS_HP_BY_ALERT.length-1, Math.max(0, baseA-1))] * ((this.lvDef && this.lvDef.hpMul) || 1);      // hpMul : réglage fin du niveau
    boss.ts = ts;
    this.bossDmgMul = Math.min(BOSS_DMG_CAP, (1 + this.difficultyTier*BOSS_TIER_DMG) * (1 + (this.alertLevel-1)*BOSS_ALERT_DMG)) * this.lateDmgMul() * ((this.lvDef && this.lvDef.dmgMul) || 1);
    boss.hp = def.hp*ts;
    boss.maxHp = boss.hp;
    boss.scoreValue = 300;
    boss.phaseTimer = 0;
    boss.entering = true;
    boss.restY = Math.max(185, visEnter.min + 150/zB);
    boss.body.velocity.y = 140; // entrée rapide: moins de temps passé potentiellement hors-champ
    boss.attackToggle = 0;
    boss.summonedAtHalf = false;
    this.initBossParts(boss, def, ts);

    sfx.bossAlert();
    document.getElementById('boss-banner').classList.add('show');
    this.bossEls(boss).label.textContent = def.name + ' NIV.' + (this.difficultyTier+1);
    this.setupBossTicks(boss);
    this.time.delayedCall(1400, ()=> document.getElementById('boss-banner').classList.remove('show'));

    const els = this.bossEls(boss);
    els.wrap.classList.add('show');
    els.fill.style.width = '100%';
    this.bosses.push(boss);
    if (!opts.twin) this.currentBoss = boss;
    return boss;
  },

  // sac de boss: tous passent une fois (ordre aléatoire) avant qu'un boss ne se répète
  nextBossId(){
    // le sac est conservé entre les parties (localStorage): le cycle continue d'une partie à l'autre
    if (!this.bossBag || !this.bossBag.length){
      const ids = BOSS_ORDER.slice();
      Phaser.Utils.Array.Shuffle(ids);
      if (ids[0] === this.lastBossId && ids.length > 1) ids.push(ids.shift());
      this.bossBag = ids;
    }
    const id = this.bossBag.shift();
    this.lastBossId = id;
    try { localStorage.setItem('ssx_bossbag_v1', JSON.stringify({ bag:this.bossBag, last:id })); } catch(e){ /* ignore */ }
    return id;
  },

  // création différée: on n'ajoute jamais au groupe d'ennemis pendant qu'il est parcouru (ça gelait le jeu)
  deferSpawn(fn){
    this.time.delayedCall(20, ()=>{ if (this.bossActive) fn(); });
  },

  bossPhase(boss){
    const r = boss.hp / boss.maxHp, th = bossPhaseThresholds(this.alertLevel);
    if (th[1] !== null && r <= th[1]) return 3;
    if (th[0] !== null && r <= th[0]) return 2;
    return 1;
  },

  // annonce visible d'un changement de phase: flash coloré, bandeau, onde de choc, teinte du boss, couleur de la barre
  bossPhaseChange(boss){
    const p = boss.phase, hot = p >= 3;
    this.cameras.main.flash(210, hot ? 255 : 255, hot ? 64 : 160, hot ? 96 : 64, false);
    this.cameras.main.shake(320, hot ? 0.013 : 0.008);
    sfx.phaseUp();
    this.startSlowmo(420, 0.5);
    this.juiceStop('bossPhase');
    const bn = document.getElementById('boss-banner');
    if (bn){
      const old = bn.textContent; bn.textContent = hot ? 'PHASE 3 : FUREUR !' : 'PHASE 2'; bn.classList.add('show');
      this.time.delayedCall(1500, ()=>{ bn.classList.remove('show'); bn.textContent = old; });
    }
    const ring = this.add.image(boss.x, boss.y, 'shockRing').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setTint(hot ? 0xff4060 : 0xffa040).setScale(0.2).setAlpha(0.95);
    this.tweens.add({ targets: ring, scaleX: 2.6, scaleY: 2.6, alpha: 0, duration: 750, ease: 'Quad.easeOut', onComplete: ()=> ring.destroy() });
    if (BOSS_SPRITES[boss.bossId]) boss._transUntil = this.time.now + 520;   // dessin de transition
    else boss.setTint(hot ? 0xffb4b4 : 0xffdcb4);                          // le boss prend une teinte chaude (puis rouge)
    const lb = this.bossEls(boss).label;
    if (lb) lb.textContent = lb.textContent.replace(/ · PHASE \d/, '') + ' · PHASE ' + p;
  },

  bossShot(x, y, ang, speed, o){
    if (this._empOn) return null;
    if (this._bLoad > BULLET_CAP) return null;   // trop de tirs à l'écran: on n'en ajoute plus
    o = o || {};
    const b = this.enemyBullets.create(x, y, o.tex || 'bossBullet2');
    b.setDepth(4);
    b.setScale(o.scale !== undefined ? o.scale : 0.22);
    if (o.frame !== undefined) b.setFrame(o.frame);
    if (o.tint) b.setTint(o.tint);
    if (!o.noRot) b.rotation = ang + Math.PI/2;
    b.damage = Math.round((o.damage || 7) * (this.bossDmgMul || 1));
    this.physics.velocityFromRotation(ang, this.eSpd(speed), b.body.velocity);
    if (o.homing){ b.homing = o.homing; b.speed = this.eSpd(speed); b.life = o.life || 5000; }
    return b;
  },

  // balles à tête chercheuse (spores de la Ruche): elles tournent doucement vers le joueur
  updateHomingBullets(delta){
    this.enemyBullets.children.iterate(b=>{
      if (!b || !b.active || !b.homing) return;
      b.life -= delta;
      if (b.life <= 0){ b.destroy(); return; }
      const want = Phaser.Math.Angle.Between(b.x, b.y, this.player.x, this.player.y);
      const cur = Math.atan2(b.body.velocity.y, b.body.velocity.x);
      const diff = Phaser.Math.Angle.Wrap(want - cur);
      const maxTurn = b.homing * (delta/1000);
      this.physics.velocityFromRotation(cur + Phaser.Math.Clamp(diff, -maxTurn, maxTurn), b.speed, b.body.velocity);
    });
  },

  // sortie des tirs: un peu sous le centre, proportionnelle à la taille affichée du sprite
  muzzleY(o){ return o.y + o.displayHeight*0.32; },

  aimFrom(x, y){ return Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y); },

  countEnemies(type){
    let n = 0;
    this.enemies.children.iterate(e=>{ if (e && e.active && e.enemyType === type) n++; });
    return n;
  },

  blinkHit(e){
    if (e._blinking) return;
    e._blinking = true;
    e.setAlpha(Math.max(0.35, e.alpha*0.55));
    this.time.delayedCall(60, ()=>{ if (e.active) e.setAlpha(1); e._blinking = false; });
  },

  partBoom(x, y){
    const art = ENEMY_ART.grunt;
    const boom = this.add.sprite(x, y, art.boomTex);
    boom.setDepth(6); boom.setScale(art.boomScale*1.3);
    boom.play(art.boom);
    boom.once('animationcomplete', ()=> boom.destroy());
  },

  updateBossAI(boss, delta){
    if (boss._secondT > 0) boss._secondT -= delta;
    if (boss.entering){
      if (boss.y >= boss.restY){ // marge confortable sous le HUD, même avec le sprite agrandi
        boss.y = boss.restY;
        boss.body.velocity.y = 0;
        boss.entering = false;
      }
      this.layoutBossParts(boss, delta);
      this.refreshBossBar(boss);
      this.syncBossArt(boss);
      return;
    }
    boss.phaseTimer += delta;
    boss.phase = this.bossPhase(boss);
    if (boss._lastPhase === undefined) boss._lastPhase = boss.phase;
    this.syncBossArt(boss);
    if (boss.phase > boss._lastPhase){ boss._lastPhase = boss.phase; this.bossPhaseChange(boss); }       // changement de phase: on le voit et on l'entend
    if (boss.phase >= 2){                                                                              // pouls coloré tant qu'on est en phase 2 ou 3
      boss._hb = (boss._hb || 0) - delta;
      if (boss._hb <= 0){
        boss._hb = boss.phase >= 3 ? 700 : 1250;
        const hb = this.add.image(boss.x, boss.y, 'shockRing').setDepth(3).setBlendMode(Phaser.BlendModes.ADD).setTint(boss.phase >= 3 ? 0xff4060 : 0xffa040).setScale(0.3).setAlpha(0.45);
        this.tweens.add({ targets: hb, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 650, ease: 'Quad.easeOut', onComplete: ()=> hb.destroy() });
      }
    }
    boss.cdMul = ((boss.phase >= 3 || boss.rage) ? 0.71 : 1) / (1 + 0.05*(this.alertLevel-1));   // + la cadence monte avec le niveau d'alerte (-5% de délai par niveau)   // phase 3 (niveau 5+) ou seconde forme: cadence +40%
    boss.dense = (this.alertLevel >= 6 ? Math.min(2.0, 1.4 + 0.06*(this.alertLevel-6)) : 1) + (boss.rage ? 0.4 : 0);   // niveau 6+ et seconde forme: attaques spéciales plus denses

    // renforts une fois par combat à mi-vie — différés pour ne jamais ajouter au groupe pendant qu'il est parcouru
    if (!boss.summonedAtHalf && boss.bossId !== 'ruche' && boss.bossId !== 'hydre' && boss.hp <= boss.maxHp*0.5){
      boss.summonedAtHalf = true;
      sfx.evElite();
      this.time.delayedCall(50, ()=>{
        if (!this.bossActive) return;
        this.spawnOneEnemy('grunt');
        this.spawnOneEnemy('grunt');
      });
    }

    const fn = this['bossAI_' + boss.bossId] || this.bossAI_dread;
    fn.call(this, boss, delta);
    this.layoutBossParts(boss, delta);
    this.refreshBossBar(boss);
  },

  onBossDefeated(boss){
    const ref = boss && boss.ref;
    this.bosses = (this.bosses || []).filter(b=> b !== ref && b.active);
    if (ref){ const e2 = this.bossEls(ref); if (e2.wrap) e2.wrap.classList.remove('show'); }
    const bx = boss && boss.x !== undefined ? boss.x : GAME_W/2, by = boss && boss.y !== undefined ? boss.y : 200;
    if (ref && ref.isBonus){                                                                 // boss bonus: pas de palier, pas de relique, pas de nouveau décor — juste une pluie de cristaux
      this.cameras.main.flash(220, 255, 206, 74, false); this.startSlowmo(450, 0.45); this.galaxyBlast(bx, by);
      for (let i=0;i<10;i++) this.spawnGemAt(bx + Phaser.Math.Between(-70, 70), by + Phaser.Math.Between(-30, 40), 6, 'gemL', Phaser.Math.Between(60, 120));
      if (this.bosses.length > 0) this.currentBoss = this.bosses.find(b=> !b.isBonus) || this.bosses[0];
      else { this.bossActive = false; this.currentBoss = null; this.spawnTimer = 500; }
      return;
    }
    if (boss && boss.id) (this._relicQueue = this._relicQueue || []).push(boss.id);          // les reliques s'enchaînent quand tous les boss sont tombés
    this.difficultyTier += 1; this.bossesDefeated += 1;
    if (this.bosses.some(b=> !b.isBonus)){                                                   // il reste un vrai boss: la partie continue
      this.currentBoss = this.bosses.find(b=> !b.isBonus);
      this.cameras.main.flash(220, 255, 206, 74, false); this.startSlowmo(450, 0.45);
      this.galaxyBlast(bx, by);
      return;
    }
    if (this.bosses.length > 0) this.currentBoss = this.bosses[0];                          // il ne reste qu'un boss bonus: le combat continue, mais la suite est déjà programmée
    else { this.bossActive = false; this.currentBoss = null; }
    if (this.lvDef){                                                                        // boss du monde vaincu : le niveau est gagné
      this.cameras.main.flash(300, 255, 206, 74, false); this.startSlowmo(650, 0.35); this.galaxyBlast(bx, by);
      this.levelWin();
      return;
    }
    this.nextBossAt = this.elapsed + Math.min(90, 45 + this.bossesDefeated*5);   // ~1 boss toutes les 1 min 30 au plus
    if (this.sandbox) this.nextBossAt = 1e9; else this.planEvents();
    if (this.stats.odBossCharge > 0) this.addOverdrive(this.stats.odBossCharge);   // SECOND SOUFFLE
    this.rerollsLeft += Math.round(this.stats.bossReroll || 0);   // BUTIN DE BOSS
    this.spawnTimer = 500;
    this.cameras.main.flash(300, 255, 206, 74, false);
    this.startSlowmo(650, 0.35);
    this.galaxyBlast(boss && boss.x !== undefined ? boss.x : GAME_W/2, boss && boss.y !== undefined ? boss.y : 200);
    this.pickBgZone(); // nouveau décor (planètes/nébuleuse) pour la zone suivante
    const rq = this._relicQueue || []; this._relicQueue = [];
    if (rq.length){ this._relicNext = rq.slice(1); this.time.delayedCall(1300, ()=> this.showRelicChoice(rq[0])); }   // reliques de boss (une par boss vaincu)
  },

  // boss bonus: un vrai boss en plus (jamais le même que celui en cours), plus fragile, qui ne compte pas dans la progression
  spawnBonusBoss(){
    if (this.bosses.length >= 2 || this.bosses.some(b=> b.isBonus)) return;
    const used = this.bosses.map(b=> b.bossId), ids = BOSS_ORDER.filter(i=> used.indexOf(i) < 0);
    const id = ids[Phaser.Math.Between(0, ids.length - 1)], twin = this.bosses.length > 0;
    const boss = this.spawnBoss(id, { twin, dbl:true, dx: twin ? (this.bosses[0].x < GAME_W/2 ? 110 : -110) : 0 });
    if (!boss) return;
    boss.isBonus = true;
    const bn = document.getElementById('boss-banner'), old = bn.textContent;
    bn.textContent = '! BOSS BONUS !'; bn.classList.add('show');
    this.time.delayedCall(1700, ()=>{ bn.classList.remove('show'); bn.textContent = old; });
  },

  // SECONDE FORME: un boss à terre se relève à 30% de PV, plus enragé (une fois par combat, niveau d'alerte 4+)
  bossSecondForm(boss){
    boss._second = true; boss.rage = true; boss._transUntil = this.time.now + 900;
    boss.hp = boss.maxHp * 0.3; boss._secondT = 1400;
    this.cameras.main.flash(260, 255, 60, 60, false);
    this.cameras.main.shake(380, 0.012);
    sfx.secondForm();
    this.startSlowmo(700, 0.4);
    this.juiceStop('bossSecond');
    const bn = document.getElementById('boss-banner');
    const old = bn.textContent;
    bn.textContent = 'SECONDE FORME !';
    bn.classList.add('show');
    this.time.delayedCall(1700, ()=>{ bn.classList.remove('show'); bn.textContent = old; });
    this.partBoom(boss.x, boss.y);
  },
});
