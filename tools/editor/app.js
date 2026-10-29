"use strict";
const TARGET_BUDGET = { 'w1-l1':0, 'w1-l2':55, 'w1-l3':95, 'w1-l4':130, 'w1-l5':190, 'w2-l1':270, 'w2-l2':350, 'w2-l3':420, 'w2-l4':500, 'w2-l5':650, 'w3-l1':750, 'w3-l2':850, 'w3-l3':950, 'w3-l4':1070, 'w3-l5':1290 };
const TARGET_WIN = { tuto:0.9, boss:0.55, normal:0.8 }, TOL = 0.12;
const $ = id=> document.getElementById(id);
const clone = o=> JSON.parse(JSON.stringify(o));
const GAME = location.origin;

const S = { levels:[], base:{}, defaults:null, ov:{ tuto:{}, levels:{} }, saved:'', sel:'w1-l1', ready:false, botReady:false, botRes:null, serverOk:null };
const frames = { play:$('playFrame'), bot:$('botFrame') };

function toast(t, err){ const e = $('toast'); e.textContent = t; e.classList.toggle('err', !!err); e.classList.add('show'); clearTimeout(e._t); e._t = setTimeout(()=> e.classList.remove('show'), 2600); }
function post(which, msg){ const w = frames[which].contentWindow; if (w) w.postMessage(Object.assign({ ssx:1 }, msg), GAME); }
const lvl = id=> S.levels.find(l=> l.id === id);

/* ---------- état : surcharges ---------- */
function pruneAll(o){ if (Array.isArray(o)) return; Object.keys(o).forEach(k=>{ if (o[k] && typeof o[k] === 'object'){ pruneAll(o[k]); if (!Array.isArray(o[k]) && !Object.keys(o[k]).length) delete o[k]; } }); }
const dirty = ()=> JSON.stringify(S.ov) !== S.saved;
function levelModified(id){ return !!(S.ov.levels[id] && Object.keys(S.ov.levels[id]).length) || (id === 'w1-tuto' && Object.keys(S.ov.tuto).length > 0); }
function refreshChrome(){
  $('btnSave').classList.toggle('dirty', dirty()); $('btnSave').textContent = dirty() ? 'Enregistrer les modifications' : 'Enregistré';
  $('draftStatus').textContent = dirty() ? 'Brouillon enregistré sur cet appareil' : 'Toutes les modifications sont enregistrées';
  $('draftStatus').classList.toggle('unsaved', dirty());
  $('btnUndo').disabled=!historyBack.length; $('btnRedo').disabled=!historyForward.length;
  document.querySelectorAll('.lv').forEach(e=> e.classList.toggle('mod', levelModified(e.dataset.id)));
}
/* validation (tools/editor/validator.js) : erreurs = ce que le serveur refuse (bloquent EXPORTER), avertissements = indicatifs. Jamais bloquant en cas de plantage du validateur. */
function validateOf(id){
  const cat = { eventCatalog:S.eventCatalog, tunablesCatalog:S.tunablesCatalog, mobCatalog:S.mobCatalog, bestiary:S.bestiary, decorCatalog:S.decorCatalog, musicCatalog:S.musicCatalog };
  return EditorValidator.validateLevel(editorLevelDocument(id), cat);
}
function refreshBanner(){
  try {
    const r=validateOf(S.sel), summary=$('validationSummary');
    summary.hidden=!r.errors.length; summary.textContent=r.errors.join(' • ');
    const b=$('valBanner'); if(b){ b.replaceChildren(); [...r.errors,...r.warnings].forEach((text,i)=>{const p=document.createElement('p');p.className=i<r.errors.length?'e':'w';p.textContent=text;b.appendChild(p);}); }
  } catch(e){ toast('Validation : '+e.message,true); }
}
const historyBack=[], historyForward=[];
let historySnapshot='', restoring=false, draftTimer=0;
function changed(){
  pruneAll(S.ov); S.ov.tuto ||= {}; S.ov.levels ||= {};
  const current=JSON.stringify(S.ov);
  if (!restoring && historySnapshot && current!==historySnapshot){historyBack.push({ov:historySnapshot,sel:S.sel});if(historyBack.length>100)historyBack.shift();historyForward.length=0;}
  historySnapshot=current;
  clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{localStorage.setItem('ssx_editor_draft_v1',JSON.stringify({base:S.documentFingerprint,ov:S.ov,sel:S.sel}));}catch(e){$('draftStatus').textContent='Stockage local indisponible';}},250);
  refreshChrome();refreshBanner();if(S.refreshTimeline)S.refreshTimeline();if(S.refreshSteps)S.refreshSteps();jsonRendered=false;if(currentView!=='settings')settingsRendered=false;
}
function travelHistory(back){
  const from=back?historyBack:historyForward,to=back?historyForward:historyBack;if(!from.length)return;
  to.push({ov:JSON.stringify(S.ov),sel:S.sel});const entry=from.pop();S.ov=JSON.parse(entry.ov);S.sel=entry.sel;
  restoring=true;changed();restoring=false;renderList();renderForm();
}
$('btnUndo').onclick=()=>travelHistory(true);$('btnRedo').onclick=()=>travelHistory(false);
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(S.ready)$('btnSave').click();return;}
  if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();travelHistory(!e.shiftKey);}
});
let currentView='composition', settingsRendered=false, jsonRendered=false;
function setView(view){
  currentView=view;if(view!=='composition')stopPreview();
  if(S.ready&&view==='settings'&&!settingsRendered){$('form').replaceChildren();const vb=document.createElement('div');vb.id='valBanner';vb.className='val';$('form').appendChild(vb);renderSteps($('form'),lvl(S.sel));renderScenarioControls($('form'),lvl(S.sel),()=>{});settingsRendered=true;}
  if(S.ready&&view==='json'&&!jsonRendered){$('jsonPanel').replaceChildren();renderLevelDocument($('jsonPanel'),lvl(S.sel));jsonRendered=true;} $('compositionPanel').hidden=view!=='composition';$('form').hidden=view!=='settings';$('jsonPanel').hidden=view!=='json';$('labPanel').hidden=view!=='lab';
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function stopPreview(){if(window.EditorPreview)EditorPreview.stop();else{post('play',{type:'pause-preview'});$('playPanel').hidden=true;$('btnStop').hidden=true;$('stageLabel').textContent='Placement initial';}}
$('btnStop').onclick=stopPreview;

/* ---------- liste des niveaux ---------- */
function renderList(){
  const list=$('list');list.replaceChildren();$('missionCount').textContent=S.levels.length;
  const select=document.createElement('select');select.setAttribute('aria-label','Choisir une mission');let world;
  S.levels.forEach(l=>{if(!world||world.label!==l.worldName){world=document.createElement('optgroup');world.label=l.worldName;select.appendChild(world);}const op=document.createElement('option');op.value=l.id;op.textContent=(l.tuto?'Tutoriel':String(l.num).padStart(2,'0'))+' — '+(editorLevelDocument(l.id).name||l.name);world.appendChild(op);});
  select.value=S.sel;select.onchange=()=>{stopPreview();S.sel=select.value;S.botRes=null;renderList();renderForm();renderResults();};list.appendChild(select);
  const note=document.createElement('p');note.className='mission-file';note.textContent=S.sel+'.json';list.appendChild(note);refreshChrome();
}

/* ---------- formulaire ---------- */
function section(title, open){ const d = document.createElement('details'); d.open = !!open; d.innerHTML = '<summary>' + title + '</summary><div class="body"></div>'; return d; }

function renderForm(){
  if(S.timelineDestroy)S.timelineDestroy();S.refreshTimeline=null;S.refreshSteps=null;
  const l=lvl(S.sel);if(!l)return;
  $('missionPath').textContent=l.worldName+' / '+(l.tuto?'Initiation':'Ordre '+String(l.num).padStart(2,'0'));
  $('missionTitle').textContent=l.name.charAt(0)+l.name.slice(1).toLowerCase();
  const doc=editorLevelDocument(S.sel);$('missionTitle').textContent=doc.name.charAt(0)+doc.name.slice(1).toLowerCase();$('missionMode').textContent=l.tuto?'Tutoriel':({survive:'Survie',kill:'Élimination',collect:'Collecte',boss:'Incident majeur'}[l.type]||l.type);
  $('form').replaceChildren();$('timelinePanel').replaceChildren();$('jsonPanel').replaceChildren();
  const vb=document.createElement('div');vb.id='valBanner';vb.className='val';$('form').appendChild(vb);
  settingsRendered=false;jsonRendered=false;renderTimeline($('timelinePanel'),l);refreshBanner();setView(currentView);
  $('budgetWrap').hidden=!!l.tuto;if(!l.tuto)$('budget').value=TARGET_BUDGET[l.id]||0;
}
function updateSum(){
  const w = $('sumWarn'); if (!w) return; const C = Object.assign({}, S.defaults.comp, S.ov.tuto.comp || {});
  const t = C.sats + C.boss + C.win + C.clean; w.textContent = t === 100 ? '' : 'Total des poids : ' + t + ' → ramené à 100 (' + (t <= 0 ? 'impossible : mets au moins un poids' : 'proportions conservées') + ')';
}

/* ---------- bot : résultats ---------- */
const avg = a=> a.length ? a.reduce((x, y)=> x + y, 0) / a.length : 0, fx = (v, n)=> (Math.round(v * Math.pow(10, n || 0)) / Math.pow(10, n || 0)).toString().replace('.', ',');
function renderResults(){
  const R = $('results'), r = S.botRes; if (!r || r.levelId !== S.sel){ R.style.display = 'none'; return; }
  const l = lvl(S.sel), res = r.results, n = res.length, wins = res.filter(x=> x.win).length, rate = wins / n;
  const tgt = l.tuto ? TARGET_WIN.tuto : (l.type === 'boss' ? TARGET_WIN.boss : TARGET_WIN.normal);
  const times = res.map(x=> x.time), hp = res.map(x=> x.minHp);
  let html = '<h4>RÉSULTAT · ' + n + ' PARTIES · ' + r.skill + '</h4><div class="big">' + Math.round(rate * 100) + '% <span style="font-size:16px;color:var(--dim)">de victoires (' + wins + '/' + n + ')</span></div>' +
    '<div class="bar"><i style="width:' + Math.round(rate * 100) + '%"></i><u style="left:' + Math.round((tgt - TOL) * 100) + '%;width:' + Math.round(2 * TOL * 100) + '%"></u></div>' +
    '<div class="kv"><span>Durée moyenne</span><b>' + fx(avg(times), 0) + ' s (' + fx(Math.min(...times), 0) + '–' + fx(Math.max(...times), 0) + ')</b></div>' +
    '<div class="kv"><span>PV mini atteint (moy.)</span><b>' + Math.round(avg(hp) * 100) + '%</b></div>';
  if (l.tuto){
    html += '<div class="kv"><span>Coups reçus (moy.)</span><b>' + fx(avg(res.map(x=> x.hits)), 1) + '</b></div><div class="kv"><span>Finition d\'une partie (moy.)</span><b>' + Math.round(avg(res.map(x=> x.pct))) + '%</b></div>';
    const ids = ['move', 'shoot', 'boss'], names = { move:'1 · bouger', shoot:'2 · tirer', boss:'3 · boss' };
    html += '<table style="margin-top:8px"><tr><th>Étape</th><th>début (s)</th><th>durée (s)</th></tr>' + ids.map((id, i)=>{
      const at = res.map(x=>{ const s = (x.steps || []).find(y=> y.id === id); return s ? s.at : null; }).filter(v=> v !== null);
      const nx = res.map(x=>{ const a = (x.steps || []).find(y=> y.id === id), b = (x.steps || []).find(y=> y.id === ids[i + 1]); return a && b ? b.at - a.at : (a && id === 'boss' ? x.time - a.at : null); }).filter(v=> v !== null);
      return '<tr><td>' + names[id] + '</td><td>' + (at.length ? fx(avg(at), 0) : '—') + '</td><td>' + (nx.length ? fx(avg(nx), 0) : '—') + '</td></tr>'; }).join('') + '</table>';
  } else html += '<div class="kv"><span>Ennemis tués (moy.)</span><b>' + fx(avg(res.map(x=> x.kills)), 0) + '</b></div><div class="kv"><span>Avancement si défaite</span><b>' + Math.round(avg(res.filter(x=> !x.win).map(x=> x.progress * 100)) || 0) + '%</b></div>';
  let cls = 'ok', msg = 'JUSTE : taux de victoire proche de la cible (' + Math.round(tgt * 100) + '%)';
  if (rate > tgt + TOL){ cls = 'easy'; msg = 'TROP FACILE pour ce profil (cible ' + Math.round(tgt * 100) + '%) → ' + (l.tuto ? 'baisse les PV du boss ou serre les cadences' : 'monte hpMul / dmgMul ou la menace'); }
  else if (rate < tgt - TOL){ cls = 'hard'; msg = 'TROP DUR pour ce profil (cible ' + Math.round(tgt * 100) + '%) → ' + (l.tuto ? 'monte la brèche de l\'anneau, baisse les dégâts ou les cadences' : 'baisse hpMul / dmgMul ou la menace'); }
  html += '<div class="verdict ' + cls + '">' + msg + '</div>';
  if (res.some(x=> x.timeout)) html += '<div class="verdict hard">' + res.filter(x=> x.timeout).length + ' partie(s) sans fin (temps dépassé)</div>';
  html += '<p style="color:var(--dim);font-size:15px;margin:8px 0 0">Le bot juge la difficulté relative, pas le plaisir : joue aussi toi-même (TESTER).</p>';
  R.innerHTML = html; R.style.display = '';
}

/* ---------- actions ---------- */
$('btnPlay').onclick = ()=>EditorPreview.play();
$('btnBot').onclick = ()=>{
  stopPreview();
  const l = lvl(S.sel); $('btnBot').disabled = true; $('botBar').style.display = ''; $('botBar').firstChild.style.width = '0';
  S.botCfg = { levelId:S.sel, skill:$('skill').value, seeds:+$('seeds').value };
  const msg={type:'bot',levelId:S.sel,overrides:S.ov,seeds:S.botCfg.seeds,skill:S.botCfg.skill,budget:l.tuto?0:+$('budget').value||0};
  if(S.botReady)post('bot',msg);else{S.pendingBot=msg;frames.bot.src='index.html?dev&edit=bot&sandbox=1';}
};
$('btnReset').onclick = ()=>{ if (!confirm('Remettre TOUS les réglages aux valeurs d\'origine ? (rien n\'est écrit tant que tu n\'exportes pas)')) return; S.ov = { tuto:{}, levels:{} }; changed(); renderForm(); };
$('btnSave').onclick = async ()=>{
  if(S.saving)return;
  try {
    const msg = EditorValidator.exportRefusal(S.levels.map(l=> ({ id:l.id, errors:validateOf(l.id).errors })));
    if (msg){ toast(msg, true); return; }
  } catch(e){ toast('Validation indisponible (' + e.message + ') : le serveur vérifiera à l\'export.', true); }
  const levels = Object.fromEntries(S.levels.map(l=> [l.id, editorLevelDocument(l.id)]));
  S.saving=true;$('btnSave').disabled=true;
  try {
    const r = await fetch('/__editor/levels', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({levels})});
    const j = await r.json(); if (!r.ok || !j.ok) throw new Error(j.error || 'export refusé');
    // Repartir des fichiers réellement enregistrés, en gardant les éventuelles saisies faites pendant la requête.
    const current=Object.fromEntries(S.levels.map(l=>[l.id,editorLevelDocument(l.id)]));
    S.documents=clone(levels);S.base=clone(levels);S.documentFingerprint=JSON.stringify(levels);S.ov={tuto:{},levels:{}};
    for(const id of Object.keys(current))if(JSON.stringify(current[id])!==JSON.stringify(levels[id]))S.ov.levels[id]=current[id];
    S.saved=JSON.stringify({tuto:{},levels:{}});historyBack.length=0;historyForward.length=0;historySnapshot=JSON.stringify(S.ov);
    post('play',{type:'rebase',documents:levels});if(S.botReady)post('bot',{type:'rebase',documents:levels});
    clearTimeout(draftTimer);try{localStorage.removeItem('ssx_editor_draft_v1');}catch(e){}changed();renderList();renderForm();if(window.EditorVersions)EditorVersions.saved(); toast(j.count + ' fichiers JSON enregistrés dans src/data/levels/');
  } catch(e){ toast('Export JSON : ' + e.message + ' — vérifiez le serveur local.', true); }
  finally {S.saving=false;$('btnSave').disabled=false;}
};
$('skill').onchange = $('seeds').onchange = ()=>{};
window.addEventListener('beforeunload', e=>{ if (dirty()){ e.preventDefault(); e.returnValue = ''; } });

function recordPreviewTrace(m){
  if (m.type === 'timeline-reset') $('timelineLog').replaceChildren();
  if (m.type === 'timeline-trace'){
    const log=$('timelineLog'); m.entries.forEach(e=>{const line=document.createElement('div');line.textContent=e.at+' s · '+e.label;log.prepend(line);});
    while(log.children.length>500)log.lastChild.remove();
  }
}

window.addEventListener('message', ev=>{
  if (ev.origin !== GAME || !ev.data || ev.data.ssx !== 1) return;
  const m = ev.data;
  if(window.EditorPreview&&EditorPreview.handleMessage(ev))return;
  if(ev.source!==frames.play.contentWindow&&ev.source!==frames.bot.contentWindow)return;
  recordPreviewTrace(m);
  if (m.type === 'ready' && m.mode === 'play'){
    S.documents = m.documents; S.eventCatalog = m.eventCatalog || []; S.bestiary = m.bestiary || []; S.decorCatalog = m.decorCatalog || []; S.musicCatalog = m.musicCatalog || { level:[], boss:[] }; S.tunablesCatalog = m.tunablesCatalog || {}; S.mobCatalog = m.mobCatalog || []; S.levels = m.levels; S.base = m.base; S.defaults = m.defaults; S.ov = clone(m.overrides || { tuto:{}, levels:{} }); S.ov.tuto = S.ov.tuto || {}; S.ov.levels = S.ov.levels || {}; S.saved = JSON.stringify(S.ov); S.documentFingerprint=JSON.stringify(S.documents); S.ready = true;
    try{const draft=JSON.parse(localStorage.getItem('ssx_editor_draft_v1'));if(draft && draft.base===S.documentFingerprint && draft.ov){S.ov=draft.ov;if(lvl(draft.sel))S.sel=draft.sel;}}catch(e){}
    historySnapshot=JSON.stringify(S.ov);
    if (!lvl(S.sel)) S.sel = S.levels[0].id;
    $('ph').textContent = 'Prêt';$('playPanel').hidden=true;$('btnBot').disabled=false; $('btnPlay').disabled = false; $('btnSave').disabled = false; $('btnReset').disabled = false;$('btnVersions').disabled=false;if(window.EditorPreview)EditorPreview.ready();
    renderList(); renderForm();
  } else if (m.type === 'ready' && m.mode === 'bot'){ S.botReady=true;if(S.pendingBot){post('bot',S.pendingBot);S.pendingBot=null;}else $('btnBot').disabled=false; }
  else if (m.type === 'bot-progress'){ $('botBar').firstChild.style.width = Math.round(m.done / m.total * 100) + '%'; }
  else if (m.type === 'bot-done'){ S.botRes = Object.assign({ levelId:m.levelId, results:m.results }, { skill:$('skill').selectedOptions[0].textContent }); $('btnBot').disabled = false; $('botBar').style.display = 'none'; renderResults(); }
  else if (m.type === 'apply-error') toast('Réglages refusés par le jeu : ' + m.error, true);
  else if (m.type === 'bot-error'){ $('btnBot').disabled = false; $('botBar').style.display = 'none'; toast('Bot : ' + m.error, true); }
});
$('list').addEventListener('input', ()=>{});
fetch('/__editor/ping').then(r=> r.json()).then(j=>{ if (!j.ok) throw 0; $('srv').textContent = 'Serveur local connecté'; $('srv').className = 'chip ok'; }).catch(()=>{ $('srv').textContent = 'Enregistrement indisponible'; $('srv').className = 'chip bad'; });
frames.play.src = 'index.html?dev&edit=play&sandbox=1';
// Le moteur du bot est chargé uniquement au premier test automatique.
