"use strict";
// Disposition de l'éditeur (chargé AVANT app.js : les nœuds sont déplacés, jamais recréés, donc tous les identifiants et gestionnaires restent valables).
//  - plus de colonnes à gauche et à droite : la bibliothèque des créatures, l'inspecteur et la simulation du robot forment une bande compacte au-dessus de la timeline,
//    à la place de l'ancien aperçu de formation (masqué, mais gardé dans la page : le code de la timeline y écrit encore) ;
//  - la timeline prend 80 % de la largeur, le laboratoire 20 % (avec le tableau des parties en dessous) ; le choix de mission est dans l'en-tête de la zone de travail.
(function(){
  const $ = id=> document.getElementById(id), q = s=> document.querySelector(s);
  const div = cls=> { const d = document.createElement('div'); d.className = cls; return d; };
  const comp = $('compositionPanel'), stage = $('previewStage'), lib = q('.library-sidebar'), right = q('aside.right');
  if (!comp || !stage || !lib || !right) return;
  const pick = q('.mission-picker'); pick.open = true; q('.mission-heading').insertBefore(pick, $('missionMode'));
  const band = div('tools-band'); band.id = 'toolsBand';
  const colLib = div('band-col band-lib'), colInsp = div('band-col band-insp'), colBot = div('band-col band-bot');
  colLib.append($('library'), q('.sidebar-foot'));
  colInsp.append($('inspector'));
  colBot.append(q('.lab-panel'), q('.keyboard-help'));
  $('labDock').append($('runsPanel'));
  band.append(colLib, colInsp, colBot);
  comp.insertBefore(band, stage);
  lib.remove(); right.remove();
})();
