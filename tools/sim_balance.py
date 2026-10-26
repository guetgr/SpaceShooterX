#!/usr/bin/env python3
"""Simulateur d'équilibrage des niveaux : un joueur automatique joue les niveaux en avance rapide (~60x le temps réel), sans affichage ni son.

  python tools/sim_balance.py grid     [--seeds 6] [--budgets 0,150,400,1000,2500] [--levels w1-l1,w2-l3] [--jobs 4]
        → taux de victoire de chaque niveau pour des arbres de plus en plus investis (puissance du joueur FIXE)
  python tools/sim_balance.py tune     [--seeds 8] [--levels ...] [--jobs 4]
        → cherche le réglage fin (hpMul = dmgMul) de chaque niveau pour qu'un joueur AU BON NIVEAU DE PUISSANCE (courbe TARGET_BUDGET) gagne du premier coup
          dans ~80 % des cas (~55 % pour un boss) ; affiche les valeurs à reporter dans src/data/worlds/*.js
  python tools/sim_balance.py campaign [--reps 6] [--jobs 4]
        → un joueur qui progresse niveau par niveau (réessaie jusqu'à gagner, dépense ses fragments) : essais nécessaires, fragments, points d'arbre
  Options communes : --skill casual|average|expert   --policy attaque|defense   --report docs/equilibrage-niveaux.md

Prérequis : pip install playwright. Le bot (tools/sim/bot.js) est un outil de test : il juge bien la difficulté relative, pas la sensation humaine.
Tout est déterministe (graine) : mêmes arguments = mêmes résultats."""
import argparse, functools, http.server, json, multiprocessing as mp, os, statistics, sys, threading, time

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS = { 'casual':{ 'sens':0.8, 'noise':0.3, 'react':9 }, 'average':{ 'sens':1.0, 'noise':0.12, 'react':6 }, 'expert':{ 'sens':1.3, 'noise':0.05, 'react':3 } }
RESET_KEYS = ['ssx_achv_v1', 'ssx_bestiary_v1', 'ssx_codex_v1', 'ssx_bossbag_v1', 'ssx_worlds_v1', 'ssx_pacts_v1', 'ssx_leaderboard_v1', 'ssx_highscore_v1']
# Puissance attendue du joueur en arrivant à chaque niveau, en fragments dépensés dans l'arbre (≈ points d'arbre : 150◆=16 pts, 400◆=29, 1000◆=58, 2500◆=124),
# et taux de victoire visé au premier essai. C'est la COURBE DE DIFFICULTÉ voulue : à modifier ici si l'on veut un jeu plus dur ou plus facile.
TARGET_BUDGET = { 'w1-l1':0, 'w1-l2':55, 'w1-l3':95, 'w1-l4':130, 'w1-l5':190, 'w2-l1':270, 'w2-l2':350, 'w2-l3':420, 'w2-l4':500, 'w2-l5':650,
                  'w3-l1':750, 'w3-l2':850, 'w3-l3':950, 'w3-l4':1070, 'w3-l5':1290 }
TARGET_WIN = { 'boss':0.55, 'normal':0.80 }
_W = {}


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def _init():
    from playwright.sync_api import sync_playwright
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(_Quiet, directory=R))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    pw = sync_playwright().start()
    try: b = pw.chromium.launch(channel='chrome', args=['--autoplay-policy=no-user-gesture-required'])
    except Exception: b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 420, 'height': 760})
    p.route('**/phaser.min.js', lambda r: r.fulfill(path=os.path.join(R, 'vendor', 'phaser.min.js')))
    p.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    url = 'http://127.0.0.1:%d/index.html' % srv.server_address[1]
    p.goto(url)
    p.evaluate("localStorage.clear(); localStorage.setItem('ssx_muted','1'); localStorage.setItem('ssx_music_muted','1')")
    p.reload()
    p.wait_for_function('window.__ssxScene && window.__ssxScene.scene.isActive("home")', timeout=90000)
    p.wait_for_timeout(800)
    p.evaluate(open(os.path.join(R, 'tools', 'sim', 'bot.js'), encoding='utf-8').read())
    p.evaluate('__sim.prepare()')
    _W['p'] = p


def _fresh(budget, policy):
    """Remet à zéro toutes les sauvegardes qui fausseraient une mesure, puis achète un arbre de `budget` fragments."""
    p = _W['p']
    p.evaluate("(()=>{ %s.forEach(k=> localStorage.removeItem(k)); localStorage.setItem('ssx_meta_v2', JSON.stringify({fragments:%d, tree:{}, asc:0})); })()" % (json.dumps(RESET_KEYS), budget))
    return p.evaluate("__sim.buy(%s)" % json.dumps(policy))


def _grid_task(a):
    level, budget, seed, skill, policy = a
    p = _W['p']
    info = _fresh(budget, policy)
    meta = p.evaluate("localStorage.getItem('ssx_meta_v2')")
    p.evaluate("localStorage.setItem('ssx_meta_v2', %s)" % json.dumps(meta))
    r = p.evaluate("__sim.runLevel(%s, %d, %s)" % (json.dumps(level), seed, json.dumps(SKILLS[skill])))
    r.update(level=level, budget=budget, seed=seed, points=info['points'])
    return r


def _campaign_task(a):
    rep, skill, policy, max_attempts = a
    p = _W['p']
    p.evaluate("(()=>{ %s.forEach(k=> localStorage.removeItem(k)); localStorage.setItem('ssx_meta_v2', JSON.stringify({fragments:0, tree:{}, asc:0})); })()" % json.dumps(RESET_KEYS))
    levels = p.evaluate("WORLDS.flatMap(w=> w.levels.map(l=> l.id))")
    out, total_frags, t_play = [], 0, 0.0
    for lv in levels:
        attempts, win, first = 0, None, None
        pts0 = p.evaluate("treeTotalPoints(getMeta().tree)")
        while attempts < max_attempts:
            attempts += 1
            r = p.evaluate("__sim.runLevel(%s, %d, %s)" % (json.dumps(lv), 1000*rep + 17*attempts + len(out), json.dumps(SKILLS[skill])))
            if first is None: first = r
            total_frags += r['frags']; t_play += r['time']
            bought = p.evaluate("__sim.buy(%s)" % json.dumps(policy))
            if r['win']: win = r; break
        out.append({ 'level':lv, 'attempts':attempts, 'won':win is not None, 'points':bought['points'], 'pts0':pts0, 'frags_total':total_frags, 'time_play':round(t_play), 'last':win or r, 'first':first })
        if win is None: break                     # bloqué : on s'arrête là
    return { 'rep':rep, 'levels':out }


def _tune_task(a):
    level, seed0, seeds, skill, policy, base = a
    p = _W['p']
    budget = TARGET_BUDGET[level]
    is_boss = p.evaluate("levelById(%s).type === 'boss'" % json.dumps(level))
    target = TARGET_WIN['boss' if is_boss else 'normal']
    def rate(x):
        wins = 0; tot_t = 0
        for i in range(seeds):
            _fresh(budget, policy)
            meta = p.evaluate("localStorage.getItem('ssx_meta_v2')")
            p.evaluate("(()=>{ const l = levelById(%s); l.hpMul = %f; l.dmgMul = %f; })()" % (json.dumps(level), x, x))
            r = p.evaluate("__sim.runLevel(%s, %d, %s)" % (json.dumps(level), seed0 + i, json.dumps(SKILLS[skill])))
            wins += 1 if r['win'] else 0; tot_t += r['time']
        return wins/seeds, tot_t/seeds
    lo, hi, hist = 0.3, 4.0, []                       # plus x est grand, plus le niveau est dur : on cherche x tel que rate(x) ≈ cible
    for _ in range(7):
        mid = (lo*hi) ** 0.5
        w, t = rate(mid); hist.append((round(mid, 2), w, round(t)))
        if w > target: lo = mid
        else: hi = mid
    best = min(hist, key=lambda h: (abs(h[1] - target), abs(h[0] - 1)))
    return { 'level':level, 'budget':budget, 'target':target, 'x':best[0], 'win':best[1], 'time':best[2], 'hist':hist }


def cmd_tune(a):
    p0 = mp.get_context('spawn').Pool(1, initializer=_init)
    levels = a.levels.split(',') if a.levels else p0.apply(_levels); p0.close()
    t = time.time()
    with _pool(a.jobs) as pool: res = pool.map(_tune_task, [(lv, 500 + 37*i, a.seeds, a.skill, a.policy, 1.0) for i, lv in enumerate(levels)], chunksize=1)
    print('(réglage en %.0f s)' % (time.time() - t))
    lines = ['niveau   puissance  cible  réglage(hpMul=dmgMul)  victoire  durée   (essais : x→victoire)']
    for r in res:
        lines.append('%-8s %7d◆  %4d%%  %12.2f           %4d%%  %4ds   %s' % (r['level'], r['budget'], 100*r['target'], r['x'], 100*r['win'], r['time'], ' '.join('%.2f→%d%%' % (h[0], 100*h[1]) for h in r['hist'])))
    print('\n'.join(lines))
    return { 'mode':'tune', 'lines':lines, 'res':res }


def _pool(jobs):
    return mp.get_context('spawn').Pool(jobs, initializer=_init)


def cmd_grid(a):
    p0 = mp.get_context('spawn').Pool(1, initializer=_init); levels = a.levels.split(',') if a.levels else None
    if not levels:
        # liste des niveaux : on la demande à une page (évite de dupliquer les données)
        levels = p0.apply(_levels); p0.close()
    budgets = [int(x) for x in a.budgets.split(',')]
    tasks = [(lv, b, 1 + s, a.skill, a.policy) for lv in levels for b in budgets for s in range(a.seeds)]
    t = time.time()
    with _pool(a.jobs) as pool: res = pool.map(_grid_task, tasks, chunksize=1)
    print('(%d parties en %.0f s)' % (len(res), time.time() - t))
    rows = {}
    for r in res: rows.setdefault((r['level'], r['budget']), []).append(r)
    head = 'niveau   ' + ''.join('%9s' % ('◆' + str(b)) for b in budgets)
    lines = [head]
    for lv in levels:
        cells = []
        for b in budgets:
            rs = rows[(lv, b)]; w = sum(1 for r in rs if r['win'])
            cells.append('%4d%% %3.0fs' % (100*w/len(rs), statistics.mean(r['time'] for r in rs)))
        lines.append('%-8s ' % lv + ''.join('%9s' % c for c in cells))
    pts = {b: statistics.mean(r['points'] for r in res if r['budget'] == b) for b in budgets}
    lines.append('points d\'arbre ' + ''.join('%9d' % round(pts[b]) for b in budgets))
    print('\n'.join(lines))
    return { 'mode':'grid', 'lines':lines, 'rows':rows, 'levels':levels, 'budgets':budgets, 'points':pts }


def _levels():
    return _W['p'].evaluate("WORLDS.flatMap(w=> w.levels.map(l=> l.id))")


def cmd_campaign(a):
    tasks = [(rep, a.skill, a.policy, a.max_attempts) for rep in range(a.reps)]
    t = time.time()
    with _pool(a.jobs) as pool: res = pool.map(_campaign_task, tasks, chunksize=1)
    print('(%d campagnes en %.0f s)' % (len(res), time.time() - t))
    levels = [l['level'] for l in max(res, key=lambda r: len(r['levels']))['levels']]
    lines = ['niveau   essais(moy)  1er essai  pts avant  PV mini(1er essai)  durée(1er essai)  fragments(cumul)  temps de jeu(cumul)']
    for i, lv in enumerate(levels):
        rs = [r['levels'][i] for r in res if len(r['levels']) > i]
        att = [x['attempts'] for x in rs]
        lines.append('%-8s %8.1f  %8d%%  %8.0f  %16.2f  %14.0f s  %14.0f  %14d s' % (lv, statistics.mean(att), 100*sum(1 for x in att if x == 1)/len(att), statistics.mean(x['pts0'] for x in rs),
                     statistics.mean(x['first']['minHp'] for x in rs), statistics.mean(x['first']['time'] for x in rs), statistics.mean(x['frags_total'] for x in rs), statistics.mean(x['time_play'] for x in rs)))
    stuck = [r['rep'] for r in res if not r['levels'][-1]['won']]
    if stuck: lines.append('campagnes bloquées (max essais atteint) : %s' % stuck)
    print('\n'.join(lines))
    return { 'mode':'campaign', 'lines':lines, 'res':res }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('mode', choices=['grid', 'campaign', 'tune'])
    ap.add_argument('--seeds', type=int, default=6); ap.add_argument('--budgets', default='0,150,400,1000,2500'); ap.add_argument('--levels', default='')
    ap.add_argument('--reps', type=int, default=6); ap.add_argument('--max-attempts', type=int, default=10)
    ap.add_argument('--jobs', type=int, default=max(1, min(4, (os.cpu_count() or 2) - 1)))
    ap.add_argument('--skill', choices=list(SKILLS), default='average'); ap.add_argument('--policy', default='attaque', choices=['attaque', 'defense'])
    ap.add_argument('--report', default='')
    a = ap.parse_args()
    out = {'grid':cmd_grid, 'campaign':cmd_campaign, 'tune':cmd_tune}[a.mode](a)
    if a.report:
        with open(os.path.join(R, a.report) if not os.path.isabs(a.report) else a.report, 'a', encoding='utf-8') as f:
            f.write('\n### %s — joueur %s, achats « %s »\n```\n%s\n```\n' % (a.mode, a.skill, a.policy, '\n'.join(out['lines'])))


if __name__ == '__main__':
    main()
