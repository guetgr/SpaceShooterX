#!/usr/bin/env node
"use strict";
// Équivalence SANS navigateur des paramètres d'événements (src/data/events.js + src/data/event-params.js).
//   node tools/event_params_node_test.js                       -> compare avec tools/event_params_node_snapshot.json et vérifie le registre
//   node tools/event_params_node_test.js --write-from-git REV   -> écrit l'instantané depuis events.js tel qu'il était à REV (code d'AVANT le registre)
// 1. dur(alerte) (deux tirages graînés) et tickMs(alerte) de chaque événement == valeurs du code d'origine, alertes 1, 5, 10.
// 2. chaque paramètre du registre : défaut == formule du code d'origine (table EXPECTED ci-dessous, recopiée du code d'avant), alertes 1 à 12.
// 3. cohérence : défauts dans les bornes, clés uniques, chaque evParam(…) utilisé dans src/ existe, chaque entrée du registre est utilisée.
// 4. résolution : params de l'événement programmé > eventTune > défaut, sans fuite d'un événement à l'autre.
const fs = require('fs'), vm = require('vm'), path = require('path'), cp = require('child_process');
const R = path.resolve(__dirname, '..'), SNAP = path.join(__dirname, 'event_params_node_snapshot.json');
const ALERTS = [1, 5, 10];

function load(eventsSrc, withParams){
  let a = 0; const rnd = ()=>{ a = (a + 0x6D2B79F5)>>>0; let t = a; t = Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14)>>>0)/4294967296; };
  const ctx = { Phaser:{ Math:{ Between:(lo, hi)=> Math.floor(rnd()*(hi - lo + 1) + lo), FloatBetween:(lo, hi)=> lo + rnd()*(hi - lo) } }, Math, ENEMY_CAP:1e9, seed:(n)=>{ a = n>>>0; } };
  vm.createContext(ctx);
  vm.runInContext(eventsSrc + '\nthis.EVENT_DEFS = EVENT_DEFS;', ctx);
  if (withParams) vm.runInContext(fs.readFileSync(path.join(R, 'src/data/event-params.js'), 'utf8') + '\nthis.EVENT_PARAMS = EVENT_PARAMS; this.evParam = evParam;', ctx);
  return ctx;
}
function observe(ctx, withSc){
  const out = {};
  for (const al of ALERTS) for (const k of Object.keys(ctx.EVENT_DEFS)){
    const d = ctx.EVENT_DEFS[k], sc = withSc ? { alertLevel:al, lvDef:null } : undefined;
    ctx.seed(100 + al);
    out[al + ':' + k] = { dur:[d.dur(al, sc), d.dur(al, sc)], tickMs:d.tickMs ? d.tickMs(al, sc) : null };
  }
  return out;
}

if (process.argv[2] === '--write-from-git'){
  const src = cp.execFileSync('git', ['show', process.argv[3] + ':src/data/events.js'], { cwd:R }).toString();
  fs.writeFileSync(SNAP, JSON.stringify(observe(load(src, false), false), null, 1) + '\n');
  console.log('instantané écrit depuis ' + process.argv[3]); process.exit(0);
}

const assert = require('assert');
const same = (a, b, m)=> assert.strictEqual(JSON.stringify(a), JSON.stringify(b), m);      // les tableaux du contexte vm n'ont pas le même prototype
const ctx = load(fs.readFileSync(path.join(R, 'src/data/events.js'), 'utf8'), true);
// 1. durées et cadences
const ref = JSON.parse(fs.readFileSync(SNAP, 'utf8')), cur = observe(ctx, true);
same(cur, ref, 'dur / tickMs différents du code d\'origine');
console.log('OK dur/tickMs : %d événements x %d alertes identiques au code d\'avant', Object.keys(ctx.EVENT_DEFS).length, ALERTS.length);

// 2. défauts == formules d'origine (recopiées du code d'avant le registre)
const D = (lo, hi)=> ({ durMin:lo, durMax:hi }), fl = Math.floor, mx = Math.max, mn = Math.min;
const EXPECTED = {
  crystal:  a=>({ ...D(20,35), tickMs:360, perTick:1 + fl(a/3), bigChance:0.2, fallMin:90, fallMax:130 }),
  meteors:  a=>({ ...D(35,50), tickMs:mx(300, 700 - 18*(a-1)), perTick:1 + fl(a/3), speedMin:190, speedMax:270 }),
  swarm:    a=>({ dur:14, tickMs:mx(250, 420 - 12*a), perWave:10 + 3*a }),
  mines:    a=>({ ...D(20,40), tickMs:1000, perTick:1 + fl(a/3) }),
  goldrush: a=>({ dur:5, count:3 + fl(a/3), gapMs:mx(400, 1100 - 60*a) }),
  kamikaze: a=>({ dur:4, count:6 + a, gapMs:mx(120, 260 - 8*a), omniAlert:5 }),
  spiders:  a=>({ ...D(25,55), tickMs:650, firstGroup:5 + fl(a/2), perWave:3 + fl(a/2) }),
  elite:    a=>({ dur:4, elites:3 + fl(a/2), healers:1 + fl(a/4) }),
  bombard:  a=>({ dur:11, tickMs:mx(380, 620 - 18*a), radius:55 + 3*mn(a, 10), damage:8 + a, extra:fl(a/3), nearChance:0.6 }),
  frenzy:   a=>({ ...D(30,60), xpMul:2, spawnMul:0.55 }),
  flip:     a=>D(20,60),
  nebula:   a=>D(35,65),
  bossbonus:a=>({ dur:1.5 }),
  minibh:   a=>({ ...D(30,50), tickMs:3200, maxWells:2 + fl(a/4), radius:210, strength:1000, life:12, dmg:6 }),
  bigbh:    a=>({ ...D(30,50), radius:560, strength:1500, dmg:10 }),
  corridor: a=>({ ...D(35,55), speed:170, minWidth:190, shrink:5, wallDmg:3 }),
  eclipse:  a=>D(17,28),
  emp:      a=>({ dur:7.5, blackout:5.5 }),
  statik:   a=>({ dur:12, tickMs:mx(1300, 2500 - 80*a), strikes:3 + fl(a/4), damage:9 + a, radius:46 }),
  ice:      a=>({ dur:14, slide:220 }),
  shieldwall:a=>({ dur:3, cols:7, rows:mx(1, mn(6, 1 + fl((a - 4)/2))), speed:36 + 3*a, fireMin:1800, fireMax:3200 }),
  plasma:   a=>({ dur:11, crossSec:10.5, shotMs:520, perShot:10 + fl(a/2), bulletSpeed:130 + a*4, bulletDmg:5 + fl(a/2), contactDmg:12 + a }),
};
same(Object.keys(ctx.EVENT_PARAMS).sort(), Object.keys(ctx.EVENT_DEFS).sort(), 'un événement sans entrée dans EVENT_PARAMS (ou l\'inverse)');
let n = 0;
for (const k of Object.keys(ctx.EVENT_PARAMS)){
  const keys = ctx.EVENT_PARAMS[k].map(r=> r.key);
  assert.strictEqual(new Set(keys).size, keys.length, 'clés en double : ' + k);
  same(keys.slice().sort(), Object.keys(EXPECTED[k](1)).sort(), 'clés différentes de la table attendue : ' + k);
  for (let a = 1; a <= 12; a++){
    const exp = EXPECTED[k](a), sc = { alertLevel:a, lvDef:null };
    for (const r of ctx.EVENT_PARAMS[k]){
      const v = ctx.evParam(sc, k, r.key); n++;
      assert.strictEqual(v, exp[r.key], k + '.' + r.key + ' alerte ' + a + ' : ' + v + ' != ' + exp[r.key]);
      assert.ok(r.min <= v && v <= r.max && r.min < r.max && r.step > 0 && r.label && r.unit, 'bornes : ' + k + '.' + r.key + ' = ' + v);
    }
  }
}
console.log('OK défauts : %d valeurs (alertes 1 à 12) identiques aux formules d\'origine, dans les bornes', n);

// 3. usage : chaque evParam(...,'kind','key') du code existe ; chaque entrée du registre est lue quelque part
function walk(d){ return fs.readdirSync(d, { withFileTypes:true }).flatMap(e=> e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); }
const used = new Set();
walk(path.join(R, 'src')).filter(f=> f.endsWith('.js') && !f.endsWith('level-data.js') && !f.endsWith('event-params.js')).forEach(f=>{
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/evParam\(\s*(?:sc|this)\s*,\s*'(\w+)'\s*,\s*'(\w+)'\s*\)/g)){
    assert.ok(ctx.EVENT_PARAMS[m[1]] && ctx.EVENT_PARAMS[m[1]].some(r=> r.key === m[2]), 'evParam inconnu : ' + m[1] + '.' + m[2] + ' dans ' + f); used.add(m[1] + '.' + m[2]);
  }
  for (const m of t.matchAll(/evDur(Range)?\(\s*sc\s*,\s*'(\w+)'\s*\)/g)){ used.add(m[2] + (m[1] ? '.durMin' : '.dur')); if (m[1]) used.add(m[2] + '.durMax'); }
});
const unused = []; for (const k of Object.keys(ctx.EVENT_PARAMS)) for (const r of ctx.EVENT_PARAMS[k]) if (!used.has(k + '.' + r.key)) unused.push(k + '.' + r.key);
same(unused, [], 'paramètres du registre jamais lus : ' + unused.join(', '));
console.log('OK usage : %d paramètres lus dans le code, aucun orphelin', used.size);

// 4. priorité et absence de fuite
const base = { alertLevel:5, lvDef:null, curEvent:null, curSmall:null };
assert.strictEqual(ctx.evParam(base, 'meteors', 'tickMs'), 628);
const tuned = { ...base, lvDef:{ eventTune:{ meteors:{ tickMs:500, perTick:7 } } } };
assert.strictEqual(ctx.evParam(tuned, 'meteors', 'tickMs'), 500);
assert.strictEqual(ctx.evParam(tuned, 'mines', 'tickMs'), 1000, 'eventTune d\'un autre événement');
const prog = { ...tuned, curEvent:{ kind:'meteors', t:1, tick:0, params:{ tickMs:400 } } };
assert.strictEqual(ctx.evParam(prog, 'meteors', 'tickMs'), 400, 'params programmés > eventTune');
assert.strictEqual(ctx.evParam(prog, 'meteors', 'perTick'), 7, 'clé absente des params -> eventTune');
assert.strictEqual(ctx.evParam(prog, 'meteors', 'speedMin'), 190, 'clé absente partout -> défaut');
assert.strictEqual(ctx.evParam({ ...prog, curEvent:{ kind:'crystal', t:1, tick:0, params:{ tickMs:99 } } }, 'meteors', 'tickMs'), 500, 'params d\'un autre événement ignorés');
assert.strictEqual(ctx.evParam({ ...tuned, curEvent:{ kind:'meteors', t:1, tick:0, params:null } }, 'meteors', 'tickMs'), 500, 'événement sans params (après un événement avec params) : pas de fuite');
assert.strictEqual(ctx.evParam({ ...base, curSmall:{ kind:'swarm', t:1, tick:0, params:{ perWave:3.4 } } }, 'swarm', 'perWave'), 3, 'entier arrondi, créneau petit événement');
assert.strictEqual(ctx.evParam({ ...base, curEvent:{ kind:'meteors', params:{ tickMs:'x' } } }, 'meteors', 'tickMs'), 628, 'valeur non numérique ignorée');
assert.throws(()=> ctx.evParam(base, 'meteors', 'nope'));
console.log('OK résolution : params > eventTune > défaut, sans fuite');
