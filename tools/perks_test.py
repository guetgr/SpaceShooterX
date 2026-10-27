"""Atouts GLOBAUX (R&D, permanents) vs atouts de MISSION (cartes de la partie) : les modules R&D sont appliqués au décollage et listés séparément en pause.
   python tools/perks_test.py"""
import functools, http.server, threading, json, os
from playwright.sync_api import sync_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=R))
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:%d/index.html'%srv.server_address[1]
W1={'v':1,'levels':{'w1-tuto':{'clears':1,'best':9},'w1-l1':{'clears':1,'best':9}},'seen':{},'last':'w1-l1','comp':{}}
W0={'v':1,'levels':{},'seen':{},'last':'','comp':{}}   # compte neuf : DECOLLER lance le tutoriel
def ck(c,m): print(('ok     ' if c else 'ECHEC  ')+m)
def run(tree, tuto=False, atelier=None, v2=False, rd=None, chargement=None):
    out={}
    with sync_playwright() as pw:
        b=pw.chromium.launch(channel='chrome'); p=b.new_page(viewport={'width':420,'height':760}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
        p.route('**/phaser.min.js',lambda r:r.fulfill(path=R+'/vendor/phaser.min.js'))
        p.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
        mk,mv=('ssx_meta_v2',{'fragments':50,'tree':tree,'asc':0}) if v2 else ('ssx_meta_v3',{'v':3,'composants':50,'atelier':atelier or {},'tree':tree,'rd':rd or {},'chargement':chargement or []})
        p.goto(BASE); p.evaluate("localStorage.setItem(%s, JSON.stringify(%s)); localStorage.setItem('ssx_worlds_v1', JSON.stringify(%s))"%(json.dumps(mk),json.dumps(mv),json.dumps(W0 if tuto else W1))); p.goto(BASE)
        p.wait_for_function('window.__ssxScene && window.__ssxScene.scene.isActive("home")',timeout=90000); p.wait_for_timeout(1200)
        p.evaluate("document.getElementById('btnLaunch').click()"); p.wait_for_timeout(5000)
        out['tuto']=p.evaluate("!!window.__ssxScene.tuto")
        out['stats']=p.evaluate("(()=>{const s=window.__ssxScene; return {dmg:s.stats.damage, hp:s.stats.maxHp, bonus:s.gearBonus, summary:s.globalGearSummary()}})()")
        p.evaluate("(()=>{const s=window.__ssxScene; s.upgradeCounts[UPGRADE_POOL[0].id]=2;})()")
        p.evaluate("document.getElementById('pauseBtn').click()"); p.wait_for_timeout(700)
        out['G']=p.evaluate("(()=>{const s=window.__ssxScene; return s.globalGearItems().map(x=>x.name)})()")
        out['M']=p.evaluate("(()=>{const s=window.__ssxScene; return s.pauseGearItems().map(x=>x.name)})()")
        out['errs']=errs; b.close()
    return out
AT={'coque':2,'canon':2}; RD={'laser_continu':{'plan':True,'proto':True}}; CH=['laser_continu']
GA=['CANON DE SERIE MK II','COQUE MK II']; GL=GA+['LASER CONTINU · NON ASSEMBLEE']
base=run({}); rd=run({}, atelier=AT, rd=RD, chargement=CH)
ck(rd['stats']['dmg']>base['stats']['dmg'] and rd['stats']['hp']>base['stats']['hp'],'l\'atelier est appliqué au décollage (dégâts %s -> %s, coque %s -> %s)'%(base['stats']['dmg'],rd['stats']['dmg'],base['stats']['hp'],rd['stats']['hp']))
ck(sorted(rd['G'])==sorted(GL),'atouts globaux listés (atelier + technologie du chargement) : %s'%rd['G'])
ck(len(rd['M'])==1 and rd['M'][0] not in rd['G'],'atouts de mission distincts des globaux : %s'%rd['M'])
ck(base['G']==[] and base['stats']['summary']=='','sans atelier ni chargement : aucun atout global affiché')
ck('3 atouts globaux actifs' in rd['stats']['summary'],'résumé de début de mission : %s'%rd['stats']['summary'])
ck(not base['errs'] and not rd['errs'],'pas d\'erreur JS')
tb=run({}, True); tr=run({}, True, atelier=AT, rd=RD, chargement=CH)
ck(tb['tuto'] and tr['tuto'],'le départ sur compte neuf lance bien le tutoriel')
ck(tr['stats']['dmg']>tb['stats']['dmg'] and tr['stats']['hp']>tb['stats']['hp'],'tutoriel : l\'atelier est utilisé (dégâts %s -> %s, coque %s -> %s)'%(tb['stats']['dmg'],tr['stats']['dmg'],tb['stats']['hp'],tr['stats']['hp']))
ck(sorted(tr['G'])==sorted(GA),'tutoriel : atelier seul listé (le chargement est ignoré) : %s'%tr['G'])
ck(not tb['errs'] and not tr['errs'],'tutoriel : pas d\'erreur JS')
# ancienne sauvegarde v2 : les nœuds repris par l'atelier sont remboursés (plus d'atout global), le jeu démarre sans erreur
m2=run({'t_puissance':3,'t_vitalite':3}, v2=True)
ck(m2['G']==[] and m2['stats']['dmg']==base['stats']['dmg'] and not m2['errs'],'migration v2 : nœuds repris remboursés, aucun atout fantôme, pas d\'erreur JS')
