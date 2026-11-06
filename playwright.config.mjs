import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.cache/playwright');

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.mjs/,
  outputDir: '.cache/test-results',
  workers: 2,
  timeout: 30000,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/visual-baselines/{platform}/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css', threshold: .1, maxDiffPixels: 80 } },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'node tests/server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 1000 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 1000 } } },
    { name: 'android-emulado', use: { ...devices['Pixel 5'] } },
    { name: 'iphone-emulado', use: { ...devices['iPhone 13'] } }
  ].map(project => ({ ...project, testIgnore: /visual\.spec\.mjs/ })).concat([
    { name: 'visual-chromium', testMatch: /visual\.spec\.mjs/,
      use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 } }
  ])
});
