"use strict";
// Textures procédurales : auras de bouclier, cristaux, planètes, nébuleuses, galaxies.

/* =========================================================
   BOUCLIER (aura qui épouse le vaisseau) + CRISTAUX XP
========================================================= */
const AURA_PAD = 60;

function mkCanvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function silhouetteOf(img, col){
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = col;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

function dilateSil(s, r, CW, CH){
  const c = mkCanvas(CW, CH), x = c.getContext('2d');
  for (const rr of [r, r*0.5]){
    for (let a = 0; a < 24; a++){
      const t = a/24*6.2832;
      x.drawImage(s, AURA_PAD + Math.cos(t)*rr, AURA_PAD + Math.sin(t)*rr);
    }
  }
  x.drawImage(s, AURA_PAD, AURA_PAD);
  return c;
}

function buildShieldAuraCanvas(img){
  const W = img.width, H = img.height, CW = W + AURA_PAD*2, CH = H + AURA_PAD*2;
  const out = mkCanvas(CW, CH), o = out.getContext('2d');
  const body = dilateSil(silhouetteOf(img, '#4ff2ff'), 13, CW, CH);
  if (typeof o.filter === 'string'){
    o.filter = 'blur(16px)'; o.globalAlpha = 0.8; o.drawImage(body, 0, 0); o.filter = 'none';
  } else {
    // Safari sans ctx.filter : halo via shadowBlur
    o.save();
    o.shadowColor = '#4ff2ff'; o.shadowBlur = 32; o.shadowOffsetX = 10000;
    o.globalAlpha = 0.9; o.drawImage(body, -10000, 0);
    o.restore();
  }
  o.globalAlpha = 0.3; o.drawImage(body, 0, 0);
  const w = silhouetteOf(img, '#e6ffff'), e = dilateSil(w, 13, CW, CH), e2 = dilateSil(w, 10, CW, CH), ex = e.getContext('2d');
  ex.globalCompositeOperation = 'destination-out'; ex.drawImage(e2, 0, 0);
  o.globalAlpha = 0.95; o.drawImage(e, 0, 0);
  o.globalAlpha = 1; o.globalCompositeOperation = 'destination-out';
  o.drawImage(img, AURA_PAD, AURA_PAD);
  return out;
}

const GEM_SS = 3; // supersampling des textures de cristaux

const GEM_KINDS = {
  gemS: { s:6.5, hi:'#c4fff4', mid:'#2fe0c0', lo:'#0c8a76', dk:'#06463c' }, // XP 2
  gemM: { s:7.5, hi:'#cfe8ff', mid:'#4aa3ff', lo:'#1b4fb0', dk:'#0d2a66' }, // XP 3-4
  gemL: { s:10,  hi:'#fff4b8', mid:'#ffc23d', lo:'#c0721a', dk:'#6b3a08' }, // boss, XP 6
};

const GEM_SPARK = [0, 0.4, 0.75, 1];

function gemCell(k){ return Math.ceil(GEM_KINDS[k].s*GEM_SS*4.6) + 2; }

function drawGemFacets(x, cx, cy, s, p, spark){
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, s*2.3);
  g.addColorStop(0, p.mid + '88'); g.addColorStop(1, p.mid + '00');
  x.save(); x.globalAlpha = 0.62; x.fillStyle = g; x.fillRect(cx - s*2.3, cy - s*2.3, s*4.6, s*4.6); x.restore();
  const P = { T:[0,-1], UR:[.64,-.38], LR:[.52,.5], B:[0,1], LL:[-.52,.5], UL:[-.64,-.38], C:[0,-.05] };
  const f = (a, b, col)=>{
    x.fillStyle = col; x.beginPath();
    for (const [i, k] of [[a,0],[b,1],['C',2]]){ const q = P[i]; x[k ? 'lineTo' : 'moveTo'](cx + q[0]*s, cy + q[1]*s); }
    x.closePath(); x.fill();
  };
  f('T','UL',p.hi); f('T','UR',p.mid); f('UL','LL',p.mid); f('UR','LR',p.lo); f('LL','B',p.lo); f('LR','B',p.dk);
  x.strokeStyle = p.dk; x.globalAlpha = 0.7; x.lineWidth = Math.max(0.6, s*0.06); x.beginPath();
  ['T','UR','LR','B','LL','UL'].forEach((i, n)=> x[n ? 'lineTo' : 'moveTo'](cx + P[i][0]*s, cy + P[i][1]*s));
  x.closePath(); x.stroke(); x.globalAlpha = 1;
  if (spark > 0.05){
    const gx = cx - .26*s, gy = cy - .5*s, r = s*.4*spark;
    x.fillStyle = 'rgba(255,255,255,' + spark + ')'; x.beginPath();
    x.moveTo(gx, gy-r); x.lineTo(gx+r*.22, gy-r*.22); x.lineTo(gx+r, gy); x.lineTo(gx+r*.22, gy+r*.22);
    x.lineTo(gx, gy+r); x.lineTo(gx-r*.22, gy+r*.22); x.lineTo(gx-r, gy); x.lineTo(gx-r*.22, gy-r*.22);
    x.closePath(); x.fill();
  }
}

function buildGemStripCanvas(k){
  const p = GEM_KINDS[k], cell = gemCell(k), c = mkCanvas(cell*GEM_SPARK.length, cell), x = c.getContext('2d');
  GEM_SPARK.forEach((a, i)=> drawGemFacets(x, i*cell + cell/2, cell/2, p.s*GEM_SS, p, a));
  return c;
}

const HEAL_ROWS = [ ".A.A.", "AAAAA", ".AAA.", "..A.." ];

const HEAL_PAL = { A:0xff4f6d };

const DRONE_SAT_ROWS = [ ".A.", "AAA", ".A." ];

const DRONE_SAT_PAL = { A:0x38c6ff };

/* =========================================================
   FONDS DE ZONE — planètes + nébuleuses générées en canvas,
   un thème de couleurs différent tiré au hasard entre chaque boss
========================================================= */
const BG_ZONES = [
  { name:'Nébuleuse Rouge',  planet:'#ff6b4a', ring:null,      neb:'255,90,70'  },
  { name:'Champ Glacé',      planet:'#6ecbff', ring:'#bfe8ff', neb:'90,170,255' },
  { name:'Jungle Toxique',   planet:'#6bff8a', ring:null,      neb:'70,255,140' },
  { name:'Désert Violet',    planet:'#c07bff', ring:'#8a4fff', neb:'170,90,255' },
  { name:'Forge Stellaire',  planet:'#ffd76a', ring:'#ff9f45', neb:'255,190,80' },
  { name:'Abysse Profond',   planet:'#4f6fff', ring:null,      neb:'60,90,255'  },
  { name:'Nébuleuse du Cœur', planet:'#a3324f', ring:null,     neb:'150,30,60', w:0.3, egg:true }, // rare, clin d'œil discret
];

function hexShade(hex, amt){
  const n = parseInt(hex.slice(1),16);
  let r = (n>>16) + amt, g = ((n>>8)&255) + amt, b = (n&255) + amt;
  r = Math.max(0,Math.min(255,r)); g = Math.max(0,Math.min(255,g)); b = Math.max(0,Math.min(255,b));
  return 'rgb('+r+','+g+','+b+')';
}

function buildPlanetCanvas(radius, baseColor, ringColor){
  const size = Math.ceil(radius*(ringColor ? 3.8 : 2.8));
  const c = mkCanvas(size, size), ctx = c.getContext('2d');
  const cx = size/2, cy = size/2;
  // anneau : UN SEUL tracé complet sous la planète (donc continu aux pointes, sans coupure ni bande),
  // puis la moitié avant est redessinée uniquement SUR le disque de la planète pour passer devant elle.
  const ringStroke = (c2, half)=>{
    c2.translate(cx,cy); c2.rotate(-0.35); c2.scale(1,0.3);
    c2.beginPath(); c2.arc(0,0, radius*1.55, 0, half ? Math.PI : Math.PI*2);
    c2.strokeStyle = ringColor; c2.lineWidth = radius*0.22; c2.stroke();
  };
  if (ringColor){
    const back = mkCanvas(size, size); ringStroke(back.getContext('2d'), false);
    ctx.save(); ctx.globalAlpha = 0.88; ctx.drawImage(back, 0, 0); ctx.restore();
  }
  const grad = ctx.createRadialGradient(cx-radius*0.35, cy-radius*0.35, radius*0.08, cx, cy, radius);
  grad.addColorStop(0, hexShade(baseColor, 90));
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1, hexShade(baseColor, -90));
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fillStyle = grad; ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.clip();
  // bandes/taches en dégradé radial (pas en aplat) pour qu'elles se fondent
  // dans la sphère au lieu de ressortir comme des découpes nettes
  for (let i=0;i<5;i++){
    const bx = cx+(Math.random()-0.5)*radius*1.4, by = cy+(Math.random()-0.5)*radius*1.4;
    const bw = radius*(0.35+Math.random()*0.3), bh = radius*(0.1+Math.random()*0.1);
    const ang = Math.random()*Math.PI;
    ctx.save();
    ctx.translate(bx,by); ctx.rotate(ang); ctx.scale(1, bh/bw);
    const bg = ctx.createRadialGradient(0,0,0, 0,0, bw);
    bg.addColorStop(0, 'rgba(0,0,0,0.22)');
    bg.addColorStop(0.7, 'rgba(0,0,0,0.10)');
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(0,0,bw,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  // léger ombrage global côté opposé à la lumière pour arrondir le volume en douceur
  const shade = ctx.createRadialGradient(cx+radius*0.45, cy+radius*0.45, 0, cx+radius*0.45, cy+radius*0.45, radius*1.1);
  shade.addColorStop(0, 'rgba(0,0,0,0.22)');
  shade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shade;
  ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.fill();
  ctx.restore();
  if (ringColor){
    const front = mkCanvas(size, size); ringStroke(front.getContext('2d'), true); // demi-ellipse du bas
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.clip();          // visible seulement sur la planète
    ctx.globalAlpha = 0.88; ctx.drawImage(front, 0, 0);
    ctx.restore();
  }
  return c;
}

function buildNebulaCanvas(w, h, rgb){
  const c = mkCanvas(w, h), ctx = c.getContext('2d');
  // blobs tenus bien à l'intérieur du canvas pour que leur dégradé ait fini de
  // s'éteindre avant d'atteindre un bord (sinon le bord devient une arête visible)
  for (let i=0;i<6;i++){
    const x = w*(0.3+Math.random()*0.4), y = h*(0.3+Math.random()*0.4);
    const r = Math.min(w,h)*(0.14+Math.random()*0.14);
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0, 'rgba('+rgb+',0.30)');
    g.addColorStop(1, 'rgba('+rgb+',0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  // filet de sécurité: force quand même l'alpha à 0 sur une bande au bord du
  // canvas, au cas où un blob déborderait malgré tout
  const img = ctx.getImageData(0,0,w,h);
  const d = img.data, feather = Math.min(w,h)*0.22;
  for (let y=0;y<h;y++){
    for (let x=0;x<w;x++){
      const distEdge = Math.min(x, w-1-x, y, h-1-y);
      if (distEdge < feather){
        const i = (y*w+x)*4;
        d[i+3] = Math.round(d[i+3] * (distEdge/feather));
      }
    }
  }
  ctx.putImageData(img,0,0);
  return c;
}

function buildGalaxyCanvas(size){
  const c = mkCanvas(size,size), ctx = c.getContext('2d');
  const cx=size/2, cy=size/2;
  // halo central
  const halo = ctx.createRadialGradient(cx,cy,0,cx,cy,size*0.5);
  halo.addColorStop(0,'rgba(255,255,255,0.85)');
  halo.addColorStop(0.15,'rgba(255,255,255,0.32)');
  halo.addColorStop(0.5,'rgba(255,255,255,0.05)');
  halo.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = halo; ctx.fillRect(0,0,size,size);
  // bras spiralés en points lumineux
  const arms = 3;
  for (let a=0;a<arms;a++){
    for (let i=0;i<260;i++){
      const t = i/260;
      const ang = a*(Math.PI*2/arms) + t*5.2;
      const r = t*size*0.46;
      const x = cx + Math.cos(ang)*r + (Math.random()-0.5)*size*0.05*t;
      const y = cy + Math.sin(ang)*r + (Math.random()-0.5)*size*0.05*t;
      const rad = 1 + Math.random()*3.2*(1-t*0.6);
      const g = ctx.createRadialGradient(x,y,0,x,y,rad*2.4);
      g.addColorStop(0,'rgba(255,255,255,'+(0.55*(1-t*0.5))+')');
      g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,rad*2.4,0,Math.PI*2); ctx.fill();
    }
  }
  return c;
}

function buildShockRingCanvas(size){
  const c = mkCanvas(size,size), ctx = c.getContext('2d');
  const cx=size/2, cy=size/2;
  const g = ctx.createRadialGradient(cx,cy,size*0.34,cx,cy,size*0.5);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(0.7,'rgba(255,255,255,0.9)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
  return c;
}
