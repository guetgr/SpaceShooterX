"use strict";
// Registre commun au jeu et à l'éditeur. Les anciens JSON restent valides.
(function(root){
  const formations = { random:'Libre', line:'Ligne', column:'Colonne', star:'Étoile' };
  const fields = {
    spread:{ min:24,max:300,def:160 }, x:{ min:0,max:100,def:50 }, y:{ min:0,max:80,def:0 },
    alert:{ min:1,max:20,int:true }, minAlert:{ min:1,max:20,int:true }, tier:{ min:1,max:4,int:true },
    hpMul:{ min:0.1,max:10,def:1 }, dmgMul:{ min:0.1,max:10,def:1 }, speedMul:{ min:0.1,max:10,def:1 }
  };
  function valid(w){
    if (!w || typeof w!=='object' || Array.isArray(w)) return false;
    const allowed=['type','at','count','spacing','formation',...Object.keys(fields)];
    if (Object.keys(w).some(k=>!allowed.includes(k)) || !Number.isFinite(w.at) || w.at<0 || w.at>3600 || !Number.isInteger(w.count) || w.count<1 || w.count>100 || !Number.isFinite(w.spacing) || w.spacing<0 || w.spacing>60) return false;
    if ('formation' in w && !Object.hasOwn(formations,w.formation)) return false;
    return Object.entries(fields).every(([k,r])=>!(k in w) || (Number.isFinite(w[k]) && w[k]>=r.min && w[k]<=r.max && (!r.int || Number.isInteger(w[k]))));
  }
  function point(w,i){
    const n=w.count, s=w.spread===undefined?160:w.spread, f=w.formation||'random';
    if (n===1) return {dx:0,dy:0};
    const t=i/(n-1)-0.5;
    if (f==='line') return {dx:t*s,dy:0};
    if (f==='column') return {dx:0,dy:t*s};
    if (f==='star'){
      const a=-Math.PI/2+Math.PI*2*i/n, r=s/2*(i%2?0.45:1);
      return {dx:Math.cos(a)*r,dy:Math.sin(a)*r};
    }
    // Répartition stable de l'aperçu ; le runtime garde le hasard pour le mode libre.
    return {dx:(((i*0.61803398875)%1)-0.5)*s,dy:(((i*0.38196601125)%1)-0.5)*s*0.5};
  }
  root.WavePatterns={formations,fields,valid,point};
})(typeof globalThis!=='undefined'?globalThis:this);
