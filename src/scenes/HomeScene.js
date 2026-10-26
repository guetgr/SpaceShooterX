"use strict";
// Accueil : décor animé (canvas) + panneaux HTML (#home). Les méthodes sont dans src/home/ (mixin), comme GameScene.
// Trois pages côte à côte : HANGAR (-1) · CARTE (0, par défaut) · ARBRE (+1). La partie jouable reste GameScene (scène 'game').
// Cycle : GameScene.showStartScreen() lance / réveille cette scène ; elle s'endort quand un niveau démarre (GameScene.create).

class HomeScene extends Phaser.Scene{
  constructor(){ super('home'); }
  create(){
    this.cameras.main.setBackgroundColor(0x05040c);
    this.page = 0; this.pageX = 0; this.homeSel = null; this.homeWorld = 0; this._launching = false;
    this.buildHomeBackground();
    this.buildHomePlanet();
    this.buildHomeVan();
    this.buildGalaxy();
    this.setupHomeUi();
    this.events.on('wake', ()=> this.enterHome());
    this.events.on('sleep', ()=> this.leaveHome());
    this.enterHome();
  }

  update(time, delta){
    if (!this.homeOn) return;
    this.updateHomeBackground(time, delta);
    this.updateHomeVan(time, delta);
    this.updateGalaxy(time, delta);
  }
}
