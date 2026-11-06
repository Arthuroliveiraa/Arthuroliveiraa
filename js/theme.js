/* Tema compartilhado. Executa no head para aplicar a escolha antes da pintura. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'aura-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const isTheme = value => value === 'light' || value === 'dark';
  let preference = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (isTheme(saved)) preference = saved;
  } catch { /* A escolha continua funcionando quando o armazenamento é bloqueado. */ }

  function applyTheme() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
    });
    const browserColor = getComputedStyle(root).getPropertyValue('--color-browser').trim()
      || (theme === 'dark' ? '#0E1916' : '#14665E');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', browserColor);
    document.dispatchEvent(new CustomEvent('aura:themechange', { detail: { theme } }));
  }

  applyTheme();
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(storageKey, preference); } catch { /* Preferência apenas nesta página. */ }
        applyTheme();
      });
    });
    applyTheme();
  }, { once: true });
  system.addEventListener('change', () => { if (!preference) applyTheme(); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = isTheme(event.newValue) ? event.newValue : null;
    applyTheme();
  });
})();
