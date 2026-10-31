#!/usr/bin/env python3
"""Versions des missions : persistance, récupération, validation et rollback ; niveaux du projet intacts."""
from concurrent.futures import ThreadPoolExecutor
import copy
import functools
import http.server
import json
from pathlib import Path
import shutil
import tempfile
import threading
import urllib.error
import urllib.request
from unittest.mock import patch

import editor_versions
import level_files
import serve

ROOT = Path(__file__).resolve().parents[1]


def copy_project_data(root):
    shutil.copytree(ROOT / 'src/data/levels', root / 'src/data/levels')
    # Fixture d'édition vide ; la campagne peut évoluer sans changer les assertions du studio.
    path=root/'src/data/levels/w1-l1.json'
    fixture=json.loads(path.read_text(encoding='utf-8'))
    fixture.update(waves=[],spawns=[],events=[],ambient={'golden':False,'smallEvents':False})
    path.write_text(level_files.dump_level(fixture),encoding='utf-8')
    (root / 'src/data/worlds').mkdir(parents=True)
    for rel in ['src/world/bg-monde.js', 'src/audio/music.js', 'src/data/bestiary.js', 'src/data/events.js',
                'src/data/enemy-stats.js', 'src/data/tunables.js', 'src/data/event-params.js']:
        target = root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(ROOT / rel, target)
    level_files.generate(root)


class Quiet(serve.NoCache):
    def log_message(self, *args): pass

    def translate_path(self, path):
        # Le jeu lit les niveaux du dossier temporaire, les scripts et assets viennent du projet.
        value = super().translate_path(path)
        relative = Path(value).relative_to(ROOT)
        if str(relative).replace('\\', '/').startswith('src/data/levels/') or str(relative).replace('\\', '/') == 'src/data/worlds/level-data.js':
            return str(self.server.editor_root / relative)
        return value


def start_server(root):
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
    server.editor_root = root
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, 'http://127.0.0.1:' + str(server.server_port)


def api_tests():
    with tempfile.TemporaryDirectory() as folder:
        root = Path(folder); copy_project_data(root)
        server, url = start_server(root)
        try:
            docs = level_files.read_levels(root)
            original = docs['w1-l1']; modified = copy.deepcopy(original); modified['threat'] = 3
            def request(path, payload=None, headers=None):
                data = None if payload is None else json.dumps(payload).encode()
                h = {'Content-Type':'application/json'} if data is not None else {}
                h.update(headers or {})
                try:
                    with urllib.request.urlopen(urllib.request.Request(url + path, data=data, headers=h)) as response:
                        return response.status, json.load(response)
                except urllib.error.HTTPError as error:
                    return error.code, json.load(error) if error.headers.get_content_type() == 'application/json' else None
            def versions(): return request('/__editor/versions?level=w1-l1')[1]['versions']
            assert versions() == [] and not editor_versions.database(root).exists()
            assert request('/__editor/validate-level', {'levels':{'w1-l1':modified}})[0] == 200
            assert not editor_versions.database(root).exists()
            # Un point nommé garde le brouillon sans modifier les fichiers du jeu.
            status, result = request('/__editor/versions', {'levelId':'w1-l1','title':'Avant le boss','document':modified})
            assert status == 200, result
            version_id = result['version']['id']
            assert level_files.read_levels(root)['w1-l1'] == original
            assert 'document' not in versions()[0]
            assert request('/__editor/versions?level=w1-l1&id=' + version_id)[1]['version']['document'] == modified
            assert request('/__editor/versions?level=w1-l2&id=' + version_id)[0] == 400
            assert request('/__editor/versions?level=../../escape')[0] == 400
            assert request('/__editor/versions?level=w1-l1&offset=-1')[0] == 400
            assert request('/__editor/versions?level=w1-l1', headers={'Origin':'https://example.com'})[0] == 403
            assert request('/.editor-history/versions.sqlite3')[0] == 404
            assert request('/%2eeditor-history/versions.sqlite3')[0] == 404
            assert request('/__editor/versions', {'levelId':'w1-l1','title':'','document':modified})[0] == 400
            invalid = copy.deepcopy(modified); invalid['threat'] = 999
            assert request('/__editor/versions', {'levelId':'w1-l1','title':'Invalide','document':invalid})[0] == 400
            assert len(versions()) == 1
            # Auto-version de l'état précédent et du nouvel enregistrement ; aucun doublon sur une sauvegarde identique.
            assert request('/__editor/levels', {'levels':{'w1-l1':modified}})[0] == 200
            assert len(versions()) == 3
            assert versions()[0]['kind'] == 'saved'
            assert request('/__editor/levels', {'levels':{'w1-l1':modified}})[0] == 200 and len(versions()) == 3
            assert request('/__editor/versions?level=w1-l1&id=' + version_id)[1]['version']['document'] == modified
            # Une erreur d'historique annule aussi l'écriture des niveaux et du cache.
            before = {p:p.read_bytes() for p in [root/'src/data/levels/w1-l1.json',root/'src/data/worlds/level-data.js']}
            next_doc = copy.deepcopy(modified); next_doc['threat'] = 4
            real_record = editor_versions.record
            def failed_record(connection, document, title, kind, **kwargs):
                if kind == 'saved': raise OSError('disque indisponible')
                return real_record(connection, document, title, kind, **kwargs)
            with patch.object(editor_versions, 'record', failed_record):
                status, result = request('/__editor/levels', {'levels':{'w1-l1':next_doc}})
                assert status == 400 and 'disque' in result['error']
            assert all(p.read_bytes() == data for p,data in before.items()) and len(versions()) == 3
            # Écritures simultanées : tous les points nommés restent distincts.
            def create(index):
                return request('/__editor/versions', {'levelId':'w1-l1','title':'Point '+str(index),'document':modified})[0]
            with ThreadPoolExecutor(max_workers=5) as pool: assert list(pool.map(create,range(10))) == [200]*10
            with editor_versions.transaction(root) as connection:
                for i in range(35): editor_versions.record(connection, modified, 'Pagination '+str(i), 'manual')
            page = request('/__editor/versions?level=w1-l1')[1]
            rest = request('/__editor/versions?level=w1-l1&offset=40')[1]
            assert len(page['versions']) == 40 and page['hasMore'] and len(rest['versions']) == 8 and not rest['hasMore']
            assert len({v['id'] for v in page['versions'] + rest['versions']}) == 48
            assert request('/__editor/versions?level=w1-l2')[1]['versions'] == []
            print('OK : versions persistantes, documents immuables, métadonnées légères, auto-versions sans doublons, validation, rollback, concurrence et pagination')
        finally:
            server.shutdown(); server.server_close()


def browser_tests():
    from playwright.sync_api import sync_playwright
    with tempfile.TemporaryDirectory() as folder:
        root = Path(folder); copy_project_data(root)
        server, url = start_server(root)
        errors = []
        try:
            with sync_playwright() as pw:
                try: browser = pw.chromium.launch(channel='chrome', headless=True)
                except Exception: browser = pw.chromium.launch(headless=True)
                page = browser.new_page(viewport={'width':1440,'height':1000})
                page.on('pageerror', lambda error:errors.append(str(error)))
                page.goto(url + '/editor.html'); page.wait_for_function('typeof S!=="undefined" && S.ready', timeout=60000)
                page.locator('#btnVersions').click()
                page.get_by_text('Aucune version pour cette mission.', exact=False).wait_for()
                page.locator('#versionName').fill('Avant les renforts')
                page.locator('#versionCreate').click()
                page.locator('.version-entry').first.wait_for()
                page.wait_for_function('document.querySelector("#versionRestore")?.disabled===true')
                page.locator('#versionClose').click()
                # Le brouillon a changé depuis cette version, la comparaison le montre.
                page.get_by_role('button',name='Ajouter une vague',exact=True).click()
                page.locator('#btnVersions').click()
                page.locator('#versionRestore').wait_for(state='visible')
                page.wait_for_function('document.querySelector("#versionRestore")?.disabled===false')
                assert 'Vagues' in page.locator('.version-diff').inner_text()
                page.locator('#versionRestore').click()
                page.wait_for_function('!document.querySelector("#versionDialog").open')
                assert page.evaluate('editorLevelDocument(S.sel).waves.length') == 0
                assert level_files.read_levels(root)['w1-l1']['waves'] == []
                # La copie avant restauration peut être récupérée et annuler/rétablir reste opérationnel.
                page.locator('#btnVersions').click()
                page.get_by_text('Avant restauration',exact=False).first.wait_for()
                page.wait_for_function('document.querySelector("#versionRestore")?.disabled===false')
                page.locator('#versionRestore').click()
                page.wait_for_function('!document.querySelector("#versionDialog").open')
                assert page.evaluate('editorLevelDocument(S.sel).waves.length') == 1
                page.locator('#btnUndo').click(); assert page.evaluate('editorLevelDocument(S.sel).waves.length') == 0
                page.locator('#btnRedo').click(); assert page.evaluate('editorLevelDocument(S.sel).waves.length') == 1
                page.locator('#btnSave').click(); page.wait_for_function('!dirty()')
                assert len(level_files.read_levels(root)['w1-l1']['waves']) == 1
                page.reload(); page.wait_for_function('typeof S!=="undefined" && S.ready',timeout=60000)
                page.locator('#btnVersions').click(); page.locator('.version-entry').first.wait_for()
                assert page.locator('.version-entry').count() >= 4
                page.wait_for_function('document.querySelector("#versionRestore")!==null')
                for width in [768,390]:
                    page.set_viewport_size({'width':width,'height':900})
                    assert page.evaluate('document.querySelector("#versionDialog").getBoundingClientRect().right <= innerWidth')
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
                page.screenshot(path='/tmp/ssx-versions-mobile.png',full_page=True)
                page.set_viewport_size({'width':1440,'height':1000})
                page.screenshot(path='/tmp/ssx-versions-desktop.png')
                assert errors == [], errors
                browser.close()
            print('OK : interface de versions, différences, restauration protégée, annuler/rétablir, enregistrement réel dans un dossier temporaire, rechargement et affichage mobile')
        finally:
            server.shutdown(); server.server_close()


if __name__ == '__main__':
    api_tests()
    browser_tests()
