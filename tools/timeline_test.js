// Contrat des vagues : application, remise à zéro, temps, redémarrage et saturation.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const c = vm.createContext({ console, localStorage:{getItem:()=>null}, WORLDS:[{levels:[{id:'test',type:'mission',boss:'dread'}]}], TUTO_DEFAULTS:{}, TUNING_OVERRIDES:{}, GameScene:function(){}, mixin:(cls,methods)=>Object.assign(cls.prototype,methods), EVENT_DEFS:{} });
for (const file of ['src/data/bestiary.js','src/data/wave-patterns.js','src/data/boss-arrival.js','src/data/tuning-apply.js','src/game/level.js']) vm.runInContext(fs.readFileSync(file,'utf8'), c);
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

// Formations et propriétés optionnelles : contrat partagé, anciens documents intacts.
vm.runInContext(`
  this.weaponTierFor=a=>Math.min(3,a);
  scene.visibleXRange=()=>({min:0,max:400});scene.visibleYRange=()=>({min:0,max:700});
  scene.alertLevel=1;scene.weaponTier=1;scene.tuto=false;scene.introActive=false;
  scene.spawnOneEnemy=function(type,x){
    if(this.full)return null;
    const e={type,x,y:-30,hp:10,maxHp:10,shieldHp:4,shieldMaxHp:4,contactDamage:3,baseX:x,stopY:100,
      body:{velocity:{x:2,y:40},reset(x,y){this.velocity.x=0;this.velocity.y=0;}}};
    this.lastEnemy=e;this.spawned.push(type);return e;
  };
  applyTuning({levels:{test:{waves:[{type:'satgun',at:2,count:3,spacing:0,formation:'line',spread:160,x:50,y:20,hpMul:2,dmgMul:3,speedMul:1.5,alert:6,tier:3}]}}});
  scene.levelInit();scene.levelUpdate(2000);
`,c);
assert.equal(sc.spawned.at(-1),'satgun');
assert.equal(sc.lastEnemy.x,280); assert.equal(sc.lastEnemy.y,140);
assert.equal(sc.lastEnemy.hp,20);assert.equal(sc.lastEnemy.shieldHp,8);assert.equal(sc.lastEnemy.contactDamage,9);
assert.equal(sc.lastEnemy.body.velocity.y,60,'Le placement conserve la vitesse');
assert.equal(sc.lastEnemy.waveAlert,6);assert.equal(sc.lastEnemy.tier,3);
assert.equal(sc.alertLevel,1);assert.equal(sc.weaponTier,1,'Aucune fuite de l’alerte de la vague vers la mission');
vm.runInContext(`
  applyTuning({levels:{test:{waves:[{type:'sat',at:0,count:1,spacing:0,minAlert:5},{type:'grunt',at:1,count:1,spacing:0}]}}});
  scene.levelInit();scene.levelUpdate(2000);
`,c);
assert.equal(sc.lvWaves.length,1);assert.equal(sc.spawned.at(-1),'grunt','Un seuil non atteint ne bloque pas les vagues suivantes');
sc.alertLevel=5;sc.levelUpdate(1);assert.equal(sc.lvWaves.length,0);assert.equal(sc.spawned.at(-1),'sat');
vm.runInContext(`
  scene.tuto=true;scene.tutoSats=[];scene.tutoSpawnSat=function(){this.tutoSats.push({sp:{x:0,y:0},hp:10,max:10,vy:20,vx:2});};
  scene.levelSpawnWave({type:'sat',unitIndex:0,count:1,formation:'line',spread:100,x:50,y:20,hpMul:2,dmgMul:3,speedMul:2});
`,c);
assert.equal(sc.tutoSats.length,1);assert.equal(sc.tutoSats[0].hp,20);assert.equal(sc.tutoSats[0].vy,40);assert.equal(sc.tutoSats[0].sp.y,140);
console.log('OK : formations, multiplicateurs, vitesse préservée, alerte isolée, seuil non bloquant, satellites pédagogiques');
