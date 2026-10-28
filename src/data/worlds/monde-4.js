"use strict";
// Monde 4 — BROUILLON : valeurs provisoires (nom, thème et niveaux à valider). Boss : La Ruche.
registerWorld({
  id:'w4', order:4, name:'LA RUCHE LOGISTIQUE', sub:'Livraison en essaim', boss:'ruche', draft:true,
  theme:{ glow:0xffa030, rim:0xffd070, seed:71, freq:1.6, palette:[0x2a1404, 0x5a2c08, 0x9a5410, 0xd8901c, 0x9be040, 0xf0ffb0] },
  levels:Object.values(LEVEL_FILES).filter(l=> l.world === 'w4').map(l=> JSON.parse(JSON.stringify(l))),
});
