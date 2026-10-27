"use strict";
// Planches de sprites chargées depuis assets/sprites (constantes *_B64).

const GRUNT_SHEET_B64 = asset('sprites/grunt_sheet.png');

const EXPLOSION_SHEET_B64 = asset('sprites/explosion_sheet.png');

const TURRET_SHEET_B64 = asset('sprites/turret_sheet.png');

const TURRET_EXPL_B64 = asset('sprites/turret_expl.png');

const TURRET_BULLET_B64 = asset('sprites/turret_bullet.png');

const SHOOTER_SHEET_B64 = asset('sprites/shooter_sheet.png');

const SHOOTER_EXPL_B64 = asset('sprites/shooter_expl.png');

const SHOOTER_BULLET_B64 = asset('sprites/shooter_bullet.png');

const DRONE2_SHEET_B64 = asset('sprites/drone2_sheet.png');

const DRONE2_EXPL_B64 = asset('sprites/drone2_expl.png');

const DIVER2_SHEET_B64 = asset('sprites/diver2_sheet.png');

const DIVER2_EXPL_B64 = asset('sprites/diver2_expl.png');

const TANK2_SHEET_B64 = asset('sprites/tank2_sheet.png');

const TANK2_EXPL_B64 = asset('sprites/tank2_expl.png');

const TANK2_BULLET_B64 = asset('sprites/tank2_bullet.png');

const ELITE2_SHEET_B64 = asset('sprites/elite2_sheet.png');

const ELITE2_EXPL_B64 = asset('sprites/elite2_expl.png');

const ELITE2_BULLET_B64 = asset('sprites/elite2_bullet.png');

const CHARO_SHEET_B64 = asset('sprites/charo_sheet.png');

const CHARO_EXPL_B64 = asset('sprites/charo_expl.png');

const CHARO_BULLET_B64 = asset('sprites/charo_bullet.png');

const BOMBER2_SHEET_B64 = asset('sprites/bomber2_sheet.png');

const BOMBER2_EXPL_B64 = asset('sprites/bomber2_expl.png');

const BOMBER2_BULLET_B64 = asset('sprites/bomber2_bullet.png');

const SWARMER2_SHEET_B64 = asset('sprites/swarmer2_sheet.png');

const SWARMER2_EXPL_B64 = asset('sprites/swarmer2_expl.png');

const PLAYER_BASE_B64 = asset('sprites/player_base.webp');

const PLAYER_T2_B64 = asset('sprites/player_t2.webp');

const PLAYER_T3_B64 = asset('sprites/player_t3.webp');

const PLAYER_T4_B64 = asset('sprites/player_t4.webp');

const EARTH_B64 = asset('sprites/earth.webp');

const PLAYER_BULLET_B64 = asset('sprites/player_bullet.png');

const PLAYER_MISSILE_B64 = asset('sprites/player_missile.png');

const BOSS2_SHEET_B64 = asset('sprites/boss2_sheet.png');

const BOSS2_EXPL_B64 = asset('sprites/boss2_expl.png');

const BOSS2_BULLET_B64 = asset('sprites/boss2_bullet.png');

const SHIELDEDGRUNT2_B64 = asset('sprites/shieldedgrunt2.png');

const SHIELDEDGRUNT2_EXPL_B64 = asset('sprites/shieldedgrunt2_expl.png');

const MINE2_B64 = asset('sprites/mine2.png');

const MINE2_EXPL_B64 = asset('sprites/mine2_expl.png');

const SPLITTER_IDLE_B64 = asset('sprites/splitter_idle.png');

const SPLITTER_EXPL_B64 = asset('sprites/splitter_expl.png');

const SPLITTER_MINI_IDLE_B64 = asset('sprites/splitter_mini_idle.png');

const SPLITTER_MINI_EXPL_B64 = asset('sprites/splitter_mini_expl.png');

const SNIPER_IDLE_B64 = asset('sprites/sniper_idle.png');

const SNIPER_BULLET_B64 = asset('sprites/sniper_bullet.png');

const HEALER_IDLE_B64 = asset('sprites/healer_idle.png');

const HEALER_CAST_B64 = asset('sprites/healer_cast.png');

const MOTHER_IDLE_B64 = asset('sprites/mother_idle.png');

const MOTHER_CHARGE_B64 = asset('sprites/mother_charge.png');

const MOTHER_DEATH_B64 = asset('sprites/mother_death.png');

const KAMI_IDLE_B64 = asset('sprites/kami_idle.png');

const KAMI_CHARGE_B64 = asset('sprites/kami_charge.png');

const KAMI_BOOM_B64 = asset('sprites/kami_boom.png');

const VORTEX_IDLE_B64 = asset('sprites/vortex_idle.png');

const VORTEX_ARRIVE_B64 = asset('sprites/vortex_arrive.png');

const VORTEX_DEATH_B64 = asset('sprites/vortex_death.png');

const GHOST_IDLE_B64 = asset('sprites/ghost_idle.png');

const GHOST_FADE_B64 = asset('sprites/ghost_fade.png');

const GHOST_EXPL_B64 = asset('sprites/ghost_expl.png');

const SP_IDLE_B64 = asset('sprites/sp_idle.png');

const SP_WALK_B64 = asset('sprites/sp_walk.png');

const SP_CROUCH_B64 = asset('sprites/sp_crouch.png');

const SP_ARRIVE_B64 = asset('sprites/sp_arrive.png');

const SP_DEATH_B64 = asset('sprites/sp_death.png');

const GO_IDLE_B64 = asset('sprites/go_idle.png');

const GO_ARRIVE_B64 = asset('sprites/go_arrive.png');

const GO_DEATH_B64 = asset('sprites/go_death.png');

const FAU_P1_B64 = asset('sprites/fau_p1.png');

const FAU_P2_B64 = asset('sprites/fau_p2.png');

const FAU_P3_B64 = asset('sprites/fau_p3.png');

const FAU_SECOND_B64 = asset('sprites/fau_second.png');

const FAU_TRANS_B64 = asset('sprites/fau_trans.png');

const FAU_STUN_B64 = asset('sprites/fau_stun.png');

const FAU_DIVE_B64 = asset('sprites/fau_dive.png');

const FAU_DEATH_B64 = asset('sprites/fau_death.png');

const FAU_CR_B64 = asset('sprites/fau_cr.png');

const RU_P1_B64 = asset('sprites/ru_p1.png');

const RU_P2_B64 = asset('sprites/ru_p2.png');

const RU_P3_B64 = asset('sprites/ru_p3.png');

const RU_TRANS_B64 = asset('sprites/ru_trans.png');

const RU_DEATH_B64 = asset('sprites/ru_death.png');

const RU_POD_B64 = asset('sprites/ru_pod.png');

const RU_SPORE_B64 = asset('sprites/ru_spore.png');

const B64_PRP1 = asset('sprites/prp1.png');

const B64_PRP2 = asset('sprites/prp2.png');

const B64_PRP3 = asset('sprites/prp3.png');

const B64_PRSECOND = asset('sprites/prsecond.png');

const B64_PRDEATH = asset('sprites/prdeath.png');

const B64_PRMIRROR = asset('sprites/prmirror.png');

const B64_PRSPIRAL = asset('sprites/prspiral.png');

const B64_KRP1 = asset('sprites/krp1.png');

const B64_KRP2 = asset('sprites/krp2.png');

const B64_KRP3 = asset('sprites/krp3.png');

const B64_KRTRANS = asset('sprites/krtrans.png');

const B64_KRSECOND = asset('sprites/krsecond.png');

const B64_KRDEATH = asset('sprites/krdeath.png');

const B64_KRBALL = asset('sprites/krball.png');

const B64_KRBASE = asset('sprites/krbase.png');

const B64_ECP1 = asset('sprites/ecp1.png');

const B64_ECP2 = asset('sprites/ecp2.png');

const B64_ECP3 = asset('sprites/ecp3.png');

const B64_ECSECOND = asset('sprites/ecsecond.png');

const B64_ECTRANS = asset('sprites/ectrans.png');

const B64_ECMIRAGE = asset('sprites/ecmirage.png');

const B64_ECDECOY = asset('sprites/ecdecoy.png');

const B64_ECHALO = asset('sprites/echalo.png');

const B64_ECORB = asset('sprites/ecorb.png');

const B64_ECDEATH = asset('sprites/ecdeath.png');

const B64_HYP1 = asset('sprites/hyp1.png');

const B64_HYP2 = asset('sprites/hyp2.png');

const B64_HYP3 = asset('sprites/hyp3.png');

const B64_HYHEAD = asset('sprites/hyhead.png');

const B64_HYVENOM = asset('sprites/hyvenom.png');

const B64_HYDEATH = asset('sprites/hydeath.png');

const B64_HYFULL = asset('sprites/hyfull.png');

const B64_DRP1 = asset('sprites/drp1.png');

const B64_DRP2 = asset('sprites/drp2.png');

const B64_DRP3 = asset('sprites/drp3.png');

const B64_DRSECOND = asset('sprites/drsecond.png');

const B64_DRTRANS = asset('sprites/drtrans.png');

const B64_DRDEATH = asset('sprites/drdeath.png');

const B64_MTRED = asset('sprites/mtred.png');

const B64_MTBLUE = asset('sprites/mtblue.png');

const B64_MTVIOLET = asset('sprites/mtviolet.png');

const B64_MTBIG = asset('sprites/mtbig.png');

const B64_MTSMALL = asset('sprites/mtsmall.png');

const B64_MTDEATH = asset('sprites/mtdeath.png');

const B64_RUBEE = asset('sprites/rubee.png');

const B64_HYSTUMP = asset('sprites/hystump.png');

const B64_HYREGROW = asset('sprites/hyregrow.png');

const SNIPER_EXPL_B64 = asset('sprites/sniper_expl.png');

const TUTO_SAT_B64 = asset('sprites/tuto_sat.webp');
const TUTO_DEBRIS_B64 = asset('sprites/tuto_debris.webp');
// Antenne-Mère (boss du tuto) : 4 états d'usure 512x512 + feuilles d'effets (lumière additive) — voir game/tuto-boss-fx.js et data/boss-antenne.js
const AC_BOSS_B64 = [0, 1, 2, 3].map(i=> asset('sprites/ac_boss' + i + '.webp'));
const AC_FX_B64 = {};
['flame', 'smoke', 'spark', 'impact', 'orb', 'charge', 'muzzle', 'boom', 'shock'].forEach(n=>{ AC_FX_B64[n] = asset('sprites/ac_fx_' + n + '.webp'); });
const SATGUN_SHEET_B64 = asset('sprites/satgun_sheet.webp');      // satellite armé : 26 images de 200x200 (idle 0-4 · charge 5-6 · recul 7-8 · dégâts 9-17 · explosion 18-25)
const BRAS_SHEET_B64 = asset('sprites/bras_sheet.webp');        // mob « Bras écartés » : 4 états d'usure 512x512 côte à côte (intact · endommagé · critique · épave)
const BR_FX_B64 = {};
['orb', 'charge', 'muzzle', 'boom', 'impact'].forEach(n=>{ BR_FX_B64[n] = asset('sprites/br_fx_' + n + '.webp'); });      // effets bleus (plasma) et explosion feu du mob
const AR_SHEET_B64 = asset('sprites/ar_sheet.webp');             // boss « Araignée de tri » : 4 états d'usure 512x512 côte à côte
const AR_FX_B64 = {};
['missile', 'boomL', 'shock'].forEach(n=>{ AR_FX_B64[n] = asset('sprites/ar_fx_' + n + '.webp'); });      // missile des bennes, grosse explosion feu, onde de choc
const MT_SHEET_B64 = asset('sprites/mt_sheet.webp');             // boss « La Météo » : 4 états d'usure 512x512 côte à côte
const MT_FX_B64 = {};
['hail', 'iceb', 'fcharge', 'fmuzzle', 'bolt', 'arc', 'glow', 'charge', 'muzzle', 'impact', 'spark', 'boomM', 'boomL', 'shock'].forEach(n=>{ MT_FX_B64[n] = asset('sprites/mt_fx_' + n + '.webp'); });      // grêlon, givre, éclair, arcs, plasma, explosions bleues
const LT_B64 = {};
['radar', 'beacon', 'rotor_toxic', 'rotor_amber', 'rotor_fire', 'rotor_hot'].forEach(n=>{ LT_B64[n] = asset('sprites/lt_' + n + '.webp'); });      // lumières tournantes (balayage radar, gyrophare, rotor du Réacteur) : jeu de lumières des boss
const RX_SHEET_B64 = asset('sprites/rx_sheet.webp');             // boss « Le Réacteur » : 4 états de surchauffe 512x512 côte à côte
const RX_FX_B64 = {};
['orb', 'arc', 'flame', 'charge', 'muzzle', 'impact', 'spark', 'glow', 'boomM', 'boomL', 'shock'].forEach(n=>{ RX_FX_B64[n] = asset('sprites/rx_fx_' + n + '.webp'); });      // effets verts (toxiques) du Réacteur
const PL_SHEET_B64 = asset('sprites/pl_sheet.webp');             // mob « Le Pilleur de cristaux » : 4 états 512x512 côte à côte
const PL_FX_B64 = {};
['beam', 'suction', 'charge', 'muzzle', 'glow', 'spark', 'impact'].forEach(n=>{ PL_FX_B64[n] = asset('sprites/pl_fx_' + n + '.webp'); });      // faisceau laser, tourbillon d'aspiration, charge...
const AN_SHEET_B64 = asset('sprites/an_sheet.webp');             // boss « L'Anneau » : 4 états 512x512 côte à côte
const AN_FX_B64 = {};
['beam', 'rotor', 'orb', 'orbHot', 'muzzle', 'charge', 'impact', 'spark', 'glow', 'glowHot', 'boomM', 'boomL', 'shock'].forEach(n=>{ AN_FX_B64[n] = asset('sprites/an_fx_' + n + '.webp'); });      // effets violets de L'Anneau et de l'Éclaireur
const PD_SHEET_B64 = asset('sprites/pd_sheet.webp');             // boss final « Le PDG dans sa tour » : 4 états 512x512 côte à côte
const PG_SHEET_B64 = asset('sprites/pg_sheet.webp');             // vaisseau de protection « Le PDG » : 4 états
const GD_SHEET_B64 = asset('sprites/gd_sheet.webp');             // agent de sécurité : vivant, givre, gelé, fissuré
const PD_FX_B64 = {};
['beam', 'orb', 'muzzle', 'charge', 'impact', 'glow', 'spark', 'boomM', 'boomL', 'shock', 'flame', 'ice', 'frost'].forEach(n=>{ PD_FX_B64[n] = asset('sprites/pd_fx_' + n + '.webp'); });      // effets dorés et glace du boss final
const EC_SHEET_B64 = asset('sprites/ec_sheet.webp');             // mob « L'Éclaireur de patrouille » : 4 états 512x512 côte à côte
const EC_FX_B64 = {};
['cone', 'coneHot', 'reticle'].forEach(n=>{ EC_FX_B64[n] = asset('sprites/ec_fx_' + n + '.webp'); });      // faisceau de balayage, viseur de verrouillage
const TUTO_NDEB = 8;
