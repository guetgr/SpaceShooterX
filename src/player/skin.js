"use strict";
// Méthodes de GameScene — apparence (teinte) de la camionnette. Les effets qui teintent le vaisseau (dégâts, glace) passent par ici pour ne pas effacer l'apparence choisie.
mixin(GameScene, {
  // remet la teinte de l'apparence (ou aucune teinte)
  applyShipSkin(){
    if (this.skinTint) this.player.setTint(this.skinTint); else this.player.clearTint();
  },

  // teinte d'un effet (r, g, b de 0 à 255) multipliée par celle de l'apparence
  mulSkin(r, g, b){
    const t = this.skinTint || 0xffffff;
    return Phaser.Display.Color.GetColor(Math.round(r*((t >> 16) & 255)/255), Math.round(g*((t >> 8) & 255)/255), Math.round(b*(t & 255)/255));
  },
});
