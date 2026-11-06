/* Guia visual: valores reais dos tokens e exemplos sem armazenamento de dados. */
const feedback = document.getElementById('ds-feedback');
const tokenValue = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
let feedbackTimer;

function announce(message) {
  clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 6500);
}

function refreshTokens() {
  document.querySelectorAll('[data-token-value]').forEach(element => {
    element.textContent = tokenValue(element.dataset.tokenValue);
  });
}

document.querySelectorAll('[data-copy-token]').forEach(button => {
  button.hidden = false;
  button.setAttribute('aria-label', `Copiar token ${button.dataset.copyToken}`);
  button.addEventListener('click', async () => {
    const name = button.dataset.copyToken;
    const declaration = `${name}: ${tokenValue(name)};`;
    try {
      await navigator.clipboard.writeText(declaration);
      announce(`Token copiado: ${declaration}`);
    } catch {
      announce(`Copie manualmente: ${declaration}`);
    }
  });
});

document.querySelectorAll('[data-demo]').forEach(button => {
  button.addEventListener('click', () => {
    announce(`${button.dataset.demo}: exemplo de interação. Nenhuma solicitação foi enviada.`);
  });
});

function luminance(color) {
  if (!/^#[\da-f]{6}$/i.test(color)) return null;
  const [r, g, b] = color.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return r * .2126 + g * .7152 + b * .0722;
}

function refreshContrast() {
  document.querySelectorAll('[data-contrast]').forEach(cell => {
    const values = cell.dataset.contrast.split('|').map(name => luminance(tokenValue(name)));
    if (values.some(value => value === null)) {
      cell.textContent = 'Requer revisão';
      delete cell.dataset.contrastPass;
      return;
    }
    const [lighter, darker] = values.sort((a, b) => b - a);
    const ratio = (lighter + .05) / (darker + .05);
    const minimum = Number(cell.dataset.minimum || 4.5);
    cell.dataset.contrastPass = String(ratio >= minimum);
    cell.textContent = `${ratio.toFixed(2).replace('.', ',')}:1 · ${ratio >= minimum ? 'Atende' : 'Revisar'}`;
  });
}
function refreshThemeExamples() {
  refreshTokens();
  refreshContrast();
}
document.addEventListener('aura:themechange', refreshThemeExamples);
refreshThemeExamples();
