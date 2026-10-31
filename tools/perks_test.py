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
def run(tree, tuto=False, niv=None, v2=False, v3=None):
    out={}
    with sync_playwright() as pw:
        b=pw.chromium.launch(channel='chrome'); p=b.new_page(viewport={'width':420,'height':760}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
        p.route('**/phaser.min.js',lambda r:r.fulfill(path=R+'/vendor/phaser.min.js'))
        p.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
        mk,mv=('ssx_meta_v2',{'fragments':50,'tree':tree,'asc':0}) if v2 else ('ssx_meta_v3',v3 or {'v':4,'composants':50,'niv':niv or {}})
        p.goto(BASE); p.evaluate("localStorage.setItem(%s, JSON.stringify(%s)); localStorage.setItem('ssx_worlds_v1', JSON.stringify(%s))"%(json.dumps(mk),json.dumps(mv),json.dumps(W0 if tuto else W1))); p.goto(BASE)
        p.wait_for_function('window.__ssxScene && window.__ssxScene.scene.isActive("home")',timeout=90000); p.wait_for_timeout(1200)
        p.evaluate("document.getElementById('btnLaunch').click()"); p.wait_for_timeout(5000)
        out['tuto']=p.evaluate("!!window.__ssxScene.tuto")
        out['stats']=p.evaluate("(()=>{const s=window.__ssxScene; return {dmg:s.stats.damage, hp:s.stats.maxHp, spread:s.stats.spreadCount, dsm:s.stats.doubleShotMul, bonus:s.gearBonus, summary:s.globalGearSummary()}})()")
        p.evaluate("(()=>{const s=window.__ssxScene; s.upgradeCounts[UPGRADE_POOL[0].id]=2;})()")
        p.evaluate("document.getElementById('pauseBtn').click()"); p.wait_for_timeout(700)
        out['G']=p.evaluate("(()=>{const s=window.__ssxScene; return s.globalGearItems().map(x=>x.name)})()")
        out['M']=p.evaluate("(()=>{const s=window.__ssxScene; return s.pauseGearItems().map(x=>x.name)})()")
        out['errs']=errs; b.close()
    return out
NV={'c_puissance':2,'k_coque':2,'a_portee':1}; GN=['PUISSANCE DE TIR','COQUE RENFORCEE','PORTEE DE L\'AIMANT']
base=run({}); rd=run({}, niv=NV)
ck(rd['stats']['dmg']>base['stats']['dmg'] and rd['stats']['hp']>base['stats']['hp'],'la R&D est appliquée au décollage (dégâts %s -> %s, coque %s -> %s)'%(base['stats']['dmg'],rd['stats']['dmg'],base['stats']['hp'],rd['stats']['hp']))
ck(abs(rd['stats']['dmg']-base['stats']['dmg']*1.04)<1e-6 and abs(rd['stats']['hp']-base['stats']['hp']*1.04)<1e-6,'bonus appliqués une seule fois (+4 % attendus)')
ck(sorted(rd['G'])==sorted(GN),'atouts globaux listés (R&D + atelier) : %s'%rd['G'])
ck(len(rd['M'])==1 and rd['M'][0] not in rd['G'],'atouts de mission distincts des globaux : %s'%rd['M'])
ck(base['G']==[] and base['stats']['summary']=='','sans amélioration : aucun atout global affiché')
ck('3 atouts globaux actifs' in rd['stats']['summary'],'résumé de début de mission : %s'%rd['stats']['summary'])
ck(not base['errs'] and not rd['errs'],'pas d\'erreur JS')
tb=run({}, True); tr=run({}, True, niv=NV)
ck(tb['tuto'] and tr['tuto'],'le départ sur compte neuf lance bien le tutoriel')
ck(tr['stats']['dmg']>tb['stats']['dmg'] and tr['stats']['hp']>tb['stats']['hp'],'tutoriel : les améliorations sont utilisées (dégâts %s -> %s, coque %s -> %s)'%(tb['stats']['dmg'],tr['stats']['dmg'],tb['stats']['hp'],tr['stats']['hp']))
ck(not tb['errs'] and not tr['errs'],'tutoriel : pas d\'erreur JS')
# double tir garanti dès le démarrage
dt=run({}, niv={'c_double':1})
ck(dt['stats'].get('spread')==2 and abs(dt['stats'].get('dsm')-0.5)<1e-9,'double tir niveau 1 : deux projectiles dès le départ')
# ancienne sauvegarde v3 (atelier Mk + technologie) : remboursée, plus aucun atout fantôme
m3=run({}, v3={'v':3,'composants':50,'atelier':{'coque':2,'canon':2},'rd':{'laser_continu':{'plan':True,'proto':True}},'chargement':['laser_continu']})
ck(m3['G']==[] and m3['stats']['dmg']==base['stats']['dmg'] and not m3['errs'],'migration v3 : achats remboursés, aucun atout fantôme, pas d\'erreur JS')
# ancienne sauvegarde v2 : les nœuds repris par l'atelier sont remboursés (plus d'atout global), le jeu démarre sans erreur
m2=run({'t_puissance':3,'t_vitalite':3}, v2=True)
ck(m2['G']==[] and m2['stats']['dmg']==base['stats']['dmg'] and not m2['errs'],'migration v2 : nœuds repris remboursés, aucun atout fantôme, pas d\'erreur JS')
