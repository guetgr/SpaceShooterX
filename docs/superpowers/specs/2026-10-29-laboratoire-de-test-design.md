# Laboratoire de test des niveaux (tâche 8 de l'éditeur)

Date : 29 octobre 2026. Auteurs : Guet + Claude. Statut : **design à valider**, rien n'est codé.
Références : `docs/editeur-niveaux.md`, `docs/editor-studio.md`, `docs/superpowers/specs/2026-10-27-progression-design.md` (§3.2 composants), `src/data/composants.js`.

Légende : **[Guet]** = décidé par Guet · **[Claude]** = choix de Claude, à relire.

## 1. Intention

Paufiner un niveau demande de le rejouer vite avec le bon équipement, sans refaire toute la progression, et de comparer les résultats. Aujourd'hui `?dev` débloque tout (donc trop fort) et `?sandbox` ne donne aucun cadre. On veut un **laboratoire de test** qui place le testeur dans la situation d'un vrai joueur à ce point du jeu (budget de composants réaliste), lui laisse composer son équipement, garde chaque partie avec son équipement, et affiche le tout dans l'éditeur pour régler le niveau.

## 2. Objectifs

1. **[Guet]** Lancer le laboratoire depuis l'accueil normal du jeu.
2. **[Guet]** Choisir librement l'équipement avant chaque partie (atelier Mk I à V, technologies emportées) et relancer vite en le modifiant.
3. **[Guet]** Un budget de composants ◆ par niveau, égal à ce qu'un joueur a pu récolter aux niveaux précédents. Le testeur dépense à sa guise ; l'écran affiche le coût total de son équipement par rapport à ce budget.
4. **[Guet]** Chaque partie est enregistrée avec son résultat et son équipement ; l'éditeur (`editor.html`) affiche ces parties par niveau.
5. **[Guet]** Choisir la version du niveau à jouer : la version publiée par défaut, ou une version de l'historique de l'éditeur.

## 3. Hors périmètre et anti-objectifs

- Pas de comparaison automatique brouillon contre publié (l'ancien libellé de la tâche 8) : l'historique + le tableau des parties suffisent.
- Pas d'équilibrage, pas de changement de mécaniques, des valeurs de drop, ni de format de sauvegarde (`SAVE_KEYS` inchangées). Une partie test **ne touche jamais** la vraie sauvegarde du joueur.
- Pas dans le build du Play Store **[Claude]** : le laboratoire n'existe qu'avec le serveur de développement local (`tools/serve.py`, ping `/__editor/ping`). Sans serveur, le bouton n'apparaît pas.
- Échec à éviter : un joueur normal voit un bouton de test, ou une partie test écrit dans `ssx_*`.

## 4. Le budget de composants

**[Guet]** Chaque niveau se joue avec une « configuration de base » et un budget de composants ◆ censé avoir été récolté sur tous les niveaux précédents (ordre de `src/data/levels/index.json`, tuto compris).

- **Tuto** : budget 0. Tout reste équipable pour tester, mais l'indicateur dit « vous jouez avec 0 ◆ d'amélioration ».
- **Niveau N** : somme, pour chaque niveau précédent, de sa valeur de composants. Valeur affichée : le coût de l'équipement choisi, face au budget (par exemple « 340 / 420 ◆ »). **[Claude]** Le dépassement est permis pour tester, signalé en couleur d'alerte.
- **Pièces de secteur** (lentilles, bobines, etc.) **[Claude]** : même principe, affichées à part si l'équipement en consomme ; à confirmer au code (voir §9).

### Source de la valeur d'un niveau précédent (par ordre de priorité)

1. **[Guet]** Si le testeur a joué ce niveau en laboratoire : la **moyenne** des composants réellement encaissés (`composantsBank(...).total`, c'est-à-dire après la franchise de 30 % en cas de défaite, prime comprise en cas de victoire). **[Guet]** Les **abandons en cours de partie sont exclus** de la moyenne. Défaites et victoires comptent.
2. Sinon **la fourchette calculée** à partir des données du niveau (valeurs de `COMP` dans `composants.js`) :
   - **min** : vagues garanties et boss seulement, petits ennemis au taux `dropChance` (15 %), ennemis lourds à `heavySmall`, boss en gros composants, prime ;
   - **max** : chaque ennemi lâche (petits à 100 %), pools aléatoires compris ;
   - **[Claude]** pour les pools tirés au hasard (pas de nombre fixe), le max utilise une estimation par la durée et le rythme d'apparition ; à confirmer avec `sim_balance.py` ou le calcul direct (voir §9). Le budget affiche alors « min à max » et un niveau suivant utilise le **milieu** de cette fourchette pour fixer la jauge **[Claude]**.

Le calcul est du code de lecture seule : il lit `COMP` et les JSON de niveaux, il ne modifie aucune valeur de drop.

## 5. Parcours

1. **Accueil normal** : un bouton LABORATOIRE (visible seulement avec le serveur local **[Claude]**). Le mode utilise une sauvegarde en mémoire, comme `?sandbox`, jamais la vraie.
2. **Choix du niveau** : liste des 16 missions. Pour chacune : sélecteur de version (« Publiée » ou une entrée de l'historique de l'éditeur, nom et date).
3. **Écran d'équipement** : budget du niveau (source et valeur), puis les réglages de l'atelier et des technologies emportées, avec le coût cumulé. **[Claude]** Réutiliser les écrans et règles du garage et de la R&D existants (`src/home/garage.js`, `src/ui/rd-ui.js`) en les alimentant par un état de test, plutôt que d'en écrire de nouveaux. Dernier équipement par niveau rappelé, pour relancer en un clic.
4. **Partie** : `GameScene` avec la définition du niveau choisi, comme une mission normale.
5. **Fin** : la partie est enregistrée (§6) ; l'écran de rapport habituel s'affiche avec un retour direct au laboratoire pour changer l'équipement et rejouer.

## 6. Données enregistrées par partie

**[Guet]** Validé : issue (victoire / défaite / abandon), durée (temps tenu, ou temps jusqu'au boss), PV restants et dégâts subis, dégâts infligés et ennemis tués, cartes et reliques choisies. S'y ajoutent **[Claude]** : composants encaissés (`bank.total`), niveau et version jouée (publiée ou id de l'historique), équipement complet (postes de l'atelier, technologies et rangs), budget et coût au lancement, date.

Les compteurs existent déjà dans `GameScene` (`runDamage`, `runKills`, `runComposants`, `elapsed`…) ; les dégâts subis et les choix de cartes sont à relever au même endroit.

## 7. Stockage et éditeur

- **[Claude]** Les parties sont stockées côté serveur local, à côté de l'historique des versions (`.editor-history`, ignoré par Git), via de nouvelles routes de `tools/serve.py` protégées comme les routes de l'éditeur (`editor_guard`). Choix : les deux pages (accueil et éditeur) partagent l'origine, mais un fichier serveur survit à un navigateur vidé et sépare ces données de la progression.
- **[Guet]** `editor.html` affiche, par niveau, un tableau de parties triable : une ligne = résultat à côté de l'équipement et de la version jouée. **[Claude]** Filtres par version et par issue, et moyennes (durée, dégâts, ◆) en pied de tableau. Les parties abandonnées sont visibles mais marquées et exclues des moyennes.

## 8. Contraintes techniques

- Ne pas modifier mécaniques, équilibrage ni logique des compétences ; aucun nouveau format de sauvegarde (`CLAUDE.md`).
- Règle des clés de niveau (registre + validateur + éditeur) : aucune clé de niveau n'est ajoutée.
- `mixin` plante sur les doublons : grep avant d'ajouter une méthode ; tout nouveau fichier va dans `src/scripts.json` ; relancer `gen_codemap.py`.
- Tests à ajouter : calcul de budget (fourchette, moyenne, exclusion des abandons) en Node ; enregistrement et lecture côté serveur ; un test navigateur du parcours (lancer, finir, retrouver la ligne dans l'éditeur).

## 9. Laissé au constructeur

- Le coût exact d'un équipement : lire les coûts de `src/data/atelier.js` et `src/data/techs.js`.
- Vérifier au code si les pièces de secteur entrent dans le budget et dans le coût.
- Comment injecter dans `GameScene` une définition de niveau d'une version de l'historique (le jeu lit les JSON publiés ; un pont existe pour l'éditeur : `?edit=play|bot`).
- Forme précise de l'écran d'équipement et du tableau.

## 10. Précisions après relecture (appels de Claude, à relire)

1. **Coût d'un équipement** : prix cumulé en ◆ pour atteindre cette configuration depuis la base (Mk atteints, technologies recherchées et rangs), pas seulement le prix du dernier achat. Le laboratoire part donc d'un état de test « tout acheté à zéro » où le testeur choisit des niveaux d'amélioration ; une fonction de coût lit `atelier.js` / `techs.js`. Le garage et la R&D sont réutilisés pour l'affichage, sans modifier leurs règles.
2. **Le budget est indicatif** : jauge et alerte, aucun achat bloqué.
3. **Équipement rappelé** : rejoué tel quel, même si le budget a changé depuis ; la jauge indique le dépassement.
4. **Version du niveau** : chaque partie enregistre l'identifiant de la version (ou « publiée ») et un hachage du document de niveau joué, pour rester lisible si l'historique change.
5. **Fourchette des pools** : calcul direct à partir des données (durée, rythme d'apparition), pas de bot ; `sim_balance.py` hors périmètre.
6. **Rejouer** : le rapport propose « REJOUER » (même équipement, même version) en plus du retour au laboratoire.
7. **Abandon** : enregistré quand on quitte par le menu pause. Fermer l'onglet n'enregistre rien.
8. **Entrée de test** : le bouton de l'accueil et un drapeau d'URL `?lab` (même mode, pour les tests Playwright).
