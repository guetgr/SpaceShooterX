#!/usr/bin/env python3
"""Tests des modes agrandi et fenêtre séparée de l'éditeur, sans modifier les missions."""
import functools
import http.server
import json
from pathlib import Path
import tempfile
import threading
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
errors=[];report={}
try:
    with sync_playwright() as pw, tempfile.TemporaryDirectory(prefix='ssx-preview-') as captures:
        try: browser=pw.chromium.launch(channel='chrome',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
        except Exception: browser=pw.chromium.launch(headless=True)
        context=browser.new_context(viewport={'width':1440,'height':1000})
        context.on('page',lambda p:p.on('pageerror',lambda error:errors.append(str(error))))
        page=context.new_page()
        page.goto('http://127.0.0.1:'+str(server.server_port)+'/editor.html')
        page.wait_for_function('typeof S!=="undefined"&&S.ready',timeout=90000)
        page.evaluate('''() => {const d=editorLevelDocument(S.sel);d.waves=[{type:'satgun',at:1,count:2,spacing:0,formation:'line',x:50,y:0,spread:180}];S.ov.levels[S.sel]=d;changed();}''')
        page.locator('#btnPlay').click()
        page.wait_for_function('frames.play.contentWindow.__ssxScene.running')
        page.evaluate('frames.play.contentWindow.__ssxScene._previewTest="same-instance"')
        small=page.locator('#previewPane').bounding_box()
        page.locator('#btnExpand').click()
        page.wait_for_function('document.querySelector("#previewStage").classList.contains("preview-expanded")')
        large=page.locator('#previewPane').bounding_box()
        assert large['height']>small['height']*2,(small,large)
        assert page.evaluate('frames.play.contentWindow.__ssxScene._previewTest')=='same-instance'
        page.screenshot(path='/tmp/ssx-preview-expanded.png')
        page.locator('#playFrame').focus();page.keyboard.press('Escape')
        page.wait_for_function('!document.querySelector("#previewStage").classList.contains("preview-expanded")')
        assert page.evaluate('frames.play.contentWindow.__ssxScene._previewTest')=='same-instance'
        assert page.evaluate('frames.play.contentWindow.__ssxScene.running') is True
        page.locator('#btnExpand').click();page.locator('#btnExpand').click()
        assert page.evaluate('frames.play.contentWindow.__ssxScene._previewTest')=='same-instance'
        state=page.evaluate('JSON.stringify(S.ov)')
        with context.expect_page() as event: page.locator('#btnPopup').click()
        popup=event.value
        popup.wait_for_function('document.querySelector("#previewGame").contentWindow.__ssxScene?.running',timeout=90000)
        popup.wait_for_function('document.querySelector("#previewWait").hidden')
        assert popup.evaluate('document.querySelector("#previewGame").contentWindow.__ssxScene.lvDef.waves[0].count')==2
        assert page.evaluate('JSON.stringify(S.ov)')==state,'Le ready de la fenêtre ne remplace pas le brouillon de l’éditeur'
        page.wait_for_function('frames.play.contentWindow.__game.loop.running===false')
        assert popup.evaluate('document.querySelector("#previewGame").contentWindow.__game.loop.running') is True
        popup.set_viewport_size({'width':760,'height':900})
        frame=popup.locator('.game-frame').bounding_box()
        assert frame['height']>600 and abs(frame['width']/frame['height']-4/7)<.01,frame
        popup.screenshot(path='/tmp/ssx-preview-popup.png')
        page.evaluate('S.ov.levels[S.sel].waves[0].count=3;changed()')
        popup.locator('#previewRestart').click()
        popup.wait_for_function('document.querySelector("#previewGame").contentWindow.__ssxScene.lvDef.waves[0].count===3')
        page.evaluate('S.ov.levels[S.sel].waves[0].count=4;changed()')
        page.locator('#btnPlay').click()
        popup.wait_for_function('document.querySelector("#previewGame").contentWindow.__ssxScene.lvDef.waves[0].count===4')
        assert page.evaluate('frames.play.contentWindow.__game.loop.running') is False
        if popup.locator('#previewFullscreen').is_visible():
            popup.locator('#previewFullscreen').click()
            popup.wait_for_function('document.fullscreenElement!==null||document.querySelector("#previewStatus").textContent.includes("indisponible")')
            report['fullscreen']=popup.evaluate('document.fullscreenElement!==null')
            if report['fullscreen']: popup.evaluate('document.exitFullscreen()')
        popup.close()
        page.wait_for_function('document.querySelector("#stageLabel").textContent==="Placement initial"')
        page.locator('#btnPlay').click()
        page.wait_for_function('frames.play.contentWindow.__game.loop.running===true')
        assert page.evaluate('frames.play.contentWindow.__ssxScene.lvDef.waves[0].count')==4
        page.evaluate('window._realOpen=window.open;window.open=()=>null')
        page.locator('#btnPopup').click()
        assert 'bloquée' in page.locator('#toast').inner_text()
        assert page.evaluate('frames.play.contentWindow.__game.loop.running') is True
        page.evaluate('window.open=window._realOpen')
        page.locator('#btnStop').click();page.wait_for_function('frames.play.contentWindow.__game.loop.running===false')
        for width in [1024,768,390]:
            page.set_viewport_size({'width':width,'height':900})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
        assert not errors,errors
        report.update(smallHeight=round(small['height']),largeHeight=round(large['height']),popupHeight=round(frame['height']),errors=errors)
        browser.close()
finally:
    server.shutdown();server.server_close()
print('OK : même partie agrandie, Échap, popup du brouillon, relance, moteur unique actif, plein écran, fermeture, blocage du navigateur et affichage mobile')
print(json.dumps(report,ensure_ascii=False))
