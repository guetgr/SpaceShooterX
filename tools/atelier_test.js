#!/usr/bin/env node
// Vérifie les règles de l'atelier (postes, Mk I à V, coûts, achat), sans navigateur :  node tools/atelier_test.js
// Charge les fichiers de src/ dans un contexte isolé, comme tools/composants_test.js et tools/check_worlds.js.
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console });
const load = f=> vm.runInContext(fs.readFileSync(path.join(R, 'src', f), 'utf8'), ctx, { filename:f });
const run = s=> vm.runInContext(s, ctx);
load('data/player-stats.js');
load('data/atelier.js');
load('data/techs.js');
// sauvegarde simulée : localStorage adossé à une Map, partagé avec le contexte
const store = new Map();
ctx.localStorage = { getItem:k=> store.has(k) ? store.get(k) : null, setItem:(k, v)=>{ store.set(k, String(v)); }, removeItem:k=>{ store.delete(k); } };
load('data/meta.js');

let fail = 0;
const ok = (cond, msg)=>{ if (!cond){ fail++; console.log('  ÉCHEC : ' + msg); } };
const near = (a, b)=> Math.abs(a - b) < 1e-9;

// ---- les six postes
ok(JSON.stringify(run("ATELIER_POSTS.map(p=>p.id)")) === '["coque","canon","bouclier","propulseurs","aimant","ordinateur"]', 'six postes dans l\'ordre du design');
ok(run("ATELIER_POSTS.every(p=> p.mk.length === 5)"), 'chaque poste a cinq niveaux Mk');

// ---- effets sur les statistiques de départ
const S = a=> run("(()=>{ const s = makeDefaultStats(); atelierApply(s, " + JSON.stringify(a) + "); return s; })()");
ok(S({coque:1}).maxHp === 140, 'coque Mk I : 100 -> 140 PV');
{ const s = S({coque:5}); ok(s.maxHp === 360 && near(s.armorPct, 0.16) && near(s.collisionMul, 0.6), 'coque Mk V : 360 PV, -16 % dégâts, collisions x0,6'); }
{ const s = S({canon:5}); ok(near(s.damage, 20) && near(s.fireRate, 340*0.75) && near(s.critChance, 0.15), 'canon Mk V : dégâts x2, cadence x0,75, critique 15 %'); }
{ const s = S({propulseurs:4}); ok(s.dodgeCharges === 2 && s.secondSouffle === 1, 'propulseurs Mk IV : 2 esquives et le second souffle'); }
{ const s = S({ordinateur:5}); ok(s.cardChoices === 5 && s.rerolls === 2, 'ordinateur Mk V : 5 cartes, 2 relances'); }
ok(JSON.stringify(S({})) === JSON.stringify(run("makeDefaultStats()")), 'atelier vide : statistiques inchangées');

// ---- lignes « avant -> après » du garage
ok(JSON.stringify(run("atelierShows('coque', 1)[0]")) === '{"label":"PV MAX","value":"140"}', 'atelierShows : coque Mk I -> PV MAX 140');
ok(run("atelierShows('coque', 0)[0].value") === '100', 'atelierShows : Mk 0 = camionnette de base');

// ---- coûts
const C = (id, mk)=> JSON.stringify(run("atelierNextCost('" + id + "'," + mk + ")"));
ok(C('coque', 0) === '{"composants":40,"pieces":null}', 'Mk I : 40 composants');
ok(C('coque', 2) === '{"composants":120,"pieces":{"s1":2}}', 'Mk III : 120 composants + 2 pièces du secteur 1');
ok(C('aimant', 4) === '{"composants":340,"pieces":{"s3":4}}', 'Mk V : 340 composants + 4 pièces du secteur 3');
ok(run("atelierNextCost('coque', 5)") === null, 'rien après Mk V');

// ---- achat : jamais de modification quand il est impossible
const M = (c, p, a)=> "({ composants:" + c + ", pieces:{s1:" + (p.s1||0) + ",s2:" + (p.s2||0) + ",s3:" + (p.s3||0) + ",s4:0,s5:0}, atelier:" + JSON.stringify(a) + " })";
{
  ctx.m = run(M(39, {}, {coque:0})); const avant = JSON.stringify(ctx.m);
  ok(run("atelierBuy(m, 'coque')") === false && JSON.stringify(ctx.m) === avant, 'composants insuffisants : refus, meta intacte');
  ok(run("atelierCanBuy(m, 'coque').reason") === 'composants', 'raison : composants');
}
{
  ctx.m = run(M(40, {}, {coque:0}));
  ok(run("atelierBuy(m, 'coque')") === true && ctx.m.composants === 0 && ctx.m.atelier.coque === 1, 'achat Mk I : 40 composants débités, Mk 1');
}
{
  ctx.m = run(M(500, {s1:1}, {coque:2})); const avant = JSON.stringify(ctx.m);
  ok(run("atelierBuy(m, 'coque')") === false && JSON.stringify(ctx.m) === avant && run("atelierCanBuy(m, 'coque').reason") === 'pieces', 'Mk III sans assez de pièces : refus, raison pièces');
  ctx.m = run(M(500, {s1:2}, {coque:2}));
  ok(run("atelierBuy(m, 'coque')") === true && ctx.m.pieces.s1 === 0 && ctx.m.composants === 380 && ctx.m.atelier.coque === 3, 'Mk III avec 2 pièces : débit des composants et des pièces');
}
{
  ctx.m = run(M(9999, {s1:9,s2:9,s3:9}, {coque:5})); const avant = JSON.stringify(ctx.m);
  ok(run("atelierBuy(m, 'coque')") === false && JSON.stringify(ctx.m) === avant && run("atelierCanBuy(m, 'coque').reason") === 'max', 'poste au Mk V : refus, raison max');
}

// ---- Mk lu dans une sauvegarde abîmée
ok(run("atelierMk({coque:-3}, 'coque')") === 0, 'Mk négatif -> 0');
ok(run("atelierMk({coque:99}, 'coque')") === 5, 'Mk trop grand -> 5');
ok(run("atelierMk({coque:NaN}, 'coque')") === 0, 'Mk NaN -> 0');
ok(run("atelierMk(undefined, 'coque')") === 0, 'atelier absent -> 0');

// ---- sauvegarde v3
const DEFAULT_V3 = '{"v":3,"composants":0,"pieces":{"s1":0,"s2":0,"s3":0,"s4":0,"s5":0},"atelier":{"coque":0,"canon":0,"bouclier":0,"propulseurs":0,"aimant":0,"ordinateur":0},"rd":{},"chargement":[],"notice":null}';
ok(JSON.stringify(run("defaultMeta()")) === DEFAULT_V3, 'defaultMeta : forme de la v3');
ok(JSON.stringify(run("normalizeMeta({})")) === DEFAULT_V3, 'normalizeMeta({}) = defaultMeta()');
{
  const m = run("normalizeMeta({composants:'12', atelier:{coque:-2, canon:9, aimant:NaN, inconnu:3}, pieces:{s1:-1, zz:4}})");
  ok(m.composants === 12 && m.atelier.coque === 0 && m.atelier.canon === 5 && m.atelier.aimant === 0 && !('inconnu' in m.atelier), 'sauvegarde abîmée : Mk bornés, clés inconnues ignorées');
  ok(m.pieces.s1 === 0 && !('zz' in m.pieces) && !('tree' in m), 'sauvegarde abîmée : pièces nettoyées, plus d\'arbre');
}
store.clear(); store.set('ssx_meta_v3', '{not json');
ok(JSON.stringify(run("getMeta()")) === DEFAULT_V3, 'v3 illisible : défauts, sans exception');
store.clear();
ok(JSON.stringify(run("getMeta()")) === DEFAULT_V3, 'aucune sauvegarde : défauts');

// ---- statistiques de départ : l'atelier seul (les technologies s'assemblent en mission)
{
  const s = run("(()=>{ const s = makeDefaultStats(); applyGlobalGear(s, { atelier:{ coque:1 } }); return s; })()");
  ok(s.maxHp === 140 && s.bulletSpeed === 520, 'applyGlobalGear : coque Mk I appliquée');
}
ok(run("effectiveAlert(defaultMeta())") === 1, 'alerte de départ : 1, sans ascension');

// ---- import d'un code de sauvegarde (CloudSave.importCode) : un ancien code (v2 seule) doit être relu par la migration
{
  class Storage { constructor(){ this.m = new Map(); } getItem(k){ return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v){ this.m.set(k, String(v)); } removeItem(k){ this.m.delete(k); } }
  const c2 = vm.createContext({ console, Storage, btoa, atob, unescape, escape, encodeURIComponent, decodeURIComponent, window:{} });
  c2.localStorage = new Storage();
  vm.runInContext(fs.readFileSync(path.join(R, 'src', 'core', 'cloud-save.js'), 'utf8'), c2, { filename:'core/cloud-save.js' });
  const code = keys=> 'SSX1:' + Buffer.from(unescape(encodeURIComponent(JSON.stringify(keys))), 'binary').toString('base64');
  c2.localStorage.setItem('ssx_meta_v3', JSON.stringify({ v:3, composants:500 }));
  c2.code = code({ ssx_meta_v2: JSON.stringify({ fragments:7, tree:{} }) });
  ok(vm.runInContext("CloudSave.importCode(code)", c2) === true, 'importCode accepte un code v2 seule');
  ok(c2.localStorage.getItem('ssx_meta_v3') === null && c2.localStorage.getItem('ssx_meta_v2') !== null, 'code v2 seule : la v3 locale est retirée, la migration relira la v2 importée');
  c2.localStorage.setItem('ssx_meta_v3', JSON.stringify({ v:3, composants:500 }));
  c2.code = code({ ssx_meta_v3: JSON.stringify({ v:3, composants:42 }) });
  ok(vm.runInContext("CloudSave.importCode(code)", c2) === true && JSON.parse(c2.localStorage.getItem('ssx_meta_v3')).composants === 42, 'code v3 : la v3 importée remplace la locale');
}

if (fail){ console.log('ÉCHEC : atelier (' + fail + ')'); process.exit(1); }
console.log('OK : atelier');
