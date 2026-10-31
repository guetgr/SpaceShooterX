#!/usr/bin/env node
// Génère docs/rd-ameliorations.md : tableau d'équilibrage des améliorations R&D et atelier (data/rd.js).   node tools/rd_table.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..');
const ctx = vm.createContext({ console });
['data/player-stats.js', 'data/rd.js'].forEach(f=> vm.runInContext(fs.readFileSync(path.join(R, 'src', f), 'utf8'), ctx, { filename:f }));
const U = vm.runInContext('RD_UPGRADES', ctx), price = (u, n)=> vm.runInContext('rdPrice', ctx)(u, n), cap = (u, w)=> vm.runInContext('rdCap', ctx)(u, w), inv = (u, L)=> vm.runInContext('rdInvested', ctx)(u, L);
const GROUP = { canon:'CANON', carcasse:'CARCASSE', bouclier:'BOUCLIER', propulseurs:'PROPULSEURS', aimant:'ATELIER · AIMANT', ordinateur:'ATELIER · ORDINATEUR DE BORD' };
let out = '# Améliorations R&D et atelier — tableau d\'équilibrage\n\n> Généré par `node tools/rd_table.js` depuis `src/data/rd.js`. **Valeurs PROVISOIRES** (à régler avec `tools/sim_balance.py`).\n> Plafond = 4 × (secteur atteint − secteur de déblocage + 1), secteur 9 au plus ; `max` borne les valeurs entières. Prix du niveau n : linéaire `c0 × (1 + 0,15 (n−1))`, géométrique pour les valeurs entières.\n\n';
let total = 0;
Object.keys(GROUP).forEach(g=>{
  out += '## ' + GROUP[g] + '\n\n| Amélioration | Secteur | Effet de base | 1er achat | Après 4 achats | Max au secteur 9 | Prix niv. 1 | Prix niv. 4 | Coût total au max |\n|---|---|---|---|---|---|---|---|---|\n';
  U.filter(u=> u.group === g).forEach(u=>{
    const c9 = cap(u, 9), c = inv(u, c9); total += c;
    out += '| ' + [u.name, u.from, u.desc.replace(/\|/g, '/'), u.show(1), u.show(Math.min(4, c9)), u.show(c9) + ' (niv. ' + c9 + ')', price(u, 1) + ' ◆', price(u, Math.min(4, c9)) + ' ◆', c + ' ◆'].join(' | ') + ' |\n';
  });
  out += '\n';
});
out += '**Coût cumulé de toutes les améliorations au plafond du secteur 9 : ' + total + ' ◆.**\n\n';
out += '## Économie\n\n- Gain par partie estimé (à vérifier) : prime AGP 10 à 30 ◆ + composants ramassés (petit ennemi 15 % × 1 ◆, lourd 3 ◆, boss de fin d\'ordre 12 gros × 5 ◆) ≈ 50 à 150 ◆.\n- Les niveaux 1 des améliorations du secteur 1 coûtent 5 à 8 ◆ : une partie perdue paie déjà plusieurs achats.\n- Les valeurs entières (perforation, charges d\'esquive, choix d\'atouts, relances) montent plus vite en prix et s\'arrêtent à leur `max` : pas d\'achat sans effet.\n';
fs.writeFileSync(path.join(R, 'docs/rd-ameliorations.md'), out);
console.log('docs/rd-ameliorations.md écrit (' + total + ' ◆ au total)');
