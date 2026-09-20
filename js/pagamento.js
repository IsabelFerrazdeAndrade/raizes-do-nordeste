(() => {
  'use strict';
  const data = window.RaizesNordeste;
  const { money } = data.cart;
  const methodName = (method) => method === 'pix' ? 'Pix demonstrativo' : 'Cartão demonstrativo';

  // Serviço externo fictício: não faz requisições nem recebe dados financeiros.
  function simulate({ method, outcome, attemptId }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!['pix', 'card'].includes(method) || !['approved', 'declined', 'error'].includes(outcome)) {
          reject(new Error('Opção demonstrativa inválida.')); return;
        }
        if (outcome === 'error') reject(new Error('Erro de comunicação simulado.'));
        else resolve({ attemptId, status: outcome });
      }, 1100);
    });
  }

  function init({ cart, getCustomer, getUnit, navigate, announce, onCartChanged }) {
    let generation = 0;
    let busy = false;
    let reviewed = '';
    const form = document.getElementById('payment-form');
    const status = document.getElementById('payment-status');
    const options = document.getElementById('payment-options');
    const submit = document.getElementById('confirm-payment');
    function node(tag, text, className = '') {
      const result = document.createElement(tag);
      result.textContent = text;
      result.className = className;
      return result;
    }
    function setBusy(value) {
      busy = value;
      options.disabled = value;
      submit.disabled = value;
      form.setAttribute('aria-busy', String(value));
      document.getElementById('payment-spinner').hidden = !value;
    }
    function cancel() {
      if (busy) { generation++; setBusy(false); status.textContent = 'Pendente: tentativa interrompida. Nenhuma aprovação foi registrada.'; }
    }
    function context() {
      const customer = getCustomer();
      const unit = getUnit();
      if (!customer || !data.orders.idPattern.test(customer.id)) return { error: 'Identifique-se novamente antes de pagar.' };
      if (!unit || !data.units.some((entry) => entry.id === unit.id)) return { error: 'Selecione uma unidade válida antes de pagar.' };
      const review = cart.review(unit.id);
      if (review.error) return review;
      return { customer, unit, review };
    }
    function fingerprint(value) {
      return JSON.stringify({ customer: value.customer, unit: value.unit, items: value.review.items, total: value.review.total });
    }
    function renderItems(target, items) {
      target.replaceChildren(...items.map((item) => {
        const row = node('article', '', 'checkout-item');
        row.append(node('h3', item.name), node('p', `${item.quantity} × ${money(item.unitPrice)} · Total: ${money(item.quantity * item.unitPrice)}`));
        return row;
      }));
    }

    // O marcador salvo junto ao pedido permite terminar a limpeza após uma falha
    // entre as duas gravações locais, sem apagar um carrinho diferente.
    function recover() {
      try {
        const store = data.orders.read();
        if (!store.pendingClear) return;
        const order = store.orders.find((entry) => entry.id === store.pendingClear);
        const current = cart.snapshot();
        const bought = order.items.map(({ productId, quantity }) => ({ productId, quantity }));
        if (current.unitId === order.unit.id && JSON.stringify(current.items) === JSON.stringify(bought)) {
          if (!cart.clear()) throw new Error('Limpeza pendente.');
          onCartChanged();
        }
        data.orders.acknowledgeClear();
      } catch {
        announce('Não foi possível verificar ou concluir a gravação local dos pedidos. Confira as permissões de armazenamento; nenhuma nova aprovação foi presumida.');
      }
    }

    function showCheckout() {
      recover();
      const value = context();
      reviewed = '';
      form.reset();
      status.textContent = 'Pendente: escolha uma forma de pagamento.';
      document.getElementById('checkout-error').textContent = value.error || '';
      submit.disabled = Boolean(value.error);
      document.getElementById('checkout-items').replaceChildren();
      document.getElementById('next-step-summary').textContent = '';
      if (value.error) return;
      reviewed = fingerprint(value);
      document.getElementById('next-step-customer').textContent = `Cliente: ${value.customer.name} · ${value.customer.email}`;
      document.getElementById('checkout-unit').textContent = `${value.unit.name} · ${value.unit.address}. Retirada na unidade, sem frete.`;
      renderItems(document.getElementById('checkout-items'), value.review.items.map((item) => ({ ...item, name: item.product.name })));
      document.getElementById('next-step-summary').textContent = `Total do pedido: ${money(value.review.total)}`;
    }

    async function pay(event) {
      event.preventDefault();
      if (busy) return;
      const value = context();
      if (value.error) { status.textContent = value.error; return; }
      if (fingerprint(value) !== reviewed) { status.textContent = 'Os dados ou preços mudaram. Volte ao carrinho e revise o pedido antes de pagar.'; return; }
      const method = new FormData(form).get('method');
      const outcome = document.getElementById('payment-outcome').value;
      if (!['pix', 'card'].includes(method)) {
        status.textContent = 'Selecione Pix ou cartão demonstrativo antes de confirmar.';
        form.querySelector('input[name="method"]').focus(); return;
      }
      const attemptId = data.orders.newId();
      const token = ++generation;
      setBusy(true);
      status.textContent = 'Processando pagamento...';
      try {
        const result = await simulate({ method, outcome, attemptId });
        if (token !== generation) return;
        const current = context();
        if (current.error || fingerprint(current) !== reviewed) {
          status.textContent = 'A tentativa foi interrompida porque o perfil, a unidade ou o carrinho mudou. Revise os dados. Nenhum pedido foi criado.'; return;
        }
        if (result.status === 'declined') {
          status.textContent = 'Recusado: pagamento não aprovado nesta simulação. Escolha outra opção ou tente novamente.'; return;
        }
        let order;
        try { order = data.orders.save({ attemptId, ...current, method }); }
        catch {
          status.textContent = 'A simulação retornou aprovação, mas não foi possível registrar o pedido no navegador. Nenhum novo pedido foi confirmado e o carrinho foi mantido. Verifique o armazenamento antes de tentar novamente.'; return;
        }
        if (cart.clear()) {
          try { data.orders.acknowledgeClear(); } catch { /* O marcador permite recuperar no próximo acesso. */ }
        }
        onCartChanged();
        status.textContent = 'Aprovado: pedido demonstrativo registrado.';
        navigate(`#confirmacao?pedido=${order.id}`);
      } catch {
        if (token === generation) status.textContent = 'Erro de comunicação simulado: não foi possível concluir o processamento demonstrativo. Nenhum pedido foi confirmado. Tente novamente.';
      } finally {
        if (token === generation) setBusy(false);
      }
    }

    function showConfirmation(id) {
      const message = document.getElementById('confirmation-message');
      const details = document.getElementById('confirmation-details');
      const track = document.getElementById('track-order');
      details.replaceChildren();
      track.hidden = true;
      document.getElementById('tracking-notice').textContent = '';
      try {
        const store = data.orders.read();
        const order = store.orders.find((entry) => entry.id === id && entry.customer.id === getCustomer()?.id);
        if (!order) { message.textContent = 'Pedido não encontrado para o perfil identificado. Entre no perfil que realizou esta simulação.'; return; }
        message.textContent = store.pendingClear === order.id
          ? 'Pedido demonstrativo registrado. A limpeza persistente do carrinho está pendente; confira o armazenamento e recarregue antes de comprar novamente.'
          : 'Pagamento aprovado na simulação. Seu pedido demonstrativo foi registrado!';
        details.append(node('h2', order.number), node('p', new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))),
          node('p', `Cliente: ${order.customer.name}`), node('p', `Retirada em ${order.unit.name} · ${order.unit.address}`));
        const list = node('div', '');
        renderItems(list, order.items);
        details.append(list, node('p', `Total pago na simulação: ${money(order.total)}`, 'summary-total'), node('p', `Forma de pagamento: ${methodName(order.method)}`), node('p', 'Pagamento: Aprovado · Status do pedido: Recebido'));
        track.hidden = false;
      } catch { message.textContent = 'Não foi possível ler os pedidos locais. O registro pode estar inválido ou o armazenamento indisponível. Nenhum pedido foi presumido como confirmado.'; }
    }
    form.addEventListener('submit', pay);
    document.getElementById('track-order').addEventListener('click', () => {
      document.getElementById('tracking-notice').textContent = 'O acompanhamento completo do pedido e a fidelidade serão desenvolvidos na Etapa 6.';
    });
    return { showCheckout, showConfirmation, cancel, recover };
  }
  data.payment = { simulate, init };
})();
