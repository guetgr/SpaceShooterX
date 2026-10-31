"use strict";
// Méthodes de GameScene — page R&D (page de droite de l'accueil) : un onglet par secteur, une fiche par technologie (data/techs.js),
// un bouton unique pour la prochaine étape (prototype -> rangs -> spécialisation). Remplace l'arbre de compétences.

mixin(GameScene, {
  // secteur affiché : celui de l'onglet choisi, sinon le premier secteur atteint
  rdWorld(){
    if (this._rdWorldId && worldById(this._rdWorldId)) return worldById(this._rdWorldId);
    return WORLDS.find(w=> isWorldUnlocked(w.id)) || WORLDS[0];
  },

  // libellé et état du bouton d'une fiche : { html, can, what }
  rdButton(meta, t){
    const what = rdNextStep(meta, t.id), ic = uiIco('frag');
    if (!what) return { html:'COMPLET', can:false, what:null };
    const e = rdEntry(meta, t.id), can = rdCanBuy(meta, t.id, what), cost = rdNextCost(t.id, what, e.rang);
    if (can.ok){
      const label = what === 'proto' ? 'PROTOTYPE' : what === 'rang' ? 'RANG ' + (e.rang + 1) + '/' + techMaxRang(t) + ' · ' + rdUpgradeAt(t, e.rang + 1).name : 'SPECIALISATION · ' + t.spe.name;
      const pieces = cost.pieces ? ' + ' + Object.keys(cost.pieces).map(k=> cost.pieces[k] + ' ' + k.toUpperCase()).join(' + ') : '';
      return { html: label + '<small>' + ic + ' ' + cost.composants + pieces + '</small>', can:true, what };
    }
    if (can.reason === 'plan'){ const l = levelById(t.plan); return { html:'PLAN A RECUPERER' + (l ? '<small>' + l.name + '</small>' : ''), can:false, what }; }
    if (can.reason === 'conception') return { html:'SPECIALISATION EN CONCEPTION', can:false, what };
    if (can.reason === 'pieces') return { html:'PIECES DE SECTEUR REQUISES<small>' + t.spe.name + '</small>', can:false, what };
    if (can.reason === 'composants') return { html:'IL MANQUE ' + (cost.composants - meta.composants) + ' ' + ic, can:false, what };
    return { html:'—', can:false, what };
  },

  rdCardHtml(meta, t){
    const e = rdEntry(meta, t.id), max = techMaxRang(t), b = this.rdButton(meta, t);
    let pips = ''; for (let k = 1; k <= max; k++) pips += '<i class="' + (k <= e.rang ? 'f' : '') + '"></i>';
    const state = !e.plan ? 'noplan' : !e.proto ? 'plan' : 'proto';
    const paper = !e.plan ? 'locked' : !e.proto ? 'blueprint' : 'paper';
    const next = e.rang < max ? rdUpgradeAt(t, e.rang + 1) : null;
    const level = t.plan && levelById(t.plan);
    const hand = !e.plan ? 'récupérer le plan' + (level ? ' dans « ' + level.name.toLowerCase() + ' »' : ' pendant une mission') :
      !e.proto ? 'plan classé — financer le prototype avant les essais' : next ? 'essai ' + String(e.rang + 1).padStart(2, '0') + ' — prochain gain : ' + next.name.toLowerCase() :
      e.spe ? 'dossier validé — prêt pour le chargement' : t.spe ? 'rangs validés — spécialisation : ' + t.spe.name.toLowerCase() : 'rangs validés — spécialisation encore en conception';
    return '<article class="rdcard ' + state + ' ' + paper + (b.can ? ' aff' : '') + '" data-tech="' + t.id + '"><div class="rd-head"><span class="rd-ic">' + pxImg(t.icon, 24) + '</span><b class="rd-nm">' + t.name + '</b>' + (t.tag ? '<span class="rd-tag">' + t.tag + '</span>' : '') + '</div>' +
      '<div class="rd-desc">' + t.desc + '</div>' +
      '<span class="rd-hand">' + hand + '</span>' +
      '<div class="rd-st"><span>PLAN <b>' + (e.plan ? 'OUI' : 'NON') + '</b></span><span>PROTO <b>' + (e.proto ? 'OUI' : 'NON') + '</b></span><span class="rd-pips">' + pips + '</span></div>' +
      '<button class="rd-buy"' + (b.can ? '' : ' disabled') + ' data-what="' + (b.what || '') + '">' + b.html + '</button>' + (e.spe ? '<span class="rd-stamp">VALIDE</span>' : '') + '</article>';
  },

  renderRd(){
    const meta = this.meta = getMeta(), world = this.rdWorld(), idx = WORLDS.indexOf(world) + 1;
    const page = document.getElementById('pageTree');
    page.style.setProperty('--c', '#ffd76a');
    const art = document.documentElement;
    if (!art.style.getPropertyValue('--rd-card-paper')){
      art.style.setProperty('--rd-card-paper', 'url("' + asset('rd/runtime/card-paper.png') + '")');
      art.style.setProperty('--rd-card-blueprint', 'url("' + asset('rd/runtime/card-blueprint.png') + '")');
      art.style.setProperty('--rd-card-locked', 'url("' + asset('rd/runtime/envelope-locked.png') + '")');
      ['red','ochre','teal','blue','olive'].forEach(c=> art.style.setProperty('--rd-tab-' + c, 'url("' + asset('rd/tabs/runtime/tab-' + c + '.png') + '")'));
    }
    document.getElementById('treeTabs').innerHTML = WORLDS.map((w, i)=>{
      const open = isWorldUnlocked(w.id), list = TECHS.filter(t=> t.sector === i + 1 && techAvailable(t));
      const buy = open && list.some(t=>{ const s = rdNextStep(meta, t.id); return s && rdCanBuy(meta, t.id, s).ok; });
      const got = list.filter(t=> rdEntry(meta, t.id).proto).length;
      return '<button class="ttab' + (w === world ? ' on' : '') + (open ? '' : ' locked') + '" data-id="' + w.id + '" aria-pressed="' + (w === world) + '"><span class="tt-s">S' + (i + 1) + '</span><span class="tt-p">' + (open ? got + '/' + list.length : uiIco('lock')) + '</span>' + (buy ? '<i class="tt-dot"></i>' : '') + '</button>';
    }).join('');
    document.getElementById('treeBName').textContent = 'SECTEUR ' + idx + ' · ' + world.name;
    document.getElementById('treeBSub').textContent = this._rdNote || 'Catalogue R&D';
    const list = TECHS.filter(t=> t.sector === idx && techAvailable(t)), got = list.filter(t=> rdEntry(meta, t.id).proto).length;
    document.getElementById('treeBProg').textContent = got + ' / ' + list.length;
    document.getElementById('treeBBar').style.width = (list.length ? 100*got/list.length : 0) + '%';
    const scroll = document.getElementById('treeScroll'), y = scroll.scrollTop;
    scroll.innerHTML = isWorldUnlocked(world.id) ? list.map(t=> this.rdCardHtml(meta, t)).join('') :
      '<div class="rd-locked">ACCES NON AUTORISE<small>Secteur non atteint : validez d\'abord l\'incident majeur du secteur précédent.</small></div>';
    scroll.scrollTop = y;
    this.rdMoreUpdate(); setTimeout(()=> this.rdMoreUpdate(), 500);      // la page peut encore être masquée / en glissement : on remesure après
  },

  // indices de défilement : petit chevron discret (haut / bas) tant qu'il reste des cartes hors de vue
  rdMoreUpdate(){
    const sc = document.getElementById('treeScroll'), up = document.getElementById('rdMoreUp'), dn = document.getElementById('rdMoreDown');
    if (!sc || !up || !dn) return;
    up.hidden = sc.scrollTop < 8;
    dn.hidden = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 8;
  },

  setupRdUi(){
    const sc = document.getElementById('treeScroll');
    ['Up', 'Down'].forEach(d=>{
      const m = document.createElement('div'); m.id = 'rdMore' + d; m.className = 'rd-more rd-more-' + d.toLowerCase(); m.hidden = true; m.setAttribute('aria-hidden', 'true');
      m.innerHTML = uiIco('arrow_r', 10);
      sc.after(m);
    });
    sc.addEventListener('scroll', ()=> this.rdMoreUpdate(), { passive:true });
    document.getElementById('treeTabs').onclick = e=>{
      const t = e.target.closest('.ttab'); if (!t || t.dataset.id === this.rdWorld().id) return;
      sfx.uiSelect(); this._rdWorldId = t.dataset.id; this._rdNote = null;
      document.getElementById('treeScroll').scrollTop = 0; this.renderRd();
      Motion.cards([...document.querySelectorAll('#treeScroll .rdcard')]);
    };
    document.getElementById('treeScroll').onclick = e=>{
      const b = e.target.closest('.rd-buy'); if (!b || b.disabled) return;
      this.rdBuyAction(b.closest('.rdcard').dataset.tech, b.dataset.what);
    };
  },

  // enregistre un élément dans la collection (une seule écriture par nouvel élément)
  codexMark(kind, id){
    if (!this.codex) this.codex = getCodex();
    if (!this.codex[kind][id]){ this.codex[kind][id] = 1; setCodex(this.codex); }
  },

  rdBuyAction(techId, what){
    const m = getMeta();
    if (!rdBuy(m, techId, what)) return;
    sfx.skillBuy();
    setMeta(m); this.meta = m;
    this.codexMark('skills', techId);
    this._rdNote = AGP_LORE.rd.research;
    this.renderRd();
    Motion.pop(document.querySelector('#treeScroll .rdcard[data-tech="' + techId + '"]'));
    { const h = this.scene.get('home'); if (h && h.homeOn) h.refreshHomeStats(); }          // composants et point doré de l'onglet
  },
});
