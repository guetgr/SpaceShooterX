"use strict";
// Versions persistantes par mission ; aucun chargement de l'historique pendant la composition.
(function(){
  const dialog=$('versionDialog'), list=$('versionList'), detail=$('versionDetail'), status=$('versionStatus');
  const kinds={manual:'Point nommé',saved:'Enregistrement',initial:'Version initiale','before-save':'État précédent','before-restore':'Avant restauration'};
  const labels={name:'Nom',threat:'Alerte de mission',waves:'Vagues',spawns:'Réserve',events:'Événements',goal:'Objectif',count:'Quantité',at:'Arrivée (s)',spacing:'Intervalle (s)',formation:'Formation',spread:'Étendue',x:'Position X',y:'Position Y',alert:'Alerte de la créature',minAlert:'Seuil d’alerte',tier:'Intelligence',hpMul:'PV ×',dmgMul:'Dégâts ×',speedMul:'Vitesse ×',tutorial:'Tutoriel',boss:'Boss',finalBoss:'Boss final',norma:'N.O.R.M.A.',audio:'Musique',zoom:'Caméra',reward:'Récompenses',ambient:'Aléas',mobs:'Créatures',bossTune:'Réglages du boss',eventTune:'Réglages des événements',bg:'Décor',timelineOnly:'Vagues uniquement',spawnClock:'Horloge des réserves'};
  let levelId='', entries=[], selected=null, documentCache=new Map(), hasMore=false, busy=false, requestId=0, compareRows=[], sessionId=0;
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const button=(text,fn,cls='btn')=>{const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;};
  const showStatus=(message,error=false)=>{status.textContent=message;status.classList.toggle('error',error);};
  function setBusy(value){busy=value;$('versionCreate').disabled=value||!$('versionName').value.trim();detail.querySelectorAll('button').forEach(b=>b.disabled=value||(b.id==='versionRestore'&&!compareRows.length));list.querySelectorAll('button').forEach(b=>b.disabled=value);}
  async function api(query,body){
    const response=await fetch('/__editor/versions'+query,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
    if(response.status===404)throw new Error('Redémarrez le serveur local pour activer l’historique des versions.');
    const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Historique indisponible');return result;
  }
  const date=value=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
  const current=()=>editorLevelDocument(levelId);
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function differences(before,after,path=[],result=[]){
    if(same(before,after))return result;
    if(before&&after&&typeof before==='object'&&typeof after==='object'&&Array.isArray(before)===Array.isArray(after)){
      const keys=[...new Set([...Object.keys(before),...Object.keys(after)])];
      for(const key of keys)differences(before[key],after[key],[...path,Array.isArray(before)?Number(key):key],result);
    }else result.push({path,before,after});
    return result;
  }
  function valueText(value){if(value===undefined)return 'Absent';if(value===null)return 'Aucun';if(typeof value==='boolean')return value?'Oui':'Non';if(typeof value==='object')return JSON.stringify(value);return String(value);}
  function pathText(path){return path.map(part=>typeof part==='number'?'n° '+(part+1):(labels[part]||part)).join(' / ');}
  function renderVersionList(){
    list.replaceChildren();
    if(!entries.length){list.appendChild(el('p','version-empty','Aucune version pour cette mission. Nommez votre premier point de sauvegarde, ou enregistrez une modification pour créer une version automatique.'));return;}
    for(const version of entries){
      const b=button('',()=>select(version),'version-entry'+(selected?.id===version.id?' selected':''));b.dataset.version=version.id;b.setAttribute('aria-pressed',String(selected?.id===version.id));
      b.append(el('strong',null,version.title),el('span','version-date',date(version.createdAt)),el('span','version-kind',kinds[version.kind]||'Version'));
      const s=version.summary;b.appendChild(el('small',null,s.waves+' vague'+(s.waves===1?'':'s')+' · '+s.creatures+' créatures · alerte '+s.threat));list.appendChild(b);
    }
    if(hasMore)list.appendChild(button('Afficher les versions précédentes',()=>load(true),'btn version-more'));
  }
  async function load(more=false){
    const token=++requestId, mission=levelId;showStatus('Chargement des versions…');setBusy(true);
    try{
      const result=await api('?level='+encodeURIComponent(mission)+'&offset='+(more?entries.length:0));if(token!==requestId||mission!==levelId)return;
      entries=more?[...entries,...result.versions]:result.versions;hasMore=result.hasMore;renderVersionList();showStatus('Versions conservées sur cet ordinateur.');
      if(!selected&&entries.length)await select(entries[0]);
      else if(!entries.length)detail.replaceChildren(el('p','version-empty','Sélectionnez une version pour comparer son contenu au brouillon actuel.'));
    }catch(error){if(token!==requestId)return;showStatus(error.message,true);if(!entries.length){list.replaceChildren(button('Réessayer',()=>load(),'btn'));}}
    finally{if(token===requestId)setBusy(false);}
  }
  function renderDetail(version){
    detail.replaceChildren();const head=el('div','version-detail-heading');head.append(el('span','version-kind',kinds[version.kind]||'Version'),el('h3',null,version.title),el('p',null,date(version.createdAt)));detail.appendChild(head);
    const summary=el('div','version-metrics');for(const [value,label] of [[version.summary.waves,'vagues'],[version.summary.creatures,'créatures'],[version.summary.threat,'alerte']]){const cell=el('div');cell.append(el('strong',null,value),el('span',null,label));summary.appendChild(cell);}detail.appendChild(summary);
    compareRows=differences(version.document,current());
    detail.appendChild(el('h4','version-compare-heading',compareRows.length?compareRows.length+' différence'+(compareRows.length===1?'':'s')+' avec le brouillon':'Identique au brouillon'));
    if(compareRows.length){
      const table=el('table','version-diff'),caption=el('caption',null,'Comparaison de la version sélectionnée avec le brouillon actuel');table.appendChild(caption);
      const header=el('tr');['Paramètre','Cette version','Brouillon actuel'].forEach(text=>header.appendChild(el('th',null,text)));const thead=el('thead');thead.appendChild(header);table.appendChild(thead);const tbody=el('tbody');
      for(const diff of compareRows.slice(0,80)){const tr=el('tr');tr.appendChild(el('th',null,pathText(diff.path)));for(const value of [diff.before,diff.after]){const text=valueText(value),cell=el('td',null,text.length>180?text.slice(0,177)+'…':text);cell.title=text;tr.appendChild(cell);}tbody.appendChild(tr);}table.appendChild(tbody);detail.appendChild(table);
      if(compareRows.length>80)detail.appendChild(el('p','version-note','80 différences affichées sur '+compareRows.length+'. Le téléchargement contient la mission complète.'));
    }else detail.appendChild(el('p','version-note','Tous les paramètres de cette mission correspondent à la version sélectionnée.'));
    const actions=el('div','version-detail-actions'),restore=button('Restaurer dans le brouillon',()=>restoreVersion(version),'btn save');restore.id='versionRestore';restore.disabled=!compareRows.length;
    actions.append(restore,button('Télécharger le JSON',()=>download(version)));detail.appendChild(actions);
    detail.appendChild(el('p','version-note','La restauration conserve une copie du brouillon actuel. Cliquez ensuite sur « Enregistrer » pour appliquer cette version aux fichiers du jeu.'));
  }
  async function select(version){
    if(busy&&selected?.id===version.id)return;const token=++requestId;selected=version;renderVersionList();detail.replaceChildren(el('p','version-empty','Chargement de cette version…'));setBusy(true);
    try{
      let full=documentCache.get(version.id);if(!full){full=(await api('?level='+encodeURIComponent(levelId)+'&id='+encodeURIComponent(version.id))).version;documentCache.set(version.id,full);}
      if(token!==requestId)return;selected=full;renderDetail(full);showStatus('Versions conservées sur cet ordinateur.');
    }catch(error){if(token===requestId)showStatus(error.message,true);}
    finally{if(token===requestId){setBusy(false);const restore=$('versionRestore');if(restore)restore.disabled=!compareRows.length;}}
  }
  async function create(){
    const input=$('versionName'),session=sessionId,mission=levelId;if(busy||!input.reportValidity()||!input.value.trim())return;setBusy(true);showStatus('Création du point de sauvegarde…');
    try{
      const result=await api('',{levelId,title:input.value.trim(),kind:'manual',document:current()});if(session!==sessionId||mission!==levelId)return;input.value='';documentCache.clear();selected=null;await load();await select(result.version);toast('Version « '+result.version.title+' » créée.');
    }catch(error){if(session===sessionId)showStatus(error.message,true);}
    finally{if(session===sessionId){setBusy(false);const restore=$('versionRestore');if(restore)restore.disabled=!compareRows.length;}}
  }
  async function restoreVersion(version){
    if(busy||!compareRows.length)return;const session=sessionId;setBusy(true);showStatus('Copie de sécurité du brouillon…');const mission=levelId, snapshot=current();
    try{
      const response=await fetch('/__editor/validate-level',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({levels:{[mission]:version.document}})});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Cette version ne correspond plus au format actuel de la mission.');
      await api('',{levelId:mission,title:'Brouillon avant restauration',kind:'before-restore',document:snapshot});
      if(session!==sessionId)return;
      if(S.sel!==mission||!same(snapshot,editorLevelDocument(mission)))throw new Error('Le brouillon a changé pendant la restauration. Sélectionnez à nouveau la version.');
      stopPreview();S.ov.levels||={};if(differences(S.documents[mission],version.document).length)S.ov.levels[mission]=clone(version.document);else delete S.ov.levels[mission];if(lvl(mission).tuto)S.ov.tuto={};changed();renderList();renderForm();dialog.close();toast('Version restaurée dans le brouillon. Enregistrez pour l’appliquer au jeu.');
    }catch(error){if(session===sessionId)showStatus(error.message,true);}
    finally{if(session===sessionId){setBusy(false);const restore=$('versionRestore');if(restore)restore.disabled=!compareRows.length;}}
  }
  function download(version){const url=URL.createObjectURL(new Blob([JSON.stringify(version.document,null,2)+'\n'],{type:'application/json'}));const a=el('a');a.href=url;a.download=levelId+'-'+version.id.slice(0,8)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('btnVersions').onclick=()=>{
    if(!S.ready)return;++sessionId;stopPreview();levelId=S.sel;entries=[];selected=null;documentCache.clear();compareRows=[];hasMore=false;
    $('versionMission').textContent=editorLevelDocument(levelId).name+' · '+levelId;$('versionName').value='';detail.replaceChildren();dialog.showModal();load();
  };
  $('versionClose').onclick=()=>dialog.close();$('versionCreate').onclick=create;$('versionName').oninput=()=>{$('versionCreate').disabled=busy||!$('versionName').value.trim();};
  $('versionName').onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();create();}};
  dialog.addEventListener('close',()=>{++requestId;++sessionId;busy=false;});
  window.EditorVersions={saved:()=>{if(dialog.open){selected=null;documentCache.clear();load();}}};
})();
