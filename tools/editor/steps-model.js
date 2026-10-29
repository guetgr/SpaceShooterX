"use strict";
// Modèle des « étapes » de l'éditeur de niveaux : sans DOM, chargeable dans le navigateur (globalThis.EditorSteps) et dans node (module.exports).
//   buildSteps(doc, catalogs) -> Step[]   avec   Step  = { id, title, text, fields: Field[] }
//     Field = { path:(string|number)[], kind:'number'|'numlist'|'select'|'text'|'textlist'|'objlist'|'bool', label, help?, def, optional,
//               min?, max?, step?, unit?, int?, len? (numlist), ordered? (numlist : true/'asc' = croissant, 'desc' = décroissant), options? ([{value,label}] select / choix d'un textlist), max? (textlist : nombre de lignes),
//               item? ([{key,kind,label,options?}] objlist), defByAlert? (le défaut dépend de l'alerte : jamais effacé en retombant dessus), group? (sous-bloc) }
//   applyFieldValue(doc, field, value) -> nouveau document (copie), lève une Error si la valeur est invalide.
//   catalogs = { eventCatalog, decorCatalog, musicCatalog, tunablesCatalog, mobCatalog, base? } (tous facultatifs ; base = document d'origine pour les défauts).
// Source unique des réglages du tuto : TUTO_SCHEMA (ancien tableau d'editor.html), chemins ['tutorial', groupe, clé].
(function(root){
  const clone = o=> JSON.parse(JSON.stringify(o));
  const same = (a, b)=> JSON.stringify(a) === JSON.stringify(b);

  /* ---------- schéma des réglages du tuto : [clé, libellé, min, max, pas, unité, aide] ---------- */
  const TUTO_SCHEMA = [
    { g:'Étapes pédagogiques', k:'steps', open:true, f:[
      ['moveNeed', 'Étape 1 · distance à parcourir', 100, 1500, 10, 'px', 'Distance que le joueur doit parcourir pour valider « déplace-toi »'],
      ['satTarget', 'Étape 2 · satellites à détruire', 4, 40, 1, '', 'Fin de l\'étape « tirer ». Sert aussi d\'objectif de finition (satellites détruits)'],
      ['bossWait', 'Délai avant le boss', 1, 10, 0.1, 's', 'Entre l\'alerte et l\'arrivée du boss'],
      ['maxMove', 'Durée max · étape 1', 5, 90, 1, 's', 'Au-delà, on passe à la suite même sans avoir réussi'],
      ['maxShoot', 'Durée max · étape 2', 10, 180, 1, 's', ''],
    ]},
    { g:'Satellites', k:'sats', open:true, f:[
      ['hp', 'Points de vie', 5, 200, 1, '', 'Un tir de base fait ~14 dégâts'],
      ['speedMin', 'Vitesse de chute min', 20, 250, 5, 'px/s', ''], ['speedMax', 'Vitesse de chute max', 20, 300, 5, 'px/s', ''],
      ['slowSpeed', 'Vitesse du 1er satellite (étape 2)', 10, 150, 5, 'px/s', 'Lent exprès pour apprendre à viser'],
      ['drift', 'Dérive latérale', 0, 100, 1, 'px/s', ''], ['score', 'Score par satellite', 0, 200, 1, '', ''],
      ['contactDmg', 'Dégâts au contact', 0, 50, 1, '', 'Quand un satellite percute le vaisseau'],
      ['spawnCdStart', 'Intervalle d\'apparition · début', 300, 4000, 50, 'ms', 'Étape 4 : l\'intervalle passe de « début » à « fin »'], ['spawnCdEnd', 'Intervalle d\'apparition · fin', 200, 4000, 50, 'ms', ''],
      ['rampTime', 'Durée de la montée en cadence', 5, 120, 1, 's', ''],
      ['capBase', 'Satellites simultanés · départ', 1, 12, 1, '', ''], ['capExtra', 'Satellites simultanés · en plus', 0, 12, 1, '', 'Ajoutés progressivement'], ['capEvery', 'Un de plus toutes les', 3, 60, 1, 's', ''],
    ]},
    { g:'Débris', k:'debris', f:[
      ['min', 'Nombre min', 0, 20, 1, '', ''], ['max', 'Nombre max', 0, 30, 1, '', ''], ['dmg', 'Dégâts', 0, 40, 1, '', ''],
      ['speedMin', 'Vitesse min', 20, 400, 5, 'px/s', ''], ['speedMax', 'Vitesse max', 20, 500, 5, 'px/s', ''],
    ]},
    { g:'Boss · général', k:'boss', f:[
      ['hp', 'Points de vie', 100, 4000, 10, '', 'Le plus gros levier de durée du combat'],
      ['p2', 'Phase 2 sous', 0.1, 0.95, 0.01, '× PV', 'Fraction de PV restants qui déclenche la phase 2'], ['p3', 'Phase 3 sous', 0.05, 0.9, 0.01, '× PV', ''],
      ['contactDmg', 'Dégâts au contact', 0, 60, 1, '', ''], ['killScore', 'Score à la mort', 0, 2000, 10, '', ''],
    ]},
    { g:'Boss · tirs visés', k:'boss', f:[
      ['aimCd', 'Cadence (phases 1-2)', 400, 4000, 50, 'ms', ''], ['aimCd3', 'Cadence (phase 3)', 300, 4000, 50, 'ms', ''], ['aimDmg', 'Dégâts', 0, 40, 1, '', ''], ['aimSpeed', 'Vitesse', 60, 500, 5, 'px/s', ''],
    ]},
    { g:'Boss · anneau', k:'boss', f:[
      ['ringCd', 'Cadence', 1500, 9000, 50, 'ms', ''], ['ringCount', 'Nombre de balles', 6, 40, 1, '', ''], ['ringGap', 'Largeur de la brèche', 1, 8, 1, 'balles', 'Plus c\'est grand, plus c\'est facile de passer'],
      ['ringDmg', 'Dégâts', 0, 40, 1, '', ''], ['ringSpeed', 'Vitesse', 40, 400, 5, 'px/s', ''],
    ]},
    { g:'Boss · pluie (phase 2+) et spirale (phase 3)', k:'boss', f:[
      ['rainCd', 'Pluie · cadence', 600, 6000, 50, 'ms', ''], ['rainDmg', 'Pluie · dégâts', 0, 40, 1, '', ''], ['rainSpeed', 'Pluie · vitesse', 60, 500, 5, 'px/s', ''],
      ['spiralCd', 'Spirale · cadence', 60, 1000, 10, 'ms', 'Plus petit = plus dense'], ['spiralDmg', 'Spirale · dégâts', 0, 40, 1, '', ''], ['spiralSpeed', 'Spirale · vitesse', 40, 400, 5, 'px/s', ''],
    ]},
    { g:'Finition (%)', k:'comp', open:true, f:[
      ['sats', 'Poids · satellites détruits', 0, 100, 1, '', 'Les poids sont ramenés à un total de 100'], ['boss', 'Poids · boss endommagé', 0, 100, 1, '', ''],
      ['win', 'Poids · boss vaincu', 0, 100, 1, '', ''], ['clean', 'Poids · sans te faire toucher', 0, 100, 1, '', ''],
      ['hitPenalty', 'Perte par coup reçu', 0, 1, 0.05, '', '0,25 = 4 coups font perdre tout l\'objectif « sans te faire toucher »'],
    ]},
    { g:'Récompenses des paliers de finition', k:'rewards', f:[
      ['m25', 'Palier 25 %', 0, 200, 1, '◆', ''], ['m50', 'Palier 50 %', 0, 200, 1, '◆', ''], ['m75', 'Palier 75 %', 0, 200, 1, '◆', ''], ['m100', 'Palier 100 %', 0, 500, 1, '◆', ''],
    ]},
  ];
  const TUTO_META = {};
  TUTO_SCHEMA.forEach(g=> g.f.forEach(([key, label, min, max, step, unit, help])=>{ TUTO_META[g.k + '.' + key] = { group:g.k, key, label, min, max, step, unit, help }; }));
  // étape du tuto -> réglages ('groupe.clé') qui y sont rattachés
  const TUTO_STEP_KEYS = {
    move:    ['steps.moveNeed', 'steps.maxMove'],
    sat:     ['sats.hp', 'sats.speedMin', 'sats.speedMax', 'sats.slowSpeed', 'sats.drift', 'sats.score', 'sats.contactDmg', 'sats.spawnCdStart', 'sats.spawnCdEnd', 'sats.rampTime', 'sats.capBase', 'sats.capExtra', 'sats.capEvery'],
    destroy: ['debris.min', 'debris.max', 'debris.dmg', 'debris.speedMin', 'debris.speedMax', 'steps.satTarget', 'steps.maxShoot'],
    alert:   ['steps.bossWait', 'boss.hp', 'boss.contactDmg', 'boss.killScore'],
    phase1:  ['boss.aimCd', 'boss.aimDmg', 'boss.aimSpeed', 'boss.ringCd', 'boss.ringCount', 'boss.ringGap', 'boss.ringDmg', 'boss.ringSpeed'],
    phase2:  ['boss.p2', 'boss.rainCd', 'boss.rainDmg', 'boss.rainSpeed'],
    phase3:  ['boss.p3', 'boss.aimCd3', 'boss.spiralCd', 'boss.spiralDmg', 'boss.spiralSpeed'],
    report:  ['comp.sats', 'comp.boss', 'comp.win', 'comp.clean', 'comp.hitPenalty', 'rewards.m25', 'rewards.m50', 'rewards.m75', 'rewards.m100'],
  };

  // boss de fin / mobs spéciaux -> id du registre TUNABLES (src/data/tunables.js)
  const BOSS_TUNE_ID = { araignee:'ar', meteo:'mt', reacteur:'rx', anneau:'an', pdg:'pd' };
  const MOB_TUNE_ID = { bras:'bras', pilleur:'pil', eclaireur:'ec' };
  const TUNE_LABEL = { ar:'Araignée de tri', mt:'La Météo', rx:'Le Réacteur', an:'L\'Anneau', pd:'Le PDG dans sa tour', bras:'Bras écartés', pil:'Pilleur de cristaux', ec:'Éclaireur de patrouille' };
  const NORMA_POOL_LABEL = { start:'Début de mission', boss:'Arrivée du boss', progress:'Avancement', banter:'Vannes', lowhp:'Coque faible', win:'Victoire', lose:'Défaite' };
  const NORMA_WHEN = [['levelStart', 'Début de mission'], ['time', 'À une date (s)'], ['eventStart', 'Début d\'un événement'], ['eventEnd', 'Fin d\'un événement'], ['bossStart', 'Arrivée du boss'], ['win', 'Victoire'], ['lose', 'Défaite']];
  const NORMA_TUTO_KEYS = ['move', 'shoot', 'boss', 'aim', 'ring', 'p2', 'p3', 'win', 'lose'];
  const MOB_FIELDS = [['hpMul', 'PV ×', 'hp', 'PV'], ['dmgMul', 'Dégâts ×', 'dmg', 'dégâts de contact'], ['speedMul', 'Vitesse ×', 'speed', 'px/s'], ['scoreMul', 'Score ×', 'score', 'points']];

  /* ---------- chemins ---------- */
  const hasOwn = (o, k)=> Object.prototype.hasOwnProperty.call(o, k);
  const FORBIDDEN = ['__proto__', 'constructor', 'prototype'];
  const checkPath = path=> path.forEach(k=> { if (FORBIDDEN.indexOf(k) >= 0) throw new Error('chemin interdit : ' + k); });
  function getByPath(o, path){ return path.reduce((a, k)=> (a == null || typeof a !== 'object' || !hasOwn(a, k) ? undefined : a[k]), o); }
  function setPath(o, path, v){
    checkPath(path);
    let c = o;
    for (let i = 0; i < path.length - 1; i++){
      const k = path[i];
      if (!hasOwn(c, k) || c[k] == null){ if (typeof path[i + 1] === 'number') throw new Error('chemin sans tableau : ' + path.join('.')); c[k] = {}; }
      c = c[k];
    }
    c[path[path.length - 1]] = v;
  }
  function removePath(o, path){
    checkPath(path);
    const parent = getByPath(o, path.slice(0, -1));
    if (parent == null || typeof parent !== 'object') return;
    delete parent[path[path.length - 1]];
    for (let i = path.length - 2; i >= 0; i--){          // conteneurs objets devenus vides : supprimés (jamais la racine, jamais un tableau)
      const c = getByPath(o, path.slice(0, i + 1));
      if (c && typeof c === 'object' && !Array.isArray(c) && !Object.keys(c).length){ const p = getByPath(o, path.slice(0, i)); if (Array.isArray(p)) break; delete p[path[i]]; } else break;
    }
  }

  /* ---------- constructeurs de champs ---------- */
  const N = (path, label, min, max, step, unit, help, def, x)=> Object.assign({ path, kind:'number', label, min, max, step, unit:unit || '', help:help || '', def, optional:false }, x);
  const baseOf = (catalogs, doc)=> (catalogs && catalogs.base) || doc;
  const evName = (catalogs, kind)=> { const e = ((catalogs && catalogs.eventCatalog) || []).find(x=> x.id === kind); return e ? e.name : kind; };

  // types connus d'ENEMY_STATS (src/data/enemy-stats.js) : repli quand mobCatalog est absent (le test vérifie l'égalité avec le registre)
  const KNOWN_MOBS = ['grunt', 'shooter', 'drone', 'tank', 'swarmer', 'diver', 'turret', 'splitter', 'splitterMini', 'shieldedGrunt', 'mine', 'sat', 'satgun', 'bras', 'pilleur', 'eclaireur', 'bomber', 'sniper', 'healer', 'ghost', 'elite', 'mothership', 'vortex', 'golden', 'kamikaze', 'spider', 'mineDeployed', 'charo'];
  function mobTypes(doc, catalogs){
    const cat = (catalogs && catalogs.mobCatalog) || [], known = cat.length ? cat.map(m=> m.type) : KNOWN_MOBS, seen = [];
    (doc.spawns || []).concat(doc.waves || []).forEach(r=>{ if (r && typeof r.type === 'string' && known.indexOf(r.type) >= 0 && seen.indexOf(r.type) < 0) seen.push(r.type); });
    return seen;
  }
  function bossIds(doc){
    const ids = [];
    const add = id=>{ if (id && ids.indexOf(id) < 0) ids.push(id); };
    add(hasOwn(BOSS_TUNE_ID, doc.finalBoss) ? BOSS_TUNE_ID[doc.finalBoss] : null);
    mobTypes(doc).forEach(t=> add(hasOwn(MOB_TUNE_ID, t) ? MOB_TUNE_ID[t] : null));
    if (doc.finalBoss === 'anneau') add('ec');          // les baies de L'Anneau sortent des éclaireurs
    return ids;
  }

  /* ---------- étapes ---------- */
  function introStep(doc, catalogs){
    const base = baseOf(catalogs, doc), decor = (catalogs && catalogs.decorCatalog) || [], music = (catalogs && catalogs.musicCatalog) || { level:[], boss:[] };
    const bgOptions = [{ value:null, label:'Planètes au hasard' }].concat(decor.map(d=> ({ value:d.kind, label:d.label })));
    const key = x=> ({ value:x, label:x });
    const text = (doc.intro === 'earth' ? 'Décollage planète' : 'Décollage court') + ' · fond ' + (doc.bg || 'planète aléatoire') + ' · zoom ' + doc.zoom.start.toFixed(2) + ' → ' + doc.zoom.end.toFixed(2) + ' en ' + doc.zoom.seconds + ' s' + (doc.tuto ? ' (temps de partie).' : ' (selon progression).');
    const fields = [
      { path:['intro'], kind:'select', label:'Introduction', help:'Décollage planète ou court', def:base.intro === undefined ? null : base.intro, optional:false, options:[{ value:null, label:'Décollage court' }, { value:'earth', label:'Décollage planète' }] },
      N(['zoom', 'start'], 'Zoom · départ', 0.3, 3, 0.01, '×', 'Zoom de la caméra au début de la mission', base.zoom.start),
      N(['zoom', 'end'], 'Zoom · arrivée', 0.3, 3, 0.01, '×', 'Zoom de la caméra à la fin du trajet', base.zoom.end),
      N(['zoom', 'seconds'], 'Zoom · durée', 5, 600, 0.5, 's', doc.tuto ? 'Temps de partie' : 'Durée du trajet de zoom', base.zoom.seconds),
      { path:['bg'], kind:'select', label:'Décor', help:'Fond de niveau', def:base.bg === undefined ? null : base.bg, optional:false, options:bgOptions },
      { path:['audio', 'level'], kind:'textlist', label:'Musique de l\'ordre', help:'1 ou 2 morceaux ; vide = musique d\'origine', def:[], optional:true, max:2, options:(music.level || []).map(key) },
      { path:['audio', 'boss'], kind:'select', label:'Musique du boss', help:'Vide = musique d\'origine', def:'', optional:true, options:[{ value:'', label:'(origine)' }].concat((music.boss || []).map(key)) },
    ];
    // le tuto a sa propre musique (src/audio/scene-audio.js : audio n'est lu que hors tuto)
    return { id:'intro', title:'INTRO / CAMERA', text, fields:doc.tuto ? fields.filter(f=> f.path[0] !== 'audio') : fields };
  }
  // date d'arrivée du boss SANS surcharge `bossAt` : même règle que src/data/boss-arrival.js (dernière vague + 5 s, fin du dernier événement ; 1,5 s pour un ordre « boss »)
  function autoBossAt(doc){
    if (doc.type === 'boss') return 1.5;
    let t = 0;
    (doc.waves || []).forEach(w=> { t = Math.max(t, w.at + ((w.count || 1) - 1)*(w.spacing || 0) + 5); });
    (doc.events || []).forEach(e=> { t = Math.max(t, e.at + (e.duration == null ? 15 : e.duration)); });
    return Math.max(t, 1.5);
  }
  const fmtSec = t=> Math.floor(t/60) + ':' + String(Math.round(t%60)).padStart(2, '0');
  function objectiveStep(doc, catalogs){
    const base = baseOf(catalogs, doc), f = [];
    const tid = hasOwn(BOSS_TUNE_ID, doc.finalBoss) ? BOSS_TUNE_ID[doc.finalBoss] : null, name = (tid && TUNE_LABEL[tid]) || (doc.boss ? 'boss ' + doc.boss : 'aucun boss');
    const manual = typeof doc.bossAt === 'number', at = manual ? doc.bossAt : autoBossAt(doc);
    let text = 'Vaincre le boss : ' + name + (doc.type === 'boss' ? ' · arrive dès le départ' : ' · arrive à ' + fmtSec(at) + (manual ? ' (fixé à la main)' : ' (après les autres mobs de la timeline)'));
    text += ' · menace ' + doc.threat + '.';
    if (doc.type !== 'boss') f.push(N(['bossAt'], 'Arrivée du boss', 1, 3600, 0.5, 's', 'Automatique : après la dernière vague et le dernier événement de la timeline. Une autre valeur fixe la date à la main (le bloc Boss de la timeline se glisse aussi).', autoBossAt(doc), { optional:true }));
    f.push(N(['threat'], 'Menace', 1, 20, 1, '', 'Niveau d\'alerte du niveau : puissance des ennemis et des armes', base.threat, { int:true }));
    f.push(N(['hpMul'], 'PV des ennemis ×', 0.2, 5, 0.05, '×', 'Réglage fin de la difficulté, en plus de la menace', base.hpMul));
    f.push(N(['dmgMul'], 'Dégâts des ennemis ×', 0.2, 5, 0.05, '×', '', base.dmgMul));
    return { id:'objective', title:'MISSION', text, fields:f };
  }
  function mobsStep(doc, catalogs){
    const cat = (catalogs && catalogs.mobCatalog) || [], types = mobTypes(doc, catalogs), f = [];
    types.forEach(type=>{
      const m = cat.find(x=> x.type === type) || { type, label:type };
      MOB_FIELDS.forEach(([key, label, stat, unit])=>{
        const b = m[stat];
        f.push(N(['mobs', type, key], label, 0.1, 10, 0.05, '×', b === undefined ? 'Multiplicateur de la valeur d\'origine' : 'Valeur d\'origine : ' + (Math.round(b * 100) / 100) + ' ' + unit, 1, { optional:true, group:m.label || type }));
      });
    });
    return { id:'mobs', title:'MOBS', text:types.length ? 'Types dans le tirage : ' + types.join(', ') + '. Multiplicateurs de la valeur d\'origine ; activation et poids : pools ci-dessus.' : 'Aucun mob dans le tirage de cet ordre.', fields:f };
  }
  function eventNormaFields(i){
    return [
      { path:['events', i, 'norma', 'start'], kind:'text', label:'N.O.R.M.A. · début', help:'Texte à l\'arrivée de l\'événement ; vide = aucun', def:'', optional:true, maxLength:140, noAngle:true },
      { path:['events', i, 'norma', 'end'], kind:'text', label:'N.O.R.M.A. · fin', help:'Texte à la fin de l\'événement ; vide = aucun', def:'', optional:true, maxLength:140, noAngle:true },
    ];
  }
  function eventSteps(doc, catalogs){
    const cat = (catalogs && catalogs.eventCatalog) || [];
    return (doc.events || []).map((e, i)=>{
      const def = cat.find(x=> x.id === e.kind), name = def ? def.name : e.kind;
      const f = [
        N(['events', i, 'at'], 'Déclenchement', 0, 3600, 1, 's', 'Minimum ; attente du slot libre et de la fin du boss', e.at),
        N(['events', i, 'duration'], 'Durée forcée', 0, 600, 1, 's', '0 = défaut de l\'événement ; sinon 0,1 s au moins', 0, { optional:true, minNonZero:0.1 }),
      ];
      ((def && def.params) || []).forEach(p=>{
        f.push(N(['events', i, 'params', p.key], p.label, p.min, p.max, p.step, p.unit, p.defByAlert ? 'Défaut variable selon l\'alerte (valeur affichée : alerte 1)' : '', p.def, { optional:true, int:!!p.int, defByAlert:!!p.defByAlert }));
      });
      if (!doc.tuto) eventNormaFields(i).forEach(x=> f.push(x));          // le tuto ignore les textes N.O.R.M.A. des événements (src/ui/norma.js : normaAnchor)
      return { id:'event-' + i, title:'EVENEMENT · ' + name, text:name + ' · ' + e.at + ' s minimum ; attente du slot libre et de la fin du boss. Durée : ' + (e.duration ? e.duration + ' s' : 'défaut de l’événement'), fields:f };
    });
  }
  function ambientStep(doc, catalogs){
    const base = baseOf(catalogs, doc), cat = (catalogs && catalogs.eventCatalog) || [];
    const f = [
      { path:['ambient', 'golden'], kind:'bool', label:'Trésorin aléatoire', help:'Actif après 25 s, réarmement 45–80 s', def:base.ambient.golden, optional:false },
      { path:['ambient', 'smallEvents'], kind:'bool', label:'Petits événements aléatoires', help:'Selon la menace, premier délai 20–35 s puis 30–60 s', def:base.ambient.smallEvents, optional:false },
    ];
    const kinds = doc.tuto ? [] : cat.filter(e=> e.small && (e.params || []).length);          // tuto : GameScene.lvDef est nul, eventTune n'y est pas lu
    kinds.forEach(e=> e.params.forEach(p=>{
      f.push(N(['eventTune', e.id, p.key], p.label, p.min, p.max, p.step, p.unit, p.defByAlert ? 'Défaut variable selon l\'alerte (valeur affichée : alerte 1)' : '', p.def, { optional:true, int:!!p.int, defByAlert:!!p.defByAlert, group:e.name }));
    }));
    return { id:'ambient', title:'EVENEMENTS ALEATOIRES', text:'Trésorin : ' + (doc.ambient.golden ? 'actif après 25 s, réarmement 45–80 s' : 'désactivé') + ' ; petits événements : ' + (doc.ambient.smallEvents ? 'actifs, selon menace, premier délai 20–35 s puis 30–60 s' : 'désactivés') + '. Les réglages par nature d\'événement valent aussi pour les événements programmés sans paramètre propre.', fields:f };
  }
  function tunableField(id, r){
    const common = { path:['bossTune', id, r.path], label:r.label, help:r.help || '', def:r.def, optional:true, group:TUNE_LABEL[id] || id, min:r.min, max:r.max, step:r.step, unit:r.unit || '' };
    return r.len ? Object.assign(common, { kind:'numlist', len:r.len, ordered:r.ordered || false }) : Object.assign(common, { kind:'number' });
  }
  function bossStep(doc, catalogs){
    const tc = (catalogs && catalogs.tunablesCatalog) || {}, ids = bossIds(doc), f = [];
    ids.forEach(id=> (tc[id] || []).forEach(r=> f.push(tunableField(id, r))));
    const name = doc.finalBoss || doc.boss;
    const text = (name ? 'Phases, attaques et renforts pilotés par le module ' + name + '. Les transitions réellement jouées figurent dans le journal.' : 'Pas de boss dans cet ordre.') + (ids.length ? ' Réglages : ' + ids.map(i=> TUNE_LABEL[i] || i).join(', ') + '.' : '');
    return { id:'boss', title:'COMBAT DU BOSS', text, fields:f };
  }
  function normaStep(doc, catalogs){
    const cat = (catalogs && catalogs.eventCatalog) || [], f = [];
    if (!doc.tuto) Object.keys(NORMA_POOL_LABEL).forEach(pool=> f.push({ path:['norma', pool], kind:'textlist', label:NORMA_POOL_LABEL[pool], help:'Vide = textes d\'origine de N.O.R.M.A. (1 à 20 lignes de 140 caractères)', def:[], optional:true, max:20, maxLength:140, noAngle:true }));
    if (!doc.tuto) f.push({ path:['norma', 'tickEvery'], kind:'numlist', len:2, ordered:true, label:'Intervalle des vannes et avancements', help:'Entre deux transmissions spontanées, mini et maxi', min:5, max:300, step:1, unit:'s', def:[40, 55], optional:true });
    if (doc.tuto) NORMA_TUTO_KEYS.forEach(k=> f.push({ path:['norma', 'tuto', k], kind:'text', label:'Consigne du tuto · ' + k, help:'Vide = texte d\'origine', def:'', optional:true, maxLength:140, noAngle:true }));
    if (!doc.tuto) f.push({ path:['norma', 'messages'], kind:'objlist', label:'Boîtes de dialogue', help:'Jusqu\'à 50 ; ref = nature d\'événement (eventStart / eventEnd), at = secondes (when = time)', def:[], optional:true, max:50,
      item:[{ key:'id', kind:'text', label:'Identifiant', required:true, unique:true, maxLength:40 }, { key:'when', kind:'select', label:'Quand', required:true, options:NORMA_WHEN.map(w=> ({ value:w[0], label:w[1] })) },
        { key:'at', kind:'number', label:'Date', min:0, max:3600, step:1, unit:'s', onlyIf:{ key:'when', values:['time'] } },
        { key:'ref', kind:'select', label:'Événement', options:cat.map(e=> ({ value:e.id, label:e.name })), onlyIf:{ key:'when', values:['eventStart', 'eventEnd'] } }, { key:'text', kind:'text', label:'Texte', required:true, maxLength:140, noAngle:true }] });
    return { id:'norma', title:'N.O.R.M.A.', text:doc.tuto ? 'Consignes du tutoriel, une par moment clé ; vide = texte d\'origine. Le tuto n\'utilise ni les réserves de textes ni les boîtes des missions.' : 'Transmissions du secteur, réactions au combat et au boss ; horaires dépendants de la partie. Réserve vide = textes d\'origine.', fields:f };
  }
  function reportStep(doc, catalogs){
    const base = baseOf(catalogs, doc);
    return { id:'report', title:'RAPPORT', text:doc.tuto ? 'Boss détruit → fin du tutoriel, finition et récompenses de paliers. Paramètres détaillés ci-dessous et dans le JSON.' : 'Victoire : ' + doc.reward.clear + ' ◆ ; première victoire : +' + doc.reward.first + ' ◆.', fields:[
      N(['reward', 'clear'], 'Récompense de victoire', 0, 500, 1, '◆', '', base.reward.clear),
      N(['reward', 'first'], 'Bonus de 1re victoire', 0, 1000, 1, '◆', '', base.reward.first),
    ] };
  }
  function tutoFields(keys, doc, catalogs){
    const base = baseOf(catalogs, doc);
    return keys.map(k=>{
      const m = TUTO_META[k];
      return N(['tutorial', m.group, m.key], m.label, m.min, m.max, m.step, m.unit, m.help, getByPath(base, ['tutorial', m.group, m.key]));
    });
  }
  function tutoSteps(doc, catalogs){
    const t = doc.tutorial, F = k=> tutoFields(TUTO_STEP_KEYS[k], doc, catalogs);
    const S = (id, title, text, k)=> ({ id, title, text, fields:F(k) });
    return [
      S('move', 'ETAPE 1 · BOUGER', 'N.O.R.M.A. « bouger » → ' + t.steps.moveNeed + ' px parcourus OU ' + t.steps.maxMove + ' s maximum.', 'move'),
      S('sat', 'ETAPE 2 · SATELLITE', doc.timelineOnly ? 'Vagues manuelles actives ; apparitions pédagogiques automatiques désactivées.' : 'Après BOUGER : premier satellite lent (' + t.sats.hp + ' PV, ' + t.sats.slowSpeed + ' px/s), puis cadence ' + t.sats.spawnCdStart + ' → ' + t.sats.spawnCdEnd + ' ms, plafond ' + t.sats.capBase + ' + ' + t.sats.capExtra + '.', 'sat'),
      S('destroy', 'DESTRUCTION SATELLITE', 'Chaque satellite détruit produit ' + t.debris.min + '–' + t.debris.max + ' débris, ' + t.debris.dmg + ' dégâts. Objectif : ' + t.steps.satTarget + ' satellites OU ' + t.steps.maxShoot + ' s maximum.', 'destroy'),
      S('alert', 'ALERTE / ANTENNE-MERE', 'Après TIRER : N.O.R.M.A. + alarme, attente ' + t.steps.bossWait + ' s, puis boss à ' + t.boss.hp + ' PV.', 'alert'),
      S('phase1', 'BOSS · PHASE 1', 'Tirs visés chaque ' + t.boss.aimCd + ' ms ; anneau chaque ' + t.boss.ringCd + ' ms. N.O.R.M.A. explique les premières attaques.', 'phase1'),
      S('phase2', 'BOSS · PHASE 2', 'Sous ' + Math.round(t.boss.p2 * 100) + ' % PV : pluie chaque ' + t.boss.rainCd + ' ms + tirs et anneaux.', 'phase2'),
      S('phase3', 'BOSS · PHASE 3', 'Sous ' + Math.round(t.boss.p3 * 100) + ' % PV : spirale chaque ' + t.boss.spiralCd + ' ms, tir visé ' + t.boss.aimCd3 + ' ms.', 'phase3'),
    ];
  }

  function buildSteps(doc, catalogs){
    catalogs = catalogs || {};
    if (doc.tuto){
      const rep = reportStep(doc, catalogs);
      rep.fields = tutoFields(TUTO_STEP_KEYS.report, doc, catalogs).concat(rep.fields);
      return [introStep(doc, catalogs)].concat(tutoSteps(doc, catalogs), eventSteps(doc, catalogs), [ambientStep(doc, catalogs), normaStep(doc, catalogs), rep]);
    }
    return [introStep(doc, catalogs), objectiveStep(doc, catalogs), mobsStep(doc, catalogs)].concat(eventSteps(doc, catalogs), [ambientStep(doc, catalogs), bossStep(doc, catalogs), normaStep(doc, catalogs), reportStep(doc, catalogs)]);
  }

  /* ---------- lecture / écriture d'un champ ---------- */
  function fieldValue(doc, field){ const v = getByPath(doc, field.path); return v === undefined ? field.def : v; }

  function checkNumber(field, v, what){
    if (typeof v !== 'number' || !isFinite(v)) throw new Error(field.label + ' : nombre requis');
    if (field.min !== undefined && v < field.min || field.max !== undefined && v > field.max) throw new Error(field.label + ' : ' + (what || 'nombre') + ' entre ' + field.min + ' et ' + field.max + ' requis');
    if (field.int && v !== Math.round(v)) throw new Error(field.label + ' : entier requis');
    if (field.minNonZero !== undefined && v !== 0 && v < field.minNonZero) throw new Error(field.label + ' : 0 ou au moins ' + field.minNonZero + ' requis');
  }
  function checkText(field, v){
    if (typeof v !== 'string' || v.length > (field.maxLength || 10000)) throw new Error(field.label + ' : texte de ' + (field.maxLength || 10000) + ' caractères au plus requis');
    if (field.noAngle && /[<>]/.test(v)) throw new Error(field.label + ' : les signes < et > sont interdits');
  }
  // un élément d'objlist : clés permises, champs obligatoires (required, ou onlyIf = obligatoire quand l'autre clé vaut l'une des valeurs), bornes, choix, unicité
  function checkItem(field, x, n, all){
    const items = field.item || [], at = field.label + ' · n° ' + (n + 1);
    Object.keys(x).forEach(k=> { if (!items.some(it=> it.key === k)) throw new Error(at + ' : clé inconnue « ' + k + ' »'); });
    items.forEach(it=>{
      const v = x[it.key], lab = Object.assign({}, it, { label:at + ' · ' + it.label });
      const need = it.required || (it.onlyIf && it.onlyIf.values.indexOf(x[it.onlyIf.key]) >= 0);
      if (v === undefined || v === null || v === ''){ if (need) throw new Error(lab.label + ' : requis'); return; }
      if (it.kind === 'text'){ checkText(lab, v); if (need && !v.trim()) throw new Error(lab.label + ' : requis'); }
      else if (it.kind === 'number') checkNumber(lab, v);
      else if (it.kind === 'select' && !(it.options || []).some(o=> o.value === v)) throw new Error(lab.label + ' : choix inconnu');
      if (it.unique && all.some((y, m)=> m < n && y[it.key] === v)) throw new Error(lab.label + ' : « ' + v + ' » déjà utilisé');
    });
  }
  function checkValue(field, v){
    switch (field.kind){
      case 'number': checkNumber(field, v); break;
      case 'numlist':
        if (!Array.isArray(v) || v.length !== field.len) throw new Error(field.label + ' : tableau de ' + field.len + ' nombres requis');
        v.forEach(x=> checkNumber(field, x));
        if (field.ordered === 'desc' && v.some((x, i)=> i && x > v[i - 1])) throw new Error(field.label + ' : valeurs décroissantes requises (paliers dans l\'ordre)');
        else if (field.ordered && field.ordered !== 'desc' && v.some((x, i)=> i && x < v[i - 1])) throw new Error(field.label + ' : valeurs croissantes requises');
        break;
      case 'select': if (!(field.options || []).some(o=> o.value === v)) throw new Error(field.label + ' : choix inconnu'); break;
      case 'bool': if (typeof v !== 'boolean') throw new Error(field.label + ' : booléen requis'); break;
      case 'text': checkText(field, v); break;
      case 'textlist':
        if (!Array.isArray(v) || v.some(x=> typeof x !== 'string')) throw new Error(field.label + ' : liste de textes requise');
        v.forEach(x=> checkText(field, x));
        if (field.max !== undefined && v.length > field.max) throw new Error(field.label + ' : ' + field.max + ' lignes au plus');
        if (field.options && v.some(x=> !field.options.some(o=> o.value === x))) throw new Error(field.label + ' : choix inconnu');
        break;
      case 'objlist': if (!Array.isArray(v) || (field.max !== undefined && v.length > field.max) || v.some(x=> !x || typeof x !== 'object' || Array.isArray(x))) throw new Error(field.label + ' : liste d\'objets requise');
        v.forEach((x, n)=> checkItem(field, x, n, v));
        break;
      default: throw new Error('genre de champ inconnu : ' + field.kind);
    }
  }
  // Copie du document avec la valeur écrite ; valeur = défaut d'un champ facultatif (ou null pour un défaut dépendant de l'alerte) : la clé disparaît, et les objets vides avec elle.
  function applyFieldValue(doc, field, value){
    const reset = !!field.defByAlert && value == null;
    if (!reset){
      if (field.kind === 'textlist' && Array.isArray(value)) value = value.filter(x=> typeof x !== 'string' || x.trim() !== '');
      checkValue(field, value);
    }
    const out = clone(doc);
    if (field.optional && (reset || (!field.defByAlert && same(value, field.def)))){ removePath(out, field.path); return out; }
    if (reset) throw new Error(field.label + ' : champ obligatoire');
    setPath(out, field.path, clone(value));
    return out;
  }

  // clés de premier niveau facultatives dans le JSON, écrites en entier (la surcharge de l'éditeur remplace l'objet ; null = clé retirée)
  const WHOLE_KEYS = ['mobs', 'bossTune', 'eventTune', 'norma', 'audio', 'bossAt'];

  const api = { autoBossAt, WHOLE_KEYS, TUTO_SCHEMA, TUTO_STEP_KEYS, BOSS_TUNE_ID, MOB_TUNE_ID, buildSteps, applyFieldValue, fieldValue, getByPath, mobTypes, bossIds };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.EditorSteps = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
