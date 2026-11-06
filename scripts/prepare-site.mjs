/**
 * M13 — Prepara a distribuição estática usada pelo GitHub Pages.
 * Copia somente arquivos do site e a licença; documentação/testes ficam no repositório.
 * Executar: node scripts/prepare-site.mjs
 */
import assert from 'node:assert/strict';
import { cp, mkdir, rm, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const entries = ['index.html', 'design-system.html', '404.html', 'css', 'js', 'assets', 'LICENSE'];
for (const entry of entries) await access(join(root, entry));

// Antes da remoção recursiva, exige exatamente a pasta gerada dentro do projeto.
assert.equal(dirname(output), root);
assert.equal(output, join(root, 'dist'));
await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const entry of entries) await cp(join(root, entry), join(output, entry), { recursive: true });
console.log('Distribuição estática preparada em dist/.');
