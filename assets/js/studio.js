/* =========================================================================
   OPTIMATECH Design System v7 · Studio de papelaria
   Assinatura de e-mail · Cartão de visita · Cartão QR
   Toda marca vem de OTBrand (brand.js). Nenhum logotipo é digitado como texto.
   ========================================================================= */
(function(){
'use strict';

/* SITE_BASE: endereço público onde este Design System será publicado.
   As assinaturas de e-mail apontam as imagens da marca para cá
   (assets/img/studio/*.png). Se o domínio do deploy mudar, atualize aqui. */
const SITE_BASE='https://optimatech-ds.netlify.app/';

const B=window.OTBrand;
const sh=()=>window.OTShell||{toast(){},download(){},copy(){}};
const MM=72/25.4;                 // pontos PDF por milímetro
const DPI300=300/25.4;            // px por mm a 300 dpi

/* ---------- Cores: RGB para tela, CMYK (FOGRA39) para gráfica ---------- */
const C={
  citrus:  {hex:'#E6E617',cmyk:[16,1,96,0]},
  graphite:{hex:'#333333',cmyk:[78,69,62,70]},
  gtext:   {hex:'#333333',cmyk:[0,0,0,90]},     // Graphite para texto fino (1 chapa)
  white:   {hex:'#FFFFFF',cmyk:[0,0,0,0]},
  ice:     {hex:'#F1F0F1',cmyk:[7,5,5,0]},
  gray:    {hex:'#908F8F',cmyk:[46,38,37,12]},
  iron:    {hex:'#6B6C6C',cmyk:[0,0,0,72]},
  sand:    {hex:'#F1C360',cmyk:[7,25,72,0]},
  bronze:  {hex:'#A97727',cmyk:[24,48,98,23]},
  orange:  {hex:'#E65717',cmyk:[0,75,98,5]},
  reg:     {hex:'#000000',cmyk:[0,0,0,100]}
};
function hx(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
function toHex(a){return '#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();}
/* Mistura sólida (sem transparência) — usada no lugar de opacidade para a gráfica */
function mix(a,b,t){const A=hx(a.hex),Bb=hx(b.hex);return {hex:toHex(A.map((v,i)=>v*t+Bb[i]*(1-t))),cmyk:a.cmyk.map((v,i)=>+(v*t+b.cmyk[i]*(1-t)).toFixed(1))};}

/* ---------- Fontes ---------- */
const FONTS={
  'exo-400':{fam:'Exo',w:400,file:'exo-latin-400-normal'},'exo-500':{fam:'Exo',w:500,file:'exo-latin-500-normal'},
  'exo-600':{fam:'Exo',w:600,file:'exo-latin-600-normal'},'exo-700':{fam:'Exo',w:700,file:'exo-latin-700-normal'},
  'sora-300':{fam:'Sora',w:300,file:'sora-latin-300-normal'},'sora-400':{fam:'Sora',w:400,file:'sora-latin-400-normal'},
  'sora-600':{fam:'Sora',w:600,file:'sora-latin-600-normal'},'sora-700':{fam:'Sora',w:700,file:'sora-latin-700-normal'}
};
const cache={};
async function fetchBuf(url){ if(!cache[url]){ cache[url]=fetch(url).then(r=>{if(!r.ok)throw new Error('Falha ao carregar '+url);return r.arrayBuffer();}); } return cache[url]; }
function b64(buf){let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);}
async function fontFaceCSS(keys){
  const css=await Promise.all([...keys].map(async k=>{const f=FONTS[k];const buf=await fetchBuf('assets/fonts/'+f.file+'.woff2');return "@font-face{font-family:'"+f.fam+"';font-weight:"+f.w+";src:url(data:font/woff2;base64,"+b64(buf)+") format('woff2')}";}));
  return css.join('');
}
let measureCtx;
function measure(text,fkey,size){ if(!measureCtx)measureCtx=document.createElement('canvas').getContext('2d'); const f=FONTS[fkey]; measureCtx.font=f.w+' 100px '+f.fam; return measureCtx.measureText(text).width/100*size; }
function fontsReady(){ return Promise.all(Object.values(FONTS).map(f=>document.fonts.load(f.w+' 16px '+f.fam))).catch(()=>{}); }

/* ---------- Lazy loader de libs ---------- */
const libs={};
function loadScript(src){ if(!libs[src])libs[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Não foi possível carregar '+src));document.head.appendChild(s);}); return libs[src]; }
const needPdf=()=>Promise.all([loadScript('assets/vendor/pdf-lib.min.js'),loadScript('assets/vendor/fontkit.umd.min.js')]);
const needQR=()=>loadScript('assets/vendor/qrcode.js');

/* ---------- Pessoa (compartilhada entre as 3 ferramentas) ---------- */
const DEF={nome:'Thiago Feital',cargo:'CEO',area:'',tel:'+55 21 99744-9663',cel:'',email:'thiago.feital@optimatech.com.br',linkedin:'',endereco:'Rua Visconde de Pirajá, 414 · Ipanema · Rio de Janeiro, RJ',site:'optimatech.com.br'};
const KEY='ot-ds7-studio-pessoa';
let P=Object.assign({},DEF);
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object')Object.assign(P,s);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}}
const FIELDS=[
  ['nome','Nome completo','text','Como deve aparecer no material',true],
  ['cargo','Cargo','text','',true],
  ['area','Área ou departamento','text','Opcional',false],
  ['tel','Telefone','tel','Opcional · com DDI e DDD: +55 21 99999-9999',false],
  ['cel','Celular','tel','Opcional',false],
  ['email','E-mail','email','',true],
  ['linkedin','LinkedIn','url','Opcional · ex.: linkedin.com/in/seunome',false],
  ['endereco','Endereço','text','Use “ · ” para separar as partes',false],
  ['site','Site','text','',false]
];
function validate(k,v){
  v=(v||'').trim();
  if(k==='nome'&&!v) return 'Escreva o nome que vai aparecer no material.';
  if(k==='cargo'&&!v) return 'Informe o cargo.';
  if(k==='email'){ if(!v) return 'Informe o e-mail.'; if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Confira o e-mail: falta “@” ou o domínio.'; if(!/@optimatech\.com\.br$/i.test(v)) return 'Dica: use o e-mail corporativo @optimatech.com.br.'; }
  if((k==='tel'||k==='cel')&&v){ const d=v.replace(/\D/g,''); if(d.length<10||d.length>13) return 'O número parece incompleto. Formato: +55 21 99999-9999.'; }
  return '';
}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function nameParts(){const w=(P.nome||'').trim().split(/\s+/).filter(Boolean);return {first:w[0]||'',last:w.slice(1).join(' ')};}
function cargoLine(){return [P.cargo,P.area].filter(s=>s&&s.trim()).join(' · ');}
function addrParts(){const a=(P.endereco||'').split(/\s·\s|\s\|\s/).map(s=>s.trim()).filter(Boolean); if(a.length<=1)return a; const h=Math.ceil(a.length/2); return [a.slice(0,h).join(' · '),a.slice(h).join(' · ')];}
function telHref(t){return 'tel:'+String(t).replace(/[^\d+]/g,'');}
function siteURL(s){s=(s||'').trim();if(!s)return '';return /^https?:/i.test(s)?s:'https://'+s;}
function slug(){return (P.nome||'optimatech').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'optimatech';}

function formHTML(id){
  return '<form class="st-form" id="'+id+'" novalidate autocomplete="on"><h2 class="st-form__title">Seus dados</h2><p class="st-form__hint">Preencha uma vez: os dados valem para as três ferramentas e ficam salvos só neste navegador.</p>'+
   FIELDS.map(([k,l,t,h,req])=>'<div class="field"><label for="'+id+'-'+k+'">'+l+(req?'':' <span class="opt">opcional</span>')+'</label><input class="input" id="'+id+'-'+k+'" data-k="'+k+'" type="'+t+'" '+(t==='email'?'inputmode="email" ':'')+(t==='tel'?'inputmode="tel" ':'')+'value="'+esc(P[k])+'"><small data-msg="'+k+'">'+(h&&h!=='Opcional'?esc(h):'')+'</small></div>').join('')+
   '<button type="button" class="btn btn--ghost btn--sm st-reset">Restaurar exemplo</button></form>';
}
function bindForm(form,onChange){
  form.addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;P[k]=e.target.value;save();check(form,k);syncForms(form);onChange();});
  form.addEventListener('focusout',e=>{const k=e.target.dataset.k;if(k)check(form,k,true);});
  form.querySelector('.st-reset').addEventListener('click',()=>{P=Object.assign({},DEF);save();syncForms();onChange();sh().toast('Exemplo restaurado');});
}
function check(form,k,show){
  const inp=form.querySelector('[data-k="'+k+'"]'),msg=form.querySelector('[data-msg="'+k+'"]');const m=validate(k,P[k]);
  const hint=(FIELDS.find(f=>f[0]===k)[3]||'').replace('Opcional','');
  const isTip=m.startsWith('Dica');
  inp.setAttribute('aria-invalid',m&&!isTip&&(show||inp.getAttribute('aria-invalid')==='true')?'true':'false');
  msg.textContent=m&&(show||isTip)?m:hint; msg.className=m&&!isTip&&show?'err':(isTip?'tip':'');
}
function syncForms(except){document.querySelectorAll('.st-form').forEach(f=>{if(f===except)return;f.querySelectorAll('[data-k]').forEach(i=>{if(document.activeElement!==i)i.value=P[i.dataset.k]||'';});});}

/* =========================================================================
   CENA VETORIAL — fonte única para SVG (tela/PNG) e PDF (RGB ou CMYK)
   Unidades: mm nos impressos, px nos digitais. Origem = canto do corte.
   ========================================================================= */
function rr(x,y,w,h,r,ccw){ r=Math.max(0,Math.min(r,w/2,h/2));
  if(!ccw) return 'M'+(x+r)+' '+y+'H'+(x+w-r)+'A'+r+' '+r+' 0 0 1 '+(x+w)+' '+(y+r)+'V'+(y+h-r)+'A'+r+' '+r+' 0 0 1 '+(x+w-r)+' '+(y+h)+'H'+(x+r)+'A'+r+' '+r+' 0 0 1 '+x+' '+(y+h-r)+'V'+(y+r)+'A'+r+' '+r+' 0 0 1 '+(x+r)+' '+y+'Z';
  return 'M'+(x+r)+' '+y+'A'+r+' '+r+' 0 0 0 '+x+' '+(y+r)+'V'+(y+h-r)+'A'+r+' '+r+' 0 0 0 '+(x+r)+' '+(y+h)+'H'+(x+w-r)+'A'+r+' '+r+' 0 0 0 '+(x+w)+' '+(y+h-r)+'V'+(y+r)+'A'+r+' '+r+' 0 0 0 '+(x+w-r)+' '+y+'Z'; }
const rect=(x,y,w,h,fill,r)=>({t:'path',d:rr(0,0,w,h,r||0),x,y,s:1,fill});
const text=(x,y,runs,anchor)=>({t:'text',x,y,runs,anchor:anchor||'start'});
const run=(s,f,z,c)=>({s:String(s),f,z,c});
/* Ícones de contato (traço 1.5 em grade 24) */
const ICON={
  phone:'M7 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 2-2z',
  mail:'M5 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zM3.5 7.5l8.5 6 8.5-6',
  pin:'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11zM12 7.7a2.3 2.3 0 1 0 0 4.6a2.3 2.3 0 1 0 0-4.6z',
  globe:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z',
  user:'M12 4.4a3.6 3.6 0 1 0 0 7.2a3.6 3.6 0 1 0 0-7.2zM4.5 20c1.3-3.6 4.1-5.5 7.5-5.5s6.2 1.9 7.5 5.5',
  linkedin:'M6.5 3.5h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3zM8 10.5v6M8 7.5v.2M11.5 16.5v-6M11.5 13.2c0-1.7 1-2.7 2.4-2.7s2.1 1 2.1 2.7v3.3'
};
const icon=(k,x,y,size,color,sw)=>({t:'path',d:ICON[k],x,y,s:size/24,stroke:color,sw:sw||size*0.065});
/* Logo oficial a partir da geometria do Manual v3 */
function logo(o){
  const box=o.layout==='symbol'?B.SYM:[B.SYM[0],B.SYM[1],B.WRD[2],B.SYM[3]];
  const s=o.w/(box[2]-box[0]); const x=o.x-box[0]*s, y=o.y-box[1]*s; const out=[]; const mode=o.mode||'filled';
  if(mode==='merged') out.push({t:'path',d:B.GEO.merged,x,y,s,fill:o.sym});
  else if(mode==='trail') out.push({t:'path',d:B.GEO.merged,x,y,s,stroke:o.sym,sw:o.sw||.3});
  else{
    if(mode!=='nodes') B.GEO.bridges.forEach(d=>out.push({t:'path',d,x,y,s,fill:o.bridge||o.sym}));
    ['a','b','c','d'].forEach(k=>out.push({t:'path',d:B.GEO.nodes[k],x,y,s,fill:o.sym}));
  }
  if(o.layout!=='symbol') B.GEO.word.forEach(d=>out.push({t:'path',d,x,y,s,fill:o.word||o.sym}));
  return out;
}
logo.h=(w,layout)=>{const box=layout==='symbol'?B.SYM:[B.SYM[0],B.SYM[1],B.WRD[2],B.SYM[3]];return w*(box[3]-box[1])/(box[2]-box[0]);};
function appIcon(x,y,size){
  const items=[{t:'path',d:rr(0,0,size,size,size*23.43/256.31),x,y,s:1,fill:C.graphite}];
  const w=size*0.7556; const h=logo.h(w,'symbol');
  return items.concat(logo({layout:'symbol',x:x+(size-w)/2,y:y+(size-h)/2,w,sym:C.citrus,bridge:mix(C.citrus,C.graphite,.5)}));
}
/* Ajusta o corpo do texto para caber na largura */
function fit(runs,maxW,min){ const w=runs.reduce((a,r)=>a+measure(r.s,r.f,r.z),0); if(w<=maxW)return runs; const k=Math.max(min||.62,maxW/w); return runs.map(r=>Object.assign({},r,{z:+(r.z*k).toFixed(3)})); }
function nameRuns(size,c1,c2,f1,f2){const n=nameParts();const r=[run(n.first,f1||'sora-300',size,c1)];if(n.last)r.push(run(' '+n.last,f2||'sora-600',size,c2||c1));return r;}

/* ---------- SVG ---------- */
async function sceneSVG(sc,o){
  o=o||{}; const b=o.bleed||0; const W=sc.W,H=sc.H;
  const used=new Set(); let body='';
  const walk=items=>items.map(it=>{
    if(it.t==='clip'){ const id='c'+Math.random().toString(36).slice(2,8); return '<clipPath id="'+id+'"><rect x="'+it.x+'" y="'+it.y+'" width="'+it.w+'" height="'+it.h+'"/></clipPath><g clip-path="url(#'+id+')">'+walk(it.items)+'</g>'; }
    if(it.t==='path'){ const tr='translate('+(+it.x.toFixed(4))+' '+(+it.y.toFixed(4))+')'+(it.s!==1?' scale('+(+it.s.toFixed(6))+')':'');
      return '<path transform="'+tr+'" d="'+it.d+'" '+(it.stroke?'fill="none" stroke="'+it.stroke.hex+'" stroke-width="'+(+(it.sw/it.s).toFixed(4))+'" stroke-linecap="round" stroke-linejoin="round"':'fill="'+it.fill.hex+'"')+'/>'; }
    if(it.t==='text'){ it.runs.forEach(r=>used.add(r.f));
      return '<text x="'+it.x+'" y="'+it.y+'" text-anchor="'+it.anchor+'" xml:space="preserve">'+it.runs.map(r=>{const f=FONTS[r.f];return '<tspan font-family="'+f.fam+'" font-weight="'+f.w+'" font-size="'+r.z+'" fill="'+r.c.hex+'">'+esc(r.s)+'</tspan>';}).join('')+'</text>'; }
    return '';
  }).join('');
  body=walk(sc.items);
  let guides='';
  if(o.guides){ const u=sc.unit==='mm'?1:3; guides='<g pointer-events="none"><path d="M'+(-b)+' '+(-b)+'h'+(W+2*b)+'v'+(H+2*b)+'h'+(-(W+2*b))+'zM0 0v'+H+'h'+W+'v'+(-H)+'z" fill="#fff" fill-opacity=".55" fill-rule="evenodd"/>'+
    '<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="none" stroke="#E65717" stroke-width="'+(0.18*u)+'"/>'+
    '<rect x="'+(sc.safe||4)+'" y="'+(sc.safe||4)+'" width="'+(W-2*(sc.safe||4))+'" height="'+(H-2*(sc.safe||4))+'" fill="none" stroke="#2794A8" stroke-width="'+(0.18*u)+'" stroke-dasharray="'+(0.8*u)+' '+(0.6*u)+'"/></g>'; }
  const style=o.embedFonts?'<style>'+await fontFaceCSS(used)+'</style>':''; const bid='bl'+Math.random().toString(36).slice(2,8);
  const wh=o.size?' width="'+o.size[0]+'" height="'+o.size[1]+'"':'';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(-b)+' '+(-b)+' '+(W+2*b)+' '+(H+2*b)+'"'+wh+(o.title?' role="img" aria-label="'+esc(o.title)+'"':'')+'>'+style+'<defs><clipPath id="'+bid+'"><rect x="'+(-b)+'" y="'+(-b)+'" width="'+(W+2*b)+'" height="'+(H+2*b)+'"/></clipPath></defs><g clip-path="url(#'+bid+')">'+body+'</g>'+guides+'</svg>';
}
async function rasterize(svg,w,h,type,bg){
  const fo=svg.indexOf('<foreignObject')>-1;
  const url=fo?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg):URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try{
    const img=new Image(); img.decoding='sync';
    await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('Falha ao renderizar a imagem'));img.src=url;});
    const cv=document.createElement('canvas'); cv.width=Math.round(w); cv.height=Math.round(h);
    const ctx=cv.getContext('2d'); if(bg||type==='image/jpeg'){ctx.fillStyle=bg||'#fff';ctx.fillRect(0,0,cv.width,cv.height);}
    ctx.drawImage(img,0,0,cv.width,cv.height);
    return await new Promise(r=>cv.toBlob(r,type||'image/png',.95));
  } finally { if(!fo)URL.revokeObjectURL(url); }
}
async function sceneRaster(sc,type,bleed,scale){
  const b=bleed?3:0; const k=sc.unit==='mm'?DPI300:(scale||1);
  const svg=await sceneSVG(sc,{bleed:b,embedFonts:true});
  return rasterize(svg,(sc.W+2*b)*k,(sc.H+2*b)*k,type);
}

/* ---------- PDF (pdf-lib) ---------- */
async function buildPDF(pages,o){
  await needPdf(); const L=window.PDFLib;
  const doc=await L.PDFDocument.create({updateMetadata:true}); doc.registerFontkit(window.fontkit);
  const embedded={};
  async function font(k){ if(!embedded[k]){ const buf=await fetchBuf('assets/fonts/ttf/'+FONTS[k].file+'.ttf'); embedded[k]=await doc.embedFont(buf,{subset:true}); } return embedded[k]; }
  const col=c=>o.cmyk?L.cmyk(c.cmyk[0]/100,c.cmyk[1]/100,c.cmyk[2]/100,c.cmyk[3]/100):L.rgb(...hx(c.hex).map(v=>v/255));
  const MARGIN=o.marks?9:(o.bleed?3:0);
  for(const pg of pages){
    const cells=pg.cells; const PW=pg.W, PH=pg.H;
    const page=doc.addPage([PW*MM,PH*MM]);
    const Y=v=>(PH-v)*MM;
    for(const cell of cells){
      const sc=cell.scene, ox=cell.x, oy=cell.y, b=cell.bleed;
      page.pushOperators(L.pushGraphicsState(),L.rectangle((ox-b)*MM,Y(oy+sc.H+b),(sc.W+2*b)*MM,(sc.H+2*b)*MM),L.clip(),L.endPath());
      const draw=async items=>{ for(const it of items){
        if(it.t==='clip'){ page.pushOperators(L.pushGraphicsState(),L.rectangle((ox+it.x)*MM,Y(oy+it.y+it.h),it.w*MM,it.h*MM),L.clip(),L.endPath()); await draw(it.items); page.pushOperators(L.popGraphicsState()); continue; }
        if(it.t==='path'){ const opt={x:(ox+it.x)*MM,y:Y(oy+it.y),scale:it.s*MM};
          if(it.stroke){opt.borderColor=col(it.stroke);opt.borderWidth=it.sw/it.s;opt.borderLineCap=L.LineCapStyle.Round;}else opt.color=col(it.fill);
          page.drawSvgPath(it.d,opt); continue; }
        if(it.t==='text'){ const fs=await Promise.all(it.runs.map(r=>font(r.f)));
          const ws=it.runs.map((r,i)=>fs[i].widthOfTextAtSize(r.s,r.z*MM)/MM); const tw=ws.reduce((a,v)=>a+v,0);
          let x=it.x-(it.anchor==='end'?tw:it.anchor==='middle'?tw/2:0);
          it.runs.forEach((r,i)=>{ if(r.s) page.drawText(r.s,{x:(ox+x)*MM,y:Y(oy+it.y),size:r.z*MM,font:fs[i],color:col(r.c)}); x+=ws[i]; }); }
      }};
      await draw(sc.items);
      page.pushOperators(L.popGraphicsState());
    }
    if(o.marks) (pg.marks||[]).forEach(m=>page.drawLine({start:{x:m[0]*MM,y:Y(m[1])},end:{x:m[2]*MM,y:Y(m[3])},thickness:.25,color:col(C.reg)}));
    if(pg.trim){ const t=pg.trim; page.setTrimBox(t[0]*MM,Y(t[1]+t[3]),t[2]*MM,t[3]*MM); const bb=3; page.setBleedBox((t[0]-bb)*MM,Y(t[1]+t[3]+bb),(t[2]+2*bb)*MM,(t[3]+2*bb)*MM); }
  }
  doc.setTitle(o.title||'OPTIMATECH'); doc.setAuthor((P.nome||'')+' · OPTIMATECH'); doc.setCreator('OPTIMATECH Design System v7'); doc.setProducer('OPTIMATECH Design System v7 (pdf-lib)');
  const now=new Date(); doc.setCreationDate(now); doc.setModificationDate(now);
  if(o.pdfx){
    const {PDFName,PDFString,PDFHexString}=L; const ctx=doc.context;
    const info=doc.getInfoDict();
    info.set(PDFName.of('Trapped'),PDFName.of('False'));
    info.set(PDFName.of('GTS_PDFXVersion'),PDFString.of('PDF/X-1:2001'));
    info.set(PDFName.of('GTS_PDFXConformance'),PDFString.of('PDF/X-1a:2001'));
    const icc=new Uint8Array(await fetchBuf('assets/vendor/FOGRA39L_coated.icc'));
    const iccRef=ctx.register(ctx.flateStream(icc,{N:4}));
    const oi=ctx.obj({Type:'OutputIntent',S:'GTS_PDFX',OutputConditionIdentifier:PDFString.of('FOGRA39'),OutputCondition:PDFString.of('Offset commercial printing, coated paper (ISO 12647-2:2004)'),RegistryName:PDFString.of('http://www.color.org'),Info:PDFString.of('Coated FOGRA39 (ISO 12647-2:2004)'),DestOutputProfile:iccRef});
    doc.catalog.set(PDFName.of('OutputIntents'),ctx.obj([oi]));
    const id=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(v=>v.toString(16).padStart(2,'0')).join('');
    ctx.trailerInfo.ID=ctx.obj([PDFHexString.of(id),PDFHexString.of(id)]);
  }
  const bytes=await doc.save({useObjectStreams:false});
  if(o.pdfx){ const h='%PDF-1.3'; for(let i=0;i<h.length;i++) bytes[i]=h.charCodeAt(i); }
  return new Blob([bytes],{type:'application/pdf'});
}
function cropMarks(tx,ty,W,H){ const o=3,l=5; return [
  [tx-o-l,ty,tx-o,ty],[tx,ty-o-l,tx,ty-o],[tx+W+o,ty,tx+W+o+l,ty],[tx+W,ty-o-l,tx+W,ty-o],
  [tx-o-l,ty+H,tx-o,ty+H],[tx,ty+H+o,tx,ty+H+o+l],[tx+W+o,ty+H,tx+W+o+l,ty+H],[tx+W,ty+H+o,tx+W,ty+H+o+l]]; }
/* Uma cena por página, com sangria + marcas de corte */
function printPages(scenes){ const M=9; return scenes.map(sc=>({W:sc.W+2*M,H:sc.H+2*M,cells:[{scene:sc,x:M,y:M,bleed:3}],marks:cropMarks(M,M,sc.W,sc.H),trim:[M,M,sc.W,sc.H]})); }
function digitalPages(scenes,bleed){ const b=bleed?3:0; return scenes.map(sc=>({W:sc.W+2*b,H:sc.H+2*b,cells:[{scene:sc,x:b,y:b,bleed:b}]})); }
/* A4 com 10 cartões 90×50 (2 × 5), sangria entre cartões, marcas nas bordas */
function a4Pages(scenes){
  const W=90,H=50,b=3,cw=W+2*b,ch=H+2*b,cols=2,rows=5; const ox=(210-cols*cw)/2+b, oy=(297-rows*ch)/2+b;
  return scenes.map(sc=>{ const cells=[],marks=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push({scene:sc,x:ox+c*cw,y:oy+r*ch,bleed:b});
    const xs=[],ys=[]; for(let c=0;c<cols;c++){xs.push(ox+c*cw,ox+c*cw+W);} for(let r=0;r<rows;r++){ys.push(oy+r*ch,oy+r*ch+H);}
    const top=oy-b, bot=oy+rows*ch-b, left=ox-b, right=ox+cols*cw-b;
    xs.forEach(x=>{marks.push([x,top-1,x,top-6],[x,bot+1,x,bot+6]);}); ys.forEach(y=>{marks.push([left-1,y,left-6,y],[right+1,y,right+6,y]);});
    return {W:210,H:297,cells,marks};
  });
}

/* =========================================================================
   1 · ASSINATURA DE E-MAIL
   ========================================================================= */
const FONT_STACK="font-family:Sora,'Segoe UI',Helvetica,Arial,sans-serif;";
const SIG_IMG={
  logo:['sig-logo-graphite.png',150,31],
  tab:['sig-tab-graphite.png',214,84],
  blocks:['sig-blocks.png',84,78],
  logoSm:['sig-logo-graphite.png',104,21],
  sg:['sig-graphite-symbol.png',150,140],
  icUser:['ic-user-citrus.png',14,14],icPhone:['ic-phone-citrus.png',14,14],icMail:['ic-mail-citrus.png',14,14],icPin:['ic-pin-citrus.png',14,14],icGlobe:['ic-globe-citrus.png',14,14],icIn:['ic-linkedin-citrus.png',14,14]
};
let sigModel='classica', sigHost='hosted';
function img(key,base,embed){ const [f,w,h]=SIG_IMG[key]; const src=embed&&embed[f]?embed[f]:base+'assets/img/studio/'+f;
  return '<img src="'+src+'" width="'+w+'" height="'+h+'" alt="'+(key.startsWith('ic')?'':'OPTIMATECH')+'" style="display:block;border:0;outline:none;width:'+w+'px;height:'+h+'px;max-width:none;min-width:'+w+'px">'; }
function link(href,label,color){ return '<a href="'+esc(href)+'" style="color:'+color+';text-decoration:none">'+esc(label)+'</a>'; }
function contactRows(color,size,lh){
  const r=[]; const tels=[P.tel,P.cel].filter(s=>s&&s.trim());
  if(tels.length) r.push(tels.map(t=>link(telHref(t),t,color)).join(' &nbsp;·&nbsp; '));
  if(P.email) r.push(link('mailto:'+P.email,P.email,color));
  const extra=[]; if(P.site) extra.push(link(siteURL(P.site),P.site.replace(/^https?:\/\//,''),color)); if(P.linkedin) extra.push(link(siteURL(P.linkedin),'LinkedIn',color));
  if(extra.length) r.push(extra.join(' &nbsp;·&nbsp; '));
  if(P.endereco) r.push(addrParts().map(esc).join('<br>'));
  return r.map(x=>'<div style="'+FONT_STACK+'font-size:'+size+'px;line-height:'+lh+'px;color:'+color+';white-space:nowrap">'+x+'</div>').join('');
}
function nameHTML(size,c1,c2){ const n=nameParts(); return '<div style="'+FONT_STACK+'font-size:'+size+'px;line-height:1.25;color:'+c2+';white-space:nowrap"><span style="font-weight:300;color:'+c1+'">'+esc(n.first)+'</span>'+(n.last?' <span style="font-weight:600;color:'+c2+'">'+esc(n.last)+'</span>':'')+'</div>'; }
function cargoHTML(color,size){ return '<div style="'+FONT_STACK+'font-size:'+size+'px;line-height:1.5;color:'+color+';letter-spacing:.02em;padding-top:2px;white-space:nowrap">'+esc(cargoLine())+' &nbsp;|&nbsp; OPTIMATECH</div>'; }
const TBL='cellpadding="0" cellspacing="0" border="0" role="presentation"';
function sigHTML(model,base,embed){
  if(model==='classica') return '<table '+TBL+' style="border:1px solid #C9C8C4;border-radius:14px;border-collapse:separate;background:#ffffff"><tr>'+
    '<td valign="middle" style="padding:20px 24px">'+img('logo',base,embed)+'</td>'+
    '<td valign="middle" style="padding:16px 0"><table '+TBL+'><tr><td style="width:1px;height:82px;background:#D6D5D2;font-size:0;line-height:0">&nbsp;</td></tr></table></td>'+
    '<td valign="middle" style="padding:16px 26px 16px 24px">'+nameHTML(18,'#6B6C6C','#333333')+cargoHTML('#333333',12)+'<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>'+contactRows('#4A4A48',11,17)+'</td></tr></table>';
  if(model==='abas') return '<table '+TBL+' style="border-collapse:separate"><tr>'+
    '<td valign="bottom" style="padding:0;line-height:0">'+img('tab',base,embed)+'</td>'+
    '<td valign="bottom" style="padding:20px 34px 16px 30px;background:#908F8F;border-radius:72px 72px 0 0">'+nameHTML(18,'#F1F0F1','#FFFFFF')+cargoHTML('#FFFFFF',12)+'<div style="height:8px;line-height:8px;font-size:0">&nbsp;</div>'+contactRows('#FFFFFF',10.5,16)+'</td></tr></table>';
  if(model==='blocos') return '<table '+TBL+'><tr>'+
    '<td valign="middle" style="padding:0 16px 0 0">'+img('blocks',base,embed)+'</td>'+
    '<td valign="middle" style="padding:0 22px 0 0">'+nameHTML(18,'#6B6C6C','#333333')+cargoHTML('#333333',12)+'</td>'+
    '<td valign="middle" style="padding:0 18px;border-left:1px solid #D6D5D2">'+contactRows('#4A4A48',10.5,17)+'</td>'+
    '<td valign="middle" style="padding:0 0 0 18px;border-left:1px solid #D6D5D2">'+img('logoSm',base,embed)+'</td></tr></table>';
  /* graphite */
  const row=(ic,html)=>'<tr><td valign="middle" style="padding:3px 9px 3px 0;width:14px">'+img(ic,base,embed)+'</td><td valign="middle" style="'+FONT_STACK+'font-size:11px;line-height:16px;color:#E6E617;padding:3px 0;white-space:nowrap">'+html+'</td></tr>';
  const tels=[P.tel,P.cel].filter(s=>s&&s.trim());
  return '<table '+TBL+' style="background:#333333;border-radius:18px;border-collapse:separate"><tr>'+
    '<td valign="middle" style="padding:22px 18px 20px 26px"><table '+TBL+'>'+
      '<tr><td valign="middle" style="padding:0 9px 0 0;width:14px">'+img('icUser',base,embed)+'</td><td>'+nameHTML(18,'#E6E617','#E6E617')+'</td></tr>'+
      '<tr><td></td><td style="padding:0 0 10px">'+cargoHTML('#E6E617',12)+'</td></tr>'+
      (tels.length?row('icPhone',tels.map(t=>link(telHref(t),t,'#E6E617')).join(' &nbsp;·&nbsp; ')):'')+
      (P.email?row('icMail',link('mailto:'+P.email,P.email,'#E6E617')):'')+
      (P.site?row('icGlobe',link(siteURL(P.site),P.site.replace(/^https?:\/\//,''),'#E6E617')+(P.linkedin?' &nbsp;·&nbsp; '+link(siteURL(P.linkedin),'LinkedIn','#E6E617'):'')):'')+
      (P.endereco?row('icPin',addrParts().map(esc).join('<br>')):'')+
    '</table></td><td valign="bottom" style="padding:0;line-height:0;border-radius:0 18px 18px 0">'+img('sg',base,embed)+'</td></tr></table>';
}
function sigPlain(){ return [P.nome,cargoLine()+' | OPTIMATECH',[P.tel,P.cel].filter(Boolean).join(' · '),P.email,P.site,P.endereco].filter(Boolean).join('\n'); }
async function sigEmbedMap(){ const out={}; await Promise.all(Object.values(SIG_IMG).map(async([f])=>{ if(out[f])return; const buf=await fetchBuf('assets/img/studio/'+f); out[f]='data:image/png;base64,'+b64(buf); })); return out; }
async function sigPNG(){
  const embed=await sigEmbedMap(); const html=sigHTML(sigModel,'',embed);
  const probe=document.createElement('div'); probe.style.cssText='position:absolute;left:-9999px;top:0;display:inline-block'; probe.innerHTML=html; document.body.appendChild(probe);
  const r=probe.firstElementChild.getBoundingClientRect(); const w=Math.ceil(r.width)+2,h=Math.ceil(r.height)+2; probe.remove();
  const css=await fontFaceCSS(['sora-300','sora-400','sora-600']);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block"><style>'+css+'</style>'+html.replace(/<br>/g,'<br/>').replace(/(<img[^>]*?)>/g,'$1/>').replace(/&nbsp;/g,'&#160;')+'</div></foreignObject></svg>';
  return rasterize(svg,w*2,h*2,'image/png');
}
async function sigCopy(){
  const embed=sigHost==='embed'?await sigEmbedMap():null;
  const html=sigHTML(sigModel,embed?'':SITE_BASE,embed);
  try{
    if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){
      await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([sigPlain()],{type:'text/plain'})})]);
    } else throw new Error('sem ClipboardItem');
  }catch(e){
    const box=document.createElement('div'); box.contentEditable='true'; box.style.cssText='position:fixed;left:-9999px;top:0'; box.innerHTML=html; document.body.appendChild(box);
    const range=document.createRange(); range.selectNodeContents(box); const sel=getSelection(); sel.removeAllRanges(); sel.addRange(range); document.execCommand('copy'); sel.removeAllRanges(); box.remove();
  }
  sh().toast('Assinatura copiada. Cole nas configurações do seu e-mail.');
}
async function sigDownloadHTML(){
  const embed=sigHost==='embed'?await sigEmbedMap():null;
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Assinatura · '+esc(P.nome)+' · OPTIMATECH</title></head><body style="margin:24px;background:#ffffff">\n<!-- Assinatura OPTIMATECH · gerada pelo Design System v7 -->\n'+sigHTML(sigModel,embed?'':SITE_BASE,embed)+'\n</body></html>';
  sh().download('assinatura-'+slug()+'.html',html,'text/html');
}
function renderSig(){
  const pv=document.getElementById('sigPreview'); if(!pv)return;
  pv.innerHTML=sigHTML(sigModel,'',null);
  const t=pv.firstElementChild; requestAnimationFrame(()=>{ t.style.zoom=''; const k=Math.min(1,(pv.clientWidth-2)/t.scrollWidth); if(k<1)t.style.zoom=k.toFixed(3); });
  document.querySelectorAll('#sigModels button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===sigModel));
  const note=document.getElementById('sigHostNote');
  if(note) note.textContent=sigHost==='hosted'?'As imagens da marca carregam de '+SITE_BASE.replace(/^https?:\/\//,'').replace(/\/$/,'')+'. Funciona no Gmail, Outlook e Apple Mail depois que o site estiver publicado.':'As imagens vão embutidas no código. Use no Outlook para desktop e no Apple Mail; o Gmail não aceita imagens embutidas em assinaturas.';
}

/* =========================================================================
   2 · CARTÃO DE VISITA (90 × 50 mm)
   ========================================================================= */
const CARD={W:90,H:50,unit:'mm',safe:4};
const CARD_MODELS={graphite:'Graphite',branco:'Branco essencial',citrus:'Citrus'};
let cardModel='graphite', cardFace='frente', cardGuides=false, cardBleed=true;
function contactBlock(x,y,maxW,txt,ic,step,size){
  const it=[]; const tels=[P.tel,P.cel].filter(s=>s&&s.trim()); let yy=y;
  const line=(k,s)=>{ if(ic) it.push(icon(k,x,yy-size*1.05,size*1.45,ic)); it.push(text(x+(ic?size*2.05:0),yy,fit([run(s,'sora-300',size,txt)],maxW-(ic?size*2.05:0)))); yy+=step; };
  if(tels.length) line('phone',tels.join('  ·  '));
  if(P.email) line('mail',P.email);
  if(P.site||P.linkedin) line('globe',[P.site,P.linkedin?P.linkedin.replace(/^https?:\/\/(www\.)?/,''):''].filter(Boolean).join('  ·  '));
  const a=addrParts(); if(a.length){ line('pin',a[0]); if(a[1]){ it.push(text(x+(ic?size*2.05:0),yy-step*0.25,fit([run(a[1],'sora-300',size,txt)],maxW-(ic?size*2.05:0)))); } }
  return it;
}
function cardScene(model,face){
  const W=90,H=50,b=3; const bg=(c)=>rect(-b,-b,W+2*b,H+2*b,c); let items=[];
  if(model==='graphite'){
    if(face==='frente'){ const lw=52,lh=logo.h(lw); items=[bg(C.graphite)].concat(logo({x:(W-lw)/2,y:(H-lh)/2-1.5,w:lw,sym:C.citrus,word:C.white,bridge:mix(C.citrus,C.graphite,.5)}),[text(W/2,H-6.2,[run(P.site||'optimatech.com.br','sora-300',2.1,C.gray)],'middle')]); }
    else{ items=[bg(C.graphite)].concat(logo({layout:'symbol',mode:'merged',x:53,y:21,w:72,sym:C.citrus}),
      [text(6,12.5,fit(nameRuns(4.3,C.white,C.white),44)),text(6,17.6,fit([run(cargoLine()+'  |  OPTIMATECH','sora-400',2.25,C.citrus)],44))],
      contactBlock(6,27.5,46,C.white,C.citrus,4.4,2.05)); }
  } else if(model==='branco'){
    if(face==='frente'){ const lw=40,lh=logo.h(lw); items=[bg(C.white)].concat(logo({layout:'symbol',mode:'trail',x:31,y:13,w:80,sym:mix(C.gray,C.white,.55),sw:.3}),logo({x:6,y:6.5,w:lw,sym:C.graphite,word:C.graphite,bridge:mix(C.graphite,C.white,.72)}),[text(6,H-6,[run(P.site||'optimatech.com.br','sora-300',2.1,C.iron)])]); }
    else{ items=[bg(C.white),{t:'path',d:rr(0,0,80,10,3),x:-6,y:44.6,s:1,fill:C.citrus},rect(-b,48.2,W+2*b,H+b-48.2+3,C.graphite)].concat(
      logo({layout:'symbol',x:W-6-11,y:6,w:11,sym:C.graphite,bridge:mix(C.graphite,C.white,.72)}),
      [text(6,12.5,fit(nameRuns(4.3,C.iron,C.gtext),62)),text(6,17.6,fit([run(cargoLine()+'  |  OPTIMATECH','sora-400',2.25,C.gtext)],62))],
      contactBlock(6,26.5,76,C.gtext,C.iron,4.2,2.05)); }
  } else {
    if(face==='frente'){ const lw=54,lh=logo.h(lw); items=[bg(C.citrus)].concat(logo({x:(W-lw)/2,y:(H-lh)/2,w:lw,sym:C.graphite,word:C.graphite})); }
    else{ items=[bg(C.white)].concat(logo({layout:'symbol',mode:'nodes',x:58,y:5.5,w:27,sym:C.citrus}),
      [text(6,12.5,fit(nameRuns(4.3,C.iron,C.gtext),50)),text(6,17.6,fit([run(cargoLine()+'  |  OPTIMATECH','sora-400',2.25,C.gtext)],50))],
      contactBlock(6,27.5,78,C.gtext,C.iron,4.2,2.05)); }
  }
  return Object.assign({},CARD,{items});
}
async function renderCard(){
  const f=document.getElementById('cardFront'), bk=document.getElementById('cardBack'); if(!f)return;
  const b=cardGuides?3:0;
  f.innerHTML=await sceneSVG(cardScene(cardModel,'frente'),{bleed:b,guides:cardGuides,title:'Frente do cartão'});
  bk.innerHTML=await sceneSVG(cardScene(cardModel,'verso'),{bleed:b,guides:cardGuides,title:'Verso do cartão'});
  document.getElementById('cardFlip').classList.toggle('is-back',cardFace==='verso');
  document.querySelectorAll('#cardModels button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.m===cardModel));
  document.querySelectorAll('#cardFaces button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.f===cardFace));
}
async function busy(btn,fn){ if(btn){btn.disabled=true;btn.dataset.l=btn.textContent;btn.textContent='Gerando…';}
  try{ await fn(); }catch(e){ console.error(e); sh().toast('Não foi possível exportar: '+e.message); } finally{ if(btn){btn.disabled=false;btn.textContent=btn.dataset.l;} } }
const cardScenes=()=>[cardScene(cardModel,'frente'),cardScene(cardModel,'verso')];
const cardExports={
  png:async()=>{ const [a,v]=cardScenes(); sh().download('cartao-'+slug()+'-frente.png',await sceneRaster(a,'image/png',cardBleed)); await new Promise(r=>setTimeout(r,350)); sh().download('cartao-'+slug()+'-verso.png',await sceneRaster(v,'image/png',cardBleed)); sh().toast('PNG 300 dpi da frente e do verso baixados'); },
  jpg:async()=>{ const [a,v]=cardScenes(); sh().download('cartao-'+slug()+'-frente.jpg',await sceneRaster(a,'image/jpeg',cardBleed)); await new Promise(r=>setTimeout(r,350)); sh().download('cartao-'+slug()+'-verso.jpg',await sceneRaster(v,'image/jpeg',cardBleed)); sh().toast('JPG 300 dpi da frente e do verso baixados'); },
  pdf:async()=>{ sh().download('cartao-'+slug()+'-digital.pdf',await buildPDF(digitalPages(cardScenes(),cardBleed),{title:'Cartão de visita · '+P.nome})); sh().toast('PDF digital baixado'); },
  print:async()=>{ sh().download('cartao-'+slug()+'-grafica-PDFX1a.pdf',await buildPDF(printPages(cardScenes()),{cmyk:true,marks:true,pdfx:true,title:'Cartão de visita · '+P.nome})); sh().toast('PDF para gráfica baixado'); },
  a4:async()=>{ sh().download('cartao-'+slug()+'-A4-10un-PDFX1a.pdf',await buildPDF(a4Pages(cardScenes()),{cmyk:true,marks:true,pdfx:true,title:'Cartões de visita A4 · '+P.nome})); sh().toast('Folha A4 com 10 cartões baixada'); }
};

/* =========================================================================
   3 · CARTÃO QR (vCard)
   ========================================================================= */
let qrLayout='cartao', qrContent='vcard', qrLogo=true;
function vEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/([,;])/g,'\\$1');}
function vcard(full){
  const n=nameParts(); const L=['BEGIN:VCARD','VERSION:3.0','N:'+vEsc(n.last)+';'+vEsc(n.first)+';;;','FN:'+vEsc(P.nome),'ORG:OPTIMATECH'+(P.area?';'+vEsc(P.area):''),'TITLE:'+vEsc(P.cargo)];
  if(P.tel) L.push('TEL;TYPE=WORK:'+P.tel.replace(/[^\d+]/g,''));
  if(P.cel) L.push('TEL;TYPE=CELL:'+P.cel.replace(/[^\d+]/g,''));
  if(P.email) L.push('EMAIL;TYPE=WORK:'+P.email.trim());
  if(P.site) L.push('URL:'+siteURL(P.site));
  if(P.linkedin) L.push((full?'URL;TYPE=LinkedIn:':'URL:')+siteURL(P.linkedin));
  if(full&&P.endereco) L.push('ADR;TYPE=WORK:;;'+vEsc(P.endereco.replace(/\s·\s/g,', '))+';;;;Brasil');
  L.push('END:VCARD'); return L.join('\r\n');
}
function qrPayload(){ if(qrContent==='site')return siteURL(P.site||'optimatech.com.br'); if(qrContent==='linkedin'&&P.linkedin)return siteURL(P.linkedin); return vcard(false); }
function qrMatrix(){ const q=window.qrcode; q.stringToBytes=q.stringToBytesFuncs['UTF-8']; const data=qrPayload(); const m=q(qrLogo&&data.length<120?4:0,qrLogo?(data.length<120?'H':'Q'):'M'); m.addData(data,'Byte'); m.make(); const n=m.getModuleCount(); return {n,dark:(r,c)=>m.isDark(r,c)}; }
/* QR com módulos arredondados (nós da marca). Olhos sólidos, zona de silêncio de 4 módulos. */
function qrItems(M,x,y,size,ink){
  const n=M.n, total=n+8, u=size/total, ox=x+4*u, oy=y+4*u; const items=[rect(x,y,size,size,C.white)];
  const L=qrLogo?Math.round(n*0.2)|1:0, c0=(n-L)/2; const inLogo=(r,c)=>L&&r>=c0-0.5&&r<c0+L-0.5&&c>=c0-0.5&&c<c0+L-0.5;
  const finder=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
  let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){ if(!M.dark(r,c)||finder(r,c)||inLogo(r,c))continue; d+=rr(c+0.06,r+0.06,0.88,0.88,0.3); }
  [[0,0],[0,n-7],[n-7,0]].forEach(([r,c])=>{ d+=rr(c,r,7,7,2.2)+rr(c+1,r+1,5,5,1.5,true)+rr(c+2,r+2,3,3,0.95); });
  items.push({t:'path',d,x:ox,y:oy,s:u,fill:ink||C.gtext});
  if(L){ const ls=(L-1)*u; const lx=ox+(c0+0.5)*u, ly=oy+(c0+0.5)*u; items.push(...appIcon(lx,ly,ls)); }
  return items;
}
function qrScene(layout,M){
  const hint='Aponte a câmera para salvar o contato'; const hint2=qrContent==='vcard'?hint:'Aponte a câmera para abrir o link';
  if(layout==='cartao'){ const b=3, q=40; let it=[rect(-b,-b,96,56,C.white)].concat(qrItems(M,4,5,q),
      [text(48,15,fit(nameRuns(3.9,C.iron,C.gtext),37)),text(48,20.2,fit([run(cargoLine(),'sora-400',2.2,C.gtext)],37)),
       {t:'path',d:rr(0,0,2.2,2.2,0.77),x:48,y:27.4,s:1,fill:C.citrus},text(51.4,29.3,fit([run(hint2,'sora-300',1.8,C.iron)],34))],
      logo({x:48,y:50-6-logo.h(30),w:30,sym:C.graphite,word:C.graphite,bridge:mix(C.graphite,C.white,.72)}));
    return {W:90,H:50,unit:'mm',safe:4,items:it}; }
  if(layout==='cracha'){ const W=54,H=86,b=3,q=36; const lw=34,lh=logo.h(lw);
    let it=[rect(-b,-b,W+2*b,H+2*b,C.white),rect(-b,-b,W+2*b,22+b,C.graphite)].concat(logo({x:(W-lw)/2,y:(22-lh)/2+0.5,w:lw,sym:C.citrus,word:C.white,bridge:mix(C.citrus,C.graphite,.5)}),
      [text(W/2,31.5,fit(nameRuns(4.1,C.iron,C.gtext),46),'middle'),text(W/2,36.6,fit([run(cargoLine(),'sora-400',2.3,C.gtext)],46),'middle')],
      qrItems(M,(W-q)/2,40.5,q),[text(W/2,81.2,fit([run(P.site||'optimatech.com.br','sora-300',2,C.iron)],46),'middle')]);
    return {W,H,unit:'mm',safe:4,items:it}; }
  if(layout==='social'){ const W=1080,H=1080,q=560; const lw=300,lh=logo.h(lw);
    let it=[rect(0,0,W,H,C.graphite)].concat(logo({layout:'symbol',mode:'trail',x:790,y:40,w:520,sym:mix(C.citrus,C.graphite,.35),sw:3}),
      logo({x:(W-lw)/2,y:70,w:lw,sym:C.citrus,word:C.white,bridge:mix(C.citrus,C.graphite,.5)}),
      [{t:'path',d:rr(0,0,q+40,q+40,44),x:(W-q-40)/2,y:170,s:1,fill:C.white}],qrItems(M,(W-q)/2,190,q),
      [text(W/2,875,fit(nameRuns(58,C.ice,C.white),900),'middle'),text(W/2,930,fit([run(cargoLine()+'  |  OPTIMATECH','sora-400',28,C.citrus)],900),'middle'),text(W/2,995,[run(hint2,'sora-300',24,C.gray)],'middle')]);
    return {W,H,unit:'px',safe:60,items:it}; }
  /* cartão digital para celular 1080×1920 */
  const W=1080,H=1920,q=640; const lw=380;
  let it=[rect(0,0,W,H,C.graphite)].concat(logo({layout:'symbol',mode:'merged',x:420,y:1430,w:900,sym:C.citrus}),
    logo({x:(W-lw)/2,y:210,w:lw,sym:C.citrus,word:C.white,bridge:mix(C.citrus,C.graphite,.5)}),
    [{t:'path',d:rr(0,0,q+48,q+48,52),x:(W-q-48)/2,y:446,s:1,fill:C.white}],qrItems(M,(W-q)/2,470,q),
    [text(W/2,1270,fit(nameRuns(66,C.ice,C.white),940),'middle'),text(W/2,1336,fit([run(cargoLine()+'  |  OPTIMATECH','sora-400',32,C.citrus)],940),'middle'),text(W/2,1404,[run(hint2,'sora-300',28,C.gray)],'middle')]);
  return {W,H,unit:'px',safe:80,items:it};
}
async function currentQR(){ await needQR(); return qrScene(qrLayout,qrMatrix()); }
async function renderQR(){
  const pv=document.getElementById('qrPreview'); if(!pv)return;
  try{ await needQR(); const M=qrMatrix(); const sc=qrScene(qrLayout,M); pv.innerHTML=await sceneSVG(sc,{title:'Prévia do cartão QR'}); pv.dataset.layout=qrLayout;
    const qmm={cartao:40,cracha:36}[qrLayout]; const mod=qmm?qmm/(M.n+8):0; const w=document.getElementById('qrDensity');
    if(w){ w.hidden=!(mod&&mod<0.5); w.textContent=mod?'Cada módulo do QR terá '+mod.toFixed(2).replace('.',',')+' mm impresso. Abaixo de 0,5 mm a leitura fica difícil: para impressão, escolha “Site” ou deixe celular e LinkedIn em branco.':''; } }
  catch(e){ pv.innerHTML='<p class="st-err">Os dados ficaram longos demais para um QR legível. Encurte o endereço ou escolha “Site” como conteúdo.</p>'; console.warn(e); }
  document.querySelectorAll('#qrLayouts button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.l===qrLayout));
  document.querySelectorAll('#qrContents button').forEach(x=>{x.setAttribute('aria-pressed',x.dataset.c===qrContent);if(x.dataset.c==='linkedin')x.disabled=!P.linkedin;});
  if(qrContent==='linkedin'&&!P.linkedin){qrContent='vcard';return renderQR();}
  const isPrint=qrLayout==='cartao'||qrLayout==='cracha'; document.getElementById('qrPrint').hidden=!isPrint;
  const lg=document.getElementById('qrLogo'); if(lg)lg.checked=qrLogo;
}
const qrExports={
  svg:async()=>{ const sc=await currentQR(); const svg=await sceneSVG(sc,{embedFonts:true,size:sc.unit==='mm'?[sc.W+'mm',sc.H+'mm']:[sc.W,sc.H]}); sh().download('qr-'+qrLayout+'-'+slug()+'.svg',svg,'image/svg+xml'); sh().toast('SVG baixado'); },
  png:async()=>{ const sc=await currentQR(); sh().download('qr-'+qrLayout+'-'+slug()+'.png',await sceneRaster(sc,'image/png',false)); sh().toast('PNG baixado'); },
  pdf:async()=>{ const sc=await currentQR(); const scenes=qrLayout==='cartao'?[sc,cardScene('graphite','frente')]:[sc];
    sh().download('qr-'+qrLayout+'-'+slug()+'-grafica-PDFX1a.pdf',await buildPDF(printPages(scenes),{cmyk:true,marks:true,pdfx:true,title:'Cartão QR · '+P.nome})); sh().toast('PDF para gráfica baixado'); },
  vcf:async()=>{ sh().download(slug()+'.vcf',vcard(true),'text/vcard;charset=utf-8'); sh().toast('Contato (.vcf) baixado'); }
};

/* =========================================================================
   Roteador e montagem
   ========================================================================= */
const PAGES=['assinatura','cartao','qr'];
function route(){ const h=(location.hash||'#assinatura').slice(1); const id=PAGES.includes(h)?h:'assinatura';
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('is-active',p.id==='p-'+id));
  syncForms(); render(id); window.scrollTo(0,0); if(window.OTShell)OTShell.markCurrent(); }
function render(id){ id=id||(location.hash||'#assinatura').slice(1); if(id==='cartao')renderCard(); else if(id==='qr')renderQR(); else renderSig(); }
function seg(id,attr,cb){ const el=document.getElementById(id); el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;cb(b.dataset[attr]);}); }
function init(){
  document.getElementById('formSig').outerHTML=formHTML('formSig');
  document.getElementById('formCard').outerHTML=formHTML('formCard');
  document.getElementById('formQR').outerHTML=formHTML('formQR');
  bindForm(document.getElementById('formSig'),renderSig); bindForm(document.getElementById('formCard'),renderCard); bindForm(document.getElementById('formQR'),renderQR);
  seg('sigModels','m',m=>{sigModel=m;renderSig();});
  seg('sigHost','h',h=>{sigHost=h;document.querySelectorAll('#sigHost button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.h===h));renderSig();});
  seg('cardModels','m',m=>{cardModel=m;renderCard();});
  seg('cardFaces','f',f=>{cardFace=f;renderCard();});
  document.getElementById('cardFlip').addEventListener('click',()=>{cardFace=cardFace==='frente'?'verso':'frente';renderCard();});
  document.getElementById('cardFlip').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cardFace=cardFace==='frente'?'verso':'frente';renderCard();}});
  document.getElementById('cardGuides').addEventListener('change',e=>{cardGuides=e.target.checked;renderCard();});
  document.getElementById('cardBleed').addEventListener('change',e=>{cardBleed=e.target.checked;});
  seg('qrLayouts','l',l=>{qrLayout=l;renderQR();});
  seg('qrContents','c',c=>{qrContent=c;renderQR();});
  document.getElementById('qrLogo').addEventListener('change',e=>{qrLogo=e.target.checked;renderQR();});
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-x]'); if(!b)return; const [tool,k]=b.dataset.x.split(':');
    if(tool==='sig'){ if(k==='copy')busy(b,sigCopy); if(k==='html')busy(b,sigDownloadHTML); if(k==='png')busy(b,async()=>{sh().download('assinatura-'+slug()+'@2x.png',await sigPNG());sh().toast('PNG @2x baixado');}); }
    if(tool==='card')busy(b,cardExports[k]); if(tool==='qr')busy(b,qrExports[k]); });
  document.querySelectorAll('.st-tabs').forEach(t=>t.addEventListener('click',e=>{const b=e.target.closest('[role=tab]');if(!b)return;t.querySelectorAll('[role=tab]').forEach(x=>x.setAttribute('aria-selected',x===b));t.parentElement.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p.id!==b.getAttribute('aria-controls'));}));
  window.addEventListener('hashchange',route); let rz; window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if((location.hash||'#assinatura')==='#assinatura')renderSig();},150);});
  fontsReady().then(route); route();
}
/* API para o build das imagens estáticas da assinatura e para testes */
window.OTStudio={SITE_BASE,C,mix,cardScene,qrScene,sceneSVG,buildPDF,printPages,a4Pages,vcard,qrPayload:()=>qrPayload(),qrMatrix:()=>needQR().then(qrMatrix),logo,appIcon,ICON,
  get P(){return P;}, setPerson(o){Object.assign(P,o);save();syncForms();render();},
  setState(o){ if(o.sigModel)sigModel=o.sigModel; if(o.cardModel)cardModel=o.cardModel; if(o.cardFace)cardFace=o.cardFace; if(o.qrLayout)qrLayout=o.qrLayout; if(o.qrContent)qrContent=o.qrContent; if('qrLogo' in o)qrLogo=o.qrLogo; render(); }};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
