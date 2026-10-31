#!/usr/bin/env python3
"""Régression du studio : aucune écriture dans les missions, serveur temporaire isolé."""
import functools, http.server, json, tempfile, threading
from pathlib import Path
import serve
ROOT=Path(__file__).resolve().parents[1]
class Quiet(serve.NoCache):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
URL='http://127.0.0.1:'+str(server.server_port)
shots=tempfile.TemporaryDirectory(prefix='ssx-editor-qa-')
from playwright.sync_api import sync_playwright
report={}; errors=[]
with sync_playwright() as pw:
    try: browser=pw.chromium.launch(channel='chrome',headless=True,args=['--autoplay-policy=no-user-gesture-required'])
    except Exception: browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.accept())
    fixture=json.loads((ROOT/'src/data/levels/w1-l1.json').read_text(encoding='utf-8'))
    fixture.update(waves=[],spawns=[],events=[],ambient={'golden':False,'smallEvents':False})
    page.route('**/src/data/levels/w1-l1.json',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps(fixture)))
    page.goto(URL+'/editor.html')
    page.wait_for_function('typeof S!=="undefined" && S.ready',timeout=60000)
    page.wait_for_function('frames.play.contentWindow.__game.loop.running === false')
    assert page.evaluate('!!frames.bot.src') is False
    report['initial_dom']=page.locator('*').count()
    page.locator('[data-enemy=satgun]').drag_to(page.locator('.tl-rail').first,target_position={'x':160,'y':22})
    assert page.evaluate('editorLevelDocument(S.sel).waves.length')==1,'catalogue drag drop'
    assert page.evaluate('editorLevelDocument(S.sel).waves[0].type')=='satgun'
    page.locator('[data-formation=star]').click()
    for key,value in [('count','10'),('hpMul','2'),('dmgMul','1.5')]:
        page.locator('[data-field='+key+']').fill(value);page.locator('[data-field='+key+']').press('Tab')
    page.locator('[data-field=alert]').select_option('6')
    before=page.evaluate('editorLevelDocument(S.sel).waves[0].at')
    box=page.locator('[data-wave="0"]').bounding_box()
    page.mouse.move(box['x']+25,box['y']+15);page.mouse.down();page.mouse.move(box['x']+105,box['y']+15,steps=12);page.mouse.up()
    assert page.evaluate('editorLevelDocument(S.sel).waves[0].at')==before+10
    page.get_by_role('button',name='Annuler',exact=True).click()
    assert page.evaluate('editorLevelDocument(S.sel).waves[0].at')==before
    page.get_by_role('button',name='Rétablir',exact=True).click()
    assert page.evaluate('editorLevelDocument(S.sel).waves[0].at')==before+10
    page.locator('[data-wave="0"]').click()
    canvas=page.locator('#formationCanvas').bounding_box()
    page.mouse.move(canvas['x']+70,canvas['y']+90);page.mouse.down();page.mouse.move(canvas['x']+90,canvas['y']+100,steps=5);page.mouse.up()
    assert page.evaluate('editorLevelDocument(S.sel).waves[0].x')>50
    page.get_by_role('button',name='Fichier JSON',exact=True).click()
    page.get_by_role('button',name='Composition',exact=True).click()
    page.get_by_role('button',name='Fichier JSON',exact=True).click()
    assert page.locator('.tl-json').count()==1
    page.get_by_role('button',name='Composition',exact=True).click()
    page.wait_for_timeout(400)
    original=page.evaluate('JSON.stringify(editorLevelDocument(S.sel).waves)')
    page.evaluate('S.saved=JSON.stringify(S.ov)') # éviter le dialogue de rechargement du navigateur automatisé
    page.reload();page.wait_for_function('typeof S!=="undefined" && S.ready',timeout=60000)
    assert page.evaluate('JSON.stringify(editorLevelDocument(S.sel).waves)')==original,'draft restoration'
    page.locator('[data-wave="0"]').click()
    report['edited_wave']=page.evaluate('editorLevelDocument(S.sel).waves[0]')
    assert page.evaluate('validateOf(S.sel).errors')==[]
    # Validation réelle du serveur, sans écrire un fichier de mission.
    payload=page.evaluate('({levels:{[S.sel]:editorLevelDocument(S.sel)}})')
    response=page.request.post(URL+'/__editor/validate-level',data=payload)
    assert response.ok, response.text()
    # Enregistrement simulé pour vérifier le rebasage, aucune écriture dans les niveaux.
    posted=[]
    def fake_save(route):
        posted.append(route.request.post_data_json)
        route.fulfill(status=200,content_type='application/json',body='{"ok":true,"count":42}')
    page.route('**/__editor/levels',fake_save)
    page.locator('#btnSave').click()
    page.wait_for_function('!dirty()')
    assert len(posted[0]['levels'])==42
    assert page.evaluate('historyBack.length')==0
    page.get_by_role('button',name='Tester la mission',exact=True).click()
    page.wait_for_function('frames.play.contentWindow.__ssxScene.running',timeout=15000)
    # Forcer le temps de mission uniquement dans la copie de test pour vérifier la vague réellement jouée.
    runtime=page.evaluate('''() => {const sc=frames.play.contentWindow.__ssxScene;sc.introActive=false;sc.lvT=100;sc.levelUpdate(1);return {id:sc.lvDef.id,waves:sc.lvDef.waves,enemies:sc.enemies.getChildren().filter(e=>e.waveAlert===6).map(e=>({type:e.enemyType,hp:e.hp,alert:e.waveAlert,dmg:e.waveDmgMul,vy:e.body.velocity.y})),alert:sc.alertLevel};}''')
    assert len(runtime['enemies'])==10, runtime
    assert all(e['dmg']==1.5 and e['vy']>0 for e in runtime['enemies'])
    assert runtime['alert']==1
    report['runtime']=runtime
    special=page.evaluate('''() => {const sc=frames.play.contentWindow.__ssxScene;const tiers=['bras','pilleur','eclaireur'].map(type=>sc.spawnOneEnemy(type,200,{tier:3}).tier);sc.brasOrb(200,150,45,{waveDmgMul:1});const base=sc.enemyBullets.getChildren().at(-1).damage;sc.brasOrb(200,150,45,{waveDmgMul:2});return {tiers,base,scaled:sc.enemyBullets.getChildren().at(-1).damage};}''')
    assert special['tiers']==[3,3,3]
    assert special['scaled']==special['base']*2
    report['special_creatures']=special
    page.get_by_role('button',name='Revenir à la formation').click()
    page.wait_for_function('frames.play.contentWindow.__game.loop.running === false')
    page.locator('[data-wave="0"]').click()
    page.screenshot(path=str(Path(shots.name)/'desktop.png'))
    # Annulation du drag : aucune écriture ni entrée d'historique supplémentaire.
    at=page.evaluate('editorLevelDocument(S.sel).waves[0].at')
    box=page.locator('[data-wave="0"]').bounding_box()
    page.mouse.move(box['x']+20,box['y']+15);page.mouse.down();page.mouse.move(box['x']+60,box['y']+15)
    page.locator('[data-wave="0"]').dispatch_event('pointercancel',{'pointerId':1});page.mouse.up()
    assert page.evaluate('editorLevelDocument(S.sel).waves[0].at')==at
    # Test du coût de composition à 1 000 vagues, puis remise à l'état précédent.
    report['stress']=page.evaluate('''() => {const old=clone(S.ov);S.ov.levels[S.sel]={waves:Array.from({length:1000},(_,i)=>({type:['sat','satgun','grunt'][i%3],at:i*3,count:5,spacing:.5,formation:'line'}))};const t=performance.now();S.refreshTimeline();const result={waves:1000,renderMs:Math.round((performance.now()-t)*10)/10,dom:document.querySelectorAll('*').length,visibleBlocks:document.querySelectorAll('[data-wave]').length};S.ov=old;S.refreshTimeline();return result;}''')
    for width in [1024,768,390]:
        page.set_viewport_size({'width':width,'height':900})
        page.wait_for_timeout(100)
        overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth')
        assert not overflow, f'overflow {width}'
    page.screenshot(path=str(Path(shots.name)/'mobile.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1000})
    page.get_by_role('button',name='Réglages de mission',exact=True).click()
    assert page.locator('.st-step').count()>0
    page.get_by_role('button',name='Composition',exact=True).click()
    assert not errors, errors
    report['errors']=errors;report['checks']=['native catalogue drag drop','timeline drag and cancel','formation and properties','canvas drag','undo redo','JSON tab','draft reload','server validation','save rebasing','runtime wave and pause','1000 wave stress','responsive 1024/768/390','advanced settings']
    browser.close()
server.shutdown();shots.cleanup()
print(json.dumps(report,ensure_ascii=False,indent=2))
