"use strict";
// Validateur d'un niveau de l'éditeur (navigateur + node, sans DOM).
//   validateLevel(doc, catalogs) -> { errors:string[], warnings:string[] }
// ERREURS = tout ce que le serveur refuse (tools/level_files.py, validate_level) ; mêmes messages, mêmes bornes. Elles bloquent EXPORTER.
// AVERTISSEMENTS = incohérences probables, jamais bloquantes ; les préfixés « Info : » sont de simples remarques.
// catalogs (comme steps-model.js, tous facultatifs : une règle dont le catalogue manque est sautée) :
//   eventCatalog [{id, name, small, min, params:[{key,min,max,int}]}], tunablesCatalog { id:[{path,len,min,max,ordered}] }, mobCatalog [{type}],
//   bestiary [{type}] (types permis dans spawns / waves), decorCatalog [{kind}], musicCatalog { level:[], boss:[] }.
// Les règles partagées avec le serveur sont écrites une fois dans tools/fixtures/invalid_levels.json (lu par editor_validator_test.js ET level_files_test.py).
(function(root){
  const FINAL_BOSSES = ['meteo', 'araignee', 'reacteur', 'anneau', 'pdg'];                              // level_files.py : « Boss final inconnu »
  const BOSSES = ['dread', 'faucheuse', 'ruche', 'prisme', 'kraken', 'eclipse', 'hydre'];               // level_files.py : « Boss inconnu »
  const NORMA_POOLS = ['start', 'boss', 'progress', 'banter', 'lowhp', 'win', 'lose'];
  const NORMA_WHEN = ['levelStart', 'time', 'eventStart', 'eventEnd', 'bossStart', 'win', 'lose'];
  const NORMA_TUTO = ['move', 'shoot', 'boss', 'aim', 'ring', 'p2', 'p3', 'win', 'lose'];
  const num = (v, lo, hi)=> typeof v === 'number' && isFinite(v) && v >= lo && v <= hi;
  const isObj = v=> !!v && typeof v === 'object' && !Array.isArray(v);
  const g = n=> String(n);
  const ids = a=> (a || []).map(x=> x.id !== undefined ? x.id : x.type !== undefined ? x.type : x.kind);

  // un jeu de paramètres d'événement (events[i].params ou eventTune[kind]) : level_files.py check_params
  function checkParams(vals, kind, at, cat, err){
    if (!cat.eventCatalog) return;
    const ev = cat.eventCatalog.find(e=> e.id === kind);
    if (!ev){ err(at + ' : événement inconnu « ' + kind + ' »'); return; }
    if (!isObj(vals)){ err(at + ' : objet requis'); return; }
    const reg = {}; (ev.params || []).forEach(p=> { reg[p.key] = p; });
    Object.keys(vals).forEach(k=>{
      const p = reg[k], v = vals[k];
      if (!p){ err(at + '.' + k + ' : paramètre inconnu'); return; }
      if (!num(v, p.min, p.max)){ err(at + '.' + k + ' : nombre entre ' + g(p.min) + ' et ' + g(p.max) + ' requis'); return; }
      if (p.int && v !== Math.round(v)) err(at + '.' + k + ' : entier requis');
    });
    Object.keys(vals).forEach(k=>{                                                                        // paires xxxMin / xxxMax données ensemble
      const mx = k.slice(0, -3) + 'Max';
      if (/Min$/.test(k) && mx in vals && typeof vals[k] === 'number' && vals[k] > vals[mx]) err(at + ' : ' + k + ' doit être inférieur ou égal à ' + mx);
    });
  }
  function normaText(t, at, err){
    if (typeof t !== 'string' || t.length < 1 || t.length > 140){ err(at + ' : texte de 1 à 140 caractères requis'); return; }
    if (/[<>]/.test(t)) err(at + ' : les signes < et > sont interdits');
    else if (!t.trim()) err(at + ' : texte vide');
  }
  function checkNorma(doc, cat, err){
    const n = doc.norma;
    if (!isObj(n)){ err('norma : objet requis'); return; }
    const allowed = NORMA_POOLS.concat(['tickEvery', 'tuto', 'messages']);
    Object.keys(n).forEach(k=> { if (allowed.indexOf(k) < 0) err('norma.' + k + ' : clé inconnue (permises : ' + allowed.slice().sort().join(', ') + ')'); });
    NORMA_POOLS.forEach(pool=>{
      if (!(pool in n)) return;
      if (!Array.isArray(n[pool]) || n[pool].length < 1 || n[pool].length > 20){ err('norma.' + pool + ' : liste de 1 à 20 textes requise'); return; }
      n[pool].forEach((t, i)=> normaText(t, 'norma.' + pool + '[' + i + ']', err));
    });
    if ('tickEvery' in n){
      const t = n.tickEvery;
      if (!Array.isArray(t) || t.length !== 2 || !t.every(x=> num(x, 5, 300)) || t[0] > t[1]) err('norma.tickEvery : deux nombres de secondes entre 5 et 300, le premier inférieur ou égal au second');
    }
    if ('tuto' in n){
      if (!doc.tuto) err('norma.tuto : réservé au tutoriel (w1-tuto)');
      else if (!isObj(n.tuto)) err('norma.tuto : objet requis');
      else Object.keys(n.tuto).forEach(k=> { if (NORMA_TUTO.indexOf(k) < 0) err('norma.tuto.' + k + ' : consigne inconnue'); else normaText(n.tuto[k], 'norma.tuto.' + k, err); });
    }
    if ('messages' in n){
      if (!Array.isArray(n.messages) || n.messages.length > 50){ err('norma.messages : liste de 50 boîtes au plus requise'); return; }
      const seen = {}, events = ids(cat.eventCatalog);
      n.messages.forEach((m, i)=>{
        const at = 'norma.messages[' + i + ']';
        if (isObj(m) && 'hold' in m){ err(at + '.hold : hold n\'est pas supporté sur les boîtes ; utilisez un texte court'); return; }
        if (!isObj(m) || Object.keys(m).some(k=> ['id', 'when', 'at', 'ref', 'text'].indexOf(k) < 0)){ err(at + ' : objet avec id, when, at, ref, text requis'); return; }
        if (typeof m.id !== 'string' || !m.id.trim() || m.id.length > 40) err(at + '.id : identifiant de 1 à 40 caractères requis');
        else if (seen[m.id]) err(at + '.id : identifiant « ' + m.id + ' » déjà utilisé'); else seen[m.id] = 1;
        if (NORMA_WHEN.indexOf(m.when) < 0) err(at + '.when : levelStart, time, eventStart, eventEnd, bossStart, win ou lose requis');
        if ((m.when === 'time' || 'at' in m) && !num(m.at, 0, 3600)) err(at + '.at : secondes entre 0 et 3600 requises');
        if ((m.when === 'eventStart' || m.when === 'eventEnd') && cat.eventCatalog && events.indexOf(m.ref) < 0) err(at + '.ref : nature d\'événement connue requise (lue dans src/data/events.js)');
        normaText(m.text, at + '.text', err);
      });
    }
  }
  function checkBossTune(doc, cat, err){
    const bt = doc.bossTune, tc = cat.tunablesCatalog;
    if (!isObj(bt)){ err('bossTune : objet requis'); return; }
    if (!tc) return;
    Object.keys(bt).forEach(bid=>{
      if (bid === 'antenne'){ err('bossTune.antenne : refusé, les réglages de l\'Antenne-Mère sont dans tutorial.boss du tutoriel'); return; }
      if (!tc[bid]){ err('bossTune : boss ou mob inconnu « ' + bid + ' » (lus dans src/data/tunables.js)'); return; }
      if (!isObj(bt[bid])){ err('bossTune.' + bid + ' : objet requis'); return; }
      Object.keys(bt[bid]).forEach(path=>{
        const r = tc[bid].find(x=> x.path === path), v = bt[bid][path], at = 'bossTune.' + bid + '.' + path;
        if (!r){ err(at + ' : réglage inconnu'); return; }
        if (!r.len){ if (!num(v, r.min, r.max)) err(at + ' : nombre entre ' + g(r.min) + ' et ' + g(r.max) + ' requis'); return; }
        if (!Array.isArray(v) || v.length !== r.len){ err(at + ' : tableau de ' + r.len + ' nombres requis'); return; }
        if (!v.every(x=> num(x, r.min, r.max))){ err(at + ' : chaque nombre doit être entre ' + g(r.min) + ' et ' + g(r.max)); return; }
        if (r.ordered === 'desc' && v.some((x, i)=> i && x > v[i - 1])) err(at + ' : valeurs décroissantes requises (paliers dans l\'ordre)');
        if (r.ordered === 'asc' && v.some((x, i)=> i && x < v[i - 1])) err(at + ' : valeurs croissantes requises');
      });
    });
  }

  function validateLevel(doc, catalogs){
    const cat = catalogs || {}, errors = [], warnings = [], err = m=> errors.push(m), warn = m=> warnings.push(m);
    if (!isObj(doc)){ err('Document de niveau invalide'); return { errors, warnings }; }
    // ----- erreurs (mêmes règles que level_files.py) -----
    if (!num(doc.threat, 1, 20) || !(doc.hpMul > 0) || !(doc.dmgMul > 0)) err('Difficulté invalide');
    if (isObj(doc.goal) && Object.keys(doc.goal).some(k=> !(doc.goal[k] > 0))) err('Objectif positif requis');
    if ((doc.timelineOnly !== 0 && doc.timelineOnly !== 1) || ['mission', 'difficulty'].indexOf(doc.spawnClock) < 0) err('Mode de spawn invalide');
    if ('mobs' in doc){
      const known = ids(cat.mobCatalog);
      if (!isObj(doc.mobs)) err('mobs : objet requis');
      else Object.keys(doc.mobs).forEach(mob=>{
        const mul = doc.mobs[mob];
        if (cat.mobCatalog && known.indexOf(mob) < 0){ err('mobs : type de mob inconnu « ' + mob + ' »'); return; }
        if (!isObj(mul) || Object.keys(mul).some(k=> ['hpMul', 'dmgMul', 'speedMul', 'scoreMul'].indexOf(k) < 0)){ err('mobs.' + mob + ' : seuls hpMul, dmgMul, speedMul et scoreMul sont permis'); return; }
        Object.keys(mul).forEach(k=> { if (!num(mul[k], 0.1, 10)) err('mobs.' + mob + '.' + k + ' : nombre entre 0,1 et 10 requis'); });
      });
    }
    if ('bossTune' in doc) checkBossTune(doc, cat, err);
    if ('norma' in doc) checkNorma(doc, cat, err);
    if ('eventTune' in doc){
      if (!isObj(doc.eventTune)) err('eventTune : objet requis');
      else Object.keys(doc.eventTune).forEach(kind=> checkParams(doc.eventTune[kind], kind, 'eventTune.' + kind, cat, err));
    }
    const enemies = cat.bestiary ? ids(cat.bestiary) : null, evIds = cat.eventCatalog ? ids(cat.eventCatalog) : null;
    ['spawns', 'waves', 'events'].forEach(kind=>{
      if (!Array.isArray(doc[kind]) || doc[kind].length > 1000){ err(kind + ' : liste invalide'); return; }
      doc[kind].forEach(row=>{
        if (!isObj(row)){ err(kind + ' : objet requis'); return; }
        const keys = Object.keys(row), has = ks=> ks.every(k=> k in row), only = ks=> keys.every(k=> ks.indexOf(k) >= 0);
        if (kind === 'spawns'){
          if (!only(['type', 'from', 'w', 'tier']) || !has(['type', 'from', 'w']) || (enemies && enemies.indexOf(row.type) < 0) || !num(row.from, -1, 3600) || !num(row.w, 0.01, 1000) || !num(row.tier === undefined ? 1 : row.tier, 1, 4)) err('Pool invalide');
        } else if (kind === 'waves'){
          if (keys.length !== 4 || !has(['type', 'at', 'count', 'spacing']) || (enemies && enemies.indexOf(row.type) < 0) || !num(row.at, 0, 3600) || !Number.isInteger(row.count) || row.count < 1 || row.count > 100 || !num(row.spacing, 0, 60)) err('Vague invalide');
        } else if (!only(['kind', 'at', 'duration', 'params', 'norma']) || !has(['kind', 'at']) || (evIds && evIds.indexOf(row.kind) < 0) || !num(row.at, 0, 3600) || ('duration' in row && !num(row.duration, 0.1, 600))) err('Événement invalide');
        else {
          if ('params' in row) checkParams(row.params, row.kind, 'events.params.' + row.kind, cat, err);
          if ('duration' in row && isObj(row.params) && ['dur', 'durMin', 'durMax'].some(k=> k in row.params)) err('events.' + row.kind + ' : duration et params.dur/durMin/durMax sont ambigus, duration l\'emporte : retirez l\'un des deux');
          if ('norma' in row){
            if (!isObj(row.norma) || Object.keys(row.norma).some(k=> k !== 'start' && k !== 'end')) err('events.norma : objet avec start et/ou end requis');
            else Object.keys(row.norma).forEach(k=> normaText(row.norma[k], 'events.norma.' + k, err));
          }
        }
      });
    });
    ['bg', 'intro', 'boss', 'finalBoss', 'bossName'].forEach(k=> { if (!(doc[k] === null || typeof doc[k] === 'string')) err(k + ' : texte ou null requis'); });
    if (doc.finalBoss !== null && FINAL_BOSSES.indexOf(doc.finalBoss) < 0) err('Boss final inconnu');
    if (doc.boss !== null && BOSSES.indexOf(doc.boss) < 0) err('Boss inconnu');
    if (doc.intro !== null && doc.intro !== 'earth') err('intro : « earth » ou null requis');
    if (typeof doc.bg === 'string' && cat.decorCatalog && ids(cat.decorCatalog).indexOf(doc.bg) < 0) err('bg : décor inconnu « ' + doc.bg + ' »');
    const z = doc.zoom;
    if (isObj(z)){
      if (!num(z.start, 0.3, 3) || !num(z.end, 0.3, 3)) err('zoom.start et zoom.end : nombres entre 0,3 et 3 requis');
      if (!num(z.seconds, 5, 600)) err('zoom.seconds : durée entre 5 et 600 secondes requise');
    }
    if ('audio' in doc){
      const a = doc.audio, mc = cat.musicCatalog;
      if (!isObj(a) || !Object.keys(a).length || Object.keys(a).some(k=> k !== 'level' && k !== 'boss')) err('audio : objet avec level et/ou boss requis');
      else {
        if ('level' in a){
          if (!Array.isArray(a.level) || a.level.length < 1 || a.level.length > 2 || a.level.some(k=> typeof k !== 'string')) err('audio.level : 1 ou 2 clés de musique requises');
          else if (mc) a.level.forEach(k=> { if ((mc.level || []).indexOf(k) < 0) err('audio.level : clé de musique inconnue « ' + k + ' »'); });
        }
        if ('boss' in a && (typeof a.boss !== 'string' || (mc && (mc.boss || []).indexOf(a.boss) < 0))) err('audio.boss : clé de musique de boss inconnue');
      }
    }
    if (isObj(doc.ambient) && Object.keys(doc.ambient).some(k=> typeof doc.ambient[k] !== 'boolean')) err('Activation ambiante invalide');
    // objectif impossible : kill / collect sans aucun ennemi pouvant apparaître (réserves ignorées quand timelineOnly = 1, src/enemies/spawning.js)
    const nSp = Array.isArray(doc.spawns) ? doc.spawns.length : 0, nWv = Array.isArray(doc.waves) ? doc.waves.length : 0;
    if ((doc.type === 'kill' || doc.type === 'collect') && (doc.timelineOnly === 1 ? 0 : nSp) + nWv === 0) err('Objectif impossible : aucun ennemi ne peut apparaître (ni réserve ni vague)');

    // ----- avertissements (jamais bloquants) -----
    if (errors.length) return { errors, warnings };
    const events = doc.events, threat = doc.threat, evCat = id=> (cat.eventCatalog || []).find(e=> e.id === id);
    const secs = doc.type === 'survive' && isObj(doc.goal) ? doc.goal.seconds : null;
    // alerte : en mission, GameScene.alertLevel = lvDef.threat et ne monte jamais (loop.js : montée seulement sans lvDef) ; un événement programmé démarre sans test de `min` (level.js)
    events.forEach(e=>{
      const c = evCat(e.kind);
      if (c && typeof c.min === 'number' && c.min > threat) warn('Événement « ' + e.kind + ' » (à ' + e.at + ' s) : prévu pour une alerte ' + c.min + ' ou plus, la menace du niveau est ' + threat + ' ; il démarre quand même, avec les valeurs de l\'alerte ' + threat);
    });
    // un seul événement à la fois par emplacement (petits / grands, level.js) : le second attend la fin du premier
    const sorted = events.slice().sort((a, b)=> a.at - b.at);
    for (let i = 1; i < sorted.length; i++){
      const a = sorted[i - 1], b = sorted[i], ca = evCat(a.kind), cb = evCat(b.kind);
      if (ca && cb && !!ca.small !== !!cb.small) continue;
      if (b.at - a.at < 5) warn('Événements « ' + a.kind + ' » (' + a.at + ' s) et « ' + b.kind + ' » (' + b.at + ' s) à moins de 5 s : un seul à la fois, le second attendra la fin du premier');
      else if (typeof a.duration === 'number' && b.at < a.at + a.duration) warn('Événement « ' + b.kind + ' » (' + b.at + ' s) : « ' + a.kind + ' » dure jusqu\'à ' + (a.at + a.duration) + ' s, il attendra la fin');
    }
    if (secs != null) events.forEach(e=> { if (e.at > secs) warn('Événement « ' + e.kind + ' » à ' + e.at + ' s : après la fin de l\'objectif (' + secs + ' s), il ne sera jamais joué'); });
    const messages = (isObj(doc.norma) && Array.isArray(doc.norma.messages)) ? doc.norma.messages : [];
    if (secs != null) messages.forEach(m=> { if (m.when === 'time' && m.at > secs) warn('Boîte N.O.R.M.A. « ' + m.id + ' » à ' + m.at + ' s : après la fin de l\'objectif (' + secs + ' s)'); });
    if ((doc.boss || doc.finalBoss) && !doc.tuto && !messages.some(m=> m.when === 'bossStart') && !(isObj(doc.norma) && doc.norma.boss)) warn('Info : aucun texte N.O.R.M.A. propre au début du boss (réserve « boss » et boîte « bossStart » absentes : textes d\'origine)');
    if (doc.hpMul >= 5 || doc.hpMul <= 0.2 || doc.dmgMul >= 5 || doc.dmgMul <= 0.2) warn('Valeur extrême : hpMul ' + doc.hpMul + ' / dmgMul ' + doc.dmgMul + ' (au niveau)');
    if (isObj(doc.mobs)) Object.keys(doc.mobs).forEach(mob=> ['hpMul', 'dmgMul'].forEach(k=>{
      const v = doc.mobs[mob][k];
      if (v === undefined) return;
      if (v >= 5 || v <= 0.2) warn('Valeur extrême : mobs.' + mob + '.' + k + ' = ' + v);
      if (k === 'hpMul' && v * doc.hpMul > 10) warn('PV effectifs de « ' + mob + ' » : ' + Math.round(v * doc.hpMul * 100) / 100 + ' fois la base (plus de 10 fois)');
    }));
    // événement réglé mais jamais joué : ni programmé, ni tirable au hasard. Seuls les petits événements sont jugés (updateSmallEvents : ambient.smallEvents et min <= menace) ;
    // les grands dépendent de planEvents (bosses/core.js), non établi pour les ordres : considérés atteignables.
    const programmed = {}; events.forEach(e=> { programmed[e.kind] = 1; });
    if (isObj(doc.eventTune) && !doc.tuto) Object.keys(doc.eventTune).forEach(k=>{
      const c = evCat(k);
      if (!c || !c.small || programmed[k]) return;
      if (!(isObj(doc.ambient) && doc.ambient.smallEvents) || (typeof c.min === 'number' && c.min > threat)) warn('Info : eventTune.' + k + ' est réglé mais cet événement n\'est ni programmé ni tirable au hasard dans ce niveau');
    });
    if (isObj(doc.audio) && doc.audio.boss && !doc.finalBoss) warn('audio.boss est ignoré : seul un « boss final » (finalBoss) lit la musique de boss de l\'ordre');
    return { errors, warnings };
  }

  const api = { validateLevel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.EditorValidator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
