"use strict";
// Garage : décor et assemblage des sprites, indépendants des compétences de combat.
const AtelierGarage = (()=>{
  let initialized = false;
  const path = 'assets/atelier/';
  const modules = {
    none: { file:'icone-socle-vide.png', name:'SANS MODULE', text:'Socle libre.' },
    magnet: { file:'module-aimant-v2.png', name:'AIMANT', text:'Aimant géant · aperçu visuel', x:349, y:273, width:310 },
    cannon: { file:'module-canon.png', name:'CANON', text:'Canon industriel · aperçu visuel', x:413, y:342, width:215 },
  };
  function setup(){
    if (initialized) return; initialized = true;
    const page=document.getElementById('pageHangar');
    const root=document.createElement('div');root.id='atelierNext';
    root.innerHTML=`<div class="an-scene"><img class="an-bg" src="${path}atelier-calibre-detaille.png" alt="Garage AGP"><span class="an-post">POSTE 07 · MAINTENANCE</span><div class="an-depth"><div class="an-ship"><img class="an-van" src="${path}vehicule-nu.png" alt="Camionnette AGP-77"><img id="anModule" hidden alt=""></div></div></div><div class="an-panel"><h2>CAMIONNETTE AGP-77</h2><p>Atelier de personnalisation</p><div class="an-tabs"><button data-section="paint">PEINTURE</button><button data-section="body">CARROSSERIE</button><button data-section="modules">MODULES</button></div><div id="anCards"></div><p id="anDescription" aria-live="polite"></p><small>Apparence du garage · les atouts de mission se règlent en R&D.</small><button id="anMotion" aria-pressed="true">MOUVEMENTS : OUI</button></div>`;
    page.appendChild(root);
    let selection='none',motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { const saved=localStorage.getItem('ssx_atelier_preview_module');if(modules[saved])selection=saved; } catch {}
    const sprite=document.getElementById('anModule');
    function applyModule(id){selection=id;const m=modules[id];sprite.hidden=id==='none';if(id!=='none'){sprite.src=path+m.file;sprite.alt=m.name;sprite.style.left=m.x/768*100+'%';sprite.style.top=m.y/820*100+'%';sprite.style.width=m.width/768*100+'%';}try{localStorage.setItem('ssx_atelier_preview_module',id)}catch{} }
    function render(section){
      root.querySelectorAll('[data-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.section===section)));
      const cards=document.getElementById('anCards');cards.replaceChildren();
      if(section==='modules'){
        cards.className='an-cards';
        Object.entries(modules).forEach(([id,m])=>{const b=document.createElement('button');b.setAttribute('aria-pressed',String(selection===id));const image=document.createElement('img');image.src=path+m.file;image.alt='';const label=document.createElement('span');label.textContent=m.name;b.append(image,label);b.onclick=()=>{applyModule(id);sfx.uiSelect();render('modules')};cards.appendChild(b)});
        document.getElementById('anDescription').textContent=modules[selection].text;
      } else {
        cards.className='an-catalog';const image=document.createElement('img');image.src=path+(section==='paint'?'icone-kit-peinture.png':'icone-kit-carrosserie.png');image.alt=section==='paint'?'Kit de peinture':'Kit de carrosserie';cards.appendChild(image);
        document.getElementById('anDescription').textContent=section==='paint'?'Livrées Origine, Braise et Vide · visuels montés à venir.':'Protections et pare-chocs · visuels montés à venir.';
      }
    }
    root.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{sfx.uiSelect();render(b.dataset.section)});
    const scene=root.querySelector('.an-scene');scene.onpointermove=e=>{if(!motion||e.pointerType==='touch')return;const r=scene.getBoundingClientRect();scene.style.setProperty('--mx',(e.clientX-r.left)/r.width*2-1);scene.style.setProperty('--my',(e.clientY-r.top)/r.height*2-1)};scene.onpointerleave=()=>{scene.style.setProperty('--mx',0);scene.style.setProperty('--my',0)};
    function setMotion(){root.classList.toggle('an-still',!motion);const b=document.getElementById('anMotion');b.setAttribute('aria-pressed',String(motion));b.textContent='MOUVEMENTS : '+(motion?'OUI':'NON');scene.onpointerleave()}
    document.getElementById('anMotion').onclick=()=>{motion=!motion;setMotion()};applyModule(selection);render('modules');setMotion();
  }
  return {setup};
})();
