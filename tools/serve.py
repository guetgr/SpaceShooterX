#!/usr/bin/env python3
"""Serveur local de développement (sans cache : tu modifies un fichier, tu rafraîchis la page, c'est pris en compte).

  python tools/serve.py [port]      -> http://localhost:8080/        (jeu normal)
                                       http://localhost:8080/?dev    (tout débloqué + outils de test)
"""
import level_files

import functools, http.server, json, os, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.js': 'text/javascript', '.json': 'application/json'}

    # Éditeur de niveaux (editor.html) : écrit src/data/levels/*.json via /__editor/levels (serveur local uniquement).
    def do_GET(self):
        if self.path == '/__editor/ping':
            body = b'{"ok":true}'; self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()

    # Protection des écritures : l'éditeur est servi par ce même serveur, donc seule l'origine locale est admise.
    def editor_guard(self):
        port = self.server.server_address[1]
        hosts = ('localhost', '127.0.0.1')
        host = self.headers.get('Host', '')
        if host not in [h + ':%d' % port for h in hosts] + ([h for h in hosts] if port == 80 else []):
            self.refuse(421, 'hôte refusé'); return False
        origin = self.headers.get('Origin')
        if origin is not None and origin not in ['http://%s:%d' % (h, port) for h in hosts]:
            self.refuse(403, 'origine refusée'); return False
        if self.headers.get('Content-Type', '').split(';')[0].strip().lower() != 'application/json':
            self.refuse(415, 'Content-Type application/json requis'); return False
        return True

    def refuse(self, code, msg):
        body = json.dumps({'ok': False, 'error': msg}).encode('utf-8'); self.send_response(code)
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_POST(self):
        if self.path in ['/__editor/levels', '/__editor/validate-level']:
            if self.editor_guard(): self.level_documents()
            return
        self.send_error(404)

    def level_documents(self):
        from pathlib import Path
        root = Path(R)
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if not 0 < n < 2000000: raise ValueError('taille invalide')
            payload = json.loads(self.rfile.read(n))
            originals = level_files.read_levels(root)
            docs = payload['levels']
            if not isinstance(docs, dict) or not docs: raise ValueError('niveaux manquants')
            for key, value in docs.items():
                if key not in originals: raise ValueError('niveau inconnu')
                level_files.validate_level(value, originals[key], root)
            if self.path == '/__editor/levels':
                paths = {key: root / 'src/data/levels' / (key + '.json') for key in docs}
                backups = {key: p.read_bytes() for key,p in paths.items()}
                try:
                    for key,p in paths.items():
                        level_files.write_if_changed(p, level_files.dump_level(docs[key]))
                    level_files.generate(root)
                except Exception:
                    for key,p in paths.items(): p.write_bytes(backups[key])
                    level_files.generate(root)
                    raise
            body = json.dumps({'ok':True,'count':len(docs)}).encode(); self.send_response(200)
        except Exception as e:
            body = json.dumps({'ok':False,'error':str(e)}).encode(); self.send_response(400)
        self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    level_files.generate()
    handler = functools.partial(NoCache, directory=R)
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler) as srv:
        print('Space Shooter X -> http://localhost:%d/   (mode DEV : http://localhost:%d/?dev)   Ctrl+C pour arrêter' % (PORT, PORT))
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass
