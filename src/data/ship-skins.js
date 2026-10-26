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

// Habillage purement visuel : chaque poste est indépendant des modules R&D et des statistiques.
const SHIP_PARTS = {
  roof: { label:'EQUIPEMENT DE TOIT', options:[
    { id:'none', name:'NU' }, { id:'beacon', name:'GYROPHARES' }, { id:'rack', name:'GALERIE' }
  ] },
  hood: { label:'MARQUAGE', options:[
    { id:'none', name:'SANS' }, { id:'hazard', name:'SECURITE' }, { id:'agp', name:'AGP' }
  ] },
  sides: { label:'FLANCS', options:[
    { id:'none', name:'D\'ORIGINE' }, { id:'guards', name:'RENFORTS' }, { id:'stripes', name:'BANDES' }
  ] }
};
const SHIP_PARTS_KEY = 'ssx_ship_parts_v1';

function getShipParts(){
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SHIP_PARTS_KEY)) || {}; } catch(e){ /* ancienne valeur illisible */ }
  return Object.fromEntries(Object.entries(SHIP_PARTS).map(([slot, def])=>
    [slot, def.options.some(o=> o.id === saved[slot]) ? saved[slot] : 'none']));
}

function setShipPart(slot, id){
  if (!SHIP_PARTS[slot] || !SHIP_PARTS[slot].options.some(o=> o.id === id)) return;
  const parts = getShipParts(); parts[slot] = id;
  try { localStorage.setItem(SHIP_PARTS_KEY, JSON.stringify(parts)); } catch(e){ /* stockage indisponible */ }
}

// Décalcomanies et accessoires dessinés sur une couche 270×300, commune aux quatre silhouettes.
// Une seule texture est créée par combinaison et réutilisée entre l'atelier et la mission.
function shipPartsTexture(scene, parts){
  const key = 'shipParts_' + Object.keys(SHIP_PARTS).map(slot=> parts[slot]).join('_');
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 270, 300), ctx = tex.context;
  ctx.imageSmoothingEnabled = false;
  const rect = (x,y,w,h,c)=>{ ctx.fillStyle = c; ctx.fillRect(x,y,w,h); };
  const pair = (x,y,w,h,c)=>{ rect(x,y,w,h,c); rect(270-x-w,y,w,h,c); };

  if (parts.roof === 'beacon'){
    pair(74,38,31,6,'#102932'); pair(77,29,25,11,'#263b46');
    rect(79,31,20,6,'#62d9ff'); rect(171,31,20,6,'#ffc341');
    pair(82,30,9,3,'#ffffff');
  } else if (parts.roof === 'rack'){
    pair(69,25,8,69,'#16242b'); pair(72,27,4,63,'#b3bbc0');
    rect(69,30,132,6,'#15242a'); rect(73,30,124,3,'#dae0d7');
    rect(68,78,134,7,'#15242a'); rect(74,79,122,3,'#9da7a7');
  }
  if (parts.hood === 'hazard'){
    rect(93,90,84,32,'#172328'); rect(97,94,76,24,'#edb933');
    for (let x=100; x<171; x+=19){
      ctx.fillStyle = '#182228'; ctx.beginPath(); ctx.moveTo(x,118); ctx.lineTo(x+9,94); ctx.lineTo(x+17,94); ctx.lineTo(x+8,118); ctx.fill();
    }
  } else if (parts.hood === 'agp'){
    rect(100,93,70,28,'#192c30'); rect(104,97,62,20,'#e9bb43');
    ctx.fillStyle = '#172527'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AGP',135,107);
  }
  if (parts.sides === 'guards'){
    pair(51,127,18,107,'#142229'); pair(55,131,9,99,'#a7b2ae');
    pair(47,145,9,15,'#d0a947'); pair(47,202,9,15,'#d0a947');
  } else if (parts.sides === 'stripes'){
    pair(53,128,10,93,'#203137'); pair(55,137,6,68,'#ffc947');
    pair(53,165,13,7,'#f5e6b1');
  }
  tex.refresh();
  return key;
}
