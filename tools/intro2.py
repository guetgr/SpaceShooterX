from playwright.sync_api import sync_playwright
PH=open('/tmp/ph/node_modules/phaser/dist/phaser.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':420,'height':760}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/phaser.min.js',lambda r:r.fulfill(body=PH,content_type='application/javascript'))
    pg.goto('file:///tmp/testdir/index.html'); pg.wait_for_timeout(3500)
    pg.evaluate("document.getElementById('btnStart').click()"); pg.wait_for_timeout(600)
    pg.screenshot(path='/tmp/van/g0.png')
    # skip test: tap after 900ms
    pg.wait_for_timeout(1500); pg.mouse.click(210,400); pg.wait_for_timeout(200)
    print(pg.evaluate("(()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun);return Math.round(sc.introT)})()"))
    pg.wait_for_timeout(1200)
    print(pg.evaluate("(()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun);return JSON.stringify({act:sc.introActive,scale:sc.player.scaleX,y:sc.player.y,endY:sc.introEndY,ie:!!sc._ie,tier:sc.shipTier})})()"))
    # tiers
    for a in (3,5,7):
        pg.evaluate(f"(()=>{{const sc=window.__game.scene.scenes.find(s=>s.startRun);sc.alertLevel={a};sc.updateShipTier();}})()"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'/tmp/van/t{a}.png',clip={'x':130,'y':520,'width':160,'height':200})
    pg.wait_for_timeout(5000)
    print(errs[:5]); b.close()
