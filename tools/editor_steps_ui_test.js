"use strict";
// Test sans navigateur du panneau « étapes » (tools/editor/steps-ui.js) sur un faux DOM minimal, + editorLevelDocument (level-document.js)
// + applyTuning (src/data/tuning-apply.js) pour les clés mobs / bossTune / eventTune / norma / audio.
//   node tools/editor_steps_ui_test.js
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const clone = o => JSON.parse(JSON.stringify(o));
const eq = (a, b, m)=> assert.deepStrictEqual(a === undefined ? a : clone(a), b === undefined ? b : clone(b), m);      // valeurs venues du contexte vm : comparées après copie (autre royaume)

/* ---------- faux DOM ---------- */
class Text { constructor(t){ this.nodeType = 3; this.textContent = String(t); this.parentNode = null; } }
class El {
  constructor(tag){ this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null; this._text = ''; this.className = ''; this.style = {}; this.value = ''; this.checked = false; this.open = false; this.id = ''; this.type = '';
    const self = this;
    this.classList = {
      has(c){ return self.className.split(/\s+/).indexOf(c) >= 0; },
      add(c){ if (!this.has(c)) self.className = (self.className + ' ' + c).trim(); },
      remove(c){ self.className = self.className.split(/\s+/).filter(x=> x && x !== c).join(' '); },
      toggle(c, on){ if (on === undefined) on = !this.has(c); if (on) this.add(c); else this.remove(c); return on; },
      contains(c){ return this.has(c); },
    };
  }
  get textContent(){ return this._text + this.children.map(c=> c.textContent).join(''); }
  set textContent(t){ this.children.forEach(c=> c.parentNode = null); this.children = []; this._text = String(t); }
  appendChild(c){ if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.children.push(c); return c; }
  append(...a){ a.forEach(c=> this.appendChild(c)); }
  insertBefore(c, ref){ if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  removeChild(c){ const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; }
  replaceChildren(...a){ this.children.forEach(c=> c.parentNode = null); this.children = []; this._text = ''; a.forEach(c=> this.appendChild(c)); }
  get firstChild(){ return this.children[0] || null; }
  contains(n){ for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
  querySelector(sel){ return all(this, sel)[0] || null; }
  setAttribute(k, v){ this[k] = v; }
}
function walk(n, fn){ fn(n); (n.children || []).forEach(c=> walk(c, fn)); }
function all(rootEl, sel){ const out = []; walk(rootEl, n=>{ if (n === rootEl || n.nodeType === 3) return; if (sel[0] === '.' ? n.classList.has(sel.slice(1)) : n.tagName === sel.toUpperCase()) out.push(n); }); return out; }
const roots = [];
const document = {
  activeElement:null,
  createElement:t=> new El(t), createTextNode:t=> new Text(t),
  getElementById:id=>{ let f = null; roots.forEach(r=> walk(r, n=>{ if (!f && n.id === id) f = n; })); return f; },
};

/* ---------- catalogues depuis les registres réels (comme tools/editor_steps_test.js) ---------- */
const ev = { Phaser:{ Math:{ Between:(a)=> a, FloatBetween:(a)=> a } }, Math, ENEMY_CAP:1e9 }; vm.createContext(ev);
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
const mobCatalog = Object.keys(c3.ENEMY_STATS).map(type=>{ const st = Object.assign({}, c3.ENEMY_STATS[type]); return { type, label:type, hp:st.hp, dmg:st.dmg, score:st.score, speed:st.vyBetween ? st.vyBetween[0] : st.vy }; });
const tSrc = read('data/tunables.js'), c4 = {}; vm.createContext(c4);
vm.runInContext(tSrc.slice(0, tSrc.indexOf('// Racines')) + '\nthis.TUNABLES = TUNABLES;', c4);
const tunablesCatalog = {};
Object.keys(c4.TUNABLES).forEach(id=> { tunablesCatalog[id] = c4.TUNABLES[id].map(r=> ({ path:r.path, label:r.label, min:r.min, max:r.max, step:r.step, unit:r.unit, help:r.help, len:r.len, def:r.len ? new Array(r.len).fill(r.min) : r.min })); });

const files = fs.readdirSync(path.join(SRC, 'data/levels')).filter(f=> /^w\d-.*\.json$/.test(f));
const documents = {}; files.forEach(f=> { const d = JSON.parse(fs.readFileSync(path.join(SRC, 'data/levels', f), 'utf8')); documents[d.id] = d; });
assert.strictEqual(Object.keys(documents).length, 42);

/* ---------- contexte de l'éditeur ---------- */
const ctx = { document, console, JSON, Math, Object, Array, String, Number, Error, isFinite };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['tools/editor/steps-model.js', 'tools/editor/level-document.js', 'tools/editor/steps-ui.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename:f });
vm.runInContext(`
  var clone = o=> JSON.parse(JSON.stringify(o));
  function pruneAll(o){ if (Array.isArray(o)) return; Object.keys(o).forEach(k=>{ if (o[k] && typeof o[k] === 'object'){ pruneAll(o[k]); if (!Array.isArray(o[k]) && !Object.keys(o[k]).length) delete o[k]; } }); }
  var changes = 0;
  function changed(){ changes++; pruneAll(S.ov); S.ov.tuto = S.ov.tuto || {}; S.ov.levels = S.ov.levels || {}; if (S.refreshSteps) S.refreshSteps(); }
  function section(title, open){ const d = document.createElement('details'); d.open = !!open; const s = document.createElement('summary'); s.textContent = title; const b = document.createElement('div'); b.className = 'body'; d.appendChild(s); d.appendChild(b); return d; }
  function updateSum(){ const w = document.getElementById('sumWarn'); if (!w) return; const C = Object.assign({}, S.defaults.comp, S.ov.tuto.comp || {}); const t = C.sats + C.boss + C.win + C.clean; w.textContent = t === 100 ? '' : 'Total des poids : ' + t; }
`, ctx);
ctx.S = { documents:clone(documents), ov:{ tuto:{}, levels:{} }, eventCatalog, decorCatalog, musicCatalog, tunablesCatalog, mobCatalog, bestiary:[], defaults:clone(documents['w1-tuto'].tutorial) };
const S = ctx.S, M = ctx.EditorSteps;
const catalogs = id=> ({ eventCatalog, decorCatalog, musicCatalog, tunablesCatalog, mobCatalog, base:documents[id] });

function render(id){ const parent = new El('div'); roots.length = 0; roots.push(parent); ctx.renderSteps(parent, { id, tuto:!!documents[id].tuto }); return parent; }
const steps = p=> all(p, '.st-step');
const stepOf = (p, title)=> steps(p).find(s=> s.children[0].children[0].textContent === title);
const desc = st=> all(st, '.st-desc')[0].textContent;
const labelText = r=>{ const t = r.children[0].children.find(c=> c.nodeType === 3); return t ? t.textContent : ''; };
const rowOf = (st, label)=> all(st, '.f').find(r=> labelText(r) === label);
const errOf = r=> all(r, '.st-err')[0].textContent;
const btn = (n, text)=> all(n, 'button').find(b=> b.textContent === text);
const fire = (inp, v)=>{ if (v !== undefined) inp.value = String(v); inp.onchange(); };

// (1) toutes les étapes de tous les niveaux se rendent sans erreur, un bloc par étape, une ligne par champ
let nFields = 0;
Object.keys(documents).forEach(id=>{
  const p = render(id), want = M.buildSteps(documents[id], catalogs(id));
  assert.strictEqual(steps(p).length, want.length, id + ' : nombre d\'étapes');
  const warns = all(p, '.warn').filter(w=> /impossible/.test(w.textContent));
  eq(warns.map(w=> w.textContent), [], id + ' : erreurs d\'affichage');
  want.forEach((s, i)=>{ assert.strictEqual(desc(steps(p)[i]), s.text, id + ' ' + s.id + ' : description'); assert.strictEqual(all(steps(p)[i], '.f').length, s.fields.length, id + ' ' + s.id + ' : champs'); nFields += s.fields.length; });
});

// Fixtures des interactions : tester les créations/retraits à partir de champs facultatifs absents,
// indépendamment des dialogues et événements désormais présents dans les vrais niveaux (testés ci-dessus).
for(const id of ['w1-l1','w1-l2']){
  delete documents[id].norma;
  documents[id].events=id==='w1-l2'?[{kind:'meteors',at:30}]:[];
}
S.documents=clone(documents);

// (2) un nombre : clé de premier niveau stockée, description recalculée, retour au défaut = surcharge effacée ; invalide = refusé avec message
{
  const id = 'w1-l2', p = render(id), st = stepOf(p, 'OBJECTIF'), r = rowOf(st, 'Menace'), num = all(r, 'input')[0];
  const before = ctx.changes;
  fire(num, 7);
  assert.strictEqual(S.ov.levels[id].threat, 7);
  assert.ok(/menace 7/.test(desc(stepOf(p, 'OBJECTIF'))), 'description mise à jour : ' + desc(stepOf(p, 'OBJECTIF')));
  assert.ok(r.classList.has('mod'), 'valeur modifiée en orange');
  assert.strictEqual(ctx.changes, before + 1);
  fire(num, 999);
  assert.ok(/Menace : nombre entre 1 et 20 requis/.test(errOf(r)), 'message : ' + errOf(r));
  assert.strictEqual(S.ov.levels[id].threat, 7, 'valeur invalide non écrite');
  fire(num, 'abc');
  assert.strictEqual(S.ov.levels[id].threat, 7);
  all(r, '.meta')[0].onclick();                     // ↺
  assert.strictEqual(S.ov.levels[id], undefined, 'défaut : surcharge effacée');
  assert.strictEqual(errOf(r), '');
  // réglage de boss (bossTune, clé absente du JSON d'origine) puis remise à l'origine
  const boss = stepOf(p, 'COMBAT DU BOSS'), hp = rowOf(boss, 'PV');
  fire(all(hp, 'input')[0], 3000);
  eq(S.ov.levels[id].bossTune, { ar:{ hp:3000 } });
  assert.strictEqual(ctx.editorLevelDocument(id).bossTune.ar.hp, 3000);
  all(hp, '.meta')[0].onclick();
  assert.strictEqual(S.ov.levels[id], undefined, 'bossTune revenu à l\'origine : surcharge effacée');
  // numlist (paliers d'usure) : longueur fixe, bornes
  const th = rowOf(boss, 'Paliers d\'usure'), ins = all(th, 'input');
  assert.strictEqual(ins.length, 3);
  ins[0].value = '70'; ins[1].value = '40'; fire(ins[2], 15);
  eq(S.ov.levels[id].bossTune.ar.thresh, [70, 40, 15]);
  fire(ins[0], 500); assert.ok(/entre 1 et 99/.test(errOf(th)), errOf(th)); eq(S.ov.levels[id].bossTune.ar.thresh, [70, 40, 15]);
  S.ov = { tuto:{}, levels:{} };
}

// (3) réglage du tuto -> S.ov.tuto[groupe][clé] (et rien dans S.ov.levels), description et total des poids
{
  const id = 'w1-tuto', p = render(id), st = stepOf(p, 'ALERTE / ANTENNE-MERE'), r = rowOf(st, 'Points de vie');
  fire(all(r, 'input')[0], 900);
  eq(S.ov.tuto, { boss:{ hp:900 } });
  assert.strictEqual(S.ov.levels[id], undefined);
  assert.ok(/boss à 900 PV/.test(desc(stepOf(p, 'ALERTE / ANTENNE-MERE'))));
  const rep = stepOf(p, 'RAPPORT'), w = rowOf(rep, 'Poids · boss vaincu');
  const C = documents[id].tutorial.comp;
  fire(all(w, 'input')[0], C.win + 5);
  assert.strictEqual(S.ov.tuto.comp.win, C.win + 5);
  assert.ok(/Total des poids/.test(document.getElementById('sumWarn').textContent), 'avertissement du total');
  fire(all(w, 'input')[0], C.win);
  assert.strictEqual(S.ov.tuto.comp, undefined);
  fire(all(r, 'input')[0], documents[id].tutorial.boss.hp);
  eq(S.ov.tuto, {});
  // champ non-tutorial du tuto (décor) : S.ov.levels['w1-tuto']
  const intro = stepOf(p, 'INTRO / CAMERA'), bg = rowOf(intro, 'Décor'), sel = all(bg, 'select')[0];
  const opts = M.buildSteps(documents[id], catalogs(id))[0].fields.find(f=> f.path[0] === 'bg').options;
  fire(sel, opts.findIndex(o=> o.value === null));
  assert.strictEqual(S.ov.levels[id].bg, null);
  assert.strictEqual(ctx.editorLevelDocument(id).bg, null);
  S.ov = { tuto:{}, levels:{} };
}

// (4) boîtes N.O.R.M.A. : ajout (brouillon non écrit), texte, quand, retrait ; pools de textes ; refus des < >
{
  const id = 'w1-l1', p = render(id), st = stepOf(p, 'N.O.R.M.A.'), r = rowOf(st, 'Boîtes de dialogue');
  btn(r, 'AJOUTER UNE TRANSMISSION').onclick();
  assert.strictEqual(S.ov.levels[id], undefined, 'boîte vide non enregistrée');
  assert.ok(/écrivez le texte/.test(errOf(r)));
  let items = all(r, '.st-item'); assert.strictEqual(items.length, 1);
  const textIn = it=> all(it, 'input').find(i=> i.type === 'text' && i.parentNode.className === 'st-col-text');
  const whenSel = it=> all(it, 'select')[0];
  fire(textIn(items[0]), 'Bonjour.');
  eq(S.ov.levels[id].norma, { messages:[{ id:'m1', when:'levelStart', text:'Bonjour.' }] });
  assert.strictEqual(errOf(r), '');
  const whenOpts = M.buildSteps(documents[id], catalogs(id)).find(s=> s.id === 'norma').fields.find(f=> f.kind === 'objlist').item.find(i=> i.key === 'when').options;
  fire(whenSel(items[0]), whenOpts.findIndex(o=> o.value === 'time'));
  eq(S.ov.levels[id].norma.messages[0], { id:'m1', when:'time', at:0, text:'Bonjour.' });
  items = all(r, '.st-item');
  fire(all(items[0], 'input').find(i=> i.type === 'number'), 12);
  assert.strictEqual(S.ov.levels[id].norma.messages[0].at, 12);
  fire(whenSel(items[0]), whenOpts.findIndex(o=> o.value === 'eventEnd'));
  const m0 = S.ov.levels[id].norma.messages[0];
  assert.strictEqual(m0.at, undefined, 'date retirée hors « à une date »');
  assert.strictEqual(m0.ref, eventCatalog[0].id, 'événement par défaut');
  btn(r, 'AJOUTER UNE TRANSMISSION').onclick();
  items = all(r, '.st-item'); assert.strictEqual(items.length, 2);
  fire(textIn(items[1]), 'Deux <b>');
  assert.ok(/< et > sont interdits/.test(errOf(r)), errOf(r));
  assert.strictEqual(S.ov.levels[id].norma.messages.length, 1, 'texte invalide non écrit');
  fire(textIn(items[1]), 'Deux.');
  eq(S.ov.levels[id].norma.messages.map(m=> m.id), ['m1', 'm2']);
  // l'identifiant en double est refusé
  fire(all(items[1], 'input').find(i=> i.parentNode.className === 'st-col-id'), 'm1');
  assert.ok(/déjà utilisé/.test(errOf(r)), errOf(r));
  fire(all(items[1], 'input').find(i=> i.parentNode.className === 'st-col-id'), 'm2');
  btn(items[0], 'SUPPRIMER').onclick();
  eq(S.ov.levels[id].norma.messages, [{ id:'m2', when:'levelStart', text:'Deux.' }]);
  btn(all(r, '.st-item')[0], 'SUPPRIMER').onclick();
  assert.strictEqual(S.ov.levels[id], undefined, 'plus de boîte : norma retiré');
  // pool de textes (textlist)
  const pool = rowOf(st, 'Début de mission');
  btn(pool, 'AJOUTER UNE LIGNE').onclick();
  const li = all(pool, 'input')[0]; fire(li, 'Ligne 1.');
  eq(S.ov.levels[id].norma, { start:['Ligne 1.'] });
  fire(li, 'a>b'); assert.ok(/interdits/.test(errOf(pool))); eq(S.ov.levels[id].norma.start, ['Ligne 1.']);
  btn(pool, 'RETIRER').onclick();
  assert.strictEqual(S.ov.levels[id], undefined);
  // musique (textlist à choix)
  const mus = rowOf(stepOf(p, 'INTRO / CAMERA'), 'Musique de l\'ordre'), boxes = all(mus, 'input');
  assert.strictEqual(boxes.length, musicCatalog.level.length);
  boxes[0].checked = true; boxes[0].onchange();
  eq(S.ov.levels[id].audio, { level:[musicCatalog.level[0]] });
  all(mus, 'input')[0].checked = false; all(mus, 'input')[0].onchange();
  assert.strictEqual(S.ov.levels[id], undefined);
  S.ov = { tuto:{}, levels:{} };
}

// (5) paramètre d'événement programmé (events[i].params, défaut selon l'alerte) et mobs
{
  const id = 'w1-l2', doc = documents[id];
  assert.ok(doc.events.length, 'w1-l2 a des événements');
  const p = render(id), st = steps(p).find(s=> /^EVENEMENT · /.test(s.children[0].children[0].textContent));
  const f = all(st, '.f').find(r=> r.children[1] && r.children[1].type === 'number' && ['Déclenchement', 'Durée forcée'].indexOf(labelText(r)) < 0);
  assert.ok(f, 'paramètre d\'événement affiché');
  {
    const inp = all(f, 'input')[0], v = Number(inp.value), nv = v + Number(inp.step) <= Number(inp.max) ? v + Number(inp.step) : v - Number(inp.step);
    fire(inp, nv);
    assert.ok(S.ov.levels[id].events[0].params, 'params écrit');
    all(f, '.meta')[0].onclick();
    assert.strictEqual(S.ov.levels[id], undefined, 'params retiré : événements identiques à l\'origine');
  }
  const dur = rowOf(st, 'Durée forcée');
  fire(all(dur, 'input')[0], 0.05); assert.ok(/0 ou au moins 0.1/.test(errOf(dur)), errOf(dur)); assert.strictEqual(S.ov.levels[id], undefined);
  fire(all(dur, 'input')[0], 20); assert.strictEqual(S.ov.levels[id].events[0].duration, 20);
  assert.ok(/Durée : 20 s/.test(desc(st)), desc(st));
  fire(all(dur, 'input')[0], 0); assert.strictEqual(S.ov.levels[id], undefined);
  const mobs = stepOf(p, 'MOBS'), r = all(mobs, '.f')[0];
  fire(all(r, 'input')[0], 2);
  assert.strictEqual(Object.values(S.ov.levels[id].mobs)[0].hpMul, 2);
  fire(all(r, 'input')[0], 1);
  assert.strictEqual(S.ov.levels[id], undefined, 'mobs à 1 : retiré');
  S.ov = { tuto:{}, levels:{} };
}

// (6) editorLevelDocument : clés entières remplacées, null = retirée, anciennes clés fusionnées, clés inconnues ignorées
{
  const id = 'w1-l3';
  S.documents[id].norma = { start:['A.'], tickEvery:[30, 40] };
  S.ov.levels[id] = { mobs:{ grunt:{ hpMul:2 } }, bossTune:{ rx:{ hp:900 } }, eventTune:{ meteors:{ tickMs:500 } }, norma:{ start:['B.'] }, audio:{ level:['w1_l3_a'] }, goal:{ seconds:99 }, foo:1 };
  const d = ctx.editorLevelDocument(id);
  eq(d.mobs, { grunt:{ hpMul:2 } }); eq(d.bossTune, { rx:{ hp:900 } }); eq(d.eventTune, { meteors:{ tickMs:500 } });
  eq(d.norma, { start:['B.'] }, 'remplacement entier (tickEvery d\'origine disparu)'); eq(d.audio, { level:['w1_l3_a'] });
  eq(d.goal, Object.assign({}, documents[id].goal, { seconds:99 }), 'fusion au premier niveau conservée');
  assert.ok(!('foo' in d), 'clé inconnue ignorée');
  S.ov.levels[id] = { norma:null }; assert.ok(!('norma' in ctx.editorLevelDocument(id)), 'null = retirée');
  // retirer la dernière sous-clé d'une clé présente dans le document d'origine -> null stocké
  const p = render(id), pool = rowOf(stepOf(p, 'N.O.R.M.A.'), 'Début de mission');
  S.ov.levels[id] = {}; ctx.S.refreshSteps();
  const tick = rowOf(stepOf(p, 'N.O.R.M.A.'), 'Intervalle des vannes et avancements');
  all(pool, 'button').filter(b=> b.textContent === 'RETIRER').forEach(b=> b.onclick());
  eq(S.ov.levels[id].norma, { tickEvery:[30, 40] });
  all(tick, '.meta')[0].onclick();
  assert.strictEqual(S.ov.levels[id].norma, null, 'norma vidée alors que l\'origine en a : null');
  assert.ok(!('norma' in ctx.editorLevelDocument(id)));
  S.documents[id] = clone(documents[id]); S.ov = { tuto:{}, levels:{} };
}

// (7) applyTuning transporte les cinq clés (et events[i].params / norma) dans la définition du niveau, sans lever
{
  const base = { id:'test', type:'survive', goal:{ seconds:60 }, norma:{ start:['A.'], tickEvery:[30, 40] }, events:[] };
  const c = vm.createContext({ console, WORLDS:[{ levels:[clone(base)] }], TUTO_DEFAULTS:{}, TUNING_OVERRIDES:{}, BESTIARY_LIST:[] });
  vm.runInContext(read('data/wave-patterns.js'), c);
  vm.runInContext(read('data/tuning-apply.js') + '\nthis.F = TUNE_LEVEL_FIELDS;', c);
  ['mobs', 'bossTune', 'eventTune', 'norma', 'audio'].forEach(k=> assert.ok(c.F.indexOf(k) >= 0, 'TUNE_LEVEL_FIELDS : ' + k));
  const l = ()=> c.WORLDS[0].levels[0];
  const ov = { mobs:{ grunt:{ hpMul:2 } }, bossTune:{ ar:{ hp:3000 } }, eventTune:{ meteors:{ tickMs:500 } }, norma:{ messages:[{ id:'m1', when:'time', at:5, text:'X.' }] }, audio:{ level:['w1_l1_a'] },
    events:[{ kind:'meteors', at:5, params:{ tickMs:400 }, norma:{ start:'Go.' } }] };
  c.ov = ov; vm.runInContext('applyTuning({ levels:{ test:ov } })', c);
  ['mobs', 'bossTune', 'eventTune', 'audio', 'events'].forEach(k=> eq(l()[k], ov[k], k));
  eq(l().norma, ov.norma, 'norma remplacé en entier');
  vm.runInContext('applyTuning({ levels:{ test:{ norma:null } } })', c);
  assert.ok(!('norma' in l()), 'null : norma retiré');
  assert.ok(!('mobs' in l()), 'mobs revenu à l\'origine (absent)');
  vm.runInContext('applyTuning({})', c);
  eq(l().norma, base.norma, 'origine restaurée');
}

console.log('OK : 16 niveaux rendus (' + nFields + ' champs), nombres / listes / boîtes N.O.R.M.A. écrits dans S.ov, tuto dans S.ov.tuto, refus des valeurs invalides, editorLevelDocument et applyTuning (clés entières)');
