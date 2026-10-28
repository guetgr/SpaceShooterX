"""Niveaux JSON : lecture, validation et cache JS pour scripts classiques/builds."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read_levels(root=ROOT):
    folder = root / 'src/data/levels'
    return {name: json.loads((folder / (name + '.json')).read_text()) for name in json.loads((folder / 'index.json').read_text())}

def validate_level(d, original, root=ROOT):
    if not isinstance(d, dict) or d.get('id') != original['id'] or d.get('world') != original['world'] or d.get('type') != original['type']:
        raise ValueError('Identité, secteur et type du niveau doivent être conservés')
    if any(d.get(k) != original.get(k) for k in ['schemaVersion','tuto']): raise ValueError('Version et mode tutoriel doivent être conservés')
    if set(d) != set(original): raise ValueError('Paramètres manquants ou inconnus')
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
    for kind in ['spawns','waves','events']:
        if not isinstance(d[kind],list) or len(d[kind])>1000: raise ValueError(kind + ' : liste invalide')
        for row in d[kind]:
            if not isinstance(row,dict): raise ValueError(kind + ' : objet requis')
            if kind=='spawns':
                if set(row)-{'type','from','w','tier'} or not {'type','from','w'} <= set(row) or row['type'] not in enemies or not number(row['from'],-1,3600) or not number(row['w'],0.01,1000) or not number(row.get('tier',1),1,4): raise ValueError('Pool invalide')
            elif kind=='waves':
                if set(row)!={'type','at','count','spacing'} or row['type'] not in enemies or not number(row['at'],0,3600) or type(row['count'])!=int or not 1<=row['count']<=100 or not number(row['spacing'],0,60): raise ValueError('Vague invalide')
            elif set(row)-{'kind','at','duration'} or not {'kind','at'} <= set(row) or row['kind'] not in events or not number(row['at'],0,3600) or ('duration' in row and not number(row['duration'],0.1,600)): raise ValueError('Événement invalide')
    for key in ['bg','intro','boss','finalBoss','bossName']:
        if not (d[key] is None or isinstance(d[key],str)): raise ValueError(key + ' : texte ou null requis')
    if d['finalBoss'] not in [None,'meteo','araignee','reacteur','anneau','pdg']: raise ValueError('Boss final inconnu')
    if d['boss'] not in [None,'dread','faucheuse','ruche','prisme','kraken','eclipse','hydre']: raise ValueError('Boss inconnu')
    if d['intro'] not in [None,'earth']: raise ValueError('Introduction inconnue')
    if d['bg'] not in [None,'horizon','debris','station','cristaux','patrouille','direction']: raise ValueError('Décor inconnu')
    if min(d['zoom'].values()) <= 0: raise ValueError('Zoom positif requis')
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
