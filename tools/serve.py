#!/usr/bin/env python3
"""Serveur local de développement (sans cache : tu modifies un fichier, tu rafraîchis la page, c'est pris en compte).

  python tools/serve.py [port]      -> http://localhost:8080/        (jeu normal)
                                       http://localhost:8080/?dev    (tout débloqué + outils de test)
"""
import level_files
import editor_versions

import functools, http.server, json, os, sys
from urllib.parse import urlsplit, parse_qs, unquote

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.js': 'text/javascript', '.json': 'application/json'}

    # Éditeur de niveaux (editor.html) : écrit src/data/levels/*.json via /__editor/levels (serveur local uniquement).
    def do_GET(self):
        parsed = urlsplit(self.path)
        if '.editor-history' in unquote(parsed.path).split('/'):
            self.send_error(404); return
        if parsed.path == '/__editor/versions':
            if self.editor_guard(require_json=False): self.version_documents(parse_qs(parsed.query))
            return
        if parsed.path == '/__lab/runs':
            if self.editor_guard(require_json=False): self.lab_runs(parse_qs(parsed.query))
            return
        if self.path == '/__editor/ping':
            body = b'{"ok":true,"versionHistory":true}'; self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()

    # Protection des écritures : l'éditeur est servi par ce même serveur, donc seule l'origine locale est admise.
    def editor_guard(self, require_json=True):
        port = self.server.server_address[1]
        hosts = ('localhost', '127.0.0.1')
        host = self.headers.get('Host', '')
        if host not in [h + ':%d' % port for h in hosts] + ([h for h in hosts] if port == 80 else []):
            self.refuse(421, 'hôte refusé'); return False
        origin = self.headers.get('Origin')
        if origin is not None and origin not in ['http://%s:%d' % (h, port) for h in hosts]:
            self.refuse(403, 'origine refusée'); return False
        if require_json and self.headers.get('Content-Type', '').split(';')[0].strip().lower() != 'application/json':
            self.refuse(415, 'Content-Type application/json requis'); return False
        return True

    def refuse(self, code, msg):
        body = json.dumps({'ok': False, 'error': msg}).encode('utf-8'); self.send_response(code)
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_POST(self):
        if self.path == '/__editor/versions':
            if self.editor_guard(): self.version_documents()
            return
        if self.path in ['/__editor/levels', '/__editor/validate-level']:
            if self.editor_guard(): self.level_documents()
            return
        if self.path == '/__lab/runs':
            if self.editor_guard(): self.lab_runs()
            return
        self.send_error(404)

    def read_editor_payload(self):
        size = int(self.headers.get('Content-Length', '0'))
        if not 0 < size < 2000000: raise ValueError('taille invalide')
        data = json.loads(self.rfile.read(size))
        if not isinstance(data, dict): raise ValueError('Objet JSON requis')
        return data

    def editor_json(self, body, status=200):
        data = json.dumps(body, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers(); self.wfile.write(data)

    def version_documents(self, query=None):
        from pathlib import Path
        root = Path(getattr(self.server, 'editor_root', R))
        try:
            originals = level_files.read_levels(root)
            if query is not None:
                level_id = query.get('level', [''])[0]
                if level_id not in originals: raise ValueError('Mission inconnue')
                version_id = query.get('id', [''])[0]
                if version_id:
                    self.editor_json({'ok':True, 'version':editor_versions.get_version(root, level_id, version_id)})
                else:
                    offset = int(query.get('offset', ['0'])[0])
                    if not 0 <= offset <= 1000000: raise ValueError('Pagination invalide')
                    self.editor_json(dict(ok=True, **editor_versions.list_versions(root, level_id, offset)))
                return
            payload = self.read_editor_payload()
            document = payload.get('document')
            level_id = payload.get('levelId')
            if not isinstance(level_id, str) or level_id not in originals: raise ValueError('Mission inconnue')
            level_files.validate_level(document, originals[level_id], root)
            kind = payload.get('kind', 'manual')
            if kind not in ['manual', 'before-restore']: raise ValueError('Type de version inconnu')
            title = payload.get('title', 'Point de sauvegarde')
            with editor_versions.transaction(root) as connection:
                version = editor_versions.record(connection, document, title, kind)
            self.editor_json({'ok':True, 'version':version})
        except Exception as error:
            self.editor_json({'ok':False, 'error':str(error)}, 400)

    # Laboratoire de test (accueil ?lab) : une partie = une ligne JSON dans .editor-history/lab-runs.jsonl (ignoré par Git), lue par l'éditeur.
    def lab_runs(self, query=None):
        from pathlib import Path
        path = Path(getattr(self.server, 'editor_root', R)) / '.editor-history' / 'lab-runs.jsonl'
        def read():
            if not path.exists(): return []
            rows = []
            for line in path.read_text(encoding='utf-8').splitlines():
                try: rows.append(json.loads(line))
                except ValueError: pass
            return rows
        try:
            with editor_versions.LOCK:
                if query is not None:
                    level_id = query.get('level', [''])[0]
                    self.editor_json({'ok':True, 'runs':[r for r in read() if not level_id or r.get('levelId') == level_id]})
                    return
                payload = self.read_editor_payload()
                path.parent.mkdir(exist_ok=True)
                if 'delete' in payload:
                    kept = [r for r in read() if r.get('id') != payload['delete']]
                    path.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in kept), encoding='utf-8')
                else:
                    run = payload.get('run')
                    if not isinstance(run, dict) or not isinstance(run.get('levelId'), str): raise ValueError('partie invalide')
                    import time, uuid
                    run['id'] = uuid.uuid4().hex[:12]; run['at'] = int(time.time() * 1000)
                    with path.open('a', encoding='utf-8') as f: f.write(json.dumps(run, ensure_ascii=False) + '\n')
            self.editor_json({'ok':True})
        except Exception as error:
            self.editor_json({'ok':False, 'error':str(error)}, 400)

    def level_documents(self):
        from pathlib import Path
        root = Path(getattr(self.server, 'editor_root', R))
        try:
            payload = self.read_editor_payload()
            # Les écritures des niveaux et leurs versions sont sérialisées dans ce serveur.
            with editor_versions.LOCK:
                originals = level_files.read_levels(root)
                docs = payload['levels']
                if not isinstance(docs, dict) or not docs: raise ValueError('niveaux manquants')
                for key, value in docs.items():
                    if key not in originals: raise ValueError('niveau inconnu')
                    level_files.validate_level(value, originals[key], root)
                versions = []
                if self.path == '/__editor/levels':
                    paths = {key: root / 'src/data/levels' / (key + '.json') for key in docs}
                    backups = {key: p.read_bytes() for key,p in paths.items()}
                    changed = [key for key in docs if editor_versions.fingerprint(docs[key]) != editor_versions.fingerprint(originals[key])]
                    try:
                        if changed:
                            with editor_versions.transaction(root) as connection:
                                for key in changed:
                                    first = connection.execute('SELECT 1 FROM versions WHERE level_id=? LIMIT 1', (key,)).fetchone() is None
                                    editor_versions.record(connection, originals[key], 'Version initiale' if first else 'Avant enregistrement', 'initial' if first else 'before-save', deduplicate=True)
                                for key,p in paths.items(): level_files.write_if_changed(p, level_files.dump_level(docs[key]))
                                level_files.generate(root)
                                for key in changed:
                                    versions.append(editor_versions.record(connection, docs[key], 'Enregistrement', 'saved', deduplicate=True))
                        else:
                            for key,p in paths.items(): level_files.write_if_changed(p, level_files.dump_level(docs[key]))
                            level_files.generate(root)
                    except Exception:
                        for key,p in paths.items():
                            if p.read_bytes() != backups[key]: p.write_bytes(backups[key])
                        level_files.generate(root)
                        raise
            self.editor_json({'ok':True, 'count':len(docs), 'versions':versions})
        except Exception as error:
            self.editor_json({'ok':False, 'error':str(error)}, 400)

    def end_headers(self):
        self.send_header('X-SSX-Dev', '1')          # signature du serveur local : src/dev/lab.js la lit sur un fichier existant (pas de requête en 404 dans la console des autres hébergements)
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
