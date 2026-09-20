(() => {
  'use strict';

  const storageKey = 'raizesNordeste.identity';
  const demo = { name: 'Cliente Demonstração', email: 'cliente@exemplo.test', phone: '', privacyAcknowledged: false, marketing: false };
  const emailValidator = document.createElement('input');
  emailValidator.type = 'email';

  function validate(values, requireAcknowledgement = false) {
    const text = (value) => typeof value === 'string' ? value.trim() : '';
    const profile = {
      name: text(values.name).replace(/\s+/g, ' '),
      email: text(values.email).toLowerCase(),
      phone: text(values.phone),
      privacyAcknowledged: values.privacyAcknowledged === true,
      marketing: values.marketing === true
    };
    const errors = {};
    emailValidator.value = profile.email;
    if (!profile.name || profile.name.length > 80) errors.name = 'Informe um nome fictício com até 80 caracteres.';
    if (!profile.email) errors.email = 'Informe um e-mail fictício.';
    else if (profile.email.length > 254 || !emailValidator.validity.valid
      || !/^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/.test(profile.email)) errors.email = 'Informe um e-mail válido, como pessoa@exemplo.test.';
    const digits = profile.phone.replace(/\D/g, '');
    const localNumber = digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
    if (profile.phone && (profile.phone.length > 25 || !/^\+?[\d\s().-]+$/.test(profile.phone)
      || (profile.phone.startsWith('+') && (!digits.startsWith('55') || digits.length < 12))
      || !/^[1-9]\d{9,10}$/.test(localNumber))) errors.phone = 'Use DDD e número com 10 ou 11 dígitos; +55 é opcional.';
    if (requireAcknowledgement && !profile.privacyAcknowledged) errors.privacyAcknowledged = 'Confirme a ciência das informações de privacidade. Marketing é opcional.';
    return { profile, errors };
  }

  function init({ onStorageError, onIdentified, onExit, announce }) {
    let state = { profiles: [], activeEmail: null };
    const registerForm = document.getElementById('register-form');
    const profileForm = document.getElementById('profile-form');
    const profileSelect = document.getElementById('local-profile');
    const active = () => state.profiles.find((profile) => profile.email === state.activeEmail) || null;

    // Uma única gravação mantém perfis, preferência e identificação consistentes.
    function persist() {
      try {
        if (state.profiles.length) localStorage.setItem(storageKey, JSON.stringify(state));
        else localStorage.removeItem(storageKey);
        return true;
      } catch { onStorageError(); return false; }
    }

    function restore() {
      let raw;
      try { raw = localStorage.getItem(storageKey); }
      catch { onStorageError(); return; }
      if (raw === null) return;
      let saved;
      try { saved = JSON.parse(raw); } catch { saved = null; }
      if (saved && Array.isArray(saved.profiles)) {
        const emails = new Set();
        saved.profiles.forEach((record) => {
          if (!record || typeof record !== 'object' || Array.isArray(record)) return;
          if (typeof record.name !== 'string' || typeof record.email !== 'string'
            || (record.phone !== undefined && typeof record.phone !== 'string')) return;
          const { profile, errors } = validate(record);
          if (Object.keys(errors).length || emails.has(profile.email)) return;
          emails.add(profile.email);
          state.profiles.push(profile);
        });
        const email = typeof saved.activeEmail === 'string' ? saved.activeEmail.trim().toLowerCase() : null;
        state.activeEmail = emails.has(email) ? email : null;
      }
      if (JSON.stringify(saved) !== JSON.stringify(state)) {
        persist();
        announce('Dados demonstrativos antigos ou inválidos foram corrigidos. Confira os perfis locais antes de entrar.');
      }
    }

    function updateHeader() {
      const profile = active();
      const link = document.getElementById('account-link');
      link.textContent = profile ? `Olá, ${profile.name.split(' ')[0]}` : 'Entrar';
      link.href = profile ? '#perfil' : '#entrar';
      link.setAttribute('aria-label', profile ? `Abrir perfil de ${profile.name}` : 'Entrar na demonstração');
      document.getElementById('header-logout').hidden = !profile;
    }

    function mountForm(form, prefix, editing) {
      form.append(document.getElementById('profile-fields').content.cloneNode(true));
      form.querySelectorAll('input').forEach((input) => {
        input.id = `${prefix}-${input.name}`;
        const label = form.querySelector(`[data-label="${input.name}"]`);
        if (label) label.htmlFor = input.id;
        const error = form.querySelector(`[data-error="${input.name}"]`);
        if (error) {
          error.id = `${input.id}-error`;
          input.setAttribute('aria-describedby', error.id);
        }
      });
      const phoneHint = form.querySelector('[data-phone-hint]');
      phoneHint.id = `${prefix}-phone-hint`;
      form.elements.namedItem('phone').setAttribute('aria-describedby', `${phoneHint.id} ${prefix}-phone-error`);
      const marketingHint = form.querySelector('[data-marketing-hint]');
      marketingHint.id = `${prefix}-marketing-hint`;
      form.elements.namedItem('marketing').setAttribute('aria-describedby', marketingHint.id);
      form.querySelector('.form-submit').textContent = editing ? 'Salvar alterações' : 'Criar perfil demonstrativo';
      if (editing) {
        form.querySelector('.privacy-ack').hidden = true;
        form.elements.namedItem('privacyAcknowledged').required = false;
      }
      form.addEventListener('input', (event) => {
        const error = form.querySelector(`[data-error="${event.target.name}"]`);
        if (error) { error.textContent = ''; event.target.removeAttribute('aria-invalid'); }
      });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitProfile(form, editing);
      });
    }

    function fillForm(form, profile) {
      form.reset();
      form.querySelectorAll('[data-error]').forEach((error) => { error.textContent = ''; });
      form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
      if (!profile) return;
      ['name', 'email', 'phone'].forEach((name) => { form.elements.namedItem(name).value = profile[name]; });
      ['marketing', 'privacyAcknowledged'].forEach((name) => { form.elements.namedItem(name).checked = profile[name]; });
    }

    function submitProfile(form, editing) {
      const previous = active();
      if (editing && !previous) { onExit('Entre em um perfil demonstrativo para editar.'); return; }
      const values = Object.fromEntries(new FormData(form));
      values.marketing = form.elements.namedItem('marketing').checked;
      values.privacyAcknowledged = editing ? previous.privacyAcknowledged : form.elements.namedItem('privacyAcknowledged').checked;
      const { profile, errors } = validate(values, !editing);
      if (state.profiles.some((item) => item.email === profile.email && (!editing || item.email !== previous.email))) {
        errors.email = 'Este e-mail já possui um perfil local. Entre com ele ou use outro e-mail fictício.';
      }
      form.querySelectorAll('[data-error]').forEach((error) => {
        const name = error.dataset.error;
        error.textContent = errors[name] || '';
        form.elements.namedItem(name).setAttribute('aria-invalid', String(Boolean(errors[name])));
      });
      if (Object.keys(errors).length) { form.elements.namedItem(Object.keys(errors)[0]).focus(); return; }
      if (editing) state.profiles = state.profiles.map((item) => item.email === previous.email ? profile : item);
      else state.profiles.push(profile);
      state.activeEmail = profile.email;
      const saved = persist();
      updateHeader();
      if (editing) {
        fillForm(form, profile);
        document.getElementById('profile-status').textContent = saved
          ? 'Perfil atualizado. Sua preferência de marketing foi salva neste navegador.'
          : 'Perfil atualizado nesta página. Não foi possível salvar as alterações no navegador.';
      } else {
        fillForm(form, null);
        onIdentified();
        announce(saved ? 'Perfil demonstrativo criado. Nenhuma conta real foi aberta.' : 'Perfil demonstrativo criado apenas nesta página; o armazenamento não está disponível.');
      }
    }

    function renderLocalProfiles() {
      profileSelect.replaceChildren(new Option('Selecione um perfil', ''));
      state.profiles.forEach((profile) => profileSelect.append(new Option(`${profile.name} · ${profile.email}`, profile.email)));
      document.getElementById('local-profiles-note').textContent = state.profiles.length
        ? 'Selecionar um perfil não verifica a identidade de ninguém. Esta é apenas uma simulação.'
        : 'Nenhum perfil salvo ainda. Use a conta de demonstração ou crie um perfil fictício.';
      document.getElementById('login-error').textContent = '';
      profileSelect.removeAttribute('aria-invalid');
    }

    function identify(email) {
      if (!state.profiles.some((profile) => profile.email === email)) return false;
      state.activeEmail = email;
      persist();
      updateHeader();
      onIdentified();
      return true;
    }

    function logout() {
      state.activeEmail = null;
      const saved = persist();
      fillForm(profileForm, null);
      updateHeader();
      onExit(saved ? 'Identificação encerrada. Perfil, carrinho e unidade foram mantidos.'
        : 'Identificação encerrada nesta página. O navegador não permitiu salvar a saída; o perfil poderá reaparecer ao recarregar.');
    }

    function show(view) {
      if (view === 'entrar') renderLocalProfiles();
      if (view === 'perfil') {
        fillForm(profileForm, active());
        document.getElementById('profile-status').textContent = '';
      }
    }

    mountForm(registerForm, 'register', false);
    mountForm(profileForm, 'profile', true);
    document.getElementById('login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      if (!identify(profileSelect.value)) {
        document.getElementById('login-error').textContent = 'Selecione um perfil local ou use a conta de demonstração.';
        profileSelect.setAttribute('aria-invalid', 'true');
        profileSelect.focus();
      }
    });
    document.getElementById('demo-login').addEventListener('click', () => {
      if (!state.profiles.some((profile) => profile.email === demo.email)) state.profiles.push({ ...demo });
      identify(demo.email);
    });
    document.getElementById('header-logout').addEventListener('click', logout);
    document.getElementById('profile-logout').addEventListener('click', logout);
    document.getElementById('delete-profile').addEventListener('click', () => {
      if (active()) document.getElementById('delete-profile-dialog').showModal();
    });
    document.getElementById('confirm-delete-profile').addEventListener('click', () => {
      if (!active()) return;
      state.profiles = state.profiles.filter((profile) => profile.email !== state.activeEmail);
      state.activeEmail = null;
      const saved = persist();
      fillForm(profileForm, null);
      renderLocalProfiles();
      updateHeader();
      document.getElementById('delete-profile-dialog').close();
      onExit(saved ? 'Perfil e preferência de marketing excluídos. Carrinho e unidade foram mantidos.'
        : 'Perfil removido desta página, mas a exclusão no armazenamento falhou. Para remover os dados persistidos, use as configurações de dados deste site no navegador.');
    });
    document.querySelectorAll('[data-privacy]').forEach((button) => {
      button.addEventListener('click', () => document.getElementById('privacy-dialog').showModal());
    });
    restore();
    updateHeader();
    return { active: () => active() ? { ...active() } : null, show };
  }

  window.RaizesNordeste.auth = { init };
})();
