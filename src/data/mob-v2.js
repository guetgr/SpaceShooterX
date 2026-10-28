"use strict";
// Mobs refaits (monde 2) : grunt, diver, turret, tank, mine, bomber, kamikaze. Le dessin d'origine n'est pas modifié ; on lui ajoute :
//  - fly   : vol vivant (flammes d'origine + voyants rouges/orangés qui pulsent en chenille), images à la taille d'origine (échelle et collision inchangées) ;
//  - boom  : destruction (éclair, boule de feu, morceaux aux bords brûlés qui tournent avec traînées, onde de choc), grille de `cols` colonnes, à l'échelle `k` du sprite ;
//  - fx    : (turret, tank, bomber) lueur de charge (chg, 5 images) et éclair de tir (flash, 5 images), couche d'effet seule centrée sur le sprite, à l'échelle `k` ; jouée par-dessus le vol (enemies/mob-fx.js).
// Toutes les planches sont déjà DANS LE SENS DU JEU (les vieux mobs sont retournés verticalement à l'affichage). Fichiers : assets/sprites/mob_<type>_{fly,boom,chg,flash}.webp.
const MOB_V2 = {
  grunt:    { rate:10, fly:{ fw:220, fh:270, n:16 }, boom:{ fw:176, fh:217, n:24, cols:6, k:0.35 } },
  diver:    { rate:12, fly:{ fw:260, fh:320, n:16 }, boom:{ fw:209, fh:258, n:24, cols:6, k:0.35 } },
  turret:   { rate:8,  fly:{ fw:260, fh:300, n:16 }, boom:{ fw:209, fh:241, n:24, cols:6, k:0.35 }, fx:{ fw:150, fh:164, k:0.35 } },
  tank:     { rate:8,  fly:{ fw:240, fh:260, n:16 }, boom:{ fw:193, fh:209, n:24, cols:6, k:0.35 }, fx:{ fw:136, fh:143, k:0.35 } },
  mine:     { rate:8,  fly:{ fw:349, fh:399, n:8 },  boom:{ fw:281, fh:321, n:24, cols:6, k:0.35 } },
  bomber:   { rate:9,  fly:{ fw:250, fh:300, n:16 }, boom:{ fw:201, fh:241, n:24, cols:6, k:0.35 }, fx:{ fw:146, fh:163, k:0.35 } },
  kamikaze: { rate:12, fly:{ fw:82,  fh:104, n:18 }, boom:{ fw:66,  fh:83,  n:24, cols:6, k:0.35 } },
};

// entrées de CUSTOM_TEXTURES (scenes/BootScene.js)
function mobV2Textures(){
  const out = [];
  Object.keys(MOB_V2).forEach(k=>{
    const m = MOB_V2[k];
    out.push({ key:'m_' + k + '_fly', src:asset('sprites/mob_' + k + '_fly.webp'), fw:m.fly.fw, fh:m.fly.fh, n:m.fly.n });
    out.push({ key:'m_' + k + '_boom', src:asset('sprites/mob_' + k + '_boom.webp'), fw:m.boom.fw, fh:m.boom.fh, n:m.boom.n });
    if (m.fx){
      out.push({ key:'m_' + k + '_chg', src:asset('sprites/mob_' + k + '_chg.webp'), fw:m.fx.fw, fh:m.fx.fh, n:5 });
      out.push({ key:'m_' + k + '_flash', src:asset('sprites/mob_' + k + '_flash.webp'), fw:m.fx.fw, fh:m.fx.fh, n:5 });
    }
  });
  return out;
}

// animations : m_<type>_flyA (boucle), m_<type>_boomA (une fois), m_<type>_chgA / m_<type>_flashA
function mobV2CreateAnims(scene){
  const frames = (key, n)=> scene.anims.generateFrameNumbers(key, { start:0, end:n - 1 });
  Object.keys(MOB_V2).forEach(k=>{
    const m = MOB_V2[k];
    scene.anims.create({ key:'m_' + k + '_flyA', frames:frames('m_' + k + '_fly', m.fly.n), frameRate:m.rate, repeat:-1 });
    scene.anims.create({ key:'m_' + k + '_boomA', frames:frames('m_' + k + '_boom', m.boom.n), frameRate:22, repeat:0 });
    if (m.fx){
      scene.anims.create({ key:'m_' + k + '_chgA', frames:frames('m_' + k + '_chg', 5), frameRate:16, repeat:0 });
      scene.anims.create({ key:'m_' + k + '_flashA', frames:frames('m_' + k + '_flash', 5), frameRate:26, repeat:0 });
    }
  });
}
