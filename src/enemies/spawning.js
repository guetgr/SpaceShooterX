"use strict";
// Méthodes de GameScene — apparition des ennemis et des vagues.
mixin(GameScene, {
  /* ---------- SPAWNING ---------- */
  spawnEnemy(){
    if (this.lvDef && this.lvDef.timelineOnly === 1) return;
    // niveau d'alerte élevé = les types d'ennemis plus vicieux arrivent plus tôt
    const t = this.elapsed + (this.alertLevel-1)*12;
    // pool of available types grows over time — more variety the longer you survive
    const pool = [];
    if (this.lvDef && this.lvDef.spawns){            // niveau avec sa propre liste d'ennemis
      this.lvDef.spawns.forEach(sp=>{ if (this.lvDef.spawnClock === 'difficulty' ? t > sp.from : this.lvT >= sp.from) pool.push({ type:sp.type, w: sp.w || (SPAWN_TABLE.find(x=> x.type === sp.type) || { w:10 }).w }); });
      if (!pool.length) return;
    } else SPAWN_TABLE.forEach(sp=>{ if (t > sp.at) pool.push({ type:sp.type, w:sp.w }); });

    if (this._onlySpiders){ pool.length = 0; pool.push({ type:'spider', w:1 }); }      // événement forêt d'araignées
    const totalW = pool.reduce((a,p)=>a+p.w, 0);
    let roll = Math.random()*totalW;
    let type = 'grunt';
    for (const p of pool){
      if (roll < p.w){ type = p.type; break; }
      roll -= p.w;
    }

    // swarmers show up in a little pack that grows bigger the longer you survive
    let count = 1;
    if (type === 'swarmer'){
      const base = 2 + Math.floor((t-80)/45);
      count = Phaser.Math.Clamp(base + Phaser.Math.Between(0,1), 2, 7);
    }
    // le kamikaze vient à plusieurs aux hauts niveaux ; les araignées viennent TOUJOURS en groupe serré (elles tissent entre elles)
    if (type === 'kamikaze') count = this.alertLevel >= 7 ? 3 : (this.alertLevel >= 4 ? 2 : 1);
    if (type === 'spider')   count = this.alertLevel >= 8 ? 4 : (this.alertLevel >= 4 ? 3 : 2);
    let cx = null;
    if (type === 'spider'){ const vx = this.visibleXRange(150); cx = Phaser.Math.Between(vx.min, vx.max); }
    for (let i=0;i<count;i++){
      this.spawnOneEnemy(type, cx === null ? undefined : cx + (i-(count-1)/2)*Phaser.Math.Between(55,75));
    }
  },

  spawnOneEnemy(type, xOverride){
    if (this.enemies.countActive(true) >= ENEMY_HARD_CAP) return null;   // plafond absolu (fluidité)
    // certains ennemis se balancent latéralement après leur spawn — on leur laisse
    // assez de marge pour que le wobble ne les sorte pas de la zone visible (zoom)
    const wobbleMargin = { drone:46, swarmer:70, bomber:40, sat:40, satgun:34, bras:36, pilleur:40, eclaireur:64 }[type] || 0;
    const vis = this.visibleXRange(30 + wobbleMargin);
    let x = (xOverride !== undefined) ? Phaser.Math.Clamp(xOverride, vis.min, vis.max) : Phaser.Math.Between(vis.min, vis.max);
    const art = ENEMY_ART[type];
    const spawnY = this.visibleYRange(0).min - 30;
    if (this._corr && this._corr.on) x = this.corrClampX(x, spawnY);
    const e = this.enemies.create(x, spawnY, art ? art.tex : type);
    e.setDepth(4);
    e.enemyType = type;
    if (art){
      e.setScale(art.scale);
      e.setFlipY(art.flipY !== false); // les anciens sprites regardent vers le haut (on les retourne); les sprites 8 bits sont déjà dessinés vers le bas
      if (art.anim) e.play(art.anim);
      if (art.then){ e._arriving = true; e.once('animationcomplete', ()=>{ e._arriving = false; if (e.active) e.play(art.then); }); }     // animation d'arrivée, puis animation normale
      { const minD = 14 / (e.scaleX || 1);                     // zone de collision minimale de 14 px: les très petits ennemis restent touchables
        e.body.setSize(Math.max(art.body[0], minD), Math.max(art.body[1], minD)); }
      // quand le dessin change (arrivée, charge, fondu...), le corps de collision reste centré sur le dessin
      e.on('animationupdate', (anim, fr)=>{ if (e.body && fr && fr.frame) e.body.setOffset((fr.frame.realWidth - e.body.sourceWidth)/2, (fr.frame.realHeight - e.body.sourceHeight)/2); });
      if (art.bulletTex){ e.bulletTex = art.bulletTex; e.bulletScale = art.bulletScale; }
    } else {
      e.body.setSize(e.width*0.7, e.height*0.7);
    }

    const hpScale = this.hpScaleNow();
    const speedScale = 1 + this.difficultyTier*0.08;

    const st = enemyStat(type, this.lvDef);
    if (type === 'grunt'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'shooter'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(140,260);
      e.fireCd = Phaser.Math.Between(900,1700);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'drone'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.wobble = Math.random()*1000;
      e.baseX = x;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'tank'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
      e.stopY = Phaser.Math.Between(180,320);
      e.fireCd = Phaser.Math.Between(1400,2200);
    } else if (type === 'swarmer'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.wobble = Math.random()*1000;
      e.baseX = x;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'diver'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
      const angle = Phaser.Math.Angle.Between(x, spawnY, this.player.x, this.player.y);
      this.physics.velocityFromRotation(angle, enemyVy(st, speedScale), e.body.velocity);
      e.setFlipY(false);
      e.rotation = angle + Math.PI/2;
    } else if (type === 'turret'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(100,180);
      e.fireCd = Phaser.Math.Between(800,1400);
      e.burstLeft = 0;
    } else if (type === 'splitter'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'splitterMini'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'shieldedGrunt'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.shieldHp = st.shield*hpScale; e.shieldMaxHp = e.shieldHp;
      e.shieldRegenDelay = 0;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'mine'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.mineDropTimer = Phaser.Math.Between(2200, 3200);
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'sat'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.baseX = x; e.driftX = Phaser.Math.Between(-18, 18); e.ph = Math.random()*6.28; e.wobble = 0;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'satgun'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.baseX = x; e.ph = Math.random()*6.28; e.wobble = 0;
      e.stopY = Phaser.Math.Between(120, 200);
      e.fireCd = Phaser.Math.Between(1500, 2200);
      e.charging = false;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'bras'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.baseX = x; e.ph = Math.random()*6.28; e.wobble = 0;
      e.stopY = Phaser.Math.Between(120, 190);
      this.brasInit(e);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'pilleur'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.baseX = x; e.ph = Math.random()*6.28; e.wobble = 0;
      e.stopY = Phaser.Math.Between(110, 170);
      this.pilInit(e);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'eclaireur'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.baseX = x; e.ph = Math.random()*6.28; e.wobble = 0;
      e.stopY = Phaser.Math.Between(120, 190);
      this.ecInit(e);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'bomber'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.wobble = Math.random()*1000;
      e.baseX = x;
      e.fireCd = Phaser.Math.Between(1600,2200);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'sniper'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(110,190);
      e.fireCd = Phaser.Math.Between(1600,2400);
      e.telegraphing = false;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'healer'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.wobble = Math.random()*1000;
      e.baseX = x;
      e.pulseCd = 3000;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'ghost'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.wobble = Math.random()*1000;
      e.baseX = x;
      e.phaseCd = 1500;
      e.phased = false;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'elite'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(150,240);
      e.fireCd = Phaser.Math.Between(1200,1800);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'mothership'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(120,200);
      e.spawnCd = 3000;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'vortex'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(160,260);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'golden'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'kamikaze'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.kState = 'drift'; e.kT = 0; e.baseX = x;
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;        // les dégâts viennent de son explosion, pas du contact
    } else if (type === 'spider'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(130,240);
      e.baseX = x; e.sway = Math.random()*6;
      e.fireCd = Phaser.Math.Between(1500,2500);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    } else if (type === 'charo'){
      e.hp = st.hp*hpScale; e.maxHp = e.hp;
      e.body.velocity.y = enemyVy(st, speedScale);
      e.stopY = Phaser.Math.Between(130,250);
      e.fireCd = Phaser.Math.Between(800,1500);
      e.scoreValue = st.score;
      e.contactDamage = st.dmg;
    }

    // niveau 4+ : une partie des mobs entre par les côtés et traverse l'écran (de quoi te faire bouger)
    if (this.alertLevel >= 4 && xOverride === undefined && FLANK_TYPES.indexOf(type) >= 0 && Math.random() < Math.min(0.5, 0.06*(this.alertLevel-3))){
      const vxF = this.visibleXRange(0), vyF = this.visibleYRange(0);
      const side = Math.random() < 0.5 ? -1 : 1;
      e.x = side < 0 ? vxF.min - 24 : vxF.max + 24;
      const Hs = vyF.max - vyF.min, frac = Phaser.Math.Clamp(0.14 + 0.035*(this.alertLevel-4), 0.14, 0.5);   // niveau 4: tout en haut ... niveau 14+: jusqu'à la moitié de l'écran
      e.y = vyF.min + Phaser.Math.Between(50, Math.max(110, Math.round(Hs*frac)));
      e.body.velocity.x = -side * Phaser.Math.Between(70, 120);
      e.flank = true;
    }

    if (e.stopY !== undefined) e.stopY = Math.max(e.stopY, this.visibleYRange(0).min + 60);   // on ne se gare jamais au ras du bord haut

    // niveau 5+: un petit bouclier (teinte bleutée) qu'il faut percer avant d'atteindre la coque; plus il monte, plus il est gros (jusqu'à 70% des PV)
    if (this.alertLevel >= 8 && ASHIELD_EXCL.indexOf(type) < 0){
      // niveau 8+: vrai bouclier visible (bulle autour du sprite), proportionnel aux PV, au niveau d'alerte et au niveau du joueur; se régénère après un délai
      const pool = e.hp * (0.3 + 0.12*(this.alertLevel-8)) * (1 + 0.04*((this.level||1)-1));
      e.shieldHp = pool; e.shieldMaxHp = pool; e.shieldRegenDelay = 0; e._gShield = true; e._aShield = true;
    } else if (this.alertLevel >= 5 && NO_SHIELD_TYPES.indexOf(type) < 0){
      e.shieldHp = e.hp * Math.min(0.7, 0.12*(this.alertLevel-4));
      e._gShield = true;
      e.setTint(0xb8ecff);
    }

    // à partir du niveau d'alerte 2 le premier tir part quasi tout de suite
    // (le sniper garde son tir télégraphié, qui demande qu'il soit à l'arrêt)
    if (e.fireCd !== undefined && type !== 'sniper' && this.alertLevel >= 2){
      e.fireCd = Phaser.Math.Between(80, this.alertLevel >= 3 ? 350 : 700);
    }
    return e;
  },
});
