"use strict";
// Monde 2 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w2', order:2, name:'LA CASSE LUNAIRE', sub:'Recyclage obligatoire', boss:'faucheuse', draft:true,
  theme:{ photo:'planetSrcW2', glow:0xff6a4f, rim:0xffa070, seed:23, freq:1.5, palette:[0x3a0f2a, 0x6e1d3a, 0xa8343f, 0xd2603f, 0xf0a05a, 0xffe0a0] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w2').map(l=> JSON.parse(JSON.stringify(l))),
});
