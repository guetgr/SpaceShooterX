from playwright.sync_api import sync_playwright
PH=open('/tmp/ph/node_modules/phaser/dist/phaser.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':420,'height':760}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/phaser.min.js',lambda r:r.fulfill(body=PH,content_type='application/javascript'))
    pg.goto('file:///tmp/testdir/index.html'); pg.wait_for_timeout(3500)
    pg.evaluate("document.getElementById('btnStart').click()"); pg.wait_for_timeout(1000)
    pg.evaluate("""()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun); sc.introT=99999; sc.hp=1e9; sc.stats.maxHp=1e9; sc.hitCooldown=1e9; sc.spawnTimer=1e9; sc.enemies.clear(true,true); sc.playerTarget.x=330; sc.playerTarget.y=450;}"""); pg.wait_for_timeout(900)
    pg.evaluate("""()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun); sc.playerTarget.x=60; sc.playerTarget.y=450;}""")
    for i in range(6):
        pg.wait_for_timeout(70); a=pg.evaluate("(()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun);return [sc.player.angle,sc.player.x]})()")
        pg.screenshot(path=f'/tmp/van/d{i}.png',clip={'x':60,'y':330,'width':300,'height':260}); print(i,[round(v,1) for v in a])
    print(errs[:3]); b.close()
