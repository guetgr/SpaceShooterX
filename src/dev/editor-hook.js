"use strict";
// Pont entre le jeu et l'éditeur de niveaux (editor.html). Inactif sans ?edit dans l'URL.
//   ?edit=play : aperçu jouable dans l'éditeur   ·   ?edit=bot : jeu caché où tourne le joueur automatique (tools/sim/bot.js)
// Protocole (postMessage vers/depuis la page parente, même origine) :
//   jeu → éditeur : { ssx:1, type:'ready', mode, levels, base, defaults, overrides, decorCatalog:[{kind,label}], musicCatalog:{level:[clés],boss:[clés]} }   puis   { type:'bot-progress'|'bot-done', … }
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
  function traceTimeline(){
    if (mode !== 'play') return;
    let pending = [], lastScene = null, lastBoss = '';
    const log = (sc,kind,label)=>{ pending.push({at:Math.round((sc.tuto ? sc.tutoT || 0 : sc.lvT || 0)*100)/100,kind,label}); };
    const methods = {
      levelInit: ()=> 'Début de mission',
      spawnMeteor: ()=> 'Météorite',
      makeBossPart: args=> 'Pièce de boss : '+args[3],
      spawnOneEnemy: args=> 'Mob : '+args[0],
      tutoSpawnSat: args=> 'Satellite pédagogique'+(args[0]?' lent':''),
      tutoKillSat: ()=> 'Satellite détruit → débris',
      startEvent: args=> 'Événement : '+args[0],
      spawnGolden: ()=> 'Trésorin',
      spawnBoss: args=> 'Boss : '+(args[0]||'tirage'),
      tutoStepEnter: ()=> 'Étape pédagogique',
      tutoSpawnBoss: ()=> 'Antenne-Mère',
      tutoSay: args=> 'N.O.R.M.A. : '+args[0],
      mtStart: ()=> 'La Météo', arStart: ()=> 'Araignée de tri', rxStart: ()=> 'Réacteur', anStart: ()=> 'Anneau', pdStart: ()=> 'PDG',
      levelWin: ()=> 'Victoire', tutoBossDie: ()=> 'Tutoriel terminé'
    };
    Object.entries(methods).forEach(([name,label])=>{
      const original = GameScene.prototype[name]; if (!original) return;
      GameScene.prototype[name] = function(...args){
        const result = original.apply(this,args);
        if (name === 'levelInit'){pending=[];lastBoss='';send({type:'timeline-reset'});return result;}
        if (name !== 'spawnOneEnemy' || result) log(this,name,label(args));
        return result;
      };
    });
    setInterval(()=>{
      const sc=window.__ssxScene; if (!sc) return;
      if (sc !== lastScene){lastScene=sc;lastBoss='';pending=[];send({type:'timeline-reset'});}
      const bosses=[sc.mt,sc.ar,sc.rx,sc.an,sc.pd,sc.tutoBoss,sc.currentBoss].filter(Boolean);
      const state=bosses.map(b=>[b.bossId||'boss',b.phase,b.st,b.atk,b.mode,b.state].filter(x=>x!==undefined).join(' / ')).join('; ');
      if (state && state!==lastBoss){lastBoss=state;log(sc,'boss-state',state);}
      if(pending.length){send({type:'timeline-trace',levelId:sc.tuto?'w1-tuto':sc.lvDef&&sc.lvDef.id,entries:pending});pending=[];}
    },300);
  }

  // décors (kind → libellé ; null = planètes au hasard) et musiques connues, pour les listes de l'éditeur (JSON seulement)
  const DECOR_LABELS = { horizon:'Horizon terrestre', debris:'Débris en orbite', station:'Station AGP', cristaux:'Champ de cristaux', patrouille:'Couloir de patrouille', direction:'Siège de la direction' };
  function decorCatalog(){ return WORLD_BG_KINDS.map(kind=> ({ kind, label:DECOR_LABELS[kind] || kind })); }
  function musicCatalog(){
    const uniq = a=> Array.from(new Set(a));
    return { level:uniq([].concat(...Object.values(MUSIC_LEVEL))), boss:uniq(MUSIC_BOSS_KEYS) };
  }

  function ready(){
    traceTimeline();
    send({ type:'ready', mode, levels:levelList(), base:LEVEL_BASE, defaults:LEVEL_BASE['w1-tuto'].tutorial || TUTO_DEFAULTS, documents:JSON.parse(JSON.stringify(LEVEL_FILES)), eventCatalog:Object.entries(EVENT_DEFS).map(([id,e])=>({ id,name:e.name,small:!!e.small,min:e.min,params:(EVENT_PARAMS[id]||[]).map(r=>({ key:r.key,label:r.label,min:r.min,max:r.max,step:r.step,unit:r.unit,int:!!r.int,def:typeof r.def === 'function' ? r.def(1) : r.def,defByAlert:typeof r.def === 'function' })) })), overrides:TUNING_OVERRIDES, decorCatalog:decorCatalog(), musicCatalog:musicCatalog(), bestiary:BESTIARY_LIST.filter(e=> !e.bossId && e.type !== 'meteor').map(e=>{
      let image = '';
      try { image = window.__ssxScene.textures.getBase64(e.tex, e.frame); } catch(err) { /* miniature facultative */ }
      return { type:e.type, label:e.label, image };
    }) });
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
