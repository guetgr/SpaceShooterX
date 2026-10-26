"use strict";
// JUICE — retour de sensation (« game feel ») centralisé. Trois outils, tous réglés ICI :
//   juiceStop(kind)         arrêt sur image très court (hit-stop) : le temps de jeu se fige ~50-110 ms sur les impacts qui comptent
//   juiceShake(power 0..1)  secousse de caméra proportionnelle à la force de l'événement ; une secousse faible n'écrase pas une forte en cours
//   juicePunch(sprite)      coup d'écrasement/étirement d'un sprite (élastique, 60-90 ms)
// Réglages : JUICE.hitstopMul / shakeMul / punchMul (0 = coupé, 1 = normal). ?nojuice dans l'URL ou localStorage ssx_juice = '0' coupe tout ; prefers-reduced-motion aussi.
const JUICE = {
  hitstopMul:1, shakeMul:1, punchMul:1, fireMul:1, sparkMul:1, numberMul:1, magnetMul:1, gemPitchMul:1,      // fireMul = flash de bouche + recul · sparkMul = étincelles d'impact · numberMul = chiffres de coup critique
  hitstop:{ playerHull:60, eliteKill:45, bossKill:110, bossPhase:85, bossSecond:95 },       // durées en ms (réelles)
  minGap:140,                 // délai minimum (ms) entre deux arrêts sur image, pour ne pas hacher le jeu quand les kills s'enchaînent (les boss passent toujours)
  freezeScale:0.04,           // vitesse du jeu pendant l'arrêt (0.04 = quasi figé)
  recoil:0.03,                // recul du vaisseau à chaque salve (écrasement en fraction de sa taille)
  magnet:{ windup:110, windupSpeed:70, ramp:380, minSpeed:110, maxSpeed:340, maxFast:520, swirl:170, swirlMs:420, trailMs:55 },      // cristaux : recul d'élan, accélération, spirale ; vitesses en px/s, durées en ms
  gemPitch:{ window:380, step:0.04, max:14 },      // ramassages enchaînés (moins de `window` ms entre deux) : +4 % de hauteur par cristal, jusqu'à `max` crans
  maxSparks:34, maxNumbers:8, // plafonds d'effets vivants à la fois (le jeu reste fluide pendant les gros combats)
  shake:{ minMs:50, spanMs:300, minI:0.002, spanI:0.012 },      // secousse : durée = minMs + p·spanMs, intensité = minI + p·spanI
};
(function(){
  let off = /[?&]nojuice\b/.test(location.search);
  try { if (localStorage.getItem('ssx_juice') === '0') off = true; } catch(e){ /* ignore */ }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) off = true;
  if (off){ JUICE.hitstopMul = JUICE.shakeMul = JUICE.punchMul = JUICE.fireMul = JUICE.sparkMul = JUICE.numberMul = JUICE.magnetMul = JUICE.gemPitchMul = 0; }
})();

mixin(GameScene, {
  // arrêt sur image : réutilise le ralenti du jeu (startSlowmo force) à très faible vitesse
  juiceStop(kind, ms){
    const m = JUICE.hitstopMul; ms = (ms !== undefined ? ms : (JUICE.hitstop[kind] || 0)) * m;
    if (ms < 16 || !this.running) return;
    const now = performance.now();
    if (this.slowmo && this.slowmo.until > now + ms) return;                             // un ralenti plus long est déjà en cours (dernier souffle)
    if (kind.indexOf('boss') !== 0 && now < (this._jStopEnd || 0) + JUICE.minGap) return;
    this._jStopEnd = now + ms;
    this.startSlowmo(ms, JUICE.freezeScale, true);
  },

  // secousse proportionnelle : power 0 (à peine) .. 1 (énorme). Ne remplace pas une secousse plus forte encore en cours.
  juiceShake(power){
    const m = JUICE.shakeMul; if (!m) return;
    const p = Math.max(0, Math.min(1, power)), now = performance.now(), S = JUICE.shake;
    if (now < (this._jShakeEnd || 0) && p < (this._jShakeP || 0)) return;
    const dur = S.minMs + p * S.spanMs;
    this._jShakeP = p; this._jShakeEnd = now + dur;
    this.cameras.main.shake(dur, (S.minI + p * S.spanI) * m);
  },

  // écrasement/étirement d'un sprite, de retour à sa taille d'origine ; ignoré si déjà en cours
  juicePunch(o, amt, ms){
    const m = JUICE.punchMul; if (!m || !o || !o.active || o._jp) return;
    const bx = o.scaleX, by = o.scaleY, a = (amt || 0.12) * m;
    o._jp = true;
    this.tweens.add({ targets:o, scaleX:bx * (1 + a), scaleY:by * (1 - a * 0.6), duration:(ms || 80) * 0.5, yoyo:true, ease:'Quad.easeOut',
      onComplete:()=>{ o._jp = false; if (o.active) o.setScale(bx, by); } });
  },

  // un ennemi (non boss) encaisse un tir : petit coup de punch
  juiceHit(e){ if (e.enemyType !== 'boss' && !e.isBossPart && e.hp > 0) this.juicePunch(e, 0.1, 70); },

  // un ennemi meurt : secousse et arrêt sur image selon son poids
  juiceKill(e, isBoss){
    if (isBoss){ this.juiceShake(0.7); this.juiceStop('bossKill'); return; }
    const big = e.enemyType === 'elite' || e.enemyType === 'tank';
    this.juiceShake(big ? 0.22 : 0.08);
    if (big) this.juiceStop('eliteKill');
  },

  // la coque du vaisseau est touchée : plus c'est gros, plus ça secoue et ça fige
  juiceHurt(amount){
    const f = Math.max(0.15, Math.min(1, amount / (this.stats.maxHp * 0.25)));
    this.juiceShake(0.35 + 0.35 * f);
    this.juiceStop('playerHull', JUICE.hitstop.playerHull * (0.6 + 0.4 * f));
    this.juicePunch(this.player, 0.14, 90);
  },
  /* ---------- tir et impacts ---------- */
  // texture d'un halo (flash de bouche, éclat d'impact), créée une seule fois
  juiceTex(){
    if (this.textures.exists('juiceFlash')) return;
    const c = this.textures.createCanvas('juiceFlash', 32, 32), g = c.context, gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.65)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); c.refresh();
  },
  _juiceKz(){ return Phaser.Math.Clamp(1 / this.cameras.main.zoom, 1, 2.4); },

  // à chaque salve : éclair à la bouche du canon + petit recul du vaisseau
  juiceFire(){
    if (!JUICE.fireMul || !this.player || !this.player.active) return;
    this.juiceTex();
    let f = this._jMuz;
    if (!f || !f.active){ f = this._jMuz = this.add.image(0, 0, 'juiceFlash').setDepth(5.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0xcff6ff); }
    const kz = this._juiceKz();
    this.tweens.killTweensOf(f);
    f.setPosition(this.player.x, this.player.y - 26).setAlpha(0.9 * JUICE.fireMul).setScale(0.5 * kz);
    this.tweens.add({ targets:f, alpha:0, scale:1.15 * kz, duration:75, ease:'Quad.easeOut' });
    this.juicePunch(this.player, JUICE.recoil, 60);
  },

  // une étincelle : trait lumineux projeté dans une direction
  juiceSpark(x, y, ang, len, col){
    if ((this._jSp || 0) >= JUICE.maxSparks) return;
    this._jSp = (this._jSp || 0) + 1;
    const kz = this._juiceKz(), s = this.add.rectangle(x, y, 7 * kz, 2 * kz, col).setDepth(6.2).setRotation(ang).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets:s, x:x + Math.cos(ang) * len * kz, y:y + Math.sin(ang) * len * kz, scaleX:0.2, alpha:0, duration:Phaser.Math.Between(110, 190), ease:'Quad.easeOut',
      onComplete:()=>{ this._jSp--; s.destroy(); } });
  },

  // un tir touche un ennemi : étincelles qui rebondissent à l'opposé du tir (cyan sur un bouclier), éclat, et chiffre doré si coup critique
  juiceImpact(b, e){
    const m = JUICE.sparkMul; if (!m) return;
    const vx = b.body ? b.body.velocity.x : 0, vy = b.body ? b.body.velocity.y : 80;
    const back = Math.atan2(-vy, -vx), shield = this.enemyShielded(e), laser = b.texture && b.texture.key === 'laser';
    const col = shield ? 0x7fe8ff : (laser ? 0x9ffaff : 0xffe9a0), n = b.crit ? 4 : 2;
    for (let i = 0; i < n; i++) this.juiceSpark(b.x, b.y, back + Phaser.Math.FloatBetween(-0.95, 0.95), Phaser.Math.Between(16, b.crit ? 46 : 34), col);
    if ((this._jSp || 0) < JUICE.maxSparks){
      this.juiceTex();
      const kz = this._juiceKz(), f = this.add.image(b.x, b.y, 'juiceFlash').setDepth(6.1).setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(0.3 * kz).setAlpha(0.85);
      this._jSp = (this._jSp || 0) + 1;
      this.tweens.add({ targets:f, scale:(b.crit ? 0.95 : 0.6) * kz, alpha:0, duration:90, onComplete:()=>{ this._jSp--; f.destroy(); } });
    }
    if (b.crit && JUICE.numberMul) this.juiceNumber(b.x, b.y - 8, b.damage);
  },

  // chiffre de dégâts qui éclate puis s'envole (coups critiques seulement : sinon l'écran serait noyé)
  juiceNumber(x, y, val){
    if ((this._jNum || 0) >= JUICE.maxNumbers) return;
    this._jNum = (this._jNum || 0) + 1;
    const kz = this._juiceKz();
    const t = this.add.text(x, y, String(Math.round(val)), { fontFamily:"'SSX Label',monospace", fontSize:Math.round(9 * kz) + 'px', color:'#ffe27a', stroke:'#2a1400', strokeThickness:Math.round(3 * kz) }).setOrigin(0.5).setDepth(13).setScale(0.3);
    this.tweens.add({ targets:t, scale:1.35, duration:90, ease:'Back.easeOut' });
    this.tweens.add({ targets:t, y:y - 30 * kz, x:x + Phaser.Math.Between(-10, 10) * kz, alpha:0, delay:140, duration:520, ease:'Quad.easeOut', onComplete:()=>{ this._jNum--; t.destroy(); } });
  },
  /* ---------- cristaux ---------- */
  // un cristal attiré : petit recul d'élan, puis il accélère vers le vaisseau en décrivant un arc, avec une traînée lumineuse. Si magnetMul = 0 : ancien mouvement.
  juiceMagnet(g, delta, fast){
    const p = this.player, dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy) || 1, M = JUICE.magnet;
    if (!JUICE.magnetMul){ this.physics.moveToObject(g, p, fast ? 430 : 260); return; }
    const t = g._mt = (g._mt || 0) + delta, nx = dx / d, ny = dy / d;
    let sp;
    if (t < M.windup) sp = -M.windupSpeed * (1 - t / M.windup);
    else { const k = Math.min(1, (t - M.windup) / M.ramp); sp = M.minSpeed + ((fast ? M.maxFast : M.maxSpeed) - M.minSpeed) * k * k; }
    const sw = (g.ph > 3.1416 ? 1 : -1) * M.swirl * Math.max(0, 1 - (t - M.windup) / M.swirlMs) * Math.min(1, d / 120);
    g.body.velocity.set(nx * sp - ny * sw, ny * sp + nx * sw);
    g._tr = (g._tr || 0) - delta;
    if (g._tr <= 0 && sp > 150 && (this._jSp || 0) < JUICE.maxSparks){
      g._tr = M.trailMs; this.juiceTex(); this._jSp = (this._jSp || 0) + 1;
      const kz = this._juiceKz(), c = GEM_KINDS[g.gemKind] ? parseInt(GEM_KINDS[g.gemKind].hi.slice(1), 16) : 0x9ffaff;
      const f = this.add.image(g.x, g.y, 'juiceFlash').setDepth(2.9).setBlendMode(Phaser.BlendModes.ADD).setTint(c).setScale(0.26 * kz).setAlpha(0.55);
      this.tweens.add({ targets:f, scale:0.07 * kz, alpha:0, duration:200, onComplete:()=>{ this._jSp--; f.destroy(); } });
    }
  },

  // hauteur du son de ramassage : monte à chaque cristal pris dans la foulée, retombe après une courte pause
  juiceGemRate(){
    const m = JUICE.gemPitchMul; if (!m) return 1;
    const P = JUICE.gemPitch, now = performance.now();
    this._gemChain = (now - (this._gemChainT || 0) < P.window) ? Math.min(P.max, (this._gemChain || 0) + 1) : 0;
    this._gemChainT = now;
    return 1 + this._gemChain * P.step * m;
  },
});
