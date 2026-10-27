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
  scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER, zoom: 1 },      // taille fixe 400x700 : c'est #game-container qui est mis à l'échelle (fitUi)
  scene: [BootScene, GameScene, HomeScene]
};

// Mise à l'échelle de la zone de jeu (400x700) pour qu'elle tienne dans la fenêtre : un seul facteur pour le canevas ET tout le HTML,
// donc la même mise en page et la même lisibilité sur téléphone, tablette et ordinateur (la zone reste centrée, bandes sombres autour).
let _uiScale = 1;
function fitUi(){
  const st = document.getElementById('stage'); if (!st) return;
  const s = Math.max(0.2, Math.min(st.clientWidth / GAME_W, st.clientHeight / GAME_H));
  if (Math.abs(s - _uiScale) > 0.0005){ _uiScale = s; document.documentElement.style.setProperty('--ui-s', s.toFixed(4)); }
  if (window.__phaserGame && window.__phaserGame.scale) window.__phaserGame.scale.updateBounds();      // les coordonnées des touchers suivent la nouvelle échelle
}
window.addEventListener('resize', fitUi); window.addEventListener('orientationchange', ()=> setTimeout(fitUi, 150));
if (window.visualViewport) window.visualViewport.addEventListener('resize', fitUi);
fitUi();
uiIconsInit();                                                       // icônes pixel des boutons et libellés de index.html (<i data-ico="…">)

// boot.js charge ce fichier en dernier, souvent après l'événement "load" : on démarre tout de suite dans ce cas
function startGame(){
  CloudSave.boot(()=>{
    if (window.__ssxStarted) return; window.__ssxStarted = true;
    migrateMeta();                                                    // sauvegarde v2 -> v3 (data/meta.js), une seule fois
    fitUi();
    const game = new Phaser.Game(config); window.__phaserGame = game; fitUi();
    if (DEV_SEE_ALL){                       // accès console / tests automatiques (tools/smoke_test.py)
      window.__game = game;
      window.__T = { ALL_TREE_NODES, UPGRADE_POOL, RELICS, FUSIONS, sfx };
    }
  });
}
if (document.readyState === 'complete') startGame();
else window.addEventListener('load', startGame);
