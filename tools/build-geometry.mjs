/* OPTIMATECH · construção matemática do símbolo (v7.1)
   Regra: 4 nós = quadrados de canto circular (raio = 35,05% do lado), nas posições e
   medidas do registro do Manual v3. 6 concordâncias = quartos de elipse tangentes aos
   lados retos dos nós (continuidade G1 em todas as junções, sem quinas nem sobreposição).
   Uso: node tools/build-geometry.mjs  → imprime o JSON que alimenta assets/js/brand.js */
const K = 0.5522847498; // constante do quarto de elipse em Bézier cúbica
const f = n => +n.toFixed(3);
// nó: [x, y, lado, raio]
export const NODES = { a:[31.90,54.99,47.76,16.74], b:[87.02,14.58,33.06,11.59], c:[127.43,55.91,23.88,8.37], d:[157.45,32.70,17.74,6.22] };
// concordâncias: ponto sobre lado vertical (v) e ponto sobre lado horizontal (h)
export const FILLETS = {
  A:{v:[87.02,34.32],  h:[62.92,54.99]},   // b esquerda  ↔ a topo
  B:{v:[79.66,71.73],  h:[99.41,47.64]},   // a direita   ↔ b base
  C:{v:[127.43,64.28], h:[108.49,47.64]},  // c esquerda  ↔ b base
  D:{v:[120.08,36.05], h:[137.64,55.91]},  // b direita   ↔ c topo
  E:{v:[151.31,64.28], h:[163.67,50.44]},  // c direita   ↔ d base
  F:{v:[157.45,42.87], h:[142.94,55.91]}   // d esquerda  ↔ c topo
};
// construtor de caminho: guarda o ponto corrente; q() = quarto de elipse até (x,y)
function pen(x0,y0){ let x=x0,y=y0,d=`M${f(x)},${f(y)}`;
  const api={ H(nx){d+=`H${f(nx)}`;x=nx;return api;}, V(ny){d+=`V${f(ny)}`;y=ny;return api;},
    L(nx,ny){d+=`L${f(nx)},${f(ny)}`;x=nx;y=ny;return api;},
    // tangente inicial: 'h' sai na horizontal, 'v' sai na vertical
    q(nx,ny,t){ const dx=nx-x,dy=ny-y; const c1=t==='v'?[x,y+K*dy]:[x+K*dx,y], c2=t==='v'?[nx-K*dx,ny]:[nx,ny-K*dy];
      d+=`C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(nx)},${f(ny)}`;x=nx;y=ny;return api;},
    Z(){return d+'Z';}, end(){return d;} }; return api; }
const nodePath = ([x,y,s,r]) => pen(x+r,y).H(x+s-r).q(x+s,y+r,'h').V(y+s-r).q(x+s-r,y+s,'v').H(x+r).q(x,y+s-r,'h').V(y+r).q(x+r,y,'v').Z();
const {a,b,c,d} = NODES, F = FILLETS;
const merged = pen(a[0]+a[3],a[1])
  .H(F.A.h[0]).q(...F.A.v,'h')
  .V(b[1]+b[3]).q(b[0]+b[3],b[1],'v').H(b[0]+b[2]-b[3]).q(b[0]+b[2],b[1]+b[3],'h').V(F.D.v[1]).q(...F.D.h,'v')
  .H(F.F.h[0]).q(...F.F.v,'h')
  .V(d[1]+d[3]).q(d[0]+d[3],d[1],'v').H(d[0]+d[2]-d[3]).q(d[0]+d[2],d[1]+d[3],'h').V(d[1]+d[2]-d[3]).q(d[0]+d[2]-d[3],d[1]+d[2],'v').H(F.E.h[0]).q(...F.E.v,'h')
  .V(c[1]+c[2]-c[3]).q(c[0]+c[2]-c[3],c[1]+c[2],'v').H(c[0]+c[3]).q(c[0],c[1]+c[2]-c[3],'h').V(F.C.v[1]).q(...F.C.h,'v')
  .H(F.B.h[0]).q(...F.B.v,'h')
  .V(a[1]+a[2]-a[3]).q(a[0]+a[2]-a[3],a[1]+a[2],'v').H(a[0]+a[3]).q(a[0],a[1]+a[2]-a[3],'h').V(a[1]+a[3]).q(a[0]+a[3],a[1],'v').Z();
const fil = k => pen(...F[k].v).q(...F[k].h,'v').end();
// pontes: região entre duas concordâncias, com cordas que passam por dentro dos nós (ficam cobertas)
const bridge = (k1,k2) => pen(...F[k1].v).q(...F[k1].h,'v').L(...F[k2].v).q(...F[k2].h,'v').Z();
const out = {
  nodes: Object.fromEntries(Object.entries(NODES).map(([k,v])=>[k,nodePath(v)])),
  bridges: [bridge('A','B'), bridge('C','D'), bridge('E','F')],
  fillets: Object.keys(F).map(fil),
  merged
};
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(out));
export default out;
