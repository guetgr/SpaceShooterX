"use strict";
// Parties de test du laboratoire (jeu ?lab, src/dev/lab.js) : tableau par mission, lu depuis /__lab/runs (fichier .editor-history/lab-runs.jsonl).
(function(){
  const btn = $('btnLabRuns'), dialog = $('labDialog'), body = $('labBody'), title = $('labTitle');
  const COLS = [
    ['at', 'Date', r=> new Date(r.at).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' }), r=> r.at],
    ['outcome', 'Issue', r=> ({ victoire:'Victoire', defaite:'Défaite', abandon:'Abandon' }[r.outcome] || r.outcome), r=> r.outcome],
    ['version', 'Version', r=> (r.version && r.version.title || '?') + (r.version && r.version.hash ? ' #' + r.version.hash : ''), r=> r.version && r.version.title || ''],
    ['elapsed', 'Durée', r=> Math.floor(r.elapsed/60) + ':' + String(r.elapsed%60).padStart(2, '0'), r=> r.elapsed],
    ['hp', 'PV restants', r=> r.hp + ' / ' + r.maxHp, r=> r.hp],
    ['taken', 'Dégâts subis', r=> r.taken, r=> r.taken],
    ['dealt', 'Dégâts infligés', r=> r.dealt.toLocaleString('fr-FR'), r=> r.dealt],
    ['kills', 'Tués', r=> r.kills, r=> r.kills],
    ['composants', '◆ encaissés', r=> r.composants, r=> r.composants],
    ['cost', 'Coût / budget', r=> r.cost + ' / ' + r.budget, r=> r.cost],
  ];
  let runs = [], sortKey = 'at', sortDir = -1, level = '';
  const el = (tag, cls, text)=> { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
  const st = document.createElement('style');
  st.textContent = '#labDialog{width:min(1180px,96vw);max-height:90vh;background:#1b222a;color:#d6dfe5;border:1px solid #3a4854;border-radius:8px;padding:0}#labDialog::backdrop{background:#000a}'
    + '.lab-head{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #2c3742}.lab-head h2{font-size:15px;margin:0}.lab-wrap{padding:12px 18px 18px;overflow:auto;max-height:72vh}'
    + '#labDialog table{width:100%;font-size:11px;border-collapse:collapse}#labDialog th{cursor:pointer;text-align:left;white-space:nowrap;color:#9fb3c0;padding:6px}#labDialog td{padding:6px;border-top:1px solid #2c3742;vertical-align:top}'
    + '#labDialog tr.ab td{opacity:.5}#labDialog td.eq{max-width:340px;font-size:10px;color:#9fb3c0}#labDialog tfoot td{font-weight:600;color:#a4d8bf}.lab-empty{color:#8095a4;padding:18px 0}';
  document.head.append(st);

  function render(){
    body.replaceChildren();
    if (!runs.length){ body.append(el('p', 'lab-empty', 'Aucune partie enregistrée pour cette mission. Lancez le LABORATOIRE depuis l’accueil du jeu (bouton en haut à gauche).')); return; }
    const col = COLS.find(c=> c[0] === sortKey) || COLS[0];
    const rows = runs.slice().sort((a, b)=> { const x = col[3](a), y = col[3](b); return (x > y ? 1 : x < y ? -1 : 0)*sortDir; });
    const table = el('table'), head = el('tr');
    COLS.forEach(c=> { const th = el('th', '', c[1] + (c[0] === sortKey ? (sortDir > 0 ? ' ▲' : ' ▼') : '')); th.onclick = ()=> { sortDir = sortKey === c[0] ? -sortDir : 1; sortKey = c[0]; render(); }; head.append(th); });
    head.append(el('th', '', 'Équipement'), el('th', '', 'Cartes / reliques'), el('th', ''));
    const th0 = el('thead'); th0.append(head); table.append(th0);
    const tb = el('tbody');
    rows.forEach(r=>{
      const tr = el('tr', r.outcome === 'abandon' ? 'ab' : '');
      COLS.forEach(c=> tr.append(el('td', '', String(c[2](r)))));
      const eq = el('td', 'eq', r.equipText || ''), cd = el('td', 'eq', (r.cards || []).join(' · '));
      const del = el('button', 'btn small', 'Supprimer'); del.onclick = async ()=> { await fetch('/__lab/runs', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ delete:r.id }) }); load(); };
      const d = el('td'); d.append(del);
      tr.append(eq, cd, d); tb.append(tr);
    });
    table.append(tb);
    const real = runs.filter(r=> r.outcome !== 'abandon'), avg = f=> real.length ? Math.round(real.reduce((s, r)=> s + f(r), 0)/real.length) : '-';
    const wins = real.filter(r=> r.outcome === 'victoire').length;
    const foot = el('tr'); foot.append(el('td', '', 'Moyennes'), el('td', '', wins + ' / ' + real.length + ' victoires'), el('td', '', ''),
      el('td', '', real.length ? Math.floor(avg(r=> r.elapsed)/60) + ':' + String(avg(r=> r.elapsed)%60).padStart(2, '0') : '-'), el('td', '', avg(r=> r.hp)), el('td', '', avg(r=> r.taken)),
      el('td', '', avg(r=> r.dealt)), el('td', '', avg(r=> r.kills)), el('td', '', avg(r=> r.composants)), el('td', '', avg(r=> r.cost)), el('td', '', '(abandons exclus)'), el('td', '', ''), el('td', ''));
    const tf = el('tfoot'); tf.append(foot); table.append(tf);
    body.append(table);
  }
  async function load(){
    try {
      const r = await fetch('/__lab/runs?level=' + encodeURIComponent(level)), o = await r.json();
      if (r.status === 404) throw new Error('Redémarrez le serveur local pour activer le laboratoire.');
      runs = o.runs || [];
    } catch(e){ runs = []; toast(e.message, true); }
    render();
  }
  btn.onclick = ()=> { level = S.sel; title.textContent = 'Parties de test · ' + level; if (!dialog.open) dialog.showModal(); load(); };
  $('labClose').onclick = ()=> dialog.close();
})();
