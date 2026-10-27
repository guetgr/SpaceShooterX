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
      this.scene.restart({ autoStart:true });
    };
    document.getElementById('btnContinue').onclick = ()=>{
      sfx.resume(); sfx.uiStart();
      this.resumeRun();
    };
    document.getElementById('btnRetry').onclick = ()=>{ sfx.uiStart(); this.scene.restart({ autoStart:true, levelId: this.lvDef ? this.lvDef.id : undefined }); };
    document.getElementById('hiScoreStart').textContent = getHighScore();
    document.getElementById('fragStart').textContent = this.meta.composants;

    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.onclick = ()=>{
      if (!this.running) return;
      sfx.uiPause();
      this.running = false;
      this.physics.world.pause();
      music.stop();
      this.openPauseMenu();
    };
    document.getElementById('luPause').onclick = ()=>{         // pause aussi pendant le choix d'amélioration / de relique (le jeu est déjà figé)
      sfx.uiPause();
      this.openPauseMenu();
    };
    document.getElementById('btnResume').onclick = ()=>{
      sfx.uiResume();
      if (!document.getElementById('levelup').classList.contains('hidden')){ Motion.closeSheet('pauseMenu'); return; }   // le choix de carte est encore ouvert: on ne relance pas le jeu derrière
      Motion.closeSheet('pauseMenu');
      this.physics.world.resume();
      this.running = true;
      music.start();
    };
    document.getElementById('btnSettings').onclick = ()=>{
      sfx.uiOpen();
      this.settingsReturnTo = 'pause';
      this.updateSettingsLabels();
      Motion.closeSheet('pauseMenu', ()=> Motion.openSheet('settingsMenu'));
    };
    document.getElementById('btnOptionsMain').onclick = ()=>{
      sfx.uiOpen();
      this.settingsReturnTo = 'start';
      document.getElementById('start').classList.add('hidden');
      this.updateSettingsLabels();
      Motion.openSheet('settingsMenu');
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
      Motion.closeSheet('pauseMenu', ()=> document.getElementById('infoMenu').classList.remove('hidden'));
    };
    document.getElementById('btnInfoBack').onclick = ()=>{
      sfx.uiBack();
      document.getElementById('infoMenu').classList.add('hidden');
      if (this.infoReturnTo === 'pause') Motion.openSheet('pauseMenu');
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
      if (this._statsFromPause){ this._statsFromPause = false; this.renderPauseGear(true); Motion.openSheet('pauseMenu'); }
      else document.getElementById('infoMenu').classList.remove('hidden');
    };
    document.getElementById('btnPauseStats').onclick = ()=>{
      sfx.uiOpen(); this.infoReturnTo = 'pause'; this._statsFromPause = true;
      this.renderStatsPage();
      Motion.closeSheet('pauseMenu', ()=> document.getElementById('statsPage').classList.remove('hidden'));
    };
    ['pgTabG', 'pgTabM'].forEach(id=>{ document.getElementById(id).onclick = ()=>{ const t = document.getElementById(id).dataset.t; if (this.pgTab === t) return; sfx.uiSelect(); this.pgTab = t; this.renderPauseGear(false); }; });
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
      Motion.closeSheet('settingsMenu', ()=>{
        if (this.settingsReturnTo === 'start') this.showStartScreen();
        else Motion.openSheet('pauseMenu');
      });
    };
    [['volMaster','master'],['volMusic','music'],['volSfx','sfx']].forEach(([id,k])=>{
      const el = document.getElementById(id), lab = document.getElementById(id + 'V');
      const paint = ()=>{ el.value = VOL[k]; lab.textContent = VOL[k]; el.style.setProperty('--p', VOL[k] + '%'); };
      paint();
      el.oninput = ()=>{ VOL[k] = +el.value; VOL.save(); paint(); Motion.tick(lab, 1.18); sfx.resume(); sfx.applyVol(); music.applyVol(); };      // effet immédiat
      el.onchange = ()=>{ if (k !== 'music') sfx.uiSelect(); };                                                       // petit bip pour entendre le niveau des effets
      el.onpointerdown = (e)=> e.stopPropagation();
    });
    document.getElementById('btnSfxToggle').onclick = ()=>{
      sfx.resume();
      sfx.setMuted(!sfx.muted); sfx.uiToggle();
      this.updateSettingsLabels(); Motion.pop(document.getElementById('btnSfxToggle'), 1.22);
    };
    document.getElementById('btnMusicToggle').onclick = ()=>{
      sfx.resume();
      music.setMuted(!music.muted); sfx.uiToggle();
      this.updateSettingsLabels(); Motion.pop(document.getElementById('btnMusicToggle'), 1.22);
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
        btn.textContent = 'TOUCHE ENCORE : TOUT EFFACER';
        clearTimeout(this.resetArmTimer);
        this.resetArmTimer = setTimeout(()=>{
          this.resetArmed = false;
          btn.textContent = 'RÉINITIALISER LA PROGRESSION';
        }, 3000);
        return;
      }
      clearTimeout(this.resetArmTimer);
      this.resetArmed = false;
      this.meta = { composants:0, tree:{}, asc:0 };
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
      document.getElementById('fragStart').textContent = this.meta.composants;
    };
    document.getElementById('btnQuit').onclick = ()=>{            // demande confirmation dans la feuille (plus de bouton « re-tape »)
      sfx.uiOpen();
      document.getElementById('btnQuit').classList.add('hidden');
      const qc = document.getElementById('quitConfirm'); qc.classList.remove('hidden'); Motion.pop(qc, 1.06);
    };
    document.getElementById('btnQuitNo').onclick = ()=>{ sfx.uiBack(); this.resetQuitConfirm(); };
    document.getElementById('btnQuitYes').onclick = ()=>{          // abandonner le niveau : écran de résultat (les fragments gagnés sont gardés)
      sfx.uiBack();
      if (this.tuto){ this.hasActiveRun = false; this.tutoFinish(); return; }
      document.getElementById('pauseMenu').classList.add('hidden');
      this.endRun(false, true);
    };
    document.getElementById('btnGearToggle').onclick = ()=>{        // « ÉQUIPEMENT » se déplie / se replie
      sfx.uiSelect();
      const g = document.getElementById('pauseGear'), open = g.classList.toggle('open');
      document.getElementById('btnGearToggle').setAttribute('aria-expanded', String(open));
    };
    if (!window._escBound){                                         // Échap : retour / reprise / pause
      window._escBound = true;
      window.addEventListener('keydown', e=>{
        if (e.key !== 'Escape') return;
        const vis = id=>{ const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
        if (vis('settingsMenu')) document.getElementById('btnSettingsBack').click();
        else if (vis('pauseMenu')) document.getElementById('btnResume').click();
        else { const sc = window.__ssxScene; if (sc && sc.running && !vis('levelup') && !vis('gameover')) document.getElementById('pauseBtn').click(); }
      });
    }

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
    this.setupTreeUi();
  },

  // pause : feuille animée, sous-titre (niveau · temps), équipement replié, confirmation de sortie réinitialisée
  openPauseMenu(){
    this.renderPauseGear(false); this.fillPauseSub(); this.resetQuitConfirm();
    document.getElementById('pauseGear').classList.remove('open'); document.getElementById('btnGearToggle').setAttribute('aria-expanded', 'false');
    Motion.openSheet('pauseMenu');
  },
  fillPauseSub(){
    const L = this.lvDef, t = Math.floor(this.elapsed || 0), time = Math.floor(t/60) + ':' + String(t%60).padStart(2, '0');
    document.getElementById('pauseSub').textContent = (this.tuto ? 'TUTORIEL' : (L ? 'NIV.' + L.num + ' · ' + L.name : 'PARTIE LIBRE')) + ' · ' + time;
    document.getElementById('btnQuit').textContent = (this.tuto || L) ? 'QUITTER LE NIVEAU' : 'TERMINER LA PARTIE';
    document.getElementById('quitMsg').textContent = this.tuto ? 'Quitter le tuto ? Ta finition est enregistrée.' : 'Abandonner ? Les fragments gagnés sont gardés.';
  },
  resetQuitConfirm(){ document.getElementById('quitConfirm').classList.add('hidden'); document.getElementById('btnQuit').classList.remove('hidden'); },

  updateSettingsLabels(){
    if (this.syncNameInputs) this.syncNameInputs();
    const cs = document.getElementById('cloudStatus');
    if (cs){
      cs.textContent = CloudSave.ok
        ? (CloudSave.status === 'erreur' ? 'SAUVEGARDE CLOUD : ERREUR (copie locale gardée)' : 'SAUVEGARDE CLOUD : ACTIVE' + (CloudSave.restored ? ' (partie restaurée)' : ''))
        : 'SAUVEGARDE CLOUD : INDISPONIBLE (copie locale seulement)';
      cs.style.setProperty('--dot', CloudSave.ok && CloudSave.status !== 'erreur' ? '#7bff9a' : '#ffb35a');
    }
    [['btnSfxToggle', sfx.muted], ['btnMusicToggle', music.muted]].forEach(([id, off])=>{ const b = document.getElementById(id); b.classList.toggle('off', !!off); b.setAttribute('aria-pressed', String(!off)); });
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
});
