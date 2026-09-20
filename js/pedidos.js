(() => {
  'use strict';
  const key = 'raizesNordeste.orders';
  const idPattern = /^[a-f0-9-]{36}$/i;
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
    if (!order || !idPattern.test(order.id) || !idPattern.test(order.attemptId) || !/^PED-\d{8}-\d{4,}$/.test(order.number)
      || !text(order.createdAt) || !Number.isFinite(Date.parse(order.createdAt))
      || !order.customer || !idPattern.test(order.customer.id) || !text(order.customer.name)
      || !order.unit || !text(order.unit.id) || !text(order.unit.name) || !text(order.unit.address)
      || !['pix', 'card'].includes(order.method) || order.paymentStatus !== 'aprovado' || order.status !== 'Recebido'
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
    if (raw === null) return { version: 1, orders: [], pendingClear: null };
    const store = JSON.parse(raw);
    if (!store || store.version !== 1 || !Array.isArray(store.orders) || !store.orders.every(valid)
      || new Set(store.orders.map((order) => order.id)).size !== store.orders.length
      || new Set(store.orders.map((order) => order.number)).size !== store.orders.length
      || new Set(store.orders.map((order) => order.attemptId)).size !== store.orders.length
      || (store.pendingClear !== null && !store.orders.some((order) => order.id === store.pendingClear))) {
      throw new Error('Registro local de pedidos inválido.');
    }
    return store;
  }
  function write(store) { localStorage.setItem(key, JSON.stringify(store)); }
  function save({ attemptId, customer, unit, review, method }) {
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
    store.pendingClear = order.id;
    write(store);
    return order;
  }
  function acknowledgeClear() { const store = read(); store.pendingClear = null; write(store); }
  function removeCustomer(id) {
    const store = read();
    store.orders = store.orders.filter((order) => order.customer.id !== id);
    if (!store.orders.some((order) => order.id === store.pendingClear)) store.pendingClear = null;
    write(store);
  }
  window.RaizesNordeste.orders = { newId, idPattern, read, save, acknowledgeClear, removeCustomer };
})();
