"use strict";
// Méthodes de GameScene — fonds propres à un monde : la planète du monde reste visible, un décor par niveau (`bg` dans data/worlds/*.js).
// Fonds du monde 1 : 'horizon' (le bord de la Terre en bas) · 'debris' (la Terre au loin, la Lune, des épaves) · 'station' (une station AGP qui traverse)
// · 'cristaux' (champ de cristaux turquoise) · 'patrouille' (couloir balisé, feux rouges/verts) · 'direction' (le siège : rais dorés, contrats qui flottent).
// Les décors sont dessinés dans deux conteneurs (derrière / devant les étoiles) en coordonnées d'ÉCRAN (0..GAME_W, 0..GAME_H) :
// à chaque image on les met à l'échelle 1/zoom pour annuler le dézoom de la caméra (le décor garde la même composition à toute distance).
function wbgRng(seed){ let s = seed >>> 0; return ()=> ((s = (s*1664525 + 1013904223) >>> 0) / 4294967296); }

mixin(GameScene, {
  // fond du niveau en cours : `bg` du niveau (le tuto n'a pas de lvDef : on lit son entrée dans le monde)
  worldBgKind(){
    const d = this.lvDef || (this.tuto && typeof levelById === 'function' ? levelById('w1-tuto') : null);
    return (d && d.bg) || null;
  },

  buildWorldBg(){
    this.wbg = null;
    const kind = this.worldBgKind(), fn = kind && this['wbgBuild_' + kind];
    if (!fn || !this.textures.exists('bgTerre')) return;
    const cx = GAME_W/2, cy = GAME_H/2;
    const back = this.add.container(cx, cy).setDepth(-3), front = this.add.container(cx, cy).setDepth(0.5);
    const planet = this.add.container(0, 0); front.add(planet);          // tout ce qui est « la planète du monde » (disque, halo, atmosphère, lune) : se révèle en fondu
    this.wbg = { kind, back, front, planet, t:0, update:null, hold:!!(this.lvDef && this.lvDef.intro === 'earth' && !this.sandbox) };
    if (this.wbg.hold) planet.setAlpha(0);
    this.wbgTextures();
    fn.call(this, this.wbg);
    this.updateWorldBg(0);
  },

  // appelé à chaque image : annule le zoom de la caméra, fait vivre le décor (défile avec l'accélération du décor en overdrive)
  updateWorldBg(delta){
    const w = this.wbg; if (!w) return;
    const k = 1 / this.cameras.main.zoom, dt = delta/1000, boost = 1 + ((this._bgBoost||1) - 1)*0.8;
    w.back.setScale(k); w.front.setScale(k); w.t += dt;
    if (w.hold && this.running && !this.introActive){ w.hold = false; this.tweens.add({ targets:w.planet, alpha:1, duration:5000, ease:'Sine.easeInOut' }); }     // décollage fini : la planète du fond se dévoile
    if (w.update) w.update(dt, boost, w.t);
  },

  // textures partagées : halo radial blanc (teinté et additif selon l'usage)
  wbgTextures(){
    if (this.textures.exists('wbgGlow')) return;
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); this.textures.addCanvas('wbgGlow', c);
  },

  // dégradé vertical plein écran (haut -> bas)
  wbgGradient(key, c0, c1, c2){
    if (!this.textures.exists(key)){
      const c = document.createElement('canvas'); c.width = 4; c.height = GAME_H; const g = c.getContext('2d');
      const l = g.createLinearGradient(0, 0, 0, GAME_H); l.addColorStop(0, c0); l.addColorStop(c2 ? 0.6 : 1, c1); if (c2) l.addColorStop(1, c2);
      g.fillStyle = l; g.fillRect(0, 0, 4, GAME_H); this.textures.addCanvas(key, c);
    }
    return this.add.image(0, 0, key).setDisplaySize(GAME_W + 4, GAME_H + 4);
  },

  // halo teinté additif posé à (x, y) écran
  wbgGlowAt(parent, x, y, size, color, alpha){
    const im = this.add.image(x - GAME_W/2, y - GAME_H/2, 'wbgGlow').setDisplaySize(size, size).setTint(color).setAlpha(alpha).setBlendMode(Phaser.BlendModes.ADD);
    parent.add(im); return im;
  },

  // la Terre de ta direction artistique (bg_terre.webp) : disque pixel-art + ombre côté nuit pour le volume
  wbgEarthTexture(key, shade){
    if (this.textures.exists(key)) return key;
    const src = this.textures.get('bgTerre').getSourceImage(), S = 800, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
    g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, S, S); g.globalCompositeOperation = 'source-atop';
    const r = g.createRadialGradient(S*(0.5 - shade*0.28), S*0.45, S*0.15, S*0.5, S*0.5, S*0.55);
    r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.7, 'rgba(0,4,20,0.35)'); r.addColorStop(1, 'rgba(0,2,14,0.8)');
    g.fillStyle = r; g.fillRect(0, 0, S, S); this.textures.addCanvas(key, c); return key;
  },

  // liseré d'atmosphère : quelques arcs additifs de plus en plus fins
  wbgAtmosphere(parent, x, y, r, a, rgb){
    const gr = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); parent.add(gr);
    [[22, 0.05], [10, 0.09], [4, 0.17], [1.6, 0.42]].forEach(([w, al])=>{ gr.lineStyle(w, rgb, Math.min(1, al*a)); gr.beginPath(); gr.arc(x - GAME_W/2, y - GAME_H/2, r, 0, Math.PI*2); gr.strokePath(); });
    return gr;
  },


  // une épave (plaque, panneau solaire, éclat, tube) : dégradé de métal froid, lumière du soleil en haut à droite, détails discrets
  wbgPaintDebris(key, k, ww, hh, L){
    if (this.textures.exists(key)) return;
    const P = 4, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P + ww/2, P + hh/2);
    const BASE = ['#16233a', '#1c2b45', '#243652'][L], HI = ['#2b3d5c', '#3a4f74', '#506a94'][L];
    const metal = (x, y, w, h)=>{ const gr = g.createLinearGradient(x, y + h, x + w, y); gr.addColorStop(0, BASE); gr.addColorStop(1, HI); g.fillStyle = gr; g.fillRect(x, y, w, h); };
    const edge = (x, y, w, h)=>{ g.strokeStyle = 'rgba(190,215,255,0.5)'; g.lineWidth = L === 2 ? 1.2 : 0.8; g.beginPath(); g.moveTo(x, y + 0.5); g.lineTo(x + w, y + 0.5); g.lineTo(x + w - 0.5, y + h); g.stroke(); };
    if (k < 0.3 && L > 0){                                    // panneau solaire : cellules bleues + cadre clair
      g.fillStyle = '#0c2146'; g.fillRect(-ww/2, -hh/2, ww, hh); g.strokeStyle = 'rgba(70,130,210,0.55)'; g.lineWidth = 0.7;
      for (let q = 1; q < 5; q++){ g.beginPath(); g.moveTo(-ww/2 + ww*q/5, -hh/2); g.lineTo(-ww/2 + ww*q/5, hh/2); g.stroke(); }
      g.beginPath(); g.moveTo(-ww/2, 0); g.lineTo(ww/2, 0); g.stroke();
      const sh = g.createLinearGradient(-ww/2, hh/2, ww/2, -hh/2); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(160,200,255,0.28)'); g.fillStyle = sh; g.fillRect(-ww/2, -hh/2, ww, hh);
      g.strokeStyle = 'rgba(150,175,210,0.7)'; g.lineWidth = 1; g.strokeRect(-ww/2 + 0.5, -hh/2 + 0.5, ww - 1, hh - 1);
    } else if (k < 0.55){                                     // plaque de tôle : seams + rivets
      metal(-ww/2, -hh/2, ww, hh); edge(-ww/2, -hh/2, ww, hh);
      g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-ww/2, 0); g.lineTo(ww/2, 0); g.stroke();
      if (L > 0){ g.fillStyle = 'rgba(210,225,255,0.5)'; for (const sx of [-1, 1]) g.fillRect(sx*(ww/2 - 3) - 0.5, -hh/2 + 1.5, 1, 1); }
    } else if (k < 0.8){                                      // éclat de coque : deux facettes
      g.beginPath(); g.moveTo(-ww/2, hh/3); g.lineTo(-ww/5, -hh/2); g.lineTo(ww/2, -hh/4); g.lineTo(ww/3, hh/2); g.closePath();
      const gr = g.createLinearGradient(-ww/2, hh/2, ww/2, -hh/2); gr.addColorStop(0, BASE); gr.addColorStop(1, HI); g.fillStyle = gr; g.fill();
      g.beginPath(); g.moveTo(-ww/5, -hh/2); g.lineTo(ww/2, -hh/4); g.lineTo(0, 0); g.closePath(); g.fillStyle = 'rgba(190,215,255,0.22)'; g.fill();
      g.strokeStyle = 'rgba(190,215,255,0.35)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-ww/5, -hh/2); g.lineTo(ww/2, -hh/4); g.stroke();
    } else {                                                  // tube : dégradé de cylindre
      const cy = g.createLinearGradient(0, -hh/5, 0, hh/5); cy.addColorStop(0, HI); cy.addColorStop(0.5, BASE); cy.addColorStop(1, '#0d1626'); g.fillStyle = cy; g.fillRect(-ww/2, -hh/5, ww, hh/2.5);
      g.beginPath(); g.arc(-ww/2, 0, hh/2.2, 0, 7); g.fillStyle = '#0b1220'; g.fill(); g.strokeStyle = 'rgba(190,215,255,0.4)'; g.lineWidth = 0.8; g.stroke();
    }
    this.textures.addCanvas(key, c);
  },

  // ---------------------------------------------------------------- HORIZON : on vole le long de la Terre
  wbgBuild_horizon(w){
    const R = 620, ex = GAME_W/2, ey = GAME_H - 250 + R;
    w.back.add(this.wbgGradient('wbgGradH', '#03050d', '#0a1434', '#16346e'));
    this.wbgGlowAt(w.back, 320, 200, 440, 0x3c288c, 0.35);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbgEarth0', 0)).setDisplaySize(2*R, 2*R); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, R, 2.2, 0x5aaaff);
    const sx = 330, sy = ey - Math.sqrt(R*R - (sx - ex)*(sx - ex));
    const glare = this.wbgGlowAt(w.planet, sx, sy, 340, 0xffbe6e, 0.9);
    const core = this.wbgGlowAt(w.planet, sx, sy, 70, 0xfff0c8, 0.9);
    const ray = this.add.rectangle(sx - GAME_W/2, sy - GAME_H/2, 120, 1.5, 0xffdca0, 0.5).setBlendMode(Phaser.BlendModes.ADD); w.planet.add(ray);
    const mist = this.add.image(0, ey - R - 30 - GAME_H/2, 'wbgGlow').setDisplaySize(GAME_W*1.6, 130).setTint(0x3c8cff).setAlpha(0.22).setBlendMode(Phaser.BlendModes.ADD); w.planet.add(mist);
    w.update = (dt, boost, t)=>{
      earth.y = ey - GAME_H/2 + Math.sin(t*0.35)*5;
      const p = 0.85 + 0.15*Math.sin(t*1.3); glare.setDisplaySize(340*p, 340*p); core.setAlpha(0.8 + 0.15*Math.sin(t*1.3));
    };
  },

  // ---------------------------------------------------------------- DEBRIS : la Terre au loin, la Lune, des épaves sur trois profondeurs
  wbgBuild_debris(w){
    w.back.add(this.wbgGradient('wbgGradD', '#04101c', '#071a2e'));
    this.wbgGlowAt(w.back, 90, 420, 480, 0x1e7896, 0.30); this.wbgGlowAt(w.back, 330, 120, 400, 0x463ca0, 0.28);
    const ex = 318, ey = 140, R = 118;
    this.wbgGlowAt(w.planet, ex, ey, R*3.8, 0x3c8cff, 0.22);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbgEarth1', 0.35)).setDisplaySize(2*R, 2*R); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, R, 0.8, 0x5aaaff);
    // la Lune : petit disque gris à cratères, ombre côté nuit
    if (!this.textures.exists('wbgMoon')){
      const c = document.createElement('canvas'); c.width = c.height = 56; const g = c.getContext('2d');
      const r = g.createRadialGradient(20, 20, 2, 28, 28, 25); r.addColorStop(0, '#c9cdd3'); r.addColorStop(1, '#444b57'); g.fillStyle = r; g.beginPath(); g.arc(28, 28, 24, 0, 7); g.fill();
      g.fillStyle = 'rgba(60,66,78,0.55)'; [[-8, -4, 5], [7, 6, 6], [-2, 11, 3], [9, -9, 3]].forEach(([dx, dy, rr])=>{ g.beginPath(); g.arc(28 + dx, 28 + dy, rr, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(0,0,10,0.45)'; g.beginPath(); g.arc(28, 28, 24, Math.PI*0.55, Math.PI*1.55); g.fill(); this.textures.addCanvas('wbgMoon', c);
    }
    const moon = this.add.image(70 - GAME_W/2, 250 - GAME_H/2, 'wbgMoon'); w.planet.add(moon);
    // épaves : silhouettes sombres au liseré chaud (plaques, éclats, tubes), 3 profondeurs
    const rnd = wbgRng(5), items = [], SPD = [18, 34, 62], ALP = [0.55, 0.8, 1];
    for (let i = 0; i < 26; i++){
      const L = i % 3, k = rnd(), ww = Math.ceil((L === 0 ? 10 : L === 1 ? 18 : 34) + rnd()*(L === 2 ? 40 : 16)), hh = Math.ceil((L === 0 ? 4 : L === 1 ? 7 : 12) + rnd()*(L === 2 ? 20 : 8));
      const key = 'wbgDeb' + i; this.wbgPaintDebris(key, k, ww, hh, L);
      const im = this.add.image(0, 0, key).setAlpha(ALP[L]); w.front.add(im);
      items.push({ im, L, x: rnd()*GAME_W, y: rnd()*GAME_H, a: rnd()*360, va: (rnd() - 0.5)*(L === 2 ? 28 : 17), k: rnd() });
    }
    w.update = (dt, boost, t)=>{
      for (const d of items){
        d.y += SPD[d.L]*boost*dt; d.a += d.va*dt; if (d.y > GAME_H + 60){ d.y = -60 - Math.random()*80; d.x = Math.random()*GAME_W; }
        d.im.setPosition(d.x + Math.sin(t*0.2 + d.k*9)*6 - GAME_W/2, d.y - GAME_H/2).setAngle(d.a);
      }
      earth.y = ey - GAME_H/2 + Math.sin(t*0.4)*3; moon.y = 250 - GAME_H/2 + Math.sin(t*0.5 + 1)*3;
    };
  },

  // ---------------------------------------------------------------- STATION : une station de l'agence traverse le fond
  wbgBuild_station(w){
    w.back.add(this.wbgGradient('wbgGradS', '#0b0716', '#10081a'));
    this.wbgGlowAt(w.back, 320, 520, 520, 0x963c3c, 0.22); this.wbgGlowAt(w.back, 70, 330, 460, 0x5032aa, 0.30);
    const ex = 40, ey = 150, R = 210;
    this.wbgGlowAt(w.planet, ex, ey, R*3.2, 0x4682ff, 0.18);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbgEarth2', 0.4)).setDisplaySize(2*R, 2*R); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, R, 0.8, 0x5aaaff);
    // la station est dessinée une fois dans une texture (origine au centre), inclinée ; les voyants sont des halos qui clignotent
    const TW = 900, TH = 1300, OX = TW/2, OY = TH/2, ANG = -0.33;
    const LAMPS = [[-34, -300], [34, -190], [-34, -80], [34, 30], [-34, 140], [34, 250], [0, -470], [-70, -442], [70, -442]];
    if (!this.textures.exists('wbgStation')){
      const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d');
      const hull = (x, y, ww, hh)=>{ const gr = g.createLinearGradient(x, y + hh, x + ww, y); gr.addColorStop(0, '#141d31'); gr.addColorStop(1, '#2f4263'); g.fillStyle = gr; g.fillRect(x, y, ww, hh);
        g.strokeStyle = 'rgba(190,215,255,0.38)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 0.5); g.lineTo(x + ww, y + 0.5); g.lineTo(x + ww - 0.5, y + hh); g.stroke();
        g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + hh - 0.5); g.lineTo(x + ww, y + hh - 0.5); g.stroke(); };
      const panel = (x, y, ww, hh)=>{ g.fillStyle = '#0c2146'; g.fillRect(x, y, ww, hh); g.strokeStyle = 'rgba(70,130,210,0.5)'; g.lineWidth = 0.8;
        for (let q = 1; q < 6; q++){ g.beginPath(); g.moveTo(x + q*ww/6, y); g.lineTo(x + q*ww/6, y + hh); g.stroke(); } for (let q = 1; q < 3; q++){ g.beginPath(); g.moveTo(x, y + q*hh/3); g.lineTo(x + ww, y + q*hh/3); g.stroke(); }
        const sh = g.createLinearGradient(x, y + hh, x + ww, y); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(160,200,255,0.25)'); g.fillStyle = sh; g.fillRect(x, y, ww, hh);
        g.strokeStyle = 'rgba(150,175,210,0.7)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, ww - 1, hh - 1); };
      g.translate(OX, OY); g.rotate(ANG);
      hull(-20, -420, 40, 840);
      for (let k = -3; k <= 3; k++){ hull(-34, k*110 - 30, 68, 60);
        g.fillStyle = 'rgba(255,205,120,0.85)'; for (let q = 0; q < 4; q++) if ((k + q) % 3 !== 0) g.fillRect(-26 + q*14, k*110 - 6, 6, 3); }       // hublots éclairés
      for (const sg of [-1, 1]) for (let k = -3; k <= 3; k += 2) panel(sg > 0 ? 34 : -34 - 120, k*110 - 40, 120, 80);
      hull(-70, -455, 140, 26); hull(-8, -500, 16, 48);
      g.fillStyle = '#f6b21a'; g.fillRect(-14, -14, 28, 18); g.fillStyle = '#0a0f1c'; g.fillRect(-9, -9, 18, 8);          // plaque AGP
      this.textures.addCanvas('wbgStation', c);
    }
    const st = this.add.image(0, 0, 'wbgStation').setAlpha(0.88); w.front.add(st);
    const cos = Math.cos(ANG), sin = Math.sin(ANG);
    const lamps = LAMPS.map(([x, y], i)=>{
      const im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(34, 34).setTint(i % 3 === 0 ? 0xff4632 : 0xffaa3c).setBlendMode(Phaser.BlendModes.ADD); w.front.add(im);
      return { im, lx: x*cos - y*sin, ly: x*sin + y*cos, i };
    });
    const PERIOD = 2400; let y = -120;                           // la station défile lentement et revient après un long vide
    w.update = (dt, boost, t)=>{
      y += 16*boost*dt; if (y > PERIOD - 1000) y = -1000;
      const sy = y - GAME_H/2, sx = 235 - GAME_W/2; st.setPosition(sx, sy);
      lamps.forEach(l=>{ const on = Math.sin(t*(1.4 + l.i*0.37) + l.i*2) > 0.15; l.im.setPosition(sx + l.lx, sy + l.ly).setAlpha(on ? 0.9 : 0); });
      earth.y = ey - GAME_H/2 + Math.sin(t*0.3)*4;
    };
  },
  // ---------------------------------------------------------------- CRISTAUX : un champ de cristaux turquoise (Pluie de cristaux)
  wbgPaintCrystal(key, ww, hh, tone){
    if (this.textures.exists(key)) return;
    const P = 3, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P + ww/2, P + hh/2);
    const T = [['#0a5a66', '#12a3ae', '#6ff3ee'], ['#0b4a6e', '#1788c4', '#7fd4ff'], ['#0e6a5a', '#1fbf9a', '#8bffd6']][tone % 3];
    const top = -hh/2, bot = hh/2, sh = hh*0.28, w2 = ww/2;
    const face = (pts, col)=>{ g.beginPath(); pts.forEach(([x, y], i)=> i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = col; g.fill(); };
    face([[0, top], [-w2, top + sh], [-w2*0.3, bot - sh*0.2], [0, bot]], T[0]);            // facette gauche, sombre
    face([[0, top], [w2, top + sh], [w2*0.3, bot - sh*0.2], [0, bot]], T[1]);               // facette droite
    face([[0, top], [-w2*0.1, top + sh*1.4], [w2*0.25, bot - sh*0.5], [w2*0.12, top + sh*1.1]], T[2]);   // reflet clair
    g.strokeStyle = 'rgba(200,255,250,0.55)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-w2, top + sh); g.lineTo(0, top); g.lineTo(w2, top + sh); g.stroke();
    this.textures.addCanvas(key, c);
  },
  wbgBuild_cristaux(w){
    w.back.add(this.wbgGradient('wbgGradK', '#03121a', '#052029', '#0a303a'));
    this.wbgGlowAt(w.back, 110, 520, 560, 0x1ec8b4, 0.26); this.wbgGlowAt(w.back, 330, 150, 440, 0x5a3cc8, 0.22);
    const ex = 40, ey = 570, R = 190;
    this.wbgGlowAt(w.planet, ex, ey, R*3.2, 0x2ec8ff, 0.18);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbgEarth3', 0.3)).setDisplaySize(2*R, 2*R); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, R, 0.9, 0x4adcff);
    const rnd = wbgRng(19), items = [], SPD = [16, 30, 52], ALP = [0.6, 0.85, 1];
    for (let i = 0; i < 17; i++){
      const L = i % 3, ww = Math.round([10, 18, 34][L] + rnd()*[6, 8, 16][L]), hh = Math.round(ww*(2 + rnd()*0.7)), key = 'wbgCr' + i;
      this.wbgPaintCrystal(key, ww, hh, i);
      const glow = this.add.image(0, 0, 'wbgGlow').setTint(i % 3 === 1 ? 0x44b8ff : 0x34f0d8).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(hh*2.2, hh*2.2).setAlpha(0.3);
      const im = this.add.image(0, 0, key).setAlpha(ALP[L]); w.front.add(glow); w.front.add(im);
      items.push({ im, glow, L, x: rnd()*GAME_W, y: rnd()*GAME_H, a: rnd()*360, va: (rnd() - 0.5)*(L === 2 ? 20 : 12), k: rnd(), base: hh*2.2 });
    }
    w.update = (dt, boost, t)=>{
      for (const d of items){
        d.y += SPD[d.L]*boost*dt; d.a += d.va*dt; if (d.y > GAME_H + 80){ d.y = -80 - Math.random()*100; d.x = Math.random()*GAME_W; }
        const x = d.x + Math.sin(t*0.25 + d.k*9)*8 - GAME_W/2, y = d.y - GAME_H/2;
        d.im.setPosition(x, y).setAngle(d.a); d.glow.setPosition(x, y).setAlpha(0.22 + 0.16*Math.sin(t*1.6 + d.k*12));      // chaque cristal scintille à son rythme
      }
      earth.y = ey - GAME_H/2 + Math.sin(t*0.3)*4;
    };
  },

  // ---------------------------------------------------------------- PATROUILLE : couloir orbital balisé de l'agence (feux rouges / verts qui défilent)
  wbgBuild_patrouille(w){
    w.back.add(this.wbgGradient('wbgGradP', '#070a1c', '#0e0b26', '#150a2c'));
    this.wbgGlowAt(w.back, 300, 430, 520, 0xa03cb4, 0.24); this.wbgGlowAt(w.back, 70, 220, 440, 0x2850c8, 0.26);
    const ex = 210, ey = 10, R = 200;
    this.wbgGlowAt(w.planet, ex, ey + 40, R*3.2, 0x3c8cff, 0.2);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbgEarth4', 0.0)).setDisplaySize(2*R, 2*R); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, R, 1.1, 0x5aaaff);
    // deux files de balises : feux rouges à gauche, verts à droite, espacés de 64 px, qui descendent ; un fil très pâle les relie
    const lane = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); w.front.add(lane);
    lane.lineStyle(1, 0x9ab4ff, 0.10); [88, 312].forEach(x=>{ lane.beginPath(); lane.moveTo(x - GAME_W/2, -GAME_H/2); lane.lineTo(x - GAME_W/2, GAME_H/2); lane.strokePath(); });
    const lamps = [];
    for (let side = 0; side < 2; side++) for (let i = 0; i < 13; i++){
      const im = this.add.image(0, 0, 'wbgGlow').setDisplaySize(22, 22).setTint(side ? 0x44ff8a : 0xff4a3c).setBlendMode(Phaser.BlendModes.ADD); w.front.add(im);
      lamps.push({ im, side, y: i*64, ph: (i + side*0.5)*0.55 });
    }
    // balises de navigation : petits octaèdres métalliques à lampe, plus loin et plus lentes
    if (!this.textures.exists('wbgBuoy')){
      const c = document.createElement('canvas'); c.width = 24; c.height = 34; const g = c.getContext('2d');
      const f = (pts, col)=>{ g.beginPath(); pts.forEach(([x, y], i)=> i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = col; g.fill(); };
      f([[12, 2], [3, 17], [12, 17]], '#2c3a5e'); f([[12, 2], [21, 17], [12, 17]], '#46598a'); f([[12, 32], [3, 17], [12, 17]], '#161d33'); f([[12, 32], [21, 17], [12, 17]], '#26324f');
      g.strokeStyle = 'rgba(190,215,255,0.45)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(3, 17); g.lineTo(12, 2); g.lineTo(21, 17); g.stroke(); this.textures.addCanvas('wbgBuoy', c);
    }
    const rnd = wbgRng(31), buoys = Array.from({ length: 6 }, (_, i)=>{
      const im = this.add.image(0, 0, 'wbgBuoy').setAlpha(0.85); const lamp = this.add.image(0, 0, 'wbgGlow').setDisplaySize(18, 18).setTint(0xffb43c).setBlendMode(Phaser.BlendModes.ADD); w.front.add(im); w.front.add(lamp);
      return { im, lamp, x: 40 + rnd()*320, y: rnd()*GAME_H, k: rnd(), a: (rnd() - 0.5)*30 };
    });
    w.update = (dt, boost, t)=>{
      for (const l of lamps){
        l.y += 40*boost*dt; if (l.y > GAME_H + 40) l.y -= 13*64;
        l.im.setPosition((l.side ? 312 : 88) - GAME_W/2, l.y - GAME_H/2).setAlpha(0.35 + 0.6*Math.max(0, Math.sin(t*2.2 + l.ph)));
      }
      for (const b of buoys){
        b.y += 22*boost*dt; if (b.y > GAME_H + 40){ b.y = -40; b.x = 40 + Math.random()*320; }
        const x = b.x - GAME_W/2, y = b.y - GAME_H/2; b.im.setPosition(x, y).setAngle(Math.sin(t*0.4 + b.k*6)*8 + b.a); b.lamp.setPosition(x, y).setAlpha(Math.sin(t*3 + b.k*9) > 0.3 ? 0.9 : 0.12);
      }
      earth.y = ey - GAME_H/2 + Math.sin(t*0.3)*3;
    };
  },

  // ---------------------------------------------------------------- DIRECTION : le siège (Le PDG) — pénombre bordeaux, rais de lumière, contrats qui flottent
  wbgPaintPaper(key, ww, hh, L){
    if (this.textures.exists(key)) return;
    const P = 2, c = document.createElement('canvas'); c.width = ww + 2*P; c.height = hh + 2*P; const g = c.getContext('2d'); g.translate(P, P);
    g.fillStyle = ['#8a8ea0', '#b4b8c8', '#d4d8e4'][L]; g.fillRect(0, 0, ww, hh); g.strokeStyle = 'rgba(40,46,70,0.45)'; g.lineWidth = 0.8;
    for (let y = 3; y < hh - 2; y += L === 2 ? 4 : 3){ g.beginPath(); g.moveTo(2, y); g.lineTo(ww - (y % 7 === 0 ? 6 : 2), y); g.stroke(); }
    g.fillStyle = 'rgba(180,40,50,0.7)'; g.fillRect(ww - 6, hh - 6, 4, 4);          // tampon rouge
    this.textures.addCanvas(key, c);
  },
  wbgBuild_direction(w){
    w.back.add(this.wbgGradient('wbgGradX', '#10060d', '#1a0a14', '#241019'));
    this.wbgGlowAt(w.back, 200, 40, 520, 0x8c3c50, 0.26); this.wbgGlowAt(w.back, 90, 520, 460, 0x3c2878, 0.22);
    // rais de lumière dorée qui tombent du haut, très discrets, qui respirent
    if (!this.textures.exists('wbgRay')){
      const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); const l = g.createLinearGradient(0, 0, 0, 256);
      l.addColorStop(0, 'rgba(255,214,140,0.9)'); l.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = l; g.beginPath(); g.moveTo(26, 0); g.lineTo(38, 0); g.lineTo(64, 256); g.lineTo(0, 256); g.closePath(); g.fill(); this.textures.addCanvas('wbgRay', c);
    }
    const rays = [[110, -12, 150], [210, 0, 190], [300, 14, 140]].map(([x, ang, wd])=>{ const im = this.add.image(x - GAME_W/2, -GAME_H/2 + 60, 'wbgRay').setOrigin(0.5, 0).setDisplaySize(wd, 640).setAngle(ang).setTint(0xffd28c).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.06); w.back.add(im); return im; });
    const ex = 330, ey = 600, R = 150;
    this.wbgGlowAt(w.planet, ex, ey, R*3.0, 0xffa050, 0.16);
    const earth = this.add.image(ex - GAME_W/2, ey - GAME_H/2, this.wbgEarthTexture('wbgEarth5', -0.3)).setDisplaySize(2*R, 2*R); w.planet.add(earth);
    this.wbgAtmosphere(w.planet, ex, ey, R, 1.0, 0xffc070);
    const rnd = wbgRng(47), items = [], SPD = [14, 26, 44], ALP = [0.45, 0.65, 0.85];
    for (let i = 0; i < 21; i++){
      const L = i % 3, ww = Math.round([8, 14, 24][L] + rnd()*[3, 5, 8][L]), hh = Math.round(ww*1.35), key = 'wbgPap' + i; this.wbgPaintPaper(key, ww, hh, L);
      const im = this.add.image(0, 0, key).setAlpha(ALP[L]); w.front.add(im); items.push({ im, L, x: rnd()*GAME_W, y: rnd()*GAME_H, a: rnd()*360, va: (rnd() - 0.5)*(L === 2 ? 70 : 45), k: rnd() });
    }
    w.update = (dt, boost, t)=>{
      rays.forEach((r, i)=> r.setAlpha(0.045 + 0.04*(0.5 + 0.5*Math.sin(t*0.5 + i*2.1))));
      for (const d of items){
        d.y += SPD[d.L]*boost*dt; d.a += d.va*dt; if (d.y > GAME_H + 40){ d.y = -40 - Math.random()*80; d.x = Math.random()*GAME_W; }
        d.im.setPosition(d.x + Math.sin(t*0.35 + d.k*9)*14 - GAME_W/2, d.y - GAME_H/2).setAngle(d.a).setScale(1, Math.abs(Math.cos((d.a + d.k*180)*Math.PI/180))*0.6 + 0.4);   // la feuille se retourne en tombant
      }
      earth.y = ey - GAME_H/2 + Math.sin(t*0.3)*4;
    };
  },
});
