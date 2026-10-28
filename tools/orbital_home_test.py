"""Régression du hublot : sélection, occlusion, finition, navigation et mobile."""
import functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(R)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome')
  page=browser.new_page(viewport={'width':420,'height':760},device_scale_factor=2)
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.goto('http://127.0.0.1:%d/'%srv.server_address[1],wait_until='domcontentloaded')
  page.wait_for_function('window.__ssxScene && window.__ssxScene.scene.isActive("home")',timeout=60000)
  page.wait_for_timeout(900)
  assert page.locator('#mapOrbit .node').count()==6
  assert page.locator('#levelCard [role=progressbar]').get_attribute('aria-valuenow')=='0'
  assert page.locator('#orbitPrev').is_disabled()
  assert page.locator('#mapOrbit .node-slot[hidden]').count()>0, 'La planète doit occulter les étapes arrière'
  for i in range(1,6):
   page.locator('#orbitNext').click();page.wait_for_timeout(750)
   assert page.locator('#orbitIndex').inner_text()=='ORDRE %02d / 6'%(i+1)
   assert page.locator('#mapOrbit .node.sel').is_visible(), 'Étape sélectionnée occultée'
   assert page.locator('#btnLaunch').is_disabled(), 'Ordre verrouillé lançable'
  assert page.locator('#orbitNext').is_disabled()
  for _ in range(5):
   page.locator('#orbitPrev').click();page.wait_for_timeout(750)
  assert not page.locator('#btnLaunch').is_disabled()
  # Sauvegarde de test isolée : aucun profil utilisateur n'est ouvert.
  for values, expected in [({'sats':1},'partial'),({'sats':1,'boss':1,'win':1,'clean':1},'100')]:
   page.evaluate('''values=>{const p=getWorldProgress();p.comp['w1-tuto']=values;setWorldProgress(p);window.__ssxScene.scene.get('home').refreshHome();}''',values)
   value=int(page.locator('#levelCard [role=progressbar]').get_attribute('aria-valuenow'))
   assert (0<value<100) if expected=='partial' else value==100
  for width,height in [(320,640),(400,700),(768,1024)]:
   page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(250)
   assert page.locator('#btnLaunch').is_visible()
   assert page.evaluate('''()=>{const p=document.querySelector('#levelCard [role=progressbar]').getBoundingClientRect(),c=document.querySelector('#levelCard').getBoundingClientRect();return p.top>=c.top && p.bottom<=c.bottom}'''), 'Finition coupée'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.set_viewport_size({'width':420,'height':760})
  page.screenshot(path=str(R/'docs/concepts-accueil-2026-10-27/07-in-game-finition-100.png'))
  page.locator('#levelCard summary').click()
  assert page.locator('#levelCard .om-brief').is_visible()
  page.locator('#levelCard summary').click()
  page.locator('#tabHangar').click();page.wait_for_timeout(700)
  assert page.locator('#atelierNext').is_visible()
  page.locator('#tabTree').click();page.wait_for_timeout(700)
  assert page.locator('#treeScroll').is_visible()
  page.locator('#tabMap').click();page.wait_for_timeout(700)
  page.locator('#btnGalaxy').click();page.wait_for_timeout(900)
  assert page.locator('#pageMap').get_attribute('data-mode')=='galaxy'
  assert not page.locator('.home-window').is_visible()
  page.locator('#tabMap').click();page.wait_for_timeout(900)
  assert page.locator('.home-window').is_visible()
  page.emulate_media(reduced_motion='reduce')
  page.evaluate("window.__ssxScene.scene.get('home').selectHomeLevel(WORLDS[0].levels[5].id)")
  page.wait_for_timeout(50)
  assert page.locator('#mapOrbit .node.sel').is_visible()
  assert page.evaluate("!window.__ssxScene.scene.get('home').orbitTween || !window.__ssxScene.scene.get('home').orbitTween.isPlaying()")
  page.evaluate("window.__ssxScene.scene.get('home').selectHomeLevel('w1-tuto')")
  page.locator('#btnLaunch').click()
  page.wait_for_function('window.__ssxScene.running && window.__ssxScene.tuto',timeout=15000)
  assert not page.locator('#home').is_visible()
  page.evaluate('window.__ssxScene.tutoFinish()')
  page.wait_for_function('window.__ssxScene.scene.isActive("home")',timeout=15000)
  assert page.locator('.home-window').is_visible()
  assert not errors,errors
  browser.close()
  print('OK : parcours, occlusion, verrouillage, finition 0/partiel/100, 3 tailles, navigation, mouvement réduit, mission/retour ; aucune erreur JS')
finally:
 srv.shutdown()
