#!/usr/bin/env python3
"""Test headless des niveaux des mondes : victoire par type d'objectif (survie, kills, cristaux, boss), défaite, déblocages, sauvegarde.

  python tools/level_test.py          (sert le dossier du projet SANS ?dev, pour tester les vrais déblocages ; prérequis : pip install playwright)
Les objectifs sont raccourcis par le test (goal.seconds = 3, etc.) ; le moteur de jeu tourne pour de vrai.
"""
import functools, http.server, json, os, sys, threading
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
    p.on('pageerror', lambda e: errs.append('pageerror: ' + str(e) + ' | ' + str(getattr(e, 'stack', ''))[:400]))
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
    def bank(): return json.loads(p.evaluate("JSON.stringify(%s.lvResult && %s.lvResult.bank || null)" % (SC, SC))) or {}

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
    f0 = p.evaluate("getMeta().fragments")
    check(p.evaluate("typeof LEVEL_FRAG_MUL") == 'undefined', 'ancien calcul (score -> fragments) retiré')
    start('w1-l1', "levelById('w1-l1').goal.seconds = 3; levelById('w1-l1').finalBoss = null")       # le boss de fin est testé à part plus bas
    check(p.evaluate("%s.lvDef.id" % SC) == 'w1-l1', 'le niveau est chargé')
    check(p.evaluate("%s.alertLevel" % SC) == 1, 'menace = celle du niveau')
    print('composants en mission')
    check(p.evaluate("%s.runComposants" % SC) == 0 and p.evaluate("%s.comps.getLength()" % SC) == 0, 'composants : compteur à 0 au départ')
    n = p.evaluate("(()=>{ const sc = %s; const e = sc.spawnOneEnemy('tank', 200); sc.killEnemy(e); return sc.comps.getLength(); })()" % SC)
    check(n >= 3, 'un ennemi lourd lâche 3 composants (%s)' % n)
    check(p.evaluate("%s.comps.getChildren().every(c=> c.depth === 3)" % SC), 'composants sous les tirs ennemis (profondeur 3)')
    p.evaluate("(()=>{ const sc = %s; sc.spawnComposantAt(sc.player.x, sc.player.y, 'compL', 0); return 0; })()" % SC); p.wait_for_timeout(400)
    check(p.evaluate("%s.runComposants" % SC) >= 5, 'ramassage : +5 pour un gros composant')
    check(p.evaluate("document.getElementById('compVal').textContent") == str(p.evaluate("%s.runComposants" % SC)), 'compteur du HUD = composants ramassés')
    check(p.evaluate("(()=>{ const sc = %s; const k = sc.comps.getLength(); sc.tuto = 1; sc.composantDrop({ enemyType:'tank', x:200, y:200 }); sc.tuto = 0; return sc.comps.getLength() - k; })()" % SC) == 0, 'tutoriel : aucun composant')
    c0 = p.evaluate("(()=>{ const sc = %s; sc.stats.magnetRadius = 60; for (let i=0;i<10;i++) sc.spawnComposantAt(20, sc.player.y - 300, 'compS', 0); return sc.runComposants; })()" % SC)
    p.wait_for_timeout(5500)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire par survie -> écran de fin')
    check(p.evaluate("%s.runComposants" % SC) - c0 >= 10, "victoire : les composants restés à l'écran sont aspirés vers la camionnette")
    check(vis('#btnNext') and vis('#btnRetry') and vis('#btnGoMenu'), 'victoire : boutons SUIVANT, REJOUER, ACCUEIL')
    check(not vis('#home'), "l'arbre de compétences (page de l'accueil) ne s'ouvre pas tout seul : l'accueil reste fermé")
    check('ORBITE TERRESTRE' in p.evaluate("document.getElementById('goLevel').textContent"), 'le niveau est affiché')
    check(p.evaluate("document.querySelectorAll('#goRewards .uii').length") >= 3, 'détail des récompenses')
    shot('victoire')
    check('w1-l1' in prog() and 'w1-l2' not in prog(), 'victoire enregistrée')
    check(p.evaluate("isLevelUnlocked('w1-l2')"), 'niveau 2 débloqué')
    f1 = p.evaluate("getMeta().fragments"); bk = bank()
    check(bk.get('prime') == 30 and f1 - f0 == bk.get('total'), '1re victoire : composants + prime AGP de 30 (%s, +%s)' % (bk, f1 - f0))

    print('rejeu : pas de nouveau bonus de 1re victoire')
    start('w1-l1', "levelById('w1-l1').goal.seconds = 3; levelById('w1-l1').finalBoss = null")       # le boss de fin est testé à part plus bas
    check(p.evaluate("%s.runComposants" % SC) == 0, 'rejeu : le compteur repart de 0')
    p.wait_for_timeout(5500)
    f2 = p.evaluate("getMeta().fragments"); bk = bank()
    check(bk.get('prime') == 10 and f2 - f1 == bk.get('total'), 'rejeu : prime réduite à 10 (%s, +%s)' % (bk, f2 - f1))

    print('kills (w1-l4)')
    start('w1-l4', "levelById('w1-l4').goal.count = 5; levelById('w1-l4').finalBoss = null")       # le boss de fin est testé à part plus bas
    p.evaluate("(()=>{ %s.runKills = 5; })()" % SC); p.wait_for_timeout(3800)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire par kills')

    print('boss de fin (w1-l4, Anneau)')
    start('w1-l4', "levelById('w1-l4').goal.count = 3; levelById('w1-l4').finalBoss = 'anneau'")
    p.evaluate("(()=>{ %s.runKills = 3; })()" % SC); p.wait_for_timeout(3500)
    check(p.evaluate("!!%s.an" % SC), "L'Anneau arrive quand les kills sont faits")
    check(not go_visible(), 'pas de victoire tant que le boss est en vie')
    p.wait_for_timeout(2500)
    p.evaluate("(()=>{ const sc = %s; sc.dodgeInvuln = 1e9; sc.anStartAtk('bays'); })()" % SC); p.wait_for_timeout(2500)       # le joueur est invulnérable (délai de coup) : on teste le boss, pas l'esquive
    check(p.evaluate("%s.enemies.getChildren().some(e=> e.active && e.enemyType === 'eclaireur')" % SC), 'les baies lâchent des Éclaireurs')
    p.evaluate("(()=>{ const sc = %s; sc.anStartAtk('turrets'); })()" % SC); p.wait_for_timeout(3000)
    p.evaluate("(()=>{ const sc = %s; sc.anStartAtk('spokes'); })()" % SC); p.wait_for_timeout(4500)
    p.evaluate("(()=>{ %s.anDamage(200, 200, 600, true); })()" % SC); p.wait_for_timeout(1500)
    check(p.evaluate("%s.an.st >= 2" % SC), "L'Anneau s'abîme (états d'usure)")
    k0 = p.evaluate("(()=>{ const sc = %s; sc.comps.clear(true, true); return sc.runComposants; })()" % SC)       # on ne mesure que la pluie du boss
    p.evaluate("(()=>{ %s.anDamage(200, 200, 1e9, true); })()" % SC); p.wait_for_function("window.__ssxScene.an && window.__ssxScene.an.dead", timeout=10000); p.wait_for_timeout(200)
    check(p.evaluate("%s.runComposants + %s.composantsOnScreenValue()" % (SC, SC)) - k0 >= 20, 'mini-boss (Anneau) : pluie de composants (4 gros)')
    p.wait_for_timeout(7000)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', "victoire à la mort de L'Anneau")
    p.evaluate("(()=>{ %s.dodgeInvuln = 0; })()" % SC)
    print("mob Éclaireur (w1-l4) : verrouillage et tirs qui visent le joueur")
    start('w1-l4', "levelById('w1-l4').goal.count = 999; levelById('w1-l4').finalBoss = null")
    p.evaluate("(()=>{ const sc = %s; sc.enemies.clear(true, true); sc.enemyBullets.clear(true, true); sc.player.x = 200; const e = sc.spawnOneEnemy('eclaireur', 200); window.__ec = e; e.y = sc.visibleYRange(0).min + 40; e.stopY = e.y + 60; e.hp = e.maxHp = 1e7; })()" % SC); p.wait_for_timeout(6000)
    check(p.evaluate("!!(window.__ec && window.__ec.cone)"), "l'Éclaireur a son projecteur")
    check(p.evaluate("window.__ec.state !== 'patrol' || window.__ec.detT > 0 || window.__ec.f > 60"), "l'Éclaireur patrouille et te repère")
    p.evaluate("(()=>{ const e = window.__ec; e.state = 'alert'; e.stT = 0; })()"); p.wait_for_timeout(600)
    p.evaluate("(()=>{ const sc = %s; const s = sc.spawnOneEnemy('shooter', 120); if (s){ s.x = 80; s.y = 300; const b = sc.enemyBullets.create(s.x, s.y + 10, 'brFxOrb', 0); b.body.velocity.set(0, 150); window.__lkb = b; } })()" % SC); p.wait_for_timeout(700)
    check(p.evaluate("!!(window.__lkb && window.__lkb._lk)"), 'pendant le verrouillage, le tir d un autre ennemi vise le joueur')
    check(p.evaluate("!!%s._ecRet && %s._ecRet.visible" % (SC, SC)), 'le viseur est affiché sur le joueur')
    print('  erreurs JS jusqu ici :', errs[:3])

    print('cristaux (w1-l3)')
    start('w1-l3', "levelById('w1-l3').goal.gems = 4; levelById('w1-l3').finalBoss = null")       # le boss de fin est testé à part plus bas
    p.evaluate("(()=>{ %s.lvGems = 4; })()" % SC); p.wait_for_timeout(3800)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire par cristaux')

    print('défaite (w1-l2) : fragments conservés, pas de victoire enregistrée')
    start('w1-l2')
    fa = p.evaluate("getMeta().fragments")
    p.evaluate("(()=>{ const sc = %s; sc.runComposants = 100; sc.stats.fragmentBonus = 0; sc.pactBonusMul = 1; sc.hp = 1; sc.hitCooldown = 0; sc.dodgeInvuln = 0; sc.shield = 0; sc.phoenixCharges = 0; sc.damagePlayer(9999); })()" % SC)
    p.wait_for_timeout(2800)
    check(go_visible() and title() == 'ACCIDENT DU TRAVAIL', 'défaite -> écran de fin')
    check(not vis('#btnNext') and vis('#btnRetry') and not vis('#home'), 'défaite : REJOUER seul (pas de SUIVANT), pas d\'arbre')
    shot('defaite')
    check('w1-l2' not in prog(), 'défaite non enregistrée comme victoire')
    bk = bank(); fb = p.evaluate("getMeta().fragments")
    check(bk.get('gross', 0) >= 100 and bk.get('franchise') == int(bk['gross']*0.3 + 0.5) and bk.get('prime') == 0 and fb - fa == bk.get('total'), 'défaite : composants conservés moins la franchise de 30 %% (%s, +%s)' % (bk, fb - fa))
    check('Franchise' in p.evaluate("document.getElementById('goRewards').textContent"), 'défaite : ligne de franchise dans le rapport')

    print('boss final (w1-l5, Le PDG)')
    start('w1-l5')
    p.wait_for_timeout(4500)
    check(p.evaluate("!!%s.pd" % SC), 'Le PDG arrive')
    p.evaluate("(()=>{ const sc = %s; sc.dodgeInvuln = 1e9; sc.pdStartAtk('guard'); })()" % SC); p.wait_for_timeout(2500)
    check(p.evaluate("%s.pd.ships.length >= 1" % SC), 'le vaisseau de protection « Le PDG » vient devant la tour')
    p.evaluate("(()=>{ const sc = %s, e = sc.pd.ships[0]; sc.pdHurtShip(e, e.x, e.y, 1e6); })()" % SC); p.wait_for_timeout(1800)
    check(p.evaluate("%s.pd.guards.length >= 1 && %s.pd.ships.length === 0" % (SC, SC)), "détruit, le vaisseau lâche un agent de sécurité")
    check(p.evaluate("%s.pd.guards[0].st >= 1" % SC), "l'agent gèle en s'interposant")
    p.evaluate("(()=>{ const sc = %s; sc.pdStartAtk('volley'); })()" % SC); p.wait_for_timeout(2500)
    p.evaluate("(()=>{ const sc = %s; sc.pdStartAtk('ring'); })()" % SC); p.wait_for_timeout(3000)
    p.evaluate("(()=>{ const sc = %s; sc.pdStartAtk('solar'); })()" % SC); p.wait_for_timeout(5000)
    p.evaluate("(()=>{ const sc = %s; sc.pdDamage(200, 200, 700, true); })()" % SC); p.wait_for_timeout(1500)
    check(p.evaluate("%s.pd.st >= 2" % SC), "Le PDG s'abîme (états d'usure)")
    p.evaluate("(()=>{ const sc = %s; sc.pdStartAtk('guard'); })()" % SC); p.wait_for_timeout(2500)
    check(p.evaluate("%s.pd.ships.length >= 1" % SC), 'jusqu\'à trois vaisseaux de protection')
    k0 = p.evaluate("(()=>{ const sc = %s; sc.comps.clear(true, true); return sc.runComposants; })()" % SC)       # on ne mesure que la pluie du boss
    p.evaluate("(()=>{ %s.pdDamage(200, 200, 1e9, true); })()" % SC); p.wait_for_function("window.__ssxScene.pd && window.__ssxScene.pd.dead", timeout=12000); p.wait_for_timeout(200)
    check(p.evaluate("%s.runComposants + %s.composantsOnScreenValue()" % (SC, SC)) - k0 >= 60, 'boss de secteur (PDG) : grosse pluie de composants (12 gros)')
    p.wait_for_timeout(9000)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire à la mort du PDG')
    check('847 infractions' in p.evaluate("document.getElementById('rpNorma').textContent"), 'fin du secteur 1 : transmission N.O.R.M.A. de la bible')
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
    p.evaluate("(()=>{ const sc = %s; sc.runComposants = 10; sc.stats.fragmentBonus = 0; sc.pactBonusMul = 1; return 0; })()" % SC)
    p.evaluate("document.getElementById('btnQuit').click(); document.getElementById('btnQuitYes').click()"); p.wait_for_timeout(900)
    check(go_visible() and title() == 'ORDRE ANNULE', 'QUITTER = niveau abandonné (écran de résultat)')
    bk = bank(); check(bk.get('gross', 0) >= 10 and bk.get('franchise') == int(bk['gross']*0.3 + 0.5) and bk.get('prime') == 0, 'abandon : franchise, pas de prime (%s)' % bk)

    print('boss de fin (w1-l2)')
    start('w1-l2', "levelById('w1-l2').goal.seconds = 3")
    p.wait_for_timeout(4500)
    check(p.evaluate("!!%s.ar" % SC), "le boss de fin arrive quand le temps est écoulé")
    check(not go_visible(), 'pas de victoire tant que le boss est en vie')
    p.evaluate("(()=>{ %s.arDamage(200, 200, 1e9, true); })()" % SC); p.wait_for_timeout(9000)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire à la mort du boss')

    print('boss de fin (w1-l1, La Météo)')
    start('w1-l1', "levelById('w1-l1').goal.seconds = 3; levelById('w1-l1').finalBoss = 'meteo'")
    p.wait_for_timeout(4500)
    check(p.evaluate("!!%s.mt" % SC), "La Météo arrive quand le temps est écoulé")
    check(not go_visible(), 'pas de victoire tant que le boss est en vie')
    p.evaluate("(()=>{ %s.mtDamage(200, 200, 1e9, true); })()" % SC); p.wait_for_timeout(9000)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire à la mort de La Météo')

    print('boss de fin (w1-l3, Le Réacteur)')
    start('w1-l3', "levelById('w1-l3').goal.gems = 4; levelById('w1-l3').finalBoss = 'reacteur'")
    p.evaluate("(()=>{ %s.lvGems = 4; })()" % SC); p.wait_for_timeout(2500)
    check(p.evaluate("!!%s.rx" % SC), "Le Réacteur arrive quand les cristaux sont ramassés")
    check(not go_visible(), 'pas de victoire tant que le boss est en vie')
    p.evaluate("(()=>{ %s.rxDamage(200, 200, 1e9, true); })()" % SC); p.wait_for_timeout(9000)
    check(go_visible() and title() == 'INTERVENTION VALIDEE', 'victoire à la mort du Réacteur')
    print('mob Pilleur (w1-l3)')
    start('w1-l3', "levelById('w1-l3').goal.gems = 999; levelById('w1-l3').finalBoss = null")
    p.evaluate("(()=>{ const sc = %s; sc.enemies.clear(true, true); const e = sc.spawnOneEnemy('pilleur', 200); window.__pl = e; e.y = sc.visibleYRange(0).min + 40; e.stopY = e.y + 60; e.hp = e.maxHp = 1e7; for (let i = 0; i < 8; i++) sc.spawnGemAt(e.x + (i - 4)*14, e.y + 10 + i*8, 3, 'gemM', 0); })()" % SC); p.wait_for_timeout(5500)
    check(p.evaluate("!!(window.__pl && window.__pl.eaten > 0)"), "le Pilleur avale des cristaux et remplit son réservoir")
    check(p.evaluate("!!(window.__pl && window.__pl.bm)"), 'le Pilleur a son faisceau laser')

    print('secteur 2 : nom du boss (bible)')
    check(p.evaluate("AGP_LORE.employee") == 'EMPLOYE N° 0042', 'employé n° 0042 (bible)')
    start('w2-l5')
    p.wait_for_function("window.__ssxScene.bossActive", timeout=10000); p.wait_for_timeout(300)
    check('LE BROYEUR' in p.evaluate("document.getElementById('bossLabel').textContent"), 'jauge du boss : LE BROYEUR (%s)' % p.evaluate("document.getElementById('bossLabel').textContent"))

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
