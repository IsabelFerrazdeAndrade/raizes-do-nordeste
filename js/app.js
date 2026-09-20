(() => {
  'use strict';

  const data = window.RaizesNordeste;
  const storageKey = 'raizesNordeste.unitId';
  const { money, priceCents, onSale, availableProduct, maxQuantity } = data.cart;
  const cart = data.cart.create(storageWarning);
  const dialog = document.getElementById('unit-dialog');
  const search = document.getElementById('product-search');
  const menuView = document.getElementById('menu-view');
  const cartView = document.getElementById('cart-view');
  const productDialog = document.getElementById('product-dialog');
  const switchDialog = document.getElementById('switch-dialog');
  let selectedUnit = null;
  let category = 'Todos';
  let detailProductId = null;
  let detailQuantity = 1;
  let pendingUnit = null;
  let noticeTimer;
  let identity;
  let payment;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function productPrice(product) {
    const price = element('div', 'product-price');
    if (onSale(product)) {
      price.append(element('span', 'sr-only', 'Preço original: '), element('del', 'original-price', money(Math.round(product.price * 100))), element('span', 'sr-only', ' Preço promocional: '));
    }
    price.append(element('span', '', money(priceCents(product))));
    return price;
  }

  function productCard(product, interactive = false) {
    const card = element('article', 'product-card');
    card.dataset.productId = product.id;
    const imageWrap = element('div', 'product-image-wrap');
    const image = element('img');
    Object.assign(image, { src: product.image, alt: product.imageAlt, width: 640, height: 480, loading: 'lazy' });
    imageWrap.append(image);
    if (onSale(product) || product.tag) imageWrap.append(element('span', 'product-tag', onSale(product) ? 'Promoção' : product.tag));
    const copy = element('div', 'product-copy');
    copy.append(element('h3', '', product.name), element('p', '', product.description));
    copy.append(productPrice(product));
    if (interactive) {
      const details = element('button', 'button button-outline product-details-button', 'Ver detalhes');
      details.type = 'button';
      details.setAttribute('aria-label', `Ver detalhes de ${product.name}`);
      details.addEventListener('click', () => openProduct(product.id));
      copy.append(details);
    }
    card.append(imageWrap, copy);
    return card;
  }

  function storageWarning() {
    const notice = document.getElementById('storage-notice');
    notice.textContent = 'O armazenamento local não está disponível. Unidade, carrinho e perfis continuam funcionando nesta página, mas alterações ou exclusões podem não permanecer após recarregar.';
    notice.hidden = false;
  }

  function restoreUnit() {
    try {
      const id = localStorage.getItem(storageKey);
      selectedUnit = data.units.find((unit) => unit.id === id) || null;
      if (id !== null && !selectedUnit) {
        try { localStorage.removeItem(storageKey); } catch { storageWarning(); }
        return true;
      }
    } catch {
      storageWarning();
    }
    return false;
  }

  function updateUnitLabel() {
    document.getElementById('selected-unit').textContent = selectedUnit
      ? `Unidade selecionada: ${selectedUnit.name} · ${selectedUnit.city}/${selectedUnit.state}`
      : 'Nenhuma unidade selecionada';
    document.querySelector('.header-unit').textContent = selectedUnit ? 'Trocar unidade' : 'Escolher unidade';
  }

  function normalize(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
  }

  function renderMenu() {
    const grid = document.getElementById('menu-products');
    const status = document.getElementById('menu-status');
    document.getElementById('menu-controls').hidden = !selectedUnit;
    document.getElementById('menu-title').textContent = selectedUnit ? `Cardápio · ${selectedUnit.name}` : 'Nosso cardápio';
    document.getElementById('menu-unit-details').textContent = selectedUnit
      ? `${selectedUnit.city}/${selectedUnit.state} · ${selectedUnit.address}. Horário fictício: ${selectedUnit.hours}.`
      : 'Cada unidade tem seus próprios sabores.';
    if (!selectedUnit) {
      grid.replaceChildren();
      status.textContent = 'Escolha uma unidade em “Trocar unidade” para consultar o cardápio.';
      return;
    }
    const query = normalize(search.value);
    const products = data.products.filter((product) => selectedUnit.productIds.includes(product.id)
      && (category === 'Todos' || product.category === category)
      && normalize(product.name).includes(query));
    grid.replaceChildren(...products.map((product) => productCard(product, true)));
    status.textContent = products.length
      ? `${products.length} ${products.length === 1 ? 'produto encontrado' : 'produtos encontrados'} em ${selectedUnit.name}.`
      : 'Nenhum produto encontrado para sua busca. Tente outro nome ou selecione a categoria Todos.';
  }

  function openUnitSelection(invalid = false) {
    document.getElementById('dialog-description').textContent = invalid
      ? 'A unidade salva não está mais disponível. Escolha uma nova unidade para continuar.'
      : 'Escolha uma unidade para conhecer os produtos disponíveis. Endereços e horários são fictícios.';
    const options = data.units.map((unit) => {
      const card = element('article', 'unit-option');
      card.append(element('h3', '', `${unit.name} · ${unit.city}/${unit.state}`), element('p', '', unit.address), element('p', '', `Horário fictício: ${unit.hours}`));
      const selected = selectedUnit?.id === unit.id;
      const button = element('button', 'button button-primary', selected ? `Manter ${unit.city} (selecionada)` : `Selecionar ${unit.city}`);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(selected));
      button.addEventListener('click', () => requestUnitChange(unit));
      card.append(button);
      return card;
    });
    document.getElementById('unit-options').replaceChildren(...options);
    if (!dialog.open) dialog.showModal();
  }

  function announce(message) {
    const notice = document.getElementById('app-notice');
    clearTimeout(noticeTimer);
    notice.textContent = message;
    noticeTimer = setTimeout(() => { notice.textContent = ''; }, 6000);
  }

  function requestUnitChange(unit) {
    if (selectedUnit?.id !== unit.id && cart.summary().count > 0) {
      pendingUnit = unit;
      document.getElementById('switch-description').textContent = `Ao trocar para ${unit.name}, seu carrinho atual será esvaziado. Deseja continuar?`;
      switchDialog.showModal();
      return;
    }
    selectUnit(unit);
  }

  function selectUnit(unit) {
    payment?.cancel();
    cart.changeUnit(unit.id);
    selectedUnit = unit;
    try { localStorage.setItem(storageKey, unit.id); } catch { storageWarning(); }
    updateUnitLabel();
    renderMenu();
    renderCart();
    dialog.close();
    if (!menuView.hidden) document.getElementById('menu-title').focus();
    else if (!cartView.hidden) document.getElementById('cart-title').focus();
    if (location.hash === '#finalizacao') navigate('#carrinho');
  }

  // O mesmo controle atende detalhes e carrinho; não aceita texto ou preços do DOM.
  function quantityControl(initial, name, onChange) {
    let quantity = initial;
    const group = element('div', 'quantity-control');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `Quantidade de ${name}`);
    const minus = element('button', 'button button-outline', '−');
    const plus = element('button', 'button button-outline', '+');
    const value = element('output', '', String(quantity));
    value.setAttribute('aria-label', `Quantidade de ${name}`);
    value.setAttribute('aria-live', 'polite');
    minus.type = plus.type = 'button';
    minus.setAttribute('aria-label', `Diminuir quantidade de ${name}`);
    plus.setAttribute('aria-label', `Aumentar quantidade de ${name}`);
    function update() {
      value.textContent = quantity;
      minus.disabled = quantity === 1;
      plus.disabled = quantity === maxQuantity;
    }
    function change(delta) {
      const next = quantity + delta;
      if (next < 1 || next > maxQuantity || onChange(next) === false) return;
      quantity = next;
      update();
    }
    minus.addEventListener('click', () => change(-1));
    plus.addEventListener('click', () => change(1));
    group.append(minus, value, plus);
    update();
    return group;
  }

  function openProduct(productId) {
    const product = availableProduct(selectedUnit?.id, productId);
    if (!product) { announce('Este produto não está disponível na unidade selecionada.'); return; }
    detailProductId = product.id;
    detailQuantity = 1;
    document.getElementById('product-title').textContent = product.name;
    Object.assign(document.getElementById('product-image'), { src: product.image, alt: product.imageAlt });
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-description').textContent = product.fullDescription || product.description;
    document.getElementById('product-detail-price').replaceChildren(productPrice(product));
    document.getElementById('product-error').textContent = '';
    document.getElementById('product-total').textContent = money(priceCents(product));
    document.getElementById('product-quantity').replaceChildren(quantityControl(1, product.name, (quantity) => {
      detailQuantity = quantity;
      document.getElementById('product-total').textContent = money(priceCents(product) * quantity);
      document.getElementById('product-error').textContent = '';
    }));
    productDialog.showModal();
  }

  function updateCartTotals() {
    const summary = cart.summary();
    document.getElementById('cart-count').textContent = summary.count;
    document.getElementById('cart-link').setAttribute('aria-label', `Carrinho, ${summary.count} ${summary.count === 1 ? 'item' : 'itens'}`);
    document.getElementById('cart-subtotal').textContent = money(summary.total);
    document.getElementById('cart-total').textContent = money(summary.total);
    document.getElementById('finish-order').disabled = Boolean(cart.review(selectedUnit?.id).error);
  }

  function cartRow(item) {
    const row = element('article', 'cart-row');
    row.dataset.productId = item.productId;
    const info = element('div', 'cart-row-info');
    info.append(element('h2', '', item.product.name), element('p', '', `Preço unitário: ${money(item.unitPrice)}`));
    const total = element('p', 'cart-row-total', `Total: ${money(item.total)}`);
    const controls = quantityControl(item.quantity, item.product.name, (quantity) => {
      if (!cart.setQuantity(item.productId, quantity)) return false;
      total.textContent = `Total: ${money(priceCents(item.product) * quantity)}`;
      updateCartTotals();
      announce(`Quantidade atualizada. Total do carrinho: ${money(cart.summary().total)}.`);
    });
    const remove = element('button', 'button button-outline remove-item', 'Remover');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remover ${item.product.name}`);
    remove.addEventListener('click', () => {
      const index = cart.summary().items.findIndex((entry) => entry.productId === item.productId);
      cart.remove(item.productId);
      renderCart();
      const buttons = document.querySelectorAll('#cart-items .remove-item');
      (buttons[Math.min(index, buttons.length - 1)] || document.querySelector('#cart-empty a')).focus();
      announce(`${item.product.name} removido do carrinho. Total: ${money(cart.summary().total)}.`);
    });
    row.append(info, controls, total, remove);
    return row;
  }

  function renderCart() {
    const summary = cart.summary();
    const invalid = cart.snapshot().items.filter((item) => !summary.items.some((entry) => entry.productId === item.productId));
    document.getElementById('cart-unit').textContent = selectedUnit
      ? `Retirada em ${selectedUnit.name} · ${selectedUnit.city}/${selectedUnit.state}`
      : 'Selecione uma unidade no cardápio para começar.';
    document.getElementById('cart-empty').hidden = summary.count > 0 || invalid.length > 0;
    document.getElementById('cart-content').hidden = summary.count === 0 && invalid.length === 0;
    document.getElementById('cart-items').replaceChildren(...summary.items.map(cartRow));
    invalid.forEach((item) => {
      const row = element('article', 'cart-row');
      row.append(element('h2', '', 'Item indisponível'), element('p', '', `O produto ${item.productId} não está disponível. Remova-o para continuar.`));
      const remove = element('button', 'button button-outline', 'Remover item indisponível');
      remove.type = 'button';
      remove.addEventListener('click', () => { cart.remove(item.productId); renderCart(); document.getElementById('cart-title').focus(); });
      row.append(remove);
      document.getElementById('cart-items').append(row);
    });
    updateCartTotals();
  }

  function navigate(hash, replace = false) {
    if (location.hash === hash) route();
    else if (replace) { history.replaceState(null, '', hash); route(); }
    else location.hash = hash;
  }

  function completeIdentification() {
    document.getElementById('identity-feedback').textContent = '';
    const query = new URLSearchParams(location.hash.split('?')[1] || '');
    navigate(query.get('origem') === 'carrinho' ? '#finalizacao' : '#inicio');
  }

  function identityEnded(message) {
    payment?.cancel();
    document.getElementById('next-step-customer').textContent = '';
    document.getElementById('identity-feedback').textContent = message;
    navigate('#inicio');
  }

  function route() {
    payment.cancel();
    const [view, queryString = ''] = location.hash.slice(1).split('?');
    const identityViews = {
      entrar: ['login-view', 'login-title'], cadastro: ['register-view', 'register-title'],
      perfil: ['profile-view', 'profile-title'], finalizacao: ['next-step-view', 'next-step-title'],
      confirmacao: ['confirmation-view', 'confirmation-title']
    };
    if (view === 'perfil' && !identity.active()) { navigate('#entrar', true); return; }
    if (view === 'finalizacao') {
      if (!selectedUnit) { navigate('#cardapio', true); return; }
      if (!cart.snapshot().items.length) { announce('Seu carrinho está vazio. Escolha produtos antes de continuar.'); navigate('#carrinho', true); return; }
      if (!identity.active()) { navigate('#entrar?origem=carrinho', true); return; }
    }
    const isMenu = view === 'cardapio';
    const isCart = view === 'carrinho';
    const identityView = identityViews[view];
    if (productDialog.open) productDialog.close();
    document.getElementById('home-view').hidden = isMenu || isCart || Boolean(identityView);
    menuView.hidden = !isMenu;
    cartView.hidden = !isCart;
    Object.entries(identityViews).forEach(([key, [id]]) => { document.getElementById(id).hidden = key !== view; });
    document.title = isCart ? 'Carrinho — Raízes do Nordeste' : isMenu ? 'Cardápio — Raízes do Nordeste' : 'Raízes do Nordeste — Sabor que acolhe';
    if (isCart) document.getElementById('cart-link').setAttribute('aria-current', 'page');
    else document.getElementById('cart-link').removeAttribute('aria-current');
    document.querySelectorAll('.header-inner nav a').forEach((link) => {
      if (link.hash === location.hash || (!location.hash && link.hash === '#inicio')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (identityView) {
      const origin = new URLSearchParams(queryString).get('origem') === 'carrinho' ? '?origem=carrinho' : '';
      document.getElementById('register-link').href = `#cadastro${origin}`;
      document.getElementById('login-link').href = `#entrar${origin}`;
      document.querySelectorAll('.identity-return').forEach((link) => {
        link.href = origin ? '#carrinho' : '#inicio';
        link.textContent = origin ? 'Voltar ao carrinho' : 'Voltar ao início';
      });
      identity.show(view);
      if (view === 'finalizacao') {
        payment.showCheckout();
      }
      if (view === 'confirmacao') payment.showConfirmation(new URLSearchParams(queryString).get('pedido'));
      const title = document.getElementById(identityView[1]);
      document.title = `${title.textContent} — Raízes do Nordeste`;
      title.focus();
    } else if (isCart) {
      renderCart();
      document.getElementById('cart-title').focus();
    } else if (isMenu) {
      renderMenu();
      document.getElementById('menu-title').focus();
      if (!selectedUnit) openUnitSelection();
    } else if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
      else if (location.hash === '#inicio') window.scrollTo(0, 0);
    }
  }

  document.getElementById('featured-products').replaceChildren(...data.featuredProductIds
    .map((id) => data.products.find((product) => product.id === id)).filter(Boolean).map((product) => productCard(product)));

  const filters = ['Todos', ...data.categories].map((name) => {
    const button = element('button', 'button button-outline', name);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(name === category));
    button.addEventListener('click', () => {
      category = name;
      filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
      renderMenu();
    });
    return button;
  });
  document.getElementById('category-buttons').append(...filters);
  search.addEventListener('input', renderMenu);
  document.querySelectorAll('[data-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.feature === 'unit') openUnitSelection();
      else if (location.hash === '#cardapio') route();
      else location.hash = 'cardapio';
    });
  });
  document.getElementById('add-to-cart').addEventListener('click', () => {
    const error = cart.add(selectedUnit?.id, detailProductId, detailQuantity);
    if (error) { document.getElementById('product-error').textContent = error; return; }
    updateCartTotals();
    productDialog.close();
    announce(`${detailQuantity} ${detailQuantity === 1 ? 'unidade adicionada' : 'unidades adicionadas'} ao carrinho. Acesse Carrinho no cabeçalho para revisar.`);
  });
  document.getElementById('cancel-switch').addEventListener('click', () => switchDialog.close());
  switchDialog.addEventListener('close', () => { pendingUnit = null; });
  document.getElementById('confirm-switch').addEventListener('click', () => {
    const unit = pendingUnit;
    if (!unit) return;
    switchDialog.close();
    selectUnit(unit);
    announce('Unidade alterada e carrinho esvaziado.');
  });
  document.getElementById('finish-order').addEventListener('click', () => {
    navigate('#finalizacao');
  });
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('conteudo').focus();
  });
  // Mantém Tab/Shift+Tab nos controles do diálogo, inclusive em navegadores
  // que deixam o foco visitar a interface do navegador ao fim do ciclo nativo.
  document.querySelectorAll('dialog').forEach((modal) => {
    modal.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = [...modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')]
        .filter((control) => control.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });
  window.addEventListener('hashchange', route);
  identity = data.auth.init({ onStorageError: storageWarning, onIdentified: completeIdentification, onExit: identityEnded, announce,
    onDelete: (id) => { try { data.orders.removeCustomer(id); return true; } catch { return false; } }
  });
  const invalidStoredUnit = restoreUnit();
  const repairedCart = cart.restore(selectedUnit?.id);
  payment = data.payment.init({ cart, getCustomer: () => identity.verified(), getUnit: () => selectedUnit, navigate, announce, onCartChanged: updateCartTotals });
  payment.recover();
  if (repairedCart && location.hash.startsWith('#finalizacao')) history.replaceState(null, '', '#carrinho');
  updateUnitLabel();
  updateCartTotals();
  route();
  if (invalidStoredUnit) openUnitSelection(true);
  if (repairedCart) announce('O carrinho salvo foi atualizado: dados inválidos ou incompatíveis com a unidade foram descartados ou corrigidos.');
  window.addEventListener('storage', (event) => {
    if (event.key === null || ['raizesNordeste.identity', 'raizesNordeste.cart', 'raizesNordeste.unitId', 'raizesNordeste.orders'].includes(event.key)) {
      payment.cancel();
      location.reload();
    }
  });
})();
