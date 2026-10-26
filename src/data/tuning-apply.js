"use strict";
// Applique les réglages (défauts + surcharges de tuning.js) : TUTO_TUNE = réglages vivants du tuto, les niveaux de WORLDS sont modifiés en place.
// L'éditeur (editor.html) rappelle applyTuning() à chaque essai ; LEVEL_BASE garde les valeurs d'origine pour pouvoir revenir en arrière.
const TUNE_LEVEL_FIELDS = ['threat', 'goal', 'hpMul', 'dmgMul', 'reward'];
const TUTO_TUNE = {};
const LEVEL_BASE = {};

function tuneMerge(base, ov){
  const out = {};
  Object.keys(base).forEach(k=>{
    const b = base[k], o = (ov && typeof ov === 'object') ? ov[k] : undefined;
    out[k] = (b && typeof b === 'object') ? tuneMerge(b, o) : (typeof o === 'number' && isFinite(o) ? o : b);
  });
  return out;
}

WORLDS.forEach(w=> w.levels.forEach(l=>{
  const b = {}; TUNE_LEVEL_FIELDS.forEach(k=>{ if (l[k] !== undefined) b[k] = JSON.parse(JSON.stringify(l[k])); });
  LEVEL_BASE[l.id] = b;
}));

function applyTuning(ov){
  ov = ov || {};
  const t = tuneMerge(TUTO_DEFAULTS, ov.tuto);
  Object.keys(t).forEach(k=>{ TUTO_TUNE[k] = t[k]; });
  WORLDS.forEach(w=> w.levels.forEach(l=>{
    const b = LEVEL_BASE[l.id], o = (ov.levels && ov.levels[l.id]) || {};
    TUNE_LEVEL_FIELDS.forEach(k=>{
      if (b[k] && typeof b[k] === 'object') l[k] = Object.assign({}, b[k], o[k]);
      else if (o[k] !== undefined) l[k] = o[k];
      else if (b[k] !== undefined) l[k] = b[k];
      else delete l[k];
    });
  }));
}
applyTuning(TUNING_OVERRIDES);
