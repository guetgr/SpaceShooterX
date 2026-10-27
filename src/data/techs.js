"use strict";
// Technologies : le catalogue de la R&D. On récupère un plan (1re victoire d'un ordre), on prototype, on améliore (rangs), on spécialise ;
// on en emporte 1 à 5 selon les boss vaincus et on les ASSEMBLE en mission par des cartes. Design : docs/superpowers/specs/2026-10-27-progression-design.md §5.
// Les améliorations sont des INCRÉMENTS : `inc` appelé l fois = l'ancien `apply(stats, l)` de l'arbre ; la R&D les applique à l'assemblage, les cartes de mission une fois.
// `assemble(stats, scene)` et `spe.apply(stats, scene)` posent aussi des indicateurs sur la scène de jeu (droneOwned, laserDestructeurOwned…).
// Prix et valeurs PROVISOIRES (réglés avec tools/sim_balance.py).

const up = (id, name, desc, max, inc)=> ({ id, name, desc, max, inc });
const flag = (name)=> (s, scene)=>{ scene[name] = true; };

const TECHS = [
  // ---- secteur 1
  { id:'laser_continu', name:'LASER CONTINU', sector:1, tag:'ARME', icon:'🔫', plan:'w1-tuto', desc:'Remplace ton tir par un laser perforant.',
    assemble:(s)=>{ s.weaponMode = 'laser'; },
    upgrades:[ up('t_laser_c_portee', 'PORTEE LASER', '+10 % de vitesse du laser par rang.', 4, s=>{ s.laserSpeedBonus += 0.10; }),
               up('t_laser_c_degats', 'DEGATS LASER+', '+15 % de dégâts du laser par rang.', 5, s=>{ s.laserDamageBonus += 0.15; }) ],
    spe:{ id:'t_laser_c_cap', name:'LASER DESTRUCTEUR', desc:'Après 2 s de tir continu, le laser double ses dégâts.', apply:flag('laserDestructeurOwned') } },
  { id:'laser_auto', name:'LASER AUTO-CIBLEUR', sector:1, tag:'ARME', icon:'🎯', plan:'w1-l1', desc:'Remplace ton tir par un laser qui verrouille l\'ennemi le plus proche.',
    assemble:(s)=>{ s.weaponMode = 'laserAuto'; },
    upgrades:[ up('t_laser_a_verrou', 'VERROUILLAGE+', 'Verrouille la cible plus vite.', 4, s=>{ s.laserLockBonus += 1; }),
               up('t_laser_a_priorite', 'CIBLAGE PRIORITAIRE', 'Vise en priorité les ennemis à faibles PV.', 1, s=>{ s.laserPriority = true; }) ],
    spe:{ id:'t_laser_a_cap', name:'RETICULE OMNISCIENT', desc:'Verrouille 3 cibles à la fois au lieu d\'une.', apply:flag('reticuleOmniscientOwned') } },
  { id:'missiles_guidage', name:'MISSILES A GUIDAGE', sector:1, tag:'RAMPE', icon:'🚀', plan:'w1-l2', desc:'Une rampe de missiles chercheurs.',
    assemble:(s)=>{ s.missileCount += 1; s.missileType = 'chercheur'; },
    upgrades:[ up('t_chargemissiles', 'CHARGE', '+1 missile par salve.', 2, s=>{ s.missileCount += 1; }),
               up('t_cadmissiles', 'CADENCE MISSILES', 'Les missiles partent 8 % plus vite.', 4, s=>{ s.missileFireRateMul *= 0.92; }),
               up('t_missile_chercheur_multi', 'VERROU. MULTIPLE', 'Les missiles se répartissent sur une cible de plus.', 4, s=>{ s.missileMultiLock += 1; }),
               up('t_missile_chercheur_cad', 'CADENCE+', 'Les missiles partent 8 % plus vite.', 4, s=>{ s.missileFireRateMul *= 0.92; }) ],
    spe:{ id:'t_missile_chercheur_cap', name:'ESSAIM D\'AUTOMISSILES', desc:'Un essaim de missiles part tout seul, à intervalles réguliers.', apply:flag('swarmMissilesOwned') } },
  { id:'bouclier_reactif', name:'BOUCLIER REACTIF', sector:1, tag:null, icon:'🛡️', plan:'w1-l3', desc:'Le bouclier renvoie une onde quand il encaisse.',
    assemble:(s)=>{ s.shieldReflect = 1; },
    upgrades:[ up('t_reactif', 'ONDE DE RENVOI', 'L\'onde de renvoi gagne en puissance.', 2, s=>{ s.shieldReflect += 1; }),
               up('t_phenix_bouclier', 'RENAISSANCE BOUCLIER', '+15 PV de bouclier par rang.', 4, s=>{ s.shieldMax += 15; }) ],
    spe:null },
  { id:'ricochets', name:'TIRS RICOCHETS', sector:1, tag:null, icon:'🔁', plan:'w1-l4', desc:'Tes tirs rebondissent sur les bords de l\'écran.',
    assemble:(s)=>{ s.bounce = 1; },
    upgrades:[ up('t_rebond', 'REBOND', '+1 rebond par rang.', 2, s=>{ s.bounce += 1; }) ],
    spe:null },
  // ---- secteur 2
  { id:'drone', name:'DRONE SATELLITE', sector:2, tag:null, icon:'🤖', plan:'w2-l1', desc:'Un drone orbite autour de la camionnette et tire tout seul.',
    assemble:(s, scene)=>{ scene.droneOwned = true; },
    upgrades:[ up('t_drone_cadence', 'CADENCE DRONE', 'Le drone tire 12 % plus vite.', 4, s=>{ s.droneFireRateMul *= 0.88; }),
               up('t_drone_degats', 'DEGATS DRONE', '+15 % de dégâts du drone.', 4, s=>{ s.droneDamageMul += 0.15; }) ],
    spe:{ id:'t_drone_cap', name:'ESSAIM', desc:'Deux drones de plus.', apply:flag('droneSwarmOwned') } },
  { id:'missiles_demolition', name:'MISSILES DE DEMOLITION', sector:2, tag:'RAMPE', icon:'💣', plan:'w2-l2', desc:'Une rampe de missiles droits, lourds, qui explosent en gerbe.',
    assemble:(s)=>{ s.missileCount += 1; s.missileType = 'droit'; },
    upgrades:[ up('t_explosion', 'RAYON EXPLOSION', '+20 % de rayon d\'explosion par rang.', 3, s=>{ s.missileBlastBonus += 0.2; }),
               up('t_napalm', 'TETE INCENDIAIRE', 'Les explosions laissent du napalm.', 3, s=>{ s.missileNapalm += 1; }),
               up('t_perforantmissile', 'PERFORANTS', 'Les missiles traversent un ennemi de plus.', 3, s=>{ s.missilePierce += 1; }),
               up('t_missile_droit_charge', 'CHARGE LOURDE', '+15 % de dégâts des missiles.', 4, s=>{ s.missileDamageBonus += 0.15; }),
               up('t_missile_droit_vitesse', 'VITESSE MISSILE', '+10 % de vitesse des missiles.', 4, s=>{ s.missileSpeedBonus += 0.1; }) ],
    spe:{ id:'t_missile_droit_cap', name:'MISSILE NUCLEAIRE', desc:'Un missile nucléaire part à intervalles réguliers.', apply:flag('nukeOwned') } },
  { id:'blindage_lourd', name:'BLINDAGE LOURD', sector:2, tag:null, icon:'🏰', plan:'w2-l3', desc:'+50 % de PV, moins de collisions, mais un véhicule plus lourd.',
    assemble:(s)=>{ s.maxHp *= 1.5; s.moveResponsiveness *= 0.8; s.collisionMul *= 0.85; },
    upgrades:[ up('t_forteresse_resist', 'RESISTANCE+', '-3 % de dégâts subis et -7 % de collisions par rang.', 5, s=>{ s.armorPct = Math.min(0.75, s.armorPct + 0.03); s.collisionMul *= 0.93; }),
               up('t_forteresse_regen', 'REGEN BLINDEE', 'Régénère 0,3 % des PV max par seconde.', 4, s=>{ s.hpRegenPct += 0.003; }) ],
    spe:{ id:'t_forteresse_cap', name:'AURA DE FER', desc:'+25 % de PV, -15 % de dégâts subis, collisions presque annulées.', apply:(s)=>{ s.maxHp *= 1.25; s.armorPct = Math.min(0.8, s.armorPct + 0.15); s.collisionMul *= 0.8; } } },
  { id:'nano_reparation', name:'NANO-REPARATION', sector:2, tag:null, icon:'🩸', plan:'w2-l4', desc:'Un champ de nanorobots soigne la camionnette en aspirant les ennemis.',
    assemble:(s, scene)=>{ scene.sangsueOwned = true; },
    upgrades:[ up('t_sangsue_vol', 'VOL+', 'Plus de PV rendus par les dégâts infligés.', 5, s=>{ s.lifesteal += 0.001; }),
               up('t_sangsue_rayon', 'RAYON+', '+20 de rayon du champ.', 3, s=>{ s.sangsueRadiusBonus += 20; }),
               up('t_regen', 'REGENERATION', 'Régénère 0,5 % des PV max par seconde.', 5, s=>{ s.hpRegenPct += 0.005; }),
               up('t_voldevie', 'VOL DE VIE', '+0,1 % des dégâts infligés rendus en PV.', 5, s=>{ s.lifesteal += 0.001; }) ],
    spe:{ id:'t_sangsue_cap', name:'FESTIN', desc:'Les soins du champ sont doublés.', apply:(s)=>{ s.sangsueHealMul = (s.sangsueHealMul || 1) * 2; } } },
  { id:'benne', name:'BENNE DE RECUPERATION', sector:2, tag:null, icon:'🧺', plan:'w2-l5', desc:'La récupération des déchets paie : plus d\'XP, de cristaux et de composants.',
    assemble:()=>{},
    upgrades:[ up('t_xp', 'XP+', '+8 % d\'XP par cristal.', 6, s=>{ s.xpBonus += 0.08; }),
               up('t_chance', 'CHANCE', '+5 % de chance de cristal.', 4, s=>{ s.gemChanceBonus += 0.05; }),
               up('t_butindouble', 'BUTIN DOUBLE', '+6 % de chance de cristal bonus.', 4, s=>{ s.bonusGemChance += 0.06; }),
               up('t_collecte', 'COLLECTE AUTO', 'Aspire automatiquement les cristaux à intervalles réguliers.', 3, s=>{ s.autoCollect += 1; }),
               up('t_cristauxvaleur', 'CRISTAUX+', '+10 % de composants récupérés.', 5, s=>{ s.fragmentBonus += 0.1; }),
               up('t_coffre', 'COFFRE-FORT', '+25 % de composants récupérés.', 1, s=>{ s.fragmentBonus += 0.25; }),
               up('t_coffre_xp', 'XP++', '+5 % d\'XP par cristal.', 5, s=>{ s.xpBonus += 0.05; }),
               up('t_coffre_chance', 'CHANCE+', '+4 % de chance de cristal bonus.', 4, s=>{ s.bonusGemChance += 0.04; }) ],
    spe:{ id:'t_coffre_cap', name:'JACKPOT', desc:'+50 % de composants récupérés.', apply:(s)=>{ s.fragmentBonus += 0.5; } } },
  // ---- secteur 3
  { id:'overdrive', name:'OVERDRIVE', sector:3, tag:null, icon:'🔥', plan:'w3-l1', desc:'Une jauge se charge en frôlant les tirs ; pleine, elle double tes dégâts.',
    assemble:(s)=>{ s.overdrive = 1; s.odDur = 6000; },
    upgrades:[ up('t_overdrive', 'DUREE', '+1 s d\'overdrive par rang.', 3, s=>{ s.overdrive += 1; s.odDur += 1000; }),
               up('t_frolement', 'FROLEMENT', 'Les tirs frôlés chargent la jauge plus vite.', 3, s=>{ s.odGraze += 0.4; }),
               up('t_surchauffe', 'SURCHAUFFE', '+25 % de dégâts pendant l\'overdrive.', 3, s=>{ s.odDmgMul += 0.25; }),
               up('t_souffle', 'SECOND SOUFFLE', 'Chaque boss vaincu recharge 30 % de la jauge.', 3, s=>{ s.odBossCharge += 30; }) ],
    spe:null },
  { id:'canon_experimental', name:'CANON EXPERIMENTAL', sector:3, tag:'ARME', icon:'💠', plan:'w3-l2', desc:'Remplace ton tir par une salve en cône, plus lente et plus lourde.',
    assemble:(s)=>{ s.weaponMode = 'shotgun'; },
    upgrades:[ up('t_shotgun_plombs', 'PLUS DE PLOMBS', '+1 plomb par rang.', 4, s=>{ s.shotgunExtraPellets += 1; }),
               up('t_shotgun_recul', 'RECUL MAITRISE', 'Réduit la perte de cadence du canon.', 4, s=>{ s.shotgunRecoilReduction += 0.12; }) ],
    spe:{ id:'t_shotgun_cap', name:'CANON A FRAGMENTATION', desc:'Chaque plomb touché se fragmente en 2 éclats.', apply:flag('fragmentationOwned') } },
  { id:'arc_electrique', name:'ARC ELECTRIQUE', sector:3, tag:null, icon:'⚡', plan:'w3-l3', desc:'Chaque tir qui touche libère un arc de foudre vers un ennemi proche.',
    assemble:(s)=>{ s.chainLightning = 1; },
    upgrades:[ up('t_foudre', 'ARCS', '+1 arc de foudre par rang.', 2, s=>{ s.chainLightning += 1; }) ],
    spe:{ id:'t_tonnerre', name:'TONNERRE', desc:'Toutes les 8 s, la foudre frappe l\'ennemi le plus solide.', apply:(s)=>{ s.thunder = 1; } } },
  { id:'champ_lent', name:'CHAMP LENT', sector:3, tag:null, icon:'🐌', plan:'w3-l4', desc:'Les tirs ennemis ralentissent près de la camionnette.',
    assemble:(s)=>{ s.slowField = 1; },
    upgrades:[ up('t_champlent', 'ZONE', 'Zone plus large, ralentissement plus fort.', 3, s=>{ s.slowField += 1; }) ],
    spe:null },
  { id:'pulsar', name:'PULSAR', sector:3, tag:null, icon:'💫', plan:'w3-l5', desc:'Une onde efface les tirs ennemis proches.',
    assemble:(s)=>{ s.pulsar = 1; },
    upgrades:[ up('t_pulsar', 'FREQUENCE', 'L\'onde est plus fréquente et porte plus loin.', 3, s=>{ s.pulsar += 1; }) ],
    spe:null },
  // ---- secteurs 4 et 5 : définies, indisponibles tant que ces secteurs n'existent pas
  { id:'trou_noir', name:'TROU NOIR', sector:4, tag:null, icon:'🌌', plan:null, desc:'Un trou noir périodique attire les ennemis.',
    assemble:(s)=>{ s.blackHole = 1; },
    upgrades:[ up('t_trounoir', 'FREQUENCE', 'Le trou noir apparaît plus souvent.', 2, s=>{ s.blackHole += 1; }) ],
    spe:{ id:'t_gravite', name:'GRAVITE', desc:'+150 de portée d\'aimant, trou noir plus long.', apply:(s)=>{ s.magnetRadius += 150; s.blackHoleBoost = 1; } } },
  { id:'eclats', name:'ECLATS', sector:4, tag:null, icon:'💠', plan:null, desc:'Un ennemi détruit projette des éclats : chaînes d\'explosions.',
    assemble:(s)=>{ s.shardCount = 2; },
    upgrades:[ up('t_eclats', 'ECLATS', '+2 éclats par rang.', 2, s=>{ s.shardCount += 2; }) ],
    spe:null },
  { id:'rapatriement', name:'CONTRAT DE RAPATRIEMENT', sector:5, tag:null, icon:'🔥', plan:null, desc:'Une fois détruite, la camionnette est rapatriée et repart.',
    assemble:(s, scene)=>{ scene.phoenixOwned = true; scene.phoenixCharges = 1; },
    upgrades:[ up('t_phenix_esquive', 'ESQUIVE+', '+1 esquive par rang.', 3, s=>{ s.dodgeCharges += 1; }) ],
    spe:{ id:'t_phenix_cap', name:'IMMORTEL', desc:'Une deuxième charge de rapatriement.', apply:(s, scene)=>{ scene.doublePhoenixOwned = true; scene.phoenixCharges = 2; } } },
];

const TECH_BY_ID = {}, TECH_PLAN_LEVEL = {};
TECHS.forEach(t=>{ TECH_BY_ID[t.id] = t; if (t.plan) TECH_PLAN_LEVEL[t.plan] = t.id; });

// secteurs 1 à 3 : jouables ; 4 et 5 : « ACCES NON AUTORISE » tant que ces mondes n'existent pas (tout est ouvert en ?dev)
function techAvailable(t){ return t.sector <= WORLDS.length || (typeof DEV_SEE_ALL !== 'undefined' && DEV_SEE_ALL); }

const techMaxRang = t=> t.upgrades.reduce((a, u)=> a + u.max, 0);

// fiche R&D d'une technologie lue dans la sauvegarde : { plan, proto, rang, spe } bornés
function rdEntry(meta, techId){
  const t = TECH_BY_ID[techId], e = (meta && meta.rd && meta.rd[techId]) || {};
  const r = (typeof e.rang === 'number' && isFinite(e.rang)) ? Math.floor(e.rang) : 0;
  return { plan:!!e.plan, proto:!!e.proto, rang: t ? Math.max(0, Math.min(techMaxRang(t), r)) : 0, spe:!!e.spe };
}

// barème provisoire : prototype, 1er rang (+15 par rang suivant, x multiplicateur du secteur), spécialisation (+ pièces du secteur : secteur + 1)
const TECH_COST = {
  proto:{ 1:30, 2:60, 3:100, 4:150, 5:200 },
  rangMul:{ 1:1, 2:1.5, 3:2, 4:2.5, 5:3 },
  spe:{ 1:150, 2:250, 3:400, 4:600, 5:800 },
};

// prix de l'étape suivante (what = 'proto' | 'rang' | 'spe', `rang` = rang actuel) ; null si rien à acheter
function rdNextCost(techId, what, rang){
  const t = TECH_BY_ID[techId]; if (!t) return null;
  if (what === 'proto') return { composants:TECH_COST.proto[t.sector], pieces:null };
  if (what === 'rang') return rang >= techMaxRang(t) ? null : { composants:Math.round((25 + 15*rang) * TECH_COST.rangMul[t.sector]), pieces:null };
  if (what === 'spe'){ if (!t.spe) return null; const p = {}; p['s' + t.sector] = t.sector + 1; return { composants:TECH_COST.spe[t.sector], pieces:p }; }
  return null;
}

// { ok, reason } : reason = null | 'inconnu' | 'secteur' | 'plan' | 'proto' | 'max' | 'conception' | 'composants' | 'pieces'
function rdCanBuy(meta, techId, what){
  const t = TECH_BY_ID[techId]; if (!t) return { ok:false, reason:'inconnu' };
  if (!techAvailable(t)) return { ok:false, reason:'secteur' };
  const e = rdEntry(meta, techId);
  if (what === 'proto'){ if (e.proto) return { ok:false, reason:'max' }; if (!e.plan) return { ok:false, reason:'plan' }; }
  else {
    if (!e.proto) return { ok:false, reason:'proto' };
    if (what === 'rang' && e.rang >= techMaxRang(t)) return { ok:false, reason:'max' };
    if (what === 'spe'){ if (!t.spe) return { ok:false, reason:'conception' }; if (e.spe) return { ok:false, reason:'max' }; }
  }
  const cost = rdNextCost(techId, what, e.rang); if (!cost) return { ok:false, reason:'max' };
  if (meta.composants < cost.composants) return { ok:false, reason:'composants' };
  if (cost.pieces && Object.keys(cost.pieces).some(k=> ((meta.pieces && meta.pieces[k]) || 0) < cost.pieces[k])) return { ok:false, reason:'pieces' };
  return { ok:true, reason:null };
}

// achète l'étape : débite `meta`, renvoie true ; sinon false sans rien modifier
function rdBuy(meta, techId, what){
  if (!rdCanBuy(meta, techId, what).ok) return false;
  const e = rdEntry(meta, techId), cost = rdNextCost(techId, what, e.rang);
  meta.composants -= cost.composants;
  if (cost.pieces) Object.keys(cost.pieces).forEach(k=>{ meta.pieces[k] -= cost.pieces[k]; });
  if (!meta.rd) meta.rd = {};
  e[what === 'rang' ? 'rang' : what] = what === 'rang' ? e.rang + 1 : true;
  meta.rd[techId] = e;
  return true;
}

// accorde le plan (1re victoire de l'ordre) ; false s'il était déjà acquis ou si la technologie est inconnue
function rdGrantPlan(meta, techId){
  if (!TECH_BY_ID[techId]) return false;
  const e = rdEntry(meta, techId); if (e.plan) return false;
  if (!meta.rd) meta.rd = {};
  e.plan = true; meta.rd[techId] = e;
  return true;
}

// l'amélioration achetée au rang `rang` (1 = la première) : les rangs se consomment dans l'ordre du tableau `upgrades` ; null au-delà
function rdUpgradeAt(tech, rang){
  let n = rang;
  for (const u of tech.upgrades){ if (n <= u.max) return n >= 1 ? u : null; n -= u.max; }
  return null;
}

// applique à `stats` (et à `scene`) les `rang` premiers rangs de R&D d'une technologie : appelé à l'assemblage en mission
function rdApplyRanks(techId, stats, rang, scene){
  const t = TECH_BY_ID[techId]; if (!t) return;
  for (let i = 1; i <= rang; i++){ const u = rdUpgradeAt(t, i); if (u) u.inc(stats, scene); }
}
