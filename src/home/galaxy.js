"use strict";
// Méthodes de HomeScene — carte stellaire : tous les mondes sur une route sinueuse, défilement au doigt avec inertie,
// voyage en hyperespace, zoom vers un monde, animation de déblocage d'un nouveau monde.
// Modes de la page CARTE (this.mapMode) : 'world' (un monde et ses niveaux en orbite) · 'galaxy' (vue d'ensemble) · 'moving' (transition).
const GAL_STEP = 165, GAL_BASE_Y = 500, GAL_R = 50, GAL_SCALE = 0.78;
const GAL_TAP_SLOP = 14;      // px logiques : en dessous, c'est un toucher et non un glissement
const GAL_FONT = "'SSX Label',monospace", GAL_FONT2 = "'SSX Text',monospace";

mixin(HomeScene, {
  galaxyPos(i){ return { x: (i % 2 === 0) ? 130 : 270, y: GAL_BASE_Y - i*GAL_STEP }; },

  // courbe de la route entre le monde i et le suivant (point de contrôle décalé : la route serpente)
  galaxyCurve(i, t){
    const a = this.galaxyPos(i), b = this.galaxyPos(i + 1), cx = (a.x + b.x)/2 + (i % 2 ? -50 : 50), cy = (a.y + b.y)/2, u = 1 - t;
    return { x: u*u*a.x + 2*u*t*cx + t*t*b.x, y: u*u*a.y + 2*u*t*cy + t*t*b.y };
  },

  buildGalaxy(){
    this.mapMode = 'world'; this.galY = 0; this.galVel = 0; this.galDrag = null; this.galForceLock = -1; this.homeCurrent = 0; this.galA = 0;
    this.galaxy = this.add.container(0, 0).setDepth(-0.4).setAlpha(0).setVisible(false);
    this.galPath = this.add.graphics(); this.galaxy.add(this.galPath);
    this.galWorlds = WORLDS.map((w, i)=>{
      const pos = this.galaxyPos(i), c = this.add.container(pos.x, pos.y);
      const glow = this.add.image(0, 0, 'shockRing').setBlendMode(Phaser.BlendModes.ADD).setScale(GAL_SCALE*0.8);
      const img = this.add.image(0, 0, 'star0').setScale(GAL_SCALE);
      const ring = this.add.graphics();
      const num = this.add.text(0, GAL_R + 9, '', { fontFamily:GAL_FONT, fontSize:'8px', color:'#cfd6ff' }).setOrigin(0.5, 0).setResolution(2);
      const sub = this.add.text(0, GAL_R + 22, '', { fontFamily:GAL_FONT2, fontSize:'17px', color:'#ffce4a' }).setOrigin(0.5, 0).setResolution(2);
      const star = this.add.image(0, GAL_R + 31, 'uiStar').setScale(1.25).setVisible(false);      // boss vaincu : sprite à droite du texte (Phaser ne mélange pas texte et image)
      c.add([glow, img, ring, num, sub, star]); this.galaxy.add(c);
      return { w, i, c, glow, img, ring, num, sub, star, pos };
    });
    // défilement vertical au doigt, avec inertie ; un toucher bref sur un monde l'ouvre
    this.input.on('pointerdown', p=>{
      if (this.mapMode !== 'galaxy' || this.page !== 0 || document.querySelector('.overlay:not(.hidden)')) return;
      this.galDrag = { y0:p.y, g0:this.galY, t0:performance.now(), moved:0, last:p.y, lt:performance.now() }; this.galVel = 0;
    });
    this.input.on('pointermove', p=>{
      const d = this.galDrag; if (!d || !p.isDown) return;
      const now = performance.now(), dy = p.y - d.y0; d.moved = Math.max(d.moved, Math.abs(dy));
      if (d.moved < GAL_TAP_SLOP && !d.scroll){ d.last = p.y; d.lt = now; return; }          // zone morte : le tremblement d'un doigt qui touche ne fait pas bouger la carte
      d.scroll = true;
      let g = d.g0 + dy;
      if (g > this.galMax) g = this.galMax + (g - this.galMax)*0.35;                      // résistance élastique au-delà des bornes (pas de tirage libre)
      else if (g < this.galMin) g = this.galMin + (g - this.galMin)*0.35;
      this.galY = g;
      if (now > d.lt) this.galVel = this.galVel*0.6 + 0.4*((p.y - d.last)/((now - d.lt)/1000)); d.last = p.y; d.lt = now;
    });
    this.input.on('pointerup', p=>{
      const d = this.galDrag; this.galDrag = null; if (!d) return;
      if (!d.scroll){                                                                      // toucher (même long) sans glissement : ouvre le monde touché
        this.galVel = 0;
        const hit = this.galWorlds.findIndex(g=>{ const dx = p.x - g.pos.x, dy = p.y - (g.pos.y + this.galY); return Math.hypot(dx, dy) < GAL_R + 14 || (Math.abs(dx) < 80 && dy > GAL_R && dy < GAL_R + 44); });      // planète ou son libellé
        if (hit >= 0) this.tapGalaxy(hit);
      } else if (performance.now() - d.lt > 90) this.galVel = 0;                           // le doigt s'est arrêté avant de lâcher
    });
  },

  // texte, anneau de progression, apparence verrouillée / ouverte de chaque monde + route
  refreshGalaxy(){
    const p = getWorldProgress(), n = WORLDS.length;
    this.galWorlds.forEach(g=>{
      const w = g.w, open = isWorldUnlocked(w.id, p) && this.galForceLock !== g.i, th = w.theme || {};
      const key = worldPlanetTexture(this, w, 96);
      g.img.setTexture(key).setTint(open ? 0xffffff : 0x2c3050).setScale(open ? GAL_SCALE : GAL_SCALE*0.85);
      g.glow.setTint(open ? (th.glow || 0x4fa8ff) : 0x30345a).setAlpha(open ? 0.5 : 0.2);
      const sm = worldSummary(w.id, p);
      g.num.setText(open ? w.name : '').setColor('#cfd6ff');
      g.sub.setText(open ? ('SECTEUR ' + w.order + ' · ' + sm.done + '/' + sm.total) : '').setColor('#ffc21a');
      g.star.setVisible(open && sm.bossDown).setPosition(g.sub.width/2 + 10, GAL_R + 31);
      // anneau : un segment par niveau (vert = terminé, rouge = boss), on laisse les dernières lueurs pour les niveaux restants
      const L = w.levels.length, gap = 0.12, seg = Math.PI*2/L;
      g.ring.clear();
      w.levels.forEach((l, k)=>{
        const done = isLevelDone(l.id, p), a0 = -Math.PI/2 + k*seg + gap/2, a1 = -Math.PI/2 + (k + 1)*seg - gap/2;
        g.ring.lineStyle(3, done ? 0x7bff9a : (l.type === 'boss' ? 0xff4f6d : 0x4ff2ff), open ? (done ? 0.95 : 0.35) : 0.12);
        g.ring.beginPath(); g.ring.arc(0, 0, GAL_R, a0, a1, false); g.ring.strokePath();
      });
    });
    // route : points pixelisés entre les mondes ; allumée jusqu'aux mondes ouverts
    const pg = this.galPath; pg.clear();
    for (let i = 0; i < n - 1; i++){
      const lit = isWorldUnlocked(WORLDS[i + 1].id, p) && this.galForceLock !== i + 1;
      pg.fillStyle(lit ? 0x7fe8ff : 0x4d4a96, lit ? 0.85 : 0.75);
      for (let t = 0.1; t < 0.93; t += 0.045){ const q = this.galaxyCurve(i, t); pg.fillRect(Math.round(q.x) - 1, Math.round(q.y) - 1, 3, 3); }
    }
    // bornes du défilement
    const topY = GAL_BASE_Y - (n - 1)*GAL_STEP;
    this.galMin = Math.min(130 - topY, 0); this.galMax = Math.max(610 - GAL_BASE_Y, 0);
    if (this.galMin > this.galMax) this.galMin = this.galMax;
    this.galY = Phaser.Math.Clamp(this.galY, this.galMin, this.galMax);
  },

  updateGalaxy(time, delta){
    const dt = delta/1000;
    if (this.mapMode === 'galaxy' || this.mapMode === 'moving'){
      if (!this.galDrag){
        this.galY += this.galVel*dt; this.galVel *= Math.exp(-3.2*dt);
        if (Math.abs(this.galVel) < 4) this.galVel = 0;
        const lim = Phaser.Math.Clamp(this.galY, this.galMin, this.galMax);
        if (lim !== this.galY){ this.galY += (lim - this.galY)*Math.min(1, dt*12); this.galVel *= 0.6; }      // rebond doux aux extrémités
      }
    }
    if (!this.galaxy.visible) return;
    this.galaxy.setPosition(-this.pageX*GAME_W, this.galY);
    const k = Math.max(0, 1 - Math.abs(this.pageX)*1.6);
    this.galaxy.setAlpha(this.galA*k);
    const cur = this.galWorlds[this.homeCurrent];
    if (cur) cur.glow.setScale(GAL_SCALE*(0.8 + 0.06*Math.sin(time/450)));                  // le monde où l'on en est pulse
    if (this.mapMode === 'galaxy' && this.page === 0 && cur){                               // la camionnette reste près du monde courant, même quand on fait défiler
      const b = this.vanBase, tx = cur.pos.x + 40, ty = cur.pos.y + this.galY - 4, f = Math.min(1, dt*8);
      b.x += (tx - b.x)*f; b.y += (ty - b.y)*f; b.s += (0.15 - b.s)*f; b.a += (1 - b.a)*f;
    }
  },

  // étoiles qui filent (voyage) : 0 → 1 → 0
  warpPulse(up){
    this.tweens.add({ targets:this, warp:1, duration:up || 260, ease:'Cubic.easeIn', yoyo:true, hold:80 });
  },

  setMapDom(mode){
    const pm = document.getElementById('pageMap');
    pm.dataset.mode = mode; pm.classList.remove('swap'); void pm.offsetWidth; pm.classList.add('swap');
    clearTimeout(this._swapT); this._swapT = setTimeout(()=> pm.classList.remove('swap'), 500);
  },

  homeToast(msg, ms){
    const t = document.getElementById('homeToast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(this._toastT); this._toastT = setTimeout(()=> t.classList.remove('show'), ms || 2200);
  },

  // vue d'ensemble : la planète du monde s'éloigne et prend sa place sur la route
  enterGalaxy(){
    if (this.mapMode !== 'world') return;
    this.mapMode = 'moving'; sfx.uiOpen(); this.homeMusic(true);          // la carte des secteurs a sa propre musique
    this.refreshGalaxy();
    const i = this.homeWorld, pos = this.galaxyPos(i), g = this.galWorlds[i];
    this.galY = Phaser.Math.Clamp(360 - pos.y, this.galMin, this.galMax); this.galVel = 0;
    this.setMapDom('galaxy');
    this.galaxy.setVisible(true); this.galA = 0; g.img.setVisible(false); g.glow.setVisible(false);
    this.warpPulse();
    this.tweens.add({ targets:this.planetPos, x:pos.x, y:pos.y + this.galY, s:GAL_SCALE, duration:560, ease:'Cubic.easeInOut' });
    this.tweens.add({ targets:this, orbitA:0, duration:300 });
    this.tweens.add({ targets:this, galA:1, duration:560, ease:'Sine.easeIn', onComplete:()=>{
      g.img.setVisible(true); g.glow.setVisible(true); this.planet.setVisible(false); this.planetGlow.setVisible(false); this.mapMode = 'galaxy';
    } });
  },

  // vue d'ensemble affichée d'emblée (sans animation), centrée sur le monde où l'on en est
  showGalaxyNow(){
    this.mapMode = 'galaxy'; this.homeMusic(true);
    this.refreshGalaxy();
    this.galY = Phaser.Math.Clamp(360 - this.galaxyPos(this.homeCurrent).y, this.galMin, this.galMax); this.galVel = 0;
    this.setMapDom('galaxy');
    this.galaxy.setVisible(true); this.galA = 1; this.orbitA = 0;
    this.planet.setVisible(false); this.planetGlow.setVisible(false);
  },

  // zoom vers un monde (depuis la route) : il grossit jusqu'à sa place, ses niveaux se mettent en orbite
  enterWorldView(i){
    if (this.mapMode !== 'galaxy') return;
    this.mapMode = 'moving'; sfx.uiStart();
    this.homeWorld = i; this.homeMusic(false);                          // le menu du monde choisi
    const w = WORLDS[i], p = getWorldProgress(), pos = this.galaxyPos(i), g = this.galWorlds[i];
    this.homeSel = (w.levels.find(l=> isLevelUnlocked(l.id, p) && !isLevelDone(l.id, p)) || w.levels[0]).id;
    this.setHomePlanet(w, !isWorldUnlocked(w.id, p));
    this.planetPos.x = pos.x; this.planetPos.y = pos.y + this.galY; this.planetPos.s = GAL_SCALE;
    this.planet.setVisible(true); this.planetGlow.setVisible(true); g.img.setVisible(false); g.glow.setVisible(false);
    this.warpPulse();
    this.tweens.add({ targets:this.planetPos, x:GAME_W/2, y:270, s:2.5, duration:620, ease:'Cubic.easeInOut' });
    this.tweens.add({ targets:this, galA:0, duration:450, onComplete:()=>{ this.galaxy.setVisible(false); g.img.setVisible(true); g.glow.setVisible(true); } });
    this.time.delayedCall(380, ()=>{
      this.setMapDom('world'); this.renderHomeMap(true);
      this.tweens.add({ targets:this, orbitA:1, duration:450 });
      this.moveHomeVan(0);
    });
    this.time.delayedCall(700, ()=>{ this.mapMode = 'world'; });
  },

  tapGalaxy(i){
    const w = WORLDS[i];
    if (isWorldUnlocked(w.id)){ this.enterWorldView(i); return; }
    sfx.uiError && sfx.uiError();
    const c = this.galWorlds[i].c, x0 = c.x;
    this.tweens.add({ targets:c, x:{ from:x0 - 5, to:x0 + 5 }, duration:60, yoyo:true, repeat:3, onComplete:()=> c.x = x0 });
    this.homeToast('Habilitation insuffisante : clôturez l\'incident du secteur ' + WORLDS[i - 1].order + '.');
  },

  // remet la page CARTE en vue « monde » (retour d'un niveau, premier affichage)
  resetMapView(){
    this.orbitRotation = null;
    if(this.orbitTween) this.orbitTween.stop();
    this.mapMode = 'world'; this.galVel = 0; this.galDrag = null; this.galForceLock = -1;
    this.galaxy.setVisible(false); this.galA = 0;
    Object.assign(this.planetPos, { x:GAME_W/2, y:270, s:2.5 }); this.orbitA = 1; this.warp = 0;
    this.planet.setVisible(true); this.planetGlow.setVisible(true);
    const pm = document.getElementById('pageMap'); pm.dataset.mode = 'world'; pm.classList.remove('swap');
  },

  // un nouveau monde vient d'être débloqué : la camionnette voyage jusqu'à lui, le brouillard se dissipe
  playWorldUnlock(i){
    const w = WORLDS[i], a = this.galaxyPos(i - 1), b = this.galaxyPos(i), g = this.galWorlds[i];
    this.mapMode = 'moving'; this.galForceLock = i; this.orbitA = 0; this.refreshGalaxy();
    this.galY = Phaser.Math.Clamp(360 - (a.y + b.y)/2, this.galMin, this.galMax); this.galVel = 0;
    this.setMapDom('galaxy'); this.planet.setVisible(false); this.planetGlow.setVisible(false);
    this.galaxy.setVisible(true); this.galA = 1;
    this.vanBase.x = a.x + 40; this.vanBase.y = a.y + this.galY - 4; this.vanBase.s = 0.15; this.vanBase.a = 1;
    this.homeCurrent = i - 1;
    this.time.delayedCall(900, ()=>{
      this.warpPulse(500);
      const m = { t:0 };
      this.tweens.add({ targets:m, t:1, duration:1300, ease:'Sine.easeInOut',
        onUpdate:()=>{ const q = this.galaxyCurve(i - 1, m.t); this.vanBase.x = q.x + 40*(1 - m.t); this.vanBase.y = q.y + this.galY - 4; },
        onComplete:()=>{
          this.galForceLock = -1; this.homeCurrent = i; this.refreshGalaxy();
          const ring = this.add.image(b.x, b.y, 'shockRing').setBlendMode(Phaser.BlendModes.ADD).setTint(w.theme.glow || 0xffffff).setScale(0.2);
          this.galaxy.add(ring);
          this.tweens.add({ targets:ring, scale:3.2, alpha:{ from:1, to:0 }, duration:900, ease:'Cubic.easeOut', onComplete:()=> ring.destroy() });
          this.tweens.add({ targets:g.img, alpha:{ from:0.1, to:1 }, duration:900 });
          this.cameras.main.flash(260, 255, 255, 255, false);
          sfx.relicOpen();
          this.homeToast('NOUVEAU SECTEUR ATTRIBUE : ' + w.name, 3000);
          markWorldSeen('w:' + w.id);
          this.mapMode = 'galaxy';
        } });
    });
  },
});
