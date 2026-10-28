"use strict";
// Vortex : partie sans fin (tenir le plus longtemps, infliger le plus de dégâts). Records locaux, sur l'appareil seulement.
// Clé de sauvegarde propre (ssx_vortex_v1) : aucune autre sauvegarde n'est touchée.
const VORTEX_KEY = 'ssx_vortex_v1';

function getVortexRecords(){
  try {
    const r = JSON.parse(localStorage.getItem(VORTEX_KEY) || 'null');
    if (r && typeof r === 'object') return { time:Math.max(0, +r.time || 0), damage:Math.max(0, +r.damage || 0), runs:Math.max(0, +r.runs || 0) };
  } catch(e){ /* ignore */ }
  return { time:0, damage:0, runs:0 };
}

// enregistre une partie (durée en secondes, dégâts infligés) ; renvoie ce qui est battu et les anciens records
function recordVortexRun(time, damage){
  const before = getVortexRecords(), t = Math.floor(time), d = Math.floor(damage);
  const after = { time:Math.max(before.time, t), damage:Math.max(before.damage, d), runs:before.runs + 1 };
  try { localStorage.setItem(VORTEX_KEY, JSON.stringify(after)); } catch(e){ /* ignore */ }
  return { newTime: t > before.time, newDamage: d > before.damage, before, after };
}

function vortexTimeText(sec){ sec = Math.floor(sec); return Math.floor(sec/60) + ':' + String(sec%60).padStart(2, '0'); }
