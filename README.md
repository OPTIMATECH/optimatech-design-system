# OPTIMATECH Design System v7

Site estático (HTML, CSS e JS puros, sem build). Base: Manual de Marca e Identidade Visual v3.

## Publicar no Netlify
1. Em app.netlify.com, arraste esta pasta inteira para "Deploy manually" (ou conecte um repositório com esta pasta na raiz).
2. Renomeie o site para **optimatech-ds** (endereço `https://optimatech-ds.netlify.app/`).
   Se usar outro endereço, troque a constante `SITE_BASE` no topo de `assets/js/studio.js`. Ela aponta para as imagens hospedadas das assinaturas de e-mail; sem isso, as imagens das assinaturas não carregam no Gmail e no Outlook.
3. Para testar localmente: `python3 -m http.server` dentro da pasta e abra `http://localhost:8000`. Abrir o `index.html` direto do disco funciona, mas Tokens, Papel timbrado e Downloads precisam de servidor.

## Estrutura
- `index.html` — páginas do sistema (rota por `#hash`: marca, logotipo, cores, tipografia, grid, elementos, iconografia, fotografia, movimento, voz, componentes, tokens, aplicações, papelaria, downloads).
- `studio.html` — geradores: assinatura de e-mail, cartão de visita, cartão QR.
- `assets/js/brand.js` — **fonte única do logotipo.** Geometria oficial extraída dos SVGs de registro do manual v3 (letras contornadas). Todo logo do site, do Studio e dos pacotes sai daqui. Não redesenhe.
- `assets/css/tokens.css` — tokens de cor, tipo, espaço, raio e movimento.
- `assets/js/icons.js` + `assets/icons/` — 118 ícones oficiais nomeados.
- `assets/js/shell.js` — menu lateral e busca (edite a constante `NAV` para mudar o menu).
- `downloads/` — pacotes ZIP, timbrados (docx, dotx, pdf) e `manifest.json` (a lista que alimenta as páginas de download e papelaria).

## Limitações conhecidas
- O PDF para gráfica do Studio é montado conforme PDF/X-1a:2001 (CMYK, FOGRA39, fontes incorporadas, sem transparência, sangria e marcas de corte), mas não passou por preflight de Acrobat/PitStop. Peça o preflight à gráfica.
- Os valores CMYK vêm de conversão ICC (FOGRA39), não de prova de cor. Valide com a gráfica antes de grandes tiragens.
- Os timbrados em Word usam Exo e Sora: instale as fontes (pacote de fontes) para a aparência correta.
