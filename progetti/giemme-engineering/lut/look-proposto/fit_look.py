import cv2,numpy as np,json,sys
from scipy.optimize import minimize
S=sys.argv[1]
LW=np.array([.299,.587,.114])
REF_FACE=np.array([154,107,93])/255; REF_WALL=np.array([182,180,177])/255
def model(p,x):
    gr,gg_,gb,rr,gg,bb,s,bl,con=p
    y=np.clip(x,1e-4,1)**np.array([gr,gg_,gb])*np.array([rr,gg,bb])
    L=(y*LW).sum(-1,keepdims=True); y=L+(y-L)*s
    y=np.clip(y,0,1); y=y+con*(y-0.5)*(1-np.abs(2*y-1))
    y=(y-bl)/(1-bl)
    return np.clip(y,0,1)
B=[(0.6,2.2)]*3+[(0.5,1.5)]*3+[(0.78,0.78),(-0.015,0.15),(0.25,0.25)]
res={}
for c in ['0103','0104','0109','0110']:
    im=cv2.imread(f'{S}/src_{c}.png')[:,:,::-1].astype(float)/255
    x,y,w,h=map(int,open(f'{S}/box_{c}').read().split())
    face=im[y+int(h*.2):y+int(h*.8),x+int(w*.2):x+int(w*.8)].reshape(-1,3)[::7]
    H_,W_=im.shape[:2]
    wall=im[int(H_*.03):int(H_*.12),int(W_*.05):int(W_*.3)].reshape(-1,3)[::7]
    allp=cv2.resize(im,(135,240)).reshape(-1,3)
    f0=face.mean(0); ft=REF_FACE/(REF_FACE@LW); fo=f0/(f0@LW); tgt_face=(0.5*ft+0.5*fo)*(120/255)
    def loss(p):
        F=model(p,face).mean(0); Wl=model(p,wall).mean(0); A=(model(p,allp)*LW).sum(-1)
        return 4*((F-tgt_face)**2).sum()+4*((Wl-REF_WALL)**2).sum()+1.0*(np.percentile(A,1)-0.025)**2+0.01*np.sum((np.array(p[:3])-p[0])**2)+0.02*(p[8]-0.25)**2
    r=minimize(loss,[1.3,1.3,1.3,1,1,1,0.8,0.03,0.25],method='Nelder-Mead',bounds=B,options={'maxiter':15000,'xatol':1e-6,'fatol':1e-10})
    p=r.x; res[c]=p.tolist()
    F=model(p,face).mean(0)*255; Wl=model(p,wall).mean(0)*255; A=(model(p,allp)*LW).sum(-1)*255
    print(c,np.round(p,3),'viso',F.round(),round(F@LW),'muro',Wl.round(),'p1',round(np.percentile(A,1)),'p99',round(np.percentile(A,99.5)))
    N=33; v=np.linspace(0,1,N)
    bgr=np.stack(np.meshgrid(v,v,v,indexing='ij'),-1)  # b,g,r
    rgb=bgr[...,::-1].reshape(-1,3)
    out=model(p,rgb)
    with open(f'{S}/IMG_{c}.look.cube','w') as fh:
        fh.write(f'TITLE "Giemme look {c}"\nLUT_3D_SIZE {N}\n')
        for o in out: fh.write('%.6f %.6f %.6f\n'%tuple(o))
json.dump(res,open(f'{S}/look_params.json','w'))
