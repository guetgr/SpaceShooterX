"use strict";
// Test sans navigateur : validateur du niveau (tools/editor/validator.js) avec les VRAIS registres (src/data/*).
//   node tools/editor_validator_test.js
// 1. les 16 niveaux : aucune erreur (avertissements permis, comptés)  2. documents invalides communs avec le serveur (tools/fixtures/invalid_levels.json)
// 3. une règle d'avertissement par test, sur des documents fabriqués  4. cohérence du drapeau `ordered` de TUNABLES avec les valeurs d'origine
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const { validateLevel } = require('./editor/validator.js');
const M = require('./editor/steps-model.js');

// ----- catalogues depuis les registres réels (même chargement que editor_steps_test.js) -----
const ev = { Phaser:{ Math:{ Between:(a)=> a, FloatBetween:(a)=> a } }, Math, ENEMY_CAP:1e9 }; vm.createContext(ev);
require('../src/data/wave-patterns.js');
vm.runInContext(read('data/events.js') + '\n' + read('data/event-params.js') + '\nthis.EVENT_DEFS = EVENT_DEFS; this.EVENT_PARAMS = EVENT_PARAMS;', ev);
const eventCatalog = Object.entries(ev.EVENT_DEFS).map(([id, e])=> ({ id, name:e.name, small:!!e.small, min:e.min, params:(ev.EVENT_PARAMS[id] || []).map(r=> ({ key:r.key, label:r.label, min:r.min, max:r.max, step:r.step, unit:r.unit, int:!!r.int, def:typeof r.def === 'function' ? r.def(1) : r.def, defByAlert:typeof r.def === 'function' })) }));
const bgSrc = read('world/bg-monde.js'), c1 = {}; vm.createContext(c1);
vm.runInContext(bgSrc.slice(bgSrc.indexOf('const WORLD_BG_KINDS'), bgSrc.indexOf('\n', bgSrc.indexOf('const WORLD_BG_KINDS'))) + '\nthis.K = WORLD_BG_KINDS;', c1);
const decorCatalog = Array.from(c1.K).map(kind=> ({ kind, label:kind }));
const mSrc = read('audio/music.js'), c2 = { MUSIC_LEN:{} }; vm.createContext(c2);
vm.runInContext(mSrc.slice(0, mSrc.indexOf('class FileMusic')) + '\nthis.T = { MUSIC_LEVEL, MUSIC_BOSS_KEYS };', c2);
const uniq = a => Array.from(new Set(a));
const musicCatalog = { level:uniq([].concat(...Object.values(c2.T.MUSIC_LEVEL).map(a=> Array.from(a)))), boss:Array.from(c2.T.MUSIC_BOSS_KEYS) };
const c3 = { BRAS:{ hp:40 }, PIL:{ hp:60 }, EC:{ hp:30 } }; vm.createContext(c3);
vm.runInContext(read('data/enemy-stats.js').split('// stats d\'un type fusionnées')[0] + '\nthis.ENEMY_STATS = ENEMY_STATS;', c3);
const mobCatalog = Object.keys(c3.ENEMY_STATS).map(type=> ({ type, label:type }));
const tSrc = read('data/tunables.js'), c4 = {}; vm.createContext(c4);
vm.runInContext(tSrc.slice(0, tSrc.indexOf('// Racines')) + '\nthis.TUNABLES = TUNABLES;', c4);
const tunablesCatalog = {};
Object.keys(c4.TUNABLES).forEach(id=> { tunablesCatalog[id] = c4.TUNABLES[id].map(r=> ({ path:r.path, label:r.label, min:r.min, max:r.max, len:r.len, ordered:r.ordered })); });
// types d'ennemis permis dans spawns / waves : même lecture que le serveur (bestiary.js)
const bestiary = uniq((read('data/bestiary.js').match(/type:'([^']+)'/g) || []).map(s=> s.slice(6, -1))).filter(t=> t !== 'meteor' && !t.startsWith('boss')).map(type=> ({ type }));
const cat = { eventCatalog, decorCatalog, musicCatalog, tunablesCatalog, mobCatalog, bestiary };

const clone = o => JSON.parse(JSON.stringify(o));
const docs = {};
fs.readdirSync(path.join(SRC, 'data/levels')).filter(f=> /^w\d-.*\.json$/.test(f)).forEach(f=> { const d = JSON.parse(fs.readFileSync(path.join(SRC, 'data/levels', f), 'utf8')); docs[d.id] = d; });
assert.strictEqual(Object.keys(docs).length, 42);

// 1. les niveaux réels
let nWarn = 0;
Object.keys(docs).forEach(id=> { const r = validateLevel(docs[id], cat); assert.deepStrictEqual(r.errors, [], id + ' : ' + r.errors.join(' | ')); nWarn += r.warnings.length; });

// 2. documents invalides communs avec le serveur
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/invalid_levels.json'), 'utf8')).cases;
fixtures.forEach(c=>{
  const doc = Object.assign(clone(docs[c.level]), clone(c.set)), r = validateLevel(doc, cat);
  if (c.expect === null) assert.deepStrictEqual(r.errors, [], c.id + ' devrait être valide : ' + r.errors.join(' | '));
  else assert.ok(r.errors.some(e=> e.indexOf(c.expect) >= 0), c.id + ' : « ' + c.expect + ' » attendu, obtenu : ' + JSON.stringify(r.errors));
});

// 3. avertissements (un test par règle ; positifs et négatifs)
const W = (id, set)=> validateLevel(Object.assign(clone(docs[id]), {norma:{},ambient:{golden:true,smallEvents:true}}, set), cat);
const has = (r, s)=> r.warnings.some(w=> w.indexOf(s) >= 0);
const L1 = 'w1-l1';            // survive 60 s, menace 1, boss final (meteo)
{ // alerte : crystal min 1 (ok), mines min 3 > menace 1
  assert.ok(!has(W(L1, { events:[{ kind:'crystal', at:10 }] }), 'prévu pour une alerte'));
  const r = W(L1, { events:[{ kind:'mines', at:10 }] }); assert.deepStrictEqual(r.errors, []); assert.ok(has(r, 'prévu pour une alerte 3'));
  assert.ok(!has(W(L1, { threat:3, events:[{ kind:'mines', at:10 }] }), 'prévu pour une alerte'));
}
{ // deux GRANDS événements seulement (level.js:28-30 : un emplacement par taille) ; petit+petit et petit+grand ne se gênent pas
  assert.ok(has(W(L1, { events:[{ kind:'crystal', at:10 }, { kind:'meteors', at:13 }] }), 'Grands événements'));                 // grand + grand
  assert.ok(!has(W(L1, { events:[{ kind:'crystal', at:10 }, { kind:'swarm', at:11 }] }), 'moins de 5 s'));                      // grand + petit
  assert.ok(!has(W(L1, { events:[{ kind:'swarm', at:10 }, { kind:'goldrush', at:11 }] }), 'moins de 5 s'));                     // petit + petit
  assert.ok(!has(W(L1, { events:[{ kind:'crystal', at:10 }, { kind:'meteors', at:30 }] }), 'attendra'));
  assert.ok(has(W(L1, { events:[{ kind:'crystal', at:10, duration:25 }, { kind:'meteors', at:30 }] }), 'attendra la fin'));
  assert.ok(!has(W(L1, { events:[{ kind:'crystal', at:10, duration:25 }, { kind:'swarm', at:30 }] }), 'attendra la fin'));
}
{ // après la fin de l'objectif (survive 60 s) ; kill : pas de règle
  assert.ok(has(W(L1, { events:[{ kind:'crystal', at:61 }] }), 'après la fin de l\'objectif'));
  assert.ok(!has(W(L1, { events:[{ kind:'crystal', at:59 }] }), 'après la fin de l\'objectif'));
  assert.ok(!has(W('w3-l2', { events:[{ kind:'crystal', at:900 }] }), 'après la fin de l\'objectif'));
  assert.ok(has(W(L1, { norma:{ messages:[{ id:'t', when:'time', at:100, text:'Trop tard' }] } }), 'Boîte N.O.R.M.A. « t »'));
  assert.ok(!has(W(L1, { norma:{ messages:[{ id:'t', when:'time', at:30, text:'Ok' }] } }), 'Boîte N.O.R.M.A. « t »'));
}
{ // boss sans texte N.O.R.M.A. de début de boss
  assert.ok(has(W(L1, {}), 'début du boss'));
  assert.ok(!has(W(L1, { norma:{ messages:[{ id:'b', when:'bossStart', text:'Incident majeur' }] } }), 'début du boss'));
  assert.ok(!has(W(L1, { norma:{ boss:['Incident majeur'] } }), 'début du boss'));
  assert.ok(!has(W('w2-l1', {}), 'début du boss'));
}
{ // valeurs extrêmes et PV effectifs
  assert.ok(has(W(L1, { mobs:{ grunt:{ hpMul:5 } } }), 'Valeur extrême : mobs.grunt.hpMul'));
  assert.ok(has(W(L1, { mobs:{ grunt:{ dmgMul:0.2 } } }), 'Valeur extrême : mobs.grunt.dmgMul'));
  assert.ok(!has(W(L1, { mobs:{ grunt:{ hpMul:2 } } }), 'Valeur extrême'));
  assert.ok(has(W(L1, { hpMul:3, mobs:{ grunt:{ hpMul:4 } } }), 'plus de 10 fois'));
  assert.ok(has(W(L1, { hpMul:6 }), 'Valeur extrême : hpMul'));
}
{ // réglage d'un petit événement jamais joué
  const off = { ambient:{ golden:true, smallEvents:false } };
  assert.ok(has(W(L1, Object.assign({ eventTune:{ swarm:{ perWave:12 } } }, off)), 'eventTune.swarm'));
  assert.ok(!has(W(L1, Object.assign({ eventTune:{ swarm:{ perWave:12 } }, events:[{ kind:'swarm', at:5 }] }, off)), 'eventTune.swarm'));
  assert.ok(!has(W(L1, { threat:3, eventTune:{ swarm:{ perWave:12 } } }), 'eventTune.swarm'));
  assert.ok(has(W(L1, { eventTune:{ elite:{} } }), 'eventTune.elite'));            // elite min 6 > menace 1 (petit événement)
  assert.ok(!has(W(L1, Object.assign({ eventTune:{ crystal:{ tickMs:300 } } }, off)), 'eventTune.crystal'));   // grand événement : jugé atteignable
}
{ // musique de boss sans boss final
  assert.ok(has(W('w2-l1', { audio:{ boss:musicCatalog.boss[0] } }), 'audio.boss est ignoré'));
  assert.ok(!has(W(L1, { audio:{ boss:musicCatalog.boss[0] } }), 'audio.boss est ignoré'));
}
// toast d'export : première erreur par niveau, 3 niveaux au plus
{
  const E = require('./editor/validator.js').exportRefusal, mk = (id, ...errors)=> ({ id, errors });
  assert.strictEqual(E([mk('a'), mk('b')]), '');
  assert.strictEqual(E([mk('w1-l2', 'Pool invalide', 'autre')]), 'Export refusé : w1-l2 : Pool invalide (détail dans le bandeau du niveau).');
  assert.strictEqual(E([mk('a', 'x'), mk('b'), mk('c', 'y')]), 'Export refusé : a : x ; c : y (détail dans le bandeau du niveau).');
  assert.strictEqual(E([mk('a', '1'), mk('b', '2'), mk('c', '3'), mk('d', '4'), mk('e', '5')]), 'Export refusé : a : 1 ; b : 2 ; c : 3 … et 2 autres (détail dans le bandeau du niveau).');
}
// erreurs : un document sans catalogue ne plante pas ; un document non objet est refusé
assert.deepStrictEqual(validateLevel(docs[L1], {}).errors, []);
assert.ok(validateLevel(null, cat).errors.length === 1);

// 4. drapeau `ordered` : posé sur chaque palier d'usure, valeurs d'origine (constantes des modules) conformes, même règle que le serveur dans le modèle des étapes
const ordered = []; Object.keys(tunablesCatalog).forEach(id=> tunablesCatalog[id].forEach(r=> { if (r.ordered) ordered.push(id + '.' + r.path); }));
assert.ok(['ar.thresh', 'mt.thresh', 'rx.thresh', 'an.thresh', 'pd.thresh', 'pd.mob.states', 'bras.states', 'pil.states', 'ec.states'].every(k=> ordered.indexOf(k) >= 0), 'paliers marqués : ' + ordered);
const ORIG = { thresh:[70, 45, 20], 'mob.states':[0.7, 0.4, 0.15], states:[0.75, 0.5, 0.25] };
const f = M.buildSteps(docs[L1], { eventCatalog, decorCatalog, musicCatalog, tunablesCatalog:Object.fromEntries(Object.entries(tunablesCatalog).map(([id, rows])=> [id, rows.map(r=> Object.assign({ def:r.len ? new Array(r.len).fill(r.min) : r.min }, r))])), mobCatalog, base:docs[L1] })
  .find(s=> s.id === 'boss').fields.find(x=> x.path.join('.') === 'bossTune.mt.thresh');
assert.ok(f && f.ordered === 'desc');
assert.throws(()=> M.applyFieldValue(docs[L1], f, [20, 45, 70]), /décroissantes/);
assert.doesNotThrow(()=> M.applyFieldValue(docs[L1], f, ORIG.thresh));
if (process.argv.includes('--warnings')) Object.keys(docs).forEach(id=> validateLevel(docs[id], cat).warnings.forEach(w=> console.log(id + ' : ' + w)));
console.log('OK : 16 niveaux sans erreur (' + nWarn + ' avertissements), ' + fixtures.length + ' documents communs avec le serveur, avertissements par règle, paliers ordonnés (' + ordered.length + ')');
