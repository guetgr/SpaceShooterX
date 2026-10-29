"use strict";
// Laboratoire de test des niveaux (docs/superpowers/specs/2026-10-29-laboratoire-de-test-design.md). Réservé au serveur local (tools/serve.py).
//  - accueil normal : un bouton LABORATOIRE (si /__editor/ping répond) ouvre l'accueil en mode ?lab (sauvegarde EN MÉMOIRE, voir boot.js) ;
//  - ?lab : un écran choisit le niveau (version publiée ou de l'historique de l'éditeur), l'équipement (atelier, technologies) et affiche le budget de composants ;
//  - chaque partie est envoyée à /__lab/runs (fichier .editor-history/lab-runs.jsonl), lu par l'éditeur (tools/editor/lab-runs.js).
(function(){
  const q = new URLSearchParams(location.search);
  if (q.has('edit')) return;
  const LAB = q.has('lab');
  const EMBED = LAB && q.has('embed') && window.parent !== window;          // intégré à l'éditeur (onglet Laboratoire de editor.html) : niveau choisi par l'éditeur, version « brouillon » possible
  const RUNS = '/__lab/runs', VERSIONS = '/__editor/versions';
  const BAYS = 5;
  const HEAVY = ()=> COMP.heavyTypes;
  const money = n=> Math.round(n) + ' ◆';

  const h = (tag, attrs, ...kids)=>{
    const e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(k=>{ if (k === 'class') e.className = attrs[k]; else if (k.slice(0, 2) === 'on') e[k] = attrs[k]; else if (attrs[k] !== false && attrs[k] !== undefined) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]); });
    kids.flat().forEach(k=> { if (k !== null && k !== undefined && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k))); });
    return e;
  };
  const json = async (url, body)=>{
    const r = await fetch(url, body ? { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) } : {});
    let o = null; try { o = await r.json(); } catch(e){ throw new Error('pas de serveur local (réponse non JSON)'); }
    if (!r.ok || !o.ok) throw new Error(o.error || 'erreur serveur'); return o;
  };
  // Sans serveur local (site en ligne) : les parties restent dans le navigateur (vrai localStorage, hors sauvegarde en mémoire), sans passer par l'éditeur.
  let serverOk = false;
  const LS_RUNS = 'ssx_lab_runs_v1';
  const lsRuns = ()=> { try { const a = JSON.parse(window.__realLS.getItem(LS_RUNS) || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; } };
  const lsAdd = run=> { try { window.__realLS.setItem(LS_RUNS, JSON.stringify(lsRuns().concat(run).slice(-500))); } catch(e){ /* ignore */ } };
  // brouillon du niveau en cours d'édition : demandé à l'éditeur (page parente, même origine) au moment du lancement
  let draftWait = null;
  const getDraft = levelId=> new Promise(res=>{
    const t = setTimeout(()=> res(null), 1500);
    draftWait = d=> { clearTimeout(t); res(d); };
    window.parent.postMessage({ ssx:1, type:'lab-need-draft', levelId }, location.origin);
  });
  const VERSION_KINDS = { manual:'Point nommé', saved:'Enregistrement', initial:'Version initiale', 'before-save':'État précédent', 'before-restore':'Avant restauration' };          // mêmes libellés que l'historique de l'éditeur
  const hash = s=>{ let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return (x >>> 0).toString(16); };
  const allLevels = ()=> WORLDS.reduce((a, w)=> a.concat(w.levels), []);

  // ---------------------------------------------------------------- budget et coût
  // fourchette de composants ◆ qu'un ordre peut rapporter (règles : data/composants.js). min = vagues garanties (petits ennemis au taux de lâcher), boss et prime ;
  // max = tous les ennemis lâchent, réserves tirées au hasard comprises (nombre estimé d'après la durée et le rythme d'apparition de difficulty.js).
  function levelRange(l){
    if (l.tuto) return { min:0, max:0 };
    let min = 0, max = 0;
    const heavy = COMP.heavySmall*COMP.smallValue;
    (l.waves || []).forEach(w=>{
      const n = w.count || 1;
      if (HEAVY().indexOf(w.type) >= 0){ min += n*heavy; max += n*heavy; } else { min += n*COMP.dropChance*COMP.smallValue; max += n*COMP.smallValue; }
    });
    if (l.timelineOnly !== 1 && l.spawns && l.spawns.length){
      const T = levelBossAt(l), a = l.threat || 1;
      let n = 0; for (let t = 0; t < T; t++){ const iv = Math.min(1300, Math.max(Math.max(120, 320*(1 - 0.05*(a - 1))), (1300 - t*4 - Math.floor(t/20)*30)*Math.max(0.3, 1 - 0.06*(a - 1)))); n += 1000/iv; }
      const ws = l.spawns.reduce((s, e)=> s + (e.w || 1), 0) || 1;
      max += n*l.spawns.reduce((s, e)=> s + (e.w || 1)*(HEAVY().indexOf(e.type) >= 0 ? heavy : COMP.smallValue), 0)/ws;
    }
    const big = l.finalBoss === 'pdg' ? COMP.bossBig : l.finalBoss ? COMP.miniBossBig : l.boss ? COMP.bossBig : 0;
    const prime = composantsPrime(l.reward || { clear:0, first:0 }, true);
    return { min:Math.round(min + big*COMP.bigValue + prime), max:Math.round(max + big*COMP.bigValue + prime) };
  }
  // budget avant l'ordre `idx` : somme des ordres précédents — moyenne des parties test réelles (abandons exclus) sinon milieu de la fourchette calculée
  function budgetBefore(levels, idx, runs){
    const rows = []; let min = 0, max = 0, mid = 0;
    levels.slice(0, idx).forEach(l=>{
      const real = runs.filter(r=> r.levelId === l.id && r.outcome !== 'abandon');
      let lo, hi, val, src;
      if (real.length){ val = lo = hi = real.reduce((s, r)=> s + (r.composants || 0), 0)/real.length; src = 'réel · moyenne de ' + real.length + ' partie' + (real.length > 1 ? 's' : ''); }
      else { const r = levelRange(l); lo = r.min; hi = r.max; val = (lo + hi)/2; src = 'calculé · ' + lo + ' à ' + hi; }
      min += lo; max += hi; mid += val; rows.push({ name:l.name, id:l.id, val, src });
    });
    return { rows, min:Math.round(min), max:Math.round(max), mid:Math.round(mid) };
  }
  // coût cumulé en ◆ (et pièces de secteur) pour atteindre cet équipement depuis la camionnette de base
  // technologie débloquée = prototype financé (ou déjà montée / emportée) ; le coût est CUMULÉ : prototype, puis rang 1, rang 2… rang n, puis spécialisation
  const techOwned = (eq, id)=> { const e = eq.techs[id] || {}; return !!(e.proto || e.rang > 0 || e.spe || eq.load.indexOf(id) >= 0); };
  function techCost(eq, id){
    const out = { c:0, pieces:{} }; if (!techOwned(eq, id)) return out;
    const e = eq.techs[id] || {};
    out.c += rdNextCost(id, 'proto').composants;
    for (let r = 0; r < (e.rang || 0); r++) out.c += rdNextCost(id, 'rang', r).composants;
    if (e.spe){ const sp = rdNextCost(id, 'spe'); out.c += sp.composants; Object.keys(sp.pieces || {}).forEach(k=>{ out.pieces[k] = (out.pieces[k] || 0) + sp.pieces[k]; }); }
    return out;
  }
  function equipCost(eq){
    let c = 0; const pieces = {};
    const addP = p=> { if (p) Object.keys(p).forEach(k=>{ pieces[k] = (pieces[k] || 0) + p[k]; }); };
    ATELIER_POSTS.forEach(p=>{ for (let i = 0; i < (eq.atelier[p.id] || 0); i++){ c += ATELIER_COSTS[i]; addP(ATELIER_PIECES[i]); } });
    Object.keys(TECH_BY_ID).forEach(id=>{ const t = techCost(eq, id); c += t.c; addP(t.pieces); });
    return { c, pieces };
  }
  function buildMeta(eq){
    const m = defaultMeta();
    ATELIER_POSTS.forEach(p=>{ m.atelier[p.id] = eq.atelier[p.id] || 0; });
    Object.keys(TECH_BY_ID).forEach(id=>{
      const e = eq.techs[id] || {};
      if (techOwned(eq, id)) m.rd[id] = { plan:true, proto:true, rang:e.rang || 0, spe:!!e.spe };
    });
    m.chargement = eq.load.slice();
    return m;
  }
  function equipText(eq){
    const a = ATELIER_POSTS.filter(p=> eq.atelier[p.id] > 0).map(p=> p.name + ' MK ' + ROMAN[eq.atelier[p.id]]);
    const t = Object.keys(TECH_BY_ID).filter(id=> techOwned(eq, id)).map(id=>{
      const e = eq.techs[id] || {}; return TECH_BY_ID[id].name + ' r' + (e.rang || 0) + (e.spe ? ' +SPE' : '') + (eq.load.indexOf(id) >= 0 ? ' [emporté]' : '');
    });
    return a.concat(t).join(' · ') || 'camionnette de base';
  }
  const emptyEquip = ()=> ({ atelier:{}, techs:{}, load:[] });

  // ---------------------------------------------------------------- enregistrement des parties (mode ?lab)
  function hookGame(){
    const P = GameScene.prototype;
    const oCreate = P.create;
    P.create = function(data){
      if (window.__labCtx) { try { localStorage.removeItem('ssx_worlds_v1'); } catch(e){ /* ignore */ } }          // chaque partie compte comme une première validation (prime comprise)
      const r = oCreate.call(this, data);
      if (window.__labCtx){ if (ui) ui.launching = false; this._lab = { taken:0, c0:getMeta().composants, done:false }; }
      return r;
    };
    const oDmg = P.damagePlayer;
    P.damagePlayer = function(a){
      const L = this._lab; if (!L) return oDmg.call(this, a);
      const t0 = (this.hp || 0) + (this.shield || 0) + (this.odShield || 0), r = oDmg.call(this, a);
      const lost = t0 - ((this.hp || 0) + (this.shield || 0) + (this.odShield || 0)); if (lost > 0) L.taken += lost;
      return r;
    };
    const oEnd = P.endRun;
    P.endRun = function(victory, abandon){ const r = oEnd.call(this, victory, abandon); if (!this.tuto) record(this, victory ? 'victoire' : (abandon ? 'abandon' : 'defaite')); return r; };
    const oTuto = P.tutoShowEnd;
    P.tutoShowEnd = function(victory){ const r = oTuto.call(this, victory); record(this, victory ? 'victoire' : 'defaite'); return r; };
  }
  function record(sc, outcome){
    const L = sc._lab, ctx = window.__labCtx; if (!L || L.done || !ctx) return;
    L.done = true;
    let cards = []; try { cards = sc.pauseGearItems().map(i=> i.name + (i.count > 1 ? ' x' + i.count : '')); } catch(e){ /* ignore */ }
    const run = {
      levelId:ctx.levelId, levelName:ctx.levelName, version:ctx.version, outcome,
      elapsed:Math.round(sc.tuto ? (sc.tutoT || sc.elapsed || 0) : (sc.elapsed || 0)), hp:Math.max(0, Math.round(sc.hp || 0)), maxHp:Math.round(sc.stats.maxHp),
      taken:Math.round(L.taken), dealt:Math.round(sc.runDamage || 0), kills:sc.runKills || 0, composants:getMeta().composants - L.c0,
      at:Date.now(), cards, equip:ctx.equip, equipText:equipText(ctx.equip), cost:ctx.cost, budget:ctx.budget,
    };
    const saved = serverOk ? json(RUNS, { run }) : Promise.resolve(lsAdd(Object.assign(run, { id:String(run.at) })));
    saved.then(()=> { if (ui) ui.runs.push(run); if (EMBED) window.parent.postMessage({ ssx:1, type:'lab-run' }, location.origin); toast(serverOk ? 'Partie enregistrée' : 'Partie enregistrée dans ce navigateur'); }).catch(e=> toast('Enregistrement impossible : ' + e.message));
  }

  // ---------------------------------------------------------------- écran du laboratoire
  let ui = null, toastEl = null;
  function toast(t){
    if (!toastEl){ toastEl = h('div', { class:'lab-toast' }); document.body.append(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toastEl._t); toastEl._t = setTimeout(()=> toastEl.classList.remove('show'), 2400);
  }
  const CSS = `
  .lab-btn{position:fixed;left:8px;top:8px;z-index:9000;font:11px/1 monospace;letter-spacing:1px;color:#9fe3c3;background:#0a1512cc;border:1px solid #2f5a49;padding:10px 12px;cursor:pointer;display:none}
  .lab-btn.on{display:block}
  .lab-root{position:fixed;inset:0;z-index:60000;background:#070a09;color:#d9e3dc;font:13px/1.45 monospace;overflow:auto;-webkit-overflow-scrolling:touch;display:none}
  .lab-root.on{display:block}
  .lab-in{max-width:860px;margin:0 auto;padding:8px 10px 110px}
  .lab-in h1{font-size:15px;letter-spacing:2px;margin:0;color:#9fe3c3}
  .lab-in p,.lab-note{color:#8fa399;font-size:12px;margin:4px 0}
  .lab-sec{border:1px solid #26332d;margin:8px 0;background:#0a100e}
  .lab-sec>summary{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:46px;padding:0 12px;cursor:pointer;color:#e0b95a;font-size:12px;letter-spacing:1px;list-style:none}
  .lab-sec>summary::-webkit-details-marker{display:none}
  .lab-sec>summary span{flex:none}.lab-sec>summary i{flex:1;text-align:right;font-style:normal;color:#8fa399;font-size:11px;letter-spacing:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .lab-sec>summary::after{content:'▾';color:#8fa399}.lab-sec[open]>summary::after{content:'▴'}
  .lab-body{padding:0 10px 12px}
  .lab-row{display:flex;flex-direction:column;gap:4px;margin:8px 0}
  .lab-row.top{flex-direction:row;align-items:center;justify-content:space-between}
  .lab-in select,.lab-in button{background:#101a16;color:#d9e3dc;border:1px solid #2f4a3e;padding:6px 10px;font:inherit;cursor:pointer;min-height:44px}
  .lab-in select{width:100%;font-size:14px}
  .lab-in button.go{background:#9fe3c3;color:#0a1512;border-color:#9fe3c3;font-weight:700;padding:0 22px;min-height:48px;font-size:14px}
  .lab-in input[type=checkbox]{width:22px;height:22px;vertical-align:middle}
  .lab-scroll{overflow-x:auto}
  .lab-tab{border-collapse:collapse;font-size:11px;margin:6px 0;min-width:100%}.lab-tab th,.lab-tab td{text-align:left;padding:4px 8px;border-bottom:1px solid #18221d;color:#9fb3a8;white-space:nowrap}
  .lab-bar{position:fixed;left:0;right:0;bottom:0;background:#0b1210;border-top:1px solid #2f4a3e;padding:8px 10px max(8px,env(safe-area-inset-bottom))}
  .lab-bar .in{max-width:860px;margin:0 auto;display:flex;gap:8px;align-items:center}
  .lab-bar .cost{flex:1;min-width:0;font-size:11px}
  .lab-gauge{height:8px;background:#18221d;margin-top:5px;position:relative}
  .lab-gauge i{position:absolute;inset:0 auto 0 0;background:#9fe3c3}
  .lab-gauge.mid i{background:#e0b95a}.lab-gauge.over i{background:#e0605a}
  .lab-boss{margin-top:10px;color:#bcd0c6;letter-spacing:1px}
  .lab-rdgrid{display:grid;grid-template-columns:1fr;gap:8px;margin:6px 0 12px}
  .lab-rd{padding:8px 9px 9px;display:flex;flex-direction:column;gap:5px;border:1px solid #0006;box-shadow:2px 2px 0 #0007}
  .lab-rd.paper{background:linear-gradient(180deg,#e3d7b4,#cfc19a);color:#3a3022}
  .lab-rd.blue{background:linear-gradient(180deg,#0f2a3d,#0a1c2b);color:#9fd5e2}
  .lab-rd .rh{display:flex;align-items:center;gap:6px;border-bottom:1px solid currentColor;padding-bottom:4px}
  .lab-rd .ic{display:grid;place-items:center;width:28px;height:28px;border:1px solid currentColor;flex:none}
  .lab-rd .rh b{flex:1;font-size:12px;letter-spacing:.5px;line-height:1.15}
  .lab-rd .tg{font-size:9px;border:1px solid currentColor;padding:2px 4px}
  .lab-rd .rdsc{font-size:11px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .lab-rd .stats{font-size:10px;display:flex;flex-direction:column;gap:2px}.lab-rd .stats div{display:flex;gap:6px;align-items:baseline}.lab-rd .stats span{flex:1;opacity:.8;font-size:9px;letter-spacing:.3px}.lab-rd .stats em{font-style:normal;opacity:.7}
  .lab-rd .rst{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.5px;flex-wrap:wrap}
  .lab-rd .pips{display:flex;gap:2px;flex-wrap:wrap}.lab-rd .pips i{width:8px;height:8px;border:1px solid currentColor;border-radius:50%}
  .lab-rd .pips i.f{background:#ffce27;border-color:#9c7110}
  .lab-rd .sp{color:#365d37;border:1px solid #487247;padding:1px 4px}
  .lab-rd .inv{font-size:10px;opacity:.85}
  .lab-in .lab-rd button.buy{background:#ffce27;color:#2b2100;border:2px solid #9c7110;font-weight:700;font-size:12px;padding:6px;text-align:center;min-height:50px}
  .lab-in .lab-rd button.buy small{display:block;font-weight:400;font-size:11px;margin-top:2px}
  .lab-in .lab-rd button.buy:disabled{background:#7f7762;color:#3f3a2e;border-color:#4d4436;cursor:default}
  .lab-rd .rctl{display:flex;justify-content:space-between;align-items:center;font-size:11px}
  .lab-in .lab-rd .rctl button{background:transparent;color:inherit;border:1px solid currentColor;font-size:11px;padding:0 12px;min-height:40px}
  .lab-in .lab-rd .rctl button:disabled{opacity:.35;cursor:default}
  .lab-rd .rctl label{display:flex;align-items:center;gap:6px;min-height:40px}
  .lab-toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:#1d3a2f;border:1px solid #4a8a6c;color:#d9f5e6;padding:9px 16px;z-index:70000;opacity:0;pointer-events:none;transition:opacity .15s;font:12px monospace;max-width:92vw}
  .lab-toast.show{opacity:1}
  @media(min-width:640px){
    .lab-in{padding:14px 16px 110px}.lab-row:not(.top){flex-direction:row;align-items:center}.lab-row>label{min-width:170px}
    .lab-in select{width:auto;min-width:260px;min-height:38px;font-size:13px}.lab-in button{min-height:38px}
    .lab-rdgrid{grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
  }
  `;

  async function loadRuns(){ if (!serverOk) return lsRuns(); try { return (await json(RUNS)).runs; } catch(e){ return []; } }

  function buildUi(){
    document.head.append(h('style', {}, CSS));
    const levels = allLevels();
    const start = q.get('level'), st = { levelId:levels.some(l=> l.id === start) ? start : levels[0].id, versionId:'', versions:[], equip:emptyEquip(), open:{ mission:true } };
    ui = { runs:[] };
    const root = h('div', { class:'lab-root' }), inner = h('div', { class:'lab-in' });
    root.append(inner); document.body.append(root);
    ui.show = async ()=>{ ui.runs = await loadRuns(); render(); root.classList.add('on'); };
    ui.hide = ()=> root.classList.remove('on');
    ui.visible = ()=> root.classList.contains('on');
    ui.launchNow = async ()=> {          // « Tester le brouillon » de l'éditeur : niveau et brouillon courants, dernier équipement
      st.versionId = 'draft';
      const idx = levels.findIndex(l=> l.id === st.levelId);
      await launch(levels[idx], equipCost(st.equip), budgetBefore(levels, idx, ui.runs));
    };
    ui.pick = async id=> { if (!levels.some(l=> l.id === id)) return; if (id !== st.levelId) return pickLevel(id); await loadVersions(true); render(); };          // même niveau : on relit seulement l'historique (nouvelle version enregistrée dans l'éditeur)

    async function loadVersions(keep){
      const was = st.versionId; st.versions = []; st.versionId = EMBED ? 'draft' : '';          // dans l'éditeur on teste par défaut le brouillon (boucle « je modifie, je teste »)
      try { st.versions = (await json(VERSIONS + '?level=' + encodeURIComponent(st.levelId))).versions; } catch(e){ /* historique indisponible */ }
      if (keep && (was === 'draft' || was === '' || st.versions.some(v=> v.id === was))) st.versionId = was;
    }
    function lastEquip(){
      const mine = ui.runs.filter(r=> r.levelId === st.levelId && r.equip).sort((a, b)=> (a.at || 0) - (b.at || 0));
      return mine.length ? Object.assign(emptyEquip(), JSON.parse(JSON.stringify(mine[mine.length - 1].equip))) : emptyEquip();
    }
    async function pickLevel(id){ st.levelId = id; st.equip = lastEquip(); await loadVersions(); render(); }

    function render(){
      const idx = levels.findIndex(l=> l.id === st.levelId), lvl = levels[idx];
      const bud = budgetBefore(levels, idx, ui.runs), cost = equipCost(st.equip);
      const eq = st.equip, mineRuns = ui.runs.filter(r=> r.levelId === st.levelId);
      const rerender = ()=> { const y = root.scrollTop; render(); root.scrollTop = y; };

      const lvlSel = h('select', { disabled:EMBED, title:EMBED ? 'le niveau suit la mission choisie dans l’éditeur' : false, onchange:e=> pickLevel(e.target.value) }, levels.map(l=> h('option', { value:l.id, selected:l.id === st.levelId }, (l.tuto ? 'TUTO' : String(l.id).toUpperCase()) + ' · ' + l.name)));
      const verSel = h('select', { onchange:e=> { st.versionId = e.target.value; } },
        h('option', { value:'' }, 'Version publiée (actuelle)'),
        EMBED ? h('option', { value:'draft', selected:st.versionId === 'draft' }, 'Brouillon de l’éditeur (non enregistré)') : null,
        st.versions.map(v=> h('option', { value:v.id, selected:v.id === st.versionId }, v.title + ' — ' + (VERSION_KINDS[v.kind] || 'Version') + ' · ' + new Date(v.createdAt).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' }) + (v.summary ? ' · ' + v.summary.waves + ' vague' + (v.summary.waves === 1 ? '' : 's') + ' · ' + v.summary.creatures + ' créatures' : ''))));

      // atelier : même fiche que la R&D (une étape à la fois, coût cumulé Mk I -> Mk n), avec les valeurs avant / après du poste
      const atelierCard = p=>{
        const mk = eq.atelier[p.id] || 0, nc = atelierNextCost(p.id, mk);
        const paid = ATELIER_COSTS.slice(0, mk).reduce((a, c)=> a + c, 0);
        const cur = atelierShows(p.id, mk), nxt = mk < ATELIER_MAX ? atelierShows(p.id, mk + 1) : null;
        const price = nc ? '◆ ' + nc.composants + (nc.pieces ? ' + ' + Object.keys(nc.pieces).map(k=> nc.pieces[k] + ' ' + k.toUpperCase()).join(' + ') : '') : '';
        const card = h('article', { class:'lab-rd ' + (mk ? 'paper' : 'blue') },
          h('div', { class:'rh' }, h('span', { class:'ic' }), h('b', {}, p.name), h('span', { class:'tg' }, mk ? 'MK ' + ROMAN[mk] : 'BASE')),
          h('div', { class:'rdsc' }, p.text),
          h('div', { class:'stats' }, cur.map((l, i)=> h('div', {}, h('span', {}, l.label), h('b', {}, l.value), nxt ? h('em', {}, ' → ' + nxt[i].value) : null))),
          h('div', { class:'rst' }, h('span', { class:'pips' }, Array.from({ length:ATELIER_MAX }, (_, k)=> h('i', { class:k < mk ? 'f' : '' })))),
          h('div', { class:'inv' }, mk ? 'investi : ' + money(paid) : 'camionnette de base'),
          h('button', { class:'buy', disabled:!nc, onclick:()=> { eq.atelier[p.id] = mk + 1; rerender(); } }, nc ? 'MK ' + ROMAN[mk + 1] : 'COMPLET', h('small', {}, price)),
          h('div', { class:'rctl' }, h('button', { disabled:!mk, onclick:()=> { eq.atelier[p.id] = mk - 1; rerender(); }, title:'revenir d’une étape' }, '− étape')));
        card.querySelector('.ic').innerHTML = pxImg('🔧', 22);
        return card;
      };
      const atelier = h('div', { class:'lab-rdgrid' }, ATELIER_POSTS.map(atelierCard));

      const techCard = t=>{
        const e = eq.techs[t.id] || (eq.techs[t.id] = { proto:false, rang:0, spe:false }), max = techMaxRang(t);
        const owned = techOwned(eq, t.id), on = eq.load.indexOf(t.id) >= 0, inv = techCost(eq, t.id);
        const what = !owned ? 'proto' : e.rang < max ? 'rang' : (t.spe && !e.spe) ? 'spe' : null, nc = what ? rdNextCost(t.id, what, e.rang) : null;
        const label = !what ? 'COMPLET' : what === 'proto' ? 'PROTOTYPE' : what === 'rang' ? 'RANG ' + (e.rang + 1) + '/' + max + ' · ' + rdUpgradeAt(t, e.rang + 1).name : 'SPECIALISATION · ' + t.spe.name;
        const price = nc ? '◆ ' + nc.composants + (nc.pieces ? ' + ' + Object.keys(nc.pieces).map(k=> nc.pieces[k] + ' ' + k.toUpperCase()).join(' + ') : '') : '';
        const back = ()=> { if (e.spe) e.spe = false; else if (e.rang > 0) e.rang--; else { e.proto = false; eq.load = eq.load.filter(i=> i !== t.id); } rerender(); };
        const card = h('article', { class:'lab-rd ' + (owned ? 'paper' : 'blue') },
          h('div', { class:'rh' }, h('span', { class:'ic' }), h('b', {}, t.name), t.tag ? h('span', { class:'tg' }, t.tag) : null),
          h('div', { class:'rdsc' }, t.desc),
          h('div', { class:'rst' }, h('span', {}, 'PROTO ', h('b', {}, owned ? 'OUI' : 'NON')), h('span', { class:'pips' }, Array.from({ length:max }, (_, k)=> h('i', { class:k < e.rang ? 'f' : '' }))), e.spe ? h('span', { class:'sp' }, 'SPE VALIDEE') : null),
          h('div', { class:'inv' }, owned ? 'investi : ' + money(inv.c) : 'non débloquée'),
          h('button', { class:'buy', disabled:!what, onclick:()=> { if (what === 'proto') e.proto = true; else if (what === 'rang') e.rang++; else e.spe = true; rerender(); } }, label, h('small', {}, price)),
          h('div', { class:'rctl' }, h('button', { disabled:!owned, onclick:back, title:'revenir d’une étape' }, '− étape'),
            h('label', {}, h('input', { type:'checkbox', checked:on, disabled:!owned, onchange:ev=>{
              const next = ev.target.checked ? eq.load.concat(t.id) : eq.load.filter(i=> i !== t.id);
              const chk = loadoutCheck(buildMetaWith(eq, next), next, BAYS);
              if (!chk.ok){ toast('Chargement refusé : ' + ({ arme:'une seule ARME', rampe:'une seule RAMPE', baies:BAYS + ' baies maximum' }[chk.reason] || chk.reason)); rerender(); return; }
              eq.load = next; rerender(); } }), ' emporté')));
        card.querySelector('.ic').innerHTML = pxImg(t.icon, 22);
        return card;
      };
      const techList = TECHS.filter(techAvailable);
      const techUi = [...new Set(techList.map(t=> t.sector))].map(sec=> [ h('div', { class:'lab-note lab-boss' }, 'SECTEUR ' + sec), h('div', { class:'lab-rdgrid' }, techList.filter(t=> t.sector === sec).map(techCard)) ]);

      const pct = bud.mid > 0 ? Math.min(100, cost.c/bud.mid*100) : (cost.c > 0 ? 100 : 0);
      const gauge = h('div', { class:'lab-gauge' + (cost.c > bud.max ? ' over' : cost.c > bud.mid ? ' mid' : '') }, h('i', { style:'width:' + pct + '%' }));
      const pcs = Object.keys(cost.pieces).map(k=> cost.pieces[k] + '× pièce ' + k).join(', ');
      const recent = mineRuns.slice(-5).reverse();

      const sec = (id, title, info, ...kids)=> h('details', { class:'lab-sec', open:!!st.open[id], ontoggle:e=> { st.open[id] = e.target.open; } },
        h('summary', {}, h('span', {}, title), h('i', {}, info || '')), h('div', { class:'lab-body' }, kids));
      const atelierPaid = ATELIER_POSTS.reduce((a, p)=> a + ATELIER_COSTS.slice(0, eq.atelier[p.id] || 0).reduce((x, c)=> x + c, 0), 0);
      const nTech = TECHS.filter(t=> techAvailable(t) && techOwned(eq, t.id)).length, nPost = ATELIER_POSTS.filter(p=> eq.atelier[p.id] > 0).length;
      const parts = [
        EMBED ? null : h('div', { class:'lab-row top' }, h('h1', {}, 'LABORATOIRE DE TEST'), h('button', { onclick:()=> { location.href = location.pathname; } }, 'QUITTER')),
        EMBED ? null : h('p', {}, 'Sauvegarde en mémoire : votre progression n’est jamais touchée.'),
        sec('mission', 'MISSION', (lvl.tuto ? 'TUTO' : lvl.id.toUpperCase()) + ' · ' + mineRuns.length + ' partie(s)',
          h('div', { class:'lab-row' }, h('label', {}, 'Ordre'), lvlSel),
          h('div', { class:'lab-row' }, h('label', {}, 'Version du niveau'), verSel),
          serverOk ? null : h('p', {}, 'Pas de serveur local : parties gardées dans ce navigateur.'),
          recent.length ? h('div', { class:'lab-scroll' }, h('table', { class:'lab-tab' }, h('tr', {}, ['Issue', 'Durée', 'PV', 'Subis', 'Infligés', '◆', 'Coût/budget'].map(t=> h('th', {}, t))),
            recent.map(r=> h('tr', {}, [r.outcome, Math.floor(r.elapsed/60) + ':' + String(r.elapsed%60).padStart(2, '0'), r.hp + '/' + r.maxHp, r.taken, r.dealt, r.composants, r.cost + ' / ' + r.budget].map(t=> h('td', {}, t)))))) : null),
        sec('budget', 'BUDGET', idx === 0 ? '0 ◆' : '≈ ' + money(bud.mid),
          idx === 0
            ? h('p', {}, 'Tuto : vous êtes censé jouer avec 0 ◆ d’amélioration. Tout reste équipable pour tester.')
            : h('p', {}, 'Censé avoir été récolté avant cet ordre : ≈ ' + money(bud.mid) + ' (de ' + money(bud.min) + ' à ' + money(bud.max) + ').'),
          idx === 0 ? null : bud.rows.map(r=> h('div', { class:'lab-note' }, r.name + ' — ' + money(r.val) + ' (' + r.src + ')'))),
        sec('atelier', 'ATELIER', nPost + ' poste(s) · ' + money(atelierPaid),
          h('p', {}, 'Le bouton jaune achète le Mk suivant ; le coût cumule Mk I à Mk n (Mk III à V : pièces de secteur).'), atelier),
        sec('techs', 'TECHNOLOGIES', nTech + ' débloquée(s) · ' + money(cost.c - atelierPaid),
          h('p', {}, 'Le bouton jaune achète l’étape suivante : prototype, rang 1, 2, 3…, spécialisation. ' + BAYS + ' baies, une arme et une rampe au plus.'), techUi),
        h('div', { class:'lab-bar' }, h('div', { class:'in' },
          h('div', { class:'cost' }, h('div', {}, 'Équipement : ', h('b', {}, money(cost.c)), idx === 0 ? ' · budget 0 ◆' : ' / budget ≈ ' + money(bud.mid) + (cost.c > bud.mid ? ' · +' + money(cost.c - bud.mid) : ' · reste ' + money(bud.mid - cost.c)), pcs ? ' · ' + pcs : ''), gauge),
          h('button', { class:'go', onclick:()=> launch(lvl, cost, bud) }, 'LANCER')))];
      inner.replaceChildren(...parts.flat(Infinity).filter(Boolean));
    }
    function buildMetaWith(eq, load){ return buildMeta(Object.assign({}, eq, { load })); }

    async function launch(lvl, cost, bud){
      const eq = st.equip; let version = null;
      try {
        if (st.versionId === 'draft'){
          const doc = await getDraft(lvl.id); if (!doc) throw new Error('l’éditeur ne répond pas');
          applyTuning({ tuto:{}, levels:{ [lvl.id]:doc } });
          version = { id:'draft', title:'brouillon de l’éditeur', hash:hash(JSON.stringify(doc)) };
        } else if (st.versionId){
          const o = await json(VERSIONS + '?level=' + encodeURIComponent(lvl.id) + '&id=' + st.versionId);
          applyTuning({ tuto:{}, levels:{ [lvl.id]:o.version.document } });
          version = { id:o.version.id, title:o.version.title, hash:o.version.fingerprint.slice(0, 8) };
        } else {
          applyTuning(TUNING_OVERRIDES);
          version = { id:null, title:'publiée', hash:hash(JSON.stringify((typeof LEVEL_FILES !== 'undefined' && LEVEL_FILES[lvl.id]) || lvl.id)) };
        }
      } catch(e){ toast('Version indisponible : ' + e.message); return; }
      const meta = buildMeta(eq); meta.chargement = loadoutSanitize(meta, BAYS); setMeta(meta);
      window.__labCtx = { levelId:lvl.id, levelName:lvl.name, version, equip:JSON.parse(JSON.stringify(Object.assign({}, eq, { load:meta.chargement }))), cost:Math.round(cost.c), budget:bud.mid };
      ui.hide(); ui.launching = true;
      const game = window.__phaserGame, home = game.scene.getScene('home'), gs = game.scene.getScene('game');
      const go = ()=>{ home.scene.setVisible(true, 'game'); gs.input.enabled = true; gs.meta = getMeta(); gs.scene.restart(lvl.tuto ? { autoStart:true, tuto:true } : { autoStart:true, levelId:lvl.id }); };
      sfx.resume(); sfx.uiStart();
      if (Motion.ok()) Motion.cover(go, .45); else go();
    }
    loadRuns().then(r=> { ui.runs = r; return pickLevel(st.levelId); }).then(()=> ui.show()).then(()=> { if (EMBED) window.parent.postMessage({ ssx:1, type:'lab-ready' }, location.origin); });
  }

  // ---------------------------------------------------------------- démarrage
  function init(){
    const ping = fetch('src/boot.js', { method:'HEAD' }).then(r=> r.headers.get('X-SSX-Dev') === '1').catch(()=> false);          // serveur local (tools/serve.py) ?
    if (LAB){
      slotsOpen = ()=> BAYS;          // laboratoire : toutes les baies sont ouvertes
      // « REFAIRE L'INTERVENTION » d'un test du brouillon : on relit d'abord le brouillon (l'éditeur a pu changer depuis la dernière partie)
      if (EMBED) document.addEventListener('click', e=>{
        const b = e.target.closest && e.target.closest('#btnRetry'), c = window.__labCtx;
        if (!b || b._labGo || !c || !c.version || c.version.id !== 'draft') return;
        e.stopImmediatePropagation(); e.preventDefault();
        getDraft(c.levelId).then(doc=>{ if (doc){ applyTuning({ tuto:{}, levels:{ [c.levelId]:doc } }); c.version.hash = hash(JSON.stringify(doc)); } b._labGo = true; b.click(); b._labGo = false; });
      }, true);
      if (EMBED) window.addEventListener('message', ev=>{
        if (ev.origin !== location.origin || !ev.data || ev.data.ssx !== 1) return;
        if (ev.data.type === 'lab-select' && ui && ui.pick) ui.pick(ev.data.levelId);
        else if (ev.data.type === 'lab-launch' && ui && ui.launchNow) ui.launchNow();
        else if (ev.data.type === 'lab-draft' && draftWait){ const f = draftWait; draftWait = null; f(ev.data.document || null); }
      });
      ping.then(ok=>{
        serverOk = ok; hookGame(); buildUi();
        // retour au bureau depuis un rapport : l'écran du laboratoire revient
        setInterval(()=> { if (ui && !ui.visible() && !ui.launching && document.body.classList.contains('at-home')) ui.show(); }, 400);
      });
    } else {
      ping.then(ok=>{
        if (!ok) return;
        document.head.append(h('style', {}, CSS));
        const b = h('button', { class:'lab-btn', onclick:()=> { location.href = location.pathname + '?lab'; } }, 'LABORATOIRE');
        document.body.append(b);
        setInterval(()=> b.classList.toggle('on', document.body.classList.contains('at-home')), 400);
      });
    }
  }
  const wait = setInterval(()=>{ if (window.__phaserGame && typeof GameScene !== 'undefined'){ clearInterval(wait); init(); } }, 200);
})();
