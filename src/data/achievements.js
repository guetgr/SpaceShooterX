"use strict";
// Succès : paliers, poids, progression et bonus.

/* =========================================================
   SUCCES — kills comptés par ennemi ET par niveau d'alerte, plus on en tue à haut niveau d'alerte, plus vite ça monte (kills pondérés).
   Les succès globaux donnent des buffs permanents, façon Cookie Clicker.
========================================================= */
const ACHV_KEY = 'ssx_achv_v1';

const ACHV_W = [1, 1.5, 2.2, 3.2, 4.5, 6, 8, 10, 12.5, 15, 18, 21, 25, 29, 34, 40, 47, 55, 64, 74];   // poids d'un kill selon le niveau d'alerte (1..15)

function newKillArr(){ return ACHV_W.map(()=>0); }

const ACHV_TYPES = ['grunt','diver','shooter','charo','turret','drone','splitter','shieldedGrunt','mine','tank','bomber','sniper','swarmer','healer','ghost','elite','mothership','vortex','kamikaze','spider','meteor'];

const ACHV_GLOBALS = [
  { id:'g_k100',   kind:'total',        need:100,   name:'PREMIER SANG',          buff:{dmg:0.02},  txt:'+2% dégâts' },
  { id:'g_k500',   kind:'total',        need:500,   name:'CHASSEUR',              buff:{fire:0.03}, txt:'+3% cadence de tir' },
  { id:'g_k1500',  kind:'total',        need:1500,  name:'MASSACRE',              buff:{xp:0.05},   txt:'+5% XP' },
  { id:'g_k5000',  kind:'total',        need:5000,  name:'EXTERMINATEUR',         buff:{dmg:0.05},  txt:'+5% dégâts' },
  { id:'g_k15000', kind:'total',        need:15000, name:'FLEAU',                 buff:{frag:0.08}, txt:'+8% fragments' },
  { id:'g_a6',     kind:'alertKills',   need:300,   name:'ALERTE MAXIMALE',       buff:{dmg:0.05},  txt:'+5% dégâts (300 kills en alerte 6+)' },
  { id:'g_boss1',  kind:'boss',         need:1,     name:'TUEUR DE BOSS',         buff:{hp:0.05},   txt:'+5% PV max' },
  { id:'g_boss10', kind:'boss',         need:10,    name:'BOURREAU',              buff:{fire:0.05}, txt:'+5% cadence de tir' },
  { id:'g_bossall',kind:'bossDistinct', need:7,     name:'CHASSEUR DE LEGENDES',  buff:{dmg:0.10},  txt:'+10% dégâts (7 boss différents)' },
  { id:'g_types',  kind:'types',        need:ACHV_TYPES.length, name:'BESTIAIRE COMPLET', buff:{xp:0.05}, txt:'+5% XP (tous les ennemis tués)' },
  // --- réactions en chaîne (meilleure chaîne d'explosions)
  { id:'g_chain15',  kind:'chain', need:15,  name:'REACTION EN CHAINE',  buff:{dmg:0.03},  txt:'+3% dégâts (15 mobs dans une même chaîne)' },
  { id:'g_chain50',  kind:'chain', need:50,  name:'REACTEUR NUCLEAIRE',  buff:{fire:0.04}, txt:'+4% cadence (50 mobs dans une chaîne)' },
  { id:'g_chain120', kind:'chain', need:120, name:'ARMAGEDDON',          buff:{dmg:0.06},  txt:'+6% dégâts (120 mobs dans une chaîne)' },
  // --- survie (durée de la meilleure partie, en secondes)
  { id:'g_time5',  kind:'maxTime', need:300,  name:'SURVIVANT',    buff:{hp:0.04}, txt:'+4% PV max (5 min dans une partie)' },
  { id:'g_time10', kind:'maxTime', need:600,  name:'ENDURANCE',    buff:{xp:0.05}, txt:'+5% XP (10 min dans une partie)' },
  { id:'g_time20', kind:'maxTime', need:1200, name:'INTOUCHABLE',  buff:{hp:0.06}, txt:'+6% PV max (20 min dans une partie)' },
  // --- niveau atteint en partie
  { id:'g_lvl20', kind:'maxLevel', need:20, name:'EN PROGRESSION',      buff:{xp:0.03},  txt:'+3% XP (niveau 20 dans une partie)' },
  { id:'g_lvl40', kind:'maxLevel', need:40, name:'MONTEE EN PUISSANCE', buff:{dmg:0.04}, txt:'+4% dégâts (niveau 40 dans une partie)' },
  // --- niveau d'alerte atteint
  { id:'g_al8',  kind:'maxAlert', need:8,  name:'ALERTE 8',  buff:{dmg:0.04},  txt:'+4% dégâts (atteindre le niveau d\'alerte 8)' },
  { id:'g_al10', kind:'maxAlert', need:10, name:'ALERTE 10', buff:{fire:0.05}, txt:'+5% cadence (atteindre le niveau d\'alerte 10)' },
  { id:'g_al12', kind:'maxAlert', need:12, name:'ALERTE 12', buff:{hp:0.05},   txt:'+5% PV max (atteindre le niveau d\'alerte 12)' },
  { id:'g_al15', kind:'maxAlert', need:15, name:'ALERTE 15', buff:{dmg:0.10},  txt:'+10% dégâts (atteindre le niveau d\'alerte 15)' },
  // --- meilleur combo de kills (style)
  { id:'g_cb100',  kind:'maxCombo', need:100,  name:'COMBO 100',  buff:{dmg:0.03},  txt:'+3% dégâts (combo de 100 kills)' },
  { id:'g_cb500',  kind:'maxCombo', need:500,  name:'COMBO 500',  buff:{fire:0.04}, txt:'+4% cadence (combo de 500 kills)' },
  { id:'g_cb2000', kind:'maxCombo', need:2000, name:'COMBO 2000', buff:{xp:0.06},   txt:'+6% XP (combo de 2000 kills)' },
  // --- un succès par boss vaincu (la clé est celle du bestiaire: 'boss' = Dreadnought)
  { id:'g_bt_dread',     kind:'bossType', key:'boss',           need:1, name:'TUEUR: DREADNOUGHT', buff:{dmg:0.02}, txt:'+2% dégâts' },
  { id:'g_bt_faucheuse', kind:'bossType', key:'boss_faucheuse', need:1, name:'TUEUR: FAUCHEUSE',   buff:{dmg:0.02}, txt:'+2% dégâts' },
  { id:'g_bt_ruche',     kind:'bossType', key:'boss_ruche',     need:1, name:'TUEUR: RUCHE',       buff:{dmg:0.02}, txt:'+2% dégâts' },
  { id:'g_bt_prisme',    kind:'bossType', key:'boss_prisme',    need:1, name:'TUEUR: PRISME',      buff:{dmg:0.02}, txt:'+2% dégâts' },
  { id:'g_bt_kraken',    kind:'bossType', key:'boss_kraken',    need:1, name:'TUEUR: KRAKEN',      buff:{dmg:0.02}, txt:'+2% dégâts' },
  { id:'g_bt_eclipse',   kind:'bossType', key:'boss_eclipse',   need:1, name:'TUEUR: ECLIPSE',     buff:{dmg:0.02}, txt:'+2% dégâts' },
  { id:'g_bt_hydre',     kind:'bossType', key:'boss_hydre',     need:1, name:'TUEUR: HYDRE',       buff:{dmg:0.02}, txt:'+2% dégâts' },
];

function achvRaw(a, type){ const k = a.killsAlert[type]; return k ? k.reduce((x,y)=>x+(y||0),0) : 0; }

function achvGlobalProgress(a, g){
  switch (g.kind){
    case 'total': return a.rawTotal;
    case 'alertKills': return a.alertKills;
    case 'boss': return a.bossTotal;
    case 'bossDistinct': return Object.keys(a.bossKills).filter(k=>a.bossKills[k] > 0).length;
    case 'types': return ACHV_TYPES.filter(t=>achvRaw(a,t) > 0).length;
    case 'maxAlert': return a.maxAlert || 0;
    case 'maxTime': return a.maxTime || 0;
    case 'maxLevel': return a.maxLevel || 0;
    case 'chain': return a.maxChain || 0;
    case 'maxCombo': return a.maxCombo || 0;
    case 'bossType': return a.bossKills[g.key] || 0;
  }
  return 0;
}

function getAchvBuffs(a){
  const b = { dmg:0, fire:0, xp:0, frag:0, hp:0 };
  ACHV_GLOBALS.forEach(g=>{ if (a.glob[g.id]) for (const k in g.buff) b[k] += g.buff[k]; });
  return b;
}

function applyAchvBuffs(stats, a){
  const b = getAchvBuffs(a);
  stats.damage *= 1 + b.dmg; stats.fireRate /= 1 + b.fire; stats.xpBonus += b.xp;   // fireRate = délai en ms: plus de cadence = délai plus court
  stats.fragmentBonus += b.frag; stats.maxHp *= 1 + b.hp;
}

function setAchv(a){ try { localStorage.setItem(ACHV_KEY, JSON.stringify(a)); } catch(e){ /* ignore */ } }

function getAchv(){
  let a = null;
  try { a = JSON.parse(localStorage.getItem(ACHV_KEY) || 'null'); } catch(e){ a = null; }
  if (a && typeof a === 'object' && a.killsAlert) {
    a.tier = a.tier || {}; a.glob = a.glob || {}; a.bossKills = a.bossKills || {};
    a.rawTotal = a.rawTotal || 0; a.alertKills = a.alertKills || 0; a.bossTotal = a.bossTotal || 0;
    a.maxAlert = a.maxAlert || 0; a.maxTime = a.maxTime || 0; a.maxLevel = a.maxLevel || 0; a.maxChain = a.maxChain || 0; a.maxCombo = a.maxCombo || 0;
    Object.keys(a.killsAlert).forEach(k=>{ while (a.killsAlert[k].length < ACHV_W.length) a.killsAlert[k].push(0); });   // anciennes sauvegardes (8 niveaux)
    return a;
  }
  // première fois: on reprend les kills déjà comptés par le bestiaire (considérés comme faits en alerte 1)
  const best = getBestiary().kills || {};
  a = { killsAlert:{}, tier:{}, glob:{}, bossKills:{}, rawTotal:0, alertKills:0, bossTotal:0, maxAlert:0, maxTime:0, maxLevel:0, maxChain:0 };
  Object.keys(best).forEach(k=>{
    const n = best[k] || 0;
    if (k === 'boss' || k.indexOf('boss_') === 0){ a.bossKills[k] = n; a.bossTotal += n; return; }
    a.rawTotal += n;
    if (ACHV_TYPES.indexOf(k) >= 0){ a.killsAlert[k] = newKillArr(); a.killsAlert[k][0] = n; }
  });
  ACHV_GLOBALS.forEach(g=>{ if (achvGlobalProgress(a,g) >= g.need) a.glob[g.id] = true; });
  setAchv(a);
  return a;
}

// clé de compteur de kills d'un ennemi (le Dreadnought garde 'boss' pour la compatibilité des sauvegardes)
function bestiaryKeyFor(enemy){
  if (enemy.enemyType === 'boss' && enemy.bossId && enemy.bossId !== 'dread') return 'boss_' + enemy.bossId;
  return enemy.enemyType;
}
