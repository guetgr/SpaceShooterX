"use strict";
// Réglages globaux (mode DEV).

/* MODE DEV: mets `true` pour TOUT voir (arbre complet, bestiaire complet, collection complète). Laisser à `false` pour le vrai jeu. */
const DEV_SEE_ALL = /[?&]dev\b/.test(location.search);   // en local : ouvre index.html?dev ; les builds de production remplacent par false
