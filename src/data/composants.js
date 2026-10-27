"use strict";
// Composants ◆ : ce que les machines détruites lâchent en mission (ramassés à l'aimant), et ce que le rapport d'intervention en retient.
// Victoire : tout le ramassé + la prime AGP (moitié des primes du niveau). Défaite ou abandon : le ramassé moins la franchise d'accident (30 %).
// Design : docs/superpowers/specs/2026-10-27-progression-design.md §3.2. Les quantités lâchées sont provisoires (réglées avec tools/sim_balance.py).

const COMP = {
  smallValue:1, bigValue:5,          // valeur d'un petit / d'un gros composant
  dropChance:0.15,                   // petit ennemi : chance de lâcher 1 petit composant
  heavyTypes:['tank','elite','mothership','bomber','bras','pilleur','eclaireur'],
  heavySmall:3,                      // ennemi lourd : petits composants lâchés
  goldenBig:3, miniBossBig:4, bossBig:12, bonusBossBig:3,     // gros composants des pluies (Trésorin, boss de fin d'ordre, boss de secteur, boss bonus)
  primeMul:0.5,                      // la prime AGP ne vaut que la moitié des primes inscrites au niveau
  franchise:0.30,                    // part retenue sur le ramassé en cas d'accident du travail (ou d'abandon)
};

// prime AGP d'une victoire en niveau (`reward` = { clear, first } du niveau)
function composantsPrime(reward, first){
  return Math.round(reward.clear*COMP.primeMul) + (first ? Math.round((reward.first||0)*COMP.primeMul) : 0);
}

// comptes de fin de mission : { gross (ramassé, bonus et clauses compris), franchise, prime, total }
function composantsBank(o){
  const gross = Math.round(o.picked*(1 + o.fragmentBonus)*o.pactMul);
  const franchise = o.victory ? 0 : Math.round(gross*COMP.franchise);
  const prime = o.victory ? o.prime : 0;
  return { gross, franchise, prime, total: gross - franchise + prime };
}
