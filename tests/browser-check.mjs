/**
 * Verificação funcional M02/M04/M06–M11 em navegador real, sem bibliotecas extras.
 * Usa Edge/Chrome em modo headless via Chrome DevTools Protocol (CDP).
 * Executar: node tests/browser-check.mjs
 * Opcional: variável BROWSER_PATH apontando para um navegador compatível.
 * Os dados abaixo são sintéticos e existem somente no servidor local de teste.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm, access, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// M13 — Permite testar também a distribuição isolada que será publicada.
const siteRoot = process.env.AURA_SITE_ROOT ? resolve(process.env.AURA_SITE_ROOT) : root;
const pause = ms => new Promise(done => setTimeout(done, ms));
const candidates = [process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean);
let browserPath;
for (const candidate of candidates) {
  try { await access(candidate); browserPath = candidate; break; } catch { /* Tenta o próximo caminho. */ }
}
assert.ok(browserPath, 'Defina BROWSER_PATH para um Edge/Chrome instalado.');

// Servidor restrito à raiz do projeto. Nenhum fixture modifica a configuração real.
const fixture = {
  demoMode: false,
  whatsapp: '+55 (11) 99999-0000', phone: '+55 (11) 3333-0000',
  address: 'Rua de teste, 123 & bloco A', hours: 'Segunda\n09h às 18h',
  accessibility: 'Informação sintética de acesso', insuranceInfo: 'Convênio de teste',
  cancellationInfo: 'Política de teste', team: [
    { name: '<b>Profissional de teste</b>', role: 'Atuação de teste', cro: 'CRO-TESTE 000',
      photo: 'assets/illustrations/aura-smile.svg', bio: 'Biografia <em>sintética</em>', qualifications: ['Formação de teste <b>local</b>'] },
    { name: 'Cadastro incompleto' }
  ], responsibleProfessional: { name: 'Responsável de teste', cro: 'CRO-TESTE 001' },
  publicationReady: true,
  gallery: [
    { src: 'assets/gallery/recepcao.svg', alt: 'Imagem de teste', title: '<b>Recepção de teste</b>', caption: 'Legenda sintética', authorized: true },
    { src: 'assets/gallery/consultorio.svg', alt: 'Outro ambiente de teste', title: 'Consultório de teste', authorized: true },
    { src: 'https://example.org/photo.jpg', alt: 'Externa', title: 'Não renderizar', authorized: true },
    { src: 'assets/gallery/acolhimento.svg', alt: 'Sem autorização', title: 'Não renderizar', authorized: false }
  ],
  reviews: [
    { author: '<b>Pessoa de teste</b>', text: 'Relato <em>sintético</em>', sourceUrl: 'https://www.google.com/maps/reviews?test=1', rating: 5, date: '2026-11-06', authorized: true },
    { author: 'Sem autorização', text: 'Não renderizar', sourceUrl: 'https://g.page/test', authorized: false },
    { author: 'Destino inválido', text: 'Não renderizar', sourceUrl: 'javascript:alert(1)', authorized: true },
    { author: 'Domínio semelhante', text: 'Não renderizar', sourceUrl: 'https://www.google.com.example.org/test', authorized: true }
  ],
  booking: { url: 'https://agenda.example.org/clinica?source=site', provider: 'Plataforma de teste' }
};
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const configured = url.pathname.startsWith('/configured/');
    const invalid = url.pathname.startsWith('/invalid/');
    const demo = url.pathname.startsWith('/demo/');
    const pathname = url.pathname.replace(/^\/(configured|invalid|demo)\//, '/');
    const target = resolve(siteRoot, `.${decodeURIComponent(pathname === '/' ? '/index.html' : pathname)}`);
    if (!target.startsWith(siteRoot + sep)) { res.writeHead(403).end(); return; }
    if ((configured || invalid || demo) && pathname === '/js/config.js') {
      const data = configured ? fixture : demo ? { ...fixture, demoMode: true } : { demoMode: false, whatsapp: 'javascript:alert(1)', phone: '5500999990000', booking: { url: 'https://user:password@agenda.example.org/' } };
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
      res.end(`window.CLINIC_CONFIG = ${JSON.stringify(data)};`);
      return;
    }
    const body = await readFile(target);
    const type = mime[extname(target)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type.startsWith('text/') ? `${type}; charset=utf-8` : type });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'aura-browser-check-'));
const browser = spawn(browserPath, ['--headless', '--disable-gpu', '--no-first-run',
  '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
{ windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let spawnError;
let browserStderr = '';
// M13 — Inicialização pode ser mais lenta no runner Linux; guarda diagnóstico limitado.
browser.stderr.on('data', chunk => { browserStderr = (browserStderr + chunk.toString()).slice(-4000); });
browser.on('error', error => { spawnError = error; });
let socket;

try {
  // O navegador escolhe uma porta livre e a escreve no perfil temporário.
  let port;
  for (let i = 0; i < 300; i++) {
    if (spawnError) throw spawnError;
    if (browser.exitCode !== null) throw new Error(`O navegador encerrou com código ${browser.exitCode}: ${browserStderr}`);
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await pause(100); }
  }
  assert.ok(port, `O navegador não iniciou o CDP em 30 segundos. ${browserStderr}`);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((done, reject) => { socket.addEventListener('open', done); socket.addEventListener('error', reject); });
  let serial = 0;
  const pending = new Map();
  const exceptions = [];
  const externalRequests = [];
  const failedResources = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') exceptions.push(data.params.exceptionDetails.text);
    if (data.method === 'Network.responseReceived' && data.params.response.status >= 400) {
      failedResources.push(`${data.params.response.status} ${data.params.response.url}`);
    }
    if (data.method === 'Network.requestWillBeSent' && /^https?:/.test(data.params.request.url)
      && !data.params.request.url.startsWith(origin + '/')) externalRequests.push(data.params.request.url);
    const task = pending.get(data.id);
    if (task) {
      clearTimeout(task.timer);
      pending.delete(data.id);
      data.error ? task.reject(new Error(data.error.message)) : task.done(data.result);
    }
  });
  function call(method, params = {}) {
    return new Promise((done, reject) => {
      const id = ++serial;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 10000);
      pending.set(id, { done, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const answer = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (answer.exceptionDetails) throw new Error(JSON.stringify(answer.exceptionDetails));
    return answer.result.value;
  }
  async function navigate(path, scripted = true) {
    await call('Page.navigate', { url: origin + path });
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`document.URL === ${JSON.stringify(origin + path)} && document.readyState === 'complete' && ${scripted ? "document.querySelector('#prepare')?.disabled === false" : 'true'}`)) {
        await evaluate('document.fonts.ready.then(() => true)');
        return;
      }
      await pause(50);
    }
    throw new Error(`Página não ficou pronta: ${path}`);
  }
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await navigate('/');
  const primaryToken = await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()");
  // Fontes e ilustração precisam carregar de verdade, sem fallback silencioso.
  assert.equal(await evaluate(`(() => {
    const loaded = [...document.fonts].filter(face => face.status === 'loaded');
    return ['Playfair Display', 'Plus Jakarta Sans'].every(name => loaded.some(face => face.family.includes(name)))
      && document.fonts.check('italic 500 16px "Playfair Display"')
      && document.querySelector('.hero-artwork').naturalWidth > 0;
  })()`), true, 'As fontes locais ou a ilustração não carregaram');
  // M12 — O aviso aparece na versão de portfólio e o formulário continua utilizável.
  assert.equal(await evaluate("document.querySelector('#demo-banner').hidden"), false);
  assert.match(await evaluate("document.querySelector('#contact-status').textContent"), /Demonstração/);

  // T07 — A imagem social existe e mantém as dimensões declaradas nos metadados.
  const cover = await readFile(join(siteRoot, 'assets/social/aura-preview.png'));
  assert.equal(cover.subarray(1, 4).toString(), 'PNG');
  assert.deepEqual([cover.readUInt32BE(16), cover.readUInt32BE(20)], [1200, 630]);
  assert.equal(await evaluate("document.querySelector('meta[property=\"og:image\"]').content.endsWith('/assets/social/aura-preview.png')"), true);
  assert.equal(await evaluate("document.querySelector('meta[name=\"twitter:card\"]').content"), 'summary_large_image');

  // Integridade do HTML: IDs únicos, âncoras existentes e labels dos campos.
  assert.deepEqual(await evaluate(`(() => {
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
    return {
      uniqueIds: ids.length === new Set(ids).size,
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.getElementById(link.hash.slice(1))).length,
      unlabelledFields: [...document.querySelectorAll('input, select, textarea')].filter(field => !field.labels.length).length
    };
  })()`), { uniqueIds: true, brokenAnchors: 0, unlabelledFields: 0 });

  // Capturas opcionais para inspeção visual, sempre fora do conteúdo publicado.
  if (process.env.AURA_SCREENSHOT_DIR) {
    await mkdir(process.env.AURA_SCREENSHOT_DIR, { recursive: true });
    for (const width of [1440, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      const { data } = await call('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(process.env.AURA_SCREENSHOT_DIR, `aura-${width}.png`), Buffer.from(data, 'base64'));
    }
  }

  // M02/M11 — Quebras de layout: inclui limites próximos aos breakpoints e tela de 320px.
  for (const width of [1440, 1024, 961, 960, 769, 768, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow horizontal em ${width}px`);
  }
  await evaluate("document.querySelector('.menu-toggle').click()");
  assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), 'true');
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), 'false');
  assert.equal(await evaluate("document.querySelector('#menu .btn').getClientRects().length"), 0, 'Botão do menu fechado continua visível');

  // T06 — O menu acompanha a rolagem real, sem dois itens atuais simultaneamente.
  await evaluate("document.getElementById('tratamentos').scrollIntoView({behavior:'instant'})");
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  assert.equal(await evaluate("document.querySelector('#menu [aria-current=location]').hash"), '#tratamentos');
  assert.equal(await evaluate("document.querySelectorAll('#menu [aria-current=location]').length"), 1);

  // T09 — Galeria acessível: modal, Escape, devolução de foco e imagem local.
  await evaluate("document.querySelector('[data-gallery]').focus(); document.querySelector('[data-gallery]').click()");
  assert.equal(await evaluate("document.querySelector('#gallery-dialog').open"), true);
  assert.equal(await evaluate("document.querySelector('#gallery-dialog-image').alt.length > 0"), true);
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  assert.equal(await evaluate("document.querySelector('#gallery-dialog').open"), false);
  assert.equal(await evaluate("document.activeElement.hasAttribute('data-gallery')"), true);

  // T12 — Agenda de demonstração nunca produz uma reserva nem um link externo.
  assert.equal(await evaluate("document.querySelector('#schedule-demo').hidden"), false);
  assert.equal(await evaluate("document.querySelector('#booking-platform').hidden"), true);
  await evaluate("(() => { document.querySelector('#schedule-demo').open=true; const date=document.querySelector('#demo-date'); date.value='2099-11-20'; date.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('[data-slot=\"11:00\"]').click(); document.querySelector('#name').value='Pessoa de teste'; document.querySelector('#booking-form').requestSubmit(); })()");
  assert.match(await evaluate("document.querySelector('#message').value"), /SIMULAÇÃO, SEM RESERVA/);
  assert.match(await evaluate("document.querySelector('#message').value"), /20\/11\/2099, às 11:00/);
  assert.equal(await evaluate("document.querySelector('#send-message').hasAttribute('href')"), false);
  await evaluate("(() => { const date=document.querySelector('#demo-date'); date.value='2099-11-21'; date.dispatchEvent(new Event('input',{bubbles:true})); })()");
  assert.equal(await evaluate("document.querySelector('#request-result').hidden"), true);
  assert.equal(await evaluate("document.querySelectorAll('[data-slot][aria-pressed=true]').length"), 0);
  await evaluate("document.querySelector('#booking-form').reset(); document.querySelector('#schedule-demo').open=false");

  // M04/M07 — Filtrar, transferir interesse, gerar, invalidar e limpar solicitação.
  await evaluate("document.querySelector('[data-filter=estetica]').click()");
  assert.equal(await evaluate("document.querySelectorAll('[data-category]:not([hidden])').length"), 2);
  assert.match(await evaluate("document.querySelector('#filter-status').textContent"), /2 tratamentos/);
  await evaluate("document.querySelector('[data-treatment=\"Ortodontia\"]').click()");
  assert.equal(await evaluate("document.querySelector('#treatment').value"), 'Ortodontia');
  assert.match(await evaluate("document.querySelector('#treatment-selection').textContent"), /Ortodontia/);
  await evaluate("document.querySelector('#name').value = '   '; document.querySelector('#booking-form').requestSubmit()");
  assert.equal(await evaluate("document.querySelector('#request-result').hidden"), true);
  await evaluate("document.querySelector('#name').value = 'Ana & João'; document.querySelector('#name').dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('#booking-form').requestSubmit()");
  assert.match(await evaluate("document.querySelector('#message').value"), /Ana & João/);
  assert.equal(await evaluate("document.querySelector('#send-message').hidden"), true);
  await evaluate("document.querySelector('#period').value = 'Tarde'; document.querySelector('#period').dispatchEvent(new Event('change', {bubbles:true}))");
  assert.equal(await evaluate("document.querySelector('#message').value"), '');
  await evaluate("document.querySelector('#booking-form').requestSubmit(); document.querySelector('#booking-form').reset()");
  assert.equal(await evaluate("document.querySelector('#name').value + document.querySelector('#message').value"), '');

  // M06/M09 — Dados configurados: renderização segura, mapas e contatos corretos.
  await navigate('/configured/index.html');
  assert.equal(await evaluate("document.querySelector('#demo-banner').hidden"), true);
  assert.equal(await evaluate("document.querySelectorAll('#team-list article').length"), 1);
  assert.equal(await evaluate("document.querySelector('#team-list b')"), null);
  assert.equal(await evaluate("document.querySelector('#equipe').hidden"), false);
  assert.equal(await evaluate("document.querySelectorAll('#team-list img').length"), 1);
  assert.equal(await evaluate("document.querySelector('#team-list .team-bio').textContent"), 'Biografia <em>sintética</em>');
  assert.equal(await evaluate("document.querySelector('#team-list .team-bio em')"), null);
  assert.equal(await evaluate("document.querySelectorAll('#team-list .team-qualifications li').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('#gallery-list figure').length"), 2);
  assert.equal(await evaluate("document.querySelector('#gallery-list b')"), null);
  assert.equal(await evaluate("document.querySelectorAll('#reviews-list article').length"), 1);
  assert.equal(await evaluate("document.querySelector('#reviews-list b, #reviews-list em')"), null);
  assert.equal(await evaluate("document.querySelector('#avaliacoes').hidden"), false);
  assert.equal(await evaluate("document.querySelector('#reviews-list .text-link').hostname"), 'www.google.com');
  assert.equal(await evaluate("document.querySelector('#booking-platform-link').href"), fixture.booking.url);
  assert.equal(await evaluate("document.querySelector('#booking-platform').hidden"), false);
  assert.equal(await evaluate("document.querySelector('#schedule-demo').hidden"), true);
  for (const width of [1440, 1024, 961, 960, 769, 768, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow no modo configurado em ${width}px`);
  }
  assert.equal(await evaluate("document.querySelector('#contact-phone').getAttribute('href')"), 'tel:+551133330000');
  const map = new URL(await evaluate("document.querySelector('#map-link').href"));
  assert.equal(map.searchParams.get('query'), fixture.address);
  assert.equal(await evaluate("document.querySelector('#responsible-info').hidden"), false);
  await evaluate("document.querySelector('#name').value = 'Ana & João'; document.querySelector('#booking-form').requestSubmit()");
  const sendUrl = new URL(await evaluate("document.querySelector('#send-message').href"));
  assert.equal(sendUrl.host, 'wa.me');
  assert.equal(sendUrl.searchParams.get('text'), await evaluate("document.querySelector('#message').value"));

  // M07 — Negativa de acesso ao clipboard mantém alternativa manual sem erro global.
  await evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async()=>{throw new Error('Permissão negada no teste')}}}); document.querySelector('#copy-message').click()");
  assert.match(await evaluate("document.querySelector('#copy-status').textContent"), /Ctrl\+C/);
  await navigate('/invalid/index.html');
  assert.equal(await evaluate("document.querySelector('#contact-whatsapp').hidden && document.querySelector('#contact-phone').hidden"), true);
  assert.equal(await evaluate("document.querySelector('#booking-platform').hidden && document.querySelector('#espaco').hidden && document.querySelector('#avaliacoes').hidden"), true);

  // M12 — Mesmo com dados preenchidos, o modo demo não ativa contatos ou identificação.
  await navigate('/demo/index.html');
  assert.equal(await evaluate("['contact-whatsapp','contact-phone','map-link','equipe','responsible-info'].every(id => document.getElementById(id).hidden)"), true);
  assert.equal(await evaluate("document.querySelector('#publication-notice').hidden"), false);
  assert.equal(await evaluate("document.querySelector('#avaliacoes').hidden && document.querySelector('#booking-platform').hidden"), true);
  assert.equal(await evaluate("document.querySelectorAll('#gallery-list figure').length"), 3);
  assert.match(await evaluate("document.querySelector('#gallery-description').textContent"), /não representam uma clínica real/);
  await evaluate("document.querySelector('#name').value = 'Pessoa de teste'; document.querySelector('#booking-form').requestSubmit()");
  assert.equal(await evaluate("document.querySelector('#send-message').hasAttribute('href')"), false);

  // M02/M04 — Sem JS: navegação utilizável e controles dependentes de JS ocultos.
  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await navigate('/', false);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#menu')).visibility"), 'visible');
  assert.equal(await evaluate("document.querySelector('#treatment-filters').hidden"), true);
  assert.equal(await evaluate("document.querySelector('#prepare').disabled"), true);
  assert.equal(await evaluate("document.querySelector('[data-theme-toggle]').hidden"), true);
  assert.equal(await evaluate("document.querySelectorAll('[data-gallery]').length"), 3);
  assert.equal(await evaluate("document.querySelector('#schedule-demo').hidden"), true);

  // Guia sem scripts: documentação e exemplos continuam disponíveis.
  await navigate('/design-system.html', false);
  assert.equal(await evaluate("document.querySelectorAll('.ds-sidebar nav a').length"), 7);
  assert.equal(await evaluate("[...document.querySelectorAll('[data-copy-token]')].every(button => button.hidden)"), true);
  await evaluate("document.querySelector('.ds-code summary').click()");
  assert.equal(await evaluate("document.querySelector('.ds-code').open"), true);

  // Guia com scripts: os tokens vêm do CSS e o feedback distingue sucesso e falha.
  await call('Emulation.setScriptExecutionDisabled', { value: false });
  await navigate('/design-system.html', false);
  assert.equal(await evaluate("document.querySelector('[data-token-value]').textContent"), primaryToken);
  assert.equal(await evaluate("document.querySelectorAll('[data-contrast-pass=true]').length"), 6);
  assert.deepEqual(await evaluate(`(() => {
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
    return {
      uniqueIds: ids.length === new Set(ids).size,
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.getElementById(link.hash.slice(1))).length,
      unlabelledFields: [...document.querySelectorAll('input, select, textarea')].filter(field => !field.labels.length).length
    };
  })()`), { uniqueIds: true, brokenAnchors: 0, unlabelledFields: 0 });
  for (const width of [1440, 1024, 961, 960, 769, 768, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow no guia em ${width}px`);
  }
  await evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async value=>{window.dsCopied=value}}}); document.querySelector('[data-copy-token]').click()");
  assert.equal(await evaluate('window.dsCopied'), `--color-primary: ${primaryToken};`);
  assert.match(await evaluate("document.querySelector('#ds-feedback').textContent"), /Token copiado/);
  await evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async()=>{throw new Error('Negado no teste')}}}); document.querySelector('[data-copy-token]').click()");
  assert.match(await evaluate("document.querySelector('#ds-feedback').textContent"), /Copie manualmente/);
  await evaluate("document.querySelector('[data-demo]').click()");
  assert.match(await evaluate("document.querySelector('#ds-feedback').textContent"), /exemplo de interação/);
  if (process.env.AURA_SCREENSHOT_DIR) {
    for (const width of [1440, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await evaluate("document.getElementById('fundamentos').scrollIntoView({ behavior: 'instant' }); document.getElementById('ds-feedback').textContent = ''");
      const { data } = await call('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(process.env.AURA_SCREENSHOT_DIR, `design-system-${width}.png`), Buffer.from(data, 'base64'));
    }
  }
  // Tema: ação por teclado, persistência, atualização do guia e preferência do sistema.
  await evaluate("document.querySelector('[data-theme-toggle]').focus()");
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
  assert.equal(await evaluate("document.querySelector('[data-theme-toggle]').getAttribute('aria-pressed')"), 'true');
  assert.equal(await evaluate("localStorage.getItem('aura-theme')"), 'dark');
  assert.equal(await evaluate("document.querySelectorAll('[data-contrast-pass=true]').length"), 6);
  assert.equal(await evaluate("document.querySelector('[data-token-value]').textContent"), '#8ACDBC');
  for (const width of [1440, 1024, 961, 960, 769, 768, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow no guia escuro em ${width}px`);
  }
  await navigate('/');
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
  assert.equal(await evaluate("document.querySelector('meta[name=\"theme-color\"]').content"), '#0E1916');
  for (const width of [1440, 1024, 961, 960, 769, 768, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow no site escuro em ${width}px`);
  }
  const darkContrasts = await evaluate(`(() => {
    const parse = color => color.match(/[\\d.]+/g).map(Number);
    function background(node) {
      if (!node) return [0, 0, 0];
      const rgba = parse(getComputedStyle(node).backgroundColor);
      const alpha = rgba.length === 4 ? rgba[3] : 1;
      const behind = alpha < 1 ? background(node.parentElement) : [0, 0, 0];
      return rgba.slice(0, 3).map((value, i) => value * alpha + behind[i] * (1 - alpha));
    }
    function luminance(rgb) {
      const [r, g, b] = rgb.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return r * .2126 + g * .7152 + b * .0722;
    }
    return ['body', '.btn-primary', '.filter-tab.active', '.badge-sage', '.badge-terracotta', '#name', '.art-note', '.visit-section h2', '.footer-brand p'].map(selector => {
      const node = document.querySelector(selector);
      const values = [luminance(parse(getComputedStyle(node).color).slice(0, 3)), luminance(background(node))].sort((a, b) => b - a);
      return { selector, ratio: (values[0] + .05) / (values[1] + .05) };
    });
  })()`);
  for (const result of darkContrasts) assert.ok(result.ratio >= 4.5, `Contraste escuro ${result.selector}: ${result.ratio.toFixed(2)}:1`);
  if (process.env.AURA_SCREENSHOT_DIR) {
    for (const width of [1440, 390]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await evaluate('scrollTo({top:0,behavior:"instant"})');
      const { data } = await call('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(process.env.AURA_SCREENSHOT_DIR, `aura-dark-${width}.png`), Buffer.from(data, 'base64'));
    }
  }
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await navigate('/');
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
  await evaluate("localStorage.removeItem('aura-theme')");
  await navigate('/');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
  await evaluate("localStorage.removeItem('aura-theme')");
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const blockedStorage = await call('Page.addScriptToEvaluateOnNewDocument', {
    source: "Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Blocked in test','SecurityError')}})"
  });
  await navigate('/');
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'dark');
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
  await call('Page.removeScriptToEvaluateOnNewDocument', { identifier: blockedStorage.identifier });
  assert.deepEqual(exceptions, [], 'Erros JavaScript no navegador');
  assert.deepEqual(failedResources, [], 'Recursos com erro HTTP');
  assert.deepEqual(externalRequests, [], 'A página iniciou requisições externas');
  console.log('OK: site e guia claros/escuros em 8 larguras; tema por teclado, persistência, sistema, armazenamento bloqueado e contraste; galeria, agenda, configuração real, formulário e modo sem JS.');
} finally {
  socket?.close();
  browser.kill();
  await new Promise(done => server.close(done));
  // Verifica a raiz temporária e o prefixo antes de remover apenas o perfil criado aqui.
  const tempRoot = resolve(tmpdir()) + sep;
  if (resolve(profile).startsWith(tempRoot) && profile.split(sep).at(-1).startsWith('aura-browser-check-')) {
    await pause(500);
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
