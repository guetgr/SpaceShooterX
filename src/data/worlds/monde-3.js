"use strict";
// Monde 3 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w3', order:3, name:'CHAMP DE RUCHES', sub:'Les essaims', boss:'ruche', draft:true,
  theme:{ glow:0xb070ff, rim:0xc9a0ff, seed:41, freq:1.4, bands:0.55, palette:[0x1a0f3a, 0x3a2270, 0x5f3aa8, 0x8a5fd0, 0x3fb8b0, 0xb8f0e0] },
  levels:[
    { id:'w3-l1', name:'FORET D\'ARAIGNEES',  type:'survive', threat:5, goal:{ seconds:90 },  reward:{ clear:60, first:120 }, events:[{ kind:'spiders', at:20 }] },
    { id:'w3-l2', name:'ESSAIMS',             type:'kill',    threat:5, goal:{ count:60 },    reward:{ clear:65, first:130 } },
    { id:'w3-l3', name:'CIEL DE TRESORINS',   type:'collect', threat:6, goal:{ gems:40 },     reward:{ clear:70, first:140 }, events:[{ kind:'goldrush', at:15 }] },
    { id:'w3-l4', name:'ESCORTE D\'ELITES',   type:'survive', threat:6, goal:{ seconds:100 }, reward:{ clear:75, first:150 }, events:[{ kind:'elite', at:20 }, { kind:'bombard', at:50 }] },
    { id:'w3-l5', name:'LA RUCHE',            type:'boss',    threat:7, boss:'ruche',        reward:{ clear:120, first:300 } },
  ],
});
