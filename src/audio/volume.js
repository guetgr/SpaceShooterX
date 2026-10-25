"use strict";
// Volumes (VOL).

/* VOLUMES (0 à 100), réglables dans les paramètres et mémorisés. La courbe est "au carré": 50 sur la barre = moitié moins fort à l'oreille. */
const VOL = {
  master:100, music:100, sfx:100,
  load(){ try{ const o = JSON.parse(localStorage.getItem('ssx_vol') || '{}'); ['master','music','sfx'].forEach(k=>{ if (typeof o[k] === 'number') this[k] = Math.max(0, Math.min(100, Math.round(o[k]))); }); }catch(e){ /* ignore */ } },
  save(){ try{ localStorage.setItem('ssx_vol', JSON.stringify({ master:this.master, music:this.music, sfx:this.sfx })); }catch(e){ /* ignore */ } },
  c(v){ return Math.pow(v / 100, 2); }
};

VOL.load();
