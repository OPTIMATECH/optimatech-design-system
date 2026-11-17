#!/usr/bin/env python3
"""OPTIMATECH · gera fundos de tela, fundos de reunião e capas de LinkedIn (v7.1).
Tudo sai da geometria oficial (assets/js/brand.js via tools/build-geometry.mjs).
Uso: python3 tools/build_fundos.py [pasta_saida]   (OT_AMBIENTES=pasta com os mockups fotográficos, opcional; requer cairosvg, pillow, numpy; fontes Exo e Sora instaladas)"""
import json, subprocess, sys, io, os, re
import numpy as np, cairosvg
from PIL import Image, ImageFilter
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'downloads','fundos')
GEO=json.loads(subprocess.check_output(['node',os.path.join(ROOT,'tools','build-geometry.mjs')]))
WORD=json.loads(re.search(r'"word":(\[.*?\])',open(os.path.join(ROOT,'assets','js','brand.js')).read(),re.S).group(1))
C=dict(citrus='#E6E617',graphite='#333333',carbon='#262626',white='#FFFFFF',ice='#F1F0F1',mist='#E3E2E1',gray='#908F8F',iron='#6B6C6C',
       sand='#F1C360',butter='#F8D568',lemon='#EEE454',amber='#FBB03B',bronze='#A97727',orange='#E65717',olive='#B3B336')
SCX,SCY,SW,SH=103.545,58.665,143.29,88.17          # centro e medidas do símbolo
LX0,LY0,LW,LH=31.9,14.58,427.09,88.17              # caixa do logotipo horizontal
TAG='Tempo, pessoas e recursos nos lugares certos.'

def T(k,cx,cy): return f'transform="translate({cx:.2f} {cy:.2f}) scale({k:.5f}) translate({-SCX} {-SCY})"'
def big(W,H,wf,cxf,cyf,attrs,d=None):
    k=W*wf/SW; return f'<path d="{d or GEO["merged"]}" {T(k,W*cxf,H*cyf)} {attrs}/>'
def nodes(W,H,wf,cxf,cyf,fill,op=1):
    k=W*wf/SW; return f'<g {T(k,W*cxf,H*cyf)} fill="{fill}" fill-opacity="{op}">'+''.join(f'<path d="{d}"/>' for d in GEO['nodes'].values())+'</g>'
def trails(W,H,wf,cxf,cyf,stroke,n=9,step=.085,sw=1.6,dx=0,dy=0,fade=1.25):
    out=''
    for i in range(n):
        k=W*wf/SW*(1+i*step)
        out+=f'<path d="{GEO["merged"]}" {T(k,W*cxf+dx*i,H*cyf+dy*i)} fill="none" stroke="{stroke}" stroke-width="{sw/k:.4f}" opacity="{max(.06,1-i/(n*fade)):.3f}"/>'
    return out
def logo(W,H,wf,xf,yf,sym,word,tint=None,anchor='l'):
    """logotipo horizontal; wf = largura em fração de W; (xf,yf) = canto esq./centro vertical (anchor l) ou dir. (r) ou centro (c)"""
    k=W*wf/LW; w=LW*k; x=W*xf - (w if anchor=='r' else w/2 if anchor=='c' else 0); y=H*yf-LH*k/2
    g=f'<g transform="translate({x:.2f} {y:.2f}) scale({k:.5f}) translate({-LX0} {-LY0})">'
    if tint: g+=''.join(f'<path d="{d}" fill="{sym}" fill-opacity="{tint}"/>' for d in GEO['bridges'])+''.join(f'<path d="{d}" fill="{sym}"/>' for d in GEO['nodes'].values())
    else: g+=f'<path d="{GEO["merged"]}" fill="{sym}"/>'
    return g+''.join(f'<path d="{d}" fill="{word}"/>' for d in WORD)+'</g>'
def tag(W,H,xf,yf,size,fill,anchor='start',op=.9):
    return f'<text x="{W*xf:.1f}" y="{H*yf:.1f}" font-family="Sora" font-weight="300" font-size="{size:.1f}" fill="{fill}" fill-opacity="{op}" text-anchor="{anchor}" letter-spacing="{size*.01:.2f}">{TAG}</text>'
def svg(W,H,body,bg=None): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'+(f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else '')+body+'</svg>'
def raster(s): return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=s.encode()))).convert('RGBA')
def hexrgb(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
def warm(W,H,seed=3):
    """gradiente quente do manual (bronze, areia, manteiga, limão, com respiro cinza): soma de manchas gaussianas"""
    s=8; w,h=W//s+1,H//s+1; y,x=np.mgrid[0:h,0:w]; x=x/w; y=y/h; ar=W/H
    blobs=[(.05,.25,.34,'#A97727',1.2),(.30,.75,.36,'#F1C360',1.1),(.42,.30,.30,'#F8D568',1.0),(.62,.10,.22,'#908F8F',.75),(.60,.85,.30,'#A97727',.9),
           (.80,.30,.26,'#EEE454',1.1),(.97,.02,.18,'#FFFFFF',.8),(.98,.95,.24,'#73829D',.55),(.18,.95,.30,'#F1C360',.9),(.78,.70,.22,'#F1C360',.8)]
    acc=np.zeros((h,w,3)); wt=np.zeros((h,w,1))+1e-6
    for bx,by,r,col,a in blobs:
        g=a*np.exp(-(((x-bx)*ar/ (1 if ar<2.5 else ar/2.5))**2+(y-by)**2)/(2*r*r))[...,None]; acc+=g*hexrgb(col); wt+=g
    im=Image.fromarray(np.clip(acc/wt,0,255).astype('uint8')).resize((W,H),Image.BICUBIC).filter(ImageFilter.GaussianBlur(s*2))
    n=np.random.default_rng(seed).normal(0,1.6,(H,W,1)); return Image.fromarray(np.clip(np.asarray(im,float)+n,0,255).astype('uint8')).convert('RGBA')
def emboss(base,W,H,wf,cxf,cyf):
    """símbolo translúcido com sombra suave sobre o gradiente (manual v3, capa)"""
    m=raster(svg(W,H,big(W,H,wf,cxf,cyf,'fill="#000"'))).split()[3]
    sh=m.filter(ImageFilter.GaussianBlur(W*.012)); dark=Image.new('RGBA',(W,H),(60,40,10,0)); dark.putalpha(sh.point(lambda v:int(v*.42)))
    off=Image.new('RGBA',(W,H),(0,0,0,0)); off.paste(dark,(int(W*.004),int(W*.007)),dark)
    hole=Image.new('L',(W,H),255); hole.paste(0,mask=m)                     # sombra só fora do símbolo
    off.putalpha(Image.composite(off.split()[3],Image.new('L',(W,H),0),hole))
    veil=Image.new('RGBA',(W,H),(255,255,255,0)); veil.putalpha(m.point(lambda v:int(v*.16)))
    return Image.alpha_composite(Image.alpha_composite(base,off),veil)

# ---------- desenhos: cada um recebe (W,H,p) onde p traz as posições por formato ----------
def d_supergrafico(W,H,p):
    b=trails(W,H,p['big'][0]*1.05,p['big'][1],p['big'][2],'#5a5a55',n=6,step=.06,sw=H*.0016)+big(W,H,*p['big'],f'fill="{C["citrus"]}"')
    return raster(svg(W,H,b+p['logo'](C['citrus'],C['white']),C['graphite']))
def d_trilhas(W,H,p):
    b=trails(W,H,p['big'][0]*.62,p['big'][1],p['big'][2],'#77766f',n=11,step=.11,sw=H*.0018,dx=W*.004,dy=-H*.004)+nodes(W,H,p['big'][0]*.62,p['big'][1],p['big'][2],C['citrus'])
    return raster(svg(W,H,b+p['logo'](C['citrus'],C['white']),C['carbon']))
def d_gradiente(W,H,p):
    base=emboss(warm(W,H),W,H,*p['big'])
    ink=C[p.get('ink','white')]
    return Image.alpha_composite(base,raster(svg(W,H,p['logo'](ink,ink))))
def d_areia(W,H,p):
    b=big(W,H,*p['big'],'fill="#FFFFFF" fill-opacity=".34"')+trails(W,H,p['big'][0]*1.08,p['big'][1],p['big'][2],'#FFFFFF',n=3,step=.08,sw=H*.0016)
    return raster(svg(W,H,b+p['logo'](C['graphite'],C['graphite']),C['sand']))
def d_gelo(W,H,p):
    wf,cx,cy=p['big']; s=W*wf
    r=lambda x,y,sz,f,o:f'<rect x="{x:.1f}" y="{y:.1f}" width="{sz:.1f}" height="{sz:.1f}" rx="{sz*.3505:.1f}" fill="{f}" fill-opacity="{o}"/>'
    b=trails(W,H,wf*1.5,cx-.05,cy+.05,'#cfcec9',n=7,step=.1,sw=H*.0014)
    b+=r(W*cx-s*.62,H*cy-s*.46,s*.5,C['citrus'],.88)+r(W*cx-s*.25,H*cy-s*.18,s*.72,C['olive'],.62)
    return raster(svg(W,H,b+p['logo'](C['graphite'],C['graphite'],.5),C['ice']))
def d_nos(W,H,p):
    b=nodes(W,H,*p['big'],C['orange'])+trails(W,H,p['big'][0],p['big'][1],p['big'][2],'#555',n=1,sw=H*.0016)
    return raster(svg(W,H,b+p['logo'](C['orange'],C['white']),C['graphite']))
def d_padrao(W,H,p):
    u=max(W,H)/ (26 if W>H*2.5 else 18); k=u*.62/SW; cells=''
    for j in range(int(H/(u*.62))+2):
        for i in range(int(W/u)+2):
            cells+=f'<path d="{GEO["merged"]}" {T(k,i*u+(u/2 if j%2 else 0),j*u*.62)} fill="none" stroke="#4a4a47" stroke-width="{1.1*H/1080/k if H>700 else 1.3/k:.3f}"/>'
    return raster(svg(W,H,cells+p['logo'](C['citrus'],C['white']),C['graphite']))
def d_citrus(W,H,p):
    b=big(W,H,*p['big'],f'fill="none" stroke="{C["graphite"]}" stroke-opacity=".28" stroke-width="{H*.0022/(W*p["big"][0]/SW):.4f}"')+nodes(W,H,p['big'][0]*.5,p['big'][1]+p['big'][0]*.1,p['big'][2],C['graphite'])
    return raster(svg(W,H,b+p['logo'](C['graphite'],C['graphite']),C['citrus']))
DESIGNS=dict(supergrafico=('Supergráfico Citrus',d_supergrafico),trilhas=('Trilhas',d_trilhas),gradiente=('Gradiente quente',d_gradiente),areia=('Areia',d_areia),
             gelo=('Gelo e blocos',d_gelo),nos=('Nós laranja',d_nos),padrao=('Padrão de símbolos',d_padrao),citrus=('Citrus pleno',d_citrus))

# ---------- formatos ----------
def L(W,H,wf,xf,yf,anchor='r',tagline=None,plate=False):
    def f(sym,word,tint=None):
        out=''
        if plate:
            k=W*wf/LW; w=LW*k; h=LH*k; x=W*xf-(w if anchor=='r' else w/2 if anchor=='c' else 0); y=H*yf-h/2; pd=h*.9
            out+=f'<rect x="{x-pd:.1f}" y="{y-pd:.1f}" width="{w+2*pd:.1f}" height="{h+2*pd:.1f}" rx="{(h+2*pd)*.3505:.1f}" fill="{C["graphite"]}"/>'
        out+=logo(W,H,wf,xf,yf,sym,word,tint,anchor)
        if tagline: out+=tag(W,H,xf,yf+tagline[0],tagline[1],word,{'r':'end','l':'start','c':'middle'}[anchor])
        return out
    return f
def fmt_desktop(W,H):
    lg=L(W,H,.11,.955,.925)
    return dict(supergrafico=dict(big=(1.18,.30,.76),logo=lg),trilhas=dict(big=(.75,.5,.5),logo=lg),gradiente=dict(big=(.42,.5,.47),logo=lg),
        areia=dict(big=(.95,.62,.64),logo=lg),gelo=dict(big=(.20,.68,.47),logo=lg),nos=dict(big=(.36,.5,.48),logo=lg),
        padrao=dict(logo=L(W,H,.24,.5,.5,'c',plate=True)),citrus=dict(big=(.55,.5,.5),logo=lg))
def fmt_reuniao(W,H):
    lg=L(W,H,.17,.05,.105,'l')
    return dict(supergrafico=dict(big=(.95,.84,.96),logo=lg),trilhas=dict(big=(.9,.80,.66),logo=lg),gradiente=dict(big=(.34,.80,.40),logo=lg),
        areia=dict(big=(.9,.78,.80),logo=lg),gelo=dict(big=(.16,.86,.36),logo=lg),padrao=dict(logo=L(W,H,.17,.07,.12,'l',plate=True)))
def fmt_celular(W,H):
    lg=L(W,H,.44,.5,.885,'c')
    return dict(supergrafico=dict(big=(1.9,.30,.62),logo=lg),trilhas=dict(big=(1.3,.5,.52),logo=lg),gradiente=dict(big=(.66,.5,.50),logo=lg),nos=dict(big=(.62,.5,.50),logo=lg))
def fmt_capa(W,H):
    lg=L(W,H,.19,.955,.40,'r',tagline=(.26,H*.047))
    return dict(supergrafico=dict(big=(.34,.42,.90),logo=lg),trilhas=dict(big=(.27,.42,.55),logo=lg),gradiente=dict(big=(.19,.47,.50),logo=lg,ink='graphite'),gelo=dict(big=(.085,.50,.47),logo=lg))
def fmt_empresa(W,H):
    lg=L(W,H,.15,.96,.40,'r',tagline=(.27,H*.05))
    return dict(supergrafico=dict(big=(.26,.45,.92),logo=lg),gradiente=dict(big=(.15,.50,.50),logo=lg,ink='graphite'))
FORMATS=[  # id, pasta, W, H, função, desenhos, extensão
 ('desktop','desktop',3840,2160,fmt_desktop,['supergrafico','trilhas','gradiente','areia','gelo','nos','padrao','citrus']),
 ('reuniao','reuniao',1920,1080,fmt_reuniao,['supergrafico','trilhas','gradiente','areia','gelo','padrao']),
 ('celular','celular',1290,2796,fmt_celular,['supergrafico','trilhas','gradiente','nos']),
 ('linkedin-colaborador','linkedin',3168,792,fmt_capa,['supergrafico','trilhas','gradiente','gelo']),
 ('linkedin-empresa','linkedin',4200,700,fmt_empresa,['supergrafico','gradiente']),
]
def main(only=None):
    prev=os.path.join(ROOT,'assets','img','fundos'); os.makedirs(prev,exist_ok=True); man=[]
    for fid,folder,W,H,fn,ds in FORMATS:
        if only and fid not in only: continue
        os.makedirs(os.path.join(OUT,folder),exist_ok=True); P=fn(W,H)
        for i,d in enumerate(ds,1):
            im=DESIGNS[d][1](W,H,P[d]).convert('RGB')
            num=f'{i:02d}-' if fid.startswith('linkedin') else ''
            name=f'optimatech-{"fundo-" if not fid.startswith("linkedin") else ""}{fid}-{num}{d}-{W}x{H}.jpg'
            im.save(os.path.join(OUT,folder,name),quality=93,subsampling=0,optimize=True)
            pv=im.copy(); pv.thumbnail((1100,1100)); pn=name.replace('.jpg','.jpg'); pv.save(os.path.join(prev,pn),quality=82,optimize=True)
            man.append(dict(format=fid,design=d,title=DESIGNS[d][0],file=f'downloads/fundos/{folder}/{name}',preview=f'assets/img/fundos/{pn}',w=W,h=H,size=os.path.getsize(os.path.join(OUT,folder,name))))
            print(name)
    return man
def ambientes(src,man):
    names=[('Emboss - logo.jpg','relevo-simbolo'),('Emboss II - logo.jpg','relevo-logotipo'),('Fachada - OT.jpg','fachada'),('OT - Sala de Conferência II.jpg','sala-vidro'),('OT - Sala de Conferência 4.jpg','sala-citrus')]
    prev=os.path.join(ROOT,'assets','img','fundos'); Image.MAX_IMAGE_PIXELS=None
    import unicodedata; nf=lambda t:unicodedata.normalize('NFC',t).strip(); have={nf(x):x for x in os.listdir(src)}
    for i,(f,slug) in enumerate(names,1):
        if nf(f) not in have: print('faltando',f); continue
        fp=os.path.join(src,have[nf(f)])
        im=Image.open(fp).convert('RGB'); w,h=im.size; t=16/9
        if w/h>t: nw=int(h*t); im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
        else: nh=int(w/t); im=im.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
        im=im.resize((1920,1080),Image.LANCZOS); name=f'optimatech-fundo-reuniao-ambiente-{i:02d}-{slug}-1920x1080.jpg'
        im.save(os.path.join(OUT,'reuniao',name),quality=90,optimize=True); pv=im.copy(); pv.thumbnail((1100,1100)); pv.save(os.path.join(prev,name),quality=82)
        man.append(dict(format='reuniao-ambiente',design=slug,title='Ambiente · '+slug.replace('-',' '),file=f'downloads/fundos/reuniao/{name}',preview=f'assets/img/fundos/{name}',w=1920,h=1080,size=os.path.getsize(os.path.join(OUT,'reuniao',name))))
        print(name)
if __name__=='__main__':
    only=sys.argv[2].split(',') if len(sys.argv)>2 else None
    m=main(only)
    if not only and os.environ.get('OT_AMBIENTES'): ambientes(os.environ['OT_AMBIENTES'],m)
    if not only: json.dump(m,open(os.path.join(OUT,'fundos.json'),'w'),ensure_ascii=False,indent=1)
