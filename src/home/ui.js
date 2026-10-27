"use strict";
// Méthodes de HomeScene — panneaux HTML de l'accueil : pages, carte des niveaux, hangar, arbre, lancement.
const HOME_STAT_LINES = [
  ['PV MAX', s=> Math.round(s.maxHp)], ['BOUCLIER', s=> Math.round(s.shieldMax)], ['DEGATS PAR TIR', s=> s.damage.toFixed(1)],
  ['CADENCE', s=> (1000/s.fireRate).toFixed(2) + ' tirs/s'], ['PROJECTILES', s=> s.spreadCount], ['ARMURE', s=> Math.round(s.armorPct*100) + '%'],
];

function levelGoalText(l){
  const g = l.goal || {};
  if (l.type === 'survive') return 'Survivre <b>' + g.seconds + ' s</b>';
  if (l.type === 'kill') return 'Éliminer <b>' + g.count + '</b> ennemis';
  if (l.type === 'collect') return 'Récolter <b>' + g.gems + '</b> cristaux';
  if (l.type === 'tuto') return 'Apprendre les bases : <b>satellites, débris, boss</b>';
  if (l.type === 'boss') return 'Vaincre le boss : <b>' + (l.bossName || (BOSS_DEFS[l.boss] || {}).name || l.boss) + '</b>';
  return '';
}

mixin(HomeScene, {
  setupHomeUi(){
    const $ = id=> document.getElementById(id);
    $('tabHangar').onclick = ()=> this.goHomePage(-1);
    $('tabMap').onclick = ()=>{                                                      // CARTE : revenir sur la page, puis basculer monde ↔ carte stellaire
      if (this.page !== 0) this.goHomePage(0);
      else if (this.mapMode === 'world') this.enterGalaxy();
      else if (this.mapMode === 'galaxy') this.enterWorldView(this.homeWorld);
    };
    $('tabTree').onclick = ()=> this.goHomePage(1);
    $('btnGalaxy').onclick = ()=> this.enterGalaxy();
    $('btnBackWorld').onclick = ()=> this.enterWorldView(this.homeWorld);
    $('btnLaunch').onclick = ()=> this.launchLevel();
    Motion.bindPress();
    Norma.startTicker(document.getElementById('homeTicker'), ()=> this.homeOn);
    AtelierGarage.setup();
    this.initOrbitalUi();
    $('homeSettings').onclick = ()=>{ $('btnOptionsMain').click(); };
    if (DEV_SEE_ALL){
      $('btnDevHome').classList.remove('hidden');
      $('btnDevHome').onclick = ()=> $('start').classList.remove('hidden');           // ancien menu : partie infinie, bac à sable, choix d'un niveau
      $('btnDevClose').onclick = ()=> $('start').classList.add('hidden');
    }
    // glisser le doigt (ou la souris) d'une page à l'autre : écouté sur le conteneur, donc même au-dessus des boutons
    const box = $('game-container'); let sx = 0, sy = 0, st = 0, down = false;
    // carte du monde → carte stellaire : pincer à deux doigts (dans un sens ou l'autre), glisser vers le bas, ou molette vers le bas
    const pts = new Map(); let pinch0 = 0;
    const canGalaxy = ()=> this.homeOn && this.page === 0 && this.mapMode === 'world' && !document.querySelector('.overlay:not(.hidden)');
    const pinchDist = ()=>{ const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    box.addEventListener('pointermove', e=>{
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x:e.clientX, y:e.clientY });
      if (pts.size === 2 && pinch0 && Math.abs(pinchDist() - pinch0) > 60){ pinch0 = 0; if (canGalaxy()) this.enterGalaxy(); }
    });
    const pinchEnd = e=>{ pts.delete(e.pointerId); pinch0 = 0; };
    box.addEventListener('pointercancel', pinchEnd);
    box.addEventListener('wheel', e=>{ if (e.deltaY > 20 && !e.target.closest('#levelCard') && canGalaxy()) this.enterGalaxy(); }, { passive:true });
    box.addEventListener('pointerdown', e=>{
      pts.set(e.pointerId, { x:e.clientX, y:e.clientY });
      if (pts.size === 2){ pinch0 = pinchDist(); down = false; return; }                  // 2e doigt : pincement, plus un glissement de page
      if(e.target.closest('#levelCard,.orbit-controls')){down=false;return;}
      down = true; sx = e.clientX; sy = e.clientY; st = performance.now();
      // les onglets de l'arbre défilent à l'horizontale : on ne change de page depuis eux que depuis le bord gauche de l'écran
      if (e.target.closest && e.target.closest('#treeTabs') && e.clientX - box.getBoundingClientRect().left > 32) down = false;
    });
    box.addEventListener('pointerup', e=>{
      pinchEnd(e);
      if (!down) return; down = false;
      if (!this.homeOn || document.querySelector('.overlay:not(.hidden)')) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (dy > 90 && dy > Math.abs(dx)*1.5 && performance.now() - st < 700 && canGalaxy()){ this.enterGalaxy(); return; }
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)*1.5 && performance.now() - st < 700) this.goHomePage(this.page + (dx < 0 ? 1 : -1));
    });
    this.input.keyboard.on('keydown-LEFT', ()=>{ if (this.homeOn && !document.querySelector('.overlay:not(.hidden)')) this.goHomePage(this.page - 1); });
    this.input.keyboard.on('keydown-RIGHT', ()=>{ if (this.homeOn && !document.querySelector('.overlay:not(.hidden)')) this.goHomePage(this.page + 1); });
    this.input.keyboard.on('keydown-ENTER', ()=>{ if (this.homeOn && this.page === 0 && !document.querySelector('.overlay:not(.hidden)')) this.launchLevel(); });
  },

  // musique du menu : celle du monde affiché (rang du monde), ou celle de la carte des secteurs ; identique sur les pages Atelier, Missions et R&D
  homeMusic(galaxy){
    const w = WORLDS[this.homeWorld];
    music.setScene({ mode:'menu', menuWorld: w ? w.order : 0, galaxy: !!galaxy });
  },

  enterHome(){
    this.homeOn = true; this._launching = false;
    Motion.breath(document.getElementById('btnLaunch'));
    document.body.classList.add('at-home');
    document.getElementById('home').classList.remove('hidden');
    this.cameras.main.resetFX(); this.cameras.main.fadeIn(350, 5, 4, 12); Motion.uncover();
    const p = getWorldProgress(), last = p.last && levelById(p.last);
    const nxt = last ? (nextLevelOf(p.last) || last) : firstOpenLevel(p);                  // on se place sur le niveau qui suit le dernier joué
    this.homeWorld = Math.max(0, WORLDS.findIndex(w=> w.id === (nxt || WORLDS[0].levels[0]).world));
    this.homeSel = (nxt && isLevelUnlocked(nxt.id, p)) ? nxt.id : (firstOpenLevel(p) || WORLDS[this.homeWorld].levels[0]).id;
    const front = firstOpenLevel(p);                                                       // monde où l'on en est : la camionnette y stationne sur la carte stellaire
    this.homeCurrent = Math.max(0, WORLDS.findIndex(w=> front ? w.id === front.world : w === WORLDS[WORLDS.length - 1]));
    this.resetMapView(); this.homeMusic(false);
    this.page = 99; this.goHomePage(0, true);                                              // toujours sur la carte à l'arrivée
    this.refreshHome();
    // nouveau monde débloqué depuis la dernière visite : voyage animé sur la carte stellaire (jamais en mode DEV, où tout est ouvert)
    if (!DEV_SEE_ALL){
      const k = WORLDS.findIndex((w, i)=> i > 0 && isWorldUnlocked(w.id, p) && !wasWorldSeen('w:' + w.id));
      if (k > 0) this.time.delayedCall(500, ()=> this.homeOn && this.playWorldUnlock(k));
    }
  },

  leaveHome(){
    this.homeOn = false;
    document.getElementById('home').classList.add('hidden');
  },

  // relit les sauvegardes et redessine tout (au retour d'un niveau, de l'arbre, des réglages)
  refreshHome(){
    if (!this.homeOn) return;
    const meta = getMeta();
    document.getElementById('homeFrag').innerHTML = uiIco('frag') + ' ' + meta.composants;
    this.renderHomeMap();
    if (this.mapMode === 'galaxy') this.refreshGalaxy();
    this.renderHomeHangar(meta);
    this.renderHomeTree(meta);
  },

  goHomePage(p, instant){
    p = Math.max(-1, Math.min(1, p));
    if (p === this.page && !instant) return;
    this.page = p;
    document.getElementById('home').classList.toggle('orbital-home', p === 0);
    if (!instant) sfx.uiOpen();
    const tr = document.getElementById('homeTrack');
    tr.className = p === 0 ? '' : 'p' + p;
    document.getElementById('tabHangar').classList.toggle('on', p === -1);
    document.getElementById('tabMap').classList.toggle('on', p === 0);
    document.getElementById('tabTree').classList.toggle('on', p === 1);
    this.tweens.add({ targets:this, pageX:p, duration: instant ? 1 : 450, ease:'Cubic.easeInOut' });
    if (!instant) Motion.enter(document.querySelectorAll('.home-page')[p + 1]);
    if (p === 1) this.showHomeTree();
    this.moveHomeVan(p);
  },

  selectHomeLevel(id){
    if (this.homeSel !== id) sfx.uiSelect();
    this.homeSel = id;
    this.renderHomeMap();
  },

  // monde affiché : titre, niveaux en orbite autour de la planète, fiche du niveau choisi
  renderHomeMap(fresh){
    const $ = id=> document.getElementById(id), p = getWorldProgress(), w = WORLDS[this.homeWorld], open = isWorldUnlocked(w.id, p);
    this.planetLocked = !open;
    if (this.mapMode !== 'galaxy') this.setHomePlanet(w, !open);
    $('mwNum').textContent = 'SECTEUR ' + String(w.order).padStart(2, '0');
    $('mwName').textContent = open ? w.name : '? ? ?';
    const sm = worldSummary(w.id, p);
    $('mwProg').innerHTML = open ? ('ORDRES EXECUTES ' + sm.done + '/' + sm.total + (sm.bossDown ? ' ' + uiIco('star') : '')) : 'ACCES REFUSE';
    const orb = $('mapOrbit'); orb.innerHTML = '';
    const n = w.levels.length;
    w.levels.forEach((l, k)=>{
      const done = isLevelDone(l.id, p), unl = isLevelUnlocked(l.id, p), point = homeOrbitPoint(k/Math.max(1,n-1), this.orbitRotation || 0);
      const slot = document.createElement('div'); slot.className = 'node-slot';
      slot.style.left = point.x + 'px'; slot.style.top = point.y + 'px';
      const b = document.createElement('button'), ico = LEVEL_ICONS[l.id];
      b.className = 'node ' + (done ? 'done' : (unl ? 'open' : 'locked')) + (l.type === 'boss' ? ' boss' : '') + (ico ? ' ico' : '') + (l.id === this.homeSel ? ' sel' : '');
      if (ico) b.innerHTML = '<img class="node-ico" alt="" draggable="false" src="' + ico + '" style="--b:' + (-k*0.7).toFixed(1) + 's">' +      // médaillon : l'icône du niveau (elle flotte), badge d'état, numéro en étiquette
        (!unl ? '<i class="nd-badge nd-lock">' + uiIco('lock') + '</i>' : (done ? '<i class="nd-badge nd-done">' + uiIco('check') + '</i>' : (l.type === 'boss' ? '<i class="nd-badge nd-boss">' + uiIco('skull') + '</i>' : ''))) + '<em class="nd-num">' + String(k + 1).padStart(2, '0') + '</em>';
      else b.innerHTML = '<span>' + (!unl ? uiIco('lock', 16) : (done ? uiIco('check', 16) : (l.type === 'boss' ? uiIco('skull', 16) : (l.type === 'tuto' ? '?' : l.num)))) + '</span>';
      b.setAttribute('aria-label', 'Ordre ' + (k+1) + ' ' + l.name + (!unl ? ' — verrouillé' : ''));
      b.setAttribute('aria-pressed', String(l.id === this.homeSel));
      b.style.pointerEvents = 'auto';
      b.onclick = ()=> this.selectHomeLevel(l.id);
      // un niveau tout juste débloqué apparaît avec un petit éclat (une seule fois)
      if (unl && !done && !(w.order === 1 && l.index === 0) && !DEV_SEE_ALL && !wasWorldSeen('l:' + l.id)){ b.classList.add('pop'); markWorldSeen('l:' + l.id); setTimeout(()=> b.classList.remove('pop'), 900); }
      const cp = completionDefs(l.id) ? completionPct(l.id, p.comp[l.id] || {}) : 0;      // % de finition sous le niveau
      if (cp > 0){ const bp = document.createElement('span'); bp.className = 'node-pct' + (cp >= 100 ? ' full' : ''); bp.textContent = cp + '%'; slot.appendChild(b); slot.appendChild(bp); } else slot.appendChild(b);
      orb.appendChild(slot);
    });
    const l = levelById(this.homeSel) && levelById(this.homeSel).world === w.id ? levelById(this.homeSel) : w.levels[0];
    if (l.id !== this.homeSel) this.homeSel = l.id;
    const unl = isLevelUnlocked(l.id, p), rec = p.levels[l.id];
    // fiche « ordre de mission » : n° de dossier, nature de l'ordre, objectif, risque, prime, note de service
    const ty = agpType(l), pips = '<i class="om-pips">' + [1, 2, 3, 4].map(k=> '<u' + (k <= Math.min(4, l.threat) ? ' class="f"' : '') + '></u>').join('') + '</i>';
    $('levelCard').className = 'level-card world-only ' + (l.type === 'boss' ? 'is-boss' : (l.type === 'tuto' ? 'is-tuto' : ''));
    $('levelCard').innerHTML = '<div class="om-top"><span class="om-no">ORDRE ' + agpDossier(l) + '</span><span class="om-tag ' + ty.cls + '">' + ty.label + '</span></div><div class="lc-name"></div>' +
      '<div class="om-row"><span>OBJECTIF</span><em>' + levelGoalText(l) + '</em></div>' +
      '<div class="om-row om-risk"><span>RISQUE</span><em>' + pips + ' ' + AGP_LORE.risk(l.threat) + '</em></div>' +
      '<div class="om-row"><span>PRIME</span><em>' + uiIco('frag') + ' <b>+' + composantsPrime(l.reward, false) + '</b>' + (rec ? ' · record <b>' + rec.best + '</b>' : ' · 1re fois <b>+' + (composantsPrime(l.reward, true) - composantsPrime(l.reward, false)) + '</b>') + '</em></div>' +
      this.finitionLine(l, p) +
      '<details class="om-details"><summary>DETAILS · N.O.R.M.A.</summary><div class="om-brief"><span>N.O.R.M.A</span>' + (unl ? agpBrief(l) : AGP_LINES.locked) + '</div></details>';
    $('levelCard').querySelector('.lc-name').textContent = (l.type === 'tuto' ? '' : 'ORDRE ' + String(l.num).padStart(2, '0') + ' — ') + (unl ? l.name : '? ? ?');
    const lb = $('btnLaunch'); lb.disabled = !unl; lb.textContent = unl ? (rec ? 'REFAIRE L\'INTERVENTION' : 'PRENDRE LE SERVICE') : 'ACCES REFUSE'; Motion.syncBreath(lb);
    const selectedIndex = w.levels.findIndex(x=>x.id===l.id);
    $('orbitIndex').textContent='ORDRE '+String(selectedIndex+1).padStart(2,'0')+' / '+n;
    $('orbitPrev').disabled=selectedIndex===0; $('orbitNext').disabled=selectedIndex===n-1;
    const tip=$('levelCard').querySelector('.completion-tip');
    if(tip) $('levelCard').querySelector('.om-details').appendChild(tip);
    this.focusOrbitalLevel();
    this.updateOrbitalUi();
    this.setHomeVanTier(l.threat);
  },

  // ligne « FINITION n% » de la fiche d'un niveau + le prochain objectif à faire (donne envie de rejouer)
  finitionLine(l, p){
    if (!completionDefs(l.id)) return '<div class="lc-line lc-comp">FINITION <b>—</b><span class="completion-na">Non définie pour cet ordre</span></div>';
    const comp = p.comp[l.id] || {}, pct = completionPct(l.id, comp), nx = completionNext(l.id, comp);
    return '<div class="lc-line lc-comp">FINITION <b>' + pct + ' %</b><i role="progressbar" aria-label="Finition du niveau" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><u style="width:' + pct + '%"></u></i></div>' +
      (nx ? '<div class="lc-line completion-tip">' + (pct > 0 ? 'Il manque ' + (100 - pct) + '% : ' : 'Objectif : ') + nx.tip + ' <b>+' + nx.missing + '%</b></div>' : '<div class="lc-line completion-tip">' + uiIco('star') + ' TOUS LES OBJECTIFS REMPLIS ' + uiIco('star') + '</div>');
  },

  // Conserve la livrée existante sur le sprite de navigation et de mission.
  renderHomeHangar(meta){
    this.applyHomeSkin(false);
    AtelierGarage.refresh();
    const m = meta || getMeta();
    document.getElementById('tabHangar').classList.toggle('buy', ATELIER_POSTS.some(p=> atelierCanBuy(m, p.id).ok));      // point doré : un poste est achetable
  },

  // arbre : le panneau (méthodes de GameScene) se redessine quand on arrive sur la page ; le point doré de l'onglet signale un achat possible
  renderHomeTree(meta){
    const buy = TREE_VIS.some(n=> !n.isHub && treeVisStatus(meta.tree, n) === 'avail' && meta.composants >= n.cost());
    document.getElementById('tabTree').classList.toggle('buy', buy);
  },

  // fragments, stats du hangar, point doré : après un achat dans l'arbre
  refreshHomeStats(){
    const meta = getMeta();
    Motion.count(document.getElementById('homeFrag'), meta.composants, v=> uiIco('frag') + ' ' + v);
    this.renderHomeHangar(meta); this.renderHomeTree(meta);
  },

  showHomeTree(){
    const gs = this.scene.get('game');
    gs.meta = getMeta(); gs.treeState = gs.meta.tree;               // relit la sauvegarde (fragments gagnés au dernier niveau)
    gs.renderTree();
  },

  launchLevel(){
    const l = levelById(this.homeSel);
    if (!l || !isLevelUnlocked(l.id) || this._launching) return;
    this._launching = true; sfx.resume(); sfx.uiStart(); Motion.punch(document.getElementById('btnLaunch'));
    const go = ()=>{
      const gs = this.scene.get('game');
      this.scene.setVisible(true, 'game'); gs.input.enabled = true;
      gs.meta = getMeta();
      gs.scene.restart(l.tuto ? { autoStart:true, tuto:true } : { autoStart:true, levelId:l.id });      // le tuto est un niveau comme les autres (w1-tuto) ; il ramène ensuite à l'accueil
    };
    if (Motion.ok()) Motion.cover(go, .45);                                                          // rideau GSAP (rouvert par Motion.uncover au démarrage du niveau)
    else { this.cameras.main.fadeOut(380, 5, 4, 12); this.cameras.main.once('camerafadeoutcomplete', go); }
  },
});
