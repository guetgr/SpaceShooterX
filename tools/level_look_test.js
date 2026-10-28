"use strict";
// Test sans navigateur : décors et musiques choisis par le JSON (WORLD_BG_KINDS, surcharge `audio`), avec des bouchons.
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const R = path.join(__dirname, '..', 'src');
const read = f => fs.readFileSync(path.join(R, f), 'utf8');

// (1) WORLD_BG_KINDS == méthodes wbgBuild_* de src/world/bg-monde.js
const bgSrc = read('world/bg-monde.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(bgSrc.slice(bgSrc.indexOf('const WORLD_BG_KINDS'), bgSrc.indexOf('\n', bgSrc.indexOf('const WORLD_BG_KINDS'))) + '\nthis.K = WORLD_BG_KINDS;', ctx);
const methods = [...bgSrc.matchAll(/^  wbgBuild_(\w+)\(/gm)].map(m => m[1]);
assert.ok(methods.length >= 6, 'wbgBuild_* introuvables');
assert.deepStrictEqual([...ctx.K].sort(), methods.sort(), 'WORLD_BG_KINDS doit égaler les méthodes wbgBuild_*');

// (2) recherche de musique : sans surcharge, l'entrée d'origine ; avec, la surcharge
const mSrc = read('audio/music.js');
const head = mSrc.slice(0, mSrc.indexOf('class FileMusic'));
const c2 = { MUSIC_LEN:{} }; vm.createContext(c2);
vm.runInContext(head + '\nthis.T = { MUSIC_LEVEL, MUSIC_BOSS, musicLevelKeys, musicBossKeys, MUSIC_BOSS_KEYS };', c2);
const { MUSIC_LEVEL, MUSIC_BOSS, musicLevelKeys, musicBossKeys, MUSIC_BOSS_KEYS } = c2.T;
for (const s of [undefined, null, {}, { lvl:'w1-l1' }, { lvl:'w1-l1', lvAudio:null }, { lvl:'w1-l1', lvAudio:{} }, { lvl:'w1-l1', lvAudio:{ boss:'w1b_pdg_a' } }])
  for (const id of Object.keys(MUSIC_LEVEL)) assert.strictEqual(musicLevelKeys(s, id), MUSIC_LEVEL[id]);       // même objet : rien ne change
for (const s of [undefined, null, {}, { fbId:'meteo' }, { fbId:'meteo', lvAudio:{ level:['w1_l2_a'] } }])
  for (const id of Object.keys(MUSIC_BOSS)) assert.strictEqual(musicBossKeys(s, id), MUSIC_BOSS[id]);
const sc = { lvl:'w1-l1', fbId:'meteo', lvAudio:{ level:['w1_l2_a', 'w1_l2_b'], boss:'w1b_pdg_a' } };
assert.deepStrictEqual(Array.from(musicLevelKeys(sc, 'w1-l1')), ['w1_l2_a', 'w1_l2_b']);
assert.strictEqual(musicLevelKeys(sc, 'w1-l2'), MUSIC_LEVEL['w1-l2']);                                           // autre ordre : intact
assert.deepStrictEqual(Array.from(musicBossKeys(sc, 'fb_meteo')), ['w1b_pdg_a']);
assert.strictEqual(musicBossKeys(sc, 'fb_pdg'), MUSIC_BOSS.fb_pdg);                                              // un autre boss : intact
assert.deepStrictEqual(Array.from(musicLevelKeys({ lvl:'w1-l5', lvAudio:{ level:['w1_l1_a'] } }, 'w1-l5')), ['w1_l1_a']);   // ordre sans musique propre
assert.ok(MUSIC_BOSS_KEYS.includes('w1b_pdg_a'));

// (3) l'éditeur reçoit les catalogues : branchés dans editor-hook.js
const hook = read('dev/editor-hook.js');
assert.ok(/decorCatalog:decorCatalog\(\)/.test(hook) && /musicCatalog:musicCatalog\(\)/.test(hook));
console.log('OK : WORLD_BG_KINDS = wbgBuild_* (' + methods.length + '), musique sans surcharge identique, avec surcharge appliquée, catalogues branchés');
