# Conteúdo e integrações — tópicos 6 a 12

Esta revisão mantém o site em demonstração, conforme solicitado. O código está preparado para conteúdo confirmado; os exemplos abaixo são esquemas de configuração, não pessoas, avaliações ou instalações reais. Nenhum serviço externo é consultado automaticamente.

## O que já funciona

| Tópico | Implementação | Dependência para uso real |
| --- | --- | --- |
| 6. Navegação | Seção atual no menu, atributo `aria-current` e feedback do tratamento selecionado | Nenhuma |
| 7. Compartilhamento | PNG 1200 × 630 e metadados Open Graph/Twitter no HTML | Publicar quando autorizado; revisar URLs em outro domínio |
| 8. Tratamentos | Detalhes expansíveis com contexto e perguntas para a consulta | Revisão do conteúdo pelo profissional responsável em implantação real |
| 9. Galeria | Três ilustrações próprias na demo; ampliação com diálogo nativo, Escape e retorno de foco | Fotografias locais e autorizadas para substituir os conceitos |
| 10. Equipe | Foto, nome, atuação, registro, biografia e formação por configuração | Profissionais reais e dados conferidos |
| 11. Avaliações | Relatos autorizados com acesso à fonte original, nota e data opcionais | Texto autorizado e link correto da publicação |
| 12. Agenda | Simulação explícita e link HTTPS para uma plataforma externa | Serviço escolhido e URL oficial; disponibilidade administrada pelo provedor |

## Galeria

Adicione os arquivos em `assets/gallery/` e preencha `gallery` em `js/config.js`:

```js
gallery: [{
  src: 'assets/gallery/recepcao-real.webp',
  alt: 'Descrição objetiva do ambiente fotografado',
  title: 'Recepção',
  caption: 'Legenda confirmada pela clínica',
  authorized: true
}],
```

Somente itens com arquivo local, texto alternativo, título e `authorized: true` são renderizados no modo real. Caminhos devem começar por `assets/`; extensões aceitas: AVIF, WebP, PNG, JPG/JPEG e SVG. URLs externas e caminhos com `..` são rejeitados. Otimize fotos antes de adicioná-las e preserve a proporção ou forneça um enquadramento adequado ao corte 4:3.

No modo demo, a galeria sempre mantém as ilustrações identificadas como conceituais. No modo real, a seção fica oculta enquanto não houver imagens autorizadas válidas. Sem JavaScript, os links das ilustrações podem ser abertos diretamente.

## Equipe

```js
team: [{
  name: 'Nome confirmado do profissional',
  role: 'Atuação confirmada',
  cro: 'Registro real conferido',
  photo: 'assets/team/retrato-autorizado.webp',
  bio: 'Apresentação aprovada pelo profissional.',
  qualifications: ['Formação confirmada', 'Outra informação confirmada']
}],
```

Nome e registro são obrigatórios. Foto, biografia e formação são opcionais; não são substituídos por pessoas ou qualificações fictícias quando ausentes. Use somente retratos autorizados. O layout enquadra fotos na proporção 1:1,15; nomes, descrições e qualificações são inseridos como texto, sem interpretar HTML. Até oito itens de formação são exibidos. A seção permanece oculta na demonstração.

## Avaliações com fonte

```js
reviews: [{
  author: 'Nome autorizado',
  text: 'Relato cuja publicação foi autorizada.',
  sourceUrl: 'URL HTTPS exata da avaliação original',
  rating: 5,
  date: 'AAAA-MM-DD',
  authorized: true
}],
```

Autor, relato, fonte e autorização são obrigatórios. O link deve usar HTTPS, sem credenciais, e apontar a um dos hosts aceitos: `google.com`, `www.google.com`, `google.com.br`, `www.google.com.br`, `maps.google.com`, `maps.app.goo.gl`, `g.page` ou `share.google`. A lista não aceita domínios apenas semelhantes. Nota deve ser um inteiro de 1 a 5; data deve ser válida no formato ISO. Dados opcionais inválidos são omitidos.

A validação técnica do link não comprova a autenticidade do relato. Confira manualmente que ele leva à publicação correta e que a reprodução foi autorizada. O site não faz scraping, não calcula uma média sem uma base verificada e não carrega widgets. Na demonstração, avaliações reais continuam ocultas mesmo se forem preenchidas acidentalmente.

## Agenda

```js
booking: {
  url: 'URL HTTPS oficial da plataforma escolhida',
  provider: 'Nome do serviço de agendamento'
},
```

Com `demoMode: false` e uma URL HTTPS válida, o formulário apresenta “Ver horários disponíveis”. O botão abre o provedor em uma nova aba, com `noopener noreferrer`. Nenhum nome ou preferência do formulário é acrescentado automaticamente à URL. Links com outro protocolo ou com usuário e senha embutidos são recusados.

Essa é uma integração por encaminhamento, não uma API de disponibilidade dentro do site. Crie e administre a agenda na plataforma escolhida, depois confira o link como visitante. O provedor é responsável por fusos horários, disponibilidade, coleta dos dados e confirmação. Credenciais nunca devem entrar em `config.js`, que é público.

Na demonstração, o link externo é bloqueado. A seleção de data e horário é opcional, fictícia e sem persistência. Mudar a data invalida o horário e qualquer mensagem anterior; limpar o formulário reinicia a simulação. A mensagem identifica a seleção como **SIMULAÇÃO, SEM RESERVA**. O site não apresenta essa seleção como um horário disponível de verdade.

## Compartilhamento

Depois de preparar a mensagem, o formulário oferece **Enviar pelo WhatsApp** e **Copiar mensagem**. Sem número configurado, ou em `demoMode: true`, o botão usa `https://wa.me/?text=...`: o WhatsApp Web ou app apresenta a mensagem pronta e permite escolher o contato. A mensagem só é incluída no link após a preparação válida; alterar ou limpar o formulário remove a URL anterior.

Com `demoMode: false` e um `whatsapp` válido, o mesmo botão abre a conversa com esse número. No modo demo, números institucionais continuam ignorados. O site não confirma entrega nem envia automaticamente. Formato oficial: [clique para conversa do WhatsApp](https://faq.whatsapp.com/5913398998672934/?locale=pt_BR).

`assets/social/aura-preview.png` tem 1200 × 630 pixels e usa a identidade local da Aura. As tags estão diretamente no `index.html`, pois leitores de prévia não precisam executar JavaScript. Em outro domínio ou numa clínica real, revise título, descrição, URL canônica, `og:url`, `og:image` e `twitter:image` no HTML. Alterar somente `config.js` não altera o que um leitor sem JavaScript vê.

Depois de uma publicação autorizada, confirme que a imagem e a página retornam HTTP 200. Aplicativos de mensagens podem manter uma prévia antiga em cache. A revisão local não muda a página atualmente publicada.

## Verificação e publicação

Execute a preparação e os testes descritos no README. Os cenários de equipe, fotos e avaliações usam dados sintéticos apenas no servidor temporário de teste. Os testes verificam renderização como texto, destinos inválidos, isolamento do modo demo, teclado do diálogo, seleção de horário e invalidação da mensagem.

Não execute deploy sem uma solicitação explícita do usuário. Após a revisão local, o envio e a publicação deste conjunto seguem o workflow manual descrito em [PUBLICACAO.md](PUBLICACAO.md).

Referências de implementação: [Open Graph](https://ogp.me/), [elemento dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) e [padrão de disclosure WAI](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
