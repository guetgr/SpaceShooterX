import json, sys, collections
from playwright.sync_api import sync_playwright
PH=open('/tmp/ph/node_modules/phaser/dist/phaser.min.js').read()
J=lambda body:"()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun);"+body+"}"
def run(pg, cdp, alert, secs):
    pg.evaluate(J("sc.alertLevel=%d; sc.stats.maxHp=1e9; sc.hp=1e9; sc.stats.shieldMax=0; window.__bot&&clearInterval(window.__bot); window.__bot=setInterval(()=>{ sc.hp=1e9; if(!sc.running){ const c=document.querySelector('#cardsWrap .card'); if(c&&!document.getElementById('levelup').classList.contains('hidden')) c.click(); } let best=null,bd=1e9; sc.enemies.children.iterate(e=>{ if(e&&e.active){ const d=Math.abs(e.x-sc.player.x)+Math.abs(e.y-sc.player.y)*0.2; if(d<bd){bd=d;best=e;} } }); sc.playerTarget.x = best? best.x : 210; sc.playerTarget.y=620; },120);" % alert))
    pg.wait_for_timeout(3000)
    cdp.send('Profiler.start')
    fr=[]
    for i in range(secs):
        pg.wait_for_timeout(1000)
        fr.append(pg.evaluate(J("let b=0; sc.enemyBullets.children.iterate(x=>b++); return [Math.round(window.__game.loop.actualFps), sc.enemies.getLength(), b, sc.playerBullets.getLength(), sc.alertLevel]")))
    prof=cdp.send('Profiler.stop')['profile']
    return fr, prof
def agg(prof):
    nodes={n['id']:n for n in prof['nodes']}
    self_t=collections.Counter()
    dts=prof['timeDeltas']; ids=prof['samples']
    for sid,dt in zip(ids,dts): self_t[sid]+=dt
    byf=collections.Counter()
    for sid,t in self_t.items():
        cf=nodes[sid]['callFrame']; key=(cf['functionName'] or '(anon)')+':'+str(cf['lineNumber'])
        if 'phaser' in cf['url'] or cf['url'].endswith('phaser.min.js'): key='[phaser] '+(cf['functionName'] or '(anon)')
        byf[key]+=t
    tot=sum(byf.values())
    return byf.most_common(18), tot
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':420,'height':760}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/phaser.min.js',lambda r:r.fulfill(body=PH,content_type='application/javascript'))
    pg.goto('file:///tmp/testdir/index.html'); pg.wait_for_timeout(3000)
    cdp=pg.context.new_cdp_session(pg); cdp.send('Profiler.enable')
    pg.evaluate("document.getElementById('btnStart').click()"); pg.wait_for_timeout(4000)
    pg.evaluate(J("sc.introActive=false"))
    for al in [6,10,14]:
        fr,prof=run(pg,cdp,al,int(sys.argv[1]))
        top,tot=agg(prof)
        print('=== alerte',al,'fps',[f[0] for f in fr],'ennemis max',max(f[1] for f in fr),'tirs ennemis max',max(f[2] for f in fr),'tirs joueur max',max(f[3] for f in fr))
        for k,t in top: print('  %5.1f%%  %s'%(t/tot*100,k))
    print(errs[:3])
    b.close()
