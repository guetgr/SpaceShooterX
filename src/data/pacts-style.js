"use strict";
// Pactes, rangs de style, collection (codex).

// PACTES: des règles plus dures pour la prochaine partie, en échange de plus de fragments à la fin
// RANG DE STYLE (façon Tony Hawk): le combo de kills fait monter le rang, qui multiplie les points de chaque kill.
// Les seuils (en kills de combo) grandissent un peu avec le niveau d'alerte, car on tue de plus en plus vite.
const STYLE_RANKS = [
  { l:'D',   n:0,   name:'DISMAL',        col:'#9aa4c8' },
  { l:'C',   n:8,   name:'CRAZY',         col:'#9fe8ff' },
  { l:'B',   n:20,  name:'BADASS',        col:'#7fffa0' },
  { l:'A',   n:45,  name:'APOCALYPTIC',   col:'#ffd76a' },
  { l:'S',   n:90,  name:'SAVAGE',        col:'#ff9a3c' },
  { l:'SS',  n:180, name:'SICK SKILLS',   col:'#ff6b81' },
  { l:'SSS', n:360, name:'SMOKIN\' STYLE', col:'#ff4de0' },
];

// le RANG DE STYLE multiplie l'XP gagnée tant que le combo dure (x1 en D, jusqu'à x10 en SSS)
const STYLE_XP = [1, 1.5, 2, 3, 4, 6, 10];

const PACTS = [
  { id:'p_explosifs', icon:'💣', name:'MOBS EXPLOSIFS', desc:'Chaque ennemi tué explose et blesse le vaisseau s\'il est proche', bonus:0.25 },
  { id:'p_rapide',    icon:'⚡', name:'TIRS RAPIDES',   desc:'Les ennemis tirent plus souvent et leurs tirs vont plus vite', bonus:0.20 },
  { id:'p_fragile',   icon:'💔', name:'PEAU FRAGILE',   desc:'Tu démarres avec 40% de PV max en moins', bonus:0.25 },
  { id:'p_foule',     icon:'👥', name:'LA FOULE',       desc:'Beaucoup plus d\'ennemis à chaque vague', bonus:0.20 },
  { id:'p_sansshield',icon:'🚫', name:'SANS BOUCLIER',  desc:'Aucun bouclier cette partie', bonus:0.15 },
];

// COLLECTION: tout ce que tu as déjà obtenu un jour (reliques, cartes, fusions, compétences de l'arbre)
function getCodex(){
  try { const c = JSON.parse(localStorage.getItem('ssx_codex_v1') || 'null');
    if (c && typeof c === 'object') return { relics:c.relics||{}, cards:c.cards||{}, fusions:c.fusions||{}, skills:c.skills||{}, usedSkills:c.usedSkills||{} }; } catch(e){ /* ignore */ }
  return { relics:{}, cards:{}, fusions:{}, skills:{}, usedSkills:{} };
}

function setCodex(c){ try { localStorage.setItem('ssx_codex_v1', JSON.stringify(c)); } catch(e){ /* ignore */ } }

function getPacts(){ try { const a = JSON.parse(localStorage.getItem('ssx_pacts_v1') || '[]'); return Array.isArray(a) ? a.filter(id=>PACTS.some(p=>p.id===id)) : []; } catch(e){ return []; } }

function setPacts(a){ try { localStorage.setItem('ssx_pacts_v1', JSON.stringify(a)); } catch(e){ /* ignore */ } }

function pactBonus(ids){ return PACTS.filter(p=>ids.indexOf(p.id) >= 0).reduce((a,p)=>a+p.bonus, 0); }
