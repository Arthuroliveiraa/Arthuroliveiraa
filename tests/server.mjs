// Servidor de QA local; nunca entra na distribuição pública.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve(process.env.AURA_SITE_ROOT || 'dist');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = url.pathname.replace(/^\/Arthuroliveiraa(?=\/)/, '');
    const path = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    response.end(body);
  } catch {
    try {
      const page = await readFile(resolve(root, '404.html'));
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(page);
    } catch { response.writeHead(404).end('Página não encontrada'); }
  }
});
server.listen(Number(process.env.AURA_TEST_PORT || 4173), '127.0.0.1');
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close());
