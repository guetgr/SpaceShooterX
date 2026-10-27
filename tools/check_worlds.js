#!/usr/bin/env node
// Vérifie les mondes/niveaux (format) et la logique de progression, sans navigateur :  node tools/check_worlds.js
// Charge dans un contexte isolé les fichiers de données dans l'ordre de src/scripts.json (sans Phaser).
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..');
const store = {};
const ctx = vm.createContext({ console, localStorage:{ getItem:k=> (k in store ? store[k] : null), setItem:(k,v)=>{ store[k] = String(v); }, removeItem:k=>{ delete store[k]; } } });
const load = f=> vm.runInContext(fs.readFileSync(path.join(R, 'src', f), 'utf8'), ctx, { filename:f });
const order = JSON.parse(fs.readFileSync(path.join(R, 'src/scripts.json'), 'utf8'));
['data/events.js', 'data/bosses.js', 'data/player-stats.js', 'data/atelier.js', 'data/techs.js', 'data/meta.js'].forEach(load);
order.filter(f=> f === 'data/worlds.js' || f.startsWith('data/worlds/') || f === 'data/world-progress.js').forEach(load);
const run = s=> vm.runInContext(s, ctx);

let fail = 0;
const ok = (cond, msg)=>{ if (!cond){ fail++; console.log('  ÉCHEC : ' + msg); } };

const errs = run('validateWorlds()');
errs.forEach(e=> console.log('  format : ' + e)); ok(!errs.length, 'validateWorlds() renvoie des erreurs');
ok(run('WORLDS.length') >= 1, 'aucun monde enregistré');

// cas invalides : la validation doit les repérer
run("registerWorld({ id:'bad', order:99, name:'X', boss:'nope', levels:[{ id:'bad-1', type:'survive', threat:99, goal:{}, reward:{} }] })");
ok(run('validateWorlds()').length >= 4, 'validateWorlds() ne détecte pas un monde invalide');
run("WORLDS.pop(); _levelIdx = null;");

// progression
const first = run("WORLDS[0].levels.map(l=>l.id)");
ok(run("isLevelUnlocked('" + first[0] + "')") === true, 'le niveau 1 doit être ouvert');
ok(run("isLevelUnlocked('" + first[1] + "')") === false, 'le niveau 2 doit être verrouillé au départ');
const r = run("recordLevelClear('" + first[0] + "', 1234)");
ok(r.first === true && r.unlockedLevel === first[1], 'la 1re victoire doit ouvrir le niveau 2');
ok(run("isLevelUnlocked('" + first[1] + "')") === true, 'le niveau 2 doit être ouvert après victoire');
const r2 = run("recordLevelClear('" + first[0] + "', 99)");
ok(r2.first === false && r2.unlockedLevel === null, 'un rejeu ne redébloque rien');
ok(run("getWorldProgress().levels['" + first[0] + "'].best") === 1234, 'le meilleur score doit être conservé');
ok(run("worldSummary(WORLDS[0].id).done") === 1, 'worldSummary.done');
ok(run("firstOpenLevel().id") === first[1], 'firstOpenLevel');
run("WORLDS[0].levels.slice(1).forEach(l=> recordLevelClear(l.id, 1))");
ok(run("worldSummary(WORLDS[0].id).bossDown") === true, 'boss vaincu');
ok(run("isWorldUnlocked(WORLDS[1].id)") === true, 'le monde 2 s\'ouvre quand le boss du monde 1 est vaincu');
ok(run("recordLevelClear(WORLDS[0].levels[4].id, 1).unlockedWorld") === null, 'rejouer le boss ne redébloque pas le monde');
// monde de test d'ordre 99 : fermé tant que les vrais mondes ne sont pas finis
run("registerWorld({ id:'tz', order:99, name:'T', boss:'hydre', levels:[{ id:'tz-1', type:'boss', boss:'hydre', threat:9, reward:{ clear:1 } }] })");
ok(run("isWorldUnlocked('tz')") === false, 'le dernier monde est fermé tant que les précédents ne sont pas finis');
run("WORLDS.filter(w=> w.id !== 'tz').forEach(w=> w.levels.forEach(l=> recordLevelClear(l.id, 1)))");
ok(run("isWorldUnlocked('tz')") === true, 'le dernier monde s\'ouvre après le boss du précédent');
store.ssx_worlds_v1 = '{"v":1,"levels":{}}';
ok(run("isWorldUnlocked('tz')") === false, 'sans progression, le dernier monde est fermé');
store.ssx_worlds_v1 = 'corrompu{';
ok(run("getWorldProgress().v") === 1, 'une sauvegarde corrompue ne doit pas planter');
ok(fs.readFileSync(path.join(R, 'src/core/cloud-save.js'), 'utf8').includes("'ssx_worlds_v1'"), 'ssx_worlds_v1 absent de SAVE_KEYS (sauvegarde cloud)');

console.log(fail ? ('\n' + fail + ' échec(s)') : 'worlds : tout est bon');
process.exit(fail ? 1 : 0);
