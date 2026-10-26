"use strict";
// Réglages par défaut du TUTO (niveau w1-tuto). Ce fichier est écrit à la main ; les modifications faites dans l'éditeur (editor.html) sont enregistrées à part
// dans data/tuning.js (généré) et se superposent à ces valeurs. Rien à changer ici sauf pour fixer de nouveaux défauts.
// Durées en secondes (sauf mention contraire), vitesses en px/s, délais de tir en ms.
const TUTO_DEFAULTS = {
  steps:{ moveNeed:420, satTarget:12, bossWait:3.6, maxMove:30, maxShoot:90 },       // moveNeed = px à parcourir · satTarget = satellites à détruire (étape 2 + objectif de finition) · max* = durée max d'une étape avant de passer à la suivante
  sats:{ hp:30, speedMin:60, speedMax:105, slowSpeed:55, drift:22, score:25, contactDmg:10, spawnCdStart:1500, spawnCdEnd:650, rampTime:40, capBase:3, capExtra:3, capEvery:14 },
  debris:{ min:5, max:8, dmg:7, speedMin:75, speedMax:150 },
  boss:{ hp:700, p2:0.66, p3:0.33, contactDmg:15, killScore:500,
         aimCd:1500, aimCd3:1100, aimDmg:9, aimSpeed:230,
         ringCd:4200, ringCount:16, ringGap:2, ringDmg:8, ringSpeed:135,
         rainCd:1700, rainDmg:8, rainSpeed:265,
         spiralCd:140, spiralDmg:7, spiralSpeed:150 },
  comp:{ sats:30, boss:35, win:15, clean:20, hitPenalty:0.25 },        // poids de la finition (le total est ramené à 100) ; hitPenalty = part de « sans te faire toucher » perdue par coup reçu
  rewards:{ m25:5, m50:10, m75:15, m100:40 },                          // fragments ◆ gagnés au 1er passage de chaque palier de finition
};
