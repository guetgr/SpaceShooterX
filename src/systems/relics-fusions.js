"use strict";
// Méthodes de GameScene — choix de reliques et fusions.
mixin(GameScene, {
  /* ---------- RELIQUES DE BOSS ---------- */
  showRelicChoice(bossId){
    sfx.relicOpen();
    if (!this.running){ this.time.delayedCall(700, ()=> this.showRelicChoice(bossId)); return; }          // une autre fenêtre est ouverte: on réessaie juste après
    const owned = new Set((this.relics || []).map(x=> x.id));
    const list = (RELICS[bossId] || []).filter(r=> !owned.has(r.id));                  // une compétence de boss est unique: jamais deux fois la même
    this.pickFusions(2).forEach(f=> list.push(f));
    { const lw = Phaser.Utils.Array.Shuffle(UPGRADE_POOL.filter(u=> u.legendary && this.treeState[u.requiresTree] > 0 && !(this.upgradeCounts[u.id] > 0))).slice(0, 1); lw.forEach(u=> list.push(u)); }   // une arme légendaire (si débloquée dans l'arbre)                                      // les fusions (légendaires) ne se débloquent que dans la récompense d'un boss
    if (!list.length || !this.running){ if (this._relicNext && this._relicNext.length){ const nx = this._relicNext.shift(); this.time.delayedCall(350, ()=> this.showRelicChoice(nx)); } return; }
    this.running = false;
    this.physics.world.pause();
    const wrap = document.getElementById('cardsWrap');
    wrap.innerHTML = ''; wrap.classList.toggle('many', list.length >= 4);
    const title = document.querySelector('#levelup .lu-title');
    const oldTitle = title.textContent;
    title.textContent = 'RECOMPENSE DE BOSS — CHOISIS-EN UNE';
    document.getElementById('rerollBtn').style.display = 'none';
    list.forEach(r=>{
      const div = document.createElement('div');
      div.className = 'card fusion';
      div.innerHTML = '<div class="card-icon">' + pxImg(r.icon, 32) + '</div><div class="card-name">' + (r.legendary ? '★ ' : '') + r.name + '</div><div class="card-desc">' + (r.legendary ? 'LEGENDAIRE — ' : '') + r.desc + '</div>';
      div.onclick = ()=>{
        sfx.cardPick();
        if (r.legendary){                                       // arme légendaire: remplace l'arme actuelle
          r.apply(this.stats); this.upgradeCounts[r.id] = 1; this.codexMark('cards', r.id);
          this.weaponUpgradeCount += 1; this.updateShipTier();
        } else if (r.id.indexOf('fus_') === 0){                       // fusion légendaire: appliquée une seule fois
          r.apply(this.stats); this.upgradeCounts[r.id] = 1; this.codexMark('fusions', r.id);
          if (r.heal) this.hp = Math.min(this.stats.maxHp, this.hp + r.heal);
        } else {
          r.fn(this);
          this.relics.push(r);
          this.codexMark('relics', r.id);
          const row = document.getElementById('relicRow');
          if (row) row.innerHTML = this.relics.map(x=>pxImg(x.icon, 14)).join('');
        }
        title.textContent = oldTitle;
        document.getElementById('levelup').classList.add('hidden');
        this.physics.world.resume();
        this.running = true;
        this.updateHud(false);
        if (this._relicNext && this._relicNext.length){ const nx = this._relicNext.shift(); this.time.delayedCall(350, ()=> this.showRelicChoice(nx)); }   // relique du 2e boss
      };
      wrap.appendChild(div);
    });
    document.getElementById('levelup').classList.remove('hidden');
  },

  // une carte de fusion est proposée (à la place d'une autre) quand ses conditions sont remplies
  pickFusions(max){
    return Phaser.Utils.Array.Shuffle(this.eligibleFusions()).slice(0, max || 1);
  },

  pickFusion(){ const l = this.eligibleFusions(); return l.length ? l[Math.floor(Math.random()*l.length)] : null; },

  eligibleFusions(){
    return FUSIONS.filter(f=>{
      if ((this.upgradeCounts[f.id]||0) > 0) return false;
      if (f.cards && !f.cards.every(c=> (this.upgradeCounts[c[0]]||0) >= c[1])) return false;
      if (f.tree && !f.tree.every(t=> this.treeState[t] > 0)) return false;
      return true;
    });
  },
});
