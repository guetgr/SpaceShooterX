"use strict";
// Génération d'une texture à partir de lignes de pixels.

/* =========================================================
   PIXEL ART TEXTURE BUILDER
========================================================= */
// rows: array of strings, same-ish length (auto padded with '.')
// palette: map char -> hex color (without '.')
function buildPixelTexture(scene, key, rows, palette, pixelSize){
  const w = Math.max(...rows.map(r=>r.length));
  const h = rows.length;
  const g = scene.make.graphics({ x:0, y:0, add:false });
  for (let y=0; y<h; y++){
    const row = rows[y].padEnd(w, '.');
    for (let x=0; x<w; x++){
      const c = row[x];
      if (c === '.' || c === undefined) continue;
      const color = palette[c];
      if (color === undefined) continue;
      g.fillStyle(color, 1);
      g.fillRect(x*pixelSize, y*pixelSize, pixelSize, pixelSize);
    }
  }
  g.generateTexture(key, w*pixelSize, h*pixelSize);
  g.destroy();
  return { w: w*pixelSize, h: h*pixelSize };
}
