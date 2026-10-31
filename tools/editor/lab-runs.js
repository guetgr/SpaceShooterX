"use strict";
// Parties de test du laboratoire (jeu ?lab, src/dev/lab.js), lues depuis /__lab/runs (fichier .editor-history/lab-runs.jsonl) :
// tableau compact sous le cadre du laboratoire (plus récent en haut), grand tableau dans la boîte « Parties de test », export CSV.
(function(){
  const btn = $('btnLabRuns'), dialog = $('labDialog'), body = $('labBody'), title = $('labTitle');
  const mmss = t=> Math.floor(t/60) + ':' + String(t%60).padStart(2, '0');
  const when = (r, compact)=> { const d = new Date(r.at); return compact && new Date().toDateString() === d.toDateString() ? d.toLocaleTimeString('fr-FR', { timeStyle:'short' }) : d.toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' }); };
  const VER = r=> (r.version && r.version.title || '?') + (r.version && r.version.hash ? ' #' + r.version.hash : '');
  const COLS = [
    ['at', 'Date', (r, c)=> when(r, c), r=> r.at],
    ['outcome', 'Issue', r=> ({ victoire:'Victoire', defaite:'Défaite', abandon:'Abandon' }[r.outcome] || r.outcome), r=> r.outcome],
    ['version', 'Version', r=> VER(r), r=> r.version && r.version.title || ''],
    ['elapsed', 'Durée', r=> mmss(r.elapsed), r=> r.elapsed],
    ['hp', 'PV', r=> r.hp + '/' + r.maxHp, r=> r.hp],
    ['taken', 'Subis', r=> r.taken, r=> r.taken],
    ['dealt', 'Infligés', r=> r.dealt.toLocaleString('fr-FR'), r=> r.dealt],
    ['kills', 'Tués', r=> r.kills, r=> r.kills],
    ['composants', '◆', r=> r.composants, r=> r.composants],
    ['cost', 'Coût/budget', r=> r.cost + ' / ' + r.budget, r=> r.cost],
  ];
  const COMPACT = ['at', 'outcome', 'version', 'elapsed', 'hp', 'composants'];
  let runs = [], sortKey = 'at', sortDir = -1;
  const el = (tag, cls, text)=> { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const st = document.createElement('style');
  st.textContent = '#labDialog{width:min(1180px,96vw);max-height:90vh;background:#1b222a;color:#d6dfe5;border:1px solid #3a4854;border-radius:8px;padding:0}#labDialog::backdrop{background:#000a}'
    + '.lab-head{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #2c3742}.lab-head h2{font-size:15px;margin:0}.lab-wrap{padding:12px 18px 18px;overflow:auto;max-height:72vh}'
    + '.runs-table{width:100%;font-size:11px;border-collapse:collapse}.runs-table th{cursor:pointer;text-align:left;white-space:nowrap;color:#9fb3c0;padding:6px}.runs-table td{padding:6px;border-top:1px solid #2c3742;vertical-align:top}'
    + '.runs-table tr.ab td{opacity:.5}.runs-table tr.win td:nth-child(2){color:#8fd6a8}.runs-table tr.lose td:nth-child(2){color:#e08a8a}.runs-table td.eq{max-width:340px;font-size:10px;color:#9fb3c0}.runs-table tfoot td{font-weight:600;color:#a4d8bf}.lab-empty{color:#8095a4;padding:10px 0;font-size:11px}';
  document.head.append(st);

  function render(target, compact){
    target.replaceChildren();
    if (!runs.length){ target.append(el('p', 'lab-empty', 'Aucune partie enregistrée pour cette mission : lancez un test dans le laboratoire.')); return; }
    const cols = COLS.filter(c=> !compact || COMPACT.indexOf(c[0]) >= 0);
    const col = COLS.find(c=> c[0] === sortKey) || COLS[0];
    const rows = runs.slice().sort((a, b)=> { const x = col[3](a), y = col[3](b); return (x > y ? 1 : x < y ? -1 : 0)*sortDir; });
    const table = el('table', 'runs-table'), head = el('tr');
    cols.forEach(c=> { const th = el('th', '', c[1] + (c[0] === sortKey ? (sortDir > 0 ? ' ▲' : ' ▼') : '')); th.onclick = ()=> { sortDir = sortKey === c[0] ? -sortDir : 1; sortKey = c[0]; renderAll(); }; head.append(th); });
    if (!compact) head.append(el('th', '', 'Équipement'), el('th', '', 'Cartes / reliques'));
    head.append(el('th', ''));
    const th0 = el('thead'); th0.append(head); table.append(th0);
    const tb = el('tbody');
    rows.forEach(r=>{
      const tr = el('tr', r.outcome === 'abandon' ? 'ab' : r.outcome === 'victoire' ? 'win' : 'lose'); tr.title = (r.equipText || '') + ((r.cards || []).length ? '\n' + r.cards.join(' · ') : '');
      cols.forEach(c=> tr.append(el('td', '', String(c[2](r, compact)))));
      if (!compact) tr.append(el('td', 'eq', r.equipText || ''), el('td', 'eq', (r.cards || []).join(' · ')));
      const del = el('button', 'btn small', compact ? '×' : 'Supprimer'); del.title = 'Supprimer cette partie';
      del.onclick = async ()=> { await fetch('/__lab/runs', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ delete:r.id }) }); load(); };
      const d = el('td'); d.append(del); tr.append(d); tb.append(tr);
    });
    table.append(tb);
    const real = runs.filter(r=> r.outcome !== 'abandon'), avg = f=> real.length ? Math.round(real.reduce((s, r)=> s + f(r), 0)/real.length) : '-';
    const wins = real.filter(r=> r.outcome === 'victoire').length;
    const foot = { at:'Moyennes', outcome:wins + '/' + real.length + ' vict.', version:'', elapsed:real.length ? mmss(avg(r=> r.elapsed)) : '-', hp:avg(r=> r.hp), taken:avg(r=> r.taken), dealt:avg(r=> r.dealt), kills:avg(r=> r.kills), composants:avg(r=> r.composants), cost:avg(r=> r.cost) };
    const tr = el('tr'); cols.forEach(c=> tr.append(el('td', '', String(foot[c[0]])))); tr.append(el('td', '', '')); if (!compact) tr.append(el('td', '', ''), el('td', ''));
    const tf = el('tfoot'); tf.append(tr); table.append(tf);
    target.append(table);
  }
  function renderAll(){ if (dialog.open) render(body, false); const tb = $('labTabBody'); if (tb) render(tb, true); }
  async function load(){
    try {
      const r = await fetch('/__lab/runs?level=' + encodeURIComponent(S.sel)), o = await r.json();
      if (r.status === 404) throw new Error('Redémarrez le serveur local pour activer le laboratoire.');
      runs = o.runs || [];
    } catch(e){ runs = []; toast(e.message, true); }
    renderAll();
  }
  // export CSV (Excel : séparateur « ; », BOM UTF-8) de la mission ou de toutes les parties
  async function csv(all){
    const r = await fetch('/__lab/runs' + (all ? '' : '?level=' + encodeURIComponent(S.sel))), o = await r.json(), list = o.runs || [];
    if (!list.length){ toast('Aucune partie à exporter', true); return; }
    const head = ['date', 'mission', 'issue', 'version', 'empreinte', 'durée (s)', 'PV restants', 'PV max', 'dégâts subis', 'dégâts infligés', 'tués', 'composants', 'coût équipement', 'budget', 'équipement', 'cartes'];
    const q = v=> '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"';
    const lines = [head.map(q).join(';')].concat(list.sort((a, b)=> a.at - b.at).map(r=> [new Date(r.at).toISOString(), r.levelId, r.outcome, r.version && r.version.title, r.version && r.version.hash, r.elapsed, r.hp, r.maxHp, r.taken, r.dealt, r.kills, r.composants, r.cost, r.budget, r.equipText, (r.cards || []).join(' · ')].map(q).join(';')));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n') + '\n'], { type:'text/csv;charset=utf-8' }));
    a.download = 'parties-test-' + (all ? 'toutes' : S.sel) + '-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
  }
  window.LabRuns = { refresh:load };
  btn.onclick = ()=> { title.textContent = 'Parties de test · ' + S.sel; if (!dialog.open) dialog.showModal(); load(); };
  $('labClose').onclick = ()=> dialog.close();
  $('runsCsv').onclick = ()=> csv(false); $('runsCsvAll').onclick = ()=> csv(true);
  const wait = setInterval(()=> { if (S.ready){ clearInterval(wait); load(); } }, 400);
})();
