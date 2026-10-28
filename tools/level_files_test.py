"""Validation et export des missions JSON dans un dossier temporaire."""
import copy
import functools
import http.server
import json
from pathlib import Path
import shutil
import tempfile
import threading
import urllib.request
import urllib.error
import level_files
import serve

original = level_files.read_levels()
assert len(original) == 16 and 'w1-tuto' in original
for doc in original.values(): level_files.validate_level(doc,doc)
for key in ['id','world','type','tuto','schemaVersion']:
    bad=copy.deepcopy(original['w1-tuto']);bad[key]='invalid'
    try: level_files.validate_level(bad,original['w1-tuto'])
    except ValueError: pass
    else: raise AssertionError(key)
for mobs, ok in [({}, True), ({'grunt':{'hpMul':1.5,'speedMul':10}}, True), ({'grunt':{'hpMul':0.1}}, True), ({'gruntx':{'hpMul':2}}, False), ({'grunt':{'hpMul':0.05}}, False), ({'grunt':{'hpMul':11}}, False), ({'grunt':{'hp':2}}, False), ({'grunt':{'hpMul':'2'}}, False), ({'grunt':{'hpMul':True}}, False), ([], False)]:
    doc=copy.deepcopy(original['w1-l1']);doc['mobs']=mobs
    try: level_files.validate_level(doc,original['w1-l1']);got=True
    except ValueError as e: got=False;msg=str(e)
    assert got==ok,(mobs,ok)
    if not ok: assert 'mobs' in msg and msg,(mobs,msg)
for bt, ok in [({}, True), ({'ar':{'hp':2000,'dmg.missile':20,'gap':[300,250,200,100]}}, True), ({'ar':{'hp':49}}, False), ({'ar':{'hp':20001}}, False), ({'ar':{'hpx':5}}, False), ({'arx':{'hp':5}}, False), ({'ar':{'gap':[300,250,200]}}, False), ({'ar':{'gap':[300,250,200,5000]}}, False), ({'ar':{'gap':5}}, False), ({'ar':{'hp':'2000'}}, False), ({'ar':{'hp':True}}, False), ({'ar':[]}, False), ({'antenne':{'hp':100}}, False), ({'bras':{'cooldown':[0,1500,1900,2100],'hp':60}}, True), ([], False)]:
    doc=copy.deepcopy(original['w1-l1']);doc['bossTune']=bt
    try: level_files.validate_level(doc,original['w1-l1']);got=True
    except ValueError as e: got=False;msg=str(e)
    assert got==ok,(bt,ok)
    if not ok: assert 'bossTune' in msg,(bt,msg)
def with_event(ev=None, tune=None):
    doc=copy.deepcopy(original['w1-l1'])
    if ev is not None: doc['events']=[ev]
    if tune is not None: doc['eventTune']=tune
    return doc
for ev, tune, ok, word in [
    ({'kind':'meteors','at':30,'duration':40,'params':{'tickMs':500}}, None, True, ''),
    ({'kind':'meteors','at':30}, None, True, ''),
    ({'kind':'meteors','at':30,'params':{}}, None, True, ''),
    ({'kind':'swarm','at':5,'params':{'perWave':12,'tickMs':300}}, {'meteors':{'speedMin':200,'speedMax':300},'plasma':{'contactDmg':20}}, True, ''),
    ({'kind':'meteors','at':30,'params':{'tickMs':10}}, None, False, 'events.params.meteors.tickMs'),
    ({'kind':'meteors','at':30,'params':{'tickMs':9000}}, None, False, 'tickMs'),
    ({'kind':'meteors','at':30,'params':{'nope':1}}, None, False, 'nope'),
    ({'kind':'meteors','at':30,'params':{'perTick':2.5}}, None, False, 'entier'),
    ({'kind':'meteors','at':30,'params':{'tickMs':'500'}}, None, False, 'tickMs'),
    ({'kind':'meteors','at':30,'params':{'tickMs':True}}, None, False, 'tickMs'),
    ({'kind':'meteors','at':30,'params':[]}, None, False, 'objet'),
    ({'kind':'meteors','at':30,'extra':1}, None, False, 'Événement invalide'),
    (None, {'meteors':{'tickMs':500}}, True, ''),
    (None, {}, True, ''),
    (None, {'meteorsx':{'tickMs':500}}, False, 'meteorsx'),
    (None, {'meteors':{'tickMsx':500}}, False, 'tickMsx'),
    (None, {'meteors':{'tickMs':49}}, False, 'eventTune.meteors.tickMs'),
    (None, {'meteors':[]}, False, 'objet'),
    (None, [], False, 'eventTune'),
]:
    try: level_files.validate_level(with_event(ev,tune),original['w1-l1']);got=True;msg=''
    except ValueError as e: got=False;msg=str(e)
    assert got==ok,(ev,tune,msg)
    if not ok: assert word in msg,(ev,tune,msg)
def with_norma(n=None, evnorma=None, base='w1-l1'):
    doc=copy.deepcopy(original[base])
    if n is not None: doc['norma']=n
    if evnorma is not None: doc['events']=[{'kind':'meteors','at':30,'norma':evnorma}]
    return doc
M=lambda **k: dict({'id':'m1','when':'time','at':12,'text':'Transmission.'},**k)
for n, ev, ok, word in [
    ({}, None, True, ''),
    ({'start':['Bonjour.'],'boss':['A'],'progress':['a','b','c'],'banter':['x'],'lowhp':['y'],'win':['z'],'lose':['w'],'tickEvery':[20,30]}, None, True, ''),
    ({'messages':[M(),M(id='m2',when='levelStart',at=0),M(id='m3',when='eventStart',ref='meteors'),M(id='m4',when='eventEnd',ref='meteors'),M(id='m5',when='bossStart'),M(id='m6',when='win'),M(id='m7',when='lose')]}, None, True, ''),
    (None, {'start':'Annonce.','end':'Fin.'}, True, ''),
    ({'start':[]}, None, False, 'norma.start'),
    ({'start':['a']*21}, None, False, 'norma.start'),
    ({'start':'a'}, None, False, 'norma.start'),
    ({'start':['']}, None, False, 'norma.start[0]'),
    ({'start':['   ']}, None, False, 'vide'),
    ({'start':['x'*141]}, None, False, '140'),
    ({'start':['a <b>']}, None, False, 'interdits'),
    ({'bossPhase':['a']}, None, False, 'bossPhase'),
    ({'tickEvery':[30,20]}, None, False, 'tickEvery'),
    ({'tickEvery':[4,20]}, None, False, 'tickEvery'),
    ({'tickEvery':[20,301]}, None, False, 'tickEvery'),
    ({'tickEvery':[20]}, None, False, 'tickEvery'),
    ({'tuto':{'move':'a'}}, None, False, 'tutoriel'),
    ({'messages':[M(),M()]}, None, False, 'déjà utilisé'),
    ({'messages':[M(when='bossPhase')]}, None, False, 'when'),
    ({'messages':[M(at=3601)]}, None, False, 'at'),
    ({'messages':[M(at=None)]}, None, False, 'at'),
    ({'messages':[M(when='eventStart')]}, None, False, 'ref'),
    ({'messages':[M(when='eventEnd',ref='nope')]}, None, False, 'ref'),
    ({'messages':[M(text='')]}, None, False, 'text'),
    ({'messages':[M(text='<i>')]}, None, False, 'interdits'),
    ({'messages':[M(hold=True)]}, None, False, 'pas supporté'),
    ({'messages':[M(hold=False)]}, None, False, 'pas supporté'),
    ({'messages':[M(extra=1)]}, None, False, 'messages[0]'),
    ({'messages':'x'}, None, False, 'messages'),
    ([], None, False, 'norma'),
    (None, {'start':''}, False, 'events.norma.start'),
    (None, {'end':'<b>'}, False, 'interdits'),
    (None, {'middle':'a'}, False, 'events.norma'),
]:
    try: level_files.validate_level(with_norma(n,ev),original['w1-l1']);got=True;msg=''
    except ValueError as e: got=False;msg=str(e)
    assert got==ok,(n,ev,msg)
    if not ok: assert word in msg,(n,ev,msg)
tn=with_norma({'tuto':{'move':'Avancez.','win':'Bravo.'}},base='w1-tuto');level_files.validate_level(tn,original['w1-tuto'])
tn['norma']['tuto']['zzz']='a'
try: level_files.validate_level(tn,original['w1-tuto']);raise SystemExit('tuto inconnu accepté')
except ValueError: pass
def with_look(**k):
    doc=copy.deepcopy(original['w1-l1']); doc.update(k); return doc
def zoom(**k):
    z=dict(original['w1-l1']['zoom']); z.update(k); return {'zoom':z}
for kw,ok,word in [
    ({'bg':'horizon'},True,''),({'bg':None},True,''),({'bg':'direction'},True,''),
    ({'bg':'volcan'},False,'bg'),({'bg':3},False,'bg'),
    ({'intro':'earth'},True,''),({'intro':None},True,''),({'intro':'mars'},False,'intro'),
    (zoom(start=0.3,end=3,seconds=5),True,''),(zoom(start=0.2),False,'zoom.start'),(zoom(end=3.5),False,'zoom.end'),(zoom(seconds=4),False,'zoom.seconds'),(zoom(seconds=601),False,'zoom.seconds'),
    ({'audio':{'level':['w1_l2_a','w1_l2_b'],'boss':'w1b_pdg_a'}},True,''),({'audio':{'level':['w1_l2_a']}},True,''),({'audio':{'boss':'bossd_a'}},True,''),
    ({'audio':{'level':['zzz']}},False,'audio.level'),({'audio':{'level':[]}},False,'audio.level'),({'audio':{'level':['w1_l1_a','w1_l1_b','w1_l2_a']}},False,'audio.level'),
    ({'audio':{'level':'w1_l1_a'}},False,'audio.level'),({'audio':{'level':['w1b_pdg_a']}},False,'audio.level'),
    ({'audio':{'boss':'zzz'}},False,'audio.boss'),({'audio':{'boss':['w1b_pdg_a']}},False,'audio.boss'),({'audio':{'boss':'w1_l1_a'}},False,'audio.boss'),
    ({'audio':{}},False,'audio'),({'audio':{'tempo':1}},False,'audio'),({'audio':[]},False,'audio'),
]:
    try: level_files.validate_level(with_look(**kw),original['w1-l1']);got=True;msg=''
    except ValueError as e: got=False;msg=str(e)
    assert got==ok,(kw,msg)
    if not ok: assert word in msg,(kw,msg)
with tempfile.TemporaryDirectory() as folder:
    root=Path(folder);(root/'src/data/worlds').mkdir(parents=True)
    shutil.copytree(level_files.ROOT/'src/data/levels',root/'src/data/levels')
    for rel in ['src/world/bg-monde.js','src/audio/music.js']:
        (root/rel).parent.mkdir(parents=True,exist_ok=True); shutil.copy(level_files.ROOT/rel,root/rel)
    for name in ['bestiary.js','events.js','enemy-stats.js','tunables.js','event-params.js']:
        shutil.copy(level_files.ROOT/'src/data'/name,root/'src/data'/name)
    serve.R=folder
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(serve.NoCache,directory=folder))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    def post(docs,path='/__editor/levels'):
        req=urllib.request.Request('http://127.0.0.1:%d%s'%(server.server_port,path),data=json.dumps({'levels':docs}).encode(),headers={'Content-Type':'application/json'})
        try: return json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as e:return json.load(e)
    tuto=copy.deepcopy(original['w1-tuto']);tuto['tutorial']['sats']['hp']=42;tuto['waves']=[{'type':'sat','at':0,'count':2,'spacing':0}]
    assert post({'w1-tuto':tuto},'/__editor/validate-level')['ok']
    assert level_files.read_levels(root)['w1-tuto']['tutorial']['sats']['hp']==30
    assert post({'w1-tuto':tuto})['ok']
    assert level_files.read_levels(root)['w1-tuto']['tutorial']['sats']['hp']==42
    assert '42' in (root/'src/data/worlds/level-data.js').read_text()
    before=(root/'src/data/levels/w1-tuto.json').read_text()
    bad=copy.deepcopy(original['w1-l2']);bad['events']=[{'kind':'missing','at':1}]
    assert not post({'w1-tuto':original['w1-tuto'],'w1-l2':bad})['ok']
    assert (root/'src/data/levels/w1-tuto.json').read_text()==before
    assert not post({'../../escape':tuto})['ok']
    server.shutdown()
print('OK : 16 JSON, mobs et bossTune bornés, validation, aperçu sans écriture, sauvegarde tutoriel, rejet transactionnel, chemins bornés')
