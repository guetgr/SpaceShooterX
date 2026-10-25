import json
nodes=json.load(open('/tmp/tree.json'))['nodes']
names={n['id']:n['name'] for n in nodes}
BR={'arme':'ARME (tir, laser, shotgun)','missile':'MISSILE','defense':'DEFENSE','util':'UTILITAIRE','savoir':'SAVOIR (cartes)','tempete':'TEMPETE (foudre, éclats)','gravite':'GRAVITE (champ lent, pulsar, trou noir)','furie':'FURIE (overdrive)'}
def tree_md():
    out=[]; cur=None; tot={}
    for n in nodes:
        b=n['branch']
        if b=='hub': continue
        tot[b]=tot.get(b,0)+n['max']
    order=[]
    for n in nodes:
        if n['branch']!='hub' and n['branch'] not in order: order.append(n['branch'])
    for n in sorted([x for x in nodes if x['branch']!='hub'], key=lambda x: order.index(x['branch'])):
        b=n['branch']
        if b!=cur:
            cur=b; out.append(f"\n### Branche {BR.get(b,b)} — {tot[b]} points max\n")
            out.append("| Compétence | Niv. max | Coût (niv.1 / 2 / 3…) | Prérequis | Effet |\n|---|---|---|---|---|")
        c=n['cost']; cs=(f"{c[0]}" if (n["max"]==1 or c[0]==c[1]==c[2]) else (f"{c[0]} / {c[1]}" if n["max"]==2 else f"{c[0]} / {c[1]} / {c[2]}"))
        req=", ".join(names.get(r,r) for r in n['req']) if n['req'] else "—"
        out.append(f"| {n['name']} | {n['max']} | {cs} | {req} | {n['desc']} |")
    return "\n".join(out)
doc=open('/tmp/doc_head.md').read().replace('{{TREE}}',tree_md())
open('/mnt/user-data/outputs/space-shooter-x-gameplay.md','w').write(doc)
print(len(doc))
