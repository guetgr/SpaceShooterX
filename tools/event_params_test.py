#!/usr/bin/env python3
"""Paramètres des événements (EVENT_DEFS) : équivalence avec le comportement d'origine.

  python3 tools/event_params_test.py            -> compare avec tools/event_params_snapshot.json
  python3 tools/event_params_test.py --write    -> (ré)écrit l'instantané (à ne faire QUE sur un code dont les valeurs sont voulues)

Pour chaque événement et chaque niveau d'alerte (1, 5, 10), Math.random et Phaser.Math.RND sont graînés, puis on relève :
dur(alerte) (deux tirages), tickMs(alerte), l'effet d'un appel à start(), de six appels à tick() et de end().
Les effets sont observés en remplaçant les méthodes de la scène (spawnGemAt, spawnMeteor, spawnOneEnemy, deployMine,
spawnGolden, strikeAt, addWell, bossShot, damagePlayer...) par des enregistreurs : nombre, ordre et valeurs numériques des appels.
Aucun événement n'utilise le drapeau « PV bas » (seul le poids de tirage w en dépend, non touché).
"""
import functools, http.server, json, os, sys, threading
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAP = os.path.join(R, 'tools', 'event_params_snapshot.json')
PHASER = os.path.join(R, 'vendor', 'phaser.min.js')
ALERTS = [1, 5, 10]

JS = """([alerts])=>{
  const sc = window.__game.scene.scenes.find(s=>s.startRun);
  sc.introT = 99999;
  const out = {};
  const seed = (n)=>{ let a = n>>>0; Math.random = ()=>{ a = (a + 0x6D2B79F5)>>>0; let t = a; t = Math.imul(t ^ t>>>15, t | 1); t ^= t + Math.imul(t ^ t>>>7, t | 61); return ((t ^ t>>>14)>>>0)/4294967296; }; };
  sc.visibleXRange = (m)=>({ min:-60 + (m||0), max:460 - (m||0) });
  sc.visibleYRange = (m)=>({ min:-40 + (m||0), max:740 - (m||0) });
  sc.hp = 1e9; sc.enemies.clear(true, true); sc.running = true;
  let curAlert = 1;
  Object.defineProperty(sc, 'alertLevel', { get: ()=> curAlert, set: ()=>{}, configurable: true });
  const scal = (o)=>{ const r = {}; Object.keys(o).forEach(k=>{ const v = o[k]; if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') r[k] = (typeof v === 'number') ? Math.round(v*1e6)/1e6 : v; }); return r; };
  const own = {};                                  // méthodes de la scène remplacées pendant la mesure
  let rec = [], fakes = [];
  const rep = (name, fn)=>{ if (!(name in own)) own[name] = Object.prototype.hasOwnProperty.call(sc, name) ? sc[name] : null; sc[name] = fn; };
  const recorder = (name, ret)=> rep(name, (...a)=>{ rec.push([name, ...a.map(x=> (x && typeof x === 'object') ? scal(x) : (typeof x === 'number' ? Math.round(x*1e6)/1e6 : x))]); return ret ? ret(...a) : undefined; });
  const restore = ()=>{ Object.keys(own).forEach(k=>{ if (own[k] === null) delete sc[k]; else sc[k] = own[k]; delete own[k]; }); };
  const names = ['spawnGemAt','spawnBgMeteor','spawnMeteor','deployMine','spawnGolden','strikeAt','bossShot','damagePlayer','explodeFx','startNebula','endNebula','flipVortex','startEclipse','endEclipse','spawnBonusBoss','startIce','tickIce','endIce','clearWells','killPlasma','endCorridor'];
  const kinds = Object.keys(EVENT_DEFS);
  for (const al of alerts){
    curAlert = al;
    for (const kind of kinds){
      const d = EVENT_DEFS[kind], slot = d.small ? 'curSmall' : 'curEvent', prev = sc[slot], prevWells = sc._wells, prevCorr = sc._corr;
      sc.player.x = 200; sc.player.y = 600; sc._wells = []; sc._corr = null; sc._meteorStyle = undefined;
      rec = []; fakes = [];
      names.forEach(n=> recorder(n));
      rep('spawnOneEnemy', (t, x)=>{ const e = { _t:t, x:x === undefined ? 0 : x, y:0, active:true, body:{ setVelocity(){} } }; fakes.push(e); rec.push(['spawnOneEnemy', t, x === undefined ? null : Math.round(x*1e6)/1e6]); return e; });
      rep('addWell', (o)=>{ rec.push(['addWell', scal(o)]); sc._wells.push({}); return {}; });
      const pend = [];
      seed(777 + al*13); Phaser.Math.RND.sow(['ev', kind, String(al)]);
      const r = {};
      r.dur = [d.dur(al, sc), d.dur(al, sc)];
      r.tickMs = d.tickMs ? d.tickMs(al, sc) : null;
      const ev = { kind, t:1e6, tick:0 }; sc[slot] = ev;
      const tm = sc.time, dc = tm.delayedCall, ae = tm.addEvent;
      tm.delayedCall = (ms, cb)=>{ rec.push(['delay', ms]); cb(); return { remove(){} }; };
      tm.addEvent = (cfg)=>{ rec.push(['addEvent', cfg.delay, !!cfg.loop]); pend.push(cfg.callback); return { remove(){} }; };
      const vx = sc.visibleXRange(0), vy = sc.visibleYRange(0);
      try {
        seed(4242 + al); Phaser.Math.RND.sow(['run', kind, String(al)]);
        if (d.start) d.start(sc);
        if (kind === 'emp') sc.empBlast(120, 100);
        if (kind === 'corridor' && sc._corr) { r.corr = scal(sc._corr); r.corr.clock = Math.round((sc._corr.clock - sc.elapsed)*1e6)/1e6; }
        if (kind === 'plasma' && sc._plasma) r.plasma0 = scal(sc._plasma);
        if (kind === 'frenzy') r.frenzy = Math.round((sc._frenzyUntil - sc.elapsed)*1e6)/1e6;
        if (kind === 'meteors') r.style = sc._meteorStyle;
        if (kind === 'emp') r.emp = Math.round((sc._empUntil - sc.elapsed)*1e6)/1e6;
        if (d.tick) for (let i=0;i<6;i++)d.tick(sc, vx, vy, ev);
        pend.forEach((cb, i)=>{ for (let k=0;k<40;k++){ if (kind === 'plasma' && sc._plasma) { sc.player.x = sc._plasma.img.x; sc.player.y = sc._plasma.img.y; } cb(); } });
        if (kind === 'plasma' && sc._plasma) r.plasma1 = scal(sc._plasma);
        if (d.end) d.end(sc);
      } catch (e){ r.error = String(e && e.message || e); }
      tm.delayedCall = dc; tm.addEvent = ae;
      r.rec = rec; r.fakes = fakes.map(f=> scal(f)); r.wells = sc._wells.length;
      restore();
      // nettoyage des états laissés par les vraies méthodes
      if (sc._empVeil){ sc._empVeil.destroy(); sc._empVeil = null; } sc._empOn = false; sc._empUntil = 0;
      if (sc._plasma){ try { sc._plasma.timer && sc._plasma.timer.remove && sc._plasma.timer.remove(); } catch (e){} try { sc._plasma.img.destroy(); sc._plasma.core.destroy(); } catch (e){} sc._plasma = null; }
      sc[slot] = prev; sc._wells = prevWells; sc._corr = prevCorr; sc._frenzyUntil = 0; sc._meteorStyle = undefined;
      out[al + ':' + kind] = r;
    }
  }
  Object.defineProperty(sc, 'alertLevel', { value:curAlert, writable:true, configurable:true, enumerable:true });
  return JSON.stringify(out);
}"""

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def main():
    write = '--write' in sys.argv
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=R))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    errs = []
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required'])
        except Exception: b = pw.chromium.launch(args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        p = b.new_page(viewport={'width': 420, 'height': 760})
        p.on('pageerror', lambda e: errs.append('p:' + str(e)))
        p.route('**/phaser.min.js', lambda r: r.fulfill(path=PHASER) if os.path.exists(PHASER) else r.continue_())
        p.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
        p.goto('http://127.0.0.1:%d/index.html?dev&sandbox' % srv.server_address[1])
        p.wait_for_selector('#btnStart', state='attached', timeout=60000)
        p.wait_for_function('window.__game && window.__game.scene.scenes.some(s=>s.startRun && s.sys.settings.status >= 5)', timeout=60000)
        p.wait_for_timeout(1500)
        p.evaluate("document.getElementById('btnStart').click()"); p.wait_for_timeout(2500)
        base = json.loads(p.evaluate(JS, [ALERTS]))
        assert not [k for k, v in base.items() if 'error' in v], [(k, v['error']) for k, v in base.items() if 'error' in v]
        if write:
            json.dump(base, open(SNAP, 'w'), indent=1, sort_keys=True); open(SNAP, 'a').write('\n')
            print('instantané écrit :', len(base), 'entrées'); b.close(); srv.shutdown(); return
        ref = json.load(open(SNAP))
        bad = [k for k in sorted(set(ref) | set(base)) if ref.get(k) != base.get(k)]
        assert not bad, 'DÉRIVE des événements :\n  ' + '\n  '.join('%s\n    avant %s\n    après %s' % (k, json.dumps(ref.get(k))[:600], json.dumps(base.get(k))[:600]) for k in bad[:6])
        print('OK équivalence : %d événements x %d niveaux d\'alerte identiques à l\'instantané' % (len(ref) // len(ALERTS), len(ALERTS)))
        b.close()
    srv.shutdown()
    assert not errs, errs

main()
