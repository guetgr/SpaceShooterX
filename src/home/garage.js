"use strict";
// Garage : décor et assemblage des sprites ; les cinq emplacements de l'atelier (data/rd.js) et leurs améliorations s'achètent ici en composants ◆.
const AtelierGarage = (()=>{
  let initialized = false, root = null, section = 'laser';
  const path = 'assets/atelier/';
  // sprites montés sur la camionnette : le laser et l'aimant sont équipés dès le départ (placements validés dans le repère 768 × 820)
  const mounts = {
    aimant: { id:'anMagnet', file:'module-aimant-v2.png', name:'AIMANT', x:349, y:273, width:310 },
    canon: { id:'anCannon', file:'module-canon.png', name:'LASER', x:413, y:342, width:215 },
  };
  function describe(text){ document.getElementById('anDescription').textContent = text; }

  // une ligne d'amélioration d'un emplacement : niveau / plafond, bonus actuel → prochain achat, bouton d'achat (inactif avec sa raison)
  function upgradeRow(u, meta, world){
    const v = rdView(meta, u, world), locked = v.state === 'locked';
    const row = document.createElement('div'); row.className = 'an-post-row st-' + v.state; row.dataset.up = u.id;
    row.innerHTML = '<div class="apr-head"><b>' + u.name + '</b><span class="apr-mk">' + (locked ? 'SECTEUR ' + v.from : 'NIV ' + v.level + ' / ' + v.cap) + '</span></div>' +
      '<div class="apr-desc">' + u.desc + '</div>' +
      (locked ? '' : '<div class="apr-fx"><span>ACTUEL <b>' + v.total + '</b></span>' + (v.next ? '<span>PROCHAIN <b>' + v.next + '</b></span>' : '') + '</div>') + '<button class="apr-buy"></button>';
    const b = row.querySelector('.apr-buy'), ic = uiIco('frag'); b.disabled = v.state !== 'buy';
    if (v.state === 'buy') b.innerHTML = 'ACHETER NIVEAU ' + (v.level + 1) + ' ' + ic + ' ' + v.price;
    else if (v.state === 'poor') b.innerHTML = 'IL MANQUE ' + (v.price - meta.composants) + ' ' + ic;
    else if (v.state === 'cap') b.innerHTML = 'PLAFOND ATTEINT<small>' + (v.nextWorld ? 'secteur ' + v.nextWorld + ' : +' + RD_PER_WORLD + ' niveaux' : 'plafond de la campagne') + '</small>';
    else if (v.state === 'needs') b.innerHTML = 'REQUIERT ' + v.need.name + '<small>niveau 1 minimum</small>';
    else if (v.state === 'max') b.textContent = 'NIVEAU MAXIMAL';
    else b.textContent = 'SECTEUR ' + v.from + ' REQUIS';
    b.onclick = ()=> buy(u.id);
    return row;
  }

  // un emplacement de l'atelier : état (équipé / disponible au secteur n / réservé) puis ses améliorations
  function slotBlock(slot, i, meta, world){
    const sec = document.createElement('section'); sec.className = 'an-slot';
    const reserved = slot.from === null, locked = !reserved && world < slot.from;
    sec.classList.add(reserved ? 'st-reserved' : locked ? 'st-locked' : 'st-on');
    const state = reserved ? 'INDISPONIBLE' : locked ? 'SECTEUR ' + slot.from + ' REQUIS' : (slot.id === 'ordinateur' ? 'DISPONIBLE' : 'EQUIPE');
    sec.innerHTML = '<div class="as-head"><span class="as-no">EMPLACEMENT ' + (i + 1) + '</span><b>' + slot.name + '</b><em>' + state + '</em></div><p>' + slot.text + '</p>';
    rdOfGroup(slot.id).forEach(u=> sec.appendChild(upgradeRow(u, meta, world)));
    return sec;
  }

  // l'avis de migration reste affiché jusqu'à la première interaction du joueur avec le garage (onglet ou achat)
  function consumeNotice(){ const m = getMeta(); if (m.notice){ m.notice = null; setMeta(m); } }

  function buy(id){
    const meta = getMeta();
    if (!rdBuy(meta, id)) return;
    meta.notice = null; setMeta(meta);
    sfx.uiSelect(); describe(AGP_LORE.atelier.buy);
    refresh();
    const home = window.__ssxScene && window.__ssxScene.scene.get('home');
    if (home) home.refreshHomeStats();
  }

  // améliorations à jour (le laser et l'aimant sont montés sur la camionnette dès le départ)
  function refresh(){
    if (!initialized) return;
    render(section, true);
  }

  // un onglet par emplacement : seul l'emplacement choisi est affiché
  function render(next, keepText){
    section = next;
    root.querySelectorAll('[data-section]').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.section === section)));
    const cards = document.getElementById('anCards'); cards.replaceChildren();
    const meta = getMeta(), world = rdWorldReached(), i = Math.max(0, ATELIER_SLOTS.findIndex(sl=> sl.id === section));
    const list = document.createElement('div'); list.id = 'anPosts'; list.className = 'an-posts';
    list.appendChild(slotBlock(ATELIER_SLOTS[i], i, meta, world));
    cards.className = ''; cards.appendChild(list);
    if (!keepText){
      describe(meta.notice === 'restructuration' ? AGP_LORE.atelier.migration : 'Les niveaux montent de ' + RD_PER_WORLD + ' par secteur atteint. Les composants viennent des machines détruites.');
    }
  }

  function setup(){
    if (initialized) return; initialized = true;
    const page = document.getElementById('pageHangar');
    root = document.createElement('div'); root.id = 'atelierNext';
    root.innerHTML = `<div class="an-scene"><img class="an-bg" src="${path}atelier-calibre-detaille.png" alt="Garage AGP"><span class="an-post">POSTE 07 · MAINTENANCE</span><div class="an-depth"><div class="an-ship"><img class="an-van" src="${path}vehicule-nu.png" alt="Camionnette AGP-77">` +
      Object.values(mounts).map(m=> `<img id="${m.id}" class="an-mod" src="${path}${m.file}" alt="${m.name}" style="left:${m.x/768*100}%;top:${m.y/820*100}%;width:${m.width/768*100}%">`).join('') +
      `</div></div></div><div class="an-panel"><h2>CAMIONNETTE AGP-77</h2><p>Atelier de la camionnette</p><div class="an-tabs">${ATELIER_SLOTS.map((sl, i)=> `<button data-section="${sl.id}">${['LASER', 'AIMANT', 'ORDI', '4', '5'][i]}</button>`).join('')}</div><div id="anCards"></div><p id="anDescription" aria-live="polite"></p><small>Les équipements sont permanents et toujours actifs · le réglage du canon, de la carcasse, du bouclier et des propulseurs se fait en R&D.</small><button id="anMotion" aria-pressed="true">MOUVEMENTS : OUI</button></div>`;
    page.appendChild(root);
    let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll('[data-section]').forEach(b=> b.onclick = ()=>{ sfx.uiSelect(); render(b.dataset.section); consumeNotice(); });
    const scene = root.querySelector('.an-scene');
    scene.onpointermove = e=>{ if (!motion || e.pointerType === 'touch') return; const r = scene.getBoundingClientRect(); scene.style.setProperty('--mx', (e.clientX - r.left)/r.width*2 - 1); scene.style.setProperty('--my', (e.clientY - r.top)/r.height*2 - 1); };
    scene.onpointerleave = ()=>{ scene.style.setProperty('--mx', 0); scene.style.setProperty('--my', 0); };
    function setMotion(){ root.classList.toggle('an-still', !motion); const b = document.getElementById('anMotion'); b.setAttribute('aria-pressed', String(motion)); b.textContent = 'MOUVEMENTS : ' + (motion ? 'OUI' : 'NON'); scene.onpointerleave(); }
    document.getElementById('anMotion').onclick = ()=>{ motion = !motion; setMotion(); };
    render('laser'); setMotion();
  }
  return { setup, refresh };
})();
