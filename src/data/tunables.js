"use strict";
// Registre des réglages internes des boss et mobs spéciaux (éditeur de niveaux, JSON `bossTune`).
// Les constantes AR / MT / RX / AN / PD / BRAS / PIL / EC restent dans leurs modules ; ce fichier ne liste que leurs NOMBRES réglables
// (scalaires et tableaux de nombres). Coordonnées (bays, anchors, ports...), régions, géométrie de sprite et séquences d'attaques n'y sont pas.
// FORMAT (lu par tools/level_files.py, à conserver) : un id par ligne `  id: [`, puis une entrée par ligne commençant par quatre espaces
//   `{ path:'dmg.missile', [len:N,] label:'...', min:0, max:60, step:1, unit:'...', help:'...' },`
//   path = chemin pointé dans la constante (« count.beam », « thresh ») ; len = tableau de N nombres (à fournir en entier, bornes par élément) ;
//   ordered:'desc'|'asc' (après len, facultatif) = le tableau doit être décroissant / croissant (paliers d'usure) : refusé sinon par level_files.py et l'éditeur.
// JSON : "bossTune": { "ar": { "hp": 2000, "dmg.missile": 20, "gap": [300, 250, 200, 100] } }
// tunablesApply(lvDef) est appelé au début de chaque mission (GameScene.create) : il remet D'ABORD toutes les valeurs d'origine, PUIS applique lvDef.bossTune.
// AJOUTER UN RÉGLAGE : ajouter une ligne ici (chemin existant dans la constante, valeur d'origine dans les bornes), relancer tools/tunables_test.py.
const TUNABLES = {
  // Boss du secteur 2 (bosses/w2.js, configs dans data/boss-w2.js : BOSS_W2.<boss>)
  cb: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie du Crabe à scies' },
    { path:'thresh', len:2, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état d\'usure suivant (2 paliers décroissants)' },
    { path:'dmg.saw', label:'Dégâts scie', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : scie' },
    { path:'dmg.shard', label:'Dégâts éclat', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : éclat' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : contact' },
  ],
  ic: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie du Incinérateur' },
    { path:'thresh', len:2, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état d\'usure suivant (2 paliers décroissants)' },
    { path:'dmg.fire', label:'Dégâts flamme', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : flamme' },
    { path:'dmg.orb', label:'Dégâts orbe de feu', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : orbe de feu' },
    { path:'dmg.lava', label:'Dégâts boule de lave', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : boule de lave' },
    { path:'dmg.shard', label:'Dégâts éclat', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : éclat' },
    { path:'dmg.zone', label:'Dégâts flaque brûlante', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : flaque brûlante' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : contact' },
  ],
  bn: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie du Benne folle' },
    { path:'thresh', len:2, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état d\'usure suivant (2 paliers décroissants)' },
    { path:'dmg.cube', label:'Dégâts cube de ferraille', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : cube de ferraille' },
    { path:'dmg.shard', label:'Dégâts éclat', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : éclat' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : contact' },
  ],
  by: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie du Broyeur' },
    { path:'thresh', len:2, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état d\'usure suivant (2 paliers décroissants)' },
    { path:'dmg.tooth', label:'Dégâts dent', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : dent' },
    { path:'dmg.shard', label:'Dégâts éclat', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : éclat' },
    { path:'dmg.piston', label:'Dégâts bras à pistons', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : bras à pistons' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : contact' },
  ],
  rp: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie du Réparateur en chef' },
    { path:'thresh', len:2, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état d\'usure suivant (2 paliers décroissants)' },
    { path:'dmg.beam', label:'Dégâts chalumeau', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : chalumeau' },
    { path:'dmg.drone', label:'Dégâts drone', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : drone' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts : contact' },
  ],
  // Araignée de tri (bosses/araignee.js, AR)
  ar: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie de l\'Araignée de tri' },
    { path:'thresh', len:3, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état suivant (3 paliers décroissants)' },
    { path:'count.missiles', len:4, label:'Missiles', min:0, max:20, step:1, unit:'par attaque', help:'Missiles par attaque, par état d\'usure' },
    { path:'count.scrap', len:4, label:'Ferraille', min:0, max:20, step:1, unit:'par attaque', help:'Débris de ferraille par attaque, par état d\'usure' },
    { path:'count.beam', len:4, label:'Faisceau', min:0.1, max:10, step:0.1, unit:'par attaque', help:'Durée du faisceau en secondes, par état d\'usure' },
    { path:'gap', len:4, label:'Pause entre attaques', min:20, max:600, step:10, unit:'images', help:'Pause entre deux attaques, par état d\'usure (60 images = 1 s)' },
    { path:'speed', label:'Vitesse des tirs', min:0.2, max:4, step:0.1, unit:'x', help:'Multiplicateur de vitesse des projectiles' },
    { path:'dmg.missile', label:'Dégâts missile', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un missile' },
    { path:'dmg.scrap', label:'Dégâts ferraille', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un débris' },
    { path:'dmg.beam', label:'Dégâts faisceau', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts du faisceau' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts au contact du boss' },
    { path:'critMul', label:'Multiplicateur de critique', min:1, max:10, step:0.1, unit:'x', help:'Dégâts reçus quand le point faible est touché' },
    { path:'killScore', label:'Score à la mort', min:0, max:20000, step:50, unit:'pts', help:'Points gagnés en détruisant le boss' },
  ],
  // La Météo (bosses/meteo.js, MT)
  mt: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie de La Météo' },
    { path:'thresh', len:3, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état suivant (3 paliers décroissants)' },
    { path:'count.storm', len:4, label:'Éclairs', min:0, max:20, step:1, unit:'par attaque', help:'Éclairs par attaque, par état d\'usure' },
    { path:'count.hail', len:4, label:'Grêle', min:0, max:20, step:1, unit:'par attaque', help:'Salves de grêle par attaque, par état d\'usure' },
    { path:'count.front', len:4, label:'Fronts', min:0, max:20, step:1, unit:'par attaque', help:'Rideaux orageux par attaque, par état d\'usure' },
    { path:'gap', len:4, label:'Pause entre attaques', min:20, max:600, step:10, unit:'images', help:'Pause entre deux attaques, par état d\'usure (60 images = 1 s)' },
    { path:'speed', label:'Vitesse des tirs', min:0.2, max:4, step:0.1, unit:'x', help:'Multiplicateur de vitesse des projectiles' },
    { path:'dmg.strike', label:'Dégâts éclair', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un éclair' },
    { path:'dmg.hail', label:'Dégâts grêle', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un grêlon' },
    { path:'dmg.front', label:'Dégâts front', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts du front orageux' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts au contact du boss' },
    { path:'critMul', label:'Multiplicateur de critique', min:1, max:10, step:0.1, unit:'x', help:'Dégâts reçus quand le point faible est touché' },
    { path:'killScore', label:'Score à la mort', min:0, max:20000, step:50, unit:'pts', help:'Points gagnés en détruisant le boss' },
  ],
  // Le Réacteur (bosses/reacteur.js, RX)
  rx: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie du Réacteur' },
    { path:'thresh', len:3, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état suivant (3 paliers décroissants)' },
    { path:'critR', label:'Rayon du point faible', min:10, max:120, step:1, unit:'px', help:'Taille de la zone de coup critique' },
    { path:'count.ray', len:4, label:'Anneaux', min:0, max:20, step:1, unit:'par attaque', help:'Anneaux de rayonnement par attaque, par état d\'usure' },
    { path:'count.rods', len:4, label:'Barres', min:0, max:20, step:1, unit:'par attaque', help:'Volées de barres par attaque, par état d\'usure' },
    { path:'count.spray', len:4, label:'Arroseur', min:0.1, max:600, step:10, unit:'par attaque', help:'Durée du jet en images, par état d\'usure' },
    { path:'gap', len:4, label:'Pause entre attaques', min:20, max:600, step:10, unit:'images', help:'Pause entre deux attaques, par état d\'usure (60 images = 1 s)' },
    { path:'speed', label:'Vitesse des tirs', min:0.2, max:4, step:0.1, unit:'x', help:'Multiplicateur de vitesse des projectiles' },
    { path:'dmg.ring', label:'Dégâts anneau', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un anneau' },
    { path:'dmg.glob', label:'Dégâts barre', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'une barre' },
    { path:'dmg.patch', label:'Dégâts flaque', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'une flaque de feu' },
    { path:'dmg.stream', label:'Dégâts jet', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts du jet' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts au contact du boss' },
    { path:'killScore', label:'Score à la mort', min:0, max:20000, step:50, unit:'pts', help:'Points gagnés en détruisant le boss' },
  ],
  // L'Anneau (bosses/anneau.js, AN)
  an: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie de L\'Anneau' },
    { path:'thresh', len:3, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état suivant (3 paliers décroissants)' },
    { path:'critR', label:'Rayon du point faible', min:10, max:120, step:1, unit:'px', help:'Taille de la zone de coup critique' },
    { path:'spin', len:4, label:'Rotation de l\'anneau', min:0, max:3, step:0.01, unit:'x', help:'Vitesse de rotation de l\'anneau, par état d\'usure (il se grippe)' },
    { path:'dmg.beam', label:'Dégâts rayon', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un rayon' },
    { path:'dmg.orb', label:'Dégâts orbe', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'une salve de tourelle' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts au contact du boss' },
    { path:'killScore', label:'Score à la mort', min:0, max:20000, step:50, unit:'pts', help:'Points gagnés en détruisant le boss' },
  ],
  // Le PDG dans sa tour (bosses/pdg.js, PD)
  pd: [
    { path:'hp', label:'PV', min:50, max:20000, step:50, unit:'PV', help:'Points de vie de la tour du PDG' },
    { path:'thresh', len:3, ordered:'desc', label:'Paliers d\'usure', min:1, max:99, step:1, unit:'% de vie', help:'Pourcentage de vie sous lequel le boss passe à l\'état suivant (3 paliers décroissants)' },
    { path:'critR', label:'Rayon du point faible', min:10, max:120, step:1, unit:'px', help:'Taille de la zone de coup critique' },
    { path:'mob.hp', label:'PV vaisseau', min:20, max:5000, step:10, unit:'PV', help:'Points de vie d\'un vaisseau « Le PDG »' },
    { path:'mob.states', len:3, ordered:'desc', label:'États du vaisseau', min:0.01, max:0.99, step:0.01, unit:'fraction', help:'Fractions de vie des états d\'usure du vaisseau' },
    { path:'guard.hp', label:'PV agent', min:20, max:5000, step:10, unit:'PV', help:'Points de vie d\'un agent de sécurité' },
    { path:'guard.crack', label:'Fissure de l\'agent', min:0.01, max:0.99, step:0.01, unit:'fraction', help:'Fraction de vie sous laquelle l\'agent gelé se fissure' },
    { path:'dmg.orb', label:'Dégâts pièce', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'une pièce d\'or' },
    { path:'dmg.beam', label:'Dégâts rayon', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un rayon solaire' },
    { path:'dmg.contact', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts au contact du boss' },
    { path:'killScore', label:'Score à la mort', min:0, max:20000, step:50, unit:'pts', help:'Points gagnés en détruisant le boss' },
  ],
  // Bras écartés (enemies/bras.js, BRAS)
  bras: [
    { path:'hp', label:'PV', min:5, max:2000, step:5, unit:'PV', help:'Points de vie du mob Bras écartés' },
    { path:'states', len:3, ordered:'desc', label:'États d\'usure', min:0.01, max:0.99, step:0.01, unit:'fraction', help:'Fraction de vie sous laquelle on passe à l\'état suivant (3 paliers décroissants)' },
    { path:'cooldown', len:4, label:'Pause entre salves', min:0, max:10000, step:50, unit:'ms', help:'Pause entre deux salves selon le tier d\'intelligence (le premier élément, tier 1, n\'est pas utilisé)' },
    { path:'shotSpeed', label:'Vitesse du tir', min:20, max:800, step:10, unit:'px/s', help:'Vitesse des projectiles' },
    { path:'shotDmg', label:'Dégâts du tir', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un projectile' },
    { path:'shotGravity', label:'Gravité du tir', min:0, max:400, step:5, unit:'px/s²', help:'Courbure des projectiles vers le bas' },
    { path:'salvos', label:'Salves', min:1, max:10, step:1, unit:'salves', help:'Salves tirées à l\'arrêt, plus le tier, avant de repartir' },
  ],
  // Pilleur de cristaux (enemies/pilleur.js, PIL)
  pil: [
    { path:'hp', label:'PV', min:5, max:2000, step:5, unit:'PV', help:'Points de vie du Pilleur de cristaux' },
    { path:'states', len:3, ordered:'desc', label:'États d\'usure', min:0.01, max:0.99, step:0.01, unit:'fraction', help:'Fraction de vie sous laquelle on passe à l\'état suivant (3 paliers décroissants)' },
    { path:'rs', label:'Portée d\'aspiration', min:20, max:600, step:5, unit:'px', help:'Distance à laquelle il aspire les cristaux' },
    { path:'cap', label:'Capacité du réservoir', min:1, max:100, step:1, unit:'cristaux', help:'Cristaux stockés avant le laser plein' },
    { path:'dmg.beam', label:'Dégâts du laser', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts du laser continu' },
  ],
  // Éclaireur de patrouille (enemies/eclaireur.js, EC)
  ec: [
    { path:'hp', label:'PV', min:5, max:2000, step:5, unit:'PV', help:'Points de vie de l\'Éclaireur de patrouille' },
    { path:'states', len:3, ordered:'desc', label:'États d\'usure', min:0.01, max:0.99, step:0.01, unit:'fraction', help:'Fraction de vie sous laquelle on passe à l\'état suivant (3 paliers décroissants)' },
    { path:'reach', label:'Portée du faisceau', min:100, max:3000, step:50, unit:'unités', help:'Portée du projecteur ; doit couvrir tout l\'écran' },
    { path:'dmg.orb', label:'Dégâts du tir', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un tir de canon latéral' },
  ],
  // Antenne-Mère (tuto) : SCHÉMA SEULEMENT. Les valeurs vivent dans tutorial.boss du JSON du tuto (TUTO_TUNE.boss) ; bossTune.antenne est refusé.
  antenne: [
    { path:'hp', label:'PV', min:50, max:5000, step:50, unit:'PV', help:'Points de vie de l\'Antenne-Mère' },
    { path:'p2', label:'Phase 2', min:0.05, max:0.95, step:0.01, unit:'fraction', help:'Fraction de vie du passage en phase 2' },
    { path:'p3', label:'Phase 3', min:0.05, max:0.95, step:0.01, unit:'fraction', help:'Fraction de vie du passage en phase 3' },
    { path:'contactDmg', label:'Dégâts contact', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts au contact' },
    { path:'killScore', label:'Score à la mort', min:0, max:5000, step:10, unit:'pts', help:'Points gagnés' },
    { path:'aimCd', label:'Visée : pause', min:200, max:10000, step:50, unit:'ms', help:'Pause entre deux tirs visés' },
    { path:'aimCd3', label:'Visée : pause (phase 3)', min:200, max:10000, step:50, unit:'ms', help:'Idem en phase 3' },
    { path:'aimDmg', label:'Visée : dégâts', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un tir visé' },
    { path:'aimSpeed', label:'Visée : vitesse', min:20, max:800, step:10, unit:'px/s', help:'Vitesse d\'un tir visé' },
    { path:'ringCd', label:'Anneau : pause', min:500, max:20000, step:100, unit:'ms', help:'Pause entre deux anneaux' },
    { path:'ringCount', label:'Anneau : tirs', min:4, max:64, step:1, unit:'tirs', help:'Projectiles par anneau' },
    { path:'ringGap', label:'Anneau : passage', min:1, max:8, step:1, unit:'tirs', help:'Largeur du passage' },
    { path:'ringDmg', label:'Anneau : dégâts', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts d\'un tir d\'anneau' },
    { path:'ringSpeed', label:'Anneau : vitesse', min:20, max:800, step:5, unit:'px/s', help:'Vitesse des tirs d\'anneau' },
    { path:'rainCd', label:'Pluie : pause', min:200, max:10000, step:50, unit:'ms', help:'Pause entre deux pluies' },
    { path:'rainDmg', label:'Pluie : dégâts', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts de la pluie' },
    { path:'rainSpeed', label:'Pluie : vitesse', min:20, max:800, step:5, unit:'px/s', help:'Vitesse de la pluie' },
    { path:'spiralCd', label:'Spirale : pause', min:20, max:2000, step:10, unit:'ms', help:'Pause entre deux tirs de spirale' },
    { path:'spiralDmg', label:'Spirale : dégâts', min:0, max:60, step:1, unit:'dégâts', help:'Dégâts de la spirale' },
    { path:'spiralSpeed', label:'Spirale : vitesse', min:20, max:800, step:5, unit:'px/s', help:'Vitesse de la spirale' },
  ],
};

// Racines : id -> constante vivante. `antenne` (TUTO_TUNE.boss) n'est pas gérée ici (schéma seulement).
const TUNABLE_ROOTS = { ar:()=> AR, mt:()=> MT, rx:()=> RX, an:()=> AN, pd:()=> PD, cb:()=> BOSS_W2.crabe, ic:()=> BOSS_W2.incinerateur, bn:()=> BOSS_W2.benne, by:()=> BOSS_W2.broyeur, rp:()=> BOSS_W2.reparateur, bras:()=> BRAS, pil:()=> PIL, ec:()=> EC };
const TUNABLES_PRISTINE = {};

function tunablePathGet(root, path){
  const ks = path.split('.'); let o = root;
  for (let i = 0; i < ks.length - 1; i++){ o = o && o[ks[i]]; if (o == null) return null; }
  return { o, k:ks[ks.length - 1] };
}

// À appeler une fois, quand tous les modules de boss et de mobs sont chargés : copie les valeurs d'origine.
function tunablesCapture(){
  Object.keys(TUNABLE_ROOTS).forEach(id=>{
    TUNABLES_PRISTINE[id] = {};
    TUNABLES[id].forEach(r=>{
      const h = tunablePathGet(TUNABLE_ROOTS[id](), r.path), v = h && h.o[h.k];
      TUNABLES_PRISTINE[id][r.path] = Array.isArray(v) ? v.slice() : v;
    });
  });
}

function tunableSet(h, v){
  if (Array.isArray(h.o[h.k])){ for (let i = 0; i < v.length; i++) h.o[h.k][i] = v[i]; }      // en place : les références au tableau restent valides
  else h.o[h.k] = v;
}

// Remet toutes les valeurs d'origine, puis applique lvDef.bossTune (absent ou null : simple remise à zéro, pour qu'aucune valeur ne fuie d'une partie à la suivante).
function tunablesApply(lvDef){
  Object.keys(TUNABLE_ROOTS).forEach(id=>{
    TUNABLES[id].forEach(r=>{ const h = tunablePathGet(TUNABLE_ROOTS[id](), r.path); if (h) tunableSet(h, TUNABLES_PRISTINE[id][r.path]); });
  });
  const bt = lvDef && lvDef.bossTune; if (!bt) return;
  Object.keys(bt).forEach(id=>{
    if (!TUNABLE_ROOTS[id]) return;
    TUNABLES[id].forEach(r=>{
      if (!(r.path in bt[id])) return;
      const v = bt[id][r.path], h = tunablePathGet(TUNABLE_ROOTS[id](), r.path), pr = TUNABLES_PRISTINE[id][r.path];
      if (!h) return;
      if (Array.isArray(pr)){ if (Array.isArray(v) && v.length === pr.length && v.every(Number.isFinite)) tunableSet(h, v); }
      else if (Number.isFinite(v)) tunableSet(h, v);
    });
  });
}

tunablesCapture();
