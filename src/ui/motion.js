"use strict";
// Animations des menus (GSAP, vendor/gsap.min.js) : retour tactile des boutons, respiration du CTA, entrée des pages, cartes en cascade, compteurs.
// Tout est sans effet si GSAP est absent ou si le joueur demande moins d'animations (prefers-reduced-motion) : les menus restent utilisables.
const MOTION_PRESS = '#btnLaunch, .tcard, .ttab, #homeTabs button, .home-ico, .tree-invest-btn, .map-arrow, .hangar-seg button, .skin, .mod, #gameover .btn, #pauseBtn, .sheet .btn, .tile, .sw, .bk, .lnk, .acc-head';

const Motion = {
  ok(){ return typeof gsap !== 'undefined' && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); },

  // écrasement au toucher puis rebond élastique, sur tous les boutons de l'accueil (écoute déléguée : marche aussi pour les cartes redessinées)
  bindPress(){
    if (this._bound || !this.ok()) return;
    this._bound = true;
    let cur = null;
    const release = ()=>{
      const el = cur; if (!el) return; cur = null;
      if (el._press) el._press.kill();
      el._press = gsap.to(el, { scale:1, duration:.55, ease:'elastic.out(1, 0.4)', onComplete:()=>{ gsap.set(el, { clearProps:'transform' }); this.resumeBreath(el); } });
    };
    document.body.addEventListener('pointerdown', e=>{
      const el = e.target.closest(MOTION_PRESS); if (!el || el.disabled) return;
      cur = el; el.classList.add('mo'); this.pauseBreath(el);
      if (el._press) el._press.kill();
      el._press = gsap.to(el, { scale:.93, duration:.07, ease:'power2.out' });
    });
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);
  },

  // le bouton principal « respire » doucement tant qu'il est utilisable
  breath(el){
    if (!this.ok() || !el || el._breath) return;
    el._breath = gsap.to(el, { scale:1.035, duration:.95, yoyo:true, repeat:-1, ease:'sine.inOut', paused:el.disabled });
  },
  syncBreath(el){
    if (!el || !el._breath) return;
    if (el.disabled){ el._breath.pause(); gsap.set(el, { clearProps:'transform' }); } else if (el._breath.paused() && !el._press) el._breath.play();
  },
  pauseBreath(el){ if (el._breath) el._breath.pause(); },
  resumeBreath(el){ if (el._breath && !el.disabled) el._breath.restart(); },
  stopBreath(el){ if (el && el._breath){ el._breath.kill(); el._breath = null; gsap.set(el, { clearProps:'transform' }); } },

  // à l'arrivée sur une page : ses blocs montent en cascade
  enter(page){
    if (!this.ok() || !page) return;
    const kids = [...page.children].filter(c=> c.offsetParent !== null);
    if (!kids.length) return;
    gsap.from(kids, { y:22, opacity:0, duration:.5, stagger:.07, delay:.12, ease:'power3.out', clearProps:'transform,opacity' });
  },

  // liste de cartes qui apparaît en cascade (changement de branche de l'arbre)
  cards(nodes){
    if (!this.ok() || !nodes.length) return;
    gsap.from(nodes, { y:16, opacity:0, scale:.95, duration:.38, stagger:{ each:.025, amount:.45 }, ease:'back.out(1.6)', clearProps:'transform,opacity' });
  },

  // petit saut de ressort (achat réussi, compteur qui change)
  pop(el, from){
    if (!this.ok() || !el) return;
    gsap.fromTo(el, { scale:from || 1.14 }, { scale:1, duration:.6, ease:'elastic.out(1, 0.45)', clearProps:'transform' });
  },

  // coup de poing du CTA au lancement
  punch(el){
    if (!this.ok() || !el) return;
    this.stopBreath(el);
    gsap.timeline().to(el, { scale:.9, duration:.08, ease:'power2.in' }).to(el, { scale:1.14, duration:.22, ease:'back.out(3)' });
  },

  // TRANSITIONS : le rideau (#vfxCover) se ferme pendant que l'accueil s'éloigne, puis se rouvre à l'arrivée dans le niveau (uncover). Sans GSAP : rappel immédiat.
  cover(done, s){
    let o = document.getElementById('vfxCover');
    if (!o){ o = document.createElement('div'); o.id = 'vfxCover'; document.getElementById('game-container').appendChild(o); }
    if (!this.ok()){ o.style.opacity = 1; o.style.visibility = 'visible'; if (done) done(); return; }
    gsap.killTweensOf(o); gsap.set(o, { visibility:'visible' });
    const home = document.getElementById('home');
    gsap.timeline({ onComplete:done })
      .to(o, { opacity:1, duration:s || .45, ease:'power2.in' }, 0)
      .to(home, { scale:1.06, duration:s || .45, ease:'power2.in', transformOrigin:'50% 62%' }, 0);
  },
  uncover(){
    const o = document.getElementById('vfxCover'); if (!o) return;
    const home = document.getElementById('home');
    if (!this.ok()){ o.style.opacity = 0; o.style.visibility = 'hidden'; return; }
    gsap.killTweensOf(o); gsap.set(home, { clearProps:'transform' });
    gsap.to(o, { opacity:0, duration:.75, delay:.1, ease:'power2.out', onComplete:()=> gsap.set(o, { visibility:'hidden' }) });
  },

  // rapport d'intervention : le document s'imprime ligne à ligne, les chiffres défilent, le tampon claque, N.O.R.M.A. commente, puis les boutons
  result(go, o){
    if (!this.ok() || !go) return;
    const q = s=> go.querySelector(s), all = s=> [...go.querySelectorAll(s)];
    if (this._goTl) this._goTl.kill();
    ['btnNext', 'btnRetry', 'btnGoMenu'].forEach(id=> this.stopBreath(document.getElementById(id)));
    const nb = q('#newBest'); if (nb._pulse){ nb._pulse.kill(); nb._pulse = null; gsap.set(nb, { clearProps:'transform' }); }
    const doc = q('.rp-doc'), title = q('.go-title'), nm = q('#rpNorma');
    const full = nm.textContent; nm.textContent = '';
    const tl = this._goTl = gsap.timeline();
    tl.fromTo(doc, { clipPath:'inset(0% 0% 100% 0%)' }, { clipPath:'inset(0% 0% 0% 0%)', duration:1, ease:'steps(32)', clearProps:'clipPath' }, 0);
    const prog = q('#goProg');
    if (!prog.classList.contains('hidden')){
      const fill = q('#goProgFill'), w = fill.style.width, txt = q('#goProgTxt');
      tl.fromTo(fill, { width:'0%' }, { width:w, duration:.9, ease:'power2.inOut' }, .5);
      tl.call(()=>{ const to = parseInt(txt.textContent, 10) || 0; txt.textContent = '0%'; this.count(txt, to, v=> v + '%'); }, null, .5);
    }
    tl.call(()=>{ ['finalScore', 'finalKills'].forEach(id=>{ const b = document.getElementById(id), to = parseInt(b.textContent, 10) || 0; b.textContent = '0'; this.count(b, to, v=> String(v)); }); }, null, .65);
    const rows = all('.go-rw');
    if (rows.length) tl.from(rows, { x:-24, opacity:0, duration:.35, stagger:.12, ease:'power3.out', clearProps:'transform,opacity' }, 1);
    const tot = q('.go-rw.total b');
    if (tot) tl.call(()=>{ const to = parseInt(tot.textContent.replace(/\D/g, ''), 10) || 0; tot.innerHTML = '+0 ' + uiIco('frag'); this.count(tot, to, v=> '+' + v + ' ' + uiIco('frag')); this.pop(tot, 1.25); }, null, 1 + .12*rows.length);
    const t1 = 1.25 + .12*rows.length;
    const unl = all('.go-unlock');
    if (unl.length) tl.from(unl, { scale:.5, opacity:0, duration:.7, stagger:.2, ease:'elastic.out(1, 0.5)', clearProps:'transform,opacity' }, t1);
    tl.from(q('.rp-eval'), { opacity:0, x:-16, duration:.4, clearProps:'transform,opacity' }, t1 + .1);
    tl.from(q('#goExtra'), { opacity:0, y:8, duration:.4, clearProps:'transform,opacity' }, t1 + .2);
    // le tampon claque sur le document
    tl.from(title, { scale:3.4, opacity:0, duration:.28, ease:'power4.in', clearProps:'transform,opacity' }, t1 + .55);
    tl.to(doc, { x:3, y:2, duration:.05, yoyo:true, repeat:5, ease:'none', clearProps:'transform' }, '>');
    // N.O.R.M.A. commente, lettre par lettre
    tl.call(()=>{ let n = 0; clearInterval(nm._ty); nm.classList.add('typing'); nm._ty = setInterval(()=>{ n += 2; nm.textContent = full.slice(0, n); if (n >= full.length){ clearInterval(nm._ty); nm.classList.remove('typing'); } }, 22); }, null, t1 + 1.05);
    if (!nb.classList.contains('hidden')){
      tl.from(nb, { scale:2.2, opacity:0, duration:.5, ease:'back.out(2.5)', clearProps:'transform,opacity' }, t1 + 1.2);
      tl.call(()=>{ nb._pulse = gsap.to(nb, { scale:1.06, duration:.6, yoyo:true, repeat:-1, ease:'sine.inOut' }); });
    }
    const btns = all('.btn:not(.hidden)');
    tl.from(btns, { y:26, opacity:0, duration:.4, stagger:.1, ease:'back.out(1.8)', clearProps:'transform,opacity' }, t1 + .9);
    tl.call(()=>{ const main = btns.find(b=> !b.classList.contains('secondary')); if (main) this.breath(main); });
  },

  // HUD d'une partie qui démarre : les barres descendent / montent à leur place
  hudIn(){
    this._hpPct = undefined;
    if (!this.ok()) return;
    gsap.from('#hud-top', { y:-56, opacity:0, duration:.6, ease:'back.out(1.6)', clearProps:'transform,opacity' });
    gsap.from('.xp-wrap', { y:30, opacity:0, duration:.6, delay:.1, ease:'back.out(1.6)', clearProps:'transform,opacity' });
    gsap.from('#waveNote', { opacity:0, duration:.5, delay:.3, clearProps:'opacity' });
  },

  // barre de vie : un « fantôme » clair reste sur la part perdue puis la rattrape ; un soin la comble aussitôt
  hudHp(pct){
    const g = document.getElementById('hpGhost'); if (!g) return;
    const last = this._hpPct; if (last !== undefined && Math.abs(pct - last) < 0.01) return;
    this._hpPct = pct;
    if (this._ghostTw){ this._ghostTw.kill(); this._ghostTw = null; }
    if (last !== undefined && pct > last + 0.5){ const t = document.getElementById('hpTrack'); if (t){ t.classList.remove('heal'); void t.offsetWidth; t.classList.add('heal'); } }      // soin : éclat vert
    if (!this.ok() || last === undefined || pct > last){ g.style.width = pct + '%'; return; }
    this._ghostTw = gsap.to(g, { width:pct + '%', duration:.45, delay:.35, ease:'power2.in' });
  },

  // petit tic sur un chiffre qui change (score), au plus toutes les 140 ms
  tick(el, k){
    if (!this.ok() || !el) return;
    const now = performance.now(); if (now - (el._tk || 0) < 140) return; el._tk = now;
    gsap.fromTo(el, { scale:k || 1.12 }, { scale:1, duration:.2, ease:'power2.out', overwrite:true, clearProps:'transform' });
  },

  // FEUILLES (pause, paramètres) : la carte (.sheet) jaillit en ressort sur un fond qui se floute, ses blocs [data-in] montent en cascade ; à la fermeture elle se replie vite.
  // Sans GSAP : simple affichage / masquage. `done` est rappelé une fois la feuille masquée (pour enchaîner sur la suivante).
  openSheet(id){
    const el = document.getElementById(id); if (!el) return;
    el.classList.remove('hidden');
    if (!this.ok()) return;
    const card = el.querySelector('.sheet'), parts = [...el.querySelectorAll('[data-in]')];
    gsap.killTweensOf([el, card, ...parts]);
    gsap.fromTo(el, { opacity:0 }, { opacity:1, duration:.22, ease:'power1.out', clearProps:'opacity' });
    gsap.fromTo(card, { y:26, scale:.93, opacity:0 }, { y:0, scale:1, opacity:1, duration:.4, ease:'back.out(1.5)', clearProps:'transform,opacity' });
    gsap.from(parts, { y:14, opacity:0, duration:.32, stagger:.05, delay:.1, ease:'power3.out', clearProps:'transform,opacity' });
  },
  closeSheet(id, done){
    const el = document.getElementById(id);
    if (!el || !this.ok() || el.classList.contains('hidden')){ if (el) el.classList.add('hidden'); if (done) done(); return; }
    const card = el.querySelector('.sheet');
    gsap.killTweensOf([el, card]);
    gsap.to(card, { y:14, scale:.96, opacity:0, duration:.17, ease:'power2.in' });
    gsap.to(el, { opacity:0, duration:.18, ease:'power1.in', onComplete:()=>{ el.classList.add('hidden'); gsap.set([el, card], { clearProps:'transform,opacity' }); if (done) done(); } });
  },

  // compteur qui défile jusqu'à sa nouvelle valeur
  count(el, to, fmt){
    if (el._cnt){ el._cnt.kill(); el._cnt = null; }
    const from = parseInt(String(el.textContent).replace(/\D/g, ''), 10) || 0;
    if (!this.ok() || from === to){ el.innerHTML = fmt(to); return; }
    const o = { v:from };
    el._cnt = gsap.to(o, { v:to, duration:Math.min(.9, .25 + Math.abs(to - from)/400), ease:'power2.out', onUpdate:()=>{ el.innerHTML = fmt(Math.round(o.v)); }, onComplete:()=>{ el.innerHTML = fmt(to); } });
    if (to < from) this.pop(el, 1.12);
  },
};
