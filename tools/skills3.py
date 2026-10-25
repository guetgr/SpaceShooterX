from playwright.sync_api import sync_playwright
PH=open('/tmp/ph/node_modules/phaser/dist/phaser.min.js').read()
J=lambda body:"()=>{const sc=window.__game.scene.scenes.find(s=>s.startRun);"+body+"}"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':420,'height':760}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/phaser.min.js',lambda r:r.fulfill(body=PH,content_type='application/javascript'))
    pg.goto('file:///tmp/testdir/index.html'); pg.wait_for_timeout(3000)
    pg.evaluate("document.getElementById('btnStart').click()"); pg.wait_for_timeout(4000)
    print(pg.evaluate(J("""
      const T=window.__T; T.ALL_TREE_NODES.forEach(n=>{ if(n.apply){ try{ n.apply(sc.stats,n.max);}catch(e){} } });
      const s=sc.stats; const out={armor:s.armorPct,dodge:s.dodgeCharges,sec:s.secondSouffle,dFR:s.droneFireRateMul,dDM:s.droneDamageMul,sH:s.sangsueHealMul,sR:s.sangsueRadiusBonus};
      sc.introActive=false; s.maxHp=1000; sc.hp=1000; sc.odActive=0; sc.dodgeInvuln=0; sc.hitCooldown=0; sc.invulnUntil=0;
      sc.damagePlayer(100); out.hpLoss=1000-sc.hp;
      sc.dodgeCharges=s.dodgeCharges; sc.tryDodge(); out.dodgeInvuln=sc.dodgeInvuln; out.chargesLeft=sc.dodgeCharges;
      sc.sangsueOwned=true; sc.hp=500; const e=sc.enemies.getChildren().find(x=>x.active)||null; out.enemy=!!e;
      out.drone=typeof sc.droneSprites; out.droneFn=Object.getOwnPropertyNames(Object.getPrototypeOf(sc)).filter(n=>/drone|sangsue/i.test(n));
      return JSON.stringify(out)""")))
    print(errs[:3]); b.close()
