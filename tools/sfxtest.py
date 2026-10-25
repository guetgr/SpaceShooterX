from playwright.sync_api import sync_playwright
PH=open('/tmp/ph/node_modules/phaser/dist/phaser.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':420,'height':760}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/phaser.min.js',lambda r:r.fulfill(body=PH,content_type='application/javascript'))
    pg.goto('file:///tmp/testdir/index.html'); pg.wait_for_timeout(3000)
    pg.mouse.click(200,300); pg.wait_for_timeout(2500)
    print(pg.evaluate("""()=>{const s=window.__T.sfx; s.resume(); return JSON.stringify(Object.fromEntries(Object.entries(s.files||{}).map(([k,v])=>[k,v.length])))}"""))
    print(pg.evaluate("""async()=>{const s=window.__T.sfx; let n=0; const orig=s.playFile.bind(s); s.playFile=function(){n++; return orig.apply(this,arguments)};
      ['laser','lightning','missile','pulsar','swarmMissile','thunder','blackHole','bounce','droneShot'].forEach(k=>{ s[k]({pan:0.3,tier:2}); });
      await new Promise(r=>setTimeout(r,300)); return n}"""))
    pg.evaluate("document.getElementById('btnStart').click()"); pg.wait_for_timeout(6500)
    print('errs',errs[:3]); b.close()
