"""Niveaux JSON : lecture, validation et cache JS pour scripts classiques/builds."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read_levels(root=ROOT):
    folder = root / 'src/data/levels'
    return {name: json.loads((folder / (name + '.json')).read_text()) for name in json.loads((folder / 'index.json').read_text())}

def bg_kinds(root=ROOT):
    """Décors permis : ligne « const WORLD_BG_KINDS = ['a', 'b', ...]; » de src/world/bg-monde.js (node tools/level_look_test.js la compare aux méthodes wbgBuild_*)."""
    m = re.search(r"^const WORLD_BG_KINDS = \[([^\]]*)\];", (root/'src/world/bg-monde.js').read_text(), re.M)
    kinds = re.findall(r"'(\w+)'", m.group(1)) if m else []
    if not kinds: raise ValueError("bg : aucun décor lu dans src/world/bg-monde.js ; la ligne « const WORLD_BG_KINDS = ['horizon', …]; » doit être conservée")
    return kinds

def music_tables(root=ROOT):
    """Clés de musique de src/audio/music.js : tables `const MUSIC_LEVEL = {…};` et `const MUSIC_BOSS = {…};` (valeurs = listes de clés entre apostrophes, éventuellement sur plusieurs lignes, fin de table = « };»)."""
    text = (root/'src/audio/music.js').read_text()
    out = {}
    for name in ['MUSIC_LEVEL','MUSIC_BOSS']:
        m = re.search(r'^const ' + name + r' = \{(.*?)\};', text, re.M | re.S)
        out[name] = set(re.findall(r"'(\w+)'", re.sub(r"'[\w-]+'\s*:|\b\w+\s*:", '', m.group(1)))) if m else set()
        if not out[name]: raise ValueError('audio : aucune clé lue pour ' + name + ' dans src/audio/music.js ; le format « const ' + name + ' = { id:[\'clé\', …], … }; » doit être conservé')
    return out

def check_audio(a, root=ROOT):
    if not isinstance(a,dict) or not a or set(a) - {'level','boss'}: raise ValueError('audio : objet avec level et/ou boss requis')
    tables = music_tables(root)
    if 'level' in a:
        if not isinstance(a['level'],list) or not 1 <= len(a['level']) <= 2 or any(not isinstance(k,str) for k in a['level']): raise ValueError('audio.level : 1 ou 2 clés de musique requises')
        for k in a['level']:
            if k not in tables['MUSIC_LEVEL']: raise ValueError('audio.level : clé de musique inconnue « %s » (clés de MUSIC_LEVEL dans src/audio/music.js)' % k)
    if 'boss' in a and (not isinstance(a['boss'],str) or a['boss'] not in tables['MUSIC_BOSS']): raise ValueError('audio.boss : clé de musique de boss inconnue (clés de MUSIC_BOSS dans src/audio/music.js)')

def validate_level(d, original, root=ROOT):
    if not isinstance(d, dict) or d.get('id') != original['id'] or d.get('world') != original['world'] or d.get('type') != original['type']:
        raise ValueError('Identité, secteur et type du niveau doivent être conservés')
    if any(d.get(k) != original.get(k) for k in ['schemaVersion','tuto']): raise ValueError('Version et mode tutoriel doivent être conservés')
    if set(d) - {'mobs','bossTune','eventTune','norma','audio'} != set(original) - {'mobs','bossTune','eventTune','norma','audio'}: raise ValueError('Paramètres manquants ou inconnus')
    def shape(value, ref, at='niveau'):
        if isinstance(ref, dict):
            if not isinstance(value, dict) or set(value) != set(ref): raise ValueError(at + ' : structure invalide')
            for k in ref: shape(value[k], ref[k], at + '.' + k)
        elif isinstance(ref, bool):
            if not isinstance(value, bool): raise ValueError(at + ' : booléen requis')
        elif isinstance(ref, (int,float)):
            import math
            if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value): raise ValueError(at + ' : nombre fini requis')
        elif isinstance(ref, str) and (not isinstance(value,str) or len(value)>10000): raise ValueError(at + ' : texte invalide')
    for key in ['name','threat','hpMul','dmgMul','reward','goal','zoom','ambient','tutorial']:
        if key in original: shape(d[key],original[key],key)
    if not 1 <= d['threat'] <= 20 or d['hpMul'] <= 0 or d['dmgMul'] <= 0: raise ValueError('Difficulté invalide')
    if any(v <= 0 for v in d['goal'].values()): raise ValueError('Objectif positif requis')
    if type(d['timelineOnly']) != int or d['timelineOnly'] not in [0,1] or d['spawnClock'] not in ['mission','difficulty']: raise ValueError('Mode de spawn invalide')
    enemies = set(re.findall(r"type:'([^']+)'", (root/'src/data/bestiary.js').read_text())) - {'meteor'}
    enemies = {e for e in enemies if not e.startswith('boss')}
    events = set(re.findall(r'^  (\w+):', (root/'src/data/events.js').read_text(), re.M))
    def number(v,lo,hi):
        return type(v) in (int,float) and lo <= v <= hi
    if d['type'] in ('kill','collect') and (0 if d['timelineOnly'] == 1 else len(d['spawns'])) + len(d['waves']) == 0 and not d.get('tuto'): raise ValueError('Objectif impossible : aucun ennemi ne peut apparaître (ni réserve ni vague)')
    if 'mobs' in d:
        known = set(re.findall(r'^  (\w+):\s+\{', (root/'src/data/enemy-stats.js').read_text(), re.M))
        if not known: raise ValueError('mobs : aucune entrée lue dans src/data/enemy-stats.js ; le format « deux espaces, nom: { » doit être conservé')
        if not isinstance(d['mobs'],dict): raise ValueError('mobs : objet requis')
        for mob, mul in d['mobs'].items():
            if mob not in known: raise ValueError('mobs : type de mob inconnu « %s » (types lus dans src/data/enemy-stats.js : entrées « deux espaces, nom: { »)' % mob)
            if not isinstance(mul,dict) or set(mul) - {'hpMul','dmgMul','speedMul','scoreMul'}: raise ValueError('mobs.%s : seuls hpMul, dmgMul, speedMul et scoreMul sont permis' % mob)
            for k, v in mul.items():
                if not number(v,0.1,10): raise ValueError('mobs.%s.%s : nombre entre 0,1 et 10 requis' % (mob,k))
    if 'bossTune' in d:
        # registre lu dans src/data/tunables.js : un id par ligne « deux espaces, id: [ », une entrée par ligne « quatre espaces, { path:'x', [len:N,] ... min:a, max:b »
        reg, cur = {}, None
        for line in (root/'src/data/tunables.js').read_text().splitlines():
            m = re.match(r'^  (\w+): \[$', line)
            if m: cur = reg.setdefault(m.group(1), {}); continue
            m = re.match(r"^    \{ path:'([^']+)',(?: len:(\d+),)?(?: ordered:'(asc|desc)',)? .*? min:(-?[\d.]+), max:(-?[\d.]+),", line)
            if m and cur is not None: cur[m.group(1)] = (int(m.group(2)) if m.group(2) else None, float(m.group(4)), float(m.group(5)), m.group(3))
        if not any(reg.values()): raise ValueError('bossTune : aucun réglage lu dans src/data/tunables.js ; le format « id: [ » puis « { path:\'x\', min:a, max:b, » doit être conservé')
        if not isinstance(d['bossTune'],dict): raise ValueError('bossTune : objet requis')
        for bid, vals in d['bossTune'].items():
            if bid == 'antenne': raise ValueError('bossTune.antenne : refusé, les réglages de l\'Antenne-Mère sont dans tutorial.boss du tutoriel')
            if bid not in reg: raise ValueError('bossTune : boss ou mob inconnu « %s » (lus dans src/data/tunables.js)' % bid)
            if not isinstance(vals,dict): raise ValueError('bossTune.%s : objet requis' % bid)
            for path, v in vals.items():
                if path not in reg[bid]: raise ValueError('bossTune.%s.%s : réglage inconnu' % (bid,path))
                ln, lo, hi, order = reg[bid][path]
                if ln is None:
                    if not number(v,lo,hi): raise ValueError('bossTune.%s.%s : nombre entre %g et %g requis' % (bid,path,lo,hi))
                else:
                    if not isinstance(v,list) or len(v) != ln: raise ValueError('bossTune.%s.%s : tableau de %d nombres requis' % (bid,path,ln))
                    if not all(number(x,lo,hi) for x in v): raise ValueError('bossTune.%s.%s : chaque nombre doit être entre %g et %g' % (bid,path,lo,hi))
                    if order == 'desc' and any(v[i] > v[i-1] for i in range(1,len(v))): raise ValueError('bossTune.%s.%s : valeurs décroissantes requises (paliers dans l\'ordre)' % (bid,path))
                    if order == 'asc' and any(v[i] < v[i-1] for i in range(1,len(v))): raise ValueError('bossTune.%s.%s : valeurs croissantes requises' % (bid,path))
    def event_registry():
        # registre lu dans src/data/event-params.js : un événement par ligne « deux espaces, kind: [ », une entrée par ligne « quatre espaces, { key:'x', label:'..', min:a, max:b, ... [int:true,] def:.. »
        reg, cur = {}, None
        for line in (root/'src/data/event-params.js').read_text().splitlines():
            m = re.match(r'^  (\w+): \[$', line)
            if m: cur = reg.setdefault(m.group(1), {}); continue
            m = re.match(r"^    \{ key:'(\w+)',.*? min:(-?[\d.]+), max:(-?[\d.]+),", line)
            if m and cur is not None: cur[m.group(1)] = (float(m.group(2)), float(m.group(3)), ' int:true,' in line)
        if not any(reg.values()): raise ValueError('événements : aucun paramètre lu dans src/data/event-params.js ; le format « kind: [ » puis « { key:\'x\', label:\'..\', min:a, max:b, » doit être conservé')
        return reg
    def check_params(vals, kind, at, reg):
        if kind not in reg: raise ValueError('%s : événement inconnu « %s » (lus dans src/data/event-params.js)' % (at, kind))
        if not isinstance(vals,dict): raise ValueError(at + ' : objet requis')
        for key, v in vals.items():
            if key not in reg[kind]: raise ValueError('%s.%s : paramètre inconnu' % (at, key))
            lo, hi, integer = reg[kind][key]
            if not number(v,lo,hi): raise ValueError('%s.%s : nombre entre %g et %g requis' % (at, key, lo, hi))
            if integer and v != int(v): raise ValueError('%s.%s : entier requis' % (at, key))
        # paires mini/maxi du registre (clés « xxxMin » / « xxxMax » du même événement) : mini <= maxi quand les deux sont données
        for key in vals:
            if key.endswith('Min') and key[:-3] + 'Max' in vals and vals[key] > vals[key[:-3] + 'Max']:
                raise ValueError('%s : %s doit être inférieur ou égal à %s' % (at, key, key[:-3] + 'Max'))
    def norma_text(t, at):
        if not isinstance(t,str) or not 1 <= len(t) <= 140: raise ValueError('%s : texte de 1 à 140 caractères requis' % at)
        if '<' in t or '>' in t: raise ValueError('%s : les signes < et > sont interdits' % at)
        if not t.strip(): raise ValueError('%s : texte vide' % at)
    def check_norma(n):
        if not isinstance(n,dict): raise ValueError('norma : objet requis')
        allowed = {'start','boss','progress','banter','lowhp','win','lose','tickEvery','tuto','messages'}
        for k in n:
            if k not in allowed: raise ValueError('norma.%s : clé inconnue (permises : %s)' % (k, ', '.join(sorted(allowed))))
        for pool in ['start','boss','progress','banter','lowhp','win','lose']:
            if pool in n:
                if not isinstance(n[pool],list) or not 1 <= len(n[pool]) <= 20: raise ValueError('norma.%s : liste de 1 à 20 textes requise' % pool)
                for i, t in enumerate(n[pool]): norma_text(t, 'norma.%s[%d]' % (pool,i))
        if 'tickEvery' in n:
            t = n['tickEvery']
            if not isinstance(t,list) or len(t) != 2 or not all(number(x,5,300) for x in t) or t[0] > t[1]: raise ValueError('norma.tickEvery : deux nombres de secondes entre 5 et 300, le premier inférieur ou égal au second')
        if 'tuto' in n:
            if not d.get('tuto'): raise ValueError('norma.tuto : réservé au tutoriel (w1-tuto)')
            if not isinstance(n['tuto'],dict): raise ValueError('norma.tuto : objet requis')
            for k, t in n['tuto'].items():
                if k not in ['move','shoot','boss','aim','ring','p2','p3','win','lose']: raise ValueError('norma.tuto.%s : consigne inconnue' % k)
                norma_text(t, 'norma.tuto.' + k)
        if 'messages' in n:
            if not isinstance(n['messages'],list) or len(n['messages']) > 50: raise ValueError('norma.messages : liste de 50 boîtes au plus requise')
            ids = set()
            for i, m in enumerate(n['messages']):
                at = 'norma.messages[%d]' % i
                if isinstance(m,dict) and 'hold' in m: raise ValueError(at + '.hold : hold n\'est pas supporté sur les boîtes ; utilisez un texte court')
                if not isinstance(m,dict) or set(m)-{'id','when','at','ref','text'}: raise ValueError(at + ' : objet avec id, when, at, ref, text requis')
                if not isinstance(m.get('id'),str) or not m['id'].strip() or len(m['id']) > 40: raise ValueError(at + '.id : identifiant de 1 à 40 caractères requis')
                if m['id'] in ids: raise ValueError(at + '.id : identifiant « %s » déjà utilisé' % m['id'])
                ids.add(m['id'])
                if m.get('when') not in ['levelStart','time','eventStart','eventEnd','bossStart','win','lose']: raise ValueError(at + '.when : levelStart, time, eventStart, eventEnd, bossStart, win ou lose requis')
                if m['when'] == 'time' and not number(m.get('at'),0,3600): raise ValueError(at + '.at : secondes entre 0 et 3600 requises')
                if 'at' in m and not number(m['at'],0,3600): raise ValueError(at + '.at : secondes entre 0 et 3600 requises')
                if m['when'] in ['eventStart','eventEnd'] and m.get('ref') not in events: raise ValueError(at + '.ref : nature d\'événement connue requise (lue dans src/data/events.js)')
                norma_text(m.get('text'), at + '.text')
    if 'norma' in d: check_norma(d['norma'])
    ev_reg = event_registry()
    if 'eventTune' in d:
        if not isinstance(d['eventTune'],dict): raise ValueError('eventTune : objet requis')
        for kind, vals in d['eventTune'].items(): check_params(vals, kind, 'eventTune.' + kind, ev_reg)
    for kind in ['spawns','waves','events']:
        if not isinstance(d[kind],list) or len(d[kind])>1000: raise ValueError(kind + ' : liste invalide')
        for row in d[kind]:
            if not isinstance(row,dict): raise ValueError(kind + ' : objet requis')
            if kind=='spawns':
                if set(row)-{'type','from','w','tier'} or not {'type','from','w'} <= set(row) or row['type'] not in enemies or not number(row['from'],-1,3600) or not number(row['w'],0.01,1000) or not number(row.get('tier',1),1,4): raise ValueError('Pool invalide')
            elif kind=='waves':
                if set(row)!={'type','at','count','spacing'} or row['type'] not in enemies or not number(row['at'],0,3600) or type(row['count'])!=int or not 1<=row['count']<=100 or not number(row['spacing'],0,60): raise ValueError('Vague invalide')
            elif set(row)-{'kind','at','duration','params','norma'} or not {'kind','at'} <= set(row) or row['kind'] not in events or not number(row['at'],0,3600) or ('duration' in row and not number(row['duration'],0.1,600)): raise ValueError('Événement invalide')
            else:
                if 'params' in row: check_params(row['params'], row['kind'], 'events.params.' + row['kind'], ev_reg)
                if 'duration' in row and any(k in ('dur','durMin','durMax') for k in row.get('params',{})): raise ValueError('events.%s : duration et params.dur/durMin/durMax sont ambigus, duration l\'emporte : retirez l\'un des deux' % row['kind'])
                if 'norma' in row:
                    if not isinstance(row['norma'],dict) or set(row['norma'])-{'start','end'}: raise ValueError('events.norma : objet avec start et/ou end requis')
                    for k, t in row['norma'].items(): norma_text(t, 'events.norma.' + k)
    for key in ['bg','intro','boss','finalBoss','bossName']:
        if not (d[key] is None or isinstance(d[key],str)): raise ValueError(key + ' : texte ou null requis')
    if d['finalBoss'] not in [None,'meteo','araignee','reacteur','anneau','pdg']: raise ValueError('Boss final inconnu')
    if d['boss'] not in [None,'dread','faucheuse','ruche','prisme','kraken','eclipse','hydre']: raise ValueError('Boss inconnu')
    if d['intro'] not in [None,'earth']: raise ValueError('intro : « earth » ou null requis')
    kinds = bg_kinds(root)
    if d['bg'] is not None and d['bg'] not in kinds: raise ValueError('bg : décor inconnu « %s » (permis : %s ; null = planètes au hasard ; liste lue dans src/world/bg-monde.js)' % (d['bg'], ', '.join(kinds)))
    z = d['zoom']
    if not number(z['start'],0.3,3) or not number(z['end'],0.3,3): raise ValueError('zoom.start et zoom.end : nombres entre 0,3 et 3 requis')
    if not number(z['seconds'],5,600): raise ValueError('zoom.seconds : durée entre 5 et 600 secondes requise')
    if 'audio' in d: check_audio(d['audio'], root)
    if any(type(v)!=bool for v in d['ambient'].values()): raise ValueError('Activation ambiante invalide')
    if d.get('tutorial'):
        for group in d['tutorial'].values():
            if any(v<0 for v in group.values()): raise ValueError('Paramètres tutoriel positifs requis')
        if not 0 < d['tutorial']['boss']['p3'] < d['tutorial']['boss']['p2'] < 1: raise ValueError('Seuils de boss inversés')
    return d

def generate(root=ROOT):
    defs=read_levels(root)
    for d in defs.values(): validate_level(d,d,root)
    text='"use strict";\n// Généré depuis data/levels/*.json par tools/level_files.py ; ne pas éditer.\nconst LEVEL_FILES = (typeof window !== "undefined" && window.__LEVEL_FILES) || ' + json.dumps(defs,ensure_ascii=False,indent=2) + ';\n'
    target=root/'src/data/worlds/level-data.js'
    if not target.exists() or target.read_text()!=text: target.write_text(text)
    return defs

if __name__=='__main__':
    print(str(len(generate()))+' niveaux JSON compilés')
