"use strict";
// Monde 3 — BROUILLON : valeurs provisoires (nom, thème et niveaux à valider). Boss : La Faucheuse.
registerWorld({
  id:'w3', order:3, name:'LE CIMETIERE DES CONTRATS', sub:'Résiliation définitive', boss:'faucheuse', draft:true,
  theme:{ photo:'planetSrcW3', glow:0xa890ff, rim:0xd0c8ff, seed:57, freq:1.3, bands:0.55, palette:[0x120a24, 0x2a1a4a, 0x4a3a7a, 0x7a6aa8, 0xb8b0d8, 0xf0f0ff] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w3').map(l=> JSON.parse(JSON.stringify(l))),
});
