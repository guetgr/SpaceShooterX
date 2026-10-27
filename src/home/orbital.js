"use strict";
// Route ouverte, inclinée en 3D puis projetée dans le repère logique 400 × 700.
// Les traits Phaser et les cibles HTML partagent exactement cette projection.
const HOME_ORBIT_VIEW = { cx:200, cy:270, radius:117, orbit:143, tilt:-0.48, distance:660 };
function homeOrbitPoint(t, rotation = 0){
  const v = HOME_ORBIT_VIEW, a = 2.5 - t*4.7 + rotation;
  const x = v.orbit*Math.cos(a), y = 75*Math.sin(a), z = 100*Math.sin(a);
  const s = v.distance/(v.distance-z), c = Math.cos(v.tilt), sn = Math.sin(v.tilt);
  const dx = (x*c-y*sn)*s, dy = (x*sn+y*c)*s;
  return { x:v.cx+dx, y:v.cy+dy, z, scale:s, hidden:z<0 && Math.hypot(dx,dy)<v.radius+12 };
}
mixin(HomeScene, {
  initOrbitalUi(){
    this.orbitRotation = 0;
  },
  // passe au niveau précédent/suivant du monde affiché (direction -1/1) : swipe sur la planète, ou clic direct sur un niveau visible (renderHomeMap)
  stepOrbitLevel(direction){
    const levels=WORLDS[this.homeWorld].levels, i=levels.findIndex(l=>l.id===this.homeSel);
    const next=levels[i+direction]; if(next) this.selectHomeLevel(next.id);
  },
  focusOrbitalLevel(){
    if(this.orbitTween) this.orbitTween.stop();
    const levels=WORLDS[this.homeWorld].levels, i=levels.findIndex(l=>l.id===this.homeSel);
    const t=i/Math.max(1,levels.length-1), point=homeOrbitPoint(t,this.orbitRotation||0);
    if(!point.hidden) return;
    if(this.orbitTween) this.orbitTween.stop();
    // Amène une mission occultée sur la partie avant, sans boucler la progression.
    let target=1.4-(2.5-t*4.7), current=this.orbitRotation||0;
    while(target-current>Math.PI) target-=Math.PI*2;
    while(target-current<-Math.PI) target+=Math.PI*2;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){this.orbitRotation=target;return;}
    this.orbitTween=this.tweens.add({targets:this,orbitRotation:target,duration:650,ease:'Cubic.easeInOut'});
  },
  updateOrbitalUi(){
    if(this.page!==0 || this.mapMode!=='world') return;
    const levels=WORLDS[this.homeWorld].levels, n=levels.length;
    this.drawHomeOrbit();
    document.querySelectorAll('#mapOrbit .node-slot').forEach((el,i)=>{
      const p=homeOrbitPoint(i/Math.max(1,n-1),this.orbitRotation||0);
      el.style.left=p.x+'px';el.style.top=p.y+'px';
      el.style.setProperty('--depth-scale',p.scale.toFixed(3));
      el.style.opacity=p.z<0?'.65':'1';
      el.hidden=p.hidden;
    });
  },
});
