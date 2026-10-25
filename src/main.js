"use strict";
// Point d'entrée : configuration Phaser et démarrage.

/* =========================================================
   BOOT PHASER
========================================================= */
const config = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  parent: 'game-container',
  backgroundColor: '#05040c',
  pixelArt: true,
  physics: { default:'arcade', arcade: { gravity:{ y:0 }, debug:false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, GameScene]
};

// boot.js charge ce fichier en dernier, souvent après l'événement "load" : on démarre tout de suite dans ce cas
function startGame(){
  CloudSave.boot(()=>{
    if (window.__ssxStarted) return; window.__ssxStarted = true;
    const game = new Phaser.Game(config);
    if (DEV_SEE_ALL){                       // accès console / tests automatiques (tools/smoke_test.py)
      window.__game = game;
      window.__T = { ALL_TREE_NODES, UPGRADE_POOL, RELICS, FUSIONS, sfx };
    }
  });
}
if (document.readyState === 'complete') startGame();
else window.addEventListener('load', startGame);
