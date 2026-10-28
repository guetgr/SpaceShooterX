"use strict";
// Monde 1 — BROUILLON : valeurs provisoires pour tester le moteur (étape 8 du plan : contenu et équilibrage).
registerWorld({
  id:'w1', order:1, name:'ORBITE TERRESTRE', sub:'Le départ', boss:'dread', draft:true,
  theme:{ photo:'earth', clouds:'cloudsEarth', orbiter:'orbitW1', glow:0x4ff2ff, rim:0x7fd0ff, seed:7, freq:1.7, palette:[0x14305f, 0x1f5fa8, 0x2f86c9, 0x3f9c5a, 0x86bf62, 0xd9e8f2] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w1').map(l=> JSON.parse(JSON.stringify(l))),
});
