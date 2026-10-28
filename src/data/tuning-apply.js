"use strict";
// Applique les réglages (défauts + surcharges de tuning.js) : TUTO_TUNE = réglages vivants du tuto, les niveaux de WORLDS sont modifiés en place.
// L'éditeur (editor.html) rappelle applyTuning() à chaque essai ; LEVEL_BASE garde les valeurs d'origine pour pouvoir revenir en arrière.
// TUNE_WHOLE : clés facultatives du JSON (mobs, bossTune, eventTune, norma, audio) remplacées EN ENTIER par la surcharge (null = clé retirée), pour qu'une sous-clé effacée dans l'éditeur disparaisse vraiment.
const TUNE_WHOLE = ['mobs', 'bossTune', 'eventTune', 'norma', 'audio'];
const TUNE_LEVEL_FIELDS = ['threat', 'goal', 'hpMul', 'dmgMul', 'reward', 'waves', 'timelineOnly', 'spawns', 'events', 'spawnClock', 'ambient', 'zoom', 'name', 'bg', 'intro', 'boss', 'finalBoss', 'bossName', 'tutorial'].concat(TUNE_WHOLE);
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
  const tb = (LEVEL_BASE['w1-tuto'] || {}).tutorial || TUTO_DEFAULTS;
  const td = ((ov.levels || {})['w1-tuto'] || {}).tutorial || tb;
  const t = tuneMerge(td, ov.tuto);
  Object.keys(t).forEach(k=>{ TUTO_TUNE[k] = t[k]; });
  WORLDS.forEach(w=> w.levels.forEach(l=>{
    const b = LEVEL_BASE[l.id], o = (ov.levels && ov.levels[l.id]) || {};
    TUNE_LEVEL_FIELDS.forEach(k=>{
      if (TUNE_WHOLE.indexOf(k) >= 0){
        const v = o[k] === undefined ? b[k] : o[k];
        if (v === undefined || v === null) delete l[k]; else l[k] = JSON.parse(JSON.stringify(v));
      }
      else if (k === 'waves'){
        const waves = o.waves === undefined ? (b.waves || []) : o.waves;
        if (!Array.isArray(waves) || waves.length > 1000 || waves.some(w=> !w || !BESTIARY_LIST.some(e=> e.type === w.type && !e.bossId && e.type !== 'meteor') || !Number.isFinite(w.at) || w.at < 0 || w.at > 3600 || !Number.isInteger(w.count) || w.count < 1 || w.count > 100 || !Number.isFinite(w.spacing) || w.spacing < 0 || w.spacing > 60)) throw new Error('Vague invalide');
        l.waves = waves.map(w=> ({ type:w.type, at:w.at, count:w.count, spacing:w.spacing }));
      }
      else if (Array.isArray(b[k]) || Array.isArray(o[k])) l[k] = JSON.parse(JSON.stringify(o[k] === undefined ? b[k] : o[k]));
      else if (b[k] && typeof b[k] === 'object') l[k] = Object.assign({}, b[k], o[k]);
      else if (o[k] !== undefined) l[k] = o[k];
      else if (b[k] !== undefined) l[k] = b[k];
      else delete l[k];
    });
  }));
}
applyTuning(TUNING_OVERRIDES);
