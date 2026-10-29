"use strict";
// Méthodes de GameScene — mob « Le Pilleur de cristaux » (type 'pilleur', niveau `w1-l3`). Drone-collecteur : sa trappe dorsale s'ouvre, il ASPIRE les cristaux qui passent à portée (ceux que tu voulais ramasser),
// chaque cristal avalé remplit son réservoir, et le réservoir ALIMENTE le laser avant : tir continu tant qu'il a du stock, qui s'éteint quand le réservoir est vide. Détruit, il recrache son stock.
// 4 états d'usure (planche plSheet) ; les flancs partent en morceaux. Intelligence par tier (`tier` de l'entrée du niveau dans `spawns`) :
// 1 = avale ce qui passe à portée · 2 = va vers le cristal le plus proche · 3 = vise les cristaux près de toi et suit ta position avec son laser · 4 = en plus, appelle un second pilleur.
const PIL = {
  frame:512, scale:0.25, hp:90,
  hatch:{ rect:[214, 84, 300, 160], seam:257 },                                  // trappe dorsale (derrière) : deux portes qui coulissent, dans le sprite 512
  tank:[254, 247], muzzle:[254, 505],                                            // réservoir vert et bouche du laser
  states:[0.7, 0.45, 0.2],                                                       // fraction de vie sous laquelle on passe à l'état suivant
  rs:150, cap:8,                                                                 // portée de l'aspiration (pixels du jeu) et capacité du réservoir
  dmg:{ beam:6 }, beamSx:0.6,
  regions:[(x, y)=> x < 150, (x, y)=> x > 372, (x, y)=> x >= 150 && x <= 372 && y < 200, (x, y)=> x >= 150 && x <= 372 && y >= 200 && y < 340, (x, y)=> x >= 150 && x <= 372 && y >= 340],
};

mixin(GameScene, {
  pilInit(e){
    const sp = this.lvDef && this.lvDef.spawns && this.lvDef.spawns.find(s=> s.type === 'pilleur');
    e.tier = Phaser.Math.Clamp(e.waveTier || (sp && sp.tier) || 1, 1, 4);
    e._st = 0; e.energy = 0; e.open = 0; e.nearT = 99999; e.beam = false; e.charge = 0; e.combo = 0; e.lastGulp = -1e9; e.summoned = false; e.smokeCd = 600; e.hitCd = 0;
    e.hatchG = this.add.graphics().setDepth(4.1); e.vortex = this.add.sprite(0, 0, 'plFxSuction').setDepth(4.2).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0); e.vortex.play('plSuction');
    e.tankGlow = this.add.sprite(0, 0, 'plFxGlow').setDepth(4.2).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0); e.tankGlow.play('plGlow');
    e.bm = this.add.sprite(0, 0, 'plFxBeam').setDepth(3.9).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); e.bm.play('plBeam');
    e.mzGlow = this.add.sprite(0, 0, 'plFxGlow').setDepth(4.2).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); e.mzGlow.play('plGlow');
    e.dl = this.add.image(0, 0, 'plSheet').setDepth(4.15).setOrigin(0, 0).setVisible(false); e.dr = this.add.image(0, 0, 'plSheet').setDepth(4.15).setOrigin(0, 0).setVisible(false);
    e.once('destroy', ()=>{ [e.hatchG, e.vortex, e.tankGlow, e.bm, e.mzGlow, e.dl, e.dr].forEach(o=>{ if (o) o.destroy(); }); });
  },

  /* ---------- géométrie ---------- */
  pilP(e, sx, sy){ const k = e.scaleX; return [e.x + (sx - 256)*k, e.y + (sy - 256)*k]; },
  pilPix(st){
    this._plPixC = this._plPixC || [];
    if (!this._plPixC[st]){ const c = document.createElement('canvas'); c.width = c.height = PIL.frame; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(this.textures.get('plSheet').getSourceImage(), st*PIL.frame, 0, PIL.frame, PIL.frame, 0, 0, PIL.frame, PIL.frame); this._plPixC[st] = x.getImageData(0, 0, PIL.frame, PIL.frame).data; }
    return this._plPixC[st];
  },
  pilSolid(e, sx, sy){ return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && this.pilPix(e._st)[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  pilDoor(st, side){        // moitié gauche ou droite de la trappe, découpée dans l'état courant (elle garde la suie)
    const key = 'pld_' + st + side;
    if (!this.textures.exists(key)){ const [x0, y0, x1, y1] = PIL.hatch.rect, a = side === 'l' ? x0 : PIL.hatch.seam, b = side === 'l' ? PIL.hatch.seam : x1, c = document.createElement('canvas'); c.width = b - a; c.height = y1 - y0; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(this.textures.get('plSheet').getSourceImage(), st*PIL.frame + a, y0, b - a, y1 - y0, 0, 0, b - a, y1 - y0); this.textures.addCanvas(key, c); }
    return key;
  },

  /* ---------- à chaque image ---------- */
  pilUpdate(e, delta){
    const k = e.scaleX, A = this._plAgg = this._plAgg || { laser:0, suction:0, hum:0, lr:0, hr:0 }, pl = this.player, dt60 = delta/16.667;
    e.wobble += delta; e.hitCd -= delta;
    if (e.y >= e.stopY && e.body.velocity.y !== 0) e.body.velocity.y = 0;
    const stopped = e.body.velocity.y === 0;
    // état d'usure selon la vie
    const f = e.hp/e.maxHp, st = f > PIL.states[0] ? 0 : f > PIL.states[1] ? 1 : f > PIL.states[2] ? 2 : 3; if (st > e._st) this.pilWound(e, st);
    const [hx, hy] = this.pilP(e, 257, 122), [tx, ty] = this.pilP(e, PIL.tank[0], PIL.tank[1]), [mx, my] = this.pilP(e, PIL.muzzle[0], PIL.muzzle[1]);
    // aspiration : tout cristal à portée est tiré vers la trappe (la vitesse voulue pointe toujours vers elle : pas d'orbite, pas d'éjection)
    let near = false, tgt = null, tgtD = 1e9; const RS = PIL.rs, full = e.energy >= PIL.cap;
    this.gems.children.iterate(g=>{
      if (!g || !g.active) return; const dx = hx - g.x, dy = hy - g.y, d = Math.hypot(dx, dy) + 1e-6;
      if (e.tier >= 3 ? Phaser.Math.Distance.Between(g.x, g.y, pl.x, pl.y) < tgtD : d < tgtD){ if (e.tier >= 2 && Math.abs(g.y - e.y) < 330){ tgtD = e.tier >= 3 ? Phaser.Math.Distance.Between(g.x, g.y, pl.x, pl.y) : d; tgt = g; } }
      if (d >= RS || full) return; near = true;
      if (e.open > 0.55){
        const kk = 1 - d/RS, sp = 60 + 300*kk*kk, ux = dx/d, uy = dy/d, sw = 0.5*(d/RS)*60, lerp = 1 - Math.pow(0.78, dt60), b = g.body;
        b.velocity.x += ((ux*sp - uy*sw) - b.velocity.x)*lerp; b.velocity.y += ((uy*sp + ux*sw) - b.velocity.y)*lerp;
        if (d < 10){ g.destroy(); this.pilGulp(e, hx, hy, tx, ty); }
      }
    });
    if (near) e.nearT = 0; else e.nearT += delta;
    const want = (e.nearT < 1100 && !full) ? 1 : 0, was = e.open > 0.5; e.open += (want - e.open)*(1 - Math.pow(0.93, dt60));
    if (!was && e.open > 0.5) sfx.plHatchOpen({ pan:this.panOf(e.x) }); if (was && e.open < 0.45) sfx.plHatchClose({ pan:this.panOf(e.x) });
    // le pilleur se déplace : il se met en position, puis glisse vers le cristal visé (tier 2+) ou ne fait que flotter (tier 1) ; tier 3+ : son laser suit le joueur quand il tire
    if (stopped){
      let wx = e.baseX; if (e.tier >= 3 && e.beam) wx = pl.x; else if (e.tier >= 2 && tgt) wx = tgt.x;
      e.baseX += Phaser.Math.Clamp(wx - e.baseX, -1, 1)*delta*0.05; e.x = e.baseX + Math.sin(e.wobble/1000 + e.ph)*14;
    }
    // laser alimenté par le réservoir : continu tant qu'il y a du stock
    const mAlive = this.pilSolid(e, PIL.muzzle[0], PIL.muzzle[1] - 12);
    if (!e.beam && e.energy > 0.3 && mAlive){ e.beam = true; e.charge = 0; sfx.plLaserStart({ pan:this.panOf(e.x) }); this.pilFx('plFxCharge', 'plCharge', mx, my, 0.5, 8); }
    if (e.beam){ e.charge += dt60; if (e.charge > 14) e.energy -= 0.0095*dt60; if (e.energy <= 0.02 || !mAlive){ e.beam = false; e.energy = Math.max(0, e.energy); sfx.plLaserEnd({ pan:this.panOf(e.x) }); } }
    if (e.tier >= 4 && !e.summoned && e.energy >= 4){ e.summoned = true; const c = this.spawnOneEnemy('pilleur', Phaser.Math.Clamp(e.x + (e.x < GAME_W/2 ? 100 : -100), 40, GAME_W - 40)); if (c){ c.summoned = true; c.tier = 3; } }
    // dessin : trappe qui s'ouvre, tourbillon, réservoir, faisceau
    this.pilDraw(e, k, hx, hy, tx, ty, mx, my);
    if (e.beam && e.charge > 14){
      const th = (0.55 + 0.45*Phaser.Math.Clamp(e.energy/2.2, 0, 1))*(e.charge < 20 ? (e.charge - 14)/6 : 1)*(e.energy < 0.5 ? 0.6 + 0.4*Math.sin(this.time.now*0.08) : 1);
      if (pl && pl.active && Math.abs(pl.x - mx) < 8 + 10*th && pl.y > my && e.hitCd <= 0){ e.hitCd = 120; this.damagePlayer(this.waveDamage(e,PIL.dmg.beam)); this.pilFx('plFxImpact', 'plImpact', pl.x, pl.y - 8, 0.7, 7); }
    }
    // dégâts visibles : fumée puis étincelles
    if (e._st >= 1){ e.smokeCd -= delta; if (e.smokeCd <= 0){ e.smokeCd = [0, 700, 420, 260][e._st]; const op = this.pilPix(e._st); const x = Phaser.Math.Between(150, 372), y = Phaser.Math.Between(60, 440); if (this.pilSolid(e, x, y)){ const [wx, wy] = this.pilP(e, x, y); this.acFx('acFxSmoke', 'acSmoke', wx, wy - 3, 0.25 + e._st*0.07, { normal:true, vy:-18, alpha:0.8 }); if (e._st >= 2) this.pilFx('plFxSpark', 'plSpark', wx, wy, 0.5, 8); } } }
    // sons continus (agrégés si plusieurs pilleurs)
    A.laser = Math.max(A.laser, e.beam && e.charge > 14 ? 1 : 0); A.lr = Math.max(A.lr, Phaser.Math.Clamp(e.energy/3, 0, 1)); A.suction = Math.max(A.suction, e.open*(near ? 1 : 0.25)); A.hum = Math.max(A.hum, Phaser.Math.Clamp(e.energy/PIL.cap, 0, 1)); A.hr = Math.max(A.hr, Phaser.Math.Clamp(e.energy/PIL.cap, 0, 1));
  },
  plLoopsApply(){
    const A = this._plAgg; if (!A) return;
    try { sfx.loopSet('plLaser', A.laser*0.85, 0.9 + 0.25*A.lr); sfx.loopSet('plSuction', Phaser.Math.Clamp(A.suction, 0, 1), 0.9 + 0.2*A.suction); sfx.loopSet('plHum', A.hum*0.9 + (A.hum > 0 ? 0.1 : 0), 0.8 + 0.5*A.hr); } catch(e){ /* ignore */ }
    this._plAgg = { laser:0, suction:0, hum:0, lr:0, hr:0 };
  },
  pilGulp(e, hx, hy, tx, ty){
    const now = this.time.now; e.combo = (now - e.lastGulp < 900) ? Math.min(e.combo + 1, 7) : 0; e.lastGulp = now; e.energy = Math.min(PIL.cap, e.energy + 1); e.eaten = (e.eaten || 0) + 1;
    sfx.plGulp({ pan:this.panOf(e.x), rate:1 + e.combo*0.07 }); this.pilFx('plFxImpact', 'plImpact', hx, hy, 0.4, 8);
    const s = this.add.sprite(hx, hy, 'plFxGlow').setDepth(4.3).setBlendMode(Phaser.BlendModes.ADD).setScale(0.45); this.tweens.add({ targets:s, x:tx, y:ty, alpha:0.2, duration:420, onComplete:()=> s.destroy() });     // la lumière file de la trappe au réservoir
  },
  pilFx(key, anim, x, y, scale, depth){ const s = this.add.sprite(x, y, key).setDepth(depth || 8).setScale(scale).setBlendMode(Phaser.BlendModes.ADD); s.play(anim); s.once('animationcomplete', ()=> s.destroy()); return s; },
  pilDraw(e, k, hx, hy, tx, ty, mx, my){
    const g = e.hatchG, eo = e.open*e.open*(3 - 2*e.open), st = e._st, [x0, y0, x1, y1] = PIL.hatch.rect, [ax, ay] = this.pilP(e, x0, y0), w = (x1 - x0)*k, hh = (y1 - y0)*k, sp = (PIL.hatch.seam - x0)*k;
    g.clear(); e.dl.setVisible(eo > 0.02); e.dr.setVisible(eo > 0.02); e.vortex.setAlpha(0.5*eo).setScale(0.55*eo + 0.001).setPosition(hx, hy);
    if (eo > 0.02){
      g.fillGradientStyle(0x02080a, 0x02080a, 0x0a2210, 0x0a2210, 1); g.fillRect(ax + 1, ay + 1, w - 2, hh - 2); g.fillStyle(0x5dff7a, 0.35*eo); g.fillRect(ax + w*0.25, ay + hh*0.25, w*0.5, hh*0.5); g.lineStyle(1, 0x000000, 1); g.strokeRect(ax, ay, w, hh);
      e.dl.setTexture(this.pilDoor(st, 'l')).setScale(k).setPosition(ax - sp*eo*0.72, ay); e.dr.setTexture(this.pilDoor(st, 'r')).setScale(k).setPosition(ax + sp + sp*eo*0.72, ay);
    }
    const en = Phaser.Math.Clamp(e.energy/PIL.cap, 0, 1); e.tankGlow.setPosition(tx, ty).setScale(0.55).setAlpha((0.1 + 0.8*en)*(0.75 + 0.25*Math.sin(this.time.now*0.012)));
    const on = e.beam && e.charge > 14; e.bm.setVisible(on); e.mzGlow.setVisible(e.beam);
    if (e.beam) e.mzGlow.setPosition(mx, my).setScale(on ? 0.45 + 0.07*Math.sin(this.time.now*0.03) : 0.3).setAlpha(0.9);
    if (on){ const len = this.visibleYRange(0).max + 30 - my, th = (0.55 + 0.45*Phaser.Math.Clamp(e.energy/2.2, 0, 1))*(e.charge < 20 ? (e.charge - 14)/6 : 1)*(e.energy < 0.5 ? 0.6 + 0.4*Math.sin(this.time.now*0.08) : 1); e.bm.setPosition(mx, my).setScale(PIL.beamSx*th, Math.max(0.1, len/128)).setAlpha(0.95); }
  },

  /* ---------- usure et destruction : vrais morceaux découpés dans le sprite ---------- */
  pilPiece(from, name, test, minCells){
    const key = 'plp_' + from + '_' + name; this._plPc = this._plPc || {}; if (key in this._plPc) return this._plPc[key];
    const N = 128, a = this.pilPix(from), cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
    if (cells.length < minCells) return (this._plPc[key] = null);
    const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.textures.get('plSheet').getSourceImage();
    cells.forEach(([cx, cy])=> x.drawImage(src, from*PIL.frame + cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); this.textures.addCanvas(key, c); return (this._plPc[key] = { key, c:[(x0 + x1 + 1)*2, (y0 + y1 + 1)*2] });
  },
  pilLaunch(e, p, power){
    if (!p) return; const k = e.scaleX, x = e.x + (p.c[0] - 256)*k, y = e.y + (p.c[1] - 256)*k, dx = x - e.x, dy = y - e.y;
    const s = this.add.image(x, y, p.key).setDepth(5).setScale(k), vx = dx*1.4*power + Phaser.Math.Between(-18, 18), vy = -Phaser.Math.Between(20, 70) + dy*0.5*power, life = Phaser.Math.Between(1300, 1900);
    this.tweens.add({ targets:s, x:x + vx*life/1000, angle:Phaser.Math.Between(-260, 260), alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:{ value:y + vy*0.35*life/1000 + 150, ease:'Quad.easeIn' }, duration:life, onComplete:()=> s.destroy() });
  },
  pilShards(e, st, n, power){
    const k = e.scaleX, src = this.textures.get('plSheet').getSourceImage();
    for (let i = 0; i < n; i++){
      const x = Phaser.Math.Between(120, 400), y = Phaser.Math.Between(60, 470); if (!this.pilSolid(e, x, y)) continue; const r = Phaser.Math.Between(6, 14), S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(src, st*PIL.frame + x - r, y - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
      const m = document.createElement('canvas'); m.width = m.height = S2; const mg = m.getContext('2d'); mg.fillStyle = '#fff'; mg.beginPath(); const nv = Phaser.Math.Between(5, 7);
      for (let j = 0; j < nv; j++){ const a = j/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; j ? mg.lineTo(X, Y) : mg.moveTo(X, Y); } mg.fill();
      g.globalCompositeOperation = 'destination-in'; g.drawImage(m, 0, 0);
      const key = 'pls_' + (this._plShardN = (this._plShardN || 0) + 1); this.textures.addCanvas(key, c);
      const [wx, wy] = this.pilP(e, x, y), s = this.add.image(wx, wy, key).setDepth(5).setScale(k), life = Phaser.Math.Between(1200, 1800);
      this.tweens.add({ targets:s, x:wx + (wx - e.x)*1.2*power + Phaser.Math.Between(-15, 15), angle:Phaser.Math.Between(-300, 300), alpha:0, duration:life, ease:'Quad.easeIn' });
      this.tweens.add({ targets:s, y:wy + (wy - e.y)*0.6*power + 120, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
    }
  },
  pilWound(e, st){
    const from = e._st; e._st = st; e.setFrame(st); const b = this.pilPix(st);
    this.pilLaunch(e, this.pilPiece(from, 'L' + st, (X, Y)=> X < 150 && b[(Y*512 + X)*4 + 3] < 128, 40), 0.8); this.pilLaunch(e, this.pilPiece(from, 'R' + st, (X, Y)=> X > 372 && b[(Y*512 + X)*4 + 3] < 128, 40), 0.8);
    this.pilShards(e, from, 5, 1.1); this.pilFx('rxFxBoomM', 'rxBoomM', e.x + Phaser.Math.Between(-14, 14), e.y + Phaser.Math.Between(-12, 12), 0.5, 8); sfx.plBreak({ pan:this.panOf(e.x) }); this.cameras.main.shake(120, 0.005);
  },
  pilDeath(e){        // destruction : chaque morceau part en un bloc, et le stock de cristaux est recraché (à ramasser)
    PIL.regions.forEach((t, i)=> this.pilLaunch(e, this.pilPiece(e._st, 'D' + i, t, 30), 1.2)); this.pilShards(e, e._st, 12, 1.5);
    const n = Math.round(e.energy) + 3, vx = this.visibleXRange(10);
    for (let i = 0; i < n; i++){ const kind = Math.random() < 0.5 ? 'gemS' : 'gemM'; this.spawnGemAt(Phaser.Math.Clamp(e.x + Phaser.Math.Between(-24, 24), vx.min, vx.max), e.y + Phaser.Math.Between(-10, 10), kind === 'gemM' ? 3 : 2, kind, Phaser.Math.Between(30, 90));
      const g = this.gems.getChildren()[this.gems.getLength() - 1]; if (g && g.body){ g.body.velocity.x = Phaser.Math.Between(-110, 110); } }
    sfx.plSpill({ pan:this.panOf(e.x) }); this.time.delayedCall(260, ()=> sfx.plSpill({ pan:this.panOf(e.x) }));
  },
});
