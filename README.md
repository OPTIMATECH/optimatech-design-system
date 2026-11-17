# OPTIMATECH Design System v7.1

Site estático (HTML, CSS e JS puros, sem build). Base: Manual de Marca e Identidade Visual v3.

## Publicar no Netlify
1. Em app.netlify.com, arraste esta pasta inteira para "Deploy manually" (ou conecte um repositório com esta pasta na raiz).
2. Renomeie o site para **optimatech-ds** (endereço `https://optimatech-ds.netlify.app/`).
   Se usar outro endereço, troque a constante `SITE_BASE` no topo de `assets/js/studio.js`. Ela aponta para as imagens hospedadas das assinaturas de e-mail; sem isso, as imagens das assinaturas não carregam no Gmail e no Outlook.
3. Para testar localmente: `python3 -m http.server` dentro da pasta e abra `http://localhost:8000`. Abrir o `index.html` direto do disco funciona, mas Tokens, Papel timbrado e Downloads precisam de servidor.

## Estrutura
- `index.html` — páginas do sistema (rota por `#hash`: marca, logotipo, cores, tipografia, grid, elementos, iconografia, fotografia, movimento, voz, componentes, tokens, aplicações, papelaria, fundos, downloads).
- `studio.html` — geradores: assinatura de e-mail, cartão de visita, cartão QR.
- `assets/js/brand.js` — **fonte única do logotipo.** Letras contornadas dos SVGs de registro do manual v3; símbolo gerado por `tools/build-geometry.mjs`. Todo logo do site, do Studio e dos pacotes sai daqui. Não redesenhe à mão.
- `tools/build-geometry.mjs` — construção matemática do símbolo (nós e concordâncias). `node tools/build-geometry.mjs` imprime o JSON usado em `brand.js`.
- `tools/build_fundos.py` — gera fundos de tela, fundos de reunião e capas de LinkedIn em `downloads/fundos/` e as prévias em `assets/img/fundos/`.
- `assets/css/tokens.css` — tokens de cor, tipo, espaço, raio e movimento.
- `assets/js/icons.js` + `assets/icons/` — 118 ícones oficiais nomeados.
- `assets/js/shell.js` — menu lateral e busca (edite a constante `NAV` para mudar o menu).
- `downloads/` — pacotes ZIP, timbrados (docx, dotx, pdf) e `manifest.json` (a lista que alimenta as páginas de download e papelaria).

## Novo na v7.1

- **Símbolo reconstruído.** O vetor do registro tinha emendas entre nós e pontes (quinas de até 9° nas junções e linhas finas no preenchimento). Agora os nós têm cantos circulares exatos (raio 35,05% do lado) e as seis concordâncias são quartos de elipse tangentes aos lados retos. Posições e medidas dos nós são as do registro; o desvio máximo do contorno em relação ao original é de 0,6% da largura do símbolo. Pacotes de logotipos e texturas regerados.
- **Fundos e capas.** Página `#fundos` com 4 capas de LinkedIn para colaboradores, 2 para a página da empresa, 11 fundos de reunião (6 gráficos e 5 ambientes), 8 papéis de parede 4K e 4 telas de celular. A lista vem de `downloads/manifest.json` (chave `fundos`).
- Para regerar: `OT_AMBIENTES="pasta/Plano de fundo" python3 tools/build_fundos.py` (requer `cairosvg`, `pillow`, `numpy` e as fontes Exo e Sora instaladas).

## Limitações conhecidas
- O PDF para gráfica do Studio é montado conforme PDF/X-1a:2001 (CMYK, FOGRA39, fontes incorporadas, sem transparência, sangria e marcas de corte), mas não passou por preflight de Acrobat/PitStop. Peça o preflight à gráfica.
- Os valores CMYK vêm de conversão ICC (FOGRA39), não de prova de cor. Valide com a gráfica antes de grandes tiragens.
- Os timbrados (Word e PDF) e as imagens das assinaturas de e-mail ainda trazem o símbolo da v7; a diferença é imperceptível nesses tamanhos e será trocada na próxima revisão da papelaria.
- Os timbrados em Word usam Exo e Sora: instale as fontes (pacote de fontes) para a aparência correta.
