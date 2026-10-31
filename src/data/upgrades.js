"use strict";
// Cartes d'amélioration en cours de partie (UPGRADE_POOL).

const UPGRADE_POOL = [
  { id:'firerate', icon:'⚡', name:'CADENCE+', desc:'Tire 15% plus vite', max:Infinity, category:'weapon',
    apply:(s)=>{ s.fireRate *= 0.85; } },
  { id:'damage', icon:'💥', name:'DEGATS+', desc:'+20% de dégâts par tir', max:Infinity, category:'weapon',
    apply:(s)=>{ s.damage *= 1.20; } },
  { id:'speed', icon:'🚀', name:'REACTEURS', desc:'Vaisseau plus réactif', max:Infinity, category:'engine',
    apply:(s)=>{ s.moveResponsiveness += 2.6; } },
  { id:'magnet', icon:'🧲', name:'AIMANT', desc:'Attire les cristaux de plus loin', max:Infinity, category:'utility',
    apply:(s)=>{ s.magnetRadius += 30; } },
  { id:'life', icon:'❤', name:'BLINDAGE+', desc:'+20 PV max (soigne aussi)', max:Infinity, category:'defense',
    apply:(s)=>{ s.maxHp += 20; } },
  { id:'shield', icon:'🛡', name:'BOUCLIER', desc:'+30 PV de bouclier (se régénère seul avec le temps)', max:Infinity, category:'defense',
    apply:(s)=>{ s.shieldMax += 30; } },
  { id:'pierce', icon:'➡', name:'PERFORANT', desc:'Les tirs traversent 1 ennemi de plus', max:Infinity, category:'weapon',
    apply:(s)=>{ s.pierce += 1; } },
  { id:'bulletspeed', icon:'✨', name:'VELOCITE', desc:'Projectiles plus rapides', max:Infinity, category:'weapon',
    apply:(s)=>{ s.bulletSpeed *= 1.18; } },
];
