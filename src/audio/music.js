"use strict";
// Lecture de la musique : MusicLoop, FileMusic, instance globale music.

/* =========================================================
   MUSIQUE PROCEDURALE: boucle de 32 pas (4 accords), PLANIFIEE A L'AVANCE (rythme régulier), qui s'étoffe avec le niveau d'alerte
   niv.1: basse + nappe · niv.2: + arpège · niv.3: + grosse caisse et charleston · niv.5: + mélodie et caisse claire · niv.8: plus rapide, accords plus sombres
========================================================= */
class MusicLoop{
  constructor(sfxRef){
    this.sfx = sfxRef; this.playing = false; this.step = 0; this.timer = null; this.nextT = 0; this.level = 1;
    this.scene = { mode:'menu' }; this.fm = null;                                // ce qui se passe (pour choisir le morceau)
    this.rate = 1; this.targetRate = 1; this.dim = 0; this.dimNow = 0;      // vitesse/hauteur (1 = normal) et sourdine (0 = claire, 1 = étouffée)
    this.gain = null; this.muted = false; this.bar = 0;
    try { this.muted = localStorage.getItem('ssx_music_muted') === '1'; } catch(e){ /* ignore */ }
    // accords: [note de basse, tierce, quinte] en Hz (Am - F - C - G) ; variante sombre: Am - F - Dm - E
    this.progA = [[110,261.63,329.63],[87.31,220,261.63],[130.81,329.63,392],[98,246.94,293.66]];
    this.progB = [[110,261.63,329.63],[87.31,220,261.63],[73.42,174.61,220],[82.41,207.65,246.94]];
    this.scale = [440, 523.25, 587.33, 659.25, 783.99, 880];     // gamme pentatonique mineure de la (mélodie)
  }
  setIntensity(n){ this.level = Math.max(1, n|0); }
  ensure(){
    this.sfx.ensureCtx();
    if (!this.sfx.ctx) return false;
    if (!this.gain){
      this.gain = this.sfx.ctx.createGain();
      this.gain.gain.value = this.muted ? 0 : 0.3 * VOL.c(VOL.music);
      this.lp = this.sfx.ctx.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 20000; this.lp.Q.value = 0.5;   // sourdine quand les PV sont bas
      this.gain.connect(this.lp); this.lp.connect(this.sfx.master);
    }
    return true;
  }
  setMuted(m){
    this.muted = m;
    try { localStorage.setItem('ssx_music_muted', m ? '1':'0'); } catch(e){ /* ignore */ }
    this.applyVol();
  }
  applyVol(){ if (this.gain) this.gain.gain.value = this.muted ? 0 : 0.3 * VOL.c(VOL.music); }
  setScene(sc){ this.scene = sc; }
  start(){
    if (this.fm && this.fm.supported() && this.fm.start()) return;                 // musique à partir des fichiers
    this.startProc();                                                             // secours: musique générée
  }
  startProc(){
    if (this.playing) return;
    if (!this.ensure()) return;
    this.playing = true; this.step = 0; this.bar = 0;
    this.nextT = this.sfx.ctx.currentTime + 0.08;
    this.pump();
  }
  // toutes les 40 ms: on planifie les pas qui tombent dans les 150 prochaines ms (aucune irrégularité de rythme)
  pump(){
    if (!this.playing) return;
    const ctx = this.sfx.ctx;
    // la vitesse (et la hauteur avec elle) glisse en douceur vers sa cible; la sourdine aussi
    this.rate += (this.targetRate - this.rate) * Math.min(1, 0.04/1.0);
    this.dimNow += (this.dim - this.dimNow) * Math.min(1, 0.04/1.2);
    if (this.lp) this.lp.frequency.value = 20000 * Math.pow(1500/20000, this.dimNow);
    while (this.nextT < ctx.currentTime + 0.15){
      this.playStep(this.step, this.nextT);
      this.nextT += this.stepSec();
      this.step = (this.step + 1) % 32; if (this.step % 8 === 0) this.bar++;
    }
    this.timer = setTimeout(()=> this.pump(), 40);
  }
  stepSec(){ return (this.level >= 8 ? 0.17 : 0.2) / this.rate; }
  setMood(rate, dim){ this.targetRate = rate; this.dim = dim; }
  note(type, f, t, dur, vol, atk){
    const ctx = this.sfx.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f * this.rate;                 // plus vite = plus aigu, plus lent = plus grave
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (atk||0.015)); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + dur + 0.03);
  }
  drum(kind, t){
    const ctx = this.sfx.ctx;
    if (kind === 'kick'){
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150 * this.rate, t); o.frequency.exponentialRampToValueAtTime(48 * this.rate, t + 0.13);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.34, t + 0.006); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + 0.22); return;
    }
    const src = ctx.createBufferSource(); src.buffer = this.sfx.noiseBuf; const f = ctx.createBiquadFilter(), g = ctx.createGain();
    if (kind === 'hat'){ f.type = 'highpass'; f.frequency.value = 7500; g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.045); }
    else { f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8; g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); }
    src.connect(f); f.connect(g); g.connect(this.gain); src.start(t, Math.random()*0.5, 0.15);
  }
  playStep(i, t){
    const L = this.level, bar = (i / 8) | 0, k = i % 8, prog = (L >= 8 ? this.progB : this.progA), ch = prog[bar];
    // basse (triangle): fondamentale, quinte, fondamentale décalée
    if (k === 0 || k === 3 || k === 6) this.note('triangle', ch[0] * (k === 6 ? 1 : 1), t, 0.34, 0.5, 0.02);
    if (k === 4) this.note('triangle', ch[0] * 1.5, t, 0.28, 0.4, 0.02);
    // nappe tenue (3 notes, attaque lente) au début de chaque mesure
    if (k === 0){ ch.forEach(f=> this.note('sine', f, t, this.stepSec()*7.4, 0.07, 0.35)); }
    // arpège doux (niveau 2+)
    if (L >= 2){ const a = [1,2,1,2,1,2,2,1][k], f = ch[a] * 2; this.note('triangle', f, t, 0.18, 0.07); }
    // batterie (niveau 3+)
    if (L >= 3){ if (k === 0 || k === 4) this.drum('kick', t); if (k % 2 === 1) this.drum('hat', t); }
    if (L >= 5){ if (k === 2 || k === 6) this.drum('snare', t); }
    // mélodie (niveau 5+): 4 notes par mesure, qui change toutes les 2 mesures
    if (L >= 5 && (k === 0 || k === 3 || k === 5 || k === 6)){
      const seed = (this.bar * 7 + k * 3 + (bar % 2) * 5) % this.scale.length; this.note('triangle', this.scale[seed], t, 0.3, 0.10, 0.02);
    }
  }
  stop(){ this.playing = false; if (this.timer) clearTimeout(this.timer); if (this.fm) this.fm.stop(); }
}

/* =========================================================
   MUSIQUE A PARTIR DE FICHIERS: horloge musicale commune (120 BPM), changements à la mesure, fondus enchaînés
   Les morceaux sont des boucles de 48 s qui commencent toutes sur un premier temps: à n'importe quel moment, la position
   dans la boucle est (horloge musicale) modulo 48 s, donc un nouveau morceau entre toujours "en phase".
========================================================= */
const MUSIC_SLOTS = { menu:['menu_a','menu_b','menu_c','menu_d'], tier1:['niv_1','niv_1b'], tier2:['niv_2','niv_2b'], boss:['boss_p1'], tutoniv:['tuto_niv_a','tuto_niv_b'] };

// chaque boss a sa paire de morceaux (alternés d'une apparition à l'autre); les boss sans paire utilisent boss_p1. Boucles de 56 s, démarrées au début du morceau
const MUSIC_BOSS = { dread:['bossd_a','bossd_b'], faucheuse:['bossf_a','bossf_b'], ruche:['bossr_a','bossr_b'], prisme:['bossp_a','bossp_b'], tuto1:['tuto_boss_a'], tuto2:['tuto_boss_b','tuto_boss_c','tuto_boss_d'] };      // tuto: a = phase 1, puis b/c/d en alternance

const MUSIC_BOSS_KEYS = [].concat(...Object.values(MUSIC_BOSS));

const musicLen = key => MUSIC_BOSS_KEYS.includes(key) ? 56 : 48;

const MUSIC_LOOP_S = 48, MUSIC_BAR_S = 2, MUSIC_GAIN = 1.0;

class FileMusic{
  constructor(owner){
    this.o = owner; this.buf = {}; this.loading = {}; this.cur = null; this.items = []; this.on = false;
    this.t = 0; this.last = 0; this.rate = 1; this.dimNow = 0; this.timer = null; this.swUntil = 0; this.busy = false;
    this.vi = {}; this.wantKey = null; this.failed = false; this.out = null;
    const N = 64; this.fin = new Float32Array(N); this.fout = new Float32Array(N);
    for (let i=0;i<N;i++){ const a = i/(N-1)*Math.PI/2; this.fin[i] = Math.sin(a); this.fout[i] = Math.cos(a); }        // fondu à puissance constante
  }
  supported(){ return !this.failed && typeof MUSIC_FILES === 'object' && !!(window.AudioContext || window.webkitAudioContext); }
  ensure(){
    if (!this.o.ensure()) return false;
    if (!this.out){ const c = this.o.sfx.ctx; this.out = c.createGain(); this.out.gain.value = MUSIC_GAIN; this.out.connect(this.o.gain); }
    return true;
  }
  slotNow(){
    const s = this.o.scene || { mode:'menu' };
    if (s.mode === 'menu') return 'menu';
    if (s.tutoLevel) return 'tutoniv';
    if (s.boss) return (s.bossId && MUSIC_BOSS[s.bossId]) ? 'boss:' + s.bossId : 'boss';
    return (s.alert || 1) <= 4 ? 'tier1' : 'tier2';
  }
  keysOf(slot){ return slot.indexOf('boss:') === 0 ? MUSIC_BOSS[slot.slice(5)] : MUSIC_SLOTS[slot]; }
  pickKey(slot){ const ks = this.keysOf(slot); const i = this.vi[slot] || 0; this.vi[slot] = i + 1; return ks[i % ks.length]; }
  load(key){
    if (this.buf[key]) return Promise.resolve(this.buf[key]);
    if (this.loading[key]) return this.loading[key];
    const c = this.o.sfx.ctx, d = MUSIC_FILES[key];
    if (!c || !d) return Promise.resolve(null);
    const bin = atob(d.slice(d.indexOf(',') + 1)), u8 = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
    this.loading[key] = new Promise((res, rej)=>{ const pr = c.decodeAudioData(u8.buffer, res, rej); if (pr && pr.catch) pr.catch(rej); })
      .then(buf=>{
        // boucle sans couture: si le décodeur a laissé le silence de début d'encodage (1105 échantillons), on le saute
        const extra = buf.length - Math.round(musicLen(key) * buf.sampleRate);
        const pad = extra > 64 ? Math.round(1105 / 44100 * buf.sampleRate) / buf.sampleRate : 0;
        return (this.buf[key] = { buf, pad });
      })
      .catch(()=>{ this.failed = true; return null; });
    return this.loading[key];
  }
  // morceaux à garder en mémoire selon la situation (4 au plus)
  keepSet(){
    const sc = this.o.scene || { mode:'menu' }; if (sc.mode === 'menu') return MUSIC_SLOTS.menu.slice();
    const slot = this.slotNow(), isB = slot.indexOf('boss') === 0, base = isB ? (sc.bossId && sc.bossId.indexOf('tuto') === 0 ? 'tutoniv' : (sc.alert || 1) <= 4 ? 'tier1' : 'tier2') : slot;   // pendant un boss on garde aussi la musique du niveau
    const k = MUSIC_SLOTS[base].slice(); if (isB) k.push(...this.keysOf(slot)); else k.push(...(base === 'tutoniv' ? MUSIC_BOSS.tuto1 : MUSIC_SLOTS.boss));   // le boss peut arriver à tout moment
    if (base === 'tier1' && (sc.alert || 1) >= 3) k.push(MUSIC_SLOTS.tier2[0]);        // le palier suivant approche
    if (this.cur && !k.includes(this.cur.key)) k.push(this.cur.key);
    return k;
  }
  housekeeping(){
    const keep = this.keepSet();
    Object.keys(this.buf).forEach(k=>{ if (!keep.includes(k)){ delete this.buf[k]; delete this.loading[k]; } });      // on libère la mémoire
    if (!this.loadingNow){ const miss = keep.find(k=> !this.buf[k] && !this.loading[k]); if (miss){ this.loadingNow = true; this.load(miss).then(()=>{ this.loadingNow = false; }); } }   // un décodage à la fois
  }
  start(){
    if (!this.ensure()) return false;
    if (this.on) return true;
    this.on = true; this.last = this.o.sfx.ctx.currentTime; this.cur = null; this.busy = false; this.swUntil = 0; this.wantKey = null;
    this.tick();
    this.hkT = 0;
    return true;
  }
  stop(){
    if (!this.on) return;
    this.on = false; clearTimeout(this.timer);
    const c = this.o.sfx.ctx, now = c ? c.currentTime : 0;
    this.items.forEach(it=>{ try{ it.g.gain.cancelScheduledValues(now); it.g.gain.setTargetAtTime(0, now, 0.08); it.src.stop(now + 0.5); }catch(e){ /* ignore */ } });
    this.items = []; this.cur = null; this.busy = false;
  }
  tick(){
    if (!this.on) return;
    const c = this.o.sfx.ctx, now = c.currentTime, dt = Math.max(0, Math.min(0.25, now - this.last)); this.last = now;
    // vitesse et sourdine pilotées par l'action (comme la musique générée)
    this.rate += (this.o.targetRate - this.rate) * Math.min(1, dt / 1.0);
    this.dimNow += (this.o.dim - this.dimNow) * Math.min(1, dt / 1.2);
    if (this.o.lp) this.o.lp.frequency.value = 20000 * Math.pow(1500/20000, this.dimNow);
    this.t += dt * this.rate;                                                    // horloge musicale (avance plus vite si la musique accélère)
    this.items.forEach(it=>{ try{ it.src.playbackRate.setTargetAtTime(this.rate, now, 0.08); }catch(e){ /* ignore */ } });
    if (!this.busy && now >= this.swUntil){
      const slot = this.slotNow(), ks = this.keysOf(slot);
      let want = this.wantKey;
      if (!want || !ks.includes(want)) want = this.wantKey = this.pickKey(slot);
      else if (this.cur && want === this.cur.key && ks.length > 1 && (this.t - this.cur.t0) >= 2 * musicLen(want))
        want = this.wantKey = ks[(ks.indexOf(want) + 1) % ks.length];           // l'autre variante après 2 passages
      if (!this.cur || want !== this.cur.key){ this.fastSw = !this.cur || !!(this.o.scene && this.o.scene.fast); this.switchTo(want); }     // au lancement d'une partie: fondu rapide
    }
    this.hkT = (this.hkT || 0) + dt; if (this.hkT >= 1.0){ this.hkT = 0; this.housekeeping(); }
    if (this.failed){ this.stop(); this.o.startProc(); return; }                 // décodage impossible: on retombe sur la musique générée
    this.timer = setTimeout(()=> this.tick(), 60);
  }
  async switchTo(key){
    this.busy = true;
    const b = await this.load(key);
    if (!this.on || !b){ this.busy = false; return; }
    const c = this.o.sfx.ctx, now = c.currentTime;
    let at, fade;
    if (!this.cur){ at = now + 0.06; fade = 1.4; }
    else if (this.fastSw){ at = now + 0.05; fade = 1.0; }
    else { const nb = Math.ceil((this.t + 0.03) / MUSIC_BAR_S) * MUSIC_BAR_S; at = now + Math.max(0.03, (nb - this.t) / this.rate); fade = 2.0; }    // à la prochaine mesure
    const tAt = this.t + (at - now) * this.rate, LEN = musicLen(key), off = MUSIC_BOSS_KEYS.includes(key) ? 0 : ((tAt % LEN) + LEN) % LEN;
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = b.buf; src.loop = true; src.loopStart = b.pad; src.loopEnd = b.pad + LEN; src.playbackRate.value = this.rate;
    g.gain.value = 0; g.gain.setValueCurveAtTime(this.fin, at, fade);
    src.connect(g); g.connect(this.out); src.start(at, b.pad + off);
    const old = this.cur, item = { src, g };
    this.items.push(item); src.onended = ()=>{ this.items = this.items.filter(i=> i !== item); };
    if (old){ try{ old.g.gain.cancelScheduledValues(at); old.g.gain.setValueCurveAtTime(this.fout, at, fade); old.src.stop(at + fade + 0.1); }catch(e){ /* ignore */ } }
    this.cur = { key, src, g, t0: tAt }; this.swUntil = at + fade; this.busy = false;
  }
}

const music = new MusicLoop(sfx);

music.fm = new FileMusic(music);
