"use strict";
// Méthodes de GameScene — pages du menu : classement, stats, bestiaire, collection, pactes, succès, pause.
mixin(GameScene, {
  getTextureFrameDataURL(key, frame, tint){
    try {
      const tex = this.textures.get(key);
      const f = (frame !== undefined) ? tex.get(frame) : tex.get();
      const canvas = document.createElement('canvas');
      canvas.width = f.width; canvas.height = f.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
      if (tint){
        // même teinte (multiplication) que celle appliquée au sprite en jeu, en gardant la transparence
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = '#' + tint.toString(16).padStart(6,'0');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.width, f.height);
      }
      return canvas.toDataURL();
    } catch(e){
      return '';
    }
  },

  renderLeaderboardPage(){
    const list = document.getElementById('lbList');
    list.innerHTML = '';
    const rows = getLeaderboard().slice(0,10);
    if (!rows.length){
      list.innerHTML = '<div class="controls-hint" style="text-align:center;">Aucune partie enregistrée pour l\'instant.<br>Termine une run pour apparaître ici !</div>';
      return;
    }
    rows.forEach((r,i)=>{
      const div = document.createElement('div');
      div.className = 'lb-row' + (r.id === this.lastEntryId ? ' me' : '');
      const m = Math.floor((r.time||0)/60), sec = (r.time||0)%60;
      const rank = document.createElement('span'); rank.className='lb-rank'; rank.textContent = (i+1);
      const nm = document.createElement('span'); nm.className='lb-name'; nm.textContent = r.name || 'ANONYME';
      const meta = document.createElement('span'); meta.className='lb-meta'; meta.textContent = m+':'+String(sec).padStart(2,'0')+' · A'+(r.alert||1);
      const sc = document.createElement('span'); sc.className='lb-score'; sc.textContent = r.score;
      div.append(rank, nm, meta, sc);
      list.appendChild(div);
    });
  },

  // compétences prises dans la partie en cours (actives automatiquement): reliques, fusions et cartes, 18 par page
  pauseGearItems(){
    const items = [];
    (this.relics||[]).forEach(r=> items.push({ icon:r.icon, name:r.name, desc:r.desc, count:1, kind:'RELIQUE' }));
    FUSIONS.forEach(f=>{ const c = this.upgradeCounts[f.id]||0; if (c > 0) items.push({ icon:f.icon, name:f.name, desc:f.desc, count:c, kind:'FUSION' }); });
    UPGRADE_POOL.forEach(u=>{ const c = this.upgradeCounts[u.id]||0; if (c > 0) items.push({ icon:u.icon, name:u.name, desc:u.desc, count:c, kind:'CARTE' }); });
    return items;
  },

  // atouts GLOBAUX : les postes de l'atelier et les modules du catalogue R&D achetés (permanents, appliqués à chaque mission, jamais perdus)
  globalGearItems(){
    const out = [];
    ATELIER_POSTS.forEach(p=>{
      const mk = atelierMk(this.meta && this.meta.atelier, p.id); if (mk <= 0) return;
      out.push({ icon:'🔧', name:p.name + ' MK ' + ROMAN[mk], desc:p.text, count:mk, max:ATELIER_MAX, kind:'GLOBAL' });
    });
    Object.keys(this.techState || {}).forEach(id=>{
      const t = TECH_BY_ID[id], ts = this.techState[id];
      out.push({ icon:t.icon, name:t.name + ' · ' + (ts.assembled ? 'ASSEMBLEE' : 'NON ASSEMBLEE'), desc:t.desc, count:ts.rang, max:techMaxRang(t), kind:'GLOBAL' });
    });
    return out;
  },

  // texte « atouts globaux actifs » (début de mission) : combien de modules R&D et ce qu'ils apportent aux caractéristiques de base
  globalGearSummary(){
    const g = this.globalGearItems(); if (!g.length) return '';
    const b = this.gearBonus || {}, parts = [];
    if (b.dmg > 0.005) parts.push('+' + Math.round(b.dmg*100) + ' % de charge');
    if (b.hp >= 1) parts.push('+' + Math.round(b.hp) + ' de coque');
    if (b.shield >= 1) parts.push('+' + Math.round(b.shield) + ' de champ de sécurité');
    return 'Camionnette équipée : ' + g.length + (g.length > 1 ? ' atouts globaux actifs' : ' atout global actif') + (parts.length ? ' (' + parts.join(', ') + ')' : '') + '.';
  },

  renderPauseGear(keepPage){
    const G = this.globalGearItems(), M = this.pauseGearItems();
    if (!this.pgTab) this.pgTab = G.length || !M.length ? 'global' : 'mission';
    const isG = this.pgTab === 'global', items = isG ? G : M, per = 18, pages = Math.max(1, Math.ceil(items.length/per));
    document.getElementById('pgTabG').classList.toggle('on', isG); document.getElementById('pgTabM').classList.toggle('on', !isG);
    document.getElementById('pgNG').textContent = G.length ? G.length : ''; document.getElementById('pgNM').textContent = M.length ? M.length : '';
    document.getElementById('pgTitle').textContent = isG ? 'R&D · PERMANENTS, TOUJOURS ACTIFS' : 'CETTE MISSION SEULEMENT';
    document.getElementById('pauseGear').classList.toggle('g-global', isG);
    if (!keepPage) this.pgPageNo = 0;
    this.pgPageNo = Math.min(Math.max(0, this.pgPageNo||0), pages-1);
    const grid = document.getElementById('pgGrid'); grid.innerHTML = '';
    items.slice(this.pgPageNo*per, (this.pgPageNo+1)*per).forEach(it=>{
      const b = document.createElement('button'); b.className = 'pg-it' + (it.kind === 'RELIQUE' ? ' rel' : '') + (isG ? ' glob' : '');
      b.innerHTML = pxImg(it.icon, 24) + (it.count > 1 ? '<b>x'+it.count+'</b>' : '');
      b.onclick = ()=>{
        sfx.uiSelect(); grid.querySelectorAll('.pg-it').forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
        document.getElementById('pgDetail').innerHTML = '<em>' + it.name + '</em>' + (isG ? ' (rang ' + it.count + '/' + it.max + ') · <u>ATOUT GLOBAL</u> : permanent' : (it.count > 1 ? ' (niveau ' + it.count + ')' : '') + ' · <u>ATOUT DE MISSION</u> (' + it.kind.toLowerCase() + ')') + '<br>' + it.desc;
      };
      grid.appendChild(b);
    });
    if (!items.length) document.getElementById('pgDetail').textContent = isG ? "Aucun atout global : commandez des modules au catalogue R&D, ils s'activeront à chaque mission." : "Aucun atout de mission pour l'instant : montez de niveau pour en choisir.";
    else if (!keepPage) document.getElementById('pgDetail').textContent = isG ? "Ces atouts viennent du catalogue R&D : actifs dès le décollage, à chaque mission, pour toujours." : "Ces atouts ont été choisis pendant cette intervention : ils disparaissent à la fin.";
    document.getElementById('pgCount').textContent = (G.length + M.length) ? '(' + G.length + ' · ' + M.length + ')' : '';
    document.getElementById('pgPage').textContent = pages > 1 ? ('PAGE ' + (this.pgPageNo+1) + '/' + pages) : '';
    document.querySelector('#pauseGear .pg-nav').style.display = pages > 1 ? 'flex' : 'none';
  },

  renderStatsPage(){
    if (this.syncNameInputs) this.syncNameInputs();
    const live = this.infoReturnTo === 'pause' && this.stats;       // ouvert depuis la pause: ce sont les stats de la partie en cours
    const s = live ? this.stats : computeStartingStatsPreview();
    const rows = (live ? [
      ['NIVEAU / ALERTE', 'LV.' + this.level + ' / ' + this.alertLevel],
      ['TEMPS', Math.floor(this.elapsed/60) + ':' + String(Math.floor(this.elapsed%60)).padStart(2,'0')],
      ['PV ACTUELS', Math.round(this.hp) + ' / ' + Math.round(s.maxHp)],
    ] : []).concat([
      ['PV MAX', Math.round(s.maxHp)],
      ['BOUCLIER MAX', Math.round(s.shieldMax)],
      ['DEGATS PAR TIR', s.damage.toFixed(1)],
      ['CADENCE DE TIR', (1000/s.fireRate).toFixed(2) + ' tirs/s'],
      ['VITESSE DES TIRS', Math.round(s.bulletSpeed)],
      ['PROJECTILES', s.spreadCount],
      ['PERFORATION', s.pierce],
      ['MISSILES DE DEPART', s.missileCount],
      ['PORTEE AIMANT', Math.round(s.magnetRadius)],
      ['REACTIVITE VAISSEAU', s.moveResponsiveness.toFixed(1)],
      ['CHANCE CRITIQUE', Math.round(s.critChance*100) + '%'],
      ['REGEN PV', (s.hpRegenPct*100).toFixed(1) + '%/s'],
      ['ARMURE (REDUC. DEGATS)', Math.round(s.armorPct*100) + '%'],
      ['DEGATS DE COLLISION', Math.round(COLLISION_DMG_MUL*(s.collisionMul||1)*100) + '%'],
      ['VOL DE VIE', (s.lifesteal*100).toFixed(1) + '%'],
      ['BONUS XP', Math.round(s.xpBonus*100) + '%'],
      ['BONUS FRAGMENTS', Math.round(s.fragmentBonus*100) + '%'],
    ]);
    const list = document.getElementById('statsList');
    list.innerHTML = rows.map(r=>
      '<div class="stat-row"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'
    ).join('');
  },

  renderBestiaryPage(){
    const grid = document.getElementById('bestiaryGrid');
    grid.innerHTML = '';
    let seen = 0;
    BESTIARY_LIST.forEach(entry=>{
      const count = this.bestiary.kills[entry.type] || 0;
      if (!DEV_SEE_ALL && count === 0) return;               // pas encore rencontré: il n'apparaît pas
      seen++;
      const bdef = entry.bossId ? BOSS_DEFS[entry.bossId] : null;
      const bart = entry.bossId && BOSS_SPRITES[entry.bossId];
      const src = bart ? this.getTextureFrameDataURL(bart.prev || bart.tex0, 0) : (bdef ? this.getTextureFrameDataURL(bdef.tex, 0, bdef.tint) : this.getTextureFrameDataURL(entry.tex, entry.frame));
      const cell = document.createElement('div');
      cell.className = 'bestiary-cell';
      cell.innerHTML =
        '<img src="'+src+'" alt="'+entry.label+'">'+
        '<div class="bestiary-name">'+entry.label+'</div>'+
        '<div class="bestiary-count'+(count===0?' zero':'')+'">'+count+' tué'+(count>1?'s':'')+'</div>';
      grid.appendChild(cell);
    });
    const note = document.createElement('div');
    note.style.cssText = 'grid-column:1/-1; text-align:center; font-family:SSX Text,monospace; font-size:15px; color:#8f98c8; padding:6px 0;';
    note.textContent = seen === 0 ? "Aucun ennemi rencontré pour l'instant : va les affronter !" : seen + ' / ' + BESTIARY_LIST.length + ' ennemis découverts';
    grid.appendChild(note);
  },

  renderCodexPage(){
    const list = document.getElementById('codexList');
    list.innerHTML = '';
    const cdx = this.codex || getCodex(), dev = DEV_SEE_ALL, meta = this.meta || getMeta();
    const sec = (txt, col)=>{ const d = document.createElement('div'); d.className = 'ach-sec'; if (col) d.style.color = col; d.textContent = txt; list.appendChild(d); };
    const sub = (txt)=>{ const d = document.createElement('div'); d.className = 'cdx-sub'; d.textContent = txt; list.appendChild(d); };
    const row = (icon, name, desc, got)=>{
      const d = document.createElement('div');
      d.className = 'cdx-row ' + (got ? 'got' : 'locked');
      d.innerHTML = '<div class="ci"></div><div class="cm"><div class="cn"></div><div class="cd"></div></div>';
      d.querySelector('.ci').innerHTML = pxImg(icon, 28);
      d.querySelector('.cn').textContent = name;
      d.querySelector('.cd').textContent = desc;
      list.appendChild(d);
    };
    // règle: un élément apparaît dès qu'il est débloqué (en grisé), et passe en normal quand on l'a utilisé au moins une fois en jeu
    const BOSS_LABEL = { dread:'DREADNOUGHT', faucheuse:'FAUCHEUSE', ruche:'RUCHE', prisme:'PRISME', kraken:'KRAKEN', eclipse:'ECLIPSE', hydre:'HYDRE' };
    const bossKey = id => id === 'dread' ? 'boss' : 'boss_' + id;
    let usedR = 0, totR = 0, shownAny = false;
    BOSS_ORDER.forEach(id=> RELICS[id].forEach(r=>{ totR++; if (cdx.relics[r.id]) usedR++; }));
    sec('RELIQUES DE BOSS  ' + usedR + '/' + totR);
    BOSS_ORDER.forEach(id=>{
      const met = dev || (this.bestiary.kills[bossKey(id)] || 0) > 0;
      const rows = RELICS[id].filter(r=> met || cdx.relics[r.id]);
      if (!rows.length) return;
      shownAny = true; sub(BOSS_LABEL[id] || id.toUpperCase());
      rows.forEach(r=> row(r.icon, r.name, r.desc, !!cdx.relics[r.id]));
    });
    if (!shownAny){ const d = document.createElement('div'); d.className = 'cdx-sub'; d.textContent = 'Bats un boss pour découvrir ses reliques.'; list.appendChild(d); }

    const fus = FUSIONS.filter(f=> dev || cdx.fusions[f.id] || !f.techs || f.techs.every(t=> rdEntry(meta, t).proto));
    sec('FUSIONS DE CARTES  ' + FUSIONS.filter(f=>cdx.fusions[f.id]).length + '/' + FUSIONS.length);
    fus.forEach(f=> row(f.icon, f.name, f.desc, !!cdx.fusions[f.id]));
    const cards = UPGRADE_POOL;
    sec('CARTES DE NIVEAU  ' + UPGRADE_POOL.filter(u=>cdx.cards[u.id]).length + '/' + UPGRADE_POOL.length);
    cards.forEach(u=> row(u.icon, u.name, u.desc, !!cdx.cards[u.id]));

    const techs = TECHS.filter(t=> techAvailable(t)), gs = techs.filter(t=> cdx.usedSkills[t.id]).length, ts = techs.length;
    sec('TECHNOLOGIES  ' + gs + '/' + ts);
    techs.filter(t=> dev || cdx.skills[t.id]).forEach(t=> row(t.icon, t.name, t.desc, !!cdx.usedSkills[t.id]));
    document.getElementById('codexSummary').textContent = 'Reliques ' + usedR + '/' + totR + ' · Fusions ' + FUSIONS.filter(f=>cdx.fusions[f.id]).length + '/' + FUSIONS.length + ' · Cartes ' + UPGRADE_POOL.filter(u=>cdx.cards[u.id]).length + '/' + UPGRADE_POOL.length + ' · Technologies ' + gs + '/' + ts + '  —  en grisé : débloqué, pas encore utilisé en jeu';
  },

  renderPactsPage(){
    const list = document.getElementById('pactsList');
    list.innerHTML = '';
    const act = getPacts();
    PACTS.forEach(pc=>{
      const on = act.indexOf(pc.id) >= 0;
      const b = document.createElement('button');
      b.className = 'pact-row' + (on ? ' on' : '');
      b.innerHTML = '<div class="pi"></div><div class="pm"><div class="pn"></div><div class="pd"></div></div><div class="pb"></div>';
      b.querySelector('.pi').innerHTML = pxImg(pc.icon, 30);
      b.querySelector('.pn').textContent = pc.name;
      b.querySelector('.pd').textContent = pc.desc;
      b.querySelector('.pb').innerHTML = (on ? 'ACTIF ' : '') + '+' + Math.round(pc.bonus*100) + '% ' + uiIco('frag');
      b.onclick = ()=>{
        sfx.pactSign();
        const cur = getPacts(), i = cur.indexOf(pc.id);
        if (i >= 0) cur.splice(i,1); else cur.push(pc.id);
        setPacts(cur);
        this.renderPactsPage();
      };
      list.appendChild(b);
    });
    const total = pactBonus(act);
    document.getElementById('pactsSummary').textContent = act.length
      ? act.length + ' pacte(s) actif(s) pour la prochaine partie · fragments gagnés x' + (1+total).toFixed(2)
      : 'Choisis des règles plus dures pour la prochaine partie : plus tu prends de risques, plus tu gagnes de fragments.';
  },

  renderAchievementsPage(){
    const a = this.achv;
    const list = document.getElementById('achvList');
    list.innerHTML = '';
    const buffs = getAchvBuffs(a);
    const parts = [];
    if (buffs.dmg) parts.push('+' + Math.round(buffs.dmg*100) + '% dégâts');
    if (buffs.fire) parts.push('+' + Math.round(buffs.fire*100) + '% cadence');
    if (buffs.xp) parts.push('+' + Math.round(buffs.xp*100) + '% XP');
    if (buffs.frag) parts.push('+' + Math.round(buffs.frag*100) + '% fragments');
    if (buffs.hp) parts.push('+' + Math.round(buffs.hp*100) + '% PV');
    const globDone = ACHV_GLOBALS.filter(g=>a.glob[g.id]).length;
    document.getElementById('achvSummary').innerHTML =
      '' + globDone + ' / ' + ACHV_GLOBALS.length + ' succès<br>' +
      (parts.length ? 'Buffs actifs : ' + parts.join(' · ') : 'Aucun buff pour l\'instant — tue des ennemis !');

    const addSec = (txt)=>{ const d = document.createElement('div'); d.className = 'ach-sec'; d.textContent = txt; list.appendChild(d); };
    const row = (img, name, desc, pct, done, pips)=>{
      const d = document.createElement('div');
      d.className = 'ach-row' + (done ? ' done' : '');
      d.innerHTML = (img ? '<img src="'+img+'" alt="">' : '<div style="width:34px;flex:none;text-align:center;">' + uiIco('trophy', 24) + '</div>') +
        '<div class="ach-main"><div class="ach-name"></div><div class="ach-desc"></div><div class="ach-bar"><i style="width:'+Math.round(pct*100)+'%"></i></div></div>' +
        (pips ? '<div class="ach-pips">'+pips+'</div>' : '');
      d.querySelector('.ach-name').textContent = name;
      d.querySelector('.ach-desc').textContent = desc;
      list.appendChild(d);
    };

    addSec('GLOBAUX — buffs permanents');
    ACHV_GLOBALS.forEach(g=>{
      const prog = achvGlobalProgress(a, g), done = !!a.glob[g.id];
      const fmt = v => g.kind === 'maxTime' ? Math.floor(v/60) + ':' + String(v%60).padStart(2,'0') : v;
      row('', g.name, g.txt + ' · ' + fmt(Math.min(prog, g.need)) + ' / ' + fmt(g.need), Math.min(1, prog/g.need), done, done ? uiIco('check') : '');
    });
  },
});
