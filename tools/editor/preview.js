"use strict";
// Modes de test : l'iframe reste en place en grand écran, la fenêtre reçoit une copie du brouillon.
(function(){
  const stage=$('previewStage'), expand=$('btnExpand'), detach=$('btnPopup');
  const state={expanded:false,inlinePlaying:false,mode:'inline',popup:null,pending:null,ready:false,timer:0};
  const popupName='ssx-preview-'+Date.now().toString(36);
  let previousFocus=null, inertState=[];
  const popupOpen=()=>!!state.popup&&!state.popup.closed;
  const sendPopup=message=>{if(popupOpen())state.popup.postMessage(Object.assign({ssx:1},message),GAME);};
  const snapshot=()=>({levelId:S.sel,document:editorLevelDocument(S.sel)});
  function resize(){post('play',{type:'resize-preview'});}
  function collapse(){
    if(!state.expanded)return;
    state.expanded=false;stage.classList.remove('preview-expanded');stage.removeAttribute('role');stage.removeAttribute('aria-modal');
    expand.textContent='Agrandir';expand.setAttribute('aria-expanded','false');
    inertState.forEach(([node,value])=>node.inert=value);inertState=[];document.body.classList.remove('preview-overlay-open');
    requestAnimationFrame(resize);if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  function pauseInline(){post('play',{type:'pause-preview'});state.inlinePlaying=false;$('playPanel').hidden=true;}
  function stop(){
    pauseInline();collapse();sendPopup({type:'editor-preview-pause'});state.pending=null;
    $('btnStop').hidden=true;$('stageLabel').textContent='Placement initial';
  }
  function launchInline(){
    state.mode='inline';sendPopup({type:'editor-preview-pause'});state.pending=null;setView('composition');
    $('playPanel').hidden=false;$('btnStop').hidden=false;$('stageLabel').textContent='Mission en cours';$('ph').style.display='none';
    state.inlinePlaying=true;post('play',{type:'play',levelId:S.sel,overrides:S.ov});
    requestAnimationFrame(()=>{resize();frames.play.focus();});
  }
  function launchPopup(){
    if(!popupOpen()){state.mode='inline';launchInline();return;}
    pauseInline();collapse();state.mode='popup';state.pending=snapshot();
    $('btnStop').hidden=false;$('stageLabel').textContent='Test dans une fenêtre séparée';
    if(state.ready)sendPopup({type:'editor-preview-launch',...state.pending});state.popup.focus();
  }
  function play(){if(!S.ready)return;if(state.mode==='popup'&&popupOpen())launchPopup();else launchInline();}
  function enlarge(){
    if(!S.ready)return;if(state.expanded){collapse();return;}
    if(!state.inlinePlaying)launchInline();else setView('composition');
    previousFocus=document.activeElement;state.expanded=true;stage.classList.add('preview-expanded');stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');
    stage.setAttribute('aria-label','Test de la mission en grand écran');expand.textContent='Réduire';expand.setAttribute('aria-expanded','true');
    inertState=[...document.querySelectorAll('.app-header,.library-sidebar,.right,.mission-heading,.workspace-tabs,#timelinePanel')].map(node=>[node,node.inert]);inertState.forEach(([node])=>node.inert=true);
    document.body.classList.add('preview-overlay-open');requestAnimationFrame(()=>{resize();frames.play.focus();});
  }
  function popupClosed(){
    clearInterval(state.timer);state.timer=0;state.popup=null;state.ready=false;state.pending=null;
    if(state.mode==='popup'){state.mode='inline';$('btnStop').hidden=true;$('stageLabel').textContent='Placement initial';}
  }
  function openPopup(){
    if(!S.ready)return;
    if(!popupOpen()){
      const width=Math.min(620,screen.availWidth||620),height=Math.min(940,screen.availHeight||940);
      const opened=window.open('tools/editor/play-window.html',popupName,'popup=yes,resizable=yes,scrollbars=yes,width='+width+',height='+height);
      if(!opened){toast('La fenêtre a été bloquée. Autorisez les fenêtres de ce site, ou utilisez « Agrandir ».',true);return;}
      state.popup=opened;state.ready=false;clearInterval(state.timer);state.timer=setInterval(()=>{if(!popupOpen())popupClosed();},500);
    }
    launchPopup();
  }
  function escape(event){if(event.key==='Escape'&&state.expanded){event.preventDefault();event.stopImmediatePropagation();collapse();}}
  // Le jeu reçoit le clavier dans son iframe ; son Échap ferme aussi le mode agrandi.
  function ready(){expand.disabled=false;detach.disabled=false;frames.play.contentWindow.addEventListener('keydown',escape,true);}
  function handleMessage(event){
    if(!state.popup||event.source!==state.popup)return false;
    const message=event.data;
    if(message.type==='editor-preview-ready'){
      state.ready=true;if(state.mode==='popup'&&state.pending)sendPopup({type:'editor-preview-launch',...state.pending});else sendPopup({type:'editor-preview-pause'});
    }else if(message.type==='editor-preview-restart')launchPopup();
    else if(message.type==='editor-preview-trace'&&state.mode==='popup')recordPreviewTrace(message.message);
    else if(message.type==='editor-preview-error')toast(message.error,true);
    return true;
  }
  expand.onclick=enlarge;detach.onclick=openPopup;document.addEventListener('keydown',escape,true);
  // Le focus reste dans le test agrandi, même au clavier.
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab'||!state.expanded)return;const items=[...stage.querySelectorAll('button:not([hidden]):not(:disabled),iframe')].filter(node=>node.getClientRects().length);
    const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  window.addEventListener('pagehide',()=>{clearInterval(state.timer);if(popupOpen())state.popup.close();});
  window.EditorPreview={play,stop,ready,handleMessage};
  if(S.ready)ready();
})();
