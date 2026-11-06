# Aura Design System — v1.2

Referência consolidada após a implementação dos cinco primeiros tópicos e estendida pelos tópicos 6 a 12. Inclui tipografia local, abertura vetorial, cartões com ícones, variação de seções, linha do tempo, galeria e seleção demonstrativa de horário. A identidade é a mesma da demonstração odontológica; os exemplos não representam uma clínica em funcionamento.

[Abrir guia visual](../design-system.html) · [Guia publicado](https://arthuroliveiraa.github.io/Arthuroliveiraa/design-system.html) · [Tokens](../css/tokens.css) · [Componentes](../css/style.css)

## Organização

| Arquivo | Responsabilidade |
| --- | --- |
| `css/tokens.css` | Fonte única de cores, fontes, escalas, raios, sombras, dimensões e transições |
| `css/fonts.css` | Definições WOFF2 hospedadas localmente, incluindo itálico nos títulos |
| `css/style.css` | Componentes e padrões usados pela página principal e pelos exemplos |
| `design-system.html` | Catálogo visual acessível, com exemplos reais e trechos de HTML |
| `css/design-system.css` | Apresentação exclusiva da documentação, com seletores `ds-` |
| `js/design-system.js` | Leitura dos tokens, cópia, cálculo de contraste e feedback dos exemplos |
| `js/theme.js` | Preferência de tema, alternância acessível e sincronização entre páginas |
| `assets/fonts/`, `assets/icons/` | Assets de terceiros e licenças preservadas |
| `assets/illustrations/aura-smile.svg` | Ilustração vetorial própria da abertura |

Carregue as folhas nesta ordem, com caminhos relativos à página:

```html
<script src="js/theme.js"></script>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/style.css">
```

O site e o guia usam os mesmos arquivos. Valores exibidos pelo JavaScript são lidos das propriedades CSS, não de uma segunda tabela de cores. Sem JavaScript, amostras, componentes, navegação e exemplos de código permanecem disponíveis; cópia e cálculos são melhorias progressivas.

## Princípios

- **Acolher:** superfícies claras, espaço de leitura e linguagem simples.
- **Orientar:** títulos, rótulos e botões deixam claro o próximo passo.
- **Conectar:** os mesmos componentes resolvem o mesmo problema em todas as seções.
- **Informar:** não inventar registros profissionais, avaliações, disponibilidade ou resultados clínicos.

## Cores

| Papel | Token | Valor inicial | Uso |
| --- | --- | --- | --- |
| Fundo principal | `--color-bg` | `#FBF8F2` | Marfim para leitura e respiro |
| Fundo alternativo | `--color-bg-alt` | `#EDF3F0` | Tratamentos, contato e alternância de superfícies |
| Superfície | `--color-surface` | `#FFFFFF` | Cartões e elementos elevados |
| Identidade | `--color-primary` | `#14665E` | Ações principais, links e ícones |
| Hover principal | `--color-primary-light` | `#20766C` | Resposta à interação |
| Superfície escura | `--color-primary-dark` | `#0C403B` | Primeira visita e avisos |
| Destaque | `--color-accent` | `#AA4D32` | Selos e numeração |
| Hover de destaque | `--color-accent-hover` | `#963E27` | Variante de ação disponível |
| Decoração | `--color-accent-decorative` | `#DF9872` | Ilustração e detalhes sobre superfícies escuras |
| Texto | `--color-text-main` | `#173B35` | Títulos e conteúdo principal |
| Texto secundário | `--color-text-muted` | `#50665F` | Descrições e explicações |
| Contorno de controle | `--color-control-border` | `#80928B` | Limites de campos |
| Sucesso | `--color-success` | `#24734E` | Mensagem acompanhada de confirmação textual |
| Erro | `--color-danger` | `#AD3529` | Mensagem explícita e campo inválido |

As variantes `primary-soft`, `primary-subtle`, `accent-soft`, `success-soft` e `danger-soft` oferecem fundos para estados e ícones. `--color-footer`, `--color-on-dark` e `--color-on-dark-muted` organizam as superfícies escuras. A tabela acima é um retrato inicial; o arquivo de tokens é a fonte para alterações.

Use neutros nas grandes áreas, verde nas ações e terracota nos detalhes. O pêssego não serve para texto sobre branco. As cores de Instagram, Facebook e WhatsApp pertencem às respectivas marcas e ficam fora da paleta institucional. Botões com texto devem manter contraste adequado; a cor verde clara do ícone de WhatsApp não deve ser reaproveitada indiscriminadamente para texto branco.

Ao alterar `--color-primary` ou `--color-accent`, atualize também suas variantes `-rgb`, usadas em sombras translúcidas. Medidas específicas de uma composição, como proporções da ilustração, continuam locais; a escala compartilhada orienta o ritmo dos componentes.

## Tema claro e escuro

O botão “Modo escuro” no cabeçalho do site e do guia usa `aria-pressed` para indicar o estado. `js/theme.js` é carregado no head antes das folhas para aplicar a preferência sem uma pintura inicial no tema errado. Na primeira visita, acompanha `prefers-color-scheme`; após uma escolha manual, preserva `light` ou `dark` na chave `aura-theme` de `localStorage`.

O tema usa `data-theme` na raiz e `color-scheme` para adaptar também os controles nativos, como seleção de data. Sem JavaScript, o conteúdo permanece legível no tema claro e o botão fica oculto. Se o navegador bloquear armazenamento, a alternância continua funcionando na página atual. A preferência é compartilhada entre site e guia e sincronizada entre abas da mesma origem.

| Papel | Token semântico |
| --- | --- |
| Fundo da ação / hover | `--color-action-bg`, `--color-action-hover` |
| Texto sobre ação | `--color-on-action` |
| Ação de destaque | `--color-accent-action`, `--color-accent-action-hover`, `--color-on-accent` |
| Texto de destaque em superfície normal | `--color-text-strong` |
| Texto sobre painel escuro | `--color-on-strong` |
| Texto sobre detalhe pêssego | `--color-on-decorative` |
| Cor da interface do navegador | `--color-browser` |

Evite usar o mesmo token para texto e para fundo de botão: no tema escuro, ações claras usam texto escuro. Cores institucionais, superfícies e estados mudam juntos em `:root[data-theme="dark"]`; fotografias, ilustrações e marcas sociais mantêm as cores originais. Os valores e as razões de contraste do guia são recalculados ao alternar o tema, por meio do evento `aura:themechange`.

Os dados digitados no formulário e nos exemplos não são persistidos; apenas a escolha de tema é salva. Para voltar ao acompanhamento automático do sistema, remova a preferência `aura-theme` do armazenamento local. Os testes cobrem ambos os temas em oito larguras, teclado, persistência, mudança do sistema e bloqueio de armazenamento.

## Tipografia

| Papel | Família | Peso / estilo |
| --- | --- | --- |
| Títulos | Playfair Display | 600, normal |
| Destaque editorial | Playfair Display | 500, itálico |
| Corpo | Plus Jakarta Sans | 400, normal |
| Ações e rótulos | Plus Jakarta Sans | 600, normal |
| Marcadores curtos | Plus Jakarta Sans | 700 quando necessário |

`--text-title`, `--text-heading` e `--text-subheading` usam `clamp()` para títulos fluidos. `--text-body` é 1,05 rem; `--text-md`, 1 rem; `--text-sm`, 0,875 rem; `--text-xs`, 0,75 rem. A entrelinha é `--line-body: 1.65` no corpo e `--line-heading: 1.25` nos títulos. A abertura ajusta sua escala para a composição própria.

As fontes têm subconjuntos latino e latino estendido e são carregadas do próprio site, com `font-display: swap`. Preserve as licenças OFL e os nomes das fontes distribuídas. Evite itálico sintético na fonte de corpo: o itálico distribuído pertence à Playfair Display.

## Espaçamento, forma e elevação

A escala espacial tem base de 4 px, considerando a raiz padrão de 16 px:

| Token | Medida | Uso comum |
| --- | --- | --- |
| `--space-1` / `--space-2` / `--space-3` | 4 / 8 / 12 px | Ajustes e agrupamento curto |
| `--space-4` / `--space-5` / `--space-6` | 16 / 20 / 24 px | Componentes e margens laterais |
| `--space-8` / `--space-10` / `--space-12` | 32 / 40 / 48 px | Cartões, grupos e colunas |
| `--space-16` / `--space-20` | 64 / 80 px | Separação de blocos |
| `--space-22` / `--space-24` | 88 / 96 px | Ritmo de seções amplas |

Raios: `sm` 8 px, `md` 14 px, `lg` 20 px, `xl` 28 px e `pill` 9999 px. Os raios preservam o desenho existente e não seguem necessariamente a escala espacial.

Sombras: `--shadow-sm` para apoio discreto; `md` para pequenos elementos elevados; `lg` para hover de cartões; `xl` para o formulário e blocos flutuantes. Evite aplicar sombra a todos os elementos: a seção de princípios usa linhas abertas, sem cartões elevados.

## Layout e comportamento responsivo

O contêiner principal é `--container-wide: 1240px`; o contêiner de leitura e formulário é `--container-narrow: 860px`. Ambos incluem padding lateral de 24 px em cada lado. Grades usam `minmax(0, 1fr)` para permitir quebra de conteúdo.

| Limite | Comportamento da página principal |
| --- | --- |
| 1024 px | Abertura empilhada e filtros abaixo do título |
| 960 px | Navegação recolhível, habilitada por JavaScript |
| 768 px | Tratamentos e princípios em uma coluna, linha do tempo vertical, atalho móvel de avaliação |

Os limites de media queries permanecem literais no CSS; propriedades customizadas não são usadas como breakpoints. O guia possui adaptações próprias para sua navegação lateral. Verifique a página principal de 320 px até telas amplas após qualquer mudança estrutural.

## Componentes e estados

| Componente | Classes / semântica | Regra |
| --- | --- | --- |
| Botão | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent` | Primário para avançar; secundário para alternativa; acento como variante disponível |
| Tamanho do botão | `.btn-sm`, padrão, `.btn-lg` | Altura mínima de 44 px, texto descritivo e quebra quando necessária |
| Navegação textual | `.text-link` em `<a>` | Um destino real, sublinhado e foco visível |
| Selo | `.badge-pill` com variante | Contexto sem aparência de ação; não recebe foco |
| Campo | `.input-field`, `<label>`, `<input>` / `<select>` / `<textarea>` | Rótulo persistente e ajuda associada por `aria-describedby` |
| Campo inválido | `aria-invalid="true"` e `.field-error` | Exibir o motivo em texto; limpar o estado quando corrigido pela lógica do formulário |
| Campo desabilitado | Atributo `disabled` | Usar somente quando indisponível; não simular com uma classe |
| Mensagem | `.status-message`, `.status-success`, `.status-error` | Texto explícito; `role="status"` quando houver atualização dinâmica |
| Pergunta expansível | `<details class="faq-item">` e `<summary>` | Interação nativa, sem altura fixa |
| Tratamento | `.treatment-card`, `.treatment-heading`, `.treatment-icon` | Ícone, título, descrição, detalhes e ação |
| Princípio | `.care-layout`, `.diff-card`, `.diff-icon-wrap` | Introdução lateral e linhas de leitura |
| Linha do tempo | `.visit-section`, `<ol class="visit-steps" role="list">` | Ordem semântica; conectores apenas entre etapas |

Exemplo de ação:

```html
<a class="btn btn-primary" href="#agendamento">Quero uma avaliação ↗</a>
```

Exemplo de erro associado ao campo:

```html
<div class="input-field">
  <label for="nome">Nome</label>
  <input id="nome" aria-invalid="true" aria-describedby="nome-erro">
  <p class="field-error" id="nome-erro">Preencha seu nome para continuar.</p>
</div>
```

Os estados de erro e sucesso são padrões reutilizáveis, demonstrados no guia. A página principal continua usando sua validação nativa e sua lógica de mensagens; criar o sistema não substitui esses fluxos por uma simulação.

## Ícones e ilustração

Ícones Lucide usam viewBox de 24 × 24, traço de 2, extremidades e junções arredondadas. Dimensões de exibição: 20 px junto ao texto; 24–28 px em marcadores; áreas de clique independentes do tamanho do desenho. Elementos decorativos recebem `aria-hidden="true"` e `focusable="false"`; o nome da ação fica no texto ou no link.

Ícones sociais usam Simple Icons com cores de marca e área de 44 × 44 px. Não substituir marcas por ícones genéricos de conversa. SVGs locais dispensam dependências externas de execução.

A composição `aura-smile.svg` é abstrata e própria. Preserve a proporção, use dimensões intrínsecas e mantenha legenda fora da figura. Fotos de profissionais ou da clínica dependem de material real e autorizado; não inventar identificação ou instalações.

## Acessibilidade e movimento

- Contraste mínimo de 4,5:1 para os pares de texto apresentados na tabela do guia; 3:1 para o contorno do campo em relação ao fundo. O guia calcula os valores atuais e sinaliza necessidade de revisão.
- Foco com `--focus-width: 3px` e `--focus-offset: 5px`. Em superfícies escuras, usar cor clara ou pêssego com contraste suficiente.
- Estados comunicados por texto e atributos, além da cor.
- Cabeçalhos em ordem, landmarks, rótulos e navegação por teclado.
- Preferência `prefers-reduced-motion: reduce` desativa animações, transições e rolagem suave.
- Transições rápidas de 180 ms, normais de 300 ms e suaves de 500 ms; usar apenas quando ajudam a perceber uma mudança.
- O guia não coleta, transmite nem armazena os valores digitados nos exemplos.

Esses critérios e os testes automatizados não equivalem a uma auditoria integral de acessibilidade.

## Como manter

### Extensões dos tópicos 6 a 12

- Navegação atual: `.nav-link.active` e `aria-current="location"`; o estado acompanha a rolagem, sem alterar o histórico da página.
- Interesse selecionado: `.treatment-card.is-selected` e confirmação textual em `#treatment-selection`.
- Galeria: `.space-gallery`, `.space-card` e `<dialog class="gallery-dialog">`; links diretos permanecem utilizáveis sem JavaScript. O diálogo fecha por Escape ou botão, bloqueia interação com o fundo e devolve o foco ao item de origem.
- Equipe: `.team-bio` e `.team-qualifications` complementam o cartão existente. Não gerar pessoas ou registros fictícios.
- Avaliações: `.verified-review` apresenta texto, fonte original e dados opcionais. O nome da classe não substitui a conferência manual da fonte.
- Agenda: `.booking-platform` para o encaminhamento real e `.schedule-demo` para a simulação. Horários de exemplo usam botões com `aria-pressed`; nunca apresentar os exemplos como disponibilidade real.

As configurações e condições de exibição estão em [CONFIGURACAO.md](CONFIGURACAO.md). Esses componentes usam os tokens existentes; o fundo de um estado selecionado não dispensa texto ou atributos acessíveis.

### Fluxo de alteração

1. Edite tokens compartilhados em `css/tokens.css`; evite repetir valores novos em componentes.
2. Para uma variação de componente, altere `css/style.css` e inclua um exemplo no guia.
3. Mantenha exemplos de markup sincronizados com os componentes do site. O guia reutiliza o CSS; a composição de exemplos é estática.
4. Teste teclado, foco, estados, fontes e telas pequenas. Verifique contraste após mudar qualquer cor.
5. Execute `node scripts/prepare-site.mjs` e `node tests/browser-check.mjs`, com `AURA_SITE_ROOT=dist` para a distribuição.
6. Atualize a versão e a documentação quando mudar um contrato visual ou de componente.

O guia é publicado em `/design-system.html` e permanece fora do menu destinado ao visitante da clínica. Nenhum framework ou processo de compilação adicional é necessário.
