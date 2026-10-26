"use strict";
// Méthodes de GameScene — HABILLAGE VISUEL du boss du tuto (Antenne-Mère) : sprite « vivant », 4 états d'usure, feu et fumée accrochés aux trous, éclats découpés dans le sprite,
// tirs en boules d'énergie animées, charge du canon, explosions. AUCUNE mécanique ici (PV, tirs, dégâts, hitbox : voir tuto.js et TUTO_TUNE.boss).
// Les effets (feu, fumée, étincelles, impact, explosion…) viennent de la bibliothèque d'effets (sprite-factory/fx-factory) : lumière additive, comme les balles du jeu.
mixin(GameScene, {
  /* ---------- création ---------- */
  acBossBuild(x, y){
    const tex = this.textures.exists('acLive') ? this.textures.get('acLive') : this.textures.createCanvas('acLive', 512, 512);
    const imgs = [0, 1, 2, 3].map(i=> this.textures.get('acBoss' + i).getSourceImage());
    this._ac = { state:0, ts:-1, imgs, data:[], tex, flames:[], shards:[], smokeT:600, sparkT:900, chg:null, tint:0xffffff, dy:0, n:0 };
    this.acDrawLive(0);
    return this.add.image(x, y, 'acLive').setDepth(5).setScale(AC.scale);
  },
  // Le sprite n'est pas déplacé en bloc : chaque bande de 4 px est décalée de ±1 px (un demi-pixel de la grille fine) à 10 images/s, les ailes se balancent à contretemps.
  acDrawLive(t){
    const ac = this._ac, ts = Math.floor(t * 10) / 10; if (ts === ac.ts) return; ac.ts = ts;
    const g = ac.tex.getContext(), im = ac.imgs[ac.state], dy = Math.round(Math.sin(ts * 1.9) * 2);
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 4){
      const dx = Math.round(Math.sin(ts * 3.1 + y * 0.021)), wy = Math.round(Math.sin(ts * 2.3 + y * 0.01));
      g.drawImage(im, 0, y, 140, 4, dx, y + dy - wy, 140, 4);
      g.drawImage(im, 140, y, 232, 4, 140 + dx, y + dy, 232, 4);
      g.drawImage(im, 372, y, 140, 4, 372 + dx, y + dy + wy, 140, 4);
    }
    ac.tex.refresh(); ac.dy = dy;
  },
  acPix(i){
    const ac = this._ac; if (!ac.data[i]){ const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.drawImage(ac.imgs[i], 0, 0); ac.data[i] = x.getImageData(0, 0, 512, 512).data; }
    return ac.data[i];
  },
  acW(sx, sy){ const sp = this.tutoBoss.sp, k = AC.scale; return [sp.x + (sx - 256) * k, sp.y + (sy - 256 + this._ac.dy) * k]; },    // coordonnées du sprite -> monde (suit le balancement)
  acFx(key, anim, x, y, scale, o){
    o = o || {}; const s = this.add.sprite(x, y, key).setDepth(o.depth || 7).setScale(scale);
    if (!o.normal) s.setBlendMode(Phaser.BlendModes.ADD);
    if (o.alpha) s.setAlpha(o.alpha);
    const an = FX_ANCHOR[key]; if (an) s.setOrigin(an[0], an[1]);
    s.play(anim); if (!o.loop) s.once('animationcomplete', ()=> s.destroy());
    if (o.vy || o.vx) this.tweens.add({ targets:s, x:x + (o.vx || 0), y:y + (o.vy || 0), duration:1100, ease:'Sine.easeOut' });
    return s;
  },

  /* ---------- à chaque image ---------- */
  acBossUpdate(delta){
    const B = this.tutoBoss, ac = this._ac; if (!B || !ac || B.dead) return;
    this.acDrawLive(B.t);
    const st = B.hp / B.max > AC.states[0] ? 0 : B.hp / B.max > AC.states[1] ? 1 : B.hp / B.max > AC.states[2] ? 2 : 3;
    if (st > ac.state) this.acSetState(st);
    this.acFollow(delta);
    if (ac.state >= 3){            // épave : clignotement rouge
      const tint = Math.floor(B.t * 4.3) % 2 === 0 ? 0xffb8a8 : 0xffffff;
      if (ac.tint !== tint && B.hitT <= 0){ ac.tint = tint; if (tint === 0xffffff) B.sp.clearTint(); else B.sp.setTint(tint); }
    }
  },
  acFollow(delta){        // flammes, fumée, étincelles, éclats, charge : tout est accroché au boss
    const ac = this._ac, B = this.tutoBoss, dt = delta / 1000;
    ac.flames.forEach(f=>{ const p = this.acW(f.a[0], f.a[1]); f.s.setPosition(p[0], p[1] + 3); });
    if (ac.chg){ ac.chg.setPosition(B.sp.x, B.sp.y + 40); }
    const A = AC.anchors[ac.state];
    if (A){
      ac.smokeT -= delta; const ev = AC.smokeEvery[ac.state];
      if (ev && ac.smokeT <= 0){ ac.smokeT = ev * Phaser.Math.FloatBetween(0.7, 1.3); const a = Phaser.Utils.Array.GetRandom(A), p = this.acW(a[0], a[1]); this.acFx('acFxSmoke', 'acSmoke', p[0], p[1] - 4, 0.45 + ac.state * 0.1, { normal:true, alpha:0.85, depth:5, vy:-42, vx:Phaser.Math.Between(-10, 10) }); }
      ac.sparkT -= delta;
      if (ac.sparkT <= 0){ ac.sparkT = Phaser.Math.Between(700, 1500); const a = Phaser.Utils.Array.GetRandom(A), p = this.acW(a[0], a[1]); this.acFx('acFxSpark', 'acSpark', p[0], p[1], 0.5); }
    }
    ac.shards = ac.shards.filter(s=>{       // éclats : gravité, rotation, fondu
      s.t += dt; s.vy += 620 * dt; s.sp.x += s.vx * dt; s.sp.y += s.vy * dt; s.sp.rotation += s.spin * dt;
      if (s.t > s.life - 0.3) s.sp.setAlpha(Math.max(0, (s.life - s.t) / 0.3));
      if (s.t >= s.life){ s.sp.destroy(); try { this.textures.remove(s.key); } catch (e) { /* ignore */ } return false; }
      return true;
    });
  },

  /* ---------- états d'usure ---------- */
  acSetState(n){
    const ac = this._ac, old = ac.state; if (n === old) return;
    ac.state = n; ac.ts = -1; this.acDrawLive(this.tutoBoss.t);
    this.acBreak(old, n); this.acRebuildFlames();
    this.cameras.main.flash(80, 255, 220, 190, false); this.juiceShake(0.35); this.tutoSfx('tutoBossBoomA', this.tutoBoss.sp.x);
    for (let k = 0; k < 3; k++){ const o = this.acRandomHull(); this.acFx('acFxBoom', 'acBoom', o[0], o[1], 0.42, { depth:8 }); }
  },
  acRandomHull(){
    const px = this.acPix(this._ac.state);
    for (let i = 0; i < 40; i++){ const x = Phaser.Math.Between(40, 470), y = Phaser.Math.Between(20, 480); if (px[(y * 512 + x) * 4 + 3] > 200) return this.acW(x, y); }
    return this.acW(256, 256);
  },
  acRebuildFlames(){
    const ac = this._ac; ac.flames.forEach(f=> f.s.destroy()); ac.flames = [];
    if (ac.state < 2) return;
    const list = ac.state === 2 ? AC.anchors[2].slice(0, 5) : AC.anchors[3];
    list.forEach((a, i)=>{
      const s = this.add.sprite(0, 0, 'acFxFlame').setDepth(6).setOrigin(FX_ANCHOR.acFxFlame[0], FX_ANCHOR.acFxFlame[1]).setBlendMode(Phaser.BlendModes.ADD).setScale((ac.state === 2 ? 0.4 : 0.55) * (0.85 + (i % 3) * 0.15));
      s.play({ key:'acFlame', startFrame:(i * 5) % 12 }); ac.flames.push({ s, a });
    });
  },
  // ce qui disparaît du sprite à ce changement d'état part en éclats (morceaux découpés dans le vrai sprite)
  acBreak(from, to){
    const a = this.acPix(from), b = this.acPix(to), lost = [];
    for (let y = 0; y < 512; y += 6) for (let x = 0; x < 512; x += 6){ const i = (y * 512 + x) * 4; if (a[i + 3] > 128 && b[i + 3] < 128) lost.push([x, y]); }
    const pts = lost.length ? lost : (()=>{ const o = []; for (let y = 0; y < 512; y += 12) for (let x = 0; x < 512; x += 12) if (a[(y * 512 + x) * 4 + 3] > 200) o.push([x, y]); return o; })();
    const pick = ()=> Phaser.Utils.Array.GetRandom(pts);
    for (let k = 0; k < 10; k++){ const p = pick(); this.acShard(from, p[0], p[1], Phaser.Math.Between(10, 22), 1.1); }
    for (let k = 0; k < 12; k++){ const p = pick(); this.acShard(from, p[0], p[1], Phaser.Math.Between(5, 8), 1.3); }
    for (let k = 0; k < 6; k++){ const p = pick(), w = this.acW(p[0], p[1]); this.acFx('acFxSpark', 'acSpark', w[0], w[1], 0.6); if (k < 3) this.acFx('acFxImpact', 'acImpact', w[0], w[1], 0.55); }
  },
  acShard(st, sx, sy, r, power){
    const ac = this._ac, S = 2 * r + 8, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(ac.imgs[st], sx - r, sy - r, 2 * r, 2 * r, 4, 4, 2 * r, 2 * r);
    const m = document.createElement('canvas'); m.width = m.height = S; const mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); const nv = 5 + Phaser.Math.Between(0, 2);
    for (let i = 0; i < nv; i++){ const an = i / nv * 6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r * Phaser.Math.FloatBetween(0.55, 1); const px = S / 2 + Math.cos(an) * rr, py = S / 2 + Math.sin(an) * rr; if (i) mx.lineTo(px, py); else mx.moveTo(px, py); } mx.fill();
    x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over';
    const o = document.createElement('canvas'); o.width = o.height = S; const ox = o.getContext('2d');       // contour sombre très fin
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d=> ox.drawImage(c, d[0], d[1]));
    ox.globalCompositeOperation = 'source-in'; ox.fillStyle = 'rgb(8,10,14)'; ox.fillRect(0, 0, S, S); ox.globalCompositeOperation = 'source-over'; ox.drawImage(c, 0, 0);
    const key = 'acShard' + (++ac.n); this.textures.addCanvas(key, o);
    const w = this.acW(sx, sy), bx = this.tutoBoss.sp.x;
    const sp = this.add.image(w[0], w[1], key).setDepth(7).setScale(AC.scale);
    ac.shards.push({ sp, key, vx:((w[0] - bx) * 1.1 + Phaser.Math.Between(-70, 70)) * power, vy:Phaser.Math.Between(-250, -40) * power, spin:Phaser.Math.FloatBetween(-5, 5), t:0, life:Phaser.Math.FloatBetween(1.1, 1.8) });
  },

  /* ---------- coups reçus ---------- */
  acBossHit(x, y){
    const ac = this._ac; if (!ac) return;
    this._acHitN = (this._acHitN || 0); if (this._acHitN > 8) return;           // plafond d'effets simultanés
    this._acHitN++; this.time.delayedCall(240, ()=>{ this._acHitN--; });
    this.acFx('acFxImpact', 'acImpact', x, y, 0.4);
    if (Math.random() < 0.5) this.acFx('acFxSpark', 'acSpark', x, y, 0.45);
    if (Math.random() < 0.12){ const px = this.acPix(ac.state); for (let i = 0; i < 12; i++){ const sx = Phaser.Math.Between(60, 450), sy = Phaser.Math.Between(40, 470); if (px[(sy * 512 + sx) * 4 + 3] > 200){ this.acShard(ac.state, sx, sy, Phaser.Math.Between(4, 6), 0.8); break; } } }
  },
  acHitFlash(B){        // flash blanc d'un coup ; revient ensuite à la teinte courante (rouge clignotant en fin de vie)
    B.sp.setTintFill(0xffffff);
    this.time.delayedCall(45, ()=>{ if (!B.sp.active) return; if (this._ac.tint === 0xffffff) B.sp.clearTint(); else B.sp.setTint(this._ac.tint); });
  },

  /* ---------- tirs et charge ---------- */
  acShot(x, y, ang, spd, tint, dmg){       // même cercle de collision que l'ancienne orbe : seul l'habillage change (boule d'énergie animée, traînée dans le dos)
    const b = this.enemyBullets.create(x, y, 'acFxOrb', 0); b.setDepth(4); b.damage = dmg || 8; b.setScale(AC.shotScale); b.setOrigin(AC.shotHead[0] / 64, AC.shotHead[1] / 128);
    b.setRotation(ang - Math.PI / 2); b.setBlendMode(Phaser.BlendModes.ADD);
    const T = { 0xffa040:0xffd0a0, 0xff8040:0xffb890, 0xff3060:0xff90c0 }[tint]; if (T) b.setTint(T);     // on garde la couleur par type de tir, adoucie pour la boule rouge-rose
    const r = 5.25 / AC.shotScale; b.body.setCircle(r, AC.shotHead[0] - r, AC.shotHead[1] - r);
    b.play('acOrb'); this.physics.velocityFromRotation(ang, spd, b.body.velocity); return b;
  },
  acChargeStart(){
    const ac = this._ac, B = this.tutoBoss; if (!ac || ac.chg) return;
    ac.chg = this.add.sprite(B.sp.x, B.sp.y + 40, 'acFxCharge').setDepth(6).setBlendMode(Phaser.BlendModes.ADD).setScale(0.6); ac.chg.play('acCharge');
    this.tutoSfx('tutoBossCharge', B.sp.x);
  },
  acChargeStop(muzzle){
    const ac = this._ac, B = this.tutoBoss; if (!ac || !ac.chg) return;
    ac.chg.destroy(); ac.chg = null;
    if (muzzle) this.acFx('acFxMuzzle', 'acMuzzle', B.sp.x, B.sp.y + 40, 0.7, { depth:7 });
  },

  /* ---------- mort ---------- */
  acDeathBoom(x, y, s){ this.acFx('acFxBoom', 'acBoom', x, y, s, { depth:8 }); },
  acDeathFinal(x, y){
    this.acFx('acFxBoom', 'acBoom', x, y, 1.5, { depth:9 }); this.acFx('acFxShock', 'acShock', x, y, 1.6, { depth:9 });
    this.acFx('acFxBoom', 'acBoom', x - 70, y - 40, 0.8, { depth:9 }); this.acFx('acFxBoom', 'acBoom', x + 80, y + 50, 0.8, { depth:9 });
    for (let i = 0; i < 28; i++){ const px = this.acPix(this._ac.state); for (let t = 0; t < 12; t++){ const sx = Phaser.Math.Between(40, 470), sy = Phaser.Math.Between(20, 480); if (px[(sy * 512 + sx) * 4 + 3] > 200){ this.acShard(this._ac.state, sx, sy, Phaser.Math.Between(6, 20), 1.8); break; } } }
  },
  acBossClear(){
    const ac = this._ac; if (!ac) return;
    ac.flames.forEach(f=> f.s.destroy()); ac.flames = []; if (ac.chg){ ac.chg.destroy(); ac.chg = null; }
    ac.shards.forEach(s=>{ if (s.sp.active) s.sp.destroy(); try { this.textures.remove(s.key); } catch (e) { /* ignore */ } }); ac.shards = [];
  },
});
