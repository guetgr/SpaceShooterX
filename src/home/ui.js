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
  if (l.type === 'boss') return 'Vaincre le boss : <b>' + ((BOSS_DEFS[l.boss] || {}).name || l.boss) + '</b>';
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
    this.hangarSeg = 'stats';
    $('segStats').onclick = ()=>{ this.hangarSeg = 'stats'; sfx.uiSelect(); this.renderHomeHangar(getMeta()); };
    $('segMods').onclick = ()=>{ this.hangarSeg = 'mods'; sfx.uiSelect(); this.renderHomeHangar(getMeta()); };
    $('homeSettings').onclick = ()=>{ $('btnOptionsMain').click(); };
    if (DEV_SEE_ALL){
      $('btnDevHome').classList.remove('hidden');
      $('btnDevHome').onclick = ()=> $('start').classList.remove('hidden');           // ancien menu : partie infinie, bac à sable, choix d'un niveau
      $('btnDevClose').onclick = ()=> $('start').classList.add('hidden');
    }
    // glisser le doigt (ou la souris) d'une page à l'autre : écouté sur le conteneur, donc même au-dessus des boutons
    const box = $('game-container'); let sx = 0, sy = 0, st = 0, down = false;
    box.addEventListener('pointerdown', e=>{
      down = true; sx = e.clientX; sy = e.clientY; st = performance.now();
      // sur l'arbre, un glissement sert à déplacer la vue : on ne change de page que depuis le bord gauche de l'écran
      if (e.target.closest && e.target.closest('#treeStage') && e.clientX - box.getBoundingClientRect().left > 32) down = false;
    });
    box.addEventListener('pointerup', e=>{
      if (!down) return; down = false;
      if (!this.homeOn || document.querySelector('.overlay:not(.hidden)')) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)*1.5 && performance.now() - st < 700) this.goHomePage(this.page + (dx < 0 ? 1 : -1));
    });
    this.input.keyboard.on('keydown-LEFT', ()=>{ if (this.homeOn && !document.querySelector('.overlay:not(.hidden)')) this.goHomePage(this.page - 1); });
    this.input.keyboard.on('keydown-RIGHT', ()=>{ if (this.homeOn && !document.querySelector('.overlay:not(.hidden)')) this.goHomePage(this.page + 1); });
    this.input.keyboard.on('keydown-ENTER', ()=>{ if (this.homeOn && this.page === 0 && !document.querySelector('.overlay:not(.hidden)')) this.launchLevel(); });
  },

  enterHome(){
    this.homeOn = true; this._launching = false;
    document.body.classList.add('at-home');
    document.getElementById('home').classList.remove('hidden');
    this.cameras.main.resetFX(); this.cameras.main.fadeIn(350, 5, 4, 12);
    const p = getWorldProgress(), last = p.last && levelById(p.last);
    const nxt = last ? (nextLevelOf(p.last) || last) : firstOpenLevel(p);                  // on se place sur le niveau qui suit le dernier joué
    this.homeWorld = Math.max(0, WORLDS.findIndex(w=> w.id === (nxt || WORLDS[0].levels[0]).world));
    this.homeSel = (nxt && isLevelUnlocked(nxt.id, p)) ? nxt.id : (firstOpenLevel(p) || WORLDS[this.homeWorld].levels[0]).id;
    const front = firstOpenLevel(p);                                                       // monde où l'on en est : la camionnette y stationne sur la carte stellaire
    this.homeCurrent = Math.max(0, WORLDS.findIndex(w=> front ? w.id === front.world : w === WORLDS[WORLDS.length - 1]));
    this.resetMapView();
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
    document.getElementById('homeFrag').textContent = '◆ ' + meta.fragments;
    this.renderHomeMap();
    if (this.mapMode === 'galaxy') this.refreshGalaxy();
    this.renderHomeHangar(meta);
    this.renderHomeTree(meta);
  },

  goHomePage(p, instant){
    p = Math.max(-1, Math.min(1, p));
    if (p === this.page && !instant) return;
    this.page = p;
    if (!instant) sfx.uiOpen();
    const tr = document.getElementById('homeTrack');
    tr.className = p === 0 ? '' : 'p' + p;
    document.getElementById('tabHangar').classList.toggle('on', p === -1);
    document.getElementById('tabMap').classList.toggle('on', p === 0);
    document.getElementById('tabTree').classList.toggle('on', p === 1);
    this.tweens.add({ targets:this, pageX:p, duration: instant ? 1 : 450, ease:'Cubic.easeInOut' });
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
    $('mwNum').textContent = 'MONDE ' + w.order;
    $('mwName').textContent = open ? w.name : '? ? ?';
    const sm = worldSummary(w.id, p);
    $('mwProg').textContent = open ? (sm.done + ' / ' + sm.total + (sm.bossDown ? ' ★' : '')) : 'VERROUILLE';
    const orb = $('mapOrbit'); orb.innerHTML = '';
    const n = w.levels.length, O = HOME_ORBIT;
    w.levels.forEach((l, k)=>{
      const done = isLevelDone(l.id, p), unl = isLevelUnlocked(l.id, p), th = Math.PI*(160 - k*(140/Math.max(1, n - 1)))/180;
      const slot = document.createElement('div'); slot.className = 'node-slot';
      slot.style.left = ((O.cx + O.rx*Math.cos(th))/GAME_W*100) + '%'; slot.style.top = ((O.cy + O.ry*Math.sin(th))/GAME_H*100) + '%';
      const b = document.createElement('button');
      b.className = 'node ' + (done ? 'done' : (unl ? 'open' : 'locked')) + (l.type === 'boss' ? ' boss' : '') + (l.id === this.homeSel ? ' sel' : '');
      b.innerHTML = '<span>' + (!unl ? '🔒' : (done ? '✔' : (l.type === 'boss' ? '☠' : (l.type === 'tuto' ? '?' : l.num)))) + '</span>';
      b.setAttribute('aria-label', 'Niveau ' + l.num + ' ' + l.name);
      b.style.pointerEvents = 'auto';
      b.onclick = ()=> this.selectHomeLevel(l.id);
      // un niveau tout juste débloqué apparaît avec un petit éclat (une seule fois)
      if (unl && !done && !(w.order === 1 && l.index === 0) && !DEV_SEE_ALL && !wasWorldSeen('l:' + l.id)){ b.classList.add('pop'); markWorldSeen('l:' + l.id); setTimeout(()=> b.classList.remove('pop'), 900); }
      slot.appendChild(b); orb.appendChild(slot);
    });
    const l = levelById(this.homeSel) && levelById(this.homeSel).world === w.id ? levelById(this.homeSel) : w.levels[0];
    if (l.id !== this.homeSel) this.homeSel = l.id;
    const unl = isLevelUnlocked(l.id, p), rec = p.levels[l.id];
    $('levelCard').innerHTML = '<div class="lc-name"></div><div class="lc-line">' + levelGoalText(l) + '</div><div class="lc-line">MENACE <b>' + l.threat + '</b> · ◆ <b>+' + l.reward.clear + '</b>' + (rec ? ' · Record <b>' + rec.best + '</b>' : ' (1re : <b>+' + (l.reward.first || 0) + '</b>)') + '</div>' +
      (!rec && !unl ? '<div class="lc-line lock">Termine le niveau précédent.</div>' : '');
    $('levelCard').querySelector('.lc-name').textContent = (l.type === 'tuto' ? '' : 'NIV.' + l.num + ' — ') + (unl ? l.name : '? ? ?');
    const lb = $('btnLaunch'); lb.disabled = !unl; lb.textContent = unl ? (rec ? 'REJOUER' : 'DECOLLER') : 'VERROUILLE';
    this.setHomeVanTier(l.threat);
  },

  // hangar : palier, apparence (teintes) et contenu du bas — STATS du vaisseau ou MODULES installés (compétences de l'arbre possédées)
  renderHomeHangar(meta){
    const l = levelById(this.homeSel), t = Math.min(4, Math.max(1, (l && l.threat) || 1)), cur = getShipSkin();
    document.getElementById('hangarTier').textContent = 'CAMIONNETTE · PALIER ' + ['I', 'I', 'II', 'III', 'IV'][t];
    const row = document.getElementById('skinRow'); row.innerHTML = '';
    SHIP_SKINS.forEach(sk=>{
      const b = document.createElement('button'); b.className = 'skin' + (sk.id === cur ? ' sel' : '');
      b.innerHTML = '<i style="--sw:' + sk.swatch + '"></i><span>' + sk.name + '</span>';
      b.onclick = ()=>{ if (getShipSkin() === sk.id) return; sfx.uiSelect(); setShipSkin(sk.id); this.applyHomeSkin(true); this.renderHomeHangar(getMeta()); };
      row.appendChild(b);
    });
    this.applyHomeSkin(false);
    const mods = this.hangarSeg === 'mods';
    document.getElementById('segStats').classList.toggle('on', !mods); document.getElementById('segMods').classList.toggle('on', mods);
    const body = document.getElementById('hangarBody');
    if (!mods){
      const s = computeStartingStatsPreview();
      body.innerHTML = HOME_STAT_LINES.map(r=> '<div class="stat-row"><span>' + r[0] + '</span><b>' + r[1](s) + '</b></div>').join('');
      return;
    }
    const owned = ALL_TREE_NODES.filter(n=> (meta.tree[n.id] || 0) > 0 && !n.isHub);
    if (!owned.length){ body.innerHTML = '<div class="mod-empty">Aucun module installé.<br>Achète des compétences dans l\'arbre.</div>'; return; }
    body.innerHTML = '<div class="mod-grid"></div><div class="mod-detail" id="modDetail">Touche un module pour voir ce qu\'il fait.</div>';
    const grid = body.querySelector('.mod-grid');
    owned.forEach(n=>{
      const b = document.createElement('button'), lvl = meta.tree[n.id];
      b.className = 'mod'; b.innerHTML = pxImg(n.icon, 22) + (lvl > 1 ? '<b>' + lvl + '</b>' : '');
      b.setAttribute('aria-label', n.name);
      b.onclick = ()=>{
        sfx.uiSelect(); grid.querySelectorAll('.mod').forEach(x=> x.classList.remove('sel')); b.classList.add('sel');
        const d = document.getElementById('modDetail'); d.innerHTML = '<em></em><span></span>';
        d.querySelector('em').textContent = n.name + (lvl > 1 ? '  (rang ' + lvl + ')' : ''); d.querySelector('span').textContent = n.desc;
      };
      grid.appendChild(b);
    });
  },

  // arbre : le panneau (méthodes de GameScene) se redessine quand on arrive sur la page ; le point doré de l'onglet signale un achat possible
  renderHomeTree(meta){
    const buy = TREE_VIS.some(n=> !n.isHub && treeVisStatus(meta.tree, n) === 'avail' && meta.fragments >= n.cost());
    document.getElementById('tabTree').classList.toggle('buy', buy);
  },

  // fragments, stats du hangar, point doré : après un achat dans l'arbre
  refreshHomeStats(){
    const meta = getMeta();
    document.getElementById('homeFrag').textContent = '◆ ' + meta.fragments;
    this.renderHomeHangar(meta); this.renderHomeTree(meta);
  },

  showHomeTree(){
    const gs = this.scene.get('game');
    gs.meta = getMeta(); gs.treeState = gs.meta.tree;               // relit la sauvegarde (fragments gagnés au dernier niveau)
    gs.renderTree(); gs.fitTreeView(gs.treeFocus || undefined);
  },

  launchLevel(){
    const l = levelById(this.homeSel);
    if (!l || !isLevelUnlocked(l.id) || this._launching) return;
    this._launching = true; sfx.resume(); sfx.uiStart();
    this.cameras.main.fadeOut(380, 5, 4, 12);
    this.cameras.main.once('camerafadeoutcomplete', ()=>{
      const gs = this.scene.get('game');
      this.scene.setVisible(true, 'game'); gs.input.enabled = true;
      gs.meta = getMeta();
      gs.scene.restart(l.tuto ? { autoStart:true, tuto:true } : { autoStart:true, levelId:l.id });      // le tuto est un niveau comme les autres (w1-tuto) ; il ramène ensuite à l'accueil
    });
  },
});
