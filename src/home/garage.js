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

  // zones d'équipement posées sur la camionnette (repère 768 × 820 de la scène) : une par baie, 5 au plus. Emplacements provisoires, à ajuster ici.
  const BAY_ZONES = [
    { x:405, y:338, w:150, h:62 }, { x:290, y:352, w:100, h:56 }, { x:442, y:468, w:150, h:84 }, { x:598, y:500, w:78, h:108 }, { x:150, y:640, w:112, h:62 }
  ];
  let selectedBay = 0;

  // chargement ramené à un chargement valide + nombre de baies ouvertes
  function loadoutNow(meta){
    const slots = slotsOpen(), list = loadoutSanitize(meta, slots);
    if (JSON.stringify(list) !== JSON.stringify(meta.chargement)){ meta.chargement = list; setMeta(meta); }
    return { slots, list };
  }

  // redessine les zones de la camionnette : verrouillée, libre, équipée (icône), sélectionnée
  function zonesRefresh(){
    if (!initialized) return;
    const meta = getMeta(), ld = loadoutNow(meta);
    root.querySelectorAll('.an-zone').forEach(z=>{
      const i = +z.dataset.bay, open = i < ld.slots, t = ld.list[i] ? TECH_BY_ID[ld.list[i]] : null;
      z.className = 'an-zone' + (open ? '' : ' lock') + (t ? ' on' : '') + (section === 'baies' && i === selectedBay ? ' sel' : '');
      z.innerHTML = !open ? uiIco('lock', 12) : (t ? pxImg(t.icon, 24) : '<span>LIBRE</span>');
      z.setAttribute('aria-label', 'Baie ' + (i + 1) + (!open ? ', verrouillée' : (t ? ', ' + t.name : ', libre')));
    });
  }

  function afterLoadoutChange(){
    consumeNotice(); refresh();
    const home = window.__ssxScene && window.__ssxScene.scene.get('home');
    if (home) home.refreshHome();                                                       // la ligne CHARGEMENT de la fiche d'ordre
  }

  // équipe une technologie dans la baie k (remplace ce qui s'y trouve, ou déplace la technologie d'une autre baie)
  function equipInto(k, techId){
    const meta = getMeta(), ld = loadoutNow(meta);
    let next = ld.list.slice(); const j = next.indexOf(techId);
    if (j >= 0) next.splice(j, 1);
    if (ld.list[k] && ld.list[k] !== techId){ next[(j >= 0 && j < k) ? k - 1 : k] = techId; } else next.push(techId);
    const why = loadoutCheck(meta, next, ld.slots);
    if (!why.ok){ sfx.uiClick(); describe(AGP_LORE.rd[why.reason] || AGP_LORE.rd.loadoutFull); return; }
    meta.chargement = next; setMeta(meta); selectedBay = next.indexOf(techId); sfx.uiSelect(); afterLoadoutChange();
  }

  function unequip(techId){
    const meta = getMeta(), ld = loadoutNow(meta);
    meta.chargement = ld.list.filter(id=> id !== techId); setMeta(meta); sfx.uiSelect(); afterLoadoutChange();
  }

  // panneau d'une baie : ce qu'elle porte (DESEQUIPER) et les technologies prototypées qu'on peut y monter
  function bayView(meta){
    const ld = loadoutNow(meta), k = selectedBay, cur = ld.list[k] ? TECH_BY_ID[ld.list[k]] : null;
    const wrap = document.createElement('div'); wrap.id = 'anBaies'; wrap.className = 'an-baies';
    if (k >= ld.slots){
      wrap.innerHTML = '<div class="bay lock bay-lock"><b>BAIE ' + (k + 1) + '</b><span>AUTORISATION REQUISE<small>incident majeur du secteur ' + k + '</small></span></div>';
      return wrap;
    }
    let h = '<div class="bay"><b>BAIE ' + (k + 1) + '</b><span>' + (cur ? cur.name : 'LIBRE') + '</span>' + (cur ? '<button class="bay-off">DESEQUIPER</button>' : '') + '</div>';
    const techs = TECHS.filter(t=> techAvailable(t) && rdEntry(meta, t.id).proto);
    h += techs.length ? techs.map(t=>{
      const at = ld.list.indexOf(t.id), label = at === k ? 'RETIRER' : (at >= 0 ? 'DEPLACER ICI' : 'EQUIPER');
      return '<div class="bay-tech" data-tech="' + t.id + '"><span>' + t.name + (t.tag ? ' <i>' + t.tag + '</i>' : '') + '</span><button>' + label + '</button></div>';
    }).join('') : '<p class="bay-none">Aucune technologie prototypée : voir la R&amp;D.</p>';
    wrap.innerHTML = h;
    const off = wrap.querySelector('.bay-off'); if (off) off.onclick = ()=> unequip(cur.id);
    wrap.querySelectorAll('.bay-tech button').forEach(b=> b.onclick = ()=>{
      const id = b.closest('.bay-tech').dataset.tech;
      if (ld.list.indexOf(id) === k) unequip(id); else equipInto(k, id);
    });
    return wrap;
  }

  // postes à jour + aimant et canon montés selon le Mk acheté
  function refresh(){
    if (!initialized) return;
    const meta = getMeta();
    Object.keys(mounts).forEach(post=>{ document.getElementById(mounts[post].id).hidden = atelierMk(meta.atelier, post) < 1; });
    if (section === 'modules' || section === 'baies') render(section, true);
    zonesRefresh();
  }

  function render(next, keepText){
    section = next; zonesRefresh();
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
    } else if (section === 'baies'){
      const meta = getMeta(); cards.className = ''; cards.appendChild(bayView(meta));
      if (!keepText) describe('Une ARME et une RAMPE au plus. Les technologies se prototypent en R&D, elles s\'assemblent en mission.');
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
    const ship = root.querySelector('.an-ship');
    BAY_ZONES.forEach((z, i)=>{
      const b = document.createElement('button'); b.className = 'an-zone'; b.dataset.bay = i;
      b.style.cssText = 'left:' + z.x/768*100 + '%;top:' + z.y/820*100 + '%;width:' + z.w/768*100 + '%;height:' + z.h/820*100 + '%';
      b.onclick = ()=>{ sfx.uiSelect(); selectedBay = i; render('baies'); consumeNotice(); };
      ship.appendChild(b);
    });
    let motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll('[data-section]').forEach(b=> b.onclick = ()=>{ sfx.uiSelect(); render(b.dataset.section); consumeNotice(); });
    const scene = root.querySelector('.an-scene');
    scene.onpointermove = e=>{ if (!motion || e.pointerType === 'touch') return; const r = scene.getBoundingClientRect(); scene.style.setProperty('--mx', (e.clientX - r.left)/r.width*2 - 1); scene.style.setProperty('--my', (e.clientY - r.top)/r.height*2 - 1); };
    scene.onpointerleave = ()=>{ scene.style.setProperty('--mx', 0); scene.style.setProperty('--my', 0); };
    function setMotion(){ root.classList.toggle('an-still', !motion); const b = document.getElementById('anMotion'); b.setAttribute('aria-pressed', String(motion)); b.textContent = 'MOUVEMENTS : ' + (motion ? 'OUI' : 'NON'); scene.onpointerleave(); }
    document.getElementById('anMotion').onclick = ()=>{ motion = !motion; setMotion(); };
    render('modules'); refresh(); setMotion();
  }
  // ouvre le garage sur une section (ex. 'baies', depuis la fiche d'ordre)
  function openSection(name){
    setup();
    if (name === 'baies'){ const ld = loadoutNow(getMeta()); selectedBay = Math.min(ld.list.length, Math.max(0, ld.slots - 1)); }      // première baie libre (ou la dernière ouverte si toutes sont pleines)
    render(name); consumeNotice();
  }
  return { setup, refresh, openSection };
})();
