"use strict";
// Méthodes de GameScene — boss final « Le PDG dans sa tour » (boss de fin du niveau `w1-l5`, `finalBoss:'pdg'` dans data/worlds/monde-1.js). Autonome comme les autres boss de fin : son état est dans `this.pd`.
// Il a quatre attaques en boucle : LICENCIEMENTS (les deux canons tirent des salves de pièces d'or visées), RESTRUCTURATION (le logo doré lâche un anneau de pièces avec un passage tourné vers toi), RAYONS SOLAIRES (les ailes balaient l'écran en croix ;
// une aile arrachée ne tire plus) et VIGILES : jusqu'à 3 vaisseaux « Le PDG » viennent se placer devant la tour ; chacun, détruit, explose en débris (pièces d'or, contrats, coque) et lâche un AGENT DE SÉCURITÉ qui s'interpose bras écartés,
// gelé par le vide (givre, puis glace, puis fissures) : il encaisse les tirs à la place du boss et se brise en éclats de glace. Tant qu'un vaisseau ou un agent est devant, il arrête tes tirs.
// La logique est celle de la page validée : elle tourne en « images » de 1/60 s et en unités de cette page (échelle de la page = 0,56) ; `U` convertit les distances de la page en pixels du jeu.
const PD = {
  scale:0.56, pageS:0.56, hp:1200, thresh:[70, 45, 20], critR:34,
  gun:[[190, 225], [322, 225]], wing:[[90, 345], [425, 345]], logo:[256, 160], flame:[[200, 448], [314, 450]], tower:[[192, 88], [322, 88]], cockpit:[256, 112],
  mob:{ scale:0.24, hp:160, states:[0.7, 0.4, 0.15], flame:[[165, 440], [350, 440]] },                         // vaisseau « Le PDG » (échelle de la page)
  guard:{ scale:0.165, hp:220, crack:0.4 },                                                                      // agent de sécurité
  slotX:[0, -82, 82],
  dmg:{ orb:11, beam:16, contact:14 }, killScore:1500,
  regionsB:[(x, y)=> x < 175 && y > 200, (x, y)=> x > 340 && y > 200, (x, y)=> x >= 175 && x <= 340 && y < 180, (x, y)=> x >= 175 && x <= 340 && y >= 180 && y < 340, (x, y)=> x >= 175 && x <= 340 && y >= 340],
  regionsM:[(x, y)=> x < 140, (x, y)=> x > 372, (x, y)=> x >= 140 && x <= 372 && y < 230, (x, y)=> x >= 140 && x <= 372 && y >= 230],
  regionsG:[(x, y)=> y < 190, (x, y)=> y >= 190 && x < 256, (x, y)=> y >= 190 && x >= 256, (x, y)=> x < 130 && y >= 120 && y < 260, (x, y)=> x > 380 && y >= 120 && y < 260, (x, y)=> y < 120 && x > 150 && x < 360, (x, y)=> y >= 330],
  names:['LE PDG', 'LE PDG', 'LE PDG', 'LE PDG'],
};
const PD_SHEET = { b:'pdSheet', m:'pgSheet', g:'gdSheet' };

mixin(GameScene, {
  /* ---------- création ---------- */
  pdStart(){
    if (this.pd) return;
    const vy = this.visibleYRange(0), S = PD.scale, U = S/PD.pageS;
    const pd = this.pd = { st:0, hp:PD.hp, max:PD.hp, mode:'enter', t:0, enter:0, acc:0, f:0, y0:vy.min, S, U, cx:GAME_W/2, wx:GAME_W/2, wy:vy.min, flash:0, dead:false, dieT:0, atk:'idle', atT:0, idleT:70, atIdx:0, tq:[], ships:[], guards:[], flames:[], hitT:0 };
    pd.sp = this.add.image(pd.cx, pd.y0, 'pdSheet', 0).setDepth(5).setScale(S);
    const glow = (d, a, tint)=>{ const s = this.add.sprite(0, 0, 'pdFxGlow').setDepth(d).setBlendMode(Phaser.BlendModes.ADD).setAlpha(a); if (tint) s.setTint(tint); s.play('pdGlow'); s.anims.setProgress(Math.random()); return s; };
    pd.logoG = glow(5.6, 0.5); pd.wingL = [0, 1].map(()=> Array.from({ length:6 }, ()=> glow(5.6, 0))); pd.towerG = PD.tower.map(()=> glow(5.7, 0)); pd.gunG = PD.gun.map(()=> glow(5.7, 0)); pd.wingG = [0, 1].map(()=> glow(5.7, 0));
    pd.thr = PD.flame.map(()=> { const s = this.add.sprite(0, 0, 'pdFxFlame').setDepth(5.4).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD); s.play('pdFlame'); return s; });
    pd.beams = Array.from({ length:4 }, ()=> { const s = this.add.sprite(0, 0, 'pdFxBeam').setDepth(5.3).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setVisible(false); s.play('pdBeam'); return s; });
    this.pdPlace();
    const lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
    if (lab) lab.textContent = PD.names[0]; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; }      // la jauge n'apparaît qu'une fois le boss en position de combat (mode 'play')
    this.pdSfx('pdRoar', GAME_W/2);
  },
  pdSfx(name, x){ try { sfx[name]({ pan:this.panOf(x) }); } catch(e){ /* ignore */ } },

  /* ---------- planches, masques, géométrie ---------- */
  pdSrc(k, st){ this._pdSrcC = this._pdSrcC || {}; const key = k + st; if (!this._pdSrcC[key]){ const c = document.createElement('canvas'); c.width = c.height = 512; c.getContext('2d', { willReadFrequently:true }).drawImage(this.textures.get(PD_SHEET[k]).getSourceImage(), st*512, 0, 512, 512, 0, 0, 512, 512); this._pdSrcC[key] = c; } return this._pdSrcC[key]; },
  pdPix(k, st){ this._pdPixC = this._pdPixC || {}; const key = k + st; if (!this._pdPixC[key]){ const d = this.pdSrc(k, st).getContext('2d').getImageData(0, 0, 512, 512).data, op = []; for (let y = 0; y < 512; y += 6) for (let x = 0; x < 512; x += 6) if (d[(y*512 + x)*4 + 3] > 200) op.push([x, y]); this._pdPixC[key] = { d, op }; } return this._pdPixC[key]; },
  pdSolidK(k, st, sx, sy){ const p = this.pdPix(k, st).d; return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && p[((sy | 0)*512 + (sx | 0))*4 + 3] > 128; },
  pdBsol(sx, sy){ return this.pdSolidK('b', this.pd.st, sx, sy); },
  pdPlace(){
    const pd = this.pd, U = pd.U, sway = Math.sin(pd.t*0.54)*30*U;
    pd.wx = pd.cx + (pd.mode === 'enter' ? 0 : sway); pd.wy = pd.y0 + 160 + (pd.mode === 'enter' ? Math.pow(1 - Math.min(1, pd.enter), 3)*-440 : 0);
    pd.sp.setPosition(pd.wx, pd.wy);
  },
  pdW(sx, sy){ const pd = this.pd; return [pd.wx + (sx - 256)*pd.S, pd.wy + (sy - 256)*pd.S]; },
  pdS(x, y){ const pd = this.pd; return [(x - pd.wx)/pd.S + 256, (y - pd.wy)/pd.S + 256]; },
  pdSlotX(i){ return this.pd.wx + PD.slotX[i]*this.pd.U; },
  pdSlotY(i){ const pd = this.pd; return pd.wy + (498 - 256)*pd.S + (54 + (i ? 8 : 0))*pd.U; },
  pdTaken(i){ const pd = this.pd; return pd.ships.some(e=> e.slot === i) || pd.guards.some(e=> e.slot === i); },
  pdHullPoint(){ const op = this.pdPix('b', this.pd.st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; return this.pdW(o[0], o[1]); },
  pdWingOn(i){ return this.pd.st < 3 && this.pdBsol(PD.wing[i][0] + (i ? -40 : 40), PD.wing[i][1]); },

  /* ---------- pièces découpées dans les sprites (k : 'b' boss, 'm' vaisseau, 'g' agent ; S = échelle d'affichage) ---------- */
  pdPiece(k, st, cells, x0, y0, w, h){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const src = this.pdSrc(k, st);
    cells.forEach(([cx, cy])=> x.drawImage(src, cx*4, cy*4, 4, 4, (cx - x0)*4, (cy - y0)*4, 4, 4)); return c;
  },
  pdThrow(c, wx, wy, S, o){       // une pièce qui retombe en tournant puis disparaît ; la texture est retirée à la fin
    const key = 'pdp_' + (this._pdN = (this._pdN || 0) + 1); this.textures.addCanvas(key, c);
    const s = this.add.image(wx, wy, key).setDepth(5.5).setScale(S), life = o.life;
    this.tweens.add({ targets:s, x:wx + o.vx*life/1000, angle:o.spin, alpha:0, duration:life, ease:'Quad.easeIn' });
    this.tweens.add({ targets:s, y:wy + o.vy*life/1000 + o.fall, duration:life, ease:'Quad.easeIn', onComplete:()=>{ s.destroy(); this.textures.remove(key); } });
  },
  pdShard(k, st, sx, sy, r){
    const S2 = 2*r + 8, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(this.pdSrc(k, st), sx - r, sy - r, 2*r, 2*r, 4, 4, 2*r, 2*r);
    const m = document.createElement('canvas'); m.width = m.height = S2; const mx = m.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); const nv = Phaser.Math.Between(5, 7);
    for (let i = 0; i < nv; i++){ const a = i/nv*6.283 + Phaser.Math.FloatBetween(-0.3, 0.3), rr = r*Phaser.Math.FloatBetween(0.55, 1); const X = S2/2 + Math.cos(a)*rr, Y = S2/2 + Math.sin(a)*rr; i ? mx.lineTo(X, Y) : mx.moveTo(X, Y); } mx.fill();
    x.globalCompositeOperation = 'destination-in'; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-over'; return c;
  },
  pdShards(k, st, n, rMin, rMax, power, ex, ey, S){
    for (let i = 0; i < n; i++){ const op = this.pdPix(k, st).op, o = op[Phaser.Math.Between(0, op.length - 1)], wx = ex + (o[0] - 256)*S, wy = ey + (o[1] - 256)*S, r = Phaser.Math.Between(rMin, rMax);
      this.pdThrow(this.pdShard(k, st, o[0], o[1], r), wx, wy, S, { vx:(wx - ex)*1.4*power + Phaser.Math.Between(-20, 20), vy:-Phaser.Math.Between(20, 90)*power, fall:150, spin:Phaser.Math.Between(-300, 300), life:Phaser.Math.Between(1100, 1800) }); }
  },
  pdBreakLimbs(k, from, to, ex, ey, S, snd){        // une pièce arrachée part EN UN SEUL MORCEAU, avec sa vraie forme
    const a = this.pdPix(k, from).d, b = this.pdPix(k, to).d, N = 128, lost = new Uint8Array(N*N), lab = new Int16Array(N*N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){ const i = ((y*4 + 2)*512 + (x*4 + 2))*4; lost[y*N + x] = a[i + 3] > 128 && b[i + 3] < 128 ? 1 : 0; }
    let n = 0; const comps = [];
    for (let s = 0; s < N*N; s++){
      if (!lost[s] || lab[s]) continue; n++; const q = [s], cells = []; lab[s] = n;
      while (q.length){ const c = q.pop(); cells.push(c); const cx = c % N, cy = (c/N) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy])=>{ const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) return; const kk = ny*N + nx; if (lost[kk] && !lab[kk]){ lab[kk] = n; q.push(kk); } }); }
      comps.push(cells);
    }
    comps.sort((p, q)=> q.length - p.length);
    comps.slice(0, 6).forEach(cells=>{
      if (cells.length < 6) return;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const cc = cells.map(c=>[c % N, (c/N) | 0]); cc.forEach(([cx, cy])=>{ x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); });
      const w = (x1 - x0 + 1)*4, h = (y1 - y0 + 1)*4, wx = ex + ((x0 + x1 + 1)*2 - 256)*S, wy = ey + ((y0 + y1 + 1)*2 - 256)*S, big = cells.length > 60;
      if (snd) this.pdSfx(snd, wx);
      this.pdThrow(this.pdPiece(k, from, cc, x0, y0, w, h), wx, wy, S, { vx:(wx - ex)*(big ? 0.9 : 1.4) + Phaser.Math.Between(-15, 15), vy:-Phaser.Math.Between(40, 160), fall:big ? 220 : 160, spin:Phaser.Math.Between(-360, 360), life:big ? Phaser.Math.Between(1800, 2400) : Phaser.Math.Between(1200, 1700) });
    });
  },
  pdDeathPieces(k, st, ex, ey, S, regions, power){      // chaque pièce restante s'envole en un seul morceau, à sa vraie forme
    const a = this.pdPix(k, st).d, N = 128; power = power || 1;
    regions.forEach(test=>{
      const cells = []; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let cy = 0; cy < N; cy++) for (let cx = 0; cx < N; cx++){ const X = cx*4 + 2, Y = cy*4 + 2; if (a[(Y*512 + X)*4 + 3] > 128 && test(X, Y)){ cells.push([cx, cy]); x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy); } }
      if (cells.length < 30) return;
      const wx = ex + ((x0 + x1 + 1)*2 - 256)*S, wy = ey + ((y0 + y1 + 1)*2 - 256)*S;
      this.pdThrow(this.pdPiece(k, st, cells, x0, y0, (x1 - x0 + 1)*4, (y1 - y0 + 1)*4), wx, wy, S, { vx:((wx - ex)*1.6 + Phaser.Math.Between(-20, 20))*power, vy:-Phaser.Math.Between(60, 200)*power, fall:260, spin:Phaser.Math.Between(-420, 420), life:Phaser.Math.Between(2000, 2800) });
    });
  },
  // débris « de bureau » : pièces d'or qui retombent, contrats qui flottent, cristaux de glace
  pdLitter(x, y, n, kind, power){
    power = power || 1; const U = this.pd.U;
    for (let k = 0; k < n; k++){
      const paper = kind === 'paper', ice = kind === 'ice', w = (paper ? Phaser.Math.FloatBetween(7, 11) : Phaser.Math.FloatBetween(2, 4))*U, h = (paper ? Phaser.Math.FloatBetween(9, 14) : Phaser.Math.FloatBetween(3, 6))*U;
      const col = ice ? Phaser.Utils.Array.GetRandom([0xd8f4ff, 0x9fdcff, 0xffffff]) : paper ? Phaser.Utils.Array.GetRandom([0xf3f1e6, 0xe6e3d2, 0xffffff]) : Phaser.Utils.Array.GetRandom([0xffc21a, 0xfff0a0, 0xd49a10]);
      const r = this.add.rectangle(x + Phaser.Math.Between(-14, 14), y + Phaser.Math.Between(-14, 14), w, h, col).setDepth(7.5).setAngle(Phaser.Math.Between(0, 360)); if (!ice && !paper) r.setBlendMode(Phaser.BlendModes.NORMAL);
      const life = Phaser.Math.Between(900, paper ? 2800 : 1900), vx = Phaser.Math.FloatBetween(-3.2, 3.2)*power*60*U, vy = Phaser.Math.FloatBetween(-6, -0.5)*power*60*U;
      this.tweens.add({ targets:r, x:r.x + vx*life/1000, angle:r.angle + Phaser.Math.Between(-360, 360), alpha:0, duration:life, ease:'Quad.easeIn' });
      this.tweens.add({ targets:r, y:r.y + vy*life/1000*0.5 + (paper ? 70 : 140)*U, duration:life, ease:paper ? 'Sine.easeOut' : 'Quad.easeIn', onComplete:()=> r.destroy() });
    }
  },

  /* ---------- effets ---------- */
  pdFx(key, anim, x, y, scale, o){       // effet additif qui joue une fois puis disparaît ; `scale` comme sur la page (multiplié par U)
    o = o || {}; const s = this.add.sprite(x, y, key).setDepth(o.depth || 8).setScale(scale*this.pd.U).setBlendMode(Phaser.BlendModes.ADD); if (o.alpha) s.setAlpha(o.alpha); if (o.rot) s.setRotation(o.rot);
    s.play(anim); if (!o.loop) s.once('animationcomplete', ()=> s.destroy()); return s;
  },
  pdBoom(x, y, size, snd){      // explosion dorée ; size en pixels de PAGE
    const big = size > 360, k = size*this.pd.U;
    this.pdFx(big ? 'pdFxBoomL' : 'pdFxBoomM', big ? 'pdBoomL' : 'pdBoomM', x, y, k/(big ? 256 : 160)/this.pd.U);
    if (size > 500) this.pdFx('pdFxShock', 'pdShock', x, y, size/190);
    if (snd) this.pdSfx(snd, x);
  },
  pdSmoke(x, y, sc){ this.acFx('acFxSmoke', 'acSmoke', x, y, sc*this.pd.U*1.6, { normal:true, vy:-24, alpha:0.85 }); },
  pdSpark(x, y, sc){ this.pdFx('pdFxSpark', 'pdSpark', x, y, sc*2.2); },
  pdFlames(){        // feu accroché aux trous, à partir de l'état 2
    const pd = this.pd; pd.flames.forEach(f=> f.s.destroy()); pd.flames = []; if (pd.st < 2) return;
    [[190, 300], [330, 300], [256, 210]].forEach((a, i)=>{ const s = this.add.sprite(0, 0, 'acFxFlame').setDepth(6).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale((0.3 + 0.05*pd.st)*pd.U*1.1*(0.85 + (i % 3)*0.15)); s.play('acFlame'); s.anims.setProgress(((i*5) % 12)/12); pd.flames.push({ s, a }); });
  },

  /* ---------- dégâts reçus ---------- */
  pdStageOf(pct){ return pct > PD.thresh[0] ? 0 : pct > PD.thresh[1] ? 1 : pct > PD.thresh[2] ? 2 : 3; },
  pdDamage(x, y, d, crit){
    const pd = this.pd; if (pd.dead || pd.mode === 'dying') return;
    if (pd.hitT <= 0 || crit){ pd.flash = crit ? 2 : 0.5; pd.hitT = 24; }
    this.pdFx('pdFxImpact', 'pdImpact', x, y, crit ? 0.9 : 0.55); this.pdSpark(x, y, crit ? 1.3 : 0.8); this.spawnHitParticles(x, y, crit ? 6 : 3);
    if (crit){ this.juiceShake(0.12); this.pdSfx('pdHitHeavy', x); } else this.pdSfx('pdHit', x);
    if (pd.mode === 'enter') return;      // en approche : dégâts visuels seulement (la jauge n'est pas encore affichée), pas de vraie perte de PV
    pd.hp = Math.max(0, pd.hp - d);
    if (crit || Math.random() < 0.3){ const op = this.pdPix('b', pd.st).op, o = op[Phaser.Math.Between(0, op.length - 1)]; const [wx, wy] = this.pdW(o[0], o[1]); this.pdThrow(this.pdShard('b', pd.st, o[0], o[1], Phaser.Math.Between(4, 7)), wx, wy, pd.S, { vx:(wx - pd.wx)*1.1, vy:-Phaser.Math.Between(20, 80), fall:120, spin:Phaser.Math.Between(-300, 300), life:1000 }); }
    const ns = pd.hp <= 0 ? 3 : this.pdStageOf(pd.hp/pd.max*100);
    if (ns > pd.st) this.pdWound(ns);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, pd.hp/pd.max*100) + '%';
    if (pd.hp <= 0) this.pdDie();
  },
  pdWound(ns){
    const pd = this.pd, old = pd.st; pd.st = ns; pd.sp.setFrame(ns); this.pdBreakLimbs('b', old, ns, pd.wx, pd.wy, pd.S, 'pdLimb'); this.pdFlames(); this.pdShards('b', old, 8, 5, 10, 1.2, pd.wx, pd.wy, pd.S);
    this.cameras.main.shake(300, 0.012); this.juiceStop && this.juiceStop('bossPhase');
    for (let k = 0; k < 3; k++){ const [bx, by] = this.pdHullPoint(); this.pdBoom(bx, by, 200, k === 0 ? 'pdBoomSmall' : ''); }
    this.pdLitter(pd.wx, pd.wy, 14, 'coin', 1.3);
    const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + Math.min(3, ns);
  },
  pdHits(){        // tirs du joueur : l'agent gelé, puis les vaisseaux de protection, puis la tour (le cockpit du PDG donne un coup critique)
    const pd = this.pd, S = pd.S;
    const test = (list, missile)=>{
      list.children.iterate(b=>{
        if (!b || !b.active) return;
        let hit = false;
        for (const e of pd.guards){ if (e.mode === 'dead' || e.mode === 'dash') continue; const [sx, sy] = [(b.x - e.x)/e.scale + 256, (b.y - e.y)/e.scale + 256]; if (this.pdSolidK('g', e.st, sx, sy)){ this.pdHurtGuard(e, b.x, b.y, (b.damage || (missile ? 20 : 10))*(missile ? 1 : 1)); hit = true; break; } }
        if (!hit) for (const e of pd.ships){ if (e.mode === 'dead' || e.t < 0) continue; const [sx, sy] = [(b.x - e.x)/e.scale + 256, (b.y - e.y)/e.scale + 256]; if (this.pdSolidK('m', e.st, sx, sy)){ this.pdHurtShip(e, b.x, b.y, (b.damage || (missile ? 20 : 10))); hit = true; break; } }
        if (hit){ if (missile) this.explodeFx(b.x, b.y, 50); if (b.active) b.destroy(); return; }
        const [sx, sy] = this.pdS(b.x, b.y); if (!this.pdBsol(sx, sy) || pd.mode !== 'play') return;
        if (b._tH === pd) return;
        const keep = (b.pierceLeft || 0) > 0, crit = Math.hypot(sx - PD.cockpit[0], sy - PD.cockpit[1]) < PD.critR;
        if (missile) this.explodeFx(b.x, b.y, 50);
        this.pdDamage(b.x, b.y, (b.damage || (missile ? 20 : 10))*(crit ? 2.5 : 1), crit);
        if (keep){ b.pierceLeft--; b._tH = pd; } else if (b.active) b.destroy();
      });
    };
    test(this.playerBullets, false); test(this.missiles, true);
  },

  /* ---------- vaisseaux de protection et agents de sécurité ---------- */
  pdSummonShips(n){
    const pd = this.pd; let made = 0, k = 0;
    for (let i = 0; i < 3 && made < n; i++){
      if (this.pdTaken(i)) continue; k = made++; const sc = PD.mob.scale*pd.U;
      const spr = this.add.sprite(pd.wx + (i === 1 ? -150 : i === 2 ? 150 : 0), pd.y0 - 20 - k*18, 'pgSheet', 0).setDepth(5.2).setScale(sc).setAlpha(0);
      const fl = PD.mob.flame.map(()=> { const s = this.add.sprite(0, 0, 'pdFxFlame').setDepth(5.1).setOrigin(0.5, 0.93).setBlendMode(Phaser.BlendModes.ADD).setScale(0.45*pd.U); s.play('pdFlame'); return s; });
      pd.ships.push({ slot:i, spr, fl, x:spr.x, y:spr.y, scale:sc, hp:PD.mob.hp, max:PD.mob.hp, st:0, mode:'in', t:-k*22, flash:0 });
    }
    if (made){ this.pdSfx('pdSummon', pd.wx); this.pdSfx('pgArrive', pd.wx); }
    return made;
  },
  pdHurtShip(e, x, y, d){
    if (e.mode === 'dead') return; const pd = this.pd; e.hp -= d; e.flash = 2; this.pdSpark(x, y, 0.8); this.pdFx('pdFxImpact', 'pdImpact', x, y, 0.6); this.pdSfx('pgHit', x); this.pdLitter(x, y, 2, 'coin', 0.7);
    const f = e.hp/e.max, ns = e.hp <= 0 ? 3 : f > PD.mob.states[0] ? 0 : f > PD.mob.states[1] ? 1 : f > PD.mob.states[2] ? 2 : 3;
    if (ns > e.st && ns < 3){ const old = e.st; e.st = ns; e.spr.setFrame(ns); this.pdBreakLimbs('m', old, ns, e.x, e.y, e.scale, 'pgBreak'); this.cameras.main.shake(100, 0.004); this.pdLitter(e.x, e.y, 8, 'coin', 1.2); }
    if (e.hp <= 0) this.pdShipDie(e);
  },
  pdShipDie(e){        // le vaisseau explose en débris (pièces, contrats, morceaux de coque) ; l'agent de sécurité en jaillit
    const pd = this.pd; e.mode = 'dead'; const x = e.x, y = e.y, sc = e.scale;
    this.pdBoom(x, y, 330, 'pgBoom'); this.pdDeathPieces('m', e.st, x, y, sc, PD.regionsM, 1.1); this.pdShards('m', e.st, 16, 5, 14, 1.4, x, y, sc); this.cameras.main.shake(220, 0.01);
    this.pdLitter(x, y, 26, 'coin', 1.5); this.pdLitter(x, y, 14, 'paper', 1); for (let k = 0; k < 8; k++) this.pdSpark(x + Phaser.Math.Between(-40, 40), y + Phaser.Math.Between(-30, 30), Phaser.Math.FloatBetween(0.8, 1.4));
    { const fl = this.pdFx('pdFxFlame', 'pdFlame', x, y + 10, 0.6, { loop:true }); this.time.delayedCall(1100, ()=>{ if (fl && fl.active) fl.destroy(); }); }       // flamme d'épave qui s'éteint (animation en boucle : à retirer à la main)
    const gs = PD.guard.scale*pd.U, spr = this.add.sprite(x, y - 14*pd.U, 'gdSheet', 0).setDepth(5.3).setScale(0.07*pd.U).setAlpha(0);
    pd.guards.push({ slot:e.slot, spr, x, y:y - 14*pd.U, scale:0.07*pd.U, goal:gs, hp:PD.guard.hp, max:PD.guard.hp, st:0, mode:'dash', t:0, flash:0, cr:0, crystals:[] });
    this.pdSfx('gdDash', x); this.pdSfx('pdCoins', x);
    this.pdKillShipObj(e);
  },
  pdKillShipObj(e){ const pd = this.pd; e.spr.destroy(); e.fl.forEach(s=> s.destroy()); pd.ships = pd.ships.filter(z=> z !== e); },
  pdHurtGuard(e, x, y, d){
    if (e.mode === 'dead') return; e.hp -= d; e.flash = 2; this.pdFx('pdFxIce', 'pdIce', x, y, 0.6); this.pdSfx('gdHit', x); this.pdLitter(x, y, 3, 'ice', 0.8);
    if (e.hp < e.max*PD.guard.crack && !e.cr){ e.cr = 1; e.st = 3; e.spr.setFrame(3); this.pdSfx('gdCrack', x); this.pdLitter(e.x, e.y, 10, 'ice', 1.1); this.cameras.main.shake(80, 0.003); }
    if (e.hp <= 0) this.pdGuardShatter(e);
  },
  pdGuardShatter(e){
    const pd = this.pd; e.mode = 'dead'; e.st = 3; this.pdSfx('gdShatter', e.x); this.cameras.main.shake(200, 0.008);
    for (let k = 0; k < 9; k++) this.pdFx('pdFxIce', 'pdIce', e.x + Phaser.Math.Between(-46, 46), e.y + Phaser.Math.Between(-40, 40), Phaser.Math.FloatBetween(0.8, 1.5));
    this.pdFx('pdFxFrost', 'pdFrost', e.x, e.y, 1.7); this.pdShards('g', 3, 30, 5, 15, 1.6, e.x, e.y, e.scale); this.pdLitter(e.x, e.y, 36, 'ice', 1.6); this.pdDeathPieces('g', 3, e.x, e.y, e.scale, PD.regionsG, 1.4);
    this.pdKillGuardObj(e);
  },
  pdKillGuardObj(e){ const pd = this.pd; e.spr.destroy(); e.crystals.forEach(s=> s.destroy()); pd.guards = pd.guards.filter(z=> z !== e); },
  pdUpdateEntities(){
    const pd = this.pd, U = pd.U, f = pd.f;
    pd.ships.forEach(e=>{
      e.t++; if (e.t < 0) return; const sx = this.pdSlotX(e.slot), sy = this.pdSlotY(e.slot);
      if (e.mode === 'in'){ e.x += (sx - e.x)*0.09; e.y += (sy - e.y)*0.09 + (e.t < 60 ? 1.1*U : 0); if (e.t > 70 && Math.abs(e.y - sy) < 3 && Math.abs(e.x - sx) < 3) e.mode = 'on'; }
      else { e.x = sx + Math.sin(f*0.04 + e.slot)*6*U; e.y = sy + Math.sin(f*0.05 + e.slot*2)*3*U; }
      if (e.flash > 0) e.flash--;
    });
    pd.guards.forEach(e=>{
      e.t++; const sx = this.pdSlotX(e.slot), sy = this.pdSlotY(e.slot);
      if (e.mode === 'dash'){ e.scale += (e.goal - e.scale)*0.2; e.x += (sx - e.x)*0.17; e.y += (sy - e.y)*0.17; if (e.t % 3 === 0) this.pdLitter(e.x, e.y + 10*U, 1, 'ice', 0.4);
        if (e.t === 26){ e.mode = 'frost'; e.st = 1; e.spr.setFrame(1); this.pdSfx('gdFreeze', e.x); this.pdFx('pdFxFrost', 'pdFrost', e.x, e.y, 1.5); for (let k = 0; k < 6; k++) this.pdFx('pdFxIce', 'pdIce', e.x + Phaser.Math.Between(-36, 36), e.y + Phaser.Math.Between(-36, 36), Phaser.Math.FloatBetween(0.6, 1.1)); this.pdLitter(e.x, e.y, 12, 'ice', 1); } }
      else if (e.mode === 'frost'){ e.x = sx; e.y = sy; if (e.t % 5 === 0) this.pdLitter(e.x + Phaser.Math.Between(-30, 30)*U, e.y + Phaser.Math.Between(-20, 20)*U, 1, 'ice', 0.3);
        if (e.t === 72){ e.st = 2; e.spr.setFrame(2); this.pdFx('pdFxFrost', 'pdFrost', e.x, e.y, 1.8); for (let k = 0; k < 7; k++) this.pdFx('pdFxIce', 'pdIce', e.x + Phaser.Math.Between(-44, 44), e.y + Phaser.Math.Between(-36, 36), Phaser.Math.FloatBetween(0.6, 1.2)); this.pdLitter(e.x, e.y, 16, 'ice', 1.2); e.mode = 'on'; } }
      else if (e.mode === 'on'){ e.x = sx + Math.sin(f*0.03 + e.slot)*2*U; e.y = sy + Math.sin(f*0.045 + e.slot)*2*U; e.scale = e.goal; if (f % 26 === e.slot*7) this.pdLitter(e.x + Phaser.Math.Between(-30, 30)*U, e.y + Phaser.Math.Between(-26, 26)*U, 1, 'ice', 0.25); }
      if (e.flash > 0) e.flash--;
    });
  },
  pdDrawEntities(delta){
    const pd = this.pd, U = pd.U, f = pd.f;
    pd.ships.forEach(e=>{
      if (e.t < 0){ e.spr.setAlpha(0); return; }
      e.spr.setPosition(e.x, e.y).setAlpha(e.mode === 'in' ? Math.min(1, e.t/20) : 1); if (e.flash > 0) e.spr.setTintFill(0xffffff); else e.spr.clearTint();
      PD.mob.flame.forEach((p, i)=>{ const s = e.fl[i], on = this.pdSolidK('m', e.st, p[0], p[1] - 10); s.setVisible(on).setPosition(e.x + (p[0] - 256)*e.scale, e.y + (p[1] - 256)*e.scale + 4*U); });
    });
    pd.guards.forEach(e=>{
      e.spr.setPosition(e.x, e.y).setScale(e.scale).setAlpha(e.mode === 'dash' ? Math.min(1, e.t/8) : 1); if (e.flash > 0) e.spr.setTintFill(0xdff6ff); else e.spr.clearTint();
      // cristaux de givre qui tournent autour de l'agent gelé
      if (e.mode === 'frost' || e.mode === 'on'){ if (!e.crystals.length) for (let k = 0; k < 6; k++){ const s = this.add.sprite(0, 0, 'pdFxGlow').setDepth(5.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0xcdeeff); s.play('pdGlow'); e.crystals.push(s); }
        const fr = e.mode === 'frost' ? Math.min(1, (e.t - 26)/46) : 1; e.crystals.forEach((s, k)=>{ const a = k*1.047 + f*0.01, r = 38 + 4*Math.sin(f*0.05 + k); s.setPosition(e.x + Math.cos(a)*r*1.5*U, e.y + Math.sin(a)*r*0.9*U).setScale(0.1*U).setAlpha(0.7*fr); }); }
    });
  },

  /* ---------- attaques ---------- */
  pdStartAtk(a){
    const pd = this.pd; pd.atk = a; pd.atT = 0; pd.tq = [];
    if (a === 'volley') PD.gun.forEach((p, i)=> pd.tq.push({ i, t:12 + i*34, fired:false, n:0, charged:false }));
    if (a === 'ring') this.pdSfx('pdRingCharge', pd.wx);
    if (a === 'solar') this.pdSfx('pdBeamCharge', pd.wx);
    if (a === 'guard'){ if (!this.pdSummonShips(Phaser.Math.Clamp(1 + pd.st, 1, 3))){ pd.atk = 'idle'; pd.idleT = 40; } }
  },
  pdOrb(x, y, ang, spd){
    if (this._bLoad > BULLET_CAP) return null; const pd = this.pd, sc = 0.42*pd.U;
    const b = this.enemyBullets.create(x, y, 'pdFxOrb', 0); b.setDepth(4); b.damage = PD.dmg.orb; b._aim = true; b.setOrigin(0.5, 94/128).setScale(sc).setRotation(ang - Math.PI/2).setBlendMode(Phaser.BlendModes.ADD);
    const r = 5.25/sc; b.body.setCircle(r, 32 - r, 94 - r); b.play('pdOrb'); this.physics.velocityFromRotation(ang, spd*60*pd.U, b.body.velocity); return b;
  },
  pdUpdateAttack(){
    const pd = this.pd, U = pd.U, pl = this.player, N = ['volley', 'ring', 'solar', 'guard'], speed = [1, 1.15, 1.3, 1.5][pd.st];
    if (pd.atk === 'idle'){ if (--pd.idleT <= 0) this.pdStartAtk(N[pd.atIdx++ % 4]); return; }
    pd.atT++; const T = pd.atT;
    if (pd.atk === 'volley'){
      pd.tq.forEach(q=>{
        const [x, y] = this.pdW(PD.gun[q.i][0], PD.gun[q.i][1]);
        if (!q.charged && T >= q.t){ q.charged = true; this.pdSfx('pdRingCharge', x); }
        if (T >= q.t + 26 && q.n < 3 && (T - q.t - 26) % 12 === 0){ q.n++; this.pdFx('pdFxMuzzle', 'pdMuzzle', x, y, 0.7); this.pdSfx('pdVolley', x); const a0 = Math.atan2(pl.y - y, pl.x - x); for (let k = -1; k <= 1; k++) this.pdOrb(x, y, a0 + k*0.17, 4.6); }
      });
      if (T > 12 + 34 + 26 + 40){ pd.atk = 'idle'; pd.idleT = Math.round(70/speed); }
    } else if (pd.atk === 'ring'){
      const [x, y] = this.pdW(PD.logo[0], PD.logo[1]);
      if (T === 55 || (pd.st >= 1 && T === 105)){ this.pdSfx('pdRingBurst', x); this.pdFx('pdFxMuzzle', 'pdMuzzle', x, y, 1.4); const gap = Math.atan2(pl.y - y, pl.x - x) + Phaser.Math.FloatBetween(-0.3, 0.3), n = 20; for (let k = 0; k < n; k++){ const a = k/n*6.283; if (Math.abs(Math.atan2(Math.sin(a - gap), Math.cos(a - gap))) < 0.3) continue; this.pdOrb(x, y, a, 2.6); } this.cameras.main.shake(100, 0.004); }
      if (T > (pd.st >= 1 ? 190 : 140)){ pd.atk = 'idle'; pd.idleT = Math.round(70/speed); }
    } else if (pd.atk === 'solar'){
      if (T === 70) this.pdSfx('pdBeamFire', pd.wx);
      if (T > 70 && T < 250 && pl && pl.active){ const u = (T - 70)/180; for (let i = 0; i < 2; i++){ if (!this.pdWingOn(i)) continue; const [x, y] = this.pdW(PD.wing[i][0], PD.wing[i][1]), th = Math.PI/2 + (i ? 1 : -1)*(0.62 - 1.24*u), dx = pl.x - x, dy = pl.y - y, al = dx*Math.cos(th) + dy*Math.sin(th), pp = Math.abs(-dx*Math.sin(th) + dy*Math.cos(th)); if (al > 10*U && pp < 13*U) this.damagePlayer(PD.dmg.beam); } if (T % 4 === 0) this.cameras.main.shake(60, 0.002); }
      if (T > 270){ pd.atk = 'idle'; pd.idleT = Math.round(80/speed); }
    } else if (pd.atk === 'guard'){ if (T > 90){ pd.atk = 'idle'; pd.idleT = Math.round(70/speed); } }
  },

  /* ---------- à chaque image ---------- */
  pdUpdate(delta){
    const pd = this.pd; if (!pd || pd.dead) return;
    pd.acc += Math.min(delta, 100); let n = 0;
    while (pd.acc >= 16.667 && n++ < 6){ pd.acc -= 16.667; this.pdStep(); }
    this.pdPlace(); this.pdHits(); this.pdLights(delta); this.pdDrawEntities(delta);
    pd.flames.forEach(f=>{ const p = this.pdW(f.a[0], f.a[1]); f.s.setPosition(p[0], p[1] + 6*pd.U*1.6); });
    if (pd.flash > 0){ pd.sp.setTintFill(0xffffff); pd.flash -= delta/33; if (pd.flash <= 0) pd.flash = 0; } else pd.sp.clearTint();
    const pl = this.player; if (pl && pl.active && pd.mode === 'play'){ const [sx, sy] = this.pdS(pl.x, pl.y); if (this.pdBsol(sx, sy)) this.damagePlayer(PD.dmg.contact); }
    const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, pd.hp/pd.max*100) + '%';
  },
  pdStep(){        // une image de 1/60 s, comme sur la page
    const pd = this.pd; pd.f++; pd.hitT = Math.max(0, pd.hitT - 1);
    if (pd.mode === 'enter'){ pd.enter += 0.012; this.cameras.main.shake(40, 0.002); if (pd.enter >= 1){ pd.mode = 'play'; this.cameras.main.shake(200, 0.006); const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.add('show'); } }
    if (pd.mode === 'play' || pd.mode === 'dying') pd.t += (1/60)*(pd.mode === 'dying' ? 0.5 : 1);
    if (pd.mode === 'play'){
      this.pdUpdateAttack(); this.pdUpdateEntities();
      const ev = [0, 60, 34, 20][pd.st]; if (ev && pd.f % ev === 0){ const op = this.pdPix('b', pd.st).op, o = op[Phaser.Math.Between(0, op.length - 1)], [x, y] = this.pdW(o[0], o[1]); this.pdSmoke(x, y - 4, 1.0 + pd.st*0.3); if (pd.st >= 2) this.pdSpark(x, y, 0.9); }
    } else this.pdUpdateEntities();
    if (pd.mode === 'dying'){
      pd.dieT++;
      if (pd.dieT % 5 === 0){ const [x, y] = this.pdHullPoint(); this.pdBoom(x, y, Phaser.Math.Between(120, 210), pd.dieT % 15 === 0 ? 'pdBoomSmall' : ''); this.pdSpark(x, y, 1.2); this.pdShards('b', pd.st, 1, 6, 14, 1.2, pd.wx, pd.wy, pd.S); }
      if (pd.dieT % 4 === 0){ const [x, y] = this.pdHullPoint(); const f = this.acFx('acFxFlame', 'acFlame', x, y + 8, 0.5*pd.U, { loop:true, vy:-8 }); this.time.delayedCall(900, ()=>{ if (f && f.active) f.destroy(); }); this.pdSmoke(x, y, 1.8); }
      if (pd.dieT === 30) this.pdSfx('pdRoar', pd.wx);
      if (pd.dieT > 85) this.pdDead();
    }
  },
  pdLights(delta){        // jeu de lumières dorées : logo qui pulse, chenille le long des ailes, balises des tours, flammes des propulseurs, charge des canons, faisceaux solaires
    const pd = this.pd, U = pd.U, S = pd.S, f = pd.f, st = pd.st, vis = pd.mode !== 'dead', T = pd.atT;
    const [lx, ly] = this.pdW(PD.logo[0], PD.logo[1]), lg = pd.atk === 'ring' ? Math.min(1, T/55) : 0, p = 0.9 + 0.5*lg + 0.1*Math.sin(f*0.1);
    pd.logoG.setPosition(lx, ly).setScale(p*U).setAlpha(vis && st < 3 ? 0.45 + 0.5*lg : 0);
    [0, 1].forEach(i=>{ const on = vis && this.pdWingOn(i); pd.wingL[i].forEach((s, k)=>{ if (!on){ s.setAlpha(0); return; } const u = (((f*0.025 + k/6) % 1) + 1) % 1, sx = i ? 340 + u*160 : 170 - u*160, sy = 300 + u*100 + (k % 2 ? 4 : 0); if (!this.pdBsol(sx, sy)){ s.setAlpha(0); return; } const [x, y] = this.pdW(sx, sy); s.setPosition(x, y).setScale(0.3*U).setAlpha(1 - Math.abs(u - 0.5)*1.2); }); });
    PD.tower.forEach((t, i)=>{ const s = pd.towerG[i]; if (!vis || st >= 2 || !this.pdBsol(t[0], t[1] + 4) || (f + i*20) % 50 >= 8){ s.setAlpha(0); return; } const [x, y] = this.pdW(t[0], t[1]); s.setPosition(x, y).setScale(0.35*U).setAlpha(0.9); });
    PD.flame.forEach((q, i)=>{ const s = pd.thr[i], on = vis && st < 3 && this.pdBsol(q[0], q[1] - 6); s.setVisible(on); if (on){ const [x, y] = this.pdW(q[0], q[1]); s.setPosition(x, y + 3*U).setScale(0.45*U).setAlpha(0.85); } });
    PD.gun.forEach((q, i)=>{ const g = pd.gunG[i], z = pd.tq.find(w=> w.i === i), ch = pd.atk === 'volley' && z && T >= z.t && T < z.t + 26 && st < 3; if (!vis || !ch){ g.setAlpha(0); return; } const [x, y] = this.pdW(q[0], q[1]); g.setPosition(x, y).setScale((0.3 + 0.5*(T - z.t)/26)*U).setAlpha(1); if (T === z.t) this.pdFx('pdFxCharge', 'pdCharge', x, y, 0.6); });
    // rayons solaires : télégraphe fin pendant la charge, puis deux faisceaux dorés (large + cœur fin) qui balaient en croix
    let mode = null, u = 0; if (vis && pd.atk === 'solar' && pd.mode === 'play'){ if (T < 70){ mode = 'charge'; u = T/70; } else if (T < 255){ mode = 'fire'; u = (T - 70)/180; } }
    pd.beams.forEach((s, j)=>{ const i = j % 2, wide = j < 2;
      if (!mode || !this.pdWingOn(i)){ s.setVisible(false); if (!mode || !this.pdWingOn(i)) pd.wingG[i].setAlpha(0); return; }
      const [x, y] = this.pdW(PD.wing[i][0], PD.wing[i][1]); let th, len, wid, al;
      if (mode === 'charge'){ if (!wide){ s.setVisible(false); return; } th = Math.PI/2 + (i ? 1 : -1)*0.62; len = 500*u*u*U; wid = (4 + 8*u)*U; al = 0.3*u; pd.wingG[i].setPosition(x, y).setScale((1.6*u + 0.4)*U).setAlpha(0.5 + 0.5*u); if (j === 0 && T === 1) this.pdFx('pdFxCharge', 'pdCharge', x, y, 0.9); }
      else { const k = Math.min(1, (T - 70)/10, (255 - T)/14); th = Math.PI/2 + (i ? 1 : -1)*(0.62 - 1.24*u); len = 760*U; wid = (wide ? 40 : 15)*U*k; al = wide ? 0.95 : 1; pd.wingG[i].setPosition(x, y).setScale(1.5*U).setAlpha(1); }
      s.setVisible(true).setPosition(x, y).setRotation(th - Math.PI/2).setScale(Math.max(0.01, wid/64), len/128).setAlpha(al); });
  },

  /* ---------- mort ---------- */
  pdDie(){
    const pd = this.pd; if (pd.mode === 'dying' || pd.dead) return;
    pd.mode = 'dying'; pd.dieT = 0; pd.atk = 'idle'; pd.tq = []; this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
    pd.ships.slice().forEach(e=> this.pdKillShipObj(e)); pd.guards.slice().forEach(e=> this.pdKillGuardObj(e));
    const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
    this.startSlowmo && this.startSlowmo(1500, 0.5); this.juiceStop && this.juiceStop('bossKill');
  },
  pdDead(){        // la tour se disloque en pièces, pluie de pièces d'or et de contrats ; puis fin du niveau
    const pd = this.pd; if (pd.dead) return; pd.dead = true;
    const [cx, cy] = this.pdW(256, 200), [hx, hy] = this.pdW(PD.cockpit[0], PD.cockpit[1]);
    this.cameras.main.flash(600, 255, 240, 200, false); this.cameras.main.shake(900, 0.014);
    this.pdBoom(cx, cy, 900, 'pdBoomBig'); this.pdBoom(cx, cy, 520, ''); this.pdBoom(cx - 60, cy - 40, 380, ''); this.pdBoom(cx + 60, cy + 40, 380, '');
    [0, 200, 400].forEach(d=> this.time.delayedCall(d, ()=> this.pdFx('pdFxShock', 'pdShock', cx, cy, 2.4 + d/130)));
    this.pdDeathPieces('b', pd.st, pd.wx, pd.wy, pd.S, PD.regionsB, 1); this.pdShards('b', pd.st, 18, 6, 18, 1.5, pd.wx, pd.wy, pd.S);
    this.pdFx('pdFxMuzzle', 'pdMuzzle', hx, hy, 1.6); this.pdLitter(hx, hy, 60, 'coin', 2); this.pdLitter(hx, hy, 30, 'paper', 1.4); this.time.delayedCall(250, ()=> this.pdSfx('pdCoins', cx));
    for (let k = 0; k < 24; k++) this.pdSpark(cx + Phaser.Math.Between(-60, 60), cy + Phaser.Math.Between(-60, 60), Phaser.Math.FloatBetween(0.7, 1.4));
    [pd.sp, pd.logoG, pd.hubG].concat(pd.wingL[0], pd.wingL[1], pd.towerG, pd.gunG, pd.wingG, pd.thr, pd.beams).forEach(o=>{ if (o) o.setVisible(false); }); pd.flames.forEach(f=> f.s.destroy()); pd.flames = [];
    this.composantShower(cx, cy, COMP.bossBig);
    this.score += PD.killScore;
    this.time.delayedCall(2400, ()=>{ if (this.running) this.levelWin(); });
  },
});
