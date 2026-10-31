"use strict";
// Route ouverte, inclinée en 3D puis projetée dans le repère logique 400 × 700.
// Les traits Phaser et les cibles HTML partagent exactement cette projection.
const HOME_ORBIT_VIEW = { cx:200, cy:270, radius:117, orbit:143, tilt:-0.48, distance:660 };
// angle où la route passe pile au milieu de l'écran, côté avant (x = 0 après inclinaison)
const HOME_ORBIT_FRONT = Math.atan2(HOME_ORBIT_VIEW.orbit*Math.cos(HOME_ORBIT_VIEW.tilt), 75*Math.sin(HOME_ORBIT_VIEW.tilt));
function homeOrbitPoint(t, rotation = 0){
  const v = HOME_ORBIT_VIEW, a = 2.5 - t*4.7 + rotation;
  const x = v.orbit*Math.cos(a), y = 75*Math.sin(a), z = 100*Math.sin(a);
  const s = v.distance/(v.distance-z), c = Math.cos(v.tilt), sn = Math.sin(v.tilt);
  const dx = (x*c-y*sn)*s, dy = (x*sn+y*c)*s;
  return { x:v.cx+dx, y:v.cy+dy, z, scale:s, hidden:z<0 && Math.hypot(dx,dy)<v.radius+12 };
}
mixin(HomeScene, {
  initOrbitalUi(){
    this.orbitDrag = null;
    this.orbitRotation = null;      // null : pas encore placé, le premier focus se fait sans animation
  },
  // passe au niveau précédent/suivant du monde affiché (direction -1/1) : swipe sur la planète, ou clic direct sur un niveau visible (renderHomeMap)
  stepOrbitLevel(direction){
    const levels=WORLDS[this.homeWorld].levels, i=levels.findIndex(l=>l.id===this.homeSel);
    const next=levels[i+direction]; if(next) this.selectHomeLevel(next.id);
  },
  // amène toujours le niveau sélectionné au milieu de l'écran (devant la planète) : toute la route tourne autour de lui
  focusOrbitalLevel(){
    if(this.orbitTween) this.orbitTween.stop();
    const levels=WORLDS[this.homeWorld].levels, i=levels.findIndex(l=>l.id===this.homeSel);
    const t=i/Math.max(1,levels.length-1);
    let target=HOME_ORBIT_FRONT-(2.5-t*4.7), current=this.orbitRotation;
    if(current==null || matchMedia('(prefers-reduced-motion: reduce)').matches){this.orbitRotation=target;return;}
    while(target-current>Math.PI) target-=Math.PI*2;
    while(target-current<-Math.PI) target+=Math.PI*2;
    this.orbitTween=this.tweens.add({targets:this,orbitRotation:target,duration:450,ease:'Cubic.easeOut'});
  },
  // glissement horizontal sur la carte : la route suit le doigt ; au relâchement elle s'arrête sur le niveau le plus proche (un coup sec avance d'au moins un niveau)
  orbitDragMove(dx, dy, scale){
    const levels=WORLDS[this.homeWorld].levels, n=levels.length, i=levels.findIndex(l=>l.id===this.homeSel);
    if(n<2 || i<0) return;
    if(!this.orbitDrag){
      if(Math.abs(dx)<10 || Math.abs(dx)<Math.abs(dy)*1.2) return;
      if(this.orbitTween) this.orbitTween.stop();
      this.orbitDrag={ i, base:HOME_ORBIT_FRONT-(2.5-i/(n-1)*4.7), step:4.7/(n-1), px:70*scale, x0:dx };
    }
    const d=this.orbitDrag, move=(d.x0-dx)/d.px;                     // en niveaux : doigt vers la gauche = niveau suivant
    const f=Math.max(-0.25, Math.min(n-1-d.i+0.25, move));           // léger jeu au-delà des extrémités
    this.orbitRotation=d.base+f*d.step;
  },
  // relâchement : retourne true s'il y avait un glissement en cours
  orbitDragEnd(dx, ms){
    const d=this.orbitDrag; if(!d) return false;
    this.orbitDrag=null; this._orbitDragged=performance.now();
    const levels=WORLDS[this.homeWorld].levels, n=levels.length;
    let f=(this.orbitRotation-d.base)/d.step;
    if(ms<350 && Math.abs(f)<1 && Math.abs(f)>0.15) f=Math.sign(f);  // coup de doigt rapide : au moins un niveau
    const j=Math.max(0, Math.min(n-1, d.i+Math.round(f)));
    if(j!==d.i) this.selectHomeLevel(levels[j].id); else this.focusOrbitalLevel();
    return true;
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
