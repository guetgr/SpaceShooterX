"use strict";
// Scène principale. Les méthodes sont réparties dans les fichiers suivants (mixin).

class GameScene extends Phaser.Scene{
  constructor(){ super('game'); }
  create(data){
    this.sandbox = !!(data && data.sandbox);
    this.input.enabled = true;
    this.lvDef = (data && data.levelId && levelById(data.levelId)) || null;      // niveau d'un monde (sinon: partie infinie historique)
    this.tuto = !!(data && data.tuto);
    this.cameras.main.setBackgroundColor(0x05040c);
    this.running = false;
    this.hasActiveRun = false;
    this.elapsed = 0;
    this.score = 0;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 8;

    // Player stats (mutated by upgrades)
    this.stats = makeDefaultStats();

    // apply permanent meta-progression bonuses earned across runs
    this.meta = getMeta();
    this.alertLevel = this.lvDef ? this.lvDef.threat : effectiveAlert(this.meta);      // en niveau, la menace est fixée par le niveau et non plus par l'arbre
    this.weaponTier = weaponTierFor(this.alertLevel);
    this.bestiary = getBestiary();
    this.achv = getAchv();
    // collection: on y ajoute aussi les compétences déjà achetées dans l'arbre (anciennes sauvegardes)
    this.codex = getCodex();
    { let changed = false; Object.keys(this.meta.tree||{}).forEach(k=>{ if (this.meta.tree[k] > 0 && !this.codex.skills[k]){ this.codex.skills[k] = 1; changed = true; } }); if (changed) setCodex(this.codex); }
    this.achvQueue = []; this.achvShowing = false; this.achvDirty = false; this.achvSaveCd = 4000;
    this.achvSecCd = 1000; this._chainN = 0; this._chainT = 0; this.bestiaryDirty = false;
    // à la fermeture/mise en arrière-plan de la page, on enregistre ce qui n'a pas encore été écrit
    window.__ssxScene = this;
    if (!window.__ssxSaveHooked){
      window.__ssxSaveHooked = true;
      const flush = ()=>{ const sc = window.__ssxScene; if (!sc) return; if (sc.bestiaryDirty) setBestiary(sc.bestiary); if (sc.achv) setAchv(sc.achv); CloudSave.push(); };
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', ()=>{ if (document.hidden) flush(); });
    }
    // toiles des araignées: un seul calque de dessin + un cycle commun (repos -> annonce -> actif)
    this.webGfx = this.add.graphics(); this.webGfx.setDepth(4.4); this.webGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.web = { state:'idle', t:2200 };
    // atouts GLOBAUX : les modules R&D achetés s'appliquent aux caractéristiques de départ (niveaux ET tutoriel)
    const applyTree = ()=>{
      this.treeState = this.meta.tree;
      const t0 = { dmg:this.stats.damage, hp:this.stats.maxHp, sh:this.stats.shieldMax };
      ALL_TREE_NODES.forEach(node=>{
        const lvl = this.treeState[node.id] || 0;
        if (lvl > 0 && node.apply) node.apply(this.stats, lvl);
      });
      this.treeBonus = { dmg:this.stats.damage/t0.dmg - 1, hp:this.stats.maxHp - t0.hp, shield:this.stats.shieldMax - t0.sh };      // ce que les atouts globaux apportent, pour l'affichage
    };
    applyTree();
    applyAchvBuffs(this.stats, this.achv);   // buffs permanents des succès
    applyAscension(this.stats, this.meta.asc);   // bonus permanents d'ascension
    if (this.tuto){ this.stats = makeDefaultStats(); this.stats.damage = 14; this.alertLevel = 1; this.weaponTier = 1; applyTree(); }   // TUTO: vaisseau de base + atouts globaux (R&D), sans succès ni ascension
    // pactes choisis avant la partie: règles plus dures, plus de fragments à la fin
    const odUi = document.getElementById('odBtn');
    if (odUi){ odUi.classList.toggle('show', this.stats.overdrive > 0); odUi.classList.remove('ready','active'); odUi.style.setProperty('--deg','0deg'); }   // le bouton n'apparaît qu'une fois l'overdrive débloqué
    this.pacts = getPacts();
    this.pactBonusMul = 1 + pactBonus(this.pacts);
    if (this.pacts.indexOf('p_fragile') >= 0) this.stats.maxHp *= 0.6;
    if (this.pacts.indexOf('p_sansshield') >= 0) this.stats.shieldMax = 0;
    this.achv.maxAlert = Math.max(this.achv.maxAlert || 0, this.alertLevel);
    // weapon evolutions unlocked via the tree — only offered as level-up cards once owned
    this.laserContinuOwned = (this.treeState['t_laser_c']||0) > 0;
    this.laserAutoOwned = (this.treeState['t_laser_a']||0) > 0;
    this.shotgunOwned = (this.treeState['t_shotgun']||0) > 0;
    this.missileDroitOwned = (this.treeState['t_missile_droit']||0) > 0;
    this.missileChercheurOwned = (this.treeState['t_missile_chercheur']||0) > 0;
    this.laserDestructeurOwned = (this.treeState['t_laser_c_cap']||0) > 0;
    this.reticuleOmniscientOwned = (this.treeState['t_laser_a_cap']||0) > 0;
    this.fragmentationOwned = (this.treeState['t_shotgun_cap']||0) > 0;
    this.nukeOwned = (this.treeState['t_missile_droit_cap']||0) > 0;
    this.swarmMissilesOwned = (this.treeState['t_missile_chercheur_cap']||0) > 0;
    this.phoenixOwned = (this.treeState['t_phenix']||0) > 0;
    this.droneOwned = (this.treeState['t_drone']||0) > 0;
    this.doublePhoenixOwned = (this.treeState['t_phenix_cap']||0) > 0;
    this.sangsueOwned = (this.treeState['t_sangsue']||0) > 0;
    this.droneSwarmOwned = (this.treeState['t_drone_cap']||0) > 0;
    if (this.missileDroitOwned && !this.missileChercheurOwned) this.stats.missileType = 'droit';
    this.laserBeamTimer = 0;
    this.phoenixCharges = this.phoenixOwned ? (this.doublePhoenixOwned ? 2 : 1) : 0;
    this.dodgeCharges = this.stats.dodgeCharges;
    this.autoCollectTimer = 8000;
    this.nukeTimer = 6000;
    this.swarmMissileTimer = 0;
    this.droneAngle = 0;
    this.droneFireTimer = 0;

    this.hp = this.stats.maxHp;
    this.shield = this.stats.shieldMax;
    this.shieldRegenDelay = 0; // ms remaining before shield starts regenerating again
    this.hitCooldown = 0;
    this.dodgeInvuln = 0;
    this.lastTapTime = 0;

    this.upgradeCounts = {};
    this.rerollsLeft = Math.max(0, Math.round(this.stats.rerolls));
    this.weaponUpgradeCount = 0;
    this.engineUpgradeCount = 0;
    this.shipTier = 1;
    this.engineTrailTimer = 0;
    this.missileFireTimer = 0;

    this.buildStarfield();
    this.bgDecor = [];
    this.bgZoneIndex = -1;
    this.pickBgZone(true);

    // groups
    this.playerBullets = this.physics.add.group();
    this.missiles = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.gems = this.physics.add.group();
    this.comps = this.physics.add.group();      // composants ◆ (world/composants.js)
    this.heals = this.physics.add.group();

    // player
    this.player = this.physics.add.sprite(GAME_W/2, GAME_H-90, 'playerBase');
    this.player.setDepth(10);
    this.player.setScale(PLAYER_SHIP_SCALE);
    this.skinTint = shipSkinTint(getShipSkin()); this.applyShipSkin();      // apparence choisie au hangar
    this.playerParts = this.add.image(this.player.x, this.player.y, shipPartsTexture(this, getShipParts())).setDepth(10.1).setScale(PLAYER_SHIP_SCALE);
    this.player.body.setSize(150, 170);
    this.playerTarget = { x: this.player.x, y: this.player.y };
    this.dragging = false;

    // moments forts: mob doré, événements, stats de fin de partie, ralenti, dernier souffle
    this.goldCd = 30000; this.eventCd = 55000; this.curEvent = null; this.curSmall = null; this._wells = []; this._corr = null; this._ecl = null; this._ice = null; this._empOn = false; this._empUntil = 0; this._plasma = null; this.smallCd = 25000; this._wave1 = false; this.baseAlert = this.alertLevel; this.alertTimer = 0; this.alertRises = 0; this._double1 = false; this._frenzyUntil = 0; this._magnetUntil = 0; this.cameras.main.setRotation(0); this.bosses = []; this._relicQueue = []; this._relicNext = [];
    this.runKills = 0; this.runMaxChain = 0; this.runGold = 0; this.runFragBonus = 0; this.runComposants = 0;
    clearTimeout(this.deathTimer);
    this.slowmo = null; this.lastStandUsed = false; this.tweens.timeScale = 1; this.time.timeScale = 1; this.anims.globalTimeScale = 1; if (this.physics && this.physics.world) this.physics.world.timeScale = 1;      // un redémarrage en plein arrêt sur image ne doit pas rester figé
    this.combo = { n:0, t:0, pts:0 }; this.comboRank = 0; this.runBestCombo = 0; this.runBestRank = 0; this._styleDirty = false; this._styleT = 0;
    this.od = 0; this.odUses = 0; this.odActive = 0; this.odReady = false; this.odShield = 0; this._odK = 0; this.relics = [];   // overdrive + reliques de la partie
    this.physics.world.timeScale = 1; this.tweens.timeScale = 1; this.time.timeScale = 1; this.anims.globalTimeScale = 1;
    // compétences actives (foudre, rebond, tonnerre, champ lent, pulsar, trou noir)
    this.skillGfx = this.add.graphics(); this.skillGfx.setDepth(9.5); this.skillGfx.setBlendMode(Phaser.BlendModes.ADD);
    this._arcs = []; this.thunderCd = 6000; this.pulsarCd = 8000; this.holeCd = 6000; this.hole = null;
    this.shipDmgGfx = this.add.graphics(); this.shipDmgGfx.setDepth(12);   // fissures du vaisseau abîmé
    this.smokeCd = 0; this.sparkCd = 1000; this._shipTintStep = -1;
    this.shieldAura = this.add.image(this.player.x, this.player.y, 'aura_playerBase');
    this.shieldAura.setDepth(11);
    this.shieldAura.setScale(PLAYER_SHIP_SCALE);
    this.shieldAura.setVisible(false);

    // niveau de menace: le vaisseau démarre déjà au tier correspondant (sans flash/particules)
    if (this.alertLevel > 1){
      const startTier = Math.min(4, this.alertLevel);
      const startKey = ['playerBase','playerBase','playerT2','playerT3','playerT4'][startTier];
      this.shipTier = startTier;
      this.player.setTexture(startKey);
      this.shieldAura.setTexture('aura_' + startKey);
    }

    this.droneSprites = [];
    if (this.droneOwned){
      const droneCount = this.droneSwarmOwned ? 3 : 1;
      for (let i=0;i<droneCount;i++){
        const d = this.add.image(this.player.x, this.player.y-40, 'droneSat');
        d.setDepth(11);
        d.angleOffset = (Math.PI*2/droneCount)*i;
        d.fireTimer = Phaser.Math.Between(0,300);
        this.droneSprites.push(d);
      }
    }

    // input drag — worldX/Y tient compte du zoom de la caméra, contrairement à x/y bruts
    this.input.on('pointerdown', (p)=>{
      if (this.introActive && this._introEarth && this.introT > 900 && this.introT < INTRO_E_TOTAL - 500){ this.introT = INTRO_E_TOTAL - 500; return; }   // un toucher accélère la fin du décollage
      this.dragging = true;
      this.setTarget(p.worldX, p.worldY);
      const now = this.time.now;
      if (now - (this.lastTapTime||0) < 300) this.tryDodge();
      this.lastTapTime = now;
    });
    this.input.on('pointermove', (p)=>{ if (this.dragging) this.setTarget(p.worldX, p.worldY); });
    this.input.on('pointerup', ()=>{ this.dragging = false; });
    this.input.on('pointerout', ()=>{ this.dragging = false; });

    // collisions
    this.physics.add.overlap(this.playerBullets, this.enemies, this.onBulletHitsEnemy, null, this);
    this.physics.add.overlap(this.missiles, this.enemies, this.onMissileHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyHitsPlayer, null, this);
    this.physics.add.overlap(this.player, this.enemyBullets, this.onEnemyBulletHitsPlayer, null, this);
    // les tirs de la boule de plasma touchent aussi les ennemis
    this.physics.add.overlap(this.enemyBullets, this.enemies, (b, e)=>{
      if (!b.active || !e.active) return;
      const boss = e.enemyType === 'boss' || e.isBossPart || e.isBonus, mh = e.maxHp || 20;
      this.applyDamageToEnemy(e, boss ? mh*0.012 : Math.max(8, mh*0.22));
      this.spawnHitParticles(b.x, b.y, 2); b.destroy();
      if (e.active && e.hp <= 0) this.killEnemy(e);
    }, (b, e)=> !!b._plasma, this);
    this.physics.add.overlap(this.player, this.gems, this.onCollectGem, null, this);
    this.physics.add.overlap(this.player, this.comps, this.onCollectComposant, null, this);
    this.physics.add.overlap(this.player, this.heals, this.onCollectHeal, null, this);

    this.fireTimer = 0;
    this.spawnTimer = 1400; // brief grace period before enemies start appearing
    this.nextBossAt = 35; // seconds — first boss checkpoint
    this.bossesDefeated = 0;
    this.bossBag = []; this.lastBossId = null;
    try {
      const sv = JSON.parse(localStorage.getItem('ssx_bossbag_v1') || 'null');
      if (sv && Array.isArray(sv.bag)){ this.bossBag = sv.bag.filter(id=> BOSS_DEFS[id]); this.lastBossId = sv.last || null; }
    } catch(e){ /* ignore */ }
    this.bossActive = false;
    this.difficultyTier = 0;
    this.levelInit();

    this.physics.world.pause();

    // un (re)démarrage de scène (REJOUER, DEMARRER) doit toujours repartir d'un
    // DOM propre — ces panneaux sont du HTML statique, Phaser ne les touche pas tout seul
    document.getElementById('gameover').classList.add('hidden');
    document.getElementById('levelup').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('settingsMenu').classList.add('hidden');
    document.querySelectorAll('#boss-hp-wrap, #boss-hp-wrap2, #boss-hp-wrap3').forEach(x=>x.classList.remove('show'));
    document.getElementById('boss-banner').classList.remove('show');

    this.setupDom();
    this.updateHud(true);

    if (data && data.autoStart){
      if (this.scene.isActive('home') || this.scene.isSleeping('home')) this.scene.sleep('home');       // l'accueil s'endort pendant un niveau
      this.scene.setVisible(true);
      document.body.classList.remove('at-home');
      this.startRun();
    } else this.showStartScreen();                                                                    // sinon (dont retour du tuto : toMenu) : accueil
  }
}
