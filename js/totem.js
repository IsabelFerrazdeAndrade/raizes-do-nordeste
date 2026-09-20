(() => {
  'use strict';
  const enabled = new URLSearchParams(location.search).get('modo') === 'totem';
  function init({ cart, identity, payment, navigate, reset, announce }) {
    let started = false;
    let completed = false;
    let action = null;
    let leaving = false;
    const dialog = document.getElementById('totem-action-dialog');
    document.body.classList.toggle('totem-mode', enabled);
    function ask(callback, description) {
      action = callback;
      document.getElementById('totem-action-description').textContent = description;
      dialog.showModal();
    }
    document.getElementById('confirm-totem-action').addEventListener('click', () => {
      const callback = action;
      action = null;
      dialog.close();
      callback?.();
    });
    dialog.addEventListener('close', () => { action = null; });
    function changeMode(value) {
      // Não restaura uma identificação Web anterior ao sair do equipamento.
      if (!identity.clearSession()) {
        announce('Não foi possível encerrar a identificação salva. Confira as permissões de armazenamento antes de trocar de modo.');
        return;
      }
      leaving = true;
      payment.cancel();
      const url = new URL(location.href);
      if (value) url.searchParams.set('modo', 'totem');
      else url.searchParams.delete('modo');
      url.hash = value ? 'totem' : 'inicio';
      location.assign(url.href);
    }
    function finish(exit = false) {
      const perform = () => {
        payment.cancel();
        cart.clear();
        identity.resetTemporary();
        reset();
        started = false;
        completed = false;
        navigate('#totem', true);
        if (exit) changeMode(false);
      };
      if (started && !completed) ask(perform, 'Encerrar este atendimento? O carrinho e a identificação temporária serão limpos. Pedidos já confirmados serão preservados.');
      else perform();
    }
    document.getElementById('activate-totem').addEventListener('click', () => {
      const enter = () => changeMode(true);
      if (identity.active() || cart.snapshot().items.length) {
        ask(enter, 'Entrar no Modo Totem? Sua identificação Web será encerrada. O carrinho Web ficará salvo separadamente e o Totem começará vazio. Perfis e pedidos serão preservados.');
      } else enter();
    });
    document.querySelectorAll('[data-end-totem]').forEach((button) => button.addEventListener('click', () => finish()));
    document.querySelectorAll('[data-exit-totem]').forEach((button) => button.addEventListener('click', () => finish(true)));
    document.getElementById('start-totem').addEventListener('click', () => {
      const start = () => {
        cart.clear(); identity.resetTemporary(); reset();
        started = true; completed = false;
        navigate('#cardapio');
      };
      if (started) ask(start, 'Iniciar outro atendimento? Os itens e a identificação temporária deste atendimento serão descartados.');
      else start();
    });
    window.addEventListener('beforeunload', (event) => {
      if (enabled && started && !completed && !leaving) { event.preventDefault(); event.returnValue = ''; }
    });
    if (enabled) {
      if (!identity.clearSession()) announce('O Totem não usa perfis Web. Não foi possível salvar o encerramento da identificação Web; confira o armazenamento antes de sair deste modo.');
      identity.resetTemporary();
      history.replaceState(null, '', '#totem');
    }
    function guard(view) {
      if (!enabled) return view === 'totem' ? '#inicio' : null;
      if (!started) return view === 'totem' ? null : '#totem';
      if (view === 'totem') return '#cardapio';
      return ['cardapio', 'carrinho', 'entrar', 'finalizacao', 'confirmacao'].includes(view) ? null : '#cardapio';
    }
    function update(view) {
      document.getElementById('totem-toolbar').hidden = !enabled;
      document.getElementById('totem-end-header').hidden = !started;
      document.getElementById('totem-menu-link').hidden = !started;
      if (enabled) {
        document.getElementById('cart-link').hidden = !started;
        document.querySelector('.header-inner .brand').href = started ? '#cardapio' : '#totem';
        completed = view === 'confirmacao' && Boolean(document.getElementById('confirmation-details').childElementCount) && !cart.snapshot().items.length;
      }
    }
    return { guard, update };
  }
  window.RaizesNordeste.totem = { enabled, init };
})();
