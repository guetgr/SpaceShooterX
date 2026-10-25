"use strict";
// Fusions de cartes.

const FUSIONS = [
  { id:'fus_pierce', icon:'☄️', name:'FUSION: OBUS PERCEUR', desc:'PERFORANT + DEGATS+ : +2 perforation, +25% de dégâts', cards:[['pierce',2],['damage',3]],
    apply:(s)=>{ s.pierce += 2; s.damage *= 1.25; } },
  { id:'fus_plomb', icon:'🌀', name:'FUSION: TEMPETE DE PLOMB', desc:'CADENCE+ + TIR MULTIPLE : +1 projectile, +20% de cadence', cards:[['firerate',3],['spread',2]],
    apply:(s)=>{ s.spreadCount += 1; s.fireRate *= 0.8; } },
  { id:'fus_forteresse', icon:'🏰', name:'FUSION: FORTERESSE', desc:'BLINDAGE+ + BOUCLIER : +40 PV max et +40 de bouclier', cards:[['life',3],['shield',2]],
    apply:(s)=>{ s.maxHp += 40; s.shieldMax += 40; }, heal:40 },
  { id:'fus_nitro', icon:'🚀', name:'FUSION: NITRO', desc:'REACTEURS + VELOCITE : vaisseau et tirs bien plus rapides', cards:[['speed',3],['bulletspeed',2]],
    apply:(s)=>{ s.moveResponsiveness = Math.min(24, s.moveResponsiveness + 4); s.bulletSpeed *= 1.25; } },
  { id:'fus_orage', icon:'🌩️', name:'FUSION: ORAGE', desc:'FOUDRE + REBOND (arbre) : +2 arcs de foudre et +1 rebond', tree:['t_foudre','t_rebond'],
    apply:(s)=>{ s.chainLightning += 2; s.bounce += 1; } },
  { id:'fus_vortex', icon:'🌌', name:'FUSION: VORTEX', desc:'PULSAR + TROU NOIR (arbre) : le pulsar est plus fréquent et le trou noir plus long', tree:['t_pulsar','t_trounoir'],
    apply:(s)=>{ s.pulsar += 1; s.blackHoleBoost = 1; } },
];
