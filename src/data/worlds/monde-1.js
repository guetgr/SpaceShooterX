"use strict";
// Monde 1 — BROUILLON : valeurs provisoires pour tester le moteur (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w1', order:1, name:'ORBITE TERRESTRE', sub:'Le départ', boss:'dread', draft:true,
  theme:{ photo:'earth', clouds:'cloudsEarth', orbiter:'orbitW1', glow:0x4ff2ff, rim:0x7fd0ff, seed:7, freq:1.7, palette:[0x14305f, 0x1f5fa8, 0x2f86c9, 0x3f9c5a, 0x86bf62, 0xd9e8f2] },
  levels:[
    { id:'w1-tuto', name:'TUTORIEL',            type:'tuto',    threat:1, tuto:true, bg:'horizon', reward:{ clear:10, first:20 } },     // satellites, débris, boss satellite : src/game/tuto.js
    { id:'w1-l1', name:'DECOLLAGE',           type:'survive', threat:1, bg:'debris', goal:{ seconds:60 }, intro:'earth', spawns:[{ type:'sat', from:0, w:10 }, { type:'satgun', from:14, w:5 }], finalBoss:'meteo', reward:{ clear:20, first:40 } },
    { id:'w1-l2', name:'CEINTURE DE DEBRIS',  type:'survive', threat:1, bg:'station', goal:{ seconds:75 }, spawns:[{ type:'sat', from:0, w:8 }, { type:'satgun', from:10, w:6 }, { type:'bras', from:20, w:4, tier:1 }], finalBoss:'araignee', reward:{ clear:25, first:50 }, events:[{ kind:'meteors', at:30 }] },
    { id:'w1-l3', name:'PLUIE DE CRISTAUX',   type:'collect', threat:2, bg:'cristaux', goal:{ gems:25 },    spawns:[{ type:'sat', from:0, w:8 }, { type:'satgun', from:8, w:6 }, { type:'bras', from:16, w:4, tier:1 }, { type:'pilleur', from:12, w:4, tier:1 }], finalBoss:'reacteur', reward:{ clear:30, first:60 }, events:[{ kind:'crystal', at:15 }] },
    { id:'w1-l4', name:'PATROUILLE',          type:'kill',    threat:2, bg:'patrouille', goal:{ count:40 },   spawns:[{ type:'sat', from:0, w:6 }, { type:'satgun', from:6, w:6 }, { type:'eclaireur', from:6, w:6, tier:1 }, { type:'bras', from:14, w:4, tier:1 }, { type:'pilleur', from:18, w:3, tier:1 }], finalBoss:'anneau', reward:{ clear:35, first:70 } },
    { id:'w1-l5', name:'LE PDG',              type:'boss',    threat:3, bg:'direction', boss:'dread', finalBoss:'pdg', bossName:'LE PDG',  reward:{ clear:60, first:150 } },       // `boss:'dread'` reste pour la validation du monde ; le vrai boss est « Le PDG » (bosses/pdg.js)
  ],
});
