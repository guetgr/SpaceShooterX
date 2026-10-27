#!/usr/bin/env node
// Vérifie le catalogue des technologies et les règles de R&D (plans, prototypes, rangs, spécialisations), sans navigateur :  node tools/rd_test.js
// Charge les fichiers de src/ dans un contexte isolé, comme tools/atelier_test.js et tools/check_worlds.js.
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..');
const store = new Map();
const ctx = vm.createContext({ console });
ctx.localStorage = { getItem:k=> store.has(k) ? store.get(k) : null, setItem:(k, v)=>{ store.set(k, String(v)); }, removeItem:k=>{ store.delete(k); } };
const load = f=> vm.runInContext(fs.readFileSync(path.join(R, 'src', f), 'utf8'), ctx, { filename:f });
const run = s=> vm.runInContext(s, ctx);
const order = JSON.parse(fs.readFileSync(path.join(R, 'src/scripts.json'), 'utf8'));
['data/events.js', 'data/bosses.js', 'data/player-stats.js', 'data/atelier.js', 'data/techs.js', 'data/meta.js'].forEach(load);
order.filter(f=> f === 'data/worlds.js' || f.startsWith('data/worlds/') || f === 'data/world-progress.js').forEach(load);
load('data/skill-tree.js');

let fail = 0;
const ok = (cond, msg)=>{ if (!cond){ fail++; console.log('  ÉCHEC : ' + msg); } };

// ---- catalogue
const ids = run("TECHS.map(t=>t.id)");
ok(JSON.stringify(ids) === JSON.stringify(['laser_continu','laser_auto','missiles_guidage','bouclier_reactif','ricochets','drone','missiles_demolition','blindage_lourd','nano_reparation','benne','overdrive','canon_experimental','arc_electrique','champ_lent','pulsar','trou_noir','eclats','rapatriement']), '18 technologies, dans l\'ordre du catalogue');
ok(run("TECH_BY_ID.laser_continu.tag") === 'ARME', 'LASER CONTINU est une ARME');
ok(run("TECHS.filter(t=>t.tag==='ARME').map(t=>t.id).join()") === 'laser_continu,laser_auto,canon_experimental', 'trois armes');
ok(run("TECHS.filter(t=>t.tag==='RAMPE').map(t=>t.id).join()") === 'missiles_guidage,missiles_demolition', 'deux rampes de missiles');
ok(run("TECH_PLAN_LEVEL['w1-tuto']") === 'laser_continu' && run("Object.keys(TECH_PLAN_LEVEL).length") === 15, '15 ordres accordent un plan, le tuto donne le laser continu');
ok(run("TECHS.filter(t=>t.sector>=4).every(t=> !t.plan && !techAvailable(t))"), 'secteurs 4 et 5 : sans plan et indisponibles');
ok(run("TECHS.filter(t=>t.sector<=3).every(t=> techAvailable(t))"), 'secteurs 1 à 3 disponibles');
ok(run("TECHS.every(t=> typeof t.assemble === 'function' && t.upgrades.every(u=> typeof u.inc === 'function' && u.max >= 1))"), 'assemblage et incréments définis');
ok(run("TECHS.filter(t=> t.spe === null).map(t=>t.id).join()") === 'bouclier_reactif,ricochets,overdrive,champ_lent,pulsar,eclats', 'spécialisations à concevoir : spe nul');

// ---- équivalence avec l'ancien arbre : inc appelé l fois = ancien apply(stats, l)
const KEYS = "Object.keys(makeDefaultStats())";
const stats = ()=> run("makeDefaultStats()");
const close = (a, b)=> Object.keys(a).every(k=> typeof a[k] === 'number' ? Math.abs(a[k] - b[k]) < 1e-9 : a[k] === b[k]);
ctx.scene = {};
const incN = (tech, upId, n)=>{ const s = stats(); ctx.s = s; run("(()=>{ const u = TECH_BY_ID['" + tech + "'].upgrades.find(u=>u.id==='" + upId + "'); for (let i=0;i<" + n + ";i++) u.inc(s, scene); })()"); return s; };
const oldApply = (nodeId, l)=>{ const s = stats(); ctx.s = s; run("TREE_NODE_BY_ID['" + nodeId + "'].apply(s, " + l + ")"); return s; };
const eqUpgrade = (tech, upId, oldId, step)=>{                       // step : un rang ancien = `step` rangs nouveaux (t_chargemissiles : 2 rangs pour +1 missile)
  const max = run("TREE_NODE_BY_ID['" + oldId + "'].max");
  for (let l = 1; l <= max; l++){ if (step && l % step) continue; ok(close(incN(tech, upId, l / (step || 1)), oldApply(oldId, l)), tech + '.' + upId + ' = ' + oldId + ' au rang ' + l); }
};
const eqBase = (tech, upId, oldId)=>{                               // nœud ancien à rangs : l'assemblage est le rang 1, l'amélioration les rangs suivants
  ctx.s = stats(); run("TECH_BY_ID['" + tech + "'].assemble(s, scene)"); const base = ctx.s;
  ok(close(base, oldApply(oldId, 1)), tech + ' assemblage = ' + oldId + ' rang 1');
  const max = run("TREE_NODE_BY_ID['" + oldId + "'].max");
  for (let l = 2; l <= max; l++){ const s = JSON.parse(JSON.stringify(base)); ctx.s = s; run("(()=>{ const u = TECH_BY_ID['" + tech + "'].upgrades.find(u=>u.id==='" + upId + "'); for (let i=0;i<" + (l - 1) + ";i++) u.inc(s, scene); })()"); ok(close(s, oldApply(oldId, l)), tech + '.' + upId + ' = ' + oldId + ' au rang ' + l); }
};
const eqSpe = (tech, oldId)=>{ ctx.s = stats(); run("TECH_BY_ID['" + tech + "'].spe.apply(s, scene)"); ok(close(ctx.s, oldApply(oldId, 1)), tech + ' spécialisation = ' + oldId); };

eqUpgrade('laser_continu', 't_laser_c_portee', 't_laser_c_portee'); eqUpgrade('laser_continu', 't_laser_c_degats', 't_laser_c_degats');
eqUpgrade('laser_auto', 't_laser_a_verrou', 't_laser_a_verrou');
ok(close(incN('laser_auto', 't_laser_a_priorite', 1), oldApply('t_laser_a_priorite', 1)), 'laser_auto.t_laser_a_priorite = t_laser_a_priorite');
eqUpgrade('missiles_guidage', 't_chargemissiles', 't_chargemissiles', 2); eqUpgrade('missiles_guidage', 't_cadmissiles', 't_cadmissiles');
eqUpgrade('missiles_guidage', 't_missile_chercheur_multi', 't_missile_chercheur_multi'); eqUpgrade('missiles_guidage', 't_missile_chercheur_cad', 't_missile_chercheur_cad');
eqBase('bouclier_reactif', 't_reactif', 't_reactif'); eqUpgrade('bouclier_reactif', 't_phenix_bouclier', 't_phenix_bouclier');
eqBase('ricochets', 't_rebond', 't_rebond');
eqUpgrade('drone', 't_drone_cadence', 't_drone_cadence'); eqUpgrade('drone', 't_drone_degats', 't_drone_degats');
['t_explosion', 't_napalm', 't_perforantmissile', 't_missile_droit_charge', 't_missile_droit_vitesse'].forEach(id=> eqUpgrade('missiles_demolition', id, id));
ctx.s = stats(); run("TECH_BY_ID.blindage_lourd.assemble(s, scene)"); ok(close(ctx.s, oldApply('t_forteresse', 1)), 'blindage_lourd assemblage = t_forteresse');
eqUpgrade('blindage_lourd', 't_forteresse_resist', 't_forteresse_resist'); eqUpgrade('blindage_lourd', 't_forteresse_regen', 't_forteresse_regen');
eqUpgrade('nano_reparation', 't_sangsue_vol', 't_sangsue_vol'); eqUpgrade('nano_reparation', 't_sangsue_rayon', 't_sangsue_rayon');
eqUpgrade('nano_reparation', 't_regen', 't_regen'); eqUpgrade('nano_reparation', 't_voldevie', 't_voldevie');
['t_xp', 't_chance', 't_butindouble', 't_collecte', 't_cristauxvaleur', 't_coffre', 't_coffre_xp', 't_coffre_chance'].forEach(id=> eqUpgrade('benne', id, id));
eqBase('overdrive', 't_overdrive', 't_overdrive'); eqUpgrade('overdrive', 't_frolement', 't_frolement'); eqUpgrade('overdrive', 't_surchauffe', 't_surchauffe'); eqUpgrade('overdrive', 't_souffle', 't_souffle');
eqUpgrade('canon_experimental', 't_shotgun_plombs', 't_shotgun_plombs'); eqUpgrade('canon_experimental', 't_shotgun_recul', 't_shotgun_recul');
eqBase('arc_electrique', 't_foudre', 't_foudre'); eqBase('champ_lent', 't_champlent', 't_champlent'); eqBase('pulsar', 't_pulsar', 't_pulsar');
eqBase('trou_noir', 't_trounoir', 't_trounoir'); eqBase('eclats', 't_eclats', 't_eclats'); eqUpgrade('rapatriement', 't_phenix_esquive', 't_phenix_esquive');
eqSpe('blindage_lourd', 't_forteresse_cap'); eqSpe('nano_reparation', 't_sangsue_cap'); eqSpe('benne', 't_coffre_cap'); eqSpe('arc_electrique', 't_tonnerre'); eqSpe('trou_noir', 't_gravite');

// effets d'assemblage et indicateurs de spécialisation (sans équivalent chiffré dans l'ancien arbre)
const A = (tech)=>{ ctx.s = stats(); ctx.scene = {}; run("TECH_BY_ID['" + tech + "'].assemble(s, scene)"); return { s:ctx.s, scene:ctx.scene }; };
ok(A('laser_continu').s.weaponMode === 'laser' && A('laser_auto').s.weaponMode === 'laserAuto' && A('canon_experimental').s.weaponMode === 'shotgun', 'armes : weaponMode posé par l\'assemblage');
{ const a = A('missiles_guidage'); ok(a.s.missileCount === 1 && a.s.missileType === 'chercheur', 'missiles à guidage : 1 missile chercheur'); }
{ const a = A('missiles_demolition'); ok(a.s.missileCount === 1 && a.s.missileType === 'droit', 'missiles de démolition : 1 missile droit'); }
ok(A('drone').scene.droneOwned === true && A('nano_reparation').scene.sangsueOwned === true, 'drone et nano-réparation : indicateurs posés sur la scène');
ok(A('rapatriement').scene.phoenixOwned === true && A('rapatriement').scene.phoenixCharges === 1, 'rapatriement : une charge');
const speFlag = (tech, flag)=>{ ctx.s = stats(); ctx.scene = {}; run("TECH_BY_ID['" + tech + "'].spe.apply(s, scene)"); ok(ctx.scene[flag] === true, tech + ' : spécialisation pose ' + flag); };
speFlag('laser_continu', 'laserDestructeurOwned'); speFlag('laser_auto', 'reticuleOmniscientOwned'); speFlag('missiles_guidage', 'swarmMissilesOwned');
speFlag('missiles_demolition', 'nukeOwned'); speFlag('drone', 'droneSwarmOwned'); speFlag('canon_experimental', 'fragmentationOwned'); speFlag('rapatriement', 'doublePhoenixOwned');

// ---- règles de recherche
const META = (o)=> "Object.assign(defaultMeta(), " + JSON.stringify(o) + ")";
const can = (m, tech, what)=> JSON.stringify(run("rdCanBuy(" + m + ", '" + tech + "', '" + what + "')"));
ok(can(META({ composants:500 }), 'laser_continu', 'proto') === '{"ok":false,"reason":"plan"}', 'prototype sans plan : refusé (plan)');
ok(can(META({ composants:29, rd:{ laser_continu:{ plan:true } } }), 'laser_continu', 'proto') === '{"ok":false,"reason":"composants"}', 'prototype avec 29 ◆ : refusé (composants)');
ok(can(META({ composants:30, rd:{ laser_continu:{ plan:true } } }), 'laser_continu', 'proto') === '{"ok":true,"reason":null}', 'prototype avec plan et 30 ◆ : accepté');
{
  ctx.m = run(META({ composants:30, rd:{ laser_continu:{ plan:true } } }));
  ok(run("rdBuy(m, 'laser_continu', 'proto')") === true && ctx.m.composants === 0 && ctx.m.rd.laser_continu.proto === true, 'rdBuy proto : 30 ◆ débités, prototype posé');
}
ok(can(META({ composants:500, rd:{ laser_continu:{ plan:true } } }), 'laser_continu', 'rang') === '{"ok":false,"reason":"proto"}', 'rang sans prototype : refusé (proto)');
ok(can(META({ composants:500, rd:{ laser_continu:{ plan:true, proto:true } } }), 'laser_continu', 'spe') === '{"ok":false,"reason":"pieces"}', 'spécialisation sans pièces : refusée (pieces)');
ok(can(META({ composants:500, rd:{ bouclier_reactif:{ plan:true, proto:true } } }), 'bouclier_reactif', 'spe') === '{"ok":false,"reason":"conception"}', 'spécialisation à concevoir : refusée (conception)');
ok(can(META({ composants:500, rd:{ laser_continu:{ plan:true, proto:true, rang:9 } } }), 'laser_continu', 'rang') === '{"ok":false,"reason":"max"}', 'rang au maximum (4 + 5 = 9) : refusé (max)');
ok(can(META({ composants:9999, rd:{ trou_noir:{ plan:true, proto:true } } }), 'trou_noir', 'rang') === '{"ok":false,"reason":"secteur"}', 'secteur 4 : refusé (secteur)');
{
  ctx.m = run(META({ composants:30, rd:{ laser_continu:{ plan:false } } })); const avant = JSON.stringify(ctx.m);
  ok(run("rdBuy(m, 'laser_continu', 'proto')") === false && JSON.stringify(ctx.m) === avant, 'achat impossible : false et meta intacte');
  ok(run("rdBuy(m, 'zzz', 'proto')") === false && JSON.stringify(ctx.m) === avant, 'technologie inconnue : false et meta intacte');
}
{
  ctx.m = run(META({ composants:500, pieces:{ s1:2 }, rd:{ laser_continu:{ plan:true, proto:true } } }));
  ok(run("rdBuy(m, 'laser_continu', 'spe')") === true && ctx.m.rd.laser_continu.spe === true && ctx.m.pieces.s1 === 0 && ctx.m.composants === 350, 'spécialisation : 150 ◆ et 2 pièces S1 débités');
}
ok(JSON.stringify(run("rdNextCost('laser_continu', 'proto')")) === '{"composants":30,"pieces":null}', 'prix prototype S1 : 30');
ok(JSON.stringify(run("rdNextCost('drone', 'rang', 0)")) === '{"composants":38,"pieces":null}', 'prix 1er rang S2 : 25 x 1,5 arrondi = 38');
ok(JSON.stringify(run("rdNextCost('drone', 'spe')")) === '{"composants":250,"pieces":{"s2":3}}', 'prix spécialisation S2 : 250 ◆ + 3 pièces S2');
ok(run("rdNextCost('bouclier_reactif', 'spe')") === null, 'pas de prix pour une spécialisation à concevoir');
ok(run("rdUpgradeAt(TECH_BY_ID.laser_continu, 1).id") === 't_laser_c_portee' && run("rdUpgradeAt(TECH_BY_ID.laser_continu, 5).id") === 't_laser_c_degats' && run("rdUpgradeAt(TECH_BY_ID.laser_continu, 10)") === null, 'rdUpgradeAt : les rangs se consomment dans l\'ordre');
ok(run("rdEntry(Object.assign(defaultMeta(), { rd:{ laser_continu:{ rang:99, proto:1 } } }), 'laser_continu').rang") === 9, 'rdEntry borne le rang à la somme des maximums');

if (fail){ console.log('ÉCHEC : rd (' + fail + ')'); process.exit(1); }
console.log('OK : rd');
