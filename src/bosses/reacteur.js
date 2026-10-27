"use strict";
// Méthodes de GameScene — boss « Le Réacteur » (boss de fin du niveau `w1-l3`, `finalBoss:'reacteur'` dans data/worlds/monde-1.js). Autonome comme l'Araignée et la Météo : son état est dans `this.rx`.
// Il IRRADIE : RAYONNEMENT (le cœur charge, des anneaux d'arcs s'étendent avec un passage aimé vers toi), BARRES (les trois capsules de la proue crachent des gouttes qui laissent des flaques de feu vert),
// ARROSEUR (les nacelles du bas balaient l'écran de jets toxiques). Il surchauffe quand il perd ses radiateurs : il enchaîne plus vite, le rotor tourne plus vite et toutes les lueurs virent du vert au jaune, à l'orange puis au rouge.
// La logique est celle de la page validée : elle tourne en « images » de 1/60 s et en unités de cette page (K = 1,5 px de page par px du sprite) ; `U` convertit les distances de la page en pixels du jeu.
const RX = {
  scale:0.62, K:1.5, OY:24, hp:1000, thresh:[70, 45, 20],
  core:[256, 262], critR:40,                                                          // cœur (point faible : coups critiques), dans le sprite 512
  caps:[{ id:'C0', x:232, y:440 }, { id:'C1', x:256, y:450 }, { id:'C2', x:281, y:440 }],            // bouches des capsules de la proue
  noz:[{ id:'NL', x:140, y:372, side:-1 }, { id:'NR', x:372, y:372, side:1 }],                      // nacelles du bas : sorties des jets
  rads:[{ x:75, y:112 }, { x:437, y:112 }],                                                          // radiateurs du haut : leur perte fait surchauffer
  tint:[[70, 255, 100], [215, 240, 60], [255, 175, 40], [255, 90, 30]],                              // couleur des lueurs par état
  rotorTex:['ltRotorToxic', 'ltRotorAmber', 'ltRotorFire', 'ltRotorHot'],
  seq:[['ray', 'rods', 'spray'], ['rods', 'ray', 'spray'], ['spray', 'ray', 'rods'], ['ray', 'rods', 'spray', 'rods']],
  count:{ ray:[1, 2, 2, 3], rods:[2, 3, 3, 4], spray:[150, 180, 210, 240] }, gap:[250, 215, 180, 150],        // anneaux / volées / durée du jet (images) ; pause entre attaques (images)
  speed:1.3,                                                                          // multiplicateur de vitesse des projectiles
  dmg:{ ring:16, glob:12, patch:9, stream:7, contact:14 }, killScore:900,
  regions:[(x, y)=> x < 150 && y < 200, (x, y)=> x > 362 && y < 200, (x, y)=> x < 130 && y >= 215 && y < 300, (x, y)=> x > 382 && y >= 215 && y < 300, (x, y)=> y > 372 && x > 205 && x < 305, (x, y)=> y < 150 && x > 215 && x < 300],
  anchors:{                                                                           // points d'accroche (sprite 512) de la fumée et du feu, par état d'usure 1..3
    1:[[113, 278], [279, 375], [249, 415], [128, 120], [138, 116], [92, 160], [114, 130], [90, 172]],
    2:[[282, 188], [427, 256], [179, 313], [154, 343], [124, 206], [134, 282], [378, 116], [164, 164], [422, 172]],
    3:[[247, 202], [304, 211], [140, 262], [186, 313], [132, 272], [200, 336], [134, 244], [164, 202], [304, 390]],
  },
  smokeEvery:[0, 520, 300, 190],
  names:['LE RÉACTEUR', 'LE RÉACTEUR', 'LE RÉACTEUR', 'LE RÉACTEUR'],
};

mixin(GameScene, {
  /* ---------- création ---------- */
  rxStart(){
    if (this.rx) return;
    const vy = this.visibleYRange(0), S = RX.scale, rx = this.rx = { st:0, hp:RX.hp, max:RX.hp, mode:'enter', t:0, enter:0, acc:0, f:0, atk:null, atkTimer:200, atkIdx:0, waves:[], globs:[], patches:[], y0:vy.min, S, U:S/RX.K, cx:GAME_W/2, jdy:0, flash:0, dead:false, flames:[], px:0, py:0, wx:0, wy:0, hitT:0, rotAng:0, rotBoost:0 };
    rx.sp = this.add.image(rx.cx, rx.y0 - 300, 'rxSheet', 0).setDepth(5).setScale(S);
    rx.rotor = this.add.image(0, 0, RX.rotorTex[0]).setDepth(5.6).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.9);
    rx.lights = this.blInit('reacteur', 5.6);
    rx.core = this.add.image(0, 0, 'lightDot').setDepth(5.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.28);
    this.rxPlace();
    const wrap = document.getElementById('boss-hp-wrap'), lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = RX.names[0]; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; } if (wrap) wrap.classList.add('show');
    this.rxSfx('rxRoar', GAME_W/2);
  },
  rxSfx(name, x){ try { sfx[name]({ pan:this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- géométrie : page <-> monde ---------- */
  rxPix(st){
    this._rxPixC = this._rxPixC || [];
    if (!this._rxPixC[st]){
      const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(this.textures.get('rxSheet').getSourceImage(), st*512, 0, 512, 512, 0, 0, 512, 512);
      const d = x.getImageData(0, 0, 512, 512).data, op = []; for (let y = 0; y < 512; y += 6) for (let xx = 0; xx < 512; xx += 6) if (d[(y*512 + xx)*4 + 3] > 200) op.push([xx, y]);
      this._rxPixC[st] = { d, op };
    }
    return this._rxPixC[st];
  },
  rxSolid(sx, sy){ const p = this.rxPix(this.rx.st).d; return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && p[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  rxPlace(){
    const rx = this.rx, U = rx.U, sway = Math.sin(rx.t*0.42)*(rx.st >= 3 ? 90 : 70);
    rx.px = rx.mode === 'enter' ? 0 : sway; rx.py = RX.OY + (rx.mode === 'enter' ? Math.pow(1 - Math.min(1, rx.enter), 3)*-640 : 0);
    rx.wx = rx.cx + rx.px*U; rx.wy = rx.y0 + (rx.py + 384)*U;
    rx.sp.setPosition(rx.wx, rx.wy + rx.jdy*rx.S);
  },
  rxW(sx, sy){ const rx = this.rx; return [rx.wx + (sx - 256)*rx.S, rx.wy + (sy - 256 + rx.jdy)*rx.S]; },        // coordonnées du sprite -> monde
  rxS(x, y){ const rx = this.rx; return [(x - rx.wx)/rx.S + 256, (y - rx.wy)/rx.S + 256 - rx.jdy]; },              // monde -> sprite
  rxCapAlive(c){ return this.rxSolid(c.x, c.y - 10); }, rxNozAlive(n){ return this.rxSolid(n.x, n.y - 8); }, rxRadAlive(r){ return this.rxSolid(r.x, r.y); },
  rxHeat(){ return 1 + RX.rads.filter(r=> !this.rxRadAlive(r)).length*0.22 + this.rx.st*0.12; },                  // surchauffe : plus il perd de radiateurs, plus il va vite
  rxHullPoint(st){ const op = this.rxPix(st === undefined ? this.rx.st : st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; return this.rxW(o[0], o[1]); },

  /* ---------- pièces découpées dans le sprite ---------- */
  rxPieceCanvas(st, cells, x0, y0, w, h){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.textures.get('rxSheet').getSourceImage();
    cells.forEach(([cx, cy])=> x.drawImage(src, st*512 + cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); return c;
  },
  rxThrow(c, wx, wy, o){       // une pièce qui retombe en tournant puis disparaît ; la texture est retirée à la fin
    const key = 'rxp_' + (this._rxN = (this._rxN || 0) + 1); this.textures.addCanvas(key, c);
    const s = this.add.image(wx, wy, key).setDepth(5).setScale(this.rx.S), life = o.life;
    this.tweens.add({ targets:s, x:wx + o.vx*life/1000, angle:o.spin, alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:wy + o.vy*life/1000 + o.fall, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
  },
  rxShard(st, sx, sy, r){
    const S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(this.textures.get('rxSheet').getSourceImage(), st*512 + sx - r, sy - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
    const m = document.createElement('canvas'); m.width = m.height = S2; const mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); const nv = Phaser.Math.Between(5, 7);
    for (let i = 0; i < nv; i++){ const a = i/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; i ? mx.lineTo(X, Y) : mx.moveTo(X, Y); } mx.fill();
    x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over'; return c;
  },
  rxShards(st, n, rMin, rMax, power){
    const rx = this.rx;
    for (let k = 0; k < n; k++){ const op = this.rxPix(st).op, o = op[Phaser.Math.Between(0, op.length - 1)], [wx, wy] = this.rxW(o[0], o[1]), r = Phaser.Math.Between(rMin, rMax);
      this.rxThrow(this.rxShard(st, o[0], o[1], r), wx, wy, { vx:(wx - rx.cx)*1.4*power + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(20, 90)*power, fall:150, spin:Phaser.Math.Between(-300, 300), life:Phaser.Math.Between(1100, 1800) }); }
  },
  rxBreakLimbs(from, to){        // une pièce arrachée part EN UN SEUL MORCEAU, avec sa vraie forme
    const rx = this.rx, a = this.rxPix(from).d, b = this.rxPix(to).d, N = 128, lost = new Uint8Array(N*N), lab = new Int16Array(N*N);
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
      const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, [wx, wy] = this.rxW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2), big = cells.length > 60;
      this.rxThrow(this.rxPieceCanvas(from, cc, x0, y0, w, h), wx, wy, { vx:(wx - rx.cx)*(big ? 0.9 : 1.4) + Phaser.Math.Between(-15, 15), vy:-Phaser.Math.Between(40, 160), fall:big ? 220 : 160, spin:Phaser.Math.Between(-360, 360), life:big ? Phaser.Math.Between(1800, 2400) : Phaser.Math.Between(1200, 1700) });
    });
  },
  rxDeathPieces(){      // chaque pièce restante s'envole en un seul morceau, à sa vraie forme
    const rx = this.rx, a = this.rxPix(rx.st).d, N = 128;
    RX.regions.forEach(test=>{
      const cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
      if (cells.length < 30) return;
      const [wx, wy] = this.rxW((x0 + x1 + 1)*2, (y0 + y1 + 1)*2);
      this.rxThrow(this.rxPieceCanvas(rx.st, cells, x0, y0, (x1 - x0 + 1)*4, (y1 - y0 + 1)*4), wx, wy, { vx:(wx - rx.cx)*1.6 + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(60, 200), fall:260, spin:Phaser.Math.Between(-420, 420), life:Phaser.Math.Between(2000, 2800) });
    });
  },

  /* ---------- effets ---------- */
  rxFx(key, anim, x, y, scale, o){       // effet vert additif qui joue une fois puis disparaît
    o = o || {}; const s = this.add.sprite(x, y, key).setDepth(o.depth || 8).setScale(scale).setBlendMode(Phaser.BlendModes.ADD); if (o.alpha) s.setAlpha(o.alpha); if (o.rot) s.setRotation(o.rot);
    s.play(anim); if (!o.loop) s.once('animationcomplete', ()=> s.destroy()); return s;
  },
  rxBoom(x, y, size, snd){      // explosion verte (toxique) ; size en pixels de PAGE comme sur la page validée
    const big = size > 360, k = size*this.rx.U;
    this.rxFx(big ? 'rxFxBoomL' : 'rxFxBoomM', big ? 'rxBoomL' : 'rxBoomM', x, y, k/(big ? 256 : 160)*1.15);
    if (size > 500) this.rxFx('rxFxShock', 'rxShock', x, y, k/190);
    if (snd) this.rxSfx(snd, x);
  },
  rxSmoke(x, y, sc){ this.acFx('acFxSmoke', 'acSmoke', x, y, sc*this.rx.U*1.6, { normal:true, vy:-24, alpha:0.85 }); },
  rxSpark(x, y, sc){ this.rxFx('rxFxSpark', 'rxSpark', x, y, sc*this.rx.U*2.2); },
  rxFlames(){        // feu accroché aux trous, à partir de l'état 2 : vert d'abord (fuite), orange en épave
    const rx = this.rx; rx.flames.forEach(f=> f.s.destroy()); rx.flames = [];
    if (rx.st < 2) return;
    const list = rx.st === 2 ? RX.anchors[2].slice(0, 5) : RX.anchors[3], sc = rx.st === 2 ? 0.62 : 0.9, key = rx.st === 2 ? 'rxFxFlame' : 'acFxFlame', an = rx.st === 2 ? 'rxFlame' : 'acFlame';
    list.forEach((a, i)=>{ const s = this.add.sprite(0, 0, key).setDepth(6).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale(sc*rx.U*1.1*(0.85 + (i % 3)*0.15)); s.play(an); s.anims.setProgress(((i*5) % 12)/12); rx.flames.push({ s, a }); });
  },

  /* ---------- dégâts reçus ---------- */
  rxStageOf(pct){ return pct > RX.thresh[0] ? 0 : pct > RX.thresh[1] ? 1 : pct > RX.thresh[2] ? 2 : 3; },
  rxDamage(x, y, d, crit){
    const rx = this.rx; if (rx.dead || rx.mode === 'dying') return;
    rx.hp = Math.max(0, rx.hp - d); if (rx.hitT <= 0 || crit){ rx.flash = crit ? 2 : 0.5; rx.hitT = 24; }
    this.rxFx('rxFxImpact', 'rxImpact', x, y, crit ? 0.9 : 0.55); this.rxSpark(x, y, crit ? 1.3 : 0.8); this.spawnHitParticles(x, y, crit ? 6 : 3);
    if (crit){ this.juiceShake(0.12); this.rxSfx('rxHitHeavy', x); } else this.rxSfx('rxHit', x);
    if (crit || Math.random() < 0.3){ const op = this.rxPix(rx.st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; const [wx, wy] = this.rxW(o[0], o[1]); this.rxThrow(this.rxShard(rx.st, o[0], o[1], Phaser.Math.Between(4, 7)), wx, wy, { vx:(wx - rx.cx)*1.1, vy:-Phaser.Math.Between(20, 80), fall:120, spin:Phaser.Math.Between(-300, 300), life:1000 }); }
    const ns = rx.hp <= 0 ? 3 : this.rxStageOf(rx.hp/rx.max*100);
    if (ns > rx.st) this.rxWound(ns);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, rx.hp/rx.max*100) + '%';
    if (rx.hp <= 0) this.rxDie();
  },
  rxWound(ns){
    const rx = this.rx, old = rx.st; rx.st = ns; rx.sp.setFrame(ns); rx.rotor.setTexture(RX.rotorTex[ns]); this.rxBreakLimbs(old, ns); this.rxFlames(); this.rxShards(old, 8, 5, 10, 1.2);
    this.cameras.main.shake(300, 0.012); this.juiceStop && this.juiceStop('bossPhase');
    for (let k = 0; k < 3; k++){ const [bx, by] = this.rxHullPoint(); this.rxBoom(bx, by, 200, k === 0 ? 'rxBoomSmall' : ''); }
    this.rxSfx('rxLimb', rx.wx);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + Math.min(3, ns);
  },
  rxHits(){        // tirs du joueur : un coup touche si le point est sur la coque (masque du sprite) ; le cœur donne un coup critique
    const rx = this.rx;
    const test = (list, missile)=>{
      list.children.iterate(b=>{
        if (!b || !b.active) return;
        const [sx, sy] = this.rxS(b.x, b.y); if (!this.rxSolid(sx, sy)) return;
        if (b._tH === rx) return;
        const keep = (b.pierceLeft || 0) > 0, crit = Math.hypot(sx - RX.core[0], sy - RX.core[1]) < RX.critR;
        if (missile) this.explodeFx(b.x, b.y, 50);
        this.rxDamage(b.x, b.y, (b.damage || (missile ? 20 : 10))*(crit ? 2.5 : 1), crit);
        if (keep){ b.pierceLeft--; b._tH = rx; } else if (b.active) b.destroy();
      });
    };
    test(this.playerBullets, false); test(this.missiles, true);
  },

  /* ---------- attaques ---------- */
  rxAvailable(type){ return type === 'ray' ? true : type === 'rods' ? RX.caps.some(c=> this.rxCapAlive(c)) : RX.noz.some(n=> this.rxNozAlive(n)); },
  rxStartAttack(){
    const rx = this.rx, seq = RX.seq[rx.st]; let type = null;
    for (let k = 0; k < seq.length; k++){ const c = seq[rx.atkIdx++ % seq.length]; if (this.rxAvailable(c)){ type = c; break; } }
    if (!type){ rx.atkTimer = 60; return; } rx.atk = { type, f:0, n:0 };
  },
  rxEndAttack(){ this.rx.atk = null; },
  rxUpdateAttack(){
    const rx = this.rx, U = rx.U; let atk = rx.atk;
    if (!atk){ if ((rx.atkTimer -= this.rxHeat()) <= 0) this.rxStartAttack(); return; }
    if (!this.rxAvailable(atk.type)){ this.rxEndAttack(); rx.atkTimer = 40; return; }
    atk.f++; const pl = this.player;
    if (atk.type === 'ray'){
      const total = RX.count.ray[rx.st], [cx, cy] = this.rxW(RX.core[0], RX.core[1]);
      if (atk.f === 1){ this.rxSfx('rxRayCharge', cx); this.rxFx('rxFxCharge', 'rxCharge', cx, cy, 1.9*U*1.8); }
      if (atk.f < 60) rx.rotBoost = Math.min(0.3, rx.rotBoost + 0.006);
      for (let i = 0; i < total; i++){
        if (atk.f === 60 + i*70){
          const gap = Math.atan2(pl.y - cy, pl.x - cx) + Phaser.Math.FloatBetween(-0.35, 0.35);
          rx.waves.push({ r:50, f:0, gap, gw:0.66 - rx.st*0.05, cx, cy, tiles:[] }); this.rxFx('rxFxMuzzle', 'rxMuzzle', cx, cy, 2.2*U*1.8); this.rxFx('rxFxShock', 'rxShock', cx, cy, 1.4*U*1.8); this.rxSfx('rxRayPulse', cx); this.cameras.main.shake(180, 0.008);
        }
      }
      if (atk.f >= 60 + (total - 1)*70 + 110){ this.rxEndAttack(); rx.atkTimer = RX.gap[rx.st]; }
    }
    atk = rx.atk;
    if (atk && atk.type === 'rods'){
      const caps = RX.caps.filter(c=> this.rxCapAlive(c)), total = RX.count.rods[rx.st], per = 64;
      if (atk.f === 1){ this.rxSfx('rxRodsCharge', rx.wx); caps.forEach(c=>{ const [x, y] = this.rxW(c.x, c.y); this.rxFx('rxFxCharge', 'rxCharge', x, y, 0.75*U*1.8); }); }
      for (let i = 0; i < total; i++){
        if (atk.f === 44 + i*per){
          this.rxSfx('rxRodsFire', rx.wx); const vy = this.visibleYRange(0);
          caps.forEach((c, k)=>{ const [x, y] = this.rxW(c.x, c.y), a = Math.atan2(pl.y - y, pl.x - x) + (k - (caps.length - 1)/2)*0.22, ty = Phaser.Math.Clamp(pl.y - 20, y + 90, vy.max - 40);
            this.rxFx('rxFxMuzzle', 'rxMuzzle', x, y + 3, 0.9*U*1.8); this.rxGlob(x, y + 4, a, ty); });
        }
      }
      if (atk.f >= 44 + (total - 1)*per + 110){ this.rxEndAttack(); rx.atkTimer = RX.gap[rx.st]; }
    }
    atk = rx.atk;
    if (atk && atk.type === 'spray'){
      const nz = RX.noz.filter(n=> this.rxNozAlive(n)), dur = RX.count.spray[rx.st], F0 = 40;
      if (atk.f === 1){ this.rxSfx('rxSprayCharge', rx.wx); nz.forEach(n=>{ const [x, y] = this.rxW(n.x, n.y); this.rxFx('rxFxCharge', 'rxCharge', x, y, 0.8*U*1.8); }); }
      if (atk.f === F0){ this.rxSfx('rxSpray', rx.wx); nz.forEach(n=>{ const [x, y] = this.rxW(n.x, n.y); this.rxFx('rxFxMuzzle', 'rxMuzzle', x, y + 3, 1.0*U*1.8); }); }
      if (atk.f >= F0 && atk.f < F0 + dur){
        if (atk.f % 4 === 0) nz.forEach(n=>{ const [x, y] = this.rxW(n.x, n.y), a = Phaser.Math.DegToRad(90 + Math.sin(atk.f*0.06 + (n.side < 0 ? 0 : Math.PI))*52); this.rxStream(x, y + 3, a); });
        if (atk.f % 40 === 0) this.rxSfx('rxSpray', rx.wx);
      }
      if (atk.f >= F0 + dur + 30){ this.rxEndAttack(); rx.atkTimer = RX.gap[rx.st]; }
    }
  },
  rxOrb(x, y, ang, sc, dmg, spd){
    if (this._bLoad > BULLET_CAP) return null;
    const b = this.enemyBullets.create(x, y, 'rxFxOrb', 0); b.setDepth(4); b.damage = dmg; b.setOrigin(0.5, 94/128).setScale(sc).setRotation(ang - Math.PI/2).setBlendMode(Phaser.BlendModes.ADD);
    const r = 5.25/sc; b.body.setCircle(r, 32 - r, 94 - r); b.play('rxOrb'); this.physics.velocityFromRotation(ang, spd*60*this.rx.U*RX.speed, b.body.velocity); return b;
  },
  rxGlob(x, y, ang, ty){ const b = this.rxOrb(x, y, ang, 0.45, RX.dmg.glob, 5.2); if (b) this.rx.globs.push({ o:b, ty }); },
  rxStream(x, y, ang){ this.rxOrb(x, y, ang, 0.3, RX.dmg.stream, 5.4); },
  rxLand(x, y){        // une goutte retombe : flaque de feu vert qui brûle quelques secondes
    const rx = this.rx, U = rx.U; this.rxFx('rxFxImpact', 'rxImpact', x, y, 1.2*U*1.8); this.rxSpark(x, y, 1.2); this.rxSfx('rxRodsLand', x); this.cameras.main.shake(90, 0.003);
    const q = { x, y, f:0, life:240, cd:0, flames:[] };
    for (let k = -1; k <= 1; k++){ const s = this.add.sprite(x + k*26, y + 8, 'rxFxFlame').setDepth(3.5).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale(1.0*U*1.8); s.play('rxFlame'); s.anims.setProgress(Math.random()); q.flames.push(s); }
    q.glow = this.add.sprite(x, y, 'rxFxGlow').setDepth(3.4).setBlendMode(Phaser.BlendModes.ADD).setScale(1.5*U*1.8).setAlpha(0.5); q.glow.play('rxGlow'); rx.patches.push(q); this.rxSfx('rxPatchBurn', x);
  },
  rxUpdateWaves(){
    const rx = this.rx, U = rx.U, pl = this.player;
    rx.waves.forEach(w=>{
      const R = w.r*U, n = Math.max(10, Math.round(6.283*w.r/86)), al = Math.min(1, w.f/6)*Math.max(0, 1 - Math.max(0, w.r - 600)/300);
      while (w.tiles.length < n){ const s = this.add.sprite(0, 0, 'rxFxArc').setDepth(7).setBlendMode(Phaser.BlendModes.ADD).setScale(0.8*U*1.4); s.play('rxArc'); s.anims.setProgress(Math.random()); w.tiles.push(s); }
      for (let k = 0; k < w.tiles.length; k++){
        const s = w.tiles[k]; if (k >= n){ s.setVisible(false); continue; }
        const a = k/n*6.283 + w.f*0.004; if (this.rxAngDiff(a, w.gap) < w.gw){ s.setVisible(false); continue; }
        s.setVisible(true).setPosition(w.cx + Math.cos(a)*R, w.cy + Math.sin(a)*R).setRotation(a + Math.PI/2).setAlpha(al*0.8);
      }
      if (pl && pl.active){ const dist = Math.hypot(pl.x - w.cx, pl.y - w.cy), ang = Math.atan2(pl.y - w.cy, pl.x - w.cx); if (Math.abs(dist - R) < 13 && this.rxAngDiff(ang, w.gap) > w.gw) this.damagePlayer(RX.dmg.ring); }
      if (w.r > 900 || R > 900){ w.dead = true; w.tiles.forEach(s=> s.destroy()); }
    });
    rx.waves = rx.waves.filter(w=> !w.dead);
  },
  rxAngDiff(a, b){ return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); },
  rxUpdateShots(){
    const rx = this.rx, pl = this.player;
    rx.globs = rx.globs.filter(g=>{ if (!g.o || !g.o.active) return false; if (g.o.y >= g.ty){ const x = g.o.x, y = g.o.y; g.o.destroy(); this.rxLand(x, y); return false; } if (Math.random() < 0.15) this.rxSpark(g.o.x, g.o.y, 0.35); return true; });
    rx.patches.forEach(q=>{
      if (q.f < q.life && pl && pl.active && Math.abs(pl.x - q.x) < 40 && Math.abs(pl.y - q.y) < 32) this.damagePlayer(RX.dmg.patch);
      if (q.f > q.life){ const a = Math.max(0, 1 - (q.f - q.life)/20); q.flames.forEach(s=> s.setAlpha(a)); q.glow.setAlpha(0.5*a); }
      if (q.f > q.life + 20){ q.dead = true; q.flames.forEach(s=> s.destroy()); q.glow.destroy(); }
    });
    rx.patches = rx.patches.filter(q=> !q.dead);
  },

  /* ---------- à chaque image ---------- */
  rxUpdate(delta){
    const rx = this.rx; if (!rx || rx.dead) return;
    rx.acc += Math.min(delta, 100); let n = 0;
    while (rx.acc >= 16.667 && n++ < 6){ rx.acc -= 16.667; this.rxStep(); }
    this.rxPlace(); this.rxHits(); this.rxUpdateWaves(); this.rxUpdateShots();
    rx.flames.forEach(f=>{ const p = this.rxW(f.a[0], f.a[1]); f.s.setPosition(p[0], p[1] + 6*rx.U*1.6); });
    // jeu de lumières : le rotor tourne au centre du cœur (plus vite en surchauffe), les voyants pulsent, tout vire avec l'état
    const col = RX.tint[rx.st], [cx, cy] = this.rxW(RX.core[0], RX.core[1]), spin = (0.035 + rx.st*0.012 + RX.rads.filter(r=> !this.rxRadAlive(r)).length*0.014 + rx.rotBoost)*(rx.mode === 'dying' ? 3 : 1);
    rx.rotAng += spin*delta/16.667; rx.rotBoost *= Math.pow(0.985, delta/16.667);
    rx.rotor.setPosition(cx, cy).setRotation(rx.rotAng).setScale(147*rx.S/256).setVisible(rx.mode !== 'dead');
    rx.core.setPosition(cx, cy).setScale(90*rx.S*2/64*(0.9 + 0.1*Math.sin(rx.f*0.07))).setTint(Phaser.Display.Color.GetColor(col[0], col[1], col[2])).setVisible(rx.mode !== 'dead');
    this.blUpdate(rx.lights, delta, { toWorld:(x, y)=> this.rxW(x, y), solid:(x, y)=> this.rxSolid(x, y), S:rx.S, visible:rx.mode !== 'dead', tint:col });
    if (rx.flash > 0){ rx.sp.setTintFill(0xffffff); rx.flash -= delta/33; if (rx.flash <= 0) rx.flash = 0; } else rx.sp.clearTint();
    const pl = this.player; if (pl && pl.active && rx.mode === 'play'){ const [sx, sy] = this.rxS(pl.x, pl.y); if (this.rxSolid(sx, sy)) this.damagePlayer(RX.dmg.contact); }
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, rx.hp/rx.max*100) + '%';
  },
  rxStep(){        // une image de 1/60 s, comme sur la page
    const rx = this.rx; rx.f++; rx.hitT = Math.max(0, rx.hitT - 1);
    rx.waves.forEach(w=>{ w.f++; w.r += 3.6*(1 + (this.rxHeat() - 1)*0.5); }); rx.patches.forEach(q=> q.f++);
    const ts = Math.floor(rx.t*10)/10; rx.jdy = Math.round(Math.sin(ts*1.9)*2);
    if (rx.mode === 'enter'){ rx.enter += 0.012; this.cameras.main.shake(40, 0.002); if (rx.enter >= 1){ rx.mode = 'play'; this.cameras.main.shake(200, 0.006); } }
    if (rx.mode === 'play' || rx.mode === 'dying') rx.t += (1/60)*(rx.mode === 'dying' ? 0.5 : 1);
    if (rx.mode === 'play'){
      this.rxUpdateAttack();
      const every = RX.smokeEvery[rx.st];
      if (every && rx.f % Math.round(every/16.7) === 0 && RX.anchors[rx.st]){ const a = Phaser.Utils.Array.GetRandom(RX.anchors[rx.st]), [x, y] = this.rxW(a[0], a[1]); this.rxSmoke(x, y - 6, 1.0 + rx.st*0.3); }
      if (rx.st >= 1 && rx.f % 50 === 0 && RX.anchors[rx.st]){ const a = Phaser.Utils.Array.GetRandom(RX.anchors[rx.st]), [x, y] = this.rxW(a[0], a[1]); this.rxFx('rxFxArc', 'rxArc1', x, y, 0.8*rx.U*1.8, { rot:Phaser.Math.FloatBetween(-0.5, 0.5) }); this.rxSpark(x, y, 0.9); }
    }
    if (rx.mode === 'dying'){
      rx.dieT = (rx.dieT || 0) + 1;
      if (rx.dieT % 6 === 0){ const [x, y] = this.rxHullPoint(); this.rxBoom(x, y, Phaser.Math.Between(150, 260), rx.dieT % 18 === 0 ? 'rxBoomSmall' : ''); this.rxSpark(x, y, 1.3); this.rxShards(rx.st, 1, 6, 14, 1.2); }
      if (rx.dieT % 7 === 0){ const [x, y] = this.rxHullPoint(); this.rxFx('rxFxArc', 'rxArc1', x, y, 1.2*rx.U*1.8, { rot:Phaser.Math.FloatBetween(-1.5, 1.5) }); }
      if (rx.dieT % 4 === 0){ const [x, y] = this.rxHullPoint(); const f = this.acFx('acFxFlame', 'acFlame', x, y + 8, 0.9*rx.U*1.1, { loop:true, vy:-8 }); this.time.delayedCall(900, ()=>{ if (f && f.active) f.destroy(); }); this.rxSmoke(x, y, 1.8); }
      if (rx.dieT > 110) this.rxDead();
    }
  },

  /* ---------- mort ---------- */
  rxClearAttacks(){
    const rx = this.rx; rx.atk = null; rx.waves.forEach(w=> w.tiles.forEach(s=> s.destroy())); rx.waves = []; rx.globs = [];
    rx.patches.forEach(q=>{ q.flames.forEach(s=> s.destroy()); q.glow.destroy(); }); rx.patches = [];
  },
  rxDie(){
    const rx = this.rx; if (rx.mode === 'dying' || rx.dead) return;
    rx.mode = 'dying'; rx.dieT = 0; this.rxClearAttacks(); this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    this.startSlowmo && this.startSlowmo(1500, 0.5); this.juiceStop && this.juiceStop('bossKill'); this.rxSfx('rxRoar', rx.wx);
  },
  rxDead(){        // fusion du cœur : grosse explosion verte, anneaux de choc, chaque pièce en un morceau ; puis fin du niveau
    const rx = this.rx; if (rx.dead) return; rx.dead = true;
    const [cx, cy] = this.rxW(RX.core[0], RX.core[1]);
    this.cameras.main.flash(600, 210, 255, 220, false); this.cameras.main.shake(900, 0.014);
    this.rxBoom(cx, cy, 900, 'rxBoomBig'); this.rxBoom(cx, cy, 520, ''); this.rxBoom(cx - 60, cy - 40, 380, ''); this.rxBoom(cx + 60, cy + 40, 380, '');
    [0, 200, 400].forEach(d=> this.time.delayedCall(d, ()=> this.rxFx('rxFxShock', 'rxShock', cx, cy, (2.4 + d/130)*rx.U*1.8)));
    this.rxDeathPieces(); this.rxShards(rx.st, 20, 6, 20, 1.5);
    for (let k = 0; k < 24; k++) this.rxSpark(cx + Phaser.Math.Between(-60, 60), cy + Phaser.Math.Between(-60, 60), Phaser.Math.FloatBetween(0.7, 1.4));
    this.blDestroy(rx.lights); rx.rotor.destroy(); rx.core.destroy(); rx.sp.setVisible(false); rx.flames.forEach(f=> f.s.destroy()); rx.flames = [];
    this.time.delayedCall(300, ()=> this.rxSfx('rxLimb', cx));
    this.score += RX.killScore;
    this.time.delayedCall(2200, ()=>{ if (this.running) this.levelWin(); });
  },
});
