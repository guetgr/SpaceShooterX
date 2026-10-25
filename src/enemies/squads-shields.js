"use strict";
// Méthodes de GameScene — escouades, boucliers ennemis, esquive coordonnée.
mixin(GameScene, {
  // ================= COORDINATION DES ENNEMIS =================
  // Niveau de coordination c: 0 à l'alerte 2, progressif, 1 (pleinement coordonnés) à l'alerte 10. Le nombre d'ennemis ne change pas: seule leur façon de jouer ensemble.
  //  - blindés (tank, bouclier, élite) en première ligne: ils se placent sur la colonne du joueur pour le couvrir
  //  - tireurs (shooter, tourelle, sniper) derrière un blindé, pour qu'il encaisse à leur place
  //  - healers au centre de l'escouade, un peu en retrait
  //  - salves synchronisées + tirs avec anticipation du déplacement du joueur
  //  - réaction aux événements: ils résistent aux forces (trou noir, glace, magnétisme), restent dans le couloir, se replient pendant l'EMP, évitent la boule de plasma
  coordRole(e){ const t = e.enemyType; return (t === 'tank' || t === 'shieldedGrunt' || t === 'elite') ? 'front' : ((t === 'shooter' || t === 'turret' || t === 'sniper') ? 'back' : (t === 'healer' ? 'heal' : null)); },

  coordResist(e){ return this.coordRole(e) ? 1 - 0.65*(this._coord || 0) : 1; },

  leadAngle(e, spd){
    const c = this._coord || 0; let tx = this.player.x, ty = this.player.y;
    if (c > 0){ const d = Phaser.Math.Distance.Between(e.x, e.y, tx, ty), tt = d / Math.max(80, this.eSpd(spd)); tx += (this._pvx || 0)*tt*0.85*c; ty += (this._pvy || 0)*tt*0.85*c; }
    return Phaser.Math.Angle.Between(e.x, e.y, tx, ty);
  },

  squadShift(e, dx){
    if (!dx) return; const v = this.visibleXRange(24);
    let nx = Phaser.Math.Clamp(e.x + dx, v.min, v.max); if (this._corr && this._corr.on) nx = this.corrClampX(nx, e.y);
    const d = nx - e.x; e.x = nx; if (e.baseX !== undefined) e.baseX += d;
  },

  // ---- boucliers ennemis (niveau 8+, boss au niveau 10): bulle visible autour du sprite, régénération après un délai
  // le bouclier d'un ennemi (ou d'un boss) éclate: bulle qui gonfle et s'éteint, onde de choc, flash et éclats hexagonaux projetés
  shieldShatter(e, big){
    const x = e.x, y = e.y, d = Math.max(e.displayWidth, e.displayHeight)*(big ? 1.08 : 1.35) + 8, R = d/2;
    const srcs = [e].concat(e.bossId ? (e.parts || []).filter(q=> q && q.active && q.partRole !== 'decoy').slice(0, 40) : []);
    srcs.forEach(q=>{
      if (!q.texture || !q.frame) return;
      const b = this.add.image(q.x, q.y, q.texture.key, q.frame.name).setDepth(6.5).setBlendMode(Phaser.BlendModes.ADD).setTintFill(0xbff0ff).setAlpha(0.95).setAngle(q.angle).setFlip(q.flipX, q.flipY).setScale(q.scaleX*1.1, q.scaleY*1.1);
      this.tweens.add({ targets:b, scaleX:q.scaleX*1.6, scaleY:q.scaleY*1.6, alpha:0, duration:big ? 520 : 340, ease:'Quad.easeOut', onComplete:()=> b.destroy() });
    });
    const rg = this.add.image(x, y, 'shockRing').setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setTint(0xbff0ff).setScale(R/256).setAlpha(0.9);
    this.tweens.add({ targets:rg, scaleX:R*2.4/256, scaleY:R*2.4/256, alpha:0, duration:big ? 520 : 360, ease:'Quad.easeOut', onComplete:()=> rg.destroy() });
    const n = big ? 26 : 12;
    for (let i=0;i<n;i++){
      const a = i/n*Math.PI*2 + Math.random()*0.4, sz = (big ? 7 : 4) + Math.random()*3;
      const sh = this.add.polygon(x + Math.cos(a)*R*0.9, y + Math.sin(a)*R*0.9, [0,-sz, sz*0.87,-sz*0.5, sz*0.87,sz*0.5, 0,sz, -sz*0.87,sz*0.5, -sz*0.87,-sz*0.5], 0x9fe8ff, 0.85).setDepth(6.6).setBlendMode(Phaser.BlendModes.ADD).setStrokeStyle(1, 0xffffff, 0.9);
      const dist = R*(0.6 + Math.random()*0.9) + 16;
      this.tweens.add({ targets:sh, x:x + Math.cos(a)*(R*0.9 + dist), y:y + Math.sin(a)*(R*0.9 + dist), angle:Phaser.Math.Between(-240,240), alpha:0, scale:0.3, duration:Phaser.Math.Between(380, big ? 700 : 520), ease:'Cubic.easeOut', onComplete:()=> sh.destroy() });
    }
    if (big){ this.cameras.main.shake(160, 0.005); const fl = this.add.circle(x, y, R*0.7, 0xffffff, 0.5).setDepth(6.7).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets:fl, alpha:0, scale:1.6, duration:240, onComplete:()=> fl.destroy() }); }
  },

  // contour lumineux d'un sprite (comme l'aura du joueur): silhouette dilatée moins l'intérieur, mis en cache par frame
  auraTexFor(q, thick){
    const f = q.frame; if (!f || !f.source || !f.source.image || !(f.cutWidth > 0)) return null;
    const kz = Phaser.Math.Clamp(1/this.cameras.main.zoom, 1, 1.8), sx = Math.abs(q.scaleX) || 1;
    const pad = Math.max(2, Math.min(30, Math.round(thick*kz/sx))), inner = Math.max(0, pad - Math.max(1.5, 2/sx));   // anneau fin: ~2 px d'épaisseur, collé à l'extérieur du sprite
    const key = 'ea|' + q.texture.key + '|' + f.name + '|' + pad, cw = f.cutWidth, ch = f.cutHeight, W = cw + 2*pad, H = ch + 2*pad;
    if (!this.textures.exists(key)){
      const sil = document.createElement('canvas'); sil.width = cw; sil.height = ch; const sg = sil.getContext('2d');
      try { sg.drawImage(f.source.image, f.cutX, f.cutY, cw, ch, 0, 0, cw, ch); } catch(err){ return null; }
      sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#fff'; sg.fillRect(0, 0, cw, ch);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
      for (let k=0;k<24;k++){ const a = k/24*Math.PI*2; g.drawImage(sil, pad + Math.cos(a)*pad, pad + Math.sin(a)*pad); }
      g.globalCompositeOperation = 'destination-out';
      for (let k=0;k<24;k++){ const a = k/24*Math.PI*2; g.drawImage(sil, pad + Math.cos(a)*inner, pad + Math.sin(a)*inner); }
      g.drawImage(sil, pad, pad);
      this.textures.addCanvas(key, cv);
    }
    return { key, ox:(pad + q.originX*cw)/W, oy:(pad + q.originY*ch)/H };
  },

  enemyOnScreenLoose(q){ const v = this._vrCache; return !v || (q.y > v.y0 - 80 && q.y < v.y1 + 80 && q.x > v.x0 - 80 && q.x < v.x1 + 80); },

  updateEnemyShields(delta){
    const dt = delta/1000, al = this.alertLevel;
    if (!this.textures.exists('eBubble')){
      const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
      const gr = g.createRadialGradient(128,128,70,128,128,124);
      gr.addColorStop(0,'rgba(120,220,255,0.05)'); gr.addColorStop(0.8,'rgba(120,220,255,0.28)'); gr.addColorStop(0.93,'rgba(200,245,255,0.85)'); gr.addColorStop(1,'rgba(200,245,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(128,128,126,0,Math.PI*2); g.fill();
      this.textures.addCanvas('eBubble', cv);
    }
    const lv = (1 + 0.04*((this.level||1)-1));
    { const vx = this.visibleXRange(0), vy = this.visibleYRange(0); this._vrCache = { x0:vx.min, x1:vx.max, y0:vy.min, y1:vy.max }; }
    this.enemies.children.iterate(e=>{
      if (!e || !e.active) return;
      if (e.bossId && al >= 10 && !e._aShield && e.maxHp > 0 && e.hp > 0){
        e._aShield = true; e.shieldMaxHp = e.maxHp*(0.15 + 0.03*(al-10))*lv; e.shieldHp = e.shieldMaxHp; e.shieldRegenDelay = 0;
      }
      if (!e._aShield) return;
      if (e.bossId){
        const els = this.bossEls(e), key = (e.phase||1) + ':' + (e._second ? 1 : 0);
        if (e._shKey !== undefined && e._shKey !== key){                                   // changement de phase / de forme: le bouclier revient en entier
          e.shieldHp = e.shieldMaxHp; e.shieldRegenDelay = 0; sfx.shieldHit({ pan:this.panOf(e.x) });
          const rg = this.add.image(e.x, e.y, 'shockRing').setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setTint(0x8fdcff).setScale(0.9).setAlpha(0.9);
          this.tweens.add({ targets:rg, scaleX:0.1, scaleY:0.1, alpha:0, duration:420, ease:'Quad.easeIn', onComplete:()=> rg.destroy() });
        }
        e._shKey = key;
        if (els.shTrack){ els.shTrack.style.display = 'block'; els.shFill.style.width = Math.max(0, Math.min(100, e.shieldHp/e.shieldMaxHp*100)) + '%'; els.shFill.classList.toggle('wait', e.shieldRegenDelay > 0); }
      }
      if (e.shieldHp < e.shieldMaxHp){
        if (e.shieldRegenDelay > 0) e.shieldRegenDelay -= delta;
        else e.shieldHp = Math.min(e.shieldMaxHp, e.shieldHp + e.shieldMaxHp*(e.bossId ? 0.06 : 0.22)*(1 + 0.1*(al-8))*dt);
      }
      if (e.shieldHp > 0 && !e._auraOn){ e._auraOn = true; (this._auras = this._auras || []).push(e); }
      if (e._shInv > 0 && e.enemyType !== 'ghost' && !e.bossId){                          // petite invincibilité après la casse du bouclier: l'ennemi clignote
        if (this.time.now < e._shInv) e.setAlpha(0.5 + 0.3*Math.sin(this.time.now/45)); else { e._shInv = 0; e.setAlpha(1); }
      }
    });
    if (!this._auras) return;
    const t = this.time.now, keep = [];
    this._auras.forEach(e=>{
      const map = e._auraImgs || (e._auraImgs = new Map());
      if (!e.active || !(e.shieldHp > 0)){ map.forEach(im=> im.destroy()); map.clear(); e._auraOn = false; return; }
      const r = e.shieldHp/e.shieldMaxHp, wait = e.shieldRegenDelay > 0, pulse = Math.sin(t/170 + e.x*0.01);
      const srcs = e.bossId ? [e].concat((e.parts || []).filter(q=> q && q.active && q.partRole !== 'decoy').slice(0, 40)) : [e];
      if (map.size > srcs.length || e.bossId) map.forEach((im, q)=>{ if (!q.active || srcs.indexOf(q) < 0){ im.destroy(); map.delete(q); } });
      const col = wait ? 0xffc47a : 0x7fe0ff, al0 = (this._empOn ? 0.15 : (0.55 + 0.35*r + 0.1*pulse));
      for (let i=0;i<srcs.length;i++){
        const q = srcs[i];
        if (!q.texture || !q.frame) continue;
        let im = map.get(q);
        if (!(q.visible && q.alpha > 0.02) || !this.enemyOnScreenLoose(q)){ if (im) im.setVisible(false); continue; }      // hors écran / invisible: rien à dessiner
        const at = this.auraTexFor(q, e.bossId ? 5 : 3.5); if (!at) continue;
        if (!im){ im = this.add.image(q.x, q.y, at.key).setBlendMode(Phaser.BlendModes.ADD); map.set(q, im); }
        if (im._ak !== at.key){ im.setTexture(at.key).setOrigin(at.ox, at.oy); im._ak = at.key; }
        if (im._col !== col){ im.setTintFill(col); im._col = col; }
        if (im._fx !== q.flipX || im._fy !== q.flipY){ im.setFlip(q.flipX, q.flipY); im._fx = q.flipX; im._fy = q.flipY; }
        if (im._sx !== q.scaleX || im._sy !== q.scaleY){ im.setScale(q.scaleX, q.scaleY); im._sx = q.scaleX; im._sy = q.scaleY; }
        im.setVisible(true).setDepth(q.depth + 0.5).setPosition(q.x, q.y).setAngle(q.angle).setAlpha(al0 * q.alpha);
      }
      keep.push(e);
    });
    this._auras = keep;
  },

  // IA évoluée (niveau 6 -> 11): les ennemis voient arriver tes tirs et tes missiles et se décalent au dernier moment,
  // et fuient les pièges (trous noirs, boule de plasma). Plus le niveau monte, plus ils réagissent souvent et vite — mais un tir très rapide ou en rafale passe encore.
  updateDodge(delta){
    const al = this.alertLevel, sk = Phaser.Math.Clamp((al - 5)/6, 0, 1);
    if (sk <= 0 || this.introActive || !this.player.active || this._empOn || (this.sandbox && !this.sbAI)) return;
    const dt = delta/1000;
    this._dgT = (this._dgT || 0) - delta;
    const scan = this._dgT <= 0;
    if (scan){
      this._dgT = 90;
      const thr = [];
      const push = b=>{ if (b && b.active && b.body && (b.body.velocity.x || b.body.velocity.y)) thr.push(b); };
      this.playerBullets.children.iterate(push); this.missiles.children.iterate(push);
      this._dgBul = thr;
    }
    const AG = { drone:1, ghost:1, diver:0.9, charo:0.9, grunt:0.8, splitter:0.7, bomber:0.6, shooter:0.7, sniper:0.5, spider:0.7, elite:0.55, turret:0.3, tank:0.3, healer:0.6, vortex:0.5, mothership:0.2 };
    const bl = this._dgBul || [], now = this.time.now, vy0 = this.visibleYRange(0).min;
    this.enemies.children.iterate(e=>{
      if (!e || !e.active || e.bossId || e.isBossPart || e._arriving || e.wallX !== undefined || e.y < vy0 + 10) return;
      const ag = AG[e.enemyType]; if (!ag) return;
      // esquive en cours: glissade latérale + petite inclinaison
      if (e._dgLeft > 0){ const k = Math.min(dt, e._dgLeft); e._dgLeft -= dt; this.squadShift(e, e._dgDir*e._dgSpd*k); if (e.setAngle && e.enemyType !== 'turret') e.angle = Phaser.Math.Linear(e.angle, e._dgDir*14, 0.25); }
      else if (e._dgDir && e.angle !== undefined && e.setAngle){ e.angle = Phaser.Math.Linear(e.angle, 0, 0.2); if (Math.abs(e.angle) < 0.5){ e.angle = 0; e._dgDir = 0; } }
      // pièges
      const flee = (px, py, R, str)=>{ const dx = e.x - px, dy = e.y - py, d = Math.hypot(dx, dy); if (d < R){ this.squadShift(e, (dx >= 0 ? 1 : -1)*str*sk*ag*dt*(1 - d/R + 0.3)); } };
      (this._wells || []).forEach(w=> flee(w.x, w.y, w.r*0.9, 120));
      if (this.hole) flee(this.hole.x, this.hole.y, this.hole.R*0.9, 100);
      if (this._plasma) flee(this._plasma.img.x, this._plasma.img.y, 190, 130);
      if (!scan || e._dgCd > now || e._dgLeft > 0) return;
      // tirs / missiles qui vont les toucher dans les 0,55 s
      const rad = Math.max(10, e.displayWidth*0.5) + 8; let hit = null, best = 1;
      for (let i=0; i<bl.length; i++){
        const b = bl[i]; if (!b.active) continue;
        const vx = b.body.velocity.x, vy = b.body.velocity.y, v2 = vx*vx + vy*vy; if (v2 < 100) continue;
        const rx = e.x - b.x, ry = e.y - b.y;
        if (ry > 520 || ry < -40 || Math.abs(rx) > 260) continue;
        const t = (rx*vx + ry*vy)/v2; if (t <= 0 || t > 0.55) continue;
        const cx = b.x + vx*t - e.x, cy = b.y + vy*t - e.y;
        if (cx*cx + cy*cy < rad*rad && t < best){ best = t; hit = cx; }
      }
      if (hit === null) return;
      e._dgCd = now + 900 - 450*sk;
      if (Math.random() > 0.3 + 0.5*sk*ag) return;                                   // il n'a pas vu / pas réagi à temps
      e._dgDir = hit > 0 ? -1 : (hit < 0 ? 1 : (e.x < GAME_W/2 ? 1 : -1));
      e._dgSpd = (130 + 120*sk)*ag + 40; e._dgLeft = 0.22 + 0.08*sk;
    });
  },

  updateSquads(delta){
    const dt = delta/1000, px = this.player.x, py = this.player.y;
    if (this._ppx !== undefined && dt > 0){ this._pvx = Phaser.Math.Clamp((px - this._ppx)/dt, -700, 700)*0.5 + (this._pvx||0)*0.5; this._pvy = Phaser.Math.Clamp((py - this._ppy)/dt, -700, 700)*0.5 + (this._pvy||0)*0.5; }
    this._ppx = px; this._ppy = py;
    const c = Phaser.Math.Clamp((this.alertLevel - 2)/8, 0, 1); this._coord = c;
    const f = Phaser.Math.Clamp((this.alertLevel - 7)/3, 0, 1);   // 0 jusqu'à 7, puis +33% par niveau: 8 -> 10 les formations se resserrent nettement
    if (c <= 0 || this.introActive || !this.player.active || (this.sandbox && !this.sbAI)) return;
    const vy0 = this.visibleYRange(0).min, front = [], back = [], heal = [], lane = [];
    this.enemies.children.iterate(e=>{
      if (!e || !e.active || e._arriving || e.wallX !== undefined || e.y < vy0 - 20) return;
      const r = this.coordRole(e); if (r === 'front') front.push(e); else if (r === 'back') back.push(e); else if (r === 'heal') heal.push(e); else if (f > 0 && (e.enemyType === 'grunt' || e.enemyType === 'drone' || e.enemyType === 'charo' || e.enemyType === 'bomber' || e.enemyType === 'splitter') && e.flank !== true) lane.push(e);
    });
    if (front.length > 60) front.length = 60; if (back.length > 60) back.length = 60;
    const sep = (arr, min, k)=>{ for (let i=0;i<arr.length;i++) for (let j=i+1;j<arr.length;j++){ const a = arr[i], b = arr[j], d = a.x - b.x; if (Math.abs(a.y - b.y) < 40 && Math.abs(d) < min){ const push = (min - Math.abs(d))*k*dt*(d >= 0 ? 1 : -1); this.squadShift(a, push); this.squadShift(b, -push); } } };
    // première ligne: se décale pour couvrir la colonne du joueur (en s'étalant en éventail)
    front.forEach((e, i)=>{ const tx = px + ((i % 3) - 1)*58, dx = tx - e.x; if (Math.abs(dx) > 18) this.squadShift(e, Math.sign(dx)*Math.min(Math.abs(dx), 44*c*dt/0.016*0.016)); });
    sep(front, 48 - 10*f, 4);
    // niveau 8 -> 10: les unités légères se rangent en V / lignes autour de la colonne du joueur, de plus en plus serré
    if (f > 0){
      lane.sort((a,b)=> a.x - b.x);
      lane.forEach((e, i)=>{ const k = i - (lane.length-1)/2, tx = px + k*(78 - 26*f); const dx = tx - e.x; if (Math.abs(dx) > 14) this.squadShift(e, Math.sign(dx)*Math.min(Math.abs(dx), 46*f*dt)); });
      sep(lane, 40, 3);
    }
    // tireurs: derrière le blindé le plus proche situé plus bas (entre eux et le joueur)
    back.forEach(e=>{
      let best = null, bd = 1e9; front.forEach(f=>{ const d = Math.abs(f.x - e.x); if (f.y > e.y + 24 && d < 300 && d < bd){ bd = d; best = f; } });
      if (best){
        const dx = best.x - e.x; if (Math.abs(dx) > 6) this.squadShift(e, Math.sign(dx)*Math.min(Math.abs(dx), 56*c*dt));
        if (e.stopY !== undefined && e.stopY > best.y - 62) e.stopY = Math.max(vy0 + 50, best.y - 62);
      }
      if (this._empOn && c > 0.3) e.y -= 28*dt;                                       // EMP: les armes sont coupées, ils se replient
    });
    // niveau 9+: tenaille — une partie des tireurs file vers les bords de l'écran pour un tir croisé
    if (f >= 0.6){ const vx = this.visibleXRange(40); back.forEach((e, i)=>{ if (i % 3 !== 0) return; const tx = (Math.floor(i/3) % 2) ? vx.max : vx.min, dx = tx - e.x; if (Math.abs(dx) > 10) this.squadShift(e, Math.sign(dx)*Math.min(Math.abs(dx), 60*f*dt)); }); }
    sep(back, 36, 3);
    // healers: au milieu de l'escouade, légèrement en retrait
    heal.forEach(e=>{
      const grp = front.concat(back).filter(o=> Math.abs(o.x - e.x) < 320 && Math.abs(o.y - e.y) < 260);
      if (grp.length){
        const mx = grp.reduce((t,o)=> t + o.x, 0)/grp.length, my = Math.min(...grp.map(o=> o.y));
        const tgt = (e.baseX !== undefined ? e.baseX : e.x), dx = mx - tgt; if (Math.abs(dx) > 8) this.squadShift(e, Math.sign(dx)*Math.min(Math.abs(dx), 50*c*dt));
        { const ty = my - 40; if (e.y > ty){ e.y -= Math.min(e.y - ty, 110*dt); if (e.body && e.body.velocity.y > 12) e.body.velocity.y = 12; } }
      }
      if (this._empOn && c > 0.3) e.y -= 28*dt;
    });
    // boule de plasma: les escouades s'écartent de son passage
    if (this._plasma){ const pl = this._plasma.img; front.concat(back, heal).forEach(e=>{ const d = Phaser.Math.Distance.Between(e.x, e.y, pl.x, pl.y); if (d < 170) this.squadShift(e, (e.x >= pl.x ? 1 : -1)*90*c*dt); }); }
    // salves synchronisées: toutes les quelques secondes les tireurs prêts ouvrent le feu en balayage de gauche à droite
    this._volleyT = (this._volleyT === undefined ? 2500 : this._volleyT) - delta;
    if (this._volleyT <= 0){
      this._volleyT = 4200/(0.6 + c + 0.7*f);
      if (c >= 0.3 && !this._empOn){
        const ready = back.filter(e=> e.fireCd !== undefined && e.y > vy0 + 10 && e.body && e.body.velocity.y === 0).sort((a,b)=> a.x - b.x);
        ready.forEach((e, i)=>{ e.fireCd = Math.min(e.fireCd, 60 + i*130); });
      }
    }
  },
});
