#!/usr/bin/env python3
"""Réglages internes des boss / mobs spéciaux (src/data/tunables.js, lvDef.bossTune).

  python3 tools/tunables_test.py            -> compare avec tools/tunables_snapshot.json et teste la surcharge
  python3 tools/tunables_test.py --write    -> (ré)écrit l'instantané (à ne faire QUE sur un code dont les valeurs sont voulues)

L'instantané contient TOUS les nombres de chaque constante (AR, MT, RX, AN, PD, BRAS, PIL, EC, TUTO_TUNE.boss), à plat
(« count.beam.2 »), pour prouver qu'aucune valeur ne bouge, enregistrée ou non.
"""
import functools, http.server, json, os, sys, threading
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAP = os.path.join(R, 'tools', 'tunables_snapshot.json')
PHASER = os.path.join(R, 'vendor', 'phaser.min.js')

DUMP = """()=>{
  const w2 = id=>{ const { hp, thresh, dmg, killScore } = BOSS_W2[id]; return { hp, thresh, dmg, killScore }; };      // boss du secteur 2 : les nombres réglables (pas la géométrie des pièces)
  const roots = { ar:AR, mt:MT, rx:RX, an:AN, pd:PD, cb:w2('crabe'), ic:w2('incinerateur'), bn:w2('benne'), by:w2('broyeur'), rp:w2('reparateur'), bras:BRAS, pil:PIL, ec:EC, antenne:TUTO_TUNE.boss };
  const out = {};
  const walk = (v, p)=>{
    if (typeof v === 'number') out[p] = v;
    else if (Array.isArray(v)) v.forEach((x,i)=> walk(x, p + '.' + i));
    else if (v && typeof v === 'object') Object.keys(v).forEach(k=> walk(v[k], p ? p + '.' + k : k));
  };
  Object.keys(roots).forEach(id=> walk(roots[id], id));
  return JSON.stringify(out);
}"""
REG = "()=> JSON.stringify(typeof TUNABLES === 'undefined' ? null : TUNABLES)"

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def open_page(pw_browser, srv, patch=None, errs=None):
    p = pw_browser.new_page(viewport={'width': 420, 'height': 760})
    p.on('pageerror', lambda e: errs.append(str(e)))
    if patch: p.route('**/src/data/levels/w1-l2.json', patch)
    p.route('**/phaser.min.js', lambda r: r.fulfill(path=PHASER) if os.path.exists(PHASER) else r.continue_())
    p.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    p.goto('http://127.0.0.1:%d/index.html?dev&sandbox' % srv.server_address[1])
    p.wait_for_selector('#btnStart', state='attached', timeout=60000)
    p.wait_for_function('window.__game && window.__game.scene.scenes.some(s=>s.startRun && s.sys.settings.status >= 5)', timeout=60000)
    p.wait_for_timeout(1500)
    return p

def main():
    write = '--write' in sys.argv
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=R))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    errs = []
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required'])
        except Exception: b = pw.chromium.launch(args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        p = open_page(b, srv, errs=errs)
        base = json.loads(p.evaluate(DUMP))
        if write:
            json.dump(base, open(SNAP, 'w'), indent=1, sort_keys=True); open(SNAP, 'a').write('\n')
            print('instantané écrit :', len(base), 'nombres'); b.close(); srv.shutdown(); return
        ref = json.load(open(SNAP))
        reg = json.loads(p.evaluate(REG)); assert reg, 'TUNABLES absent'
        # (1) équivalence : au chargement, puis après tunablesApply(null) (ré-initialisation sans surcharge)
        def check(label, cur):
            bad = ['%s : %s -> %s' % (k, ref.get(k), cur.get(k)) for k in sorted(set(ref) | set(cur)) if ref.get(k) != cur.get(k)]
            assert not bad, 'DÉRIVE (%s) :\n  ' % label + '\n  '.join(bad[:15])
        check('chargement', base)
        p.evaluate('()=>{ tunablesApply(null); return 0 }')
        check('après tunablesApply(null)', json.loads(p.evaluate(DUMP)))
        paths = 0
        for tid, rows in reg.items():
            for r in rows:
                key = tid + '.' + r['path']
                hit = [k for k in ref if k == key or k.startswith(key + '.')]
                assert hit, 'chemin enregistré absent de l\'instantané : ' + key
                assert r['min'] < r['max'] and r['step'] > 0 and r['label'], key
                if 'len' in r: assert len(hit) == r['len'], (key, len(hit), r['len'])
                else: assert hit == [key], ('scalaire attendu', key, hit)
                for k in hit: assert r['min'] <= ref[k] <= r['max'], ('valeur d\'origine hors bornes', k, ref[k])
                paths += 1
        print('OK équivalence : %d nombres identiques à l\'instantané, %d chemins enregistrés (%s)' % (len(ref), paths, ', '.join('%s:%d' % (t, len(r)) for t, r in reg.items())))
        # (2) surcharge par le vrai chemin JSON -> lvDef
        def patch(route):
            doc = json.loads(route.fetch().text()); doc['bossTune'] = {'ar': {'hp': 2000, 'dmg.missile': 20, 'gap': [300, 250, 200, 100]}}
            route.fulfill(status=200, content_type='application/json', body=json.dumps(doc))
        p2 = open_page(b, srv, patch, errs)
        assert p2.evaluate("levelById('w1-l2').bossTune.ar.hp") == 2000, 'bossTune du JSON absent de lvDef'
        assert p2.evaluate("AR.hp") == 1000, 'surcharge appliquée avant le début de la mission'
        go = """async ([lv])=>{
          const sc = window.__ssxScene;
          sc.scene.restart(lv ? { autoStart:true, levelId:lv } : { autoStart:true });
          await new Promise(r=> setTimeout(r, 2000));
          const s2 = window.__ssxScene;
          let boss = null;
          if (lv === 'w1-l2'){ s2.introT = 99999; s2.arStart(); await new Promise(r=> setTimeout(r, 300)); boss = s2.ar ? s2.ar.max : null; }
          return JSON.stringify({ hp: AR.hp, dmg: AR.dmg.missile, gap: AR.gap.slice(), burst: AR.dmg.beam, mt: MT.hp, boss, lv: s2.lvDef ? s2.lvDef.id : null });
        }"""
        r = json.loads(p2.evaluate(go, ['w1-l2']))
        print('run w1-l2 :', r)
        assert r['lv'] == 'w1-l2' and r['hp'] == 2000 and r['dmg'] == 20 and r['gap'] == [300, 250, 200, 100], r
        assert r['burst'] == ref['ar.dmg.beam'] and r['mt'] == ref['mt.hp'], 'valeur non visée modifiée'
        assert r['boss'] == 2000, ('PV du boss lancé', r['boss'])
        print('OK surcharge : JSON -> lvDef -> AR.hp=2000, dmg.missile=20, gap ; boss lancé à 2000 PV ; autres valeurs et boss intacts')
        # (3) pas de fuite : mission suivante sans bossTune (w1-l1 non modifié, puis partie sans niveau)
        for lv in ['w1-l1', None]:
            r = json.loads(p2.evaluate(go, [lv]))
            assert r['hp'] == ref['ar.hp'] and r['dmg'] == ref['ar.dmg.missile'] and r['gap'] == [ref['ar.gap.%d' % i] for i in range(4)], ('fuite', lv, r)
        check('après les runs', json.loads(p2.evaluate(DUMP)))
        print('OK pas de fuite : après un run surchargé, w1-l1 puis une partie sans niveau restaurent toutes les valeurs')
        b.close()
    srv.shutdown()
    assert not errs, errs

main()
