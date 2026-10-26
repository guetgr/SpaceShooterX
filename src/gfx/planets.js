"use strict";
// Planètes en pixel art générées en code (aucun fichier image) : sphère éclairée par le haut-gauche, relief ou bandes, palette propre à chaque monde.
// makePlanetTexture(scene, key, { size, seed, palette:[0xRRGGBB… du plus sombre au plus clair], freq, bands, rim }) → crée la texture `key` (une seule fois).

function _hash3(x, y, z, s){
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function _vnoise(x, y, z, s){
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf*xf*(3 - 2*xf), v = yf*yf*(3 - 2*yf), w = zf*zf*(3 - 2*zf);
  const c = (a, b, d)=> _hash3(xi + a, yi + b, zi + d, s), l = (p, q, t)=> p + (q - p)*t;
  return l(l(l(c(0,0,0), c(1,0,0), u), l(c(0,1,0), c(1,1,0), u), v), l(l(c(0,0,1), c(1,0,1), u), l(c(0,1,1), c(1,1,1), u), v), w);
}

function _fbm(x, y, z, s){
  let a = 0.5, f = 1, t = 0;
  for (let i = 0; i < 4; i++){ t += a * _vnoise(x*f, y*f, z*f, s + i*17); f *= 2; a *= 0.5; }
  return t / 0.9375;
}

// planète d'un monde, à la taille voulue : les mondes avec `theme.photo` (la Terre) réduisent cette image en pixel art, les autres sont générés en code.
// Même planète à l'accueil (carte, galaxie, fond des pages) et au décollage (game/intro.js).
function worldPlanetTexture(scene, world, size){
  const th = world.theme || {}, key = 'planet_' + world.id + (size === 96 ? '' : '_' + size);
  if (scene.textures.exists(key)) return key;
  if (th.photo && scene.textures.exists(th.photo)){
    const src = scene.textures.get(th.photo).getSourceImage(), tex = scene.textures.createCanvas(key, size, size), ctx = tex.getContext();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(src, 0, 0, size, size); tex.refresh();
    return key;
  }
  return makePlanetTexture(scene, key, { size, seed:th.seed || 1, freq:th.freq || 1.6, bands:th.bands || 0, rim:th.rim, palette:th.palette || [0x222244, 0x44448a, 0x8888cc] });
}

function makePlanetTexture(scene, key, o){
  if (scene.textures.exists(key)) return key;
  const S = o.size || 96, pal = o.palette.map(c=> [(c >> 16) & 255, (c >> 8) & 255, c & 255]);
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), d = img.data;
  const seed = o.seed || 1, freq = o.freq || 1.6, bands = o.bands || 0;
  const rim = o.rim ? [(o.rim >> 16) & 255, (o.rim >> 8) & 255, o.rim & 255] : [120, 200, 255];
  const L = [-0.55, -0.6, 0.58], ll = Math.hypot(L[0], L[1], L[2]); L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const bayer = [0, 2, 3, 1], ca = Math.cos(0.35), sa = Math.sin(0.35);
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++){
    const nx = (px + 0.5)/S*2 - 1, ny = (py + 0.5)/S*2 - 1, r2 = nx*nx + ny*ny;
    if (r2 > 1) continue;
    const nz = Math.sqrt(1 - r2), rx = nx*ca - ny*sa, ry = nx*sa + ny*ca;
    let v = _fbm(rx*freq + seed*3.1, ry*freq*(bands ? 0.35 : 1) + seed*1.7, nz*freq + seed*5.3, seed);
    if (bands) v = v*(1 - bands) + (0.5 + 0.5*Math.sin(ry*7 + v*5))*bands;
    const idx = Math.max(0, Math.min(pal.length - 1, Math.floor(v*pal.length)));
    const dif = Math.max(0, nx*L[0] + ny*L[1] + nz*L[2]);
    const dith = (bayer[(py & 1)*2 + (px & 1)]/4 - 0.375) * 0.18;
    const lit = Math.floor(Math.max(0, Math.min(0.999, dif*0.95 + 0.08 + dith)) * 5) / 4;       // 5 paliers de lumière
    const k = 0.22 + 0.85*lit;
    let r = pal[idx][0]*k, g = pal[idx][1]*k, b = pal[idx][2]*k;
    const e = Math.max(0, (r2 - 0.78)/0.22);                                                    // liseré d'atmosphère
    if (e > 0){ const m = e*e*0.7*(0.35 + dif); r += (rim[0] - r)*m; g += (rim[1] - g)*m; b += (rim[2] - b)*m; }
    const i4 = (py*S + px)*4;
    d[i4] = Math.min(255, r); d[i4 + 1] = Math.min(255, g); d[i4 + 2] = Math.min(255, b); d[i4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); tex.refresh();
  return key;
}
