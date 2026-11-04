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
  card.append(body);
  byId('team-list').append(card);
});
if (byId('team-list').children.length > 0) {
  byId('equipe').hidden = false;
  byId('team-nav').hidden = false;
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
document.querySelectorAll('[data-treatment]').forEach(link => link.addEventListener('click', () => {
  byId('treatment').value = link.dataset.treatment;
  clearResult();
}));
form.addEventListener('input', clearResult);
form.addEventListener('change', clearResult);
form.addEventListener('reset', () => {
  nameInput.setCustomValidity('');
  clearResult();
});
nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));

/* M07 — Gera texto, sem fetch ou envio automático.
 * reportValidity cobre campos obrigatórios; a checagem adicional rejeita só espaços.
 * encodeURIComponent preserva acentos e evita quebrar a query do WhatsApp.
 */
form.addEventListener('submit', event => {
  event.preventDefault();
  nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Informe seu nome.');
  if (!form.reportValidity()) return;
  message.value = `Olá! Meu nome é ${nameInput.value.trim()}. Meu pedido: ${form.elements.requestType.value}. Gostaria de conversar sobre ${form.elements.treatment.value.toLowerCase()}. Preferência de período: ${form.elements.period.value.toLowerCase()}. Podemos verificar a disponibilidade?`;
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
