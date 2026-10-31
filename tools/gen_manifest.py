#!/usr/bin/env python3
"""Régénère assets/manifest.json à partir du contenu de assets/ (à lancer après avoir ajouté/supprimé un fichier).
  python tools/gen_manifest.py
"""
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(R, 'assets')
files = sorted(os.path.relpath(os.path.join(d, f), A).replace(os.sep, '/')
               for d, _, fs in os.walk(A) for f in fs if f != 'manifest.json' and not f.startswith('.'))
with open(os.path.join(A, 'manifest.json'), 'w', encoding='utf-8', newline='\n') as f:
    json.dump(files, f, indent=2)
    f.write('\n')
print(len(files), 'assets dans assets/manifest.json')
