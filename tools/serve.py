#!/usr/bin/env python3
"""Serveur local de développement (sans cache : tu modifies un fichier, tu rafraîchis la page, c'est pris en compte).

  python tools/serve.py [port]      -> http://localhost:8080/        (jeu normal)
                                       http://localhost:8080/?dev    (tout débloqué + outils de test)
"""
import functools, http.server, os, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.js': 'text/javascript', '.json': 'application/json'}

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
