#!/usr/bin/env python3
"""Génère la carte du code dans docs/carte/ (rien à installer : Python 3 seul).

  python3 tools/gen_codemap.py            écrit docs/carte/*.md
  python3 tools/gen_codemap.py --check    n'écrit rien ; code de sortie 1 si la carte n'est plus à jour (pour un contrôle avant push)

Fichiers produits (NE PAS les modifier à la main : relancer le script) :
  fichiers.md        chaque fichier JS dans l'ordre de chargement : rôle, taille, ce qu'il définit
  symboles.md        index alphabétique : fonction / constante / classe / méthode -> fichier
  donnees.md         ids de données (cartes, reliques, compétences, boss, niveaux…) -> fichier
  interface.md       ids HTML -> fichiers qui les utilisent, doublons et restes dans le CSS, classes CSS jamais utilisées, assets
  audit.md           doublons, références cassées, candidats « code mort » (à vérifier avant de supprimer)
La couche rédigée à la main (flux, conventions, pièges) est dans docs/carte-du-code.md.

Le jeu est en scripts classiques (portée globale partagée, ordre = src/scripts.json) : l'analyse est faite par expressions régulières,
donc approximative. Un « candidat code mort » est un nom qui n'apparaît qu'UNE seule fois dans tout le dépôt : à vérifier, jamais à supprimer sans relire.
"""
import json, os, re, sys, collections

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, 'docs', 'carte')
HEADER = "<!-- Généré par tools/gen_codemap.py : ne pas modifier à la main (relancer le script). -->\n\n"


def read(rel):
    with open(os.path.join(R, rel), encoding='utf-8-sig') as f:
        return f.read()


def walk(rel, exts):
    out = []
    for d, _, fs in os.walk(os.path.join(R, rel)):
        for f in fs:
            if f.endswith(exts):
                out.append(os.path.relpath(os.path.join(d, f), R).replace(os.sep, '/'))
    return sorted(out)


# ---------------------------------------------------------------------------------------------------------------- JS
KEYWORDS = {'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'else', 'do', 'try', 'with', 'typeof', 'new', 'await'}
RE_FUNC = re.compile(r'^(?:async\s+)?function\s+(\w+)\s*\(')
RE_VAR = re.compile(r'^(?:const|let|var)\s+(\w+)\b')
RE_CLASS = re.compile(r'^class\s+(\w+)')
RE_MIXIN = re.compile(r'^mixin\((\w+)\s*,\s*\{')
RE_METHOD = re.compile(r'^  (?:async\s+)?(\w+)\s*\(([^()]*)\)\s*\{')
RE_ID = re.compile(r"""\bid\s*:\s*['"]([\w.\-#]+)['"]""")


def role_of(text):
    """Premier commentaire du fichier (après "use strict") : sert de description."""
    lines = text.split('\n')[:14]
    got = []
    for l in lines:
        s = l.strip()
        if s.startswith('"use strict"') or s.startswith("'use strict'") or not s or s.startswith('/*') and not s.strip('/* '):
            if got:
                break
            continue
        if s.startswith('//'):
            got.append(s.lstrip('/ ').strip())
        elif s.startswith('/*') or s.startswith('*'):
            got.append(s.strip('/* ').strip())
        elif got:
            break
        else:
            break
        if len(got) >= 2:
            break
    return ' '.join(x for x in got if x)[:230]


def analyse_js(rel):
    text = read(rel)
    info = {'file': rel, 'lines': text.count('\n') + 1, 'role': role_of(text), 'top': [], 'methods': [], 'targets': [], 'classes': {}}
    cur_mixin = None
    cur_class = None
    for n, line in enumerate(text.split('\n'), 1):
        m = RE_MIXIN.match(line)
        if m:
            cur_mixin = m.group(1); cur_class = None
            if cur_mixin not in info['targets']:
                info['targets'].append(cur_mixin)
            continue
        if line.startswith('});') or (line.startswith('}') and cur_mixin and line.strip() in ('}', '};', '});')):
            cur_mixin = None
        mc = RE_CLASS.match(line)
        if mc:
            cur_class = mc.group(1); cur_mixin = None
            info['top'].append((mc.group(1), 'classe', n))
            info['classes'][cur_class] = []
            continue
        if cur_class and re.match(r'^}\s*$', line):
            cur_class = None
        owner = cur_mixin or cur_class
        if owner:
            mm = RE_METHOD.match(line)
            if mm and mm.group(1) not in KEYWORDS:
                info['methods'].append((owner, mm.group(1), n, 'mixin' if cur_mixin else 'classe'))
                continue
        if owner:
            continue
        mf = RE_FUNC.match(line)
        if mf:
            info['top'].append((mf.group(1), 'fonction', n)); continue
        mv = RE_VAR.match(line)
        if mv:
            info['top'].append((mv.group(1), 'const', n))
    return info


# ---------------------------------------------------------------------------------------------------------------- CSS
def parse_css(rel):
    """Renvoie [(selecteur normalisé, contexte @media, ligne)] ; ignore @keyframes/@font-face (renvoyés à part)."""
    raw = read(rel)
    text = re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), raw, flags=re.S)
    rules, keyframes, fonts = [], [], []
    i, n, buf, line = 0, len(text), '', 1
    ctx = []

    def skip_block(j):
        depth = 0
        while j < n:
            if text[j] == '{': depth += 1
            elif text[j] == '}':
                depth -= 1
                if depth == 0: return j + 1
            j += 1
        return j

    while i < n:
        c = text[i]
        if c == '\n': line += 1
        if c == '{':
            sel = ' '.join(buf.split()); start_line = line - buf.count('\n') if False else line
            buf = ''
            if sel.startswith('@keyframes') or sel.startswith('@-webkit-keyframes'):
                keyframes.append((sel.split()[1], line)); j = skip_block(i)
            elif sel.startswith('@font-face'):
                j = skip_block(i)
            elif sel.startswith('@'):
                ctx.append(sel); i += 1; continue
            else:
                rules.append((sel, ' '.join(ctx), line)); j = skip_block(i)
            line += text[i:j].count('\n'); i = j; continue
        if c == '}':
            if ctx: ctx.pop()
            buf = ''; i += 1; continue
        buf += c; i += 1
    return rules, keyframes


# ---------------------------------------------------------------------------------------------------------------- génération
def main():
    check = '--check' in sys.argv
    scripts = json.loads(read('src/scripts.json'))
    js = [analyse_js('src/' + f) for f in scripts]
    extra_js = ['src/' + f for f in []]
    all_src = walk('src', ('.js',))
    unlisted = [f for f in all_src if f[4:] not in scripts and f not in ('src/boot.js',)]

    corpus_files = all_src + ['index.html', 'editor.html'] + walk('tools', ('.js', '.py'))
    corpus = {f: read(f) for f in corpus_files if os.path.exists(os.path.join(R, f))}
    big = '\n'.join(corpus.values())
    html = read('index.html')
    css_files = ['css/style.css', 'css/agp.css']
    css_text = {f: read(f) for f in css_files}
    outputs = {}

    def count_word(name):
        return len(re.findall(r'(?<![\w$])' + re.escape(name) + r'(?![\w$])', big))

    # ------------------------------------------------------------------ fichiers.md
    o = [HEADER, "# Carte des fichiers (ordre de chargement)\n\n",
         "L'ordre est celui de `src/scripts.json` : un fichier ne peut utiliser au démarrage que ce qui est défini **plus haut**. `boot.js` (chargeur) et `main.js` (Phaser) encadrent la liste.\n\n",
         "| # | Fichier | Rôle |\n|---|---|---|\n"]
    for i, f in enumerate(js, 1):
        o.append('| %d | `%s` | %s |\n' % (i, f['file'], f['role'].replace('|', '/') or '—'))
    tot = sum(f['lines'] for f in js)
    o.append('\n**%d fichiers listés** (+ `src/boot.js`, chargeur). Les tailles et numéros de ligne ne sont volontairement pas affichés : ils changeraient à chaque modification et provoqueraient des conflits entre collaborateurs (retrouver un nom avec Grep).\n\n' % len(js))
    if unlisted:
        o.append('⚠ Fichiers de `src/` absents de `scripts.json` : %s\n\n' % ', '.join('`%s`' % u for u in unlisted))
    o.append('## Détail par fichier\n\n')
    byfolder = collections.OrderedDict()
    for f in js:
        byfolder.setdefault(os.path.dirname(f['file']), []).append(f)
    for folder, fs in byfolder.items():
        o.append('### `%s/`\n\n' % folder)
        for f in fs:
            o.append('**`%s`** — %s\n\n' % (os.path.basename(f['file']), f['role'] or '—'))
            if f['top']:
                names = ', '.join('`%s`' % t[0] for t in f['top'])
                o.append('- Définit : %s\n' % (names if len(names) < 900 else names[:900] + ' …'))
            groups = collections.OrderedDict()
            for owner, name, ln, kind in f['methods']:
                groups.setdefault((owner, kind), []).append(name)
            for (owner, kind), names in groups.items():
                lab = 'Méthodes ajoutées à `%s` (mixin)' % owner if kind == 'mixin' else 'Méthodes de la classe `%s`' % owner
                s = ', '.join('`%s`' % x for x in names)
                o.append('- %s : %s\n' % (lab, s if len(s) < 1200 else s[:1200] + ' …'))
            o.append('\n')
    outputs['fichiers.md'] = ''.join(o)

    # ------------------------------------------------------------------ symboles.md
    entries = []
    for f in js:
        for name, kind, ln in f['top']:
            entries.append((name, kind, f['file'], ln, ''))
        for owner, name, ln, k in f['methods']:
            entries.append((name, 'méthode', f['file'], ln, owner))
    entries.sort(key=lambda e: (e[0].lower(), e[2], e[3]))
    o = [HEADER, "# Index des symboles\n\nCherchez un nom (Ctrl+F) pour savoir où il est défini. « méthode » = méthode ajoutée à une classe de scène par `mixin(...)` (ou méthode de la classe elle-même).\n\n",
         "| Nom | Type | Fichier | Appartient à |\n|---|---|---|---|\n"]
    for name, kind, file, ln, owner in entries:
        o.append('| `%s` | %s | `%s` | %s |\n' % (name, kind, file, ('`%s`' % owner) if owner else ''))
    o.append('\n%d symboles.\n' % len(entries))
    outputs['symboles.md'] = ''.join(o)

    # ------------------------------------------------------------------ donnees.md
    data_files = [f for f in walk('src/data', ('.js',))]
    o = [HEADER, "# Ids de données\n\nOù est défini chaque élément de contenu (carte d'amélioration, relique, compétence, boss, niveau, succès…). Source : `id:'…'` dans `src/data/`.\n\n"]
    total = 0
    for f in data_files:
        ids = []
        for n, line in enumerate(read(f).split('\n'), 1):
            for m in RE_ID.finditer(line):
                ids.append((m.group(1), n))
        if not ids:
            continue
        total += len(ids)
        o.append('## `%s` (%d)\n\n' % (f, len(ids)))
        o.append(', '.join('`%s`' % i for i, n in ids) + '\n\n')
    o.append('%d ids au total.\n' % total)
    outputs['donnees.md'] = ''.join(o)

    # ------------------------------------------------------------------ interface.md
    html_ids = re.findall(r'\bid="([^"]+)"', html)
    js_text = {f: t for f, t in corpus.items() if f.startswith('src/')}
    id_usage = collections.OrderedDict()
    for hid in html_ids:
        pat = re.compile(r"""['"`]%s['"`]|#%s(?![\w-])|\bid="%s\"|getElementById\(\s*['"]%s['"]""" % ((re.escape(hid),) * 4))
        files = [f for f, t in js_text.items() if pat.search(t)]
        in_css = [c for c, t in css_text.items() if re.search(r'#%s(?![\w-])' % re.escape(hid), t)]
        id_usage[hid] = (files, in_css)
    dyn_ids = set(re.findall(r"""\.id\s*=\s*['"]([\w-]+)['"]""", big)) | set(re.findall(r"""id=\\?"([\w-]+)\\?\"""", '\n'.join(js_text.values()))) | set(re.findall(r"""setAttribute\(\s*['"]id['"]\s*,\s*['"]([\w-]+)['"]""", big))
    used_in_js = set(re.findall(r"""getElementById\(\s*['"]([\w-]+)['"]\s*\)""", '\n'.join(js_text.values()))) | set(re.findall(r"""(?<![\w.])\$\(\s*['"]([\w-]+)['"]\s*\)""", '\n'.join(js_text.values())))
    missing_ids = sorted(i for i in used_in_js if i not in html_ids and i not in dyn_ids)

    css_rules = {}
    keyframes = {}
    for cf in css_files:
        css_rules[cf], keyframes[cf] = parse_css(cf)
    o = [HEADER, "# Interface : HTML, CSS, assets\n\n"]
    o.append("## Ids du HTML (`index.html`) → qui les utilise\n\nUn id sans utilisation = texte/structure purement visuel ou reste d'un ancien écran (à vérifier).\n\n| Id | JS | CSS |\n|---|---|---|\n")
    for hid, (files, in_css) in id_usage.items():
        o.append('| `%s` | %s | %s |\n' % (hid, ', '.join('`%s`' % f[4:] for f in files) or '—', ', '.join('`%s`' % c for c in in_css) or '—'))
    o.append('\n')
    if missing_ids:
        o.append("### ⚠ Ids demandés par le JS mais absents du HTML (et jamais créés dynamiquement)\n\n%s\n\n" % ', '.join('`%s`' % i for i in missing_ids))
    # CSS : doublons internes, surcharges entre fichiers
    o.append("## CSS : sélecteurs définis plusieurs fois dans un même fichier\n\nSouvent des couches successives volontaires (« INTERFACE ALLÉGÉE » écrase les règles du haut), mais source de confusion.\n\n")
    for cf in css_files:
        seen = collections.OrderedDict()
        for sel, ctx, ln in css_rules[cf]:
            seen.setdefault((sel, ctx), []).append(ln)
        dups = [(k, v) for k, v in seen.items() if len(v) > 1]
        o.append('### `%s` : %d sélecteurs, %d définis plusieurs fois\n\n' % (cf, len(seen), len(dups)))
        for (sel, ctx), lns in dups:
            o.append('- `%s`%s : %d fois\n' % (sel[:120], (' (%s)' % ctx) if ctx else '', len(lns)))
        o.append('\n')
    a = {(s, c) for s, c, _ in css_rules['css/style.css']}
    b = {(s, c) for s, c, _ in css_rules['css/agp.css']}
    both = sorted(a & b)
    o.append('### Sélecteurs de `style.css` redéfinis par `agp.css` (%d)\n\n`agp.css` est chargé après : sa version gagne. Pour comprendre un style, lire les deux.\n\n' % len(both))
    o.append(', '.join('`%s`' % s[:60] for s, c in both) + '\n\n')
    # classes / ids CSS jamais référencés
    names = collections.OrderedDict()
    for cf in css_files:
        for sel, ctx, ln in css_rules[cf]:
            for m in re.finditer(r'\.([A-Za-z_][\w-]*)|#([A-Za-z_][\w-]*)', sel):
                nm = m.group(1) or m.group(2)
                if re.match(r'^[0-9a-f]{3,8}$', nm) and m.group(2): continue
                names.setdefault(nm, (cf, ln))
    non_css = '\n'.join(t for f, t in corpus.items() if not f.endswith('.py'))
    dead_css = sorted(n for n in names if not re.search(r'(?<![\w-])' + re.escape(n) + r'(?![\w-])', non_css))
    o.append('### Classes / ids CSS que ni le HTML ni le JS ne mentionnent (%d candidats)\n\nPeut aussi être une classe construite par concaténation de texte : vérifier avant de supprimer.\n\n' % len(dead_css))
    o.append(', '.join('`%s` (%s)' % (n, names[n][0].split('/')[-1]) for n in dead_css) + '\n\n')
    used_anim = lambda nm: any(re.search(r'(?<![\w-])%s(?![\w-])' % re.escape(nm), t.replace('@keyframes %s' % nm, '')) for t in list(css_text.values()) + [non_css])
    dead_kf = sorted(nm for cf in css_files for nm, _ in keyframes[cf] if not used_anim(nm))
    o.append('### @keyframes jamais utilisés (%d)\n\n%s\n\n' % (len(dead_kf), ', '.join('`%s`' % k for k in dead_kf) or '—'))
    # assets
    manifest = json.loads(read('assets/manifest.json'))
    bydir = collections.Counter(os.path.dirname(a) for a in manifest)
    o.append('## Assets (`assets/manifest.json`)\n\n' + ', '.join('`%s/` : %d' % (d, c) for d, c in sorted(bydir.items())) + '\n\n')
    no_comments = '\n'.join(l for l in big.split('\n') if not l.lstrip().startswith(('//', '*', '/*', '#')))
    refs = set(re.findall(r"""asset\(\s*['"]([^'"]+)['"]\s*\)""", no_comments))
    broken = sorted(r for r in refs if r not in manifest and re.search(r'\.\w{2,5}$', r))
    o.append('### ⚠ `asset(...)` qui visent un fichier absent du manifeste (%d)\n\n%s\n\n' % (len(broken), ', '.join('`%s`' % r for r in broken) or '—'))
    code_only = '\n'.join(t for f, t in corpus.items() if f.startswith('src/') or f == 'index.html') + '\n'.join(css_text.values())
    unref = []
    for a in manifest:
        base = os.path.splitext(os.path.basename(a))[0]
        keys = {base, re.sub(r'_\d+$', '', base)}
        if a.startswith('fonts/'):
            continue
        if not any(re.search(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', code_only) or (a in code_only) for k in keys):
            unref.append(a)
    o.append("### Assets dont le nom n'apparaît nulle part dans le code (%d candidats)\n\nLes sons enregistrés sont référencés par leur nom dans `audio/sfx-files.js`, les sprites par `asset('…')` ou par des clés de texture : vérifier avant de supprimer.\n\n" % len(unref))
    o.append(', '.join('`%s`' % a for a in unref) + '\n')
    outputs['interface.md'] = ''.join(o)

    # ------------------------------------------------------------------ audit.md
    o = [HEADER, "# Audit automatique : doublons, références cassées, candidats code mort\n\nRésultat brut du script : **à vérifier à la main** (analyse par expressions régulières, voir l'en-tête de `tools/gen_codemap.py`).\n\n"]
    # doublons de symboles
    byname = collections.defaultdict(list)
    for f in js:
        for name, kind, ln in f['top']:
            byname[name].append((f['file'], ln, kind))
    dup_top = {k: v for k, v in byname.items() if len(v) > 1}
    o.append('## Symboles de premier niveau définis dans plusieurs fichiers (%d)\n\nEn portée globale, la dernière définition écrase les autres (ou plante pour `const`/`class`).\n\n' % len(dup_top))
    for k, v in sorted(dup_top.items()):
        o.append('- `%s` : %s\n' % (k, ', '.join('`%s`' % a for a, b, _ in v)))
    o.append('\n')
    meth = collections.defaultdict(list)
    for f in js:
        for owner, name, ln, k in f['methods']:
            meth[(owner, name)].append((f['file'], ln))
    dup_m = {k: v for k, v in meth.items() if len(v) > 1}
    o.append('## Méthodes définies deux fois sur la même classe (%d)\n\n(`mixin` plante au démarrage dans ce cas : doit rester à 0.)\n\n' % len(dup_m))
    for (owner, name), v in sorted(dup_m.items()):
        o.append('- `%s.%s` : %s\n' % (owner, name, ', '.join('`%s`' % x[0] for x in v)))
    o.append('\n')
    # ids manquants et assets cassés (rappel)
    o.append('## Références cassées\n\n- Ids demandés au DOM mais inexistants : %s\n- `asset(...)` hors manifeste : %s\n\n' % (', '.join('`%s`' % i for i in missing_ids) or 'aucun', ', '.join('`%s`' % i for i in broken) or 'aucun'))
    # candidats code mort
    # une méthode appelée par un nom construit (ex. 'bossAI_' + id) n'apparaît qu'une fois : on l'écarte si son préfixe est cité entre guillemets
    def dyn_prefix(nm):
        return '_' in nm and re.search(r"['\"`]" + re.escape(nm.rsplit('_', 1)[0] + '_'), big) is not None
    dead_top, dead_m = [], []
    for f in js:
        for name, kind, ln in f['top']:
            if kind in ('fonction', 'const') and count_word(name) == 1:
                dead_top.append((name, kind, f['file'], ln))
        for owner, name, ln, k in f['methods']:
            if name not in ('constructor', 'create', 'update', 'init', 'preload') and count_word(name) == 1 and not dyn_prefix(name):
                dead_m.append((owner, name, f['file'], ln))
    o.append("## Candidats « code mort » : fonctions / constantes de premier niveau qui n'apparaissent qu'une fois (%d)\n\nUn nom présent une seule fois dans tout le dépôt (src, index.html, editor.html, tools) n'est appelé nulle part. Sauf appel par nom construit dynamiquement ou depuis la console.\n\n" % len(dead_top))
    for name, kind, file, ln in sorted(dead_top, key=lambda x: (x[2], x[3])):
        o.append('- `%s` (%s) — `%s`\n' % (name, kind, file))
    o.append("\n## Candidats « code mort » : méthodes jamais référencées par leur nom (%d)\n\n" % len(dead_m))
    for owner, name, file, ln in sorted(dead_m, key=lambda x: (x[2], x[3])):
        o.append('- `%s.%s` — `%s`\n' % (owner, name, file))
    o.append('\n')
    # outils et docs
    o.append('## Outils (`tools/`)\n\n')
    for t in walk('tools', ('.py', '.js', '.bat')):
        txt = read(t)
        first = ''
        if t.endswith('.py'):
            m = re.match(r'\s*(?:#![^\n]*\n)?\s*(?:"""|\'\'\')(.*?)(?:"""|\'\'\')', txt, flags=re.S)
            first = ' '.join(m.group(1).strip().split('\n')[0].split()) if m else ''
        elif t.endswith('.js'):
            m = re.match(r'(?:#![^\n]*\n)?\s*(?:/\*\*?(.*?)\*/|//\s*([^\n]*))', txt, flags=re.S)
            first = ' '.join(((m.group(1) or m.group(2) or '').strip().split('\n')[0]).split()) if m else ''
        first = first[:150] or '(script ponctuel, sans description)'
        o.append('- `%s` — %s\n' % (t, first))
    o.append('\n## Documents (`docs/`, racine)\n\n')
    for d in ['CLAUDE.md', 'PASSATION.md', 'README.md'] + walk('docs', ('.md',)):
        if d.startswith('docs/carte/'):
            continue
        txt = read(d)
        h = next((l.lstrip('# ').strip() for l in txt.split('\n') if l.startswith('#')), '')
        o.append('- `%s` — %s\n' % (d, h[:120]))
    outputs['audit.md'] = ''.join(o)

    # ------------------------------------------------------------------ écriture / contrôle
    stale = []
    os.makedirs(OUT, exist_ok=True)
    for name, content in outputs.items():
        path = os.path.join(OUT, name)
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
        if old != content:
            stale.append(name)
            if not check:
                with open(path, 'w', encoding='utf-8', newline='\n') as f:
                    f.write(content)
    if check:
        if stale:
            print('Carte du code périmée :', ', '.join(stale), '→ lancer : python3 tools/gen_codemap.py')
            sys.exit(1)
        print('Carte du code à jour.')
    else:
        print('docs/carte/ : %d fichiers (%s)' % (len(outputs), ', '.join(f'{n}: {len(c.splitlines())} l.' for n, c in outputs.items())))
        print('symboles : %d · fichiers JS : %d · lignes : %d · candidats code mort : %d fonctions/consts, %d méthodes' % (len(entries), len(js), tot, len(dead_top), len(dead_m)))


if __name__ == '__main__':
    main()
