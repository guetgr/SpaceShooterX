"use strict";
// Méthodes de GameScene — montée de niveau, cartes d'amélioration, palier du vaisseau.
mixin(GameScene, {
  levelUp(){
    this.xp -= this.xpToNext;
    this.level += 1;
    this.stats.damage *= 1.012; this.stats.fireRate *= 0.994; this.stats.maxHp += 2; this.hp = Math.min(this.stats.maxHp, this.hp + 2);      // chaque niveau: un petit bonus permanent (+1,2% dégâts, +0,6% cadence, +2 PV)
    this.xpToNext = Math.round(this.xpToNext * 1.32 * this.stats.xpToNextMul + 4);
    this.running = false;
    sfx.levelup();
    this.physics.world.pause();
    this.showUpgradeCards();
  },

  showUpgradeCards(){
    sfx.cardsOpen();
    const eligible = u => {
      if (u.minLevel && this.level < u.minLevel) return false;
      if (u.legendary) return false;                                  // armes légendaires: uniquement dans la récompense d'un boss
      if (u.requiresTree && !(this.treeState[u.requiresTree] > 0)) return false;
      return true;
    };
    const n = this.cardCount();
    const available = UPGRADE_POOL.filter(u => eligible(u) && (this.upgradeCounts[u.id]||0) < u.max);
    const fallback = UPGRADE_POOL.filter(eligible);
    const pool = available.length >= n ? available : fallback;
    this.currentCardPool = pool;
    const picks = Phaser.Utils.Array.Shuffle(pool.slice()).slice(0,n);
    this.renderCardChoices(picks);
    document.getElementById('luNorma').textContent = Norma.pick('cards');
    document.getElementById('levelup').classList.remove('hidden');
  },

  // nombre de cartes proposées (2 de base, +1 par rang d'INTUITION, 5 au maximum)
  cardCount(){ return Math.max(1, Math.min(5, Math.round(this.stats.cardChoices))); },

  renderCardChoices(picks){
    const wrap = document.getElementById('cardsWrap');
    wrap.innerHTML = '';
    wrap.classList.toggle('many', picks.length >= 4);
    picks.forEach(u=>{
      const div = document.createElement('div');
      div.className = 'card' + (u.id.indexOf('fus_') === 0 ? ' fusion' : '');
      div.innerHTML = '<div class="card-icon">'+pxImg(u.icon, 32)+'</div><div class="card-name">'+u.name+'</div><div class="card-desc">'+u.desc+'</div>';
      div.onclick = ()=>{
        sfx.cardPick();
        u.apply(this.stats);
        this.upgradeCounts[u.id] = (this.upgradeCounts[u.id]||0)+1;
        this.codexMark(u.id.indexOf('fus_') === 0 ? 'fusions' : 'cards', u.id);
        // ECLAIR DE GENIE: la carte peut compter double (sans dépasser son maximum)
        if (this.stats.doubleCardChance > 0 && this.upgradeCounts[u.id] < u.max && Math.random() < this.stats.doubleCardChance){
          u.apply(this.stats);
          this.upgradeCounts[u.id] += 1;
          this.notice('ECLAIR DE GENIE', u.name + ' compte double !');
        }
        if (u.id === 'life'){
          this.hp = Math.min(this.stats.maxHp, this.hp + 20);
        }
        if (u.heal) this.hp = Math.min(this.stats.maxHp, this.hp + u.heal);
        if (u.id === 'shield'){
          this.shield = Math.min(this.stats.shieldMax, this.shield + 30);
        }
        if (u.category === 'weapon'){
          this.weaponUpgradeCount += 1;
          this.updateShipTier();
        } else if (u.category === 'engine'){
          this.engineUpgradeCount += 1;
        }
        document.getElementById('levelup').classList.add('hidden');
        this.physics.world.resume();
        this.running = true;
        this.updateHud(false);
      };
      wrap.appendChild(div);
    });
    const rerollBtn = document.getElementById('rerollBtn');
    rerollBtn.textContent = 'RELANCER (' + this.rerollsLeft + ')';
    rerollBtn.disabled = this.rerollsLeft <= 0;
    rerollBtn.style.display = (this.stats.rerolls <= 0 && this.rerollsLeft <= 0) ? 'none' : '';   // pas de bouton tant qu'on n'a aucune relance
  },

  rerollCards(){
    if (this.rerollsLeft <= 0) return;
    this.rerollsLeft -= 1;
    sfx.reroll();
    const n = this.cardCount();
    const pool = (this.currentCardPool && this.currentCardPool.length >= n) ? this.currentCardPool : UPGRADE_POOL;
    const picks = Phaser.Utils.Array.Shuffle(pool.slice()).slice(0,n);
    this.renderCardChoices(picks);
  },

  updateShipTier(){
    let tier = 1;
    if (this.weaponUpgradeCount >= 10) tier = 4;
    else if (this.weaponUpgradeCount >= 6) tier = 3;
    else if (this.weaponUpgradeCount >= 3) tier = 2;
    // niveau de menace: plus l'arbre permanent est investi, plus le vaisseau
    // démarre déjà évolué (sans retirer ce que les upgrades en jeu apportent)
    tier = Math.max(tier, this.alertLevel);
    tier = Math.min(4, tier);
    if (tier === this.shipTier) return;
    this.shipTier = tier;
    const key = ['playerBase','playerBase','playerT2','playerT3','playerT4'][tier];
    this.player.setTexture(key);
    this.shieldAura.setTexture('aura_' + key);
    this.player.body.setSize(150, 170);
    this.cameras.main.flash(160, 79, 242, 255, false);
    this.spawnHitParticles(this.player.x, this.player.y, 16);
  },
});
