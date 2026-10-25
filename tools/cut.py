import subprocess, numpy as np, wave, io, base64, json, glob, os
A='/mnt/user-data/attachments/8b97c35f-e479-5d1d-9f53-830cf7eded23/'
def load(name):
    f=glob.glob(A+f'*-{name}.mp3')[0]
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','44100','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy(),44100
def onsets(x,sr,n,minGap=0.12):
    hop=int(sr*0.004); env=np.array([np.abs(x[i:i+hop]).max() for i in range(0,len(x)-hop,hop)])
    th=env.max()*0.35; res=[]; last=-9
    for i,v in enumerate(env):
        t=i*0.004
        if v>th and t-last>minGap and (i==0 or env[i-1]<th*0.6): res.append(t); last=t
        if len(res)>=n: break
    return res
PLAN={ # name: (peak target, [(start,end,fadeout)...], extra)
 'laser':[(0.02,0.24,0.10)],
 'lightning':[(0.10,0.62,0.22)],
 'missile':[(1.06,1.90,0.35),(5.07,5.90,0.35)],
 'pulsar':[(0.25,1.15,0.28)],
 'swarmMissile':[(0.05,0.78,0.28)],
 'thunder':[(0.55,3.45,1.3)],
 'blackHole':[(0.00,1.16,0.22)],
 'droneShot':[(0.27,0.70,0.16)],
}
x,sr=load('bounce'); ons=onsets(x,sr,40); print('bounce onsets',[round(o,3) for o in ons[:12]])
PLAN['bounce']=[(max(0,ons[i]-0.006),ons[i]+0.14,0.07) for i in (1,5,9)]
out={}; report={}
for name,segs in PLAN.items():
    x,sr=load(name); out[name]=[]
    for k,(a,b,fo) in enumerate(segs):
        y=x[int(a*sr):int(b*sr)].copy()
        y-=y.mean()
        n=len(y); fi=int(0.003*sr); y[:fi]*=np.linspace(0,1,fi)
        fn=int(fo*sr); fn=min(fn,n); y[n-fn:]*=np.linspace(1,0,fn)**1.6
        y/= (np.abs(y).max()+1e-9); y*=0.89
        wavp=f'out/{name}_{k}.wav'
        with wave.open(wavp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((y*32767).astype(np.int16).tobytes())
        mp3=f'out/{name}_{k}.mp3'
        subprocess.run(['ffmpeg','-v','error','-y','-i',wavp,'-ac','1','-b:a','80k',mp3],check=True)
        d=open(mp3,'rb').read(); out[name].append('data:audio/mpeg;base64,'+base64.b64encode(d).decode())
        rms=20*np.log10(np.sqrt(np.mean(y**2))+1e-9)
        report[f'{name}_{k}']=(round(len(y)/sr,2),len(d)//1024,round(rms,1))
json.dump(out,open('sfx_files.json','w'))
for k,v in report.items(): print(k,'dur',v[0],'s',v[1],'KB rms',v[2],'dB')
print('total KB b64',sum(len(s) for v in out.values() for s in v)//1024)
