"use strict";
// N.O.R.M.A. — assistante administrative embarquée de l'AGP. Elle parle par transmissions courtes (bandeau en haut de l'écran, jamais bloquant),
// dans l'accueil (bandeau d'information), au début d'une mission, face à un boss, quand la coque est critique et dans le rapport de fin.
// Textes : data/agp-lore.js. Aucune transmission n'est jouée pendant les cartes d'amélioration, la pause ou l'écran de fin.
const Norma = {
  _last: {}, _q: [], _showing: false, _lastAt: -1e9, _tw: null, _hide: null,

  // ligne au hasard dans une réserve, sans répéter deux fois de suite la même
  pick(pool){
    const a = AGP_LINES[pool] || []; if (!a.length) return '';
    let i; do { i = Math.floor(Math.random() * a.length); } while (a.length > 1 && i === this._last[pool]);
    this._last[pool] = i; return a[i];
  },

  el(){
    let e = document.getElementById('norma');
    if (!e){
      const host = document.getElementById('game-container'); if (!host) return null;
      e = document.createElement('div'); e.id = 'norma';
      e.innerHTML = '<div class="nm-av"><i class="nm-eye"></i><i class="nm-mouth"></i></div><div class="nm-body"><div class="nm-head">N.O.R.M.A <u>// TRANSMISSION</u></div><div class="nm-txt"></div></div>';
      host.appendChild(e);
    }
    return e;
  },

  // transmission en combat. o.prio : passe devant la file · o.gap : délai minimum depuis la dernière (ms, 14 s par défaut)
  say(text, o){
    o = o || {}; if (!text) return;
    const now = performance.now();
    if (!o.prio && now - this._lastAt < (o.gap == null ? 14000 : o.gap)) return;
    if (o.prio) this._q = [];
    this._q.push(text); if (!this._showing || o.prio) this._next(!!o.prio);
  },

  _next(force){
    if (this._showing && !force) return;
    const text = this._q.shift(), e = this.el(); if (!text || !e){ this._showing = false; return; }
    clearTimeout(this._hide); clearInterval(this._tw);
    this._showing = true; this._lastAt = performance.now();
    const t = e.querySelector('.nm-txt'); t.textContent = '';
    e.classList.add('show', 'talk');
    try { sfx.uiSelect(); } catch (err) { /* sons absents (tests) */ }
    let n = 0;
    this._tw = setInterval(()=>{
      n += 2; t.textContent = text.slice(0, n);
      if (n >= text.length){ clearInterval(this._tw); e.classList.remove('talk'); this._hide = setTimeout(()=> this.clear(true), 2300 + text.length*22); }
    }, 24);
  },

  clear(next){
    clearTimeout(this._hide); clearInterval(this._tw);
    const e = document.getElementById('norma'); if (e) e.classList.remove('show', 'talk');
    this._showing = false;
    if (next && this._q.length) setTimeout(()=> this._next(), 450);
  },
  // nouvelle partie / retour à l'accueil : plus rien à l'écran, file vidée, compteur remis à zéro
  reset(){ this._q = []; this._lastAt = -1e9; this.clear(false); },

  // bandeau d'information de l'accueil : une ligne à la fois, qui change toutes les 7 s
  startTicker(el, isOn){
    if (!el || el._tk) return;
    const tag = el.querySelector('.tk-tag'), txt = el.querySelector('.tk-txt'), line = el.querySelector('.tk-line'); let i = Math.floor(Math.random() * AGP_LINES.ticker.length);
    const show = ()=>{
      const [t, m] = AGP_LINES.ticker[i % AGP_LINES.ticker.length]; i++;
      tag.textContent = t; txt.textContent = m;
      if (!Motion.ok()) return;
      gsap.killTweensOf(txt); gsap.set(txt, { x:0 });
      gsap.fromTo(line, { opacity:0, x:14 }, { opacity:1, x:0, duration:.5, ease:'power2.out', clearProps:'transform' });
      const over = txt.offsetWidth - (el.clientWidth - tag.offsetWidth - 16);        // message plus long que le bandeau : il défile
      if (over > 0) gsap.to(txt, { x:-over, duration:over/36, delay:1.4, ease:'none' });
    };
    show();
    el._tk = setInterval(()=>{ if (isOn && !isOn()) return; show(); }, 8800);
  },

  // commentaire du rapport de fin de mission
  report(kind, grade){
    if (kind === 'win' && (grade === 'SS' || grade === 'SSS')) return this.pick('hiGrade');
    return this.pick(kind);
  },
};

// Méthodes de GameScene : déclencheurs des transmissions pendant une partie (aucun effet sur le jeu)
mixin(GameScene, {
  normaStart(){
    Norma.reset(); this._normaLow = false; { const e = Norma.el(); if (e) e.classList.toggle('low', !!this.tuto); }
    const pool = this.tuto ? 'startTuto' : 'start';
    // la transmission part quelques secondes après la fin du décollage (jamais pendant l'intro, ni pendant un menu)
    const ev = this.time.addEvent({ delay:300, loop:true, callback:()=>{
      if (this.introActive || !this.running) return;
      ev.remove(false);
      this.time.delayedCall(this.tuto ? 700 : 2200, ()=>{ if (this.running) Norma.say(Norma.pick(pool), { prio:true }); });
    } });
  },
  normaBoss(){ if (!this.tuto) Norma.say(Norma.pick('boss'), { prio:true }); },
  normaLow(){ if (!this.tuto) Norma.say(Norma.pick('lowhp'), { gap:6000 }); },
});
