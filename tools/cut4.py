import subprocess, numpy as np, wave, base64, json, glob
A='/mnt/user-data/attachments/8b97c35f-e479-5d1d-9f53-830cf7eded23/'
def load(name):
    f=glob.glob(A+'*-'+{'goldenSpawn':'goldenSpwan'}.get(name,name)+'.mp3')[0]
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','44100','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy(),44100
PLAN={
 'kamiCharge':[(0.1,1.15,0.01,0.05)],
 'motherCharge':[(0.3,3.0,0.02,0.5)],
 'goldenSpawn':[(0.5,3.0,0.01,0.8)],
 'gemBig':[(0.05,1.3,0.002,0.5)],
 'gem':[(0.05,0.7,0.002,0.25)],
 'mineDrop':[(0.05,1.4,0.002,0.6)],
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
json.dump(out,open('sfx_files4.json','w'))
for k,v in rep.items(): print(k,'dur',v[0],'s',v[1],'KB rms',v[2],'dB')
print('total new KB b64',sum(len(u) for k in rep for u in out[k])//1024)
