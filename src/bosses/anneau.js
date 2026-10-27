"use strict";
// Méthodes de GameScene — boss « L'Anneau » (boss de fin du niveau `w1-l4`, `finalBoss:'anneau'` dans data/worlds/monde-1.js). Autonome comme l'Araignée, la Météo et le Réacteur : son état est dans `this.an`.
// Une station orbitale dont l'ANNEAU central tourne pour de vrai (le moyeu et le nez restent fixes ; l'anneau ralentit puis se grippe quand la station s'abîme).
// Trois attaques en boucle : RAYONS (le moyeu charge, quatre rayons violets balaient l'écran en tournant), TOURELLES (4 tourelles d'angle + 2 pointes tirent des salves visées, à tour de rôle ; chacune meurt avec sa pièce de coque),
// BAIES (deux volets blindés coulissent sur les baies latérales et deux Éclaireurs en sortent). Jeu de lumières : rotor au moyeu, chenille de lumières qui court sur l'anneau en sens inverse, comète sur la roue extérieure, tourelles qui clignotent.
// La logique est celle de la page validée : elle tourne en « images » de 1/60 s et en unités de cette page (S de la page = 0,6) ; `U` convertit les distances de la page en pixels du jeu.
const AN = {
  scale:0.46, pageS:0.6, hp:1100, thresh:[70, 45, 20],
  ring:{ cx:256, cy:252, r0:52, r1:120, nose:[198, 314, 288] }, hub:[256, 252], critR:44,                    // anneau tournant (sprite 512) ; le nez (x 198..314, y >= 288) et le moyeu restent fixes
  turrets:[[118, 82], [394, 82], [112, 404], [402, 404], [230, 25], [284, 25]],                                // quatre tourelles d'angle et deux pointes du haut
  bays:[[30, 250], [485, 250]], bayX:[27, 449], bayY:[208, 288], bayW:37,                                        // baies latérales (volets)
  spin:[1, 0.7, 0.42, 0.12],                                                                                    // vitesse de l'anneau par état d'usure
  dmg:{ beam:14, orb:11, contact:14 }, killScore:1000,
  flames:[[170, 120], [350, 120], [256, 150], [150, 330]],
  regions:[(x, y)=> x < 118 && y < 252, (x, y)=> x > 394 && y < 252, (x, y)=> x < 190 && y >= 252, (x, y)=> x > 322 && y >= 252, (x, y)=> x >= 118 && x <= 394 && y < 200, (x, y)=> x >= 190 && x <= 322 && y >= 252],
  names:['L\'ANNEAU', 'L\'ANNEAU', 'L\'ANNEAU', 'L\'ANNEAU'],
};

mixin(GameScene, {
  /* ---------- création ---------- */
  anStart(){
    if (this.an) return;
    const vy = this.visibleYRange(0), S = AN.scale, U = S/AN.pageS;
    const an = this.an = { st:0, hp:AN.hp, max:AN.hp, mode:'enter', t:0, enter:0, acc:0, f:0, y0:vy.min, S, U, cx:GAME_W/2, wx:GAME_W/2, wy:vy.min, flash:0, dead:false, hitT:0, ang:0, rspeed:0.03, atk:'idle', atT:0, idleT:80, atIdx:0, spokeA:0, bayOpen:0, tq:[], rotAng:0, dieT:0, flames:[], boost:0 };
    this.anTex(0);
    an.base = this.add.image(an.cx, an.y0, 'anBase0').setDepth(5).setScale(S); an.ring = this.add.image(an.cx, an.y0, 'anRing0').setDepth(5.1).setScale(S).setOrigin(0.5, AN.ring.cy/512);
    an.doors = this.add.graphics().setDepth(5.2); an.rotor = this.add.image(0, 0, 'anFxRotor').setDepth(5.6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.75);
    const glow = (d, a)=>{ const s = this.add.sprite(0, 0, 'anFxGlow').setDepth(d || 5.6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(a || 1); s.play('anGlow'); s.anims.setProgress(Math.random()); return s; };
    an.chase = []; for (let k = 0; k < 12; k++) an.chase.push(glow(5.6)); an.comet = []; for (let k = 0; k < 14; k++) an.comet.push(glow(5.6));
    an.tg = AN.turrets.map(()=> glow(5.7, 0)); an.bayG = AN.bays.map(()=> glow(5.7, 0)); an.hubG = glow(5.5, 0); an.strobe = [0, 1, 2].map(()=> { const s = this.add.sprite(0, 0, 'anFxGlowHot').setDepth(5.7).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); s.play('anGlowHot'); return s; });
    an.beams = []; for (let k = 0; k < 8; k++){ const s = this.add.sprite(0, 0, 'anFxBeam').setDepth(5.3).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); s.play('anBeam'); an.beams.push(s); }
    this.anPlace();
    const wrap = document.getElementById('boss-hp-wrap'), lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = AN.names[0]; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; } if (wrap) wrap.classList.add('show');
    this.anSfx('anRoar', GAME_W/2);
  },
  anSfx(name, x){ try { sfx[name]({ pan:this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- planches : le sprite, son masque, l'anneau seul et le reste ---------- */
  anSrc(st){ this._anSrcC = this._anSrcC || []; if (!this._anSrcC[st]){ const c = document.createElement('canvas'); c.width = c.height = 512; c.getContext('2d', { willReadFrequently:true }).drawImage(this.textures.get('anSheet').getSourceImage(), st*512, 0, 512, 512, 0, 0, 512, 512); this._anSrcC[st] = c; } return this._anSrcC[st]; },
  anPix(st){
    this._anPixC = this._anPixC || [];
    if (!this._anPixC[st]){ const d = this.anSrc(st).getContext('2d').getImageData(0, 0, 512, 512).data, op = []; for (let y = 0; y < 512; y += 6) for (let xx = 0; xx < 512; xx += 6) if (d[(y*512 + xx)*4 + 3] > 200) op.push([xx, y]); this._anPixC[st] = { d, op }; }
    return this._anPixC[st];
  },
  anTex(st){        // deux textures par état : l'anneau (couronne sans le nez) qui tourne, et tout le reste qui reste fixe
    if (this.textures.exists('anRing' + st)) return;
    const R = AN.ring, src = this.anSrc(st), m = document.createElement('canvas'); m.width = m.height = 512; const mk = m.getContext('2d'); mk.fillStyle = '#fff'; mk.beginPath(); mk.arc(R.cx, R.cy, R.r1, 0, 6.2832); mk.arc(R.cx, R.cy, R.r0, 0, 6.2832, true); mk.fill('evenodd'); mk.clearRect(R.nose[0], R.nose[2], R.nose[1] - R.nose[0], 512);
    const r = document.createElement('canvas'); r.width = r.height = 512; const rx = r.getContext('2d'); rx.drawImage(src, 0, 0); rx.globalCompositeOperation = 'destination-in'; rx.drawImage(m, 0, 0);
    const b = document.createElement('canvas'); b.width = b.height = 512; const bx = b.getContext('2d'); bx.drawImage(src, 0, 0); bx.globalCompositeOperation = 'destination-out'; bx.drawImage(m, 0, 0);
    this.textures.addCanvas('anRing' + st, r); this.textures.addCanvas('anBase' + st, b);
  },
  anSolid(sx, sy){ const p = this.anPix(this.an.st).d; return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && p[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  anTurAlive(i){ return this.anSolid(AN.turrets[i][0], AN.turrets[i][1]); }, anBayAlive(i){ return this.anSolid(AN.bays[i][0], AN.bays[i][1]); },
  anPlace(){
    const an = this.an, S = an.S, U = an.U, sway = Math.sin(an.t*0.54)*30*U;
    an.wx = an.cx + (an.mode === 'enter' ? 0 : sway); an.wy = an.y0 + 150 + (an.mode === 'enter' ? Math.pow(1 - Math.min(1, an.enter), 3)*-420 : 0);
    an.base.setPosition(an.wx, an.wy); const [rx, ry] = this.anW(AN.ring.cx, AN.ring.cy); an.ring.setPosition(rx, ry).setRotation(an.ang);
  },
  anW(sx, sy){ const an = this.an; return [an.wx + (sx - 256)*an.S, an.wy + (sy - 256)*an.S]; },        // coordonnées du sprite -> monde
  anS(x, y){ const an = this.an; return [(x - an.wx)/an.S + 256, (y - an.wy)/an.S + 256]; },              // monde -> sprite
  anHullPoint(st){ const op = this.anPix(st === undefined ? this.an.st : st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; return this.anW(o[0], o[1]); },

  /* ---------- pièces découpées dans le sprite ---------- */
  anPieceCanvas(st, cells, x0, y0, w, h){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.anSrc(st);
    cells.forEach(([cx, cy])=> x.drawImage(src, cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); return c;
  },
  anThrow(c, wx, wy, o){       // une pièce qui retombe en tournant puis disparaît ; la texture est retirée à la fin
    const key = 'anp_' + (this._anN = (this._anN || 0) + 1); this.textures.addCanvas(key, c);
    const s = this.add.image(wx, wy, key).setDepth(5).setScale(this.an.S), life = o.life;
    this.tweens.add({ targets:s, x:wx + o.vx*life/1000, angle:o.spin, alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:wy + o.vy*life/1000 + o.fall, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
  },
  anShard(st, sx, sy, r){
    const S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(this.anSrc(st), sx - r, sy - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
    const m = document.createElement('canvas'); m.width = m.height = S2; const mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); const nv = Phaser.Math.Between(5, 7);
    for (let i = 0; i < nv; i++){ const a = i/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; i ? mx.lineTo(X, Y) : mx.moveTo(X, Y); } mx.fill();
    x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over'; return c;
  },
  anShards(st, n, rMin, rMax, power){
    const an = this.an;
    for (let k = 0; k < n; k++){ const op = this.anPix(st).op, o = op[Phaser.Math.Between(0, op.length - 1)], [wx, wy] = this.anW(o[0], o[1]), r = Phaser.Math.Between(rMin, rMax);
      this.anThrow(this.anShard(st, o[0], o[1], r), wx, wy, { vx:(wx - an.cx)*1.4*power + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(20, 90)*power, fall:150, spin:Phaser.Math.Between(-300, 300), life:Phaser.Math.Between(1100, 1800) }); }
  },
  anBreakLimbs(from, to){        // une pièce arrachée part EN UN SEUL MORCEAU, avec sa vraie forme
    const an = this.an, a = this.anPix(from).d, b = this.anPix(to).d, N = 128, lost = new Uint8Array(N*N), lab = new Int16Array(N*N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){ const i = ((y*4 + 2)*512 + (x*4 + 2))*4; lost[y*N + x] = a[i + 3] > 128 && b[i + 3] < 128 ? 1 : 0; }
    let n = 0; const comps = [];
    for (let s = 0; s < N*N; s++){
      if (!lost[s] || lab[s]) continue; n++; const q = [s], cells = []; lab[s] = n;
      while (q.length){ const c = q.pop(); cells.push(c); const cx = c % N, cy = (c/N) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy])=>{ const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; const k = ny*N + nx; if (lost[k] && !lab[k]){ lab[k] = n; q.push(k); } }); }
      comps.push(cells);
    }
    comps.sort((p, q)=> q.length - p.length);
    comps.slice(0, 6).forEach(cells=>{
      if (cells.length < 6) return;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const cc = cells.map(c=>[c % N, (c/N) | 0]); cc.forEach(([cx, cy])=>{ x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); });
      const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, [wx, wy] = this.anW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2), big = cells.length > 60;
      this.anThrow(this.anPieceCanvas(from, cc, x0, y0, w, h), wx, wy, { vx:(wx - an.cx)*(big ? 0.9 : 1.4) + Phaser.Math.Between(-15, 15), vy:-Phaser.Math.Between(40, 160), fall:big ? 220 : 160, spin:Phaser.Math.Between(-360, 360), life:big ? Phaser.Math.Between(1800, 2400) : Phaser.Math.Between(1200, 1700) });
    });
  },
  anDeathPieces(){      // chaque pièce restante s'envole en un seul morceau ; l'anneau part tout entier, en tournant
    const an = this.an, a = this.anPix(an.st).d, N = 128, R = AN.ring;
    const rc = document.createElement('canvas'); rc.width = rc.height = 512; rc.getContext('2d').drawImage(this.textures.get('anRing' + an.st).getSourceImage(), 0, 0); const [rx, ry] = this.anW(256, 256);
    this.anThrow(rc, rx, ry, { vx:Phaser.Math.Between(-30, 30), vy:-200, fall:260, spin:Phaser.Math.Between(240, 360)*(Math.random() < 0.5 ? -1 : 1), life:2600 });
    AN.regions.forEach(test=>{
      const cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2, dr = Math.hypot(X - R.cx, Y - R.cy); if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y) && !(dr > R.r0 && dr < R.r1 && !(X > R.nose[0] && X < R.nose[1] && Y > R.nose[2]))){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
      if (cells.length < 30) return;
      const [wx, wy] = this.anW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2);
      this.anThrow(this.anPieceCanvas(an.st, cells, x0, y0, (x1 - x0 + 1)*4, (y1 - y0 + 1)*4), wx, wy, { vx:(wx - an.cx)*1.6 + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(60, 200), fall:260, spin:Phaser.Math.Between(-420, 420), life:Phaser.Math.Between(2000, 2800) });
    });
  },

  /* ---------- effets ---------- */
  anFx(key, anim, x, y, scale, o){       // effet violet additif qui joue une fois puis disparaît ; `scale` comme sur la page (multiplié par U)
    o = o || {}; const s = this.add.sprite(x, y, key).setDepth(o.depth || 8).setScale(scale*this.an.U).setBlendMode(Phaser.BlendModes.ADD); if (o.alpha) s.setAlpha(o.alpha); if (o.rot) s.setRotation(o.rot);
    s.play(anim); if (!o.loop) s.once('animationcomplete', ()=> s.destroy()); return s;
  },
  anBoom(x, y, size, snd){      // explosion violette ; size en pixels de PAGE
    const big = size > 360, k = size*this.an.U;
    this.anFx(big ? 'anFxBoomL' : 'anFxBoomM', big ? 'anBoomL' : 'anBoomM', x, y, k/(big ? 256 : 160)/this.an.U);
    if (size > 500) this.anFx('anFxShock', 'anShock', x, y, size/190);
    if (snd) this.anSfx(snd, x);
  },
  anSmoke(x, y, sc){ this.acFx('acFxSmoke', 'acSmoke', x, y, sc*this.an.U*1.6, { normal:true, vy:-24, alpha:0.85 }); },
  anSpark(x, y, sc){ this.anFx('anFxSpark', 'anSpark', x, y, sc*2.2); },
  anFlames(){        // feu accroché aux trous, à partir de l'état 2
    const an = this.an; an.flames.forEach(f=> f.s.destroy()); an.flames = [];
    if (an.st < 2) return;
    AN.flames.forEach((a, i)=>{ const s = this.add.sprite(0, 0, 'acFxFlame').setDepth(6).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale((0.3 + 0.05*an.st)*an.U*1.1*(0.85 + (i % 3)*0.15)); s.play('acFlame'); s.anims.setProgress(((i*5) % 12)/12); an.flames.push({ s, a }); });
  },

  /* ---------- dégâts reçus ---------- */
  anStageOf(pct){ return pct > AN.thresh[0] ? 0 : pct > AN.thresh[1] ? 1 : pct > AN.thresh[2] ? 2 : 3; },
  anDamage(x, y, d, crit){
    const an = this.an; if (an.dead || an.mode === 'dying') return;
    an.hp = Math.max(0, an.hp - d); if (an.hitT <= 0 || crit){ an.flash = crit ? 2 : 0.5; an.hitT = 24; }
    this.anFx('anFxImpact', 'anImpact', x, y, crit ? 0.9 : 0.55); this.anSpark(x, y, crit ? 1.3 : 0.8); this.spawnHitParticles(x, y, crit ? 6 : 3);
    if (crit){ this.juiceShake(0.12); this.anSfx('anHitHeavy', x); } else this.anSfx('anHit', x);
    if (crit || Math.random() < 0.3){ const op = this.anPix(an.st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; const [wx, wy] = this.anW(o[0], o[1]); this.anThrow(this.anShard(an.st, o[0], o[1], Phaser.Math.Between(4, 7)), wx, wy, { vx:(wx - an.cx)*1.1, vy:-Phaser.Math.Between(20, 80), fall:120, spin:Phaser.Math.Between(-300, 300), life:1000 }); }
    const ns = an.hp <= 0 ? 3 : this.anStageOf(an.hp/an.max*100);
    if (ns > an.st) this.anWound(ns);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, an.hp/an.max*100) + '%';
    if (an.hp <= 0) this.anDie();
  },
  anWound(ns){
    const an = this.an, old = an.st; an.st = ns; this.anTex(ns); an.base.setTexture('anBase' + ns); an.ring.setTexture('anRing' + ns); this.anBreakLimbs(old, ns); this.anFlames(); this.anShards(old, 8, 5, 10, 1.2);
    this.cameras.main.shake(300, 0.012); this.juiceStop && this.juiceStop('bossPhase');
    for (let k = 0; k < 3; k++){ const [bx, by] = this.anHullPoint(); this.anBoom(bx, by, 200, k === 0 ? 'anBoomSmall' : ''); }
    this.anSfx('anLimb', an.wx);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + Math.min(3, ns);
  },
  anHits(){        // tirs du joueur : un coup touche si le point est sur la coque (masque du sprite) ; le moyeu donne un coup critique
    const an = this.an;
    const test = (list, missile)=>{
      list.children.iterate(b=>{
        if (!b || !b.active) return;
        const [sx, sy] = this.anS(b.x, b.y); if (!this.anSolid(sx, sy)) return;
        if (b._tH === an) return;
        const keep = (b.pierceLeft || 0) > 0, crit = Math.hypot(sx - AN.hub[0], sy - AN.hub[1]) < AN.critR;
        if (missile) this.explodeFx(b.x, b.y, 50);
        this.anDamage(b.x, b.y, (b.damage || (missile ? 20 : 10))*(crit ? 2.5 : 1), crit);
        if (keep){ b.pierceLeft--; b._tH = an; } else if (b.active) b.destroy();
      });
    };
    test(this.playerBullets, false); test(this.missiles, true);
  },

  /* ---------- attaques ---------- */
  anStartAtk(a){
    const an = this.an; an.atk = a; an.atT = 0; an.tq = [];
    if (a === 'spokes'){ an.spokeA = Math.random()*6.28; this.anSfx('anSpokesCharge', an.wx); }
    if (a === 'turrets'){ let k = 0; AN.turrets.forEach((t, i)=>{ if (this.anTurAlive(i)) an.tq.push({ i, t:15 + k++*26, fired:false, charged:false }); }); if (!an.tq.length) an.atk = 'idle'; }
    if (a === 'bays') this.anSfx('anBayOpen', an.wx);
  },
  anOrb(x, y, ang, sc, dmg, spd){
    if (this._bLoad > BULLET_CAP) return null;
    const b = this.enemyBullets.create(x, y, 'anFxOrb', 0); b.setDepth(4); b.damage = dmg; b._aim = true; b.setOrigin(0.5, 94/128).setScale(sc).setRotation(ang - Math.PI/2).setBlendMode(Phaser.BlendModes.ADD);
    const r = 5.25/sc; b.body.setCircle(r, 32 - r, 94 - r); b.play('anOrb'); this.physics.velocityFromRotation(ang, spd*60*this.an.U, b.body.velocity); return b;
  },
  anUpdateAttack(){
    const an = this.an, U = an.U, pl = this.player, N = ['spokes', 'turrets', 'bays'];
    if (an.atk === 'idle'){ if (--an.idleT <= 0) this.anStartAtk(N[an.atIdx++ % 3]); return; }
    an.atT++;
    if (an.atk === 'spokes'){
      const [hx, hy] = this.anW(AN.hub[0], AN.hub[1]);
      if (an.atT === 80){ this.anSfx('anSpokesFire', an.wx); an.spokeA = Math.random()*6.28; }
      if (an.atT > 80 && an.atT < 280){
        an.spokeA += 0.012*(1 + an.st*0.15);
        if (pl && pl.active) for (let k = 0; k < 4; k++){ const a = an.spokeA + k*1.5708, dx = pl.x - hx, dy = pl.y - hy, al = dx*Math.cos(a) + dy*Math.sin(a), pp = Math.abs(-dx*Math.sin(a) + dy*Math.cos(a)); if (al > 20*U && pp < 13*U) this.damagePlayer(AN.dmg.beam); }
        if (an.atT % 4 === 0) this.cameras.main.shake(60, 0.002);
      }
      if (an.atT > 300){ an.atk = 'idle'; an.idleT = Math.round(90/[1, 1.15, 1.3, 1.5][an.st]); }
    } else if (an.atk === 'turrets'){
      an.tq.forEach(q=>{
        if (!q.charged && an.atT >= q.t){ q.charged = true; if (this.anTurAlive(q.i)){ this.anSfx('anTurretCharge', an.wx); } }
        if (!q.fired && an.atT >= q.t + 28){
          q.fired = true; if (!this.anTurAlive(q.i)) return;
          const [x, y] = this.anW(AN.turrets[q.i][0], AN.turrets[q.i][1]); this.anFx('anFxMuzzle', 'anMuzzle', x, y, 0.7); this.anSfx('anTurretShot', x);
          const a0 = Math.atan2(pl.y - y, pl.x - x); for (let k = -1; k <= 1; k++) this.anOrb(x, y, a0 + k*0.16, 0.42*U, AN.dmg.orb, 4.8);
        }
      });
      if (an.atT > 15 + an.tq.length*26 + 70){ an.atk = 'idle'; an.idleT = Math.round(80/[1, 1.15, 1.3, 1.5][an.st]); }
    } else if (an.atk === 'bays'){
      an.bayOpen = an.atT < 30 ? an.atT/30 : an.atT < 110 ? 1 : Math.max(0, 1 - (an.atT - 110)/30);
      if (an.atT === 40){ this.anSfx('anLaunch', an.wx); for (let i = 0; i < 2; i++) if (this.anBayAlive(i)) this.anLaunch(i); }
      if (an.atT === 112) this.anSfx('anBayClose', an.wx);
      if (an.atT > 150){ an.atk = 'idle'; an.bayOpen = 0; an.idleT = Math.round(90/[1, 1.15, 1.3, 1.5][an.st]); }
    }
  },
  anLaunch(i){        // un Éclaireur sort de la baie : il apparaît dans l'ouverture et plonge vers le bas
    const e = this.spawnOneEnemy('eclaireur', GAME_W/2); if (!e) return;
    const [x, y] = this.anW(i ? 467 : 45, 248), k = ENEMY_ART.eclaireur.scale;
    e.setPosition(x, y); e.baseX = x; e.stopY = y + Phaser.Math.Between(130, 220); e.body.velocity.y = 70; e.setAlpha(0.2).setScale(k*0.4); e.launched = true;
    this.tweens.add({ targets:e, alpha:1, scaleX:k, scaleY:k, duration:420, ease:'Quad.easeOut' });
    this.anFx('anFxMuzzle', 'anMuzzle', x, y, 0.55);
  },

  /* ---------- à chaque image ---------- */
  anUpdate(delta){
    const an = this.an; if (!an || an.dead) return;
    an.acc += Math.min(delta, 100); let n = 0;
    while (an.acc >= 16.667 && n++ < 6){ an.acc -= 16.667; this.anStep(); }
    this.anPlace(); this.anHits(); this.anLights(delta);
    an.flames.forEach(f=>{ const p = this.anW(f.a[0], f.a[1]); f.s.setPosition(p[0], p[1] + 6*an.U*1.6); });
    if (an.flash > 0){ an.base.setTintFill(0xffffff); an.ring.setTintFill(0xffffff); an.flash -= delta/33; if (an.flash <= 0) an.flash = 0; } else { an.base.clearTint(); an.ring.clearTint(); }
    const pl = this.player; if (pl && pl.active && an.mode === 'play'){ const [sx, sy] = this.anS(pl.x, pl.y); if (this.anSolid(sx, sy)) this.damagePlayer(AN.dmg.contact); }
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, an.hp/an.max*100) + '%';
  },
  anStep(){        // une image de 1/60 s, comme sur la page
    const an = this.an; an.f++; an.hitT = Math.max(0, an.hitT - 1);
    const spd = AN.spin[an.st]; let want = 0.03*spd; if (an.atk === 'spokes' && an.atT < 80) want += an.atT/80*0.05; an.rspeed += (want - an.rspeed)*0.05; an.ang += an.rspeed;
    if (an.mode === 'enter'){ an.enter += 0.012; this.cameras.main.shake(40, 0.002); if (an.enter >= 1){ an.mode = 'play'; this.cameras.main.shake(200, 0.006); } }
    if (an.mode === 'play' || an.mode === 'dying') an.t += (1/60)*(an.mode === 'dying' ? 0.5 : 1);
    if (an.mode === 'play'){
      this.anUpdateAttack();
      const ev = [0, 60, 34, 20][an.st]; if (ev && an.f % ev === 0){ const op = this.anPix(an.st).op, o = op[Phaser.Math.Between(0, op.length - 1)], [x, y] = this.anW(o[0], o[1]); this.anSmoke(x, y - 4, 1.0 + an.st*0.3); if (an.st >= 2) this.anSpark(x, y, 0.9); }
    }
    if (an.mode === 'dying'){
      an.dieT++;
      if (an.dieT % 5 === 0){ const [x, y] = this.anHullPoint(); this.anBoom(x, y, Phaser.Math.Between(120, 210), an.dieT % 15 === 0 ? 'anBoomSmall' : ''); this.anSpark(x, y, 1.2); this.anShards(an.st, 1, 6, 14, 1.2); }
      if (an.dieT % 4 === 0){ const [x, y] = this.anHullPoint(); const f = this.acFx('acFxFlame', 'acFlame', x, y + 8, 0.5*an.U, { loop:true, vy:-8 }); this.time.delayedCall(900, ()=>{ if (f && f.active) f.destroy(); }); this.anSmoke(x, y, 1.8); }
      if (an.dieT === 30) this.anSfx('anRoar', an.wx);
      if (an.dieT > 80) this.anDead();
    }
  },
  anLights(delta){        // jeu de lumières : rotor au moyeu, chenille sur l'anneau, comète sur la roue extérieure, tourelles et baies
    const an = this.an, U = an.U, S = an.S, vis = an.mode !== 'dead', [hx, hy] = this.anW(AN.hub[0], AN.hub[1]), f = an.f, st = an.st, ev = an.atk === 'spokes';
    an.rotAng += 0.06*(ev ? 1.4 : 1)*[1, 0.8, 0.5, 0.1][st]*delta/16.667*(an.mode === 'dying' ? 3 : 1);
    an.rotor.setPosition(hx, hy).setRotation(an.rotAng).setScale(104*U/256).setAlpha((st === 3 ? 0.3 : 0.75)).setVisible(vis);
    const nl = 12, rr = (AN.ring.r1 + 2)*S;
    an.chase.forEach((s, k)=>{ const a = -an.ang*1.7 + k*6.2832/nl, on = ((k + (f >> 3)) % 3 === 0), off = st === 3 && f % 50 > 8; s.setVisible(vis && !off).setPosition(hx + Math.cos(a)*rr, hy + Math.sin(a)*rr).setScale((on ? 0.42 : 0.2)*U).setAlpha(on ? 1 : 0.45); });
    an.comet.forEach((s, t)=>{ const a = f*0.045 - t*0.06, rc = 142*S, u = 1 - t/14; s.setVisible(vis).setPosition(hx + Math.cos(a)*rc, hy + Math.sin(a)*rc).setScale((0.5*u + 0.12)*U).setAlpha(u*0.9); });
    AN.turrets.forEach((t, i)=>{ const s = an.tg[i], alive = vis && an.mode !== 'dying' && this.anTurAlive(i), q = an.tq.find(z=> z.i === i), ch = q && !q.fired && an.atT >= q.t && an.atk === 'turrets';
      if (!alive){ s.setAlpha(0); return; } const [x, y] = this.anW(t[0], t[1]); s.setPosition(x, y); if (ch) s.setScale((0.4 + 0.5*Math.min(1, (an.atT - q.t)/28))*U).setAlpha(1); else if ((f + i*13) % 60 < 8) s.setScale(0.35*U).setAlpha(0.9); else s.setAlpha(0); });
    an.bayG.forEach((s, i)=>{ if (!vis || !this.anBayAlive(i)) { s.setAlpha(0); return; } const o = an.bayOpen, [x, y] = this.anW(i ? 467 : 45, 248); if (o > 0 && o < 1) s.setPosition(i ? x - 6 : x + 6, y).setScale((0.35 + o*0.6)*U).setAlpha(0.5 + 0.4*o); else if (o === 0 && f % 40 < 6) s.setPosition(x, y).setScale(0.3*U).setAlpha(0.7); else s.setAlpha(0); });
    an.strobe.forEach((s, i)=>{ const p = [[118, 252], [394, 252], [256, 60]][i]; const on = ev && an.atT > 80 && f % 6 < 3 && vis && an.mode === 'play'; s.setVisible(on); if (on){ const [x, y] = this.anW(p[0], p[1]); s.setPosition(x, y).setScale(0.5*U).setAlpha(0.8); } });
    // rayons : télégraphe fin pendant la charge, puis quatre faisceaux (large + cœur fin) qui tournent
    an.hubG.setPosition(hx, hy); const T = an.atT; let u = 0, mode = null;
    if (ev && an.mode === 'play'){ if (T < 80){ mode = 'charge'; u = T/80; } else if (T < 290){ mode = 'fire'; u = Math.min(1, (T - 80)/12, (290 - T)/16); } }
    if (mode === 'charge'){ an.hubG.setScale((2.2*u + 0.5)*U).setAlpha(0.6 + 0.4*u); if (T === 1 || T % 20 === 0) this.anFx('anFxCharge', 'anCharge', hx, hy, 1.1, { alpha:1 }); } else if (mode === 'fire') an.hubG.setScale(1.8*U).setAlpha(1); else an.hubG.setAlpha(0);
    an.beams.forEach((s, i)=>{ const k = i % 4, wide = i < 4;
      if (!mode){ s.setVisible(false); return; }
      const a = an.spokeA + k*1.5708; let len, wid, al;
      if (mode === 'charge'){ if (!wide){ s.setVisible(false); return; } len = 520*u*u*U; wid = (6 + u*10)*U; al = 0.25*u; } else { len = 640*U; wid = (wide ? 44 : 16)*U*u; al = wide ? 0.95 : 1; }
      s.setVisible(true).setPosition(hx, hy).setRotation(a - Math.PI/2).setScale(Math.max(0.01, wid/64), len/128).setAlpha(al); });
    this.anDoors();
  },
  anDoors(){        // deux volets blindés par baie, qui coulissent (l'un vers le haut, l'autre vers le bas) et découvrent l'intérieur sombre éclairé en violet
    const an = this.an, g = an.doors, o = an.bayOpen; g.clear(); if (an.mode === 'dead') return;
    AN.bays.forEach((b, i)=>{
      if (!this.anBayAlive(i)) return;
      const [x0, y0] = this.anW(AN.bayX[i], AN.bayY[0]), [x1, y1] = this.anW(AN.bayX[i] + AN.bayW, AN.bayY[1]), w = x1 - x0, h = y1 - y0, half = h/2, vis = Math.max(0, half - o*(half - 1));
      g.fillStyle(0x04060c, 1); g.fillRect(x0, y0, w, h);
      if (o > 0){ g.fillGradientStyle(i ? 0x7846dc : 0xc8a0ff, i ? 0xc8a0ff : 0x7846dc, i ? 0x7846dc : 0xc8a0ff, i ? 0xc8a0ff : 0x7846dc, 0.15 + 0.6*o); g.fillRect(x0, y0, w, h); g.fillStyle(0xffffff, 0.5*o); g.fillRect(x0 + w*0.3, y0 + h/2 - 2*o, w*0.4, 4*o); }
      [[y0, 1], [y1 - vis, -1]].forEach(([py, dir])=>{
        if (vis <= 0.5) return; g.fillStyle(0x8693a8, 1); g.fillRect(x0, py, w, vis); g.fillStyle(0x6a768b, 1); for (let k = 3; k < vis; k += 6) g.fillRect(x0, py + k, w, 1.5);
        g.fillStyle(0xaab6c8, 1); g.fillRect(x0, dir > 0 ? py : py + vis - 1.5, w, 1.5);
        const ey = dir > 0 ? py + vis - 4 : py; for (let k = 0; k < w; k += 6){ g.fillStyle((k/6 | 0) % 2 ? 0x1a1300 : 0xffc21a, 1); g.fillRect(x0 + k, ey, Math.min(3.5, w - k), 4); } });
    });
  },

  /* ---------- mort ---------- */
  anClearAttacks(){ const an = this.an; an.atk = 'idle'; an.bayOpen = 0; an.tq = []; },
  anDie(){
    const an = this.an; if (an.mode === 'dying' || an.dead) return;
    an.mode = 'dying'; an.dieT = 0; this.anClearAttacks(); this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    this.startSlowmo && this.startSlowmo(1500, 0.5); this.juiceStop && this.juiceStop('bossKill');
  },
  anDead(){        // l'anneau se détache et s'envole, chaque pièce part en un morceau, grosse explosion ; puis fin du niveau
    const an = this.an; if (an.dead) return; an.dead = true;
    const [cx, cy] = this.anW(AN.hub[0], AN.hub[1]);
    this.cameras.main.flash(600, 225, 215, 255, false); this.cameras.main.shake(900, 0.014);
    this.anBoom(cx, cy, 900, 'anBoomBig'); this.anBoom(cx, cy, 520, ''); this.anBoom(cx - 60, cy - 40, 380, ''); this.anBoom(cx + 60, cy + 40, 380, '');
    [0, 200, 400].forEach(d=> this.time.delayedCall(d, ()=> this.anFx('anFxShock', 'anShock', cx, cy, 2.4 + d/130)));
    this.anDeathPieces(); this.anShards(an.st, 20, 6, 20, 1.5);
    for (let k = 0; k < 24; k++) this.anSpark(cx + Phaser.Math.Between(-60, 60), cy + Phaser.Math.Between(-60, 60), Phaser.Math.FloatBetween(0.7, 1.4));
    [an.base, an.ring, an.rotor, an.doors, an.hubG].concat(an.chase, an.comet, an.tg, an.bayG, an.strobe, an.beams).forEach(o=>{ if (o) o.setVisible(false); }); an.flames.forEach(f=> f.s.destroy()); an.flames = [];
    this.time.delayedCall(300, ()=> this.anSfx('anLimb', cx));
    this.score += AN.killScore;
    this.time.delayedCall(2200, ()=>{ if (this.running) this.levelWin(); });
  },
});
