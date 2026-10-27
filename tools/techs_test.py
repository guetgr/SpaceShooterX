"""Technologies en mission : le chargement remplace l'arbre. Rien n'est actif au départ ; chaque technologie emportée s'ASSEMBLE par une carte
   (garantie tant qu'il en reste), puis ses rangs de R&D, ses cartes d'amélioration et sa spécialisation entrent en jeu.
   python tools/techs_test.py"""
import contextlib, functools, http.server, threading, json, os, sys
from playwright.sync_api import sync_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=R))
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:%d/index.html'%srv.server_address[1]
W1={'v':1,'levels':{'w1-tuto':{'clears':1,'best':9},'w1-l1':{'clears':1,'best':9}},'seen':{},'last':'w1-l1','comp':{}}
W0={'v':1,'levels':{},'seen':{},'last':'','comp':{}}   # compte neuf : DECOLLER lance le tutoriel
fails=[]
def ck(c,m):
    print(('ok     ' if c else 'ECHEC  ')+m)
    if not c: fails.append(m)

@contextlib.contextmanager
def mission(meta, worlds=W1, dev=False):
    """Démarre une mission avec la sauvegarde donnée ; renvoie (page, erreurs JS)."""
    with sync_playwright() as pw:
        b=pw.chromium.launch(channel='chrome'); p=b.new_page(viewport={'width':420,'height':760}); errs=[]; p.on('pageerror',lambda e:errs.append(str(e)))
        p.route('**/phaser.min.js',lambda r:r.fulfill(path=R+'/vendor/phaser.min.js'))
        p.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=''))
        url=BASE+('?dev' if dev else '')
        p.goto(url); p.evaluate("localStorage.setItem('ssx_meta_v3', JSON.stringify(%s)); localStorage.setItem('ssx_worlds_v1', JSON.stringify(%s))"%(json.dumps(meta),json.dumps(worlds))); p.goto(url)
        p.wait_for_function('window.__ssxScene && window.__ssxScene.scene.isActive("home")',timeout=90000); p.wait_for_timeout(1200)
        p.evaluate("document.getElementById('btnLaunch').click()"); p.wait_for_timeout(5000)
        try: yield p, errs
        finally: b.close()

ev=lambda p,js: p.evaluate("(()=>{const s=window.__ssxScene; "+js+"})()")
RD=lambda *ids,**kw: {i:dict({'plan':True,'proto':True},**kw.get(i,{})) for i in ids}

# (a) rien d'actif au départ, l'assemblage pose l'arme
with mission({'v':3,'composants':0,'rd':RD('laser_continu'),'chargement':['laser_continu']}) as (p,errs):
    r=ev(p,"return [s.stats.weaponMode, !!s.laserDestructeurOwned, Object.keys(s.techState).join(), s.techState.laser_continu.assembled]")
    ck(r==['bullet',False,'laser_continu',False],'au départ : le chargement est lu mais rien n\'est actif (%s)'%r)
    ev(p,"s.techAssemble('laser_continu'); return 0")
    ck(ev(p,"return s.stats.weaponMode")=='laser' and ev(p,"return s.techState.laser_continu.assembled"),'assemblage du LASER CONTINU : weaponMode = laser')
    ev(p,"s.techAssemble('laser_continu'); return 0")
    ck(not errs,'(a) pas d\'erreur JS')

# (b) les rangs de R&D s'appliquent à l'assemblage
with mission({'v':3,'composants':0,'rd':RD('laser_continu',laser_continu={'rang':2}),'chargement':['laser_continu']}) as (p,errs):
    ev(p,"s.techAssemble('laser_continu'); return 0")
    v=ev(p,"return s.stats.laserSpeedBonus")
    ck(abs(v-0.20)<1e-9,'LASER CONTINU rang 2 : laserSpeedBonus = 0,20 (%s)'%v)

# (c) une rampe de missiles
with mission({'v':3,'composants':0,'rd':RD('missiles_guidage'),'chargement':['missiles_guidage']}) as (p,errs):
    ev(p,"s.techAssemble('missiles_guidage'); return 0")
    ck(ev(p,"return [s.stats.missileCount, s.stats.missileType]")==[1,'chercheur'],'MISSILES A GUIDAGE : 1 missile chercheur après l\'assemblage')

# (d) le tutoriel se joue avec la camionnette de base, même si la sauvegarde contient un chargement
with mission({'v':3,'composants':0,'rd':RD('laser_continu'),'chargement':['laser_continu']}, worlds=W0) as (p,errs):
    ck(ev(p,"return !!s.tuto"),'compte neuf : le tutoriel démarre')
    ck(ev(p,"return [Object.keys(s.techState).length, s.stats.weaponMode]")==[0,'bullet'],'tutoriel : aucun chargement, arme de base')
    ck(not errs,'(d) pas d\'erreur JS')

# (e) chargement invalide : nettoyé au démarrage de la mission, sans exception
with mission({'v':3,'composants':0,'rd':RD('laser_continu','laser_auto'),'chargement':['laser_continu','laser_auto']}) as (p,errs):
    ck(ev(p,"return Object.keys(s.techState).join()")=='laser_continu','chargement à 2 ARME et 1 baie : seule la première est gardée')
    ck(not errs,'(e) pas d\'erreur JS')

# (f) garantie : tant qu'une technologie n'est pas assemblée, chaque montée de niveau propose une carte d'assemblage (2 choix, 3 technologies)
with mission({'v':3,'composants':0,'rd':RD('laser_continu','missiles_guidage','drone'),'chargement':['laser_continu','missiles_guidage','drone']}, dev=True) as (p,errs):
    for k in range(3):
        names=ev(p,"s.levelUp(); return [...document.querySelectorAll('#cardsWrap .card-name')].map(e=>e.textContent)")
        ck(any(n.startswith('ASSEMBLAGE') for n in names) and len(names)==2,'montée de niveau %d : une carte d\'assemblage parmi %s'%(k+1,names))
        p.evaluate("[...document.querySelectorAll('#cardsWrap .card')].find(c=>c.querySelector('.card-name').textContent.startsWith('ASSEMBLAGE')).click()"); p.wait_for_timeout(200)
    ck(ev(p,"return Object.values(s.techState).every(t=>t.assembled)"),'les 3 technologies sont assemblées après 3 montées de niveau')
    names=ev(p,"s.levelUp(); return [...document.querySelectorAll('#cardsWrap .card-name')].map(e=>e.textContent)")
    ck(not any(n.startswith('ASSEMBLAGE') for n in names) and len(names)==2,'tout assemblé : plus de carte d\'assemblage (%s)'%names)
    ck(ev(p,"return [s.stats.weaponMode, s.stats.missileCount, !!s.droneOwned]")==['laser',1,True],'effets des trois assemblages : laser, 1 missile, drone')
    ck(not errs,'(f) pas d\'erreur JS')

# ---- cartes d'amélioration, spécialisation et fusions
take=lambda p,cid: p.evaluate("(()=>{const s=window.__ssxScene; const c=s.techCards().find(c=>c.id==='%s'); s.renderCardChoices([c]); document.querySelector('#cardsWrap .card').click(); return 0;})()"%cid)
ids=lambda p: ev(p,"return s.techCards().map(c=>c.id)")
LC='up_laser_continu_t_laser_c_portee'
# (g) technologie assemblée : ses améliorations sont proposées, pas la spécialisation tant que < 2 cartes
with mission({'v':3,'composants':0,'rd':RD('laser_continu',laser_continu={'spe':True}),'chargement':['laser_continu']}) as (p,errs):
    ck(ids(p)==[],'technologie non assemblée : aucune carte d\'amélioration')
    ev(p,"s.techAssemble('laser_continu'); return 0")
    c=ids(p)
    ck('up_laser_continu_t_laser_c_portee' in c and 'up_laser_continu_t_laser_c_degats' in c and 'spe_laser_continu' not in c,'assemblée : améliorations proposées, pas la spécialisation (%s)'%c)
    v0=ev(p,"return s.stats.laserSpeedBonus")
    take(p,LC); v1=ev(p,"return s.stats.laserSpeedBonus")
    ck(abs((v1-v0)-0.10)<1e-9,'une carte d\'amélioration applique l\'incrément exactement une fois (+%s)'%(v1-v0))
    ck('spe_laser_continu' not in ids(p),'1 carte prise : toujours pas de spécialisation')
    take(p,LC)
    ck('spe_laser_continu' in ids(p),'2 cartes de la technologie prises : la spécialisation est proposée')
    take(p,'spe_laser_continu')
    ck(ev(p,"return s.laserDestructeurOwned")==True and 'spe_laser_continu' not in ids(p),'carte SPECIALISATION : LASER DESTRUCTEUR posé, carte non reproposée')
    ck(not errs,'(g) pas d\'erreur JS')

# (h) une spécialisation non recherchée ne sort jamais
with mission({'v':3,'composants':0,'rd':RD('laser_continu'),'chargement':['laser_continu']}) as (p,errs):
    ev(p,"s.techAssemble('laser_continu'); return 0")
    take(p,LC); take(p,LC); take(p,LC)
    ck('spe_laser_continu' not in ids(p) and ev(p,"return s.laserDestructeurOwned")==False,'spécialisation non recherchée : jamais proposée')
    ck(LC not in ids(p),'une amélioration de mission est plafonnée (3 cartes)')

# (i) fusions : ORAGE exige ARC ELECTRIQUE et TIRS RICOCHETS emportées ET assemblées ; VORTEX attend le trou noir (secteur 4)
FU=lambda p: ev(p,"return s.eligibleFusions().map(f=>f.id)")
with mission({'v':3,'composants':0,'rd':RD('arc_electrique','ricochets','pulsar'),'chargement':['arc_electrique','ricochets','pulsar']}, dev=True) as (p,errs):
    ck('fus_orage' not in FU(p),'ORAGE : technologies emportées mais non assemblées -> pas de fusion')
    ev(p,"s.techAssemble('arc_electrique'); return 0")
    ck('fus_orage' not in FU(p),'ORAGE : une seule des deux assemblée -> pas de fusion')
    ev(p,"s.techAssemble('ricochets'); s.techAssemble('pulsar'); return 0")
    f=FU(p)
    ck('fus_orage' in f and 'fus_vortex' not in f,'ORAGE disponible quand les deux sont assemblées, VORTEX jamais (trou noir indisponible) : %s'%f)
    ck(not errs,'(i) pas d\'erreur JS')

# ---- (j) le DRONE apparaît à l'assemblage (et passe à 3 avec ESSAIM) ; (k) le bouton OVERDRIVE apparaît à l'assemblage
with mission({'v':3,'composants':0,'rd':RD('drone',drone={'spe':True}),'chargement':['drone']}) as (p,errs):
    ck(ev(p,"return s.droneSprites.length")==0,'drone : aucun sprite avant l\'assemblage')
    ev(p,"s.techAssemble('drone'); return 0")
    ck(ev(p,"return s.droneSprites.length")==1,'drone assemblé : le sprite du drone existe (%s)'%ev(p,"return s.droneSprites.length"))
    DU='up_drone_t_drone_cadence'
    take(p,DU); take(p,DU); take(p,'spe_drone')
    ck(ev(p,"return s.droneSprites.length")==3 and ev(p,"return s.droneSprites.every(d=>d.active)"),'ESSAIM : trois drones actifs')
    ck(not errs,'(j) pas d\'erreur JS')
with mission({'v':3,'composants':0,'rd':RD('overdrive'),'chargement':['overdrive']}, worlds=W1) as (p,errs):
    ck(ev(p,"return document.getElementById('odBtn').classList.contains('show')")==False,'overdrive : bouton masqué avant l\'assemblage')
    ev(p,"s.techAssemble('overdrive'); return 0")
    ck(ev(p,"return document.getElementById('odBtn').classList.contains('show')")==True,'overdrive assemblé : le bouton OVERDRIVE apparaît')
    ck(not errs,'(k) pas d\'erreur JS')

if fails: print('ÉCHEC : techs (%d)'%len(fails)); sys.exit(1)
print('OK : techs')
