"use strict";
// Laboratoire intégré à l'éditeur : un cadre (index.html?lab&embed, src/dev/lab.js) à droite de la zone de travail, lié à la mission choisie.
// Boucle voulue : je modifie (timeline, réglages) -> « Tester le brouillon » (ou « Tester la mission » en haut) -> je modifie -> je teste ; chaque partie arrive dans le tableau sous le cadre.
//  éditeur -> labo : { type:'lab-select', levelId } · { type:'lab-draft', document } (brouillon demandé au lancement) · { type:'lab-launch' } (lancer avec le brouillon)
//  labo -> éditeur : { type:'lab-ready' } · { type:'lab-need-draft', levelId } · { type:'lab-run' } (une partie vient d'être enregistrée : le tableau se recharge)
(function(){
  const frame = $('labFrame'), split = $('workSplit');
  let loaded = false, ready = false, sent = '';
  const send = m=> { if (frame.contentWindow) frame.contentWindow.postMessage(Object.assign({ ssx:1 }, m), GAME); };
  const style = document.createElement('style');
  style.textContent = [
    // page : plus de colonnes latérales ; zone de travail pleine largeur, timeline 80 % / laboratoire 20 %
    '.app-layout{display:block;height:auto;min-height:calc(100dvh - 64px)}.workspace{overflow:visible;padding:14px 18px 24px}',
    '.work-split{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,1fr);grid-template-rows:auto 284px auto;column-gap:14px;align-items:start}.work-main,#compositionPanel{display:contents}',
    '#validationSummary{grid-column:1/-1;grid-row:1}#toolsBand{grid-column:1;grid-row:2}#timelinePanel{grid-column:1;grid-row:3}#form,#jsonPanel{grid-column:1;grid-row:2/span 2}#previewStage{display:none!important}',
    '#labDock{grid-column:2;grid-row:2/span 2;position:sticky;top:8px;display:flex;flex-direction:column;gap:8px;height:calc(100dvh - 90px);min-height:520px}',
    '.work-split.nodock{grid-template-columns:minmax(0,1fr)}.work-split.nodock #toolsBand,.work-split.nodock #timelinePanel,.work-split.nodock #form,.work-split.nodock #jsonPanel{grid-column:1/-1}.work-split.nodock #labDock{display:none}',
    // timeline : défilement horizontal dans la zone, hauteur bornée à l'écran (la page défile pour l'amener en vue)
    '.tl-scroll{max-height:calc(100dvh - 330px)!important;min-height:260px!important}',
    // en-tête : choix de la mission
    '.mission-heading .mission-picker{margin:0 12px 0 auto;border:0;padding:0;min-width:280px}.mission-heading .mission-picker>summary{display:none}.mission-heading .mission-picker nav{margin:0}.mission-heading .mission-picker select{width:100%;font-size:13px;padding:8px}.mission-file{display:none}',
    // bande d'outils compacte : créatures | inspecteur | simulation
    '#toolsBand{display:grid;grid-template-columns:230px minmax(0,1fr) 230px;gap:10px;height:272px;margin-bottom:12px}',
    '.band-col{min-width:0;min-height:0;overflow:auto;border:1px solid var(--line);border-radius:6px;background:#1a2129}.band-col #library{padding:8px 8px 0}.band-col .sidebar-foot{padding:8px;border-top:1px solid var(--line)}',
    '#library .library-heading h2{font-size:12px}.library-hint{display:none}.tl-search{padding:5px 8px}.tl-catalog{margin:6px 0 0!important;gap:1px!important;padding:0 2px 6px!important}',
    '.tl-enemy{min-height:30px!important;padding:2px 6px!important;gap:6px!important}.tl-enemy img{width:24px!important;height:24px!important}.enemy-copy small{display:none!important}.enemy-copy strong{font-size:11px!important}.drag-grip{font-size:12px!important}',
    '#inspector .inspector-heading{padding:8px 12px}.inspector-content{padding:0 12px 10px}.inspector-title{padding:6px 0!important;gap:8px!important}.inspector-title>img{width:28px!important;height:28px!important}.inspector-title h2{font-size:12px!important}',
    '.inspector-group{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:2px 14px;padding:6px 0 2px!important}.inspector-group h3,.inspector-group .formation-choices,.inspector-group .inspector-note{grid-column:1/-1;margin:0 0 4px!important}.inspector-group .property-field{margin-bottom:4px}',
    '.band-bot .lab-panel{margin:8px!important}.band-bot .keyboard-help{padding:0 8px 8px}',
    // inspecteur du boss : étapes lisibles dans une colonne étroite
    '#inspector .st-step>summary{display:block}#inspector .st-step>summary strong{display:block;min-width:0;margin-bottom:4px}#inspector .st-desc{display:block;max-width:none;font-size:10px}#inspector .f{grid-template-columns:1fr 84px}#inspector .f input[type=number]{width:84px}',
    // laboratoire (20 %) et tableau des parties
    '#dockVersion{flex:1;min-width:0;font-size:11px;padding:5px}.dock-head{display:flex;justify-content:space-between;align-items:center;gap:6px}.dock-head b{font-size:12px}.lab-frame{flex:1;min-height:300px;width:100%;border:1px solid var(--line);border-radius:6px;background:#070a09}',
    '#labDock .dock-runs{flex:none;margin:0;max-height:230px;overflow:auto;border:1px solid var(--line);border-radius:6px;padding:6px 8px;background:#161d24}.dock-runs-head{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px;font-size:11px;flex-wrap:wrap}',
    '#labTabBody{overflow-x:auto}#labTabBody table{font-size:10px}#labTabBody td,#labTabBody th{padding:3px 4px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis}',
    // écran étroit : tout en colonne
    '@media(max-width:1250px){.work-split{grid-template-columns:1fr;grid-template-rows:none}.work-main,#compositionPanel{display:block}#toolsBand{grid-template-columns:1fr;height:auto}.band-col{max-height:300px}#labDock{position:static;height:680px}#validationSummary,#toolsBand,#timelinePanel,#form,#jsonPanel,#labDock{grid-column:1;grid-row:auto}}'
  ].join('\n');
  document.head.append(style);

  const wait = setInterval(()=> { if (S.ready){ clearInterval(wait); loaded = true; frame.src = 'index.html?lab&embed&level=' + encodeURIComponent(S.sel); } }, 300);
  // le niveau du labo suit la mission choisie ici (force = relire aussi l'historique, ex. après un enregistrement)
  // version du niveau à tester : brouillon, publiée ou une version de l'historique ; le labo ne la montre pas, c'est ici qu'on la choisit
  const vsel = $('dockVersion'), KINDS = { manual:'Point nommé', saved:'Enregistrement', initial:'Version initiale', 'before-save':'État précédent', 'before-restore':'Avant restauration' };
  let versionLevel = '';
  const sendVersion = ()=> send({ type:'lab-version', versionId:vsel.value });
  vsel.onchange = sendVersion;
  async function loadVersions(){
    const level = S.sel, keep = level === versionLevel ? vsel.value : 'draft'; versionLevel = level;
    let list = []; try { list = (await (await fetch('/__editor/versions?level=' + encodeURIComponent(level))).json()).versions || []; } catch(e){ /* historique indisponible */ }
    if (level !== S.sel) return;
    vsel.replaceChildren();
    const add = (v, t)=> { const o = document.createElement('option'); o.value = v; o.textContent = t; vsel.appendChild(o); };
    add('draft', 'Brouillon (non enregistré)'); add('', 'Publiée');
    list.forEach(v=> add(v.id, v.title + ' — ' + (KINDS[v.kind] || 'Version') + ' · ' + new Date(v.createdAt).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' })));
    vsel.value = [...vsel.options].some(o=> o.value === keep) ? keep : 'draft';
    sendVersion();
  }
  const select = force=> { if (!ready) return; if (!force && sent === S.sel) return; sent = S.sel; send({ type:'lab-select', levelId:S.sel }); loadVersions(); if (window.LabRuns) LabRuns.refresh(); };
  const baseSetView = setView;
  setView = function(view){ baseSetView(view); select(false); };
  const resync = ()=> setTimeout(()=> select(true), 1500);
  ['btnSave', 'versionCreate', 'versionRestore'].forEach(id=> { const b = $(id); if (b) b.addEventListener('click', resync); });
  $('versionDialog').addEventListener('close', resync);

  const launch = ()=> {
    if (!ready){ toast('Le laboratoire se charge…', true); return; }
    split.classList.remove('nodock'); $('btnDock').textContent = 'Masquer le labo'; $('btnDock').setAttribute('aria-pressed', 'true');
    send({ type:'lab-launch' });
  };
  $('dockTest').onclick = launch;
  $('btnPlay').onclick = launch;                    // « Tester la mission » : le laboratoire est la zone de test principale (l'ancien aperçu intégré n'est plus lancé d'ici)
  $('btnDock').onclick = ()=> { const hidden = split.classList.toggle('nodock'); $('btnDock').textContent = hidden ? 'Afficher le labo' : 'Masquer le labo'; $('btnDock').setAttribute('aria-pressed', String(!hidden)); };

  window.addEventListener('message', ev=>{
    if (ev.origin !== GAME || !ev.data || ev.data.ssx !== 1 || ev.source !== frame.contentWindow) return;
    const m = ev.data;
    if (m.type === 'lab-ready'){ ready = true; select(true); }
    else if (m.type === 'lab-need-draft') send({ type:'lab-draft', document:m.levelId === S.sel ? editorLevelDocument(S.sel) : null });
    else if (m.type === 'lab-run' && window.LabRuns) LabRuns.refresh();
  });
})();
