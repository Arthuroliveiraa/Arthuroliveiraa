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
    { name: '<b>Profissional de teste</b>', role: 'Atuação de teste', cro: 'CRO-TESTE 000' },
    { name: 'Cadastro incompleto' }
  ], responsibleProfessional: { name: 'Responsável de teste', cro: 'CRO-TESTE 001' },
  publicationReady: true
};
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
      const data = configured ? fixture : demo ? { ...fixture, demoMode: true } : { demoMode: false, whatsapp: 'javascript:alert(1)', phone: '5500999990000' };
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
  await navigate('/');
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
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), 'false');
  assert.equal(await evaluate("document.querySelector('#menu .btn').getClientRects().length"), 0, 'Botão do menu fechado continua visível');

  // M04/M07 — Filtrar, transferir interesse, gerar, invalidar e limpar solicitação.
  await evaluate("document.querySelector('[data-filter=estetica]').click()");
  assert.equal(await evaluate("document.querySelectorAll('[data-category]:not([hidden])').length"), 2);
  assert.match(await evaluate("document.querySelector('#filter-status').textContent"), /2 tratamentos/);
  await evaluate("document.querySelector('[data-treatment=\"Ortodontia\"]').click()");
  assert.equal(await evaluate("document.querySelector('#treatment').value"), 'Ortodontia');
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

  // M12 — Mesmo com dados preenchidos, o modo demo não ativa contatos ou identificação.
  await navigate('/demo/index.html');
  assert.equal(await evaluate("['contact-whatsapp','contact-phone','map-link','equipe','responsible-info'].every(id => document.getElementById(id).hidden)"), true);
  assert.equal(await evaluate("document.querySelector('#publication-notice').hidden"), false);
  await evaluate("document.querySelector('#name').value = 'Pessoa de teste'; document.querySelector('#booking-form').requestSubmit()");
  assert.equal(await evaluate("document.querySelector('#send-message').hasAttribute('href')"), false);

  // M02/M04 — Sem JS: navegação utilizável e controles dependentes de JS ocultos.
  await call('Emulation.setScriptExecutionDisabled', { value: true });
  await navigate('/', false);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#menu')).visibility"), 'visible');
  assert.equal(await evaluate("document.querySelector('#treatment-filters').hidden"), true);
  assert.equal(await evaluate("document.querySelector('#prepare').disabled"), true);
  assert.deepEqual(exceptions, [], 'Erros JavaScript no navegador');
  assert.deepEqual(failedResources, [], 'Recursos com erro HTTP');
  assert.deepEqual(externalRequests, [], 'A página iniciou requisições externas');
  console.log('OK: fontes e ilustração locais, layout em 8 larguras, menu, filtros, formulário, clipboard, configuração, equipe, contatos, modo demonstrativo e modo sem JavaScript.');
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
