"use strict";
// Registre des paramètres numériques des événements (EVENT_DEFS, data/events.js), réglables par mission (éditeur de niveaux, JSON).
// COUVRE : durée (dur, ou durMin/durMax quand elle est tirée au hasard ; en SECONDES), cadence (tickMs, en ms), nombres par vague / par tic,
//   vitesses, dégâts, rayons, durées d'effet. NE COUVRE PAS : coordonnées, tweens, couleurs, poids de tirage (w), seuil d'alerte (min) ni
//   les nombres purement décoratifs (météorites de fond, flocons, halos).
// FORMAT (lu par tools/level_files.py, à conserver) : un événement par ligne `  kind: [`, puis une entrée par ligne commençant par quatre espaces
//   `{ key:'tickMs', label:'...', min:a, max:b, step:s, unit:'...', [int:true,] def:valeur_ou_(a)=>formule },`
//   def = valeur d'origine : un nombre, ou une fonction du niveau d'alerte `(a)=>...` (même formule que le code d'origine). int:true = entier imposé (arrondi).
// RÉSOLUTION (evParam) : events[i].params de l'événement programmé en cours > lvDef.eventTune[kind] (tout le niveau, aléatoires compris) > def(alerte).
// JSON : { "kind":"meteors", "at":30, "duration":40, "params":{ "tickMs":500 } }  ·  "eventTune": { "meteors": { "tickMs":500 } }
// `duration` d'un événement programmé reste prioritaire sur dur / durMin / durMax.
// AJOUTER UN PARAMÈTRE : une ligne ici (def = valeur d'origine, dans les bornes), puis remplacer le littéral dans events.js / events/*.js par
//   evParam(sc, 'kind', 'key') ; lire la valeur au DÉMARRAGE de l'événement quand elle sert à du code différé (délais, tweens). Relancer tools/event_params_test.py.
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
