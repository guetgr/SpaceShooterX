"use strict";
// Monde 7 — BROUILLON : valeurs provisoires (nom, thème et niveaux à valider). Boss : L'Éclipse.
registerWorld({
  id:'w7', order:7, name:'LA ZONE D\'OMBRE', sub:'Opacité réglementaire', boss:'eclipse', draft:true,
  theme:{ glow:0xffc040, rim:0xffe090, seed:117, freq:1.4, palette:[0x04020a, 0x180a2a, 0x3a1a5a, 0x6a3a8a, 0xe0a830, 0xfff0a0] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w7').map(l=> JSON.parse(JSON.stringify(l))),
});
