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
with tempfile.TemporaryDirectory() as folder:
    root=Path(folder);(root/'src/data/worlds').mkdir(parents=True)
    shutil.copytree(level_files.ROOT/'src/data/levels',root/'src/data/levels')
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
