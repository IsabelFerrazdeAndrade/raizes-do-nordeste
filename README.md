# Raízes do Nordeste

Aplicação acadêmica de uma rede fictícia de lanchonetes inspirada na culinária e no acolhimento nordestinos. Contém Home, unidades, cardápio e carrinho (Etapas 1–3), perfis demonstrativos e privacidade (Etapa 4), checkout e pagamento simulado (Etapa 5), acompanhamento de pedidos e fidelidade demonstrativa (Etapa 6) e modo Totem com ajustes responsivos (Etapa 7). Não realiza vendas ou cobranças reais.

**Use somente dados fictícios. Não crie contas reais.** A identificação é uma simulação local sem senha, verificação de identidade ou autenticação segura. Qualquer pessoa com acesso ao mesmo navegador pode selecionar os perfis salvos.

## Tecnologias

HTML5 semântico, CSS3 (Mobile-first, Grid e Flexbox) e JavaScript puro. Sem frameworks, dependências externas, back-end, banco de dados ou necessidade de Node.js.

## Estrutura

```text
index.html            # Home, cardápio, carrinho, identificação, perfil e diálogos
css/style.css         # Identidade visual e responsividade
js/data.js            # Catálogo, categorias, destaques e unidades fictícias
js/app.js             # Navegação, seleção, persistência, renderização e filtros
js/carrinho.js        # Regras do carrinho, validação, persistência e preços em centavos
js/auth.js            # Perfis demonstrativos, validação, identificação e armazenamento local
js/pagamento.js       # Serviço mockado assíncrono, checkout e confirmação
js/pedidos.js         # Pedidos, status, pontos derivados e persistência de resgates
js/fidelidade.js      # Interfaces de pedidos, acompanhamento e fidelidade
js/totem.js           # Modo explícito, início, encerramento e proteção do atendimento
assets/images/        # Ilustrações SVG próprias e substituíveis
.gitignore            # Arquivos locais que não devem ser versionados
README.md             # Documentação
```

Os scripts usam `defer`, na ordem `data.js`, `totem.js`, `carrinho.js`, `pedidos.js`, `auth.js`, `pagamento.js`, `fidelidade.js`, `app.js`. Um único namespace (`window.RaizesNordeste`) disponibiliza os módulos sem espalhar variáveis globais. Carrinho e identificação mantêm seus estados isolados. `auth.js` centraliza leitura, validação e gravação de perfis e reutiliza um template de campos para cadastro e edição. Home e cardápio compartilham o construtor de cards; detalhes e carrinho compartilham o controle de quantidade e a lógica de preços. Confirmação e acompanhamento reutilizam a apresentação dos dados históricos do pedido. Conteúdo dinâmico usa `textContent`, sem inserção por `innerHTML`.

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
- Navegação por fragmentos relativos (`#inicio`, `#cardapio`, `#carrinho`, `#entrar`, `#cadastro`, `#perfil`, `#finalizacao`, `#destaques`, `#sobre`), inclusive pelos botões Voltar/Avançar do navegador.
- Layout responsivo, foco visível, link para pular ao conteúdo e textos alternativos.
- Ilustrações vetoriais originais criadas para este projeto, sem imagens ou fontes de terceiros. São representações ilustrativas, não fotografias dos produtos.

Para substituir as imagens, adicione os arquivos em `assets/images/` e ajuste `image` e `imageAlt` em `js/data.js`. A imagem principal está definida em `index.html`. Os valores e produtos são apenas demonstrativos.

JavaScript é necessário para produtos, cardápio, seleção, carrinho e identificação; um aviso em `noscript` informa essa condição quando desativado. O restante da Home permanece legível. Nove produtos usam um placeholder local explícito, substituível sem alterar a lógica.

## Etapa 3: detalhes e carrinho

- No cardápio, use **Ver detalhes** para abrir o produto com imagem, descrição integral, categoria, preço vigente e preço original em promoções.
- Use **−** e **+** para escolher entre 1 e 99 unidades. O total do produto é atualizado imediatamente. **Adicionar ao carrinho** valida unidade, produto, disponibilidade e quantidade, fecha o diálogo e exibe uma confirmação acessível.
- O link **Carrinho** no cabeçalho mostra a soma das quantidades, não apenas o número de produtos diferentes. Adições repetidas somam quantidades na mesma linha; se a soma ultrapassar 99, a nova adição é recusada com mensagem, preservando o carrinho.
- No carrinho, altere quantidades, confira preço unitário, total por produto, subtotal e total geral. **Remover** exclui explicitamente o item; diminuir a partir de 1 não o remove.
- O pedido simula retirada na unidade, sem frete ou taxas. Portanto, subtotal e total são iguais.
- **Continuar comprando** retorna ao cardápio. O carrinho vazio apresenta uma mensagem e **Voltar ao cardápio**; não permite finalizar.
- **Finalizar pedido** inicia a identificação demonstrativa quando necessário e abre o checkout simulado. Apenas uma aprovação salva com sucesso gera um pedido demonstrativo e limpa o carrinho.
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
6. Com itens, clique em **Finalizar pedido**: identifique-se se necessário e confira o resumo no checkout. O carrinho deve permanecer intacto até a aprovação e gravação do pedido.
7. Nas ferramentas do navegador, altere `raizesNordeste.cart` para JSON inválido e recarregue. Teste também produto inexistente, produto indisponível (`suco-graviola` em Recife), quantidade negativa, zero, fracionária ou acima de 99. Entradas inválidas não devem aparecer no carrinho.
8. Adicione um campo `price` adulterado a um item salvo: o preço exibido deve continuar vindo do catálogo. Altere a unidade do carrinho salvo para outra: os itens devem ser descartados ao restaurar.
9. Teste teclado, fechamento por botão e Escape, retorno do foco e Tab/Shift+Tab nos diálogos. No celular, verifique rolagem vertical dos detalhes e acesso a todos os controles, inclusive em paisagem.

### Verificações executadas na Etapa 3

Automação com Playwright e Microsoft Edge em modo headless, disponível no ambiente de desenvolvimento; não é uma dependência da aplicação. Foram verificados abertura por arquivo local e por HTTP em subdiretório, regressão da Home e busca/filtro, detalhes, promoção, limites 1–99, inclusão repetida, alteração, remoção, totais, persistência, estado vazio, confirmação/cancelamento da troca e aviso de finalização. Também foram exercitados JSON corrompido, tipos e IDs inválidos, indisponibilidade, duplicatas, adulteração de preço e falhas de leitura/gravação.

Home, cardápio e carrinho foram verificados em 320, 375, 768, 1024 e 1440 px sem rolagem horizontal. O diálogo de produto foi verificado também em 900 px e em paisagem (812 × 375), com acesso ao botão de adição. Tab, Shift+Tab, Escape e retorno do foco passaram após o ajuste do ciclo de foco. Nenhum erro JavaScript foi registrado no teste final. Outros navegadores, leitores de tela e aparelhos físicos não foram testados.

## Etapa 4: cadastro, login e perfil demonstrativos

Pelo cabeçalho, escolha **Entrar** e depois **Criar perfil demonstrativo**. Informe nome e e-mail fictícios; telefone é opcional (DDD e número com 10 ou 11 dígitos, com +55 opcional). As validações aparecem junto aos campos, com associação acessível e foco no primeiro erro. E-mails são normalizados para minúsculas e não podem se repetir nos perfis locais, inclusive durante a edição.

O cadastro pede ciência das informações de privacidade em uma caixa inicialmente desmarcada. A opção de marketing é outra caixa, também desmarcada, e **não é necessária para cadastrar**. Não há envio real de e-mails, SMS ou mensagens promocionais. A política pode ser aberta durante o preenchimento sem perder os campos.

Para entrar sem preencher o cadastro, use **Usar conta de demonstração**:

- Nome inicial: **Cliente Demonstração**.
- E-mail: **cliente@exemplo.test**.
- Sem senha. Marketing inicialmente recusado.

O perfil de teste é criado localmente quando esse botão é usado. Se já houver um perfil com esse e-mail, ele será selecionado. Também é possível escolher qualquer perfil local no formulário de entrada; isso não comprova a identidade de ninguém. Não há provedores externos, tokens, senhas persistidas ou criptografia de senhas.

Após identificar-se, o cabeçalho mostra o primeiro nome. Clique nele para acessar o **Perfil demonstrativo**, onde é possível alterar nome, e-mail, telefone e marketing. **Sair** encerra a identificação, mas conserva o perfil para seleção futura. **Excluir meus dados locais** pede confirmação, remove os pedidos e resgates demonstrativos do perfil e seus pontos derivados, o perfil ativo e sua preferência de marketing e encerra a identificação. Se a remoção dos pedidos e resgates falhar, a exclusão é interrompida com aviso. Outros perfis, seus pedidos e resgates, o carrinho e a unidade não são excluídos. A conta fictícia pode ser recriada ao selecionar novamente o botão de demonstração.

## Dados locais e privacidade

| Chave | Conteúdo e finalidade |
| --- | --- |
| `raizesNordeste.unitId` | Unidade selecionada para o cardápio. |
| `raizesNordeste.cart` | Unidade, IDs e quantidades dos itens do carrinho. |
| `raizesNordeste.identity` | Perfis demonstrativos, ciência de privacidade, preferência de marketing e e-mail do perfil ativo. |
| `raizesNordeste.orders` | Envelope versionado com pedidos aprovados, preços históricos, status, resgates e marcador de limpeza do carrinho. O saldo é calculado, não armazenado. |

Exemplo do estado de identificação (sem senhas ou tokens):

```json
{
  "profiles": [{
    "id": "8d8f2c45-d18e-4eb3-9985-51124f5d5e81",
    "name": "Pessoa Fictícia",
    "email": "pessoa@exemplo.test",
    "phone": "",
    "privacyAcknowledged": true,
    "marketing": false
  }],
  "activeEmail": "pessoa@exemplo.test"
}
```

O perfil de teste tem `privacyAcknowledged: false`, pois usar o atalho não simula uma ciência que não foi marcada no formulário. No cadastro, a ciência é exigida; marketing continua independente. O e-mail ativo apenas referencia o perfil: não é um token de autenticação.

Ao carregar, registros com nome, e-mail ou telefone inválidos são descartados, duplicatas são removidas e a identificação ativa só é restaurada se corresponder a um perfil válido. Preferências só são aceitas como booleanos; campos extras são descartados. JSON corrompido é tratado sem interromper o site. Se o armazenamento estiver indisponível, a identificação funciona em memória com aviso. Se uma exclusão não puder ser persistida, o resultado explica a falha e orienta usar as configurações do navegador; não afirma que os dados persistidos foram removidos.

A política demonstrativa está disponível no rodapé, no cadastro, na entrada e no perfil. Descreve os dados utilizados, suas finalidades, armazenamento local, exclusão e limites reais. Não há servidor próprio de cadastro, transmissão de formulários para serviços externos, cookies de marketing, rastreadores implementados ou envio promocional. O provedor de hospedagem serve os arquivos estáticos e pode ter seus próprios registros de acesso; a política da aplicação não pretende descrever as práticas desse provedor.

Os dados ficam neste navegador e nesta origem até serem removidos. Não há sincronização entre dispositivos nem proteção contra outra pessoa usando o mesmo navegador ou alterando o armazenamento. A aplicação não implementa criptografia de dados em repouso, segurança de produção ou garantia de conformidade jurídica integral com a LGPD. Limpar todos os dados do site nas configurações do navegador remove também perfis, unidade e carrinho. Não use informações pessoais reais.

## Identificação a partir do carrinho

Com itens, **Finalizar pedido** leva a `#entrar?origem=carrinho` se não houver perfil ativo. A origem acompanha o link para cadastro e permanece na URL após recarregar, sem expor dados do cliente. Após entrar ou cadastrar, o fluxo continua no checkout em `#finalizacao`. A identificação não altera o estado do carrinho nem seus preços.

Se já houver perfil ativo, o fluxo chega diretamente ao checkout. Acesso direto sem perfil solicita identificação; sem itens, retorna ao carrinho com mensagem. Pelo cabeçalho, cadastro e login retornam à Home. Sair ou excluir um perfil mantém a unidade e os itens e impede concluir uma tentativa em andamento.

## Como testar a Etapa 4

1. Abra `index.html` ou use Live Server. Clique em **Entrar → Criar perfil demonstrativo** e envie vazio: devem aparecer erros junto a nome, e-mail e ciência de privacidade.
2. Teste e-mail inválido e telefone curto. Depois informe dados fictícios válidos, marque apenas a ciência e deixe marketing desmarcado: o cadastro deve concluir e mostrar o primeiro nome no cabeçalho.
3. Recarregue e confira a identificação preservada. Entre no perfil, edite nome, e-mail e telefone e aceite/recuse marketing. Salve e recarregue para conferir a persistência.
4. Saia e tente cadastrar o mesmo e-mail, inclusive com maiúsculas: deve haver erro de duplicidade. Entre escolhendo o perfil local. Teste também o botão da conta fictícia.
5. Preencha parte do cadastro, abra a política e feche por Escape. O foco deve retornar ao botão e os campos devem permanecer preenchidos. Confira também o acesso pelo rodapé e o ciclo de Tab/Shift+Tab.
6. Adicione duas porções de baião em Recife e confira R$ 47,80. Sem identificação, finalize e faça cadastro ou login. O checkout deve manter 2 itens, R$ 47,80 e Recife. Repita já identificado.
7. Saia ou exclua o perfil e confira que unidade e carrinho permanecem. Cancele a exclusão antes de confirmar para testar os dois caminhos. Outros perfis devem continuar disponíveis.
8. Em DevTools, altere `raizesNordeste.identity` para JSON inválido ou inclua um perfil inválido/e-mail ativo inexistente; recarregue e confira a recuperação. Não devem aparecer senhas, tokens ou dados de pagamentos no armazenamento.
9. Teste em 320, 375, 768, 1024 e 1440 px, com teclado e zoom. Confira campos, erros, botões e política sem rolagem horizontal. O carrinho vazio não deve avançar.

### Verificações executadas na Etapa 4

Automação com Playwright e Edge headless do ambiente de desenvolvimento, sem adicionar dependências à aplicação. Foram executados cadastro com campos obrigatórios, formato de e-mail e telefone, duplicidade, ciência e marketing separados, conta fictícia, seleção de perfil local, edição, saída, persistência após recarregar, exclusão/cancelamento e manutenção de outros perfis.

Também foram verificados Home, busca/filtros, detalhes e carrinho; cadastro e os dois caminhos de login a partir do carrinho, preservação exata de seus dados, origem após recarregar, guarda para carrinho vazio e cancelamento da troca de unidade. Foram exercitados JSON corrompido, registros/tipos inválidos, duplicatas, campos extras, perfil ativo inexistente e falhas de armazenamento, incluindo aviso explícito de falha na exclusão.

Entrada, cadastro e perfil foram verificados entre 320 e 1440 px, inclusive com nome longo, sem rolagem horizontal. Política, ciclo de foco, Escape e preservação do formulário foram testados. Abertura direta e HTTP em subdiretório foram exercitados. Não foram observados erros JavaScript nos testes concluídos. Não houve testes em aparelhos físicos, leitores de tela, Safari ou Firefox.

## Etapa 5: checkout e pagamento demonstrativo

O checkout apresenta cliente, unidade, produtos, quantidades, preços unitários, totais por produto e total geral. A modalidade é **Retirada na unidade**, sem frete, delivery ou endereço residencial. **Voltar ao carrinho para editar** permite revisar os itens antes de pagar.

Unidade, identificação, produtos, disponibilidade, quantidades e valores são revalidados no início e ao receber o resultado. Os valores são recalculados em centavos a partir do catálogo; preços do HTML ou do carrinho salvo não são usados. Se os dados mudarem durante a revisão ou o processamento, a tentativa é bloqueada e pede revisão. Itens indisponíveis são identificados no carrinho e podem ser removidos explicitamente.

Escolha **Pix demonstrativo** ou **Cartão demonstrativo**. Não há campos de cartão, CVV, validade, CPF, chave Pix ou dados bancários. O aviso é explícito: **Pagamento demonstrativo. Nenhuma cobrança será realizada.**

No seletor **Demonstração acadêmica: resultado da tentativa**, escolha:

| Resultado | Comportamento esperado |
| --- | --- |
| Aprovação | Salva um pedido, limpa o carrinho e abre a confirmação, preservando unidade e identificação. |
| Recusa | Não cria pedido nem limpa o carrinho; permite trocar o método e tentar novamente. |
| Erro de comunicação simulado | Não presume aprovação; exibe erro, preserva o carrinho e permite tentar novamente. |

`pagamento.js` usa uma `Promise` e atraso de aproximadamente 1,1 segundo, sem requisições HTTP. A interface passa por Pendente, Processando e o resultado explícito. Durante o processamento, botão, métodos e seletor de resultado ficam desabilitados; uma trava lógica também impede envios repetidos. Há indicador visual, `aria-busy` e mensagem em `aria-live`.

Sair da tela, sair do perfil ou recarregar interrompe a tentativa sem presumir aprovação. Alterações de dados relevantes em outra aba recarregam esta interface e interrompem a tentativa. O retorno assíncrono de uma tentativa cancelada não cria pedido. A identificação é verificada novamente antes da gravação.

## Estrutura e persistência dos pedidos

`js/pedidos.js` concentra leitura, validação e gravação em `raizesNordeste.orders`:

```json
{
  "version": 1,
  "orders": [{
    "id": "f6e4aa12-682a-496c-8676-a5c23cfeb056",
    "attemptId": "54232f71-76ce-4918-a0df-ea538764ba08",
    "number": "PED-20260920-0001",
    "createdAt": "2026-09-20T12:00:00.000Z",
    "customer": { "id": "8d8f2c45-d18e-4eb3-9985-51124f5d5e81", "name": "Pessoa Fictícia" },
    "unit": { "id": "recife", "name": "Raízes Recife", "address": "Endereço fictício da unidade" },
    "items": [{ "productId": "baiao-dois", "name": "Baião de dois", "quantity": 2, "unitPrice": 2390 }],
    "total": 4780,
    "method": "pix",
    "paymentStatus": "aprovado",
    "status": "Recebido"
  }],
  "pendingClear": null
}
```

Valores monetários são inteiros em centavos. Nome, unidade, produtos e preços são fotografias dos dados aplicados na compra; a confirmação não depende do preço atual do catálogo. Data é salva em ISO e exibida em pt-BR no horário local do navegador. O número legível é sequencial por data entre os pedidos locais existentes. UUIDs identificam internamente o pedido e a tentativa; salvar novamente o mesmo `attemptId` retorna o registro existente.

Perfis antigos recebem um UUID na restauração. O identificador permanece ao editar e-mail, evitando transferir pedidos a outro perfil com o mesmo e-mail. A confirmação em `#confirmacao?pedido=UUID` só mostra pedidos vinculados ao perfil ativo. Isso organiza a demonstração, mas **não é controle de acesso seguro**: o navegador e seus dados locais são manipuláveis.

O pedido é salvo antes da limpeza do carrinho. `pendingClear` é gravado junto ao pedido e permite recuperar uma limpeza interrompida: no próximo acesso, somente um carrinho que ainda corresponda aos itens comprados é esvaziado. Um carrinho diferente é preservado. Falhas de gravação do pedido mantêm o carrinho e não exibem confirmação; falhas posteriores na limpeza informam que o pedido foi salvo, mas existe uma pendência local. O registro versionado é validado, incluindo valores, status e unicidade. JSON corrompido ou versão desconhecida bloqueia leitura/gravação de pedidos com mensagem, sem substituir silenciosamente o conteúdo.

Excluir o perfil remove também seus pedidos e resgates demonstrativos locais e os pontos derivados, conforme a política atualizada. Sair apenas encerra a identificação e não exclui pedidos. O armazenamento é demonstrativo, sem garantia transacional de servidor, sincronização entre dispositivos ou resistência a adulteração. Para dados corrompidos, revise ou remova a chave de pedidos pelas ferramentas do navegador, sabendo que isso elimina os registros locais.

## Como testar a Etapa 5

1. Execute abrindo `index.html` ou via Live Server. Selecione Recife, adicione duas porções de baião e confira R$ 47,80.
2. Clique em **Finalizar pedido**. Sem perfil, entre com a conta fictícia ou cadastre um perfil; o checkout deve preservar itens e total.
3. Tente confirmar sem método: deve solicitar Pix ou cartão. Escolha um método e **Recusa**; confira processamento, desbloqueio, ausência de pedido e preservação do carrinho.
4. Selecione **Erro de comunicação simulado** e tente novamente: confira erro, carrinho intacto e possibilidade de nova tentativa.
5. Selecione **Aprovação** e confirme. Tente clicar duas vezes: apenas um pedido deve ser salvo. Confira número, data, unidade, cliente, itens, valores, método, status Recebido e carrinho vazio.
6. Recarregue a confirmação: o pedido deve continuar visível. Repita uma compra com o outro método e confira números diferentes. **Acompanhar pedido** abre os detalhes e a linha do tempo implementados na Etapa 6.
7. Recarregue ou saia durante Processando: nenhum pedido deve ser criado por essa tentativa. Carrinho e unidade devem permanecer.
8. Teste a identificação de outro perfil: o endereço de confirmação do primeiro não deve mostrar seus dados. Editar o e-mail do perfil original mantém o vínculo.
9. Em DevTools, simule falha de gravação para `raizesNordeste.orders`: não deve aparecer sucesso e o carrinho deve permanecer. Falhas apenas ao gravar a limpeza do carrinho devem mostrar pendência, recuperável ao recarregar com armazenamento disponível.
10. Teste checkout e confirmação em 320, 375, 768, 1024 e 1440 px. Navegue por teclado e confira mensagens de estado, foco, labels e ausência de rolagem horizontal.

### Verificações executadas na Etapa 5

Testes automatizados com Playwright e Edge headless, por arquivo local e HTTP em subdiretório: fluxo de identificação, cálculo promocional, método obrigatório, Pix e cartão, processamento e bloqueio, recusa, erro, nova tentativa, aprovação, duplo envio e idempotência por tentativa, persistência da confirmação, números únicos e aviso de acompanhamento.

Também foram verificados interrupção por recarga/saída, alteração de preços e disponibilidade, falha ao salvar pedido, recuperação de limpeza do carrinho, JSON/versão inválidos, preços históricos, vínculo após edição de e-mail, isolamento entre perfis e remoção de pedidos ao excluir perfil. Checkout e confirmação foram testados de 320 a 1440 px, sem rolagem horizontal. Não houve erros JavaScript nos testes concluídos nem requisições externas de pagamento. Outros navegadores e aparelhos físicos não foram testados.

## Etapa 6: pedidos e fidelidade

No perfil, acesse **Meus pedidos** ou **Minha fidelidade**. A lista apresenta somente os pedidos do perfil identificado, do mais recente para o mais antigo, com número, data, unidade, total, método e status. Sem pedidos, há uma mensagem e acesso ao cardápio. Acesso sem identificação solicita login ou cadastro e preserva a rota solicitada, inclusive o pedido específico.

**Ver detalhes** e **Acompanhar pedido**, na confirmação, abrem os mesmos dados históricos: cliente, unidade e endereço para retirada, produtos, quantidades, preços registrados, total, pagamento e status. Alterações no catálogo não modificam compras anteriores.

A linha do tempo mostra **Recebido → Em preparação → Pronto para retirada**, com textos de etapa concluída, atual e pendente. **Simular próxima etapa do pedido** avança somente nessa ordem, salva o estado e fica desabilitado ao chegar ao final. Não altera o pagamento nem os valores. Não há comunicação com cozinha ou atualização automática.

### Pontos e resgates

Cada pedido aprovado gera `Math.floor(totalEmCentavos / 100)` pontos. O arredondamento é feito por pedido: R$ 25,90 e R$ 68,50 geram 25 + 68 = 93 pontos. O saldo é a soma desses pontos menos 100 por resgate registrado. Pedidos válidos da Etapa 5 também contam; recarregar, consultar telas e sair/entrar não adiciona pontos. Recusas, erros e carrinhos abandonados não criam pedidos aprovados nem pontos.

Há uma recompensa: **100 pontos = benefício demonstrativo de R$ 10,00**. Com saldo insuficiente, a tela informa quantos pontos faltam e desabilita o botão. Com saldo suficiente, **Resgatar recompensa** abre confirmação; cancelar ou Escape preserva o saldo. Confirmar valida novamente o saldo e o perfil e registra um único resgate, mesmo com duplo clique. O histórico mostra data, pontos, benefício e identificador. O benefício não tem valor real e não aplica desconto no checkout.

O envelope `version: 1` de pedidos aceita agora `redemptions`, uma lista de registros `{id, requestId, customerId, createdAt, points: 100, benefitCents: 1000}`. Registros antigos sem essa propriedade são lidos como lista vazia. UUIDs identificam o resgate e sua solicitação; repetir a mesma solicitação retorna o registro existente. Pedidos e resgates compartilham uma única gravação local, sem saldo redundante. Onde disponível, Web Locks serializa confirmações de resgate entre abas. Isso não substitui transações ou segurança de servidor.

JSON inválido, pedidos incompletos, valores inválidos, resgates duplicados ou saldo inconsistente bloqueiam as operações com mensagem, sem sobrescrever silenciosamente os dados. Falhas de gravação não confirmam o resgate. A interface também impede consultar ou avançar um pedido de outro perfil.

**Sair** conserva pedidos, pontos e recompensas. **Excluir meus dados locais** remove pedidos e resgates do perfil ativo, seus pontos derivados, perfil e preferências, preservando outros perfis e seus registros, carrinho e unidade. A política de privacidade e o diálogo de exclusão descrevem esses dados. Armazenamento local continua manipulável e sem autenticação segura ou sincronização entre dispositivos.

### Como testar a Etapa 6

1. Selecione Recife e compre cinco porções de baião de dois em promoção: R$ 119,50. Aprove o pagamento simulado e abra **Acompanhar pedido**. Confira status Recebido, total histórico e retirada.
2. Avance duas vezes. Confira as três etapas e o botão desabilitado no final. Recarregue: o status deve continuar Pronto para retirada e o pagamento aprovado.
3. Abra o perfil e **Meus pedidos**. Confira ordenação e detalhes. Em **Minha fidelidade**, sem outras compras/resgates, confira 119 pontos.
4. Cancele um resgate e confira saldo inalterado. Confirme outro, inclusive tentando duplo clique: deve existir um benefício de R$ 10,00 e saldo de 19 pontos. Recarregue e confira o mesmo histórico e botão desabilitado.
5. Saia e entre novamente: os dados devem permanecer. Acesse as rotas `#pedidos`, `#pedido?pedido=UUID` e `#fidelidade` sem identificação e confira o retorno após login/cadastro.
6. Use outro perfil fictício: não deve visualizar pedidos ou pontos do primeiro. Exclua um perfil com pedidos e resgates e confira que somente os dados vinculados a ele foram removidos.
7. Repita pagamento recusado ou com erro: nenhum pedido/ponto deve ser criado. Confira que o carrinho permanece disponível.
8. Em F12, ative a simulação de dispositivos e teste 320, 375, 768, 1024 e 1440 px. Confira lista, detalhes, linha do tempo e fidelidade sem rolagem horizontal. Teste Tab, Shift+Tab, Enter, Escape e foco visível.

### Verificações executadas na Etapa 6

Automação com Playwright e Edge headless, sem dependências adicionadas ao projeto: compra pelo cardápio/carrinho, login de demonstração, pagamento recusado e aprovado, acompanhamento pela confirmação, avanço e persistência dos status, limite final, pagamento preservado, pontuação, duplo clique no resgate, saldo insuficiente, persistência e ausência de erros JavaScript.

Também foram usados registros de teste para verificar compatibilidade com pedidos antigos, arredondamento por pedido, ordenação, preços históricos após mudar o catálogo, rejeição de avanço com status desatualizado, idempotência por solicitação, falha de gravação, JSON inválido, pedido incompleto, quantidade negativa e resgate duplicado sem sobrescrever os registros. Cadastro e login preservaram a rota solicitada; isolamento, saída e exclusão seletiva de pedidos/resgates passaram. Home, pedidos, detalhes e fidelidade foram verificados em 320, 375, 768, 1024 e 1440 px sem rolagem horizontal. Escape e retorno do foco no resgate foram verificados.

Abertura por arquivo local e HTTP em subdiretório passou, com recursos locais e sem requisições externas. O ciclo de Tab/Shift+Tab, confirmação por Enter e foco após resgate também foram verificados; a tela móvel foi inspecionada visualmente.

Não foram testados leitores de tela, aparelhos físicos, Safari ou Firefox. Os resultados não constituem certificação de acessibilidade ou segurança.

## Etapa 7: modo Totem e responsividade

O botão **Modo Totem · demonstração acadêmica**, no cabeçalho Web, ativa explicitamente o autoatendimento. Ele funciona em computadores e tablets, sem depender de resolução, tela sensível ao toque ou hardware específico. O endereço utiliza `?modo=totem`; também é possível abrir `index.html?modo=totem` diretamente, inclusive no GitHub Pages. Mudar de modo recarrega a mesma aplicação, com os mesmos produtos, componentes, preços e regras.

### Fluxo de atendimento

1. Na tela de boas-vindas, confira a unidade na faixa superior e clique em **Iniciar pedido**. Sem unidade definida, a seleção existente abre automaticamente. A unidade também pode ser escolhida antes de iniciar.
2. Use busca e categorias, abra **Ver detalhes**, escolha a quantidade e adicione ao carrinho. A troca de unidade com itens pede a mesma confirmação do modo Web; cancelar preserva os itens, confirmar esvazia o carrinho.
3. Abra **Carrinho**, revise quantidades e total e clique em **Finalizar pedido**. Use **Usar conta de demonstração** para identificar-se como **Cliente Totem · totem@exemplo.test**. Não há campos pessoais, senhas, perfis Web listados ou cadastro no Totem.
4. No checkout compartilhado, selecione Pix ou cartão demonstrativo e o resultado da simulação. Aprovação registra o pedido e esvazia somente o carrinho temporário; recusa ou erro mantém os itens e permite tentar novamente.
5. A confirmação mostra número, unidade e endereço de retirada, produtos, valores, pagamento e status Recebido. Ela permanece visível até sua próxima ação; não há encerramento automático ou impressão.
6. Use **Encerrar atendimento** na confirmação para limpar a sessão e voltar às boas-vindas. Durante um atendimento ainda não concluído, o botão da barra superior pede confirmação antes de descartar os dados. Cancelar ou Escape preserva o atendimento.
7. **Sair do modo Totem** retorna à Home Web e restaura o layout normal. Também pede confirmação se houver atendimento em andamento. O cliente do Totem não fica identificado no modo Web.

### Isolamento e persistência

- O carrinho do Totem utiliza o mesmo módulo `carrinho.js`, mas fica somente na memória da página. Não lê nem grava `raizesNordeste.cart`. O carrinho Web anterior permanece salvo e reaparece ao sair.
- A unidade Web salva serve como escolha inicial. Trocas no Totem valem para a página atual e não alteram a unidade do carrinho Web. A unidade permanece entre atendimentos enquanto a página do Totem continuar aberta; ao recarregar, a escolha inicial vem da configuração Web salva.
- `auth.js` não carrega perfis Web no Totem. Cada atendimento identificado recebe um UUID novo e dados exclusivamente fictícios, sem criar um perfil pessoal persistente. Encerrar limpa identificação, carrinho, busca, categoria, resumo, confirmação e escolhas de pagamento; tentativas assíncronas pendentes são canceladas.
- A troca de modo encerra a identificação Web sem excluir perfis, preferências, pedidos ou resgates. Se houver perfil identificado ou itens Web, a ativação explica o comportamento e pede confirmação. Se não for possível gravar o encerramento da identificação, a troca é bloqueada com aviso para evitar restaurá-la inadvertidamente.
- Pedidos aprovados do Totem permanecem em `raizesNordeste.orders`, com o mesmo formato da Etapa 5 e cliente fictício. Como seu carrinho não é persistente, esses pedidos não criam marcador `pendingClear`; assim, a recuperação do pagamento Web não confunde carrinhos com itens iguais. O Totem não apaga pedidos ou recompensas de outros perfis.
- Rotas de perfil, cadastro, histórico e fidelidade não abrem no Totem. Sem atendimento iniciado, endereços antigos voltam às boas-vindas; o próximo cliente não acessa a confirmação anterior. Histórico e fidelidade continuam disponíveis no modo Web para os respectivos perfis.

### Limitações demonstrativas

Recarregar ou fechar a página perde o atendimento temporário, inclusive a possibilidade de reabrir sua confirmação. O navegador pode pedir confirmação ao sair durante um atendimento não concluído; esse aviso depende das regras do próprio navegador. Pedidos já aprovados permanecem armazenados. Ao abrir novamente o Totem, a aplicação sempre começa nas boas-vindas, sem reutilizar cliente ou itens. O retorno pelo cache de navegação também recarrega o estado.

Os pedidos anônimos do Totem não ficam associados aos perfis Web nem possuem uma conta para recuperação posterior. Os registros podem ser inspecionados pelas ferramentas de desenvolvimento e removidos pelas configurações de armazenamento do site; não foi criado um painel administrativo. A fidelidade pessoal é uma experiência do modo Web, sem transferência dos pontos do atendimento anônimo.

Use um atendimento por vez, em uma aba. Não há sincronização de totens, bloqueio de equipamento, proteção contra manipulação do armazenamento, autenticação real, impressora, cobrança ou cozinha conectada. Alterações de dados em outra aba interrompem pagamentos em processamento e exibem aviso no Totem. Sem armazenamento local disponível, não é possível confirmar pedidos; os itens ficam temporariamente disponíveis para nova tentativa. O projeto continua sem dependências, npm, frameworks ou serviços externos.

### Ajustes de interface

O modo é representado por `.totem-mode`. Botões e controles principais têm área de toque de pelo menos 60 px de altura; **Iniciar pedido** tem 80 px. A navegação exibe cardápio, carrinho, encerramento e saída, com fontes e espaçamento maiores. Os cards usam Grid adaptável; a barra utiliza Flexbox com quebra. Modais permitem rolagem vertical em telas baixas. Avisos no Totem ocupam espaço no fluxo para não cobrir os controles.

O modo Web mantém os componentes anteriores, com ajustes de quebra em botões, textos longos e cabeçalho. Foco visível, rótulos, estados textuais, textos alternativos e diálogos operáveis por teclado são compartilhados. Não há dependência de hover ou novas animações.

### Verificações executadas na Etapa 7

Testes automatizados com Playwright e Microsoft Edge headless disponíveis no ambiente de desenvolvimento, sem adicionar dependências de execução ao projeto:

- Regressão Web: Home, busca sem acentos, categorias, cadastro, identificação, carrinho, pagamento aprovado, acompanhamento e resgate de fidelidade.
- Totem: ativação/cancelamento, boas-vindas, seleção e troca de unidade com confirmação, detalhes, quantidades, totais, identificação fictícia, Pix/cartão, aprovação, recusa, erro e nova tentativa.
- Encerramento durante processamento, cancelamento/confirmação de descarte, saída para Web, recarga, proteção de rotas pessoais e limpeza da sessão. Dois atendimentos aprovados receberam identificadores de cliente diferentes e mantiveram os pedidos históricos.
- Preservação do carrinho, unidade e perfis Web, sem exibir os nomes de perfis locais no Totem. Falha simulada ao gravar pedidos manteve o carrinho e não exibiu uma confirmação falsa.
- Abertura por arquivo local e HTTP em subdiretório; fluxo com toque simulado, ciclo de Tab/Shift+Tab, Escape, confirmação por Enter e retorno do foco. As telas de boas-vindas e cardápio foram inspecionadas visualmente.

| Experiência | Resoluções verificadas |
| --- | --- |
| Web: Home, cardápio, carrinho, entrada, cadastro, perfil, checkout, confirmação, pedidos, acompanhamento e fidelidade | 360, 390, 430, 768, 1366 e 1920 px de largura, com 900 px de altura |
| Totem: boas-vindas, cardápio, carrinho, identificação, checkout e confirmação | 360×800, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1080×1920 e 1920×1080 |
| Diálogos de unidade e produto | Mesmas larguras Web e resoluções Totem acima |

Não foi detectada rolagem horizontal nesses testes. Os fluxos concluídos não registraram erros JavaScript; o teste HTTP não encontrou recursos ausentes nem requisições externas. `git diff --check` passou. Não foram testados hardware de Totem, aparelhos físicos, leitores de tela, Safari ou Firefox. Toque foi emulado no navegador; não representa teste em um equipamento real.

### Roteiro manual de conferência

Abra `index.html` ou use Live Server. Ative **Modo Totem**, inicie, selecione Recife e adicione duas porções de baião de dois (R$ 47,80). Finalize usando o cliente fictício, escolha um pagamento demonstrativo e aprove. Confira número, unidade, total, status e retirada; encerre e inicie novamente. O novo carrinho deve estar vazio, a identificação deve ser solicitada novamente e o pedido anterior deve permanecer no armazenamento.

Repita com recusa, troca de unidade e cancelamento do encerramento. Teste a saída para Web com itens e confirme que há um aviso antes do descarte. Em F12, use o modo de dispositivos nas resoluções da tabela, alternando orientação, e confira a navegação por teclado e o acesso aos botões inferiores dos diálogos.

## Planejado para próximas etapas

A **Etapa 8** será dedicada à revisão final, aos testes complementares e à publicação no GitHub Pages. A publicação ainda não foi realizada. A aplicação continua estática, sem npm, back-end, pagamento real, autenticação segura, cozinha integrada ou notificações externas.
