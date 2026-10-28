"""Vérifie l'export HTTP dans un dossier temporaire, sans toucher aux réglages du jeu."""
import functools
import http.server
import json
from pathlib import Path
import shutil
import tempfile
import threading
import urllib.request
import urllib.error
import serve

with tempfile.TemporaryDirectory() as folder:
    root = Path(folder)
    (root / 'src/data').mkdir(parents=True)
    shutil.copy(Path(serve.R) / 'src/data/bestiary.js', root / 'src/data/bestiary.js')
    target = root / 'src/data/tuning.js'
    target.write_text('"use strict";\nconst TUNING_OVERRIDES = {};\n')
    serve.R = folder
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(serve.NoCache, directory=folder))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/__editor/save' % server.server_port
    def send(waves):
        data = {'tuto': {}, 'levels': {'w1-l1': {'waves': waves, 'timelineOnly': 1}}}
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
        try:
            return json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as e:
            return json.load(e)
    wave = {'type': 'sat', 'at': 2, 'count': 3, 'spacing': 0.5}
    assert send([wave])['ok']
    saved = target.read_text()
    assert '"waves"' in saved and '"sat"' in saved
    for change in [{'type': 'boss'}, {'type': 'meteor'}, {'count': 1.5}, {'at': -1}, {'spacing': 61}]:
        assert not send([{**wave, **change}])['ok']
        assert target.read_text() == saved
    assert send([])['ok']
    assert '"waves": []' in target.read_text()
    server.shutdown()
print('OK : export, conservation des listes vides et refus des vagues invalides')
