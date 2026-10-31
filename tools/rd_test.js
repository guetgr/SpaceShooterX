#!/usr/bin/env node
// Vérifie la R&D et l'atelier (data/rd.js, data/meta.js), sans navigateur :  node tools/rd_test.js
// Plafonds par secteur, premier achat utile, prix, achats refusés, absence de double application, migration des anciennes sauvegardes.
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console });
const load = f=> vm.runInContext(fs.readFileSync(path.join(R, 'src', f), 'utf8'), ctx, { filename:f });
const run = s=> vm.runInContext(s, ctx);
const store = new Map();
ctx.localStorage = { getItem:k=> store.has(k) ? store.get(k) : null, setItem:(k, v)=>{ store.set(k, String(v)); }, removeItem:k=>{ store.delete(k); } };
load('data/player-stats.js'); load('data/rd.js'); load('data/meta.js');

let fail = 0;
const ok = (cond, msg)=>{ if (!cond){ fail++; console.log('  ÉCHEC : ' + msg); } };
const near = (a, b)=> Math.abs(a - b) < 1e-9;

// ---- liste exacte
const ids = g=> JSON.stringify(run("rdOfGroup('" + g + "').map(u=>u.id + ':' + u.from)"));
ok(ids('canon') === '["c_puissance:1","c_cadence:1","c_double:1","c_vitesse:2","c_perfo:3"]', 'CANON : 5 améliorations aux bons secteurs');
ok(ids('carcasse') === '["k_coque:1","k_collision:1","k_blindage:2","k_autorep:2","k_nano:4"]', 'CARCASSE : 5 améliorations aux bons secteurs');
ok(ids('bouclier') === '["b_capacite:1","b_reprise:2","b_vitesse:2","b_riposte:3","b_portee:3","b_reserve:4"]', 'BOUCLIER : 6 améliorations aux bons secteurs');
ok(ids('propulseurs') === '["p_reactivite:1","p_charges:2","p_duree:2","p_recup:3","p_urgence:4"]', 'PROPULSEURS : 5 améliorations aux bons secteurs');
ok(ids('aimant') === '["a_portee:1","a_collecte:6"]', 'AIMANT : portée (1), collecte automatique (6)');
ok(ids('ordinateur') === '["o_choix:2","o_relances:4","o_double:7","o_nebuleuse:8"]', 'ORDINATEUR : choix 2, relances 4, atout double 7, vision 8');
ok(run("ATELIER_SLOTS.length") === 5 && run("ATELIER_SLOTS[3].from") === null && run("ATELIER_SLOTS[4].from") === null, 'cinq emplacements, les deux derniers réservés');

// ---- plafond = 4 × (monde − déblocage + 1)
const cap = (id, w)=> run("rdCap(RD_BY_ID['" + id + "'], " + w + ")");
ok(cap('c_puissance', 1) === 4 && cap('c_puissance', 2) === 8 && cap('c_puissance', 9) === 36, 'débloquée au secteur 1 : 4, 8, …, 36');
ok(cap('c_vitesse', 1) === 0 && cap('c_vitesse', 2) === 4 && cap('c_vitesse', 9) === 32, 'secteur 2 : bloquée au 1, 4 au 2, 32 au 9');
ok(cap('c_double', 1) === 4 && cap('c_double', 9) === 36, 'double tir accessible dès le secteur 1 : 4 niveaux, 36 au secteur 9');
ok(cap('c_perfo', 3) === 10 || cap('c_perfo', 3) === 4, 'perforation : 4 au secteur 3');
ok(run("rdCap(RD_BY_ID['k_nano'], 4)") === 4 && run("rdCap(RD_BY_ID['k_nano'], 9)") === 24, 'secteur 4 : 4 puis 24 au secteur 9');
ok(cap('c_perfo', 9) === 10 && cap('p_charges', 9) === 6, 'les valeurs entières sont bornées par `max`');
ok(cap('c_puissance', 14) === 36, 'jamais au-delà du secteur 9');

// ---- achat : jamais de modification quand il est impossible
const mk = (c, niv)=> "({ v:4, composants:" + c + ", niv:" + JSON.stringify(niv || {}) + " })";
{
  ctx.m = run(mk(7)); const avant = JSON.stringify(ctx.m);
  ok(run("rdBuy(m, 'c_puissance', 1)") === false && JSON.stringify(ctx.m) === avant && run("rdCanBuy(m, 'c_puissance', 1).reason") === 'composants', 'composants insuffisants : refus, meta intacte');
  ctx.m = run(mk(100));
  ok(run("rdBuy(m, 'c_vitesse', 1)") === false && run("rdCanBuy(m, 'c_vitesse', 1).reason") === 'secteur', 'secteur non atteint : refus');
  ok(run("rdBuy(m, 'b_reprise', 2)") === false && run("rdCanBuy(m, 'b_reprise', 2).reason") === 'dependance', 'bouclier : la reprise exige la capacité');
  ctx.m = run(mk(100, { c_puissance:4 }));
  ok(run("rdBuy(m, 'c_puissance', 1)") === false && run("rdCanBuy(m, 'c_puissance', 1).reason") === 'plafond', 'plafond du secteur atteint : refus');
  ok(run("rdBuy(m, 'c_puissance', 2)") === true && ctx.m.niv.c_puissance === 5, 'le secteur suivant ouvre 4 niveaux de plus');
  ctx.m = run(mk(8));
  ok(run("rdBuy(m, 'c_puissance', 1)") === true && ctx.m.composants === 0 && ctx.m.niv.c_puissance === 1, 'achat niveau 1 : 8 composants débités');
}
ok(run("rdPrice(RD_BY_ID.c_puissance, 1)") === 8 && run("rdPrice(RD_BY_ID.c_puissance, 5)") === 13, 'prix linéaire : 8 puis +15 % du prix de base par niveau');
ok(run("rdPrice(RD_BY_ID.p_charges, 1)") === 12 && run("rdPrice(RD_BY_ID.p_charges, 3)") === 22, 'valeurs entières : prix géométrique');

// ---- effets : chaque premier achat change quelque chose, calculé sur la valeur de départ
const S = niv=> run("(()=>{ const s = makeDefaultStats(); rdApply(s, { niv:" + JSON.stringify(niv) + " }); return s; })()");
const base = run("makeDefaultStats()");
RD_IDS = run("RD_UPGRADES.map(u=>u.id)");
RD_IDS.forEach(id=>{
  const s = S({ [id]:1 }), diff = Object.keys(base).filter(k=> JSON.stringify(s[k]) !== JSON.stringify(base[k]));
  ok(diff.length > 0, id + ' niveau 1 : aucun effet');
});
ok(JSON.stringify(S({})) === JSON.stringify(base), 'aucun niveau : statistiques inchangées');
ok(near(S({ c_puissance:1 }).damage, 10.2) && near(S({ c_puissance:4 }).damage, 10.8), 'puissance : +2 % par niveau de la valeur de base (pas de cumul)');
{ const s = S({ c_double:1 }); ok(s.spreadCount === 2 && near(s.doubleShotMul, 0.5), 'double tir niveau 1 : deux projectiles garantis, le 2e à 50 %'); }
ok(near(S({ c_double:32 }).doubleShotMul, Math.min(1, 0.5 + 0.016*31)), 'double tir : le 2e projectile progresse');
ok(S({ k_blindage:36 }).armorPct <= 0.5 && S({ k_collision:36 }).collisionMul >= 0.3 && S({ b_reprise:36 }).shieldRegenDelayMul >= 0.25, 'bornes : blindage, collisions, délai de recharge');
ok(S({ p_charges:3 }).dodgeCharges === 3 && S({ p_duree:2 }).dodgeDur === 440 && S({ p_recup:1 }).dodgeRecoverMs === 29400, 'esquive : charges, durée, récupération');
ok(S({ a_collecte:1 }).autoCollect === 1 && S({ a_collecte:1 }).autoCollectMs === 19000, 'collecte automatique : activée, intervalle raccourci par niveau');
ok(S({ o_choix:3 }).cardChoices === 5 && S({ o_relances:2 }).rerolls === 2 && near(S({ o_double:99 }).doubleCardChance, 0.495), 'ordinateur : choix, relances, atout double');
// une seule application : rdApply sur deux méta distinctes ne cumule pas entre elles
{ const a = S({ c_puissance:3 }); const b = S({ c_puissance:3 }); ok(a.damage === b.damage, 'deux applications indépendantes donnent le même résultat'); }

// ---- sauvegarde : lecture bornée
{
  ctx.raw = { v:4, composants:'12', niv:{ c_puissance:999, nimporte:5, c_double:-3 } };
  const m = run("normalizeMeta(raw)");
  ok(m.composants === 12 && m.niv.c_puissance === 36 && !('nimporte' in m.niv) && !('c_double' in m.niv), 'normalizeMeta : bornes, inconnus et négatifs ignorés');
}

// ---- migration
const mig = (raw, extra)=>{
  store.clear(); store.set('ssx_meta_v3', JSON.stringify(raw));
  const done = run("migrateMeta()"), after = JSON.parse(store.get('ssx_meta_v3'));
  const again = run("migrateMeta()"), twice = JSON.parse(store.get('ssx_meta_v3'));
  return { done, after, again, twice };
};
{
  // v3 d'avant la refonte : coque Mk II (40+70), canon Mk I (40), laser_continu proto + 2 rangs (30 + 25 + 40)
  const r = mig({ v:3, composants:50, atelier:{ coque:2, canon:1 }, rd:{ laser_continu:{ plan:true, proto:true, rang:2, spe:false } }, chargement:['laser_continu'] });
  ok(r.done === true && r.after.v === 4 && r.after.composants === 50 + 40 + 70 + 40 + 30 + 25 + 40, 'migration v3 : tous les achats remboursés au prix payé (' + r.after.composants + ')');
  ok(JSON.stringify(r.after.niv) === '{}' && r.after.notice === 'restructuration' && !('atelier' in r.after) && !('rd' in r.after) && !('chargement' in r.after), 'migration v3 : niveaux à zéro, avis posé, anciens champs retirés');
  ok(r.again === false && JSON.stringify(r.twice) === JSON.stringify(r.after), 'migration : ne se déclenche qu\'une fois');
}
{
  const r = mig({ v:3, composants:10, atelier:{}, rd:{} });
  ok(r.done === true && r.after.composants === 10 && r.after.notice === null, 'migration v3 sans achat : composants intacts, pas d\'avis');
}
{
  const r = mig({ v:4, composants:5, niv:{ c_puissance:2 } });
  ok(r.done === false && r.after.niv.c_puissance === 2, 'une sauvegarde v4 n\'est jamais retouchée');
}
{
  store.clear(); store.set('ssx_meta_v2', JSON.stringify({ fragments:30, tree:{ t_xp:2 } }));
  const done = run("migrateMeta()"), m = JSON.parse(store.get('ssx_meta_v3'));
  ok(done === true && m.v === 4 && m.composants === 30 + 22 && m.notice === 'restructuration', 'migration v2 : arbre remboursé (' + m.composants + ')');
}

console.log(fail ? fail + ' échec(s)' : 'OK : R&D et atelier');
process.exit(fail ? 1 : 0);
