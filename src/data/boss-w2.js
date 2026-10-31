"use strict";
// Les 5 boss du secteur 2 (La Casse lunaire, déco rouge/noir « Mars ») : pièces mobiles, jeu de lumières, attaques scriptées. Moteur : bosses/w2.js (état dans `this.w2`).
// Les scripts d'attaque sont ceux de la page validée par Bio (sprite-factory/assets/boss_w2/mars/boss.js) : ils tournent en unités de page (largeur 520) ; `s.W` / `s.H` sont la largeur / hauteur du terrain
// dans ces unités (H dépend du zoom du niveau). `s.snd(nom)` joue un son du boss (SFX_FILES, préfixes cb / ic / bn / by / rp).
// Chaque boss : id (clé de `finalBoss`), sprite `w2_<tex>.webp` (512x512, nez en haut, affiché retourné), PV, dégâts par genre de projectile, anchors / parts / over / attacks.
const BOSS_W2 = (()=>{
  const TAU = Math.PI*2, DOWN = Math.PI/2, rnd = (a, b)=> a + Math.random()*(b - a), lerp = (a, b, t)=> a + (b - a)*t, clamp = (v, a, b)=> Math.max(a, Math.min(b, v));
  const ease = t=> t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
  const P = s=> ({ x:s.pl.x, y:s.pl.y });
  const fan = (s, from, n, spread, base, sp, mk)=>{ for (let i = 0; i < n; i++){ const a = base + (i/(n - 1) - 0.5)*spread; s.proj(Object.assign({ x:from.x, y:from.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:3 }, mk)); } };
  const lob = (s, from, to, kind, r, T, onDie)=>{ s.mark(to.x, to.y, T); s.proj({ kind, r, x:from.x, y:from.y, life:T, spin:6, a:0, sx:from.x, sy:from.y, tx:to.x, ty:to.y, upd(e){ const k = e.age/T; e.x = lerp(e.sx, e.tx, k); e.y = lerp(e.sy, e.ty, k) - Math.sin(k*Math.PI)*150; }, onDie }); };
  const glowAt = (s, g, a, r, col, al)=> s.glow(g, a.x, a.y, r, col, al);

  return {
  crabe: { sfx:'cb', tex:'crabe', hp:1000, thresh:[66, 33], label:'LE CRABE A SCIES', seed:11, dmg:{ saw:16, shard:9, spark:0, contact:14 }, killScore:900,
    anchors:{ clawL:[225, 80], clawR:[290, 80], core:[256, 300] },
    parts:[
      { type:'poly', pts:[[88,112],[125,68],[190,60],[238,66],[240,112],[208,150],[196,198],[108,194],[84,150]], pivot:[170, 200], fn:s=>({ rot:Math.sin(s.t*1.7)*0.04 - (s.pose.open || 0)*0.14 + (s.pose.snap || 0)*0.2 }) },
      { type:'poly', pts:[[274,66],[330,60],[398,68],[432,112],[430,160],[420,198],[330,198],[318,150],[274,112]], pivot:[350, 200], fn:s=>({ rot:-Math.sin(s.t*1.7 + 0.6)*0.04 + (s.pose.open || 0)*0.14 - (s.pose.snap || 0)*0.2 }) },
      { type:'circle', c:[115, 345], r:56, pivot:[160, 300], fn:s=>({ rot:Math.sin(s.t*2.3)*0.05 }) },
      { type:'circle', c:[400, 345], r:56, pivot:[355, 300], fn:s=>({ rot:-Math.sin(s.t*2.3 + 1)*0.05 }) },
    ],
    over(s, g){ glowAt(s, g, s.A('clawL'), 22, 'rgba(255,90,40,.5)', 0.5 + 0.5*Math.sin(s.t*4)); glowAt(s, g, s.A('clawR'), 22, 'rgba(255,90,40,.5)', 0.5 + 0.5*Math.sin(s.t*4 + 1)); },
    death:{
      agony(s){ s.tw('open', 1, 0.3); for (let i = 0; i < 10; i++) s.at(0.15 + i*0.22, ()=>{ const q = s.hull(); s.burst(q.x, q.y, 10, '#ffd090', 280, 0.6); s.debris(1); s.boom(q.x, q.y, rnd(90, 150)); if (i % 3 === 0) s.snd('cbClang'); });
        for (let i = 0; i < 5; i++) s.at(0.3 + i*0.42, ()=>{ s.tw('snap', i % 2 ? 0 : 1, 0.1); s.ring(s.bx, s.by + 60, 80 + i*14, 0.35, '#ffd090'); }); },
      final(s){ for (const nm of ['clawL', 'clawR']){ const p = s.A(nm); s.debris(3, { from:p, big:true }); s.burst(p.x, p.y, 26, '#ffd090', 360, 1); s.ring(p.x, p.y, 120, 0.5, '#ffb060'); }
        fan(s, { x:s.bx, y:s.by }, 18, TAU, 0, 300, { kind:'shard', r:6, harm:false }); s.at(0.2, ()=> fan(s, { x:s.bx, y:s.by }, 14, TAU, 0.2, 220, { kind:'shard', r:5, harm:false })); } },
    attacks:[
      { name:'Scies boomerang', dur:4.2,
        go(s){ s.tw('open', 1, 0.6); s.at(0.7, ()=> s.tw('open', 0, 0.25)); s.snd('cbCharge');
          for (const nm of ['clawL', 'clawR']){ s.flash(0, 0, '#ffb060', 46, 0.7, nm).charge = true;
            s.at(0.7, ()=>{ const a = s.A(nm), t = P(s); s.burst(a.x, a.y, 10, '#ffd090', 220, 0.5); s.snd('cbSaw');
              s.proj({ kind:'saw', r:24, x:a.x, y:a.y, life:2.6, spin:14, sx:a.x, sy:a.y, tx:t.x + (nm === 'clawL' ? -60 : 60), ty:t.y - 80,
                upd(e){ const k = e.age/2.6, out = k < 0.5 ? ease(k/0.5) : 1 - ease((k - 0.5)/0.5); const b = s.A('core'); e.x = lerp(b.x, e.tx, out) + Math.sin(k*6)*20*out; e.y = lerp(b.y, e.ty, out); if (Math.random() < 0.5) s.proj({ kind:'spark', x:e.x, y:e.y, vx:rnd(-40, 40), vy:rnd(-40, 40), life:0.3, r:2 }); } }); }); }
          s.at(2.0, ()=> s.snd('cbSawBack')); } },
      { name:'Charge en crabe', dur:4.4,
        go(s){ const left = s.bx > s.W/2; s.moveTo(left ? 60 : s.W - 60, 200, 0.8); s.at(0.8, ()=>{ s.mark(left ? s.W - 60 : 60, s.by + 80, 0.5); s.snd('cbStep'); });
          s.at(1.3, ()=>{ s.moveTo(left ? s.W - 60 : 60, 215, 0.55); s.snd('cbDash'); for (let i = 0; i < 20; i++) s.at(i*0.028, ()=>{ s.burst(s.bx, s.by + 70, 3, '#ffc070', 200, 0.5); }); }); s.at(2.6, ()=> s.moveTo(s.W/2, 215, 1.3)); } },
      { name:'Claquement', dur:3.6,
        go(s){ for (let b = 0; b < 2; b++) s.at(b*1.3, ()=>{ s.tw('open', 1, 0.45); s.snd('cbCharge'); s.flash(0, 0, '#ffe0a0', 60, 0.5, 'clawL').charge = true; s.flash(0, 0, '#ffe0a0', 60, 0.5, 'clawR').charge = true; });
          for (let b = 0; b < 2; b++) s.at(0.5 + b*1.3, ()=>{ s.tw('open', 0, 0.06); s.tw('snap', 1, 0.06); s.at(0.2, ()=> s.tw('snap', 0, 0.5)); s.snd('cbClang');
            const a = s.A('clawL'), c = s.A('clawR'), m = { x:(a.x + c.x)/2, y:(a.y + c.y)/2 + 20 }; s.ring(m.x, m.y, 70, 0.35, '#ffd090'); fan(s, m, 9, 1.4, DOWN, 260 - b*30, { kind:'shard', r:6 }); s.shake = 0.4; }); } },
    ] },

  incinerateur: { sfx:'ic', tex:'incinerateur', hp:1100, thresh:[66, 33], label:"L'INCINERATEUR", seed:23, dmg:{ fire:7, orb:10, lava:14, shard:8, zone:6, contact:15 }, killScore:1000,
    anchors:{ core:[262, 256] },
    parts:[{ type:'circle', c:[262, 256], r:94, pivot:[262, 256], fn:s=>({ rot:s.t*(0.25 + (s.pose.heat || 0)*2.2) }) }],
    over(s, g){ const h = s.pose.heat || 0, c = s.A('core'); s.glow(g, c.x, c.y, 120*s.K + h*40, 'rgba(255,120,40,.8)', 0.35 + 0.15*Math.sin(s.t*3) + h*0.45); if (h > 0.3) s.glow(g, c.x, c.y, 50*s.K, '#fff0c0', h*0.8);
      [[140,60],[190,60],[340,60],[390,120],[140,125]].forEach((q, i)=>{ const p = s.P(q[0], q[1]); s.glow(g, p.x, p.y, 16, 'rgba(255,150,50,.9)', 0.45 + 0.55*Math.max(0, Math.sin(s.t*5 + i*1.3))); }); },
    death:{
      agony(s){ s.tw('heat', 1, 1.2); s.snd('icHeat');
        for (let i = 0; i < 14; i++) s.at(0.1 + i*0.16, ()=>{ const q = s.hull(), a = Math.atan2(q.y - s.by, q.x - s.bx); for (let k = 0; k < 6; k++){ const aa = a + rnd(-0.5, 0.5), v = rnd(180, 380); s.proj({ kind:'fire', r:rnd(8, 12), x:q.x, y:q.y, vx:Math.cos(aa)*v, vy:Math.sin(aa)*v - 40, life:rnd(0.6, 1.0), harm:false }); } s.boom(q.x, q.y, rnd(80, 140)); if (i % 4 === 0) s.snd('icFlame'); });
        s.at(1.7, ()=>{ s.flash(0, 0, '#fff0c0', 190, 0.7, 'core').charge = true; }); },
      final(s){ const c = s.A('core'); s.snd('icRing'); for (let r = 0; r < 3; r++) s.at(r*0.18, ()=>{ s.ring(c.x, c.y, 160 + r*90, 0.7, '#ff9a30'); });
        for (let i = 0; i < 90; i++){ const a = rnd(0, TAU), v = rnd(220, 560); s.proj({ kind:'fire', r:rnd(8, 14), x:c.x, y:c.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:rnd(1.0, 1.7), harm:false }); }
        for (let i = 0; i < 8; i++){ const a = -DOWN + rnd(-0.9, 0.9), v = rnd(200, 380); s.proj({ kind:'lava', r:13, x:c.x, y:c.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, ay:420, life:1.6, harm:false }); } } },
    attacks:[
      { name:'Lance-flammes', dur:4.6,
        go(s){ s.tw('heat', 1, 0.9); s.at(3.9, ()=> s.tw('heat', 0, 1)); s.flash(0, 0, '#fff0a0', 100, 0.9, 'core').charge = true; s.snd('icHeat'); const t0 = 0.9, D = 2.4; s.at(t0, ()=> s.snd('icFlame'));
          for (let i = 0; i < 150; i++) s.at(t0 + i/150*D, ()=>{ const sw = Math.sin(((s.curT - t0)/D)*Math.PI - Math.PI/2)*0.85; const c = s.A('core'), a = DOWN + sw + rnd(-0.12, 0.12), v = rnd(430, 570);
            s.proj({ kind:'fire', r:rnd(8, 13), x:c.x, y:c.y + 30, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:rnd(1.25, 1.65) }); }); } },
      { name:'Anneau de fournaise', dur:4.2,
        go(s){ for (let r = 0; r < 3; r++){ s.at(r*0.8, ()=>{ s.tw('heat', 1, 0.4); s.flash(0, 0, '#ffcc60', 80, 0.45, 'core').charge = true; }); s.at(r*0.8 + 0.5, ()=> s.tw('heat', 0.2, 0.3));
          s.at(r*0.8 + 0.45, ()=>{ s.snd('icRing'); const c = s.A('core'), gap = Math.atan2(s.pl.y - c.y, s.pl.x - c.x) + rnd(-0.5, 0.5); s.ring(c.x, c.y, 90, 0.3, '#ff9a30'); const N = 30;
            for (let i = 0; i < N; i++){ const a = i/N*TAU; if (Math.abs(Math.atan2(Math.sin(a - gap), Math.cos(a - gap))) < 0.42) continue; s.proj({ kind:'orb', r:9, x:c.x, y:c.y, vx:Math.cos(a)*240, vy:Math.sin(a)*240, life:3.4 }); } }); } } },
      { name:'Boules de lave', dur:4.8,
        go(s){ s.tw('heat', 0.5, 0.5); s.at(3.4, ()=> s.tw('heat', 0, 1)); for (let i = 0; i < 4; i++){ s.at(i*0.6, ()=>{ const c = s.A('core'), t = { x:clamp(s.pl.x + rnd(-110, 110), 40, s.W - 40), y:clamp(s.pl.y - rnd(0, 120), s.H*0.5, s.H - 50) };
            s.flash(c.x, c.y, '#ffb050', 50, 0.3); s.snd('icLava'); lob(s, c, t, 'lava', 13, 1.2, e=>{ s.snd('icSplash'); s.impact(e.tx, e.ty, 120); s.zone(e.tx, e.ty, 46, 2.6, '#ffb040'); s.burst(e.tx, e.ty, 10, '#ff9a30', 200, 0.6); }); }); } } },
    ] },

  benne: { sfx:'bn', tex:'benne', hp:1200, thresh:[66, 33], label:'LA BENNE FOLLE', seed:37, dmg:{ cube:12, shard:8, contact:16 }, killScore:1100,
    anchors:{ cab:[256, 170], blade:[256, 22], skip:[256, 400], hopperL:[200, 380], hopperR:[312, 380] },
    parts:[{ type:'poly', pts:[[170,340],[342,340],[342,472],[170,472]], pivot:[256, 400], fn:s=>({ dx:Math.sin(s.t*38)*(0.6 + (s.pose.rush || 0)*1.6), dy:Math.cos(s.t*31)*(0.5 + (s.pose.rush || 0)*1.2) }) }],
    over(s, g){ const sp = (3 + (s.pose.rush || 0)*14)*s.t*14, si = s.pose.siren || 0;
      for (const x of [102, 412]) for (const [y0, y1] of [[75, 205], [245, 415]]){ for (let y = y0 - (sp % 14); y < y1; y += 14){ if (y < y0) continue; const a = s.P(x - 17, y), b = s.P(x + 17, y); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(a.x, a.y - 1, b.x - a.x, 2); } }
      [[200, 26], [256, 26], [312, 26]].forEach((q, i)=>{ const p = s.P(q[0], q[1]), on = Math.sin(s.t*12 + i*2.1) > 0; s.glow(g, p.x, p.y, 20 + si*14, i === 1 ? '#ffb020' : '#ff2a20', (0.25 + si*0.75)*(on ? 1 : 0.25)); }); },
    death:{
      agony(s){ s.tw('siren', 1, 0.2); s.tw('rush', 0.7, 0.3); s.snd('bnSiren');
        for (let i = 0; i < 9; i++) s.at(0.1 + i*0.25, ()=>{ const p = s.P(256 + rnd(-70, 70), 40 + i*50), hl = s.A('hopperL'), hr = s.A('hopperR'); s.boom(p.x, p.y, rnd(100, 170)); s.burst(p.x, p.y, 8, '#ffa060', 240, 0.6);
          for (let k = 0; k < 4; k++){ const h = k % 2 ? hl : hr; s.proj({ kind:'cube', r:rnd(5, 9), x:h.x, y:h.y, vx:rnd(-220, 220), vy:rnd(-330, -120), ay:720, life:1, spin:rnd(-12, 12), harm:false }); } if (i % 3 === 0) s.snd('bnLand'); });
        for (let i = 0; i < 4; i++) s.at(0.2 + i*0.5, ()=> s.debris(1, { big:true })); },
      final(s){ const b = s.A('skip'); s.snd('bnSlam'); s.shake = 1; for (let i = 0; i < 4; i++) s.at(i*0.12, ()=> s.ring(b.x, b.y, 120 + i*70, 0.5, '#ffd090'));
        fan(s, b, 22, 2.4, -DOWN, 380, { kind:'cube', r:10, spin:8, ay:520, life:1.5, harm:false }); for (let i = 0; i < 12; i++) s.proj({ kind:'puff', x:b.x + rnd(-90, 90), y:b.y + rnd(-40, 40), vx:rnd(-60, 60), vy:rnd(-60, 20), life:1.1, r:rnd(14, 26), harm:false }); } },
    attacks:[
      { name:'Charge du bulldozer', dur:4.4,
        go(s){ s.tw('siren', 1, 0.1); s.at(1.9, ()=> s.tw('siren', 0, 0.6)); s.at(1.2, ()=> s.tw('rush', 1, 0.4)); s.at(2.6, ()=> s.tw('rush', 0, 0.8)); s.snd('bnSiren'); s.moveTo(s.bx, 165, 0.6); for (let i = 0; i < 6; i++) s.at(i*0.12, ()=> s.flash(0, 0, i % 2 ? '#ff3020' : '#ffd040', 40, 0.12, 'cab'));
          s.at(0.8, ()=> s.mark(s.pl.x, s.H - 170, 0.5)); s.at(1.2, ()=>{ s.snd('bnRush'); s.moveTo(clamp(s.pl.x, 120, s.W - 120), s.H - 240, 0.5); for (let i = 0; i < 18; i++) s.at(i*0.03, ()=>{ const a = s.A('blade'); s.proj({ kind:'puff', x:a.x + rnd(-60, 60), y:a.y, vx:rnd(-30, 30), vy:rnd(-40, 20), life:0.7, r:rnd(8, 16) }); }); });
          s.at(1.8, ()=>{ s.shake = 0.5; s.snd('bnSlam'); s.ring(s.bx, s.by + 120, 150, 0.4, '#ffb070'); }); s.at(2.4, ()=> s.moveTo(s.W/2, 215, 1.4)); } },
      { name:'Compactage', dur:6.6,
        go(s){ s.tw('siren', 1, 0.2); s.at(3.2, ()=> s.tw('siren', 0, 0.6)); s.snd('bnSiren'); s.callEscort(3, false);      // de vrais mobs du niveau sont agrippés par la benne, puis écrasés
          s.at(1.2, ()=>{ s.snd('bnGrab'); s.grab = true; for (const sh of s.escortList()) s.beam(()=> s.A('cab'), ()=> ({ x:sh.px, y:sh.py }), '#ffd040', 3, 1.2); });
          s.at(2.4, ()=>{ s.grab = false; const b = s.A('skip'); s.snd('bnCrush'); s.ring(b.x, b.y, 70, 0.4, '#ffd090'); s.shake = 0.4; s.crushEscort(); });
          for (let i = 0; i < 3; i++) s.at(3.4 + i*0.7, ()=>{ const from = s.A(i % 2 ? 'hopperL' : 'hopperR'), t = { x:clamp(s.pl.x + rnd(-40, 40), 40, s.W - 40), y:clamp(s.pl.y - rnd(0, 60), s.H*0.56, s.H - 50) }; s.flash(from.x, from.y, '#ffe0a0', 40, 0.25); s.snd('bnLaunch');
            lob(s, from, t, 'cube', 18, 1.1, e=>{ s.snd('bnLand'); s.ring(e.tx, e.ty, 70, 0.4, '#c09070'); s.impact(e.tx, e.ty, 120); s.shake = 0.25; for (let k = 0; k < 6; k++) s.proj({ kind:'cube', r:rnd(4, 6), x:e.tx, y:e.ty, vx:rnd(-170, 170), vy:rnd(-280, -110), ay:700, life:0.8, spin:rnd(-12, 12), harm:false }); s.burst(e.tx, e.ty, 8, '#ffa060', 200, 0.5); }); }); } },
      { name:'Rafale de ferraille', dur:3.4,
        go(s){ for (let b = 0; b < 3; b++){ s.at(b*0.8, ()=>{ s.snd('bnCharge'); s.flash(0, 0, '#ffb060', 46, 0.3, 'blade').charge = true; }); s.at(b*0.8 + 0.3, ()=>{ s.snd('bnBurst'); fan(s, s.A('blade'), 7 + b*2, 1.0, DOWN + (b - 1)*0.1, 280, { kind:'cube', r:10, spin:8 }); }); } } },
    ] },

  broyeur: { sfx:'by', tex:'broyeur', hp:1300, thresh:[66, 33], label:'LE BROYEUR', seed:41, dmg:{ tooth:10, shard:8, piston:22, contact:16 }, killScore:1200,
    anchors:{ rollL:[160, 255], rollR:[388, 255], head:[270, 40], hatch:[270, 420], mid:[272, 255] },
    parts:[
      { type:'circle', c:[160, 255], r:84, pivot:[160, 255], fn:s=>({ rot:s.rollA }) },
      { type:'circle', c:[388, 255], r:84, pivot:[388, 255], fn:s=>({ rot:-s.rollA }) },
    ],
    over(s, g){ const sp = s.pose.spin || 0; for (const nm of ['rollL', 'rollR']){ const c = s.A(nm); if (sp > 1) s.glow(g, c.x, c.y, 60, 'rgba(255,90,40,.7)', Math.min(1, sp/14)*0.7); }
      const h = s.P(270, 44); s.glow(g, h.x, h.y, 22, 'rgba(255,60,40,.9)', 0.5 + 0.5*Math.sin(s.t*4)); },
    death:{
      agony(s){ s.tw('spin', 30, 1.2); s.snd('bySpin');
        for (let i = 0; i < 12; i++) s.at(0.12 + i*0.19, ()=>{ for (const nm of ['rollL', 'rollR']){ const c = s.A(nm); fan(s, c, 7, TAU, rnd(0, TAU), rnd(220, 340), { kind:'tooth', r:7, spin:10, life:1.4, harm:false }); s.ring(c.x, c.y, 50, 0.22, '#ff7a40'); } const q = s.hull(); s.boom(q.x, q.y, rnd(90, 150)); s.debris(1); if (i % 3 === 0) s.snd('byTooth'); }); },
      final(s){ for (let v = 0; v < 3; v++) s.at(v*0.2, ()=>{ for (const nm of ['rollL', 'rollR']){ const c = s.A(nm); s.snd('bySlam'); fan(s, c, 20, TAU, v*0.3, 300 + v*60, { kind:'tooth', r:8, spin:10, life:2, harm:false }); s.ring(c.x, c.y, 110 + v*40, 0.5, '#ff8a50'); s.debris(2, { from:c, big:true }); } }); } },
    attacks:[
      { name:'Rotors à dents', dur:4.6,
        go(s){ s.tw('spin', 14, 0.9); s.at(2.9, ()=> s.tw('spin', 0, 1.2)); s.snd('bySpin'); for (const nm of ['rollL', 'rollR']) s.flash(0, 0, '#ff6a30', 70, 0.9, nm).charge = true;
          for (let v = 0; v < 3; v++) s.at(0.9 + v*0.55, ()=>{ s.snd('byTooth'); for (const nm of ['rollL', 'rollR']){ const c = s.A(nm), off = v*0.26; for (let i = 0; i < 14; i++){ const a = i/14*TAU + off; s.proj({ kind:'tooth', r:7, x:c.x, y:c.y, vx:Math.cos(a)*200, vy:Math.sin(a)*200 + 30, life:3, spin:10, a }); } s.ring(c.x, c.y, 60, 0.25, '#ff7a40'); } }); } },
      { name:'Bras à pistons', dur:4.6,
        go(s){ s.tw('spin', 3, 0.5); s.at(3.6, ()=> s.tw('spin', 0, 0.8)); const ground = s.H - 120;
          for (let k = 0; k < 2; k++){ const x = clamp(s.pl.x + (k ? rnd(-120, 120) : 0), 70, s.W - 70), hit = { x:x - 38, w:76, on:false };
            s.at(k*1.8, ()=>{ s.snd('byAlert'); s.add({ type:'x', life:0.9, draw(g, e){ // couloir d'alerte rayé
              const a = 0.16 + 0.2*Math.sin(e.age*22)**2; g.save(); g.beginPath(); g.rect(x - 38, 230, 76, s.H - 230); g.clip(); g.fillStyle = `rgba(255,40,30,${a})`; g.fillRect(x - 38, 230, 76, s.H);
              g.strokeStyle = 'rgba(255,170,60,.3)'; g.lineWidth = 10; for (let y = 150 + (e.age*160) % 40; y < s.H + 80; y += 40){ g.beginPath(); g.moveTo(x - 60, y); g.lineTo(x + 60, y - 60); g.stroke(); } g.restore();
              g.strokeStyle = `rgba(255,90,50,${0.5 + 0.4*Math.sin(e.age*22)})`; g.lineWidth = 2; g.strokeRect(x - 38, 230, 76, s.H - 230); } }); });
            s.at(k*1.8 + 0.9, ()=>{ const h = s.A('head'); let landed = false; s.snd('byPiston');
              s.add({ type:'x', life:0.8, draw(g, e, kk){
                const ext = kk < 0.6 ? ease(Math.min(1, kk/0.2)) : 1 - ease((kk - 0.6)/0.4), y1 = lerp(h.y + 10, ground, ext), len = y1 - h.y; e.px = x; e.py0 = h.y; e.py1 = y1; e.hurt = ext > 0.9;
                if (!landed && ext > 0.98){ landed = true; s.snd('bySlam'); s.ring(x, ground, 190, 0.55, '#ffb070'); s.impact(x, ground, 190); s.shake = 0.7; s.burst(x, ground, 14, '#ffb060', 320, 0.8);
                  for (let i = 0; i < 7; i++) s.proj({ kind:'shard', r:6, x:x + rnd(-30, 30), y:ground, vx:rnd(-240, 240), vy:rnd(-330, -120), ay:600, life:1 });
                  for (let i = 0; i < 4; i++) s.proj({ kind:'smoke', r:14, x:x + rnd(-40, 40), y:ground - 5, vx:rnd(-40, 40), vy:rnd(-70, -20), life:1.1 }); }
                g.save(); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x - 30, h.y, 60, len);
                const hous = Math.min(len, 95); for (let y = h.y; y < h.y + hous; y += 52) s.crop(g, 238, 150, 66, 100, x, y + 26, 66, 52);
                const rod = g.createLinearGradient(x - 13, 0, x + 13, 0); rod.addColorStop(0, '#4a3a3e'); rod.addColorStop(0.25, '#fffaf6'); rod.addColorStop(0.55, '#b0a4a6'); rod.addColorStop(1, '#3a2a2e');
                g.fillStyle = rod; g.fillRect(x - 13, h.y + hous - 6, 26, Math.max(0, len - hous + 6)); g.fillStyle = '#ffc02a'; g.fillRect(x - 30, h.y + hous - 8, 60, 6); g.fillStyle = '#1a0a0c'; g.fillRect(x - 30, h.y + hous - 2, 60, 5); g.fillStyle = 'rgba(255,90,40,.6)'; for (let y = h.y + hous + 8; y < y1 - 30; y += 22) g.fillRect(x - 13, y, 26, 2);
                s.crop(g, 224, 360, 92, 90, x, y1, 132, 128); s.glow(g, x, y1 + 40, 90, 'rgba(255,90,40,.8)', 0.35 + 0.5*ext); g.restore(); } }); }); } } },
      { name:'Aspiration', dur:5.2,
        go(s){ s.tw('spin', 9, 0.6); s.at(2.6, ()=> s.tw('spin', 0, 1)); s.pull = 1; s.snd('byPull'); for (let i = 0; i < 70; i++) s.at(i*0.03, ()=>{ const c = s.A('mid'), a = rnd(0, TAU), d = rnd(160, 260); s.proj({ kind:'spark', col:'#ffd0a0', r:3, x:c.x + Math.cos(a)*d, y:c.y + Math.sin(a)*d + 100, vx:0, vy:0, life:0.8, upd(e, dt){ e.x += (c.x - e.x)*dt*3; e.y += (c.y - e.y)*dt*3; } }); });
          s.at(2.4, ()=>{ s.pull = 0; s.snd('byExpel'); const c = s.A('mid'); s.ring(c.x, c.y, 200, 0.4, '#ff8a50'); for (const sg of [-1, 1]) fan(s, c, 8, 1.1, DOWN + sg*0.55, 250, { kind:'tooth', r:7, spin:8 }); s.shake = 0.5; }); } },
    ] },

  reparateur: { sfx:'rp', tex:'reparateur', hp:1400, thresh:[66, 33], label:'LE REPARATEUR EN CHEF', seed:53, dmg:{ beam:9, drone:9, contact:16 }, killScore:1300, escort:true,
    anchors:{ core:[258, 305], t0:[25, 190], t1:[20, 365], t2:[140, 460], t3:[370, 455], t4:[490, 365], t5:[490, 200] },
    parts:[-153, 166, 127, 53, 14.5, -24].map((d, i)=>({ type:'sector', c:[258, 305], rmin:100, rmax:340, a0:(d - 15)*Math.PI/180, a1:(d + 15)*Math.PI/180, pivot:[258, 305],
      fn:s=>({ rot:Math.sin(s.t*1.4 + i*1.1)*0.03 + (s.pose.arms || 0)*Math.sin(s.t*9 + i*2)*0.035 + (s.pose.arms || 0)*(i % 2 ? 1 : -1)*0.05 }) })),
    over(s, g){ const c = s.A('core'), h = s.pose.heal || 0; s.glow(g, c.x, c.y, 70*s.K + h*30, 'rgba(90,255,110,.8)', 0.3 + 0.12*Math.sin(s.t*3) + h*0.4);
      for (const nm of ['t0', 't1', 't2', 't3', 't4', 't5']){ const a = s.A(nm); s.glow(g, a.x, a.y, 12, 'rgba(160,255,160,.8)', 0.3 + 0.3*Math.sin(s.t*4 + a.x)); } },
    death:{
      agony(s){ s.tw('arms', 1, 0.2); s.tw('heal', 1, 1.5); s.snd('rpWarm'); const arms = ['t0', 't1', 't2', 't3', 't4', 't5'];
        for (let i = 0; i < 14; i++) s.at(0.1 + i*0.16, ()=>{ const a = arms[(Math.random()*6) | 0], q = s.A(a), c = s.A('core'); s.beam(()=> s.A(a), ()=> ({ x:c.x + rnd(-60, 60), y:c.y + rnd(-60, 60) }), i % 2 ? '#7dff7a' : '#9fe8ff', 4, 0.3, true); s.burst(q.x, q.y, 8, '#9fe8ff', 220, 0.5); s.boom(q.x, q.y, rnd(70, 120)); if (i % 4 === 0) s.snd('rpArc'); });
        for (let i = 0; i < 5; i++) s.at(0.2 + i*0.45, ()=> s.debris(1, { from:s.A(arms[i]), big:true })); },
      final(s){ const c = s.A('core'); s.snd('rpHeal'); s.flash(c.x, c.y, '#ccffcc', 220, 0.6); for (let r = 0; r < 3; r++) s.at(r*0.2, ()=> s.ring(c.x, c.y, 180 + r*80, 0.7, r % 2 ? '#9fe8ff' : '#7dff7a'));
        for (let i = 0; i < 34; i++){ const a = rnd(0, TAU), v = rnd(100, 340); s.proj({ kind:'plus', x:c.x, y:c.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, life:rnd(0.8, 1.4), harm:false }); }
        for (let i = 0; i < 6; i++) s.debris(1, { from:s.A(['t0', 't1', 't2', 't3', 't4', 't5'][i]), big:true }); } },
    attacks:[
      { name:'Réparation', dur:5.2,
        go(s){ s.tw('heal', 1, 0.5); s.at(4.2, ()=> s.tw('heal', 0, 0.6)); s.snd('rpCall'); s.callEscort(3, true);
          s.at(1.2, ()=>{ s.snd('rpHeal'); const arms = ['t0', 't2', 't5']; s.escortList().slice(0, 3).forEach((sh, i)=>{ s.flash(0, 0, '#7dff7a', 30, 0.3, arms[i]); s.beam(()=> s.A(arms[i]), ()=> ({ x:sh.px, y:sh.py }), '#7dff7a', 4, 2.6, true); sh.healing = 2.6; }); });
          for (let k = 0; k < 14; k++) s.at(1.4 + k*0.17, ()=>{ const l = s.escortList(); if (!l.length) return; const sh = l[k % l.length]; s.proj({ kind:'plus', x:sh.px + rnd(-10, 10), y:sh.py - 8, vx:0, vy:-50, life:0.7 }); }); } },
      { name:'Chalumeaux', dur:5.0,
        go(s){ s.tw('arms', 1, 0.5); s.at(3.9, ()=> s.tw('arms', 0, 0.6)); s.snd('rpWarm'); const arms = ['t0', 't1', 't2', 't3', 't4', 't5']; arms.forEach(nm=> s.flash(0, 0, '#9fe8ff', 36, 0.9, nm).charge = true);
          s.at(0.9, ()=> s.snd('rpArc')); arms.forEach((nm, i)=> s.at(0.9, ()=>{ s.beam(()=> s.A(nm), ()=>{ const a = s.A(nm), k = clamp(s.curT - 0.9, 0, 2.6)/2.6, th = DOWN + (0.5 - k)*0.9*(i < 3 ? -1 : 1); return { x:a.x + Math.cos(th)*900, y:a.y + Math.sin(th)*900 }; }, '#9fe8ff', 5, 2.8, true).hurt = true; })); } },
      { name:'Essaim de drones', dur:5.0,
        go(s){ s.tw('arms', 0.4, 0.3); s.at(3.0, ()=> s.tw('arms', 0, 0.5)); s.snd('rpSwarm'); for (let i = 0; i < 6; i++) s.at(i*0.35, ()=>{ const a = s.A(i % 2 ? 't0' : 't5'); s.flash(a.x, a.y, '#7dff7a', 34, 0.25); s.snd('rpDrone');
            s.proj({ kind:'drone', r:11, x:a.x, y:a.y, vx:0, vy:60, life:3.6, ph:rnd(0, 6), upd(e, dt){ const t = P(s), dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) + 1, sp = Math.min(280, 80 + e.age*130); e.vx = dx/d*sp + Math.sin(e.age*6 + e.ph)*90; e.vy = dy/d*sp; e.x += e.vx*dt; e.y += e.vy*dt; } }); }); } },
    ] },
  };
})();
