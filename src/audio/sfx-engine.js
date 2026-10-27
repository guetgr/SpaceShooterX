"use strict";
// Moteur de sons : classe Sfx (synthèse, lecture des sons enregistrés) et outils de matière.

class Sfx{
  constructor(){
    this.ctx = null; this.master = null; this.sfxGain = null; this.muted = false; this.voices = 0; this.noiseBuf = null; this._rl = {}; this._lv = 1; this._hum = 1; this._rv = 0.07;
    try { this.muted = localStorage.getItem('ssx_muted') === '1'; } catch(e){ /* ignore */ }
  }
  ensureCtx(){
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;
    // chaîne de sortie: sons -> adoucisseur d'aigus -> volume -> LIMITEUR -> haut-parleurs
    this.master = c.createGain(); this.master.gain.value = 1.15 * VOL.c(VOL.master);
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -16; this.comp.knee.value = 14; this.comp.ratio.value = 9; this.comp.attack.value = 0.004; this.comp.release.value = 0.2;
    this.mLp = c.createBiquadFilter(); this.mLp.type = 'lowpass'; this.mLp.frequency.value = 20000; this.mLp.Q.value = 0.5;      // sourdine de nébuleuse
    this.master.connect(this.mLp); this.mLp.connect(this.comp); this.comp.connect(c.destination);
    this.neSend = c.createGain(); this.neSend.gain.value = 0; this.neDel = c.createDelay(1); this.neDel.delayTime.value = 0.32;
    this.neFb = c.createGain(); this.neFb.gain.value = 0.5; this.neLp = c.createBiquadFilter(); this.neLp.type = 'lowpass'; this.neLp.frequency.value = 1100;
    this.mLp.connect(this.neSend); this.neSend.connect(this.neDel); this.neDel.connect(this.neLp); this.neLp.connect(this.neFb); this.neFb.connect(this.neDel); this.neLp.connect(this.comp);
    this.lp = c.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 8200; this.lp.Q.value = 0.4; this.lp.connect(this.master);
    // chaleur: une légère saturation arrondit les pointes et ajoute des harmoniques (moins "numérique")
    this.drive = c.createGain(); this.drive.gain.value = 2.4; this.sat = c.createWaveShaper();
    { const N = 1024, cv = new Float32Array(N); for (let i=0;i<N;i++){ const x = i/(N-1)*2-1; cv[i] = Math.tanh(1.5*x)/Math.tanh(1.5); } this.sat.curve = cv; this.sat.oversample = '2x'; }
    this.makeup = c.createGain(); this.makeup.gain.value = 0.46;
    this.sfxGain = c.createGain(); this.sfxGain.gain.value = this.muted ? 0 : 0.5 * VOL.c(VOL.sfx);
    this.sfxGain.connect(this.drive); this.drive.connect(this.sat); this.sat.connect(this.makeup); this.makeup.connect(this.lp);
    // petite salle: la réverbération donne du corps et de l'air aux sons
    this.revIn = c.createGain(); this.conv = c.createConvolver();
    { const n = Math.floor(c.sampleRate * 1.1), ib = c.createBuffer(2, n, c.sampleRate);
      for (let ch=0; ch<2; ch++){ const d = ib.getChannelData(ch); let z = 0; for (let i=0;i<n;i++){ const w = (Math.random()*2-1) * Math.pow(1 - i/n, 2.8); z += (w - z) * 0.35; d[i] = z; } }
      this.conv.buffer = ib; }
    this.revOut = c.createGain(); this.revOut.gain.value = 0.8; this.revIn.connect(this.conv); this.conv.connect(this.revOut); this.revOut.connect(this.sfxGain);
    const n = Math.floor(c.sampleRate * 1.6); this.noiseBuf = c.createBuffer(1, n, c.sampleRate);          // un seul bruit blanc réutilisé
    const d = this.noiseBuf.getChannelData(0); for (let i=0;i<n;i++) d[i] = Math.random()*2-1;
    this.loadFiles();
  }
  // décode les sons enregistrés (une fois): tant qu'ils ne sont pas prêts, la version synthétique joue
  loadFiles(){
    if (this.files || !this.ctx) return; this.files = {};
    Object.keys(SFX_FILES).forEach(name=>{
      this.files[name] = [];
      SFX_FILES[name].d.forEach(uri=>{
        try {
          const bin = atob(uri.split(',')[1]), u8 = new Uint8Array(bin.length);
          for (let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
          const pr = this.ctx.decodeAudioData(u8.buffer, b=>{ this.files[name].push(b); }, ()=>{});
          if (pr && pr.catch) pr.catch(()=>{});
        } catch(e){ /* ignore */ }
      });
    });
  }
  playFile(F, bufs, p){
    const c = this.ctx; if (this.voices > 34) return;
    const src = c.createBufferSource(); src.buffer = bufs[(Math.random()*bufs.length)|0];
    let rate = 1 + (Math.random()*2-1) * 0.05;
    if (F.tier && p && p.tier) rate *= 1 + 0.07*(p.tier-1);
    if (p && p.rate) rate *= p.rate;                                  // hauteur imposée par l'appelant (ex. cristaux ramassés en chaîne)
    src.playbackRate.value = rate;
    const g = c.createGain(); g.gain.value = F.pk; src.connect(g); let last = g;
    if (p && p.pan){ const pn = c.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, p.pan)); g.connect(pn); last = pn; }
    if (F.rv > 0 && this.revIn){ const sd = c.createGain(); sd.gain.value = F.rv; last.connect(sd); sd.connect(this.revIn); }
    last.connect(this.sfxGain);
    this.voices++; src.onended = ()=>{ this.voices = Math.max(0, this.voices - 1); };
    src.start(c.currentTime + 0.001);
  }
  loopSet(name, gain, rate){           // son continu (laser, aspiration, réservoir du Pilleur) : une boucle créée à la demande, dont on règle volume et hauteur à chaque image
    this.ensureCtx(); const c = this.ctx; if (!c || !this.files) return; const F = SFX_FILES[name], b = this.files[name] && this.files[name][0]; if (!F || !b) return;
    this._loops = this._loops || {}; let L = this._loops[name];
    if (!L){ if (gain < 0.01) return; const src = c.createBufferSource(); src.buffer = b; src.loop = true; const g = c.createGain(); g.gain.value = 0; src.connect(g); g.connect(this.sfxGain); src.start(); L = this._loops[name] = { src, g }; }
    const t = c.currentTime; L.g.gain.setTargetAtTime(gain*F.pk, t, 0.08); if (rate) L.src.playbackRate.setTargetAtTime(rate, t, 0.1);
  }
  setNebula(on){                       // dans la nébuleuse: son étouffé + écho profond; hors nébuleuse: tout revient
    this.ensureCtx(); if (!this.ctx) return; const t = this.ctx.currentTime;
    this.mLp.frequency.cancelScheduledValues(t); this.mLp.frequency.setTargetAtTime(on ? 850 : 20000, t, on ? 0.5 : 0.35);
    this.neSend.gain.cancelScheduledValues(t); this.neSend.gain.setTargetAtTime(on ? 0.75 : 0, t, 0.5);
  }
  setHole(k, cut, echo){               // trou noir / éclipse / glace: le son est étouffé + écho selon l'intensité k (0..1); ne touche à rien dans la nébuleuse
    if (!this.ctx || this._nebOn) return; const t = this.ctx.currentTime; cut = cut || 700; echo = echo === undefined ? 0.55 : echo;
    if (k < 0.01 && !this._holeOn) return; this._holeOn = k >= 0.01;
    this.mLp.frequency.setTargetAtTime(20000 * Math.pow(cut/20000, k), t, 0.12);
    this.neSend.gain.setTargetAtTime(echo*k, t, 0.2);
  }
  resume(){ this.ensureCtx(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  setMuted(m){
    this.muted = m;
    try { localStorage.setItem('ssx_muted', m ? '1':'0'); } catch(e){ /* ignore */ }
    this.applyVol();
  }
  applyVol(){
    if (this.master) this.master.gain.value = 1.15 * VOL.c(VOL.master);
    if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : 0.5 * VOL.c(VOL.sfx);
  }
  // limiteur: au plus `max` sons de ce type par fenêtre de `win` ms
  ok(key, max, win){
    const now = performance.now();
    const b = this._rl[key] || (this._rl[key] = { t:now, n:0 });
    if (now - b.t > win){ b.t = now; b.n = 0; }
    return (++b.n) <= max;
  }
  // ---- VOIX: o = { f (Hz), g (glisse vers), d (durée), t (forme), a (volume), at (instant), atk, det (cents), fm:[rapport, profondeur], lp:[départ, fin], q, pan, big, hum (humanisation), rv (réverbération) }
  v(o){
    this.ensureCtx();
    if (!this.ctx || this.voices > (o.big ? 48 : 34)) return;
    const c = this.ctx, hum = (o.hum !== undefined ? o.hum : this._hum), jf = 1 + (Math.random()*2-1) * 0.04 * hum;
    const t = (o.at !== undefined ? o.at : c.currentTime) + 0.002 + Math.random() * 0.005 * hum, d = o.d * (1 + (Math.random()*2-1) * 0.08 * hum);
    const F = o.f * jf, G = o.g ? o.g * jf : 0;                              // chaque son est un peu différent du précédent
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.t || 'sine'; osc.frequency.setValueAtTime(F, t);
    if (G) osc.frequency.exponentialRampToValueAtTime(Math.max(18, G), t + d * (o.gk || 1));
    osc.detune.value = (Math.random()*2-1) * ((o.det || 0) + 5 * hum);
    if (o.fm){
      const m = c.createOscillator(), mg = c.createGain(); m.type = 'sine';
      m.frequency.setValueAtTime(F * o.fm[0], t); if (G) m.frequency.exponentialRampToValueAtTime(Math.max(18, G * o.fm[0]), t + d);
      mg.gain.setValueAtTime(F * o.fm[1], t); mg.gain.exponentialRampToValueAtTime(1, t + d * 0.7);
      m.connect(mg); mg.connect(osc.frequency); m.start(t); m.stop(t + d + 0.05);
    }
    const a = (o.a !== undefined ? o.a : 0.1) * this._lv * (1 + (Math.random()*2-1) * 0.12 * hum), atk = o.atk || 0.006;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(a, t + atk); g.gain.exponentialRampToValueAtTime(0.0008, t + d);
    let out = osc;
    if (o.lp){ const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = o.q || 0.7; f.frequency.setValueAtTime(o.lp[0], t); if (o.lp[1]) f.frequency.exponentialRampToValueAtTime(o.lp[1], t + d); osc.connect(f); out = f; }
    out.connect(g); let last = g;
    if (o.pan){ const p = c.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); g.connect(p); last = p; }
    const rv = o.rv !== undefined ? o.rv : this._rv;
    if (rv > 0 && this.revIn){ const sd = c.createGain(); sd.gain.value = rv; last.connect(sd); sd.connect(this.revIn); }
    last.connect(this.sfxGain);
    this.voices++; osc.onended = ()=>{ this.voices = Math.max(0, this.voices - 1); };
    osc.start(t); osc.stop(t + d + 0.05);
  }
  // ---- BRUIT FILTRE: o = { d, a, at, f (coupure/centre), f1 (fin du balayage), type ('lowpass' | 'highpass' | 'bandpass'), q, atk, pan, big, hum, rv }
  n(o){
    this.ensureCtx();
    if (!this.ctx || !this.noiseBuf || this.voices > (o.big ? 48 : 34)) return;
    const c = this.ctx, hum = (o.hum !== undefined ? o.hum : this._hum), jf = 1 + (Math.random()*2-1) * 0.06 * hum;
    const t = (o.at !== undefined ? o.at : c.currentTime) + 0.002 + Math.random() * 0.005 * hum, d = o.d * (1 + (Math.random()*2-1) * 0.08 * hum);
    const src = c.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = o.type || 'lowpass'; f.Q.value = o.q || 0.7; f.frequency.setValueAtTime((o.f || 1000) * jf, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.f1 * jf), t + d);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime((o.a !== undefined ? o.a : 0.1) * this._lv * (1 + (Math.random()*2-1) * 0.12 * hum), t + (o.atk || 0.004)); g.gain.exponentialRampToValueAtTime(0.0008, t + d);
    src.connect(f); f.connect(g); let last = g;
    if (o.pan){ const p = c.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); g.connect(p); last = p; }
    const rv = o.rv !== undefined ? o.rv : this._rv;
    if (rv > 0 && this.revIn){ const sd = c.createGain(); sd.gain.value = rv; last.connect(sd); sd.connect(this.revIn); }
    last.connect(this.sfxGain);
    this.voices++; src.onended = ()=>{ this.voices = Math.max(0, this.voices - 1); };
    src.start(t, Math.random() * 0.8); src.stop(t + d + 0.05);
  }
  V(t, dt, o){ this.v(Object.assign({}, o, { at: t + dt })); }
  N(t, dt, o){ this.n(Object.assign({}, o, { at: t + dt })); }
  // compatibilité avec les anciens appels
  noise(dur, vol, filterFreq, at, hp){ this.n({ d:dur, a:vol, f:filterFreq || 1200, type: hp ? 'highpass' : 'lowpass', at }); }
  play(name, p){
    if (this.muted) return;
    const def = SFX_LIB[name]; if (!def) return;
    if (def.lim && !this.ok(name, def.lim[0], def.lim[1])) return;
    this.ensureCtx(); if (!this.ctx) return;
    { const F = SFX_FILES[name], bufs = this.files && this.files[name]; if (F && bufs && bufs.length){ this.playFile(F, bufs, (p && typeof p === 'object') ? p : null); return; } }   // son enregistré prêt: on le joue à la place du synthétique
    this._lv = def.g || 1; this._hum = def.hum !== undefined ? def.hum : 1; this._rv = def.rv !== undefined ? def.rv : 0.07;
    def.run(this, this.ctx.currentTime, (p && typeof p === 'object') ? p : { n:p });
    this._lv = 1; this._hum = 1; this._rv = 0.07;
  }
}

/* =========================================================
   BIBLIOTHEQUE DE SONS: chaque son a sa signature. lim:[max, fenêtre en ms] = anti-mitraillage.
   p = paramètres du moment (pan: -1..1 selon la position à l'écran, tier, n, rank, big...)
========================================================= */

/* OUTILS DE MATIERE (au lieu de notes électroniques): objets frappés, éclats, souffles, accords de cuivres */
const rnd = (a, b)=> a + Math.random() * (b - a);

const STRIKE = { wood:{ p:[[1,1],[2.4,0.5]], d:0.07 }, glass:{ p:[[1,1],[2.7,0.6],[5.1,0.35]], d:0.2 }, metal:{ p:[[1,1],[2.76,0.7],[5.4,0.5],[8.9,0.3]], d:0.26 }, stone:{ p:[[1,1],[1.7,0.5]], d:0.1 } };

function strike(s, t, dt, kind, f, o){                     // un objet frappé: petit claquement de bruit + résonances amorties
  o = o || {}; const K = STRIKE[kind], a = o.a || 0.06, len = o.len || 1;
  s.N(t, dt, { d:0.014, a:a*0.9, f:Math.min(9000, f*2.4), type:'bandpass', q:1.5, pan:o.pan, rev:o.rev });
  K.p.forEach(([r, w], i)=> s.V(t, dt, { f:f*r, d:K.d*len/(1+i*0.5), a:a*w, atk:0.001, pan:o.pan, rev:o.rev, hum:0.6 }));
}

function scatter(s, t, n, span, f0, f1, a, o){             // des éclats répartis dans le temps et l'espace
  o = o || {}; for (let i=0;i<n;i++) s.N(t, Math.pow(Math.random(), 1.3)*span, { d:0.02 + Math.random()*0.025, a:a*(0.5 + Math.random()*0.7), f:rnd(f0, f1), type:'bandpass', q:(o.q||7), pan:rnd(-0.7, 0.7), rev:o.rev });
}

function swell(s, t, d, f0, f1, a, o){                      // un souffle qui monte ou qui descend
  o = o || {}; s.N(t, o.at || 0, { d, a, f:f0, f1, type:o.type || 'bandpass', q:o.q || 0.9, atk:d*0.55, pan:o.pan, rev:o.rev, big:o.big });
}

function chord(s, t, dt, notes, d, a, lp0, lp1, atk, o){   // un accord de cuivres (dents de scie filtrées et légèrement désaccordées)
  o = o || {}; const rv = o.rev === undefined ? 0.3 : o.rev;
  notes.forEach(f=>{ s.V(t, dt, { f, d, t:'sawtooth', a:a, lp:[lp0, lp1], atk, det:10, rev:rv, hum:0.7, pan:o.pan, big:o.big }); s.V(t, dt, { f:f*1.006, d, t:'sawtooth', a:a*0.7, lp:[lp0, lp1], atk, rev:rv, hum:0.7, pan:o.pan, big:o.big }); });
}
