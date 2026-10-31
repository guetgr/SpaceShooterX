"use strict";
// Progression dans les mondes (sauvegarde permanente, clé ssx_worlds_v1 — incluse dans SAVE_KEYS pour la sauvegarde cloud).
// On ne stocke que les victoires ; les déverrouillages se déduisent :
//   niveau N débloqué = niveau N-1 du monde gagné · monde débloqué = boss du monde précédent vaincu (le monde d'`order` le plus bas est toujours ouvert).

const WORLDS_KEY = 'ssx_worlds_v1';

function getWorldProgress(){
  try {
    const r = JSON.parse(localStorage.getItem(WORLDS_KEY) || 'null');
    if (r && typeof r === 'object') return { v:1, levels: (r.levels && typeof r.levels === 'object') ? r.levels : {}, seen: (r.seen && typeof r.seen === 'object') ? r.seen : {}, comp: (r.comp && typeof r.comp === 'object') ? r.comp : {}, last: r.last || null };
  } catch(e){ /* ignore */ }
  return { v:1, levels:{}, seen:{}, comp:{}, last:null };
}

function setWorldProgress(p){
  try { localStorage.setItem(WORLDS_KEY, JSON.stringify(p)); } catch(e){ /* ignore */ }
}

const _seeAll = ()=> typeof DEV_SEE_ALL !== 'undefined' && DEV_SEE_ALL;       // mode DEV : tout est ouvert

function isLevelDone(id, p){ return !!((p || getWorldProgress()).levels[id]); }

function isWorldUnlocked(wid, p){
  if (_seeAll()) return true;
  const w = worldById(wid); if (!w) return false;
  const wi = WORLDS.indexOf(w); if (wi <= 0) return true;
  const prev = WORLDS[wi - 1];
  return isLevelDone(prev.levels[prev.levels.length - 1].id, p);
}

function isLevelUnlocked(id, p){
  const l = levelById(id); if (!l) return false;
  if (_seeAll()) return true;
  p = p || getWorldProgress();
  if (!isWorldUnlocked(l.world, p)) return false;
  if (l.index === 0) return true;
  const prev = worldById(l.world).levels[l.index - 1];
  if (prev.type === 'tuto' && Object.keys(p.levels).length) return true;      // sauvegarde d'avant le tuto-niveau : on ne reverrouille rien
  return isLevelDone(prev.id, p);
}

// { done, total, bossDown } pour l'anneau de progression d'un monde
function worldSummary(wid, p){
  p = p || getWorldProgress();
  const w = worldById(wid), total = w.levels.length;
  const done = w.levels.filter(l=> isLevelDone(l.id, p)).length;
  return { done, total, bossDown: isLevelDone(w.levels[total - 1].id, p) };
}

// premier niveau jouable non terminé (celui que la carte met en avant) ; null si tout est fini
function firstOpenLevel(p){
  p = p || getWorldProgress();
  for (const w of WORLDS) for (const l of w.levels) if (!isLevelDone(l.id, p) && isLevelUnlocked(l.id, p)) return l;
  return null;
}

// enregistre une victoire. Renvoie { first, unlockedLevel, unlockedWorld } (ids ou null) pour que l'écran de résultat annonce les déblocages ;
function recordLevelClear(id, score){
  const l = levelById(id); if (!l) return null;
  const p = getWorldProgress(), before = p.levels[id];
  const nxt = nextLevelOf(id);
  const wasOpen = nxt ? isLevelUnlocked(nxt.id, p) : true;
  const e = before || { clears:0, best:0 };
  e.clears += 1; e.best = Math.max(e.best || 0, Math.floor(score || 0));
  p.levels[id] = e; p.last = id;
  setWorldProgress(p);
  const opened = nxt && !wasOpen && isLevelUnlocked(nxt.id, p);
  return { first: !before, unlockedLevel: opened && nxt.world === l.world ? nxt.id : null, unlockedWorld: opened && nxt.world !== l.world ? nxt.world : null };
}

function markWorldSeen(key){ const p = getWorldProgress(); p.seen[key] = 1; setWorldProgress(p); }      // animations de déverrouillage jouées une seule fois
function wasWorldSeen(key){ return !!getWorldProgress().seen[key]; }
