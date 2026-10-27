"use strict";
// Pont entre le jeu et l'éditeur de niveaux (editor.html). Inactif sans ?edit dans l'URL.
//   ?edit=play : aperçu jouable dans l'éditeur   ·   ?edit=bot : jeu caché où tourne le joueur automatique (tools/sim/bot.js)
// Protocole (postMessage vers/depuis la page parente, même origine) :
//   jeu → éditeur : { ssx:1, type:'ready', mode, levels, base, defaults, overrides }   puis   { type:'bot-progress'|'bot-done', … }
//   éditeur → jeu : { type:'apply', overrides }  ·  { type:'play', levelId, overrides }  ·  { type:'bot', levelId, overrides, seeds, skill, budget }
(function(){
  const q = new URLSearchParams(location.search);
  if (!q.has('edit') || window.parent === window) return;
  const mode = q.get('edit') || 'play';
  const send = m=> window.parent.postMessage(Object.assign({ ssx:1 }, m), location.origin);
  const SKILLS = { casual:{ sens:0.8, noise:0.3, react:9 }, average:{ sens:1.0, noise:0.12, react:6 }, expert:{ sens:1.3, noise:0.05, react:3 } };

  function levelList(){
    const out = [];
    WORLDS.forEach(w=> w.levels.forEach(l=> out.push({ id:l.id, name:l.name, world:w.id, worldName:w.name, type:l.type, tuto:!!l.tuto, num:l.num })));
    return out;
  }
  function snapshot(){            // valeurs actuelles des niveaux (après surcharges)
    const cur = {}; WORLDS.forEach(w=> w.levels.forEach(l=>{ const o = {}; TUNE_LEVEL_FIELDS.forEach(k=>{ if (l[k] !== undefined) o[k] = JSON.parse(JSON.stringify(l[k])); }); cur[l.id] = o; }));
    return cur;
  }
  function ready(){
    send({ type:'ready', mode, levels:levelList(), base:LEVEL_BASE, defaults:TUTO_DEFAULTS, overrides:TUNING_OVERRIDES });
  }
  function launch(levelId){
    const sc = window.__ssxScene, l = levelById(levelId); if (!sc || !l) return;
    try { music.stop(); } catch(e){ /* ignore */ }
    sc.meta = getMeta();
    sc.scene.restart(l.tuto ? { autoStart:true, tuto:true } : { autoStart:true, levelId });
  }

  // ---- joueur automatique (charge tools/sim/bot.js une seule fois)
  let botReady = null;
  function loadBot(){
    if (botReady) return botReady;
    botReady = new Promise((ok, ko)=>{ const s = document.createElement('script'); s.src = 'tools/sim/bot.js'; s.onload = ()=>{ __sim.prepare(); ok(); }; s.onerror = ()=> ko(new Error('tools/sim/bot.js introuvable')); document.body.appendChild(s); });
    return botReady;
  }
  let botBusy = false;
  async function runBot(msg){
    if (botBusy) return; botBusy = true;
    try {
      await loadBot();
      applyTuning(msg.overrides);
      const l = levelById(msg.levelId), cfg = SKILLS[msg.skill] || SKILLS.average, res = [];
      for (let i = 0; i < msg.seeds; i++){
        // sauvegarde vierge à chaque essai (en mémoire : voir ?sandbox) + arbre acheté avec le budget demandé
        ['ssx_achv_v1','ssx_bestiary_v1','ssx_codex_v1','ssx_bossbag_v1','ssx_worlds_v1','ssx_pacts_v1','ssx_leaderboard_v1','ssx_highscore_v1'].forEach(k=> localStorage.removeItem(k));
        localStorage.setItem('ssx_meta_v3', JSON.stringify({ v:3, composants:msg.budget || 0 }));
        if (msg.budget) __sim.buy('attaque');
        res.push(l.tuto ? __sim.runTuto(1000 + i * 37, cfg) : __sim.runLevel(l.id, 1000 + i * 37, cfg));
        send({ type:'bot-progress', done:i + 1, total:msg.seeds });
        await new Promise(r=> setTimeout(r, 0));          // laisse respirer l'interface entre deux parties
      }
      send({ type:'bot-done', levelId:msg.levelId, results:res });
    } catch(e){ send({ type:'bot-error', error:String(e && e.message || e) }); }
    botBusy = false;
  }

  window.addEventListener('message', ev=>{
    if (ev.origin !== location.origin || !ev.data || ev.data.ssx !== 1) return;
    const m = ev.data;
    if (m.type === 'apply') applyTuning(m.overrides);
    else if (m.type === 'play'){ applyTuning(m.overrides); launch(m.levelId); }
    else if (m.type === 'bot') runBot(m);
    else if (m.type === 'snapshot') send({ type:'snapshot', levels:snapshot() });
  });
  const wait = setInterval(()=>{ if (window.__ssxScene && window.__ssxScene.scene.isActive('home')){ clearInterval(wait); ready(); } }, 200);
})();
