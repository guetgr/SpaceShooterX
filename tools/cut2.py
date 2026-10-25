import subprocess, numpy as np, wave, base64, json, glob
A='/mnt/user-data/attachments/8b97c35f-e479-5d1d-9f53-830cf7eded23/'
def load(name):
    f=glob.glob(A+'*-'+{'hitEnemy':'hitEnnemy'}.get(name,name)+'.mp3')[0]
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','44100','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy(),44100
PLAN={ # name: [(start,end,fadeIn,fadeOut)]
 'bombBoom':[(0.45,2.2,0.003,0.8)],
 'nukeBoom':[(0.0,3.0,0.003,1.1)],
 'nuke':[(0.3,3.4,0.02,1.2)],
 'galaxyBlast':[(0.0,2.3,0.01,0.9)],
 'reflect':[(0.05,0.80,0.002,0.30)],
 'dodge':[(0.30,1.30,0.12,0.45)],
 'odCharge':[(0.0,1.2,0.03,0.45)],
 'overdrive':[(0.0,1.85,0.01,0.08)],
 'hitEnemy':[(0.09,0.30,0.001,0.12)],
 'hitHeavy':[(0.05,0.55,0.002,0.30)],
 'shieldHit':[(0.04,0.45,0.001,0.20)],
 'shieldBreak':[(0.04,1.60,0.001,0.70)],
 'decoyPop':[(0.03,0.50,0.001,0.25)],
 'rock':[(0.15,1.7,0.005,0.7)],
 'tentacleCut':[(0.06,0.52,0.003,0.15)],
 'partBreak':[(0.13,1.10,0.002,0.40)],
 'bombDrop':[(0.22,1.50,0.003,0.40)],
}
def render(y,sr,fi,fo,reverse=False):
    y=y-y.mean(); n=len(y)
    if reverse: y=y[::-1].copy(); y*=np.linspace(1,0,n)**1.3
    a=int(fi*sr); 
    if a>1: y[:a]*=np.linspace(0,1,a)
    f=min(int(fo*sr),n); y[n-f:]*=np.linspace(1,0,f)**1.6
    y/=(np.abs(y).max()+1e-9); return y*0.89
def enc(y,sr,tag):
    wavp=f'out/{tag}.wav'
    with wave.open(wavp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((y*32767).astype(np.int16).tobytes())
    mp3=f'out/{tag}.mp3'; subprocess.run(['ffmpeg','-v','error','-y','-i',wavp,'-ac','1','-ar','32000','-b:a','32k',mp3],check=True)
    d=open(mp3,'rb').read(); return 'data:audio/mpeg;base64,'+base64.b64encode(d).decode(), len(d)
out=json.load(open('sfx_files.json')); rep={}
for name,segs in PLAN.items():
    x,sr=load(name); out[name]=[]
    for k,(a,b,fi,fo) in enumerate(segs):
        y=render(x[int(a*sr):int(b*sr)].copy(),sr,fi,fo)
        u,L=enc(y,sr,f'{name}_{k}'); out[name].append(u); rep[name]=(round(len(y)/sr,2),L//1024,round(20*np.log10(np.sqrt(np.mean(y**2))+1e-9),1))
# odEnd = odCharge à l'envers, qui diminue
x,sr=load('odCharge'); a,b,fi,fo=PLAN['odCharge'][0]
y=render(x[int(a*sr):int(b*sr)].copy(),sr,0.0,0.05,reverse=True)
u,L=enc(y,sr,'odEnd_0'); out['odEnd']=[u]; rep['odEnd']=(round(len(y)/sr,2),L//1024,round(20*np.log10(np.sqrt(np.mean(y**2))+1e-9),1))
json.dump(out,open('sfx_files2.json','w'))
for k,v in rep.items(): print(k,'dur',v[0],'s',v[1],'KB rms',v[2],'dB')
print('total new KB b64',sum(len(u) for k in rep for u in out[k])//1024)
