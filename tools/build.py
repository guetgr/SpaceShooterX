#!/usr/bin/env python3
"""Fabrique les versions « un seul fichier HTML » du jeu (tout est embarqué : code, CSS, images, sons, polices).

  python tools/build.py                  -> dist/space-shooter-x.html      (production)
                                            dist/space-shooter-x-dev.html  (tout débloqué + bandeau rouge + outils de test)
  python tools/build.py --inline-phaser  -> embarque aussi Phaser (fonctionne sans internet ; ~1,2 Mo de plus)

En développement on n'a pas besoin de build : `serve.bat` sert directement les fichiers de src/.
Le build est pour publier (Play Store / Capacitor / test d'un fichier autonome).
"""
import base64, json, mimetypes, os, re, subprocess, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INLINE_PHASER = '--inline-phaser' in sys.argv
MIME = {'png': 'image/png', 'webp': 'image/webp', 'jpg': 'image/jpeg', 'mp3': 'audio/mpeg', 'woff2': 'font/woff2'}


def read(rel, mode='r'):
    with open(os.path.join(R, rel), mode, **({} if 'b' in mode else {'encoding': 'utf-8'})) as f:
        return f.read()


def data_uri(rel):
    return 'data:%s;base64,%s' % (MIME[rel.rsplit('.', 1)[1]], base64.b64encode(read('assets/' + rel, 'rb')).decode())


# --- CSS (polices embarquées en base64) ---
css = re.sub(r"url\('\.\./assets/([^']+)'\)", lambda m: 'url(' + data_uri(m.group(1)) + ')', read('css/style.css'))

# --- assets ---
manifest = json.loads(read('assets/manifest.json'))
asset_js = 'const __ASSETS = {\n' + ',\n'.join('  %s: %s' % (json.dumps(a), json.dumps(data_uri(a))) for a in manifest) + '\n};\n' \
    "function asset(p){ const v = __ASSETS[p]; if (!v) throw new Error('asset inconnu : ' + p); return v; }\n"

# --- code : tous les fichiers de src/scripts.json collés dans une seule fonction (comme avant le découpage) ---
scripts = json.loads(read('src/scripts.json'))
code = '\n'.join(re.sub(r'^"use strict";\n', '', read('src/' + f), count=1) for f in scripts)
js = '(function(){\n"use strict";\n' + asset_js + code + '\n})();'

# --- page ---
shell = read('index.html')
head, rest = shell.split('<link rel="stylesheet" href="css/style.css">')
head = head.replace('<script src="vendor/phaser.min.js"></script>',
                    '<script>' + read('vendor/phaser.min.js') + '</script>' if INLINE_PHASER
                    else '<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js"></script>')
body = rest.split('<script src="src/boot.js"></script>')[0].replace('</head>\n', '', 1)
page = head + '<style>\n' + css + '\n</style>\n</head>\n' + body.lstrip('\n') + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'

DEV_LINE = re.compile(r'const DEV_SEE_ALL = [^\n]*')
assert DEV_LINE.search(page), 'DEV_SEE_ALL introuvable'
prod = DEV_LINE.sub('const DEV_SEE_ALL = false;', page, count=1)
dev = DEV_LINE.sub('const DEV_SEE_ALL = true;', page, count=1)
dev = re.sub(r'<title>(.*?)</title>', lambda m: '<title>' + m.group(1) + ' — DEV</title>', dev, count=1)
dev = dev.replace('<body>', '<body><div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#c00;color:#fff;font:bold 11px monospace;text-align:center;padding:1px;pointer-events:none">BUILD DEV — tout débloqué + outils de test</div>', 1)

os.makedirs(os.path.join(R, 'dist'), exist_ok=True)
for name, txt in (('space-shooter-x.html', prod), ('space-shooter-x-dev.html', dev)):
    with open(os.path.join(R, 'dist', name), 'w', encoding='utf-8', newline='\n') as f:
        f.write(txt)
    print('dist/%s : %.2f Mo' % (name, len(txt.encode('utf-8')) / 1e6))

# --- vérification de syntaxe (si Node est installé) ---
chk = os.path.join(R, 'dist', 'chk.js')
with open(chk, 'w', encoding='utf-8') as f:
    f.write(js)
try:
    r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    print('syntaxe : OK' if r.returncode == 0 else 'syntaxe : ERREUR\n' + r.stderr)
    sys.exit(r.returncode)
except FileNotFoundError:
    print('(Node absent : vérification de syntaxe ignorée)')
finally:
    try: os.remove(chk)
    except OSError: pass
