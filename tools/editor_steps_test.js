"use strict";
// Test sans navigateur : modèle des étapes de l'éditeur (tools/editor/steps-model.js), catalogues construits depuis les VRAIS registres (src/data/*).
//   node tools/editor_steps_test.js
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const M = require('./editor/steps-model.js');

/* ---------- catalogues depuis les registres réels ---------- */
// événements : events.js + event-params.js (même chargement que tools/event_params_node_test.js)
const ev = { Phaser:{ Math:{ Between:(a)=> a, FloatBetween:(a)=> a } }, Math, ENEMY_CAP:1e9 }; vm.createContext(ev);
vm.runInContext(read('data/events.js') + '\n' + read('data/event-params.js') + '\nthis.EVENT_DEFS = EVENT_DEFS; this.EVENT_PARAMS = EVENT_PARAMS;', ev);
const eventCatalog = Object.entries(ev.EVENT_DEFS).map(([id, e])=> ({ id, name:e.name, small:!!e.small, min:e.min, params:(ev.EVENT_PARAMS[id] || []).map(r=> ({ key:r.key, label:r.label, min:r.min, max:r.max, step:r.step, unit:r.unit, int:!!r.int, def:typeof r.def === 'function' ? r.def(1) : r.def, defByAlert:typeof r.def === 'function' })) }));
// décors et musiques
const bgSrc = read('world/bg-monde.js'), c1 = {}; vm.createContext(c1);
vm.runInContext(bgSrc.slice(bgSrc.indexOf('const WORLD_BG_KINDS'), bgSrc.indexOf('\n', bgSrc.indexOf('const WORLD_BG_KINDS'))) + '\nthis.K = WORLD_BG_KINDS;', c1);
const decorCatalog = Array.from(c1.K).map(kind=> ({ kind, label:kind }));
const mSrc = read('audio/music.js'), c2 = { MUSIC_LEN:{} }; vm.createContext(c2);
vm.runInContext(mSrc.slice(0, mSrc.indexOf('class FileMusic')) + '\nthis.T = { MUSIC_LEVEL, MUSIC_BOSS_KEYS };', c2);
const uniq = a => Array.from(new Set(a));
const musicCatalog = { level:uniq([].concat(...Object.values(c2.T.MUSIC_LEVEL).map(a=> Array.from(a)))), boss:Array.from(c2.T.MUSIC_BOSS_KEYS) };
// stats des ennemis (PV de BRAS / PIL / EC : bouchons)
const c3 = { BRAS:{ hp:40 }, PIL:{ hp:60 }, EC:{ hp:30 } }; vm.createContext(c3);
vm.runInContext(read('data/enemy-stats.js').split('// stats d\'un type fusionnées')[0] + '\nthis.ENEMY_STATS = ENEMY_STATS;', c3);
const mobCatalog = Object.keys(c3.ENEMY_STATS).map(type=>{ const st = Object.assign({}, c3.ENEMY_STATS[type]); return { type, label:type, hp:st.hp, dmg:st.dmg, score:st.score, speed:st.vyBetween ? st.vyBetween[0] : st.vy }; });
// réglages des boss : seule la table TUNABLES est lue ; valeur d'origine bouchonnée (la vraie est vérifiée par tunables_test.py)
const tSrc = read('data/tunables.js'), c4 = {}; vm.createContext(c4);
vm.runInContext(tSrc.slice(0, tSrc.indexOf('// Racines')) + '\nthis.TUNABLES = TUNABLES;', c4);
const tunablesCatalog = {};
Object.keys(c4.TUNABLES).forEach(id=> { tunablesCatalog[id] = c4.TUNABLES[id].map(r=> ({ path:r.path, label:r.label, min:r.min, max:r.max, step:r.step, unit:r.unit, help:r.help, len:r.len, def:r.len ? new Array(r.len).fill(r.min) : r.min })); });

const files = fs.readdirSync(path.join(SRC, 'data/levels')).filter(f=> /^w\d-.*\.json$/.test(f));
assert.strictEqual(files.length, 16, '16 niveaux attendus');
const docs = {}; files.forEach(f=> { const d = JSON.parse(fs.readFileSync(path.join(SRC, 'data/levels', f), 'utf8')); docs[d.id] = d; });
const cats = doc=> ({ eventCatalog, decorCatalog, musicCatalog, tunablesCatalog, mobCatalog, base:doc });
const clone = o => JSON.parse(JSON.stringify(o));

// (a) textes du tuto identiques aux anciens (copiés de level-document.js, calculés avec les valeurs de w1-tuto.json)
{
  const doc = docs['w1-tuto'], steps = M.buildSteps(doc, cats(doc));
  const EXPECT = [
    ['INTRO / CAMERA', 'Décollage court · fond horizon · zoom 1.35 → 1.00 en 90 s (temps de partie).'],
    ['ETAPE 1 · BOUGER', 'N.O.R.M.A. « bouger » → 420 px parcourus OU 30 s maximum.'],
    ['ETAPE 2 · SATELLITE', 'Après BOUGER : premier satellite lent (30 PV, 55 px/s), puis cadence 1500 → 650 ms, plafond 3 + 3.'],
    ['DESTRUCTION SATELLITE', 'Chaque satellite détruit produit 5–8 débris, 7 dégâts. Objectif : 12 satellites OU 90 s maximum.'],
    ['ALERTE / ANTENNE-MERE', 'Après TIRER : N.O.R.M.A. + alarme, attente 3.6 s, puis boss à 700 PV.'],
    ['BOSS · PHASE 1', 'Tirs visés chaque 1500 ms ; anneau chaque 4200 ms. N.O.R.M.A. explique les premières attaques.'],
    ['BOSS · PHASE 2', 'Sous 66 % PV : pluie chaque 1700 ms + tirs et anneaux.'],
    ['BOSS · PHASE 3', 'Sous 33 % PV : spirale chaque 140 ms, tir visé 1100 ms.'],
    ['RAPPORT', 'Boss détruit → fin du tutoriel, finition et récompenses de paliers. Paramètres détaillés ci-dessous et dans le JSON.'],
  ];
  EXPECT.forEach(([title, text])=> { const s = steps.find(x=> x.title === title); assert.ok(s, 'étape manquante ' + title); assert.strictEqual(s.text, text, title); });
  const ids = steps.map(s=> s.title).filter(t=> EXPECT.some(e=> e[0] === t));
  assert.deepStrictEqual(ids, EXPECT.map(e=> e[0]), 'ordre des étapes du tuto');
  const d2 = clone(doc); d2.timelineOnly = 1;
  assert.strictEqual(M.buildSteps(d2, cats(d2)).find(s=> s.id === 'sat').text, 'Vagues manuelles actives ; apparitions pédagogiques automatiques désactivées.');
  // tous les réglages de TUTO_SCHEMA rattachés exactement une fois, avec les métadonnées du schéma
  const all = []; steps.forEach(s=> s.fields.forEach(f=> { if (f.path[0] === 'tutorial') all.push(f.path.slice(1).join('.')); }));
  const want = []; M.TUTO_SCHEMA.forEach(g=> g.f.forEach(f=> want.push(g.k + '.' + f[0])));
  assert.deepStrictEqual(all.slice().sort(), uniq(want).sort(), 'TUTO_SCHEMA : chaque réglage une fois');
  assert.strictEqual(all.length, uniq(want).length);
  const hp = steps.find(s=> s.id === 'alert').fields.find(f=> f.path.join('.') === 'tutorial.boss.hp');
  assert.deepStrictEqual([hp.min, hp.max, hp.step, hp.def], [100, 4000, 10, 700]);
}

// (b) ordre fixe, chemins lisibles, défauts dans les bornes, pas de doublon
const ORDER = ['intro', 'objective', 'mobs', 'event-*', 'ambient', 'boss', 'norma', 'report'];
const TUTO_ORDER = ['intro', 'move', 'sat', 'destroy', 'alert', 'phase1', 'phase2', 'phase3', 'event-*', 'ambient', 'norma', 'report'];
let nFields = 0;
for (const id of Object.keys(docs)){
  const doc = docs[id], steps = M.buildSteps(doc, cats(doc));
  const got = []; steps.forEach(s=> { const k = s.id.startsWith('event-') ? 'event-*' : s.id; if (got[got.length - 1] !== k) got.push(k); });
  assert.deepStrictEqual(got, doc.tuto ? TUTO_ORDER.filter(x=> x !== 'event-*' || doc.events.length) : ORDER.filter(x=> x !== 'event-*' || doc.events.length), id + ' : ordre des étapes');
  assert.strictEqual(steps.filter(s=> s.id.startsWith('event-')).length, doc.events.length, id + ' : une étape par événement');
  const seen = new Set();
  steps.forEach(s=>{
    assert.ok(s.title && typeof s.text === 'string' && s.text, id + '/' + s.id + ' : titre et texte');
    s.fields.forEach(f=>{
      const k = JSON.stringify(f.path); nFields++;
      assert.ok(!seen.has(k), id + ' : chemin en double ' + k); seen.add(k);
      assert.doesNotThrow(()=> M.getByPath(doc, f.path), id + ' ' + k);
      assert.ok(f.label && ['number', 'numlist', 'select', 'text', 'textlist', 'bool', 'objlist'].includes(f.kind), id + ' ' + k + ' : genre');
      if (!f.optional) assert.notStrictEqual(M.getByPath(doc, f.path), undefined, id + ' ' + k + ' : champ obligatoire absent du document');
      if (f.kind === 'number'){ assert.ok(typeof f.def === 'number' && f.def >= f.min && f.def <= f.max, id + ' ' + k + ' : défaut ' + f.def + ' hors [' + f.min + ',' + f.max + ']'); const v = M.getByPath(doc, f.path); if (v !== undefined) assert.ok(v >= f.min && v <= f.max, id + ' ' + k + ' : valeur ' + v + ' hors bornes'); }
      if (f.kind === 'numlist'){ assert.strictEqual(f.def.length, f.len, k); f.def.forEach(x=> assert.ok(x >= f.min && x <= f.max, id + ' ' + k)); }
      if (f.kind === 'select'){ const v = M.getByPath(doc, f.path); assert.ok(f.options.some(o=> o.value === f.def), id + ' ' + k + ' : défaut absent des choix'); if (v !== undefined) assert.ok(f.options.some(o=> o.value === v), id + ' ' + k + ' : valeur du document absente des choix'); }
    });
  });
}

// mobs : un sous-bloc par type du tirage
{ const doc = docs['w1-l4'], mobs = M.buildSteps(doc, cats(doc)).find(s=> s.id === 'mobs'), types = uniq(doc.spawns.map(s=> s.type));
  assert.strictEqual(mobs.fields.length, types.length * 4);
  types.forEach(t=> { const g = mobs.fields.filter(f=> f.path[1] === t); assert.deepStrictEqual(g.map(f=> f.path[2]), ['hpMul', 'dmgMul', 'speedMul', 'scoreMul']); g.forEach(f=> assert.deepStrictEqual([f.min, f.max, f.def, f.optional], [0.1, 10, 1, true])); });
  assert.ok(M.buildSteps(docs['w1-tuto'], cats(docs['w1-tuto'])).every(s=> s.id !== 'mobs')); }

// (d) boss : chaque finalBoss utilisé a son id TUNABLES ; les champs du boss viennent du registre
{ const used = uniq(Object.values(docs).map(d=> d.finalBoss).filter(Boolean));
  assert.deepStrictEqual(used.slice().sort(), ['anneau', 'araignee', 'meteo', 'pdg', 'reacteur']);
  used.forEach(b=> { const tid = M.BOSS_TUNE_ID[b]; assert.ok(tid && tunablesCatalog[tid], 'finalBoss ' + b + ' sans id TUNABLES'); const d = docs[Object.keys(docs).find(k=> docs[k].finalBoss === b)], step = M.buildSteps(d, cats(d)).find(s=> s.id === 'boss');
    assert.strictEqual(step.fields.filter(f=> f.path[1] === tid).length, tunablesCatalog[tid].length, b);
    const arr = step.fields.find(f=> f.kind === 'numlist'); assert.ok(arr && arr.len >= 2); });
  const l4 = docs['w1-l4'], ids = M.bossIds(l4); assert.ok(['an', 'ec', 'bras', 'pil'].every(i=> ids.includes(i)), 'w1-l4 : ' + ids);
  assert.deepStrictEqual(M.bossIds(docs['w2-l1']), []);
  // un id par mob spécial présent dans les spawns, même sans boss
  assert.ok(M.bossIds({ spawns:[{ type:'pilleur' }], waves:[{ type:'bras' }] }).join() === 'pil,bras'); }

// (e) événements : chaque événement reçoit ses paramètres du catalogue (par nature) + norma.start/end + at/duration
{ let n = 0;
  for (const id of Object.keys(docs)){
    const doc = docs[id], steps = M.buildSteps(doc, cats(doc));
    doc.events.forEach((e, i)=>{
      const s = steps.find(x=> x.id === 'event-' + i), params = eventCatalog.find(x=> x.id === e.kind).params; assert.ok(params.length, e.kind);
      assert.ok(s.title.includes(eventCatalog.find(x=> x.id === e.kind).name));
      assert.deepStrictEqual(s.fields.filter(f=> f.path[2] === 'params').map(f=> f.path[3]), Array.from(params, p=> p.key), id + ' événement ' + i);
      assert.deepStrictEqual(s.fields.slice(0, 2).map(f=> f.path[2]), ['at', 'duration']);
      assert.deepStrictEqual(s.fields.filter(f=> f.path[2] === 'norma').map(f=> f.path[3]), ['start', 'end']);
      n++;
    });
  }
  assert.ok(n >= 10, 'événements couverts : ' + n);
  // tous les événements du catalogue ont des paramètres, et les petits sont proposés dans « aléatoires »
  const amb = M.buildSteps(docs['w2-l1'], cats(docs['w2-l1'])).find(s=> s.id === 'ambient');
  eventCatalog.filter(e=> e.small && e.params.length).forEach(e=> assert.strictEqual(amb.fields.filter(f=> f.path[0] === 'eventTune' && f.path[1] === e.id).length, e.params.length, e.id));
  assert.ok(amb.fields.some(f=> f.defByAlert)); }

// N.O.R.M.A. : réserves, intervalle, boîtes ; tuto : consignes
{ const s = M.buildSteps(docs['w1-l2'], cats(docs['w1-l2'])).find(x=> x.id === 'norma');
  assert.deepStrictEqual(s.fields.map(f=> f.path.join('.')), ['norma.start', 'norma.boss', 'norma.progress', 'norma.banter', 'norma.lowhp', 'norma.win', 'norma.lose', 'norma.tickEvery', 'norma.messages']);
  const box = s.fields.at(-1); assert.deepStrictEqual(box.item.map(i=> i.key), ['id', 'when', 'at', 'ref', 'text']);
  const t = M.buildSteps(docs['w1-tuto'], cats(docs['w1-tuto'])).find(x=> x.id === 'norma'); assert.ok(t.fields.some(f=> f.path.join('.') === 'norma.tuto.move')); }
// intro / caméra : décor et musiques
{ const s = M.buildSteps(docs['w1-l2'], cats(docs['w1-l2'])).find(x=> x.id === 'intro');
  assert.deepStrictEqual(s.fields.map(f=> f.path.join('.')), ['intro', 'zoom.start', 'zoom.end', 'zoom.seconds', 'bg', 'audio.level', 'audio.boss']);
  assert.ok(s.fields.find(f=> f.path[0] === 'bg').options.length === decorCatalog.length + 1);
  assert.ok(s.fields.find(f=> f.path.join('.') === 'audio.boss').options.length > 1); }

// (c) applyFieldValue : aller-retour, retour au défaut, conteneurs vides, validation
{ const doc = docs['w1-l2'], steps = M.buildSteps(doc, cats(doc)), F = p=> steps.flatMap(s=> s.fields).find(f=> f.path.join('.') === p);
  const before = JSON.stringify(doc);
  // champ obligatoire : écrit, jamais effacé
  let d = M.applyFieldValue(doc, F('goal.seconds'), 90); assert.strictEqual(d.goal.seconds, 90); assert.strictEqual(JSON.stringify(doc), before, 'le document source ne change pas');
  d = M.applyFieldValue(d, F('goal.seconds'), 75); assert.strictEqual(d.goal.seconds, 75); assert.strictEqual(JSON.stringify(d), before);
  // facultatif : créé, puis la valeur par défaut supprime clé ET conteneurs vides
  const mob = F('mobs.sat.hpMul'); assert.ok(mob);
  d = M.applyFieldValue(doc, mob, 2); assert.strictEqual(M.getByPath(d, mob.path), 2); assert.deepStrictEqual(d.mobs, { sat:{ hpMul:2 } });
  d = M.applyFieldValue(d, F('mobs.sat.dmgMul'), 1.5); assert.deepStrictEqual(d.mobs.sat, { hpMul:2, dmgMul:1.5 });
  d = M.applyFieldValue(d, mob, 1); assert.deepStrictEqual(d.mobs, { sat:{ dmgMul:1.5 } });
  d = M.applyFieldValue(d, F('mobs.sat.dmgMul'), 1); assert.ok(!('mobs' in d)); assert.strictEqual(JSON.stringify(d), before);
  // tableau de réglage : remplacé en entier, longueur conservée
  const arr = F('bossTune.ar.gap'); assert.ok(arr && arr.kind === 'numlist' && arr.len === 4);
  d = M.applyFieldValue(doc, arr, [300, 250, 200, 100]); assert.deepStrictEqual(d.bossTune.ar.gap, [300, 250, 200, 100]);
  assert.throws(()=> M.applyFieldValue(doc, arr, [1, 2, 3]), /tableau de 4/);
  d = M.applyFieldValue(d, arr, arr.def); assert.ok(!('bossTune' in d));
  // clé pointée gardée telle quelle
  d = M.applyFieldValue(doc, F('bossTune.ar.dmg.missile'), 20); assert.strictEqual(d.bossTune.ar['dmg.missile'], 20);
  // événement : durée 0 = défaut (clé supprimée), param, norma
  const dur = F('events.0.duration'); d = M.applyFieldValue(doc, dur, 20); assert.strictEqual(d.events[0].duration, 20); d = M.applyFieldValue(d, dur, 0); assert.ok(!('duration' in d.events[0]));
  const par = F('events.0.params.tickMs'); d = M.applyFieldValue(doc, par, 500); assert.deepStrictEqual(d.events[0].params, { tickMs:500 });
  d = M.applyFieldValue(d, par, null); assert.ok(!('params' in d.events[0]), 'défaut dépendant de l\'alerte : null efface'); assert.strictEqual(d.events.length, 1);
  const alert = F('events.0.params.perTick'); d = M.applyFieldValue(doc, alert, alert.def); assert.strictEqual(d.events[0].params.perTick, alert.def, 'un défaut dépendant de l\'alerte reste écrit');
  assert.throws(()=> M.applyFieldValue(doc, par, 1), /entre/); assert.throws(()=> M.applyFieldValue(doc, alert, 1.5), /entier/);
  d = M.applyFieldValue(doc, F('events.0.norma.start'), 'Attention.'); assert.deepStrictEqual(d.events[0].norma, { start:'Attention.' }); d = M.applyFieldValue(d, F('events.0.norma.start'), ''); assert.ok(!('norma' in d.events[0]));
  // listes de textes : lignes vides retirées, liste vide = clé supprimée
  const pool = F('norma.start'); d = M.applyFieldValue(doc, pool, ['A', '  ', 'B']); assert.deepStrictEqual(d.norma.start, ['A', 'B']); d = M.applyFieldValue(d, pool, ['', ' ']); assert.ok(!('norma' in d));
  d = M.applyFieldValue(doc, F('norma.tickEvery'), [10, 20]); assert.deepStrictEqual(d.norma.tickEvery, [10, 20]); assert.throws(()=> M.applyFieldValue(doc, F('norma.tickEvery'), [30, 20]), /croissantes/); assert.throws(()=> M.applyFieldValue(doc, F('norma.tickEvery'), [1, 20]), /entre/);
  d = M.applyFieldValue(doc, F('norma.messages'), [{ id:'a', when:'levelStart', text:'x' }]); assert.strictEqual(d.norma.messages.length, 1); d = M.applyFieldValue(d, F('norma.messages'), []); assert.ok(!('norma' in d));
  // sélections : choix valides seulement ; null admis pour intro / décor ; musique d'origine = clé supprimée
  d = M.applyFieldValue(doc, F('bg'), null); assert.strictEqual(d.bg, null); assert.throws(()=> M.applyFieldValue(doc, F('bg'), 'inconnu'), /choix/);
  d = M.applyFieldValue(doc, F('intro'), 'earth'); assert.strictEqual(d.intro, 'earth');
  const ab = F('audio.boss'); d = M.applyFieldValue(doc, ab, musicCatalog.boss[0]); assert.strictEqual(d.audio.boss, musicCatalog.boss[0]); d = M.applyFieldValue(d, ab, ''); assert.ok(!('audio' in d));
  d = M.applyFieldValue(doc, F('audio.level'), [musicCatalog.level[0]]); assert.strictEqual(d.audio.level.length, 1); assert.throws(()=> M.applyFieldValue(doc, F('audio.level'), musicCatalog.level.slice(0, 3)), /au plus/);
  d = M.applyFieldValue(doc, F('ambient.golden'), false); assert.strictEqual(d.ambient.golden, false); assert.throws(()=> M.applyFieldValue(doc, F('ambient.golden'), 1), /booléen/);
  assert.throws(()=> M.applyFieldValue(doc, F('goal.seconds'), 5000), /entre/); assert.throws(()=> M.applyFieldValue(doc, F('goal.seconds'), NaN), /nombre/);
  // tuto : chemin ['tutorial', groupe, clé]
  const td = docs['w1-tuto'], tf = M.buildSteps(td, cats(td)).flatMap(s=> s.fields).find(f=> f.path.join('.') === 'tutorial.boss.hp');
  d = M.applyFieldValue(td, tf, 900); assert.strictEqual(d.tutorial.boss.hp, 900); assert.strictEqual(td.tutorial.boss.hp, 700);
}
console.log('OK : ' + Object.keys(docs).length + ' niveaux, ' + nFields + ' champs, textes du tuto identiques, ordre fixe, chemins uniques, aller-retour applyFieldValue');
