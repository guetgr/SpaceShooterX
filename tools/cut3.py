import subprocess, numpy as np, wave, base64, json, glob
A='/mnt/user-data/attachments/8b97c35f-e479-5d1d-9f53-830cf7eded23/'
def load(name):
    f=glob.glob(A+'*-'+{'snipeShot':'sniperShot','snipeCharge':'sniperCharge','heavyShot':'heavyshot'}.get(name,name)+'.mp3')[0]
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','44100','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy(),44100
PLAN={
 'boomMed':[(0.03,2.5,0.003,1.0)],
 'boomBig':[(0.3,3.4,0.003,1.3)],
 'kamikazeBoom':[(0.15,2.2,0.003,0.9)],
 'mineBoom':[(0.06,2.4,0.003,0.9)],
 'strikeWarn':[(0.0,1.03,0.01,0.08)],
 'strikeBoom':[(0.02,2.3,0.003,0.9)],
 'heavyShot':[(0.03,1.5,0.002,0.6)],
 'enemyShot':[(0.02,0.6,0.002,0.2)],
 'spreadShot':[(0.0,1.5,0.002,0.5)],
 'snipeShot':[(0.2,1.4,0.002,0.5)],
 'snipeCharge':[(0.1,2.4,0.01,0.25)],
 'healerPulse':[(0.1,1.9,0.01,0.7)],
 'webShoot':[(0.05,1.2,0.002,0.4)],
 'boomSmall':[(1.45,2.7,0.002,0.6)],
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
    mp3=f'out/{tag}.mp3'; subprocess.run(['ffmpeg','-v','error','-y','-i',wavp,'-ac','1','-ar','32000','-b:a','24k',mp3],check=True)
    d=open(mp3,'rb').read(); return 'data:audio/mpeg;base64,'+base64.b64encode(d).decode(), len(d)
out={}; rep={}
for name,segs in PLAN.items():
    x,sr=load(name); out[name]=[]
    for k,(a,b,fi,fo) in enumerate(segs):
        y=render(x[int(a*sr):int(b*sr)].copy(),sr,fi,fo)
        u,L=enc(y,sr,f'{name}_{k}'); out[name].append(u); rep[name]=(round(len(y)/sr,2),L//1024,round(20*np.log10(np.sqrt(np.mean(y**2))+1e-9),1))
json.dump(out,open('sfx_files3.json','w'))
for k,v in rep.items(): print(k,'dur',v[0],'s',v[1],'KB rms',v[2],'dB')
print('total new KB b64',sum(len(u) for k in rep for u in out[k])//1024)
