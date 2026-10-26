"use strict";
// Chargeur du jeu (seul fichier référencé par index.html).
//  1. lit assets/manifest.json et charge tous les assets (images, sons, polices...) en mémoire
//  2. expose asset('sprites/x.png') -> data URI, utilisable dès la première ligne des autres fichiers
//  3. charge les fichiers de src/scripts.json dans l'ordre
// Il faut un serveur local (fetch ne marche pas en file://) : lance serve.bat.
// ?sandbox : sauvegarde EN MÉMOIRE (rien n'est écrit dans le vrai localStorage) — utilisé par l'éditeur de niveaux (editor.html) pour tester sans abîmer la progression.
if (/[?&]sandbox\b/.test(location.search)) {
  const mem = {};
  const fake = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; }, clear: () => { Object.keys(mem).forEach(k => delete mem[k]); }, key: i => Object.keys(mem)[i] || null, get length() { return Object.keys(mem).length; } };
  try { Object.defineProperty(window, 'localStorage', { value: fake, configurable: true }); } catch (e) { /* ignore */ }
}
(function () {
  const MIME = { png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', mp3: 'audio/mpeg', woff2: 'font/woff2' };
  const store = {};

  window.asset = function (path) {
    const v = store[path];
    if (!v) throw new Error('asset inconnu : "' + path + '" (est-il dans assets/manifest.json ?)');
    return v;
  };

  // ---- écran de chargement : image de fond (loading/bg.webp, hors manifeste : elle doit s'afficher avant tout le reste), logo, barre de progression ----
  const css = document.createElement('style');
  css.textContent =
    '#boot{position:fixed;inset:0;z-index:99999;background:#05040c;color:#cfd6ff;overflow:hidden;font-family:"Press Start 2P",monospace;transition:opacity .55s ease-out}' +
    '#boot.done{opacity:0;pointer-events:none}' +
    '#boot .bt-bg{position:absolute;inset:-4%;background:#05040c url(loading/bg.webp) center/cover no-repeat;opacity:0;transition:opacity .8s ease-out;animation:btZoom 22s ease-in-out infinite alternate}' +
    '#boot .bt-bg.on{opacity:1}' +
    '#boot .bt-shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(5,4,12,.55) 0%,rgba(5,4,12,0) 28%,rgba(5,4,12,0) 52%,rgba(5,4,12,.88) 100%),radial-gradient(ellipse at center,rgba(5,4,12,0) 55%,rgba(5,4,12,.55) 100%)}' +
    '#boot .bt-logo{position:absolute;top:9%;left:0;right:0;text-align:center;font-size:clamp(20px,6.4vw,34px);line-height:1.35;letter-spacing:2px;color:#fff;text-shadow:0 0 10px #4ff2ff,0 0 26px rgba(79,242,255,.55),0 3px 0 rgba(0,0,0,.6);animation:btLogo .9s cubic-bezier(.2,.8,.25,1) backwards}' +
    '#boot .bt-logo b{color:#ff3ea5;font-weight:normal;text-shadow:0 0 10px #ff3ea5,0 0 24px rgba(255,62,165,.5),0 3px 0 rgba(0,0,0,.6)}' +
    '#boot .bt-low{position:absolute;left:0;right:0;bottom:calc(9% + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:12px}' +
    '#boot .bt-bar{width:min(72vw,300px);height:14px;padding:2px;background:rgba(5,4,12,.7);border:2px solid #2c2750;box-shadow:0 0 18px rgba(79,242,255,.18)}' +
    '#boot .bt-fill{height:100%;width:0;background:linear-gradient(90deg,#4ff2ff,#ff3ea5);box-shadow:0 0 10px rgba(79,242,255,.8)}' +
    '#boot .bt-txt{font-size:9px;letter-spacing:2px;color:#9fb0ff;text-shadow:0 2px 0 rgba(0,0,0,.7)}' +
    '#boot .bt-txt i{font-style:normal;animation:btDots 1.2s steps(4) infinite}' +
    '#boot .bt-err{display:none;max-width:84vw;text-align:center;font:16px monospace;color:#ff4f6d;background:rgba(5,4,12,.85);padding:12px;border:1px solid #ff4f6d}' +
    '@keyframes btZoom{from{transform:scale(1) translateY(0)}to{transform:scale(1.1) translateY(-1.5%)}}' +
    '@keyframes btLogo{from{opacity:0;transform:translateY(-18px) scale(1.12)}to{opacity:1;transform:none}}' +
    '@keyframes btDots{0%{opacity:.15}50%{opacity:1}100%{opacity:.15}}';
  document.head.appendChild(css);

  const box = document.createElement('div');
  box.id = 'boot';
  box.innerHTML = '<div class="bt-bg"></div><div class="bt-shade"></div><div class="bt-logo">SPACE<br>SHOOTER <b>X</b></div>' +
    '<div class="bt-low"><div class="bt-bar"><div class="bt-fill"></div></div><div class="bt-txt">CHARGEMENT <i>.</i><i>.</i><i>.</i> <span class="bt-pct">0 %</span></div><div class="bt-err"></div></div>';
  document.body.appendChild(box);
  const bg = box.querySelector('.bt-bg'), fill = box.querySelector('.bt-fill'), pct = box.querySelector('.bt-pct'), err = box.querySelector('.bt-err');
  { const im = new Image(); im.onload = () => bg.classList.add('on'); im.src = 'loading/bg.webp'; }      // fondu d'entrée une fois l'image reçue

  // la barre rattrape en douceur la progression réelle (sinon elle saute par paquets)
  let target = 0, shown = 0, finished = null, alive = true;
  const progress = p => { target = Math.max(target, Math.min(1, p)); };
  (function tick() {
    if (!alive) return;
    shown += (target - shown) * 0.14 + (target > shown ? 0.0015 : 0);
    if (shown > target) shown = target;
    fill.style.width = (shown * 100).toFixed(1) + '%'; pct.textContent = Math.round(shown * 100) + ' %';
    if (finished && shown >= 0.995) { alive = false; fill.style.width = '100%'; pct.textContent = '100 %'; finished(); return; }
    requestAnimationFrame(tick);
  })();
  const leave = () => new Promise(ok => { finished = ok; progress(1); })
    .then(() => { box.classList.add('done'); setTimeout(() => box.remove(), 650); });

  function fail(e) {
    console.error(e);
    alive = false;
    err.style.display = 'block';
    err.textContent = location.protocol === 'file:'
      ? 'Ouvre le jeu via un serveur local : double-clique sur serve.bat puis va sur http://localhost:8080/'
      : 'Erreur de chargement : ' + (e && e.message || e);
  }

  const getJson = url => fetch(url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(url + ' : ' + r.status); return r.json(); });

  function loadAsset(path) {
    return fetch('assets/' + path).then(r => {
      if (!r.ok) throw new Error('assets/' + path + ' : ' + r.status);
      return r.arrayBuffer();
    }).then(buf => new Promise((ok, ko) => {
      const fr = new FileReader();
      fr.onload = () => { store[path] = fr.result; ok(); };
      fr.onerror = ko;
      fr.readAsDataURL(new Blob([buf], { type: MIME[path.split('.').pop()] || 'application/octet-stream' }));
    }));
  }

  function loadScripts(list) {
    return new Promise((ok, ko) => {
      let left = list.length;
      list.forEach(f => {
        const s = document.createElement('script');
        s.src = 'src/' + f; s.async = false;           // async=false : exécutés dans l'ordre de la liste
        s.onload = () => { progress(0.9 + 0.1 * (1 - left / list.length)); if (--left === 0) ok(); };
        s.onerror = () => ko(new Error('script introuvable : src/' + f));
        document.body.appendChild(s);
      });
    });
  }

  Promise.all([getJson('assets/manifest.json'), getJson('src/scripts.json')])
    .then(([assets, scripts]) => {
      let done = 0;
      return Promise.all(assets.map(a => loadAsset(a).then(() => progress(0.9 * ++done / assets.length))))
        .then(() => loadScripts(scripts));
    })
    .then(leave)
    .catch(fail);
})();
