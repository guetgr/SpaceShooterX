#!/usr/bin/env python3
"""Serveur local de développement (sans cache : tu modifies un fichier, tu rafraîchis la page, c'est pris en compte).

  python tools/serve.py [port]      -> http://localhost:8080/        (jeu normal)
                                       http://localhost:8080/?dev    (tout débloqué + outils de test)
"""
import level_files

import functools, http.server, json, os, sys, re, math

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
        if self.path in ['/__editor/levels', '/__editor/validate-level']:
            self.level_documents(); return
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
            # Les vagues sont des données typées ; le reste conserve le contrat numérique.
            waves = {}
            catalog = set(re.findall(r"type:'([^']+)'", open(os.path.join(R, 'src/data/bestiary.js'), encoding='utf-8').read()))
            for level_id, level in out['levels'].items():
                if 'waves' not in level: continue
                rows = level.pop('waves')
                if not isinstance(rows, list) or len(rows) > 1000: raise ValueError('liste de vagues invalide')
                for row in rows:
                    if not isinstance(row, dict) or set(row) != {'type', 'at', 'count', 'spacing'}: raise ValueError('format de vague')
                    if row['type'] not in catalog or row['type'] == 'meteor' or row['type'].startswith('boss'): raise ValueError('ennemi inconnu')
                    for key, lo, hi in [('at', 0, 3600), ('count', 1, 100), ('spacing', 0, 60)]:
                        v = row[key]
                        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or not lo <= v <= hi: raise ValueError('vague : ' + key)
                    if row['count'] != int(row['count']): raise ValueError('quantité entière requise')
                waves[level_id] = rows
            check(out)
            for level_id, rows in waves.items(): out['levels'][level_id]['waves'] = rows
            head = open(os.path.join(R, 'src', 'data', 'tuning.js'), encoding='utf-8').read().split('const TUNING_OVERRIDES')[0]
            with open(os.path.join(R, 'src', 'data', 'tuning.js'), 'w', encoding='utf-8', newline=chr(10)) as f:
                f.write(head + 'const TUNING_OVERRIDES = ' + json.dumps(out, indent=1, sort_keys=True, ensure_ascii=False) + ';' + chr(10))
            body = b'{"ok":true}'; self.send_response(200)
        except Exception as e:
            body = json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'); self.send_response(400)
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

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
                        text = json.dumps(docs[key], ensure_ascii=False, indent=2) + '\n'
                        tmp = p.with_suffix('.json.tmp'); tmp.write_text(text); tmp.replace(p)
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
