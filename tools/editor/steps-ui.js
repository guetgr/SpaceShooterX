"use strict";
// Panneau « ÉTAPES DU NIVEAU » de l'éditeur : rendu DOM mince au-dessus du modèle sans DOM tools/editor/steps-model.js (EditorSteps).
// Chaque étape (INTRO / CAMERA, OBJECTIF, MOBS, EVENEMENT · …, COMBAT DU BOSS, N.O.R.M.A., RAPPORT ; étapes pédagogiques du tuto) = un bloc repliable :
// titre + description générée (toujours visible), puis ses champs. Une étape qui plante affiche une ligne rouge sans vider le reste de la page.
//
// Chemin d'une valeur, de la saisie au jeu :
//  1. saisie → EditorSteps.applyFieldValue(editorLevelDocument(id), field, v) : valide (message français affiché sous le champ ; rien n'est écrit si c'est invalide)
//     et renvoie une copie du document modifiée au chemin field.path (ex. ['bossTune','ar','dmg.missile'], ['norma','messages'], ['tutorial','boss','hp']).
//  2. stepsStore : la clé de premier niveau touchée (field.path[0]) est recopiée EN ENTIER dans S.ov.levels[id][clé] ; égale au document d'origine
//     (S.documents[id]) → surcharge effacée ; disparue du document (clés entières EditorSteps.WHOLE_KEYS : mobs, bossTune, eventTune, norma, audio) → null.
//     Exception : ['tutorial', groupe, clé] va dans S.ov.tuto[groupe][clé] (réglages vivants du tuto, total des poids « Finition » vérifié par updateSum).
//  3. changed() (editor.html) → postMessage { type:'apply', overrides:S.ov } à l'aperçu ; TESTER ({type:'play'}) et le bot ({type:'bot'}) envoient aussi S.ov.
//     Côté jeu, src/dev/editor-hook.js appelle applyTuning(S.ov) (src/data/tuning-apply.js) : TUNE_LEVEL_FIELDS recopie chaque clé dans la définition du niveau
//     (WORLDS, celle que lisent launch(levelId), GameScene.lvDef et tools/sim/bot.js) ; TUNE_WHOLE remplace mobs/bossTune/eventTune/norma/audio en entier
//     (null = retiré) ; events est un tableau recopié tel quel (params et norma de chaque événement compris) ; le tuto lit TUTO_TUNE (tutorial + S.ov.tuto).
//  4. EXPORTER : editorLevelDocument(id) (document + S.ov) → POST /__editor/levels → tools/level_files.py valide puis écrit src/data/levels/<id>.json.
// Globales utilisées (editor.html / level-document.js) : S, clone, section, changed, editorLevelDocument, updateSum (facultatif), EditorSteps.
(function(root){
  const M = ()=> root.EditorSteps;
  const same = (a, b)=> JSON.stringify(a) === JSON.stringify(b);
  const openState = {};          // « niveau/étape » -> bloc déplié (conservé quand le panneau est reconstruit)

  function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function button(text, fn){ const b = el('button', 'btn st-btn', text); b.type = 'button'; b.onclick = fn; return b; }
  const hasFocus = node=> !!(document.activeElement && node.contains && node.contains(document.activeElement));
  const fmt = v=> v === null || v === undefined ? '—' : Array.isArray(v) ? v.join(' / ') : typeof v === 'boolean' ? (v ? 'oui' : 'non') : String(v);
  function catalogsFor(id){
    return { eventCatalog:S.eventCatalog || [], decorCatalog:S.decorCatalog || [], musicCatalog:S.musicCatalog || { level:[], boss:[] },
      tunablesCatalog:S.tunablesCatalog || {}, mobCatalog:S.mobCatalog || [], base:S.documents[id] };
  }

  /* ---------- écriture dans S.ov ---------- */
  function stepsStore(id, d, field){
    const top = field.path[0], base = S.documents[id] || {};
    if (top === 'tutorial'){
      const g = field.path[1], k = field.path[2], v = M().getByPath(d, field.path), def = M().getByPath(base, field.path);
      const grp = S.ov.tuto[g] = S.ov.tuto[g] || {};
      if (same(v, def)) delete grp[k]; else grp[k] = clone(v);
      if (!Object.keys(grp).length) delete S.ov.tuto[g];
      return;
    }
    const ov = S.ov.levels[id] = S.ov.levels[id] || {};
    const has = Object.prototype.hasOwnProperty.call(d, top), inBase = Object.prototype.hasOwnProperty.call(base, top);
    if (has ? (inBase && same(d[top], base[top])) : !inBase) delete ov[top];
    else if (!has) ov[top] = null;               // clé entière retirée alors que le document d'origine l'a
    else ov[top] = clone(d[top]);
    if (!Object.keys(ov).length) delete S.ov.levels[id];
  }

  /* ---------- lignes de champs ---------- */
  // ctx = { id, doc(), commit(field, value) -> '' ou message d'erreur }
  function shell(field, wide){
    const d = el('div', 'f st-f' + (wide ? ' st-wide' : '')), lab = el('label');
    lab.appendChild(document.createTextNode(field.label));
    if (field.help) lab.appendChild(el('small', null, field.help));
    d.appendChild(lab);
    return { d, lab, err:el('div', 'warn st-err') };
  }
  function modOf(f, doc){ return f.defByAlert ? M().getByPath(doc, f.path) !== undefined : !same(M().fieldValue(doc, f), f.def); }
  // ↺ : remet la valeur d'origine (défaut variable selon l'alerte : la clé est retirée)
  function resetValue(f){ return f.defByAlert ? null : clone(f.def); }
  function metaShow(meta, row, f, doc, label){
    const m = modOf(f, doc); row.classList.toggle('mod', m);
    meta.textContent = m ? '↺ ' + label + (f.unit ? ' ' + f.unit : '') : (f.unit || '');
    meta.title = m ? 'Remettre la valeur d\'origine' : '';
  }

  function numberRow(ctx, field){
    let f = field;
    const { d, err } = shell(f), num = el('input'), meta = el('span', 'meta');
    num.type = 'number'; if (f.min !== undefined) num.min = f.min; if (f.max !== undefined) num.max = f.max; num.step = f.step || 'any';
    d.appendChild(num);
    let rng = null;
    if (isFinite(f.min) && isFinite(f.max) && f.max > f.min){ rng = el('input'); rng.type = 'range'; rng.min = f.min; rng.max = f.max; rng.step = f.step || 'any'; d.appendChild(rng); }
    d.appendChild(meta); d.appendChild(err);
    const show = doc=>{ const v = M().fieldValue(doc, f); num.value = v == null ? '' : v; if (rng && v != null) rng.value = v; metaShow(meta, d, f, doc, fmt(f.def)); };
    const put = v=>{ const msg = ctx.commit(f, v); err.textContent = msg; if (!msg) show(ctx.doc()); };
    num.onchange = ()=>{ if (num.value === '' || !isFinite(Number(num.value))){ err.textContent = f.label + ' : nombre requis'; return; } put(Number(num.value)); };
    if (rng){ rng.oninput = ()=>{ num.value = rng.value; }; rng.onchange = ()=> put(Number(rng.value)); }
    meta.onclick = ()=>{ if (modOf(f, ctx.doc())) put(resetValue(f)); };
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  function selectRow(ctx, field){
    let f = field;
    const { d, err } = shell(f, true), sel = el('select'), meta = el('span', 'meta');
    d.appendChild(meta); d.appendChild(sel); d.appendChild(err);
    const label = v=>{ const o = (f.options || []).find(x=> same(x.value, v)); return o ? o.label : fmt(v); };
    const show = doc=>{
      const v = M().fieldValue(doc, f); sel.replaceChildren();
      (f.options || []).forEach((o, i)=>{ const op = el('option', null, o.label); op.value = String(i); sel.appendChild(op); });
      const i = (f.options || []).findIndex(o=> same(o.value, v));
      if (i < 0){ const op = el('option', null, fmt(v) + ' (inconnu)'); op.value = 'x'; sel.appendChild(op); sel.value = 'x'; } else sel.value = String(i);
      metaShow(meta, d, f, doc, label(f.def));
    };
    const put = v=>{ const msg = ctx.commit(f, v); err.textContent = msg; if (!msg) show(ctx.doc()); };
    sel.onchange = ()=>{ const o = (f.options || [])[Number(sel.value)]; if (!o){ err.textContent = f.label + ' : choix inconnu'; return; } put(o.value); };
    meta.onclick = ()=>{ if (modOf(f, ctx.doc())) put(resetValue(f)); };
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  function textRow(ctx, field){
    let f = field;
    const { d, err } = shell(f, true), inp = el('input', 'st-text-in'), meta = el('span', 'meta');
    inp.type = 'text'; if (f.maxLength) inp.maxLength = f.maxLength;
    d.appendChild(meta); d.appendChild(inp); d.appendChild(err);
    const show = doc=>{ inp.value = M().fieldValue(doc, f) || ''; metaShow(meta, d, f, doc, 'origine'); };
    const put = v=>{ const msg = ctx.commit(f, v); err.textContent = msg; if (!msg) show(ctx.doc()); };
    inp.onchange = ()=> put(inp.value);
    meta.onclick = ()=>{ if (modOf(f, ctx.doc())) put(resetValue(f)); };
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  function boolRow(ctx, field){
    let f = field;
    const { d, lab, err } = shell(f, true), box = el('input'), meta = el('span', 'meta');
    box.type = 'checkbox'; lab.insertBefore(box, lab.firstChild);
    d.appendChild(meta); d.appendChild(err);
    const show = doc=>{ box.checked = !!M().fieldValue(doc, f); metaShow(meta, d, f, doc, fmt(f.def)); };
    const put = v=>{ const msg = ctx.commit(f, v); err.textContent = msg; show(ctx.doc()); if (msg) err.textContent = msg; };
    box.onchange = ()=> put(!!box.checked);
    meta.onclick = ()=>{ if (modOf(f, ctx.doc())) put(resetValue(f)); };
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  function numlistRow(ctx, field){
    let f = field;
    const { d, err } = shell(f, true), meta = el('span', 'meta'), line = el('div', 'opts st-nums'), inputs = [];
    for (let i = 0; i < f.len; i++){ const n = el('input'); n.type = 'number'; if (f.min !== undefined) n.min = f.min; if (f.max !== undefined) n.max = f.max; n.step = f.step || 'any'; inputs.push(n); line.appendChild(n); }
    if (f.unit) line.appendChild(el('span', 'st-unit', f.unit));
    d.appendChild(meta); d.appendChild(line); d.appendChild(err);
    const show = doc=>{ const v = M().fieldValue(doc, f) || []; inputs.forEach((n, i)=>{ n.value = v[i] === undefined ? '' : v[i]; }); metaShow(meta, d, f, doc, fmt(f.def)); };
    const put = v=>{ const msg = ctx.commit(f, v); err.textContent = msg; if (!msg) show(ctx.doc()); };
    inputs.forEach(n=> n.onchange = ()=>{
      if (inputs.some(x=> x.value === '' || !isFinite(Number(x.value)))){ err.textContent = f.label + ' : ' + f.len + ' nombres requis'; return; }
      put(inputs.map(x=> Number(x.value)));
    });
    meta.onclick = ()=>{ if (modOf(f, ctx.doc())) put(resetValue(f)); };
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  function textlistRow(ctx, field){
    let f = field;
    const { d, err } = shell(f, true), meta = el('span', 'meta'), list = el('div', 'st-lines');
    d.appendChild(meta); d.appendChild(list); d.appendChild(err);
    let lines = [];
    const filled = a=> a.filter(x=> typeof x === 'string' && x.trim() !== '');
    const put = v=>{ const msg = ctx.commit(f, v); err.textContent = msg; if (!msg) metaShow(meta, d, f, ctx.doc(), 'origine'); return msg; };
    function draw(){
      list.replaceChildren();
      if (f.options){                            // choix parmi des clés (musique) : cases à cocher, dans l'ordre du catalogue
        const box = el('div', 'opts st-choices');
        f.options.forEach(o=>{
          const l = el('label'), c = el('input'); c.type = 'checkbox'; c.checked = lines.indexOf(o.value) >= 0;
          c.onchange = ()=>{ const next = f.options.map(x=> x.value).filter(v=> v === o.value ? c.checked : lines.indexOf(v) >= 0); if (!put(next)) lines = next; else draw(); };
          l.appendChild(c); l.appendChild(document.createTextNode(o.label)); box.appendChild(l);
        });
        list.appendChild(box); return;
      }
      lines.forEach((t, i)=>{
        const row = el('div', 'opts st-line'), inp = el('input', 'st-text-in'); inp.type = 'text'; inp.value = t; if (f.maxLength) inp.maxLength = f.maxLength;
        inp.onchange = ()=>{ lines[i] = inp.value; put(lines.slice()); };
        row.appendChild(inp); row.appendChild(button('RETIRER', ()=>{ lines.splice(i, 1); put(lines.slice()); draw(); }));
        list.appendChild(row);
      });
      const add = button('AJOUTER UNE LIGNE', ()=>{ if (f.max !== undefined && lines.length >= f.max){ err.textContent = f.label + ' : ' + f.max + ' lignes au plus'; return; } lines.push(''); draw(); });
      list.appendChild(add);
    }
    const show = doc=>{ const v = M().fieldValue(doc, f) || []; if (!same(filled(lines), v)){ lines = v.slice(); draw(); } metaShow(meta, d, f, doc, 'origine'); };
    meta.onclick = ()=>{ if (modOf(f, ctx.doc()) && !put(resetValue(f))){ lines = []; draw(); } };
    draw();
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  // boîtes N.O.R.M.A. (norma.messages) : une boîte = id (m1, m2… automatique), quand, date (si « à une date »), événement (si début / fin d'événement), texte
  function objlistRow(ctx, field){
    let f = field;
    const { d, err } = shell(f, true), meta = el('span', 'meta'), list = el('div', 'st-items');
    d.appendChild(meta); d.appendChild(list); d.appendChild(err);
    let items = [], draft = false;          // draft : boîtes pas encore valides (non enregistrées), gardées quand un autre champ change
    const spec = key=> (f.item || []).find(it=> it.key === key);
    const shown = (it, x)=> !it.onlyIf || it.onlyIf.values.indexOf(x[it.onlyIf.key]) >= 0;
    const tidy = x=>{ const o = {}; (f.item || []).forEach(it=>{ const v = x[it.key]; if (v !== undefined && v !== '' && v !== null && shown(it, x)) o[it.key] = v; }); return o; };
    const put = ()=>{ const msg = ctx.commit(f, items.map(tidy)); err.textContent = msg; draft = !!msg; if (!msg) metaShow(meta, d, f, ctx.doc(), 'origine'); return msg; };
    const nextId = ()=>{ for (let n = 1; ; n++){ if (!items.some(x=> x.id === 'm' + n)) return 'm' + n; } };
    function control(x, it){
      const wrap = el('label', 'st-col-' + it.key, it.label + (it.unit ? ' (' + it.unit + ')' : '')); let c;
      if (it.kind === 'select'){
        c = el('select'); (it.options || []).forEach((o, i)=>{ const op = el('option', null, o.label); op.value = String(i); c.appendChild(op); });
        const i = (it.options || []).findIndex(o=> o.value === x[it.key]); c.value = i < 0 ? '' : String(i);
        c.onchange = ()=>{ const o = (it.options || [])[Number(c.value)]; x[it.key] = o ? o.value : undefined; if (it.key === 'when') draw(); put(); };
      } else {
        c = el('input'); c.type = it.kind === 'number' ? 'number' : 'text';
        if (it.kind === 'number'){ if (it.min !== undefined) c.min = it.min; if (it.max !== undefined) c.max = it.max; c.step = it.step || 'any'; }
        if (it.maxLength) c.maxLength = it.maxLength;
        c.value = x[it.key] === undefined ? '' : x[it.key];
        c.onchange = ()=>{ x[it.key] = it.kind === 'number' ? (c.value === '' ? undefined : Number(c.value)) : c.value; put(); };
      }
      wrap.appendChild(c); return wrap;
    }
    function draw(){
      list.replaceChildren();
      items.forEach((x, n)=>{
        const row = el('div', 'tl-row st-item');
        row.appendChild(el('strong', null, 'TRANSMISSION ' + (n + 1)));
        (f.item || []).forEach(it=>{
          if (!shown(it, x)) return;
          if (x[it.key] === undefined && it.key === 'at') x.at = 0;
          if (x[it.key] === undefined && it.kind === 'select' && it.key !== 'when' && (it.options || []).length) x[it.key] = it.options[0].value;
          row.appendChild(control(x, it));
        });
        row.appendChild(button('SUPPRIMER', ()=>{ items.splice(n, 1); put(); draw(); }));
        list.appendChild(row);
      });
      list.appendChild(button('AJOUTER UNE TRANSMISSION', ()=>{
        if (f.max !== undefined && items.length >= f.max){ err.textContent = f.label + ' : ' + f.max + ' boîtes au plus'; return; }
        const when = spec('when'), first = when && when.options && when.options[0];
        items.push({ id:nextId(), when:first ? first.value : 'levelStart', text:'' }); draft = true; draw();
        err.textContent = f.label + ' : écrivez le texte de la nouvelle transmission (rien n\'est enregistré tant qu\'il est vide)';
      }));
    }
    const show = doc=>{ const v = M().fieldValue(doc, f) || []; if (!draft && !same(items.map(tidy), v)){ items = clone(v); draw(); } metaShow(meta, d, f, doc, 'origine'); };
    meta.onclick = ()=>{ if (modOf(f, ctx.doc()) || draft){ items = []; if (!put()) draw(); } };
    draw();
    return { el:d, show, update:(doc, nf)=>{ f = nf; if (!hasFocus(d)) show(doc); } };
  }

  const ROWS = { number:numberRow, select:selectRow, text:textRow, bool:boolRow, numlist:numlistRow, textlist:textlistRow, objlist:objlistRow };

  /* ---------- étapes ---------- */
  const signature = steps=> steps.map(s=> s.id + ':' + s.fields.map(f=> f.kind + JSON.stringify(f.path)).join(',')).join('|');

  function renderStep(ctx, step, doc){
    const view = { rows:[] };
    const box = el('details', 'st-step'), sum = el('summary');
    const key = ctx.id + '/' + step.id;
    box.open = !!openState[key];
    box.ontoggle = ()=>{ openState[key] = !!box.open; };
    sum.appendChild(el('strong', null, step.title)); view.text = el('span', 'st-desc', step.text); sum.appendChild(view.text);
    box.appendChild(sum);
    const body = el('div', 'body'); box.appendChild(body);
    if (!step.fields.length) body.appendChild(el('p', 'sub', 'Aucun réglage dans cette étape.'));
    let group;
    step.fields.forEach(f=>{
      try {
        if (f.group && f.group !== group){ group = f.group; body.appendChild(el('h4', 'st-group', group)); }
        const make = ROWS[f.kind]; if (!make) throw new Error('genre de champ inconnu : ' + f.kind);
        const r = make(ctx, f); r.show(doc); body.appendChild(r.el); view.rows.push(r);
      } catch(e){ body.appendChild(el('div', 'warn', f.label + ' : affichage impossible (' + (e && e.message || e) + ')')); view.rows.push({ update(){} }); }
    });
    if (step.id === 'report' && doc.tuto){ const w = el('div', 'warn'); w.id = 'sumWarn'; body.appendChild(w); }
    return { box, view };
  }

  function build(ctx){
    ctx.holder.replaceChildren(); ctx.views = [];
    let doc, steps;
    try { doc = ctx.doc(); steps = M().buildSteps(doc, catalogsFor(ctx.id)); }
    catch(e){ ctx.holder.appendChild(el('div', 'warn', 'Étapes : calcul impossible (' + (e && e.message || e) + ')')); ctx.sig = null; return; }
    ctx.sig = signature(steps);
    steps.forEach(step=>{
      try { const r = renderStep(ctx, step, doc); ctx.holder.appendChild(r.box); ctx.views.push(r.view); }
      catch(e){ ctx.holder.appendChild(el('div', 'warn', step.title + ' : affichage impossible (' + (e && e.message || e) + ')')); ctx.views.push(null); }
    });
    if (doc.tuto && typeof updateSum === 'function') updateSum();
  }

  // après une modification (ici ou ailleurs : timeline, pools) : textes et valeurs remis à jour sans reconstruire (ouverture et focus conservés),
  // sauf si la liste des étapes / champs a changé (ex. un nouveau type de mob dans les vagues)
  function refresh(ctx){
    let doc, steps;
    try { doc = ctx.doc(); steps = M().buildSteps(doc, catalogsFor(ctx.id)); } catch(e){ return build(ctx); }
    if (signature(steps) !== ctx.sig) return build(ctx);
    steps.forEach((s, i)=>{
      const v = ctx.views[i]; if (!v) return;
      v.text.textContent = s.text;
      s.fields.forEach((f, j)=>{ const r = v.rows[j]; if (r) { try { r.update(doc, f); } catch(e){ /* ligne laissée telle quelle */ } } });
    });
  }

  // écrit une valeur de champ dans le brouillon ('' = ok, sinon message d'erreur) : commun au panneau des étapes et à l'inspecteur du boss
  function commitFor(ctx){
    return (field, value)=>{
      let d;
      try { d = M().applyFieldValue(ctx.doc(), field, value); } catch(e){ return String(e && e.message || e); }
      stepsStore(ctx.id, d, field);
      changed();                                 // rappelle S.refreshSteps (textes des étapes)
      if (field.path[0] === 'tutorial' && field.path[1] === 'comp' && typeof updateSum === 'function') updateSum();
      return '';
    };
  }

  // une seule étape (ex. 'boss') rendue dans `parent` : utilisée par l'inspecteur de la timeline
  function renderStepOnly(parent, level, stepId){
    const holder = el('div', 'st-list'); parent.appendChild(holder);
    const ctx = { id:level.id, holder, views:[], sig:null, doc:()=> editorLevelDocument(level.id) };
    ctx.commit = commitFor(ctx);
    try {
      const doc = ctx.doc(), step = M().buildSteps(doc, catalogsFor(ctx.id)).find(x=> x.id === stepId);
      if (!step){ holder.appendChild(el('div', 'warn', 'Étape introuvable : ' + stepId)); return; }
      const r = renderStep(ctx, step, doc); r.box.open = true; holder.appendChild(r.box);
    } catch(e){ holder.appendChild(el('div', 'warn', 'Affichage impossible (' + (e && e.message || e) + ')')); }
  }

  function renderSteps(parent, level){
    const sec = section('ETAPES DU NIVEAU', true), body = sec.querySelector('.body');
    body.appendChild(el('p', 'sub', 'Déroulé de la mission, étape par étape. Dépliez une étape pour régler ses valeurs ; une valeur orange est modifiée (cliquez sur ↺ pour revenir à l\'origine). Tout est écrit dans le JSON du niveau (EXPORTER).'));
    const holder = el('div', 'st-list'); body.appendChild(holder);
    const ctx = { id:level.id, holder, views:[], sig:null, doc:()=> editorLevelDocument(level.id) };
    ctx.commit = commitFor(ctx);
    S.refreshSteps = ()=> refresh(ctx);
    build(ctx);
    parent.appendChild(sec);
  }

  root.renderSteps = renderSteps;
  root.renderStepOnly = renderStepOnly;
  root.stepsStore = stepsStore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
