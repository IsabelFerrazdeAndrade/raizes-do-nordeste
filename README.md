# Raízes do Nordeste

Aplicação acadêmica de uma rede fictícia de lanchonetes inspirada na culinária e no acolhimento nordestinos. Esta primeira etapa implementa somente a estrutura inicial e a Home. Não realiza vendas reais.

## Tecnologias

HTML5 semântico, CSS3 (Mobile-first, Grid e Flexbox) e JavaScript puro. Sem frameworks, dependências externas, back-end, banco de dados ou necessidade de Node.js.

## Estrutura

```text
index.html            # Home e diálogo informativo
css/style.css         # Identidade visual e responsividade
js/data.js            # Dados fictícios dos três produtos em destaque
js/app.js             # Renderização dos produtos e avisos dos botões
assets/images/        # Ilustrações SVG próprias e substituíveis
.gitignore            # Arquivos locais que não devem ser versionados
README.md             # Documentação
```

Os scripts usam `defer`, carregando os dados antes da interface. Um único namespace (`window.RaizesNordeste`) disponibiliza os dados sem espalhar variáveis globais. A lógica da Home fica isolada em uma função. Não existem funções vazias ou módulos antecipados; cada funcionalidade futura pode receber seus próprios arquivos quando for implementada.

## Como executar

Abra `index.html` diretamente em um navegador moderno. Alternativamente, abra a pasta no VS Code e use **Open with Live Server** em `index.html`, se essa extensão estiver instalada. Não há instalação de pacotes nem compilação.

Todos os caminhos são relativos. Para publicação futura no GitHub Pages, sirva a raiz do repositório; nenhuma configuração de roteamento é necessária.

## Disponível nesta etapa

- Cabeçalho, destaque da marca, apresentação da rede e rodapé fictício.
- Três produtos em destaque, renderizados a partir de `data.js`, com preços em reais.
- Links internos para sabores e história.
- Botões “Ver cardápio” e “Escolher unidade” com mensagens informativas em diálogo nativo. Feche pelo botão “Entendi” ou pela tecla Escape; o foco retorna ao botão de origem.
- Layout responsivo, foco visível, link para pular ao conteúdo e textos alternativos.
- Ilustrações vetoriais originais criadas para este projeto, sem imagens ou fontes de terceiros. São representações ilustrativas, não fotografias dos produtos.

Para substituir as imagens, adicione os arquivos em `assets/images/` e ajuste `image` e `imageAlt` em `js/data.js`. A imagem principal está definida em `index.html`. Os valores e produtos são apenas demonstrativos.

JavaScript é necessário para os produtos e os diálogos; um aviso em `noscript` informa essa condição quando desativado. O restante do conteúdo permanece legível.

## Como testar

1. Abra a página e confira os três produtos, seus textos e valores.
2. Clique em cada botão de cardápio e unidade; confira a mensagem e feche por “Entendi” e Escape.
3. Navegue usando Tab, Shift+Tab e Enter. Verifique o link de pular conteúdo, o foco visível e a navegação dentro do diálogo.
4. Nas ferramentas de desenvolvedor (F12), ative o modo responsivo e teste larguras de 320, 375, 768, 1024 e 1440 px, incluindo orientação paisagem.
5. Confira ausência de rolagem horizontal, legibilidade, quebra dos botões e disposição dos cards em uma, duas e três colunas. Teste também zoom de 200%.
6. Verifique o console e a aba de rede: não devem existir erros ou recursos ausentes. Não há chamadas para APIs ou serviços externos.

## Planejado para próximas etapas

Seleção de unidade e cardápio por unidade; posteriormente, carrinho, login e cadastro, checkout e pagamento simulado, pedidos e acompanhamento, fidelidade e uma interface específica para totem de autoatendimento. Nenhuma dessas funcionalidades está implementada nesta etapa.

A próxima etapa pode definir os dados das unidades e sua relação com os produtos, seguida da seleção de unidade e do cardápio. A estrutura atual permite essa evolução sem exigir frameworks.
