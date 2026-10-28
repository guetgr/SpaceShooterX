"use strict";
// Méthodes de GameScene — fonds du MONDE 2, MARS PLANETE POUBELLE (même mécanique que world/bg-monde.js : deux conteneurs derrière / devant les étoiles, `w.update` à chaque image).
// 'quai' (QUAI DE DECHARGEMENT : portique, grues, bennes, panneaux, Mars et sa décharge) · 'tri' (CHAINE DE TRI : tapis roulants, galets, scanners, bras de tri, vapeur)
// · 'compactage' (ZONE DE COMPACTAGE : presses qui se referment, cubes écrasés, voyants, vapeur) · 'benne' (BENNE A CRISTAUX : mine à ciel ouvert, poutres, lampes, grappes de cristaux dans la roche)
// · 'broyeur' (LE BROYEUR : engrenages riveté, scies, chaînes, mâchoires à bande de chantier, forge).
// Palette du monde : prune / rouge / orange (theme de monde-2.js). Le combat reste lisible : formes sombres et peu saturées, la lumière chaude n'est que du halo additif.
const WBG2_CLUSTERS = [[0, 140], [1, 420], [0, 660], [1, 880]];                       // grappes de cristaux dans la paroi de la mine : [côté, y dans le carreau de 1000 px]
function wbg2WallEdge(y, side){ const ph = side ? 4.1 : 1.2; return 30 + 16*Math.sin(2*Math.PI*3*y/1000 + ph) + 11*Math.sin(2*Math.PI*7*y/1000 + ph*2) + 6*Math.sin(2*Math.PI*13*y/1000 + ph*3); }     // bord irrégulier, périodique : le carreau se raccorde

mixin(GameScene, {
  // ---------------------------------------------------------------- peintures communes (une texture canvas par objet, pixel-art net)
  wbg2Poly(g, pts){ g.beginPath(); pts.forEach(([x, y], i)=> i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); },

  // caisse / benne : tôle orange sombre, nervures, bande de chantier jaune/noir, étiquette AGP
  wbg2PaintCrate(key, ww, hh, tone){
    if (this.textures.exists(key)) return;
    const P = 2, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P, P);
    const T = [['#4a2218', '#8a4a26'], ['#3e1c24', '#7c3a38'], ['#33231a', '#6c5230']][tone % 3];
    const gr = g.createLinearGradient(0, hh, ww, 0); gr.addColorStop(0, T[0]); gr.addColorStop(1, T[1]); g.fillStyle = gr; g.fillRect(0, 0, ww, hh);
    g.strokeStyle = 'rgba(0,0,0,0.38)'; g.lineWidth = 1; for (let x = 5; x < ww - 2; x += 6){ g.beginPath(); g.moveTo(x + 0.5, 4); g.lineTo(x + 0.5, hh - 2); g.stroke(); }
    const bh = Math.max(3, Math.round(hh*0.16)); g.save(); g.beginPath(); g.rect(0, 0, ww, bh); g.clip();
    for (let x = -bh; x < ww + bh; x += bh){ g.fillStyle = ((x/bh) & 1) ? '#14100e' : '#f0b01a'; g.beginPath(); g.moveTo(x, bh); g.lineTo(x + bh, 0); g.lineTo(x + 2*bh, 0); g.lineTo(x + bh, bh); g.closePath(); g.fill(); } g.restore();
    if (ww > 20 && hh > 14){ g.fillStyle = 'rgba(246,178,26,0.9)'; g.fillRect(Math.round(ww*0.3), Math.round(hh*0.5), Math.round(ww*0.4), Math.max(2, Math.round(hh*0.14))); }
    g.strokeStyle = 'rgba(255,200,150,0.42)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0.5); g.lineTo(ww, 0.5); g.lineTo(ww - 0.5, hh); g.stroke();
    this.textures.addCanvas(key, c);
  },

  // éclat de ferraille : polygone irrégulier, dégradé de métal rouillé, arête éclairée
  wbg2PaintScrap(key, ww, hh, L, seed){
    if (this.textures.exists(key)) return;
    const P = 3, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P + ww/2, P + hh/2);
    const R = wbgRng(seed), n = 7, pts = []; for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2, r = 0.55 + 0.45*R(); pts.push([Math.cos(a)*ww/2*r, Math.sin(a)*hh/2*r]); }
    const T = [['#2a1418', '#4a2a2a'], ['#341a1a', '#6a3a30'], ['#40201c', '#8c4c38']][L];
    const gr = g.createLinearGradient(-ww/2, hh/2, ww/2, -hh/2); gr.addColorStop(0, T[0]); gr.addColorStop(1, T[1]); this.wbg2Poly(g, pts); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(255,190,140,0.4)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(pts[3][0], pts[3][1]); g.lineTo(pts[4][0], pts[4][1]); g.lineTo(pts[5][0], pts[5][1]); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.moveTo(pts[0][0]*0.4, pts[0][1]*0.4); g.lineTo(pts[2][0]*0.6, pts[2][1]*0.6); g.stroke();
    if (L > 0){ g.fillStyle = 'rgba(255,170,110,0.5)'; g.fillRect(-1, -1, 1.5, 1.5); }
    if (L > 1 && R() < 0.5){ g.fillStyle = 'rgba(240,176,26,0.7)'; g.fillRect(Math.round(-ww*0.2), Math.round(hh*0.05), Math.max(2, Math.round(ww*0.3)), 2); }      // reste de peinture jaune
    this.textures.addCanvas(key, c);
  },

  // panneau de chantier : cadre jaune/noir, texte, flèche
  wbg2PaintSign(key, text, ww, hh, arrow){
    if (this.textures.exists(key)) return;
    const P = 2, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P, P);
    for (let x = -hh; x < ww + hh; x += 6){ g.fillStyle = ((x/6) & 1) ? '#14100e' : '#f0b01a'; g.beginPath(); g.moveTo(x, hh); g.lineTo(x + hh, 0); g.lineTo(x + hh + 6, 0); g.lineTo(x + 6, hh); g.closePath(); g.fill(); }
    g.fillStyle = '#170d10'; g.fillRect(3, 3, ww - 6, hh - 6);
    g.font = 'bold ' + Math.max(7, hh - 10) + 'px monospace'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = '#f0b01a'; g.fillText(text, ww/2 - (arrow ? 4 : 0), hh/2 + 1);
    if (arrow){ g.fillStyle = '#f0b01a'; this.wbg2Poly(g, [[ww - 11, hh/2 - 4], [ww - 5, hh/2], [ww - 11, hh/2 + 4]]); g.fill(); }
    this.textures.addCanvas(key, c);
  },

  // portique de quai : treillis métallique (carreau qui se répète à la verticale)
  wbg2PaintLattice(){
    if (this.textures.exists('wbg2Lattice')) return;
    const W2 = 64, H2 = 280, c = document.createElement('canvas'); c.width = W2; c.height = H2; const g = c.getContext('2d');
    g.fillStyle = '#34201f'; g.fillRect(4, 0, 4, H2); g.fillRect(W2 - 8, 0, 4, H2);
    g.strokeStyle = '#4a2c28'; g.lineWidth = 3; g.beginPath(); for (let y = 0; y < H2; y += 70){ g.moveTo(6, y); g.lineTo(W2 - 6, y + 70); g.moveTo(W2 - 6, y); g.lineTo(6, y + 70); } g.stroke();
    g.strokeStyle = 'rgba(255,175,120,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(4.5, 0); g.lineTo(4.5, H2); g.moveTo(W2 - 7.5, 0); g.lineTo(W2 - 7.5, H2); g.stroke();
    g.fillStyle = '#6a4234'; for (let y = 0; y < H2; y += 70){ g.fillRect(2, y - 2, 8, 5); g.fillRect(W2 - 10, y - 2, 8, 5); g.fillStyle = '#8a5a44'; g.fillRect(4, y, 2, 1); g.fillRect(W2 - 8, y, 2, 1); g.fillStyle = '#6a4234'; }
    this.textures.addCanvas('wbg2Lattice', c);
  },

  // Mars vue de dessus : sol rouge-orange grenu, taches basaltiques sombres, traînées de poussière, cratères (fond sombre décalé, lèvre éclairée), failles, et la DECHARGE peinte sur la surface
  // (tas de bennes, tôles et tubes, chacun avec son ombre portée, le tout découpé proprement par le disque)
  wbg2PaintMars(){
    if (this.textures.exists('wbg2Mars')) return;
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = wbgRng(77);
    const r = g.createRadialGradient(S*0.36, S*0.3, S*0.05, S/2, S/2, S*0.52); r.addColorStop(0, '#e8794c'); r.addColorStop(0.5, '#b04a2e'); r.addColorStop(1, '#3a1418');
    g.fillStyle = r; g.beginPath(); g.arc(S/2, S/2, S/2 - 2, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(S/2, S/2, S/2 - 2, 0, 7); g.clip();
    for (let i = 0; i < 14; i++){ g.fillStyle = 'rgba(80,26,24,0.22)'; g.beginPath(); g.ellipse(R()*S, R()*S*0.8, 26 + R()*60, 14 + R()*34, R()*3, 0, 7); g.fill(); }              // grandes taches basaltiques
    for (let i = 0; i < 40; i++){ g.strokeStyle = 'rgba(255,190,140,0.1)'; g.lineWidth = 1 + R()*2; const x = R()*S, y = R()*S*0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + R()*90, y + (R() - 0.5)*10); g.stroke(); }   // traînées de poussière
    for (let i = 0; i < 5200; i++){ const v = R(); g.fillStyle = v < 0.5 ? 'rgba(60,18,20,0.24)' : 'rgba(255,200,150,0.16)'; g.fillRect(Math.floor(R()*S), Math.floor(R()*S), 1 + (R() < 0.2 ? 1 : 0), 1); }   // grain
    const crater = (x, y, rr)=>{
      g.fillStyle = 'rgba(86,30,28,0.5)'; g.beginPath(); g.ellipse(x + rr*0.12, y + rr*0.14, rr*0.92, rr*0.86, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(40,12,16,0.38)'; g.beginPath(); g.ellipse(x + rr*0.3, y + rr*0.32, rr*0.55, rr*0.5, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,196,150,0.5)'; g.lineWidth = Math.max(1, rr*0.1); g.beginPath(); g.arc(x, y, rr, Math.PI*0.85, Math.PI*1.7); g.stroke(); };
    for (let i = 0; i < 70; i++) crater(R()*S, R()*S, 3 + R()*R()*30);
    for (let i = 0; i < 5; i++) crater(R()*S, 150 + R()*S*0.7, 36 + R()*30);
    g.strokeStyle = 'rgba(50,14,18,0.5)'; g.lineWidth = 2.2;                                          // failles et canyons (comme Valles Marineris), avec une lèvre claire
    for (let i = 0; i < 4; i++){ let x = 40 + R()*S*0.8, y = 8 + R()*150; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++){ x += 12 + R()*20; y += (R() - 0.4)*16; g.lineTo(x, y); } g.stroke();
      g.strokeStyle = 'rgba(255,190,140,0.2)'; g.lineWidth = 1; g.stroke(); g.strokeStyle = 'rgba(50,14,18,0.5)'; g.lineWidth = 2.2; }
    g.strokeStyle = 'rgba(50,14,18,0.28)'; g.lineWidth = 1.5;                                          // sillons de chenilles de camions
    for (let i = 0; i < 6; i++){ const x = R()*S, y = 10 + R()*160; for (const dx of [0, 3]){ g.beginPath(); let px = x + dx, py = y; g.moveTo(px, py); for (let k = 0; k < 8; k++){ px += (R() - 0.35)*18; py += 12 + R()*14; g.lineTo(px, py); } g.stroke(); } }
    const item = (x, y, kind, sz)=>{
      g.save(); g.translate(x, y); g.rotate((R() - 0.5)*1.6);
      g.fillStyle = 'rgba(30,8,12,0.5)'; g.fillRect(-sz*0.5 + 2, -sz*0.35 + 3, sz, sz*0.7);                                  // ombre portée (la lumière vient d'en haut à gauche)
      if (kind === 0){ g.fillStyle = ['#3a2a30', '#4a3430', '#2e2a3a'][Math.floor(R()*3)]; g.fillRect(-sz*0.5, -sz*0.35, sz, sz*0.7); g.fillStyle = '#14100e'; g.fillRect(-sz*0.5, -sz*0.35, sz, 2);
        g.fillStyle = '#f0b01a'; for (let q = 0; q < sz; q += 4) g.fillRect(-sz*0.5 + q, -sz*0.35, 2, 2); g.strokeStyle = 'rgba(255,215,190,0.5)'; g.strokeRect(-sz*0.5 + 0.5, -sz*0.35 + 0.5, sz - 1, sz*0.7 - 1); }
      else if (kind === 1){ g.fillStyle = '#5a4c52'; g.fillRect(-sz*0.5, -sz*0.2, sz, sz*0.4); g.strokeStyle = 'rgba(255,230,210,0.55)'; g.strokeRect(-sz*0.5 + 0.5, -sz*0.2 + 0.5, sz - 1, sz*0.4 - 1); g.fillStyle = 'rgba(200,90,50,0.55)'; g.fillRect(-sz*0.2, -sz*0.1, sz*0.3, 2); }
      else { g.fillStyle = '#6a5a60'; g.fillRect(-sz*0.55, -sz*0.1, sz*1.1, sz*0.2); g.fillStyle = 'rgba(255,230,210,0.6)'; g.fillRect(-sz*0.55, -sz*0.1, sz*1.1, 1); g.fillStyle = '#241418'; g.beginPath(); g.arc(-sz*0.55, 0, sz*0.1, 0, 7); g.fill(); }
      g.restore(); };
    [[130, 40, 50], [210, 24, 36], [290, 46, 56], [360, 32, 40], [170, 96, 40], [262, 104, 46], [336, 96, 34], [110, 100, 30]].forEach(([cx, cy, rad])=>{                  // zone visible = haut du disque
      g.fillStyle = 'rgba(40,10,14,0.15)'; g.beginPath(); g.ellipse(cx + 4, cy + 5, rad*0.75, rad*0.46, 0, 0, 7); g.fill();                                                        // ombre d'ensemble du tas
      for (let k = 0; k < 16; k++){ const an = R()*Math.PI*2, d = Math.sqrt(R())*rad*0.7; item(cx + Math.cos(an)*d, cy + Math.sin(an)*d*0.6, Math.floor(R()*3), 8 + R()*13); } });
    const sh = g.createLinearGradient(S*0.3, 0, S, S*0.2); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(20,2,8,0.7)'); g.fillStyle = sh; g.fillRect(0, 0, S, S); g.restore();
    this.textures.addCanvas('wbg2Mars', c);
  },

  // luminaire : boîtier + bras de fixation (jamais une lueur sans support) ; la lueur additive se pose sur la lentille. `flip` : boîtier posé sur son support au lieu d'être suspendu.
  wbg2PaintLamp(){
    if (this.textures.exists('wbg2Lamp')) return;
    const c = document.createElement('canvas'); c.width = 14; c.height = 16; const g = c.getContext('2d');
    g.fillStyle = '#2a1a1c'; g.fillRect(6, 0, 2, 5);
    g.fillStyle = '#3a2628'; g.fillRect(2, 5, 10, 9); g.fillStyle = '#5a3a34'; g.fillRect(2, 5, 10, 1); g.fillStyle = '#14080a'; g.fillRect(3, 7, 8, 5);
    g.fillStyle = '#8a6a5a'; g.fillRect(4, 8, 6, 3); g.strokeStyle = '#14080a'; g.beginPath(); g.moveTo(7, 7); g.lineTo(7, 12); g.stroke();
    this.textures.addCanvas('wbg2Lamp', c);
  },
  wbg2Lamp(parent, tint, size){
    this.wbg2PaintLamp();
    const box = this.add.image(0, 0, 'wbg2Lamp'), glow = this.add.image(0, 0, 'wbgGlow').setDisplaySize(size || 26, size || 26).setTint(tint).setBlendMode(Phaser.BlendModes.ADD);
    parent.add(box); parent.add(glow); return { box, glow };
  },
  wbg2LampAt(l, x, y, a, flip){ l.box.setFlipY(!!flip).setPosition(x - GAME_W/2, y - GAME_H/2); l.glow.setPosition(x - GAME_W/2, y + (flip ? -2 : 2) - GAME_H/2).setAlpha(a); },

  // tête de scanner : boîtier à lentille, qui coulisse sur son rail au-dessus d'un tapis
  wbg2PaintScan(){
    if (this.textures.exists('wbg2Scan')) return;
    const c = document.createElement('canvas'); c.width = 26; c.height = 14; const g = c.getContext('2d');
    g.fillStyle = '#2a1a1c'; g.fillRect(0, 0, 26, 9); g.fillStyle = '#4a2c2a'; g.fillRect(0, 0, 26, 1); g.fillStyle = '#14080a'; g.fillRect(4, 9, 18, 4);
    g.fillStyle = '#8a6a5a'; g.fillRect(9, 10, 8, 3); g.fillStyle = '#6a4a40'; g.fillRect(2, 3, 2, 2); g.fillRect(22, 3, 2, 2);
    this.textures.addCanvas('wbg2Scan', c);
  },

  // grue de quai lointaine : tour, flèche, contrepoids, câble et crochet (silhouette sombre au liseré chaud)
  wbg2PaintCrane(){
    if (this.textures.exists('wbg2Crane')) return;
    const c = document.createElement('canvas'); c.width = 140; c.height = 240; const g = c.getContext('2d');
    g.strokeStyle = '#3a2224'; g.lineWidth = 3; g.beginPath(); g.moveTo(58, 235); g.lineTo(58, 40); g.moveTo(74, 235); g.lineTo(74, 40); g.stroke();
    g.lineWidth = 2; g.beginPath(); for (let y = 235; y > 44; y -= 24){ g.moveTo(58, y); g.lineTo(74, y - 24); g.moveTo(74, y); g.lineTo(58, y - 24); } g.stroke();
    g.fillStyle = '#3a2224'; g.fillRect(6, 34, 124, 7); g.fillRect(100, 24, 28, 22); g.fillStyle = '#5a3a34'; g.fillRect(6, 34, 124, 1);
    g.strokeStyle = '#3a2224'; g.lineWidth = 2; g.beginPath(); g.moveTo(66, 12); g.lineTo(10, 34); g.moveTo(66, 12); g.lineTo(120, 34); g.moveTo(66, 12); g.lineTo(66, 40); g.stroke();
    g.strokeStyle = '#4a2c2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(22, 41); g.lineTo(22, 120); g.stroke(); g.fillStyle = '#6a3a30'; g.fillRect(17, 120, 10, 8); g.fillRect(20, 128, 4, 6);
    this.textures.addCanvas('wbg2Crane', c);
  },

  // vapeur : réserve de bouffées grises qui montent en grossissant (émises à la demande)
  wbg2Steam(parent, n, tint){
    return Array.from({ length: n }, ()=>{ const im = this.add.image(0, 0, 'wbgGlow').setTint(tint || 0x9a8a88).setAlpha(0); parent.add(im); return { im, x: 0, y: 0, vx: 0, age: 9, life: 2 }; });
  },
  wbg2SteamEmit(arr, x, y){ const s = arr.find(a=> a.age >= a.life); if (s){ s.x = x; s.y = y; s.age = 0; s.life = 1.4 + Math.random()*1.2; s.vx = (Math.random() - 0.5)*16; } },
  wbg2SteamUpdate(arr, dt, boost){
    for (const s of arr){ if (s.age >= s.life){ s.im.setAlpha(0); continue; } s.age += dt; const u = s.age/s.life; s.y -= 22*dt; s.x += s.vx*dt; s.y += 18*(boost - 1)*dt;
      s.im.setPosition(s.x - GAME_W/2, s.y - GAME_H/2).setDisplaySize(12 + 36*u, 12 + 36*u).setAlpha(0.24*(1 - u)); }
  },

  // ---------------------------------------------------------------- QUAI DE DECHARGEMENT : portique à voyants, grues, bennes, panneaux ; Mars et sa décharge
  wbgBuild_quai(w){
    w.back.add(this.wbgGradient('wbg2GradQ', '#0a0612', '#190c15', '#2b1317'));
    this.wbgGlowAt(w.back, 330, 170, 460, 0xa8343f, 0.24); this.wbgGlowAt(w.back, 80, 580, 540, 0xd2603f, 0.2);
    // grues de quai lointaines (très sombres, très lentes), avec leur feu rouge
    this.wbg2PaintCrane();
    const cranes = [{ x: 305, y: 150, s: 1.0, sp: 7 }, { x: 150, y: 560, s: 0.75, sp: 5 }].map((d, i)=>{
      const im = this.add.image(0, 0, 'wbg2Crane').setAlpha(0.3).setScale(d.s); const lt = this.add.image(0, 0, 'wbgGlow').setDisplaySize(22, 22).setTint(0xff3a28).setBlendMode(Phaser.BlendModes.ADD);
      w.back.add(im); w.back.add(lt); return Object.assign(d, { im, lt, i }); });
    // Mars en bas (apparaît après le décollage) avec sa décharge peinte sur la surface, voile de poussière sur l'horizon ; la Terre minuscule au loin
    this.wbg2PaintMars();
    const MX = 230, MY = 840, MR = 330;
    this.wbgGlowAt(w.planet, MX, MY, 980, 0xff6a3a, 0.2);
    const mars = this.add.image(MX - GAME_W/2, MY - GAME_H/2, 'wbg2Mars').setDisplaySize(2*MR, 2*MR); w.planet.add(mars);
    this.wbgAtmosphere(w.planet, MX, MY, MR, 0.8, 0xff9a60);
    const ex = 338, ey = 110, ER = 26;
    this.wbgGlowAt(w.planet, ex, ey, ER*4, 0x3c8cff, 0.22);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbg2Earth', 0.4)).setDisplaySize(2*ER, 2*ER); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, ER, 0.5, 0x5aaaff);
    // portique : trois copies du carreau de treillis qui défilent ; voyants et panneaux sont fixés sur son montant et le suivent
    this.wbg2PaintLattice();
    const TH = 280*2.2, lat = [0, 1, 2].map(()=>{ const im = this.add.image(0, 0, 'wbg2Lattice').setDisplaySize(64*2.2, TH).setAlpha(0.7); w.back.add(im); return im; });
    const lamps = [0, 1, 2].map(i=> this.wbg2Lamp(w.back, i === 1 ? 0xff4632 : 0xffaa3c, 26));
    let gy = 0;
    const SIGNS = [['QUAI 7', 64, 20, false], ['DECHARGE', 92, 20, true]].map(([tx, ww, hh, ar], i)=>{ const key = 'wbg2Sg' + i; this.wbg2PaintSign(key, tx, ww, hh, ar); const im = this.add.image(0, 0, key).setAlpha(0.9); w.back.add(im); return im; });
    // bennes et ferraille : 3 profondeurs
    const rnd = wbgRng(61), items = [], SPD = [18, 34, 60], ALP = [0.55, 0.82, 1];
    for (let i = 0; i < 26; i++){
      const L = i % 3, crate = rnd() < 0.42, ww = Math.round([12, 22, 40][L] + rnd()*[8, 14, 26][L]), hh = Math.round(ww*(crate ? 0.7 + rnd()*0.3 : 0.4 + rnd()*0.5)), key = 'wbg2It' + i;
      if (crate) this.wbg2PaintCrate(key, ww, Math.max(8, hh), i); else this.wbg2PaintScrap(key, ww, Math.max(5, hh), L, 100 + i);
      const im = this.add.image(0, 0, key).setAlpha(ALP[L]); w.front.add(im);
      items.push({ im, L, x: rnd()*GAME_W, y: rnd()*GAME_H, a: rnd()*360, va: (rnd() - 0.5)*(L === 2 ? 24 : 14), k: rnd() });
    }
    w.update = (dt, boost, t)=>{
      gy = (gy + 22*boost*dt) % TH;
      lat.forEach((im, i)=> im.setPosition(46 - GAME_W/2, gy + (i - 1)*TH + TH/2 - GAME_H/2));
      lamps.forEach((l, i)=>{ const y = ((gy + 60 + i*250) % (TH*2)) - 100; this.wbg2LampAt(l, 103, y, Math.sin(t*(1.6 + i*0.5) + i*2) > 0.1 ? 0.9 : 0.08); });
      SIGNS.forEach((im, i)=>{ const y = ((gy + 150 + i*320) % (TH*2)) - 60; im.setPosition(46 - GAME_W/2, y - GAME_H/2); });
      cranes.forEach(d=>{ d.y += d.sp*boost*dt; if (d.y > GAME_H + 150){ d.y = -170; } d.im.setPosition(d.x - GAME_W/2, d.y - GAME_H/2); d.lt.setPosition(d.x - 2 - GAME_W/2, d.y - 100*d.s - GAME_H/2).setAlpha(Math.sin(t*1.7 + d.i*2) > 0.2 ? 0.9 : 0.1); });
      for (const d of items){
        d.y += SPD[d.L]*boost*dt; d.a += d.va*dt; if (d.y > GAME_H + 60){ d.y = -60 - Math.random()*80; d.x = Math.random()*GAME_W; }
        d.im.setPosition(d.x + Math.sin(t*0.2 + d.k*9)*6 - GAME_W/2, d.y - GAME_H/2).setAngle(d.a);
      }
      mars.y = MY - GAME_H/2 + Math.sin(t*0.3)*2; earth.y = ey - GAME_H/2 + Math.sin(t*0.4)*3;
    };
  },

  // ---------------------------------------------------------------- CHAINE DE TRI : tapis roulants en mouvement, galets, scanners, caisses qui voyagent, bras de tri, vapeur
  wbg2PaintBelt(){
    if (this.textures.exists('wbg2Belt')) return;
    const c = document.createElement('canvas'); c.width = 32; c.height = 22; const g = c.getContext('2d');
    g.fillStyle = '#1a1014'; g.fillRect(0, 0, 32, 22); g.fillStyle = '#5a3030'; g.fillRect(0, 0, 32, 3); g.fillRect(0, 19, 32, 3);
    g.fillStyle = 'rgba(255,175,120,0.4)'; g.fillRect(0, 0, 32, 1); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 3, 32, 2); g.fillRect(0, 17, 32, 2);
    g.strokeStyle = '#3a2024'; g.lineWidth = 3; for (let x = -10; x < 40; x += 16){ g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 10, 11); g.lineTo(x, 3); g.stroke(); }
    this.textures.addCanvas('wbg2Belt', c);
  },
  wbg2PaintCone(){
    if (this.textures.exists('wbg2Cone')) return;
    const c = document.createElement('canvas'); c.width = 64; c.height = 96; const g = c.getContext('2d'); const l = g.createLinearGradient(0, 0, 0, 96);
    l.addColorStop(0, 'rgba(255,255,255,0.9)'); l.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = l; g.beginPath(); g.moveTo(26, 0); g.lineTo(38, 0); g.lineTo(64, 96); g.lineTo(0, 96); g.closePath(); g.fill();
    this.textures.addCanvas('wbg2Cone', c);
  },
  wbgBuild_tri(w){
    w.back.add(this.wbgGradient('wbg2GradT', '#0c0610', '#1a0a14', '#26110f'));
    this.wbgGlowAt(w.back, 340, 560, 520, 0xd2603f, 0.2); this.wbgGlowAt(w.back, 60, 160, 440, 0x6e1d3a, 0.3);
    // piliers de l'usine, loin derrière
    this.wbg2PaintLattice();
    const TH = 280*2.4, pil = [[0, 56], [1, 56], [0, 344], [1, 344]].map(([k, x])=>{ const im = this.add.image(0, 0, 'wbg2Lattice').setDisplaySize(64*2.4, TH).setAlpha(0.32); w.back.add(im); return { im, k, x }; });
    const steam = this.wbg2Steam(w.back, 16, 0x8a7a78);
    this.wbg2PaintBelt(); this.wbg2PaintCone(); this.wbg2PaintScan(); this.wbg2PaintGear('wbg2GR', 13, 8);
    const rnd = wbgRng(83), belts = [], TAGS = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let i = 0; i < 6; i++){
      const ts = this.add.tileSprite(0, 0, GAME_W + 8, 22, 'wbg2Belt').setAlpha(0.9); w.front.add(ts);
      const dir = i % 2 ? -1 : 1, boxes = [];
      for (let b = 0; b < 4; b++){ const bw = 12 + Math.round(rnd()*14), key = 'wbg2Bx' + i + '_' + b, scrap = (b + i) % 3 === 2;
        if (scrap) this.wbg2PaintScrap(key, bw, 10, 1 + (b % 2), 400 + i*7 + b); else this.wbg2PaintCrate(key, bw, 13, i + b);
        const im = this.add.image(0, 0, key).setAlpha(0.95); w.front.add(im); boxes.push({ im, x: rnd()*GAME_W, h: scrap ? 10 : 13 }); }
      const rolls = [6, GAME_W - 6].map(x=>{ const r = this.add.image(0, 0, 'wbg2GR').setAlpha(0.9); w.front.add(r); return { r, x }; });
      this.wbg2PaintSign('wbg2Tg' + i, 'TRI ' + TAGS[i], 40, 14, false); const tag = this.add.image(0, 0, 'wbg2Tg' + i).setAlpha(0.75); w.front.add(tag);
      const lamp = this.wbg2Lamp(w.front, 0x44ff8a, 18);
      const cone = this.add.image(0, 0, 'wbg2Cone').setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setVisible(i % 2 === 1); w.front.add(cone);
      const head = this.add.image(0, 0, 'wbg2Scan').setVisible(i % 2 === 1); w.front.add(head);
      belts.push({ ts, dir, boxes, rolls, tag, y: i*130 - 40, spd: 34 + rnd()*30, lamp, cone, head, ph: i*1.7, i });
    }
    // bras de tri : deux articulations par bras, accrochés aux bords, qui balaient
    const arms = this.add.graphics(); w.front.add(arms);
    const ARM = [{ px: -6, py: 210, dir: 1, ph: 0 }, { px: 406, py: 470, dir: -1, ph: 2.2 }];
    let vent = 0;
    w.update = (dt, boost, t)=>{
      pil.forEach(p=>{ const y = ((t*14*boost + p.k*TH) % (2*TH)) - TH; p.im.setPosition(p.x - GAME_W/2, y + TH/2 - GAME_H/2); });
      vent += dt; if (vent > 0.28){ vent = 0; this.wbg2SteamEmit(steam, (Math.random() < 0.5 ? 56 : 344) + (Math.random() - 0.5)*16, 120 + Math.random()*520); } this.wbg2SteamUpdate(steam, dt, boost);
      for (const b of belts){
        b.y += 16*boost*dt; if (b.y > GAME_H + 30) b.y -= 6*130;
        b.ts.tilePositionX += b.dir*b.spd*dt; b.ts.setPosition(0, b.y - GAME_H/2);
        for (const bx of b.boxes){ bx.x += b.dir*b.spd*dt*1.0; if (bx.x > GAME_W + 30) bx.x = -30; if (bx.x < -30) bx.x = GAME_W + 30; bx.im.setPosition(bx.x - GAME_W/2, b.y - GAME_H/2 - 9 - bx.h/2); }
        b.rolls.forEach(r=> r.r.setPosition(r.x - GAME_W/2, b.y - GAME_H/2).setAngle(t*b.dir*b.spd*1.4));
        b.tag.setPosition((b.dir > 0 ? GAME_W - 40 : 40) - GAME_W/2, b.y - GAME_H/2 - 22);
        const ok = Math.sin(t*1.8 + b.ph) > 0; b.lamp.glow.setTint(ok ? 0x44ff8a : 0xff4a3c); this.wbg2LampAt(b.lamp, b.dir > 0 ? 26 : GAME_W - 26, b.y - 19, 0.5 + 0.4*Math.abs(Math.sin(t*3 + b.ph)), true);
        if (b.i % 2 === 1){ const sx = 70 + 260*(0.5 + 0.5*Math.sin(t*0.7 + b.i)); b.head.setPosition(sx - GAME_W/2, b.y - GAME_H/2 - 62); b.cone.setTint(ok ? 0x44ff8a : 0xff4a3c).setPosition(sx - GAME_W/2, b.y - GAME_H/2 - 55).setDisplaySize(64, 50).setAlpha(0.12 + 0.12*Math.abs(Math.sin(t*2 + b.ph))); }      // scanner : la tête coulisse sur son rail, son faisceau balaie le tapis
      }
      arms.clear();
      for (const b of belts) if (b.i % 2 === 1){                                          // rail du scanner, suspendu au-dessus du tapis par deux tiges
        const y = b.y - 62 - GAME_H/2; arms.lineStyle(3, 0x2a1a1c, 1); arms.beginPath(); arms.moveTo(-GAME_W/2, y); arms.lineTo(GAME_W/2, y); arms.strokePath();
        arms.lineStyle(1, 0x6a4a40, 0.6); arms.beginPath(); arms.moveTo(-GAME_W/2, y - 2); arms.lineTo(GAME_W/2, y - 2); arms.strokePath();
        arms.lineStyle(2, 0x2a1a1c, 1); [-170, 170].forEach(x=>{ arms.beginPath(); arms.moveTo(x, y); arms.lineTo(x, y + 52); arms.strokePath(); }); }
      for (const a of ARM){
        const a1 = a.dir*(0.9 + 0.35*Math.sin(t*0.9 + a.ph)), a2 = a.dir*(-0.5 + 0.7*Math.sin(t*1.3 + a.ph*2));
        const x0 = a.px - GAME_W/2, y0 = a.py - GAME_H/2, x1 = x0 + Math.cos(a1 + (a.dir < 0 ? Math.PI : 0))*92, y1 = y0 + Math.sin(a1)*92, x2 = x1 + Math.cos(a1 + a2 + (a.dir < 0 ? Math.PI : 0))*78, y2 = y1 + Math.sin(a1 + a2)*78;
        arms.lineStyle(11, 0x1c0e10, 1); arms.beginPath(); arms.moveTo(x0, y0); arms.lineTo(x1, y1); arms.lineTo(x2, y2); arms.strokePath();
        arms.lineStyle(5, 0x4a2a2a, 1); arms.beginPath(); arms.moveTo(x0, y0); arms.lineTo(x1, y1); arms.lineTo(x2, y2); arms.strokePath();
        arms.lineStyle(1, 0xffaa78, 0.45); arms.beginPath(); arms.moveTo(x0, y0 - 2); arms.lineTo(x1, y1 - 2); arms.strokePath();
        arms.lineStyle(2, 0x2a1418, 1); arms.beginPath(); arms.moveTo((x0 + x1)/2, (y0 + y1)/2 + 5); arms.lineTo((x0 + x1)/2 + (x1 - x0)*0.18, (y0 + y1)/2 + 14); arms.strokePath();          // vérin
        arms.fillStyle(0x6a3a30, 1); arms.fillCircle(x1, y1, 6); arms.fillStyle(0xf0b01a, 1); arms.fillRect(x2 - 3, y2 - 3, 6, 6);
        arms.fillStyle(0x1c0e10, 1); arms.fillRect(x2 - 5, y2 + 2, 3, 5); arms.fillRect(x2 + 2, y2 + 2, 3, 5);                                                                      // pince
      }
    };
  },

  // ---------------------------------------------------------------- ZONE DE COMPACTAGE : deux presses qui se referment, cubes écrasés, voyants, vapeur
  wbg2PaintPlate(){
    if (this.textures.exists('wbg2Plate')) return;
    const W2 = 70, H2 = 760, c = document.createElement('canvas'); c.width = W2; c.height = H2; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, W2, 0); gr.addColorStop(0, '#1c0f12'); gr.addColorStop(1, '#4a2a2a'); g.fillStyle = gr; g.fillRect(0, 0, W2, H2);
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; for (let y = 60; y < H2; y += 90){ g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W2, y + 0.5); g.stroke(); }
    g.fillStyle = 'rgba(255,175,120,0.5)'; for (let y = 60; y < H2; y += 90){ g.fillRect(6, y + 6, 2, 2); g.fillRect(W2 - 20, y + 6, 2, 2); g.fillRect(W2 - 20, y + 78, 2, 2); }
    for (let y = 30; y < H2; y += 180){                                                           // tableau de bord de la presse : numéro, voyants, jauge — sur la partie visible (le bord intérieur)
      g.fillStyle = '#120a0c'; g.fillRect(W2 - 46, y, 28, 44); g.strokeStyle = 'rgba(255,175,120,0.4)'; g.strokeRect(W2 - 45.5, y + 0.5, 27, 43);
      g.fillStyle = '#f0b01a'; g.font = 'bold 8px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P' + (1 + Math.round((y - 30)/180)), W2 - 32, y + 8);
      g.fillStyle = '#2a1418'; g.fillRect(W2 - 42, y + 16, 20, 6); g.fillStyle = '#c8461f'; g.fillRect(W2 - 42, y + 16, 8 + ((y/30) % 3)*4, 6);
      g.fillStyle = '#44ff8a'; g.fillRect(W2 - 41, y + 30, 3, 3); g.fillStyle = '#ff4a3c'; g.fillRect(W2 - 34, y + 30, 3, 3); g.fillStyle = '#f0b01a'; g.fillRect(W2 - 27, y + 30, 3, 3);
    }
    g.fillStyle = 'rgba(10,4,6,0.45)'; for (let y = 20; y < H2; y += 130) g.fillRect(W2 - 60 + (y % 5)*4, y, 6, 40 + (y % 3)*12);         // coulures d'huile
    g.save(); g.beginPath(); g.rect(W2 - 14, 0, 14, H2); g.clip();                                  // bande de chantier sur le bord qui écrase
    for (let y = -20; y < H2 + 20; y += 14){ g.fillStyle = ((y/14) & 1) ? '#14100e' : '#f0b01a'; g.beginPath(); g.moveTo(W2 - 14, y + 14); g.lineTo(W2, y); g.lineTo(W2, y + 14); g.lineTo(W2 - 14, y + 28); g.closePath(); g.fill(); } g.restore();
    g.strokeStyle = 'rgba(255,200,150,0.35)'; g.beginPath(); g.moveTo(0.5, 0); g.lineTo(0.5, H2); g.stroke();
    this.textures.addCanvas('wbg2Plate', c);
  },
  wbg2PaintCube(key, s, L, seed){
    if (this.textures.exists(key)) return;
    const P = 2, c = document.createElement('canvas'); c.width = c.height = s + 2*P; const g = c.getContext('2d'); g.translate(P, P);
    const T = [['#2a1418', '#4a2a2a'], ['#3a1c1a', '#6e3a30'], ['#4a2420', '#94503a']][L], R = wbgRng(seed);
    const gr = g.createLinearGradient(0, s, s, 0); gr.addColorStop(0, T[0]); gr.addColorStop(1, T[1]); g.fillStyle = gr; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 4; i++){ g.fillStyle = ['rgba(240,176,26,0.5)', 'rgba(90,180,200,0.4)', 'rgba(220,220,220,0.3)', 'rgba(200,60,50,0.45)'][i]; g.fillRect(Math.floor(R()*s*0.7), Math.floor(R()*s), Math.max(2, Math.floor(s*(0.12 + R()*0.25))), 1 + (R() < 0.4 ? 1 : 0)); }  // restes de peinture de carrosserie
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1; for (let i = 0; i < 7; i++){ g.beginPath(); g.moveTo(R()*s, R()*s); g.lineTo(R()*s, R()*s); g.stroke(); }          // tôles écrasées
    g.fillStyle = 'rgba(255,170,110,0.4)'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(R()*s), Math.floor(R()*s), 2, 1);
    g.strokeStyle = 'rgba(255,200,150,0.4)'; g.beginPath(); g.moveTo(0, 0.5); g.lineTo(s, 0.5); g.lineTo(s - 0.5, s); g.stroke();
    g.strokeStyle = 'rgba(40,40,50,0.9)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(1, s*0.3); g.lineTo(s - 1, s*0.3); g.moveTo(1, s*0.7); g.lineTo(s - 1, s*0.7); g.stroke();        // feuillard de cerclage
    this.textures.addCanvas(key, c);
  },
  wbgBuild_compactage(w){
    w.back.add(this.wbgGradient('wbg2GradC', '#0b050c', '#190a10', '#2c100e'));
    this.wbgGlowAt(w.back, 200, 700, 620, 0xe0502a, 0.3); this.wbgGlowAt(w.back, 200, 60, 420, 0x6e1d3a, 0.28);
    // charpente de l'usine entre les presses : deux piliers lointains aux fenêtres rouges
    this.wbg2PaintLattice(); const TH = 280*2.6;
    const pil = [0, 1, 2, 3].map(k=>{ const im = this.add.image(0, 0, 'wbg2Lattice').setDisplaySize(64*2.6, TH).setAlpha(0.2); w.back.add(im); return { im, k, x: k < 2 ? 130 : 270 }; });
    this.wbg2PaintPlate();
    const plates = [-1, 1].map(s=>{ const im = this.add.image(0, 0, 'wbg2Plate').setAlpha(0.95); if (s > 0) im.setFlipX(true); w.front.add(im); return { im, s }; });
    const steam = this.wbg2Steam(w.front, 18, 0x9a8a88);
    const rnd = wbgRng(97), cubes = [], SPD = [16, 30, 52], ALP = [0.5, 0.8, 1];
    for (let i = 0; i < 16; i++){ const L = i % 3, s = Math.round([12, 22, 36][L] + rnd()*[6, 10, 16][L]), key = 'wbg2Cu' + i; this.wbg2PaintCube(key, s, L, 200 + i);
      const im = this.add.image(0, 0, key).setAlpha(ALP[L]); w.front.add(im); cubes.push({ im, L, x: 60 + rnd()*280, y: rnd()*GAME_H, a: rnd()*360, va: (rnd() - 0.5)*18, k: rnd() }); }
    const sparks = Array.from({ length: 18 }, ()=>{ const im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(8, 8).setTint(0xffa040).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0); w.front.add(im); return { im, x: 0, y: 0, vx: 0, vy: 0, life: 0 }; });
    const warn = [0, 1].map(()=> this.wbg2Lamp(w.front, 0xff3a28, 40));
    let spawn = 0, vent = 0;
    w.update = (dt, boost, t)=>{
      pil.forEach(p=>{ const y = ((t*10*boost + p.k*TH) % (2*TH)) - TH; p.im.setPosition(p.x - GAME_W/2, y + TH/2 - GAME_H/2); });
      const ph = Math.sin(t*0.9), reach = 24 + 26*(0.5 + 0.5*ph);                       // bord intérieur de chaque presse (24 = refermée, 50 = ouverte)
      plates.forEach(p=>{ const edge = p.s < 0 ? reach : GAME_W - reach, cx = p.s < 0 ? edge - 35 : edge + 35; p.im.setPosition(cx - GAME_W/2, 0); });
      spawn += dt; if (Math.cos(t*0.9) < -0.2 && spawn > 0.05){ spawn = 0; const sp = sparks.find(s=>s.life <= 0); if (sp){ const side = Math.random() < 0.5 ? -1 : 1; sp.x = (side < 0 ? reach : GAME_W - reach); sp.y = 80 + Math.random()*540; sp.vx = -side*(20 + Math.random()*50); sp.vy = -30 - Math.random()*60; sp.life = 0.6 + Math.random()*0.5; } }
      for (const s of sparks){ if (s.life <= 0){ s.im.setAlpha(0); continue; } s.life -= dt; s.x += s.vx*dt; s.y += s.vy*dt; s.vy += 80*dt; s.im.setPosition(s.x - GAME_W/2, s.y - GAME_H/2).setAlpha(Math.max(0, s.life)); }
      vent += dt; if (vent > 0.3 && Math.sin(t*0.9) > 0.3){ vent = 0; const side = Math.random() < 0.5; this.wbg2SteamEmit(steam, (side ? reach + 6 : GAME_W - reach - 6), 80 + Math.random()*540); } this.wbg2SteamUpdate(steam, dt, boost);
      for (const d of cubes){ d.y += SPD[d.L]*boost*dt; d.a += d.va*dt; if (d.y > GAME_H + 50){ d.y = -50 - Math.random()*80; d.x = 60 + Math.random()*280; } d.im.setPosition(d.x + Math.sin(t*0.3 + d.k*9)*5 - GAME_W/2, d.y - GAME_H/2).setAngle(d.a); }
      warn.forEach((l, i)=> this.wbg2LampAt(l, i ? GAME_W - reach + 14 : reach - 14, 20, 0.15 + 0.7*Math.max(0, Math.sin(t*3.2 + i*Math.PI)), true));          // gyrophares posés sur les presses, ils bougent avec elles
    };
  },

  // ---------------------------------------------------------------- BENNE A CRISTAUX : mine à ciel ouvert, parois en strates avec grappes de cristaux, poutres et lampes, poussière
  wbg2PaintWall(){
    if (this.textures.exists('wbg2Wall')) return;
    const WW = 400, HH = 1000, c = document.createElement('canvas'); c.width = WW; c.height = HH; const g = c.getContext('2d');
    [0, 1].forEach(side=>{
      g.beginPath(); g.moveTo(side ? WW : 0, 0);
      for (let y = 0; y <= HH; y += 4){ const e = wbg2WallEdge(y, side); g.lineTo(side ? WW - e : e, y); } g.lineTo(side ? WW : 0, HH); g.closePath();
      const gr = g.createLinearGradient(side ? WW - 70 : 0, 0, side ? WW : 70, 0); gr.addColorStop(side ? 1 : 0, '#0e0709'); gr.addColorStop(side ? 0 : 1, '#2e1612'); g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(255,150,90,0.18)'; g.lineWidth = 1; for (let y = 20; y < HH; y += 38){ g.beginPath(); g.moveTo(side ? WW : 0, y); g.lineTo(side ? WW - wbg2WallEdge(y, side) + 4 : wbg2WallEdge(y, side) - 4, y + 6*Math.sin(y)); g.stroke(); }
      g.fillStyle = 'rgba(12,6,8,0.55)'; for (let y = 50; y < HH; y += 95){ const e = wbg2WallEdge(y, side); g.fillRect(side ? WW - e : e - 10, y, 10, 3); }                    // fissures
      g.strokeStyle = 'rgba(255,170,110,0.45)'; g.lineWidth = 1; g.beginPath(); for (let y = 0; y <= HH; y += 4){ const e = wbg2WallEdge(y, side); y ? g.lineTo(side ? WW - e : e, y) : g.moveTo(side ? WW - e : e, y); } g.stroke();
    });
    WBG2_CLUSTERS.forEach(([side, y], ci)=>{                                                       // grappes de cristaux plantées dans la roche
      const R = wbgRng(500 + ci), e = wbg2WallEdge(y, side), dir = side ? -1 : 1, bx = side ? WW - e + 2 : e - 2;
      for (let k = 0; k < 5; k++){ const len = 12 + R()*22, ang = (-0.5 + R()*1.0), tone = [['#5a1a14', '#e0701c'], ['#58101c', '#d03030']][k % 2];
        g.save(); g.translate(bx, y + (R() - 0.5)*28); g.rotate(ang); g.scale(dir, 1); g.fillStyle = tone[0]; this.wbg2Poly(g, [[0, -4], [len, 0], [0, 4]]); g.fill(); g.fillStyle = tone[1]; this.wbg2Poly(g, [[0, -4], [len, 0], [2, 0]]); g.fill();
        g.strokeStyle = 'rgba(255,225,190,0.5)'; g.beginPath(); g.moveTo(1, -3.5); g.lineTo(len, 0); g.stroke(); g.restore(); }
    });
    this.textures.addCanvas('wbg2Wall', c);
  },
  wbg2PaintBeam(){
    if (this.textures.exists('wbg2Beam')) return;
    const c = document.createElement('canvas'); c.width = 400; c.height = 22; const g = c.getContext('2d');
    g.fillStyle = '#2a1618'; g.fillRect(0, 0, 400, 5); g.fillRect(0, 17, 400, 5); g.fillStyle = '#4a2c2a'; g.fillRect(0, 0, 400, 1); g.fillRect(0, 17, 400, 1);
    g.strokeStyle = '#34201f'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x < 400; x += 40){ g.moveTo(x, 17); g.lineTo(x + 20, 5); g.lineTo(x + 40, 17); } g.stroke();
    g.fillStyle = '#6a4234'; for (let x = 6; x < 400; x += 40){ g.fillRect(x, 2, 2, 1); g.fillRect(x, 19, 2, 1); }
    this.textures.addCanvas('wbg2Beam', c);
  },
  wbg2PaintCrystal(key, ww, hh, tone){
    if (this.textures.exists(key)) return;
    const P = 3, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P + ww/2, P + hh/2);
    const T = [['#5a1a14', '#c8461f', '#ffb070'], ['#6a2410', '#e0701c', '#ffd080'], ['#58101c', '#d03030', '#ff9a80']][tone % 3];
    const top = -hh/2, bot = hh/2, sh = hh*0.28, w2 = ww/2;
    const face = (pts, col)=>{ this.wbg2Poly(g, pts); g.fillStyle = col; g.fill(); };
    face([[0, top], [-w2, top + sh], [-w2*0.3, bot - sh*0.2], [0, bot]], T[0]); face([[0, top], [w2, top + sh], [w2*0.3, bot - sh*0.2], [0, bot]], T[1]);
    face([[0, top], [-w2*0.1, top + sh*1.4], [w2*0.25, bot - sh*0.5], [w2*0.12, top + sh*1.1]], T[2]);
    g.strokeStyle = 'rgba(255,225,190,0.55)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-w2, top + sh); g.lineTo(0, top); g.lineTo(w2, top + sh); g.stroke();
    this.textures.addCanvas(key, c);
  },
  wbgBuild_benne(w){
    w.back.add(this.wbgGradient('wbg2GradB', '#07060c', '#150a0c', '#2a100c'));
    this.wbgGlowAt(w.back, 200, 640, 600, 0xe0501e, 0.3); this.wbgGlowAt(w.back, 330, 140, 420, 0x6e1d3a, 0.24);
    this.wbg2PaintWall(); this.wbg2PaintBeam(); this.wbg2PaintCone(); const WH = 1000;
    // poussière de la mine qui flotte
    const motes = Array.from({ length: 34 }, (_, i)=>{ const im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(5, 5).setTint(0xffb070).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.35); w.back.add(im); return { im, x: Math.random()*GAME_W, y: Math.random()*GAME_H, k: Math.random(), v: 6 + Math.random()*14 }; });
    // poutres d'étayage qui traversent, avec leur lampe suspendue et son cône de lumière
    const beams = [0, 1, 2].map(i=>{ const im = this.add.image(0, 0, 'wbg2Beam').setAlpha(0.6); const cone = this.add.image(0, 0, 'wbg2Cone').setOrigin(0.5, 0).setTint(0xffa040).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(80, 84).setAlpha(0.14);
      const lamp = this.add.image(0, 0, 'wbgGlow').setDisplaySize(22, 22).setTint(0xffaa3c).setBlendMode(Phaser.BlendModes.ADD); w.front.add(cone); w.front.add(im); w.front.add(lamp); return { im, cone, lamp, y: 180 + i*(WH/3), x: [130, 280, 200][i], i }; });
    const walls = [0, 1].map(()=>{ const im = this.add.image(0, 0, 'wbg2Wall').setAlpha(0.92); w.front.add(im); return im; });
    const glows = WBG2_CLUSTERS.map(([side, y], i)=>{ const e = wbg2WallEdge(y, side), im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(70, 70).setTint(i % 2 ? 0xff4a3c : 0xff9a3c).setBlendMode(Phaser.BlendModes.ADD); w.front.add(im); return { im, x: side ? 400 - e - 8 : e + 8, y, i }; });
    const lampsPos = [[40, 130], [360, 330], [44, 520], [356, 760], [48, 900]];
    const lamps = lampsPos.map(([x, y], i)=> Object.assign(this.wbg2Lamp(w.front, 0xffaa3c, 30), { y, i, left: x < 200 }));
    const rnd = wbgRng(131), items = [], SPD = [16, 30, 52], ALP = [0.6, 0.85, 1];
    for (let i = 0; i < 18; i++){
      const L = i % 3, ww = Math.round([10, 18, 34][L] + rnd()*[6, 8, 16][L]), hh = Math.round(ww*(2 + rnd()*0.7)), key = 'wbg2Cr' + i; this.wbg2PaintCrystal(key, ww, hh, i);
      const glow = this.add.image(0, 0, 'wbgGlow').setTint(i % 3 === 2 ? 0xff4a3c : 0xff9a3c).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(hh*2.2, hh*2.2).setAlpha(0.3);
      const im = this.add.image(0, 0, key).setAlpha(ALP[L]); w.front.add(glow); w.front.add(im);
      items.push({ im, glow, L, x: 70 + rnd()*260, y: rnd()*GAME_H, a: rnd()*360, va: (rnd() - 0.5)*(L === 2 ? 20 : 12), k: rnd() });
    }
    let sy = 0;
    w.update = (dt, boost, t)=>{
      sy = (sy + 24*boost*dt) % WH;
      walls.forEach((im, i)=> im.setPosition(0, sy + (i - 1)*WH + WH/2 - GAME_H/2));
      const wy = ty=>{ let y = sy + ty - WH; if (y < -40) y += WH; return y; };                                      // position écran d'un point de la paroi (y du carreau)
      glows.forEach(g=>{ const y = wy(g.y); g.im.setPosition(g.x - GAME_W/2, y - GAME_H/2).setAlpha(y > GAME_H + 40 ? 0 : 0.3 + 0.2*Math.sin(t*1.4 + g.i*1.9)); });
      beams.forEach(b=>{ const y = (sy + b.y) % WH - 40; b.im.setPosition(0, y - GAME_H/2); b.cone.setPosition(b.x - GAME_W/2, y + 14 - GAME_H/2).setAlpha(0.1 + 0.05*Math.sin(t*2 + b.i)); b.lamp.setPosition(b.x - GAME_W/2, y + 12 - GAME_H/2).setAlpha(0.6 + 0.3*Math.sin(t*1.3 + b.i*2)); });
      lamps.forEach(l=>{ const y = wy(l.y), e = wbg2WallEdge(l.y, l.left ? 0 : 1); this.wbg2LampAt(l, l.left ? e + 5 : GAME_W - e - 5, y, y > GAME_H + 40 ? 0 : (Math.sin(t*(1.3 + l.i*0.4) + l.i) > 0.2 ? 0.85 : 0.1)); });
      motes.forEach(m=>{ m.y += m.v*boost*dt; if (m.y > GAME_H + 10){ m.y = -10; m.x = Math.random()*GAME_W; } m.im.setPosition(m.x + Math.sin(t*0.6 + m.k*9)*10 - GAME_W/2, m.y - GAME_H/2).setAlpha(0.2 + 0.25*Math.abs(Math.sin(t*1.1 + m.k*20))); });
      for (const d of items){
        d.y += SPD[d.L]*boost*dt; d.a += d.va*dt; if (d.y > GAME_H + 80){ d.y = -80 - Math.random()*100; d.x = 70 + Math.random()*260; }
        const x = d.x + Math.sin(t*0.25 + d.k*9)*8 - GAME_W/2, y = d.y - GAME_H/2;
        d.im.setPosition(x, y).setAngle(d.a); d.glow.setPosition(x, y).setAlpha(0.22 + 0.16*Math.sin(t*1.6 + d.k*12));
      }
    };
  },

  // ---------------------------------------------------------------- LE BROYEUR : engrenages rivetés, scies, chaînes, mâchoires, forge rouge
  wbg2PaintGear(key, R, teeth){
    if (this.textures.exists(key)) return;
    const S = Math.ceil(2*R + 12), c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.translate(S/2, S/2);
    const br = R*0.84, step = Math.PI*2/teeth, pts = [];
    for (let i = 0; i < teeth; i++){ const a = i*step; pts.push([Math.cos(a)*br, Math.sin(a)*br], [Math.cos(a + step*0.14)*R, Math.sin(a + step*0.14)*R], [Math.cos(a + step*0.4)*R, Math.sin(a + step*0.4)*R], [Math.cos(a + step*0.54)*br, Math.sin(a + step*0.54)*br]); }
    const gr = g.createLinearGradient(-R, R, R, -R); gr.addColorStop(0, '#1c0e10'); gr.addColorStop(1, '#5a3030'); this.wbg2Poly(g, pts); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(255,175,120,0.4)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#26141a'; g.beginPath(); g.arc(0, 0, R*0.62, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,175,120,0.3)'; g.stroke();
    if (R > 40){ g.fillStyle = 'rgba(255,190,140,0.55)'; for (let i = 0; i < 14; i++){ const a = i/14*Math.PI*2; g.fillRect(Math.cos(a)*R*0.72 - 1, Math.sin(a)*R*0.72 - 1, 2.4, 2.4); } }        // rivets
    g.fillStyle = '#4a2a2a'; for (let i = 0; i < 6; i++){ g.save(); g.rotate(i*Math.PI/3); g.fillRect(-R*0.07, R*0.14, R*0.14, R*0.46); g.restore(); }
    g.fillStyle = '#0a0508'; g.beginPath(); g.arc(0, 0, R*0.16, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,200,150,0.5)'; g.stroke();
    this.textures.addCanvas(key, c);
  },
  wbg2PaintSaw(key, R, teeth){
    if (this.textures.exists(key)) return;
    const S = Math.ceil(2*R + 8), c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.translate(S/2, S/2);
    const br = R*0.86, step = Math.PI*2/teeth, pts = []; for (let i = 0; i < teeth; i++){ const a = i*step; pts.push([Math.cos(a)*br, Math.sin(a)*br], [Math.cos(a + step*0.1)*R, Math.sin(a + step*0.1)*R], [Math.cos(a + step*0.9)*br, Math.sin(a + step*0.9)*br]); }
    const gr = g.createLinearGradient(-R, R, R, -R); gr.addColorStop(0, '#2a2022'); gr.addColorStop(1, '#8a7c7e'); this.wbg2Poly(g, pts); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(255,215,190,0.5)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#120a0c'; for (let i = 0; i < 6; i++){ const a = i/6*Math.PI*2; g.beginPath(); g.arc(Math.cos(a)*R*0.5, Math.sin(a)*R*0.5, R*0.1, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(255,215,190,0.35)'; g.beginPath(); g.arc(0, 0, R*0.72, 0, 7); g.stroke(); g.fillStyle = '#3a2a2c'; g.beginPath(); g.arc(0, 0, R*0.2, 0, 7); g.fill(); g.stroke();
    this.textures.addCanvas(key, c);
  },
  wbg2PaintChain(){
    if (this.textures.exists('wbg2Chain')) return;
    const c = document.createElement('canvas'); c.width = 16; c.height = 28; const g = c.getContext('2d');
    g.strokeStyle = '#4a2c2a'; g.lineWidth = 3; g.beginPath(); g.ellipse(8, 8, 5, 9, 0, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,190,140,0.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(8, 8, 5, 9, 0, Math.PI*1.1, Math.PI*1.6); g.stroke();
    g.strokeStyle = '#3a2224'; g.lineWidth = 3; g.beginPath(); g.ellipse(8, 21, 2.6, 8, 0, 0, 7); g.stroke();
    this.textures.addCanvas('wbg2Chain', c);
  },
  wbg2PaintJaw(){
    if (this.textures.exists('wbg2Jaw')) return;
    const c = document.createElement('canvas'); c.width = 400; c.height = 96; const g = c.getContext('2d');
    g.fillStyle = '#1a0c10'; g.fillRect(0, 56, 400, 40);
    g.save(); g.beginPath(); g.rect(0, 74, 400, 10); g.clip(); for (let x = -12; x < 412; x += 12){ g.fillStyle = ((x/12) & 1) ? '#14100e' : '#f0b01a'; g.beginPath(); g.moveTo(x, 84); g.lineTo(x + 10, 74); g.lineTo(x + 22, 74); g.lineTo(x + 12, 84); g.closePath(); g.fill(); } g.restore();     // bande de chantier
    g.fillStyle = 'rgba(255,175,120,0.5)'; for (let x = 8; x < 400; x += 50){ g.fillRect(x, 62, 2, 2); g.fillRect(x, 90, 2, 2); }
    for (let i = 0; i < 9; i++){ const x = i*50 + 2, gr = g.createLinearGradient(x, 0, x + 46, 0); gr.addColorStop(0, '#2a1418'); gr.addColorStop(1, '#6a3a34');
      g.fillStyle = gr; this.wbg2Poly(g, [[x, 60], [x + 46, 60], [x + 24, 6]]); g.fill();
      g.strokeStyle = 'rgba(255,190,140,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, 60); g.lineTo(x + 24, 6); g.stroke();
      g.fillStyle = 'rgba(255,120,60,0.4)'; this.wbg2Poly(g, [[x + 19, 14], [x + 24, 6], [x + 29, 14]]); g.fill(); }                                       // pointes chauffées par la forge
    g.strokeStyle = 'rgba(255,170,110,0.4)'; g.beginPath(); g.moveTo(0, 56.5); g.lineTo(400, 56.5); g.stroke();
    this.textures.addCanvas('wbg2Jaw', c);
  },
  wbgBuild_broyeur(w){
    w.back.add(this.wbgGradient('wbg2GradR', '#0c0508', '#1c080c', '#33100e'));
    const forge = this.wbgGlowAt(w.back, 200, 360, 760, 0xff5a2a, 0.22); this.wbgGlowAt(w.back, 200, 0, 460, 0x8c1c24, 0.3);
    this.wbg2PaintGear('wbg2G1', 150, 16); this.wbg2PaintGear('wbg2G2', 190, 20); this.wbg2PaintGear('wbg2G3', 92, 12); this.wbg2PaintJaw(); this.wbg2PaintChain();
    this.wbg2PaintSaw('wbg2S1', 72, 22); this.wbg2PaintSaw('wbg2S2', 56, 18);
    const gears = [{ k: 'wbg2G1', x: -6, y: 190, sp: 9, a: 0.85 }, { k: 'wbg2G2', x: 412, y: 520, sp: -7.2, a: 0.85 }, { k: 'wbg2G3', x: 52, y: 470, sp: -13, a: 0.9 }, { k: 'wbg2G3', x: 350, y: 120, sp: 13, a: 0.9 }].map((d, i)=>{
      const im = this.add.image(d.x - GAME_W/2, d.y - GAME_H/2, d.k).setAlpha(d.a); w.back.add(im);
      const hub = this.add.image(d.x - GAME_W/2, d.y - GAME_H/2, 'wbgGlow').setDisplaySize(26, 26).setTint(0xff3a28).setBlendMode(Phaser.BlendModes.ADD); w.back.add(hub); return Object.assign(d, { im, hub, i }); });
    // chaînes qui pendent du plafond et défilent
    const chains = [[112, 0.4], [292, 1.7]].map(([x, ph])=>{ const ts = this.add.tileSprite(x - GAME_W/2, -GAME_H/2 - 10, 16, GAME_H*0.78, 'wbg2Chain').setOrigin(0.5, 0).setAlpha(0.5); w.back.add(ts); return { ts, ph }; });
    // scies circulaires dans les coins
    const saws = [{ k: 'wbg2S1', x: 338, y: 330, sp: 190 }, { k: 'wbg2S2', x: 34, y: 640, sp: -240 }].map(d=>{ const im = this.add.image(d.x - GAME_W/2, d.y - GAME_H/2, d.k).setAlpha(0.8); w.front.add(im); return Object.assign(d, { im }); });
    const jawB = this.add.image(0, GAME_H/2 - 40, 'wbg2Jaw').setAlpha(0.95); w.front.add(jawB);
    const jawT = this.add.image(0, -GAME_H/2 + 40, 'wbg2Jaw').setFlipY(true).setAlpha(0.95); w.front.add(jawT);
    const sparks = Array.from({ length: 22 }, ()=>{ const im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(7, 7).setTint(0xffa040).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0); w.front.add(im); return { im, x: Math.random()*GAME_W, y: GAME_H + Math.random()*200, vy: 30 + Math.random()*70, k: Math.random() }; });
    const cs = Array.from({ length: 12 }, ()=>{ const im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(6, 6).setTint(0xffd080).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0); w.front.add(im); return { im, x: 0, y: 0, vx: 0, vy: 0, life: 0 }; });          // étincelles de contact des mâchoires
    let cd = 0;
    w.update = (dt, boost, t)=>{
      gears.forEach(d=>{ d.im.setAngle(t*d.sp*boost); d.hub.setAlpha(Math.sin(t*2.1 + d.i*1.7) > 0 ? 0.85 : 0.15); });
      chains.forEach(c=>{ c.ts.tilePositionY -= 12*boost*dt; c.ts.setAngle(Math.sin(t*0.5 + c.ph)*1.6); });
      saws.forEach(s=> s.im.setAngle(t*s.sp));
      const open = 0.5 + 0.5*Math.sin(t*0.8);
      jawB.setY(GAME_H/2 - 30 + 16*open); jawT.setY(-GAME_H/2 + 30 - 16*open);
      cd += dt; if (open < 0.12 && cd > 0.04){ cd = 0; const sp = cs.find(s=>s.life <= 0); if (sp){ const top = Math.random() < 0.5; sp.x = Math.random()*GAME_W; sp.y = top ? 60 : GAME_H - 56; sp.vx = (Math.random() - 0.5)*120; sp.vy = (top ? 1 : -1)*(20 + Math.random()*70); sp.life = 0.4 + Math.random()*0.4; } }
      for (const s of cs){ if (s.life <= 0){ s.im.setAlpha(0); continue; } s.life -= dt; s.x += s.vx*dt; s.y += s.vy*dt; s.im.setPosition(s.x - GAME_W/2, s.y - GAME_H/2).setAlpha(Math.min(1, s.life*3)); }
      forge.setAlpha(0.18 + 0.1*Math.sin(t*1.4) + 0.06*Math.sin(t*5.3));
      for (const s of sparks){ s.y -= s.vy*boost*dt; s.x += Math.sin(t*2 + s.k*9)*8*dt; if (s.y < -20){ s.y = GAME_H + Math.random()*120; s.x = Math.random()*GAME_W; } s.im.setPosition(s.x - GAME_W/2, s.y - GAME_H/2).setAlpha(0.3 + 0.5*Math.abs(Math.sin(t*4 + s.k*20))*(s.y > 60 ? 1 : s.y/60)); }
    };
  },
});
