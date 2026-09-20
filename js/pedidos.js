(() => {
  'use strict';
  const key = 'raizesNordeste.orders';
  const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  const isId = (value) => typeof value === 'string' && idPattern.test(value);
  const statuses = ['Recebido', 'Em preparação', 'Pronto para retirada'];
  function newId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  const text = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 254;
  function valid(order) {
    if (!order || !isId(order.id) || !isId(order.attemptId) || !text(order.number) || !/^PED-\d{8}-\d{4,}$/.test(order.number)
      || !text(order.createdAt) || !Number.isFinite(Date.parse(order.createdAt))
      || !order.customer || !isId(order.customer.id) || !text(order.customer.name)
      || !order.unit || !text(order.unit.id) || !text(order.unit.name) || !text(order.unit.address)
      || !['pix', 'card'].includes(order.method) || order.paymentStatus !== 'aprovado' || !statuses.includes(order.status)
      || !Array.isArray(order.items) || !order.items.length || order.items.length > 100) return false;
    const ids = new Set();
    let total = 0;
    for (const item of order.items) {
      if (!item || !text(item.productId) || !text(item.name) || ids.has(item.productId)
        || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
        || !Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0) return false;
      ids.add(item.productId);
      total += item.quantity * item.unitPrice;
    }
    return Number.isSafeInteger(total) && total > 0 && total === order.total;
  }
  function read() {
    const raw = localStorage.getItem(key);
    if (raw === null) return { version: 1, orders: [], redemptions: [], pendingClear: null };
    const store = JSON.parse(raw);
    if (!store || store.version !== 1 || !Array.isArray(store.orders) || !store.orders.every(valid)
      || new Set(store.orders.map((order) => order.id)).size !== store.orders.length
      || new Set(store.orders.map((order) => order.number)).size !== store.orders.length
      || new Set(store.orders.map((order) => order.attemptId)).size !== store.orders.length
      || (store.pendingClear !== null && !store.orders.some((order) => order.id === store.pendingClear))) {
      throw new Error('Registro local de pedidos inválido.');
    }
    store.redemptions = store.redemptions === undefined ? [] : store.redemptions;
    if (!Array.isArray(store.redemptions) || store.redemptions.some((item) => !item || !isId(item.id)
      || !isId(item.requestId) || !isId(item.customerId) || !text(item.createdAt) || !Number.isFinite(Date.parse(item.createdAt))
      || item.points !== 100 || item.benefitCents !== 1000)
      || new Set(store.redemptions.map((item) => item.id)).size !== store.redemptions.length
      || new Set(store.redemptions.map((item) => item.requestId)).size !== store.redemptions.length) throw new Error('Resgates locais inválidos.');
    for (const id of new Set(store.redemptions.map((item) => item.customerId))) {
      if (balance(store, id).available < 0) throw new Error('Saldo local inconsistente.');
    }
    return store;
  }
  function write(store) { localStorage.setItem(key, JSON.stringify(store)); }
  function save({ attemptId, customer, unit, review, method, temporaryCart = false }) {
    const store = read();
    const existing = store.orders.find((order) => order.attemptId === attemptId);
    if (existing) {
      if (existing.customer.id !== customer.id) throw new Error('Tentativa incompatível.');
      return existing;
    }
    if (store.pendingClear) throw new Error('A limpeza do carrinho anterior está pendente.');
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const prefix = `PED-${date}-`;
    const sequence = store.orders.filter((order) => order.number.startsWith(prefix))
      .reduce((max, order) => Math.max(max, Number(order.number.slice(prefix.length))), 0) + 1;
    const order = {
      id: newId(), attemptId, number: `${prefix}${String(sequence).padStart(4,'0')}`, createdAt: now.toISOString(),
      customer: { id: customer.id, name: customer.name },
      unit: { id: unit.id, name: unit.name, address: unit.address },
      items: review.items.map((item) => ({ productId: item.productId, name: item.product.name, quantity: item.quantity, unitPrice: item.unitPrice })),
      total: review.total, method, paymentStatus: 'aprovado', status: 'Recebido'
    };
    if (!valid(order) || store.orders.some((item) => item.id === order.id)) throw new Error('Pedido inválido.');
    store.orders.push(order);
    store.pendingClear = temporaryCart ? null : order.id;
    write(store);
    return order;
  }
  function acknowledgeClear() { const store = read(); store.pendingClear = null; write(store); }
  function removeCustomer(id) {
    const store = read();
    store.orders = store.orders.filter((order) => order.customer.id !== id);
    store.redemptions = (store.redemptions || []).filter((item) => item.customerId !== id);
    if (!store.orders.some((order) => order.id === store.pendingClear)) store.pendingClear = null;
    write(store);
  }
  function balance(store, customerId) {
    const earned = store.orders.filter((order) => order.customer.id === customerId && order.paymentStatus === 'aprovado')
      .reduce((sum, order) => sum + Math.floor(order.total / 100), 0);
    const redemptions = (store.redemptions || []).filter((item) => item.customerId === customerId);
    if (!Number.isSafeInteger(earned)) throw new Error('Pontuação inválida.');
    return { earned, available: earned - redemptions.length * 100, redemptions };
  }
  function advance(id, customerId, expectedStatus) {
    const store = read();
    const order = store.orders.find((entry) => entry.id === id && entry.customer.id === customerId);
    if (!order || order.status !== expectedStatus) throw new Error('Pedido alterado ou indisponível. Reabra os detalhes.');
    const index = statuses.indexOf(order.status);
    if (index >= statuses.length - 1) return order;
    order.status = statuses[index + 1];
    write(store);
    return order;
  }
  function redeem(customerId, requestId) {
    if (!isId(customerId) || !isId(requestId)) throw new Error('Identificação inválida.');
    const store = read();
    const existing = (store.redemptions || []).find((item) => item.requestId === requestId);
    if (existing) {
      if (existing.customerId !== customerId) throw new Error('Resgate incompatível.');
      return existing;
    }
    if (balance(store, customerId).available < 100) throw new Error('Você precisa de pelo menos 100 pontos para resgatar.');
    const redemption = { id: newId(), requestId, customerId, createdAt: new Date().toISOString(), points: 100, benefitCents: 1000 };
    store.redemptions = [...(store.redemptions || []), redemption];
    write(store);
    return redemption;
  }
  function renderDetails(target, order) {
    const add = (tag, text) => { const element = document.createElement(tag); element.textContent = text; target.append(element); };
    const money = window.RaizesNordeste.cart.money;
    target.replaceChildren();
    add('h2', order.number);
    add('p', new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt)));
    add('p', `Cliente: ${order.customer.name}`);
    add('p', `Retirada em ${order.unit.name} · ${order.unit.address}`);
    order.items.forEach((item) => { add('h3', item.name); add('p', `${item.quantity} × ${money(item.unitPrice)} · Total: ${money(item.quantity * item.unitPrice)}`); });
    add('p', `Total pago na simulação: ${money(order.total)}`);
    add('p', `Forma de pagamento: ${order.method === 'pix' ? 'Pix demonstrativo' : 'Cartão demonstrativo'}`);
    add('p', `Pagamento: Aprovado · Status do pedido: ${order.status}`);
  }
  window.RaizesNordeste.orders = { newId, idPattern, read, save, acknowledgeClear, removeCustomer, statuses, balance, advance, redeem, renderDetails };
})();
