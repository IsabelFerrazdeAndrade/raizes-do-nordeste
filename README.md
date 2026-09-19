# Raízes do Nordeste

Aplicação acadêmica de uma rede fictícia de lanchonetes inspirada na culinária e no acolhimento nordestinos. Contém a Home da Etapa 1 e a seleção de unidades e o cardápio dinâmico da Etapa 2. Não realiza vendas reais.

## Tecnologias

HTML5 semântico, CSS3 (Mobile-first, Grid e Flexbox) e JavaScript puro. Sem frameworks, dependências externas, back-end, banco de dados ou necessidade de Node.js.

## Estrutura

```text
index.html            # Home, cardápio e diálogo de unidades
css/style.css         # Identidade visual e responsividade
js/data.js            # Catálogo, categorias, destaques e unidades fictícias
js/app.js             # Navegação, seleção, persistência, renderização e filtros
assets/images/        # Ilustrações SVG próprias e substituíveis
.gitignore            # Arquivos locais que não devem ser versionados
README.md             # Documentação
```

Os scripts usam `defer`, carregando os dados antes da interface. Um único namespace (`window.RaizesNordeste`) disponibiliza os dados sem espalhar variáveis globais. A lógica fica isolada em uma função, com funções menores para renderização, navegação, filtros e armazenamento. Home e cardápio compartilham o mesmo construtor de cards. Conteúdo dinâmico usa `textContent`, sem inserção por `innerHTML`.

## Como executar

Abra `index.html` diretamente em um navegador moderno. Alternativamente, abra a pasta no VS Code e use **Open with Live Server** em `index.html`, se essa extensão estiver instalada. Não há instalação de pacotes nem compilação.

Todos os caminhos são relativos. Para publicação futura no GitHub Pages, sirva a raiz do repositório; nenhuma configuração de roteamento é necessária.

## Disponível nesta etapa

- Cabeçalho, destaque da marca, apresentação da rede e rodapé fictício.
- Três produtos em destaque, renderizados a partir de `data.js`, com preços em reais.
- Links internos para sabores e história.
- Seleção de Recife/PE, Salvador/BA e Fortaleza/CE em diálogo nativo, com endereço e horário fictícios. Feche pelo botão “Fechar” ou Escape.
- Unidade identificada abaixo do cabeçalho e salva em `localStorage` na chave `raizesNordeste.unitId`. IDs desconhecidos são descartados e solicitam nova seleção. Se o armazenamento for bloqueado, um aviso informa que a escolha vale apenas enquanto a página estiver aberta.
- Cardápio por unidade, com 12 produtos no catálogo, quatro categorias e três promoções com preço original e promocional em reais.
- Busca por nome sem distinguir caixa ou acentos, combinada com categoria; opção “Todos” e mensagem quando não há resultados.
- Navegação por fragmentos relativos (`#inicio`, `#cardapio`, `#destaques`, `#sobre`), inclusive pelos botões Voltar/Avançar do navegador.
- Layout responsivo, foco visível, link para pular ao conteúdo e textos alternativos.
- Ilustrações vetoriais originais criadas para este projeto, sem imagens ou fontes de terceiros. São representações ilustrativas, não fotografias dos produtos.

Para substituir as imagens, adicione os arquivos em `assets/images/` e ajuste `image` e `imageAlt` em `js/data.js`. A imagem principal está definida em `index.html`. Os valores e produtos são apenas demonstrativos.

JavaScript é necessário para produtos, cardápio e seleção; um aviso em `noscript` informa essa condição quando desativado. O restante da Home permanece legível. Nove produtos usam um placeholder local explícito, substituível sem alterar a lógica.

## Seleção de unidade e acesso ao cardápio

Clique em **Escolher unidade** e selecione a cidade. Depois, use **Ver cardápio** ou **Cardápio** no cabeçalho. Se acessar o cardápio sem unidade, a seleção abre automaticamente e nenhum produto é mostrado até a escolha. Para mudar, use **Trocar unidade**, inclusive no celular e sem voltar à Home. A busca e a categoria são preservadas durante a troca; os resultados são recalculados para a nova unidade. Use **Início** para retornar à Home.

## Organização dos dados

- `products`: catálogo único com ID, nome, descrição, categoria, preço numérico, imagem e texto alternativo. `promotionalPrice`, quando presente, é o preço final de promoção, inferior a `price`. Os preços são iguais entre unidades nesta etapa.
- `units`: ID, nome, cidade, estado, endereço, horário e `productIds`. Essa lista de IDs é a fonte única de disponibilidade, sem repetir produtos ou manter relações redundantes.
- `featuredProductIds`: referências aos três produtos originais da Home, disponíveis nas três unidades.
- `categories`: Lanches, Pratos, Sobremesas e Bebidas.

Recife tem 9 produtos, Salvador tem 8 e Fortaleza tem 10. Por exemplo, baião de dois está em Recife e Fortaleza; suco de graviola está em Salvador e Fortaleza. Alterações no catálogo refletem nos cards da Home e do cardápio.

Em URLs `file://`, a persistência pode variar conforme as permissões do navegador. Para uso consistente de `localStorage`, prefira Live Server ou GitHub Pages. A aplicação também funciona sem armazenamento, mantendo a seleção em memória até recarregar.

## Como testar

1. Abra a página e confira os três produtos, seus textos e valores.
2. Sem unidade salva, clique em “Ver cardápio”. Confirme que a seleção é solicitada; escolha Recife e confira 9 produtos. Troque para Salvador (8) e Fortaleza (10). Recarregue e confira a unidade preservada.
3. Busque `BAIAO` em Recife: deve aparecer “Baião de dois”. Selecione “Bebidas”: nenhum resultado. Busque `SUCO`: aparecem apenas bebidas disponíveis. Use “Todos” e limpe a busca para restaurar o cardápio. Confira os preços original e promocional do baião, hambúrguer e bolo nas unidades correspondentes.
4. Nas ferramentas de desenvolvedor (F12), ative o modo responsivo e teste larguras de 320, 375, 768, 1024 e 1440 px, incluindo orientação paisagem.
5. Confira ausência de rolagem horizontal, legibilidade, quebra dos botões e disposição dos cards em uma, duas e três colunas. Teste também zoom de 200%.
6. Verifique o console e a aba de rede: não devem existir erros ou recursos ausentes. Não há chamadas para APIs ou serviços externos.
7. Navegue usando Tab, Shift+Tab e Enter. Confira foco visível, labels, indicação da categoria, fechamento por Escape e contenção do foco no diálogo. Ao selecionar uma unidade no cardápio, o foco vai para o título atualizado.
8. Em Application/Armazenamento nas ferramentas do navegador, altere `raizesNordeste.unitId` para `inexistente` e recarregue: uma nova seleção deve ser solicitada. Remova a chave para testar o primeiro acesso.
9. Confira os links da Home, retorno ao início e Voltar/Avançar do navegador. Com o armazenamento bloqueado, selecione uma unidade e confira o aviso e o funcionamento do cardápio na sessão.

## Planejado para próximas etapas

A **Etapa 3** será dedicada a detalhes dos produtos e carrinho, incluindo quantidades, adição e remoção. Posteriormente: login, cadastro, checkout, pagamento simulado, acompanhamento de pedidos, fidelidade e modo Totem. Nenhuma dessas funcionalidades está implementada nesta etapa. Os controles de toque e os estilos compartilhados permitem evolução visual, mas não existe um modo Totem ativo.
