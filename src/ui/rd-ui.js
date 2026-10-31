"use strict";
// Méthodes de GameScene — page R&D (page de droite de l'accueil) : quatre intercalaires (CANON, CARCASSE, BOUCLIER, PROPULSEURS), une fiche par amélioration (data/rd.js).
// Chaque fiche : effet, niveau acheté / plafond actuel, bonus total, bénéfice du prochain achat, prix, bouton. Les lignes bloquées restent visibles.

mixin(GameScene, {
  // intercalaire affiché (CANON par défaut)
  rdTab(){ return RD_TABS.find(t=> t.id === this._rdTabId) || RD_TABS[0]; },

  // bouton d'une fiche : { html, can }
  rdButton(v){
    const ic = uiIco('frag');
    if (v.state === 'buy') return { html:'ACHETER · NIVEAU ' + (v.level + 1) + '<small>' + ic + ' ' + v.price + '</small>', can:true };
    if (v.state === 'poor') return { html:'IL MANQUE ' + (v.price - this.meta.composants) + ' ' + ic + '<small>' + v.price + ' pour le niveau ' + (v.level + 1) + '</small>', can:false };
    if (v.state === 'cap') return { html:'PLAFOND ATTEINT<small>' + (v.nextWorld ? 'secteur ' + v.nextWorld + ' : +' + RD_PER_WORLD + ' niveaux' : 'plafond de la campagne') + '</small>', can:false };
    if (v.state === 'needs') return { html:'REQUIERT ' + v.need.name + '<small>niveau 1 minimum</small>', can:false };
    if (v.state === 'max') return { html:'NIVEAU MAXIMAL', can:false };
    return { html:'SECTEUR ' + v.from + ' REQUIS', can:false };
  },

  rdCardHtml(meta, u, world){
    const v = rdView(meta, u, world), b = this.rdButton(v), locked = v.state === 'locked';
    const lv = locked ? '<span class="rdu-lv">SECTEUR ' + v.from + '</span>' : '<span class="rdu-lv">NIV ' + v.level + ' / ' + v.cap + '</span>';
    const fx = locked ? '' : '<div class="rdu-fx"><span>BONUS ACTUEL <b>' + v.total + '</b></span>' + (v.next ? '<span>PROCHAIN ACHAT <b>' + v.next + '</b></span>' : '') + '</div>';
    return '<article class="rdu st-' + v.state + (b.can ? ' aff' : '') + '" data-id="' + u.id + '"><div class="rdu-head"><b class="rdu-nm">' + u.name + '</b>' + lv + '</div>' +
      '<div class="rdu-desc">' + u.desc + '</div>' + fx +
      '<button class="rdu-buy"' + (b.can ? '' : ' disabled') + '>' + b.html + '</button></article>';
  },

  renderRd(){
    const meta = this.meta = getMeta(), tab = this.rdTab(), world = rdWorldReached();
    const page = document.getElementById('pageTree');
    page.style.setProperty('--c', '#ffd76a');
    const art = document.documentElement;
    if (!art.style.getPropertyValue('--rd-tab-red')){
      ['red','ochre','teal','blue','olive'].forEach(c=> art.style.setProperty('--rd-tab-' + c, 'url("' + asset('rd/tabs/runtime/tab-' + c + '.png') + '")'));
    }
    document.getElementById('treeTabs').innerHTML = RD_TABS.map(t=>{
      const buy = rdAnyBuyable(meta, rdOfGroup(t.id), world);
      return '<button class="ttab' + (t.id === tab.id ? ' on' : '') + '" data-id="' + t.id + '" aria-pressed="' + (t.id === tab.id) + '"><span class="tt-s">' + t.name + '</span>' + (buy ? '<i class="tt-dot"></i>' : '') + '</button>';
    }).join('');
    const list = rdOfGroup(tab.id), got = list.filter(u=> rdLevel(meta, u.id) > 0).length;
    document.getElementById('treeBName').textContent = tab.name + ' · SECTEUR ' + world + ' ATTEINT';
    document.getElementById('treeBSub').textContent = this._rdNote || 'Catalogue R&D';
    document.getElementById('treeBProg').textContent = got + ' / ' + list.length;
    document.getElementById('treeBBar').style.width = (list.length ? 100*got/list.length : 0) + '%';
    const scroll = document.getElementById('treeScroll'), y = scroll.scrollTop;
    scroll.innerHTML = list.map(u=> this.rdCardHtml(meta, u, world)).join('');
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
      const t = e.target.closest('.ttab'); if (!t || t.dataset.id === this.rdTab().id) return;
      sfx.uiSelect(); this._rdTabId = t.dataset.id; this._rdNote = null;
      document.getElementById('treeScroll').scrollTop = 0; this.renderRd();
      Motion.cards([...document.querySelectorAll('#treeScroll .rdu')]);
    };
    document.getElementById('treeScroll').onclick = e=>{
      const b = e.target.closest('.rdu-buy'); if (!b || b.disabled) return;
      this.rdBuyAction(b.closest('.rdu').dataset.id);
    };
  },

  // enregistre un élément dans la collection (une seule écriture par nouvel élément)
  codexMark(kind, id){
    if (!this.codex) this.codex = getCodex();
    if (!this.codex[kind][id]){ this.codex[kind][id] = 1; setCodex(this.codex); }
  },

  rdBuyAction(id){
    const m = getMeta();
    if (!rdBuy(m, id)) return;
    sfx.skillBuy();
    setMeta(m); this.meta = m;
    this._rdNote = AGP_LORE.rd.research;
    this.renderRd();
    Motion.pop(document.querySelector('#treeScroll .rdu[data-id="' + id + '"]'));
    { const h = this.scene.get('home'); if (h && h.homeOn) h.refreshHomeStats(); }          // composants et point doré de l'onglet
  },
});
