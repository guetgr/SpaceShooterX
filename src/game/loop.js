"use strict";
// Méthodes de GameScene — boucle principale update().
mixin(GameScene, {
  update(time, delta){
    // ralenti: il se termine sur l'HORLOGE RÉELLE, et pendant qu'il dure tout le temps de jeu est ralenti
    // (Phaser ne ralentit pas le delta de update tout seul)
    if (this.slowmo){
      if (performance.now() >= this.slowmo.until) this.endSlowmo();
      else delta *= this.slowmo.scale;
    }
    // starfield always moves (even on menu) for ambience
    // overdrive: le décor accélère en douceur (étoiles qui filent en traînées, planètes qui glissent plus vite), puis ralentit à la fin
    { const tgt = (this.odActive > 0 && this.running) ? 7 : 1; this._bgBoost = (this._bgBoost||1) + (tgt - (this._bgBoost||1)) * Math.min(1, delta/1000 * (tgt > 1 ? 4 : 2.2)); if (Math.abs(this._bgBoost - tgt) < 0.01) this._bgBoost = tgt; }
    const bgB = this._bgBoost || 1, bgStretch = 1 + (bgB - 1) * 0.75;
    this.stars.forEach(s=>{
      s.y += s.speed * bgB * (delta/1000);
      if (s.scaleY !== bgStretch) s.setScale(1, bgStretch);
      if (s.y > GAME_H+STAR_PAD_Y) { s.y = -STAR_PAD_Y; s.x = Phaser.Math.Between(-STAR_PAD_X,GAME_W+STAR_PAD_X); }
    });
    this.updateBgDecor(delta);
    if (this.bestiaryDirty){
      this.bestiarySaveCd = (this.bestiarySaveCd === undefined ? 2000 : this.bestiarySaveCd) - delta;
      if (this.bestiarySaveCd <= 0){ setBestiary(this.bestiary); this.bestiaryDirty = false; this.bestiarySaveCd = 2000; }
    }
    if (this.achvDirty){
      this.achvSaveCd -= delta;
      if (this.achvSaveCd <= 0){ setAchv(this.achv); this.achvDirty = false; this.achvSaveCd = 4000; }
    }

    if (!this.running) return;

    // une fois par seconde: meilleure durée / meilleur niveau de partie pour les succès
    this.achvSecCd -= delta;
    if (this.achvSecCd <= 0){
      this.achvSecCd = 1000;
      const a = this.achv;
      a.maxTime = Math.max(a.maxTime || 0, Math.floor(this.elapsed + 1));
      a.maxLevel = Math.max(a.maxLevel || 0, this.level);
      a.maxAlert = Math.max(a.maxAlert || 0, this.alertLevel);
      this._odK = 0;
      this.achvDirty = true;
      this.achvCheck(null);
    }

    if (this.xp >= this.xpToNext) this.levelUp();   // XP créditée directement (cristaux au-delà du plafond)

    // mob doré et événements aléatoires
    this.goldCd -= delta; this.eventCd -= delta;
    if (this.goldCd <= 0){
      this.goldCd = Phaser.Math.Between(45000, 80000);
      if (!this.bossActive && this.elapsed > 25) this.spawnGolden();
    }
    this.updateEventPlan();
    this.updateEvent(delta);
    this.updateSmallEvents(delta);
    if (DEV_SEE_ALL) this.updateDevEventHud(delta);
    if (this.neb) this.updateNebula(delta);
    this.updateFrenzyHalos();
    this.updateMusicMood(delta);

    this.elapsed += delta/1000;
    if (!this.bossActive && this.alertLevel < ALERT_CAP){
      this.alertTimer += delta/1000;
      if (this.alertTimer >= ALERT_RISE_SECONDS) this.raiseAlert();
    }
    this.updateDifficulty();

    // progressively dezoom from a close-in start to the full field, revealing
    // more room for enemies as the run goes on
    const zTarget = this.computeZoom(), zCur = this.cameras.main.zoom;
    const zoom = Math.abs(zTarget - zCur) > 0.2 ? zTarget : zCur + (zTarget - zCur) * Math.min(1, delta/600);   // le dézoom suit la montée d'alerte en douceur
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(GAME_W/2, GAME_H/2);

    // move player toward target — frame-rate independent smoothing
    const prevX = this.player.x;
    const smoothT = (1 - Math.exp(-this.stats.moveResponsiveness * (delta/1000))) * (this._ice ? (this.odActive > 0 ? 0.16 : 0.33) : 1);
    this.player.x = Phaser.Math.Linear(this.player.x, this.playerTarget.x, smoothT);
    if (this._ice && !this.introActive){ this.player.x += (this._iceVx || 0) * (this.odActive > 0 ? 0.95 : 0.6); this._iceVx = this.player.x - prevX; const vr = this.visibleXRange(10); this.player.x = Phaser.Math.Clamp(this.player.x, vr.min, vr.max); }
    if (this.introActive && this._introEarth){
      this.introT += delta;
      this.introEarthUpdate(delta);
    } else if (this.introActive){
      // DECOLLAGE en 3 temps: 1,2 s de montée jusqu'au milieu de l'écran, 0,2 s d'arrêt (onde de choc), 1,1 s de redescente jusqu'à sa place
      this.introT += delta;
      const UP = 1200, HOLD = 200, DOWN = 1100, T = this.introT;
      let dir = 1, power = 1;
      if (T < UP){
        const k = T / UP, e = 1 - Math.pow(1 - k, 3);                                      // arrive vite puis freine
        this.player.y = this.introStartY + (this.introMidY - this.introStartY) * e; power = 1 - k;
      } else if (T < UP + HOLD){
        this.player.y = this.introMidY; dir = 0;
        if (!this._introApex){ this._introApex = true; this.introApex(); }
      } else {
        const k = Math.min(1, (T - UP - HOLD) / DOWN), e = k < 0.5 ? 2*k*k : 1 - 2*(1-k)*(1-k);   // départ et arrivée en douceur
        this.player.y = this.introMidY + (this.introEndY - this.introMidY) * e; dir = -1; power = 0.8 * Math.sin(Math.PI * k) + 0.2;
      }
      this.hitCooldown = Math.max(this.hitCooldown, 300);
      this._introFx -= delta; if (this._introFx <= 0 && dir !== 0 && T < UP + HOLD + DOWN * 0.95){ this._introFx = 50; this.introTrail(power, dir); }
      if (T >= UP + HOLD + DOWN){ this.player.y = this.introEndY; this.introActive = false; this.playerTarget.y = this.introEndY; this.hitCooldown = Math.max(this.hitCooldown, 700); this.introLanding(); }
    } else {
      this.player.y = Phaser.Math.Linear(this.player.y, this.playerTarget.y, smoothT);
    }

    // bank the ship toward its movement direction for a bit of juice

    // aura de bouclier : suit le vaisseau (position + inclinaison), pulse doucement
    this.shieldAura.setPosition(this.player.x, this.player.y);
    this.shieldAura.setAngle(this.player.angle);
    const odOn = this.odActive > 0;      // overdrive actif: bouclier jaune invincible (même sans bouclier normal)
    if (odOn || this.shield > 0){
      const pulse = Math.sin(time/(odOn ? 110 : 200));
      this.shieldAura.setVisible(true);
      if (odOn){
        this.shieldAura.setTintFill(0xffd24a);
        this.shieldAura.setAlpha(0.7 + pulse*0.25);
        this.shieldAura.setScale(PLAYER_SHIP_SCALE * (1.08 + 0.03*pulse));
      } else {
        this.shieldAura.clearTint();
        this.shieldAura.setAlpha(0.6 + pulse*0.25);
        this.shieldAura.setScale(PLAYER_SHIP_SCALE * (1 + 0.012*pulse));
      }
    } else {
      this.shieldAura.setVisible(false);
      this.shieldAura.clearTint();
    }

    // engine trail
    this.engineTrailTimer -= delta;
    if (this.engineTrailTimer <= 0){
      this.engineTrailTimer = 45;
      this.spawnEngineTrail();
    }

    this.updateShipDamage(delta);

    if (this.dodgeInvuln > 0) this.dodgeInvuln -= delta;

    if (this.hitCooldown > 0){
      this.hitCooldown -= delta;
      this.player.setAlpha(Math.floor(this.hitCooldown/60)%2===0 ? 0.45 : 1);
    } else if (this.dodgeInvuln > 0){
      this.player.setAlpha(0.5);
    } else {
      this.player.setAlpha(1);
    }

    // fire
    if (this.stats.weaponMode === 'laser' || this.stats.weaponMode === 'laserAuto'){
      this.laserBeamTimer += delta;
    } else {
      this.laserBeamTimer = 0;
    }
    if (this.introActive || this._empOn || (this.sandbox && !this.sbFire)){          // pas un tir pendant le décollage (ni en bac à sable quand le tir est coupé): tout démarre juste après l'atterrissage
      this.fireTimer = Math.max(this.fireTimer, 250); this.missileFireTimer = Math.max(this.missileFireTimer || 0, 700);
      this.nukeTimer = Math.max(this.nukeTimer || 0, 3000); this.swarmMissileTimer = Math.max(this.swarmMissileTimer || 0, 700);
    }
    this.fireTimer -= delta;
    if (this.fireTimer <= 0){
      this.fireTimer = this.getEffectiveFireRate();
      this.firePlayerBullets();
    }

    // missiles (secondary weapon, auto-guided)
    if (this.stats.missileCount > 0){
      this.missileFireTimer -= delta;
      if (this.missileFireTimer <= 0){
        this.missileFireTimer = 1400 * this.stats.missileFireRateMul;
        this.fireMissiles();
      }
      this.updateMissiles(delta);
    }

    // nuclear missile cap — periodic devastating straight-line strike
    if (this.nukeOwned){
      this.nukeTimer -= delta;
      if (this.nukeTimer <= 0){
        this.nukeTimer = 9000;
        this.fireNuke();
      }
    }

    // swarm of auto-missiles cap — small continuous homing stream
    if (this.swarmMissilesOwned){
      this.swarmMissileTimer -= delta;
      if (this.swarmMissileTimer <= 0){
        this.swarmMissileTimer = 900;
        this.fireSwarmMissile();
      }
    }

    // satellite drone cap — orbits the ship and auto-fires
    if (this.droneOwned && !this._empOn){
      this.updateDrone(delta);
    }

    if (this.sandbox && this.sbGod){ this.hp = this.stats.maxHp; this.hitCooldown = Math.max(this.hitCooldown, 500); }
    // shield regen — Halo-style: pauses a moment after taking a hit, then refills smoothly
    if (this.stats.shieldMax > 0 && this.shield < this.stats.shieldMax){
      if (this.shieldRegenDelay > 0){
        this.shieldRegenDelay -= delta * (this.odActive > 0 ? 2 : 1);   // overdrive: le bouclier se régénère 2x plus vite (délai et recharge)
      } else {
        const regenRate = this.stats.shieldMax / 2.5 * (this.odActive > 0 ? 2 : 1); // full refill in ~2.5s once it starts
        this.shield = Math.min(this.stats.shieldMax, this.shield + regenRate*(delta/1000));
      }
    }

    // spawn
    if (!this.bossActive && !this.sandbox){
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0){
        this.spawnTimer = this.getSpawnInterval();
        // plafond d'ennemis à l'écran: au-delà on ne spawn plus (fluidité sur téléphone)
        if (this.enemies.countActive(true) < ENEMY_CAP){
          this.spawnEnemy();
          // niveau 4+ : des vagues plus fournies (1 spawn bonus au 4-5, 2 au 6... plafonné à 4)
          let extra = Math.min(4, Math.max(0, Math.floor((this.alertLevel-2)/2))) + (this.pacts && this.pacts.indexOf('p_foule') >= 0 ? 2 : 0);
          // l'écran se vide parce que tu les tues avant qu'ils n'apparaissent ? Plus il y a de vide, plus il en arrive (jusqu'à 8 bonus)
          const alive = this.enemies.countActive(true);
          if (this.alertLevel >= 5 && alive < 80) extra = Math.min(8, extra + 2 + Math.floor((80-alive)/25));
          for (let i=0;i<extra;i++){ if (Math.random() < 0.6) this.spawnEnemy(); }
        }
      }
      const dueDouble = !this._double1 && this.elapsed >= 600;                    // 10:00 : le premier double boss
      if ((this.elapsed >= this.nextBossAt || dueDouble) && !this.curEvent){
        if (dueDouble){ this._double1 = true; this.spawnDoubleBoss(); } else this.spawnBoss();
      }
    }

    // magnet gems & heals
    this.gems.children.iterate(g=>{
      if (!g) return;
      // scintillement + léger battement
      const sf = Math.round(Math.max(0, Math.sin(time/520 + g.ph))*3);
      if (sf !== g.sparkF){ g.sparkF = sf; g.setFrame(sf, false, false); }
      if (this.gems.getLength() <= 70) g.setScale((1/GEM_SS) * (1 + 0.05*Math.sin(time/260 + g.ph)));
      const d = Phaser.Math.Distance.Between(g.x,g.y,this.player.x,this.player.y);
      if (d < this.stats.magnetRadius || this.elapsed < (this._magnetUntil||0)){
        this.physics.moveToObject(g, this.player, this.elapsed < (this._magnetUntil||0) ? 430 : 260);       // TEMPETE MAGNETIQUE: tout vient à toi
      }
    });
    this.heals.children.iterate(h=>{
      if (!h) return;
      const d = Phaser.Math.Distance.Between(h.x,h.y,this.player.x,this.player.y);
      if (d < this.stats.magnetRadius || this.elapsed < (this._magnetUntil||0)){
        this.physics.moveToObject(h, this.player, this.elapsed < (this._magnetUntil||0) ? 430 : 260);
      }
    });

    // auto-collect pulse — periodically vacuums every gem on screen
    if (this.stats.autoCollect > 0){
      this.autoCollectTimer -= delta;
      if (this.autoCollectTimer <= 0){
        this.autoCollectTimer = 8000;
        this.gems.children.iterate(g=>{
          if (g && g.active) this.physics.moveToObject(g, this.player, 420);
        });
        this.spawnHitParticles(this.player.x, this.player.y, 10);
      }
    }

    // passive HP regeneration
    if (this.stats.hpRegenPct > 0 && this.hp < this.stats.maxHp){
      this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.maxHp*this.stats.hpRegenPct*(delta/1000));
    }

    // cleanup offscreen
    if (!this.introActive) this.updateSkills(delta);                    // les compétences automatiques (tonnerre, pulsar...) attendent la fin du décollage
    this.updateOverdrive(delta);
    this.updateStyleHud(delta);
    this.cleanupGroup(this.playerBullets, 40);
    this.cleanupGroup(this.missiles, 60);
    this.cleanupGroup(this.enemyBullets, 40);
    this.cleanupGroup(this.enemies, 60, true);
    this.cleanupGroup(this.gems, 80);
    this.cleanupGroup(this.heals, 80);

    // enemy behaviours
    this.enemies.children.iterate(e=>{
      if (!e || !e.active) return;
      if (this.sandbox && !this.sbAI){ if (e.body) e.body.setVelocity(0, 0); return; }          // bac à sable: IA coupée = tout est figé
      if (this._empOn && e.fireCd !== undefined) e.fireCd = Math.max(e.fireCd, 400);           // EMP: plus aucun ennemi ne tire
      if (this._ecl){ if (e._lastFc !== undefined && e.fireCd > e._lastFc + 100) e._lit = 450; e._lastFc = e.fireCd; }
      this.updateEnemyAI(e, delta);
    });
    this.updateSquads(delta);
    this.updateEnemyShields(delta);
    this.updateDodge(delta);
    this.updateForces(delta);
    { // DERAPAGE: l'avant du camion part dans le sens du déplacement RÉEL (après murs / trous noirs), avec un ressort qui dépasse puis revient.
      // Aux réacteurs de base: gros dérapage (angle large, ressort mou = survirage et balancement, fumée). Avec les réacteurs, il se redresse: angle faible, ressort sec, plus de fumée.
      const rdt = Math.max(0.001, delta/1000), px = this.player.x, lastPx = (this._lastPx === undefined ? px : this._lastPx); this._lastPx = px;
      this._vxs = Phaser.Math.Linear(this._vxs || 0, (px - lastPx) / rdt, 1 - Math.exp(-rdt*22));          // vitesse latérale lissée
      const vx = this._vxs, slip = Phaser.Math.Clamp(1 - (this.stats.moveResponsiveness - 11)/22, 0.08, 1);
      const maxA = 6 + 22*slip, target = Phaser.Math.Clamp(vx * 0.06 * (0.5 + slip), -maxA, maxA);
      const kS = 120 + 280*(1 - slip), zeta = 0.38 + 0.57*(1 - slip);
      let w = this._angVel || 0, a = this.player.angle;
      for (let rem = Math.min(rdt, 0.12); rem > 0; rem -= 0.012){ const h = Math.min(rem, 0.012); w += (kS*(target - a) - 2*zeta*Math.sqrt(kS)*w) * h; a += w*h; }
      if (a > 40){ a = 40; w = Math.min(w, 0); } else if (a < -40){ a = -40; w = Math.max(w, 0); }
      this._angVel = w; this.player.angle = a;
      this.shieldAura.setPosition(this.player.x, this.player.y); this.shieldAura.setAngle(this.player.angle);
      // fumée de dérapage: seulement quand ça glisse vraiment (peu de réacteurs), jamais pendant le décollage
      this._skidT = (this._skidT || 0) - delta;
      if (!this.introActive && slip > 0.3 && Math.abs(a) > 0.5*maxA && Math.abs(vx) > 140 && this._skidT <= 0 && this.player.active){
        this._skidT = 45 + 90*(1 - slip);
        const rad = Phaser.Math.DegToRad(a), rx0 = this.player.x - Math.sin(rad)*20, ry0 = this.player.y + Math.cos(rad)*20;
        const sm = this.add.image(rx0 + Phaser.Math.Between(-3, 3), ry0, 'shockRing').setDepth(8.5).setTint(0xaeb8d0).setAlpha(0.32*slip + 0.08).setScale(0.03);
        this.tweens.add({ targets: sm, scaleX: 0.1 + 0.06*slip, scaleY: 0.1 + 0.06*slip, alpha: 0, x: sm.x - Math.sign(vx)*14, y: sm.y + 8, duration: 380, onComplete: ()=> sm.destroy() });
      } }
    // OVERDRIVE: le vaisseau fonce — le décor file (étoiles, planètes) ET tout ce qui vient vers nous descend plus vite, comme si on s'en approchait plus vite.
    // Le tempo du jeu (armes, cadences, minuteurs) ne change pas.
    { const ob = Math.max(0, ((this._bgBoost || 1) - 1) / 6);
      if (ob > 0.02){
        const dy = ob * 240 * delta/1000;
        this.enemies.children.iterate(e=>{ if (e && e.active && e.enemyType !== 'boss' && !e.isBossPart) e.y += dy * 0.8; });
        this.enemyBullets.children.iterate(b=>{ if (b && b.active) b.y += dy; });
        this.gems.children.iterate(g=>{ if (g && g.active) g.y += dy; });
        this.heals.children.iterate(h=>{ if (h && h.active) h.y += dy; });
      } }
    this._bLoad = this.enemyBullets.getLength();
    this.updateHomingBullets(delta);
    this.updateWebs(delta);

    this.updateHud(false);
  },

  cleanupGroup(group, margin, skipBoss){
    const vx = this.visibleXRange(-margin), vy = this.visibleYRange(-margin);
    group.children.iterate(o=>{
      if (!o) return;
      if (skipBoss && (o.enemyType === 'boss' || o.isBossPart)) return; // boss + ses parties gèrent leurs propres limites
      if (o.y < vy.min || o.y > vy.max || o.x < vx.min || o.x > vx.max){
        o.destroy();
      }
    });
  },
});
