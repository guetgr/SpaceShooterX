"use strict";
// Méthodes de GameScene — composants ◆ : lâchés par les machines détruites, ramassés à l'aimant, comptés dans le HUD (règles : data/composants.js).
mixin(GameScene, {
  // un composant posé dans le monde : petit (compS) ou gros (compL) ; sprite = l'icône ◆ de l'interface (écrou AGP)
  spawnComposantAt(x, y, kind, vy){
    const c = this.comps.create(x, y, 'uiFrag');
    c.setDepth(3); c.setScale(kind === 'compL' ? 2.5 : 1.5);
    c.compValue = kind === 'compL' ? COMP.bigValue : COMP.smallValue; c.ph = Math.random()*6.2832;
    c.body.velocity.y = vy === undefined ? 30 : vy;
  },

  // un ennemi (pas un boss) vient de mourir : un lourd lâche plusieurs composants, les autres parfois un seul. Rien dans le tutoriel.
  composantDrop(enemy){
    if (this.tuto) return;
    const n = COMP.heavyTypes.indexOf(enemy.enemyType) >= 0 ? COMP.heavySmall : (Math.random() < COMP.dropChance ? 1 : 0);
    for (let i=0;i<n;i++) this.spawnComposantAt(enemy.x + Phaser.Math.Between(-16,16), enemy.y + Phaser.Math.Between(-16,16), 'compS');
  },

  onCollectComposant(player, c){
    if (!c.active) return;
    this.runComposants += c.compValue || COMP.smallValue;
    this.spawnGemBurst(c.x, c.y, 'gemL');
    c.destroy();
    sfx.gem();
  },

  // aimant : même règle que les cristaux (portée, tempête magnétique, collecte auto)
  updateComposants(time, delta){
    const storm = this.elapsed < (this._magnetUntil||0);
    this.comps.children.iterate(c=>{
      if (!c) return;
      if (storm || Phaser.Math.Distance.Between(c.x, c.y, this.player.x, this.player.y) < this.stats.magnetRadius) this.juiceMagnet(c, delta, storm);
    });
  },

  // valeur des composants encore à l'écran (crédités à la victoire)
  composantsOnScreenValue(){
    let v = 0; this.comps.children.iterate(c=>{ if (c && c.active) v += c.compValue || COMP.smallValue; }); return v;
  },
});
