"use strict";
// Arrivée du boss d'un ordre. Le but de tout ordre est de VAINCRE SON BOSS (plus d'objectif de temps, d'éliminations ou de cristaux).
// Le boss arrive APRÈS les autres mobs de la timeline : dernière vague + marge, fin du dernier événement ; `bossAt` (secondes, facultatif) fixe la date à la main.
// Un ordre « boss » (dernier du secteur) l'appelle tout de suite. Partagé par le jeu (game/level.js) et l'éditeur (tools/editor/timeline.js).
const BOSS_MARGIN = 5;          // secondes entre la dernière vague et le boss
const BOSS_RUSH = 1.5;          // ordre « boss » : le boss arrive dès la fin du décollage (et plancher pour une timeline vide)
const BOSS_EVENT_DURATION = 15; // durée supposée d'un événement sans durée forcée

// boss « finaux » des ordres (modules src/bosses/*.js) : nom affiché ; `boss:'dread'` = boss générique provisoire (src/data/bosses.js)
const FINAL_BOSS_NAMES = { meteo:'La Météo', araignee:'Araignée de tri', reacteur:'Le Réacteur', anneau:'L\'Anneau', pdg:'Le PDG dans sa tour', crabe:'Le Crabe à scies', incinerateur:'L\'Incinérateur', benne:'La Benne folle', broyeur:'Le Broyeur', reparateur:'Le Réparateur en chef' };

function levelBossAt(d){
  if (typeof d.bossAt === 'number' && isFinite(d.bossAt)) return d.bossAt;
  if (d.type === 'boss') return BOSS_RUSH;
  let t = 0;
  (d.waves || []).forEach(w=>{ t = Math.max(t, w.at + ((w.count || 1) - 1)*(w.spacing || 0) + BOSS_MARGIN); });
  (d.events || []).forEach(e=>{ t = Math.max(t, e.at + (e.duration == null ? BOSS_EVENT_DURATION : e.duration)); });
  return Math.max(t, BOSS_RUSH);
}
