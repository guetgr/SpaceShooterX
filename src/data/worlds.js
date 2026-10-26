"use strict";
// Mondes et niveaux : registre + validation.
// Un monde = un fichier dans data/worlds/, qui s'enregistre avec registerWorld(). Ajouter un monde = ajouter un fichier + une ligne dans scripts.json.
//
// Monde : { id, order, name, sub, boss, theme:{ glow, rim, seed, freq, bands?, palette:[couleurs sombre→clair], photo?:texture de la planète (sinon générée en code), clouds?:texture de nuages qui défilent, orbiter?:texture d'un objet en orbite }, levels:[ niveau… ] }   (le DERNIER niveau est le boss du monde)
// Niveau : { id, name, type, threat, goal, reward, spawns?, events?, boss?, zoom? }
//   type    : 'tuto' (tutoriel scripté, game/tuto.js ; flag tuto:true, sans objectif ni lvDef) · 'survive' (goal:{seconds}) · 'kill' (goal:{count}) · 'collect' (goal:{gems}) · 'boss' (boss:'<id>') · 'endless' (ancien mode infini, DEV)
//   threat  : niveau de menace 1..ALERT_CAP — c'est l'ancien « niveau d'alerte » (docs/niveaux-alerte.md), fixé par le niveau et non plus par l'arbre
//   reward  : { clear } fragments ◆ ajoutés à une victoire · { first } bonus supplémentaire à la première victoire
//   hpMul, dmgMul : réglage fin de la difficulté (× PV des ennemis et du boss, × dégâts des ennemis et du boss) en plus de `threat` ; 1 par défaut
//   zoom    : { start, end, seconds } dézoom de la caméra pendant le niveau (défauts : voir levelZoom dans game/level.js, selon la place du niveau dans le monde)
//   intro   : 'earth' = grand décollage depuis la planète du monde (la Terre pour le monde 1, sinon la planète générée du monde ; sinon décollage court)
//   spawns  : [{ type, from }] surcharge de la liste d'ennemis (sinon formule historique selon la menace)
//   events  : [{ kind, at }] événements (clés de EVENT_DEFS) déclenchés à `at` secondes

const WORLDS = [];
const LEVEL_TYPES = ['survive', 'kill', 'collect', 'boss', 'endless', 'tuto'];
let _levelIdx = null;

function registerWorld(def){
  if (WORLDS.some(w=> w.id === def.id)) throw new Error('Monde déjà enregistré : ' + def.id);
  def.levels.forEach((l, i)=>{ l.world = def.id; l.index = i; l.num = i + 1; });
  WORLDS.push(def);
  WORLDS.sort((a, b)=> a.order - b.order);
  _levelIdx = null;
  return def;
}

function worldById(id){ return WORLDS.find(w=> w.id === id) || null; }

function levelById(id){
  if (!_levelIdx){ _levelIdx = {}; WORLDS.forEach(w=> w.levels.forEach(l=>{ _levelIdx[l.id] = l; })); }
  return _levelIdx[id] || null;
}

// niveau qui suit celui-ci : le suivant du monde, sinon le premier du monde suivant (null à la toute fin)
function nextLevelOf(id){
  const l = levelById(id); if (!l) return null;
  const w = worldById(l.world);
  if (l.index + 1 < w.levels.length) return w.levels[l.index + 1];
  const wi = WORLDS.indexOf(w);
  return wi + 1 < WORLDS.length ? WORLDS[wi + 1].levels[0] : null;
}

// vérifie le format de tous les mondes ; renvoie la liste des erreurs (vide = tout est bon)
function validateWorlds(){
  const errs = [], ids = new Set();
  const cap = typeof ALERT_CAP !== 'undefined' ? ALERT_CAP : 20;
  const orders = new Set();
  WORLDS.forEach(w=>{
    const at = 'monde ' + w.id;
    if (orders.has(w.order)) errs.push(at + ' : ordre ' + w.order + ' déjà pris'); orders.add(w.order);
    if (!w.name) errs.push(at + ' : nom manquant');
    if (typeof BOSS_ORDER !== 'undefined' && BOSS_ORDER.indexOf(w.boss) < 0) errs.push(at + ' : boss inconnu « ' + w.boss + ' »');
    if (!w.levels || !w.levels.length){ errs.push(at + ' : aucun niveau'); return; }
    w.levels.forEach((l, i)=>{
      const lt = 'niveau ' + l.id;
      if (!l.id) errs.push(at + ' : niveau #' + (i + 1) + ' sans id');
      if (ids.has(l.id)) errs.push(lt + ' : id en double'); ids.add(l.id);
      if (LEVEL_TYPES.indexOf(l.type) < 0) errs.push(lt + ' : type inconnu « ' + l.type + ' »');
      if (!(l.threat >= 1 && l.threat <= cap)) errs.push(lt + ' : menace hors 1..' + cap);
      const g = l.goal || {};
      if (l.type === 'survive' && !(g.seconds > 0)) errs.push(lt + ' : goal.seconds manquant');
      if (l.type === 'kill' && !(g.count > 0)) errs.push(lt + ' : goal.count manquant');
      if (l.type === 'collect' && !(g.gems > 0)) errs.push(lt + ' : goal.gems manquant');
      if (l.type === 'boss' && typeof BOSS_ORDER !== 'undefined' && BOSS_ORDER.indexOf(l.boss) < 0) errs.push(lt + ' : boss inconnu « ' + l.boss + ' »');
      if (!l.reward || !(l.reward.clear >= 0)) errs.push(lt + ' : reward.clear manquant');
      ['hpMul', 'dmgMul'].forEach(k=>{ if (l[k] !== undefined && !(l[k] > 0)) errs.push(lt + ' : ' + k + ' doit être > 0'); });
      (l.events || []).forEach(ev=>{
        if (typeof EVENT_DEFS !== 'undefined' && !EVENT_DEFS[ev.kind]) errs.push(lt + ' : événement inconnu « ' + ev.kind + ' »');
        if (!(ev.at >= 0)) errs.push(lt + ' : événement « ' + ev.kind + ' » sans `at`');
      });
      const last = i === w.levels.length - 1;
      if (last && l.type !== 'boss') errs.push(lt + ' : le dernier niveau d\'un monde doit être un boss');
      if (last && l.type === 'boss' && l.boss !== w.boss) errs.push(lt + ' : boss différent de celui du monde (' + w.boss + ')');
      if (!last && l.type === 'boss') errs.push(lt + ' : un niveau boss doit être le dernier du monde');
    });
  });
  return errs;
}
