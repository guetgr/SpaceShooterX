"use strict";
// Méthodes de GameScene — collisions et dégâts sur les ennemis, mort des ennemis.
mixin(GameScene, {
  /* ---------- COLLISIONS ---------- */
  enemyShielded(e){ const ow = e.isBossPart ? e.bossRef : e; return !!(ow && ow.shieldHp > 0 && !this._empOn); },

  onBulletHitsEnemy(bullet, enemy){
    if (!bullet.active || !enemy.active) return;
    if (enemy.phased) return; // ghost is intangible mid-phase — shots pass through
    if (!this.enemyOnScreen(enemy)) return;   // pas encore entré dans l'écran: les tirs le traversent
    this.applyDamageToEnemy(enemy, bullet.damage);
    this.juiceHit(enemy); this.juiceImpact(bullet, enemy);
    if (this.stats.chainLightning > 0 && !bullet._arc) this.chainLightning(enemy, bullet.damage);
    this.spawnHitParticles(bullet.x, bullet.y, 4);
    if (enemy.enemyType === 'bras') sfx.brasHit({ pan:this.panOf(enemy.x) }); else if (enemy.enemyType === 'pilleur') sfx.plHit({ pan:this.panOf(enemy.x) }); else if (enemy.enemyType === 'eclaireur') sfx.ecHit({ pan:this.panOf(enemy.x) }); else sfx.hitEnemy();
    if (this.stats.lifesteal > 0){
      this.hp = Math.min(this.stats.maxHp, this.hp + bullet.damage*this.stats.lifesteal);
    }

    if (bullet.isShotgunPellet && this.fragmentationOwned && !bullet.isFragment){
      for (let i=0;i<2;i++){
        const ang = Phaser.Math.Angle.Between(this.player.x,this.player.y,bullet.x,bullet.y) + (i===0?-0.35:0.35);
        const frag = this.playerBullets.create(bullet.x, bullet.y, 'bulletP2');
        frag.setDepth(5);
        frag.setScale(0.24);
        frag.pierceLeft = 0;
        frag.isFragment = true;
        frag.damage = bullet.damage*0.35;
        this.physics.velocityFromRotation(ang, this.stats.bulletSpeed*0.8, frag.body.velocity);
      }
    }

    // la perforation ne joue que sur la coque: un bouclier encore debout arrête le tir (sauf compétence TRANSPERCE-BOUCLIER, et les lasers passent)
    if (bullet.pierceLeft > 0 && (bullet.pierceLeft >= 900 || this.stats.shieldPierce > 0 || !this.enemyShielded(enemy))){
      bullet.pierceLeft -= 1;
    } else {
      bullet.destroy();
    }

    if (enemy.hp <= 0){
      this.killEnemy(enemy);
    }
  },

  onMissileHitsEnemy(missile, enemy){
    if (!missile.active || !enemy.active) return;
    if (enemy.phased) return;
    if (!this.enemyOnScreen(enemy)) return;
    this.applyDamageToEnemy(enemy, missile.damage);
    this.spawnHitParticles(missile.x, missile.y, 8);
    sfx.boomSmall();
    if (this.stats.lifesteal > 0){
      this.hp = Math.min(this.stats.maxHp, this.hp + missile.damage*this.stats.lifesteal);
    }

    // blast radius / napalm — straight missiles hit an area, not just the first thing they touch
    if (missile.blastRadius){
      const mx = missile.x, my = missile.y;
      const targets = [];
      this.enemies.children.iterate(other=>{
        if (other && other.active && other !== enemy && !other.phased){
          if (Phaser.Math.Distance.Between(mx,my,other.x,other.y) < missile.blastRadius) targets.push(other);
        }
      });
      targets.forEach(other=>{
        this.applyDamageToEnemy(other, missile.damage*0.6);
        if (other.hp <= 0) this.killEnemy(other);
      });
    }

    if (missile.pierceLeft > 0 && (this.stats.shieldPierce > 0 || !this.enemyShielded(enemy))){
      missile.pierceLeft -= 1;
    } else {
      missile.destroy();
    }

    if (enemy.hp <= 0){
      this.killEnemy(enemy);
    }
  },

  // un ennemi n'encaisse des dégâts que s'il est dans la zone visible (petite marge de 8 px)
  enemyOnScreen(e){
    // les ennemis normaux ne sont touchables qu'une fois ENTRES de ~34 px (le temps de les voir arriver); les boss et leurs parties: dès qu'ils sont dans l'écran
    const parked = e.body && (Math.abs(e.body.velocity.x) + Math.abs(e.body.velocity.y) < 8);        // un ennemi garé est touchable dès qu'il est dans l'écran
    const inset = (e.enemyType === 'boss' || e.isBossPart) ? -8 : (parked ? 0 : 30);
    const vx = this.visibleXRange(inset), vy = this.visibleYRange(inset);
    return e.x >= vx.min && e.x <= vx.max && e.y >= vy.min && e.y <= vy.max;
  },

  applyDamageToEnemy(enemy, amount){
    if (!this.enemyOnScreen(enemy)) return;                  // hors écran: intouchable
    if (enemy._secondT > 0){ this.blinkHit(enemy); return; }          // pendant sa transformation le boss est intouchable
    { const ow = enemy.isBossPart ? enemy.bossRef : (enemy.bossId ? enemy : null);
      if (ow && ow._aShield && ow.shieldHp > 0 && !this._empOn && !ow.invuln && !enemy.invuln){
        ow.shieldHp -= amount; ow.shieldRegenDelay = 4000;
        if (ow.shieldHp > 0){ sfx.shieldHit({ pan:this.panOf(enemy.x) }); this.blinkHit(enemy); return; }
        ow.shieldHp = 0; sfx.shieldBreak({ pan:this.panOf(ow.x) });
        this.shieldShatter(ow, true);
        return;
      } }
    if (!enemy.invuln) this.runDamage += Math.min(amount, Math.max(0, (enemy.hp || 0) + (enemy.shieldHp || 0)));      // dégâts infligés (classement du vortex) : sans le trop-plein sur un ennemi déjà condamné
    if (enemy.isBossPart){ this.damageBossPart(enemy, amount); return; }
    if (enemy.invuln){ this.blinkHit(enemy); return; }       // boss momentanément intouchable
    if (enemy._shInv && this.time.now < enemy._shInv){ if (enemy.shieldHp <= 0) return; }   // 2 s d'invincibilité après la casse du bouclier (pas pour les boss)
    if (enemy.groggy) amount *= 1.5;                         // faucheuse sonnée : encaisse plus
    // shielded enemies absorb damage into their shield pool first
    if (enemy.shieldHp > 0 && !this._empOn){
      enemy.shieldHp -= amount;
      if (enemy.shieldHp > 0) sfx.shieldHit({ pan:this.panOf(enemy.x) });
      if (enemy.shieldMaxHp !== undefined) enemy.shieldRegenDelay = 3000;
      if (enemy._gShield && enemy.shieldHp > 0) this.blinkHit(enemy);
      if (enemy.shieldHp <= 0){
        if (!enemy._aShield) enemy.hp += enemy.shieldHp; // le trop-plein passe sur la coque (sauf bouclier d'alerte 8+: le coup qui le casse est entièrement absorbé)
        enemy.shieldHp = 0;
        if (enemy._gShield){                                   // bouclier générique: il éclate (petite onde bleue) et l'ennemi reprend sa couleur
          enemy.clearTint();
          this.shieldShatter(enemy, false); enemy._shInv = this.time.now + 2000;
          sfx.shieldBreak({ pan:this.panOf(enemy.x) });
        } else if (enemy.setTint){ enemy.setTint(0x666677); enemy.shieldDown = true; sfx.shieldBreak({ pan:this.panOf(enemy.x) }); }
      }
      return;
    }
    enemy.hp -= amount;
  },

  killEnemy(enemy){
    if (!enemy.active) return;
    if (enemy.isBossPart){ this.onBossPartKilled(enemy); return; }
    if (enemy.enemyType === 'kamikaze' && !enemy._blasted) this.kamikazeBlast(enemy, true);   // abattu de trop près: il explose quand même
    const isBoss = enemy.enemyType === 'boss';
    // seconde forme: les boss "simples" se relèvent une fois (niveau d'alerte 4+)
    if (isBoss && !enemy._second && this.alertLevel >= BOSS_SECOND_FORM_FROM && ['dread','faucheuse','prisme','kraken','eclipse'].indexOf(enemy.bossId) >= 0){
      this.bossSecondForm(enemy);
      return;
    }
    if (isBoss) this.cleanupBossParts(enemy);
    const isSplitter = enemy.enemyType === 'splitter';
    this.score += enemy.scoreValue || 5;
    const bKey = bestiaryKeyFor(enemy);
    this.bestiary.kills[bKey] = (this.bestiary.kills[bKey]||0) + 1;
    this.bestiaryDirty = true;     // enregistré toutes les 2 s (et en fin de partie / quand la page se ferme)
    this.achvOnKill(enemy, bKey);
    if (!isBoss){ this.runKills += 1; this.comboKill(enemy.scoreValue); if (this._odK < 14){ this._odK += 0.35; this.addOverdrive(0.35); } }
    else { this.combo.n += 25; this.combo.t = Math.max(this.combo.t, 2500); this._styleDirty = true; }   // un boss compte pour 25 kills et prolonge le combo
    if (enemy.enemyType === 'golden') this.goldJackpot(enemy);
    // pacte MOBS EXPLOSIFS: l'ennemi qui meurt explose et blesse le vaisseau s'il est tout près
    if (!isBoss && this.pacts && this.pacts.indexOf('p_explosifs') >= 0){
      this.explodeFx(enemy.x, enemy.y, 55);
      if (this.player.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) <= 55) this.damagePlayer(5 + this.alertLevel);
    }
    // ECLATS: l'ennemi abattu projette des éclats qui blessent ses voisins (limité pour rester fluide)
    if (!isBoss && this.stats.shardCount > 0 && this.playerBullets.getLength() < 150){
      const n = Math.min(8, Math.round(this.stats.shardCount));
      for (let i=0;i<n;i++){
        const sh = this.playerBullets.create(enemy.x, enemy.y, 'bulletP2');
        sh.setDepth(5); sh.setScale(0.26);
        sh.pierceLeft = 0; sh._arc = true;
        sh.damage = this.stats.damage * 0.35;
        this.physics.velocityFromRotation(Math.random()*6.2832, 380, sh.body.velocity);
      }
    }
    this.spawnHitParticles(enemy.x, enemy.y, isBoss?26:10);
    this.juiceKill(enemy, isBoss);
    if (enemy.enemyType === 'sat' || enemy.enemyType === 'satgun') this.satDebris(enemy);
    if (enemy.enemyType === 'bras') this.brasDeath(enemy);
    if (enemy.enemyType === 'pilleur') this.pilDeath(enemy);
    if (enemy.enemyType === 'eclaireur') this.ecDeath(enemy);
    // SANGSUE: un kill à proximité du vaisseau soigne une petite zone autour de lui
    if (this.sangsueOwned && this.player.active){
      const radius = 90 + (this.stats.sangsueRadiusBonus||0);
      const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      if (d <= radius){
        const healAmt = (isBoss ? 6 : 2) * (this.stats.sangsueHealMul||1);
        this.hp = Math.min(this.stats.maxHp, this.hp + healAmt);
        this.updateHud(false);
      }
    }
    if (isBoss) sfx.bossDown(); else this.killSound(enemy);
    const deathArt = ENEMY_ART[enemy.enemyType];
    const nowB = this.time.now;
    if (nowB - (this._boomT || 0) > 100){ this._boomT = nowB; this._boomN = 0; }
    if (deathArt && (isBoss || this._boomN++ < 10)){            // budget d'animations d'explosion par 100 ms
      const boom = this.add.sprite(enemy.x, enemy.y, deathArt.boomTex);
      boom.setDepth(6);
      boom.setScale(deathArt.boomScale * (enemy.boomMul || 1));
      boom.play(deathArt.boom);
      boom.once('animationcomplete', ()=> boom.destroy());
      if (enemy.enemyType === 'healer'){      // le Healer se disloque en énergie: onde de choc cyan
        const ring = this.add.image(enemy.x, enemy.y, 'shockRing').setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setTint(0x66d8ff).setScale(0.08).setAlpha(0.9);
        this.tweens.add({ targets:ring, scaleX:0.55, scaleY:0.55, alpha:0, duration:420, ease:'Quad.easeOut', onComplete:()=> ring.destroy() });
      }
    }

    if (!isBoss) this.composantDrop(enemy);          // composants ◆ (en plus des cristaux)
    // chance to drop a heal pickup instead of the usual gem(s)
    if (!isBoss && Math.random() < this.stats.healDropChance){
      const h = this.heals.create(enemy.x, enemy.y, 'cell');
      h.setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
      h.healValue = 5 + 3*(this.stats.bigHeal||0);               // cellule d'énergie: charge d'overdrive (plus de soin par ramassage)
      h.body.velocity.y = 30;
    } else {
      // drop gems
      const baseChance = Math.min(0.98, 0.75 + this.stats.gemChanceBonus);
      let gemCount = isBoss ? 24 : (enemy.enemyType === 'meteor' ? (Math.random() < 0.4 ? 1 : 0) : (enemy.enemyType === 'swarmer' ? (Math.random() < 0.22 ? 1 : 0) : (Math.random()<baseChance ? 1 : 0)));
      if (!isBoss && gemCount>0 && Math.random() < this.stats.bonusGemChance) gemCount += 1;
      for (let i=0;i<gemCount;i++){
        const xpVal = isBoss ? 6 : (enemy.enemyType === 'swarmer' ? Phaser.Math.Between(1,2) : Phaser.Math.Between(2,4));
        const kind = xpVal >= 6 ? 'gemL' : (xpVal >= 3 ? 'gemM' : 'gemS');
        if (this.gems.getLength() >= GEM_CAP){
          // trop de cristaux à l'écran (ça fait ramer): on crédite l'XP directement, sans sprite
          this.xp += xpVal * (1 + this.stats.xpBonus) * (1 + 0.12*(this.alertLevel-1)) * this.xpMul();
          continue;
        }
        const g = this.gems.create(enemy.x+Phaser.Math.Between(-16,16), enemy.y+Phaser.Math.Between(-16,16), kind, 0);
        g.setDepth(3);
        g.setScale(1/GEM_SS);
        g.xpValue = xpVal;
        g.gemKind = kind;
        g.ph = Math.random()*6.2832;
        g.sparkF = 0;
        const bs = GEM_KINDS[kind].s*GEM_SS*1.8; // zone de ramassage = le cristal, pas son halo
        g.body.setSize(bs, bs, true);
        g.body.velocity.y = 30;
      }
    }

    if (enemy.enemyType === 'boss' && BOSS_SPRITES[enemy.bossId]){
      const ba = BOSS_SPRITES[enemy.bossId];
      const d = this.add.sprite(enemy.x, enemy.y, ba.deathTex).setDepth(7).setScale(enemy.scaleX * 1.1); if (ba.flipY) d.setFlipY(true);
      d.play(ba.death); d.once('animationcomplete', ()=> d.destroy());
    }
    const splitX = enemy.x, splitY = enemy.y;
    const mvx = enemy.body ? enemy.body.velocity.x : 0, mvy = enemy.body ? enemy.body.velocity.y : 120;
    if (enemy.enemyType === 'meteor' && enemy.meteorTier > 0) this.time.delayedCall(20, ()=> this.splitMeteor(splitX, splitY, enemy.meteorTier, mvx, mvy, enemy.mStyle));
    enemy.destroy();
    if (isBoss) this.onBossDefeated({ x:splitX, y:splitY, id:enemy.bossId, ref:enemy });
    if (isSplitter){
      // spawned after this frame's enemy-group iteration finishes, to avoid mutating the group mid-loop
      this.time.delayedCall(20, ()=>{
        // le boss a pu spawn/clear le terrain entre-temps: on annule les mini pour ne pas les laisser traîner
        if (this.bossActive) return;
        const miniArt = ENEMY_ART['splitterMini'];
        for (let i=0;i<2;i++){
          const mini = this.enemies.create(splitX + Phaser.Math.Between(-14,14), splitY, miniArt.tex);
          mini.setDepth(4);
          mini.enemyType = 'splitterMini';
          mini.setScale(miniArt.scale);
          mini.setFlipY(true);
          mini.play(miniArt.anim);
          mini.body.setSize(miniArt.body[0], miniArt.body[1]);
          const hpScale = this.hpScaleNow();
          const st = enemyStat('splitterMini', this.lvDef);
          mini.hp = st.hp*hpScale; mini.maxHp = mini.hp;
          mini.body.velocity.y = enemyVy(st, 1+this.difficultyTier*0.08);
          mini.scoreValue = st.score;
          mini.contactDamage = st.dmg;
        }
      });
    }
  },

  onEnemyHitsPlayer(player, enemy){
    if (enemy.phased) return;
    if (enemy._safeUntil && this.time.now < enemy._safeUntil) return;       // débris de météorite tout juste né
    if (enemy.enemyType === 'kamikaze'){            // le contact = il explose (le souffle fait les dégâts)
      if (!enemy._blasted) this.kamikazeBlast(enemy);
      return;
    }
    const dmg = (enemy.contactDamage || 8) * COLLISION_DMG_MUL * (this.stats.collisionMul || 1);       // percuter est très dangereux; le blindage de l'arbre réduit ces dégâts
    this.damagePlayer(dmg);
    if (enemy.enemyType !== 'boss' && !enemy.isBossPart){
      this.killEnemy(enemy);
    }
  },

  onEnemyBulletHitsPlayer(player, bullet){
    if (!bullet.active) return;
    const dmg = bullet.damage || 7;
    bullet.destroy();
    this.damagePlayer(dmg);
  },
});
