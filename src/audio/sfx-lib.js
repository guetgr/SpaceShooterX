"use strict";
// Bibliothèque de sons synthétiques (SFX_LIB) et instance globale sfx.

const SFX_LIB = {
  // ---------- tirs du joueur
  laser: { g:1.48, lim:[2,90], hum:1.3, run:(s,t,p)=>{ const k = 1 + 0.07*((p.tier||1)-1); s.N(t,0,{ d:0.06, a:0.08, f:2800*k, f1:900, type:'bandpass', q:1.4 }); s.V(t,0,{ f:700*k, g:210*k, d:0.07, t:'sawtooth', a:0.045, lp:[3500,500] }); s.V(t,0,{ f:120, g:70, d:0.05, a:0.04 }); } },
  missile:     { g:2.43, lim:[1,160],  run:(s,t)=>{ s.N(t,0,{ d:0.42, a:0.075, f:900, f1:2600, type:'bandpass', q:0.9, atk:0.05 }); s.V(t,0,{ f:140, g:230, d:0.34, t:'sawtooth', a:0.05, lp:[700,300] }); } },
  swarmMissile: { g:1.16, lim:[1,200], hum:1.2, run:(s,t)=>{ [0,0.05,0.1].forEach((d,i)=>{ s.N(t,d,{ d:0.07, a:0.05, f:2000-i*300, f1:800, type:'bandpass', q:1.2, pan:(i-1)*0.4 }); s.V(t,d,{ f:200, g:110, d:0.05, a:0.03 }); }); } },
  droneShot: { g:2.17, lim:[2,250], hum:1.3, run:(s,t)=>{ s.N(t,0,{ d:0.045, a:0.05, f:3200, f1:1500, type:'bandpass', q:2 }); s.V(t,0,{ f:520, g:300, d:0.05, a:0.03 }); } },
  lightning:   { g:2.83, lim:[1,120],  run:(s,t,p)=>{ s.N(t,0,{ d:0.2, a:0.085, f:3200, f1:700, type:'bandpass', q:1.2 }); s.V(t,0,{ f:2100, g:260, d:0.11, t:'square', a:0.04, lp:[3000,500] }); [0.03,0.07,0.12,0.15].forEach(d=> s.N(t,d,{ d:0.02, a:0.045, f:4500, type:'highpass', pan:(Math.random()*2-1)*0.5 })); } },
  thunder: { g:0.36, lim:[1,500], big:true, rv:0.3, run:(s,t)=>{ s.N(t,0,{ d:0.09, a:0.15, f:3200, type:'highpass', big:true }); s.V(t,0,{ f:2600, g:200, d:0.14, t:'sawtooth', a:0.07, lp:[4000,400], big:true }); s.N(t,0.06,{ d:1.5, a:0.2, f:420, f1:110, type:'lowpass', atk:0.04, big:true }); s.V(t,0.05,{ f:72, g:30, d:1.3, a:0.26, atk:0.03, big:true }); } },
  pulsar: { g:1.03, lim:[1,600], rv:0.3, run:(s,t)=>{ s.V(t,0,{ f:200, g:1300, d:0.5, a:0.1, gk:0.9 }); s.N(t,0,{ d:0.45, a:0.06, f:500, f1:3200, type:'bandpass', q:1.5 }); s.V(t,0.38,{ f:1300, g:650, d:0.25, a:0.04, t:'triangle' }); } },
  blackHole: { g:1.05, lim:[1,1500], big:true, run:(s,t)=>{ s.V(t,0,{ f:62, g:34, d:1.1, t:'sawtooth', a:0.12, lp:[320,120], atk:0.12, big:true }); s.N(t,0,{ d:1.1, a:0.07, f:300, f1:2400, type:'bandpass', q:2.5, atk:0.2, pan:-0.5, big:true }); s.N(t,0,{ d:1.1, a:0.07, f:2400, f1:300, type:'bandpass', q:2.5, atk:0.2, pan:0.5, big:true }); } },
  bounce: { g:1.97, lim:[3,200], run:(s,t)=>{ s.N(t,0,{ d:0.02, a:0.05, f:5500, type:'highpass' }); s.V(t,0,{ f:2100, g:1400, d:0.035, a:0.03 }); } },
  slowField: { g:0.43, lim:[1,900], run:(s,t)=>{ s.V(t,0,{ f:380, g:140, d:0.4, a:0.08, lp:[1200,250] }); s.N(t,0,{ d:0.4, a:0.04, f:900, f1:250, type:'lowpass' }); s.V(t,0.02,{ f:190, g:70, d:0.4, a:0.05, t:'triangle' }); } },
  bombDrop:    { g:4.5, lim:[1,300],  run:(s,t)=>{ s.N(t,0,{ d:0.55, a:0.07, f:1800, f1:380, type:'bandpass', q:9 }); s.V(t,0,{ f:1500, g:330, d:0.55, a:0.02, t:'triangle' }); } },
  bombBoom:    { g:0.74, lim:[1,200],  run:(s,t,p)=>{ s.N(t,0,{ d:0.06, a:0.17, f:3200, type:'highpass', pan:p.pan }); s.V(t,0.01,{ f:130, g:48, d:0.4, a:0.2, pan:p.pan, big:true }); s.N(t,0.02,{ d:0.55, a:0.13, f:2400, f1:500, type:'bandpass', q:0.7, pan:p.pan, big:true }); s.V(t,0.05,{ f:900, g:300, d:0.25, t:'sawtooth', a:0.04, lp:[2500,300], pan:p.pan }); } },
  nuke: { g:0.42, lim:[1,500], big:true, run:(s,t)=>{ s.V(t,0,{ f:68, g:210, d:0.85, a:0.2, atk:0.1, big:true }); s.N(t,0,{ d:0.7, a:0.09, f:420, f1:1400, type:'lowpass', atk:0.15, big:true }); [0.3,0.5,0.7].forEach((d,i)=> strike(s,t,d,'metal',1100+i*260,{ a:0.09, len:0.5 })); s.V(t,0.3,{ f:330, g:660, d:0.45, t:'sawtooth', a:0.04, lp:[800,2000], big:true }); } },
  nukeBoom: { g:0.32, lim:[1,500], big:true, run:(s,t)=>{ s.N(t,0,{ d:1.6, a:0.3, f:650, f1:90, type:'lowpass', atk:0.01, big:true }); s.V(t,0,{ f:64, g:26, d:1.3, a:0.34, big:true }); s.N(t,0,{ d:0.12, a:0.16, f:2600, type:'highpass', big:true }); s.V(t,0.02,{ f:180, g:40, d:0.7, t:'triangle', a:0.12, big:true }); scatter(s,t,18,1.4,800,4000,0.06,{ rev:0.3 }); } },
  galaxyBlast: { g:0.44, lim:[1,600], big:true, rv:0.4, run:(s,t)=>{ s.N(t,0,{ d:1.0, a:0.16, f:200, f1:6000, type:'bandpass', q:0.8, atk:0.25, big:true }); s.V(t,0,{ f:52, g:25, d:1.2, a:0.26, big:true }); chord(s,t,0.2,[131,196,262],0.9,0.05,700,2200,0.2,{ big:true, rev:0.4 }); } },
  reflect: { g:1.14, lim:[2,200], run:(s,t,p)=>{ strike(s,t,0,'metal',2500,{ a:0.06, len:0.35, pan:p.pan }); s.V(t,0,{ f:900, g:2200, d:0.08, a:0.03, pan:p.pan }); } },
  dodge:       { g:2.81, lim:[1,250],  run:(s,t)=>{ s.N(t,0,{ d:0.16, a:0.08, f:700, f1:2600, type:'bandpass', q:1.6 }); s.V(t,0,{ f:1100, g:420, d:0.15, t:'sawtooth', a:0.03, lp:[2500,600] }); } },
  odCharge: { g:3.16, lim:[2,300], hum:1.3, run:(s,t)=>{ s.N(t,0,{ d:0.08, a:0.05, f:2500, f1:5500, type:'bandpass', q:2 }); s.V(t,0,{ f:140, g:260, d:0.07, t:'sawtooth', a:0.03, lp:[900,2500] }); } },
  odEnd: { g:1.4, lim:[1,800], run:(s,t)=>{ s.V(t,0,{ f:760, g:85, d:0.5, t:'sawtooth', a:0.08, lp:[3500,200] }); s.N(t,0,{ d:0.4, a:0.06, f:3000, f1:300, type:'lowpass' }); strike(s,t,0.3,'metal',500,{ a:0.04, len:0.5 }); } },
  overdrive:   { g:0.82, lim:[1,500],  big:true, run:(s,t)=>{ s.V(t,0,{ f:220, g:880, d:0.5, t:'triangle', a:0.16, big:true }); s.V(t,0.13,{ f:440, g:1320, d:0.35, t:'triangle', a:0.12, big:true }); s.N(t,0,{ d:0.35, a:0.06, f:4000, type:'highpass', atk:0.12 }); } },
  // ---------- impacts et protections
  hitEnemy: { g:1.24, lim:[2,100], hum:1.4, run:(s,t,p)=>{ strike(s,t,0,'wood',950,{ a:0.06, len:0.5, pan:p.pan }); s.V(t,0,{ f:200, g:120, d:0.04, a:0.04, pan:p.pan }); } },
  hitHeavy:    { g:0.6, lim:[2,130],  run:(s,t,p)=>{ s.V(t,0,{ f:165, g:68, d:0.13, a:0.12, pan:p.pan }); s.N(t,0,{ d:0.06, a:0.06, f:1500, type:'lowpass', pan:p.pan }); s.V(t,0,{ f:430, g:200, d:0.08, t:'triangle', a:0.045, pan:p.pan }); } },
  shieldHit: { g:1.26, lim:[2,120], hum:1.2, run:(s,t,p)=>{ strike(s,t,0,'metal',1700,{ a:0.05, len:0.45, pan:p.pan }); } },
  shieldBreak: { g:1.92, lim:[1,250], rv:0.25, run:(s,t,p)=>{ s.N(t,0,{ d:0.3, a:0.12, f:4500, type:'highpass', pan:p.pan }); scatter(s,t,10,0.3,2500,7000,0.07,{ rev:0.25 }); s.V(t,0,{ f:300, g:120, d:0.15, a:0.07, pan:p.pan }); } },
  decoyPop: { g:0.96, lim:[2,150], run:(s,t,p)=>{ s.V(t,0,{ f:300, g:1100, d:0.09, a:0.07, pan:p.pan }); s.N(t,0.01,{ d:0.05, a:0.05, f:1800, type:'lowpass', pan:p.pan }); s.V(t,0.05,{ f:2200, d:0.05, a:0.03, pan:p.pan }); } },
  rock:        { g:0.93, lim:[3,120],  run:(s,t,p)=>{ const k = [1.4, 1.0, 0.75][p.tier === undefined ? 1 : p.tier]; s.N(t,0,{ d:0.09, a:0.11, f:1700*k, type:'bandpass', q:2, pan:p.pan }); s.V(t,0,{ f:880*k, g:420*k, d:0.05, t:'triangle', a:0.06, pan:p.pan }); s.V(t,0.03,{ f:300*k, g:140*k, d:0.1, t:'square', a:0.04, lp:[1200,300], pan:p.pan }); } },
  tentacleCut: { g:1.32, lim:[1,150],  run:(s,t,p)=>{ s.N(t,0,{ d:0.16, a:0.1, f:1500, f1:400, type:'bandpass', q:1.1, pan:p.pan }); s.V(t,0,{ f:300, g:90, d:0.14, a:0.1, pan:p.pan }); s.V(t,0.03,{ f:520, g:160, d:0.12, t:'triangle', a:0.045, pan:p.pan }); } },
  partBreak: { g:1.1, lim:[1,120], big:true, run:(s,t,p)=>{ s.N(t,0,{ d:0.03, a:0.16, f:5000, type:'highpass', pan:p.pan }); s.N(t,0,{ d:0.45, a:0.16, f:2200, f1:350, type:'bandpass', q:0.7, pan:p.pan, big:true }); s.V(t,0,{ f:120, g:42, d:0.35, a:0.2, pan:p.pan }); scatter(s,t,7,0.4,900,3000,0.05,{ rev:0.15, q:1.2 }); } },
  // ---------- explosions (de la plus petite à la plus grosse)
  boomSmall:   { g:1.0, lim:[3,100],  run:(s,t,p)=>{ s.N(t,0,{ d:0.02, a:0.12, f:5000, type:'highpass', pan:p.pan }); s.N(t,0,{ d:0.24, a:0.15, f:3000, f1:260, type:'lowpass', pan:p.pan }); s.V(t,0,{ f:160, g:48, d:0.2, a:0.16, pan:p.pan }); scatter(s,t,3,0.15,1000,3000,0.03,{ rev:0.05, q:1.2 }); } },
  boomMed: { g:1.0, lim:[2,150], run:(s,t,p)=>{ s.N(t,0,{ d:0.02, a:0.12, f:5000, type:'highpass', pan:p.pan }); s.N(t,0,{ d:0.55, a:0.2, f:2400, f1:160, type:'lowpass', pan:p.pan }); s.V(t,0,{ f:115, g:36, d:0.5, a:0.24, pan:p.pan }); s.N(t,0.06,{ d:0.55, a:0.1, f:420, f1:90, type:'bandpass', q:0.6, pan:p.pan }); scatter(s,t,6,0.45,800,2800,0.04,{ rev:0.2, q:1.2 }); } },
  boomBig:     { g:0.6, lim:[1,220],  big:true, run:(s,t,p)=>{ s.N(t,0,{ d:0.03, a:0.2, f:4500, type:'highpass', pan:p.pan }); s.N(t,0,{ d:1.1, a:0.27, f:1800, f1:90, type:'lowpass', pan:p.pan, big:true }); s.V(t,0,{ f:92, g:27, d:0.95, a:0.32, pan:p.pan, big:true }); s.V(t,0.02,{ f:58, g:30, d:0.9, t:'triangle', a:0.14, pan:p.pan, big:true }); s.N(t,0.14,{ d:1.0, a:0.14, f:520, f1:70, type:'bandpass', q:0.5, pan:p.pan, big:true }); scatter(s,t,11,0.9,600,2600,0.05,{ rev:0.3, q:1.2 }); } },
  kamikazeBoom:{ g:0.8, lim:[2,150],  big:true, run:(s,t,p)=>{ s.V(t,0,{ f:900, g:140, d:0.28, t:'sawtooth', a:0.07, lp:[3500,200], pan:p.pan }); s.N(t,0.12,{ d:0.03, a:0.16, f:4500, type:'highpass', pan:p.pan }); s.N(t,0.12,{ d:0.6, a:0.2, f:2200, f1:140, type:'lowpass', pan:p.pan, big:true }); s.V(t,0.12,{ f:100, g:30, d:0.5, a:0.26, pan:p.pan, big:true }); scatter(s,t+0.12,6,0.4,900,2800,0.04,{ rev:0.2, q:1.2 }); } },
  mineBoom: { g:0.5, lim:[2,150], big:true, run:(s,t,p)=>{ s.N(t,0,{ d:0.03, a:0.12, f:3000, type:'lowpass', pan:p.pan }); s.V(t,0,{ f:75, g:26, d:0.7, a:0.3, atk:0.01, pan:p.pan, big:true }); s.N(t,0.02,{ d:0.8, a:0.18, f:700, f1:80, type:'lowpass', atk:0.02, pan:p.pan, big:true }); scatter(s,t,5,0.5,500,1800,0.03,{ rev:0.2, q:1.2 }); } },
  strikeWarn: { g:4.5, lim:[3,150], run:(s,t,p)=>{ s.N(t,0,{ d:0.9, a:0.06, f:1900, f1:700, type:'bandpass', q:10, pan:p.pan }); s.V(t,0,{ f:2000, g:720, d:0.9, a:0.02, t:'triangle', pan:p.pan }); } },
  strikeBoom: { g:0.8, lim:[2,150], big:true, run:(s,t,p)=>{ s.N(t,0,{ d:0.04, a:0.16, f:4500, type:'highpass', pan:p.pan }); s.V(t,0,{ f:90, g:30, d:0.5, a:0.26, pan:p.pan, big:true }); s.N(t,0,{ d:0.7, a:0.2, f:1600, f1:110, type:'lowpass', pan:p.pan, big:true }); scatter(s,t,6,0.5,800,2600,0.04,{ rev:0.2, q:1.2 }); } },
  // ---------- actions des ennemis
  enemyShot: { g:3.3, lim:[3,220], hum:1.4, run:(s,t,p)=>{ s.N(t,0,{ d:0.09, a:0.035, f:2000, f1:500, type:'lowpass', q:1.2, pan:p.pan }); s.V(t,0,{ f:300, g:170, d:0.07, a:0.018, pan:p.pan }); } },
  heavyShot: { g:0.56, lim:[2,250], hum:1.1, run:(s,t,p)=>{ strike(s,t,0,'metal',520,{ a:0.06, len:0.5, pan:p.pan }); s.V(t,0,{ f:100, g:50, d:0.13, a:0.1, pan:p.pan }); s.N(t,0,{ d:0.02, a:0.07, f:3500, type:'highpass', pan:p.pan }); } },
  spreadShot:  { g:2.85, lim:[1,300],  run:(s,t,p)=>{ [[0,-0.6],[0.045,0],[0.09,0.6]].forEach(([d,pn])=> s.N(t,d,{ d:0.06, a:0.06, f:2000, f1:1100, type:'bandpass', q:1.1, pan:pn })); } },
  snipeCharge: { g:1.45, lim:[1,800], run:(s,t,p)=>{ s.N(t,0,{ d:0.7, a:0.04, f:500, f1:3500, type:'bandpass', q:3, atk:0.4, pan:p.pan }); s.V(t,0,{ f:400, g:2400, d:0.7, a:0.035, atk:0.2, pan:p.pan }); } },
  snipeShot:   { g:1.55, lim:[1,300],  run:(s,t,p)=>{ s.N(t,0,{ d:0.06, a:0.12, f:3000, type:'highpass', pan:p.pan }); s.V(t,0,{ f:1800, g:200, d:0.16, a:0.09, pan:p.pan }); } },
  healerPulse: { g:1.54, lim:[1,300], rv:0.35, run:(s,t,p)=>{ swell(s,t,0.45,700,1800,0.04,{ type:'lowpass', q:0.5, pan:p.pan, rev:0.35 }); chord(s,t,0,[330,495],0.5,0.025,1100,1700,0.12,{ pan:p.pan, rev:0.35 }); } },
  webShoot:    { g:1.26, lim:[1,300],  run:(s,t,p)=>{ s.N(t,0,{ d:0.13, a:0.05, f:4000, type:'highpass', pan:p.pan }); s.V(t,0,{ f:2200, g:900, d:0.16, a:0.04, pan:p.pan }); } },
  mineDrop: { g:0.72, lim:[2,200], hum:1.1, run:(s,t,p)=>{ strike(s,t,0,'wood',820,{ a:0.06, pan:p.pan }); strike(s,t,0.09,'wood',600,{ a:0.05, pan:p.pan }); } },
  kamiCharge: { g:2.82, lim:[1,500], hum:1.2, run:(s,t,p)=>{ s.V(t,0,{ f:280, g:760, d:0.5, t:'sawtooth', a:0.04, lp:[900,2600], pan:p.pan }); s.N(t,0,{ d:0.5, a:0.035, f:800, f1:2400, type:'bandpass', q:1.2, atk:0.25, pan:p.pan }); } },
  motherCharge: { g:0.48, lim:[1,1500], big:true, run:(s,t,p)=>{ [0,0.22,0.4,0.54,0.65,0.74,0.82,0.89].forEach((d,i)=>{ s.V(t,d,{ f:58+i*4, g:42, d:0.14, a:0.07+i*0.01, pan:p.pan, big:true }); s.N(t,d,{ d:0.1, a:0.04, f:300, type:'lowpass', pan:p.pan }); }); } },
  goldenSpawn: { g:1.07, lim:[1,500], rv:0.4, run:(s,t)=>{ swell(s,t,0.5,2200,7000,0.04,{ type:'highpass', rev:0.4 }); scatter(s,t,7,0.45,3000,7000,0.045,{ rev:0.4 }); s.V(t,0,{ f:170, g:260, d:0.4, a:0.04, atk:0.2, rev:0.3 }); } },
  // ---------- récompenses
  gem: { g:1.73, lim:[2,120], hum:1.6, rv:0.15, run:(s,t,p)=>{ s.N(t,0,{ d:0.02, a:0.06, f:3200, type:'bandpass', q:4, pan:p.pan }); s.V(t,0,{ f:1900, g:1700, d:0.055, a:0.035, pan:p.pan }); s.V(t,0,{ f:260, g:200, d:0.045, a:0.03, pan:p.pan }); } },
  gemBig: { g:0.78, lim:[1,200], hum:1.3, rv:0.2, run:(s,t,p)=>{ s.N(t,0,{ d:0.025, a:0.07, f:2400, type:'bandpass', q:4, pan:p.pan }); s.V(t,0,{ f:1400, g:1250, d:0.09, a:0.045, pan:p.pan }); s.V(t,0.05,{ f:1900, g:1700, d:0.08, a:0.035, pan:p.pan }); s.V(t,0,{ f:160, g:100, d:0.12, a:0.07, pan:p.pan }); } },
  heal: { g:1.16, lim:[1,300], rv:0.35, run:(s,t)=>{ swell(s,t,0.5,800,2500,0.07,{ type:'lowpass', q:0.5 }); chord(s,t,0,[330,495],0.55,0.035,1200,2400,0.15,{ rev:0.35 }); } },
  jackpot: { g:1.42, lim:[1,800], rv:0.35, run:(s,t)=>{ s.V(t,0,{ f:120, g:70, d:0.2, a:0.12 }); swell(s,t,0.45,1200,6500,0.1,{ q:0.8, big:true }); scatter(s,t,16,0.6,2200,6500,0.06,{ rev:0.35 }); chord(s,t,0.15,[294,440],0.5,0.04,1000,2600,0.06,{ rev:0.4 }); } },
  levelup: { g:0.62, lim:[1,500], rv:0.4, run:(s,t)=>{ s.N(t,0,{ d:0.55, a:0.09, f:300, f1:3500, type:'bandpass', q:0.8, atk:0.35, big:true }); s.V(t,0.4,{ f:70, g:38, d:0.5, a:0.22, big:true }); s.N(t,0.4,{ d:0.3, a:0.12, f:900, f1:200, type:'lowpass', big:true }); chord(s,t,0.38,[262,392],0.6,0.06,1200,2600,0.05,{ rev:0.45 }); } },
  alertAlarm: { g:0.9, lim:[1,500], rv:0.15, run:(s,t,p)=>{ const lv = Math.max(1, (p && p.lv) || 1), n = lv >= 12 ? 4 : (lv >= 8 ? 3 : (lv >= 4 ? 2 : 1)), f = 420 + 22*Math.min(lv, 20);
                  for (let i=0;i<n;i++){ s.V(t, i*0.17, { f, d:0.13, a:0.028, atk:0.006, t:'triangle', lp:[1700,1100] }); s.V(t, i*0.17 + 0.07, { f:f*1.26, d:0.09, a:0.016, atk:0.004, t:'sine' }); } } },
  achievement: { g:0.92, lim:[1,600], rv:0.3, run:(s,t)=>{ [[0,392],[0.13,523]].forEach(([d,f])=>{ s.V(t,d,{ f, d:0.38, a:0.06, atk:0.002, hum:0.8 }); s.V(t,d,{ f:f*2, d:0.18, a:0.03, atk:0.002, hum:0.8 }); s.N(t,d,{ d:0.012, a:0.05, f:2600, type:'bandpass', q:2 }); }); swell(s,t,0.4,600,2000,0.03,{ rev:0.4 }); } },
  relicOpen: { g:1.35, lim:[1,900], rv:0.55, run:(s,t)=>{ s.V(t,0,{ f:110, d:1.2, t:'sawtooth', a:0.07, lp:[250,700], atk:0.45, big:true }); swell(s,t,0.9,800,2600,0.05,{ rev:0.5 }); scatter(s,t,5,0.8,2500,5500,0.04,{ rev:0.5 }); chord(s,t,0.1,[165],0.9,0.035,500,1400,0.35,{ rev:0.5 }); } },
  cardsOpen: { g:1.95, lim:[1,500], run:(s,t)=>{ s.N(t,0,{ d:0.26, a:0.06, f:500, f1:2500, type:'bandpass', q:0.8, atk:0.1 }); s.V(t,0.12,{ f:200, g:150, d:0.07, a:0.05 }); } },
  cardPick: { g:1.19, lim:[1,150], hum:1.2, run:(s,t)=>{ strike(s,t,0,'stone',560,{ a:0.09, len:1 }); s.N(t,0.05,{ d:0.1, a:0.04, f:3500, f1:1800, type:'bandpass', q:1.5 }); strike(s,t,0.07,'wood',900,{ a:0.07 }); } },
  reroll: { g:1.65, lim:[1,200], run:(s,t)=>{ for (let i=0;i<6;i++) s.N(t, i*0.032 + Math.random()*0.012, { d:0.02, a:0.05, f:rnd(1500,3500), type:'bandpass', q:3, pan:rnd(-0.5,0.5) }); strike(s,t,0.2,'wood',420,{ a:0.06 }); } },
  skillBuy: { g:0.7, lim:[1,150], run:(s,t)=>{ s.N(t,0,{ d:0.3, a:0.07, f:300, f1:3000, type:'bandpass', q:0.9, atk:0.2 }); strike(s,t,0.22,'metal',900,{ a:0.05, len:0.7 }); s.V(t,0.22,{ f:90, g:55, d:0.15, a:0.1 }); } },
  pactSign: { g:1.34, lim:[1,300], run:(s,t)=>{ strike(s,t,0,'wood',260,{ a:0.1, len:1.2 }); s.N(t,0.02,{ d:0.1, a:0.05, f:3000, f1:2000, type:'bandpass', q:2 }); s.V(t,0,{ f:100, g:62, d:0.12, a:0.1 }); } },
  bank: { g:1.19, lim:[1,300], rv:0.2, run:(s,t)=>{ strike(s,t,0,'wood',1500,{ a:0.06 }); strike(s,t,0.06,'wood',1100,{ a:0.05 }); s.V(t,0.09,{ f:150, g:95, d:0.12, a:0.09 }); } },
  comboTick: { g:1.32, lim:[1,110], hum:1.3, run:(s,t,p)=>{ const n = p.n || 10, f = 800 + Math.min(1000, n*10); strike(s,t,0,'stone',f,{ a:0.06, len:0.9 }); s.N(t,0,{ d:0.01, a:0.03, f:4500, type:'highpass' }); } },
  rankUp: { g:1.63, lim:[1,300], run:(s,t,p)=>{ const k = 1 + 0.1*(p.rank || 0); s.N(t,0,{ d:0.18, a:0.07, f:600*k, f1:3200, type:'bandpass', q:1, atk:0.1 }); s.V(t,0.1,{ f:200*k, g:300*k, d:0.16, t:'sawtooth', a:0.06, lp:[900,2200] }); } },
  // ---------- le joueur
  hurt: { g:1.07, lim:[1,120], run:(s,t)=>{ s.V(t,0,{ f:200, g:90, d:0.2, t:'sawtooth', a:0.09, lp:[1800,250] }); s.N(t,0,{ d:0.13, a:0.11, f:1300, type:'bandpass', q:1.2 }); s.V(t,0,{ f:80, g:45, d:0.18, a:0.13 }); } },
  hurtShield: { g:1.93, lim:[1,150], run:(s,t)=>{ s.N(t,0,{ d:0.16, a:0.07, f:1500, f1:500, type:'bandpass', q:1.3 }); strike(s,t,0,'metal',800,{ a:0.05, len:1 }); } },
  heartbeat: { g:0.3, lim:[1,300], run:(s,t)=>{ s.V(t,0,{ f:64, g:42, d:0.18, a:0.2 }); s.N(t,0,{ d:0.12, a:0.1, f:260, type:'lowpass' }); s.V(t,0.23,{ f:60, g:40, d:0.2, a:0.17 }); s.N(t,0.23,{ d:0.12, a:0.08, f:240, type:'lowpass' }); } },
  lastStand: { g:0.4, lim:[1,2000], big:true, run:(s,t)=>{ s.V(t,0,{ f:55, g:90, d:1.0, t:'sawtooth', a:0.1, lp:[150,300], atk:0.3, big:true }); [0.25,0.5,0.8].forEach((d,i)=> s.V(t,d,{ f:62, g:38, d:0.2, a:0.26+0.03*i, big:true })); swell(s,t,0.3,300,1800,0.06,{ at:0, type:'lowpass', q:0.6, big:true }); } },
  dodgeEnemy: { g:3.71, lim:[1,200], run:(s,t,p)=>{ s.N(t,0,{ d:0.1, a:0.03, f:600, f1:3000, type:'bandpass', q:1, pan:p.pan }); s.V(t,0,{ f:300, g:1800, d:0.1, t:'sawtooth', a:0.03, lp:[600,3000], pan:p.pan }); } },
  playerDeath: { g:0.44, lim:[1,2000], big:true, run:(s,t)=>{ s.V(t,0,{ f:440, g:36, d:1.3, t:'sawtooth', a:0.11, lp:[1400,120], big:true }); s.N(t,0,{ d:1.0, a:0.18, f:900, f1:110, type:'bandpass', q:0.7, big:true }); s.V(t,0,{ f:72, g:28, d:1.2, a:0.26, big:true }); scatter(s,t,16,1.0,800,3500,0.08,{ rev:0.2 }); } },
  gameover: { g:0.71, lim:[1,2000], big:true, rv:0.4, run:(s,t)=>{ s.V(t,0,{ f:196, g:98, d:1.4, t:'sawtooth', a:0.07, lp:[1200,200], atk:0.05, big:true }); s.V(t,0,{ f:49, d:1.6, a:0.12, atk:0.3, big:true }); s.N(t,0,{ d:1.2, a:0.08, f:700, f1:150, type:'lowpass', big:true }); } },
  launch:      { g:0.88, lim:[1,500],  run:(s,t)=>{ s.N(t,0,{ d:0.95, a:0.075, f:900, f1:3800, type:'highpass', atk:0.3 }); s.V(t,0,{ f:110, g:560, d:0.9, t:'sawtooth', a:0.06, lp:[500,2500] }); } },
  apex: { g:1.46, lim:[1,500], rv:0.4, run:(s,t)=>{ swell(s,t,0.3,1500,7000,0.08,{ rev:0.4 }); s.N(t,0.28,{ d:0.1, a:0.1, f:3500, type:'highpass' }); s.V(t,0.25,{ f:600, g:900, d:0.2, t:'sawtooth', a:0.04, lp:[2000,3500], rev:0.3 }); } },
  landing: { g:0.95, lim:[1,500], run:(s,t)=>{ s.V(t,0,{ f:150, g:90, d:0.1, t:'square', a:0.1, lp:[1500,300] }); strike(s,t,0.01,'metal',1000,{ a:0.05, len:0.5 }); s.N(t,0,{ d:0.07, a:0.07, f:1500, type:'lowpass' }); s.V(t,0.02,{ f:70, g:50, d:0.15, a:0.1 }); } },
  alertUp: { g:0.82, lim:[1,500], run:(s,t)=>{ s.N(t,0,{ d:0.35, a:0.08, f:400, f1:2200, type:'bandpass', q:0.9, atk:0.2 }); chord(s,t,0.2,[247,370],0.35,0.06,900,1800,0.05,{ rev:0.3 }); } },
  beamCharge: { g:1.31, lim:[1,900], run:(s,t)=>{ s.V(t,0,{ f:180, g:1500, d:0.95, t:'sawtooth', a:0.05, lp:[400,4000], atk:0.3 }); s.N(t,0,{ d:0.95, a:0.06, f:600, f1:5000, type:'bandpass', q:2, atk:0.5 }); } },
  beamFire: { g:1.53, lim:[1,900], run:(s,t)=>{ s.N(t,0,{ d:1.2, a:0.1, f:2500, f1:900, type:'bandpass', q:0.8 }); s.V(t,0,{ f:3000, g:500, d:0.3, t:'sawtooth', a:0.07, lp:[5000,800] }); s.V(t,0,{ f:220, d:1.2, t:'sawtooth', a:0.05, lp:[1500,800] }); } },
  evNebula: { g:0.43, lim:[1,3000], rv:0.5, run:(s,t)=>{ swell(s,t,1.8,4500,700,0.09,{ type:'highpass', q:0.7, rev:0.55, big:true }); s.V(t,0,{ f:62, g:50, d:1.8, a:0.1, atk:0.7, big:true }); scatter(s,t,6,1.4,1500,3500,0.03,{ rev:0.55 }); } },
  nebulaWarn: { g:0.86, lim:[1,3000], rv:0.45, run:(s,t)=>{ s.N(t,0,{ d:2.4, a:0.08, f:200, f1:900, type:'bandpass', q:1.5, atk:1.4, big:true }); s.V(t,0,{ f:55, g:70, d:2.4, t:'sawtooth', a:0.07, lp:[150,350], atk:1.2, big:true }); } },
  nebulaEnter: { g:0.42, lim:[1,3000], rv:0.6, run:(s,t)=>{ s.N(t,0,{ d:0.9, a:0.16, f:6500, f1:300, type:'lowpass', q:0.9, big:true }); s.V(t,0.1,{ f:80, g:45, d:0.6, a:0.2, big:true }); chord(s,t,0.2,[110,165],1.4,0.05,500,260,0.25,{ rev:0.6, big:true }); } },
  nebulaExit: { g:0.74, lim:[1,3000], rv:0.5, run:(s,t)=>{ s.N(t,0,{ d:0.9, a:0.14, f:300, f1:7000, type:'lowpass', q:0.9, atk:0.4, big:true }); scatter(s,t,8,0.7,3000,7000,0.04,{ rev:0.5 }); s.V(t,0.5,{ f:90, g:60, d:0.4, a:0.1, big:true }); } },
  // ---------- boss
  bossAlert: { g:1.05, lim:[1,800], big:true, rv:0.3, run:(s,t)=>{ [0,0.3,0.6].forEach(d=>{ s.V(t,d,{ f:196, g:233, d:0.28, t:'sawtooth', a:0.1, lp:[700,1400], big:true }); s.V(t,d,{ f:98, g:117, d:0.28, a:0.1, big:true }); s.N(t,d,{ d:0.2, a:0.04, f:900, f1:500, type:'bandpass', q:1 }); }); } },
  doubleBoss: { g:1.53, lim:[1,1500], big:true, rv:0.35, run:(s,t)=>{ [0,0.6].forEach(d=>{ s.V(t,d,{ f:196, d:0.5, t:'sawtooth', a:0.09, lp:[900,1800], big:true }); s.V(t,d,{ f:208, d:0.5, t:'sawtooth', a:0.09, lp:[900,1800], big:true }); s.N(t,d,{ d:0.3, a:0.05, f:900, f1:500, type:'bandpass', q:1 }); }); } },
  phaseUp:     { g:1.09, lim:[1,600],  big:true, run:(s,t)=>{ s.V(t,0,{ f:120, g:70, d:0.5, t:'sawtooth', a:0.09, lp:[900,200], big:true }); s.N(t,0,{ d:0.45, a:0.12, f:900, f1:200, type:'lowpass', big:true }); s.V(t,0.16,{ f:262, d:0.3, t:'triangle', a:0.12 }); } },
  secondForm: { g:0.4, lim:[1,2000], big:true, rv:0.4, run:(s,t)=>{ [[500,0.07],[1100,0.05],[2600,0.03]].forEach(([f,a],i)=> s.N(t,0,{ d:1.3, a, f:f*0.6, f1:f*1.1, type:'bandpass', q:5, atk:0.25, big:true })); s.V(t,0,{ f:72, g:38, d:1.5, t:'sawtooth', a:0.12, lp:[300,700], atk:0.1, big:true }); s.V(t,0,{ f:46, d:1.5, a:0.24, big:true }); [0.3,0.7,1.1].forEach(d=> s.V(t,d,{ f:90, g:40, d:0.3, a:0.15, big:true })); } },
  bossDown: { g:0.73, lim:[1,2000], big:true, rv:0.4, run:(s,t)=>{ s.N(t,0,{ d:0.09, a:0.2, f:3500, type:'highpass', big:true }); s.N(t,0,{ d:0.55, a:0.24, f:900, f1:150, type:'lowpass', big:true }); s.V(t,0,{ f:84, g:30, d:0.5, a:0.26, big:true }); chord(s,t,0.4,[196,294,392,494],1.0,0.055,1200,3200,0.2,{ rev:0.5, big:true }); } },
  mirageOn: { g:0.86, lim:[1,600], rv:0.4, run:(s,t)=>{ swell(s,t,0.6,1500,260,0.08,{ q:2.2, rev:0.4 }); chord(s,t,0,[392],0.55,0.03,700,300,0.15,{ rev:0.45 }); s.V(t,0.1,{ f:280, g:120, d:0.5, a:0.06, lp:[500,200] }); } },
  mirageOff: { g:1.27, lim:[1,600], rv:0.4, run:(s,t)=>{ swell(s,t,0.5,300,3500,0.07,{ q:1.6, rev:0.4 }); chord(s,t,0.15,[392],0.45,0.03,300,900,0.1,{ rev:0.4 }); scatter(s,t,4,0.2,3500,7000,0.05,{ rev:0.4 }); s.V(t,0,{ f:90, g:140, d:0.4, a:0.04, atk:0.2 }); } },
  regrow:      { g:0.99, lim:[2,300],  run:(s,t,p)=>{ s.V(t,0,{ f:150, g:400, d:0.32, a:0.1, pan:p.pan }); s.N(t,0,{ d:0.3, a:0.06, f:600, f1:1300, type:'bandpass', q:1, pan:p.pan }); [0.06,0.14,0.22].forEach((d,i)=> s.V(t,d,{ f:500+i*180, g:900+i*200, d:0.07, a:0.04, pan:p.pan })); } },
  waveAlarm: { g:0.42, lim:[1,2000], big:true, run:(s,t)=>{ s.N(t,0,{ d:1.3, a:0.14, f:300, f1:900, type:'lowpass', atk:0.4, big:true }); s.V(t,0,{ f:55, g:92, d:1.3, a:0.2, atk:0.3, big:true }); [1800,1500,1200].forEach((f,i)=> strike(s,t,0.5+i*0.18,'metal',f,{ a:0.05, len:0.4 })); } },
  // ---------- événements (un signal propre à chacun)
  evCrystal: { g:0.97, lim:[1,800], rv:0.45, run:(s,t)=>{ swell(s,t,0.5,2500,7500,0.04,{ type:'highpass', rev:0.45 }); scatter(s,t,14,0.7,2500,6500,0.07,{ rev:0.5 }); s.V(t,0,{ f:140, g:200, d:0.4, a:0.05, atk:0.2, rev:0.4 }); } },
  evMeteors: { g:0.65, lim:[1,800], run:(s,t)=>{ [[0.1,220],[0.3,180],[0.5,260]].forEach(([d,f],i)=> strike(s,t,d,'stone',f,{ a:0.12, len:1.2, pan:(i-1)*0.5 })); s.N(t,0,{ d:0.9, a:0.07, f:5000, f1:1500, type:'highpass', atk:0.3 }); s.N(t,0,{ d:0.9, a:0.1, f:300, f1:120, type:'lowpass', atk:0.15 }); } },
  evSwarm: { g:2.49, lim:[1,800], run:(s,t)=>{ for (let i=0;i<16;i++){ const d=i*0.04; s.V(t,d,{ f:rnd(170,260), d:0.035, t:'sawtooth', a:0.045, lp:[1500,900], pan:rnd(-0.6,0.6) }); s.N(t,d,{ d:0.03, a:0.025, f:rnd(3000,4500), type:'bandpass', q:3, pan:rnd(-0.6,0.6) }); } } },
  evMines: { g:0.51, lim:[1,800], run:(s,t)=>{ [0,0.13,0.26].forEach(d=> strike(s,t,d,'wood',720,{ a:0.06 })); s.V(t,0.4,{ f:70, g:45, d:0.25, a:0.16 }); } },
  evGold: { g:1.05, lim:[1,800], rv:0.4, run:(s,t)=>{ swell(s,t,0.6,2000,6500,0.04,{ type:'highpass', rev:0.4 }); scatter(s,t,10,0.55,2800,7000,0.06,{ rev:0.4 }); chord(s,t,0.1,[196,294],0.6,0.035,800,2000,0.15,{ rev:0.4 }); } },
  evKamikaze: { g:1.74, lim:[1,800], run:(s,t)=>{ s.V(t,0,{ f:400, g:820, d:0.3, t:'sawtooth', a:0.06, lp:[1800,2000] }); s.V(t,0.3,{ f:820, g:400, d:0.3, t:'sawtooth', a:0.06, lp:[1800,2000] }); s.N(t,0,{ d:0.6, a:0.035, f:900, f1:1800, type:'bandpass', q:1 }); } },
  evSpiders:   { g:1.8, lim:[1,800],  run:(s,t)=>{ [0,0.03,0.07,0.1,0.16,0.19,0.27,0.3,0.38,0.42].forEach((d,i)=>{ s.V(t,d,{ f:3000 + (i*337)%1800, g:1500, d:0.025, a:0.05, pan:(i%2?0.6:-0.6) }); s.N(t,d,{ d:0.03, a:0.04, f:5200, type:'highpass', pan:(i%2?-0.5:0.5) }); }); s.N(t,0,{ d:0.6, a:0.03, f:3000, type:'highpass', atk:0.1 }); } },
  evElite:     { g:1.0, lim:[1,800],  run:(s,t)=>{ s.V(t,0,{ f:196, d:0.55, t:'sawtooth', a:0.09, lp:[900,700] }); s.V(t,0,{ f:247, d:0.55, t:'sawtooth', a:0.08, lp:[900,700] }); s.N(t,0.1,{ d:0.12, a:0.1, f:1800, type:'bandpass', q:0.8 }); } },
  evBombard:   { g:0.71, lim:[1,800],  run:(s,t)=>{ s.V(t,0,{ f:300, g:520, d:0.5, t:'sawtooth', a:0.07, lp:[900,900] }); s.V(t,0.5,{ f:520, g:300, d:0.5, t:'sawtooth', a:0.07, lp:[900,900] }); s.V(t,0.75,{ f:60, g:38, d:0.3, a:0.14 }); s.N(t,0.75,{ d:0.3, a:0.08, f:400, f1:150, type:'lowpass' }); } },
  evFrenzy:    { g:1.34, lim:[1,800],  run:(s,t)=>{ [0,0.14,0.28,0.42].forEach((d,i)=> s.V(t,d,{ f:100+i*15, g:230+i*30, d:0.13, t:'sawtooth', a:0.075, lp:[600,3200] })); s.N(t,0,{ d:0.55, a:0.04, f:3000, f1:7000, type:'highpass' }); } },
  evFlip:      { g:1.2, lim:[1,800],  run:(s,t)=>{ s.N(t,0,{ d:0.75, a:0.08, f:3000, f1:300, type:'bandpass', q:1 }); s.V(t,0,{ f:330, g:660, d:0.35, t:'triangle', a:0.07 }); s.V(t,0.35,{ f:660, g:330, d:0.35, t:'triangle', a:0.07 }); } },
  evMagnet: { g:0.62, lim:[1,800], rv:0.35, run:(s,t)=>{ [147,220].forEach(f=> s.V(t,0,{ f, g:f*2.2, d:0.85, a:0.05, atk:0.35, hum:0.5 })); swell(s,t,0.8,200,1800,0.06,{ type:'lowpass', q:0.6, rev:0.35 }); } },
  // ---------- interface
  uiClick: { g:0.97, lim:[3,80], hum:1.4, run:(s,t)=>{ strike(s,t,0,'wood',1250,{ a:0.07, len:0.6 }); } },
  uiStart: { g:0.38, lim:[1,300], rv:0.2, run:(s,t)=>{ swell(s,t,0.25,500,3500,0.07); strike(s,t,0.12,'wood',700,{ a:0.07 }); strike(s,t,0.19,'wood',1000,{ a:0.07 }); } },
  uiBack: { g:0.87, lim:[2,100], hum:1.3, run:(s,t)=>{ strike(s,t,0,'wood',760,{ a:0.07, len:0.7 }); s.V(t,0,{ f:140, g:90, d:0.05, a:0.05 }); } },
  uiOpen: { g:0.84, lim:[2,150], run:(s,t)=>{ s.N(t,0,{ d:0.16, a:0.05, f:500, f1:2200, type:'bandpass', q:0.8, atk:0.06 }); strike(s,t,0.1,'wood',900,{ a:0.04 }); } },
  uiToggle: { g:0.75, lim:[2,100], run:(s,t)=>{ strike(s,t,0,'stone',1800,{ a:0.06, len:0.5 }); strike(s,t,0.05,'stone',1200,{ a:0.05, len:0.5 }); } },
  uiPage: { g:2.36, lim:[2,100], run:(s,t)=>{ s.N(t,0,{ d:0.014, a:0.12, f:2800, type:'bandpass', q:3 }); s.N(t,0.045,{ d:0.014, a:0.1, f:2300, type:'bandpass', q:3 }); } },
  uiSelect: { g:0.95, lim:[3,80], hum:1.4, run:(s,t)=>{ strike(s,t,0,'wood',1000,{ a:0.06, len:0.6 }); strike(s,t,0.04,'wood',1500,{ a:0.05, len:0.5 }); } },
  uiError: { g:0.31, lim:[2,150], run:(s,t)=>{ strike(s,t,0,'wood',190,{ a:0.1, len:1.3 }); strike(s,t,0.13,'wood',170,{ a:0.1, len:1.3 }); } },
  uiPause: { g:1.43, lim:[1,200], run:(s,t)=>{ s.N(t,0,{ d:0.17, a:0.05, f:5000, f1:1500, type:'highpass' }); strike(s,t,0.02,'wood',520,{ a:0.05, len:0.6 }); } },
  uiResume: { g:0.61, lim:[1,200], run:(s,t)=>{ s.N(t,0,{ d:0.17, a:0.05, f:1500, f1:5000, type:'highpass', atk:0.1 }); strike(s,t,0.1,'wood',760,{ a:0.05, len:0.6 }); } },
  // --- TUTO: sons enregistrés (SFX_FILES); le run de secours rejoue un son existant
  tutoSatHit: { g:1, lim:[3,80], run:(s,t,p)=>{ s.play('hitEnemy', p); } },
  tutoSatBoom: { g:1, lim:[3,100], run:(s,t,p)=>{ s.play('boomSmall', p); } },
  tutoBossWarn: { g:1, lim:[1,800], run:(s,t,p)=>{ s.play('bossAlert', p); } },
  tutoBossHit: { g:1, lim:[3,100], run:(s,t,p)=>{ s.play('hitHeavy', p); } },
  tutoBossAim: { g:1, lim:[2,200], run:(s,t,p)=>{ s.play('enemyShot', p); } },
  tutoBossRing: { g:1, lim:[1,300], run:(s,t,p)=>{ s.play('heavyShot', p); } },
  tutoBossRain: { g:1, lim:[1,300], run:(s,t,p)=>{ s.play('spreadShot', p); } },
  tutoBossSpiral: { g:1, lim:[2,150], run:(s,t,p)=>{ s.play('enemyShot', p); } },
  tutoBossPhase: { g:1, lim:[1,500], run:(s,t,p)=>{ s.play('boomMed', p); } },
  tutoBossBoomA: { g:1, lim:[2,200], run:(s,t,p)=>{ s.play('boomMed', p); } },
  tutoBossBoomFinal: { g:1, lim:[1,500], run:(s,t,p)=>{ s.play('boomBig', p); } },
  tutoDone: { g:1, lim:[1,1000], run:(s,t,p)=>{ s.play('bossAlert', p); } },
};

// noms de compatibilité: les anciens appels du jeu (sfx.laser(), sfx.explosion()...) continuent de marcher
Object.keys(SFX_LIB).forEach(k=>{ Sfx.prototype[k] = function(p){ this.play(k, p); }; });

Sfx.prototype.explosion = function(p){ this.play('boomMed', p); };

Sfx.prototype.explosionBig = function(p){ this.play('boomBig', p); };

Sfx.prototype.eventChime = function(){ this.play('evCrystal'); };

Sfx.prototype.nebulaWarn = function(){ this.play('nebulaWarn'); };

Sfx.prototype.nebulaEnter = function(){ this.play('nebulaEnter'); };

Sfx.prototype.nebulaExit = function(){ this.play('nebulaExit'); };

Sfx.prototype.hitTick = function(p){ this.play('hitEnemy', p); };

Sfx.prototype.eventStart = function(kind){ this.play({ crystal:'evCrystal', meteors:'evMeteors', swarm:'evSwarm', mines:'evMines', goldrush:'evGold', kamikaze:'evKamikaze', spiders:'evSpiders', elite:'evElite', bombard:'evBombard', frenzy:'evFrenzy', flip:'evFlip', magnet:'evMagnet', nebula:'evNebula', bossbonus:'evElite', minibh:'evFlip', bigbh:'evFlip', corridor:'evMeteors', eclipse:'evNebula', emp:'evBombard', statik:'evBombard', ice:'evNebula', shieldwall:'evElite', plasma:'evFlip' }[kind] || 'evCrystal'); };

const sfx = new Sfx();
