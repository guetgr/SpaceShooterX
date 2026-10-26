#!/usr/bin/env python3
"""Test headless des niveaux des mondes : victoire par type d'objectif (survie, kills, cristaux, boss), défaite, déblocages, sauvegarde.

  python tools/level_test.py          (sert le dossier du projet SANS ?dev, pour tester les vrais déblocages ; prérequis : pip install playwright)
Les objectifs sont raccourcis par le test (goal.seconds = 3, etc.) ; le moteur de jeu tourne pour de vrai.
"""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHASER = os.path.join(R, 'vendor', 'phaser.min.js')


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=R))
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = 'http://127.0.0.1:%d/index.html' % srv.server_address[1]

errs, fails = [], []
def check(cond, msg):
    print(('  ok     ' if cond else '  ECHEC  ') + msg)
    if not cond: fails.append(msg)

SC = "window.__ssxScene"
with sync_playwright() as pw:
    try:
        b = pw.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required'])
    except Exception:
        b = pw.chromium.launch(args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    p = b.new_page(viewport={'width': 420, 'height': 760})
    p.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    p.on('console', lambda m: errs.append('console.error: ' + m.text) if m.type == 'error' and 'favicon' not in m.text else None)
    p.route('**/phaser.min.js', lambda r: r.fulfill(path=PHASER) if os.path.exists(PHASER) else r.continue_())
    p.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    p.goto(url)
    p.wait_for_selector('#btnStart', state='attached', timeout=60000)      # l'ancien menu est masqué : l'accueil (#home) le remplace
    p.wait_for_function('window.__ssxScene && typeof levelById === "function"', timeout=60000)      # le chargement des scripts peut être long
    p.wait_for_timeout(1000)
    p.evaluate("localStorage.removeItem('ssx_worlds_v1')")

    def start(level_id, setup=''):
        p.evaluate("(()=>{ %s; %s.scene.restart({ autoStart:true, levelId:'%s' }); })()" % (setup, 'window.__ssxScene', level_id))
        p.wait_for_timeout(1200)
        p.evaluate("(()=>{ const sc = %s; sc.introT = 99999; })()" % SC)
        p.wait_for_timeout(800)

    def go_visible(): return p.evaluate("!document.getElementById('gameover').classList.contains('hidden')")
    def title(): return p.evaluate("document.querySelector('#gameover .go-title').textContent")
    def vis(sel): return p.evaluate("!document.querySelector('%s').classList.contains('hidden')" % sel)
    def shot(name):
        p.wait_for_timeout(900)      # fin du fondu
        d = os.environ.get('SHOT_DIR')
        if d: p.screenshot(path=os.path.join(d, name + '.png'))
    def prog(): return p.evaluate("JSON.stringify(getWorldProgress().levels)")

    print('apparence en jeu')
    p.evaluate("setShipSkin('ember')")
    start('w1-l2')
    check(p.evaluate("%s.player.isTinted && %s.player.tintTopLeft" % (SC, SC)) == 0xffa07c, 'la camionnette porte la teinte BRAISE en niveau')
    p.evaluate("(()=>{ const sc = %s; sc.hp = sc.stats.maxHp*0.4; sc.updateShipDamage(16); })()" % SC)
    check(p.evaluate("%s.player.tintTopLeft" % SC) != 0xffa07c, 'les dégâts re-teintent la camionnette (par-dessus la teinte)')
    p.evaluate("(()=>{ const sc = %s; sc.hp = sc.stats.maxHp; sc.updateShipDamage(16); })()" % SC)
    check(p.evaluate("%s.player.tintTopLeft" % SC) == 0xffa07c, 'soignée : la teinte de l\'apparence revient')
    p.evaluate("setShipSkin('base')")

    print('survie (w1-l1)')
    start('w1-l1', "levelById('w1-l1').goal.seconds = 3")
    check(p.evaluate("%s.lvDef.id" % SC) == 'w1-l1', 'le niveau est chargé')
    check(p.evaluate("%s.alertLevel" % SC) == 1, 'menace = celle du niveau')
    p.wait_for_timeout(5500)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire par survie -> écran de fin')
    check(vis('#btnNext') and vis('#btnRetry') and vis('#btnGoMenu'), 'victoire : boutons SUIVANT, REJOUER, ACCUEIL')
    check(not vis('#home'), "l'arbre de compétences (page de l'accueil) ne s'ouvre pas tout seul : l'accueil reste fermé")
    check('ORBITE TERRESTRE' in p.evaluate("document.getElementById('goLevel').textContent"), 'le niveau est affiché')
    check(p.evaluate("document.querySelectorAll('#goRewards .uii').length") >= 3, 'détail des récompenses')
    shot('victoire')
    check('w1-l1' in prog() and 'w1-l2' not in prog(), 'victoire enregistrée')
    check(p.evaluate("isLevelUnlocked('w1-l2')"), 'niveau 2 débloqué')
    f1 = p.evaluate("getMeta().fragments"); check(f1 >= 60, 'fragments + bonus de première victoire (%s)' % f1)

    print('rejeu : pas de nouveau bonus de 1re victoire')
    start('w1-l1', "levelById('w1-l1').goal.seconds = 3")
    p.wait_for_timeout(5500)
    f2 = p.evaluate("getMeta().fragments"); check(0 < f2 - f1 < 60, 'rejeu : bonus réduit (+%s)' % (f2 - f1))

    print('kills (w1-l4)')
    start('w1-l4', "levelById('w1-l4').goal.count = 5")
    p.evaluate("(()=>{ %s.runKills = 5; })()" % SC); p.wait_for_timeout(3800)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire par kills')

    print('cristaux (w1-l3)')
    start('w1-l3', "levelById('w1-l3').goal.gems = 4")
    p.evaluate("(()=>{ %s.lvGems = 4; })()" % SC); p.wait_for_timeout(3800)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire par cristaux')

    print('défaite (w1-l2) : fragments conservés, pas de victoire enregistrée')
    start('w1-l2')
    fa = p.evaluate("getMeta().fragments")
    p.evaluate("(()=>{ const sc = %s; sc.score = 300; sc.hp = 1; sc.hitCooldown = 0; sc.dodgeInvuln = 0; sc.shield = 0; sc.phoenixCharges = 0; sc.damagePlayer(9999); })()" % SC)
    p.wait_for_timeout(2800)
    check(go_visible() and title() == 'ACCIDENT DU TRAVAIL', 'défaite -> écran de fin')
    check(not vis('#btnNext') and vis('#btnRetry') and not vis('#home'), 'défaite : REJOUER seul (pas de SUIVANT), pas d\'arbre')
    shot('defaite')
    check('w1-l2' not in prog(), 'défaite non enregistrée comme victoire')
    check(p.evaluate("getMeta().fragments") > fa, 'fragments gagnés conservés')

    print('boss (w1-l5)')
    start('w1-l5')
    p.wait_for_timeout(2500)
    check(p.evaluate("%s.bossActive" % SC), 'le boss arrive')
    p.evaluate("(()=>{ const sc = %s; const b = sc.currentBoss; sc.applyDamageToEnemy(b, b.maxHp*10); if (b.active && b.hp <= 0) sc.killEnemy(b); })()" % SC)
    p.wait_for_timeout(5000)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire en tuant le boss')
    check(p.evaluate("worldSummary('w1').bossDown"), 'boss du monde enregistré')
    check(vis('#btnNext') and p.evaluate("%s.lvResult.next" % SC) == 'w2-l1', 'boss du monde 1 : SUIVANT mène au monde 2')
    check('NOUVEAU SECTEUR' in p.evaluate("document.getElementById('goRewards').textContent"), 'annonce du monde débloqué')
    p.evaluate("document.getElementById('btnGoMenu').click()"); p.wait_for_timeout(400)
    p.wait_for_timeout(600)
    check(p.evaluate("%s.scene.isActive('home') && !document.getElementById('home').classList.contains('hidden')" % SC) and not go_visible(), "ACCUEIL ramène à l'accueil")
    check(p.evaluate("document.body.classList.contains('at-home')"), "le HUD de jeu est masqué à l'accueil")
    p.evaluate("document.getElementById('btnLaunch').click()"); p.wait_for_timeout(2500)
    check(p.evaluate("%s.lvDef && %s.lvDef.id" % (SC, SC)) is not None and not p.evaluate("document.body.classList.contains('at-home')"), 'DECOLLER lance le niveau choisi')
    check(p.evaluate("!document.getElementById('home') || document.getElementById('home').classList.contains('hidden')"), "l'accueil disparaît pendant le niveau")
    p.evaluate("document.getElementById('pauseBtn').click()"); p.wait_for_timeout(300)
    p.evaluate("document.getElementById('btnQuit').click(); document.getElementById('btnQuitYes').click()"); p.wait_for_timeout(900)
    check(go_visible() and title() == 'ORDRE ANNULE', 'QUITTER = niveau abandonné (écran de résultat)')

    print('partie infinie historique')
    p.evaluate("(()=>{ %s.scene.restart({ autoStart:true }); })()" % SC)
    p.wait_for_timeout(1500)
    check(p.evaluate("%s.lvDef" % SC) is None, 'DEMARRER = ancien mode (sans niveau)')
    b.close()
srv.shutdown()

if errs:
    print('ERREURS JS (%d):' % len(errs))
    for e in errs[:20]: print('  ', e[:300])
if fails or errs:
    sys.exit(1)
print('OK : niveaux')
