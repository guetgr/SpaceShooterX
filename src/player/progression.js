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

  // cartes proposées à la montée de niveau : réglages du canon + cartes d'assemblage des technologies emportées pas encore assemblées
  cardPool(){
    const n = this.cardCount(), eligible = u => !(u.minLevel && this.level < u.minLevel), extra = this.assemblyCards().concat(this.techCards());
    const available = UPGRADE_POOL.filter(u => eligible(u) && (this.upgradeCounts[u.id]||0) < u.max).concat(extra);
    return available.length >= n ? available : UPGRADE_POOL.filter(eligible).concat(extra);
  },

  // tire n cartes ; tant qu'une technologie emportée n'est pas assemblée, une carte d'assemblage en fait partie (jamais de tirage vide)
  drawCards(pool, n){
    const picks = Phaser.Utils.Array.Shuffle(pool.slice()).slice(0, n), asm = pool.filter(u=> u.asm);
    if (picks.length && asm.length && !picks.some(u=> u.asm)) picks[picks.length - 1] = Phaser.Utils.Array.GetRandom(asm);
    return picks;
  },

  showUpgradeCards(){
    sfx.cardsOpen();
    this.renderCardChoices(this.drawCards(this.cardPool(), this.cardCount()));
    document.getElementById('luNorma').textContent = Norma.pick('cards');
    document.getElementById('levelup').classList.remove('hidden');
  },

  // une carte « ASSEMBLAGE : <technologie> » par technologie emportée non assemblée
  assemblyCards(){
    return Object.keys(this.techState || {}).filter(id=> !this.techState[id].assembled).map(id=>{
      const t = TECH_BY_ID[id];
      return { id:'asm_' + id, asm:true, icon:t.icon, name:'ASSEMBLAGE : ' + t.name, desc:t.desc, max:1, category:'weapon', apply:()=> this.techAssemble(id) };
    });
  },

  // exécute un effet de technologie ; soigne de ce que la coque et le bouclier gagnent, ajuste les esquives
  techEffect(fn){
    const hp0 = this.stats.maxHp, sh0 = this.stats.shieldMax, dg0 = this.stats.dodgeCharges;
    fn();
    if (this.stats.maxHp > hp0) this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.maxHp - hp0);
    if (this.stats.shieldMax > sh0) this.shield = Math.min(this.stats.shieldMax, this.shield + this.stats.shieldMax - sh0);
    this.dodgeCharges += this.stats.dodgeCharges - dg0;
  },

  // assemble une technologie du chargement : effet de base, puis ses rangs de R&D
  techAssemble(id){
    const st = this.techState[id], t = TECH_BY_ID[id]; if (!st || st.assembled) return;
    st.assembled = true;
    this.techEffect(()=>{ t.assemble(this.stats, this); rdApplyRanks(id, this.stats, st.rang, this); });
    this.codexMark('skills', id); this.codexMark('usedSkills', id);      // collection : la technologie est « utilisée » dès son assemblage
  },

  // cartes des technologies assemblées : leurs améliorations (3 par mission au plus) et, si elle est recherchée en R&D, leur spécialisation
  // (après 2 cartes de la technologie dans la mission)
  techCards(){
    const out = [];
    Object.keys(this.techState || {}).forEach(id=>{
      const st = this.techState[id], t = TECH_BY_ID[id]; if (!st.assembled) return;
      const kind = t.tag ? 'weapon' : 'utility';
      t.upgrades.forEach(u=>{
        const cid = 'up_' + id + '_' + u.id; if ((this.upgradeCounts[cid]||0) >= 3) return;
        out.push({ id:cid, tech:id, icon:t.icon, name:u.name, desc:u.desc, max:3, category:kind, apply:()=> this.techEffect(()=> u.inc(this.stats, this)) });
      });
      const sid = 'spe_' + id;
      if (t.spe && st.spe && st.picks >= 2 && !this.upgradeCounts[sid])
        out.push({ id:sid, tech:id, icon:t.icon, name:'SPECIALISATION : ' + t.spe.name, desc:t.spe.desc, max:1, category:kind, apply:()=> this.techEffect(()=> t.spe.apply(this.stats, this)) });
    });
    return out;
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
        if (u.tech && this.techState[u.tech] && u.id.indexOf('up_') === 0) this.techState[u.tech].picks += 1;
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
    this.renderCardChoices(this.drawCards(this.cardPool(), n));
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
