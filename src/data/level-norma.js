"use strict";
// Réactions de N.O.R.M.A. propres à un ordre de mission (bloc `norma` du JSON du niveau, voir docs/editeur-niveaux.md).
// Fonctions pures : lisent lvDef, ne touchent ni au DOM ni à la scène. Sans bloc `norma`, tout retombe sur AGP_LINES (comportement d'origine).
//   norma = { start, boss, progress, banter, lowhp, win, lose : ["…"], tickEvery:[min,max] (s), tuto:{ move, shoot, … },
//             messages:[{ id, when, at, ref, text }] }   et   events[i].norma = { start:"…", end:"…" }
const NORMA_POOLS = ['start', 'boss', 'progress', 'banter', 'lowhp', 'win', 'lose'];
const NORMA_WHEN = ['levelStart', 'time', 'eventStart', 'eventEnd', 'bossStart', 'win', 'lose'];
const NORMA_TICK_DEFAULT = [40, 55];

function normaText(s){ return (typeof s === 'string' && s.trim()) ? s : ''; }

// liste de lignes d'une réserve : celle du niveau si elle existe et n'est pas vide, sinon la réserve d'origine (même tableau)
function normaLines(lvDef, pool){
  const o = lvDef && lvDef.norma && lvDef.norma[pool];
  if (Array.isArray(o)){ const a = o.filter(normaText); if (a.length) return a; }
  return AGP_LINES[pool] || [];
}

// intervalle des vannes / avancements, en millisecondes
function normaTickEvery(lvDef){
  const t = lvDef && lvDef.norma && lvDef.norma.tickEvery;
  const a = (Array.isArray(t) && t.length === 2 && t[0] >= 5 && t[1] <= 300 && t[0] <= t[1]) ? t : NORMA_TICK_DEFAULT;
  return [a[0] * 1000, a[1] * 1000];
}

// consigne du tutoriel : texte du niveau `w1-tuto` si renseigné, sinon AGP_LINES.tuto
function normaTutoLine(tutoDef, key){
  const o = tutoDef && tutoDef.norma && tutoDef.norma.tuto && tutoDef.norma.tuto[key];
  return normaText(o) ? o : AGP_LINES.tuto[key];
}

// plan des boîtes ajoutées à la main : { time:[triées par `at`], at:{ <when>: [..] }, ev:{ eventStart:{kind:[..]}, eventEnd:{kind:[..]} } } ; chaque entrée garde `done`
function normaPlan(lvDef){
  const plan = { time: [], at: {}, ev: { eventStart: {}, eventEnd: {} } };
  const list = (lvDef && lvDef.norma && Array.isArray(lvDef.norma.messages)) ? lvDef.norma.messages : [];
  list.forEach(m=>{
    if (!m || !normaText(m.text) || NORMA_WHEN.indexOf(m.when) < 0) return;
    const e = { id:m.id, text:m.text, at:Number.isFinite(m.at) ? m.at : 0, done:false };
    if (m.when === 'time') plan.time.push(e);
    else if (m.when === 'eventStart' || m.when === 'eventEnd'){ if (m.ref) (plan.ev[m.when][m.ref] = plan.ev[m.when][m.ref] || []).push(e); }
    else (plan.at[m.when] = plan.at[m.when] || []).push(e);
  });
  plan.time.sort((a, b)=> a.at - b.at);
  return plan;
}

// prochaine boîte horaire échue (non encore jouée), sans la consommer
function normaPlanDue(plan, t){ return plan.time.find(e=> !e.done && e.at <= t) || null; }
// Une boîte eventStart/eventEnd vaut pour N'IMPORTE QUELLE occurrence de la nature (programmée ou aléatoire), part une seule fois par partie, et eventEnd est indépendante d'une boîte eventStart.
// première boîte non jouée d'une ancre (`levelStart`, `bossStart`, `win`, `lose`) ou d'un événement (`eventStart` / `eventEnd` + ref) ; la consomme
function normaPlanTake(plan, when, ref){
  const l = ref == null ? plan.at[when] : (plan.ev[when] || {})[ref];
  const e = l && l.find(x=> !x.done); if (e) e.done = true;
  return e || null;
}
