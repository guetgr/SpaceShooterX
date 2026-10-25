"use strict";
// Méthodes de GameScene — armes du joueur : tirs, missiles, drone, nuke, ciblage.
mixin(GameScene, {
  /* ---------- FIRE / BULLETS ---------- */
  firePlayerBullets(){
    const mode = this.stats.weaponMode;

    if (mode === 'shotgun'){
      const pellets = Math.max(3, this.stats.spreadCount + 1 + this.stats.shotgunExtraPellets);
      const spreadAngle = 10;
      const startOffset = -((pellets-1)/2) * spreadAngle;
      for (let i=0;i<pellets;i++){
        const rad = Phaser.Math.DegToRad(-90 + startOffset + i*spreadAngle);
        const b = this.playerBullets.create(this.player.x, this.player.y-20, 'bulletP2');
        b.setDepth(5);
        b.setScale(0.34);
        b.pierceLeft = this.stats.pierce;
        b.isShotgunPellet = true;
        b.damage = this.rollDamage(this.stats.damage*0.7);
        this.physics.velocityFromRotation(rad, this.stats.bulletSpeed*0.9, b.body.velocity);
      }
      sfx.laser();
      return;
    }

    if (mode === 'laserAuto'){
      let targets = this.findNearestEnemies(this.player.x, this.player.y, this.stats.laserPriority ? 40 : (this.reticuleOmniscientOwned ? 3 : 1));
      if (this.stats.laserPriority){ targets = targets.filter(e=> e.hp !== undefined).sort((a,b)=> a.hp - b.hp).slice(0, this.reticuleOmniscientOwned ? 3 : 1); }      // CIBLAGE PRIORITAIRE: les ennemis les plus faibles d'abord
      const n = Math.max(1, this.stats.spreadCount);
      for (let i=0;i<n;i++){
        const target = targets.length ? targets[i % targets.length] : null;
        const angle = target ? Phaser.Math.Angle.Between(this.player.x,this.player.y,target.x,target.y) : Phaser.Math.DegToRad(-90);
        const b = this.playerBullets.create(this.player.x, this.player.y-20, 'laser');
        b.setDepth(5);
        b.pierceLeft = 999;
        b.damage = this.rollDamage(this.getLaserDamage());
        this.physics.velocityFromRotation(angle, this.getLaserSpeed(), b.body.velocity);
        if (target && this.stats.laserLockBonus > 0){ b.lockTgt = target; b.lockTurn = 1.4*this.stats.laserLockBonus; b.lockSpd = this.getLaserSpeed(); }       // VERROUILLAGE+: le tir corrige sa trajectoire vers sa cible
      }
      sfx.laser();
      return;
    }

    const isLaser = mode === 'laser';
    const n = this.stats.spreadCount;
    const spreadAngle = n > 1 ? Math.min(14, 150/(n-1)) : 14; // degrees between shots (l'éventail se resserre quand il y a beaucoup de projectiles: jamais plus de 150°)
    const baseAngle = -90;
    const startOffset = -((n-1)/2) * spreadAngle;
    for (let i=0;i<n;i++){
      const angleDeg = baseAngle + startOffset + i*spreadAngle;
      const rad = Phaser.Math.DegToRad(angleDeg);
      const b = this.playerBullets.create(this.player.x, this.player.y-20, isLaser ? 'laser' : 'bulletP2');
      b.setDepth(5);
      if (!isLaser) b.setScale(0.34);
      b.pierceLeft = isLaser ? 999 : this.stats.pierce;
      b.damage = this.rollDamage(isLaser ? this.getLaserDamage() : this.stats.damage);
      const spd = isLaser ? this.getLaserSpeed() : this.stats.bulletSpeed;
      this.physics.velocityFromRotation(rad, spd, b.body.velocity);
    }
    sfx.laser();
  },

  getLaserDamage(){
    let d = this.stats.damage * 1.3 * (1 + this.stats.laserDamageBonus);
    if (this.laserDestructeurOwned && this.laserBeamTimer >= 2000) d *= 2;
    return d;
  },

  getLaserSpeed(){
    return this.stats.bulletSpeed * 1.4 * (1 + this.stats.laserSpeedBonus);
  },

  getEffectiveFireRate(){
    const od = this.odActive > 0 ? 1/(1 + 0.6*this.odPower()) : 1;              // overdrive: +60% de cadence
    if (this.stats.weaponMode === 'shotgun'){
      return this.stats.fireRate * Math.max(1.0, 1.6 - this.stats.shotgunRecoilReduction) * od;
    }
    return this.stats.fireRate * od;
  },

  rollDamage(base){
    if (this.odActive > 0) base *= 1 + (this.stats.odDmgMul - 1)*this.odPower();     // overdrive: dégâts x2 (plus avec SURCHAUFFE)
    if (Math.random() < this.stats.critChance) return base*2;
    return base;
  },

  findNearestEnemies(x, y, count){
    const list = [];
    this.enemies.children.iterate(e=>{
      if (!e || !e.active || e.phased || e.invuln || e.alpha < 0.25) return; // pas de visée sur les cibles intouchables
      if (!this.enemyOnScreen(e)) return;                                   // ni sur celles qu'on ne voit pas
      list.push(e);
    });
    list.sort((a,b)=> Phaser.Math.Distance.Between(x,y,a.x,a.y) - Phaser.Math.Distance.Between(x,y,b.x,b.y));
    return list.slice(0,count);
  },

  fireNuke(){
    sfx.nuke();
    this.cameras.main.flash(200, 255, 154, 61, false);
    this.time.delayedCall(500, ()=>{
      const targets = [];
      this.enemies.children.iterate(e=>{ if (e && e.active && e.enemyType!=='boss' && !e.isBossPart) targets.push(e); });
      targets.forEach(e=>{
        e.hp -= 80;
        this.spawnHitParticles(e.x, e.y, 6);
        if (e.hp <= 0) this.killEnemy(e);
      });
      (this.bosses || []).forEach(b=>{ if (b.active) this.damageBossAll(b, 80); });
      this.cameras.main.shake(300, 0.02);
      sfx.nukeBoom();
    });
  },

  fireSwarmMissile(){
    sfx.swarmMissile();
    const m = this.missiles.create(this.player.x, this.player.y-16, 'missile2');
    m.setDepth(5);
    m.setScale(0.3);
    m.damage = this.stats.damage*0.6;
    m.homing = true;
    m.pierceLeft = 0;
    m.setScale(0.7);
    m.body.velocity.y = -300;
    m.target = null;
  },

  updateDrone(delta){
    if (!this.droneSprites || !this.droneSprites.length) return;
    this.droneAngle += delta/600;
    const fireInterval = 900 * (this.stats.droneFireRateMul||1);
    this.droneSprites.forEach(d=>{
      const a = this.droneAngle + d.angleOffset;
      d.x = this.player.x + Math.cos(a)*44;
      d.y = this.player.y + Math.sin(a)*44;
      if (this.introActive || (this.sandbox && !this.sbFire)) d.fireTimer = Math.max(d.fireTimer, 300);
      d.fireTimer -= delta;
      if (d.fireTimer <= 0){
        d.fireTimer = fireInterval;
        const target = this.findNearestEnemies(d.x, d.y, 1)[0];
        if (target){
          sfx.droneShot();
          const b = this.playerBullets.create(d.x, d.y, 'bulletP2');
          b.setDepth(5);
          b.setScale(0.3);
          b.pierceLeft = 0;
          b.damage = this.stats.damage*0.5*(this.stats.droneDamageMul||1);
          const angle = Phaser.Math.Angle.Between(d.x,d.y,target.x,target.y);
          this.physics.velocityFromRotation(angle, 480, b.body.velocity);
        }
      }
    });
  },

  fireMissiles(){
    sfx.missile();
    const count = this.stats.missileCount;
    const isDroit = this.stats.missileType === 'droit';
    for (let i=0;i<count;i++){
      const offsetX = (i - (count-1)/2) * 14;
      const m = this.missiles.create(this.player.x+offsetX, this.player.y-16, 'missile2');
      m.setDepth(5);
      m.setScale(0.4);
      m.homing = !isDroit;
      m.pierceLeft = this.stats.missilePierce;
      m.napalm = this.stats.missileNapalm;
      m.blastRadius = 46 * (1 + this.stats.missileBlastBonus);
      m.damage = this.stats.damage*1.4*(1+this.stats.missileDamageBonus);
      m.body.velocity.y = -420*(1+this.stats.missileSpeedBonus);
      m.target = null;
      m.lockIndex = i;
    }
  },

  updateMissiles(delta){
    this.missiles.children.iterate(m=>{
      if (!m || !m.active || !m.homing) return;
      if (!m.target || !m.target.active){
        if (this.stats.missileMultiLock > 0){
          // chaque missile vise une cible différente parmi les (1 + niveau) plus proches
          const list = this.findNearestEnemies(m.x, m.y, 1 + this.stats.missileMultiLock);
          m.target = list.length ? list[(m.lockIndex||0) % list.length] : null;
        } else {
          m.target = this.findNearestEnemy(m.x, m.y);
        }
      }
      if (m.target && m.target.active){
        const angle = Phaser.Math.Angle.Between(m.x, m.y, m.target.x, m.target.y);
        this.physics.velocityFromRotation(angle, 380, m.body.velocity);
        m.rotation = angle + Math.PI/2;
      }
    });
  },

  findNearestEnemy(x,y){
    let best = null, bestDist = Infinity;
    this.enemies.children.iterate(e=>{
      if (!e || !e.active || !this.enemyOnScreen(e)) return;
      const d = Phaser.Math.Distance.Between(x,y,e.x,e.y);
      if (d < bestDist){ bestDist = d; best = e; }
    });
    return best;
  },
});
