'use strict';

/* M01 — Leitura defensiva da configuração pública.
 * textContent mantém os valores como texto, inclusive se contiverem sinais de HTML.
 * Telefones só geram URLs depois de normalizados e validados como números brasileiros.
 */
const config = window.CLINIC_CONFIG || {};
// M12 — Ausência de configuração mantém o modo demonstrativo por padrão.
// Valores de contato preenchidos acidentalmente não ativam canais neste modo.
const demoMode = config.demoMode !== false;
const textValue = value => typeof value === 'string' ? value.trim() : '';
const normalizePhone = value => textValue(value).replace(/\D/g, '');
const validPhone = value => /^55[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(value);
const whatsapp = normalizePhone(config.whatsapp);
const phone = normalizePhone(config.phone);
const hasContact = !demoMode && validPhone(whatsapp);
const byId = id => document.getElementById(id);

// T09–T12 — Destinos explícitos e mídia local; configuração nunca vira HTML.
function safeHttps(value, hosts) {
  try {
    const url = new URL(textValue(value));
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (hosts && !hosts.includes(url.hostname)) return '';
    return url.href;
  } catch { return ''; }
}
function localImage(value) {
  const path = textValue(value);
  return /^assets\/(?:[\w.-]+\/)*[\w.-]+\.(?:avif|webp|png|jpe?g|svg)$/i.test(path)
    && !path.split('/').some(part => part === '.' || part === '..') ? path : '';
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/* M02 — Menu mobile progressivo.
 * Sem JS a lista continua visível. Com JS, o CSS passa a controlar a abertura.
 * Escape devolve o foco ao botão; sair do menu por Tab fecha a lista.
 */
const menu = byId('menu');
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
menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header-nav')) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.header-nav')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    closeMenu();
    toggle.focus();
  }
});
// Evita manter estado de abertura antigo ao alternar entre desktop e celular.
window.matchMedia('(max-width: 960px)').addEventListener('change', closeMenu);
document.documentElement.classList.add('js');

/* T06 — Seção atual, inclusive em rolagem manual e navegação por teclado.
 * Mede os alvos existentes; seções sem item no menu não recebem destaque falso.
 */
const sectionLinks = [...menu.querySelectorAll('a[href^="#"]')];
let navigationFrame = false;
function updateNavigation() {
  navigationFrame = false;
  const marker = document.querySelector('.header-nav').getBoundingClientRect().bottom + 24;
  sectionLinks.forEach(link => {
    const target = byId(link.hash.slice(1));
    const bounds = target?.getBoundingClientRect();
    const current = target && !target.hidden && bounds.top <= marker && bounds.bottom > marker;
    link.classList.toggle('active', Boolean(current));
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleNavigationUpdate() {
  if (!navigationFrame) {
    navigationFrame = true;
    requestAnimationFrame(updateNavigation);
  }
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('hashchange', scheduleNavigationUpdate);
document.fonts?.ready.then(scheduleNavigationUpdate);
scheduleNavigationUpdate();

/* M04 — Filtros: visibilidade, botão selecionado e anúncio da quantidade.
 * São botões de filtro (aria-pressed), pois não se comportam como abas de conteúdo.
 */
const filterButtons = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  let visible = 0;
  cards.forEach(card => {
    card.hidden = button.dataset.filter !== 'todos' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) visible += 1;
  });
  byId('filter-status').textContent = `${visible} ${visible === 1 ? 'tratamento disponível' : 'tratamentos disponíveis'}.`;
}));
byId('treatment-filters').hidden = false;

/* M06 — Equipe opcional: a seção e o link só aparecem com dados mínimos reais.
 * Não cria pessoas, fotos, títulos ou registros de exemplo na interface.
 */
const team = !demoMode && Array.isArray(config.team) ? config.team : [];
team.forEach(member => {
  if (!member || !textValue(member.name) || !textValue(member.cro)) return;
  const card = document.createElement('article');
  card.className = 'team-card';
  const body = document.createElement('div');
  body.className = 'team-body';
  const name = document.createElement('h3');
  name.textContent = textValue(member.name);
  const role = document.createElement('p');
  role.textContent = textValue(member.role);
  const registration = document.createElement('p');
  registration.className = 'team-cro';
  registration.textContent = textValue(member.cro);
  body.append(name, role, registration);
  const photo = localImage(member.photo);
  if (photo) {
    const wrapper = element('div', 'team-img-wrap');
    const image = document.createElement('img');
    image.src = photo;
    image.alt = `Retrato de ${textValue(member.name)}`;
    image.width = 480;
    image.height = 540;
    image.loading = 'lazy';
    wrapper.append(image);
    card.append(wrapper);
  }
  if (textValue(member.bio)) body.append(element('p', 'team-bio', textValue(member.bio)));
  const qualifications = Array.isArray(member.qualifications) ? member.qualifications.map(textValue).filter(Boolean).slice(0, 8) : [];
  if (qualifications.length) {
    const details = element('details', 'team-qualifications');
    const list = document.createElement('ul');
    qualifications.forEach(qualification => list.append(element('li', '', qualification)));
    details.append(element('summary', '', 'Formação e trajetória'), list);
    body.append(details);
  }
  card.append(body);
  byId('team-list').append(card);
});
if (byId('team-list').children.length > 0) {
  byId('equipe').hidden = false;
  byId('team-nav').hidden = false;
}

/* T09 — Galeria conceitual na demonstração; mídia real depende de autorização. */
if (!demoMode) {
  const gallery = Array.isArray(config.gallery) ? config.gallery.filter(item => item && item.authorized === true
    && localImage(item.src) && textValue(item.alt) && textValue(item.title)) : [];
  byId('gallery-list').replaceChildren();
  byId('gallery-list').classList.add('is-configured');
  gallery.forEach(item => {
    const figure = element('figure', 'space-card');
    const link = document.createElement('a');
    link.href = localImage(item.src);
    link.dataset.gallery = '';
    link.setAttribute('aria-label', `Ampliar ${textValue(item.title)}`);
    const image = document.createElement('img');
    image.src = localImage(item.src);
    image.alt = textValue(item.alt);
    image.width = 800;
    image.height = 600;
    image.loading = 'lazy';
    link.append(image);
    const caption = document.createElement('figcaption');
    caption.append(element('span', '', textValue(item.title)));
    if (textValue(item.caption)) caption.append(element('small', '', textValue(item.caption)));
    figure.append(link, caption);
    byId('gallery-list').append(figure);
  });
  byId('espaco').hidden = gallery.length === 0;
  byId('gallery-nav').hidden = gallery.length === 0;
  if (gallery.length) {
    byId('gallery-title').textContent = 'Conheça o espaço.';
    byId('gallery-description').textContent = 'Ambientes da clínica, apresentados com imagens autorizadas.';
  }
}
const galleryDialog = byId('gallery-dialog');
let galleryOpener;
byId('gallery-list').addEventListener('click', event => {
  const link = event.target.closest('[data-gallery]');
  if (!link || !galleryDialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  galleryOpener = link;
  const image = link.querySelector('img');
  byId('gallery-dialog-image').src = image.src;
  byId('gallery-dialog-image').alt = image.alt;
  const caption = link.closest('figure').querySelector('figcaption');
  byId('gallery-dialog-title').textContent = caption.querySelector('span').textContent;
  byId('gallery-dialog-caption').textContent = [...caption.children].map(child => child.textContent).join(' · ');
  document.body.classList.add('modal-open');
  galleryDialog.showModal();
});
galleryDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  byId('gallery-dialog-image').removeAttribute('src');
  galleryOpener?.focus({ preventScroll: true });
});
galleryDialog.addEventListener('click', event => {
  if (event.target !== galleryDialog) return;
  const bounds = galleryDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) galleryDialog.close();
});

/* T11 — Sem média inventada nem widget remoto. Cada relato aponta para a fonte. */
const reviewHosts = ['google.com', 'www.google.com', 'google.com.br', 'www.google.com.br', 'maps.google.com', 'maps.app.goo.gl', 'g.page', 'share.google'];
const reviews = !demoMode && Array.isArray(config.reviews) ? config.reviews : [];
reviews.forEach(review => {
  if (!review || review.authorized !== true || !textValue(review.author) || !textValue(review.text)) return;
  const source = safeHttps(review.sourceUrl, reviewHosts);
  if (!source) return;
  const card = element('article', 'verified-review');
  if (Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5) {
    const rating = element('p', 'review-rating', '★'.repeat(review.rating));
    rating.setAttribute('aria-label', `${review.rating} de 5 estrelas`);
    card.append(rating);
  }
  const quote = document.createElement('blockquote');
  quote.append(element('p', '', textValue(review.text)));
  card.append(quote, element('p', 'review-author', textValue(review.author)));
  const date = textValue(review.date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date) {
    const time = element('time', 'review-date', new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date)));
    time.dateTime = date;
    card.append(time);
  }
  const link = element('a', 'text-link', 'Ver avaliação original ↗');
  link.href = source;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `Ver avaliação original de ${textValue(review.author)} (abre em nova aba)`);
  card.append(link);
  byId('reviews-list').append(card);
});
if (byId('reviews-list').children.length) {
  byId('avaliacoes').hidden = false;
  byId('reviews-nav').hidden = false;
}

/* T12 — O provedor real controla disponibilidade e confirmação, fora da demo. */
const booking = config.booking || {};
const bookingUrl = !demoMode ? safeHttps(booking.url) : '';
if (bookingUrl) {
  byId('booking-platform-link').href = bookingUrl;
  byId('booking-platform').hidden = false;
  if (textValue(booking.provider)) byId('booking-provider-description').textContent = `Consulte os horários disponíveis em ${textValue(booking.provider)}.`;
}

/* M08/M09 — Dados administrativos, localização e meios de contato.
 * O Google Maps recebe apenas o endereço, codificado na URL.
 * Nenhum mapa ou widget externo é carregado automaticamente.
 */
const configuredText = demoMode ? {} : {
  'clinic-address': config.address,
  'clinic-hours': config.hours,
  'clinic-accessibility': config.accessibility,
  'insurance-info': config.insuranceInfo,
  'cancellation-info': config.cancellationInfo
};
Object.entries(configuredText).forEach(([id, value]) => {
  if (textValue(value)) byId(id).textContent = textValue(value);
});
if (!demoMode && textValue(config.address)) {
  byId('map-link').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(textValue(config.address))}`;
  byId('map-link').hidden = false;
}
if (hasContact) {
  byId('contact-whatsapp').href = `https://wa.me/${whatsapp}`;
  byId('contact-whatsapp').hidden = false;
  byId('contact-status').textContent = 'A mensagem será aberta no WhatsApp. Revise e envie para conversar com a equipe.';
}
if (!demoMode && validPhone(phone)) {
  byId('contact-phone').href = `tel:+${phone}`;
  byId('contact-phone').hidden = false;
}
if (!demoMode && (hasContact || validPhone(phone))) {
  byId('contact-availability').textContent = 'Use um dos canais abaixo para consultar horários e confirmar sua visita.';
}

/* M07/M10 — Solicitação local e invalidação do resultado.
 * Qualquer mudança elimina a mensagem anterior e sua URL para impedir envio desatualizado.
 * Limpar também remove o resultado do DOM; não altera a área de transferência.
 */
const form = byId('booking-form');
const result = byId('request-result');
const message = byId('message');
const send = byId('send-message');
const nameInput = byId('name');
function clearResult() {
  result.hidden = true;
  message.value = '';
  send.hidden = true;
  send.removeAttribute('href');
  byId('copy-status').textContent = '';
}
function updateTreatmentSelection() {
  const selection = byId('treatment').value;
  document.querySelectorAll('[data-treatment]').forEach(link => link.closest('.treatment-card').classList.toggle('is-selected', link.dataset.treatment === selection));
  byId('treatment-selection').textContent = selection === 'Avaliação geral' ? '' : `Seu interesse: ${selection}. Você pode revisar a escolha abaixo.`;
}
document.querySelectorAll('[data-treatment]').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  byId('treatment').value = link.dataset.treatment;
  clearResult();
  updateTreatmentSelection();
  requestAnimationFrame(() => byId('treatment').focus({ preventScroll: true }));
}));
byId('treatment').addEventListener('change', updateTreatmentSelection);
form.addEventListener('input', clearResult);
form.addEventListener('change', clearResult);
form.addEventListener('reset', () => {
  nameInput.setCustomValidity('');
  clearResult();
  selectedDemoSlot = '';
  slotButtons.forEach(button => { button.disabled = true; button.setAttribute('aria-pressed', 'false'); });
  byId('schedule-feedback').textContent = 'Escolha uma data para experimentar.';
  requestAnimationFrame(updateTreatmentSelection);
});
nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));

/* T12 — Simulação explícita, sem reserva, persistência ou disponibilidade real. */
const demoDate = byId('demo-date');
const slotButtons = [...document.querySelectorAll('[data-slot]')];
let selectedDemoSlot = '';
if (demoMode) {
  const today = new Date();
  demoDate.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  byId('schedule-demo').hidden = false;
} else demoDate.disabled = true;
demoDate.addEventListener('input', () => {
  selectedDemoSlot = '';
  const enabled = demoMode && Boolean(demoDate.value) && demoDate.validity.valid;
  slotButtons.forEach(button => { button.disabled = !enabled; button.setAttribute('aria-pressed', 'false'); });
  byId('schedule-feedback').textContent = enabled ? 'Escolha um horário fictício para a simulação.' : 'Escolha uma data válida para experimentar.';
});
demoDate.addEventListener('invalid', () => { byId('schedule-demo').open = true; });
slotButtons.forEach(button => button.addEventListener('click', () => {
  if (!demoMode || !demoDate.value || !demoDate.validity.valid) return;
  selectedDemoSlot = button.dataset.slot;
  slotButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  byId('schedule-feedback').textContent = `Horário de exemplo selecionado: ${selectedDemoSlot}. Nenhuma consulta foi reservada.`;
  clearResult();
}));

/* M07 — Gera texto, sem fetch ou envio automático.
 * reportValidity cobre campos obrigatórios; a checagem adicional rejeita só espaços.
 * encodeURIComponent preserva acentos e evita quebrar a query do WhatsApp.
 */
form.addEventListener('submit', event => {
  event.preventDefault();
  nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Informe seu nome.');
  if (!form.reportValidity()) return;
  message.value = `Olá! Meu nome é ${nameInput.value.trim()}. Meu pedido: ${form.elements.requestType.value}. Gostaria de conversar sobre ${form.elements.treatment.value.toLowerCase()}. Preferência de período: ${form.elements.period.value.toLowerCase()}. Podemos verificar a disponibilidade?`;
  if (demoMode && selectedDemoSlot && demoDate.value && demoDate.validity.valid) {
    const [year, month, day] = demoDate.value.split('-');
    message.value += `

[SIMULAÇÃO, SEM RESERVA] Data de exemplo: ${day}/${month}/${year}, às ${selectedDemoSlot}.`;
  }
  if (hasContact) {
    send.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message.value)}`;
    send.hidden = false;
  }
  result.hidden = false;
  message.focus();
});

/* M07 — Área de transferência com alternativa manual para permissões negadas.
 * Se o usuário limpar/alterar o formulário enquanto aguarda, não exibe status antigo.
 */
byId('copy-message').addEventListener('click', async () => {
  const textToCopy = message.value;
  const status = byId('copy-status');
  try {
    await navigator.clipboard.writeText(textToCopy);
    if (!result.hidden && message.value === textToCopy) {
      status.textContent = 'Mensagem copiada. Nenhuma solicitação foi enviada automaticamente.';
    }
  } catch {
    if (!result.hidden && message.value === textToCopy) {
      message.focus();
      message.select();
      status.textContent = 'Copie o texto selecionado pelo menu do dispositivo ou Ctrl+C.';
    }
  }
});
byId('prepare').disabled = false;

/* M11 — Ano e identificação institucional. Dados incompletos ficam ocultos. */
byId('year').textContent = new Date().getFullYear();

/* M11 — Ícones locais no rodapé; links só são ativados para perfis configurados.
 * HTTPS e domínios conhecidos evitam destinos inesperados na configuração pública.
 */
function enableSocialLink(id, href, label) {
  const link = byId(id);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.removeAttribute('aria-disabled');
  link.setAttribute('aria-label', `${label} (abre em nova aba)`);
}
if (!demoMode) {
  const socialLinks = config.socialLinks || {};
  const networks = [
    ['instagram', 'Instagram', ['instagram.com', 'www.instagram.com']],
    ['facebook', 'Facebook', ['facebook.com', 'www.facebook.com', 'm.facebook.com']]
  ];
  networks.forEach(([key, label, hosts]) => {
    try {
      const url = new URL(textValue(socialLinks[key]));
      if (url.protocol === 'https:' && hosts.includes(url.hostname) && !url.username && !url.password) {
        enableSocialLink(`footer-${key}`, url.href, label);
      }
    } catch { /* Sem URL válida, preserva apenas o ícone. */ }
  });
  if (hasContact) enableSocialLink('footer-whatsapp', `https://wa.me/${whatsapp}`, 'WhatsApp');
}

const responsible = config.responsibleProfessional || {};
if (!demoMode && textValue(responsible.name) && textValue(responsible.cro)) {
  byId('responsible-info').textContent = `Responsável técnico: ${textValue(responsible.name)} — ${textValue(responsible.cro)}`;
  byId('responsible-info').hidden = false;
}
/* M12 — Modo real é explícito; mantém os fallbacks de implantação anterior.
 * O aviso de portfólio nunca é removido por publicationReady no modo demonstrativo.
 */
if (!demoMode) {
  byId('demo-banner').hidden = true;
  document.title = 'Aura | Odontologia contemporânea';
  document.querySelector('meta[name="description"]').content = 'Aura Odontologia: conheça os tratamentos, saiba como preparar sua primeira visita e solicite uma avaliação.';
  byId('contact-description').textContent = 'Confira as informações antes de se deslocar.';
  if (!textValue(config.address)) byId('clinic-address').textContent = 'Endereço em atualização.';
  if (!textValue(config.hours)) byId('clinic-hours').textContent = 'Horários em atualização. Confirme com a equipe.';
  if (!textValue(config.accessibility)) byId('clinic-accessibility').textContent = 'Consulte a equipe sobre acessibilidade e acesso ao local.';
  if (!hasContact) byId('contact-status').textContent = 'Contato em configuração. Você pode preparar e copiar sua mensagem; nenhum dado será enviado por este site.';
  if (!hasContact && !validPhone(phone)) byId('contact-availability').textContent = 'Os canais de contato serão disponibilizados após a confirmação dos dados da clínica.';
  byId('publication-notice').textContent = 'Site em preparação. Dados institucionais pendentes.';
  if (config.publicationReady === true) byId('publication-notice').hidden = true;
}
