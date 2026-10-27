"use strict";
// Méta-progression (sauvegarde permanente v3) : composants, pièces de secteur, atelier, R&D (rd), chargement ; niveau d'alerte de la partie infinie.
// Les sauvegardes d'avant la R&D (`ssx_meta_v2`, ou v3 sans clé `rd`) sont lues et converties par metaFromLegacy : l'ancien arbre de compétences est remboursé en entier.

const META_KEY = 'ssx_meta_v3';
const META_KEY_V2 = 'ssx_meta_v2';

function defaultMeta(){
  const atelier = {}; ATELIER_POSTS.forEach(p=>{ atelier[p.id] = 0; });
  return { v:3, composants:0, pieces:{ s1:0, s2:0, s3:0, s4:0, s5:0 }, atelier, rd:{}, chargement:[], notice:null };
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
  m.notice = raw.notice === 'restructuration' ? raw.notice : null;
  return m;
}

// Ancien arbre de compétences (supprimé) : coûts figés { nœud: [coût du rang 1, pas par rang, rang max] }, pour rembourser les sauvegardes qui en ont encore.
const TREE_LEGACY_COSTS = { t_multi:[10,8,4], t_perforant:[10,8,3], t_percebouclier:[12,10,1], t_velocite:[8,6,4], t_laser_c:[30,0,1], t_laser_c_portee:[10,8,4],
  t_laser_c_degats:[10,8,5], t_laser_c_cap:[40,0,1], t_laser_a:[30,0,1], t_laser_a_verrou:[9,7,4], t_laser_a_priorite:[10,8,3], t_laser_a_cap:[40,0,1],
  t_shotgun:[30,0,1], t_shotgun_plombs:[10,8,4], t_shotgun_recul:[9,7,4], t_shotgun_cap:[40,0,1], t_lancemissiles:[14,0,1], t_chargemissiles:[9,7,4],
  t_cadmissiles:[9,7,4], t_explosion:[10,8,3], t_perforantmissile:[11,9,3], t_napalm:[12,9,3], t_stabilisateurs:[8,6,3], t_rechargerapide:[9,7,3],
  t_missile_droit:[26,0,1], t_missile_droit_vitesse:[9,7,4], t_missile_droit_charge:[10,8,4], t_missile_droit_cap:[38,0,1], t_missile_chercheur:[26,0,1],
  t_missile_chercheur_multi:[9,7,4], t_missile_chercheur_cad:[9,7,4], t_missile_chercheur_cap:[38,0,1], t_regen:[9,7,5], t_voldevie:[11,9,5],
  t_reactif:[12,9,3], t_forteresse:[28,0,1], t_forteresse_resist:[10,8,5], t_forteresse_regen:[10,8,4], t_forteresse_cap:[40,0,1], t_phenix:[28,0,1],
  t_phenix_esquive:[12,9,3], t_phenix_bouclier:[9,7,4], t_phenix_cap:[40,0,1], t_sangsue:[28,0,1], t_sangsue_vol:[10,8,5], t_sangsue_rayon:[9,7,3],
  t_sangsue_cap:[40,0,1], t_xp:[8,6,6], t_chance:[9,7,4], t_collecte:[12,9,3], t_cooldown:[10,8,3], t_chancedevie:[9,7,5], t_butindouble:[9,7,4],
  t_cristauxvaleur:[10,8,5], t_soinmajeur:[10,8,3], t_coffre:[28,0,1], t_coffre_xp:[9,7,5], t_coffre_chance:[9,7,4], t_coffre_cap:[40,0,1],
  t_drone:[28,0,1], t_drone_cadence:[9,7,4], t_drone_degats:[9,7,4], t_drone_cap:[42,0,1], t_foudre:[14,12,3], t_rebond:[12,10,3], t_eclats:[16,12,3],
  t_tonnerre:[42,0,1], t_champlent:[12,10,4], t_pulsar:[14,12,4], t_trounoir:[18,14,3], t_gravite:[32,0,1], t_overdrive:[10,12,4], t_frolement:[10,9,3],
  t_surchauffe:[14,12,3], t_souffle:[16,14,3], t_intuition:[8,14,3], t_relance:[10,10,4], t_genie:[12,10,5], t_butin:[20,16,2], t_aimantgrowth:[6,5,5],
  t_reacteurs:[6,5,5], t_aimant:[7,5,5], t_vitessevaisseau:[7,5,5], t_eclair:[28,0,1], t_eclair_reactivite:[9,7,4], t_eclair_aimant:[8,6,4],
  t_eclair_cap:[40,0,1], t_vitalite:[6,5,6], t_boucliergrowth:[10,8,3], t_blindage:[7,5,6], t_bouclier:[9,7,4], t_rechargebouclier:[8,6,4],
  t_esquive:[16,10,3], t_armure:[10,8,5], t_resilience:[9,7,4], t_secondsouffle:[12,9,3], t_puissance:[6,5,6], t_celerite:[6,5,6], t_degats:[7,5,8],
  t_cadence:[7,5,6], t_critique:[9,7,5], t_radar:[26,22,4] };

function treeLegacyRefund(tree){
  let sum = 0;
  Object.keys(tree || {}).forEach(id=>{
    const c = TREE_LEGACY_COSTS[id]; if (!c) return;
    const r = Math.min(metaNum(tree[id]), c[2]);
    sum += r*c[0] + c[1]*r*(r - 1)/2;
  });
  return sum;
}

// sauvegarde d'avant la R&D (v2 { fragments, tree }, ou v3 sans clé `rd`) -> méta actuelle : tout l'ancien arbre est remboursé en composants,
// les plans de technologie sont accordés pour chaque ordre déjà gagné
function metaFromLegacy(raw, composants){
  const refund = treeLegacyRefund(raw.tree);
  const m = normalizeMeta(Object.assign({}, raw, { composants: composants + refund }));
  Object.keys(getWorldProgress().levels).forEach(id=>{ if (TECH_PLAN_LEVEL[id]) rdGrantPlan(m, TECH_PLAN_LEVEL[id]); });
  if (refund > 0) m.notice = 'restructuration';
  return m;
}

function metaRead(key){ try { const o = JSON.parse(localStorage.getItem(key) || 'null'); return (o && typeof o === 'object') ? o : null; } catch(e){ return null; } }

function getMeta(){
  const v3 = metaRead(META_KEY);
  if (v3) return ('rd' in v3) ? normalizeMeta(v3) : metaFromLegacy(v3, metaNum(v3.composants));
  const v2 = metaRead(META_KEY_V2);
  return v2 ? metaFromLegacy(v2, metaNum(v2.fragments)) : defaultMeta();
}

function setMeta(meta){
  try { localStorage.setItem(META_KEY, JSON.stringify(normalizeMeta(meta))); } catch(e){ /* ignore */ }
}

// au démarrage : écrit la méta convertie (voir metaFromLegacy), une seule fois (renvoie true si une conversion a eu lieu)
function migrateMeta(){
  try {
    const v3 = metaRead(META_KEY);
    if (v3 && 'rd' in v3) return false;                                                                                    // déjà convertie
    if (!v3 && (localStorage.getItem(META_KEY) !== null || !metaRead(META_KEY_V2))) return false;          // v3 illisible, ou rien à convertir
    setMeta(getMeta());
    return true;
  } catch(e){ return false; }
}

// "Niveau d'alerte" de la partie infinie (?dev) — plus la camionnette et l'arbre sont investis, plus les mobs sont méchants
// points = rangs de R&D + 4 par Mk d'atelier ; en niveau, la menace est fixée par le niveau (GameScene)
const ALERT_THRESHOLDS = [6, 14, 24, 36, 50, 90, 140, 170, 200, 230, 260, 290, 342, 381];   // le niveau 15 = l'arbre complet
const ALERT_CAP = 20;

const sumRanks = o=> Object.values(o || {}).reduce((a, v)=> a + v, 0);

function metaPoints(meta){ return 4*sumRanks(meta.atelier) + Object.values(meta.rd || {}).reduce((a, e)=> a + (e.rang || 0), 0); }

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
