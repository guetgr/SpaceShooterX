#!/usr/bin/env python3
"""Test de fumée headless : charge le jeu, lance une partie, vérifie qu'il n'y a aucune erreur JS.

  python tools/smoke_test.py                      -> teste le jeu en dev (sert le dossier du projet, ?dev)
  python tools/smoke_test.py --dist               -> teste dist/space-shooter-x-dev.html (fichier unique)
  python tools/smoke_test.py --file chemin.html   -> teste n'importe quel .html (ex. l'ancien monolithe)

Prérequis : pip install playwright  (utilise ton Chrome installé ; sinon : playwright install chromium)
Phaser est pris dans vendor/phaser.min.js (pas besoin d'internet).
"""
import argparse, functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHASER = os.path.join(R, 'vendor', 'phaser.min.js')

ap = argparse.ArgumentParser()
ap.add_argument('--dist', action='store_true')
ap.add_argument('--file')
ap.add_argument('--wait', type=float, default=6, help='secondes de jeu après le lancement')
args = ap.parse_args()


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def serve(directory):
    h = functools.partial(Quiet, directory=directory)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


if args.file:
    d, f = os.path.split(os.path.abspath(args.file)); url_path = '/' + f
elif args.dist:
    d = os.path.join(R, 'dist'); url_path = '/space-shooter-x-dev.html'
else:
    d = R; url_path = '/index.html?dev'
srv = serve(d)
url = 'http://127.0.0.1:%d%s' % (srv.server_address[1], url_path)

errs = []
with sync_playwright() as pw:
    try:
        b = pw.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required'])
    except Exception:
        b = pw.chromium.launch(args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    p = b.new_page(viewport={'width': 420, 'height': 760})
    p.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    p.on('console', lambda m: errs.append('console.error: ' + m.text) if m.type == 'error' and 'favicon' not in m.text else None)
    p.route('**/phaser.min.js', lambda r: r.fulfill(path=PHASER) if os.path.exists(PHASER) else r.continue_())
    p.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))   # polices intégrées au jeu
    print('url:', url)
    p.goto(url)
    p.wait_for_selector('#btnStart', timeout=60000)
    p.wait_for_timeout(1500)
    print('menu ok')
    p.evaluate("document.getElementById('btnStart').click()")
    p.wait_for_timeout(2500)
    print(p.evaluate("""()=>{
      const sc = window.__game.scene.scenes.find(s=>s.startRun);
      sc.introT = 99999;                 // termine l'intro
      return 'intro terminee, running=' + sc.running;
    }"""))
    p.wait_for_timeout(int(args.wait * 1000))
    print(p.evaluate("""()=>{
      const sc = window.__game.scene.scenes.find(s=>s.startRun);
      const sfx = window.__T && window.__T.sfx; if (sfx) sfx.ensureCtx();
      return JSON.stringify({ running: sc.running, hp: sc.hp, ennemis: sc.enemies.getLength(), score: sc.score,
        arbre: window.__T ? window.__T.ALL_TREE_NODES.length : null,
        cartes: window.__T ? window.__T.UPGRADE_POOL.length : null,
        sons_enregistres: sfx ? Object.keys(sfx.files || {}).length : null });
    }"""))
    b.close()
srv.shutdown()

if errs:
    print('ERREURS (%d):' % len(errs))
    for e in errs[:20]: print('  ', e[:300])
    sys.exit(1)
print('OK : aucune erreur JS')
