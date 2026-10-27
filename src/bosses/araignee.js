"use strict";
// Méthodes de GameScene — boss « Araignée de tri » (boss du niveau `w1-l2`, `finalBoss:'araignee'` dans data/worlds/monde-1.js). Autonome comme le boss du tuto : son état est dans `this.ar`.
// Elle TRIE : BENNES (les trappes des bras hauts s'ouvrent, les missiles sortent de leur logement), REBUTS (les bras bas crachent des morceaux de ferraille découpés dans sa coque)
// et FAISCEAU ambre (ligne de visée annoncée, puis balayage). 4 états d'usure ; un bras arraché part en un seul morceau, une trappe sans bras ne s'ouvre plus.
// La logique est celle de la page validée : elle tourne en « images » de 1/60 s et en unités de cette page (K = 1,5 px de page par px du sprite) ; `U` convertit les distances de la page en pixels du jeu.
const AR = {
  scale:0.62, K:1.5, OY:24, hp:1000, thresh:[70, 45, 20],
  core:[256, 225], nose:[256, 428],                                      // cœur (point faible : coups critiques) et museau (départ du faisceau), dans le sprite 512
  bw:56, bh:46,
  bays:[                                                                  // trappes sur les panneaux à voyants jaunes des bras (sprite 512) ; a = direction vers l'extérieur du bras, en degrés
    { id:'UL', x:100, y:138, a:-148, kind:'missile' }, { id:'UR', x:412, y:138, a:-32, kind:'missile' },
    { id:'LL', x:96, y:302, a:158, kind:'scrap' }, { id:'LR', x:416, y:299, a:22, kind:'scrap' },
  ],
  seq:[['missiles', 'scrap', 'beam'], ['missiles', 'scrap', 'beam'], ['scrap', 'missiles', 'beam'], ['missiles', 'scrap', 'missiles', 'beam']],    // enchaînement des attaques selon l'état
  count:{ missiles:[2, 3, 4, 4], scrap:[2, 3, 4, 5], beam:[1.3, 1.6, 1.9, 2.1] }, gap:[260, 220, 180, 150],                                       // projectiles par attaque, durée du faisceau (s), pause entre attaques (images)
  speed:1.4,                                                              // multiplicateur de vitesse des projectiles (les valeurs de la page sont pour une zone de 768 px)
  dmg:{ missile:12, scrap:10, beam:16, contact:14 }, critMul:2.5, killScore:800,
  regions:[(x, y)=> x < 178 && y < 182, (x, y)=> x > 334 && y < 182, (x, y)=> x < 165 && y >= 190 && y < 262, (x, y)=> x > 347 && y >= 190 && y < 262, (x, y)=> x < 172 && y >= 262, (x, y)=> x > 340 && y >= 262],
  anchors:{                                                               // points d'accroche (sprite 512) de la fumée et du feu, par état d'usure 1..3
    1:[[364, 253], [277, 323], [257, 371], [454, 314], [458, 310], [456, 312], [458, 312], [454, 308]],
    2:[[468, 89], [228, 188], [67, 232], [456, 234], [178, 279], [98, 292], [478, 72], [450, 252], [60, 108], [98, 308]],
    3:[[246, 148], [402, 163], [206, 185], [227, 251], [269, 250], [277, 308], [394, 182], [452, 104], [132, 258], [394, 200], [416, 226]],
  },
  smokeEvery:[0, 520, 300, 190],
  names:['ARAIGNÉE DE TRI', 'ARAIGNÉE DE TRI', 'ARAIGNÉE DE TRI', 'ARAIGNÉE DE TRI'],
};

mixin(GameScene, {
  /* ---------- création ---------- */
  arStart(){
    if (this.ar) return;
    const vy = this.visibleYRange(0), S = AR.scale, ar = this.ar = { st:0, hp:AR.hp, max:AR.hp, mode:'enter', t:0, enter:0, acc:0, f:0, atk:null, atkTimer:200, atkIdx:0, beam:null, shots:[], y0:vy.min, S, U:S/AR.K, cx:GAME_W/2, jdy:0, flash:0, dead:false, flames:[], px:0, py:0, wx:0, wy:0, hitT:0 };
    ar.bays = AR.bays.map(b=> Object.assign({ open:0, tgt:0 }, b));
    ar.sp = this.add.image(ar.cx, ar.y0 - 300, 'arSheet', 0).setDepth(5).setScale(S);
    ar.gfx = this.add.graphics().setDepth(7);
    ar.bays.forEach(b=>{ b.c = this.add.container(0, 0).setDepth(6); b.cav = this.add.graphics(); b.door = this.add.image(0, 0, 'arSheet').setOrigin(0, 0.5).setScale(S); b.load = this.add.sprite(0, 0, 'arFxMissile', 0).setVisible(false); b.c.add([b.cav, b.load, b.door]); });
    this.arDoors(0); this.arPlace(); ar.lights = this.blInit('araignee', 5.5);
    const wrap = document.getElementById('boss-hp-wrap'), lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = AR.names[0]; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; } if (wrap) wrap.classList.add('show');
    this.arSfx('arRoar', GAME_W/2);
  },
  arSfx(name, x, arg){ try { sfx[name]({ pan:this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- géométrie : page <-> monde ---------- */
  arPix(st){
    this._arPixC = this._arPixC || [];
    if (!this._arPixC[st]){
      const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(this.textures.get('arSheet').getSourceImage(), st*512, 0, 512, 512, 0, 0, 512, 512);
      const d = x.getImageData(0, 0, 512, 512).data, op = []; for (let y = 0; y < 512; y += 6) for (let xx = 0; xx < 512; xx += 6) if (d[(y*512 + xx)*4 + 3] > 200) op.push([xx, y]);
      this._arPixC[st] = { d, op };
    }
    return this._arPixC[st];
  },
  arSolid(sx, sy){ const p = this.arPix(this.ar.st).d; return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && p[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  arPlace(){
    const ar = this.ar, U = ar.U, mode = ar.mode, sway = Math.sin(ar.t*0.42)*(ar.st >= 3 ? 90 : 70);
    ar.px = mode === 'enter' ? 0 : sway; ar.py = AR.OY + (mode === 'enter' ? Math.pow(1 - Math.min(1, ar.enter), 3)*-640 : 0);
    ar.wx = ar.cx + ar.px*U; ar.wy = ar.y0 + (ar.py + 384)*U;
    ar.sp.setPosition(ar.wx, ar.wy + ar.jdy*ar.S);
  },
  arW(sx, sy){ const ar = this.ar; return [ar.wx + (sx - 256)*ar.S, ar.wy + (sy - 256 + ar.jdy)*ar.S]; },        // coordonnées du sprite -> monde
  arS(x, y){ const ar = this.ar; return [(x - ar.wx)/ar.S + 256, (y - ar.wy)/ar.S + 256 - ar.jdy]; },              // monde -> sprite
  arBayDir(b){ const a = Phaser.Math.DegToRad(b.a); return [Math.cos(a), Math.sin(a)]; },
  arBayAlive(b){ const d = this.arBayDir(b); return this.arSolid(b.x, b.y) && this.arSolid(b.x + d[0]*18, b.y + d[1]*18); },     // une trappe dont le bras est arraché ne s'ouvre plus
  arHullPoint(st){ const op = this.arPix(st === undefined ? this.ar.st : st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; return this.arW(o[0], o[1]); },

  /* ---------- trappes : le battant est découpé dans le sprite courant (il garde les brûlures), redressé le long de l'axe du bras ---------- */
  arDoors(st){
    const ar = this.ar, src = this.textures.get('arSheet').getSourceImage();
    ar.bays.forEach(b=>{
      const key = 'ard_' + st + '_' + b.id;
      if (!this.textures.exists(key)){ const c = document.createElement('canvas'); c.width = AR.bw; c.height = AR.bh; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        x.translate(AR.bw/2, AR.bh/2); x.rotate(-Phaser.Math.DegToRad(b.a)); x.drawImage(src, st*512, 0, 512, 512, -b.x, -b.y, 512, 512); this.textures.addCanvas(key, c); }
      b.door.setTexture(key); b.doorKey = key;
    });
  },
  arDrawBays(){
    const ar = this.ar, S = ar.S;
    ar.bays.forEach(b=>{
      const show = b.open > 0.001 && this.arBayAlive(b) && ar.mode !== 'dead';
      b.c.setVisible(show); if (!show) return;
      const [cx, cy] = this.arW(b.x, b.y), d = b.open*AR.bw*0.94, x0 = -AR.bw/2*S, rw = d*S, rh = AR.bh*0.88*S;
      b.c.setPosition(cx, cy).setRotation(Phaser.Math.DegToRad(b.a));
      const g = b.cav; g.clear();
      g.fillGradientStyle(0x050608, 0x15100c, 0x050608, 0x15100c, 1); g.fillRect(x0, -rh/2, rw, rh);                       // cavité : fond sombre, bord chaud
      g.fillStyle(0xff8c28, 0.35); g.fillRect(x0 + rw - 2, -rh/2, 2, rh); g.lineStyle(2, 0x000000, 1); g.strokeRect(x0, -rh/2, rw, rh);
      b.door.setPosition(x0 + d*S, 0);                                                                                       // le battant glisse vers l'extérieur
      const it = b.item;
      if (it){ const k = Math.min(1, it.f/14), lx = x0 + rw*(0.35 + 0.5*k);
        if (it.kind === 'missile'){ b.load.setVisible(true).setTexture('arFxMissile', (it.f >> 1) % 8).setOrigin(0.5, 0.97).setRotation(Math.PI/2).setScale(0.3*ar.U).setPosition(lx, 0); }
        else { b.load.setVisible(true).setTexture(it.key).setOrigin(0.5, 0.5).setRotation(it.f*0.05).setScale(0.8*S).setPosition(lx, 0); } }
      else b.load.setVisible(false);
    });
  },

  /* ---------- pièces découpées dans le sprite ---------- */
  arPieceCanvas(st, cells, x0, y0, w, h){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.textures.get('arSheet').getSourceImage();
    cells.forEach(([cx, cy])=> x.drawImage(src, st*512 + cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); return c;
  },
  arThrow(c, wx, wy, o){       // une pièce qui retombe en tournant puis disparaît ; la texture est retirée à la fin
    const key = 'arp_' + (this._arN = (this._arN || 0) + 1); this.textures.addCanvas(key, c);
    const s = this.add.image(wx, wy, key).setDepth(o.depth || 5).setScale(this.ar.S), life = o.life;
    this.tweens.add({ targets:s, x:wx + o.vx*life/1000, angle:o.spin, alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:wy + o.vy*life/1000 + o.fall, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
  },
  arShard(st, sx, sy, r, power){
    const S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(this.textures.get('arSheet').getSourceImage(), st*512 + sx - r, sy - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
    const m = document.createElement('canvas'); m.width = m.height = S2; const mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); const nv = Phaser.Math.Between(5, 7);
    for (let i = 0; i < nv; i++){ const a = i/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; i ? mx.lineTo(X, Y) : mx.moveTo(X, Y); } mx.fill();
    x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over'; return c;
  },
  arShards(st, n, rMin, rMax, power){
    const ar = this.ar;
    for (let k = 0; k < n; k++){ const op = this.arPix(st).op, o = op[Phaser.Math.Between(0, op.length - 1)], [wx, wy] = this.arW(o[0], o[1]), r = Phaser.Math.Between(rMin, rMax);
      this.arThrow(this.arShard(st, o[0], o[1], r), wx, wy, { vx:(wx - ar.cx)*1.4*power + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(20, 90)*power, fall:150, spin:Phaser.Math.Between(-300, 300), life:Phaser.Math.Between(1100, 1800) }); }
  },
  // un membre arraché part EN UN SEUL MORCEAU, avec sa vraie forme : on étiquette les zones perdues (blocs de 4 px) et on découpe chacune dans l'ancien sprite
  arBreakLimbs(from, to){
    const ar = this.ar, a = this.arPix(from).d, b = this.arPix(to).d, N = 128, lost = new Uint8Array(N*N), lab = new Int16Array(N*N);
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
      const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, [wx, wy] = this.arW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2), big = cells.length > 60;
      this.arThrow(this.arPieceCanvas(from, cc, x0, y0, w, h), wx, wy, { vx:(wx - ar.cx)*(big ? 0.9 : 1.4) + Phaser.Math.Between(-15, 15), vy:-Phaser.Math.Between(40, 160), fall:big ? 220 : 160, spin:Phaser.Math.Between(-360, 360), life:big ? Phaser.Math.Between(1800, 2400) : Phaser.Math.Between(1200, 1700) });
    });
  },
  arDeathPieces(){      // chaque bras restant s'envole en un seul morceau, à sa vraie forme
    const ar = this.ar, a = this.arPix(ar.st).d, N = 128;
    AR.regions.forEach(test=>{
      const cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
      if (cells.length < 30) return;
      const [wx, wy] = this.arW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2);
      this.arThrow(this.arPieceCanvas(ar.st, cells, x0, y0, (x1 - x0 + 1)*4, (y1 - y0 + 1)*4), wx, wy, { vx:(wx - ar.cx)*1.6 + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(60, 200), fall:260, spin:Phaser.Math.Between(-420, 420), life:Phaser.Math.Between(2000, 2800) });
    });
  },

  /* ---------- effets ---------- */
  arBoom(x, y, size, snd){      // explosion jaune-orange (palette feu) ; size en pixels de PAGE comme sur la page validée
    const big = size > 360, k = size*this.ar.U;
    this.acFx(big ? 'arFxBoomL' : 'brFxBoom', big ? 'arBoomL' : 'explodeBras', x, y, k/(big ? 256 : 160)*1.15, { depth:8 });
    if (size > 500) this.acFx('arFxShock', 'arShock', x, y, k/190, { depth:8 });
    if (snd) this.arSfx(snd, x);
  },
  arSmoke(x, y, sc){ this.acFx('acFxSmoke', 'acSmoke', x, y, sc*this.ar.U*1.6, { normal:true, vy:-24, alpha:0.85 }); },
  arSpark(x, y, sc){ this.acFx('acFxSpark', 'acSpark', x, y, sc*this.ar.U*2.2); },
  arFlames(){        // feu accroché aux trous, à partir de l'état 2
    const ar = this.ar; ar.flames.forEach(f=> f.s.destroy()); ar.flames = [];
    if (ar.st < 2) return;
    const list = ar.st === 2 ? AR.anchors[2].slice(0, 5) : AR.anchors[3], sc = ar.st === 2 ? 0.62 : 0.9;
    list.forEach((a, i)=>{ const s = this.add.sprite(0, 0, 'acFxFlame').setDepth(6).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale(sc*ar.U*1.1*(0.85 + (i % 3)*0.15)); s.play('acFlame'); s.anims.setProgress(((i*5) % 12)/12); ar.flames.push({ s, a }); });
  },

  /* ---------- dégâts reçus ---------- */
  arStageOf(pct){ return pct > AR.thresh[0] ? 0 : pct > AR.thresh[1] ? 1 : pct > AR.thresh[2] ? 2 : 3; },
  arDamage(x, y, d, crit){
    const ar = this.ar; if (ar.dead || ar.mode === 'dying') return;
    ar.hp = Math.max(0, ar.hp - d); if (ar.hitT <= 0 || crit){ ar.flash = crit ? 2 : 0.5; ar.hitT = 24; }          // le flash blanc est espacé : sous un tir rapide, la coque ne doit pas rester blanche
    this.acFx('acFxImpact', 'acImpact', x, y, crit ? 0.9 : 0.55); this.arSpark(x, y, crit ? 1.3 : 0.8); this.spawnHitParticles(x, y, crit ? 6 : 3);
    if (crit){ this.juiceShake(0.12); this.arSfx('arHitHeavy', x); } else this.arSfx('arHit', x);
    if (crit || Math.random() < 0.3){ const op = this.arPix(ar.st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; const [wx, wy] = this.arW(o[0], o[1]); this.arThrow(this.arShard(ar.st, o[0], o[1], Phaser.Math.Between(4, 7)), wx, wy, { vx:(wx - ar.cx)*1.1, vy:-Phaser.Math.Between(20, 80), fall:120, spin:Phaser.Math.Between(-300, 300), life:1000 }); }
    const ns = ar.hp <= 0 ? 3 : this.arStageOf(ar.hp/ar.max*100);
    if (ns > ar.st) this.arWound(ns);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, ar.hp/ar.max*100) + '%';
    if (ar.hp <= 0) this.arDie();
  },
  arWound(ns){
    const ar = this.ar, old = ar.st; ar.st = ns; ar.sp.setFrame(ns); this.arBreakLimbs(old, ns); this.arDoors(ns); this.arFlames(); this.arShards(old, 8, 5, 10, 1.2);
    this.cameras.main.shake(300, 0.012); this.juiceStop && this.juiceStop('bossPhase');
    for (let k = 0; k < 3; k++){ const [bx, by] = this.arHullPoint(); this.arBoom(bx, by, 200, k === 0 ? 'arBoomSmall' : ''); }
    if (ns >= 1) this.arSfx('arLimb', ar.wx);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + Math.min(3, ns);
    if (ar.atk && ar.atk.type !== 'beam') this.arCloseBays();
  },
  arHits(){        // tirs du joueur : un coup touche si le point est sur la coque (masque du sprite) ; le cœur donne un coup critique
    const ar = this.ar;
    const test = (list, missile)=>{
      list.children.iterate(b=>{
        if (!b || !b.active) return;
        const [sx, sy] = this.arS(b.x, b.y); if (!this.arSolid(sx, sy)) return;
        if (b._tH === ar) return;
        const keep = (b.pierceLeft || 0) > 0, crit = Math.hypot(sx - AR.core[0], sy - AR.core[1]) < 52;
        if (missile) this.explodeFx(b.x, b.y, 50);
        this.arDamage(b.x, b.y, (b.damage || (missile ? 20 : 10))*(crit ? AR.critMul : 1), crit);
        if (keep){ b.pierceLeft--; b._tH = ar; } else if (b.active) b.destroy();
      });
    };
    test(this.playerBullets, false); test(this.missiles, true);
  },

  /* ---------- attaques ---------- */
  arCloseBays(){ this.ar.bays.forEach(b=> b.tgt = 0); },
  arStartAttack(){ const ar = this.ar, seq = AR.seq[ar.st]; ar.atk = { type:seq[ar.atkIdx++ % seq.length], f:0, n:0 }; },
  arUpdateAttack(){
    const ar = this.ar; let atk = ar.atk;
    if (!atk){ if (--ar.atkTimer <= 0) this.arStartAttack(); return; }
    atk.f++;
    if (atk.type === 'missiles' || atk.type === 'scrap'){
      const kind = atk.type === 'missiles' ? 'missile' : 'scrap', bays = ar.bays.filter(b=> b.kind === kind && this.arBayAlive(b));
      if (!bays.length){ this.arCloseBays(); ar.atk = null; ar.atkTimer = 40; return; }
      const total = AR.count[atk.type][ar.st], per = 22;
      if (atk.f === 1){ bays.forEach(b=>{ b.tgt = 1; b.item = null; }); this.arSfx('arDoorOpen', ar.wx); }
      for (let i = 0; i < total; i++){       // le logement se garnit pendant que la trappe s'ouvre : on voit le projectile glisser vers la sortie
        const b = bays[i % bays.length], t0 = 18 + i*per;
        if (atk.f === t0){ b.item = { kind, f:0 }; if (kind === 'scrap'){ const op = this.arPix(0).op, p = op[Phaser.Math.Between(0, op.length - 1)], r = Phaser.Math.Between(14, 20), key = 'ars_' + (this._arN = (this._arN || 0) + 1); this.textures.addCanvas(key, this.arShard(0, p[0], p[1], r)); b.item.key = key; } }
        if (b.item && atk.f > t0 && atk.f < t0 + 14) b.item.f++;
        if (atk.f === t0 + 14){ this.arLaunch(b, kind); if (b.item && b.item.key) this.textures.remove(b.item.key); b.item = null; }
      }
      const end = 18 + total*per + 26;
      if (atk.f === end - 16){ this.arCloseBays(); this.arSfx('arDoorClose', ar.wx); }
      if (atk.f >= end){ ar.atk = null; ar.atkTimer = AR.gap[ar.st]; }
    }
    if (ar.atk && atk.type === 'beam'){
      const dur = AR.count.beam[ar.st]*60, F0 = 54, [nx, ny] = this.arW(AR.nose[0], AR.nose[1]);
      if (atk.f === 1){ this.arSfx('arBeamCharge', nx); atk.ang = Math.random() < 0.5 ? -0.42 : 0.42; atk.chg = this.add.sprite(nx, ny + 8, 'acFxCharge').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setScale(1.0*ar.U*1.8); atk.chg.play('acCharge'); }
      if (atk.chg) atk.chg.setPosition(nx, ny + 8);
      if (atk.f === F0){ this.arSfx('arBeamFire', nx); this.cameras.main.shake(200, 0.006); if (atk.chg){ atk.chg.destroy(); atk.chg = null; } this.acFx('acFxMuzzle', 'acMuzzle', nx, ny, 1.1*ar.U*2); }
      if (atk.f > F0 && atk.f < F0 + dur){ const u = (atk.f - F0)/dur; ar.beam = { x:nx, y:ny, a:Math.PI/2 + atk.ang*(1 - 2*u) }; if (atk.f % 6 === 0){ const L = Phaser.Math.Between(150, 520)*ar.U; this.arSpark(nx + Math.cos(ar.beam.a)*L, ny + Math.sin(ar.beam.a)*L, 0.9); } }
      else ar.beam = null;
      if (atk.f >= F0 + dur + 14){ if (atk.chg) atk.chg.destroy(); ar.atk = null; ar.beam = null; ar.atkTimer = AR.gap[ar.st]; }
    }
  },
  arLaunch(b, kind){
    const ar = this.ar, [x, y] = this.arW(b.x, b.y), d = this.arBayDir(b), U = ar.U; if (this._bLoad > BULLET_CAP) return;
    this.acFx('acFxMuzzle', 'acMuzzle', x, y, 0.55*U*2); this.arSmoke(x + d[0]*20*U, y + d[1]*20*U, 0.9);
    if (kind === 'missile'){
      const o = this.enemyBullets.create(x, y, 'arFxMissile', 0); o.setDepth(4); o.damage = AR.dmg.missile; o.setOrigin(0.5, 0.97).setScale(0.62*U*0.5); o.setBlendMode(Phaser.BlendModes.ADD); o.play('arMissile');
      o.body.setCircle(18, 14, 34); o.body.setVelocity(d[0]*90*U*1.1*AR.speed, d[1]*90*U*1.1*AR.speed);
      ar.shots.push({ kind:'missile', o, f:0, vx:d[0]*90, vy:d[1]*90 }); this.arSfx('arMissile', x);
    } else {
      const op = this.arPix(0).op, p = op[Phaser.Math.Between(0, op.length - 1)], key = 'ars_' + (this._arN = (this._arN || 0) + 1);
      this.textures.addCanvas(key, this.arShard(0, p[0], p[1], Phaser.Math.Between(16, 24)));
      const o = this.enemyBullets.create(x, y, key); o.setDepth(4); o.damage = AR.dmg.scrap; o.setScale(ar.S); const r = Math.max(7, o.width*0.32); o.body.setCircle(r, o.width/2 - r, o.height/2 - r);
      const vx = d[0]*80 + Phaser.Math.Between(-40, 40), vy = Phaser.Math.Between(150, 230); o.body.setVelocity(vx*U*AR.speed, vy*U*AR.speed); o.setAngularVelocity(Phaser.Math.Between(-290, 290));
      o.once('destroy', ()=>{ this.textures.remove(key); });
      ar.shots.push({ kind:'scrap', o, f:0, vx, vy }); this.arSfx('arScrap', x);
    }
  },
  arUpdateShots(){        // trajectoires à chaque image : le missile sort du logement, puis se redresse et plonge vers le centre
    const ar = this.ar, U = ar.U;
    ar.shots = ar.shots.filter(s=> s.o && s.o.active);
    ar.shots.forEach(s=>{
      s.f++; const o = s.o;
      if (s.kind === 'missile'){
        if (s.f < 26){ s.vx *= 0.97; s.vy *= 0.97; o.body.setVelocity(s.vx*U*1.1*AR.speed, s.vy*U*1.1*AR.speed); }
        else { s.vy = Math.min(380, s.vy + 9); s.vx += ((ar.cx - o.x)/U)*0.0016; o.body.setVelocity(s.vx*U*AR.speed, s.vy*U*AR.speed); if (s.f % 4 === 0) this.arSmoke(o.x, o.y - 40*U*(s.vy > 100 ? 1 : 0.3), 0.55); }
        o.setRotation(Math.atan2(s.vy, s.vx) - Math.PI/2); o.setScale(0.62*U*0.5*(0.5 + 0.5*Math.min(1, s.f/20)));
      } else { s.vx *= 0.995; o.body.setVelocity(s.vx*U*AR.speed, s.vy*U*AR.speed); if (s.f % 7 === 0) this.arSpark(o.x, o.y, 0.35); }
    });
  },
  arDrawBeam(){
    const ar = this.ar, g = ar.gfx; g.clear();
    const atk = ar.atk;
    if (atk && atk.type === 'beam' && atk.f < 54){          // ligne de visée annoncée avant le tir
      const [nx, ny] = this.arW(AR.nose[0], AR.nose[1]), a = Math.PI/2 + atk.ang, k = atk.f/54; g.lineStyle(2, 0xffb040, 0.18 + 0.25*k);
      for (let L = 0; L < 760; L += 16*ar.U*3){ g.beginPath(); g.moveTo(nx + Math.cos(a)*L, ny + Math.sin(a)*L); g.lineTo(nx + Math.cos(a)*(L + 16*ar.U*1.6), ny + Math.sin(a)*(L + 16*ar.U*1.6)); g.strokePath(); }
    }
    const bm = ar.beam; if (!bm) return;
    const w = (30 + Math.sin(this.time.now*0.054)*4)*ar.U*1.7, L = 900, dx = Math.cos(bm.a), dy = Math.sin(bm.a), px = -dy, py = dx;
    g.setBlendMode(Phaser.BlendModes.ADD);
    [[w*2.6, 0xff781e, 0.18], [w*1.5, 0xffaa3c, 0.35], [w*0.7, 0xffe6a0, 0.7], [w*0.3, 0xfffff0, 1]].forEach(([ww, col, al])=>{
      g.fillStyle(col, al); g.beginPath(); g.moveTo(bm.x + px*ww/2, bm.y + py*ww/2); g.lineTo(bm.x - px*ww/2, bm.y - py*ww/2); g.lineTo(bm.x - px*ww/2 + dx*L, bm.y - py*ww/2 + dy*L); g.lineTo(bm.x + px*ww/2 + dx*L, bm.y + py*ww/2 + dy*L); g.closePath(); g.fillPath();
    });
    const pl = this.player; if (pl && pl.active){ const rx = pl.x - bm.x, ry = pl.y - bm.y, along = rx*dx + ry*dy, perp = Math.abs(rx*px + ry*py); if (along > 0 && perp < w*0.55 + 6) this.damagePlayer(AR.dmg.beam); }
  },

  /* ---------- à chaque image ---------- */
  arUpdate(delta){
    const ar = this.ar; if (!ar || ar.dead) return;
    ar.acc += Math.min(delta, 100); let n = 0;
    while (ar.acc >= 16.667 && n++ < 6){ ar.acc -= 16.667; this.arStep(); }
    this.arPlace(); this.arHits(); this.arDrawBays(); this.arDrawBeam();
    this.blUpdate(ar.lights, delta, { toWorld:(x, y)=> this.arW(x, y), solid:(x, y)=> this.arSolid(x, y), S:ar.S, visible:ar.mode !== 'dead', spin:ar.mode === 'dying' ? 3 : 1 });
    ar.flames.forEach(f=>{ const p = this.arW(f.a[0], f.a[1]); f.s.setPosition(p[0], p[1] + 6*ar.U*1.6); });
    // clignotement blanc d'un coup, rouge en fin de vie
    const red = ar.st >= 3 && Math.floor(ar.f/14) % 2 === 0;
    if (ar.flash > 0){ ar.sp.setTintFill(0xffffff); ar.flash -= delta/33; if (ar.flash <= 0) ar.flash = 0; } else if (red) ar.sp.setTint(0xffb8a8); else ar.sp.clearTint();
    const pl = this.player; if (pl && pl.active && ar.mode === 'play'){ const [sx, sy] = this.arS(pl.x, pl.y); if (this.arSolid(sx, sy)) this.damagePlayer(AR.dmg.contact); }
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, ar.hp/ar.max*100) + '%';
  },
  arStep(){        // une image de 1/60 s, comme sur la page
    const ar = this.ar; ar.f++;
    ar.bays.forEach(b=>{ b.open += Math.sign(b.tgt - b.open)*Math.min(Math.abs(b.tgt - b.open), 1/18); });
    ar.hitT = Math.max(0, ar.hitT - 1);
    const ts = Math.floor(ar.t*10)/10; ar.jdy = Math.round(Math.sin(ts*1.9)*2);
    if (ar.mode === 'enter'){ ar.enter += 0.012; this.cameras.main.shake(40, 0.002); if (ar.enter >= 1){ ar.mode = 'play'; this.cameras.main.shake(200, 0.006); } }
    if (ar.mode === 'play' || ar.mode === 'dying') ar.t += (1/60)*(ar.mode === 'dying' ? 0.5 : 1);
    if (ar.mode === 'play'){
      this.arUpdateAttack(); this.arUpdateShots();
      const every = AR.smokeEvery[ar.st];
      if (every && ar.f % Math.round(every/16.7) === 0 && AR.anchors[ar.st]){ const a = Phaser.Utils.Array.GetRandom(AR.anchors[ar.st]), [x, y] = this.arW(a[0], a[1]); this.arSmoke(x, y - 6, 1.0 + ar.st*0.3); }
      if (ar.st >= 1 && ar.f % 80 === 0 && AR.anchors[ar.st]){ const a = Phaser.Utils.Array.GetRandom(AR.anchors[ar.st]), [x, y] = this.arW(a[0], a[1]); this.arSpark(x, y, 0.9); }
    }
    if (ar.mode === 'dying'){
      ar.dieT = (ar.dieT || 0) + 1; ar.beam = null; this.arCloseBays();
      if (ar.dieT % 6 === 0){ const [x, y] = this.arHullPoint(); this.arBoom(x, y, Phaser.Math.Between(150, 260), ar.dieT % 18 === 0 ? 'arBoomSmall' : ''); this.arSpark(x, y, 1.3); this.arShards(ar.st, 1, 6, 14, 1.2); }
      if (ar.dieT % 4 === 0){ const [x, y] = this.arHullPoint(); const f = this.acFx('acFxFlame', 'acFlame', x, y + 8, 0.9*ar.U*1.1, { loop:true, vy:-8 }); this.time.delayedCall(900, ()=>{ if (f && f.active) f.destroy(); }); this.arSmoke(x, y, 1.8); }
      if (ar.dieT > 110) this.arDead();
    }
  },

  /* ---------- mort ---------- */
  arDie(){
    const ar = this.ar; if (ar.mode === 'dying' || ar.dead) return;
    ar.mode = 'dying'; ar.dieT = 0; ar.atk && ar.atk.chg && ar.atk.chg.destroy(); ar.atk = null; ar.beam = null;
    this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    this.startSlowmo && this.startSlowmo(1500, 0.5); this.juiceStop && this.juiceStop('bossKill'); this.arSfx('arRoar', ar.wx);
  },
  arDead(){        // effondrement final : grosse explosion, chaque bras en un morceau, éclats et étincelles ; puis fin du niveau
    const ar = this.ar; if (ar.dead) return; ar.dead = true;
    const cx = ar.wx, cy = ar.wy + 84*ar.U*1.6;
    this.cameras.main.flash(600, 255, 255, 255, false); this.cameras.main.shake(900, 0.014);
    this.arBoom(cx, cy, 900, 'arBoomBig'); this.arBoom(cx, cy, 520, ''); this.arBoom(cx - 60, cy - 40, 380, ''); this.arBoom(cx + 60, cy + 40, 380, '');
    this.arDeathPieces(); this.arShards(ar.st, 20, 6, 20, 1.5);
    for (let k = 0; k < 20; k++) this.arSpark(cx + Phaser.Math.Between(-50, 50), cy + Phaser.Math.Between(-50, 50), Phaser.Math.FloatBetween(0.7, 1.4));
    this.blDestroy(ar.lights); ar.sp.setVisible(false); ar.bays.forEach(b=> b.c.setVisible(false)); ar.flames.forEach(f=> f.s.destroy()); ar.flames = []; ar.gfx.clear();
    this.time.delayedCall(300, ()=> this.arSfx('arLimb', cx)); this.time.delayedCall(700, ()=> this.arSfx('arLimb', cx));
    this.score += AR.killScore;
    this.time.delayedCall(2200, ()=>{ if (this.running) this.levelWin(); });
  },
});
