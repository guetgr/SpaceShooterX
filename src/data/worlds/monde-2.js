"use strict";
// Monde 2 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w2', order:2, name:'NEBULEUSE ROUGE', sub:'Le brouillard', boss:'faucheuse', draft:true,
  theme:{ photo:'planetSrcW2', glow:0xff6a4f, rim:0xffa070, seed:23, freq:1.5, palette:[0x3a0f2a, 0x6e1d3a, 0xa8343f, 0xd2603f, 0xf0a05a, 0xffe0a0] },
  levels:[
    { id:'w2-l1', name:'DANS LE BROUILLARD',  type:'survive', threat:3, goal:{ seconds:75 }, intro:'earth', reward:{ clear:40, first:80 },  events:[{ kind:'nebula', at:25 }] },
    { id:'w2-l2', name:'ESCADRON',            type:'kill',    threat:3, goal:{ count:50 },   reward:{ clear:45, first:90 },  events:[{ kind:'kamikaze', at:20 }] },
    { id:'w2-l3', name:'CHAMP DE MINES',      type:'survive', threat:4, goal:{ seconds:80 }, reward:{ clear:50, first:100 }, events:[{ kind:'mines', at:20 }] },
    { id:'w2-l4', name:'MOISSON',             type:'collect', threat:4, goal:{ gems:35 },    reward:{ clear:55, first:110 }, events:[{ kind:'crystal', at:10 }, { kind:'meteors', at:40 }] },
    { id:'w2-l5', name:'LA FAUCHEUSE',        type:'boss',    threat:5, boss:'faucheuse',    reward:{ clear:100, first:250 } },
  ],
});
