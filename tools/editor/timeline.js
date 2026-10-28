"use strict";
// Chronologie des arrivées : données exportées avec les réglages du niveau.
function renderTimeline(parent, level){
  const box = document.createElement('details'); box.open = true;
  box.className = 'timeline-editor';
  box.innerHTML = '<summary>TIMELINE DES ENNEMIS</summary><div class="body"></div>';
  parent.appendChild(box);
  const body = box.querySelector('.body');
  const catalog = S.bestiary || [];
  const source = (S.ov.levels[level.id] || {}).waves;
  let rows = clone(source === undefined ? ((S.base[level.id] || {}).waves || []) : source);
  let chosen = level.tuto ? 'sat' : (catalog[0] && catalog[0].type);
  const commit = ()=>{
    const ov = S.ov.levels[level.id] = S.ov.levels[level.id] || {};
    ov.waves = clone(rows); changed(); draw();
  };
  body.innerHTML = '<p class="sub">Sélectionnez un ennemi, puis cliquez dans sa piste pour programmer son arrivée. Déplacez un bloc pour changer son horaire. Temps en secondes de mission, après le décollage.</p>' +
    '<div class="opts"><label><input id="tlOnly" type="checkbox"> Remplacer les apparitions aléatoires</label></div>' +
    '<p class="sub">Les événements et les renforts des boss restent actifs. TESTER relance la mission avec cette timeline ; EXPORTER l’enregistre dans le jeu.</p>' +
    '<input class="tl-search" aria-label="Rechercher dans le bestiaire" placeholder="Rechercher un ennemi…"><div class="tl-catalog"></div>' +
    '<div class="opts tl-add"><label>Arrivée (s) <input id="tlAt" type="number" min="0" max="3600" step="0.5" value="5"></label>' +
    '<label>Quantité <input id="tlCount" type="number" min="1" max="100" step="1" value="3"></label>' +
    '<label>Intervalle (s) <input id="tlSpacing" type="number" min="0" max="60" step="0.1" value="0.5"></label>' +
    '<button class="btn" id="tlAdd">AJOUTER</button></div>' +
    '<div class="tl-scroll"><div class="tl-tracks"></div></div><div class="tl-warning"></div><div class="tl-rows"></div>';
  const only = body.querySelector('#tlOnly');
  only.checked = editorLevelDocument(level.id).timelineOnly === 1;
  only.onchange = ()=>{ (S.ov.levels[level.id] = S.ov.levels[level.id] || {}).timelineOnly = only.checked ? 1 : 0; changed(); draw(); };
  const number = id=> Number(body.querySelector('#'+id).value);
  const inputValid = ()=> ['tlAt','tlCount','tlSpacing'].every(id=> body.querySelector('#'+id).reportValidity() && body.querySelector('#'+id).value !== '');
  const add = at=>{
    if (!chosen || !inputValid()) return;
    rows.push({ type:chosen, at, count:number('tlCount'), spacing:number('tlSpacing') }); commit();
  };
  body.querySelector('#tlAdd').onclick = ()=> add(number('tlAt'));
  const renderCatalog = ()=>{
    const holder = body.querySelector('.tl-catalog'); holder.replaceChildren();
    const query = body.querySelector('.tl-search').value.toLowerCase();
    catalog.filter(e=> (e.label+' '+e.type).toLowerCase().includes(query)).forEach(e=>{
      const b = document.createElement('button'); b.className = 'tl-enemy' + (chosen === e.type ? ' selected' : '');
      b.type = 'button'; b.title = e.label; b.dataset.enemy = e.type;
      if (e.image){ const img = document.createElement('img'); img.src = e.image; img.alt = ''; b.appendChild(img); }
      b.appendChild(document.createTextNode(e.label));
      b.onclick = ()=>{ chosen = e.type; renderCatalog(); draw(); }; holder.appendChild(b);
    });
  };
  body.querySelector('.tl-search').oninput = renderCatalog;
  function draw(){
    const goal = Object.assign({}, (S.base[level.id] || {}).goal, (S.ov.levels[level.id] || {}).goal);
    const doc = editorLevelDocument(level.id);
    const poolEnd = doc.spawns.map(sp=> Math.max(0,sp.from-(doc.spawnClock==='difficulty'?12*(doc.threat-1):0))+15);
    const end = Math.max(60, ...poolEnd, goal.seconds || 0, ...editorLevelDocument(level.id).events.map(e=>e.at+(e.duration||15)), ...rows.map(r=> r.at+(r.count-1)*r.spacing+5));
    const duration = Math.ceil(end/10)*10, px = 8;
    const tracks = body.querySelector('.tl-tracks'); tracks.replaceChildren(); tracks.style.width = (140+duration*px)+'px';
    const ruler = document.createElement('div'); ruler.className = 'tl-ruler';
    for (let t=0;t<=duration;t+=10){ const mark = document.createElement('span'); mark.style.left=(140+t*px)+'px'; mark.textContent=t+' s'; ruler.appendChild(mark); }
    tracks.appendChild(ruler);
    const types = [...new Set([chosen, ...rows.map(r=>r.type)])].filter(Boolean);
    types.forEach(type=>{
      const lane = document.createElement('div'); lane.className='tl-lane';
      const title = document.createElement('strong'); title.textContent=(catalog.find(e=>e.type===type)||{label:type}).label; lane.appendChild(title);
      const rail = document.createElement('div'); rail.className='tl-rail'; rail.style.width=(duration*px)+'px'; lane.appendChild(rail);
      rail.onclick = e=>{ if (e.target!==rail) return; chosen=type; const at=Math.max(0,Math.min(3600,Math.round((e.clientX-rail.getBoundingClientRect().left)/px*2)/2)); body.querySelector('#tlAt').value=at; add(at); renderCatalog(); };
      rows.forEach((row, index)=>{
        if (row.type!==type) return;
        const chip = document.createElement('button'); chip.className='tl-block'; chip.textContent=row.count+' × '+row.at+' s'; chip.style.left=(row.at*px)+'px';
        chip.style.width=Math.max(70,(row.count-1)*row.spacing*px)+'px'; chip.title='Glisser pour déplacer ; réglages précis ci-dessous';
        chip.onpointerdown = e=>{
          e.preventDefault(); const startX=e.clientX, initial=row.at; chip.setPointerCapture(e.pointerId);
          chip.onpointermove = ev=>{ row.at=Math.max(0,Math.min(3600,Math.round((initial+(ev.clientX-startX)/px)*2)/2)); chip.style.left=(row.at*px)+'px'; chip.textContent=row.count+' × '+row.at+' s'; };
          chip.onpointerup = ()=>{ chip.onpointermove=null; commit(); };
          chip.onpointercancel = ()=>{ row.at=initial; draw(); };
        };
        rail.appendChild(chip);
      });
      tracks.appendChild(lane);
    });
    timelineScenarioTracks(tracks, level, duration, px);
    const warning = body.querySelector('.tl-warning');
    warning.textContent = level.type==='survive' && rows.some(r=>r.at+(r.count-1)*r.spacing>=goal.seconds) ? 'Attention : des arrivées sont prévues après la fin de l’objectif de survie ; elles ne se produiront que si la mission continue avec son boss.' : '';
    const list = body.querySelector('.tl-rows'); list.replaceChildren();
    if (!rows.length){ list.textContent='Aucune vague à heure fixe ajoutée. Les pools et événements existants figurent ci-dessus.'; return; }
    rows.map((row,index)=>({row,index})).sort((a,b)=>a.row.at-b.row.at).forEach(({row,index})=>{
      const line=document.createElement('div'); line.className='tl-row';
      const name=document.createElement('strong'); name.textContent=(catalog.find(e=>e.type===row.type)||{label:row.type}).label; line.appendChild(name);
      [['at','Arrivée (s)',0,3600,0.5],['count','Quantité',1,100,1],['spacing','Intervalle (s)',0,60,0.1]].forEach(([key,label,min,max,step])=>{
        const wrap=document.createElement('label'); wrap.textContent=label;
        const input=document.createElement('input'); input.type='number'; input.min=min; input.max=max; input.step=step; input.value=row[key]; input.required=true;
        input.onchange=()=>{ if (!input.reportValidity()) return; row[key]=Number(input.value); commit(); }; wrap.appendChild(input); line.appendChild(wrap);
      });
      const duplicate=document.createElement('button'); duplicate.className='btn'; duplicate.textContent='DUPLIQUER'; duplicate.onclick=()=>{ rows.push({...row,at:Math.min(3600,row.at+5)}); commit(); }; line.appendChild(duplicate);
      const remove=document.createElement('button'); remove.className='btn'; remove.textContent='SUPPRIMER'; remove.onclick=()=>{ rows.splice(index,1); commit(); }; line.appendChild(remove); list.appendChild(line);
    });
  }
  S.refreshTimeline=draw;
  renderCatalog(); draw();
  renderScenarioControls(body,level,draw);
}
