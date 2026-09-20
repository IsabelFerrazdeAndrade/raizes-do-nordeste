(() => {
  'use strict';
  const data = window.RaizesNordeste;
  const orders = data.orders;
  const date = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  const node = (tag, text, className = '') => { const result = document.createElement(tag); result.textContent = text; result.className = className; return result; };
  function init({ getCustomer }) {
    let currentOrder = null;
    let request = null;
    let processing = false;
    const dialog = document.getElementById('reward-dialog');
    const confirm = document.getElementById('confirm-reward');
    function customer() { const value = getCustomer(); if (!value) throw new Error('Identifique-se novamente para continuar.'); return value; }
    function showOrders() {
      const list = document.getElementById('orders-list');
      const message = document.getElementById('orders-message');
      list.replaceChildren();
      try {
        const profile = customer();
        const entries = orders.read().orders.filter((order) => order.customer.id === profile.id)
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.number.localeCompare(a.number));
        message.textContent = entries.length ? `${entries.length} pedido(s) demonstrativo(s) de ${profile.name}.` : 'Você ainda não tem pedidos. Conheça os sabores do nosso cardápio!';
        entries.forEach((order) => {
          const card = node('article', '', 'identity-card');
          const link = node('a', 'Ver detalhes', 'button button-outline');
          link.href = `#pedido?pedido=${order.id}`;
          link.setAttribute('aria-label', `Ver detalhes do pedido ${order.number}`);
          card.append(node('h2', order.number), node('p', date(order.createdAt)), node('p', order.unit.name),
            node('p', `${data.cart.money(order.total)} · ${order.method === 'pix' ? 'Pix demonstrativo' : 'Cartão demonstrativo'}`), node('p', `Status: ${order.status}`), link);
          list.append(card);
        });
      } catch { message.textContent = 'Não foi possível carregar seus pedidos. Confira a identificação e o armazenamento local; registros inválidos não são exibidos.'; }
    }
    function showOrder(id) {
      const details = document.getElementById('order-details');
      const timeline = document.getElementById('order-timeline');
      const message = document.getElementById('order-message');
      const button = document.getElementById('advance-order');
      details.replaceChildren(); timeline.replaceChildren(); button.hidden = true; currentOrder = null;
      try {
        const order = orders.read().orders.find((entry) => entry.id === id && entry.customer.id === customer().id);
        if (!order) { message.textContent = 'Pedido não encontrado para este perfil demonstrativo.'; return; }
        currentOrder = order;
        orders.renderDetails(details, order);
        const index = orders.statuses.indexOf(order.status);
        orders.statuses.forEach((status, step) => {
          const label = step < index ? 'Concluída' : step === index ? 'Etapa atual' : 'Pendente';
          const item = node('li', '', step === index ? 'current-step' : '');
          item.append(node('strong', status), node('span', label));
          if (step === index) item.setAttribute('aria-current', 'step');
          timeline.append(item);
        });
        message.textContent = `Status atual: ${order.status}.`;
        button.hidden = false; button.disabled = index === orders.statuses.length - 1;
        button.textContent = button.disabled ? 'Pedido pronto para retirada' : 'Simular próxima etapa do pedido';
      } catch { message.textContent = 'Não foi possível ler este pedido. Confira a identificação e os dados locais.'; }
    }
    function showLoyalty() {
      const message = document.getElementById('loyalty-message');
      const list = document.getElementById('redemptions-list');
      const button = document.getElementById('redeem-reward');
      button.disabled = true; list.replaceChildren();
      document.getElementById('loyalty-balance').textContent = 'Saldo indisponível';
      document.getElementById('loyalty-customer').textContent = '';
      document.getElementById('loyalty-missing').textContent = '';
      message.textContent = '';
      try {
        const profile = customer();
        const summary = orders.balance(orders.read(), profile.id);
        document.getElementById('loyalty-customer').textContent = profile.name;
        document.getElementById('loyalty-balance').textContent = `Você possui ${summary.available} pontos.`;
        document.getElementById('loyalty-missing').textContent = summary.available < 100
          ? `Faltam ${100 - summary.available} pontos para resgatar.` : 'Você já pode resgatar um benefício demonstrativo.';
        button.disabled = summary.available < 100;
        if (!summary.redemptions.length) list.append(node('p', 'Você ainda não realizou resgates.'));
        summary.redemptions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).forEach((entry) => {
          const card = node('article', '', 'identity-card');
          card.append(node('h3', 'Benefício demonstrativo de R$ 10,00'), node('p', `${date(entry.createdAt)} · 100 pontos utilizados`), node('p', `Identificador: ${entry.id}`), node('p', 'Registrado apenas para demonstração; não aplicado ao checkout.'));
          list.append(card);
        });
      } catch { message.textContent = 'Não foi possível calcular um saldo confiável. Confira o perfil e os registros locais de pedidos e resgates. Nenhum resgate está disponível enquanto houver inconsistências.'; }
    }
    document.getElementById('advance-order').addEventListener('click', () => {
      if (!currentOrder) return;
      try { orders.advance(currentOrder.id, customer().id, currentOrder.status); showOrder(currentOrder.id); }
      catch { document.getElementById('order-message').textContent = 'Não foi possível atualizar o status. O avanço não foi confirmado; reabra o pedido e confira o armazenamento.'; }
    });
    document.getElementById('redeem-reward').addEventListener('click', () => {
      try {
        const profile = customer();
        if (orders.balance(orders.read(), profile.id).available < 100) { showLoyalty(); return; }
        request = { customerId: profile.id, id: orders.newId() };
        confirm.disabled = false;
        dialog.showModal();
      } catch { showLoyalty(); }
    });
    dialog.addEventListener('close', () => { request = null; });
    confirm.addEventListener('click', async () => {
      if (processing || !request) return;
      processing = true; confirm.disabled = true;
      const pending = request;
      const redeem = () => {
        if (!dialog.open || request !== pending || customer().id !== pending.customerId) throw new Error('Identificação alterada.');
        return orders.redeem(pending.customerId, pending.id);
      };
      try {
        if (navigator.locks) await navigator.locks.request('raizesNordeste.reward', redeem);
        else redeem();
        dialog.close(); showLoyalty();
        document.getElementById('loyalty-message').textContent = 'Resgate registrado! 100 pontos foram deduzidos e seu benefício demonstrativo de R$ 10,00 está listado abaixo.';
      } catch {
        dialog.close(); showLoyalty();
        document.getElementById('loyalty-message').textContent = 'Não foi possível registrar o resgate. Confira o saldo, a identificação e o armazenamento e tente novamente. Nenhum novo benefício foi confirmado.';
      } finally {
        processing = false; confirm.disabled = false;
        if (!document.getElementById('loyalty-view').hidden) document.getElementById('loyalty-title').focus();
      }
    });
    return { showOrders, showOrder, showLoyalty };
  }
  data.loyalty = { init };
})();
