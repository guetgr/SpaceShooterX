"use strict";
// Méta-progression (sauvegarde permanente, clé `ssx_meta_v3`, format `v:4`) : composants ◆ et niveaux d'améliorations R&D / atelier (`niv`, data/rd.js) ; niveau d'alerte de la partie infinie.
// Les sauvegardes d'avant (v2 { fragments, tree }, v3 { atelier Mk I à V, rd technologies, chargement }) sont converties UNE fois par metaFromLegacy : tout ce qu'elles avaient payé
// (arbre de compétences, postes d'atelier, technologies) est remboursé en composants ◆ au prix payé, les composants et la progression de campagne (ssx_worlds_v1) sont intacts.

const META_KEY = 'ssx_meta_v3';
const META_KEY_V2 = 'ssx_meta_v2';
const META_VERSION = 4;

function defaultMeta(){
  return { v:META_VERSION, composants:0, niv:{}, notice:null };
}

// entier >= 0 tiré d'une valeur de sauvegarde (nombre ou texte numérique), 0 sinon
function metaNum(v){ const n = typeof v === 'string' ? Number(v) : v; return (typeof n === 'number' && isFinite(n) && n > 0) ? Math.floor(n) : 0; }

// sauvegarde lue -> meta complète et bornée (jamais d'exception, les champs inconnus sont ignorés)
function normalizeMeta(raw){
  const m = defaultMeta();
  if (!raw || typeof raw !== 'object') return m;
  m.composants = metaNum(raw.composants);
  RD_UPGRADES.forEach(u=>{ const L = rdLevel(raw, u.id); if (L > 0) m.niv[u.id] = L; });
  m.notice = raw.notice === 'restructuration' ? raw.notice : null;
  return m;
}

// Anciens prix, figés pour rembourser : postes d'atelier Mk I à V, technologies (prototype + rangs + spécialisation) par secteur.
const LEGACY_ATELIER_COSTS = [40, 70, 120, 200, 340];
const LEGACY_TECH_PROTO = { 1:30, 2:60, 3:100, 4:150, 5:200 }, LEGACY_TECH_RANGMUL = { 1:1, 2:1.5, 3:2, 4:2.5, 5:3 }, LEGACY_TECH_SPE = { 1:150, 2:250, 3:400, 4:600, 5:800 };
// technologie : [secteur, rangs maximum, a une spécialisation]
const LEGACY_TECHS = { laser_continu:[1,9,1], laser_auto:[1,5,1], missiles_guidage:[1,14,1], bouclier_reactif:[1,6,0], ricochets:[1,2,0],
  drone:[2,8,1], missiles_demolition:[2,17,1], blindage_lourd:[2,9,1], nano_reparation:[2,18,1], benne:[2,32,1],
  overdrive:[3,12,0], canon_experimental:[3,8,1], arc_electrique:[3,2,1], champ_lent:[3,3,0], pulsar:[3,3,0],
  trou_noir:[4,2,1], eclats:[4,2,0], rapatriement:[5,3,1] };

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

// composants rendus par les achats d'une sauvegarde v3 d'avant la refonte (postes d'atelier Mk, technologies de la R&D)
function legacyV3Refund(raw){
  let sum = 0;
  Object.keys(raw.atelier || {}).forEach(id=>{
    const mk = Math.min(LEGACY_ATELIER_COSTS.length, metaNum(raw.atelier[id]));
    for (let i = 0; i < mk; i++) sum += LEGACY_ATELIER_COSTS[i];
  });
  Object.keys(raw.rd || {}).forEach(id=>{
    const t = LEGACY_TECHS[id], e = raw.rd[id]; if (!t || !e || typeof e !== 'object') return;
    if (!e.proto && !metaNum(e.rang) && !e.spe) return;
    sum += LEGACY_TECH_PROTO[t[0]];
    for (let r = 0, n = Math.min(t[1], metaNum(e.rang)); r < n; r++) sum += Math.round((25 + 15*r)*LEGACY_TECH_RANGMUL[t[0]]);
    if (e.spe && t[2]) sum += LEGACY_TECH_SPE[t[0]];
  });
  return sum;
}

// ancienne sauvegarde (v2, ou v3 d'avant la refonte) -> méta v4 : composants + tous les achats remboursés, niveaux d'amélioration à zéro, un avis « restructuration »
function metaFromLegacy(raw, composants){
  const refund = treeLegacyRefund(raw.tree) + legacyV3Refund(raw);
  const m = normalizeMeta({ composants: composants + refund });
  if (refund > 0 || raw.notice === 'restructuration') m.notice = 'restructuration';
  return m;
}

function metaRead(key){ try { const o = JSON.parse(localStorage.getItem(key) || 'null'); return (o && typeof o === 'object') ? o : null; } catch(e){ return null; } }

function getMeta(){
  const v3 = metaRead(META_KEY);
  if (v3) return (v3.v >= META_VERSION) ? normalizeMeta(v3) : metaFromLegacy(v3, metaNum(v3.composants));
  const v2 = metaRead(META_KEY_V2);
  return v2 ? metaFromLegacy(v2, metaNum(v2.fragments)) : defaultMeta();
}

function setMeta(meta){
  try { localStorage.setItem(META_KEY, JSON.stringify(normalizeMeta(meta))); } catch(e){ /* ignore */ }
}

// au démarrage : écrit la méta convertie (voir metaFromLegacy), une seule fois (renvoie true si une conversion a eu lieu) ; une sauvegarde déjà en v4 n'est jamais retouchée
function migrateMeta(){
  try {
    const v3 = metaRead(META_KEY);
    if (v3 && v3.v >= META_VERSION) return false;                                                                         // déjà convertie
    if (!v3 && (localStorage.getItem(META_KEY) !== null || !metaRead(META_KEY_V2))) return false;          // v3 illisible, ou rien à convertir
    setMeta(getMeta());
    return true;
  } catch(e){ return false; }
}

// "Niveau d'alerte" de la partie infinie (?dev) — plus la camionnette et l'arbre sont investis, plus les mobs sont méchants
// points = niveaux d'améliorations R&D et atelier achetés ; en niveau, la menace est fixée par le niveau (GameScene)
const ALERT_THRESHOLDS = [6, 14, 24, 36, 50, 90, 140, 170, 200, 230, 260, 290, 342, 381];   // le niveau 15 = l'arbre complet
const ALERT_CAP = 20;

const sumRanks = o=> Object.values(o || {}).reduce((a, v)=> a + v, 0);

function metaPoints(meta){ return sumRanks(meta.niv); }

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
