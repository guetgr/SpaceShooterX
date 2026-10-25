"use strict";
// Icônes pixel : réduit les émojis en 16x16 avec contour.

// ----- ICONES PIXEL: chaque émoji est réduit à 16x16, ses couleurs sont réduites et un contour sombre est ajouté -----
const PX_CACHE = {};

function pxEmoji(ch){
  if (PX_CACHE[ch]) return PX_CACHE[ch];
  try {
    const N = 16, S = 64, big = document.createElement('canvas'); big.width = big.height = S;
    const g = big.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '50px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    g.fillText(ch, S/2, S/2 + 3);
    const sm = document.createElement('canvas'); sm.width = sm.height = N;
    const sg = sm.getContext('2d'); sg.imageSmoothingEnabled = true; sg.imageSmoothingQuality = 'high'; sg.drawImage(big, 0, 0, S, S, 0, 0, N, N);
    const d = sg.getImageData(0, 0, N, N), p = d.data;
    for (let i=0;i<p.length;i+=4){ if (p[i+3] < 110){ p[i+3] = 0; continue; } p[i+3] = 255; for (let k=0;k<3;k++) p[i+k] = Math.min(255, Math.round(p[i+k]/51)*51); }
    sg.putImageData(d, 0, 0);
    const out = document.createElement('canvas'); out.width = out.height = N + 2; const og = out.getContext('2d');
    const sil = document.createElement('canvas'); sil.width = sil.height = N; const sc = sil.getContext('2d');
    sc.drawImage(sm, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#0a0814'; sc.fillRect(0, 0, N, N);
    [[0,1],[2,1],[1,0],[1,2],[0,0],[2,2],[0,2],[2,0]].forEach(o=> og.drawImage(sil, o[0], o[1]));
    og.drawImage(sm, 1, 1);
    return (PX_CACHE[ch] = out.toDataURL());
  } catch(e){ return (PX_CACHE[ch] = ''); }
}

function pxImg(ch, size){ const u = pxEmoji(ch); return u ? '<img class="pxi" alt="" src="' + u + '" style="width:' + size + 'px;height:' + size + 'px">' : ch; }
