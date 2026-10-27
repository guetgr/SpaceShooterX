"use strict";
// Méta-progression (sauvegarde permanente v3) : composants, pièces de secteur, atelier, arbre restant ; niveau d'alerte de la partie infinie.
// La v2 (`ssx_meta_v2`) n'est plus écrite : elle est lue une fois, convertie par metaFromV2 (remboursement des nœuds repris par l'atelier).

const META_KEY = 'ssx_meta_v3';
const META_KEY_V2 = 'ssx_meta_v2';

function defaultMeta(){
  const atelier = {}; ATELIER_POSTS.forEach(p=>{ atelier[p.id] = 0; });
  return { v:3, composants:0, pieces:{ s1:0, s2:0, s3:0, s4:0, s5:0 }, atelier, rd:{}, chargement:[], tree:{}, notice:null };
}

// entier >= 0 tiré d'une valeur de sauvegarde (nombre ou texte numérique), 0 sinon
function metaNum(v){ const n = typeof v === 'string' ? Number(v) : v; return (typeof n === 'number' && isFinite(n) && n > 0) ? Math.floor(n) : 0; }

// sauvegarde lue -> meta complète et bornée (jamais d'exception, les champs inconnus sont ignorés)
function normalizeMeta(raw){
  const m = defaultMeta();
  if (!raw || typeof raw !== 'object') return m;
  m.composants = metaNum(raw.composants);
  Object.keys(m.pieces).forEach(k=>{ m.pieces[k] = metaNum(raw.pieces && raw.pieces[k]); });
  Object.keys(m.atelier).forEach(k=>{ m.atelier[k] = atelierMk(raw.atelier, k); });
  if (raw.rd && typeof raw.rd === 'object') Object.keys(raw.rd).forEach(k=>{ if (TECH_BY_ID[k]) m.rd[k] = rdEntry(raw, k); });
  if (Array.isArray(raw.chargement)) raw.chargement.forEach(id=>{ if (typeof id === 'string' && TECH_BY_ID[id] && m.chargement.indexOf(id) < 0) m.chargement.push(id); });
  if (raw.tree && typeof raw.tree === 'object') Object.keys(raw.tree).forEach(k=>{ const r = metaNum(raw.tree[k]); if (r > 0) m.tree[k] = r; });
  m.notice = raw.notice === 'restructuration' ? raw.notice : null;
  return m;
}

// v2 { fragments, tree, asc } -> v3 : les nœuds repris par l'atelier sont remboursés en composants, le reste de l'arbre est conservé
function metaFromV2(raw){
  const tree = (raw && raw.tree && typeof raw.tree === 'object') ? raw.tree : {};
  const refund = treeRefundFor(tree), kept = {};
  Object.keys(tree).forEach(k=>{ if (!ATELIER_REPLACED.has(k)) kept[k] = tree[k]; });
  const m = normalizeMeta({ composants: metaNum(raw && raw.fragments) + refund, tree: kept });
  m.notice = refund > 0 ? 'restructuration' : null;
  return m;
}

function metaRead(key){ try { const o = JSON.parse(localStorage.getItem(key) || 'null'); return (o && typeof o === 'object') ? o : null; } catch(e){ return null; } }

function getMeta(){
  const v3 = metaRead(META_KEY);
  if (v3) return normalizeMeta(v3);
  const v2 = metaRead(META_KEY_V2);
  return v2 ? metaFromV2(v2) : defaultMeta();
}

function setMeta(meta){
  try { localStorage.setItem(META_KEY, JSON.stringify(normalizeMeta(meta))); } catch(e){ /* ignore */ }
}

// au démarrage : écrit la v3 convertie depuis la v2, une seule fois (renvoie true si une conversion a eu lieu)
function migrateMeta(){
  try {
    if (localStorage.getItem(META_KEY) !== null) return false;
    const v2 = metaRead(META_KEY_V2);
    if (!v2) return false;
    setMeta(metaFromV2(v2));
    return true;
  } catch(e){ return false; }
}

// "Niveau d'alerte" de la partie infinie (?dev) — plus la camionnette et l'arbre sont investis, plus les mobs sont méchants
// points = rangs de l'arbre restant + 4 par Mk d'atelier ; en niveau, la menace est fixée par le niveau (GameScene)
const ALERT_THRESHOLDS = [6, 14, 24, 36, 50, 90, 140, 170, 200, 230, 260, 290, 342, 381];   // le niveau 15 = l'arbre complet
const ALERT_CAP = 20;

function treeTotalPoints(tree){ return Object.values(tree||{}).reduce((a,v)=>a+v,0); }

function metaPoints(meta){ return treeTotalPoints(meta.tree) + 4*treeTotalPoints(meta.atelier); }

function computeAlertLevel(points){
  let lvl = 1;
  ALERT_THRESHOLDS.forEach((t,i)=>{ if (points >= t) lvl = i + 2; });
  return lvl;
}

function effectiveAlert(meta){ return Math.min(ALERT_CAP, computeAlertLevel(metaPoints(meta))); }

// weaponTier 1 = tir de base, 2 = "tir secondaire" (niv.3+), 3 = "3e tir" (niv.5+)
function weaponTierFor(alertLevel){
  if (alertLevel >= 5) return 3;
  if (alertLevel >= 3) return 2;
  return 1;
}
