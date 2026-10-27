"use strict";
// Garage : décor et assemblage des sprites ; les six postes de l'atelier (data/atelier.js) s'achètent ici en composants ◆.
const AtelierGarage = (()=>{
  let initialized = false, root = null, section = 'modules';
  const path = 'assets/atelier/';
  // sprites montés sur la camionnette, visibles dès le Mk I du poste (placements validés dans le repère 768 × 820)
  const mounts = {
    aimant: { id:'anMagnet', file:'module-aimant-v2.png', name:'AIMANT', x:349, y:273, width:310 },
    canon: { id:'anCannon', file:'module-canon.png', name:'CANON', x:413, y:342, width:215 },
  };
  const PIECE_NAMES = { s1:'LENTILLE DE VISEE', s2:'BOBINE MAGNETIQUE', s3:'CELLULE INSTABLE', s4:'NOYAU GRAVITATIONNEL', s5:"BADGE D'ACCES" };
  const piecesText = cost=> Object.keys(cost.pieces).map(k=> cost.pieces[k] + ' ' + PIECE_NAMES[k]).join(' + ');

  function describe(text){ document.getElementById('anDescription').textContent = text; }

  // une ligne de poste : niveau, effet avant → après, bouton d'achat (inactif avec sa raison)
  function postRow(p, meta){
    const mk = atelierMk(meta.atelier, p.id), can = atelierCanBuy(meta, p.id), cost = atelierNextCost(p.id, mk);
    const now = atelierShows(p.id, mk), next = cost ? atelierShows(p.id, mk + 1) : null;
    let pips = ''; for (let k = 1; k <= ATELIER_MAX; k++) pips += '<i class="' + (k <= mk ? 'f' : '') + '"></i>';
    const row = document.createElement('div'); row.className = 'an-post-row'; row.dataset.post = p.id;
    row.innerHTML = '<div class="apr-head"><b>' + p.name + '</b><span class="apr-mk">' + (mk ? 'MK ' + ROMAN[mk] : 'DE SERIE') + '</span><span class="apr-pips">' + pips + '</span></div>' +
      '<div class="apr-fx">' + now.map((l, i)=> '<span>' + l.label + ' <b>' + l.value + (next ? ' → ' + next[i].value : '') + '</b></span>').join('') + '</div><button class="apr-buy"></button>';
    const b = row.querySelector('.apr-buy'); b.disabled = !can.ok;
    if (can.ok) b.innerHTML = 'ACHETER ' + uiIco('frag') + ' ' + cost.composants + (cost.pieces ? ' + ' + piecesText(cost) : '');
    else if (can.reason === 'composants') b.innerHTML = 'IL MANQUE ' + (cost.composants - meta.composants) + ' ' + uiIco('frag');
    else if (can.reason === 'pieces') b.innerHTML = 'PIECES DE SECTEUR REQUISES<small>' + piecesText(cost) + '</small>';
    else b.textContent = 'MAX';
    b.onclick = ()=> buy(p.id);
    return row;
  }

  // l'avis de migration reste affiché jusqu'à la première interaction du joueur avec le garage (onglet ou achat)
  function consumeNotice(){ const m = getMeta(); if (m.notice){ m.notice = null; setMeta(m); } }

  function buy(postId){
    const meta = getMeta();
    if (!atelierBuy(meta, postId)) return;
    meta.notice = null; setMeta(meta);
    sfx.uiSelect(); describe(AGP_LORE.atelier.buy);
    refresh();
    const home = window.__ssxScene && window.__ssxScene.scene.get('home');
    if (home) home.refreshHomeStats();
  }

  // postes à jour + aimant et canon montés selon le Mk acheté
  function refresh(){
    if (!initialized) return;
    const meta = getMeta();
    Object.keys(mounts).forEach(post=>{ document.getElementById(mounts[post].id).hidden = atelierMk(meta.atelier, post) < 1; });
    if (section === 'modules') render('modules', true);
  }

  function render(next, keepText){
    section = next;
    root.querySelectorAll('[data-section]').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.section === section)));
    const cards = document.getElementById('anCards'); cards.replaceChildren();
    if (section === 'modules'){
      const meta = getMeta(), list = document.createElement('div'); list.id = 'anPosts'; list.className = 'an-posts';
      ATELIER_POSTS.forEach(p=> list.appendChild(postRow(p, meta)));
      cards.className = ''; cards.appendChild(list);
      if (DEV_SEE_ALL){
        const dev = document.createElement('button'); dev.id = 'anDevPieces'; dev.className = 'apr-dev'; dev.textContent = '+5 PIECES S1 S2 S3 (DEV)';
        dev.onclick = ()=>{ const m = getMeta(); ['s1', 's2', 's3'].forEach(k=>{ m.pieces[k] += 5; }); setMeta(m); refresh(); };
        cards.appendChild(dev);
      }
      if (!keepText){
        describe(meta.notice === 'restructuration' ? AGP_LORE.atelier.migration : 'Cinq niveaux par poste. Les composants viennent des machines détruites.');
      }
    } else {
      cards.className = 'an-catalog'; const image = document.createElement('img');
      image.src = path + (section === 'paint' ? 'icone-kit-peinture.png' : 'icone-kit-carrosserie.png'); image.alt = section === 'paint' ? 'Kit de peinture' : 'Kit de carrosserie'; cards.appendChild(image);
      describe(section === 'paint' ? 'Livrées Origine, Braise et Vide · visuels montés à venir.' : 'Protections et pare-chocs · visuels montés à venir.');
    }
  }

  function setup(){
    if (initialized) return; initialized = true;
    const page = document.getElementById('pageHangar');
    root = document.createElement('div'); root.id = 'atelierNext';
    root.innerHTML = `<div class="an-scene"><img class="an-bg" src="${path}atelier-calibre-detaille.png" alt="Garage AGP"><span class="an-post">POSTE 07 · MAINTENANCE</span><div class="an-depth"><div class="an-ship"><img class="an-van" src="${path}vehicule-nu.png" alt="Camionnette AGP-77">` +
      Object.values(mounts).map(m=> `<img id="${m.id}" class="an-mod" src="${path}${m.file}" alt="${m.name}" hidden style="left:${m.x/768*100}%;top:${m.y/820*100}%;width:${m.width/768*100}%">`).join('') +
      `</div></div></div><div class="an-panel"><h2>CAMIONNETTE AGP-77</h2><p>Atelier de la camionnette</p><div class="an-tabs"><button data-section="paint">PEINTURE</button><button data-section="body">CARROSSERIE</button><button data-section="modules">POSTES</button></div><div id="anCards"></div><p id="anDescription" aria-live="polite"></p><small>Les postes sont permanents et toujours actifs · les technologies emportées se règlent en R&D.</small><button id="anMotion" aria-pressed="true">MOUVEMENTS : OUI</button></div>`;
    page.appendChild(root);
    let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll('[data-section]').forEach(b=> b.onclick = ()=>{ sfx.uiSelect(); render(b.dataset.section); consumeNotice(); });
    const scene = root.querySelector('.an-scene');
    scene.onpointermove = e=>{ if (!motion || e.pointerType === 'touch') return; const r = scene.getBoundingClientRect(); scene.style.setProperty('--mx', (e.clientX - r.left)/r.width*2 - 1); scene.style.setProperty('--my', (e.clientY - r.top)/r.height*2 - 1); };
    scene.onpointerleave = ()=>{ scene.style.setProperty('--mx', 0); scene.style.setProperty('--my', 0); };
    function setMotion(){ root.classList.toggle('an-still', !motion); const b = document.getElementById('anMotion'); b.setAttribute('aria-pressed', String(motion)); b.textContent = 'MOUVEMENTS : ' + (motion ? 'OUI' : 'NON'); scene.onpointerleave(); }
    document.getElementById('anMotion').onclick = ()=>{ motion = !motion; setMotion(); };
    render('modules'); refresh(); setMotion();
  }
  return { setup, refresh };
})();
