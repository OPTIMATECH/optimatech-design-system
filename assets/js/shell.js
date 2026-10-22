/* OPTIMATECH DS v7 · shell compartilhado (menu lateral, busca, toast, copiar) */
(function(){
'use strict';
const VERSION='7.0';
const NAV=[
  {group:'Fundamentos',items:[
    ['inicio','Visão geral'],['marca','A marca'],['logotipo','Logotipo'],['cores','Cores'],['tipografia','Tipografia'],['grid','Grid e espaço']]},
  {group:'Linguagem',items:[
    ['elementos','Elementos gráficos'],['iconografia','Iconografia'],['fotografia','Fotografia'],['movimento','Movimento'],['voz','Voz e tom']]},
  {group:'Sistema',items:[
    ['componentes','Componentes'],['tokens','Tokens'],['aplicacoes','Aplicações']]},
  {group:'Papelaria',items:[
    ['studio:assinatura','Assinatura de e-mail','Studio'],['studio:cartao','Cartão de visita','Studio'],['studio:qr','Cartão QR','Studio'],['papelaria','Papel timbrado'],['downloads','Downloads']]}
];
const SEARCH_EXTRA={ /* termos extras para a busca */
  cores:'paleta citrus graphite cmyk pantone hex rgb contraste',tipografia:'exo sora fonte escala fibonacci',logotipo:'logo símbolo assinatura área de proteção favicon',
  iconografia:'ícones icones svg',elementos:'texturas padrões pattern supergráfico trilha linhas gradiente',downloads:'baixar zip pacote',
  'studio:assinatura':'email outlook gmail','studio:cartao':'cartão de visita impressão gráfica pdf x-1a','studio:qr':'qrcode vcard','papelaria':'word docx timbrado carta'
};
const isStudio=/studio\.html$/.test(location.pathname);
function href(id){ if(id.startsWith('studio:')) return (isStudio?'':'studio.html')+'#'+id.split(':')[1]; return (isStudio?'index.html':'')+'#'+id; }
function currentId(){ const h=(location.hash||'').slice(1)||(isStudio?'assinatura':'inicio'); return isStudio?'studio:'+h:h.split('/')[0]; }

function buildRail(){
  const rail=document.querySelector('.rail'); if(!rail) return;
  const logo=window.OTBrand?OTBrand.svg({sym:'#E6E617',word:'#FFFFFF',bridge:'tint',title:'OPTIMATECH'}):'OPTIMATECH';
  rail.innerHTML=
   '<a class="rail__brand" href="'+(isStudio?'index.html':'')+'#inicio">'+logo+'<div class="rail__ver">Design System <b>v'+VERSION+'</b></div></a>'+
   '<div class="rail__search"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg><input id="navSearch" type="search" placeholder="Buscar no sistema" aria-label="Buscar no Design System"><kbd>/</kbd></div>'+
   '<nav aria-label="Seções do Design System">'+NAV.map(g=>'<div class="rail__group"><span>'+g.group+'</span>'+g.items.map(([id,label,tag])=>
      '<a class="nav" data-id="'+id+'" data-q="'+(label+' '+(SEARCH_EXTRA[id]||'')).toLowerCase()+'" href="'+href(id)+'">'+label+(tag?'<span class="tag">'+tag+'</span>':'')+'</a>').join('')+'</div>').join('')+'</nav>'+
   '<div class="rail__foot">Baseado no Manual de Marca v3.<br>Dúvidas de aplicação: <a href="mailto:marketing@optimatech.com.br">marketing@optimatech.com.br</a></div>';
  const q=rail.querySelector('#navSearch');
  q.addEventListener('input',()=>{const v=q.value.trim().toLowerCase();rail.querySelectorAll('a.nav').forEach(a=>a.style.display=!v||a.dataset.q.includes(v)?'':'none');rail.querySelectorAll('.rail__group').forEach(g=>g.style.display=[...g.querySelectorAll('a.nav')].some(a=>a.style.display!=='none')?'':'none');});
  q.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=[...rail.querySelectorAll('a.nav')].find(a=>a.style.display!=='none');if(a){location.href=a.getAttribute('href');q.value='';q.dispatchEvent(new Event('input'));q.blur();}}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();q.focus();}});
  rail.addEventListener('click',e=>{if(e.target.closest('a'))document.body.classList.remove('nav-open');});
  markCurrent();
}
function markCurrent(){ const id=currentId(); document.querySelectorAll('.rail a.nav').forEach(a=>a.setAttribute('aria-current',a.dataset.id===id?'page':'false')); }
function buildTopbar(){
  const t=document.querySelector('.topbar'); if(!t) return;
  t.innerHTML='<button aria-label="Abrir menu" id="navToggle"><svg width="22" height="22" viewBox="0 0 22 22" stroke="currentColor" stroke-width="1.8"><path d="M3 6h16M3 11h16M3 16h10"/></svg></button>'+(window.OTBrand?OTBrand.svg({sym:'#E6E617',word:'#fff',bridge:'tint'}).replace('<svg','<svg class="logo"'):'');
  t.querySelector('#navToggle').onclick=()=>document.body.classList.toggle('nav-open');
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('nav-open');});
}
let toastEl,toastT;
function toast(msg){ if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl);} toastEl.innerHTML='<i></i>'+msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),1900); }
async function copy(text,label){ try{await navigator.clipboard.writeText(text);}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();} toast((label||'Copiado')+': <b>'+String(text).slice(0,40)+'</b>'); }
function download(name,data,type){ const blob=data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500); }
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]'); if(c){e.preventDefault();copy(c.dataset.copy,c.dataset.copyLabel);}});
window.addEventListener('hashchange',markCurrent);
window.OTShell={NAV,VERSION,toast,copy,download,markCurrent,isStudio};
document.addEventListener('DOMContentLoaded',()=>{buildRail();buildTopbar();});
})();
