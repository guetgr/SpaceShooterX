"use strict";
// Méta-progression (sauvegarde permanente), niveau d'alerte, ascension.

const META_KEY = 'ssx_meta_v2';

function getMeta(){
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) || 'null');
    if (raw && typeof raw === 'object') return { fragments: raw.fragments||0, tree: raw.tree||{}, asc: raw.asc||0 };
  } catch(e){ /* ignore */ }
  return { fragments:0, tree:{}, asc:0 };
}

function setMeta(meta){
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch(e){ /* ignore */ }
}

// "Niveau d'alerte" — the more the permanent skill tree is invested, the nastier mobs get
// points investis dans l'arbre pour atteindre les niveaux 2, 3, 4... (l'arbre complet vaut ~333 points)
const ALERT_THRESHOLDS = [6, 14, 24, 36, 50, 90, 140, 170, 200, 230, 260, 290, 342, 381];   // le niveau 15 = l'arbre complet


// chaque ASCENSION ajoute +1 niveau d'alerte (jusqu'à 20) en plus de celui de l'arbre, et des bonus permanents
const ALERT_CAP = 20;

let ASCEND_MIN = 330;   // points à investir dans l'arbre pour pouvoir s'élever (niveau d'alerte 14 de l'arbre)

function effectiveAlert(meta){ return Math.min(ALERT_CAP, computeAlertLevel(meta.tree) + (meta.asc||0)); }

function applyAscension(stats, asc){
  if (!asc) return;
  stats.damage *= 1 + 0.10*asc; stats.maxHp *= 1 + 0.10*asc;
  stats.xpBonus += 0.10*asc; stats.fragmentBonus += 0.10*asc;
}

function treeTotalPoints(tree){ return Object.values(tree||{}).reduce((a,v)=>a+v,0); }

function computeAlertLevel(tree){
  const total = treeTotalPoints(tree);
  let lvl = 1;
  ALERT_THRESHOLDS.forEach((t,i)=>{ if (total >= t) lvl = i + 2; });
  return lvl;
}

// weaponTier 1 = tir de base, 2 = "tir secondaire" (niv.3+), 3 = "3e tir" (niv.5+)
function weaponTierFor(alertLevel){
  if (alertLevel >= 5) return 3;
  if (alertLevel >= 3) return 2;
  return 1;
}
