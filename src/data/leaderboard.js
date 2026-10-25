"use strict";
// Classement local, nom du joueur, meilleur score.

const LB_KEY = 'ssx_leaderboard_v1', NAME_KEY = 'ssx_playername_v1';

function sanitizeName(n){ return (n||'').replace(/[<>&"'`]/g,'').trim().slice(0,12); }

function getPlayerName(){ try{ return localStorage.getItem(NAME_KEY) || ''; }catch(e){ return ''; } }

function setPlayerName(n){ try{ localStorage.setItem(NAME_KEY, n); }catch(e){} }

function getLeaderboard(){ try{ const a = JSON.parse(localStorage.getItem(LB_KEY)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }

function setLeaderboard(a){ try{ localStorage.setItem(LB_KEY, JSON.stringify(a)); }catch(e){} }

function addLeaderboardEntry(entry){
  const a = getLeaderboard(); a.push(entry);
  a.sort((x,y)=> y.score - x.score);
  setLeaderboard(a.slice(0,20));
}

function getHighScore(){
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0; }
  catch(e){ return 0; }
}

function setHighScore(v){
  try { localStorage.setItem(STORAGE_KEY, String(v)); } catch(e){ /* ignore */ }
}
