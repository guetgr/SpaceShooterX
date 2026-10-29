"use strict";
// Onglet « Laboratoire » de l'éditeur : le laboratoire du jeu (index.html?lab&embed, src/dev/lab.js) intégré dans un cadre, lié à la mission choisie ici.
//  éditeur → labo : { type:'lab-select', levelId } · { type:'lab-draft', document } (brouillon demandé au lancement)
//  labo → éditeur : { type:'lab-ready' } · { type:'lab-need-draft', levelId } · { type:'lab-run' } (une partie vient d'être enregistrée : le tableau se recharge)
(function(){
  const frame = $('labFrame');
  let loaded = false, ready = false;
  const send = m=> { if (frame.contentWindow) frame.contentWindow.postMessage(Object.assign({ ssx:1 }, m), GAME); };
  const style = document.createElement('style');
  style.textContent = '.lab-frame{width:100%;height:calc(100dvh - 230px);min-height:560px;border:1px solid var(--line);border-radius:6px;background:#070a09;display:block}.lab-tab-title{font-size:13px;margin:18px 0 6px;color:#c0d3df}#labTabBody{padding:0;max-height:none}';
  document.head.append(style);
  const baseSetView = setView;
  setView = function(view){
    baseSetView(view);
    if (view !== 'lab') return;
    if (!loaded){ loaded = true; frame.src = 'index.html?lab&embed&level=' + encodeURIComponent(S.sel); }
    else if (ready) send({ type:'lab-select', levelId:S.sel });
    if (window.LabRuns) LabRuns.refresh();
  };
  // l'historique des versions change quand on enregistre, crée un point nommé ou restaure : le labo relit la liste
  const resync = ()=> setTimeout(()=> { if (currentView === 'lab' && ready) send({ type:'lab-select', levelId:S.sel }); }, 1500);
  ['btnSave', 'versionCreate', 'versionRestore'].forEach(id=> { const b = $(id); if (b) b.addEventListener('click', resync); });
  $('versionDialog').addEventListener('close', resync);
  window.addEventListener('message', ev=>{
    if (ev.origin !== GAME || !ev.data || ev.data.ssx !== 1 || ev.source !== frame.contentWindow) return;
    const m = ev.data;
    if (m.type === 'lab-ready'){ ready = true; send({ type:'lab-select', levelId:S.sel }); }
    else if (m.type === 'lab-need-draft') send({ type:'lab-draft', document:m.levelId === S.sel ? editorLevelDocument(S.sel) : null });
    else if (m.type === 'lab-run' && window.LabRuns) LabRuns.refresh();
  });
})();
