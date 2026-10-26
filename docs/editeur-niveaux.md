# Éditeur de niveaux

Outil de conception pour régler la **justesse** des niveaux : réglages en direct, test à la main, test par joueur automatique, export dans le dépôt.
Ouvrir <http://localhost:8080/editor.html> (serveur : `py tools/serve.py 8080`). Pas fait pour la prod (`editor.html` est dans `.vercelignore`).

## Utilisation
1. Choisir un niveau à gauche (le tuto est en premier). Le centre liste ses réglages (curseur + champ ; la valeur d'origine s'affiche en orange avec ↺ quand elle est modifiée).
2. **▶ TESTER** lance le niveau dans l'aperçu (iframe `?edit=play`). Pour le tuto, les réglages agissent **en direct** pendant la partie ; pour les autres niveaux, au prochain TESTER.
3. **🤖 LANCER** fait jouer le bot N parties (iframe cachée `?edit=bot`, `tools/sim/bot.js`) : taux de victoire vs cible (tuto 90 %, normal 80 %, boss 55 %, bande ±12), durée, PV mini, coups reçus, finition moyenne, durée de chaque étape du tuto. Profil : débutant / moyen / expert ; « arbre ◆ » = puissance du joueur (fragments dépensés dans l'arbre).
4. **💾 EXPORTER** écrit `src/data/tuning.js` (via `tools/serve.py`, POST `/__editor/save` ; sans serveur : le fichier est téléchargé). Recharger le jeu pour le voir.

## Où sont les réglages
| Fichier | Rôle |
|---|---|
| `src/data/tuning-defaults.js` | Valeurs par défaut du tuto (`TUTO_DEFAULTS`), écrit à la main. |
| `src/data/tuning.js` | **Généré** : `TUNING_OVERRIDES` = seulement ce qui diffère (tuto + niveaux : `threat`, `goal`, `hpMul`, `dmgMul`, `reward`). |
| `src/data/tuning-apply.js` | Fusionne défauts + surcharges : `TUTO_TUNE` (lu par `game/tuto.js`), niveaux de `WORLDS` modifiés en place ; `applyTuning(ov)`. |
| `src/dev/editor-hook.js` | Pont jeu ↔ éditeur (postMessage), actif seulement avec `?edit`. |
| `src/data/completion.js` | Finition en % : poids et récompenses lus dans `TUTO_TUNE`. |

Les iframes utilisent `?sandbox` (sauvegarde **en mémoire**, voir `src/boot.js`) : tester ou lancer le bot n'abîme pas la progression.
Ajouter un réglage au tuto : l'ajouter à `TUTO_DEFAULTS`, le lire via `TUTO_TUNE` dans `tuto.js`, puis une ligne dans `TUTO_SCHEMA` (`editor.html`).

## Limites
- Le bot juge la difficulté relative, pas le plaisir de jeu. Il tourne dans la page : l'éditeur se fige quelques secondes à chaque partie simulée.
- Seuls les nombres sont exportés (le serveur refuse tout le reste). Les événements et listes d'ennemis des niveaux ne sont pas encore éditables.
