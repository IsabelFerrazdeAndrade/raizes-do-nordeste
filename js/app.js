(() => {
  'use strict';

  const data = window.RaizesNordeste;
  const storageKey = 'raizesNordeste.unitId';
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const dialog = document.getElementById('unit-dialog');
  const search = document.getElementById('product-search');
  const menuView = document.getElementById('menu-view');
  let selectedUnit = null;
  let category = 'Todos';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function productCard(product) {
    const card = element('article', 'product-card');
    card.dataset.productId = product.id;
    const imageWrap = element('div', 'product-image-wrap');
    const image = element('img');
    Object.assign(image, { src: product.image, alt: product.imageAlt, width: 640, height: 480, loading: 'lazy' });
    imageWrap.append(image);
    const onSale = Number.isFinite(product.promotionalPrice) && product.promotionalPrice < product.price;
    if (onSale || product.tag) imageWrap.append(element('span', 'product-tag', onSale ? 'Promoção' : product.tag));
    const copy = element('div', 'product-copy');
    copy.append(element('h3', '', product.name), element('p', '', product.description));
    const price = element('div', 'product-price');
    if (onSale) {
      price.append(element('span', 'sr-only', 'Preço original: '), element('del', 'original-price', currency.format(product.price)), element('span', 'sr-only', ' Preço promocional: '));
    }
    price.append(element('span', '', currency.format(onSale ? product.promotionalPrice : product.price)));
    copy.append(price);
    card.append(imageWrap, copy);
    return card;
  }

  function storageWarning() {
    const notice = document.getElementById('storage-notice');
    notice.textContent = 'Seu navegador não permitiu salvar a unidade. A escolha vale enquanto esta página estiver aberta.';
    notice.hidden = false;
  }

  function restoreUnit() {
    try {
      const id = localStorage.getItem(storageKey);
      selectedUnit = data.units.find((unit) => unit.id === id) || null;
      if (id !== null && !selectedUnit) {
        localStorage.removeItem(storageKey);
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
    grid.replaceChildren(...products.map(productCard));
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
      button.addEventListener('click', () => {
        selectedUnit = unit;
        try { localStorage.setItem(storageKey, unit.id); } catch { storageWarning(); }
        updateUnitLabel();
        renderMenu();
        dialog.close();
        if (!menuView.hidden) document.getElementById('menu-title').focus();
      });
      card.append(button);
      return card;
    });
    document.getElementById('unit-options').replaceChildren(...options);
    if (!dialog.open) dialog.showModal();
  }

  function route() {
    const isMenu = location.hash === '#cardapio';
    document.getElementById('home-view').hidden = isMenu;
    menuView.hidden = !isMenu;
    document.title = isMenu ? 'Cardápio — Raízes do Nordeste' : 'Raízes do Nordeste — Sabor que acolhe';
    document.querySelectorAll('.header-inner nav a').forEach((link) => {
      if (link.hash === location.hash || (!location.hash && link.hash === '#inicio')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (isMenu) {
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
    .map((id) => data.products.find((product) => product.id === id)).filter(Boolean).map(productCard));

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
  window.addEventListener('hashchange', route);
  const invalidStoredUnit = restoreUnit();
  updateUnitLabel();
  route();
  if (invalidStoredUnit) openUnitSelection(true);
})();
