# Revisão de qualidade do front-end

Registro da revisão iniciada em **06/11/2026**. Publicação somente mediante pedido explícito, pelo workflow manual do projeto.

| Item | Estado | Evidência / limite |
| --- | --- | --- |
| 1. Compatibilidade | Parte automatizada aprovada | 20 cenários em Chromium, Firefox e WebKit, incluindo Android/iPhone **emulados**. Safari instalado e aparelhos físicos ainda precisam de conferência manual. |
| 2. Acessibilidade | Parte automatizada aprovada | Axe nos dois temas, site/guia, foco, diálogo, árvore acessível e texto a 200%. Escuta em leitor de tela ainda precisa de rodada manual. |
| 3. Botão fixo móvel | Aprovado | Oculto junto ao formulário/rodapé e durante edição; dois perfis móveis e regressão existente passaram. Teclado virtual em aparelho físico continua na rodada manual do item 1. |
| 4. Desempenho | Medido e corrigido | Menu inicial sem salto: CLS móvel de 0,230 para 0,005; LCP aproximadamente 1,6 s. Perfil descrito abaixo. |
| 5. CSS | Aprovado | 125 seletores removidos, aproximadamente 32% menos CSS. Oito capturas idênticas e 47 testes aprovados. |
| 6. Página 404 | Aprovado localmente | Dois temas, HTTP 404, axe e retorno de subpastas. Incluída no artefato de publicação. |
| 7. Apresentação | Aprovado | README, capturas claras/escuras e instruções atualizadas. |
| 8. Comparação visual | Aprovado localmente | 28 referências geradas, amostras inspecionadas e comparação repetida sem diferenças, em Windows/Chromium. |

## Encerramento local

- `npm run test:qa`: **57 aprovados**, três cenários do atalho móvel omitidos intencionalmente nos perfis desktop.
- `npm run test:visual`: **quatro cenários aprovados**, comparando 28 imagens.
- Suíte original `tests/browser-check.mjs`: aprovada contra a distribuição, nos dois temas e oito larguras.
- Sintaxe dos scripts alterados, consistência do lockfile e conteúdo de `dist/`: conferidos.
- Os workflows executam a verificação ampliada e condicionam o deploy manual ao resultado. O histórico remoto fica nas [execuções do GitHub Actions](https://github.com/Arthuroliveiraa/Arthuroliveiraa/actions).

Na primeira rodada remota ampliada, o WebKit deixou os valores do guia vazios na inicialização. A atualização dos exemplos passou a aguardar o próximo quadro e os eventos de carregamento/fontes; o teste de compatibilidade também verifica os valores com a folha de tokens atrasada, nos dois temas.

Os itens 3 a 8 estão concluídos localmente. Os itens 1 e 2 têm a parte automatizada aprovada e mantêm as verificações manuais abaixo pendentes. A publicação depende da solicitação do usuário e da aprovação dos checks.

## Compatibilidade

Preparação, em PowerShell:

```powershell
npm ci
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/.cache/playwright"
npx playwright install chromium firefox webkit
npm run build
npm run test:compat
```

Playwright usa versões próprias dos motores Firefox e WebKit. Os perfis móveis simulam viewport, toque e parâmetros de dispositivo; não comprovam comportamento em hardware Android/iOS, teclado virtual ou Safari distribuído pela Apple.

Fluxos cobertos: menu móvel por toque, filtros, seleção de tratamento, data/horário fictícios, geração/limpeza de mensagem, diálogo e retorno do foco, persistência do tema, guia visual e conteúdo sem JavaScript. Não foram encontradas incompatibilidades nesses cenários.

## Acessibilidade

Axe verificou o site e o guia nos dois temas e nos cinco perfis. Foram corrigidos o nome acessível da marca, a região do atalho móvel e o transbordamento do cabeçalho/texto ampliado. Os testes também exercitam o atalho para o conteúdo, a ativação por teclado, o isolamento e retorno do foco do diálogo e o formulário com texto a 200%.

O WebKit deste runtime não inclui links no Tab por padrão. Nele o teste posiciona o foco no atalho e verifica sua ativação e destino; a ordem de Tab com Safari configurado e a escuta em leitor de tela não foram consideradas aprovadas por esses testes.

## Desempenho

Medição local no Chromium 158.0.8127.18, com cache frio, download a 1,6 Mbps, upload a 0,75 Mbps, latência de 150 ms, CPU limitada em 4× e servidor sem compressão. Medianas de três execuções por largura, após a limpeza do CSS:

| Largura | LCP | FCP | Deslocamento observado (CLS) | Maior duração das interações exercitadas |
| --- | --- | --- | --- | --- |
| 390 px | 1,544 s | 1,544 s | 0,0047 | 48 ms |
| 1440 px | 1,532 s | 1,532 s | 0,0021 | 56 ms |

Antes da correção, o CLS móvel era 0,230. O menu era pintado expandido antes da inicialização tardia; `navigation.js` passou a preparar a apresentação antes da pintura. A carga de recursos medida caiu para aproximadamente 188 KB, sem incluir o documento HTML.

```powershell
npm run test:performance
```

O relatório detalhado fica em `.cache/performance/metrics.json`. A janela inclui carregamento e interações sintéticas; as durações não equivalem ao INP de usuários reais, nem os resultados locais garantem métricas da hospedagem. Referência: [Web Vitals](https://web.dev/articles/vitals).

## Comparação visual

```powershell
npm run build
npm run test:visual
```

As referências em `tests/visual-baselines/win32/visual-chromium/` cobrem abertura, tratamentos com detalhes, galeria, formulário com simulação aberta e mensagem preparada (WhatsApp/cópia), guia e página 404. São 28 imagens, em 1440/390 px e nos temas claro/escuro. Data, fontes, escala e movimento são estabilizados; o teste normal não cria nem atualiza referências. Nas capturas de componentes inteiros, barras fixas de cabeçalho e o atalho de pular conteúdo são ocultados somente durante a captura para não cobrir o componente. As capturas da abertura preservam o cabeçalho real.

Quando uma mudança visual for intencional, execute `npm run test:visual:update`, inspecione as imagens e então mantenha a nova referência no controle de versão. Não use atualização automática para encobrir uma regressão. Diferenças e traces ficam em `.cache/test-results/`.

Use o mesmo sistema e a versão de navegador fixada por `package-lock.json`; outro sistema precisa de referências próprias revisadas. A configuração de CI usa Windows para essa rodada; confira o resultado remoto no GitHub Actions. Referência: [comparação visual no Playwright](https://playwright.dev/docs/test-snapshots).

## Conferência manual ainda necessária

- Safari em macOS e Safari em iPhone/iPad: abrir galeria, alternar temas, escolher data, preencher e limpar formulário.
- Chrome em Android físico: toque, rotação de tela e teclado virtual no formulário.
- Leitor de tela: ouvir títulos e regiões, estado dos filtros, mensagens do formulário e abertura/fechamento da galeria.

Registre dispositivo, sistema, navegador/versão, data e resultado antes de marcar esses testes como concluídos. Não há acesso a aparelhos físicos nesta execução.

Referências: [motores do Playwright](https://playwright.dev/docs/browsers), [emulação](https://playwright.dev/docs/emulation) e [testes de acessibilidade e seus limites](https://playwright.dev/docs/accessibility-testing).
