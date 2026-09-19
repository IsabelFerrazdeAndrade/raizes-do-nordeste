(() => {
  'use strict';

  const data = window.RaizesNordeste;
  const storageKey = 'raizesNordeste.cart';
  const maxQuantity = 99;
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const findUnit = (id) => data.units.find((unit) => unit.id === id);
  const findProduct = (id) => data.products.find((product) => product.id === id);
  const validQuantity = (quantity) => Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
  const onSale = (product) => Number.isFinite(product.promotionalPrice)
    && product.promotionalPrice >= 0 && product.promotionalPrice < product.price;
  const priceCents = (product) => Math.round((onSale(product) ? product.promotionalPrice : product.price) * 100);
  const money = (cents) => formatter.format(cents / 100);

  function availableProduct(unitId, productId) {
    const unit = findUnit(unitId);
    const product = findProduct(productId);
    return unit?.productIds.includes(productId) && product
      && Number.isSafeInteger(priceCents(product)) && priceCents(product) >= 0 ? product : null;
  }

  // Preços e descrições nunca entram no estado persistido.
  function create(onStorageError) {
    let state = { unitId: null, items: [] };

    function save() {
      try { localStorage.setItem(storageKey, JSON.stringify(state)); }
      catch { onStorageError(); }
    }

    function restore(unitId) {
      state = { unitId: findUnit(unitId)?.id || null, items: [] };
      let raw;
      try { raw = localStorage.getItem(storageKey); }
      catch { onStorageError(); return false; }
      if (raw === null) return false;
      let saved;
      try { saved = JSON.parse(raw); } catch { saved = null; }
      if (saved && state.unitId && saved.unitId === state.unitId && Array.isArray(saved.items)) {
        const quantities = new Map();
        saved.items.forEach((item) => {
          if (!item || !validQuantity(item.quantity) || !availableProduct(state.unitId, item.productId)) return;
          const quantity = Math.min(maxQuantity, (quantities.get(item.productId) || 0) + item.quantity);
          quantities.set(item.productId, quantity);
        });
        state.items = Array.from(quantities, ([productId, quantity]) => ({ productId, quantity }));
      }
      const repaired = JSON.stringify(saved) !== JSON.stringify(state);
      if (repaired) save();
      return repaired;
    }

    function changeUnit(unitId) {
      if (!findUnit(unitId)) return false;
      if (state.unitId !== unitId) {
        state = { unitId, items: [] };
        save();
      }
      return true;
    }

    function add(unitId, productId, quantity) {
      if (!findUnit(unitId) || state.unitId !== unitId) return 'Escolha uma unidade válida antes de adicionar.';
      if (!availableProduct(unitId, productId)) return 'Este produto não está disponível na unidade selecionada.';
      if (!validQuantity(quantity)) return 'Escolha uma quantidade inteira entre 1 e 99.';
      const item = state.items.find((entry) => entry.productId === productId);
      if ((item?.quantity || 0) + quantity > maxQuantity) return 'O limite é de 99 unidades por produto, incluindo as que já estão no carrinho.';
      if (item) item.quantity += quantity;
      else state.items.push({ productId, quantity });
      save();
      return null;
    }

    function setQuantity(productId, quantity) {
      const item = state.items.find((entry) => entry.productId === productId);
      if (!item || !validQuantity(quantity) || !availableProduct(state.unitId, productId)) return false;
      item.quantity = quantity;
      save();
      return true;
    }

    function remove(productId) {
      state.items = state.items.filter((item) => item.productId !== productId);
      save();
    }

    function summary() {
      const items = state.items.map((item) => {
        const product = availableProduct(state.unitId, item.productId);
        return product ? { ...item, product, unitPrice: priceCents(product), total: priceCents(product) * item.quantity } : null;
      }).filter(Boolean);
      return {
        unitId: state.unitId, items,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        total: items.reduce((sum, item) => sum + item.total, 0)
      };
    }

    return { restore, changeUnit, add, setQuantity, remove, summary };
  }

  data.cart = { create, money, priceCents, onSale, availableProduct, maxQuantity };
})();
