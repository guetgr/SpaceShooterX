#!/usr/bin/env python3
"""Équivalence des stats des mobs (registre src/data/enemy-stats.js) + surcharge par niveau.

  python3 tools/enemy_stats_test.py            -> compare avec tools/enemy_stats_snapshot.json et teste lvDef.mobs
  python3 tools/enemy_stats_test.py --write    -> (ré)écrit l'instantané (à ne faire QUE sur un code dont les valeurs sont voulues)

Pour chaque type, spawnOneEnemy est appelé avec Math.random et Phaser.Math.RND graînés, à plusieurs niveaux d'alerte :
toutes les propriétés scalaires de l'ennemi sont relevées (PV, bouclier, vitesses, score, dégâts, minuteurs...).
"""
import functools, http.server, json, os, sys, threading
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAP = os.path.join(R, 'tools', 'enemy_stats_snapshot.json')
PHASER = os.path.join(R, 'vendor', 'phaser.min.js')
TYPES = ['grunt','shooter','drone','tank','swarmer','diver','turret','splitter','splitterMini','shieldedGrunt','mine','sat','satgun','bras','pilleur','eclaireur','bomber','sniper','healer','ghost','elite','mothership','vortex','golden','kamikaze','spider','charo']
ALERTS = [1, 3, 6, 9]

JS = """async ([types, alerts, mobs, useLevel])=>{
  const sc = window.__game.scene.scenes.find(s=>s.startRun);
  sc.introT = 99999;
  const out = {};
  const seed = (n)=>{ let a = n>>>0; Math.random = ()=>{ a = (a + 0x6D2B79F5)>>>0; let t = a; t = Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14)>>>0)/4294967296; }; };
  sc.visibleXRange = (m)=>({ min:-60 + (m||0), max:460 - (m||0) });       // zone visible figée (la caméra bouge pendant l'intro)
  sc.visibleYRange = (m)=>({ min:-40 + (m||0), max:740 - (m||0) });
  if (useLevel){ sc.lvDef = Object.assign({}, levelById(useLevel), { finalBoss:null, boss:null, spawns:[], waves:[], events:[] }); }   // copie sans boss ni vagues : la scène de test tourne pendant les attentes              // vrai chemin : JSON de mission -> LEVEL_FILES -> monde -> lvDef
  else { sc.lvDef = Object.assign({}, sc.lvDef || {}); if (mobs) sc.lvDef.mobs = mobs; else delete sc.lvDef.mobs; }
  sc.spawnEnemy = ()=>{}; sc.hp = 1e9; sc.enemies.clear(true, true);                              // pas d'ennemi naturel parasite pendant les attentes
  let curAlert = 1;                                           // le jeu recalcule palier et alerte pendant les attentes : on les fige
  Object.defineProperty(sc, 'difficultyTier', { get: ()=> 2, set: ()=>{}, configurable: true });
  Object.defineProperty(sc, 'alertLevel', { get: ()=> curAlert, set: ()=>{}, configurable: true });
  sc.level = 3; sc.player.x = 200; sc.player.y = 600;
  for (const al of alerts){
    curAlert = al;
    for (const t of types){
      sc.player.x = 200; sc.player.y = 600;
      seed(1234 + al*7); Phaser.Math.RND.sow(['espace', String(al)]);
      const e = sc.spawnOneEnemy(t, undefined);
      const r = {};
      if (e){
        for (const k of Object.keys(e)){ const v = e[k]; if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') r[k] = v; }
        r.vx = e.body.velocity.x; r.vy = e.body.velocity.y;
        e.destroy();
      } else r.none = true;
      out[al + ':' + t] = r;
    }
    // apparitions secondaires : mine larguée (deployMine) et minis d'un splitter tué (damage.js)
    seed(99 + al); Phaser.Math.RND.sow(['mine', String(al)]);
    const before = new Set(sc.enemies.getChildren());
    sc.deployMine(200, 100);
    sc.enemies.getChildren().filter(c=> !before.has(c) && c.enemyType === 'mineDeployed').forEach(c=>{ out[al + ':mineDeployed'] = { hp:c.hp, maxHp:c.maxHp, vy:c.body.velocity.y, scoreValue:c.scoreValue, contactDamage:c.contactDamage }; c.destroy(); });
    seed(55 + al);
    const sp = sc.spawnOneEnemy('splitter', undefined); sc.bossActive = false; sp.shieldHp = 0; sp._gShield = false; sp._aShield = false; sc.killEnemy(sp); if (sp.active) sp.destroy();
    await new Promise(r=> setTimeout(r, 250));
    const minis = sc.enemies.getChildren().filter(c=> c.enemyType === 'splitterMini');
    minis.forEach((c,i)=>{ out[al + ':splitterMini#' + i] = { hp:c.hp, maxHp:c.maxHp, vy:c.body.velocity.y, scoreValue:c.scoreValue, contactDamage:c.contactDamage }; c.destroy(); });
  }
  Object.defineProperty(sc, 'difficultyTier', { value:2, writable:true, configurable:true, enumerable:true });
  Object.defineProperty(sc, 'alertLevel', { value:curAlert, writable:true, configurable:true, enumerable:true });
  return JSON.stringify(out);
}"""

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def run(page, mobs=None, types=TYPES, alerts=ALERTS, level=None):
    return json.loads(page.evaluate(JS, [types, alerts, mobs, level]))

def main():
    write = '--write' in sys.argv
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=R))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    errs = []
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required'])
        except Exception: b = pw.chromium.launch(args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        p = b.new_page(viewport={'width': 420, 'height': 760})
        p.on('pageerror', lambda e: errs.append('p:' + str(e) + str(getattr(e,'stack',''))[:600]))
        p.route('**/phaser.min.js', lambda r: r.fulfill(path=PHASER) if os.path.exists(PHASER) else r.continue_())
        p.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        p.goto('http://127.0.0.1:%d/index.html?dev&sandbox' % srv.server_address[1])
        p.wait_for_selector('#btnStart', state='attached', timeout=60000)
        p.wait_for_function('window.__game && window.__game.scene.scenes.some(s=>s.startRun && s.sys.settings.status >= 5)', timeout=60000)
        p.wait_for_timeout(1500)
        p.evaluate("document.getElementById('btnStart').click()"); p.wait_for_timeout(2500)
        base = run(p)
        if write:
            json.dump(base, open(SNAP, 'w'), indent=1, sort_keys=True); open(SNAP, 'a').write('\n')
            print('instantané écrit :', len(base), 'entrées'); b.close(); srv.shutdown(); return
        ref = json.load(open(SNAP))
        bad = []
        for k in sorted(set(ref) | set(base)):
            if ref.get(k) != base.get(k):
                a, c = ref.get(k) or {}, base.get(k) or {}
                diff = {f: (a.get(f), c.get(f)) for f in set(a) | set(c) if a.get(f) != c.get(f)}
                bad.append('%s %s' % (k, diff))
        assert not bad, 'DÉRIVE des stats :\n  ' + '\n  '.join(bad[:15])
        print('OK équivalence : %d types x %d niveaux d\'alerte identiques à l\'instantané' % (len(TYPES), len(ALERTS)))
        # surcharge : seul le type visé change
        mod = run(p, {'grunt': {'hpMul': 2, 'dmgMul': 3, 'speedMul': 0.5, 'scoreMul': 4}})
        for k, v in mod.items():
            t = k.split(':')[1]
            if t != 'grunt': assert v == base[k], 'type non visé modifié : ' + k
            else:
                g = base[k]
                assert v['maxHp'] == g['maxHp'] * 2 and v['hp'] == g['hp'] * 2, k
                assert v['contactDamage'] == g['contactDamage'] * 3, k
                assert v['scoreValue'] == g['scoreValue'] * 4, k
                assert abs(v['vy'] - g['vy'] * 0.5) < 1e-9, (k, v['vy'], g['vy'])
        part = run(p, {'grunt': {'hpMul': 2}})
        for k, v in part.items():
            t = k.split(':')[1]
            if t == 'grunt':
                g = base[k]; assert v['maxHp'] == g['maxHp'] * 2 and v['contactDamage'] == g['contactDamage'] and v['vy'] == g['vy'] and v['scoreValue'] == g['scoreValue'], k
            else: assert v == base[k], k
        print('OK surcharge : grunt hpMul/dmgMul/speedMul/scoreMul appliqués, autres types et champs intacts')
        # mini et mine larguée suivent aussi la surcharge
        for al in ALERTS:
            assert mod.get('%d:splitterMini#0' % al) == base.get('%d:splitterMini#0' % al)
        sm = run(p, {'splitterMini': {'hpMul': 2, 'scoreMul': 3}, 'mineDeployed': {'dmgMul': 2}})
        for al in ALERTS:
            a, c = base['%d:splitterMini#0' % al], sm['%d:splitterMini#0' % al]
            assert c['maxHp'] == a['maxHp'] * 2 and c['scoreValue'] == a['scoreValue'] * 3 and c['contactDamage'] == a['contactDamage'], al
            assert sm['%d:mineDeployed' % al]['contactDamage'] == base['%d:mineDeployed' % al]['contactDamage'] * 2
        print('OK surcharge : splitterMini et mineDeployed')
        # vrai chemin : un `mobs` dans le JSON de mission (requête interceptée) arrive dans lvDef et agit sur l'apparition
        p2 = b.new_page(viewport={'width': 420, 'height': 760})
        p2.on('pageerror', lambda e: errs.append(str(e)))
        def patch(route):
            doc = json.loads(route.fetch().text()); doc['mobs'] = {'grunt': {'hpMul': 2}}
            route.fulfill(status=200, content_type='application/json', body=json.dumps(doc))
        p2.route('**/src/data/levels/w1-l1.json', patch)
        p2.route('**/phaser.min.js', lambda r: r.fulfill(path=PHASER) if os.path.exists(PHASER) else r.continue_())
        p2.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        p2.goto('http://127.0.0.1:%d/index.html?dev&sandbox' % srv.server_address[1])
        p2.wait_for_selector('#btnStart', state='attached', timeout=60000)
        p2.wait_for_function('window.__game && window.__game.scene.scenes.some(s=>s.startRun && s.sys.settings.status >= 5)', timeout=60000)
        p2.wait_for_timeout(1500)
        p2.evaluate("document.getElementById('btnStart').click()"); p2.wait_for_timeout(2500)
        assert p2.evaluate("levelById('w1-l1').mobs && levelById('w1-l1').mobs.grunt.hpMul") == 2, 'mobs du JSON absent de lvDef'
        real = run(p2, level='w1-l1', types=['grunt', 'shooter'], alerts=[1])
        assert real['1:grunt']['maxHp'] == base['1:grunt']['maxHp'] * 2 and real['1:shooter']['maxHp'] == base['1:shooter']['maxHp'], 'surcharge JSON non appliquée'
        print('OK chemin réel : mobs du JSON de mission -> lvDef -> maxHp doublé')
        b.close()
    srv.shutdown()
    assert not errs, errs

main()
