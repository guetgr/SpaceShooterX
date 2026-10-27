"use strict";
// Atelier : les six postes de la camionnette, en cinq niveaux Mk I à V. Stats de base permanentes, toujours actives, hors emplacement.
// Achat : composants ◆ (Mk I à V) + pièces de secteur (Mk III à V). Design : docs/superpowers/specs/2026-10-27-progression-design.md §4.
// Valeurs et prix PROVISOIRES (réglés avec tools/sim_balance.py). Le Mk n REMPLACE le Mk n-1 : les valeurs sont absolues, pas cumulées.

const ATELIER_MAX = 5;
const ATELIER_COSTS = [40, 70, 120, 200, 340];                    // composants ◆ du Mk I au Mk V (même barème pour les six postes)
const ATELIER_PIECES = [null, null, { s1:2 }, { s2:3 }, { s3:4 }];  // pièces de secteur exigées par le Mk III, IV, V

// comment une valeur de la table se combine à makeDefaultStats()
const ATELIER_OPS = {
  maxHp:'add', armorPct:'add', collisionMul:'mul', hitGrace:'add',
  damage:'mul', fireRate:'mul', critChance:'add',
  shieldMax:'add', shieldRegenDelayMul:'mul',
  moveResponsiveness:'add', dodgeCharges:'set', secondSouffle:'set',
  magnetRadius:'add',
  cardChoices:'add', rerolls:'add', doubleCardChance:'add', bossReroll:'add', nebulaVision:'set',
};

// colonnes { champ: [Mk I … Mk V] } -> cinq lignes { champ: valeur }
function atelierRows(cols){
  return [0, 1, 2, 3, 4].map(i=>{ const row = {}; Object.keys(cols).forEach(k=>{ row[k] = cols[k][i]; }); return row; });
}

const ATELIER_POSTS = [
  { id:'coque', name:'COQUE', text:'Plaques boulonnées. Le véhicule survit, le dossier aussi.',
    mk: atelierRows({ maxHp:[40,80,130,190,260], armorPct:[0,.04,.08,.12,.16], collisionMul:[1,.9,.8,.7,.6], hitGrace:[0,0,50,100,150] }),
    shows:[ { label:'PV MAX', get:s=> String(Math.round(s.maxHp)) }, { label:'DEGATS SUBIS', get:s=> '-' + Math.round(s.armorPct*100) + ' %' } ] },
  { id:'canon', name:'CANON DE SERIE', text:'Le tir de base, révisé en atelier agréé.',
    mk: atelierRows({ damage:[1.10,1.25,1.45,1.70,2.00], fireRate:[.95,.90,.85,.80,.75], critChance:[0,0,.05,.10,.15] }),
    shows:[ { label:'DEGATS PAR TIR', get:s=> s.damage.toFixed(1) }, { label:'CADENCE', get:s=> (1000/s.fireRate).toFixed(1) + ' /s' }, { label:'CRITIQUE', get:s=> Math.round(s.critChance*100) + ' %' } ] },
  { id:'bouclier', name:'GENERATEUR DE BOUCLIER', text:'Un champ de sécurité. Il ne couvre pas les accidents du travail.',
    mk: atelierRows({ shieldMax:[30,60,100,150,210], shieldRegenDelayMul:[1,1,.85,.70,.55] }),
    shows:[ { label:'BOUCLIER MAX', get:s=> String(Math.round(s.shieldMax)) }, { label:'DELAI DE RECHARGE', get:s=> Math.round(s.shieldRegenDelayMul*100) + ' %' } ] },
  { id:'propulseurs', name:'PROPULSEURS', text:'Plus de poussée, moins de garantie.',
    mk: atelierRows({ moveResponsiveness:[2,5,9,14,20], dodgeCharges:[0,1,1,2,2], secondSouffle:[0,0,0,1,1] }),
    shows:[ { label:'REACTIVITE', get:s=> s.moveResponsiveness.toFixed(0) }, { label:'ESQUIVES', get:s=> String(s.dodgeCharges) }, { label:'SECOND SOUFFLE', get:s=> s.secondSouffle ? 'OUI' : 'NON' } ] },
  { id:'aimant', name:'AIMANT', text:'Ramasse tout ce qui traîne. Y compris les composants.',
    mk: atelierRows({ magnetRadius:[25,55,90,130,180] }),
    shows:[ { label:'PORTEE', get:s=> String(Math.round(s.magnetRadius)) } ] },
  { id:'ordinateur', name:'ORDINATEUR DE BORD', text:'Mises à jour N.O.R.M.A. Le consentement est réputé acquis.',
    mk: atelierRows({ cardChoices:[1,1,2,2,3], rerolls:[0,1,1,2,2], doubleCardChance:[0,0,.06,.06,.12], bossReroll:[0,0,0,1,1], nebulaVision:[0,0,1,1,2] }),
    shows:[ { label:'CHOIX DE CARTES', get:s=> String(s.cardChoices) }, { label:'RELANCES', get:s=> String(s.rerolls) } ] },
];

const ATELIER_POST_BY_ID = {};
ATELIER_POSTS.forEach(p=>{ ATELIER_POST_BY_ID[p.id] = p; });

// niveau Mk d'un poste lu dans une sauvegarde : entier de 0 à 5, 0 si absent ou invalide
function atelierMk(atelier, postId){
  const v = atelier && atelier[postId];
  return (typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.min(ATELIER_MAX, Math.floor(v))) : 0;
}

function atelierApplyRow(stats, row){
  Object.keys(row).forEach(k=>{
    const op = ATELIER_OPS[k];
    if (op === 'add') stats[k] += row[k]; else if (op === 'mul') stats[k] *= row[k]; else stats[k] = row[k];
  });
}

// ajoute à `stats` (makeDefaultStats) l'effet du Mk acheté de chaque poste
function atelierApply(stats, atelier){
  ATELIER_POSTS.forEach(p=>{ const mk = atelierMk(atelier, p.id); if (mk > 0) atelierApplyRow(stats, p.mk[mk - 1]); });
}

// lignes d'affichage du garage pour un poste au niveau `mk` (0 = camionnette de base) : [{ label, value }]
function atelierShows(postId, mk){
  const p = ATELIER_POST_BY_ID[postId], s = makeDefaultStats();
  if (mk > 0) atelierApplyRow(s, p.mk[mk - 1]);
  return p.shows.map(l=> ({ label:l.label, value:l.get(s) }));
}

// prix du Mk suivant (le poste est actuellement au Mk `mk`) : { composants, pieces } ou null s'il est au maximum
function atelierNextCost(postId, mk){
  if (mk >= ATELIER_MAX) return null;
  return { composants: ATELIER_COSTS[mk], pieces: ATELIER_PIECES[mk] };
}

// { ok, reason } : reason = null | 'max' | 'composants' | 'pieces'
function atelierCanBuy(meta, postId){
  const cost = atelierNextCost(postId, atelierMk(meta.atelier, postId));
  if (!cost) return { ok:false, reason:'max' };
  if (meta.composants < cost.composants) return { ok:false, reason:'composants' };
  if (cost.pieces && Object.keys(cost.pieces).some(k=> ((meta.pieces && meta.pieces[k]) || 0) < cost.pieces[k])) return { ok:false, reason:'pieces' };
  return { ok:true, reason:null };
}

// achète le Mk suivant : débite `meta`, renvoie true ; sinon false sans rien modifier
function atelierBuy(meta, postId){
  if (!atelierCanBuy(meta, postId).ok) return false;
  const mk = atelierMk(meta.atelier, postId), cost = atelierNextCost(postId, mk);
  meta.composants -= cost.composants;
  if (cost.pieces) Object.keys(cost.pieces).forEach(k=>{ meta.pieces[k] -= cost.pieces[k]; });
  meta.atelier[postId] = mk + 1;
  return true;
}
