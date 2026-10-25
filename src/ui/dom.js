"use strict";
// Méthodes de GameScene — interface HTML : menus, boutons, écran de départ.
mixin(GameScene, {
  setupDom(){
    document.getElementById('rerollBtn').onclick = ()=> this.rerollCards();
    // overdrive: bouton à l'écran (tactile) ou touche ESPACE (PC)
    const odb = document.getElementById('odBtn');
    odb.onpointerdown = (ev)=>{
      ev.stopPropagation(); ev.preventDefault();
      if (!this.running && this.odReady){ this._odQueue = !this._odQueue; odb.classList.toggle('queued', this._odQueue); sfx.uiOpen && sfx.uiOpen(); return; }      // menu ouvert: on le programme, il part dès que le jeu reprend
      this.activateOverdrive();
    };
    this.input.keyboard.on('keydown-SPACE', ()=> this.activateOverdrive());
    { const sb = document.getElementById('btnSandbox');
      if (sb){ if (DEV_SEE_ALL) sb.classList.remove('hidden'); sb.onclick = ()=>{ sfx.resume(); sfx.uiStart(); this.scene.restart({ autoStart:true, sandbox:true }); }; } }
    { const row = document.getElementById('devLevelRow');           // DEV provisoire : lancer n'importe quel niveau (remplacé par la carte des mondes)
      if (row && DEV_SEE_ALL){
        row.classList.remove('hidden');
        const sel = document.getElementById('devLevel'); sel.innerHTML = '';
        WORLDS.forEach(w=> w.levels.forEach(l=>{ const o = document.createElement('option'); o.value = l.id; o.textContent = l.id + ' · ' + l.name + ' (menace ' + l.threat + ')'; sel.appendChild(o); }));
        document.getElementById('btnDevLevel').onclick = ()=>{ sfx.resume(); sfx.uiStart(); this.scene.restart({ autoStart:true, levelId: sel.value }); };
      } }
    ['btnTuto','btnTutoDev'].forEach(id=>{ const tb = document.getElementById(id); if (!tb) return; if (DEV_SEE_ALL) tb.classList.remove('hidden');
      tb.onclick = ()=>{ sfx.resume(); sfx.uiStart(); ['pauseMenu','settingsMenu'].forEach(x=>{ const e = document.getElementById(x); if (e) e.classList.add('hidden'); }); this.scene.restart({ autoStart:true, tuto:true }); }; });
    document.getElementById('btnStart').onclick = ()=>{
      sfx.resume(); sfx.uiStart();
      this.scene.restart(this.tutoPending() ? { autoStart:true, tuto:true } : { autoStart:true });          // 1re partie (ou après réinitialisation) = le tuto
    };
    document.getElementById('btnContinue').onclick = ()=>{
      sfx.resume(); sfx.uiStart();
      this.resumeRun();
    };
    document.getElementById('btnRetry').onclick = ()=>{ sfx.uiStart(); this.scene.restart({ autoStart:true, levelId: this.lvDef ? this.lvDef.id : undefined }); };
    document.getElementById('hiScoreStart').textContent = getHighScore();
    document.getElementById('fragStart').textContent = this.meta.fragments;

    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.onclick = ()=>{
      if (!this.running) return;
      sfx.uiPause();
      this.running = false;
      this.physics.world.pause();
      music.stop();
      this.renderPauseGear(false);
      document.getElementById('pauseMenu').classList.remove('hidden');
    };
    document.getElementById('luPause').onclick = ()=>{         // pause aussi pendant le choix d'amélioration / de relique (le jeu est déjà figé)
      sfx.uiPause();
      this.renderPauseGear(false);
      document.getElementById('pauseMenu').classList.remove('hidden');
    };
    document.getElementById('btnResume').onclick = ()=>{
      sfx.uiResume();
      if (!document.getElementById('levelup').classList.contains('hidden')){ document.getElementById('pauseMenu').classList.add('hidden'); return; }   // le choix de carte est encore ouvert: on ne relance pas le jeu derrière
      document.getElementById('pauseMenu').classList.add('hidden');
      this.physics.world.resume();
      this.running = true;
      music.start();
    };
    document.getElementById('btnSettings').onclick = ()=>{
      sfx.uiOpen();
      this.settingsReturnTo = 'pause';
      document.getElementById('pauseMenu').classList.add('hidden');
      this.updateSettingsLabels();
      document.getElementById('settingsMenu').classList.remove('hidden');
    };
    document.getElementById('btnOptionsMain').onclick = ()=>{
      sfx.uiOpen();
      this.settingsReturnTo = 'start';
      document.getElementById('start').classList.add('hidden');
      this.updateSettingsLabels();
      document.getElementById('settingsMenu').classList.remove('hidden');
    };
    document.getElementById('btnInfo').onclick = ()=>{
      sfx.uiOpen();
      this.infoReturnTo = 'start';
      document.getElementById('start').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnPauseInfo').onclick = ()=>{
      sfx.uiOpen();
      this.infoReturnTo = 'pause';
      document.getElementById('pauseMenu').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnInfoBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('infoMenu').classList.add('hidden');
      if (this.infoReturnTo === 'pause') document.getElementById('pauseMenu').classList.remove('hidden');
      else this.showStartScreen();
    };
    // le pseudo se règle dans PARAMETRES ou en haut de STATS DU VAISSEAU (même valeur partout)
    this.syncNameInputs = ()=>{
      const n = getPlayerName();
      document.getElementById('setName').value = n;
      document.getElementById('statsName').value = n;
    };
    ['setName','statsName'].forEach(id=>{
      document.getElementById(id).oninput = (ev)=>{
        const clean = sanitizeName(ev.target.value);
        setPlayerName(clean);
        ['setName','statsName'].forEach(o=>{ const el = document.getElementById(o); if (el !== ev.target) el.value = clean; });
      };
    });
    this.syncNameInputs();
    document.getElementById('btnOpenStats').onclick = ()=>{
      sfx.uiOpen();
      document.getElementById('infoMenu').classList.add('hidden');
      this.renderStatsPage();
      document.getElementById('statsPage').classList.remove('hidden');
    };
    document.getElementById('btnStatsBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('statsPage').classList.add('hidden');
      if (this._statsFromPause){ this._statsFromPause = false; this.renderPauseGear(true); document.getElementById('pauseMenu').classList.remove('hidden'); }
      else document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnPauseStats').onclick = ()=>{
      sfx.uiOpen(); this.infoReturnTo = 'pause'; this._statsFromPause = true;
      document.getElementById('pauseMenu').classList.add('hidden');
      this.renderStatsPage(); document.getElementById('statsPage').classList.remove('hidden');
    };
    document.getElementById('pgPrev').onclick = ()=>{ sfx.uiPage(); this.pgPageNo = (this.pgPageNo||0) - 1; this.renderPauseGear(true); };
    document.getElementById('pgNext').onclick = ()=>{ sfx.uiPage(); this.pgPageNo = (this.pgPageNo||0) + 1; this.renderPauseGear(true); };
    document.getElementById('btnOpenBestiary').onclick = ()=>{
      sfx.uiOpen();
      document.getElementById('infoMenu').classList.add('hidden');
      this.renderBestiaryPage();
      document.getElementById('bestiaryPage').classList.remove('hidden');
    };
    document.getElementById('btnBestiaryBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('bestiaryPage').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnOpenAchv').onclick = ()=>{
      sfx.uiOpen();
      document.getElementById('infoMenu').classList.add('hidden');
      this.renderAchievementsPage();
      document.getElementById('achvPage').classList.remove('hidden');
    };
    document.getElementById('btnOpenPacts').onclick = ()=>{
      sfx.uiOpen();
      document.getElementById('infoMenu').classList.add('hidden');
      this.renderPactsPage();
      document.getElementById('pactsPage').classList.remove('hidden');
    };
    document.getElementById('btnPactsBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('pactsPage').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnOpenCodex').onclick = ()=>{
      sfx.uiOpen();
      document.getElementById('infoMenu').classList.add('hidden');
      this.renderCodexPage();
      document.getElementById('codexPage').classList.remove('hidden');
    };
    document.getElementById('btnCodexBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('codexPage').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnAchvBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('achvPage').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnOpenLeaderboard').onclick = ()=>{
      sfx.uiOpen();
      document.getElementById('infoMenu').classList.add('hidden');
      this.renderLeaderboardPage();
      document.getElementById('leaderboardPage').classList.remove('hidden');
    };
    document.getElementById('btnLeaderboardBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('leaderboardPage').classList.add('hidden');
      document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnSettingsBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('settingsMenu').classList.add('hidden');
      if (this.settingsReturnTo === 'start'){
        this.showStartScreen();
      } else {
        document.getElementById('pauseMenu').classList.remove('hidden');
      }
    };
    [['volMaster','master'],['volMusic','music'],['volSfx','sfx']].forEach(([id,k])=>{
      const el = document.getElementById(id), lab = document.getElementById(id + 'V');
      const paint = ()=>{ el.value = VOL[k]; lab.textContent = VOL[k]; el.style.setProperty('--p', VOL[k] + '%'); };
      paint();
      el.oninput = ()=>{ VOL[k] = +el.value; VOL.save(); paint(); sfx.resume(); sfx.applyVol(); music.applyVol(); };      // effet immédiat
      el.onchange = ()=>{ if (k !== 'music') sfx.uiSelect(); };                                                       // petit bip pour entendre le niveau des effets
      el.onpointerdown = (e)=> e.stopPropagation();
    });
    document.getElementById('btnSfxToggle').onclick = ()=>{
      sfx.resume();
      sfx.setMuted(!sfx.muted); sfx.uiToggle();
      this.updateSettingsLabels();
    };
    document.getElementById('btnMusicToggle').onclick = ()=>{
      sfx.resume();
      music.setMuted(!music.muted); sfx.uiToggle();
      this.updateSettingsLabels();
    };
    // sauvegarde manuelle: un code à copier ailleurs, et à recoller pour tout récupérer
    const box = document.getElementById('saveBox'), okb = document.getElementById('btnImportOk');
    document.getElementById('btnExport').onclick = ()=>{
      sfx.uiClick();
      CloudSave.push();
      const code = CloudSave.exportCode();
      box.value = code; box.readOnly = true; box.classList.remove('hidden'); okb.classList.add('hidden');
      box.focus(); box.select();
      let copied = false;
      try { if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(code); copied = true; } } catch(e){ /* ignore */ }
      document.getElementById('btnExport').textContent = copied ? 'COPIE !' : 'EXPORTER';
      setTimeout(()=>{ document.getElementById('btnExport').textContent = 'EXPORTER'; }, 1600);
    };
    document.getElementById('btnImport').onclick = ()=>{
      sfx.uiClick();
      box.value = ''; box.readOnly = false; box.classList.remove('hidden'); okb.classList.remove('hidden'); okb.textContent = "VALIDER L'IMPORT"; this._importConfirm = false; box.focus();
    };
    okb.onclick = ()=>{
      sfx.uiClick();
      if (!this._importConfirm){ this._importConfirm = true; okb.textContent = 'RE-TAPE: REMPLACE TA PARTIE'; setTimeout(()=>{ this._importConfirm = false; okb.textContent = "VALIDER L'IMPORT"; }, 3500); return; }
      if (CloudSave.importCode(box.value)){ okb.textContent = 'OK, REDEMARRAGE...'; setTimeout(()=> location.reload(), 400); }
      else { okb.textContent = 'CODE INVALIDE'; this._importConfirm = false; setTimeout(()=>{ okb.textContent = "VALIDER L'IMPORT"; }, 1800); }
    };
    document.getElementById('btnResetProgress').onclick = ()=>{
      const btn = document.getElementById('btnResetProgress');
      if (!this.resetArmed){
        this.resetArmed = true;
        sfx.uiError();
        btn.textContent = 'RE-TAPE: ARBRE + SUCCES + BESTIAIRE';
        clearTimeout(this.resetArmTimer);
        this.resetArmTimer = setTimeout(()=>{
          this.resetArmed = false;
          btn.textContent = 'RÉINITIALISER LA PROGRESSION';
        }, 3000);
        return;
      }
      clearTimeout(this.resetArmTimer);
      this.resetArmed = false;
      this.meta = { fragments:0, tree:{}, asc:0 };
      this.treeState = this.meta.tree;
      setMeta(this.meta);
      // les succès et le bestiaire repartent aussi de zéro (sinon les kills du bestiaire les feraient réapparaître)
      this.achv = { killsAlert:{}, tier:{}, glob:{}, bossKills:{}, rawTotal:0, alertKills:0, bossTotal:0, maxAlert:0, maxTime:0, maxLevel:0, maxChain:0 };
      setAchv(this.achv);
      this.codex = { relics:{}, cards:{}, fusions:{}, skills:{}, usedSkills:{} }; setCodex(this.codex);
      this.bestiary = { kills:{} }; this.bestiaryDirty = false;
      setBestiary(this.bestiary);
      try { localStorage.removeItem('ssx_bossbag_v1'); localStorage.removeItem(WORLDS_KEY); localStorage.removeItem('ssx_tuto_v1'); } catch(e){ /* ignore */ }      // après une réinitialisation, la 1re partie redevient le tuto
      sfx.uiClick();
      btn.textContent = 'RÉINITIALISER LA PROGRESSION';
      document.getElementById('fragStart').textContent = this.meta.fragments;
    };
    document.getElementById('btnQuit').onclick = ()=>{            // abandonner le niveau : écran de résultat (les fragments gagnés sont gardés)
      sfx.uiBack();
      if (this.tuto){ this.hasActiveRun = false; this.tutoFinish(); return; }
      document.getElementById('pauseMenu').classList.add('hidden');
      this.endRun(false, true);
    };

    document.getElementById('btnSkills').onclick = ()=>{            // (ancien menu DEV) : l'arbre est la page de droite de l'accueil
      document.getElementById('start').classList.add('hidden');
      const h = this.scene.get('home'); if (h && h.homeOn) h.goHomePage(1);
    };
    document.getElementById('btnNext').onclick = ()=>{ if (this.lvResult && this.lvResult.next){ sfx.uiStart(); this.scene.restart({ autoStart:true, levelId:this.lvResult.next }); } };
    document.getElementById('btnGoMenu').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('gameover').classList.add('hidden');
      this.hasActiveRun = false;
      this.showStartScreen();
    };
    this.setupTreeInteraction();
  },

  setupTreeInteraction(){
    const stage = document.getElementById('treeStage');
    const viewport = document.getElementById('treeViewport');
    if (this.treeScale === undefined){ this.treeTx=0; this.treeTy=0; this.treeScale=0.95; }
    const svgEl = document.getElementById('treeSvg');
    const applyT = ()=>{
      viewport.setAttribute('transform', `translate(${this.treeTx},${this.treeTy}) scale(${this.treeScale})`);
      if (svgEl) svgEl.classList.toggle('tree-far', this.treeScale < 1.15);   // dézoomé: les noms des compétences non possédées disparaissent
    };
    this.buildTreeChips();
    this._treeApplyTransform = applyT;
    const pts = new Map(); let pinch0 = 0, scale0 = 1;                  // pointeurs actifs : 1 doigt = déplacer, 2 doigts = zoomer
    stage.onpointerdown = (e)=>{
      // ne pas voler le toucher au nœud visé (son propre clic doit partir)
      if (pts.size === 0 && e.target.closest && e.target.closest('.tree-node')) return;
      pts.set(e.pointerId, { x:e.clientX, y:e.clientY }); stage.setPointerCapture(e.pointerId);
      if (pts.size === 2){ const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); scale0 = this.treeScale; }
    };
    stage.onpointermove = (e)=>{
      const p = pts.get(e.pointerId); if (!p) return;
      if (pts.size === 2){
        p.x = e.clientX; p.y = e.clientY;
        const [a, b] = [...pts.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0 > 0) this.treeScale = Math.min(3.2, Math.max(0.32, scale0*dist/pinch0));
        applyT(); return;
      }
      this.treeTx += (e.clientX - p.x); this.treeTy += (e.clientY - p.y);
      p.x = e.clientX; p.y = e.clientY;
      applyT();
    };
    const endDrag = (e)=>{ pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
    stage.onpointerup = endDrag;
    stage.onpointercancel = endDrag;
    stage.onpointerleave = endDrag;
    stage.onwheel = (e)=>{
      e.preventDefault();
      const delta = e.deltaY>0 ? -0.08 : 0.08;
      this.treeScale = Math.min(3.2, Math.max(0.32, this.treeScale+delta));
      applyT();
    };
    applyT();
  },

  updateSettingsLabels(){
    if (this.syncNameInputs) this.syncNameInputs();
    const cs = document.getElementById('cloudStatus');
    if (cs){
      cs.textContent = CloudSave.ok
        ? (CloudSave.status === 'erreur' ? 'SAUVEGARDE CLOUD : ERREUR (copie locale gardée)' : 'SAUVEGARDE CLOUD : ACTIVE' + (CloudSave.restored ? ' (partie restaurée)' : ''))
        : 'SAUVEGARDE CLOUD : INDISPONIBLE (copie locale seulement)';
      cs.style.color = CloudSave.ok && CloudSave.status !== 'erreur' ? '#7bff9a' : '#ffb35a';
    }
    document.getElementById('btnSfxToggle').textContent = sfx.muted ? 'SON : COUPÉ' : 'SON : ACTIVÉ';
    document.getElementById('btnMusicToggle').textContent = music.muted ? 'MUSIQUE : COUPÉE' : 'MUSIQUE : ACTIVÉE';
  },

  // retour à l'accueil (scène 'home') : l'ancien menu #start n'est plus affiché que par le bouton DEV
  showStartScreen(){
    document.getElementById('start').classList.add('hidden');
    music.setScene({ mode:'menu' }); music.setMood(1, 0); music.start();                    // musique du menu
    this.scene.setVisible(false); this.input.enabled = false;                               // le jeu ne dessine plus rien derrière l'accueil
    const home = this.scene.get('home');
    if (this.scene.isSleeping('home')) this.scene.wake('home');
    else if (!this.scene.isActive('home')) this.scene.launch('home');
    else if (home.homeOn) home.refreshHome();                                               // retour d'un panneau (arbre, réglages)
  },

  goToMenu(){
    music.stop();
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('settingsMenu').classList.add('hidden');
    document.getElementById('gameover').classList.add('hidden');
    document.getElementById('levelup').classList.add('hidden');
    document.querySelectorAll('#boss-hp-wrap, #boss-hp-wrap2, #boss-hp-wrap3').forEach(x=>x.classList.remove('show'));
    document.getElementById('boss-banner').classList.remove('show');
    this.showStartScreen();
  },
});
