"use strict";
// Méthodes de GameScene — boss « La Météo » (boss de fin du niveau `w1-l1`, `finalBoss:'meteo'` dans data/worlds/monde-1.js). Autonome comme l'Araignée de tri (bosses/araignee.js) : son état est dans `this.mt`.
// Elle FAIT L'ORAGE : ÉCLAIRS (les paratonnerres chargent, ligne de visée, la foudre tombe), GRÊLE (les tubes du bas crachent des grêlons en éventail) et FRONT ORAGEUX (un rideau d'arcs descend, avec un passage).
// Chaque arme disparaît avec sa pièce : sans paratonnerre plus d'éclairs, sans tube plus de grêle, sans ailes plus de front. 4 états d'usure ; une pièce arrachée part en un seul morceau.
// La logique est celle de la page validée : elle tourne en « images » de 1/60 s et en unités de cette page (K = 1,5 px de page par px du sprite) ; `U` convertit les distances de la page en pixels du jeu.
const MT = {
  scale:0.62, K:1.5, OY:24, hp:1000, thresh:[70, 45, 20],
  core:[256, 190],                                                                    // moyeu de la parabole (point faible : coups critiques), dans le sprite 512
  rods:[{ id:'RL', x:216, y:94 }, { id:'RR', x:297, y:94 }],                          // paratonnerres
  tubes:[{ id:'TL', x:182, y:356, a:96 }, { id:'TR', x:329, y:356, a:84 }],           // tubes de grêle, a = direction de sortie en degrés
  wings:[{ id:'WL', x:100, y:245, side:-1, tip:12 }, { id:'WR', x:395, y:245, side:1, tip:500 }],     // grandes ailes : d'où part le front orageux (tip = bout d'aile)
  seq:[['storm', 'hail', 'front'], ['hail', 'storm', 'front'], ['front', 'storm', 'hail'], ['storm', 'hail', 'storm', 'front']],      // enchaînement des attaques selon l'état
  count:{ storm:[2, 3, 4, 5], hail:[3, 4, 5, 6], front:[1, 2, 2, 3] }, gap:[260, 220, 180, 150],                                       // éclairs / salves de grêle / rideaux par attaque, pause entre attaques (images)
  speed:1.4,                                                                          // multiplicateur de vitesse des projectiles (les valeurs de la page sont pour une zone de 768 px)
  dmg:{ strike:18, hail:9, front:14, contact:14 }, critMul:2.5, killScore:800,
  regions:[(x, y)=> x < 150 && y >= 190 && y < 300, (x, y)=> x > 372 && y >= 190 && y < 300, (x, y)=> x > 326 && y < 170 && Math.hypot(x - 256, y - 190) > 80, (x, y)=> x < 178 && y > 322, (x, y)=> y < 112 && x > 200 && x < 312],
  anchors:{                                                                           // points d'accroche (sprite 512) de la fumée et du feu, par état d'usure 1..3
    1:[[352, 108], [326, 164], [252, 218], [380, 96], [386, 102], [344, 104], [50, 248], [58, 278]],
    2:[[272, 181], [338, 237], [258, 288], [135, 354], [182, 232], [180, 202], [154, 382], [200, 248], [156, 282]],
    3:[[247, 127], [283, 147], [174, 176], [349, 245], [164, 235], [202, 254], [270, 204], [272, 204], [218, 202], [228, 270]],
  },
  smokeEvery:[0, 520, 300, 190],
  names:['LA MÉTÉO', 'LA MÉTÉO', 'LA MÉTÉO', 'LA MÉTÉO'],
};

mixin(GameScene, {
  /* ---------- création ---------- */
  mtStart(){
    if (this.mt) return;
    const vy = this.visibleYRange(0), S = MT.scale, mt = this.mt = { st:0, hp:MT.hp, max:MT.hp, mode:'enter', t:0, enter:0, acc:0, f:0, atk:null, atkTimer:200, atkIdx:0, strikes:[], curtains:[], y0:vy.min, S, U:S/MT.K, cx:GAME_W/2, jdy:0, flash:0, dead:false, flames:[], px:0, py:0, wx:0, wy:0, hitT:0 };
    mt.sp = this.add.image(mt.cx, mt.y0 - 300, 'mtSheet', 0).setDepth(5).setScale(S);
    mt.gfx = this.add.graphics().setDepth(7);
    this.mtPlace(); mt.lights = this.blInit('meteo', 5.5);
    const lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = MT.names[0]; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; }      // la jauge n'apparaît qu'une fois le boss en position de combat (mode 'play')
    this.mtSfx('mtRoar', GAME_W/2);
  },
  mtSfx(name, x){ try { sfx[name]({ pan:this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- géométrie : page <-> monde ---------- */
  mtPix(st){
    this._mtPixC = this._mtPixC || [];
    if (!this._mtPixC[st]){
      const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(this.textures.get('mtSheet').getSourceImage(), st*512, 0, 512, 512, 0, 0, 512, 512);
      const d = x.getImageData(0, 0, 512, 512).data, op = []; for (let y = 0; y < 512; y += 6) for (let xx = 0; xx < 512; xx += 6) if (d[(y*512 + xx)*4 + 3] > 200) op.push([xx, y]);
      this._mtPixC[st] = { d, op };
    }
    return this._mtPixC[st];
  },
  mtSolid(sx, sy){ const p = this.mtPix(this.mt.st).d; return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && p[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  mtPlace(){
    const mt = this.mt, U = mt.U, sway = Math.sin(mt.t*0.42)*(mt.st >= 3 ? 90 : 70);
    mt.px = mt.mode === 'enter' ? 0 : sway; mt.py = MT.OY + (mt.mode === 'enter' ? Math.pow(1 - Math.min(1, mt.enter), 3)*-640 : 0);
    mt.wx = mt.cx + mt.px*U; mt.wy = mt.y0 + (mt.py + 384)*U;
    mt.sp.setPosition(mt.wx, mt.wy + mt.jdy*mt.S);
  },
  mtW(sx, sy){ const mt = this.mt; return [mt.wx + (sx - 256)*mt.S, mt.wy + (sy - 256 + mt.jdy)*mt.S]; },        // coordonnées du sprite -> monde
  mtS(x, y){ const mt = this.mt; return [(x - mt.wx)/mt.S + 256, (y - mt.wy)/mt.S + 256 - mt.jdy]; },              // monde -> sprite
  mtRodAlive(r){ return this.mtSolid(r.x, r.y + 6); },                                                              // une arme dont la pièce est arrachée ne sert plus
  mtTubeAlive(t){ return this.mtSolid(t.x, t.y - 6); },
  mtWingAlive(w){ return this.mtSolid(w.x, w.y) && this.mtSolid(w.x + 14*w.side, w.y); },
  mtHullPoint(st){ const op = this.mtPix(st === undefined ? this.mt.st : st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; return this.mtW(o[0], o[1]); },

  /* ---------- pièces découpées dans le sprite ---------- */
  mtPieceCanvas(st, cells, x0, y0, w, h){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.textures.get('mtSheet').getSourceImage();
    cells.forEach(([cx, cy])=> x.drawImage(src, st*512 + cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); return c;
  },
  mtThrow(c, wx, wy, o){       // une pièce qui retombe en tournant puis disparaît ; la texture est retirée à la fin
    const key = 'mtp_' + (this._mtN = (this._mtN || 0) + 1); this.textures.addCanvas(key, c);
    const s = this.add.image(wx, wy, key).setDepth(o.depth || 5).setScale(this.mt.S), life = o.life;
    this.tweens.add({ targets:s, x:wx + o.vx*life/1000, angle:o.spin, alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:wy + o.vy*life/1000 + o.fall, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
  },
  mtShard(st, sx, sy, r){
    const S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(this.textures.get('mtSheet').getSourceImage(), st*512 + sx - r, sy - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
    const m = document.createElement('canvas'); m.width = m.height = S2; const mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); const nv = Phaser.Math.Between(5, 7);
    for (let i = 0; i < nv; i++){ const a = i/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; i ? mx.lineTo(X, Y) : mx.moveTo(X, Y); } mx.fill();
    x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over'; return c;
  },
  mtShards(st, n, rMin, rMax, power){
    const mt = this.mt;
    for (let k = 0; k < n; k++){ const op = this.mtPix(st).op, o = op[Phaser.Math.Between(0, op.length - 1)], [wx, wy] = this.mtW(o[0], o[1]), r = Phaser.Math.Between(rMin, rMax);
      this.mtThrow(this.mtShard(st, o[0], o[1], r), wx, wy, { vx:(wx - mt.cx)*1.4*power + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(20, 90)*power, fall:150, spin:Phaser.Math.Between(-300, 300), life:Phaser.Math.Between(1100, 1800) }); }
  },
  // une pièce arrachée part EN UN SEUL MORCEAU, avec sa vraie forme : on étiquette les zones perdues (blocs de 4 px) et on découpe chacune dans l'ancien sprite
  mtBreakLimbs(from, to){
    const mt = this.mt, a = this.mtPix(from).d, b = this.mtPix(to).d, N = 128, lost = new Uint8Array(N*N), lab = new Int16Array(N*N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){ const i = ((y*4 + 2)*512 + (x*4 + 2))*4; lost[y*N + x] = a[i + 3] > 128 && b[i + 3] < 128 ? 1 : 0; }
    let n = 0; const comps = [];
    for (let s = 0; s < N*N; s++){
      if (!lost[s] || lab[s]) continue; n++; const q = [s], cells = []; lab[s] = n;
      while (q.length){ const c = q.pop(); cells.push(c); const cx = c % N, cy = (c/N) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy])=>{ const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; const k = ny*N + nx; if (lost[k] && !lab[k]){ lab[k] = n; q.push(k); } }); }
      comps.push(cells);
    }
    comps.sort((p, q)=> q.length - p.length);
    comps.slice(0, 5).forEach(cells=>{
      if (cells.length < 6) return;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const cc = cells.map(c=>[c % N, (c/N) | 0]); cc.forEach(([cx, cy])=>{ x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); });
      const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, [wx, wy] = this.mtW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2), big = cells.length > 60;
      this.mtThrow(this.mtPieceCanvas(from, cc, x0, y0, w, h), wx, wy, { vx:(wx - mt.cx)*(big ? 0.9 : 1.4) + Phaser.Math.Between(-15, 15), vy:-Phaser.Math.Between(40, 160), fall:big ? 220 : 160, spin:Phaser.Math.Between(-360, 360), life:big ? Phaser.Math.Between(1800, 2400) : Phaser.Math.Between(1200, 1700) });
    });
  },
  mtDeathPieces(){      // chaque pièce restante s'envole en un seul morceau, à sa vraie forme
    const mt = this.mt, a = this.mtPix(mt.st).d, N = 128;
    MT.regions.forEach(test=>{
      const cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
      if (cells.length < 30) return;
      const [wx, wy] = this.mtW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2);
      this.mtThrow(this.mtPieceCanvas(mt.st, cells, x0, y0, (x1 - x0 + 1)*4, (y1 - y0 + 1)*4), wx, wy, { vx:(wx - mt.cx)*1.6 + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(60, 200), fall:260, spin:Phaser.Math.Between(-420, 420), life:Phaser.Math.Between(2000, 2800) });
    });
  },

  /* ---------- effets ---------- */
  mtFx(key, anim, x, y, scale, o){       // effet bleu additif qui joue une fois puis disparaît
    o = o || {}; const s = this.add.sprite(x, y, key).setDepth(o.depth || 8).setScale(scale).setBlendMode(Phaser.BlendModes.ADD); if (o.alpha) s.setAlpha(o.alpha); if (o.rot) s.setRotation(o.rot);
    s.play(anim); if (!o.loop) s.once('animationcomplete', ()=> s.destroy()); return s;
  },
  mtBoom(x, y, size, snd){      // explosion bleue-blanche (plasma) ; size en pixels de PAGE comme sur la page validée
    const big = size > 360, k = size*this.mt.U;
    this.mtFx(big ? 'mtFxBoomL' : 'mtFxBoomM', big ? 'mtBoomL' : 'mtBoomM', x, y, k/(big ? 256 : 160)*1.15);
    if (size > 500) this.mtFx('mtFxShock', 'mtShock', x, y, k/190);
    if (snd) this.mtSfx(snd, x);
  },
  mtSmoke(x, y, sc){ this.acFx('acFxSmoke', 'acSmoke', x, y, sc*this.mt.U*1.6, { normal:true, vy:-24, alpha:0.85 }); },
  mtSpark(x, y, sc){ this.mtFx('mtFxSpark', 'mtSpark', x, y, sc*this.mt.U*2.2); },
  mtArcFx(x, y, sc, rot){ this.mtFx('mtFxArc', 'mtArc1', x, y, sc*this.mt.U*1.8, { rot:rot || 0 }); },
  mtBolt(x0, y0, x1, y1, life, w){       // éclair animé : la feuille « bolt » (extrémité au sol en bas) étirée et tournée du point (x0, y0) vers (x1, y1)
    const U = this.mt.U, dx = x0 - x1, dy = y0 - y1, L = Math.hypot(dx, dy), th = Math.atan2(dx, -dy), out = [];
    [[2.2*(w || 1), 1], [1.2*(w || 1), 0.9]].forEach(([sc, al], i)=>{ const s = this.add.sprite(x1, y1, 'mtFxBolt').setDepth(7).setOrigin(0.5, 0.96).setBlendMode(Phaser.BlendModes.ADD).setRotation(th).setScale(sc*U*1.4, L/300).setAlpha(al); s.play('mtBolt'); s.anims.setProgress(i*0.4); out.push(s); });
    if (life) this.time.delayedCall(life, ()=> out.forEach(s=> s.destroy())); return out;
  },
  mtFlames(){        // feu accroché aux trous, à partir de l'état 2
    const mt = this.mt; mt.flames.forEach(f=> f.s.destroy()); mt.flames = [];
    if (mt.st < 2) return;
    const list = mt.st === 2 ? MT.anchors[2].slice(0, 5) : MT.anchors[3], sc = mt.st === 2 ? 0.62 : 0.9;
    list.forEach((a, i)=>{ const s = this.add.sprite(0, 0, 'acFxFlame').setDepth(6).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale(sc*mt.U*1.1*(0.85 + (i % 3)*0.15)); s.play('acFlame'); s.anims.setProgress(((i*5) % 12)/12); mt.flames.push({ s, a }); });
  },

  /* ---------- dégâts reçus ---------- */
  mtStageOf(pct){ return pct > MT.thresh[0] ? 0 : pct > MT.thresh[1] ? 1 : pct > MT.thresh[2] ? 2 : 3; },
  mtDamage(x, y, d, crit){
    const mt = this.mt; if (mt.dead || mt.mode === 'dying') return;
    if (mt.hitT <= 0 || crit){ mt.flash = crit ? 2 : 0.5; mt.hitT = 24; }          // le flash blanc est espacé : sous un tir rapide, la coque ne doit pas rester blanche
    this.mtFx('mtFxImpact', 'mtImpact', x, y, crit ? 0.9 : 0.55); this.mtSpark(x, y, crit ? 1.3 : 0.8); this.spawnHitParticles(x, y, crit ? 6 : 3);
    if (crit){ this.juiceShake(0.12); this.mtSfx('mtHitHeavy', x); } else this.mtSfx('mtHit', x);
    if (mt.mode === 'enter') return;      // en approche : dégâts visuels seulement (la jauge n'est pas encore affichée), pas de vraie perte de PV
    mt.hp = Math.max(0, mt.hp - d);
    if (crit || Math.random() < 0.3){ const op = this.mtPix(mt.st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; const [wx, wy] = this.mtW(o[0], o[1]); this.mtThrow(this.mtShard(mt.st, o[0], o[1], Phaser.Math.Between(4, 7)), wx, wy, { vx:(wx - mt.cx)*1.1, vy:-Phaser.Math.Between(20, 80), fall:120, spin:Phaser.Math.Between(-300, 300), life:1000 }); }
    const ns = mt.hp <= 0 ? 3 : this.mtStageOf(mt.hp/mt.max*100);
    if (ns > mt.st) this.mtWound(ns);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, mt.hp/mt.max*100) + '%';
    if (mt.hp <= 0) this.mtDie();
  },
  mtWound(ns){
    const mt = this.mt, old = mt.st; mt.st = ns; mt.sp.setFrame(ns); this.mtBreakLimbs(old, ns); this.mtFlames(); this.mtShards(old, 8, 5, 10, 1.2);
    this.cameras.main.shake(300, 0.012); this.juiceStop && this.juiceStop('bossPhase');
    for (let k = 0; k < 3; k++){ const [bx, by] = this.mtHullPoint(); this.mtBoom(bx, by, 200, k === 0 ? 'mtBoomSmall' : ''); }
    this.mtSfx('mtLimb', mt.wx);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + Math.min(3, ns);
  },
  mtHits(){        // tirs du joueur : un coup touche si le point est sur la coque (masque du sprite) ; le moyeu de la parabole donne un coup critique
    const mt = this.mt;
    const test = (list, missile)=>{
      list.children.iterate(b=>{
        if (!b || !b.active) return;
        const [sx, sy] = this.mtS(b.x, b.y); if (!this.mtSolid(sx, sy)) return;
        if (b._tH === mt) return;
        const keep = (b.pierceLeft || 0) > 0, crit = Math.hypot(sx - MT.core[0], sy - MT.core[1]) < 52;
        if (missile) this.explodeFx(b.x, b.y, 50);
        this.mtDamage(b.x, b.y, (b.damage || (missile ? 20 : 10))*(crit ? MT.critMul : 1), crit);
        if (keep){ b.pierceLeft--; b._tH = mt; } else if (b.active) b.destroy();
      });
    };
    test(this.playerBullets, false); test(this.missiles, true);
  },

  /* ---------- attaques ---------- */
  mtAvailable(type){ return type === 'storm' ? MT.rods.some(r=> this.mtRodAlive(r)) : type === 'hail' ? MT.tubes.some(t=> this.mtTubeAlive(t)) : MT.wings.some(w=> this.mtWingAlive(w)); },
  mtStartAttack(){
    const mt = this.mt, seq = MT.seq[mt.st]; let type = null;
    for (let k = 0; k < seq.length; k++){ const c = seq[mt.atkIdx++ % seq.length]; if (this.mtAvailable(c)){ type = c; break; } }
    if (!type){ mt.atkTimer = 60; return; } mt.atk = { type, f:0, n:0, chg:[] };
  },
  mtEndAttack(){ const mt = this.mt; if (mt.atk && mt.atk.chg) mt.atk.chg.forEach(a=> a.s && a.s.destroy()); mt.atk = null; },
  mtUpdateAttack(){
    const mt = this.mt, U = mt.U; let atk = mt.atk;
    if (!atk){ if (--mt.atkTimer <= 0) this.mtStartAttack(); return; }
    if (!this.mtAvailable(atk.type)){ this.mtEndAttack(); mt.atkTimer = 40; return; }
    atk.f++;
    if (atk.type === 'storm'){
      const rods = MT.rods.filter(r=> this.mtRodAlive(r)), total = MT.count.storm[mt.st], per = 54;
      if (atk.f === 1) this.mtSfx('mtStrikeWarn', mt.wx);
      rods.forEach(r=>{ const [x, y] = this.mtW(r.x, r.y); if (atk.f % 5 === 0 && atk.f < 40 + total*per) this.mtSpark(x + Phaser.Math.Between(-5, 5), y + Phaser.Math.Between(-5, 5), 0.6); if (atk.f === 2) this.mtFx('mtFxCharge', 'mtCharge', x, y + 3, 0.7*U*1.8); });
      if (rods.length === 2 && atk.f < 40 && atk.f % 3 === 0){ const [ax, ay] = this.mtW(rods[0].x, rods[0].y), [bx, by] = this.mtW(rods[1].x, rods[1].y); this.mtFx('mtFxArc', 'mtArc1', (ax + bx)/2, (ay + by)/2, (bx - ax)/128*1.05); }
      for (let i = 0; i < total; i++){
        if (atk.f === 36 + i*per){
          const r = rods[i % rods.length], pl = this.player, vx = this.visibleXRange(20), vy = this.visibleYRange(0);
          mt.strikes.push({ rod:r, x:Phaser.Math.Clamp(pl.x + Phaser.Math.Between(-45, 45), vx.min, vx.max), gy:Math.min(vy.max - 20, pl.y + 24), f:0, warn:44, live:12, hit:false });
          this.mtSfx('mtStrikeWarn', mt.wx); const [x, y] = this.mtW(r.x, r.y); this.mtFx('mtFxCharge', 'mtCharge', x, y + 3, 0.6*U*1.8);
        }
      }
      if (atk.f >= 36 + (total - 1)*per + 44 + 12 + 24) this.mtEndAttack(), mt.atkTimer = MT.gap[mt.st];
    }
    atk = mt.atk;
    if (atk && atk.type === 'hail'){
      const tubes = MT.tubes.filter(t=> this.mtTubeAlive(t)), total = MT.count.hail[mt.st], per = 24;
      if (atk.f === 1){ this.mtSfx('mtHailCharge', mt.wx); tubes.forEach(tb=>{ const [x, y] = this.mtW(tb.x, tb.y); const s = this.mtFx('mtFxFcharge', 'mtFcharge', x, y + 3, 0.8*U*1.8); atk.chg.push({ s, tb }); }); }
      atk.chg.forEach(a=>{ if (a.s && a.s.active){ const [x, y] = this.mtW(a.tb.x, a.tb.y); a.s.setPosition(x, y + 3); } });
      for (let i = 0; i < total; i++){
        if (atk.f === 44 + i*per){
          const tb = tubes[i % tubes.length], [x, y] = this.mtW(tb.x, tb.y), n = 5 + mt.st; this.mtFx('mtFxFmuzzle', 'mtFmuzzle', x, y + 4, 0.9*U*1.8); this.mtSmoke(x, y + 8, 0.8); this.mtSfx('mtHailLaunch', x);
          for (let k = 0; k < n; k++) this.mtHailStone(x, y + 5, Phaser.Math.DegToRad(90 + (tb.a - 90)*0.5 + Phaser.Math.FloatBetween(-24, 24)), Phaser.Math.FloatBetween(4.4, 6.2));
        }
      }
      if (atk.f >= 44 + (total - 1)*per + 90) this.mtEndAttack(), mt.atkTimer = MT.gap[mt.st];
    }
    atk = mt.atk;
    if (atk && atk.type === 'front'){
      const ws = MT.wings.filter(w=> this.mtWingAlive(w)), total = MT.count.front[mt.st];
      if (atk.f === 1) this.mtSfx('mtFrontCharge', mt.wx);
      ws.forEach(w=>{ const [x, y] = this.mtW(w.tip, w.y); if (atk.f === 2) this.mtFx('mtFxCharge', 'mtCharge', x, y, 1.1*U*1.8); if (atk.f < 60 && atk.f % 4 === 0){ this.mtArcFx(x - w.side*20, y, 0.9); this.mtSpark(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-5, 5), 0.6); } if (atk.f === 60) this.mtFx('mtFxMuzzle', 'mtMuzzle', x, y, 1.2*U*1.8); });
      for (let i = 0; i < total; i++){
        if (atk.f === 60 + i*120) this.mtCurtain();
      }
      if (atk.f >= 60 + (total - 1)*120 + 360) this.mtEndAttack(), mt.atkTimer = MT.gap[mt.st];
    }
  },
  mtHailStone(x, y, ang, sp){
    if (this._bLoad > BULLET_CAP) return;
    const mt = this.mt, U = mt.U, b = this.enemyBullets.create(x, y, 'mtFxHail', 0); b.setDepth(4); b.damage = MT.dmg.hail; b.setOrigin(0.5, 0.69).setScale(U*1.3).setBlendMode(Phaser.BlendModes.ADD);
    const r = 7/(U*1.3); b.body.setCircle(r, 24 - r, 66 - r); b.play('mtHail'); b.anims.setProgress(Math.random());
    b.body.setVelocity(Math.cos(ang)*sp*60*U*MT.speed, Math.sin(ang)*sp*60*U*MT.speed); b.body.setGravityY(0.05*3600*U*MT.speed*MT.speed*0.5);
    b.setRotation(Math.atan2(-Math.cos(ang), Math.sin(ang)));
    b.once('destroy', ()=>{ const vy = this.visibleYRange(0); if (b.y > vy.min && b.y < vy.max + 4) this.mtFx('mtFxIceb', 'mtIceb', b.x, b.y, 0.9*U*1.8, { depth:6 }); });
  },
  mtCurtain(){
    const mt = this.mt, U = mt.U, vx = this.visibleXRange(0), gw = Math.max(100, 115 - mt.st*4), gx = Phaser.Math.Between(vx.min + gw/2 + 20, vx.max - gw/2 - 20), [, wy] = this.mtW(0, 245);
    const sides = [this.mtWingAlive(MT.wings[0]), this.mtWingAlive(MT.wings[1])], c = { y:wy, gx, gw, sides, f:0, hit:false, vx, arcs:[], glows:[] };
    const tile = (x0, x1)=>{ for (let x = x0 + 20; x < x1; x += 56){ const s = this.add.sprite(x, wy, 'mtFxArc').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setScale(1.25*U*1.8); s.play('mtArc'); s.anims.setProgress(Math.random()); c.arcs.push(s); } };
    if (sides[0]) tile(vx.min, gx - gw/2); if (sides[1]) tile(gx + gw/2, vx.max);
    [[gx - gw/2, sides[0]], [gx + gw/2, sides[1]]].forEach(([x, on])=>{ if (!on) return; const s = this.add.sprite(x, wy, 'mtFxGlow').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setScale(1.2*U*2.2); s.play('mtGlow'); c.glows.push(s); });
    MT.wings.forEach(w=>{ if (this.mtWingAlive(w)){ const [x, y] = this.mtW(w.tip, w.y); this.mtFx('mtFxMuzzle', 'mtMuzzle', x, y, 1.3*U*1.8); } });
    mt.curtains.push(c); this.mtSfx('mtFrontCurtain', mt.wx);
  },
  mtDrawStrikes(){        // lignes de visée et foudre
    const mt = this.mt, g = mt.gfx, U = mt.U; g.clear();
    mt.strikes.forEach(s=>{
      const [rx, ry] = this.mtW(s.rod.x, s.rod.y);
      if (s.f < s.warn){
        const k = s.f/s.warn; g.lineStyle(2, 0x9fe0ff, (0.25 + 0.5*k)*(s.f % 6 < 3 ? 1 : 0.55)); const L = Math.hypot(s.x - rx, s.gy - ry), ux = (s.x - rx)/L, uy = (s.gy - ry)/L;
        for (let d = 0; d < L; d += 12){ g.beginPath(); g.moveTo(rx + ux*d, ry + uy*d); g.lineTo(rx + ux*Math.min(L, d + 7), ry + uy*Math.min(L, d + 7)); g.strokePath(); }
        g.lineStyle(2, 0x9fe0ff, 0.3 + 0.5*k); g.strokeEllipse(s.x, s.gy, (30 + (1 - k)*28)*U*2.4, (10 + (1 - k)*8)*U*2.4);
      }
    });
  },
  mtUpdateStrikes(){
    const mt = this.mt, U = mt.U, pl = this.player;
    mt.strikes.forEach(s=>{
      const [rx, ry] = this.mtW(s.rod.x, s.rod.y);
      if (s.f >= s.warn && !s.fired){
        s.fired = true; this.mtSfx('mtThunder', s.x); this.cameras.main.shake(180, 0.008); this.mtBolt(rx, ry, s.x, s.gy, (s.live + 6)*16.7, 1);
        this.mtFx('mtFxImpact', 'mtImpact', s.x, s.gy - 4, 2.0*U*1.8); this.mtSpark(s.x, s.gy - 4, 1.4); this.mtFx('mtFxMuzzle', 'mtMuzzle', rx, ry + 3, 0.9*U*1.8); this.mtArcFx(s.x, s.gy, 1.2);
      }
      if (s.f >= s.warn && s.f < s.warn + s.live){
        if (s.f % 2 === 0 && Math.random() < 0.6) this.mtSpark(s.x + Phaser.Math.Between(-14, 14), s.gy + Phaser.Math.Between(-8, 4), 0.6);
        if (!s.hit && pl && pl.active && Math.abs(pl.x - s.x) < 22 && pl.y > ry){ s.hit = true; this.damagePlayer(MT.dmg.strike); }
      }
      if (s.f >= s.warn + s.live + 6) s.dead = true;
    });
    mt.strikes = mt.strikes.filter(s=> !s.dead);
  },
  mtUpdateCurtains(){
    const mt = this.mt, U = mt.U, pl = this.player, vy = this.visibleYRange(0);
    mt.curtains.forEach(c=>{
      c.arcs.forEach(s=> s.y = c.y); c.glows.forEach(s=> s.y = c.y);
      const gl = c.gx - c.gw/2, gr = c.gx + c.gw/2;
      if (c.f % 5 === 0){ const x = c.sides[0] && (Math.random() < 0.5 || !c.sides[1]) ? Phaser.Math.Between(c.vx.min, gl) : (c.sides[1] ? Phaser.Math.Between(gr, c.vx.max) : -1); if (x >= 0) this.mtSpark(x, c.y + 4, 0.5); }
      if (pl && pl.active && !c.hit && Math.abs(pl.y - c.y) < 10 && ((c.sides[0] && pl.x < gl) || (c.sides[1] && pl.x > gr))){ c.hit = true; this.damagePlayer(MT.dmg.front); }
      if (c.y > vy.max + 20){ c.dead = true; c.arcs.forEach(s=> s.destroy()); c.glows.forEach(s=> s.destroy()); }
    });
    mt.curtains = mt.curtains.filter(c=> !c.dead);
  },
  mtClearAttacks(){
    const mt = this.mt; this.mtEndAttack(); mt.strikes = []; mt.curtains.forEach(c=>{ c.arcs.forEach(s=> s.destroy()); c.glows.forEach(s=> s.destroy()); }); mt.curtains = []; mt.gfx.clear();
  },

  /* ---------- à chaque image ---------- */
  mtUpdate(delta){
    const mt = this.mt; if (!mt || mt.dead) return;
    mt.acc += Math.min(delta, 100); let n = 0;
    while (mt.acc >= 16.667 && n++ < 6){ mt.acc -= 16.667; this.mtStep(); }
    this.mtPlace(); this.mtHits(); this.mtUpdateStrikes(); this.mtUpdateCurtains(); this.mtDrawStrikes();
    this.blUpdate(mt.lights, delta, { toWorld:(x, y)=> this.mtW(x, y), solid:(x, y)=> this.mtSolid(x, y), S:mt.S, visible:mt.mode !== 'dead', spin:mt.mode === 'dying' ? 3 : (this.mtAtkType() === 'storm' ? 2 : 1) });
    mt.flames.forEach(f=>{ const p = this.mtW(f.a[0], f.a[1]); f.s.setPosition(p[0], p[1] + 6*mt.U*1.6); });
    const red = mt.st >= 3 && Math.floor(mt.f/14) % 2 === 0;       // clignotement blanc d'un coup, rouge en fin de vie
    if (mt.flash > 0){ mt.sp.setTintFill(0xffffff); mt.flash -= delta/33; if (mt.flash <= 0) mt.flash = 0; } else if (red) mt.sp.setTint(0xffb8a8); else mt.sp.clearTint();
    const pl = this.player; if (pl && pl.active && mt.mode === 'play'){ const [sx, sy] = this.mtS(pl.x, pl.y); if (this.mtSolid(sx, sy)) this.damagePlayer(MT.dmg.contact); }
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, mt.hp/mt.max*100) + '%';
  },
  mtStep(){        // une image de 1/60 s, comme sur la page
    const mt = this.mt; mt.f++; mt.hitT = Math.max(0, mt.hitT - 1);
    mt.strikes.forEach(s=> s.f++); mt.curtains.forEach(c=>{ c.f++; c.y += 3.1*mt.U*1.3; });          // le rideau descend de 3,1 px de page par image
    const ts = Math.floor(mt.t*10)/10; mt.jdy = Math.round(Math.sin(ts*1.9)*2);
    if (mt.mode === 'enter'){ mt.enter += 0.012; this.cameras.main.shake(40, 0.002); if (mt.enter >= 1){ mt.mode = 'play'; this.cameras.main.shake(200, 0.006); const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.add('show'); } }
    if (mt.mode === 'play' || mt.mode === 'dying') mt.t += (1/60)*(mt.mode === 'dying' ? 0.5 : 1);
    if (mt.mode === 'play'){
      this.mtUpdateAttack();
      const every = MT.smokeEvery[mt.st];
      if (every && mt.f % Math.round(every/16.7) === 0 && MT.anchors[mt.st]){ const a = Phaser.Utils.Array.GetRandom(MT.anchors[mt.st]), [x, y] = this.mtW(a[0], a[1]); this.mtSmoke(x, y - 6, 1.0 + mt.st*0.3); }
      if (mt.st >= 1 && mt.f % 50 === 0 && MT.anchors[mt.st]){ const a = Phaser.Utils.Array.GetRandom(MT.anchors[mt.st]), [x, y] = this.mtW(a[0], a[1]); this.mtArcFx(x, y, 0.8, Phaser.Math.FloatBetween(-0.5, 0.5)); this.mtSpark(x, y, 0.9); }
    }
    if (mt.mode === 'dying'){
      mt.dieT = (mt.dieT || 0) + 1;
      if (mt.dieT % 6 === 0){ const [x, y] = this.mtHullPoint(); this.mtBoom(x, y, Phaser.Math.Between(150, 260), mt.dieT % 18 === 0 ? 'mtBoomSmall' : ''); this.mtSpark(x, y, 1.3); this.mtShards(mt.st, 1, 6, 14, 1.2); }
      if (mt.dieT % 5 === 0){ const [x, y] = this.mtHullPoint(), [cx, cy] = this.mtW(MT.core[0], MT.core[1]); this.mtBolt(cx, cy, x, y, 130, 0.7); this.mtArcFx(x, y, 1.2, Phaser.Math.FloatBetween(-1, 1)); }      // des éclairs partent du cœur
      if (mt.dieT % 4 === 0){ const [x, y] = this.mtHullPoint(); const f = this.acFx('acFxFlame', 'acFlame', x, y + 8, 0.9*mt.U*1.1, { loop:true, vy:-8 }); this.time.delayedCall(900, ()=>{ if (f && f.active) f.destroy(); }); this.mtSmoke(x, y, 1.8); }
      if (mt.dieT > 110) this.mtDead();
    }
  },

  /* ---------- mort ---------- */
  mtAtkType(){ const a = this.mt && this.mt.atk; return a ? a.type : null; },
  mtHailStonesClear(){ this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); }); },
  mtDie(){
    const mt = this.mt; if (mt.mode === 'dying' || mt.dead) return;
    mt.mode = 'dying'; mt.dieT = 0; this.mtClearAttacks(); this.mtHailStonesClear();
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    this.startSlowmo && this.startSlowmo(1500, 0.5); this.juiceStop && this.juiceStop('bossKill'); this.mtSfx('mtRoar', mt.wx);
  },
  mtDead(){        // effondrement final : grosse explosion bleue, éclairs dans tous les sens, chaque pièce en un morceau ; puis fin du niveau
    bestiaryBossKill(this, 'meteo');
    const mt = this.mt; if (mt.dead) return; mt.dead = true;
    const cx = mt.wx, cy = mt.wy + 60*mt.U*1.6;
    this.cameras.main.flash(600, 200, 230, 255, false); this.cameras.main.shake(900, 0.014);
    this.mtBoom(cx, cy, 900, 'mtBoomBig'); this.mtBoom(cx, cy, 520, ''); this.mtBoom(cx - 60, cy - 40, 380, ''); this.mtBoom(cx + 60, cy + 40, 380, '');
    this.mtDeathPieces(); this.mtShards(mt.st, 20, 6, 20, 1.5);
    for (let k = 0; k < 7; k++){ const a = k/7*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3); this.mtBolt(cx, cy, cx + Math.cos(a)*300, cy + Math.sin(a)*300, 220, 1.2); }
    for (let k = 0; k < 20; k++) this.mtSpark(cx + Phaser.Math.Between(-50, 50), cy + Phaser.Math.Between(-50, 50), Phaser.Math.FloatBetween(0.7, 1.4));
    this.blDestroy(mt.lights); mt.sp.setVisible(false); mt.flames.forEach(f=> f.s.destroy()); mt.flames = [];
    this.time.delayedCall(300, ()=> this.mtSfx('mtLimb', cx)); this.time.delayedCall(250, ()=> this.mtSfx('mtThunder', cx));
    this.composantShower(cx, cy, COMP.miniBossBig);
    this.score += MT.killScore;
    this.time.delayedCall(2200, ()=>{ if (this.running) this.levelWin(); });
  },
});
