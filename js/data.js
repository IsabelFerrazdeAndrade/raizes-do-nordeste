// Catálogo único: unidades referenciam produtos pelos IDs, sem duplicá-los.
window.RaizesNordeste = window.RaizesNordeste || {};
window.RaizesNordeste.products = [
  { id: 'tapioca-carne-sol', category: 'Lanches', name: 'Tapioca de carne de sol', description: 'Tapioca macia, carne de sol desfiada e queijo coalho. Uma combinação da nossa terra.', price: 18.90, image: 'assets/images/tapioca.svg', imageAlt: 'Ilustração de tapioca recheada com carne de sol e queijo coalho.', tag: 'A favorita da casa' },
  { id: 'cuscuz-recheado', category: 'Pratos', name: 'Cuscuz arretado', description: 'Cuscuz de milho com queijo coalho, ovo e um toque de manteiga. Aconchego em cada garfada.', price: 16.90, image: 'assets/images/cuscuz.svg', imageAlt: 'Ilustração de cuscuz de milho servido com ovo e cubos de queijo.', tag: 'Tem gosto de casa' },
  { id: 'suco-caju', category: 'Bebidas', name: 'Suco de caju', description: 'O sabor marcante do caju em um suco bem geladinho. Feito para acompanhar sua pausa.', price: 8.90, image: 'assets/images/caju.svg', imageAlt: 'Ilustração de um copo de suco acompanhado por um caju.', tag: 'Pra refrescar' },
  { id: 'baiao-dois', name: 'Baião de dois', category: 'Pratos', description: 'Arroz e feijão com queijo coalho, carne de sol e cheiro-verde.', price: 27.90, promotionalPrice: 23.90 },
  { id: 'escondidinho', name: 'Escondidinho de carne seca', category: 'Pratos', description: 'Purê de macaxeira com carne seca desfiada e queijo gratinado.', price: 25.90 },
  { id: 'hamburguer-sertanejo', name: 'Hambúrguer sertanejo', category: 'Lanches', description: 'Pão macio, hambúrguer bovino, queijo coalho e cebola dourada.', price: 24.90, promotionalPrice: 21.90 },
  { id: 'tapioca-queijo', name: 'Tapioca de queijo coalho', category: 'Lanches', description: 'Goma de tapioca com queijo coalho e manteiga da terra.', price: 14.90 },
  { id: 'bolo-milho', name: 'Bolo de milho', category: 'Sobremesas', description: 'Uma fatia de bolo de milho fofinho para adoçar sua pausa.', price: 9.90, promotionalPrice: 7.90 },
  { id: 'cartola', name: 'Cartola', category: 'Sobremesas', description: 'Banana dourada com queijo, açúcar e canela.', price: 13.90 },
  { id: 'cocada', name: 'Cocada cremosa', category: 'Sobremesas', description: 'Doce de coco servido em uma porção cremosa.', price: 8.90 },
  { id: 'suco-caja', name: 'Suco de cajá', category: 'Bebidas', description: 'Suco gelado de cajá, com o toque azedinho da fruta.', price: 9.90 },
  { id: 'suco-graviola', name: 'Suco de graviola', category: 'Bebidas', description: 'Suco de graviola de sabor suave, servido bem gelado.', price: 10.90 }
].map((product) => ({
  image: 'assets/images/placeholder.svg',
  imageAlt: `Imagem ilustrativa reservada para ${product.name}.`,
  ...product
}));

window.RaizesNordeste.featuredProductIds = ['tapioca-carne-sol', 'cuscuz-recheado', 'suco-caju'];
window.RaizesNordeste.categories = ['Lanches', 'Pratos', 'Sobremesas', 'Bebidas'];

// A disponibilidade de cada produto é definida somente por estas listas.
window.RaizesNordeste.units = [
  {
    id: 'recife', name: 'Raízes Recife', city: 'Recife', state: 'PE',
    address: 'Rua do Aconchego, 120 — Boa Viagem (endereço fictício)',
    hours: 'Segunda a sábado, das 10h às 22h',
    productIds: ['tapioca-carne-sol', 'cuscuz-recheado', 'suco-caju', 'baiao-dois', 'escondidinho', 'tapioca-queijo', 'bolo-milho', 'cartola', 'suco-caja']
  },
  {
    id: 'salvador', name: 'Raízes Salvador', city: 'Salvador', state: 'BA',
    address: 'Rua dos Sabores, 45 — Rio Vermelho (endereço fictício)',
    hours: 'Terça a domingo, das 11h às 22h',
    productIds: ['tapioca-carne-sol', 'cuscuz-recheado', 'suco-caju', 'hamburguer-sertanejo', 'tapioca-queijo', 'bolo-milho', 'cocada', 'suco-graviola']
  },
  {
    id: 'fortaleza', name: 'Raízes Fortaleza', city: 'Fortaleza', state: 'CE',
    address: 'Avenida da Terra, 230 — Meireles (endereço fictício)',
    hours: 'Todos os dias, das 10h às 23h',
    productIds: ['tapioca-carne-sol', 'cuscuz-recheado', 'suco-caju', 'baiao-dois', 'hamburguer-sertanejo', 'escondidinho', 'cartola', 'cocada', 'suco-caja', 'suco-graviola']
  }
];
