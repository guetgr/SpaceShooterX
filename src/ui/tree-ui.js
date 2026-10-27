"use strict";
// Méthodes de GameScene — arbre de compétences : une page par branche, une carte par compétence (les rangs sont des pastilles),
// fiche en bas pour le détail et l'achat. Les données (rangs sauvegardés, coûts, déblocages) viennent de data/skill-tree.js.
const TREE_BRANCH_ICONS = { arme:'🔫', missile:'🚀', defense:'🛡️', util:'⚡', savoir:'📖', tempete:'🌩️', gravite:'🌌', furie:'🔥' };

// disposition par branche, calculée une fois : tiers de la tige (rangées de cartes) + voies d'embranchement (colonnes keystone → … → cap)
let _treeLayout = null;
function treeLayout(){
  if (_treeLayout) return _treeLayout;
  _treeLayout = TREE_BRANCHES.map(br=>{
    const nodes = ALL_TREE_NODES.filter(n=> n.branch === br.id && !n.isHub);
    const tiers = br.stem.map(pair=> pair.map(d=> TREE_NODE_BY_ID[d.id]));
    const lanes = nodes.filter(n=> n.isKey).map(key=>{
      const lane = [key], after = last=> nodes.find(n=> n.requires.includes(last.id) && !lane.includes(n));
      for (let nx = after(key); nx; nx = after(nx)) lane.push(nx);
      return lane;
    });
    return { br, tiers, lanes, total: nodes.reduce((a, n)=> a + n.max, 0) };
  });
  return _treeLayout;
}

mixin(GameScene, {
  // état d'une carte : rang, prochain nœud à acheter, achetable maintenant ?
  treeCardInfo(n){
    const r = this.treeState[n.id] || 0;
    if (r >= n.max) return { r, st:'max' };
    const v = TREE_VIS_BY_ID[visId(n.id, r + 1)], avail = treeVisStatus(this.treeState, v) === 'avail';
    return { r, v, avail, can: avail && this.meta.composants >= v.cost(), st: r > 0 ? 'owned' : (avail ? 'avail' : 'locked') };
  },

  treeBranchPoints(L){ return L.tiers.flat().concat(L.lanes.flat()).reduce((a, n)=> a + (this.treeState[n.id] || 0), 0); },

  treeCardHtml(n, br, compact){
    const i = this.treeCardInfo(n), cls = ['tcard', i.st, i.can ? 'aff' : '', (i.avail && !i.can) ? 'cant' : '', n.isKey ? 'key' : '', n.isCap ? 'cap' : '', compact ? 'compact' : '',
      this.selectedTreeNode === n ? 'sel' : '', this._treeFlash === n.id ? 'flash' : ''].join(' ');
    let pips = ''; for (let k = 0; k < n.max; k++) pips += '<i class="' + (k < i.r ? 'f' : '') + '"></i>';
    const cost = i.st === 'max' ? 'MAX' : uiIco('frag') + ' ' + i.v.cost();
    return '<button class="' + cls + '" style="--c:' + br.color + '" data-id="' + n.id + '"><span class="tc-ic">' + pxImg(n.icon, compact ? 22 : 26) + '</span>' +
      '<span class="tc-nm">' + n.name + '</span>' + (n.max > 1 ? '<span class="tc-pips">' + pips + '</span>' : '') +
      '<span class="tc-cost">' + cost + (i.can ? '<b>+</b>' : '') + '</span></button>';
  },

  renderTree(){
    const all = treeLayout();
    if (!this.treeBranch || !all.some(L=> L.br.id === this.treeBranch)) this.treeBranch = all[0].br.id;
    const L = all.find(x=> x.br.id === this.treeBranch), br = L.br, scroll = document.getElementById('treeScroll'), y = scroll.scrollTop;
    document.getElementById('pageTree').style.setProperty('--c', br.color);

    document.getElementById('treeTabs').innerHTML = all.map(x=>{
      const buy = x.tiers.flat().concat(x.lanes.flat()).some(n=> this.treeCardInfo(n).can);
      return '<button class="ttab' + (x === L ? ' on' : '') + '" style="--c:' + x.br.color + '" data-id="' + x.br.id + '">' + pxImg(TREE_BRANCH_ICONS[x.br.id], 20) +
        '<span class="tt-p">' + this.treeBranchPoints(x) + '/' + x.total + '</span>' + (buy ? '<i class="tt-dot"></i>' : '') + '</button>';
    }).join('');
    const got = this.treeBranchPoints(L);
    { const dp = AGP_LORE.depts[br.id] || { name:String(br.name).toUpperCase(), sub:'' }; document.getElementById('treeBName').textContent = 'DPT ' + dp.name; document.getElementById('treeBSub').textContent = dp.sub; }
    document.getElementById('treeBProg').textContent = got + ' / ' + L.total;
    document.getElementById('treeBBar').style.width = (100*got/L.total) + '%';

    let h = '';
    L.tiers.forEach((tier, t)=>{
      const open = tier.some(n=> this.treeCardInfo(n).st !== 'locked');
      h += '<div class="ttier' + (open ? '' : ' locked') + '">HABILITATION ' + (t + 1) + (open ? '' : '<span>' + uiIco('lock') + ' habilitation précédente requise</span>') + '</div>' +
        '<div class="tgrid n' + tier.length + '">' + tier.map(n=> this.treeCardHtml(n, br, false)).join('') + '</div>';
    });
    if (L.lanes.length){
      const sum = treeBranchStemSum(this.treeState, br.id), need = br.forkThreshold || 0, ok = sum >= need;
      h += '<div class="ttier' + (ok ? '' : ' locked') + '">PROJETS HORS CATALOGUE' + (ok ? '' : '<span>' + uiIco('lock') + ' ' + sum + '/' + need + ' pts d\'habilitation</span>') + '</div>' +
        '<div class="tlanes n' + L.lanes.length + '">' + L.lanes.map(lane=> '<div class="tlane">' + lane.map(n=> this.treeCardHtml(n, br, true)).join('') + '</div>').join('') + '</div>';
    }
    scroll.innerHTML = h; scroll.scrollTop = y;
    this._treeFlash = null;
    this.refreshTreeSheet();
  },

  // un bouton par branche (les onglets sont reconstruits à chaque rendu, on délègue les événements au conteneur)
  setupTreeUi(){
    document.getElementById('treeTabs').onclick = e=>{
      const t = e.target.closest('.ttab'); if (!t || t.dataset.id === this.treeBranch) return;
      sfx.uiSelect(); this.treeBranch = t.dataset.id; this.selectedTreeNode = null;
      document.getElementById('treeScroll').scrollTop = 0; this.renderTree();
      Motion.cards([...document.querySelectorAll('#treeScroll .tcard')]);
    };
    document.getElementById('treeScroll').onclick = e=>{
      const c = e.target.closest('.tcard'); if (!c) return;
      sfx.uiSelect(); this.selectTreeNode(TREE_NODE_BY_ID[c.dataset.id]);
    };
  },

  selectTreeNode(node){
    this.selectedTreeNode = node;
    document.querySelectorAll('#treeScroll .tcard').forEach(c=> c.classList.toggle('sel', c.dataset.id === node.id));
    this.refreshTreeSheet();
  },

  // fiche en bas : détail de la carte touchée + bouton d'achat
  refreshTreeSheet(){
    const node = this.selectedTreeNode, btn = document.getElementById('treeInvestBtn');
    if (!node){
      document.getElementById('treeInfoIcon').innerHTML = uiIco('hand', 24);
      document.getElementById('treeInfoName').textContent = 'DPT ' + ((AGP_LORE.depts[this.treeBranch] || {}).name || 'CATALOGUE');
      document.getElementById('treeInfoDesc').textContent = 'Touchez une fiche pour consulter le catalogue et passer commande.';
      document.getElementById('treeInfoMeta').textContent = '';
      btn.disabled = true; btn.textContent = '—'; btn.onclick = null;
      return;
    }
    const i = this.treeCardInfo(node), state = this.treeState;
    document.getElementById('treeInfoIcon').innerHTML = pxImg(node.icon, 30);
    document.getElementById('treeInfoName').textContent = node.name + (node.max > 1 ? ' · ' + i.r + '/' + node.max : '');
    document.getElementById('treeInfoDesc').textContent = node.desc.replace(/\s*\/\s*niveau/i, ' par rang');
    let meta;
    if (i.st === 'max') meta = node.max > 1 ? 'Rang maximum atteint. Budget épuisé.' : 'Installé.';
    else if (i.avail) meta = (node.max > 1 ? 'Rang ' + i.r + ' → ' + (i.r + 1) + ' · ' : '') + 'Coût : ' + uiIco('frag') + ' ' + i.v.cost() + (i.can ? '' : ' (il manque ' + uiIco('frag') + ' ' + (i.v.cost() - this.meta.composants) + ')');
    else if (node.isKey && node.forkThreshold && node.requires.some(p => (state[p] || 0) > 0))
      meta = 'Non habilité · ' + node.forkThreshold + ' pts d\'habilitation requis dans ce département (' + treeBranchStemSum(state, node.branch) + '/' + node.forkThreshold + ').';
    else if (node.isKey) meta = "Non habilité · terminez d'abord la dernière habilitation du département.";
    else meta = "Non habilité · commandez d'abord le module précédent.";
    document.getElementById('treeInfoMeta').innerHTML = meta;
    btn.disabled = !i.can;
    btn.innerHTML = i.st === 'max' ? uiIco('check') : '+';
    btn.onclick = ()=> this.investTreeNode(node);
  },

  // enregistre un élément dans la collection (une seule écriture par nouvel élément)
  codexMark(kind, id){
    if (!this.codex) this.codex = getCodex();
    if (!this.codex[kind][id]){ this.codex[kind][id] = 1; setCodex(this.codex); }
  },

  investTreeNode(node){
    const i = this.treeCardInfo(node);
    if (!i.can) return;
    sfx.skillBuy();
    this.meta.composants -= i.v.cost();
    this.treeState[node.id] = i.v.k;                // acheter le rang k = passer le rang de la compétence à k
    this.codexMark('skills', node.id);
    setMeta(this.meta);
    this._treeFlash = node.id;
    this.renderTree();
    Motion.pop(document.querySelector('#treeScroll .tcard[data-id="' + node.id + '"]'));
    { const h = this.scene.get('home'); if (h && h.homeOn) h.refreshHomeStats(); }          // fragments, stats du hangar et point doré de l'onglet
  },
});
