"use strict";
// Boss : ordre, PV par niveau d'alerte, phases, définitions (BOSS_DEFS).

/* =========================================================
   BOSS — table de définition (sprites 8 bits dessinés dans BOSS_ART).
   Pour utiliser un autre sprite: changer `tex`/`anim`/`scale` (et `flipY` selon le sens du dessin).
========================================================= */
const BOSS_ORDER = ['dread','faucheuse','ruche','prisme','kraken','eclipse','hydre'];

// multiplicateur de PV des boss selon le niveau d'alerte (1..6) — à ajuster ici pour l'équilibrage
// PV des boss par niveau d'alerte (niveaux 1..15 calibrés au bot de test; 16..20 = ascensions, provisoires: ils suivent la même pente en attendant leurs comportements)
const BOSS_HP_BY_ALERT = [1.3, 2.1, 2.8, 4.2, 11, 22, 40, 103, 162, 231, 311, 407, 527, 672, 858, 1030, 1236, 1483, 1780, 2136];

// montée par palier de boss: le N-ième boss arrive déjà buffé (palier 3 = x2.3 de PV, ~1min45 si le 1er dure 45 s)
// PALIERS DES BOSS selon le niveau d'alerte (niveaux 16 à 20: ils se comportent comme le 15 en attendant leurs propres comportements)
const BOSS_PHASE2_FROM = 3, BOSS_PHASE3_FROM = 6, BOSS_SECOND_FORM_FROM = 8;

function bossPhaseThresholds(a){   // [début de la phase 2, début de la phase 3] en part des PV restants; null = pas encore débloquée
  return [ a >= BOSS_PHASE2_FROM ? Math.min(0.85, 0.50 + 0.03*(a-BOSS_PHASE2_FROM)) : null,
           a >= BOSS_PHASE3_FROM ? Math.min(0.50, 0.30 + 0.025*(a-BOSS_PHASE3_FROM)) : null ];
}

// BOSS AVEC SPRITES PROPRES PAR PHASE (ajouter ici les autres boss à mesure que leurs planches arrivent)
const BOSS_SPRITES = {
  dread: { tex0:'drP1', size:0.62, flipY:true, body:[0.62, 0.6], phase:{1:'drP1A', 2:'drP2A', 3:'drP3A'}, second:'drSecondA', trans:'drTransA', deathTex:'drDeath', death:'drDeathA' },
  eclipse: { tex0:'ecP1', size:1.25, body:[0.55, 0.55], phase:{1:'ecP1A', 2:'ecP2A', 3:'ecP3A'}, second:'ecSecondA', trans:'ecTransA', mirage:'ecMirageA', deathTex:'ecDeath', death:'ecDeathA' },
  hydre: { tex0:'hyP1', prev:'hyFull', size:0.78, body:[0.7, 0.6], phase:{1:'hyP1A', 2:'hyP2A', 3:'hyP3A'}, deathTex:'hyDeath', death:'hyDeathA' },
  prisme: { tex0:'prP1', size:1.25, body:[0.5, 0.55], phase:{1:'prP1A', 2:'prP2A', 3:'prP3A'}, second:'prSecondA', deathTex:'prDeath', death:'prDeathA' },
  kraken: { tex0:'krP1', size:0.85, secondScale:0.55, body:[0.6, 0.8], phase:{1:'krP1A', 2:'krP2A', 3:'krP3A'}, second:'krSecondA', trans:'krTransA', deathTex:'krDeath', death:'krDeathA' },
  ruche: { tex0:'ruP1', size:1.2, body:[0.5, 0.55], phase:{1:'ruP1A', 2:'ruP2A', 3:'ruP3A'}, trans:'ruTransA', deathTex:'ruDeath', death:'ruDeathA' },
  faucheuse: { tex0:'fauP1', size:1.2, body:[0.5, 0.62], phase:{1:'fauP1A', 2:'fauP2A', 3:'fauP3A'}, second:'fauSecondA', trans:'fauTransA', stun:'fauStunA', dive:'fauDiveA', deathTex:'fauDeath', death:'fauDeathA' },
};

const DOUBLE_BOSS_HP_MUL = 0.7;       // chaque boss d'un double boss a 70% de ses PV normaux

const BOSS_TIER_HP = 0.65;           // +65% de PV à chaque boss: 1er x1.65, 2e x2.3, 3e x2.95, 4e x3.6... (par boss vaincu, plus par temps)

const BOSS_TIER_DMG = 0.25;          // +25% de dégâts par boss déjà vaincu

const BOSS_ALERT_DMG = 0.08;         // +8% de dégâts par niveau d'alerte au-dessus de 1

const BOSS_DMG_CAP = 3.5;            // plafond du multiplicateur de dégâts

const BOSS_DEFS = {
  dread:     { name:'DREADNOUGHT',  tex:'bossSheet',    anim:'bossIdle',      scale:0.85, ref:0.40, tint:null, flipY:true,  body:[140,160], hp:630 },
  faucheuse: { name:'LA FAUCHEUSE', tex:'bossFaucheuse', anim:'faucheuseIdle', scale:0.90, tint:null, flipY:false, body:[100,100], hp:700 },
  ruche:     { name:'LA RUCHE',     tex:'bossRuche',     anim:'rucheIdle',     scale:0.85, tint:null, flipY:false, body:[110,100], hp:0,
               pod:{ tex:'ruPod', scale:0.42, body:[70,70] } },
  prisme:    { name:'LE PRISME',    tex:'bossPrisme',    anim:'prismeIdle',    scale:0.85, tint:null, flipY:false, body:[80,100],  hp:680,
               mirror:{ tex:'prMirror', scale:0.9, body:[26,50] } },
  kraken:    { name:'LE KRAKEN',    tex:'bossKraken',    anim:'krakenIdle',    scale:0.90, tint:null, flipY:false, body:[100,100], hp:600,
               seg:{ tex:'krBall', scale:0.34 } },
  eclipse:   { name:"L'ECLIPSE",    tex:'bossEclipse',   anim:'eclipseIdle',   scale:0.85, tint:null, flipY:false, body:[80,80],   hp:720 },
  hydre:     { name:"L'HYDRE",      tex:'bossHydre',     anim:'hydreIdle',     scale:0.90, tint:null, flipY:false, body:[110,80],  hp:0,
               head:{ tex:'hyHead', scale:0.85, body:[58,58] } },
};
