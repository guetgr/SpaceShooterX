"use strict";
// Méthodes de GameScene — comportement des ennemis : déplacement, tirs, esquive, mines, bombes, soigneur.
mixin(GameScene, {
  // cooldown de tir : se raccourcit avec le niveau d'alerte (à équilibrer plus tard)
  // vitesse des tirs ennemis: +3,5% par niveau au-dessus du 6 (+31% au niveau 15)
  eSpd(v){ return v * (1 + 0.035*Math.max(0, this.alertLevel-6)) * (this.pacts && this.pacts.indexOf('p_rapide') >= 0 ? 1.25 : 1); },

  rollFireCd(a, b, tierMul){
    const lin = 1 - 0.09*(this.alertLevel-1), mulA = lin > 0.25 ? lin : 0.25*Math.pow(0.93, this.alertLevel - 10.1);   // au-delà du niveau 10 la cadence continue d'augmenter (sans plancher)
    const mul = mulA * (this.pacts && this.pacts.indexOf('p_rapide') >= 0 ? 0.7 : 1);
    // trop de tirs déjà à l'écran (> 500): les ennemis ralentissent leur cadence pour garder le jeu fluide
    const load = this._bLoad || 0;
    const throttle = load > 500 ? 1 + (load-500)/500 : 1;
    return Math.max(60, (Phaser.Math.Between(a,b) - this.difficultyTier*tierMul) * mul * throttle);
  },

  // niveau d'alerte 2+: enemies that "stop then shoot" start firing a bit before
  // they've fully settled into position, instead of waiting to be stationary
  inFiringPosition(e){
    if (e.body.velocity.y === 0) return true;
    if (this.alertLevel < 2) return false;
    // niveau 3+ : ils tirent dès qu'ils apparaissent
    if (this.alertLevel >= 3) return true;
    // niveau 2 : dès qu'ils entrent dans la zone visible, sans attendre d'être en place
    return e.y >= this.visibleYRange(0).min;
  },

  // nombre de tirs simultanés selon le weaponTier (1=base, 2="secondaire", 3="3e tir")
  spreadOffsets(count){
    if (count <= 1) return [0];
    const span = 0.22 + (count-1)*0.07;
    const offs = [];
    for (let i=0;i<count;i++) offs.push(-span + (2*span*i)/(count-1));
    return offs;
  },

  enemyShootSpread(e, count){
    sfx.spreadShot({ pan:this.panOf(e.x) });
    if (!this.player.active || this._bLoad > BULLET_CAP) return;
    const baseAngle = this.leadAngle(e, 210);
    this.spreadOffsets(count).forEach(off=>{
      const b = this.enemyBullets.create(e.x, e.y+14, e.bulletTex || 'bulletE');
      b.setDepth(4);
      b.damage = 7;
      const ang = baseAngle + off;
      if (e.bulletTex){
        b.setScale(e.bulletScale);
        b.rotation = ang + Math.PI/2;
        b.body.setSize(b.width*0.5, b.width*0.5);
      }
      this.physics.velocityFromRotation(ang, this.eSpd(210), b.body.velocity);
    });
  },

  // image rémanente cyan laissée derrière un ennemi qui esquive, pour que ça se VOIE
  spawnDodgeGhost(e){
    if (!e.texture || !e.frame) return;
    const g = this.add.image(e.x, e.y, e.texture.key, e.frame.name);
    g.setScale(e.scaleX, e.scaleY); g.setFlipX(e.flipX); g.setFlipY(e.flipY); g.setRotation(e.rotation);
    g.setDepth(3); g.setTint(0x66e0ff); g.setBlendMode(Phaser.BlendModes.ADD); g.setAlpha(0.55);
    this.tweens.add({ targets:g, alpha:0, duration:280, onComplete:()=> g.destroy() });
  },

  // niveau d'alerte 4+: les ennemis stationnaires esquivent les tirs du joueur
  // qui les menacent directement; la réactivité augmente avec le niveau (6 = "de ouf")
  tryDodgePlayerBullets(e, delta){
    if (this.alertLevel < 4) return;
    if (e.dodgeTargetX !== undefined){
      e.x = Phaser.Math.Linear(e.x, e.dodgeTargetX, 0.12);
      e.ghostCd = (e.ghostCd||0) - delta;
      if (e.ghostCd <= 0){ e.ghostCd = 45; this.spawnDodgeGhost(e); }
      if (Math.abs(e.x - e.dodgeTargetX) < 2) e.dodgeTargetX = undefined;
    }
    e.dodgeCd = (e.dodgeCd||0) - delta;
    if (e.dodgeCd > 0) return;
    e.dodgeCd = 150;
    const lookAhead = Math.min(340, this.alertLevel >= 6 ? 260 + 10*(this.alertLevel-6) : 170);
    let threat = null;
    this.playerBullets.children.iterate(b=>{
      if (!b || !b.active || threat) return;
      if (Math.abs(b.x - e.x) < 26 && b.y > e.y && (b.y - e.y) < lookAhead && b.body.velocity.y < 0){
        threat = b;
      }
    });
    if (!threat) return;
    const chance = this.alertLevel >= 6 ? Math.min(0.98, 0.9 + 0.01*(this.alertLevel-6)) : 0.45;
    if (Math.random() > chance) return;
    const dir = (e.x < GAME_W/2) ? 1 : -1;
    const dodgeDist = Phaser.Math.Between(50,80) * dir;
    e.dodgeTargetX = Phaser.Math.Clamp(e.x + dodgeDist, 30, GAME_W-30);
    e.dodgeCd = this.alertLevel >= 6 ? Math.max(220, 450 - 25*(this.alertLevel-6)) : 900;
  },

  updateEnemyAI(e, delta){
    if (e.enemyType === 'shooter'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){
        e.body.velocity.y = 0;
      }
      this.tryDodgePlayerBullets(e, delta);
      if (this.inFiringPosition(e)){
        e.fireCd -= delta;
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(1000,1800,60);
          this.enemyShootSpread(e, this.weaponTier);
        }
      }
    } else if (e.enemyType === 'drone'){
      e.wobble += delta;
      e.x = e.baseX + Math.sin(e.wobble/260)*46;
      // niveau d'alerte 3+: drone débloque son tir secondaire (son tout premier tir)
      if (this.weaponTier >= 2){
        e.fireCd = (e.fireCd===undefined) ? Phaser.Math.Between(1400,2200) : e.fireCd - delta;
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(1400,2200,40);
          this.enemyShootSpread(e, this.weaponTier-1);
        }
      }
    } else if (e.enemyType === 'swarmer'){
      e.wobble += delta;
      e.x = e.baseX + Math.sin(e.wobble/160)*70;
    } else if (e.enemyType === 'tank'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){
        e.body.velocity.y = 0;
      }
      this.tryDodgePlayerBullets(e, delta);
      if (this.inFiringPosition(e)){
        e.fireCd -= delta;
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(1600,2400,60);
          this.enemyShootHeavy(e);
          // "tir secondaire"/"3e tir": des tirs légers en plus du tir lourd
          if (this.weaponTier > 1) this.enemyShootSpread(e, this.weaponTier-1);
        }
      }
    } else if (e.enemyType === 'turret'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){ e.body.velocity.y = 0; }
      this.tryDodgePlayerBullets(e, delta);
      if (this.inFiringPosition(e)){
        e.fireCd -= delta;
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(1300,1900,40);
          e.burstLeft = [3,5,7][this.weaponTier-1];
        }
        if (e.burstLeft > 0){
          e.burstTimer = (e.burstTimer||0) - delta;
          if (e.burstTimer <= 0){
            e.burstTimer = 140;
            this.enemyShoot(e);
            e.burstLeft -= 1;
          }
        }
      }
    } else if (e.enemyType === 'bomber'){
      e.wobble += delta;
      e.x = e.baseX + Math.sin(e.wobble/300)*40;
      this.tryDodgePlayerBullets(e, delta);
      e.fireCd -= delta;
      if (e.fireCd <= 0){
        e.fireCd = this.rollFireCd(1800,2400,40);
        // "tir secondaire"/"3e tir": largue plusieurs bombes d'affilée
        for (let i=0;i<this.weaponTier;i++){
          this.time.delayedCall(i*140, ()=>{ if (e.active) this.dropBomb(e); });
        }
      }
    } else if (e.enemyType === 'sat'){
      e.wobble += delta;
      e.baseX += e.driftX * delta/1000;
      e.x = e.baseX + Math.sin(e.wobble/1100 + e.ph)*24; e.rotation = Math.sin(e.wobble/1600 + e.ph)*0.2;
      const f = e.hp / e.maxHp, fr = f > 0.8 ? 0 : f > 0.62 ? 1 : f > 0.46 ? 2 : f > 0.32 ? 3 : f > 0.18 ? 4 : 5;      // l'état du satellite suit sa vie
      if (e._fr !== fr){ e._fr = fr; e.setFrame(fr); }
    } else if (e.enemyType === 'bras'){
      this.brasUpdate(e, delta);
    } else if (e.enemyType === 'pilleur'){
      this.pilUpdate(e, delta);
    } else if (e.enemyType === 'eclaireur'){
      this.ecUpdate(e, delta);
    } else if (e.enemyType === 'satgun'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0) e.body.velocity.y = 0;
      const stopped = e.body.velocity.y === 0;
      if (stopped){ e.wobble += delta; e.x = e.baseX + Math.sin(e.wobble/900 + e.ph)*16; }
      const f = e.hp / e.maxHp, hurt = f <= 0.85;
      if (hurt && !e._recoil){                                            // abîmé : image fixe selon la vie (9 états), la lueur de charge devient une teinte
        const fr = 9 + Math.min(8, Math.floor((1 - f) / 0.85 * 9));
        if (e._fr !== fr){ e._fr = fr; e.anims.stop(); e.setFrame(fr); }
      }
      this.tryDodgePlayerBullets(e, delta);
      if (stopped){
        e.fireCd -= delta;
        if (!e.charging && e.fireCd <= 800){
          e.charging = true; sfx.snipeCharge && sfx.snipeCharge({ pan:this.panOf(e.x) });
          if (hurt) e.setTint(0x9fd8ff); else e.play('satgunCharge');
          e._chg = this.mtFx('mtFxCharge', 'mtCharge', e.x, e.y + 32, 0.45, { depth:6 });          // charge de plasma animée à l'embouchure (la parabole du bas)
        }
        if (e._chg && e._chg.active) e._chg.setPosition(e.x, e.y + 32);
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(2300,3200,60); e.charging = false; e.clearTint();
          if (e._chg && e._chg.active) e._chg.destroy(); e._chg = null;
          this.mtFx('mtFxMuzzle', 'mtMuzzle', e.x, e.y + 32, 0.5, { depth:7 });
          this.enemySatShot(e);
          if (!hurt){ e._recoil = true; e.play('satgunRecoil'); e.once('animationcomplete', ()=>{ e._recoil = false; if (e.active && e.enemyType === 'satgun') e.play('satgunIdle'); }); }
        }
      }
    } else if (e.enemyType === 'sniper'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){ e.body.velocity.y = 0; }
      this.tryDodgePlayerBullets(e, delta);
      if (e.body.velocity.y === 0){
        e.fireCd -= delta;
        if (!e.telegraphing && e.fireCd <= 700){
          e.telegraphing = true;
          e.setTint(0xffffff);
        }
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(2200,3000,60);
          e.telegraphing = false;
          e.clearTint();
          this.enemySnipeShot(e);
        }
      }
    } else if (e.enemyType === 'healer'){
      e.wobble += delta;
      e.x = e.baseX + Math.sin(e.wobble/280)*40;
      e.pulseCd -= delta;
      // 0,65 s avant l'impulsion il se charge (le vaisseau s'illumine en violet)
      if (e.pulseCd <= 650 && !e.casting){ e.casting = true; e.play('healerCastAnim'); }
      if (e.pulseCd <= 0){
        e.pulseCd = 3000; e.casting = false;
        this.healerPulse(e);
        if (e.active) e.play('healerFly');
      }
    } else if (e.enemyType === 'ghost'){
      e.wobble += delta;
      e.x = e.baseX + Math.sin(e.wobble/220)*55;
      e.phaseCd -= delta;
      if (e.phaseCd <= 0){
        e.phaseCd = 1500;
        e.phased = !e.phased;
        e.setAlpha(e.phased ? 0.8 : 1);
        e.play(e.phased ? 'ghostFadeOut' : 'ghostFadeIn');                 // fondu vers l'état intangible, puis boucle translucide
        e.once('animationcomplete', ()=>{ if (e.active) e.play(e.phased ? 'ghostPhaseLoop' : 'ghostFly'); });
      }
    } else if (e.enemyType === 'elite'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){ e.body.velocity.y = 0; }
      this.tryDodgePlayerBullets(e, delta);
      if (this.inFiringPosition(e)){
        e.fireCd -= delta;
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(1100,1600,40);
          const baseAngle = Phaser.Math.Angle.Between(e.x,e.y,this.player.x,this.player.y);
          // base 3 voies, +2 par tir débloqué ("secondaire" niv.3, "3e tir" niv.5)
          if (this._bLoad <= BULLET_CAP) this.spreadOffsets(this.weaponTier*2+1).forEach(off=>{
            const b = this.enemyBullets.create(e.x, e.y+20, e.bulletTex || 'bulletE');
            b.setDepth(4);
            b.damage = 9;
            const ang = baseAngle+off;
            if (e.bulletTex){
              b.setScale(e.bulletScale);
              b.rotation = ang + Math.PI/2;
              b.body.setSize(b.width*0.5, b.width*0.5);
            }
            this.physics.velocityFromRotation(ang, this.eSpd(200), b.body.velocity);
          });
        }
      }
    } else if (e.enemyType === 'mothership'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){ e.body.velocity.y = 0; }
      if (e.body.velocity.y === 0){
        e.spawnCd -= delta;
        // 0,5 s avant de lâcher un swarmer, il se charge (animation de préparation)
        if (e.spawnCd <= 500 && !e.casting){ e.casting = true; e.play('motherChargeAnim'); }
        if (e.spawnCd <= 0){
          e.spawnCd = 3000; e.casting = false;
          if (e.active) e.play('motherFly');
          const mx = e.x, my = e.y;
          // le swarmer sort maintenant du Mothership lui-même
          this.time.delayedCall(20, ()=> {
            if (this.bossActive) return;
            const sw = this.spawnOneEnemy('swarmer');
            if (sw){ sw.x = mx + Phaser.Math.Between(-22,22); sw.y = my + 36; sw.baseX = sw.x; }
          });
        }
      }
    } else if (e.enemyType === 'vortex'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){ e.body.velocity.y = 0; }
      const radius = 130;
      this.playerBullets.children.iterate(b=>{
        if (!b || !b.active) return;
        const d = Phaser.Math.Distance.Between(b.x,b.y,e.x,e.y);
        if (d < radius){
          const currentAngle = Math.atan2(b.body.velocity.y, b.body.velocity.x);
          const targetAngle = Phaser.Math.Angle.Between(b.x,b.y,e.x,e.y);
          const newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, 0.04);
          const speed = Math.hypot(b.body.velocity.x, b.body.velocity.y);
          this.physics.velocityFromRotation(newAngle, speed, b.body.velocity);
        }
      });
    } else if (e.enemyType === 'charo'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0){
        e.body.velocity.y = 0;
      }
      this.tryDodgePlayerBullets(e, delta);
      if (this.inFiringPosition(e)){
        e.fireCd -= delta;
        if (e.fireCd <= 0){
          e.fireCd = this.rollFireCd(900,1600,50);
          this.enemyShootSpread(e, this.weaponTier);
        }
      }
    } else if (e.enemyType === 'golden'){
      e.gT += delta;
      e.y = e.gBase + Math.sin(e.gT/320)*40;                  // il traverse l'écran en ondulant, sans jamais tirer
    } else if (e.enemyType === 'meteor'){
      e.rotation += (e.spin || 0) * delta / 1000;
    } else if (e.enemyType === 'kamikaze'){
      const a = this.alertLevel;
      e.kT += delta;
      if (e.kState === 'drift'){
        e.x = e.baseX + Math.sin(e.kT/420)*18;
        const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
        // il se met en chasse dès qu'il est visible et à portée (ou après un temps d'approche)
        if ((e.y > this.visibleYRange(0).min + 30 && dist < 420) || e.kT > 3200){
          e.kState = 'telegraph'; e.kT = 0; sfx.kamiCharge({ pan:this.panOf(e.x) }); e.body.setVelocity(0, 0); e.play('kamiChargeAnim');
        }
      } else if (e.kState === 'telegraph'){
        // il clignote en rouge avant de foncer: de plus en plus court aux hauts niveaux
        e.setTint(Math.floor(e.kT/70) % 2 ? 0xffffff : 0xff3030);
        e.x += (Math.random()-0.5)*2;
        if (e.kT >= Math.max(350, 950 - 80*(a-1))){
          e.clearTint();
          e.kState = 'charge'; e.kT = 0;
          e.tx = this.player.x; e.ty = this.player.y;
          e.kSpd = Math.min(430, 250 + 22*(a-1));
          e.kAng = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
          this.physics.velocityFromRotation(e.kAng, e.kSpd, e.body.velocity);
        }
      } else if (e.kState === 'charge'){
        // niveau 6+: il sème des mini-bombes sur son passage (création différée: jamais pendant le parcours du groupe)
        if (a >= 6){
          e.bombCd = (e.bombCd||0) - delta;
          if (e.bombCd <= 0){
            e.bombCd = 380;
            const bx = e.x, by = e.y;
            this.time.delayedCall(20, ()=>{ if (this.running) this.deployMine(bx, by); });
          }
        }
        // il suit le joueur en continu: il tourne vers lui (virage limité, donc esquivable en changeant vite de direction)
        { const want = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y), turn = (2.6 + 0.12*a) * (delta/1000);
          e.kAng = (e.kAng === undefined ? want : e.kAng) + Phaser.Math.Clamp(Phaser.Math.Angle.Wrap(want - (e.kAng === undefined ? want : e.kAng)), -turn, turn);
          this.physics.velocityFromRotation(e.kAng, e.kSpd || 300, e.body.velocity); }
        const dP = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
        if (dP < 15 || e.kT > 4200){
          e.kState = 'boom'; e.body.setVelocity(0, 0);
          this.time.delayedCall(10, ()=> this.kamikazeBlast(e));
        }
      }
    } else if (e.enemyType === 'diver'){
      // le plongeur garde le focus sur le joueur: il corrige sa trajectoire en continu (virage limité)
      if (this.player.active && e.body){
        const cur = Math.atan2(e.body.velocity.y, e.body.velocity.x), want = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y), turn = (1.5 + 0.08*this.alertLevel) * (delta/1000);
        const na = cur + Phaser.Math.Clamp(Phaser.Math.Angle.Wrap(want - cur), -turn, turn), sp = Math.max(60, Math.hypot(e.body.velocity.x, e.body.velocity.y));
        this.physics.velocityFromRotation(na, sp, e.body.velocity); e.rotation = na + Math.PI/2;
      }
    } else if (e.enemyType === 'spider'){
      if (e.y >= e.stopY && e.body.velocity.y !== 0) e.body.velocity.y = 0;
      // animation: elle marche en avançant, s'accroupit quand la toile se prépare ou tire, sinon elle reste au repos
      if (!e._arriving){
        const wst = this.web ? this.web.state : 'idle';
        const want = e.body.velocity.y !== 0 ? 'spiderWalkA' : ((wst === 'telegraph' || wst === 'fire') ? 'spiderCrouchA' : 'spiderIdleA');
        if (e._want !== want){ e._want = want; e.play(want); }
      }
      if (e.body.velocity.y === 0){
        e.sway += delta / Math.max(420, 900 - 30*Math.max(0, this.alertLevel-8));
        e.x = e.baseX + Math.sin(e.sway)*40;                 // elle balaye lentement: la toile bouge avec elle
      }
      e.fireCd -= delta;
      if (e.fireCd <= 0 && this.inFiringPosition(e)){
        e.fireCd = this.rollFireCd(1700, 2600, 40);
        if (this.alertLevel >= 6) this.enemyShootSpread(e, 3); else this.enemyShoot(e);
      }
    } else if (e.enemyType === 'shieldedGrunt'){
      // shield regenerates after a delay, same spirit as the player's — tint shows when it's down
      // niveau d'alerte 5+: le bouclier revient plus vite et plus fort
      const shieldRegenMul = this.alertLevel >= 5 ? 1.6 : 1;
      if (e.shieldHp < e.shieldMaxHp){
        if (e.shieldRegenDelay > 0){
          e.shieldRegenDelay -= delta * shieldRegenMul;
        } else {
          e.shieldHp = Math.min(e.shieldMaxHp, e.shieldHp + (e.shieldMaxHp/3)*shieldRegenMul*(delta/1000));
          if (e.shieldHp >= e.shieldMaxHp*0.3 && e.shieldDown) { e.clearTint(); e.shieldDown = false; }
        }
      }
    } else if (e.enemyType === 'mine'){
      e.mineDropTimer -= delta;
      if (e.mineDropTimer <= 0){
        e.mineDropTimer = Phaser.Math.Between(2600, 3600);
        // "tir secondaire"/"3e tir" de la mine: largue plusieurs mines d'un coup
        const mineCount = this.weaponTier;
        for (let i=0;i<mineCount;i++) this.deployMine(e.x, e.y);
      }
    } else if (e.enemyType === 'boss'){
      this.updateBossAI(e, delta);
    }
  },

  enemyShoot(e){
    sfx.enemyShot({ pan:this.panOf(e.x) });
    if (!this.player.active || this._bLoad > BULLET_CAP) return;
    const b = this.enemyBullets.create(e.x, e.y+14, e.bulletTex || 'bulletE');
    b.setDepth(4);
    b.damage = 7;
    const angle = this.leadAngle(e, 210);
    if (e.bulletTex){
      b.setScale(e.bulletScale);
      b.rotation = angle + Math.PI/2; // art points up, so turn it to lead with its tip
      b.body.setSize(b.width*0.5, b.width*0.5);
    }
    this.physics.velocityFromRotation(angle, this.eSpd(210), b.body.velocity);
  },

  enemyShootHeavy(e){
    if (!this.player.active || this._bLoad > BULLET_CAP) return;
    sfx.heavyShot({ pan:this.panOf(e.x) });
    const b = this.enemyBullets.create(e.x, e.y+20, e.bulletTex || 'bulletHeavy');
    b.setDepth(4);
    b.damage = 18;
    const angle = Phaser.Math.Angle.Between(e.x,e.y,this.player.x,this.player.y);
    if (e.bulletTex){
      b.setScale(e.bulletScale);
      b.rotation = angle + Math.PI/2;
      b.body.setSize(b.width*0.5, b.width*0.5);
    } else {
      b.body.setSize(b.width*0.8, b.height*0.8);
    }
    this.physics.velocityFromRotation(angle, this.eSpd(140), b.body.velocity);
  },

  deployMine(x, y){
    sfx.mineDrop({ pan:this.panOf(x) });
    if (this.enemies.countActive(true) >= ENEMY_HARD_CAP) return;
    const mini = this.enemies.create(x + Phaser.Math.Between(-50,50), y + Phaser.Math.Between(10,40), 'mine2');
    mini.setDepth(4);
    mini.setScale(0.055);
    mini.enemyType = 'mineDeployed';
    mini.body.setSize(90,90);
    const st = enemyStat('mineDeployed', this.lvDef);
    mini.body.velocity.y = enemyVy(st, 1);
    const hpScale = this.hpScaleNow();
    mini.hp = st.hp*hpScale; mini.maxHp = mini.hp;
    mini.scoreValue = st.score;
    mini.contactDamage = st.dmg;
    this.spawnHitParticles(x, y, 4);
  },

  dropBomb(e){
    sfx.bombDrop();
    if (this._bLoad > BULLET_CAP) return;
    const bomb = this.enemyBullets.create(e.x, e.y+16, 'bomb');
    bomb.setDepth(4);
    bomb.damage = 10;
    bomb.body.velocity.y = 90;
    this.time.delayedCall(1600, ()=>{
      if (!bomb.active) return;
      const bx = bomb.x, by = bomb.y;
      bomb.destroy();
      this.spawnHitParticles(bx, by, 14);
      sfx.bombBoom({ pan:this.panOf(e.x) });
      const d = Phaser.Math.Distance.Between(bx, by, this.player.x, this.player.y);
      if (d < 70){
        this.damagePlayer(16);
      }
    });
  },

  // satellite armé : 1 orbe bleu visé (2 puis 3 selon la menace)
  enemySatShot(e){
    if (!this.player.active || this._bLoad > BULLET_CAP) return;
    const base = Phaser.Math.Angle.Between(e.x, e.y + 32, this.player.x, this.player.y), n = this.alertLevel >= 3 ? 3 : (this.alertLevel >= 2 ? 2 : 1), H = BRAS.shotHead, sc = 0.3;
    this.spreadOffsets(n).forEach(off=>{
      const ang = base + off, b = this.enemyBullets.create(e.x, e.y + 32, 'brFxOrb', 0);          // orbe de plasma animée (feuille de la bibliothèque d'effets), la tête vers l'avant
      b.setDepth(4); b.damage = 8; b.setScale(sc).setOrigin(H[0]/64, H[1]/128).setRotation(ang - Math.PI/2).setBlendMode(Phaser.BlendModes.ADD);
      const r = 5.25 / sc; b.body.setCircle(r, H[0] - r, H[1] - r); b.play('brOrb');
      this.physics.velocityFromRotation(ang, this.eSpd(235), b.body.velocity);
    });
    sfx.enemyShot({ pan:this.panOf(e.x) });
  },

  // un satellite détruit se disloque : des débris partent dans tous les sens (le premier vise le vaisseau s'il est proche) — à esquiver
  satDebris(e){
    if (this._bLoad > BULLET_CAP) return;
    const x = e.x, y = e.y, big = e.enemyType === 'sat', n = big ? Phaser.Math.Between(4, 6) : Phaser.Math.Between(3, 4);
    const pa = Phaser.Math.Angle.Between(x, y, this.player.x, this.player.y), close = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 300;
    for (let i=0;i<n;i++){
      const b = this.enemyBullets.create(x, y, 'tutoDebris', Phaser.Math.Between(0, TUTO_NDEB-1));
      b.setDepth(4).setScale(0.6); b.damage = 6;
      const r = Math.max(6, b.width*0.28); b.body.setCircle(r, b.width/2 - r, b.height/2 - r);
      const ang = (i === 0 && close) ? pa + Phaser.Math.FloatBetween(-0.25, 0.25) : Math.random()*Math.PI*2;
      this.physics.velocityFromRotation(ang, Phaser.Math.Between(70, 140), b.body.velocity);
      b.setAngularVelocity(Phaser.Math.Between(-260, 260));
    }
  },

  enemySnipeShot(e){
    if (!this.player.active || this._bLoad > BULLET_CAP) return;
    const b = this.enemyBullets.create(e.x, e.y+16, e.bulletTex || 'bulletHeavy');
    b.setDepth(4);
    b.damage = 20;
    const angle = Phaser.Math.Angle.Between(e.x,e.y,this.player.x,this.player.y);
    if (e.bulletTex){
      b.setScale(e.bulletScale);
      b.rotation = angle + Math.PI/2;
      b.body.setSize(b.width*0.4, b.width*0.4);
    } else {
      b.setTint(0xff2020);
    }
    this.physics.velocityFromRotation(angle, this.eSpd(380), b.body.velocity);
    sfx.snipeShot({ pan:this.panOf(e.x) });
  },

  healerPulse(e){
    sfx.healerPulse({ pan:this.panOf(e.x) });
    this.spawnHitParticles(e.x, e.y, 6);
    this.enemies.children.iterate(other=>{
      if (!other || !other.active || other === e || other.enemyType==='boss' || other.isBossPart) return;
      const d = Phaser.Math.Distance.Between(e.x,e.y,other.x,other.y);
      if (d < 100 && other.maxHp){
        const wasHurt = other.hp < other.maxHp;
        other.hp = Math.min(other.maxHp, other.hp + other.maxHp*0.2);
        if (wasHurt){
          // faisceau d'âme violet vers l'allié soigné + petit "+" vert qui monte
          if (this._arcs.length < 60) this._arcs.push({ x1:e.x, y1:e.y, x2:other.x, y2:other.y, t:260, c1:0xc04dff, c2:0xffffff, amp:3 });
          if (this._plusN === undefined || this._plusN < 14){
            this._plusN = (this._plusN || 0) + 1;
            const t = this.add.text(other.x, other.y - 8, '+', { fontFamily:'SSX Label, monospace', fontSize:'12px', color:'#7bff9a', stroke:'#04200c', strokeThickness:3 }).setOrigin(0.5).setDepth(7);
            this.tweens.add({ targets:t, y:t.y - 26, alpha:0, duration:700, onComplete:()=>{ t.destroy(); this._plusN--; } });
          }
        }
      }
    });
  },
});
