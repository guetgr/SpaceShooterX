"use strict";
// Contrat narratif des deux premiers ordres après le tutoriel, bible de l'univers v2.
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const arrival=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/data/boss-arrival.js'),'utf8'),arrival);   // levelBossAt : le boss arrive après les autres mobs de la timeline
const load=id=>JSON.parse(fs.readFileSync(path.join(__dirname,'../src/data/levels',id+'.json'),'utf8'));
const first=load('w1-l1'),second=load('w1-l2');
assert.equal(first.name,'PERTURBATIONS LOCALES');assert.equal(first.finalBoss,'meteo');
assert.equal(second.name,'RECUPERATION PRIORITAIRE');assert.equal(second.finalBoss,'araignee');
for(const level of [first,second]){
  const bossAt=arrival.levelBossAt(level);
  assert.equal(level.timelineOnly,1);assert.deepEqual(level.spawns,[]);
  assert.deepEqual(level.ambient,{golden:false,smallEvents:false});
  assert.equal(level.threat,1);assert.equal(level.hpMul,1);assert.equal(level.dmgMul,1);
  assert(level.waves.filter(w=>w.type!=='sat').every(w=>w.at+(w.count-1)*w.spacing<=bossAt-5),'Plus de nouvelles défenses avant le boss');
  assert(level.waves.every(w=>w.at+(w.count-1)*w.spacing<=bossAt-5),'Derniers débris avant le boss');
  assert(level.waves.every(w=>!w.minAlert||w.minAlert<=level.threat),'Aucune vague bloquée par une alerte inaccessible');
  const timed=level.norma.messages.filter(m=>m.when==='time').sort((a,b)=>a.at-b.at);
  for(let i=1;i<timed.length;i++)assert(timed[i].at-timed[i-1].at>=14,'Transmissions espacées');
  assert(bossAt-timed.at(-1).at>=14,'Place pour la transmission du boss');
  assert(level.norma.messages.some(m=>m.when==='bossStart'));assert(level.norma.messages.some(m=>m.when==='win'));
  assert(level.events.every(e=>e.at+e.duration<=bossAt),'Aucun événement programmé après l’arrivée du boss');
  assert(!('goal' in level)&&level.type==='mission','Plus d’objectif : l’ordre se gagne en battant son boss');
  assert(!/Mars|lunaire|Elon|contrat secret|recyclage frauduleux/i.test(JSON.stringify(level.norma)),'Aucune ancienne intrigue ou révélation martienne');
}
const types=level=>new Set(level.waves.map(w=>w.type));
for(const type of ['satgun','shooter','drone','turret'])assert(types(first).has(type),type);
for(const type of ['bras','healer','tank','shooter'])assert(types(second).has(type),type);
assert(!types(first).has('healer'));assert(!types(first).has('bras'));
assert(!types(first).has('eclaireur')&&!types(second).has('eclaireur'),'Verrouillage réservé à la progression ultérieure');
assert(Math.min(...second.waves.filter(w=>w.type==='healer').map(w=>w.at))>Math.min(...second.waves.filter(w=>w.type==='bras').map(w=>w.at)));
assert(second.waves.some(w=>w.type==='bras'&&w.tier===1));assert(second.waves.some(w=>w.type==='bras'&&w.tier===2));
console.log('OK : bible v2, deux incidents attendus, rôles progressifs, alertes accessibles, transmissions et respirations avant boss');
