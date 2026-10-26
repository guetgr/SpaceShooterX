"use strict";
// Icônes d'interface en pixel art (12x12, dessinées par tools/gen_ui_icons.py) : elles remplacent les glyphes / émojis de l'interface.
//   uiIco('lock', 12)  -> HTML <img> prêt à insérer dans un innerHTML (12 px dans le texte, 24 px pour un bouton : multiples entiers)
//   <i data-ico="pause" data-s="24"></i> dans index.html : rempli au démarrage par uiIconsInit()
// Dans Phaser (textes du canevas) : textures 'uiFrag' et 'uiStar' (BootScene).
const UI_ICONS = {};
['frag', 'lock', 'check', 'skull', 'star', 'pause', 'gear', 'galaxy', 'arrow_l', 'arrow_r', 'next', 'pip_on', 'pip_off', 'trophy', 'hand']
  .forEach(n=>{ UI_ICONS[n] = asset('sprites/ui_' + n + '.png'); });

function uiIco(name, px){
  const s = px || 12;
  return '<img class="uii" alt="" draggable="false" src="' + UI_ICONS[name] + '" style="width:' + s + 'px;height:' + s + 'px">';
}

function uiIconsInit(root){
  (root || document).querySelectorAll('[data-ico]').forEach(el=>{ el.innerHTML = uiIco(el.dataset.ico, +el.dataset.s || 12); el.removeAttribute('data-ico'); });
}
