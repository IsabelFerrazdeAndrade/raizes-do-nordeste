(() => {
  'use strict';

  const products = window.RaizesNordeste.featuredProducts;
  const productGrid = document.getElementById('featured-products');
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fragment = document.createDocumentFragment();

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    const imageWrap = document.createElement('div');
    imageWrap.className = 'product-image-wrap';
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.imageAlt;
    image.width = 640;
    image.height = 480;
    image.loading = 'lazy';
    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = product.tag;
    imageWrap.append(image, tag);

    const copy = document.createElement('div');
    copy.className = 'product-copy';
    const title = document.createElement('h3');
    title.textContent = product.name;
    const description = document.createElement('p');
    description.textContent = product.description;
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = currency.format(product.price);
    copy.append(title, description, price);
    card.append(imageWrap, copy);
    fragment.append(card);
  });
  productGrid.append(fragment);

  const dialog = document.getElementById('feature-dialog');
  const messages = {
    menu: { title: 'Nosso cardápio vem aí!', description: 'O cardápio completo será disponibilizado em uma próxima etapa. Por enquanto, conheça os sabores na seção de produtos em destaque da Home.' },
    unit: { title: 'Logo estaremos mais perto.', description: 'A seleção de unidade será disponibilizada em uma próxima etapa. Esta versão apresenta a nossa marca e alguns produtos fictícios.' }
  };

  document.querySelectorAll('[data-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      const message = messages[button.dataset.feature];
      document.getElementById('dialog-title').textContent = message.title;
      document.getElementById('dialog-description').textContent = message.description;
      dialog.showModal();
    });
  });
})();
