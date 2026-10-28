"use strict";
// Monde 6 — BROUILLON : valeurs provisoires (nom, thème et niveaux à valider). Boss : Le Kraken.
registerWorld({
  id:'w6', order:6, name:'L\'OCEAN DE BOUES', sub:'Rejets en mer autorisés', boss:'kraken', draft:true,
  theme:{ glow:0x20d8c0, rim:0x80ffe8, seed:103, freq:1.7, bands:0.6, palette:[0x020c1a, 0x06284a, 0x0a4a7a, 0x12808c, 0x30c8b8, 0xb8fff0] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w6').map(l=> JSON.parse(JSON.stringify(l))),
});
