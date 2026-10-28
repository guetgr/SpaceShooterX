"use strict";
// N.O.R.M.A. — assistante administrative embarquée de l'AGP. Elle parle par transmissions courtes (bandeau en haut de l'écran, jamais bloquant),
// dans l'accueil (bandeau d'information), au début d'une mission, face à un boss, quand la coque est critique et dans le rapport de fin.
// Textes : data/agp-lore.js. Aucune transmission n'est jouée pendant les cartes d'amélioration, la pause ou l'écran de fin.
const Norma = {
  _last: {}, _q: [], _showing: false, _lastAt: -1e9, _tw: null, _hide: null,

  // ligne au hasard dans une réserve, sans répéter deux fois de suite la même
  pick(pool, lvDef){
    const a = lvDef ? normaLines(lvDef, pool) : (AGP_LINES[pool] || []); if (!a.length) return '';
    let i; do { i = Math.floor(Math.random() * a.length); } while (a.length > 1 && i === this._last[pool]);
    this._last[pool] = i; return a[i];
  },

  el(){
    let e = document.getElementById('norma');
    if (!e){
      const host = document.getElementById('game-container'); if (!host) return null;
      e = document.createElement('div'); e.id = 'norma';
      e.innerHTML = '<div class="nm-av"><i class="nm-eye"></i><i class="nm-mouth"></i></div><div class="nm-body"><div class="nm-head">N.O.R.M.A.</div><div class="nm-txt"></div><div class="nm-prog"><i></i></div></div>';
      host.appendChild(e);
    }
    return e;
  },

  // transmission en combat. o.prio : passe devant la file · o.gap : délai minimum depuis la dernière (ms, 14 s par défaut)
  // o.hold : la ligne reste affichée jusqu'à la suivante (consignes du tuto) au lieu de s'effacer toute seule
  say(text, o){
    o = o || {}; if (!text) return;
    const now = performance.now();
    if (!o.prio && now - this._lastAt < (o.gap == null ? 14000 : o.gap)) return;
    if (o.prio) this._q = [];
    this._q.push({ text, hold:!!o.hold }); if (!this._showing || o.prio) this._next(!!o.prio);
  },

  // mini barre sous le texte (avancement de la consigne en cours) ; null la masque
  progress(p){
    const e = document.getElementById('norma'); if (!e) return;
    e.classList.toggle('prog', p != null);
    if (p != null) e.querySelector('.nm-prog > i').style.width = Math.round(Math.max(0, Math.min(1, p)) * 100) + '%';
  },

  _next(force){
    if (this._showing && !force) return;
    const item = this._q.shift(), e = this.el(); if (!item || !e){ this._showing = false; return; }
    const text = item.text, hold = item.hold;
    clearTimeout(this._hide); clearInterval(this._tw);
    this._showing = true; this._lastAt = performance.now();
    const t = e.querySelector('.nm-txt'); t.textContent = '';
    e.classList.add('show', 'talk');
    try { sfx.uiSelect(); } catch (err) { /* sons absents (tests) */ }
    let n = 0;
    this._tw = setInterval(()=>{
      n += 2; t.textContent = text.slice(0, n);
      if (n >= text.length){ clearInterval(this._tw); e.classList.remove('talk'); if (!hold) this._hide = setTimeout(()=> this.clear(true), 2300 + text.length*22); }
    }, 24);
  },

  clear(next){
    clearTimeout(this._hide); clearInterval(this._tw);
    const e = document.getElementById('norma'); if (e) e.classList.remove('show', 'talk', 'prog');
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
  report(kind, grade, lvDef){
    if (kind === 'win' && (grade === 'SS' || grade === 'SSS')) return this.pick('hiGrade');
    return this.pick(kind, lvDef);
  },
};

// Méthodes de GameScene : déclencheurs des transmissions pendant une partie (aucun effet sur le jeu)
mixin(GameScene, {
  normaStart(){
    Norma.reset(); this._normaLow = false; this._normaCd = Phaser.Math.Between(28000, 38000); this._normaProg = 0;
    { const e = Norma.el(); if (e){ e.classList.remove('low'); e.classList.toggle('tuto', !!this.tuto); } }
    this._normaPlan = this.tuto ? null : normaPlan(this.lvDef); this._normaMan = false;       // boîtes ajoutées à la main dans le JSON du niveau
    if (this.tuto) return;                         // tuto : les consignes viennent de game/tuto.js (tutoSay)
    const pool = 'start';
    // la transmission part quelques secondes après la fin du décollage (jamais pendant l'intro, ni pendant un menu)
    const ev = this.time.addEvent({ delay:300, loop:true, callback:()=>{
      if (this.introActive || !this.running) return;
      ev.remove(false);
      this.time.delayedCall(2200, ()=>{
        if (!this.running) return;
        const m = normaPlanTake(this._normaPlan, 'levelStart');
        Norma.say(m ? m.text : Norma.pick(pool, this.lvDef), { prio:true });
        const g = this.globalGearSummary(); if (g) Norma.say(g, { gap:0 });         // 2e transmission : les atouts globaux (R&D) actifs
      });
    } });
  },
  normaBoss(){ if (!this.tuto && !this.normaAnchor('bossStart')) Norma.say(Norma.pick('boss', this.lvDef), { prio:true }); },
  normaLow(){ if (!this.tuto) Norma.say(Norma.pick('lowhp', this.lvDef), { gap:6000 }); },

  // boîte N.O.R.M.A. ajoutée à la main sur une ancre (bossStart, ou événement : when = 'eventStart'/'eventEnd' + ref = nature) ; `own` = texte propre à l'occurrence (events[i].norma). Renvoie true si une transmission part.
  normaAnchor(when, ref, own){
    if (this.tuto || !this._normaPlan) return false;
    const m = normaText(own) ? { text:own } : normaPlanTake(this._normaPlan, when, ref);
    if (!m) return false;
    Norma.say(m.text, { prio:true }); return true;
  },
  // texte du rapport de fin pour une boîte `win` / `lose` ajoutée à la main (chaîne vide sinon)
  normaEndText(when){ const m = this._normaPlan && normaPlanTake(this._normaPlan, when); return m ? m.text : ''; },

  // transmissions régulières en mission (hors tuto) : avancement de l'ordre (une fois par palier de 25%) sinon une vanne, environ toutes les 40-55 s
  normaTick(delta){
    if (this.tuto || !this.lvDef) return;
    if (this._normaPlan && !this.introActive){                     // boîtes horaires : une à la fois, la suivante attend la fin de la précédente
      if (!Norma._showing) this._normaMan = false;
      const m = this._normaMan ? null : normaPlanDue(this._normaPlan, this.lvT);
      if (m){ m.done = true; this._normaMan = true; Norma.say(m.text, { prio:true }); }
    }
    this._normaCd -= delta; if (this._normaCd > 0) return;
    { const te = normaTickEvery(this.lvDef); this._normaCd = Phaser.Math.Between(te[0], te[1]); }
    const frac = this.levelProgress().frac, steps = [0.25, 0.5, 0.75];
    const si = steps.findIndex(s=> frac >= s && this._normaProg < s);
    this._normaProg = Math.max(this._normaProg, frac);
    Norma.say(si >= 0 ? (normaLines(this.lvDef, 'progress')[si] || Norma.pick('banter', this.lvDef)) : Norma.pick('banter', this.lvDef));
  },
});
