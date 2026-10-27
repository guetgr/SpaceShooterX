"use strict";
// Méthodes de GameScene — JEU DE LUMIÈRES des boss (voyants, radar, gyrophare). Les définitions sont dans data/boss-lights.js.
// Usage : `const L = this.blInit('meteo')` à la création du boss, `this.blUpdate(L, delta, { toWorld, solid, S, visible, tint })` à chaque image, `this.blDestroy(L)` à la fin.
//   toWorld(sx, sy) -> [x, y] du jeu ; solid(sx, sy) -> vrai si le sprite a encore de la matière là (une pièce arrachée emporte ses voyants) ; S = échelle du sprite ; tint = [r, g, b] pour forcer la couleur (surchauffe).
mixin(GameScene, {
  blInit(key, depth){
    if (!this.textures.exists('lightDot')){          // petite tache de lumière douce, teintée ensuite par chaque voyant
      const c = this.textures.createCanvas('lightDot', 64, 64), g = c.context, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); c.refresh();
    }
    const list = (BOSS_LIGHTS[key] || []).map(L=>{
      const s = this.add.image(0, 0, L.m === 'spin' ? L.tex : 'lightDot').setDepth(depth || 5.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      if (L.m !== 'spin' && L.col) s.setTint(Phaser.Display.Color.GetColor(L.col[0], L.col[1], L.col[2]));
      return { L, s, ang:Phaser.Math.FloatBetween(0, 6.283) };
    });
    return { list, f:0 };
  },
  blUpdate(obj, delta, ctx){
    if (!obj) return; obj.f += delta/16.667;
    obj.list.forEach(o=>{
      const L = o.L, s = o.s; let v = 1;
      if (L.m === 'pulse') v = 0.55 + 0.45*Math.sin((obj.f + L.ph)*6.283/L.p);
      else if (L.m === 'blink') v = ((obj.f + L.ph) % L.p) < L.p*0.55 ? 1 : 0.22;
      else if (L.m === 'strobe') v = ((obj.f + L.ph) % L.p) < L.p*0.12 ? 1 : 0.12;
      const on = ctx.visible !== false && (!ctx.solid || ctx.solid(L.x, L.y));
      if (!on){ s.setAlpha(0); return; }
      const [x, y] = ctx.toWorld(L.x, L.y), tint = ctx.tint;
      if (L.m === 'spin'){ o.ang += L.speed*delta/16.667*(ctx.spin || 1); s.setPosition(x, y).setRotation(o.ang).setScale(L.size*ctx.S/256).setAlpha(L.a*(ctx.alpha === undefined ? 1 : ctx.alpha)); if (tint) s.setTint(Phaser.Display.Color.GetColor(tint[0], tint[1], tint[2])); }
      else { s.setPosition(x, y).setScale(L.r*ctx.S*2/64*(0.8 + 0.5*v)).setAlpha(L.a*v*(ctx.alpha === undefined ? 1 : ctx.alpha)); if (tint) s.setTint(Phaser.Display.Color.GetColor(tint[0], tint[1], tint[2])); }
    });
  },
  blDestroy(obj){ if (obj){ obj.list.forEach(o=> o.s.destroy()); obj.list = []; } },
});
