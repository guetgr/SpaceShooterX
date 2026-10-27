// Simulateur d'équilibrage : joueur automatique + avance rapide, injecté dans la page par tools/sim_balance.py
// (chargé APRÈS le jeu ; pas du code du jeu). Expose window.__sim.
//   __sim.prepare()                               figer le hasard / l'horloge, couper l'affichage et le son
//   __sim.runLevel(levelId, seed, opts)           joue un niveau entier, renvoie le résultat
//   __sim.buy(policy)                             dépense les composants à l'atelier puis en R&D (comme un joueur raisonnable)
(function(){
  "use strict";
  const DT = 1000/60;
  let clock = 0, seedState = 1;
  const rng = ()=>{ seedState |= 0; seedState = seedState + 0x6D2B79F5 | 0; let t = Math.imul(seedState ^ seedState >>> 15, 1 | seedState); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const SC = ()=> window.__ssxScene;

  // ---------- choix des cartes de montée de niveau
  const CAT = { weapon:3, fusion:4, defense:2, engine:1, utility:1 };
  function pickCard(sc){
    const cards = [...document.querySelectorAll('#cardsWrap .card')];
    if (!cards.length) return false;
    const low = sc.hp < sc.stats.maxHp*0.5;
    let best = null, bs = -1e9;
    cards.forEach(c=>{
      const name = c.querySelector('.card-name').textContent, u = UPGRADE_POOL.find(x=> x.name === name);
      let s = u ? (u.id.indexOf('fus_') === 0 ? CAT.fusion : (CAT[u.category] || 1)) : (name.indexOf('ASSEMBLAGE') === 0 ? 6 : (name.indexOf('SPECIALISATION') === 0 ? 5 : 2));      // hors pool de base : cartes de technologie (assemblage d'abord)
      if (u && low && (u.id === 'life' || u.id === 'shield' || u.category === 'defense')) s += 3;
      s += rng()*0.8;
      if (s > bs){ bs = s; best = c; }
    });
    best.click(); return true;
  }

  // ---------- déplacement : on évalue une grille de positions proches et on prend la moins dangereuse (et la plus utile)
  function bot(sc, cfg){
    const px = sc.player.x, py = sc.player.y, vx = sc.visibleXRange(22), vy = sc.visibleYRange(0), z = sc.cameras.main.zoom;
    const yMin = vy.min + 120/z, yMax = vy.max - 30/z, yPref = vy.max - 85/z;
    const bl = [], en = [], gems = [];
    sc.enemyBullets.children.iterate(b=>{ if (b && b.active && b.body) bl.push([b.x, b.y, b.body.velocity.x, b.body.velocity.y]); });
    let nEnemies = 0, aimX = null, aimD = 1e9;
    sc.enemies.children.iterate(e=>{
      if (!e || !e.active || !e.body) return;
      nEnemies++;
      const r = Math.max(8, Math.min(e.displayWidth, e.displayHeight)*0.38);
      en.push([e.x, e.y, e.body.velocity.x, e.body.velocity.y, r]);
      if (e.y < py - 20){ const d = Math.abs(e.x - px) + (py - e.y)*0.35; if (d < aimD){ aimD = d; aimX = e.x; } }
    });
    if (sc.tuto){                              // tuto : satellites et boss ne sont pas dans sc.enemies
      (sc.tutoSats || []).forEach(t=>{ if (t.dead) return; const e = t.sp; nEnemies++; en.push([e.x, e.y, 0, t.vy, 30]); if (e.y < py - 20){ const d = Math.abs(e.x - px) + (py - e.y)*0.35; if (d < aimD){ aimD = d; aimX = e.x; } } });
      if (sc.tutoBoss && !sc.tutoBoss.dead){ const e = sc.tutoBoss.sp; en.push([e.x, e.y, 0, 0, 85]); aimX = e.x; aimD = 0; }
    }
    sc.gems.children.iterate(g=>{ if (g && g.active) gems.push([g.x, g.y]); });
    // danger immédiat → esquive
    if (sc.dodgeCharges > 0 && bl.some(b=> Math.hypot(b[0] + b[2]*0.1 - px, b[1] + b[3]*0.1 - py) < 20)) sc.tryDodge();
    if (sc.odReady && sc.odActive <= 0 && (nEnemies >= 6 || sc.bossActive)) sc.activateOverdrive();
    const sens = cfg.sens, TS = [0.1, 0.28, 0.5];
    let best = null, bs = -1e9;
    for (let dx = -170; dx <= 170; dx += 34) for (let dy = -90; dy <= 90; dy += 45){
      const cx = Math.min(vx.max, Math.max(vx.min, px + dx)), cy = Math.min(yMax, Math.max(yMin, py + dy));
      let danger = 0;
      for (let i = 0; i < bl.length; i++){
        const b = bl[i];
        for (let k = 0; k < 3; k++){ const t = TS[k], ex = b[0] + b[2]*t - cx, ey = b[1] + b[3]*t - cy; danger += Math.exp(-(ex*ex + ey*ey)/(2*24*24)) * (1.1 - 0.25*k); }
      }
      for (let i = 0; i < en.length; i++){
        const e = en[i], ex = e[0] + e[2]*0.3 - cx, ey = e[1] + e[3]*0.3 - cy, rr = e[4] + 20;
        danger += 2.2*Math.exp(-(ex*ex + ey*ey)/(rr*rr));
      }
      let s = -danger*6*sens;
      if (aimX !== null) s += 1.4*Math.exp(-((aimX - cx)*(aimX - cx))/(2*55*55));                    // se placer sous une cible
      let gmax = 0; for (let i = 0; i < gems.length; i++){ const g = gems[i], d2 = (g[0] - cx)**2 + (g[1] - cy)**2; if (d2 < 220*220) gmax = Math.max(gmax, Math.exp(-d2/(2*70*70))); }
      s += 1.1*gmax - 0.006*Math.abs(cy - yPref) - 0.0015*Math.hypot(cx - px, cy - py) - 0.0008*Math.abs(cx - 200) + rng()*cfg.noise;
      if (s > bs){ bs = s; best = [cx, cy]; }
    }
    sc.setTarget(best[0], best[1]);
  }

  window.__sim = {
    prepare(){
      const sc = SC(), g = sc.game;
      g.loop.stop();                                              // plus de boucle temps réel : c'est nous qui avançons le jeu
      g.scene.render = function(){};                              // aucun dessin
      performance.now = ()=> clock;                               // ralenti, délais… suivent le temps simulé
      if (typeof JUICE !== 'undefined'){ JUICE.hitstopMul = JUICE.shakeMul = JUICE.punchMul = JUICE.fireMul = JUICE.sparkMul = JUICE.numberMul = JUICE.magnetMul = JUICE.gemPitchMul = 0; }      // pas d'arrêt sur image : la simulation reste identique
      sfx.muted = true; try { music.muted = true; music.stop && music.stop(); } catch(e){ /* ignore */ }
      Math.random = rng;
    },

    // joue un niveau jusqu'à la victoire, la défaite ou la limite de temps (temps simulé)
    runLevel(levelId, seed, opts){
      opts = Object.assign({ sens:1, noise:0.12, react:6, cap:null }, opts || {});
      seedState = seed >>> 0 || 1;
      const sc0 = SC(), g = sc0.game, L = levelById(levelId);
      const cap = opts.cap || (L.type === 'survive' ? L.goal.seconds*3 + 60 : 300);
      const f0 = getMeta().composants;
      sc0.scene.restart({ autoStart:true, levelId });
      let sc = null, tick = 0, t0 = clock, minHp = 1, cards = 0, introDone = false;
      const step = ()=>{ clock += DT; g.step(clock, DT); tick++; };
      for (let i = 0; i < 400 && !(SC() !== sc0 && SC().lvDef && SC().running); i++) step();       // la scène redémarre
      sc = SC();
      while (!sc.lvResult && (clock - t0)/1000 < cap){
        if (sc.introActive && !introDone){ sc.introT = 99999; if (sc._introEarth) introDone = true; }
        const levelupOpen = !document.getElementById('levelup').classList.contains('hidden');
        if (levelupOpen){ if (pickCard(sc)) cards++; }
        else if (sc.running && tick % opts.react === 0) bot(sc, opts);
        if (sc.running) minHp = Math.min(minHp, sc.hp/sc.stats.maxHp);
        step();
      }
      const res = sc.lvResult, simT = (clock - t0)/1000;
      return {
        win: !!(res && res.victory), timeout: !res, time: Math.round(simT*10)/10, kills: sc.runKills, level: sc.level, cards,
        score: Math.floor(sc.score), minHp: Math.round(minHp*100)/100, progress: res ? res.progress : sc.levelProgress().frac,
        frags: getMeta().composants - f0, clearBonus: res ? res.clearBonus : 0, maxHp: Math.round(sc.stats.maxHp), dmg: Math.round(sc.stats.damage*10)/10,
      };
    },

    // joue le tuto jusqu'à la victoire, la défaite ou la limite de temps (temps simulé)
    runTuto(seed, opts){
      opts = Object.assign({ sens:1, noise:0.12, react:6, cap:420 }, opts || {});
      seedState = seed >>> 0 || 1;
      ['tutoEnd', 'tutoPct'].forEach(id=>{ const e = document.getElementById(id); if (e) e.remove(); });
      const sc0 = SC(), g = sc0.game, t0 = clock;
      sc0.scene.restart({ autoStart:true, tuto:true });
      const step = ()=>{ clock += DT; g.step(clock, DT); };
      for (let i = 0; i < 400; i++){ step(); const s = SC(); if (s.tuto && s.running && !s.tutoDone && s.tutoStepLog && s.tutoStepLog.length) break; }
      const sc = SC(); let tick = 0, minHp = 1;
      while (!(sc.tutoDone && sc._tutoRec) && (clock - t0)/1000 < opts.cap){
        if (sc.introActive) sc.introT = 99999;
        if (sc.running && tick % opts.react === 0) bot(sc, opts);
        if (sc.running) minHp = Math.min(minHp, sc.hp/sc.stats.maxHp);
        step(); tick++;
      }
      const comp = sc.tutoComp(), rec = sc._tutoRec;
      return { win: !!(sc.tutoBoss && sc.tutoBoss.dead), timeout: !sc.tutoDone, time: Math.round((clock - t0)/100)/10, hits: sc.tutoHits, kills: sc.tutoKills,
               pct: rec ? rec.runPct : completionPct('w1-tuto', comp), comp, steps: sc.tutoStepLog, minHp: Math.round(minHp*100)/100 };
    },

    // dépense les composants comme un joueur raisonnable : l'atelier d'abord (le poste de Mk le plus bas, on met de côté pour le Mk suivant),
    // puis la R&D (prototypes, puis rangs, dans l'ordre de préférence de la politique) ; jamais de Mk III à V ni de spécialisation (pièces de secteur : le bot n'en gagne pas)
    buy(policy){
      const meta = getMeta();
      const ORDER = policy === 'defense' ? ['coque', 'bouclier', 'canon', 'propulseurs', 'aimant', 'ordinateur'] : ['canon', 'coque', 'bouclier', 'propulseurs', 'aimant', 'ordinateur'];
      const TECH_PREF = policy === 'defense' ? ['blindage_lourd', 'nano_reparation', 'bouclier_reactif', 'laser_continu', 'missiles_guidage', 'drone', 'laser_auto', 'missiles_demolition', 'benne', 'ricochets', 'canon_experimental', 'arc_electrique', 'overdrive', 'champ_lent', 'pulsar']
                                        : ['laser_continu', 'missiles_guidage', 'drone', 'laser_auto', 'missiles_demolition', 'arc_electrique', 'canon_experimental', 'blindage_lourd', 'nano_reparation', 'bouclier_reactif', 'ricochets', 'overdrive', 'champ_lent', 'pulsar', 'benne'];
      const pick = what=> TECH_PREF.find(id=> rdNextStep(meta, id) === what && rdCanBuy(meta, id, what).ok);
      let bought = 0;
      for (;;){
        const posts = ORDER.filter(id=> atelierCanBuy(meta, id).ok).sort((a, b)=> (atelierMk(meta.atelier, a) - atelierMk(meta.atelier, b)) || (ORDER.indexOf(a) - ORDER.indexOf(b)));
        if (posts.length){ atelierBuy(meta, posts[0]); bought++; continue; }
        if (ORDER.some(id=> atelierCanBuy(meta, id).reason === 'composants')) break;       // on économise pour un poste d'atelier
        const id = pick('proto') || pick('rang'); if (!id) break;
        rdBuy(meta, id, rdNextStep(meta, id)); bought++;
      }
      meta.chargement = []; TECH_PREF.forEach(id=> loadoutToggle(meta, id, slotsOpen()));      // le meilleur chargement valide (un refus est ignoré)
      setMeta(meta);
      return { bought, composants: meta.composants, points: metaPoints(meta) };
    },
  };
})();
