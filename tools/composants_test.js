#!/usr/bin/env node
// Vérifie les règles de calcul des composants (prime AGP, franchise d'accident), sans navigateur :  node tools/composants_test.js
// Charge src/data/composants.js dans un contexte isolé, comme tools/check_worlds.js.
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console });
const load = f=> vm.runInContext(fs.readFileSync(path.join(R, 'src', f), 'utf8'), ctx, { filename:f });
load('data/composants.js');
const run = s=> vm.runInContext(s, ctx);

let fail = 0;
const ok = (cond, msg)=>{ if (!cond){ fail++; console.log('  ÉCHEC : ' + msg); } };

ok(run("COMP.franchise") === 0.30 && run("COMP.primeMul") === 0.5, 'constantes du design');
ok(run("composantsPrime({clear:20, first:40}, true)") === 30, 'prime 1re victoire = moitié de clear + first');
ok(run("composantsPrime({clear:20, first:40}, false)") === 10, 'prime de rejeu = moitié de clear');
const B = s=> JSON.stringify(run('composantsBank(' + s + ')'));
ok(B("{picked:100, victory:false, fragmentBonus:0, pactMul:1, prime:30}") === '{"gross":100,"franchise":30,"prime":0,"total":70}', 'défaite : franchise 30 %, pas de prime');
ok(B("{picked:100, victory:true, fragmentBonus:0.5, pactMul:1.2, prime:30}") === '{"gross":180,"franchise":0,"prime":30,"total":210}', 'victoire : bonus et clauses sur le ramassé, prime en plus');
ok(B("{picked:0, victory:true, fragmentBonus:0, pactMul:1, prime:30}") === '{"gross":0,"franchise":0,"prime":30,"total":30}', 'victoire sans ramassage : la prime seule');
ok(B("{picked:7, victory:false, fragmentBonus:0, pactMul:1, prime:0}") === '{"gross":7,"franchise":2,"prime":0,"total":5}', 'arrondi de la franchise');

if (fail){ console.log('ÉCHEC : composants (' + fail + ')'); process.exit(1); }
console.log('OK : composants');
