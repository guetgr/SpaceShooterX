"use strict";
// Animations des menus (GSAP, vendor/gsap.min.js) : retour tactile des boutons, respiration du CTA, entrée des pages, cartes en cascade, compteurs.
// Tout est sans effet si GSAP est absent ou si le joueur demande moins d'animations (prefers-reduced-motion) : les menus restent utilisables.
const MOTION_PRESS = '#btnLaunch, .tcard, .ttab, #homeTabs button, .home-ico, .tree-invest-btn, .map-arrow, .hangar-seg button, .skin, .mod';

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
    document.getElementById('home').addEventListener('pointerdown', e=>{
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

  // compteur qui défile jusqu'à sa nouvelle valeur
  count(el, to, fmt){
    if (el._cnt){ el._cnt.kill(); el._cnt = null; }
    const from = parseInt(String(el.textContent).replace(/\D/g, ''), 10) || 0;
    if (!this.ok() || from === to){ el.textContent = fmt(to); return; }
    const o = { v:from };
    el._cnt = gsap.to(o, { v:to, duration:Math.min(.9, .25 + Math.abs(to - from)/400), ease:'power2.out', onUpdate:()=>{ el.textContent = fmt(Math.round(o.v)); }, onComplete:()=>{ el.textContent = fmt(to); } });
    if (to < from) this.pop(el, 1.12);
  },
};
