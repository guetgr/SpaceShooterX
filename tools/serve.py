#!/usr/bin/env python3
"""Serveur local de développement (sans cache : tu modifies un fichier, tu rafraîchis la page, c'est pris en compte).

  python tools/serve.py [port]      -> http://localhost:8080/        (jeu normal)
                                       http://localhost:8080/?dev    (tout débloqué + outils de test)
"""
import functools, http.server, json, os, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.js': 'text/javascript', '.json': 'application/json'}

    # Éditeur de niveaux (editor.html) : enregistre les réglages dans src/data/tuning.js. Serveur local uniquement ; un seul fichier, uniquement des nombres.
    def do_GET(self):
        if self.path == '/__editor/ping':
            body = b'{"ok":true}'; self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()

    def do_POST(self):
        if self.path != '/__editor/save':
            self.send_error(404); return
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if n <= 0 or n > 200000: raise ValueError('taille')
            data = json.loads(self.rfile.read(n).decode('utf-8'))
            out = {'tuto': data.get('tuto', {}), 'levels': data.get('levels', {})}
            def check(o, depth=0):
                if depth > 4: raise ValueError('profondeur')
                if isinstance(o, dict):
                    for k, v in o.items():
                        if not isinstance(k, str) or len(k) > 40 or not all(c.isalnum() or c in '-_' for c in k): raise ValueError('clé ' + repr(k))
                        check(v, depth + 1)
                elif isinstance(o, bool) or not isinstance(o, (int, float)): raise ValueError('valeur non numérique')
            check(out)
            head = open(os.path.join(R, 'src', 'data', 'tuning.js'), encoding='utf-8').read().split('const TUNING_OVERRIDES')[0]
            with open(os.path.join(R, 'src', 'data', 'tuning.js'), 'w', encoding='utf-8', newline=chr(10)) as f:
                f.write(head + 'const TUNING_OVERRIDES = ' + json.dumps(out, indent=1, sort_keys=True, ensure_ascii=False) + ';' + chr(10))
            body = b'{"ok":true}'; self.send_response(200)
        except Exception as e:
            body = json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'); self.send_response(400)
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    handler = functools.partial(NoCache, directory=R)
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler) as srv:
        print('Space Shooter X -> http://localhost:%d/   (mode DEV : http://localhost:%d/?dev)   Ctrl+C pour arrêter' % (PORT, PORT))
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass
