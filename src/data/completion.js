"use strict";
// FINITION d'un niveau (en %) : plusieurs objectifs pondérés (somme = 100). On garde le MEILLEUR de chaque objectif sur toutes les parties,
// donc chaque partie (même perdue) peut faire monter le %. Des paliers (25/50/75/100 %) rapportent des fragments, une seule fois.
// Sauvegarde : p.comp[levelId] = { objectifId: 0..1 } dans ssx_worlds_v1 (voir world-progress.js).

// Les poids, le nombre de satellites à détruire et les récompenses des paliers viennent de TUTO_TUNE (réglables dans l'éditeur, editor.html).
const LEVEL_COMPLETION = {
  'w1-tuto': ()=> [
    { id:'sats',  w:TUTO_TUNE.comp.sats,  label:'Satellites détruits',   tip:'détruis tous les satellites' },
    { id:'boss',  w:TUTO_TUNE.comp.boss,  label:'Boss endommagé',        tip:'blesse davantage le boss' },
    { id:'win',   w:TUTO_TUNE.comp.win,   label:'Boss vaincu',           tip:'bats le boss' },
    { id:'clean', w:TUTO_TUNE.comp.clean, label:'Sans te faire toucher', tip:'bats le boss sans te faire toucher' },
  ],
};
const COMPLETION_STEPS = [25, 50, 75, 100];
const completionReward = s=> TUTO_TUNE.rewards['m' + s] || 0;      // fragments par palier franchi pour la 1re fois

const _cl01 = v=> Math.max(0, Math.min(1, +v || 0));

function completionDefs(id){ return LEVEL_COMPLETION[id] ? LEVEL_COMPLETION[id]() : null; }

// % (entier) d'un jeu de valeurs { objectifId: 0..1 } ; sans `comp`, le meilleur enregistré. Arrondi vers le bas : 100 % = vraiment tout.
function completionPct(id, comp){
  const d = completionDefs(id); if (!d) return 0;
  comp = comp || getWorldProgress().comp[id] || {};
  let s = 0, tot = 0; d.forEach(c=>{ s += c.w * _cl01(comp[c.id]); tot += c.w; });
  return tot > 0 ? Math.floor(100 * s / tot + 1e-6) : 0;       // poids ramenés à 100
}

// objectif le plus rentable qui reste à faire : { label, tip, missing (en points de %) } ; null si 100 %
function completionNext(id, comp){
  const d = completionDefs(id); if (!d) return null;
  comp = comp || getWorldProgress().comp[id] || {};
  let best = null; const tot = d.reduce((a, c)=> a + c.w, 0) || 1;
  d.forEach(c=>{ const miss = Math.round(100 * c.w / tot * (1 - _cl01(comp[c.id]))); if (miss > 0 && (!best || miss > best.missing)) best = { label:c.label, tip:c.tip, missing:miss }; });
  return best;
}

// enregistre les valeurs d'une partie (victoire OU défaite). Renvoie { before, after, runPct, rows, milestones, fragments } pour l'écran de fin.
function recordCompletion(id, vals){
  const d = completionDefs(id); if (!d) return null;
  const p = getWorldProgress(), old = p.comp[id] || {}, now = {}, tot = d.reduce((a, c)=> a + c.w, 0) || 1;
  const rows = d.map(c=>{
    const prev = _cl01(old[c.id]), run = _cl01(vals[c.id]);
    now[c.id] = Math.max(prev, run);
    return { id:c.id, label:c.label, w:Math.round(100 * c.w / tot), tip:c.tip, prev, run, best:now[c.id] };
  });
  const before = completionPct(id, old);
  p.comp[id] = now; setWorldProgress(p);
  const after = completionPct(id, now);
  const milestones = COMPLETION_STEPS.filter(s=> before < s && after >= s);
  let fragments = 0; milestones.forEach(s=>{ fragments += completionReward(s); });
  if (fragments){ const m = getMeta(); m.composants += fragments; setMeta(m); }
  return { before, after, runPct: completionPct(id, vals), rows, milestones, fragments };
}
