"use strict";
// Bestiaire : liste des ennemis et sauvegarde.

const BESTIARY_KEY = 'ssx_bestiary_v1';

function getBestiary(){
  try {
    const raw = JSON.parse(localStorage.getItem(BESTIARY_KEY) || 'null');
    if (raw && typeof raw === 'object') return { kills: raw.kills || {} };
  } catch(e){ /* ignore */ }
  return { kills:{} };
}

function setBestiary(b){
  try { localStorage.setItem(BESTIARY_KEY, JSON.stringify(b)); } catch(e){ /* ignore */ }
}

const BESTIARY_LIST = [
  { type:'grunt',         label:'GRUNT',          tex:'gruntSheet',   frame:0 },
  { type:'diver',         label:'DIVER',          tex:'diverSheet',   frame:0 },
  { type:'shooter',       label:'SHOOTER',        tex:'shooterSheet', frame:0 },
  { type:'charo',         label:'CHARO',          tex:'charoSheet',   frame:0 },
  { type:'turret',        label:'TURRET',         tex:'turretSheet',  frame:0 },
  { type:'drone',         label:'DRONE',          tex:'droneSheet', frame:0 },
  { type:'splitter',      label:'SPLITTER',       tex:'splitterIdle', frame:0 },
  { type:'splitterMini',  label:'SPLITTER MINI',  tex:'splitterMiniIdle', frame:0 },
  { type:'shieldedGrunt', label:'GRUNT BLINDE',   tex:'shieldedGrunt2' },
  { type:'mine',          label:'MINE',           tex:'mine2' },
  { type:'tank',          label:'TANK',           tex:'tankSheet', frame:0 },
  { type:'bomber',        label:'BOMBER',         tex:'bomberSheet', frame:0 },
  { type:'sat',           label:'SATELLITE',      tex:'tutoSat', frame:0 },
  { type:'satgun',        label:'SATELLITE ARME', tex:'satgunSheet', frame:0 },
  { type:'bras',          label:'BRAS ECARTES',   tex:'brasSheet', frame:0 },
  { type:'pilleur',       label:'PILLEUR',        tex:'plSheet', frame:0 },
  { type:'eclaireur',     label:'ECLAIREUR',      tex:'ecSheet', frame:0 },
  { type:'sniper',        label:'SNIPER',         tex:'sniperIdle', frame:0 },
  { type:'swarmer',       label:'SWARMER',        tex:'swarmerSheet', frame:0 },
  { type:'healer',        label:'HEALER',         tex:'healerIdle', frame:0 },
  { type:'ghost',         label:'FANTOME',        tex:'ghostIdle', frame:0 },
  { type:'elite',         label:'ELITE',          tex:'eliteSheet', frame:0 },
  { type:'mothership',    label:'MOTHERSHIP',     tex:'motherIdle', frame:0 },
  { type:'vortex',        label:'VORTEX',         tex:'vortexIdle', frame:0 },
  { type:'kamikaze',      label:'KAMIKAZE',        tex:'kamiIdle', frame:0 },
  { type:'golden',        label:'TRESORIN',        tex:'goIdle',      frame:0 },
  { type:'spider',        label:'ARAIGNEE',        tex:'spIdle',      frame:0 },
  { type:'meteor',        label:'METEORITE',       tex:'mtRed',       frame:0 },
  { type:'boss',          label:'BOSS DREADNOUGHT', tex:'bossSheet', frame:0, bossId:'dread' }, // ancienne clé 'boss' = Dreadnought: les anciens compteurs sont conservés
  { type:'boss_faucheuse', label:'BOSS FAUCHEUSE',  bossId:'faucheuse' },
  { type:'boss_ruche',     label:'BOSS RUCHE',      bossId:'ruche' },
  { type:'boss_prisme',    label:'BOSS PRISME',     bossId:'prisme' },
  { type:'boss_kraken',    label:'BOSS KRAKEN',     bossId:'kraken' },
  { type:'boss_eclipse',   label:'BOSS ECLIPSE',    bossId:'eclipse' },
  { type:'boss_hydre',     label:'BOSS HYDRE',      bossId:'hydre' },
];
