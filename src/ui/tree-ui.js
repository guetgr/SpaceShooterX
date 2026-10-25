"use strict";
// Méthodes de GameScene — arbre de compétences : affichage, sélection, investissement.
mixin(GameScene, {
  // anneaux rouges concentriques autour du coeur: un par niveau d'alerte. Les niveaux atteints se remplissent
  // (les disques se superposent: plus on a de compétences, plus le fond est rouge) et le prochain se remplit
  // au fur et à mesure qu'on s'en approche.
  renderAlertRings(svgNS, total, cur){
    const g = document.getElementById('treeRings');
    g.innerHTML = '';
    const R = L => 100 + (L-2)*(500/(ALERT_MAX-2));
    const mk = (tag, attrs)=>{ const el = document.createElementNS(svgNS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };

    // dégradé radial: l'aura rouge est dense au centre et s'éteint vers le bord du niveau atteint
    const defs = mk('defs', {});
    const grad = mk('radialGradient', { id:'threatAura' });
    [['0%',0.30],['65%',0.15],['100%',0.04]].forEach(st=> grad.appendChild(mk('stop', { offset:st[0], 'stop-color':'#ff2846', 'stop-opacity':st[1] })));
    defs.appendChild(grad); g.appendChild(defs);
    g.appendChild(mk('circle', { cx:0, cy:0, r:(cur >= 2 ? R(cur) : 70) + 6, fill:'url(#threatAura)' }));

    // l'angle où poser les pastilles = celui où elles gênent le moins les compétences (calculé une fois)
    if (this._ringAngle === undefined){
      let best = 0, bestScore = -1;
      for (let deg=0; deg<360; deg+=5){
        const th = deg*Math.PI/180; let score = 1e9;
        for (let L=2; L<=ALERT_MAX; L++){
          const bx = Math.cos(th)*R(L), by = Math.sin(th)*R(L);
          TREE_VIS.forEach(n=>{ const d = Math.hypot(n.x-bx, n.y-by); if (d < score) score = d; });
        }
        if (score > bestScore){ bestScore = score; best = th; }
      }
      this._ringAngle = best;
    }
    const ang = this._ringAngle;

    for (let L = 2; L <= ALERT_MAX; L++){
      // les niveaux d'alerte pas encore atteints restent cachés (seul le suivant apparaît, avec un "?"): on découvre la menace en la montant
      if (!DEV_SEE_ALL && L > cur + 1) continue;
      const thr = ALERT_THRESHOLDS[L-2], r = R(L);
      const reached = cur >= L, isCur = cur === L, isNext = L === cur + 1;
      let prog = 0;
      if (isNext){ const prev = cur >= 2 ? ALERT_THRESHOLDS[cur-2] : 0; prog = Math.max(0, Math.min(1, (total-prev)/(thr-prev))); }
      if (isCur) g.appendChild(mk('circle', { cx:0, cy:0, r:r, fill:'none', stroke:'rgba(255,90,110,0.20)', 'stroke-width':12 }));   // halo du niveau actuel
      g.appendChild(mk('circle', { cx:0, cy:0, r:r, fill:'none',
        stroke: isCur ? 'rgba(255,150,160,0.95)' : reached ? 'rgba(255,80,100,0.38)' : isNext ? 'rgba(255,90,110,0.30)' : 'rgba(255,90,110,0.12)',
        'stroke-width': isCur ? 3.5 : 1.6,
        'stroke-dasharray': reached ? '' : '3 7' }));
      if (isNext && prog > 0){
        // arc de progression vers le prochain niveau, qui part du haut et tourne dans le sens horaire
        const circ = 2*Math.PI*r;
        const arc = mk('circle', { cx:0, cy:0, r:r, fill:'none', stroke:'rgba(255,170,120,0.9)', 'stroke-width':3,
          'stroke-dasharray': (circ*prog).toFixed(1) + ' ' + circ.toFixed(1), transform:'rotate(-90)', 'stroke-linecap':'round' });
        g.appendChild(arc);
      }
      // pastille numérotée
      const bx = Math.cos(ang)*r, by = Math.sin(ang)*r;
      g.appendChild(mk('circle', { cx:bx, cy:by, r:isCur ? 15 : 11, fill: reached ? (isCur ? '#ffcf70' : '#a8283d') : '#12101c',
        stroke: isCur ? '#fff2c0' : (reached ? '#ff6b81' : 'rgba(255,90,110,0.35)'), 'stroke-width': isCur ? 2.5 : 1.6 }));
      const t = mk('text', { x:bx, y:by + (isCur ? 5 : 4), 'text-anchor':'middle', 'font-size': isCur ? 14 : 11,
        'font-family':"'Press Start 2P','PSP2E', monospace", fill: isCur ? '#3a0d16' : (reached ? '#ffe9ec' : '#7a4a55') });
      t.textContent = (!DEV_SEE_ALL && L === cur + 1) ? '?' : L;
      g.appendChild(t);
    }
    // cadre rouge qui monte avec le nombre total de points investis (plus discret qu'avant)
    const stage = document.getElementById('treeStage');
    if (stage){
      const a = Math.min(0.40, 0.03 + 0.5 * (total / TREE_TOTAL));
      stage.style.boxShadow = 'inset 0 0 ' + Math.round(30 + 70*Math.min(1,total/TREE_TOTAL)) + 'px rgba(255,40,70,' + a.toFixed(2) + ')';
    }
  },

  renderTree(){
    document.getElementById('fragSkills').textContent = '◆ ' + this.meta.fragments;
    const curAlert = computeAlertLevel(this.treeState);
    const totalPts = treeTotalPoints(this.treeState);
    const nextT = ALERT_THRESHOLDS[curAlert-1];
    const asc = this.meta.asc || 0;
    { const prev = curAlert >= 2 ? ALERT_THRESHOLDS[curAlert-2] : 0, pr = nextT ? Math.max(0, Math.min(1, (totalPts - prev)/(nextT - prev))) : 1;
      document.getElementById('alertRowSkills').innerHTML = '<div class="alert-bar"><div class="fill" style="width:' + (pr*100).toFixed(1) + '%"></div><div class="lbl">MENACE ' + (curAlert + asc) + (asc ? ' (ASC +' + asc + ')' : '') + (nextT ? '' : ' · MAX') + '</div></div>'; }
    const ab = document.getElementById('btnAscend');
    if (ab){
      const can = totalPts >= ASCEND_MIN;
      ab.disabled = !can;
      ab.textContent = can ? 'ASCENSION ' + (asc+1) : 'ASCENSION (' + ASCEND_MIN + ' pts)';
      ab.classList.toggle('ready', can);
    }
    const svgNS = 'http://www.w3.org/2000/svg';
    this.renderAlertRings(svgNS, totalPts, curAlert);
    const linksG = document.getElementById('treeLinks');
    const nodesG = document.getElementById('treeNodes');
    linksG.innerHTML = ''; nodesG.innerHTML = '';
    const state = this.treeState;
    const stt = treeVisRevealed(state); this._visStatus = stt;

    // liens: seulement entre des nœuds visibles
    TREE_VIS.forEach(node=>{
      const sN = stt[node.id]; if (!sN) return;
      // un nœud relié à plusieurs voies (embranchement) ne se dessine que vers les plus proches: pas de long trait en travers de l'arbre
      const parents = node.requires.map(pid => pid === 'hub' ? TREE_HUB : TREE_VIS_BY_ID[pid]).filter(q => q && (q.isHub || stt[q.id]));
      const dmin = Math.min(...parents.map(q => Math.hypot(q.x-node.x, q.y-node.y)));
      parents.filter(q => Math.hypot(q.x-node.x, q.y-node.y) <= dmin*1.3).forEach(parent=>{
        const active = sN === 'owned';
        const line = document.createElementNS(svgNS,'line');
        line.setAttribute('x1',parent.x); line.setAttribute('y1',parent.y);
        line.setAttribute('x2',node.x); line.setAttribute('y2',node.y);
        line.setAttribute('stroke', active ? node.color : (sN === 'hint' ? '#1a2036' : '#2b3550'));
        line.setAttribute('stroke-width', active ? 3 : 2);
        if (sN === 'hint') line.setAttribute('stroke-dasharray', '3 5');
        if (this.treeFocus && node.branch !== this.treeFocus) line.setAttribute('stroke-opacity', '0.12');
        linksG.appendChild(line);
      });
    });

    [TREE_HUB].concat(TREE_VIS).forEach(node=>{
      const s = node.isHub ? 'owned' : stt[node.id];
      if (!s) return;                                           // caché: pas encore découvert
      const owned = s === 'owned', hint = s === 'hint', avail = s === 'avail';
      const r = node.isHub ? 28 : (hint ? 6 : (node.isKey ? 21 : (node.isCap ? 24 : 15)));
      const color = node.color;

      const g = document.createElementNS(svgNS,'g');
      g.setAttribute('transform', `translate(${node.x},${node.y})`);
      g.setAttribute('class', 'tree-node' + ((owned || avail) ? '' : ' locked') + (owned && !node.isHub ? ' owned' : '') + (hint ? ' hint' : '') + (this.treeFocus && !node.isHub && node.branch !== this.treeFocus ? ' dim' : ''));

      if (hint){                                                // petit point: on devine qu'il y a quelque chose plus loin
        const dot = document.createElementNS(svgNS,'circle');
        dot.setAttribute('r', r); dot.setAttribute('fill', '#141a2c'); dot.setAttribute('stroke', '#303a58'); dot.setAttribute('stroke-width', 1.5);
        g.appendChild(dot); nodesG.appendChild(g); return;
      }

      // achetable maintenant: anneau jaune qui pulse + petit "+" au-dessus
      if (avail && this.meta.fragments >= node.cost()){
        const halo = document.createElementNS(svgNS,'circle');
        halo.setAttribute('r', r+4); halo.setAttribute('class','tree-aff-ring'); g.appendChild(halo);
        g.classList.add('aff');
      }
      const bg = document.createElementNS(svgNS,'circle');
      bg.setAttribute('r', r); bg.setAttribute('fill', '#0e1524'); bg.setAttribute('stroke', owned ? color : '#232c40'); bg.setAttribute('stroke-width', owned ? 3 : 2);
      g.appendChild(bg);
      if (owned && !node.isHub){
        const core = document.createElementNS(svgNS,'circle');
        core.setAttribute('r', r-6); core.setAttribute('fill', color); core.setAttribute('opacity','0.85');
        g.appendChild(core);
      }

      const isz = node.isHub ? 24 : ((node.isKey||node.isCap) ? 20 : 15);
      const icon = document.createElementNS(svgNS,'image');
      icon.setAttribute('href', pxEmoji(node.icon)); icon.setAttribute('x', -isz/2); icon.setAttribute('y', -isz/2 + 1);
      icon.setAttribute('width', isz); icon.setAttribute('height', isz); icon.setAttribute('pointer-events', 'none');
      icon.style.imageRendering = 'pixelated';
      g.appendChild(icon);

      if (!node.isHub){
        // le nom (et le prix) part vers l'EXTERIEUR en s'éloignant du cœur: les voisins ne se marchent plus dessus
        const dd = Math.hypot(node.x, node.y) || 1, ux = node.x/dd, uy = node.y/dd;
        const label = document.createElementNS(svgNS,'text');
        label.setAttribute('class','tree-node-label');
        label.setAttribute('x', ux*(r+8)); label.setAttribute('y', uy*(r+8) + (uy > 0.35 ? 10 : (uy < -0.35 ? -2 : 4)));
        label.style.textAnchor = ux > 0.3 ? 'start' : (ux < -0.3 ? 'end' : 'middle');
        label.textContent = node.name + (owned ? '' : '  ◆' + node.cost());
        g.appendChild(label);
      }

      if (g.classList.contains('aff')){
        const pl = document.createElementNS(svgNS,'text');
        pl.setAttribute('class','tree-aff-plus'); pl.setAttribute('y', -r-6); pl.textContent = '+'; g.appendChild(pl);
      }
      g.onclick = ()=> this.selectTreeNode(node);
      nodesG.appendChild(g);
    });

    if (this._treeApplyTransform) this._treeApplyTransform();
    document.querySelectorAll('#treeChips .tree-chip').forEach(c=> c.classList.toggle('on', (c.dataset.id || '') === (this.treeFocus || '')));
    this.selectTreeNode(this.selectedTreeNode || TREE_HUB);
  },

  // un bouton par branche: il zoome dessus et atténue les autres (le bouton TOUT revient à la vue d'ensemble)
  buildTreeChips(){
    const box = document.getElementById('treeChips');
    if (!box || box.childElementCount) return;
    const mk = (id, label, color)=>{
      const b = document.createElement('button');
      b.className = 'tree-chip'; b.dataset.id = id || ''; b.textContent = label; b.style.setProperty('--c', color);
      b.onclick = ()=>{ sfx.uiSelect(); this.focusTreeBranch(id || null); };
      box.appendChild(b);
    };
    mk('', 'TOUT', '#cfd6ff');
    TREE_BRANCHES.forEach(br=> mk(br.id, String(br.name).toUpperCase(), br.color));
  },

  // cadre la vue sur ce qui est visible (toute la partie découverte, ou seulement une branche)
  fitTreeView(branchId){
    const stt = this._visStatus || treeVisRevealed(this.treeState);
    const pts = [];
    TREE_VIS.forEach(v=>{ if (stt[v.id] && (!branchId || v.branch === branchId)) pts.push([v.x, v.y]); });
    if (!branchId || !pts.length) pts.push([0, 0]);
    const xs = pts.map(q=>q[0]), ys = pts.map(q=>q[1]);
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const cx = (minx+maxx)/2, cy = (miny+maxy)/2, dim = Math.max(maxx-minx, maxy-miny) + 200;
    const sc = Math.min(2.4, Math.max(0.55, 1000/dim));
    this.treeScale = sc; this.treeTx = -sc*cx; this.treeTy = -sc*cy;
    if (this._treeApplyTransform) this._treeApplyTransform();
  },

  focusTreeBranch(id){
    this.treeFocus = id;
    this.renderTree();
    this.fitTreeView(id || null);
  },

  selectTreeNode(node){
    this.selectedTreeNode = node;
    const state = this.treeState;
    document.getElementById('treeInfoIcon').innerHTML = pxImg(node.icon, 30);
    document.getElementById('treeInfoName').textContent = node.name;
    document.getElementById('treeInfoDesc').textContent = node.desc;
    const investBtn = document.getElementById('treeInvestBtn');
    if (node.isHub){
      document.getElementById('treeInfoMeta').textContent = '';
      investBtn.disabled = true; investBtn.textContent = '—'; investBtn.onclick = null;
      return;
    }
    const s = treeVisStatus(state, node);
    let meta, canBuy = false;
    if (s === 'owned') meta = 'Possédée.';
    else if (s === 'avail'){ meta = 'Coût : ◆ ' + node.cost(); canBuy = this.meta.fragments >= node.cost(); }
    else if (node.isKey && node.forkThreshold && node.requires.some(p => (state[(TREE_VIS_BY_ID[p]||{}).nid]||0) > 0))
      meta = 'Verrouillée · Investis ' + node.forkThreshold + ' pts dans les stats de cette branche (' + treeBranchStemSum(state, node.branch) + '/' + node.forkThreshold + ').';
    else if (node.k > 1) meta = "Verrouillée · Achète d'abord le niveau précédent.";
    else meta = "Verrouillée · Achète d'abord une compétence connectée.";
    document.getElementById('treeInfoMeta').textContent = meta;
    investBtn.disabled = !canBuy;
    investBtn.textContent = s === 'owned' ? '✓' : '+';
    investBtn.onclick = ()=> this.investTreeNode(node);
  },

  // enregistre un élément dans la collection (une seule écriture par nouvel élément)
  codexMark(kind, id){
    if (!this.codex) this.codex = getCodex();
    if (!this.codex[kind][id]){ this.codex[kind][id] = 1; setCodex(this.codex); }
  },

  investTreeNode(node){
    const state = this.treeState;
    if (treeVisStatus(state, node) !== 'avail') return;
    const cost = node.cost();
    if (this.meta.fragments < cost) return;
    sfx.skillBuy();
    this.meta.fragments -= cost;
    state[node.nid] = node.k;                       // acheter le niveau k = passer le rang de la compétence à k
    this.codexMark('skills', node.nid);
    setMeta(this.meta);
    this.selectedTreeNode = node;
    this.renderTree();
    // la vue suit l'avancée: on recentre sur la compétence qu'on vient d'acheter (les nouvelles apparaissent autour)
    this.treeTx = -this.treeScale*node.x; this.treeTy = -this.treeScale*node.y;
    if (this._treeApplyTransform) this._treeApplyTransform();
  },
});
