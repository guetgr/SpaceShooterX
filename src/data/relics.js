"use strict";
// Reliques.

/* =========================================================
   RELIQUES DE BOSS — à chaque boss vaincu on choisit 1 relique parmi 3 (celles du boss tombé), valable pour la partie.
   FUSIONS — deux cartes montées assez haut débloquent une fusion unique, proposée uniquement dans la récompense d'un boss vaincu.
========================================================= */
const RELICS = {
  dread: [
    { id:'r_blindage', icon:'🛡️', name:'BLINDAGE LOURD', desc:'+30% de PV max (et soigne d\'autant)', fn:(sc)=>{ const add = sc.stats.maxHp*0.30; sc.stats.maxHp += add; sc.hp += add; } },
    { id:'r_canon',    icon:'💥', name:'CANON LOURD',    desc:'+35% de dégâts', fn:(sc)=>{ sc.stats.damage *= 1.35; } },
    { id:'r_braise',   icon:'🕊️', name:'BRAISE',         desc:'+1 résurrection (50% des PV)', fn:(sc)=>{ sc.phoenixCharges += 1; } },
  ],
  faucheuse: [
    { id:'r_faux',     icon:'🌙', name:'FAUX SPECTRALE', desc:'Tes tirs traversent 2 ennemis de plus', fn:(sc)=>{ sc.stats.pierce += 2; } },
    { id:'r_frenesie', icon:'⚡', name:'FRENESIE',       desc:'+30% de cadence de tir', fn:(sc)=>{ sc.stats.fireRate /= 1.3; } },
    { id:'r_vent',     icon:'💨', name:'LAME DU VENT',   desc:'+2 charges d\'esquive', fn:(sc)=>{ sc.dodgeCharges += 2; } },
  ],
  ruche: [
    { id:'r_nanites',  icon:'🧬', name:'NANITES',        desc:'Régénère 0,8% de tes PV par seconde', fn:(sc)=>{ sc.stats.hpRegenPct += 0.008; } },
    { id:'r_miel',     icon:'🍯', name:'MIEL',           desc:'+40% d\'XP gagnée', fn:(sc)=>{ sc.stats.xpBonus += 0.40; } },
    { id:'r_reine',    icon:'👑', name:'COURONNE DE REINE', desc:'+2 relances et +1 carte à chaque niveau', fn:(sc)=>{ sc.rerollsLeft += 2; sc.stats.cardChoices = Math.min(5, sc.stats.cardChoices + 1); } },
  ],
  prisme: [
    { id:'r_refract',  icon:'🔱', name:'REFRACTEUR',     desc:'+1 projectile en éventail', fn:(sc)=>{ sc.stats.spreadCount += 1; } },
    { id:'r_cristal',  icon:'💎', name:'CRISTAL ACERE',  desc:'+20% de chance de coup critique', fn:(sc)=>{ sc.stats.critChance += 0.20; } },
    { id:'r_lentille', icon:'🔍', name:'LENTILLE',       desc:'Projectiles +30% plus rapides et +15% de dégâts', fn:(sc)=>{ sc.stats.bulletSpeed *= 1.3; sc.stats.damage *= 1.15; } },
  ],
  kraken: [
    { id:'r_encre',    icon:'🖋️', name:'ENCRE',          desc:'Un champ qui ralentit les tirs ennemis (ou +1 niveau)', fn:(sc)=>{ sc.stats.slowField += 1; } },
    { id:'r_ventouse', icon:'🧲', name:'VENTOUSES',      desc:'+140 de portée d\'aimant', fn:(sc)=>{ sc.stats.magnetRadius += 140; } },
    { id:'r_tentacule',icon:'🩸', name:'TENTACULE',      desc:'+0,4% de vol de vie', fn:(sc)=>{ sc.stats.lifesteal += 0.004; } },
  ],
  eclipse: [
    { id:'r_voile',    icon:'🌫️', name:'VOILE',          desc:'+40 de bouclier max (rechargé)', fn:(sc)=>{ sc.stats.shieldMax += 40; sc.shield = sc.stats.shieldMax; } },
    { id:'r_phase',    icon:'🌀', name:'PHASE',          desc:'-10% de dégâts subis', fn:(sc)=>{ sc.stats.armorPct = Math.min(0.8, sc.stats.armorPct + 0.10); } },
    { id:'r_eclipse',  icon:'🌑', name:'ECLIPSE TOTALE', desc:'+20% de dégâts et +15% de cadence', fn:(sc)=>{ sc.stats.damage *= 1.2; sc.stats.fireRate /= 1.15; } },
  ],
  hydre: [
    { id:'r_regen',    icon:'💚', name:'REGENERATION',   desc:'Soigne 40% de tes PV et +0,5% de PV par seconde', fn:(sc)=>{ sc.hp = Math.min(sc.stats.maxHp, sc.hp + sc.stats.maxHp*0.4); sc.stats.hpRegenPct += 0.005; } },
    { id:'r_tetes',    icon:'🐍', name:'TETES MULTIPLES',desc:'+1 projectile et +1 perforation', fn:(sc)=>{ sc.stats.spreadCount += 1; sc.stats.pierce += 1; } },
    { id:'r_venin',    icon:'☠️', name:'VENIN',          desc:'+1 arc de foudre à chaque tir qui touche', fn:(sc)=>{ sc.stats.chainLightning += 1; } },
  ],
};
