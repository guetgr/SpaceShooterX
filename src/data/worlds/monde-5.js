"use strict";
// Monde 5 — BROUILLON : valeurs provisoires (nom, thème et niveaux à valider). Boss : Le Prisme.
registerWorld({
  id:'w5', order:5, name:'LA GALERIE DES MIROIRS', sub:'Reflet non contractuel', boss:'prisme', draft:true,
  theme:{ glow:0x5ac8ff, rim:0xb8ecff, seed:89, freq:1.2, bands:0.4, palette:[0x061a2a, 0x0e3a5a, 0x1a6a9a, 0x4aa8d8, 0xa8e0f8, 0xf0ffff] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w5').map(l=> JSON.parse(JSON.stringify(l))),
});
