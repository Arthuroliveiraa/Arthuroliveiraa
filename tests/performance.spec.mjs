import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('medição de laboratório com rede e CPU limitadas', async ({ browser, browserName, isMobile, baseURL }) => {
  test.skip(browserName !== 'chromium' || isMobile, 'Medição via CDP no Chromium desktop.');
  test.setTimeout(90000);
  const runs = [];
  for (const width of [390, 1440]) {
    for (let run = 1; run <= 3; run++) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
        await cdp.send('Network.emulateNetworkConditions', {
          offline: false, latency: 150, downloadThroughput: 1600000 / 8,
          uploadThroughput: 750000 / 8, connectionType: 'cellular4g'
        });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await page.addInitScript(() => {
          window.lab = { lcp: 0, cls: 0, shifts: [], interactions: [] };
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) window.lab.lcp = entry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
              window.lab.cls += entry.value;
              window.lab.shifts.push({ time: entry.startTime, value: entry.value,
                sources: entry.sources.map(source => ({ node: `${source.node?.tagName}.${source.node?.className}`,
                  previous: source.previousRect.toJSON(), current: source.currentRect.toJSON() })) });
            }
          }).observe({ type: 'layout-shift', buffered: true });
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) if (entry.interactionId) window.lab.interactions.push(entry.duration);
          }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
        });
        await page.goto(baseURL);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(600); // Janela de observação de pintura, não espera de prontidão.
        const load = await page.evaluate(() => ({
          lcpMs: window.lab.lcp,
          fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          cls: window.lab.cls,
          shifts: window.lab.shifts,
          requests: performance.getEntriesByType('resource').length,
          bytes: performance.getEntriesByType('resource').reduce((total, item) => total + item.transferSize, 0)
        }));
        await page.getByRole('button', { name: 'Estética', exact: true }).click();
        await page.locator('[data-gallery]').first().click();
        await page.getByRole('button', { name: /Fechar/ }).click();
        await page.locator('#name').fill('Pessoa de teste');
        await page.locator('#prepare').click();
        await page.waitForTimeout(200); // Permite entregar os eventos de pintura ao observador.
        const interactionMaxMs = await page.evaluate(() => Math.max(0, ...window.lab.interactions));
        runs.push({ width, run, ...load, interactionMaxMs });
        expect(load.lcpMs).toBeGreaterThan(0);
      } finally { await context.close(); }
    }
  }
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const report = {
    profile: { latencyMs: 150, downloadMbps: 1.6, uploadMbps: .75, cpuSlowdown: 4, coldCache: true, compression: false },
    browser: browser.version(),
    medians: [390, 1440].map(width => {
      const group = runs.filter(item => item.width === width);
      return Object.fromEntries(['lcpMs', 'fcpMs', 'cls', 'requests', 'bytes', 'interactionMaxMs'].map(key => [key, median(group.map(item => item[key]))]).concat([['width', width]]));
    }),
    runs,
    note: 'Laboratório local. Duração das interações exercitadas não equivale ao INP de usuários reais.'
  };
  await mkdir('.cache/performance', { recursive: true });
  await writeFile('.cache/performance/metrics.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.medians));
});
