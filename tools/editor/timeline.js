"use strict";
// Composition : aucune boucle d'animation au repos. Un déplacement écrit une seule opération.
function renderTimeline(parent, level){
  const catalog=S.bestiary||[], images=new Map();
  let selection=null, chosen=level.tuto?'sat':(editorLevelDocument(level.id).spawns[0]||catalog[0]||{}).type, px=8, snap=0.5, cursor=0, showContext=true, disposed=false, drag=null, stageDrag=null, scrollFrame=0;
  const doc=()=>editorLevelDocument(level.id), rows=()=>doc().waves, label=type=>(catalog.find(e=>e.type===type)||{label:type}).label;
  const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const button=(text,fn,cls='btn')=>{const e=node('button',cls,text);e.type='button';e.onclick=fn;return e;};
  const format=t=>Math.floor(t/60).toString().padStart(2,'0')+':'+(t%60).toFixed(t%1?1:0).padStart(2,'0');
  const clampTime=t=>Math.max(0,Math.min(3600,Math.round(t/snap)*snap));
  const selected=()=>selection?doc()[selection.kind][selection.index]:null;
  const write=(kind,list)=>{(S.ov.levels[level.id]||={})[kind]=list;changed();};
  const patch=(key,value)=>{if(!selection)return;const list=doc()[selection.kind];list[selection.index][key]=value;write(selection.kind,list);};
  const choose=(kind,index)=>{selection={kind,index};if(kind==='waves')chosen=rows()[index].type;draw();inspect();};
  const add=(type,at)=>{if(rows().length>=1000){toast('Une mission accepte jusqu’à 1 000 vagues.',true);return;}const list=rows();list.push({type,at:clampTime(at),count:5,spacing:0,formation:'line',spread:180,x:50,y:20});selection={kind:'waves',index:list.length-1};chosen=type;write('waves',list);inspect();};
  function duplicate(){if(!selection)return;const list=doc()[selection.kind];if(selection.kind==='spawns'){toast('Modifiez la réserve existante dans l’inspecteur.');return;}if(list.length>=1000)return;list.push({...list[selection.index],at:Math.min(3600,list[selection.index].at+5)});selection={kind:selection.kind,index:list.length-1};write(selection.kind,list);inspect();}
  function remove(){if(!selection)return;const kind=selection.kind,list=doc()[kind];list.splice(selection.index,1);selection=null;write(kind,list);inspect();}
  parent.innerHTML='<div class="timeline-editor"><div class="timeline-heading"><div><h2>Timeline</h2><span class="timeline-summary"></span></div><div class="timeline-actions"></div></div><div class="timeline-toolbar"><div class="timeline-mode"></div><div class="timeline-zoom"></div></div><div class="tl-scroll" tabindex="0" aria-label="Timeline des vagues en secondes"><div class="tl-tracks"></div></div><div class="timeline-footer"><span class="timeline-hint">Glissez une créature ici · double-cliquez une piste pour ajouter</span><span class="timeline-time">00:00</span></div></div>';
  const scroll=parent.querySelector('.tl-scroll'),tracks=parent.querySelector('.tl-tracks');
  const actions=parent.querySelector('.timeline-actions');
  actions.appendChild(button('Ajouter une vague',()=>add(chosen,cursor),'btn small'));
  const mode=parent.querySelector('.timeline-mode'), only=node('label','toggle-control'),check=node('input');check.type='checkbox';check.checked=doc().timelineOnly===1;
  only.append(check,document.createTextNode('Vagues uniquement'));mode.appendChild(only);
  check.onchange=()=>{(S.ov.levels[level.id]||={}).timelineOnly=check.checked?1:0;changed();};
  mode.appendChild(button('Contexte',()=>{showContext=!showContext;draw();},'btn small context-toggle'));
  const zoom=parent.querySelector('.timeline-zoom'),snapLabel=node('label',null,'Magnétisme '),snapSelect=node('select');snapSelect.setAttribute('aria-label','Magnétisme de la timeline');
  [[0.5,'0,5 s'],[1,'1 s'],[5,'5 s']].forEach(([v,t])=>{const o=node('option',null,t);o.value=v;snapSelect.appendChild(o);});snapSelect.onchange=()=>snap=+snapSelect.value;snapLabel.appendChild(snapSelect);zoom.appendChild(snapLabel);
  zoom.append(button('−',()=>scale(px/1.5),'btn small zoom-button'),node('span','zoom-value','100 %'),button('+',()=>scale(px*1.5),'btn small zoom-button'));
  function scale(value){const center=(scroll.scrollLeft+scroll.clientWidth/2-128)/px;px=Math.max(2,Math.min(32,value));draw();scroll.scrollLeft=Math.max(0,128+center*px-scroll.clientWidth/2);parent.querySelector('.zoom-value').textContent=Math.round(px/8*100)+' %';}
  scroll.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;drawTracks();});},{passive:true});
  function duration(){const d=doc();return Math.min(9600,Math.ceil(Math.max(60,d.goal.seconds||0,...d.waves.map(r=>r.at+(r.count-1)*r.spacing+5),...d.events.map(e=>e.at+(e.duration||15)))/10)*10);}
  function selectTime(e,rail){cursor=clampTime((e.clientX-rail.getBoundingClientRect().left)/px);parent.querySelector('.timeline-time').textContent=format(cursor);const line=tracks.querySelector('.playhead');if(line)line.style.left=(128+cursor*px)+'px';}
  function railFor(name,kind){
    const lane=node('div','tl-lane'),title=node('strong',null,name),rail=node('div','tl-rail');lane.append(title,rail);tracks.appendChild(lane);rail.style.width=(duration()*px)+'px';rail.style.setProperty('--grid-step',10*px+'px');
    if(kind==='waves'){
      rail.ondragover=e=>{if(!e.dataTransfer.types.includes('application/x-ssx-enemy'))return;e.preventDefault();e.dataTransfer.dropEffect='copy';rail.classList.add('drop-active');};
      rail.ondragleave=()=>rail.classList.remove('drop-active');rail.ondrop=e=>{e.preventDefault();rail.classList.remove('drop-active');const type=e.dataTransfer.getData('application/x-ssx-enemy');if(!catalog.some(x=>x.type===type))return;selectTime(e,rail);add(type,cursor);};
      rail.ondblclick=e=>{if(e.target!==rail)return;selectTime(e,rail);add(chosen,cursor);};
    }
    rail.onclick=e=>{if(e.target===rail)selectTime(e,rail);};return rail;
  }
  function moveBlock(e,block,kind,index){
    if(e.button!==0)return;e.preventDefault();
    selection={kind,index};if(kind==='waves')chosen=rows()[index].type;inspect();
    tracks.querySelectorAll('.tl-block.selected').forEach(x=>x.classList.remove('selected'));block.classList.add('selected');
    const row=doc()[kind][index], key=kind==='spawns'?'from':'at';
    drag={start:e.clientX,initial:row[key],at:row[key],scroll:scroll.scrollLeft,kind,index,key};block.setPointerCapture(e.pointerId);block.classList.add('dragging');
    block.onpointermove=ev=>{
      if(!drag)return;drag.at=clampTime(drag.initial+(ev.clientX-drag.start+scroll.scrollLeft-drag.scroll)/px);block.style.transform='translateX('+((drag.at-drag.initial)*px)+'px)';parent.querySelector('.timeline-time').textContent=format(drag.at);
      const rect=scroll.getBoundingClientRect();if(ev.clientX>rect.right-30)scroll.scrollLeft+=12;else if(ev.clientX<rect.left+150)scroll.scrollLeft-=12;
    };
    block.onpointerup=()=>{if(!drag)return;const d=drag;drag=null;block.onpointermove=null;block.onpointerup=null;if(d.at!==d.initial){const list=doc()[d.kind];list[d.index][d.key]=d.at;write(d.kind,list);}else draw();inspect();};
    block.onpointercancel=()=>{drag=null;draw();inspect();};
  }
  function drawTracks(){
    if(disposed||drag)return;tracks.replaceChildren();
    const d=doc(),end=duration(),width=128+end*px;tracks.style.width=width+'px';
    const ruler=node('div','tl-ruler'),rulerTitle=node('strong',null,'Mission / secondes');ruler.appendChild(rulerTitle);
    const step=px<4?30:10,left=scroll.scrollLeft,right=left+scroll.clientWidth;
    for(let t=0;t<=end;t+=step){const x=128+t*px;if(x<left-50||x>right+80)continue;const mark=node('span',null,format(t));mark.style.left=x+'px';ruler.appendChild(mark);}
    ruler.onclick=e=>{if(e.target===rulerTitle)return;cursor=clampTime((e.clientX-ruler.getBoundingClientRect().left-128)/px);drawTracks();parent.querySelector('.timeline-time').textContent=format(cursor);};tracks.appendChild(ruler);
    const types=[...new Set([...d.waves.map(r=>r.type),chosen])].filter(Boolean);
    types.forEach(type=>{
      const rail=railFor(label(type),'waves'),ends=[];
      d.waves.map((r,index)=>({r,index})).filter(x=>x.r.type===type).sort((a,b)=>a.r.at-b.r.at).forEach(({r,index})=>{
        const x=r.at*px,w=Math.max(112,(r.count-1)*r.spacing*px+32);let sub=ends.findIndex(end=>end<=x-6);if(sub<0)sub=ends.length;ends[sub]=x+w;
        if(128+x+w<left-100||128+x>right+120)return;
        const block=node('button','tl-block'+(selection&&selection.kind==='waves'&&selection.index===index?' selected':''));block.dataset.wave=index;block.type='button';
        block.append(node('span','block-count',String(r.count)),node('span','block-text',WavePatterns.formations[r.formation||'random']),node('small',null,format(r.at)));
        block.style.cssText='left:'+x+'px;width:'+w+'px;top:'+(8+sub*42)+'px';block.title=label(type)+' · '+r.count+' créatures · '+r.at+' s';block.setAttribute('aria-label',block.title);block.onpointerdown=e=>moveBlock(e,block,'waves',index);block.onclick=()=>{};block.onkeydown=e=>{if(e.key==='Enter'){choose('waves',index);}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selection={kind:'waves',index};patch('at',clampTime(r.at+(e.key==='ArrowRight'?snap:-snap)));inspect();}};rail.appendChild(block);
      });rail.style.height=Math.max(58,ends.length*42+16)+'px';
    });
    if(showContext){
      if(d.spawns.length){const rail=railFor('Réserve aléatoire','spawns');d.spawns.forEach((r,index)=>{const at=Math.max(0,r.from-(d.spawnClock==='difficulty'?12*(d.threat-1):0));const block=node('button','tl-block tl-system pool-block'+(d.timelineOnly?' muted':''),label(r.type)+' · poids '+r.w);block.style.cssText='left:'+at*px+'px;top:'+(8+index*32)+'px;width:'+Math.max(120,(end-at)*px)+'px';block.onclick=()=>choose('spawns',index);rail.appendChild(block);});rail.style.height=(d.spawns.length*32+16)+'px';}
      if(d.events.length){const rail=railFor('Événements','events');d.events.forEach((r,index)=>{const name=(S.eventCatalog.find(x=>x.id===r.kind)||{name:r.kind}).name;const block=node('button','tl-block tl-system event-block',name);block.dataset.event=index;block.style.cssText='left:'+r.at*px+'px;top:'+(8+index*36)+'px;width:'+Math.max(120,(r.duration||12)*px)+'px';block.onpointerdown=e=>moveBlock(e,block,'events',index);rail.appendChild(block);});rail.style.height=(d.events.length*36+16)+'px';}
      if(d.type==='survive'){const rail=railFor('Objectif','goal');const mark=node('div','goal-marker',format(d.goal.seconds)+' · '+(d.finalBoss?'Boss final':'Fin de mission'));mark.style.left=d.goal.seconds*px+'px';rail.appendChild(mark);}
    }
    const head=node('div','playhead');head.style.left=(128+cursor*px)+'px';tracks.appendChild(head);
    if(!d.waves.length){const empty=node('div','timeline-empty','Déposez une créature dans sa piste pour créer une vague.');tracks.querySelector('.tl-rail')?.appendChild(empty);}
  }
  function draw(){
    if(disposed)return;const d=doc();check.checked=d.timelineOnly===1;
    parent.querySelector('.timeline-summary').textContent=d.waves.length+' vague'+(d.waves.length===1?'':'s')+' · '+d.waves.reduce((n,r)=>n+r.count,0)+' créatures programmées';
    drawTracks();drawStage();
  }
  function library(){
    const root=$('library');root.innerHTML='<div class="library-heading"><h2>Créatures</h2><span>'+catalog.length+'</span></div><p class="library-hint">Glissez une créature sur la timeline.</p><input class="tl-search" type="search" aria-label="Rechercher une créature" placeholder="Rechercher une créature…"><div class="tl-catalog"></div>';
    const holder=root.querySelector('.tl-catalog');
    const filter=()=>{const q=root.querySelector('input').value.toLocaleLowerCase('fr');holder.replaceChildren();catalog.filter(e=>(e.label+' '+e.type).toLocaleLowerCase('fr').includes(q)).forEach(e=>{
      const b=node('button','tl-enemy'+(chosen===e.type?' selected':''));b.type='button';b.dataset.enemy=e.type;b.draggable=true;
      if(e.image){const img=node('img');img.src=e.image;img.alt='';b.appendChild(img);}const copy=node('span','enemy-copy');copy.append(node('strong',null,e.label.charAt(0)+e.label.slice(1).toLowerCase()),node('small',null,e.type));b.append(copy,node('span','drag-grip','⠿'));
      b.onclick=()=>{chosen=e.type;selection=null;holder.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');draw();inspect();};b.ondragstart=ev=>{chosen=e.type;ev.dataTransfer.setData('application/x-ssx-enemy',e.type);ev.dataTransfer.effectAllowed='copy';};holder.appendChild(b);
    });if(!holder.children.length)holder.appendChild(node('p','empty-search','Aucune créature trouvée.'));};root.querySelector('input').oninput=filter;filter();
  }
  function inspect(){
    const holder=$('inspector');holder.replaceChildren();const r=selected(),kind=selection&&selection.kind;
    const heading=node('div','inspector-heading');heading.append(node('span',null,'Inspecteur'),node('span','selection-badge',r?(kind==='waves'?'Vague sélectionnée':kind==='events'?'Événement':'Réserve'):'Nouvelle vague'));holder.appendChild(heading);
    const content=node('div','inspector-content');holder.appendChild(content);
    const title=node('div','inspector-title');const type=r&&kind!=='events'?r.type:chosen,entry=catalog.find(x=>x.type===type);
    if(kind!=='events'&&entry&&entry.image){const img=node('img');img.src=entry.image;img.alt='';title.appendChild(img);}
    title.appendChild(node('h2',null,r&&kind==='events'?(S.eventCatalog.find(e=>e.id===r.kind)||{name:r.kind}).name:label(type)));content.appendChild(title);
    const group=text=>{const g=node('div','inspector-group');g.appendChild(node('h3',null,text));content.appendChild(g);return g;};
    const field=(parent,key,text,value,min,max,step=1,help)=>{const wrap=node('label','property-field'),caption=node('span',null,text),input=node('input');input.type='number';input.value=value;input.min=min;input.max=max;input.step=step;input.required=true;input.dataset.field=key;wrap.append(caption,input);if(help)wrap.appendChild(node('small',null,help));input.onchange=()=>{if(!input.reportValidity())return;patch(key,+input.value);inspect();};parent.appendChild(wrap);};
    if(!r){content.append(node('p','inspector-note','Choisissez un instant sur la timeline, puis ajoutez la créature. Vous pourrez régler sa formation et sa puissance.'),button('Ajouter à '+format(cursor),()=>add(chosen,cursor),'btn save full'));drawStage();return;}
    const when=group(kind==='spawns'?'Disponibilité':'Programmation');
    field(when,kind==='spawns'?'from':'at',kind==='spawns'?'Activation (s)':'Arrivée (s)',r.at??r.from,kind==='spawns'?-1:0,3600,0.5);
    if(kind==='waves'){
      field(when,'count','Quantité',r.count,1,100);field(when,'spacing','Intervalle entre unités (s)',r.spacing,0,60,0.1);
      const shape=group('Disposition'),choices=node('div','formation-choices');shape.appendChild(choices);
      Object.entries(WavePatterns.formations).forEach(([value,text])=>{const b=button(text,()=>{patch('formation',value);inspect();},'formation-option'+((r.formation||'random')===value?' active':''));b.dataset.formation=value;b.setAttribute('aria-pressed',String((r.formation||'random')===value));const glyph=node('span','formation-glyph '+value);b.prepend(glyph);choices.appendChild(b);});
      field(shape,'spread','Étendue (px)',r.spread??160,24,300,1);field(shape,'x','Position horizontale (%)',r.x??50,0,100,1);field(shape,'y','Position verticale (%)',r.y??0,0,80,1);
      const behavior=group('Alerte et comportement');
      const alertLabel=node('label','property-field');alertLabel.appendChild(node('span',null,'Alerte de la créature'));const alert=node('select');alert.dataset.field='alert';
      const inherit=node('option',null,'Hériter de la mission ('+doc().threat+')');inherit.value='';alert.appendChild(inherit);for(let i=1;i<=20;i++){const o=node('option',null,'Alerte '+i);o.value=i;alert.appendChild(o);}alert.value=r.alert??'';alert.onchange=()=>{const list=rows();if(alert.value==='')delete list[selection.index].alert;else list[selection.index].alert=+alert.value;write('waves',list);inspect();};alertLabel.appendChild(alert);behavior.appendChild(alertLabel);
      field(behavior,'minAlert','Seuil d’alerte d’apparition',r.minAlert??1,1,20,1,'La vague attend ce palier si la mission ne l’a pas encore atteint.');
      if(['bras','pilleur','eclaireur'].includes(r.type))field(behavior,'tier','Intelligence',r.tier??1,1,4);
      const stats=group('Puissance de cette vague');field(stats,'hpMul','PV ×',r.hpMul??1,0.1,10,0.1);field(stats,'dmgMul','Dégâts ×',r.dmgMul??1,0.1,10,0.1);field(stats,'speedMul','Vitesse initiale ×',r.speedMul??1,0.1,10,0.1);
      const st=S.mobCatalog.find(e=>e.type===r.type);if(st){const hp=st.hp*(doc().mobs?.[r.type]?.hpMul||1)*(doc().hpMul||1)*(r.hpMul||1)*(1+Math.floor(r.at/20)*0.2)*(1+Math.max(0,(r.alert||doc().threat)-4)*0.15);stats.appendChild(node('p','inspector-note',Math.round(hp)+' PV estimés par créature à l’arrivée. Les réglages de mission se cumulent avec ceux de la vague.'));}
      if(r.minAlert>doc().threat)content.appendChild(node('p','inspector-warning','Cette mission reste à l’alerte '+doc().threat+' : cette vague attendra et ne pourra pas apparaître.'));
      if(level.tuto&&r.type==='sat')content.appendChild(node('p','inspector-note','Satellite pédagogique : ses dégâts et son déplacement suivent les règles du tutoriel.'));
    }else if(kind==='events')field(when,'duration','Durée (s)',r.duration||15,0.1,600,0.1,'L’événement attend la fin du boss ou un emplacement libre.');
    else{field(when,'w','Poids de tirage',r.w,0.01,1000,0.1);if(['bras','pilleur','eclaireur'].includes(r.type))field(when,'tier','Intelligence',r.tier||1,1,4);content.appendChild(node('p','inspector-note','La réserve produit des apparitions aléatoires. Activez « Vagues uniquement » pour un déroulement entièrement programmé.'));}
    const ops=node('div','inspector-operations');if(kind!=='spawns')ops.appendChild(button('Dupliquer',duplicate));ops.appendChild(button('Supprimer',remove,'btn danger'));content.appendChild(ops);drawStage();
  }
  function drawStage(){
    const canvas=$('formationCanvas'),ctx=canvas.getContext('2d'),r=selected(),d=doc(),wave=stageDrag||(r&&selection.kind==='waves'?r:{type:chosen,count:5,formation:'line',spread:180,x:50,y:20});
    ctx.clearRect(0,0,400,700);ctx.fillStyle='#111b24';ctx.fillRect(0,0,400,700);ctx.strokeStyle='#253640';ctx.lineWidth=1;
    for(let x=20;x<400;x+=40)for(let y=30;y<700;y+=40){ctx.fillStyle='#33444d';ctx.fillRect(x,y,1.5,1.5);}
    ctx.strokeStyle='#48616a';ctx.setLineDash([5,6]);ctx.strokeRect(18,20,364,660);ctx.setLineDash([]);
    const x0=(wave.x??50)*4,y0=(wave.y??0)*7;ctx.strokeStyle='#36545b';ctx.beginPath();ctx.moveTo(x0,20);ctx.lineTo(x0,680);ctx.moveTo(18,y0);ctx.lineTo(382,y0);ctx.stroke();
    const e=catalog.find(x=>x.type===wave.type);let img=images.get(wave.type);if(!img&&e?.image){img=new Image();images.set(wave.type,img);img.onload=()=>{if(!disposed)drawStage();};img.src=e.image;}
    for(let i=0;i<wave.count;i++){const p=WavePatterns.point(wave,i),x=Math.max(25,Math.min(375,x0+p.dx)),y=Math.max(30,Math.min(650,y0+p.dy));ctx.strokeStyle='#7ebba6';ctx.strokeRect(x-19,y-19,38,38);if(img?.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x-16,y-16,32,32);}else{ctx.fillStyle='#9cdbc1';ctx.fillRect(x-5,y-5,10,10);}}
    // Repère joueur, pour situer l'entrée de la formation.
    ctx.strokeStyle='#607785';ctx.beginPath();ctx.moveTo(200,580);ctx.lineTo(187,605);ctx.lineTo(200,600);ctx.lineTo(213,605);ctx.closePath();ctx.stroke();ctx.font='12px system-ui';ctx.fillStyle='#718996';ctx.textAlign='center';ctx.fillText('JOUEUR',200,628);
    $('stageTitle').textContent=r&&selection.kind==='waves'?label(r.type).charAt(0)+label(r.type).slice(1).toLowerCase():'Composez la prochaine arrivée.';
    $('stageHint').textContent=r&&selection.kind==='waves'?r.count+' créatures en '+WavePatterns.formations[r.formation||'random'].toLowerCase()+', à '+format(r.at)+'.':'Glissez une créature depuis la bibliothèque, puis réglez sa vague dans l’inspecteur.';
    const stats=$('stageStats');stats.replaceChildren();[[d.waves.length,'vagues'],[d.waves.reduce((n,r)=>n+r.count,0),'créatures'],[d.threat,'alerte mission']].forEach(([v,t])=>{const cell=node('div');cell.append(node('strong',null,v),node('span',null,t));stats.appendChild(cell);});
  }
  const keydown=e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||!selection||currentView!=='composition')return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicate();}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();}if(e.key==='Escape'){selection=null;draw();inspect();}};
  document.addEventListener('keydown',keydown);
  const canvas=$('formationCanvas');canvas.onpointerdown=e=>{
    const r=selected();if(!r||selection.kind!=='waves'||(r.formation||'random')==='random')return;
    e.preventDefault();canvas.setPointerCapture(e.pointerId);const rect=canvas.getBoundingClientRect(),initial={x:r.x??50,y:r.y??0},start={x:e.clientX,y:e.clientY};let value={...initial};
    canvas.onpointermove=ev=>{value={x:Math.round(Math.max(0,Math.min(100,initial.x+(ev.clientX-start.x)/rect.width*100))),y:Math.round(Math.max(0,Math.min(80,initial.y+(ev.clientY-start.y)/rect.height*100)))};stageDrag={...r,...value};drawStage();};
    const finish=cancel=>{canvas.onpointermove=null;canvas.onpointerup=null;canvas.onpointercancel=null;stageDrag=null;drawStage();if(!cancel&&(value.x!==initial.x||value.y!==initial.y)){const list=rows();Object.assign(list[selection.index],value);write('waves',list);inspect();}};
    canvas.onpointerup=()=>finish(false);canvas.onpointercancel=()=>finish(true);
  };
  S.refreshTimeline=()=>{if(selection&&!selected())selection=null;draw();};
  S.timelineDestroy=()=>{disposed=true;document.removeEventListener('keydown',keydown);cancelAnimationFrame(scrollFrame);canvas.onpointerdown=null;canvas.onpointermove=null;canvas.onpointerup=null;canvas.onpointercancel=null;};
  library();draw();inspect();
}
