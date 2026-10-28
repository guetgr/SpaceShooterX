"use strict";
// Événements aléatoires (EVENT_DEFS).

/* EVENEMENTS ALEATOIRES. GROS (sans small): programmés après chaque boss, un seul à la fois. PETITS (small:true): minuteur à part, n'importe quand, même par-dessus un gros événement; le boss bonus ne compte pas comme un vrai boss.
    Aucun événement avant le 1er boss; ensuite au moins 1 entre chaque boss, plus s'il y a le temps. min = niveau d'alerte minimal; w(alerte, pvBas) = poids de tirage; dur(alerte) = durée (ms);
   tickMs(alerte) + tick(scene, visibleX, visibleY) = effet répété; start(scene) = effet au démarrage. Pour en ajouter un: une entrée ici. */
const evRndX = (sc, m)=>{ const v = sc.visibleXRange(m||20); return Phaser.Math.Between(v.min, v.max); };

const EVENT_DEFS = {
  crystal:  { min:1, name:'PLUIE DE CRISTAUX', sub:'Ramasse tout ce que tu peux !', w:()=>7, dur:(a,sc)=>evDurRange(sc,'crystal'), tickMs:(a,sc)=>evParam(sc,'crystal','tickMs'),
              tick:(sc,vx,vy)=>{ const n = evParam(sc,'crystal','perTick'), big = evParam(sc,'crystal','bigChance'), f0 = evParam(sc,'crystal','fallMin'), f1 = evParam(sc,'crystal','fallMax'); for (let i=0;i<n;i++) sc.spawnGemAt(Phaser.Math.Between(vx.min, vx.max), vy.min - 10, Math.random() < big ? 6 : 3, Math.random() < big ? 'gemL' : 'gemM', Phaser.Math.Between(f0, f1)); } },
  meteors:  { min:1, name:'TEMPETE DE METEORITES', sub:'Esquive les rochers !', w:()=>7, dur:(a,sc)=>evDurRange(sc,'meteors'), tickMs:(a,sc)=>evParam(sc,'meteors','tickMs'),
              start:(sc)=>{ sc._meteorStyle = Phaser.Math.Between(0, 2); },          // une seule couleur par pluie (rouge, bleu ou violet)
              end:(sc)=>{ sc._meteorStyle = undefined; },
              tick:(sc,vx,vy)=>{ sc.spawnBgMeteor(); sc.spawnBgMeteor(); const n = evParam(sc,'meteors','perTick'), s0 = evParam(sc,'meteors','speedMin'), s1 = evParam(sc,'meteors','speedMax'); for (let i=0;i<n;i++){ const ang = Math.PI/2 + Phaser.Math.FloatBetween(-0.35, 0.35), spd = Phaser.Math.Between(s0, s1);
                                 sc.spawnMeteor(Phaser.Math.Between(vx.min, vx.max), vy.min - 30 - i*40, 2, Math.cos(ang)*spd, Math.sin(ang)*spd, sc._meteorStyle); } } },
  swarm:    { min:2, small:true, name:"MAREE D'ESSAIMS", sub:'Ils arrivent par dizaines !', w:()=>8, dur:(a,sc)=>evDur(sc,'swarm'), tickMs:(a,sc)=>evParam(sc,'swarm','tickMs'),
              tick:(sc,vx)=>{ if (sc.enemies.countActive(true) > ENEMY_CAP - 8) return; const n = evParam(sc,'swarm','perWave'), cx = evRndX(sc, 60), sp = Math.min(26, (vx.max-vx.min)/n);
                              for (let i=0;i<n;i++) sc.spawnOneEnemy('swarmer', Phaser.Math.Clamp(cx + (i-(n-1)/2)*sp, vx.min, vx.max)); } },
  mines:    { min:3, name:'CHAMP DE MINES', sub:'Ne les touche pas !', w:()=>7, dur:(a,sc)=>evDurRange(sc,'mines'), tickMs:(a,sc)=>evParam(sc,'mines','tickMs'),
              tick:(sc,vx,vy)=>{ const n = evParam(sc,'mines','perTick'); for (let i=0;i<n;i++) sc.deployMine(evRndX(sc, 30), vy.min + Phaser.Math.Between(60, 260)); } },
  goldrush: { min:2, small:true, name:'CIEL DE TRESORINS', sub:"Trois jackpots d'un coup !", w:()=>5, dur:(a,sc)=>evDur(sc,'goldrush'),
              start:(sc)=>{ const n = evParam(sc,'goldrush','count'), gap = evParam(sc,'goldrush','gapMs'); for (let i=0;i<n;i++) sc.time.delayedCall(i*gap, ()=>{ if (sc.running) sc.spawnGolden(true); }); } },
  kamikaze: { min:3, small:true, name:'ESCADRON KAMIKAZE', sub:'Ils foncent sur toi !', w:()=>7, dur:(a,sc)=>evDur(sc,'kamikaze'),
              // niveau d'alerte 5+: ils arrivent de n'importe où (haut, gauche, droite, bas); en dessous: une ligne par le haut
              start:(sc)=>{ const al = sc.alertLevel, n = evParam(sc,'kamikaze','count'), gap = evParam(sc,'kamikaze','gapMs'), omni = evParam(sc,'kamikaze','omniAlert'), v = sc.visibleXRange(40), vy = sc.visibleYRange(0);
                            for (let i=0;i<n;i++) sc.time.delayedCall(i*gap, ()=>{ if (!sc.running) return;
                              if (al < omni){ sc.spawnOneEnemy('kamikaze', v.min + (v.max-v.min)*(i+0.5)/n); return; }
                              const side = Phaser.Math.Between(0, 3); let x, y;
                              if (side === 0){ x = Phaser.Math.Between(v.min, v.max); y = vy.min + 50; }
                              else if (side === 1){ x = v.min + 30; y = Phaser.Math.Between(vy.min+100, vy.max-260); }
                              else if (side === 2){ x = v.max - 30; y = Phaser.Math.Between(vy.min+100, vy.max-260); }
                              else { x = Phaser.Math.Between(v.min, v.max); y = vy.max - 200; }
                              const e = sc.spawnOneEnemy('kamikaze', x);
                              if (e){ e.x = x; e.y = y; e.baseX = x; e.body.setVelocity(0, 0); e.kT = 3300; }          // il apparaît sur place puis passe tout de suite en alerte (clignote, verrouille, fonce)
                            }); } },
  spiders:  { min:4, name:"FORET D'ARAIGNEES", sub:'Elles surgissent de partout...', w:()=>7, dur:(a,sc)=>evDurRange(sc,'spiders'), tickMs:(a,sc)=>evParam(sc,'spiders','tickMs'),
              // pendant tout l'événement: SEULES des araignées apparaissent (plus aucun autre ennemi), en groupes de 5 au départ puis 3 par vague, sur les 4 côtés de l'écran
              start:(sc)=>{ sc._onlySpiders = true; const v = sc.visibleXRange(150); [0.2, 0.5, 0.8].forEach((f,k)=> sc.time.delayedCall(k*450, ()=>{ if (!sc.running) return; const cx = v.min + f*(v.max-v.min);
                              { const m = evParam(sc,'spiders','firstGroup'); for (let i=0;i<m;i++) sc.spawnOneEnemy('spider', cx + (i-(m-1)/2)*Phaser.Math.Between(40,56)); } })); },
              end:(sc)=>{ sc._onlySpiders = false; },
              tick:(sc,vx,vy,ev)=>{
                if (ev.t < 1500) return;
                const sides = [0,1,2,3]; Phaser.Utils.Array.Shuffle(sides);
                const cnt = evParam(sc,'spiders','perWave');
                for (let n=0;n<cnt;n++){
                  const side = sides[n % 4]; let x, y;
                  if (side === 0){ x = Phaser.Math.Between(vx.min+40, vx.max-40); y = vy.min + 80; }                           // haut
                  else if (side === 1){ x = vx.min + 34; y = Phaser.Math.Between(vy.min+120, vy.max-230); }                      // gauche
                  else if (side === 2){ x = vx.max - 34; y = Phaser.Math.Between(vy.min+120, vy.max-230); }                      // droite
                  else { x = Phaser.Math.Between(vx.min+40, vx.max-40); if (Math.abs(x - sc.player.x) < 90) x = Phaser.Math.Clamp(sc.player.x + (x < sc.player.x ? -120 : 120), vx.min+40, vx.max-40); y = vy.max - 190; }   // bas
                  const e = sc.spawnOneEnemy('spider', x);
                  if (e){ e.x = x; e.y = y; e.baseX = x; e.stopY = y; e.body.setVelocity(0, 0); }                               // elle apparaît sur place (animation de matérialisation)
                }
              } },
  elite:    { min:6, small:true, name:"ESCORTE D'ELITES", sub:'Une escouade blindée approche', w:()=>5, dur:(a,sc)=>evDur(sc,'elite'),
              start:(sc)=>{ const v = sc.visibleXRange(60), ne = evParam(sc,'elite','elites'), nh = evParam(sc,'elite','healers'); for (let i=0;i<ne;i++) sc.time.delayedCall(i*300, ()=>{ if (sc.running) sc.spawnOneEnemy('elite', v.min + (v.max-v.min)*(i+0.5)/ne); });
                            for (let i=0;i<nh;i++) sc.time.delayedCall(1200 + i*300, ()=>{ if (sc.running) sc.spawnOneEnemy('healer'); }); } },
  bombard:  { min:4, small:true, name:'BOMBARDEMENT', sub:'Fuis les cercles rouges !', w:(a)=>6 + a/2, dur:(a,sc)=>evDur(sc,'bombard'), tickMs:(a,sc)=>evParam(sc,'bombard','tickMs'),
              tick:(sc,vx,vy)=>{ const near = Math.random() < evParam(sc,'bombard','nearChance'), R = evParam(sc,'bombard','radius'), dmg = evParam(sc,'bombard','damage');
                                 const x = Phaser.Math.Clamp(near ? sc.player.x + Phaser.Math.Between(-90, 90) : Phaser.Math.Between(vx.min, vx.max), vx.min+20, vx.max-20);
                                 const y = Phaser.Math.Clamp(near ? sc.player.y + Phaser.Math.Between(-110, 60) : Phaser.Math.Between(vy.min+80, vy.max-100), vy.min+60, vy.max-30);
                                 sc.strikeAt(x, y, R, dmg);
                                 for (let i=0, n=evParam(sc,'bombard','extra'); i<n; i++) sc.strikeAt(Phaser.Math.Clamp(Phaser.Math.Between(vx.min, vx.max), vx.min+20, vx.max-20), Phaser.Math.Between(vy.min+80, vy.max-100), R, dmg); } },
  frenzy:   { min:1, name:'FRENESIE', sub:'XP x2 mais ils arrivent bien plus vite !', w:()=>7, dur:(a,sc)=>evDurRange(sc,'frenzy'), start:(sc)=>{ sc._frenzyUntil = sc.elapsed + sc.curEvent.t/1000; sc._frenzyXp = evParam(sc,'frenzy','xpMul'); sc._frenzySpawn = evParam(sc,'frenzy','spawnMul'); } },
  flip:     { min:3, name:'ECRAN RETOURNE', sub:'Le haut devient le bas !', w:()=>7, dur:(a,sc)=>evDurRange(sc,'flip'),
              start:(sc)=>{ sc.flipVortex(true);                                   // le vortex apparaît 3,5 s avant le retournement et reste jusqu'à la fin
                            sc.time.delayedCall(3500, ()=>{ if (sc.curEvent && sc.curEvent.kind === 'flip'){ sc.cameras.main.flash(260, 255, 255, 255, false); sc.tweens.add({ targets: sc.cameras.main, rotation: Math.PI, duration: 700, ease: 'Sine.easeInOut' }); } }); },
              end:(sc)=>{ sc.flipVortex(false); sc.cameras.main.flash(260, 255, 255, 255, false); sc.tweens.add({ targets: sc.cameras.main, rotation: 0, duration: 700, ease: 'Sine.easeInOut' }); } },
  nebula:   { min:3, name:'NEBULEUSE', sub:'Un nuage de gaz approche... on n\'y voit presque rien', w:()=>7, dur:(a,sc)=>evDurRange(sc,'nebula'),
              start:(sc)=>sc.startNebula(), end:(sc)=>sc.endNebula(false) },
  bossbonus:{ min:4, small:true, name:'BOSS BONUS', sub:'Un boss surgit de nulle part !', w:()=>3, dur:(a,sc)=>evDur(sc,'bossbonus'), start:(sc)=>sc.spawnBonusBoss() },
  minibh:   { min:3, name:'MINI TROUS NOIRS', sub:'De petits gouffres aspirent tout, toi compris', w:()=>7, dur:(a,sc)=>evDurRange(sc,'minibh'), tickMs:(a,sc)=>evParam(sc,'minibh','tickMs'),
              tick:(sc,vx,vy)=>{ if (sc._wells.length < evParam(sc,'minibh','maxWells')) { const near = Math.random() < 0.6; sc.addWell({ x:Phaser.Math.Clamp(near ? sc.player.x + Phaser.Math.Between(-150, 150) : Phaser.Math.Between(vx.min+60, vx.max-60), vx.min+60, vx.max-60), y:Phaser.Math.Clamp(near ? sc.player.y + Phaser.Math.Between(-260, -90) : Phaser.Math.Between(vy.min+120, vy.max-300), vy.min+100, vy.max-120), r:evParam(sc,'minibh','radius'), str:evParam(sc,'minibh','strength'), core:20, life:evParam(sc,'minibh','life')*1000, big:false, dmg:evParam(sc,'minibh','dmg') }); } },
              end:(sc)=>{ sc.clearWells(); } },
  bigbh:    { min:5, name:'TROU NOIR', sub:'Un gouffre au centre : lutte pour rester libre', w:()=>6, dur:(a,sc)=>evDurRange(sc,'bigbh'),
              start:(sc)=>{ const vx = sc.visibleXRange(0), vy = sc.visibleYRange(0); sc.addWell({ x:(vx.min+vx.max)/2, y:vy.min + (vy.max-vy.min)*0.42, r:evParam(sc,'bigbh','radius'), str:evParam(sc,'bigbh','strength'), core:46, life:1e9, big:true, dmg:evParam(sc,'bigbh','dmg') }); },
              end:(sc)=>{ sc.clearWells(); } },
  corridor: { min:4, name:"COULOIR D'ASTEROIDES", sub:'Reste dans le passage !', w:()=>7, dur:(a,sc)=>evDurRange(sc,'corridor'), tickMs:()=>200,
              start:(sc)=>sc.startCorridor(), end:(sc)=>sc.endCorridor() },
  eclipse:  { min:4, name:'ECLIPSE SOLAIRE', sub:"On n'y voit presque plus rien...", w:()=>6, dur:(a,sc)=>evDurRange(sc,'eclipse'),
              start:(sc)=>sc.startEclipse(), end:(sc)=>sc.endEclipse() },
  emp:      { min:3, small:true, name:'IMPULSION EMP', sub:'Une grenade va tout couper !', w:()=>5, dur:(a,sc)=>evDur(sc,'emp'), start:(sc)=>sc.throwEmp() },
  statik:   { min:3, small:true, name:'FOUDRE STATIQUE', sub:'', w:()=>6, dur:(a,sc)=>evDur(sc,'statik'), tickMs:(a,sc)=>evParam(sc,'statik','tickMs'), tick:(sc)=>sc.staticStrike() },
  ice:      { min:2, small:true, name:'TEMPETE DE GLACE', sub:'Tout glisse...', w:()=>6, dur:(a,sc)=>evDur(sc,'ice'), tickMs:()=>80,
              start:(sc)=>sc.startIce(), tick:(sc)=>sc.tickIce(), end:(sc)=>sc.endIce() },
  shieldwall:{ min:4, small:true, name:'INVADERS', sub:'Trouve la brèche !', w:()=>6, dur:(a,sc)=>evDur(sc,'shieldwall'), start:(sc)=>sc.spawnShieldWall() },
  plasma:   { min:5, small:true, name:'BOULE DE PLASMA', sub:'Invulnérable : laisse-la passer', w:()=>5, dur:(a,sc)=>evDur(sc,'plasma'), start:(sc)=>sc.spawnPlasma(), end:(sc)=>sc.killPlasma() },
};
