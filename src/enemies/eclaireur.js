"use strict";
// Méthodes de GameScene — mob « L'Éclaireur de patrouille » (type 'eclaireur', niveau `w1-l4`, et lancé par les baies du boss L'Anneau). Drone-œil : il patrouille en balayant le sol d'un projecteur violet (dont le bout s'estompe en douceur).
// Si tu restes dans le faisceau, un viseur se referme sur toi, la lampe passe au rouge et il te VERROUILLE : tant que le verrouillage dure, les tirs de TOUS les autres ennemis visent le joueur (un boost pour eux) ; puis ses deux canons latéraux tirent une salve.
// 4 états d'usure (planche ecSheet) : les flancs partent en morceaux, un canon perdu ne tire plus. Intelligence par tier (`tier` de l'entrée du niveau dans `spawns`) :
// 1 = patrouille, verrouille, tire une salve de trois par canon · 2 = après la salve, appelle un renfort · 3 = faisceau plus large, balayage plus rapide, verrouillage plus long, salve de cinq · 4 = en plus, arrive avec un second éclaireur en tandem.
// La logique est celle de la page validée : elle tourne en « images » de 1/60 s et en unités de cette page (S de la page = 0,45) ; `U` convertit les distances de la page en pixels du jeu.
const EC = {
  frame:512, scale:0.27, pageS:0.45, hp:80, reach:1000,                          // reach : portée du faisceau (en unités de page) ; doit couvrir tout l'écran, un joueur planqué en bas ne doit pas pouvoir s'y soustraire
  lamp:[256, 276], weapons:[[36, 270], [476, 270]],                              // lentille du projecteur et bouches des deux canons latéraux, dans le sprite 512
  states:[0.7, 0.45, 0.2],                                                       // fraction de vie sous laquelle on passe à l'état suivant
  dmg:{ orb:9 },
  regions:[(x, y)=> x < 130, (x, y)=> x > 382, (x, y)=> x >= 130 && x <= 382 && y < 190, (x, y)=> x >= 130 && x <= 382 && y >= 190 && y < 350, (x, y)=> x >= 130 && x <= 382 && y >= 350],
};

mixin(GameScene, {
  ecInit(e){
    const sp = this.lvDef && this.lvDef.spawns && this.lvDef.spawns.find(s=> s.type === 'eclaireur');
    e.tier = Phaser.Math.Clamp(e.waveTier || (sp && sp.tier) || 1, 1, 4);
    e._st = 0; e.state = 'patrol'; e.stT = 0; e.detT = 0; e.rot = 0; e.f = 0; e.acc = 0; e.lockOn = false; e.summoned = false; e.smokeCd = 600; e.reticleF = 0;
    e.cone = this.add.sprite(0, 0, 'ecFxCone').setDepth(3.9).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.75); e.cone.play('ecCone');
    e.coneHot = this.add.sprite(0, 0, 'ecFxConeHot').setDepth(3.9).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); e.coneHot.play('ecConeHot');
    e.lampG = this.add.sprite(0, 0, 'anFxGlow').setDepth(4.2).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.7); e.lampG.play('anGlow');
    e.lampH = this.add.sprite(0, 0, 'anFxGlowHot').setDepth(4.2).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); e.lampH.play('anGlowHot');
    e.once('destroy', ()=>{ [e.cone, e.coneHot, e.lampG, e.lampH].forEach(o=>{ if (o) o.destroy(); }); });
    if (e.tier >= 4 && !this._ecPairing){ this._ecPairing = true; const c = this.spawnOneEnemy('eclaireur', Phaser.Math.Clamp(e.x + (e.x < GAME_W/2 ? 90 : -90), 40, GAME_W - 40)); if (c){ c.tier = 3; c.summoned = true; c.ph = e.ph + 3.14; } this._ecPairing = false; }
  },

  /* ---------- géométrie ---------- */
  ecP(e, sx, sy){ const k = e.scaleX; return [e.x + (sx - 256)*k, e.y + (sy - 256)*k]; },
  ecPix(st){
    this._ecPixC = this._ecPixC || [];
    if (!this._ecPixC[st]){ const c = document.createElement('canvas'); c.width = c.height = EC.frame; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(this.textures.get('ecSheet').getSourceImage(), st*EC.frame, 0, EC.frame, EC.frame, 0, 0, EC.frame, EC.frame); this._ecPixC[st] = x.getImageData(0, 0, EC.frame, EC.frame).data; }
    return this._ecPixC[st];
  },
  ecSolid(e, sx, sy){ return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && this.ecPix(e._st)[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  ecWAlive(e, i){ return this.ecSolid(e, EC.weapons[i][0], EC.weapons[i][1]); },
  ecFx(key, anim, x, y, scale, depth){ const s = this.add.sprite(x, y, key).setDepth(depth || 8).setScale(scale).setBlendMode(Phaser.BlendModes.ADD); s.play(anim); s.once('animationcomplete', ()=> s.destroy()); return s; },

  /* ---------- à chaque image ---------- */
  ecUpdate(e, delta){
    const k = e.scaleX, pl = this.player; e.wobble += delta;
    if (e.y >= e.stopY && e.body.velocity.y !== 0) e.body.velocity.y = 0;
    const stopped = e.body.velocity.y === 0;
    const f = e.hp/e.maxHp, st = f > EC.states[0] ? 0 : f > EC.states[1] ? 1 : f > EC.states[2] ? 2 : 3; if (st > e._st) this.ecWound(e, st);
    if (stopped){ e.acc += Math.min(delta, 100); let n = 0; while (e.acc >= 16.667 && n++ < 6){ e.acc -= 16.667; this.ecStep(e, k, pl); } }
    this.ecDraw(e, k);
    // dégâts visibles : fumée puis étincelles
    if (e._st >= 1){ e.smokeCd -= delta; if (e.smokeCd <= 0){ e.smokeCd = [0, 700, 420, 260][e._st]; const x = Phaser.Math.Between(130, 382), y = Phaser.Math.Between(70, 460); if (this.ecSolid(e, x, y)){ const [wx, wy] = this.ecP(e, x, y); this.acFx('acFxSmoke', 'acSmoke', wx, wy - 3, 0.25 + e._st*0.07, { normal:true, vy:-18, alpha:0.8 }); if (e._st >= 2) this.ecFx('anFxSpark', 'anSpark', wx, wy, 0.5, 8); } } }
  },
  ecStep(e, k, pl){        // une image de 1/60 s, comme sur la page
    const U = k/EC.pageS, T = e.tier, vis = this.visibleXRange(40); e.f++; e.stT++;
    const [lx, ly] = this.ecP(e, EC.lamp[0], EC.lamp[1]), wide = T >= 3 ? 1.3 : 1, dir = Math.PI/2 + e.rot;
    if (e.state === 'patrol'){
      e.x = Phaser.Math.Clamp(e.baseX + Math.sin(e.f*0.011 + e.ph)*110*U, vis.min, vis.max); e.rot = Math.sin(e.f*0.021*(T >= 3 ? 1.5 : 1) + e.ph)*0.5;
      if (pl && pl.active){
        const vx = pl.x - lx, vy = pl.y - ly, along = vx*Math.cos(dir) + vy*Math.sin(dir), perp = Math.abs(vx*Math.sin(dir) - vy*Math.cos(dir)), half = Math.tan(0.33)*wide;
        const inCone = along > 30*U && along < EC.reach*U && perp < along*half*0.9; e.detT = inCone ? e.detT + 1 : Math.max(0, e.detT - 2);
        if (e.detT > (T >= 3 ? 20 : 28)){ e.state = 'alert'; e.stT = 0; e.reticleF = 0; this.ecSfx('ecLock', e); this.ecSfx('ecCharge', e); [0, 1].forEach(i=>{ if (this.ecWAlive(e, i)){ const [x, y] = this.ecP(e, EC.weapons[i][0], EC.weapons[i][1]); this.ecFx('anFxCharge', 'anCharge', x, y, 0.5*U*1.4, 8); } }); }
      }
    } else if (e.state === 'alert'){
      if (pl && pl.active) e.rot += (Math.atan2(pl.y - ly, pl.x - lx) - Math.PI/2 - e.rot)*0.12;
      if (e.stT > (T >= 3 ? 62 : 50)){ e.state = 'fire'; e.stT = 0; this.ecVolley(e, k); }
    } else if (e.state === 'fire'){ if (e.stT > 18){ e.state = 'cool'; e.stT = 0; if (T >= 2 && !e.summoned) this.ecSummon(e); } }
    else if (e.state === 'cool'){ e.rot += (Math.sin(e.f*0.021)*0.5 - e.rot)*0.04; if (e.stT > 110){ e.state = 'patrol'; e.detT = 0; } }
    e.lockOn = e.state === 'alert' || e.state === 'fire' || (e.state === 'cool' && e.stT < (T >= 3 ? 110 : 60));
  },
  ecSfx(name, e){ try { sfx[name]({ pan:this.panOf(e.x) }); } catch(err){ /* ignore */ } },
  ecVolley(e, k){
    const pl = this.player, U = k/EC.pageS, n = e.tier >= 3 ? 5 : 3; if (!pl || !pl.active) return;
    for (let i = 0; i < 2; i++){
      if (!this.ecWAlive(e, i)) continue; const [x, y] = this.ecP(e, EC.weapons[i][0], EC.weapons[i][1]); this.ecFx('anFxMuzzle', 'anMuzzle', x, y, 0.6*U*1.6, 8);
      const a0 = Math.atan2(pl.y - y, pl.x - x);
      for (let j = 0; j < n; j++){
        if (this._bLoad > BULLET_CAP) break; const a = a0 + (j - (n - 1)/2)*(n === 5 ? 0.12 : 0.15), sc = 0.38*U*1.6, b = this.enemyBullets.create(x, y, 'anFxOrb', 0);
        b.setDepth(4); b.damage = this.waveDamage(e, EC.dmg.orb); b._ec = true; b.setOrigin(0.5, 94/128).setScale(sc).setRotation(a - Math.PI/2).setBlendMode(Phaser.BlendModes.ADD);
        const r = 5.25/sc; b.body.setCircle(r, 32 - r, 94 - r); b.play('anOrb'); this.physics.velocityFromRotation(a, 5.2*60*U*1.15, b.body.velocity);
      }
    }
    this.ecSfx('ecShot', e); this.time.delayedCall(90, ()=>{ if (e.active) this.ecSfx('ecShot', e); }); this.time.delayedCall(180, ()=>{ if (e.active) this.ecSfx('ecShot', e); });
  },
  ecSummon(e){        // renfort (tier 2+) : un second éclaireur arrive du haut, une seule fois
    e.summoned = true; const c = this.spawnOneEnemy('eclaireur', Phaser.Math.Clamp(e.x + (e.x < GAME_W/2 ? 110 : -110), 40, GAME_W - 40)); if (c){ c.summoned = true; c.tier = Math.max(1, e.tier - 1); }
  },
  ecDraw(e, k){
    const U = k/EC.pageS, [lx, ly] = this.ecP(e, EC.lamp[0], EC.lamp[1]), red = e.lockOn, stopped = e.body.velocity.y === 0, wide = e.tier >= 3 ? 1.3 : 1, len = EC.reach*U;
    const sc = 1.5*U*wide*(e.state === 'alert' ? 1.1 : 1), a = red ? 0.9 : 0.78;
    e.cone.setVisible(stopped && !red).setPosition(lx, ly).setRotation(e.rot).setScale(sc, len/256).setAlpha(a); e.coneHot.setVisible(stopped && red).setPosition(lx, ly).setRotation(e.rot).setScale(sc, len/256).setAlpha(a);
    e.lampG.setVisible(!red).setPosition(lx, ly).setScale(0.8*U*1.6); const p = 0.6 + 0.4*Math.sin(e.f*0.5); e.lampH.setVisible(red).setPosition(lx, ly).setScale(1.0*U*1.6*p);
  },
  // verrouillage : tant qu'un éclaireur te tient dans son viseur, les tirs des AUTRES ennemis visent le joueur. Appelé à chaque image (game/loop.js).
  ecLockUpdate(delta){
    const pl = this.player; let locked = false;
    this.enemies.children.iterate(e=>{ if (e && e.active && e.enemyType === 'eclaireur' && e.lockOn) locked = true; });
    if (!this._ecRet && locked){ this._ecRet = this.add.sprite(0, 0, 'ecFxReticle').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setScale(0.62).setVisible(false); }
    if (this._ecRet){
      if (locked && pl && pl.active){ if (!this._ecRet.visible){ this._ecRet.setVisible(true).play('ecRetIn'); this._ecRet.once('animationcomplete', ()=>{ if (this._ecRet && this._ecRet.visible) this._ecRet.play('ecRetLoop'); }); } this._ecRet.setPosition(pl.x, pl.y - 4); }
      else if (this._ecRet.visible){ this._ecRet.setVisible(false); this._ecRet.stop(); }
    }
    if (!this.enemyBullets) return;
    this.enemyBullets.children.iterate(b=>{
      if (!b || !b.active || b._ck) return; b._ck = true;
      if (!locked || b._ec || b._aim || !pl || !pl.active || b.texture.key === 'tutoDebris') return;
      let src = null, sd = 56; this.enemies.children.iterate(e=>{ if (!e || !e.active || e.bossId || e.isBossPart) return; const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < sd){ sd = d; src = e; } });
      if (!src) return; const v = b.body.velocity, spd = Math.hypot(v.x, v.y); if (spd < 20) return;
      const old = Math.atan2(v.y, v.x), na = Math.atan2(pl.y - b.y, pl.x - b.x); this.physics.velocityFromRotation(na, spd, v); b.rotation += na - old; b.setTint(0xff6a5a); b._lk = true;
    });
  },

  /* ---------- usure et destruction : vrais morceaux découpés dans le sprite ---------- */
  ecPiece(from, name, test, minCells){
    const key = 'ecp_' + from + '_' + name; this._ecPc = this._ecPc || {}; if (key in this._ecPc) return this._ecPc[key];
    const N = 128, a = this.ecPix(from), cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
    if (cells.length < minCells) return (this._ecPc[key] = null);
    const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.textures.get('ecSheet').getSourceImage();
    cells.forEach(([cx, cy])=> x.drawImage(src, from*EC.frame + cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); this.textures.addCanvas(key, c); return (this._ecPc[key] = { key, c:[(x0 + x1 + 1)*2, (y0 + y1 + 1)*2] });
  },
  ecLaunch(e, p, power){
    if (!p) return; const k = e.scaleX, x = e.x + (p.c[0] - 256)*k, y = e.y + (p.c[1] - 256)*k, dx = x - e.x, dy = y - e.y;
    const s = this.add.image(x, y, p.key).setDepth(5).setScale(k), vx = dx*1.4*power + Phaser.Math.Between(-18, 18), vy = -Phaser.Math.Between(20, 70) + dy*0.5*power, life = Phaser.Math.Between(1300, 1900);
    this.tweens.add({ targets:s, x:x + vx*life/1000, angle:Phaser.Math.Between(-260, 260), alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:{ value:y + vy*0.35*life/1000 + 150, ease:'Quad.easeIn' }, duration:life, onComplete:()=> s.destroy() });
  },
  ecShards(e, st, n, power){
    const k = e.scaleX, src = this.textures.get('ecSheet').getSourceImage();
    for (let i = 0; i < n; i++){
      const x = Phaser.Math.Between(100, 410), y = Phaser.Math.Between(70, 460); if (!this.ecSolid(e, x, y)) continue; const r = Phaser.Math.Between(6, 14), S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(src, st*EC.frame + x - r, y - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
      const m = document.createElement('canvas'); m.width = m.height = S2; const mg = m.getContext('2d'); mg.fillStyle = '#fff'; mg.beginPath(); const nv = Phaser.Math.Between(5, 7);
      for (let j = 0; j < nv; j++){ const a = j/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; j ? mg.lineTo(X, Y) : mg.moveTo(X, Y); } mg.fill();
      g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0);
      const key = 'ecs_' + (this._ecShardN = (this._ecShardN || 0) + 1); this.textures.addCanvas(key, c);
      const [wx, wy] = this.ecP(e, x, y), s = this.add.image(wx, wy, key).setDepth(5).setScale(k), life = Phaser.Math.Between(1200, 1800);
      this.tweens.add({ targets:s, x:wx + (wx - e.x)*1.2*power + Phaser.Math.Between(-15, 15), angle:Phaser.Math.Between(-300, 300), alpha:0, duration:life, ease:'Quad.easeIn' });
      this.tweens.add({ targets:s, y:wy + (wy - e.y)*0.6*power + 120, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
    }
  },
  ecWound(e, st){
    const from = e._st; e._st = st; e.setFrame(st); const b = this.ecPix(st);
    this.ecLaunch(e, this.ecPiece(from, 'L' + st, (X, Y)=> X < 200 && b[(Y*512 + X)*4 + 3] < 128, 40), 0.8); this.ecLaunch(e, this.ecPiece(from, 'R' + st, (X, Y)=> X > 312 && b[(Y*512 + X)*4 + 3] < 128, 40), 0.8);
    this.ecShards(e, from, 5, 1.1); this.ecFx('anFxBoomM', 'anBoomM', e.x + Phaser.Math.Between(-14, 14), e.y + Phaser.Math.Between(-12, 12), 0.5, 8); this.ecSfx('ecBreak', e); this.cameras.main.shake(120, 0.005);
  },
  ecDeath(e){        // destruction : chaque morceau part en un bloc
    EC.regions.forEach((t, i)=> this.ecLaunch(e, this.ecPiece(e._st, 'D' + i, t, 30), 1.2)); this.ecShards(e, e._st, 12, 1.5);
  },
});
