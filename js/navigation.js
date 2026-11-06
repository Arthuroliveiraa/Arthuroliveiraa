/* Navegação inicial: aplica o layout móvel antes da primeira pintura.
 * Arquivo síncrono no head; sem JS ou se o arquivo não carregar, os links
 * permanecem expostos. O menu funciona independentemente do formulário.
 */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menu');
    const toggle = document.querySelector('.menu-toggle');
    function closeMenu() {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('click', event => { if (!event.target.closest('.header-nav')) closeMenu(); });
    document.addEventListener('focusin', event => { if (!event.target.closest('.header-nav')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); toggle.focus(); }
    });
    window.matchMedia('(max-width: 960px)').addEventListener('change', closeMenu);
  }, { once: true });
})();
