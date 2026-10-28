const EVENT_PARAMS = {
  crystal: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:20 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:35 },
    { key:'tickMs', label:'Cadence', min:50, max:5000, step:10, unit:'ms', def:360 },
    { key:'perTick', label:'Cristaux par tic', min:0, max:20, step:1, unit:'cristaux', int:true, def:(a)=>1 + Math.floor(a/3) },
    { key:'bigChance', label:'Chance de gros cristal', min:0, max:1, step:0.05, unit:'proba', def:0.2 },
    { key:'fallMin', label:'Chute mini', min:20, max:400, step:5, unit:'px/s', def:90 },
    { key:'fallMax', label:'Chute maxi', min:20, max:400, step:5, unit:'px/s', def:130 },
  ],
  meteors: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:35 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:50 },
    { key:'tickMs', label:'Cadence', min:50, max:5000, step:10, unit:'ms', def:(a)=>Math.max(300, 700 - 18*(a-1)) },
    { key:'perTick', label:'Météorites par tic', min:0, max:20, step:1, unit:'météorites', int:true, def:(a)=>1 + Math.floor(a/3) },
    { key:'speedMin', label:'Vitesse mini', min:20, max:800, step:5, unit:'px/s', def:190 },
    { key:'speedMax', label:'Vitesse maxi', min:20, max:800, step:5, unit:'px/s', def:270 },
  ],
  swarm: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:14 },
    { key:'tickMs', label:'Cadence', min:50, max:5000, step:10, unit:'ms', def:(a)=>Math.max(250, 420 - 12*a) },
    { key:'perWave', label:'Essaimeurs par vague', min:1, max:100, step:1, unit:'ennemis', int:true, def:(a)=>10 + 3*a },
  ],
  mines: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:20 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:40 },
    { key:'tickMs', label:'Cadence', min:50, max:10000, step:10, unit:'ms', def:1000 },
    { key:'perTick', label:'Mines par tic', min:0, max:20, step:1, unit:'mines', int:true, def:(a)=>1 + Math.floor(a/3) },
  ],
  goldrush: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:5 },
    { key:'count', label:'Trésorins', min:1, max:30, step:1, unit:'trésorins', int:true, def:(a)=>3 + Math.floor(a/3) },
    { key:'gapMs', label:'Écart entre trésorins', min:50, max:5000, step:10, unit:'ms', def:(a)=>Math.max(400, 1100 - 60*a) },
  ],
  kamikaze: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:4 },
    { key:'count', label:'Kamikazes', min:1, max:60, step:1, unit:'ennemis', int:true, def:(a)=>6 + a },
    { key:'gapMs', label:'Écart entre kamikazes', min:20, max:2000, step:10, unit:'ms', def:(a)=>Math.max(120, 260 - 8*a) },
    { key:'omniAlert', label:'Alerte : arrivée de partout', min:1, max:30, step:1, unit:'alerte', int:true, def:5 },
  ],
  spiders: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:25 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:55 },
    { key:'tickMs', label:'Cadence', min:100, max:10000, step:10, unit:'ms', def:650 },
    { key:'firstGroup', label:'Araignées par groupe initial', min:1, max:40, step:1, unit:'araignées', int:true, def:(a)=>5 + Math.floor(a/2) },
    { key:'perWave', label:'Araignées par vague', min:1, max:40, step:1, unit:'araignées', int:true, def:(a)=>3 + Math.floor(a/2) },
  ],
  elite: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:4 },
    { key:'elites', label:'Élites', min:1, max:30, step:1, unit:'élites', int:true, def:(a)=>3 + Math.floor(a/2) },
    { key:'healers', label:'Soigneurs', min:0, max:20, step:1, unit:'soigneurs', int:true, def:(a)=>1 + Math.floor(a/4) },
  ],
  bombard: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:11 },
    { key:'tickMs', label:'Cadence', min:100, max:5000, step:10, unit:'ms', def:(a)=>Math.max(380, 620 - 18*a) },
    { key:'radius', label:'Rayon des impacts', min:10, max:300, step:1, unit:'px', def:(a)=>55 + 3*Math.min(a, 10) },
    { key:'damage', label:'Dégâts', min:0, max:100, step:1, unit:'dégâts', def:(a)=>8 + a },
    { key:'extra', label:'Impacts en plus par tic', min:0, max:20, step:1, unit:'impacts', int:true, def:(a)=>Math.floor(a/3) },
    { key:'nearChance', label:'Chance de viser le joueur', min:0, max:1, step:0.05, unit:'proba', def:0.6 },
  ],
  frenzy: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:30 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:60 },
    { key:'xpMul', label:'Multiplicateur d\'XP', min:0.1, max:10, step:0.1, unit:'x', def:2 },
    { key:'spawnMul', label:'Délai des apparitions', min:0.1, max:2, step:0.05, unit:'x', def:0.55 },
  ],
  flip: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:20 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:60 },
  ],
  nebula: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:35 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:65 },
  ],
  bossbonus: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:1.5 },
  ],
  minibh: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:30 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:50 },
    { key:'tickMs', label:'Cadence', min:200, max:20000, step:50, unit:'ms', def:3200 },
    { key:'maxWells', label:'Trous noirs simultanés', min:1, max:12, step:1, unit:'trous', int:true, def:(a)=>2 + Math.floor(a/4) },
    { key:'radius', label:'Rayon d\'attraction', min:50, max:800, step:5, unit:'px', def:210 },
    { key:'strength', label:'Force d\'attraction', min:100, max:5000, step:50, unit:'force', def:1000 },
    { key:'life', label:'Durée de vie', min:2, max:120, step:1, unit:'s', def:12 },
    { key:'dmg', label:'Dégâts de base au centre', min:0, max:100, step:1, unit:'dégâts', def:6 },
  ],
  bigbh: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:30 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:50 },
    { key:'radius', label:'Rayon d\'attraction', min:100, max:1200, step:10, unit:'px', def:560 },
    { key:'strength', label:'Force d\'attraction', min:100, max:5000, step:50, unit:'force', def:1500 },
    { key:'dmg', label:'Dégâts de base au centre', min:0, max:100, step:1, unit:'dégâts', def:10 },
  ],
  corridor: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:35 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:55 },
    { key:'speed', label:'Vitesse de défilement', min:50, max:600, step:5, unit:'px/s', def:170 },
    { key:'minWidth', label:'Largeur mini', min:80, max:500, step:5, unit:'px', def:190 },
    { key:'shrink', label:'Rétrécissement par alerte', min:0, max:30, step:0.5, unit:'px', def:5 },
    { key:'wallDmg', label:'Dégâts de paroi', min:0, max:50, step:1, unit:'dégâts', def:3 },
  ],
  eclipse: [
    { key:'durMin', label:'Durée mini', min:3, max:300, step:1, unit:'s', def:17 },
    { key:'durMax', label:'Durée maxi', min:3, max:300, step:1, unit:'s', def:28 },
  ],
  emp: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:7.5 },
    { key:'blackout', label:'Systèmes coupés', min:1, max:30, step:0.5, unit:'s', def:5.5 },
  ],
  statik: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:12 },
    { key:'tickMs', label:'Cadence', min:300, max:20000, step:50, unit:'ms', def:(a)=>Math.max(1300, 2500 - 80*a) },
    { key:'strikes', label:'Points de foudre', min:2, max:20, step:1, unit:'points', int:true, def:(a)=>3 + Math.floor(a/4) },
    { key:'damage', label:'Dégâts', min:0, max:100, step:1, unit:'dégâts', def:(a)=>9 + a },
    { key:'radius', label:'Rayon des impacts', min:10, max:200, step:1, unit:'px', def:46 },
  ],
  ice: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:14 },
    { key:'slide', label:'Glissade des ennemis', min:0, max:1000, step:10, unit:'px/s', def:220 },
  ],
  shieldwall: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:3 },
    { key:'cols', label:'Colonnes', min:3, max:12, step:1, unit:'colonnes', int:true, def:7 },
    { key:'rows', label:'Lignes', min:1, max:6, step:1, unit:'lignes', int:true, def:(a)=>Math.max(1, Math.min(6, 1 + Math.floor((a - 4)/2))) },
    { key:'speed', label:'Vitesse latérale', min:5, max:300, step:1, unit:'px/s', def:(a)=>36 + 3*a },
    { key:'fireMin', label:'Premier tir mini', min:200, max:10000, step:50, unit:'ms', def:1800 },
    { key:'fireMax', label:'Premier tir maxi', min:200, max:10000, step:50, unit:'ms', def:3200 },
  ],
  plasma: [
    { key:'dur', label:'Durée', min:0.5, max:300, step:0.5, unit:'s', def:11 },
    { key:'crossSec', label:'Traversée de l\'écran', min:2, max:60, step:0.5, unit:'s', def:10.5 },
    { key:'shotMs', label:'Cadence de tir', min:100, max:5000, step:10, unit:'ms', def:520 },
    { key:'perShot', label:'Tirs par salve', min:1, max:60, step:1, unit:'tirs', int:true, def:(a)=>10 + Math.floor(a/2) },
    { key:'bulletSpeed', label:'Vitesse des tirs', min:20, max:600, step:5, unit:'px/s', def:(a)=>130 + a*4 },
    { key:'bulletDmg', label:'Dégâts des tirs', min:0, max:100, step:1, unit:'dégâts', def:(a)=>5 + Math.floor(a/2) },
    { key:'contactDmg', label:'Dégâts au contact', min:0, max:100, step:1, unit:'dégâts', def:(a)=>12 + a },
  ],
};

// valeur d'un paramètre pour la scène : params de l'événement programmé en cours > eventTune du niveau > valeur d'origine (selon l'alerte)
function evParam(sc, kind, key){
  const rows = EVENT_PARAMS[kind], row = rows && rows.find(r=> r.key === key);
  if (!row) throw new Error('evParam : paramètre inconnu ' + kind + '.' + key);
  let v;
  if (sc){
    for (const slot of ['curEvent', 'curSmall']){ const ev = sc[slot]; if (ev && ev.kind === kind && ev.params && Number.isFinite(ev.params[key])){ v = ev.params[key]; break; } }
    if (v === undefined){ const t = sc.lvDef && sc.lvDef.eventTune && sc.lvDef.eventTune[kind]; if (t && Number.isFinite(t[key])) v = t[key]; }
  }
  if (v === undefined) v = typeof row.def === 'function' ? row.def(sc ? sc.alertLevel : 1) : row.def;
  return row.int ? Math.round(v) : v;
}

// durées en ms : tirée entre durMin et durMax (secondes), ou fixe (dur)
function evDurRange(sc, kind){ const lo = Math.round(evParam(sc, kind, 'durMin')*1000); return Phaser.Math.Between(lo, Math.max(lo, Math.round(evParam(sc, kind, 'durMax')*1000))); }
function evDur(sc, kind){ return Math.round(evParam(sc, kind, 'dur')*1000); }
