"use strict";
// Arbre de compétences : branches, nœuds, positions à l'écran, déblocage.

/* =========================================================
   PERMANENT SKILL TREE — Cœur du vaisseau + 4 branches
========================================================= */
function mkCost(base, step){ return (lvl)=> base + lvl*step; }


const TREE_BRANCHES = [
  { id:'arme', name:'Arme principale', color:'#ff7a45',
    stem:[
      [ {id:'t_puissance', icon:'💪', name:'PUISSANCE', desc:'+10% dégâts de départ / niveau.', max:6, cost:mkCost(6,5),
         apply:(s,l)=>{ s.damage *= (1+0.10*l); } },
        {id:'t_celerite', icon:'⏱️', name:'CELERITE', desc:'+6% cadence de départ / niveau.', max:6, cost:mkCost(6,5),
         apply:(s,l)=>{ s.fireRate *= (1-0.06*l); } } ],
      [ {id:'t_degats', icon:'💥', name:'DEGATS+', desc:'+5% dégâts permanents / niveau.', max:8, cost:mkCost(7,5),
         apply:(s,l)=>{ s.damage *= (1+0.05*l); } },
        {id:'t_cadence', icon:'⚡', name:'CADENCE+', desc:'+3% cadence permanente / niveau.', max:6, cost:mkCost(7,5),
         apply:(s,l)=>{ s.fireRate *= (1-0.03*l); } } ],
      [ {id:'t_multi', icon:'🔱', name:'TIR MULTIPLE', desc:'+1 projectile de départ tous les 2 niveaux.', max:4, cost:mkCost(10,8),
         apply:(s,l)=>{ s.spreadCount += Math.floor(l/2); } },
        {id:'t_perforant', icon:'➡️', name:'PERFORANT', desc:'+1 perforation de départ tous les 2 niveaux.', max:3, cost:mkCost(10,8),
         apply:(s,l)=>{ s.pierce += Math.floor(l/2); } },
        {id:'t_percebouclier', icon:'🛡️➡️', name:'TRANSPERCE-BOUCLIER', desc:"Tes tirs perforants traversent aussi les boucliers ennemis (sinon ils s'arrêtent dessus tant qu'il est debout).", max:1, cost:mkCost(12,10),
         apply:(s,l)=>{ s.shieldPierce = l; } } ],
      [ {id:'t_velocite', icon:'✨', name:'VELOCITE', desc:'+5% vitesse des tirs / niveau.', max:4, cost:mkCost(8,6),
         apply:(s,l)=>{ s.bulletSpeed *= (1+0.05*l); } },
        {id:'t_critique', icon:'🎯', name:'CRITIQUE', desc:'+3% chance de coup critique (x2 dégâts) / niveau.', max:5, cost:mkCost(9,7),
         apply:(s,l)=>{ s.critChance += 0.03*l; } } ],
    ],
    forkThreshold: 14,
    forks:[
      { keystone:{id:'t_laser_c', icon:'🔫', name:'LASER CONTINU', desc:"Débloque un laser perforant comme arme (proposé en jeu).", max:1, cost:mkCost(30,0) },
        path:[
          {id:'t_laser_c_portee', icon:'📏', name:'PORTEE LASER', desc:'+10% vitesse du laser / niveau.', max:4, cost:mkCost(10,8),
           apply:(s,l)=>{ s.laserSpeedBonus = 0.10*l; } },
          {id:'t_laser_c_degats', icon:'💥', name:'DEGATS LASER+', desc:'+15% dégâts du laser / niveau.', max:5, cost:mkCost(10,8),
           apply:(s,l)=>{ s.laserDamageBonus = 0.15*l; } } ],
        cap:{id:'t_laser_c_cap', icon:'☄️', name:'LASER DESTRUCTEUR', desc:"Après 2s de tir continu, le laser double ses dégâts.", max:1, cost:mkCost(40,0) } },
      { keystone:{id:'t_laser_a', icon:'🎯', name:'LASER AUTO-CIBLEUR', desc:"Débloque un laser qui verrouille l'ennemi le plus proche (proposé en jeu).", max:1, cost:mkCost(30,0) },
        path:[
          {id:'t_laser_a_verrou', icon:'🔒', name:'VERROUILLAGE+', desc:'Verrouille la cible plus vite.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.laserLockBonus = l; } },
          {id:'t_laser_a_priorite', icon:'🧠', name:'CIBLAGE PRIORITAIRE', desc:'Vise en priorité les ennemis à faibles PV.', max:3, cost:mkCost(10,8),
           apply:(s,l)=>{ s.laserPriority = true; } } ],
        cap:{id:'t_laser_a_cap', icon:'🌐', name:'RETICULE OMNISCIENT', desc:"Verrouille 3 cibles à la fois au lieu d'une.", max:1, cost:mkCost(40,0) } },
      { keystone:{id:'t_shotgun', icon:'💠', name:'SHOTGUN', desc:"Débloque une salve en cône (proposée en jeu), plus lente mais plus lourde.", max:1, cost:mkCost(30,0) },
        path:[
          {id:'t_shotgun_plombs', icon:'🔵', name:'PLUS DE PLOMBS', desc:'+1 plomb / niveau.', max:4, cost:mkCost(10,8),
           apply:(s,l)=>{ s.shotgunExtraPellets = l; } },
          {id:'t_shotgun_recul', icon:'🌀', name:'RECUL MAITRISE', desc:'Réduit la perte de cadence du shotgun.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.shotgunRecoilReduction = 0.12*l; } } ],
        cap:{id:'t_shotgun_cap', icon:'💥', name:'CANON A FRAGMENTATION', desc:'Chaque plomb touché se fragmente en 2 éclats.', max:1, cost:mkCost(40,0) } },
    ]
  },
  { id:'missile', name:'Missiles', color:'#ff3f6e',
    stem:[
      [ {id:'t_lancemissiles', icon:'🚀', name:'LANCE-MISSILES', desc:"Débloque l'emplacement de missiles (proposé en jeu dès le niveau 5).", max:1, cost:mkCost(14,0) },
        {id:'t_chargemissiles', icon:'📦', name:'CHARGE', desc:'+1 missile de départ par salve tous les 2 niveaux.', max:4, cost:mkCost(9,7),
         apply:(s,l)=>{ s.missileCount += Math.floor(l/2); } } ],
      [ {id:'t_cadmissiles', icon:'⏫', name:'CADENCE MISSILES', desc:'Tire les missiles plus souvent / niveau.', max:4, cost:mkCost(9,7),
         apply:(s,l)=>{ s.missileFireRateMul *= Math.pow(0.92,l); } },
        {id:'t_explosion', icon:'🌋', name:'RAYON EXPLOSION', desc:"+20% rayon d'explosion / niveau.", max:3, cost:mkCost(10,8),
         apply:(s,l)=>{ s.missileBlastBonus = 0.2*l; } } ],
      [ {id:'t_perforantmissile', icon:'🛡️➡️', name:'PERFORANTS', desc:'Les missiles traversent 1 ennemi de plus / niveau.', max:3, cost:mkCost(11,9),
         apply:(s,l)=>{ s.missilePierce = l; } },
        {id:'t_napalm', icon:'🔥', name:'TETE INCENDIAIRE', desc:"Laisse une zone de dégâts au sol après l'impact.", max:3, cost:mkCost(12,9),
         apply:(s,l)=>{ s.missileNapalm = l; } } ],
      [ {id:'t_stabilisateurs', icon:'🧭', name:'STABILISATEURS', desc:'Missiles mieux calibrés : +10% de dégâts de missile / niveau.', max:3, cost:mkCost(8,6),
         apply:(s,l)=>{ s.missileDamageBonus += 0.10*l; } },
        {id:'t_rechargerapide', icon:'⏳', name:'RECHARGE RAPIDE', desc:'Réduit le délai entre deux salves de missiles.', max:3, cost:mkCost(9,7),
         apply:(s,l)=>{ s.missileFireRateMul *= Math.pow(0.9,l); } } ],
    ],
    forkThreshold: 10,
    forks:[
      { keystone:{id:'t_missile_droit', icon:'➡️', name:'MISSILES DROITS', desc:"Les missiles partent tout droit et explosent en zone à l'impact.", max:1, cost:mkCost(26,0) },
        path:[
          {id:'t_missile_droit_vitesse', icon:'💨', name:'VITESSE MISSILE', desc:'+10% vitesse / niveau.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.missileSpeedBonus = 0.1*l; } },
          {id:'t_missile_droit_charge', icon:'🧨', name:'CHARGE LOURDE', desc:"+15% dégâts d'explosion / niveau.", max:4, cost:mkCost(10,8),
           apply:(s,l)=>{ s.missileDamageBonus = 0.15*l; } } ],
        cap:{id:'t_missile_droit_cap', icon:'☢️', name:'MISSILE NUCLEAIRE', desc:'Un missile dévastateur part tout droit périodiquement et rase une immense zone.', max:1, cost:mkCost(38,0) } },
      { keystone:{id:'t_missile_chercheur', icon:'🧭', name:'MISSILES CHERCHEURS', desc:"Les missiles sont auto-guidés vers l'ennemi le plus proche.", max:1, cost:mkCost(26,0) },
        path:[
          {id:'t_missile_chercheur_multi', icon:'🎯', name:'VERROU. MULTIPLE', desc:'Les missiles chercheurs se répartissent sur plusieurs cibles (+1 cible / niveau).', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.missileMultiLock = l; } },
          {id:'t_missile_chercheur_cad', icon:'⏫', name:'CADENCE+', desc:'Tire les missiles chercheurs plus souvent.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.missileFireRateMul *= Math.pow(0.92,l); } } ],
        cap:{id:'t_missile_chercheur_cap', icon:'☄️', name:"ESSAIM D'AUTOMISSILES", desc:'Une nuée de petits missiles auto-guidés est tirée en continu autour du vaisseau.', max:1, cost:mkCost(38,0) } },
    ]
  },
  { id:'defense', name:'Défense & vitalité', color:'#33e0a1',
    stem:[
      [ {id:'t_vitalite', icon:'❤️', name:'VITALITE', desc:'+15 PV de départ / niveau.', max:6, cost:mkCost(6,5),
         apply:(s,l)=>{ s.maxHp += 15*l; } },
        {id:'t_boucliergrowth', icon:'🔷', name:'BOUCLIER+', desc:'+20 PV de bouclier de départ / niveau.', max:3, cost:mkCost(10,8),
         apply:(s,l)=>{ s.shieldMax += 20*l; } } ],
      [ {id:'t_blindage', icon:'🧱', name:'BLINDAGE+', desc:'+20 PV max permanents / niveau. -10% de dégâts de collision / niveau.', max:6, cost:mkCost(7,5),
         apply:(s,l)=>{ s.maxHp += 20*l; s.collisionMul *= Math.pow(0.9, l); } },
        {id:'t_bouclier', icon:'🛡️', name:'BOUCLIER', desc:'+30 PV de bouclier permanents / niveau.', max:4, cost:mkCost(9,7),
         apply:(s,l)=>{ s.shieldMax += 30*l; } } ],
      [ {id:'t_regen', icon:'💧', name:'REGENERATION', desc:'Régénère 0.5% des PV max chaque seconde / niveau.', max:5, cost:mkCost(9,7),
         apply:(s,l)=>{ s.hpRegenPct = 0.005*l; } },
        {id:'t_rechargebouclier', icon:'⏱️', name:'RECHARGE BOUCLIER', desc:'-15% délai avant régén. du bouclier / niveau.', max:4, cost:mkCost(8,6),
         apply:(s,l)=>{ s.shieldRegenDelayMul = Math.pow(0.85,l); } } ],
      [ {id:'t_esquive', icon:'💨', name:'ESQUIVE', desc:'Double-tap : dash bref avec immunité (charges par run).', max:3, cost:mkCost(16,10),
         apply:(s,l)=>{ s.dodgeCharges = l; } },
        {id:'t_armure', icon:'🪖', name:'ARMURE', desc:'-4% dégâts subis / niveau.', max:5, cost:mkCost(10,8),
         apply:(s,l)=>{ s.armorPct = Math.min(0.6, 0.04*l); } } ],
      [ {id:'t_voldevie', icon:'🩸', name:'VOL DE VIE', desc:'+0,1% des dégâts infligés restitués en PV / niveau.', max:5, cost:mkCost(11,9),
         apply:(s,l)=>{ s.lifesteal = 0.001*l; } },
        {id:'t_reactif', icon:'🌀', name:'BOUCLIER REACTIF', desc:'Le bouclier renvoie une onde de dégâts autour de lui quand il encaisse un coup.', max:3, cost:mkCost(12,9),
         apply:(s,l)=>{ s.shieldReflect = l; } } ],
      [ {id:'t_resilience', icon:'♻️', name:'RESILIENCE', desc:"+50 ms d'invincibilité après un coup / niveau (350 ms de base).", max:4, cost:mkCost(9,7),
         apply:(s,l)=>{ s.hitGrace = 50*l; } },
        {id:'t_secondsouffle', icon:'🌬️', name:'SECOND SOUFFLE', desc:"Après une esquive, gagnez un petit bouclier temporaire.", max:3, cost:mkCost(12,9),
         apply:(s,l)=>{ s.secondSouffle = l; } } ],
    ],
    forkThreshold: 14,
    forks:[
      { keystone:{id:'t_forteresse', icon:'🏰', name:'FORTERESSE', desc:'+50% PV max, -15% de dégâts de collision, mais -20% de réactivité du vaisseau.', max:1, cost:mkCost(28,0),
         apply:(s)=>{ s.maxHp *= 1.5; s.moveResponsiveness *= 0.8; s.collisionMul *= 0.85; } },
        path:[
          {id:'t_forteresse_resist', icon:'🧱', name:'RESISTANCE+', desc:'-3% dégâts subis supplémentaires et -7% de dégâts de collision / niveau.', max:5, cost:mkCost(10,8),
           apply:(s,l)=>{ s.armorPct = Math.min(0.75, s.armorPct + 0.03*l); s.collisionMul *= Math.pow(0.93, l); } },
          {id:'t_forteresse_regen', icon:'💧', name:'REGEN BLINDEE', desc:'+0.3% PV max régénérés par seconde / niveau.', max:4, cost:mkCost(10,8),
           apply:(s,l)=>{ s.hpRegenPct += 0.003*l; } } ],
        cap:{id:'t_forteresse_cap', icon:'🛡️', name:'AURA DE FER', desc:'+25% PV max, -15% dégâts subis supplémentaires et -20% de dégâts de collision.', max:1, cost:mkCost(40,0),
         apply:(s)=>{ s.maxHp *= 1.25; s.armorPct = Math.min(0.8, s.armorPct + 0.15); s.collisionMul *= 0.8; } } },
      { keystone:{id:'t_phenix', icon:'🕊️', name:'PHENIX', desc:'Revient une fois à la vie avec 50% des PV.', max:1, cost:mkCost(28,0) },
        path:[
          {id:'t_phenix_esquive', icon:'💨', name:'ESQUIVE+', desc:"+1 charge d'esquive supplémentaire / niveau.", max:3, cost:mkCost(12,9),
           apply:(s,l)=>{ s.dodgeCharges += l; } },
          {id:'t_phenix_bouclier', icon:'🔷', name:'RENAISSANCE BOUCLIER', desc:'+15 PV de bouclier permanents / niveau.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.shieldMax += 15*l; } } ],
        cap:{id:'t_phenix_cap', icon:'✨', name:'IMMORTEL', desc:'Peut revenir à la vie une seconde fois pendant la run.', max:1, cost:mkCost(40,0) } },
      { keystone:{id:'t_sangsue', icon:'🩸', name:'SANGSUE', desc:'Chaque ennemi tué à proximité soigne une petite zone autour du vaisseau.', max:1, cost:mkCost(28,0) },
        path:[
          {id:'t_sangsue_vol', icon:'🩸', name:'VOL+', desc:'+0,1% des dégâts infligés restitués en PV / niveau.', max:5, cost:mkCost(10,8),
           apply:(s,l)=>{ s.lifesteal += 0.001*l; } },
          {id:'t_sangsue_rayon', icon:'🌐', name:'RAYON+', desc:'Agrandit la zone de soin du Sangsue / niveau.', max:3, cost:mkCost(9,7),
           apply:(s,l)=>{ s.sangsueRadiusBonus += 20*l; } } ],
        cap:{id:'t_sangsue_cap', icon:'🍷', name:'FESTIN', desc:'Le soin de zone du Sangsue est doublé.', max:1, cost:mkCost(40,0),
         apply:(s)=>{ s.sangsueHealMul = (s.sangsueHealMul||1) * 2; } } },
    ]
  },
  { id:'util', name:'Mobilité & utilitaire', color:'#38c6ff',
    stem:[
      [ {id:'t_aimantgrowth', icon:'🧲', name:'AIMANT+', desc:"+15 portée d'aimant de départ / niveau.", max:5, cost:mkCost(6,5),
         apply:(s,l)=>{ s.magnetRadius += 15*l; } },
        {id:'t_reacteurs', icon:'🚀', name:'REACTEURS', desc:'Vaisseau plus réactif dès le départ / niveau.', max:5, cost:mkCost(6,5),
         apply:(s,l)=>{ s.moveResponsiveness += 1.2*l; } } ],
      [ {id:'t_aimant', icon:'🧲', name:'AIMANT', desc:"+20 portée d'aimant permanente / niveau.", max:5, cost:mkCost(7,5),
         apply:(s,l)=>{ s.magnetRadius += 20*l; } },
        {id:'t_vitessevaisseau', icon:'🛰️', name:'VITESSE', desc:'Vaisseau encore plus réactif / niveau.', max:5, cost:mkCost(7,5),
         apply:(s,l)=>{ s.moveResponsiveness += 1.2*l; } } ],
      [ {id:'t_xp', icon:'🧪', name:'XP+', desc:'+8% XP gagnée par cristal / niveau.', max:6, cost:mkCost(8,6),
         apply:(s,l)=>{ s.xpBonus = 0.08*l; } },
        {id:'t_chance', icon:'🍀', name:'CHANCE', desc:'Augmente le taux de drop de cristaux / niveau.', max:4, cost:mkCost(9,7),
         apply:(s,l)=>{ s.gemChanceBonus = 0.05*l; } } ],
      [ {id:'t_collecte', icon:'🌐', name:'COLLECTE AUTO', desc:'Aspire tous les cristaux proches toutes les 8s.', max:3, cost:mkCost(12,9),
         apply:(s,l)=>{ s.autoCollect = l; } },
        {id:'t_cooldown', icon:'⏳', name:'REDUC. COOLDOWN', desc:'-4% XP requise pour le niveau suivant / niveau.', max:3, cost:mkCost(10,8),
         apply:(s,l)=>{ s.xpToNextMul = Math.pow(0.96,l); } } ],
      [ {id:'t_chancedevie', icon:'🔋', name:'CELLULES D\'ENERGIE', desc:"Chance qu'un ennemi lâche une cellule (charge l'overdrive) au lieu d'un cristal / niveau.", max:5, cost:mkCost(9,7),
         apply:(s,l)=>{ s.healDropChance = 0.03*l; } },
        {id:'t_butindouble', icon:'💰', name:'BUTIN DOUBLE', desc:"Chance d'un cristal supplémentaire à la mort d'un ennemi / niveau.", max:4, cost:mkCost(9,7),
         apply:(s,l)=>{ s.bonusGemChance = 0.06*l; } } ],
      [ {id:'t_cristauxvaleur', icon:'💎', name:'CRISTAUX+', desc:'+10% de fragments gagnés en fin de run / niveau.', max:5, cost:mkCost(10,8),
         apply:(s,l)=>{ s.fragmentBonus = 0.1*l; } },
        {id:'t_soinmajeur', icon:'⚡', name:'CELLULES+', desc:'Les cellules d\'énergie chargent bien plus l\'overdrive.', max:3, cost:mkCost(10,8),
         apply:(s,l)=>{ s.bigHeal = l; } } ],
    ],
    forkThreshold: 14,
    forks:[
      { keystone:{id:'t_coffre', icon:'💰', name:'COFFRE-FORT', desc:'+25% de fragments gagnés en fin de run.', max:1, cost:mkCost(28,0),
         apply:(s)=>{ s.fragmentBonus += 0.25; } },
        path:[
          {id:'t_coffre_xp', icon:'🧪', name:'XP++', desc:'+5% XP gagnée par cristal supplémentaire / niveau.', max:5, cost:mkCost(9,7),
           apply:(s,l)=>{ s.xpBonus += 0.05*l; } },
          {id:'t_coffre_chance', icon:'🍀', name:'CHANCE+', desc:'+4% de chance de cristal bonus supplémentaire / niveau.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.bonusGemChance += 0.04*l; } } ],
        cap:{id:'t_coffre_cap', icon:'🎰', name:'JACKPOT', desc:'+50% de fragments gagnés en fin de run supplémentaires.', max:1, cost:mkCost(40,0),
         apply:(s)=>{ s.fragmentBonus += 0.5; } } },
      { keystone:{id:'t_eclair', icon:'⚡', name:'ECLAIR', desc:'Vaisseau nettement plus réactif aux commandes.', max:1, cost:mkCost(28,0),
         apply:(s)=>{ s.moveResponsiveness += 6; } },
        path:[
          {id:'t_eclair_reactivite', icon:'🛰️', name:'REACTIVITE+', desc:'Vaisseau encore plus réactif / niveau.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.moveResponsiveness += 1.5*l; } },
          {id:'t_eclair_aimant', icon:'🧲', name:'SILLAGE MAGNETIQUE', desc:"+25 portée d'aimant / niveau.", max:4, cost:mkCost(8,6),
           apply:(s,l)=>{ s.magnetRadius += 25*l; } } ],
        cap:{id:'t_eclair_cap', icon:'💫', name:'VITESSE LUMIERE', desc:'Le vaisseau suit le doigt quasi instantanément.', max:1, cost:mkCost(40,0),
         apply:(s)=>{ s.moveResponsiveness += 12; } } },
      { keystone:{id:'t_drone', icon:'🤖', name:'DRONE SATELLITE', desc:'Un drone orbite le vaisseau et tire automatiquement sur les ennemis.', max:1, cost:mkCost(28,0) },
        path:[
          {id:'t_drone_cadence', icon:'⏫', name:'CADENCE DRONE', desc:'Le(s) drone(s) tirent plus souvent / niveau.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.droneFireRateMul = Math.pow(0.88,l); } },
          {id:'t_drone_degats', icon:'💥', name:'DEGATS DRONE', desc:'+15% dégâts des tirs du/des drone(s) / niveau.', max:4, cost:mkCost(9,7),
           apply:(s,l)=>{ s.droneDamageMul = 1 + 0.15*l; } } ],
        cap:{id:'t_drone_cap', icon:'🛸', name:'ESSAIM', desc:'2 drones supplémentaires orbitent désormais le vaisseau.', max:1, cost:mkCost(42,0) } },
    ]
  },
];

// branche "Savoir": choix de cartes et relances (mini-bras en diagonale, ne touche à aucune autre branche)
TREE_BRANCHES.push({ id:'savoir', name:'Savoir', color:'#c88bff',
  stem:[
    [ {id:'t_intuition', icon:'🧠', name:'INTUITION', desc:'+1 choix de carte à chaque montée de niveau / niveau (2 de base, 5 au maximum).', max:3, cost:mkCost(8,14),
       apply:(s,l)=>{ s.cardChoices += l; } } ],
    [ {id:'t_relance', icon:'🔄', name:'RELANCE', desc:'+1 relance de cartes par partie / niveau (aucune de base).', max:4, cost:mkCost(10,10),
       apply:(s,l)=>{ s.rerolls += l; } } ],
    [ {id:'t_genie', icon:'💡', name:'ECLAIR DE GENIE', desc:'+6% de chance / niveau qu\'une carte choisie compte double.', max:5, cost:mkCost(12,10),
       apply:(s,l)=>{ s.doubleCardChance += 0.06*l; } } ],
    [ {id:'t_butin', icon:'🎁', name:'BUTIN DE BOSS', desc:'+1 relance à chaque boss vaincu / niveau.', max:2, cost:mkCost(20,16),
       apply:(s,l)=>{ s.bossReroll += l; } } ],
  ]
});

// branche "Tempête": foudre, rebonds, éclats, tonnerre (mini-bras à 315°)
TREE_BRANCHES.push({ id:'tempete', name:'Tempête', color:'#ffe14a',
  stem:[
    [ {id:'t_foudre', icon:'⚡', name:'FOUDRE', desc:"Chaque tir qui touche libère un arc de foudre vers 1 ennemi proche de plus / niveau (30% des dégâts).", max:3, cost:mkCost(14,12),
       apply:(s,l)=>{ s.chainLightning = l; } } ],
    [ {id:'t_rebond', icon:'🔁', name:'REBOND', desc:"Tes tirs rebondissent sur les côtés de l'écran (plus pâles, ~1 s) : +1 rebond / niveau.", max:3, cost:mkCost(12,10),
       apply:(s,l)=>{ s.bounce = l; } } ],
    [ {id:'t_eclats', icon:'💠', name:'ECLATS', desc:"Un ennemi tué projette 2 éclats de plus / niveau (35% des dégâts).", max:3, cost:mkCost(16,12),
       apply:(s,l)=>{ s.shardCount = 2*l; } } ],
    [ {id:'t_tonnerre', icon:'🌩️', name:'TONNERRE', desc:"Toutes les 8 s la foudre frappe l'ennemi le plus solide (dégâts x6).", max:1, cost:mkCost(42,0),
       apply:(s)=>{ s.thunder = 1; } } ],
  ]
});

// branche "Gravité": champ lent, pulsar, trou noir (mini-bras à 45°)
TREE_BRANCHES.push({ id:'gravite', name:'Gravité', color:'#7f9cff',
  stem:[
    [ {id:'t_champlent', icon:'🐌', name:'CHAMP LENT', desc:"Les tirs ennemis ralentissent près du vaisseau (zone et ralentissement qui augmentent / niveau).", max:4, cost:mkCost(12,10),
       apply:(s,l)=>{ s.slowField = l; } } ],
    [ {id:'t_pulsar', icon:'💫', name:'PULSAR', desc:"Une onde efface les tirs ennemis proches, de plus en plus souvent et loin / niveau.", max:4, cost:mkCost(14,12),
       apply:(s,l)=>{ s.pulsar = l; } } ],
    [ {id:'t_trounoir', icon:'🕳️', name:'TROU NOIR', desc:"Périodiquement, un trou noir attire et écrase le plus gros groupe d'ennemis (plus souvent / niveau).", max:3, cost:mkCost(18,14),
       apply:(s,l)=>{ s.blackHole = l; } } ],
    [ {id:'t_gravite', icon:'🌌', name:'GRAVITE', desc:"+150 de portée d'aimant, et le trou noir dure plus longtemps et attire plus loin.", max:1, cost:mkCost(32,0),
       apply:(s)=>{ s.magnetRadius += 150; s.blackHoleBoost = 1; } } ],
  ]
});

// branche "Furie": débloque et renforce l'OVERDRIVE (mini-bras à 135°)
TREE_BRANCHES.push({ id:'furie', icon:'', name:'Furie', color:'#ff8a3c',
  stem:[
    [ {id:'t_overdrive', icon:'🔥', name:'OVERDRIVE', desc:"Débloque l'overdrive : une jauge qui se charge en frôlant les tirs ennemis et en tuant. Pleine, touche OD : dégâts x2, cadence +60% et bouclier jaune invincible (aucun dégât subi) pendant 5 s, ton bouclier normal se régénère 2x plus vite. Le bonus s'érode pendant l'effet (jusqu'à -60%) et chaque activation est 8% plus faible que la précédente; les cellules d'énergie le ravivent (+1 s / niveau).", max:4, cost:mkCost(10,12),
       apply:(s,l)=>{ s.overdrive = l; s.odDur = 5000 + 1000*l; } } ],
    [ {id:'t_frolement', icon:'🎯', name:'FROLEMENT', desc:"+40% de charge de l'overdrive par tir frôlé / niveau.", max:3, cost:mkCost(10,9),
       apply:(s,l)=>{ s.odGraze += 0.4*l; } } ],
    [ {id:'t_surchauffe', icon:'⚡', name:'SURCHAUFFE', desc:"+25% de dégâts pendant l'overdrive / niveau (x2 de base).", max:3, cost:mkCost(14,12),
       apply:(s,l)=>{ s.odDmgMul += 0.25*l; } } ],
    [ {id:'t_souffle', icon:'💨', name:'SECOND SOUFFLE', desc:"Chaque boss vaincu recharge 30% de l'overdrive / niveau.", max:3, cost:mkCost(16,14),
       apply:(s,l)=>{ s.odBossCharge = 30*l; } } ],
  ]
});

const TREE_HUB = { id:'hub', icon:'🛸', name:'CŒUR DU VAISSEAU', desc:'Le point de départ de toute build.', max:1, requires:[], isHub:true, branch:'hub', color:'#ffd76a' };

let ALL_TREE_NODES = [TREE_HUB];

TREE_BRANCHES.forEach(branch=>{
  branch.stem.forEach((pair,tierIdx)=>{
    pair.forEach((node,laneIdx)=>{
      const parent = tierIdx===0 ? 'hub' : (branch.stem[tierIdx-1][laneIdx] || branch.stem[tierIdx-1][0]).id;
      ALL_TREE_NODES.push({...node, branch:branch.id, color:branch.color, requires:[parent], stemOf:branch.id});
    });
  });
  const lastTier = branch.stem[branch.stem.length-1];
  const lastIds = lastTier.map(n=>n.id);

  if (branch.forks){
    branch.forks.forEach(fork=>{
      ALL_TREE_NODES.push({...fork.keystone, branch:branch.id, color:branch.color, requires:[...lastIds], isKey:true, forkThreshold:branch.forkThreshold});
      let prevId = fork.keystone.id;
      fork.path.forEach(pn=>{
        ALL_TREE_NODES.push({...pn, branch:branch.id, color:branch.color, requires:[prevId]});
        prevId = pn.id;
      });
      ALL_TREE_NODES.push({...fork.cap, branch:branch.id, color:branch.color, requires:[prevId], isCap:true});
    });
  } else if (branch.cap){
    ALL_TREE_NODES.push({...branch.cap, branch:branch.id, color:branch.color, requires:[...lastIds], isCap:true});
  }
});

const TREE_NODE_BY_ID = {};

ALL_TREE_NODES.forEach(n=> TREE_NODE_BY_ID[n.id]=n);

// remboursement (en composants) des rangs achetés sur les nœuds repris par l'atelier (migration v2 -> v3, data/meta.js)
function treeRefundFor(tree){
  let sum = 0;
  Object.keys(tree||{}).forEach(id=>{
    const n = TREE_NODE_BY_ID[id]; if (!n || !ATELIER_REPLACED.has(id)) return;
    for (let i = 0; i < Math.min(tree[id], n.max); i++) sum += n.cost(i);
  });
  return sum;
}

{ const cap = ALL_TREE_NODES.find(n=>n.id==='t_drone_cap');
  if (cap){
    ALL_TREE_NODES.push({ id:'t_radar', icon:'📡', name:'RADAR', desc:'Dans une nébuleuse, le cône de vision porte plus loin et s\'élargit / niveau.', max:4, cost:mkCost(26,22),
      apply:(s,l)=>{ s.nebulaVision = l; }, branch:cap.branch, color:cap.color, requires:['t_drone_cap'] });
  } }

/* ARBRE À L'ÉCRAN: chaque niveau d'une compétence est une compétence à part (nœud visuel).
   Les données (rangs sauvegardés, statistiques) ne changent pas: acheter le niveau k d'une compétence = passer son rang à k. */
const ROMAN = ['','I','II','III','IV','V','VI','VII','VIII','IX','X'];

const TREE_VIS = [], TREE_VIS_BY_ID = {};

function visId(nid, k){ return k === 1 ? nid : nid + '#' + k; }

ALL_TREE_NODES.forEach(n=>{
  if (n.isHub) return;
  for (let k=1; k<=n.max; k++){
    const id = visId(n.id, k);
    const v = { id, nid:n.id, k, orig:n, name:n.name + (n.max > 1 ? ' ' + ROMAN[k] : ''), icon:n.icon,
      desc:n.desc.replace(/\s*\/\s*niveau/i, ''), max:1, branch:n.branch, color:n.color,
      isKey:k === 1 && !!n.isKey, isCap:k === 1 && !!n.isCap, forkThreshold:n.forkThreshold,
      requires: k > 1 ? [visId(n.id, k-1)] : n.requires.map(p => p === 'hub' ? 'hub' : visId(p, 1)) };
    v.cost = ((nn, kk)=> ()=> nn.cost(kk-1))(n, k);
    TREE_VIS.push(v); TREE_VIS_BY_ID[id] = v;
  }
});

// statut d'un nœud: 'owned' (possédé) · 'avail' (achetable maintenant) · null
function treeVisStatus(state, v){
  const r = state[v.nid] || 0;
  if (r >= v.k) return 'owned';
  if (v.k === r + 1 && (v.k > 1 || treeNodeUnlocked(state, v.orig))) return 'avail';
  return null;
}

const TREE_TOTAL = ALL_TREE_NODES.reduce((a,n)=> a + (n.max||0), 0);   // points de l'arbre complet

// les paliers de niveau d'alerte étaient calculés pour 381 points: on les ramène à la taille réelle de l'arbre, pour que le dernier niveau = l'arbre complet (sinon les derniers niveaux sont inatteignables et l'alerte monte trop lentement)
{ const base = ALERT_THRESHOLDS.slice(), k = TREE_TOTAL / base[base.length-1]; base.forEach((t,i)=>{ ALERT_THRESHOLDS[i] = Math.max(i ? ALERT_THRESHOLDS[i-1] + 1 : 1, Math.round(t*k)); }); }

function treeBranchStemSum(state, branchId){
  return ALL_TREE_NODES.filter(n=>n.stemOf===branchId).reduce((a,n)=>a+(state[n.id]||0),0);
}

function treeParentOk(state, node){
  if (node.isHub) return true;
  if (!node.requires.length) return true;
  // the hub itself is never "purchased" — it's always available as a starting point
  return node.requires.some(id => id === 'hub' || (state[id]||0) > 0);
}

function treeNodeUnlocked(state, node){
  if (!treeParentOk(state, node)) return false;
  if (node.isKey && node.forkThreshold){
    return treeBranchStemSum(state, node.branch) >= node.forkThreshold;
  }
  return true;
}
