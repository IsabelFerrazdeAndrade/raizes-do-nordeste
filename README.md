# Raízes do Nordeste

Aplicação acadêmica de uma rede fictícia de lanchonetes inspirada na culinária e no acolhimento nordestinos. Contém a Home da Etapa 1, seleção de unidades e cardápio dinâmico da Etapa 2 e detalhes de produtos e carrinho da Etapa 3. Não realiza vendas reais.

## Tecnologias

HTML5 semântico, CSS3 (Mobile-first, Grid e Flexbox) e JavaScript puro. Sem frameworks, dependências externas, back-end, banco de dados ou necessidade de Node.js.

## Estrutura

```text
index.html            # Home, cardápio, carrinho e diálogos acessíveis
css/style.css         # Identidade visual e responsividade
js/data.js            # Catálogo, categorias, destaques e unidades fictícias
js/app.js             # Navegação, seleção, persistência, renderização e filtros
js/carrinho.js        # Regras do carrinho, validação, persistência e preços em centavos
assets/images/        # Ilustrações SVG próprias e substituíveis
.gitignore            # Arquivos locais que não devem ser versionados
README.md             # Documentação
```

Os scripts usam `defer`, na ordem `data.js`, `carrinho.js`, `app.js`. Um único namespace (`window.RaizesNordeste`) disponibiliza os dados e a fábrica do carrinho sem espalhar variáveis globais. O estado do carrinho fica privado, separado da interface. Home e cardápio compartilham o construtor de cards; detalhes e carrinho compartilham o controle de quantidade e a lógica de preços. Conteúdo dinâmico usa `textContent`, sem inserção por `innerHTML`.

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
- Navegação por fragmentos relativos (`#inicio`, `#cardapio`, `#carrinho`, `#destaques`, `#sobre`), inclusive pelos botões Voltar/Avançar do navegador.
- Layout responsivo, foco visível, link para pular ao conteúdo e textos alternativos.
- Ilustrações vetoriais originais criadas para este projeto, sem imagens ou fontes de terceiros. São representações ilustrativas, não fotografias dos produtos.

Para substituir as imagens, adicione os arquivos em `assets/images/` e ajuste `image` e `imageAlt` em `js/data.js`. A imagem principal está definida em `index.html`. Os valores e produtos são apenas demonstrativos.

JavaScript é necessário para produtos, cardápio, seleção e carrinho; um aviso em `noscript` informa essa condição quando desativado. O restante da Home permanece legível. Nove produtos usam um placeholder local explícito, substituível sem alterar a lógica.

## Etapa 3: detalhes e carrinho

- No cardápio, use **Ver detalhes** para abrir o produto com imagem, descrição integral, categoria, preço vigente e preço original em promoções.
- Use **−** e **+** para escolher entre 1 e 99 unidades. O total do produto é atualizado imediatamente. **Adicionar ao carrinho** valida unidade, produto, disponibilidade e quantidade, fecha o diálogo e exibe uma confirmação acessível.
- O link **Carrinho** no cabeçalho mostra a soma das quantidades, não apenas o número de produtos diferentes. Adições repetidas somam quantidades na mesma linha; se a soma ultrapassar 99, a nova adição é recusada com mensagem, preservando o carrinho.
- No carrinho, altere quantidades, confira preço unitário, total por produto, subtotal e total geral. **Remover** exclui explicitamente o item; diminuir a partir de 1 não o remove.
- O pedido simula retirada na unidade, sem frete ou taxas. Portanto, subtotal e total são iguais.
- **Continuar comprando** retorna ao cardápio. O carrinho vazio apresenta uma mensagem e **Voltar ao cardápio**; não permite finalizar.
- **Finalizar pedido** apenas informa que a identificação do cliente chegará na próxima etapa. Não gera pedido nem abre checkout.
- Os diálogos fecham pelo botão ou Escape. Tab e Shift+Tab permanecem nos controles do diálogo; o foco retorna ao acionador. Ao remover um item, o foco segue para outro botão de remoção ou para o retorno ao cardápio, se vazio.

## Regras de troca de unidade

Com carrinho vazio, a troca ocorre diretamente. Se houver itens e a nova unidade for diferente, a aplicação pede confirmação e informa que o carrinho será esvaziado. **Cancelar** ou Escape preserva unidade e itens e retorna à seleção; **Esvaziar e trocar** limpa o carrinho e atualiza unidade e cardápio. Manter a mesma unidade preserva os itens. A regra é compartilhada por todos os botões de seleção, inclusive na Home, no cabeçalho e no carrinho.

## Persistência e validação do carrinho

A chave `raizesNordeste.cart` armazena apenas a unidade e os IDs e quantidades dos itens:

```json
{
  "unitId": "recife",
  "items": [{ "productId": "baiao-dois", "quantity": 2 }]
}
```

Preços, nomes e descrições são recuperados do catálogo. `priceCents` centraliza o preço vigente, respeitando `promotionalPrice`; os cálculos usam centavos inteiros e a exibição usa `Intl.NumberFormat('pt-BR')` com moeda BRL. Por exemplo, duas porções de baião em promoção custam R$ 47,80, não R$ 55,80.

Ao restaurar, o código valida JSON, estrutura, unidade e correspondência com a unidade selecionada. Produtos inexistentes ou indisponíveis e quantidades não inteiras, fora de 1–99 ou de tipo incorreto são descartados. Linhas duplicadas são unificadas, limitadas a 99. Campos extras, inclusive preços adulterados, são ignorados. Carrinhos de outra unidade são descartados; dados corrigidos são salvos novamente e um aviso é exibido.

Falhas de leitura ou gravação não bloqueiam a interface: o estado funciona em memória e um aviso informa que alterações podem não sobreviver ao recarregamento. O armazenamento é local ao navegador e à origem, sem conta, servidor ou sincronização entre dispositivos.

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

### Testes manuais da Etapa 3

1. Em Recife, abra os detalhes de Baião de dois. Confira a promoção (R$ 27,90 por R$ 23,90), aumente para 2 e confira R$ 47,80. Adicione e verifique contador 2.
2. Adicione mais uma unidade do mesmo produto: deve existir uma linha com quantidade 3 e total R$ 71,70. Confira a atualização imediata ao aumentar e diminuir no carrinho.
3. Teste os limites 1 e 99 nos dois controles. Com 99 no carrinho, outra adição do mesmo produto deve ser recusada sem alterar os itens.
4. Recarregue a página e confira a unidade, quantidades e totais. Remova um item e depois o último; confira o estado vazio e a ausência de finalização disponível.
5. Com itens, tente trocar para Salvador. Cancele e confirme a preservação; repita e confirme para esvaziar. Manter Recife não deve limpar o carrinho. Repita a troca pelo cabeçalho e pelo botão da página.
6. Com itens, clique em **Finalizar pedido**: deve aparecer somente o aviso da próxima etapa e o carrinho deve permanecer intacto.
7. Nas ferramentas do navegador, altere `raizesNordeste.cart` para JSON inválido e recarregue. Teste também produto inexistente, produto indisponível (`suco-graviola` em Recife), quantidade negativa, zero, fracionária ou acima de 99. Entradas inválidas não devem aparecer no carrinho.
8. Adicione um campo `price` adulterado a um item salvo: o preço exibido deve continuar vindo do catálogo. Altere a unidade do carrinho salvo para outra: os itens devem ser descartados ao restaurar.
9. Teste teclado, fechamento por botão e Escape, retorno do foco e Tab/Shift+Tab nos diálogos. No celular, verifique rolagem vertical dos detalhes e acesso a todos os controles, inclusive em paisagem.

### Verificações executadas na entrega

Automação com Playwright e Microsoft Edge em modo headless, disponível no ambiente de desenvolvimento; não é uma dependência da aplicação. Foram verificados abertura por arquivo local e por HTTP em subdiretório, regressão da Home e busca/filtro, detalhes, promoção, limites 1–99, inclusão repetida, alteração, remoção, totais, persistência, estado vazio, confirmação/cancelamento da troca e aviso de finalização. Também foram exercitados JSON corrompido, tipos e IDs inválidos, indisponibilidade, duplicatas, adulteração de preço e falhas de leitura/gravação.

Home, cardápio e carrinho foram verificados em 320, 375, 768, 1024 e 1440 px sem rolagem horizontal. O diálogo de produto foi verificado também em 900 px e em paisagem (812 × 375), com acesso ao botão de adição. Tab, Shift+Tab, Escape e retorno do foco passaram após o ajuste do ciclo de foco. Nenhum erro JavaScript foi registrado no teste final. Outros navegadores, leitores de tela e aparelhos físicos não foram testados.

## Planejado para próximas etapas

A **Etapa 4** será dedicada a cadastro, login e LGPD. A ação de finalização está isolada para receber esse fluxo futuramente, sem implementá-lo agora. Posteriormente: checkout, pagamento simulado, geração e acompanhamento de pedidos, fidelidade e modo Totem. Não há identificação de clientes, pedidos reais, pagamento ou modo Totem ativo nesta versão.
