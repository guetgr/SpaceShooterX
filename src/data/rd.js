"use strict";
// Améliorations permanentes : la R&D (4 onglets : CANON, CARCASSE, BOUCLIER, PROPULSEURS) et l'atelier (5 emplacements, améliorations de l'aimant et de l'ordinateur de bord).
// Règles :
//  - une amélioration se DEBLOQUE en atteignant son secteur (`from`) ; elle s'ACHETE niveau par niveau en composants ◆ ; chaque achat apporte tout de suite son bénéfice.
//  - plafond de niveaux = 4 × (secteur atteint − secteur de déblocage + 1), secteur atteint ≤ RD_WORLD_MAX (rdCap) ; `max` borne les améliorations à valeurs entières.
//  - le bonus est calculé depuis la valeur de départ (`apply(stats, L)` appelé UNE fois sur makeDefaultStats() par applyGlobalGear), jamais cumulé par multiplications successives.
// Valeurs et prix PROVISOIRES : tableau d'équilibrage dans docs/rd-ameliorations.md (régénéré par `node tools/rd_table.js`), à régler avec tools/sim_balance.py.

const RD_WORLD_MAX = 9;
const RD_PER_WORLD = 4;

const RD_TABS = [
  { id:'canon',       name:'CANON' },
  { id:'carcasse',    name:'CARCASSE' },
  { id:'bouclier',    name:'BOUCLIER' },
  { id:'propulseurs', name:'PROPULSEURS' },
];

// les cinq emplacements de l'atelier ; `from` = secteur de déblocage (null : réservé, fonction et secteur non décidés)
const ATELIER_SLOTS = [
  { id:'laser',      name:'LASER',             from:1,    text:'Tir automatique de base, équipé de série. Ses réglages se font en R&D (CANON).' },
  { id:'aimant',     name:'AIMANT',            from:1,    text:'Ramasse tout ce qui traîne. Y compris les composants.' },
  { id:'ordinateur', name:'ORDINATEUR DE BORD', from:2,   text:'Mises à jour N.O.R.M.A. Le consentement est réputé acquis.' },
  { id:'slot4',      name:'EMPLACEMENT 4',     from:null, text:'Réservé.' },
  { id:'slot5',      name:'EMPLACEMENT 5',     from:null, text:'Réservé.' },
];

const pc = (n, d)=> String(Math.round(n*10)/10).replace('.', ',') + (d || '');         // 1,5 → « 1,5 »

// u(id, groupe, nom, effet, secteur de déblocage, prix du niveau 1, options { geo (croissance géométrique du prix), max, needs (id d'une amélioration à ≥ 1), apply(s,L), show(L) })
function rdU(id, group, name, desc, from, c0, o){ return Object.assign({ id, group, name, desc, from, c0, geo:0, max:0, needs:null }, o); }

const RD_UPGRADES = [
  // ---- CANON
  rdU('c_puissance', 'canon', 'PUISSANCE DE TIR', 'Dégâts de chaque tir.', 1, 8,
    { apply:(s, L)=>{ s.damage *= 1 + 0.02*L; }, show:L=> '+' + pc(2*L, ' %') }),
  rdU('c_cadence', 'canon', 'CADENCE DE TIR', 'Le canon tire plus vite.', 1, 8,
    { apply:(s, L)=>{ s.fireRate /= 1 + 0.03*L; }, show:L=> '+' + pc(3*L, ' %') }),
  rdU('c_double', 'canon', 'DOUBLE TIR', 'Deux projectiles partent côte à côte. Le 2e démarre à 50 % des dégâts et gagne 1,6 % par niveau.', 1, 14,
    { apply:(s, L)=>{ s.spreadCount = 2; s.doubleShotMul = Math.min(1, 0.5 + 0.016*(L - 1)); }, show:L=> '2 tirs · 2e à ' + Math.round(100*Math.min(1, 0.5 + 0.016*(L - 1))) + ' %' }),
  rdU('c_vitesse', 'canon', 'VITESSE DES PROJECTILES', 'Les projectiles volent plus vite.', 2, 10,
    { apply:(s, L)=>{ s.bulletSpeed *= 1 + 0.015*L; }, show:L=> '+' + pc(1.5*L, ' %') }),
  rdU('c_perfo', 'canon', 'PERFORATION', 'Chaque tir traverse un ennemi de plus par niveau.', 3, 16,
    { geo:1.3, max:10, apply:(s, L)=>{ s.pierce += L; }, show:L=> L + ' ennemi' + (L > 1 ? 's' : '') + ' traversé' + (L > 1 ? 's' : '') }),
  // ---- CARCASSE
  rdU('k_coque', 'carcasse', 'COQUE RENFORCEE', 'Points de vie maximum.', 1, 8,
    { apply:(s, L)=>{ s.maxHp *= 1 + 0.02*L; }, show:L=> '+' + pc(2*L, ' %') + ' (' + Math.round(100*(1 + 0.02*L)) + ' PV)' }),
  rdU('k_collision', 'carcasse', 'PROTECTION ANTICOLLISION', 'Dégâts de collision reçus.', 1, 6,
    { apply:(s, L)=>{ s.collisionMul *= Math.max(0.3, 1 - 0.015*L); }, show:L=> '-' + pc(100*(1 - Math.max(0.3, 1 - 0.015*L)), ' %') }),
  rdU('k_blindage', 'carcasse', 'BLINDAGE', 'Réduit tous les dégâts subis (50 % au plus).', 2, 10,
    { apply:(s, L)=>{ s.armorPct = Math.min(0.5, s.armorPct + 0.01*L); }, show:L=> '-' + pc(Math.min(50, L), ' %') }),
  rdU('k_autorep', 'carcasse', 'AUTOREPARATION', 'La coque se répare toute seule, en continu.', 2, 10,
    { apply:(s, L)=>{ s.hpRegenPct += 0.001*L; }, show:L=> '+' + pc(0.1*L, ' % PV/s') }),
  rdU('k_nano', 'carcasse', 'NANO-REPARATION', 'Une part des dégâts infligés revient en PV.', 4, 14,
    { apply:(s, L)=>{ s.lifesteal += 0.001*L; }, show:L=> pc(0.1*L, ' % des dégâts') }),
  // ---- BOUCLIER
  rdU('b_capacite', 'bouclier', 'CAPACITE', 'Points de bouclier. Sans capacité, les autres réglages sont inutiles.', 1, 8,
    { apply:(s, L)=>{ s.shieldMax += 4*L; }, show:L=> '+' + 4*L + ' PV' }),
  rdU('b_reprise', 'bouclier', 'REPRISE DE RECHARGE', 'Délai avant que la recharge commence, après un coup.', 2, 8,
    { needs:'b_capacite', apply:(s, L)=>{ s.shieldRegenDelayMul *= Math.max(0.25, 1 - 0.02*L); }, show:L=> pc(2.6*Math.max(0.25, 1 - 0.02*L), ' s') + ' (2,6 s de base)' }),
  rdU('b_vitesse', 'bouclier', 'VITESSE DE RECHARGE', 'Vitesse à laquelle le bouclier se remplit une fois la recharge commencée.', 2, 8,
    { needs:'b_capacite', apply:(s, L)=>{ s.shieldRegenMul *= 1 + 0.03*L; }, show:L=> '+' + pc(3*L, ' %') }),
  rdU('b_riposte', 'bouclier', 'PUISSANCE DE RIPOSTE', 'Quand le bouclier encaisse, il renvoie une onde qui blesse les ennemis proches.', 3, 12,
    { needs:'b_capacite', apply:(s, L)=>{ s.reflectPower += 0.15*L; }, show:L=> 'puissance ' + pc(0.15*L) }),
  rdU('b_portee', 'bouclier', 'PORTEE DE RIPOSTE', 'Rayon de l\'onde de riposte.', 3, 10,
    { needs:'b_riposte', apply:(s, L)=>{ s.reflectRange += 5*L; }, show:L=> '+' + 5*L + ' px' }),
  rdU('b_reserve', 'bouclier', 'RESERVE DE SECOURS', 'Une fois par mission, quand les PV passent sous 30 %, la réserve se libère en bouclier.', 4, 14,
    { needs:'b_capacite', apply:(s, L)=>{ s.shieldReserve += 4*L; }, show:L=> '+' + 4*L + ' PV de bouclier' }),
  // ---- PROPULSEURS
  rdU('p_reactivite', 'propulseurs', 'REACTIVITE', 'La camionnette suit le doigt plus vite.', 1, 6,
    { apply:(s, L)=>{ s.moveResponsiveness *= 1 + 0.015*L; }, show:L=> '+' + pc(1.5*L, ' %') }),
  rdU('p_charges', 'propulseurs', 'CHARGES D\'ESQUIVE', 'Chaque charge offre une protection (double-tap) : invulnérable, sans déplacement.', 2, 12,
    { geo:1.35, max:6, apply:(s, L)=>{ s.dodgeCharges += L; }, show:L=> L + ' charge' + (L > 1 ? 's' : '') }),
  rdU('p_duree', 'propulseurs', 'DUREE DE PROTECTION', 'Temps d\'invulnérabilité d\'une esquive.', 2, 8,
    { needs:'p_charges', apply:(s, L)=>{ s.dodgeDur += 20*L; }, show:L=> pc((400 + 20*L)/1000, ' s') + ' (0,4 s de base)' }),
  rdU('p_recup', 'propulseurs', 'RECUPERATION DES CHARGES', 'Une charge dépensée revient au bout d\'un délai (aucune sinon).', 3, 10,
    { needs:'p_charges', apply:(s, L)=>{ s.dodgeRecoverMs = Math.max(8000, 30000 - 600*L); }, show:L=> '1 charge / ' + pc(Math.max(8000, 30000 - 600*L)/1000, ' s') }),
  rdU('p_urgence', 'propulseurs', 'PROPULSION D\'URGENCE', 'Pendant une esquive, la camionnette est bien plus vive.', 4, 14,
    { needs:'p_charges', apply:(s, L)=>{ s.dodgeBoost += 0.1*L; }, show:L=> 'vivacité +' + pc(10*L, ' %') }),
  // ---- ATELIER : AIMANT
  rdU('a_portee', 'aimant', 'PORTEE DE L\'AIMANT', 'Distance d\'attraction des cristaux et des composants.', 1, 5,
    { apply:(s, L)=>{ s.magnetRadius += 3*L; }, show:L=> '+' + 3*L + ' px (60 de base)' }),
  rdU('a_collecte', 'aimant', 'COLLECTE AUTOMATIQUE', 'Aspire tout ce qui est à l\'écran à intervalles réguliers. Chaque niveau raccourcit l\'intervalle de 5 %.', 6, 25,
    { apply:(s, L)=>{ s.autoCollect = 1; s.autoCollectMs = Math.round(20000*Math.pow(0.95, L)); }, show:L=> 'toutes les ' + pc(Math.round(20000*Math.pow(0.95, L))/1000, ' s') }),
  // ---- ATELIER : ORDINATEUR DE BORD
  rdU('o_choix', 'ordinateur', 'CHOIX D\'ATOUTS', 'Un atout de plus proposé à chaque montée de niveau (5 au plus, 2 de base).', 2, 20,
    { geo:1.8, max:3, apply:(s, L)=>{ s.cardChoices += L; }, show:L=> (2 + L) + ' atouts proposés' }),
  rdU('o_relances', 'ordinateur', 'RELANCES', 'Une relance de plus par mission.', 4, 20,
    { geo:1.3, max:8, apply:(s, L)=>{ s.rerolls += L; }, show:L=> L + ' relance' + (L > 1 ? 's' : '') }),
  rdU('o_double', 'ordinateur', 'ATOUT DOUBLE', 'Chance qu\'un atout choisi compte double (50 % au plus).', 7, 30,
    { max:33, apply:(s, L)=>{ s.doubleCardChance = Math.min(0.5, s.doubleCardChance + 0.015*L); }, show:L=> pc(Math.min(50, 1.5*L), ' %') }),
  rdU('o_nebuleuse', 'ordinateur', 'VISION EN NEBULEUSE', 'Allonge le cône de vision dans la nébuleuse.', 8, 30,
    { apply:(s, L)=>{ s.nebulaVision += 0.25*L; }, show:L=> '+' + pc(21*L, ' px') }),
];

const RD_BY_ID = {};
RD_UPGRADES.forEach(u=>{ RD_BY_ID[u.id] = u; });
const rdOfGroup = group=> RD_UPGRADES.filter(u=> u.group === group);

// niveau maximal absolu d'une amélioration (secteur 9 atteint, ou `max` pour les valeurs entières)
const rdAbsMax = u=> u.max || RD_PER_WORLD*(RD_WORLD_MAX - u.from + 1);

// secteur atteint : rang du dernier secteur OUVERT par la campagne (boss du secteur précédent vaincu), pas le secteur sélectionné ; 9 au plus
function rdWorldReached(progress){
  if (typeof DEV_SEE_ALL !== 'undefined' && DEV_SEE_ALL) return RD_WORLD_MAX;
  let n = 1;
  for (let i = 1; i < WORLDS.length; i++){ if (isWorldUnlocked(WORLDS[i].id, progress)) n = i + 1; else break; }
  return Math.min(n, RD_WORLD_MAX);
}

// niveau acheté lu dans la sauvegarde : entier borné, 0 si absent ou invalide
function rdLevel(meta, id){
  const u = RD_BY_ID[id], v = meta && meta.niv && meta.niv[id];
  return (u && typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.min(rdAbsMax(u), Math.floor(v))) : 0;
}

// plafond de niveaux accessible quand le secteur `world` est atteint (0 : bloquée)
function rdCap(u, world){
  if (world < u.from) return 0;
  return Math.min(rdAbsMax(u), RD_PER_WORLD*(Math.min(world, RD_WORLD_MAX) - u.from + 1));
}

// prix du niveau `n` (le niveau 1 coûte c0) : progression linéaire de 15 % de c0 par niveau, géométrique pour les valeurs entières
function rdPrice(u, n){
  return Math.max(1, Math.round(u.geo ? u.c0*Math.pow(u.geo, n - 1) : u.c0*(1 + 0.15*(n - 1))));
}

// fiche d'une amélioration pour l'interface : tout ce qu'il faut afficher et si l'achat est possible
// state : 'locked' (secteur non atteint) | 'needs' (dépend d'une autre amélioration) | 'cap' (plafond actuel) | 'max' (niveau maximal) | 'poor' (composants insuffisants) | 'buy'
function rdView(meta, u, world){
  world = world || rdWorldReached();
  const L = rdLevel(meta, u.id), cap = rdCap(u, world), abs = rdAbsMax(u);
  const v = { u, level:L, cap, abs, from:u.from, total:L > 0 ? u.show(L) : 'aucun', next:null, price:null, state:'buy', nextWorld:null, need:null };
  if (world < u.from){ v.state = 'locked'; return v; }
  if (L >= abs){ v.state = 'max'; return v; }
  if (L >= cap){ v.state = 'cap'; v.nextWorld = world < RD_WORLD_MAX ? world + 1 : null; return v; }
  v.next = u.show(L + 1); v.price = rdPrice(u, L + 1);
  if (u.needs && rdLevel(meta, u.needs) < 1){ v.state = 'needs'; v.need = RD_BY_ID[u.needs]; return v; }
  if (meta.composants < v.price) v.state = 'poor';
  return v;
}

// { ok, reason } : reason = null | 'inconnu' | 'secteur' | 'dependance' | 'plafond' | 'max' | 'composants'
function rdCanBuy(meta, id, world){
  const u = RD_BY_ID[id]; if (!u) return { ok:false, reason:'inconnu' };
  const v = rdView(meta, u, world);
  if (v.state === 'locked') return { ok:false, reason:'secteur' };
  if (v.state === 'needs') return { ok:false, reason:'dependance' };
  if (v.state === 'cap') return { ok:false, reason:'plafond' };
  if (v.state === 'max') return { ok:false, reason:'max' };
  if (v.state === 'poor') return { ok:false, reason:'composants' };
  return { ok:true, reason:null };
}

// achète le niveau suivant : débite `meta`, renvoie true ; sinon false sans rien modifier
function rdBuy(meta, id, world){
  if (!rdCanBuy(meta, id, world).ok) return false;
  const u = RD_BY_ID[id], L = rdLevel(meta, id);
  meta.composants -= rdPrice(u, L + 1);
  if (!meta.niv) meta.niv = {};
  meta.niv[id] = L + 1;
  return true;
}

// coût cumulé déjà investi dans une amélioration au niveau L
function rdInvested(u, L){ let s = 0; for (let n = 1; n <= L; n++) s += rdPrice(u, n); return s; }

// vrai si au moins une amélioration de la liste est achetable maintenant (point doré des onglets)
function rdAnyBuyable(meta, list, world){ return (list || RD_UPGRADES).some(u=> rdCanBuy(meta, u.id, world).ok); }

// ajoute à `stats` (makeDefaultStats) l'effet de tous les niveaux achetés ; appelé UNE seule fois par partie (applyGlobalGear)
function rdApply(stats, meta){
  RD_UPGRADES.forEach(u=>{ const L = rdLevel(meta, u.id); if (L > 0) u.apply(stats, L); });
}
