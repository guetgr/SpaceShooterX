"use strict";
// Méthodes de GameScene — effets de tir des mobs refaits (turret, tank, bomber) : lueur de charge un peu avant le tir, éclair au moment du tir.
// L'effet est un sprite posé PAR-DESSUS le mob (couche d'effet seule, centrée sur le sprite) et qui le suit : l'animation de vol du mob ne s'arrête jamais.
// Planches et tailles : data/mob-v2.js.
mixin(GameScene, {
  // kind : 'chg' (charge) ou 'flash' (éclair de tir)
  mobFx(e, kind){
    const m = e && e.active && MOB_V2[e.enemyType];
    if (!m || !m.fx) return;
    const key = 'm_' + e.enemyType + '_' + kind;
    const spr = this.add.sprite(e.x, e.y, key).setDepth(5).setScale(e.scaleX / m.fx.k);
    spr.play(key + 'A');
    spr.once('animationcomplete', ()=> spr.destroy());
    const pre = spr.preUpdate;
    spr.preUpdate = function(time, delta){ pre.call(this, time, delta); if (e.active) this.setPosition(e.x, e.y); };      // il suit son mob (le bomber ondule)
  },

  // à appeler à chaque image avant le tir : lance la charge `lead` ms avant la fin du délai de tir (une seule fois par tir)
  mobCharge(e, lead){
    if (e.fireCd <= (lead || 300) && !e._chg){ e._chg = true; this.mobFx(e, 'chg'); }
  },
});
