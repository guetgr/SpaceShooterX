// Contrat des vagues : application, remise à zéro, temps, redémarrage et saturation.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const c = vm.createContext({ console, localStorage:{getItem:()=>null}, WORLDS:[{levels:[{id:'test',type:'survive',goal:{seconds:60}}]}], TUTO_DEFAULTS:{}, TUNING_OVERRIDES:{}, GameScene:function(){}, mixin:(cls,methods)=>Object.assign(cls.prototype,methods), EVENT_DEFS:{} });
for (const file of ['src/data/bestiary.js','src/data/tuning-apply.js','src/game/level.js']) vm.runInContext(fs.readFileSync(file,'utf8'), c);
vm.runInContext(`
  applyTuning({levels:{test:{waves:[{type:'sat',at:2,count:3,spacing:0.5}],timelineOnly:1}}});
  var definition = WORLDS[0].levels[0];
  var scene = new GameScene(); scene.lvDef=definition; scene.spawned=[];
  scene.spawnOneEnemy=function(type){ if(this.full) return null; this.spawned.push(type); return {}; };
  scene.levelProgress=()=>({frac:0}); scene.levelInit();
`,c);
const sc = c.scene;
sc.levelUpdate(1999); assert.equal(sc.spawned.length,0);
sc.levelUpdate(1); assert.equal(sc.spawned.length,1);
sc.levelUpdate(1000); assert.equal(sc.spawned.length,3);
sc.levelUpdate(1000); assert.equal(sc.spawned.length,3);
sc.levelInit(); sc.full=true; sc.levelUpdate(4000); assert.equal(sc.lvWaves.length,3);
sc.full=false; sc.levelUpdate(1); assert.equal(sc.lvWaves.length,0); assert.equal(sc.spawned.length,6);
sc.levelInit(); sc.introActive=true; sc.levelUpdate(9000); assert.equal(sc.lvT,0);
vm.runInContext(`applyTuning({levels:{test:{waves:[]}}})`,c); assert.equal(c.definition.waves.length,0);
vm.runInContext('applyTuning({})',c); assert.equal(c.definition.timelineOnly,undefined);
assert.throws(()=>vm.runInContext(`applyTuning({levels:{test:{waves:[{type:'unknown',at:0,count:1,spacing:0}]}}})`,c));
assert.throws(()=>vm.runInContext(`applyTuning({levels:{test:{waves:[{type:'sat',at:0,count:1.5,spacing:0}]}}})`,c));
console.log('OK : vagues exactes, rattrapage, saturation, intro, reset, validation');
