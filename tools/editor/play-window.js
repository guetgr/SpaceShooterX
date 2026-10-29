"use strict";
(function(){
  const origin=location.origin,game=document.getElementById('previewGame'),wait=document.getElementById('previewWait'),status=document.getElementById('previewStatus');
  const editor=window.opener;let ready=false,pending=null;
  const send=message=>{if(editor&&!editor.closed)editor.postMessage(Object.assign({ssx:1},message),origin);};
  const post=message=>game.contentWindow.postMessage(Object.assign({ssx:1},message),origin);
  function pause(){pending=null;if(ready)post({type:'pause-preview'});wait.hidden=false;wait.textContent='Test en pause. Relancez pour jouer le brouillon actuel.';status.textContent='Test en pause';}
  function launch(snapshot){
    pending=snapshot;document.getElementById('previewMission').textContent=snapshot.document.name;document.title=snapshot.document.name+' — Test AGP Studio';
    if(!ready){wait.hidden=false;wait.textContent='Chargement du jeu…';return;}
    // Une copie complète de la mission évite de dépendre d'une ancienne référence enregistrée.
    post({type:'play',levelId:snapshot.levelId,overrides:{tuto:{},levels:{[snapshot.levelId]:snapshot.document}}});
    wait.hidden=true;status.textContent='Brouillon de l’éditeur · sauvegarde de jeu isolée';document.getElementById('previewRestart').disabled=false;
    requestAnimationFrame(()=>{post({type:'resize-preview'});game.focus();});
  }
  window.addEventListener('message',event=>{
    if(event.origin!==origin||!event.data||event.data.ssx!==1)return;const message=event.data;
    if(event.source===editor){
      if(message.type==='editor-preview-launch'&&message.document)launch(message);
      else if(message.type==='editor-preview-pause')pause();
    }else if(event.source===game.contentWindow){
      if(message.type==='ready'&&message.mode==='play'){ready=true;send({type:'editor-preview-ready'});if(pending)launch(pending);}
      else if(message.type==='timeline-reset'||message.type==='timeline-trace')send({type:'editor-preview-trace',message});
      else if(message.type==='apply-error'){status.textContent='Impossible de lancer cette mission';wait.textContent=message.error;wait.hidden=false;send({type:'editor-preview-error',error:message.error});}
    }
  });
  document.getElementById('previewRestart').onclick=()=>send({type:'editor-preview-restart'});
  document.getElementById('previewClose').onclick=()=>window.close();
  const fullscreen=document.getElementById('previewFullscreen');
  fullscreen.hidden=typeof document.documentElement.requestFullscreen!=='function';
  fullscreen.onclick=async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch(error){status.textContent='Le plein écran est indisponible. Vous pouvez redimensionner cette fenêtre.';}
  };
  document.addEventListener('fullscreenchange',()=>fullscreen.textContent=document.fullscreenElement?'Quitter le plein écran':'Plein écran');
  window.addEventListener('resize',()=>{if(ready)post({type:'resize-preview'});});
  if(!editor||editor.closed){wait.textContent='Ouvrez cette fenêtre depuis le bouton « Fenêtre séparée » de l’éditeur.';status.textContent='Éditeur non connecté';return;}
  game.src='../../index.html?dev&edit=play&sandbox=1';
  const watch=setInterval(()=>{if(editor.closed){pause();status.textContent='Éditeur fermé';document.getElementById('previewRestart').disabled=true;clearInterval(watch);}},1000);
  window.addEventListener('pagehide',()=>clearInterval(watch));
})();
