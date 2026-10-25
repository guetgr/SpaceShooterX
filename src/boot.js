"use strict";
// Chargeur du jeu (seul fichier référencé par index.html).
//  1. lit assets/manifest.json et charge tous les assets (images, sons, polices...) en mémoire
//  2. expose asset('sprites/x.png') -> data URI, utilisable dès la première ligne des autres fichiers
//  3. charge les fichiers de src/scripts.json dans l'ordre
// Il faut un serveur local (fetch ne marche pas en file://) : lance serve.bat.
(function () {
  const MIME = { png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', mp3: 'audio/mpeg', woff2: 'font/woff2' };
  const store = {};

  window.asset = function (path) {
    const v = store[path];
    if (!v) throw new Error('asset inconnu : "' + path + '" (est-il dans assets/manifest.json ?)');
    return v;
  };

  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:#05040c;color:#4ff2ff;font:16px monospace;text-align:center;padding:24px';
  const say = t => { box.textContent = t; };
  say('Chargement…');
  document.body.appendChild(box);

  function fail(e) {
    console.error(e);
    box.style.color = '#ff4f6d';
    say(location.protocol === 'file:'
      ? 'Ouvre le jeu via un serveur local : double-clique sur serve.bat puis va sur http://localhost:8080/'
      : 'Erreur de chargement : ' + (e && e.message || e));
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
        s.onload = () => { if (--left === 0) ok(); };
        s.onerror = () => ko(new Error('script introuvable : src/' + f));
        document.body.appendChild(s);
      });
    });
  }

  Promise.all([getJson('assets/manifest.json'), getJson('src/scripts.json')])
    .then(([assets, scripts]) => {
      let done = 0;
      return Promise.all(assets.map(a => loadAsset(a).then(() => say('Chargement… ' + Math.round(100 * ++done / assets.length) + ' %'))))
        .then(() => loadScripts(scripts));
    })
    .then(() => box.remove())
    .catch(fail);
})();
