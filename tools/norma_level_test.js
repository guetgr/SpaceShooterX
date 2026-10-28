"use strict";
// Test sans navigateur : réactions de N.O.R.M.A. par niveau (data/level-norma.js + méthodes de ui/norma.js), avec des bouchons.
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const R = path.join(__dirname, '..', 'src');
const said = [], calls = [];
const ctx = { console, Math, Number, Array, Object, JSON, performance:{ now:()=> 1e6 }, setTimeout, clearTimeout, setInterval, clearInterval,
  document:{ getElementById:()=> null }, Phaser:{ Math:{ Between:(a, b)=>{ calls.push([a, b]); return a; } } }, GameScene:{}, gsap:{}, Motion:{}, sfx:{} };
let methods = {}; ctx.mixin = (t, m)=>{ Object.assign(methods, m); };
vm.createContext(ctx);
for (const f of ['data/agp-lore.js', 'data/level-norma.js', 'ui/norma.js']) vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8') + (f === 'ui/norma.js' ? '\nthis.Norma = Norma;' : '') + (f === 'data/level-norma.js' ? '\nthis.normaLines=normaLines;this.normaTickEvery=normaTickEvery;this.normaTutoLine=normaTutoLine;this.normaPlan=normaPlan;this.normaPlanDue=normaPlanDue;this.normaPlanTake=normaPlanTake;' : '') + (f === 'data/agp-lore.js' ? '\nthis.AGP_LINES=AGP_LINES;' : ''), ctx, { filename:f });
const { Norma, AGP_LINES, normaLines, normaTickEvery, normaTutoLine, normaPlan, normaPlanDue, normaPlanTake } = ctx;
Norma.say = (text, o)=> said.push({ text, o });

// (1) sans surcharge : exactement AGP_LINES, plan vide, intervalle d'origine
for (const pool of ['start', 'boss', 'progress', 'banter', 'lowhp', 'win', 'lose']){
  assert.strictEqual(normaLines(null, pool), AGP_LINES[pool]);
  assert.strictEqual(normaLines({}, pool), AGP_LINES[pool]);
  assert.strictEqual(normaLines({ norma:{ [pool]:[] } }, pool), AGP_LINES[pool]);
}
assert.deepStrictEqual(Array.from(normaTickEvery(null)), [40000, 55000]);
assert.deepStrictEqual(Array.from(normaTickEvery({ norma:{} })), [40000, 55000]);
const empty = normaPlan(null);
assert.strictEqual(empty.time.length, 0); assert.strictEqual(normaPlanDue(empty, 9999), null); assert.strictEqual(normaPlanTake(empty, 'win'), null);
assert.strictEqual(normaTutoLine(null, 'move'), AGP_LINES.tuto.move);
// pick sans lvDef : mêmes lignes, même ordre d'appel au hasard
{ const r = Math.random; let n = 0; Math.random = ()=>{ n++; return 0; }; Norma._last = {};
  assert.strictEqual(Norma.pick('start'), AGP_LINES.start[0]); assert.strictEqual(n, 1);
  Norma._last = {}; assert.strictEqual(Norma.pick('start', {}), AGP_LINES.start[0]); assert.strictEqual(n, 2); Math.random = r; }

// (2) avec surcharge
const lv = { norma:{ start:['A', 'B'], boss:['C'], progress:['p1', 'p2', 'p3'], banter:['  ', 'v'], win:['gagné'], tickEvery:[10, 20], tuto:{ move:'Avancez.', shoot:'  ' } } };
assert.deepStrictEqual(Array.from(normaLines(lv, 'start')), ['A', 'B']);
assert.deepStrictEqual(Array.from(normaLines(lv, 'banter')), ['v']);
assert.strictEqual(normaLines(lv, 'lowhp'), AGP_LINES.lowhp);
assert.deepStrictEqual(Array.from(normaTickEvery(lv)), [10000, 20000]);
assert.deepStrictEqual(Array.from(normaTickEvery({ norma:{ tickEvery:[30, 20] } })), [40000, 55000]);
Norma._last = {}; assert.strictEqual(Norma.pick('boss', lv), 'C'); assert.strictEqual(Norma.pick('boss', lv), 'C');
assert.strictEqual(normaTutoLine(lv, 'move'), 'Avancez.'); assert.strictEqual(normaTutoLine(lv, 'shoot'), AGP_LINES.tuto.shoot);
assert.strictEqual(Norma.report('win', 'B', lv), 'gagné');

// (3) plan : horaire trié, une fois chacun, ancres
const lv3 = { norma:{ messages:[
  { id:'t2', when:'time', at:30, text:'deux' }, { id:'t1', when:'time', at:10, text:'un', hold:true },
  { id:'s', when:'levelStart', text:'début' }, { id:'e1', when:'eventStart', ref:'meteors', text:'météores' }, { id:'e2', when:'eventStart', ref:'meteors', text:'météores bis' },
  { id:'f', when:'eventEnd', ref:'meteors', text:'fini' }, { id:'b', when:'bossStart', text:'boss' }, { id:'w', when:'win', text:'ok' }, { id:'l', when:'lose', text:'ko' },
  { id:'x', when:'time', at:5, text:'   ' }, { id:'y', when:'time', at:6, text:'' }, { id:'z', when:'bossPhase', text:'hors périmètre' } ] } };
const pl = normaPlan(lv3);
assert.deepStrictEqual(Array.from(pl.time.map(e=> e.id)), ['t1', 't2']);
assert.strictEqual(normaPlanDue(pl, 9), null);
let d = normaPlanDue(pl, 31); assert.strictEqual(d.id, 't1'); d.done = true;
d = normaPlanDue(pl, 31); assert.strictEqual(d.id, 't2'); d.done = true; assert.strictEqual(normaPlanDue(pl, 99), null);
assert.strictEqual(normaPlanTake(pl, 'levelStart').text, 'début'); assert.strictEqual(normaPlanTake(pl, 'levelStart'), null);
assert.strictEqual(normaPlanTake(pl, 'eventStart', 'meteors').id, 'e1'); assert.strictEqual(normaPlanTake(pl, 'eventStart', 'meteors').id, 'e2'); assert.strictEqual(normaPlanTake(pl, 'eventStart', 'meteors'), null);
assert.strictEqual(normaPlanTake(pl, 'eventStart', 'swarm'), null);
assert.strictEqual(normaPlanTake(pl, 'eventEnd', 'meteors').id, 'f');
assert.strictEqual(normaPlanTake(pl, 'bossStart').id, 'b'); assert.strictEqual(normaPlanTake(pl, 'win').id, 'w'); assert.strictEqual(normaPlanTake(pl, 'lose').id, 'l');
assert.strictEqual(normaPlanTake(pl, 'bossPhase'), null);

// glue : méthodes de GameScene
const sc = Object.assign({ tuto:false, lvDef:lv3, lvT:0, introActive:false, _normaCd:1e9, _normaMan:false, levelProgress:()=>({ frac:0 }) }, methods);
sc._normaPlan = normaPlan(lv3);
Norma._showing = false;
assert.strictEqual(sc.normaAnchor('eventStart', 'meteors', 'propre'), true);
assert.deepStrictEqual(Array.from([said.at(-1).text, said.at(-1).o.prio]), ['propre', true]);       // texte de l'occurrence prioritaire
assert.strictEqual(sc.normaAnchor('eventStart', 'meteors'), true); assert.strictEqual(said.at(-1).text, 'météores');
assert.strictEqual(sc.normaAnchor('eventEnd', 'swarm'), false);
assert.strictEqual(sc.normaAnchor('bossStart'), true); assert.strictEqual(sc.normaAnchor('bossStart'), false);
assert.strictEqual(sc.normaEndText('win'), 'ok'); assert.strictEqual(sc.normaEndText('win'), '');
// tuto : jamais
const tu = Object.assign({}, sc, { tuto:true }); said.length = 0; assert.strictEqual(tu.normaAnchor('bossStart'), false); assert.strictEqual(said.length, 0);
// normaTick : horaire, jamais en intro, un à la fois
said.length = 0; sc._normaPlan = normaPlan(lv3); sc.lvT = 11; sc.introActive = true; sc.normaTick(16); assert.strictEqual(said.length, 0);
sc.introActive = false; sc.normaTick(16); assert.deepStrictEqual(Array.from([said.length, said[0].text, said[0].o.hold]), [1, 'un', true]);
Norma._showing = true; sc.lvT = 40; sc.normaTick(16); assert.strictEqual(said.length, 1);           // la précédente est encore affichée
Norma._showing = false; sc.normaTick(16); assert.strictEqual(said.at(-1).text, 'deux'); sc.normaTick(16); assert.strictEqual(said.length, 2);
// normaTick : intervalle des vannes lu du JSON, sinon 40-55 s
sc._normaCd = 0; calls.length = 0; sc.lvDef = {}; sc._normaPlan = normaPlan({}); sc.normaTick(16); assert.deepStrictEqual(Array.from(calls[0]), [40000, 55000]);
sc._normaCd = 0; calls.length = 0; sc.lvDef = lv; sc.normaTick(16); assert.deepStrictEqual(Array.from(calls[0]), [10000, 20000]);
console.log('OK : normaLines identique sans surcharge, surcharges, plan horaire/ancres, textes vides ignorés, tuto épargné');
