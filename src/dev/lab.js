"use strict";
// Laboratoire de test des niveaux (docs/superpowers/specs/2026-10-29-laboratoire-de-test-design.md). Réservé au serveur local (tools/serve.py).
//  - accueil normal : un bouton LABORATOIRE (si /__editor/ping répond) ouvre l'accueil en mode ?lab (sauvegarde EN MÉMOIRE, voir boot.js) ;
//  - ?lab : un écran choisit le niveau (version publiée ou de l'historique de l'éditeur), l'équipement (atelier, technologies) et affiche le budget de composants ;
//  - chaque partie est envoyée à /__lab/runs (fichier .editor-history/lab-runs.jsonl), lu par l'éditeur (tools/editor/lab-runs.js).
(function(){
  const q = new URLSearchParams(location.search);
  if (q.has('edit')) return;
  const LAB = q.has('lab');
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
    const o = await r.json(); if (!r.ok || !o.ok) throw new Error(o.error || 'erreur serveur'); return o;
  };
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
      const T = (l.goal && l.goal.seconds) || 120, a = l.threat || 1;
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
  function equipCost(eq){
    let c = 0; const pieces = {};
    const addP = p=> { if (p) Object.keys(p).forEach(k=>{ pieces[k] = (pieces[k] || 0) + p[k]; }); };
    ATELIER_POSTS.forEach(p=>{ for (let i = 0; i < (eq.atelier[p.id] || 0); i++){ c += ATELIER_COSTS[i]; addP(ATELIER_PIECES[i]); } });
    Object.keys(TECH_BY_ID).forEach(id=>{
      const e = eq.techs[id] || {}, owned = e.rang > 0 || e.spe || eq.load.indexOf(id) >= 0;
      if (!owned) return;
      c += rdNextCost(id, 'proto').composants;
      for (let r = 0; r < (e.rang || 0); r++) c += rdNextCost(id, 'rang', r).composants;
      if (e.spe){ const s = rdNextCost(id, 'spe'); c += s.composants; addP(s.pieces); }
    });
    return { c, pieces };
  }
  function buildMeta(eq){
    const m = defaultMeta();
    ATELIER_POSTS.forEach(p=>{ m.atelier[p.id] = eq.atelier[p.id] || 0; });
    Object.keys(TECH_BY_ID).forEach(id=>{
      const e = eq.techs[id] || {};
      if (e.rang > 0 || e.spe || eq.load.indexOf(id) >= 0) m.rd[id] = { plan:true, proto:true, rang:e.rang || 0, spe:!!e.spe };
    });
    m.chargement = eq.load.slice();
    return m;
  }
  function equipText(eq){
    const a = ATELIER_POSTS.filter(p=> eq.atelier[p.id] > 0).map(p=> p.name + ' MK ' + ROMAN[eq.atelier[p.id]]);
    const t = Object.keys(TECH_BY_ID).filter(id=> eq.techs[id] && (eq.techs[id].rang > 0 || eq.techs[id].spe) || eq.load.indexOf(id) >= 0).map(id=>{
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
    json(RUNS, { run }).then(()=> { if (ui) ui.runs.push(run); toast('Partie enregistrée'); }).catch(e=> toast('Enregistrement impossible : ' + e.message));
  }

  // ---------------------------------------------------------------- écran du laboratoire
  let ui = null, toastEl = null;
  function toast(t){
    if (!toastEl){ toastEl = h('div', { class:'lab-toast' }); document.body.append(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toastEl._t); toastEl._t = setTimeout(()=> toastEl.classList.remove('show'), 2400);
  }
  const CSS = `
  .lab-btn{position:fixed;left:8px;top:8px;z-index:9000;font:11px/1 monospace;letter-spacing:1px;color:#9fe3c3;background:#0a1512cc;border:1px solid #2f5a49;padding:7px 10px;cursor:pointer;display:none}
  .lab-btn.on{display:block}
  .lab-root{position:fixed;inset:0;z-index:60000;background:#070a09f2;color:#d9e3dc;font:13px/1.5 monospace;overflow:auto;display:none}
  .lab-root.on{display:block}
  .lab-in{max-width:780px;margin:0 auto;padding:18px 16px 110px}
  .lab-in h1{font-size:18px;letter-spacing:2px;margin:0 0 4px;color:#9fe3c3}
  .lab-in h2{font-size:12px;letter-spacing:2px;color:#e0b95a;margin:22px 0 8px;border-bottom:1px solid #26332d;padding-bottom:4px}
  .lab-in p,.lab-note{color:#8fa399;font-size:12px;margin:4px 0}
  .lab-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:5px 0}
  .lab-row>label{min-width:190px}
  .lab-in select,.lab-in button{background:#101a16;color:#d9e3dc;border:1px solid #2f4a3e;padding:5px 8px;font:inherit;cursor:pointer}
  .lab-in button.go{background:#9fe3c3;color:#0a1512;border-color:#9fe3c3;font-weight:700;padding:9px 18px}
  .lab-tech{display:grid;grid-template-columns:1fr auto auto auto;gap:10px;align-items:center;padding:4px 0;border-bottom:1px solid #18221d}
  .lab-tech small{color:#7b9187}
  .lab-bar{position:fixed;left:0;right:0;bottom:0;background:#0b1210;border-top:1px solid #2f4a3e;padding:10px 16px}
  .lab-bar .in{max-width:780px;margin:0 auto;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .lab-gauge{height:8px;background:#18221d;margin-top:5px;position:relative;min-width:240px}
  .lab-gauge i{position:absolute;inset:0 auto 0 0;background:#9fe3c3}
  .lab-gauge.mid i{background:#e0b95a}.lab-gauge.over i{background:#e0605a}
  .lab-in details{border:1px solid #26332d;padding:6px 10px;margin:8px 0}
  .lab-in summary{cursor:pointer;color:#bcd0c6}
  .lab-toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#1d3a2f;border:1px solid #4a8a6c;color:#d9f5e6;padding:9px 16px;z-index:70000;opacity:0;pointer-events:none;transition:opacity .15s;font:12px monospace}
  .lab-toast.show{opacity:1}
  `;

  async function loadRuns(){ try { return (await json(RUNS)).runs; } catch(e){ return []; } }

  function buildUi(){
    document.head.append(h('style', {}, CSS));
    const levels = allLevels();
    const st = { levelId:levels[0].id, versionId:'', versions:[], equip:emptyEquip() };
    ui = { runs:[] };
    const root = h('div', { class:'lab-root' }), inner = h('div', { class:'lab-in' });
    root.append(inner); document.body.append(root);
    ui.show = async ()=>{ ui.runs = await loadRuns(); render(); root.classList.add('on'); };
    ui.hide = ()=> root.classList.remove('on');
    ui.visible = ()=> root.classList.contains('on');

    async function loadVersions(){
      st.versions = []; st.versionId = '';
      try { st.versions = (await json(VERSIONS + '?level=' + encodeURIComponent(st.levelId))).versions; } catch(e){ /* historique indisponible */ }
    }
    function lastEquip(){
      const mine = ui.runs.filter(r=> r.levelId === st.levelId && r.equip).sort((a, b)=> (a.at || 0) - (b.at || 0));
      return mine.length ? JSON.parse(JSON.stringify(mine[mine.length - 1].equip)) : emptyEquip();
    }
    async function pickLevel(id){ st.levelId = id; st.equip = lastEquip(); await loadVersions(); render(); }

    function render(){
      const idx = levels.findIndex(l=> l.id === st.levelId), lvl = levels[idx];
      const bud = budgetBefore(levels, idx, ui.runs), cost = equipCost(st.equip);
      const eq = st.equip, mineRuns = ui.runs.filter(r=> r.levelId === st.levelId);
      const rerender = ()=> { const y = root.scrollTop; render(); root.scrollTop = y; };

      const lvlSel = h('select', { onchange:e=> pickLevel(e.target.value) }, levels.map(l=> h('option', { value:l.id, selected:l.id === st.levelId }, (l.tuto ? 'TUTO' : String(l.id).toUpperCase()) + ' · ' + l.name)));
      const verSel = h('select', { onchange:e=> { st.versionId = e.target.value; } },
        h('option', { value:'' }, 'Version publiée (actuelle)'),
        st.versions.map(v=> h('option', { value:v.id, selected:v.id === st.versionId }, v.title + ' · ' + new Date(v.createdAt).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' }))));

      const atelier = ATELIER_POSTS.map(p=> h('div', { class:'lab-row' }, h('label', {}, p.name),
        h('select', { onchange:e=> { eq.atelier[p.id] = +e.target.value; rerender(); } },
          [0, 1, 2, 3, 4, 5].map(mk=> h('option', { value:mk, selected:(eq.atelier[p.id] || 0) === mk }, mk ? 'Mk ' + ROMAN[mk] + ' · ' + ATELIER_COSTS.slice(0, mk).reduce((s, c)=> s + c, 0) + ' ◆' : 'base')))));

      const techs = TECHS.filter(techAvailable).map(t=>{
        const e = eq.techs[t.id] || (eq.techs[t.id] = { rang:0, spe:false }), max = techMaxRang(t), on = eq.load.indexOf(t.id) >= 0;
        return h('div', { class:'lab-tech' },
          h('div', {}, h('b', {}, t.name), ' ', h('small', {}, 'secteur ' + t.sector + (t.tag ? ' · ' + t.tag : ''))),
          h('label', {}, h('input', { type:'checkbox', checked:on, onchange:ev=>{
            const next = ev.target.checked ? eq.load.concat(t.id) : eq.load.filter(i=> i !== t.id);
            const chk = loadoutCheck(buildMetaWith(eq, next), next, BAYS);
            if (!chk.ok){ toast('Chargement refusé : ' + ({ arme:'une seule ARME', rampe:'une seule RAMPE', baies:BAYS + ' baies maximum' }[chk.reason] || chk.reason)); rerender(); return; }
            eq.load = next; rerender(); } }), ' emporté'),
          h('select', { onchange:ev=> { e.rang = +ev.target.value; if (e.rang < max) e.spe = false; rerender(); } },
            Array.from({ length:max + 1 }, (_, r)=> h('option', { value:r, selected:e.rang === r }, 'rang ' + r + '/' + max))),
          t.spe ? h('label', {}, h('input', { type:'checkbox', checked:!!e.spe, disabled:e.rang < max, onchange:ev=> { e.spe = ev.target.checked; rerender(); } }), ' spé.') : h('span', {}));
      });

      const pct = bud.mid > 0 ? Math.min(100, cost.c/bud.mid*100) : (cost.c > 0 ? 100 : 0);
      const gauge = h('div', { class:'lab-gauge' + (cost.c > bud.max ? ' over' : cost.c > bud.mid ? ' mid' : '') }, h('i', { style:'width:' + pct + '%' }));
      const pcs = Object.keys(cost.pieces).map(k=> cost.pieces[k] + '× pièce ' + k).join(', ');
      const recent = mineRuns.slice(-5).reverse();

      const parts = [
        h('div', { class:'lab-row' }, h('h1', {}, 'LABORATOIRE DE TEST'), h('span', { style:'flex:1' }), h('button', { onclick:()=> { location.href = location.pathname; } }, 'QUITTER')),
        h('p', {}, 'Sauvegarde en mémoire : votre progression n’est jamais touchée. Chaque partie est enregistrée avec son équipement et affichée dans l’éditeur.'),
        h('h2', {}, 'MISSION'),
        h('div', { class:'lab-row' }, h('label', {}, 'Ordre'), lvlSel),
        h('div', { class:'lab-row' }, h('label', {}, 'Version du niveau'), verSel),
        h('p', {}, mineRuns.length + ' partie(s) enregistrée(s) pour cet ordre.' + (recent.length ? ' Dernières : ' + recent.map(r=> r.outcome + ' ' + r.elapsed + ' s').join(' · ') : '')),
        h('h2', {}, 'BUDGET DE COMPOSANTS'),
        idx === 0
          ? h('p', {}, 'Tuto : vous êtes censé jouer avec 0 ◆ d’amélioration. Tout reste équipable pour tester.')
          : h('p', {}, 'Censé avoir été récolté avant cet ordre : ≈ ' + money(bud.mid) + ' (de ' + money(bud.min) + ' à ' + money(bud.max) + ').'),
        idx === 0 ? null : h('details', {}, h('summary', {}, 'Détail par ordre précédent'), bud.rows.map(r=> h('div', { class:'lab-note' }, r.name + ' — ' + money(r.val) + ' (' + r.src + ')'))),
        h('h2', {}, 'ATELIER'), atelier,
        h('h2', {}, 'TECHNOLOGIES'),
        h('p', {}, 'Le coût comprend le prototype, les rangs et la spécialisation (rangs au maximum). ' + BAYS + ' baies, une seule arme et une seule rampe.'),
        techs,
        h('div', { class:'lab-bar' }, h('div', { class:'in' },
          h('div', {}, h('div', {}, 'Coût de l’équipement : ', h('b', {}, money(cost.c)), idx === 0 ? ' · budget 0 ◆' : ' / budget ≈ ' + money(bud.mid) + (cost.c > bud.mid ? ' · dépassement ' + money(cost.c - bud.mid) : ' · reste ' + money(bud.mid - cost.c)), pcs ? ' · ' + pcs : ''), gauge),
          h('button', { class:'go', onclick:()=> launch(lvl, cost, bud) }, 'LANCER LA MISSION')))];
      inner.replaceChildren(...parts.flat().filter(Boolean));
    }
    function buildMetaWith(eq, load){ return buildMeta(Object.assign({}, eq, { load })); }

    async function launch(lvl, cost, bud){
      const eq = st.equip; let version = null;
      try {
        if (st.versionId){
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
    loadRuns().then(r=> { ui.runs = r; return pickLevel(st.levelId); }).then(()=> ui.show());
  }

  // ---------------------------------------------------------------- démarrage
  function init(){
    if (LAB){
      slotsOpen = ()=> BAYS;          // laboratoire : toutes les baies sont ouvertes
      hookGame(); buildUi();
      // retour au bureau depuis un rapport : l'écran du laboratoire revient
      setInterval(()=> { if (ui && !ui.visible() && !ui.launching && document.body.classList.contains('at-home')) ui.show(); }, 400);
    } else {
      fetch('/__editor/ping').then(r=> r.ok ? r.json() : null).then(o=>{
        if (!o || !o.ok) return;
        document.head.append(h('style', {}, CSS));
        const b = h('button', { class:'lab-btn', onclick:()=> { location.href = location.pathname + '?lab'; } }, 'LABORATOIRE');
        document.body.append(b);
        setInterval(()=> b.classList.toggle('on', document.body.classList.contains('at-home')), 400);
      }).catch(()=>{});
    }
  }
  const wait = setInterval(()=>{ if (window.__phaserGame && typeof GameScene !== 'undefined'){ clearInterval(wait); init(); } }, 200);
})();
