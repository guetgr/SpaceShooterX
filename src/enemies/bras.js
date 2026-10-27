"use strict";
// Méthodes de GameScene — mob « Bras écartés » (type 'bras') : coque à quatre perches qui chargent en bleu et tirent des orbes bleues.
// 4 états d'usure dessinés (planche brasSheet) selon la vie ; une perche arrachée ne tire plus ; à la mort et à chaque changement d'état, les perches
// et des éclats de coque partent en vrais morceaux découpés dans le sprite. Vol (à valider) : descend, s'arrête pour tirer quelques salves, repart.
// Intelligence par tier (`tier` de l'entrée du niveau dans `spawns`) : 1 = 2 tirs en croix qui alternent · 2 = 2 tirs d'affilée sur la même diagonale · 3 = les 4 perches ensemble · 4 = enchaîne les trois comme il veut.
const BRAS = {
  frame:512, scale:0.24, hp:60,
  ports:[[45, 72, -135], [468, 72, -45], [42, 410, 135], [470, 410, 45]],     // bouts de perche dans le sprite 512 : x, y, direction de sortie (degrés) ; 0 haut-gauche, 1 haut-droite, 2 bas-gauche, 3 bas-droite
  diag:{ A:[0, 3], B:[1, 2] },                                                  // les deux diagonales de la croix
  limbs:{ UL:(x, y)=> x < 160 && y < 190, UR:(x, y)=> x > 352 && y < 190, LL:(x, y)=> x < 160 && y > 300, LR:(x, y)=> x > 352 && y > 300, ML:(x, y)=> x < 150 && y >= 190 && y <= 300, MR:(x, y)=> x > 362 && y >= 190 && y <= 300 },
  states:[0.75, 0.5, 0.25],                                                     // fraction de vie sous laquelle on passe à l'état suivant
  cooldown:[0, 1500, 1900, 2100],                                               // pause entre deux salves selon le tier (le tier 4 tire au hasard entre 0,5 et 2,4 s)
  shotSpeed:200, shotDmg:7, shotScale:0.45, shotHead:[32, 94], shotGravity:70,
  salvos:3,                                                                     // salves tirées à l'arrêt, plus le tier, avant de repartir
};

mixin(GameScene, {
  brasInit(e){
    const sp = this.lvDef && this.lvDef.spawns && this.lvDef.spawns.find(s=> s.type === 'bras');
    e.tier = Phaser.Math.Clamp((sp && sp.tier) || 1, 1, 4);
    e._st = 0; e.vq = []; e.cur = null; e.seq = Math.random() < 0.5 ? 0 : 1; e.salvos = 0; e.leaving = false;
    e.fireCd = Phaser.Math.Between(900, 1500); e.smokeCd = 500;
  },

  /* ---------- à chaque image ---------- */
  brasUpdate(e, delta){
    if (!e.leaving && e.y >= e.stopY && e.body.velocity.y !== 0) e.body.velocity.y = 0;
    const stopped = e.body.velocity.y === 0;
    e.wobble += delta;
    if (stopped) e.x = e.baseX + Math.sin(e.wobble/1000 + e.ph)*18;
    const f = e.hp / e.maxHp, st = f > BRAS.states[0] ? 0 : f > BRAS.states[1] ? 1 : f > BRAS.states[2] ? 2 : 3;
    if (st > e._st) this.brasWound(e, st);
    if (e._st >= 1){
      e.smokeCd -= delta;
      if (e.smokeCd <= 0){
        e.smokeCd = 650 - e._st*150; const p = this.brasHullPoint(e);
        if (p){ this.acFx('acFxSmoke', 'acSmoke', p[0], p[1] - 4, 0.22 + e._st*0.05, { normal:true, vy:-22, alpha:0.8 }); if (e._st >= 2) this.acFx('acFxSpark', 'acSpark', p[0], p[1], 0.4); }
      }
    }
    if (stopped) this.brasShooter(e, delta);
  },

  /* ---------- tirs ---------- */
  brasPlan(e){
    const kind = e.tier === 4 ? Phaser.Math.Between(1, 3) : e.tier;
    if (kind === 1){ const d = BRAS.diag[(e.seq++ % 2) ? 'B' : 'A']; return [{ ports:d, charge:0.55 }]; }
    if (kind === 2){ const d = BRAS.diag[(e.seq++ % 2) ? 'B' : 'A']; return [{ ports:d, charge:0.5 }, { ports:d, charge:0.3 }]; }
    return [{ ports:[0, 1, 2, 3], charge:0.7 }];
  },
  brasShooter(e, delta){
    if (!e.cur && e.vq.length){
      const v = e.vq.shift(); v.ports = v.ports.filter(i=> this.brasPortAlive(e, i));
      if (v.ports.length){
        e.cur = Object.assign(v, { t:0, fired:false, chg:[] }); sfx.brasCharge({ pan:this.panOf(e.x) });
        v.ports.forEach(i=>{ const p = this.brasPort(e, i), s = this.add.sprite(p[0], p[1], 'brFxCharge').setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setScale(0.3); s.play('brCharge'); v.chg.push([i, s]); });
      }
    }
    if (e.cur){
      const c = e.cur; c.t += delta/1000;
      c.chg.forEach(a=>{ const p = this.brasPort(e, a[0]); a[1].setPosition(p[0], p[1]); });
      if (!c.fired && c.t >= c.charge){
        c.fired = true;
        c.chg.forEach(a=>{ const p = this.brasPort(e, a[0]); a[1].destroy(); this.brasOrb(p[0], p[1], BRAS.ports[a[0]][2]); const m = this.add.sprite(p[0], p[1], 'brFxMuzzle').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setScale(0.32); m.play('brMuzzle'); m.once('animationcomplete', ()=> m.destroy()); });
        c.chg = []; sfx.brasShot({ pan:this.panOf(e.x) });
      }
      if (c.t >= c.charge + 0.25){ e.cur = null; if (!e.vq.length && ++e.salvos >= BRAS.salvos + e.tier){ e.leaving = true; e.body.velocity.y = 55; } }
    } else if (!e.vq.length && !e.leaving){
      e.fireCd -= delta;
      if (e.fireCd <= 0){ e.vq = this.brasPlan(e); e.fireCd = e.tier === 4 ? Phaser.Math.Between(500, 2400) : BRAS.cooldown[e.tier]; }
    }
  },
  brasOrb(x, y, deg){
    if (this._bLoad > BULLET_CAP) return;
    const ang = Phaser.Math.DegToRad(deg), H = BRAS.shotHead, b = this.enemyBullets.create(x, y, 'brFxOrb', 0);
    b.setDepth(4); b.damage = BRAS.shotDmg; b.setScale(BRAS.shotScale).setOrigin(H[0]/64, H[1]/128).setRotation(ang - Math.PI/2).setBlendMode(Phaser.BlendModes.ADD);
    const r = 5.25 / BRAS.shotScale; b.body.setCircle(r, H[0] - r, H[1] - r);
    b.play('brOrb'); this.physics.velocityFromRotation(ang, this.eSpd(BRAS.shotSpeed), b.body.velocity); b.body.setGravityY(BRAS.shotGravity);
  },

  /* ---------- géométrie du sprite ---------- */
  brasPort(e, i){ const k = e.scaleX, p = BRAS.ports[i]; return [e.x + (p[0] - 256)*k, e.y + (p[1] - 256)*k]; },
  brasPix(st){
    this._brasPixC = this._brasPixC || [];
    if (!this._brasPixC[st]){ const c = document.createElement('canvas'); c.width = c.height = BRAS.frame; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(this.textures.get('brasSheet').getSourceImage(), st*BRAS.frame, 0, BRAS.frame, BRAS.frame, 0, 0, BRAS.frame, BRAS.frame); this._brasPixC[st] = x.getImageData(0, 0, BRAS.frame, BRAS.frame).data; }
    return this._brasPixC[st];
  },
  brasPortAlive(e, i){
    const a = this.brasPix(e._st), p = BRAS.ports[i], r = Phaser.Math.DegToRad(p[2]);
    for (let k = 0; k <= 36; k += 6){ const X = Math.round(p[0] - Math.cos(r)*k), Y = Math.round(p[1] - Math.sin(r)*k); if (X >= 0 && Y >= 0 && X < 512 && Y < 512 && a[(Y*512 + X)*4 + 3] > 128) return true; }
    return false;
  },
  brasHullPoint(e){
    const a = this.brasPix(e._st), k = e.scaleX;
    for (let n = 0; n < 12; n++){ const x = Phaser.Math.Between(140, 370), y = Phaser.Math.Between(80, 420); if (a[(y*512 + x)*4 + 3] > 200) return [e.x + (x - 256)*k, e.y + (y - 256)*k]; }
    return null;
  },

  /* ---------- usure et destruction : vrais morceaux découpés dans le sprite ---------- */
  // pièce = ensemble de cellules 4x4 de l'image `from` qui passent le test ; devient une texture mise en cache, puis un morceau qui retombe
  brasPiece(from, name, test, minCells){
    const key = 'brp_' + from + '_' + name; this._brasPc = this._brasPc || {};
    if (key in this._brasPc) return this._brasPc[key];
    const N = 128, a = this.brasPix(from), cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
    if (cells.length < minCells) return (this._brasPc[key] = null);
    const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const src = this.textures.get('brasSheet').getSourceImage();
    cells.forEach(([cx, cy])=> g.drawImage(src, from*BRAS.frame + cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4));
    this.textures.addCanvas(key, c); return (this._brasPc[key] = { key, c:[(x0 + x1 + 1)*2, (y0 + y1 + 1)*2] });
  },
  brasLaunch(e, p, power){
    if (!p) return;
    const k = e.scaleX, x = e.x + (p.c[0] - 256)*k, y = e.y + (p.c[1] - 256)*k, dx = x - e.x, dy = y - e.y;
    const s = this.add.image(x, y, p.key).setDepth(5).setScale(k), vx = dx*1.4*power + Phaser.Math.Between(-18, 18), vy = -Phaser.Math.Between(20, 70) + dy*0.5*power, life = Phaser.Math.Between(1300, 1900);
    this.tweens.add({ targets:s, x:x + vx*life/1000, angle:Phaser.Math.Between(-260, 260), alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:{ value:y + vy*0.35*life/1000 + 150, ease:'Quad.easeIn' }, duration:life, onComplete:()=> s.destroy() });
  },
  brasShards(e, st, n, power){
    const k = e.scaleX, src = this.textures.get('brasSheet').getSourceImage();
    for (let i = 0; i < n; i++){
      const p = this.brasHullPoint(e); if (!p) continue; const r = Phaser.Math.Between(6, 14), S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const sx = Math.round((p[0] - e.x)/k + 256), sy = Math.round((p[1] - e.y)/k + 256); g.drawImage(src, st*BRAS.frame + sx - r, sy - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
      const m = document.createElement('canvas'); m.width = m.height = S2; const mg = m.getContext('2d'); mg.fillStyle = '#fff'; mg.beginPath(); const nv = Phaser.Math.Between(5, 7);
      for (let j = 0; j < nv; j++){ const a = j/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; j ? mg.lineTo(X, Y) : mg.moveTo(X, Y); } mg.fill();
      g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0);
      const key = 'brs_' + (this._brasShardN = (this._brasShardN || 0) + 1); this.textures.addCanvas(key, c);
      const s = this.add.image(p[0], p[1], key).setDepth(5).setScale(k), dx = p[0] - e.x, dy = p[1] - e.y, life = Phaser.Math.Between(1200, 1800);
      this.tweens.add({ targets:s, x:p[0] + dx*1.2*power + Phaser.Math.Between(-15, 15), angle:Phaser.Math.Between(-300, 300), alpha:0, duration:life, ease:'Quad.easeIn' });
      this.tweens.add({ targets:s, y:p[1] + dy*0.6*power + 140, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
    }
  },
  brasWound(e, st){
    const from = e._st; e._st = st; e.setFrame(st);
    const b = this.brasPix(st);
    Object.keys(BRAS.limbs).forEach(n=>{ const t = BRAS.limbs[n]; this.brasLaunch(e, this.brasPiece(from, n + '_to' + st, (X, Y)=> t(X, Y) && b[(Y*512 + X)*4 + 3] < 128, 40), 0.8); });
    this.brasShards(e, from, 4, 1.1);
    this.acFx('brFxBoom', 'explodeBras', e.x + Phaser.Math.Between(-14, 14), e.y + Phaser.Math.Between(-12, 12), 0.5, {});
    sfx.brasBreak({ pan:this.panOf(e.x) });
    if (e.cur){ e.cur.chg.forEach(a=> a[1].destroy()); e.cur = null; }
    e.vq = e.vq.map(v=>({ ports:v.ports.filter(i=> this.brasPortAlive(e, i)), charge:v.charge })).filter(v=> v.ports.length);
  },
  brasDeath(e){
    if (e.cur) e.cur.chg.forEach(a=> a[1].destroy());
    Object.keys(BRAS.limbs).forEach(n=> this.brasLaunch(e, this.brasPiece(e._st, n, BRAS.limbs[n], 30), 1.2));
    this.brasShards(e, e._st, 10, 1.5);
    for (let i = 0; i < 2; i++) this.time.delayedCall(90 + i*110, ()=>{ this.acFx('brFxBoom', 'explodeBras', e.x + Phaser.Math.Between(-26, 26), e.y + Phaser.Math.Between(-24, 24), 0.55, {}); });
    for (let i = 0; i < 4; i++) this.acFx('acFxSpark', 'acSpark', e.x + Phaser.Math.Between(-30, 30), e.y + Phaser.Math.Between(-30, 30), 0.55);
  },
});
