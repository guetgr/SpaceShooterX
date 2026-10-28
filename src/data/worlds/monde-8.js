"use strict";
// Monde 8 — BROUILLON : valeurs provisoires (nom, thème et niveaux à valider). Boss : L'Hydre (dernier boss du jeu).
registerWorld({
  id:'w8', order:8, name:'LE GUICHET UNIQUE', sub:'Veuillez prendre un numéro', boss:'hydre', draft:true,
  theme:{ glow:0x60e040, rim:0xb8ff90, seed:131, freq:1.5, palette:[0x050e06, 0x0e2a10, 0x1a5a1a, 0x3a9a2a, 0x90e040, 0xf0ffc0] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w8').map(l=> JSON.parse(JSON.stringify(l))),
});
