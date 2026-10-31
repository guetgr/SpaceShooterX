"use strict";
// Méthodes de GameScene — les 5 boss du secteur 2 (La Casse lunaire) : Crabe à scies, Incinérateur, Benne folle, Broyeur, Réparateur en chef (`finalBoss:'crabe'|'incinerateur'|'benne'|'broyeur'|'reparateur'`).
// Autonomes comme l'Araignée : état dans `this.w2`. Configs, pièces mobiles et attaques scriptées : data/boss-w2.js (reprise de la page validée par Bio).
// Le boss et tous ses effets sont dessinés sur UNE toile (texture `w2cv`) à l'échelle de la page (largeur 520, `U` = pixels du jeu par unité de page) ; les collisions sont faites ici
// (masque du sprite pour les tirs du joueur, distance pour les projectiles, segment pour les faisceaux, rectangle pour le piston).
(function(){
  const TAU = Math.PI*2, rnd = (a, b)=> a + Math.random()*(b - a), lerp = (a, b, t)=> a + (b - a)*t, clampv = (v, a, b)=> Math.max(a, Math.min(b, v)), ease = t=> t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
  const PW = 520, K = 0.62, CRIT_MUL = 2.5, ENTER_T = 2.2, WEAK = { crabe:'core', incinerateur:'core', benne:'cab', broyeur:'mid', reparateur:'core' };
  const GAP = [1.0, 0.8, 0.6], SPEED = [1, 1.1, 1.25];            // pause entre deux attaques et vitesse du boss selon l'état d'usure
  const FX = { ac_fx_charge:[128, 128, 12], ac_fx_muzzle:[128, 128, 6], ac_fx_impact:[96, 96, 8], ac_fx_shock:[192, 192, 10], ac_fx_flame:[64, 96, 12], an_fx_orbHot:[64, 128, 8], ac_fx_smoke:[96, 96, 10], ac_fx_spark:[64, 64, 8] };
  const FXI = {}; const fxImg = n=>{ if (!FXI[n]){ const im = new Image(); im.src = asset('sprites/' + n + '.webp'); FXI[n] = im; } return FXI[n]; };

  class W2Stage {
    constructor(scene, cfg, W, H, U){
      this.sc = scene; this.cfg = cfg; this.W = W; this.H = H; this.U = U; this.K = K; this.ready = false;
      this.cv = document.createElement('canvas'); this.cv.width = Math.round(W*U); this.cv.height = Math.round(H*U); this.ctx = this.cv.getContext('2d');
      this.bc = document.createElement('canvas'); this.bc.width = this.bc.height = 512; this.bg = this.bc.getContext('2d');       // le boss seul (pour le flash blanc)
      this.img = new Image(); this.img.onload = ()=> this.prep(); this.img.src = asset('sprites/w2_' + cfg.tex + '.webp');
      Object.keys(FX).forEach(fxImg);
      this.reset(); this.pl = { x:W/2, y:H - 70 };
    }
    lvl(){ const t = this.cfg.thresh; return this.hp*100 > t[0] ? 0 : this.hp*100 > t[1] ? 1 : 2; }      // état d'usure 0..2 selon les paliers de la config (% de vie)
    reset(){ this.t = 0; this.fx = []; this.timers = []; this.bx = this.W/2; this.by = -260; this.mv = null; this.pose = {}; this.tws = []; this.rollA = 0; this.hp = 1; this.dead = false; this.pieces = null;
      this.cur = -1; this.curT = 0; this.gapT = 1.4; this.shake = 0; this.pull = 0; this.escorts = []; this.atkIdx = 0; this.flash = 0; this.deathT = 0; }
    prep(){          // 3 états d'usure fabriqués une fois dans le sprite (plaques arrachées, fissures lumineuses, assombrissement) ; les pièces mobiles sont découpées dans chacun
      const mk = lvl=>{ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.drawImage(this.img, 0, 0); g.globalCompositeOperation = 'source-atop';
        let seed = this.cfg.seed + lvl*7; const r = ()=> (seed = (seed*16807) % 2147483647)/2147483647;
        for (let i = 0; i < 9*lvl; i++){ const x = r()*440 + 36, y = r()*440 + 36, n = 5 + (r()*4 | 0), R = 14 + r()*26*lvl; g.beginPath(); for (let k = 0; k < n; k++){ const a = k/n*TAU, rr = R*(0.5 + r()*0.7); g.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); }
          g.closePath(); g.fillStyle = 'rgba(8,3,4,.82)'; g.fill(); g.strokeStyle = 'rgba(255,120,40,.55)'; g.lineWidth = 2; g.stroke(); }
        for (let i = 0; i < 6*lvl; i++){ let x = r()*480 + 16, y = r()*480 + 16; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++){ x += (r() - 0.5)*46; y += (r() - 0.3)*40; g.lineTo(x, y); } g.strokeStyle = 'rgba(255,150,50,.85)'; g.lineWidth = 2; g.stroke(); }
        g.fillStyle = 'rgba(0,0,0,' + (0.18*lvl) + ')'; g.fillRect(0, 0, 512, 512); return c; };
      this.dmg = [this.img, mk(1), mk(2)]; this.sets = this.dmg.map(src=> this.buildParts(src));
      const m = document.createElement('canvas'); m.width = m.height = 512; const mg = m.getContext('2d', { willReadFrequently:true }); mg.drawImage(this.img, 0, 0); this.mask = mg.getImageData(0, 0, 512, 512).data;
      this.op = []; for (let y = 0; y < 512; y += 8) for (let x = 0; x < 512; x += 8) if (this.mask[(y*512 + x)*4 + 3] > 200) this.op.push([x, y]);
      this.ready = true;
    }
    path(g, p){ g.beginPath();
      if (p.type === 'circle') g.arc(p.c[0], p.c[1], p.r, 0, TAU);
      else if (p.type === 'poly') p.pts.forEach((v, i)=> i ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1]));
      else if (p.type === 'sector'){ g.arc(p.c[0], p.c[1], p.rmax, p.a0, p.a1); g.arc(p.c[0], p.c[1], p.rmin, p.a1, p.a0, true); }
      g.closePath(); }
    buildParts(src){
      const parts = this.cfg.parts || []; if (!parts.length) return { base:src, parts:[] };
      const mk = ()=>{ const c = document.createElement('canvas'); c.width = c.height = 512; return c; };
      const base = mk(), b = base.getContext('2d');
      for (const p of parts){ const u = mk(), ug = u.getContext('2d'); ug.save(); this.path(ug, p); ug.clip(); ug.drawImage(src, 0, 0); ug.globalCompositeOperation = 'source-in'; ug.fillStyle = '#12080a'; ug.fillRect(0, 0, 512, 512); ug.restore(); b.drawImage(u, 0, 0); }
      const cut = mk(), cg = cut.getContext('2d'); cg.drawImage(src, 0, 0); cg.globalCompositeOperation = 'destination-out'; for (const p of parts){ this.path(cg, p); cg.fill(); } b.drawImage(cut, 0, 0);
      return { base, parts:parts.map(p=>{ const c = mk(), pg = c.getContext('2d'); pg.save(); this.path(pg, p); pg.clip(); pg.drawImage(src, 0, 0); pg.restore(); return c; }) };
    }
    scrapTex(){      // cubes de ferraille compactée : vraie matière découpée dans le tas de la benne, avec volume
      if (this._scrap) return this._scrap; if (this.cfg.tex !== 'benne' && !this.sc._w2Scrap) return [];
      const src = this.img; if (!src.complete || !src.naturalWidth) return [];
      this._scrap = []; for (let i = 0; i < 6; i++){ const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
        g.drawImage(src, 190 + (i % 3)*45, 360 + ((i/3) | 0)*40, 22, 22, 0, 0, 32, 32);
        const gr = g.createLinearGradient(0, 0, 32, 32); gr.addColorStop(0, 'rgba(255,230,210,.35)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
        g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(0, 0, 32, 3); g.fillRect(0, 0, 3, 32); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 29, 32, 3); g.fillRect(29, 0, 3, 32);
        g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgb(75,38,32)'; g.fillRect(0, 0, 32, 32); g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#120608'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 29, 29); this._scrap.push(c); }
      return this._scrap;
    }
    /* ---- outils des scripts d'attaque ---- */
    snd(name, x){ this.sc.w2Sfx(name, x == null ? null : x); }
    sprite(g, n, f, x, y, w, h, rot, alpha, ox, oy){ const S = FX[n], im = fxImg(n); if (!im.complete || !im.naturalWidth) return; f = clampv(f | 0, 0, S[2] - 1);
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = alpha == null ? 1 : alpha; g.translate(x, y); if (rot) g.rotate(rot); g.drawImage(im, f*S[0], 0, S[0], S[1], -w*(ox == null ? 0.5 : ox), -h*(oy == null ? 0.5 : oy), w, h); g.restore(); }
    glow(g, x, y, r, col, a){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a == null ? 1 : a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
    impact(x, y, size){ return this.add({ type:'x', life:0.45, draw:(g, e, k)=> this.sprite(g, 'ac_fx_impact', k*7.9, x, y, size, size, 0, 1) }); }
    crop(g, sx, sy, sw, sh, cx, cy, w, h){ g.save(); g.translate(cx, cy); g.scale(1, -1); g.drawImage(this.img, sx, sy, sw, sh, -w/2, -h/2, w, h); g.restore(); }
    P(x, y){ return { x:this.bx + (x - 256)*K, y:this.by + (256 - y)*K }; }
    tw(key, to, d){ this.tws.push({ key, from:this.pose[key] || 0, to, t0:this.t, d:Math.max(0.001, d) }); }
    A(name){ const p = this.cfg.anchors[name]; return { x:this.bx + (p[0] - 256)*K, y:this.by + (256 - p[1])*K }; }
    at(d, fn){ this.timers.push({ t:this.t + d, fn }); }
    add(e){ e.age = 0; this.fx.push(e); return e; }
    moveTo(x, y, d){ this.mv = { x0:this.bx, y0:this.by, x1:x, y1:y, t0:this.t, d }; }
    proj(o){ return this.add(Object.assign({ kind:'fire', r:8, life:2, vx:0, vy:0, ay:0, spin:0, a:0 }, o, { type:'p' })); }
    flash_(x, y, col, r, life, follow){ return this.add({ type:'f', x, y, col, r, life, follow }); }
    beam(a, b, col, w, life, arc){ return this.add({ type:'b', a, b, col, w, life, arc }); }
    ring(x, y, r1, life, col){ return this.add({ type:'r', x, y, r1, life, col }); }
    zone(x, y, r, life, col){ return this.add({ type:'z', x, y, r, life, col }); }
    mark(x, y, life){ return this.add({ type:'m', x, y, life }); }
    burst(x, y, n, col, sp, life){ for (let i = 0; i < n; i++){ const a = rnd(0, TAU), v = rnd(sp*0.3, sp); this.proj({ kind:'spark', x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:rnd(life*0.5, life), r:rnd(1.5, 3), col }); } }
    // escorte réelle du Réparateur : de vrais petits vaisseaux du jeu, abîmés à l'arrivée, qu'il soigne
    callEscort(n, hurt){      // l'escorte = les mobs du niveau (liste `spawns`), pas des vaisseaux à part
      this.escorts = this.escorts.filter(e=> e.en && e.en.active); const x0 = this.sc.w2.ox, U = this.U, pool = ((this.sc.lvDef && this.sc.lvDef.spawns) || []).map(sp=> sp.type).filter(t=> t !== 'mine'); if (!pool.length) pool.push('grunt');
      for (let i = 0; i < n; i++){ const en = this.sc.spawnOneEnemy(Phaser.Utils.Array.GetRandom(pool), x0 + (110 + i*150)*U); if (en){ if (hurt) en.hp = en.maxHp*0.5; this.escorts.push({ en, px:0, py:0, healing:0 }); } } }
    crushEscort(){ for (const e of this.escortList()){ this.sc.w2Boom(e.en.x, e.en.y, 160, ''); e.en.destroy(); } this.escorts = []; }
    escortList(){ return this.escorts.filter(e=> e.en && e.en.active); }
    runAttack(i){ this.cur = i; this.curT = 0; this.timers = []; this.cfg.attacks[i].go(this); }
    /* ---- mort : la coque se brise en 16 morceaux ---- */
    shatter(){
      this.timers = []; this.fx = []; this.dead = true; const N = 4, pts = []; for (let j = 0; j <= N; j++){ pts[j] = []; for (let i = 0; i <= N; i++) pts[j][i] = [i*512/N + ((i && i < N) ? rnd(-34, 34) : 0), j*512/N + ((j && j < N) ? rnd(-34, 34) : 0)]; }
      this.pieces = []; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++){ const q = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]], cx = q.reduce((a, p)=> a + p[0], 0)/4, cy = q.reduce((a, p)=> a + p[1], 0)/4, dx = cx - 256, dy = cy - 256, d = Math.hypot(dx, dy) + 1;
        this.pieces.push({ q, cx, cy, x:0, y:0, rot:0, vx:dx/d*rnd(60, 190) + rnd(-30, 30), vy:dy/d*rnd(40, 150) + rnd(-60, 20), vr:rnd(-2.6, 2.6), burn:rnd(0.4, 1) }); }
      this.deathT = 0;
    }
    /* ---- mise à jour d'une image ---- */
    update(dt, mode){
      this.t += dt; this.curT += dt;
      for (const w of this.tws){ const k = clampv((this.t - w.t0)/w.d, 0, 1); this.pose[w.key] = lerp(w.from, w.to, ease(k)); } this.tws = this.tws.filter(w=> this.t - w.t0 < w.d);
      this.rollA += (1.2 + (this.pose.spin || 0))*dt;
      if (this.flash > 0) this.flash = Math.max(0, this.flash - dt*6);
      if (mode === 'play'){
        const lv = this.lvl();
        if (this.mv){ const k = clampv((this.t - this.mv.t0)/this.mv.d, 0, 1), e = ease(k); this.bx = lerp(this.mv.x0, this.mv.x1, e); this.by = lerp(this.mv.y0, this.mv.y1, e); if (k >= 1) this.mv = null; }
        else { this.bx += (this.W/2 + Math.sin(this.t*0.5)*90 - this.bx)*dt*0.8; this.by += (190 + Math.sin(this.t*1.1)*8 - this.by)*dt*2; }
        if (this.cur >= 0 && this.curT > this.cfg.attacks[this.cur].dur){ this.cur = -1; this.gapT = GAP[lv]; }
        else if (this.cur < 0){ this.gapT -= dt; if (this.gapT <= 0) this.runAttack(this.atkIdx++ % this.cfg.attacks.length); }
        for (const tm of this.timers.slice()) if (this.t >= tm.t){ tm.fn(this); this.timers.splice(this.timers.indexOf(tm), 1); }
      } else if (mode === 'dying'){
        this.timers = this.timers.filter(tm=> this.t < tm.t);
      }
      if (this.dead){ this.deathT += dt; for (const p of this.pieces){ p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 90*dt; p.rot += p.vr*dt; } }
      for (const e of this.fx){ e.age += dt; if (e.type === 'p'){ if (e.upd) e.upd(e, dt, this); else { e.vy += e.ay*dt; e.x += e.vx*dt; e.y += e.vy*dt; } e.a += e.spin*dt; } if (e.follow){ const p = this.A(e.follow); e.x = p.x; e.y = p.y; } }
      this.fx = this.fx.filter(e=>{ if (e.age < e.life) return true; if (e.onDie) e.onDie(e, this); return false; });
      const lv = this.lvl();      // fumée / étincelles selon la santé
      if (lv && !this.dead && mode === 'play' && Math.random() < dt*(lv === 2 ? 22 : 9)){ const a = rnd(0, TAU), d = rnd(10, 110); this.proj({ kind:Math.random() < 0.6 ? 'smoke' : 'spark', x:this.bx + Math.cos(a)*d, y:this.by + Math.sin(a)*d*0.8, vx:rnd(-18, 18), vy:rnd(-70, -20), life:rnd(0.6, 1.4), r:rnd(5, 11), col:'#ffb050', harm:false }); }
    }
    // l'API des scripts utilise `flash` pour les lueurs ; la propriété `flash` (blanc d'impact) est donc stockée à part
    draw(){
      const g = this.ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height); g.setTransform(this.U, 0, 0, this.U, 0, 0);
      if (!this.ready) return;
      if (!this.dead){
        const lv = this.lvl(), set = this.sets[lv], b = this.bg; b.clearRect(0, 0, 512, 512); b.drawImage(set.base, 0, 0);
        (this.cfg.parts || []).forEach((p, i)=>{ const o = p.fn(this, this.t) || {}; b.save(); b.translate(p.pivot[0] + (o.dx || 0), p.pivot[1] + (o.dy || 0)); b.rotate(o.rot || 0); b.translate(-p.pivot[0], -p.pivot[1]); b.drawImage(set.parts[i], 0, 0); b.restore(); });
        if (this.hitFlash > 0 || this.hurtRed){ b.save(); b.globalCompositeOperation = 'source-atop'; b.fillStyle = this.hitFlash > 0 ? 'rgba(255,255,255,' + clampv(this.hitFlash, 0, 1) + ')' : 'rgba(255,60,40,.22)'; b.fillRect(0, 0, 512, 512); b.restore(); }
        g.save(); g.translate(this.bx, this.by); g.scale(K, -K); g.translate(-256, -256); g.drawImage(this.bc, 0, 0); g.restore();
      } else {
        for (const p of this.pieces){ g.save(); g.translate(this.bx + (p.cx - 256)*K + p.x, this.by + (256 - p.cy)*K + p.y); g.rotate(p.rot); g.scale(K, -K); g.translate(-p.cx, -p.cy);
          g.beginPath(); p.q.forEach((v, i)=> i ? g.lineTo(v[0], v[1]) : g.moveTo(v[0], v[1])); g.closePath(); g.clip(); g.drawImage(this.dmg[2], 0, 0); g.fillStyle = 'rgba(10,3,3,' + (0.35 + 0.4*p.burn) + ')'; g.fillRect(0, 0, 512, 512); g.restore();
          g.fillStyle = 'rgba(255,130,40,' + (clampv(1 - this.deathT/3, 0, 1)*0.7) + ')'; g.beginPath(); g.arc(this.bx + (p.cx - 256)*K + p.x, this.by + (256 - p.cy)*K + p.y, 6, 0, TAU); g.fill(); }
      }
      if (this.cfg.over && !this.dead) this.cfg.over(this, g);
      for (const e of this.fx) this.drawFx(g, e);
    }
    drawFx(g, e){
      const k = e.age/e.life, A = 1 - k;
      if (e.type === 'f'){ if (e.charge) this.sprite(g, 'ac_fx_charge', k*11.9, e.x, e.y, e.r*2.4, e.r*2.4, 0, 1); else this.sprite(g, 'ac_fx_muzzle', k*5.9, e.x, e.y, e.r*2.4, e.r*2.4, e.rot || 0, 1); this.glow(g, e.x, e.y, e.r*(e.charge ? 0.5 + 0.6*k : 0.9*(1 - k)), e.col, e.charge ? 0.4*k : 0.55*A); }
      else if (e.type === 'b' && e.arc){ const a = e.a.call ? e.a() : e.a, b = e.b.call ? e.b() : e.b, n = 18, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, nx = -dy/d, ny = dx/d; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = A; g.lineCap = 'round'; g.lineJoin = 'round';
        for (const [w, c, j] of [[e.w*2.6, e.col, 6], [e.w, '#ffffff', 3]]){ g.strokeStyle = c; g.lineWidth = w; g.shadowColor = e.col; g.shadowBlur = 14; g.beginPath(); for (let i = 0; i <= n; i++){ const t = i/n, o = (i && i < n) ? rnd(-j, j) : 0; const x = a.x + dx*t + nx*o, y = a.y + dy*t + ny*o; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } g.restore(); }
      else if (e.type === 'b'){ g.globalAlpha = A; g.strokeStyle = e.col; g.lineWidth = e.w; g.lineCap = 'round'; g.shadowColor = e.col; g.shadowBlur = 12; const a = e.a.call ? e.a() : e.a, b = e.b.call ? e.b() : e.b; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = e.w*0.35; g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1; }
      else if (e.type === 'r') this.sprite(g, 'ac_fx_shock', k*9.9, e.x, e.y, e.r1*2, e.r1*2, 0, 0.95);
      else if (e.type === 'z'){ g.globalAlpha = A*0.85; const fl = 0.7 + Math.random()*0.3; const gr = g.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r); gr.addColorStop(0, e.col); gr.addColorStop(0.7, 'rgba(255,80,20,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(e.x, e.y, e.r*fl, e.r*0.7*fl, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
      else if (e.type === 'm'){ g.globalAlpha = 0.5 + 0.5*Math.sin(e.age*18); g.strokeStyle = '#ff3b2a'; g.lineWidth = 2; g.beginPath(); g.arc(e.x, e.y, 26 - 10*k, 0, TAU); g.moveTo(e.x - 34, e.y); g.lineTo(e.x + 34, e.y); g.moveTo(e.x, e.y - 34); g.lineTo(e.x, e.y + 34); g.stroke(); g.globalAlpha = 1; }
      else if (e.type === 'p') this.drawProj(g, e, k);
      else if (e.type === 'x' && e.draw) e.draw(g, e, k);
    }
    drawProj(g, e, k){
      g.save(); g.translate(e.x, e.y);
      switch (e.kind){
        case 'saw': { this.glow(g, 0, 0, e.r*2.4, 'rgba(255,110,50,.55)', 0.8); g.rotate(e.a); const gr = g.createRadialGradient(-e.r*0.35, -e.r*0.35, e.r*0.1, 0, 0, e.r*1.2); gr.addColorStop(0, '#f2eeea'); gr.addColorStop(0.55, '#8d8a90'); gr.addColorStop(1, '#2e282c'); g.fillStyle = gr; g.beginPath(); for (let i = 0; i < 24; i++){ const a = i/24*TAU, r = i % 2 ? e.r*0.82 : e.r*1.18; g.lineTo(Math.cos(a)*r, Math.sin(a)*r); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,190,150,.7)'; g.lineWidth = 1.2; g.stroke();
          const g2 = g.createRadialGradient(0, 0, 0, 0, 0, e.r*0.6); g2.addColorStop(0, '#ff9a60'); g2.addColorStop(0.5, '#7a1c14'); g2.addColorStop(1, '#2a0808'); g.fillStyle = g2; g.beginPath(); g.arc(0, 0, e.r*0.6, 0, TAU); g.fill(); this.glow(g, 0, 0, e.r*0.5, '#ffd090', 0.9); break; }
        case 'fire': { const rot = Math.atan2(e.vy, e.vx) - Math.PI/2; this.glow(g, 0, 0, e.r*2.2, 'rgba(255,110,40,.5)', 0.7*(1 - k)); this.sprite(g, 'ac_fx_flame', (e.age*18 + (e.seed || (e.seed = Math.random()*12))) % 12, 0, 0, e.r*3.6, e.r*5.4, rot, 1 - k*0.5, 0.5, 0.8); break; }
        case 'lava': { this.glow(g, 0, 0, e.r*3, 'rgba(255,90,30,.6)', 0.8); this.sprite(g, 'an_fx_orbHot', (e.age*14) % 8, 0, 0, e.r*5, e.r*10, e.vy > 0 ? 0 : Math.PI, 1, 0.5, 0.7); break; }
        case 'orb': { const rot = Math.atan2(e.vy, e.vx) - Math.PI/2; this.glow(g, 0, 0, e.r*2.2, 'rgba(255,60,40,.55)', 0.8*(1 - k*0.5)); this.sprite(g, 'an_fx_orbHot', (e.age*14) % 8, 0, 0, e.r*4.4, e.r*8.8, rot + Math.PI, 1, 0.5, 0.7); break; }
        case 'cube': { const T = this.scrapTex(); (e.h = e.h || []).push({ x:e.x, y:e.y }); if (e.h.length > 8) e.h.shift();
          e.h.forEach((q, i)=> this.glow(g, q.x - e.x, q.y - e.y, e.r*(0.6 + i*0.12), 'rgba(255,110,50,.7)', i/e.h.length*0.5));
          this.glow(g, 0, 0, e.r*2.8, 'rgba(255,100,40,.45)', 0.8); g.rotate(e.a); const sz = e.r*2.5;
          if (T.length){ const t = T[e.tid == null ? (e.tid = Math.random()*6 | 0) : e.tid]; g.drawImage(t, -sz/2, -sz/2, sz, sz); } else { g.fillStyle = '#5a5260'; g.fillRect(-sz/2, -sz/2, sz, sz); }
          g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,110,50,.7)'; g.lineWidth = 1.5; g.strokeRect(-sz/2, -sz/2, sz, sz); g.restore(); break; }
        case 'shard': { const a = Math.atan2(e.vy, e.vx); g.rotate(a); const tr = g.createLinearGradient(-e.r*6, 0, 0, 0); tr.addColorStop(0, 'rgba(255,120,60,0)'); tr.addColorStop(1, 'rgba(255,200,150,.6)'); g.fillStyle = tr; g.fillRect(-e.r*6, -1.5, e.r*6, 3); const gr = g.createLinearGradient(0, -e.r, 0, e.r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#8a8490'); g.fillStyle = gr; g.beginPath(); g.moveTo(e.r*1.8, 0); g.lineTo(-e.r, e.r*0.7); g.lineTo(-e.r*0.4, 0); g.lineTo(-e.r, -e.r*0.7); g.closePath(); g.fill(); this.glow(g, 0, 0, e.r*2.2, 'rgba(255,140,80,.5)', 0.8); break; }
        case 'tooth': { g.rotate(Math.atan2(e.vy, e.vx)); const tr = g.createLinearGradient(-e.r*7, 0, 0, 0); tr.addColorStop(0, 'rgba(255,60,30,0)'); tr.addColorStop(1, 'rgba(255,150,100,.7)'); g.fillStyle = tr; g.fillRect(-e.r*7, -2, e.r*7, 4); const gr = g.createLinearGradient(0, -e.r, 0, e.r); gr.addColorStop(0, '#f4efe8'); gr.addColorStop(1, '#6a6068'); g.fillStyle = gr; g.beginPath(); g.moveTo(e.r*1.5, 0); g.lineTo(-e.r, e.r*0.65); g.lineTo(-e.r, -e.r*0.65); g.closePath(); g.fill(); this.glow(g, e.r*1.1, 0, e.r*1.6, '#ff6a3a', 0.9); break; }
        case 'drone': { const rot = Math.atan2(e.vy, e.vx) + Math.PI/2; this.sprite(g, 'ac_fx_flame', (e.age*20) % 12, -Math.sin(rot)*-e.r, Math.cos(rot)*-e.r*1.1, e.r*1.4, e.r*2.2, rot + Math.PI, 0.9, 0.5, 0.85); g.rotate(rot); const gr = g.createLinearGradient(-e.r, 0, e.r, 0); gr.addColorStop(0, '#4a0e0c'); gr.addColorStop(0.5, '#b83a30'); gr.addColorStop(1, '#4a0e0c'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, e.r); g.lineTo(e.r*0.8, -e.r*0.8); g.lineTo(0, -e.r*0.3); g.lineTo(-e.r*0.8, -e.r*0.8); g.closePath(); g.fill(); g.strokeStyle = '#ff9a7a'; g.lineWidth = 1; g.stroke(); this.glow(g, 0, 0, e.r*1.2, '#7dff7a', 0.8); break; }
        case 'ship': { g.rotate(Math.PI); g.globalAlpha = e.alpha == null ? 1 : e.alpha; g.fillStyle = e.col || '#6a1814'; g.beginPath(); g.moveTo(0, -e.r); g.lineTo(e.r*0.9, e.r*0.8); g.lineTo(0, e.r*0.35); g.lineTo(-e.r*0.9, e.r*0.8); g.closePath(); g.fill(); g.strokeStyle = '#ff9a7a'; g.lineWidth = 2; g.stroke(); break; }
        case 'smoke': { const R = e.r*(1.2 + k); const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, 'rgba(30,18,20,.6)'); gr.addColorStop(1, 'rgba(30,18,20,0)'); g.globalAlpha = 1 - k; g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); break; }
        case 'spark': { const c = e.col || '#ffb050'; this.glow(g, 0, 0, e.r*3.2, c, (1 - k)*0.9); this.glow(g, 0, 0, e.r*1.1, '#ffffff', 1 - k); break; }
        case 'plus': { this.glow(g, 0, 0, 14, 'rgba(120,255,120,.6)', 1 - k); g.globalAlpha = 1 - k; g.fillStyle = '#d8ffd0'; g.fillRect(-1.5, -6, 3, 12); g.fillRect(-6, -1.5, 12, 3); break; }
        case 'puff': { const R = e.r*(1 + k*1.5); const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, 'rgba(210,140,100,.55)'); gr.addColorStop(1, 'rgba(210,140,100,0)'); g.globalAlpha = 1 - k; g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); break; }
      }
      g.restore();
    }
  }
  // dans les scripts, `s.flash(x, y, col, r, life, follow)` crée une lueur (comme sur la page) : la propriété d'impact blanc s'appelle donc `hitFlash`
  W2Stage.prototype.flash = function(x, y, col, r, life, follow){ return this.flash_(x, y, col, r, life, follow); };

  mixin(GameScene, {
    /* ---------- création ---------- */
    w2Start(id){
      if (this.w2) return; const cfg = BOSS_W2[id]; if (!cfg) return;
      const vx = this.visibleXRange(0), vy = this.visibleYRange(0), U = (vx.max - vx.min)/PW, H = (vy.max - vy.min)/U;
      const st = new W2Stage(this, cfg, PW, H, U); st.flash = function(x, y, col, r, life, follow){ return this.flash_(x, y, col, r, life, follow); };
      const w2 = this.w2 = { id, cfg, st, hp:cfg.hp, max:cfg.hp, mode:'enter', t:0, ox:vx.min, oy:vy.min, U, S:U, dead:false, hitT:0, key:'w2cv' + (this._w2N = (this._w2N || 0) + 1), lastWound:0 };
      w2.tex = this.textures.addCanvas(w2.key, st.cv); w2.im = this.add.image(vx.min, vy.min, w2.key).setOrigin(0, 0).setDepth(5);
      const lab = document.getElementById('bossLabel'), fill = document.getElementById('bossHpFill');
      if (lab) lab.textContent = cfg.label; if (fill){ fill.style.width = '100%'; fill.className = 'boss-hp-fill'; }
      this.w2Sfx(cfg.sfx + 'Roar', null);
    },
    w2Sfx(name, x){ try { if (name && sfx[name]) sfx[name]({ pan:x == null ? 0 : this.panOf(x) }); } catch(e){ /* ignore */ } },
    // coordonnées : page <-> monde
    w2W(px, py){ const w = this.w2; return [w.ox + px*w.U, w.oy + py*w.U]; },
    w2P(wx, wy){ const w = this.w2; return [(wx - w.ox)/w.U, (wy - w.oy)/w.U]; },
    w2Solid(px, py){ const st = this.w2.st; if (!st.ready) return false; const sx = Math.round((px - st.bx)/K + 256), sy = Math.round(256 - (py - st.by)/K); return sx >= 0 && sy >= 0 && sx < 512 && sy < 512 && st.mask[(sy*512 + sx)*4 + 3] > 128; },
    w2HullPoint(){ const w = this.w2, st = w.st, o = st.op[Phaser.Math.Between(0, st.op.length - 1)], p = st.P(o[0], o[1]); return this.w2W(p.x, p.y); },
    w2Boom(x, y, size, snd){
      const big = size > 360; this.acFx(big ? 'arFxBoomL' : 'brFxBoom', big ? 'arBoomL' : 'explodeBras', x, y, size/(big ? 256 : 160)*1.15, { depth:8 });
      if (size > 500) this.acFx('arFxShock', 'arShock', x, y, size/190, { depth:8 }); if (snd) this.w2Sfx(snd, x);
    },
    w2Stage(pct){ const t = this.w2.cfg.thresh; return pct > t[0] ? 0 : pct > t[1] ? 1 : 2; },

    /* ---------- dégâts reçus ---------- */
    w2Damage(x, y, d, crit){
      const w = this.w2; if (w.dead || w.mode === 'dying') return; const st = w.st, p = w.cfg.sfx;
      if (w.hitT <= 0 || crit){ st.hitFlash = crit ? 1 : 0.5; w.hitT = 0.07; }
      this.acFx('acFxImpact', 'acImpact', x, y, crit ? 0.9 : 0.55); this.spawnHitParticles(x, y, crit ? 6 : 3);
      if (crit){ this.juiceShake(0.12); this.w2Sfx(p + 'HitHeavy', x); } else this.w2Sfx(p + 'Hit', x);
      if (w.mode === 'enter') return;           // en approche : dégâts visuels seulement
      w.hp = Math.max(0, w.hp - d); st.hp = w.hp/w.max;
      const ns = w.hp <= 0 ? 2 : this.w2Stage(w.hp/w.max*100); if (ns > w.lastWound) this.w2Wound(ns);
      const fill = document.getElementById('bossHpFill'); if (fill) fill.style.width = Math.max(0, w.hp/w.max*100) + '%';
      if (w.hp <= 0) this.w2Die();
    },
    w2Wound(ns){
      const w = this.w2; w.lastWound = ns; this.cameras.main.shake(300, 0.012); this.juiceStop && this.juiceStop('bossPhase');
      for (let k = 0; k < 3; k++){ const [bx, by] = this.w2HullPoint(); this.w2Boom(bx, by, 200, k === 0 ? w.cfg.sfx + 'Wound' : ''); }
      const fill = document.getElementById('bossHpFill'); if (fill) fill.className = 'boss-hp-fill p' + Math.min(3, ns);
      w.st.hurtRed = ns >= 2;
    },
    w2Hits(){         // tirs du joueur : un coup touche si le point est sur la coque (masque du sprite) ; le point faible donne un coup critique
      const w = this.w2, st = w.st, weak = st.cfg.anchors[WEAK[w.id]];
      const test = (list, missile)=>{ list.children.iterate(b=>{
        if (!b || !b.active) return; const [px, py] = this.w2P(b.x, b.y); if (!this.w2Solid(px, py) || b._tH === w) return;
        const sx = (px - st.bx)/K + 256, sy = 256 - (py - st.by)/K, keep = (b.pierceLeft || 0) > 0, crit = Math.hypot(sx - weak[0], sy - weak[1]) < 56;
        if (missile) this.explodeFx(b.x, b.y, 50);
        this.w2Damage(b.x, b.y, (b.damage || (missile ? 20 : 10))*(crit ? CRIT_MUL : 1), crit);
        if (keep){ b.pierceLeft--; b._tH = w; } else if (b.active) b.destroy();
      }); };
      test(this.playerBullets, false); test(this.missiles, true);
    },

    /* ---------- dégâts infligés au joueur ---------- */
    w2Collide(){
      const w = this.w2, st = w.st, pl = this.player; if (!pl || !pl.active || w.mode !== 'play') return;
      const pp = st.pl, D = w.cfg.dmg, hurt = n=> this.damagePlayer(D[n]);
      for (const e of st.fx){
        if (e.type === 'p'){ const dm = D[e.kind]; if (!dm || e.harm === false || e.age < 0.05) continue; const R = e.r*(e.kind === 'fire' ? 1.3 : 0.95) + 9;
          if ((pp.x - e.x)**2 + (pp.y - e.y)**2 < R*R){ hurt(e.kind); if (e.kind !== 'saw') e.age = e.life; } }
        else if (e.type === 'z' && D.zone){ const R = e.r*0.8; if (e.age > 0.15 && ((pp.x - e.x)/R)**2 + ((pp.y - e.y)/(R*0.7))**2 < 1) hurt('zone'); }
        else if (e.type === 'b' && e.hurt && D.beam){ const a = e.a.call ? e.a() : e.a, b = e.b.call ? e.b() : e.b, dx = b.x - a.x, dy = b.y - a.y, L2 = dx*dx + dy*dy || 1, t = clampv(((pp.x - a.x)*dx + (pp.y - a.y)*dy)/L2, 0, 1);
          if ((pp.x - (a.x + dx*t))**2 + (pp.y - (a.y + dy*t))**2 < (e.w*0.8 + 9)**2 && e.age > 0.1) hurt('beam'); }
        else if (e.type === 'x' && e.hurt && D.piston && Math.abs(pp.x - e.px) < 40 && pp.y > e.py0 && pp.y < e.py1 + 40) hurt('piston');
      }
      if (this.w2Solid(pp.x, pp.y)) hurt('contact');
    },

    /* ---------- à chaque image ---------- */
    w2Update(delta){
      const w = this.w2; if (!w || (w.dead && !w.st.dead)) return; const st = w.st, pl = this.player, dt = Math.min(0.05, delta/1000);
      if (st.ready){
        if (pl) [st.pl.x, st.pl.y] = this.w2P(pl.x, pl.y);
        w.hitT = Math.max(0, w.hitT - dt); if (st.hitFlash > 0) st.hitFlash = Math.max(0, st.hitFlash - dt*7);
        if (w.mode === 'enter'){ w.t += dt; const k = Math.min(1, w.t/ENTER_T); st.by = lerp(-260, 190, 1 - Math.pow(1 - k, 3)); st.bx = st.W/2; this.cameras.main.shake(40, 0.002);
          if (k >= 1){ w.mode = 'play'; this.cameras.main.shake(200, 0.006); const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.add('show'); } }
        if (w.mode === 'play'){ st.update(dt*SPEED[w.lastWound], 'play'); this.w2Hits(); this.w2Collide();
          if (st.pull && pl){ const [bx] = this.w2W(st.bx, 0); pl.x += (bx - pl.x)*dt*0.5*st.pull; }
          st.escorts.forEach(e=>{ if (e.en && e.en.active){ [e.px, e.py] = this.w2P(e.en.x, e.en.y);
            if (st.grab){ const a = st.A('skip'), [tx, ty] = this.w2W(a.x, a.y); e.en.x += (tx - e.en.x)*dt*4; e.en.y += (ty - e.en.y)*dt*4; if (e.en.body) e.en.body.setVelocity(0, 0); } if (e.healing > 0){ e.healing -= dt; e.en.hp = Math.min(e.en.maxHp, e.en.hp + e.en.maxHp*dt*0.35); } } }); }
        else if (w.mode === 'dying') this.w2DyingStep(dt);
        else if (w.mode === 'enter'){ st.update(dt, 'enter'); this.w2Hits(); }
        if (st.shake > 0.05){ this.cameras.main.shake(100, 0.006*st.shake); st.shake = Math.max(0, st.shake - dt*1.6); }
        const fill = document.getElementById('bossHpFill'); if (fill && w.mode === 'play') fill.style.width = Math.max(0, w.hp/w.max*100) + '%';
      }
      st.draw(); w.tex.refresh();
    },

    /* ---------- mort : cascade d'explosions, puis la coque éclate ---------- */
    w2Die(){
      const w = this.w2; if (w.mode === 'dying' || w.dead) return; const st = w.st;
      w.mode = 'dying'; w.dieT = 0; st.cur = -1; st.timers = []; st.fx = st.fx.filter(e=> e.type === 'p' && e.harm === false || e.type === 'x' && !e.hurt && !e.draw);
      st.escorts.forEach(e=>{ if (e.en && e.en.active) e.en.hp = 0; });
      this.enemyBullets.children.iterate(b=>{ if (b) b.destroy(); });
      const wrap = document.getElementById('boss-hp-wrap'); if (wrap) wrap.classList.remove('show');
      this.startSlowmo && this.startSlowmo(1500, 0.5); this.juiceStop && this.juiceStop('bossKill'); this.w2Sfx(w.cfg.sfx + 'Roar', null);
    },
    w2DyingStep(dt){
      const w = this.w2, st = w.st; st.update(dt*0.5, 'dying'); w.dieT += dt; st.shake = 0.5;
      w._ex = (w._ex || 0) + dt; while (w._ex >= 0.1){ w._ex -= 0.1; const [x, y] = this.w2HullPoint(); this.w2Boom(x, y, Phaser.Math.Between(150, 280), Math.random() < 0.3 ? w.cfg.sfx + 'Wound' : '');
        const f = this.acFx('acFxFlame', 'acFlame', x, y + 8, 0.9*w.U*1.4, { loop:true, vy:-8 }); this.time.delayedCall(900, ()=>{ if (f && f.active) f.destroy(); }); this.acFx('acFxSpark', 'acSpark', x, y, 1.4); }
      if (w.dieT > 2.4) this.w2Dead();
    },
    w2Dead(){
      const w = this.w2; if (w.dead) return; w.dead = true; bestiaryBossKill(this, w.id); const st = w.st, [cx, cy] = this.w2W(st.bx, st.by);
      st.shatter(); st.shake = 1;
      this.cameras.main.flash(700, 255, 255, 255, false); this.cameras.main.shake(1100, 0.016);
      this.w2Boom(cx, cy, 1000, w.cfg.sfx + 'Boom'); this.w2Boom(cx, cy, 560, ''); this.w2Boom(cx - 70, cy - 50, 420, ''); this.w2Boom(cx + 70, cy + 50, 420, ''); this.w2Boom(cx, cy + 80, 380, '');
      this.time.delayedCall(250, ()=>{ this.w2Boom(cx - 90, cy + 40, 360, ''); this.w2Boom(cx + 90, cy - 40, 360, ''); }); this.time.delayedCall(550, ()=>{ this.w2Boom(cx, cy, 700, w.cfg.sfx + 'Wound'); });
      for (let k = 0; k < 24; k++) this.acFx('acFxSpark', 'acSpark', cx + Phaser.Math.Between(-80, 80), cy + Phaser.Math.Between(-80, 80), Phaser.Math.FloatBetween(0.9, 1.7));
      this.composantShower(cx, cy, COMP.miniBossBig); this.score += w.cfg.killScore;
      this.time.delayedCall(2600, ()=>{ if (this.running) this.levelWin(); });
      w.keepDraw = true;
    },
    w2Cleanup(){ const w = this.w2; if (!w) return; try { w.im.destroy(); this.textures.remove(w.key); } catch(e){ /* ignore */ } },
  });
})();
