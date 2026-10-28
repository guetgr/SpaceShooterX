"use strict";
// Un document complet par mission ; les champs visuels et le JSON partagent le même état.
function editorLevelDocument(id){
  const doc = clone(S.documents[id]);
  const overrides = S.ov.levels[id] || {};
  for (const [key,value] of Object.entries(overrides)){
    if (!(key in doc)) continue;
    doc[key] = value && typeof value === 'object' && !Array.isArray(value) ? Object.assign({},doc[key],clone(value)) : clone(value);
  }
  if (doc.tuto){
    doc.tutorial = clone(doc.tutorial);
    for (const [group,values] of Object.entries(S.ov.tuto || {})) doc.tutorial[group] = Object.assign({},doc.tutorial[group],values);
  }
  return doc;
}
function renderLevelDocument(parent, level){
  const sec = section('FICHIER JSON COMPLET · '+level.id+'.json',false), body=sec.querySelector('.body');
  const note=document.createElement('p'); note.className='sub'; note.textContent='Paramètres de cette mission : pools, vagues, événements, objectif, décor, caméra, boss, aléas et tutoriel. Les comportements des ennemis et des événements restent définis dans leurs modules communs.'; body.appendChild(note);
  const area=document.createElement('textarea'); area.className='tl-json'; area.spellcheck=false; area.setAttribute('aria-label','JSON complet du niveau');
  const sync=()=>{area.value=JSON.stringify(editorLevelDocument(level.id),null,2);}; sync();
  body.appendChild(area);
  const bar=document.createElement('div');bar.className='opts';body.appendChild(bar);
  const button=(text,fn)=>{const b=document.createElement('button');b.className='btn';b.textContent=text;b.onclick=fn;bar.appendChild(b);};
  button('ACTUALISER DEPUIS LA TIMELINE',sync);
  button('VALIDER ET APPLIQUER',async()=>{
    try{
      const doc=JSON.parse(area.value);
      const r=await fetch('/__editor/validate-level',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({levels:{[level.id]:doc}})});
      const result=await r.json(); if(!r.ok || !result.ok) throw new Error(result.error);
      S.ov.levels[level.id]=doc; if(level.tuto)S.ov.tuto=clone(doc.tutorial);
      changed();renderForm();toast('JSON appliqué. TESTER pour relancer ; EXPORTER pour enregistrer.');
    }catch(e){toast(e.message,true);}
  });
  button('TELECHARGER LE JSON',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(editorLevelDocument(level.id),null,2)+'\n'],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=level.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  parent.appendChild(sec);
}

function renderScenarioControls(body, level, redraw){
  const doc=editorLevelDocument(level.id), box=document.createElement('div');box.className='tl-scenario';body.appendChild(box);
  const save=(key,value)=>{(S.ov.levels[level.id] ||= {})[key]=value;changed();redraw();};
  const heading=text=>{const h=document.createElement('h4');h.textContent=text;box.appendChild(h);};
  const control=(row,label,value,min,max,onChange)=>{
    const l=document.createElement('label');l.textContent=label;const i=document.createElement('input');i.type='number';i.value=value;i.min=min;i.max=max;i.step='any';i.required=true;
    i.onchange=()=>{if(i.reportValidity())onChange(Number(i.value));};l.appendChild(i);row.appendChild(l);
  };
  const remove=(row,fn)=>{const b=document.createElement('button');b.className='btn';b.textContent='SUPPRIMER';b.onclick=fn;row.appendChild(b);};
  heading('POOLS DE MOBS EXISTANTS — SATELLITES COMPRIS');
  const hint=document.createElement('p');hint.className='sub';hint.textContent=doc.tuto ? 'Les satellites pédagogiques sont pilotés par les étapes ci-dessous. Les vagues SATELLITE ajoutées sur la timeline utilisent leurs PV et comptent pour l’objectif du tutoriel.' : 'Chaque bande active un type de mob dans le tirage aléatoire. Le poids règle sa fréquence relative, pas un nombre garanti. '+(doc.spawnClock==='difficulty'?'Horloge historique : temps de partie + 12 s × (menace − 1).':'Horloge : secondes de mission.');box.appendChild(hint);
  doc.spawns.forEach((sp,index)=>{
    const row=document.createElement('div');row.className='tl-row';const name=document.createElement('strong');name.textContent=(S.bestiary.find(e=>e.type===sp.type)||{label:sp.type}).label;row.appendChild(name);
    control(row,'Activation (s)',sp.from,-1,3600,v=>{doc.spawns[index].from=v;save('spawns',doc.spawns);});
    control(row,'Poids',sp.w,0.01,1000,v=>{doc.spawns[index].w=v;save('spawns',doc.spawns);});
    if(sp.tier)control(row,'Tier',sp.tier,1,4,v=>{doc.spawns[index].tier=v;save('spawns',doc.spawns);});
    remove(row,()=>{doc.spawns.splice(index,1);save('spawns',doc.spawns);renderForm();});box.appendChild(row);
  });
  heading('EVENEMENTS PROGRAMMES');
  doc.events.forEach((event,index)=>{
    const row=document.createElement('div');row.className='tl-row';const name=document.createElement('strong');name.textContent=(S.eventCatalog.find(e=>e.id===event.kind)||{name:event.kind}).name;row.appendChild(name);
    control(row,'Déclenchement (s)',event.at,0,3600,v=>{doc.events[index].at=v;save('events',doc.events);});
    control(row,'Durée forcée (s, 0 = défaut)',event.duration||0,0,600,v=>{if(v)doc.events[index].duration=v;else delete doc.events[index].duration;save('events',doc.events);});
    remove(row,()=>{doc.events.splice(index,1);save('events',doc.events);renderForm();});box.appendChild(row);
  });
  const row=document.createElement('div');row.className='opts';const select=document.createElement('select');
  S.eventCatalog.forEach(e=>{const option=document.createElement('option');option.value=e.id;option.textContent=e.name;select.appendChild(option);});row.appendChild(select);
  const add=document.createElement('button');add.className='btn';add.textContent='AJOUTER UN EVENEMENT A 10 S';add.onclick=()=>{doc.events.push({kind:select.value,at:10});save('events',doc.events);renderForm();};row.appendChild(add);box.appendChild(row);
  heading('EVENEMENTS ALEATOIRES');
  for(const [key,label] of [['golden','Trésorin aléatoire'],['smallEvents','Petits événements aléatoires']]){
    const labelEl=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=doc.ambient[key];
    input.onchange=()=>{doc.ambient[key]=input.checked;save('ambient',doc.ambient);};labelEl.append(input,document.createTextNode(label));box.appendChild(labelEl);
  }
}

function timelineScenarioTracks(tracks, level, duration, px){
  const doc=editorLevelDocument(level.id);
  const lane=(name,items)=>{
    const row=document.createElement('div');row.className='tl-lane';const title=document.createElement('strong');title.textContent=name;row.appendChild(title);
    const rail=document.createElement('div');rail.className='tl-rail';rail.style.width=duration*px+'px';row.appendChild(rail);
    for(const item of items){const block=document.createElement('div');block.className='tl-block tl-system';block.style.left=Math.max(0,item.at)*px+'px';block.style.width=Math.max(150,(item.duration||12)*px)+'px';block.textContent=item.text;block.title=item.detail||item.text;rail.appendChild(block);}
    tracks.appendChild(row);
  };
  if(!level.tuto)doc.spawns.forEach(sp=>{
    const at=doc.spawnClock==='difficulty'?Math.max(0,sp.from-12*(doc.threat-1)):sp.from;
    lane('POOL · '+sp.type,[{at,duration:Math.max(1,duration-at),text:doc.timelineOnly?'POOL DESACTIVE':sp.type+' · poids '+sp.w+(sp.tier?' · tier '+sp.tier:''),detail:'Activation aléatoire ; aucune arrivée individuelle garantie à cet instant.'}]);
  });
  doc.events.forEach(e=>lane('EVENEMENT',[{at:e.at,duration:e.duration,text:(S.eventCatalog.find(x=>x.id===e.kind)||{name:e.kind}).name,detail:e.at+' s minimum ; attente du slot libre et de la fin du boss. Durée : '+(e.duration?e.duration+' s':'défaut de l’événement')} ]));
  if(!level.tuto && doc.type==='survive')lane('OBJECTIF',[{at:doc.goal.seconds,text:doc.finalBoss?'Objectif atteint → '+doc.finalBoss:'Fin de mission',detail:'Le boss attend la fin d’un grand événement en cours.'}]);
  if(!level.tuto && doc.type==='boss')lane('BOSS',[{at:1.5,text:doc.finalBoss||doc.boss}]);
  const condition=(name,text)=>{const row=document.createElement('div');row.className='tl-condition';const strong=document.createElement('strong');strong.textContent=name;const span=document.createElement('span');span.textContent=text;row.append(strong,span);tracks.appendChild(row);};
  condition('INTRO / CAMERA', (doc.intro==='earth'?'Décollage planète':'Décollage court')+' · fond '+(doc.bg||'planète aléatoire')+' · zoom '+doc.zoom.start.toFixed(2)+' → '+doc.zoom.end.toFixed(2)+' en '+doc.zoom.seconds+' s'+(level.tuto?' (temps de partie).':' (selon progression).'));
  if(level.tuto){
    const t=doc.tutorial;
    condition('ETAPE 1 · BOUGER','N.O.R.M.A. « bouger » → '+t.steps.moveNeed+' px parcourus OU '+t.steps.maxMove+' s maximum.');
    condition('ETAPE 2 · SATELLITE',doc.timelineOnly?'Vagues manuelles actives ; apparitions pédagogiques automatiques désactivées.':'Après BOUGER : premier satellite lent ('+t.sats.hp+' PV, '+t.sats.slowSpeed+' px/s), puis cadence '+t.sats.spawnCdStart+' → '+t.sats.spawnCdEnd+' ms, plafond '+t.sats.capBase+' + '+t.sats.capExtra+'.');
    condition('DESTRUCTION SATELLITE','Chaque satellite détruit produit '+t.debris.min+'–'+t.debris.max+' débris, '+t.debris.dmg+' dégâts. Objectif : '+t.steps.satTarget+' satellites OU '+t.steps.maxShoot+' s maximum.');
    condition('ALERTE / ANTENNE-MERE','Après TIRER : N.O.R.M.A. + alarme, attente '+t.steps.bossWait+' s, puis boss à '+t.boss.hp+' PV.');
    condition('BOSS · PHASE 1','Tirs visés chaque '+t.boss.aimCd+' ms ; anneau chaque '+t.boss.ringCd+' ms. N.O.R.M.A. explique les premières attaques.');
    condition('BOSS · PHASE 2','Sous '+Math.round(t.boss.p2*100)+' % PV : pluie chaque '+t.boss.rainCd+' ms + tirs et anneaux.');
    condition('BOSS · PHASE 3','Sous '+Math.round(t.boss.p3*100)+' % PV : spirale chaque '+t.boss.spiralCd+' ms, tir visé '+t.boss.aimCd3+' ms.');
    condition('RAPPORT','Boss détruit → fin du tutoriel, finition et récompenses de paliers. Paramètres détaillés ci-dessous et dans le JSON.');
  }else{
    if(doc.type==='kill'||doc.type==='collect')condition('OBJECTIF CONDITIONNEL',JSON.stringify(doc.goal)+' → '+(doc.finalBoss?'boss '+doc.finalBoss:'victoire')+' ; date variable selon le joueur.');
    if(doc.finalBoss||doc.boss)condition('COMBAT DU BOSS','Phases, attaques et renforts pilotés par le module '+(doc.finalBoss||doc.boss)+'. Les transitions réellement jouées figurent dans le journal.');
    condition('ALEATOIRE', 'Trésorin : '+(doc.ambient.golden?'actif après 25 s, réarmement 45–80 s':'désactivé')+' ; petits événements : '+(doc.ambient.smallEvents?'actifs, selon menace, premier délai 20–35 s puis 30–60 s':'désactivés')+'.');
    condition('N.O.R.M.A. / MUSIQUE','Transmissions et musique du secteur, réactions au combat et au boss ; horaires dépendants de la partie.');
  }
}
