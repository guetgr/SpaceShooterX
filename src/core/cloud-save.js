"use strict";
// Clés de sauvegarde et copie de secours dans la base privée de la plateforme (CloudSave).

const SAVE_KEYS = ['ssx_tuto_v1','ssx_highscore_v1','ssx_meta_v2','ssx_meta_v3','ssx_bestiary_v1','ssx_muted','ssx_music_muted','ssx_leaderboard_v1','ssx_playername_v1','ssx_achv_v1','ssx_codex_v1','ssx_pacts_v1','ssx_bossbag_v1','ssx_worlds_v1','ssx_skin_v1','ssx_ship_parts_v1'];

const _lsSet = Storage.prototype.setItem, _lsRem = Storage.prototype.removeItem;

function rawSet(k, v){ try { _lsSet.call(localStorage, k, v); } catch(e){ /* ignore */ } }

function rawGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }

const CloudSave = {
  ok:false, ref:null, status:'local', restored:false, lastOk:0, _busy:false, _tm:null,
  gather(){ const d = {}; SAVE_KEYS.forEach(k=>{ const v = rawGet(k); if (v !== null) d[k] = v; }); return d; },
  async init(){
    try {
      if (!window.claude || !window.claude.use) return;
      const db = await window.claude.use('db'), user = await window.claude.use('user');
      if (!db || !user) return;
      const id = await user.id(); if (!id) return;
      this.ref = db.collection('data/users/' + id).doc('save'); this.ok = true; this.status = 'cloud';
    } catch(e){ this.ok = false; }
  },
  // au démarrage: si la copie cloud est plus récente (ou si rien n'est en local), on la restaure; sinon on envoie la copie locale
  async sync(){
    if (!this.ok) return;
    try {
      const snap = await this.ref.get();
      const localT = parseInt(rawGet('ssx_saved_at') || '0', 10) || 0;
      const localHas = !!(rawGet('ssx_meta_v3') || rawGet('ssx_meta_v2') || rawGet('ssx_playername_v1'));
      if (snap.exists){
        const doc = snap.data() || {}, cloudT = doc.t || 0, keys = doc.keys || {};
        if (cloudT > localT || !localHas){
          Object.keys(keys).forEach(k=>{ if (SAVE_KEYS.indexOf(k) >= 0 && typeof keys[k] === 'string') rawSet(k, keys[k]); });
          if (typeof keys.ssx_meta_v3 !== 'string'){ try { _lsRem.call(localStorage, 'ssx_meta_v3'); } catch(e){ /* ignore */ } }      // copie cloud d'avant la v3 : la migration relira sa v2
          rawSet('ssx_saved_at', String(cloudT)); this.restored = true; this.status = 'restauré';
        } else if (localT > cloudT){ await this.push(); }
      } else if (localHas){ await this.push(); }
    } catch(e){ this.status = 'erreur'; }
  },
  async push(){
    if (!this.ok || this._busy) return;
    const keys = this.gather();
    if (!keys.ssx_meta_v3 && !keys.ssx_meta_v2 && !keys.ssx_playername_v1) return;      // jamais d'envoi d'une sauvegarde vide: elle écraserait la copie de secours
    this._busy = true; const t = Date.now();
    try { await this.ref.set({ t, keys }); rawSet('ssx_saved_at', String(t)); this.status = 'cloud'; this.lastOk = t; }
    catch(e){ this.status = 'erreur'; }
    finally { this._busy = false; }
  },
  schedule(){ if (!this.ok) return; clearTimeout(this._tm); this._tm = setTimeout(()=> this.push(), 2500); },
  boot(start){
    let done = false; const go = ()=>{ if (!done){ done = true; start(); } };
    const timer = setTimeout(go, 2500);                         // la plateforme ne répond pas: on démarre quand même
    this.init().then(()=> this.sync()).catch(()=>{}).then(()=>{
      clearTimeout(timer);
      if (done && this.restored){                              // restauration arrivée après le démarrage: on recharge si on est encore au menu
        const sc = window.__ssxScene;
        if (sc && !sc.running && !sc.hasActiveRun) location.reload();
      }
      go();
    });
  },
  // code de sauvegarde manuel (à copier / coller): marche partout
  exportCode(){ try { return 'SSX1:' + btoa(unescape(encodeURIComponent(JSON.stringify(this.gather())))); } catch(e){ return ''; } },
  importCode(str){
    try {
      str = String(str || '').trim(); if (str.indexOf('SSX1:') !== 0) return false;
      const d = JSON.parse(decodeURIComponent(escape(atob(str.slice(5)))));
      if (!d || typeof d !== 'object' || !(d.ssx_meta_v3 || d.ssx_meta_v2)) return false;
      SAVE_KEYS.forEach(k=>{ if (typeof d[k] === 'string') rawSet(k, d[k]); });
      rawSet('ssx_saved_at', String(Date.now()));
      return true;
    } catch(e){ return false; }
  }
};

// toute écriture d'une clé de sauvegarde déclenche (en différé) l'envoi vers la base privée
try {
  Storage.prototype.setItem = function(k, v){ _lsSet.call(this, k, v); try { if (this === localStorage && SAVE_KEYS.indexOf(k) >= 0) CloudSave.schedule(); } catch(e){ /* ignore */ } };
  Storage.prototype.removeItem = function(k){ _lsRem.call(this, k); try { if (this === localStorage && SAVE_KEYS.indexOf(k) >= 0) CloudSave.schedule(); } catch(e){ /* ignore */ } };
} catch(e){ /* ignore */ }
