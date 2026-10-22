/* OPTIMATECH DS v7 · páginas do Design System */
(function(){
'use strict';
const B=window.OTBrand, S=window.OTShell;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SYM=B.SYM, U=B.U;
const NODE_BOX={a:[31.9,54.99,79.66,102.75],b:[87.02,14.58,120.08,47.65],c:[127.43,55.91,151.31,79.79],d:[157.44,32.7,175.18,50.44]};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- util: SVG → PNG ---------- */
function svgToPng(svg,width,bg){
  return new Promise((res,rej)=>{
    const m=svg.match(/viewBox="([^"]+)"/); const vb=m?m[1].split(/\s+/).map(Number):[0,0,100,100];
    const w=Math.round(width), h=Math.round(width*vb[3]/vb[2]);
    let s=svg.replace(/<svg([^>]*?)\swidth="[^"]*"/,'<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/,'<svg$1').replace('<svg','<svg width="'+w+'" height="'+h+'"');
    const img=new Image(); img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h);}x.drawImage(img,0,0,w,h);c.toBlob(b=>b?res(b):rej(new Error('png')),'image/png');};
    img.onerror=rej; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
  });
}
async function dlPng(svg,name,width){ try{ const b=await svgToPng(svg,width||2000); S.download(name,b); S.toast('PNG gerado'); }catch(e){ S.toast('Não foi possível gerar o PNG neste navegador'); } }
function dlSvg(svg,name){ S.download(name,'<?xml version="1.0" encoding="UTF-8"?>\n'+svg,'image/svg+xml'); S.toast('SVG baixado'); }

/* ---------- Trilha decorativa dos cabeçalhos ---------- */
function trailSvg(n,stroke,opts){
  opts=opts||{}; const cx=(SYM[0]+SYM[2])/2, cy=(SYM[1]+SYM[3])/2; let g='';
  for(let i=0;i<n;i++){ const k=1+i*(opts.step||.085); const dx=i*(opts.dx||5), dy=i*(opts.dy||-3);
    g+='<path d="'+B.GEO.merged+'" fill="none" stroke="'+stroke+'" stroke-width="'+((opts.sw||.6)/k)+'" vector-effect="non-scaling-stroke" transform="translate('+(cx+dx)+' '+(cy+dy)+') scale('+k+') translate('+(-cx)+' '+(-cy)+')" opacity="'+(1-i/(n*1.25))+'"/>'; }
  return g;
}
function fillHeadTrails(){
  $$('svg[data-trail]').forEach(s=>{ if(s.dataset.done) return; s.setAttribute('viewBox','10 -10 230 140'); s.innerHTML=trailSvg(9,'#c6c5c1',{sw:1}); s.dataset.done=1; });
}

/* =================================================== ROUTER */
const inited={};
function route(){
  const raw=(location.hash||'#inicio').slice(1); const [page,sub]=raw.split('/');
  const el=$('#p-'+page)||$('#p-inicio'); const id=el.dataset.page;
  $$('.page').forEach(p=>p.classList.toggle('is-active',p===el));
  if(!inited[id]&&INIT[id]){ try{INIT[id]();}catch(e){console.error(e);} inited[id]=1; }
  fillHeadTrails();
  document.title=(id==='inicio'?'':($('h1',el)?.textContent.trim()+' · '))+'OPTIMATECH Design System';
  if(sub){ const t=$('#'+id+'-'+sub); if(t) requestAnimationFrame(()=>t.scrollIntoView({behavior:reduce?'auto':'smooth'})); }
  else window.scrollTo(0,0);
  S.markCurrent&&S.markCurrent();
}
window.addEventListener('hashchange',route);

/* =================================================== INÍCIO · símbolo vivo */
function initHero(){
  const st=$('#heroStage'); const pad=60; const vb=[SYM[0]-pad-40,SYM[1]-pad,SYM[2]-SYM[0]+pad*2+40,SYM[3]-SYM[1]+pad*2];
  const nodes=['a','b','c','d'];
  st.innerHTML='<svg viewBox="'+vb.join(' ')+'" xmlns="'+NS+'">'+
    '<g class="h-trails">'+trailSvg(7,'#4b4b48',{sw:1,step:.11,dx:-4,dy:2})+'</g>'+
    '<path id="hPath" d="'+B.GEO.merged+'" fill="none" stroke="none"/>'+
    '<g class="h-sym">'+B.GEO.bridges.map((d,i)=>'<path class="h-br" d="'+d+'" fill="#E6E617" fill-opacity=".5"/>').join('')+
    nodes.map(k=>'<path class="h-n" data-k="'+k+'" d="'+B.GEO.nodes[k]+'" fill="#E6E617"/>').join('')+'</g>'+
    '<g class="h-pulses"></g></svg>';
  const svg=$('svg',st), ns=$$('.h-n',svg), brs=$$('.h-br',svg);
  ns.forEach(n=>{ n.style.transformBox='fill-box'; n.style.transformOrigin='center'; });
  // entrada orquestrada: nós chegam de longe e encaixam; pontes surgem depois
  if(!reduce){
    const off={a:[-120,60],b:[-30,-110],c:[60,90],d:[140,-60]};
    ns.forEach((n,i)=>{ const o=off[n.dataset.k]; n.style.transform='translate('+o[0]+'px,'+o[1]+'px) scale(.3)'; n.style.opacity='0';
      setTimeout(()=>{ n.style.transition='transform 900ms cubic-bezier(.5,0,.2,1.25), opacity 500ms'; n.style.transform=''; n.style.opacity='1'; },180+i*130); });
    brs.forEach((b,i)=>{ b.style.opacity='0'; setTimeout(()=>{b.style.transition='opacity 700ms';b.style.opacity='1';},1050+i*120); });
    $$('.h-trails path',svg).forEach((p,i)=>{ const L=1400; p.style.strokeDasharray=L; p.style.strokeDashoffset=L; setTimeout(()=>{p.style.transition='stroke-dashoffset 2.4s cubic-bezier(.22,.8,.2,1)';p.style.strokeDashoffset=0;},300+i*90); });
  }
  // interação: o nó mais próximo do cursor se destaca
  const pt=svg.createSVGPoint();
  svg.closest('.hero').addEventListener('pointermove',e=>{
    pt.x=e.clientX; pt.y=e.clientY; const p=pt.matrixTransform(svg.getScreenCTM().inverse());
    let best=null,bd=1e9; nodes.forEach(k=>{const b=NODE_BOX[k];const cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;const d=Math.hypot(p.x-cx,p.y-cy);if(d<bd){bd=d;best=k;}});
    ns.forEach(n=>{ const on=n.dataset.k===best&&bd<70; n.style.transition='transform 300ms cubic-bezier(.5,0,.2,1.4), fill 200ms'; n.style.transform=on?'scale(1.08)':''; n.setAttribute('fill',on?'#FFFFFF':'#E6E617'); });
  });
  svg.closest('.hero').addEventListener('pointerleave',()=>ns.forEach(n=>{n.style.transform='';n.setAttribute('fill','#E6E617');}));
  // pulsos de informação percorrendo a trilha
  if(!reduce){
    const path=$('#hPath',svg), L=path.getTotalLength(), pg=$('.h-pulses',svg);
    const P=[0,.33,.66].map(o=>{const c=document.createElementNS(NS,'rect');c.setAttribute('width',4);c.setAttribute('height',4);c.setAttribute('rx',1.4);c.setAttribute('fill','#fff');pg.appendChild(c);return {c,o};});
    let t0=null; function tick(t){ if(!t0)t0=t; const f=((t-t0)/9000)%1; P.forEach(({c,o})=>{const q=path.getPointAtLength(((f+o)%1)*L);c.setAttribute('x',q.x-2);c.setAttribute('y',q.y-2);}); if($('#p-inicio').classList.contains('is-active')) requestAnimationFrame(tick); else t0=null,requestAnimationFrame(wait); }
    function wait(){ if($('#p-inicio').classList.contains('is-active')) requestAnimationFrame(tick); else setTimeout(()=>requestAnimationFrame(wait),400); }
    setTimeout(()=>requestAnimationFrame(tick),1600);
  }
}

/* =================================================== MARCA · conceito */
function initMarca(){
  const art=$('#conceptArt'); const vb=[SYM[0]-12,SYM[1]-12,SYM[2]-SYM[0]+24,SYM[3]-SYM[1]+24].join(' ');
  art.innerHTML='<svg viewBox="'+vb+'"><g id="cNodes">'+['a','b','c','d'].map(k=>'<path d="'+B.GEO.nodes[k]+'" fill="#E6E617"/>').join('')+'</g>'+
    '<g id="cBr">'+B.GEO.bridges.map(d=>'<path d="'+d+'" fill="#E6E617"/>').join('')+'</g>'+
    '<path id="cTrail" d="'+B.GEO.merged+'" fill="none" stroke="#E6E617" stroke-width="1.2"/></svg>';
  const steps=$$('.concept__steps li'); let i=0, timer;
  const show=k=>{ steps.forEach(s=>s.setAttribute('aria-current',s.dataset.step===k)); const n=$('#cNodes'),b=$('#cBr'),t=$('#cTrail');
    const tr='opacity 500ms, fill 400ms'; [n,b,t].forEach(e=>e.style.transition=tr);
    n.style.opacity=k==='trail'?0:1; $$('path',n).forEach(p=>p.setAttribute('fill',k==='bridges'?'#6b6b42':'#E6E617'));
    b.style.opacity=(k==='bridges'||k==='merged')?1:0; $$('path',b).forEach(p=>p.setAttribute('fill','#E6E617'));
    t.style.opacity=k==='trail'?1:0;
    if(k==='trail'&&!reduce){const L=t.getTotalLength();t.style.strokeDasharray=L;t.style.strokeDashoffset=L;t.getBoundingClientRect();t.style.transition='stroke-dashoffset 1.6s cubic-bezier(.22,.8,.2,1),opacity 300ms';t.style.strokeDashoffset=0;}
  };
  steps.forEach((s,j)=>{ s.tabIndex=0; const go=()=>{clearInterval(timer);show(s.dataset.step);}; s.onclick=go; s.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}}; });
  show('nodes'); if(!reduce) timer=setInterval(()=>{ if(!$('#p-marca').classList.contains('is-active')) return; i=(i+1)%4; show(steps[i].dataset.step); },2600);
}

/* =================================================== LOGOTIPO */
function initLogo(){
  // Anatomia
  const a=$('#anatomyArt'); const box=[SYM[0]-10,SYM[1]-10,B.WRD[2]-SYM[0]+20,SYM[3]-SYM[1]+20];
  a.innerHTML='<svg viewBox="'+box.join(' ')+'">'+B.GEO.bridges.map(d=>'<path data-p="bridges" d="'+d+'" fill="#9a9a97"/>').join('')+
    ['a','b','c','d'].map(k=>'<path data-p="nodes" d="'+B.GEO.nodes[k]+'" fill="#333"/>').join('')+
    B.GEO.word.map((d,i)=>'<path data-p="'+(i<6?'optima':'tech')+'" d="'+d+'" fill="'+(i<6?'#555':'#222')+'"/>').join('')+'</svg>';
  const an=$('#anatomy');
  $$('.anatomy__legend li').forEach(li=>{ li.tabIndex=0; const on=()=>{an.classList.add('dim');$$('path',a).forEach(p=>p.classList.toggle('hl',p.dataset.p===li.dataset.part));}; const off=()=>{an.classList.remove('dim');}; li.onmouseenter=on; li.onfocus=on; li.onmouseleave=off; li.onblur=off; });
  $$('path',a).forEach(p=>{ p.onmouseenter=()=>{an.classList.add('dim');$$('path',a).forEach(q=>q.classList.toggle('hl',q.dataset.p===p.dataset.p));$$('.anatomy__legend li').forEach(l=>l.classList.toggle('on',l.dataset.part===p.dataset.p));}; p.onmouseleave=()=>{an.classList.remove('dim');$$('.anatomy__legend li').forEach(l=>l.classList.remove('on'));}; });

  // Construção
  const x0=SYM[0], y0=SYM[1]; const cols=9, rows=6; let grid='';
  for(let i=0;i<=cols;i++) grid+='<line x1="'+(x0+i*U)+'" y1="'+(y0-U)+'" x2="'+(x0+i*U)+'" y2="'+(y0+rows*U)+'" stroke="#d8d7d3" stroke-width=".35"/>';
  for(let j=-1;j<=rows;j++) grid+='<line x1="'+(x0-U*.5)+'" y1="'+(y0+j*U)+'" x2="'+(x0+cols*U)+'" y2="'+(y0+j*U)+'" stroke="#d8d7d3" stroke-width=".35"/>';
  const nd=NODE_BOX.d; const ann=
    '<g font-family="Sora" font-size="5" fill="#6B6C6C">'+
    '<rect x="'+nd[0]+'" y="'+nd[1]+'" width="'+(nd[2]-nd[0])+'" height="'+(nd[3]-nd[1])+'" fill="none" stroke="#E65717" stroke-width=".6" stroke-dasharray="1.5 1"/>'+
    '<text x="'+(nd[2]+3)+'" y="'+(nd[1]+6)+'" fill="#E65717">u</text>'+
    '<path d="M'+SYM[0]+' '+(SYM[3]+9)+'h'+(8*U)+'" stroke="#333" stroke-width=".5"/><path d="M'+SYM[0]+' '+(SYM[3]+7)+'v4M'+(SYM[0]+8*U)+' '+(SYM[3]+7)+'v4" stroke="#333" stroke-width=".5"/>'+
    '<text x="'+(SYM[0]+4*U)+'" y="'+(SYM[3]+17)+'" text-anchor="middle" fill="#333">8u</text>'+
    Object.entries(NODE_BOX).map(([k,b])=>{const s=b[2]-b[0];return '<text x="'+((b[0]+b[2])/2)+'" y="'+((b[1]+b[3])/2+1.8)+'" text-anchor="middle" fill="#fff" font-size="'+(k==='d'?3.4:5)+'">'+(s/U).toFixed(2).replace('.',',')+'u</text>';}).join('')+
    '</g>';
  $('#buildArt').innerHTML='<svg viewBox="'+(x0-14)+' '+(y0-22)+' '+(cols*U+30)+' '+(SYM[3]-SYM[1]+44)+'">'+grid+B.symbolMarkup({sym:'#333',bridge:'tint',bridgeOpacity:.45})+ann+'</svg>';

  // Área de proteção
  const p=2*U, bx=[SYM[0]-p,SYM[1]-p,B.WRD[2]-SYM[0]+2*p,SYM[3]-SYM[1]+2*p];
  const sq=(x,y)=>'<rect x="'+x+'" y="'+y+'" width="'+p+'" height="'+p+'" rx="'+(p*.35)+'" fill="#E6E617" fill-opacity=".55"/>';
  $('#clearArt').innerHTML='<svg viewBox="'+(bx[0]-6)+' '+(bx[1]-6)+' '+(bx[2]+12)+' '+(bx[3]+12)+'">'+
    '<rect x="'+bx[0]+'" y="'+bx[1]+'" width="'+bx[2]+'" height="'+bx[3]+'" fill="#F1F0F1"/>'+
    '<rect x="'+SYM[0]+'" y="'+SYM[1]+'" width="'+(B.WRD[2]-SYM[0])+'" height="'+(SYM[3]-SYM[1])+'" fill="#fff" stroke="#c9c8c4" stroke-width=".5" stroke-dasharray="2 1.5"/>'+
    sq(bx[0],bx[1])+sq(bx[0]+bx[2]-p,bx[1])+sq(bx[0],bx[1]+bx[3]-p)+sq(bx[0]+bx[2]-p,bx[1]+bx[3]-p)+
    '<text x="'+(bx[0]+p/2)+'" y="'+(bx[1]+p/2+3)+'" text-anchor="middle" font-family="Exo" font-weight="600" font-size="9" fill="#333">2u</text>'+
    B.svg({sym:'#333',word:'#333'}).replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg>';
  $('#minSizes').innerHTML=[
    ['Digital · assinatura','120 px de largura',B.svg({sym:'#333',word:'#333',width:120})],
    ['Digital · símbolo','24 px de altura',B.svg({layout:'symbol',sym:'#333',height:24})],
    ['Impresso · assinatura','30 mm de largura','<span style="font:600 28px Exo">30 mm</span>'],
    ['Impresso · símbolo','8 mm de altura','<span style="font:600 28px Exo">8 mm</span>']
  ].map(([t,s,art])=>'<div class="minsize"><div class="minsize__art">'+art+'</div><div><b>'+s+'</b><span>'+t+'</span></div></div>').join('')+'<p class="cap">Abaixo disso as pontes e o contraste OPTIMA/TECH deixam de ser legíveis. Em bordados e gravações, teste antes com o fornecedor.</p>';

  // Versões
  $('#versions').innerHTML=
    '<div class="version"><div class="version__art">'+B.svg({sym:'#333',word:'#333'})+'</div><p><b>Assinatura horizontal</b>Versão preferencial em todas as peças.</p></div>'+
    '<div class="version"><div class="version__art">'+B.svg({layout:'symbol',sym:'#333'})+'</div><p><b>Símbolo</b>Avatares, selos e espaços reduzidos.</p></div>'+
    '<div class="version" style="background:#E6E617"><div class="version__art" style="width:96px;margin:auto">'+B.appIcon({})+'</div><p><b>Ícone de app</b>Favicon, app e perfil em redes.</p></div>';
  const sv=[['filled','Preenchido','Uso padrão.',{}],['tint','Pontes em tom','Pontes a 80%: dá profundidade.',{bridge:'tint'}],['nodes','Nós','Pontos e padrões; nunca como logo.',{mode:'nodes'}],['outline','Contorno','Ilustrações técnicas e fundos.',{mode:'outline'}],['trail','Trilha','Linhas e supergráficos.',{mode:'trail'}],['merged','Fusão','Formas grandes e máscaras de foto.',{mode:'merged'}]];
  $('#symVars').innerHTML=sv.map(([k,t,d,o])=>'<div class="symvar">'+B.svg(Object.assign({layout:'symbol',sym:'#333',pad:.3,strokeWidth:2},o))+'<b>'+t+'</b><span>'+d+'</span></div>').join('');

  // Versões cromáticas
  $('#variants').innerHTML=Object.entries(B.VARIANTS).map(([k,v])=>'<div class="variant"><div class="variant__art" style="background:'+v.bg+'">'+B.svg({variant:k,bg:false})+'</div><div class="variant__meta"><span>'+v.label+(v.note?'<small>'+v.note+'</small>':'')+'</span><button data-v="'+k+'" data-f="svg" aria-label="Baixar SVG '+v.label+'">SVG</button><button data-v="'+k+'" data-f="png" aria-label="Baixar PNG '+v.label+'">PNG</button></div></div>').join('');
  $('#variants').onclick=e=>{const b=e.target.closest('button');if(!b)return;const svg=B.svg({variant:b.dataset.v,pad:2});const n='optimatech-logo-'+b.dataset.v;b.dataset.f==='svg'?dlSvg(svg,n+'.svg'):dlPng(svg,n+'.png',2000);};

  // Gerador
  const sel=$('#lgVariant'); sel.innerHTML=Object.entries(B.VARIANTS).map(([k,v])=>'<option value="'+k+'"'+(k==='citrus-dark'?' selected':'')+'>'+v.label+'</option>').join('');
  const st={layout:'horizontal',bridge:'solid',pad:'2',bg:'1'};
  $$('[data-lg]').forEach(g=>g.onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',g).forEach(x=>x.setAttribute('aria-pressed',x===b));st[g.dataset.lg]=b.value;draw();});
  sel.onchange=draw;
  function cur(){ const v=B.VARIANTS[sel.value];
    if(st.layout==='app') return B.appIcon({tile:st.bg==='1'?v.bg:null,sym:v.sym,bridge:st.bridge,bridgeOpacity:.5});
    return B.svg({layout:st.layout,variant:sel.value,bg:st.bg==='1'?undefined:false,pad:+st.pad,bridge:st.bridge}); }
  function draw(){ $('#lgPrev').innerHTML=cur(); }
  draw();
  const fname=()=>'optimatech-'+(st.layout==='horizontal'?'logo':st.layout==='symbol'?'simbolo':'icone')+'-'+sel.value+(st.bg==='0'?'-transparente':'');
  $('#lgSvg').onclick=()=>dlSvg(cur(),fname()+'.svg');
  $('#lgPng').onclick=()=>dlPng(cur(),fname()+'.png',+$('#lgW').value||2000);
  $('#lgCopy').onclick=()=>S.copy(cur(),'SVG copiado');

  // Usos incorretos
  const L=B.svg({sym:'#333',word:'#333'}), inner=L.replace(/^<svg[^>]*>|<\/svg>$/g,''), vbL=L.match(/viewBox="([^"]+)"/)[1];
  const mk=(body,extra)=>'<svg viewBox="'+(extra&&extra.vb||vbL)+'" overflow="visible">'+(extra&&extra.defs||'')+body+'</svg>';
  const v=vbL.split(' ').map(Number);
  const D=[
    [mk('<g transform="translate('+v[0]+' 0) scale(1.35 1) translate('+(-v[0])+' 0)">'+inner+'</g>',{vb:[v[0],v[1],v[2]*1.35,v[3]].join(' ')}),'Não distorça nem altere a proporção.'],
    [mk('<g transform="rotate(-12 '+(v[0]+v[2]/2)+' '+(v[1]+v[3]/2)+')">'+inner+'</g>'),'Não gire o logotipo.'],
    [B.svg({sym:'#2F6BDB',word:'#D6338C'}),'Não aplique cores fora das versões aprovadas.'],
    [B.svg({sym:'#C49244',word:'#C49244'}),'Não use o dourado da versão antiga no logotipo.'],
    [mk('<g filter="url(#sh)">'+inner+'</g>',{defs:'<filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="3" dy="5" stdDeviation="3" flood-opacity=".5"/></filter>'}),'Não adicione sombras, brilhos ou efeitos.'],
    ['<svg viewBox="0 0 300 80"><text x="150" y="50" text-anchor="middle" font-family="Arial,Helvetica" font-weight="700" font-size="34" fill="#333">OPTIMATECH</text></svg>','Não digite o logotipo com outra fonte.'],
    [mk('<g transform="translate('+(B.WRD[2]-SYM[2]+20)+' 0)">'+B.symbolMarkup({sym:'#333'})+'</g><g transform="translate('+(SYM[0]-B.WRD[0])+' 0)">'+B.wordMarkup({word:'#333'})+'</g>'),'Não reorganize símbolo e palavra.'],
    ['<svg viewBox="0 0 320 120"><rect width="320" height="120" fill="#F1C360"/><g transform="translate(25 15) scale(.62)">'+B.svg({sym:'#E6E617',word:'#E6E617'}).replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</g></svg>','Não use combinações sem contraste.']
  ];
  $('#donts').innerHTML=D.map(([s,t])=>'<figure class="dont"><div class="art">'+s+'</div><figcaption>'+t+'</figcaption></figure>').join('');

  // Apps
  $('#apps').innerHTML=[['Citrus','#E6E617',{}],['Laranja','#E65717',{}],['Branco','#FFFFFF',{}],['Contorno','#E6E617',{mode:'outline'}],['Nós','#E6E617',{mode:'nodes'}]]
    .map(([t,c,o])=>'<figure><div style="width:96px">'+B.appIcon(Object.assign({sym:c},o))+'</div><figcaption>'+t+'</figcaption></figure>').join('');
}

/* =================================================== CORES */
const COLOR=[
  // id, nome, hex, cmyk, papel, grupo
  ['citrus','Citrus','#E6E617','16 · 1 · 96 · 0','Assinatura da marca. Destaques, fundos de impacto, ícones sobre Graphite.','p'],
  ['graphite','Graphite','#333333','78 · 69 · 62 · 70','Texto principal, fundos escuros, estrutura.','p'],
  ['white','Branco','#FFFFFF','0 · 0 · 0 · 0','Respiro. O fundo padrão das peças institucionais.','p'],
  ['ice','Gelo','#F1F0F1','7 · 5 · 5 · 0','Fundos claros, painéis, slides.','n'],
  ['gray','Cinza','#908F8F','46 · 38 · 37 · 12','Legendas, logotipo monocromático, linhas.','n'],
  ['steel','Aço','#808181','51 · 41 · 41 · 18','Texto secundário, IA Lab.','n'],
  ['iron','Ferro','#6B6C6C','58 · 48 · 47 · 27','Texto secundário sobre claro.','n'],
  ['lemon','Limão','#EEE454','11 · 5 · 80 · 0','Variação clara do Citrus em blocos e gráficos.','w'],
  ['butter','Manteiga','#F8D568','6 · 16 · 69 · 0','Fundos quentes e realces suaves.','w'],
  ['sand','Areia','#F1C360','7 · 25 · 72 · 0','Fundo quente aprovado para o logotipo.','w'],
  ['amber','Âmbar','#FBB03B','3 · 36 · 85 · 1','Gradientes e luz de fábrica.','w'],
  ['bronze','Bronze','#A97727','24 · 48 · 98 · 23','Fundo quente escuro, detalhes.','w'],
  ['olive','Oliva','#B3B336','36 · 16 · 93 · 6','Supergráficos e fundos de apoio ao Citrus.','w'],
  ['orange','Laranja','#E65717','0 · 75 · 98 · 5','Acento de alerta. Sensor Virtual.','w'],
  ['slate','Ardósia','#73829D','54 · 37 · 16 · 22','Texto e fundos frios em apresentações, com moderação.','w']
];
const SOL=[['Gêmeo Digital','#2794A8','75 · 12 · 23 · 18','#fff'],['Sensor Virtual','#E65717','0 · 75 · 98 · 5','#fff'],['COI','#E6E617','16 · 1 · 96 · 0','#333'],['IA Lab','#808181','51 · 41 · 41 · 18','#fff']];
const CAMP=['#E65717','#F261AA','#7C17E6','#8FE617','#6194F2','#3917E6','#E61B17','#E617D8','#17E6CE','#E6CD17','#F29861','#61F2B3','#73829D','#5F3D66'];
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function lum(h){return hex2rgb(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const inkOn=h=>ratio(h,'#333333')>=ratio(h,'#FFFFFF')?'#333333':'#FFFFFF';
function swatch(c,big){ const [id,n,h,cmyk,role]=c; const rgb=hex2rgb(h).join(' · '); const ink=inkOn(h);
  return '<div class="sw" style="background:'+h+';color:'+ink+'"><div><h3>'+n+'</h3>'+(big?'<p class="sw__role">'+role+'</p>':'')+'</div><div class="sw__vals">'+
   '<button data-copy="'+h+'" data-copy-label="HEX"><span>HEX</span>'+h+'</button><button data-copy="rgb('+hex2rgb(h).join(', ')+')" data-copy-label="RGB"><span>RGB</span>'+rgb+'</button><button data-copy="C'+cmyk.replace(/ · /g,' ')+'" data-copy-label="CMYK"><span>CMYK</span>'+cmyk+'</button></div></div>'; }
function initCores(){
  $('#swPrimary').innerHTML=COLOR.filter(c=>c[5]==='p').map(c=>swatch(c,true)).join('');
  $('#swNeutral').innerHTML=COLOR.filter(c=>c[5]==='n').map(c=>swatch(c)).join('');
  $('#swWarm').innerHTML=COLOR.filter(c=>c[5]==='w').map(c=>swatch(c)).join('');
  $('#swSol').innerHTML=SOL.map(([n,h,cmyk,ink])=>'<div class="sol"><div class="sol__tag" style="background:'+h+';color:'+ink+'">'+B.svg({layout:'symbol',sym:ink})+n+'</div><div class="sol__meta"><button class="chip copyable" data-copy="'+h+'">'+h+'</button> CMYK '+cmyk+'</div></div>').join('');
  $('#ratio').innerHTML=[['#FFFFFF','Branco e Gelo',50],['#F1F0F1','',12],['#333333','Graphite',25],['#E6E617','Citrus',8],['#F1C360','Quentes',5]].map(([h,t,p])=>'<div style="flex:'+p+';background:'+h+';color:'+inkOn(h)+'">'+(t?t+' '+(t==='Branco e Gelo'?'62':p)+'%':'')+'</div>').join('');
  const fg=[['Graphite','#333333'],['Branco','#FFFFFF'],['Citrus','#E6E617'],['Ferro','#6B6C6C'],['Cinza','#908F8F'],['Laranja','#E65717'],['Bronze','#A97727']];
  const bg=[['Branco','#FFFFFF'],['Gelo','#F1F0F1'],['Graphite','#333333'],['Citrus','#E6E617'],['Areia','#F1C360']];
  $('#contrast').innerHTML='<thead><tr><th>Texto \\ Fundo</th>'+bg.map(b=>'<th>'+b[0]+'</th>').join('')+'</tr></thead><tbody>'+
    fg.map(f=>'<tr><th>'+f[0]+'</th>'+bg.map(b=>{const r=ratio(f[1],b[1]);const l=r>=7?'AAA':r>=4.5?'AA':r>=3?'AA grande':'Evitar';return '<td class="cx" style="background:'+b[1]+';color:'+f[1]+(r<3?';opacity:.55':'')+'">'+r.toFixed(1)+':1<span class="lvl">'+l+'</span></td>';}).join('')+'</tr>').join('')+'</tbody>';
  $('#swCamp').innerHTML=CAMP.map(h=>'<button style="background:'+h+';color:'+inkOn(h)+'" data-copy="'+h+'">'+h+'</button>').join('');
  $('#swCamp').style.gridTemplateColumns='repeat(7,1fr)';
}

/* =================================================== TIPOGRAFIA */
function initTipo(){
  $$('.weights').forEach(w=>{ const f=w.dataset.font; const names={200:'ExtraLight',300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold',800:'ExtraBold'};
    w.innerHTML=w.dataset.w.split(',').map(x=>'<span style="font-family:'+f+';font-weight:'+x+'">Ag<small>'+names[x]+' '+x+'</small></span>').join(''); });
  const rows=[[89,'Hero','Exo Light',300,'Ciência aplicada'],[55,'H1','Exo Regular',400,'Gêmeo digital fenomenológico'],[34,'H2','Exo Medium',500,'Detecção e diagnóstico de falhas'],[21,'Lead','Sora Light',300,'Atualização a cada minuto, não a cada oito horas.'],[13,'Small / UI','Sora Regular',400,'Legendas, rótulos de interface e notas de rodapé.'],[8,'Micro','Sora Regular',400,'Apenas impresso: créditos e textos legais em peças grandes.']];
  $('#typeScale').innerHTML=rows.map(([s,n,f,w,t])=>'<div class="scale__row"><small><b>'+n+'</b>'+s+' px · '+f+'</small><div style="font-size:'+s+'px;font-weight:'+w+';font-family:'+(f.startsWith('Exo')?'Exo':'Sora')+'">'+t+'</div></div>').join('');
  const st={font:'Exo'}; const out=$('#ttOut'), w=$('#ttW'), s=$('#ttS');
  const upd=()=>{out.style.fontFamily=st.font;out.style.fontWeight=w.value;out.style.fontSize=s.value+'px';$('#ttVal').textContent=st.font+' '+w.value+' · '+s.value+' px';};
  $$('[data-tt="font"] button').forEach(b=>b.onclick=()=>{$$('[data-tt="font"] button').forEach(x=>x.setAttribute('aria-pressed',x===b));st.font=b.value;upd();});
  w.oninput=upd; s.oninput=upd; upd();
}

/* =================================================== GRID */
function initGrid(){
  $('#spaceScale').innerHTML=[3,5,8,13,21,34,55,89,144].map((v,i)=>'<div class="space__row"><span><b>s-'+(i+1)+'</b> · '+v+'px</span><i style="width:'+v*2+'px"></i></div>').join('');
  $('#radii').innerHTML=[['r-xs',3],['r-sm',6],['r-md',8],['r-lg',13],['r-xl',21]].map(([n,v])=>'<figure><div class="r" style="border-radius:'+v+'px"></div><figcaption>'+n+' · '+v+'px</figcaption></figure>').join('')+
    '<figure><div class="r r--node" style="border-radius:35%"></div><figcaption>r-node · 35%</figcaption></figure>';
  const cols=(n,w,h,m,g)=>{let s='';const cw=(w-2*m-(n-1)*g)/n;for(let i=0;i<n;i++)s+='<rect x="'+(m+i*(cw+g))+'" y="'+m+'" width="'+cw+'" height="'+(h-2*m)+'" fill="#E6E617" fill-opacity=".28"/>';return s;};
  const logoAt=(x,y,w,c)=>'<g transform="translate('+x+' '+y+') scale('+(w/(B.WRD[2]-SYM[0]))+') translate('+(-SYM[0])+' '+(-SYM[1])+')">'+B.symbolMarkup({sym:c})+B.wordMarkup({word:c})+'</g>';
  $('#layouts').innerHTML=
    '<figure><div class="frame"><svg viewBox="0 0 1920 1080">'+cols(12,1920,1080,89,21)+logoAt(89,60,220,'#333')+'<text x="89" y="560" font-family="Exo" font-size="89" font-weight="300" fill="#333">Título do slide</text><text x="1831" y="80" text-anchor="end" font-family="Sora" font-size="22" fill="#6B6C6C">Março / 2026</text></svg></div><figcaption><b>Apresentação 16:9</b>12 colunas, margem 89 px, calha 21 px. Logo no canto superior esquerdo, data à direita.</figcaption></figure>'+
    '<figure><div class="frame"><svg viewBox="0 0 210 297">'+cols(6,210,297,21,5)+logoAt(21,14,46,'#333')+'<rect x="0" y="282" width="210" height="15" fill="#333"/></svg></div><figcaption><b>A4</b>6 colunas, margens de 21 mm, rodapé em faixa.</figcaption></figure>'+
    '<figure><div class="frame"><svg viewBox="0 0 1080 1350">'+cols(4,1080,1350,89,21)+'<rect x="55" y="55" width="970" height="1240" fill="none" stroke="#E65717" stroke-width="3" stroke-dasharray="14 10"/>'+logoAt(89,1180,260,'#333')+'</svg></div><figcaption><b>Post 4:5</b>Área segura de 55 px. Logo no rodapé, nunca no centro.</figcaption></figure>';
}

/* =================================================== TEXTURAS */
const PAL=[['#333333','#E6E617','#E6E617'],['#FFFFFF','#333333','#E6E617'],['#E6E617','#333333','#B3B336'],['#F1F0F1','#C9C8C4','#333333'],['#F1C360','#FFFFFF','#A97727'],['#73829D','#FFFFFF','#E6E617'],['#333333','#E65717','#F1C360']];
const TEX={
  super:{t:'Supergráfico',d:'O símbolo em escala gigante, cortado pela página. Para capas, fundos de slide e ambientação.'},
  trilhas:{t:'Trilhas',d:'Contornos do símbolo repetidos em camadas, como ondas de processo. Fundos discretos e papelaria.'},
  nos:{t:'Padrão de nós',d:'Os quatro nós em malha contínua. Para texturas, embalagens e superfícies grandes.'},
  pontos:{t:'Linha de pontos',d:'Nós em sequência rítmica, como dados chegando. Rodapés e divisores.'},
  blocos:{t:'Blocos',d:'Nós ampliados e sobrepostos com transparência. Fundos de posts e capas.'},
  gradiente:{t:'Luz quente',d:'Gradiente de fábrica ao entardecer com o símbolo desfocado. Só com o símbolo, nunca com o logotipo completo.'}
};
function rnd(seed){let s=seed*9301+49297;return()=>((s=(s*9301+49297)%233280)/233280);}
function texture(type,W,H,pal,scale,seed){
  const [bg,fg,ac]=pal; const r=rnd(seed); const sc=scale/100; let body='', defs='';
  const symW=SYM[2]-SYM[0], symH=SYM[3]-SYM[1];
  const place=(k,cx,cy,inner)=>'<g transform="translate('+cx+' '+cy+') scale('+k+') translate('+(-(SYM[0]+symW/2))+' '+(-(SYM[1]+symH/2))+')">'+inner+'</g>';
  if(type==='super'){ const k=Math.max(W,H)/symW*1.05*sc; body=place(k,W*(.5+r()*.25),H*(.5+r()*.25),'<path d="'+B.GEO.merged+'" fill="'+fg+'"/>'); body+=place(Math.min(W,H)*.06/symW*3,W*.07,H*.1,B.symbolMarkup({sym:fg===bg?ac:ac})).replace(/^/,''); }
  if(type==='trilhas'){ const k=Math.max(W,H)/symW*1.1*sc; let g=''; const n=10+Math.floor(r()*6); for(let i=0;i<n;i++){ g+='<g transform="translate('+(i*W*.012)+' '+(-i*H*.008)+')" opacity="'+(1-i/(n*1.3))+'">'+place(k*(1+i*.03),W*.62,H*.6,'<path d="'+B.GEO.merged+'" fill="none" stroke="'+fg+'" stroke-width="'+(1.4/(k*(1+i*.03)))*Math.max(1,W/1500)+'"/>')+'</g>'; } body=g; }
  if(type==='nos'){ const cell=symW*.62*sc*Math.max(W,H)/1600; const k=cell/symW; let g=''; let row=0; for(let y=-cell;y<H+cell;y+=symH*k*1.15,row++){ for(let x=-cell+(row%2?cell*.5:0);x<W+cell;x+=cell*1.02){ g+=place(k*(.9+r()*.15),x,y,B.symbolMarkup({sym:fg,mode:'nodes'})); } } body=g; }
  if(type==='pontos'){ const s0=Math.min(W,H)*.05*sc; let x=W*.04, y=H*.82, i=0, g=''; while(x<W*1.02){ const big=i%3===0, mid=i%3===1; const s=big?s0:mid?s0*.62:s0*.45; const yy=y+(i%2?-s0*.9:0)+(mid?s0*.4:0); g+='<rect x="'+x+'" y="'+yy+'" width="'+s+'" height="'+s+'" rx="'+(s*.35)+'" fill="'+fg+'" opacity="'+(.35+.65*(x/W))+'"/>'; x+=s+s0*.55; i++; } body=g+place(Math.min(W,H)*.12/symW,W*.1,H*.12,B.symbolMarkup({sym:ac,bridge:'tint'})); }
  if(type==='blocos'){ const s=Math.min(W,H)*.78*sc; const a=[W*(.38+r()*.12),H*(.02+r()*.1)], b=[a[0]+s*.42,a[1]+s*.45]; body='<rect x="'+a[0]+'" y="'+a[1]+'" width="'+s*.7+'" height="'+s*.7+'" rx="'+(s*.7*.35)+'" fill="'+ac+'" fill-opacity=".85"/><rect x="'+b[0]+'" y="'+b[1]+'" width="'+s+'" height="'+s+'" rx="'+(s*.35)+'" fill="'+fg+'" fill-opacity=".72"/>'+place(Math.min(W,H)*.09/symW,W*.1,H*.1,B.symbolMarkup({sym:fg===bg?ac:fg})); }
  if(type==='gradiente'){ defs='<linearGradient id="gq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1C360"/><stop offset=".55" stop-color="#A97727"/><stop offset="1" stop-color="#5F4A2A"/></linearGradient><radialGradient id="gr" cx="'+(.3+r()*.4)+'" cy=".25" r=".7"><stop offset="0" stop-color="#FBE9A6" stop-opacity=".9"/><stop offset="1" stop-color="#FBE9A6" stop-opacity="0"/></radialGradient><filter id="gb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="'+(Math.min(W,H)*.012)+'"/></filter>';
    body='<rect width="'+W+'" height="'+H+'" fill="url(#gq)"/><rect width="'+W+'" height="'+H+'" fill="url(#gr)"/><g filter="url(#gb)" opacity=".7">'+place(Math.min(W,H)*.8*sc/symW,W*.5,H*.5,B.symbolMarkup({sym:'#4a3d22'}))+'</g><rect x="0" y="'+(H*.86)+'" width="'+W+'" height="'+(H*.14)+'" fill="'+ (pal[0]==='#333333'?'#2a2622':'#73829D') +'" opacity=".0"/>';
    return '<svg xmlns="'+NS+'" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><defs>'+defs+'</defs>'+body+'</svg>'; }
  return '<svg xmlns="'+NS+'" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><defs>'+defs+'</defs><rect width="'+W+'" height="'+H+'" fill="'+bg+'"/>'+body+'</svg>';
}
function initTex(){
  const st={type:'super',pal:0,fmt:'1920x1080'}; const tabs=$('#texTabs');
  tabs.innerHTML=Object.entries(TEX).map(([k,v],i)=>'<button value="'+k+'" aria-pressed="'+(i===0)+'">'+v.t+'</button>').join('');
  $('#texPal').innerHTML=PAL.map((p,i)=>'<button aria-pressed="'+(i===0)+'" value="'+i+'" aria-label="Combinação '+(i+1)+'" style="background:'+p[0]+'"><i style="background:'+p[0]+'"></i><i style="background:'+p[1]+'"></i></button>').join('');
  const draw=()=>{ const [W,H]=st.fmt.split('x').map(Number); $('#texPrev').innerHTML=texture(st.type,W,H,PAL[st.pal],+$('#texScale').value,+$('#texSeed').value).replace(/ width="\d+" height="\d+"/,''); $('#texDesc').textContent=TEX[st.type].d; };
  const seg=(el,key,num)=>el.onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',el).forEach(x=>x.setAttribute('aria-pressed',x===b));st[key]=num?+b.value:b.value;draw();};
  seg(tabs,'type'); seg($('#texPal'),'pal',1); seg($('#texFmt'),'fmt');
  $('#texScale').oninput=draw; $('#texSeed').oninput=draw; draw();
  const cur=()=>{const [W,H]=st.fmt.split('x').map(Number);return {svg:texture(st.type,W,H,PAL[st.pal],+$('#texScale').value,+$('#texSeed').value),W};};
  $('#texSvg').onclick=()=>{const c=cur();dlSvg(c.svg,'optimatech-textura-'+st.type+'-'+st.fmt+'.svg');};
  $('#texPng').onclick=()=>{const c=cur();dlPng(c.svg,'optimatech-textura-'+st.type+'-'+st.fmt+'.png',c.W);};
}

/* =================================================== ÍCONES */
const CATS={todos:'Todos',tecnologia:'Tecnologia',dados:'Dados',industria:'Indústria',energia:'Energia',sustentabilidade:'Sustentabilidade',ciencia:'Ciência',estrategia:'Estratégia',financas:'Finanças',pessoas:'Pessoas',interface:'Interface'};
function iconSvg(k,color,size){ const i=window.OT_ICONS[k]; return '<svg xmlns="'+NS+'" viewBox="'+i.v+'"'+(size?' width="'+size+'" height="'+size+'"':'')+' fill="'+(color||'currentColor')+'">'+i.b+'</svg>'; }
function initIcons(){
  if(!window.OT_ICONS){ setTimeout(initIcons,100); return; }
  const I=window.OT_ICONS, keys=Object.keys(I).sort((a,b)=>I[a].l.localeCompare(I[b].l,'pt'));
  const st={cat:'todos',q:'',color:'#333333',dark:false};
  $('#icCat').innerHTML=Object.entries(CATS).map(([k,v])=>'<button value="'+k+'" aria-pressed="'+(k==='todos')+'">'+v+'</button>').join('');
  const COLS=[['#333333',0,'Graphite'],['#FFFFFF',1,'Branco sobre Graphite'],['#E6E617',1,'Citrus sobre Graphite'],['#E65717',0,'Laranja'],['#2794A8',0,'Gêmeo Digital']];
  $('#icColors').innerHTML=COLS.map(([c,d,l],i)=>'<button aria-pressed="'+(i===0)+'" title="'+l+'" aria-label="'+l+'" style="background:'+(d?'linear-gradient(135deg,#333 50%,'+c+' 50%)':c)+'" data-c="'+c+'" data-d="'+d+'"></button>').join('');
  const grid=$('#icGrid');
  grid.innerHTML=keys.map(k=>'<button class="ic" data-k="'+k+'" data-s="'+(I[k].l+' '+k+' '+CATS[I[k].c]).toLowerCase()+'" data-c="'+I[k].c+'">'+iconSvg(k)+'<span>'+I[k].l+'</span></button>').join('');
  const filter=()=>{ let n=0; $$('.ic',grid).forEach(b=>{const ok=(st.cat==='todos'||b.dataset.c===st.cat)&&(!st.q||b.dataset.s.includes(st.q));b.hidden=!ok;if(ok)n++;}); $('#icCount').textContent=n+' de '+keys.length+' ícones'+(n===0?'. Tente outro termo, como "energia" ou "pessoas".':''); };
  $('#icQ').oninput=e=>{st.q=e.target.value.trim().toLowerCase();filter();};
  $('#icCat').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',$('#icCat')).forEach(x=>x.setAttribute('aria-pressed',x===b));st.cat=b.value;filter();};
  $('#icColors').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',$('#icColors')).forEach(x=>x.setAttribute('aria-pressed',x===b));st.color=b.dataset.c;st.dark=b.dataset.d==='1';grid.style.setProperty('--ic',st.color);grid.classList.toggle('on-dark',st.dark);};
  $('#icSize').oninput=e=>grid.style.setProperty('--ics',e.target.value+'px');
  filter();
  const dr=$('#icDrawer'); let curK;
  grid.onclick=e=>{const b=e.target.closest('.ic');if(!b)return;curK=b.dataset.k;const i=I[curK];$('#icArt').innerHTML=iconSvg(curK,st.color);$('#icArt').style.background=st.dark?'#333':'';$('#icName').textContent=i.l;$('#icMeta').textContent=CATS[i.c]+' · arquivo '+curK+'.svg';dr.hidden=false;$('#icX').focus();};
  const close=()=>{dr.hidden=true;};
  $('#icX').onclick=close; dr.onclick=e=>{if(e.target===dr)close();}; document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dr.hidden)close();});
  $('#icDlSvg').onclick=()=>dlSvg(iconSvg(curK,st.color),'optimatech-icone-'+curK+'.svg');
  $('#icDlPng').onclick=()=>dlPng(iconSvg(curK,st.color),'optimatech-icone-'+curK+'.png',512);
  $('#icCopy').onclick=()=>S.copy(iconSvg(curK,st.color),'SVG copiado');
}

/* =================================================== FOTOGRAFIA */
function initFoto(){
  const P=[['engenheira-sorrindo-campo','Engenheira em campo','w3 h2'],['siderurgia-alto-forno','Alto-forno, siderurgia','w3'],['operador-veterano-retrato','Operador veterano','w2'],['mestre-acucar-cristais','Mestre de açúcar','w1'],['petroquimica-drone-entardecer','Complexo petroquímico','w2'],['engenheira-tablet-forno','Engenheira com tablet','w2'],['pelotizacao-forno-grelha','Forno de pelotização','w2'],['gemeo-dourado-reator','Reator, conceito gêmeo digital','w2'],['maos-desenho-processo','Desenho de processo','w2'],['operador-sala-controle-calma','Sala de controle','w2'],['vapor-contraluz','Vapor ao entardecer','w3'],['caderno-operador-antigo','Caderno de turno','w3']];
  $('#photoMosaic').innerHTML=P.map(([f,c,cl])=>'<figure class="'+cl.replace('w1','')+'"><img loading="lazy" src="assets/img/foto/'+f+'.jpg" alt="'+c+'"><figcaption>'+c+'</figcaption></figure>').join('');
  const d=$('#duo'), r=$('input',d); r.oninput=()=>d.style.setProperty('--p',r.value+'%');
  $$('[data-logo]').forEach(s=>s.innerHTML=B.svg(s.dataset.logo==='white'?{sym:'#fff',word:'#fff'}:{sym:'#E6E617',word:'#E65717'}));
}

/* =================================================== MOVIMENTO */
function initMov(){
  const vb=[SYM[0]-10,SYM[1]-10,SYM[2]-SYM[0]+20,SYM[3]-SYM[1]+20].join(' ');
  const demos=[
    ['assemble','Montagem','Os nós chegam em sequência e encaixam com leve rebote. Abertura de vídeos e carregamento.'],
    ['flow','Fluxo','Pulsos percorrem a trilha do símbolo: informação circulando. Estados de processamento.'],
    ['draw','Traço','A trilha se desenha e o símbolo preenche. Transições de capítulo e encerramentos.']];
  $('#motionDemos').innerHTML=demos.map(([k,t,d])=>'<div class="mo" data-m="'+k+'"><div class="mo__stage"><svg viewBox="'+vb+'"></svg></div><div class="mo__meta"><h3>'+t+'</h3><p>'+d+'</p><button class="btn btn--sm btn--accent">Repetir</button></div></div>').join('');
  const run={
    assemble(svg){ svg.innerHTML=B.GEO.bridges.map(d=>'<path class="b" d="'+d+'" fill="#E6E617" fill-opacity=".5" opacity="0"/>').join('')+['a','b','c','d'].map(k=>'<path class="n" d="'+B.GEO.nodes[k]+'" fill="#E6E617"/>').join('');
      $$('.n',svg).forEach((n,i)=>{n.style.transformBox='fill-box';n.style.transformOrigin='center';n.animate([{transform:'translateY(40px) scale(.2)',opacity:0},{transform:'none',opacity:1}],{duration:reduce?0:700,delay:i*120,easing:'cubic-bezier(.5,0,.2,1.4)',fill:'both'});});
      $$('.b',svg).forEach((b,i)=>b.animate([{opacity:0},{opacity:1}],{duration:reduce?0:500,delay:650+i*100,fill:'both'})); },
    flow(svg){ svg.innerHTML='<path d="'+B.GEO.merged+'" fill="none" stroke="#555" stroke-width="1.2"/>'+B.symbolMarkup({sym:'#E6E617',mode:'nodes'}).replace(/fill="#E6E617"/g,'fill="#E6E617" fill-opacity=".18"')+'<g class="p"></g>';
      const p=$('path',svg), L=p.getTotalLength(), g=$('.p',svg); g.innerHTML=[0,1,2,3,4].map(()=>'<rect width="5" height="5" rx="1.75" fill="#E6E617"/>').join('');
      const rs=$$('rect',g); const t0=performance.now(); const id=Math.random(); svg.dataset.run=id;
      (function f(t){ if(svg.dataset.run!=id) return; const q=((t-t0)/4000)%1; rs.forEach((r,i)=>{const pt=p.getPointAtLength(((q+i*.2)%1)*L);r.setAttribute('x',pt.x-2.5);r.setAttribute('y',pt.y-2.5);}); if(!reduce) requestAnimationFrame(f); })(t0); },
    draw(svg){ svg.innerHTML='<path class="t" d="'+B.GEO.merged+'" fill="#E6E617" fill-opacity="0" stroke="#E6E617" stroke-width="1.2"/>'; const t=$('.t',svg), L=t.getTotalLength();
      t.animate([{strokeDasharray:L,strokeDashoffset:L,fillOpacity:0},{strokeDasharray:L,strokeDashoffset:0,fillOpacity:0,offset:.7},{strokeDasharray:L,strokeDashoffset:0,fillOpacity:1}],{duration:reduce?0:2200,easing:'cubic-bezier(.22,.8,.2,1)',fill:'both'}); }
  };
  $$('.mo').forEach(m=>{ const go=()=>run[m.dataset.m]($('svg',m)); $('button',m).onclick=go; go(); });
  $('#easing').innerHTML=[['flow','cubic-bezier(.22,.8,.2,1)','Entrada fluida'],['snap','cubic-bezier(.5,0,.2,1.4)','Encaixe'],['linear','linear','Linear (evite em UI)']].map(([k,e,l])=>'<div class="ease"><b>'+l+'</b><small>'+e+'</small><div class="ease__track"><span class="ease__dot" data-e="'+e+'"></span></div></div>').join('')+'<button class="btn btn--sm" id="easeGo">Comparar curvas</button>';
  const go=()=>$$('.ease__dot').forEach(d=>{const w=d.parentElement.clientWidth-26;d.animate([{transform:'translateX(0)'},{transform:'translateX('+w+'px)'}],{duration:reduce?0:900,easing:d.dataset.e,fill:'forwards'});});
  $('#easeGo').onclick=go; setTimeout(go,300);
}

/* =================================================== VOZ */
function initVoz(){
  const L=[['escuro-industrial','Fábricas complexas<br><b>não precisam operar no escuro.</b>','Campanha institucional'],['operador-sala-controle-calma','Quanto custou sua última parada não planejada? <b>O FDD teria antecipado em dias.</b>','Detecção e diagnóstico de falhas'],['pelotizacao-forno-grelha','Menos reagente.<br>Menos energia.<br><b>Mais recuperação.</b>','Mineração'],['engenheira-tablet-forno','Você não precisa parar sua empresa <b>para otimizá-la.</b>','Diagnóstico'],['gemeo-dourado-reator','O gêmeo digital não imita sua planta. <b>Ele entende a dinâmica dela.</b>','Gêmeo digital'],['caderno-operador-antigo','Em 30 minutos, <b>identificamos se há oportunidade de melhoria na sua planta.</b>','Chamada para diagnóstico']];
  $('#lines').innerHTML=L.map(([f,t,c])=>'<div class="line" style="background-image:url(assets/img/foto/'+f+'.jpg)"><div class="lg">'+B.svg({sym:'#fff',word:'#fff'})+'</div><div><p>'+t+'</p><small>'+c+'</small></div></div>').join('');
  const R=[['Nossa solução inovadora de IA revoluciona sua indústria com +47% de eficiência.','Calculamos dez vezes mais variáveis do que os sensores medem, atualizadas a cada minuto.'],['Agende uma demo e descubra o poder dos dados!','Em 30 minutos, identificamos se há oportunidade de melhoria na sua planta.'],['Plataforma disruptiva de gêmeos digitais com machine learning de ponta.','Gêmeos digitais construídos com física e química reais, não com estatística opaca.'],['Conheça nossos planos Básico, Intermediário e Avançado.','A Plataforma Master conecta Middler, Motor e Monitor ao que a sua operação já tem.']];
  $('#rewrite').innerHTML=R.map(([a,b])=>'<div class="rw"><div><small>Antes</small><p>'+a+'</p></div><div><small>Depois</small><p>'+b+'</p></div></div>').join('');
}

/* =================================================== COMPONENTES */
const SOLS=[['Gêmeo Digital','#2794A8',''],['Sensor Virtual','#E65717',''],['COI','#E6E617',' soltag--coi'],['IA Lab','#808181','']];
function initComp(){
  const sym=c=>B.svg({layout:'symbol',sym:c});
  const C=[
    ['botoes','Botões','Uma ação principal por tela, em Graphite. Citrus para a ação de maior destaque em fundos escuros ou campanhas. Texto do botão diz exatamente o que acontece.',
      '<button class="btn">Solicitar diagnóstico</button><button class="btn btn--accent">Baixar estudo de caso</button><button class="btn btn--ghost">Ver módulos</button><button class="btn btn--sm">Pequeno</button><button class="btn btn--lg">Grande</button><button class="btn" disabled>Indisponível</button>'],
    ['tags','Tags de solução','Identificam a frente de produto (manual v3, p. 56). Versão sólida para capas e destaques; versão em linha para textos e listas.',
      SOLS.map(([n,c,cl])=>'<span class="soltag'+cl+'" style="--c:'+c+'">'+sym(cl?'#333':'#fff')+n+'</span>').join('')+'<br style="flex-basis:100%">'+SOLS.map(([n,c,cl])=>'<span class="soltag soltag--line'+cl+'" style="--c:'+c+'">'+sym(c)+n+'</span>').join('')],
    ['kpi','Indicadores','Número grande em Exo, legenda curta em Sora. Use números concretos e com referência, como no manual.',
      '<div class="kpi"><b>480x</b><span>mais rápido que análise laboratorial</span></div><div class="kpi"><b>16+</b><span>clientes industriais ativos</span></div><div class="kpi"><b>12–24m</b><span>prazo de ROI comprovado em campo</span></div>'],
    ['campos','Campos de formulário','Rótulo sempre visível acima do campo. Mensagens de erro dizem o que corrigir.',
      '<div style="flex:1;min-width:240px"><div class="field"><label for="cf1">Empresa</label><input class="input" id="cf1" placeholder="Nome da empresa"></div></div><div style="flex:1;min-width:240px"><div class="field"><label for="cf2">E-mail corporativo</label><input class="input" id="cf2" value="joao@gmail" aria-invalid="true"><small style="color:#B23E0D">Use o e-mail da empresa, como nome@empresa.com.br.</small></div></div>'],
    ['cards','Cards de conteúdo','Para cases, artigos e soluções. Foto quente no topo, categoria, título curto.',
      [['siderurgia-alto-forno','Siderurgia','Balanço térmico do alto-forno em tempo real','Gêmeo digital calculando o que os sensores não medem.'],['mestre-acucar-cristais','Sucroenergético','Cristalização sob controle','Sensor virtual de pureza para cozedores a vácuo.'],['petroquimica-drone-entardecer','Óleo, gás e energia','Otimização de gasoduto','Modelagem fenomenológica aplicada à malha de transporte.']].map(([f,c,t,d])=>'<article class="ccard"><div class="ccard__img" style="background-image:url(assets/img/foto/'+f+'.jpg)"></div><div class="ccard__b"><small>'+c+'</small><h4>'+t+'</h4><p>'+d+'</p></div></article>').join('')],
    ['navegacao','Barra de navegação','Logo à esquerda, links à direita, fundo Graphite translúcido sobre imagens (manual v3, p. 24).',
      '<div class="navbar">'+B.svg({sym:'#E6E617',word:'#fff',bridge:'tint'})+'<nav><a href="#">Indústrias</a><a href="#">Soluções</a><a href="#">Cases</a><a href="#">Quem somos</a></nav></div>',true],
    ['alertas','Avisos','Barra lateral colorida indica o tipo. Graphite no texto, sem ícones de emoji.',
      '<div class="alert"><div><b>Diagnóstico agendado</b>Você receberá a confirmação por e-mail em até 1 dia útil.</div></div><div class="alert" style="--c:#E65717"><div><b>Sensor sem sinal há 12 minutos</b>Verifique a comunicação com o CLP da linha 2.</div></div>'],
    ['etapas','Etapas','Para processos de implantação. Etapa atual em Citrus, concluídas em Graphite.',
      '<ol class="stepper" style="padding:0;margin:0"><li class="done"><b>Diagnóstico</b>30 min</li><li class="done"><b>Modelagem</b>Física e química</li><li class="cur"><b>Validação</b>Com dados da planta</li><li><b>Operação</b>Atualização a cada minuto</li></ol>']
  ];
  $('#compToc').innerHTML=C.map(c=>'<a href="#componentes/'+c[0]+'">'+c[1]+'</a>').join('');
  $('#components').innerHTML=C.map(([id,t,d,html,dark])=>{ const code=html.replace(/<svg[\s\S]*?<\/svg>/g,'<!-- OTBrand.svg(...) -->').replace(/></g,'>\n<').replace(/<br[^>]*>\n?/g,'');
    return '<section class="comp" id="componentes-'+id+'"><h2>'+t+'</h2><p>'+d+'</p><div class="comp__demo'+(dark?' dark':'')+'"'+(dark?' style="background-image:url(assets/img/foto/vapor-contraluz.jpg);background-size:cover;background-position:center"':'')+'>'+html+'</div><div class="comp__code"><div class="code">'+esc(code)+'<button class="btn btn--sm btn--ghost copy" style="color:#fff;border-color:#555" data-copy="'+esc(code)+'">Copiar</button></div></div></section>'; }).join('')+'<div style="height:89px"></div>';
}

/* =================================================== TOKENS */
function readTokens(){
  const out=[]; for(const sh of document.styleSheets){ let rules; try{rules=sh.cssRules;}catch(e){continue;} if(!/tokens\.css/.test(sh.href||'')) continue;
    for(const r of rules){ if(r.selectorText===':root'){ for(const p of r.style){ if(p.startsWith('--')) out.push([p,r.style.getPropertyValue(p).trim()]); } } } }
  return out;
}
function initTokens(){
  const T=readTokens(); const tb=$('#tokTable');
  if(!T.length){ tb.innerHTML='<tr><td>Abra o site por um servidor (Netlify ou local) para ler os tokens.</td></tr>'; return; }
  const grp=n=>/^--ot-sol/.test(n)?'Cor · soluções':/^--ot-/.test(n)?'Cor · marca':/^--(bg|surface|ink|line|accent|on-accent|focus|ok|warn|danger)/.test(n)?'Cor · semântica':/^--(font|fs|lh)/.test(n)?'Tipografia':/^--s-/.test(n)?'Espaço':/^--r-/.test(n)?'Raio':/^--e-/.test(n)?'Elevação':/^--(ease|t-)/.test(n)?'Movimento':'Layout';
  let last=''; tb.innerHTML='<thead><tr><th>Token</th><th>Valor</th><th class="vis"></th></tr></thead><tbody>'+T.map(([n,v])=>{ const g=grp(n); const head=g!==last?'<tr class="grp"><td colspan="3">'+g+'</td></tr>':''; last=g; const isC=/^#|^var\(--ot/.test(v);
    return head+'<tr><td><button class="chip copyable" data-copy="var('+n+')">'+n+'</button></td><td>'+esc(v)+'</td><td class="vis">'+(isC?'<i style="background:'+v+'"></i>':'')+'</td></tr>'; }).join('')+'</tbody>';
  const resolved=T.map(([n,v])=>[n,getComputedStyle(document.documentElement).getPropertyValue(n).trim()||v]);
  $$('[data-export]').forEach(b=>b.onclick=()=>{ const f=b.dataset.export; let s;
    if(f==='css') s=':root{\n'+T.map(([n,v])=>'  '+n+': '+v+';').join('\n')+'\n}\n';
    if(f==='scss') s=T.map(([n,v])=>'$'+n.slice(2)+': '+v.replace(/var\(--([\w-]+)\)/g,'$$$1')+';').join('\n')+'\n';
    if(f==='json'){ const o={}; resolved.forEach(([n,v])=>{ const g=grp(n).split(' · ')[0].toLowerCase(); (o[g]=o[g]||{})[n.slice(2)]={$value:v,$type:/^#/.test(v)?'color':/px$/.test(v)?'dimension':/ms$/.test(v)?'duration':/cubic/.test(v)?'cubicBezier':'string'}; }); s=JSON.stringify(o,null,2); }
    if(f==='tailwind'){ const col={},sp={},rad={}; resolved.forEach(([n,v])=>{ if(/^--ot-/.test(n)) col[n.slice(5)]=v; if(/^--s-/.test(n)) sp[n.slice(2)]=v; if(/^--r-/.test(n)) rad[n.slice(4)]=v; });
      s='// tailwind.config.js · OPTIMATECH DS v7\nmodule.exports = {\n  theme: { extend: {\n    colors: { ot: '+JSON.stringify(col,null,6)+' },\n    spacing: '+JSON.stringify(sp)+',\n    borderRadius: '+JSON.stringify(rad)+',\n    fontFamily: { display: ["Exo","system-ui","sans-serif"], sans: ["Sora","system-ui","sans-serif"] }\n  } }\n};\n'; }
    S.download('optimatech-tokens.'+(f==='tailwind'?'tailwind.js':f),s,'text/plain'); S.toast('Tokens exportados'); });
}

/* =================================================== APLICAÇÕES */
function initApps(){
  const G=[['Digital e redes sociais',[19,20,21,22,23,24,25]],['Apresentações e documentos',[48,50,49,41,42,57]],['Fundos e supergráficos',[9,40,36,37,38,39,47,17,18,11,12,13]],['Ambientação e mídia exterior',[27,30,31,32,33]],['Objetos e brindes',[28,29,34,35,14,15]],['Paleta e padrões',[7,8,43,44,45,46]]];
  $('#apps-gallery').innerHTML='<div class="gal">'+G.map(([t,ps])=>'<h2>'+t+'</h2><div class="gal__grid">'+ps.map(p=>{const f='assets/img/manual/m'+String(p).padStart(3,'0')+'.jpg';return '<button data-src="'+f+'" data-cap="'+t+' · Manual v3, página '+p+'"><img loading="lazy" src="'+f+'" alt="'+t+', manual página '+p+'"></button>';}).join('')+'</div>').join('')+'</div>';
  const lb=$('#lightbox');
  $('#apps-gallery').onclick=e=>{const b=e.target.closest('button[data-src]');if(!b)return;$('img',lb).src=b.dataset.src;$('p',lb).textContent=b.dataset.cap;lb.hidden=false;$('button',lb).focus();};
  const close=()=>lb.hidden=true; $('button',lb).onclick=close; lb.onclick=e=>{if(e.target===lb)close();}; document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
}

/* =================================================== PAPELARIA + DOWNLOADS */
let MAN=null;
async function manifest(){ if(MAN) return MAN; const r=await fetch('downloads/manifest.json',{cache:'no-cache'}); if(!r.ok) throw new Error('manifest'); MAN=await r.json(); return MAN; }
const fmtSize=b=>!b?'':b>1048576?(b/1048576).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(b/1024))+' KB';
async function initPapel(){
  const el=$('#letterheads');
  try{ const m=await manifest(); const T=m.timbrados||[];
    el.innerHTML=T.map(t=>'<div class="lh__item"><a class="lh__sheet" href="'+(t.pdf||'#')+'" target="_blank" rel="noopener"><img src="'+t.preview+'" alt="Prévia do timbrado '+esc(t.title)+'" loading="lazy"></a><h3>'+esc(t.title)+'</h3><p>'+esc(t.desc)+'</p><div class="lgen__btns">'+
      (t.docx?'<a class="btn btn--sm" href="'+t.docx+'" download>Word (.docx)</a>':'')+(t.dotx?'<a class="btn btn--sm btn--ghost" href="'+t.dotx+'" download>Modelo (.dotx)</a>':'')+(t.pdf?'<a class="btn btn--sm btn--ghost" href="'+t.pdf+'" download>PDF</a>':'')+(t.pdfExemplo?'<a class="btn btn--sm btn--ghost" href="'+t.pdfExemplo+'" target="_blank" rel="noopener">Ver exemplo</a>':'')+'</div></div>').join('')||'<p class="cap">Nenhum modelo publicado.</p>';
  }catch(e){ el.innerHTML='<p class="cap">Os modelos aparecem quando o site está publicado (Netlify) ou aberto por um servidor local. Arquivos na pasta <b>downloads/</b>.</p>'; }
}
async function initDl(){
  const el=$('#dlList'); const ICO={marca:'cubo-3d',papelaria:'documentos',sistema:'modulos-blocos'};
  try{ const m=await manifest(); const L=(m.packs||m.files||m.items||(Array.isArray(m)?m:[]));
    el.innerHTML=L.map(p=>{ const main=/completo/.test(p.id||p.file); const ic=window.OT_ICONS&&window.OT_ICONS[main?'caixa-entrega':(ICO[p.group]||'pasta-download')]?iconSvg(main?'caixa-entrega':(ICO[p.group]||'pasta-download')):'';
      return '<div class="dl__item'+(main?' dl__item--main':'')+'"><div class="dl__ico">'+ic+'</div><div><h3>'+esc(p.title)+'</h3><p>'+esc(p.desc||'')+'</p><div class="dl__fmt">'+(p.formats||[]).map(f=>'<span>'+esc(f)+'</span>').join('')+'<span>'+fmtSize(p.size)+'</span></div></div><a class="btn'+(main?' btn--accent':'')+'" href="'+p.file+'" download>Baixar</a></div>'; }).join('');
  }catch(e){ el.innerHTML='<p class="cap">A lista de pacotes aparece quando o site está publicado (Netlify) ou aberto por um servidor local. Arquivos na pasta <b>downloads/</b>.</p>'; }
}

const INIT={inicio:initHero,marca:initMarca,logotipo:initLogo,cores:initCores,tipografia:initTipo,grid:initGrid,elementos:initTex,iconografia:initIcons,fotografia:initFoto,movimento:initMov,voz:initVoz,componentes:initComp,tokens:initTokens,aplicacoes:initApps,papelaria:initPapel,downloads:initDl};
route();
})();
