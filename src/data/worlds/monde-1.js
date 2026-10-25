"use strict";
// Monde 1 — BROUILLON : valeurs provisoires pour tester le moteur (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w1', order:1, name:'ORBITE TERRESTRE', sub:'Le départ', boss:'dread', draft:true,
  theme:{ glow:0x4ff2ff, rim:0x7fd0ff, seed:7, freq:1.7, palette:[0x14305f, 0x1f5fa8, 0x2f86c9, 0x3f9c5a, 0x86bf62, 0xd9e8f2] },
  levels:[
    { id:'w1-l1', name:'DECOLLAGE',           type:'survive', threat:1, goal:{ seconds:60 }, intro:'earth', reward:{ clear:20, first:40 } },
    { id:'w1-l2', name:'CEINTURE DE DEBRIS',  type:'survive', threat:1, goal:{ seconds:75 }, reward:{ clear:25, first:50 }, events:[{ kind:'meteors', at:30 }] },
    { id:'w1-l3', name:'PLUIE DE CRISTAUX',   type:'collect', threat:2, goal:{ gems:25 },    reward:{ clear:30, first:60 }, events:[{ kind:'crystal', at:15 }] },
    { id:'w1-l4', name:'PATROUILLE',          type:'kill',    threat:2, goal:{ count:40 },   reward:{ clear:35, first:70 } },
    { id:'w1-l5', name:'LE DREADNOUGHT',      type:'boss',    threat:3, boss:'dread',        reward:{ clear:60, first:150 } },
  ],
});
