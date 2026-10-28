"use strict";
// Monde 3 — BROUILLON : valeurs provisoires (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w3', order:3, name:'MARS, PLANETE POUBELLE', sub:'Gestion des déchets dangereux', boss:'ruche', draft:true,
  theme:{ photo:'planetSrcW3', glow:0xb070ff, rim:0xc9a0ff, seed:41, freq:1.4, bands:0.55, palette:[0x1a0f3a, 0x3a2270, 0x5f3aa8, 0x8a5fd0, 0x3fb8b0, 0xb8f0e0] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w3').map(l=> JSON.parse(JSON.stringify(l))),
});
