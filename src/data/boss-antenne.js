"use strict";
// Boss du tuto (« Antenne-Mère ») : réglages VISUELS seulement (états d'usure, accroches du feu et de la fumée, effets). Les valeurs de jeu (PV, tirs, dégâts) restent dans TUTO_TUNE.boss.
const AC = {
  scale: 0.52,                          // sprite 512 px -> ~266 px à l'écran (dans la zone de jeu 400x700)
  states: [0.70, 0.45, 0.20],           // part de PV sous laquelle le sprite passe à l'état suivant : intact > endommagé > critique > épave
  dish: [256, 135], core: [256, 300],   // coordonnées dans le sprite 512 : parabole, cœur (d'où partent les tirs visuellement)
  // points d'accroche (coordonnées du sprite 512) des flammes et de la fumée, par état d'usure 1..3 : trous de la coque et bords arrachés
  anchors: {
    1: [[270, 195], [315, 253], [283, 315], [488, 238], [480, 244], [480, 208]],
    2: [[339, 212], [282, 275], [239, 315], [269, 387], [446, 220], [362, 198], [76, 230], [368, 178]],
    3: [[262, 29], [283, 120], [292, 206], [280, 260], [381, 269], [293, 351], [133, 359], [143, 399], [255, 408], [336, 124], [410, 224], [122, 364]],
  },
  smokeEvery: [0, 520, 300, 190],       // ms entre deux volutes de fumée, selon l'état
  names: ['ANTENNE-MÈRE', 'ANTENNE-MÈRE', 'ANTENNE-MÈRE', 'ANTENNE-MÈRE'],
  shotScale: 0.6, shotHead: [32, 94],   // tir en forme de boule d'énergie (feuille 64x128, la tête est à (32, 94)) ; l'origine du sprite est placée sur la tête
};
const FX_ANCHOR = { acFxFlame:[0.5, 0.93] };          // point d'accroche des feuilles d'effets (fraction de l'image) ; par défaut le centre
