# Comparação e registro das alterações

Pesquisa realizada em **04/11/2026**. Comparação de conteúdo e navegação pública; não é auditoria de desempenho, de resultados clínicos ou de conformidade legal das clínicas citadas. A marca foi preservada. A paleta recebeu a revisão descrita abaixo em **06/11/2026**.

## Revisão de cores — 06/11/2026

A paleta combina o contraste quente/frio entre verde-petróleo e terracota com fundos claros em marfim. Os neutros ocupam as superfícies maiores, o verde identifica navegação e ações e o terracota destaca selos e numeração. As variações de luminosidade organizam a hierarquia sem acrescentar cores concorrentes.

| Papel | Cor | Aplicação |
| --- | --- | --- |
| Marfim | `#FBF8F2` | Fundo principal |
| Areia | `#F0E9DC` | Alternância de seções |
| Verde-petróleo | `#14665E` | Identidade, links e botões |
| Terracota | `#AA4D32` | Texto de destaque, selos e números |
| Pêssego | `#DF9872` | Elementos decorativos |
| Verde profundo | `#0D302C` | Rodapé |

Os pares principais de texto e fundo foram verificados com contraste mínimo de 4,5:1, incluindo botões em repouso e hover; os contornos dos campos atingem 3:1 em relação ao fundo. Isso é uma checagem da paleta, não uma auditoria completa de acessibilidade. A legenda da ilustração usa uma superfície escura para manter o contraste em qualquer largura. Favicon, cor do navegador e capturas do README acompanham a identidade; os ícones sociais mantêm suas cores de marca.

## Referências consultadas

| Referência | O que foi observado | Aplicação no projeto |
| --- | --- | --- |
| [Tend — unidade East Nashville](https://www.hellotend.com/site/studios/east-nashville) | Informações de unidade e explicação da primeira visita | Etapas para o visitante entender como começar, endereço, horários e acesso |
| [Tend — perguntas frequentes](https://www.hellotend.com/site/faqs) | Perguntas sobre convênios, agendamento e cancelamento | FAQ administrativo configurável, sem importar condições comerciais da referência |
| [Studio Dental — agendamento](https://www.studiodental.com/scheduling) | Orientações diferentes para novos pacientes, retornos e outros pedidos | Campo de primeira avaliação, retorno ou remarcação; confirmação depende da equipe |
| [Studio Dental — site principal](https://www.studiodental.com/) | Acesso a equipe, localização, preços/seguros e política de cancelamento | Estrutura opcional de equipe e identificação do responsável, contatos e perguntas práticas |
| [OdontoCompany — São José dos Campos](https://odontocompany.com/clinica/estado/sp/saojosedoscampos) | Endereço e telefones junto às unidades | Área de contato dedicada, telefone clicável e abertura do endereço no mapa |

As referências orientaram a organização. Textos, fotos, avaliações, valores e políticas não foram copiados. A análise aponta oportunidades para este projeto; não atribui a ele os serviços ou recursos das outras clínicas.

## Mapa das alterações no código

Os comentários **M01 a M13** aparecem em [index.html](../index.html), [app.js](../js/app.js), [config.js](../js/config.js), nos complementos de [style.css](../css/style.css) e nos arquivos de entrega. O HTML foi expandido de linhas compactas para blocos legíveis. Os comentários explicam propósito, dependências e limitações.

| Código | Antes | Depois | Onde editar |
| --- | --- | --- | --- |
| M01 | Sem ícone de aba; descrição genérica | Favicon SVG local, metadados atualizados e configuração comentada | Cabeçalho do HTML, ícone e início dos scripts |
| M02 | Menu móvel oculto mesmo sem JS; estado persistia ao redimensionar | Melhoria progressiva, fechamento por Escape/clique externo/saída de foco, ajuste em 960px e respeito à redução de movimento | Navegação, início do JS e CSS responsivo |
| M03 | Identidade e princípios já existentes | Mantidos; estilos e função de cada elemento visual documentados | Apresentação, princípios e ilustração CSS |
| M04 | Filtros e descrições curtas | Detalhes expansíveis nativos, quantidade anunciada, links com contexto e grade de quatro itens em duas colunas | Catálogo, filtros e CSS de tratamentos |
| M05 | Primeira visita apenas em uma resposta curta | Três etapas e orientação de preparação, sem promessas de exames incluídos | Seção `primeira-visita` e CSS das etapas |
| M06 | Nenhuma estrutura de equipe | Lista opcional com nome, atuação e CRO; seção oculta quando não configurada | `team` na configuração e renderização no JS |
| M07 | Apenas avaliação geral, tratamento e período | Tipo de solicitação, limpar dados, invalidação da mensagem e URL antigas, validação do nome e tratamento de falha de cópia | Formulário e seus eventos no JS |
| M08 | Quatro dúvidas frequentes | Perguntas sobre convênios e remarcação/cancelamento, com textos configuráveis | FAQ e configuração |
| M09 | Contato somente em um parágrafo no rodapé | Área própria com endereço, horários, acesso, telefone, WhatsApp e mapa por link | Seção `contato` e configuração |
| M10 | Nota curta no formulário | Explicação do compartilhamento, área de transferência e limites da limpeza de dados | Seção `privacidade` e evento de reset |
| M11 | Rodapé com aviso fixo | Responsável técnico condicional, link para equipe, aviso controlável e atalho de avaliação no celular | Rodapé, configuração e CSS mobile |
| M12 | Site apresentado como clínica em preparação | Modo de portfólio ativo, aviso de clínica ilustrativa, contatos bloqueados e formulário demonstrativo | HTML, `demoMode`, JS e aviso visual |
| M13 | Sem preparação específica para GitHub | README com capturas, licença MIT, exclusões, padronização, distribuição e workflows de verificação/publicação | Documentação, scripts, testes e `.github/workflows/` |

## O que depende de informações reais

As pendências abaixo se aplicam à adaptação para uma clínica em funcionamento. No portfólio, os campos vazios e o modo demonstrativo são intencionais. A experiência de demonstração está disponível sem contatos ou registros profissionais.

| Informação/recurso | Estado | Próxima ação |
| --- | --- | --- |
| WhatsApp e telefone | Implementados, sem números preenchidos | Configurar `whatsapp` e `phone` com país, DDD e número |
| Endereço, horários e acessibilidade | Implementados com avisos de pendência | Configurar `address`, `hours` e `accessibility` |
| Equipe e responsável | Estrutura implementada, oculta sem dados mínimos | Preencher `team` e `responsibleProfessional` com registros conferidos |
| Convênios e cancelamentos | Respostas genéricas | Preencher `insuranceInfo` e `cancellationInfo` com as condições reais |
| Fotografias da clínica e equipe | Não acrescentadas | Fornecer imagens reais e autorizadas; a ilustração atual é abstrata |
| Avaliações/depoimentos | Não acrescentados | Usar somente material autêntico, autorizado e adequado à publicação |
| Tratamentos apresentados | Catálogo do projeto preservado | Confirmar que todos são oferecidos e revisar sua classificação e descrição |
| Agenda com horários disponíveis | Não existe backend ou agenda integrada | Integração futura com um serviço de agendamento, se necessária |
| Identidade institucional e publicação | Aviso de preparação mantido | Conferir dados institucionais, identificação profissional e conteúdo antes de ativar `publicationReady` |
| SEO local estruturado | Adiado por falta de dados completos | Adicionar dados estruturados e URL canônica quando houver endereço, identidade e domínio reais |

## Critérios técnicos

- Sem dependências de produção e sem fontes externas, widgets de mapa ou rastreadores.
- Google Maps abre somente por ação do visitante; a página não carrega um iframe.
- Dados configuráveis entram por `textContent`, sem interpretar HTML.
- Links de telefone/WhatsApp só aparecem com formato brasileiro válido; isso não comprova existência ou titularidade do número.
- Mensagens são codificadas antes de entrar na URL do WhatsApp. Não há envio nem confirmação automática.
- Sem JavaScript, as informações, navegação e detalhes continuam disponíveis; filtros e geração de mensagem dependem do script.
- A folha original contém componentes ainda não usados. Foram preservados e identificados como base, sem criar conteúdo fictício para preenchê-los.

## Validação reproduzível

Veja os comandos e limites de verificação no [README](../README.md). Os testes usam dados sintéticos próprios e não enviam mensagens nem consultam plataformas externas.

Na revisão de 04/11/2026, a sintaxe de ambos os scripts passou. O teste funcional passou no Edge headless: oito larguras de tela, menu, filtros, formulário, limpeza, alternativa de cópia, contatos, equipe e modo sem JavaScript. O navegador precisou executar fora do sandbox, porque o processo iniciado dentro dele não respondia aos comandos CDP.

Também passaram as verificações de IDs únicos, âncoras e associação de rótulos aos campos. As capturas da abertura em 1440px e 390px foram inspecionadas. Essa inspeção revelou um botão do menu aparecendo durante a mudança de largura; a ocultação foi corrigida com `display: none` no menu fechado e ganhou uma verificação de regressão. A inspeção visual abrangeu a abertura da página; os testes de layout verificaram a ausência de rolagem horizontal no documento completo.

Na preparação para portfólio (M12/M13), a distribuição isolada também passou nesses testes, incluindo o bloqueio de contatos externos no modo demonstrativo mesmo com dados preenchidos. As capturas atuais estão em [docs/images](./images/) e são usadas pelo README.

Em 04/11/2026, o projeto foi enviado ao GitHub e a [demonstração pública](https://arthuroliveiraa.github.io/Arthuroliveiraa/) foi publicada. O [workflow de publicação](https://github.com/Arthuroliveiraa/Arthuroliveiraa/actions/runs/41906540970) passou nos testes no Chrome/Linux e na implantação. A primeira execução isolada de verificação excedeu o limite de 10 segundos ao iniciar o navegador; o teste passou a aguardar até 30 segundos e registrar uma mensagem de diagnóstico se o processo encerrar antes. A página e todos os recursos vinculados retornaram HTTP 200 na conferência pública.
