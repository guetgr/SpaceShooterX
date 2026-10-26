"use strict";
// Apparences de la camionnette (teintes appliquées par le moteur : aucun fichier image). Choisie dans le HANGAR, sauvegardée sous ssx_skin_v1.
// Ajouter une apparence = ajouter une ligne ici. `tint` = couleur multipliée sur le sprite (null = couleurs d'origine) ; `swatch` = pastille du hangar ;
// `unlock` (optionnel, pas encore utilisé) = condition de déblocage, pour plus tard.

const SHIP_SKINS = [
  { id:'base',  name:'ORIGINE', tint:null,     swatch:'#cfd6ff' },
  { id:'ember', name:'BRAISE',  tint:0xffa07c, swatch:'#ff9a72' },
  { id:'void',  name:'VIDE',    tint:0xa99cff, swatch:'#9d8cff' },
];
const SKIN_KEY = 'ssx_skin_v1';

function getShipSkin(){
  try { const id = localStorage.getItem(SKIN_KEY); if (SHIP_SKINS.some(s=> s.id === id)) return id; } catch(e){ /* ignore */ }
  return 'base';
}

function setShipSkin(id){ try { localStorage.setItem(SKIN_KEY, id); } catch(e){ /* ignore */ } }

function shipSkinTint(id){ const s = SHIP_SKINS.find(x=> x.id === id); return s && s.tint !== null ? s.tint : null; }
